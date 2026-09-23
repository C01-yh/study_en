"""Import the entire ECDICT snapshot, and select 6,000 frequent learning words."""
import csv
import hashlib
import json
from pathlib import Path
import re
import sqlite3

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'data'

def main():
    source = DATA / 'ecdict.csv'
    target = DATA / 'dictionary.sqlite3'
    temp = DATA / 'dictionary.build.sqlite3'
    temp.unlink(missing_ok=True)
    db = sqlite3.connect(temp)
    db.execute('CREATE TABLE words(word TEXT PRIMARY KEY COLLATE NOCASE, phonetic TEXT, translation TEXT, tag TEXT, exchange TEXT)')
    candidates = []
    def number(value):
        try: return int(value or '0')
        except ValueError: return 0
    with source.open(encoding='utf-8-sig', newline='') as file:
        for row in csv.DictReader(file):
            word = row['word'].strip()
            if not word: continue
            translation = row['translation'].replace('\\n', '\n').strip()
            db.execute('INSERT OR IGNORE INTO words VALUES (?,?,?,?,?)', (word, row['phonetic'], translation, row['tag'], row['exchange']))
            if not re.fullmatch(r'[a-z]+(?:-[a-z]+)?', word) or not re.search(r'[\u4e00-\u9fff]', translation): continue
            frq, bnc = number(row['frq']), number(row['bnc'])
            if not frq and not bnc: continue
            score = min(frq or 999999, bnc or 999999)
            candidates.append((score, word, {'word': word, 'meaning': translation, 'phonetic': row['phonetic'], 'tags': row['tag']}))
    total = db.execute('SELECT count(*) FROM words').fetchone()[0]
    db.commit(); db.close(); temp.replace(target)
    seen, core = set(), []
    for _, word, item in sorted(candidates):
        if word in seen: continue
        seen.add(word); core.append(item)
        if len(core) == 6000: break
    (DATA / 'core.json').write_text(json.dumps(core, ensure_ascii=False), encoding='utf-8')
    manifest = {'source': 'ECDICT', 'url': 'https://github.com/skywind3000/ECDICT', 'license': 'MIT', 'dictionaryCount': total, 'coreCount': len(core), 'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'selection': '按 ECDICT 的 frq/bnc 较小正数排序，筛选有中文释义的英文词；不是 CEFR 官方等级。'}
    (DATA / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Imported {total:,} dictionary entries; {len(core):,} frequent learning words.')
    from build_collections import main as build_collections
    build_collections()

if __name__ == '__main__': main()
