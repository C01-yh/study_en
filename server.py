"""Local English learning server. Run .venv/bin/python server.py."""
from __future__ import annotations
import argparse
import asyncio
import hashlib
import json
import mimetypes
import os
from pathlib import Path
import re
import sqlite3
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, unquote, urlparse

ROOT = Path(__file__).resolve().parent
DB = ROOT / 'data/dictionary.sqlite3'
CACHE = ROOT / 'audio-cache'
VOICES = {'jenny': 'en-US-JennyNeural', 'sonia': 'en-GB-SoniaNeural'}
TTS_LIMIT = threading.BoundedSemaphore(3)

def dictionary(query='', page=1, limit=24):
    with sqlite3.connect(f'file:{DB}?mode=ro', uri=True) as db:
        db.row_factory = sqlite3.Row
        query = query.strip()[:80]
        # Prefix search can use the case-insensitive index; Chinese searches are bounded.
        if query:
            escaped = query.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_')
            column = 'translation' if re.search(r'[\u4e00-\u9fff]', query) else 'word'
            pattern = f'%{escaped}%' if column == 'translation' else escaped + '%'
            where, args = f"WHERE {column} LIKE ? ESCAPE '\\'", [pattern]
        else:
            where, args = '', []
        total = db.execute(f'SELECT count(*) FROM words {where}', args).fetchone()[0]
        rows = db.execute(f'SELECT word,phonetic,translation,tag,exchange FROM words {where} ORDER BY word COLLATE NOCASE LIMIT ? OFFSET ?', [*args, limit, (page-1)*limit]).fetchall()
        return {'total': total, 'page': page, 'items': [dict(row) for row in rows]}

async def synthesize(text, voice, speed, target):
    import edge_tts
    temp = target.with_suffix(f'.{threading.get_ident()}.tmp')
    try:
        for attempt in range(3):
            try:
                await asyncio.wait_for(edge_tts.Communicate(text, VOICES[voice], rate='-25%' if speed == 'slow' else '-8%', pitch='-2Hz', volume='-5%').save(str(temp)), timeout=15)
                break
            except Exception:
                if attempt == 2:
                    raise
                await asyncio.sleep(0.5 * (attempt + 1))
        if temp.stat().st_size < 100:
            raise RuntimeError('Empty audio')
        os.replace(temp, target)
    finally:
        temp.unlink(missing_ok=True)

class Handler(BaseHTTPRequestHandler):
    def send_bytes(self, payload, content_type, status=200, cache=False):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(payload)))
        self.send_header('Cache-Control', 'public, max-age=31536000, immutable' if cache else 'no-cache')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        try:
            self.wfile.write(payload)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def json(self, data, status=200):
        self.send_bytes(json.dumps(data, ensure_ascii=False).encode(), 'application/json; charset=utf-8', status)

    def do_GET(self):
        url = urlparse(self.path)
        params = parse_qs(url.query)
        get = lambda key, default='': params.get(key, [default])[0]
        try:
            if url.path == '/api/health':
                self.json({'app': 'a-little-english', 'version': 2, 'dictionary': DB.exists()})
            elif url.path == '/api/dictionary':
                if not DB.exists():
                    return self.json({'error': '词典未导入，请运行启动脚本完成初始化。'}, 503)
                page = max(1, min(100000, int(get('page', '1'))))
                self.json(dictionary(get('q'), page))
            elif url.path == '/api/audio':
                text, voice, speed = get('text').strip(), get('voice', 'jenny'), get('speed', 'slow')
                if not text or len(text) > 250 or voice not in VOICES or speed not in ('slow', 'normal'):
                    return self.json({'error': '不支持的朗读请求。'}, 400)
                key = hashlib.sha256(f'v1|{voice}|{speed}|{text}'.encode()).hexdigest()
                CACHE.mkdir(exist_ok=True)
                target = CACHE / f'{key}.mp3'
                if not target.exists():
                    if not TTS_LIMIT.acquire(timeout=2):
                        return self.json({'error': '声音正在准备，请稍后重试。'}, 429)
                    try:
                        if not target.exists():
                            asyncio.run(synthesize(text, voice, speed, target))
                    except Exception as exc:
                        print(f'Audio unavailable: {type(exc).__name__}: {exc}', flush=True)
                        return self.json({'error': '自然女声暂时无法连接。请检查网络，或在设置中选择设备声音。'}, 503)
                    finally:
                        TTS_LIMIT.release()
                self.send_bytes(target.read_bytes(), 'audio/mpeg', cache=True)
            else:
                path = unquote(url.path).lstrip('/') or 'index.html'
                allowed = {'index.html', 'styles.css', 'app.js', 'audio-cache.mjs', 'model.mjs', 'curriculum.js', 'data/core.json', 'data/exams.json', 'data/manifest.json', 'data/ECDICT-LICENSE.txt'}
                if path not in allowed or not (ROOT / path).is_file():
                    return self.json({'error': '页面不存在。'}, 404)
                mime = 'application/javascript' if path.endswith(('.js', '.mjs')) else mimetypes.guess_type(path)[0] or 'application/octet-stream'
                self.send_bytes((ROOT / path).read_bytes(), mime + ('; charset=utf-8' if mime.startswith('text/') or 'javascript' in mime or 'json' in mime else ''))
        except (ValueError, OverflowError):
            self.json({'error': '请求参数无效。'}, 400)
        except Exception as exc:
            print(f'Request failed: {type(exc).__name__}: {exc}', flush=True)
            self.json({'error': '本地服务暂时遇到问题，请重试。'}, 500)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=5173)
    args = parser.parse_args()
    try:
        server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    except OSError:
        print(f'端口 {args.port} 已被使用。若是旧版预览，请先在其终端按 Ctrl+C，再重新启动。也可以加 --port 5174。')
        raise SystemExit(1)
    print(f'一点英语已启动：http://127.0.0.1:{args.port}  （按 Ctrl+C 停止）', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == '__main__':
    main()
