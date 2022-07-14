from contextlib import nullcontext
from decimal import *
import copy
import glob
import json
import os.path
import re

SRC_PATH = 'RawData/data/weapons'
DST_PATH = '../data/weapons'

templateJson = {
    '名前': None,
    '説明': None,
    'レアリティ': None,
    '種類': None,
    'ステータス': {
        '基礎攻撃力': {}
    },
    '武器スキル': {}
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

    dstFilePath = os.path.join(DST_PATH, filename)

    dstJson = copy.deepcopy(templateJson)
    # try:
    #     with open(dstFilePath, 'r', encoding='utf_8') as f:
    #         orgJson = json.load(f)
    #         for param in ['固有変数', 'オプション初期値', '特殊通常攻撃', '特殊重撃', '特殊落下攻撃', 'おすすめセット']:
    #             if param in orgJson:
    #                 dstJson[param] = orgJson[param]
    #         for param in ['通常攻撃', '重撃', '落下攻撃', '元素スキル', '元素爆発', '固有天賦', 'その他戦闘天賦', '命ノ星座']:
    #             if param in orgJson:
    #                 dstJson[param] = orgJson[param]
    # except Exception as e:
    #     None

    dstJson['名前'] = srcJson['name']
    dstJson['説明'] = srcJson['desc']
    for value in srcJson['filter_values']['character_rarity']['values']:
        dstJson['レアリティ'] = int(value.replace('★', ''))
    for value in srcJson['filter_values']['character_weapon']['values']:
        dstJson['種類'] = value

    dstJson['ステータス'] = copy.deepcopy(templateJson['ステータス'])
    for value in srcJson['filter_values']['character_property']['values']:
        dstJson['ステータス'][value] = {}

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
                        statName = combat['key']
                        statValue = combat['values'][0]
                        if statValue != '-':
                            if statValue.endswith('%'):
                                if statName in ['HP', '攻撃力', '防御力']:
                                    statName += '%'
                                statValue = statValue.replace('%', '')
                            if statName.endswith('ダメージ'):
                                statName += 'バフ'
                            dstJson['ステータス'][statName][level] = formatValue(
                                statValue)
                        statValue = combat['values'][1]
                        if statValue != '-':
                            if statValue.endswith('%'):
                                if statName in ['HP', '攻撃力', '防御力']:
                                    statName += '%'
                                statValue = statValue.replace('%', '')
                            if statName.endswith('ダメージ'):
                                statName += 'バフ'
                            dstJson['ステータス'][statName][level + '+'] = formatValue(
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
                            if attribute['key'] == 'Level':
                                continue
                            if '詳細' not in talentJson:
                                talentJson['詳細'] = []
                            if attribute['key'].endswith('スタミナ消費') or attribute['key'].endswith('継続時間'):
                                for value in attribute['values']:
                                    talentJson[attribute['key']
                                               ] = formatValue(value)
                                continue
                            elif attribute['key'] == '低空/高空落下攻撃ダメージ':
                                detailJson1 = {
                                    '名前': '低空落下攻撃ダメージ',
                                    '数値': {}
                                }
                                detailJson2 = {
                                    '名前': '高空落下攻撃ダメージ',
                                    '数値': {}
                                }
                                for index, item in enumerate(attribute['values']):
                                    splitted = item.split('/')
                                    newValue1 = formatValue(splitted[0])
                                    newValue2 = formatValue(splitted[1])
                                    detailJson1['数値'][str(
                                        index + 1)] = newValue1
                                    detailJson2['数値'][str(
                                        index + 1)] = newValue2
                                talentJson['詳細'].append(detailJson1)
                                talentJson['詳細'].append(detailJson2)
                                continue
                            detailJson = {
                                '名前': attribute['key'],
                                '数値': {}
                            }
                            level = 0
                            for value in attribute['values']:
                                hitCount = 1
                                for index, item in enumerate(attribute['values']):
                                    newValue = formatValue(item)
                                    detailJson['数値'][str(index + 1)] = newValue
                                    if str(newValue).find('*') != -1:
                                        splitted = str(newValue).split('*')
                                        hitCount = formatValue(
                                            splitted[len(splitted) - 1])
                                    elif str(newValue).find('+') != -1:
                                        hitCount = item.count('+') + 1
                                if hitCount > 1:
                                    detailJson['HIT数'] = hitCount
                            if dstJson['武器'] == '弓':
                                if talentJson == dstJson['重撃'] and not detailJson['名前'].startswith('狙い撃ち'):
                                    talentJson['元素'] = dstJson['元素']
                            talentJson['詳細'].append(detailJson)

                    elif entry['attributes'] is None:
                        dstJson['固有天賦'].append({
                            '名前': entry['title'],
                            '説明': entry['desc'],
                            '詳細': []
                        })

                    elif len(entry['attributes'][0]['values']) < 10:
                        # その他戦闘天賦
                        if dstJson['その他戦闘天賦'] is None:
                            dstJson['その他戦闘天賦'] = []
                        talentJson = {
                            '名前': entry['title'],
                            '説明': entry['desc'],
                            '詳細': []
                        }
                        dstJson['その他戦闘天賦'].append(talentJson)

                    else:
                        if talentKind == '元素スキル':
                            talentKind = '元素爆発'
                        else:
                            talentKind = '元素スキル'
                        talentJson = dstJson[talentKind]
                        talentJson['名前'] = entry['title']
                        talentJson['説明'] = entry['desc']
                        if '詳細' not in talentJson:
                            talentJson['詳細'] = []
                        for attribute in entry['attributes']:
                            if attribute['key'] == 'Level':
                                continue
                            if attribute['key'].endswith('クールタイム') or attribute['key'].endswith('継続時間') or attribute['key'].endswith('元素エネルギー'):
                                for value in attribute['values']:
                                    talentJson[attribute['key']
                                               ] = formatValue(value)
                                continue
                            detailJson = {
                                '名前': attribute['key'],
                                '種類': None,
                                '数値': {}
                            }
                            level = 0
                            for value in attribute['values']:
                                hitCount = 1
                                for index, item in enumerate(attribute['values']):
                                    newValue = formatValue(item)
                                    detailJson['数値'][str(index + 1)] = newValue
                                    if str(newValue).find('*') != -1:
                                        splitted = str(newValue).split('*')
                                        hitCount = formatValue(
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
                            talentJson['詳細'].append(detailJson)

            elif module['name'] == '命ノ星座' and component['component_id'] == 'summaryList':
                # 命ノ星座
                constellation = 0
                for entry in component['data']['list']:
                    constellation += 1
                    dstJson['命ノ星座'][constellation] = {
                        '名前': entry['name'],
                        '説明': entry['desc'],
                        '詳細': []
                    }

                print(component)

    dstJson = suppressNull(dstJson)

    print(json.dumps(dstJson, ensure_ascii=False, indent=2))
