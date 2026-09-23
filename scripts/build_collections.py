"""Export every exam-tagged ECDICT entry, not just matches in the 6,000-word core."""
import json
from pathlib import Path
import sqlite3

DATA = Path(__file__).resolve().parent.parent / 'data'
TAGS = ['zk', 'gk', 'cet4', 'cet6', 'ky', 'ielts', 'toefl', 'gre']

def main():
    with sqlite3.connect(DATA / 'dictionary.sqlite3') as db:
        rows = db.execute("SELECT word,translation,phonetic,tag FROM words WHERE tag<>'' ORDER BY word COLLATE NOCASE").fetchall()
    entries = [{'word': w, 'meaning': meaning, 'phonetic': ipa, 'tags': tags}
               for w, meaning, ipa, tags in rows if set(tags.split()) & set(TAGS)]
    counts = {tag: sum(tag in entry['tags'].split() for entry in entries) for tag in TAGS}
    (DATA / 'exams.json').write_text(json.dumps(entries, ensure_ascii=False), encoding='utf-8')
    manifest = json.loads((DATA / 'manifest.json').read_text(encoding='utf-8'))
    manifest['examCounts'] = counts
    manifest['examUniqueCount'] = len(entries)
    manifest['examNote'] = '按 ECDICT 原有考试标签完整导出；不同词库可以重叠，不代表最新官方考试大纲。'
    (DATA / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(counts, ensure_ascii=False))

if __name__ == '__main__': main()
