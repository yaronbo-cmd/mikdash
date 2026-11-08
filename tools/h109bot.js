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
  };
  B.next = () => {
    const S = H().state();
    if (!S.started && S.phase === 'off') {
      if (!B.endSeen) { B.endSeen = now(); return { wait: 2500, shot: 'stage-end', note: 'the stage is over' }; }
      return { done: true };
    }
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
