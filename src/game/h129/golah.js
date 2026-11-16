/* ── build 129 ── h129/golah.js — station 2, "לשכת הגולה, שני הדליים" (brief §5, spec station 2): the well, the wheel, the two buckets
 * on one rope, the trough by the well, the channel and its sluice stones, the troughs in the court. Three works (model.js GOLAH_LV):
 *   golah1  the water 10 amot down, one trough (A)            golah2  20 down, two troughs (A, C)     golah3  30 down, three (A, B, C)
 * A trip: a finger held on the rope of the bucket in the water fills it; then the rope is pulled hand over hand (a downward stroke on the
 * rope each pull: on a phone the left thumb and the right in turn, the crew man on that side hauls with it; with a mouse one drag after
 * another, the two men in turn). A pull as the bucket swings through the middle calms the swing ("בקצב!"); one at the swing's end feeds
 * it: it knocks the shaft (water out), hard enough it cracks (golah.bucket). Half way the empty bucket comes down past it: the player
 * waits for the swing to die ("חלפו!"), or they clash. It comes up swinging hard: a rim stone breaks (golah.rim); still: "בלי טיפה!".
 * At the rim the bucket is dragged over the trough by the well and tipped (the drag past it is the tilt); the water runs down the
 * channel, and the sluice stones (drag up: open, down: closed) share it among the troughs; one filled past its brim floods
 * (golah.flood: a puddle stays). Each full: "מלאה!". All full together: a kohen stands at the first and washes his hands over it.
 * No gauge, no bar, no timer, no fail: the troughs' own water lines are the measure.
 *
 * It plays inside the water look's own scene (golah3d.js, play mode: the approved water, its sample's stage), drawn in place of the
 * Mount (main.js renderFrame's hook, as stage 06's sea); its camera reads the right thumb's look (X.lookNow) and the director's
 * world camera is kept on the Golah (so the act plays while the look is small). Its figures (the two haulers, the kohen at the end)
 * are its own (golah3d's figure layer). Every place is the book's (BOOK.s07.golah, .cam).
 */
import * as THREE from 'three';
import { LINES, QUICK, LOSS, GOLAH, GOLAH_LV, CHANNEL, H129, golahFresh, fillStep, pullStep, golahStep, pourStep, sluiceSet, emptyY, periodNow, channelWater, golahPts, lossPts, qOf, starsOf } from './model.js';
import { golahInWorld, LINE_D } from './golah3d.js';
import { setBusy, own, rebuild } from './world.js';
import { createVoices } from './sound129.js';
import { card, cite, holdLens } from './ui7.js';
import { fingers, MOUSE } from '../h113/acts.js';
import { gripR } from '../h109/grips.js';
import { BOOK } from '../world/grid.js';

const S7 = BOOK.s07, GL = S7.golah, CAM = S7.cam, F0 = GL.floor, [WX, WZ] = GL.well, AXLE = F0 + GL.wheel.axle, WR = GL.wheel.R + 0.04;
const LINE_Z = [WZ - H129.ROPE_OFF, WZ + H129.ROPE_OFF];   // (bucket 0 hangs on the north line, bucket 1 on the south: golah3d's rope)
const [HX, HZ] = GL.head, HB = F0 + 0.15, HH = GL.headSize[2], TS = GL.troughSize, CW = GL.channel.w;
// the bucket below its bail (golah3d's): its bottom, its body's middle, its rim, its radius; its bottom clear of the rim when it is up
const B_BOT = 1.32, B_MID = 0.92, B_RIM = 0.52, B_R = 0.5, BOT1 = F0 + GL.rimH + 0.35;
const G = 20.4;                  // gravity, amot/s²
const SWING_K = 1.8, SWING_MAX = GL.shaftR - B_R - 0.02;   // (the model's swing, amot, as the bucket's sideways place: 1.1 reaches the wall)
const OVER = [HX, F0 + 3.0, HZ + 1.0], TILT = 1.85;          // (the bucket's body over the trough by the well; its full tip, radians)
const MAIN_U0 = GL.headSize[1] / 2;                          // (the channel's drawn line starts at the trough's outlet: the model's d − this)
const DRY_V = 4.2;
const DEG = Math.PI / 180;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const sm = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
const L3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const NAME = { A: 'א', B: 'ב', C: 'ג' };
// (the kohen at the moment, G11: standing on the pavement at the trough's end, bent a little from the waist, both arms forward and in
//  so the hands meet over its water — 1.05 amot before his feet, 1.75 over the floor; they rub as the water runs off them into it)
const WASH = { bow: 0.5, pitch: 1.0, spread: -0.3, rub: 0.07, far: 1.7, hold: 2.8 };   // (far: the troughs glinting before the cut to him; hold: his picture clear before any card)
export const GLINES = Object.freeze({
  fill: 'החזיקו את החבל של הדלי שבמים: הדלי מתמלא',
  pull: MOUSE ? 'גררו את החבל כלפי מטה, שוב ושוב · משיכה כשהדלי עובר באמצע מרגיעה את הנדנוד' : 'משכו את החבל כלפי מטה, יד אחר יד: אגודל שמאל ואגודל ימין לסירוגין · משיכה כשהדלי עובר באמצע מרגיעה את הנדנוד',
  meet: 'הדליים עומדים להיפגש: חכו שהנדנוד ישכך',
  rim: 'גררו את הדלי אל השוקת שליד הבור, והמשיכו לגרור כדי להטות אותו',
  share: 'אבני הסכר: גררו אבן למעלה לפתוח, למטה לסגור · כל שוקת מקבלת את המים שעוברים בה',
  back: 'נגיעה במקום ריק חוזרת אל הבור',
  golah1: 'מלאו את שוקת א', golah2: 'מלאו את שוקת א ואת שוקת ג, כל אחת כמידתה', golah3: 'מלאו את שלוש השקתות, כל אחת כמידתה',
  wash: 'השקתות מלאות: הכהן נוטל ידיו',
});

/* ═════════════ the station in the world (build 129 G5): golah3d's things in the built world's scene at their book places (golah3d
 * golahInWorld) — the Azarah's floor, walls and gate houses, the House, the Mount and the sky round it at every lift; the world's
 * camera, the director's look and overview ═════════════ */
const GS = { S: null, X: null, act: null };
function golahUp(X) {
  const S = golahInWorld(X); if (!S) return null;
  GS.S = S; GS.X = X; own('golah', 1); try { rebuild(X, true); } catch (e) { /* */ } S.scene.visible = true;
  return S;
}
function golahDown(X) { own('golah', 0); try { rebuild(X, true); } catch (e) { /* */ } }
const v4 = new THREE.Vector3();
function scrOf(x, y, z) { const c = GS.X.camera; c.updateMatrixWorld(); v4.set(x, y, z).project(c); return { x: (v4.x + 1) / 2 * innerWidth, y: (1 - v4.y) / 2 * innerHeight, on: v4.z < 1 && v4.z > -1 }; }
/** a short fade over the whole frame (a cut between two views that no camera move joins) */
function fadeEl() {
  let d = document.getElementById('h129-fade');
  if (!d) { d = document.createElement('div'); d.id = 'h129-fade'; d.style.cssText = 'position:fixed;inset:0;background:#120D08;opacity:0;pointer-events:none;z-index:40'; document.body.appendChild(d); }
  return d;
}

export const GOLAH_ACT = {
  icon: '🪣', title: 'לשכת הגולה',
  walkLine: (m) => 'לשכת הגולה: ' + (m && m.id === 'golah3' ? 'שלושים אמה, שלוש שקתות' : m && m.id === 'golah2' ? 'עשרים אמה, שתי שקתות' : 'הבור והגלגל'),
  stand() { const s = GL.stand; return { x: s[0], z: s[1], face: [GL.well[0], GL.well[1]] }; },
  prepare() {},
  make(m, X) {
    const Mo = X.M, st = Mo.st, V = createVoices(X.sfx), id = m.id, LV = GOLAH_LV[id], KS = Object.keys(LV.troughs);
    const S = golahUp(X); if (!S) throw new Error('no renderer');
    const P = S.play, Q = P.P, AC = Q.actors;
    st.golah = st.golah || { troughs: {} };
    // ── the model: a fresh level, or the one saved in the middle of it (the troughs' water, the bucket whose turn it is)
    const s = golahFresh(id);
    const run = st.golah.run && st.golah.run.id === id ? st.golah.run : null;
    const mine = Mo.marksOf().filter((q) => q.work === id);
    for (const q of Mo.marksOf('golah.bucket')) if (q.n === 0 || q.n === 1) s.cracked[q.n] = 1;   // (a cracked bucket stays cracked: it drips)
    if (run) {
      for (const k of KS) if (run.tr && run.tr[k] != null) s.troughs[k].v = run.tr[k];
      s.head = Math.max(0, +run.w || 0); if (run.sl) for (const k of KS) s.sluice[k] = run.sl[k] ? 1 : 0; s.trip = run.trip | 0;
      s.b = run.b | 0; s.knocks = run.knocks | 0; s.clashes = run.clashes | 0; s.perfect = run.perfect | 0;
      for (const q of mine) { s.dmg += lossPts(q.f, id); (s.flags[q.f] = s.flags[q.f] || []).push(q.n); if (q.f === 'golah.rim') s.rim = 1; if (q.f === 'golah.flood' && s.troughs[q.n]) { s.troughs[q.n].flood = 1; s.puddles.push(q.n); } }
    }
    // ── the marks that stay: broken rim stones, cracked buckets, puddles (every level's)
    const rimBroken = () => Mo.marksOf('golah.rim').map((q) => q.n).filter((n) => Number.isInteger(n));
    P.rim(rimBroken());
    for (const i of [0, 1]) if (s.cracked[i]) P.crack(i);
    for (const q of Mo.marksOf('golah.flood')) if (GL.troughs[q.n]) P.puddle(q.n);
    // ── the act's own state
    const A = {
      ph: 'intro', t: 0, ev: [], view: null, fading: null, share: false, look: { u: 0, yaw: 0, ov: false },
      bot: [null, null], wheel: 0, lastBot: null, f0: 0, carry: 0, tilt: 0, tiltT: 0, back: 0, drops: [], rings: { well: [], head: [], tr: {} },
      main: { wetTo: 0, wetTail: -1 }, spur: {}, sl: {}, pullT: -9, dribT: -9, lastSide: 1, haul: [0, 0], lines: {}, meetSaid: -1, busy: 0, errT: -9,
    };
    for (const k of Object.keys(GL.sluice)) { A.spur[k] = { wetTo: 0, wetTail: -1 }; A.sl[k] = 0; A.rings.tr[k] = []; }
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
    const say = (k, ms = 5200) => { if (A.lines[k]) return; A.lines[k] = 1; X.line(GLINES[k], ms); };
    // ── the haulers: two men on the plank over the mouth, either side of the ropes, each holding the line that goes down
    const crew = GL.crew.map((p, i) => { const a = AC.add('pilgrim', p[0], p[1], { col: i ? '#6E7A5A' : '#8C6E4A', col2: '#E8E0CC', fadeIn: false, y: F0 + GL.rimH + GL.plank.h }); a.vis = a.visT = 1; a.fixedY = F0 + GL.rimH + GL.plank.h; return a; });
    const ropeM = new THREE.MeshStandardMaterial({ color: '#8C6A43', roughness: 0.7 }), ropeG = new THREE.CylinderGeometry(0.035, 0.035, 1, 5); ropeG.translate(0, 0.5, 0);
    const tails = crew.map(() => { const r = new THREE.Mesh(ropeG, ropeM); r.frustumCulled = false; S.scene.add(r); return r; });
    AC.setCamera(X.camera);
    let kohen = null;
    // ── the buckets' places
    const wellY = F0 - s.depth;
    const swingX = () => clamp(SWING_K * s.A * Math.sin(s.ph), -SWING_MAX, SWING_MAX);
    const botIn = (f) => wellY - 0.15 - 0.55 * f;   // (the bucket in the water: it floats empty, sinks as it fills)
    function targets() {
      const full = s.b, emp = 1 - s.b, T = [0, 0];
      if (s.phase === 'fill') { T[full] = botIn(s.f); T[emp] = BOT1; }
      else if (s.phase === 'pull') { T[full] = BOT1 + (s.y / s.depth) * (botIn(A.f0) - BOT1); T[emp] = BOT1 + (emptyY(s) / s.depth) * (botIn(0) - BOT1); }
      else { T[full] = BOT1; T[emp] = botIn(0); }
      return T;
    }
    const lineX = (i) => WX + (i === s.b ? swingX() : -0.5 * swingX());
    const bailOf = (mid, tilt) => [mid[0], mid[1] + B_MID * Math.cos(tilt), mid[2] + B_MID * Math.sin(tilt)];
    const local = (mid, tilt, lx, ly, lz) => { const b = bailOf(mid, tilt), c = Math.cos(tilt), sn = Math.sin(tilt); return [b[0] + lx, b[1] + ly * c - lz * sn, b[2] + ly * sn + lz * c]; };
    /** the body's middle and tilt of bucket i now (the full one carried to the trough by the well and tipped, the poured one coming back) */
    function bodyOf(i) {
      const hang = [lineX(i), A.bot[i] + B_BOT - B_MID, LINE_Z[i]];
      const c = i === s.b && s.phase === 'rim' ? A.carry : i !== s.b && A.back > 0 ? A.back : 0;
      if (c <= 0) return { mid: hang, tilt: 0 };
      const mid = L3(hang, OVER, c); mid[1] += 0.5 * Math.sin(Math.PI * c) * (i === s.b ? 1 : 0);
      return { mid, tilt: -TILT * (i === s.b ? A.tilt : A.back * A.tiltBack) };
    }
    // ── the screen: the ropes (each line from the wheel down to its bail), the bucket at the rim, the trough by the well, the stones
    const ropePts = (i) => { const b = bodyOf(i), bl = bailOf(b.mid, b.tilt), top = [WX, AXLE, LINE_Z[i]], out = []; for (let k = 0; k <= 12; k++) { const u = k / 12; out.push(scrOf(lerp(top[0], bl[0], u), lerp(top[1], bl[1], u), lerp(top[2], bl[2], u))); } return out; };
    function ropeDist(p, i) {
      const R = ropePts(i); let d = 1e9, at = null;
      for (let k = 0; k + 1 < R.length; k++) {
        const a = R[k], b = R[k + 1]; if (!a.on || !b.on) continue;
        const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy, u = L2 > 1 ? clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / L2, 0, 1) : 0, x = a.x + dx * u, y = a.y + dy * u, e = Math.hypot(p.x - x, p.y - y);
        if (e < d) { d = e; at = { x, y }; }
      }
      return { d, at };
    }
    const RG = () => Math.max(40, gripR() * 0.5);   // (the rope's band, either side: 80 px and more across)
    const ropeD = (p) => Math.min(ropeDist(p, 0).d, ropeDist(p, 1).d);
    const onRope = (p) => s.phase !== 'rim' && A.ph === 'play' && A.view === 'shaft' && ropeD(p) < RG();
    const bucketScr = () => { const b = bodyOf(s.b); return scrOf(b.mid[0], b.mid[1], b.mid[2]); };
    const onBucket = (p) => { if (s.phase !== 'rim' || A.ph !== 'play' || s.f <= 0) return false; const q = bucketScr(); return q.on && Math.hypot(p.x - q.x, p.y - q.y) < Math.max(48, gripR() * 0.6); };
    const slAt = (k) => { const [x, z] = GL.sluice[k], h = A.sl[k]; return scrOf(x, F0 + 0.35 + h * 0.85, z - CW / 2 - 0.1); };
    const slNear = (p) => { if (A.ph !== 'play') return null; let best = null; for (const k of KS) { const q = slAt(k); if (!q.on || q.x < 0 || q.y < 0 || q.x > innerWidth || q.y > innerHeight) continue; const d = Math.hypot(p.x - q.x, p.y - q.y); if (d < Math.max(36, gripR() * 0.42) && (!best || d < best.d)) best = { k, d }; } return best; };
    const onSluice = (p) => { const b = slNear(p); return b ? b.k : null; };
    // ── the camera: the world's (X.track; the director's look lifts it from here, its overview flies over the Mount). The shaft from the
    //    kohen's stand, tilted down into it (the wheel at the top, the rope down to the bucket); the pour through the door, the trough by
    //    the well and trough A beyond; the troughs from the court, as close as they all go in; the moment. Between the far view and the
    //    others no camera move joins them (a wall, the floor): a cut with a short fade
    const shaftView = () => {
      const c = CAM.golahShaft, E = c.eye, by = bodyOf(s.b).mid[1], rimY = F0 + GL.rimH, H = E[1] - rimY, D = Math.max(0.5, rimY - by);
      // (the eye comes in over the mouth as the bucket is deeper, so the line to it passes inside the rim)
      const ox = E[0] - WX, oz = E[2] - WZ, o = Math.hypot(ox, oz), k = clamp((c.mouth * (D + H)) / (D * o), 0.35, 1);
      return { eye: [WX + ox * k, E[1], WZ + oz * k], aim: [WX + c.aim[0], Math.max(lerp(by, AXLE, c.aim[1]), F0 - c.aim[2]), lerp(WZ, LINE_Z[s.b], 0.5)] };
    };
    const shareView = () => {
      const c = CAM.golahShare, xs = KS.map((k) => GL.troughs[k][0]), x0 = Math.min(...xs), x1 = Math.max(...xs), as = innerWidth / Math.max(1, innerHeight);
      const hw = (x1 - x0) / 2 + TS[0] / 2 + c.m, d = Math.max(c.dmin, hw / (as * Math.tan((CAM.golahFov / 2) * DEG))), el = c.el * DEG, aim = [(x0 + x1) / 2, F0 + c.y, c.z];
      return { eye: [aim[0], aim[1] + d * Math.sin(el), aim[2] - d * Math.cos(el)], aim };
    };
    const VIEWS = { shaft: shaftView, pour: () => ({ eye: CAM.golahPour[0], aim: CAM.golahPour[1] }), far: shareView, wash: () => ({ eye: CAM.golahWash[0], aim: CAM.golahWash[1] }) };
    function viewNow() {
      if (A.ph === 'moment' || A.ph === 'done') return A.washOn ? 'wash' : 'far';
      if (s.phase === 'rim' || A.back > 0) return 'pour';
      return A.share ? 'far' : 'shaft';
    }
    const cuts = (a, b) => a !== b && (a === 'far' || b === 'far' || b === 'wash');
    function snapTo(v) { const w = VIEWS[v](); try { X.shot(w.eye, w.aim, 0.01); } catch (e) { /* */ } }
    function camStep(dt, snap) {
      try { if (X.lookNow) A.look = X.lookNow(); } catch (e) { /* */ }
      // (the lens held every frame, as the other stations hold theirs: set once at the start, x1's run after a reload found it at 32° in the pour view, the bucket below the frame)
      holdLens(X, CAM.golahFov);
      const want = viewNow();
      if (!A.view || snap) { A.view = want; A.fading = null; snapTo(want); return; }
      if (want !== A.view && A.fading !== want) {
        if (cuts(A.view, want)) {
          // (the fade: dark in 0.16 s, the camera put there, light again in 0.22 s — by the page's clock, so it ends while the act waits)
          A.fading = want; const d = fadeEl(); d.style.transition = 'opacity 0.16s linear'; d.style.opacity = '1'; A.fades = (A.fades || 0) + 1;
          clearTimeout(A.fadeTo); A.fadeTo = setTimeout(() => { if (A.fading) { A.view = A.fading; A.fading = null; snapTo(A.view); } d.style.transition = 'opacity 0.22s linear'; d.style.opacity = '0'; }, 170);
        } else A.view = want;
      }
      const w = VIEWS[A.view](); try { X.track(w.eye, w.aim, 3); } catch (e) { /* */ }
    }
    // ── the fingers: on the rope (a hold fills, a stroke down pulls), on the bucket at the rim (carry and tip), on a sluice stone (up / down)
    const strokePx = () => Math.max(24, innerHeight * 0.045);
    // (the look away — the director's wait: no work is done then, and a second finger, which comes from the window, takes no grip)
    const away = () => { try { const L = X.lookNow && X.lookNow(); return !!(L && (L.play === false || L.ov)); } catch (e) { return false; } };
    const FG = fingers(X, {
      down(f) {
        if (A.ph !== 'play' || away()) return;
        // (the nearest grip takes the press: a stone's grip never shadows the rope beside it — build 129 G5, the rope answers always)
        const sl = slNear(f), rd = onRope(f) ? ropeD(f) : 1e9;
        if (sl && sl.d <= rd) { f.sl = sl.k; f.y1 = f.y; X.hand(null); return; }
        if (onBucket(f)) { f.carry = 1; const q = bucketScr(); f.off = [q.x - f.x, q.y - f.y]; f.c0 = A.carry; X.hand(null); return; }
        if (rd < 1e9) { f.rope = 1; f.yA = f.y; f.side = MOUSE ? (A.lastSide = -A.lastSide) : (f.x < ropeX() ? -1 : 1); X.hand(null); }
      },
      move(f) {
        if (away()) return;
        if (f.sl) { const dy = f.y - f.y1; if (Math.abs(dy) > Math.max(18, innerHeight * 0.03)) { const open = dy < 0; if (!!s.sluice[f.sl] !== open) { sluiceSet(s, f.sl, open); V.thud(); ev((open ? 'open:' : 'shut:') + f.sl); saveRun(); } f.y1 = f.y; } return; }
        if (f.carry) { carryTo(f); return; }
        if (f.rope && !f.pulled && f.y - f.yA > strokePx()) { f.pulled = 1; pull(f.side); }
      },
      up(f) {
        if (f.carry) { A.tiltT = 0; A.tiltTo = 0; }
        // (the far view: a tap where no stone is goes back to the well)
        if (A.ph === 'play' && A.view === 'far' && A.share && !f.sl && !f.carry && !f.rope && (f.moved || 0) < 14) { A.shareOff = s.trip; ev('back'); }
      },
    });
    const ropeX = () => { const R = ropePts(s.b).filter((q) => q.on); return R.length ? R[R.length - 1].x : innerWidth / 2; };
    /** the bucket at the rim follows the finger toward the trough by the well; past it the finger's way on is the tilt */
    function carryTo(f) {
      if (s.phase !== 'rim') return;
      const b = bodyOf(s.b), hang = [lineX(s.b), BOT1 + B_BOT - B_MID, LINE_Z[s.b]], p0 = scrOf(...hang), p1 = scrOf(...OVER);
      const dx = p1.x - p0.x, dy = p1.y - p0.y, L = Math.hypot(dx, dy) || 1, fx = f.x + f.off[0], fy = f.y + f.off[1];
      const u = ((fx - p0.x) * dx + (fy - p0.y) * dy) / (L * L);
      A.carry = clamp(Math.max(u, A.carry >= 0.98 ? 0.98 : 0), 0, 1);
      A.tiltTo = A.carry >= 0.95 ? clamp(((u - 1) * L) / (innerHeight * 0.2), 0, 1) : 0; void b;
    }
    function pull(side) {
      const r = pullStep(s); if (r == null) return;
      if (s.trip !== A.trip) { A.trip = s.trip; A.f0 = s.f; A.dribT = A.t; say('pull', 7000); }
      A.pullT = A.t; A.lastSide = side; const k = side < 0 ? 0 : 1; A.haul[k] = 1;
      ev('pull:' + r);
      V.creak(0.6); setTimeout(() => V.creak(0), 260);
    }
    // ── the run's save: the troughs' water, whose turn it is (a reload goes on from the next fill)
    function saveRun() { const tr = {}; for (const k of KS) tr[k] = +s.troughs[k].v.toFixed(4); st.golah.run = { id, tr, w: +(s.head + channelWater(s)).toFixed(4), sl: { ...s.sluice }, trip: s.trip, b: s.b, knocks: s.knocks, clashes: s.clashes, perfect: s.perfect }; X.save(); }   // (w: the water on its way, back in the head trough on a reload)
    // ── the events of the model
    const ropeScr = () => { const R = ropePts(s.b).filter((q) => q.on); const q = R[Math.floor(R.length * 0.7)] || { x: innerWidth / 2, y: innerHeight / 2 }; return { sx: q.x, sy: q.y }; };
    const troughScr = (k) => { const [x, z] = GL.troughs[k]; const q = scrOf(x, F0 + 0.4, z); return { sx: q.x, sy: q.y }; };
    function onEvents() {
      for (const e of s.ev) {
        if (e.e === 'pull' && e.kind === 'perfect') X.quick(ropeScr(), QUICK.beat);
        else if (e.e === 'knock') { V.knock(1.3); X.shake(0.1, 0.15); ev('knock'); A.splash = A.t; }
        else if (e.e === 'clash') { V.bump(); ev('clash'); A.splash = A.t; }
        else if (e.e === 'passed') { X.quick(ropeScr(), QUICK.passed); ev('passed'); }
        else if (e.e === 'dry') { X.quick(ropeScr(), QUICK.dry); ev('dry'); }
        else if (e.e === 'rim') { ev('rim'); say('rim', 6000); }
        else if (e.e === 'poured') { ev('poured'); A.back = 1; A.tiltBack = A.tilt; A.carry = 0; A.tilt = 0; A.tiltT = 0; A.tiltTo = 0; saveRun(); }
        else if (e.e === 'full') { X.quick(troughScr(e.k), QUICK.full); ev('full:' + e.k); saveRun(); }
        else if (e.e === 'done') { ev('done'); moment(); }
        else if (e.e === 'loss') lossOf(e);
      }
      s.ev = [];
    }
    function lossOf(e) {
      if (e.f === 'golah.bucket') {
        const i = e.at | 0, b = bodyOf(i), q = scrOf(...b.mid), p = Mo.mark('golah.bucket', id, i, i);
        P.crack(i); V.crack(); X.loss(p, { sx: q.x, sy: q.y }, LOSS['golah.bucket'][0]); ev('loss:bucket');
      } else if (e.f === 'golah.rim') {
        const dx = swingX() || 0.01, ang = Math.atan2(LINE_Z[s.b] - WZ, Math.sign(dx) * (GL.shaftR + 0.2)), n = ((Math.floor(((ang / (2 * Math.PI)) * 12)) % 12) + 12) % 12;
        const p = Mo.mark('golah.rim', id, n, n); P.rim(rimBroken()); V.crack(); X.shake(0.18, 0.3);
        const a = ((n + 0.5) / 12) * Math.PI * 2, q = scrOf(WX + Math.cos(a) * (GL.shaftR + GL.rimT / 2), F0 + GL.rimH, WZ + Math.sin(a) * (GL.shaftR + GL.rimT / 2));
        X.loss(p, { sx: q.x, sy: q.y }, LOSS['golah.rim'][0]); ev('loss:rim');
      } else if (e.f === 'golah.flood') {
        const k = e.at, p = Mo.mark('golah.flood', id, k, k); P.puddle(k);
        X.loss(p, troughScr(k), LOSS['golah.flood'][0]); ev('loss:flood:' + k);
      }
      saveRun();
    }
    // ── the moment: every trough full together — the troughs glint a moment from the court, then a cut to the kohen who stands at the
    //    first and washes his hands over its water (Tamid 1:4's washing; here from the trough: המחשה). His picture is held clear before
    //    any card comes (G11); the film after the work is the Golah as it stands (G13: res.film, the director's pull-back)
    function addKohen() {
      const w = GL.wash, t = GL.troughs[KS[0]];
      kohen = AC.add('kohen', w[0], w[1], { yaw: Math.atan2(t[0] - w[0], t[1] - w[1]), fadeIn: false, scale: 1 }); kohen.vis = kohen.visT = 1; AC.pose(kohen, 'wash');
      kohen.knT = kohen.kn = 0; kohen.bowT = WASH.bow; kohen.armT = [WASH.pitch, WASH.spread, WASH.pitch, WASH.spread];
      A.washT = A.t; X.line(GLINES.wash, (WASH.hold + 1.6) * 1000);
    }
    async function moment() {
      if (A.ph !== 'play') return; A.ph = 'moment'; A.momT = A.t; X.hand(null);
      for (const k of KS) st.golah.troughs[k] = +clamp(s.troughs[k].v / s.troughs[k].size, 0, 1.05).toFixed(3);
      st.golah.depth = Math.max(st.golah.depth || 0, s.depth);
      delete st.golah.run; X.save();
      await X.wait(WASH.far);
      A.washOn = 1;   // (the cut: the kohen is put at his place while the frame is dark — addKohen, from the frame's update)
      await X.wait(0.45 + WASH.hold);
      if (id === 'golah3') await card(X, `<b style="font:900 20px Heebo,system-ui">ומשם מספיקים מים לכל העזרה</b>${cite(LINES.golah)}`, 9000);
      A.ph = 'done';
      const pts = golahPts(s), q = qOf(pts), F = CAM.golahFilm;
      X.end({ stars: starsOf(q), q, pts, perfect: pts >= 40, flags: { knocks: s.knocks, clashes: s.clashes, perfect: s.perfect, stops: s.stops, 'golah.bucket': (s.flags['golah.bucket'] || []).length, 'golah.rim': (s.flags['golah.rim'] || []).length, 'golah.flood': (s.flags['golah.flood'] || []).length }, at: troughScr(KS[0]), film: { eye: F[0], aim: F[1], secs: 3.2, ease: 0.01 } });
    }
    // ── the frame: the model, then the picture
    function stepModel(dt) {
      const hold = [...FG.L.values()].some((f) => f.rope && !f.pulled && f.moved < 14);
      if (A.ph === 'play') {
        fillStep(s, hold, dt);
        if (s.phase === 'rim' && A.carry >= 0.95) { A.tilt += (A.tiltTo - A.tilt) * Math.min(1, dt * 6); pourStep(s, A.tilt, dt); }
        else A.tilt += (0 - A.tilt) * Math.min(1, dt * 6);
        golahStep(s, dt);
        onEvents();
        // (the words: what to do now, once each)
        if (s.phase === 'fill' && !A.lines.fill && A.t > 7) say('fill', 6000);
        if (s.phase === 'pull' && !s.met && A.meetSaid !== s.trip && Math.abs(s.y - s.depth / 2) < 2.6 && s.A * 1.5 > GOLAH.CLASH * 0.85) { A.meetSaid = s.trip; X.line(GLINES.meet, 3200); }
      }
      // (the view: the pour's while a bucket is at the rim; after a pour the far view, the troughs and their stones, while the water runs
      //  and the bucket below waits empty — till a tap where no stone is takes him back to the well; the shaft's while a bucket comes up)
      const water = s.head > 1e-3 || s.parcels.length > 0 || s.pool > 1e-3;
      if (A.water && !water && A.ph === 'play') saveRun(); A.water = water;   // (the water has landed: the troughs' new levels are kept)
      const share = s.phase === 'fill' && (water || s.f < 1e-3) && s.trip > 0 && A.back <= 0 && A.shareOff !== s.trip;
      if (share && !A.share && A.ph === 'play' && !A.lines.back) { A.lines.back = 1; X.line(GLINES.share + ' · ' + GLINES.back, 7000); }
      A.share = share;
      if (A.back > 0) A.back = Math.max(0, A.back - dt / 0.9);
    }
    /** the picture of the state now (golah3d's play frame) */
    function picture(dt) {
      const T = targets(), kk = 1 - Math.exp(-dt / 0.14);
      for (const i of [0, 1]) A.bot[i] = A.bot[i] == null ? T[i] : A.bot[i] + (T[i] - A.bot[i]) * kk;
      const fb = A.bot[s.b];
      if (A.lastBot != null && A.lastFull === s.b) A.wheel += ((fb - A.lastBot) / WR) * (s.b ? 1 : -1);
      A.lastBot = fb; A.lastFull = s.b;
      const B = [0, 1].map((i) => { const b = bodyOf(i), bl = bailOf(b.mid, b.tilt), len = Math.max(1, AXLE - bl[1]); const sx = b.mid[0] - WX; return { x: bl[0], y: bl[1], z: bl[2], tilt: b.tilt, swing: b.tilt ? 0 : Math.asin(clamp((sx * 0.6) / len, -0.3, 0.3)) }; });
      const full = bodyOf(s.b), outOfWater = full.mid[1] - (B_BOT - B_MID) > wellY + 0.05;
      const F = { b: B, full: s.f > 0.01 ? s.b : -1, fill: s.f, slosh: clamp(-SWING_K * s.A * Math.cos(s.ph) * 0.3, -0.18, 0.18), wheel: A.wheel, ropeWet: 1, depth: s.depth };
      // the trough by the well
      const head = clamp(s.head / 0.5, 0, 1) * 0.9; A.headWet = Math.max(head, (A.headWet || 0) - dt * 0.05); F.head = head; F.headWet = A.headWet;
      const headY = HB + 0.02 + head * (HH - 0.27);
      // the pour: one sheet from the tipped bucket's mouth into it, its rings
      const pk = s.phase === 'rim' && s.f > 0.01 ? sm(0.25, 0.7, A.tilt) : 0;
      if (pk > 0.01) {
        const lip = local(full.mid, full.tilt, 0, -B_RIM + 0.02, -B_R + 0.04), v0 = [0, -0.25 - 0.3 * pk, -0.55 - 0.9 * pk], h = Math.max(0.05, lip[1] - headY), tt = (v0[1] + Math.sqrt(v0[1] * v0[1] + 2 * G * h)) / G;
        const land = [lip[0], headY, lip[2] + v0[2] * tt];
        F.pour = { p0: lip, v0, ax: [1, 0, 0], tt, w0: 0.2 + 0.5 * pk, w1: 0.12 + 0.22 * pk, bow: 0.55, on: Math.min(1, pk * 1.6) }; F.pourAt = [land[0], land[2], Math.min(1, pk * 1.3)];
        if (S.clock() - (A.hrT || 0) > 0.35) { A.hrT = S.clock(); ring(A.rings.head, land[0] + (Math.random() - 0.5) * 0.3, land[2] + (Math.random() - 0.5) * 0.15, 0.8); }
      }
      // the dribble off the bucket as it leaves the water; the drops off it all the way up (more from a cracked one); their rings
      const dk = sm(0, 0.25, A.t - A.dribT) * (1 - sm(1.2, 2.4, A.t - A.dribT));
      if (dk > 0.01 && s.phase === 'pull') { const p = local(full.mid, 0, 0.1, -B_BOT, 0.05), Lw = Math.min(p[1] - wellY, 9); F.dribble = [p, [p[0], p[1] - Lw * 0.5, p[2]], [p[0], p[1] - Lw, p[2]], 0.09 * dk + 0.02, 0.03, dk]; }
      const rate = s.f > 0.01 && outOfWater && !(s.phase === 'rim' && A.carry > 0.5) ? (s.cracked[s.b] ? 16 : 5) : 0;
      A.dropAcc = (A.dropAcc || 0) + rate * dt;
      while (A.dropAcc >= 1 && A.drops.length < 48) { A.dropAcc -= 1; const a = Math.random() * Math.PI * 2, r = Math.random() * 0.3; const p = local(full.mid, full.tilt, Math.cos(a) * r, -B_BOT - 0.02, Math.sin(a) * r); A.drops.push({ x: p[0], y: p[1], z: p[2], vy: 0, s: 0.03 + 0.02 * Math.random() }); }
      if (A.dropAcc >= 1) A.dropAcc = 0;
      // (the splash of a knock or a clash: a burst of drops off the bucket)
      if (A.splash != null && A.t - A.splash < 0.05) { for (let q = 0; q < 14 && A.drops.length < 64; q++) { const a = Math.random() * Math.PI * 2; const p = local(full.mid, 0, Math.cos(a) * B_R, -B_RIM, Math.sin(a) * B_R); A.drops.push({ x: p[0], y: p[1], z: p[2], vy: 1 + Math.random() * 2, vx: Math.cos(a) * 0.8, vz: Math.sin(a) * 0.8, s: 0.035 }); } A.splash = null; }
      const drips = [];
      A.drops = A.drops.filter((d) => {
        d.vy -= G * dt; d.y += d.vy * dt; d.x += (d.vx || 0) * dt; d.z += (d.vz || 0) * dt;
        const rr = Math.hypot(d.x - WX, d.z - WZ);
        if (rr < GL.shaftR - 0.05 && d.y < wellY) { ring(A.rings.well, d.x, d.z, 0.45); return false; }
        const bk = KS.find((k) => Math.abs(d.x - GL.troughs[k][0]) < TS[0] / 2 && Math.abs(d.z - GL.troughs[k][1]) < TS[1] / 2);
        if (bk) { if (d.y < F0 - LINE_D) { ring(A.rings.tr[bk], d.x, d.z, 0.3); return false; } drips.push([d.x, d.y, d.z, d.s, d.vx || 0, d.vy, d.vz || 0]); return true; }
        if (rr >= GL.shaftR - 0.05 && d.y < F0 + (rr < GL.shaftR + GL.rimT ? GL.rimH : 0)) return false;
        drips.push([d.x, d.y, d.z, d.s, d.vx || 0, d.vy, d.vz || 0]); return true;
      });
      F.drips = drips;
      // the channel: the model's parcels on the main line and the spurs, the water standing past the last spur, the wet stone behind
      const C = CHANNEL; let mF = -1, mT = 1e9;
      const sp = {}; for (const k of Object.keys(GL.sluice)) sp[k] = { f: -1, t: 1e9 };
      for (const p of s.parcels) {
        const onMain = !p.to || p.d < C.spur[p.to].at;
        if (onMain) { mF = Math.max(mF, p.d); mT = Math.min(mT, p.d); }
        else { const q = sp[p.to], len = Q.spur[p.to].len, u = ((p.d - C.spur[p.to].at) / Math.max(0.01, C.spur[p.to].len)) * len; q.f = Math.max(q.f, u); q.t = Math.min(q.t, u); if (p.to && C.spur[p.to].at <= p.d) { mF = Math.max(mF, C.spur[p.to].at); } }
      }
      const run = mF >= 0, poolLen = s.pool > 0.001 ? Math.min(6, 0.6 + s.pool * 5) : 0;
      let front = run ? mF - MAIN_U0 : -1, tail = run ? Math.max(-0.5, mT - MAIN_U0 - 0.4) : -1;
      if (poolLen > 0) { front = C.total - MAIN_U0; if (!run) tail = C.total - MAIN_U0 - poolLen; }
      if (s.head > 1e-3 && run) tail = -1;
      const wet = (W, f, t) => { if (f > 0) { if (W.wetTail > W.wetTo + 4) { W.wetTo = 0; W.wetTail = -1; } W.wetTo = Math.max(W.wetTo, f); W.wetTail = Math.min(t, W.wetTail + DRY_V * dt); } else W.wetTail = Math.min(W.wetTo + 8, W.wetTail + DRY_V * dt); };
      wet(A.main, front, front > 0 ? tail : 1e9);
      const open = C.order.filter((k) => s.sluice[k] && s.troughs[k]);
      F.main = { front, tail, flow: run ? 1 : 0.15, wetTo: A.main.wetTo, wetTail: A.main.wetTail, pile: run && open.length ? [C.spur[open[0]].at - MAIN_U0, 1] : null };
      F.spur = {}; F.inflow = {}; F.inAt = {}; F.tr = {}; F.sluice = {};
      for (const k of Object.keys(GL.sluice)) {
        const q = sp[k], W2 = A.spur[k], len = Q.spur[k].len, on = q.f >= 0;
        wet(W2, on ? q.f : -1, on ? q.t : 1e9);
        F.spur[k] = { front: on ? q.f : -1, tail: on ? Math.max(-0.2, q.t - 0.3) : -1, wetTo: W2.wetTo, wetTail: W2.wetTail };
        // (the level to the mason's line, its measure; over it the water climbs toward the rim as the flood comes near)
        const T2 = s.troughs[k], level = T2 ? clamp(T2.v / T2.size, 0, 1) : 0, over = T2 ? clamp((T2.v - T2.size) / GOLAH.OVER, 0, 1) : 0;
        // (the fall over the basin's lip while its spur runs)
        const ik = on && q.f >= len - 0.05 ? 1 : 0;
        A.ik = A.ik || {}; A.ik[k] = clamp((A.ik[k] || 0) + (ik ? dt * 4 : -dt * 2.5), 0, 1);
        const x = GL.troughs[k][0], lipZ = GL.troughs[k][1] + TS[1] / 2, lipY = F0 - 0.3 + 0.2, yL = F0 - LINE_D, by = F0 - TS[2] + 0.03 + level * (yL - (F0 - TS[2] + 0.03)) + over * (F0 - 0.025 - yL);
        if (A.ik[k] > 0.01) {
          const v0 = [0, -0.1, -1.1], hh = Math.max(0.05, lipY - by), tt = (v0[1] + Math.sqrt(v0[1] * v0[1] + 2 * G * hh)) / G;
          F.inflow[k] = { p0: [x, lipY, lipZ - 0.01], v0, ax: [1, 0, 0], tt, w0: 0.42, w1: 0.36, bow: 0.25, on: A.ik[k] }; F.inAt[k] = [x, lipZ - 0.01 + v0[2] * tt, A.ik[k]];
          if (S.clock() - (A['trT' + k] || 0) > 0.6) { A['trT' + k] = S.clock(); ring(A.rings.tr[k], x + (Math.random() - 0.5) * 0.5, F.inAt[k][1] - 0.05 - Math.random() * 0.15, 0.55 * A.ik[k]); }
        }
        A.trWet = A.trWet || {}; A.trWet[k] = Math.max(level, A.trWet[k] || 0); A.trOver = A.trOver || {}; A.trOver[k] = Math.max(over, A.trOver[k] || 0);
        F.tr[k] = { level, over, wet: A.trWet[k], wetOver: A.trOver[k], rings: A.rings.tr[k] };
        A.sl[k] += ((s.sluice[k] ? 1 : 0) - A.sl[k]) * Math.min(1, dt * 7); F.sluice[k] = A.sl[k];
      }
      // (the moment: the water runs off the kohen's two hands into the trough — a thin stream from between them, drops off each, rings
      //  where they fall; the hands rub)
      if (kohen && A.ph !== 'play') {
        const tt = A.t - (A.washT || 0), r = WASH.rub;
        kohen.armT = [WASH.pitch + 0.8 * r * Math.sin(tt * 4.2), WASH.spread + r * Math.sin(tt * 5.3), WASH.pitch + 0.8 * r * Math.sin(tt * 4.2 + Math.PI), WASH.spread + r * Math.sin(tt * 5.3 + Math.PI)];
        AC.handWorld(kohen, 1, _h[0]); AC.handWorld(kohen, -1, _h[1]);
        const T1 = s.troughs[KS[0]], lv = clamp(T1.v / T1.size, 0, 1), ov = clamp((T1.v - T1.size) / GOLAH.OVER, 0, 1), yB = F0 - TS[2] + 0.03, yL = F0 - LINE_D, wy = yB + lv * (yL - yB) + ov * (F0 - 0.025 - yL);
        const hx = (_h[0].x + _h[1].x) / 2, hy = Math.min(_h[0].y, _h[1].y) - 0.06, hz = (_h[0].z + _h[1].z) / 2, on = sm(0.2, 0.8, tt);
        if (on > 0.01) F.dribble = [[hx, hy, hz], [hx - 0.03, (hy + wy) / 2, hz], [hx - 0.05, wy, hz], 0.07 * on + 0.02, 0.035, on];
        A.wDrop = (A.wDrop || 0) + dt * 6 * on;
        while (A.wDrop >= 1 && A.drops.length < 48) { A.wDrop -= 1; const h = _h[Math.random() < 0.5 ? 0 : 1]; A.drops.push({ x: h.x + (Math.random() - 0.5) * 0.1, y: h.y - 0.05, z: h.z + (Math.random() - 0.5) * 0.1, vy: 0, s: 0.03 + 0.015 * Math.random() }); }
        if (on > 0.01 && S.clock() - (A.wT || 0) > 0.45) { A.wT = S.clock(); ring(A.rings.tr[KS[0]], hx - 0.05, hz, 0.5 * on); }
      }
      F.wellRings = A.rings.well; F.headRings = A.rings.head;
      P.set(F);
      haulers(dt);
    }
    function ring(L, x, z, amp) { L.unshift([x, z, S.clock(), amp]); if (L.length > 8) L.length = 8; }
    /** the two haulers: each faces the line that goes down and holds it (a short length of rope from his hands to it); a pull is his
     *  stroke (both hands high, then down to the chest, a bow), the other holds */
    const _h = [new THREE.Vector3(), new THREE.Vector3()], _d = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
    function haulers(dt) {
      const down = 1 - s.b, lz = LINE_Z[down], eb = bodyOf(down), ebl = bailOf(eb.mid, eb.tilt);
      crew.forEach((a, i) => {
        a.yaw = Math.atan2(WX - a.x, lz - a.z);
        A.haul[i] = Math.max(0, A.haul[i] - dt / 0.42);
        const k = A.haul[i] > 0 ? Math.sin(Math.PI * (1 - A.haul[i])) : 0, up = A.haul[i] > 0.5 ? 1 : 0;
        const pitch = A.ph === 'play' || A.ph === 'intro' ? lerp(1.15, up ? 2.2 : 0.75, k) : 0.6;
        a.armT = [pitch, -0.12, pitch, -0.12]; a.bowT = 0.12 + 0.3 * k * (1 - up); a.knT = 0.15 * k;
        AC.handWorld(a, 1, _h[0]); AC.handWorld(a, -1, _h[1]);
        const hx = (_h[0].x + _h[1].x) / 2, hy = (_h[0].y + _h[1].y) / 2, hz = (_h[0].z + _h[1].z) / 2;
        // (the line at the hands' height: from the wheel's side down to the empty bucket's bail)
        const u = clamp((AXLE - hy) / Math.max(0.5, AXLE - ebl[1]), 0, 1), rx = lerp(WX, ebl[0], u), rz = lerp(lz, ebl[2], u);
        const r = tails[i]; _d.set(rx - hx, 0, rz - hz); const L = _d.length(); r.visible = A.ph === 'play' && L > 0.02;
        if (r.visible) { r.position.set(hx, hy, hz); r.quaternion.setFromUnitVectors(_up, _d.normalize()); r.scale.set(1, L, 1); }
      });
      AC.update(dt);
    }
    /** the figures against the frame (rule: whole in it, or out of it): head, feet, hands on the screen */
    function figs() {
      const out = [], L = [...crew, ...(kohen ? [kohen] : [])];
      for (const a of L) {
        const pts = [[a.x, a.y + 0.05, a.z], [a.x, a.y + 3.9 * (a.s / 1.1) * (1 - 0.25 * (a.kn || 0)), a.z]].map((p) => scrOf(...p));
        // (the top band is the HUD's: a head under the counters and the goal is as cut as one past the edge)
        const inF = (q) => q.on && q.x >= 0 && q.x <= innerWidth && q.y >= Math.max(96, innerHeight * 0.16) && q.y <= innerHeight, n = pts.filter(inF).length;
        out.push({ v: a.variant, drawn: a.visT > 0, st: n === pts.length ? 'whole' : n ? 'cut' : 'out', pts: pts.map((q) => [Math.round(q.x), Math.round(q.y)]) });
      }
      return out;
    }
    /** (rule: no figure cut by the frame) a hauler the frame would cut is not drawn in that view; whole again, he is back */
    function guardFigs() {
      const F = figs(); crew.forEach((a, i) => { const v = F[i].st === 'whole' ? 1 : 0;   /* (out: head and feet past the frame, an arm may still show at its edge) */ a.vis = a.visT = v; tails[i].visible = tails[i].visible && !!v; });
    }
    const api = {
      close: true,   // (its shots come close — the shaft from the stand, the pour through the door: the world camera's 35-amot floor gives way)
      begin() {
        GS.act = api; A.ph = 'intro'; setBusy(X, 1); X.kohen(false);
        // (the lens: the station's, 50°, the director's look widens it from there; the world's back at the end)
        A.fov0 = X.camera.fov; try { if (!(A.look && A.look.u > 1e-3)) { X.camera.fov = CAM.golahFov; X.camera.updateProjectionMatrix(); } } catch (e) { /* */ }
        FG.attach(); picture(0); camStep(0, true);
        X.line(id === 'golah1' && !run ? LINES.golah : GLINES[id] + ' · ' + GLINES.share, 6500);
        setTimeout(() => { if (A.ph === 'intro') A.ph = 'play'; if (id === 'golah1' && !run) setTimeout(() => { A.lines.fill = 1; X.line(GLINES.golah1 + ' · ' + GLINES.fill, 6000); }, 4500); }, 1200);
      },
      update(dt) {
        A.t += dt;
        try { stepModel(dt); if (A.view === 'wash' && !kohen) addKohen(); picture(dt); camStep(dt); guardFigs(); V.frame(); } catch (e) { if (A.t - A.errT > 5) { A.errT = A.t; console.error('[h129] golah', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
      },
      down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { for (const f of FG.L.values()) if (f.carry) { A.tiltT = 0; A.tiltTo = 0; } },
      // (rule 66: on the right a touch is the act's only on the rope, on the bucket at the rim, or on a sluice stone)
      wants(p) { if (!p) return true; if (A.ph !== 'play') return false; return onRope(p) || onBucket(p) || !!onSluice(p); },
      holds() { for (const f of FG.L.values()) if (f.rope || f.carry || f.sl) return true; return false; },
      end() {
        FG.detach(); V.stop(); X.hand(null);
        for (const a of [...crew, kohen]) if (a) { try { AC.remove(a); } catch (e) { /* */ } }
        try { AC.update(0); } catch (e) { /* */ }   // (G13: the layer's instances emptied now — no one updates it between the works, and the last frame's men stayed drawn in the world: the kohen lying in the film)
        kohen = null;
        for (const r of tails) S.scene.remove(r);
        ropeG.dispose(); ropeM.dispose();
        clearTimeout(A.fadeTo); try { fadeEl().style.opacity = '0'; } catch (e) { /* */ }
        try { if (A.fov0) { X.camera.fov = A.fov0; X.camera.updateProjectionMatrix(); } } catch (e) { /* */ }
        if (GS.act === api) GS.act = null; golahDown(X); setBusy(X, 0);
      },
      at() { return new THREE.Vector3(WX, F0 + GL.rimH, WZ); },
      dbg() {
        const T = periodNow(s), w = (2 * Math.PI) / T, phm = ((s.ph % Math.PI) + Math.PI) % Math.PI, toMid = (Math.PI - phm) / w, toEnd = ((((Math.PI / 2 - phm) % Math.PI) + Math.PI) % Math.PI) / w;
        const pt = (q) => (q && q.on ? [Math.round(q.x), Math.round(q.y)] : null);
        const o = { id, phase: A.ph, mph: s.phase, b: s.b, f: +s.f.toFixed(3), y: +s.y.toFixed(2), depth: s.depth, A: +s.A.toFixed(3), T: +T.toFixed(3), toMid: +toMid.toFixed(3), toEnd: +toEnd.toFixed(3), met: s.met, trip: s.trip,
          knocks: s.knocks, clashes: s.clashes, perfect: s.perfect, stops: s.stops, dmg: s.dmg, flags: s.flags, head: +s.head.toFixed(3), cw: +channelWater(s).toFixed(3), pool: +s.pool.toFixed(3),
          tr: Object.fromEntries(KS.map((k) => [k, [+s.troughs[k].v.toFixed(3), s.troughs[k].size]])), sl: { ...s.sluice }, ks: KS, carry: +A.carry.toFixed(2), tilt: +A.tilt.toFixed(2), view: A.view, fading: A.fading, fades: A.fades || 0,
          ev: A.ev.slice(-10), mouse: MOUSE, look: A.look, nf: FG.n, mom: A.momT != null ? +(A.t - A.momT).toFixed(2) : null, washFor: A.washT != null ? +(A.t - A.washT).toFixed(2) : null };
        if (GS.S) {
          const r = ropeDist({ x: innerWidth / 2, y: innerHeight / 2 }, s.b), R = ropePts(s.b).filter((q) => q.on && q.x > 0 && q.x < innerWidth && q.y > 110 && q.y < innerHeight - 40);   // (below the top bar)
          o.rope = A.view === 'shaft' && R.length ? pt(R[Math.floor(R.length * 0.55)]) : null; void r;
          // (the far view: a place to tap that is no stone — back to the well)
          if (A.view === 'far' && A.share) { const c = [[0.4, 0.86], [0.2, 0.86], [0.3, 0.6], [0.8, 0.86]].map(([u, v]) => ({ x: Math.round(innerWidth * u), y: Math.round(innerHeight * v) })).find((q) => !slNear(q)); o.back = c ? [c.x, c.y] : null; }
          o.ropeE = (() => { const R2 = ropePts(1 - s.b).filter((q) => q.on && q.x > 0 && q.x < innerWidth && q.y > 40 && q.y < innerHeight - 40); return R2.length ? pt(R2[Math.floor(R2.length * 0.55)]) : null; })();
          if (s.phase === 'rim') { o.bucket = pt(bucketScr()); const p1 = scrOf(...OVER), hang = scrOf(lineX(s.b), BOT1 + B_BOT - B_MID, LINE_Z[s.b]); o.over = pt(p1); const dx = p1.x - hang.x, dy = p1.y - hang.y, L = Math.hypot(dx, dy) || 1; o.tiltTo = [Math.round(p1.x + (dx / L) * innerHeight * 0.24), Math.round(p1.y + (dy / L) * innerHeight * 0.24)]; }
          o.sluice = Object.fromEntries(KS.map((k) => [k, pt(slAt(k))]));
          o.figs = figs();
          if (kohen) { const h = [1, -1].map((sd) => { AC.handWorld(kohen, sd, _h[0]); return [+_h[0].x.toFixed(2), +_h[0].y.toFixed(2), +_h[0].z.toFixed(2)]; }); o.kohen = { at: [+kohen.x.toFixed(2), +kohen.z.toFixed(2)], hands: h, water: +(F0 - LINE_D).toFixed(2) }; }
          { const c = X.camera; o.cam = { eye: c.position.toArray().map((v) => +v.toFixed(2)), fov: +c.fov.toFixed(1) }; }
        }
        return o;
      },
    };
    return api;
  },
};
