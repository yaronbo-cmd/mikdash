#!/usr/bin/env python3
"""recovery R1 — how much each changed module changed: a diff of the normalized token streams (local names → "_",
so renaming by the minifier is not a change), then the literals/properties that only one side has.
usage: python3 -I recovery/tools/moddiff.py   (after moddiff.mjs) → recovery/work/moddiff.json + a table on stdout"""
import json, re
from difflib import SequenceMatcher
W = '/home/claude/temple3d/recovery/work/'
pairs = json.load(open(W + 'modtokens.json'))
def stable(t): return t[:1] in '"`./' or (t.endswith(':') and len(t) > 2) or (t[:1] == '#' and t not in ('#0', '#1', '#2'))
res = []
def lines_of(a):
    out, cur = [], []
    for t in a:
        cur.append(t)
        if t in (';', '{', '}'): out.append('\x01'.join(cur)); cur = []
    if cur: out.append('\x01'.join(cur))
    return out
def tokdiff(a, b, depth=0):
    """token-level − / + counts between two token lists; big blocks are first aligned by pseudo-lines (cut at ; { })"""
    if len(a) <= 4000 and len(b) <= 4000:
        sm = SequenceMatcher(None, a, b, autojunk=False); d = i = 0; h = 0
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag != 'equal': h += 1; d += i2 - i1; i += j2 - j1
        return d, i, h
    la, lb = lines_of(a), lines_of(b)
    if depth == 0 and len(la) > 1:
        sm = SequenceMatcher(None, la, lb, autojunk=False); d = i = h = 0
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag == 'equal': continue
            ta = [t for l in la[i1:i2] for t in l.split('\x01')] if i2 > i1 else []
            tb = [t for l in lb[j1:j2] for t in l.split('\x01')] if j2 > j1 else []
            x, y, z = tokdiff(ta, tb, 1); d += x; i += y; h += max(1, z)
        return d, i, h
    from collections import Counter
    ca, cb = Counter(a), Counter(b)
    return sum((ca - cb).values()), sum((cb - ca).values()), 1
from collections import Counter
for p in pairs:
    ua, ub = p['u15'], p['u26']
    # 1) identical units, wherever they are (a module that moved into the lazy graph has its units in another order)
    ka = ['\x01'.join(u) for u in ua]; kb = ['\x01'.join(u) for u in ub]
    left_b = Counter(kb); ra = []
    for i, k in enumerate(ka):
        if left_b[k] > 0: left_b[k] -= 1
        else: ra.append(i)
    used = Counter(); rb = []
    cnt_a = Counter(ka)
    for j, k in enumerate(kb):
        if used[k] < cnt_a[k]: used[k] += 1
        else: rb.append(j)
    # 2) the rest paired by shared stable tokens, greedily, best first
    sta = {i: set(t for t in ua[i] if stable(t)) for i in ra}; stb = {j: set(t for t in ub[j] if stable(t)) for j in rb}
    cand = []
    for i in ra:
        for j in rb:
            inter = len(sta[i] & stb[j]); uni = len(sta[i] | stb[j]) or 1
            lr = min(len(ua[i]), len(ub[j])) / max(len(ua[i]), len(ub[j]), 1)
            sc = inter / uni if uni > 1 else 0
            if sc >= 0.2 or (sc > 0 and lr > 0.5): cand.append((sc + 0.1 * lr, i, j))
    cand.sort(reverse=True); pa, pb, prs = set(), set(), []
    for sc, i, j in cand:
        if i in pa or j in pb: continue
        pa.add(i); pb.add(j); prs.append((i, j))
    dele = ins = hunks = 0
    for i, j in prs:
        d, n_, h = tokdiff(ua[i], ub[j]); dele += d; ins += n_; hunks += max(1, h) if (d or n_) else 0
    for i in ra:
        if i not in pa: dele += len(ua[i]); hunks += 1
    for j in rb:
        if j not in pb: ins += len(ub[j]); hunks += 1
    ch_units = max(len(ra), len(rb))
    a = [t for u in ua for t in u]; b = [t for u in ub for t in u]
    sa, sb = set(x for x in a if stable(x)), set(x for x in b if stable(x))
    add = sorted(sb - sa, key=lambda x: (-len(x), x)); rem = sorted(sa - sb, key=lambda x: (-len(x), x))
    short = lambda xs: [x if len(x) <= 60 else x[:57] + '…' for x in xs]
    res.append({'label': p['label'], 'tok15': len(a), 'tok26': len(b), 'units15': len(ua), 'units26': len(ub), 'changedUnits': ch_units, 'hunks': hunks, 'del': dele, 'ins': ins,
                'add': short(add[:40]), 'nadd': len(add), 'rem': short(rem[:25]), 'nrem': len(rem)})
json.dump(res, open(W + 'moddiff.json', 'w'), ensure_ascii=False, indent=1)
for r in sorted(res, key=lambda r: -(r['ins'] + r['del'])):
    print('%-36s tok %6d→%6d  units %4d→%4d chg %4d  hunks %4d  −%-6d +%-6d  +lits %d −lits %d' % (r['label'], r['tok15'], r['tok26'], r['units15'], r['units26'], r['changedUnits'], r['hunks'], r['del'], r['ins'], r['nadd'], r['nrem']))
