from contextlib import nullcontext
from decimal import *
import copy
import glob
import json
from operator import indexOf
import os
import os.path
import pathlib
import re

SRC_PATH = './RawData/data'
ORG_PATH = '../data/HoYoDictionary.json'
DST_PATH = '../data/HoYoDictionary.json'

CATEGORY_DIRS = ['characters', 'weapons', 'artifacts']

LANGUAGES = ["zh-cn", "zh-tw", "de-de", "en-us", "es-es", "fr-fr", "id-id", "ko-kr", "pt-pt", "ru-ru", "th-th", "vi-vn"]

os.chdir(os.path.dirname(__file__))

try:
    with open(ORG_PATH, 'r', encoding='utf_8_sig') as f:
        orgJson = json.load(f)
except Exception as e:
    orgJson = {}

newDictMap = {}
keywordDictMap = {}

for category in CATEGORY_DIRS:
    path = pathlib.Path(SRC_PATH)
    files = list(path.glob('**/*.json'))
    jaJpFiles = list(filter(lambda s: str(s).find('ja-jp') != -1, files))

    for jaJpFile in jaJpFiles:
        # print(jaJpFile)

        with open(jaJpFile, 'r', encoding='utf_8_sig') as f:
            jaJpJson = json.load(f)

        langJsonMap = {}

        for language in LANGUAGES:
            langFile = str(jaJpFile).replace('ja-jp', language)
            # print(langFile)

            with open(langFile, 'r', encoding='utf_8_sig') as f:
                langJson = json.load(f)
                langJsonMap[language] = langJson

        # 名前
        dictKey = jaJpJson['name']
        dictObj = {}
        for language in LANGUAGES:
            dictObj[language] = langJsonMap[language]['name']

        newDictMap[dictKey] = dictObj

        jaJpTalents = []
        jaJpKeywords = []
        langTalents = {}
        langKeywords = {}

        for module in jaJpJson['modules']:
            # jaJpTalents.append(module['name'])
            for component in module['components']:
                if component['component_id'] not in ['baseInfo', 'talent', 'summaryList', 'artifact_list']:
                    continue
                if component['component_id'] == 'baseInfo' and category != 'weapons':
                    continue
                if 'data' in component:
                    for key in ['flower_of_life', 'sands_of_eon', 'plume_of_death', 'circlet_of_logos', 'goblet_of_eonothem']:
                        if key in component['data'] and 'title' in component['data'][key]:
                            jaJpTalents.append(component['data'][key]['title'])
                    if 'list' in component['data']:
                        for entry in component['data']['list']:
                            if 'key' in entry and entry['key'] != None:
                                jaJpTalents.append(entry['key'])
                            else:
                                jaJpTalents.append(None)
                            if 'title' in entry and entry['title'] != None:
                                jaJpTalents.append(entry['title'])
                            else:
                                jaJpTalents.append(None)
                            if 'name' in entry and entry['name'] != None:
                                jaJpTalents.append(entry['name'])
                            else:
                                jaJpTalents.append(None)
                            if 'attributes' in entry and entry['attributes'] != None:
                                for attribute in entry['attributes']:
                                    jaJpTalents.append(attribute['key'])
                            if 'desc' in entry and entry['desc'] != None:
                                for m in re.finditer(r'<span style=\"color:#FFD780FF\">(.+?)</span>', entry['desc']):
                                    jaJpKeywords.append(m.group(1))


        for language in LANGUAGES:
            langWork = []
            langKeywordWork = []
            for module in langJsonMap[language]['modules']:
                # langWork.append(module['name'])
                for component in module['components']:
                    if component['component_id'] not in ['baseInfo', 'talent', 'summaryList', 'artifact_list']:
                        continue
                    if component['component_id'] == 'baseInfo' and category != 'weapons':
                        continue
                    if 'data' in component:
                        for key in ['flower_of_life', 'sands_of_eon', 'plume_of_death', 'circlet_of_logos', 'goblet_of_eonothem']:
                            if key in component['data'] and 'title' in component['data'][key]:
                                langWork.append(component['data'][key]['title'])
                        if 'list' in component['data']:
                            for entry in component['data']['list']:
                                if 'key' in entry and entry['key'] != None:
                                    langWork.append(entry['key'])
                                else:
                                    langWork.append(None)
                                if 'title' in entry and entry['title'] != None:
                                    langWork.append(entry['title'])
                                else:
                                    langWork.append(None)
                                if 'name' in entry and entry['name'] != None:
                                    langWork.append(entry['name'])
                                else:
                                    langWork.append(None)
                                if 'attributes' in entry and entry['attributes'] != None:
                                    for attribute in entry['attributes']:
                                        langWork.append(attribute['key'])
                                if 'desc' in entry and entry['desc'] != None:
                                    for m in re.finditer(r'<span style=\"color:#FFD780FF\">(.+?)</span>', entry['desc']):
                                        langKeywordWork.append(m.group(1))
            langTalents[language] = langWork
            langKeywords[language] = langKeywordWork

        okay = True
        for index, dictKey in enumerate(jaJpTalents):
            if dictKey == None:
                continue
            dictObj = {}
            for language in LANGUAGES:
                if index < len(langTalents[language]) and langTalents[language][index] != None:
                    dictObj[language] = langTalents[language][index]
                else:
                    okay = False
            if okay:                
                newDictMap[dictKey] = dictObj
            else:
                print ('Error:' + dictKey)

        for index, dictKey in enumerate(jaJpKeywords):
            dictObj = {}
            okay = True
            for language in LANGUAGES:
                if index < len(langKeywords[language]):
                    dictObj[language] = langKeywords[language][index]
                else:
                    okay = False
            if okay:                
                keywordDictMap[dictKey] = dictObj
            else:
                print ('Error:' + dictKey)
        # print (keywordDictMap)

for k, v in newDictMap.items():
    if k not in orgJson:
        orgJson[k] = v
    else:
        orgJson[k] = v
for k, v in keywordDictMap.items():
    if k not in orgJson:
        orgJson[k] = v
    else:
        orgJson[k] = v
    # print (k, v)

# print(orgJson)

if DST_PATH is not None:
    os.makedirs(os.path.dirname(DST_PATH), exist_ok=True)
    with open(DST_PATH, 'w', encoding='utf_8') as f:
        json.dump(orgJson, f, indent=4, ensure_ascii=False)
