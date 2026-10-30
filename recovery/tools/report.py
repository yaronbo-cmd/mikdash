#!/usr/bin/env python3
"""recovery R1 — the module tables of R1-map.md, from modmap.json, moddiff.json and the prettified files' ranges.
usage: python3 -I recovery/tools/report.py [R1-map.md]  → replaces the block between <!-- TABLES:BEGIN --> and
<!-- TABLES:END --> in the given file (default recovery/R1-map.md), or prints the tables when the markers are absent."""
import json, os, sys
W = '/home/claude/temple3d/recovery/work/'
ROOT = '/home/claude/temple3d/'
d = json.load(open(W + 'modmap.json'))
md = {x['label']: x for x in json.load(open(W + 'moddiff.json'))}
R26 = {x['id']: x for x in json.load(open(W + 'p26c.ranges.json'))}
R15 = {x['id']: x for x in json.load(open(W + 'p15.ranges.json'))}
rows = {r['label']: r for r in d['rows']}
# ── R2/R3 ── the recovery column: the live parity verdict (recovery/work/parity-all.json, from parity.mjs --all --json) and the
# notes of recovery/status.json
PAR = {}
if os.path.exists(W + 'parity-all.json'):
    PAR = {x['label']: x['verdict'] for x in json.load(open(W + 'parity-all.json'))['results']}
NOTE = json.load(open(ROOT + 'recovery/status.json', encoding='utf-8')) if os.path.exists(ROOT + 'recovery/status.json') else {}
# ── R4 ── R1's labels of the new modules → the names the recovery gave them (recovery/tools/names26c.json, as plib.refSide reads it)
ALIAS = json.load(open(ROOT + 'recovery/tools/names26c.json', encoding='utf-8')) if os.path.exists(ROOT + 'recovery/tools/names26c.json') else {}
def rec(label):
    lab = ALIAS.get(label or '', label or '').replace(' ?', '')
    v, n = PAR.get(lab), NOTE.get(lab)
    if not v and not n: return '—'
    return ' — '.join(x for x in [v, n] if x).replace('|', '¦')
SMALL = 60  # tokens: a change this small is a one-line edit

def conf_changed(r):
    # the identification is by position in esbuild's module order plus shared literals; sim (0…1) says how much it changed
    if r.get('moved'): return 'high — moved in the order, matched by content (sim %.2f)' % r['sim']
    return 'high (sim %.2f)' % r['sim'] if r['sim'] >= 0.7 else 'high — in place, rewritten (sim %.2f, ×%.1f size)' % (r['sim'], r['bytes26'] / max(1, r['bytes15']))

out = []
# ── A. the changed modules ──
out.append('### A. Changed in 26c (25 of build 15\'s modules)\n')
out.append('Δ tokens = the normalized token diff (local names ignored): + inserted / − deleted. Lines = prettified (recovery/work/p26c.pretty.js, p15.pretty.js).\n')
out.append('| module | recovery (parity · status) | min bytes 15 → 26c | Δ tokens | 15 lines | 26c lines | 26c line range | confidence | what changed (literals only 26c has) |')
out.append('|---|---|---|---|---|---|---|---|---|')
ch = [r for r in d['rows'] if r['status'] == 'changed']
ch.sort(key=lambda r: -(md[r['label']]['ins'] + md[r['label']]['del']))
for r in ch:
    x = md[r['label']]; a = R26['26c#%d' % r['j26']]; b = R15['15#%d' % r['k15']]
    lits = [l for l in x['add'] if l[:1] in '"`' or l.endswith(':') or l.startswith('.')]
    note = ', '.join(l.replace('|', '¦').replace('\n', ' ')[:38] for l in lits[:7])
    out.append('| `%s` | %s | %s → %s | +%d / −%d | %d | %d | %d–%d | %s | %s |' % (r['label'], rec(r['label']), f"{r['bytes15']:,}", f"{r['bytes26']:,}", x['ins'], x['del'], b['lines'], a['lines'], a['from'], a['to'], conf_changed(r), note))
# ── B. the new modules ──
out.append('\n### B. In 26c with no build-15 source (the code of builds 16–26c)\n')
out.append('| module (name from the build reports) | recovery (parity · status) | min bytes | 26c lines | 26c line range | confidence | fingerprint |')
out.append('|---|---|---|---|---|---|---|')
FP = {'focus17': '`.f17-*` CSS, "focus17" log tag', 'fx18': '`.c18-*` CSS, coin18', 'ramp19': '"הכבש מומלח!", salt19, r19/gh19', 'kiyor20': '`.k20-*` CSS, rush20', 'deshen21': '`.d21-*` CSS, scrape21', 'maaracha22': '`.m22-*` CSS, pyre22/band22', 'pis23': '`.p23-*` CSS, lot23/npc23', 'pen25': '`.p25-*` CSS, torch25/hoof25', 'heichal26': '`.hk26-*` CSS, gate26/pour26', 'evlog16': '"mk.evlog" localStorage key, `{v:16,…}`, hud.js\'s "העתק לוג"', 'gait': '`walkAt/runAt/runHys`, Walking_A/Running_A (taken out of hero35.js)'}
for m in d['mods26']:
    if m['status'] != 'new': continue
    a = R26['26c#%d' % m['j']]
    lab = m['label'] or '(esbuild glue: one init_x() call)'
    if ALIAS.get(lab, lab).replace(' ?', '') != lab.replace(' ?', ''): lab += '` → `' + ALIAS[lab]   # (R4: the recovery's file name)
    key = next((k for k in FP if k in (m['label'] or '')), None)
    conf = 'high' if m.get('conf') == 'high' else ('content high, name LOW (proposed)' if m.get('conf') else 'n/a')
    out.append('| `%s` | %s | %s | %d | %d–%d | %s | %s |' % (lab, rec(m['label']), f"{m['bytes']:,}", a['lines'], a['from'], a['to'], conf, FP.get(key, '—')))
# ── C. every build-15 source file ──
out.append('\n### C. Every file of build 15\'s src/ (227) — its fate in 26c\n')
out.append('unchanged = the 26c bundle holds code that normalizes identically (same units, same order) → keep the build-15 file as is. Line ranges are in recovery/work/p26c.pretty.js.\n')
out.append('| src file | status | recovery (parity · status) | 26c lines | 26c line range | confidence |')
out.append('|---|---|---|---|---|---|')
files = sorted(os.path.join(dp, f)[len(ROOT):] for dp, dn, fn in os.walk(ROOT + 'src') for f in fn if f.endswith('.js'))
cnt = {}
for f in files:
    r = rows.get(f)
    if not r and f in PAR:   # ── R4 ── a file the recovery added (one of table B's new modules)
        st, ln, rg, cf = 'new in 26c — recovered (not a build-15 file; see table B)', '—', '—', 'high'
    elif not r:
        st, ln, rg, cf = 'not in build 15\'s bundle (no importer) — nothing in 26c either', '—', '—', 'high'
    else:
        a = R26['26c#%d' % r['j26']] if 'j26' in r else None
        st = r['status'] + (' (moved)' if r.get('moved') else '')
        if r['status'] == 'changed':
            x = md[f]; st += ' +%d/−%d tok' % (x['ins'], x['del'])
        ln, rg = (str(a['lines']), '%d–%d' % (a['from'], a['to'])) if a else ('—', '—')
        cf = 'high' if r['status'] == 'unchanged' else conf_changed(r)
    cnt[st.split(' ')[0]] = cnt.get(st.split(' ')[0], 0) + 1
    out.append('| `%s` | %s | %s | %s | %s | %s |' % (f, st, rec(f) if r or f in PAR else '—', ln, rg, cf))
# ── D. the rest of the bundle ──
out.append('\n### D. The rest of the bundle (not src/)\n')
oth = {}
for r in d['rows']:
    if r['label'].startswith('src/'): continue
    k = 'three.js r186 + addons (node_modules)' if r['label'].startswith('node_modules') else 'content/*.json' if r['label'].startswith('content/') else r['label']
    oth.setdefault(k, []).append(r)
out.append('| part | modules | status |')
out.append('|---|---|---|')
for k, v in oth.items():
    out.append('| %s | %d | %s |' % (k, len(v), ', '.join(sorted(set(r['status'] for r in v)))))
text = '\n'.join(out) + '\n'
dst = sys.argv[1] if len(sys.argv) > 1 else ROOT + 'recovery/R1-map.md'
if os.path.exists(dst):
    s = open(dst, encoding='utf-8').read()
    a, b = s.find('<!-- TABLES:BEGIN -->'), s.find('<!-- TABLES:END -->')
    if a >= 0 and b > a:
        s = s[:a] + '<!-- TABLES:BEGIN -->\n' + text + s[b:]
        open(dst, 'w', encoding='utf-8').write(s); print('tables written into', dst, cnt); sys.exit(0)
print(text); print(cnt)
