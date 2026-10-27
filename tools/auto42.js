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
    for (let k = 0; k < 10 && A.on; k++) {
      const j = H().job(); if (!j || j.kind !== 'course' || j.s.done) break;
      await react(); const s = j.s, sp = j.ref.spec, left = sp.b - s.at;
      // a length that fits; a child avoids the red joints most of the time
      let opts = [2, 3, 4].filter((n) => n <= left); if (!opts.length) break;
      const good = opts.filter((n) => n === left || !sp.below.some((jn) => Math.abs(jn - (s.at + n)) < 1e-6) && (left - n === 0 || left - n >= 2));
      const n = good.length && rnd() < (A.sk ? 0.97 : 0.75) ? good[Math.floor(rnd() * good.length)] : opts[Math.floor(rnd() * opts.length)];
      const item = [...document.querySelectorAll('.h42-pile .h42-it')].find((b) => b.textContent.trim().endsWith(String(n))); const B = j.ref.slot(); if (!item || !B) { await sleep(200); continue; }
      await dragTo(item, (B.l + B.r) / 2, (B.t + B.b) / 2, A.sk ? 600 : rnd() < 0.15 ? 250 : 700);
      await sleep(250);
    }
    await until(() => { const j = H().job(); return !j || j.kind !== 'course'; }, 20000, 100);
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
      const h = H(); if (!h || !h.on) { await sleep(300); if (h && !h.on) return; continue; }
      const s = h.state();
      if (s.part !== last) { last = s.part; A.times[s.part] = Math.round((performance.now() - T0) / 100) / 10; note(`part ${s.part}`); }
      if (s.card) { await sleep(A.sk ? 300 : 1200); await shot('card'); const b = q('.h42-card button'); if (b) b.click(); await sleep(400); continue; }
      if (s.part === 'reveal') { await sleep(3200); await shot('reveal'); await sleep(500); continue; }
      if (s.part === 'open') { await shot('open'); await sleep(400); if (A.sk) { const b = q('.h42-skip'); if (b) ev(b, 'pointerdown', 10, 10, ++pid); } continue; }
      if (s.part === 'done' || s.part === 'out') { await sleep(500); if (!q('.h42-card')) return; continue; }
      if (s.pending || s.part === 'rope') { await shot('walk-' + s.part); await walk(); await sleep(150); continue; }
      const j = h.job(); if (!j) { await sleep(150); continue; }
      await sleep(400); if (A.opts.shot && !A.shots['act-' + j.kind]) await sleep(2600);   /* (the act's shot once the camera has settled on the act's frame) */
      await shot('act-' + j.kind);
      if (j.kind === 'lift') await lift(); else if (j.kind === 'rock') await rock(); else if (j.kind === 'course') await course(); else if (j.kind === 'roll') await roll(); else if (j.kind === 'pave') await pave(); else if (j.kind === 'trace') await trace();
      await sleep(200);
    }
  }
  globalThis.__AUTO42 = {
    start(o = {}) { A.opts = o; A.sk = !!o.skilled; a = (o.seed | 0) || 7; A.on = true; A.notes = []; A.times = {}; return loop().then(() => ({ grades: H() ? H().save().grades : [], times: A.times, notes: A.notes })).catch((e) => ({ err: String(e && e.message), grades: H() ? H().save().grades : [], times: A.times, notes: A.notes })); },
    stop() { A.on = false; }, state: () => ({ on: A.on, times: A.times, notes: A.notes.slice(-20) }),
  };
})();
