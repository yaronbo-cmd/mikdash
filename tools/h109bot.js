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
      if (a.phase === 'ready') return { holdUntil: [a.hs ? a.hs[0] : W * 0.6, a.hs ? a.hs[1] : HH * 0.55, C(`return !a||a.side!==${a.side}||a.d>47.6||(a.phase!=='ready'&&a.phase!=='pull')`), 20000] };
      return { wait: 250 };
    },
    rocks(a) {
      if (a.phase === 'work') return { tapWhen: [W * 0.5, HH * 0.5, C('return !!a&&a.phase===\'work\'&&a.ph>0.875&&a.ph<0.925'), 3000] };
      return { wait: 200 };
    },
    read(a) {
      // (build 117: trace the crack with the light along a.near, then the wedges along it, struck in rounds, then the water)
      if (a.busy) return { wait: 200 };
      if (a.step === 'trace') {
        const i = a.marked.indexOf('0'); if (i < 0) return { wait: 300 };
        const P = a.near[Math.max(0, i - 1)], Q = a.near[Math.min(a.near.length - 1, i + 3)];
        return { drag: [P[0], P[1], Q[0], Q[1], 900], wait: 300, note: 'read: trace ' + i + '/' + a.near.length };
      }
      if (a.step === 'wedge') {
        const n = a.near.length, k = a.wedges.length, j = Math.round(2 + ((n - 4) * k) / Math.max(1, a.nW - 1));
        return { tap: a.near[Math.min(n - 1, j)], wait: 900, note: 'read: wedge at ' + j };
      }
      if (a.step === 'strike') {
        let bi = 0; a.wedges.forEach((w, i) => { if (w.blows < a.wedges[bi].blows) bi = i; });
        return { tap: a.wedges[bi].scr, wait: 420, note: 'read: strike ' + bi + ' (' + a.wedges.map((w) => w.blows).join(',') + ')' };
      }
      if (a.step === 'water') return { holdUntil: [W * 0.5, HH * 0.5, C('return !a||a.step!==\'water\'||a.water>=1.04'), 7000] };
      return { wait: 250 };
    },
    pave(a) {
      // (build 116: a quarter in seven sizes) the cracked slab to the crate; then the true tiling's slabs, each turned to its lie
      const ck = a.tops.find((q) => q.cracked);
      if (ck && a.crate) return { drag: [ck.scr[0], ck.scr[1], a.crate[0], a.crate[1], 700], wait: 500, note: 'pave: the cracked slab to the crate' };
      const free = (t) => { for (let y = t.y; y < t.y + t.h; y++) for (let x = t.x; x < t.x + t.w; x++) if (a.board[y][x] !== '0') return false; return true; };
      for (const t of a.tiles) {
        if (!free(t)) continue;
        const k = Math.min(t.w, t.h) + 'x' + Math.max(t.w, t.h), q = a.tops.find((s) => s.k === k && !s.cracked);
        if (!q) return { wait: 400, note: 'pave: no top ' + k };
        if (q.w !== t.w) return { tap: q.scr, wait: 500, note: `pave: turn ${k}` };
        const c0 = a.cells[t.y][t.x], c1 = a.cells[t.y + t.h][t.x + t.w];
        return { drag: [q.scr[0], q.scr[1], (c0[0] + c1[0]) / 2, (c0[1] + c1[1]) / 2, 700], wait: 500, note: `pave ${t.w}x${t.h} → ${t.x},${t.y}` };
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
      if (a.phase === 'push' && a.v < 0.1) return { holdUntil: [a.trk && a.trk[0] > 0 && a.trk[0] < W ? a.trk[0] : W * 0.75, a.trk && a.trk[1] > 0 && a.trk[1] < HH ? a.trk[1] : HH * 0.5, C('return !a||a.phase!==\'push\'||a.d>=a.tgt-1.25'), 20000], wait: 1500 };   // (build 125: on the track — the push's own grip)
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
        // (build 116: three grips) the jib's head over the rectangle, the rope turns it square, then short holds on the stone
        if (a.dx > 0.06 && a.swing < 0.6) {
          // drag the jib's head by the stone's offset on the screen (the floor point under the stone → the rectangle)
          return { drag: [a.tipScr[0], a.tipScr[1], a.jibTo[0], a.jibTo[1], 700], wait: 2200, note: `corner: jib dx ${a.dx} off ${a.offX},${a.offZ}` };
        }
        if (Math.abs(a.rotE) > a.tol * 0.4) { const px = Math.max(-300, Math.min(300, (-a.rotE * Math.PI / 180) / 0.011)); return { drag: [a.ropeScr[0], a.ropeScr[1], a.ropeScr[0] + px, a.ropeScr[1], 600], wait: 1800, note: `corner: rope ${a.rotE}° → ${Math.round(px)}px` }; }
        if (a.swing > 0.5) return { wait: 400 };
        if (a.gap > 1.4) return { hold: [a.stoneScr[0], a.stoneScr[1], 700], wait: 250, note: 'corner: lower gap ' + a.gap };
        return { hold: [a.stoneScr[0], a.stoneScr[1], 260], wait: 200, note: 'corner: lower gap ' + a.gap };
      }
      return { wait: 250 };
    },
    course(a) {
      // (build 117: three grips) the jib's head moves it over its place, the guide rope turns it along the wall, a hold lowers it
      if (a.phase === 'choose') {
        const laid = a.set.map((q) => q[2]); const next = a.sol.find((L) => !laid.includes(L));
        const q = a.stock.find((s) => s.L === next); if (!q) return { wait: 400, note: 'course: no stone ' + next };
        return { tap: q.scr, wait: 1500, note: `course: take ${next}` };
      }
      if (a.phase === 'carry' && a.tgt && a.tipScr) {
        const t = a.tgt, off = Math.hypot(t[0] - a.stoneScr[0], t[1] - a.stoneScr[1]);
        if (a.sway > 0.3) return { wait: 400 };
        // (the rope sets where it will turn to, rotTE; the stone follows late: drag by the target's error, then let it come round)
        if (Math.abs(a.rotTE) > a.tol * 0.4) { const px = Math.max(-300, Math.min(300, (-a.rotTE * Math.PI / 180) / 0.011)); return { drag: [a.ropeScr[0], a.ropeScr[1], a.ropeScr[0] + px, a.ropeScr[1], 600], wait: 1500, note: `course: rope ${a.rotTE}°` }; }
        if (Math.abs(a.rotE) > a.tol * 0.6) return { wait: 400 };
        if ((Math.abs(a.dz - a.ta) > 0.12 || Math.abs(a.sx - a.wallX) > 0.35) && off > 4) {
          const k = a.gapB > 1.5 ? 0.85 : 1;
          const j = a.jibScr || a.tipScr; return { drag: [j[0], j[1], j[0] + (t[0] - a.stoneScr[0]) * k, j[1] + (t[1] - a.stoneScr[1]) * k, 700], wait: 2000, note: `course: jib dz ${a.dz}/${a.ta} x ${a.sx}` };
        }
        if (a.gapB > 1.0) return { hold: [a.stoneScr[0], a.stoneScr[1], 600], wait: 300, note: 'course: lower ' + a.gapB };
        return { hold: [a.stoneScr[0], a.stoneScr[1], 230], wait: 200, note: 'course: lower ' + a.gapB };
      }
      return { wait: 250 };
    },
    great(a) {
      // (build 116: down the slope) hold the stone and pull a little forward (steering to the way's middle), let go before the bends;
      // slow into the green place at the end
      if (a.phase !== 'move') return { wait: 300 };
      const bend = a.bendAhead.some(Boolean), toEnd = a.L - a.s, vb = [3, 3, 2.6][a.lv - 1];
      const want = toEnd < 16 ? 0.9 : (bend ? vb : a.lim) * 0.62;
      const side = Math.max(-1, Math.min(1, -a.o * 0.9 - a.a * 7));
      if (toEnd <= 3 && Math.abs(a.v) < 0.05) {
        if (Math.abs(a.a) < 0.06) return { wait: 600, note: 'great: in place' };
        const k = side * 1.2; return { path: [a.stone, [a.stone[0] + (a.right[0] - a.stone[0]) * k, a.stone[1] + (a.right[1] - a.stone[1]) * k]], ms: 300, keep: 1500, release: C('return !a||a.phase!==\'move\'||Math.abs(a.a)<0.03'), note: 'great: straighten ' + a.a };
      }
      if (a.v >= want * 0.85) return { wait: 150 };
      const pull = Math.min(1, (want + 0.3) / 6) * 1.4;
      const x = a.stone[0] + (a.fwd[0] - a.stone[0]) * pull + (a.right[0] - a.stone[0]) * side * 1.2, y = a.stone[1] + (a.fwd[1] - a.stone[1]) * pull + (a.right[1] - a.stone[1]) * side * 1.2;
      const stop = toEnd < 16 ? `a.s>=a.L-1.6` : bend ? `a.v>=${(want).toFixed(2)}` : `a.v>=${want.toFixed(2)}||a.bendAhead.some(Boolean)`;
      return { path: [a.stone, [x, y]], ms: 250, keep: 2500, release: C(`return !a||a.phase!=='move'||${stop}`), note: `great: pull s ${a.s} v ${a.v} want ${want.toFixed(2)} o ${a.o}` };
    },
    letters(a) {
      // (build 114: part 2 — a chisel blow on each glowing point; part 3 — aim with a drag, hold to the band's middle and let go)
      if (a.part === 2) return a.next ? { tap: a.next, wait: 160 } : { wait: 300 };
      if (a.part !== 3 || a.done) return { wait: 300 };
      const mid = (a.band[0] + a.band[1]) / 2;
      if (a.terua && a.terua.step === 1) return { tap: [W * 0.5, HH * 0.5], wait: 230 };
      if (a.blast === 3) return { wait: 400 };
      if (a.blast < 3 && a.want != null && Math.abs(a.want - a.aim) > 1.5) { const dx = -((a.want - a.aim) * Math.PI / 180) / 0.0032; return { drag: [W * 0.3, HH * 0.3, W * 0.3 + Math.max(-W * 0.28, Math.min(W * 0.28, dx)), HH * 0.3, 500], wait: 300, note: `letters: aim ${a.aim} → ${a.want}` }; }
      return { holdUntil: [a.tp[0], a.tp[1], C(`return !a||a.part!==3||(a.hold&&a.breath>=${mid.toFixed(3)})`), 6000], wait: 900, note: 'letters: blow ' + a.blast };
    },
    // ── build 111 ── stage 02's acts (h111/acts*.js dbg())
    // ── h118 ── the kohen carries the stake: drag it to the corner, wait for him, then three blows; a failed test → tap to pull ── /h118 ──
    stakes(a) {
      if (a.phase === 'pull') return { tap: a.stakeScr, wait: 900, note: 'stakes: pull' };
      if (a.phase !== 'walk') return { wait: 400 };
      if (a.walking) return { wait: 300 };
      // (tests: window.__STAKES_BAD = n drives it off the corner on purpose, n times)
      if ((window.__STAKES_BAD | 0) > a.drives && a.taps === 0 && B.badD !== a.drives) { B.badD = a.drives; return { drag: [a.stakeScr[0], a.stakeScr[1], a.targetScr[0] + 70, a.targetScr[1] + 30, 700], wait: 1500, note: 'stakes: off on purpose' }; }
      if ((window.__STAKES_BAD | 0) > a.drives && a.taps < 3) return { tap: a.stakeScr, wait: 800, note: 'stakes: blow (off)' };
      const off = Math.max(Math.abs(a.n - a.needN), Math.abs(a.e - a.needE));
      if (off > a.tol * 0.6 && a.taps === 0) return { drag: [a.stakeScr[0], a.stakeScr[1], a.targetScr[0], a.targetScr[1], 700], wait: 1500, note: `stakes: walk n ${a.n} e ${a.e}` };
      return { tap: a.stakeScr, wait: 800, note: `stakes: blow ${a.taps + 1}` };
    },
    // ── h118 ── the bond puzzle with the crane: tap the stone of the solution in the stock row; carry: rope turns it, drag moves the jib,
    // a still hold on the stone lowers it ── /h118 ──
    bond(a) {
      if (a.phase === 'choose') {
        const key = a.laid.length + '/' + a.lifts + '/' + a.cracks; if (B.bc !== key) { B.bc = key; return { wait: 1500 }; }   // (the camera comes back first)
        const bad = a.laid.find((q) => !q.sol); if (bad) return { tap: bad.scr, wait: 1500, note: `bond: lift the stray ${bad.L} at ${bad.a}/${bad.row}` };
        if (!a.next) return { wait: 400, note: 'bond: nothing next' };
        const q = a.stock.find((s) => s.id === a.next.id); if (!q) return { wait: 400, note: 'bond: no stone ' + a.next.L };
        return { tap: q.scr, wait: 1200, note: `bond ${a.G}: take ${a.next.L} for ${a.next.a}/${a.next.row}` };
      }
      if (a.phase !== 'carry' || !a.stoneScr) return { wait: 300 };
      if (!a.next || !a.held || a.held.L !== a.next.L) {   // (the wrong stone in the hook: down on the floor, it goes back to its place in the row)
        const h = (a.stock.find((q) => a.held && q.id === a.held.id) || {}).home; if (!h) return { wait: 300 };
        if (a.land && !a.land.off) return { drag: [a.stoneScr[0], a.stoneScr[1], h[0], h[1] + 40, 800], wait: 1800, note: 'bond: back to the row' };
        return { holdUntil: [a.stoneScr[0], a.stoneScr[1], C("return !a||a.phase!=='carry'"), 7000], wait: 600, note: 'bond: down on the floor' };
      }
      if (a.sway > 0.3) return { wait: 400, note: 'bond: sway ' + a.sway };
      if (a.lag > 0.5) return { wait: 400, note: 'bond: jib coming ' + a.lag };
      if (Math.abs(a.rotTE) > a.tol * 0.4) { const px = Math.max(-300, Math.min(300, (-a.rotTE * Math.PI / 180) / 0.011)); return { drag: [a.ropeScr[0], a.ropeScr[1], a.ropeScr[0] + px, a.ropeScr[1], 600], wait: 1500, note: `bond: rope ${a.rotTE}` }; }
      if (Math.abs(a.rotE) > a.tol * 0.6) return { wait: 400 };
      const ok = a.land && !a.land.off && a.land.a === a.next.a && String(a.land.row) === String(a.next.row);
      const t = a.tgtScr, off = t ? Math.hypot(t[0] - a.stoneScr[0], t[1] - a.stoneScr[1]) : 0;
      if (!ok || off > 14) return { drag: [a.stoneScr[0], a.stoneScr[1], t[0], t[1], 800], wait: 1800, note: `bond: carry to ${a.next.a}/${a.next.row} (land ${a.land && a.land.a}/${a.land && a.land.row}) off ${Math.round(off)}` };
      return { holdUntil: [a.stoneScr[0], a.stoneScr[1], C("return !a||a.phase!=='carry'||(a.land&&a.land.why)"), 7000], wait: 600, note: 'bond: lower' };
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
    // ── build 120 ── station 1, the column: pull the rope down (slowly at level 3), near the balance the post: press and turn round
    // it to let the column down onto its plinth (touch: one finger still pulling a little, the other braking; mouse: a heave, then the
    // post); then the plumbs: a wedge on the side it leans to, the plumb weight to accept. __BOT.bad: 'nobrake' (never the post),
    // 'fast' (the rope paid out in a rush: a hard landing), 'sharp' (level 3: two sharp pulls above 45°)
    col(a) {
      const bad = B.bad || '', mouse = !!a.mouse || !!window.__BOT_MOUSE;
      if (a.busy) return { wait: 200 };
      if (a.phase === 'rise' && a.rope) {
        const tol = a.tol, near = a.th >= a.BAL - tol + 0.3, circle = (c, turns, ms, r = 42) => { const n = Math.max(12, Math.round(ms / 50)), pts = []; for (let i = 0; i <= n; i++) { const t = (i / n) * turns * Math.PI * 2; pts.push([c[0] + Math.cos(t) * r, c[1] + Math.sin(t) * r]); } return pts; };
        if (bad === 'sharp' && a.pulley && a.th > 50 && a.tears === 0 && !a.crossed) return { path: [a.rope, a.ropeTo], ms: 70, wait: 250, note: 'col: a sharp pull (' + a.sharp + ')' };
        // (level 2: the guy crew hauls the top back against the east wind)
        // (a haul inside each gust holds the guy taut through it; the crossing waits for a gust to have just passed)
        if (a.guy && a.gust > 0.4 && !a.guyHold && bad !== 'nobrake') return { tap: a.guy, wait: 250, note: 'col: the guy rope in the gust (sway ' + a.sway + ')' };
        if (a.guy && Math.abs(a.sway) > 0.6 && a.gust <= 0.3 && !a.crossed && bad !== 'nobrake') return { tap: a.guy, wait: 600, note: 'col: the guy rope at sway ' + a.sway + ' ' + JSON.stringify(a.downs.slice(-1)) + ' t' + a.t };
        if (a.guy && !a.crossed && a.th >= a.BAL - a.tol - 3 && a.gustIn < 4.5 && bad !== 'nobrake') return { wait: 150 };
        // (the big pull, eased off before it runs away; the finger eases back before it lifts, so the foot does not walk)
        const relTh = [0, 56, 50, 37][a.lv] || 37, ease = { after: [mid(a.rope, a.ropeTo, 0.2)], afterMs: 650 };
        if (!a.crossed && a.th < relTh) {
          if (a.w > 1) return { wait: 100 };
          return { path: [a.rope, a.ropeTo], ms: a.pulley ? 1100 : 700, keep: 25000, release: C(`return !a||a.phase!=='rise'||a.th>=${relTh}`), ...ease, wait: 30, note: 'col: pull at ' + a.th };
        }
        if (!a.crossed && !near && a.w > 1) return { wait: 80 };
        if (!a.crossed && a.th < (a.pulley ? 64 : a.BAL - a.tol - 2.5) && !mouse) return { path: [a.rope, mid(a.rope, a.ropeTo, 0.8)], ms: a.pulley ? 900 : 500, keep: 8000, release: C(`return !a||a.phase!=='rise'||a.th>=a.BAL-a.tol-4||a.w>4`), after: [mid(a.rope, a.ropeTo, 0.25)], afterMs: 350, wait: 30, note: 'col: nudge at ' + a.th };
        if (bad === 'nobrake') {
          if (a.crossed || a.w > 1) return { wait: 200, note: 'col: no brake, ' + a.th };
          return mouse ? { tap: a.rope, wait: 350, note: 'col: heave' } : { path: [a.rope, mid(a.rope, a.ropeTo, 0.95)], ms: 500, keep: 4000, release: C('return !a||a.crossed||a.phase!==\'rise\''), wait: 100 };
        }
        // (the brake: one turn round the post every 1.7 s, again and again until it stands; 'fast': the rope paid out in a rush, once)
        const fast = bad === 'fast', ms = fast ? 1000 : 2200, turns = fast ? 2.6 : 1;
        const UNTIL = C(`return !a||a.phase!=='rise'`), GUY = "(()=>{const h=__T.game.h109,a=h&&h.state().act;return a&&a.guy&&a.phase==='rise'?a.guy:null})()";
        if (mouse) {
          if (a.crossed) return { path: circle(a.post, turns, ms), ms, ...(fast ? {} : { pathUntil: UNTIL, pathMax: 30000 }), wait: 300, note: `col: brake at ${a.th} (${fast ? 'pay 2.6 turns in 1 s' : 'a turn each 2.2 s until it stands'})` };
          if (a.w < 0.6) return a.th < (a.pulley ? 64 : a.BAL - 8) ? { path: [a.rope, mid(a.rope, a.ropeTo, 0.92)], ms: 500, keep: 8000, release: C(`return !a||a.phase!=='rise'||a.th>=a.BAL-a.tol-2.5||a.w>5`), ...ease, wait: 30, note: 'col: nudge at ' + a.th } : { tap: a.rope, wait: 380, note: 'col: heave at ' + a.th };
          return { wait: 60 };
        }
        // (two fingers: the first keeps a little pull on the rope, the second comes to the post as the column reaches the balance)
        const P = circle(a.post, turns, ms), Rp = mid(a.rope, a.ropeTo, 0.45), fr = [[a.rope]];
        const k = a.crossed || a.pulley ? 1 : Math.max(1, Math.min(40, Math.round(((a.BAL - 0.8 - a.th) / Math.max(a.w, 3)) / 0.05)));
        for (let i = 1; i <= k; i++) fr.push([mid(a.rope, Rp, Math.min(1, i / 3))]);
        // (level 2: a third finger taps the guy crew now and then while the other two work: a haul inside a gust holds it)
        const loop = fr.length + 1;
        P.forEach((q, i) => { fr.push([Rp, q]); if (a.guy && i % 8 === 4) fr.push([Rp, q, GUY]); });
        return { seq: fr, ms: 50, ...(fast ? {} : { seqUntil: UNTIL, seqLoop: loop, seqMax: 30000 }), wait: 300, note: `col: two fingers from ${a.th} at ${a.w}°/s, the post after ${k} frames (${fast ? 'pay 2.6 turns in 1 s' : 'a turn each 2.2 s until it stands'})` };
      }
      if (a.phase === 'plumb' && a.sides && a.bobs) {
        if (!B.k.ps) { B.k.ps = 1; return { wait: 300, shot: `col${a.lv}-plumb`, note: `col: landed at ${a.land} °/s, lean ${a.lean}, off ${a.off}` }; }
        const L = a.lean, big = Math.abs(L[0]) >= Math.abs(L[1]) ? 0 : 1, v = L[big];
        if (Math.abs(v) > a.leanTol && a.wedges < 3) { const k = big === 0 ? (v > 0 ? 'pa' : 'na') : (v > 0 ? 'pc' : 'nc'); return { tap: a.sides[k], wait: 1100, note: `col: a wedge at ${k} (lean ${L})` }; }
        return { tap: a.bobs[0], wait: 1500, note: `col: accept (lean ${L}, off ${a.off}, wedges ${a.wedges}, land ${a.land})` };
      }
      return { wait: 250 };
    },
    // station 2, the measure and the saw: the cord's end onto the scratch (a second, finer drag in the macro), the tail drawn down to a
    // taut cord and let go inside the window; the mark at the reading; the string lifted to the middle of its window; then the strokes,
    // each when the carpenter's has ended: two short slow ones to start, long ones in the clear wood, short slow ones in the knot, the
    // prop when the end sags, the last two. __BOT.bad: 'slack' (the cord let go half taut), 'short' (the mark a tefach and a half short),
    // 'long' (the mark four fingers long), 'nominal' (the mark at the nominal eleven, unmeasured), 'noprop' (the fibres tear),
    // 'faint' (the string barely lifted)
    saw(a) {
      const bad = B.bad || '', has = (k) => bad.split(',').includes(k);   // (several at once: 'slack,noprop')
      if (a.busy) return { wait: 200 };
      if (a.phase === 'end' && a.end && a.markAt) return { drag: [a.end[0], a.end[1], a.markAt[0], a.markAt[1], 900], wait: 900, note: `saw: the end to the scratch (off ${a.off} fingers)` };
      for (const ph of ['tension', 'mark', 'line']) if (a.phase === ph && !B.k['s_' + ph]) { B.k['s_' + ph] = 1; return { wait: 700, shot: `saw${a.lv}-${ph}` }; }
      if (a.phase === 'tension' && a.tail) {
        if (Math.abs(a.off) > 0.25 && a.end && a.markAt) return { drag: [a.end[0], a.end[1], a.markAt[0], a.markAt[1], 700], wait: 700, note: `saw: the end finer (off ${a.off})` };
        const Tt = has('slack') ? 0.5 : 0.95;
        return { drag: [a.tail[0], a.tail[1], a.tail[0], a.tail[1] + a.reachT * Tt, 1100], wait: 900, note: `saw: the tail to T ${Tt} (off ${a.off})` };
      }
      if (a.phase === 'mark' && a.tapMeas) { const p = has('short') ? a.tapShort : has('long') ? a.tapLong : has('nominal') ? a.tapNominal : a.tapMeas; return { tap: p, wait: 1200, note: `saw: the mark (${bad || 'the reading'} ${a.read})` }; }
      if (a.phase === 'line' && a.string) { const h = has('faint') ? 0.2 : 0.55; return { drag: [a.string[0], a.string[1], a.string[0], a.string[1] - a.reachL * h, 500], wait: 1300, note: 'saw: the string lifted ' + h }; }
      if (a.phase === 'saw') {
        if (a.propAt && !has('noprop')) return { tap: a.propAt, wait: 1200, note: 'saw: the prop at depth ' + a.depth };
        // ('rhythm': a player in time — the finger already on the handle, the stroke begun as the carpenter's ends)
        if (has('rhythm') && a.n >= 1 && a.turn === 'carp' && !a.inStroke && a.handle && a.axis) {
          const inK = a.knot && a.depth >= a.knot[0] - 0.06 && a.depth <= a.knot[1], ln = inK ? 0.42 : 1.0, h = a.handle, to = [h[0] + a.axis[0] * a.strokePx * ln, h[1] + a.axis[1] * a.strokePx * ln];
          const lead = +(window.__BOT_RHY_LEAD || 0.075);
          return { when: C(`return !a||a.phase!=='saw'||a.turn!=='carp'||a.ct>=a.carpDur-${lead}`), max: 3000, then: { drag: [h[0], h[1], to[0], to[1], inK ? 520 : 560] }, wait: 60, note: `saw: stroke ${a.n + 1} in time (rhythm ${a.rhythm})` };
        }
        if (a.turn !== 'his' || a.inStroke || !a.handle) return { wait: 40 };
        const inKnot = a.knot && a.depth >= a.knot[0] - 0.06 && a.depth <= a.knot[1];
        const short = a.n < 2 || inKnot, len = short ? 0.42 : 1.0, ms = short ? 520 : 560;
        const h = a.handle, to = [h[0] + a.axis[0] * a.strokePx * len, h[1] + a.axis[1] * a.strokePx * len];
        if (!B.k.sawShot && a.depth > 0.3) { B.k.sawShot = 1; return { wait: 50, shot: `saw${a.lv}-mid` }; }
        if (!B.k.knotShot && inKnot) { B.k.knotShot = 1; return { wait: 50, shot: `saw${a.lv}-knot` }; }
        if (!B.k.sagShot && a.sag) { B.k.sagShot = 1; return { wait: 50, shot: `saw${a.lv}-sag` }; }
        // (each stroke once the carpenter's has ended; under the probe the bot's own round trip is longer than the ±0.12 s rhythm window,
        // so its strokes are rarely 'in rhythm' — a player's are)
        return { when: C(`return !a||a.phase!=='saw'||(a.turn==='his'&&!a.inStroke)`), max: 3000, then: { drag: [h[0], h[1], to[0], to[1], ms] }, wait: 60, note: `saw: stroke ${a.n + 1} ${short ? 'short' : 'long'} at depth ${a.depth} (drift ${a.drift}, skew ${a.skew}, binds ${a.binds}, rhythm ${a.rhythm})` };
      }
      return { wait: 250 };
    },
    // station 3, the beam on two shoulders: the act's careful way (a.way: the leading end and its point, in order). Each leg: a finger
    // held where the leading end should go (the camera is still under it; a point past the screen's edge is taken on the screen toward
    // it), lifted once the end is there; a rear leg starts on the rear man and drags to its point. Level 3 waits at the lane for a clear
    // crossing. Then the trim's three strokes when it is his turn. __BOT.bad: 'scaffold' (the way through the wood chamber's scaffold),
    // 'jar' (the beam swept across the level's jar), 'bump' (into the stone pile once)
    carry(a) {
      const bad = B.bad || '', has = (k) => bad.split(',').includes(k);
      for (const [ph, ms] of [['hoist', 2600], ['seat', 400], ['close', 2200]]) if (a.phase === ph && !B.k['c_' + ph]) { B.k['c_' + ph] = 1; return { wait: ms, shot: `carry${a.lvP}-${ph}` }; }
      if (a.busy) return { wait: 250 };
      if (a.phase === 'trim' && a.trim) {
        const t = a.trim; if (!B.k.trimShot) { B.k.trimShot = 1; return { wait: 300, shot: `carry${a.lvP}-trim` }; }
        if (t.turn !== 'his') return { wait: 60 };
        const h = t.handle, to = [h[0] + t.axis[0] * t.strokePx * 0.62, h[1] + t.axis[1] * t.strokePx * 0.62];
        return { when: C("return !a||a.phase!=='trim'||(a.trim&&a.trim.turn==='his')"), max: 3000, then: { drag: [h[0], h[1], to[0], to[1], 520] }, wait: 200, note: `carry: trim stroke ${t.n + 1}` };
      }
      if (a.phase !== 'carry') return { wait: 300 };
      if (!B.k.way) {
        B.k.way = a.way.map((w) => w.slice()); B.k.wi = 0;
        // (wrong play: a detour that meets what it should not)
        if (has('jar') && a.lvP === 1) B.k.way.splice(2, 0, ['f', 78.5, 41.4]);
        if (has('scaffold') && a.lvP === 3) B.k.way.splice(7, 0, ['f', 130.6, -25.0]);
        if (has('bump') && a.lvP === 1) B.k.way.splice(2, 0, ['f', 70.5, 39.5], ['f', 74.5, 39.6]);
        return { wait: 200, shot: `carry${a.lvP}-start` };
      }
      const W = B.k.way, i = B.k.wi;
      if (i >= W.length) { if (!B.k.endShot) { B.k.endShot = 1; return { wait: 900, shot: `carry${a.lvP}-marked`, note: `carry: at the mark ${JSON.stringify(a.inMark)} bumps ${a.bumps}` }; } return { wait: 300, note: `carry: waiting for the handing over ${JSON.stringify(a.inMark)} still ${a.still}` }; }
      const [m, x, z] = W[i], p = m === 'r' ? a.r : a.f;
      if (Math.hypot(p[0] - x, p[1] - z) < 0.12) { B.k.wi = i + 1; const sh = { 1: [3, 6], 2: [4, 6], 3: [5, 9] }[a.lvP] || []; if (sh.includes(i + 1)) return { wait: 300, shot: `carry${a.lvP}-leg${i + 1}` }; return { wait: 80, note: `carry: leg ${i + 1}/${W.length} (${m} ${x},${z}) bumps ${a.bumps} dmg ${a.dmg} ${a.events.join(',')}` }; }
      // (level 3: the lane's sledge and cart; cross only when neither is coming within reach)
      if (a.lvP === 3 && i === 5 && !B.k.laneOk) { if (!a.laneClear) { B.k.laneW0 = B.k.laneW0 || performance.now(); return { wait: 250, note: 'carry: waiting at the crossing ' + JSON.stringify(a.lane) }; } B.k.laneOk = 1; window.__LANE_WAIT = B.k.laneW0 ? +((performance.now() - B.k.laneW0) / 1000).toFixed(1) : 0; }
      if (!a.camOK) return { wait: 150 };   // (the camera eases toward the beam between holds: a point is taken once it is still)
      const aim = window.__H120C && window.__H120C.aim(m, x, z); if (!aim) return { wait: 200 };
      const to = aim.to, cond = C(`if(!a||a.phase!=='carry')return true;const p=${m === 'r' ? 'a.r' : 'a.f'};return Math.hypot(p[0]-(${to[0]}),p[1]-(${to[1]}))<0.1||(a.toD!=null&&a.toD<0.03)`);
      if (m === 'r') return { path: [a.rScr, aim.pt], ms: 500, keep: 30000, release: cond, wait: 150, note: `carry: the rear to ${to.map((v) => v.toFixed(1))}` };
      // (a front leg's finger never on the rear man: that would lead the rear)
      if (Math.hypot(aim.pt[0] - a.rScr[0], aim.pt[1] - a.rScr[1]) < a.grip + 4) return { wait: 200, note: 'carry: the point is on the rear man' };
      return { path: [a.fScr, aim.pt], ms: 500, keep: 30000, release: cond, wait: 150, note: `carry: the front to ${to.map((v) => v.toFixed(1))}` };   // (build 124: the finger lands on the kohen — a right-half touch elsewhere is the look's)
    },
    // station 4, the mikveh: level 3's ring to three amot; a test pour; the reference way drawn from the hollow to the basin; each point
    // the fall asks deeper held until it is deep enough (in order); level 3's overflow from the outlet to the door; the plug pulled up;
    // a stop mended the same way. __BOT.bad: 'trough' (level 2: the straight way, through the plasterers' trough), 'jar' (level 2: a jar
    // dragged into the channel), 'finger' (a hold to the fifth finger), 'low' / 'high' (level 3's ring at 2.6 / 3.5 amot), 'lime'
    // (level 3: the overflow straight downhill). After a pasul the vessel is dragged off the way.
    mikveh(a) {
      const bad = B.bad || '', has = (k) => bad.split(',').includes(k), M4 = window.__H120M;
      const shots = { rod: 1800, draw: 300, run: 2600, stop: 1600, fill: 3000, over: 2000, pasul: 2600, spill: 2000, lime: 1200, end: 1500 };
      for (const [ph, ms] of Object.entries(shots)) if (a.phase === ph && !B.k['m_' + ph]) { B.k['m_' + ph] = 1; return { wait: ms, shot: `mik${a.lvP}-${ph}` }; }
      if (a.phase === 'pasul' && B.k.m_pasul && !B.k.m_shower) { B.k.m_shower = 1; return { wait: 3000, shot: `mik${a.lvP}-shower` }; }
      if (a.phase === 'fill' && !B.k.m_fill2 && a.h > (a.h0 + (a.goal || 3)) / 2) { B.k.m_fill2 = 1; return { wait: 50, shot: `mik${a.lvP}-fill-mid` }; }
      if (a.busy || a.cut != null) return { wait: 250 };
      if (a.phase === 'rod' && a.ring) {
        const want = has('low') ? 2.6 : has('high') ? 3.5 : 3, dy = -(want - a.ring.h) * a.ring.up;
        return { drag: [a.ring.at[0], a.ring.at[1], a.ring.at[0], a.ring.at[1] + dy, 1100], wait: 1600, note: `mik: the ring to ${want} (${a.ring.up} px an amah)` };
      }
      if (!['draw', 'stop', 'over-stop'].includes(a.phase)) return { wait: 250 };
      // (the first time: a test pour beside the hollow, for the still of its thread)
      if (!B.k.poured && a.phase === 'draw' && M4) { B.k.poured = 1; const h = a.refIn[Math.min(a.refIn.length - 2, 5)]; return { tap: [h[0], h[1] + 70], wait: 3000, note: 'mik: a test pour' }; }   // (a few amot down the way, off it)
      if (B.k.poured === 1) { B.k.poured = 2; return { wait: 100, shot: `mik${a.lvP}-pour` }; }
      // (after a pasul: the vessel off the way)
      if (a.pasul && a.res && a.res.vessel && M4 && !B.k['off' + a.pasul]) {
        if (a.busy || a.phase !== 'draw') return { wait: 400 };
        B.k['off' + a.pasul] = 1; const v = a.vessels.find((q) => q.id === a.res.vessel), to = M4.scr(...({ trough: [24.5, -58.5], jar1: [30.5, -58.5] }[v.id] || [20, -60]));
        return { drag: [v.at[0], v.at[1], to[0], to[1], 1400], wait: 900, note: 'mik: the vessel off the way ' + v.id };
      }
      // the inflow
      if (!a.chIn || !a.reaches) {
        let pts = a.refIn.map((q) => [q[0], q[1]]);
        if (has('trough') && a.lvP === 2) pts = [pts[0], a.inlet];
        return { path: pts, ms: Math.max(1800, pts.length * 140), wait: 900, note: `mik: the way from the hollow (${pts.length} points${has('trough') ? ', straight' : ''})` };
      }
      if (has('jar') && a.lvP === 2 && !B.k.jarIn && M4) { B.k.jarIn = 1; const v = a.vessels.find((q) => q.id === 'jar1'), to = M4.scr(28, -47.45); return { drag: [v.at[0], v.at[1], to[0], to[1], 1200], wait: 900, note: 'mik: a jar into the channel' }; }
      const deep = (L, key) => {
        if (!L || !L.length) return null; const q = L[0];
        if (has('finger') && !B.k.cracked) { B.k.cracked = 1; return { holdUntil: [q.at[0], q.at[1], C('return !a||a.cracks>0||a.busy'), 9000], wait: 1200, note: 'mik: a fifth finger at ' + q.i }; }
        return { holdUntil: [q.at[0], q.at[1], C(`if(!a||a.busy)return true;const n=(a.${key}||[]).find(o=>o.i===${q.i});return !n||n.cur>=3.85`), 7000], wait: 350, note: `mik: deepen ${key} ${q.i} from ${q.cur} to ${q.need}` };
      };
      if (has('stop') && !a.stops && a.phase === 'draw' && !a.plugOut) return { drag: [a.plug[0], a.plug[1], a.plug[0], a.plug[1] - 110, 600], wait: 900, note: 'mik: the plug before deepening (a stop)' };
      const d1 = deep(a.needIn, 'needIn'); if (d1) return d1;
      if (a.lvP === 3 && !a.chOv && a.outlet != null) {
        let pts = a.refOver.map((q) => [q[0], q[1]]); if (has('lime')) pts = [a.outletS, a.door];
        return { path: pts, ms: Math.max(1800, pts.length * 140), wait: 900, note: `mik: the overflow (${has('lime') ? 'straight downhill' : 'round the pit'})` };
      }
      const d2 = a.lvP === 3 ? deep(a.needOv, 'needOv') : null; if (d2) return d2;
      if (!a.plugOut && a.phase === 'draw') return { drag: [a.plug[0], a.plug[1], a.plug[0], a.plug[1] - 110, 600], wait: 900, note: `mik: the plug (res ${JSON.stringify(a.res)})` };
      return { wait: 300, note: 'mik: waiting ' + a.phase + ' ' + JSON.stringify(a.res) };
    },
    // the planks (8.1): a drag from the plank in hand to its place; the first one let go early (it stays), the third a short push (it glides)
    planks(a) {
      if (a.phase !== 'lay' || !a.from || a.glide || Math.abs(a.p - a.pT) > 0.02) return { wait: 300 };
      if (!B.k.lay) { B.k.lay = 1; return { wait: 200, shot: 'planks-start' }; }
      if (a.i === 0 && !B.k.early) { B.k.early = 1; const f = a.from, t = a.to, u = 0.15; return { drag: [f[0], f[1], Math.round(f[0] + (t[0] - f[0]) * u), Math.round(f[1] + (t[1] - f[1]) * u), 500], wait: 900, note: 'planks: let go early (it stays)' }; }
      if (a.i === 3 && !B.k.mid) { B.k.mid = 1; return { wait: 300, shot: 'planks-mid' }; }
      const u = a.i === 2 ? 0.45 : 1.05, f = a.from, t = a.to;
      return { drag: [f[0], f[1], Math.round(f[0] + (t[0] - f[0]) * u), Math.round(f[1] + (t[1] - f[1]) * u), 700], wait: 1200, note: `planks: ${a.i + 1}/${a.n} laid ${a.laid.join(',')}` };
    },
    // ── /build 120 ──
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
      // (build 120: __BOT_MIX — the next plan work of another kind than the last one, so the stations mix)
      if (window.__BOT_MIX && !S.mission && now() - B.goT > 7000) {
        const open = (S.open || []).filter((id) => !/F:/.test(id)), kd = (id) => id.replace(/\d+$/, '');
        const pick = open.find((id) => kd(id) !== B.lastKind) || open[0];
        if (pick) { B.goT = now(); B.lastKind = kd(pick); return { eval: `__T.game.h109._goId(${JSON.stringify(pick)})`, wait: 300, note: 'mix → ' + pick }; }
      }
      if (now() - B.goT > 7000) { B.goT = now(); return { eval: '__T.game.h109.goTo()', wait: 300 }; }
      return { wait: 300 };
    }
    if (S.phase !== 'act' || !S.act) return { wait: 300 };
    if (!B.begun || B.m !== S.mission) { B.m = S.mission; B.begun = true; B.k = {}; B.actT = now(); return { wait: 1600, shot: S.mission, note: 'act ' + S.mission }; }
    if (now() - B.actT > (/^(bond|carry|mikveh)/.test(S.mission) ? 600000 : 240000)) { B.actT = now(); return { eval: '__T.game.h109._end({stars:1})', note: 'STUCK in ' + S.mission + ' ' + JSON.stringify(S.act).slice(0, 1400) }; }
    const kind = S.mission.replace(/F:.*$/, '').replace(/\d+(q\d)?$/, "").replace(/^(course|waste|rocks|read|pave)\d*/, "$1");   // (build 120: a free work 'colF:S3' is a 'col')
    const f = play[kind]; if (!f) return { wait: 500, note: 'no player for ' + kind };
    try { return f(S.act); } catch (e) { return { wait: 500, note: 'bot error ' + kind + ' ' + e.message }; }
  };
  return 'bot ready';
})();
