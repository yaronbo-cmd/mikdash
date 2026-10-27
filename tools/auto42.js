/* build 42 — the autoplayer of the new stage 01 (src/game/har42.js), in the page: a child's hand (reaction 0.35–0.85 s, rough timing,
 * now and then a wrong choice) or the quick one (opts.skilled). It plays through the same surfaces a finger does — the walk's layer, the
 * act's layer on the thing, the pile's stones dragged to the course — by pointer events; it reads __H42's state, never writes it.
 *   __AUTO42.start({ skilled, seed, shot(name) }) → Promise<{ grades, times, notes }> ; __AUTO42.stop()
 * Never a Divine Name. */
(() => {
  if (globalThis.__AUTO42) return;
  const A = { on: false, notes: [], times: {}, shots: {} };
  let a = 1; const rnd = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const H = () => globalThis.__H42;
  const note = (s) => { A.notes.push([Math.round(performance.now() / 100) / 10, s]); if (A.notes.length > 200) A.notes.shift(); };
  const react = () => sleep(A.sk ? 120 + rnd() * 150 : 350 + rnd() * 500);
  let pid = 400;
  const ev = (el, type, x, y, id) => el.dispatchEvent(new PointerEvent(type, { pointerId: id, clientX: x, clientY: y, bubbles: true, cancelable: true, pointerType: 'touch', isPrimary: true, button: 0, buttons: type === 'pointerup' || type === 'pointercancel' ? 0 : 1 }));
  const q = (s) => document.querySelector(s);
  const mid = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  async function until(f, ms = 30000, step = 60) { const t0 = performance.now(); for (;;) { if (!A.on) throw new Error('stopped'); let v = null; try { v = f(); } catch (e) { v = null; } if (v) return v; if (performance.now() - t0 > ms) return null; await sleep(step); } }
  async function shot(name) { if (A.opts.shot && !A.shots[name]) { A.shots[name] = 1; try { await A.opts.shot(name); } catch (e) { /* */ } } }
  // walk: hold the world until he is there (the part's act begins)
  async function walk() {
    const w = q('.h42-walk'); if (!w) return;
    const id = ++pid, x = innerWidth * (0.3 + rnd() * 0.3), y = innerHeight * (0.45 + rnd() * 0.3);
    ev(w, 'pointerdown', x, y, id);
    let lifted = 0;
    const p0 = H().state().part;
    await until(() => { const s = H().state(); if (!A.sk && rnd() < 0.01 && lifted < 2) { ev(w, 'pointerup', x, y, id); lifted++; ev(w, 'pointerdown', x, y, id); } return s.part !== p0 || (!s.pending && s.part !== 'rope'); }, 40000, 80);
    ev(w, 'pointerup', x, y, id);
  }
  async function lift() {
    const pad = q('.h42-pad'); let tries = 0;
    while (A.on && H().job() && H().job().kind === 'lift' && tries < 8) {
      tries++; await react();
      const j = H().job(), s = j.s, P = j.ref.J.P, aim = (P.win[0] + P.win[1]) / 2 + (A.sk ? 0 : (rnd() - 0.5) * 0.16);
      const c = mid(pad), id = ++pid;
      if (s.y > P.win[1]) {   // over: a drag down (lowers) for a moment
        ev(pad, 'pointerdown', c.x, c.y, id); for (let i = 1; i <= 4; i++) { await sleep(30); ev(pad, 'pointermove', c.x, c.y + i * 10, id); }
        await until(() => { const k = H().job(); return !k || k.s.y < aim; }, 6000, 30); ev(pad, 'pointerup', c.x, c.y + 40, id);
      } else {
        ev(pad, 'pointerdown', c.x, c.y, id);
        await until(() => { const k = H().job(); return !k || k.ref.J.stopAt() >= aim; }, 9000, 30);
        ev(pad, 'pointerup', c.x, c.y, id);
      }
      await until(() => { const k = H().job(); return !k || k.kind !== 'lift' || (Math.abs(k.s.v) < 0.012); }, 6000, 50);
      await sleep(200);
    }
  }
  async function rock() {
    const pad = q('.h42-pad'); const j0 = H().job(); if (!j0) return;
    // sweep the light across, slowly, until a line shows
    for (let pass = 0; pass < 4 && A.on; pass++) {
      await react(); const B = j0.ref.box(); if (!B) { await sleep(200); continue; }
      const id = ++pid, y = B.cy; ev(pad, 'pointerdown', B.l + 6, y, id);
      for (let i = 0; i <= 24; i++) { await sleep(A.sk ? 25 : 45); ev(pad, 'pointermove', B.l + 6 + ((B.w - 12) * i) / 24, y + (rnd() - 0.5) * 8, id); }
      ev(pad, 'pointerup', B.r - 6, y, id);
      if (j0.ref.lines().length && (j0.ref.lines().length > 1 || rnd() < 0.8)) break;
    }
    const L = j0.ref.lines(); if (!L.length) { note('rock: no line seen'); return; }
    // the line: a child picks one (the one with the layers mostly when he has seen both — he reads the line "רק אחד הולך עם השכבות")
    const truth = j0.ref.J.rock.lines.find((l) => l.layers), pick = L.length > 1 ? (rnd() < (A.sk ? 0.95 : 0.7) ? L.find((l) => l.id === truth.id) || L[0] : L.find((l) => l.id !== truth.id) || L[0]) : L[0];
    const n = 4, jit = A.sk ? 0.02 : 0.07;
    for (let i = 0; i < n && A.on; i++) {
      await react(); const g = j0.ref.lines().find((l) => l.id === pick.id); if (!g) break;
      const t = Math.max(0.05, Math.min(0.95, (i + 1) / (n + 1) + (rnd() - 0.5) * 2 * jit)), x = g.x0 + (g.x1 - g.x0) * t, y = g.y0 + (g.y1 - g.y0) * t, id = ++pid;
      ev(pad, 'pointerdown', x, y, id); await sleep(80); ev(pad, 'pointerup', x, y, id);
    }
    // the water: hold, let go as the crack reaches the end
    for (let k = 0; k < 4 && A.on && H().job() && H().job().kind === 'rock'; k++) {
      await react(); const c = mid(pad), id = ++pid; ev(pad, 'pointerdown', c.x, c.y, id);
      const aim = 0.95 + (A.sk ? 0 : (rnd() - 0.4) * 0.12);
      await until(() => { const jj = H().job(); return !jj || jj.kind !== 'rock' || jj.s.crack >= aim; }, 20000, 30);
      ev(pad, 'pointerup', c.x, c.y, id); await sleep(300);
    }
  }
  async function dragTo(item, x, y, settle) {
    const c = mid(item), id = ++pid; ev(item, 'pointerdown', c.x, c.y, id);
    for (let i = 1; i <= 12; i++) { await sleep(A.sk ? 20 : 40); ev(item, 'pointermove', c.x + ((x - c.x) * i) / 12, c.y + ((y - c.y) * i) / 12, id); }
    if (settle) await sleep(settle);
    ev(item, 'pointerup', x, y, id);
  }
  async function course() {
    for (let k = 0; k < 24 && A.on; k++) {
      const j = H().job(); if (!j || j.kind !== 'course' || j.s.done) break;
      await react(); const s = j.s, sp = j.ref.spec, rb = sp.corner ? sp.b - 2 : sp.b, left = rb - s.at;
      // ── build 45 ── the retreat (level 3): a drag on the course pushes the next stone that stands out back in
      if (s.prot && s.prot.length) { const pad = q('.h42-pad'), P = j.ref.uAt((sp.a + sp.b) / 2); if (pad && P) { const id = ++pid; ev(pad, 'pointerdown', P.x, P.y, id); for (let i = 1; i <= 5; i++) { await sleep(30); ev(pad, 'pointermove', P.x, P.y - i * 8, id); } ev(pad, 'pointerup', P.x, P.y - 40, id); } await sleep(300); continue; }
      // ── build 45 ── the corner: once the stretch is full, the corner stone the other way from the one below (a child: now and then the wrong way)
      if (left <= 0 && sp.corner && !s.corner.dir) { const dir = rnd() < (A.sk ? 0.98 : 0.75) ? sp.corner.want : sp.corner.want === 'a' ? 'b' : 'a', item = q(`.h42-pile [data-corner="${dir}"]`), T = j.ref.cornerAt(); if (item && T) await dragTo(item, T.x, T.y, 0); await sleep(300); continue; }
      // a length that fits; a child avoids the red joints most of the time
      let opts = [2, 3, 4].filter((n) => n <= left); if (!opts.length) { await sleep(200); continue; }
      const good = opts.filter((n) => n === left || !sp.below.some((jn) => Math.abs(jn - (s.at + n)) < 1e-6) && (left - n === 0 || left - n >= 2));
      const n = good.length && rnd() < (A.sk ? 0.97 : 0.75) ? good[Math.floor(rnd() * good.length)] : opts[Math.floor(rnd() * opts.length)];
      const item = [...document.querySelectorAll('.h42-pile .h42-it')].find((b) => !b.dataset.corner && b.textContent.trim().endsWith(String(n))); const B = j.ref.uAt ? j.ref.uAt(s.at + n / 2) : (() => { const b0 = j.ref.slot && j.ref.slot(); return b0 ? { x: (b0.l + b0.r) / 2, y: (b0.t + b0.b) / 2 } : null; })(); if (!item || !B) { await sleep(200); continue; }
      await dragTo(item, B.x + (A.sk ? 0 : (rnd() - 0.5) * 16), B.y + (A.sk ? 0 : (rnd() - 0.5) * 24), 0);   // (build 45: no hold — it settles by itself)
      await sleep(250);
    }
    await until(() => { const j = H().job(); return !j || j.kind !== 'course'; }, 20000, 100);
  }
  // ── build 46 ── the lattice: the right piece (a child: now and then a wrong one first), turned (a tap) and flipped (a double tap) until it
  // matches the gap — read from the director's own pattern — then dragged into the gap
  async function lattice46() {
    for (let k = 0; k < 14 && A.on; k++) {
      const j = H().job(); if (!j || j.kind !== 'lattice' || j.s.done) break;
      await react(); const s = j.s, items = j.ref.items(), R2 = j.ref.slotRect(); if (!R2) { await sleep(200); continue; }
      const same = (a, b) => JSON.stringify(a.map((x) => x.join(',')).sort()) === JSON.stringify(b.map((x) => x.join(',')).sort());
      const T = globalThis.__F46 || null;
      const tray = s.tray, ri = tray.findIndex((p) => p.type === (T ? T.kinds[s.kind].tile : tray[0].type));
      const pick = !A.sk && rnd() < 0.2 && !s.mistakes ? (ri + 1) % tray.length : ri, b = items[pick]; if (!b) break;
      const c = mid(b);
      if (pick === ri && T) {   // turn and flip until it matches
        for (let g = 0; g < 9; g++) { const p = j.ref.J.state().tray[ri]; if (same(T.tile(p.type, p.r, p.f), s.need)) break; const want = (() => { for (let f = 0; f < 2; f++) for (let r = 0; r < 4; r++) if (same(T.tile(p.type, r, f), s.need)) return { r, f }; return null; })(); if (!want) break;
          if (want.f !== p.f) { const id = ++pid; ev(b, 'pointerdown', c.x, c.y, id); ev(b, 'pointerup', c.x, c.y, id); await sleep(90); const id2 = ++pid; ev(b, 'pointerdown', c.x, c.y, id2); ev(b, 'pointerup', c.x, c.y, id2); await sleep(420); }
          else { const id = ++pid; ev(b, 'pointerdown', c.x, c.y, id); ev(b, 'pointerup', c.x, c.y, id); await sleep(480); } }
      }
      await dragTo(b, R2.l + R2.s / 2 + (A.sk ? 0 : (rnd() - 0.5) * 8), R2.t + R2.s / 2 + (A.sk ? 0 : (rnd() - 0.5) * 8), 0);
      await sleep(700);
    }
    await until(() => { const j = H().job(); return !j || j.kind !== 'lattice'; }, 15000, 100);
  }
  // ── build 46 ── the warning stones: hold the side the stretch runs to, let go near each even place (a child's eye: a little off), "הציבו כאן"
  async function warn46() {
    const pad = q('.h42-pad');
    for (let k = 0; k < 10 && A.on; k++) {
      const j = H().job(); if (!j || j.kind !== 'warn' || j.s.done) break;
      await react(); const s = j.s, n = s.n, i = s.stones.length, goal = (s.len / (n + 1)) * (i + 1) + (A.sk ? 0 : (rnd() - 0.5) * s.len * 0.07);
      const T = globalThis.__T, hp = { x: 0, y: 0, z: 0 }; T.stages.heroXYZ(hp); const a = T.view && T.view.project ? null : null;
      // which side of the screen is +x: try the right half, watch the walk
      const W0 = innerWidth, H0 = innerHeight, id = ++pid; let side = A.side46 || 0.8;
      ev(pad, 'pointerdown', W0 * side, H0 * 0.6, id); const u0 = j.ref.u(); await sleep(250); if (j.ref.u() < u0 - 0.05) { ev(pad, 'pointerup', W0 * side, H0 * 0.6, id); side = side > 0.5 ? 0.2 : 0.8; A.side46 = side; const id2 = ++pid; ev(pad, 'pointerdown', W0 * side, H0 * 0.6, id2); await until(() => j.ref.u() >= goal, 12000, 30); ev(pad, 'pointerup', W0 * side, H0 * 0.6, id2); }
      else { A.side46 = side; await until(() => j.ref.u() >= goal, 12000, 30); ev(pad, 'pointerup', W0 * side, H0 * 0.6, id); }
      await sleep(250); const b = q('.h46-set'); if (b) { const c = mid(b), id3 = ++pid; ev(b, 'pointerdown', c.x, c.y, id3); ev(b, 'pointerup', c.x, c.y, id3); }
      await sleep(350); if (j.ref.J.state().done) { await sleep(1500); await shot('warn-result'); }
    }
    await until(() => { const j = H().job(); return !j || j.kind !== 'warn'; }, 15000, 100);
  }
  // ── build 46 ── the prostrations: the first bow (a slow swipe down), then with the procession now and then
  async function bows46() {
    const pad = q('.h42-pad');
    for (let k = 0; k < 40 && A.on; k++) {
      const j = H().job(); if (!j || j.kind !== 'bows') break;
      const M = j.ref.M; if (M.phase === 'bow' && M.at >= 2 && M.t > 0.5) await shot('bow');
      if (!M.first || (M.phase === 'bow' && M.t < 0.4 && rnd() < 0.5)) { const id = ++pid, x = innerWidth * 0.6, y0 = innerHeight * 0.35; ev(pad, 'pointerdown', x, y0, id); for (let i = 1; i <= 8; i++) { await sleep(80); ev(pad, 'pointermove', x, y0 + i * 12, id); } ev(pad, 'pointerup', x, y0 + 96, id); }
      await sleep(700);
    }
    await until(() => { const j = H().job(); return !j || j.kind !== 'bows'; }, 40000, 200);
  }
  // ── build 45 ── the line: a drag from the near pin to the far one (a child's hand wavers a little)
  async function line45() {
    const pad = q('.h42-pad');
    for (let k = 0; k < 4 && A.on; k++) {
      const j = H().job(); if (!j || j.kind !== 'line') break;
      await react(); const E = j.ref.ends(); if (!E) { await sleep(200); continue; }
      const id = ++pid, N = 14, w = A.sk ? 2 : 9, vx = E.b.x - E.a.x, vy = E.b.y - E.a.y, Ln = Math.hypot(vx, vy) || 1, nx = -vy / Ln, ny = vx / Ln, ph = rnd() * 6;
      ev(pad, 'pointerdown', E.a.x, E.a.y, id);
      for (let i = 1; i <= N; i++) { await sleep(A.sk ? 25 : 45); const t = i / N, d = Math.sin(t * Math.PI + ph) * w * Math.sin(t * Math.PI); ev(pad, 'pointermove', E.a.x + vx * t + nx * d, E.a.y + vy * t + ny * d, id); }
      ev(pad, 'pointerup', E.b.x, E.b.y, id); await sleep(400);
    }
  }
  // ── build 45 ── the pulley: pull down, hold a moment (the catch), let go; again — until the stone is in the window (a child: now and then lets go uncaught)
  async function pulley45() {
    const pad = q('.h42-pad');
    for (let k = 0; k < 40 && A.on; k++) {
      const j = H().job(); if (!j || j.kind !== 'pulley') break;
      const s = j.s, P = j.ref.J.P, aim = (P.win[0] + P.win[1]) / 2;
      if (s.y >= P.win[0] + 0.01) { await sleep(400); continue; }   // (in the window: rest — it stops there)
      await sleep(A.sk ? 120 : 200 + rnd() * 300);
      const r = pad.getBoundingClientRect(), x = r.left + r.width * 0.5, y0 = r.top + r.height * 0.35, want = Math.min(70, (aim - s.y) / P.gain + 14), id = ++pid;
      ev(pad, 'pointerdown', x, y0, id);
      for (let i = 1; i <= 5; i++) { await sleep(30); ev(pad, 'pointermove', x, y0 + (want * i) / 5, id); }
      if (A.sk || rnd() < 0.8) await sleep(380);   // (the catch)
      ev(pad, 'pointerup', x, y0 + want, id);
    }
  }
  // build 43: the corner stone — flicks of the crowbar along the stone's axis on the screen, each as long as the push it wants (a child's: ±)
  async function corner() {
    const pad = q('.h42-pad');
    for (let k = 0; k < 14 && A.on; k++) {
      const j = H().job(); if (!j || j.kind !== 'corner') break;
      if (!j.ref.ready()) { await sleep(200); continue; }
      await react(); const s = j.s, ax = j.ref.axis(); if (!ax) { await sleep(200); continue; }
      const dir = s.x < 0 ? 1 : -1, px0 = Math.abs(s.x) / j.ref.J.P.gain + 12, px = Math.max(30, Math.min(200, px0 * (A.sk ? 1 : 0.75 + rnd() * 0.55)));
      const ux = ax.ux * dir, uy = ax.uy * dir, id = ++pid;
      ev(pad, 'pointerdown', ax.x, ax.y, id); for (let i = 1; i <= 6; i++) { await sleep(25); ev(pad, 'pointermove', ax.x + (ux * px * i) / 6, ax.y + (uy * px * i) / 6, id); } ev(pad, 'pointerup', ax.x + ux * px, ax.y + uy * px, id);
      await sleep(350);
    }
  }
  async function roll() {
    for (let k = 0; k < 20 && A.on; k++) {
      const j = H().job(); if (!j || j.kind !== 'roll') break;
      const h = await until(() => { const jj = H().job(); return !jj || jj.kind !== 'roll' ? 'end' : jj.ref.handle(); }, 8000, 40); if (!h || h === 'end') break;
      await react(); const it = [...document.querySelectorAll('.h42 .h42-it')].find((b) => !b.hidden && b.textContent.includes('⟳')); if (!it) continue;
      const r = it.getBoundingClientRect(); await dragTo(it, r.left + r.width / 2 + 160, r.top + r.height / 2 - 10, 0);
      await sleep(150);
    }
  }
  async function pave() {
    for (let k = 0; k < 20 && A.on; k++) {
      const j = H().job(); if (!j || j.kind !== 'pave') break;
      await react(); const s = j.s, left = s.left[s.row];
      const fit = [1, 2, 3].filter((n) => n <= left), n = rnd() < (A.sk ? 0.98 : 0.85) ? Math.max(...fit) : [1, 2, 3][Math.floor(rnd() * 3)];
      const item = [...document.querySelectorAll('.h42-pile .h42-it')].find((b) => b.textContent.trim().endsWith(String(n))); const B = j.ref.box(); if (!item || !B) { await sleep(200); continue; }
      await dragTo(item, (B.l + B.r) / 2, (B.t + B.b) / 2, 0); await sleep(200);
    }
  }
  async function trace() {
    const pad = q('.h42-pad');
    for (let k = 0; k < 3 && A.on; k++) {
      const j = H().job(); if (!j || j.kind !== 'trace') break;
      await react(); const P = j.ref.dots(); if (!P) { await sleep(200); continue; }
      const id = ++pid; ev(pad, 'pointerdown', P[0].x + 12, P[0].y, id); await sleep(40);
      for (const p of P) { for (let i = 0; i < 3; i++) { await sleep(A.sk ? 20 : 45); ev(pad, 'pointermove', p.x + (rnd() - 0.5) * (A.sk ? 6 : 16), p.y + (rnd() - 0.5) * (A.sk ? 6 : 16), id); } }
      ev(pad, 'pointerup', P[P.length - 1].x, P[P.length - 1].y, id); await sleep(500);
    }
  }
  async function loop() {
    const T0 = performance.now(); let last = '';
    for (;;) {
      if (!A.on) return;
      const h = H();
      if (!h || !h.on) {   // ── build 44 ── after stage 01: the vision (Phase B) — its shot, then "חזרה להר"; then the test (a new stage director) — until it is passed
        const V = globalThis.__SHIFT && globalThis.__SHIFT.vision;
        if (V && !V.ended) { if (!A.visionT) { A.visionT = performance.now(); note('vision'); A.times.vision = Math.round((performance.now() - T0) / 100) / 10; } if (performance.now() - A.visionT > 3500) await shot('vision'); if (performance.now() - A.visionT > 9000) { const b = q('.v44-skip'); if (b && !b.hidden) { b.click(); note('vision skipped'); } } await sleep(400); continue; }
        if (h && !h.on && h.state().mode === 'test' && h.state().test && h.state().test.passed) return;
        if (!A.waitOff) A.waitOff = performance.now(); if (performance.now() - A.waitOff > (A.opts.after ? 90000 : 1500)) return;
        await sleep(300); continue;
      }
      A.waitOff = 0;
      const s = h.state();
      if (s.mode !== 'stage' && !A['m' + s.mode]) { A['m' + s.mode] = 1; note(`mode ${s.mode}`); A.times[s.mode] = Math.round((performance.now() - T0) / 100) / 10; }
      if (q('.h44-yard')) { await sleep(A.sk ? 600 : 1500); await shot('yard'); A.yardSeen = 1; const b = q('.h44-yard [data-b="back"]'); if (b) b.click(); await sleep(500); continue; }   // (build 44: the yard — its shot, back to the test)
      if (s.part !== last) { last = s.part; A.times[s.part] = Math.round((performance.now() - T0) / 100) / 10; note(`part ${s.part}`); }
      if (s.card) {
        await sleep(A.sk ? 300 : 1200);
        const t = (q('.h42-card h2') || {}).textContent || '';
        await shot(s.mode === 'test' ? (/מבחן אומן/.test(t) ? 'test-card' : /חותם/.test(t) ? 'seal' : /עברתם את/.test(t) ? 'test-end' : 'test-' + (A.tc = (A.tc | 0) + 1)) : 'card');
        const alt = q('.h42-card [data-b="alt"]'); if (alt && A.opts.after && !A.yardSeen && /חצר/.test(alt.textContent)) { alt.click(); await sleep(500); continue; }   // (build 44: the yard visited once on the way to the test)
        const b = q('.h42-card button'); if (b) b.click(); await sleep(400); continue;
      }
      if (s.part === 'reveal') { await sleep(1500); await shot('reveal'); await until(() => { const r = H().state(); return r.part !== 'reveal' || r.rev >= 9; }, 30000, 50); if (H().state().part === 'reveal') await shot('reveal-end'); continue; }   // (build 43: the reveal's end — the whole platform from the opening's viewpoint)
      if (s.part === 'open') { if (!A.openT) A.openT = performance.now(); await shot('open'); if (performance.now() - A.openT > 6000) await shot('open-plan'); await sleep(400);   // (build 45: and a later frame of the opening — the plan risen)
        if (A.sk) { const b = q('.h42-skip'); if (b) ev(b, 'pointerdown', 10, 10, ++pid); } continue; }
      if (s.part === 'done' || s.part === 'out') { await sleep(500); if (!q('.h42-card')) return; continue; }
      if (s.pending || s.part === 'rope') { await shot('walk-' + s.part); await walk(); await sleep(150); continue; }
      const j = h.job(); if (!j) { await sleep(150); continue; }
      await sleep(400); if (A.opts.shot && !A.shots['act-' + j.kind]) await sleep(2600);   /* (the act's shot once the camera has settled on the act's frame) */
      await shot((s.mode === 'test' ? 'test-act-' : 'act-') + (/^(giant|wcorner|top|lattice\d)$/.test(s.part) ? s.part : j.kind));   // (build 45: the wall's giant, corner course and top course each its own shot)
      if (j.kind === 'lift') await lift(); else if (j.kind === 'line') await line45(); else if (j.kind === 'pulley') await pulley45(); else if (j.kind === 'corner') await corner(); else if (j.kind === 'lattice') await lattice46(); else if (j.kind === 'warn') await warn46(); else if (j.kind === 'bows') await bows46(); else if (j.kind === 'rock') await rock(); else if (j.kind === 'course') await course(); else if (j.kind === 'roll') await roll(); else if (j.kind === 'pave') await pave(); else if (j.kind === 'trace') await trace();
      await sleep(200);
    }
  }
  globalThis.__AUTO42 = {
    start(o = {}) { A.opts = o; A.sk = !!o.skilled; a = (o.seed | 0) || 7; A.on = true; A.notes = []; A.times = {}; return loop().then(() => ({ grades: H() ? H().save().grades : [], times: A.times, notes: A.notes })).catch((e) => ({ err: String(e && e.message), grades: H() ? H().save().grades : [], times: A.times, notes: A.notes })); },
    stop() { A.on = false; }, state: () => ({ on: A.on, times: A.times, notes: A.notes.slice(-20) }),
  };
})();
