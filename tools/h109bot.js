// h109bot — a player for stage 01 (build 109's full replay): probe109's { "bot": "__BOT.next()" } asks it for the next touch until the
// stage is over. It reads each act's dbg() (state().act) and plays it the way a careful child would: on the beat, along the line, the
// slab to its place. It is a test tool only (tools/), never in the game.
(() => {
  const B = (window.__BOT = { m: null, begun: false, k: {}, goT: 0, actT: 0, endSeen: 0, log: [] });
  const H = () => __T.game.h109;
  const now = () => performance.now();
  const W = innerWidth, HH = innerHeight;
  const C = (body) => `(()=>{const a=__T.game.h109.state().act;${body}})()`;
  const mid = (p, q, u = 0.5) => [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u];
  const play = {
    rope(a) {
      if (a.phase === 'ready') return { holdUntil: [W * 0.6, HH * 0.55, C(`return !a||a.side!==${a.side}||a.d>47.6||(a.phase!=='ready'&&a.phase!=='pull')`), 20000] };
      return { wait: 250 };
    },
    rocks(a) {
      if (a.phase === 'work') return { tapWhen: [W * 0.5, HH * 0.5, C('return !!a&&a.phase===\'work\'&&a.ph>0.875&&a.ph<0.925'), 3000] };
      return { wait: 200 };
    },
    read(a) {
      // (build 114: a.aim = where the light must turn to fall on each crack; a.ok = which is the true one)
      const k = Math.max(0, a.ok.indexOf(true));
      if (a.busy) return { wait: 200 };
      if ((a.step === 'turn' || a.step === 'wedge') && !a.seen[k]) { const dx = -(a.aim[k] - a.th) / 0.0045; return { drag: [W * 0.5, HH * 0.62, W * 0.5 + dx, HH * 0.62, 700], wait: 300, note: 'read: turn the mirror ' + Math.round(dx) + 'px' }; }
      if ((a.step === 'turn' || a.step === 'wedge') && a.wedges < a.nW) {
        const P = a.linePts[k], u = (0.12 + (0.5 * a.wedges) / Math.max(1, a.nW - 1)) * (P.length - 1), j = Math.min(P.length - 2, Math.floor(u));
        return { tap: mid(P[j], P[j + 1], u - j), wait: 900 };
      }
      if (a.step === 'water') return { holdUntil: [W * 0.5, HH * 0.5, C('return !a||a.step!==\'water\'||a.water>=1.04'), 7000] };
      return { wait: 250 };
    },
    pave(a) {
      // (build 114: the act tells its true laying, a.sol: rows of lengths; the bot lays it in order)
      const plan = []; (a.sol || []).forEach((row, cy) => { let cx = 0; for (const L of row) { plan.push([L, cx, cy]); cx += L; } });
      const bk = a.slabs.find((q) => q.broken && !q.gone && !q.at);
      if (bk && a.rej) return { drag: [bk.scr[0], bk.scr[1], a.rej[0], a.rej[1], 700], wait: 500, note: 'pave: the cracked slab to the crate' };
      for (const [L, cx, cy] of plan) {
        if (a.grid[cy][cx] !== '0') continue;
        const q = a.slabs.find((s) => !s.at && !s.gone && !s.broken && s.L === L);
        if (!q) break;
        const t = mid(a.cells[cy][cx], a.cells[cy][cx + L - 1]);
        return { drag: [q.scr[0], q.scr[1], t[0], t[1], 700], wait: 500, note: `pave L${L} → ${cx},${cy}` };
      }
      return { wait: 400 };
    },
    waste(a) {
      if (a.phase === 'load' && a.chunks.length) {
        const c = a.chunks[0], s = a.sled;
        return { when: C('return !a||a.phase!==\'load\'||(a.ph>0.25&&a.ph<0.38)'), max: 3000, then: { path: [c, [s[0], s[1] - 10]], ms: 450 }, wait: 0 };
      }
      // (build 115: hold to drive, let go before the green line (they slide on ~1.2), then a drag up tips the sledge into the pit)
      if (a.phase === 'push' && a.v < 0.1 && Math.abs(a.d - a.tgt) <= 3.5) return { drag: [a.sled[0], a.sled[1], a.sled[0], a.sled[1] - 140, 300], wait: 600, note: 'waste: tip at ' + (a.d - a.tgt).toFixed(2) };
      if (a.phase === 'push' && a.v < 0.1) return { holdUntil: [W * 0.75, HH * 0.5, C('return !a||a.phase!==\'push\'||a.d>=a.tgt-1.25'), 20000], wait: 1500 };
      if (a.phase === 'push') return { wait: 300 };
      return { wait: 300 };
    },
    corner(a) {
      if (a.phase === 'lift') {
        const since = now() - (B.k.sw || 0);
        if (since < 440) return { wait: Math.max(10, 440 - since) };
        B.k.sw = now();
        return { drag: [W * 0.72, HH * 0.38, W * 0.72, HH * 0.38 + 90, 120] };
      }
      if (a.phase === 'lower') {
        // (build 114: the finger on the chalk steers the stone over it while it lowers)
        const c = a.chalk || [W * 0.6, HH * 0.5];
        if (a.gap > 1.0) return { holdUntil: [c[0], c[1], C('return !a||a.phase!==\'lower\'||a.gap<0.95'), 9000] };
        if (a.swing > 0.8 || a.dx > 0.04) return { hold: [c[0], c[1], 60], wait: 200 };
        return { hold: [c[0], c[1], 230], wait: 120 };
      }
      return { wait: 250 };
    },
    course(a) {
      // (build 114: the act tells the one order that closes the gap; the bot ties each stone in turn and lowers it on its place)
      if (a.phase === 'choose') {
        const laid = a.set.map((q) => q[2]); const next = a.sol.find((L) => !laid.includes(L));
        const q = a.stock.find((s) => s.L === next); if (!q) return { wait: 400, note: 'course: no stone ' + next };
        return { tap: q.scr, wait: 1500, note: `course: take ${next}` };
      }
      if (a.phase === 'carry' && a.tgt) {
        const t = a.tgt;
        if (a.gapB > 1.0) return { holdUntil: [t[0], t[1], C('return !a||a.phase!==\'carry\'||a.gapB<0.9'), 14000] };
        if (a.sway > 0.25 || Math.abs(a.dz - a.ta) > 0.08) return { hold: [t[0], t[1], 60], wait: 300 };
        return { hold: [t[0], t[1], 230], wait: 150 };
      }
      return { wait: 250 };
    },
    great(a) {
      if (a.phase === 'roll' && a.out.length) return { drag: [a.out[0][0], a.out[0][1], a.frontScr[0], a.frontScr[1], 600], note: 'great: roller ' + a.out[0] + ' → ' + a.frontScr };
      return { wait: 120 };
    },
    letters(a) {
      // (build 114: part 2 — a chisel blow on each glowing point; part 3 — aim with a drag, hold to the band's middle and let go)
      if (a.part === 2) return a.next ? { tap: a.next, wait: 160 } : { wait: 300 };
      if (a.part !== 3 || a.done) return { wait: 300 };
      const mid = (a.band[0] + a.band[1]) / 2;
      if (a.terua && a.terua.step === 1) return { tap: [W * 0.5, HH * 0.5], wait: 230 };
      if (a.blast === 3) return { wait: 400 };
      if (a.blast < 3 && a.want != null && Math.abs(a.want - a.aim) > 1.5) { const dx = -((a.want - a.aim) * Math.PI / 180) / 0.0032; return { drag: [W * 0.5, HH * 0.3, W * 0.5 + Math.max(-W * 0.45, Math.min(W * 0.45, dx)), HH * 0.3, 500], wait: 300, note: `letters: aim ${a.aim} → ${a.want}` }; }
      return { holdUntil: [a.tp[0], a.tp[1], C(`return !a||a.part!==3||(a.hold&&a.breath>=${mid.toFixed(3)})`), 6000], wait: 900, note: 'letters: blow ' + a.blast };
    },
    // ── build 111 ── stage 02's acts (h111/acts*.js dbg())
    stakes(a) { if (a.done) return { wait: 300 }; return { drag: [a.stake[0], a.stake[1], a.target[0], a.target[1], 900], wait: 400 }; },
    bond(a) {
      if (a.done || a.closing || a.held) return { wait: 300 };
      const laid = (a0, L, row) => a.laid.some((q) => q[0] === a0 && q[1] === L && String(q[2]) === String(row));
      const want = [];
      if (a.head != null) want.push({ a: a.head, L: 6, row: 'h' });
      a.sol[0].forEach(([x, L]) => want.push({ a: x, L, row: 0 })); a.sol[1].forEach(([x, L]) => want.push({ a: x, L, row: 2 }));
      const t = want.find((q) => !laid(q.a, q.L, q.row)); if (!t) return { wait: 400 };
      const pile = a.piles.find((p) => p.L === t.L && p.n > 0); if (!pile) return { wait: 400, note: 'bond: no pile for ' + t.L };
      if (t.L === 6 && !pile.rot) return { tap: pile.scr, wait: 300, note: 'bond: turn the 6 to a header' };
      const ri = t.row === 'h' ? 2 : t.row === 0 ? 0 : 1, w = t.row === 'h' ? 2 : t.L, c = t.a + w / 2, row = a.cells[ri];
      const p = Number.isInteger(c) ? row[c] : mid(row[Math.floor(c)], row[Math.ceil(c)]);
      return { drag: [pile.scr[0], pile.scr[1], p[0], p[1], 700], wait: 500, note: `bond ${a.s}: ${t.L} at ${t.a} row ${t.row}` };
    },
    plumb(a) {
      if (a.done || a.busy) return { wait: 300 };
      const s = a.stones.find((q) => !q.okd); if (!s) return { wait: 300 };
      const k = a.wet ? 1.35 : 1, hold = Math.min(0.38, Math.max(0.0, (Math.abs(s.err) / k - 0.03) / 0.8));
      return { hold: [s.scr[0], s.scr[1], Math.round(hold * 1000)], wait: 450, note: `plumb ${a.s}: err ${s.err} → ${Math.round(hold * 1000)}ms` };
    },
    lever(a) {
      if (a.done || a.busy) return { wait: 300 };
      const k = a.wet ? 1.4 : 1, d = a.d;
      let i = d[0] >= d[1] ? 0 : 1; if (a.last === i && a.run >= 3 && d[1 - i] > 0.12) i = 1 - i;
      const j = 1 - i; if (d[i] <= 0.12 && d[j] <= 0.12) return { wait: 300 };
      if (d[i] < -0.08) { const f = Math.max(0.07, (Math.abs(d[i]) / 0.7 / k - 0.12) / 0.95); const sc = i ? a.end1 : a.end0; return { drag: [sc[0], sc[1], sc[0], sc[1] + f * a.H * 0.28, 450], wait: 500, note: 'lever: pull back' }; }
      let m = Math.min(d[i], 1.2);
      for (let it = 0; it < 30; it++) { const di = d[i] - m, dj = d[j] - a.follow * m; if (Math.abs(di - dj) <= a.jam - 0.05 && dj >= -0.06) break; m *= 0.85; }
      const f = Math.max(0.07, (m / k - 0.12) / 0.95), sc = i ? a.end1 : a.end0;
      return { drag: [sc[0], sc[1], sc[0], sc[1] - f * a.H * 0.28, 450], wait: 500, note: `lever ${a.s}: end ${i} d ${d.map((v) => v.toFixed(2))} move ${m.toFixed(2)}` };
    },
    gates(a) {
      if (a.done || !a.toks.length) return { wait: 300 };
      const sl = a.slots.find((s) => s.gi >= 0 && !a.set.includes(s.gi)); if (!sl) return { wait: 300 };
      return { drag: [a.toks[0].scr[0], a.toks[0].scr[1], sl.scr[0], sl.scr[1], 800], wait: 600, note: 'gates: frame to ' + sl.k + ' ' + sl.gi };
    },
    closing(a) {
      if (a.done || a.busy) return { wait: 300 };
      if (a.phase === 'choose') {
        const o = a.stones.find((q) => q.ok); if (!o) return { wait: 300 };
        if (o.rot) return { tap: o.scr, wait: 400, note: 'closing: turn it along' };
        return { drag: [o.scr[0], o.scr[1], a.gap[0], a.gap[1], 900], wait: 800, note: 'closing: set it' };
      }
      const hold = Math.min(0.38, Math.max(0, (Math.abs(a.err) / 1.2 - 0.03) / 0.8));
      return { hold: [a.set[0], a.set[1], Math.round(hold * 1000)], wait: 450, note: `closing plumb err ${a.err}` };
    },
    // ── /build 111 ──
    // ── build 112 ── stage 03's acts (h112/acts*.js dbg())
    posts(a) {
      if (a.done || a.busy || a.cur == null || !a.scr) return { wait: 300 };
      const dx = -a.e * a.px, x0 = W * 0.5, y0 = HH * 0.72;   // (the drag takes the post wherever it starts: not on the top bar)
      if (Math.abs(a.e) < 0.02) return { drag: [x0, y0, x0 + (dx >= 0 ? 4 : -4), y0, 300], wait: 900, note: 'posts: set it' };
      return { drag: [x0, y0, x0 + dx, y0, 800], wait: 900, note: `posts ${a.cur}: e ${a.e} → ${Math.round(dx)}px` };
    },
    slab(a) {
      if (a.done || a.busy) return { wait: 300 };
      if (a.held < 0) { const c = a.cands.find((q) => q.ok); return c ? { tap: c.scr, wait: 1400, note: 'slab: choose ' + a.cands.indexOf(c) } : { wait: 300 }; }
      return B.hang(a.h, a.slab, 0.6, a.between ? 0.75 : 0.9);
    },
    warn(a) {
      if (a.done || a.busy) return { wait: 300 };
      if (a.phase === 'count') { const p = a.posts.find((q) => q.i === a.at); return p ? { tap: p.scr, wait: 1600, note: 'warn: the post ' + a.at } : { wait: 300 }; }
      if (a.phase === 'hang') return B.hang(a.h, a.slab, 0.6, 0.7);
      if (a.phase === 'paint' && a.strokes) { const st = a.strokes[(B.k.si = (B.k.si | 0) + 1) % a.strokes.length]; return { path: st, ms: 700, wait: 150 }; }
      return { wait: 300 };
    },
    steps(a) {
      if (a.done || a.busy || a.k == null || !a.scr) return { wait: 300 };
      if (Math.abs(a.dx) > 0.03) { const dx = -a.dx * a.px + (a.gauge && a.dx < 0 ? 8 : 0); return { drag: [a.scr[0], a.scr[1], a.scr[0] + dx, a.scr[1], 700], wait: 600, note: `steps ${a.k}: dx ${a.dx} → ${Math.round(dx)}px` }; }
      if (a.h > 0.012) return { tap: a.scr, wait: 450, note: `steps ${a.k}: tamp h ${a.h}` };
      return { wait: 500 };
    },
    close(a) {
      if (a.done || a.busy) return { wait: 300 };
      if (a.phase === 'measure') return { drag: [a.tip[0], a.tip[1], a.tipTo[0], a.tipTo[1], 800], wait: 700, note: 'close: the rod to the post' };
      if (a.phase === 'choose') {
        const c = a.cands.find((q) => q.fits);
        if (c) return { tap: c.scr, wait: 1400, note: `close: ${c.w} for ${a.need}` };
        const w = a.cands.find((q) => q.w - a.need > 0.03) || a.cands[0];
        return { drag: [w.scr[0], w.scr[1], a.bench[0], a.bench[1], 1200], wait: 1200, note: 'close: none fits, to the bench' };
      }
      if (a.phase === 'hang') return B.hang(a.h, a.slab, 0.6, 0.5);
      return { wait: 400 };
    },
    // ── /build 112 ──
    // ── build 113 ── stage 04's acts (h113/acts*.js dbg())
    socket(a) {
      if (a.busy) return { wait: 300 };
      const k = `${a.i}:${a.cracks}:${a.phase}`;
      if (a.phase === 'place' && a.pin && a.snug) {
        if (B.k.pl !== k) { B.k.pl = k; const ox = a.snug[0] + Math.sign(a.snug[0] - a.pin[0]) * 30; return { drag: [a.pin[0], a.pin[1], ox, a.snug[1], 700], wait: 700, note: 'socket: the pin to the jamb' }; }
        return { tap: a.spot, wait: 900, note: 'socket: set the drill ' + (a.flint ? '(beside the flint)' : '') };
      }
      if (a.phase === 'mirror' && a.mark && a.markTo) return { drag: [a.mark[0], a.mark[1], a.markTo[0], a.markTo[1], 900], wait: 2600, note: `socket: the mirror mark ${a.mirrorOf}` };
      if (a.phase === 'tplSill') return { tap: [W * 0.5, HH * 0.55], wait: 1400, note: 'socket: the template to the lintel' };
      if (a.phase === 'tplLintel') { if (!a.flip) return { tap: a.tpl, wait: 900, note: 'socket: turn the plank over' }; return { tap: a.hole, wait: 1600, note: 'socket: mark through the hole' }; }
      if (a.phase === 'drill') {
        const x0 = W * 0.22, y0 = HH * 0.82, rem = a.target - a.depth;
        if (a.seat < 3) return { path: [[x0, y0], [x0 + W * 0.1, y0]], ms: 260, wait: 380, note: 'socket: a short stroke' };
        if (Math.abs(rem) <= a.tol * 0.7 || rem < 0) return { tap: a.pin, wait: 2200, note: `socket: test the pin (depth ${a.depth}/${a.target})` };
        if (rem > 0.45) return { path: [[x0, y0], [x0 + W * 0.36, y0]], ms: 420, wait: 300, note: `socket: long ${a.depth}` };
        return { path: [[x0, y0], [x0 + W * 0.2, y0]], ms: 320, wait: 350, note: `socket: medium ${a.depth}` };
      }
      return { wait: 300 };
    },
    lintel(a) {
      if (a.busy) return { wait: 300 };
      const cl = (p) => [Math.max(30, Math.min(W - 30, p[0])), Math.max(90, Math.min(HH - 60, p[1]))], L = cl(a.endL), R = cl(a.endR);
      if (a.phase === 'lift') {
        const up = a.yL >= 26.7 && a.yR >= 26.7;
        if (up) return { wait: 400 };
        if (Math.abs(a.tilt) < 1.4) return { seq: [[L, R], [L, R], [L, R], [L, R], [L, R], [L, R], [L, R], [L, R]], ms: 60, wait: 60, note: `lintel: both up ${a.yL}/${a.yR}` };
        const lo = a.yL < a.yR ? L : R; return { seq: [[lo], [lo], [lo], [lo], [lo]], ms: 60, wait: 60, note: `lintel: the low end ${a.tilt}°` };
      }
      if (a.phase === 'in') { const dy = ((a.seatZ - a.z) / 9) * Math.max(300, HH); return { drag: [a.mid[0], Math.min(HH - 40, a.mid[1] + 60), a.mid[0], Math.min(HH - 40, a.mid[1] + 60) - dy, 1100], wait: 600, note: 'lintel: in over the opening' }; }
      if (a.phase === 'lower') { const f = [[L, R]]; return { seq: Array(10).fill(f[0]), ms: 60, wait: 350, note: `lintel: down ${a.yL}/${a.yR}` }; }
      return { wait: 300 };
    },
    leaf(a) {
      if (a.busy) return { wait: 300 };
      if (a.phase === 'pick') {
        const need = 5 - a.sum, R = a.rack;
        const hole = R.findIndex((r) => r.hole);
        if (hole >= 0 && a.laid.length === 0) { B.k.wantZero = 1; return { tap: R[hole].at, wait: 1600, note: 'leaf: the board with the hole first' }; }
        B.k.wantZero = 0;
        const ids = R.map((r, i) => i).filter((i) => !R[i].knot);
        let best = null; const go = (k, left, pick) => { if (best) return; if (Math.abs(left) < 1e-6) { best = pick; return; } if (left < 0 || k >= ids.length) return; go(k + 1, left - R[ids[k]].w, [...pick, ids[k]]); go(k + 1, left, pick); };
        go(0, need, []);
        if (!best || !best.length) return { wait: 500, note: 'leaf: no way to five from ' + JSON.stringify(R.map((r) => r.w)) };
        return { tap: R[best[0]].at, wait: 1600, note: `leaf: take ${R[best[0]].w} (need ${need})` };
      }
      if (a.phase === 'turn' && a.held) {
        const hole = !!a.rack && a.laid.length === 0 && B.k.hole;
        let ang = a.held.ang; ang = ((ang % 360) + 540) % 360 - 180;
        const tgt = B.k.wantZero ? 0 : (Math.abs(ang) < 90 ? 0 : (ang > 0 ? 180 : -180));
        const d = ((tgt - ang) * Math.PI) / 180, c = a.held.at, r = 150, a0 = -Math.PI / 2, pts = [];
        for (let i = 0; i <= 14; i++) { const t = a0 - (d * i) / 14; pts.push([c[0] + Math.cos(t) * r, c[1] + Math.sin(t) * r]); }
        void hole; return { path: pts, ms: 1000, keep: 1100, wait: 900, note: `leaf: turn ${ang.toFixed(0)}° → ${tgt}` };
      }
      if (a.phase === 'peg' && a.pegAt && a.battenEnds[a.pegBi]) {
        const [e0, e1] = a.battenEnds[a.pegBi], p = a.pegAt, far = Math.hypot(e0[0] - p[0], e0[1] - p[1]) > Math.hypot(e1[0] - p[0], e1[1] - p[1]) ? e0 : e1;
        return { seq: [[far], [far], [far, p], [far], [far]], ms: 110, wait: 250, note: 'leaf: hold the batten, tap the peg' };
      }
      if (a.phase === 'pish' && a.pish) {
        const sel = a.pish.filter((q) => q.sel).map((q) => q.w), left = a.pish.filter((q) => !q.sel);
        const want = sel.length ? 1 - sel[0] : 0.75; const q = left.find((x) => Math.abs(x.w - want) < 1e-6) || left[0];
        return { tap: q.at, wait: 1200, note: 'leaf: the wicket board ' + q.w };
      }
      return { wait: 300 };
    },
    hang(a) {
      if (a.busy) return { wait: 300 };
      const Hh = Math.max(300, HH), Ww = Math.max(320, W);
      if (a.phase === 'tilt') { const t = (a.win[0] + a.win[1]) / 2, dy = ((t - a.thT) / 26) * Hh; return { path: [a.head, [a.head[0], a.head[1] + dy]], ms: 900, keep: 1300, wait: 400, note: `hang: tilt ${a.th} → ${t}` }; }
      if (a.phase === 'foot') { const dx = ((a.fx - a.sockX) / 3.2) * Ww; return { path: [a.foot, [a.foot[0] + dx, a.foot[1]]], ms: 700, keep: 4000, release: C(`return !a||Math.abs(a.off)<=a.tol*0.5`), wait: 600, note: `hang: the foot ${a.off} fingers off` }; }
      if (a.phase === 'straight') { const dy = ((a.thT + 0.4) / 26) * Hh; return { path: [a.head, [a.head[0], a.head[1] - dy]], ms: 2400, keep: 2500, release: C('return !a||a.phase!==\'straight\''), wait: 800, note: 'hang: straighten slowly' }; }
      if (a.phase === 'sub' && a.sub) {
        const s = a.sub, p = s.at;
        if (s.ph === 'tilt') { const dy = ((6.5 - s.th) / 18) * Hh; return { path: [p, [p[0], p[1] + dy]], ms: 700, keep: 900, wait: 400, note: 'hang: the wicket tilt ' + s.th }; }
        if (s.ph === 'foot') { const dx = (s.fx / 0.8) * Ww; return { path: [p, [p[0] + dx, p[1]]], ms: 600, keep: 2500, release: C('return !a||!a.sub||Math.abs(a.sub.fx)<0.012'), wait: 500, note: 'hang: the wicket foot ' + s.fx }; }
        if (s.ph === 'straight') { const dy = ((s.th + 0.25) / 18) * Hh; return { path: [p, [p[0], p[1] - dy]], ms: 1800, keep: 1500, release: C('return !a||!a.sub||a.sub.th<=0.3'), wait: 600, note: 'hang: the wicket straight' }; }
      }
      if (a.phase === 'spin') { if (B.k.spun) return { wait: 500 }; B.k.spun = 1; return { drag: [a.body[0] + 120, a.body[1], a.body[0] - 180, a.body[1], 500], wait: 600, note: 'hang: push the leaf' }; }
      return { wait: 300 };
    },
    lock(a) {
      if (a.busy) return { wait: 300 };
      const u = a.barU, ul = Math.hypot(u[0], u[1]) / 4 || 1, ux = u[0] / 4 / ul, uy = u[1] / 4 / ul;   // (screen px per amah along the bar: ul)
      const barDrag = (from, along, ms = 900) => {   // (the end kept on the screen, off the top bar: a drag that leaves it ends on a HUD button)
        let ex = from[0] + ux * along * ul, ey = from[1] + uy * along * ul; const k = Math.min(1,
          ex < 40 ? (from[0] - 40) / (from[0] - ex) : ex > W - 40 ? (W - 40 - from[0]) / (ex - from[0]) : 1,
          ey < 140 ? (from[1] - 140) / (from[1] - ey) : ey > HH - 60 ? (HH - 60 - from[1]) / (ey - from[1]) : 1);
        ex = from[0] + (ex - from[0]) * Math.max(0, k); ey = from[1] + (ey - from[1]) * Math.max(0, k);
        return { drag: [from[0], from[1], ex, ey, ms] };
      };
      if (a.step === 'close') {
        const i = a.closed[0] ? 1 : 0, p = i ? a.leafR : a.leafL, c = [W * 0.5, p[1]], dir = Math.sign(c[0] - p[0]) || 1;
        const px = a.phi[i] > 0.35 ? 150 : 50;
        return { drag: [p[0], p[1], p[0] + dir * px, p[1], 1100], wait: 900, note: `lock: close leaf ${i} (φ ${a.phi[i]})` };
      }
      if (a.step === 'shim' && a.shims) { const s = a.shims.find((q) => q.n === Math.abs(a.gap)) || a.shims[0]; return { tap: s.at, wait: 1800, note: 'lock: the shim ' + s.n }; }
      if (a.step === 'bar' || a.step === 'relock') {
        if (!a.ringOK && a.blockAt != null) { if (a.bar < a.blockAt - 0.25) return { ...barDrag(a.barAt, a.blockAt - 0.1 - a.bar), wait: 700, note: 'lock: the bar to the ring' }; if (a.nudge) return { tap: a.nudge, wait: 700, note: 'lock: push the leaf (the ring)' }; }
        return { ...barDrag(a.barAt, a.SHUT - a.bar + 0.15, 1100), wait: 900, note: `lock: the bar home (${a.step})` };
      }
      if (a.step === 'key') return { tap: a.chain, wait: 1400, note: 'lock: a key from the chain' };
      if (a.step === 'insert' && a.key) {
        if (!a.key.up) { const c = a.key.at, pts = []; for (let i = 0; i <= 16; i++) { const t = (i / 16) * Math.PI * 1.15; pts.push([c[0] + Math.cos(t) * 90, c[1] + Math.sin(t) * 90]); } return { path: pts, ms: 900, wait: 400, note: 'lock: turn the key' }; }
        const st = [W * 0.3, HH * 0.75]; return { ...barDrag(st, 1.5, 900), wait: 500, note: 'lock: push the key in' };
      }
      if (a.step === 'lifted' && a.key) {
        if (B.k.tried === a.ki && (a.stuck >= 0 || !a.key.ok) && a.keys > 1) return { tap: a.chain, wait: 1400, note: 'lock: a pin stays down: another key' };
        B.k.tried = a.ki;
        const l0 = [W * 0.3, HH * 0.7], s0 = a.barAt, n = 14, fr = [];
        for (let i = 0; i <= 5; i++) fr.push([[l0[0], l0[1] - i * 18]]);
        for (let i = 0; i <= n; i++) { const k = (i / n) * 1.5; fr.push([[l0[0], l0[1] - 90], [s0[0] - ux * k * ul, s0[1] - uy * k * ul]]); }
        fr.push([[l0[0], l0[1] - 90]]);
        return { seq: fr, ms: 70, wait: 900, note: `lock: lift and slide (key ${a.ki}, ok ${a.key.ok})` };
      }
      if (a.step === 'pishLock') { const st = [W * 0.45, HH * 0.6]; return { ...barDrag(st, 1.9, 900), wait: 1200, note: 'lock: the wicket bar' }; }
      if (a.step === 'reach') { const st = [W * 0.15, HH * 0.7], len = 6.3 * ul, ms = Math.max(1200, (len / 380) * 1000); return { ...barDrag(st, 6.3, ms), wait: 700, note: 'lock: the Levite reaches in slowly' }; }
      return { wait: 300 };
    },
    // ── /build 113 ──
  };
  // (build 112: a slab on the crane's rope — turn it square, the right way up, then lower it fast and touch down gently)
  B.hang = (h, at, top, vSafe) => {
    if (!h || !at || h.busy || h.mode === 'seated') return { wait: 300 };
    at = [Math.max(60, Math.min(W - 60, at[0])), Math.max(150, Math.min(HH - 110, at[1]))];   // (the rope takes a press anywhere: never on the top bar)
    if (h.flip) return { tap: at, wait: 1100, note: 'hang: the crew turns it over' };
    // (the finger sets where the slab will settle, thT: aim that at square, then let the swing die out before lowering)
    const wr = (a) => Math.atan2(Math.sin(a), Math.cos(a)), th = h.th, thT = wr(h.thT);
    if (Math.abs(thT) <= 0.05 && (Math.abs(wr(th - thT)) > 0.05 || Math.abs(th) > 0.09)) return { wait: 400 };
    if (Math.abs(thT) > 0.05) {
      const dx = (-thT / (Math.PI * 2 * 0.9)) * Math.max(320, W);
      return { drag: [at[0], at[1], at[0] + dx, at[1], Math.abs(dx) < 40 ? 160 : 500], wait: 1300, note: `hang: turn ${th} (${Math.round(dx)}px)` };   // (a small turn quick: a slow one under 9 px turns into a hold)
    }
    if (h.gust && (h.gust.warn || h.gust.on > 0)) return { wait: 250, note: 'hang: a gust' };
    if (h.gust && h.gust.next < 3.4 && h.y > h.seatY + 0.6) return { wait: 250 };   // (a long lowering waits for the next gust to pass)
    if (h.y > h.seatY + 1.0) return { holdUntil: [at[0], at[1], C(`const h=a&&a.h;return !h||h.mode==='seated'||h.y<h.seatY+0.95||(h.gust&&(h.gust.warn||h.gust.on>0))`), 9000], wait: 500 };
    return { hold: [at[0], at[1], vSafe < 0.8 ? 420 : 470], wait: 350, note: `hang: short hold at ${h.y} (${h.mode}, th ${h.th})` };
  };
  B.next = () => {
    const S = H().state();
    if (!S.started && S.phase === 'off') {
      if (!B.endSeen) { B.endSeen = now(); return { wait: 2500, shot: 'stage-end', note: 'the stage is over' }; }
      return { done: true };
    }
    // (the films between levels and the end: a frame every 2.5 s, when the probe asks for them)
    if (window.__BOT_FILM && (S.phase === 'film' || S.phase === 'end') && now() - (B.filmT || 0) > 2500 && (B.filmN = (B.filmN || 0) + 1) < 80) { B.filmT = now(); return { wait: 200, shot: `film-${S.phase}-${S.mission || 'end'}-${B.filmN}` }; }
    if (S.phase === 'walk') {
      if (B.m !== S.mission) { B.note = `${S.i}/${S.n} → ${S.mission} · streak best ${S.best}`; B.m = S.mission; B.begun = false; B.goT = 0; return { wait: 300, note: B.note }; }
      if (now() - B.goT > 7000) { B.goT = now(); return { eval: '__T.game.h109.goTo()', wait: 300 }; }
      return { wait: 300 };
    }
    if (S.phase !== 'act' || !S.act) return { wait: 300 };
    if (!B.begun || B.m !== S.mission) { B.m = S.mission; B.begun = true; B.k = {}; B.actT = now(); return { wait: 1600, shot: S.mission, note: 'act ' + S.mission }; }
    if (now() - B.actT > 240000) { B.actT = now(); return { eval: '__T.game.h109._end({stars:1})', note: 'STUCK in ' + S.mission + ' ' + JSON.stringify(S.act).slice(0, 1400) }; }
    const kind = S.mission.replace(/\d+$/, '');
    const f = play[kind]; if (!f) return { wait: 500, note: 'no player for ' + kind };
    try { return f(S.act); } catch (e) { return { wait: 500, note: 'bot error ' + kind + ' ' + e.message }; }
  };
  return 'bot ready';
})();
