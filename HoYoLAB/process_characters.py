import os
import json
import re

def process_characters():
    # ディレクトリのパスを定義
    dir1 = "HoYoLAB/RawData/data/character/ja-jp"
    dir2 = "public/data/characters"

    # ディレクトリが存在するか確認
    if not os.path.exists(dir1) or not os.path.exists(dir2):
        print(os.getcwd())
        print("Error: 指定されたディレクトリのいずれかが存在しません。", dir1, dir2)
        return

    # dir1内のすべてのjsonファイルを取得
    files = [f for f in os.listdir(dir1) if f.endswith('.json')]

    for filename in sorted(files):
        path1 = os.path.join(dir1, filename)
        path2 = os.path.join(dir2, filename)

        # 両方のディレクトリに同じ名前のファイルが存在するか確認
        if os.path.exists(path2):
            with open(path1, 'r', encoding='utf-8') as f1:
                data1 = json.load(f1)
            
            with open(path2, 'r', encoding='utf-8') as f2:
                data2 = json.load(f2)

            # --- ここに中身を書く (ユーザーの処理をここに記述してください) ---
            print(f"Processing {filename}...")
            newDescMap = {}
            if 'modules' in data1:
                for module in data1['modules']:
                    if module['id'] == '4': # 天賦
                        if 'components' in module:
                            for component in module['components']:
                                if component['component_id'] == 'talent':
                                    for talent in component['data']['list']:
                                        newDescMap[talent.get('icon_url', 'Unknown')] = normalizeObject(talent.get('desc', ''))
                                        # print(f"  Talent: {talent.get('icon_url', 'Unknown')} - Desc: {talent.get('desc', 'No description')}")
                    if module['id'] == '5': # 命ノ星座
                        if 'components' in module:
                            for component in module['components']:
                                if component['component_id'] == 'summaryList':
                                    for talent in component['data']['list']:
                                        newDescMap[talent.get('icon_url', 'Unknown')] = normalizeObject(talent.get('desc', ''))
                                        # print(f"  Talent: {talent.get('icon_url', 'Unknown')} - Desc: {talent.get('desc', 'No description')}")
            if '通常攻撃' in data2:
                if '説明' in data2['通常攻撃']:
                    icon_url = re.sub('.*/', '', data2['通常攻撃'].get('icon_url', ''))
                    if (newDescMap.get(icon_url)):
                        data2['通常攻撃']['説明'] = newDescMap.get(icon_url)
                        print(f"  Updated description for {icon_url}", 
                              f"from {data2['通常攻撃']['説明']} to {newDescMap.get(icon_url)}")
            if '元素スキル' in data2:
                if '説明' in data2['元素スキル']:
                    icon_url = re.sub('.*/', '', data2['元素スキル'].get('icon_url', ''))
                    if (newDescMap.get(icon_url)):
                        data2['元素スキル']['説明'] = newDescMap.get(icon_url)
                        print(f"  Updated description for {icon_url}", 
                              f"from {data2['元素スキル']['説明']} to {newDescMap.get(icon_url)}")
            if '元素爆発' in data2:
                if '説明' in data2['元素爆発']:
                    icon_url = re.sub('.*/', '', data2['元素爆発'].get('icon_url', ''))
                    if (newDescMap.get(icon_url)):
                        data2['元素爆発']['説明'] = newDescMap.get(icon_url)
                        print(f"  Updated description for {icon_url}", 
                              f"from {data2['元素爆発']['説明']} to {newDescMap.get(icon_url)}")
            if '固有天賦' in data2:
                for talent in data2['固有天賦']:
                    if '説明' in talent:
                        icon_url = re.sub('.*/', '', talent.get('icon_url', ''))
                        if (newDescMap.get(icon_url)):
                            talent['説明'] = newDescMap.get(icon_url)
                            print(f"  Updated description for {icon_url}", 
                                  f"from {talent['説明']} to {newDescMap.get(icon_url)}")
            if '命ノ星座' in data2:
                for constellation in ['1', '2', '3', '4', '5', '6']:
                    if constellation in data2['命ノ星座']:
                        if '説明' in data2['命ノ星座'][constellation]:
                            icon_url = re.sub('.*/', '', data2['命ノ星座'][constellation].get('icon_url', ''))
                            if (newDescMap.get(icon_url)):
                                data2['命ノ星座'][constellation]['説明'] = newDescMap.get(icon_url)
                                print(f"  Updated description for {icon_url}", 
                                      f"from {data2['命ノ星座'][constellation]['説明']} to {newDescMap.get(icon_url)}")
            with open(path2, 'w', encoding='utf_8') as f:
                json.dump(data2, f, indent=4, ensure_ascii=False)
        else:
            print(f"ファイル {filename} は dir1 にはありますが、dir2 にはありません。")

def normalizeObject(d):
    if type(d) == str:
        while True:
            m = re.search('<custom-ruby data-ruby=\\"(.+?)\\"></custom-ruby>', d)
            if m == None:
                break
            custom_ruby = m.group(0)
            data_ruby = m.group(1)
            data_ruby = re.sub('([^|]+)\\|[^|]+\\|?', '\\1', data_ruby)
            d = d.replace(custom_ruby, data_ruby)
        d = re.sub('<br>$', '', d.replace('<p>', '').replace('</p>', '<br>')).replace('・', '·').replace('<br>·', '<br>・')
        return d
    if not isinstance(d, (dict, list)):
        return d
    if isinstance(d, list):
        return [v for v in (normalizeObject(v) for v in d)]
    result = {}
    for k, v in d.items():
        result[k] = normalizeObject(v)
    return result

if __name__ == "__main__":
    process_characters()