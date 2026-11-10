/* ── build 109 ── h109/director.js — stage 01 "שיטוח ההר" played INSIDE the old moving world (the owner, 7.11 16:57: "אתה לא בונה
 * שום משחקון מחוץ לעולם הזה"; spec docs/specs/shlav-01-olam-yashan-he.md, approved 8.11 00:22).
 *
 * The director owns the Mount while it is built: one mission at a time opens at its place on the hill (a tall stake with a red
 * cloth, the old markers and the compass point to it); the kohen walks there with the left thumb (or the compass brings him); near
 * it he is drawn to its stand and the act begins IN the world — the camera takes the act's own fixed shot (never moving under the
 * finger), the thumbs are held, the finger touches the thing itself. The act ends with its result in the world, the old flash and
 * number for every success, the stars; the camera pulls back over what grew; the next mission opens somewhere else on the hill.
 * The Mount comes down sector by sector (stages.setStage('har', progress)), the crews work all round the whole time.
 *
 *   const D = createH109Director({ G, persist, emit, stages, view, ui, sfx, haptic, juice: () => JU, score: SCR, bonus(n, why, label),
 *     twin: () => TW, onDone(): the stage is built })
 *   D.owns() · D.acting() · D.start() · D.frame(ms) · D.marks() (twin's markers) · D.goal() (the compass) · D.goTo() · D.state()
 */
import * as THREE from 'three';
import { createH109, PLAN, PLACES, H109, starsOf, GRADE_N } from './model.js';
import { createProps } from './props.js';
import { ACTS } from './acts.js';
import { finale01 } from './acts3.js';   // ── h115 ── ── /h115 ──
import { lookZone, WHEEL_STEP, pinchU } from './look.js';   // ── h117 ── ── /h117 ──

const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const ease = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));

// ── h111 ── (build 111) the same director plays stage 02 "חומת העזרה" (h111/pack.js): a stage is a pack — its plan, its save, its acts,
// how the world shows its progress, what closes a unit, the night between its levels, its end film. Stage 01's pack is the default.
const PACK01 = {
  id: 'har', key: 'h109', PLAN, create: createH109, ACTS, crews: ['har', 3, [0, 1, 2]], icon: '⛏',
  endTitle: 'שיטוח ההר נבנה!', endSub: 'הר הבית חמש מאות אמה על חמש מאות אמה (מדות ב, א)',
  // ── h115 ── the end film on the stage's own places (grid.js BOOK): the Mount from high; the kohen's nine cells cut and paved (x −73..2,
  // z −58.5..16.5) with the waste pits east of them; the corner stone at the real south-east corner, from outside the wall and low,
  // then rising up the wall from it; the great stone; the inscription's corner; the Mount from high again ── /h115 ──
  film: [[[60, 260, 520], [0, 0, -40], 3.0], [[60, 55, 70], [-30, -4, -21], 2.8], [[306, -36, 372], [277, -46, 399], 2.2], [[322, 14, 352], [277, -12, 398], 2.4], [[-200, 60, -260], [-280, 10, -150], 2.4], [[-352, 62, 456], [-296, 38, 396], 2.4], [[180, 300, 620], [27, 0, 66], 1.4]],
  finale: (X) => finale01(X),
};
// ── /h111 ──
export function createH109Director(o) {
  const PK = o.pack || PACK01, ACTS = PK.ACTS, PLAN = PK.PLAN;   // ── h111 ── ── /h111 ──
  const S0 = o.stages, view = o.view, ui = o.ui;
  const G = () => (typeof o.G === 'function' ? o.G() : o.G);
  const save = () => { try { o.persist && o.persist(); } catch (e) { /* the game's */ } };
  const emit = (t, d) => { try { o.emit && o.emit(t, d); } catch (e) { /* */ } };
  const log = (...a) => { try { const L = globalThis.__H109_LOG || (globalThis.__H109_LOG = []); L.push(a.join(' ')); if (L.length > 300) L.splice(0, L.length - 300); } catch (e) { /* */ } };
  let M = null, P = null, started = false, act = null, mission = null, phase = 'off', tPhase = 0, film = null, lastMs = 0, hidden = false;
  // one minigame only (ירון 8.11: "קישור יעודי לכל אחד מהמשחקונים"): a page baked with window.__H109_ONLY = 'read' (or ?only=read / #only=read)
  // opens straight on that minigame's first mission, and after each act goes to its next one; after the last, the page starts over
  const ONLY = (() => {
    try {
      const q = globalThis.__H109_ONLY || (String(globalThis.__QS56 || location.search || '') + String(globalThis.__QH56 || location.hash || '')).match(/[?&#]only=(\w+)/)?.[1];
      return q && PLAN.some((m) => m.k === q) ? q : null;
    } catch (e) { return null; }
  })();
  function onlyNext() {
    if (!ONLY || !M) return;
    if (M.autoTo) { if (ONLY === 'waste') M.st.waste = Math.max(M.st.waste | 0, 6); if (!M.mission() || M.mission().k !== ONLY) M.autoTo((m) => m.k === ONLY); return; }   // ── h114 ── ── /h114 ──
    while (M.mission() && M.mission().k !== ONLY) { if (ONLY === 'waste') M.st.waste = Math.max(M.st.waste | 0, 6); M.done({ stars: 2 }); }
    if (ONLY === 'waste') M.st.waste = Math.max(M.st.waste | 0, 6);
  }
  const scene = S0.scene, camera = S0.camera;
  const ground = (x, z) => S0.groundAt(x, z);
  const hero = S0.hero;
  const HP = { x: 0, y: 0, z: 0 };
  const heroAt = () => S0.heroXYZ(HP);

  /* ───────── the camera: one fixed shot per act, eased; films (the opening, the pull-back) ───────── */
  const CAM = { on: false, p: new THREE.Vector3(), t: new THREE.Vector3(), p0: new THREE.Vector3(), t0: new THREE.Vector3(), p1: new THREE.Vector3(), t1: new THREE.Vector3(), u: 1, dur: 0.8 };
  const cq = {};
  function shot(p, t, dur = 0.8) {
    view.camNow(cq); CAM.p0.set(cq.px, cq.py, cq.pz); CAM.t0.set(cq.tx, cq.ty, cq.tz);
    CAM.p1.set(p[0], p[1], p[2]); CAM.t1.set(t[0], t[1], t[2]); CAM.u = dur > 0 ? 0 : 1; CAM.dur = Math.max(0.01, dur); CAM.on = true; CAM.chase = 0;
  }
  // ── h114 ── (ירון 9.11: "המסך קופץ 10 שניות") a follow shot: called every frame with where the camera should be, it never restarts the
  // ease (a shot() every frame did, and the picture jumped); the first call eases in, then the camera chases the moving aim smoothly ── /h114 ──
  function track(p, t, rate = 2.5, dur = 0.9) {
    if (!CAM.on || !CAM.chase) { shot(p, t, dur); CAM.chase = rate; return; }
    CAM.p1.set(p[0], p[1], p[2]); CAM.t1.set(t[0], t[1], t[2]); CAM.chase = rate;
  }
  /** a ¾ work shot (spec ש3): from the kohen's side and behind, the object to the right of the screen centre, the kohen in the left third */
  function workShot(obj, stand, o2 = {}) {
    const dist = o2.dist || 13, el = (o2.el || 30) * Math.PI / 180, side = o2.side == null ? -0.55 : o2.side;
    const fx = obj.x - stand.x, fz = obj.z - stand.z, L = Math.hypot(fx, fz) || 1, ux = fx / L, uz = fz / L;
    // the camera behind the kohen and to his right, looking at a point between him and the object (a little toward the object)
    const mx = stand.x + fx * 0.62, mz = stand.z + fz * 0.62, my = (o2.ty != null ? o2.ty : Math.max(ground(stand.x, stand.z), ground(obj.x, obj.z)) + (o2.lift || 1.6));
    const bx = -ux * Math.cos(side) + uz * Math.sin(side), bz = -uz * Math.cos(side) - ux * Math.sin(side);
    const px = mx + bx * dist * Math.cos(el), pz = mz + bz * dist * Math.cos(el), py = my + dist * Math.sin(el);
    return { p: [px, py, pz], t: [mx, my, mz] };
  }
  function camStep(dt) {
    if (!CAM.on) return;
    if (CAM.chase && CAM.u >= 1) { const k = 1 - Math.exp(-dt * CAM.chase); CAM.p.lerp(CAM.p1, k); CAM.t.lerp(CAM.t1, k); }   // ── h114 ── ── /h114 ──
    else { CAM.u = Math.min(1, CAM.u + dt / CAM.dur); const k = ease(CAM.u); CAM.p.lerpVectors(CAM.p0, CAM.p1, k); CAM.t.lerpVectors(CAM.t0, CAM.t1, k); }
    // ── h115 ── the right thumb's look (rule 61): the act's shot turned round its aim and lifted toward the horizon ── /h115 ──
    let lx = CAM.p.x, ly = CAM.p.y, lz = CAM.p.z;
    if (LOOK.u > 1e-3 || Math.abs(LOOK.yaw) > 1e-3) {
      const vx = lx - CAM.t.x, vy = ly - CAM.t.y, vz = lz - CAM.t.z, h0 = Math.hypot(vx, vz) || 1, d0 = Math.hypot(h0, vy);
      const c = Math.cos(LOOK.yaw), s = Math.sin(LOOK.yaw), hx = (vx * c - vz * s) / h0, hz = (vx * s + vz * c) / h0;
      const el0 = Math.atan2(vy, h0), el = el0 + (0.14 - el0) * LOOK.u, d = d0 * (1 + 3.2 * LOOK.u) + 40 * LOOK.u;
      lx = CAM.t.x + hx * d * Math.cos(el); ly = CAM.t.y + d * Math.sin(el); lz = CAM.t.z + hz * d * Math.cos(el);
    }
    view.camSet(lx, ly, lz, CAM.t.x, CAM.t.y, CAM.t.z);
    // ── h112 ── (before each render OrbitControls keeps the camera its minDistance from the target and main.js clampCam lifts it to the
    // Mount's floor: the same here, or a touch's ray and project() would be of another camera than the frame shown) ── /h112 ──
    try {
      const p = camera.position, md = view.minDist ? view.minDist() : 0, d = p.distanceTo(CAM.t);
      if (md > 0 && d < md && d > 1e-6) p.sub(CAM.t).multiplyScalar(md / d).add(CAM.t);
      const fl = S0.camFloor ? S0.camFloor(p.x, p.z) : null; if (Number.isFinite(fl) && p.y < fl) p.y = fl;
    } catch (e) { /* */ }
    try { camera.lookAt(CAM.t); camera.updateMatrixWorld(); } catch (e) { /* the controls turn it at the render */ }   // (the touch's ray and project() agree in this frame)
  }

  /* ───────── ── h115 ── the right thumb (brief §camera, rule 61; ירון 10.11: "אגודל ימין ... גם בתוך הזום-אין"): during an act a
     drag that starts on the right half of the screen where the act does not want the touch (act.wants(p) false), or any drag with
     the right mouse button, turns the camera round the work and lowers it toward the horizon, pulling back: he sees the city, the
     Mount and where he is. (ירון 10.11: no beam of light over the work: "הפס הצהוב שמגיע עד הרקיע" is gone.) The act waits while the camera is away (nothing is lost).
     Let go and the camera stays; the next touch brings it back to the work (0.45 s) and is not passed on. A right-half touch that
     does not move is passed to the act as a tap on release (the act did not want it held: wants() said so). Acts without wants(): the mouse only.
     No grid is drawn (ירון 10.11: "אין רשתות"). ── ───────── */
  const LOOK = { id: null, drag: false, pend: null, x0: 0, y0: 0, yaw: 0, u: 0, yaw0: 0, u0: 0, away: false, back: 0 };
  // ── h117 ── (ירון 10.11: play on while a little zoomed out) the act waits only when the camera is out of the play zone ── /h117 ──
  const lookOff = () => LOOK.drag || LOOK.away || LOOK.back > 0 || !!LOOK.pinch;
  const lookAway = () => lookOff() && lookZone(LOOK.u, LOOK.yaw) !== 'play';
  const lookSet = () => { LOOK.away = LOOK.u > 0.02 || Math.abs(LOOK.yaw) > 0.03; if (!LOOK.away && !LOOK.drag && !LOOK.pinch) { LOOK.yaw = 0; LOOK.u = 0; } };
  function lookCandidate(e) {
    if (e.pointerType === 'mouse') return e.button === 2 ? 'look' : null;
    if (e.clientX < innerWidth * 0.5 || !act || typeof act.wants !== 'function') return null;
    return call(act.wants, { x: e.clientX, y: e.clientY }) ? null : 'pend';
  }
  function lookStart(id, x, y) { LOOK.id = id; LOOK.drag = true; LOOK.pend = null; LOOK.away = false; LOOK.back = 0; LOOK.x0 = x; LOOK.y0 = y; LOOK.yaw0 = LOOK.yaw; LOOK.u0 = LOOK.u; log('look'); emit('h109look', { on: true }); }
  /** the pending right-half touch handed to the act as its own (a hold, or a tap on release) */
  function lookHand(tapUp) {
    const P = LOOK.pend; LOOK.pend = null; LOOK.id = null; if (!P || !act) return;
    log('look→act', tapUp ? 'tap' : 'hold', Math.round(performance.now() - P.t0));
    ptr.id = P.id; ptr.down = true; ptr.x = ptr.x0 = P.x0; ptr.y = ptr.y0 = P.y0; ptr.t0 = P.t0;
    call(act.down, ptr); hintSeen();
    if (tapUp) { ptr.down = false; ptr.x = tapUp.x; ptr.y = tapUp.y; call(act.up, ptr); }
  }
  function lookFrame(dt) {
    if (LOOK.back > 0) {
      LOOK.back = Math.max(0, LOOK.back - dt); const k = LOOK.back > 0 ? 1 - Math.exp(-dt * 9) : 1; LOOK.yaw -= LOOK.yaw * k; LOOK.u -= LOOK.u * k;
      if (!LOOK.back) { LOOK.yaw = 0; LOOK.u = 0; LOOK.away = false; emit('h109look', { on: false }); }
    }
  }
  function lookReset() { LOOK.id = null; LOOK.drag = false; LOOK.pend = null; LOOK.away = false; LOOK.back = 0; LOOK.yaw = 0; LOOK.u = 0; LOOK.pinch = null; }
  addEventListener('contextmenu', (e) => { if (act && phase === 'act') e.preventDefault(); }, { capture: true });
  // ── /h115 ──

  /* ───────── the touch on the world (during an act only) ───────── */
  const canvas = () => document.getElementById('c') || document.querySelector('canvas');
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const ptr = { id: null, x: 0, y: 0, x0: 0, y0: 0, t0: 0, down: false };
  function rayAt(x, y) { try { camera.updateMatrixWorld(); if (PROPS) PROPS.root.updateMatrixWorld(true); } catch (e) { /* */ } ndc.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); return ray; }
  /** the screen point of a world point → {x, y, on} (a fresh object) */
  function scr(x, y, z) { const q = view.project(x, y, z); return { x: q.x, y: q.y, on: q.on }; }
  const hudEl = (e) => !!(e && e.closest && e.closest('.gm-top,.gm-tabs,.gm-menu,.gm-modal,button,.h109-ui'));
  /* ───────── ── h114 ── the zoom-out (ירון 9.11: "אני כן רוצה יכולת לצאת בזום אאוט ולראות את העולם אם בא לי. בכל המשחקונים בכל
     השלבים"): during any act, the mouse wheel back or two fingers pinching in lift the camera over the Mount; the act waits as it is
     (nothing is lost); the world is free to turn and zoom (OrbitControls); "↩ חזרה לעבודה", the wheel forward close in, or Esc, bring
     the camera down to the very shot he left, and the act goes on. ── ───────── */
  const OV = { on: false, p: null, t: null, d0: 0, pins: new Map(), pin0: new Map(), pd0: 0, close: false, back: 0 };
  function ovEnter(why) {
    if (OV.on || !act || phase !== 'act' || ending) return;
    if (ptr.down) { ptr.down = false; if (typeof act.cancel === 'function') call(act.cancel); else call(act.up, ptr); }
    OV.on = true; OV.back = 0;
    view.camNow(cq); OV.p = CAM.on ? CAM.p1.clone() : new THREE.Vector3(cq.px, cq.py, cq.pz); OV.t = CAM.on ? CAM.t1.clone() : new THREE.Vector3(cq.tx, cq.ty, cq.tz);
    // (high over the Mount, from the side he looked from, the work still in the frame)
    const at = act.at ? act.at() : null, c = at ? new THREE.Vector3(at.x, at.y, at.z) : OV.t.clone();
    const M0 = new THREE.Vector3(27, 0, 66), tg = c.clone().lerp(M0, 0.45); tg.y = 0;
    const dx = cq.px - cq.tx, dz = cq.pz - cq.tz, L = Math.hypot(dx, dz) || 1;
    const P1 = [tg.x + (dx / L) * 520, 360, tg.z + (dz / L) * 520];
    OV.d0 = Math.hypot(P1[0] - tg.x, P1[1] - tg.y, P1[2] - tg.z);
    OV.close = false; try { if (act.close && view.closeCam) { view.closeCam(false, 'h109'); OV.close = true; } } catch (e) { /* */ }
    shot(P1, [tg.x, tg.y, tg.z], 1.1);
    OV.free = performance.now() + 1150;
    uiMount(); UI.ovb.classList.add('on'); UI.line.classList.add('h109-hide');
    if (HINT.on) UI.hand.classList.add('off');
    try { props().marker(at ? { x: at.x, z: at.z } : null); } catch (e) { /* */ }
    X.play('swoosh'); log('overview', why);
    emit('h109overview', { on: true, why });
  }
  function ovLeave(why) {
    if (!OV.on) return;
    OV.on = false; OV.free = 0;
    try { if (OV.close && view.closeCam) view.closeCam(true, 'h109'); } catch (e) { /* */ }
    if (OV.p && act) shot([OV.p.x, OV.p.y, OV.p.z], [OV.t.x, OV.t.y, OV.t.z], 0.9);
    UI.ovb.classList.remove('on'); UI.line.classList.remove('h109-hide');
    if (HINT.on) UI.hand.classList.remove('off');
    try { props().marker(null); } catch (e) { /* */ }
    log('overview off', why); emit('h109overview', { on: false, why });
  }
  function ovFrame() {
    if (!OV.on) return;
    // the fly out done: the world is his to turn (OrbitControls); closing in on it again brings him back to the work
    if (OV.free && performance.now() > OV.free) { OV.free = 0; CAM.on = false; }
    if (!CAM.on && !OV.free) { view.camNow(cq); const d = Math.hypot(cq.px - cq.tx, cq.py - cq.ty, cq.pz - cq.tz); if (d < OV.d0 * 0.3) ovLeave('zoom-in'); }
  }
  addEventListener('wheel', (e) => {
    if (!act || phase !== 'act') return;
    // ── h117 ── the wheel pulls the camera back a step at a time (the act plays on inside the play zone); past the last step: the
    // overview as before ── /h117 ──
    if (OV.on || !e.deltaY) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (e.deltaY > 0 && LOOK.u >= 1 - 1e-6) { ovEnter('wheel'); return; }
    LOOK.back = 0; LOOK.u = clamp(LOOK.u + Math.sign(e.deltaY) * WHEEL_STEP, 0, 1); lookSet();
  }, { capture: true, passive: false });
  addEventListener('keydown', (e) => { if (OV.on && e.key === 'Escape') ovLeave('esc'); });
  function bothClose() {
    const K = [...OV.pins.keys()]; if (K.length !== 2) return false;
    const s = K.map((k) => OV.pin0.get(k)), c = K.map((k) => OV.pins.get(k)); if (!s[0] || !s[1]) return false;
    for (let i = 0; i < 2; i++) { const o = s[1 - i], ux = o[0] - s[i][0], uy = o[1] - s[i][1], L = Math.hypot(ux, uy) || 1; if (((c[i][0] - s[i][0]) * ux + (c[i][1] - s[i][1]) * uy) / L < OV.pd0 * 0.1) return false; }
    return true;
  }
  /** ── h117 ── both fingers moving away from each other (the mirror of bothClose) ── /h117 ── */
  function bothApart() {
    const K = [...OV.pins.keys()]; if (K.length !== 2) return false;
    const s = K.map((k) => OV.pin0.get(k)), c = K.map((k) => OV.pins.get(k)); if (!s[0] || !s[1]) return false;
    for (let i = 0; i < 2; i++) { const o = s[1 - i], ux = o[0] - s[i][0], uy = o[1] - s[i][1], L = Math.hypot(ux, uy) || 1; if (-((c[i][0] - s[i][0]) * ux + (c[i][1] - s[i][1]) * uy) / L < OV.pd0 * 0.06) return false; }
    return true;
  }
  function onPtr(e) {
    // ── h114 ── two fingers on the world during an act: a pinch in lifts to the overview ── /h114 ──
    if (act && phase === 'act' && e.pointerType === 'touch') {
      if (e.type === 'pointerdown' && !hudEl(e.target)) { OV.pins.set(e.pointerId, [e.clientX, e.clientY]); if (OV.pins.size === 2) { const [a, b] = [...OV.pins.values()]; OV.pd0 = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1; OV.pin0 = new Map([...OV.pins].map(([k, v]) => [k, v.slice()])); } }
      else if (e.type === 'pointermove' && OV.pins.has(e.pointerId)) {
        OV.pins.set(e.pointerId, [e.clientX, e.clientY]);
        // (a pinch is both fingers closing on each other: a finger that holds while the other slides — the lock's key, the lintel's end, a
        //  batten held for its peg — is the work's own two-finger move, not a pinch)
        // ── h117 ── two fingers closing pull the camera back, opening bring it in, continuously; the act plays on inside the play zone;
        // past the farthest: the overview ── /h117 ──
        if (OV.pins.size === 2 && !OV.on) {
          const [a, b] = [...OV.pins.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
          if (!LOOK.pinch && ((d < OV.pd0 * 0.88 && bothClose()) || (d > OV.pd0 * 1.14 && bothApart()))) {
            if (ptr.down) { ptr.down = false; if (typeof act.cancel === 'function') call(act.cancel); else call(act.up, ptr); }
            LOOK.id = null; LOOK.pend = null; LOOK.drag = false; LOOK.back = 0;
            LOOK.pinch = { u0: LOOK.u, d0: d }; log('pinch');
          }
          if (LOOK.pinch) { const u = pinchU(LOOK.pinch.u0, LOOK.pinch.d0, d); if (u > 1.08) { LOOK.pinch = null; ovEnter('pinch'); } else LOOK.u = clamp(u, 0, 1); }
        }
      } else if (e.type === 'pointerup' || e.type === 'pointercancel') { OV.pins.delete(e.pointerId); OV.pin0.delete(e.pointerId); if (LOOK.pinch) { LOOK.pinch = null; lookSet(); LOOK.swallow = OV.pins.size ? [...OV.pins.keys()][0] : null; } }
      if (OV.pins.size >= 2 && !OV.on && ptr.down && e.pointerId !== ptr.id) return;   // (the second finger is the pinch's)
      if (LOOK.pinch && OV.pins.has(e.pointerId)) { e.stopImmediatePropagation(); return; }   // ── h117 ── (both fingers are the pinch's) ── /h117 ──
    }
    if (OV.on) { if (e.type === 'pointerdown') globalThis.__TW_GEST = performance.now(); return; }   // (the world's own: turn, zoom; a tap picks nothing)
    // (a finger lifted after its act ended — the act's last beat, the film — still frees the touch: else every later touch is lost)
    if ((e.type === 'pointerup' || e.type === 'pointercancel') && ptr.down && e.pointerId === ptr.id && (!act || phase !== 'act')) { ptr.down = false; return; }
    if (!act || phase !== 'act') return;
    const c = canvas();
    // ── h115 ── the right thumb's look ── /h115 ──
    if (LOOK.id != null && e.pointerId === LOOK.id) {
      e.stopImmediatePropagation(); e.preventDefault();
      if (LOOK.pend) {
        if (e.type === 'pointermove' && Math.hypot(e.clientX - LOOK.pend.x0, e.clientY - LOOK.pend.y0) > 12) lookStart(e.pointerId, LOOK.pend.x0, LOOK.pend.y0);
        else if (e.type === 'pointerup') lookHand({ x: e.clientX, y: e.clientY });
        else if (e.type === 'pointercancel') { LOOK.pend = null; LOOK.id = null; }
        if (!LOOK.drag) return;
      }
      if (e.type === 'pointermove') { LOOK.yaw = clamp(LOOK.yaw0 - ((e.clientX - LOOK.x0) / innerWidth) * 3.2, -2.8, 2.8); LOOK.u = clamp(LOOK.u0 + ((e.clientY - LOOK.y0) / innerHeight) * 1.8, 0, 1); }
      else if (e.type === 'pointerup' || e.type === 'pointercancel') { LOOK.id = null; LOOK.drag = false; lookSet(); }
      return;
    }
    if (e.type === 'pointerdown') {
      log('ptr', e.target && (e.target.id || e.target.className || e.target.tagName), Math.round(e.clientX), Math.round(e.clientY), ptr.down ? 'busy' : '');
      if (hudEl(e.target)) return;
      if (e.target !== c && !(e.target && e.target.classList && e.target.classList.contains('h109-touch'))) return;
      if (!ptr.down && LOOK.id == null && !ending) {
        const lc = lookCandidate(e);
        if (lc === 'look') { e.stopImmediatePropagation(); e.preventDefault(); lookStart(e.pointerId, e.clientX, e.clientY); return; }
        // (the camera away: this touch brings it back to the work and is not the act's)
        if (LOOK.away && !LOOK.back && lookZone(LOOK.u, LOOK.yaw) !== 'play') { e.stopImmediatePropagation(); e.preventDefault(); LOOK.back = 0.45; LOOK.swallow = e.pointerId; return; }
        if (lc === 'pend') { e.stopImmediatePropagation(); e.preventDefault(); LOOK.id = e.pointerId; LOOK.pend = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now() }; return; }
      }
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (ptr.down) return;
      ptr.id = e.pointerId; ptr.down = true; ptr.x = ptr.x0 = e.clientX; ptr.y = ptr.y0 = e.clientY; ptr.t0 = performance.now();
      e.stopImmediatePropagation(); e.preventDefault();
      call(act.down, ptr);
      hintSeen();
      return;
    }
    if (LOOK.swallow != null && e.pointerId === LOOK.swallow) { e.stopImmediatePropagation(); if (e.type !== 'pointermove') LOOK.swallow = null; return; }   // ── h115 ── ── /h115 ──
    if (!ptr.down || e.pointerId !== ptr.id) return;
    e.stopImmediatePropagation();
    if (e.type === 'pointermove') { ptr.x = e.clientX; ptr.y = e.clientY; call(act.move, ptr); return; }
    ptr.down = false; ptr.x = e.clientX; ptr.y = e.clientY; call(act.up, ptr);
  }
  const call = (f, a, b) => { if (typeof f !== 'function') return undefined; try { return f(a, b); } catch (e) { console.warn('[h109]', e && e.message, e && e.stack && e.stack.split('\n')[1]); return undefined; } };
  for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) window.addEventListener(t, onPtr, true);

  /* ───────── the screen: one short line, the hand-hint, the streak chip ───────── */
  const UI = {};
  function uiMount() {
    if (UI.root) return;
    const st = document.createElement('style');
    st.textContent = `
.h109-ui{position:fixed;pointer-events:none;z-index:57;direction:rtl;font-family:Heebo,system-ui,sans-serif}
.h109-line{left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:rgba(28,20,10,.84);color:#FFF6DA;font:800 17px/1.25 Heebo,system-ui;padding:9px 18px;border-radius:16px;box-shadow:0 3px 10px rgba(0,0,0,.35);white-space:nowrap;transition:opacity .25s}
.h109-line.off{opacity:0}
.h109-hand{width:54px;height:54px;margin:-8px 0 0 -14px;font-size:44px;line-height:54px;filter:drop-shadow(0 3px 4px rgba(0,0,0,.45));transition:opacity .2s;animation:h109bob .9s ease-in-out infinite alternate}
.h109-hand.off{opacity:0;animation:none}
@keyframes h109bob{from{transform:translate(0,0)}to{transform:translate(var(--hx,0px),var(--hy,10px))}}
.h109-chip{display:flex;align-items:center;gap:6px;padding:4px 12px 4px 10px;border-radius:18px;background:rgba(255,248,228,.92);color:#5A3A0A;font:900 17px/1 Heebo,system-ui;box-shadow:0 2px 6px rgba(0,0,0,.18);pointer-events:none;transition:transform .15s}
.h109-chip i{font-style:normal;font-size:18px;filter:saturate(.2) opacity(.55);transition:filter .2s,transform .2s}
.h109-chip.hot i{filter:none;transform:scale(1.25)}
.h109-chip small{font:700 11px/1 Heebo,system-ui;color:#8A6A3A;margin-inline-start:4px}
.h109-chip.pop{transform:scale(1.18)}
.h109-qetz{left:50%;top:30%;transform:translate(-50%,-50%) scale(.6);opacity:0;font:900 44px/1 Heebo,system-ui;color:#FFD66E;text-shadow:0 0 3px #6A4204,0 0 3px #6A4204,0 4px 14px #000a;transition:opacity .15s,transform .25s cubic-bezier(.2,1.6,.4,1)}
.h109-qetz.on{opacity:1;transform:translate(-50%,-50%) scale(1)}
.h109-loss{transform:translate(-50%,-50%) scale(.7);opacity:0;display:flex;flex-direction:column;align-items:center;gap:2px;transition:opacity .2s,transform .5s cubic-bezier(.2,1.5,.4,1);z-index:60}
.h109-loss.on{opacity:1;transform:translate(-50%,-110%) scale(1)}
.h109-loss b{font:900 40px/1 Heebo,system-ui;color:#FF6B57;text-shadow:0 0 3px #4A0E06,0 0 3px #4A0E06,0 4px 12px #000a}
.h109-loss span{font:800 16px/1.2 Heebo,system-ui;color:#FFF0E8;background:rgba(74,14,6,.78);padding:4px 10px;border-radius:10px}
.h109-loss small{font:800 13px/1 Heebo,system-ui;color:#FFD9CF;text-shadow:0 1px 3px #000}
.gm-sc.h109-hurt{animation:h109hurt .6s ease}
@keyframes h109hurt{0%,100%{transform:none;filter:none}20%{transform:translateX(-4px);filter:hue-rotate(-40deg) saturate(2)}50%{transform:translateX(4px)}75%{transform:translateX(-2px)}}
.h109-meter{width:150px;height:14px;border-radius:8px;background:rgba(28,20,10,.55);border:2px solid rgba(255,236,190,.8);overflow:hidden;transform:translate(-50%,-50%)}
.h109-meter b{display:block;height:100%;width:0;background:linear-gradient(90deg,#7FB5E8,#3E7FC0)}
.h109-meter.off{display:none}
.h109-count{transform:translate(-50%,-50%);font:900 22px/1 Heebo,system-ui;color:#FFF6DA;text-shadow:0 0 3px #2A1804,0 0 3px #2A1804,0 3px 8px #000a;white-space:nowrap}
.h109-count.off{display:none}
.h109-rot{left:0;right:0;top:0;bottom:0;background:#2A2016;color:#FFF6DA;display:none;align-items:center;justify-content:center;flex-direction:column;gap:14px;font:800 22px/1.3 Heebo,system-ui;pointer-events:auto;z-index:90}
.h109-rot b{font-size:64px;animation:h109turn 1.6s ease-in-out infinite}
@keyframes h109turn{0%,30%{transform:rotate(0)}60%,100%{transform:rotate(-90deg)}}
@media (orientation:portrait){.h109-rot.want{display:flex}}
.gm.h109-own .tw-pad{display:none!important}
.h109-line.h109-hide{opacity:0}
.h109-ovb{left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translateX(-50%) scale(.9);opacity:0;pointer-events:none;background:#FFF6DA;color:#3A2608;border:0;font:900 18px/1 Heebo,system-ui;padding:12px 22px;border-radius:22px;box-shadow:0 4px 14px rgba(0,0,0,.4);transition:opacity .2s,transform .2s;cursor:pointer}
.h109-ovb.on{opacity:1;pointer-events:auto;transform:translateX(-50%) scale(1)}
.h109-ovt{left:50%;top:calc(64px + env(safe-area-inset-top,0px));transform:translateX(-50%);background:rgba(28,20,10,.72);color:#FFF6DA;font:800 14px/1.2 Heebo,system-ui;padding:6px 14px;border-radius:12px;opacity:0;transition:opacity .2s;white-space:nowrap}
.h109-ovb.on ~ .h109-ovt{opacity:1}
.h109-lkb{right:calc(14px + env(safe-area-inset-right,0px));bottom:calc(74px + env(safe-area-inset-bottom,0px));opacity:0;pointer-events:none;background:rgba(255,246,218,.94);color:#3A2608;border:0;font:900 15px/1 Heebo,system-ui;padding:10px 14px;border-radius:18px;box-shadow:0 3px 10px rgba(0,0,0,.35);transition:opacity .2s;cursor:pointer}
.h109-lkb.on{opacity:1;pointer-events:auto}
.h109-wait{left:50%;top:calc(64px + env(safe-area-inset-top,0px));transform:translateX(-50%);background:rgba(28,20,10,.78);color:#FFF6DA;font:800 15px/1.2 Heebo,system-ui;padding:7px 16px;border-radius:12px;opacity:0;transition:opacity .2s;white-space:nowrap}
.h109-wait.on{opacity:1}
body.h109-act .gm .tw-zone{opacity:0!important}
.h109-pf{left:0;top:0;right:0;bottom:0;z-index:95;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;pointer-events:auto;overflow:hidden;opacity:0;transition:opacity .25s;background:radial-gradient(circle at 50% 46%,rgba(255,236,160,.96) 0,rgba(255,196,64,.9) 26%,rgba(178,96,8,.88) 62%,rgba(58,28,2,.93) 100%)}
.h109-pf.on{opacity:1}
.h109-pf .r{position:absolute;left:50%;top:46%;width:220vmax;height:220vmax;margin:-110vmax 0 0 -110vmax;background:repeating-conic-gradient(rgba(255,250,220,.2) 0 7deg,transparent 7deg 18deg);animation:h109spin 9s linear infinite}
@keyframes h109spin{to{transform:rotate(360deg)}}
.h109-pf b{position:relative;font:900 min(22vmin,150px)/1 Heebo,system-ui;color:#FFFBEA;-webkit-text-stroke:3px #6A3A00;paint-order:stroke fill;text-shadow:0 0 18px #7A4A00,0 8px 30px rgba(60,25,0,.8);transform:scale(.3);animation:h109pop .7s cubic-bezier(.2,1.6,.35,1) forwards}
.h109-pf i{position:relative;font:normal min(11vmin,72px)/1 system-ui;letter-spacing:.12em;color:#FFE27A;text-shadow:0 0 14px #FFF2B0,0 4px 10px rgba(80,30,0,.6);opacity:0;animation:h109pop .6s .35s cubic-bezier(.2,1.6,.35,1) forwards}
.h109-pf span{position:relative;font:800 min(5vmin,28px)/1.3 Heebo,system-ui;color:#3A2002;background:rgba(255,248,224,.86);padding:6px 18px;border-radius:16px;opacity:0;animation:h109fade .4s .6s forwards}
.h109-pf u{position:absolute;left:50%;top:46%;width:12px;height:12px;border-radius:50%;background:#FFF6C8;box-shadow:0 0 10px #FFE070;text-decoration:none;animation:h109fly 1.5s ease-out forwards}
@keyframes h109pop{0%{transform:scale(.3);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes h109fade{to{opacity:1}}
@keyframes h109fly{0%{transform:translate(-50%,-50%) scale(.4);opacity:1}100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(1.2);opacity:0}}
`;
    document.head.appendChild(st);
    const mk = (cls, html = '') => { const e = document.createElement('div'); e.className = 'h109-ui ' + cls; e.innerHTML = html; document.body.appendChild(e); return e; };
    UI.root = true;
    UI.line = mk('h109-line off');
    UI.hand = mk('h109-hand off', '👆');
    UI.qetz = mk('h109-qetz', 'קצב!');
    UI.meter = mk('h109-meter off', '<b></b>');
    UI.count = mk('h109-count off');
    UI.rot = mk('h109-rot', '<b>📱</b><span>סובבו את הטלפון לרוחב</span>');
    // ── h114 ── the overview's way back (a button of the screen, not of the work: the work is touched in the world) ── /h114 ──
    UI.ovb = document.createElement('button'); UI.ovb.type = 'button'; UI.ovb.className = 'h109-ui h109-ovb'; UI.ovb.textContent = '↩ חזרה לעבודה';
    UI.ovb.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); ovLeave('button'); }); document.body.appendChild(UI.ovb);
    UI.ovt = mk('h109-ovt', 'מבט על · סובבו וגללו לראות את העולם');
    // ── h117 ── the way back from a look-around, and the word when the act waits ── /h117 ──
    UI.lkb = document.createElement('button'); UI.lkb.type = 'button'; UI.lkb.className = 'h109-ui h109-lkb'; UI.lkb.textContent = '↩ מבט רגיל';
    UI.lkb.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); if (lookOff() || LOOK.u || LOOK.yaw) { LOOK.drag = false; LOOK.pinch = null; LOOK.back = 0.45; } }); document.body.appendChild(UI.lkb);
    UI.wait = mk('h109-wait', 'המשחק ממתין · התקרבו כדי להמשיך');
    // the streak chip in the top bar, beside the score capsule (the old cubes stay as they are)
    UI.chip = document.createElement('div'); UI.chip.className = 'h109-chip'; UI.chip.innerHTML = '<i>🔥</i><span>0</span><small></small>';
    placeChip();
  }
  function placeChip() {
    const top = document.querySelector('.gm-top'); if (!top || !UI.chip) return;
    const sc = top.querySelector('.gm-sc'); const host = (sc && sc.parentNode) || top;
    if (UI.chip.parentNode !== host) { if (sc && sc.nextSibling) host.insertBefore(UI.chip, sc.nextSibling); else host.appendChild(UI.chip); }
  }
  let lineT = 0;
  function line(text, ms = 0) { uiMount(); if (!text) { UI.line.classList.add('off'); return; } UI.line.textContent = text; UI.line.classList.remove('off'); lineT = ms ? performance.now() + ms : 0; }
  const HINT = { on: false, x: 0, y: 0, z: 0, dx: 0, dy: 10, shown: 0, seen: false };
  /** the hand over a world point (null: off); dx, dy: the gesture it shows (px) */
  function hand(at, dx = 0, dy = 12) { uiMount(); if (!at) { HINT.on = false; UI.hand.classList.add('off'); return; } HINT.on = true; HINT.x = at.x; HINT.y = at.y; HINT.z = at.z; HINT.dx = dx; HINT.dy = dy; HINT.seen = false; UI.hand.style.setProperty('--hx', dx + 'px'); UI.hand.style.setProperty('--hy', dy + 'px'); UI.hand.classList.remove('off'); }
  function hintSeen() { if (HINT.on && act && act.hintOnce !== false) { HINT.seen = true; HINT.on = false; UI.hand.classList.add('off'); } }
  function meter(at, k) { uiMount(); if (!at) { UI.meter.classList.add('off'); return; } UI.meter.classList.remove('off'); const q = scr(at.x, at.y, at.z); UI.meter.style.left = q.x + 'px'; UI.meter.style.top = q.y + 'px'; UI.meter.firstChild.style.width = Math.round(clamp(k, 0, 1) * 100) + '%'; }
  function count(at, text) { uiMount(); if (!at) { UI.count.classList.add('off'); return; } UI.count.classList.remove('off'); const q = scr(at.x, at.y, at.z); UI.count.style.left = q.x + 'px'; UI.count.style.top = q.y + 'px'; UI.count.textContent = text; }
  function uiFrame() {
    if (!UI.root) return;
    if (UI.ovt) UI.ovt.style.opacity = OV.on ? '1' : '0';
    if (UI.lkb) { const lk = phase === 'act' && !!act && !OV.on && (LOOK.u > 0.02 || Math.abs(LOOK.yaw) > 0.03) && !LOOK.back; UI.lkb.classList.toggle('on', lk); UI.wait.classList.toggle('on', lk && lookZone(LOOK.u, LOOK.yaw) !== 'play'); }   // ── h117 ── ── /h117 ──
    if (lineT && performance.now() > lineT) { lineT = 0; UI.line.classList.add('off'); }
    if (HINT.on) { const q = scr(HINT.x, HINT.y, HINT.z); UI.hand.style.left = q.x + 'px'; UI.hand.style.top = q.y + 'px'; }
    UI.rot.classList.toggle('want', owns());
    placeChip();
  }

  /* ───────── the flash and the score: every success four ways at once (juice.js), the streak counted and shown ───────── */
  const SCo = o.score;
  let streakShown = -1;
  function chipSync(pop) {
    uiMount(); const n = SCo && typeof SCo.streak === 'function' ? SCo.streak() : 0; const best = M ? M.streak(n) : n;
    if (n !== streakShown) { streakShown = n; UI.chip.querySelector('span').textContent = String(n); UI.chip.classList.toggle('hot', n >= 3); if (pop) { UI.chip.classList.add('pop'); setTimeout(() => UI.chip.classList.remove('pop'), 160); } }
    UI.chip.querySelector('small').textContent = best >= 3 ? `שיא ${best}` : '';
    if (pop && n === 3) { UI.qetz.classList.add('on'); setTimeout(() => UI.qetz.classList.remove('on'), 900); }
  }
  /** one act's answer: grade 'gold' | 'good' | 'ok'; at: the world point; text: a word (else the points alone); craft: the trade */
  function hit(at, grade, o2 = {}) {
    const J = o.juice && o.juice();
    const P = grade === 'gold';
    if (J) J.hit(o2.kind || 'craft', { at, text: o2.text != null ? o2.text : '', perfect: P, act: grade, grade: P ? 'perfect' : grade === 'good' ? 'good' : 'soft', quality: P ? 1 : grade === 'good' ? 0.8 : 0.5, craft: o2.craft || 'חוצבים' });
    else if (SCo) { SCo.add(SCo.grade(grade), 'act'); }
    chipSync(true);
  }
  /** a result in the world without points (a miss, a chip): the dust and a word, never red */
  function word(at, text) { const J = o.juice && o.juice(); if (J) J.hit('craft', { at, text, perfect: false, grade: 'soft', quality: 0.4, pts: 0 }); }
  function bonus(n, why, label) { try { if (o.bonus) o.bonus(n, why, label); } catch (e) { /* */ } }

  /** ── h115 ── (ירון 10.11: "משחקון ששוחק מושלם שיקפוץ לו פידבק דופמין ממלא מסך כזה ... בכל משחקון") the whole screen golden: the
   *  word, three stars, what was perfect; fanfare and buzz; a tap or 2.8 s closes it. Its rule is the act's own perfect flag (else
   *  three stars with every grade gold, q of 1) ── /h115 ── */
  function perfectScreen(sub) {
    return new Promise((res) => {
      uiMount();
      const el = document.createElement('div'); el.className = 'h109-ui h109-pf';
      let dots = ''; for (let i = 0; i < 30; i++) { const a = (i / 30) * Math.PI * 2 + Math.random() * 0.2, r = 30 + Math.random() * 40; dots += `<u style="--dx:${(Math.cos(a) * r).toFixed(1)}vmax;--dy:${(Math.sin(a) * r).toFixed(1)}vmax;animation-delay:${(Math.random() * 0.4).toFixed(2)}s"></u>`; }
      el.innerHTML = `<div class="r"></div>${dots}<b>מושלם!</b><i>★★★</i>${sub ? `<span>${sub}</span>` : ''}`;
      document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
      try { if (o.sfx && o.sfx.play) o.sfx.play(typeof o.sfx.has === 'function' && o.sfx.has('levelUp') ? 'levelUp' : 'fanfare', { level: 5 }); } catch (e) { /* */ }
      try { if (o.haptic) o.haptic([30, 50, 30, 50, 80]); } catch (e) { /* */ }
      let done = false; const close = () => { if (done) return; done = true; el.classList.remove('on'); setTimeout(() => el.remove(), 300); res(); };
      el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); if (performance.now() - t0 > 700) close(); });
      const t0 = performance.now(); setTimeout(close, 2800);
      emit('h109perfectScreen', { sub }); log('perfect screen', sub);
    });
  }

  /* ───────── the mission marker: a tall stake with a red cloth on the hill (the old markers and the compass point to it) ───────── */
  let PROPS = null;
  function props() { if (!PROPS) PROPS = createProps({ THREE, scene, ground, stages: S0 }); return PROPS; }

  // ── h114 ── (a work's stand asked while another is open: the level it will play at is its own, not the open one's) ── /h114 ──
  let lvM = null;
  function standOf(m) { const A = ACTS[m.k]; if (!A || !A.stand) return null; lvM = m; try { return A.stand(m, X); } finally { lvM = null; } }
  // ── h114 ── rule 54 (ירון 9.11: "שאני אבחר לאן ללכת ומה לעשות מתי שבא לי"): a pack whose model has open() lets him choose. Every open
  // work has its stake on the hill; he walks to one (9 amot) and it is his, the crews set it up, the magnet brings him to its stand
  // and the act begins. Walking away from it (14 amot) gives it back. The compass and the markers point to the nearest ones. ── /h114 ──
  const FREE = () => !!(M && M.open);
  let OPEN = [], fwT = 0, fwLine = null, byWalk = false;
  const mkAt = (sp) => ({ x: sp.mx != null ? sp.mx : sp.x, z: sp.mz != null ? sp.mz : sp.z });
  function openList() {
    OPEN = M.open().map((m) => { if (m.free && ACTS.__ensure) { try { ACTS.__ensure(m, X); } catch (e) { /* */ } } return { m, sp: standOf(m) }; }).filter((q) => q.sp);
    // ── h116 ── the stakes: every plan work, and the six free works nearest him (the free ones are many: rock cells, quarters) ── /h116 ──
    const h = heroAt(), fr = OPEN.filter((q) => q.m.free);
    if (h && Number.isFinite(h.x)) fr.sort((a, b) => Math.hypot(h.x - a.sp.x, h.z - a.sp.z) - Math.hypot(h.x - b.sp.x, h.z - b.sp.z));
    props().markers(OPEN.filter((q) => !q.m.free).concat(fr.slice(0, 6)).map((q) => mkAt(q.sp)));
  }
  function nearestOpen(planOnly) {
    const h = heroAt(); if (!h || !Number.isFinite(h.x) || !OPEN.length) return null;
    let best = null, bd = 1e9; for (const q of OPEN) { if (planOnly && q.m.free) continue; const d = Math.hypot(h.x - q.sp.x, h.z - q.sp.z); if (d < bd) { bd = d; best = q; } }
    return best ? { ...best, d: bd } : null;
  }
  function pickNow(m, walked) {
    M.pick(m.id); mission = M.mission(); if (!mission) return false;
    byWalk = !!walked; tPhase = 0.5;
    showOne();
    return true;
  }
  function freeWalk(dt) {
    const q = nearestOpen();
    fwT -= dt;
    if (fwT <= 0) {
      fwT = 0.4; const A = q && ACTS[q.m.k];
      const t = q && q.d < 40 && A && A.walkLine ? A.walkLine(q.m, X) : OPEN.length > 1 ? 'בחרו עבודה ולכו אל יתד' : '';
      if (t !== fwLine) { fwLine = t; line(t, 0); }
    }
    // ── h116 ── (a free work is picked only at its very stake: walking past the hill's free rocks must not start one) ── /h116 ──
    if (q && q.d < (q.m.free ? 3.5 : 9) && tPhase > 0.4) pickNow(q.m, true);
  }
  function showOne() {
    const sp = standOf(mission);
    props().marker(sp ? mkAt(sp) : null);
    const A = ACTS[mission.k];
    line(A && A.walkLine ? A.walkLine(mission, X) : 'לכו אל היתד האדומה', 0); fwLine = null;
    if (A && A.prepare) call(A.prepare, mission, X);
    emit('h109mission', { id: mission.id, k: mission.k });
    log('open', mission.id);
    save();
  }
  // ── /h114 ──
  function openMission() {
    if (FREE()) {   // ── h114 ── ── /h114 ──
      if (M.finished()) { mission = null; finishStage(); return; }
      mission = M.mission(); phase = 'walk'; tPhase = 0; act = null; OPEN = []; fwLine = null; fwT = 0;
      if (mission) { byWalk = false; showOne(); return; }
      openList();
      emit('h109open', { n: OPEN.length, ids: OPEN.map((q) => q.m.id) });
      log('open', OPEN.map((q) => q.m.id).join(','));
      save();
      return;
    }
    mission = M.mission();
    if (!mission) { finishStage(); return; }
    // ── h111 ── between two levels the pack's own film (stage 02: rain at night, the sun in the morning; Taanit 23a) ── /h111 ──
    if (PK.before && !ONLY) {
      let p = null; try { p = PK.before(mission, X, M); } catch (e) { p = null; }
      if (p && typeof p.then === 'function') {
        phase = 'film'; tPhase = 0; act = null; props().marker(null); line('');
        p.catch(() => {}).then(() => { CAM.on = false; phase = 'walk'; save(); openMission(); });
        return;
      }
    }
    const sp = standOf(mission);
    phase = 'walk'; tPhase = 0; act = null;
    props().marker(sp ? { x: sp.mx != null ? sp.mx : sp.x, z: sp.mz != null ? sp.mz : sp.z } : null);
    const A = ACTS[mission.k];
    line(A && A.walkLine ? A.walkLine(mission, X) : 'לכו אל היתד האדומה', 0);
    // the crews take what the kohen does not: the sector's other rocks, the rest of the rope (the acts' prepare())
    if (A && A.prepare) call(A.prepare, mission, X);
    emit('h109mission', { id: mission.id, k: mission.k });
    log('open', mission.id);
    save();
  }
  /** the director's marks for twin.js (its bubble, its edge arrow, its compass): the open mission while he walks */
  const MK = [{ job: 'h109', icon: PK.icon || '⛏', label: '', site: PK.id, x: 0, y: 0, z: 0 }];
  const NOMK = [];
  const MKF = [0, 1, 2, 3].map(() => ({ job: '', icon: '', label: '', site: PK.id, x: 0, y: 0, z: 0 }));
  const MKL = [];
  function marks() {
    if (owns() && phase === 'walk' && !mission && FREE()) {   // ── h114 ── (the four nearest open works) ── /h114 ──
      const h = heroAt(); MKL.length = 0; if (!h || !OPEN.length) return NOMK;
      const all = OPEN.map((q) => ({ q, d: Math.hypot(h.x - q.sp.x, h.z - q.sp.z) })).sort((a, b) => a.d - b.d), L = all.slice(0, 4);
      // ── h116 ── a plan work is always among the four (the free ones never hide the way on) ── /h116 ──
      if (!L.some((e) => !e.q.m.free)) { const p0 = all.find((e) => !e.q.m.free); if (p0) L[L.length - 1] = p0; }
      L.forEach(({ q }, i) => { const A = ACTS[q.m.k], m = MKF[i], p = mkAt(q.sp); m.job = 'h109' + q.m.id; m.icon = (A && A.icon) || PK.icon || '⛏'; m.label = ((A && A.title) || '') + (q.m.free ? ' · רשות' : q.m.s != null ? ` · ${q.m.s + 1}` : ''); m.x = p.x; m.z = p.z; m.y = ground(p.x, p.z) + 5; MKL.push(m); });
      return MKL;
    }
    if (!owns() || phase !== 'walk' || !mission) return NOMK;
    const sp = standOf(mission); if (!sp) return NOMK;
    const A = ACTS[mission.k], m = MK[0];
    m.icon = (A && A.icon) || PK.icon || '⛏'; m.label = (A && A.title) || ''; m.x = sp.mx != null ? sp.mx : sp.x; m.z = sp.mz != null ? sp.mz : sp.z; m.y = ground(m.x, m.z) + 5;
    return MK;
  }
  const GOAL = { x: 0, y: 0, z: 0, icon: PK.icon || '⛏' };
  function goal() { const L = marks(); if (!L.length) return null; GOAL.x = L[0].x; GOAL.y = L[0].y; GOAL.z = L[0].z; GOAL.icon = L[0].icon; return GOAL; }
  /** the compass: he is brought to the open mission's stand */
  function goTo() {
    if (!mission && phase === 'walk' && FREE()) { const q = nearestOpen(true) || nearestOpen(); if (!q || !pickNow(q.m, false)) return false; }   // ── h114 ── (the compass: the nearest open work is his) ── /h114 ──
    if (!mission || phase !== 'walk') return false; const sp = standOf(mission); if (!sp) return false;
    flyTo(sp);   // ── h115 ── ── /h115 ──
    try { hero.dash({ x: sp.x, z: sp.z, face: sp.face }); } catch (e) { return false; } return true; }
  /** ── h115 ── (brief §camera: "going to a far work is one continuous flight of the camera over the world, never a cut") far away
   *  (over 60 amot) the camera rises from where it is over the way, crosses high and comes down behind the stand; the kohen is there
   *  when it lands (his own dash), the follow camera takes him again. ── /h115 ── */
  let FLY = null;
  function flyTo(sp) {
    const h = heroAt(); if (!h || !Number.isFinite(h.x)) return;
    const d = Math.hypot(sp.x - h.x, sp.z - h.z); if (d < 60) return;
    view.camNow(cq);
    const mx = (h.x + sp.x) / 2, mz = (h.z + sp.z) / 2, gy = ground(sp.x, sp.z), up = clamp(d * 0.45, 60, 180);
    const ux = (sp.x - h.x) / d, uz = (sp.z - h.z) / d, back = 22;
    FLY = { t: 0, legs: [
      { at: 0, p: [mx - ux * d * 0.35, Math.max(cq.py, gy) + up, mz - uz * d * 0.35], t: [mx + ux * d * 0.2, gy, mz + uz * d * 0.2], dur: 1.2 },
      { at: 1.2, p: [sp.x - ux * back, gy + 14, sp.z - uz * back], t: [sp.x, gy + 1.5, sp.z], dur: 1.3 },
    ], end: 2.7, i: 0 };
    log('fly', Math.round(d)); emit('h109fly', { d: Math.round(d) });
  }
  function flyFrame(dt) {
    if (!FLY) return;
    FLY.t += dt;
    while (FLY.i < FLY.legs.length && FLY.t >= FLY.legs[FLY.i].at) { const L = FLY.legs[FLY.i++]; shot(L.p, L.t, L.dur); }
    camStep(dt);
    if (FLY.t >= FLY.end || phase === 'act') { FLY = null; if (phase !== 'act') CAM.on = false; }
  }

  /* ───────── the act ───────── */
  const WAITS = [], KOH = { off: false };
  const X = {
    THREE, scene, camera, view, stages: S0, hero, ground, heroAt, shot, track, workShot, rayAt, scr, line, hand, meter, count, hit, word, bonus,
    get props() { return props(); }, get M() { return M; }, get mission() { return mission; }, get acting() { return phase === 'act'; }, ui, sfx: o.sfx, haptic: o.haptic,
    actors: () => S0.crewActors || null, PLACES, H109,
    beat() { let b = null; try { const Mu = globalThis.__BH_MUSIC; b = Mu && typeof Mu.beat === 'function' ? Mu.beat() : null; } catch (e) { b = null; } return b && b.period > 0.2 && Number.isFinite(+b.toNext) ? b : null; },
    play(name) { try { if (o.sfx && o.sfx.play) o.sfx.play(name); } catch (e) { /* */ } },
    shake(t = 0.15, a = 0.3) { try { S0.twinShake(t, a); } catch (e) { /* */ } },
    dust(x, y, z, n = 10, s = 4) { try { S0.dustBurst(x, y, z, n, s, s, 1.5); } catch (e) { /* */ } },
    sparks(x, y, z, n = 10) { try { S0.sparkBurst(x, y, z, n, 5, 6); } catch (e) { /* */ } },
    end: (res) => endAct(res),
    // ── h115 ── (ירון 10.11: the figure out where it has no work, the brief's figure rule) the kohen hidden for this act; back at its end ── /h115 ──
    kohen(v) { KOH.off = !v; try { S0.hero.show(!!v); } catch (e) { /* */ } },
    // ── h114 ── (ירון 9.11: an exact stop "צריך להיות תגובה מרגשת כמו 'הסתת רמה 4' — זה דופמין מדויק") the perfect moment: the level-up's
    // own stamp, fanfare and buzz, a fountain of sparks where it happened and a short shake ── /h114 ──
    perfect(text, at) {
      try { if (ui && ui.stamp) ui.stamp(text, { ms: 1600 }); } catch (e) { /* */ }
      try { if (o.sfx && o.sfx.play) o.sfx.play(typeof o.sfx.has === 'function' && o.sfx.has('levelUp') ? 'levelUp' : 'fanfare', { level: 4 }); } catch (e) { /* */ }
      try { if (o.haptic) o.haptic([20, 40, 30]); } catch (e) { /* */ }
      if (at) { try { S0.sparkBurst(at.x, at.y, at.z, 34, 7, 9); S0.sparkBurst(at.x, at.y + 1.2, at.z, 18, 4, 6); } catch (e) { /* */ } }
      try { S0.twinShake(0.22, 0.35); } catch (e) { /* */ }
      emit('h109perfect', { text });
    },
    // ── h111 ── a film's beat in the world's time (as the camera eases), not the wall clock's: on a slow frame the shot still lands ── /h111 ──
    wait: (secs) => new Promise((r) => WAITS.push({ t: secs, r })),
    level: () => { const m = lvM || mission; return m ? M.levelOf(m) : 1; },   // ── h114 ── ── /h114 ──
    loss: (n, at, label, stones, res) => loss(n, at, label, stones, res),   // ── h113 ── (res: 'cedar' for a board or a leaf) ── /h113 ──   // ── h111 ── real damage costs points (the owner 8.11) ── /h111 ──
    save: () => save(),
    get pack() { return PK; },
  };
  /* ───────── ── h111 ── real damage (spec "הניקוד בהפסד", approved 8.11): a cracked or broken stone −20, a great stone fallen −40;
     stones off the stock; the gold run ends; never under 0 and at most 80 in one mission. A miss without damage costs nothing ── */
  let lossNow = 0;
  function loss(n, at, label = '', stones = 0, res = 'stone') {
    const k = Math.max(0, Math.min(n | 0, 80 - lossNow)); lossNow += k;
    let d = 0; try { if (k && SCo && SCo.sub) d = SCo.sub(k, 'damage').n; else if (SCo && SCo.breakRun) SCo.breakRun(); } catch (e) { /* */ }
    try { const g = G(); if (stones > 0 && g && g.res) g.res[res] = Math.max(0, (g.res[res] || 0) - stones); } catch (e) { /* */ }
    try { if (ui && ui.refresh) ui.refresh(); } catch (e) { /* */ }
    uiMount();
    const q = at ? scr(at.x, at.y, at.z) : { x: innerWidth / 2, y: innerHeight * 0.4 };
    const el = document.createElement('div'); el.className = 'h109-ui h109-loss'; el.innerHTML = `<b>${d ? '−' + d : '0'}</b>${label ? `<span>${label}</span>` : ''}${stones ? `<small>−${stones} ${res === 'cedar' ? (stones === 1 ? 'ארז' : 'ארזים') : stones === 1 ? 'אבן' : 'אבנים'} מהמלאי</small>` : ''}`;
    el.style.left = q.x + 'px'; el.style.top = q.y + 'px'; document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('on')); setTimeout(() => el.remove(), 2600);
    try { const tb = document.querySelector('.gm-sc'); if (tb) { tb.classList.add('h109-hurt'); setTimeout(() => tb.classList.remove('h109-hurt'), 700); } } catch (e) { /* */ }
    X.play('crack'); try { if (o.haptic) o.haptic([30, 40, 60]); } catch (e) { /* */ }
    chipSync(false);
    log('loss', n, d, label, stones);
    emit('h109loss', { n: d, stones, label });
    return d;
  }
  // ── /h111 ──
  function beginAct() {
    const A = ACTS[mission.k]; if (!A) { M.done({ stars: 0 }); openMission(); return; }
    props().marker(null);
    phase = 'act'; tPhase = 0; line(''); ptr.down = false; lossNow = 0;
    try { act = A.make(mission, X) || {}; } catch (e) { console.warn('[h109] make', mission.id, e && e.message, e && e.stack && e.stack.split('\n')[1]); act = null; phase = 'walk'; M.done({ stars: 1 }); syncMount(false); openMission(); return; }
    act.t = 0;
    // ── h114 ── the act's ground kept clear of the carts and the passing crews (ירון 9.11: an ox cart drove into the paving); a pack's
    // own act may set its own rects in its begin() ── /h114 ──
    try { const sp = standOf(mission), at = act.at ? act.at() : null; if (S0.keepOut && sp) { const xs = [sp.x, at ? at.x : sp.x], zs = [sp.z, at ? at.z : sp.z], m = 16; S0.keepOut([[Math.min(...xs) - m, Math.min(...zs) - m, Math.max(...xs) + m, Math.max(...zs) + m]]); } } catch (e) { /* */ }
    document.body.classList.add('h109-act');
    // an act whose shot comes close (the letters on the stone) asks for it: the world camera's 35-amot floor gives way while it holds
    try { if (act.close && view.closeCam) view.closeCam(true, 'h109'); } catch (e) { /* */ }
    const g = document.querySelector('.gm'); if (g) g.classList.add('h109-own');
    call(act.begin);
    emit('h109act', { id: mission.id, on: true });
    log('act', mission.id, 'lv', M.levelOf(mission));
  }
  let ending = false;
  async function endAct(res = {}) {
    if (!act || ending) return; ending = true;
    if (OV.on) { OV.on = false; OV.free = 0; try { UI.ovb.classList.remove('on'); UI.line.classList.remove('h109-hide'); props().marker(null); if (OV.close && view.closeCam) view.closeCam(true, 'h109'); } catch (e) { /* */ } }   // ── h114 ── ── /h114 ──
    const m = mission, a = act;
    const stars = res.stars != null ? res.stars : starsOf(res.q || 0);
    log('end', m.id, 'stars', stars, res.lost ? 'LOST' : '');
    line(''); hand(null); meter(null); count(null);
    // the result in the world first (the act's own last beat), then the stars and the work's end points (the old JOB_END)
    const J = o.juice && o.juice();
    const at = res.at || (a.at ? a.at() : null);
    // ── h115 ── the perfect game fills the screen first ── /h115 ──
    const perfect = stars >= 3 && !res.lost && (res.perfect != null ? !!res.perfect : (res.q || 0) >= 0.999);
    if (perfect) { const A0 = ACTS[m.k]; try { await perfectScreen(((A0 && A0.title) || 'המשחקון') + ' · בלי טעות אחת'); } catch (e) { /* */ } }
    if (J && stars > 0) { try { await J.result({ stars, at }); } catch (e) { /* */ } }
    if (stars > 0) bonus([0, 50, 100, 200][stars], 'job' + stars, `${'★'.repeat(stars)} ${res.lost ? 'הצוות סיים' : stars >= 3 ? 'מהודר' : 'כשר'}`);
    call(a.end, res);
    if (KOH.off) X.kohen(true);   // ── h115 ── ── /h115 ──
    try { if (S0.keepOut) S0.keepOut([]); } catch (e) { /* */ }   // ── h114 ── ── /h114 ──
    phase = 'film'; tPhase = 0; act = null; ending = false;
    M.done({ ...res, stars });
    syncMount(false);
    // a sector closed: its grade on the hill and the pull-back (spec ש7: the hill came down there)
    // ── h111 ── (a pack says what closes a unit: stage 01 a sector, stage 02 a stretch of the wall) ── /h111 ──
    const U = PK.unitEnd ? (() => { try { return PK.unitEnd(m, M); } catch (e) { return null; } })() : (m.k === 'pave' && !m.free && M.sectorGrade(m.s) ? { title: `גזרה ${m.s + 1} מתוך 9`, sub: M.sectorGrade(m.s), bonus: `גזרה ${m.s + 1} · ${M.sectorGrade(m.s)}` } : null);
    const sec = U ? U.sub : null;
    if (U) { bonus(250, 'course', U.bonus || U.title); try { if (J) J.big('course', { title: U.title, sub: U.sub }); } catch (e) { /* */ } }
    await pullBack(at, sec ? 3.2 : 1.8);
    try { if (J && J.flushUps) J.flushUps('עלית רמה בזכות העבודה המדויקת במשחקון'); } catch (e) { /* */ }   // ── h114 ── ── /h114 ──
    document.body.classList.remove('h109-act');
    try { if (view.closeCam) view.closeCam(false, 'h109'); } catch (e) { /* */ }
    phase = 'walk';
    if (ONLY) {
      onlyNext();
      if (!M.mission()) { console.info('[h109] only page: all levels done, reload'); line('המשחקון נגמר · מתחילים שוב'); setTimeout(() => { try { localStorage.removeItem('bh_beta2'); } catch (e) { /* */ } location.reload(); }, 2500); return; }
      syncMount(true);
    }
    openMission();
    if (ONLY) setTimeout(() => goTo(), 400);
  }
  /** spec ש7: the camera rises over what was just done and the crews round it, then the follow camera takes him again */
  function pullBack(at, secs) {
    return new Promise((res) => {
      const h = heroAt(), c = at || { x: h.x, y: h.y, z: h.z };
      view.camNow(cq); const dx = cq.px - cq.tx, dz = cq.pz - cq.tz, L = Math.hypot(dx, dz) || 1;
      const d = 46, el = 0.72;
      shot([c.x + (dx / L) * d * Math.cos(el), c.y + d * Math.sin(el), c.z + (dz / L) * d * Math.cos(el)], [c.x, c.y, c.z], 1.1);
      film = { t: 0, dur: secs, res };
    });
  }

  /* ───────── the Mount comes down as the work is done; the crews ───────── */
  let progShown = -1;
  // ── h114 ── (the full replays, 9–10.11) the Mount's walls as the world shows them, from the stage's progress:
  //  · whole courses only — a course half laid is a step of 2.7 amot across the sectors' ground (the platform's body is their
  //    floor as it rises), and the step covered a paving's pile of slabs: the sector could not be closed;
  //  · until his own wall works are done (the corner, the two courses, the great stone) never above the last course under the
  //    platform's top: with the sectors done first the porticoes stood over the east wall's course and the great stone's place.
  // (tests: window.__H109_CAP = courses under the platform's top the walls may reach, default 1 under) ── /h114 ──
  function harWhole(p, under) {
    let info = null; try { info = S0.siteInfo ? S0.siteInfo('har') : null; } catch (e) { info = null; }
    const F = 0.15; if (!info || !info.stones || !info.perCourse || !info.perCourse.length || !(info.H > 0) || p <= F) return p;
    const n = (p - F) / (1 - F) * info.stones, toTop = Math.floor((0 - info.y0) / info.H + 1e-6);
    const kMax = under ? Math.max(1, toTop - (Number.isFinite(+globalThis.__H109_CAP) ? +globalThis.__H109_CAP : 1)) : info.perCourse.length;
    let cum = 0; for (let k = 0; k < info.perCourse.length && k < kMax; k++) { if (cum + info.perCourse[k] > n + 0.5) break; cum += info.perCourse[k]; }
    return F + (1 - F) * cum / info.stones;
  }
  function syncMount(instant) {
    let p = Math.max(0.03, M.progress() * 0.97);
    if (!PK.sync) p = harWhole(p, !!M.wallsDone && !M.wallsDone());
    if (Math.abs(p - progShown) < 0.004 && !instant) return;
    progShown = p;
    if (PK.sync) { try { PK.sync(M, S0, !!instant, X); } catch (e) { console.warn('[h109] sync', e && e.message); } return; }   // ── h111 ── ── /h111 ──
    try { S0.setStage('har', 'building', p, instant ? { instant: true } : {}); } catch (e) { console.warn('[h109] setStage', e && e.message); }
  }

  /* ───────── the end of the stage: the film over what was built, then the next stage opens in the world ───────── */
  async function finishStage() {
    phase = 'end'; act = null; mission = null; props().marker(null); line('');
    log('finish');
    syncMount(false);
    const J = o.juice && o.juice();
    // the film (spec §13.6: "צילום ביצוע"): the leveled Mount, the east wall, the great stone, the inscription, from high
    if (PK.finale) { try { await PK.finale(X, M); } catch (e) { console.warn('[h109] finale', e && e.message); } }   // ── h111 ── ── /h111 ──
    const shots = PK.film;
    for (const [p, t, s] of shots) { shot(p, t, 1.6); await sleep(s * 1000); }
    try { if (J) await J.big('stage', { title: PK.endTitle, sub: PK.endSub }); } catch (e) { /* */ }
    CAM.on = false; phase = 'off'; started = false;
    const g = document.querySelector('.gm'); if (g) g.classList.remove('h109-own');
    try { if (S0.pinsOff) S0.pinsOff(false); } catch (e) { /* */ }   // ── h117 ── ── /h117 ──
    resFor(false);   // ── h117 ── ── /h117 ──
    UI.rot && UI.rot.classList.remove('want');
    if (o.onDone) { try { await o.onDone(M.st); } catch (e) { console.warn('[h109] onDone', e && e.message); } }
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ───────── the frame ───────── */
  let syncT = 0;
  // ── h117 ── (ירון 10.11: "רזולוציה התכוונתי שפשוט נראה לא איכותי"; no camera change for it) while an act runs the renderer draws at
  // the device's own pixel ratio (up to 2): main.js view.workRes, the mechanism Phase B's works use; back when the act ends ── /h117 ──
  let resOn = false;
  function resFor(on) { if (on === resOn) return; resOn = on; try { if (view.workRes) view.workRes(on); } catch (e) { /* */ } }
  function frame(ms) {
    const dt = lastMs ? clamp((ms - lastMs) / 1000, 0, 0.25) : 0; lastMs = ms;
    for (let i = WAITS.length - 1; i >= 0; i--) { const w = WAITS[i]; w.t -= dt; if (w.t <= 0) { WAITS.splice(i, 1); w.r(); } }   // ── h111 ── X.wait: the films' beats in the world's own time ── /h111 ──
    if (!started) return;
    uiFrame();
    tPhase += dt;
    if (ACTS.__frame) call(ACTS.__frame, dt, X);
    if (PK.sync && (phase === 'walk' || phase === 'act')) { syncT -= dt; if (syncT <= 0) { syncT = 1.5; try { PK.sync(M, S0, false, X); } catch (e) { /* */ } } }   // ── h111 ── (the world checked against the plan) ── /h111 ──
    resFor(phase === 'act' && !!act);   // ── h117 ── ("נראה לא איכותי": full sharpness while a minigame runs) ── /h117 ──
    if (phase === 'act' && act && !OV.on && !lookAway()) { act.t += dt; call(act.update, dt); try { if (S0.shadowSoon) S0.shadowSoon(); } catch (e) { /* */ } }   // ── h114 ── (the shadows follow what the act moves; the act waits while he looks from above) ── /h114 ──
    if (OV.on) ovFrame();
    if (phase !== 'act' || OV.on) { if (LOOK.id != null || LOOK.u || LOOK.yaw || LOOK.away) lookReset(); } else lookFrame(dt);   // ── h115 ── ── /h115 ──
    if (phase === 'film' && film) { film.t += dt; if (film.t >= film.dur) { const r = film.res; film = null; CAM.on = false; r(); } }
    if (phase === 'end' || phase === 'film' || phase === 'act') camStep(dt);
    else if (FLY) flyFrame(dt);   // ── h115 ── ── /h115 ──
    if (phase === 'walk' && !mission && FREE()) freeWalk(dt);   // ── h114 ── ── /h114 ──
    if (phase === 'walk' && mission) {
      const sp = standOf(mission), h = heroAt();
      if (sp && h && Number.isFinite(h.x)) {
        const d = Math.hypot(h.x - sp.x, h.z - sp.z);
        if (FREE() && byWalk && !ONLY && d > 14) { M.pick(null); mission = null; byWalk = false; openMission(); if (PROPS) PROPS.frame(dt, ms); return; }   // ── h114 ── (he walked away: the work is open again) ── /h114 ──
        // the magnet (spec, rule 26): within 9 amot he is drawn to the stand; there the act begins
        const tw = o.twin && o.twin();
        const driving = !!(hero && hero.driving);
        if (d < 1.2) beginAct();
        else if (d < 9 && !driving && !hero.walking && tPhase > 0.4) { try { hero.walkTo({ x: sp.x, z: sp.z, face: sp.face }); } catch (e) { /* */ } }
        else if (d < 2.6 && !driving) beginAct();
        void tw;
      }
    }
    if (PROPS) PROPS.frame(dt, ms);
  }

  /* ───────── start ───────── */
  function owns() { return started && phase !== 'off'; }
  function start() {
    if (started) return;
    const g = G(); if (!g) return;
    if (!g[PK.key]) g[PK.key] = null;
    M = PK.create(g[PK.key]); g[PK.key] = M.st;
    started = true; uiMount(); chipSync(false);
    try { if (S0.pinsOff) S0.pinsOff(true); } catch (e) { /* */ }   // ── h117 ── (the old site pins' light columns never show) ── /h117 ──
    { const g = document.querySelector('.gm'); if (g) g.classList.add('h109-own'); }
    try { hero.workpiece(null); } catch (e) { /* the old banker is not stage 01's */ }
    props();
    // the crews at work from the first second (rule 4): three crews at the Mount
    try { if (S0.setCrews && PK.crews) S0.setCrews(...PK.crews); } catch (e) { /* */ }
    onlyNext();
    // (tests: works the crews have done before the page opened — window.__H109_DONE = ['rope', 'rocks0', …])
    try { const D0 = globalThis.__H109_DONE; if (Array.isArray(D0) && M.pick) for (const id of D0) if (M.pick(id)) M.done({ stars: 2 }); } catch (e) { /* */ }
    syncMount(true);   // ── h111 ── (after the one-minigame page's skip: the world shows its mission's stage, not the first one's) ── /h111 ──
    if (ACTS.__init) call(ACTS.__init, X);
    openMission();
    if (ONLY) setTimeout(() => goTo(), 400);   // (straight to it)
  }
  return {
    owns, acting: () => owns() && (phase === 'act' || phase === 'film' || phase === 'end' || !!FLY), start, frame, marks, goal, goTo,
    get M() { return M; }, only: ONLY, site: PK.id, get pack() { return PK; },
    state: () => ({ at: act && act.at ? call(act.at) : null, look: { u: +LOOK.u.toFixed(3), yaw: +LOOK.yaw.toFixed(3), play: lookZone(LOOK.u, LOOK.yaw) === 'play', away: lookAway() }, started, phase, mission: mission ? mission.id : FREE() && phase === 'walk' ? ((nearestOpen() || {}).m || {}).id || null : null, open: FREE() && !mission ? OPEN.map((q) => q.m.id) : null, i: M ? M.st.i : -1, n: PLAN.length, progress: M ? +M.progress().toFixed(3) : 0, act: act ? { t: +act.t.toFixed(2), ...(act.dbg ? act.dbg() : {}) } : null, cam: CAM.on, streak: streakShown, best: M ? M.st.best : 0 }),
    act: () => act,
    // ── h114 ── the top pill: the stage's works done of all (the old world's pill said "מדידה" all through stage 01) ── /h114 ──
    pill: () => { if (!FREE() || !started) return ''; const n = M.st.done.length, of = PLAN.length; return `<span class="gm-k">המטרה</span><span><b>${PK.name || 'שיטוח ההר'}</b> <span class="gm-sub">· ${n} מתוך ${of} עבודות</span></span>`; },
    X,
    resync: () => { if (started && M) syncMount(true); },   // ── h111 ── (the game resynced the world: the director's site as it stands) ── /h111 ──
    // ── h111 ── the next stage's director takes over: this one's thumbs-side UI goes (its world props stay: what was built) ── /h111 ──
    dispose() { started = false; phase = 'off'; for (const k of ['line', 'hand', 'qetz', 'meter', 'count', 'rot', 'chip', 'ovb', 'ovt']) { try { if (UI[k] && UI[k].remove) UI[k].remove(); } catch (e) { /* */ } UI[k] = null; } UI.root = false; },
    // tests: finish the open act with a result
    _end: (res) => endAct(res || { stars: 3 }),
    overview: (v) => { if (v === true) ovEnter('test'); else if (v === false) ovLeave('test'); return { on: OV.on, free: !OV.free && !CAM.on }; },   // ── h114 ── ── /h114 ──
    _sh: () => (ACTS.__sh ? ACTS.__sh() : null),
    _look: (u, yaw) => { LOOK.back = 0; LOOK.u = clamp(+u || 0, 0, 1); LOOK.yaw = clamp(+yaw || 0, -2.8, 2.8); lookSet(); return lookZone(LOOK.u, LOOK.yaw); },   // ── h117 ── (tests: the camera a little out) ── /h117 ──
    _perfect: (sub) => perfectScreen(sub),   // ── h115 ── (tests: the full-screen perfect) ── /h115 ──
    _goId: (id) => { if (mission || phase !== 'walk') return false; const q = OPEN.find((x) => x.m.id === id); return !!q && !!pickNow(q.m, false) && goTo(); },
    _skipTo: (id) => { if (!M) return false; if (M.autoTo) { if (/^waste/.test(id)) M.st.waste = Math.max(M.st.waste | 0, 6); M.autoTo((m) => m.id === id); } else while (M.mission() && M.mission().id !== id) M.done({ stars: 2 }); if (act) { call(act.end, {}); act = null; } phase = 'walk'; syncMount(true); openMission(); return true; },
  };
}
