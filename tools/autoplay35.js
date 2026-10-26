/* ── recovered (R9) ── autoplay35.js — the shift's autoplayer, in the page (tools/autoplay35-run.cjs injects it; or paste it in the console).
 * It plays the day of builds 16–26c through the engine's own surface (globalThis.__SHIFT.E: E.k20in, E.p23raise, E.d21swipe … E.r26pull),
 * walks by the stick along flow31's gold path (__F31.state().pts — the strong path he sees; when stuck, the shift's planned walk __S29W.to)
 * and taps the stations' timing acts on their gold moment (globalThis.__S29S.poke); the ashes' balance and the lamb's beam go by a finger
 * on the page's own pads (deshen21's and pen25's frames read the touch and would undo a direct E.d21bal / E.p25focus). The morning: the laver, the first lot and its task
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
  // ── fable32 (build 36) ── the two profiles of the levels (svivat-avoda-he.md §4.5): "child" — the human hand as before (H); "skilled" —
  // opts.skilled: the quick hand that plays near the gold moment, with a skilled human's small errors (its timing's spread, its aim's) —
  // the same models as tools/lvl36sim.mjs (HAND.skilled); the act's level read from the engine (K.P36) ── /fable32 ──
  const SK = () => !!A.opts.skilled && !H();
  const gauss = () => { let u = 0; while (u === 0) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };
  const react = () => sleep(H() ? 350 + rnd() * 500 : 120 + rnd() * 160);   // (a child's reaction: 0.35–0.85 s; the quick hand: 0.12–0.28 s)
  const note = (s) => { A.notes.push([T(), s]); if (A.notes.length > 300) A.notes.shift(); };
  const mark = (k) => { if (A.marks[k] == null) A.marks[k] = T(); };
  async function until(f, ms = 20000, step = 50) { const t0 = performance.now(); for (;;) { if (!A.on) throw new Error('stopped'); let v = null; try { v = f(); } catch (e) { v = null; } if (v) return v; if (performance.now() - t0 > ms) return null; await sleep(step); } }
  // a finger on the page's own pads (the input path a player's touch takes: the pads' pointer handlers read it every frame)
  const ptr = (el, type, x, y, id) => { try { el.dispatchEvent(new PointerEvent(type, { pointerId: id, clientX: x, clientY: y, bubbles: true, cancelable: true, pointerType: 'touch', isPrimary: true, button: 0, buttons: type === 'pointerup' || type === 'pointercancel' ? 0 : 1 })); return true; } catch (e) { return false; } };
  const padEl = (cls) => (typeof document !== 'undefined' ? document.querySelector('.' + cls) : null);
  const swipe = (fn, dx, dy) => { const bad = rnd() < (H() ? 0.12 : A.opts && A.opts.skilled ? 0.02 : 0);   /* ── fable32 (build 36) ── (+ the skilled hand's rare slip) ── /fable32 ── */ return bad ? fn(rnd() < 0.5 ? 0.15 : dx, rnd() < 0.5 ? dx * 0.7 : dy, 120) : fn(dx, dy, 90 + rnd() * 60); };

  // ── the walk: as a player walks — by the stick along flow31's gold path (the strong path he sees, the House's floor in it), at the stick's
  // pace (walk.js PACE.stick 7 amot/s; the quick hand sprints ×1.5); a path that does not lead to the place → the shift's planned walk
  // (__S29W.to), and the last few amot straight
  const SPEED = (el) => (H() ? 7 : el < 0.6 ? 7 : 10.5);   // (the quick hand holds the stick on the rim: after 0.6 s the sprint, PACE.rim/rimAfter/sprint)
  function drive(vx, vz) { try { const h = S().hero, sm = h.speedMul > 0 ? h.speedMul : 1; h.drive(vx / sm, vz / sm); } catch (e) { /* */ } }
  // ── fable32 (build 39) ── the guided walk (twin.js T.guide39, shift/guide39.js): a thumb held on the world walks him on the guide's way to
  // the task's place — the bot holds the walk's surface (.tw-zone) until he is there (or an act takes him), and drags toward p when the
  // guide offers more than one place; a child lets go now and then. No direct drive. ── /fable32 ──
  const g39zone = () => { try { return document.querySelector('.gm.tw-on.tw-g39 .tw-zone'); } catch (e) { return null; } };
  async function walkTo39(z, p, r, ms, during) {
    const t0 = performance.now(), W = innerWidth || 640, Hh = innerHeight || 296, id = 931, x0 = W * (0.25 + rnd() * 0.15), y0 = Hh * (0.55 + rnd() * 0.2);
    let held = false, win = null, lastLift = performance.now();
    const down = () => { if (!held) { ptr(z, 'pointerdown', x0, y0, id); held = true; } };
    const up = () => { if (held) { ptr(z, 'pointerup', x0, y0, id); held = false; } };
    try {
      for (;;) {
        if (!A.on) return false;
        const h = hero(), left = Math.hypot(p.x - h.x, p.z - h.z), t = T();
        if (left <= r) return true;
        const e = E(); if (e && busy(e) && A.walkBusy !== true && (e.k20() || e.p23() || e.p25() || (e.r26() && !['walk', 'out'].includes(e.r26().ph)) || (e.d21() && e.d21().ph !== 'foot') || (e.m22() && e.m22().ph !== 'carry'))) return true;   // (an act took him)
        const G = globalThis.__G39, T39 = G ? G.targets() : [];
        if (!T39.length) { up(); if (performance.now() - t0 > ms) return false; await sleep(120); continue; }
        down();
        // (more than one place: drag toward p on the screen — the camera's bearing, as the twin reads it)
        if (T39.length > 1 && Math.hypot(T39[0].at.x - p.x, T39[0].at.z - p.z) > 1.5) { const q = (() => { try { return __T.view.project(p.x, 17, p.z); } catch (err) { return null; } })(), me = (() => { try { return __T.view.project(h.x, 17, h.z); } catch (err) { return null; } })(); if (q && me) { const dx = q.x - me.x, dy = q.y - me.y, d = Math.hypot(dx, dy) || 1; ptr(z, 'pointermove', x0 + (dx / d) * 60, y0 + (dy / d) * 60, id); } }
        // (the guide there but not at p: p is not its place — the guide's own end is the way; stop)
        const gs = G.state(); if (gs.arrived && left > r + 2.5) { note(`guided: at ${gs.arrived}, not at the bot's ${p.x.toFixed(1)},${p.z.toFixed(1)}`); return true; }
        if (H() && performance.now() - lastLift > 1800 + rnd() * 2500) { up(); await sleep(150 + rnd() * 350); down(); lastLift = performance.now(); }   // (a child lets go now and then)
        if (!(A.trW > t - 1)) { A.trW = t; A.trace.push([t, 'g', +h.x.toFixed(1), +h.z.toFixed(1), +p.x.toFixed(1), +p.z.toFixed(1), +left.toFixed(1), gs.id || '']); if (A.trace.length > 400) A.trace.shift(); }
        if (gs.arrived) win = null;   // (the guide has him at its place — the engine's next for now: standing is no stuck)
        if (!win || t < win.t) win = { t, left, x: h.x, z: h.z };
        else if (t - win.t >= 3) { if (win.left - left < 0.5 && Math.hypot(h.x - win.x, h.z - win.z) < 1) { A.stuck++; A.trace.push([t, 'stuck39', +h.x.toFixed(1), +h.z.toFixed(1), +p.x.toFixed(1), +p.z.toFixed(1), +left.toFixed(1), gs.id || '']); note(`guided: no headway at ${h.x.toFixed(1)},${h.z.toFixed(1)} (to ${gs.id})`); } win = { t, left, x: h.x, z: h.z }; }
        if (performance.now() - t0 > ms) { note('guided walk: given up'); return false; }
        if (during) { try { if ((await during()) === false) return true; } catch (err) { /* */ } }
        await sleep(H() ? 60 : 40);
      }
    } finally { up(); }
  }
  async function walkTo(p, r = 1.6, ms = 40000, during = null) {
    if (!p) return false; A.walks++;
    { const z = g39zone(); if (z && globalThis.__G39 && !A.opts.stick39) return walkTo39(z, p, r, ms, during); }   // ── fable32 (build 39) ── ── /fable32 ──
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
      if (during) { try { if ((await during()) === false) { drive(0, 0); return true; } } catch (err) { /* */ } }
      await sleep(H() ? 60 : 40);
    }
  }
  const busy = (e) => e.k20() || e.p23() || e.d21() || e.m22() || e.p25() || (e.r26() && e.r26().ph !== 'out');

  // ── the acts ──
  async function laver(e) {
    const K = e.k20(); if (!K || K.ph !== 'pose') return;
    await react(); e.k20in('L', true); await sleep(H() ? 120 + rnd() * 200 : 30); e.k20in('R', true);
    // ── fable32 (build 36) ── the levels: a thumb lifted once now and then — with the ring's guide 30 % (the child) / 3 % (skilled), without it
    // 40 % / 5 %, the more the longer the water runs (1 − (1 − p)^(T / 3.5)); level 4's balance by the tilt seen (bal36k) ── /fable32 ──
    { const K0 = e.k20(), P = K0 && K0.P36;
      if (P && (P.guide === 0 || P.bal || SK())) {
        const p0 = (H() ? [0.3, 0.4] : [0.03, 0.05])[P.guide === 0 ? 1 : 0], pL = 1 - Math.pow(1 - p0, (K0.T || 3.5) / 3.5), liftAt = rnd() < pL ? rnd() * (K0.T || 3.5) * 0.8 : -1, t0 = T(), mem = {};
        if (A.opts.bad30 !== 'kiyor') {
          await shot30('k20', () => { const k = e.k20(); return k && k.ph === 'pose' && k.p > 0.25; });
          for (let lifted = liftAt < 0; ;) { const k = e.k20(); if (!k || k.ph !== 'pose') break; if (!lifted && T() - t0 >= liftAt) { lifted = true; e.k20in('R', false); await sleep(400); e.k20in('R', true); note('a hand lifted at the laver'); } if (P.bal) bal36(k, mem, (u) => e.k20bal(u)); await sleep(H() ? 90 : 50); }
          e.k20in('L', false); e.k20in('R', false); return;
        }
      } }
    await shot30('k20', () => { const k = e.k20(); return k && k.ph === 'pose' && k.p > 0.25; });   // ── fable32 (build 30) ── (the act's one line) ── /fable32 ──
    if (A.opts.bad30 === 'kiyor') { for (let i = 0; i < 3; i++) { await sleep(450); e.k20in('R', false); await sleep(250); e.k20in('R', true); } note('build 30: three lifts at the laver (a טעון תיקון end)'); }   // ── fable32 (build 30) ── ── /fable32 ──
    else if (H() && rnd() < 0.3) { await sleep(900); e.k20in('R', false); await sleep(400); e.k20in('R', true); note('a hand lifted at the laver'); }
    await until(() => !e.k20() || e.k20().ph !== 'pose', 15000); e.k20in('L', false); e.k20in('R', false);
  }
  async function lot(e) {
    const K = e.p23(); if (!K) return;
    if ((K.ph === 'in' || K.ph === 'raise') && !K.raised) { await react(); e.p23raise(); }
    else if (K.ph === 'choose') { await react(); e.p23pick(K.cards.length > 1 ? Math.floor(rnd() * K.cards.length) : 0); }
    await sleep(80);
  }
  // the balance by the finger on deshen21's pad (its frame writes E.d21bal from the touch, (x − x0) / 70 — and null without one, so a
  // direct E.d21bal would be undone every frame); without the pad, E.d21bal
  function d21touch(u) {
    const pad = padEl('d21-in');
    if (!pad) { E().d21bal(u); return; }
    if (!A.d21t) { A.d21t = { x0: (innerWidth || 640) * 0.5, y0: (innerHeight || 296) * 0.62, id: 920 }; ptr(pad, 'pointerdown', A.d21t.x0, A.d21t.y0, A.d21t.id); }
    ptr(pad, 'pointermove', A.d21t.x0 + 70 * u, A.d21t.y0, A.d21t.id);
  }
  function d21lift() { if (!A.d21t) return; const pad = padEl('d21-in'); if (pad) ptr(pad, 'pointercancel', A.d21t.x0, A.d21t.y0, A.d21t.id); A.d21t = null; }
  async function ashes(e) {
    const K = e.d21(); if (!K) { d21lift(); return; }
    if (K.ph !== 'full' && K.ph !== 'walk' && K.ph !== 'desc') d21lift();
    if (K.ph === 'full') { d21touch(0); await sleep(50); return; }
    if (K.ph === 'sweep') { if ((K.n | 0) === 1) await shot30('d21', null, 100); await react(); const want = K.side ? K.side[Math.min(K.n | 0, K.side.length - 1)] : 1, dir = K.side && rnd() < (H() ? 0.15 : 0.02) ? -want : want; swipe((dx, dy, ms) => e.d21swipe(dx * dir, dy, ms), 0.55 + rnd() * 0.2, 0.04); await sleep(H() ? 250 : 120); return; }   // ── fable32 (build 36) ── (level 2 on: toward the inner coals' side — K.side; a child misreads it now and then) ── /fable32 ──
    if (K.ph === 'walk' || K.ph === 'desc') {
      // the balance (D21.bal): the shovel tips by the wind and the walk's shake; he counters by the tilt he sees and by how fast it goes
      // (the push he feels: the tilt's rate less his own counter), and slows down when it tips far (the shake grows with the pace)
      // (the page's timers come late when its frame is heavy: the gain is held to what the time between two looks allows, k·fix·Δt ≤ 0.5,
      // or the counter overshoots and the shovel rocks — then he slows and the descent takes seconds longer)
      // ── fable32 (build 36) ── (the tilt as he saw it a reaction ago — the child 0.2 s, the quick and skilled hand 0.1 s — and a gentler
      // gain for it; the same model as tools/lvl36sim.mjs) ── /fable32 ──
      const p = A.d21p, dT = p && K.T > p.T + 1e-3 ? K.T - p.T : 0, u = hand37(K.T, K.b, H(), rnd, A.d21h || (A.d21h = {}));   // ── fable32 (build 37) ── (hand37: was the rate over one look) ── /fable32 ──
      if (dT) { A.lag.n++; A.lag.s += dT; A.lag.max = Math.max(A.lag.max, dT); }
      if (!A.d21dbg) { A.d21dbg = { looks: [], ins: [] }; const f = e.d21bal; if (!f.__dbg) { const g = (v) => { const k = e.d21(); if (k && A.d21dbg && A.d21dbg.ins.length < 600 && v !== A.d21dbg.lastIn) { A.d21dbg.lastIn = v; A.d21dbg.ins.push([+k.T.toFixed(3), v == null ? null : +(+v).toFixed(3)]); } return f(v); }; g.__dbg = 1; e.d21bal = g; } }   // ── fable32 (build 37) ── (the ashes' debug: when the pad's u reaches the engine — E.d21bal patched, the tool's only) ── /fable32 ──
      if (A.d21dbg.looks.length < 600) A.d21dbg.looks.push([+K.T.toFixed(3), +u.toFixed(3), +K.b.toFixed(3), K.spills | 0, +(K.v || 0).toFixed(2)]);
      d21touch(u); A.d21p = { T: K.T, u };
      const sy = H() ? (Math.abs(K.b) > 0.55 ? 0.5 : 0.75 + rnd() * 0.25) : Math.abs(K.b) > 0.4 ? 0.55 : 1; e.d21stick(sy);
      if (!(A.trT > K.T - 0.25)) { A.trT = K.T; A.trace.push([T(), K.ph[0], +K.b.toFixed(2), +(K.v || 0).toFixed(1), +u.toFixed(2), sy]); if (A.trace.length > 400) A.trace.shift(); }   // (the run's log: the walk's balance)
      await sleep(H() ? 90 : 50); return;
    }
    if (K.ph === 'foot') { const r0 = K.P36 && K.P36.exact && !H() ? 0.4 : 1.2; if (!K.near || (r0 < 1 && Math.hypot(-28 - hero().x, 34.7 - hero().z) > r0)) await walkTo({ x: -28, z: 34.7 } /* D21.go[2]: the gold ring by the heap */, r0); else { await react(); e.d21tap(); } await sleep(80); return; }   // ── fable32 (build 36) ── (level 4: the skilled hand walks onto the exact mark) ── /fable32 ──
    await sleep(60);
  }
  async function pyre(e) {
    const K = e.m22(); if (!K) return;
    if (K.ph === 'sort' && K.ls === 'on') { if (!A.shotDone.m22) await shot30('m22', null, 300); await react(); const L2 = !!(K.P36 && K.P36.bad > 3), wrong = rnd() < (H() ? (L2 ? 0.1 : 0.08) : SK() ? (L2 ? 0.02 : 0.01) : 0); const take = wrong ? !K.cur.ok : K.cur.ok;   /* ── fable32 (build 36) ── (the sort's misreadings by the profile and the level) ── /fable32 ── */ swipe(e.m22swipe, take ? 0.5 : -0.5, 0.02); await sleep(60); return; }   // ── fable32 (build 31) ── (+ the sorting's shot) ── /fable32 ──
    // ── fable32 (build 35) ── the carry is the ramp run (R19 inside the maaracha role): the work button held — "ייצבו את הסל" (the twin's
    // held19; a child lets go now and then: the basket sways, and on bare stone a log may drop — the way then leads to it); the way by
    // flowNext (the stand on the altar's top, or a dropped log) ── /fable32 ──
    if (K.ph === 'carry') {
      const f = e.flowNext(), at = f && f.at ? f.at : { x: -28.6, z: 1.6 } /* M22.stand, on the altar's top */, log = f && f.id === 'log19';
      await walkTo(at, log ? 0.9 : 2.4, 40000, async () => { hold19(e); const k = e.m22(); return !!k && k.ph === 'carry' && (!!(e.flowNext() && e.flowNext().id === 'log19') === log); });
      hold19(e, true); await sleep(100); return;
    }
    if (K.ph === 'stack') {
      if (!(K.hold >= 0)) { await sleep(80); return; }
      const key36 = `${K.layer}:${K.got.filter((g) => g.at).length}:${K.airMiss | 0}:${A.m22tries = (A.m22tries | 0)}`; if (K.aim36 == null || K.aim36k !== key36) { const band = e.band22(), mid = (band[0] + band[1]) / 2; K.aim36k = key36; K.aim36 = mid + (H() ? (rnd() - 0.5) * (band[1] - band[0]) * 1.4 : SK() ? gauss() * 0.012 : 0); }   // ── fable32 (build 36) ── (one aim a log; the skilled hand's spread) ── /fable32 ──
      const aim = K.aim36;
      if (K.pv == null) { await react(); e.m22put(); await sleep(150); return; }
      const d = aim - K.pv; if (Math.abs(d) > (H() ? 0.04 : SK() ? 0.004 : 0.015)) { e.m22stick(Math.max(-1, Math.min(1, (K.gl >= 0 ? 1 : -1) * Math.sign(d) * Math.min(1, Math.abs(d) * 8)))); await sleep(40); return; }
      e.m22stick(0); await react(); if (!e.m22put()) A.m22tries = (A.m22tries | 0) + 1; await sleep(150); return;   // ── fable32 (build 36) ── (a log refused — outside the band: a new aim, as before) ── /fable32 ──
    }
    if (K.ph === 'ready') { await react(); e.m22tap(); await sleep(200); return; }
    await sleep(80);
  }
  // ── fable32 (build 35) ── the work button held on the ramp while he carries the logs (the twin's held19: the basket steadied); a child's
  // thumb lifts now and then (A.h19.off: 0.8–1.8 s off), the quick hand holds it all the way ── /fable32 ──
  function hold19(e, lift) {
    const btn = padEl('tw-btn'), w = e.work && e.work(hero()), want = !lift && !!(w && w.job === 'sh:run19');
    const H9 = A.h19 || (A.h19 = { down: false, id: 960, off: 0, n: 0 });
    if (H() && want && H9.down && rnd() < 0.012) { H9.off = performance.now() + 800 + rnd() * 1000; H9.n++; }
    const on = want && performance.now() >= H9.off;
    if (!btn) return;
    const r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (on && !H9.down) { H9.down = ptr(btn, 'pointerdown', x, y, H9.id); A.held19 = (A.held19 | 0) + 1; }
    else if (!on && H9.down) { ptr(btn, 'pointercancel', x, y, H9.id); H9.down = false; }
  }
  // ── fable32 (build 36) ── a balance of the levels (the laver's stream, the teni): as the ashes' — the tilt seen a reaction ago (the
  // child 0.2 s, the skilled 0.1 s), a gentler gain for it, a child's rougher eye; the engine's own clock (K.bT) ── /fable32 ──
  // ── fable32 (build 37) ── one balance hand for every balance act (the ashes' pan, the laver's stream at level 4, the teni), the same
  // lines in tools/lvl36sim.mjs: the tilt as seen a reaction ago (lat: the child 0.2 s, the skilled 0.1 s — read between his looks,
  // interpolated), its rate over a fixed 0.1 s less his own counter of then (the push he feels: the wind and the shake), a child's eye
  // rough (±0.15) and his gain gentler (1.74; the skilled 3.2, the push fed forward 0.9). Build 36 took the rate over one look: in the
  // page the looks come 0.05 or 0.1 s apart (the frames and the bot's timer beat), and that jitter became a ±1 counter that rocked the
  // pan — the browser's skilled hand 0/10 at the ashes' level 4 where node made 30 %. ── /fable32 ──
  function hand37(T, b, child, rnd, mem) {
    const lat = child ? 0.2 : 0.1, W = 0.1, fix = 2.4, h = mem.h || (mem.h = []), us = mem.us || (mem.us = []);
    h.push([T, b]);
    while (h.length > 3 && h[1][0] <= T - lat - W - 0.1) h.shift();
    while (us.length > 2 && us[1][0] <= T - lat - W - 0.1) us.shift();
    const bAt = (t) => { let i = h.length - 1; while (i > 0 && h[i][0] > t) i--; const p = h[i], q = h[i + 1]; return q && q[0] > p[0] && t > p[0] ? p[1] + (q[1] - p[1]) * Math.min(1, (t - p[0]) / (q[0] - p[0])) : p[1]; };
    const uAt = (t) => { let i = us.length - 1; while (i >= 0 && us[i][0] > t) i--; return i >= 0 ? us[i][1] : 0; };
    const s1 = bAt(T - lat), s0 = bAt(T - lat - W), d = (s1 - s0) / W - uAt(T - lat - W / 2) * fix;
    const seen = s1 + (child ? (rnd() - 0.5) * 0.3 : (rnd() - 0.5) * 0.08), k = child ? 1.74 : 3.2, ff = child ? 0.4 : 0.9;
    const u = Math.max(-1, Math.min(1, -seen * k - (ff * d) / fix));
    us.push([T, u]);
    return u;
  }
  // ── fable32 (build 37) ── the eye's model (the lamb), the same numbers as tools/lvl36sim.mjs: missed by the drawn size and the spots' count ── /fable32 ──
  const EYE37 = { child: { k50: 0.099, w: 0.0367 }, skilled: { k50: 0.031, w: 0.0367 }, att: 0.15 };
  function miss37(s, L, prof) {
    const k = (L.big ? 1.45 : 1) * (s.r < 4 ? 0.17 : s.r < 6 ? 0.2 : 0.26) * (s.small ? 0.62 : 1) * (s.sz || 1), e = EYE37[prof], n = (L.spots || []).length;
    return Math.min(0.9, (1 / (1 + Math.exp((k - e.k50) / e.w))) * (1 + EYE37.att * Math.max(0, n - 1)));
  }
  function bal36(K, mem, setU) { const u = hand37(K.bT || 0, K.b || 0, H(), rnd, mem); if (A.d21dbg !== undefined) { A.b36dbg = A.b36dbg || []; if (A.b36dbg.length < 600) A.b36dbg.push([+(K.bT || 0).toFixed(3), +u.toFixed(3), +(K.b || 0).toFixed(3), K.spills | 0]); } setU(u); }   // ── fable32 (build 37) ── (the laver's stream and the teni: hand37) ── /fable32 ──
  // the beam by the finger on pen25's pad (its frame focuses the spot nearest the beam, E.p25focus — a direct focus would be undone):
  // drag the beam onto the spot (the beam moves AIM_K 1.6 px a finger's px; a child's drag falls short and is corrected), lift, then a
  // short touch (< 14 px, < 380 ms) — pen25's tap; without the pad (or no focus in 0.8 s), E.p25focus + E.p25tap in one turn
  async function aim25(e, i) {
    const P = globalThis.__P25, pad = padEl('p25-in');
    const where = () => { try { const s = P.state(), sp = s.spots.find((q) => q.i === i); return s.beam && sp && sp.at ? { b: s.beam, at: sp.at } : null; } catch (err) { return null; } };
    if (P && pad && where()) {
      const id = 930 + (A.aimN = (A.aimN | 0) + 1) % 20; let fx = (innerWidth || 640) * 0.5, fy = (innerHeight || 296) * 0.75;
      ptr(pad, 'pointerdown', fx, fy, id);
      for (let k = 0; k < 14; k++) {
        const w = where(); if (!w) break; const ex = w.at[0] - w.b[0], ey = w.at[1] - w.b[1]; if (Math.hypot(ex, ey) < 5) break;
        const g = H() ? 0.55 + rnd() * 0.3 : 0.9; fx += (ex / 1.6) * g; fy += (ey / 1.6) * g; ptr(pad, 'pointermove', fx, fy, id); await sleep(H() ? 80 : 40);
      }
      ptr(pad, 'pointercancel', fx, fy, id);
      if (await until(() => { const K = e.p25(); return K && K.ph === 'scan' && K.fo === i; }, 800, 30)) {
        await sleep(H() ? 150 : 40); ptr(pad, 'pointerdown', fx, fy, id + 40); await sleep(H() ? 110 : 60); ptr(pad, 'pointerup', fx, fy, id + 40);
        if (await until(() => !e.p25() || e.p25().ph !== 'scan', 400, 30)) return true;
      }
      note('the beam: no focus — a direct tap');
    }
    e.p25focus(i); return e.p25tap();
  }
  async function lamb(e) {
    const K = e.p25(); if (!K) return;
    if (K.ph === 'scan') {
      if (!A.shotDone.lamb) await shot30('lamb', null, 600);   // ── fable32 (build 31) ── (the lamb by torchlight: an act in progress) ── /fable32 ──
      const spots = (K.L && K.L.spots) || [], next = spots.find((s) => !s.seen && !s.gone && !(s.skip36 = s.skip36 != null ? s.skip36 : rnd() < (H() || SK() ? miss37(s, K.L, H() ? 'child' : 'skilled') : 0)));   /* ── fable32 (build 37) ── (the eye by the spot's drawn size — tools/lvl36sim.mjs EYE37; was 6 % / 18 %, 1 % / 10 %) ── */   // ── fable32 (build 36) ── (a spot missed — once a lamb; a small blemish more often) ── /fable32 ──
      if (next) { await react(); await aim25(e, next.i); await sleep(100); return; }
      const blem = spots.some((s) => s.kind === 'blem' && s.seen && (!(K.P36 && K.P36.mimic) || s.shown36)), dirt = spots.some((s) => s.kind === 'dirt' && !s.gone);
      await react(); const say = blem || (dirt && rnd() < (H() ? 0.3 : SK() ? 0.05 : 0)) ? 'pasul' : 'tamim';
      if (!e.p25stamp(say)) e.p25stamp('tamim'); await sleep(200); return;
    }
    if (K.ph === 'dirt') { if (K.P36 && K.P36.mimic) await shot30('lamb36', null, 500); /* ── fable32 (build 36) ── (shot lamb36: up close, a spot that may be dirt or a blemish) ── /fable32 ── */ await react(); const sp = K.L.spots[K.zi]; if (K.P36 && K.P36.mimic && rnd() < (H() ? 0.25 : SK() ? 0.06 : 0)) { e.p25stamp('pasul'); await sleep(200); return; } swipe(e.p25swipe, 0.5, 0.02); if (sp && sp.kind === 'blem') sp.shown36 = 1; await sleep(120); return; }   // ── fable32 (build 36) ── (level 3 on: up close alike — a hand that says "פסול" before brushing, now and then) ── /fable32 ──
    if (K.ph === 'blem') { const sp = K.L.spots[K.zi]; if (sp) sp.shown36 = 1; await sleep(H() ? 500 : 150); e.p25tap(); await sleep(100); return; }
    if (K.ph === 'wait') { await react(); e.p25tap(); await sleep(150); return; }
    await sleep(80);
  }
  // ── build 27 ── the blood roles, by a finger on dam27.js's pad (its handlers read the touch; the engine's state tells where the
  // legs, the needle, the stream are): the binding's drag, the tap on the needle's gold, the vessel under the stream, the circles on
  // the way, the pull and the release at the corners (a child's aim rougher: now and then over the line or beside the corner), the
  // swipe down at the yesod. A phase shot (opts.shots27) freezes the world while the runner draws a frame and takes it.
  const SHOTS = () => A.opts.shots27 || [];
  async function shot(name, settle = 0) {
    if (!SHOTS().includes(name) || A.shotDone[name]) return;
    if (settle > 0) { const e = E(), K0 = e && e.r27 && e.r27(), t0 = K0 ? K0.t : 0; await until(() => { const k = e.r27(); return !k || k.t >= settle || k.t < t0 - 0.01; }, 8000, 30); }   // (the authored view eased in)
    A.shotDone[name] = 1; A.shotReq = name;
    try { const tw = globalThis.__SHIFT.mods.twin, c = globalThis.__T.camera, e = E(), w = e && e.camWork27 && e.camWork27(); note(`shot ${name}: viewK ${tw && tw.viewK ? tw.viewK().toFixed(2) : '?'} cam ${[c.position.x, c.position.y, c.position.z].map((v) => v.toFixed(1)).join(',')} want ${w ? w.view.p.join(',') : '-'} phT ${e.r27() ? e.r27().t.toFixed(2) : '-'}`); } catch (err) { note('shot diag ' + err.message); }
    try { globalThis.__T.simulate(false); } catch (e) { /* */ }
    await until(() => !A.shotReq, 120000, 100);
    try { globalThis.__T.simulate(true, 0.05); } catch (e) { /* */ }
  }
  // ── fable32 (build 30) ── the build's shots (opts.shots30: names): an act in progress with its one line (k20, d21, men, inner, shochet,
  // zorek — the carry), its end (end-<id>: the step card's rating and the source line under the top bar), the source's card opened by a
  // tap on that line (src-<id>), the day's summary (sum) ── /fable32 ──
  const S30 = () => A.opts.shots30 || [];
  async function shot30(name, cond, settle = 250) {
    if (!S30().includes(name) || A.shotDone[name]) return false;
    if (cond && !(await until(cond, 6000, 30))) return false;
    if (settle) await sleep(settle);
    A.shotDone[name] = 1; A.shotReq = name;
    try { globalThis.__T.simulate(false); } catch (e) { /* */ }
    await until(() => !A.shotReq, 120000, 100);
    try { globalThis.__T.simulate(true, 0.05); } catch (e) { /* */ }
    return true;
  }
  async function end30(id) {
    A.in30 = 1;
    try { await end30a(id); } finally { A.in30 = 0; }
  }
  async function end30a(id) {
    await shot30('end-' + id, () => document.querySelector('.r30.on .ch'), 500);
    if (S30().includes('src-' + id) && !A.shotDone['src-' + id]) {
      const ch = document.querySelector('.r30.on .ch'); if (ch) { ch.click(); await sleep(400); await shot30('src-' + id, () => document.querySelector('.r30-c')); const b = document.querySelector('.r30-c button'); if (b) b.click(); await sleep(200); }
    }
  }
  const pad27 = () => padEl('dm27-in');
  const W27 = () => innerWidth || 640, H27 = () => innerHeight || 296;
  async function bind27(e) {
    const pad = pad27(), D = globalThis.__D27, legs = D && D.state().legs;
    if (!pad || !legs) { e.r27bind(true); return; }
    const [fx, fy] = legs.f, [hx, hy] = legs.h, vl = Math.hypot(hx - fx, hy - fy) || 1, need = Math.max(70, vl) * 1.0, ux = (hx - fx) / vl, uy = (hy - fy) / vl;
    const K0 = e.r27(), turnBad = !!(K0 && K0.P36 && K0.P36.turn) && rnd() < (H() ? 0.15 : SK() ? 0.03 : 0);
    if (turnBad) { e.r27bind(false); note('the binding: the other way'); await sleep(400); }   // ── fable32 (build 36) ── (level 2 on: no guide — a binding the other way now and then, counted) ── /fable32 ──
    const x0 = W27() * 0.72, y0 = H27() * 0.55, id = 970, short = (H() && rnd() < 0.18) || (SK() && rnd() < 0.02);
    ptr(pad, 'pointerdown', x0, y0, id);
    const n = 10, end = short ? 0.55 : 1;
    for (let i = 1; i <= n; i++) { const u = (i / n) * end; ptr(pad, 'pointermove', x0 + ux * need * u, y0 + uy * need * u, id); if (i === 6) await shot('bind', 1.4); await sleep(H() ? 45 : 25); }
    ptr(pad, 'pointerup', x0 + ux * need * end, y0 + uy * need * end, id);
    if (short) note('the binding: let go short');
  }
  async function cut27(e) {
    const pad = pad27(), K = e.r27();
    if (!K) return;
    await shot('cut', 1.2);
    // the moment: a quick hand taps in the middle of the gold, a child's aim is off by up to ±0.12 now and then
    const err = H() ? (rnd() < 0.3 ? (rnd() - 0.5) * 0.3 : (rnd() - 0.5) * 0.08) : SK() ? (gauss() * 0.03) / (K.sweep || 1.15) : (rnd() - 0.5) * 0.04, want = Math.max(0.02, Math.min(0.98, 0.5 + err));   // ── fable32 (build 36) ── (the skilled hand: a 30 ms timing spread on the needle's pace) ── /fable32 ──
    for (let i = 0; i < 400; i++) { const k = e.r27(); if (!k || k.ph !== 'cut') return; if (Math.abs(k.u - want) < 0.025) break; await sleep(8); }
    const x = W27() * 0.75, y = H27() * 0.5, id = 971;
    if (pad) { ptr(pad, 'pointerdown', x, y, id); ptr(pad, 'pointerup', x, y, id); } else e.r27tap();
    await sleep(H() ? 300 : 150);
  }
  async function recv27(e) {
    const pad = pad27(), x0 = W27() * 0.75, y0 = H27() * 0.6, id = 972;
    let x = x0;
    if (pad) ptr(pad, 'pointerdown', x, y0, id);
    for (let i = 0; i < 400; i++) {
      const K = e.r27(); if (!K || K.ph !== 'recv') break;
      if (i === 30) await shot('recv', 1.3);
      const lag = H() ? 0.65 : 0.92, d = (K.sp - K.pos) * lag + (H() ? (rnd() - 0.5) * 0.08 : SK() ? (rnd() - 0.5) * 0.04 : 0);
      if (pad) { x += (d * 0.42 * W27()) / 2; ptr(pad, 'pointermove', x, y0, id); } else e.r27move(d);
      await sleep(H() ? 60 : 35);
    }
    if (pad) ptr(pad, 'pointercancel', x, y0, id);
  }
  // the circles: one touch circling on the pad, ~1.1 turns a second (a child forgets now and then for a few seconds)
  function swirlStep(dt) {
    const pad = pad27(); if (!pad) { E().r27swirl(6.9 * dt); return; }
    const S2 = A.sw || (A.sw = { id: 973, cx: W27() * 0.76, cy: H27() * 0.58, a: 0, down: false, rest: 0 });
    if ((H() || SK()) && S2.rest <= 0 && rnd() < (H() ? 0.01 : 0.002)) S2.rest = 1.5 + rnd() * 2.5;   // ── fable32 (build 36) ── (+ the skilled hand's rare rest) ── /fable32 ──
    if (S2.rest > 0) { S2.rest -= dt; return; }
    const r = 42;
    if (!S2.down) { S2.down = true; ptr(pad, 'pointerdown', S2.cx + r, S2.cy, S2.id); }
    S2.a += (H() ? 5.5 : 7) * dt;
    ptr(pad, 'pointermove', S2.cx + r * Math.cos(S2.a), S2.cy + r * Math.sin(S2.a), S2.id);
  }
  function swirlLift() { const pad = pad27(); if (A.sw && A.sw.down && pad) ptr(pad, 'pointercancel', A.sw.cx, A.sw.cy, A.sw.id); if (A.sw) A.sw.down = false; }
  async function throw27(e, ph) {
    const pad = pad27(), c = ph === 'aim2' ? 'SW' : 'NE';
    swirlLift();
    if (e.r27().clot) { for (let i = 0; i < 60 && e.r27() && e.r27().clot; i++) { swirlStep(0.05); await sleep(50); } swirlLift(); return; }
    // the pull: p 0.35 (the wall's middle under the thread), the aim straight at the corner; a child's rougher; the demo's first throw
    // over the thread (opts.high27: the red cue's shot)
    const demoHigh = A.opts.high27 && !A.highDone && c === 'NE';
    if (demoHigh) A.highDone = 1;
    const p = demoHigh ? 0.8 : H() ? 0.35 + (rnd() - 0.5) * 0.36 : SK() ? 0.33 + gauss() * 0.05 : 0.33 + (rnd() - 0.5) * 0.06,
      a = H() ? (rnd() < 0.5 ? (rnd() - 0.5) * 6 : (rnd() - 0.5) * 26) : SK() ? gauss() * 1.0 : (rnd() - 0.5) * 2;   // ── fable32 (build 36) ── (the skilled hand's spread) ── /fable32 ──
    if (!pad) { e.r27throw(p, a); await sleep(200); return; }
    const x0 = W27() * 0.75, y0 = H27() * 0.42, id = 974, D = globalThis.__D27, sgn = 1;
    ptr(pad, 'pointerdown', x0, y0, id);
    const dy = p * 0.3 * H27(), steps = 8;
    let dx = 0;
    for (let i = 1; i <= steps; i++) {
      const sg = D && D.state().aim ? D.state().aim.sgn || 1 : sgn;
      dx = (a * 0.22 * W27()) / 40 / sg;
      ptr(pad, 'pointermove', x0 + (dx * i) / steps, y0 + (dy * i) / steps, id);
      await sleep(H() ? 50 : 30);
    }
    await shot(demoHigh ? 'high' : c === 'NE' ? 'aimNE' : 'aimSW', 1.2);
    await sleep(H() ? 200 : 80);
    ptr(pad, 'pointerup', x0 + dx, y0 + dy, id);
    await sleep(120);
    const K = e.r27();
    if (K && (K.ph === 'splash' || K.ph === 'splash2')) { await sleep(250); await shot(K.ph === 'splash' ? 'gammaNE' : 'gammaSW'); }
    else if (demoHigh) { await sleep(300); await shot('highCue'); }
  }
  async function base27(e) {
    const pad = pad27(), x = W27() * 0.75, y = H27() * 0.3, id = 975;
    if (!pad) { e.r27swipe(0, 0.4, 150); return; }
    ptr(pad, 'pointerdown', x, y, id);
    for (let i = 1; i <= 5; i++) { ptr(pad, 'pointermove', x + (H() ? (rnd() - 0.5) * 8 : 0), y + i * 0.08 * H27(), id); await sleep(25); }
    ptr(pad, 'pointerup', x, y + 0.4 * H27(), id);
    await sleep(500); await shot('pour');
  }
  async function blood(e) {
    const K = e.r27(); if (!K) return;
    const ph = K.ph;
    if (!/^(carry|carry2|hold|full)$/.test(ph)) swirlLift();
    if (ph === 'bind') { await shot30('shochet', null, 600); await react(); await bind27(e); await sleep(150); return; }
    if (ph === 'cut' && K.role === 'shochet') { await react(); await cut27(e); return; }
    if (ph === 'recv') { await react(); await recv27(e); return; }
    if (ph === 'full' || ph === 'hold') { swirlStep(0.05); if (ph === 'hold' && K.t > 0.9) await shot('hold'); await sleep(50); return; }
    if (ph === 'carry' || ph === 'carry2') {
      const f = e.flowNext(), half = { t: performance.now() };
      if (f && f.at) await walkTo(f.at, 1.4, 40000, async () => { swirlStep(H() ? 0.06 : 0.04); if (performance.now() - half.t > 1500) { await shot(ph === 'carry' ? 'carry' : 'carry2'); if (ph === 'carry') await shot30('zorek', null, 0); } const k = e.r27(); return !!k && k.ph === ph; });
      return;
    }
    if (ph === 'aim' || ph === 'aim2') { await react(); await throw27(e, ph); return; }
    if (ph === 'base') { await react(); await base27(e); return; }
    if (ph === 'wait' && K.role === 'shochet') { await shot('wait'); await sleep(80); return; }
    if (ph === 'cutd') { await shot('npcRecv', 0.5); await sleep(60); return; }   // (the court's receiver at the vessel)
    await sleep(60);
  }
  async function heichal(e) {
    const K = e.r26(); if (!K) return;
    const ph = K.ph;
    if (ph === 'bolt') { await react(); swipe(e.r26swipe, 0.55, 0.03); await sleep(120); return; }
    if (ph === 'key') { if (!K.held) { await react(); e.r26hold(true); } await sleep(60); return; }
    if (ph === 'open' || ph === 'walk') { if (K.held) e.r26hold(false); if (ph === 'walk') { const f = e.flowNext(); if (f && f.at) await walkTo(f.at, 2.4); } await sleep(80); return; }
    if (ph === 'wick') { if (A.lamp !== K.li) { A.lamp = K.li; if (K.li > 0) await sleep(H() ? 600 : 300); }   // (the eye goes to the next lamp with the camera)
      if (K.li === 1) await shot30('men', null, 400);   // ── fable32 (build 30) ── ── /fable32 ──
      await react(); swipe(e.r26swipe, 0.02, -0.5); await sleep(120); return; }
    if (ph === 'wipe') { await react(); swipe(e.r26swipe, 0.5, 0.02); await sleep(120); return; }
    if (ph === 'pour') {
      // released by eye on the game's clock: when the next look would pass the mark by more than this one falls short of it (the page's
      // timers come late; a child's mark is rougher and his hand a little late — he misjudges sometimes)
      if (!K.held) { await react(); const P = K.P36 || { lo: 0.9, hi: 1 }; A.want = H() ? 0.86 + rnd() * 0.14 + rnd() * rnd() * 0.08 : SK() ? (P.lo + P.hi) / 2 + gauss() * 0.045 * 0.34 : 0.93 + rnd() * 0.04; A.pp = null; e.r26hold(true); await sleep(30); return; }   // ── fable32 (build 36) ── (the skilled hand at the band's middle, a 45 ms release spread on the slow fill) ── /fable32 ──
      const f = K.fill, p = A.pp, step = p != null && f > p ? f - p : 0, want = A.want || 0.95; A.pp = f;
      if (f >= want || (step > 0 && f + step - want > want - f)) { e.r26hold(false); A.pp = null; await sleep(80); }
      else await sleep(10);
      return;
    }
    if (ph === 'new' || ph === 'kuz') { await react(); e.r26tap(); await sleep(150); return; }
    if (ph === 'drag') { await react(); e.r26light(); await sleep(150); return; }
    if (ph === 'altar') { if (!A.shotDone.altar) await shot30('altar', null, 300); await react(); e.r26light('altar'); await sleep(150); return; }   // ── fable32 (build 36) ── (level 4: the western lamp from the outer altar's pan) ── /fable32 ──
    if (ph === 'pull') { if ((K.n | 0) === 2) await shot30('inner', null, 200); await sleep(H() ? 450 + rnd() * 400 : 200); const g = !(K.P36 && K.P36.guide === 0); e.r26pull(H() ? (rnd() < (g ? 0.15 : 0.2) ? 2.8 : 1.4 + rnd() * 0.5) : SK() ? 1.55 + gauss() * (g ? 0.22 : 0.28) : 1.4 + rnd() * 0.5); return; }   // ── fable32 (build 36) ── (the pull's pace by the profile; without the guide a little rougher) ── /fable32 ──
    if (ph === 'lift36') { await sleep(80); return; }
    if (ph === 'teni36') { if (!A.shotDone.teni36) await shot30('teni36', null, 200); bal36(K, A.t36 || (A.t36 = {}), (u) => e.r26bal(u)); await sleep(H() ? 90 : 50); return; }   // ── fable32 (build 36) ── (level 4: the teni held level on the way out) ── /fable32 ──
    if (ph === 'out') { await walkTo({ x: -50, z: 0 }, 3); return; }
    await sleep(80);
  }
  // ── the day: the next place, its act (a timing act tapped on the gold moment), the logs laid one a tap ──
  async function day(e) {
    if (A.opts.practice && e.p31 && e.p31() && e.p31().end) { await sleep(150); return; }   // ── fable32 (build 31) ── (a practice run: after his act, nothing else — its card comes) ── /fable32 ──
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

  // ── fable32 (build 32) ── the journal's unlock card ("עמוד חדש ביומן" — the day waits under it): the child reads it (a moment), its shot
  // (opts.shots30: j32 — the first card, j32-<id> — a role's), then "המשך"; opts.open32 (true, or a role's id): once, "לפתוח ביומן" — the role's page
  // (shot j32page) — and the journal's ✕ (the day goes on as it closes). Each card is logged: [t, day, id, hello] ── /fable32 ──
  async function card32(e, U) {
    const s = U.state(), id = (e.j32card && e.j32card() && e.j32card().id) || (s.last && s.last.id) || '?', k = `${e.st33.day}:${id}`;
    if (A.j32k !== k) { A.j32k = k; A.j32.push([T(), e.st33.day, id, s.last && s.last.hello ? 1 : 0]); note(`journal card: ${id}${s.last && s.last.hello ? ' (the journal opens)' : ''}`); }
    await sleep(H() ? 1600 + rnd() * 900 : 500);   // (reading it)
    if (!(await shot30('j32-' + id, null, 300))) await shot30('j32', null, 300);
    if (A.opts.open32 && !A.j32open && (A.opts.open32 === true || A.opts.open32 === id)) {
      A.j32open = 1; U.open(); await sleep(700);
      await shot30('j32page', () => document.querySelector('.j32 .pg'), 300);
      A.j32page = ((document.querySelector('.j32 .pg') || {}).textContent || '').replace(/\s+/g, ' ').slice(0, 200);
      await sleep(H() ? 1200 : 300);
      try { globalThis.__J32.close(); } catch (err) { /* */ }
      return;
    }
    U.cont();
    await sleep(120);
  }
  // ── fable32 (build 32) ── opts.src32: at each summary, its "📜 המקורות של היום" — the journal on today's pages (logged: its head and its
  // groups; shot sum32 once), then its ✕ ── /fable32 ──
  async function src32(e) {
    A.src32 = e.st33.day;
    const b = document.querySelector('.f17-sum [data-f17=src]'); if (!b) { note('summary: no sources button'); return; }
    await sleep(H() ? 900 : 300); b.click(); await sleep(500);
    const j = document.querySelector('.j32');
    A.src32s.push([e.st33.day, j ? ((j.querySelector('.td') || {}).textContent || '').trim() : null, j ? [...j.querySelectorAll('h3')].map((h) => h.textContent.trim()) : null]);
    await shot30('sum32', () => document.querySelector('.j32'), 300);
    try { globalThis.__J32.close(); } catch (err) { /* */ }
    await sleep(300);
  }
  // ── fable32 (build 35) ── where the morning's time goes (svivat-avoda-he.md §2, §10): the engine's clock sampled every turn and laid on
  // what the engine is in — his act (act30: from his first step into it to its end — the ramp run and the zorek's walk with the vessel are
  // in it), the shared work (the lots), the calm after an act (its rating's word), a card read (the journal's, the lamb's), the close, and
  // the rest — walking and waiting; per morning (A.share[day]) ── /fable32 ──
  function share35(e) {
    const st = e.st33, t = st.t, last = A.sh35;
    A.sh35 = { t, day: st.day };
    if (!last || last.day !== st.day || !(t > last.t) || t - last.t > 1) return;
    const dt = t - last.t, k = st.summary ? 'summary' : st.close35 ? 'close' : st.p23 ? 'lot' : e.act30 && e.act30() ? 'act' : e.word30 && e.word30() ? 'calm' : st.paused ? 'card' : 'walk';
    const S = (A.share[st.day] || (A.share[st.day] = { act: 0, lot: 0, calm: 0, card: 0, close: 0, walk: 0, summary: 0 }));
    S[k] += dt;
  }
  async function loop() {
    for (;;) {
      if (!A.on) return;
      await sleep(5);   // (every turn yields to the page: its frames, the engine's tick)
      const e = E(); if (!e || !e.st33) { await sleep(200); continue; }
      if (A.shot35q && S30().includes(A.shot35q)) { const n = A.shot35q; A.shot35q = null; await shot30(n, null, 2600); continue; }   // (the fade's own 1.5 s lifted first)   // ── fable32 (build 35) ── (the close's view: a frame after its cut) ── /fable32 ──
      if (S30().includes('run') && !A.shotDone.run && e.m22 && e.m22() && e.m22().ph === 'carry' && e.st33.r19 && e.st33.r19.run && hero().z < 30) await shot30('run', null, 0);   // ── fable32 (build 35) ── (the ramp run inside the maaracha role) ── /fable32 ──
      if (S30().includes('chip36') && !A.shotDone.chip36 && e.lv36now && e.lv36now() && e.lv36now().id !== 'kiyor' && !(e.act30 && e.act30()) && !e.st33.paused && !(e.word30 && e.word30())) await shot30('chip36', null, 300);   // ── fable32 (build 36) ── (the level chip on the way to his role, before its act) ── /fable32 ──
      if (S30().includes('hud') && !A.shotDone.hud && e.gate26L && e.gate26L() && !e.p23() && !e.st33.paused && !(e.word30 && e.word30()) && !(e.j32q && e.j32q())) await shot30('hud', null, 300);   // ── fable32 (build 35) ── (the HUD between two acts: no fire meter, no countdown) ── /fable32 ──
      try {
        // ── fable32 (build 31) ── a practice run (opts.practice): its end card is up — the run is over (the runner takes the card, "עוד פעם" / "חזרה") ── /fable32 ──
        if (A.opts.practice && e.p31 && e.p31() && e.p31().done) { mark('p31end'); A.phase = 'done'; A.on = false; return; }
        { const U = globalThis.__J32U; if (U && U.state().card) { A.phase = 'j32'; await card32(e, U); continue; } }   // ── fable32 (build 32) ── ── /fable32 ──
        // ── fable32 (build 33) ── the morning's lamb card ("הטלה שבדקת … עולה היום לתמיד" — the day waits under it): read, its shot (shots30
        // tl33), "המשך"; logged in notes ── /fable32 ──
        { const U = globalThis.__TL33; if (U && U.state().card) { A.phase = 'tl33'; note(`lamb card: ${(U.state().last || {}).line || ''}`); await sleep(H() ? 1600 + rnd() * 900 : 500); await shot30('tl33', null, 300); U.cont(); await sleep(120); continue; } }
        if (e.st33.paused && !(e.focus17 && e.focus17().summary)) { await sleep(200); continue; }
        // ── fable32 (build 32) ── opts.skipDay: the morning done (his second lot's role, its word and any card past) — the day's rest skipped
        // to its sunset (E.debug.night), so a run plays mornings one after another; the summary as ever ── /fable32 ──
        if (A.opts.skipDay && e.st33.r26day === e.st33.day && A.skip32 !== e.st33.day && !e.st33.night && !(e.j32q && e.j32q()) && !(e.word30 && e.word30()) && !(A.end30q && A.end30q.length) && !(e.r26() && e.r26().ph !== 'out') && !(e.r27 && e.r27() && e.r27().ph !== 'out')) {
          A.skip32 = e.st33.day; mark('skip' + e.st33.day); note(`day ${e.st33.day}: the morning done — to the sunset`); e.debug.night(); await sleep(300); continue;
        }
        if (A.end30q && A.end30q.length) { await end30(A.end30q.shift()); continue; }   // ── fable32 (build 30) ── ── /fable32 ──
        if (e.focus17 && e.focus17().summary) { await shot30('sum', null, 2200); if (A.opts.src32 && A.src32 !== e.st33.day) await src32(e); A.days++; mark('summary' + A.days); if (A.days >= (A.opts.days || 1)) { A.phase = 'done'; A.on = false; return; } await sleep(1500); e.nextDay(); continue; }
        if (await timing()) { A.phase = 'act'; continue; }
        if (e.k20()) { A.phase = 'laver'; await laver(e); continue; }
        if (e.p23()) { A.phase = e.p23().k26 ? 'lot2' : 'lot'; await lot(e); continue; }
        if (e.d21()) { A.phase = 'deshen'; await ashes(e); continue; }
        if (e.m22() && e.m22().ph !== 'end') { A.phase = 'm22'; await pyre(e); continue; }
        if (e.p25()) { A.phase = 'lamb'; await lamb(e); continue; }
        if (e.r27 && e.r27() && e.r27().ph !== 'out') { A.phase = 'blood'; await blood(e); continue; }   // ── build 27 ──
        if (SHOTS().includes('npcNE') && !A.shotDone.npcNE && globalThis.__D27 && globalThis.__D27.state().npc === 'NE') await shot('npcNE');
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
      if (k === 'r26done' || k === 'r27done') mark('roleDone');
      if (k === 'r27' && ev.ph === 'in') mark('ringAt');   // ── build 27 ── (at the ring: the blood role begins)
      if (k === 'r27' && (ev.ph === 'recv' || ev.ph === 'cutd')) mark('cut');
      if (k === 'r27' && ev.ph === 'splash') mark('giftNE'); if (k === 'r27' && ev.ph === 'splash2') mark('giftSW');
      if (k === 'rate30') { A.rate.push([t, ev.id, ev.rating, ev.q, ev.coins, E() && E().st33 ? E().st33.day : 0 /* ── fable32 (build 32) ── (the day) ── */]); if (S30().includes('end-' + ev.id)) (A.end30q || (A.end30q = [])).push(ev.id); }   // ── fable32 (build 30) ── (each act's rating) ── /fable32 ──
      if (k === 'p31end') mark('p31end');   // ── fable32 (build 31) ── ── /fable32 ──
      if (k === 'close35' && ev.ph === 'fade') { mark('close'); A.close35.push([t, E() && E().st33 ? E().st33.day : 0, ev.look]); }   // ── fable32 (build 35) ── (the morning's close; its fire's look) ── /fable32 ──
      if (k === 'close35' && ev.ph === 'view') A.shot35q = 'close';
      if (k === 'summary') { mark('sumAt'); A.sums.push([t, ev.day, (ev.ratings || []).map((x) => `${x.id}:${x.rating}`), (ev.court || []).map((x) => x.id), (ev.taskList || []).map((x) => `${x.id}:${x.done ? 1 : 0}`), ev.fire || null, ev.tamids ? ev.tamids.length : null]); }
      if (k === 'fire35') A.fire35.push([t, ev.look]);
      if (k === 'top') A.runs.push([t, ev.dur, ev.g, !!ev.m22]);
      if (k === 'slip') A.slips35++;
      if (k === 'task') A.tasks35.push([t, ev.id || ev.text]);
      if (k === 'k20' && ev.ph === 'pose') mark('k20pose'); if (k === 'd21' && ev.ph === 'sweep') mark('actIn'); if (k === 'm22' && ev.ph === 'sort') mark('actIn'); if (k === 'p25' && ev.ph === 'scan') mark('actIn'); if ((k === 'r26' || k === 'r27') && ev.ph === 'in') mark('actIn');
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
      act: roleDone != null && m.stepIn != null ? Math.round((roleDone - m.stepIn) * 10) / 10 : roleDone != null && m.ringAt != null ? Math.round((roleDone - m.ringAt) * 10) / 10 : null,
      toRing: d('lot2Done', 'ringAt'), ringToCut: d('ringAt', 'cut'), cutToNE: d('cut', 'giftNE'), neToSW: d('giftNE', 'giftSW'), swToEnd: d('giftSW', 'roleDone'),   // ── build 27 ──
      roleTotal: roleDone != null && m.dawn != null ? Math.round((roleDone - m.dawn) * 10) / 10 : null,
      morning: roleDone != null ? Math.round(roleDone * 10) / 10 : null,
      r26r: r, coins: r ? r.coins : null, d21r: e && e.d21r ? e.d21r() : null, m22r: e && e.m22r ? e.m22r() : null, p25r: e && e.p25r ? e.p25r() : null,
    };
  }
  globalThis.__AUTO35 = {
    get on() { return A.on; },
    start(opts = {}) {
      A.opts = opts; seed = (opts.seed | 0) || 1; A.on = true; A.err = null; A.marks = {}; A.ev = []; A.days = 0; A.shotDone = {}; A.shotReq = null; A.highDone = 0; A.rate = []; A.j32 = []; A.j32k = ''; A.j32open = 0; A.skip32 = 0; A.src32 = 0; A.src32s = [];   // ── fable32 (build 32) ── (the journal's cards) ── /fable32 ──
      A.d21h = null; A.d21p = null; A.t36 = null; A.d21t = null; A.d21dbg = null; A.b36dbg = null;   // ── fable32 (build 36) ── (each run's own balance memory: a practice's "עוד פעם" starts the engine's clock again) ── /fable32 ──
      A.share = {}; A.sh35 = null; A.close35 = []; A.sums = []; A.fire35 = []; A.runs = []; A.slips35 = 0; A.tasks35 = []; A.held19 = 0; A.h19 = null; A.shot35q = null;   // ── fable32 (build 35) ── ── /fable32 ──
      clearInterval(A.shInt); A.shInt = setInterval(() => { try { const e = E(); if (e && e.st33) share35(e); } catch (err) { /* */ } }, 100);   // ── fable32 (build 35) ── (the time shares: sampled apart from the bot's own turns, which a walk holds) ── /fable32 ──
      const e = E(); if (e) hook(e);
      A.run = loop();
      return until(() => !A.on || A.marks.roleDone != null, (opts.morningS || 600) * 1000, 250).then(() => table());
    },
    stop() { A.on = false; clearInterval(A.shInt); try { if (A.off) A.off(); } catch (e) { /* */ } A.off = null; },
    state: () => ({ on: A.on, phase: A.phase, t: T(), marks: { ...A.marks }, rate: (A.rate || []).slice(), share: JSON.parse(JSON.stringify(A.share || {})), close35: (A.close35 || []).slice(), sums: (A.sums || []).slice(), fire35: (A.fire35 || []).slice(), runs: (A.runs || []).slice(), slips35: A.slips35 | 0, tasks35: (A.tasks35 || []).slice(), held19: A.held19 | 0, lifts19: A.h19 ? A.h19.n : 0 /* ── fable32 (build 35) ── */, j32: (A.j32 || []).slice(), j32page: A.j32page || null, src32: (A.src32s || []).slice() /* ── fable32 (build 32) ── */, pend30: ((A.end30q && A.end30q.length) | 0) + (A.in30 ? 1 : 0), acts: A.acts, walks: A.walks, stuck: A.stuck, days: A.days, err: A.err, notes: A.notes.slice(-12), lag: A.lag.n ? { mean: +(A.lag.s / A.lag.n).toFixed(3), max: +A.lag.max.toFixed(2), n: A.lag.n } : null, d21dbg: A.d21dbg || null, b36dbg: A.b36dbg || null /* ── fable32 (build 37) ── */, table: table() }),
    events: () => A.ev.slice(),
    get shotReq() { return A.shotReq; },
    shotTaken() { A.shotReq = null; },
    trace: () => A.trace.slice(),
  };
})();
