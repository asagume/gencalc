import json
import os
import pathlib
import re


SRC_PATH = './RawData/data'
DST_PATH = '../public/data/HoYoDictionary'

# カテゴリ定義：[カテゴリ名，menuId]
CATEGORY_DEFS = [
    {'name': 'character', 'id': 2},
    {'name': 'weapon', 'id': 4},
    {'name': 'reliquary', 'id': 5},
    {'name': 'enemy_and_monster', 'id': 7},
    {'name': 'object', 'id': 9},
]

# 許可されているカテゴリの menuId リスト
ALLOWED_CATEGORY_IDS = {2, 4, 5}

LANGUAGES = [
    "zh-cn", "zh-tw", "de-de", "en-us", "es-es",
    "fr-fr", "id-id", "ko-kr", "pt-pt", "ru-ru", "th-th", "vi-vn"
]


def normalizeObject(d):
    """文字列の HTML タグを除去し、全角句読点を半角に変換する。"""
    if isinstance(d, str):
        return re.sub(re.compile('<.*?>'), '', d).replace('・', '·').strip()
    if not isinstance(d, (dict, list)):
        return d
    if isinstance(d, list):
        return [normalizeObject(v) for v in d]
    result = {}
    for k, v in d.items():
        result[k] = normalizeObject(v)
    return result


def process_character(jaJpJson, langJsonMap, id_value, name_value):
    """キャラクターのデータ処理"""
    newDictMap = {}

    # 日本語名を辞書に登録
    jaJpDict = {'name': jaJpJson['name']}

    # 天賦と命ノ星座の情報を抽出
    jaJpArr = []
    for module in jaJpJson.get('modules', []):
        for component in module.get('components', []):
            component_id = component.get('component_id', '')

            if component_id == 'talent':
                data = component.get('data')
                if data and data.get('list'):
                    for entry in data['list']:
                        jaJpArr.append(entry['title'])
                        if entry.get('attributes'):
                            for attribute in entry['attributes']:
                                jaJpArr.append(attribute['key'])

            elif component_id == 'summaryList':
                data = component.get('data')
                if data and data.get('list'):
                    for entry in data['list']:
                        jaJpArr.append(entry['name'])

    # 各言語の辞書データを作成
    langDictMap = {}
    langArrMap = {}
    for language in LANGUAGES:
        langDictMap[language] = {}
        langArrMap[language] = []

        langData = langJsonMap.get(language, {})
        if not langData:
            continue

        # 名前を登録
        if 'name' in langData:
            langDictMap[language]['name'] = langData['name']

        # モジュール情報からデータを抽出
        for module in langData.get('modules', []):
            for component in module.get('components', []):
                component_id = component.get('component_id', '')

                if component_id == 'talent':
                    data = component.get('data')
                    if data and data.get('list'):
                        for entry in data['list']:
                            langArrMap[language].append(entry['title'])
                            if entry.get('attributes'):
                                for attribute in entry['attributes']:
                                    langArrMap[language].append(attribute['key'])

                elif component_id == 'summaryList':
                    data = component.get('data')
                    if data and data.get('list'):
                        for entry in data['list']:
                            langArrMap[language].append(entry['name'])

    # 名前をキーとした辞書エントリを作成
    newDictKey = normalizeObject(jaJpDict['name'])
    if newDictKey:
        newDictValue = {}
        for language in LANGUAGES:
            if 'name' in langDictMap[language]:
                work = normalizeObject(langDictMap[language]['name'])
                if work:
                    newDictValue[language] = work
        newDictValue['id'] = id_value
        newDictValue['category'] = 2
        newDictValue['name'] = name_value
        newDictMap[newDictKey] = newDictValue

    # アレイ情報から辞書エントリを作成
    if jaJpArr:
        for index, jaJpValue in enumerate(jaJpArr):
            newDictKey = normalizeObject(jaJpValue)
            if not newDictKey:
                continue

            newDictValue = {}
            for language in LANGUAGES:
                if index < len(langArrMap[language]):
                    work = normalizeObject(langArrMap[language][index])
                    if work:
                        newDictValue[language] = work

            if newDictValue:
                newDictValue['id'] = id_value
                newDictValue['category'] = 2
                newDictValue['name'] = name_value
                newDictMap[newDictKey] = newDictValue

    return newDictMap


def process_weapon(jaJpJson, langJsonMap, id_value, name_value):
    """武器のデータ処理"""
    newDictMap = {}

    # 日本語名を辞書に登録
    jaJpDict = {'name': jaJpJson['name']}

    # baseInfo の情報を抽出
    jaJpArr = []
    for module in jaJpJson.get('modules', []):
        for component in module.get('components', []):
            if component.get('component_id') == 'baseInfo':
                data = component.get('data', {})
                if data.get('list'):
                    for entry in data['list']:
                        jaJpArr.append(entry['key'])

    # 各言語の辞書データを作成
    langDictMap = {}
    langArrMap = {}
    for language in LANGUAGES:
        langDictMap[language] = {}
        langArrMap[language] = []

        langData = langJsonMap.get(language, {})
        if not langData:
            continue

        # 名前を登録
        if 'name' in langData:
            langDictMap[language]['name'] = langData['name']

        # モジュール情報からデータを抽出
        for module in langData.get('modules', []):
            for component in module.get('components', []):
                if component.get('component_id') == 'baseInfo':
                    data = component.get('data', {})
                    if data.get('list'):
                        for entry in data['list']:
                            langArrMap[language].append(entry['key'])

    # 名前をキーとした辞書エントリを作成
    newDictKey = normalizeObject(jaJpDict['name'])
    if newDictKey:
        newDictValue = {}
        for language in LANGUAGES:
            if 'name' in langDictMap[language]:
                newDictValue[language] = normalizeObject(langDictMap[language]['name'])
        newDictValue['id'] = id_value
        newDictValue['category'] = 4
        newDictValue['name'] = name_value
        newDictMap[newDictKey] = newDictValue

    # アレイ情報から辞書エントリを作成
    for index, jaJpValue in enumerate(jaJpArr):
        newDictKey = normalizeObject(jaJpValue)
        if not newDictKey:
            continue

        newDictValue = {}
        for language in LANGUAGES:
            if index < len(langArrMap[language]):
                work = normalizeObject(langArrMap[language][index])
                if work:
                    newDictValue[language] = work

        if newDictValue:
            newDictValue['id'] = id_value
            newDictValue['category'] = 4
            newDictValue['name'] = name_value
            newDictMap[newDictKey] = newDictValue

    return newDictMap


def process_reliquary(jaJpJson, langJsonMap, id_value, name_value):
    """聖遺物のデータ処理"""
    newDictMap = {}

    # 日本語名を辞書に登録
    jaJpDict = {'name': jaJpJson['name']}

    # 追加のキーを取得（部位タイトルなど）
    artifact_positions = [
        'flower_of_life', 'plume_of_death', 'sands_of_eon',
        'goblet_of_eonothem', 'circlet_of_logos'
    ]

    for module in jaJpJson.get('modules', []):
        for component in module.get('components', []):
            if component.get('component_id') == 'artifact_list':
                data = component.get('data', {})
                for position in artifact_positions:
                    if position in data and 'title' in data[position]:
                        jaJpDict[f'{position}_title'] = data[position]['title']

    # 各言語の辞書データを作成
    langDictMap = {}
    for language in LANGUAGES:
        langDictMap[language] = {}

        langData = langJsonMap.get(language, {})
        if not langData:
            continue

        # 名前を登録
        if 'name' in langData:
            langDictMap[language]['name'] = langData['name']

        # 部位タイトルを取得
        for module in langData.get('modules', []):
            for component in module.get('components', []):
                if component.get('component_id') == 'artifact_list':
                    data = component.get('data', {})
                    for position in artifact_positions:
                        if position in data and 'title' in data[position]:
                            langDictMap[language][f'{position}_title'] = data[position]['title']

    # 名前をキーとした辞書エントリを作成
    newDictKey = normalizeObject(jaJpDict['name'])
    if newDictKey:
        newDictValue = {}
        for language in LANGUAGES:
            if 'name' in langDictMap[language]:
                newDictValue[language] = normalizeObject(langDictMap[language]['name'])
        newDictValue['id'] = id_value
        newDictValue['category'] = 5
        newDictValue['name'] = name_value
        newDictMap[newDictKey] = newDictValue

    # 部位タイトルから辞書エントリを作成
    for position in artifact_positions:
        postfix = '_title'
        full_key = f'{position}{postfix}'

        if full_key not in jaJpDict:
            continue

        newDictKey = normalizeObject(jaJpDict[full_key])
        if not newDictKey:
            continue

        newDictValue = {}
        for language in LANGUAGES:
            if full_key in langDictMap[language]:
                newDictValue[language] = normalizeObject(langDictMap[language][full_key])

        if newDictValue:
            newDictValue['id'] = id_value
            newDictValue['category'] = 5
            newDictValue['name'] = name_value
            newDictMap[newDictKey] = newDictValue

    return newDictMap


def process_dict_entry(jaJpFile, jaJpJson, langJsonMap):
    """カテゴリごとの処理を実行し、辞書エントリを生成する"""
    id_value = int(jaJpJson.get('id', 0))
    name_value = jaJpJson.get('name', '')

    # カテゴリに応じて適切な処理関数を呼び出す
    if id_value == 2:
        return process_character(jaJpJson, langJsonMap, id_value, name_value)
    elif id_value == 4:
        return process_weapon(jaJpJson, langJsonMap, id_value, name_value)
    elif id_value == 5:
        return process_reliquary(jaJpJson, langJsonMap, id_value, name_value)
    else:
        return {}


def build_lang_map(src_dir, category_name):
    """カテゴリのすべての言語データをロードする"""
    jaJpFile = pathlib.Path(src_dir).joinpath(f'{category_name}/ja-jp.json')

    langJsonMap = {}
    jaJpContent = None

    try:
        with open(jaJpFile, 'r', encoding='utf_8_sig') as f:
            jaJpContent = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError, UnicodeDecodeError) as e:
        print(f"警告：日本語ファイルを開けません {jaJpFile}: {e}")
        return {}, None

    # 各言語の JSON ファイルを読み込む
    for language in LANGUAGES:
        langFile = pathlib.Path(src_dir).joinpath(f'{category_name}/{language}.json')
        try:
            with open(langFile, 'r', encoding='utf_8_sig') as f:
                langJson = json.load(f)
                langJsonMap[language] = langJson
        except FileNotFoundError:
            print(f"警告：言語ファイルが存在しません {langFile} (空辞書を使用)")
            langJsonMap[language] = {}
        except json.JSONDecodeError as e:
            print(f"警告：JSON 解析エラー {langFile}: {e}")
            langJsonMap[language] = {}
        except UnicodeDecodeError as e:
            print(f"警告：エンコーディングエラー {langFile}: {e}")
            langJsonMap[language] = {}

    return jaJpContent, langJsonMap


def process_category(category_def):
    """単一カテゴリの処理を実行する"""
    category_name = category_def['name']
    menuId = category_def['id']

    # カテゴリディレクトリパスを構築
    category_path = pathlib.Path(SRC_PATH) / category_name
    if not category_path.exists():
        print(f"警告：カテゴリディレクトリが存在しません {category_path}")
        return {}

    jaJpFiles = list(category_path.glob('**/ja-jp*.json'))

    newDictMap = {}
    for jaJpFile in sorted(jaJpFiles, key=lambda f: int(pathlib.Path(f).stem)):
        jaJpContent, langJsonMap = build_lang_map(str(category_path), category_name)

        if not jaJpContent:
            continue

        entry_dict = process_dict_entry(str(jaJpFile), jaJpContent, langJsonMap)
        newDictMap.update(entry_dict)

    return newDictMap


def main():
    """メイン処理"""
    # 既存のデータをコピー（オプション）
    ORG_PATH = DST_PATH

    for category_def in CATEGORY_DEFS:
        print(f"処理開始：{category_def['name']} (menuId={category_def['id']})")

        newDictMap = process_category(category_def)

        if not newDictMap:
            print(f"  {category_def['name']}: 生成したエントリがありません")
            continue

        dstPath = os.path.join(DST_PATH, f'{category_def["id"]}.json')

        # ディレクトリが存在しない場合は作成
        os.makedirs(os.path.dirname(dstPath), exist_ok=True)

        # JSON ファイルとして保存
        with open(dstPath, 'w', encoding='utf_8') as f:
            json.dump(newDictMap, f, indent=4, ensure_ascii=False)

        print(f"  {category_def['name']}: エントリ数={len(newDictMap)}件")

    print("処理完了")


if __name__ == '__main__':
    main()
