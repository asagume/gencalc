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
ORG_PATH = '../data/Dictionary.json'
DST_PATH = '../data/Dictionary.json'

CATEGORY_DIRS = ['characters', 'weapons', 'artifacts']

LANGUAGES = ['en-us']

os.chdir(os.path.dirname(__file__))

with open(ORG_PATH, 'r', encoding='utf_8_sig') as f:
    orgJson = json.load(f)

newDictMap = {}

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
            print(langFile)

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
        langTalents = {}

        for module in jaJpJson['modules']:
            for component in module['components']:
                if component['component_id'] == 'talent':
                    for entry in component['data']['list']:
                        jaJpTalents.append(entry['title'])

        for language in LANGUAGES:
            langWork = []
            for module in langJsonMap[language]['modules']:
                for component in module['components']:
                    if component['component_id'] == 'talent':
                        for entry in component['data']['list']:
                            langWork.append(entry['title'])
            langTalents[language] = langWork

        for index, dictKey in enumerate(jaJpTalents):
            dictObj = {}
            for language in LANGUAGES:
                dictObj[language] = langTalents[language][index]
            newDictMap[dictKey] = dictObj

for k, v in newDictMap.items():
    if k not in orgJson:
        orgJson[k] = v

print(orgJson)

if DST_PATH is not None:
    os.makedirs(os.path.dirname(DST_PATH), exist_ok=True)
    with open(DST_PATH, 'w', encoding='utf_8') as f:
        json.dump(orgJson, f, indent=4, ensure_ascii=False)
