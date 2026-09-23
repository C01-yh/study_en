import json
from pathlib import Path
import sqlite3
import sys
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from server import dictionary, DB, ROOT

class DictionaryTests(unittest.TestCase):
    def test_count_and_pagination(self):
        expected = json.loads((ROOT / 'data/manifest.json').read_text())['dictionaryCount']
        result = dictionary()
        self.assertEqual(result['total'], expected)
        self.assertEqual(len(result['items']), 24)
        self.assertNotEqual(result['items'][0]['word'], dictionary(page=2)['items'][0]['word'])

    def test_search_english_and_chinese(self):
        self.assertTrue(any(w['word'] == 'apple' for w in dictionary('apple')['items']))
        result = dictionary('苹果')
        self.assertGreater(result['total'], 0)
        self.assertTrue(all('苹果' in w['translation'] for w in result['items']))

    def test_queries_are_literals(self):
        self.assertEqual(dictionary("x' OR 1=1 --")['total'], 0)
        self.assertLess(dictionary('%')['total'], 100)
        self.assertLess(dictionary('_')['total'], 100)

if __name__ == '__main__': unittest.main()
