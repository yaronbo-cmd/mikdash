/* ── build 120 ── h120/load.js — the load test, stage 05's finale before its film (brief §8.2). In the evening light all the crews go up
 * the ladders with baskets of stones; the camera goes along the south, the north and the east, two seconds at each of his three bays
 * with the men standing on it. A bay as the model grades it (bayGrade):
 *   perfect — silence; one man stamps and the others lift their arms; a gold flash runs along the beam ("מושלם!");
 *   creak   — the creak, the gallery sinks a finger (the men drop with it, dust from the beam's seat), two step aside, a third (on the
 *             court) brings a prop (סמוכה) under the beam's middle; the prop stays (st.props[lv]: the world draws it) and the plain
 *             line says why (creakWhy).
 * Three perfect bays: the director's full-screen "מושלם!". No points are taken or given here; st.load = 1 when it is over.
 *   createLoad(X) → { play(): Promise }
 */
import { H120, Y, BAYS, BEAM_OF, LADDERS, bayGrade, creakWhy } from './model.js';
import { SH5, finalWorld } from './world.js';
import { nightRig } from './film.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const F = H120.FINGER;
/** the wall face a bay's gallery hangs from, from its beam (south: z 67.5; north: −67.5; east: x 141) */
const wallOf = (B) => (B.axis === 'x' ? [0, Math.sign(B.pa[1]) * 67.5] : [141, 0]);

export function createLoad(X) {
  const T = X.THREE, st = X.M.st, PR = X.props, all = [], men = [];
  const S = { lv: 0, grades: {}, t: 0, step: 'climb', fx: [] };
  try { globalThis.__H120_LOADST = S; } catch (e) { /* (the probes' eyes) */ }
  const rig = nightRig(X, 'evening');
  let live = true;
  // (the light rig every frame while it plays: the world's own grade must not win back)
  // (the camera is the test's own while it plays: an eased move to each shot, then held there)
  const CAM = { p0: null, t0: null, p1: null, t1: null, s: 0, d: 1 };
  const camTo = (p, t, d) => { const c = X.camera, q = new T.Vector3(); c.getWorldDirection(q); CAM.p0 = CAM.p1 ? CAM.p1.slice() : [c.position.x, c.position.y, c.position.z]; CAM.t0 = CAM.t1 ? CAM.t1.slice() : [c.position.x + q.x * 20, c.position.y + q.y * 20, c.position.z + q.z * 20]; CAM.p1 = p; CAM.t1 = t; CAM.s = S.t; CAM.d = Math.max(0.01, d); };
  // (driven by the world's own frame — h120/world.js calls SH5.film.frame(dt) — so its time is the world's, as the director's waits)
  const hook = { frame(dt) {
    if (!live) return; S.t += dt; rig.apply();
    for (const f of S.fx) f(dt);
    if (CAM.p1) { const u = ease(clamp((S.t - CAM.s) / CAM.d, 0, 1)), L = (a, b) => a.map((v, i) => v + (b[i] - v) * u); X.shot(L(CAM.p0, CAM.p1), L(CAM.t0, CAM.t1), 0.01); }
  } };

  /** the bay's frame: its beam's middle, the axis along it, the direction from the beam to its wall */
  function bay(lv) {
    const B = BEAM_OF[BAYS[lv].beam], mx = (B.pa[0] + B.pb[0]) / 2, mz = (B.pa[1] + B.pb[1]) / 2, ax = B.axis === 'x' ? [1, 0] : [0, 1];
    const w = wallOf(B), toWall = B.axis === 'x' ? [0, Math.sign(w[1] - mz)] : [Math.sign(w[0] - mx), 0];
    return { B, mx, mz, ax, toWall, len: B.len };
  }
  const gal = (w) => { if (w) { w.a.ground = () => Y.GFLOOR; w.a.y = Y.GFLOOR; } return w; };
  /** four men with baskets standing on the bay, 1.8 apart along it, between the beam and the wall */
  function menOn(lv) {
    const b = bay(lv), L = [];
    for (let k = 0; k < 4; k++) {
      const u = (k - 1.5) * 2.4, d = 1.0 + (k % 2) * 1.4;
      const x = b.mx + b.ax[0] * u + b.toWall[0] * d, z = b.mz + b.ax[1] * u + b.toWall[1] * d;
      const w = gal(SH5.crew.add(x, z, { role: 'hold', item: 'basket', crew: (k % 3) + 1 }));
      if (w) { w.fx = x - b.toWall[0] * 5; w.fz = z - b.toWall[1] * 5; L.push(w); men.push(w); }
    }
    return L;
  }
  /** the men climbing the south-west ladder one after another (the opening of the test) */
  function climbers() {
    const [x, z, fx, fz] = LADDERS[0], L = [];
    for (let k = 0; k < 4; k++) { const w = SH5.crew.add(x, z + 0.2, { role: 'hold', item: 'basket', crew: (k % 3) + 1 }); if (w) { w.fx = fx; w.fz = fz; w.k = k; L.push(w); men.push(w); } }
    return L;
  }
  const drop = (L) => { for (const w of L) { SH5.crew.remove(w); const i = men.indexOf(w); if (i >= 0) men.splice(i, 1); } };

  /** the camera at a bay: from the court in front of it, a little to the side, looking up at the beam and the men on it */
  function shotAt(lv, dur) {
    const b = bay(lv), out = [-b.toWall[0], -b.toWall[1]];
    const p = [b.mx + out[0] * 21 + b.ax[0] * 5, Y.COL_TOP - 2.5, b.mz + out[1] * 21 + b.ax[1] * 5], t = [b.mx + b.toWall[0] * 1.2, Y.COL_TOP + 0.6, b.mz + b.toWall[1] * 1.2];
    camTo(p, t, dur);
  }
  /** the gold flash along the beam: an additive bar that swells and fades */
  function flash(lv) {
    const b = bay(lv), g = new T.Mesh(new T.BoxGeometry(b.B.axis === 'x' ? b.len : 0.9, 0.9, b.B.axis === 'x' ? 0.9 : b.len), new T.MeshBasicMaterial({ color: '#FFD46A', transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false }));
    g.position.set(b.mx, (Y.COL_TOP + Y.BEAM_TOP) / 2, b.mz); PR.root.add(g); all.push(g);
    let u = 0; const run = (dt) => { u += dt / 0.9; if (u >= 1) { PR.remove(g); S.fx.splice(S.fx.indexOf(run), 1); return; } g.material.opacity = Math.sin(u * Math.PI) * 0.75; const s = 1 + u * 0.15; g.scale.set(s, 1 + u * 0.6, s); }; S.fx.push(run);
  }
  /** the prop: a cedar post brought lying on the court, raised under the beam's middle; then the world's own (st.props) */
  async function prop(lv) {
    const b = bay(lv), out = [-b.toWall[0], -b.toWall[1]], H = Y.COL_TOP - H120.FLOOR - 0.3;
    const pusher = SH5.crew.add(b.mx + out[0] * 3.2 + b.ax[0] * 1.6, b.mz + out[1] * 3.2 + b.ax[1] * 1.6, { role: 'push', crew: 2 }); if (pusher) { pusher.fx = b.mx; pusher.fz = b.mz; men.push(pusher); }
    const post = new T.Mesh(new T.CylinderGeometry(0.2, 0.22, H, 8), new T.MeshStandardMaterial({ color: '#7A5A3A', roughness: 0.85 })); post.castShadow = true;
    const pivot = new T.Group(); pivot.position.set(b.mx + out[0] * 0.2, H120.FLOOR + 0.3, b.mz + out[1] * 0.2); pivot.add(post); post.position.y = H / 2; PR.root.add(pivot); all.push(pivot);
    // (it lies toward the court, then swings up about its foot)
    const axis = b.B.axis === 'x' ? 'x' : 'z', sgn = b.B.axis === 'x' ? -out[1] : out[0];
    for (let i = 0; i <= 30; i++) { const u = ease(i / 30); pivot.rotation[axis] = sgn * (1 - u) * 1.45 * (axis === 'x' ? 1 : -1); if (pusher) { pusher.a.x = b.mx + out[0] * (3.2 - 2.2 * u) + b.ax[0] * 1.6; pusher.a.z = b.mz + out[1] * (3.2 - 2.2 * u) + b.ax[1] * 1.6; } await X.wait(0.05); }
    X.play('wedge'); X.dust(b.mx, H120.FLOOR + 0.2, b.mz, 6, 1.2);
    st.props = { ...(st.props || {}), [lv]: 1 }; try { X.save(); } catch (e) { /* */ }
    await X.wait(0.4); PR.remove(pivot);
  }

  async function testBay(lv) {
    S.lv = lv; const b = bay(lv), grade = bayGrade(st, lv); S.grades[lv] = grade;
    S.step = 'bay' + lv; shotAt(lv, 1.6); const L = menOn(lv);
    await X.wait(2.0);
    const at = { x: b.mx, y: Y.GFLOOR + 1.6, z: b.mz };
    S.step = 'res' + lv;
    if (grade === 'perfect') {
      // silence; one stamps, the others lift their arms; the gold flash
      const s = L[1]; if (s) { s.a.kn = s.a.knT = 0.9; await X.wait(0.18); s.a.kn = s.a.knT = 0; X.play('stamp'); }
      for (const w of L) { w.a.armT[0] = w.a.armT[2] = 2.6; }
      flash(lv); try { X.quick(at, 'מושלם!'); } catch (e) { /* */ }
      await X.wait(1.4);
    } else {
      // the creak, the sink of a finger, the dust from the beam's seat; two step aside, a prop comes; the line says why
      X.play('creak'); X.shake(0.12, 0.25); X.dust(b.mx, Y.COL_TOP, b.mz, 8, 1.5);
      for (const w of L) { w.a.ground = () => Y.GFLOOR - F; w.a.y = Y.GFLOOR - F; }
      const why = creakWhy(st, lv); X.line(why ? `הגזוזטרא חורקת: ${why}` : 'הגזוזטרא חורקת', 4200);
      await X.wait(0.7);
      for (const [k, w] of L.slice(1, 3).entries()) { const d = k ? 1.6 : -1.6; w.a.x += b.ax[0] * d; w.a.z += b.ax[1] * d; }
      await prop(lv);
      await X.wait(0.6);
    }
    drop(L);
  }

  async function play() {
    try {
      finalWorld(X); rig.on(); live = true; SH5.film = hook;
      X.line('בודקים את הגזוזטרא: כל הצוותים עולים בסולמות עם סלי אבנים', 3400);
      // the climb: four men up the south-west ladder, one after another
      const [lx, lz] = LADDERS[0];
      camTo([lx + 14, Y.GFLOOR - 2, lz - 20], [lx + 1, H120.FLOOR + 7, lz + 2], 1.2);
      const C = climbers(), t0 = S.t;
      for (let i = 0; i < 70; i++) {
        for (const w of C) { const u = clamp((i * 0.05 - w.k * 0.7) / 2.2, 0, 1); w.a.ground = null; w.a.y = w.a.fixedY = H120.FLOOR + u * (Y.GFLOOR - H120.FLOOR); w.a.z = lz + 0.2 + u * 2.2; w.a.armT[0] = w.a.armT[2] = 1.6 + 0.5 * Math.sin(i * 0.6 + w.k); }
        await X.wait(0.05);
      }
      void t0; drop(C);
      for (const lv of [1, 2, 3]) await testBay(lv);
      S.step = 'end'; st.load = 1; try { X.save(); } catch (e) { /* */ }
      const n = [1, 2, 3].filter((lv) => S.grades[lv] === 'perfect').length;
      try { globalThis.__H120_LOAD = { grades: { ...S.grades }, props: { ...(st.props || {}) }, n }; } catch (e) { /* */ }
      if (n === 3 && X.perfectScreen) { await X.perfectScreen('מבחן המשא · שלושה מפתחים בלי חריקה'); }
      else X.line(n ? `${n} מתוך 3 מפתחים בלי חריקה · הסמוכות נשארות במקומן` : 'כל המפתחים חורקים · הסמוכות נשארות במקומן', 3600);
      await X.wait(n === 3 ? 0.4 : 3.0);
    } finally {
      live = false; if (SH5.film === hook) SH5.film = null; drop(men.slice()); for (const o of all) PR.remove(o); rig.off(); rig.dispose();
    }
  }
  return { play, get state() { return { lv: S.lv, grades: { ...S.grades } }; } };
}
