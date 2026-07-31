# -*- coding: utf-8 -*-
"""
キャラクター基礎ステータスを各キャラクター JSON ファイルを更新するスクリプト (Lv.95/Lv.100 のみ)

取得元：HoYoLAB/RawData/data/character/ja-jp 配下の JSON ファイルから直接抽出
更新先：public/data/characters 配下の同名ファイル（各キャラクター個別の JSON ファイル）

重要: 既存データは保持し、ステータスの「基礎HP」「基礎攻撃力」「基礎防御力」のみ書き換え
"""

import json
import os
import re


def extract_number(value):
    """文字列から数値を抽出する"""
    if not value or value == "-" or value == '':
        return 0.0
    
    cleaned = re.sub(r'[,\s]', '', str(value))
    
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def extract_ascension_base_stats(json_data):
    """
    基礎ステータス（Lv.95 と Lv.100）を抽出する

    Args:
        json_data: JSON データ全体

    Returns:
        {"Lv95": {...}, "Lv100": {...}} または空辞書
    """
    result = {}
    
    modules = json_data.get('modules', [])
    for module in modules:
        if 'name' not in module or module['name'] != '突破':
            continue
        
        components = module.get('components', [])
        for component in components:
            if 'component_id' not in component or component['component_id'] != 'ascension':
                continue
            
            data = component.get('data', {})
            list_data = data.get('list', [])
            
            # Lv.95 の基礎ステータスを抽出
            lv_95_found = False
            for asc_level in list_data:
                key = asc_level.get('key', '')
                if not key or 'Lv.' not in key:
                    continue
                
                level_key = int(key.replace('Lv.', ''))
                if level_key == 95 and lv_95_found:
                    break
                    
                if level_key == 95:
                    lv_95_found = True
                    combat_list = asc_level.get('combatList', [])
                    
                    if len(combat_list) >= 4:
                        hp_item = combat_list[1]['values'][0]   # "基礎 HP"（突破前＝基礎ステータス）
                        atk_item = combat_list[2]['values'][0]   # "基礎攻撃力"
                        def_item = combat_list[3]['values'][0]   # "基礎防御力"
                        
                        result['Lv95'] = {
                            '基础 HP': int(extract_number(hp_item)),
                            '基础攻击': int(extract_number(atk_item)),
                            '基础防御': int(extract_number(def_item))
                        }
                    break
            
            # Lv.100 の基礎ステータスを抽出
            lv_100_found = False
            for asc_level in list_data:
                key = asc_level.get('key', '')
                if not key or 'Lv.' not in key:
                    continue
                
                level_key = int(key.replace('Lv.', ''))
                if level_key == 100 and lv_100_found:
                    break
                    
                if level_key == 100:
                    lv_100_found = True
                    combat_list = asc_level.get('combatList', [])
                    
                    if len(combat_list) >= 4:
                        hp_item = combat_list[1]['values'][0]   # "基礎 HP"（突破前＝基礎ステータス）
                        atk_item = combat_list[2]['values'][0]   # "基礎攻撃力"
                        def_item = combat_list[3]['values'][0]   # "基礎防御力"
                        
                        result['Lv100'] = {
                            '基础 HP': int(extract_number(hp_item)),
                            '基础攻击': int(extract_number(atk_item)),
                            '基础防御': int(extract_number(def_item))
                        }
                    break
    
    return result


def update_character_file(input_path: str, output_path: str):
    """キャラクター JSON ファイルの基礎ステータスを更新する"""
    
    try:
        # 入力ファイルを読み込み
        with open(input_path, 'r', encoding='utf_8_sig') as f:
            json_data = json.load(f)
        
        # 名前を抽出（日本語名）
        name = ''
        name_src = json_data.get('name', '')
        if isinstance(name_src, list):
            for part in name_src:
                if isinstance(part, dict):
                    jp = part.get('jp', '')
                    for c in jp:
                        if '\u3040' <= c <= '\u309f' or '\u4e00' <= c <= '\u9fff':
                            name += c
                else:
                    for c in str(part):
                        if '\u3040' <= c <= '\u309f' or '\u4e00' <= c <= '\u9fff':
                            name += c
        elif isinstance(name_src, str):
            for char in name_src:
                if '\u3040' <= char <= '\u309f' or '\u4e00' <= char <= '\u9fff':
                    name += char
                else:
                    break
        
        # 基礎ステータスを抽出
        base_stats = extract_ascension_base_stats(json_data)
        
        # 突破データが完全に存在しない場合はスキップ
        if not base_stats:
            print(f"  {name or basename}: 突破データが見つかりませんでした（更新不要）")
            return False
        
        lv95 = base_stats.get('Lv95')
        lv100 = base_stats.get('Lv100', {})
        lv100_found = bool(lv100)
        
        # basename の定義（エラーハンドリング用）
        from_path = os.path.basename(input_path)
        
        print(f"  {name or from_path}: Lv95={lv95}, Lv100={'found' if lv100_found else 'なし'}")
        
        # 出力ファイルが存在しない場合はスキップ
        if not os.path.exists(output_path):
            print(f"  {name or from_path}: 出力ファイルが見つかりません（更新不要）")
            return False
        
        # 出力ファイルを読み込み（既存データを保持）
        with open(output_path, 'r', encoding='utf-8') as f:
            character_data = json.load(f)
        
        # base_stats フォールドを更新・追加
        if 'ステータス' not in character_data:
            character_data['ステータス'] = {}
        
        existing = character_data['ステータス']
        
        # Lv95 の値をセット（存在する場合のみ）
        if lv95:
            # 既存キーがあるか確認
            hp_key_95 = '基礎 HP'
            atk_key_95 = '基礎攻撃力'
            def_key_95 = '基礎防御力'
            
            if hp_key_95 in existing and '95' not in existing[hp_key_95]:
                existing[hp_key_95]['95'] = lv95.get('基础 HP', 0)
            if atk_key_95 in existing and '95' not in existing[atk_key_95]:
                existing[atk_key_95]['95'] = lv95.get('基础攻击', 0)
            if def_key_95 in existing and '95' not in existing[def_key_95]:
                existing[def_key_95]['95'] = lv95.get('基础防御', 0)
        
        # Lv100 の値をセット（存在する場合のみ）
        if lv100_found and lv100:
            hp_key_100 = '基礎 HP'
            atk_key_100 = '基礎攻撃力'
            def_key_100 = '基礎防御力'
            
            if hp_key_100 in existing and '100' not in existing[hp_key_100]:
                existing[hp_key_100]['100'] = lv100.get('基础 HP', 0)
            if atk_key_100 in existing and '100' not in existing[atk_key_100]:
                existing[atk_key_100]['100'] = lv100.get('基础攻击', 0)
            if def_key_100 in existing and '100' not in existing[def_key_100]:
                existing[def_key_100]['100'] = lv100.get('基础防御', 0)

        # 更新されたファイルを保存
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(character_data, f, ensure_ascii=False, indent=2)
        
        return True
        
    except Exception as e:
        print(f"  {name or basename}: エラー - {e}")
        return False


def main():
    """すべてのキャラクター JSON ファイルを更新する"""
    
    input_dir = 'RawData/data/character/ja-jp'
    output_dir = '../public/data/characters'
    
    print(f"\n更新対象ディレクトリ: {input_dir}")
    print(f"更新出力ディレクトリ：{output_dir}")
    
    # 入力ファイルをスキャン
    files = []
    for filename in os.listdir(input_dir):
        if filename.endswith('.json'):
            files.append(filename)
    
    print(f"\nFound {len(files)} character files to process")
    
    updated_count = 0
    
    for filename in sorted(files):
        input_path = os.path.join(input_dir, filename)
        
        # 出力パスを生成（階層を 1 レベル下げる）
        basename = os.path.basename(filename)
        
        # ファイル名の拡張子部分を分割（.json のみ）
        if basename.endswith('.json'):
            name_part = basename[:-5]
            output_path = os.path.join(output_dir, f'{name_part}.json')
        else:
            continue
        
        print(f"\nProcessing: {filename}")
        success = update_character_file(input_path, output_path)
        
        if success:
            updated_count += 1
    
    print(f"\n=== 処理完了 ===")
    print(f"Updated {updated_count} character files with base_stats (Lv.95/Lv.100 only).")


if __name__ == '__main__':
    main()