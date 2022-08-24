import io
import sys
import json
from operator import indexOf
import os
import os.path
import re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

SRC_DIR = '../public/data'

os.chdir(os.path.dirname(__file__))

weaponTypeListFile = {
    '片手剣': 'SwordMaster.json',
    '両手剣': 'ClaymoreMaster.json',
    '長柄武器': 'PolearmMaster.json',
    '弓': 'BowMaster.json',
    '法器': 'CatalystMaster.json',
}

for weaponType, filename in weaponTypeListFile.items():
    listPath = os.path.join(SRC_DIR, filename)
    try:
        with open(listPath, 'r', encoding='utf_8') as f:
            listJson = json.load(f)
    except Exception as e:
        continue

    for k, v in listJson.items():
        detailPath = os.path.join(SRC_DIR, re.sub('data/', '', v['import']))
        try:
            with open(detailPath, 'r', encoding='utf_8') as f:
                detailJson = json.load(f)
        except Exception as e:
            continue

        if weaponType != detailJson['種類']:
            print(detailPath)
