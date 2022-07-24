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

with open(ORG_PATH, 'r', encoding='utf_8_sig') as f:
    orgJson = json.load(f)

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
            for component in module['components']:
                if component['component_id'] == 'talent':
                    for entry in component['data']['list']:
                        jaJpTalents.append(entry['title'])
                        if entry['attributes'] != None:
                            for attribute in entry['attributes']:
                                jaJpTalents.append(attribute['key'])
                        if entry['desc'] != None:
                            for m in re.finditer(r'<span.*?>(.+?)</span>', entry['desc']):
                                jaJpKeywords.append(m.group(1))
                if component['component_id'] == 'summaryList':
                    for entry in component['data']['list']:
                        jaJpTalents.append(entry['name'])

        for language in LANGUAGES:
            langWork = []
            langKeywordWork = []
            for module in langJsonMap[language]['modules']:
                for component in module['components']:
                    if component['component_id'] == 'talent':
                        for entry in component['data']['list']:
                            langWork.append(entry['title'])
                            if entry['attributes'] != None:
                                for attribute in entry['attributes']:
                                    langWork.append(attribute['key'])
                            if entry['desc'] != None:
                                for m in re.finditer(r'<span.*?>(.+?)</span>', entry['desc']):
                                    langKeywordWork.append(m.group(1))
                    if component['component_id'] == 'summaryList':
                        for entry in component['data']['list']:
                            langWork.append(entry['name'])
            langTalents[language] = langWork
            langKeywords[language] = langKeywordWork

        for index, dictKey in enumerate(jaJpTalents):
            dictObj = {}
            for language in LANGUAGES:
                dictObj[language] = langTalents[language][index]
            newDictMap[dictKey] = dictObj

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
    print (k, v)

# print(orgJson)

if DST_PATH is not None:
    os.makedirs(os.path.dirname(DST_PATH), exist_ok=True)
    with open(DST_PATH, 'w', encoding='utf_8') as f:
        json.dump(orgJson, f, indent=4, ensure_ascii=False)
