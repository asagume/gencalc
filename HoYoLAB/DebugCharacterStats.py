#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
キャラクターの基礎ステータス JSON の構造をデバッグする簡易スクリプト
"""

import json


def debug_character_file(input_path: str):
    """単一のキャラクター JSON ファイルの構造を確認する"""
    
    with open(input_path, 'r', encoding='utf-8') as f:
        json_data = json.load(f)
    
    print("=" * 60)
    print(f"ファイル：{input_path}")
    print(f"名前：{json_data.get('name', '')}")
    print("=" * 60)
    
    # modules を見る
    modules = json_data.get('modules', [])
    print(f"\nmodules の数: {len(modules)}")
    
    # 「突破」モジュールを探す
    ascension_module = None
    for module in modules:
        if module.get('name') == '突破':
            ascension_module = module
            break
    
    if ascension_module:
        print(f"\n「突破」モジュールが見つかりました")
        
        components = ascension_module.get('components', [])
        print(f"components の数: {len(components)}")
        
        # 「突破」内の components を見る
        for component in components:
            comp_id = component.get('component_id', '')
            if comp_id == 'ascension':
                print(f"\n「ascension」component が見つかりました")
                
                data = component.get('data', {})
                list_data = data.get('list', [])
                print(f"list の数: {len(list_data)}")
                
                # まず最初の数レベルだけ表示（構造確認用）
                for i, asc_level in enumerate(list_data[:5]):
                    key = asc_level.get('key', '')
                    combat_list = asc_level.get('combatList', [])
                    
                    print(f"\n--- Lv.{key} ---")
                    print(f"combat_list の数: {len(combat_list)}")
                    
                    for j, item in enumerate(combat_list):
                        if isinstance(item, dict):
                            key_name = item.get('key', '')
                            values = item.get('values', [])
                            
                            print(f"  [{j}] key='{key_name}', values 数={len(values)}")
                            
                            # combatList[1] が「基礎 HP'の行、[2] が値
                            if j == 1:
                                status_item = item
                            elif j == 2:
                                value_item = item
                    
                    # Lv.95 または Lv.100 の場合
                    if 'Lv.95' in key or 'Lv.100' in key:
                        print(f"\n【{key}の詳細】")
                        combat_list = asc_level.get('combatList', [])
                        for j, item in enumerate(combat_list):
                            if isinstance(item, dict):
                                key_name = item.get('key', '')
                                values = item.get('values', [])
                                print(f"  [{j}] key='{key_name}'")
                                for v_idx, val in enumerate(values):
                                    print(f"      [{v_idx}] type={type(val).__name__}, value={repr(val)[:100]}")
                
                # Lv.95 のデータを詳しく見る
                if list_data:
                    for asc_level in list_data:
                        key = asc_level.get('key', '')
                        if 'Lv.95' in key:
                            combat_list = asc_level.get('combatList', [])
                            print(f"\n=== Lv.95 の combatList ===")
                            for idx, item in enumerate(combat_list):
                                if isinstance(item, dict):
                                    print(f"[{idx}] {item}")
                        elif 'Lv.100' in key:
                            combat_list = asc_level.get('combatList', [])
                            print(f"\n=== Lv.100 の combatList ===")
                            for idx, item in enumerate(combat_list):
                                if isinstance(item, dict):
                                    print(f"[{idx}] {item}")

    return json_data


if __name__ == '__main__':
    # ファイルを指定して実行（ファルザン）
    debug_character_file('HoYoLAB/RawData/data/character/ja-jp/anemo_4_bow_Faruzan.json')