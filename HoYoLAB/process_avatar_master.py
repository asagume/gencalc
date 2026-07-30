import json

def process_json(data):
    if isinstance(data, dict):
        return {k: process_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        # Check if all elements are strings containing the URL
        if all(isinstance(item, str) and "act-webstatic.hoyoverse.com" in item for item in data):
            return []
        else:
            return [process_json(item) for item in data]
    elif isinstance(data, str):
        if "act-webstatic.hoyoverse.com" in data:
            return None
        else:
            return data
    else:
        return data

def main():
    input_path = 'public/data/HoyoAvatarMaster.json'
    output_path = 'public/data/HoyoAvatarMaster.json'
    
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        processed_data = process_json(data)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(processed_data, f, ensure_ascii=False, indent=2)
        
        print("Successfully processed the JSON file.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()