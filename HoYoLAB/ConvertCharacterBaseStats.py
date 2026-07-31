#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
キャラクターの基礎ステータス（Lv.95, Lv.100）を抽出する簡易スクリプト

必要なデータのみ抽出：
- 基礎 HP
- 基礎攻撃力  
- 基礎防御力
"""

import json
import os
import re


def extract_number(value: str) -> float:
    """文字列から数値を抽出する"""
    if not value or value == "-":
        return 0.0
    
    cleaned = re.sub(r'[,\s]', '', value)
    
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def parse_json_value(value: str) -> any:
    """JSON 形式の文字列をパースする"""
    if not value or '$' not in value:
        return value
    
    try:
        match = re.search(r'\$\[(.*?)\]$', value, re.DOTALL)
        if match:
            inner = match.group(1).strip()
            return json.loads('[' + inner.strip() + ']')
    except json.JSONDecodeError:
        pass
    
    return value


def extract_ascension_data(json_data: dict, level: int) -> dict:
    """
    指定レベル（95 または 100）の基礎ステータスを抽出
    
    Args:
        json_data: JSON データ全体
        level: レベル（95 または 100）
    
    Returns:
        {"基础 HP": float, "基础攻击": float, "基础防御": float}
    """
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
            
            # 指定レベルを探す
            for asc_level in list_data:
                key = asc_level.get('key', '')
                if not key or 'Lv.' not in key:
                    continue
                
                level_key = int(key.replace('Lv.', ''))
                if level_key == level:
                    combat_list = asc_level.get('combatList', [])
                    
                    # combatList[0] は空キー（ラベル用）、combatList[1~3] に各基礎ステータスがある
                    # values[0] が「突破前」の値、values[1] が「突破後」の値
                    if len(combat_list) < 4:
                        continue
                    
                    hp_item = combat_list[1]['values'][0]   # "基礎 HP" の値（突破前＝基礎ステータス）
                    atk_item = combat_list[2]['values'][0]   # "基礎攻撃力" の値
                    def_item = combat_list[3]['values'][0]   # "基礎防御力" の値
                    
                    return {
                        '基础 HP': extract_number(hp_item),
                        '基础攻击': extract_number(atk_item),
                        '基础防御': extract_number(def_item)
                    }
    
    return {}


def get_base_stats_from_name(name: str) -> dict:
    """
    キャラクター名から既知の基礎ステータスを返す
    
    既知のデータ：
    - Lv.95 と Lv.100 の基礎 HP、攻撃力、防御力
    """
    # 既知キャラクターデータの辞書
    known_data = {
        'ファルザン': {
            'Lv95': {'基础 HP': 9901, '基础攻击': 222, '基础防御': 650},
            'Lv100': {'基础 HP': 10232, '基础攻击': 247, '基础防御': 671}
        },
        'サンドローネ': {
            'Lv95': {'基础 HP': 13695, '基础攻击': 380, '基础防御': 779},
            'Lv100': {'基础 HP': 14166, '基础攻击': 419, '基础防御': 806}
        }
    }
    
    # キャラクター名を日本語から抽出（全角英数を含む）
    ja_name = ''
    for char in name:
        if '\u3040' <= char <= '\u309f' or '\u4e00' <= char <= '\u9fff':
            ja_name += char
        else:
            break
    
    # 既知のデータがあるか検索
    for known_name, data in known_data.items():
        if known_name in ja_name:
            return {
                'Lv95': data['Lv95'],
                'Lv100': data['Lv100']
            }
    
    return {}


def process_character_file(input_path: str) -> dict:
    """単一のキャラクター JSON ファイルを処理する"""
    
    with open(input_path, 'r', encoding='utf-8') as f:
        json_data = json.load(f)
    
    # 名前を抽出（全角英数を含む）
    name = ''
    for char in json_data.get('name', ''):
        if '\u3040' <= char <= '\u309f' or '\u4e00' <= char <= '\u9fff':
            name += char
        else:
            break
    
    # 名前から既知のデータがあるか検索
    known_stats = get_base_stats_from_name(name)
    
    if known_stats:
        print(f"【既知データ】{name}: {known_stats}")
        return known_stats
    
    # RawData の相対パスを取得
    rel_path = input_path.replace('HoYoLAB/RawData/', 'RawData/')
    
    # 突破データから抽出
    level_95 = extract_ascension_data(json_data, 95)
    level_100 = extract_ascension_data(json_data, 100)
    
    if level_95 or level_100:
        result = {
            '名前': name,
            'Lv95': {'基础 HP': level_95.get('基础 HP', 0), 
                    '基础攻击': level_95.get('基础攻击', 0),
                    '基础防御': level_95.get('基础防御', 0)},
            'Lv100': {'基础 HP': level_100.get('基础 HP', 0), 
                      '基础攻击': level_100.get('基础攻击', 0),
                      '基础防御': level_100.get('基础防御', 0)}
        }
        print(f"【抽出済み】{name}: {result}")
        return result
    
    # データが抽出できなかった場合
    print(f"【未対応】{name} - 突破データが見つかりません")
    return {}


def main():
    """すべてのキャラクターファイルを処理する"""
    
    input_dir = 'HoYoLAB/RawData/data/character/ja-jp'
    output_file = 'public/data/characters/CharacterBaseStats.json'
    
    # 入力ファイルをスキャン
    all_stats = {}
    
    for filename in os.listdir(input_dir):
        if filename.endswith('.json'):
            input_path = os.path.join(input_dir, filename)
            stats = process_character_file(input_path)
            if stats:
                all_stats[stats.get('名前', filename)] = stats
    
    # 結果を JSON ファイルに保存
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_stats, f, ensure_ascii=False, indent=2)
    
    print(f"\n処理完了！{len(all_stats)} のキャラクターが処理されました。")
    print(f"結果を {output_file} に保存しました。")


if __name__ == '__main__':
    main()