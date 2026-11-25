import json, random, sys
RING = [(x,z) for x in range(12) for z in range(12) if not (3<=x<=8 and 3<=z<=8)]
RS = set(RING)
def nb(c):
    x,z=c; return [(x+1,z),(x-1,z),(x,z+1),(x,z-1)]
def norm(cells):
    mx=min(c[0] for c in cells); mz=min(c[1] for c in cells)
    return sorted((x-mx,z-mz) for x,z in cells)
def orients(cells):
    out=set(); cur=cells
    for m in (False,True):
        base=[(-x,z) for x,z in cells] if m else cells
        c=base
        for r in range(4):
            c=[(z,-x) for x,z in c]
            out.add(tuple(norm(c)))
    return out
def grow(n, rng, smin, smax):
    for attempt in range(20000):
        seeds=rng.sample(RING,n); own={s:i for i,s in enumerate(seeds)}; pieces=[[s] for s in seeds]
        free=set(RING)-set(seeds)
        while free:
            # choose smallest piece that has frontier
            order=sorted(range(n), key=lambda i:(len(pieces[i]), rng.random()))
            moved=False
            for i in order:
                if len(pieces[i])>=smax: continue
                fr=[c for p in pieces[i] for c in nb(p) if c in free]
                if not fr: continue
                fr=list(set(fr)); rng.shuffle(fr)
                fr.sort(key=lambda c:-sum(1 for q in nb(c) if own.get(q)==i))
                c=fr[0]; own[c]=i; pieces[i].append(c); free.discard(c); moved=True; break
            if not moved: break
        if free: continue
        sz=[len(p) for p in pieces]
        if min(sz)<smin or max(sz)>smax: continue
        ok=True
        for p in pieces:
            xs=[c[0] for c in p]; zs=[c[1] for c in p]
            if max(xs)-min(xs)>6 or max(zs)-min(zs)>6: ok=False;break
        if not ok: continue
        return pieces
    raise SystemExit('fail')
def bridges(p2, l1own):
    return len({l1own[c] for c in p2})>=2
def strips(lengths, layout):
    # layout: list of (x0,z0,w,h)
    return [[(x,z) for x in range(x0,x0+w) for z in range(z0,z0+h)] for (x0,z0,w,h) in layout]
A1 = {
 'SE': strips(None,[(0,0,6,3),(6,0,6,3),(0,9,6,3),(6,9,6,3),(0,3,3,6),(9,3,3,6)]),
 'NE': strips(None,[(0,0,9,3),(9,0,3,3),(0,9,9,3),(9,9,3,3),(0,3,3,6),(9,3,3,6)]),
 'NW': strips(None,[(0,0,12,3),(0,9,12,3),(0,3,3,3),(0,6,3,3),(9,3,3,3),(9,6,3,3)]),
 'SW': strips(None,[(0,0,12,3),(0,9,6,3),(6,9,6,3),(0,3,3,3),(0,6,3,3),(9,3,3,6)]),
}
CFG={'a':[(6,None),(8,(10,17))],'b':[(8,(10,17)),(10,(8,14))],'c':[(10,(8,14)),(12,(6,12))]}
out={'grid':'ring of 12x12 half-tefach cells minus the 6x6 core (cells 3..8); x east, z south; 108 cells','connect':'edges only (4-neighbour)','orientations':'4 rotations x mirror, footprint must lie fully on free ring cells','sets':{}}
seedbase={'SE':11,'NE':23,'NW':37,'SW':41}
for h in ['SE','NE','NW','SW']:
    for lv in 'abc':
        rng=random.Random(seedbase[h]*100+ord(lv))
        (n1,s1),(n2,s2)=CFG[lv]
        L1 = A1[h] if lv=='a' else grow(n1,rng,*s1)
        l1own={c:i for i,p in enumerate(L1) for c in p}
        for t in range(5000):
            L2=grow(n2,rng,*s2)
            if all(bridges(p,l1own) for p in L2): break
        else: raise SystemExit('nobridge '+h+lv)
        for L in (L1,L2):
            cells=[c for p in L for c in p]; assert len(cells)==108 and set(cells)==RS
            for p in L:  # connected
                st=[p[0]]; seen={p[0]}; ps=set(p)
                while st:
                    c=st.pop()
                    for q in nb(c):
                        if q in ps and q not in seen: seen.add(q); st.append(q)
                assert len(seen)==len(p)
        def pack(L):
            return [{'id':f'{h}-{lv}-{k+1}','shape':norm(p),'cells':len(p),'solution':sorted(p),'orientations':len(orients(norm(p)))} for k,p in enumerate(L)]
        out['sets'][f'{h}:{lv}']={'layer1':pack(L1),'layer2':pack(L2),'layer2_bridges_layer1_solution':True}
json.dump(out,open(sys.argv[1],'w'),ensure_ascii=False)
for k,v in out['sets'].items(): print(k, [p['cells'] for p in v['layer1']], [p['cells'] for p in v['layer2']])
