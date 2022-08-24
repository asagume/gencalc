import io
import sys
import json
from operator import indexOf
import os
import os.path
import re
import datetime

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

SRC_DIR = '../public/data'

os.chdir(os.path.dirname(__file__))

listPath = os.path.join(SRC_DIR, 'CharacterMaster.json')
try:
    with open(listPath, 'r', encoding='utf_8') as f:
        listJson = json.load(f)
except Exception as e:
    None

for k, v in listJson.items():
    detailPath = os.path.join(SRC_DIR, re.sub('data/', '', v['import']))
    try:
        with open(detailPath, 'r', encoding='utf_8') as f:
            detailJson = json.load(f)
    except Exception as e:
        continue

    listBirthday = None
    if '誕生日' in v:
        listBirthday = v['誕生日']
    detailBirthday = None
    if '誕生日' in detailJson['baseInfo']:
        detailBirthday = detailJson['baseInfo']['誕生日']

    print(k, listBirthday, detailBirthday)
