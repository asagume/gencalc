from contextlib import nullcontext
from decimal import *
import copy
import glob
import json
import os
import os.path
import re

SRC_PATH = './RawData/data/character/ja-jp'
ORG_PATH = '../public/data/characters'
DST_PATH = '../public/data/characters'
ICON_URL_PATH = 'images/characters'

os.chdir(os.path.dirname(__file__))
print(os.getcwd())

templateJson = {
    '名前': None,
    '説明': None,
    'icon_url': None,
    'レアリティ': None,
    '武器': None,
    '元素': None,
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


def normalizeStatName(statName):
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
    value = value.replace(' ', '').replace('×', '*')
    value = re.sub('^.*につき', '', value)
    value = re.sub('秒$', '', value)
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


files = glob.glob(SRC_PATH + '/*.json')
for filepath in files:
    print(filepath)

    with open(filepath, 'r', encoding='utf_8_sig') as f:
        srcJson = json.load(f)
    # print(json.dumps(srcJson, indent=2, ensure_ascii=False))

    filename = os.path.basename(filepath)
    basename, ext = os.path.splitext(filename)

    # if basename.endswith('Traveler'):
    #     continue

    dstFilepath = os.path.join(DST_PATH, filename)
    if os.path.exists(dstFilepath):
        srcStat = os.stat(filepath)
        dstStat = os.stat(dstFilepath)
        # if srcStat.st_mtime < dstStat.st_mtime:
        #     dstFilepath = None

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
    for value in srcJson['filter_values']['character_rarity']['values']:
        dstJson['レアリティ'] = int(value.replace('★', ''))
    for value in srcJson['filter_values']['character_weapon']['values']:
        dstJson['武器'] = value
    for value in srcJson['filter_values']['character_vision']['values']:
        dstJson['元素'] = value.replace('元素', '')

    dstJson['ステータス'] = copy.deepcopy(templateJson['ステータス'])
    for value in srcJson['filter_values']['character_property']['values']:
        characterProperty = normalizeStatName(value)
        dstJson['ステータス'][characterProperty] = {}

    for module in srcJson['modules']:
        for component in module['components']:
            if module['name'] == 'ステータス' and component['component_id'] == 'baseInfo':
                for entry in component['data']['list']:
                    dstJson['baseInfo'][entry['key']
                                        ] = ','.join(entry['value'])

            elif module['name'] == '突破' and component['component_id'] == 'ascension':
                # 突破
                for entry in component['data']['list']:
                    level = entry['key'].replace('Lv.', '')
                    for combat in entry['combatList']:
                        if combat['key'] == '':
                            continue
                        statName = normalizeStatName(combat['key'])
                        statValue = combat['values'][0]
                        if statValue != '-':
                            dstJson['ステータス'][statName][level] = normalizeStatValue(
                                statValue)
                        statValue = combat['values'][1]
                        if statValue != '-':
                            dstJson['ステータス'][statName][level + '+'] = normalizeStatValue(
                                statValue)

            elif module['name'] == '天賦' and component['component_id'] == 'talent':
                # 天賦
                for talentIndex, entry in enumerate(component['data']['list']):
                    if talentIndex == 0:
                        # 通常攻撃
                        talentKind = '通常攻撃'
                        for attribute in entry['attributes']:
                            if attribute['key'] == '重撃ダメージ' or attribute['key'].find('狙い撃ち') != -1:
                                talentKind = '重撃'
                            elif attribute['key'].startswith('落下期間のダメージ'):
                                talentKind = '落下攻撃'
                            talentJson = dstJson[talentKind]
                            if talentKind == '通常攻撃':
                                talentJson['名前'] = entry['title']
                                talentJson['説明'] = entry['desc']
                                iconFilename = entry['icon_url'].split(
                                    '/')[len(entry['icon_url'].split('/')) - 1]
                                talentJson['icon_url'] = ICON_URL_PATH + \
                                    '/' + basename + '/' + iconFilename
                            if attribute['key'] == 'Level':
                                continue
                            if '詳細' not in talentJson:
                                talentJson['詳細'] = []
                            else:
                                continue
                            if attribute['key'].endswith('スタミナ消費') or attribute['key'].endswith('継続時間'):
                                for value in attribute['values']:
                                    talentJson[attribute['key']
                                               ] = normalizeFormulaValue(value)
                                continue
                            elif attribute['key'] == '低空/高空落下攻撃ダメージ':
                                detailName1 = '低空落下攻撃ダメージ'
                                detailJson1 = None
                                for workJson in talentJson['詳細']:
                                    if detailName1 == workJson['名前']:
                                        detailJson1 = workJson
                                        break
                                if detailJson1 is None:
                                    detailJson1 = {
                                        '名前': detailName1,
                                        '数値': {}
                                    }
                                    talentJson['詳細'].append(detailJson1)
                                detailName2 = '高空落下攻撃ダメージ'
                                detailJson2 = None
                                for workJson in talentJson['詳細']:
                                    if detailName2 == workJson['名前']:
                                        detailJson2 = workJson
                                        break
                                if detailJson2 is None:
                                    detailJson2 = {
                                        '名前': detailName2,
                                        '数値': {}
                                    }
                                    talentJson['詳細'].append(detailJson2)
                                for index, item in enumerate(attribute['values']):
                                    splitted = item.split('/')
                                    newValue1 = normalizeFormulaValue(
                                        splitted[0])
                                    newValue2 = normalizeFormulaValue(
                                        splitted[1])
                                    detailJson1['数値'][str(
                                        index + 1)] = newValue1
                                    detailJson2['数値'][str(
                                        index + 1)] = newValue2
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
                            level = 0
                            for value in attribute['values']:
                                hitCount = 1
                                for index, item in enumerate(attribute['values']):
                                    if item.find('♂') != -1:
                                        item = re.match('♂:\s*(.+)\<', item)[1]
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

                    elif entry['attributes'] is None:
                        talentName = entry['title']
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

                    elif len(entry['attributes'][0]['values']) < 10:
                        # その他戦闘天賦
                        if dstJson['その他戦闘天賦'] is None:
                            dstJson['その他戦闘天賦'] = []
                        talentName = entry['title']
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
                        if talentKind == '元素スキル':
                            talentKind = '元素爆発'
                        else:
                            talentKind = '元素スキル'
                        talentJson = dstJson[talentKind]
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
                            if attribute['key'] == 'Level':
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
                                    detailJson['種類'] = 'シールド吸収量'
                                elif attribute['key'].find('HP継承') != -1:
                                    detailJson['種類'] = 'HP継承'
                                elif hitCount > 1:
                                    detailJson['HIT数'] = hitCount

            elif module['name'] == '命ノ星座' and component['component_id'] == 'summaryList':
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

    # print(json.dumps(dstJson, ensure_ascii=False, indent=2))

    if dstFilepath is not None:
        os.makedirs(os.path.dirname(dstFilepath), exist_ok=True)
        with open(dstFilepath, 'w', encoding='utf_8') as f:
            json.dump(dstJson, f, indent=4, ensure_ascii=False)
