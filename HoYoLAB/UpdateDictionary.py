import json
from operator import indexOf
import os
import os.path
import pathlib
import re

SRC_PATH = './RawData/data'
ORG_PATH = '../public/data/HoYoDictionary'
DST_PATH = '../public/data/HoYoDictionary'

os.chdir(os.path.dirname(__file__))

#CATEGORY_DIRS = ['characters', 'weapons', 'artifacts']
CATEGORY_DIRS = [['character', 2], ['weapon', 4],
                 ['reliquary', 5], ['enemy_and_monster', 7], ['object', 9]]

LANGUAGES = ["zh-cn", "zh-tw", "de-de", "en-us", "es-es",
             "fr-fr", "id-id", "ko-kr", "pt-pt", "ru-ru", "th-th", "vi-vn"]


def normalizeObject(d):
    if type(d) == str:
        return re.sub(re.compile('<.*?>'), '', d).replace('・', '·').strip()
    if not isinstance(d, (dict, list)):
        return d
    if isinstance(d, list):
        return [v for v in (normalizeObject(v) for v in d)]
    result = {}
    for k, v in d.items():
        result[k] = normalizeObject(v)
    return result


os.chdir(os.path.dirname(__file__))

for category_dir in CATEGORY_DIRS:
    orgPath = ORG_PATH + str(category_dir[1]) + '.json'
    dstPath = orgPath

    orgJson = {}

    menuId = category_dir[1]

    path = pathlib.Path(SRC_PATH)
    path = path.joinpath(category_dir[0])
    files = list(path.glob('**/*.json'))
    jaJpFiles = list(filter(lambda s: str(s).find('ja-jp') != -1, files))

    newDictMap = {}

    jaJpContents = []
    for jaJpFile in jaJpFiles:
        with open(jaJpFile, 'r', encoding='utf_8_sig') as f:
            jaJpContents.append([jaJpFile, json.load(f)])

    for jaJpContent in sorted(jaJpContents, key=lambda jaJpContent: int(jaJpContent[1]['id'])):
        if menuId not in [2, 4, 5]:
            continue

        jaJpFile = jaJpContent[0]
        jaJpJson = jaJpContent[1]

        langJsonMap = {}
        for language in LANGUAGES:
            langFile = str(jaJpFile).replace('ja-jp', language)
            try:
                with open(langFile, 'r', encoding='utf_8_sig') as f:
                    langJson = json.load(f)
                    langJsonMap[language] = langJson
            except:
                langJsonMap[language] = {}
                continue

        jaJpDict = {}
        langDictMap = {}
        jaJpArr = []
        langArrMap = {}

        id = int(jaJpJson['id'])
        category = menuId
        name = jaJpJson['name']

        # キャラクター
        if menuId == 2:
            for key in ['name']:
                jaJpDict[key] = jaJpJson[key]
            for module in jaJpJson['modules']:
                for component in module['components']:
                    # 天賦
                    if component['component_id'] == 'talent' and 'data' in component and component['data'] != None and 'list' in component['data'] and component['data']['list'] != None:
                        for entry in component['data']['list']:
                            jaJpArr.append(entry['title'])
                            if 'attributes' in entry and entry['attributes'] != None:
                                for attribute in entry['attributes']:
                                    jaJpArr.append(attribute['key'])
                    # 命ノ星座
                    if component['component_id'] == 'summaryList' and 'data' in component and component['data'] != None and 'list' in component['data'] and component['data']['list'] != None:
                        for entry in component['data']['list']:
                            jaJpArr.append(entry['name'])

            for language in LANGUAGES:
                langDictMap[language] = {}
                langArrMap[language] = []
                for key in ['name']:
                    if key in langJsonMap[language]:
                        langDictMap[language][key] = langJsonMap[language][key]
                if 'modules' in langJsonMap[language]:
                    for module in langJsonMap[language]['modules']:
                        for component in module['components']:
                            # 天賦
                            if component['component_id'] == 'talent' and 'data' in component and component['data'] != None and 'list' in component['data'] and component['data']['list'] != None:
                                for entry in component['data']['list']:
                                    langArrMap[language].append(entry['title'])
                                    if 'attributes' in entry and entry['attributes'] != None:
                                        for attribute in entry['attributes']:
                                            langArrMap[language].append(
                                                attribute['key'])
                            # 命ノ星座
                            if component['component_id'] == 'summaryList' and 'data' in component and component['data'] != None and 'list' in component['data'] and component['data']['list'] != None:
                                for entry in component['data']['list']:
                                    langArrMap[language].append(entry['name'])

            for key in ['name']:
                newDictKey = normalizeObject(jaJpDict[key])
                if len(newDictKey) == 0:
                    continue
                newDictValue = {}
                for language in LANGUAGES:
                    if key in langDictMap[language]:
                        work = normalizeObject(langDictMap[language][key])
                        if len(work) > 0:
                            newDictValue[language] = work
                newDictValue['id'] = id
                newDictValue['category'] = menuId
                newDictValue['name'] = name
                newDictMap[newDictKey] = newDictValue
                print(newDictMap[newDictKey])

            if len(jaJpArr) > 0:
                for index, jaJpValue in enumerate(jaJpArr):
                    newDictKey = normalizeObject(jaJpValue)
                    if len(newDictKey) == 0:
                        continue
                    newDictValue = {}
                    for language in LANGUAGES:
                        if len(langArrMap[language]) <= index:
                            continue
                        work = normalizeObject(langArrMap[language][index])
                        if len(work) > 0:
                            newDictValue[language] = work
                    if len(newDictValue) > 0:
                        newDictValue['id'] = id
                        newDictValue['category'] = menuId
                        newDictValue['name'] = name
                        newDictMap[newDictKey] = newDictValue

        # 武器
        if menuId == 4:
            for key in ['name']:
                jaJpDict[key] = jaJpJson[key]
            for module in jaJpJson['modules']:
                for component in module['components']:
                    if component['component_id'] == 'baseInfo':
                        if 'data' in component and 'list' in component['data']:
                            for entry in component['data']['list']:
                                jaJpArr.append(entry['key'])

            for language in LANGUAGES:
                langDictMap[language] = {}
                langArrMap[language] = []
                if langJsonMap[language] is None:
                    continue
                for key in ['name']:
                    if key in langJsonMap[language]:
                        langDictMap[language][key] = langJsonMap[language][key]
                if 'modules' in langJsonMap[language]:
                    for module in langJsonMap[language]['modules']:
                        for component in module['components']:
                            if component['component_id'] == 'baseInfo':
                                if 'data' in component and 'list' in component['data']:
                                    for entry in component['data']['list']:
                                        langArrMap[language].append(entry['key'])

            for key in ['name']:
                newDictKey = normalizeObject(jaJpDict[key])
                newDictValue = {}
                for language in LANGUAGES:
                    if key in langDictMap[language]:
                        newDictValue[language] = normalizeObject(langDictMap[language][key])
                newDictValue['id'] = id
                newDictValue['category'] = menuId
                newDictValue['name'] = name
                newDictMap[newDictKey] = newDictValue

        # 聖遺物
        if menuId == 5:
            for key in ['name']:
                jaJpDict[key] = jaJpJson[key]
            for module in jaJpJson['modules']:
                for component in module['components']:
                    if component['component_id'] == 'artifact_list':
                        if 'data' not in component:
                            continue
                        for position in ['flower_of_life', 'plume_of_death', 'sands_of_eon', 'goblet_of_eonothem', 'circlet_of_logos']:
                            if position not in component['data']:
                                continue
                            if 'title' in component['data'][position]:
                                jaJpDict[position +
                                         '_title'] = component['data'][position]['title']

            for language in LANGUAGES:
                langDictMap[language] = {}
                for key in ['name']:
                    if key in langJsonMap[language]:
                        langDictMap[language][key] = langJsonMap[language][key]
                if 'modules' in langJsonMap[language]:
                    for module in langJsonMap[language]['modules']:
                        for component in module['components']:
                            if component['component_id'] == 'artifact_list':
                                if 'data' not in component:
                                    continue
                                for position in ['flower_of_life', 'plume_of_death', 'sands_of_eon', 'goblet_of_eonothem', 'circlet_of_logos']:
                                    if position not in component['data']:
                                        continue
                                    if 'title' in component['data'][position]:
                                        langDictMap[language][position +
                                                              '_title'] = component['data'][position]['title']

            for key in ['name']:
                newDictKey = normalizeObject(jaJpDict[key])
                newDictValue = {}
                for language in LANGUAGES:
                    if key in langDictMap[language]:
                        newDictValue[language] = normalizeObject(langDictMap[language][key])
                newDictValue['id'] = id
                newDictValue['category'] = menuId
                newDictValue['name'] = name
                newDictMap[newDictKey] = newDictValue

            for key in ['flower_of_life', 'plume_of_death', 'sands_of_eon', 'goblet_of_eonothem', 'circlet_of_logos']:
                for postfix in ['_title']:
                    if (key + postfix) not in jaJpDict:
                        continue
                    newDictKey = normalizeObject(jaJpDict[key + postfix])
                    newDictValue = {}
                    for language in LANGUAGES:
                        if (key + postfix) in langDictMap[language]:
                            newDictValue[language] = normalizeObject(
                                langDictMap[language][key + postfix])
                    newDictValue['id'] = id
                    newDictValue['category'] = menuId
                    newDictValue['name'] = name
                    newDictMap[newDictKey] = newDictValue

    if len(newDictMap.keys()) == 0:
        continue

    # print(newDictMap)

    if dstPath is not None:
        os.makedirs(os.path.dirname(dstPath), exist_ok=True)
        with open(dstPath, 'w', encoding='utf_8') as f:
            json.dump(newDictMap, f, indent=4, ensure_ascii=False)
