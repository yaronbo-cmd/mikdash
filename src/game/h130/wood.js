/* ── build 130 ── h130/wood.js — station 2, "לשכת העצים" (spec docs/specs/shlav-05-hadash-he.md "תחנה 2"; brief §4). Three works:
 *   wood1  six logs: the holes are seen in the eye once the log is rolled round
 *   wood2  eight logs: the worm under the bark; only the tap tells where to peel
 *   wood3  six big logs, some with one bad end: taps find where the hollow ends, a chalk line across the log, the crew saws there; the
 *          end goes out and the rest is saved
 * The log lies big in the middle of the screen on the two trestles. All with the left hand, on the log itself:
 *   a drag ALONG the log rolls it (a whole turn and more, both ways) · a short touch taps it (deep and still, or hollow: the log trembles
 *   there and wood dust falls — the game is played without sound) · a drag ACROSS peels a strip of bark (levels 1–2) or, on level 3,
 *   draws the chalk line the crew saws on · a log taken by one of its two ends (the gold bands) and dragged right goes to the clean pile,
 *   left goes out (it follows late, heavy; let go short of the green mark and it slides back onto the trestles).
 * The right hand is the camera: a touch on the right half is the act's only where it lands on the log itself; anywhere else it lifts
 * the camera (rule 66); play goes on while it is lifted a little. In the picture: the kohen (a mallet in his hand: he taps the log) and
 * the second kohen who checks a log of his own beside him; on level 3 the two sawyers come in only to saw, and go.
 * A wormy log let into the clean pile is found when it is split: wood.worm (−20), the split log stays in the world by the rejects, and
 * the logs this work had put in the pile come back to be checked. A level with no mistake: the full screen, and the kohen in charge
 * carries the clean wood toward the altar's pile.
 * The model: model.js (LOGS, logFresh, rollStep, seenHoles, tapAt, peelAt, decide, cutAt, endBad, bestCut, piecesOf, woodPts). Every
 * place: BOOK.s05.wood; the drawing: wood3d.js.
 */
import { LINES, QUICK, LOSS, LOGS, WOOD, logFresh, wormy, rollStep, seenHoles, tapAt, peelAt, decide, cutAt, endBad, bestCut, piecesOf, woodPts, qOf, starsOf } from './model.js';
import { WD, AX, woodSave, woodWorld, logPiece, logSkin, splitHalves, pileSpot, logY, trestle } from './wood3d.js';
import { createVoices } from '../h129/sound129.js';
import { card, cite } from '../h129/ui7.js';
import { fingers, MOUSE, onY } from '../h113/acts.js';
import { createGang, createBeat, clamp, lerp, ease } from '../h109/kit.js';
import { BOOK } from '../world/grid.js';

const S5 = BOOK.s05, W5 = S5.wood, F = S5.court.floor;
const DOOR = (() => { const c = S5.chambers.find((q) => q.id === 'wood'); return [(c.door[0] + c.door[1]) / 2, c.doorZ]; })();
const D2R = Math.PI / 180, U = AX.U, NRM = AX.N, YAW = AX.yaw, DIR = AX.dir;
/** the act's numbers: the roll's gain (degrees per px of a drag along), a tap's most travel (px), how far the log must be carried to go
 *  (amot), the lens; the camera's place round the trestles (offsets: behind and above, its aim a little past the log's middle) */
const K = Object.freeze({ ROLL: 1.25, TAP: 12, GO: 1.3, FOV: 46, HAND: 70, D: 12.5, EL: 22, AIM: [1.2, 2.0, 0.3], BAND: 0.42 });
/** the second kohen's own log: beside his place (offsets from it), lying across the room */
const OWN = Object.freeze({ dx: 1.7, dz: 0 });
/** where the next logs wait: behind the trestles (away from the camera) and a little to the left, in the log's own frame (amot) */
const STACK = Object.freeze({ back: 3.3, side: -1.4 });
/** the words (instructions carry "(המחשה)": how wood was checked is not in the sources) */
export const WLINES = Object.freeze({
  l1: 'גלגלו את הבול: יש נקבים? (המחשה)',
  l2: 'הקישו: חלול? שם קלפו (המחשה)',
  l3: 'הקישו: איפה נגמר החלול? (המחשה)',
  chalk: 'גררו לרוחב: קו לחיתוך',
  decide: 'קחו בקצה: ימינה נקי, שמאלה החוצה',
  back: 'הבול חזר לחמורים',
  goodOut: 'בול נקי נזרק · חסר במלאי העצים',
  wholeOut: 'כל הבול נזרק · גם העץ הטוב שבו',
  worm: 'בבקיעה נמצאה תולעת · הערימה חוזרת לבדיקה',
  far: 'רחוק מדי מהנגע · עץ טוב אבד',
  near: 'בחתך עוד נראה החלול',
  waste: 'הבול היה שלם · החיתוך מיותר',
  carry: 'העצים הנקיים אל המערכה',
  sawyers: 'הצוות מנסר על הקו',
});

export const WOOD_ACT = {
  icon: '🪵', title: 'לשכת העצים',
  walkLine: (m) => (m && m.lv === 3 ? 'לשכת העצים: קצה נגוע' : m && m.lv === 2 ? 'לשכת העצים: מתחת לקליפה' : 'לשכת העצים: עין של מתליע'),
  stand() { const s = W5.stand, t = W5.trestles; return { x: s[0], z: s[1], face: [t[0], t[1]] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, Mo = X.M, st = Mo.st, lv = m.lv | 0 || 1, V = createVoices(X.sfx), WS = woodSave(st);
    const tx = W5.trestles[0], tz = W5.trestles[1];
    const A = { phase: 'arrive', t: 0, ev: [], busy: 1, fl: null, tw: null, trem: null, off: 0, offT: 0, carry: null, seenQ: 0, hint: 0, taps: [], chalk: null, cut: null, keep: null, hintT: 0 };
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
    const root = new T.Group(); root.name = 'h130-wood-act'; X.props.root.add(root);
    // ── the work in hand: a fresh one, or the one a reload broke off (rule 55: the piles stay; the logs not yet decided come back)
    if (!WS.w || WS.w.id !== m.id) WS.w = { id: m.id, order: LOGS[lv].map((_, i) => i), now: [], wrong: 0, waste: 0, dmg: 0 };
    const WK = WS.w;
    X.save();
    // ── the camera: behind the kohen and above, the log big in the middle, the kohen in the left third
    const cam0 = X.camera, fov0 = cam0.fov;
    const lens = (f) => { try { cam0.fov = f; cam0.updateProjectionMatrix(); } catch (e) { /* */ } };
    // (it looks along WD.DIR — toward the chamber's north-west — so the kohen at his stand is in the left third and no nearer than the log,
    //  the clean pile to the right and the rejects beyond on the left; the log lies across the view, along U)
    const aim = [tx + K.AIM[0], F + K.AIM[1], tz + K.AIM[2]], ce = Math.cos(K.EL * D2R) * K.D;
    const eye = [aim[0] - DIR[0] * ce, aim[1] + Math.sin(K.EL * D2R) * K.D, aim[2] - DIR[1] * ce];
    const camHome = (d = 1.2) => X.shot(eye, aim, d);
    const holdLens = () => { try { const L = X.lookNow ? X.lookNow() : null; if (L && (L.u > 0.01 || Math.abs(L.yaw) > 0.03 || L.ov)) return; if (Math.abs(cam0.fov - K.FOV) > 0.01) lens(K.FOV); } catch (e) { /* */ } };
    // the log's frame: its angle 0 faces the camera (the model's "facing the eye")
    const LZ = [Math.sin(YAW), Math.cos(YAW)], alpha = Math.atan2((eye[0] - tx) * LZ[0] + (eye[2] - tz) * LZ[1], eye[1] - logY(0.4));
    const orient = (g, roll) => { g.rotation.order = 'YXZ'; g.rotation.set(roll, YAW, 0); };
    const alongOf = (q) => (q.x - tx) * U[0] + (q.z - tz) * U[1];
    // ── the figures: the kohen with his mallet; the second kohen checking a log of his own (a mallet, on the beat); level 3's sawyers
    try { X.kohen(true); if (X.hero && X.hero.setTool) X.hero.setTool('wood'); } catch (e) { /* */ }
    const B = createBeat(X), gang = createGang(X);
    const sec = W5.second, ownAt = [sec[0] + OWN.dx, sec[1] + OWN.dz];
    const ownG = new T.Group(); root.add(ownG);
    { const ol = LOGS[2][6], g = logPiece(X, ol, 0, 2.4, null); g.position.set(ownAt[0], logY(ol.r), ownAt[1]); g.rotation.x = 1.1; ownG.add(g); for (const e of [-1, 1]) trestle(X, ownAt[0] + e * 0.75, ownAt[1], 0.9, ownG); }
    let second = gang.add(sec[0], sec[1], { variant: 'kohen', tunic: '#F2EEE4', role: 'hammer', item: 'mallet', fx: ownAt[0], fz: ownAt[1], k: 3, crew: 1 });
    const saw = [];
    // ── the green marks on the piles (rule 59: where to bring it), shown while the log is carried
    const ringG = new T.RingGeometry(1.15, 1.45, 28), greens = {};
    for (const [k, p] of [['clean', W5.clean], ['out', W5.out]]) { const r = new T.Mesh(ringG, X.props.M.w5green); r.rotation.x = -Math.PI / 2; r.position.set(p[0], F + 0.04, p[1]); r.visible = false; r.renderOrder = 5; root.add(r); greens[k] = r; }
    // ── the waiting logs (the ones not checked yet), a small stack behind the trestles
    const stackG = new T.Group(); root.add(stackG);
    function stackSync() {
      for (const c of stackG.children.slice()) X.props.remove(c);
      const c = [tx + DIR[0] * STACK.back + U[0] * STACK.side, tz + DIR[1] * STACK.back + U[1] * STACK.side];
      WK.order.slice(1).forEach((i, n) => { const log = LOGS[lv][i], g = logPiece(X, log, 0, log.L, null); const row = n < 4 ? 0 : 1, k = row ? n - 4 : n, o = (k - 1.5 + row * 0.5) * (2 * log.r + 0.05); g.position.set(c[0] + DIR[0] * o, F + log.r + row * log.r * 1.7, c[1] + DIR[1] * o); orient(g, n * 0.9); stackG.add(g); });
    }
    // ── the log in hand
    let S = null, log = null, piece = null, skin = null, cur = -1;
    const xOf = (s) => tx + U[0] * (s - log.L / 2 + A.off), zOf = (s) => tz + U[1] * (s - log.L / 2 + A.off);
    const yL = () => logY(log.r);
    const atS = (s) => ({ x: xOf(s), y: yL() + log.r * 0.6, z: zOf(s) });
    function pieceMesh() {
      if (piece) X.props.remove(piece);
      const [s0, s1] = A.keep || [0, log.L];
      piece = logPiece(X, log, s0, s1, skin); root.add(piece); place();
    }
    function place(dy = 0, dx = 0) {
      if (!piece) return; const [s0, s1] = A.keep || [0, log.L];
      piece.position.set(xOf((s0 + s1) / 2) + dx * U[0], yL() + dy, zOf((s0 + s1) / 2) + dx * U[1]); orient(piece, alpha + S.rot * D2R);
    }
    function nextLog() {
      if (!WK.order.length) return finish();
      cur = WK.order[0]; S = logFresh(lv, cur); log = S.log; A.taps = []; A.chalk = null; A.cut = null; A.keep = null; A.off = 0; A.offT = 0; A.seenQ = 0; A.peelQ = 0;
      skin = logSkin(X, S, { taps: A.taps, chalk: null }); pieceMesh(); stackSync();
      // (it comes from the waiting stack onto the trestles, rolling)
      A.phase = 'arrive'; A.busy = 1; A.tw = { t: 0, d: 0.9, from: [tx + DIR[0] * STACK.back + U[0] * STACK.side, F + log.r, tz + DIR[1] * STACK.back + U[1] * STACK.side], k: 'arrive' };
      ev('log:' + log.id); X.save();
    }
    const skinDraw = () => { if (skin) skin.draw(); };
    // ── where a finger is on the log: s along it (in the piece), how far off its axis on the screen, on one of its end bands
    function pick(p) {
      if (!log) return null;
      const [s0, s1] = A.keep || [0, log.L], a = X.scr(xOf(s0), yL(), zOf(s0)), b = X.scr(xOf(s1), yL(), zOf(s1)), top = X.scr(xOf((s0 + s1) / 2), yL() + log.r, zOf((s0 + s1) / 2)), mid = X.scr(xOf((s0 + s1) / 2), yL(), zOf((s0 + s1) / 2));
      if (a.on === false || b.on === false) return null;
      const vx = b.x - a.x, vy = b.y - a.y, L2 = vx * vx + vy * vy || 1, u = ((p.x - a.x) * vx + (p.y - a.y) * vy) / L2;
      const rp = Math.max(16, Math.hypot(top.x - mid.x, top.y - mid.y)), len = Math.sqrt(L2);
      const px = a.x + vx * u, py = a.y + vy * u, d = Math.hypot(p.x - px, p.y - py), over = Math.max(0, -u, u - 1) * len;
      if (d > rp + 14 || over > 18) return null;
      const s = clamp(s0 + (s1 - s0) * u, s0, s1), band = Math.min(s - s0, s1 - s) <= K.BAND;
      return { s, band, d, ax: vx / len, ay: vy / len, len, u };
    }
    // ── the fingers
    const FG = fingers(X, {
      down(f) {
        if (A.busy || A.phase !== 'look' || A.fl) return;
        const k = pick(f); if (!k) return;
        A.fl = f.id; f.w = { s: k.s, band: k.band, ax: k.ax, ay: k.ay, len: k.len, mode: null, rot0: S.rot, peeled: 0 };
        X.hand(null);
      },
      move(f) {
        const w = f.w; if (!w || A.fl !== f.id) return;
        const dx = f.x - f.x0, dy = f.y - f.y0, al = dx * w.ax + dy * w.ay, ac = -dx * w.ay + dy * w.ax;
        if (!w.mode && f.moved > K.TAP) {
          if (Math.abs(al) >= Math.abs(ac)) w.mode = w.band ? 'carry' : 'roll';
          else w.mode = lv === 3 ? 'chalk' : 'peel';
          if (w.mode === 'carry') { const q = onY(X, f, yL()); w.gx = q ? alongOf(q) : w.s - log.L / 2 + A.off; A.carry = 1; greens.clean.visible = greens.out.visible = true; V.scrape(0.4); }
          ev('mode:' + w.mode);
        }
        if (w.mode === 'roll') { const d = w.rot0 + al * K.ROLL - S.rot; const r = rollStep(S, d); V.scrape(Math.min(1, Math.abs(d) / 6)); seenCheck(r.seen); }
        else if (w.mode === 'carry') { const q = onY(X, f, yL()); if (q) A.offT = clamp(alongOf(q) - w.gx, -6, 6); }
        else if (w.mode === 'peel' && !w.peeled && Math.abs(ac) > 34) { w.peeled = 1; peel(w.s); }
        else if (w.mode === 'chalk' && !w.peeled && Math.abs(ac) > 34) { w.peeled = 1; chalk(w.s); }
      },
      up(f) {
        const w = f.w; if (!w || A.fl !== f.id) return; A.fl = null; V.scrape(0);
        if (!w.mode && f.moved <= K.TAP) { tap(w.s); return; }
        if (w.mode === 'carry') {
          A.carry = 0; greens.clean.visible = greens.out.visible = false;
          if (Math.abs(A.off) >= K.GO) decideNow(A.off > 0 ? 'clean' : 'out');
          else { A.offT = 0; if (Math.abs(A.off) > 0.3) X.line(WLINES.back, 1800); ev('back'); }
        }
      },
    });
    // ── the tap: the kohen's mallet on the log at s; hollow — it trembles there and wood dust falls; deep — it hardly moves
    function tap(s) {
      const r = tapAt(log, s), ang = -S.rot, p = atS(s);
      A.taps.push({ s, ang, hollow: r.sound === 'hollow' }); skinDraw();
      A.trem = { t: 0, k: r.tremble, s };
      if (r.dust) { X.dust(p.x, p.y, p.z, Math.round(8 + 14 * r.tremble), 3); V.dust(); }
      V.knock(r.sound === 'hollow' ? 0.55 : 1.6);
      try { X.hero.act('tamp', { x: p.x, y: p.y, z: p.z }, { snap: true }); } catch (e) { /* */ }
      ev('tap:' + s.toFixed(2) + ':' + r.sound);
      if (r.sound === 'hollow' && !A.hollowSeen) { A.hollowSeen = 1; if (lv === 2) X.line('חלול! קלפו כאן רצועה (המחשה)', 3200); }
      hintNext();
    }
    function peel(s) {
      const ang = -S.rot, r = peelAt(S, s, ang); skinDraw(); V.cloak();
      const p = atS(s); X.dust(p.x, p.y, p.z, 5, 2);
      try { X.hero.act('pull', { x: p.x, y: p.y, z: p.z }, { snap: true }); } catch (e) { /* */ }
      ev('peel:' + s.toFixed(2) + (r.found.length ? ':found' : ''));
      if (r.found.length && !A.peelQ) { A.peelQ = 1; X.quick(p, QUICK.found, piece); }
      hintNext();
    }
    function seenCheck(seen) {
      if (seen.length && !A.seenQ) { A.seenQ = 1; const h = log.holes[seen[0]]; X.quick(atS(h.s), QUICK.found, piece); ev('seen'); }
    }
    // ── level 3: the chalk line, the crew saws on it; the bad end goes out, the rest stays on the trestles
    function chalk(s) {
      if (A.sawing) return;
      A.chalk = s; skinDraw(); ev('chalk:' + s.toFixed(2)); V.quill();
      if (!A.sawPend) { A.sawPend = 1; sawSeq(); }
    }
    async function sawSeq() {
      X.line(WLINES.sawyers, 2600);
      // (the two sawyers come in from the door's side, one each side of the log at the line)
      const at = () => [xOf(A.chalk), zOf(A.chalk)];
      for (const e of [-1, 1]) { const w = gang.add(at()[0] + NRM[0] * e * 2.4 + U[0] * 1.6, at()[1] + NRM[1] * e * 2.4 + U[1] * 1.6, { role: 'push', item: 'saw', fx: at()[0], fz: at()[1], crew: 2 }); if (w) saw.push(w); }
      await Promise.all(saw.map((w, k) => Promise.race([gang.walkTo(w, at()[0] + U[0] * 0.25 + NRM[0] * (k ? 1 : -1) * (log.r + 0.75), at()[1] + U[1] * 0.25 + NRM[1] * (k ? 1 : -1) * (log.r + 0.75), 2.6), X.wait(2.4)])));
      A.sawing = 1; A.busy = 1; const s = A.chalk;
      for (let k = 0; k < 6; k++) { const p = atS(s); X.dust(p.x, p.y - log.r * 0.6, p.z, 6, 2); V.scrape(0.8); for (const w of saw) w.a.bowT = k % 2 ? 0.2 : 0.6; await X.wait(0.28); }
      V.scrape(0); V.knock(1.2);
      const cr = cutAt(log, s), pc = piecesOf(log, s); A.cut = cr; ev('cut:' + cr.res);
      const k0 = A.keep || [0, log.L], keep = [Math.max(k0[0], pc.keep[0]), Math.min(k0[1], pc.keep[1])], out = [Math.max(k0[0], pc.out[0]), Math.min(k0[1], pc.out[1])];
      // the end that goes out rolls off to the rejects (kept in the save as a piece)
      if (out[1] - out[0] > 0.05) {
        const g = logPiece(X, log, out[0], out[1], skin); root.add(g); g.position.set(xOf((out[0] + out[1]) / 2), yL(), zOf((out[0] + out[1]) / 2)); orient(g, alpha + S.rot * D2R);
        const n = WS.out.length, sp = pileSpot('out', n, 0.52);
        await tween(g, [sp.x, F + sp.y, sp.z], 1.0, 2.5);
        X.props.remove(g); WS.out.push({ lv, i: cur, s0: out[0], s1: out[1], end: 1 }); woodWorld(X);
      }
      A.keep = keep; A.chalk = null; skinDraw(); pieceMesh();
      if (cr.res === 'right') X.quick(atS((keep[0] + keep[1]) / 2), QUICK.cut, piece);
      else if (cr.res === 'far') { WK.waste++; X.line(WLINES.far, 3000); }
      else if (cr.res === 'waste') { WK.waste++; X.line(WLINES.waste, 3000); }
      else X.line(WLINES.near, 3000);
      X.save();
      // (the sawyers go)
      for (const w of saw.splice(0)) { gang.walkTo(w, xOf(log.L) + U[0] * 3 + NRM[0] * 3.5, zOf(log.L) + U[1] * 3 + NRM[1] * 3.5, 2.6); X.wait(1.4).then(() => gang.remove(w)); }
      A.sawing = 0; A.sawPend = 0; A.busy = 0; A.phase = 'look'; hintNext(true);
    }
    // ── a log moved along a path to a place, rolling (its roll ends where it lies)
    function tween(g, to, d = 1.0, turns = 1.5) {
      return new Promise((res) => { A.tw = { t: 0, d, g, from: [g.position.x, g.position.y, g.position.z], to, rx0: g.rotation.x, ry0: g.rotation.y, turns, res, k: 'move' }; });
    }
    // ── the decision
    async function decideNow(to) {
      A.busy = 1; A.phase = 'go'; X.hand(null);
      const r = decide(log, to, A.cut), [s0, s1] = A.keep || [0, log.L], e = { lv, i: cur, s0, s1 };
      ev('decide:' + to + ':' + (r.ok ? 'ok' : r.flag || 'waste'));
      const pAt = atS((s0 + s1) / 2);
      if (to === 'clean' && r.ok) { X.quick(pAt, QUICK.clean, piece); V.knock(1.3); }
      else if (to === 'out' && r.ok && !r.waste) { X.quick(pAt, QUICK.found, piece); V.knock(1.3); }
      else if (to === 'out') { WK.waste++; if (!wormy(log)) WK.wrong++; X.line(wormy(log) ? WLINES.wholeOut : WLINES.goodOut, 3400); }
      const side = to === 'clean' ? 'clean' : 'out', list = to === 'clean' ? WS.clean : WS.out, sp = pileSpot(side, list.length, 0.52);
      await tween(piece, [sp.x, F + sp.y, sp.z], 1.0, 2);
      X.props.remove(piece); piece = null;
      list.push(e); WK.order.shift(); if (to === 'clean') WK.now.push(e); woodWorld(X); X.save();
      if (to === 'clean' && r.flag === 'wood.worm') await wormFound(e);
      A.busy = 0; nextLog();
    }
    // ── a worm in the clean pile: the second kohen splits it, the worm is seen (−20); the split log by the rejects; the pile back
    async function wormFound(e) {
      const n = WS.clean.indexOf(e), sp = pileSpot('clean', Math.max(0, n), 0.52), at = { x: sp.x, y: F + sp.y + 0.5, z: sp.z };
      if (second) { gang.setRole(second, 'walk'); await Promise.race([gang.walkTo(second, sp.x - 1.4, sp.z + 1.1, 3), X.wait(3)]); gang.setRole(second, 'hammer', { fx: sp.x, fz: sp.z }); }
      await X.wait(1.0);
      V.crack(); X.shake(0.12, 0.2); X.dust(at.x, at.y, at.z, 16, 3);
      const p = Mo.mark('wood.worm', m.id, [+sp.x.toFixed(2), +sp.z.toFixed(2)], WS.split.length); WK.dmg++;
      WS.clean.splice(WS.clean.indexOf(e), 1); WS.split.push(e);
      X.loss(p, at, LOSS['wood.worm'][0]); ev('worm'); X.line(WLINES.worm, 4200);
      // (the logs this work put in the pile come back to be checked)
      const back = WK.now.filter((q) => q !== e && WS.clean.includes(q));
      for (const q of back) WS.clean.splice(WS.clean.indexOf(q), 1);
      WK.order.unshift(...back.map((q) => q.i)); WK.now = [];
      woodWorld(X); X.save();
      await X.wait(1.4);
      if (second) { gang.setRole(second, 'walk'); await Promise.race([gang.walkTo(second, sec[0], sec[1], 3), X.wait(3)]); gang.setRole(second, 'hammer', { fx: ownAt[0], fz: ownAt[1], item: 'mallet' }); }
    }
    // ── the hint hand (rule 25: one): what to do next on this log
    function hintNext(force) {
      if (A.busy || A.phase !== 'look' || !log) return;
      const [s0, s1] = A.keep || [0, log.L];
      const act = A.taps.length + S.peeled.length + Math.round(Math.abs(S.rotMax - S.rotMin) / 90) + (A.cut ? 3 : 0);
      if (!force && A.hintN === act) return; A.hintN = act;
      if (act >= 3 || A.cut) { if (A.hintK !== 'decide') { A.hintK = 'decide'; X.line(WLINES.decide, 3600); X.hand(atS(s1 - 0.2), K.HAND, 0); } return; }
      if (!A.hintK) { A.hintK = 'look'; X.hand(atS((s0 + s1) / 2), lv === 1 ? 60 : 0, lv === 1 ? 0 : 4); }
    }
    // ── the end of the work
    async function finish() {
      if (A.phase === 'done') return; A.phase = 'done'; A.busy = 1; X.hand(null);
      const res = { dmg: WK.dmg, wrong: WK.wrong, waste: WK.waste }, pts = woodPts(res), q = qOf(pts), clean = !WK.dmg && !WK.wrong && !WK.waste;
      delete WS.w; X.save();
      camHome(0.8);
      if (clean && second) {
        // the kohen in charge takes the clean wood toward the altar's pile (the chamber's door, on the way to the altar)
        const top = pileSpot('clean', Math.max(0, WS.clean.length - 1), 0.52);
        gang.setRole(second, 'walk'); await Promise.race([gang.walkTo(second, top.x - 1.2, top.z + 1.0, 3), X.wait(2.6)]);
        try { const AC = X.actors(); AC.setItem(second.a, 'log'); AC.pose(second.a, 'carry'); } catch (e) { /* */ }
        X.line(WLINES.carry, 3600);
        gang.walkTo(second, DOOR[0], DOOR[1] - 1.5, 2.2);
        await X.wait(2.6);
      }
      if (m.id === 'wood1') await card(X, `<b style="font:900 20px Heebo,system-ui">לשכת העצים</b>${cite(LINES.wood)}<small style="display:block;margin-top:8px">איך בודקים עץ: הקשה, קילוף, נקבים וחיתוך הקצה הנגוע (המחשה)</small>`, 9000);
      X.end({ stars: starsOf(q), q, pts, perfect: clean, flags: { wrong: WK.wrong, waste: WK.waste, 'wood.worm': WK.dmg }, at: { x: tx, y: F + 1.5, z: tz } });
    }
    // ── the frame's animations: the arrival, a log's way to its pile, the tremble, the carry following late
    function animate(dt) {
      const tw = A.tw;
      if (tw) {
        tw.t += dt; const u = Math.min(1, tw.t / tw.d), k = ease(u);
        if (tw.k === 'arrive') { const to = [xOf(log.L / 2), yL(), zOf(log.L / 2)]; piece.position.set(lerp(tw.from[0], to[0], k), lerp(tw.from[1], to[1], k) + Math.sin(u * Math.PI) * 0.5, lerp(tw.from[2], to[2], k)); orient(piece, alpha + (S.rot + (1 - k) * 300) * D2R); }
        else { const g = tw.g; g.position.set(lerp(tw.from[0], tw.to[0], k), lerp(tw.from[1], tw.to[1], k) + Math.sin(u * Math.PI) * 0.6, lerp(tw.from[2], tw.to[2], k)); g.rotation.x = tw.rx0 + k * tw.turns * Math.PI * 2; g.rotation.y = lerp(tw.ry0, 0, k); }
        if (u >= 1) { A.tw = null; if (tw.k === 'arrive') { A.phase = 'look'; A.busy = 0; place(); A.hintK = null; A.hintN = -1; lineFor(); hintNext(true); } else if (tw.res) tw.res(); }
        return;
      }
      if (!piece) return;
      A.off += (A.offT - A.off) * (1 - Math.exp(-dt * 3.2));   // (heavy: it follows late)
      let dy = 0, dx = 0;
      if (A.trem) { A.trem.t += dt; const a = A.trem.k * Math.exp(-A.trem.t * 5); dy = Math.sin(A.trem.t * 70) * 0.035 * a; dx = Math.sin(A.trem.t * 53) * 0.02 * a; if (A.trem.t > 1) A.trem = null; }
      place(dy, dx);
    }
    function lineFor() {
      if (A.lined === cur) return; A.lined = cur;
      if (!A.firstLine) { A.firstLine = 1; X.line(LINES.wood, 6500); X.wait(6.6).then(() => { if (A.phase === 'look' && !A.taps.length) X.line(lv === 1 ? WLINES.l1 : lv === 2 ? WLINES.l2 : WLINES.l3, 5000); }); return; }
      if (WK.order.length === LOGS[lv].length - 1) X.line(lv === 1 ? WLINES.l1 : lv === 2 ? WLINES.l2 : WLINES.l3, 4000);
    }
    return {
      close: true, kohenWorks: true,
      begin() {
        FG.attach(); lens(K.FOV); camHome(1.2);
        // (the trestles stand in the world; the act draws the log on them)
        nextLog();
      },
      update(dt) {
        A.t += dt; holdLens();
        try { V.frame(); B.step(dt); gang.update(dt, B); animate(dt); } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h130] wood', e && e.message); } }
      },
      down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { A.fl = null; A.carry = 0; A.offT = 0; greens.clean.visible = greens.out.visible = false; V.scrape(0); },
      // (rule 66: on the right half a touch is the act's only where it lands on the log itself; anywhere else it lifts the camera)
      wants(p) { if (!p) return true; if (A.busy || A.phase !== 'look') return false; return !!pick(p); },
      holds() { return A.fl != null; },
      end() {
        FG.detach(); V.stop(); X.hand(null); lens(fov0);
        gang.clear(); X.props.remove(root); if (piece) X.props.remove(piece); woodWorld(X);
      },
      at() { return new T.Vector3(tx, F + WD.TH + 0.4, tz); },
      dbg() {
        const sp = (x, y, z) => { const r = X.scr(x, y, z); return [Math.round(r.x), Math.round(r.y)]; };
        const o = { id: m.id, lv, phase: A.phase, busy: A.busy, mouse: MOUSE, ev: A.ev.slice(-10), left: WK.order.length, wrong: WK.wrong, waste: WK.waste, dmg: WK.dmg, nf: FG.n,
          pts: woodPts({ dmg: WK.dmg, wrong: WK.wrong, waste: WK.waste }), piles: { clean: WS.clean.length, out: WS.out.length, split: WS.split.length } };
        if (log) {
          const [s0, s1] = A.keep || [0, log.L], y = yL();
          Object.assign(o, { log: log.id, L: log.L, wormy: wormy(log), endBad: endBad(log), hollow: log.hollow ? [log.hollow.s0, log.hollow.s1] : null, best: bestCut(log), cut: A.cut ? A.cut.res : null, keep: [s0, s1],
            rot: +S.rot.toFixed(1), turned: +(S.rotMax - S.rotMin).toFixed(0), seen: seenHoles(S).length, holes: log.holes.map((h) => [h.s, h.ang]), peeled: S.peeled.length, taps: A.taps.length, off: +A.off.toFixed(2),
            a: sp(xOf(s0), y, zOf(s0)), b: sp(xOf(s1), y, zOf(s1)), mid: sp(xOf((s0 + s1) / 2), y, zOf((s0 + s1) / 2)), ppa: +(Math.hypot(...[0, 1].map((k) => sp(xOf(s1), y, zOf(s1))[k] - sp(xOf(s0), y, zOf(s0))[k])) / Math.max(0.1, s1 - s0)).toFixed(1),
            sAt: (s) => sp(xOf(s), y, zOf(s)) });
          o.pt = {}; for (const s of [0.25, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5]) if (s > s0 + 0.15 && s < s1 - 0.15) o.pt[s] = sp(xOf(s), y, zOf(s));
          if (o.best != null) o.bestAt = sp(xOf(o.best), y, zOf(o.best));
          for (const h of log.holes) if (h.s > s0 + 0.1 && h.s < s1 - 0.1) { o.holeAt = sp(xOf(h.s), y, zOf(h.s)); o.holeS = h.s; o.holeAng = h.ang; break; }
          if (log.hollow) { const hm = clamp((log.hollow.s0 + log.hollow.s1) / 2, s0 + 0.2, s1 - 0.2); o.hollowAt = sp(xOf(hm), y, zOf(hm)); }
          delete o.sAt;
        }
        o.cleanAt = sp(W5.clean[0], F + 0.5, W5.clean[1]); o.outAt = sp(W5.out[0], F + 0.5, W5.out[1]);
        o.figs = { second: second && second.a ? sp(second.a.x, F + 1, second.a.z) : null, saw: saw.length };
        return o;
      },
    };
  },
};
void WOOD; void splitHalves;
