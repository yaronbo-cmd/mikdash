/* ── build 135 ── h135/dadim.js — work 1 "שנים עשר הדדים" (spec docs/specs/shlav-12-he.md v7, עבודה 1; the rules: dadim-model.js).
 * The kiyor stands finished; its twelve seats on the half toward the altar, two rows; six stone stations east of it (the engraved hands
 * bright, the feet dark); the rack of knobs on its west side. The kohen by the basket (rule 62).
 *   · the work finger drags a spigot from the basket to a free seat (a soft snap; the seat sets its height);
 *   · the work finger on a seated spigot turns its mouth: sideways = left / right, up / down = its tilt, 30° each way; held past the edge
 *     for half a second it scratches the seat (−20, kept);
 *   · the water: level 1 the plug opens by itself while the finger turns it (a live arc, its landing ring the ghost); lifting the finger
 *     locks it. From level 2 the knob of that spigot pops out on the rack and lights: the helping hand holds it (the rod pulls the plug)
 *     and the arc lives while it is held; letting it go shuts the plug and LOCKS the spigot as it points. (A second finger anywhere while
 *     a spigot is held is the knob, too: two small thumbs on a phone. The mouse: the space bar held.)
 *   · the lock: the engraved hands of a station with no stream of this row yet 40, the feet 20, the slab 10; the floor or the kiyor = wet
 *     (it opens again, free); two of a row on one station 10, the streams clash. The first lock is a free try.
 *   · then the tests: the morning (the six upper open together), from level 2 the evening (the water down to the moon ring, the lower
 *     open); a dry station opens its row's spare spigot for a fix (20 at most).
 *   DADIM_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { WORDS } from './model.js';
import * as D from './dadim-model.js';
import { mats12, spigotMesh, slabMesh, streamMesh } from './look.js';
import { own, SH12, seatPose } from './world.js';
import { award, extra, hurt, finish, V3, lens, voices12, px360, MIN_GRIP } from './kit12.js';
import { fingers } from '../h113/acts.js';

const S12 = BOOK.s12, F = S12.floor, K = S12.kiyor, CAM = S12.cam.dadim;
export const DA = Object.freeze({ FOV: 50, DEG_PX: 30 / 120, SNAP: 70, SHOW: 2.6, EVE: 1.6 });

function make(m, X) {
  const T = X.THREE, Mo = X.M, lv = m.lv | 0 || 1, V = voices12(X), Mt = mats12(X);
  const root = new T.Group(); root.name = 'h135-dadim-act'; X.props.root.add(root);
  const A = { t: 0, ev: [], ended: false, finished: false, busy: 0, drag: null, aim: null, knob: null, sp: null, live: {}, phase: 'work', force: 0, rings: [] };
  const ev = (e) => { A.ev.push(e); if (A.ev.length > 24) A.ev.shift(); };
  const b0 = Mo.workOf(m.k);
  let S = b0 && b0.id === m.id ? D.load(b0, S12) : null; if (S && S.lv !== lv) S = null; const resumed = !!S;
  if (!S) S = D.fresh(lv, S12);
  let k0 = ''; const keep = () => { const b = D.save(S, m.id), k = JSON.stringify(b); if (k === k0) return; k0 = k; Mo.keep(m.k, b); X.save(); };
  // (the kiyor raised and still for this work; the world's spigots of the seats in play, the stations and the basket are the act's)
  if (Mo.st.sunk) { Mo.st.sunk = 0; X.save(); }
  SH12.hold = true; SH12.d = 0;
  const inPlay = new Set(S.seats);
  own('spigotsSkip', false); SH12.own.spigotsSkip = (n) => inPlay.has(n); own('stations', true);
  // ── the stations at this level, their hands each with its own light
  const st3 = {};
  for (const st of S12.stations) {
    const g = slabMesh(X, st, lv); root.add(g); const lit = Mt.y12hands.clone(); for (const h of g.userData.hands) h.material = lit;
    st3[st.i] = { g, lit, flash: 0, dry: 0 };
  }
  // ── the spigots: one mesh each (in the basket, held, or seated)
  const spig = {}, streams = {};
  for (const n of S.seats) { const s = spigotMesh(X); s.visible = false; root.add(s); spig[n] = s; const st = streamMesh(X); root.add(st); streams[n] = st; }
  const ghost = new T.Mesh(new T.RingGeometry(0.1, 0.16, 20), Mt.y12splash); ghost.rotation.x = -Math.PI / 2; ghost.visible = false; ghost.renderOrder = 7; root.add(ghost);
  for (let i = 0; i < 8; i++) { const r = new T.Mesh(new T.RingGeometry(0.05, 0.11, 18), Mt.y12splash.clone()); r.rotation.x = -Math.PI / 2; r.visible = false; r.renderOrder = 7; root.add(r); A.rings.push({ r, t: 9 }); }
  const splash = (x, y, z, k = 1) => { const q = A.rings.find((o) => o.t > 0.6) || A.rings[0]; q.t = 0; q.k = k; q.r.position.set(x, y + 0.02, z); };
  const [bx, bz] = S12.basket, BY = F + 0.36;
  const basketPos = (i) => [bx + Math.cos(i * 1.3) * 0.16, BY + Math.floor(i / 4) * 0.08, bz + Math.sin(i * 1.3) * 0.16];
  function poseAll() {
    let i = 0;
    for (const n of S.seats) {
      const p = S.sp[n], g = spig[n];
      if (A.drag && A.drag.n === n) continue;
      if (!p.placed) { const [x, y, z] = basketPos(i++); g.visible = true; g.position.set(x, y, z); g.rotation.set(0, i * 0.9, 0.6); continue; }
      const q = seatPose(n, p.yaw, p.pitch, 0); g.visible = true; g.position.set(q.x, q.y, q.z); g.rotation.set(0, q.ry, q.rz, 'YZX');
      const plug = g.userData.plug; if (plug) plug.position.y = A.live[n] ? 0.16 : 0.1;
    }
  }
  // ── the camera: the kiyor two thirds at the left, the stations at the right, both rows of seats, the rack at the far left
  const cam0 = X.camera, fov0 = cam0.fov;
  const home = (d = 0) => { lens(X, DA.FOV); X.shot(CAM[0].slice(), CAM[1].slice(), d); };
  const scrOf = (x, y, z) => { const r = X.scr(x, y, z); return { x: r.x, y: r.y }; };
  const g2 = () => Math.max(MIN_GRIP * px360(), 26);
  const mouthScr = (n) => { const q = D.mouthOf(S, n); return scrOf(q.x, q.y, q.z); };
  const seatScr = (n) => { const s = S12.seats[n]; return scrOf(s.x, s.y, s.z); };
  const basketScr = () => scrOf(bx, BY, bz);
  const knobOf = (n) => (SH12.refs && SH12.refs.knobs ? SH12.refs.knobs[n] : null);
  const knobScr = (n) => { const k = knobOf(n); if (!k) return null; const p = k.getWorldPosition(new T.Vector3()); return scrOf(p.x, p.y, p.z); };
  const near = (f, p, r) => p && Math.hypot(f.x - p.x, f.y - p.y) < r;
  const onBasket = (f) => S.basket > 0 && near(f, basketScr(), g2() * 1.8);
  const onSpigot = (f) => { let best = null, bd = g2() * 1.4; for (const n of S.seats) { const p = S.sp[n]; if (!p.placed || p.locked) continue; const q = mouthScr(n), d = Math.hypot(f.x - q.x, f.y - q.y); if (d < bd) { bd = d; best = n; } } return best; };
  const freeSeatNear = (f) => { let best = null, bd = DA.SNAP * px360(); for (const n of S.seats) { if (S.sp[n].placed) continue; const q = seatScr(n), d = Math.hypot(f.x - q.x, f.y - q.y); if (d < bd) { bd = d; best = n; } } return best; };
  // (which way the mouth's landing moves on the screen for +yaw / +pitch: the drag turns it the way the finger goes)
  function sense(n) {
    const p = S.sp[n], y0 = p.yaw, q0 = p.pitch, L = (y, q) => { p.yaw = y; p.pitch = q; const l = D.arc(S, n).land; return scrOf(l.x, l.y, l.z); };
    const a = L(y0, q0), b = L(Math.min(D.DK.RANGE, y0 + 2), q0), c = L(y0, Math.min(D.DK.RANGE, q0 + 2)); p.yaw = y0; p.pitch = q0;
    return { yx: Math.sign(b.x - a.x) || 1, py: Math.sign(c.y - a.y) || -1 };
  }
  const flowing = (n) => !!A.live[n];
  function startAim(f, n) {
    A.aim = { id: f.id, n, x0: f.x, y0: f.y, yaw0: S.sp[n].yaw, p0: S.sp[n].pitch, s: sense(n), knobbed: false }; ev('aim:' + n);
    X.hand(null);
    if (lv === 1) { A.live[n] = true; V.plug(); }
  }
  function lockNow(n) {
    A.live[n] = false; V.plug();
    const wasFirst = S.first, r = D.lock(S, n); if (!r) return;
    const L = r.land, at = V3(X, L.x, L.y + 0.4, L.z);
    S.first = false;
    if (r.wet) { V.wet(); splash(L.x, L.y, L.z, 1.4); ev('wet:' + n); try { X.line(L.zone === 'kiyor' ? 'הזרם חזר אל הכיור: הדד נפתח שוב' : 'רטוב על הרצפה: הדד נפתח שוב', 1600); } catch (e) { /* */ } keep(); return; }
    if (wasFirst && r.grade !== 'gold') {
      // (the first action of a work is a free try: undone, no points)
      S.steps.pop(); const p = S.sp[n]; p.locked = false; p.land = null; p.grade = null; if (r.clash) S.clashes = Math.max(0, S.clashes - 1);
      splash(L.x, L.y, L.z); V.splash(); ev('free:' + n); try { X.line('ניסוי חינם: עוד פעם, אל הכפות', 1800); } catch (e) { /* */ } keep(); return;
    }
    if (r.clash) { V.clash(); splash(L.x, L.y, L.z, 1.8); }
    else if (r.grade === 'gold') { V.gold(); st3[L.station].flash = 1.2; } else V.splash();
    splash(L.x, L.y, L.z);
    award(X, at, r.grade, lv, 'נחושת'); ev('lock:' + n + ':' + r.grade);
    keep();
    if (D.allLocked(S)) runTests();
  }
  // ── the fingers
  const FG = fingers(X, {
    down(f) {
      if (A.finished || A.busy) return;
      if (A.aim && lv > 1 && !A.knob) { const k = knobScr(A.aim.n); A.knob = { id: f.id, onKnob: near(f, k, g2() * 1.6) }; A.live[A.aim.n] = true; A.aim.knobbed = true; V.plug(); ev('knob'); return; }
      const n = onSpigot(f); if (n != null && !A.aim) { startAim(f, n); return; }
      if (onBasket(f) && !A.drag) { const k = S.seats.find((q) => !S.sp[q].placed); if (k != null) { A.drag = { id: f.id, n: k, x: f.x, y: f.y }; X.hand(null); ev('drag'); } return; }
      // (a knob of a spigot not held: the knob is live only for the spigot in the work hand — the others stay locked to touch)
    },
    move(f) {
      if (A.drag && f.id === A.drag.id) { A.drag.x = f.x; A.drag.y = f.y; A.drag.seat = freeSeatNear(f); return; }
      if (A.aim && f.id === A.aim.id) {
        const q = A.aim, k = DA.DEG_PX / px360();
        const y = q.yaw0 + (f.x - q.x0) * k * q.s.yx, p = q.p0 + (f.y - q.y0) * k * q.s.py;
        const r = D.aim(S, q.n, y, p); A.out = r.out; return;
      }
    },
    up(f) {
      if (A.drag && f.id === A.drag.id) { const d = A.drag; A.drag = null; const n = d.seat != null ? d.seat : freeSeatNear(f); if (n != null) { D.place(S, n); V.seat(); ev('seat:' + n); keep(); if (!A.hint2) { A.hint2 = 1; hintAim(n); } } return; }
      if (A.aim && f.id === A.aim.id) { const n = A.aim.n; A.out = false; A.force = 0; if (lv === 1) { A.aim = null; lockNow(n); } else if (!A.knob) { A.aim = null; A.live[n] = false; } else A.aim.gone = true; return; }
      if (A.knob && f.id === A.knob.id) { A.knob = null; if (A.aim) { const n = A.aim.n; if (A.aim.gone) A.aim = null; lockNow(n); } return; }
    },
  });
  // (the mouse: the space bar held is the knob)
  const onKey = (e) => { if (e.code !== 'Space' || lv === 1) return; try { e.preventDefault(); } catch (er) { /* */ } if (e.type === 'keydown') { if (!A.sp && A.aim && !A.knob) { A.sp = 1; A.knob = { id: 'space' }; A.live[A.aim.n] = true; A.aim.knobbed = true; V.plug(); } } else if (A.sp) { A.sp = 0; if (A.knob && A.knob.id === 'space') { A.knob = null; if (A.aim) { const n = A.aim.n; if (A.aim.gone) A.aim = null; lockNow(n); } } } };
  // ── the tests: the morning, then (from level 2) the evening
  async function runTests() {
    A.busy = 1; S.phase = 'test'; keep();
    await X.wait(0.6); if (A.ended) return;
    const show = async (when) => {
      const row = when === 'evening' ? 'down' : 'up';
      try { X.line(when === 'evening' ? 'הערב: המים יורדים לטבעת הירח, התחתונים נפתחים' : 'הבוקר: הכיור מלא עד טבעת השמש, העליונים נפתחים יחד', 2600); } catch (e) { /* */ }
      if (when === 'evening') { A.water = { from: S12.rings.sun, to: S12.rings.moon, t: 0 }; await X.wait(DA.EVE); if (A.ended) return null; }
      A.testWhen = when;
      for (const n of S.seats) A.live[n] = S12.seats[n].row === row;
      V.hiss(1);
      const R = D.test(S, when);
      for (const n of S.seats) if (A.live[n]) { const L = R.land[n]; splash(L.x, L.y, L.z); }
      if (R.all) { V.gold(); for (const i of S.stations) st3[i].flash = 1.6; }
      for (const i of R.dry) st3[i].dry = DA.SHOW + 1;
      await X.wait(DA.SHOW); V.hiss(0);
      for (const n of S.seats) A.live[n] = false; A.testWhen = null;
      return R;
    };
    for (const when of lv === 1 ? ['morning'] : ['morning', 'evening']) {
      const R = await show(when); if (!R || A.ended) return;
      if (R.dry.length) {
        ev('dry:' + when + ':' + R.dry.join(','));
        A.water = null; A.waterY = when === 'evening' ? S12.rings.moon : S12.rings.sun;
        try { X.line(R.fix.length ? 'עמדה נשארה יבשה: הדד שלה נפתח לתיקון' : 'עמדה נשארה יבשה', 2600); } catch (e) { /* */ }
        A.busy = 0; S.phase = 'place'; keep();
        if (!R.fix.length) { await done(); }
        return;
      }
    }
    await done();
  }
  async function done() {
    A.busy = 2; S.phase = 'done';
    const res = D.result(S), at = V3(X, K.x + 3, K.y0 + 2, K.z);
    if (res.bonus) extra(X, 40, lv, 'work', 'כל העמדות קיבלו');
    // (the spigots stay in the world as he aimed them)
    const sp = { ...(Mo.st.spigots || {}) };
    for (const n of S.seats) { const p = S.sp[n]; if (!p.placed) continue; sp[n] = { yaw: +p.yaw.toFixed(1), pitch: +p.pitch.toFixed(1), station: p.land ? p.land.station : null, zone: p.land ? p.land.zone : null }; }
    Mo.st.spigots = sp; X.save();
    Mo.keep(m.k, null);
    await finish(X, A, res, WORDS.dadim, at, { eye: [K.x + 9, K.y0 + 6, K.z + 7], aim: [K.x + 2.5, F + 1, K.z], secs: 1.4, kohen: true, after: () => { try { Mo.filmOver(); } catch (er) { /* */ } } });
  }
  function hintAim(n) { if (resumed) return; const q = D.mouthOf(S, n); X.hand({ x: q.x, y: q.y, z: q.z }, 0, 40); }
  function hint() { if (resumed || A.hintOn) return; A.hintOn = 1; X.hand({ x: bx, y: BY, z: bz }, 0, 40); }
  const curve = (n, when) => {
    const L = D.arc(S, n, { when }).land, q = D.mouthOf(S, n), v = D.speedOf(S, S12.seats[n].row, when), t = L.t;
    return { p0: [q.x, q.y, q.z], p1: [q.x + q.dx * v * t / 2, q.y + q.dy * v * t / 2, q.z + q.dz * v * t / 2], p2: [L.x, L.y, L.z], L };
  };
  function draw(dt) {
    poseAll();
    // the held spigot under the finger: on the seat it would snap to, else on the ground under the finger
    if (A.drag) {
      const g = spig[A.drag.n], n = A.drag.seat;
      if (n != null) { const q = seatPose(n, 0, 0, 0); g.position.set(q.x, q.y, q.z); g.rotation.set(0, q.ry, q.rz, 'YZX'); }
      else { const r = X.rayAt(A.drag.x, A.drag.y), o = r.ray.origin, d = r.ray.direction, t = d.y < -1e-3 ? (F + 1.2 - o.y) / d.y : 8; g.position.set(o.x + d.x * t, o.y + d.y * t, o.z + d.z * t); g.rotation.set(0, A.t, 0.3); }
      g.visible = true;
    }
    // the forced turn: past the edge for half a second scratches the seat
    if (A.aim && A.out) { A.force += dt; if (A.force >= D.DK.FORCE_T && D.scratch(S, A.aim.n)) { V.creak(); const s = S12.seats[A.aim.n]; hurt(X, Mo, 'dadim.scratch', V3(X, s.x, s.y, s.z), { lv, at: A.aim.n }); ev('scratch'); keep(); } } else A.force = 0;
    // the streams (the morning's: the live arc while aiming, a test's hour while testing)
    let any = 0;
    for (const n of S.seats) {
      const on = flowing(n) && S.sp[n].placed, st = streams[n];
      st.visible = on; if (!on) continue; any++;
      const c = curve(n, A.testWhen || 'morning'); st.userData.set(c.p0, c.p1, c.p2, S12.seats[n].row === 'down' && lv === 3 && A.testWhen === 'evening' ? 0.034 : 0.045);
      if (A.t % 0.25 < dt) splash(c.L.x, c.L.y, c.L.z, 0.6);
    }
    if (!A.testWhen) V.hiss(any ? 0.6 : 0);
    // the ghost: where the arc lands (level 1, and while the knob is not yet held)
    ghost.visible = !!A.aim; if (A.aim) { const L = D.arc(S, A.aim.n).land; ghost.position.set(L.x, L.y + 0.015, L.z); ghost.material = lv === 1 || !flowing(A.aim.n) ? Mt.y12splash : Mt.y12splash; }
    for (const q of A.rings) { if (q.t > 0.6) { q.r.visible = false; continue; } q.t += dt; const s = 1 + q.t * 5 * (q.k || 1); q.r.visible = true; q.r.scale.set(s, s, s); q.r.material.opacity = 0.8 * (1 - q.t / 0.6); }
    // the stations: the hands lit when a stream lands on them (gold), a soft light where this row still has none, red where dry
    const row = A.aim ? S12.seats[A.aim.n].row : null;
    for (const i of Object.keys(st3)) {
      const q = st3[i]; q.flash = Math.max(0, q.flash - dt); q.dry = Math.max(0, q.dry - dt);
      const want = row && S.stations.includes(+i) && !Object.values(S.sp).some((p) => p.locked && p.land && p.land.station === +i && S12.seats[p.n].row === row);
      const e = q.dry > 0 ? 0 : q.flash > 0 ? 1.2 : want ? 0.35 + 0.25 * Math.sin(A.t * 5) : 0.25;
      q.lit.emissive.set(q.dry > 0 ? '#802010' : '#FFD27A'); q.lit.emissiveIntensity = q.dry > 0 ? 0.9 : e;
    }
    // the knob of the held spigot pops out and lights (from level 2)
    if (SH12.refs && SH12.refs.knobs) SH12.refs.knobs.forEach((k, n) => { const on = lv > 1 && A.aim && A.aim.n === n; const held = on && A.knob; k.position.x = (k.userData.x0 != null ? k.userData.x0 : (k.userData.x0 = k.position.x)) - (on ? 0.22 : 0) + (held ? 0.08 : 0); k.material = on ? Mt.y12glow : Mt.y12woodL; });
    // the kiyor's water: the evening's descent to the moon ring
    const W = SH12.refs && SH12.refs.kiyor && SH12.refs.kiyor.userData.water;
    if (W) { let y = A.waterY || S12.rings.sun; if (A.water) { A.water.t += dt; const k = Math.min(1, A.water.t / DA.EVE); y = A.water.from + (A.water.to - A.water.from) * k; if (k >= 1) { A.waterY = A.water.to; A.water = null; } } W.position.y = y - K.y0; const r = SH12.refs.kiyor.userData.rIn(y); W.scale.set(r / SH12.refs.kiyor.userData.rIn(S12.rings.sun), r / SH12.refs.kiyor.userData.rIn(S12.rings.sun), 1); }
  }
  return {
    close: true, kohenWorks: true,
    begin() {
      FG.attach(); home(0.01);
      X.line(resumed ? '' : lv === 1 ? 'גררו דד מהסל למושב, ואז כוונו את הקשת אל הכפות החרוטות' : 'כוונו כל דד באצבע אחת, והחזיקו את הכפתור שקפץ במתלה כדי שהמים יזרמו', resumed ? 0 : 5000);
      try { addEventListener('keydown', onKey); addEventListener('keyup', onKey); } catch (e) { /* */ }
      try { X.stages.hero.place({ x: S12.dadimStand[0], z: S12.dadimStand[1], face: [K.x, K.z] }); } catch (e) { /* (the kohen by the basket, in the picture) */ }
      X.wait(0.9).then(() => { if (!A.ended) hint(); });
      ev(resumed ? 'resume' : 'begin'); keep();
      if (resumed && D.allLocked(S)) runTests();
    },
    update(dt) {
      A.t += dt;
      try { V.frame && V.frame(); draw(dt); if (A.t % 1 < dt) keep(); }
      catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h135] dadim', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
    },
    down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
    cancel() { if (A.aim) A.live[A.aim.n] = false; A.drag = null; A.aim = null; A.knob = null; keep(); },
    wants(p) { if (!p) return true; if (A.drag || A.aim) return true; return onBasket(p) || onSpigot(p) != null; },
    holds() { return !!(A.drag || A.aim || A.knob); },
    lensFov: DA.FOV,
    end() { A.ended = true; FG.detach(); V.hiss(0); V.hush(); X.hand(null); lens(X, fov0); try { removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); } catch (e) { /* */ } X.props.remove(root); SH12.hold = false; SH12.own.spigotsSkip = null; own('stations', false); if (SH12.refs && SH12.refs.knobs) SH12.refs.knobs.forEach((k) => { if (k.userData.x0 != null) k.position.x = k.userData.x0; k.material = Mt.y12woodL; }); },
    at() { return V3(X, K.x + 2.5, K.y0 + 1, K.z); },
    dbg() {
      const r2 = (v) => (Number.isFinite(v) ? +v.toFixed(2) : null);
      return { id: m.id, lv, phase: S.phase, basket: S.basket, first: S.first, seats: S.seats.map((n) => { const p = S.sp[n], q = mouthScr(n); return { n, placed: p.placed, locked: p.locked, yaw: r2(p.yaw), pitch: r2(p.pitch), grade: p.grade, fix: p.fix, mouth: [Math.round(q.x), Math.round(q.y)], seat: (() => { const s = seatScr(n); return [Math.round(s.x), Math.round(s.y)]; })() }; }),
        basketXY: (() => { const b = basketScr(); return [Math.round(b.x), Math.round(b.y)]; })(), steps: S.steps.length, flaws: S.flaws.length, tests: S.tests, busy: A.busy, finished: A.finished, aim: A.aim ? A.aim.n : null, knob: !!A.knob, ev: A.ev.slice(-12) };
    },
    /** the probes: aim a seated spigot exactly (yaw, pitch) */
    _aim(n, y, p) { return D.aim(S, n, y, p); }, _S: () => S,
  };
}
export const DADIM_ACT = { icon: '🚰', title: 'שנים עשר הדדים', walkLine: () => 'שנים עשר הדדים: אל הכיור, ליד הסל', stand() { return { x: S12.dadimStand[0], z: S12.dadimStand[1], face: [K.x, K.z] }; }, prepare() {}, make };
