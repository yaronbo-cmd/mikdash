/* ── build 109 ── h109/acts2.js — three acts of stage 01 in the world: 3.3 reading the big rock (the mirror's light, the wedges,
 * the water), 3.4 paving the sector (the slabs puzzle: no joint over a joint), 3.9 clearing the waste (the sledge, the oxen, the fill
 * behind the east retaining wall). Spec docs/specs/shlav-01-olam-yashan-he.md. Every result is seen in the world (rule 31).
 */
import { createGang, onPlane, clamp, lerp, ease, clearView, viewBlock, rayBlocked } from './kit.js';
import { makeRock } from './rock.js';
import { BOOK, rectOf } from '../world/grid.js';
import * as PV from './paving.js';
import * as WG from './wedges.js';   // ── h117 ── ── /h117 ──

let SH = null;
const TAU = Math.PI * 2;
function hash(a, b) { const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return v - Math.floor(v); }

/* ───────── the big rock's surface (a ray at it from outside: the world's own boulder mesh) ───────── */
function surf(X, b, phi, h, out = {}) {
  const T = X.THREE, gy = X.ground(b[0], b[1]);
  const o = new T.Vector3(b[0] + Math.cos(phi) * b[2] * 2.2, gy + h, b[1] + Math.sin(phi) * b[2] * 2.2);
  const d = new T.Vector3(b[0], gy + h, b[1]).sub(o).normalize();
  const rc = new T.Raycaster(o, d, 0, b[2] * 2.2); rc.camera = X.camera;
  let hits = []; try { hits = rc.intersectObjects(SH.rayList || (SH.rayList = X.scene.children.filter((c) => c !== X.props.root && !c.isSprite && !c.isPoints && !c.isLine)), true); } catch (e) { hits = []; }
  for (const hh of hits) {
    let p = hh.object, mine = false; while (p) { if (p === X.props.root || p.name === 'h109' || (p.name || '').startsWith('actor') || p.name === 'items') { mine = true; break; } p = p.parent; }
    if (mine) continue;
    if (Math.hypot(hh.point.x - b[0], hh.point.z - b[1]) < b[2] * 1.35) { out.x = hh.point.x; out.y = hh.point.y; out.z = hh.point.z; return out; }
  }
  out.x = b[0] + Math.cos(phi) * b[2] * 0.9; out.y = gy + h; out.z = b[1] + Math.sin(phi) * b[2] * 0.9; return out;
}
/** where to stand at a big rock: the side with most room (away from the other rocks, inside the platform) */
function bigStand(X, s) {
  const b = SH.bould[s]; let best = 0, bd = -1;
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * TAU, x = b[0] + Math.cos(a) * (b[2] + 3.4), z = b[1] + Math.sin(a) * (b[2] + 3.4);
    let d = 40; for (let j = 0; j < SH.bould.length; j++) { if (j === s) continue; const o = SH.bould[j]; d = Math.min(d, Math.hypot(x - o[0], z - o[1]) - o[2]); }
    for (const R of SH.rocks[s] || []) if (R.q && R.q.vis) d = Math.min(d, Math.hypot(x - R.x, z - R.z) - R.r);
    if (d > bd) { bd = d; best = a; }
  }
  return { a: best, x: b[0] + Math.cos(best) * (b[2] + 3.4), z: b[1] + Math.sin(best) * (b[2] + 3.4) };
}

/* ───────── 3.3 reading the rock ───────── */
// ── h114 ── rebuilt on ירון's notes of 9.11: "הפנס לא נראה פנס" · "לא ברור מה זה הקו שהאור מגלה" · "הכתם בכלל מחוץ לסלע" · "זה נראה אותו
// קו בקיעה" · "הסלע נבקע בכלל במקום שונה" · "היתדות ייראו כמו יתדות" · "היתד נפלה … זה טוב? זה לא טוב?" · "השחקן עומד במקום ולא זז"
// · "מים תכולים צריכים לזרום בתוך קו הבקיעה ולא במבחנה נפרדת". Now: the rock is its own mesh (h109/rock.js) standing in for the
// world's boulder; its crack is a real plane through it, its own on every rock (seeded by the sector), its line found by rays at the
// rock itself. A bronze mirror on a handle in the kohen's hand catches the sun (a ray from the sky to it, the reflected ray to the
// rock) and lays a bright patch ON the face; dragging walks the patch along the face; near the crack the crack darkens and widens in
// the light (a crack, not a drawn line: "סדק בסלע"). A tap on the crack: he steps to that point and drives a real wedge (a tapered
// wooden wedge, head out) with the mallet; a tap off the crack: he drives it and it does not bite and drops, and the line says why.
// The water is poured from the jar into the wedges' slots and runs blue DOWN the crack; the halves creak apart a hand as it fills;
// when the crack is full the creaking stops: that is the moment to stop pouring. The rock splits along that very plane, the two halves
// part like a book and stay on the hill until the crews drag them away for the paving. Illustration (the method: wooden wedges in a
// line of slots, wetted, swell and split the rock — documented at Roman quarries; marked המחשה in the sources list). ── /h114 ──
function rockMat(X) {
  if (SH.rockMat) return SH.rockMat;
  let map = null; try { const bm = X.stages.boulderMat && X.stages.boulderMat(); map = bm && bm.map; } catch (e) { map = null; }
  SH.rockMat = new X.THREE.MeshStandardMaterial({ color: '#D9CDB2', map, roughness: 0.93, flatShading: true });
  return SH.rockMat;
}
/** the sector's crack: azimuth offset from his side, the tilt; and the decoy's (a shallow scratch, level 3) — the same every time */
function crackOf(s) { const sg = hash(s, 3) > 0.5 ? 1 : -1; return { off: sg * (0.2 + hash(s, 5) * 0.16), tilt: (hash(s, 7) - 0.5) * 0.55, doff: -sg * (0.26 + hash(s, 9) * 0.12), dtilt: (hash(s, 11) - 0.5) * 0.5 }; }
/** the rock of sector s (made once, kept in SH.big[s]); split: shown parted (a reload after its reading, before the paving) */
function bigRock(X, s, split) {
  SH.big = SH.big || {};
  if (SH.big[s]) return SH.big[s];
  const b = SH.bould[s]; let inf = null; try { inf = X.stages.boulderInfo && X.stages.boulderInfo(s); } catch (e) { inf = null; }
  const gy = inf ? inf.gy : X.ground(b[0], b[1]);
  const R = makeRock(X.THREE, { x: b[0], z: b[1], gy, r: b[2] * 0.92, sy: inf ? Math.min(0.95, inf.sy) : 0.85, yaw: inf ? inf.yaw : hash(s, 1) * TAU, seed: s * 13 + 5, mat: rockMat(X) });
  X.props.root.add(R.group);
  try { X.stages.boulderHide(s, true, !!split); } catch (e) { /* */ }
  if (split) { const st = bigStand(X, s), phiK = Math.atan2(st.z - b[1], st.x - b[0]), c = crackOf(s); R.halves(R.plane(phiK + c.off, c.tilt)); R.part(1); }
  SH.big[s] = R; return R;
}
/** the halves go (the crews dragged them off before the paving) */
function bigGone(X, s) { const R = SH.big && SH.big[s]; if (!R) return; R.dispose(); SH.big[s] = null; try { X.stages.boulderHide(s, false, true); } catch (e) { /* */ } }
/** a wooden wedge: a tapered block, its thin edge into the slot, its head out (local −z = into the rock) */
function wedgeGeo(T) {
  if (SH.wedgeG) return SH.wedgeG;
  const sh = new T.Shape(); sh.moveTo(-0.24, 0); sh.lineTo(0.24, 0); sh.lineTo(0.05, 0.85); sh.lineTo(-0.05, 0.85); sh.closePath();
  const g = new T.ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: false }); g.translate(0, 0, -0.15); g.rotateX(Math.PI / 2);
  g.computeVertexNormals();   // (its thin edge at +z: lookAt points +z into the slot)
  SH.wedgeG = g; return g;
}
/** ── h117 ── oak with a darker grain (the wedges); the mirror's spot light, made once and kept in the scene (its count of lights never
 *  changes, so no material is rebuilt when it is used) ── /h117 ── */
function wedgeMat(X) { if (!SH.wedgeM) SH.wedgeM = new X.THREE.MeshStandardMaterial({ color: '#9A6A3A', roughness: 0.85, flatShading: true }); return SH.wedgeM; }
function spotLight(X) {
  if (SH.spotL) return SH.spotL;
  const L = new X.THREE.SpotLight(0xFFF0C4, 0, 0, 0.3, 0.55, 2); L.castShadow = false; L.name = 'h117-mirror-light';
  X.props.root.add(L); X.props.root.add(L.target); SH.spotL = L; return L;
}
export const READ = {
  icon: '🔍', title: 'קריאת הסלע',
  walkLine: (m) => (m.free ? 'סלע גדול בהר · עבודת רשות' : `הסלע הגדול של גזרה ${m.s + 1}: מוצאים בו את הסדק`),
  stand(m, X) { const b = SH.bould[m.s]; if (!b) return null; if (!SH.bigSt) SH.bigSt = {}; const p = SH.bigSt[m.s] || (SH.bigSt[m.s] = bigStand(X, m.s)); return { x: p.x, z: p.z, face: [b[0], b[1]] }; },
  prepare(m, X) {
    const b = SH.bould[m.s]; if (!b) return; const C = SH.crew, p = READ.stand(m, X);
    SH.secCrew = SH.secCrew || []; for (const w of SH.secCrew) C.remove(w); SH.secCrew = [];
    bigRock(X, m.s, false);
    // the helper with the water jar stands beside him (he pours when told); a mason on the far side cuts slots with a chisel
    const pa = Math.atan2(p.z - b[1], p.x - b[0]);
    const jx = b[0] + Math.cos(pa - 0.5) * (b[2] + 3.2), jz = b[1] + Math.sin(pa - 0.5) * (b[2] + 3.2);
    SH.secCrew.push(C.add(jx, jz, { role: 'hold', item: 'jar', fx: b[0], fz: b[1], crew: 1 }));
    SH.jarMan = SH.secCrew[SH.secCrew.length - 1];
    const fa = pa + Math.PI * 0.75, fx = b[0] + Math.cos(fa) * (b[2] + 1.4), fz = b[1] + Math.sin(fa) * (b[2] + 1.4);
    SH.secCrew.push(C.add(fx, fz, { role: 'hammer', item: 'mallet', fx: b[0], fz: b[1], crew: 3 }));
  },
  /* ── h117 ── (ירון 10.11: "רואים את הסדק לפני שהאור מונח על הסלע. האור נשבר על הסלע בלי קשר לצורתו של הסלע. הסדק עובר רק בחלק קטן
   * של הסלע, לא מבינים מהו מנגנון הביקוע"; "כל יתד נכנסה ישר למקומה בלי ניסיון שני, אפס אתגר"; "קריאת הסלע בלי טעויות תמיד מושלם")
   * rebuilt in three parts (docs/specs/build117-brief.md §R): (1) the mirror's light is a real spot on the rock, the finger puts it
   * where it touches the rock; the crack, unseen without the light, is traced along with it from the ground to the top and chalked
   * where the light has passed; it goes right round the rock (the masons chalk the far side once the near side is traced); at level 3
   * a scratch ends in the middle of the face. (2) wedges sit only on the crack, then are struck in rounds: three blows each, evenly
   * (h109/wedges.js); a wedge two blows ahead pulls the crack aside; from level 2 an unstruck wedge backs out. (3) the water runs round
   * the whole crack, the wedges swell, the rock opens on the line. (The method: illustration, המחשה.) ── /h117 ── */
  make(m, X) {
    const lv = X.level(), s = m.s, b = SH.bould[s], st = READ.stand(m, X), T = X.THREE;
    const R = bigRock(X, s, false), gy = R.gy;
    const OB = (SH.bould || []).map((q, i) => (i === s || !q ? null : { x: q[0], y: X.ground(q[0], q[1]) + q[2] * 0.45, z: q[1], r: q[2] * 0.95 })).filter(Boolean);
    const wShot = (o) => { let best = null, bn = 1e9; for (const dk of [1, 0.75]) for (const k of [1, -1, 0.5, -0.5, 1.6, -1.6, 0]) { const w = X.workShot({ x: b[0], z: b[1] }, st, { ...o, dist: o.dist * dk, side: o.side * k }); const n = viewBlock(X, w.p, w.t, OB) + (rayBlocked(X, w.p, w.t) ? 6 : 0); if (n < bn) { bn = n; best = w; } if (!n) return w; } return best; };
    const nW = [3, 4, 5][lv - 1], TOL = [26, 20, 14][lv - 1], phiK = Math.atan2(st.z - b[1], st.x - b[0]), ck = crackOf(s);
    const A = { step: 'trace', t: 0, lines: [], pick: null, wedges: [], water: 0, hold: false, res: { trace: null, rounds: null, water: null }, fallen: 0, busy: 0, wind: lv >= 3, spot: null, spotN: null, round: null, early: 0, creakT: 0 };
    const gR = clamp(R.r * 0.3, 1.1, 2.4);
    const C0 = R.C, tv = new T.Vector3(), tv2 = new T.Vector3(), up = new T.Vector3(0, 1, 0), tq = new T.Quaternion();
    const nrmAt = (p) => tv2.copy(p).sub(C0).normalize().clone();
    const grooveM = new T.MeshBasicMaterial({ color: 0x160E06, transparent: true, opacity: 0.9, depthWrite: false, side: T.DoubleSide });
    const chalkM = new T.MeshBasicMaterial({ color: 0xF7F2E4, transparent: true, opacity: 0.95, depthWrite: false, side: T.DoubleSide });
    const crookM = new T.MeshBasicMaterial({ color: 0x8A3414, transparent: true, opacity: 0.95, depthWrite: false, side: T.DoubleSide });
    /** a flat strip lying on the rock from a to c (width w), a hair off the surface; off: sideways shift (the chalk beside the groove) */
    function strip(a, c, w, mat, off = 0, lift = 0.03) {
      const na = nrmAt(a), nc = nrmAt(c), d = tv.subVectors(c, a), side = new T.Vector3().crossVectors(d, na).normalize();
      const P = [];
      for (const [p, n] of [[a, na], [c, nc]]) for (const sg of [-1, 1]) { const q = p.clone().addScaledVector(side, off + (sg * w) / 2).addScaledVector(n, lift); P.push(q.x, q.y, q.z); }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); g.setIndex([0, 1, 2, 2, 1, 3]);
      const mm = new T.Mesh(g, mat); mm.renderOrder = 995; mm.visible = false; X.props.root.add(mm); return mm;
    }
    function mkLine(psi, tilt, ok) {
      const Pl = R.plane(psi, tilt);
      const pts = ok ? R.crackPts(Pl, -0.3, Math.PI + 0.3, 46) : R.crackPts(Pl, -0.3, 0.72, 15);
      if (pts.length < 4) return null;
      let top = 0; pts.forEach((q, i) => { if (q.y > pts[top].y) top = i; });
      const near = ok ? top : pts.length - 1;
      const seg = [], chalk = [];
      for (let i = 0; i < pts.length - 1; i++) { seg.push(strip(pts[i], pts[i + 1], ok ? 0.17 : 0.11, grooveM)); chalk.push(i % 2 ? null : strip(pts[i], pts[i + 1], 0.07, chalkM, ok ? 0.24 : 0.18)); }
      return { Pl, psi, pts, ok, seg, chalk, mark: pts.map(() => false), near, dead: false, done: false };
    }
    // (the crack runs on the face the camera sees best: between his side and the camera's, its own place on each rock)
    const ws0 = wShot({ dist: R.r * 1.9 + 9, el: 24, side: -0.95, lift: R.r * 0.3 });
    const phiC = Math.atan2(ws0.p[2] - b[1], ws0.p[0] - b[0]), dC = Math.atan2(Math.sin(phiC - phiK), Math.cos(phiC - phiK));
    const psi0 = phiK + dC * 0.6;
    { const L = mkLine(psi0 + ck.off * 0.45, ck.tilt, true); if (L) A.lines.push(L); }
    if (lv >= 3) { const L = mkLine(psi0 + ck.doff * 0.55, ck.dtilt, false); if (L) A.lines.push(L); }
    const TRUE = A.lines.find((L) => L.ok) || A.lines[0];
    function markSeg(L, i, on) { if (L.seg[i]) L.seg[i].visible = on; if (L.chalk[i]) L.chalk[i].visible = on; }
    function reveal(L) { for (let i = 0; i < L.pts.length - 1; i++) markSeg(L, i, L.mark[i] || L.mark[i + 1]); }
    // the mirror: a bronze disc with a rim and a handle, in his hand; a short ray of the sun to it, its ray to the rock
    const mirror = new T.Group();
    { const disc = new T.Mesh(new T.CircleGeometry(0.5, 24), new T.MeshStandardMaterial({ color: '#E8C27A', metalness: 1, roughness: 0.12, emissive: '#B08030', emissiveIntensity: 0.55, side: T.DoubleSide })); mirror.add(disc);
      const rim = new T.Mesh(new T.TorusGeometry(0.5, 0.05, 6, 24), new T.MeshStandardMaterial({ color: '#8A5A22', metalness: 0.7, roughness: 0.4 })); mirror.add(rim);
      const hd = new T.Mesh(new T.CylinderGeometry(0.05, 0.06, 0.6, 6), X.props.M.woodD); hd.position.set(0, -0.78, 0); mirror.add(hd); }
    X.props.root.add(mirror);
    const rayM = (op) => { const mm = X.props.M.beam.clone(); mm.opacity = op; return mm; };
    const beamIn = new T.Mesh(new T.CylinderGeometry(0.08, 0.2, 1, 8, 1, true), rayM(0.12)), beamOut = new T.Mesh(new T.CylinderGeometry(0.08, 0.32, 1, 8, 1, true), rayM(0.16));
    for (const bm of [beamIn, beamOut]) { bm.frustumCulled = false; bm.renderOrder = 998; X.props.root.add(bm); }
    const SPOT = spotLight(X);
    const SUN = new T.Vector3(-0.35, 1, 0.45).normalize();
    function rayBetween(mesh, a, c) { tv.subVectors(c, a); const L = tv.length(); mesh.position.copy(a).addScaledVector(tv, 0.5); tq.setFromUnitVectors(up, tv.normalize()); mesh.quaternion.copy(tq); mesh.scale.set(1, L, 1); }
    const mp = new T.Vector3(), sunP = new T.Vector3(), spotW = new T.Vector3(), hp = {};
    const hP = clamp(R.r * R.sy * 0.32, 1.4, 3.2);
    { const h0 = R.hitAt(phiK, hP * 0.6); if (h0) { A.spot = h0.p.clone(); A.spotN = h0.n.clone(); } }
    function light(dt) {
      X.stages.heroXYZ(hp);
      const fx = Math.cos(phiK + Math.PI), fz = Math.sin(phiK + Math.PI);
      mp.set(hp.x + fx * 0.75 - fz * 0.35, hp.y + 2.25, hp.z + fz * 0.75 + fx * 0.35);
      mirror.position.copy(mp);
      const on = (A.step === 'trace' || A.step === 'wedge') && !!A.spot;
      mirror.visible = A.step === 'trace' || A.step === 'wedge';
      beamIn.visible = beamOut.visible = on;
      if (!on) { SPOT.intensity = 0; return; }
      spotW.copy(A.spot);
      if (A.wind) { const n = A.spotN || up; const a1 = new T.Vector3().crossVectors(n, up).normalize(), a2 = new T.Vector3().crossVectors(n, a1).normalize(); spotW.addScaledVector(a1, Math.sin(A.t * 2.3) * 0.28 + Math.sin(A.t * 7.1) * 0.08).addScaledVector(a2, Math.cos(A.t * 1.7) * 0.2); }
      const toRock = tv.subVectors(spotW, mp).normalize().clone(); const nrm = toRock.clone().add(SUN).normalize();
      mirror.lookAt(mp.x + nrm.x, mp.y + nrm.y, mp.z + nrm.z);
      sunP.copy(mp).addScaledVector(SUN, 3.2);
      rayBetween(beamIn, sunP, mp); rayBetween(beamOut, mp, spotW);
      // the real light: a spot from the mirror on the rock (it bends over the facets; nothing of it outside the rock but what it lights)
      SPOT.position.copy(mp); SPOT.target.position.copy(spotW); SPOT.target.updateMatrixWorld(); SPOT.angle = Math.atan2(gR, mp.distanceTo(spotW)); SPOT.intensity = 80 + Math.sin(A.t * 5) * 6;
      // what the light passes over is chalked
      for (const L of A.lines) {
        if (L.dead) continue; let ch = false;
        for (let i = 0; i < L.pts.length; i++) if (!L.mark[i] && L.pts[i].distanceTo(spotW) < gR * 0.55) { L.mark[i] = true; ch = true; }
        if (ch) {
          reveal(L); X.play('find');
          if (!L.ok && L.mark.every(Boolean) && !L.dead) {
            L.dead = true; const e = L.pts[L.pts.length - 1]; X.word({ x: e.x, y: e.y + 1, z: e.z }, 'שריטה: נגמרת כאן · זה לא הסדק');
            setTimeout(() => { for (let i = 0; i < L.pts.length - 1; i++) markSeg(L, i, false); }, 1400);
          }
        }
      }
      if (A.step === 'trace') {
        const L = TRUE; let n = 0; for (let i = 0; i <= L.near; i++) if (L.mark[i]) n++;
        if (L.mark[L.near] && n >= (L.near + 1) * 0.85) traced();
      }
    }
    function traced() {
      const L = TRUE; A.step = 'wedge'; A.res.trace = A.fallen ? 'good' : 'gold';
      for (let i = 0; i <= L.near; i++) L.mark[i] = true;
      reveal(L);
      // the masons walk round and chalk the rest of it, over the top and down the far side (seen growing)
      let k = L.near; const grow = () => { if (A.step === 'split' || k >= L.pts.length - 1) return; L.mark[++k] = true; markSeg(L, k - 1, true); setTimeout(grow, 60); }; grow();
      const tp = L.pts[L.near]; X.hit({ x: tp.x, y: tp.y + 1.2, z: tp.z }, 'gold', { text: 'הסדק עובר בכל הסלע', craft: 'סתתים' });
      X.line(`הקישו על הסדק · ${nW} יתדות לאורכו`);
      const q = L.pts[Math.floor(L.near * 0.3)]; X.hand({ x: q.x, y: q.y, z: q.z }, 0, 12);
    }
    function nearDist(L, p) {
      let best = 1e9, bu = 0; const n = L.near;
      for (let i = 0; i < n; i++) {
        const a = X.scr(L.pts[i].x, L.pts[i].y, L.pts[i].z), c = X.scr(L.pts[i + 1].x, L.pts[i + 1].y, L.pts[i + 1].z);
        const vx = c.x - a.x, vy = c.y - a.y, l2 = vx * vx + vy * vy || 1, u = clamp(((p.x - a.x) * vx + (p.y - a.y) * vy) / l2, 0, 1);
        const d = Math.hypot(a.x + vx * u - p.x, a.y + vy * u - p.y); if (d < best) { best = d; bu = (i + u) / Math.max(1, n); }
      }
      return { d: best, u: bu };
    }
    const ptAt = (L, u) => { const n = L.near, f0 = clamp(u, 0, 1) * n, i = Math.min(n - 1, Math.floor(f0)), f = f0 - i; return L.pts[i].clone().lerp(L.pts[i + 1], f); };
    const outOf = (p) => nrmAt(p);
    const tally = (n) => { const cv = document.createElement('canvas'); cv.width = 128; cv.height = 64; const g = cv.getContext('2d'); g.strokeStyle = 'rgba(250,246,234,.95)'; g.lineWidth = 9; g.lineCap = 'round'; for (let i = 0; i < n; i++) { g.beginPath(); g.moveTo(30 + i * 34, 10); g.lineTo(30 + i * 34, 54); g.stroke(); } const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(cv), transparent: true, depthWrite: false, depthTest: false })); sp.scale.set(0.9, 0.45, 1); sp.renderOrder = 999; return sp; };
    function wedgeMesh(p) {
      const g = new T.Group(); const w = new T.Mesh(wedgeGeo(T), wedgeMat(X)); w.castShadow = true; g.add(w);
      const band = new T.Mesh(new T.BoxGeometry(0.5, 0.08, 0.34), X.props.M.iron || X.props.M.woodD); band.position.set(0, 0, 0.62); band.rotation.x = Math.PI / 2; g.add(band);
      const o = outOf(p); g.position.copy(p).addScaledVector(o, 0.75); g.lookAt(p.x - o.x * 9, p.y - o.y * 9, p.z - o.z * 9);
      g.rotation.z += (hash(p.x, p.z) - 0.5) * 0.3;
      // the slot the mason cut for it: a dark notch on the crack that opens with every blow
      const slot = new T.Mesh(new T.BoxGeometry(0.16, 0.16, 0.6), grooveM); slot.position.copy(p).addScaledVector(o, 0.02); slot.lookAt(p.x - o.x, p.y - o.y, p.z - o.z); slot.renderOrder = 994; X.props.root.add(slot);
      X.props.root.add(g); return { w: g, o, p, slot, blows: 0, tr: 0, tag: null };
    }
    function seat(W) {
      W.w.position.copy(W.p).addScaledVector(W.o, 0.62 - 0.14 * W.blows);
      W.slot.scale.set(1 + W.blows * 0.9, 1, 1);
      if (W.tag) { X.props.remove(W.tag); W.tag = null; }
      if (W.blows) { W.tag = tally(W.blows); W.tag.position.copy(W.p).addScaledVector(W.o, 0.75).add(new T.Vector3(0, 0.5, 0)); X.props.root.add(W.tag); }
    }
    /** the kohen swings at a point on the rock: brought within his reach (beyond it the old world would set his own banker and stone
     *  before him, a block with wedges that is not this rock's) */
    function swing(p) {
      const h = X.heroAt ? X.heroAt() : null, hx = h && Number.isFinite(h.x) ? h.x : st.x, hz = h && Number.isFinite(h.z) ? h.z : st.z;
      const dx = p.x - hx, dz = p.z - hz, d = Math.hypot(dx, dz) || 1, k = Math.min(1, 6.4 / d);
      const x = hx + dx * k, z = hz + dz * k, g = X.ground(x, z);
      try { X.hero.act('split', { x, y: Math.min(Math.max(p.y, g + 0.6), g + 2.6), z }, { snap: true }); } catch (e) { /* */ }
      try { if (X.hero.workpiece() != null) X.hero.workpiece(null); } catch (e) { /* */ }
    }
    function fall(p, why) {
      // (no bite: it drops at the rock's foot)
      const W0 = wedgeMesh(p); X.props.remove(W0.slot); const w = W0.w;
      X.play('wood'); X.dust(p.x, p.y, p.z, 3, 1);
      swing(p);
      const t0 = performance.now(), y0 = w.position.y, g = X.ground(w.position.x + W0.o.x, w.position.z + W0.o.z);
      const fallStep = () => { const k = Math.min(1, (performance.now() - t0) / 500); w.position.x += W0.o.x * 0.04; w.position.z += W0.o.z * 0.04; w.position.y = y0 + (g + 0.15 - y0) * k * k; w.rotation.x += 0.2; if (k < 1) requestAnimationFrame(fallStep); };
      fallStep(); A.fallen++; (A.junk = A.junk || []).push(w);
      X.word({ x: p.x, y: p.y + 1.2, z: p.z }, why || 'לא על הסדק: היתד לא נתפסה ונפלה');
    }
    function crookFrom(W) {
      // the crack pulled aside: a crooked branch runs off the line from this wedge (on the rock's own face)
      const L = TRUE, i = Math.round(W.u * L.near), a = L.pts[Math.max(0, i - 1)], c = L.pts[Math.min(L.pts.length - 1, i + 1)];
      const along = tv.subVectors(c, a).normalize().clone(), side = new T.Vector3().crossVectors(along, outOf(W.p)).normalize(), sg = hash(i, s) > 0.5 ? 1 : -1;
      const P = [W.p.clone()]; for (let k = 1; k <= 5; k++) { const q = W.p.clone().addScaledVector(side, sg * k * 0.32).addScaledVector(along, (k % 2 ? 0.12 : -0.05) - k * 0.06); const h = R.hitDir(tv.subVectors(q, C0).normalize().clone()); P.push(h ? h.p : q); }
      const out = []; for (let k = 0; k < P.length - 1; k++) { const mm = strip(P[k], P[k + 1], 0.12, crookM); mm.visible = true; out.push(mm); }
      (A.crooks = A.crooks || []).push(...out);
    }
    function strike(W, i) {
      if (A.busy > 0) return;
      A.busy = 0.35;
      swing(W.p);
      const r = WG.blow(A.round, i, A.t);
      if (!r.ok) { if (r.full) X.word({ x: W.p.x, y: W.p.y + 1.2, z: W.p.z }, 'היתד הזאת כבר עמוק · הכו באחרות'); return; }
      W.blows = A.round.blows[i]; seat(W);
      X.play('wedge', { n: W.blows * 2 }); X.sparks(W.p.x, W.p.y, W.p.z, 5); X.dust(W.p.x, W.p.y, W.p.z, 2, 0.8); X.shake(0.04, 0.08);
      if (r.crooked) { crookFrom(W); X.play('crack'); X.word({ x: W.p.x, y: W.p.y + 1.4, z: W.p.z }, 'יתד הקדימה: הסדק נמשך הצידה'); }
      if (r.done) {
        const R2 = A.round; A.res.rounds = R2.crooked === 0 && R2.loose === 0 ? 'gold' : R2.crooked + R2.loose <= 1 ? 'good' : 'ok';
        const mid = ptAt(TRUE, 0.5);
        if (A.res.rounds === 'gold') X.hit({ x: mid.x, y: mid.y + 1.5, z: mid.z }, 'gold', { text: 'מכות שוות', craft: 'סתתים' }); else X.word({ x: mid.x, y: mid.y + 1.5, z: mid.z }, R2.crooked ? 'הסדק נמשך הצידה' : 'יתד התרופפה בדרך');
        A.step = 'water'; A.water = 0; waterMake(TRUE);
        try { X.hero.walkTo({ x: st.x, z: st.z, face: [b[0], b[1]] }); } catch (e) { /* */ }
        X.line('החזיקו לשפוך מים לסדק · שחררו כשהחריקה נגמרת');
        const ws = wShot({ dist: R.r * 1.7 + 8, el: 22, side: -0.95, lift: R.r * 0.3 }); X.shot(ws.p, ws.t, 0.7);
        X.hand({ x: water.top.x, y: water.top.y + 0.6, z: water.top.z }, 0, 0);
      }
    }
    let water = null;
    function waterMake(L) {
      const pts = L.pts.slice(0, L.near + 1).reverse().concat(L.pts.slice(L.near + 1));   // (from the top down both faces)
      const mk = (P) => { const g = new T.TubeGeometry(new T.CatmullRomCurve3(P), P.length * 3, 0.09, 5, false); const mm = new T.MeshStandardMaterial({ color: '#5EA8E8', emissive: '#2E6FB0', emissiveIntensity: 0.55, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.92 }); const mesh = new T.Mesh(g, mm); mesh.renderOrder = 996; g.setDrawRange(0, 0); X.props.root.add(mesh); return { mesh, g, n: g.index ? g.index.count : g.attributes.position.count }; };
      const a = mk(L.pts.slice(0, L.near + 1).reverse()), c = L.pts.length - L.near > 2 ? mk(L.pts.slice(L.near)) : null;
      water = { parts: [a, c].filter(Boolean), top: pts[0] };
    }
    async function split() {
      A.step = 'split'; X.line(''); SPOT.intensity = 0;
      const g = A.res, R2 = A.round, crooked = R2.crooked >= 1, lost = R2.crooked >= 3 || (g.water === 'ok' && crooked);
      const at = { x: b[0], y: gy + R.r * R.sy * 0.9, z: b[1] };
      X.play('creak'); X.shake(0.25, 0.35);
      const ws = wShot({ dist: R.r * 2.6 + 9, el: 44, side: -0.5, lift: R.r * 0.4 }); X.shot(ws.p, ws.t, 1.2);
      R.halves(TRUE.Pl);
      const t0 = performance.now();
      await new Promise((res) => { const step = () => { const k = Math.min(1, (performance.now() - t0) / 1500); R.part(0.25 + 0.75 * ease(k)); if (water) for (const w of water.parts) w.mesh.material.opacity = 0.92 * (1 - k); if (k < 1) requestAnimationFrame(step); else res(); }; step(); });
      X.play('split'); X.dust(b[0], gy + 1, b[1], 26, R.r * 0.7); X.shake(0.3, 0.6);
      cleanup();
      let waste = 1;
      if (lost) { X.word(at, 'הסדק נמשך הצידה יותר מדי: הסלע נפסל · הצוות גורר לפסולת'); waste = 3; try { X.loss && X.loss(20, at, 'הסלע נפסל', 1); } catch (e) { /* */ } }
      else if (crooked) { X.word(at, 'נבקע במדרגות: יתד הקדימה · כשר'); waste = 2; }
      else if (g.trace === 'gold' && g.rounds === 'gold' && g.water === 'gold') X.bonus(150, 'great', 'נבקע בדיוק לאורך הסדק · מהודר');
      else X.word(at, 'נבקע לאורך הסדק');
      if (waste) wasteAdd(X, waste, at);
      const v = (k) => (k === 'gold' ? 1 : k === 'good' ? 0.8 : 0.5);
      const q = lost ? 0 : ((v(g.trace) + v(g.rounds) + v(g.water)) / 3) * (crooked ? 0.75 : 1);
      const perfect = !lost && !A.fallen && R2.crooked === 0 && R2.loose === 0 && g.water === 'gold';
      setTimeout(() => {
        const n = lost ? 0 : crooked ? 2 : 4;
        dressStart(X, s, n, lost);
        X.word({ x: b[0], y: gy + R.r * R.sy + 1.5, z: b[1] }, lost ? 'הסלע נפסל · נגרר לבור הפסולת' : `שני החצאים נחצבים ל־${n} אבני בנייה · אל מחסן האבנים`);
        setTimeout(() => X.end({ q, stars: lost ? 0 : q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1, lost, perfect, at }), 3400);
      }, 900);
    }
    function cleanup() {
      for (const L of A.lines) { for (const mm of L.seg) X.props.remove(mm); for (const mm of L.chalk) if (mm) X.props.remove(mm); }
      for (const W of A.wedges) { X.props.remove(W.w); X.props.remove(W.slot); if (W.tag) X.props.remove(W.tag); }
      for (const mm of A.crooks || []) X.props.remove(mm); A.crooks = [];
      if (water) { for (const w of water.parts) X.props.remove(w.mesh); water = null; }
      A.lines.forEach((L) => { L.seg = []; L.chalk = []; }); A.wedges = [];
    }
    const api = {
      begin() {
        const ws = wShot({ dist: R.r * 1.9 + 9, el: 24, side: -0.95, lift: R.r * 0.3 });
        X.shot(ws.p, ws.t, 0.9);
        X.line('גררו על הסלע · המראה מאירה · עקבו אחרי הסדק מהקרקע עד הגג');
        { const q = TRUE.pts[0]; X.hand({ x: q.x, y: q.y + 0.2, z: q.z }, 0, -70); }
        try { X.hero.arm(null); } catch (e) { /* */ }
      },
      update(dt) {
        A.t += dt; if (A.busy > 0) A.busy -= dt; light(dt);
        if (A.step === 'strike' && A.round) {
          for (const e of WG.tick(A.round, A.t, lv)) {
            const W = A.wedges[e.i]; if (!W) continue;
            if (e.tremble) { W.tr = 0.3; }
            if (e.out) { W.blows = A.round.blows[e.i]; seat(W); X.play('wood'); X.word({ x: W.p.x, y: W.p.y + 1.2, z: W.p.z }, 'יתד התרופפה · הכו בה שוב'); }
          }
          for (const W of A.wedges) { if (W.tr > 0) { W.tr -= dt; W.w.rotation.z += Math.sin(A.t * 60) * 0.03; } }
        }
        if (A.step === 'water' && water) {
          if (A.hold) {
            A.water += dt / 2.6;
            A.pourT = (A.pourT || 0) - dt; if (A.pourT <= 0 && SH.jarMan) { A.pourT = 2.3; try { SH.crew.A.pose(SH.jarMan.a, 'pour'); } catch (e) { /* */ } }
            const k = Math.min(1, A.water);
            for (const w of water.parts) w.g.setDrawRange(0, Math.floor((w.n * k) / 3) * 3);
            for (const W of A.wedges) { W.w.scale.setScalar(1 + k * 0.25); W.slot.scale.set(1 + W.blows * 0.9 + k * 1.5, 1, 1); }
            for (const L of A.lines) if (L.ok) for (const mm of L.seg) mm.scale.setScalar(1);
            A.creakT -= dt; if (A.water < 1 && A.creakT <= 0) { A.creakT = 0.5; X.play('creak'); X.shake(0.06, 0.1); }
            if (A.water > 1) { A.spillT = (A.spillT || 0) - dt; if (A.spillT <= 0) { A.spillT = 0.2; const q = TRUE.pts[0]; X.dust(q.x, q.y + 0.1, q.z, 2, 0.6); } }
            if (A.water > 1 + [1.0, 0.55, 0.4][lv - 1] + 0.6) { A.hold = false; api.up(); }
          }
        }
      },
      wants() { return A.step !== 'split'; },
      down(p) {
        A.p0 = { x: p.x, y: p.y }; A.tDown = performance.now() / 1000; A.moved = false;
        if (A.step === 'water') { A.hold = true; X.play('pour'); A.pourT = 0; X.line('היתדות הרטובות מתנפחות ופותחות את הסלע'); }
        else if (A.step === 'trace') api.move(p);
      },
      move(p) {
        if (A.p0 && Math.hypot(p.x - A.p0.x, p.y - A.p0.y) > 10) A.moved = true;
        if (A.step !== 'trace' && !(A.step === 'wedge' && A.moved)) return;
        // the light goes where the finger touches the rock
        const h = X.rayAt(p.x, p.y).intersectObject(R.whole, false)[0];
        if (h) { A.spot = h.point.clone(); A.spotN = h.face ? h.face.normal.clone().transformDirection(R.whole.matrixWorld) : nrmAt(h.point); X.hand(null); }
      },
      up(p) {
        const tap = p && A.p0 && Math.hypot(p.x - A.p0.x, p.y - A.p0.y) < 12 && performance.now() / 1000 - A.tDown < 0.4;
        if (A.step === 'trace' && tap) {
          const L = TRUE, r = nearDist(L, p);
          if (r.d < 40) X.word({ x: L.pts[L.near].x, y: L.pts[L.near].y + 1, z: L.pts[L.near].z }, 'קודם עקבו באור אחרי כל הסדק · עד הגג');
          return;
        }
        if (A.step === 'wedge' && tap) {
          const r = nearDist(TRUE, p);
          if (r.d > TOL) { const h = X.rayAt(p.x, p.y).intersectObject(R.whole, false)[0]; fall(h ? h.point : ptAt(TRUE, 0.1)); return; }
          if (A.wedges.some((w) => Math.abs(w.u - r.u) < 0.07)) { fall(ptAt(TRUE, r.u), 'צמוד מדי ליתד הקודמת: היתד לא נתפסה ונפלה'); return; }
          const p3 = ptAt(TRUE, r.u), W = wedgeMesh(p3); W.u = r.u; A.wedges.push(W);
          swing(p3);
          X.play('wood'); X.dust(p3.x, p3.y, p3.z, 2, 0.8); X.hand(null);
          X.count({ x: p3.x, y: p3.y + 1.4, z: p3.z }, `${A.wedges.length}/${nW}`);
          if (A.wedges.length >= nW) {
            X.count(null); A.wedges.sort((a, c) => a.u - c.u); A.round = WG.newRound(nW); A.step = 'strike'; SPOT.intensity = 0;
            X.line('מכים בסבבים · כל יתד שלוש מכות · אף יתד לא מקדימה');
            const q = A.wedges[0].p; X.hand({ x: q.x, y: q.y + 0.3, z: q.z }, 0, 10);
          }
          return;
        }
        if (A.step === 'strike' && p) {
          let bi = -1, bd = 46; A.wedges.forEach((W, i) => { const q = W.w.position, r = X.scr(q.x, q.y, q.z), d = Math.hypot(r.x - p.x, r.y - p.y); if (r.on !== false && d < bd) { bd = d; bi = i; } });
          if (bi >= 0) { X.hand(null); strike(A.wedges[bi], bi); }
          return;
        }
        if (A.step === 'water' && (A.hold || A.water > 0)) {
          A.hold = false; X.hand(null);
          if (SH.jarMan) { try { SH.crew.A.pose(SH.jarMan.a, 'stand'); } catch (e) { /* */ } }
          const over = A.water - 1, win = [1.0, 0.55, 0.4][lv - 1];
          if (A.water < 0.85) { A.early++; X.word({ x: b[0], y: gy + R.r * R.sy * 1.1, z: b[1] }, 'עוד לא: הסלע עוד חורק, הסדק לא מלא'); return; }
          A.res.water = over >= -0.15 && over <= win ? (over >= 0 ? 'gold' : 'good') : over <= win + 0.6 ? 'good' : 'ok';
          if (A.res.water !== 'ok') X.hit({ x: b[0], y: gy + R.r * R.sy, z: b[1] }, A.res.water, { text: 'בזמן', craft: 'סתתים' }); else X.word({ x: b[0], y: gy + R.r * R.sy, z: b[1] }, 'יותר מדי מים: נשפך');
          split();
        }
      },
      cancel() { if (A.step === 'water') { A.hold = false; if (SH.jarMan) { try { SH.crew.A.pose(SH.jarMan.a, 'stand'); } catch (e) { /* */ } } } },
      end() { SPOT.intensity = 0; for (const o of [beamIn, beamOut, mirror]) X.props.remove(o); cleanup(); for (const j of A.junk || []) X.props.remove(j); X.meter(null); X.count(null); },
      at() { return { x: b[0], y: gy + R.r * R.sy, z: b[1] }; },
      dbg() {
        const sc = (q) => { const r2 = X.scr(q.x, q.y, q.z); return [Math.round(r2.x), Math.round(r2.y)]; };
        const L = TRUE;
        return { step: A.step, lv, nW, tol: TOL, busy: A.busy > 0, near: L.pts.slice(0, L.near + 1).map(sc), marked: L.mark.slice(0, L.near + 1).map((v) => (v ? 1 : 0)).join(''), lines: A.lines.map((q) => ({ ok: q.ok, n: q.pts.length, dead: q.dead, m: q.mark.filter(Boolean).length })),
          wedges: A.wedges.map((W) => ({ scr: sc(W.w.position), blows: W.blows, u: +W.u.toFixed(2) })), round: A.round ? { blows: A.round.blows.slice(), crooked: A.round.crooked, loose: A.round.loose } : null, fallen: A.fallen, water: +A.water.toFixed(2), res: A.res, split: R.split ? +R.split.k.toFixed(2) : 0, spot: A.spot ? sc(A.spot) : null };
      },
    };
    return api;
  },
};

/* ───────── the waste pile and the pits (the address book: the pile on the slope east of the kohen's cells, the pits below it) ─────────
 * ── h115 ── (ירון 10.11: "פסולת: עדיף שתיזרק לתוך בור שיתכסה על ידי המגרפים") the waste is tipped into a pit dug down the slope; the
 * rakers spread and cover it; five sledge loads and more fill a pit level, then the next is used. (Josephus, War 5.5.1 (5.185–188):
 * the valleys round the Mount filled; the pits: illustration.) ── /h115 ── */
const PILE = { x: BOOK.pile.x, z: BOOK.pile.z };
const PIT_CAP = 15;   // (chunks that fill a pit to its rim)
function pileSync(X) {
  const n = Math.min(14, X.M.st.waste | 0); SH.pileM = SH.pileM || [];
  while (SH.pileM.length > n) X.props.remove(SH.pileM.pop());
  SH.pileM.forEach((mm, i) => { if (!mm.userData.on) mm.position.y = X.ground(mm.position.x, mm.position.z) + mm.scale.x * 0.4 + Math.floor(i / 5) * 0.35; });
  while (SH.pileM.length < n) {
    const i = SH.pileM.length, a = i * 2.4, r = 0.6 + (i % 5) * 0.45, x = PILE.x + Math.cos(a) * r, z = PILE.z + Math.sin(a) * r, s = 0.85 + hash(i, 2) * 0.4;
    const mm = new X.THREE.Mesh(X.props.geo.chunk, X.props.M.stoneD); mm.scale.set(s, s * 0.8, s); mm.position.set(x, X.ground(x, z) + s * 0.4 + Math.floor(i / 5) * 0.35, z); mm.rotation.set(i, i * 2, 0); mm.castShadow = true; X.props.root.add(mm); SH.pileM.push(mm);
  }
}
/** the pits as the save has them (st.pitIn[i]: chunks in pit i) ── h117 ── (ירון 10.11: "האבנים נופלות לבור אבל לא נערמות") an open
 *  pit keeps its floor and the chunks tipped in lie heaped on it (heapSpots, the same heap after a reload); a full pit is covered
 *  level by the rakers ── /h117 ── */
function pitSync(X, instant) {
  const st = X.M.st; st.pitIn = Array.isArray(st.pitIn) ? st.pitIn : [];
  // (re-asserted: the hill's cell of a pit may have been reset by the world since, while the cells' own record still says it is open)
  for (let i = 0; i < BOOK.pits.length; i++) try { SH.cells.pit(i, null); SH.cells.pit(i, (st.pitIn[i] | 0) >= PIT_CAP ? 1 : 0, { instant }); } catch (e) { /* */ }
  heapSync(X);
}
/** where the first n chunks in pit i lie: each on the lowest of a 5×5 grid of the floor, the near (tipping) side first, so a heap
 *  grows against the rim the sledge tips from and slopes away from it. y is above the pit's open floor. */
function heapSpots(i, n) {
  const P = BOOK.pits[i], H = new Float32Array(25), out = [], tx = P.x - P.w * 0.1, tz = P.z - P.d / 2 + 1.0;
  const cx = (c) => P.x - P.w / 2 + (P.w * ((c % 5) + 0.5)) / 5, cz = (c) => P.z - P.d / 2 + (P.d * (Math.floor(c / 5) + 0.5)) / 5;
  for (let k = 0; k < n; k++) {
    let best = 0, bs = 1e9;
    for (let c = 0; c < 25; c++) { const sc = H[c] + 0.34 * Math.hypot(cx(c) - tx, cz(c) - tz) + hash(k, c + 40) * 0.05; if (sc < bs) { bs = sc; best = c; } }
    const sz = 0.85 + hash(k, i + 3) * 0.4;
    out.push({ x: cx(best) + (hash(k, 7) - 0.5) * 0.9, z: cz(best) + (hash(k, 8) - 0.5) * 0.7, y: H[best] + sz * 0.38, s: sz, rx: k * 1.3, ry: k * 2.1 });
    H[best] += sz * 0.6;
  }
  return out;
}
function heapFloor(i) { const f = SH.cells && SH.cells.pitInfo ? SH.cells.pitInfo(i) : null; return f ? f.floor : 0; }
function heapMesh(X) { const mm = new X.THREE.Mesh(X.props.geo.chunk, X.props.M.stoneD); mm.castShadow = true; mm.receiveShadow = true; X.props.root.add(mm); return mm; }
function heapPlace(mm, q, fy) { mm.scale.set(q.s, q.s * 0.8, q.s); mm.position.set(q.x, fy + q.y, q.z); mm.rotation.set(q.rx, q.ry, 0); }
function heapSync(X) {
  const st = X.M.st; SH.heapM = SH.heapM || [];
  for (let i = 0; i < BOOK.pits.length; i++) {
    const n = (st.pitIn[i] | 0) >= PIT_CAP ? 0 : st.pitIn[i] | 0, L = (SH.heapM[i] = SH.heapM[i] || []);
    while (L.length > n) X.props.remove(L.pop());
    while (L.length < n) L.push(heapMesh(X));
    const Q = heapSpots(i, n), fy = heapFloor(i);
    L.forEach((mm, k) => heapPlace(mm, Q[k], fy));
  }
}
/** the pit the next load goes into: the first not yet full */
function pitNow(X) { const st = X.M.st; st.pitIn = Array.isArray(st.pitIn) ? st.pitIn : []; for (let i = 0; i < BOOK.pits.length; i++) if ((st.pitIn[i] | 0) < PIT_CAP) return i; return BOOK.pits.length - 1; }
/** stones to the waste pile (a crooked split, a rejected stone): a chunk flies there when it is near, the pile grows */
function wasteAdd(X, n, at) {
  if (at && Math.hypot(at.x - PILE.x, at.z - PILE.z) < 60) X.props.chunksAt({ x: at.x, y: at.y - 1, z: at.z, r: 1.4 }, 3);
  X.M.st.waste = (X.M.st.waste | 0) + n;   // (straight into the save: the pile is seen at once)
  setTimeout(() => pileSync(X), 1400);
}

/* ───────── 3.4 the paving ───────── */
// ── h114 ── (ירון 9.11: "רק שתי אבנים של הפאזל הזה? חלש מדי צריך עוד ושאראה בנייה"; "גם הריצופים" into the Mount; the white ring
// with no meaning; a chunk of the split rock hid a slab and the sector could not close). Now: 3 / 4 / 4 rows of six by level, the
// pile is the slabs of one true laying (so it always closes), the crews pave the sector round his rows the whole time, the slabs
// are bedded into the cut rock (their top a hand over it), and the sector keeps the very laying he made (save: st.lay[s]).
// The bin for a cracked slab (level 3 only): a wooden crate with shards in it, not a ring. ── /h114 ──
const U = 1.6, W = 6;
const ROWS = [3, 4, 4];
const CREW_JOINTS = [2, 4];
const SIDE_COLS = 3;   // the crews' paving each side of his rows (cells)
function rnd(seed) { let t = seed >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }
/** one true laying of rows × 6 over the crews' row (joints 2, 4): every row's joints off the row's below */
function trueLaying(seed, rows) {
  const R = rnd(seed * 7919 + rows), out = []; let below = new Set(CREW_JOINTS);
  for (let y = 0; y < rows; y++) {
    let row = null;
    for (let tries = 0; tries < 200 && !row; tries++) {
      const parts = []; let x = 0; const J = new Set();
      while (x < W) { const L = Math.min(W - x, 1 + Math.floor(R() * 3)); x += L; parts.push(L); if (x < W) J.add(x); }
      let ok = true; for (const j of J) if (below.has(j)) ok = false;
      if (ok && parts.length >= 2 && parts.some((L) => L >= 2)) row = { parts, J };
    }
    if (!row) row = { parts: y % 2 ? [3, 3] : [1, 2, 2, 1], J: new Set() };
    out.push(row.parts); below = row.J.size ? row.J : new Set([3]);
  }
  return out;
}
function gridOf(X, s, rows) {
  const b = SH.cellC[s], x0 = b[0] - (W * U) / 2, z0 = b[1] - (rows * U) / 2;
  // (the cut rock under the rows: its highest point, the slabs bedded into it so their top stands a hand over it)
  let base = -1e9; for (let i = -SIDE_COLS; i <= W + SIDE_COLS; i++) for (let j = -1; j <= rows; j++) base = Math.max(base, X.ground(x0 + i * U, z0 + j * U));
  return { x0, z0, base: base - 0.12, rows, cx: b[0], cz: b[1] };
}
function slabMesh(X, L, broken, crew) {
  const T = X.THREE, mat = X.props.M.stone.clone(); mat.color.offsetHSL(0, 0, (hash(L, Math.random()) - 0.5) * 0.06 - (crew ? 0.03 : 0));
  const g = new T.Group(); const m = new T.Mesh(new T.BoxGeometry(L * U * 0.96, 0.34, U * 0.94), mat); m.castShadow = true; m.receiveShadow = true; g.add(m); g.userData.body = m;
  if (broken) { const c = new T.Mesh(new T.PlaneGeometry(L * U * 0.7, 0.07), X.props.M.seam); c.rotation.x = -Math.PI / 2; c.rotation.z = 0.5; c.position.y = 0.18; g.add(c); }
  X.props.root.add(g); return g;
}
/** the crews' paving round his rows: their row under his (y = −1), and SIDE_COLS cells each side for every row (2-slabs, offset) */
function crewSlabs(rows) {
  const L = [];
  // the row under his first: joints at 2, 4 (the rule is seen)
  { let x = 0; for (const l of [2, 2, 2]) { L.push({ x, y: -1, l }); x += l; } }
  for (let y = -1; y <= rows; y++) for (const side of [-1, 1]) {
    const off = (y & 1) ? 1 : 0; let x = side < 0 ? -SIDE_COLS : W;
    const end = side < 0 ? 0 : W + SIDE_COLS;
    if (off) { L.push({ x, y, l: 1 }); x += 1; }
    while (x < end) { const l = Math.min(2, end - x); L.push({ x, y, l }); x += l; }
  }
  // and the row past his last
  { let x = 0; for (const l of [3, 3]) { L.push({ x, y: rows, l }); x += l; } }
  // nearest his rows first (they close in toward him)
  return L.sort((a, b) => (Math.abs(a.y - rows / 2) + Math.min(Math.abs(a.x + a.l / 2 - 0), Math.abs(a.x + a.l / 2 - W)) * 0.3) - (Math.abs(b.y - rows / 2) + Math.min(Math.abs(b.x + b.l / 2), Math.abs(b.x + b.l / 2 - W)) * 0.3));
}
function placeCrew(X, G, c) { const m = slabMesh(X, c.l, false, true); m.position.set(G.x0 + (c.x + c.l / 2) * U, G.base + 0.17, G.z0 + (c.y + 0.5) * U); return m; }
function layDone(X, s) {
  // a paved sector (reload): the crews' paving round it and his rows exactly as he laid them
  const st = X.M.st, lay = st.lay && st.lay[s]; const rows = (lay && lay.rows) || 3;
  try { X.stages.boulderRest(s); } catch (e) { /* */ }
  const G = gridOf(X, s, rows);
  for (const c of crewSlabs(rows)) placeCrew(X, G, c);
  if (lay) {
    for (const [L, x, y, rot] of lay.s || []) { const m = slabMesh(X, L, false); const c0 = { x: G.x0 + (x + 0.5) * U, z: G.z0 + (y + 0.5) * U }; m.position.set(rot ? c0.x : c0.x + ((L - 1) * U) / 2, G.base + 0.17, rot ? c0.z + ((L - 1) * U) / 2 : c0.z); if (rot) m.rotation.y = Math.PI / 2; }
    for (const [x, y] of lay.f || []) { const mm = new X.THREE.Mesh(X.props.geo.chunk, X.props.M.stoneD); mm.scale.set(U * 0.42, 0.25, U * 0.42); mm.position.set(G.x0 + (x + 0.5) * U, G.base + 0.15, G.z0 + (y + 0.5) * U); X.props.root.add(mm); }
  } else {
    // (an older save: a laying of the right kind)
    trueLaying(s + 1, rows).forEach((row, y) => { let x = 0; for (const l of row) { const m = slabMesh(X, l, false); m.position.set(G.x0 + (x + l / 2) * U, G.base + 0.17, G.z0 + (y + 0.5) * U); x += l; } });
  }
}
/* ── h116 ── (build116-brief §C; ירון 10.11: "לפחות 7 מידות של אבני ריצוף") one paving work is one QUARTER of a cut cell: 5 × 5 units
 * of 2.5 amot, seven slab sizes (h109/paving.js), the mason's rule: no point inside where four corners meet. The slabs lie in seven
 * stacks by size on the cell's other half; he drags one from its stack (a tap turns it), over the quarter it snaps to the units and a
 * green outline shows where it will lie (pale where it cannot, a ring where four corners would meet); let go on a legal place it is
 * laid and the pavers bed it; a laid slab may be dragged back to its stack. His quarter stays exactly as he laid it. ── /h116 ── */
const QU = PV.UNIT, QN = PV.N;
// the seven stacks' places in the cell's other half (units from the half's north-west corner; w along x, h along z)
const STACKS = [['3x3', 0, 0], ['2x3', 3.25, 0], ['2x2', 5.5, 0], ['1x3', 7.75, 0], ['1x4', 0, 3.3], ['1x2', 4.25, 3.3], ['1x1', 6.5, 3.3]];
const skey = (w, h) => Math.min(w, h) + 'x' + Math.max(w, h);
/** the quarter qi (0 NW, 1 NE, 2 SW, 3 SE) of the kohen's sector s: its board's north-west corner, its floor, its stacks' half */
function quarterOf(X, s, qi) {
  const K = BOOK.sectors[s], R = K.rect || rectOf(K.k, K.r), qx = qi & 1, qz = qi >> 1;
  const x0 = R.x0 + qx * QN * QU, z0 = R.z0 + qz * QN * QU;
  const sz0 = R.z0 + (1 - qz) * QN * QU + 0.6, sx0 = R.x0 + 0.6;   // (the stacks: the cell's other half, north or south)
  let base = -1e9; for (let i = 0; i <= QN; i++) for (let j = 0; j <= QN; j++) base = Math.max(base, X.ground(x0 + i * QU, z0 + j * QU));
  for (let i = 0; i <= 10; i++) for (let j = 0; j <= 4; j++) base = Math.max(base, X.ground(sx0 + i * QU, sz0 + j * QU));
  return { s, qi, x0, z0, sx0, sz0, base: base - 0.12, cx: x0 + (QN * QU) / 2, cz: z0 + (QN * QU) / 2, R };
}
function pvSlab(X, w, h, cracked) {
  const T = X.THREE, mat = X.props.M.stone.clone(); mat.color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.07);
  const g = new T.Group(); const m = new T.Mesh(new T.BoxGeometry(w * QU - 0.1, 0.34, h * QU - 0.1), mat); m.castShadow = true; m.receiveShadow = true; g.add(m); g.userData.body = m;
  if (cracked) { const c = new T.Mesh(new T.PlaneGeometry(Math.max(w, h) * QU * 0.8, 0.09), X.props.M.seam); c.rotation.x = -Math.PI / 2; c.rotation.z = 0.6; c.position.y = 0.18; g.add(c); }
  X.props.root.add(g); return g;
}
/** a quarter as it was laid (a reload, or the crews'): its slabs, one merged mesh */
function quarterMesh(X, Q, tiles) {
  const T = X.THREE, geos = [];
  for (const [w, h, x, y] of tiles) { const gm = new T.BoxGeometry(w * QU - 0.1, 0.34, h * QU - 0.1); gm.translate(Q.x0 + (x + w / 2) * QU, Q.base + 0.17, Q.z0 + (y + h / 2) * QU); geos.push(gm.toNonIndexed()); gm.dispose(); }
  let n = 0; for (const g of geos) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
  for (const g of geos) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; g.dispose(); }
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('normal', new T.BufferAttribute(nor, 3));
  const m = new T.Mesh(geo, X.props.M.stone); m.castShadow = true; m.receiveShadow = true; m.name = 'h116-quarter'; X.props.root.add(m); return m;
}
const layKey = (s, qi) => `q${s}_${qi}`;
/** the quarters he (or the crews) laid, as the save has them */
function quartersDone(X) {
  const st = X.M.st; SH.qMesh = SH.qMesh || {};
  for (const k of Object.keys(st.lay || {})) { const m = /^q(\d+)_(\d)$/.exec(k); if (!m || SH.qMesh[k]) continue; const Q = quarterOf(X, +m[1], +m[2]); SH.qMesh[k] = quarterMesh(X, Q, st.lay[k].t || []); }
}
/** ── h117 ── the places nobody stands: every laid quarter and the one being laid (with its stacks) ── /h117 ── */
function noGoSync(X) {
  const AC = X.actors && X.actors(); if (!AC || !AC.setNoGo) return;
  const L = (SH.paveNoGo || []).slice();
  for (const k of Object.keys(X.M.st.lay || {})) { const m = /^q(\d+)_(\d)$/.exec(k); if (!m) continue; const Q = quarterOf(X, +m[1], +m[2]); L.push([Q.x0 - 0.3, Q.z0 - 0.3, Q.x0 + QN * QU + 0.3, Q.z0 + QN * QU + 0.3]); }
  AC.setNoGo(L);
}
export const PAVE = {
  icon: '🧱', title: 'ריצוף הגזרה',
  walkLine: (m) => (m.free ? 'ריצוף רבע תא · עבודת רשות' : `גזרה ${m.s + 1}: מרצפים רבע מהשטח שיושר`),
  quarter: (m) => (m.q | 0),
  stand(m, X) { const Q = quarterOf(X, m.s, m.q | 0); return { x: Q.x0 - 2.2, z: Q.z0 + QN * QU + 1.5, face: [Q.cx, Q.cz] }; },
  prepare(m, X) {
    const b = SH.cellC[m.s]; const C = SH.crew;
    if (b) { bigGone(X, m.s); try { X.props.clearRubble(b[0], b[1], 14); } catch (e) { /* */ } }
    if (SH.sectorGone) try { SH.sectorGone(X, m.s); } catch (e) { /* */ }   // ── h116 ── (no rock left lying on the floor he paves) ── /h116 ──
    { const K = BOOK.sectors[m.s]; if (K && SH.cells.state(K.k, K.r) === 'rock') { try { SH.cells.set(K.k, K.r, 'cut', { instant: true }); } catch (e) { /* */ } } }
    try { X.stages.boulderRest(m.s); } catch (e) { /* */ }
    SH.secCrew = SH.secCrew || []; for (const w of SH.secCrew) C.remove(w); SH.secCrew = [];
  },
  make(m, X) {
    try { X.stages.boulderRest(m.s); } catch (e) { /* */ }
    const qi = m.q | 0, Q = quarterOf(X, m.s, qi), T = X.THREE;
    // ── h117 ── (ירון 10.11: "רמות הקושי צריכות לעלות בצורה הדרגתית") five steps by the paving works he has finished ── /h117 ──
    const step = PV.stepOf((X.M.st.done || []).filter((id) => /^pave\d/.test(id)).length), lv = step >= 5 ? 3 : step >= 4 ? 2 : 1;
    const L = PV.layoutStep(m.s * 31 + qi * 7 + step + ((X.M.st.plays[m.id] | 0) * 101), step);
    const board = PV.newBoard();
    const A = { drag: null, t: 0, done: false, lifts: 0, bounces: 0, cracks: 0, laid: 0, sayT: 0, pulse: 0, idle: 0, hinted: 0, gold: 0 };
    const at = (x, y) => ({ x: Q.x0 + x * QU, z: Q.z0 + y * QU });
    // ── h117 ── the quarter roped off on four stakes (nobody inside while it is laid: "כאילו אני קובר אותם מתחת לריצוף") ── /h117 ──
    const Ls = QN * QU, corners = [[Q.x0 - 0.35, Q.z0 - 0.35], [Q.x0 + Ls + 0.35, Q.z0 - 0.35], [Q.x0 + Ls + 0.35, Q.z0 + Ls + 0.35], [Q.x0 - 0.35, Q.z0 + Ls + 0.35]];
    const stakes = corners.map(([x, z]) => X.props.stake(x, z, 1.1, false)), ropes = [];
    for (let i = 0; i < 4; i++) { const [ax, az] = corners[i], [bx, bz] = corners[(i + 1) % 4], r = X.props.rope(16, 0.04); r.set({ x: ax, y: X.ground(ax, az) + 0.95, z: az }, { x: bx, y: X.ground(bx, bz) + 0.95, z: bz }, 0.25); ropes.push(r); }
    // his place and the stacks' half are no place to stand (the figures step out of them; laid quarters too: noGoSync)
    SH.paveNoGo = [[Q.x0 - 0.9, Q.z0 - 0.9, Q.x0 + Ls + 0.9, Q.z0 + Ls + 0.9], [Q.sx0 - 0.9, Q.sz0 - 0.9, Q.sx0 + 10 * QU + 0.9, Q.sz0 + 4.3 * QU + 0.9]]; noGoSync(X);
    // the chalked places (step 1: every slab's; step 2: the two biggest)
    const chalk = new T.Group(); { const CM = new T.MeshBasicMaterial({ color: '#FBF6E8', transparent: true, opacity: 0.85, depthWrite: false });
      for (const t of PV.chalkOf(L)) { const x0 = Q.x0 + t.x * QU + 0.12, z0 = Q.z0 + t.y * QU + 0.12, w = t.w * QU - 0.24, d = t.h * QU - 0.24;
        for (const [ww, dd, x, z] of [[w, 0.09, x0 + w / 2, z0], [w, 0.09, x0 + w / 2, z0 + d], [0.09, d, x0, z0 + d / 2], [0.09, d, x0 + w, z0 + d / 2]]) { const e = new T.Mesh(new T.BoxGeometry(ww, 0.02, dd), CM); e.position.set(x, Q.base + 0.03, z); e.renderOrder = 2; chalk.add(e); } }
      X.props.root.add(chalk); }
    const onChalk = (w, h, x, y) => PV.chalkOf(L).some((t) => t.w === w && t.h === h && t.x === x && t.y === y);
    // the green (or pale) outline where the slab in hand would lie, and the ring where four corners would meet
    const ghostM = new T.MeshBasicMaterial({ color: '#4CE07A', transparent: true, opacity: 0.55, depthWrite: false });
    const ghost = new T.Mesh(new T.BoxGeometry(1, 0.05, 1), ghostM); ghost.visible = false; ghost.renderOrder = 996; X.props.root.add(ghost);
    const ring = new T.Mesh(new T.RingGeometry(0.35, 0.55, 28), new T.MeshBasicMaterial({ color: '#FF6A3D', transparent: true, opacity: 0.95, depthWrite: false, depthTest: false })); ring.rotation.x = -Math.PI / 2; ring.visible = false; ring.renderOrder = 998; X.props.root.add(ring);
    // the seven stacks: real slabs lying on each other, the cracked one on top of its stack
    const S = [], stacks = {};
    for (const [k, ux, uz] of STACKS) stacks[k] = { k, x: Q.sx0 + ux * QU, z: Q.sz0 + uz * QU, ids: [] };
    const order = L.pile.slice().sort((a, b) => (a.cracked ? 1 : 0) - (b.cracked ? 1 : 0));
    for (const p of order) {
      const k = skey(p.w, p.h), St = stacks[k]; const w = k === '1x4' || k === '1x2' ? p.h : p.w, h = k === '1x4' || k === '1x2' ? p.w : p.h;   // (the long ones lie along the row)
      const q = { id: p.id, w, h, k, cracked: !!p.cracked, extra: !!p.extra, at: null, gone: false, g: pvSlab(X, w, h, p.cracked), tx: 0, ty: 0, tz: 0, rot: 0 };
      St.ids.push(q.id); S.push(q);
    }
    const byId = (id) => S.find((q) => q.id === id);
    // level 3: the crate for the cracked slab beside the stacks (a few shards in it already)
    const crate = { x: Q.sx0 + 8.9 * QU, z: Q.sz0 + 3.8 * QU }; let bin = null;
    if (step >= 5) {
      bin = new T.Group(); const gy = Math.max(Q.base, X.ground(crate.x, crate.z));
      for (const [w, d, x, z] of [[2.6, 0.14, 0, -0.9], [2.6, 0.14, 0, 0.9], [0.14, 1.9, -1.25, 0], [0.14, 1.9, 1.25, 0]]) { const p2 = new T.Mesh(new T.BoxGeometry(w, 0.7, d), X.props.M.wood); p2.position.set(x, 0.35, z); bin.add(p2); }
      for (let k = 0; k < 4; k++) { const sh = new T.Mesh(X.props.geo.chunk, X.props.M.stoneD); sh.scale.set(0.35, 0.18, 0.3); sh.position.set(-0.7 + k * 0.45, 0.45, (k % 2) * 0.4 - 0.2); bin.add(sh); }
      bin.position.set(crate.x, gy, crate.z); X.props.root.add(bin);
    }
    function homeOf(q) { const St = stacks[q.k]; return { x: St.x + (Math.max(q.w, q.h) * QU) / 2, z: St.z + (Math.min(q.w, q.h) * QU) / 2 }; }
    // ── h117 ── stuck 45 s with no new slab: the next slab's place of the true laying in chalk (it costs only the perfect) ── /h117 ──
    let hintG = null;
    function hintOff() { if (hintG) { X.props.remove(hintG); hintG = null; } }
    function hint() {
      hintOff(); A.hinted++;
      const free = S.filter((q) => !q.at && !q.gone && !q.cracked && !q.extra);
      const t = L.tiles.find((tt) => PV.canPlace(board, tt.w, tt.h, tt.x, tt.y) && free.some((q) => (q.w === tt.w && q.h === tt.h) || (q.w === tt.h && q.h === tt.w)));
      if (!t) { X.line('הרימו לוח ונסו סדר אחר'); A.pulse = 1.6; return; }
      hintG = new T.Group(); const CM = new T.MeshBasicMaterial({ color: '#BFF5CF', transparent: true, opacity: 0.9, depthWrite: false });
      const x0 = Q.x0 + t.x * QU + 0.12, z0 = Q.z0 + t.y * QU + 0.12, w = t.w * QU - 0.24, d = t.h * QU - 0.24;
      for (const [ww, dd, x, z] of [[w, 0.12, x0 + w / 2, z0], [w, 0.12, x0 + w / 2, z0 + d], [0.12, d, x0, z0 + d / 2], [0.12, d, x0 + w, z0 + d / 2]]) { const e = new T.Mesh(new T.BoxGeometry(ww, 0.02, dd), CM); e.position.set(x, Q.base + 0.04, z); hintG.add(e); }
      X.props.root.add(hintG); X.line('רמז: המקום של הלוח הבא מסומן בגיר');
    }
    function home(q) {
      const St = stacks[q.k], i = St.ids.indexOf(q.id), w0 = q.k === '1x4' || q.k === '1x2' ? Math.max(q.w, q.h) : Math.min(q.w, q.h), h0 = q.k === '1x4' || q.k === '1x2' ? Math.min(q.w, q.h) : Math.max(q.w, q.h);
      q.tx = St.x + (w0 * QU) / 2; q.tz = St.z + (h0 * QU) / 2; q.ty = Q.base + 0.17 + Math.max(0, i) * 0.36;
    }
    const tops = () => Object.values(stacks).map((St) => { for (let i = St.ids.length - 1; i >= 0; i--) { const q = byId(St.ids[i]); if (q && !q.at && !q.gone) return q; } return null; }).filter(Boolean);
    for (const q of S) { home(q); q.g.position.set(q.tx, q.ty, q.tz); }
    // the two pavers with their mallets at the quarter's edge; one knock on every slab he lays
    const C = SH.crew, pavers = [C.add(Q.x0 - 1.6, Q.z0 + 3, { role: 'hammer', item: 'mallet', fx: Q.x0 + 2, fz: Q.z0 + 3, crew: 2 }), C.add(Q.x0 + QN * QU + 1.6, Q.z0 + QN * QU - 3, { role: 'hammer', item: 'mallet', fx: Q.x0 + QN * QU - 2, fz: Q.z0 + QN * QU - 3, off: 0.4, crew: 2 })];
    function pickAt(p) {
      const cand = tops().concat(S.filter((q) => q.at && !q.gone));
      const rc = X.rayAt(p.x, p.y); const hits = rc.intersectObjects(cand.map((q) => q.g.userData.body), false);
      if (hits.length) return cand.find((q) => q.g.userData.body === hits[0].object) || null;
      let best = null, bd = 40; for (const q of cand) { const r2 = X.scr(q.g.position.x, q.g.position.y, q.g.position.z); const d = Math.hypot(r2.x - p.x, r2.y - p.y); if (r2.on !== false && d < bd) { bd = d; best = q; } } return best;
    }
    /** where the slab in hand would lie: its corner cell by its middle */
    function snap(q) { const cx = Math.round((q.tx - Q.x0) / QU - q.w / 2), cy = Math.round((q.tz - Q.z0) / QU - q.h / 2); const over = q.tx > Q.x0 - QU && q.tx < Q.x0 + (QN + 1) * QU && q.tz > Q.z0 - QU && q.tz < Q.z0 + (QN + 1) * QU; return { cx, cy, over }; }
    function show(q) {
      const { cx, cy, over } = snap(q); ring.visible = false;
      if (!over) { ghost.visible = false; return; }
      const W2 = PV.why(board, q.w, q.h, cx, cy);
      const x = clamp(cx, 0, QN - q.w), y = clamp(cy, 0, QN - q.h), c = at(x + q.w / 2, y + q.h / 2);
      ghost.visible = true; ghost.scale.set(q.w * QU - 0.05, 1, q.h * QU - 0.05); ghost.position.set(c.x, Q.base + 0.06, c.z);
      ghostM.color.set(W2 === null ? '#4CE07A' : '#E8E2D2'); ghostM.opacity = W2 === null ? 0.55 : 0.35;
      if (W2 && W2.cross) { const r = at(W2.cross[0], W2.cross[1]); ring.position.set(r.x, Q.base + 0.4, r.z); ring.visible = true; }
    }
    function finish() {
      A.done = true; ghost.visible = false; ring.visible = false;
      const st = X.M.st; st.lay = st.lay || {};
      const tiles = S.filter((q) => q.at && !q.gone).map((q) => [q.w, q.h, q.at[0], q.at[1]]);
      st.lay[layKey(m.s, qi)] = { t: tiles };
      // his quarter as one mesh (it stays exactly as laid); the slabs he did not use go back to the crews' cart
      SH.qMesh = SH.qMesh || {}; if (SH.qMesh[layKey(m.s, qi)]) X.props.remove(SH.qMesh[layKey(m.s, qi)]);
      SH.qMesh[layKey(m.s, qi)] = quarterMesh(X, Q, tiles);
      for (const q of S) X.props.remove(q.g); S.length = 0;
      // ── h116 ── (the cell stays cut under its quarters: the rest are free works, or the crews lay them one by one) ── /h116 ──
      X.play('tier'); X.shake(0.12, 0.2);
      // ── h117 ── (steps 1–2 a lift costs nothing: he is learning; a hint costs only the perfect) ── /h117 ──
      const lifts = step >= 3 ? A.lifts : 0;
      const q = Math.max(0.5, 1 - 0.1 * A.bounces - 0.1 * lifts - 0.3 * A.cracks);
      const perfect = !A.bounces && !lifts && !A.cracks && !A.hinted;
      const c = { x: Q.cx, y: Q.base + 1.5, z: Q.cz };
      X.bonus(100, 'row', 'הרבע מרוצף');
      A.endT = 1.2; A.res = { q, stars: q >= 0.99 ? 3 : q >= 0.75 ? 2 : 1, perfect, at: c };
    }
    function drop(q) {
      const { cx, cy, over } = snap(q); ghost.visible = false; ring.visible = false;
      if (q.cracked && bin && Math.hypot(q.tx - crate.x, q.tz - crate.z) < 2.8) {
        q.gone = true; q.tx = crate.x; q.tz = crate.z; q.ty = bin.position.y + 0.5; { const St = stacks[q.k]; St.ids = St.ids.filter((id) => id !== q.id); }
        X.bonus(20, 'reject', 'זיהית לוח סדוק'); X.play('stamp'); setTimeout(() => { try { X.props.remove(q.g); } catch (e) { /* */ } }, 900); return;
      }
      if (over && PV.canPlace(board, q.w, q.h, cx, cy)) {
        const c = at(cx + q.w / 2, cy + q.h / 2);
        if (q.cracked) {
          // a cracked slab breaks under the mallet: real damage (−20), the pavers carry its halves off
          A.cracks++; q.gone = true; q.tx = c.x; q.tz = c.z; q.ty = Q.base + 0.17;
          X.loss(20, { x: c.x, y: Q.base + 1.2, z: c.z }, 'לוח סדוק: נשבר', 1); X.dust(c.x, Q.base + 0.3, c.z, 10, 2); X.play('crack');
          setTimeout(() => { try { X.props.remove(q.g); } catch (e) { /* */ } }, 700);
          return;
        }
        q.at = [cx, cy]; PV.place(board, q.id, q.w, q.h, cx, cy); A.laid++; A.idle = 0; hintOff();
        q.tx = c.x; q.tz = c.z; q.ty = Q.base + 0.17;
        { const St = stacks[q.k]; St.ids = St.ids.filter((id) => id !== q.id); }
        X.dust(c.x, Q.base + 0.3, c.z, 6, 1.6); X.play('thud');
        const ch = onChalk(q.w, q.h, cx, cy);
        X.hit({ x: c.x, y: Q.base + 1, z: c.z }, ch || q.w * q.h >= 6 ? 'gold' : 'good', { text: ch ? 'בדיוק על הגיר' : '', craft: 'רצפים' });
        // ── h117 ── (ירון: "אפשר להזיז את הלבנים או שהן קבועות?") taught once: a laid slab can be lifted again ── /h117 ──
        { const st = X.M.st; st.taught = st.taught || {}; if (!st.taught.paveLift && A.laid === 2 && !PV.done(board)) { st.taught.paveLift = 1; A.teach = 3.2; const h = homeOf(q); X.line('אפשר להרים כל לוח ולהניח מחדש'); X.hand({ x: q.tx, y: q.ty + 0.4, z: q.tz }, (X.scr(h.x, q.ty, h.z).x - X.scr(q.tx, q.ty, q.tz).x) * 0.8, (X.scr(h.x, q.ty, h.z).y - X.scr(q.tx, q.ty, q.tz).y) * 0.8); } }
        if (PV.done(board)) { finish(); return; }
        if (PV.stuck(board, S.filter((x) => !x.at && !x.gone && !x.cracked).map((x) => ({ w: x.w, h: x.h })))) { X.line('אין מקום: הרימו אבן ונסו סדר אחר'); A.pulse = 1.6; }
        return;
      }
      if (over) { const W2 = PV.why(board, q.w, q.h, cx, cy); if (W2 && W2.cross) { A.bounces++; const r = at(W2.cross[0], W2.cross[1]); X.word({ x: r.x, y: Q.base + 1.2, z: r.z }, 'ארבע פינות נפגשות'); X.play('grind'); } }
      // back to its stack (on top)
      const St = stacks[q.k]; St.ids = St.ids.filter((id) => id !== q.id); St.ids.push(q.id); home(q);
    }
    return {
      begin() {
        // the shot only where every unit of the quarter and every stack is seen (115's check, with the stacks' corners)
        const xs = [Q.x0, Q.x0 + QN * QU, Q.sx0, Q.sx0 + 10 * QU], zs = [Q.z0, Q.z0 + QN * QU, Q.sz0, Q.sz0 + 4.3 * QU];
        const x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs), t = [(x0 + x1) / 2, Q.base, (z0 + z1) / 2];
        const span = Math.max(x1 - x0, (z1 - z0) * 1.25), D = span * 1.25 + 8;
        const P3 = [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [t[0], t[2]]].map(([x, z]) => [x, Q.base + 0.4, z]);
        let P = null;
        for (const [az, el] of [[0, 1.05], [0, 1.22], [0, 1.4], [Math.PI / 2, 1.05], [-Math.PI / 2, 1.05], [Math.PI, 1.05], [Math.PI / 2, 1.3], [-Math.PI / 2, 1.3], [Math.PI, 1.3], [0, 1.52]]) {
          const p = [t[0] + Math.sin(az) * Math.cos(el) * D, t[1] + Math.sin(el) * D, t[2] + Math.cos(az) * Math.cos(el) * D];
          if (!P) P = p; if (P3.every((q) => !rayBlocked(X, p, q))) { P = p; A.camAz = az; break; }
        }
        // ── h116 ── (ירון: nothing off-frame) back off along the same line until the quarter and all seven stacks are inside the frame,
        // clear of the counters above and the line below ── /h116 ──
        try {
          const cam = X.camera.clone(), v = new T.Vector3(), corners = [];
          for (const x of [x0, x1]) for (const z of [z0, z1]) corners.push([x, Q.base + 0.5, z]);
          for (let k = 0; k < 10; k++) {
            cam.position.set(P[0], P[1], P[2]); cam.lookAt(t[0], t[1], t[2]); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
            const ok = corners.every(([x, y, z]) => { v.set(x, y, z).project(cam); return Math.abs(v.x) < 0.86 && v.y < 0.66 && v.y > -0.74; });
            if (ok) break;
            for (let i = 0; i < 3; i++) P[i] = t[i] + (P[i] - t[i]) * 1.1;
          }
        } catch (e) { /* */ }
        X.shot(P, t, 1.0);
        X.line(step >= 5 ? 'גררו לוח לרבע · נגיעה מסובבת · לוח סדוק לארגז' : step === 3 ? 'בלי ארבע פינות בנקודה אחת · נגיעה מסובבת' : step <= 2 ? 'גררו לוח למקום המסומן בגיר · נגיעה מסובבת' : 'גררו לוח לרבע · נגיעה מסובבת');
        const q = tops()[0]; if (q) X.hand({ x: q.tx, y: q.ty + 0.4, z: q.tz }, 0, -40);
        X.kohen(false);
      },
      update(dt) {
        A.t += dt;
        if (!A.done && !A.drag) { A.idle += dt; if (A.idle > 45) { A.idle = 0; hint(); } }
        if (A.teach > 0) { A.teach -= dt; if (A.teach <= 0) X.hand(null); }
        for (const q of S) {
          const held = A.drag && A.drag.q === q, k = 1 - Math.exp(-dt * (held ? 9 : 12));
          q.g.position.x += (q.tx - q.g.position.x) * k; q.g.position.z += (q.tz - q.g.position.z) * k; q.g.position.y += (q.ty + (held ? 0.9 : 0) - q.g.position.y) * k;
          q.rot += ((q.turned ? Math.PI / 2 : 0) - q.rot) * Math.min(1, dt * 14); q.g.rotation.y = q.rot;
          if (A.pulse > 0 && q.at) { const b = q.g.userData.body.material; b.emissive = b.emissive || new T.Color(); b.emissive.setRGB(0.35, 0.28, 0.08).multiplyScalar(Math.max(0, Math.sin(A.pulse * 4))); }
        }
        if (A.pulse > 0) { A.pulse = Math.max(0, A.pulse - dt); if (!A.pulse) for (const q of S) if (q.at) q.g.userData.body.material.emissive && q.g.userData.body.material.emissive.setRGB(0, 0, 0); }
        if (A.drag) show(A.drag.q);
        if (A.endT > 0) { A.endT -= dt; if (A.endT <= 0) X.end(A.res); }
      },
      wants(p) { return !A.done && !!pickAt(p); },
      down(p) {
        if (A.done) return; const q = pickAt(p); if (!q) return;
        A.drag = { q, x0: p.x, y0: p.y, t0: performance.now() / 1000, moved: false };
        if (q.at) { PV.lift(board, q.id); q.at = null; A.lifts++; A.laid--; }
        const g = onPlane(X, p.x, p.y, Q.base + 0.2); if (g) { A.drag.ox = q.g.position.x - g.x; A.drag.oz = q.g.position.z - g.z; }
        X.hand(null); X.play('tool');
      },
      move(p) {
        const D = A.drag; if (!D) return; if (Math.hypot(p.x - D.x0, p.y - D.y0) > 10) D.moved = true;
        const g = onPlane(X, p.x, p.y, Q.base + 0.2); if (g) { D.q.tx = g.x + (D.ox || 0); D.q.tz = g.z + (D.oz || 0); }
      },
      up() {
        const D = A.drag; if (!D) return; A.drag = null; const q = D.q;
        if (!D.moved && performance.now() / 1000 - D.t0 < 0.35) {
          // a tap turns it a quarter (on its stack it turns in place)
          const w = q.w; q.w = q.h; q.h = w; q.turned = !q.turned; X.play('swoosh');
          if (!q.at) { const St = stacks[q.k]; if (St.ids[St.ids.length - 1] === q.id || St.ids.includes(q.id)) { home(q); ghost.visible = false; return; } }
        }
        drop(q);
      },
      cancel() { const D = A.drag; if (!D) return; A.drag = null; const q = D.q; ghost.visible = false; ring.visible = false; const St = stacks[q.k]; St.ids = St.ids.filter((id) => id !== q.id); St.ids.push(q.id); home(q); },
      end() { for (const o of stakes) X.props.remove(o); for (const r of ropes) { try { r.dispose ? r.dispose() : X.props.remove(r.mesh); } catch (e) { /* */ } } X.props.remove(chalk); hintOff(); SH.paveNoGo = []; noGoSync(X); X.props.remove(ghost); X.props.remove(ring); if (bin) X.props.remove(bin); for (const q of S) X.props.remove(q.g); for (const w of pavers) C.remove(w); },
      at() { return { x: Q.cx, y: Q.base + 1.5, z: Q.cz }; },
      dbg() {
        const sc = (x, y, z) => { const r = X.scr(x, y, z); return [Math.round(r.x), Math.round(r.y)]; };
        return { lv, step, hinted: A.hinted, chalk: PV.chalkOf(L).length, q: qi, tiles: L.tiles, crate: bin ? sc(crate.x, bin.position.y + 0.4, crate.z) : null, board: board.map((r) => r.map((v) => (v ? 1 : 0)).join('')), done: A.done, lifts: A.lifts, bounces: A.bounces, cracks: A.cracks,
          cells: Array.from({ length: QN + 1 }, (_, y) => Array.from({ length: QN + 1 }, (_, x) => { const c = at(x, y); return sc(c.x, Q.base + 0.2, c.z); })),
          tops: tops().map((q) => ({ id: q.id, k: q.k, w: q.w, h: q.h, cracked: q.cracked, extra: q.extra, scr: sc(q.g.position.x, q.g.position.y + 0.2, q.g.position.z) })),
          laid: S.filter((q) => q.at).map((q) => ({ id: q.id, w: q.w, h: q.h, at: q.at, scr: sc(q.g.position.x, q.g.position.y, q.g.position.z) })) };
      },
    };
  },
};

/* ───────── 3.9 the waste: loaded on the sledge when the oxen stand, driven down the track, stopped at the pit's green line, tipped ─────────
 * ── h115 ── (114: "העגלה מתרוקנת לבד" and "רחוק מהמילוי" with two stars). Now nothing happens by itself: holding drives the oxen,
 * letting go they slide on a little and stop; the green line on the pit's rim is where the sledge must stand; a drag UP tips it into
 * the pit. Where it stopped is graded and said in the same words as the stars: on the line (gold), near it (good), short of it (the
 * rakers drag the rest in: ok). Farther than 3.5 amot it does not tip at all ("עוד לא בבור"). The kohen walks the track with the
 * oxen; two rakers at the pit spread every load. ── /h115 ── */
export const WASTE = {
  icon: '🪨', title: 'פינוי הפסולת',
  walkLine: () => 'ערימת הפסולת: מפנים אותה אל הבור',
  stand(m, X) { return { x: PILE.x - 4.5, z: PILE.z - 3, face: [PILE.x + 4, PILE.z - 1] }; },
  prepare() {},
  make(m, X) {
    const lv = X.level(), T = X.THREE, gyP = X.ground(PILE.x, PILE.z);
    const cap = [3, 4, 5][lv - 1];
    const pi = pitNow(X), P = BOOK.pits[pi];
    // the track: from beside the pile east along the pit's north rim (the oxen never step into it); the green line across the track
    // over the pit's middle is where the sledge must stand; tipped there it slides off sideways into the pit
    const s0 = { x: PILE.x + 5.5, z: P.z - P.d / 2 - 1.8 }, rimX = P.x, ux = 1, uz = 0, Tgt = P.x - s0.x, dMax = Tgt + P.w / 2 - 0.5;
    const A = { phase: 'load', t: 0, drag: null, on: [], trips: 0, hold: false, d: 0, v: 0, grades: [], tips: [], arm: 0, p0: null, tipT: 0 };
    const sled = new T.Group(), tilt = new T.Group(); sled.add(tilt);
    { const bed = new T.Mesh(new T.BoxGeometry(3.4, 0.25, 2.2), X.props.M.wood); bed.position.set(0, 0.45, -1.1); tilt.add(bed); for (const sd of [-0.9, 0.9]) { const r = new T.Mesh(new T.BoxGeometry(3.8, 0.22, 0.2), X.props.M.woodD); r.position.set(0.1, 0.15, sd - 1.1); tilt.add(r); } tilt.position.z = 1.1; const pole = new T.Mesh(new T.BoxGeometry(3.2, 0.12, 0.12), X.props.M.woodD); pole.position.set(3.1, 0.6, 0); sled.add(pole); }
    X.props.root.add(sled);
    // the green line on the rim, across the track
    const line = new T.Mesh(new T.PlaneGeometry(0.4, 6.4), new T.MeshBasicMaterial({ color: 0x4CE07A, transparent: true, opacity: 0.9, depthWrite: false }));
    line.rotation.x = -Math.PI / 2; line.position.set(rimX, X.ground(rimX, s0.z) + 0.1, s0.z); line.renderOrder = 997; X.props.root.add(line);
    const an = X.stages.crewAnimals || null; const oxen = [];
    if (an) for (const sd of [-0.75, 0.75]) { const h = an.add('bull', s0.x + 5, s0.z + sd, { yaw: Math.PI / 2, calm: true }); if (h) oxen.push(h); }
    // the rakers at the pit's two sides (rakes in hand), spreading each load
    const drover = SH.crew.add(s0.x + 6.5, s0.z - 2.2, { role: 'hold', item: 'staff', fx: s0.x + 12, fz: s0.z - 2.2, crew: 1 });
    // ── h117 ── (ירון 10.11: "המגרפות נעלמו, צריכים לגרוף את שולי הבור") two rakers on the pit's rim by the track, rakes in hand; they
    // stand ready (no loop) and really rake in what the sledge left on the rim ── /h117 ──
    const rkHome = [[P.x - P.w / 2 - 1.4, P.z - P.d / 2 + 1.2], [P.x - P.w / 2 + 2.2, P.z - P.d / 2 - 0.9]];
    const rakers = rkHome.map(([x, z], k) => { const w = SH.crew.add(x, z, { role: 'hold', item: 'rake', fx: P.x, fz: P.z, off: k * 0.5, crew: 0 }); if (w) w.home = [x, z]; return w; }).filter(Boolean);
    const chunks = () => (SH.pileM || []).filter((c) => !c.userData.on);
    const sx = () => s0.x + A.d * ux, sz = () => s0.z + A.d * uz;
    function sledPos() {
      let step = 0; if (A.phase === 'load') { const ph = SH.B.phase(2); step = ph < 0.3 ? Math.sin((ph / 0.3) * Math.PI) * 0.35 : 0; }
      const x = sx() + ux * step, z = sz() + uz * step;
      sled.position.set(x, X.ground(x, z), z); sled.rotation.y = -Math.atan2(uz, ux);
      oxen.forEach((h, i) => { const px = -uz * (i ? 0.75 : -0.75), pz = ux * (i ? 0.75 : -0.75); h.x = x + ux * 5.2 + px; h.z = z + uz * 5.2 + pz; h.yaw = Math.atan2(ux, uz); });
      for (const c of A.on) { if (c.userData.fall) continue; const bx = c.userData.bx, bz = c.userData.bz; c.position.x = x + bx * ux - bz * uz; c.position.z = z + bx * uz + bz * ux; c.position.y = sled.position.y + 0.85 + c.userData.by; }
    }
    function pickAt(p) {
      const L = chunks(); const hits = X.rayAt(p.x, p.y).intersectObjects(L, false); if (hits.length) return hits[0].object;
      let best = null, bd = 60; for (const c of L) { const q = X.scr(c.position.x, c.position.y, c.position.z); const d = Math.hypot(q.x - p.x, q.y - p.y); if (q.on && d < bd) { bd = d; best = c; } } return best;
    }
    const gP = () => X.ground(P.x, P.z);
    function load(c) {
      const ph = SH.B.phase(2), still = ph > 0.32 && ph < 0.95;
      const grade = still ? (ph > 0.45 && ph < 0.85 ? 'gold' : 'good') : 'ok';
      if (grade === 'ok' && lv >= 2 && hash(A.t, c.id) < 0.5) { c.userData.on = false; X.word({ x: c.position.x, y: c.position.y + 1, z: c.position.z }, 'השוורים זזו · נפל מהמזחלת'); X.play('thud'); c.position.set(PILE.x + 1, X.ground(PILE.x + 1, PILE.z) + 0.4, PILE.z); return; }
      const k = A.on.length; c.userData.on = true; c.userData.bx = -1 + (k % 3) * 1.0; c.userData.bz = -0.5 + Math.floor(k / 3) * 0.9; c.userData.by = Math.floor(k / 6) * 0.3; A.on.push(c);
      A.grades.push(grade); X.dust(sled.position.x, sled.position.y + 0.8, sled.position.z, 4, 1.2); X.play('thud');
      X.hit({ x: sled.position.x, y: sled.position.y + 2, z: sled.position.z }, grade, { text: '', craft: 'סבלים' });
      if (A.on.length >= cap || !chunks().length) toPush();
    }
    function toPush() {
      A.phase = 'push'; A.v = 0; A.arm = 0;
      X.line('החזיקו: השוורים מושכים · שחררו כדי לעצור על הקו הירוק');
      X.hand({ x: rimX, y: X.ground(rimX, s0.z) + 1, z: s0.z }, 0, 0);
      // ── h117 ── (the pit's floor and its heap seen while tipping: the camera higher and over the pit's south side) ── /h117 ──
      const inf = SH.cells.pitInfo ? SH.cells.pitInfo(pi) : null, rim = inf ? inf.rim : gP(), mx = P.x - 7, zc2 = (s0.z + P.z) / 2;
      X.shot([mx - 1, rim + 23, P.z + 12], [mx, rim - 1.5, zc2], 1.0);   // (the track, the green line and the pit's floor in one frame)
    }
    function tip() {
      const off = Math.abs(A.d - Tgt);
      if (A.d < Tgt - 3.5) { X.word({ x: sled.position.x, y: sled.position.y + 2.5, z: sled.position.z }, 'עוד לא ליד הבור · החזיקו עד הקו הירוק'); return; }
      const grade = off <= 0.7 ? 'gold' : off <= 1.6 ? 'good' : 'ok';
      A.tips.push(grade); A.phase = 'tip'; A.tipT = 0; X.hand(null); X.line('');
      const at = { x: sled.position.x, y: sled.position.y + 3, z: sled.position.z };
      if (grade === 'gold') X.hit(at, 'gold', { text: 'בדיוק על הקו', craft: 'סבלים' });
      else if (grade === 'good') X.hit(at, 'good', { text: 'קרוב לקו', craft: 'סבלים' });
      else X.word(at, 'רחוק מהקו · הגורפים דוחפים את השאר לבור');
      // the chunks slide off the tilted bed into the pit (each to its own spot on the pit's floor)
      // ── h117 ── each chunk to its place on the heap; a tip off the line leaves some on the rim for the rakers (good 1, ok 3) ── /h117 ──
      const st = X.M.st, base = (Array.isArray(st.pitIn) ? st.pitIn[pi] : 0) | 0, nLeft = Math.min(A.on.length, grade === 'gold' ? 0 : grade === 'good' ? 1 : 3), nIn = A.on.length - nLeft;
      const Q = heapSpots(pi, base + nIn), fy = heapFloor(pi);
      A.on.forEach((c, i) => {
        let x1, y1, z1;
        if (i < nIn) { const q = Q[base + i]; c.userData.q = q; c.userData.left = false; x1 = q.x; y1 = fy + q.y; z1 = q.z; }
        else { const j = i - nIn; c.userData.q = null; c.userData.left = true; x1 = sled.position.x - 2.6 - j * 1.3; z1 = P.z - P.d / 2 - 0.55; y1 = X.ground(x1, z1) + 0.35; }
        c.userData.fall = { t: -i * 0.08, x0: c.position.x, y0: c.position.y, z0: c.position.z, x1, y1, z1 };
      });
      X.play('cart');
    }
    function tipped() {
      const n = A.on.length, st = X.M.st;
      // ── h117 ── the chunks stay: those in the pit join its heap (saved by count, the same heap after a reload) ── /h117 ──
      for (const c of A.on) { const i = (SH.pileM || []).indexOf(c); if (i >= 0) SH.pileM.splice(i, 1); c.userData.fall = null; c.userData.on = false; }
      const into = A.on.filter((c) => !c.userData.left); A.left = A.on.filter((c) => c.userData.left);
      A.on = []; st.waste = Math.max(0, st.waste - n); st.wasteIn = (st.wasteIn | 0) + n;
      st.pitIn = Array.isArray(st.pitIn) ? st.pitIn : []; st.pitIn[pi] = (st.pitIn[pi] | 0) + into.length;
      SH.heapM = SH.heapM || []; const H = (SH.heapM[pi] = SH.heapM[pi] || []); for (const c of into) { heapPlace(c, c.userData.q, heapFloor(pi)); H.push(c); }
      X.dust(P.x - 2, heapFloor(pi) + 1.5, P.z - 2, 14, 3); X.play('settle'); X.shake(0.15, 0.25);
      A.trips++;
      if (A.left.length) { X.word({ x: P.x - P.w / 2, y: gP() + 3, z: P.z - P.d / 2 }, A.left.length === 1 ? 'גוש נשאר על השפה · הגורף דוחף אותו פנימה' : 'גושים נשארו על השפה · הגורפים דוחפים אותם פנימה'); rakeNext(); }
      else { X.word({ x: P.x, y: gP() + 3, z: P.z }, `הבור ${Math.min(100, Math.round((st.pitIn[pi] / PIT_CAP) * 100))}% מלא`); setTimeout(nextTrip, 1500); }
    }
    function nextTrip() {
      if (!chunks().length) { X.bonus(100, 'clean', 'האתר נקי'); finish(); return; }
      A.d = 0; A.v = 0; tilt.rotation.x = 0; A.hint = false; A.phase = 'load'; try { SH.crew.walkTo(drover, s0.x + 6.5, s0.z - 2.2, 3); } catch (e) { /* */ } X.line('עוד גושים למזחלת'); begin2();
    }
    /* ── h117 ── a raker walks to a chunk left on the rim and pushes it over the edge with the rake; it falls onto the heap ── */
    function rakeNext() {
      const c = A.left.shift();
      if (!c) { for (const w of rakers) { SH.crew.setRole(w, 'hold', { fx: P.x, fz: P.z }); SH.crew.walkTo(w, w.home[0], w.home[1], 2.4); } setTimeout(nextTrip, 900); return; }
      let w = rakers[0], bd = 1e9; for (const r of rakers) { const d = Math.hypot(r.a.x - c.position.x, r.a.z - c.position.z); if (d < bd) { bd = d; w = r; } }
      A.phase = 'rake'; const R = (A.rk = { c, w, t: 0, st: 'walk' });
      SH.crew.setRole(w, 'hold', { fx: c.position.x, fz: P.z });
      const go = SH.crew.walkTo(w, c.position.x, c.position.z - 1.25, 2.6);
      const arrive = () => { if (A.rk !== R) return; R.st = 'push'; R.t = 0; R.x0 = c.position.x; R.y0 = c.position.y; R.z0 = c.position.z; SH.crew.setRole(w, 'push', { fx: c.position.x, fz: P.z, off: 0 }); };
      if (go && go.then) go.then(arrive); else setTimeout(arrive, 1200);
      R.timeout = A.t + 6;   // (a raker who cannot get there: he reaches it anyway after a while)
    }
    function rakeStep(dt) {
      const R = A.rk; if (!R) return; R.t += dt;
      if (R.st === 'walk' && A.t > R.timeout) { R.st = 'push'; R.t = 0; R.x0 = R.c.position.x; R.y0 = R.c.position.y; R.z0 = R.c.position.z; }
      if (R.st === 'push') {
        // the rake's head behind the chunk drags it to the edge (1.2 s), the raker leaning on it; then over
        const k = Math.min(1, R.t / 1.2), ez = P.z - P.d / 2 + 0.35;
        R.c.position.set(R.x0, R.y0 + Math.sin(k * Math.PI * 3) * 0.04, lerp(R.z0, ez, ease(k))); R.c.rotation.x += dt * 1.5;
        try { R.w.a.x = R.x0; R.w.a.z = R.c.position.z - 1.25; } catch (e) { /* */ }
        if (k >= 1) { const st = X.M.st, n = st.pitIn[pi] | 0, q = heapSpots(pi, n + 1)[n]; R.q = q; R.st = 'fall'; R.t = 0; R.x0 = R.c.position.x; R.y0 = R.c.position.y; R.z0 = R.c.position.z; X.play('thud'); }
      } else if (R.st === 'fall') {
        const k = Math.min(1, R.t / 0.6), fy = heapFloor(pi);
        R.c.position.set(lerp(R.x0, R.q.x, k), lerp(R.y0, fy + R.q.y, k * k) + Math.sin(k * Math.PI) * 0.6, lerp(R.z0, R.q.z, k)); R.c.rotation.x += dt * 5;
        if (k >= 1) {
          const st = X.M.st; st.pitIn[pi] = (st.pitIn[pi] | 0) + 1; heapPlace(R.c, R.q, fy); (SH.heapM[pi] = SH.heapM[pi] || []).push(R.c);
          X.dust(R.c.position.x, R.c.position.y, R.c.position.z, 5, 1.2); SH.crew.setRole(R.w, 'hold', { fx: P.x, fz: P.z });
          A.rk = null; rakeNext();
        }
      }
    }
    /** a full pit: the rakers pull the earth over it, level with the rim (2 s); its chunks sink under ── /h117 ── */
    function cover(then) {
      A.phase = 'cover'; A.cov = { t: 0, then, y0: (SH.heapM[pi] || []).map((c) => c.position.y) };
      for (const w of rakers) SH.crew.setRole(w, 'push', { fx: P.x, fz: P.z });
      X.word({ x: P.x, y: gP() + 3, z: P.z }, 'הבור מלא · הגורפים מכסים אותו'); X.play('settle');
    }
    function coverStep(dt) {
      const C = A.cov; if (!C) return; const k0 = Math.min(1, C.t / 2); C.t += dt; const k = Math.min(1, C.t / 2);
      if (Math.floor(k * 8) !== Math.floor(k0 * 8) || k >= 1) SH.cells.pit(pi, k);
      const rise = P.depth * k; (SH.heapM[pi] || []).forEach((c, i) => { c.position.y = C.y0[i] + rise * 0.15; });
      if (k >= 1) { A.cov = null; for (const w of rakers) SH.crew.setRole(w, 'hold', { fx: P.x, fz: P.z }); heapSync(X); X.dust(P.x, gP() + 0.3, P.z, 20, 5); X.word({ x: P.x, y: gP() + 3, z: P.z }, 'הבור כוסה · הקרקע ישרה'); setTimeout(C.then, 1200); }
    }
    function finish() {
      const st0 = X.M.st; if (A.phase !== 'cover' && !A.covered && (st0.pitIn[pi] | 0) >= PIT_CAP) { A.covered = true; cover(finish); return; }
      A.phase = 'done';
      const avg = (L) => L.reduce((a, g) => a + (g === 'gold' ? 1 : g === 'good' ? 0.8 : 0.5), 0) / L.length;
      const q = A.grades.length ? (avg(A.grades) + (A.tips.length ? avg(A.tips) : 1)) / 2 : 1;
      const perfect = A.grades.length > 0 && A.grades.every((g) => g === 'gold') && A.tips.every((g) => g === 'gold');
      X.end({ q, stars: q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1, perfect, at: { x: P.x, y: gP() + 2, z: P.z } });
    }
    function begin2() { const g = X.ground(PILE.x, PILE.z), zc = (PILE.z + s0.z) / 2; X.shot([PILE.x - 8, g + 18, zc + 15], [PILE.x + 3.5, g + 0.5, zc], 0.9); }
    return {
      begin() { pileSync(X); pitSync(X); (SH.pileM || []).forEach((c, i) => { c.userData.id = i; c.userData.on = false; c.userData.fall = null; }); begin2(); X.line('גררו גוש למזחלת כשהשוורים עומדים'); const c = chunks()[0]; if (c) X.hand({ x: c.position.x, y: c.position.y + 0.5, z: c.position.z }, 40, -10); if (!chunks().length) finish(); },
      update(dt) {
        A.t += dt;
        if (A.phase === 'push') {
          if (A.arm > 0) A.arm -= dt;
          const drive = A.hold && A.arm <= 0;
          if (drive) A.v = lerp(A.v, 3.4, 1 - Math.exp(-dt / 0.5)); else A.v *= Math.exp(-dt / 0.35);   // (let go: they slide on a little)
          A.d += A.v * dt;
          if (A.d >= dMax) { A.d = dMax; A.v = 0; if (!A.edge) { A.edge = true; X.word({ x: sx(), y: gP() + 3, z: sz() }, 'עצרו! סוף הבור'); } } else A.edge = false;
          // the drover walks at the lead ox's head
          A.drT = (A.drT || 0) - dt; if (A.v > 0.15 && A.drT <= 0) { A.drT = 0.5; try { SH.crew.walkTo(drover, sx() + 6.2 + A.v * 0.5, s0.z - 2.2, A.v + 0.4); } catch (e) { /* */ } }
          for (const h of oxen) { if (A.v > 0.15) { h.path = [[h.x + ux, h.z + uz]]; h.pi = 0; h.speed = A.v; } else h.path = null; }
          // stopped by the line: the drag-up hint
          if (!A.hold && A.v < 0.1 && A.d >= Tgt - 3.5 && !A.hint) { A.hint = true; X.line('גררו למעלה · מטים את המזחלת לבור'); X.hand({ x: sled.position.x, y: sled.position.y + 1, z: sled.position.z }, 0, -60); }
          if (A.v > 0.3) A.hint = false;
        }
        if (A.phase === 'rake') rakeStep(dt);
        if (A.phase === 'cover') coverStep(dt);
        if (A.phase === 'tip') {
          A.tipT += dt; tilt.rotation.x = Math.min(0.75, A.tipT * 1.6);
          let all = true;
          for (const c of A.on) { const F = c.userData.fall; if (!F) continue; F.t += dt; const k = clamp(F.t / 0.7, 0, 1); if (k < 1) all = false; c.position.set(lerp(F.x0, F.x1, k), lerp(F.y0, F.y1, k) + Math.sin(k * Math.PI) * 1.2, lerp(F.z0, F.z1, k)); c.rotation.x += dt * 6; }
          if (all && A.tipT > 0.9) { A.phase = 'tipped'; tipped(); }
        }
        sledPos();
        const D = A.drag; if (D) { const k = 1 - Math.exp(-dt * 7); D.c.position.x += (D.tx - D.c.position.x) * k; D.c.position.z += (D.tz - D.c.position.z) * k; D.c.position.y += (X.ground(D.tx, D.tz) + 1.6 - D.c.position.y) * k; }
      },
      wants(p) { return A.phase === 'push' || (A.phase === 'load' && !!pickAt(p)); },   // ── h115 ── ── /h115 ──
      down(p) {
        if (A.phase === 'load') { const c = pickAt(p); if (!c) return; A.drag = { c, tx: c.position.x, tz: c.position.z, home: c.position.clone() }; X.hand(null); X.play('tool'); return; }
        if (A.phase === 'push') {
          A.hold = true; A.p0 = { x: p.x, y: p.y };
          // (stopped near the line: a short wait before the oxen pull again, so a drag up is a drag, not a pull)
          A.arm = A.v < 0.1 && A.d >= Tgt - 3.5 ? 0.3 : 0;
          if (!A.arm) { X.hand(null); X.play('cart'); }
        }
      },
      move(p) {
        if (A.phase === 'push' && A.hold && A.p0) { if (A.p0.y - p.y > 45 && Math.abs(p.x - A.p0.x) < A.p0.y - p.y) { A.hold = false; A.p0 = null; if (A.v < 0.6) tip(); } return; }
        // (the drag plane at the sledge's bed: where the finger lets go over the sledge is on it, whatever the slope between)
        const D = A.drag; if (!D) return; const g = onPlane(X, p.x, p.y, sled.position.y + 0.9); if (g) { D.tx = g.x; D.tz = g.z; }
      },
      up() {
        if (A.phase === 'push') { A.hold = false; A.p0 = null; return; }
        const D = A.drag; if (!D) return; A.drag = null;
        const c = D.c, d = Math.hypot(D.tx - sled.position.x, D.tz - sled.position.z);
        if (d < 3.0) load(c); else { c.position.copy(D.home); X.word({ x: c.position.x, y: c.position.y + 1, z: c.position.z }, 'חזר לערימה'); }
      },
      cancel() { A.hold = false; A.p0 = null; },
      end() { X.props.remove(sled); X.props.remove(line); for (const h of oxen) try { an.remove(h); } catch (e) { /* */ } for (const w of rakers) SH.crew.remove(w); SH.crew.remove(drover); X.hand(null); },
      at() { return { x: P.x, y: gP() + 2, z: P.z }; },
      dbg() { const sc = (o) => { const r = X.scr(o.x, o.y, o.z); return [Math.round(r.x), Math.round(r.y)]; }; return { phase: A.phase, on: A.on.length, cap, pile: chunks().length, trips: A.trips, pit: pi, d: +A.d.toFixed(2), tgt: +Tgt.toFixed(2), v: +A.v.toFixed(2), tips: A.tips.slice(), sled: sc({ x: sled.position.x, y: sled.position.y + 0.8, z: sled.position.z }), chunks: chunks().map((c) => sc(c.position)), line: sc({ x: rimX, y: gP(), z: P.z }), ph: +SH.B.phase(2).toFixed(2) }; },
    };
  },
};

export function initWorld2(X, sh) {
  SH = sh; SH.bigSt = {};
  const st = X.M.st;
  SH.cells = SH.cells || X.stages.cells; pileSync(X); pitSync(X, true); yardSync(X);
  // ── h115 ── every big rock not yet read stands in its cell from the start (its place is the book's) ── /h115 ──
  for (let s = 0; s < 9; s++) if (!st.done.includes('read' + s)) bigRock(X, s, false);
  // ── h116 ── the quarters laid in seven sizes (st.lay['q<s>_<quarter>']); a 115 save's rows as they were ── /h116 ──
  quartersDone(X); noGoSync(X);   // ── h117 ── ── /h117 ──
  SH.bigRock = (X2, s2) => bigRock(X2, s2, false); SH.bigGone = bigGone;   // ── h116 ── (the free cells' world: acts.js ensureSector) ── /h116 ──
  for (let s = 0; s < 9; s++) if (st.done.includes('pave' + s) && !Object.keys(st.lay || {}).some((k) => k.startsWith(`q${s}_`))) layDone(X, s);
    // ── h115 ── (read: the halves were dressed into stones, the cell is cut level; nothing of the rock is left) ── /h115 ──
  void ease; void createGang;
}
/* ── h115 ── the dressing of a split rock's halves (READ): two masons, the halves shrinking, the blocks stacking; then the cell is cut */
function dressStart(X, s, n, lost) {
  const R = SH.big && SH.big[s]; if (!R) return;
  const C = SH.crew, b = SH.bould[s], T = X.THREE, gy = R.gy;
  const men = []; for (let k = 0; k < 2; k++) { const a = hash(s, 4) * TAU + k * Math.PI, x = b[0] + Math.cos(a) * (b[2] + 1.6), z = b[1] + Math.sin(a) * (b[2] + 1.6); men.push(C.add(x, z, { role: 'hammer', item: 'mallet', fx: b[0], fz: b[1], off: k * 0.4, crew: 3 })); }
  // the sledge beside the rock, on the side toward the yard (east), where the dressed blocks are stacked
  const sx = b[0] + b[2] + 3.2, sz = b[1] + 1.5, sled = new T.Group(), blocks = [];
  { const bed = new T.Mesh(new T.BoxGeometry(3.2, 0.25, 2.2), X.props.M.wood); bed.position.y = 0.4; sled.add(bed); }
  sled.position.set(sx, X.ground(sx, sz), sz); X.props.root.add(sled);
  for (let i = 0; i < n; i++) { const m = new T.Mesh(new T.BoxGeometry(1.4, 0.7, 0.9), X.props.M.stone); m.castShadow = true; m.position.set((i % 2) * 1.5 - 0.75, 0.9 + Math.floor(i / 2) * 0.72, 0); m.visible = false; sled.add(m); blocks.push(m); }
  const y0 = R.group.position.y;
  SH.dress = SH.dress || []; SH.dress.push({ s, t: 0, R, men, sled, blocks, n, lost, y0, gy, sparkT: 0 });
}
function dressFrame(dt, X) {
  for (const D of SH.dress || []) {
    D.t += dt; const k = Math.min(1, D.t / 3.2), b = SH.bould[D.s];
    if (D.R) {
      D.R.group.scale.setScalar(1 - 0.85 * k); D.R.group.position.y = D.gy + (D.y0 - D.gy) * (1 - 0.85 * k);
      D.sparkT -= dt; if (D.sparkT <= 0 && k < 1) { D.sparkT = 0.35; X.sparks(b[0] + (Math.random() - 0.5) * b[2], D.gy + 1.2, b[1] + (Math.random() - 0.5) * b[2], 5); X.play('tool'); }
      D.blocks.forEach((m, i) => { m.visible = k > (i + 1) / (D.n + 1); });
      if (k >= 1) { D.R.dispose(); SH.big[D.s] = null; D.R = null; if (D.lost) wasteAdd(X, 2, null); else X.M.st.yard = (X.M.st.yard | 0) + D.n; yardSync(X); }
    }
    // the cell is cut level where the rock stood; the blocks are hauled off to the yard
    if (D.t > 3.6 && !D.cut) { D.cut = true; const K = BOOK.sectors[D.s]; try { SH.cells.set(K.k, K.r, 'cut', { dur: 9 }); } catch (e) { /* */ } }
    if (D.t > 7 && !D.gone) { D.gone = true; X.props.remove(D.sled); for (const w of D.men) SH.crew.remove(w); }
  }
  if (SH.dress) SH.dress = SH.dress.filter((D) => !D.gone);
}
/** the stone yard by the east wall (BOOK.yard): the dressed building stones waiting for the wall, in rows of ten */
function yardSync(X) {
  const n = Math.min(60, X.M.st.yard | 0), Y = BOOK.yard; SH.yardM = SH.yardM || [];
  while (SH.yardM.length > n) X.props.remove(SH.yardM.pop());
  while (SH.yardM.length < n) {
    const i = SH.yardM.length, row = Math.floor(i / 10) % 3, lay = Math.floor(i / 30), x = Y.x - 7 + (i % 10) * 1.6, z = Y.z - 2 + row * 1.2;
    const m = new X.THREE.Mesh(new X.THREE.BoxGeometry(1.4, 0.7, 0.9), X.props.M.stone); m.position.set(x, X.ground(x, z) + 0.35 + lay * 0.72, z); m.castShadow = true; X.props.root.add(m); SH.yardM.push(m);
  }
}
export function frame2(dt, X, sh) {
  void sh; dressFrame(dt, X);
  // ── h116 ── the crews' quarters (M.done lays some) appear as the save gets them ── /h116 ──
  SH.qT = (SH.qT || 0) + dt;
  if (SH.qT > 1) { SH.qT = 0; const n = Object.keys(X.M.st.lay || {}).length; if (n !== SH.qN) { SH.qN = n; try { quartersDone(X); noGoSync(X); } catch (e) { /* */ } } }   // ── h117 ── (noGoSync) ── /h117 ──
}
export { PILE, wasteAdd, pileSync };
