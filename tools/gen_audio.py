"""Generate Edge TTS audio for writing samples, highlights and phrases.

Output:
  audio/<slug>.mp3      one mp3 per spoken text (single reading)
  src/data-audio.js     text-hash -> file path map, consumed by the site

Voice: en-GB-SoniaNeural (British female, same as the PET site) at rate -10%,
mono 32 kbps — identical settings to the word audio so the whole site sounds
consistent.

Key format: the map is keyed by a 10-char md5 of the spoken text, so the page
can look up any sentence without caring about its order or content.
"""
import asyncio, json, os, re, sys, hashlib, subprocess
import edge_tts

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, 'audio')
VOICE = 'en-GB-SoniaNeural'
RATE = '-10%'
CONCURRENCY = 5


def text_key(t):
    """Stable 10-char key for a spoken text."""
    return hashlib.md5(t.strip().encode('utf-8')).hexdigest()[:10]


def slug(t):
    base = re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')[:36] or 'a'
    return f'{base}-{text_key(t)[:6]}'


def compress(path):
    tmp = path + '.tmp.mp3'
    try:
        subprocess.run(
            ['ffmpeg', '-v', 'quiet', '-y', '-i', path, '-ac', '1', '-b:a', '32k', tmp],
            check=True, timeout=60,
        )
        if os.path.getsize(tmp) > 500:
            os.replace(tmp, path)
        elif os.path.exists(tmp):
            os.remove(tmp)
    except Exception:
        if os.path.exists(tmp):
            try:
                os.remove(tmp)
            except OSError:
                pass


async def synth(text, path, sem):
    async with sem:
        if os.path.exists(path) and os.path.getsize(path) > 500:
            return 'skip'
        for attempt in range(3):
            try:
                c = edge_tts.Communicate(text, VOICE, rate=RATE)
                buf = bytearray()
                async for ch in c.stream():
                    if ch['type'] == 'audio':
                        buf += ch['data']
                if len(buf) < 500:
                    raise RuntimeError('too small')
                with open(path, 'wb') as f:
                    f.write(buf)
                compress(path)
                return 'ok'
            except Exception as e:
                if attempt == 2:
                    return 'fail:' + type(e).__name__
                await asyncio.sleep(1.5 * (attempt + 1))


def collect_texts():
    """Read the JS data files and pull out every text that gets spoken."""
    texts = []
    # 词库：1656 个词条（单词/短语本身就是要朗读的文本）
    wd = open(os.path.join(ROOT, 'src', 'data-words.js'), encoding='utf-8').read()
    for m in re.finditer(r'\{"w":"((?:[^"\\]|\\.)*)"', wd):
        w = m.group(1).replace('\\"', '"').replace('\\\\', '\\')
        if w:
            texts.append(w)
    # writing samples: model (full text) + each highlight.en
    w = open(os.path.join(ROOT, 'src', 'data-writing.js'), encoding='utf-8').read()
    for m in re.finditer(r"model: `([^`]+)`", w):
        texts.append(m.group(1).strip())
    for m in re.finditer(r"\{ en: '((?:[^'\\]|\\.)*)', zh:", w):
        s = m.group(1).replace("\\'", "'")
        if len(s) > 8:
            texts.append(s)
    # writing phrases: each item.en
    g = open(os.path.join(ROOT, 'src', 'data-writing-guide.js'), encoding='utf-8').read()
    for m in re.finditer(r"\{ en: '((?:[^'\\]|\\.)*)', zh:", g):
        s = m.group(1).replace("\\'", "'")
        if len(s) > 8:
            texts.append(s)
    # de-dup, keep order
    seen, out = set(), []
    for t in texts:
        k = t.strip()
        if k and k not in seen:
            seen.add(k)
            out.append(k)
    return out


async def main():
    texts = collect_texts()
    os.makedirs(OUT, exist_ok=True)
    print(f'待生成 {len(texts)} 条朗读内容')

    targets = [(t, os.path.join(OUT, slug(t) + '.mp3')) for t in texts]
    sem = asyncio.Semaphore(CONCURRENCY)
    t0 = asyncio.get_event_loop().time()
    results = await asyncio.gather(*[synth(t, p, sem) for t, p in targets])

    ok = sum(1 for r in results if r == 'ok')
    skip = sum(1 for r in results if r == 'skip')
    fail = [(tg[0][:40], r) for tg, r in zip(targets, results) if r.startswith('fail')]
    print(f'新生成 {ok} | 跳过 {skip} | 失败 {len(fail)} | 耗时 {asyncio.get_event_loop().time()-t0:.0f}s')
    for t, r in fail[:10]:
        print('  FAIL', t, r)

    mp = {}
    for t, p in targets:
        if os.path.exists(p) and os.path.getsize(p) > 500:
            mp[t.strip()] = 'audio/' + os.path.basename(p)
    with open(os.path.join(ROOT, 'src', 'data-audio.js'), 'w', encoding='utf-8') as f:
        f.write('/* 自动生成 — tools/gen_audio.py；请勿手改 */\n')
        f.write('/* Edge TTS en-GB-SoniaNeural, rate -10%, mono 32kbps */\n')
        f.write('/* key = 朗读原文（trim 后），value = mp3 路径 */\n')
        f.write('export const AUDIO = ' + json.dumps(mp, ensure_ascii=False, separators=(',', ':')) + ';\n')
    total = sum(os.path.getsize(p) for t, p in targets if os.path.exists(p))
    print(f'音频总计 {total/1024/1024:.1f}MB，条目 {len(mp)}/{len(targets)}')
    return 0 if not fail else 1


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
