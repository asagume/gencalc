from contextlib import nullcontext
from decimal import *
import copy
import glob
import json
import os
import os.path
import re
import sys
import io

SRC_PATH = './RawData/data/character/ja-jp'
ORG_PATH = '../public/data/characters'
DST_PATH = '../public/data/characters'
ICON_URL_PATH = 'images/characters'

isCreateOnly = True

os.chdir(os.path.dirname(__file__))

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

templateJson = {
    '名前': None,
    '説明': None,
    'icon_url': None,
    'レアリティ': None,
    '武器': None,
    '元素': None,
    'baseInfo': {
    },
    'region': None,
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

dictionary = {
    'Sword': '片手剣',
    'Claymore': '両手剣',
    'Polearm': '長柄武器',
    'Bow': '弓',
    'Catalyst': '法器',
    'Pyro': '炎',
    'Hydro': '水',
    'Anemo': '風',
    'Electro': '雷',
    'Dendro': '草',
    'Cryo': '氷',
    'Geo': '岩',
    'Base HP': '基礎HP',
    'Base ATK': '基礎攻撃力',
    'Base DEF': '基礎防御力',
    'HP': 'HPパーセンテージ',
    'ATK': '攻撃力パーセンテージ',
    'DEF': '防御力パーセンテージ',
    'Pyro Bonus': '炎元素ダメージ',
    'Hydro Bonus': '水元素ダメージ',
    'Anemo Bonus': '風元素ダメージ',
    'Electro Bonus': '雷元素ダメージ',
    'Dendro Bonus': '草元素ダメージ',
    'Cryo Bonus': '氷元素ダメージ',
    'Geo Bonus': '岩元素ダメージ',
    'Physical Bonus': '物理ダメージ',
    'Pyro DMG Bonus': '炎元素ダメージ',
    'Hydro DMG Bonus': '水元素ダメージ',
    'Anemo DMG Bonus': '風元素ダメージ',
    'Electro DMG Bonus': '雷元素ダメージ',
    'Dendro DMG Bonus': '草元素ダメージ',
    'Cryo DMG Bonus': '氷元素ダメージ',
    'Geo DMG Bonus': '岩元素ダメージ',
    'Physical DMG Bonus': '物理ダメージ',
    'Healing Bonus': '与える治療効果',
}


def t(value):
    if value in dictionary:
        return dictionary[value]
    return value


def normalizeStatName(statName):
    statName = t(statName)
    if statName.endswith('ダメージ') and statName != '会心ダメージ':
        statName = statName + 'バフ'
    else:
        statName = statName.replace('パーセンテージ', '%')
        if statName in ['HP', '攻撃力', '防御力']:
            statName += '%'
    return statName


def normalizeStatValue(value):
    value = value.replace('%', '')
    if value.isdecimal():
        return int(value)
    try:
        return float(value)
    except:
        return value


def normalizeFormulaValue(value):
    value = value.replace(' ', '').replace('×', '*').replace('％', '%')
    value = re.sub('^.*につき', '', value)
    value = re.sub('秒$', '', value)
    value = re.sub('s$', '', value)
    try:
        if value.isdecimal():
            return int(value)
        else:
            return float(value)
    except Exception as ex:
        return value


def suppressNull(d):
    def empty(x):
        # return x is None or x == {} or x == [] or x == ""
        return x is None or x == {} or x == ""

    if not isinstance(d, (dict, list)):
        return d
    elif isinstance(d, list):
        return [v for v in (suppressNull(v) for v in d) if not empty(v)]
    else:
        return {k: v for k, v in ((k, suppressNull(v)) for k, v in d.items()) if not empty(v)}


def normalizeObject(d):
    if type(d) == str:
        while True:
            m = re.search('<custom-ruby data-ruby=\\"(.+?)\\"></custom-ruby>', d)
            if m == None:
                break
            custom_ruby = m.group(0)
            data_ruby = m.group(1)
            data_ruby = re.sub('([^|]+)\|[^|]+\|?', '\\1', data_ruby)
            d = d.replace(custom_ruby, data_ruby)
        d = re.sub('<br>$', '', d.replace('<p>', '').replace('</p>', '<br>')).replace('・', '·').replace('<br>·', '<br>・')
        return d
    if not isinstance(d, (dict, list)):
        return d
    if isinstance(d, list):
        return [v for v in (normalizeObject(v) for v in d)]
    result = {}
    for k, v in d.items():
        result[k] = normalizeObject(v)
    return result


files = glob.glob(SRC_PATH + '/*.json')
for filepath in files:
    with open(filepath, 'r', encoding='utf_8_sig') as f:
        srcJson = json.load(f)
    # print(json.dumps(srcJson, indent=2, ensure_ascii=False))

    filename = os.path.basename(filepath)
    basename, ext = os.path.splitext(filename)

    # if basename.endswith('Traveler'):
    #     continue

    dstFilepath = os.path.join(DST_PATH, filename)
    if os.path.exists(dstFilepath):
        if isCreateOnly:
            continue
        srcStat = os.stat(filepath)
        dstStat = os.stat(dstFilepath)
        # if srcStat.st_mtime < dstStat.st_mtime:
        #     dstFilepath = None

    print(filepath)

    dstJson = copy.deepcopy(templateJson)
    try:
        orgFilepath = os.path.join(ORG_PATH, filename)
        with open(orgFilepath, 'r', encoding='utf_8') as f:
            orgJson = json.load(f)
            for key in orgJson.keys():
                dstJson[key] = orgJson[key]
    except Exception as e:
        None

    dstJson['名前'] = srcJson['name']
    dstJson['説明'] = srcJson['desc']
    dstJson['icon_url'] = ICON_URL_PATH + '/face/' + basename + '.png'
    filter_values = srcJson['filter_values']
    for value in filter_values['character_rarity']['values']:
        dstJson['レアリティ'] = int(value.replace('★', '').replace('-Star', ''))
    for value in filter_values['character_weapon']['values']:
        dstJson['武器'] = t(value)
    for value in filter_values['character_vision']['values']:
        dstJson['元素'] = t(value.replace('元素', ''))
    if 'character_region' in filter_values:
        for value in filter_values['character_region']['values']:
            dstJson['region'] = t(value)

    dstJson['ステータス'] = copy.deepcopy(templateJson['ステータス'])
    # for value in srcJson['filter_values']['character_property']['values']:
    #     characterProperty = normalizeStatName(value)
    #     dstJson['ステータス'][characterProperty] = {}

    for module in srcJson['modules']:
        for component in module['components']:
            # ステータス    baseInfo
            if component['component_id'] == 'baseInfo':
                for entry in component['data']['list']:
                    key = entry['key']
                    if type(entry['value']) == list:
                        value = ','.join(entry['value'])
                    else:
                        value = entry['value']
                    if key == 'オリジナル料理':
                        m = re.match('.*\\"name\\":\\"(.+?)\\".*', value)
                        if m != None:
                            value = m.group(1)
                    dstJson['baseInfo'][entry['key']] = value

            # 突破          ascension
            elif component['component_id'] == 'ascension':
                # 突破
                for entry in component['data']['list']:
                    level = str.strip(entry['key'].replace('Lv.', ''))
                    for combat in entry['combatList']:
                        if combat['key'] == '':
                            continue
                        key = normalizeStatName(combat['key'])
                        if not key in dstJson['ステータス']:
                            dstJson['ステータス'][key] = {}
                        if type(combat['values']) is list:
                            value = combat['values'][0]
                            if value != '-':
                                value = normalizeStatValue(value)
                                dstJson['ステータス'][key][level] = value
                            value = combat['values'][1]
                            if value != '-':
                                value = normalizeStatValue(value)
                                dstJson['ステータス'][key][level + '+'] = value

            # 天賦          talent
            elif component['component_id'] == 'talent':
                # 天賦
                for index, entry in enumerate(component['data']['list']):
                    # 通常攻撃
                    if index == 0:
                        category = '通常攻撃'
                        for attribute in entry['attributes']:
                            if attribute['key'] == 'Level' or attribute['key'] == '':
                                continue
                            if attribute['key'] == '重撃ダメージ' or attribute['key'].find('狙い撃ち') != -1:
                                category = '重撃'
                            elif attribute['key'].startswith('落下期間のダメージ'):
                                category = '落下攻撃'
                            talentJson = dstJson[category]
                            if category == '通常攻撃':
                                talentJson['名前'] = entry['title']
                                talentJson['説明'] = entry['desc']
                                iconFilename = entry['icon_url'].split(
                                    '/')[len(entry['icon_url'].split('/')) - 1]
                                talentJson['icon_url'] = ICON_URL_PATH + \
                                    '/' + basename + '/' + iconFilename
                            if '詳細' not in talentJson:
                                talentJson['詳細'] = []
                            if attribute['key'].endswith('スタミナ消費') or attribute['key'].endswith('継続時間'):
                                for value in attribute['values']:
                                    value = normalizeFormulaValue(value)
                                    talentJson[attribute['key']] = value
                                continue
                            elif attribute['key'] == '低空/高空落下攻撃ダメージ':
                                detailName1 = attribute['key']
                                detailJson1 = {
                                    '名前': detailName1,
                                    '数値': {}
                                }
                                talentJson['詳細'].append(detailJson1)
                                detailName2 = attribute['key']
                                detailJson2 = None
                                detailJson2 = {
                                    '名前': detailName2,
                                    '数値': {}
                                }
                                talentJson['詳細'].append(detailJson2)
                                for index2, item in enumerate(attribute['values']):
                                    splitted = item.split('/')
                                    newValue1 = normalizeFormulaValue(
                                        splitted[0])
                                    newValue2 = normalizeFormulaValue(
                                        splitted[1])
                                    detailJson1['数値'][str(
                                        index2 + 1)] = newValue1
                                    detailJson2['数値'][str(
                                        index2 + 1)] = newValue2
                                continue
                            detailName = attribute['key']
                            detailJson = None
                            for workJson in talentJson['詳細']:
                                if detailName == workJson['名前']:
                                    detailJson = workJson
                                    break
                            if detailJson is None:
                                detailJson = {
                                    '名前': detailName,
                                    '数値': {}
                                }
                                talentJson['詳細'].append(detailJson)
                            if type(attribute['values']) != list or len(attribute['values']) == 0:
                                continue
                            level = 0
                            hitCount = 1
                            for index, item in enumerate(attribute['values']):
                                if item.find('♂') != -1:
                                    item = re.search('♂:\s*([^♀]+)', item)[1]
                                newValue = normalizeFormulaValue(item)
                                detailJson['数値'][str(index + 1)] = newValue
                                if str(newValue).find('*') != -1:
                                    splitted = str(newValue).split('*')
                                    hitCount = normalizeFormulaValue(
                                        splitted[len(splitted) - 1])
                                elif str(newValue).find('+') != -1:
                                    hitCount = item.count('+') + 1
                            if hitCount > 1:
                                detailJson['HIT数'] = hitCount
                            if dstJson['武器'] == '弓':
                                if talentJson == dstJson['重撃'] and not detailJson['名前'].startswith('狙い撃ち'):
                                    detailJson['元素'] = dstJson['元素']

                    # 固有天賦
                    elif entry['attributes'] is None or entry['attributes'] == []:
                        talentName = normalizeObject(entry['title'])   
                        talentJson = None
                        for workJson in dstJson['固有天賦']:
                            if talentName == workJson['名前']:
                                talentJson = workJson
                                break
                        if talentJson is None:
                            talentJson = {
                                '名前': talentName,
                                '説明': None,
                                'icon_url': None,
                                '詳細': []
                            }
                            dstJson['固有天賦'].append(talentJson)
                        talentJson['名前'] = entry['title']
                        talentJson['説明'] = entry['desc']
                        iconFilename = entry['icon_url'].split(
                            '/')[len(entry['icon_url'].split('/')) - 1]
                        talentJson['icon_url'] = ICON_URL_PATH + \
                            '/' + basename + '/' + iconFilename

                        # その他戦闘天賦
                    elif len(entry['attributes'][0]['values']) < 2:
                        if dstJson['その他戦闘天賦'] is None:
                            dstJson['その他戦闘天賦'] = []
                        talentName = normalizeObject(entry['title'])   
                        talentJson = None
                        for workJson in dstJson['その他戦闘天賦']:
                            if talentName == workJson['名前']:
                                talentJson = workJson
                                break
                        if talentJson is None:
                            talentJson = {
                                '名前': talentName,
                                '説明': None,
                                'icon_url': None,
                                '詳細': []
                            }
                            dstJson['その他戦闘天賦'].append(talentJson)
                        talentJson['名前'] = entry['title']
                        talentJson['説明'] = entry['desc']
                        iconFilename = entry['icon_url'].split(
                            '/')[len(entry['icon_url'].split('/')) - 1]
                        talentJson['icon_url'] = ICON_URL_PATH + \
                            '/' + basename + '/' + iconFilename

                    else:
                        if category == '元素スキル':
                            category = '元素爆発'
                        else:
                            category = '元素スキル'
                        talentJson = dstJson[category]
                        talentJson['名前'] = entry['title']
                        talentJson['説明'] = entry['desc']
                        iconFilename = entry['icon_url'].split(
                            '/')[len(entry['icon_url'].split('/')) - 1]
                        talentJson['icon_url'] = ICON_URL_PATH + \
                            '/' + basename + '/' + iconFilename
                        if '詳細' not in talentJson:
                            talentJson['詳細'] = []
                        else:
                            continue
                        for attribute in entry['attributes']:
                            if attribute['key'] == 'Level' or attribute['key'] == '':
                                continue
                            if attribute['key'].endswith('クールタイム') or attribute['key'].endswith('継続時間') or attribute['key'].endswith('元素エネルギー'):
                                for value in attribute['values']:
                                    talentJson[attribute['key']
                                               ] = normalizeFormulaValue(value)
                                continue
                            detailName = attribute['key']
                            detailJson = None
                            for workJson in talentJson['詳細']:
                                if '名前' in workJson and detailName == workJson['名前']:
                                    detailJson = workJson
                                    break
                            if detailJson is None:
                                detailJson = {
                                    '名前': detailName,
                                    '種類': None,
                                    '数値': {}
                                }
                                talentJson['詳細'].append(detailJson)
                            detailJson['数値'] = {}
                            level = 0
                            hitCount = 1
                            for index, item in enumerate(attribute['values']):
                                newValue = normalizeFormulaValue(item)
                                detailJson['数値'][str(index + 1)] = newValue
                                if str(newValue).find('*') != -1:
                                    splitted = str(newValue).split('*')
                                    hitCount = normalizeFormulaValue(
                                        splitted[len(splitted) - 1])
                                elif str(newValue).find('+') != -1:
                                    hitCount = item.count('+') + 1
                                if attribute['key'].find('回復量') != -1:
                                    detailJson['種類'] = 'HP回復'
                                elif attribute['key'].find('吸収量') != -1:
                                    detailJson['種類'] = 'シールド'
                                elif attribute['key'].find('HP継承') != -1:
                                    detailJson['種類'] = 'HP継承'
                                elif hitCount > 1:
                                    detailJson['HIT数'] = hitCount

            elif (module['name'] == '命ノ星座' or module['name'] == 'Constellation') and component['component_id'] == 'summaryList':
                # 命ノ星座
                constellation = 0
                for entry in component['data']['list']:
                    constellation += 1
                    if str(constellation) not in dstJson['命ノ星座']:
                        dstJson['命ノ星座'][str(constellation)] = {}
                    constellationJson = dstJson['命ノ星座'][str(constellation)]
                    constellationJson['名前'] = entry['name']
                    constellationJson['説明'] = entry['desc']
                    iconFilename = entry['icon_url'].split(
                        '/')[len(entry['icon_url'].split('/')) - 1]
                    constellationJson['icon_url'] = ICON_URL_PATH + \
                        '/' + basename + '/' + iconFilename
                    if '詳細' not in constellationJson:
                        constellationJson['詳細'] = []

    dstJson = suppressNull(dstJson)
    dstJson = normalizeObject(dstJson)

    # print(json.dumps(dstJson, ensure_ascii=False, indent=2))

    if dstFilepath is not None:
        os.makedirs(os.path.dirname(dstFilepath), exist_ok=True)
        with open(dstFilepath, 'w', encoding='utf_8') as f:
            json.dump(dstJson, f, indent=4, ensure_ascii=False)
