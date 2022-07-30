from contextlib import nullcontext
from decimal import *
import glob
import json
import os.path
import re

SOURCE_PATH = './RawData'
FILTER = '[5]_*.json'
UPDATE_PATH = '../public/data/ArtifactSetMaster.json'

with open(UPDATE_PATH, 'r', encoding='utf_8_sig') as f:
    updateJson = json.load(f)

files = glob.glob(SOURCE_PATH + "/" + FILTER)
for filepath in files:
    print(filepath)

    with open(filepath, 'r', encoding='utf_8_sig') as f:
        jsonContent = json.load(f)

    name = jsonContent['page']['name']
    single_set_effect = None
    two_set_effect = None
    four_set_effect = None
    artifact_list = []

    for module in jsonContent['page']['modules']:
        for component in module['components']:
            data = re.sub('\\"', '"', component['data'])
            dataJson = json.loads(data)
            component['data'] = dataJson

            if component['component_id'] == 'reliquary_set_effect':
                if 'single_set_effect' in component['data']:
                    single_set_effect = component['data']['single_set_effect']
                if 'two_set_effect' in component['data']:
                    two_set_effect = component['data']['two_set_effect']
                if 'four_set_effect' in component['data']:
                    four_set_effect = component['data']['four_set_effect']

            if component['component_id'] == 'artifact_list':
                for key in ['flower_of_life', 'plume_of_death', 'sands_of_eon', 'goblet_of_eonothem', 'circlet_of_logos']:
                    if key in component['data']:
                        if 'title' in component['data'][key]:
                            artifact_list.append(component['data'][key]['title'])
                        else:
                            artifact_list.append(None)


    if name in updateJson:
        updateJson[name]['artifact_list'] = artifact_list
        if single_set_effect != None:
            if '1セット効果' in updateJson[name]:
                updateJson[name]['1セット効果']['説明'] = single_set_effect
        if two_set_effect != None:
            if '2セット効果' in updateJson[name]:
                updateJson[name]['2セット効果']['説明'] = two_set_effect
        if four_set_effect != None:
            if '4セット効果' in updateJson[name]:
                updateJson[name]['4セット効果']['説明'] = four_set_effect
        print(updateJson[name])

with open(UPDATE_PATH, 'w', encoding='utf_8') as f:
    json.dump(updateJson, f, indent=4, ensure_ascii=False)
