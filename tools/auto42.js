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
  // ── build 48 ── the wood: turn each face, peel where it may hide, then the pile (a child: now and then the wrong one)
  async function wood48(j0) {
    const pad = q('.h42-pad'), W0 = innerWidth, H0 = innerHeight;
    const swipe = async (x, y, dx, dy, n = 6) => { const id = ++pid; ev(pad, 'pointerdown', x, y, id); for (let i = 1; i <= n; i++) { await sleep(25); ev(pad, 'pointermove', x + (dx * i) / n, y + (dy * i) / n, id); } ev(pad, 'pointerup', x + dx, y + dy, id); await sleep(260); };
    for (let k = 0; k < 40 && A.on; k++) {
      const j = H().job(); if (!j || j.kind !== 'wood') break; const J = j.ref.J; if (!J) { await sleep(400); continue; }
      const s = J.state(); if (s.decided) { await sleep(500); continue; }
      const G = j.ref.geo(), cx = G.x + G.w / 2, cy = G.y + G.h / 2;
      if (A.wl !== J) { A.wl = J; await shot('act-wood'); for (let f = 0; f < 4; f++) { await swipe(cx - G.w * 0.3, cy, G.w * 0.6, 0); if (s.type === 'gallery' && s.at.face === s.face && !A.galShot) { A.galShot = 1; await sleep(300); await shot('wood-gallery'); } if (J.visible() && s.at.face === s.face && s.at.face >= 0) { const id = ++pid, mx = G.x + s.at.u * G.w; ev(pad, 'pointerdown', mx, cy, id); ev(pad, 'pointerup', mx, cy, id); await sleep(200); } await swipe(cx, cy + 20, 0, -60); } }
      const right = !s.bad, toAltar = A.sk || rnd() > 0.15 ? right : !right, Z = j.ref.zones(), z = toAltar ? Z.altar : Z.out;
      await swipe(cx, cy, z.x + z.w / 2 - cx, z.y + z.h / 2 - cy, 10); await sleep(2900);
    }
    await until(() => { const j = H().job(); return !j || j.kind !== 'wood'; }, 15000, 100);
  }
  // ── build 48 ── the gallery's beams: the corner ones first (a child: once in a while a next one first), each pushed in nearly straight
  async function beams48(jr) {
    const pad = q('.h42-pad');
    for (let k = 0; k < 30 && A.on; k++) {
      let j = H().job(); if (!j) break; if (j.kind === 'corner48') { const sb = j.ref.sub(); if (!sb || sb.kind !== 'beams') break; j = { ref: sb, s: sb.J.state() }; } else if (j.kind !== 'beams') break;
      const G = j.ref.J, s = G.state(); if (s.done) { await sleep(400); continue; }
      const cur = j.ref.cur();
      if (cur >= 0) { if (!A.beamShot) { A.beamShot = 1; await shot('beam-push'); } const p1 = j.ref.sockAt(cur), p0 = p1 ? { x: p1.x, y: p1.y + 80 } : null; if (p0 && p1) { const err = (A.sk ? 0.2 : 0.4 + rnd() * 0.9) * s.tol * Math.PI / 180 * (rnd() < 0.5 ? -1 : 1), vx = 0, vy = -80, c = Math.cos(err), sn = Math.sin(err), dx = (vx * c - vy * sn), dy = (vx * sn + vy * c), id = ++pid, L2 = Math.max(40, Math.hypot(dx, dy)), ux = dx / Math.hypot(dx, dy) * L2, uy = dy / Math.hypot(dx, dy) * L2; ev(pad, 'pointerdown', p0.x, p0.y, id); for (let i = 1; i <= 6; i++) { await sleep(30); ev(pad, 'pointermove', p0.x + (ux * i) / 6, p0.y + (uy * i) / 6, id); } ev(pad, 'pointerup', p0.x + ux, p0.y + uy, id); } await sleep(700); continue; }
      const free = s.kinds.map((t, i) => [t, i]).filter(([t, i]) => !s.set[i]); const corners = free.filter(([t]) => t === 'corner'), pick = corners.length && (A.sk || rnd() > 0.15) ? corners[0] : free[Math.floor(rnd() * free.length)];
      if (!pick) { await sleep(300); continue; } const chip = j.ref.chips.find((b) => b.dataset.kind === pick[0] && b.style.display !== 'none'); const P2 = j.ref.sockAt(pick[1]); if (chip && P2) await dragTo(chip, P2.x, P2.y, 0); await sleep(500);
    }
  }
  // ── build 48 ── tenon and peg: slide along the arrow; tap until it locks, then stop (a child: now and then one tap too many)
  async function pegs48() {
    const pad = q('.h42-pad');
    for (let k = 0; k < 60 && A.on; k++) {
      let j = H().job(); if (!j) break; if (j.kind === 'corner48') { const sb = j.ref.sub(); if (!sb || sb.kind !== 'pegs') { if (j.ref.phase() === 'planks') { await planks48(j); continue; } break; } j = { ref: sb }; } else if (j.kind !== 'pegs') break;
      const P = j.ref.P, s = P.state(); if (s.done) { await sleep(300); continue; }
      if (!s.tenon) { const Ar = j.ref.arrow(), id = ++pid, dx = Ar.x1 - Ar.x0, dy = (A.sk ? 0 : (rnd() - 0.5) * 30); ev(pad, 'pointerdown', Ar.x0, Ar.y0, id); for (let i = 1; i <= 6; i++) { await sleep(30); ev(pad, 'pointermove', Ar.x0 + (dx * i) / 6, Ar.y0 + (dy * i) / 6, id); } ev(pad, 'pointerup', Ar.x0 + dx, Ar.y0 + dy, id); await sleep(500); continue; }
      if (s.locked) { if (!A.pegShot) { A.pegShot = 1; await shot('peg-lock'); } if (!A.sk && rnd() < 0.08) { const id = ++pid; ev(pad, 'pointerdown', innerWidth * 0.5, innerHeight * 0.5, id); ev(pad, 'pointerup', innerWidth * 0.5, innerHeight * 0.5, id); } await sleep(1500); continue; }
      const id = ++pid; ev(pad, 'pointerdown', innerWidth * 0.5, innerHeight * 0.5, id); ev(pad, 'pointerup', innerWidth * 0.5, innerHeight * 0.5, id); await sleep(380);
    }
  }
  async function planks48(j) {
    const b = q('.h48-plank'); if (!b) { await sleep(300); return; } const T = globalThis.__T; const W2 = { x: 59.5, z: 67.5 };
    const p = j.ref && document.querySelector('.h42 svg line'); const x = p ? (+p.getAttribute('x1') + +p.getAttribute('x2')) / 2 : innerWidth / 2, y = p ? (+p.getAttribute('y1') + +p.getAttribute('y2')) / 2 : innerHeight / 2;
    await dragTo(b, x, y, 0); await sleep(500);
  }
  async function walk48() {
    const pad = q('.h42-pad'), id = ++pid; ev(pad, 'pointerdown', innerWidth * 0.5, innerHeight * 0.6, id); let shotT = 0;
    await until(() => { const j = H().job(); if (j && j.kind === 'walk48' && !shotT && j.ref.x() > 55) { shotT = 1; shot('walk48'); } return !j || j.kind !== 'walk48'; }, 25000, 200);
    ev(pad, 'pointerup', innerWidth * 0.5, innerHeight * 0.6, id);
  }
  async function corner48() {
    for (let k = 0; k < 10 && A.on; k++) { const j = H().job(); if (!j || j.kind !== 'corner48') break; const ph = j.ref.phase(); if (ph === 'beams') await beams48(); else if (ph === 'planks') await planks48(j); else await pegs48(); await sleep(300); }
    await until(() => { const j = H().job(); return !j || j.kind !== 'corner48'; }, 15000, 100);
  }
  // ── build 47 ── the lintel / the heavy leaf on two cranes: hold, and slide against the bubble (a child: late and rough); at the top, the set:
  // a drag toward the posts' middle
  async function lift47(j) {
    const pad = q('.h42-pad'), W0 = innerWidth, H0 = innerHeight, J = j.ref.J && j.ref.J.state && j.ref.J.state().phase !== undefined && j.ref.kind === 'lintel' ? j.ref.J : j.ref.LJ;
    if (!J) return; const id = ++pid, x0 = W0 * 0.55, y0 = H0 * 0.6; let x = x0;
    ev(pad, 'pointerdown', x0, y0, id);
    for (let i = 0; i < 900 && A.on; i++) {
      const s = J.state(); if (s.phase !== 'lift') break;
      const bias = s.drift + s.sway * Math.sin(s.swayW * s.t + s.ph), want = Math.max(-1, Math.min(1, -s.tilt * (A.sk ? 2.2 : 1.4) - bias * (A.sk ? 1 : 0.8) + (A.sk ? 0 : (rnd() - 0.5) * 0.25)));
      x = x0 - want * W0 * 0.22; ev(pad, 'pointermove', x, y0, id); await sleep(A.sk ? 50 : 90);
    }
    ev(pad, 'pointerup', x, y0, id); await sleep(300);
    if (j.ref.kind !== 'lintel') return;
    await shot('lintel-top');
    for (let k = 0; k < 6 && A.on; k++) {
      const s = J.state(); if (s.done) break;
      // the lintel's offset on the screen: from the director's own projection of the posts' middle and the lintel
      const ppa = j.ref.ppa ? j.ref.ppa() : 20, fine = (globalThis.__F47 && globalThis.__F47.fine) || 1, px = (-s.dx * ppa / fine) * (A.sk ? 1 : 0.85 + rnd() * 0.3);
      const id2 = ++pid, xs = W0 * 0.5, ys = H0 * 0.55; ev(pad, 'pointerdown', xs, ys, id2); for (let i = 1; i <= 8; i++) { await sleep(30); ev(pad, 'pointermove', xs + (px * i) / 8, ys, id2); } ev(pad, 'pointerup', xs + px, ys, id2); await sleep(900);
    }
  }
  async function leaf47() {
    const pad = q('.h42-pad');
    for (let k = 0; k < 30 && A.on; k++) {
      const j = H().job(); if (!j || j.kind !== 'leaf') break; const ph = j.ref.phase();
      if (ph === 'lift') { await lift47(j); await sleep(400); continue; }
      const s = j.s; if (s.done) { await sleep(300); continue; }
      const W0 = innerWidth, H0 = innerHeight, id = ++pid;
      if (ph === 'pin') { const a = (A.sk ? 0.3 : 0.5 + rnd()) * s.tol * Math.PI / 180 * (rnd() < 0.5 ? -1 : 1), L2 = 120, dx = Math.sin(a) * L2, dy = Math.cos(a) * L2, xs = W0 * 0.5, ys = H0 * 0.35; ev(pad, 'pointerdown', xs, ys, id); for (let i = 1; i <= 8; i++) { await sleep(40); ev(pad, 'pointermove', xs + (dx * i) / 8, ys + (dy * i) / 8, id); } ev(pad, 'pointerup', xs + dx, ys + dy, id); await sleep(900); continue; }
      if (ph === 'swing') {
        if (s.bound) { const b = j.ref.wedgeB; if (b && !b.hidden) { const c = mid(b), id3 = ++pid; ev(b, 'pointerdown', c.x, c.y, id3); ev(b, 'pointerup', c.x, c.y, id3); } await sleep(800); continue; }
        await shot('leaf-swing');
        const xs = W0 * 0.35, ys = H0 * 0.55, dist = 150, steps = A.sk ? 6 : 5 + Math.floor(rnd() * 4); ev(pad, 'pointerdown', xs, ys, id); for (let i = 1; i <= steps; i++) { await sleep(28); ev(pad, 'pointermove', xs + (dist * i) / steps, ys, id); } ev(pad, 'pointerup', xs + dist, ys, id); await sleep(3200);
      }
    }
    await until(() => { const j = H().job(); return !j || j.kind !== 'leaf'; }, 15000, 100);
  }
  async function names47() {
    for (let k = 0; k < 20 && A.on; k++) {
      const j = H().job(); if (!j || j.kind !== 'names' || j.ref.N.state().done) break;
      const c = j.ref.N.current(); if (!c) break; const G7 = (globalThis.__F47 && globalThis.__F47.gates) || [];
      const tgt = !A.sk && rnd() < 0.12 ? G7.find((g) => g.id !== c.id && !j.ref.N.state().set.includes(g.id)) || c : c;
      const p = j.ref.at(tgt); if (!p) { await sleep(300); continue; }
      await dragTo(j.ref.chip, p.x, p.y, 0); await sleep(1100);
    }
    await until(() => { const j = H().job(); return !j || j.kind !== 'names'; }, 15000, 100);
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
      // ── build 53 ── the freed roller is a thing in the world (no ⟳ button): a drag from where it lies, on the act's surface ── /build 53 ──
      await react(); const pad = q('.h42-pad'), id = ++pid, x0 = h.x, y0 = h.y;
      ev(pad, 'pointerdown', x0, y0, id); for (let i = 1; i <= 6; i++) { await sleep(25); ev(pad, 'pointermove', x0 + i * 26, y0 - i * 2, id); } ev(pad, 'pointerup', x0 + 156, y0 - 12, id);
      await sleep(250);
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
  // ── build 49 ── stage 06: the VOYAGE (the crane's pulls, the deck held, the storm with two thumbs — a child's balance late and rough —, Acre's
  // door held up), the LEVER (long drags down, a tap at the top), the HANG (as the gates' leaf), the STEPS (the chip to the gold arc)
  async function voyage49() {
    const j0 = H().job(); if (!j0 || j0.kind !== 'voyage') return; const V = j0.ref, ui = V.ui; if (!ui) return;
    const W0 = innerWidth, H0 = innerHeight; let L = null, R = null, held = null, lx = W0 * 0.18;
    const live = () => { const j = H().job(); return j && j.kind === 'voyage' && j.ref === V; };
    for (let k = 0; k < 20000 && A.on && live(); k++) {
      const sc = V.scene();
      if (sc !== 'storm' && sc !== 'hug') { if (L) { ev(ui, 'pointerup', lx, H0 * 0.62, L); L = null; } if (R) { ev(ui, 'pointerup', W0 * 0.82, H0 * 0.62, R); R = null; } }
      if (sc === 'harbour') {
        const P = V.pulley(); if (!P) { await sleep(200); continue; } const s = P.state(), Pp = P.P, aim = (Pp.win[0] + Pp.win[1]) / 2;
        if (s.done || s.y >= Pp.win[0] + 0.01) { if (s.y > 0.4) await shot('voy-harbour'); await sleep(400); continue; }
        await sleep(A.sk ? 120 : 200 + rnd() * 300);
        const x = W0 * 0.5, y0 = H0 * 0.3, want = Math.min(70, (aim - s.y) / Pp.gain + 14), id = ++pid;
        ev(ui, 'pointerdown', x, y0, id); for (let i = 1; i <= 5; i++) { await sleep(30); ev(ui, 'pointermove', x, y0 + (want * i) / 5, id); }
        if (A.sk || rnd() < 0.8) await sleep(380); ev(ui, 'pointerup', x, y0 + want, id); continue;
      }
      if (sc === 'sea' || sc === 'acre') {
        if (!held) { held = ++pid; ev(ui, 'pointerdown', W0 * 0.5, H0 * 0.55, held); }
        if (sc === 'sea' && V.V.walk > 0.5) await shot('voy-sea'); if (sc === 'acre' && V.V.acreY > 0.55) await shot('voy-acre');
        await sleep(200); if (V.scene() !== sc) { ev(ui, 'pointerup', W0 * 0.5, H0 * 0.55, held); held = null; } continue;
      }
      if (held) { ev(ui, 'pointerup', W0 * 0.5, H0 * 0.55, held); held = null; }
      if (sc === 'storm' || sc === 'hug') {
        const S = V.storm(); if (!S) { await sleep(100); continue; } const s = S.state();
        if (!R) { R = ++pid; ev(ui, 'pointerdown', W0 * 0.82, H0 * 0.62, R); }
        if (!L) { L = ++pid; lx = W0 * 0.18; ev(ui, 'pointerdown', lx, H0 * 0.62, L); }
        const g = A.sk ? 1 : 0.8, want = Math.max(-1, Math.min(1, -(s.p * g) - s.h * (A.sk ? 0.5 : 0.35) + (A.sk ? 0 : (rnd() - 0.5) * 0.2)));
        lx = W0 * 0.18 + want * W0 * 0.16; ev(ui, 'pointermove', lx, H0 * 0.62, L);
        if (s.ph === 'push' && s.i >= 1 && !s.hug) await shot('voy-storm'); if (s.ph === 'throw' && s.t > 1.6) await shot('voy-throw'); if (s.hug && s.ph === 'push' && s.t > 0.8) await shot('voy-hug');
        await sleep(A.sk ? 50 : 110 + rnd() * 120); continue;
      }
      if (sc === 'road' && V.V.carT > 2.2) await shot('voy-road'); if (sc === 'calm') await shot('voy-calm');
      await sleep(250);
    }
    if (L) ev(ui, 'pointerup', lx, H0 * 0.62, L); if (R) ev(ui, 'pointerup', W0 * 0.82, H0 * 0.62, R); if (held) ev(ui, 'pointerup', W0 * 0.5, H0 * 0.55, held);
  }
  async function lever49() {
    const pad = q('.h42-pad');
    for (let k = 0; k < 60 && A.on; k++) {
      const j = H().job(); if (!j || j.kind !== 'lever49') break; const s = j.s; if (s.done) { await sleep(300); continue; }
      const W0 = innerWidth, H0 = innerHeight, id = ++pid;
      if (s.up) { await sleep(A.sk ? 150 : 250 + rnd() * (s.win * 700)); ev(pad, 'pointerdown', W0 * 0.5, H0 * 0.5, id); await sleep(60); ev(pad, 'pointerup', W0 * 0.5, H0 * 0.5, id); await sleep(400); continue; }
      const len = H0 * (A.sk ? 0.3 : 0.18 + rnd() * 0.2), x = W0 * 0.6, y0 = H0 * 0.25; ev(pad, 'pointerdown', x, y0, id); for (let i = 1; i <= 8; i++) { await sleep(35); ev(pad, 'pointermove', x, y0 + (len * i) / 8, id); } ev(pad, 'pointerup', x, y0 + len, id);
      await shot('lever'); await sleep(300);
    }
    await until(() => { const j = H().job(); return !j || j.kind !== 'lever49'; }, 15000, 100);
  }
  async function hang49() {
    const pad = q('.h42-pad');
    for (let k = 0; k < 30 && A.on; k++) {
      const j = H().job(); if (!j || j.kind !== 'hang49') break; const ph = j.ref.phase(), s = j.s; if (s.done) { await sleep(300); continue; }
      const W0 = innerWidth, H0 = innerHeight, id = ++pid;
      if (ph === 'pin') { const a = (A.sk ? 0.3 : 0.5 + rnd()) * s.tol * Math.PI / 180 * (rnd() < 0.5 ? -1 : 1), L2 = 120, dx = Math.sin(a) * L2, dy = Math.cos(a) * L2, xs = W0 * 0.5, ys = H0 * 0.35; ev(pad, 'pointerdown', xs, ys, id); for (let i = 1; i <= 8; i++) { await sleep(40); ev(pad, 'pointermove', xs + (dx * i) / 8, ys + (dy * i) / 8, id); } ev(pad, 'pointerup', xs + dx, ys + dy, id); await sleep(900); continue; }
      if (s.bound) { const b = j.ref.wedgeB; if (b && !b.hidden) { const c = mid(b), id3 = ++pid; ev(b, 'pointerdown', c.x, c.y, id3); ev(b, 'pointerup', c.x, c.y, id3); } await sleep(800); continue; }
      const xs = W0 * 0.35, ys = H0 * 0.55, dist = 150, steps = A.sk ? 6 : 5 + Math.floor(rnd() * 4); ev(pad, 'pointerdown', xs, ys, id); for (let i = 1; i <= steps; i++) { await sleep(28); ev(pad, 'pointermove', xs + (dist * i) / steps, ys, id); } ev(pad, 'pointerup', xs + dist, ys, id); await sleep(3200); await shot('hang-ungilded');
    }
    await until(() => { const j = H().job(); return !j || j.kind !== 'hang49'; }, 15000, 100);
  }
  async function steps49() {
    for (let k = 0; k < 80 && A.on; k++) {
      const j = H().job(); if (!j || j.kind !== 'steps49') break; const t = j.ref.target();
      if (!t) { await sleep(500); if (j.ref.J.state().done) { await sleep(2500); await shot('steps-levites'); await until(() => { const j2 = H().job(); return !j2 || j2.kind !== 'steps49'; }, 20000, 200); break; } continue; }
      const th = (rnd() - 0.5) * 2.2, p = t.at(th), q0 = t.at(-Math.PI / 2), q1 = t.at(Math.PI / 2), chip = j.ref.chip; if (!p || !chip) { await sleep(300); continue; }
      // a child's aim: off the line radially by a part of the band that rings true (now and then more)
      const jit = (A.sk ? 0.25 : 0.4 + rnd() * (rnd() < 0.15 ? 1.6 : 0.6)) * (rnd() < 0.5 ? -1 : 1), px = jit * 0.5 * j.ref.J.state().tol * 36, P2 = { x: p.x, y: p.y };
      if (q0 && q1) { const cx = (q0.x + q1.x) / 2, cy = (q0.y + q1.y) / 2, dx = P2.x - cx, dy = P2.y - cy, Lr = Math.hypot(dx, dy) || 1; P2.x += (dx / Lr) * px; P2.y += (dy / Lr) * px; }
      await dragTo(chip, P2.x, P2.y, 0); await sleep(A.sk ? 300 : 700 + rnd() * 600);
      if (k === 4) await shot('steps');
    }
  }
  // ── build 50 ── stage 07: the COMPASS (hold the centre, then round at the rope's radius — a child's hand wobbling), the BENCHES (the chip
  // to the arc), the HUB (a drag across to bring a slot up, the spoke in), the WHEEL (hold, let go before the red), the DOME (left, right,
  // left…, the keystone, then the taps)
  async function compass50() {
    const pad = q('.h42-pad'); const j = H().job(); if (!j || j.kind !== 'compass50') return; const c = j.ref.centre(); if (!c) { await sleep(300); return; }
    const id = ++pid; ev(pad, 'pointerdown', c.x, c.y, id); await until(() => { const jj = H().job(); return !jj || jj.kind !== 'compass50' || jj.ref.J.state().planted; }, 6000, 50);
    let th = (rnd() - 0.5) * 0.4; const wob = A.sk ? 0.03 : 0.07 + rnd() * 0.06;
    for (let i = 0; i < 200 && A.on; i++) { const jj = H().job(); if (!jj || jj.kind !== 'compass50' || jj.ref.J.state().done) break; const p = jj.ref.rimAt(th, 1 + (rnd() - 0.5) * 2 * wob); if (p) ev(pad, 'pointermove', p.x, p.y, id); if (i === 30) await shot('compass-arc'); th += 0.05; await sleep(A.sk ? 25 : 45); }
    ev(pad, 'pointerup', c.x, c.y, id); await until(() => { const jj = H().job(); return !jj || jj.kind !== 'compass50'; }, 8000, 100);
  }
  async function benches50() {
    for (let k = 0; k < 30 && A.on; k++) {
      const j = H().job(); if (!j || j.kind !== 'benches50') break; if (j.ref.J.state().done) { await sleep(400); continue; }
      const sp = j.ref.span, th = sp ? sp.m + (rnd() - 0.5) * 2 * sp.h * 0.85 : Math.PI * 0.15 + rnd() * Math.PI * 0.7, p = j.ref.at(th), c = j.ref.centre(); if (!p || !c) { await sleep(300); continue; }
      const jit = (A.sk ? 0.2 : 0.35 + rnd() * (rnd() < 0.15 ? 1.4 : 0.5)) * (rnd() < 0.5 ? -1 : 1) * 30, dx = p.x - c.x, dy = p.y - c.y, Lr = Math.hypot(dx, dy) || 1;
      await dragTo(j.ref.chip, p.x + (dx / Lr) * jit, p.y + (dy / Lr) * jit, 0); await sleep(A.sk ? 300 : 700 + rnd() * 500); if (k === 3) await shot('benches');
    }
  }
  async function hub50() {
    const pad = q('.h42-pad');
    for (let k = 0; k < 60 && A.on; k++) {
      const j = H().job(); if (!j || j.kind !== 'hub50') break; const J = j.ref.J, s = J.state(); if (s.done) { await sleep(400); continue; }
      const nb = J.nearest(); if (!nb) break;
      if (Math.abs(nb.err) > s.tol * (A.sk ? 0.4 : 0.7)) { const dx = (-nb.err / J.P.gain) * (A.sk ? 1 : 0.85 + rnd() * 0.3), id = ++pid, x0 = innerWidth * 0.5, y0 = innerHeight * 0.55; ev(pad, 'pointerdown', x0, y0, id); for (let i = 1; i <= 8; i++) { await sleep(30); ev(pad, 'pointermove', x0 + (dx * i) / 8, y0, id); } ev(pad, 'pointerup', x0 + dx, y0, id); await sleep(A.sk ? 150 : 400); continue; }
      const t = j.ref.top(); if (!t) { await sleep(300); continue; } await dragTo(j.ref.chip, t.x, t.y + 30, 0); await sleep(A.sk ? 250 : 600); if (k === 6) await shot('hub');
    }
    await until(() => { const j = H().job(); return !j || j.kind !== 'hub50'; }, 8000, 100);
  }
  async function wheel50() {
    const pad = q('.h42-pad'); let id = null; const x = innerWidth * 0.5, y = innerHeight * 0.55;
    for (let k = 0; k < 2000 && A.on; k++) {
      const j = H().job(); if (!j || j.kind !== 'wheel50') break; const s = j.ref.J.state(); if (s.done) break;
      const hi = s.spill * (A.sk ? 0.92 : 0.8 + rnd() * 0.3), lo = s.spill * 0.55;
      if (id && s.v > hi) { ev(pad, 'pointerup', x, y, id); id = null; } else if (!id && s.v < lo) { id = ++pid; ev(pad, 'pointerdown', x, y, id); }
      if (s.i === 1 && s.h > 0.5) await shot('wheel'); await sleep(A.sk ? 40 : 90);
    }
    if (id) ev(pad, 'pointerup', x, y, id);
    await until(() => { const j = H().job(); return !j || j.kind !== 'wheel50'; }, 8000, 100);
  }
  async function dome50() {
    let side = rnd() < 0.5 ? 'L' : 'R';
    for (let k = 0; k < 40 && A.on; k++) {
      const j = H().job(); if (!j || j.kind !== 'dome50') break; const J = j.ref.J, s = J.state();
      if (j.ref.phase() !== 'set') break;
      let sd = s.left >= s.n && s.right >= s.n ? 'K' : s.left > s.right ? 'R' : s.right > s.left ? 'L' : side;
      if (!A.sk && sd !== 'K' && rnd() < 0.15) sd = sd === 'L' ? 'R' : 'L';   // (a child: now and then the same side again — the centering tilts)
      const chip = j.ref.chips.find((b) => b.dataset.side === sd), p = j.ref.slot(j.ref.nextJ(sd)); if (!chip || !p) { await sleep(300); continue; }
      await dragTo(chip, p.x + (rnd() - 0.5) * 20, p.y + (rnd() - 0.5) * 20, 0); side = sd === 'L' ? 'R' : 'L'; await sleep(A.sk ? 300 : 650);
      if (k === 2) await shot('dome-inside');
    }
    const pad = q('.h42-pad');
    for (let k = 0; k < 12 && A.on; k++) { const j = H().job(); if (!j || j.kind !== 'dome50' || j.ref.phase() !== 'strike') break; const id = ++pid, x = innerWidth * (0.4 + rnd() * 0.2), y = innerHeight * 0.5; ev(pad, 'pointerdown', x, y, id); await sleep(70); ev(pad, 'pointerup', x, y, id); await sleep(A.sk ? 350 : 700); }
    await until(() => { const j = H().job(); return !j || j.kind !== 'dome50' || j.ref.phase() === 'held'; }, 12000, 100); await sleep(1500); await shot('dome-holds');
    await until(() => { const j = H().job(); return !j || j.kind !== 'dome50'; }, 12000, 100);
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
        await shot(s.mode === 'test' ? (/מבחן אומן/.test(t) ? 'test-card' : /חותם/.test(t) ? 'seal' : /עברתם את/.test(t) ? 'test-end' : 'test-' + (A.tc = (A.tc | 0) + 1)) : s.stg && s.stg !== 'har' ? `card-${s.stg}` : 'card');   // (build 46: each stage's card its own shot)
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
      await shot((s.mode === 'test' ? 'test-act-' : 'act-') + (/^(giant|wcorner|top|lattice\d|leaf7)$/.test(s.part) ? s.part : j.kind));   // (build 45: the wall's giant, corner course and top course each its own shot)
      if (j.kind === 'compass50') await compass50(); else if (j.kind === 'benches50') await benches50(); else if (j.kind === 'hub50') await hub50(); else if (j.kind === 'wheel50') await wheel50(); else if (j.kind === 'dome50') await dome50(); else if (j.kind === 'voyage') await voyage49(); else if (j.kind === 'lever49') await lever49(); else if (j.kind === 'hang49') await hang49(); else if (j.kind === 'steps49') await steps49(); else if (j.kind === 'lift') await lift(); else if (j.kind === 'line') await line45(); else if (j.kind === 'pulley') await pulley45(); else if (j.kind === 'corner') await corner(); else if (j.kind === 'lattice') await lattice46(); else if (j.kind === 'lintel') { await lift47(j); await until(() => { const j2 = H().job(); return !j2 || j2.kind !== 'lintel'; }, 15000, 100); } else if (j.kind === 'leaf') await leaf47(); else if (j.kind === 'names') await names47(); else if (j.kind === 'wood') await wood48(j); else if (j.kind === 'beams') { await beams48(); await until(() => { const j2 = H().job(); return !j2 || j2.kind !== 'beams'; }, 15000, 100); } else if (j.kind === 'pegs') { await pegs48(); await until(() => { const j2 = H().job(); return !j2 || j2.kind !== 'pegs'; }, 15000, 100); } else if (j.kind === 'corner48') await corner48(); else if (j.kind === 'walk48') await walk48(); else if (j.kind === 'warn') await warn46(); else if (j.kind === 'bows') await bows46(); else if (j.kind === 'rock') await rock(); else if (j.kind === 'course') await course(); else if (j.kind === 'roll') await roll(); else if (j.kind === 'pave') await pave(); else if (j.kind === 'trace') await trace();
      await sleep(200);
    }
  }
  globalThis.__AUTO42 = {
    start(o = {}) { A.opts = o; A.sk = !!o.skilled; a = (o.seed | 0) || 7; A.on = true; A.notes = []; A.times = {}; return loop().then(() => ({ grades: H() ? H().save().grades : [], times: A.times, notes: A.notes })).catch((e) => ({ err: String(e && e.message), grades: H() ? H().save().grades : [], times: A.times, notes: A.notes })); },
    stop() { A.on = false; }, state: () => ({ on: A.on, times: A.times, notes: A.notes.slice(-20) }),
  };
})();
