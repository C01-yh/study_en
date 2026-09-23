"""One-command bootstrap for the personal learning site."""
import argparse
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import threading
import urllib.request
import webbrowser

ROOT = Path(__file__).resolve().parent

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=5173)
    parser.add_argument('--no-browser', action='store_true')
    args = parser.parse_args()
    url = f'http://127.0.0.1:{args.port}'
    try:
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        with opener.open(url + '/api/health', timeout=1) as response:
            running = json.load(response)
        if running.get('app') == 'a-little-english' and running.get('version') == 2:
            print(f'网站已经运行：{url}', flush=True)
            if not args.no_browser: webbrowser.open(url)
            return
    except Exception:
        pass
    python = ROOT / '.venv' / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
    if not python.exists():
        print('首次启动：正在创建运行环境…', flush=True)
        subprocess.run([sys.executable, '-m', 'venv', str(ROOT / '.venv')], check=True)
    if Path(sys.prefix).resolve() != (ROOT / '.venv').resolve():
        raise SystemExit(subprocess.call([str(python), str(ROOT / 'launch.py'), *sys.argv[1:]]))
    if importlib.util.find_spec('edge_tts') is None:
        print('首次启动：正在安装自然语音组件，需要联网…', flush=True)
        subprocess.run([sys.executable, '-m', 'ensurepip', '--upgrade'], check=True)
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', str(ROOT / 'requirements.txt')], check=True)
    data = ROOT / 'data'
    data.mkdir(exist_ok=True)
    if not (data / 'dictionary.sqlite3').exists() or not (data / 'core.json').exists():
        source = data / 'ecdict.csv'
        if not source.exists():
            print('首次启动：正在下载完整词典（约 63 MB）…', flush=True)
            temp = source.with_suffix('.download')
            urllib.request.urlretrieve('https://raw.githubusercontent.com/skywind3000/ECDICT/master/ecdict.csv', temp)
            temp.replace(source)
        subprocess.run([sys.executable, str(ROOT / 'scripts/import_dictionary.py')], check=True)
    if not (data / 'exams.json').exists():
        subprocess.run([sys.executable, str(ROOT / 'scripts/build_collections.py')], check=True)
    if not args.no_browser:
        threading.Timer(1, lambda: webbrowser.open(url)).start()
    import server
    sys.argv = ['server.py', '--port', str(args.port)]
    server.main()

if __name__ == '__main__':
    try:
        main()
    except (subprocess.CalledProcessError, OSError) as exc:
        print(f'启动失败：{exc}\n请检查网络后重新运行。', file=sys.stderr)
        raise SystemExit(1)
