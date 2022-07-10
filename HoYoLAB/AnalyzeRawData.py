from contextlib import nullcontext
from decimal import *
import glob
import json
import os.path
import re

SOURCE_PATH = './RawData'
FILTER = '[24]_*.json'
OUTPUT_PATH = './JsonData'
GENCALC_PATH = '../GencalcData'
GENCALC_ORIG_PATH = '../data/characters'

VISION_MAP = {
    '炎': 'pyro',
    '水': 'hydro',
    '風': 'anemo',
    '雷': 'electro',
    '草': 'dendro',
    '氷': 'cryo',
    '岩': 'geo'
}

WEAPON_MAP = {
    '片手剣': 'sword',
    '両手剣': 'claymore',
    '長柄武器': 'polearm',
    '弓': 'bow',
    '法器': 'catalyst'
}


def formatValue(value):
    value = value.replace(' ', '').replace('×', '*')
    value = re.sub('^.*につき', '', value)
    value = re.sub('秒$', '', value)
    if value.isdecimal():
        return int(value)
    try:
        return float(value)
    except:
        return value

createNew = True

files = glob.glob(SOURCE_PATH + "/" + FILTER)
for filepath in files:
    print(filepath)

    with open(filepath, 'r', encoding='utf_8_sig') as f:
        jsonContent = json.load(f)

    for module in jsonContent['page']['modules']:
        for component in module['components']:
            data = re.sub('\\"', '"', component['data'])
            dataJson = json.loads(data)
            component['data'] = dataJson

#    print(json.dumps(jsonContent, indent=4, ensure_ascii=False))

    name = jsonContent['page']['name']
    if jsonContent['page']['menu_id'] == '2':
        if ('character_vision' in jsonContent['page']['filter_values']):
            for e in jsonContent['page']['filter_values']['character_vision']['values']:
                vision = e.replace('元素', '')
        else:
            vision = '無'
        for e in jsonContent['page']['filter_values']['character_rarity']['values']:
            rarity = e
        for e in jsonContent['page']['filter_values']['character_weapon']['values']:
            weapon = e
        outputFilename = vision + '_' + rarity + '_' + weapon + '_' + name
    if jsonContent['page']['menu_id'] == '4':
        for e in jsonContent['page']['filter_values']['weapon_type']['values']:
            type = e
        for e in jsonContent['page']['filter_values']['weapon_rarity']['values']:
            rarity = e
        outputFilename = type + '_' + rarity + '_' + name
    outputFilename += '.json'

    outputPath = os.path.join(OUTPUT_PATH, outputFilename)
    with open(outputPath, 'w', encoding='utf_8') as f:
        json.dump(jsonContent, f, indent=4, ensure_ascii=False)

    if jsonContent['page']['menu_id'] == '2':
        if vision == '無':
            continue
        splitted = jsonContent['page']['icon_url'].split('/')
        gencalcFilename = VISION_MAP[vision] + '_' + rarity.replace(
            '★', '') + '_' + WEAPON_MAP[weapon] + '_' + re.sub('_icon\..*$', '', splitted[len(splitted) - 1]) + '.json'
        gencalcFilename = re.sub('\s+', '', gencalcFilename)
        gencalcJson = {
            '名前': name,
            '説明': jsonContent['page']['desc'],
            'レアリティ': int(rarity.replace('★', '')),
            '武器': weapon,
            '元素': vision,
            'baseInfo': {
                '名前': None,
                '誕生日': None,
                '命ノ星座': None,
                '称号': None,
                '神の目': None,
                '所属': None,
                '中国語 CV': [],
                '英語 CV': [],
                '日本語 CV': [],
                '韓国語 CV': []
            },
            'ステータス': {
                '基礎HP': {},
                '基礎攻撃力': {},
                '基礎防御力': {}
            },
            '固有変数': None,
            'オプション初期値': None,
            '通常攻撃': {},
            '重撃': {},
            '落下攻撃': {},
            '元素スキル': {},
            '元素爆発': {},
            '特殊通常攻撃': None,
            '特殊重撃': None,
            '特殊落下攻撃': None,
            '元素スキル': {},
            'その他戦闘天賦': None,
            '固有天賦': [],
            '命ノ星座': {},
            'おすすめセット': []
        }
        for module in jsonContent['page']['modules']:
            #
            if module['name'] == 'ステータス':
                for component in module['components']:
                    if component['component_id'] != 'baseInfo':
                        continue
                    for entry in component['data']['list']:
                        if entry['key'] in ['名前', '誕生日', '命ノ星座', '称号', '神の目', '所属', '中国語 CV', '英語 CV', '日本語 CV', '韓国語 CV']:
                            gencalcJson['baseInfo'][entry['key']
                                                    ] = ','.join(entry['value'])

            # ステータス 基礎HP、基礎攻撃力、基礎防御力、突破ステータス
            if module['name'] == '突破':
                for component in module['components']:
                    if component['component_id'] != 'ascension':
                        continue
                    for entry in component['data']['list']:
                        key = entry['key'].replace('Lv.', '')
                        for compat in entry['combatList']:
                            if compat['key'] == '':
                                continue
                            statusKey = compat['key']
                            if compat['values'][0] != '-':
                                statusValue = compat['values'][0]
                                if statusValue.endswith('%'):
                                    if statusKey in ['HP', '攻撃力', '防御力']:
                                        statusKey += '%'
                                    statusValue = statusValue.replace('%', '')
                                if statusKey.endswith('元素ダメージ') or statusKey.endswith('物理ダメージ'):
                                    statusKey = statusKey + 'バフ'
                                if statusKey not in gencalcJson['ステータス']:
                                    gencalcJson['ステータス'][statusKey] = {}
                                gencalcJson['ステータス'][statusKey][key] = formatValue(
                                    statusValue)
                            statusKey = compat['key']
                            if compat['values'][1] != '-':
                                statusValue = compat['values'][1]
                                if statusValue.endswith('%'):
                                    if statusKey in ['HP', '攻撃力', '防御力']:
                                        statusKey += '%'
                                    statusValue = statusValue.replace('%', '')
                                if statusKey.endswith('元素ダメージ') or statusKey.endswith('物理ダメージ'):
                                    statusKey = statusKey + 'バフ'
                                if statusKey not in gencalcJson['ステータス']:
                                    gencalcJson['ステータス'][statusKey] = {}
                                gencalcJson['ステータス'][statusKey][key +
                                                                    '+'] = formatValue(statusValue)

            elif module['name'] == '天賦' and createNew:
                for component in module['components']:
                    if component['component_id'] != 'talent':
                        continue
                    # 戦闘天賦 通常攻撃
                    targetJson = gencalcJson['通常攻撃']
                    entry = component['data']['list'][0]
                    key = entry['key']
                    targetJson['名前'] = entry['title']
                    targetJson['説明'] = entry['desc']
                    for attribute in entry['attributes']:
                        if attribute['key'] == 'Level':
                            continue
                        myName = attribute['key']
                        if myName.endswith('重撃ダメージ') or myName.find('狙い撃ち') != -1:
                            targetJson = gencalcJson['重撃']
                        if myName == '落下期間のダメージ':
                            targetJson = gencalcJson['落下攻撃']
                        if myName.endswith('重撃スタミナ消費') or myName.endswith('継続時間'):
                            targetJson[myName] = formatValue(
                                attribute['values'][0])
                            continue
                        if '詳細' not in targetJson:
                            targetJson['詳細'] = []
                        if myName == '低空/高空落下攻撃ダメージ':
                            targetObj1 = {
                                '名前': '低空落下攻撃ダメージ',
                                '数値': {}
                            }
                            targetObj2 = {
                                '名前': '高空落下攻撃ダメージ',
                                '数値': {}
                            }
                            for index, item in enumerate(attribute['values']):
                                splitted = item.split('/')
                                newValue1 = formatValue(splitted[0])
                                newValue2 = formatValue(splitted[1])
                                targetObj1['数値'][str(index + 1)] = newValue1
                                targetObj2['数値'][str(index + 1)] = newValue2
                            targetJson['詳細'].append(targetObj1)
                            targetJson['詳細'].append(targetObj2)
                            continue
                        targetObj = {
                            '名前': myName,
                            '数値': {}
                        }
                        hitCount = 1
                        for index, item in enumerate(attribute['values']):
                            newValue = formatValue(item)
                            targetObj['数値'][str(index + 1)] = newValue
                            if str(newValue).find('*') != -1:
                                splitted = str(newValue).split('*')
                                hitCount = formatValue(
                                    splitted[len(splitted) - 1])
                            elif str(newValue).find('+') != -1:
                                hitCount = item.count('+') + 1
                        if hitCount > 1:
                            targetObj['HIT数'] = hitCount
                        targetJson['詳細'].append(targetObj)

                    for talentIndex in range(1, len(component['data']['list'])):
                        entry = component['data']['list'][talentIndex]
                        if entry['attributes'] is None:
                            # 固有天賦
                            targetJson = gencalcJson['固有天賦']
                            key = entry['key']
                            targetObj = {
                                '名前':  entry['title'],
                                '説明': entry['desc']
                            }
                            targetJson.append(targetObj)
                        elif len(entry['attributes'][0]['values']) < 10:
                            # その他戦闘天賦
                            gencalcJson['その他戦闘天賦'] = {}
                            targetJson = gencalcJson['その他戦闘天賦']
                            key = entry['key']
                            targetJson['名前'] = entry['title']
                            targetJson['説明'] = entry['desc']
                            for attribute in entry['attributes']:
                                if attribute['key'] == 'Level':
                                    continue
                                targetJson[attribute['key']] = formatValue(
                                    attribute['values'][0])
                        else:
                            # 戦闘天賦・元素スキル、元素爆発
                            if gencalcJson['元素スキル'] == {}:
                                targetJson = gencalcJson['元素スキル']
                            else:
                                targetJson = gencalcJson['元素爆発']
                            key = entry['key']
                            targetJson['名前'] = entry['title']
                            targetJson['説明'] = entry['desc']
                            for attribute in entry['attributes']:
                                if attribute['key'] == 'Level':
                                    continue
                                if attribute['key'].endswith('継続時間') or attribute['key'].endswith('クールタイム') or attribute['key'].endswith('元素エネルギー'):
                                    targetJson[attribute['key']
                                               ] = formatValue(attribute['values'][0])
                                    continue
                                if attribute['key'].endswith('重撃スタミナ消費'):
                                    targetJson[attribute['key']] = formatValue(
                                        attribute['values'][0])
                                    continue
                                if '詳細' not in targetJson:
                                    targetJson['詳細'] = []
                                targetObj = {
                                    '名前': attribute['key'],
                                    '数値': {}
                                }
                                hitCount = 1
                                for index, item in enumerate(attribute['values']):
                                    newValue = formatValue(item)
                                    targetObj['数値'][str(index + 1)] = newValue
                                    if str(newValue).find('*') != -1:
                                        splitted = str(newValue).split('*')
                                        hitCount = formatValue(
                                            splitted[len(splitted) - 1])
                                    elif str(newValue).find('+') != -1:
                                        hitCount = item.count('+') + 1
                                if attribute['key'].find('回復量') != -1:
                                    targetObj['種類'] = 'HP回復'
                                elif attribute['key'].find('吸収量') != -1:
                                    targetObj['種類'] = 'シールド吸収量'
                                elif attribute['key'].find('HP継承') != -1:
                                    targetObj['種類'] = 'HP継承'
                                elif hitCount > 1:
                                    targetObj['HIT数'] = hitCount
                                targetJson['詳細'].append(targetObj)

            elif module['name'] == '命ノ星座' and createNew:
                index = 1
                for component in module['components']:
                    if component['component_id'] != 'summaryList':
                        continue
                    targetJson = gencalcJson['命ノ星座']
                    for index in range(len(component['data']['list'])):
                        entry = component['data']['list'][index]
                        index += 1
                        targetJson[str(index)] = {
                            '名前': entry['name'],
                            '説明': entry['desc']
                        }

#        print(gencalcFilename)
#        print(json.dumps(gencalcJson, indent=4, ensure_ascii=False))

        gencalcOrigPath = os.path.join(GENCALC_ORIG_PATH, gencalcFilename)
        try:
            with open(gencalcOrigPath, 'r', encoding='utf_8') as f:
                gencalcOrigJson = json.load(f)
        except Exception as e:
            gencalcOrigJson = gencalcJson

        for param in ['固有変数', 'オプション初期値', '特殊通常攻撃', '特殊重撃', '特殊落下攻撃', 'おすすめセット']:
            if param in gencalcOrigJson:
                gencalcJson[param] = gencalcOrigJson[param]
        for param in ['通常攻撃', '重撃', '落下攻撃', '元素スキル', '元素爆発', '固有天賦', 'その他戦闘天賦', '命ノ星座']:
            if param in gencalcOrigJson:
                gencalcJson[param] = gencalcOrigJson[param]

        detailValueDict = {}
        for param in ['通常攻撃', '重撃', '落下攻撃', '元素スキル', '元素爆発']:
            if '詳細' not in gencalcJson[param]:
                continue
            for detailObj in gencalcJson[param]['詳細']:
                if '名前' in detailObj and '数値' in detailObj:
                    detailValueDict[param + '#' + detailObj['名前']] = detailObj['数値']

        for param in ['通常攻撃', '重撃', '落下攻撃', '元素スキル', '元素爆発']:
            if param in gencalcOrigJson and createNew:
                tempObj = gencalcOrigJson[param]
                if '名前' in gencalcJson[param]:
                    tempObj['名前'] = gencalcJson[param]['名前']
                if '説明' in gencalcJson[param]:
                    tempObj['説明'] = gencalcJson[param]['説明']
                if '詳細' in tempObj:
                    for detailObj in tempObj['詳細']:
                        if '名前' not in detailObj or '数値' not in detailObj:
                            continue
                        if (param + '#' + detailObj['名前']) in detailValueDict:
                            detailObj['数値'] = detailValueDict[param + '#' + detailObj['名前']]
                gencalcJson[param] = tempObj

        for param in ['その他戦闘天賦', '固有天賦']:
            if param in gencalcOrigJson and createNew:
                tempObj = []
                    



        if gencalcJson['固有変数'] is None:
            del gencalcJson['固有変数']
        if gencalcJson['オプション初期値'] is None:
            del gencalcJson['オプション初期値']
        if gencalcJson['特殊通常攻撃'] is None:
            del gencalcJson['特殊通常攻撃']
        if gencalcJson['特殊重撃'] is None:
            del gencalcJson['特殊重撃']
        if gencalcJson['特殊落下攻撃'] is None:
            del gencalcJson['特殊落下攻撃']
        if gencalcJson['その他戦闘天賦'] is None:
            del gencalcJson['その他戦闘天賦']

        outputPath = os.path.join(GENCALC_PATH, gencalcFilename)
        with open(outputPath, 'w', encoding='utf_8') as f:
            json.dump(gencalcJson, f, indent=4, ensure_ascii=False)
