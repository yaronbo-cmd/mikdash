#!/usr/bin/env python3
"""recovery R1 — a symbol table for the 26c bundle: minified top-level name → source name (+ the module that declares it).
usage: python3 -I recovery/tools/symmap.py   (after units.mjs on b15/app.names.stub.js → u15n.json, and modmap.py)
writes recovery/work/symmap26c.json and prints the coverage.

How: build 15's names-kept bundle (build-marked.mjs app.names.js) has the very same units, in the same order, as its
minified bundle, so unit i lends its declared name to unit i. 26c's units are paired with build 15's inside each matched
module by identical normalized hashes, which carries the source name over to 26c's minified name.
"""
import json, re
from difflib import SequenceMatcher
from collections import Counter, defaultdict
W = '/home/claude/temple3d/recovery/work/'
u15 = json.load(open(W + 'u15.json'))['units']
u15n = json.load(open(W + 'u15n.json'))['units']
u26 = json.load(open(W + 'u26c.json'))['units']
mm = json.load(open(W + 'modmap.json'))
assert len(u15) == len(u15n)
name15 = {}
for a, b in zip(u15, u15n):
    if a.get('decl') and b.get('decl'): name15[a['decl']] = b['decl']
def units_in(U, m): return [u for u in U if u['start'] >= m['start'] and u['end'] <= m['end']]
sym = {}
mod_of26 = {}
for m in mm['mods26']:
    for u in units_in(u26, m):
        if u.get('decl'): mod_of26[u['decl']] = m.get('label') or '?'
for r in mm['rows']:
    if 'j26' not in r: continue
    a, b = units_in(u15, mm['mods15'][r['k15']]), units_in(u26, mm['mods26'][r['j26']])
    sm = SequenceMatcher(None, [u['h'] for u in a], [u['h'] for u in b], autojunk=False)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            x, y = a[blk.a + k], b[blk.b + k]
            if x.get('decl') and y.get('decl') and x['decl'] in name15:
                sym[y['decl']] = {'name': name15[x['decl']], 'module': r['label']}
    # changed modules: also pair the remaining declarations of the same kind in order (functions keep their place)
    if r['status'] == 'changed':
        da = [u for u in a if u.get('decl') and u['decl'] in name15 and u['kind'] == 'FunctionDeclaration']
        db = [u for u in b if u.get('decl') and u['kind'] == 'FunctionDeclaration']
        sm2 = SequenceMatcher(None, [frozenset(u['st'][:40]) and tuple(sorted(u['st'][:12])) for u in da], [tuple(sorted(u['st'][:12])) for u in db], autojunk=False)
        for blk in sm2.get_matching_blocks():
            for k in range(blk.size):
                x, y = da[blk.a + k], db[blk.b + k]
                if y['decl'] not in sym: sym[y['decl']] = {'name': name15[x['decl']], 'module': r['label'], 'guess': True}
decls26 = sorted(set(u['decl'] for u in u26 if u.get('decl')))   # distinct names (a hoisted `var a` and its `a=…` count once)
stat = defaultdict(lambda: [0, 0])
for d in decls26:
    st = 'new' if mod_of26.get(d, '?') in [m.get('label') for m in mm['mods26'] if m.get('status') == 'new'] else 'old'
    stat[st][0] += 1; stat[st][1] += d in sym
json.dump(sym, open(W + 'symmap26c.json', 'w'), ensure_ascii=False, indent=0)
print('26c distinct top-level names', len(decls26), 'named', len(sym))
for k, (n, h) in stat.items(): print('  in %s modules: %d declared, %d named (%.1f%%)' % (k, n, h, 100 * h / max(1, n)))
# the new modules' references to other modules' top-level names: how many resolve?
js = open(W + 'x26c/app.stub.js', encoding='utf-8').read().encode('utf-16-le')
sl = lambda s, e: js[2 * s:2 * e].decode('utf-16-le')
declset = set(decls26)
tot_ref = tot_ok = 0
rows = []
for m in mm['mods26']:
    if m.get('status') != 'new' or m['bytes'] < 100: continue
    own = set(u['decl'] for u in units_in(u26, m) if u.get('decl'))
    text = sl(m['start'], m['end'])
    ids = set(re.findall(r'(?<![\w$.])([A-Za-z_$][\w$]*)', re.sub(r'"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`', '""', text)))
    ext = sorted(i for i in ids if i in declset and i not in own)
    ok = [i for i in ext if i in sym]
    tot_ref += len(ext); tot_ok += len(ok)
    rows.append((m['label'], len(ext), len(ok), [sym[i]['name'] for i in ok][:12], [i for i in ext if i not in sym][:12]))
print('new modules: external top-level references', tot_ref, 'resolved to a source name', tot_ok, '(%.1f%%)' % (100 * tot_ok / max(1, tot_ref)))
for r in rows: print('  %-36s ext %3d named %3d  e.g. %s  | unnamed: %s' % r)
