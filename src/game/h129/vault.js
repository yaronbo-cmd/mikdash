/* ── build 129 ── h129/vault.js — station 3, the arches (brief §6): the instruments chambers' two small arches (vaultN, vaultS) seen
 * from inside each chamber against the day, and Beit HaMoked's great vault (vaultM: its first ring, from the hall). Two parts:
 *   A  the legs: while the crew lays the weight stones on the shoulders one by one, each thumb holds a leg of the arch against its thrust
 *      (a press on the leg's grip, pushed inward; the leg pushes the grip back under the finger, so he presses again). Too little: the leg
 *      runs out, the crown sinks; too much: the crown lifts — a joint opens (past the limit for good: vault.crack). When the weights are
 *      all on, a slow letting go is the perfect release ("מחזיק!"). vaultS's south leg stands on the rock (one thumb); vaultM's thrust
 *      three times as great. With a mouse the crew's prop holds the right leg (the model's opt.mouse).
 *   B  the wedges: the centering comes down by drawing its wedges out, a short drag each (a loaded one creaks and moves less; pulled too
 *      far at once it jumps). Uneven, light shows between the stones (cure: push the wedge back, or tap that side's shoulder: one more
 *      weight); further a crack stays (vault.crack); further still a stone slips and falls (vault.stone: −20, in the great vault −40), the
 *      crew lays a replacement of another shade. "יצא!" for a wedge out with no light; "עומדת!" when the arch stands.
 * Under the small arches a Levite plays the nevel when it stands (the chambers of the instruments: illustration).
 * The model: model.js (legFresh, legStep, thrustOf, wedgeFresh, wedgeStep, wedgeLoads, joints, shoulder, vaultPts). Places: BOOK.s07.
 */
import { VAULT_LV, LEG, WEDGE, QUICK, LOSS, legFresh, legStep, thrustOf, wedgeFresh, wedgeStep, wedgeLoads, joints, shoulder, vaultPts, qOf, starsOf, lossPts } from './model.js';
import { SH7, mats7, box, crackLine, fallen, ringGeos, ringCentering, own, setBusy } from './world.js';
import { createVoices } from './sound129.js';
import { fingers, MOUSE } from '../h113/acts.js';
import { gripR } from '../h109/grips.js';
import { BOOK } from '../world/grid.js';

const S7 = BOOK.s07, VB = S7.vault, CAM = S7.cam;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const kOf = (m) => (m && m.id === 'vaultS' ? 'S' : m && m.id === 'vaultM' ? 'M' : 'N');

/** the geometry of a work: the arch's plane (x of its inner face), its centre (z, y), radii, the stones; the grips' world points */
function geomOf(k) {
  if (k === 'M') {
    const A = VB.M, xF = A.east - A.ringD;
    return { k, big: true, xF, zc: A.axisZ, sp: A.spring, r0: A.R, r1: A.R + 1, n: A.stones, floor: A.floor, side: 1 };
  }
  const A = VB[k];
  return { k, big: false, xF: 7, zc: A.at[1], sp: A.spring, r0: A.crown - A.spring, r1: A.crown - A.spring + 1, n: A.stones, floor: A.floor, side: -1 };
}

export const VAULT = {
  icon: '🌉', title: 'הקשתות',
  walkLine: (m) => (kOf(m) === 'M' ? 'בית המוקד: הטבעת הראשונה של הקמרון' : kOf(m) === 'S' ? 'לשכת כלי השיר הדרומית: הקשת' : 'לשכת כלי השיר הצפונית: הקשת'),
  stand(m) { const k = kOf(m), s = k === 'M' ? VB.deck.stand : k === 'S' ? VB.standS : VB.standN; return { x: s[0], z: s[1], face: [s[0] + 4, s[1]] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, Mo = X.M, st = Mo.st, V = createVoices(X.sfx), MT = mats7(X), AC = X.actors ? X.actors() : null;
    const k = kOf(m), G = geomOf(k), L = VAULT_LV[m.id];
    const A = { phase: 'intro', t: 0, ev: [], fing: {}, wd: null, stoneFell: 0 };
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
    own('v' + k, 1); setBusy(X, 1); X.kohen(false);
    const cam0 = X.camera, fov0 = cam0.fov, lens = (f) => { try { cam0.fov = f; cam0.updateProjectionMatrix(); } catch (e) { /* */ } };
    const root = new T.Group(); root.name = 'h129-vault-act'; X.props.root.add(root);
    // ── the arch's stones (the small arch's face x 7 … 8; the great vault's ring 1) and the centering under it
    const arch = new T.Group(); root.add(arch);
    const stoneGeos = G.big ? ringGeos(X, 1) : (() => {
      const out = [], gap = 0.03;
      for (let i = 0; i < G.n; i++) {
        const a0 = Math.PI - (i / G.n) * Math.PI - gap / G.r0, a1 = Math.PI - ((i + 1) / G.n) * Math.PI + gap / G.r0, sh = new T.Shape(), N = 4;
        for (let j = 0; j <= N; j++) { const a = a0 + ((a1 - a0) * j) / N, p = [-(G.zc + G.r1 * Math.cos(a)), G.sp + G.r1 * Math.sin(a)]; if (j) sh.lineTo(...p); else sh.moveTo(...p); }
        for (let j = N; j >= 0; j--) { const a = a0 + ((a1 - a0) * j) / N; sh.lineTo(-(G.zc + G.r0 * Math.cos(a)), G.sp + G.r0 * Math.sin(a)); }
        const g = new T.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: false, curveSegments: 1 }); g.rotateY(Math.PI / 2); g.translate(7, 0, 0); out.push(g);
      }
      return out;
    })();
    const SM = stoneGeos.map((g) => { const s = new T.Mesh(g, MT.h7stone); s.castShadow = s.receiveShadow = true; arch.add(s); return s; });
    const cen = new T.Group(); root.add(cen);
    if (G.big) ringCentering(X, 1, cen);
    else {
      const sh = new T.Shape(), r0 = G.r0; sh.moveTo(-r0, 0); sh.absarc(0, 0, r0 - 0.04, Math.PI, 0, true); sh.lineTo(r0, -0.35); sh.lineTo(-r0, -0.35); sh.lineTo(-r0, 0);
      const ge = new T.ExtrudeGeometry(sh, { depth: 0.8, bevelEnabled: false, curveSegments: 18 }); ge.rotateY(Math.PI / 2);
      const c = new T.Mesh(ge, MT.h7timber); c.position.set(VB[k].at[0] - 0.9, G.sp, G.zc); c.castShadow = true; cen.add(c);
      for (const s of [-1, 1]) box(X, MT.h7timberD, 7.2, G.floor, G.zc + s * (r0 - 0.6) - 0.15, 7.8, G.sp - 0.75, G.zc + s * (r0 - 0.6) + 0.15, root);
    }
    // ── the wedges: pair i's left (−z, the screen's left from inside / from the hall) and right; their grips gold while free
    const goldM = new T.MeshBasicMaterial({ color: 0xFFD86A }), lightM = new T.MeshBasicMaterial({ color: 0xFFF6D0, side: T.DoubleSide });
    const wedgeHome = (i, side) => {
      const sg = side === 'L' ? -1 : 1;
      if (G.big) return [G.xF - 0.2, VB.deck.y + 0.35, G.zc + sg * G.r0 * (0.18 + 0.17 * i)];
      return [G.xF - 0.1, G.sp - 0.55, G.zc + sg * (G.r0 - 0.6 - 0.45 * i)];
    };
    const W = {};
    for (let i = 0; i < L.pairs; i++) for (const side of ['L', 'R']) {
      const g = new T.Group(), sz = G.big ? 1.1 : 0.5, h = new T.Mesh(X.props.geo.box, MT.h7timberD); h.scale.set(sz * 1.4, sz * 0.5, sz); g.add(h);
      const tag = new T.Mesh(new T.CircleGeometry(sz * 0.32, 14), goldM); tag.position.set(-sz * 0.71, 0, 0); tag.rotation.y = -Math.PI / 2; g.add(tag);
      const p = wedgeHome(i, side); g.position.set(...p); root.add(g); W[i + side] = { g, tag, p };
    }
    // ── the grips: each leg's (on the jamb under the springing, inside), each shoulder's (on the haunch)
    const legPt = (side) => { const sg = side === 'L' ? -1 : 1; return G.big ? [G.xF - 0.3, G.sp - 1.5, G.zc + sg * (G.r0 + 0.5)] : [6.9, G.sp - 1.2, G.zc + sg * (G.r0 + 0.5)]; };
    const shoulderPt = (side) => { const sg = side === 'L' ? -1 : 1, a = Math.PI / 2 + (-sg) * 0.95, r = (G.r0 + G.r1) / 2; return [G.big ? G.xF - 0.1 : 6.95, G.sp + r * Math.sin(a), G.zc + r * Math.cos(a)]; };
    const scr = (p) => { const r = X.scr(p[0], p[1], p[2]); return [Math.round(r.x), Math.round(r.y)]; };
    const unitPx = () => 0.15 * innerHeight;   // (a press of one thrust: this far inward on the screen)
    const inward = (side) => { const a = scr(legPt(side)), b = scr([legPt(side)[0], legPt(side)[1], G.zc]), d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / d, (b[1] - a[1]) / d]; };
    // (gold hand plates on the legs' grips; a ring on each shoulder in part B)
    const plates = {};
    for (const side of ['L', 'R']) {
      if (VAULT_LV[m.id].rock === side) continue;
      const p = legPt(side), sz = G.big ? 1.6 : 0.6, pl = new T.Mesh(new T.CircleGeometry(sz, 18), goldM); pl.position.set(p[0] - 0.02, p[1], p[2]); pl.rotation.y = -Math.PI / 2; root.add(pl); plates[side] = pl;
    }
    // ── the weight stones the crew lays (by the shoulders, inside), the crew: a mason at each side (on the floor; on the deck in the hall)
    const crew = [];
    const crewAdd = (x, z, o) => { if (!SH7.crew) return null; const w = SH7.crew.add(x, z, o); if (w) crew.push(w); return w; };
    if (G.big) for (const sg of [-1, 1]) crewAdd(G.xF + 1.2, G.zc + sg * G.r0 * 0.62, { role: 'hammer', item: 'mallet', fx: G.xF + 1.2, fz: G.zc + sg * G.r0, crew: 3 });
    else for (const sg of [-1, 1]) crewAdd(4.6, G.zc + sg * 4.3, { role: 'hammer', item: 'mallet', fx: 6.9, fz: G.zc + sg * 4.3, crew: 2 });
    if (crew.length) for (const w of crew) { if (w.a) { w.a.fixedY = G.big ? VB.deck.y : undefined; } }
    let prop = null;
    if (MOUSE && !VAULT_LV[m.id].rock) { const p = legPt('R'); prop = crewAdd(p[0] - 1.6, p[2] - 0.2, { role: 'push', item: 'staff', fx: p[0], fz: p[2], crew: 2 }); if (prop && prop.a && G.big) prop.a.fixedY = VB.deck.y; }
    const weights = { L: 0, R: 0 };
    const weightMesh = (side) => {
      const sg = side === 'L' ? -1 : 1, n = weights[side]++, s = G.big ? 1.2 : 0.42;
      const z = G.zc + sg * (G.r1 + 0.2 + (n % 3) * s * 1.05), y = G.sp + 0.3 + Math.floor(n / 3) * s * 1.02 + (G.big ? 2 : 0.6);
      const b = box(X, n % 2 ? MT.h7stone : MT.h7shade, G.xF - (G.big ? 1.4 : 0.55), y, z - s / 2, G.xF - 0.05, y + s, z + s / 2, root); return b;
    };
    // ── the light through an open joint (from inside, the day through it), the cracks, a fallen stone
    const lights = [];
    const jointAt = (i, s) => { const a = Math.PI / 2 - s * (0.32 + 0.22 * i); return a; };
    function lightSet(list) {
      for (const l of lights.splice(0)) root.remove(l);
      list.forEach((j, i) => {
        if (j.see !== 'light') return;
        const a = jointAt(i, Math.sign(j.imb) || 1), r0 = G.r0, r1 = G.r1, w = G.big ? 0.22 : 0.08, len = r1 - r0;
        const q = new T.Mesh(new T.PlaneGeometry(w, len), lightM); q.rotation.y = -Math.PI / 2; q.rotation.x = -(Math.PI / 2 - a);
        q.position.set((G.big ? G.xF : 7) - 0.03, G.sp + ((r0 + r1) / 2) * Math.sin(a), G.zc - ((r0 + r1) / 2) * Math.cos(a)); root.add(q); lights.push(q);
      });
    }
    const crownAt = () => ({ x: (G.big ? G.xF : 7) - 0.1, y: G.sp + G.r1 + 0.2, z: G.zc });
    function damage(f, i, side) {
      const p = Mo.mark(f, m.id, null, i | 0), at = crownAt();
      if (f === 'vault.crack') { const a = jointAt(i | 0, side === 'L' ? 1 : -1); crackLine(X, (G.big ? G.xF : 7) - 0.05, G.sp + G.r0 * Math.sin(a), G.zc - G.r0 * Math.cos(a), root, G.big); V.crack(); X.shake(0.15, 0.25); }
      else {
        const j = clamp(Math.floor((jointAt(i | 0, side === 'L' ? 1 : -1) / Math.PI) * G.n), 0, G.n - 1), s = SM[j];
        if (s) { s.visible = false; V.thud(); X.shake(0.25, 0.4); fallen(X, (G.big ? G.xF : 7) - 1.5, G.big ? VB.deck.y : G.floor, G.zc + (j < G.n / 2 ? -1 : 1) * 1.2, root, 1); setTimeout(() => { try { s.material = MT.h7shade; s.visible = true; V.knock(1.4); } catch (e) { /* */ } }, 1600); }
        A.stoneFell++;
      }
      X.loss(lossPts(f, m.id) || p, at, LOSS[f][0]); ev('loss:' + f); X.save();
    }
    // ── the legs' gauges (DOM, by each grip): the band that holds, the thrust, the press
    const gauges = {};
    function gaugeMount() {
      for (const side of ['L', 'R']) {
        if (VAULT_LV[m.id].rock === side || (MOUSE && side === 'R')) continue;
        const el = document.createElement('div'); el.className = 'h109-ui h129-gauge';
        el.style.cssText = 'position:fixed;width:22px;height:130px;border-radius:11px;background:rgba(30,20,10,.55);border:2px solid rgba(255,240,200,.9);z-index:60;pointer-events:none;transform:translate(-50%,-50%)';
        el.innerHTML = '<i style="position:absolute;left:2px;right:2px;background:rgba(143,224,122,.85);border-radius:4px"></i><b style="position:absolute;left:-6px;right:-6px;height:4px;background:#FFD86A"></b><u style="position:absolute;left:-3px;right:-3px;height:6px;background:#fff;border-radius:3px;box-shadow:0 0 4px #000"></u>';
        document.body.appendChild(el); gauges[side] = el;
      }
    }
    function gaugeSync(S) {
      const H = 130, yOf = (v) => H - 4 - (clamp(v, 0, LEG.PMAX) / LEG.PMAX) * (H - 8);
      for (const side of Object.keys(gauges)) {
        const el = gauges[side], g = S[side], Tn = thrustOf(S, side) / L.T0, p = scr(legPt(side));
        el.style.left = clamp(p[0] + (side === 'L' ? -70 : 70), 24, innerWidth - 24) + 'px'; const gy = 0.15 * innerHeight; el.style.top = clamp(p[1] - gy / 2, gy, innerHeight - gy) + 'px';
        const lo = yOf(Tn + LEG.LIFT), hi = yOf(Math.max(0, Tn - LEG.RUN)); const i = el.children[0]; i.style.top = lo + 'px'; i.style.height = Math.max(4, hi - lo) + 'px';
        el.children[1].style.top = yOf(Tn) - 2 + 'px'; el.children[2].style.top = yOf(g.p) - 3 + 'px';
        el.style.borderColor = g.net > LEG.RUN || g.net < -LEG.LIFT ? '#FF7A5A' : 'rgba(255,240,200,.9)';
      }
    }
    const gaugeOff = () => { for (const el of Object.values(gauges)) el.remove(); for (const k2 of Object.keys(gauges)) delete gauges[k2]; };
    // ── part A
    let SA = null, SB = null;
    const press = { L: null, R: null };
    // (rule 66 asks a two-thumb act to lift the camera itself a little: here the play's camera stands inside a closed room — the chamber,
    //  the hall — and the look's lift pulls it back through the wall behind; the grips are set low and apart in the frame instead)
    const lift = (u) => { void u; };
    const legs = () => ['L', 'R'].filter((q) => VAULT_LV[m.id].rock !== q && !(MOUSE && q === 'R'));
    function partA() {
      SA = legFresh(m.id); A.phase = 'legs'; gaugeMount();
      if (legs().length === 2) lift(0.22);
      X.line(legs().length === 2 ? 'כל אגודל מחזיק רגל אחת של הקשת: לחצו פנימה על הלוח הזהוב, עד הפס הירוק, ולחצו שוב כשהרגל דוחפת את האצבע · הצוות מניח משקולות על הכתפיים' : VAULT_LV[m.id].rock ? 'הרגל הדרומית עומדת על הסלע: החזיקו את הצפונית · לחצו פנימה על הלוח הזהוב עד הפס הירוק, ושוב כשהרגל דוחפת' : 'החזיקו את הרגל השמאלית (את הימנית מחזיק הצוות במוט): לחצו פנימה על הלוח הזהוב עד הפס הירוק, ושוב כשהרגל דוחפת', 7000);
      X.hand({ x: legPt(legs()[0])[0], y: legPt(legs()[0])[1], z: legPt(legs()[0])[2] }, (legs()[0] === 'L' ? 1 : -1) * gripR() / 3, 0);
    }
    function stepA(dt) {
      const P = {}; for (const q of ['L', 'R']) P[q] = press[q] ? press[q].reach : null;
      legStep(SA, P, dt, { mouse: MOUSE });
      for (const e of SA.ev) {
        ev(e.e + (e.side ? ':' + e.side : ''));
        if (e.e === 'weight') { weightMesh(e.side); V.knock(G.big ? 0.7 : 1.1); }
        if (e.e === 'run') { V.groan(); X.line('הרגל בורחת החוצה והכתר שוקע: לחצו פנימה חזק יותר', 2600); }
        if (e.e === 'lift') { V.groan(); X.line('לחצתם חזק מדי: הכתר מתרומם ומפר נפתח · הרפו מעט', 2600); }
        if (e.e === 'loss') damage('vault.crack', 0, e.side);
        if (e.e === 'holds') { X.quick(crownAt(), QUICK.holds, arch); V.thud(); }
      }
      // (the creak follows the worst leg's strain; the plates follow the press)
      let strain = 0; for (const q of ['L', 'R']) { const g = SA[q]; strain = Math.max(strain, Math.abs(g.net) / 0.5); const pl = plates[q]; if (pl) { const sg = q === 'L' ? -1 : 1; pl.position.z = legPt(q)[2] - sg * 0.15 * (G.big ? 3 : 1) * clamp(g.p, 0, 1.4) + sg * g.x; } }
      V.creak(clamp(strain, 0, 1) * 0.8);
      SM.forEach((s) => { s.position.y = -(SA.L.x + SA.R.x) * 0.25; });
      if (!A.relSaid && ['L', 'R'].every((q) => SA[q].rock || thrustOf(SA, q) <= LEG.REL * L.T0 + 1e-9) && SA.laid > 0) { A.relSaid = 1; X.line('כל המשקולות במקומן: הרפו לאט לאט, בלי לעזוב בבת אחת', 4200); }
      gaugeSync(SA);
      if (SA.done) { V.creak(0); gaugeOff(); for (const pl of Object.values(plates)) pl.visible = false; lift(0); for (const q of ['L', 'R']) press[q] = null; A.fing = {}; setTimeout(partB, 900); A.phase = 'between'; }
    }
    // ── part B
    function partB() {
      SB = wedgeFresh(m.id, SA); A.phase = 'wedges';
      X.line('הורידו את הפיגום: משכו כל טריז החוצה בגרירה קצרה, לסירוגין משני הצדדים · אור בין האבנים: החזירו את הטריז או הקישו על הכתף שבצד האור', 7000);
      const w = W['0L']; const hx = -gripR() / 3; X.hand({ x: w.p[0], y: w.p[1], z: w.p[2] }, hx, 0);
      syncB();
    }
    function syncB() {
      const ld = wedgeLoads(SB);
      for (let i = 0; i < L.pairs; i++) for (const side of ['L', 'R']) {
        const w = W[i + side], o = SB.pairs[i][side], sg = side === 'L' ? -1 : 1;
        w.g.position.set(w.p[0], w.p[1], w.p[2] + sg * o * (G.big ? 1.8 : 0.6)); w.tag.visible = ld[i + side] === 'free' && o < 1;
      }
      const J = joints(SB); lightSet(J);
      const avg = SB.pairs.reduce((a, p) => a + p.L + p.R, 0) / (2 * L.pairs); cen.position.y = -avg * (G.big ? 0.5 : 0.25);
    }
    function wedgeUnder(p) {
      let best = null, bd = 1e9;
      for (let i = 0; i < L.pairs; i++) for (const side of ['L', 'R']) { const w = W[i + side], q = X.scr(w.g.position.x, w.g.position.y, w.g.position.z), d = Math.hypot(p.x - q.x, p.y - q.y); if (d < bd) { bd = d; best = { i, side }; } }
      return bd < gripR() * (G.big ? 0.55 : 0.7) ? best : null;
    }
    const shoulderUnder = (p) => { for (const side of ['L', 'R']) { const q = scr(shoulderPt(side)); if (Math.hypot(p.x - q[0], p.y - q[1]) < gripR() * 0.8) return side; } return null; };
    function upB(f) {
      if (f.wedge) {
        const { i, side } = f.wedge, w = W[i + side], q = scr(w.g.position.toArray()), o = scr([w.g.position.x, w.g.position.y, w.g.position.z + (side === 'L' ? -1 : 1)]);
        const ux = o[0] - q[0], uy = o[1] - q[1], ul = Math.hypot(ux, uy) || 1, px = ((f.x - f.x0) * ux + (f.y - f.y0) * uy) / ul;
        if (Math.abs(px) < 8) return;
        const dx = (px / (0.1 * innerHeight)) * WEDGE.STEP;   // (a STEP of its way per a tenth of the screen's height)
        wedgeStep(SB, i, side, dx); eventsB(); return;
      }
      if (f.sh && f.moved < 20) {
        const side = f.sh, sg = side === 'L' ? 1 : -1; let bi = -1, bv = 0;
        SB.pairs.forEach((p, i) => { const imb = p.L - p.R + p.bias; if (Math.sign(imb) === sg && Math.abs(imb) > bv) { bv = Math.abs(imb); bi = i; } });
        if (bi < 0) { X.line('בצד הזה אין אור: אין צורך במשקולת', 1800); return; }
        shoulder(SB, bi, side); weightMesh(side); V.knock(1); eventsB();
      }
    }
    function eventsB() {
      for (const e of SB.ev) {
        ev(e.e + (e.i != null ? ':' + e.i + (e.side || '') : ''));
        if (e.e === 'creak') V.groan();
        if (e.e === 'jump') X.line('טריז עמוס נמשך בבת אחת: הקשת קפצה · טריז שחורק — משיכות קצרות', 3200);
        if (e.e === 'light') { V.dust(); X.line('אור בין האבנים! החזירו את הטריז, או הקישו על הכתף שבצד האור', 3200); }
        if (e.e === 'out') { const w = W[e.i + e.side]; X.quick({ x: w.g.position.x, y: w.g.position.y + 0.3, z: w.g.position.z }, QUICK.out, w.g); V.knock(1.5); }
        if (e.e === 'loss') damage(e.f, e.i, (SB.pairs[e.i].L - SB.pairs[e.i].R + SB.pairs[e.i].bias) >= 0 ? 'L' : 'R');
        if (e.e === 'done') finish();
      }
      syncB();
    }
    // ── the end: the arch stands; under the small arches a Levite plays the nevel (illustration)
    let levi = null;
    async function finish() {
      if (A.phase === 'done') return; A.phase = 'done'; X.hand(null);
      cen.visible = false; for (const w of Object.values(W)) w.g.visible = false; lightSet([]);
      st.vault = st.vault || {}; st.vault[m.id] = { runs: SA.runs, lifts: SA.lifts, lights: SB.lights, jumps: SB.jumps }; X.save();
      const pts = vaultPts(SA, SB), q = qOf(pts);
      X.quick(crownAt(), QUICK.stands, arch); V.thud();
      if (!G.big && AC) { const a = AC.add('levite', 4.4, G.zc + 1.2, { fadeIn: false }); if (a) { a.vis = a.visT = 1; a.gang = 1; AC.setItem(a, 'nevel'); a.yaw = Math.atan2(7 - a.x, G.zc - a.z); levi = a; } await X.wait(0.6); V.harp(k === 'S' ? 330 : 294); setTimeout(() => V.harp(k === 'S' ? 440 : 392), 650); X.line('לוי מנגן בנבל תחת הקשת: היא עומדת (המחשה)', 3000); }
      else X.line('הטבעת הראשונה עומדת · הצוותות יבנו את שאר הטבעות, אחת אחרי השנייה', 3200);
      await X.wait(2.6);
      X.end({ stars: starsOf(q), q, pts, perfect: pts >= 40, flags: { runs: SA.runs, lifts: SA.lifts, lights: SB.lights, jumps: SB.jumps, 'vault.crack': (SA.flags['vault.crack'] ? 1 : 0) + (SB.flags['vault.crack'] || []).length, 'vault.stone': (SB.flags['vault.stone'] || []).length }, at: crownAt() });
    }
    // ── the fingers
    const FG = fingers(X, {
      down(f) {
        if (A.phase === 'legs') {
          const taken = Object.values(A.fing); let best = null, bd = 1e9;
          for (const q of legs()) { if (taken.includes(q)) continue; const s = scr(legPt(q)), d = Math.hypot(f.x - s[0], f.y - s[1]); if (d < bd) { bd = d; best = q; } }
          if (!best || bd > gripR() * 1.2) return;
          A.fing[f.id] = best; f.leg = best; f.dir = inward(best); press[best] = { reach: 0 }; X.hand(null); return;
        }
        if (A.phase === 'wedges') { const w = wedgeUnder(f); if (w) { f.wedge = w; X.hand(null); return; } const s = shoulderUnder(f); if (s) f.sh = s; }
      },
      move(f) { if (f.leg && press[f.leg]) { const d = ((f.x - f.x0) * f.dir[0] + (f.y - f.y0) * f.dir[1]) / unitPx(); press[f.leg].reach = clamp(d, 0, LEG.PMAX + 0.6); } },
      up(f) { if (f.leg) { press[f.leg] = null; delete A.fing[f.id]; return; } if (A.phase === 'wedges') upB(f); },
    });
    const camK = k === 'M' ? CAM.vaultM : CAM['vault' + k];
    return {
      close: true,
      begin() {
        FG.attach(); lens(k === 'M' ? CAM.vaultMFov : CAM.vaultFov); X.shot(camK[0], camK[1], 1.3);
        X.line(k === 'M' ? 'בית המוקד: הטבעת הראשונה של הקמרון הגדול, על הפיגום' : 'הקשת של לשכת כלי השיר, מבפנים: האור של היום מעבר לה', 2600);
        setTimeout(() => { if (A.phase === 'intro') partA(); }, 1500);
      },
      update(dt) {
        A.t += dt;
        try { V.frame(); if (A.phase === 'legs') stepA(dt); } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h129] vault', e && e.message); } }
      },
      down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { A.fing = {}; press.L = press.R = null; },
      // (rule 66: on the right a touch is the act's only on a leg's grip, a wedge or a shoulder)
      wants(p) {
        if (!p) return true;
        if (A.phase === 'legs') return legs().some((q) => { const s = scr(legPt(q)); return Math.hypot(p.x - s[0], p.y - s[1]) < gripR() * 1.2; });
        if (A.phase === 'wedges') return !!wedgeUnder(p) || !!shoulderUnder(p);
        return false;
      },
      holds() { return Object.keys(A.fing).length > 0; },
      end() {
        lift(0); FG.detach(); V.stop(); X.hand(null); gaugeOff(); lens(fov0);
        for (const w of crew) SH7.crew.remove(w);
        if (levi) { try { AC.remove(levi); } catch (e) { /* */ } }
        X.props.remove(root); own('v' + k, 0); setBusy(X, 0);
      },
      at() { const c = crownAt(); return new T.Vector3(c.x, c.y, c.z); },
      dbg() {
        const o = { id: m.id, k, phase: A.phase, mouse: MOUSE, ev: A.ev.slice(-10), nf: FG.n, legs: legs(), unit: Math.round(unitPx()) };
        if (SA) {
          o.A = { t: +SA.t.toFixed(2), laid: SA.laid, runs: SA.runs, lifts: SA.lifts, dmg: SA.dmg, done: SA.done, perfect: SA.perfect };
          for (const q of ['L', 'R']) { const g = SA[q]; o.A[q] = { T: +(thrustOf(SA, q) / L.T0).toFixed(3), g: +g.g.toFixed(3), p: +g.p.toFixed(3), net: +g.net.toFixed(3), x: +g.x.toFixed(3), on: g.on, grip: scr(legPt(q)), dir: inward(q).map((v) => +v.toFixed(3)), rock: g.rock }; }
          o.rel = ['L', 'R'].every((q) => SA[q].rock || thrustOf(SA, q) <= LEG.REL * L.T0 + 1e-9);
        }
        if (SB) {
          const ld = wedgeLoads(SB);
          o.B = { lights: SB.lights, jumps: SB.jumps, dmg: SB.dmg, done: SB.done, pairs: SB.pairs.map((p) => ({ L: +p.L.toFixed(3), R: +p.R.toFixed(3), bias: +p.bias.toFixed(3) })), loads: ld,
            w: Object.fromEntries(Object.entries(W).map(([id, w]) => { const q = scr(w.g.position.toArray()), d = scr([w.g.position.x, w.g.position.y, w.g.position.z + (id[1] === 'L' ? -1 : 1)]); return [(+id[0] + 1) + id[1], { at: q, out: [d[0] - q[0], d[1] - q[1]] }]; })),
            sh: { L: scr(shoulderPt('L')), R: scr(shoulderPt('R')) }, stepPx: Math.round(0.1 * innerHeight) };
        }
        return o;
      },
    };
  },
};
