#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
テスト用の抽出ロジック
"""

import json


def extract_ascension_data_test(json_data, level):
    """簡易テスト関数"""
    
    modules = json_data.get('modules', [])
    print(f"  モジュール数：{len(modules)}")
    
    for module in modules:
        if 'name' not in module or module['name'] != '突破':
            continue
        print(f"  「突破」モジュール找到了")
        
        components = module.get('components', [])
        print(f"  コンポーネント数：{len(components)}")
        
        for component in components:
            if 'component_id' not in component or component['component_id'] != 'ascension':
                continue
            
            data = component.get('data', {})
            list_data = data.get('list', [])
            print(f"  レベルリスト数：{len(list_data)}")
            
            # すべてのレベルキーを表示
            print(f"  レベルキー:")
            for item in list_data:
                key = item.get('key', '')
                print(f"    {key}")
                
                if 'Lv.' not in key:
                    continue
                
                level_key = int(key.replace('Lv.', ''))
                print(f"    Lv.{level_key} 找到了，レベル={level_key}, target={level}")
                
                if level_key == level:
                    combat_list = item.get('combatList', [])
                    print(f"    combatList 数：{len(combat_list)}")
                    
                    for idx, c in enumerate(combat_list):
                        if isinstance(c, dict):
                            cn = c.get('key', '')
                            cv = c.get('values', [])
                            print(f"      [{idx}] key='{cn}', values 数={len(cv)}, v0={cv[0] if len(cv)>0 else 'N/A'}, v1={cv[1] if len(cv)>1 else 'N/A'}")
                    
                    # 値を抽出
                    hp_item = combat_list[1]['values'][1]   # "基礎 HP" の突破後値
                    atk_item = combat_list[2]['values'][1]   # "基礎攻撃力" の突破後値
                    def_item = combat_list[3]['values'][1]   # "基礎防御力" の突破後値
                    
                    result = {
                        '基础 HP': float(hp_item.replace(',', '')),
                        '基础攻击': float(atk_item.replace(',', '')),
                        '基础防御': float(def_item.replace(',', ''))
                    }
                    
                    print(f"    結果：{result}")
                    return result
    
    return {}


def process_single_file(input_path: str):
    """単一ファイルのテスト処理"""
    
    with open(input_path, 'r', encoding='utf-8') as f:
        json_data = json.load(f)
    
    name = json_data.get('name', '')
    print(f"\n=== ファイル：{input_path} ===")
    print(f"名前：{name}")
    
    level_95 = extract_ascension_data_test(json_data, 95)
    print(f"Lv.95: {level_95}")
    
    level_100 = extract_ascension_data_test(json_data, 100)
    print(f" Lv.100: {level_100}")


if __name__ == '__main__':
    process_single_file('HoYoLAB/RawData/data/character/ja-jp/anemo_4_bow_Faruzan.json')