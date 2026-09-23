"""Prepare the first lesson's neural voice clips for immediate playback."""
import asyncio
import hashlib
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from server import CACHE, synthesize

async def main():
    CACHE.mkdir(exist_ok=True)
    texts = ['I', 'want', 'water', 'please', 'thanks', 'I want water, please.', 'Hello. Take your time. I want water, please.']
    jobs = [(text, 'jenny', speed) for text in texts for speed in ['slow','normal']]
    jobs += [('Hello. Take your time. I want water, please.', 'sonia', 'slow')]
    limit = asyncio.Semaphore(1)
    async def one(text, voice, speed):
        key = hashlib.sha256(f'v1|{voice}|{speed}|{text}'.encode()).hexdigest()
        path = CACHE / f'{key}.mp3'
        async with limit:
            if not path.exists(): await synthesize(text, voice, speed, path)
            print(f'{voice} {speed}: {text} ({path.stat().st_size} bytes)', flush=True)
    await asyncio.gather(*(one(*job) for job in jobs))

if __name__ == '__main__': asyncio.run(main())
