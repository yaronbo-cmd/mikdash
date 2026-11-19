/* ── build 132 ── h132/sikra.js — work 4 "חוט הסיקרא" (spec docs/specs/shlav-09-he.md, עבודה 4). LANE B's file.
 *
 * Two beats:
 *   measure  the rod with six notches: the left thumb drags it to the corner (its head catches the top edge, it hangs straight); a tap
 *            at its lower end drives the stake — the helper on the wooden ladder leaned at that corner strikes it with a wooden mallet.
 *            Four corners in the walk's order (level 1: the east wall's two). 10 each.
 *   line     two thumbs. The LEFT, relative to where it touched down: right of that point is the walking pace along the wall (0 … 4 amot a
 *            second, measured against the wall; back to the point = stop; never backwards), up and down is the string's height
 *            (±3 tefachim, directly). The worker (the player's figure, a kohen) walks the floor holding the long wooden pole upright;
 *            the colour bow at its head prints the line at y 21. The RIGHT thumb: a tap on the bowl — the helper dips his cloth swab and
 *            wets the string; a tap on a fresh drip — he wipes it with the same swab; anything else of the right thumb is the camera
 *            (a drag lifts it, and it stays). A tap that hits neither does nothing. The left never has to lift.
 *            Mouse: the left button is the left thumb; a right-button drag is the camera; a short right click on the bowl or a fresh
 *            drip is the tap (the cursor away from the left's place — on its way to the bowl — holds the left's pace and height).
 * The rules are sikra-model.js; the things sikra3d.js; every place BOOK.s09. No explanatory text: a hand hint in the free trial only.
 */
import { BOOK } from '../world/grid.js';
import { LOSS, WORDS } from './model.js';
import * as K from './sikra-model.js';
import * as V3 from './sikra3d.js';
import { createGang, createBeat, clamp, lerp, ease } from '../h109/kit.js';
import { MOUSE } from '../h113/acts.js';

const S9 = BOOK.s09, K9 = S9.sikra, F = S9.floor, LY = S9.lineY, TOP = S9.top, SK = K.SK;

/** the act's numbers (לכיוונון: the drag's pixels for each range are calibrated apart for a phone and a tablet — spec "כמה פיקסלים") */
export const SKA = Object.freeze({
  PX_PACE: Object.freeze({ phone: 110, tab: 160 }),   // px right of the touch-down point for the full pace (4 amot a second)
  PX_H: Object.freeze({ phone: 80, tab: 120 }),       // px up (or down) for three tefachim
  DEAD: 8,                                            // px: within this of the point is a stop
  MOUSE_BOX: 260,                                     // px: the cursor farther than this from the left's point holds the left's values
  ROD_PX: 90, END_PX: 64,                             // measuring: the rod's drag start (any left drag moves it) and its lower end's tap
  LOOK_GAIN: 1.8, LOOK_MAX: 0.45,                     // the right thumb's lift (the director's look: X.lookLift)
  KEEP_S: 2,                                          // s between two keeps of the open line in the save
  POP_DY: -1.9,                                       // the line's popups this far under the line (the juice lifts them 1.6): at the bow, never on the HUD
  LOSS_DY: 1.2,                                       // a loss's words this far over the line (over the block's top edge: above the line, never on the men below it)
  LOSS_GAP: 1.3,                                      // s between two loss words: one at a time, the next waits its turn
  CALM: 3,                                            // s after a loss with no reward word, gold or glare (a loss is never paid): longer than a loss's words stay (2.6 s)
  RW_WAIT: 0.9,                                       // s a reward waits before it shows: a loss in that time drops it (a lift's seam just after a gold stretch)
  DRIP_HOLD: 1.4, DRIP_LEAD: 2,                       // s the camera holds on a lost drip; amot ahead of a fresh drip the camera's point stays
});
const isPhone = () => Math.min(innerWidth, innerHeight) < 700;

export const SIKRA_ACT = {
  icon: '🧵',
  title: 'חוט הסיקרא',
  walkLine: () => 'חוט הסיקרא: מודדים, ואז מקיפים את הגוש',
  stand() { const s = S9.stand.w4; return { x: s[0], z: s[1], face: [K9.bowl[0], K9.bowl[1]] }; },
  prepare() {},
  make(m, X) { return makeSikra(m, X); },
};

function makeSikra(m, X) {
  const T = X.THREE, Mo = X.M, lv = m.lv | 0 || 2;
  const root = new T.Group(); root.name = 'h132-sikra-act'; X.props.root.add(root);
  V3.smats(X);
  const VO = V3.voices(X.sfx);
  const gang = createGang(X), BT = createBeat(X);
  const west = Mo.westSlots ? Mo.westSlots() : [];
  // (a reload resumes: the measuring's stakes, or the line where it was)
  // (a level per visit: only this level's own unfinished act resumes — another level's, or a finished one, starts clean from the pre-state)
  const blob0 = Mo.workOf('sikra'), blob = blob0 && blob0.lv === lv && !blob0.done ? blob0 : null;
  const Ms = blob && blob.Ms ? blob.Ms : K.measureFresh(lv);
  let L = null, track = { hs: [], ws: [], cuts: [] };
  if (blob && blob.line) { const r = K.lineLoad(blob.line); if (r) { L = r.L; track = { ...r.track, cuts: (blob.cuts || []).slice() }; } }
  const A = { t: 0, ev: [], phase: L ? 'line' : 'measure', busy: 0, done: 0, keepT: 0, k: null, rod: { u: 0, hung: false }, mode: null, leftDown: false, org: null, lp: null, held: null, r2: null, look: 0, cutTo: -1, si: 0, ti: 0, last: '', lossT: -9, lossNext: 0, camHold: null };
  const ev = (e) => { A.ev.push(e); if (A.ev.length > 18) A.ev.shift(); };
  const keep = () => { Mo.keep('sikra', { lv, done: !!A.done, Ms, line: L ? K.lineSave(L, null) : null, cuts: track.cuts }); X.save(); };
  if (!blob) { try { Mo.st.sikra.line = null; } catch (e) { /* */ } }   // (played again: the old line goes with its flaws — workSeed)
  V3.SK3.act = true; V3.SK3.key = '';

  /* ── the things ── */
  const rod = V3.makeRod(X); root.add(rod);
  const ladder = V3.makeLadder(X); root.add(ladder);
  const stakes = {};
  const lineG = new T.Group(); root.add(lineG);
  const R = V3.makeRibbon(X, lineG, K.lineEnd(lv) + SK.CLOSE_OVER + 1);
  const MK = V3.makeMarks(X, lineG);
  const dots = V3.makeDots(X, lineG, lv);
  const pole = V3.makePole(X); root.add(pole.g); pole.g.visible = false;
  const bowl = V3.makeBowl(X); root.add(bowl); bowl.visible = false;
  const swab = V3.makeSwab(X); root.add(swab.g); swab.g.visible = false;
  const flash = new T.Mesh(new T.SphereGeometry(0.9, 10, 8), V3.smats(X).flash); flash.visible = false; root.add(flash);
  // the west wall's flaws: rough patches on the face at the line's height (the world's marks are on the block; these are where the
  // string meets them)
  const flawsOn = lv === 1 ? [] : K.flawsOn(west); for (const f of flawsOn) MK.rough(f.s0, f.s1);
  const drips = new Map();   // id → mesh

  /* ── the men: the helper (measuring: on the ladder with the mallet; the line: ahead with the bowl and the swab rod), the worker ── */
  let helper = null, worker = null;
  const helperAdd = (x, z, o) => { if (helper) gang.remove(helper); helper = gang.add(x, z, { role: 'hold', crew: 1, ...o }); if (helper) { helper.a.vis = 1; helper.a.fixedY = o.y != null ? o.y : F; } return helper; };

  /* ───────── the measuring ───────── */
  const diag = (k) => { const [cx, cz] = S9.corner[k], d = [Math.sign(cx - S9.mid[0]), Math.sign(cz - S9.mid[1])]; return d; };
  const W3 = (p) => ({ x: p[0], y: p[1], z: p[2] });
  function rodEnds(k) {
    const [cx, cz] = S9.corner[k], d = diag(k), L0 = rod.userData.L;
    const start = k === 'SE' ? [K9.rod[0], K9.rodY + L0 + 0.05, K9.rod[1]] : [cx + d[0] * 2.4, F + L0 + 0.05, cz + d[1] * 1.2];
    const hang = [cx + d[0] * 0.09, TOP + 0.02, cz + d[1] * 0.09];
    return { start, hang };
  }
  function rodPlace() {
    const E = rodEnds(A.k), u = ease(A.rod.u), p = [lerp(E.start[0], E.hang[0], u), lerp(E.start[1], E.hang[1], u) + Math.sin(u * Math.PI) * 1.2, lerp(E.start[2], E.hang[2], u)];
    rod.position.set(p[0], p[1], p[2]); rod.visible = true;
  }
  const rodLow = () => [rod.position.x, rod.position.y - rod.userData.L, rod.position.z];
  function putStake(k) {
    const [cx, cz] = S9.corner[k], d = diag(k), s = V3.makeStake(X); s.position.set(cx + d[0] * 0.15, LY, cz + d[1] * 0.15); s.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(d[0], 0, d[1]).normalize()); root.add(s); return s;   // (driven into the corner, its head out along the corner's diagonal)
  }
  function ladderAt(k) {
    // (leaned on one face beside the corner — the book's sikra:ladder, the face the corner's shot sees him clear of the rod on: on the
    //  diagonal he stood before the corner and the figures gate took him out)
    const [cx, cz] = S9.corner[k], d = diag(k), xf = V3.VK.LAD_FACE[k] === 'x', n = xf ? [d[0], 0] : [0, d[1]];   // (n: the face's outward side, the helper on the rungs' outer side)
    const LB = K9.ladder[k];   // (the book's: sikra:ladder)
    const foot = LB.foot.slice(), fy = V3.footY(X, foot[0], foot[1]), head = LB.head.slice();
    V3.leanLadder(ladder, foot[0], foot[1], head[0], head[1], head[2], fy); ladder.visible = true;
    // (the helper on a rung, his feet two amot over the ladder's foot, on its outer side; the wooden mallet in his hand, toward the stake)
    const hY = fy + 2, u = (hY - fy) / (head[1] - fy), hx = foot[0] + (head[0] - foot[0]) * u + n[0] * 0.35, hz = foot[1] + (head[2] - foot[1]) * u + n[1] * 0.35;
    const w = helperAdd(hx, hz, { item: 'mallet', fx: cx, fz: cz, y: hY }); if (w) { w.a.yaw = Math.atan2(cx - hx, cz - hz); }
  }
  function cornerOn(k, first) {
    A.k = k; A.rod.u = 0; A.rod.hung = false; A.busy = 0;
    const [e, a] = V3.measureShot(k); A.pose = [e, a]; X.shot(e, a, first ? 1.4 : 1.1);
    ladderAt(k); rodPlace(); ev('corner:' + k);
    if (first && !Ms.done.length) setTimeout(() => { if (A.phase === 'measure' && !A.rod.hung && !A.ended) X.hand(W3(rod.position.toArray()), 0, 14); }, 1500);
  }
  function stakeTap() {
    const k = A.k, r = K.measureTap(Ms, k); if (!r.ok) return;
    A.busy = 1; X.hand(null); ev('stake:' + k);
    if (helper) gang.setRole(helper, 'hammer', { item: 'mallet' });
    setTimeout(() => {
      if (A.ended) return;
      VO.knock(); X.shake(0.08, 0.15); stakes[k] = putStake(k);
      const at = W3(rodLow()); X.hit(at, 'ok', { text: '+10' }); X.dust(at.x, at.y, at.z, 4, 1.2);
      if (helper) gang.setRole(helper, 'hold', { item: 'mallet' });
      keep();
      setTimeout(() => { if (A.ended) return; if (r.last) lineOn(true); else cornerOn(K.measureNext(Ms), false); }, 900);
    }, 380);
  }

  /* ───────── the line ───────── */
  const wetC = { dark: '#4A0806', red: '#D2301F', pink: '#F0B3B0' };
  function lineOn(fresh) {
    A.phase = 'line'; A.busy = 0; X.hand(null);
    if (!L) L = K.lineFresh(lv, west);
    rod.visible = false; ladder.visible = false;
    for (const k of Object.keys(stakes)) stakes[k].visible = true;
    // the worker (the player's figure, a kohen) with the pole; the helper ahead with the bowl and the swab rod
    if (helper) { gang.remove(helper); helper = null; }
    const w0 = V3.walkerAt(L.s, lv);
    worker = gang.add(w0.x, w0.z, { variant: 'kohen', role: 'hold', crew: 0 }); if (worker) { worker.a.vis = 1; worker.a.fixedY = V3.footY(X, w0.x, w0.z); }
    const h0 = V3.helperAt(L.s, lv);
    helperAdd(h0.x, h0.z, { y: V3.footY(X, h0.x, h0.z) });
    pole.g.visible = bowl.visible = swab.g.visible = true;
    // (the line printed so far, after a reload)
    if (!fresh && track.hs.length) { for (let i = 0; i * SK.SAMPLE <= L.s; i++) { const s = i * SK.SAMPLE, j = Math.min(track.hs.length - 1, Math.floor(s / 0.5)); R.set(i, s, (track.hs[j] || 0) / 100, { d: 'dark', r: 'red', p: 'pink' }[track.ws[j]] || 'red'); } for (const [a, b] of track.cuts) R.cut(a, b); R.flush(); A.si = Math.floor(L.s / SK.SAMPLE) + 1; A.ti = track.hs.length; for (const mk of L.marks) markMesh(mk); }
    const [e, a] = V3.camAt(L.s, lv); A.pose = [e, a]; X.shot(e, a, fresh ? 1.3 : 0.6);
    try { if (X.polarUp) X.polarUp(true); } catch (e2) { /* */ }
    figures(0);
    if (!L.started) setTimeout(() => { if (A.phase === 'line' && !L.started && !A.ended) X.hand({ x: w0.x, y: F + 2.2, z: w0.z }, 0, 14); }, 1400);
    keep(); ev('line');
  }
  const lineAt = (s, dy = 0) => { const f = V3.faceAt(Math.max(0, s)); return { x: f.x + f.n[0] * 0.1, y: LY + dy, z: f.z + f.n[1] * 0.1 }; };
  function markMesh(mk) {
    const f = String(mk.f).replace('sikra.', '');
    if (f === 'pink') MK.pink(mk.s); else if (f === 'blot') MK.blot(mk.s); else if (f === 'blot2') { MK.blot(mk.s, -0.3); MK.blot(mk.s, 0.3); } else if (f === 'smear') MK.smear(mk.s); else if (f === 'seam') MK.seam(mk.s);
    else if (f === 'drip' && !drips.has(mk.n)) MK.grow(MK.drip(mk.s), 1);
  }
  /** the line's flaws into the save (each where it is: s along the round, its wall) as the model marks them */
  let mkN = L ? L.marks.length : 0;
  function marksOut() {
    while (mkN < L.marks.length) { const mk = L.marks[mkN++]; try { Mo.flaw(mk.f, { at: mk.s, wall: K.wallAt(Math.min(mk.s, 4 * SK.SIDE - 0.01)).k, n: mk.n | 0 }); } catch (e) { /* */ } }
  }
  const label = (f) => (LOSS[f] ? LOSS[f][0] : '');
  // ── a loss's words one at a time, over the line; a reward waits for its frame's end and is dropped when a loss came in it or
  //    shortly before (spec: no reward word or glare on a loss) ──
  const LQ = [], RW = [];
  const lossQ = (n, s, lab) => { A.lossT = A.t; LQ.push({ n, s, lab }); };
  const reward = (fn) => { RW.push({ fn, t: A.t }); };
  /** a loss's words on the screen: over the line, and clear of the men (a man's head that stands over the line on the screen — a high eye —
   *  puts them over his head instead) */
  function lossAtScr(s0) {
    const p = lineAt(s0, SKA.LOSS_DY), q = X.scr(p.x, p.y, p.z); if (!q || q.on === false) return p;
    let y = q.y;
    for (const w of [worker, helper]) {
      if (!w || !w.a || !(w.a.vis > 0.05)) continue;
      const f = X.scr(w.a.x, w.a.fixedY != null ? w.a.fixedY : w.a.y, w.a.z), h = X.scr(w.a.x, (w.a.fixedY != null ? w.a.fixedY : w.a.y) + 2.2, w.a.z); if (!f || !h) continue;
      const hw = Math.max(26, Math.abs(f.y - h.y) * 0.32) + 70;   // (half the man's width on the screen and half a label's)
      if (Math.abs(q.x - h.x) < hw && y > h.y - 26 && y < f.y + 14) y = h.y - 30;
    }
    return { sx: q.x, sy: Math.max(110, y) };
  }
  // (a reward that showed just before a loss is wiped off the screen as the loss comes: its number and its glare)
  let hushT = 0;
  function hushRewards() {
    try {
      if (!document.getElementById('h132-hush')) { const st = document.createElement('style'); st.id = 'h132-hush'; st.textContent = 'body.h132-hush .jx-n,body.h132-hush .jx-f{visibility:hidden!important}'; document.head.appendChild(st); }
      A.flashT = 0; flash.visible = false;
      document.body.classList.add('h132-hush'); clearTimeout(hushT); hushT = setTimeout(() => document.body.classList.remove('h132-hush'), 1600);
    } catch (e) { /* */ }
  }
  function lossPump(all) {
    if (!LQ.length) return;
    if (all) { const n = LQ.reduce((m, q) => m + q.n, 0), q0 = LQ[0]; LQ.length = 0; hushRewards(); X.loss(n, lossAtScr(q0.s), q0.lab); return; }
    if (A.t < A.lossNext) return;
    const q = LQ.shift(); A.lossNext = A.t + SKA.LOSS_GAP; A.lossT = A.t;
    hushRewards();
    X.loss(q.n, lossAtScr(q.s), q.lab);
  }
  function rewardFlush(now) {
    if (A.t - A.lossT < SKA.CALM || LQ.length) { RW.length = 0; return; }
    while (RW.length && (now || A.t - RW[0].t >= SKA.RW_WAIT)) { const r = RW.shift(); try { r.fn(); } catch (e) { /* */ } }
  }
  function onEvent(e) {
    ev(e.e + (e.s != null ? '@' + e.s : ''));
    const at = lineAt(e.s != null ? e.s : L.s, SKA.POP_DY);
    switch (e.e) {
      case 'seg': if (e.pts >= 40) reward(() => { X.hit(at, 'gold'); X.quick(at && { x: at.x, y: at.y, z: at.z, sep: true }, WORDS.quick); }); else if (e.pts >= 20) reward(() => X.hit(at, 'good')); else if (e.pts > 0) reward(() => X.hit(at, 'ok')); else if (e.pts < 0) lossQ(SK.PTS.loss, e.s != null ? e.s : L.s, label('sikra.wavy')); break;
      case 'corner':
        if (e.r === 'perfect') reward(() => { X.hit(at, 'ok', { text: '+10' }); X.quick(at && { x: at.x, y: at.y, z: at.z, sep: true }, WORDS.quick); VO.pluck(1.5); X.shake(0.12, 0.2); flash.position.set(at.x, LY, at.z); flash.visible = true; A.flashT = 0.6; try { if (X.haptic) X.haptic(25); } catch (er) { /* */ } });
        break;
      case 'gap': if (!e.free) lossQ(SK.PTS.loss, e.s, label('sikra.gap')); VO.snap(); { const s1 = e.s1 != null ? e.s1 : e.s; if (e.why !== 'close') { A.cutTo = Math.max(A.cutTo, s1); track.cuts.push([e.s, s1]); R.cut(e.s, Math.min(L.s, s1)); } } break;
      case 'smear': if (!e.free) { lossQ(SK.PTS.loss, e.s, label('sikra.smear')); MK.smear(e.s); } break;
      case 'blot': if (!e.free) { lossQ(SK.PTS.loss, e.s, label('sikra.blot')); MK.blot(e.s); } else VO.wipe(); break;
      case 'blot2': lossQ(SK.PTS.loss, e.s, label('sikra.blot2')); MK.blot(e.s, -0.3); MK.blot(e.s, 0.3); break;
      case 'seam': if (!e.free) { lossQ(0, e.s, label('sikra.seam')); MK.seam(e.s); track.cuts.push([e.s, e.s + 0.1]); } break;
      case 'drip': { const mm = MK.drip(e.s); mm.userData.t = 0; drips.set(e.id, mm); VO.drop(); break; }
      case 'dripLost': lossQ(SK.PTS.loss, e.s, label('sikra.drip')); A.camHold = { s: e.s + SKA.DRIP_LEAD, until: A.t + SKA.DRIP_HOLD }; break;
      case 'wipe': { const mm = drips.get(e.id); if (mm) { mm.parent && mm.parent.remove(mm); drips.delete(e.id); } VO.wipe(); if (!e.free) MK.pink(e.s); swabTo(lineAt(e.s, -0.4), 0.6); break; }
      case 'close': if (e.r === 'perfect') reward(() => { X.hit(at, 'gold', { text: '+40' }); X.quick(at && { x: at.x, y: at.y, z: at.z, sep: true }, WORDS.quick); VO.pluck(2); X.shake(0.18, 0.3); }); break;
      case 'flawOk': reward(() => X.quick(at && { x: at.x, y: at.y, z: at.z, sep: true }, WORDS.quick)); break;
      case 'done': finish(); break;
      default: break;
    }
  }
  /** the helper's swab to a point and back (to the bow: wetting the string; to a drip: wiping it) */
  function swabTo(p, secs) { A.swab = { p: [p.x, p.y, p.z], t: 0, d: secs }; }
  function bowlNow() { if (!L || L.done) return; const evs = K.bowlTap(L); VO.clay(); const bow = lineAt(L.s, 0.2); swabTo(bow, 0.7); for (const e of evs) if (e.e !== 'refill') onEvent(e); rewardFlush(); ev('bowl' + (evs[0] && evs[0].excess ? ':excess' : '')); }
  function dripNow(id) { if (!L) return; const evs = K.dripTap(L, id); for (const e of evs) onEvent(e); rewardFlush(); }
  /* ── the right thumb's targets on the screen ── */
  const scr = (x, y, z) => { const q = X.scr(x, y, z); return q && q.on !== false ? [q.x, q.y] : null; };
  const bowlScr = () => { if (!bowl.visible) return null; bowl.updateMatrixWorld(); return scr(bowl.position.x, bowl.position.y + 0.25, bowl.position.z); };
  function hitBowl(p) { const b = bowlScr(); return !!b && Math.hypot(b[0] - p.x, b[1] - p.y) <= V3.VK.BOWL_PX; }
  function hitDrip(p) {
    if (!L) return 0; let best = 0, bd = V3.VK.DRIP_PX;
    for (const d of K.freshDrips(L)) { const mm = drips.get(d.id); if (!mm) continue; const q = scr(mm.position.x, mm.position.y, mm.position.z); if (!q) continue; const dd = Math.hypot(q[0] - p.x, q[1] - p.y); if (dd <= bd) { bd = dd; best = d.id; } }
    return best;
  }
  function tapAt(p) { if (A.phase !== 'line' || !L || L.done) return; if (hitBowl(p)) { bowlNow(); return; } const id = hitDrip(p); if (id) { dripNow(id); return; } const b = bowlScr(); ev('tap:none' + (b ? ':' + Math.round(b[0] - p.x) + ',' + Math.round(b[1] - p.y) : ':nobowl') + '|by' + bowl.position.y.toFixed(2) + '|cy' + (X.camera ? X.camera.position.y.toFixed(2) : '?') + '|look' + A.look.toFixed(2)); }
  const liftLook = (u) => { A.look = clamp(u, 0, SKA.LOOK_MAX); try { if (X.lookLift) X.lookLift(A.look); } catch (e) { /* */ } };
  /* ── the right thumb while the left is held: the director gives the act one finger; the second is read here ── */
  const hudEl = (e) => !!(e && e.closest && e.closest('.gm-top,.gm-tabs,.gm-menu,.gm-modal,button,.h109-ui'));
  // (a tap's time is the events' own (timeStamp): on a slow page a frame between the press and the release is not the thumb's)
  const tOf = (e) => (Number.isFinite(e.timeStamp) && e.timeStamp > 0 ? e.timeStamp : performance.now());
  function rightUp(r, e) {
    const dt = tOf(e) - r.t0, d = Math.hypot(e.clientX - r.x0, e.clientY - r.y0);
    if (!r.drag && dt < SK.TAP_T * 1000 && d < SK.TAP_PX) tapAt({ x: e.clientX, y: e.clientY }); else ev('r2:' + (r.drag ? 'drag' : Math.round(dt) + 'ms/' + Math.round(d) + 'px'));
  }
  function onP(e) {
    if (e.pointerType === 'mouse') { onM(e); return; }
    if (A.phase !== 'line' || !A.leftDown || A.ended) return;
    if (e.pointerType === 'touch') {
      if (e.type === 'pointerdown' && !A.r2 && e.pointerId !== A.leftId && !hudEl(e.target)) { A.r2 = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: tOf(e), drag: false, u0: A.look }; e.stopPropagation(); return; }
      if (!A.r2 || e.pointerId !== A.r2.id) return;
      e.stopPropagation();
      if (e.type === 'pointermove') { const dy = e.clientY - A.r2.y0; if (A.r2.drag || Math.hypot(e.clientX - A.r2.x0, dy) > SK.TAP_PX) { A.r2.drag = true; liftLook(A.r2.u0 + (dy / innerHeight) * SKA.LOOK_GAIN); } }
      else { const r = A.r2; A.r2 = null; if (e.type === 'pointerup') rightUp(r, e); }
    }
  }
  // (the mouse: a right press while the left is held is a chord — the browser says it as a pointermove with button 2 (the director
  //  passes it to move() as p.chord: it keeps that move for itself), and the compat mousedown is not sent at all when the director took
  //  the left's pointerdown; every way is read here, the first one counts)
  function onM(e) {
    if (A.phase !== 'line' || A.ended) return;
    const pm = e.type.startsWith('pointer'), b2 = e.button === 2, held = (e.buttons & 2) === 2;
    const press = b2 && (e.type === 'mousedown' || (pm && e.type !== 'pointerup' && held)), release = b2 && (e.type === 'mouseup' || (pm && !held));
    if (press && !A.r2 && A.leftDown) { A.r2 = { mouse: true, x0: e.clientX, y0: e.clientY, t0: tOf(e), drag: false, u0: A.look }; A.hold = true; e.preventDefault(); return; }
    if (!A.r2 || !A.r2.mouse) return;
    if (release) { const r = A.r2; A.r2 = null; A.hold = false; rightUp(r, e); return; }
    if (e.type === 'mousemove' || e.type === 'pointermove') { const dy = e.clientY - A.r2.y0; if (A.r2.drag || Math.hypot(e.clientX - A.r2.x0, dy) > SK.TAP_PX) { A.r2.drag = true; liftLook(A.r2.u0 + (dy / innerHeight) * SKA.LOOK_GAIN); } }
  }
  const LST = [['pointerdown', onP], ['pointermove', onP], ['pointerup', onP], ['pointercancel', onP], ['mousedown', onM], ['mousemove', onM], ['mouseup', onM]];

  /** the left thumb → pace and height (relative to where it touched down); the mouse away from its place holds them */
  function leftIn() {
    if (!A.leftDown || !A.org || !A.lp) return { down: A.leftDown, pace: 0, h: 0 };
    const ph = isPhone(), pxP = ph ? SKA.PX_PACE.phone : SKA.PX_PACE.tab, pxH = ph ? SKA.PX_H.phone : SKA.PX_H.tab;
    const dx = A.lp.x - A.org.x, dy = A.org.y - A.lp.y;
    const v = { down: true, pace: clamp(((dx - SKA.DEAD) / pxP) * SK.PACE_MAX, 0, SK.PACE_MAX), h: clamp((dy / pxH) * SK.H_MAX, -SK.H_MAX, SK.H_MAX) };
    if (MOUSE && (A.hold || Math.hypot(dx, dy) > SKA.MOUSE_BOX)) return A.held || v;
    A.held = v; return v;
  }

  /* ───────── the men and the camera each frame ───────── */
  const V = new T.Vector3();
  function figures(dt) {
    if (!L || !worker) return;
    const W = V3.walkerAt(L.s, lv), a = worker.a, moving = !L.lifted && L.started && L.pace > SK.STOP;
    a.x = W.x; a.z = W.z; const wy = V3.footY(X, W.x, W.z); a.fixedY = wy;   // (on the fallen boards where they lie under his path)
    // (he faces along the wall, turned a little to it: the pole is held up before him, to the wall's side)
    const yw = Math.atan2(W.u[0], W.u[1]), toWall = Math.atan2(-W.n[0], -W.n[1]); let dyw = toWall - yw; while (dyw > Math.PI) dyw -= 2 * Math.PI; while (dyw < -Math.PI) dyw += 2 * Math.PI;
    a.yaw = yw + dyw * 0.45;
    a.arm[0] = a.armT[0] = 1.85; a.arm[2] = a.armT[2] = 1.35; a.arm[1] = a.armT[1] = -0.15; a.arm[3] = a.armT[3] = -0.15; a.bow = a.bowT = -0.05;
    worker.stride = moving ? clamp(L.pace / 2, 0.4, 1) : 0; worker.rate = 0.8 + L.pace * 0.5;
    // the pole: its foot by his feet toward the wall, its head the bow on the line (raised and lowered with the height; lifted off the
    // wall after a lift of the thumb)
    const f = V3.faceAt(L.s), off = L.lifted ? 0.7 : 0.09;
    const top = [f.x + f.n[0] * off, LY + L.h * K.TEF + (L.lifted ? 0.35 : 0), f.z + f.n[1] * off];
    const base = [W.x - W.n[0] * 0.2 + W.u[0] * 0.5, wy + 0.25, W.z - W.n[1] * 0.2 + W.u[1] * 0.5];   // (a step ahead of him: seen beside him, not behind his back)
    pole.set(base, top, f.u);
    const band = K.wetBand(L.w), sm = pole.str.material; sm.color.set(wetC[band]); sm.emissive.set(band === 'red' ? '#7A0E06' : '#000000'); sm.emissiveIntensity = band === 'red' ? 0.6 + 0.4 * Math.sin(A.t * 9) : 0;
    // the helper ahead, a little further out, the bowl in his arms (on the screen's right), the swab rod up toward the line
    const H0 = V3.helperAt(L.s, lv), hs = H0.s;
    if (helper) {
      const ha = helper.a, hx = H0.x, hz = H0.z, was = Math.hypot(hx - ha.x, hz - ha.z), hy = V3.footY(X, hx, hz);
      ha.x = hx; ha.z = hz; ha.fixedY = hy; ha.yaw = Math.atan2(-H0.n[0] * 0.6 - H0.u[0] * 0.8, -H0.n[1] * 0.6 - H0.u[1] * 0.8) + Math.PI;   // (half turned back toward the worker)
      ha.arm[0] = ha.armT[0] = 0.75; ha.arm[2] = ha.armT[2] = 1.25; ha.arm[1] = ha.armT[1] = -0.35; ha.arm[3] = ha.armT[3] = -0.1;
      helper.stride = was > 0.01 && moving ? 1 : 0; helper.rate = 0.8 + L.pace * 0.5;
      const fx = Math.sin(ha.yaw), fz = Math.cos(ha.yaw);
      bowl.position.set(hx + fx * 0.55, hy + 1.35, hz + fz * 0.55);
      // the swab rod from his raised hand up to the wall ahead (or to the bow / a drip when he wets or wipes)
      const hand = [hx + fx * 0.3 - H0.n[0] * 0.2, hy + 2.3, hz + fz * 0.3 - H0.n[1] * 0.2];
      let tip = (() => { const q = V3.faceAt(hs + 0.3); return [q.x + q.n[0] * 0.35, LY + 0.7, q.z + q.n[1] * 0.35]; })();
      if (A.swab) { A.swab.t += dt; const u = A.swab.t / A.swab.d, k = u < 0.5 ? ease(u * 2) : ease((1 - u) * 2); tip = tip.map((v, i) => lerp(v, A.swab.p[i], k)); if (u >= 1) A.swab = null; }
      swab.set(hand, tip);
    }
    // the dots the helper has marked (he walks ahead and marks each at the line's height)
    for (const d of dots) if (!d.m.visible && hs + 0.4 >= d.s) d.m.visible = true;
  }
  function camStep() {
    if (!L) return;
    // (the camera's point stays on the line a little ahead of a fresh drip, and holds on a lost one, until it has been seen)
    let cs = L.s;
    for (const d of K.freshDrips(L)) cs = Math.min(cs, d.s + SKA.DRIP_LEAD);
    if (A.camHold) { if (A.t < A.camHold.until) cs = Math.min(cs, A.camHold.s); else A.camHold = null; }
    const W = V3.walkerAt(cs, lv), [e, a] = V3.camAt(cs, lv, W);
    A.pose = [e, a]; X.track(e, a, 3.2);
  }
  /** the ribbon grows to s: every sample since the last, at the height and band of now (a gap's stretch flat) */
  function grow() {
    if (!L || !L.started) return;
    const n = Math.floor(L.s / SK.SAMPLE + 1e-6), band = K.wetBand(L.w);
    for (; A.si <= n; A.si++) { const s = A.si * SK.SAMPLE; R.set(A.si, s, L.h, band, !L.lifted && s >= A.cutTo); }
    const tn = Math.floor(L.s / 0.5 + 1e-6); for (; A.ti <= tn; A.ti++) { track.hs.push(Math.round(L.h * 100)); track.ws.push(band[0]); }
    R.flush();
  }

  /* ───────── the end ───────── */
  function finish() {
    if (A.done) return; A.done = 1; A.phase = 'out'; VO.hum(0);
    lossPump(true); rewardFlush(true);
    marksOut();
    const res = K.lineResult(L, Ms), rec = V3.lineRecord(L, track);
    try { Mo.st.sikra.line = rec; } catch (e) { /* */ }
    keep();
    const at = lineAt(lv === 1 ? 30 : 0, 0);
    if (res.perfect) { try { X.perfect(WORDS.sikra, at); } catch (e) { /* */ } }
    ev('end:' + res.stars);
    setTimeout(() => {
      if (A.ended) return;
      const eye = S9.cam.w4measure[0].slice(), aim = S9.cam.w4measure[1].slice();
      // (one kohen in the film: the worker with the pole is the player's kohen; the stage's own kohen figure stays out of it)
      X.end({ stars: res.stars, q: res.q, pts: res.pts, perfect: res.perfect, at, flags: res.flags,
        film: { eye, aim, secs: 2.4, kohen: false, own: () => [worker && worker.a, helper && helper.a].filter(Boolean), after: () => { cleanup(); } } });
    }, res.perfect ? 1600 : 700);
  }
  function cleanup() {
    try { gang.clear(); } catch (e) { /* */ }
    if (root.parent) root.parent.remove(root);
    V3.SK3.act = false; V3.SK3.key = '';
    try { if (X.polarUp) X.polarUp(false); } catch (e) { /* */ }
  }

  return {
    close: true,
    kohenWorks: false,
    begin() {
      X.kohen(false);   // (his own figure is the worker of the line, drawn here, whole, with the pole; the measuring is the rod's)
      VO.init();
      for (const [t, f] of LST) addEventListener(t, f, true);
      for (const k of Ms.done) if (!stakes[k]) stakes[k] = putStake(k);
      if (A.phase === 'line') lineOn(false);
      else cornerOn(K.measureNext(Ms) || 'SE', true);
    },
    update(dt) {
      A.t += dt;
      try { BT.step(dt); gang.update(dt, BT); } catch (e) { /* */ }
      if (A.flashT > 0) { A.flashT -= dt; flash.material.opacity = Math.max(0, A.flashT / 0.6) * 0.55; flash.scale.setScalar(1 + (0.6 - A.flashT) * 2); if (A.flashT <= 0) flash.visible = false; }
      if (A.phase === 'measure') { if (!A.rod.hung && !A.drag && A.rod.u > 0) { A.rod.u = Math.max(0, A.rod.u - dt * 2.5); rodPlace(); } return; }
      if (A.phase !== 'line' || !L || L.done) return;
      const inp = leftIn();
      const evs = K.lineStep(L, dt, inp);
      grow();
      for (const e of evs) onEvent(e);
      rewardFlush(); lossPump(false);
      marksOut();
      for (const [id, mm] of drips) { mm.userData.t = (mm.userData.t || 0) + dt; MK.grow(mm, Math.min(1, mm.userData.t / 0.6)); void id; }
      VO.hum(!L.lifted && L.started ? L.pace / SK.PACE_MAX : 0);
      figures(dt); camStep();
      A.keepT += dt; if (A.keepT > SKA.KEEP_S) { A.keepT = 0; keep(); }
    },
    wants(p) {
      if (A.phase === 'measure') return !A.busy;
      if (A.phase === 'line') return hitBowl(p) || !!hitDrip(p);
      return false;
    },
    mouseRight(p) { return A.phase === 'line' && !A.leftDown && (hitBowl(p) || !!hitDrip(p)); },
    holds() { return A.phase === 'line' && A.leftDown; },
    down(p) {
      if (A.ended) return;
      if (A.phase === 'measure') {
        if (A.busy) return;
        A.drag = { x0: p.x, y0: p.y, t0: performance.now(), u0: A.rod.u };
        if (!A.rod.hung) { const E = rodEnds(A.k), a = scr(...E.start), b = scr(...E.hang); A.drag.v = a && b ? [b[0] - a[0], b[1] - a[1]] : [0, -innerHeight / 3]; }
        return;
      }
      if (A.phase !== 'line') return;
      // (the right button, or a right-half touch on the bowl or a drip while the left is not down: a right-thumb tap)
      if (p.button === 2 || (p.x > innerWidth * 0.5 && !A.leftDown && (hitBowl(p) || hitDrip(p)))) { A.mode = 'right'; A.rt = { x0: p.x, y0: p.y, t0: performance.now() }; return; }
      A.mode = 'left'; A.leftDown = true; A.leftId = p.id; A.org = { x: p.x, y: p.y }; A.lp = { x: p.x, y: p.y }; A.held = null; X.hand(null);
    },
    move(p) {
      if (A.phase === 'measure' && A.drag && !A.rod.hung) {
        const v = A.drag.v, L2 = v[0] * v[0] + v[1] * v[1] || 1; A.rod.u = clamp(A.drag.u0 + ((p.x - A.drag.x0) * v[0] + (p.y - A.drag.y0) * v[1]) / L2, 0, 1); rodPlace(); return;
      }
      if (A.mode === 'left') A.lp = { x: p.x, y: p.y };
      // (the mouse's right button pressed or let go while the left is held: the director's chord, read as the right thumb)
      if (A.mode === 'left' && (p.chord || (A.r2 && A.r2.mouse))) {
        const c = p.chord && p.chord.button === 2 ? p.chord : null;
        onM({ type: 'pointermove', pointerType: 'mouse', button: c ? 2 : -1, buttons: c ? c.buttons : 2, clientX: p.x, clientY: p.y, timeStamp: c ? c.t : performance.now(), preventDefault() {} });
      }
    },
    up(p) {
      if (A.phase === 'measure') {
        const d = A.drag; A.drag = null; if (!d) return;
        const tap = performance.now() - d.t0 < 400 && Math.hypot(p.x - d.x0, p.y - d.y0) < SK.TAP_PX * 2;
        if (A.rod.hung) { const q = scr(...rodLow()); if (tap && q && Math.hypot(q[0] - p.x, q[1] - p.y) < SKA.END_PX) stakeTap(); return; }
        if (A.rod.u >= 0.8) { A.rod.u = 1; A.rod.hung = true; rodPlace(); VO.knock(); ev('hung:' + A.k); if (!Ms.done.length) setTimeout(() => { if (A.rod.hung && !A.busy && !A.ended) X.hand(W3(rodLow()), 0, 14); }, 500); }
        return;
      }
      if (A.mode === 'right') { const r = A.rt; A.mode = null; A.rt = null; if (r && performance.now() - r.t0 < SK.TAP_T * 1000 && Math.hypot(p.x - r.x0, p.y - r.y0) < SK.TAP_PX) tapAt(p); return; }
      if (A.mode === 'left') { A.mode = null; A.leftDown = false; A.leftId = null; A.r2 = null; A.hold = false; }
    },
    cancel() { A.drag = null; if (A.mode === 'left') { A.leftDown = false; } A.mode = null; A.r2 = null; },
    at() { if (A.phase === 'measure' && A.k) { const [x, z] = S9.corner[A.k]; return { x, y: LY, z }; } return lineAt(L ? L.s : 0, 0); },
    figs() { const o = []; for (const w of [worker, helper]) if (w && w.a) o.push({ x: w.a.x, y: w.a.fixedY != null ? w.a.fixedY : F, z: w.a.z, h: 3.9 }); return o; },
    end() {
      A.ended = true; X.hand(null); VO.hum(0); VO.stop();
      for (const [t, f] of LST) removeEventListener(t, f, true);
      if (!A.done) cleanup();
    },
    dbg() {
      const o = { id: m.id, lv, phase: A.phase, step: A.phase === 'measure' ? 'measure:' + A.k + (A.rod.hung ? ':hung' : '') : A.phase, busy: A.busy, ev: A.ev.slice(-10) };
      if (A.phase === 'measure' && A.k) { const E = rodEnds(A.k); o.k = A.k; o.hung = A.rod.hung; o.u = +A.rod.u.toFixed(2); o.rodFrom = scr(...E.start); o.rodTo = scr(...E.hang); o.rodEnd = scr(...rodLow()); o.stakes = Ms.done.slice(); o.want = Ms.want.slice(); }
      if (L) {
        Object.assign(o, { s: +L.s.toFixed(2), h: +L.h.toFixed(2), pace: +L.pace.toFixed(2), w: +L.w.toFixed(3), band: K.wetBand(L.w), down: A.leftDown, lifted: L.lifted, started: L.started, done: L.done, closed: L.closed, seams: L.seams, dmg: L.dmg, segs: L.segs.length, corners: L.corners.map((c) => c.r).join(','), end: L.end, wetTo: +L.wetTo.toFixed(2), marks: L.marks.length });
        o.bowl = bowlScr(); o.drips = K.freshDrips(L).map((d) => { const mm = drips.get(d.id); return { id: d.id, age: +d.age.toFixed(2), sc: mm ? scr(mm.position.x, mm.position.y, mm.position.z) : null }; });
        o.flaws = L.flaws.map((f) => f.s0); o.corn = K.cornersOf(lv);
        o.px = { pace: isPhone() ? SKA.PX_PACE.phone : SKA.PX_PACE.tab, h: isPhone() ? SKA.PX_H.phone : SKA.PX_H.tab, dead: SKA.DEAD, max: SK.PACE_MAX, hmax: SK.H_MAX, box: SKA.MOUSE_BOX };
        o.look = +A.look.toFixed(2);
      }
      o.figs = [worker, helper].filter(Boolean).map((w) => [+w.a.x.toFixed(1), +w.a.z.toFixed(1)]);
      o.mouse = MOUSE;
      return o;
    },
  };
}
