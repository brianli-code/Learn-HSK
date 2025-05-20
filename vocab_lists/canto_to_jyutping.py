import requests
from bs4 import BeautifulSoup

import csv
import json

def get_canto(word):
    url = f"https://cantonese.org/search.php?q={word}"
    r = requests.get(url)
    soup = BeautifulSoup(r.text, 'html.parser')
    
    # Get hanzi
    h3 = soup.find("h3", class_="resulthead")
    h3_str = str(h3)
    print("h3: ", h3)
    if not h3:
        return None
    
    # Find first '>' and second '<' to get Hanzi
    start = h3_str.find('>') + 1
    end = h3_str.find('<', start)
    hanzi = h3_str[start:end].strip()
    
    # Correct parentheses
    hanzi = hanzi.replace("〔", " (").replace("〕", ")")
    
    # Get jyutping
    # Locate the correct <small> element that contains the jyutping
    small_tags = soup.find_all("small")
    if not small_tags:
        return None
    print(small_tags)
    
    tag = small_tags[0]
    print("tag: ", tag)
    
    # Get the <strong> inside the correct <small>
    strong_tag = tag.find("strong")
    print("strong tag: ", strong_tag)
    
    jyutping = ''
    if strong_tag:
        # Build jyutping with tone numbers
        for elem in strong_tag.contents:
            if isinstance(elem, str):
                jyutping += elem
            elif elem.name == 'sup':
                jyutping += elem.text
            else:
                jyutping += elem.get_text()
    
    print("hanzi: ", hanzi)
    print("jyutping: ", jyutping)
    
    return {"jyutping": jyutping, "hanzi": hanzi}

# print(get_canto("愛好"))  # Expected: oi3 hou3

def build_json(hsk_version):
    csv_path = f"./hsk_csv/hsk{hsk_version}.csv"
    output_path = f"./hsk{hsk_version}_with_cantonese.json"
    results = []
    
    with open(csv_path, encoding='utf-8') as f:
        reader = csv.reader(f)
        for row in reader:
            # skip malformed lines
            if len(row) < 3:
                continue
            hanzi, pinyin, english = row[0].strip(), row[1].strip(), row[2].strip()

            # Get Cantonese info
            canto_data = get_canto(hanzi)
            if not canto_data:
                print(f"Skipping {hanzi}: Cantonese data not found")
                continue

            entry = {
                "hanzi": hanzi,
                "pinyin": pinyin,
                "english": english,
                "cantonese": canto_data
            }

            results.append(entry)
            print(f"Added result for {hanzi}")

    # Save to JSON
    with open(output_path, 'w', encoding='utf-8') as f_out:
        json.dump(results, f_out, ensure_ascii=False, indent=2)

    print(f"✅ Saved {len(results)} entries to {output_path}")

build_json(hsk_version=4)