from contextlib import nullcontext
from decimal import *
import copy
import glob
import json
import os
import os.path
import re

SRC_PATH = './RawData/data/weapon'
ORG_PATH = '../public/data/weapons'
DST_PATH = '../public/data/weapons'
ICON_URL_PATH = 'images/weapons'

isCreateOnly = True

os.chdir(os.path.dirname(__file__))

templateJson = {
    '名前': None,
    '説明': None,
    'icon_url': None,
    'レアリティ': None,
    '種類': None,
    'ステータス': {
        '基礎攻撃力': {}
    },
    '武器スキル': {
        '名前': None,
        '説明': None,
        '詳細': []
    }
}


def normalizeStatName(statName):
    if statName.endswith('元素ダメージ') or statName.endswith('物理ダメージ'):
        statName = statName + 'バフ'
    else:
        statName = statName.replace('パーセンテージ', '%')
    return statName


def normalizeStatValue(value):
    value = value.replace('%', '')
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


def normalizeObject(d):
    if type(d) == str:
        return d.replace('<p>', '').replace('</p>', '')
    if not isinstance(d, (dict, list)):
        return d
    if isinstance(d, list):
        return [v for v in (normalizeObject(v) for v in d)]
    result = {}
    for k, v in d.items():
        result[k] = normalizeObject(v)
    return result


files = glob.glob(SRC_PATH + '/*/ja-jp/*.json', recursive=True)
# print(files)
for filepath in files:
    with open(filepath, 'r', encoding='utf_8_sig') as f:
        srcJson = json.load(f)
    # print(json.dumps(srcJson, indent=2, ensure_ascii=False))

    filename = os.path.basename(filepath)
    dirname = os.path.dirname(filepath)
    dirnameSplitted = re.split('[\\/\\\\]', dirname)

    dstFilepath = os.path.join(
        DST_PATH, dirnameSplitted[len(dirnameSplitted) - 2], filename)
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
        orgFilepath = os.path.join(
            ORG_PATH, dirnameSplitted[len(dirnameSplitted) - 2], filename)
        with open(orgFilepath, 'r', encoding='utf_8') as f:
            orgJson = json.load(f)
            print(json.dumps(orgJson, indent=2, ensure_ascii=False))
            for key in orgJson.keys():
                dstJson[key] = orgJson[key]
    except Exception as e:
        None

    dstJson['名前'] = srcJson['name']
    dstJson['説明'] = re.sub('<.*?>', '', srcJson['desc'])
    dstJson['icon_url'] = ICON_URL_PATH + '/' + \
        dirnameSplitted[len(dirnameSplitted) - 2] + '/' + \
        filename.replace('.json', '.png')
    for value in srcJson['filter_values']['weapon_rarity']['values']:
        dstJson['レアリティ'] = int(value.replace('★', ''))
    for value in srcJson['filter_values']['weapon_type']['values']:
        dstJson['種類'] = value

    dstJson['ステータス'] = copy.deepcopy(templateJson['ステータス'])
    for value in srcJson['filter_values']['weapon_property']['values']:
        weaponProperty = normalizeStatName(value)
        if len(weaponProperty) > 0:
            dstJson['ステータス'][weaponProperty] = {}
        else:
            weaponProperty = None

    for module in srcJson['modules']:
        for component in module['components']:
            if module['name'] == 'ステータス' and component['component_id'] == 'baseInfo':
                for entry in component['data']['list']:
                    if entry['key'] not in ['名称', '入手方法', '種類', 'サブステータス', '精錬素材', '鍛造素材', '実装バージョン']:
                        dstJson['武器スキル']['名前'] = entry['key']
                        if isinstance(entry['value'], list):
                            dstJson['武器スキル']['説明'] = re.sub(
                                '<.*?>', '', ','.join(entry['value']))
                        elif isinstance(entry['value'], str):
                            dstJson['武器スキル']['説明'] = re.sub(
                                '<.*?>', '', entry['value'])

            elif module['name'] == '突破' and component['component_id'] == 'ascension':
                # 突破
                for entry in component['data']['list']:
                    level = entry['key'].replace('Lv.', '')
                    # 突破前
                    if entry['combatList'][1]['values'][0] != '-':
                        dstJson['ステータス']['基礎攻撃力'][level] = normalizeStatValue(
                            entry['combatList'][1]['values'][0])
                        if weaponProperty is not None:
                            dstJson['ステータス'][weaponProperty][level] = normalizeStatValue(
                                entry['combatList'][1]['values'][2])
                    # 突破後
                    if entry['combatList'][1]['values'][1] != '-':
                        dstJson['ステータス']['基礎攻撃力'][level + '+'] = normalizeStatValue(
                            entry['combatList'][1]['values'][1])
                        if weaponProperty is not None:
                            dstJson['ステータス'][weaponProperty][level + '+'] = normalizeStatValue(
                                entry['combatList'][1]['values'][2])

    dstJson = suppressNull(dstJson)
    dstJson = normalizeObject(dstJson)

    # print(json.dumps(dstJson, ensure_ascii=False, indent=2))

    if dstFilepath is not None:
        os.makedirs(os.path.dirname(dstFilepath), exist_ok=True)
        with open(dstFilepath, 'w', encoding='utf_8') as f:
            json.dump(dstJson, f, indent=4, ensure_ascii=False)
