/* ── build 128 ── h128/steps.js — station 3, "המעלות" (brief §6): the player closes a ring of the fifteen steps in three steps, each with
 * its own gesture (the masons' way, המחשה):
 *   1. the template (the yard): drag the ring's wooden template from the table onto a stone; a line of light between them (2 … 6 px at
 *      this camera) says the stone is another ring's; a tap on the stone under the template marks it with chalk; a tap on another stone
 *      is the mason's mallet on it (clear, or dull for a cracked one, with a hairline for half a second);
 *   2. the row (the ring): drag the marked stones into the gap from its two edges toward the middle; let go within a quarter amah of
 *      its neighbour, a stone slides home, else it stays loose (a tap lifts it); a red hairline where a joint stands over a joint of
 *      the course below; the cord by the gap lights when the hole left is the closing stone's, on the middle mark ("בול!"); a stranger
 *      laid gapes, and lifted it is carried back (the mason brings a stone of the ring);
 *   3. the closing stone: two crowbars at its outer corners, each thumb pushes one toward the centre; askew past tol the leading corner
 *      jams (grinding; pull it back a little); forced 0.8 s it breaks (−20); a cracked stone in the row cracks through (−20).
 * Ring 15 ends with the whole half threshing floor from high. Free work: ringF:i with its class's rules. The model: ringPlan, rowFit,
 * slidesHome, tplLight, stoneSound, keyFresh/keyStep, ringPts.
 *   RING = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { ringPlan, rowFit, slidesHome, tplLight, stoneSound, keyFresh, keyStep, ringPts, ringCls, nextSide, Q, LINES, QUICK, LOSS, qOf, starsOf, LONG } from './model.js';
import { SH6, mats6, box, sectorGeo, angOf, ringStones, own, setBusy, floorAt, clamp, lerp } from './world.js';
import { createVoices } from './sound128.js';
import { fingers, MOUSE } from '../h113/acts.js';
import { gripR } from '../h109/grips.js';
import { BOOK, ringOf } from '../world/grid.js';

const S6 = BOOK.s06, STP = S6.steps, CAM = S6.cam, C0 = STP.c;
const sc = (X, x, y, z) => { const r = X.scr(x, y, z); return [Math.round(r.x), Math.round(r.y), r.on !== false]; };
const HL = Math.PI / 2;   // (the gap's middle: the half arc's east point)
/** a ring's own class ring (1, 8, 15) and the shift of a free ring's cameras from its class's (derived from the book's rings) */
const clsOf = (i) => ringCls(i);
const shiftOf = (i) => { const c = clsOf(i), a = ringOf(i), b = ringOf(c); return [a.R - b.R, a.base - b.base]; };
const camOf = (i, k) => { const c = CAM.ring[clsOf(i)][k], [dx, dy] = k === 'yard' ? [0, 0] : shiftOf(i); return [[c[0][0] + dx, c[0][1] + dy, c[0][2]], [c[1][0] + dx, c[1][1] + dy, c[1][2]]]; };

export const RING = {
  icon: '◗', title: 'המעלות',
  walkLine: (m) => `סוגרים את מעלה ${(m && m.ring) || ''}`,
  stand(m) {
    const i = (m && m.ring) || 1, s = STP.stand[i];
    if (s) return { x: s[0], z: s[1], face: [C0[0], C0[1]] };
    const R = ringOf(i); return { x: C0[0] + R.R + 4.5, z: 0, face: [C0[0], C0[1]] };
  },
  prepare() {},
  make(m, X) {
    const T = X.THREE, PR = X.props, MT = mats6(X), st = X.M.st, V = createVoices(X.sfx);
    const i = m.ring || 1, P = ringPlan(i), R = ringOf(i), cls = clsOf(i);
    own('ring', i); setBusy(X, 1);
    const all = [], A = { phase: 'intro', t: 0, marks: [], wrongMarks: 0, wrongCarried: 0, lifts: 0, loose: [], row: { left: [], right: [] }, tray: [], firstLay: 1, ev: [], quickRun: 1, bullT: 0, k: null, keyT: 0, fing: {}, soundT: 0, hair: null, dn: 0, dressed: [], dressing: null };
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 14) A.ev.shift(); };
    own('yard', 1);   // (the world's own yard stones step aside for the ring's; the table stays)
    X.kohen(false);   // (his place is at the ring's stand: between the camera and the work)
    const add = (o) => { PR.root.add(o); all.push(o); return o; };
    const byId = (id) => P.yard.find((y) => y.id === id);
    // ── h128 ── (build 128 tuning T8) the free ring's own rule (model FREE_RULE): its one hint line the first time each kind is met
    const T8 = st.t8 || (st.t8 = {});
    const hint8 = (k, text, delay = 0) => { if (T8[k]) return; T8[k] = 1; X.save(); setTimeout(() => { if (A.phase !== 'done') X.line(text, 4400); }, delay); };
    const LINE8 = {
      odd: 'הרווח הזה אינו באמצע: החבל מסמן את מקום אבן הסגירה, ולכל צד סכום משלו',
      long: 'לאבן אחת בליטה בקצה, והיא ארוכה מעט · הקישו על הבנאי, והוא יסתת אותה',
      order: 'המנוף עומד בקצה אחד של הרווח: מלאו קודם את כל הצד השני, והצוות יפנה אותו',
    };
    const isLong = (s) => !!(s && s.long && !A.dressed.includes(s.id)), bossMat = new T.MeshStandardMaterial({ color: 0x6E5E40, roughness: 1 });
    const hasLong = P.yard.some((y) => y.long), hasCrack = P.yard.some((y) => y.crack);
    // ── /h128 ──

    /* ── the stones' shapes: an arc stone of ring r, len q long, its outer edge's middle at the origin, its length along local x, its
     *    outer (convex) face toward +z ── */
    const stoneGeo = (r, len, h = STP.rise, w = STP.tread) => {
      const Rr = ringOf(r).R, sp = (len * Q) / Rr, g = sectorGeo(T, Rr - w, Rr, HL - sp / 2, HL + sp / 2, 0, h);
      g.translate(-(C0[0] + Rr), 0, -C0[1]); g.rotateY(-Math.PI / 2); return g;
    };
    const stoneMesh = (s, mat) => {
      const me = new T.Mesh(stoneGeo(s.ring, s.len + (isLong(s) ? LONG : 0)), mat || MT.h6stone); me.castShadow = true; me.receiveShadow = true;
      // ── h128 ── (T8) a stone a hair too long: a rough boss left on its end (the mason's chisel takes it off) ── /h128 ──
      if (isLong(s)) { const L = (s.len + LONG) * Q, b = new T.Group(); for (const [dy, ry, k] of [[0.45, 0.25, 1], [0.85, -0.35, 0.75], [1.1, 0.6, 0.5]]) { const c = new T.Mesh(PR.geo.box, bossMat); c.scale.set(0.34 * k, STP.rise * 0.42, STP.tread * 0.7 * k); c.position.set(-0.1, STP.rise * dy, 0); c.rotation.y = ry; c.castShadow = true; b.add(c); } b.position.set(L / 2, 0, -STP.tread / 2); me.add(b); me.userData.boss = b; }
      return me;
    };

    /* ── the yard: the stones on the ground in two columns, the table with the template ── */
    const Y = STP.yard, TB = STP.table, yTop = Y[2] + STP.rise;
    const yard = P.yard.map((s, k) => {
      const col = k % 2, row = (k / 2) | 0, x = Y[0] - 2.6 + col * 5.2, z = Y[1] - 3.4 + row * 1.7;
      const me = add(stoneMesh(s)); me.position.set(x, Y[2], z);
      return { ...s, x, z, me, marked: 0, chalk: null, dull: null };
    });
    const tplGeo = () => { const sp = 4.6 / P.R, g = sectorGeo(T, P.R - STP.tread - 0.05, P.R + 0.02, HL - sp / 2, HL + sp / 2, 0, 0.07); g.translate(-(C0[0] + P.R), 0, -C0[1]); g.rotateY(-Math.PI / 2); return g; };
    const tpl = add(new T.Mesh(tplGeo(), MT.h6timberL)); tpl.castShadow = true;
    const tplHome = [TB[0], TB[2] + 1.16, TB[1]]; tpl.position.set(...tplHome);
    const TP = { on: null, drag: false };
    const light = add(new T.Mesh(PR.geo.box, new T.MeshBasicMaterial({ color: 0xFFC21A })));   // (the line of light: a bright warm yellow, it must be seen on pale stone) light.visible = false;
    // (build 128 tuning T4) its bright core, so the line reads on a small tablet; and the gold edge a fitting stone shows for a moment
    const core = new T.Mesh(PR.geo.box, new T.MeshBasicMaterial({ color: 0xFFF4B0 })); light.add(core); core.scale.set(1, 1.2, 0.45); core.position.y = 0.1;
    light.visible = false;
    const edgeMat = new T.MeshBasicMaterial({ color: 0xFFD040, transparent: true, opacity: 0, depthWrite: false }), edge = add(new T.Mesh(PR.geo.box, edgeMat)), edgeTop = add(new T.Mesh(PR.geo.box, edgeMat)); edge.visible = edgeTop.visible = false;
    const TPL = { drop: 0, rock: 0, fitT: 0 };
    const MH = [Y[0], Y[1] - 5.4], mason = SH6.crew.add(MH[0], MH[1], { role: 'hold', item: 'mallet', crew: 2, fx: Y[0], fz: Y[1] }); const men = [mason];   // (the mason beyond the yard: never between the camera and the stones)
    const chalkOn = (s) => { if (s.chalk) return; const c = new T.Mesh(PR.geo.box, MT.h6chalk); c.scale.set(0.5, 0.02, 0.12); c.position.set(s.x, yTop + 0.012, s.z - 0.2); c.rotation.y = 0.5; add(c); s.chalk = c; };
    const chalkOff = (s) => { if (!s.chalk) return; PR.remove(s.chalk); s.chalk = null; };
    // the line of light on the stone under the template: its width in px at this camera (tplLight), drawn as amot at the stone
    const pxPerAmah = (x, y, z) => { const a = X.scr(x, y, z), b = X.scr(x + 1, y, z), c = X.scr(x, y, z + 1); return Math.max(4, Math.hypot(b.x - a.x, b.y - a.y), Math.hypot(c.x - a.x, c.y - a.y)); };
    /** the line's width on the screen: the model's (2 … 6 px, how far the stone's ring is) raised so the least is 4 px at 960×600 and
     *  wider on a larger screen (build 128 tuning T4: it must read on a small tablet) */
    const linePx = (px) => (px + 2) * Math.max(1, Math.min(innerWidth / 960, innerHeight / 600));
    function tplSet(s, dropped) {
      TP.on = s ? s.id : null; TPL.rock = 0; TPL.drop = 0;
      if (!s) { tpl.position.set(...tplHome); tpl.rotation.set(0, 0, 0); light.visible = false; return; }
      tpl.position.set(s.x, yTop + 0.01, s.z); tpl.rotation.set(0, 0, 0);
      const px = tplLight(P, s); light.visible = px > 0;
      if (px > 0) { const w = linePx(px) / pxPerAmah(s.x, yTop, s.z), L = s.len * Q; light.scale.set(L * 0.98, 0.09, w); light.position.set(s.x, yTop + 0.03, s.z + w / 2 + 0.005); }
      if (!dropped) return;
      // (T4) a fit: the template drops the last of the way home with a knock of wood on stone, the stone's edge glows gold a moment,
      // the quick word; a misfit: the template rocks on the stone (it has no seat) and sounds hollow, the line of light stands out
      if (px === 0) {
        TPL.drop = 0.16; tpl.position.y = yTop + 0.25; V.thud(); ev('fit:' + s.id);
        const L = s.len * Q; edge.scale.set(L * 1.02, STP.rise * 1.04, 0.07); edge.position.set(s.x, Y[2] + STP.rise / 2, s.z + 0.04); edgeTop.scale.set(L * 1.02, 0.04, 0.22); edgeTop.position.set(s.x, yTop + 0.02, s.z + 0.08);
        edge.visible = edgeTop.visible = true; edgeMat.opacity = 1; TPL.fitT = 0.9;
        X.quick({ x: s.x, y: yTop + 0.4, z: s.z }, QUICK.noLight, s.me);
      } else { TPL.rock = 1.1; V.hollow(); ev('misfit:' + s.id + ':' + px); }
    }
    function tplFrame(dt) {
      if (TPL.drop > 0) { TPL.drop = Math.max(0, TPL.drop - dt); tpl.position.y = yTop + 0.01 + 0.24 * (TPL.drop / 0.16) ** 2; }
      if (TPL.rock > 0) { TPL.rock = Math.max(0, TPL.rock - dt); const u = 1.1 - TPL.rock; tpl.rotation.x = 0.07 * Math.sin(u * 17) * Math.exp(-u * 2.2); tpl.position.y = yTop + 0.01 + 0.03 * Math.abs(Math.sin(u * 17)) * Math.exp(-u * 2.2); }
      if (TPL.fitT > 0) { TPL.fitT = Math.max(0, TPL.fitT - dt); edgeMat.opacity = Math.min(1, TPL.fitT / 0.45); if (!TPL.fitT) edge.visible = edgeTop.visible = false; }
    }
    const rayY = (p, h) => { const rc = X.rayAt(p.x, p.y), r = rc && (rc.ray || rc); if (!r || !r.origin || Math.abs(r.direction.y) < 1e-4) return null; const t = (h - r.origin.y) / r.direction.y; if (t < 0) return null; return [r.origin.x + r.direction.x * t, r.origin.z + r.direction.z * t]; };
    const yardHit = (p) => { const q = rayY(p, yTop); if (!q) return null; let best = null, bd = 0.75; for (const s of yard) { if (s.gone) continue; const L = s.len * Q / 2, dx = Math.max(0, Math.abs(q[0] - s.x) - L), dz = Math.abs(q[1] - (s.z - 0.25)); const d = Math.hypot(dx, dz); if (d < bd) { bd = d; best = s; } } return best; };
    const tplScr = () => sc(X, tpl.position.x, tpl.position.y, tpl.position.z - 0.25);
    const nearTpl = (p) => { const q = tplScr(); return Math.hypot(p.x - q[0], p.y - q[1]) < Math.max(44, gripR() * 0.8); };
    const camLift = (u) => { try { if (X.lookLift && !MOUSE) X.lookLift(u); } catch (e) { /* */ } };   // (brief §0.6: both thumbs on the work: the camera a little lifted by the act itself)
    const needMarks = P.n + P.yard.filter((s) => s.ring === i && !s.crack && !P.sol.left.includes(s.id) && !P.sol.right.includes(s.id)).length;   // (the row's stones and the fitting decoy)

    /* ── the ring: the crews' stones (both ends), the laid ones, the loose ones, the closing stone, the cord, the red hairlines ── */
    const rTop = R.top, ring = new T.Group(); add(ring);
    { const L = ringStones(i, null, true).map((s2) => sectorGeo(T, R.R - STP.tread, R.R, s2.a0, s2.a1, R.base, R.top)); const me = new T.Mesh(mergeAll(L), MT.h6stone); me.castShadow = true; me.receiveShadow = true; ring.add(me); }
    function mergeAll(L) { const n = L.reduce((a, g) => a + g.attributes.position.count, 0), arr = new Float32Array(n * 3); let o = 0; for (const g of L) { arr.set(g.attributes.position.array, o); o += g.attributes.position.array.length; g.dispose(); } const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(arr, 3)); g.computeVertexNormals(); return g; }
    const laidG = new T.Group(); ring.add(laidG);
    const qAng = (q) => angOf(P, q);
    const ptAt = (q, r = R.R - STP.tread / 2, y = rTop) => { const a = qAng(q); return [C0[0] + r * Math.sin(a), y, C0[1] - r * Math.cos(a)]; };
    const cord = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 1, 6), MT.h6rope); add(cord);
    { const qm = P.g0 + (P.G - P.C) / 2 + (P.off || 0) + P.C / 2, a0 = ptAt(qm - P.C / 2, R.R + 0.35, R.base + 0.04), a1 = ptAt(qm + P.C / 2, R.R + 0.35, R.base + 0.04), d = Math.hypot(a1[0] - a0[0], a1[2] - a0[2]); cord.scale.set(1, d, 1); cord.position.set((a0[0] + a1[0]) / 2, a0[1], (a0[2] + a1[2]) / 2); cord.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(a1[0] - a0[0], 0, a1[2] - a0[2]).normalize()); }
    // ── h128 ── (T8 'order') the crew's hoist on one end of the gap: two legs astride the tread a little inside the gap, the fall rope with
    // its block, two men on the fall; that end takes no stone until the other side is whole, then they carry it away
    const HB = P.order ? (P.order === 'left' ? 'right' : 'left') : null, H = { state: HB ? 'up' : null, t: 0, shake: 0, g: null, men: [], base: null, out: null };
    if (HB) {
      const qE = HB === 'left' ? P.g0 + 3 : P.g0 + P.G - 3, a = qAng(qE), timber = (p0, p1, r) => { const d = new T.Vector3(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]), me = new T.Mesh(new T.CylinderGeometry(r, r, d.length(), 7), MT.h6timber); me.position.set((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2); me.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); me.castShadow = true; return me; };
      const top = ptAt(qE, R.R - STP.tread / 2, R.top + 3.1), g = new T.Group(); H.g = g; add(g);
      for (const dq of [-1.6, 1.6]) { g.add(timber(ptAt(qE + dq, R.R - STP.tread - 0.35, R.base), top, 0.075)); g.add(timber(ptAt(qE + dq, R.R + 0.4, R.base), top, 0.075)); }
      g.add(timber(ptAt(qE, R.R - STP.tread - 0.1, R.base + 1.5), ptAt(qE, R.R + 0.15, R.base + 1.5), 0.05));
      const blk = ptAt(qE, R.R - STP.tread / 2, R.top + 1.1); g.add(timber(top, blk, 0.025)); { const b = new T.Mesh(PR.geo.box, MT.h6timber); b.scale.set(0.3, 0.38, 0.2); b.position.set(blk[0], blk[1], blk[2]); g.add(b); }
      for (const m of g.children) if (m.geometry !== PR.geo.box) m.material = MT.h6timber;
      { const r0 = ptAt(qE, R.R - STP.tread / 2, R.top + 2.9), r1 = ptAt(qE + (HB === 'left' ? -5 : 5), R.R + 2.2, R.base + 1.25); const fr = timber(r0, r1, 0.022); fr.material = MT.h6rope; g.add(fr); }
      H.out = [Math.sin(a), -Math.cos(a)];
      // (its two men come on to the fall with the row's view: in the yard's view the nearer would stand cut at the frame's edge)
      H.sp = [ptAt(qE + (HB === 'left' ? -5 : 5), R.R + 2.5, R.base), ptAt(qE + (HB === 'left' ? -9 : 9), R.R + 2.9, R.base)]; H.top = top;
    }
    function hoistMen() { if (H.state !== 'up' || H.men.length) return; for (const q of H.sp) { const w = SH6.crew.add(q[0], q[2], { role: 'pull', crew: 3, fx: H.top[0], fz: H.top[2] }); if (w) { H.men.push(w); men.push(w); } } }
    function hoistAway() {
      if (H.state !== 'up') return; H.state = 'going'; H.t = 0; V.creak(); ev('hoist-away');
      for (const w of H.men) { SH6.crew.setRole(w, 'carry', { from: null, to: null }); SH6.crew.walkTo(w, w.a.x + H.out[0] * 5, w.a.z + H.out[1] * 5, 1.8); }
    }
    function hoistFrame(dt) {
      if (!H.g) return;
      if (H.state === 'up' && H.shake > 0) { H.shake = Math.max(0, H.shake - dt); H.g.position.set(Math.sin(A.t * 47) * 0.03 * H.shake, 0, 0); }
      if (H.state !== 'going') return;
      H.t += dt; const u = Math.min(1, H.t / 2.2), e = u * u * (3 - 2 * u);
      H.g.position.set(H.out[0] * 5 * e, 0.25 * Math.sin(Math.PI * u), H.out[1] * 5 * e);
      if (u >= 1) { H.state = 'gone'; PR.remove(H.g); H.g.visible = false; V.thud(); ev('hoist-gone'); for (const w of H.men) { SH6.crew.remove(w); const k = men.indexOf(w); if (k >= 0) men.splice(k, 1); } H.men = []; }
    }
    // ── /h128 ──
    // (a joint's mark: a thin radial bar across the tread)
    const jointBar = (q, mat, h = 0.03) => { const a = qAng(q), me = new T.Mesh(PR.geo.box, mat); me.scale.set(STP.tread + 0.1, h, 0.035); const p = ptAt(q, R.R - STP.tread / 2, rTop + 0.02); me.position.set(...p); me.rotation.y = HL - a; laidG.add(me); return me; };
    // the tray: the marked stones carried to the ring, lying outside it at the gap
    const trayPos = (k) => { const sd = k % 2 ? 1 : -1, row = (k / 2) | 0, x = C0[0] + R.R + 2.4, z = sd * (1.4 + row * 1.5),   // (one line across the gap's front, both sides of its middle: all in the row's view)
       y = (floorAt(x, z) ?? STP.floor); return [x, y, z]; };
    function trayLay() {
      A.tray.forEach((t2, k) => { const [x, y, z] = trayPos(k); t2.home = [x, y, z]; if (!t2.drag) { t2.me.position.set(x, y, z); t2.me.rotation.set(0, 0, 0); } });   // (lying across the rings, chalk-marked: the carried stones stand out from the laid ones)
    }
    const trayAdd = (s) => { const me = add(stoneMesh(s)); { const c = new T.Mesh(PR.geo.box, MT.h6chalk); c.scale.set(0.5, 0.02, 0.12); c.position.set(0, STP.rise + 0.012, -0.22); c.rotation.y = 0.5; me.add(c); } A.tray.push({ id: s.id, len: s.len, ring: s.ring, crack: s.crack, me }); trayLay(); };
    const sumOf = (ids) => ids.reduce((a, id) => a + byId(id).len, 0);
    function rowDraw() {
      while (laidG.children.length) { const c = laidG.children.pop(); if (c.geometry && c.geometry !== PR.geo.box) c.geometry.dispose(); }
      let q = P.g0; for (const id of A.row.left) { const s = byId(id); laidG.add(laidMesh(s, q, q + s.len)); q += s.len; }
      let q2 = P.g0 + P.G; for (const id of A.row.right) { const s = byId(id); laidG.add(laidMesh(s, q2 - s.len, q2)); q2 -= s.len; }
      for (const L of A.loose) { const s = byId(L.id); laidG.add(laidMesh(s, L.q - s.len / 2, L.q + s.len / 2, 0.18)); }
      const F = rowFit(P, { ...A.row, loose: A.loose, dressed: A.dressed });
      for (const j of F.over) jointBar(j, MT.h6red, 0.04);
      cord.material = F.rest === P.C && F.mid ? MT.h6light : MT.h6rope;
      { const q0 = P.g0 + F.sL, q1 = P.g0 + P.G - F.sR; if (q1 - q0 > 0.2) { const me = new T.Mesh(sectorGeo(T, R.R - STP.tread, R.R, qAng(q0), qAng(q1), R.base, R.base + 0.04), F.rest === P.C && F.mid ? MT.h6green : MT.h6gold); laidG.add(me); } }   // (the hole still open: lit gold, green when it is the closing stone's)
      A.fit = F;
      if (H.state === 'up' && (P.order === 'left' ? F.sL >= F.hL : F.sR >= F.hR)) hoistAway();   // ── h128 ── (T8) ── /h128 ──
    }
    function laidMesh(s, q0, q1, lift = 0) {
      const gape = s.ring !== i, J = 0.004, a0 = qAng(q0) + J, a1 = qAng(q1) - J, Rr = R.R + (gape ? 0.14 : 0);
      const me = new T.Mesh(sectorGeo(T, Rr - STP.tread, Rr, a0, a1, R.base + lift, R.top + lift), s.crack && A.crackShow ? MT.h6shade : MT.h6stone); me.castShadow = true; me.receiveShadow = true; return me;
    }

    /* ── the closing stone and the two crowbars ── */
    let key = null, barA = null, barB = null;
    function keyBuild() {
      const q0 = P.g0 + A.fit.sL, q1 = q0 + P.C, a0 = qAng(q0) + 0.004, a1 = qAng(q1) - 0.004, am = (a0 + a1) / 2;
      const c = ptAt((q0 + q1) / 2, R.R - STP.tread / 2, R.base), g = sectorGeo(T, R.R - STP.tread, R.R + 0.06, a0, a1, R.base, R.top);
      g.translate(-c[0], 0, -c[2]);
      key = new T.Group(); key.position.set(c[0], 0, c[2]); add(key);
      const me = new T.Mesh(g, MT.h6stone); me.castShadow = true; key.add(me); key.userData = { c, am, a0, a1, q0, q1, out: [Math.sin(am), -Math.cos(am)] };
      // the rollers under it (outside the gap) and the bars at its outer corners
      for (const u of [0.25, 0.75]) { const r = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, STP.tread * 1.6, 8), MT.h6timber); const p = ptAt(q0 + P.C * u, R.R + 0.5, R.base + 0.07); r.position.set(...p); r.rotation.set(0, -am, Math.PI / 2); r.rotation.order = 'YXZ'; add(r); }
      const bar = () => { const b = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 2.4, 6), MT.h6bronzeD); const g2 = new T.Group(); g2.add(b); b.position.y = 1.0; b.rotation.z = 0; add(g2); return g2; };
      barA = bar(); barB = bar();
      // the two men at the bars, nobody else (the owner 15.11: in the close view only the two lever men, whole — the mason with the mallet
      // stood at the frame's edge, cut, and only bowed once at the end)
      const sA = ptAt(q0 - 0.6, R.R + 2.2, R.base), sB = ptAt(q1 + 3, R.R + 1.6, R.base);   // (the bar men: A at his bar's head, B a little aside — the camera looks across from A's side; each stand the one place where he is whole at u 0 and u 0.3 and not before the gap (figgate probe))
      const wA = SH6.crew.add(sA[0], sA[2], { role: 'push', crew: 1, fx: c[0], fz: c[2] }), wB = SH6.crew.add(sB[0], sB[2], { role: 'push', crew: 1, fx: c[0], fz: c[2] });
      for (const w of [wA, wB]) if (w) men.push(w);
      A.keyMen = { wA, wB };
    }
    const keyOut = (u) => 1.0 * (1 - u);   // (amot outside the gap at advance u)
    function keyPlace() {
      if (!key) return; const s = A.k, u = Math.min(s.a, s.b), d = key.userData, o = keyOut(u), sk = (s.a - s.b) * 0.9;
      key.position.set(d.c[0] + d.out[0] * o, 0, d.c[2] + d.out[1] * o); key.rotation.y = sk;
      const shake = s.jam ? Math.sin(A.t * 60) * 0.04 : 0;
      const place = (g, q, adv, lead) => { const p = ptAt(q, R.R + 0.25 + keyOut(adv), R.base + 0.2); g.position.set(p[0] + (lead ? shake : 0), p[1], p[2]); g.rotation.set(0, -d.am, 0); g.rotateZ(0.55); };
      place(barA, d.q0, s.a, s.a > s.b), place(barB, d.q1, s.b, s.b > s.a);
    }
    const barScr = (g) => { if (!g) return null; g.updateMatrixWorld(true); const p = g.localToWorld(new T.Vector3(0, 2.0, 0)); return sc(X, p.x, p.y, p.z); };
    const cScr = () => sc(X, C0[0], R.top, C0[1]);
    const keyScr = () => sc(X, key.position.x, R.top, key.position.z);
    const PXF = MOUSE ? 260 : 240;   // (px of push for the whole way)
    const pushDir = () => { const a = keyScr(), c = cScr(), dx = c[0] - a[0], dy = c[1] - a[1], n = Math.hypot(dx, dy) || 1; return [dx / n, dy / n]; };

    /* ── the fingers ── */
    const FG = fingers(X, {
      down(f) {
        A.dn++;
        if (A.phase === 'tpl') {
          if (nearTpl(f)) { f.what = 'tpl'; f.prev = TP.on; return; }   // (a drag carries the template; a tap on it, on a stone, marks that stone)
          if (hasLong && nearMason(f)) { f.what = 'mason'; return; }   // ── h128 ── (T8: a tap on the mason: he dresses the long stone) ── /h128 ──
          const s = yardHit(f); if (s) { f.what = 'stone'; f.s = s; }
          return;
        }
        if (A.phase === 'row') {
          const tk = trayHit(f); if (tk) { f.what = 'tray'; f.t = tk; tk.drag = true; return; }
          const l = laidHit(f); if (l) { f.what = 'laid'; f.l = l; }
          return;
        }
        if (A.phase === 'key') {
          const a = barScr(barA), b = barScr(barB), da = a ? Math.hypot(f.x - a[0], f.y - a[1]) : 1e9, db = b ? Math.hypot(f.x - b[0], f.y - b[1]) : 1e9;
          const taken = Object.values(A.fing); let w = da <= db ? 'a' : 'b'; if (taken.includes(w)) w = w === 'a' ? 'b' : 'a';
          if (Math.min(da, db) > Math.max(160, gripR() * 1.6) && !MOUSE) return;
          A.fing[f.id] = w; f.what = 'bar'; f.bar = w; f.lx = f.x; f.ly = f.y;
        }
        if (A.phase === 'moment') A.skip = 1;
      },
      move(f) {
        if (f.what === 'tpl') { if (f.moved < 10 && !TP.drag) return; TP.drag = true; const q = rayY(f, yTop + 0.3); if (q) { tpl.position.set(q[0], yTop + 0.3, q[1]); light.visible = false; TP.on = null; } return; }
        if (f.what === 'tray' && f.t) { const q = rayY(f, rTop + 0.15); if (q) { f.t.me.position.set(q[0], rTop + 0.15, q[1]); const a = Math.atan2(q[0] - C0[0], -(q[1] - C0[1])); f.t.me.rotation.set(0, Math.PI - a, 0); } return; }
        if (f.what === 'bar') { const dir = pushDir(), d = (f.x - f.lx) * dir[0] + (f.y - f.ly) * dir[1]; f.lx = f.x; f.ly = f.y; A.push[f.bar] += d / PXF; }
      },
      up(f) {
        if (f.what === 'tpl' && !TP.drag) { if (f.prev && f.moved < 16) markToggle(yard.find((y) => y.id === f.prev)); return; }
        if (f.what === 'tpl') { TP.drag = false; const s = yardHit(f); tplSet(s && Math.hypot(tpl.position.x - s.x, tpl.position.z - s.z) < 2.6 ? s : null, true); if (TP.on && !A.hintMark) { A.hintMark = 1; X.line(cls === 15 || hasCrack ? 'הקישו על האבן שמתחת לתבנית כדי לסמן אותה בגיר · הקשה על אבן אחרת: הבנאי מקיש בה בפטיש' : 'הקישו על האבן שמתחת לתבנית כדי לסמן אותה בגיר', 4200); } ev('tpl:' + (TP.on || '-')); return; }
        if (f.what === 'stone' && f.moved < 16) { if (TP.on === f.s.id) markToggle(f.s); else sound(f.s); return; }
        if (f.what === 'mason' && f.moved < 16) { dress(); return; }   // ── h128 ── (T8) ── /h128 ──
        if (f.what === 'tray' && f.t) { f.t.drag = false; if (f.moved < 16) { if (f.t.ring !== i) carryBack(f.t); else trayLay(); return; } dropStone(f.t, f); return; }
        if (f.what === 'laid' && f.moved < 16) { lift(f.l); return; }
        if (f.what === 'bar') delete A.fing[f.id];
      },
    });
    A.push = { a: 0, b: 0 };

    /* ── step 1 ── */
    function sound(s) {
      const k = stoneSound(s); s.dull = k === 'dull' ? 1 : 0; V.mallet(k === 'dull'); ev('sound:' + s.id + ':' + k);
      if (isLong(s)) { setTimeout(() => V.scrape('R'), 120); ev('rough:' + s.id); }   // ── h128 ── (T8: the boss rasps under the mallet) ── /h128 ──
      if (mason) { mason.a.bowT = 0.4; setTimeout(() => { if (mason.a) mason.a.bowT = 0; }, 300); }
      if (k === 'dull') { const h = new T.Mesh(PR.geo.box, MT.h6dark); h.scale.set(0.03, 0.02, 0.4); h.position.set(s.x + 0.2, yTop + 0.012, s.z - 0.25); h.rotation.y = 0.4; add(h); setTimeout(() => PR.remove(h), 500); }
    }
    function markToggle(s) {
      if (s.marked) { s.marked = 0; chalkOff(s); A.marks = A.marks.filter((id) => id !== s.id); ev('unmark:' + s.id); return; }
      s.marked = 1; chalkOn(s); A.marks.push(s.id); ev('mark:' + s.id); V.tick();
      const fits = s.ring === i; if (!fits) { A.wrongMarks++; A.quickRun = 0; }
      // (the quick word for a fit comes when the template drops home on it: tplSet)
      if (A.marks.length >= needMarks) marksDone();
    }
    // ── h128 ── (T8) the marks are all made: on to the row, unless a marked stone is still a hair too long (the mason must dress it first)
    function marksDone() {
      if (A.marks.some((id) => isLong(byId(id)))) { if (!A.longWait) { A.longWait = 1; X.line(LINE8.long, 4200); } ev('wait:long'); return; }
      setTimeout(() => toRow(), 700);
    }
    const masonScr = () => (mason && mason.a ? sc(X, mason.a.x, Y[2] + 1.5, mason.a.z) : null);
    const nearMason = (p) => { const q = masonScr(); return !!q && Math.hypot(p.x - q[0], p.y - q[1]) < Math.max(48, gripR() * 0.9); };
    /** a tap on the mason: he walks to the long stone's end and dresses it, three blows of the mallet on the chisel; then it fits */
    function dress() {
      const s = yard.find((y) => isLong(y) && !y.gone);
      if (!s || A.dressing) { if (mason && mason.a) { mason.a.bowT = 0.4; setTimeout(() => { if (mason.a) mason.a.bowT = 0; }, 300); } return; }
      const L = (s.len + LONG) * Q, ex = s.x + L / 2 + 0.1, ez = s.z - STP.tread / 2;
      A.dressing = { id: s.id, hits: 0 }; ev('dress:' + s.id); X.play('tap');
      SH6.crew.walkTo(mason, ex + 1.15, ez - 1.0, 2.6).then(() => { if (!A.dressing || !mason.a || !mason.a.alive) return; SH6.crew.setRole(mason, 'hammer', { fx: ex, fz: ez, k: 2, onHit: () => blow(s) }); });
    }
    function blow(s) {
      const D = A.dressing; if (!D || A.phase === 'done') return;
      D.hits++; V.mallet(false); V.scrape('R'); ev('blow:' + s.id + ':' + D.hits);
      const b = s.me.userData.boss; if (b) b.scale.set(1 - 0.3 * D.hits, 1, 1);
      if (D.hits < 3) return;
      A.dressed.push(s.id); A.dressing = null; ev('dressed:' + s.id);
      const g = s.me.geometry; s.me.geometry = stoneGeo(s.ring, s.len); g.dispose(); if (b) { s.me.remove(b); s.me.userData.boss = null; }
      V.thud();
      SH6.crew.setRole(mason, 'hold', { fx: Y[0], fz: Y[1] }); SH6.crew.walkTo(mason, MH[0], MH[1], 2.4);
      if (TP.on === s.id) tplSet(s, false);
      if (A.marks.length >= needMarks) marksDone();
    }
    // ── /h128 ──
    function toRow() {
      if (A.phase !== 'tpl') return; A.phase = 'row'; tplSet(null); tpl.visible = false; light.visible = false;
      for (const id of A.marks) { const s = yard.find((y) => y.id === id); s.gone = 1; s.me.visible = false; chalkOff(s); trayAdd(byId(id)); }
      X.shot(...camOf(i, 'row'), 1.4); rowDraw();
      // ── h128 ── (T8) on a ring with a hoist there are no turns: its line instead of the row's; an odd gap's line after the row's ── /h128 ──
      if (HB) { A.hoistLine = 1; X.line(LINE8.order, 5200); hoistMen(); }
      else X.line('גררו אבן מסומנת אל הרווח, לסירוגין משני צדיו · כשהחבל ליד הרווח נדלק, מה שנשאר הוא בדיוק אבן הסגירה', 5200);
      if (P.rule === 'odd') hint8('odd', LINE8.odd, 5400);
    }
    /* ── step 2 ── */
    const trayHit = (p) => { let best = null, bd = Math.max(44, gripR() * 0.8); for (const t2 of A.tray) { const q = sc(X, t2.me.position.x, t2.me.position.y + 0.25, t2.me.position.z); const d = Math.hypot(p.x - q[0], p.y - q[1]); if (d < bd) { bd = d; best = t2; } } return best; };
    const qOfPt = (x, z) => { const a = Math.atan2(x - C0[0], -(z - C0[1])); return [(a * P.R) / Q, Math.hypot(x - C0[0], z - C0[1])]; };
    function laidHit(p) {
      const xz = rayY(p, rTop); if (!xz) return null; const [q, r] = qOfPt(xz[0], xz[1]); if (Math.abs(r - (R.R - STP.tread / 2)) > 1.2) return null;
      let a = P.g0; for (const id of A.row.left) { const l = byId(id).len; if (q >= a - 0.5 && q <= a + l + 0.5) return { side: 'left', id }; a += l; }
      let b = P.g0 + P.G; for (const id of A.row.right) { const l = byId(id).len; if (q >= b - l - 0.5 && q <= b + 0.5) return { side: 'right', id }; b -= l; }
      for (const L of A.loose) { const l = byId(L.id).len; if (Math.abs(q - L.q) <= l / 2 + 0.5) return { side: 'loose', id: L.id }; }
      return null;
    }
    function targetQ(len, side) { const F = rowFit(P, { ...A.row, dressed: A.dressed }); return side === 'left' ? P.g0 + F.sL + len / 2 : P.g0 + P.G - F.sR - len / 2; }
    function dropStone(t2, f) {
      const xz = rayY(f, rTop + 0.15); const back = () => { trayLay(); ev('back:' + t2.id); };
      if (!xz) return back();
      const [q, r] = qOfPt(xz[0], xz[1]);
      if (Math.abs(r - (R.R - STP.tread / 2)) > 1.4 || q < P.g0 - 1 || q > P.g0 + P.G + 1) return back();
      const tl = targetQ(t2.len, 'left'), tr = targetQ(t2.len, 'right'), side = Math.abs(q - tl) <= Math.abs(q - tr) ? 'left' : 'right', off = q - (side === 'left' ? tl : tr);
      // ── h128 ── (T8) the hoist stands on that end: the stone knocks its leg and goes back to the tray ── /h128 ──
      if (H.state === 'up' && side === HB) { V.clack(); setTimeout(() => V.creak(), 90); H.shake = 0.7; ev('hoist:' + t2.id); if (!A.hoistLine) { A.hoistLine = 1; X.line(LINE8.order, 4200); } return back(); }
      const F = rowFit(P, { ...A.row, dressed: A.dressed }), room = P.G - F.sL - F.sR - A.loose.reduce((a2, L) => a2 + byId(L.id).len, 0);
      A.tray.splice(A.tray.indexOf(t2), 1); PR.remove(t2.me); all.splice(all.indexOf(t2.me), 1);
      if (slidesHome(off) && t2.len <= room + 1e-9) { A.row[side].push(t2.id); V.slide(0.8); setTimeout(() => V.slide(0), 260); X.play('tap'); ev(`lay:${t2.id}:${side}:${off.toFixed(2)}`); if (t2.ring !== i) { A.firstLay = 0; X.line('האבן אינה יושבת: התפר פעור · הקישו עליה כדי להרים אותה, והבנאי ישיב אותה למגרש', 3600); } }
      else { A.loose.push({ id: t2.id, q: clamp(q, P.g0 + t2.len / 2, P.g0 + P.G - t2.len / 2) }); A.firstLay = 0; ev(`loose:${t2.id}:${off.toFixed(2)}`); X.play('tap'); }
      trayLay(); rowDraw(); afterRow();
    }
    function lift(l) {
      A.lifts++; A.firstLay = 0;
      if (l.side === 'loose') A.loose = A.loose.filter((L) => L.id !== l.id);
      else { const L = A.row[l.side], k = L.indexOf(l.id); A.row[l.side] = L.slice(0, k); for (const id of L.slice(k + 1)) trayAdd(byId(id)); }   // (the stones laid after it on that side come up too)
      const s = byId(l.id);
      if (s.ring !== i) { A.wrongCarried = 1; ev('carried:' + s.id); const fresh = P.yard.find((y) => y.ring === i && !y.crack && !A.tray.some((t2) => t2.id === y.id) && ![...A.row.left, ...A.row.right].includes(y.id) && !A.loose.some((L) => L.id === y.id) && (P.sol.left.includes(y.id) || P.sol.right.includes(y.id))); if (fresh) setTimeout(() => { trayAdd(fresh); ev('brought:' + fresh.id); }, 600); }
      else trayAdd(s);
      ev('lift:' + l.id); rowDraw();
    }
    /** a tap on a stranger in the tray: the mason carries it back to the yard and brings a stone of the ring */
    function carryBack(t2) {
      A.tray.splice(A.tray.indexOf(t2), 1); PR.remove(t2.me); A.wrongCarried = 1; ev('carried:' + t2.id);
      const fresh = P.yard.find((y) => y.ring === i && !y.crack && !A.tray.some((x) => x.id === y.id) && ![...A.row.left, ...A.row.right].includes(y.id) && !A.loose.some((L) => L.id === y.id) && (P.sol.left.includes(y.id) || P.sol.right.includes(y.id)));
      trayLay(); if (fresh) setTimeout(() => { trayAdd(fresh); ev('brought:' + fresh.id); }, 600);
    }
    function afterRow() {
      const F = A.fit;
      if (F.bull && !A.bulled) { A.bulled = 1; X.quick({ x: cord.position.x, y: cord.position.y + 0.5, z: cord.position.z }, QUICK.bull, cord); V.gong(392, false); setTimeout(() => toKey(), 1200); }
    }
    /* ── step 3 ── */
    function toKey() {
      if (A.phase !== 'row') return; A.phase = 'key'; camLift(0.22); A.k = keyFresh(P); keyBuild(); keyPlace();
      for (const t2 of A.tray) { PR.remove(t2.me); } A.tray = [];
      X.shot(...camOf(i, 'key'), 1.2);
      X.line(MOUSE ? 'שני מוטות: דחפו כל מוט לעבר המרכז, אחד בכל פעם, בצעדים קטנים · הבנאי מחזיק את השני' : 'שני מוטות: דחפו כל מוט באגודל אחר לעבר המרכז, יחד · נתקעה? משכו מעט אחורה את המוט המקדים', 5200);
    }
    function keyFrame(dt) {
      const s = A.k, cracked = [...A.row.left, ...A.row.right].some((id) => byId(id).crack);
      let da = A.push.a, db = A.push.b; A.push.a = 0; A.push.b = 0;
      // (a bar still pressed the way it was going counts as pushing between the touch's move events: a jam is felt as long as he pushes)
      const held = (w) => Object.values(A.fing).includes(w);
      if (da > 0) A.lastA = A.t; else if (!da && held('a') && A.t - (A.lastA || -9) < 0.15) da = 1e-4;
      if (db > 0) A.lastB = A.t; else if (!db && held('b') && A.t - (A.lastB || -9) < 0.15) db = 1e-4;
      keyStep(s, { da, db }, dt, { cracked });
      V.grind(s.jam ? 1 : 0);
      // (build 128 tuning T2) the stone askew before it jams: seen as it turns on its rollers; heard as it drags, louder and higher the
      // more one side leads, from the leading bar's side of the screen
      { const lead = s.a - s.b, k = Math.min(1, Math.abs(lead) / s.tol), moving = (da > 0 || db > 0) && !s.jam;
        const q = barScr(lead >= 0 ? barA : barB), pan = q ? Math.max(-0.8, Math.min(0.8, (q[0] / innerWidth - 0.5) * 2)) : 0;
        V.strain(moving && k > 0.2 ? k : 0, pan); }
      for (const e of s.ev) {
        ev('key:' + e.e);
        if (e.e === 'jam' && !A.jamLine) { A.jamLine = 1; X.line('הפינה נתקעה: משכו מעט אחורה את המוט המקדים', 3000); }
        if (e.e === 'corner') { X.play('crack'); X.shake(0.2, 0.3); X.loss(LOSS['ring.corner'][1], keyAt(), LOSS['ring.corner'][0]); }
        if (e.e === 'crack') { A.crackShow = 1; rowDraw(); X.play('crack'); X.loss(LOSS['ring.crack'][1], keyAt(), LOSS['ring.crack'][0]); }
        if (e.e === 'closed') closed();
      }
      keyPlace();
    }
    const keyAt = () => ({ x: key.position.x, y: R.top + 0.6, z: key.position.z });
    function closed() {
      A.phase = 'closing'; V.grind(0); V.strain(0); camLift(0);
      const s = A.k;
      setTimeout(() => { V.mallet(false); X.sparks(key.position.x, R.top + 0.3, key.position.z, 8); }, 250);
      setTimeout(() => { V.step(i, !!(s.corner || s.crack)); if (!s.dmg) X.quick(keyAt(), QUICK.closed, key.children[0]); }, 600);
      const rec = { left: A.row.left.slice(), right: A.row.right.slice(), crack: s.crack, corner: s.corner, clean: s.dmg ? 0 : 1, by: 'p' };
      st.rings[i] = rec; X.save();
      setTimeout(() => (i === 15 && !m.free ? moment() : end1()), 1700);
    }
    function moment() {
      A.phase = 'moment'; A.mT = 0;
      for (const o of [barA, barB, cord]) if (o) o.visible = false;
      for (const w of [A.keyMen && A.keyMen.wA, A.keyMen && A.keyMen.wB]) if (w) SH6.crew.remove(w);
      X.shot(CAM.ringAll[0], CAM.ringAll[1], 2.6);
      X.line('חמש עשרה המעלות · ' + LINES.steps, 4200);   // (the source's own words: מידות ב, ה)
    }
    function end1() {
      if (A.phase === 'done') return; A.phase = 'done';
      const s = A.k || { dmg: 0, jams: 0, crack: 0, corner: 0 };
      const pts = ringPts({ dmg: s.dmg, wrongCarried: A.wrongCarried, firstLay: A.firstLay, jams: s.jams }), q = qOf(pts);
      X.end({ stars: starsOf(q), q, pts, perfect: pts >= 40, flags: { 'ring.crack': s.crack, 'ring.corner': s.corner, wrong: A.wrongCarried, lifts: A.lifts, jams: s.jams }, at: key ? keyAt() : null });
    }

    return {
      close: true,
      begin() {
        FG.attach(); X.shot(...camOf(i, 'yard'), 1.4);
        const first = !st.stepsLine; st.stepsLine = 1;
        X.line(first ? LINES.steps : `מעלה ${i}: גררו את התבנית מהשולחן אל אבן · קו אור ביניהן: האבן ממעלה אחרת`, first ? 4200 : 4600);
        if (first) setTimeout(() => { if (A.phase === 'tpl') X.line('גררו את התבנית מהשולחן אל אבן · קו אור ביניהן: האבן ממעלה אחרת', 4600); }, 4300);
        if (hasLong) hint8('long', LINE8.long, first ? 9000 : 4800);   // ── h128 ── (T8) ── /h128 ──
        setTimeout(() => { if (A.phase === 'intro') { A.phase = 'tpl'; X.hand({ x: tpl.position.x, y: tpl.position.y + 0.2, z: tpl.position.z }, -40, 30); } }, 1300);
      },
      update(dt) {
        A.t += dt;
        try {
          V.frame();
          if (A.phase === 'tpl' && TP.drag) X.hand(null);
          if (A.phase === 'tpl' || A.phase === 'row') tplFrame(dt);
          hoistFrame(dt);   // ── h128 ── (T8) ── /h128 ──
          if (A.phase === 'key') keyFrame(dt);
          if (A.phase === 'moment') { A.mT += dt; if (A.mT > 4.6 || (A.skip && A.mT > 1)) end1(); }
        } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h128] steps', e && e.message); } }
      },
      down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { A.fing = {}; },
      wants(p) {
        if (!p) return true;
        if (A.phase === 'tpl') return nearTpl(p) || !!yardHit(p) || (hasLong && nearMason(p));
        if (A.phase === 'row') return !!trayHit(p) || !!laidHit(p);
        if (A.phase === 'key') { const a = barScr(barA), b = barScr(barB); return [a, b].some((q) => q && Math.hypot(p.x - q[0], p.y - q[1]) < Math.max(160, gripR() * 1.6)); }
        return A.phase === 'moment';
      },
      holds() { return A.phase === 'key' && Object.keys(A.fing).length > 0; },
      end() {
        camLift(0);
        FG.detach(); V.stop(); X.hand(null);
        for (const o of all) PR.remove(o);
        for (const w of men) if (w) SH6.crew.remove(w);
        bossMat.dispose();   // ── h128 ── (T8) ── /h128 ──
        own('yard', 0);
        own('ring', 0); setBusy(X, 0);
      },
      at() { const p = ptAt(P.g0 + P.G / 2, R.R, R.top); return new T.Vector3(p[0], p[1], p[2]); },
      dbg() {
        const F = A.fit || rowFit(P, { ...A.row, dressed: A.dressed }), o = { t: +A.t.toFixed(2), phase: A.phase, ring: i, cls, free: !!m.free, G: P.G, C: P.C, need: needMarks, marks: A.marks.slice(), wrongMarks: A.wrongMarks, wrongCarried: A.wrongCarried, lifts: A.lifts, firstLay: A.firstLay, mouse: MOUSE, ev: A.ev.slice(-8), sol: P.sol, lens: Object.fromEntries(P.yard.map((y) => [y.id, y.len])), nf: FG.n };
        if (A.phase === 'tpl' || A.phase === 'intro') {
          o.tpl = tplScr(); o.on = TP.on; o.lightPx = TP.on ? tplLight(P, byId(TP.on)) : null; o.linePx = o.lightPx ? +linePx(o.lightPx).toFixed(1) : null; o.rock = +TPL.rock.toFixed(2); o.gold = +edgeMat.opacity.toFixed(2);
          o.yard = yard.filter((s) => !s.gone).map((s) => ({ id: s.id, len: s.len, at: sc(X, s.x, yTop, s.z - 0.25), marked: s.marked, dull: s.dull }));
        }
        if (A.phase === 'row') {
          o.row = { left: A.row.left.slice(), right: A.row.right.slice() }; o.loose = A.loose.map((L) => { const p = ptAt(L.q, R.R - STP.tread / 2, rTop + 0.18); return { id: L.id, at: sc(X, p[0], p[1], p[2]) }; }); o.next = nextSide({ ...A.row, dressed: A.dressed }, P);
          o.rest = F.rest; o.mid = F.mid; o.bull = F.bull; o.over = F.over; o.gape = F.gape; o.sL = F.sL; o.sR = F.sR;
          o.tray = A.tray.map((t2) => { const pL = ptAt(targetQ(t2.len, 'left')), pR = ptAt(targetQ(t2.len, 'right')); return { id: t2.id, len: t2.len, at: sc(X, t2.me.position.x, t2.me.position.y + 0.25, t2.me.position.z), toL: sc(X, pL[0], pL[1] + 0.15, pL[2]), toR: sc(X, pR[0], pR[1] + 0.15, pR[2]) }; });
          o.laid = [...A.row.left.map((id) => ['left', id]), ...A.row.right.map((id) => ['right', id])].map(([sd, id]) => { let q = sd === 'left' ? P.g0 : P.g0 + P.G; const L = A.row[sd]; for (const x of L) { if (x === id) break; q += (sd === 'left' ? 1 : -1) * byId(x).len; } const qc = q + (sd === 'left' ? 1 : -1) * byId(id).len / 2, p = ptAt(qc); return { id, side: sd, at: sc(X, p[0], p[1], p[2]) }; });
          o.pxq = +(pxPerAmah(...ptAt(P.g0 + P.G / 2)) * Q).toFixed(2);
        }
        if (A.k) { const s = A.k; Object.assign(o, { a: +s.a.toFixed(3), b: +s.b.toFixed(3), tol: s.tol, lag: s.lag, jam: s.jam, jamT: +s.jamT.toFixed(2), jams: s.jams, pend: s.q.some((e) => e[1] || e[2]) || Object.keys(A.fing).length > 0, corner: s.corner, crack: s.crack, dmg: s.dmg, barA: barScr(barA), barB: barScr(barB), dir: pushDir().map((v) => +v.toFixed(3)), pxf: PXF }); }
        if (A.phase === 'moment') o.mT = +A.mT.toFixed(2);
        // ── h128 ── (T8) the ring's own rule, as the bot and the stills read it
        o.rule = P.rule; o.off = P.off; o.order = P.order; o.hoist = H.state; o.dressed = A.dressed.slice(); o.dressing = A.dressing ? { ...A.dressing } : null;
        o.long = P.yard.filter((y) => isLong(y)).map((y) => y.id); o.mason = masonScr(); o.cordQ = +(cord.position.x).toFixed(2);
        if (H.g && H.state !== 'gone') { const q = ptAt(HB === 'left' ? P.g0 + 3 : P.g0 + P.G - 3, R.R - STP.tread / 2, R.top + 3.1); o.hoistAt = sc(X, q[0] + H.g.position.x, q[1], q[2] + H.g.position.z); }
        // ── /h128 ──
        o.pts = ringPts({ dmg: A.k ? A.k.dmg : 0, wrongCarried: A.wrongCarried, firstLay: A.firstLay, jams: A.k ? A.k.jams : 0 });
        return o;
      },
    };
  },
};
void lerp;
