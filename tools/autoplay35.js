/* ── recovered (R9) ── autoplay35.js — the shift's autoplayer, in the page (tools/autoplay35-run.cjs injects it; or paste it in the console).
 * It plays the day of builds 16–26c through the engine's own surface (globalThis.__SHIFT.E: E.k20in, E.p23raise, E.d21swipe … E.r26pull),
 * walks by the stick along flow31's gold path (__F31.state().pts — the strong path he sees; when stuck, the shift's planned walk __S29W.to)
 * and taps the stations' timing acts on their gold moment (globalThis.__S29S.poke). The morning: the laver, the first lot and its task
 * (תרומת הדשן, סידור המערכה or the lamb), the second lot and his role in the Heichal (the gate, the menorah or the inner altar); then the day.
 *   __AUTO35.start({ human, seed, days }) → Promise<the morning's marks>   __AUTO35.state() · __AUTO35.stop()
 * human: a child's hand — slower to react, a swipe now and then too short or crooked, the pour released by eye (it misjudges sometimes), a
 * blemish missed once in a while, a pull too fast. Times are the engine's (E.st33.t: seconds since the day began), so a slow frame rate
 * does not change them. Never a Divine Name. */
(() => {
  if (globalThis.__AUTO35 && globalThis.__AUTO35.on) return;
  const A = { on: false, opts: {}, ev: [], marks: {}, phase: 'idle', err: null, acts: 0, walks: 0, stuck: 0, days: 0, notes: [], trace: [], lag: { n: 0, s: 0, max: 0 } };
  const E = () => (globalThis.__SHIFT && globalThis.__SHIFT.E) || null;
  const S = () => (globalThis.__T && globalThis.__T.stages) || null;
  const hp = { x: 0, y: 16, z: 0 };
  const hero = () => { try { S().heroXYZ(hp); } catch (e) { /* */ } return hp; };
  const T = () => { const e = E(); return e && e.st33 ? Math.round(e.st33.t * 100) / 100 : 0; };
  let seed = 1;
  const rnd = () => { seed = (seed + 0x6d2b79f5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const H = () => !!A.opts.human;
  const react = () => sleep(H() ? 350 + rnd() * 500 : 120 + rnd() * 160);   // (a child's reaction: 0.35–0.85 s; the quick hand: 0.12–0.28 s)
  const note = (s) => { A.notes.push([T(), s]); if (A.notes.length > 300) A.notes.shift(); };
  const mark = (k) => { if (A.marks[k] == null) A.marks[k] = T(); };
  async function until(f, ms = 20000, step = 50) { const t0 = performance.now(); for (;;) { if (!A.on) throw new Error('stopped'); let v = null; try { v = f(); } catch (e) { v = null; } if (v) return v; if (performance.now() - t0 > ms) return null; await sleep(step); } }
  const swipe = (fn, dx, dy) => { const bad = H() && rnd() < 0.12; return bad ? fn(rnd() < 0.5 ? 0.15 : dx, rnd() < 0.5 ? dx * 0.7 : dy, 120) : fn(dx, dy, 90 + rnd() * 60); };

  // ── the walk: as a player walks — by the stick along flow31's gold path (the strong path he sees, the House's floor in it), at the stick's
  // pace (walk.js PACE.stick 7 amot/s; the quick hand sprints ×1.5); a path that does not lead to the place → the shift's planned walk
  // (__S29W.to), and the last few amot straight
  const SPEED = (el) => (H() ? 7 : el < 0.6 ? 7 : 10.5);   // (the quick hand holds the stick on the rim: after 0.6 s the sprint, PACE.rim/rimAfter/sprint)
  function drive(vx, vz) { try { const h = S().hero, sm = h.speedMul > 0 ? h.speedMul : 1; h.drive(vx / sm, vz / sm); } catch (e) { /* */ } }
  async function walkTo(p, r = 1.6, ms = 40000) {
    if (!p) return false; A.walks++;
    const t0 = performance.now(); let win = null, tries = 0;
    for (;;) {
      if (!A.on) { drive(0, 0); return false; }
      const h = hero(), left = Math.hypot(p.x - h.x, p.z - h.z), t = T();
      if (left <= r) { drive(0, 0); return true; }
      const e = E(); if (e && busy(e) && A.walkBusy !== true && (e.k20() || e.p23() || e.p25() || (e.r26() && !['walk', 'out'].includes(e.r26().ph)) || (e.d21() && e.d21().ph !== 'foot') || (e.m22() && e.m22().ph !== 'carry'))) { drive(0, 0); return true; }   // (an act took him)
      let q = null; const pts = (globalThis.__F31 && globalThis.__F31.state && globalThis.__F31.state().pts) || null;
      if (pts && pts.length) { const last = pts[pts.length - 1]; if (Math.hypot(last[0] - p.x, last[1] - p.z) < 3.5) { for (const [x, z] of pts) if (Math.hypot(x - h.x, z - h.z) > 0.9) { q = { x, z }; break; } } }
      if (!q) q = p;
      const dx = q.x - h.x, dz = q.z - h.z, d = Math.hypot(dx, dz) || 1, v = Math.min(SPEED((performance.now() - t0) / 1000), Math.max(2, left * 2.5)) * (H() ? 0.92 + rnd() * 0.08 : 1);
      drive((dx / d) * v, (dz / d) * v);
      if (!(A.trW > t - 1)) { A.trW = t; A.trace.push([t, 'w', +h.x.toFixed(1), +h.z.toFixed(1), +q.x.toFixed(1), +q.z.toFixed(1), +left.toFixed(1), pts ? pts.length : 0]); if (A.trace.length > 400) A.trace.shift(); }   // (the run's log: the walk)
      // stuck: 2 s of the game's clock that brought him less than an amah nearer (a wall, a vessel's foot) — a step aside, then again;
      // the second time the shift's planned walk (__S29W.to: the court's floors and walls), and on
      if (!win || t < win.t) win = { t, left, x: h.x, z: h.z };
      else if (t - win.t >= 2) {
        if (win.left - left < 1 && Math.hypot(h.x - win.x, h.z - win.z) < 2.5) {
          A.stuck++; tries++; A.trace.push([t, 'stuck', +h.x.toFixed(1), +h.z.toFixed(1), +q.x.toFixed(1), +q.z.toFixed(1), +left.toFixed(1), tries]);
          if (tries % 2 === 1) { note(`stuck at ${h.x.toFixed(1)},${h.z.toFixed(1)} → a step aside`); const sd = tries % 4 === 1 ? 1 : -1; drive((-dz / d) * 5 * sd, (dx / d) * 5 * sd); await sleep(450); drive((-dx / d) * 4, (-dz / d) * 4); await sleep(250); }
          else { note(`stuck at ${h.x.toFixed(1)},${h.z.toFixed(1)} → the planned walk`); drive(0, 0); try { await globalThis.__S29W.to(p.x, p.z, r); } catch (err) { /* */ } }
        }
        win = { t: T(), left: Math.hypot(p.x - hero().x, p.z - hero().z), x: hero().x, z: hero().z };
      }
      if (performance.now() - t0 > ms) { drive(0, 0); note('walk: given up'); return false; }
      await sleep(H() ? 60 : 40);
    }
  }
  const busy = (e) => e.k20() || e.p23() || e.d21() || e.m22() || e.p25() || (e.r26() && e.r26().ph !== 'out');

  // ── the acts ──
  async function laver(e) {
    const K = e.k20(); if (!K || K.ph !== 'pose') return;
    await react(); e.k20in('L', true); await sleep(H() ? 120 + rnd() * 200 : 30); e.k20in('R', true);
    if (H() && rnd() < 0.3) { await sleep(900); e.k20in('R', false); await sleep(400); e.k20in('R', true); note('a hand lifted at the laver'); }
    await until(() => !e.k20() || e.k20().ph !== 'pose', 15000); e.k20in('L', false); e.k20in('R', false);
  }
  async function lot(e) {
    const K = e.p23(); if (!K) return;
    if ((K.ph === 'in' || K.ph === 'raise') && !K.raised) { await react(); e.p23raise(); }
    else if (K.ph === 'choose') { await react(); e.p23pick(K.cards.length > 1 ? Math.floor(rnd() * K.cards.length) : 0); }
    await sleep(80);
  }
  async function ashes(e) {
    const K = e.d21(); if (!K) return;
    if (K.ph === 'sweep') { await react(); swipe(e.d21swipe, 0.55 + rnd() * 0.2, 0.04); await sleep(H() ? 250 : 120); return; }
    if (K.ph === 'walk' || K.ph === 'desc') {
      // the balance (D21.bal): the shovel tips by the wind and the walk's shake; he counters by the tilt he sees and by how fast it goes
      // (the push he feels: the tilt's rate less his own counter), and slows down when it tips far (the shake grows with the pace)
      // (the page's timers come late when its frame is heavy: the gain is held to what the time between two looks allows, k·fix·Δt ≤ 0.5,
      // or the counter overshoots and the shovel rocks — then he slows and the descent takes seconds longer)
      const fix = 2.4, p = A.d21p, b = K.b + (H() ? (rnd() - 0.5) * 0.3 : 0), dT = p && K.T > p.T + 1e-3 ? K.T - p.T : 0;
      const push = dT ? (K.b - p.b) / dT - (p.u || 0) * fix : 0;
      const k0 = H() ? 2.2 + rnd() * 2 : 3.2, k = Math.min(k0, 0.5 / (fix * Math.max(0.03, dT || 0.05))), ff = dT > 0.12 ? 0 : H() ? 0.4 : 0.9;   // (a child corrects late and less)
      const u = Math.max(-1, Math.min(1, -b * k - (ff * push) / fix));
      if (dT) { A.lag.n++; A.lag.s += dT; A.lag.max = Math.max(A.lag.max, dT); }
      e.d21bal(u); A.d21p = { T: K.T, b: K.b, u };
      const sy = H() ? (Math.abs(K.b) > 0.55 ? 0.5 : 0.75 + rnd() * 0.25) : Math.abs(K.b) > 0.4 ? 0.55 : 1; e.d21stick(sy);
      if (!(A.trT > K.T - 0.25)) { A.trT = K.T; A.trace.push([T(), K.ph[0], +K.b.toFixed(2), +(K.v || 0).toFixed(1), +u.toFixed(2), sy]); if (A.trace.length > 400) A.trace.shift(); }   // (the run's log: the walk's balance)
      await sleep(H() ? 90 : 50); return;
    }
    if (K.ph === 'foot') { if (!K.near) await walkTo({ x: -28, z: 34.7 } /* D21.go[2]: the gold ring by the heap */, 1.2); else { await react(); e.d21tap(); } await sleep(80); return; }
    await sleep(60);
  }
  async function pyre(e) {
    const K = e.m22(); if (!K) return;
    if (K.ph === 'sort' && K.ls === 'on') { await react(); const wrong = H() && rnd() < 0.08; const take = wrong ? !K.cur.ok : K.cur.ok; swipe(e.m22swipe, take ? 0.5 : -0.5, 0.02); await sleep(60); return; }
    if (K.ph === 'carry') { await walkTo({ x: -28.6, z: 1.6 } /* M22.stand, on the altar's top */, 2.4); await sleep(100); return; }
    if (K.ph === 'stack') {
      if (!(K.hold >= 0)) { await sleep(80); return; }
      const band = e.band22(), mid = (band[0] + band[1]) / 2, aim = mid + (H() ? (rnd() - 0.5) * (band[1] - band[0]) * 1.4 : 0);
      if (K.pv == null) { await react(); e.m22put(); await sleep(150); return; }
      const d = aim - K.pv; if (Math.abs(d) > (H() ? 0.04 : 0.015)) { e.m22stick(Math.max(-1, Math.min(1, (K.gl >= 0 ? 1 : -1) * Math.sign(d) * Math.min(1, Math.abs(d) * 8)))); await sleep(40); return; }
      e.m22stick(0); await react(); e.m22put(); await sleep(150); return;
    }
    if (K.ph === 'ready') { await react(); e.m22tap(); await sleep(200); return; }
    await sleep(80);
  }
  async function lamb(e) {
    const K = e.p25(); if (!K) return;
    if (K.ph === 'scan') {
      const spots = (K.L && K.L.spots) || [], next = spots.find((s) => !s.seen && !s.gone && !(H() && rnd() < 0.06));
      if (next) { await react(); e.p25focus(next.i); await sleep(H() ? 200 : 60); e.p25tap(); await sleep(100); return; }
      const blem = spots.some((s) => s.kind === 'blem' && s.seen), dirt = spots.some((s) => s.kind === 'dirt' && !s.gone);
      await react(); const say = blem || (dirt && H() && rnd() < 0.3) ? 'pasul' : 'tamim';
      if (!e.p25stamp(say)) e.p25stamp('tamim'); await sleep(200); return;
    }
    if (K.ph === 'dirt') { await react(); swipe(e.p25swipe, 0.5, 0.02); await sleep(120); return; }
    if (K.ph === 'blem') { await sleep(H() ? 500 : 150); e.p25tap(); await sleep(100); return; }
    if (K.ph === 'wait') { await react(); e.p25tap(); await sleep(150); return; }
    await sleep(80);
  }
  async function heichal(e) {
    const K = e.r26(); if (!K) return;
    const ph = K.ph;
    if (ph === 'bolt') { await react(); swipe(e.r26swipe, 0.55, 0.03); await sleep(120); return; }
    if (ph === 'key') { if (!K.held) { await react(); e.r26hold(true); } await sleep(60); return; }
    if (ph === 'open' || ph === 'walk') { if (K.held) e.r26hold(false); if (ph === 'walk') { const f = e.flowNext(); if (f && f.at) await walkTo(f.at, 2.4); } await sleep(80); return; }
    if (ph === 'wick') { if (A.lamp !== K.li) { A.lamp = K.li; if (K.li > 0) await sleep(H() ? 600 : 300); }   // (the eye goes to the next lamp with the camera)
      await react(); swipe(e.r26swipe, 0.02, -0.5); await sleep(120); return; }
    if (ph === 'wipe') { await react(); swipe(e.r26swipe, 0.5, 0.02); await sleep(120); return; }
    if (ph === 'pour') {
      // released by eye on the game's clock: when the next look would pass the mark by more than this one falls short of it (the page's
      // timers come late; a child's mark is rougher and his hand a little late — he misjudges sometimes)
      if (!K.held) { await react(); A.want = H() ? 0.86 + rnd() * 0.14 + rnd() * rnd() * 0.08 : 0.93 + rnd() * 0.04; A.pp = null; e.r26hold(true); await sleep(30); return; }
      const f = K.fill, p = A.pp, step = p != null && f > p ? f - p : 0, want = A.want || 0.95; A.pp = f;
      if (f >= want || (step > 0 && f + step - want > want - f)) { e.r26hold(false); A.pp = null; await sleep(80); }
      else await sleep(10);
      return;
    }
    if (ph === 'new' || ph === 'kuz') { await react(); e.r26tap(); await sleep(150); return; }
    if (ph === 'drag') { await react(); e.r26light(); await sleep(150); return; }
    if (ph === 'pull') { await sleep(H() ? 450 + rnd() * 400 : 200); e.r26pull(H() && rnd() < 0.15 ? 2.8 : 1.4 + rnd() * 0.5); return; }
    if (ph === 'out') { await walkTo({ x: -50, z: 0 }, 3); return; }
    await sleep(80);
  }
  // ── the day: the next place, its act (a timing act tapped on the gold moment), the logs laid one a tap ──
  async function day(e) {
    const h = hero(), w = e.work(h);
    if (w && w.near31 && typeof w.go === 'function' && !e.st33.acting) { await react(); try { w.go(); } catch (err) { /* */ } A.acts++; await sleep(150); return; }
    if (w && w.job === 'sh:lay') { await react(); w.go(); await sleep(150); return; }
    const f = e.flowNext(); if (f && f.at) { await walkTo(f.at, 1.8); return; }
    await sleep(200);
  }
  async function timing() {
    const ss = globalThis.__S29S; if (!ss || !ss.busy) return false;
    const s = ss.state(); if (!s || s.phase !== 'act') return !!s;
    if (s.sw) { const err = H() ? (rnd() - 0.5) * 0.3 : (rnd() - 0.5) * 0.06; if (Math.abs(s.sw.toGold - err) < 0.03) { ss.poke('auto'); await sleep(120); } else await sleep(10); return true; }
    if (s.verb === 'tapN' || s.verb === 'tap') { await sleep(H() ? 260 : 140); ss.poke('auto'); return true; }
    await sleep(60); return true;
  }

  async function loop() {
    for (;;) {
      if (!A.on) return;
      await sleep(5);   // (every turn yields to the page: its frames, the engine's tick)
      const e = E(); if (!e || !e.st33) { await sleep(200); continue; }
      try {
        if (e.st33.paused && !(e.focus17 && e.focus17().summary)) { await sleep(200); continue; }
        if (e.focus17 && e.focus17().summary) { A.days++; mark('summary' + A.days); if (A.days >= (A.opts.days || 1)) { A.phase = 'done'; A.on = false; return; } await sleep(1500); e.nextDay(); continue; }
        if (await timing()) { A.phase = 'act'; continue; }
        if (e.k20()) { A.phase = 'laver'; await laver(e); continue; }
        if (e.p23()) { A.phase = e.p23().k26 ? 'lot2' : 'lot'; await lot(e); continue; }
        if (e.d21()) { A.phase = 'deshen'; await ashes(e); continue; }
        if (e.m22() && e.m22().ph !== 'end') { A.phase = 'm22'; await pyre(e); continue; }
        if (e.p25()) { A.phase = 'lamb'; await lamb(e); continue; }
        if (e.r26() && e.r26().ph !== 'out') { A.phase = 'heichal'; await heichal(e); continue; }
        A.phase = 'walk'; await day(e);
      } catch (err) { if (!A.on) return; A.err = String(err && err.stack || err).slice(0, 400); note('error ' + A.err.slice(0, 120)); await sleep(300); }
    }
  }
  function hook(e) {
    if (A.off) return;
    A.off = e.on17((ev) => {
      const t = Math.round((ev.t != null ? ev.t : T()) * 100) / 100, k = ev.type;
      A.ev.push([t, k, ev.ph || ev.id || ev.role || ev.why || '']); if (A.ev.length > 4000) A.ev.shift();
      if (k === 'k20' && ev.ph === 'up') mark('laver'); if (k === 'unlock') mark('washed');
      if (k === 'p23' && ev.ph === 'in') { if (A.marks.dawn == null) mark('lot'); else mark('lot2'); }
      if (k === 'p23done') { if (A.marks.lotDone == null) mark('lotDone'); else if (A.marks.dawn != null) mark('lot2Done'); }
      if (k === 'd21done' || k === 'm22done' || k === 'p25done') mark('dawn');   // (his pre-dawn task done: the dawn)
      if (k === 'r26' && ev.ph === 'in') mark('gateAt'); if (k === 'r26gate') mark('gateOpen'); if (k === 'r26' && ev.ph === 'step') mark('stepIn');
      if (k === 'r26done') mark('roleDone');
    });
  }
  /** the morning per phase, seconds (the build-26b report's columns): from the dawn (the pre-dawn task done) to the second lot, the lot, the
   * walk to the gate, the gate, the walk in, the act; the role's total from the dawn; the morning from the day's start */
  function table() {
    const m = A.marks, d = (a, b) => (m[a] != null && m[b] != null ? Math.round((m[b] - m[a]) * 10) / 10 : null), e = E();
    const r = e && e.r26r ? e.r26r() : null, roleDone = m.roleDone;
    return {
      role: r ? r.role : e && e.role26 ? e.role26() : null, lot: e && e.st33 ? e.st33.lot : null,
      preDawn: m.dawn != null ? Math.round(m.dawn * 10) / 10 : null,
      toLot: d('dawn', 'lot2'), lot: d('lot2', 'lot2Done'), toGate: d('lot2Done', 'gateAt'), gate: d('gateAt', 'gateOpen'), walkIn: d('gateOpen', 'stepIn'),
      act: roleDone != null && m.stepIn != null ? Math.round((roleDone - m.stepIn) * 10) / 10 : null,
      roleTotal: roleDone != null && m.dawn != null ? Math.round((roleDone - m.dawn) * 10) / 10 : null,
      morning: roleDone != null ? Math.round(roleDone * 10) / 10 : null,
      r26r: r, d21r: e && e.d21r ? e.d21r() : null, m22r: e && e.m22r ? e.m22r() : null, p25r: e && e.p25r ? e.p25r() : null,
    };
  }
  globalThis.__AUTO35 = {
    get on() { return A.on; },
    start(opts = {}) {
      A.opts = opts; seed = (opts.seed | 0) || 1; A.on = true; A.err = null; A.marks = {}; A.ev = []; A.days = 0;
      const e = E(); if (e) hook(e);
      A.run = loop();
      return until(() => !A.on || A.marks.roleDone != null, (opts.morningS || 600) * 1000, 250).then(() => table());
    },
    stop() { A.on = false; try { if (A.off) A.off(); } catch (e) { /* */ } A.off = null; },
    state: () => ({ on: A.on, phase: A.phase, t: T(), marks: { ...A.marks }, acts: A.acts, walks: A.walks, stuck: A.stuck, days: A.days, err: A.err, notes: A.notes.slice(-12), lag: A.lag.n ? { mean: +(A.lag.s / A.lag.n).toFixed(3), max: +A.lag.max.toFixed(2), n: A.lag.n } : null, table: table() }),
    events: () => A.ev.slice(),
    trace: () => A.trace.slice(),
  };
})();
