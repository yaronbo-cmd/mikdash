#!/usr/bin/env python3
"""recovery R1 — map build 15's modules onto the 26c bundle.
usage: python3 -I recovery/tools/modmap.py   (reads recovery/work/{u15m,u15,u26c}.json from units.mjs, content/*.json)
writes recovery/work/modmap.json and prints a summary.

15 side: u15m (marked build) gives each unit its source path; its labels are carried onto u15 (the plain build, which is
byte-identical to what build.mjs ships) by aligning the two unit-hash sequences. 26c side: each esbuild lazy-ESM wrapper
ends exactly one module, so the wrapped part of the bundle is already cut into modules; they are aligned in order with
build 15's modules by a DP over a similarity score (shared unit hashes by bytes, then shared stable tokens). The unwrapped
tail (main.js and its static imports) is labelled unit by unit by aligning its unit hashes with build 15's tail.
"""
import json, os, re, sys
from collections import Counter, defaultdict
from difflib import SequenceMatcher

W = '/home/claude/temple3d/recovery/work/'
ROOT = '/home/claude/temple3d/'
u15m = json.load(open(W + 'u15m.json'))
u15 = json.load(open(W + 'u15.json'))
u26 = json.load(open(W + 'u26c.json'))
js15 = open(W + 'x15/app.stub.js', encoding='utf-8').read()
js26 = open(W + 'x26c/app.stub.js', encoding='utf-8').read()

# ── B. carry the marked build's labels onto the plain build ──
M, P = u15m['units'], u15['units']
sm = SequenceMatcher(None, [u['h'] for u in M], [u['h'] for u in P], autojunk=False)
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == 'equal' or tag == 'replace':
        for k in range(j2 - j1):
            P[j1 + k]['label'] = M[min(i1 + k * max(1, (i2 - i1)) // max(1, (j2 - j1)), i2 - 1)]['label'] if i2 > i1 else None
    elif tag == 'insert':
        for k in range(j1, j2): P[k]['label'] = P[k - 1]['label'] if k else None

# ── C. content JSON files and the GLB ──
def strings_of(o, acc):
    if isinstance(o, str):
        if len(o) >= 6: acc.add(o)
    elif isinstance(o, list):
        for x in o: strings_of(x, acc)
    elif isinstance(o, dict):
        for x in o.values(): strings_of(x, acc)
    return acc
JSONS = {}
for f in sorted(os.listdir(ROOT + 'content')):
    if f.endswith('.json'):
        try: JSONS['content/' + f] = strings_of(json.load(open(ROOT + 'content/' + f, encoding='utf-8')), set())
        except Exception: pass
def unit_strings(units):
    s = set()
    for u in units:
        for t in u['st']:
            if t[:1] == '"':
                try: s.add(json.loads(t))
                except Exception: pass
    return s
def json_guess(units):
    ss = unit_strings(units)
    if any(isinstance(x, str) and x.startswith('__R1_ASSET_') for x in ss): return 'assets/kohen.glb', 1.0
    best, bs = None, 0
    for f, js in JSONS.items():
        if not js: continue
        n = len(ss & js)
        sc = n / max(1, min(len(ss), len(js)))
        if n >= 3 and sc > bs: best, bs = f, sc
    return best, bs

# ── D. build 15's modules: wrapped segments are modules; the unwrapped tail is cut by unit labels ──
def mods_of(U, segs, labelled):
    mods = []
    for s in segs:
        units = U[s['from']:s['to'] + 1]
        if s['wrap'] in ('esm', 'cjs') or not labelled:
            if labelled:
                lab = Counter(u['label'] for u in units if u.get('label')).most_common(1)
                lab = lab[0][0] if lab else None
            else: lab = None
            mods.append({'units': units, 'label': lab, 'wrap': s['wrap'], 'seg': s['seg']})
        else:  # the unwrapped tail: contiguous runs of one label
            run, cur = [], object()
            for u in units:
                if u.get('label') != cur and run:
                    mods.append({'units': run, 'label': cur, 'wrap': 'top', 'seg': s['seg']}); run = []
                cur = u.get('label'); run.append(u)
            if run: mods.append({'units': run, 'label': cur, 'wrap': 'top', 'seg': s['seg']})
    return mods
mods15 = mods_of(P, u15['segs'], True)
for m in mods15:
    if not m['label']:
        g, sc = json_guess(m['units'])
        m['label'] = g or ('(unlabelled:%s)' % (m['units'][0]['st'][:3],))
        m['guess'] = True
# fold tiny unlabelled runs of the tail (esbuild's namespace objects / hoisted bare vars) into the module after them
def tiny(m): return m.get('guess') and m['wrap'] == 'top' and not m['label'].startswith(('content/', 'assets/')) and sum(u['len'] for u in m['units']) < 600
folded, pend = [], []
for m in mods15:
    if tiny(m): pend.extend(m['units']); continue
    if pend: m['units'] = pend + m['units']; pend = []
    folded.append(m)
if pend: folded[-1]['units'] += pend
mods15 = folded

def summarize(m):
    m['bytes'] = sum(u['len'] for u in m['units'])
    m['hc'] = Counter()
    for u in m['units']: m['hc'][u['h']] += 1
    m['hlen'] = {u['h']: u['len'] for u in m['units']}
    st = set()
    for u in m['units']: st.update(u['st'])
    m['st'] = st
    m['start'] = m['units'][0]['start']; m['end'] = max(u['end'] for u in m['units'])
for m in mods15: summarize(m)

# ── E/G. 26c's modules: wrapped segments, then the tail labelled by alignment with 15's tail ──
U26 = u26['units']
segs26 = u26['segs']
wrapped26 = [s for s in segs26 if s['wrap'] in ('esm', 'cjs')]
tail26 = [s for s in segs26 if s['wrap'] not in ('esm', 'cjs')]
mods26 = [{'units': U26[s['from']:s['to'] + 1], 'wrap': s['wrap'], 'seg': s['seg']} for s in wrapped26]
tail15_units = [u for m in mods15 if m['wrap'] == 'top' for u in m['units']]
lab15 = {}
for m in mods15:
    for u in m['units']: lab15[u['i']] = m['label']
tail26_units = [u for s in tail26 for u in U26[s['from']:s['to'] + 1]]
sm = SequenceMatcher(None, [u['h'] for u in tail15_units], [u['h'] for u in tail26_units], autojunk=False)
tl = [None] * len(tail26_units); tstat = [None] * len(tail26_units)
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    for k in range(j1, j2):
        if tag == 'equal': tl[k] = lab15[tail15_units[i1 + k - j1]['i']]; tstat[k] = 'same'
        elif tag == 'replace':
            # the most similar replaced 15 unit by stable tokens
            st = set(tail26_units[k]['st']); best, bs = None, 0
            for q in range(i1, i2):
                o = set(tail15_units[q]['st']); sc = len(st & o) / max(1, len(st | o))
                if sc > bs: best, bs = q, sc
            if best is not None and bs >= 0.3: tl[k] = lab15[tail15_units[best]['i']]; tstat[k] = 'changed'
            else: tstat[k] = 'new'
        else: tstat[k] = 'new'
# new tail units take the label of their neighbours when both sides agree, else stay new (a candidate new module)
for k in range(len(tl)):
    if tl[k] is None:
        p = next((tl[q] for q in range(k - 1, -1, -1) if tl[q]), None)
        n = next((tl[q] for q in range(k + 1, len(tl)) if tl[q]), None)
        tl[k] = p if p == n and p else ('NEW?(%s|%s)' % (p, n))
run, cur = [], object()
for k, u in enumerate(tail26_units):
    if tl[k] != cur and run:
        mods26.append({'units': run, 'wrap': 'top', 'tlabel': cur}); run = []
    cur = tl[k]; run.append(u); u['tstat'] = tstat[k]
if run: mods26.append({'units': run, 'wrap': 'top', 'tlabel': cur})
for m in mods26: summarize(m)

# ── F. align the module sequences (DP) ──
def sim(a, b):
    inter = 0
    for h, c in (a['hc'] & b['hc']).items(): inter += c * a['hlen'][h]
    exact = inter / max(1, max(a['bytes'], b['bytes']))
    contain = inter / max(1, a['bytes'])  # share of the 15 module still present verbatim
    jac = len(a['st'] & b['st']) / max(1, len(a['st'] | b['st']))
    return max(exact, contain * 0.95, jac * 0.9), exact, contain, jac
A, B = mods15, mods26
n, mm = len(A), len(B)
S = {}
for i in range(n):
    for j in range(mm):
        if (A[i]['wrap'] == 'top') != (B[j]['wrap'] == 'top'): continue
        if B[j]['wrap'] == 'top' and B[j].get('tlabel') and not str(B[j]['tlabel']).startswith('NEW?') and B[j]['tlabel'] != A[i]['label']: continue
        s = sim(A[i], B[j])
        if s[0] >= 0.12: S[(i, j)] = s
dp = [[0.0] * (mm + 1) for _ in range(n + 1)]
bk = [[None] * (mm + 1) for _ in range(n + 1)]
for i in range(n + 1):
    for j in range(mm + 1):
        if i == 0 and j == 0: continue
        best, how = -1, None
        if i > 0 and dp[i - 1][j] > best: best, how = dp[i - 1][j], 'a'
        if j > 0 and dp[i][j - 1] > best: best, how = dp[i][j - 1], 'b'
        if i > 0 and j > 0 and (i - 1, j - 1) in S and dp[i - 1][j - 1] + S[(i - 1, j - 1)][0] > best:
            best, how = dp[i - 1][j - 1] + S[(i - 1, j - 1)][0], 'ab'
        dp[i][j], bk[i][j] = best, how
pairs = {}
i, j = n, mm
while i > 0 or j > 0:
    h = bk[i][j]
    if h == 'ab': pairs[i - 1] = j - 1; i -= 1; j -= 1
    elif h == 'a': i -= 1
    else: j -= 1
rev = {v: k for k, v in pairs.items()}

# ── F2. a second pass, order-free: an unpaired 15 module and an unpaired 26c module that are clearly the same file
#        (it moved: game/audio.js joined the lazy graph in 26c when avodah/sound.js began to import it; walk.js is
#        imported earlier now) ──
moved = set()
for i in range(n):
    if i in pairs: continue
    best, bs = None, 0
    for j in range(mm):
        if j in rev: continue
        s_ = sim(A[i], B[j])
        if s_[0] > bs: best, bs = j, s_[0]
    if best is not None and bs >= 0.3:
        pairs[i] = best; rev[best] = i; S[(i, best)] = sim(A[i], B[best]); moved.add(i)

# the new modules of builds 16–26c, named by a literal only they hold (the file names are the build reports'; the two
# marked '?' are not named anywhere that survived — the name is a proposal)
NEW_NAMES = [
    ('.f17-top{', 'src/avodah/shift/focus17.js', 'high'), ('.c18-till{', 'src/avodah/shift/fx18.js', 'high'),
    ('הכבש מומלח!', 'src/avodah/shift/ramp19.js', 'high'), ('.k20-r{', 'src/avodah/shift/kiyor20.js', 'high'),
    ('.d21-in{', 'src/avodah/shift/deshen21.js', 'high'), ('.m22-in{', 'src/avodah/shift/maaracha22.js', 'high'),
    ('.p23-c{', 'src/avodah/shift/pis23.js', 'high'), ('.p25-dk{', 'src/avodah/shift/pen25.js', 'high'),
    ('.hk26-v{', 'src/avodah/shift/heichal26.js', 'high'), ('mk.evlog', 'src/avodah/shift/evlog16.js ?', 'name: low'),
    ('runHys:', 'src/avodah/shift/gait.js ?', 'name: low'),
]

# ── H. status ──
def exact_bytes(a, b):
    inter = 0
    for h, c in (a['hc'] & b['hc']).items(): inter += c * a['hlen'][h]
    return inter
rows = []
for k, a in enumerate(A):
    j = pairs.get(k)
    if j is None:
        rows.append({'k15': k, 'label': a['label'], 'status': 'gone', 'bytes15': a['bytes']}); continue
    b = B[j]
    same = a['hc'] == b['hc']
    kept = exact_bytes(a, b)
    rows.append({'k15': k, 'j26': j, 'label': a['label'], 'status': 'unchanged' if same else 'changed', 'moved': k in moved, 'bytes15': a['bytes'], 'bytes26': b['bytes'],
                 'kept15': round(kept / max(1, a['bytes']), 3), 'new26': round(1 - exact_bytes(b, a) / max(1, b['bytes']), 3), 'sim': round(S[(k, j)][0], 3)})
    b['label'] = a['label']; b['status'] = rows[-1]['status']
newmods = [j for j in range(mm) if j not in rev]
TOK = re.compile(r'\b([a-z][a-z0-9]*?(?:1[6-9]|2[0-6])[a-z]?)\b')
for j in newmods:
    b = B[j]
    b['label'] = b.get('tlabel') if b.get('tlabel') and not str(b.get('tlabel')).startswith('NEW?') else None
    b['status'] = 'new'
    hints = Counter()
    for t in b['st']:
        for x in TOK.findall(t.lower()): hints[x] += 1
    css = Counter(re.findall(r'\.([a-z]+\d*)-[a-z]', ' '.join(t for t in b['st'] if t[:1] in '"`')))
    heb = [json.loads(t) for t in b['st'] if t[:1] == '"' and re.search('[א-ת]', t)][:3]
    b['hints'] = {'tokens': hints.most_common(8), 'css': css.most_common(5), 'he': heb, 'tlabel': b.get('tlabel')}
    for fp, name, conf in NEW_NAMES:
        if any(fp in t for t in b['st']): b['label'] = name; b['conf'] = conf; break

out = {'mods15': [{'k': k, 'label': m['label'], 'wrap': m['wrap'], 'bytes': m['bytes'], 'start': m['start'], 'end': m['end'], 'units': len(m['units'])} for k, m in enumerate(A)],
       'mods26': [{'j': j, 'label': m.get('label'), 'status': m.get('status'), 'wrap': m['wrap'], 'bytes': m['bytes'], 'start': m['start'], 'end': m['end'], 'units': len(m['units']), 'k15': rev.get(j), 'hints': m.get('hints'), 'conf': m.get('conf')} for j, m in enumerate(B)],
       'rows': rows}
json.dump(out, open(W + 'modmap.json', 'w'), ensure_ascii=False, indent=1)
c = Counter(r['status'] for r in rows)
print('15 modules', n, dict(c), '| 26c modules', mm, 'new', len(newmods))
for j in newmods:
    b = B[j]
    print('NEW 26c#%d %s %dB units=%d hints=%s' % (j, b['wrap'], b['bytes'], len(b['units']), json.dumps(b['hints'], ensure_ascii=False)[:400]))
