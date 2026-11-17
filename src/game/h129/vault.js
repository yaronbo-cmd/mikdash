/* ── build 129 ── h129/vault.js — station 3, the arches (brief §6): the instruments chambers' two small arches (vaultN, vaultS) seen
 * from inside each dark chamber against the sunlit court, and Beit HaMoked's great vault (vaultM: its first ring, from the hall). Two parts:
 *   A  the legs: while the crew lowers the weight stones onto the shoulders one by one, each thumb holds a leg of the arch against its
 *      thrust on the head of a timber shore (pressed inward; the leg pushes it back under the finger, so he presses again). No gauge is
 *      drawn: a mason's plumb line hangs by each leg — the leg's face on the cord is the band that holds; too little and the face runs away
 *      from the cord, dust runs from the springer joint and the crown sinks; too much and the crown lifts and the court's light shows at
 *      its top joint (past the limit a joint opens for good: vault.crack). The creak's pitch follows the push. When the weights are on, a
 *      slow letting go is the perfect release ("מחזיק!"). vaultS's south leg stands on the rock (one thumb); vaultM's thrust three times
 *      as great. With a mouse the crew's shore, wedged at its foot, holds the right leg (the model's opt.mouse).
 *   B  the wedges: the centering comes down by drawing its wedges out, a short drag each. All wedges look alike: a free one slides, a
 *      loaded one barely moves, creaks and sheds a little dust (pulled too far at once it jumps). Uneven, light shows between the stones
 *      (cure: push the wedge back, or tap that side's shoulder: one more weight); further a crack stays (vault.crack); further still a
 *      stone slips and falls (vault.stone: −20, in the great vault −40), the crew lays a replacement of another shade. "יצא!" for a wedge
 *      out with no light; "עומדת!" when the arch stands.
 * The small chambers: their legs and spandrels are the act's own while it plays (temple.js sets 'lishka:legN|S', 'lishka:spandN|S'):
 * the shoulders' weight is the spandrel itself, course by course, each stone lowered on a sling from above outside the face and slid in.
 * The room is in shade (a dark lining over its walls), the arch against the sunlit court. Under the small arches a Levite plays the nevel
 * when it stands (the chambers of the instruments: illustration).
 * The right thumb's look inside these rooms is the act's own (SH7.lookFn, pack.js): in a small chamber the camera rises to the ceiling at
 * the back wall and widens (above it stands the Nikanor wall: no way out through the top), in the great vault it rises out of the open
 * hall and looks down on the ring.
 * The model: model.js (legFresh, legStep, thrustOf, wedgeFresh, wedgeStep, wedgeLoads, joints, shoulder, vaultPts). Places: BOOK.s07.
 */
import { VAULT_LV, LEG, WEDGE, QUICK, LOSS, legFresh, legStep, thrustOf, wedgeFresh, wedgeStep, wedgeLoads, wedgePreview, jointState, joints, shoulder, vaultPts, qOf, starsOf, lossPts } from './model.js';
import { SH7, mats7, box, faceCrack, crackAng, fallen, ringGeos, ringCentering, centering, own, setBusy } from './world.js';
import { createVoices } from './sound129.js';
import { holdLens } from './ui7.js';
import { fingers, MOUSE } from '../h113/acts.js';
import { gripR } from '../h109/grips.js';
import { BOOK } from '../world/grid.js';

const S7 = BOOK.s07, VB = S7.vault, CAM = S7.cam;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const sm = (u) => { const v = clamp(u, 0, 1); return v * v * (3 - 2 * v); };
const kOf = (m) => (m && m.id === 'vaultS' ? 'S' : m && m.id === 'vaultM' ? 'M' : 'N');
const GRIP_MIN = 64;   // (rule: a grip's touch radius in px, at least)

/** the geometry of a work: the arch's face (x of its inner and outer face), its centre (z, y), radii, the stones; the room */
function geomOf(k) {
  if (k === 'M') {
    const A = VB.M, xF = A.east - A.ringD;
    return { k, big: true, xF, xB: A.east, zc: A.axisZ, sp: A.spring, r0: A.R, r1: A.R + 1, n: A.stones, floor: A.floor, deck: VB.deck.y };
  }
  const A = VB[k], b = A.block;
  return { k, big: false, xF: A.at[0] - 1, xB: A.at[0], zc: A.at[1], sp: A.spring, r0: A.crown - A.spring, r1: A.crown - A.spring + 1, n: A.stones, floor: A.floor,
    top: A.top, half: (b[3] - b[1]) / 2, room: { x0: b[0] + 1, x1: b[2] - 1, z0: b[1] + 1, z1: b[3] - 1, y0: A.floor, y1: A.top - 0.3 } };
}

/** the act's own look in its room (rule 66, brief F5): u 0 … 1 → { p, t, fov }; null outside the room's shot (pack.js SH7.lookFn) */
function roomLook(G) {
  return (base, u, yaw) => {
    const e = sm((+u || 0) / 0.75), fov0 = Number.isFinite(base.fov) ? base.fov : 60, yw = clamp(+yaw || 0, -0.6, 0.6);
    let P1, T1, F1;
    if (G.big) { P1 = [G.xF - 14, G.sp + 16, G.zc]; T1 = [G.xF + 1, G.sp + 6, G.zc]; F1 = 70; }
    else { const R = G.room; P1 = [R.x0 + 0.3, R.y1 - 0.35, G.zc]; T1 = [G.xF + 0.5, G.sp + 0.9, G.zc]; F1 = 84; }
    const p = base.p.map((v, i) => v + (P1[i] - v) * e), t = base.t.map((v, i) => v + (T1[i] - v) * e);
    // (the thumb's turn swings the aim about the eye, a little: the room's walls stay out of the way)
    if (Math.abs(yw) > 1e-3) { const dx = t[0] - p[0], dz = t[2] - p[2], c = Math.cos(yw), s = Math.sin(yw); t[0] = p[0] + dx * c - dz * s; t[2] = p[2] + dx * s + dz * c; }
    if (!G.big) { const R = G.room; p[0] = clamp(p[0], R.x0 + 0.25, R.x1 - 0.6); p[1] = clamp(p[1], R.y0 + 0.5, R.y1 - 0.3); p[2] = clamp(p[2], R.z0 + 0.3, R.z1 - 0.3); }
    return { p, t, fov: fov0 + (Math.max(fov0, F1) - fov0) * e };
  };
}

export const VAULT = {
  icon: '🌉', title: 'הקשתות',
  walkLine: (m) => (kOf(m) === 'M' ? 'בית המוקד: הטבעת הראשונה של הקמרון' : kOf(m) === 'S' ? 'לשכת כלי השיר הדרומית: הקשת' : 'לשכת כלי השיר הצפונית: הקשת'),
  stand(m) { const k = kOf(m), s = k === 'M' ? VB.deck.stand : k === 'S' ? VB.standS : VB.standN; return { x: s[0], z: s[1], face: [s[0] + 4, s[1]] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, Mo = X.M, st = Mo.st, V = createVoices(X.sfx), MT = mats7(X), AC = X.actors ? X.actors() : null;
    const k = kOf(m), G = geomOf(k), L = VAULT_LV[m.id];
    const A = { phase: 'intro', t: 0, ev: [], fing: {}, stoneFell: 0, dustT: 0, drawn: { L: 0, R: 0 }, tw: [] };
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
    own('v' + k, 1); setBusy(X, 1); X.kohen(false);
    const cam0 = X.camera, fov0 = cam0.fov, lens = (f) => { try { cam0.fov = f; cam0.updateProjectionMatrix(); } catch (e) { /* */ } };
    const root = new T.Group(); root.name = 'h129-vault-act'; X.props.root.add(root);
    const sgOf = (side) => (side === 'L' ? -1 : 1);
    const inStone = MT.h7stoneIn || (MT.h7stoneIn = new T.MeshStandardMaterial({ color: '#B4A68C', roughness: 0.85, flatShading: true }));
    const stoneM = G.big ? MT.h7stone : inStone;
    const weightM = MT.h7weight || (MT.h7weight = new T.MeshStandardMaterial({ color: '#EBCB92', roughness: 0.8, flatShading: true }));   // (the weight stones: warmer and lighter than the walls, so they are counted)
    const goldM = new T.MeshBasicMaterial({ color: 0xFFD86A, transparent: true, opacity: 0.9, depthWrite: false });
    const goldF = new T.MeshBasicMaterial({ color: 0xFFE6A0, transparent: true, opacity: 0.3, depthWrite: false });
    const lightM = new T.MeshBasicMaterial({ color: 0xFFF6D0, side: T.DoubleSide });
    const ropeM = MT.h7rope, bronze = MT.h7bronze;
    /** a thin cylinder from a to b (a cord, a rope) */
    const cord = (r, mat) => { const c = new T.Mesh(new T.CylinderGeometry(r, r, 1, 5), mat); root.add(c); c.userData.set = (a, b) => { const d = new T.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), l = d.length() || 1e-3; c.scale.set(1, l, 1); c.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); c.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); }; return c; };
    const tween = (dur, fn, done) => { A.tw.push({ t: 0, dur, fn, done }); };

    // ── the small room in shade: a dark lining just inside its walls, floor and ceiling (the east face is the arch's: not lined)
    if (!G.big) {
      const R = G.room, shadeM = new T.MeshBasicMaterial({ color: 0x0A0806, transparent: true, opacity: 0.66, depthWrite: false, side: T.DoubleSide });
      const pl = (w, h, x, y, z, rx, ry) => { const q = new T.Mesh(new T.PlaneGeometry(w, h), shadeM); q.position.set(x, y, z); q.rotation.set(rx, ry, 0); q.renderOrder = 2; root.add(q); };
      const cx = (R.x0 + R.x1) / 2, cy = (R.y0 + R.y1) / 2, wz = R.z1 - R.z0, wx = R.x1 - R.x0, hy = R.y1 - R.y0, e = 0.025;
      pl(wx, wz, cx, R.y0 + e, G.zc, -Math.PI / 2, 0); pl(wx, wz, cx, R.y1 - e, G.zc, Math.PI / 2, 0);
      pl(wz, hy, R.x0 + e, cy, G.zc, 0, Math.PI / 2); pl(wx, hy, cx, cy, R.z0 + e, 0, 0); pl(wx, hy, cx, cy, R.z1 - e, 0, 0);
    }

    // ── each side's leg: the small arch's jamb (its own while the act plays) with the shoulder's courses on it; the great vault's legs
    //    are its springers (they move with the drawn thrust)
    const side = {};
    for (const s of ['L', 'R']) {
      const sg = sgOf(s), g = new T.Group(); root.add(g); side[s] = { g, sg, courses: [], extra: 0 };
      if (!G.big) {
        const h = (G.sp - G.floor) / 3;
        for (let c = 0; c < 3; c++) box(X, stoneM, G.xF, G.floor + c * h + (c ? 0.02 : 0), Math.min(G.zc + sg * G.r0, G.zc + sg * G.half), G.xB, G.floor + (c + 1) * h, Math.max(G.zc + sg * G.r0, G.zc + sg * G.half), g);
      }
    }
    // ── the arch's stones (the small arch's face; the great vault's ring 1) and a dark mortar line in each closed joint
    const arch = new T.Group(); root.add(arch);
    const stoneGeos = G.big ? ringGeos(X, 1) : (() => {
      const out = [], gap = 0.03;
      for (let i = 0; i < G.n; i++) {
        const a0 = Math.PI - (i / G.n) * Math.PI - gap / G.r0, a1 = Math.PI - ((i + 1) / G.n) * Math.PI + gap / G.r0, sh = new T.Shape(), N = 4;
        for (let j = 0; j <= N; j++) { const a = a0 + ((a1 - a0) * j) / N, p = [-(G.zc + G.r1 * Math.cos(a)), G.sp + G.r1 * Math.sin(a)]; if (j) sh.lineTo(...p); else sh.moveTo(...p); }
        for (let j = N; j >= 0; j--) { const a = a0 + ((a1 - a0) * j) / N; sh.lineTo(-(G.zc + G.r0 * Math.cos(a)), G.sp + G.r0 * Math.sin(a)); }
        const g = new T.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: false, curveSegments: 1 }); g.rotateY(Math.PI / 2); g.translate(G.xF, 0, 0); out.push(g);
      }
      return out;
    })();
    const SM = stoneGeos.map((g, i) => { const s = new T.Mesh(g, stoneM); s.castShadow = s.receiveShadow = true; s.userData.a = Math.PI - (Math.PI * (i + 0.5)) / G.n; arch.add(s); return s; });
    const jointA = (j) => Math.PI - (Math.PI * j) / G.n;   // (joint j between stone j−1 and j, 1 … n−1)
    const mortar = [];
    for (let j = 1; j < G.n; j++) {
      const a = jointA(j), r = (G.r0 + G.r1) / 2, q = new T.Mesh(new T.PlaneGeometry(G.big ? 0.12 : 0.05, G.r1 - G.r0), MT.h7crack);
      q.rotation.y = -Math.PI / 2; q.rotation.x = Math.PI / 2 - a; q.position.set(G.xF - 0.02, G.sp + r * Math.sin(a), G.zc + r * Math.cos(a)); q.userData.base = q.position.clone(); q.renderOrder = 3; arch.add(q); mortar.push(q);
    }
    // (the arch stones' drawn shift: the legs carry the side stones out, the crown sinks with a run and rises with an over-press)
    function archShape(dL, dR) {
      SM.forEach((s) => { const c = Math.cos(s.userData.a), sn = Math.sin(s.userData.a); s.position.z = dL * Math.max(0, -c) + dR * Math.max(0, c); s.position.y = -0.8 * ((-dL) + dR) * 0.5 * sn; });
      mortar.forEach((q, j) => { const s0 = SM[j], s1 = SM[j + 1], b = q.userData.base; q.position.set(b.x, b.y + (s0.position.y + s1.position.y) / 2, b.z + (s0.position.z + s1.position.z) / 2); });
    }
    // ── the centering under the arch (the great vault's: its own; the small: timber ribs, ties, king posts, lagging, on wedge posts)
    const cen = new T.Group(); root.add(cen); let cenTop = cen;
    if (G.big) ringCentering(X, 1, cen);
    else { const c = centering(X, k, { parent: cen, pairs: L.pairs }); cenTop = c.userData.top || c; }
    // ── the wedges: pair i's left (−z) and right; every one alike (brief F2: a free one is told from a loaded one by how it moves and sounds)
    const wedgeHome = (i, s) => {
      const sg = sgOf(s);
      if (G.big) return [G.xF - 0.2, G.deck + 0.35, G.zc + sg * G.r0 * (0.18 + 0.17 * i)];
      return [G.xF + 0.5, G.sp - 0.45, G.zc + sg * (G.r0 - 0.6 - 0.45 * i)];
    };
    const W = {};
    for (let i = 0; i < L.pairs; i++) for (const s of ['L', 'R']) {
      const g = new T.Group(), sz = G.big ? 1.1 : 0.42, h = new T.Mesh(X.props.geo.box, MT.h7timberD); h.scale.set(sz * 1.4, sz * 0.55, sz); h.castShadow = true; g.add(h);
      const p = wedgeHome(i, s); g.position.set(...p); root.add(g); W[i + s] = { g, p, o: 0, shown: 0, jit: 0 };
    }
    // ── the grips of part A: a timber shore at each leg — a foot block on the floor (the deck), a slanted beam, a head board against
    //    the leg; the head board is the grip, a thin gold ring round it (stage 06's marks: never a filled disc)
    const shoreGeo = (s) => {
      const sg = sgOf(s);
      if (G.big) return { head: [G.xF + 0.5, G.sp + 0.55, G.zc + sg * (G.r0 - 0.12)], foot: [G.xF + 0.5, G.deck + 0.18, G.zc + sg * (G.r0 - 3.2)], n: [0, 0, sg] };
      return { head: [G.xF - 0.06, G.sp - 1.1, G.zc + sg * (G.r0 + 0.6)], foot: [G.xF - 1.3, G.floor + 0.18, G.zc + sg * (G.half - 1.6)], n: [-1, 0, 0] };
    };
    const shores = {};
    for (const s of ['L', 'R']) {
      if (L.rock === s) continue;
      const S = shoreGeo(s), g = new T.Group(); root.add(g);
      const foot = box(X, MT.h7timberD, S.foot[0] - 0.35, S.foot[1] - 0.18, S.foot[2] - 0.3, S.foot[0] + 0.35, S.foot[1] + 0.18, S.foot[2] + 0.3, g);
      const beam = new T.Mesh(X.props.geo.box, MT.h7timber); beam.castShadow = true; g.add(beam);
      const board = new T.Mesh(X.props.geo.box, MT.h7timberD); board.castShadow = true; g.add(board);
      if (G.big) board.scale.set(0.7, 0.9, 0.12); else board.scale.set(0.1, 0.85, 0.5);
      const halo = new T.Group(); g.add(halo);
      const hr = G.big ? 0.95 : 0.55, SEG = [4, 8 * 5, 8 * 4], hf = new T.Mesh(new T.TorusGeometry(hr, G.big ? 0.035 : 0.016, SEG[0], SEG[1]), goldF), ha = new T.Mesh(new T.TorusGeometry(hr, G.big ? 0.07 : 0.03, SEG[0], SEG[2], 1.9), goldM);
      halo.add(hf, ha); halo.rotation.y = Math.PI / 2;
      const crewHeld = MOUSE && s === 'R';
      if (crewHeld) { halo.visible = false; box(X, MT.h7timber, S.foot[0] - 0.5, S.foot[1] - 0.18, S.foot[2] - 0.12, S.foot[0] - 0.36, S.foot[1] + 0.12, S.foot[2] + 0.12, g); }
      shores[s] = { S, g, foot, beam, board, halo, ha, crewHeld, push: 0 };
    }
    function shoreSet(s, dz) {
      const H = shores[s]; if (!H) return; const S = H.S, h = [S.head[0], S.head[1], S.head[2] + dz];
      H.board.position.set(...h); H.halo.position.set(G.big ? h[0] - 0.4 : h[0] - 0.08, h[1], h[2]);
      const f = S.foot, d = new T.Vector3(h[0] - f[0], h[1] - f[1], h[2] - f[2]), l = d.length();
      H.beam.scale.set(0.2, l - 0.1, 0.2); H.beam.position.set((h[0] + f[0]) / 2, (h[1] + f[1]) / 2, (h[2] + f[2]) / 2); H.beam.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize());
    }
    const headAt = (s) => { const H = shores[s]; return H ? H.board.position.toArray() : shoreGeo(s).head; };
    // ── the plumb lines: a peg (the ceiling's; in the hall a pole and arm on the deck), a cord, a bronze bob — hanging a hair from each
    //    leg's face: the face on the cord holds; away from it the leg runs out; past it (the bob pushed aside) the press is too hard
    const plumbs = {};
    for (const s of ['L', 'R']) {
      const sg = sgOf(s), x = G.xF - (G.big ? 0.25 : 0.12), z = G.zc + sg * (G.r0 - (G.big ? 0.12 : 0.06)), top = G.big ? G.deck + 6 : G.room.y1, bot = G.big ? G.sp + 0.35 : G.floor + 1.1;
      if (G.big) {   // (a pole on a plank at the deck's edge, its arm out over the leg)
        const zp = z - sg * 1.4, pg = A.poles || (A.poles = new T.Group()); if (!pg.parent) root.add(pg);   // (closing round: in a group of their own — carried out with the centering)
        box(X, MT.h7timber, x - 0.3, G.deck, zp - 0.3, G.xF + 0.5, G.deck + 0.12, zp + 0.3, pg);
        box(X, MT.h7timberD, x - 0.12, G.deck, zp - 0.12, x + 0.12, top + 0.2, zp + 0.12, pg); box(X, MT.h7timberD, x - 0.08, top, Math.min(z, zp) - 0.08, x + 0.08, top + 0.16, Math.max(z, zp) + 0.08, pg);
      }
      else box(X, MT.h7timberD, x - 0.08, top - 0.18, z - 0.08, x + 0.08, top, z + 0.08, root);
      const c = cord(G.big ? 0.025 : 0.01, ropeM), bob = new T.Mesh(new T.ConeGeometry(G.big ? 0.16 : 0.07, G.big ? 0.4 : 0.18, 10), bronze); bob.rotation.x = Math.PI; root.add(bob);
      plumbs[s] = { x, z, top, bot, c, bob, sg };
    }
    function plumbSet(s, faceDz) {
      const P = plumbs[s], sg = P.sg; let bz = P.z;
      const face = G.zc + sg * G.r0 + faceDz;   // (the leg's inner face: the bob is pushed aside when the face comes past the cord)
      if (sg * (face - bz) < 0.02) bz = face - sg * 0.02;
      P.bob.position.set(P.x, P.bot, bz); P.c.userData.set([P.x, P.top, P.z], [P.x, P.bot + (G.big ? 0.2 : 0.09), bz]);
    }
    // ── the crew: in a small chamber two masons dressing a stone in the court beyond the arch (whole through the opening); on the
    //    great vault's deck two masons at its wedges
    const crew = [];
    const crewAdd = (x, z, o) => { if (!SH7.crew) return null; const w = SH7.crew.add(x, z, o); if (w) crew.push(w); return w; };
    if (G.big) { for (const sg of [-1, 1]) { const w = crewAdd(G.xF + 1.5, G.zc + sg * 5.2, { role: 'hammer', item: 'mallet', fx: G.xF + 1.5, fz: G.zc + sg * 7.5, crew: 3 }); if (w && w.a) w.a.fixedY = G.deck; } }
    else {
      const cx = G.xB + 3.2; A.dress = box(X, MT.h7stone, cx - 0.5, G.floor, G.zc - 0.45, cx + 0.5, G.floor + 0.8, G.zc + 0.45, root);
      crewAdd(cx, G.zc - 1.25, { role: 'hammer', item: 'chisel', fx: cx, fz: G.zc, crew: 2 }); crewAdd(cx, G.zc + 1.25, { role: 'hammer', item: 'mallet', fx: cx, fz: G.zc, crew: 2 });
    }
    // ── the shoulders' weight: in a small chamber the spandrel itself, course by course (on the rock leg it stands from the start); in
    //    the great vault blocks laid up each haunch. Each stone comes down on a sling from above the frame
    const NCO = (s) => (L.M[s] || 0) + 2;   // (two courses more than the weight stones: room for the cure's stones)
    function courseGeo(s, j, n) {
      const sg = sgOf(s), H = G.top - G.sp, ya = G.sp + (H * j) / n, yb = G.sp + (H * (j + 1)) / n, ext = (y) => Math.sqrt(Math.max(0, G.r1 * G.r1 - (y - G.sp) * (y - G.sp)));
      const sh = new T.Shape(), P = [[G.half, ya], [G.half, yb]], N = 5;
      for (let q = 0; q <= N; q++) { const y = yb - ((yb - ya) * q) / N; P.push([ext(y) + 0.015, y]); }
      P.forEach(([u, y], q) => { const p = [-(sg * u), y]; if (q) sh.lineTo(...p); else sh.moveTo(...p); });
      const g = new T.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: false, curveSegments: 1 }); g.rotateY(Math.PI / 2); g.translate(G.xF, 0, G.zc); return g;
    }
    function weightPlace(s, n) {
      const sg = sgOf(s);
      if (G.big) { const a = 0.14 + n * 0.085, rr = G.r1 + 0.5; return { p: [(G.xF + G.xB) / 2, G.sp + rr * Math.sin(a), G.zc + sg * rr * Math.cos(a)], rx: Math.atan2(sg * Math.cos(a), Math.sin(a)) }; }
      return null;
    }
    function weightAdd(s, instant) {
      const P = side[s], n = P.courses.length;
      let mesh, from, to;
      if (G.big) {
        const q = weightPlace(s, n); mesh = new T.Mesh(X.props.geo.box, MT.h7stone); mesh.scale.set(G.xB - G.xF - 0.5, 0.95, 1.0); mesh.rotation.x = q.rx; mesh.castShadow = mesh.receiveShadow = true;
        to = q.p; from = [to[0], to[1] + 9, to[2]];
      } else {   // (a small chamber: a block of a warm, light stone laid on the haunch, one above the other up the extrados — counted)
        const sg = sgOf(s), k = Math.min(n, 5), a = 0.3 + k * 0.21, rr = G.r1 + 0.27 + 0.52 * Math.max(0, n - 5);   // (past six, a second layer)
        mesh = new T.Mesh(X.props.geo.box, weightM); mesh.scale.set(G.xB - G.xF - 0.1, 0.5, 0.78); mesh.rotation.x = Math.atan2(sg * Math.cos(a), Math.sin(a)); mesh.castShadow = mesh.receiveShadow = true;
        to = [(G.xF + G.xB) / 2, G.sp + rr * Math.sin(a), G.zc + sg * rr * Math.cos(a)]; from = [to[0], to[1] + 6, to[2]];
      }
      P.g.add(mesh); P.courses.push(mesh);
      const rope = [cord(G.big ? 0.04 : 0.018, ropeM), cord(G.big ? 0.04 : 0.018, ropeM)];
      const at = (u) => [0, 1, 2].map((i) => from[i] + (to[i] - from[i]) * sm(u));
      const ropes = (c) => rope.forEach((r, i) => { const o = (i ? 1 : -1) * (G.big ? 0.5 : 0.3); r.userData.set([c[0] + o, c[1] + 0.2, c[2]], [c[0] + o * 0.3, c[1] + (G.big ? 14 : 7), c[2]]); });
      const place = (p) => { mesh.position.set(...p); ropes(p); };
      if (instant) { place(to); rope.forEach((r) => root.remove(r)); return; }
      place(from);
      tween(G.big ? 1.1 : 1.6, (u) => place(at(u)), () => { place(to); setTimeout(() => rope.forEach((r) => root.remove(r)), 450); V.knock(G.big ? 0.7 : 1.1); });   // (the sling stays a moment on the landed stone)
    }
    if (!G.big && L.rock) { const s = L.rock, m2 = new T.Mesh(courseGeo(s, 0, 1), stoneM); m2.castShadow = m2.receiveShadow = true; side[s].g.add(m2); }
    // ── the light through an open joint (from inside, the day through it), the cracks, a fallen stone
    const lights = [];
    const lightQuad = (a, w) => {
      const r0 = G.r0, r1 = G.r1, q = new T.Mesh(new T.PlaneGeometry(w, r1 - r0), lightM); q.rotation.y = -Math.PI / 2; q.rotation.x = Math.PI / 2 - a;
      q.position.set(G.xF - 0.03, G.sp + ((r0 + r1) / 2) * Math.sin(a), G.zc + ((r0 + r1) / 2) * Math.cos(a)); q.renderOrder = 4; root.add(q); return q;
    };
    const jointOfPair = (i, s) => clamp(s > 0 ? Math.floor(G.n / 2) - i : Math.ceil(G.n / 2) + i, 1, G.n - 1);   // (pair i's light: s > 0 the left side's joint i off the crown, else the right's)
    function lightSet(list) {
      for (const l of lights.splice(0)) root.remove(l);
      mortar.forEach((q) => { q.visible = true; });
      // (R2: a hair of light while the joint starts to open, the full strip when it is dangerous and after)
      list.forEach((j, i) => { const stt = j.state || (j.see === 'light' ? 'danger' : 'steady'); if (stt === 'steady') return; const jj = jointOfPair(i, Math.sign(j.imb) || 1); lights.push(lightQuad(jointA(jj), (G.big ? 0.3 : 0.1) * (stt === 'opening' ? 0.3 : 1))); if (mortar[jj - 1]) mortar[jj - 1].visible = false; });
    }
    // (part A's light: the crown's top joints when the press lifts it)
    const topJ = G.n % 2 ? [(G.n - 1) / 2, (G.n + 1) / 2] : [G.n / 2], topL = topJ.map((j) => { const q = lightQuad(jointA(j), 1); q.visible = false; return q; });
    const crownAt = () => ({ x: G.xF - 0.1, y: G.sp + G.r1 + 0.2, z: G.zc });
    function damage(f, i, s) {
      const jj = jointOfPair(i | 0, s === 'L' ? 1 : -1), a = jointA(jj);
      const at = crownAt(), p = Mo.mark(f, m.id, [+at.x.toFixed(2), +at.z.toFixed(2)], f === 'vault.crack' ? jj : i | 0);   // (round 3: a crack's mark keeps its joint, the world draws it there)
      if (f === 'vault.crack') { faceCrack(X, G.xF + (G.big ? 0.05 : 0) - 0.04, G.sp, G.r0, G.r1, G.zc, crackAng(a), root, G.big ? 0.24 : 0.12); V.crack(); X.shake(0.15, 0.25); }   // (round 3: down the face the frame shows)
      else {
        const j = clamp(jj - (Math.cos(a) < 0 ? 1 : 0), 0, G.n - 1), s2 = SM[j];
        if (s2) { s2.visible = false; V.thud(); X.shake(0.25, 0.4); fallen(X, G.xF - 1.5, G.big ? G.deck : G.floor, G.zc + (j < G.n / 2 ? -1 : 1) * 1.2, root, 1); setTimeout(() => { try { s2.material = MT.h7shade; s2.visible = true; V.knock(1.4); } catch (e) { /* */ } }, 1600); }
        A.stoneFell++;
      }
      X.loss(lossPts(f, m.id) || p, at, LOSS[f][0]); ev('loss:' + f); X.save();
    }
    // ── the screen: the grips, the drawn scale (the full run before a loss is about 5 % of the screen's width: brief F1)
    const scr = (p) => { const r = X.scr(p[0], p[1], p[2]); return [Math.round(r.x), Math.round(r.y)]; };
    const unitPx = () => 0.15 * innerHeight;   // (a press of one thrust: this far inward on the screen)
    const inward = (s) => { const h = shoreGeo(s).head, a = scr(h), b = scr([h[0], h[1], G.zc]), d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / d, (b[1] - a[1]) / d]; };
    const gripPx = () => Math.max(GRIP_MIN, gripR() * 1.1);
    let K = 2;
    function scaleK() { const p = [G.xF, G.sp, G.zc + G.r0], a = scr(p), b = scr([p[0], p[1], p[2] + 1]), px = Math.hypot(b[0] - a[0], b[1] - a[1]) || 60; K = clamp((0.05 * innerWidth) / px / LEG.LIMIT, 1, 9); }
    // ── part A
    let SA = null, SB = null;
    const press = { L: null, R: null };
    const lift = (u) => { try { if (X.lookLift && !MOUSE) X.lookLift(u); } catch (e) { /* */ } };   // (brief F5: both thumbs on the legs — the camera a little lifted by the act itself)
    const legs = () => ['L', 'R'].filter((q) => L.rock !== q && !(MOUSE && q === 'R'));
    const LINE_A = () => (legs().length === 2
      ? 'כל אגודל על ראש תמוכה: לחצו פנימה והחזיקו, שהרגל תיגע בחוט האנך · הצוות מוריד אבני משקל על הכתפיים'
      : L.rock ? 'הרגל הדרומית עומדת על הסלע · החזיקו את הצפונית: לחצו פנימה על ראש התמוכה, שהרגל תיגע בחוט האנך'
        : 'החזיקו את הרגל השמאלית בתמוכה (את הימנית מחזיקה תמוכת הצוות): לחצו פנימה, שהרגל תיגע בחוט האנך');
    function partA() {
      SA = legFresh(m.id); A.phase = 'legs'; scaleK();
      if (legs().length === 2) lift(0.22);
      X.line(LINE_A(), 7000);
      const h = headAt(legs()[0]); X.hand({ x: h[0], y: h[1], z: h[2] }, (legs()[0] === 'L' ? 1 : -1) * gripR() / 3, 0);
    }
    function drawA(dt) {
      // (the legs' drawn place: the run out (x) and the push out of balance (net) — the face leaves the cord as soon as it is out of balance)
      for (const q of ['L', 'R']) {
        const g = SA[q], sg = sgOf(q), want = g.rock ? 0 : sg * K * (g.x + 0.5 * clamp(g.net, -0.6, 0.6) * (g.on || (MOUSE && q === 'R') ? 1 : 0.6));
        const was = A.drawn[q]; A.drawn[q] += (want - was) * (1 - Math.exp(-dt * 6));
        const v = Math.abs(A.drawn[q] - was) / Math.max(dt, 1e-3);
        side[q].g.position.z = A.drawn[q]; plumbSet(q, A.drawn[q]);
        const H = shores[q]; if (H) { H.push += ((H.crewHeld ? 0 : clamp(g.p, 0, LEG.PMAX)) - H.push) * (1 - Math.exp(-dt * 10)); shoreSet(q, A.drawn[q] - sg * 0.18 * H.push * (G.big ? 2 : 1)); }
        // (dust runs from the springer joint while the leg moves)
        if (v > 0.12 * K && A.t - (A.dustT || 0) > 0.14) { A.dustT = A.t; X.dust(G.xF - 0.1, G.sp, G.zc + sg * G.r0 + A.drawn[q], G.big ? 5 : 3, G.big ? 1.2 : 0.4); }
      }
      archShape(A.drawn.L, A.drawn.R);
      // (the crown's top joint lets the court's light in while the press lifts it)
      const up = Math.max(0, ...['L', 'R'].map((q) => (SA[q].rock ? 0 : -SA[q].net - LEG.LIFT * 0.6))) + Math.max(0, -(SA.L.x + SA.R.x));
      topL.forEach((q) => { q.visible = up > 0.01; q.scale.x = (G.big ? 0.35 : 0.12) * clamp(up * 2.5, 0.15, 1); });
    }
    function stepA(dt) {
      const P = {}; for (const q of ['L', 'R']) P[q] = press[q] ? press[q].reach : null;
      legStep(SA, P, dt, { mouse: MOUSE });
      for (const e of SA.ev) {
        ev(e.e + (e.side ? ':' + e.side : ''));
        if (e.e === 'weight') weightAdd(e.side);
        if (e.e === 'run') { V.groan(); X.line('הרגל בורחת מן החוט והאבק נושר: לחצו פנימה', 2600); }
        if (e.e === 'lift') { V.groan(); X.line('לחצתם חזק מדי: הכתר עולה ואור נכנס בתפר · הרפו מעט', 2600); }
        if (e.e === 'loss') damage('vault.crack', 0, e.side);
        if (e.e === 'holds') { X.quick(crownAt(), QUICK.holds, arch); V.thud(); }
      }
      drawA(dt);
      // (the creak follows the worst leg's push: its pitch rises with it)
      let strain = 0; for (const q of ['L', 'R']) strain = Math.max(strain, Math.abs(SA[q].net) / 0.5);
      V.creak(clamp(strain, 0, 1) * 0.8);
      if (!A.relSaid && ['L', 'R'].every((q) => SA[q].rock || thrustOf(SA, q) <= LEG.REL * L.T0 + 1e-9) && SA.laid > 0) { A.relSaid = 1; X.line('כל המשקולות במקומן: הרפו לאט לאט, בלי לעזוב בבת אחת', 4200); }
      if (SA.done) {
        V.creak(0); topL.forEach((q) => { q.visible = false; }); lift(0); for (const q of ['L', 'R']) press[q] = null; A.fing = {}; A.phase = 'between';
        // (the arch holds by itself: the crew knocks the shores away)
        setTimeout(() => { for (const H of Object.values(shores)) H.g.visible = false; V.knock(1.3); }, 500);
        setTimeout(partB, 1100);
      }
    }
    // ── part B
    function partB() {
      SB = wedgeFresh(m.id, SA); A.phase = 'wedges';
      X.line('הורידו את הפיגום: משכו כל טריז החוצה בגרירה קצרה, לסירוגין משני הצדדים · אור בין האבנים: החזירו את הטריז או הקישו על הכתף שבצד האור', 7000);
      if (k === 'M') setTimeout(() => { if (A.phase === 'wedges') X.line('יש טריז שמחליק בקלות ויש שחורק ובקושי זז: הוא עוד נושא את הקשת', 5000); }, 7200);
      const w = W['0L']; X.hand({ x: w.p[0], y: w.p[1], z: w.p[2] }, -gripR() / 3, 0);   // (the hint's hand on the very first wedge only)
      syncB();
    }
    const wedgeTo = (i, s) => { const w = W[i + s], sg = sgOf(s); return [w.p[0], w.p[1], w.p[2] + sg * w.o * (G.big ? 1.8 : 0.6)]; };
    function syncB() {
      for (let i = 0; i < L.pairs; i++) for (const s of ['L', 'R']) W[i + s].o = SB.pairs[i][s];
      lightSet(joints(SB)); WS.key = '';
      const avg = SB.pairs.reduce((a, p) => a + p.L + p.R, 0) / (2 * L.pairs); cenTop.position.y = -avg * (G.big ? 0.5 : 0.25);
    }
    function wedgeUnder(p) {
      let best = null, bd = 1e9;
      for (let i = 0; i < L.pairs; i++) for (const s of ['L', 'R']) { const w = W[i + s], q = X.scr(w.g.position.x, w.g.position.y, w.g.position.z), d = Math.hypot(p.x - q.x, p.y - q.y); if (d < bd) { bd = d; best = { i, side: s }; } }
      return bd < Math.max(GRIP_MIN * 0.75, gripR() * (G.big ? 0.55 : 0.7)) ? best : null;
    }
    const shoulderPt = (s) => { const sg = sgOf(s), a = Math.PI / 2 + -sg * 0.95, r = (G.r0 + G.r1) / 2; return [G.xF - 0.1, G.sp + r * Math.sin(a), G.zc + r * Math.cos(a)]; };
    const shoulderUnder = (p) => { for (const s of ['L', 'R']) { const q = scr(shoulderPt(s)); if (Math.hypot(p.x - q[0], p.y - q[1]) < gripR() * 0.8) return s; } return null; };
    const wedgeOut = (f) => { const { i, side: s } = f.wedge, w = W[i + s], q = scr(w.g.position.toArray()), o = scr([w.g.position.x, w.g.position.y, w.g.position.z + sgOf(s)]); const ux = o[0] - q[0], uy = o[1] - q[1], ul = Math.hypot(ux, uy) || 1; return ((f.x - f.x0) * ux + (f.y - f.y0) * uy) / ul; };
    function upB(f) {
      if (f.wedge) {
        const { i, side: s } = f.wedge, px = wedgeOut(f); W[i + s].drag = 0;
        if (Math.abs(px) < 8) return;
        const dx = (px / (0.1 * innerHeight)) * WEDGE.STEP;   // (a STEP of its way per a tenth of the screen's height)
        wedgeStep(SB, i, s, dx); eventsB(); return;
      }
      if (f.sh && f.moved < 20) {
        const s = f.sh, sg = s === 'L' ? 1 : -1; let bi = -1, bv = 0;
        SB.pairs.forEach((p, i) => { const imb = p.L - p.R + p.bias; if (Math.sign(imb) === sg && Math.abs(imb) > bv) { bv = Math.abs(imb); bi = i; } });
        if (bi < 0) { X.line('בצד הזה אין אור: אין צורך במשקולת', 1800); return; }
        shoulder(SB, bi, s); weightAdd(s); eventsB();
      }
    }
    function eventsB() {
      for (const e of SB.ev) {
        ev(e.e + (e.i != null ? ':' + e.i + (e.side || '') : ''));
        if (e.e === 'creak') { V.groan(); const w = W[e.i + e.side]; X.dust(w.g.position.x, w.g.position.y + 0.2, w.g.position.z, G.big ? 4 : 2, G.big ? 0.8 : 0.25); w.jit = 0.35; }
        if (e.e === 'jump') X.line('טריז עמוס נמשך בבת אחת: הקשת קפצה · טריז שחורק — משיכות קצרות', 3200);
        if (e.e === 'light') { V.dust(); X.line('אור בין האבנים! החזירו את הטריז, או הקישו על הכתף שבצד האור', 3200); }
        if (e.e === 'out') { const w = W[e.i + e.side]; X.quick({ x: w.g.position.x, y: w.g.position.y + 0.3, z: w.g.position.z }, QUICK.out, w.g); V.knock(1.5); }
        if (e.e === 'loss') damage(e.f, e.i, (SB.pairs[e.i].L - SB.pairs[e.i].R + SB.pairs[e.i].bias) >= 0 ? 'L' : 'R');
        if (e.e === 'done') finish();
      }
      syncB();
    }
    // ── R2 (the review, rule 67): the joint warns in the world before it opens, as the drag goes — each pair's state the drag in hand
    //    would leave (wedgePreview): steady (dark, quiet), opening (a hair of light, a little dust, a short creak, the centering shifts a
    //    finger's width toward it), danger (the light widens, more dust, a long creak); the crack and the fallen stone come only on the
    //    release, by today's rules
    const WS = { key: '', st: [], dust: [], cz: 0, worst: 'steady' };
    function warnB(dt) {
      const st = SB.pairs.map((p, i) => {
        let imb = p.L - p.R + p.bias;
        for (const sd of ['L', 'R']) { const w = W[i + sd]; if (w && w.drag) imb = wedgePreview(SB, i, sd, w.drag); }
        return { imb, state: jointState(imb) };
      });
      WS.st = st.map((q) => q.state);
      const rank = (q) => ['steady', 'opening', 'danger', 'crack', 'stone'].indexOf(q);
      const key = st.map((q) => q.state + (q.imb > 0 ? '+' : '-')).join(',');
      if (key !== WS.key) {
        const was = WS.key ? WS.key.split(',').map((q) => q.slice(0, -1)) : [];
        st.forEach((q, i) => { const r0 = rank(was[i] || 'steady'), r1 = rank(q.state); if (r1 > r0 && q.state === 'opening') { V.groan(); ev('warn:open:' + i); } if (r1 > r0 && rank(q.state) >= 2) ev('warn:danger:' + i); });
        WS.key = key; lightSet(st);
      }
      // (the dust from each joint that warns, the long creak while one is dangerous)
      let worst = 0, sgW = 0;
      st.forEach((q, i) => {
        const r = rank(q.state); if (r > worst) { worst = r; sgW = Math.sign(q.imb); }
        if (r < 1) { WS.dust[i] = 0; return; }
        WS.dust[i] = (WS.dust[i] || 0) - dt;
        if (WS.dust[i] <= 0) { WS.dust[i] = r >= 2 ? 0.35 : 0.9; const a = jointA(jointOfPair(i, Math.sign(q.imb) || 1)), rr = G.r0; X.dust(G.xF - 0.1, G.sp + rr * Math.sin(a), G.zc + rr * Math.cos(a), r >= 2 ? 3 : 1, G.big ? (r >= 2 ? 0.6 : 0.3) : (r >= 2 ? 0.25 : 0.12)); if (r >= 2) V.dust(); }
      });
      WS.worst = ['steady', 'opening', 'danger', 'crack', 'stone'][worst];
      V.creak(worst >= 2 ? 0.75 : 0);
      const cz = worst >= 1 ? -sgW * (G.big ? 0.12 : 0.04) : 0; WS.cz += (cz - WS.cz) * (1 - Math.exp(-dt * 8)); cenTop.position.z = WS.cz;
    }
    function drawB(dt) {
      warnB(dt);
      // (each wedge eases to its place: a free one slides, a loaded one jerks a little; under the finger it follows the drag)
      const ld = wedgeLoads(SB);
      for (let i = 0; i < L.pairs; i++) for (const s of ['L', 'R']) {
        const w = W[i + s], to = wedgeTo(i, s), free = ld[i + s] === 'free', sg = sgOf(s);
        let pv = 0; if (w.drag != null && w.drag !== 0) pv = clamp(w.drag, -WEDGE.STEP, WEDGE.STEP) * (free ? 1 : WEDGE.LOADED) * (G.big ? 1.8 : 0.6);
        w.jit = Math.max(0, w.jit - dt); const j = w.jit > 0 ? Math.sin(A.t * 60) * 0.02 * (G.big ? 2 : 1) : 0;
        const tz = to[2] + sg * pv + j, k2 = 1 - Math.exp(-dt * (free ? 9 : 4));
        w.g.position.x = to[0]; w.g.position.y = to[1]; w.g.position.z += (tz - w.g.position.z) * k2;
      }
    }
    // ── the end: the arch stands; under the small arches a Levite plays the nevel (illustration)
    // (closing round, F1–F2: the moment is played in the work's composed picture — BOOK.s07.cam.stands — a cut to it first; the
    //  centering comes down and the crew carries it out, the stones stay in the air; in a small chamber the Levite stands with his nevel
    //  in the low door and the kohen beside the arch; on the great ring a crew man stands on its crown. The film after the work opens on
    //  the same picture (res.film: a cut) and what stands in it goes when the film ends (res.film.after))
    let levi = null, man = null, gone = false;
    const SV = CAM.stands && CAM.stands[m.id], AF = VB.after && VB.after[k];
    function teardown() {
      if (gone) return; gone = true;
      for (const w of crew) SH7.crew.remove(w); crew.length = 0;
      if (man) { SH7.crew.remove(man); man = null; }
      if (levi) { try { AC.remove(levi); } catch (e) { /* */ } levi = null; }
      X.props.remove(root); own('v' + k, 0); setBusy(X, 0); lens(fov0);
    }
    async function finish() {
      if (A.phase === 'done' || A.phase === 'stands') return; A.phase = 'done'; X.hand(null);
      for (const w of Object.values(W)) w.g.visible = false; lightSet([]);
      for (const P of Object.values(plumbs)) { try { P.c.visible = false; P.bob.visible = false; } catch (e) { /* */ } }
      st.vault = st.vault || {}; st.vault[m.id] = { runs: SA.runs, lifts: SA.lifts, lights: SB.lights, jumps: SB.jumps }; X.save();
      const pts = vaultPts(SA, SB), q = qOf(pts);
      X.quick(crownAt(), QUICK.stands, arch); V.thud();
      await X.wait(0.7);
      if (SV) { SH7.lookFn = null; A.lensF = SV[2]; lens(SV[2]); X.shot(SV[0], SV[1], 0.01); }
      // (the centering is let down and carried out — the crew with it — the stones stay in the air)
      //  (stepped on the director's clock, X.wait — not the act's tweens: the act's update waits while the look is away, and the probe saw
      //  the centering and the masons stay in vaultN's picture)
      const cy = cen.position.y;
      for (let i = 1; i <= 16; i++) { const u = i / 16; cen.position.y = cy - 0.6 * sm(u / 0.4); cen.position.x = (G.big ? -6 : 3.5) * sm((u - 0.4) / 0.6); await X.wait(0.1); }
      cen.visible = false; for (const w of crew) SH7.crew.remove(w); crew.length = 0; if (A.dress) A.dress.visible = false; if (A.poles) A.poles.visible = false;
      await X.wait(0.2);
      if (!G.big && AC && AF) {
        const a = AC.add('levite', AF.levi[0], AF.levi[1], { fadeIn: false });
        if (a) { a.vis = a.visT = 1; a.gang = 1; AC.setItem(a, 'nevel'); a.yaw = SV ? Math.atan2(SV[0][0] - a.x, SV[0][2] - a.z) : Math.atan2(G.xF - a.x, G.zc - a.z); levi = a; }
        try { X.hero.setPos(AF.kohen[0], AF.kohen[1], Math.atan2(G.xB - AF.kohen[0], G.zc - AF.kohen[1])); X.hero.show(true); } catch (e) { /* */ }
        await X.wait(0.6); V.harp(k === 'S' ? 330 : 294); setTimeout(() => V.harp(k === 'S' ? 440 : 392), 650); X.line('לוי מנגן בנבל תחת הקשת: היא עומדת (המחשה)', 3000);
      } else {
        if (AF && AF.man && SH7.crew) { man = SH7.crew.add(AF.man[0], AF.man[1], { role: 'point', fx: AF.man[0] - 20, fz: AF.man[1] }); if (man && man.a) man.a.fixedY = AF.man[2]; }
        X.line('הטבעת הראשונה עומדת · הצוותות יבנו את שאר הטבעות, אחת אחרי השנייה', 3200);
      }
      A.phase = 'stands';
      await X.wait(2.6);
      A.film = !!SV;
      X.end({ stars: starsOf(q), q, pts, perfect: pts >= 40, flags: { runs: SA.runs, lifts: SA.lifts, lights: SB.lights, jumps: SB.jumps, 'vault.crack': (SA.flags['vault.crack'] ? 1 : 0) + (SB.flags['vault.crack'] || []).length, 'vault.stone': (SB.flags['vault.stone'] || []).length }, at: crownAt(),
        film: SV ? { shots: [[SV[0], SV[1], 3.2]], kohen: !G.big, after: teardown, own: () => [levi, man && man.a] } : null });
    }
    // ── the fingers
    const FG = fingers(X, {
      down(f) {
        if (A.phase === 'legs') {
          const taken = Object.values(A.fing); let best = null, bd = 1e9;
          for (const q of legs()) { if (taken.includes(q)) continue; const s2 = scr(headAt(q)), d = Math.hypot(f.x - s2[0], f.y - s2[1]); if (d < bd) { bd = d; best = q; } }
          if (!best || bd > gripPx()) return;
          A.fing[f.id] = best; f.leg = best; f.dir = inward(best); press[best] = { reach: 0 }; X.hand(null); return;
        }
        if (A.phase === 'wedges') {
          const w = wedgeUnder(f);
          if (w) { f.wedge = w; X.hand(null); if (wedgeLoads(SB)[(w.i + 1) + w.side] === 'loaded') { V.groan(); const ww = W[w.i + w.side]; ww.jit = 0.25; X.dust(ww.g.position.x, ww.g.position.y + 0.2, ww.g.position.z, G.big ? 3 : 2, G.big ? 0.6 : 0.2); } return; }
          const s = shoulderUnder(f); if (s) f.sh = s;
        }
      },
      move(f) {
        if (f.leg && press[f.leg]) { const d = ((f.x - f.x0) * f.dir[0] + (f.y - f.y0) * f.dir[1]) / unitPx(); press[f.leg].reach = clamp(d, 0, LEG.PMAX + 0.6); }
        if (f.wedge && SB) W[f.wedge.i + f.wedge.side].drag = (wedgeOut(f) / (0.1 * innerHeight)) * WEDGE.STEP;
      },
      up(f) { if (f.leg) { press[f.leg] = null; delete A.fing[f.id]; return; } if (A.phase === 'wedges') upB(f); },
    });
    const camK = k === 'M' ? CAM.vaultM : CAM['vault' + k];
    // (the parts' first look before the camera arrives: the legs, the shores, the cords in their places)
    for (const q of ['L', 'R']) { plumbSet(q, 0); shoreSet(q, 0); }
    archShape(0, 0);
    return {
      close: true,
      begin() {
        FG.attach(); lens(k === 'M' ? CAM.vaultMFov : CAM.vaultFov); X.shot(camK[0], camK[1], 1.3);
        SH7.lookFn = roomLook(G);
        X.line(k === 'M' ? 'בית המוקד: הטבעת הראשונה של הקמרון הגדול, על הפיגום' : 'הקשת של לשכת כלי השיר, מבפנים: האור של היום מעבר לה', 2600);
        setTimeout(() => { if (A.phase === 'intro') partA(); }, 1500);
      },
      update(dt) {
        A.t += dt; holdLens(X, A.lensF || (k === 'M' ? CAM.vaultMFov : CAM.vaultFov));
        try {
          V.frame();
          for (const tw of A.tw.slice()) { tw.t += dt; const u = clamp(tw.t / tw.dur, 0, 1); tw.fn(u); if (u >= 1) { A.tw.splice(A.tw.indexOf(tw), 1); if (tw.done) tw.done(); } }
          for (const H of Object.values(shores)) if (H.halo.visible) { const on = Object.values(A.fing).length; H.ha.rotation.z = A.t * 1.4; H.halo.scale.setScalar(1 + (on ? 0 : 0.06 * Math.sin(A.t * 4))); }
          if (A.phase === 'legs') stepA(dt);
          if (A.phase === 'wedges' && SB) drawB(dt);
        } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h129] vault', e && e.message); } }
      },
      down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { A.fing = {}; press.L = press.R = null; },
      // (rule 66: on the right a touch is the act's only on a shore's head, a wedge or a shoulder)
      wants(p) {
        if (!p) return true;
        if (A.phase === 'legs') return legs().some((q) => { const s2 = scr(headAt(q)); return Math.hypot(p.x - s2[0], p.y - s2[1]) < gripPx(); });
        if (A.phase === 'wedges') return !!wedgeUnder(p) || !!shoulderUnder(p);
        return false;
      },
      holds() { return Object.keys(A.fing).length > 0; },
      end() {
        lift(0); FG.detach(); V.stop(); X.hand(null); if (SH7.lookFn) SH7.lookFn = null;
        if (!A.film) teardown();   // (closing round: with a film, what stands in its picture goes when the film ends — res.film.after)
      },
      at() { const c = crownAt(); return new T.Vector3(c.x, c.y, c.z); },
      dbg() {
        const o = { id: m.id, k, phase: A.phase, mouse: MOUSE, ev: A.ev.slice(-10), nf: FG.n, legs: legs(), unit: Math.round(unitPx()), K: +K.toFixed(2), gripPx: Math.round(gripPx()) };
        if (SA) {
          o.A = { t: +SA.t.toFixed(2), laid: SA.laid, runs: SA.runs, lifts: SA.lifts, dmg: SA.dmg, done: SA.done, perfect: SA.perfect };
          for (const q of ['L', 'R']) { const g = SA[q]; o.A[q] = { T: +(thrustOf(SA, q) / L.T0).toFixed(3), g: +g.g.toFixed(3), p: +g.p.toFixed(3), net: +g.net.toFixed(3), x: +g.x.toFixed(3), drawn: +A.drawn[q].toFixed(3), on: g.on, grip: scr(shoreGeo(q).head), now: scr(headAt(q)), dir: inward(q).map((v) => +v.toFixed(3)), rock: g.rock }; }
          o.rel = ['L', 'R'].every((q) => SA[q].rock || thrustOf(SA, q) <= LEG.REL * L.T0 + 1e-9);
        }
        if (SB) {
          const ld = wedgeLoads(SB);
          o.B = { warn: WS.worst, states: WS.st.join(','), lights: SB.lights, jumps: SB.jumps, dmg: SB.dmg, stones: (SB.flags['vault.stone'] || []).length, done: SB.done, pairs: SB.pairs.map((p) => ({ L: +p.L.toFixed(3), R: +p.R.toFixed(3), bias: +p.bias.toFixed(3) })), loads: ld,
            w: Object.fromEntries(Object.entries(W).map(([id, w]) => { const q = scr(w.g.position.toArray()), d = scr([w.g.position.x, w.g.position.y, w.g.position.z + (id[1] === 'L' ? -1 : 1)]); return [(+id[0] + 1) + id[1], { at: q, out: [d[0] - q[0], d[1] - q[1]] }]; })),
            sh: { L: scr(shoulderPt('L')), R: scr(shoulderPt('R')) }, stepPx: Math.round(0.1 * innerHeight) };
        }
        return o;
      },
    };
  },
};
