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
  const PAVE = {
    1: [[3, 0, 0], [3, 3, 0]],
    2: [[3, 0, 0], [3, 3, 0], [1, 0, 1], [3, 1, 1], [1, 4, 1], [1, 5, 1]],
    3: [[3, 0, 0], [3, 3, 0], [1, 0, 1], [3, 1, 1], [2, 4, 1], [3, 0, 2], [3, 3, 2]],
  };
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
      if ((a.step === 'turn' || a.step === 'wedge') && !a.seen[0]) { const dx = -(a.linePhi[0] - a.th) / 0.0045; return { drag: [W * 0.5, HH * 0.62, W * 0.5 + dx, HH * 0.62, 700], note: 'read: turn the mirror ' + Math.round(dx) + 'px' }; }
      if ((a.step === 'turn' || a.step === 'wedge') && a.wedges < a.nW) {
        const P = a.linePts[0], u = (0.14 + (0.72 * a.wedges) / Math.max(1, a.nW - 1)) * (P.length - 1), j = Math.min(P.length - 2, Math.floor(u));
        return { tap: mid(P[j], P[j + 1], u - j), wait: 350 };
      }
      if (a.step === 'water') return { holdUntil: [W * 0.5, HH * 0.5, C('return !a||a.step!==\'water\'||a.water>=1.04'), 7000] };
      return { wait: 250 };
    },
    pave(a) {
      const rows = a.closed.length, plan = PAVE[rows] || PAVE[1];
      const bk = a.slabs.find((q) => q.broken && !q.gone && !q.at);
      for (const [L, cx, cy] of plan) {
        if (a.grid[cy][cx] !== '0') continue;
        const q = a.slabs.find((s) => !s.at && !s.gone && !s.broken && s.L === L);
        if (!q) break;
        const t = mid(a.cells[cy][cx], a.cells[cy][cx + L - 1]);
        return { drag: [q.scr[0], q.scr[1], t[0], t[1], 700], wait: 500, note: `pave L${L} → ${cx},${cy}` };
      }
      if (bk) return { drag: [bk.scr[0], bk.scr[1], a.rej[0], a.rej[1], 700], wait: 500, note: 'pave: the broken slab to the reject ring' };
      return { wait: 400 };
    },
    waste(a) {
      if (a.phase === 'load' && a.chunks.length) {
        const c = a.chunks[0], s = a.sled;
        return { when: C('return !a||a.phase!==\'load\'||(a.ph>0.25&&a.ph<0.38)'), max: 3000, then: { path: [c, [s[0], s[1] - 10]], ms: 450 }, wait: 0 };
      }
      if (a.phase === 'push') return { holdUntil: [W * 0.75, HH * 0.5, C('return !a||a.phase!==\'push\'||a.dFill<3.2'), 20000] };
      return { wait: 300 };
    },
    corner(a) {
      if (a.phase === 'lift') {
        const since = now() - (B.k.sw || 0);
        if (since < 300) return { wait: Math.max(10, 300 - since) };
        B.k.sw = now();
        return { drag: [W * 0.72, HH * 0.38, W * 0.72, HH * 0.38 + 90, 120] };
      }
      if (a.phase === 'lower') {
        if (a.gap > 1.0) return { holdUntil: [W * 0.6, HH * 0.5, C('return !a||a.phase!==\'lower\'||a.gap<0.95'), 9000] };
        if (a.swing > 0.8) return { wait: 60 };
        return { hold: [W * 0.6, HH * 0.5, 230], wait: 120 };
      }
      return { wait: 250 };
    },
    course(a) {
      if (a.phase === 'choose') {
        const want = a.want, end = a.gap[1], left = end - want;
        const ok = (L) => L <= left + 0.01 && (Math.abs(want + L - end) < 0.01 || (!a.below.some((b) => Math.abs(b - (want + L)) < 0.3) && end - (want + L) >= 2 - 0.01));
        const L = [4, 3, 2].find(ok) || [2, 3, 4].find((l) => l <= left + 0.01) || 2;
        return { tap: a.stock[[2, 3, 4].indexOf(L)], wait: 700, note: `course: take ${L} for ${want}..${end}` };
      }
      if (a.phase === 'aim' && a.cur) {
        const f = (a.want + a.cur / 2 - a.gap[0]) / (a.gap[1] - a.gap[0]), p = mid(a.gapScr[0], a.gapScr[1], f);
        return { path: [p, [p[0] + 1, p[1]]], ms: 120, keep: 6000, release: C('return !a||(Math.abs(a.hz-a.tz)<0.05&&Math.abs(a.sx)<0.25)') };
      }
      return { wait: 250 };
    },
    great(a) {
      if (a.phase === 'roll' && a.out.length) return { drag: [a.out[0][0], a.out[0][1], a.frontScr[0], a.frontScr[1], 600] };
      return { wait: 120 };
    },
    letters(a) {
      if (!a.strokes) return { wait: 300 };
      if (B.k.li !== a.i) { B.k.li = a.i; B.k.si = 0; }
      const st = a.strokes[B.k.si % a.strokes.length]; B.k.si++;
      let len = 0; for (let i = 1; i < st.length; i++) len += Math.hypot(st[i][0] - st[i - 1][0], st[i][1] - st[i - 1][1]);
      return { path: st, ms: Math.max(350, len * 3), wait: 250 };
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
  };
  // (build 112: a slab on the crane's rope — turn it square, the right way up, then lower it fast and touch down gently)
  B.hang = (h, at, top, vSafe) => {
    if (!h || !at || h.busy || h.mode === 'seated') return { wait: 300 };
    at = [Math.max(60, Math.min(W - 60, at[0])), Math.max(150, Math.min(HH - 110, at[1]))];   // (the rope takes a press anywhere: never on the top bar)
    if (h.flip) return { tap: at, wait: 1100, note: 'hang: the crew turns it over' };
    const th = h.th, thT = h.thT;
    if (Math.abs(th) > 0.07) {
      const dx = (-th / (Math.PI * 2 * 0.9)) * Math.max(320, W);
      return { drag: [at[0], at[1], at[0] + dx, at[1], 500], wait: 1300, note: `hang: turn ${th} (${Math.round(dx)}px)` };
    }
    if (h.gust && (h.gust.warn || h.gust.on > 0)) return { wait: 250, note: 'hang: a gust' };
    if (h.y > h.seatY + 1.0) return { holdUntil: [at[0], at[1], C(`const h=a&&a.h;return !h||h.mode==='seated'||h.y<h.seatY+0.95||(h.gust&&(h.gust.warn||h.gust.on>0))`), 9000], wait: 500 };
    return { hold: [at[0], at[1], vSafe < 0.8 ? 420 : 470], wait: 350 };
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
    if (now() - B.actT > 240000) { B.actT = now(); return { eval: '__T.game.h109._end({stars:1})', note: 'STUCK in ' + S.mission + ' ' + JSON.stringify(S.act).slice(0, 300) }; }
    const kind = S.mission.replace(/\d+$/, '');
    const f = play[kind]; if (!f) return { wait: 500, note: 'no player for ' + kind };
    try { return f(S.act); } catch (e) { return { wait: 500, note: 'bot error ' + kind + ' ' + e.message }; }
  };
  return 'bot ready';
})();
