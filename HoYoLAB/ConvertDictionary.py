import json
from operator import indexOf
import os
import os.path
import re

SRC_DIR = '../public/data'
DST_DIR = '../public/locales'

os.chdir(os.path.dirname(__file__))

SRC_DICTIONARIES = ['HoYoDictionary2.json', 'HoYoDictionary4.json', 'HoYoDictionary5.json',
                    'LocalDictionary.json']

LANGUAGES = ["zh-cn", "zh-tw", "de-de", "en-us", "es-es", "ja-jp",
             "fr-fr", "id-id", "ko-kr", "pt-pt", "ru-ru", "th-th", "vi-vn"]

# sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

for lang in LANGUAGES:
    dstJson = {}

    for srcDic in SRC_DICTIONARIES:
        srcPath = os.path.join(SRC_DIR, srcDic)
        try:
            with open(srcPath, 'r', encoding='utf_8_sig') as f:
                srcJson = json.load(f)
        except Exception as e:
            srcJson = {}

        if lang == 'ja-jp':
            for k, v in srcJson.items():
                newK = re.sub('バフ$', '', k)
                dstJson[k] = newK
        else:
            for k, v in srcJson.items():
                if lang in v:
                    dstJson[k] = v[lang]

    dstPath = os.path.join(DST_DIR, lang + '.json')
    with open(dstPath, 'w', encoding='utf_8') as f:
        json.dump(dstJson, f, indent=4, ensure_ascii=False)
