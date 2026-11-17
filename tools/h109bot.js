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
  // (build 125: a touch only where the world is under the finger — never on a HUD button or card: a hold on the menu opened it)
  // (a finger is not a point: the browser's touch adjustment takes a touch a few px from a button as the button's — so the world must be
  //  under the whole fingertip, 28 px round)
  const isWorld = (e) => !!e && (e.tagName === 'CANVAS' || (e.classList && e.classList.contains('h109-touch')));
  const onWorld = (x, y) => { if (!(x > 28 && x < W - 28 && y > 28 && y < HH - 28)) return false; for (const [dx, dy] of [[0, 0], [28, 0], [-28, 0], [0, 28], [0, -28], [20, 20], [-20, 20], [20, -20], [-20, -20]]) if (!isWorld(document.elementFromPoint(x + dx, y + dy))) return false; return true; };
  // (build 04m: one pointer — the page's own test (src/game/h113/acts.js MOUSE), or __BOT_MOUSE: the probe's MOUSE=1 plays with a mouse)
  const MOUSE_P = !!window.__BOT_MOUSE || (() => { try { return matchMedia('(hover: hover) and (pointer: fine)').matches; } catch (e) { return false; } })();
  // (build 04m: a still and the figures gate's report once per work where a mouse used to stall — __BOT_SHOTS04 only)
  const stall04 = (key, r) => { if (!MOUSE_P || B.k['st_' + key]) return r; B.k['st_' + key] = 1; let fg = null; try { fg = window.__FIG && __FIG.report ? __FIG.report() : null; } catch (e) { fg = 'ERR ' + e.message; } return { wait: 400, shot: window.__BOT_SHOTS04 ? `${B.m}-mouse-${key}` : undefined, note: `figs at ${B.m} ${key}: ${JSON.stringify(fg)} · line "${(document.querySelector('.h109-line') || {}).textContent || ''}"` }; };
  const alongWorld = (p, q) => { for (let i = 0; i <= 20; i++) { const r = mid(p, q, i / 20); if (onWorld(r[0], r[1])) return r; } return null; };
  // ── h130 ── (the probe's eyes: what the camera's centre column of rays meets first — an object's name chain, colour and box) ── /h130 ──
  function galHits() {
    try {
      const T = window.__T, R = new T.Raycaster(), cam = T.camera, out = [];
      for (const ny of [0.6, 0.2, -0.2, -0.6]) {
        R.setFromCamera({ x: 0, y: ny }, cam); const h = R.intersectObjects(T.scene.children, true).find((q) => q.object.visible !== false && q.distance > 0.2);
        if (!h) { out.push(ny + ':-'); continue; }
        const names = []; for (let o = h.object; o && names.length < 4; o = o.parent) names.push(o.name || o.type);
        const c = h.object.material && h.object.material.color ? h.object.material.color.getHexString() : '?';
        out.push(ny + ':' + names.join('<') + ' #' + c + ' d' + h.distance.toFixed(1) + ' y' + h.point.y.toFixed(1));
      }
      return out.join(' | ');
    } catch (e) { return 'err ' + e.message; }
  }
  // ── h130 ── (the boxes the rays may miss: every drawn mesh whose world box a ray of the lower centre column passes within 14 amot —
  // instanced and merged meshes whose own raycast is off or stale are named here too) ── /h130 ──
  function galBoxes() {
    try {
      const T = window.__T, cam = T.camera, out = [], P = cam.position, H = window.__T.game.h109;
      let B = null; T.scene.traverse((o) => { if (!B && o.isMesh && o.geometry) { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); B = new o.geometry.boundingBox.constructor(); } });
      const shown = (o) => { for (let q = o; q; q = q.parent) if (q.visible === false) return false; return true; };
      out.push('cam ' + [P.x, P.y, P.z].map((v) => v.toFixed(1)) + ' same ' + (H && H.X && H.X.camera === cam) + ' near ' + cam.near.toFixed(2) + ' fov ' + cam.fov.toFixed(1));
      T.scene.traverse((o) => {
        if (!o.isInstancedMesh || !shown(o)) return;
        try { o.computeBoundingBox(); B.copy(o.boundingBox).applyMatrix4(o.matrixWorld); } catch (e) { return; }
        if (P.x < B.min.x - 6 || P.x > B.max.x + 6 || P.z < B.min.z - 6 || P.z > B.max.z + 6) return;
        const names = []; for (let q = o; q && names.length < 3; q = q.parent) names.push(q.name || q.type);
        const c = o.material && o.material.color ? o.material.color.getHexString() : '?';
        out.push(names.join('<') + ' #' + c + ' n' + o.count + ' x' + B.min.x.toFixed(0) + '..' + B.max.x.toFixed(0) + ' y' + B.min.y.toFixed(1) + '..' + B.max.y.toFixed(1) + ' z' + B.min.z.toFixed(0) + '..' + B.max.z.toFixed(0));
      });
      return out.slice(0, 16).join(' | ');
    } catch (e) { return 'err ' + e.message; }
  }
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
      if (a.phase === 'push' && a.v < 0.1) { const at = (a.trk && a.sled && alongWorld(a.trk, a.sled)) || [W * 0.75, HH * 0.5]; return { holdUntil: [at[0], at[1], C('return !a||a.phase!==\'push\'||a.d>=a.tgt-1.25'), 20000], wait: 1500, note: 'waste: hold the track at ' + at.map(Math.round) }; }   // (build 125: on the track — the push's own grip — where the world is under the finger)
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
      // (build 04m, mouse: one end then the other, in turns — the higher end that is not yet down, a short hold each, so the stone stays
      //  level (under tiltOk) and lands slowly; the old seq held [L, R] and the mouse took L alone: L seated, R never pressed — a stall)
      if (a.phase === 'lower' && (a.mouse || MOUSE_P)) {
        const dn = (y) => y <= 26.005, sL = dn(a.yL), sR = dn(a.yR);
        if (sL && sR) return { wait: 300 };
        if (sL || sR) { const s0 = stall04('lower1', null); if (s0) return s0; }
        const right = sL ? true : sR ? false : a.yR > a.yL + 0.02, p = right ? R : L;
        return { hold: [p[0], p[1], 600], wait: 300, note: `lintel: down by mouse, the ${right ? 'right' : 'left'} end ${a.yL.toFixed(1)}/${a.yR.toFixed(1)}` };
      }
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
      // (build 04m, mouse: the carpenter holds the batten — a click on the peg; the old seq pressed the batten and the mouse never reached
      //  the peg, which two fingers do at once)
      if (a.phase === 'peg' && a.pegAt && (a.mouse || MOUSE_P)) {
        if (a.holder >= 0) { const s0 = stall04('peg', null); if (s0) return s0; }
        return { tap: a.pegAt, wait: 350, note: `leaf: the carpenter holds batten ${a.holder}, a click on the peg (${a.peg}/${a.pegs})` };
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
      // (build 04m, mouse: a click lifts the key and it stays up, then a drag slides the bar out; a wrong key (a pin stays down) goes back
      //  for another. The old seq's lift was a drag (no click: nothing latched) and its slide was the second finger, which a mouse lacks)
      if (a.step === 'lifted' && a.key && (a.mouse || MOUSE_P)) {
        const l0 = [W * 0.3, HH * 0.7];
        if (a.key.lift < 0.5) return { tap: l0, wait: 700, note: `lock: a click lifts the key (key ${a.ki}, ok ${a.key.ok})` };
        { const s0 = stall04('lifted', null); if (s0) return s0; }
        if (B.k.slid === a.ki && (a.stuck >= 0 || !a.key.ok) && a.keys > 1 && !a.reach) return { tap: a.chain, wait: 1400, note: 'lock: a pin stays down: another key (mouse)' };
        B.k.slid = a.ki; return { ...barDrag(a.barAt, -1.5, 600), wait: 900, note: `lock: the key held up, the bar slid out (key ${a.ki}, ok ${a.key.ok}, bar ${a.bar})` };
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
    // ── build 120 ── (build 130: the old stage 05's other players went with it; the column's stays, for the gallery's raising) the column: pull the rope down (slowly at level 3), near the balance the post: press and turn round
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
    // ── /build 120 ──
    // ── h130 ── (build 130) the new stage 05's gallery (h130/gallery.js dbg()): the opening (a drag on the left half draws the line, a
    // tap turns the crowd over), the puzzle (each column from its sledge to a place of the solver's layout, a.sol; a column on any other
    // place is moved to a free one), the torch bearer's tap, level 3's raising (the column player: a.sub 'raise'). __BOT.bad: 'crack'
    // (the last column left on its sledge: the warning, the test tapped again, gal.beam −20), 'hide' (the first test with one column on
    // a spectator's line, a.hide: it blinks; then it goes back to its place and the test runs again)
    gal(a) {
      if (a.sub === 'raise') return play.col(a);
      const bad = B.bad || '', has = (k) => bad.split(',').includes(k);
      if (a.phase === 'open-draw') { if (!B.k.od) { B.k.od = 1; return { wait: 400, shot: a.id + '-open' }; } const y = Math.round(HH * 0.62); return { drag: [Math.round(W * 0.1), y, Math.round(W * 0.42), y - 50, 600], wait: 150, note: 'gal: draw the line ' + a.draw }; }
      if (a.phase === 'open-flip') { if (!B.k.of) { B.k.of = 1; return { wait: 200, shot: a.id + '-crowd' }; } return { tap: [Math.round(W * 0.22), Math.round(HH * 0.62)], wait: 1500, note: 'gal: turn it over' }; }
      if (a.phase === 'test' && a.view) { const k = `v${a.tries}-${a.view.wi}` + (a.view.hid.length ? '-' + a.view.ti : ''); if (!B.k[k]) { B.k[k] = 1; return { wait: 250, shot: `${a.id}-see${a.tries}-w${a.view.wi}-t${a.view.ti}`, note: 'gal: seen ' + JSON.stringify(a.view) + ' cam ' + a.cam + ' fov ' + a.fov + ' hits ' + galHits() + ' boxes ' + galBoxes() }; } }
      if (a.phase === 'test' && !a.view && !B.k['cr' + a.tries]) { B.k['cr' + a.tries] = 1; return { wait: 500, shot: `${a.id}-crew${a.tries}` }; }
      if (a.phase === 'test' && a.ev.some((e) => /^above/.test(e)) && !B.k.ab) { B.k.ab = 1; return { wait: 200, shot: `${a.id}-above`, note: 'gal: ' + a.ev.slice(-1)[0] }; }
      if (a.busy || a.phase !== 'puzzle') return { wait: 300, note: 'gal: ' + a.phase };
      if (!B.k['ps' + a.tries]) { B.k['ps' + a.tries] = 1; return { wait: 400, shot: `${a.id}-puzzle${a.tries}` }; }
      let spots = (a.sol || []).map((s) => ({ ...s }));
      if (has('crack') && a.id === 'gal1') spots = spots.slice(0, -1);
      if (has('hide') && !a.tries && a.hide) spots[a.hide.j] = { a: a.hide.a, scr: a.hide.scr };
      const on = (c, s) => c.a != null && Math.abs(c.a - s.a) < 0.3;
      const free = spots.filter((s) => !a.cols.some((c) => on(c, s)));
      if (free.length) {
        const wrong = a.cols.find((c) => c.a != null && !spots.some((s) => on(c, s))) || a.cols.find((c) => c.a == null && !c.drag);
        if (!wrong) return { wait: 300 };
        return { path: [wrong.grip, mid(wrong.grip, free[0].scr, 0.5), free[0].scr], ms: 1100, wait: 1100, note: `gal: column ${wrong.i} (${wrong.a}) → ${free[0].a.toFixed(2)}` };
      }
      if (!B.k['pl' + a.tries]) { B.k['pl' + a.tries] = 1; return { wait: 600, shot: `${a.id}-plan${a.tries}` }; }
      // (the figures check: the plan again with the camera lifted 0.3 by the right thumb, then back)
      if (!a.tries && (B.k.lift | 0) < 3) { B.k.lift = (B.k.lift | 0) + 1; return B.k.lift === 1 ? { eval: '__T.game.h109._look(0.3,0)', wait: 100 } : B.k.lift === 2 ? { wait: 1200, shot: `${a.id}-plan-lift03` } : { eval: '__T.game.h109._look(0,0)', wait: 900 }; }
      return { tap: a.bearer, wait: 2200, note: 'gal: the torch bearer, the test (layout ' + a.layout.join(',') + ')' };
    },
    // ── /h130 ──
    // ── h128 ── (build 128) stage 06's acts (h128/*.js dbg()); stage 03 has a 'close' kind too: stage 06's players are h6<kind>
    // the capstan: round the drum (clockwise on the screen) at a speed that keeps the rope quiet (slower over a rough timber), let go
    // before the next notch so the sledge coasts to it, tap the wedge man when it is still there; rest on the wedge until the crew
    // is fresh. __BOT.bad 'fray': haul hard through the first rough timber until a strand parts (the run back, −20)
    h6capstan(a) {
      const bad = B.bad || '', has = (k) => bad.split(',').includes(k);
      if (a.phase === 'hang' && a.hangT > 4.3 && !B.k.hangShot) { B.k.hangShot = 1; return { wait: 100, shot: 'capstan-hang' }; }
      if (a.phase === 'bring' && a.bT > 2.5 && !B.k.bringShot) { B.k.bringShot = 1; return { wait: 100, shot: 'capstan-bring' }; }
      if (a.phase === 'bring' && a.bT > 2.6) return { tap: [W * 0.5, HH * 0.45], wait: 600, note: 'capstan: skip the bring-up' };
      if (a.phase === 'haul' && a.runs > 0 && !B.k.partShot) { B.k.partShot = 1; return { wait: 100, shot: 'capstan-part' }; }
      if (a.phase !== 'haul' || a.mode !== 'haul') return { wait: 300, note: 'capstan: ' + a.phase + ' ' + a.mode };
      if (!B.k.capShot) { B.k.capShot = 1; return { wait: 200, shot: 'capstan-start' }; }
      const j = a.notchD.findIndex((nd) => Math.abs(a.d - nd) <= 0.45);
      if (a.runs > 0) B.k.parted = 1;
      if (a.wedge !== -1 && a.F > 0.05 && (!has('fray') || B.k.parted)) return { wait: 600, note: `capstan: rest (wedge ${a.wedge}, F ${a.F})` };
      if (j >= 0 && a.wedge === j && a.F > 0.05 && (!has('fray') || B.k.parted)) return { wait: 600, note: `capstan: rest on notch ${j + 1} (F ${a.F})` };
      if (j >= 0 && a.wedge !== j && Math.abs(a.v) < 0.15) { if (!B.k['cs' + j] && (j === 1 || j === 4)) { B.k['cs' + j] = 1; return { wait: 100, shot: `capstan-notch${j + 1}`, note: `capstan: at notch ${j + 1} (d ${a.d}, near ${a.near}, mallet ${a.mallet}, glow ${JSON.stringify(a.glow)})` }; } return { tapAt: '(()=>{const a=__T.game.h109.state().act;return a&&a.wedgeMan})()', wait: 700, note: `capstan: wedge at notch ${j + 1} (d ${a.d} v ${a.v})` }; }
      if (j >= 0 && Math.abs(a.v) >= 0.15) return { wait: 120 };   // (in the notch's window: let it come to rest there)
      const i = a.notchD.findIndex((nd) => nd > a.d + 0.45); if (i < 0) return { wait: 300 };
      if (a.v > 0.05 && a.d + a.v * 0.85 >= a.notchD[i] - 0.4) return { wait: 120 };   // (it coasts into the window)
      const nd = a.notchD[i];
      // (build 128 tuning T1: a still of the cue before notches 2 and 5 — the mallet rising, the notch's lug brightening — with its measure)
      if (!B.k['cn' + i] && (i === 1 || i === 4) && nd - a.d < 1.9 && nd - a.d > 0.4) { B.k['cn' + i] = 1; return { wait: 60, shot: `capstan-near${i + 1}`, note: `capstan: near notch ${i + 1} (to ${(nd - a.d).toFixed(2)}, near ${a.near}, mallet ${a.mallet}, glow ${JSON.stringify(a.glow)})` }; }
      if (a.v > 0.05 && a.turn < 0.02) return { wait: 150 };
      const fast = has('fray') && !B.k.parted, rough = a.roughAhead > 0.05 || a.rough > 0.05;
      const tps = fast ? 0.8 : rough ? 0.16 : 0.32, lap = 1000 / tps;
      const lead = fast ? 99 : (rough ? 0.55 : 1.0), rem = nd - lead - a.d;
      // (near the notch: a part of a turn only, so the sledge coasts into the notch's window; else whole turns, looked at every quarter)
      const fr = fast || rem > 3.4 ? 1 : Math.max(0.05, Math.min(0.5, (nd - a.d - 0.3) / 3.2 - Math.max(0, a.v) * 0.25));
      const c = a.drum, r = 80, P = []; const a0 = (B.k.ang || 0), nk = Math.max(2, Math.round(12 * fr)); for (let k = 0; k <= nk; k++) { const t = a0 + (k / nk) * Math.PI * 2 * fr; P.push([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)]); }
      if (fr < 1) { B.k.ang = a0 + Math.PI * 2 * fr; return { path: P, ms: lap * fr, wait: 250, note: `capstan: ${fr.toFixed(2)} of a turn to notch ${i + 1} (d ${a.d} v ${a.v})` }; }
      const stop = `return !a||a.phase!=='haul'||a.mode!=='haul'||${fast ? 'a.runs>0' : `a.d>=${(nd - lead).toFixed(2)}`}||a.F>0.92`;
      if (fast && a.runs > 0) B.k.parted = 1;
      return { path: P, ms: lap, pathUntil: C(stop), pathEach: 6, pathMax: 120000, wait: 100, note: `capstan: haul to notch ${i + 1} at ${tps} turns/s (d ${a.d} ten ${a.ten} ${a.band} F ${a.F} wear ${a.wear})` };
    },
    // the steps (a ring): the template on each stone in turn (a stone with no light under it is the ring's: mark it; ring 15: sound every
    // stone first and leave the dull one), the row laid the one way in turn (dbg's sol: the bot knows the answer), the closing stone pushed
    // by the two bars in small alternate steps inside tol (a jam: the leading bar back a little). __BOT.bad: 'wrong' (a stranger marked and
    // laid: it gapes, lifted, carried back), 'crack' (the dull stone marked: it cracks through, −20), 'twin' (every fitting stone marked, the dull twin first: the second
    // twin fills nothing, the bot marks on; the sound twin laid), 'corner' (one bar forced: −20)
    h6ring(a) {
      const bad = B.bad || '', has = (k) => bad.split(',').includes(k) || bad.split(',').includes(k + a.ring), K = B.k;   // ('wrong1,corner8,crack15': one mistake per ring)
      if (a.phase === 'intro' || a.phase === 'closing') return { wait: 300 };
      if (a.phase === 'moment') { if (!K.allShot && a.mT > 2.6) { K.allShot = 1; return { wait: 100, shot: 'ring-all' }; } return { wait: 300 }; }
      if (a.phase === 'tpl') {
        if (!K.yardShot) { K.yardShot = 1; return { wait: 200, shot: 'ring-yard' }; }
        K.fit = K.fit || {}; K.snd = K.snd || {};
        const Y = a.yard;
        // ── h128 ── (build 128 tuning T8) a long stone: tap the mason, a still while he dresses it, wait till it is done
        if (a.long && a.long.length && !a.dressing && a.mason && !K.dressAsk) { K.dressAsk = 1; return { tap: a.mason, wait: 600, note: 'steps: tap the mason (long ' + a.long.join() + ')' }; }
        if (a.dressing) { if (a.dressing.hits >= 1 && !K.dressShot) { K.dressShot = 1; return { wait: 10, shot: 'ring-mason-dress', note: 'steps: the mason dresses ' + a.dressing.id + ' (blow ' + a.dressing.hits + ')' }; } return { wait: 250 }; }
        if (K.dressAsk && a.long && a.long.length) { K.dressAsk = 0; }   // (his walk was cut short: ask again)
        if (a.dressed && a.dressed.length && !K.dressedShot) { K.dressedShot = 1; return { wait: 10, shot: 'ring-dressed', note: 'steps: dressed ' + a.dressed.join() }; }
        // a still of the dull stone's hairline (it lasts half a second)
        if (!K.dullShot && Y.some((y) => y.dull === 1)) { K.dullShot = 1; return { wait: 10, shot: 'ring-dull', note: 'steps: the dull stone ' + Y.find((y) => y.dull === 1).id }; }
        // ── /h128 ──
        // ring 15's class (and a free ring with a problem stone): the mallet on every stone first
        // (build 128: a tap can land on a neighbour on screen — a stone not heard yet is sounded again, up to three times; the stone under
        // the template is never tapped, as that tap would mark it)
        const crackRing = a.cls === 15 || a.rule === 'stone';
        if (crackRing) { const s = Y.find((y) => y.dull == null && (K.snd[y.id] || 0) < 3 && y.id !== a.on); if (s) { K.snd[s.id] = (K.snd[s.id] || 0) + 1; return { tap: s.at, wait: K.dullShot ? 500 : 120, note: 'steps: sound ' + s.id }; } }
        // (build 128 tuning T4: a still at the drop — a fit's gold edge, a misfit's rocking and its line — once each, with their measure)
        if (a.on && a.rock > 0 && !K.misShot) { K.misShot = 1; return { wait: 10, shot: 'ring-misfit', note: `steps: misfit ${a.on} (model ${a.lightPx} px, drawn ${a.linePx} px, rock ${a.rock})` }; }
        if (a.on && a.gold > 0 && !K.fitShot) { K.fitShot = 1; return { wait: 10, shot: 'ring-fit', note: `steps: fit ${a.on} (gold ${a.gold})` }; }
        if (a.on && K.fit[a.on] == null) { K.fit[a.on] = a.lightPx; if (a.lightPx > 0 && !K.lightShot) { K.lightShot = 1; return { wait: 100, shot: 'ring-light' }; } }
        const cur = a.on && Y.find((y) => y.id === a.on);
        if (cur && !cur.marked) {
          // (build 128: a stone once heard dull is never marked, nor one not heard at all on a cracked ring — unless __BOT.bad 'crack'
          // (the dull one in place of its twin) or 'twin' (the player's bad order: every stone that fits, the cracked twin first))
          const fits = K.fit[cur.id] === 0, dull = cur.dull === 1, heard = !crackRing || cur.dull === 0 || (K.snd[cur.id] || 0) >= 3;
          const want = (fits && ((!dull && heard) || has('crack') || has('twin'))) || (has('wrong') && !fits && !K.wrongDone);
          if (want && fits && dull && has('crack')) K.crackDone = 1;
          if (want && !fits) K.wrongDone = 1;
          if (want) return { tap: cur.at, wait: 700, note: `steps: mark ${cur.id} (light ${a.lightPx}${dull ? ', dull' : ''})` };
        }
        const cov = a.cover != null ? a.cover : a.marks.length;   // (build 128: the marks count by what the row needs)
        if (cov >= a.need) return { wait: 400, note: 'steps: marks ' + cov + '/' + a.need };   // (all marked: the row comes)
        // (crack: the dull one marked in place of its sound twin — so the sound twin is left)
        const skip = (y) => has('crack') && K.crackDone && y.dull === 0 && Y.some((z) => z.dull === 1 && z.len === y.len && z.marked);
        const nxt = (has('twin') && Y.find((y) => !y.marked && y.dull === 1 && K.fit[y.id] == null && y.id !== a.on)) || Y.find((y) => !y.marked && K.fit[y.id] == null && y.id !== a.on && !(has('crack') && y.dull === 0 && Y.some((z) => z.dull === 1 && z.len === y.len)));
        const nxt2 = nxt || Y.find((y) => !y.marked && K.fit[y.id] == null && y.id !== a.on && !skip(y));
        if (nxt2) return { drag: [a.tpl[0], a.tpl[1], nxt2.at[0], nxt2.at[1], 700], wait: K.misShot && K.fitShot ? 700 : 120, note: 'steps: the template onto ' + nxt2.id };
        return { wait: 400, note: 'steps: marks ' + cov + '/' + a.need };
      }
      if (a.phase === 'row') {
        if (!K.rowShot) { K.rowShot = 1; return { wait: 1700, shot: 'ring-row', note: `steps: the row (rule ${a.rule || '-'}${a.rule === 'odd' ? ' off ' + a.off : ''}${a.order ? ' first ' + a.order + ', hoist ' + a.hoist : ''})` }; }
        // ── h128 ── (T8: the hoist — __BOT.bad 'hoist': one stone first onto its end (it knocks the leg and goes back); stills as it goes)
        if (a.hoist === 'up' && has('hoist') && !K.hoistTry) { const other = a.order === 'left' ? 'right' : 'left', t = a.tray.find((x) => a.sol[other].includes(x.id)); if (t) { K.hoistTry = 1; return { drag: [t.at[0], t.at[1], ...(other === 'left' ? t.toL : t.toR).slice(0, 2), 700], wait: 150, note: 'steps: a stone onto the hoist end ' + other }; } }
        if (K.hoistTry === 1 && a.hoist === 'up') { K.hoistTry = 2; return { wait: 10, shot: 'ring-hoist-block', note: 'steps: ev ' + a.ev.slice(-2).join(' ') }; }
        if (a.hoist === 'going' && !K.goShot) { K.goShot = 1; return { wait: 10, shot: 'ring-hoist-going' }; }
        // ── /h128 ──
        if (a.bull) { if (!K.bullShot) { K.bullShot = 1; return { wait: 100, shot: 'ring-bull' }; } return { wait: 300 }; }
        if (a.loose.length) return { tap: a.loose[0].at, wait: 800, note: 'steps: lift the loose stone ' + a.loose[0].id };
        const g = a.laid.find((l) => a.gape.includes(l.id)); if (g) { if (!K.gapeShot) { K.gapeShot = 1; return { wait: 100, shot: 'ring-gape' }; } return { tap: g.at, wait: 900, note: 'steps: lift the stranger ' + g.id }; }
        const side = a.next, k = a.row[side].length, want = a.sol[side][k];
        const str = a.tray.find((t) => !a.sol.left.includes(t.id) && !a.sol.right.includes(t.id) && has('wrong') && !K.strLaid);
        if (str) { K.strLaid = 1; return { drag: [str.at[0], str.at[1], ...(side === 'left' ? str.toL : str.toR).slice(0, 2), 700], wait: 900, note: 'steps: lay the stranger ' + str.id }; }
        const t2 = a.tray.find((x) => x.id === want);
        if (!t2) {
          // (crack: the dull twin has the sound one's length; lay it where the sound one goes)
          const twin = a.tray.find((x) => !a.sol.left.includes(x.id) && !a.sol.right.includes(x.id) && x.len === a.lens[want]);
          if (twin) { const to = side === 'left' ? twin.toL : twin.toR; return { drag: [twin.at[0], twin.at[1], to[0], to[1], 700], wait: 900, note: 'steps: lay ' + twin.id + ' (the twin) ' + side }; }
          return { wait: 500, note: 'steps: waiting for ' + want };
        }
        const to = side === 'left' ? t2.toL : t2.toR;
        return { drag: [t2.at[0], t2.at[1], to[0], to[1], 700], wait: 900, note: `steps: lay ${t2.id} ${side} (rest ${a.rest})` };
      }
      if (a.phase === 'key') {
        if (!K.keyShot) { K.keyShot = 1; return { wait: 1700, shot: 'ring-key' }; }
        if (a.a >= 1 && a.b >= 1) return { wait: 300 };
        if (a.pend) return { wait: 150 };   // (the heavy stone answers late: read it when it has)
        const d = a.dir, L = (p, n) => [p[0], p[1], Math.round(p[0] + d[0] * n), Math.round(p[1] + d[1] * n)];
        if (has('corner') && !a.corner) { if (!K.jam1) { K.jam1 = 1; return { drag: [...L(a.barA, a.pxf * (a.tol + 0.06)), 500], wait: 100, note: 'steps: bar A alone past tol (askew)' }; } if (!K.jamShot) { K.jamShot = 1; return { wait: 50, shot: 'ring-askew' }; } return { drag: [...L(a.barA, a.pxf * 0.6), 1800], wait: 600, note: 'steps: force bar A' }; }
        if (a.jam) { const lead = a.a > a.b ? 'barA' : 'barB'; return { drag: [...L(a[lead], -a.pxf * a.tol * 0.5), 300], wait: 300 + a.lag * 1000, note: 'steps: jammed, the leading bar back' }; }
        const side = a.a <= a.b ? 'barA' : 'barB', adv = a.a <= a.b ? a.a : a.b, other = a.a <= a.b ? a.b : a.a;
        const step = Math.max(0.02, Math.min(1.02 - adv, other - adv + a.tol * 0.55));
        return { drag: [...L(a[side], a.pxf * step), 400], wait: 250 + a.lag * 1000, note: `steps: push ${side} ${step.toFixed(2)} (a ${a.a} b ${a.b})` };
      }
      return { wait: 300 };
    },
    // the wickets: each ring round its centre in small alternate arcs inside tol (the left with the clock, the right against it); the dry
    // bolt rocked back past 15° and forward three times; the pair brought near the end one by one, then both last turns by two fingers in
    // the same frames (mouse: one after the other inside 1.2 s). __BOT.bad 'tooth' (wicketN: the left ring forced ahead: −20), 'alone'
    // (wickets: the north locked alone, turned back a quarter, then both together)
    h6wicket(a) {
      const bad = B.bad || '', has = (k) => bad.split(',').includes(k), K = B.k, R0 = 70;
      if (a.phase !== 'turn') { if (a.phase === 'locked' && !K.lockShot) { K.lockShot = 1; return { wait: 300, shot: a.id + '-locked' }; } return { wait: 300 }; }
      if (!K.startShot) { K.startShot = 1; return { wait: 200, shot: a.id + '-start' }; }
      const arc = (key, c, d, ms) => { const a0 = K['ang' + key] || 0, n = Math.max(3, Math.ceil(Math.abs(d) / 0.35)), P = []; for (let k = 0; k <= n; k++) { const t = a0 + d * k / n; P.push([c[0] + R0 * Math.cos(t), c[1] + R0 * Math.sin(t)]); } K['ang' + key] = a0 + d; return { path: P, ms }; };
      const rad = Math.PI / 180;
      if (!a.pair) {
        if (has('tooth') && a.id === 'wicketN' && !a.tooth[0] && !a.tooth[1]) { if (a.blk && !K.blkShot) { K.blkShot = 1; return { wait: 50, shot: 'wicket-blocked' }; } return { ...arc('L', a.c.L, 45 * rad, 2200), wait: 300, note: 'wicket: force the left ring ahead' }; }
        // (build 128 tuning T3: __BOT.bad 'skew' — on the south wicket, before the dry bolt, the left ring run ahead past tol for a moment
        //  (well under the 0.8 s that bends a tooth): a still while it trembles, then on as before)
        if (has('skew') && a.id === 'wicketS' && !K.skewDone && a.travel > 0.12 && !a.blk) {
          K.skewDone = 1; const c = a.c.L, a0 = K.angL || 0, over = (a.b - a.a) + a.tol + 8, n = 14, fr = [];
          for (let k = 0; k <= n; k++) { const t = a0 + over * rad * k / n; fr.push([[c[0] + R0 * Math.cos(t), c[1] + R0 * Math.sin(t)]]); }
          K.angL = a0 + over * rad; fr.push([]);
          return { seq: fr, ms: 30, seqShot: [Math.min(n, Math.ceil(n * ((a.b - a.a) + a.tol + 4) / over)), 'wicketS-skew'], wait: 400, note: `wicket: the left ring ahead ${over.toFixed(1)}° (a ${a.a} b ${a.b} tol ${a.tol})` };
        }
        const S = a.dryAt, stuck = a.dry && a.dry.stuck && !a.dry.free;
        if (stuck && !K.stickShot) { K.stickShot = 1; return { wait: 100, shot: 'wicket-stuck' }; }
        if (stuck && !K.stuck2 && a.ev && a.ev.includes('rust')) { K.stuck2 = 1; return { wait: 250, shot: 'wicket-rust' }; }
        const target = stuck ? (a.dry.back ? S + 2 : S - a.rock - 3) : a.END + 3, mean = (a.a + a.b) / 2, dir = Math.sign(target - mean) || 1;
        const useL = dir > 0 ? a.a <= a.b : a.a >= a.b, v = useL ? a.a : a.b, o = useL ? a.b : a.a;
        const amt = Math.min(Math.abs(target - v), (o - v) * dir + a.tol * 0.6);
        if (amt < 0.5) return { wait: 150 };
        const d = dir * amt * rad * (useL ? 1 : -1);
        if (a.id === 'wicketS' && a.travel > 0.6 && !K.midShot) { K.midShot = 1; return { wait: 100, shot: 'wicketS-plate' }; }
        return { ...arc(useL ? 'L' : 'R', useL ? a.c.L : a.c.R, d, Math.max(220, amt * 9)), wait: 120, note: `wicket: ${useL ? 'L' : 'R'} ${dir > 0 ? '+' : '−'}${amt.toFixed(1)}° (a ${a.a} b ${a.b}${stuck ? ' rock' : ''})` };
      }
      // the pair (build 128 C1: the leaf is the grip, so every drag starts on it: from the ring's centre straight toward the leaf's far
      // side, at a radius inside the leaf's box — at 960×600 the leaf is ~75 px wide and a 70 px circle started off it)
      const rOf = (key) => { const b = a.leaf[key], c = a.c[key]; return Math.max(18, Math.min(R0, 0.8 * (b[2] - c[0]), 0.8 * (c[1] - b[1]), 0.8 * (b[3] - c[1]))); };
      const parc = (key, d, ms) => { const c = a.c[key], r = rOf(key), n = Math.max(3, Math.ceil(Math.abs(d) / 0.35)), P = []; for (let k = 0; k <= n; k++) { const t = d * k / n; P.push([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)]); } return { path: P, ms }; };
      const near = [a.END[0] - 14, a.END[1] - 14];
      if (has('alone') && !K.aloneDone && K.backDone && a.lock[0] == null) K.aloneDone = 1;
      if (has('alone') && !K.aloneDone && !a.mouse) {   // (touch only: by mouse the guard keeps the second ring in step)
        if (a.lock[0] == null && a.w[0] < a.END[0]) return { ...parc('N', Math.min(a.END[0] - a.w[0] + 4, 300) * rad, 1400), wait: 150, note: 'wickets: the north alone' };
        if (a.tries === 0) return { wait: 200 };
        if (!K.aloneShot) { K.aloneShot = 1; return { wait: 100, shot: 'wickets-alone' }; }
        if (a.lock[0] != null) { K.backDone = 1; return { ...parc('N', -(a.back + 8) * rad, 900), wait: 200, note: 'wickets: the north back a quarter' }; }
        K.aloneDone = 1;
      }
      // (mouse, build 128 C2: the pointer turns the north ring alone at an even pace, 120°/s; the guard at the south turns his with it)
      if (a.mouse || window.__BOT_MOUSE) { if (a.lock[0] != null) return { wait: 200 }; const dd = Math.min(a.END[0] - a.w[0] + 4, 240); return { ...parc('N', dd * rad, Math.round(dd / 120 * 1000)), wait: 120, note: `wickets: the north ring ${dd.toFixed(0)}° at an even pace (N ${a.w[0]} S ${a.w[1]})` }; }
      for (const [k, key] of [[0, 'N'], [1, 'S']]) if (a.w[k] < near[k] - 1.5) return { ...parc(key, Math.min(near[k] - a.w[k], 300) * rad, 1300), wait: 120, note: `wickets: ${key} to ${near[k]} (${a.w[k]})` };
      // both last turns in the same frames: two fingers
      const n = 16, fr = [], aN = 0, aS = 0, rN = rOf('N'), rS = rOf('S'), dN = (a.END[0] - a.w[0] + 26) * rad, dS = (a.END[1] - a.w[1] + 26) * rad;   // (past the end: each locks as it gets there, a touch's lost degrees or not)
      for (let k = 0; k <= n; k++) fr.push([[a.c.N[0] + rN * Math.cos(aN + dN * k / n), a.c.N[1] + rN * Math.sin(aN + dN * k / n)], [a.c.S[0] + rS * Math.cos(aS + dS * k / n), a.c.S[1] + rS * Math.sin(aS + dS * k / n)]]);
      fr.push([]);
      return { seq: fr, ms: 45, wait: 150, note: 'wickets: both last turns together' };
    },
    // the closing: each leaf kept at a speed that falls as it nears the sill (heave in the lean window when slower, brake when faster), the
    // leading leaf held back so they arrive together. __BOT.bad 'dent' (the south leaf driven fast into the sill: −40)
    h6close(a) {
      const bad = B.bad || '', has = (k) => bad.split(',').includes(k), K = B.k;
      if (a.phase === 'met') { if (!K.metShot) { K.metShot = 1; return { wait: 400, shot: 'close-met' }; } return { wait: 300 }; }
      if (a.phase !== 'push') return { wait: 300 };
      if (!K.startShot) { K.startShot = 1; return { wait: 300, shot: 'close-start' }; }
      if (!K.midShot && (a.f[0] + a.f[1]) / 2 < 45) { K.midShot = 1; return { wait: 50, shot: 'close-mid' }; }
      const want = (i) => { const f = a.f[i], o = a.f[1 - i]; let t = f > 30 ? 4.5 : f > 8 ? Math.max(2.2, f * 0.13) : 1.9; if (f < o - 2.5) t = Math.max(0.6, t - 2); if (has('dent') && i === 0 && !a.dent[0]) t = 9; return t; };
      const pt = (k) => { const p = a.leaf[k].slice(0, 2), left = k === a.left; p[0] = left ? Math.min(p[0], W / 2 - 50) : Math.max(p[0], W / 2 + 50); p[1] = Math.max(HH * 0.3, Math.min(HH - 120, p[1])); return p; };
      let best = null;
      for (let i = 0; i < 2; i++) {
        if (a.wait[i]) continue; const k = a.keys[i], v = Math.abs(a.w[i]), t = want(i);
        if (v > t + 1.0 && a.f[i] < 40) { const p = pt(k); best = best || { path: [p, [p[0], p[1] + 30], [p[0], p[1] + 55]], ms: 140, keep: 380, wait: 40, note: `close: brake ${k} (f ${a.f[i]} w ${a.w[i]})` }; }
        else if (v < t - 0.7 && a.inWin[i] && a.ph[i] < 0.6) { const p = pt(k); best = { drag: [p[0], p[1], p[0], p[1] - 70, 140], wait: 40, note: `close: heave ${k} (f ${a.f[i]} w ${a.w[i]} ph ${a.ph[i]})` }; }
      }
      return best || { wait: 60 };
    },
    // (part 3) the sea, by touch as a player plays it: before each swell (5.5 s) the two ropes it loads set low in the quiet band, the
    // other two high (a worn rope lower, its partner higher), each by a drag of its tail (toward him: haul); the throw and the turn are
    // seen; the hold: both thumbs on the rings, a slipped thumb put back; Akko: the hook held over the ring's rest (it takes as the ring
    // rises), the hoist hauled while the door swings toward the quay, the landing paid out slowly. __BOT.bad: 'snap' (one rope hauled
    // into the frays band and held: a strand, then it tears, −20), 'ring' (the first swell's two low ropes left in the sings band: the
    // rings come out, −20 each), 'slip' (sea2's hold: the first thumb that slips is left off through one swell: the swell comes again)
    h6sea(a) {
      const bad = B.bad || '', has = (k) => bad.split(',').includes(k), K = B.k;
      const shotOnce = (key, name, wait = 120) => (K[key] ? null : (K[key] = 1, { wait, shot: name }));
      if (a.phase === 'enter') return { wait: 300 };
      if (a.phase === 'open') return shotOnce('open', 'sea-open', 2600) || { tap: [Math.round(W * 0.5), Math.round(HH * 0.5)], wait: 500, note: 'sea: skip the opening' };
      if (a.phase === 'ropes') {
        if (!K.r0) { K.r0 = 1; return { wait: 900, shot: a.id + '-ropes' }; }
        // (__BOT_FIG: the figures and the swell at u 0.3, once a work, while the first swell comes)
        // (build 128 B4: the still and the frame's measure once the lift has settled — u set to 0.3 at once — then down again)
        if (window.__BOT_FIG && !K.fig && a.next && a.next.in < 7.5) { K.fig = 1; return { eval: '__T.game.h109._look(0.3, 0)', wait: 2200, note: 'sea: the lifted view at u 0.3' }; }
        // (the sea's camera moves only when it is drawn: the measure after the still, of the frame the still shows)
        if (K.fig === 1) { K.fig = 2; return { shot: a.id + '-u03', wait: 30 }; }
        if (K.fig === 2) { K.fig = 3; return { eval: 'JSON.stringify({lifted:__T.game.h109.state().act.frame})', wait: 30 }; }
        if (K.fig === 3) { K.fig = 4; return { eval: '__T.game.h109._look(0, 0)', wait: 900 }; }
        { const j = a.sw.findIndex((x, i) => x.back && !(K.judged || {})[i]); if (j >= 0) { (K.judged = K.judged || {})[j] = 1; return { wait: 30, note: `sea: swell ${j + 1} (${a.sw[j].head}) ${a.sw[j].clean ? 'clean' : 'rough'} · ${a.ev.join(' ')}` }; } }
        const w = a.sw.find((x) => !x.back); if (!w) return { wait: 200 };
        const inn = w.t0 - a.mt, LOW = { port: ['stbdFore', 'stbdAft'], stbd: ['portFore', 'portAft'], bow: ['portAft', 'stbdAft'], stern: ['portFore', 'stbdFore'] };
        if (inn < 0.25 && inn > -0.4) { const s0 = shotOnce('crest' + a.sw.indexOf(w), a.id + '-crest' + (a.sw.indexOf(w) + 1), 30); if (s0 && a.sw.indexOf(w) < 2) return s0; }
        const want = {}, R = a.ropes, part = (r) => (r.endsWith('Fore') ? r.replace('Fore', 'Aft') : r.replace('Aft', 'Fore'));
        if (inn < 5.5 && !w.crest) {
          const crest = LOW[w.head];
          for (const r of Object.keys(R)) {
            if (R[r].gone) continue;
            want[r] = crest.includes(r) ? (R[r].worn ? 0.36 : (a.D >= 0.4 ? 0.4 : 0.45)) : (R[r].worn ? 0.45 : 0.6);
            if (crest.includes(part(r)) && !crest.includes(r) && R[part(r)].worn) want[r] = 0.63;
          }
        }
        if (has('snap') && !a.flags['sea.torn'] && a.mt > 1) { want.portAft = 1.0; if (R.portAft.fray > 0 && !K.frayShot) { K.frayShot = 1; return { wait: 30, shot: 'sea-frays' }; } }
        if (has('ring') && a.sw.indexOf(w) === 0 && !w.crest && inn < 5) { want.stbdFore = 0.8; want.stbdAft = 0.8; }
        if (a.flags['sea.torn'] && !K.tornShot) { K.tornShot = 1; return { wait: 200, shot: 'sea-torn' }; }
        if (a.flags['sea.ring'] && !K.ringShot) { K.ringShot = 1; return { wait: 200, shot: 'sea-ring' }; }
        let best = null, bd = 0.02;
        for (const r of Object.keys(want)) { const d = Math.abs(want[r] - R[r].tgt); if (d > bd) { bd = d; best = r; } }
        if (!best) return { wait: 150 };
        const q = a.tails[best]; if (!q) return { wait: 150 };
        const dy = Math.max(-170, Math.min(170, (want[best] - R[best].tgt) * 240)), y1 = Math.max(40, Math.min(HH - 40, q[1] + dy));
        return { drag: [q[0], q[1], q[0], y1, 320], wait: 60, note: `sea: ${best} ${R[best].tgt} → ${want[best]} (swell ${w.head} in ${inn.toFixed(1)} s)` };
      }
      // (build 128 B3: the throw's stills by the door's own moments — over the rail and falling, the splash, going down, gone)
      if (a.phase === 'throw') { const t = a.th || {}; for (const [ok, n] of [[t.off && !t.wet, 'fall'], [t.wet && t.wetT > 0.15, 'splash'], [t.wet && t.wetT > 2.2, 'down'], [t.sunk, 'gone']]) if (ok && !K['th' + n]) { K['th' + n] = 1; return { wait: 10, shot: 'sea-throw-' + n }; } return { wait: 60 }; }
      if (a.phase === 'turn' && !K.thgone) { K.thgone = 1; return { wait: 10, shot: 'sea-throw-gone' }; }
      if (a.phase === 'turn') return shotOnce('turn', 'sea-turn', 600) || { wait: 300 };
      if (a.phase === 'calm') return shotOnce('calm', 'sea-calm', 700) || { wait: 300 };
      if (a.phase === 'sorry') return shotOnce('sorry', 'sea-sorry', 1500) || { wait: 400 };
      if (a.phase === 'hold') {
        const h = a.hold; if (!h) return { wait: 200 };
        const mouse = !!a.mouse || !!window.__BOT_MOUSE;
        if (has('slip') && !K.slipped) { const s0 = ['L', 'R'].find((q) => h.off[q]); if (s0 && !mouse) K.slipped = { h: s0, until: h.swells + 1 }; }
        const off = K.slipped && h.swells < K.slipped.until ? K.slipped.h : null;
        if (!K.hold0) { K.hold0 = 1; return { wait: 50, shot: 'sea-hold-start' }; }
        if (h.held >= 1 && !K.holdShot) { K.holdShot = 1; return { wait: 50, shot: 'sea-hold' }; }
        const pt = (q) => C(`return a&&a.phase==='hold'&&a.rings?a.rings.${q}:null`);
        const hands = (mouse ? ['L'] : ['L', 'R']).filter((q) => q !== off);
        const stop = off ? `return !a||a.phase!=='hold'||a.hold.swells>=${K.slipped.until}` : `return !a||a.phase!=='hold'||a.hold.off.L||a.hold.off.R||a.hold.slip.L>0||a.hold.slip.R>0`;
        return { seq: [hands.map(pt), hands.map(pt)], ms: 60, seqUntil: C(stop), seqLoop: 1, seqMax: 30000, wait: 40, note: `sea: hold ${hands.join('+')} (held ${h.held}, swells ${h.swells}${off ? ', ' + off + ' left off' : ''})` };
      }
      if (a.phase === 'arrive') return shotOnce('arrive', 'sea-akko', 2500) || { wait: 300 };
      if (a.phase === 'hook') {
        if (!a.hook || !a.ring || !a.pxA) return { wait: 200 };
        const T = `(()=>{const a=__T.game.h109.state().act;if(!a||!a.ring)return null;return [a.ring[0],a.ring[1]+a.akko.ringY*a.pxA-0.45*a.pxA]})()`;
        window.__HK0 = a.hook.slice();
        const fr = [0.25, 0.5, 0.75, 1].map((u) => `(()=>{const t=${T},h=window.__HK0;return t&&[h[0]+(t[0]-h[0])*${u},h[1]+(t[1]-h[1])*${u}]})()`);
        return { seq: [[a.hook], ...fr.map((f) => [f])], ms: 70, seqUntil: C("return !a||a.phase!=='hook'"), seqLoop: 4, seqMax: 20000, wait: 100, note: `sea: the hook over the ring (tries ${a.akko.tries})` };
      }
      if (a.phase === 'hoist' || a.phase === 'land') {
        if (!a.haul) return { wait: 200 };
        if (a.phase === 'land' && !K.landShot) { K.landShot = 1; return { wait: 100, shot: 'sea-land' }; }
        const ph = a.phase, rate = ph === 'hoist' ? `(a.akko.w>-0.05&&!a.akko.stop?96:0)` : `-(a.akko.y>1?72:28)`;
        window.__HH = null;
        const ex = `(()=>{const a=__T.game.h109.state().act;const n=performance.now();if(!a||a.phase!=='${ph}'||!a.haul)return null;let K=window.__HH;if(!K||K.y==null){window.__HH=K={x:a.haul[0],y:a.haul[1],t:n};return [K.x,K.y]}const dt=Math.min(0.2,(n-K.t)/1000);K.t=n;K.y+=${rate}*dt;if(K.y>innerHeight-30||K.y<30){K.y=null;return null}return [K.x,K.y]})()`;
        return { seq: [[ex], [ex]], ms: 50, seqUntil: C(`return !a||a.phase!=='${ph}'`), seqLoop: 1, seqMax: 120000, wait: 100, note: `sea: ${ph} (lift ${a.akko.lift} th ${a.akko.th} y ${a.akko.y})` };
      }
      if (a.phase === 'landed' || a.phase === 'slew') return shotOnce(a.phase, 'sea-' + a.phase, 900) || { wait: 300 };
      if (a.phase === 'caravan') return shotOnce('caravan', 'sea-caravan', 2600) || { tap: [Math.round(W * 0.5), Math.round(HH * 0.5)], wait: 600, note: 'sea: skip the caravan' };
      return { wait: 300 };
    },
    // ── /h128 ──
    // ── h129 ── (build 129) stage 07's acts (h129/*.js dbg()): its players are h7<kind>. __BOT.bad: 'crack' (gazit1: stone 1 driven hard
    // into the west wall: a cracked corner, −20), 'ink' (gazit3: the first man led past a scribe's stand: the ink spilt, −20)
    h7gazit(a) {
      const bad = B.bad || '', has = (k) => bad.split(',').includes(k), K = B.k;
      if (a.busy || (a.phase !== 'arrange' && a.phase !== 'walk')) return { wait: 300, note: 'gazit: ' + a.phase };
      if (a.id === 'gazit1') {
        if (!K.g1shot) { K.g1shot = 1; return { wait: 100, shot: 'gazit1-arrange' }; }
        // (stone 1 is the bench's west end: on the screen away from the middle — the camera looks south; tried again until the crack is in)
        if (has('crack') && !a.dmg && (K.ct | 0) < 4) { K.ct = (K.ct | 0) + 1; const s = a.stones[0]; const out = s.mid[0] > innerWidth / 2 ? 1 : -1; return { path: [s.mid, [Math.min(innerWidth - 8, Math.max(8, s.mid[0] + out * 400)), s.mid[1]]], ms: 300, keep: 3000, release: C("return !a||a.ev.some((e)=>/^crack/.test(e))"), wait: 900, note: 'gazit: stone 1 hard into the west wall, try ' + K.ct + ' ev ' + a.ev.join(' ') }; }
        if (has('crack') && a.dmg && !K.crShot) { K.crShot = 1; return { wait: 600, shot: 'gazit1-crack' }; }
        if (a.allSee) { if (!K.allShot) { K.allShot = 1; return { wait: 100, shot: 'gazit1-arc' }; } return a.head ? { tap: a.head, wait: 1500, note: 'gazit: the head of the court: the test' } : { wait: 300 }; }
        // (the order and the pivot ends that the model lets through with no stone touching another: tools' search over the seven)
        const PLAN = [[0, 0], [1, 0], [2, 0], [3, 0], [6, 1], [5, 0], [4, 0]];
        for (const [i, pv] of PLAN) {
          const s = a.stones[i], free = pv ? 0 : 1;
          if (s.err < 0.15 && s.ae < 0.03) continue;
          if (s.pe[pv] > 0.12) return { path: [s.mid, s.to[pv]], ms: 500, keep: 6000, release: C(`const s=a&&a.stones[${i}];return !s||s.pe[${pv}]<0.06`), wait: 300, note: `gazit: stone ${i + 1} moved (pivot ${pv ? '+' : '−'})` };
          return { path: [s.e[free], s.ge[free]], ms: 500, keep: 6000, release: C(`const s=a&&a.stones[${i}];return !s||s.ae<0.015`), wait: 300, note: `gazit: stone ${i + 1} turned` };
        }
        return { wait: 400, note: 'gazit: all placed, not all see?' };
      }
      if (a.id === 'gazit2') {
        if (!K.g2shot) { K.g2shot = 1; return { wait: 100, shot: 'gazit2-start' }; }
        const it = a.items.find((q) => q.err > 0.15); if (!it) return { wait: 400 };
        return { path: [it.mid, it.gs], ms: 700, keep: 8000, release: C(`const q=a&&a.items&&a.items[${it.i}];return !q||q.err<0.08`), wait: 300, note: 'gazit: item ' + it.i };
      }
      if (!a.way || !a.walkers || a.next == null) return { wait: 300 };
      if (!K['g3shot' + a.next]) { K['g3shot' + a.next] = 1; return { wait: 100, shot: 'gazit3-move' + a.next }; }
      const w = a.walkers[a.next]; let P = [w, ...a.way.slice(1)];
      if (has('ink') && !a.dmg && (K.it | 0) < 4 && a.inkWay) { K.it = (K.it | 0) + 1; P = [w, ...a.inkWay.slice(1)]; }   // (by the first scribe's stand on the way to his place: again until the ink is spilt)
      return { path: P, ms: 260 * P.length, wait: 1500, note: 'gazit: the semicha, move ' + a.next };
    },
    // the arches: part A each leg held by a finger that follows the leg's thrust plus its creep (re-pressed when it has crept far), let go
    // slowly when the weights are on; part B the wedge that keeps the joints closest, a short drag each (a shoulder tapped when no wedge
    // can). __BOT.bad 'vcrack' (vaultN: both legs let go for three seconds: a leg runs out, a joint opens, −20), 'vstone' (vaultS: the
    // left wedges drawn out with no care: light, a crack, a stone falls)
    h7vault(a) {
      const bad = B.bad || '', has = (k) => bad.split(',').includes(k), K = B.k;
      if (a.phase === 'stands' && !K.stShot) { K.stShot = 1; return { wait: 700, shot: a.id + '-stands' }; }   // (closing round: the moment as it stands, in its composed picture)
      if (a.phase === 'legs' && a.A) {
        if (!K.legShot && a.A.laid >= 2) { K.legShot = 1; return { wait: 50, shot: a.id + '-legs' }; }
        if (has('vcrack') && a.id === 'vaultN' && !K.vc && a.A.laid >= 2) { K.vc = 1; return { wait: 3200, note: 'vault: both legs let go (the mistake)' }; }
        // (round 3: the press is measured from where the thumb went down — the act's reach is the finger's own travel — so the bot keeps that
        //  point (__VG) and does not re-aim from the grip's screen place, which the camera's lift for two thumbs and the shore's push move:
        //  re-aiming from it had overpressed vaultN's legs by touch into two lifts)
        const legs = a.legs, pt = (q, u) => `(()=>{const a=__T.game.h109.state().act;if(!a||!a.A)return null;const L=a.A.${q},G=(window.__VG||{})['${q}']||L.grip,k=${u == null ? '(L.T+L.g+0.03)' : `(L.g+${u}*L.T)`};return [G[0]+L.dir[0]*a.unit*k,G[1]+L.dir[1]*a.unit*k]})()`;
        const grips = legs.map((q) => `(()=>{const a=__T.game.h109.state().act;if(!a||!a.A)return null;const g=a.A.${q}.grip;(window.__VG=window.__VG||{})['${q}']=g;return g})()`);
        if (a.rel) {
          const fr = [1, 0.85, 0.7, 0.55, 0.4, 0.25, 0.1, 0].map((u) => legs.map((q) => pt(q, u)));
          return { seq: [grips, ...fr], ms: 220, wait: 600, note: 'vault: the slow letting go' };
        }
        const stop = `return !a||a.phase!=='legs'||!a.A||a.rel||${JSON.stringify(legs)}.some((q)=>a.A[q].g>0.8)`;
        return { seq: [grips, legs.map((q) => pt(q))], ms: 50, seqUntil: C(stop), seqLoop: 1, seqMax: 60000, wait: 40, note: `vault: hold ${legs.join('+')} (laid ${a.A.laid})` };
      }
      if (a.phase !== 'wedges' || !a.B) return { wait: 300, note: 'vault: ' + a.phase };
      if (!K.wShot) { K.wShot = 1; return { wait: 50, shot: a.id + '-wedges' }; }
      const P = a.B.pairs, step = a.B.stepPx * 0.9;
      // (R2's proof, __BOT.bad 'vwarn': in the great vault, before the clean play, its three warning states in turn — the first wedge
      //  (1L, free) drawn out a hair at a time until its joint starts to open, then until it is dangerous, each state's still; then pushed
      //  back in until the joint is steady again)
      if (has('vwarn') && a.id === 'vaultM' && !K.vwDone) {
        const st0 = String(a.B.states || '').split(',')[0] || '', w = a.B.w['1L'], l = Math.hypot(w.out[0], w.out[1]) || 1, hair = step * 0.25;
        const pull = (sg) => ({ drag: [w.at[0], w.at[1], Math.round(w.at[0] + (sg * w.out[0] / l) * hair), Math.round(w.at[1] + (sg * w.out[1] / l) * hair), 400], wait: 700, note: 'vault R2: 1L ' + (sg > 0 ? 'out' : 'in') + ' a hair · ' + st0 });
        if (!K.vw0) { K.vw0 = 1; return { wait: 300, shot: 'vaultM-warn-steady', note: 'vault R2: ' + st0 }; }
        if (!K.vwDanger) {
          if (/^opening/.test(st0) && !K.vwOpen) { K.vwOpen = 1; return { wait: 600, shot: 'vaultM-warn-opening', note: 'vault R2: ' + a.B.states }; }
          if (/^danger/.test(st0)) { K.vwDanger = 1; return { wait: 600, shot: 'vaultM-warn-danger', note: 'vault R2: ' + a.B.states }; }
          return pull(1);
        }
        if (!/^steady/.test(st0)) return pull(-1);
        K.vwDone = 1; return { wait: 400, shot: 'vaultM-warn-back', note: 'vault R2: back to ' + st0 };
      }
      const drag = (id) => { const w = a.B.w[id], l = Math.hypot(w.out[0], w.out[1]) || 1; return { drag: [w.at[0], w.at[1], Math.round(w.at[0] + (w.out[0] / l) * step), Math.round(w.at[1] + (w.out[1] / l) * step), 300], wait: 450, note: 'vault: wedge ' + id }; };
      const vs = has('vstone') && (a.id === 'vaultS' || (has('vstoneM') && a.id === 'vaultM'));   // ('vstoneM': the great vault's too)
      if (vs && !a.B.stones) { const id = P[0].L < 1 ? '1L' : P[1] && P[1].L < 1 ? '2L' : '3L'; return drag(id); }
      if (vs && !K['vs' + a.id]) { K['vs' + a.id] = 1; return { wait: 1700, shot: a.id + '-stone' }; }
      let best = null;
      P.forEach((p, i) => ['L', 'R'].forEach((sd) => {
        if (p[sd] >= 1) return; const id = (i + 1) + sd, free = a.B.loads[id] === 'free', d = Math.min(0.18, 1 - p[sd]) * (free ? 1 : 0.4);
        const imb = p.L - p.R + p.bias + (sd === 'L' ? d : -d), sc = Math.abs(imb) + (free ? 0 : 0.2);
        if (!best || sc < best.sc) best = { id, sc, imb };
      }));
      if (!best) return { wait: 400 };
      if (best.sc > 0.3) { const wi = P.reduce((b, p, i) => (Math.abs(p.L - p.R + p.bias) > Math.abs(P[b].L - P[b].R + P[b].bias) ? i : b), 0), im = P[wi].L - P[wi].R + P[wi].bias; if (Math.abs(im) > 0.12) return { tap: a.B.sh[im > 0 ? 'L' : 'R'], wait: 500, note: 'vault: a weight on the shoulder ' + (im > 0 ? 'L' : 'R') }; }
      return drag(best.id);
    },
    // the night: the torch to the wood; the slab lifted slowly by its ring (two fingers on a phone, one with a mouse) past the prop's
    // mark; the keys and the gates are the act's; lowered to exactly its place. __BOT.bad 'slab' (pressed on down past the floor: it
    // touches down fast, a corner cracks, −20)
    h7night(a) {
      const bad = B.bad || '', has = (k) => bad.split(',').includes(k), K = B.k, mouse = !!a.mouse || !!window.__BOT_MOUSE;
      if (a.phase === 'fire') return { drag: [a.torch[0], a.torch[1], a.hearth[0], a.hearth[1], 900], wait: 800, note: 'night: the torch to the wood' };
      // (every gate shot as its leaves swing: the frame from inside the court, the torch on the leaves)
      // (round 3: the 'b' shot once its leaves are shut, its bolt home and its flash gone (lockS 'shut'); the fire lit; his garment, his sleep)
      if (a.phase === 'sleep' && !K.sleepShot) { K.sleepShot = 1; return { wait: 1800, shot: 'night-fire' }; }
      if (a.phase === 'done' && a.sleepS && !K['sl' + a.sleepS]) { K['sl' + a.sleepS] = 1; return { wait: a.sleepS === 'asleep' ? 900 : 500, shot: 'night-' + a.sleepS, note: 'night: ' + a.sleepS + ' kohen ' + JSON.stringify(a.kohen) + ' sleepers ' + a.sleepers }; }
      if (a.phase !== 'lift' && a.phase !== 'lower') { if (a.phase === 'lock' && a.lockI >= 0 && !K['lk' + a.lockI]) { K['lk' + a.lockI] = 1; return { wait: 1700, shot: 'night-gate' + a.lockI + 'a' }; } if (a.phase === 'lock' && a.lockI >= 0 && a.lockS === 'shut' && !K['lkb' + a.lockI]) { K['lkb' + a.lockI] = 1; return { wait: 50, shot: 'night-gate' + a.lockI + 'b' }; } if (a.phase === 'levi' && !K.leviShot) { K.leviShot = 1; return { wait: 1600, shot: 'night-levi' }; } return { wait: 200, note: 'night: ' + a.phase }; }
      if (!K[a.phase + 'Shot']) { K[a.phase + 'Shot'] = 1; return { wait: 100, shot: 'night-' + a.phase }; }
      // (two thumbs, one on each of the ring's grips; a mouse: the one nearer the middle)
      const G = a.grips, pts = (dy) => (mouse ? [[G[0][0], G[0][1] + dy]] : G.map((q) => [q[0], q[1] + dy]));
      // (R4's proof, __BOT.bad 'tilt': the first lift uneven — touch: the left thumb ahead of the right; mouse: the pointer drifting
      //  sideways — stopped once the slab leans past its knock, the lean's still; let go there it drops back with the bang, then the
      //  clean lift)
      if (a.phase === 'lift' && has('tilt') && !K.tiltDone) {
        if (K.tiltGo) { K.tiltDone = 1; return { wait: 0, shot: 'night-lean', note: 'night R4: the slab leans · tilt ' + a.tilt + ' h ' + a.h }; }
        K.tiltGo = 1; const fr = [];
        for (let i = 0; i <= 12; i++) { const u = i / 12; fr.push(mouse ? [[G[0][0] + a.unit * 0.3 * u, G[0][1] - a.unit * 0.75 * u]] : [[G[0][0], G[0][1] - a.unit * 0.8 * u], [G[1][0], G[1][1] - a.unit * 0.5 * u]]); }
        return { seq: fr, ms: 230, seqUntil: C("return !a||a.sphase!=='lift'||Math.abs(a.tilt)>0.2"), wait: 0, note: 'night R4: an uneven lift' };
      }
      if (a.phase === 'lift') { const fr = []; for (let i = 0; i <= 12; i++) fr.push(pts(-a.unit * 1.05 * (i / 12))); return { seq: fr, ms: 230, seqUntil: C("return !a||a.sphase!=='lift'"), seqLoop: 12, seqMax: 12000, wait: 400, note: 'night: lift the slab (h ' + a.h + ')' }; }
      // (past the floor a little: held there, the slab settles on its seat)
      const far = has('slab') ? 1.8 : a.h + 0.08, fr = []; for (let i = 0; i <= 14; i++) fr.push(pts(a.unit * far * (i / 14)));
      return { seq: fr, ms: has('slab') ? 60 : 260, seqUntil: C("return !a||a.phase!=='lower'"), seqLoop: 14, seqMax: 15000, wait: 600, note: 'night: lower the slab' + (has('slab') ? ' (pressed past the floor)' : '') };
    },
    // ── /h129 ──
    // ── h129 Golah ── (build 129, part 3: the Golah's player, h129/golah.js dbg()). Fill to what the trough still needs, pull as the bucket
    // passes the middle, wait for the swing to die before the meeting and the last pull, carry and tip at the rim, open only the trough
    // that is being filled (switched when the channel is empty). __BOT.bad: 'gbucket' (golah1: pulls at the swing's ends until a bucket
    // cracks), 'grim' (golah2: the last pulls fed and not waited for: a rim stone breaks), 'gflood' (golah2: two full buckets into A, 1.5)
    h7golah(a) {
      const bad = B.bad || '', has = (k) => bad.split(',').includes(k), K = B.k, mouse = !!a.mouse || !!window.__BOT_MOUSE;
      // (G11: the moment's stills by the act's own clock — the troughs from the court before the cut, the kohen washing once his picture
      //  has stood a while and before any card; the figures' report with each)
      if (a.phase !== 'play') {
        if (a.phase === 'moment' && !K.momShot && a.view === 'far' && a.mom >= 0.9) { K.momShot = 1; return { wait: 0, shot: a.id + '-moment', note: 'golah: the moment figs ' + JSON.stringify(a.figs) }; }
        if (a.phase === 'moment' && !K.momShot2 && a.view === 'wash' && a.washFor >= 1.6) { K.momShot2 = 1; return { wait: 0, shot: a.id + '-wash', note: 'golah: the wash figs ' + JSON.stringify(a.figs) + ' kohen ' + JSON.stringify(a.kohen) + ' gate ' + JSON.stringify(window.__FIG && __FIG.report && __FIG.report()) }; }
        return { wait: 100, note: 'golah: ' + a.phase + ' ' + a.view };
      }
      // (each trip is progress: the wall's limit counts from the last one — at 1600×900 the page runs slower than its clock and golah3's
      //  five or six trips by mouse take longer than the wall's 240 s)
      if (K.trip !== a.trip || K.ph !== a.phase) { K.trip = a.trip; K.ph = a.phase; B.actT = now(); }
      const fl = (f) => (a.flags[f] || []).length;
      const gb = has('gbucket') && a.id === 'golah1' && !fl('golah.bucket'), gr = has('grim') && a.id === 'golah2' && !fl('golah.rim'), gf = has('gflood') && a.id === 'golah2' && !fl('golah.flood');
      // (a touch the act did not take lifted the camera: a tap brings it back, as a player would)
      if (a.look && !a.look.play && (a.look.u > 0.02 || Math.abs(a.look.yaw) > 0.03) && !window.__BOT_LOOKOK) return { tap: [Math.round(innerWidth - 30), Math.round(innerHeight * 0.55)], wait: 500, note: 'golah: LOOK AWAY u ' + a.look.u + ' · a tap returns the camera' };
      // the target trough: chosen when nothing is on its way (the first not yet full), kept until that water has landed
      const moving = a.head + a.cw + (a.mph === 'fill' ? 0 : a.f);
      // (build 129 R1: golah3 in four ascents — the big trough first with a full bucket, then the one a full bucket fills, then the small
      //  one, and last the big one's top-up, filled by the water it already holds: B, A, C, B)
      const gap = (k) => a.tr[k][1] - a.tr[k][0], open3 = a.id === 'golah3' ? a.ks.filter((k) => gap(k) > 0.06).sort((p, q) => (gap(q) >= 0.95) - (gap(p) >= 0.95) || gap(q) - gap(p)) : null;
      if (!K.tg || (a.mph === 'fill' && a.head < 1e-3 && a.cw < 1e-3)) K.tg = (gf && a.tr.A[0] < 1.7) ? 'A' : open3 ? open3[0] || a.ks[0] : a.ks.find((k) => gap(k) > 0.06) || a.ks[0];
      const need = (k) => a.tr[k][1] - a.tr[k][0] - (k === K.tg ? moving : 0);
      // the sluices: only the target's open (on the screen: the rim's view)
      for (const k of a.ks) {
        const want = k === K.tg ? 1 : 0, q = a.sluice[k];
        if (a.sl[k] !== want && q && q[0] > 20 && q[0] < innerWidth - 20 && q[1] > 60 && q[1] < innerHeight - 20) return { drag: [q[0], q[1], q[0], q[1] + (want ? -70 : 70), 260], wait: 300, note: `golah: sluice ${k} ${want ? 'open' : 'shut'}` };
      }
      if (K.pshot) { K.pshot = 0; return { wait: 0, shot: `${a.id}-pour${a.trip}` }; }
      if (a.mph === 'rim') {
        if (!K['rim' + a.trip]) { K['rim' + a.trip] = 1; return { wait: 300, shot: `${a.id}-rim${a.trip}` }; }
        if (!a.bucket || !a.over || !a.tiltTo) return { wait: 300 };
        if (!K['pour' + a.trip]) { K['pour' + a.trip] = 1; K.pshot = 1; return { path: [a.bucket, a.over, a.tiltTo], ms: 900, keep: 1500, wait: 0, note: 'golah: carry and tip (a still while it pours)' }; }
        return { path: [a.bucket, a.over, a.tiltTo], ms: 900, keep: 9000, release: C("return !a||a.mph!=='rim'"), wait: 400, note: `golah: carry and tip (trip ${a.trip})` };
      }
      // (G5: the far view after a pour — the stones are set above; a tap where no stone is goes back to the well once the water on its
      //  way has landed where it should)
      if (a.view === 'far' && a.back && a.mph === 'fill') {
        if (moving > 1e-3 && need(K.tg) < 0.08) return { wait: 300, note: 'golah: the water on its way fills ' + K.tg + ' (far view)' };
        // (the still waits for the fade to clear: a shot is taken before its step's wait)
        if (!K['far' + a.trip]) { K['far' + a.trip] = 1; return { wait: 900, note: 'golah: the far view (the fade clears)' }; }
        if (K['far' + a.trip] === 1) { K['far' + a.trip] = 2; return { wait: 300, shot: `${a.id}-far${a.trip}` }; }
        return { tap: a.back, wait: 700, note: 'golah: back to the well' };
      }
      const rope = a.rope; if (!rope) return { wait: 300, note: 'golah: no rope on the screen (' + a.view + ')' };
      // (the stroke starts where the rope is at that moment: the rope moves on the screen as the camera follows the bucket)
      const stroke = (cond, why) => ({ when: C(`return !a||a.phase!=='play'||(${cond})`), max: 4000, then: { dragAt: C("const r=a&&a.rope;return r?[r[0],r[1],r[0],r[1]+70,80]:null") }, wait: 120, note: why });
      if (a.mph === 'fill') {
        // (what is on its way fills the target: wait for it to land, then the next trough and its stone)
        if (moving > 1e-3 && need(K.tg) < 0.08) return { wait: 300, note: 'golah: the water on its way fills ' + K.tg };
        let ft = Math.min(1, Math.max(0.1, need(K.tg) + 0.02)); if (gf && K.tg === 'A') ft = 1;
        if (a.f < ft - 0.03) return { holdUntil: [rope[0], rope[1], C(`return !a||a.f>=${(ft - 0.02).toFixed(3)}`), 5000], wait: 150, note: `golah: fill to ${ft.toFixed(2)} for ${K.tg}` };
        if (!K['fill' + a.trip]) { K['fill' + a.trip] = 1; return { wait: 100, shot: `${a.id}-full${a.trip}` }; }
        return stroke('a.toMid<0.05', 'golah: the first pull');
      }
      // (pull) the stills: the swing, the meeting
      if (!K['sw' + a.trip] && a.y < a.depth * 0.75) { K['sw' + a.trip] = 1; return { wait: 50, shot: `${a.id}-swing${a.trip}` }; }
      if (!K['meet' + a.trip] && Math.abs(a.y - a.depth / 2) < 1.3) { K['meet' + a.trip] = 1; return { wait: 50, shot: `${a.id}-meet${a.trip}` }; }
      if (gb) return stroke('a.toEnd<0.04', 'golah: a pull at the swing\'s end (the mistake)');
      const lift = 1.5 - 0.5 * a.f;
      // (grim, G8: a swing under STOP can no longer be fed, so the mistake keeps it alive the whole way — fed at an end while it is under
      //  0.45 (a full feed is +0.585: under the wall's 1.1), left to swing above that; at the meeting it waits to 0.4 and pulls in the
      //  middle (no clash), then feeds again: the model's run of this (p3h/tools/grim.mjs) breaks the rim in golah2 at A 0.95)
      if (!a.met && a.y - lift <= a.depth / 2 + 0.5 && a.A > (gr ? 0.4 : 0.3)) return { wait: 250, note: 'golah: the meeting comes: wait for the swing to die (A ' + a.A + ')' };
      if (gr && (a.met || a.y - lift > a.depth / 2 + 0.5)) return a.A >= 0.45 ? { wait: 150 } : stroke('a.toEnd<0.04', 'golah: the swing fed up to the rim (the mistake, A ' + a.A + ')');
      if (a.y <= lift + 0.05 && a.A > 0.15) return { wait: 250, note: 'golah: the last pull: wait for the swing (A ' + a.A + ')' };
      return stroke('a.toMid<0.05', 'golah: pull in the middle');
    },
    // ── /h129 Golah ──
    // ── h130 wood ── (build 130, station 2: the wood chamber, h130/wood.js dbg()). Plays each log as a careful player: level 1 rolls it a
    // whole turn and looks; level 2 taps along it, and where it rings hollow turns the hole to the eye and peels a strip there; level 3
    // taps along it and draws the chalk line across at the best cut; then it takes the log by an end and carries it right (clean) or
    // left (out). __BOT.bad 'worm': the first wormy log is carried into the clean pile (wood.worm, −20; the pile comes back to be checked).
    // Stills (__BOT_SHOTS130): the first look of each level, a hollow tap, a peel, the chalk line, a carry held at the green mark.
    wood(a) {
      const bad = B.bad || '', has = (k) => bad.split(',').includes(k), K = B.k, shots = !!window.__BOT_SHOTS130;
      if (shots && a.busy && a.figs && a.figs.saw && !K['shotS' + a.log]) { K['shotS' + a.log] = 1; return { wait: 100, shot: a.id + '-saw-' + a.log }; }
      // ── h130 ── (build 130 part 3: a still of the crew man rolling a log onto the trestles, once a level) ── /h130 ──
      if (shots && a.phase === 'arrive' && a.roll > 0.45 && !K['shotR' + a.id]) { K['shotR' + a.id] = 1; return { shot: a.id + '-roll-in', note: 'wood: rolled in by ' + JSON.stringify(a.figs) }; }
      if (a.busy || a.phase !== 'look' || !a.a || !a.b) return { wait: 300, note: 'wood: ' + a.phase };
      const key = a.id + ':' + a.log + ':' + a.left + ':' + (a.cut || '') + ':' + a.piles.clean, L = K[key] || (K[key] = { n: 0 });
      const ax = a.b[0] - a.a[0], ay = a.b[1] - a.a[1], len = Math.hypot(ax, ay) || 1, ux = ax / len, uy = ay / len;
      if (shots && !K['shot' + a.id]) { K['shot' + a.id] = 1; return { wait: 200, shot: a.id + '-look' }; }
      const body = (s) => { const k = (s - a.keep[0]) / (a.keep[1] - a.keep[0]); return [a.a[0] + ax * k, a.a[1] + ay * k]; };
      const across = (p, cond) => ({ path: [[p[0] + uy * -18, p[1] - ux * -18], [p[0] - uy * 60, p[1] + ux * 60]], ms: 450, wait: 700 });
      // (the decision: by the end band, carried past the green mark, let go there)
      const carry = (to) => {
        const e = to === 'clean' ? a.b : a.a, o = to === 'clean' ? a.a : a.b, k = 0.18 / (a.keep[1] - a.keep[0]), p = [e[0] + (o[0] - e[0]) * k, e[1] + (o[1] - e[1]) * k], d = to === 'clean' ? 1 : -1;
        const q = [Math.max(30, Math.min(innerWidth - 30, p[0] + d * 300)), p[1]];
        // ── h130 ── (build 130 part 3: the first carry each way of a level held 1.6 s at its end, a still with the finger down — the shot the
        // carry eased to: the rejects' pile on the left, the clean one on the right) ── /h130 ──
        if (shots && !K['shotC' + a.id + to]) { K['shotC' + a.id + to] = 1; const fr = []; for (let i = 1; i <= 18; i++) fr.push([[p[0] + (q[0] - p[0]) * i / 18, p[1]]]); for (let i = 0; i < 40; i++) fr.push([q]); return { seq: fr, ms: 40, seqShot: [56, a.id + '-carry-' + to], wait: 1500, note: `wood: ${a.log} → ${to} (held)` }; }
        return { path: [p, q], ms: 700, keep: 6000, release: C(`return !a||a.phase!=='look'||Math.abs(a.off)>1.7`), wait: 1500, note: `wood: ${a.log} → ${to}` };
      };
      const wantWorm = has('worm') && !K.wormDone && a.wormy && !a.cuttable;
      if (L.n === 0 && wantWorm) { K.wormDone = 1; L.n = 99; return carry('clean'); }
      if (a.lv === 1) {
        if (a.turned < 365 && L.n < 3) { L.n++; const p = body(a.keep[0] + 0.3 * (a.keep[1] - a.keep[0])), d = L.n % 2 ? 1 : -1; return { path: [p, [p[0] + d * ux * 320, p[1] + d * uy * 320]], ms: 900, wait: 500, note: 'wood: roll ' + a.log }; }
        return carry(a.wormy ? 'out' : 'clean');
      }
      // (level 2 and 3: taps along the log, every half amah, until the hollow is heard or the log is done)
      const S = Object.keys(a.pt).map(Number).filter((s) => s > a.keep[0] + 0.45 && s < a.keep[1] - 0.45);
      L.t = L.t || 0;
      if (L.t < S.length && !(L.heard && L.t >= 3)) { const s = S[L.t++]; const r = { tap: a.pt[s], wait: 650, note: 'wood: tap ' + a.log + ' at ' + s }; if (shots && a.hollow && s >= a.hollow[0] && s <= a.hollow[1] && !K['shotH' + a.id]) { K['shotH' + a.id] = 1; r.then = undefined; r.shot = a.id + '-hollow-tap'; } if (a.hollow && s >= a.hollow[0] && s <= a.hollow[1]) L.heard = 1; return r; }
      if (a.lv === 2) {
        if (a.wormy && a.holeAt && !L.peeled) {
          const want = -a.holeAng, d = (((want - a.rot) % 360) + 540) % 360 - 180;
          if (Math.abs(d) > 8 && (L.r | 0) < 4) { L.r = (L.r | 0) + 1; const p = body(a.keep[0] + 0.25 * (a.keep[1] - a.keep[0])), px = d / 1.25; return { path: [p, [p[0] + ux * px, p[1] + uy * px]], ms: 600, wait: 400, note: 'wood: turn the hole to the eye ' + d.toFixed(0) }; }
          L.peeled = 1; const r = across(body(a.holeS)); r.note = 'wood: peel at ' + a.holeS; if (shots && !K.shotP) { K.shotP = 1; r.wait = 900; r.then = undefined; } return r;
        }
        if (L.peeled === 1 && shots && !K.shotP2) { K.shotP2 = 1; return { wait: 200, shot: a.id + '-peeled' }; }
        return carry(a.wormy ? 'out' : 'clean');
      }
      if (a.best != null && !a.cut) { if (L.c) return { wait: 500 }; L.c = 1; const r = across(body(a.best)); r.note = 'wood: the chalk line at ' + a.best; r.wait = 600; return r; }
      if (a.cut && shots && !K['shotX' + a.log]) { K['shotX' + a.log] = 1; return { wait: 200, shot: a.id + '-cut-' + a.log }; }
      return carry(a.cut === 'near' ? 'out' : 'clean');
    },
    // ── /h130 wood ──
    // ── h130 light ── (build 130, station 3 "חמישים אמה של אור": the player of kind 'light', h130/light.js dbg()). The wick: the left
    // thumb holds the garment, the right pulls a strip off its edge at 0.7 amah a second (a mouse: the strip alone); the oil: hin, hin,
    // half a hin; the ladder: each hand lifted as the jar passes the middle going away from it (or when it is still), drawn up to the
    // next rung — by mouse the right hand with the right button; the pour: the jar tilted slowly to 0.6; the wick to the bowl; the
    // taper to the wick. __BOT.bad: 'tear' (the first strip pulled fast: torn, no loss), 'over' (three hins: over thirty, no loss),
    // 'jar' (light2: each hand lifted as the jar swings toward it until the jar falls: light.jar, −20). __BOT_LIFT3: a still and the
    // figures' report at the camera's lift 0.3 once per phase.
    light(a) {
      const bad = B.bad || '', has = (k) => bad.split(',').includes(k), K = B.k, mouse = !!a.mouse || !!window.__BOT_MOUSE;
      const figs = () => { try { return JSON.stringify(window.__FIG && __FIG.report ? __FIG.report() : null); } catch (e) { return 'ERR'; } };
      const once = (key, r) => { if (K[key]) return null; K[key] = 1; return r; };
      // (a still per phase at lift 0, then at lift 0.3 with the figures' report)
      if (['wick', 'oil', 'climb', 'pour', 'lay', 'light'].includes(a.phase)) {
        const w0 = once('w0' + a.phase, { wait: 1500 }); if (w0) return w0;   // (the shot settles first)
        const s0 = once('s0' + a.phase, { wait: 300, shot: `${a.id}-${a.phase}`, note: `light: ${a.phase} · figs u0 ${figs()}` }); if (s0) return s0;
        if (window.__BOT_LIFT3) {
          const s1 = once('s1' + a.phase, { eval: '__T.game.h109.X.lookLift(0.3)', wait: 1600, note: 'light: lift 0.3' }); if (s1) return s1;
          const s2 = once('s2' + a.phase, { wait: 100, shot: `${a.id}-${a.phase}-lift03`, note: `light: figs at lift 0.3 ${figs()}` }); if (s2) return s2;
          const s3 = once('s3' + a.phase, { eval: `__T.game.h109.X.lookLift(${a.phase === 'climb' && !mouse ? 0.22 : 0})`, wait: 2600 }); if (s3) return s3;   // (the lift eases back before the bot acts: px per amah settles)
        }
      }
      if (a.look && !a.look.play && (a.look.u > 0.02 || Math.abs(a.look.yaw) > 0.03) && !window.__BOT_LOOKOK) return { tap: [Math.round(W - 30), Math.round(HH * 0.55)], wait: 500, note: 'light: LOOK AWAY u ' + a.look.u + ' · a tap returns the camera' };
      if (a.phase === 'wick' && a.edge && a.pull) {
        if (a.wicks.length >= a.need) return { wait: 300 };
        const us = [0.5, 0.15, 0.85, 0.5], u = us[a.wicks.length % 4], e = [a.edge[0][0] + (a.edge[1][0] - a.edge[0][0]) * u, a.edge[0][1] + (a.edge[1][1] - a.edge[0][1]) * u];
        const fast = has('tear') && !a.tears, sp = fast ? 2.6 : 0.7, L = 1.12 * a.pull.px, ms = Math.round((1.12 / sp) * 1000), n = Math.max(6, Math.round(ms / 50));
        const fr = []; const pt = (i) => [e[0] + a.pull.ux * L * (i / n), e[1] + a.pull.uy * L * (i / n)];
        if (!mouse) fr.push([a.hold]);
        for (let i = 0; i <= n; i++) fr.push(mouse ? [pt(i)] : [a.hold, pt(i)]);
        return { seq: fr, ms: 50, wait: 700, note: `light: strip ${a.wicks.length + 1}/${a.need} at ${u} (${fast ? 'FAST: the tear' : sp + ' amah/s'}, ${a.pull.px} px/amah)` };
      }
      if (a.phase === 'oilcard') { if (!K.card) { K.card = 1; return { wait: 1800, shot: `${a.id}-card`, note: 'light: the card of Beit Shemanya' }; } return { tap: [Math.round(W / 2), Math.round(HH / 2)], wait: 900, note: 'light: a tap on the card closes it' }; }
      if (a.phase === 'oil' && a.cups && a.jar) {
        const plan = has('over') && !K.overDone ? ['hin', 'hin', 'hin'] : ['hin', 'hin', 'half'];
        if (has('over') && a.pours.length === 3 && a.total > 30) K.overDone = 1;
        if (a.cups.some((c) => c.busy)) return { wait: 300 };
        if (a.total > 30) return { wait: 400, note: 'light: over thirty — it is emptied back' };
        const id = plan[a.pours.length]; if (!id) return { wait: 400 };
        const c = a.cups.find((q) => q.id === id);
        return { drag: [c.at[0], c.at[1], a.jar[0], a.jar[1] - 20, 800], wait: 1900, note: `light: pour ${id} (${a.total} so far)` };
      }
      if (a.phase === 'climb' && a.climb) {
        if (K.rung !== a.climb.rung) { K.rung = a.climb.rung; B.actT = now(); }   // (each rung is progress: the wall's limit counts from it)
        const c = a.climb, h = c.up || (c.L <= c.R ? 'L' : 'R'), sg = h === 'R' ? 1 : -1, pump = has('jar') && a.id === 'light2' && !a.drops;
        const cond = pump ? `const c=a&&a.climb;return !c||a.phase!=='climb'||(Math.abs(c.phi)<0.1&&${sg}*c.w>0)`
          : `const c=a&&a.climb;return !c||a.phase!=='climb'||c.up||(Math.abs(c.phi)<0.1&&${-sg}*c.w>0)||(Math.abs(c.phi)<0.03&&Math.abs(c.w)<0.15)`;
        const get = C(`const c=a&&a.climb;if(!c)return null;const h=c.up||'${h}',p=c.hands[h],q=c.next[h];return [p[0],p[1],q[0]+(q[0]-p[0])*0.15,q[1]+(q[1]-p[1])*0.15,220${mouse ? ",h==='R'?'right':'left'" : ''}]`);
        if (c.up) return mouse ? { mouseDragAt: get, wait: 60 } : { dragAt: get, wait: 60, note: 'light: the lifted hand up' };
        return { when: C(cond), max: 4000, then: mouse ? { mouseDragAt: get } : { dragAt: get }, wait: 40, note: `light: rung ${c.rung}/${c.top} ${h} (phi ${c.phi}, oil ${c.oil})${pump ? ' PUMP' : ''}` };
      }
      if (a.phase === 'pour' && a.pour) {
        const P = a.pour, [ux, uy, d] = P.dir, den = Math.max(90, Math.min(d * 1.4, 0.32 * HH)), D = 0.62 * den;
        return { path: [P.jar, [P.jar[0] + ux * D, P.jar[1] + uy * D]], ms: 1100, keep: 15000, release: C("return !a||a.phase!=='pour'"), wait: 500, note: `light: pour (oil ${P.oil})` };
      }
      if (a.phase === 'lay' && a.wick && a.aim) return { drag: [a.wick[0], a.wick[1], a.aim[0], a.aim[1], 700], wait: 900, note: 'light: the wick into the bowl' };
      if (a.phase === 'light' && a.taper && a.aim) return { drag: [a.taper[0], a.taper[1], a.aim[0], a.aim[1], 900], wait: 900, note: 'light: the taper to the wick' };
      return { wait: 300, note: 'light: ' + a.phase };
    },
    // ── /h130 light ──
    // ── h130 eve ── (build 130 part 3: the evening, h130/eve.js dbg()): it plays itself; a still at each beat (dusk, rise, city, down,
    // card) with its numbers, then a tap closes the card
    eve(a) {
      const K = B.k;
      if (!K['e' + a.phase]) { K['e' + a.phase] = 1; return { wait: ({ dusk: 1200, rise: 3200, city: 5200, down: 4600, card: 1500 })[a.phase] || 2200, shot: `eve-${a.phase}`, note: `eve: ${a.phase} lit ${a.lit}/${a.of} reach ${a.reach} figs ${a.figs} shadows ${a.shadows}` }; }
      if (a.phase === 'card' && !K.cardTap) { K.cardTap = 1; return { tap: [Math.round(W / 2), Math.round(HH / 2)], wait: 1200, note: 'eve: a tap closes the card' }; }
      return { wait: 400 };
    },
    // ── /h130 eve ──
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
  // (build 04m: one log line when each work ends, every stage — `end <work id> stars N pts P flags {...}` — from the director's own 'end'
  //  entry (h109/director.js log) and the act's last state the bot saw; a whole-game run's results are reset per stage, this line is not)
  if (!B.endHook) {
    B.endHook = 1; B.endQ = []; B.lossN = 0; B.lossL = [];
    const LG = window.__H109_LOG || (window.__H109_LOG = []), p0 = LG.push;
    LG.push = function (...xs) { for (const x of xs) { const t = String(x); if (/^end /.test(t)) B.endQ.push({ t, act: B.lastAct, loss: B.lossN, losses: B.lossL.slice() }); else if (/^loss /.test(t)) { B.lossN += +t.split(' ')[1] || 0; B.lossL.push(t.slice(5, 60)); } else if (/^act /.test(t)) { B.lossN = 0; B.lossL = []; } } return p0.apply(this, xs); };
  }
  const FLAG = /fall|chip|knock|oneEnd|split|refus|slam|tear|shear|wrong|lost|miss|spill|dent|crack|brok|slip|drop|fail|late|early|bad|hard|stuck|gap/i;
  const endLine = (e) => {
    const [, id, , stars, lost] = e.t.split(' '), a = e.act || {}, fl = {};
    for (const [k, v] of Object.entries(a)) if (FLAG.test(k) && ((typeof v === 'number' && v > 0 && !/^(stuck|slip|tiltOk|sway|chipV)$/.test(k)) || v === true)) fl[k] = v;
    if (e.loss) fl.loss = e.loss; if (e.losses.length) fl.losses = e.losses; if (lost) fl.LOST = 1;
    let pts = Number.isFinite(+a.pts) && a.pts !== null && a.pts !== undefined ? a.pts : null;
    if (pts == null) { try { const r = H().M && H().M.st && H().M.st.res && H().M.st.res[id]; if (r && r.q != null) pts = 'q' + r.q; } catch (er) { /* */ } }
    return `end ${id} stars ${stars} pts ${pts == null ? '-' : pts} flags ${JSON.stringify(fl)}`;
  };
  B.next = () => {
    if (B.endQ && B.endQ.length) return { wait: 20, note: endLine(B.endQ.shift()) };
    const S = H().state();
    if (S && S.act) B.lastAct = S.act;
    // ── h129 ── (G12: the work's end line — its act seconds, and a Golah work's trips — once its act has ended) ── /h129 ──
    if (B.actInfo && (S.phase !== 'act' || !S.act || B.actInfo.m !== S.mission)) { const I = B.actInfo; B.actInfo = null; let r = null; try { r = H().M.st.res[I.m]; } catch (e) { r = null; } return { wait: 50, note: `END ${I.m} · act ${I.t.toFixed(1)} s` + (I.trip != null ? ` · trips ${I.trip}` : '') + ` · stars ${r ? r.stars : '?'}` + (r && r.flags ? ' · flags ' + JSON.stringify(r.flags) : '') }; }
    if (S.phase === 'act' && S.act && S.mission) B.actInfo = { m: S.mission, t: +S.act.t || 0, trip: /^golah/.test(S.mission) && S.act.trip != null ? S.act.trip : null };
    if (!S.started && S.phase === 'off') {
      if (!B.endSeen) { B.endSeen = now(); return { wait: 2500, shot: 'stage-end', note: 'the stage is over' }; }
      return { done: true };
    }
    // (the films between levels and the end: a frame every 2.5 s, when the probe asks for them)
    if (window.__BOT_FILM && (S.phase === 'film' || S.phase === 'end') && now() - (B.filmT || 0) > 2500 && (B.filmN = (B.filmN || 0) + 1) < 80) { B.filmT = now(); return { wait: 200, shot: `film-${S.phase}-${S.mission || 'end'}-${B.filmN}` }; }
    if (S.phase === 'walk') {
      // ── h128 ── (__BOT_PLAN: the plan's works only — at a free ring he walks on toward the gate, as a player who leaves it to the crews;
      // the close's stand, BOOK.s06.close.stand) ── /h128 ──
      if (H().site === 'nikanor' && window.__BOT_PLAN && S.mission && /F:/.test(S.mission)) { if (now() - (B.awayT || 0) > 4000) { B.awayT = now(); return { eval: "(()=>{__T.game.h109.X.stages.hero.walkTo({x:-6,z:0});return 'away'})()", wait: 600, note: 'plan only: past the free ring ' + S.mission }; } return { wait: 300 }; }
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
    // ── h128 ── (capstan: six notches and rests) (build 128 C3: on stage 06 the limit is the act's own clock where it has one, not the
    // wall's: at 1600×900 the software renderer runs the page about four times slower than its clock, and a whole ring by mouse took the
    // wall's 240 s while the act was 62 s in and still going; the wall's limit stays, three times over, for an act that never ticks) ── /h128 ──
    // ── h129 ── (stage 07 the same: the night by mouse, its gates' stills, ran past the wall's 240 s at 35 s of its clock) ── /h129 ──
    // ── h129 ── (G12: the Golah's works too — a clean golah3 needs more than 240 s of its own clock) ── /h129 ──
    // ── h130 ── (the new stage 05 the same, every work of it: the gallery's tests, the wood and the light with stills ran past the wall's) ── /h130 ──
    const LIM = /^(bond|capstan|golah)/.test(S.mission) ? 600000 : 240000, actClock = (H().site === 'nikanor' || H().site === 'lishka' || H().site === 'nashim') && S.act && Number.isFinite(+S.act.t) ? +S.act.t * 1000 : null;
    if (actClock != null ? (actClock > LIM || now() - B.actT > 3 * LIM) : now() - B.actT > LIM) { B.actT = now(); return { eval: '__T.game.h109._end({stars:1})', note: 'STUCK in ' + S.mission + ' ' + JSON.stringify(S.act).slice(0, 1400) }; }
    const kind = S.mission.replace(/F:.*$/, '').replace(/\d+(q\d)?$/, "").replace(/^(course|waste|rocks|read|pave)\d*/, "$1");   // (build 120: a free work 'colF:S3' is a 'col')
    const f = (H().site === 'nikanor' && play['h6' + kind.replace(/^wicket[NSs]$/, 'wicket')]) || (H().site === 'lishka' && play['h7' + kind.replace(/^vault[NSM]$/, 'vault')]) || play[kind]; if (!f) return { wait: 500, note: 'no player for ' + kind };   // ── h128 ── (stage 06's own players) ── /h128 ──
    // ── h128 ── (the camera turned away by a touch the act did not take — a drag decided a moment before the act's phase changed: a tap
    // brings it back as a player would, before the player decides anything) ── /h128 ──
    if (H().site === 'nikanor' && S.look && !window.__BOT_LOOKOK && (S.look.away && (S.look.u > 0.35 || Math.abs(S.look.yaw) > 0.3))) return { tap: [Math.round(W * 0.9), Math.round(HH * 0.28)], wait: 300, note: `LOOK AWAY u ${S.look.u} yaw ${S.look.yaw} · a tap returns the camera` };
    let r; try { r = f(S.act); } catch (e) { return { wait: 500, note: 'bot error ' + kind + ' ' + e.message }; }
    if (H().site === 'nikanor' && r && S.look && (S.look.u > 0.02 || Math.abs(S.look.yaw) > 0.03) && !(S.look.play && Math.abs(S.look.yaw) <= 0.03 && S.look.u <= 0.45) && !window.__BOT_LOOKOK) r.note = `LOOK AWAY u ${S.look.u} yaw ${S.look.yaw} · ` + (r.note || '');   // ── h128 ── (a touch that the act should have taken turned the camera: say so) ── /h128 ──
    // (build 125: say so when a touch would start on the HUD and not on the world — a test that must see it, never a silent stall)
    const p0 = r && (r.tap || r.hold || r.holdUntil || r.drag || r.tapWhen || (r.path && r.path[0]));
    if (p0 && Number.isFinite(p0[0]) && Number.isFinite(p0[1]) && p0[0] > 0 && p0[0] < W && p0[1] > 0 && p0[1] < HH && !onWorld(p0[0], p0[1])) { const e = document.elementFromPoint(p0[0], p0[1]); r.note = 'HUD under the touch ' + Math.round(p0[0]) + ',' + Math.round(p0[1]) + ' ' + (e ? e.tagName + '.' + String(e.className || '').slice(0, 40) : '') + ' · ' + (r.note || ''); }
    return r;
  };
  return 'bot ready';
})();
