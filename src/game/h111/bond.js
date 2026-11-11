/* ── build 118 ── h111/bond.js — the course in bond rebuilt as a logic puzzle played with a real crane (brief docs/specs/build118-brief.md
 * §B; the owner 9.11 on build 111: white rectangles that were not part of the world, no pile, the stone flew with the finger and the crane
 * meant nothing, "יד של אומן מוכנה" meant nothing, the kohen stood; he wants a hard logic puzzle with an exact stock and one order).
 *
 * The course below is drawn in the gap as real stones; the crews' stones of this course stand on both sides of it. Every stone of the
 * stock lies by itself in a row on the court's floor at the wall's foot, its length chalked on it. A tap on one: the tier ties it, the
 * treadwheel turns, it rises. A drag on the hanging stone (or the jib) carries it: the jib slews and luffs after the finger, heavily;
 * the guide rope turns it (only the 6 goes across the wall, as a header); a still hold on it lowers it. It lands only where it may lie,
 * and straight. A tap on a laid stone takes it up again. Joint over joint: red chalk at once at level 1; from level 2 the next course
 * cracks it (−20) and a new one comes. The kohen is not in this game (the figure rule of 10.11 for pure-skill games): the crews work.
 * Thickness 6 amot with two faces and the core: המחשה after Herodian building; "no joint over a joint" is a builders' rule (המחשה).
 */
import { H111, starsOf, checkCourse, canFinish, misplaced, puzzleOf } from './model.js';
import { SH2, frameOf, rowOff, stoneMesh, placeStone, laidFill } from './world.js';
import { onPlane, clamp, lerp, ease } from '../h109/kit.js';
import { chalkTag } from '../h109/acts3.js';
import { standTop, rampFor } from './acts.js';

const H = H111.H, ROW = H111.ROW, T6 = H111.T;
const INK = 'rgba(70,44,26,.95)';   // the builders' marks in charcoal (המחשה): white chalk did not read on the pale stones
const ALONG = 0, ACROSS = Math.PI / 2, TOLR = 0.12;
/** a stone's turn from the wall's line, folded (a stone is the same end for end): rad, signed */
const turnErr = (r, want) => Math.atan2(Math.sin(2 * (r - want)), Math.cos(2 * (r - want))) / 2;

/* ───────── the luffing treadwheel crane on the court's floor ───────── */
function luffCrane(X, mastH, J) {
  const T = X.THREE, P = X.props, g = new T.Group(); g.name = 'h118-crane';
  const beam = (a, b, r = 0.18, mat = P.M.wood) => { const v = new T.Vector3().subVectors(b, a), L = v.length(); const m = new T.Mesh(new T.CylinderGeometry(r, r * 1.1, L, 6), mat); m.position.copy(a).addScaledVector(v, 0.5); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v.normalize()); m.castShadow = true; return m; };
  const slew = new T.Group(); g.add(slew);
  // the wheel behind the mast, its axle across
  const wheel = new T.Group(), R = 3.2, Wd = 1.8;
  for (const s of [-1, 1]) { const rim = new T.Mesh(new T.TorusGeometry(R, 0.12, 6, 36), P.M.wood); rim.rotation.y = Math.PI / 2; rim.position.x = (s * Wd) / 2; wheel.add(rim); }
  for (let k = 0; k < 20; k++) { const a = (k / 20) * Math.PI * 2; const t = new T.Mesh(new T.BoxGeometry(Wd, 0.1, 0.34), P.M.woodD || P.M.wood); t.position.set(0, Math.sin(a) * R, Math.cos(a) * R); t.rotation.x = -a; wheel.add(t); }
  for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI; const sp = new T.Mesh(new T.BoxGeometry(0.12, 2 * R, 0.12), P.M.wood); sp.rotation.x = a; for (const s of [-1, 1]) { const c = sp.clone(); c.position.x = (s * Wd) / 2; wheel.add(c); } }
  wheel.position.set(0, R + 0.25, -3.4); slew.add(wheel);
  for (const s of [-1, 1]) { slew.add(beam(new T.Vector3(s * 1.5, 0, -5.2), new T.Vector3(s * 1.1, R + 0.25, -3.4))); slew.add(beam(new T.Vector3(s * 1.5, 0, -1.6), new T.Vector3(s * 1.1, R + 0.25, -3.4))); }
  // the mast: two legs to a head; the luffing jib hinged at the head
  slew.add(beam(new T.Vector3(-0.9, 0, 0.6), new T.Vector3(0, mastH, 0), 0.24)); slew.add(beam(new T.Vector3(0.9, 0, 0.6), new T.Vector3(0, mastH, 0), 0.24));
  slew.add(beam(new T.Vector3(0, 0, -1.6), new T.Vector3(0, mastH, 0), 0.2));
  const jib = new T.Group(); jib.position.set(0, mastH, 0); slew.add(jib);
  jib.add(beam(new T.Vector3(0, 0, 0), new T.Vector3(0, 0, J), 0.2));
  const luffR = P.rope(8, 0.05), hoist = P.rope(4, 0.06);
  P.root.add(g);
  const C = { g, slew, jib, wheel, mastH, J, theta: 0.6, base: { x: 0, z: 0, y: 0 }, tip: new T.Vector3(), luffR, hoist };
  C.place = (x, z) => { const y = X.ground(x, z); g.position.set(x, y, z); C.base = { x, z, y }; };
  /** the jib's head over (x, z): slew and luff (the radius 5…0.96 J) */
  C.aim = (x, z, k = 1) => {
    const dx = x - C.base.x, dz = z - C.base.z, r = clamp(Math.hypot(dx, dz), 5, J * 0.96);
    const want = Math.atan2(dx, dz); let d = Math.atan2(Math.sin(want - slew.rotation.y), Math.cos(want - slew.rotation.y)); slew.rotation.y += d * k;
    const th = Math.acos(r / J); C.theta = lerp(C.theta, th, k); jib.rotation.x = -C.theta;
  };
  C.tipWorld = (out = C.tip) => { g.updateMatrixWorld(true); out.set(0, 0, J); jib.localToWorld(out); return out; };
  C.headWorld = (out) => { g.updateMatrixWorld(true); out.set(0, 0, 0); jib.localToWorld(out); return out; };
  C.frame = (ropeRun) => {
    C.tipWorld(); const h = new X.THREE.Vector3(0, 2.2, -1.6); slew.localToWorld(h.set(0, C.mastH + 2.2, -1.2));
    luffR.set({ x: h.x, y: h.y, z: h.z }, { x: C.tip.x, y: C.tip.y, z: C.tip.z }, 0.2);
    if (ropeRun) wheel.rotation.x += ropeRun / R;
  };
  C.dispose = () => { P.remove(g); luffR.dispose(); hoist.dispose(); };
  // the head of the mast, a pulley block
  { const blk = new T.Mesh(new T.BoxGeometry(0.6, 0.6, 0.6), P.M.woodD || P.M.wood); blk.position.set(0, mastH + 0.2, 0); slew.add(blk);
    const ext = beam(new T.Vector3(0, mastH, 0), new T.Vector3(0, mastH + 2.4, -1.2), 0.14); slew.add(ext); }
  return C;
}

export const BOND = {
  icon: '🧱', title: 'הנדבך בקשר',
  walkLine: (m) => `קטע ${m.s} של החומה: הנדבך בקשר`,
  // (he walks up to the wall's top by the crews' ramp, as for the plumb line: the court behind the Heichal is no way for him (stretch 4
  // never arrived); the kohen is not in this game; the ramp stays at the stretch's start, the stock row begins after it)
  stand(m) { return standTop(frameOf(m.s), -1.4, 0.4); },
  prepare(m, X) { try { X.stages.s20Pin(rampFor(frameOf(m.s))); } catch (e) { /* */ } try { SH2.crane.g.visible = false; } catch (e) { /* */ } },
  make(m, X) {
    const F = frameOf(m.s), P = puzzleOf(m.s), lv = P.lv, T = X.THREE, PR = X.props;
    const A = { phase: 'open', t: 0, cur: null, stones: [], ids: 0, lifts: 0, cracks: 0, chalked: 0, drop: 0, v: 0, rise: 0, grip: null, pend: null, aimP: null, sway: { x: 0, z: 0, vx: 0, vz: 0 }, tipP: null, rotT: 0, rv: 0, misses: 0, said: {}, done: false, busy: false };
    const objs = [], crew = [], rubble = [];
    const add = (o) => { objs.push(o); return o; };
    const bedY = F.y, topY = F.y + H, carryB = topY + 1.6;
    const g = (x, z) => X.ground(x, z);
    const chalkM = PR.M.chalk, redM = PR.M.redc;
    const greenM = new T.MeshBasicMaterial({ color: '#3BD16F', transparent: true, opacity: 0.95, depthWrite: false, depthTest: false });
    const dk = new T.MeshBasicMaterial({ color: 0x3A2A1A });
    const boxAt = (mat, p, sx, sy, sz, yaw = F.yaw) => { const b = new T.Mesh(PR.geo.box, mat); b.scale.set(sx, sy, sz); b.position.set(p.x, p.y, p.z); b.rotation.y = yaw; PR.root.add(b); return add(b); };

    /* ── the course below, in the gap, as real stones (a little larger than the world's own course there) ── */
    const spans = P.open ? [[0, P.open[0]], [P.open[1], P.G]] : [[0, P.G]];
    for (let r = 0; r < 2; r++) for (const [a, L] of P.belowStones[r]) {
      const m0 = stoneMesh(X, L - 0.07, H - 0.02, ROW - 0.02); const p = F.at(a + L / 2, rowOff(r === 0 ? 0 : 2), -H / 2 + 0.01); m0.position.set(p.x, p.y, p.z); m0.rotation.y = F.yaw; add(m0);
    }
    for (const [a, b] of spans) { const p = F.at((a + b) / 2, 0, -H / 2); const f = new T.Mesh(PR.geo.box, PR.M.fill || PR.M.stone); f.scale.set(b - a - 0.05, H - 0.1, ROW + 0.02); f.position.set(p.x, p.y, p.z); f.rotation.y = F.yaw; PR.root.add(f); add(f); }
    // the joints chalked at each row's outer edge (not at stretch 9: read from the stones)
    if (P.marks) for (let r = 0; r < 2; r++) for (const x of P.below[r]) { const ac = r === 0 ? 2.75 : -2.75; boxAt(chalkM, F.at(x, ac, 0.02), 0.14, 0.03, 0.6); }
    // the crews' stones of this course on both sides of the gap (two faces and the fill), and two more on each side beyond them
    for (const [a0, b0] of [[-6, 0], [P.G, P.G + 6]]) {
      for (const r of [0, 2]) for (const [a, L] of (a0 < 0 ? [[a0, 3.5], [a0 + 3.5, 2.5]] : [[a0, 2.5], [a0 + 2.5, 3.5]])) { const m0 = stoneMesh(X, L - 0.07, H - 0.02, ROW + 0.04); const p = F.at(a + L / 2, rowOff(r), H / 2); m0.position.set(p.x, p.y, p.z); m0.rotation.y = F.yaw; add(m0); }
      const p = F.at((a0 + b0) / 2, 0, H / 2 - 0.02); const f = new T.Mesh(PR.geo.box, PR.M.fill || PR.M.stone); f.scale.set(6 - 0.04, H - 0.08, ROW + 0.02); f.position.set(p.x, p.y, p.z); f.rotation.y = F.yaw; PR.root.add(f); add(f);
    }
    // the gate's opening (stretches 7, 8): its timber frame stands in it, nothing is laid there
    if (P.open) for (const x of P.open) { const p = F.at(x, 0, H / 2); boxAt(PR.M.wood, { x: p.x, y: p.y + 0.6, z: p.z }, 0.4, H * 1.6, T6 + 0.3); }
    // the measuring reed along the gap's outer edge: a notch every amah, a deeper one every five
    { const p = F.at(P.G / 2, 3.25, 0.08); boxAt(PR.M.wood, p, P.G + 0.4, 0.12, 0.22);
      for (let x = 0; x <= P.G; x++) { const q = F.at(x, 3.25, 0.15); boxAt(dk, q, 0.05, 0.03, x % 5 === 0 ? 0.24 : 0.14); } }
    // the gap's length in charcoal on the core of the course below, in the gap (covered as the stones go in)
    // (a gate's stretch: each side's length on its own side; the opening stays empty)
    for (const [a, b] of spans) { const tg = chalkTag(X, `${b - a} אמות`, Math.min(4, (b - a) * 0.7), INK); const p = F.at((a + b) / 2, 0, 0.05); tg.position.set(p.x, p.y, p.z); tg.rotation.y = F.yaw - Math.PI; PR.root.add(tg); add(tg); }

    /* ── the stock: every stone by itself on the floor at the wall's foot, short to long, its length chalked ── */
    const ACR = -4.7;
    const tot = P.stock.reduce((s, q) => s + q.L, 0) + (P.stock.length - 1) * 0.6;
    // where each lies along the wall: one row centred on the gap; at a gate's stretch two rows, left and right of the opening (the
    // court in front of the opening is the gate's way, the frame's foot is there), the next stone to the shorter side
    const slot = (() => {
      // (never before along −1.5: the crews' ramp leans on the inner face at along −8.7…−2.3, rampFor)
      let x0 = Math.max(-1.5, P.G / 2 - tot / 2); if (!P.open) return (L) => { const c = x0 + L / 2; x0 += L + 0.6; return c; };
      let lx = P.open[0] - 0.4, rx = P.open[1] + 0.4;
      return (L) => { if (P.open[0] - lx <= rx - P.open[1] && lx - L >= -1.5) { const c = lx - L / 2; lx -= L + 0.6; return c; } const c = rx + L / 2; rx += L + 0.6; return c; };
    })();
    const stock = P.stock.map((q) => {
      const home = F.at(slot(q.L), ACR, 0);
      const mm = stoneMesh(X, 1, 1, 1); mm.scale.set(q.L - 0.05, H - 0.02, ROW); const gy = g(home.x, home.z);
      mm.position.set(home.x, gy + H / 2, home.z); mm.rotation.y = F.yaw; add(mm);
      const tg = chalkTag(X, String(q.L), 2.2, INK); PR.root.add(tg); add(tg);
      return { id: q.id, L: q.L, m: mm, home: { x: home.x, z: home.z, y: gy + H / 2 }, tg, laid: null, gone: false };
    });
    const homeOutline = [];
    const ext = stock.reduce((e, s) => { const l = F.local(s.home.x, s.home.z).along; return [Math.min(e[0], l - s.L / 2), Math.max(e[1], l + s.L / 2)]; }, [0, P.G]);

    /* ── the crane: outside the wall, behind it (the camera looks from the court; nothing stands between them) ── */
    const BA = 13, baseP = F.at(P.G / 2, BA, 0);
    const mastH = Math.max(9.5, topY - g(baseP.x, baseP.z) + 7);
    const C = luffCrane(X, mastH, Math.max(20, Math.hypot(Math.max(P.G / 2 - ext[0], ext[1] - P.G / 2) + 1.5, BA - ACR + 1) / 0.93)); C.place(baseP.x, baseP.z);
    { const c = F.at(P.G / 2, 0); C.aim(c.x, c.z, 1); }
    const tip = new T.Vector3(), hd = new T.Vector3();
    const legs = [PR.rope(4, 0.045), PR.rope(4, 0.045)], guide = PR.rope(12, 0.07);
    for (const l of legs) l.show(false); guide.show(false); C.hoist.show(false);
    // the crews: the wheel man in his wheel, the tier at the stock, the tagline man on the floor
    const wP = F.at(P.G / 2, BA + 3.4, 0);
    const wheelMan = SH2.crew.add(wP.x, wP.z, { role: 'push', fx: baseP.x, fz: baseP.z, crew: 1 });
    const tierP = F.at(ext[0] - 1.6, ACR - 1.2, 0);
    const tier = SH2.crew.add(tierP.x, tierP.z, { role: 'hold', item: 'rope', fx: baseP.x, fz: baseP.z, crew: 2 });
    const tagP = F.at(P.G / 2 + 3, -9, 0);
    const tagMan = SH2.crew.add(tagP.x, tagP.z, { role: 'pull', fx: baseP.x, fz: baseP.z, crew: 3 });
    crew.push(wheelMan, tier, tagMan);

    /* ── under the hanging stone: its shadow, a plumb line, the green outline where it would land ── */
    const shG = new T.Group(), shM = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ color: 0x1A120A, transparent: true, opacity: 0.4, depthWrite: false })); shM.rotation.x = -Math.PI / 2; shM.renderOrder = 995; shG.add(shM); shG.visible = false; PR.root.add(shG); add(shG);
    const plG = new T.BufferGeometry(); plG.setAttribute('position', new T.Float32BufferAttribute([0, 0, 0, 0, 1, 0], 3));
    const plumb = new T.Line(plG, new T.LineBasicMaterial({ color: 0x2A1C0E })); plumb.visible = false; plumb.frustumCulled = false; PR.root.add(plumb); add(plumb);
    const outl = new T.Group(); outl.visible = false; PR.root.add(outl); add(outl);
    const oSides = [0, 1, 2, 3].map(() => { const b = new T.Mesh(PR.geo.box, greenM); b.renderOrder = 999; outl.add(b); return b; });
    function outline(cx, cy, cz, len, dep, yaw) {
      outl.visible = true; outl.position.set(cx, cy, cz); outl.rotation.y = yaw; const w = 0.14;
      oSides[0].scale.set(len, 0.05, w); oSides[0].position.set(0, 0, dep / 2 - w / 2); oSides[1].scale.set(len, 0.05, w); oSides[1].position.set(0, 0, -dep / 2 + w / 2);
      oSides[2].scale.set(w, 0.05, dep); oSides[2].position.set(len / 2 - w / 2, 0, 0); oSides[3].scale.set(w, 0.05, dep); oSides[3].position.set(-len / 2 + w / 2, 0, 0);
    }
    const ringM = new T.MeshBasicMaterial({ color: '#FFF1C2', transparent: true, opacity: 0.6, depthWrite: false, depthTest: false });
    const rings = [0, 1].map(() => { const m2 = new T.Mesh(new T.RingGeometry(0.85, 1, 40), ringM.clone()); m2.renderOrder = 998; m2.visible = false; PR.root.add(m2); return add(m2); });

    /* ── the grid of the course: what lies where ── */
    const occ = [Array(P.G).fill(null), Array(P.G).fill(null)];
    function fits(L, hdr, row, a) {
      if (L === 6 && !hdr) return 'אבן ראש נכנסת לרוחב · סובבו בחבל';
      if (hdr && L !== 6) return 'רק אבן של 6 אמות נכנסת לרוחב';
      const w = hdr ? 2 : L;
      if (a < 0 || a + w > P.G) return 'מחוץ לקטע';
      for (let x = a; x < a + w; x++) {
        if (P.open && x >= P.open[0] && x < P.open[1]) return 'כאן פתח השער: משאירים אותו ריק';
        for (const r of hdr ? [0, 1] : [row === 0 ? 0 : 1]) if (occ[r][x] != null) return 'המקום תפוס';
      }
      return '';
    }
    const laidList = () => A.stones.map((q) => ({ a: q.a, L: q.L, row: q.row }));
    function jointsOf(q) {
      const w = q.row === 'h' ? 2 : q.L, out = [];
      for (const r of q.row === 'h' ? [0, 1] : [q.row === 0 ? 0 : 1]) for (const x of [q.a, q.a + w]) { if (x <= 0 || x >= P.G || (P.open && (x === P.open[0] || x === P.open[1]))) continue; if (P.below[r].has(x)) out.push({ r, x }); }
      return out;
    }
    function lay(s, at) {
      const q = { id: ++A.ids, s, L: s.L, a: at.a, row: at.row, mark: null };
      const w = q.row === 'h' ? 2 : q.L; for (let x = q.a; x < q.a + w; x++) for (const r of q.row === 'h' ? [0, 1] : [q.row === 0 ? 0 : 1]) occ[r][x] = q.id;
      placeStone(X, F, s.m, q); s.laid = q; A.stones.push(q); return q;
    }
    function unlay(q) {
      for (const r of [0, 1]) for (let x = 0; x < P.G; x++) if (occ[r][x] === q.id) occ[r][x] = null;
      const i = A.stones.indexOf(q); if (i >= 0) A.stones.splice(i, 1);
      if (q.mark) { PR.remove(q.mark); q.mark = null; }
      if (q.s) q.s.laid = null;
    }
    /** where the hanging stone would land if lowered now: { a, row, hdr, why } or null (not over the wall) */
    function landing(hx, hz) {
      const q = A.cur; if (!q) return null;
      const lo = F.local(hx, hz); if (Math.abs(lo.across) > T6 / 2 + 0.4) return null;
      const r = q.m.rotation.y - F.yaw, eAl = Math.abs(turnErr(r, ALONG)), eAc = Math.abs(turnErr(r, ACROSS));
      const hdr = eAc < eAl, w = hdr ? 2 : q.L;
      if (lo.along < -0.6 || lo.along > P.G + 0.6) return { a: 0, row: 0, hdr, why: 'מחוץ לקטע', off: true };
      const a = Math.round(lo.along - w / 2), row = hdr ? 'h' : lo.across >= 0 ? 0 : 2;
      const straight = (hdr ? eAc : eAl) <= TOLR;
      const why = fits(q.L, hdr, row, a) || (straight ? '' : 'עקומה: סובבו בחבל');
      return { a, row, hdr, why };
    }

    /* ── the camera: one high shot from the court's side (≈ 66°): gap, neighbours, reed, stock row, the crane's foot, the jib's head ── */
    const span = Math.max(P.G + 12, ext[1] - ext[0] + 4);
    const midA = (ext[0] + ext[1]) / 2;
    const CT = F.at(midA, -1.2, 0); CT.y = bedY;
    // (the lens is 32° high: the picture is about 0.72 of the distance wide; the row of the stock is the widest thing)
    const dCam = Math.max(34, (span + 4) / 0.72), el = 56 * Math.PI / 180;
    const CP = { x: CT.x - F.nx * dCam * Math.cos(el), y: CT.y + dCam * Math.sin(el), z: CT.z - F.nz * dCam * Math.cos(el) };
    const camWork = (dur = 1.2) => X.shot([CP.x, CP.y, CP.z], [CT.x, CT.y, CT.z], dur);

    function pickStock(p) {
      const ms = stock.filter((s) => !s.laid && !s.gone && s !== A.curS).map((s) => s.m); const hits = X.rayAt(p.x, p.y).intersectObjects(ms, false);
      if (hits.length) return stock.find((s) => s.m === hits[0].object) || null;
      // (a finger beside a small stone: the nearest within 34 px on the screen)
      let best = null, bd = 34; for (const s of stock) { if (s.laid || s.gone || s === A.curS) continue; const q = X.scr(s.m.position.x, s.m.position.y, s.m.position.z); const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = s; } }
      return best;
    }
    function pickLaid(p) {
      const ms = A.stones.map((q) => q.s.m); const hits = X.rayAt(p.x, p.y).intersectObjects(ms, false);
      if (!hits.length) return null; return A.stones.find((q) => q.s.m === hits[0].object) || null;
    }
    function hookTo(s, fromLaid) {
      if (fromLaid) { A.lifts++; unlay(fromLaid); X.word({ x: s.m.position.x, y: topY + 1.6, z: s.m.position.z }, 'מרימים אותה חזרה'); }
      A.cur = s; A.curS = s; A.phase = 'hook'; A.t0 = A.t; A.rise = 0; A.drop = 0; A.v = 0; A.grip = null; A.pend = null;
      A.aimP = { x: s.m.position.x, z: s.m.position.z }; A.from = { y: s.m.position.y };
      A.rotT = s.m.rotation.y; A.rv = 0; A.sway = { x: 0, z: 0, vx: 0, vz: 0 };
      X.line('הצוות קושר את האבן · גלגל הדריכה מרים'); X.play('rope'); X.hand(null);
      if (!fromLaid) { try { SH2.crew.walkTo(tier, s.m.position.x - F.nx * 1.6, s.m.position.z - F.nz * 1.6, 3).then(() => SH2.crew.face(tier, s.m.position.x, s.m.position.z)); } catch (e) { /* */ } }
    }
    const ropeEnd = () => { const s = A.cur; if (!s) return null; const r = s.m.rotation.y, half = s.L / 2; const ex = Math.cos(r), ez = -Math.sin(r); const e1 = { x: s.m.position.x + ex * half, z: s.m.position.z + ez * half }, e2 = { x: s.m.position.x - ex * half, z: s.m.position.z - ez * half }; const tm = tagMan.a; const d1 = Math.hypot(e1.x - tm.x, e1.z - tm.z), d2 = Math.hypot(e2.x - tm.x, e2.z - tm.z); const e = d1 < d2 ? e1 : e2; return { x: e.x, y: s.m.position.y - H * 0.2, z: e.z }; };
    const tagHand = () => ({ x: tagMan.a.x, y: g(tagMan.a.x, tagMan.a.z) + 1.4, z: tagMan.a.z });
    function slings(on) {
      const s = A.cur; if (!s || !on) { for (const l of legs) l.show(false); C.hoist.show(false); return; }
      const r = s.m.rotation.y, ax = { x: Math.cos(r), z: -Math.sin(r) }, hk = { x: s.m.position.x, y: s.m.position.y + H / 2 + 1.1, z: s.m.position.z };
      C.tipWorld(tip); C.hoist.show(true); C.hoist.set({ x: tip.x, y: tip.y, z: tip.z }, hk, 0);
      for (let k = 0; k < 2; k++) { const sg = k ? 1 : -1; legs[k].show(true); legs[k].set(hk, { x: s.m.position.x + ax.x * sg * s.L * 0.32, y: s.m.position.y + H / 2, z: s.m.position.z + ax.z * sg * s.L * 0.32 }, 0); }
    }
    function gripOf(p) {
      if (A.phase !== 'carry' || !A.cur) return null;
      C.tipWorld(tip); const tq = X.scr(tip.x, tip.y, tip.z);
      if (tq.on !== false && Math.hypot(tq.x - p.x, tq.y - p.y) < 70) return 'jib';
      { C.headWorld(hd); const a = X.scr(hd.x, hd.y, hd.z), vx = tq.x - a.x, vy = tq.y - a.y, L2 = vx * vx + vy * vy || 1, u = clamp(((p.x - a.x) * vx + (p.y - a.y) * vy) / L2, 0.3, 1); if (Math.hypot(a.x + vx * u - p.x, a.y + vy * u - p.y) < 34) return 'jib'; }
      const s = A.cur.m, st = X.scr(s.position.x, s.position.y, s.position.z); if (Math.hypot(st.x - p.x, st.y - p.y) < 55) return 'stone';
      const e2 = ropeEnd(), h = tagHand(), a = X.scr(h.x, h.y, h.z), b = X.scr(e2.x, e2.y, e2.z);
      { const vx = b.x - a.x, vy = b.y - a.y, L2 = vx * vx + vy * vy || 1, u = clamp(((p.x - a.x) * vx + (p.y - a.y) * vy) / L2, 0, 0.9), d = Math.hypot(a.x + vx * u - p.x, a.y + vy * u - p.y); if (d < 36) return 'rope'; }
      if (Math.hypot(st.x - p.x, st.y - p.y) < 90) return 'stone';
      return null;
    }
    /** a still stone: the place under it, or the floor (back to its place in the row) */
    function land() {
      const s = A.cur, c = s.m.position, at = { x: c.x, y: topY + 1.2, z: c.z }, L0 = landing(c.x, c.z);
      if (!L0 || L0.off) {
        // down on the floor, off the wall: the crews carry it back to its place in the row
        s.m.position.set(s.home.x, s.home.y, s.home.z); s.m.rotation.y = F.yaw; A.cur = null; A.curS = null; A.phase = 'choose'; slings(false); X.play('thud'); camWork();
        X.line(L0 && L0.off ? 'מחוץ לקטע · האבן חזרה לשורה' : 'האבן חזרה לשורה · געו באבן'); return;
      }
      if (L0.why) { A.drop = Math.max(0, A.drop - 1.4); A.v = 0; A.misses++; X.word(at, L0.why); X.play('thud'); return; }
      const q = lay(s, { a: L0.a, row: L0.row }); A.cur = null; A.curS = null; slings(false);
      X.play('settle'); X.dust(c.x, bedY + 0.2, c.z, 10, 2.2); X.shake(0.12, 0.22);
      const J = jointsOf(q);
      if (J.length && lv <= 1) {
        const j = J[0], p = F.at(j.x, j.r === 0 ? 2 : -2, H + 0.04); const mk = boxAt(redM, p, 0.22, 0.03, 1.9); q.mark = mk;
        X.word({ x: p.x, y: topY + 1, z: p.z }, 'חיבור מעל חיבור!');
      } else X.hit({ x: c.x, y: topY + 1, z: c.z }, 'good', { text: '', craft: 'בנאים' });
      afterSet();
    }
    function legalSomewhere() {
      for (const s of stock) { if (s.laid || s.gone) continue;
        if (s.L === 6) { for (let a = 0; a <= P.G - 2; a++) if (!fits(6, true, 'h', a)) return true; }
        else for (const row of [0, 2]) for (let a = 0; a <= P.G - s.L; a++) if (!fits(s.L, false, row, a)) return true; }
      return false;
    }
    async function afterSet() {
      const Cc = checkCourse(P, A.stones);
      if (Cc.full) return close();
      A.phase = 'choose'; camWork();
      if (!legalSomewhere() || (!canFinish(P, laidList()) && lv <= 1 && A.lifts >= 2)) {
        X.line('נשאר רווח שאף אבן לא סוגרת · הרימו אבן וחשבו מחדש');
        if (lv <= 1 && A.lifts >= 2) {
          const bad = misplaced(P, laidList());
          if (bad) { const q = A.stones.find((s) => s.a === bad.a && s.row === bad.row && s.L === bad.L); if (q && !q.mark) { const w = q.row === 'h' ? 2 : q.L; const p = F.at(q.a + w / 2, q.row === 'h' ? 0 : rowOff(q.row), H + 0.05); q.mark = boxAt(redM, p, w - 0.3, 0.03, 0.25); A.chalked = 1; X.word({ x: p.x, y: topY + 1.2, z: p.z }, 'רב האומנים: האבן הזאת לא במקומה'); } }
        }
        return;
      }
      X.line(Cc.joj.length && lv <= 1 ? 'חיבור מעל חיבור: געו באבן המסומנת כדי להרים אותה' : 'עוד אבן · בלי חיבור מעל חיבור');
    }
    async function close() {
      if (A.done) return;
      const Cc = checkCourse(P, A.stones);
      if (Cc.joj.length && lv <= 1) { A.phase = 'choose'; X.line('הרווח מלא, אבל יש חיבור מעל חיבור · הרימו אותה והחליפו'); return; }
      A.phase = 'closing'; X.hand(null); X.line('');
      if (Cc.joj.length) {
        // the next course is lowered on it: every stone over a joint cracks; the crane takes it down, a new one comes on a sledge
        await X.wait(0.5); X.play('rope'); await X.wait(0.5);
        const bad = [...new Set(Cc.joj.map((j) => j.id))].map((id) => A.stones.find((q) => q.id === id)).filter(Boolean);
        for (const q of bad) {
          const c = q.s.m.position, at = { x: c.x, y: topY + 1.4, z: c.z };
          const cr = new T.Mesh(PR.geo.box, dk); cr.scale.set(0.07, H * 0.92, (q.row === 'h' ? T6 : ROW) + 0.08); cr.position.copy(c); cr.rotation.set(0, F.yaw, 0.35); PR.root.add(cr); add(cr);
          X.shake(0.25, 0.4); X.dust(c.x, c.y, c.z, 14, 1.8); X.play('crack');
          X.loss(20, at, 'חיבור מעל חיבור: האבן נסדקה', 1); A.cracks++;
          await X.wait(1.0);
          PR.remove(cr); unlay(q);
          // its halves to the rubble heap at the wall's foot (they stay), a new stone of its length in its place in the row
          const hp = F.at(P.G + 4 + rubble.length * 0.8, -5.2, 0); const hb = new T.Mesh(PR.geo.box, PR.M.ash || PR.M.stone); hb.scale.set(q.L * 0.45, 0.9, 1.4); hb.position.set(hp.x, g(hp.x, hp.z) + 0.45, hp.z); hb.rotation.y = F.yaw + 0.4 * rubble.length; PR.root.add(hb); rubble.push(hb); add(hb);
          q.s.m.position.set(q.s.home.x, q.s.home.y, q.s.home.z); q.s.m.rotation.y = F.yaw; X.dust(q.s.home.x, q.s.home.y, q.s.home.z, 8, 1.4);
        }
        X.line('רב האומנים הוציא את הסדוקה · אבן חדשה בשורה · הניחו שוב, בלי חיבור מעל חיבור');
        A.phase = 'choose'; camWork(); return;
      }
      A.done = true; A.phase = 'done';
      const at = F.at(P.G / 2, 0, H + 1.6);
      // the crews pour the core between the faces; the extra stone (level 1) goes back to the yard
      await X.wait(0.5);
      const fills = laidFill(X, F, P, A.stones); X.play('tier'); X.dust(at.x, topY, at.z, 16, P.G * 0.3);
      const clean = !A.lifts && !A.cracks;
      X.bonus(clean ? P.bonus * 2 : P.bonus, 'course', clean ? 'נדבך קשור, בלי להרים אף אבן' : 'נדבך קשור, בלי חיבור על חיבור');
      if (clean) X.perfect('בול! נדבך קשור', at);
      const st = X.M.st; st.lay[m.s] = { stones: A.stones.map((q) => ({ a: q.a, L: q.L, row: q.row, off: 0 })) };
      SH2.laid[m.s] = { stones: st.lay[m.s].stones.map((q) => ({ ...q })), meshes: A.stones.map((q) => q.s.m) };
      SH2.fill[m.s] = fills;
      for (const q of A.stones) { const i = objs.indexOf(q.s.m); if (i >= 0) objs.splice(i, 1); }
      X.save();
      const qv = Math.max(0.4, 1 - 0.12 * A.lifts - 0.25 * A.cracks - 0.15 * A.chalked);
      await X.wait(1.6);
      X.end({ q: qv, stars: starsOf(qv), perfect: clean && !A.misses, at });
    }
    return {
      async begin() {
        X.kohen(false);
        // the whole work's ground kept clear of the Mount's crews (the Heichal's priests stood on the stock row at the western stretches)
        try { const pts = [F.at(ext[0] - 3, ACR - 4), F.at(ext[1] + 3, ACR - 4), F.at(ext[0] - 3, BA + 6), F.at(ext[1] + 3, BA + 6)]; const xs = pts.map((q) => q.x), zs = pts.map((q) => q.z); if (X.stages.keepOut) X.stages.keepOut([[Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)]]); } catch (e) { /* */ }
        const c = F.at(P.G / 2, 0, H);
        X.shot([c.x - F.nx * 60, c.y + 90, c.z - F.nz * 60], [c.x, c.y, c.z], 0.01);
        X.line(`קטע ${m.s}: רווח של ${P.G} אמות בנדבך${P.open ? ' עם פתח שער' : ''}`);
        await X.wait(1.0); camWork(1.8); await X.wait(1.8);
        A.phase = 'choose';
        const need = P.exact ? 'כל אבני המלאי נכנסות' : 'אבן אחת תישאר';
        X.line(`סגרו את הרווח בשתי השורות · ${need} · בלי חיבור מעל חיבור`);
        const s0 = stock[0]; X.hand({ x: s0.m.position.x, y: s0.m.position.y + 1, z: s0.m.position.z }, 0, 10);
      },
      update(dt) {
        A.t += dt;
        for (const s of stock) { s.tg.visible = !s.laid && s !== A.cur && !s.gone; if (s.tg.visible) { s.tg.position.set(s.m.position.x, s.m.position.y + H / 2 + 0.03, s.m.position.z); s.tg.rotation.y = F.yaw - Math.PI; } }
        const s = A.cur;
        let ropeRun = 0;
        if (A.phase !== 'carry' || !s) { shG.visible = false; plumb.visible = false; outl.visible = false; }
        if (A.phase === 'hook' && s) {
          C.aim(A.aimP.x, A.aimP.z, 1 - Math.exp(-dt * 2.2)); C.tipWorld(tip);
          const over = Math.hypot(tip.x - s.m.position.x, tip.z - s.m.position.z) < 0.6 || A.t - A.t0 > 2.6;
          C.hoist.show(true); C.hoist.set({ x: tip.x, y: tip.y, z: tip.z }, { x: tip.x, y: Math.max(s.m.position.y + H / 2 + 1.1, tip.y - 2 - A.rise * 10), z: tip.z }, 0);
          if (over) {
            const r0 = A.rise; A.rise = Math.min(1, A.rise + dt * 0.6); ropeRun = (A.rise - r0) * 20;
            if (A.rise > 0.3) { const k = clamp((A.rise - 0.3) / 0.7, 0, 1); s.m.position.y = lerp(A.from.y, carryB + H / 2, ease(k)); s.m.position.x = lerp(s.m.position.x, tip.x, 0.2); s.m.position.z = lerp(s.m.position.z, tip.z, 0.2); slings(true); }
            if (A.rise >= 1) {
              A.phase = 'carry'; A.drop = 0; A.tipP = { x: tip.x, z: tip.z }; A.aimP = { x: tip.x, z: tip.z };
              X.line(s.L === 6 && !A.said.hdr ? 'אבן ראש: סובבו אותה בחבל לרוחב החומה · גררו את האבן אל מקומה · החזיקו עליה: יורדת' : `${s.L} אמות · גררו את האבן אל מקומה · החזיקו עליה: יורדת`);
              if (s.L === 6) { A.said.hdr = true; const e = ropeEnd(), h = tagHand(); X.hand({ x: (e.x + h.x) / 2, y: (e.y + h.y) / 2, z: (e.z + h.z) / 2 }, 50, 0); }
            }
          }
        } else if (A.phase === 'carry' && s) {
          // the crane after the finger, heavily; the stone under the jib's head, late and swinging
          C.aim(A.aimP.x, A.aimP.z, 1 - Math.exp(-dt * 1.1)); C.tipWorld(tip);
          const ta = { x: (tip.x - A.tipP.x) / Math.max(dt, 1e-3), z: (tip.z - A.tipP.z) / Math.max(dt, 1e-3) }; A.tipP = { x: tip.x, z: tip.z };
          const S = A.sway, w2 = 9.8 / 7, damp = [2.4, 1.2, 0.5][lv - 1], wind = lv >= 3 ? Math.sin(A.t * 0.6) * 0.3 : 0;
          S.vx += (-w2 * S.x - (ta.x - (S.lx || 0)) * 0.8 + wind) * dt; S.vz += (-w2 * S.z - (ta.z - (S.lz || 0)) * 0.8) * dt; S.lx = ta.x; S.lz = ta.z;
          S.vx *= Math.exp(-dt * damp); S.vz *= Math.exp(-dt * damp); S.x = clamp(S.x + S.vx * dt, -1.4, 1.4); S.z = clamp(S.z + S.vz * dt, -1.4, 1.4);
          const hx = tip.x + S.x, hz = tip.z + S.z;
          const there = Math.hypot(tip.x - A.aimP.x, tip.z - A.aimP.z) < 0.6;
          A.v = A.grip === 'hold' && there ? Math.min(2.2, A.v + dt * 2.4) : Math.max(0, A.v - dt * 10);
          A.drop += A.v * dt; ropeRun = -A.v * dt;
          const lo = F.local(hx, hz), overWall = Math.abs(lo.across) < T6 / 2 + 0.4 && lo.along > -7 && lo.along < P.G + 7;
          const inGap = overWall && lo.along > -0.3 && lo.along < P.G + 0.3;
          const floor = inGap ? bedY : overWall ? topY : g(hx, hz);
          if (lv >= 3) A.rotT += Math.sin(A.t * 0.47 + 1.3) * 0.018 * dt;   // (the wind turns it a little: a lowering of 2.5 s moves it under 3°)
          A.rv += ((A.rotT - s.m.rotation.y) * 7 - A.rv * 3.2) * dt; s.m.rotation.y += A.rv * dt;
          const bottom = carryB - A.drop;
          s.m.position.set(hx, bottom + H / 2, hz);
          if (bottom <= floor + 0.01) {
            s.m.position.y = floor + H / 2;
            if (inGap || !overWall) land();
            else { A.drop = Math.max(0, A.drop - 1.4); A.v = 0; X.word({ x: hx, y: topY + 1.2, z: hz }, 'המקום תפוס'); X.play('thud'); }
          }
          if (A.cur) {
            slings(true);
            const L0 = landing(hx, hz), fy = inGap ? bedY : overWall ? topY : g(hx, hz);
            shG.visible = true; shG.position.set(hx, fy + 0.05, hz); shG.rotation.y = s.m.rotation.y; shM.scale.set(s.L, ROW, 1);
            const Pp = plG.attributes.position; Pp.setXYZ(0, hx, s.m.position.y - H / 2, hz); Pp.setXYZ(1, hx, fy + 0.06, hz); Pp.needsUpdate = true; plumb.visible = true;
            if (L0 && !L0.why && !L0.off) { const w = L0.hdr ? 2 : s.L, p = F.at(L0.a + w / 2, L0.hdr ? 0 : rowOff(L0.row), 0.06); outline(p.x, p.y, p.z, w, L0.hdr ? T6 : ROW, F.yaw); } else outl.visible = false;
            // the tagline man keeps about six amot of rope: he walks under it, inside the wall
            const e2 = ropeEnd(), tx = e2.x - F.nx * 5.5, tz = e2.z - F.nz * 5.5; if (Math.hypot(tagMan.a.x - tx, tagMan.a.z - tz) > 2.5 && !tagMan.a.path) SH2.crew.walkTo(tagMan, tx, tz, 3.2).then(() => SH2.crew.face(tagMan, e2.x, e2.z));
          }
        }
        // the guide rope from the stone's end to the tagline man's hands, and the rings on the grips until each is used
        { const e2 = (A.phase === 'carry' || A.phase === 'hook') && A.cur ? ropeEnd() : null; if (e2) { guide.show(true); guide.set(e2, tagHand(), A.grip === 'rope' ? 0.1 : 0.5); } else guide.show(false);
          const P2 = []; if (A.phase === 'carry' && A.cur) { const h = tagHand(); if (A.cur.L === 6 || lv >= 3) P2.push([(h.x + e2.x) / 2, (h.y + e2.y) / 2, (h.z + e2.z) / 2, 0.9, 'rope']); P2.push([A.cur.m.position.x, A.cur.m.position.y + H, A.cur.m.position.z, 1.3, 'stone']); }
          rings.forEach((m2, i) => { const r = P2[i]; m2.visible = !!r && !A.said['g' + r[4]] && A.grip !== r[4]; if (!m2.visible) return; m2.position.set(r[0], r[1], r[2]); m2.quaternion.copy(X.camera.quaternion); m2.scale.setScalar(r[3] * (1 + 0.08 * Math.sin(A.t * 4 + i))); }); }
        // a still finger on the stone for 0.3 s: it comes down while held
        if (A.pend && A.phase === 'carry' && A.grip === 'stone' && A.t - A.pend.t > 0.3 && !A.pend.moved) A.grip = 'hold';
        C.frame(ropeRun);
        try { SH2.crew.setRole(wheelMan, Math.abs(ropeRun) > 1e-3 ? 'push' : 'hold', { fx: baseP.x, fz: baseP.z }); } catch (e) { /* */ }
        // the camera: the one shot; a little nearer while a stone comes down
        if (A.phase === 'carry' && s && A.drop > 0.2) { const k = 0.15; X.track([lerp(CP.x, s.m.position.x, k), lerp(CP.y, s.m.position.y, k), lerp(CP.z, s.m.position.z, k)], [lerp(CT.x, s.m.position.x, k * 2), lerp(CT.y, s.m.position.y, k * 2), lerp(CT.z, s.m.position.z, k * 2)], 1.2); }
      },
      wants(p) { return (A.phase === 'carry' && !!gripOf(p)) || (A.phase === 'choose' && !!(pickStock(p) || pickLaid(p))); },
      down(p) {
        A.pend = { x: p.x, y: p.y, t: A.t, moved: false, ph: A.phase };
        if (A.phase === 'carry') {
          A.grip = gripOf(p); A.rx = p.x; X.hand(null);
          if (A.grip) { X.play('rope'); A.said['g' + A.grip] = true; }
          if (A.grip === 'jib' || A.grip === 'stone') { const s = A.cur.m.position; A.jg = { y: s.y, g0: onPlane(X, p.x, p.y, s.y), a0: { ...A.aimP } }; }
        }
      },
      move(p) {
        if (!A.pend) return;
        if (Math.hypot(p.x - A.pend.x, p.y - A.pend.y) > 10) A.pend.moved = true;
        if (A.phase !== 'carry') return;
        if ((A.grip === 'jib' || (A.grip === 'stone' && A.pend.moved)) && A.jg && A.jg.g0) {
          const q = onPlane(X, p.x, p.y, A.jg.y); if (q) { const x = A.jg.a0.x + (q.x - A.jg.g0.x), z = A.jg.a0.z + (q.z - A.jg.g0.z); if (Math.hypot(x - C.base.x, z - C.base.z) < C.J * 0.96) A.aimP = { x, z }; }
        } else if (A.grip === 'rope') { A.rotT += (p.x - A.rx) * 0.011; A.rx = p.x; }
      },
      up(p) {
        const P0 = A.pend; A.pend = null; A.grip = null; A.jg = null;
        // (a tap is a touch that began while choosing: the finger that lowered a stone lifts off it after it lands, and must not take it up)
        if (A.phase === 'choose' && P0 && P0.ph === 'choose' && Math.hypot(p.x - P0.x, p.y - P0.y) < 14) {
          const s = pickStock(p); if (s) { hookTo(s); return; }
          const q = pickLaid(p); if (q) hookTo(q.s, q);
        }
      },
      cancel() { A.pend = null; A.grip = null; A.jg = null; },
      end() {
        for (const l of legs) l.dispose(); guide.dispose(); C.dispose();
        for (const w of crew) SH2.crew.remove(w);
        for (const s of stock) if (s.laid) { const i = objs.indexOf(s.m); if (i >= 0) objs.splice(i, 1); }
        for (const o of objs) PR.remove(o);
        X.kohen(true);
      },
      at() { return F.at(P.G / 2, 0, H + 1); },
      dbg() {
        const r2 = (o) => [Math.round(o.x), Math.round(o.y)], sc = (p) => r2(X.scr(p.x, p.y, p.z));
        // the bot's aim: the next stone of the solution not yet laid
        const want = []; P.sol.forEach((row, ri) => { for (const [a, L] of row) want.push({ a, L, row: ri === 0 ? 0 : 2 }); }); if (P.head != null) want.push({ a: P.head, L: 6, row: 'h' });
        if (Array.isArray(globalThis.__BOND_PLAN)) { want.length = 0; want.push(...globalThis.__BOND_PLAN); }   // (tests: a wrong layout on purpose)
        const nx = want.find((w) => !A.stones.some((q) => q.a === w.a && q.L === w.L && q.row === w.row));
        let next = null;
        if (nx) { const w = nx.row === 'h' ? 2 : nx.L, p = F.at(nx.a + w / 2, nx.row === 'h' ? 0 : rowOff(nx.row), H / 2); next = { ...nx, hdr: nx.row === 'h', scr: sc(p), id: (stock.find((s) => !s.laid && !s.gone && s.L === nx.L && s !== A.cur) || {}).id || null }; }
        const out = { phase: A.phase, lv, G: P.G, open: P.open, stock: stock.map((s) => ({ id: s.id, L: s.L, scr: sc(s.m.position), home: sc(s.home), used: !!s.laid || s === A.cur })), laid: A.stones.map((q) => ({ row: q.row, a: q.a, L: q.L, scr: sc(q.s.m.position), sol: want.some((w) => w.a === q.a && w.L === q.L && w.row === q.row) })), below: [[...P.below[0]], [...P.below[1]]], cam: { want: +dCam.toFixed(1), now: +X.camera.position.distanceTo(new T.Vector3(CT.x, CT.y, CT.z)).toFixed(1), tot: +tot.toFixed(1), CT, n: [F.nx, F.nz], u: [F.ux, F.uz], topY, bedY, g0: g(CT.x, CT.z), gS: stock[0].home.y - H / 2 }, held: A.cur ? { id: A.cur.id, L: A.cur.L } : null, next, lifts: A.lifts, cracks: A.cracks, canFinish: canFinish(P, laidList()), tol: +(TOLR * 180 / Math.PI).toFixed(1) };
        if (A.cur && A.phase === 'carry') {
          const s = A.cur; C.tipWorld(tip); const e2 = ropeEnd(), h = tagHand(), a = X.scr(h.x, h.y, h.z), b = X.scr(e2.x, e2.y, e2.z);
          const want0 = next && next.hdr ? ACROSS : ALONG;
          Object.assign(out, { stoneScr: sc(s.m.position), jibScr: sc(tip), ropeScr: [Math.round(a.x * 0.5 + b.x * 0.5), Math.round(a.y * 0.5 + b.y * 0.5)], rotTE: +(turnErr(A.rotT - F.yaw, want0) * 180 / Math.PI).toFixed(1), rotE: +(turnErr(s.m.rotation.y - F.yaw, want0) * 180 / Math.PI).toFixed(1), lag: +Math.hypot(tip.x - A.aimP.x, tip.z - A.aimP.z).toFixed(2), drop: +A.drop.toFixed(2), gapB: +(s.m.position.y - H / 2 - bedY).toFixed(2), sway: +Math.hypot(A.sway.x, A.sway.z).toFixed(2) });
          const L0 = landing(s.m.position.x, s.m.position.z); out.land = L0 ? { a: L0.a, row: L0.row, why: L0.why || '', off: !!L0.off } : null;
          if (next) { const w = next.hdr ? 2 : next.L, p = F.at(next.a + w / 2, next.hdr ? 0 : rowOff(next.row), 0); out.tgtScr = sc({ x: p.x, y: s.m.position.y, z: p.z }); }
        }
        return out;
      },
    };
  },
};
