/* ── build 131 ── h131/pit.js — part 1 of stage 08, "הבור בבקעת בית כרם" (spec docs/specs/shlav-08-he.md, part 1: three works). THE
 * PIT LANE'S FILE. The work is at the pit on the book's sheet at Ein Kerem (BOOK.s08.pit, "זיהוי מוצע, לא ודאי"): goPit there,
 * backFromPit when the work's film is over.
 *   pit1  one stone, almost bare: learn to scrape, put the lever under, lift
 *   pit2  one stone on a slant, its deep side under more earth: a lever under any other side presses it into the rock (it grinds, then
 *         knocks: the nail check finds the chip, pit.chip −20)
 *   pit3  three stones leaning one on the next: lift the free one first; lift one another rests on and that one slides and knocks
 * All on the world itself, with the left hand (rule 20):
 *   a drag on the earth scrapes it off the stone (the kohen sweeps it with the lever's tip; every stroke bares a little more, the stone
 *   shines wet) · a drag that starts on the lever's tip carries it, and let go at a bared lip (green) it goes under it · a press held on
 *   the stone or the lever lifts it (heavy: it moves late; let go and it sinks back slowly). The right thumb lifts the camera (rule 66):
 *   from above one sees where the stone is still held and who rests on whom.
 * The crew: two diggers with wooden spades throw the scraped earth onto the spoil; four carriers on the rim hoist each stone that comes
 * out with ropes onto the cradle, and at the work's end take the cradle up by its poles and carry it off toward the Mount (the film).
 * A knocked stone: on the cradle the thumb runs slowly along its rim (חולין יח ע"א, "כדי שתחגור בה צפורן"); it stops at the chip, the
 * light breaks, a click — the stone stays in the rejects' heap (world.js draws one there for each pit.chip mark, for good) and the crew
 * bares another in its place. The first work opens with "למטה מהבתולה" in simple words (the spec's own) over the pit's layered wall.
 * The rules: pit-model.js; the things: pit3d.js. Every place: BOOK.s08.pit.
 *   PIT_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act } · PLINES
 */
import { BOOK } from '../world/grid.js';
import { LINES, QUICK, LOSS, qOf, starsOf } from './model.js';
import { goPit, backFromPit, SH8, pitXYZ } from './world.js';
import { PIT, SIDES, sideDir, lipOf, halfOf, pitFresh, pitRead, scrape, seenSide, capOf, seat, wrongSide, pitStep, release, nailChip, chipOut, leftOf, doneOf, pitPts, pitClean } from './pit-model.js';
import { PD, W3, L2, pmats, stoneMesh, stonePose, stoneTop, lipW, leverMesh, leverSet, ringMesh, pitCradle, showFilm, filmStop, POLE_ENDS } from './pit3d.js';
import { createVoices } from '../h129/sound129.js';
import { card, cite, tapOr } from '../h129/ui7.js';
import { fingers, MOUSE } from '../h113/acts.js';
import { createGang, createBeat, clamp, lerp, ease } from '../h109/kit.js';

const S8 = BOOK.s08, P = S8.pit, F = PD.FLOOR;
const A3 = (lx, y, lz) => pitXYZ(lx, y, lz);
/** the act's own words (instructions: the lever and the layers are illustration) */
export const PLINES = Object.freeze({
  title: 'למטה מהבתולה',
  seen: 'במשחק רואים את זה: שכבה עליונה כהה ומעורבבת, ומתחתיה אדמה בהירה ונקייה.',
  l1: 'גרפו את האדמה מהאבן (המחשה)',
  l2: 'האבן באלכסון. מאיזה צד מרימים?',
  l3: 'מי חופשית? מי מחזיקה?',
  lever: 'גררו את קצה המנוף אל השפה',
  press: 'לחצו והחזיקו',
  held: 'עוד אדמה מחזיקה אותה',
  earth: 'השפה עוד באדמה',
  grind: 'נלחצת אל הסלע! עזבו',
  slide: 'השכנה מחליקה! עזבו',
  spared: 'שקעה חזרה. בלי נזק',
  nail: 'העבירו אגודל על השפה, לאט',
  chipped: 'פגומה: לערימת הפסולות',
  bare: 'הצוות חושף אבן אחרת',
  carry: 'הנושאים יוצאים אל ההר',
});
/** the act's numbers: a tap's most travel (px), how near a finger must start on the lever's tip (px), how near a lip the tip must be
 *  let go (× the stone's size), the scraping stroke's least step (amot), the thumb's most speed round the rim (turns a second) */
/** the hint hand's gesture on the screen (px) and the knock's buzz (ms) */
const HND = Object.freeze({ earth: { dx: 70, dy: 0 }, tip: { dx: 60, dy: -30 }, nail: { dx: 60, dy: 30 } }), HAP = Object.freeze({ knock: [28, 20, 28] });
const K = Object.freeze({ TAP: 14, TIP: 48, SEAT: 0.8, STEP: 0.35, THUMB: 0.32 });
/** the shots (sheet amot round the stone in hand): work — from the south-east above and behind, the kohen whole in the left third, the
 *  stone a third of the screen; lever — square to the lever's line, from the camera's side; check — the cradle close; FOV each */
const SHOT = Object.freeze({
  work: { back: 11, up: 13, turn: -0.85, mid: 0.45, aimY: 0.6, fov: 46, k3: 1.1 },   // (look round 131: nearer and lower — the men a fifth of the frame)
  lever: { D: 13.5, H: 10, fov: 48, mid: 3.2, aimY: 1.0 },   // (look round 131: at 20/18.5 the men fell to a tenth; the near rim still clear of the floor)   // (b131 part 3: farther back — at 13.5/16.5 the kohen stood large at the right; the mid a little toward him)
  rejects: { back: 9, up: 2.6, on: 12, aimY: 2.4, fov: 60, dir: [0.75, -0.66] },   // (dir: toward the low hills to the north-east, where the Mount lies)
  open: { from: [6, 3.5, 2], secs: 2.6, fov: 58 },   // (the opening eases in from a little back and higher: its first frame and its line's are not one picture)
  done: { eye: [-14.5, 4.5, -11.5], aim: [-9.5, 1.5, -2], fov: 50 },   // (from the north-west, behind the kohen on the rim: he is the frame's subject, the carriers at the cradle beyond him, not between)
  hoist: { D: 17.5, H: 9, aimY: -0.4, fov: 50, koh: [2, -6.5] },   // (look round 3b: from across the pit, due east of the cradle — the stone coming up the far wall toward the eye, the four at the cradle's ends pulling, none before it; the kohen aside, out of the picture)
  check: { eye: [2.2, 4.4, 3.6], aim: [0, 0.4, -0.2], fov: 40 },
});
/** where the kohen stands to scrape (from the stone: west and a little south, out past its west end) */
/** where the kohen stands on the rim through the work's film, looking after the carriers (המחשה) */
const KOH_FILM = [-9.5, -5.5];
const KOH = (s) => { const [hx] = halfOf(s); return [s.at[0] - hx - 1.9, s.at[1] + 1.15]; };

export const PIT_ACT = {
  icon: '⛏',
  title: 'הבור בבית כרם',
  walkLine: (m) => (m && m.lv === 3 ? 'הבור בבית כרם: שלוש אבנים נשענות' : m && m.lv === 2 ? 'הבור בבית כרם: אבן באלכסון' : 'יוצאים אל הבור בבקעת בית כרם'),
  /** on the Mount: the place the camera jumps from (north of the altar, by the pile from the pit) */
  stand() { const s = S8.stand.pit; return { x: s[0], z: s[1], face: [S8.pile[0], S8.pile[1]] }; },
  prepare() {},
  make(m, X) { return pitAct(m, X); },
};

function pitAct(m, X) {
  const T = X.THREE, Mo = X.M, lv = m.lv | 0 || 1, V = createVoices(X.sfx), PM = pmats(X);
  const A = { phase: 'open', t: 0, busy: 1, ev: [], fl: null, press: false, hint: null, lineK: '', tw: null, check: null, fresh: true, film: false, ended: false, errT: 0 };
  const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
  // ── the work in hand: the one a reload broke off (its stones' earth, those out, a check pending), or a fresh one
  let W = pitRead(Mo.workOf('pit'), lv);
  if (W) A.fresh = false; else W = pitFresh(lv, P.stones);
  const keep = () => { try { Mo.keep('pit', JSON.parse(JSON.stringify(W))); X.save(); } catch (e) { /* */ } };
  keep();
  const root = new T.Group(); root.name = 'h131-pit-act'; X.props.root.add(root);
  // ── the stones: those still in the ground in the pit; those raised whole beside the cradle (the row)
  const SG = new Map();
  const meshOf = (i) => SG.get(i);
  function stonesDraw() {
    W.stones.forEach((s, i) => {
      if (s.gone) { const g = SG.get(i); if (g) { X.props.remove(g); SG.delete(i); } return; }
      let g = SG.get(i); if (!g) { g = stoneMesh(X, s, root); SG.set(i, g); }
      if (s.out && !g.userData.moving) rowPlace(g, i);
      else if (!s.out && !g.userData.moving) stonePose(X, g, s, L.i === i && L.st === 'seat' ? L.side : null);
    });
  }
  const outIdx = (i) => W.stones.slice(0, i + 1).filter((q) => q.out).length - 1;
  function rowPlace(g, i) { const r = P.row[Math.max(0, Math.min(P.row.length - 1, outIdx(i)))], p = W3(r[0], 0, r[1]); g.position.set(p.x, p.y + g.userData.hy * 0.62, p.z); g.rotation.set(0, 0.4 * i, 0); g.userData.tip.position.set(0, 0, 0); g.userData.tip.rotation.set(0, 0, 0); g.userData.lift.rotation.set(0, 0, 0); g.userData.lift.position.set(0, 0, 0); g.userData.body.position.set(0, 0, 0); for (const q of g.userData.mounds) q.visible = false; }
  // ── the lever: lying in his hands (tip at rest before him), carried by the finger, or under a lip
  const L = { st: 'lie', i: null, side: null, tip: [0, 0], pt: 0, warn: 0 };
  const lever = leverMesh(X, root);
  const cur = () => { const i = L.st === 'seat' ? L.i : focusIdx(); return i >= 0 ? W.stones[i] : null; };
  /** the stone the hand is on: level 3 the stones in the book's order of what is left; else the one left */
  function focusIdx() { if (A.focus != null && W.stones[A.focus] && !W.stones[A.focus].out && !W.stones[A.focus].gone && !W.stones[A.focus].knock) return A.focus; const L0 = W.stones.findIndex((s) => !s.out && !s.gone && !s.knock); A.focus = L0 >= 0 ? L0 : null; return L0; }
  // ── the kohen: in the pit at the stone's west, the lever in both hands; under a lip he stands out past it, the lever on his shoulder side
  const kz = { at: [0, 0], to: [0, 0], face: [0, 0], tg: null };
  function kohenTo(p, face, snap) { const r = Math.hypot(p[0] - P.hole.at[0], p[1] - P.hole.at[1]), R = PD.R0 - 0.9; if (r > R) p = [P.hole.at[0] + (p[0] - P.hole.at[0]) * R / r, P.hole.at[1] + (p[1] - P.hole.at[1]) * R / r]; kz.to = p; kz.face = face; if (snap) kz.at = p.slice(); kz.tg = null; }
  function kohenStep(dt) {
    const k = 1 - Math.exp(-dt * 5); kz.at[0] += (kz.to[0] - kz.at[0]) * k; kz.at[1] += (kz.to[1] - kz.at[1]) * k;
    // (set only when he really moves: a set every frame cancels his grip on the lever)
    const w = W3(kz.at[0], 0, kz.at[1]), f = W3(kz.face[0], 0, kz.face[1]), yaw = Math.atan2(f.x - w.x, f.z - w.z);
    if (kz.set && Math.hypot(kz.set[0] - w.x, kz.set[1] - w.z) < 0.02 && Math.abs(kz.set[2] - yaw) < 0.01) return;
    kz.set = [w.x, w.z, yaw]; kz.tg = null;
    try { X.hero.setPos(w.x, w.z, yaw); } catch (e) { /* */ }
  }
  const handFb = () => { const w = W3(kz.at[0], 0, kz.at[1]), f = W3(kz.face[0], 0, kz.face[1]), d = Math.hypot(f.x - w.x, f.z - w.z) || 1; return { x: w.x + (f.x - w.x) / d * 0.75, y: X.ground(w.x, w.z) + 1.75, z: w.z + (f.z - w.z) / d * 0.75 }; };
  let handP = null;
  function holdLever(lean) {
    // (both hands on the bar a little toward the tip: the hero's rope grip; its hands' point is where the bar passes)
    const hp = handFb(), tp = tipW();
    if (!kz.tg) kz.tg = { x: 0, y: 0, z: 0 };
    kz.tg.x = hp.x + (tp.x - hp.x) * 0.3; kz.tg.y = hp.y + (tp.y - hp.y) * 0.3; kz.tg.z = hp.z + (tp.z - hp.z) * 0.3;
    try { handP = X.hero.rope ? X.hero.rope(kz.tg, 0.55, lean) : null; } catch (e) { handP = null; }
    if (!handP || !Number.isFinite(handP.x) || Math.hypot(handP.x - hp.x, handP.z - hp.z) > 2.5) handP = hp;
  }
  function tipW() {
    if (L.st === 'seat') { const s = W.stones[L.i]; return lipW(s, L.side, s.rise); }
    return W3(L.tip[0], F + 0.12, L.tip[1]);
  }
  function restTip(s) { if (!s) return kz.at.slice(); const d = [s.at[0] - kz.at[0], s.at[1] - kz.at[1]], n = Math.hypot(d[0], d[1]) || 1, [hx] = halfOf(s); const k = Math.max(1.3, n - hx - 2.0); return [kz.at[0] + d[0] / n * k, kz.at[1] + d[1] / n * k]; }
  function leverDraw() {
    const tp = tipW(); holdLever(L.st === 'seat' ? (A.press ? 0.95 : 0.45) : 0.2);
    let ful = null; if (L.st === 'seat') { const s = W.stones[L.i], d = sideDir(L.side, s.yaw), p = lipOf(s, L.side); ful = W3(p[0] + d[0] * 0.75, F + 0.18, p[1] + d[1] * 0.75); }
    leverSet(X, lever, tp, handP, ful);
  }
  // ── the green marks: where the lever's tip may go (rule 59), shown while the lever is carried
  const greens = [];
  function greensShow(on) {
    for (const g of greens) g.visible = false; if (!on) return;
    let n = 0;
    W.stones.forEach((s) => { for (let k = 0; k < 4; k++) if (seenSide(s, k)) { let g = greens[n]; if (!g) { g = new T.Mesh(new T.RingGeometry(0.32, 0.5, 20), PM.y8pGreen); g.rotation.x = -Math.PI / 2; g.renderOrder = 5; root.add(g); greens.push(g); } const p = lipW(s, k, 0); g.position.set(p.x, F + 0.06 + (p.y - (F + 0.18)) * 0, p.z); g.position.y = W3(0, F + 0.07, 0).y; g.visible = true; n++; } });
  }
  // ── the crew: two diggers with wooden spades in the pit, four carriers on the rim round the cradle
  const B = createBeat(X), gang = createGang(X);
  const digs = P.diggers.map((p, k) => { const w = W3(p[0], 0, p[1]), r = Math.hypot(p[0], p[1]) || 1, f = W3(p[0] / r * (PD.R0 + 3), 0, p[1] / r * (PD.R0 + 3)); return gang.add(w.x, w.z, { role: 'pick', item: 'spade', fx: f.x, fz: f.z, k: 2, off: k * 0.5, crew: k }); });
  /** the diggers by the stone in hand (beyond it from the camera, on its east), each throwing toward the rim nearest him */
  // (look round 131 #3, the figure gate: from the opening's eye on the east they stood between it and the stone — hidden. They stand
  //  beyond the stone from the eye of the shot in hand, one at each shoulder of it)
  let digEye = A3(...P.cam.open[0]);   // (the work opens on the book's view)
  function diggersTo(s, snap) {
    if (!s) return; const [hx] = halfOf(s);
    let ax = 1, az = 0; if (digEye) { const e = L2(digEye[0], digEye[2]); ax = s.at[0] - e[0]; az = s.at[1] - e[1]; const n = Math.hypot(ax, az) || 1; ax /= n; az /= n; }
    digs.forEach((w, k) => {
      if (!w) return; const sd = k ? 1 : -1; let p = [s.at[0] + ax * (hx + 1.7) - az * sd * 1.9, s.at[1] + az * (hx + 1.7) + ax * sd * 1.9]; const r = Math.hypot(p[0], p[1]), R = PD.R0 - 1.0; if (r > R) p = [p[0] * R / r, p[1] * R / r];
      const n = Math.hypot(p[0], p[1]) || 1, f = W3(p[0] / n * (PD.R0 + 3), 0, p[1] / n * (PD.R0 + 3)), q = W3(p[0], 0, p[1]);
      if (snap) { w.a.x = q.x; w.a.z = q.z; gang.setRole(w, 'pick', { fx: f.x, fz: f.z }); return; }
      gang.setRole(w, 'walk', { fx: null }); Promise.race([gang.walkTo(w, q.x, q.z, 2.6), X.wait(3)]).then(() => { if (!A.ended) gang.setRole(w, 'pick', { fx: f.x, fz: f.z }); });
    });
  }
  /** the diggers out of the world for the hoist and the check (not needed there; the hoist's side look cut them at its edge), back for the next stone */
  function digsOut() { for (let k = 0; k < digs.length; k++) if (digs[k]) { offStage(digs[k]); gang.remove(digs[k]); digs[k] = null; } }
  function digsIn() {
    if (A.phase === 'done' || digs.every(Boolean)) return;
    for (let k = 0; k < digs.length; k++) if (!digs[k]) { const p = P.diggers[k], w = W3(p[0], 0, p[1]); digs[k] = gang.add(w.x, w.z, { role: 'pick', item: 'spade', fx: w.x, fz: w.z, k: 2, off: k * 0.5, crew: k }); }
    diggersTo(cur(), true);
  }
  const cr0 = W3(P.cradle[0], 0, P.cradle[1]);
  const carr = P.carriers.map(() => null);   // (out until the first hoist: carrIn)
  const ropes = [0, 1, 2, 3].map(() => { const r = X.props.rope(10, 0.045); r.show(false); return r; });
  const handW = (w, v) => { const AC = X.actors && X.actors(); try { if (AC && AC.handWorld) return AC.handWorld(w.a, 1, v || new T.Vector3()); } catch (e) { /* */ } return (v || new T.Vector3()).set(w.a.x, w.a.y + 1.4, w.a.z); };
  // ── the camera
  const cam0 = X.camera, fov0 = cam0.fov; let fovT = SHOT.work.fov;
  const lens = (f) => { try { cam0.fov = f; cam0.updateProjectionMatrix(); } catch (e) { /* */ } };
  const lensStep = (dt) => { try { const Lk = X.lookNow ? X.lookNow() : null; if (Lk && (Lk.u > 0.01 || Math.abs(Lk.yaw) > 0.03 || Lk.ov)) return; const f = cam0.fov; if (Math.abs(f - fovT) > 0.01) lens(Math.abs(f - fovT) < 0.05 ? fovT : f + (fovT - f) * (1 - Math.exp(-dt * 4))); } catch (e) { /* */ } };
  let shotK = '';
  /** the work's shot round the stone in hand (level 3: round the three, a little back) */
  function workShot(d = 0.9) {
    const s = cur(); if (!s) return;
    const c = lv === 3 ? clusterC() : s.at, kp = KOH(s), S = SHOT.work, k = lv === 3 ? S.k3 : 1;
    // (from behind him: back along the line from the stone to him, turned toward the south so he stands left of the stone)
    let bx = kp[0] - c[0], bz = kp[1] - c[1]; const n = Math.hypot(bx, bz) || 1; bx /= n; bz /= n;
    const mid = [c[0] + (kp[0] - c[0]) * S.mid, c[1] + (kp[1] - c[1]) * S.mid];
    // (look round 131: the turn toward the side away from the cradle — nearer, its carriers stood cut at the frame's edge)
    const turnOf = (t) => { const ca = Math.cos(t), sa = Math.sin(t); return [bx * ca - bz * sa, bx * sa + bz * ca]; };
    const far = (e) => Math.hypot(mid[0] + e[0] * S.back * k - P.cradle[0], mid[1] + e[1] * S.back * k - P.cradle[1]);
    let [ex, ez] = turnOf(S.turn); { const o = turnOf(-S.turn); if (far(o) > far([ex, ez]) + 2) [ex, ez] = o; }
    lookOff(); shotTo(A3(mid[0] + ex * S.back * k, F + S.up * k, mid[1] + ez * S.back * k), A3(mid[0], F + S.aimY, mid[1]), d);
    fovT = S.fov; shotK = 'work'; carrOut(); digsIn(); lever.visible = true;
  }
  // ── the carriers (the figure rule: a figure is in the picture only when the step needs him, whole, working with his tool in hand;
  // otherwise he is out for that step): through the opening, the work, the lever and the nail check they are not in the world at all
  // (on the rim they were cut at the frame's edge or stood between the eye and the stone); they come in at their places round the
  // cradle with the cut to the hoist, ropes in hand, and stay for the done frame and the film
  const carrHome = P.carriers.map((p) => W3(p[0], 0, p[1]));
  /** one who leaves goes at once, not fading out in the next picture (the gate saw him there for its fade) */
  const offStage = (w) => { try { const q = W3(P.hole.at[0], 0, P.hole.at[1] + 400); w.a.path = null; w.a.x = q.x; w.a.z = q.z; } catch (e) { /* */ } };
  function carrOut() {
    for (let k = 0; k < carr.length; k++) if (carr[k]) { offStage(carr[k]); gang.remove(carr[k]); carr[k] = null; }
    for (const r of ropes) r.show(false);
  }
  function carrIn(role, o) {
    carr.forEach((w, k) => {
      if (!w || !w.a.alive) { carr[k] = gang.add(carrHome[k].x, carrHome[k].z, { role, item: 'rope', fx: o.fx, fz: o.fz, k: o.k, crew: 2 + (k % 2) }); return; }
      w.a.path = null; w.a.x = carrHome[k].x; w.a.z = carrHome[k].z; gang.setRole(w, role, { fx: o.fx, fz: o.fz, k: o.k });
    });
  }
  function clusterC() { const L0 = W.stones.filter((s) => !s.gone); const n = L0.filter((s) => !s.out); const Q = n.length ? n : L0; return [Q.reduce((a, s) => a + s.at[0], 0) / Q.length, Q.reduce((a, s) => a + s.at[1], 0) / Q.length]; }
  /** square to the lever's line, from the camera's (south) side: the kohen at one end, the stone at the other, neither before the other */
  function leverShot(d = 0.9) {
    const S = SHOT.lever, s = W.stones[L.i]; const dd = sideDir(L.side, s.yaw), mid = [s.at[0] + dd[0] * S.mid, s.at[1] + dd[1] * S.mid];
    let px = -dd[1], pz = dd[0]; if (pz < 0 || (Math.abs(pz) < 0.2 && px > 0)) { px = -px; pz = -pz; }
    // (look round 131: from the side away from the cradle — nearer, the cradle and its carriers stood cut in the foreground)
    { const c = P.cradle, e1 = Math.hypot(mid[0] + px * S.D - c[0], mid[1] + pz * S.D - c[1]), e2 = Math.hypot(mid[0] - px * S.D - c[0], mid[1] - pz * S.D - c[1]); if (e2 > e1 + 2) { px = -px; pz = -pz; } }
    lookOff(); shotTo(A3(mid[0] + px * S.D, F + S.H, mid[1] + pz * S.D), A3(mid[0], F + S.aimY, mid[1]), d);
    fovT = S.fov; shotK = 'lever'; carrOut(); lever.visible = true;
  }
  function checkShot(d = 1.0) { const c = P.cradle, S = SHOT.check; carrOut(); lookOff(); shotTo(A3(c[0] + S.eye[0], S.eye[1], c[1] + S.eye[2]), A3(c[0] + S.aim[0], S.aim[1], c[1] + S.aim[2]), d); fovT = S.fov; shotK = 'check'; }
  /** a feedback word's place on the screen: at the thing, but never on the kohen — over his head when it would fall on him; inside the
   *  frame, clear of the top bar (look round 131: the combo word sat on him) */
  function qAt(w) {
    const p = X.scr(w.x, w.y, w.z); if (!p || !Number.isFinite(p.x)) return w;
    const k = W3(kz.at[0], F, kz.at[1]), hd = X.scr(k.x, k.y + 4.2, k.z), ft = X.scr(k.x, k.y, k.z);
    let x = p.x, y = p.y;
    if (hd && ft && Number.isFinite(hd.y) && Math.abs(x - hd.x) < 130 && y > hd.y - 50 && y < ft.y + 20) y = hd.y - 56;
    const H = (globalThis.innerHeight || 600), Wd = (globalThis.innerWidth || 960);
    y = Math.max(130, Math.min(H - 110, y)); x = Math.max(90, Math.min(Wd - 90, x));
    return { sx: x, sy: y };
  }
  /** (look round 131 #2: a look lifted earlier — the right thumb's, kept across the act's shots — turned the lever and hoist shots into
   *  straight top-downs over his turban: each composed shot of the act starts level with its own eye) */
  /** every move of the act's camera (look round 131 #2): X.shot eases the eye along a straight line, so a move to the other side of
   *  the work passed right over it — the frames in the middle of the ease looked straight down on his turban (the stage run shoots at
   *  the move's start; a still after the ease never saw it). A move that turns round the aim by more than ~65° is a cut; each shot's
   *  eye, aim and angle from the vertical are logged (__PIT_CAM, dbg().cam) */
  function shotTo(p, t, d) {
    let cut = false;
    try {
      const c = cam0.position, v0x = c.x - t[0], v0z = c.z - t[2], v1x = p[0] - t[0], v1z = p[2] - t[2], n0 = Math.hypot(v0x, v0z), n1 = Math.hypot(v1x, v1z);
      if (n0 > 0.5 && n1 > 0.5 && (v0x * v1x + v0z * v1z) / (n0 * n1) < Math.cos(1.13)) cut = true;
    } catch (e) { /* */ }
    X.shot(p, t, cut ? 0.01 : d);
    { const was = digEye; digEye = p.slice(); if (A.phase === 'open' || A.phase === 'work') { const s0 = cur(); if (s0 && !s0.out && (!was || Math.hypot(was[0] - p[0], was[2] - p[2]) > 4)) diggersTo(s0, false); } }
    try {
      const ang = Math.round(Math.atan2(Math.hypot(p[0] - t[0], p[2] - t[2]), p[1] - t[1]) * 180 / Math.PI);
      const L = globalThis.__PIT_CAM || (globalThis.__PIT_CAM = []); L.push({ id: m.id, k: shotK, eye: p.map((v) => +v.toFixed(1)), aim: t.map((v) => +v.toFixed(1)), ang, cut }); if (L.length > 60) L.shift();
    } catch (e) { /* */ }
  }
  /** the camera's real angle from the vertical now, in degrees (0: straight down) */
  const camAng = () => { try { const v = new T.Vector3(); cam0.getWorldDirection(v); return Math.round(Math.acos(Math.max(-1, Math.min(1, -v.y))) * 180 / Math.PI); } catch (e) { return null; } };
  const lookOff = () => { try { if (X.lookZero) X.lookZero(); } catch (e) { /* */ } };
  // ── the fingers
  const scrPt = (w) => { const r = X.scr(w.x, w.y, w.z); return r; };
  function floorAt(p) { const r = X.rayAt(p.x, p.y).ray, d = r.direction, o = r.origin, y = W3(0, F + 0.1, 0).y; if (Math.abs(d.y) < 1e-4) return null; const t = (y - o.y) / d.y; if (t < 0) return null; const q = L2(o.x + d.x * t, o.z + d.z * t); return Math.hypot(q[0] - P.hole.at[0], q[1] - P.hole.at[1]) <= PD.R0 + 0.2 ? q : null; }
  const nearTip = (p) => { const q = scrPt(tipW()); return q.on !== false && Math.hypot(q.x - p.x, q.y - p.y) < K.TIP; };
  function onStone(p, i) { const g = meshOf(i); if (!g) return false; const c = scrPt(stoneTop(g, new T.Vector3())), s = W.stones[i], e = scrPt(W3(s.at[0] + halfOf(s)[0], F + 0.6, s.at[1])); const r = Math.max(40, Math.hypot(e.x - c.x, e.y - c.y) * 1.25); return Math.hypot(c.x - p.x, c.y - p.y) < r; }
  function tipNearer(p, i) { const g = meshOf(i); if (!g) return true; const c = scrPt(stoneTop(g, new T.Vector3())), q = scrPt(tipW()); return Math.hypot(q.x - p.x, q.y - p.y) < Math.hypot(c.x - p.x, c.y - p.y); }
  function onLever(p) { const a = scrPt(tipW()), b = scrPt(handP || handFb()); const vx = b.x - a.x, vy = b.y - a.y, L0 = vx * vx + vy * vy || 1; const u = clamp(((p.x - a.x) * vx + (p.y - a.y) * vy) / L0, 0, 1.2); return Math.hypot(p.x - (a.x + vx * u), p.y - (a.y + vy * u)) < 44; }
  const FG = fingers(X, {
    down(f) {
      if (A.fl != null || A.busy) return;
      if (A.phase === 'check') { A.fl = f.id; f.w = { mode: 'nail', ang: thumbAng(f) }; X.hand(null); return; }
      if (A.phase !== 'work') return;
      // (seated: a touch on the stone or the bar presses; it takes the tip only when it is nearer the tip than the stone's middle — at the
      //  lever shot's distance a level 3 stone is small on the screen, and its middle lay inside the tip's reach: a press became a drag)
      if (L.st === 'seat' && (onStone(f, L.i) || onLever(f)) && !(nearTip(f) && tipNearer(f, L.i))) { A.fl = f.id; f.w = { mode: 'press' }; A.press = true; X.hand(null); ev('press'); return; }
      if (L.st === 'seat') { try { const g = meshOf(L.i), c = scrPt(stoneTop(g, new T.Vector3())), t = scrPt(tipW()); ev('miss:' + Math.round(f.x - c.x) + ',' + Math.round(f.y - c.y) + ' tip' + Math.round(f.x - t.x) + ',' + Math.round(f.y - t.y) + ' cam' + camAng()); } catch (e) { /* */ } }
      if (nearTip(f)) { A.fl = f.id; f.w = { mode: 'lever', last: floorAt(f) }; if (L.st === 'seat') unseat(true); L.st = 'held'; greensShow(true); X.hand(null); V.scrape(0.2); ev('lever'); return; }
      const q = floorAt(f); if (!q) return;
      A.fl = f.id; f.w = { mode: 'scrape', last: q }; if (L.st === 'seat') unseat(true); L.st = 'held'; L.tip = q.slice(); X.hand(null); ev('scrape');
    },
    move(f) {
      const w = f.w; if (!w || A.fl !== f.id) return;
      if (w.mode === 'press' && f.moved > 60 && !onStone(f, L.i) && !onLever(f)) { A.press = false; relNow(); w.mode = 'void'; return; }
      if (w.mode === 'nail') { thumbMove(f, w); return; }
      const q = floorAt(f) || (w.mode === 'lever' ? clampFloor(f) : null); if (!q) return;
      L.tip = q.slice();
      // (the tip sweeps the earth wherever it goes: carried to a lip, it scrapes on the way too)
      if (!w.last) w.last = q;
      { const d = Math.hypot(q[0] - w.last[0], q[1] - w.last[1]); if (d >= K.STEP) { stroke(w.last, q); w.last = q; } }
    },
    up(f) {
      const w = f.w; if (!w || A.fl !== f.id) return; A.fl = null; V.scrape(0);
      // (the stroke's last bit, shorter than a step, still sweeps: a short stroke on a small screen is a whole one)
      if ((w.mode === 'lever' || w.mode === 'scrape') && w.last) { const q = floorAt(f); if (q && Math.hypot(q[0] - w.last[0], q[1] - w.last[1]) > 0.04) { stroke(w.last, q); w.last = q; } }
      if (w.mode === 'press') { A.press = false; relNow(); return; }
      if (w.mode === 'nail') return;
      if (w.mode === 'lever') { greensShow(false); trySeat(); if (L.st !== 'seat' && shotK !== 'work') workShot(0.9); return; }
      if (w.mode === 'scrape') { L.st = 'lie'; L.tip = restTip(cur()); if (shotK !== 'work') workShot(0.9); hintNext(); }
    },
  });
  function clampFloor(f) { const r = X.rayAt(f.x, f.y).ray, d = r.direction, o = r.origin, y = W3(0, F + 0.1, 0).y; if (Math.abs(d.y) < 1e-4) return null; const t = (y - o.y) / d.y; if (t < 0) return null; const q = L2(o.x + d.x * t, o.z + d.z * t), n = Math.hypot(q[0], q[1]), R = PD.R0 - 0.3; return n > R ? [q[0] * R / n, q[1] * R / n] : q; }
  // ── a scraping stroke: the earth off the sides it passes; dust where it took; the lip that shows now, a word
  function stroke(a, b) {
    const r = scrape(W, a, b);
    if (r.took > 0.004) {
      const p = W3(b[0], F + 0.3, b[1]); X.dust(p.x, p.y, p.z, 4 + Math.round(r.took * 30), 1.4); V.scrape(Math.min(1, 0.3 + r.took * 3)); V.dust();
      try { X.hero.act && X.hero.act('pull', p, { snap: true }); } catch (e) { /* */ }
      for (const [i, k] of r.bared) { const s = W.stones[i], q = lipW(s, k, 0); X.quick(qAt({ x: q.x, y: q.y + 0.6, z: q.z }), QUICK.clean, meshOf(i)); ev('bared:' + i + SIDES[k]); }
      for (const i of r.freed) { ev('loose:' + i); }
      if (W.strokes % 3 === 0) digNow(b);
      keep(); stonesDraw();
    }
  }
  /** a digger takes the earth away where it was scraped (he throws it onto the spoil on the rim) */
  function digNow(at) { const w = digs[at[0] < 0 ? 0 : 1]; if (!w) return; const p = W3(at[0], 0, at[1]); X.wait(0.4).then(() => { if (A.ended) return; X.dust(p.x, p.y + F + 0.4, p.z, 3, 1.2); }); }
  // ── the lever under a lip
  function trySeat() {
    let best = null;
    W.stones.forEach((s, i) => { if (s.out || s.gone || s.knock) return; for (let k = 0; k < 4; k++) { if (s.block.includes(k)) continue; const p = lipOf(s, k), d = Math.hypot(p[0] - L.tip[0], p[1] - L.tip[1]); if (d < K.SEAT * s.r * 1.25 && (!best || d < best.d)) best = { i, k, d }; } });
    if (!best) { L.st = 'lie'; L.tip = restTip(cur()); hintNext(); return; }
    const r = seat(W, best.i, best.k);
    if (!r.ok) { L.st = 'lie'; L.tip = restTip(cur()); V.bump(); X.line(r.why === 'earth' ? PLINES.earth : PLINES.lever, 2200); ev('seat-no:' + best.i + SIDES[best.k] + ':' + r.why); return; }
    L.st = 'seat'; L.i = best.i; L.side = best.k; L.pt = 0; L.warn = 0; A.focus = best.i;
    const s = W.stones[best.i], d = sideDir(best.k, s.yaw), lp = lipOf(s, best.k);
    kohenTo([lp[0] + d[0] * 3.4, lp[1] + d[1] * 3.4], s.at);
    V.knock(1.4); ev('seat:' + best.i + SIDES[best.k] + (r.wrong ? ':wrong' : ''));
    leverShot(0.9); hintNext(true);
  }
  /** the lever out from under its lip (noCam: under a finger — the camera waits for it to lift, rule 17) */
  function unseat(noCam) { if (L.st !== 'seat') return; const r = release(W, L); if (r) spared(); L.st = 'lie'; L.i = null; L.side = null; kohenTo(KOH(cur() || W.stones[0]), (cur() || W.stones[0]).at); if (!noCam) workShot(0.9); }
  function relNow() { const r = release(W, L); if (r) spared(); A.heldSaid = 0; hintNext(true); }
  function spared() { X.line(PLINES.spared, 2400); ev('spared'); keep(); }
  // ── the step of the lift (every frame)
  function liftStep(dt) {
    const evs = pitStep(W, dt, L.st === 'seat' ? L : null, A.press && L.st === 'seat');
    const s = L.st === 'seat' ? W.stones[L.i] : null;
    if (s && A.press) { V.creak(s.rise > 0 ? 0.3 + s.rise * 0.6 : 0.15); } else V.creak(0);
    for (const e of evs) {
      if (e.e === 'held' && !A.heldSaid) { A.heldSaid = 1; X.line(PLINES.held, 2600); heldDust(s); ev('held:' + e.i); }
      if (e.e === 'grind') { X.line(PLINES.grind, 2600); V.groan(); X.shake(0.1, 0.12); const q = lipW(W.stones[e.i], (W.stones[e.i].deep ?? 1), 0); X.dust(q.x, q.y, q.z, 10, 1.6); ev('grind'); }
      if (e.e === 'slide') { X.line(PLINES.slide, 2600); V.groan(); V.dust(); const g = meshOf(e.j); if (g) X.dust(g.position.x, g.position.y + 0.5, g.position.z, 8, 1.5); ev('slide:' + e.j); }
      if (e.e === 'chip' || e.e === 'knock') knocked(e.e === 'chip' ? e.i : e.j);
      if (e.e === 'free') freed(e.i);
    }
    if (s && A.press && s.rise > 0 && (A.t * 6 | 0) !== A.dT) { A.dT = A.t * 6 | 0; const q = lipW(s, L.side, s.rise); X.dust(q.x, q.y - 0.1, q.z, 1, 0.6); }
  }
  function heldDust(s) { if (!s) return; for (let k = 0; k < 4; k++) if (!s.block.includes(k) && s.cover[k] > PIT.FREE) { const q = lipW(s, k, 0); X.dust(q.x, q.y + 0.2, q.z, 7, 1.2); } }
  // ── a stone out whole: the word, the flash, a small shake as it leaves the earth; the carriers hoist it onto the cradle
  async function freed(i) {
    A.busy = 1; A.press = false; A.heldSaid = 0; const s = W.stones[i], g = meshOf(i);
    const at = stoneTop(g, new T.Vector3());
    X.quick(qAt({ x: at.x, y: at.y + 0.6, z: at.z }), QUICK.whole, g); X.shake(0.14, 0.22); try { if (X.haptic) X.haptic(25); } catch (e) { /* */ }
    V.thud(); X.dust(at.x, at.y - 0.4, at.z, 18, 2.2); ev('free:' + i);
    L.st = 'lie'; L.i = null; L.side = null; keep();
    await hoist(i, 'row');
    A.busy = 0; afterStone();
  }
  // ── a knocked stone: a sharp shake and a dry sound; hoisted onto the cradle for the nail check
  async function knocked(i) {
    A.busy = 1; A.press = false; L.st = 'lie'; L.i = null; L.side = null;
    const g = meshOf(i), at = g ? stoneTop(g, new T.Vector3()) : W3(0, F, 0);
    V.crack(); X.shake(0.22, 0.4); try { if (X.haptic) X.haptic(HAP.knock); } catch (e) { /* */ }
    X.dust(at.x, at.y, at.z, 16, 2); ev('knock:' + i);
    stonesDraw(); keep();
    await X.wait(0.9);
    await hoist(i, 'cradle');
    nailCheck(i);
  }
  /** the four on the rim hoist the stone with ropes: across the floor to under them, up the wall, over onto the cradle (to: 'cradle'),
   *  and a stone raised whole on on to its place in the row beside it (to: 'row') */
  async function hoist(i, to) {
    const g = meshOf(i), s = W.stones[i]; if (!g) return;
    g.userData.moving = 1; X.hand(null);
    const c = P.cradle, dc = Math.hypot(c[0], c[1]) || 1, foot = [c[0] / dc * (PD.R0 - 1.3), c[1] / dc * (PD.R0 - 1.3)], top = [c[0] / dc * (PD.R0 + 0.4), c[1] / dc * (PD.R0 + 0.4)];
    const y0 = g.position.y, hy = g.userData.hy;
    const from = g.position.clone(), a = W3(foot[0], F + hy * 0.62, foot[1]), b = W3(top[0], hy * 0.62 + 1.4, top[1]), cc = W3(c[0], 0.48 + hy * 0.62, c[1]);
    // (the camera: the cradle and the rim's crew in the frame, the stone coming up the wall)
    // (the cut to the hoist: the four at their places round the cradle, ropes in hand, pulling — whole in the frame with the stone
    //  coming up the wall; look round 3b: the camera stayed on the lever while they walked in out of the frame)
    carrIn('pull', { fx: from.x, fz: from.z, k: 2 });
    // (the eye across the pit, due east of the cradle: its four stand 2.6 north and south of it, so from there the stone's way up the
    //  wall and onto the cradle runs between them — none of them before it, in the plain look or the lifted one)
    const HS = SHOT.hoist, ex = c[0] + HS.D, ez = c[1];
    // (the kohen is not the hoist's doer: he steps aside to the pit's north side, out of this picture, and watches; the lever lies out
    //  of the picture till his next stone)
    kohenTo([P.hole.at[0] + HS.koh[0], P.hole.at[1] + HS.koh[1]], foot, true); kohenStep(1); lever.visible = false;
    A.hoistG = g;
    const cs = A3(ex, HS.H, ez), ca = A3(top[0] - 1.2, HS.aimY, top[1]);   // (the aim at the wall's lip; the lens wide enough for the four whole above it and the stone in the pit below from its first pull)
    digsOut(); lookOff(); shotTo(cs, ca, 0.01); fovT = HS.fov; lens(HS.fov); shotK = 'hoist';
    await X.wait(0.5);
    const legs = [[from, a, 1.6], [a, b, 1.5], [b, cc, 1.1]];
    for (const [p, q, d] of legs) await tween(g, p, q, d, s);
    for (const r of ropes) r.show(false);
    A.hoistG = null;
    for (const w of carr) gang.setRole(w, 'hold', { fx: cr0.x + 4, fz: cr0.z });
    V.knock(1.2); X.dust(cc.x, cc.y - 0.4, cc.z, 10, 1.6);
    if (to === 'row') {
      await X.wait(0.35);
      const n = outIdx(i), r = P.row[Math.max(0, Math.min(P.row.length - 1, n))], q = W3(r[0], hy * 0.62, r[1]);
      await tween(g, g.position.clone(), q, 0.9, s, true);
      g.userData.moving = 0; rowPlace(g, i);
    }   // (one on the cradle stays there, still 'moving': the earth's pose would put it back in the pit — the nail check takes it)
    void y0;
  }
  function tween(g, p, q, d, s, noRope) {
    return new Promise((res) => { A.tw = { g, p, q, d, t: 0, res, s, noRope }; });
  }
  function tweenStep(dt) {
    const w = A.tw; if (!w) return;
    w.t += dt; const u = Math.min(1, w.t / w.d), k = ease(u);
    w.g.position.set(lerp(w.p.x, w.q.x, k), lerp(w.p.y, w.q.y, k) + (w.noRope ? Math.sin(u * Math.PI) * 0.5 : 0), lerp(w.p.z, w.q.z, k));
    const U = w.g.userData; U.tip.rotation.x *= 0.9; U.tip.rotation.z *= 0.9; U.lift.rotation.set(0, 0, 0); U.lift.position.set(0, 0, 0); U.body.position.set(0, 0, 0); U.tip.position.y = 0; for (const q of U.mounds) q.visible = false;
    if (!w.noRope) carr.forEach((c, k) => { if (!c) return; const h = handW(c), sx = (k < 2 ? 1 : -1) * U.hx * 0.7, sz = (k % 2 ? 1 : -1) * U.hz * 0.7; ropes[k].set(h, { x: w.g.position.x + sx, y: w.g.position.y + U.hy * 0.4, z: w.g.position.z + sz }, 0.08); ropes[k].show(true); c.fx = w.g.position.x; c.fz = w.g.position.z; });
    if (u >= 1) { A.tw = null; w.res(); }
  }
  // ── the nail check on the cradle: the thumb along the rim, slowly; it stops at the chip, the light breaks, a click
  function nailCheck(i) {
    const g = meshOf(i); g.userData.moving = 1; A.phase = 'check'; A.busy = 1; W.check = i; keep();
    const c = W3(P.cradle[0], 0.48 + g.userData.hy * 0.62, P.cradle[1]); g.position.set(c.x, c.y, c.z); g.rotation.set(0, 0, 0);
    checkShot(0.01);   // (a cut from the hoist: the carriers leave with it)
    const ring = ringMesh(X, g); A.check = { i, g, ring, u: 0, a0: null, stop: false, chipU: nailChip(), last: null };
    X.line(LINES.nail, 0);
    X.wait(1.1).then(() => { if (A.phase !== 'check') return; A.busy = 0; X.line(PLINES.nail, 0); const p = ringPt(0.02); X.hand(p, HND.nail.dx, HND.nail.dy); });
    ev('check:' + i);
  }
  function ringPt(u) { const C = A.check, U = C.g.userData, a = u * Math.PI * 2 + startA(), v = new T.Vector3(Math.cos(a) * U.hx, U.hy * 0.62, Math.sin(a) * U.hz); C.g.localToWorld(v); return { x: v.x, y: v.y, z: v.z }; }
  /** the rim's start: its point nearest the camera (the thumb starts before the eye and goes round) */
  function startA() { return Math.PI / 2; }
  function thumbAng(f) { const C = A.check; if (!C) return 0; const c = scrPt(C.g.getWorldPosition(new T.Vector3())); return Math.atan2(f.y - c.y, f.x - c.x); }
  function thumbMove(f, w) {
    const C = A.check; if (!C || C.stop) return;
    const a = thumbAng(f); let d = a - w.ang; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; w.ang = a;
    // (round either way; slowly: the thumb never runs ahead of its pace)
    const now = performance.now() / 1000, dtw = C.last ? Math.min(0.2, now - C.last) : 0.05; C.last = now;
    const du = Math.min(Math.abs(d) / (Math.PI * 2), K.THUMB * Math.max(dtw, 0.016) * 1.5);
    C.u = Math.min(C.chipU, C.u + du);
    const segs = C.ring.userData.segs, n = segs.length, lit = Math.floor(C.u * n);
    for (let k = 0; k < n; k++) segs[k].visible = k < lit;
    V.scrape(0.15);
    if (C.u >= C.chipU - 1e-6) chipFound();
  }
  async function chipFound() {
    const C = A.check; if (C.stop) return; C.stop = true; A.busy = 1; A.fl = null; V.scrape(0); X.hand(null);
    const segs = C.ring.userData.segs, k = Math.floor(C.chipU * segs.length); for (let j = k; j < Math.min(segs.length, k + 2); j++) { segs[j].material = PM.y8pDark; segs[j].visible = true; }
    V.knock(2.2); X.shake(0.12, 0.25); ev('chip-found:' + C.i);
    await X.wait(0.6);
    const s = W.stones[C.i], at = ringPt(C.chipU);
    const p = Mo.mark('pit.chip', m.id, [+s.at[0].toFixed(2), +s.at[1].toFixed(2)], Mo.marksOf('pit.chip').length);
    chipOut(W, C.i); keep();
    X.loss(p, at, LOSS['pit.chip'][0]); X.line(PLINES.chipped, 2600);
    await X.wait(1.6);
    // (to the rejects' heap: the core draws one more stone there for the mark; the camera shows it there)
    X.props.remove(C.ring); X.props.remove(C.g); SG.delete(C.i); A.check = null;
    // (along the opening's look — toward the low hills to the north-east (P.cam.open) — gently down onto the heap: the skyline and the sky in the frame)
    const rj = P.rejects, RS = SHOT.rejects, ux = RS.dir[0], uz = RS.dir[1];
    shotTo(A3(rj[0] - ux * RS.back, RS.up, rj[1] - uz * RS.back), A3(rj[0] + ux * RS.on, RS.aimY, rj[1] + uz * RS.on), 0.8); fovT = RS.fov; shotK = 'rejects';
    await X.wait(1.0); const rp = W3(rj[0], 0.8, rj[1]); X.dust(rp.x, rp.y, rp.z, 12, 1.8); V.knock(1.6);
    await X.wait(1.2);
    // (the crew bares another in its place)
    X.line(PLINES.bare, 2400); A.phase = 'work'; A.focus = null; stonesDraw();
    const ni = W.stones.length - 1, ng = meshOf(ni); if (ng) { const q = ng.position; X.dust(q.x, q.y + 0.4, q.z, 14, 2); }
    kohenTo(KOH(cur()), cur().at); L.tip = restTip(cur()); diggersTo(cur()); workShot(1.0);
    await X.wait(1.0);
    A.busy = 0; hintNext(true);
  }
  // ── after a stone: the next, or the end
  function afterStone() {
    if (doneOf(W)) { finish(); return; }
    A.focus = null; const s = cur(); kohenTo(KOH(s), s.at); L.tip = restTip(s); diggersTo(s); workShot(1.0); hintNext(true);
  }
  // ── the hint (rule 25: one short line, one hand)
  function hintNext(force) {
    if (A.busy || A.phase !== 'work') return;
    const s = cur(); if (!s) return; const i = W.stones.indexOf(s);
    let k = 'scrape';
    if (L.st === 'seat') k = 'press';
    else if (SIDES.some((_, j) => seenSide(s, j)) && (W.lv !== 1 || capOf(s) >= 1 || s.cover.every((v, j) => s.block.includes(j) || v <= PIT.SEEN))) k = 'lever';
    if (!force && k === A.hint) return; A.hint = k;
    const lvLine = lv === 1 ? PLINES.l1 : lv === 2 ? PLINES.l2 : PLINES.l3;
    if (k === 'scrape') {
      if (A.lineK !== 'lv') { A.lineK = 'lv'; X.line(lvLine, 5000); }
      // (level 1 the hand on the earth over the side most held; later levels no hand: help falls away, rule 34)
      if (lv === 1) { let j = 0; for (let q = 1; q < 4; q++) if (s.cover[q] > s.cover[j]) j = q; const p = lipW(s, j, 0); X.hand({ x: p.x, y: p.y + 0.2, z: p.z }, HND.earth.dx, HND.earth.dy); } else X.hand(null);
    } else if (k === 'lever') { X.line(PLINES.lever, 4000); A.lineK = 'lever'; if (lv === 1) { const t = tipW(); X.hand(t, HND.tip.dx, HND.tip.dy); } else X.hand(null); }
    else { X.line(PLINES.press, 3000); A.lineK = 'press'; const g = meshOf(L.i); if (g && lv === 1) X.hand(stoneTop(g, new T.Vector3()), 0, 0); else X.hand(null); }
    void i;
  }
  // ── the end of the work
  function finish() {
    if (A.phase === 'done') return; A.phase = 'done'; A.busy = 1; X.hand(null);
    // (the work's last picture before its film: the opening's composition — the pit, the kohen in it, the crew at the cradle, the row)
    // (he climbs out to the north-west rim, where the film keeps him; the eye from the south: the cradle, the row, the carriers, him beyond)
    { try { if (X.hero.rope) X.hero.rope(null); const st = W3(KOH_FILM[0], 0, KOH_FILM[1]), c = W3(P.cradle[0], 0, P.cradle[1]); X.hero.setPos(st.x, st.z, Math.atan2(c.x - st.x, c.z - st.z)); } catch (e) { /* */ }
      digsOut();   // (their work is over: they leave, not hidden in the frame; the done shot below is a cut, so the gate reads it and not the hoist's frame on the way)
      carrOut();   // (the done frame is the kohen's: the four come back with the film, at the cradle's poles)
      const D = SHOT.done; lookOff(); shotTo(A3(...D.eye), A3(...D.aim), 0.01); fovT = D.fov; shotK = 'done'; for (const r of ropes) r.show(false); root.remove(lever); }
    const pts = pitPts(W), q = qOf(pts), clean = pitClean(W), s0 = W.stones.filter((s) => s.out);
    const res = { stars: starsOf(q), q, pts, perfect: clean, flags: { 'pit.chip': W.dmg, slip: W.mis, out: s0.length },
      at: (() => { const c = W3(P.cradle[0], 1.2, P.cradle[1]); return c; })(), film: filmOf() };
    keep();
    X.wait(0.6).then(() => X.end(res));
  }
  /** the work's film: the four take the cradle up by its poles, the last stone raised on it, and carry it off on the road toward the
   *  Mount; the camera high over the pit looking east-north-east, down the valley to the hills on the horizon */
  function filmOf() {
    // (look round 131: close on the carriers — beside them as they lift the cradle and set off, then ahead of them on the road, the
    //  valley and the hills beyond; at 26 high the men were a tenth of the frame)
    const c = P.cradle, r1 = P.road[1], r2 = P.road[2];
    const shots = [
      [A3(c[0] - 7.5, 5.5, c[1] + 3.5), A3(c[0] + 0.5, 0.9, c[1] + 2.5), 3.0],
      [A3(r1[0] - 6, 5, r1[1] + 5.5), A3(r1[0] + 4, 0.9, r1[1] + 1), 3.6],
    ];
    return { shots, secs: 6.6, own: () => [...carr].filter(Boolean).map((w) => w.a), after: () => clearAll() };
  }
  let cleared = false;
  function clearAll() {
    if (cleared) return; cleared = true;
    filmStop(); FG.detach(); V.stop(); X.hand(null); lens(fov0);
    try { if (X.hero.rope) X.hero.rope(null); } catch (e) { /* */ }
    for (const r of ropes) { try { r.dispose(); } catch (e) { /* */ } }
    gang.clear(); X.props.remove(root);
    const cr = pitCradle(); if (cr) { const c = W3(P.cradle[0], 0, P.cradle[1]); cr.position.set(c.x, c.y, c.z); cr.rotation.set(0, 0, 0); }
    backFromPit(X);
    // (look round 3b B2: the film's last eye stayed down the valley at the pit, and the walk's follow camera eased from there to the
    //  kohen back in the court through the haze — the walk's first picture an empty grey; the eye is set over him at once)
    try { const h = X.heroAt ? X.heroAt() : null; if (h && Number.isFinite(h.x) && X.view && X.view.camSet) X.view.camSet(h.x + 10, (h.y || 0) + 18, h.z + 10, h.x, (h.y || 0) + 1, h.z); } catch (e) { /* */ }
  }
  // ── the opening: the valley, the pit and its crew, the hills to the horizon toward the Mount (BOOK.s08.pit.cam.open); "למטה מהבתולה"
  async function opening() {
    const C = P.cam.open, O = SHOT.open;
    X.shot(A3(C[0][0] + O.from[0], C[0][1] + O.from[1], C[0][2] + O.from[2]), A3(...C[1]), 0.01); fovT = O.fov; lens(O.fov); shotK = 'open';
    X.wait(0.4).then(() => { if (!A.ended && shotK === 'open') X.shot(A3(...C[0]), A3(...C[1]), O.secs); });
    X.line(LINES.place, 0);
    await tapOr(X, 2600);
    if (A.ended) return;
    if (lv === 1 && A.fresh && !Mo.st.pit.betula) {
      // (the layered wall in the frame: the dark mixed top, the pale clean virgin soil under it)
      const s = W.stones[0], a = s.at; lookOff(); shotTo(A3(a[0] + 14, F + 9.5, a[1] + 5), A3(a[0] - 4, F + 1.6, a[1] - 1), 1.2);   // (from outside the east rim: inside it the eye stood over his turban) fovT = 48;
      await X.wait(1.2); if (A.ended) return;
      X.line('', 0);
      await card(X, `<b style="font:900 20px Heebo,system-ui">${PLINES.title}</b>${cite(LINES.middot34)}<p style="margin:8px 0">${LINES.betula}</p><small style="display:block;margin-top:6px">${PLINES.seen} ${LINES.ill}</small>`, 11000);
      try { Mo.st.pit.betula = 1; X.save(); } catch (e) { /* */ }
      if (A.ended) return;
    }
    X.line('', 0);
  }
  async function start() {
    goPit(X);
    try { X.kohen(true); if (X.hero.setTool) X.hero.setTool('wood'); } catch (e) { /* */ }
    const s = cur() || W.stones[0]; kohenTo(KOH(s), s.at, true); L.tip = restTip(s); kohenStep(1); diggersTo(s, true);
    stonesDraw(); leverDraw();
    await opening(); if (A.ended) return;
    if (W.check != null && W.stones[W.check] && W.stones[W.check].knock) {
      // (a reload during the nail check: the stone back on the cradle, the check again)
      const i = W.check, g = meshOf(i); if (g) { g.userData.moving = 1; nailCheck(i); return; }
    }
    if (doneOf(W)) { finish(); return; }
    workShot(1.2); await X.wait(1.0); if (A.ended) return;
    A.phase = 'work'; A.busy = 0; hintNext(true);
  }
  // String helpers on the plain points W3 returns
  return {
    close: true, kohenWorks: true,
    begin() { FG.attach(); start().catch((e) => console.warn('[h131] pit start', e && e.message)); },
    update(dt) {
      A.t += dt; lensStep(dt);
      try {
        V.frame(); B.step(dt); gang.update(dt, B);
        tweenStep(dt);
        if (A.phase === 'work' && !A.busy) liftStep(dt);
        else if (A.phase === 'work') pitStep(W, dt, null, false);
        if (A.phase !== 'done') kohenStep(dt);
        W.stones.forEach((s, i) => { const g = meshOf(i); if (g && !s.out && !g.userData.moving && !s.gone) stonePose(X, g, s, L.st === 'seat' && L.i === i ? L.side : null); });
        if (L.st === 'lie' && A.fl == null) { const t = restTip(cur()); L.tip[0] += (t[0] - L.tip[0]) * Math.min(1, dt * 4); L.tip[1] += (t[1] - L.tip[1]) * Math.min(1, dt * 4); }
        if (A.phase !== 'done') leverDraw();
      } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h131] pit', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
    },
    down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
    cancel() { if (A.fl != null) { A.fl = null; if (A.press) { A.press = false; relNow(); } greensShow(false); V.scrape(0); if (L.st === 'held') { L.st = 'lie'; } } },
    // (rule 66: on the right half a touch is the act's only on the stones, the lever, the cradle's stone in the check; elsewhere the camera)
    wants(p) {
      if (!p) return true; if (A.busy) return false;
      if (A.phase === 'check') { const C = A.check; if (!C) return false; const c = scrPt(C.g.getWorldPosition(new T.Vector3())); return Math.hypot(c.x - p.x, c.y - p.y) < 160; }
      if (A.phase !== 'work') return false;
      if (nearTip(p) || (L.st === 'seat' && onLever(p))) return true;
      if (W.stones.some((s, i) => !s.out && !s.gone && onStone(p, i))) return true;
      const q = floorAt(p); return !!q && W.stones.some((s) => !s.out && !s.gone && !s.knock && Math.hypot(q[0] - s.at[0], q[1] - s.at[1]) < halfOf(s)[0] + 2.4);
    },
    holds() { return A.fl != null; },
    end(res) {
      A.ended = true; X.line('');
      try { for (const c of document.querySelectorAll('.h129-card')) c.remove(); } catch (e) { /* */ }   // (b131 fix round 1: the betula card goes with the work, never over the next)
      const film = res && res.film && A.phase === 'done';
      if (!film) { clearAll(); return; }
      // the film: the last stone raised onto the cradle, the four at the poles
      FG.detach(); V.stop(); X.hand(null);
      try { if (X.hero.rope) X.hero.rope(null); } catch (e) { /* */ }
      for (const r of ropes) r.show(false);
      root.remove(lever); greensShow(false);
      const outs = W.stones.map((s, i) => [s, i]).filter(([s]) => s.out), last = outs.length ? meshOf(outs[outs.length - 1][1]) : null;
      const cr = pitCradle();
      // (the kohen on the rim at the stand, looking after them)
      // (look round 131: at the book's stand on the south rim he stood before the film's eye, cut; on the north-west rim he is whole in
      //  the done frame and out of the carriers' shots)
      try { const st = W3(KOH_FILM[0], 0, KOH_FILM[1]), c = W3(P.cradle[0], 0, P.cradle[1]); X.hero.setPos(st.x, st.z, Math.atan2(c.x - st.x, c.z - st.z)); } catch (e) { /* */ }
      // (look round 131 #2: the stones already in the row stood large and cut in the film's foreground; the film is the carriers and the one they carry)
      for (const [, i] of outs) { const g = meshOf(i); if (g && g !== last) g.visible = false; }
      carrIn('hold', { fx: cr0.x + 4, fz: cr0.z, k: 1 });
      if (cr) showFilm(X, { gang, men: carr.filter(Boolean), stone: last, cradle: cr });
    },
    at() { if (A.hoistG && A.phase !== 'done') { const g = A.hoistG; return new T.Vector3(g.position.x, g.position.y + (g.userData.hy || 1) * 0.5, g.position.z); }
      if (A.phase === 'done') { const k = W3(KOH_FILM[0], 1.6, KOH_FILM[1]); return new T.Vector3(k.x, k.y, k.z); }
      const s = A.phase === 'check' && A.check ? null : cur(); const g = s ? meshOf(W.stones.indexOf(s)) : null; if (g) return stoneTop(g, new T.Vector3()); const c = W3(P.cradle[0], 1, P.cradle[1]); return new T.Vector3(c.x, c.y, c.z); },
    dbg() {
      const sp = (w) => { const r = X.scr(w.x, w.y, w.z); return [Math.round(r.x), Math.round(r.y)]; };
      const o = { id: m.id, lv, phase: A.phase, busy: A.busy, mouse: MOUSE, ev: A.ev.slice(-10), shot: shotK, lever: L.st, li: L.i, side: L.side != null ? SIDES[L.side] : null, warn: L.warn, press: A.press,
        cam: camAng(), mis: W.mis, dmg: W.dmg, pts: pitPts(W), out: W.nOut, left: leftOf(W).length, check: W.check, fresh: A.fresh, nf: FG.n };
      try {
        o.tip = sp(tipW());
        o.stones = W.stones.map((s, i) => {
          if (s.gone) return { i, gone: 1 };
          const g = meshOf(i), q = { i, out: s.out, knock: s.knock, cover: s.cover.map((v) => +v.toFixed(2)), cap: +capOf(s).toFixed(2), rise: +s.rise.toFixed(2), slide: +s.slide.toFixed(2), lean: s.lean, deep: s.deep != null ? SIDES[s.deep] : null, block: s.block.map((k) => SIDES[k]) };
          if (g && !s.out) { q.c = sp(stoneTop(g, new T.Vector3())); q.lips = [0, 1, 2, 3].map((k) => sp(lipW(s, k, 0))); q.out2 = [0, 1, 2, 3].map((k) => { const d = sideDir(k, s.yaw), p = lipOf(s, k); return sp(W3(p[0] + d[0] * 1.6, F + 0.1, p[1] + d[1] * 1.6)); }); q.seen = [0, 1, 2, 3].map((k) => seenSide(s, k) ? 1 : 0); q.wrong = [0, 1, 2, 3].map((k) => (wrongSide(W, s, k) ? 1 : 0)); q.holds = W.stones.some((t) => !t.out && !t.gone && t.lean === i) ? 1 : 0; }
          return q;
        });
        if (A.check) { o.ring = []; for (let k = 0; k <= 24; k++) o.ring.push(sp(ringPt(k / 24))); o.thumb = +A.check.u.toFixed(2); o.ringC = sp(A.check.g.getWorldPosition(new T.Vector3())); }
        try { const h = X.hero, hp = h && h.mesh ? h.mesh.position : null; if (hp) o.kohen = [sp(hp), sp({ x: hp.x, y: hp.y + 3.9, z: hp.z })]; } catch (e) { /* */ }
        o.crew = gang.list.map((w) => sp({ x: w.a.x, y: w.a.y + 1.5, z: w.a.z }));
      } catch (e) { o.err = e.message; }
      return o;
    },
  };
}
void POLE_ENDS; void SH8; void PD; void filmStop; void Array;
