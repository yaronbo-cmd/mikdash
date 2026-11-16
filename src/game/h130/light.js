/* ── build 130 ── h130/light.js — station 3 "חמישים אמה של אור" (spec docs/specs/shlav-05-hadash-he.md, brief §5): three works, one act
 * (light1, light2, light3), all in the world:
 *   1. the wick at the wicks table: the left thumb holds the worn garment, the right pulls one unbroken strip off its edge; where the
 *      right thumb takes the edge is the strip's width (thin: a weak light that lasts; thick: a strong one that drinks); a pull sharper
 *      than the limit tears it (a new strip, no loss). With a mouse the boy's own hand holds the garment and the button pulls.
 *   2. the oil (light2, light3): in the door of Beit Shemanya the seven measures of the Temple, named as in the Mishnah; the left hand
 *      drags a measure over the jar and it tips in; thirty log exactly, in three pours (hin, hin, half a hin) is מהודר; over thirty runs
 *      over on the floor (no loss: the jar is emptied back and filled again).
 *   3. the ladder: the left thumb is the boy's left hand, the right thumb his right (by mouse: the left and the right button). Take a
 *      hand off its rung and draw it up to the next; the jar on his shoulder is a pendulum each hand's lift pushes, late (model.js
 *      climbStep); a hand lifted while the jar leans to its side spills; past the limit the jar falls and breaks (light.jar, −20: the
 *      sherds and the stain stay; he goes down for a new jar, never falls himself). The camera lifts a little by itself before the climb;
 *      with both hands holding and the jar quiet a drag of the right thumb on empty space lifts the camera.
 *   4. the pour and the light: the left hand tilts the jar into the bowl, slowly (too far or too fast throws oil outside); lays the wick
 *      in it; brings the taper's flame to it.
 * light1: the gallery's short ladder, a half jar, a clay bowl on the gallery's floor. light2: the menorah, its whole ladder, the jar he
 * measured, one bowl. light3: the four bowls; three other boys climb the other three ladders beside him (the same model, a steady hand).
 * Quick: a rising note on every rung taken in time; the hand on the last rung and the flame that rises: the full screen.
 * Places: BOOK.s05.light (light3d.js); the rules: model.js (WICK, MEASURES, CLIMB, POUR, lightOf).
 */
import { WICK, wickFresh, wickStep, MEASURES, measure, minPours, CLIMB, climbFresh, climbStep, climbQuiet, pourFresh, pourStep, lightOf, grade, qOf, starsOf, lossPts, LOSS, LINES, QUICK } from './model.js';
import { matsL, ladderOf, bowlsOf, menorahMesh, oilDisc, flameMesh, clayBowl, jarMesh, measuresLayout, wicksLayout, brokenJar, boxAt, rod, GFLOOR, SL } from './light3d.js';
import { createVoices } from '../h129/sound129.js';
import { card, esc } from '../h129/ui7.js';
import { fingers, MOUSE } from '../h113/acts.js';
import { gripR } from '../h109/grips.js';
import { BOOK } from '../world/grid.js';

const S5 = BOOK.s05, LT = S5.light, CAM = S5.cam.light, FLOOR = S5.court.floor;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const sm = (u) => { const v = clamp(u, 0, 1); return v * v * (3 - 2 * v); };
const GRIP_MIN = 64;
const HAND_UP = 2;   // (his hands hold two rungs above his feet: model rung r → his hands on rung r + 2)
/** the strip's speed: the finger's px per amah of strip (the table's own scale on the screen) */
export const LIGHT_LINES = Object.freeze({
  w1: 'האימון: פתילה, סולם הגזוזטרא וקערת חרס', w2: 'המנורה: פתילה, שמן, סולם וספל', w3: 'ארבעת הספלים',
  wick: 'שמאל מחזיקה, ימין מושכת רצועה',
  wickMouse: 'משכו רצועה מקצה הבגד',
  hold: 'החזיקו את הבגד ביד שמאל', tear: 'נקרעה! משכו לאט יותר', more: 'עוד רצועה',
  oil: 'שלושים לוג בכד', over: 'יותר משלושים: השמן גלש. מתחילים שוב', thirty: 'שלושים לוג',
  climb: 'יד אחר יד, בקצב הכד', climbIll: 'העלייה בסולם ונשיאת הכד (המחשה)', spill: 'הכד נטה לצד היד: שמן נשפך', drop: 'הכד נפל ונשבר. יורדים לכד חדש',
  pour: 'הטו את הכד לאט אל הספל', pourClay: 'הטו את הכד לאט אל הקערה', outside: 'לאט! השמן נשפך החוצה', lay: 'הניחו את הפתילה', light: 'הדליקו',
  place: 'מקום המנורה: המחשה', top: 'ראש הסולם!', others: 'שלושת הנערים האחרים עולים לידך',
});

/** the strip's real width from where the right thumb took the edge (0 … 1 across the band) */
const widthAt = (u) => +(WICK.MIN + clamp(u, 0, 1) * (WICK.MAX - WICK.MIN)).toFixed(3);
/** a steady climber (the other boys): lifts the next hand as soon as the last is placed, draws it up in drag s */
function stepBoy(B, dt) {
  const h = 1 / 120; B.acc += dt; const ev = [];
  while (B.acc >= h) {
    B.acc -= h; B.t += h; let hand = null;
    if (B.pend && B.t >= B.pend.at) { hand = { h: B.pend.h, a: 'place' }; B.pend = null; }
    else if (!B.S.up && !B.pend && B.S.rung < B.S.top && B.t >= B.wait) { hand = { h: B.next, a: 'lift' }; B.pend = { h: B.next, at: B.t + B.drag }; B.next = B.next === 'L' ? 'R' : 'L'; }
    ev.push(...climbStep(B.S, hand, h));
  }
  return ev;
}

export const LIGHT = {
  icon: '🕯', title: 'חמישים אמה של אור',
  walkLine: (m) => LIGHT_LINES['w' + ((m && m.lv) || 1)] || LIGHT_LINES.w1,
  /** his stand: by the wicks table, on its east end (the camera sees him on the left, the garment in the middle) */
  stand() { const W = wicksLayout(); return { x: W.table[0] + 1.9, z: W.table[2] - 0.3, face: [W.table[0], W.table[2]] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, Mo = X.M, st = Mo.st, MT = matsL(X), AC = X.actors ? X.actors() : null, V = createVoices(X.sfx);
    const lv = (m && m.lv) || 1, nStrips = lv === 3 ? 4 : 1;
    const A = { phase: 'intro', t: 0, ev: [], fing: {}, wicks: [], tears: 0, pours: [], over: 0, mehudar: lv === 1, spilled: 0, out: 0, dmg: 0, drops: 0, perfect: 0, steps: 0, tw: [], said: {}, btn: 0, lit: 0 };
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
    const root = new T.Group(); root.name = 'h130-light-act'; X.props.root.add(root);
    const tween = (dur, fn, done) => A.tw.push({ t: 0, dur, fn, done });
    const later = (s, fn) => tween(s, () => {}, fn);   // (in the act's own time: nothing runs while the camera is away)
    const scr = (p) => { const r = X.scr(p[0], p[1], p[2]); return [Math.round(r.x), Math.round(r.y)]; };
    const gripPx = () => Math.max(GRIP_MIN, gripR() * 1.0);
    const near = (f, p, r = gripPx()) => { const q = scr(p); return Math.hypot(f.x - q[0], f.y - q[1]) < r; };
    const say = (k, ms = 3000) => { X.line(LIGHT_LINES[k] || k, ms); };
    const sayOnce = (k, ms) => { if (A.said[k]) return; A.said[k] = 1; say(k, ms); };
    let ctxA = null; const rise = (i) => { try { const c = ctxA || (ctxA = X.sfx && X.sfx.context); if (!c || (X.sfx && X.sfx.muted)) return; const t = c.currentTime, f = 392 * Math.pow(2, (i % 24) / 24), o = c.createOscillator(), g = c.createGain(); o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35); o.connect(g); g.connect(c.__bhOut || c.destination); o.start(t); o.stop(t + 0.4); } catch (e) { /* */ } };
    const shot = (p, t, d = 1.2) => X.shot(p, t, d);
    /** a close shot of a place, seen from a book camera's side at distance D */
    const closeShot = (aim, from, D, up = 0, d = 1.2) => { const v = [from[0] - aim[0], from[1] - aim[1], from[2] - aim[2]], L = Math.hypot(...v) || 1; shot([aim[0] + (v[0] / L) * D, aim[1] + (v[1] / L) * D + up, aim[2] + (v[2] / L) * D], aim, d); };
    X.kohen(false);

    // ── the boy (a young kohen: the player's own figure in this station) ──
    const boyAdd = (x, z, y = FLOOR) => { if (!AC) return null; const a = AC.add('kohen', x, z, { young: true, scale: 0.8, y, fadeIn: false }); if (a) { a.vis = a.visT = 1; a.gang = 1; } return a; };
    const W = wicksLayout(), sp = LIGHT.stand();
    const boy = boyAdd(sp.x, sp.z);
    const faceTo = (a, x, z) => { if (a) a.yaw = Math.atan2(x - a.x, z - a.z); };
    faceTo(boy, W.table[0], W.table[2]);
    if (boy) boy.armT = [1.1, -0.2, 1.1, -0.2];
    const others = [];

    /* ═══ 1. the wick ═══ */
    const cloth = new T.Group(); root.add(cloth);
    const CL = 1.2, CW = 0.9, cx = W.cloth[0], cy = W.cloth[1], cz = W.cloth[2];
    let pullDir = [-1, 0];   // (the strip comes off the garment's edge toward the screen's right: set in begin())
    const garment = new T.Mesh(new T.PlaneGeometry(CL, CW), MT.l30linen); garment.rotation.x = -Math.PI / 2; garment.receiveShadow = true; cloth.add(garment);
    // (the weave's three threads along the edge: the widths a strip can be torn at, seen on the cloth itself)
    const threads = [];
    const edgeX = () => cx + pullDir[0] * CL / 2, edge0Z = cz - CW / 2;
    function clothDraw() {
      for (const q of threads.splice(0)) cloth.remove(q);
      for (const w of [0.08, 0.14, 0.22]) { const q = new T.Mesh(X.props.geo.box, MT.l30linenW); q.scale.set(CL * 0.98, 0.004, 0.012); q.position.set(0, 0.004, -CW / 2 + w); cloth.add(q); threads.push(q); }
      const nick = new T.Mesh(X.props.geo.box, MT.l30clayD); nick.scale.set(0.05, 0.006, 0.05); nick.position.set(pullDir[0] * CL / 2, 0.005, -CW / 2 + 0.02); cloth.add(nick); threads.push(nick);
    }
    cloth.position.set(cx, cy, cz);
    let WS = null, strip = null;
    const stripMesh = () => { const s = new T.Mesh(X.props.geo.box, MT.l30linen); s.castShadow = true; root.add(s); return s; };
    const stripAt = (len, w, slide = 0) => {
      if (!strip) strip = stripMesh();
      const x0 = edgeX() + pullDir[0] * slide; strip.visible = len > 0.005;
      strip.scale.set(Math.max(0.01, len), 0.012, w); strip.position.set(x0 + (pullDir[0] * len) / 2, cy + 0.01, edge0Z + w / 2);
    };
    const pxA = () => { const a = scr([edgeX(), cy, edge0Z]), b = scr([edgeX() + pullDir[0], cy, edge0Z]); return { px: Math.hypot(b[0] - a[0], b[1] - a[1]) || 100, ux: (b[0] - a[0]) / (Math.hypot(b[0] - a[0], b[1] - a[1]) || 1), uy: (b[1] - a[1]) / (Math.hypot(b[0] - a[0], b[1] - a[1]) || 1) }; };
    const holdPt = () => [cx - pullDir[0] * CL * 0.3, cy, cz + 0.1];
    const edgePt = (u = 0.5) => [edgeX(), cy, edge0Z + (WICK.MIN + u * (WICK.MAX - WICK.MIN))];
    const clothHeld = () => MOUSE || Object.values(A.fing).includes('cloth');
    const made = [];   // (the wicks made: rolled, in the basket)
    function wickStart() {
      A.phase = 'wick'; WS = null; A.pull = null;
      say(MOUSE ? 'wickMouse' : 'wick', 6000);
      if (A.wicks.length === 0) setTimeout(() => { if (A.phase === 'wick') X.line(LINES.sukkah53, 6000); }, 6200);
      const e = edgePt(0.5); X.hand({ x: e[0], y: e[1], z: e[2] }, pullDir[0] < 0 === (pxA().ux > 0) ? 60 : -60, 0);
    }
    function wickDone(w) {
      const k = A.wicks.length; A.wicks.push(w);
      const r = new T.Mesh(new T.TorusGeometry(0.07 + w * 0.3, Math.max(0.012, w * 0.12), 6, 14), MT.l30linen); r.rotation.x = -Math.PI / 2;
      r.position.set(W.basket[0] + (k % 2) * 0.12 - 0.06, W.basket[1] + 0.06 + k * 0.025, W.basket[2] + ((k / 2) | 0) * 0.1 - 0.05); root.add(r); made.push(r);
      if (strip) strip.visible = false;
      A.tearSince = 0;
      if (!WS.tears) X.quick({ x: r.position.x, y: r.position.y + 0.2, z: r.position.z }, QUICK.wick, r);
      ev('wick:' + w);
      if (A.wicks.length < nStrips) { WS = null; say('more', 2000); return; }
      A.phase = 'between'; X.hand(null);
      later(0.9, () => (lv >= 2 ? oilStart() : goLadder()));
    }
    function wickMove(f, dt) {
      const P = pxA(), d = Math.max(0, ((f.x - f.x0) * P.ux + (f.y - f.y0) * P.uy) / P.px);
      if (!clothHeld()) {   // (the garment comes with the pull: no strip)
        const sl = Math.min(0.35, d); cloth.position.x = cx + pullDir[0] * sl; stripAt(0, f.w); sayOnce('hold', 2500); f.slid = 1; return;
      }
      cloth.position.x = cx;
      if (f.torn || !WS) return;
      const dd = d - f.d; f.d = d;
      f.v += ((dt > 0 ? dd / dt : 0) - f.v) * clamp(dt * 12, 0, 1);
      if (dd <= 0) return;
      const e = wickStep(WS, dd, Math.max(f.v, 0));
      if (e.includes('tear')) { f.torn = 1; A.tears++; A.tearSince = (A.tearSince | 0) + 1; ev('tear'); V.cloak(); say('tear', 2600); if (strip) { const s = strip; strip = null; tween(0.6, (u) => { s.position.y = cy + 0.01 - 0.4 * u; s.rotation.z = u; }, () => root.remove(s)); } return; }
      stripAt(WS.len, WS.w);
      if (e.includes('done')) { f.done = 1; wickDone(WS.w); }
    }

    /* ═══ 2. the oil ═══ */
    const ML = measuresLayout();
    let jarB = null, cups = [], labels = [], OS = { total: 0 };
    function oilStart() {
      A.phase = 'oilcard';
      faceTo(boy, ML.jar[0], ML.jar[2]);
      // he goes to the door of Beit Shemanya; the card says what the chamber was, and the seven measures
      if (boy) { boy.x = ML.jar[0] + 1.3; boy.z = ML.jar[2] - 0.2; boy.y = FLOOR; faceTo(boy, ML.jar[0], ML.jar[2]); boy.armT = [0.9, -0.2, 0.9, -0.2]; }
      closeShot([ML.jar[0] - 1.2, FLOOR + 0.8, ML.jar[2] + 0.9], CAM.measures[0], 5.6, 0.6, 1.6);
      jarB = jarMesh(X, { parent: root }); jarB.position.set(...ML.jar); jarB.userData.fill(0);
      // (the act's own seven cups over the world's: the world's hide while it plays)
      try { SL.cups && SL.cups.forEach((c) => { c.visible = false; }); } catch (e) { /* */ }
      cups = ML.cups.map((c) => { const g = jarCup(c); return { ...c, g, home: c.at.slice() }; });
      card(X, `<b style="font:900 20px Heebo,system-ui">לשכת בית שמניה</b><p style="margin:8px 0">לפי אבא שאול (המחשה). רבי אליעזר בן יעקב אומר: "שכחתי מה היתה משמשת".</p><p style="margin:8px 0">"שבע מדות של לח היו במקדש. הין, וחצי ההין, ושלישית ההין, ורביעית ההין, לג, וחצי לג, ורביעית לג"</p><small>(מנחות ט, ב) · הין: שנים עשר לג (מנחות פט ע"א)</small>`, 9000).then(() => {
        A.phase = 'oil'; labelsOn(); say('oil', 0);
        const c = cups[0]; X.hand({ x: c.g.position.x, y: c.g.position.y + 0.3, z: c.g.position.z }, 50, 40);
      });
    }
    function jarCup(c) { const g = new T.Group(); root.add(g); const mm = (() => { const s = 0.32 * Math.cbrt(c.log / 12) + 0.08, cu = new T.Mesh(new T.CylinderGeometry(s * 0.95, s * 0.8, s * 1.6, 14, 1, true), MT.l30bronze); cu.position.y = s * 0.8; cu.castShadow = true; g.add(cu); const b = new T.Mesh(new T.CircleGeometry(s * 0.8, 12), MT.l30bronze); b.rotation.x = -Math.PI / 2; g.add(b); const o = new T.Mesh(new T.CircleGeometry(s * 0.9, 12), MT.l30oil); o.rotation.x = -Math.PI / 2; o.position.y = s * 1.5; g.add(o); g.userData = { s, oil: o }; return g; })(); mm.position.set(...c.at); return mm; }
    function labelsOn() {
      labels = cups.map((c) => { const el = document.createElement('div'); el.className = 'h109-ui h130-ml'; el.textContent = c.name; el.style.cssText = 'position:fixed;transform:translate(-50%,0);pointer-events:none;font:800 14px/1.1 Heebo,system-ui;color:#3A2608;background:rgba(255,248,230,.86);padding:2px 6px;border-radius:8px;white-space:nowrap;z-index:55;direction:rtl'; document.body.appendChild(el); return el; });
    }
    function labelsOff() { for (const el of labels) el.remove(); labels = []; }
    function labelsFrame() {
      cups.forEach((c, i) => { const el = labels[i]; if (!el) return; const L = X.lookNow ? X.lookNow() : null; const q = scr([c.g.position.x, c.g.position.y - 0.05, c.g.position.z]); el.style.left = q[0] + 'px'; el.style.top = (q[1] + 6 + (i % 2) * 18) + 'px'; el.style.opacity = L && (L.u > 0.05 || L.ov) ? '0' : '1'; });
    }
    const cupUnder = (f) => { let best = null, bd = 1e9; for (const c of cups) { if (c.busy) continue; const q = scr([c.g.position.x, c.g.position.y + c.g.userData.s * 0.8, c.g.position.z]), d = Math.hypot(f.x - q[0], f.y - q[1]); if (d < bd) { bd = d; best = c; } } return bd < Math.max(40, gripPx() * 0.7) ? best : null; };
    const jarMouth = () => [jarB.position.x, jarB.position.y + jarB.userData.h, jarB.position.z];
    /** the finger's point on the plane of the cups' lifted height */
    function onPlane(f, y) { const r = X.rayAt(f.x, f.y), o = r.ray.origin, d = r.ray.direction; if (Math.abs(d.y) < 1e-4) return null; const k = (y - o.y) / d.y; if (k < 0) return null; return [o.x + d.x * k, y, o.z + d.z * k]; }
    function cupDrop(c, f) {
      const q = scr(jarMouth()), dd = Math.hypot(f.x - q[0], f.y - q[1]);
      if (dd > Math.max(70, gripPx())) { c.busy = 1; const p0 = c.g.position.toArray(); tween(0.4, (u) => c.g.position.set(...p0.map((v, i) => v + (c.home[i] - v) * sm(u))), () => { c.busy = 0; }); return; }
      // it tips into the jar
      c.busy = 1; X.hand(null); const m0 = jarMouth(), p0 = c.g.position.toArray(), over = [m0[0] + 0.25, m0[1] + 0.35, m0[2]];
      tween(0.35, (u) => c.g.position.set(...p0.map((v, i) => v + (over[i] - v) * sm(u))), () => {
        tween(0.6, (u) => { c.g.rotation.z = 1.9 * sm(u); c.g.userData.oil.visible = u < 0.6; }, () => {
          A.pours.push(c.id); const R = measure(A.pours); OS = R; jarB.userData.fill(Math.min(1, R.total / 30)); V.cloak(); ev('pour:' + c.id + ':' + R.total);
          tween(0.5, (u) => { c.g.rotation.z = 1.9 * (1 - sm(u)); const q2 = c.g.position; q2.set(over[0] + (c.home[0] - over[0]) * sm(u), over[1] + (c.home[1] - over[1]) * sm(u), over[2] + (c.home[2] - over[2]) * sm(u)); }, () => { c.busy = 0; c.g.userData.oil.visible = true; });
          if (R.over) {
            A.over++; say('over', 3200); V.dust();
            const s = brokenStain(); later(1.6, () => { A.pours = []; OS = { total: 0 }; jarB.userData.fill(0); root.remove(s); });
          } else if (R.exact) {
            A.mehudar = R.mehudar; A.phase = 'between';
            if (R.mehudar) X.quick({ x: m0[0], y: m0[1] + 0.3, z: m0[2] }, QUICK.exact, jarB); else say('thirty', 2000);
            later(1.3, () => { labelsOff(); goLadder(); });
          }
        });
      });
    }
    const brokenStain = () => { const s = new T.Mesh(new T.CircleGeometry(0.7, 14), MT.l30stain); s.rotation.x = -Math.PI / 2; s.position.set(ML.jar[0] + 0.3, FLOOR + 0.02, ML.jar[2] - 0.4); root.add(s); return s; };

    /* ═══ 3. the ladder ═══ */
    // which ladder is his: the practice's, or the menorah's nearest the book's camera of the level
    const myK = lv === 1 ? 'practice' : (() => { const e = CAM[lv][0]; let bi = 0, bd = 1e9; LT.ladders.forEach(([x, z], i) => { const d = Math.hypot(x - e[0], z - e[2]); if (d < bd) { bd = d; bi = i; } }); return bi; })();
    const LD = ladderOf(myK);
    const topR = LD.n - HAND_UP;
    const oil0 = lv === 1 ? 15 : 30;
    let S = null, jar = null;
    const hands = { L: { y: 0, p: 0 }, R: { y: 0, p: 0 } };   // (p: a lifted hand's way up to its next rung, 0 … 1)
    const handBase = (h) => LD.y(S[h] + HAND_UP);
    const handY = (h) => handBase(h) + (S.up === h ? hands[h].p : 0);
    const handPt = (h, L = LD, y) => { const c = L.at(y), s = h === 'L' ? 1 : -1; return [c[0] + L.left[0] * 0.3 * s + L.out[0] * 0.08, c[1], c[2] + L.left[1] * 0.3 * s + L.out[1] * 0.08]; };
    const hpt = (h) => handPt(h, LD, handY(h));
    /** a climber's figure: feet on the rung, back to the out side, each arm reaching its hand's point; the jar on his shoulders leaning φ */
    function poseClimber(a, L, feetY, yL, yR, phi, jr) {
      if (!a) return;
      const c = L.at(feetY); a.x = c[0] + L.out[0] * 0.5; a.z = c[2] + L.out[1] * 0.5; a.y = feetY; a.fixedY = feetY;
      a.yaw = Math.atan2(L.face[0], L.face[1]);
      const sc = a.s, sh = feetY + 2.5 * sc;
      const pit = (y) => { const fz = 0.42, dy = y - sh; return clamp(Math.atan2(fz, -dy), 0.2, 3.05); };
      a.armT = [pit(yL), 0.06, pit(yR), 0.06]; a.arm = a.armT.slice();
      if (jr) {
        const ax = new T.Vector3(L.face[0], 0, L.face[1]);
        jr.position.set(a.x + L.out[0] * 0.32, sh + 0.05, a.z + L.out[1] * 0.32);
        jr.quaternion.setFromAxisAngle(ax, phi);
      }
    }
    function climbStart(again) {
      S = climbFresh(topR, oil0); A.phase = 'climb'; hands.L.p = hands.R.p = 0;
      if (!jar) { jar = jarMesh(X, { parent: root, s: lv === 1 ? 0.75 : 0.9 }); }
      jar.visible = true; jar.userData.fill(S.oil / 30);
      if (boy) { boy.visT = boy.vis = 1; poseClimber(boy, LD, LD.y(0), handBase('L'), handBase('R'), 0, jar); }
      if (!MOUSE) X.lookLift(0.22);   // (both thumbs will be busy: the camera a little lifted by itself)
      if (!again) {
        if (lv >= 2 && !A.said.src) { A.said.src = 1; X.line(LINES.sukkah52, 6000); setTimeout(() => { if (A.phase === 'climb') say('climb', 5000); }, 6200); }
        else say('climb', 5000);
        setTimeout(() => { if (A.phase === 'climb' && !A.said.ill) { A.said.ill = 1; say('climbIll', 3500); } }, lv >= 2 ? 11500 : 5200);
        if (lv === 3) othersStart();
      } else say('climb', 3000);
      const h = hpt('L'); X.hand({ x: h[0], y: h[1], z: h[2] }, 0, -50);
    }
    function goLadder() {
      A.phase = 'go'; X.hand(null); labelsOff(); try { SL.cups && SL.cups.forEach((c) => { c.visible = true; }); } catch (e) { /* */ }
      for (const c of cups) root.remove(c.g); cups = []; if (jarB) { root.remove(jarB); jarB = null; }
      if (boy) boy.visT = boy.vis = 0;
      if (lv >= 2) X.line(LINES.sukkah52b + ' · ' + LIGHT_LINES.place, 5000);
      // the camera flies to the ladder: the whole of it first, then behind him at its foot
      shot(CAM[lv][0], CAM[lv][1], 1.8);
      later(lv >= 2 ? 3.2 : 2.0, () => { S = climbFresh(topR, oil0); follow(1.4); climbStart(false); });
    }
    /** the camera behind him on the ladder, a little to his right (he stands in the left of the frame; the rungs to come above) */
    function camOf(feetY) {
      const c = LD.at(feetY), R = [-LD.left[0], -LD.left[1]], up = lv === 1 ? 2.4 : 3.0, D = lv === 1 ? 6.2 : 7.2;
      return { p: [c[0] + LD.out[0] * D + R[0] * 2.4, feetY + up + 1.5, c[2] + LD.out[1] * D + R[1] * 2.4], t: [c[0] + R[0] * 0.9 - LD.out[0] * 0.4, feetY + 3.1, c[2] + R[1] * 0.9 - LD.out[1] * 0.4] };
    }
    const follow = (d) => { const q = camOf(LD.y(S ? S.rung : 0)); X.track(q.p, q.t, 2.2, d || 0.9); };
    function climbEvents(e) {
      for (const k of e) {
        if (k === 'perfect') { A.perfect++; const h = S.up; const p = hpt(h); X.quick({ x: p[0], y: p[1] + 0.3, z: p[2] }, QUICK.rung); rise(A.perfect); ev('perfect'); }
        if (k === 'spill') { const sp2 = S.spilled - (A.lastSp || 0); A.lastSp = S.spilled; drip(sp2); if (!A.said.spill || A.t - A.said.spill > 6) { A.said.spill = A.t; say('spill', 2600); } ev('spill'); }
        if (k === 'rung') { ev('rung:' + S.rung); follow(); }
        if (k === 'top') topReached();
        if (k === 'drop') jarFell();
      }
      if (jar) jar.userData.fill(S.oil / 30);
    }
    /** oil drips from the jar's mouth to the floor (each spill) */
    function drip(n) {
      const m0 = jar.localToWorld(new T.Vector3(0, jar.userData.h, 0)), k = clamp(Math.round(n * 3) + 3, 3, 10);
      for (let i = 0; i < k; i++) { const d = new T.Mesh(new T.SphereGeometry(0.05, 5, 4), MT.l30oil); root.add(d); const x0 = m0.x + (i % 3 - 1) * 0.06, z0 = m0.z + ((i * 7) % 3 - 1) * 0.06, y0 = m0.y; const fall = Math.max(0.3, y0 - FLOOR); tween(Math.sqrt(fall / 20) + 0.1 + i * 0.03, (u) => d.position.set(x0, y0 - fall * u * u, z0), () => root.remove(d)); }
    }
    function jarFell() {
      A.drops++; A.dmg++; A.spilled += 0; A.phase = 'fell'; ev('drop'); X.hand(null);
      const foot = [LD.foot[0] + LD.out[0] * 1.2 + LD.left[0] * 0.6, LD.foot[2] + LD.out[1] * 1.2 + LD.left[1] * 0.6];
      const p0 = jar.position.clone(), q0 = jar.quaternion.clone(), fall = Math.max(0.5, p0.y - FLOOR);
      tween(Math.sqrt(fall / 18) + 0.15, (u) => { jar.position.set(p0.x + (foot[0] - p0.x) * u, p0.y - fall * u * u, p0.z + (foot[1] - p0.z) * u); jar.rotation.z += 0.08; }, () => {
        jar.visible = false; jar.quaternion.copy(q0); V.crack(); X.shake(0.2, 0.35);
        const at = [+foot[0].toFixed(2), +foot[1].toFixed(2)];
        brokenJar(X, at, root);
        Mo.mark('light.jar', m.id, at); X.loss(lossPts('light.jar'), { x: foot[0], y: FLOOR + 0.5, z: foot[1] }, LOSS['light.jar'][0]); X.save();
        say('drop', 3600);
        // he never falls: he holds the ladder and climbs down for a new jar
        const r0 = S.rung, yF = LD.y(r0); A.down = { y: yF };
        tween(Math.max(0.8, r0 * 0.12), (u) => { const y = yF * (1 - u) + LD.y(0) * u; A.down.y = y; poseClimber(boy, LD, y, y + HAND_UP, y + HAND_UP + 0.5, 0, null); const q = camOf(y); X.track(q.p, q.t, 3, 0.4); }, () => {
          A.down = null; jar.visible = true; later(1.0, () => climbStart(true));
        });
      });
    }
    function topReached() {
      A.phase = 'top'; X.hand(null); X.lookLift(0);
      const p = hpt(S.L >= S.R ? 'L' : 'R');
      try { X.perfect(LIGHT_LINES.top, { x: p[0], y: p[1], z: p[2] }); } catch (e) { /* */ }
      rise(23); ev('top');
      later(1.6, pourStart);
    }

    /* ═══ the other three boys (light3) ═══ */
    function othersStart() {
      say('others', 3000);
      for (const k of [0, 1, 2, 3]) {
        if (k === myK) continue;
        const L = ladderOf(k), a = boyAdd(L.foot[0], L.foot[2]), jr = jarMesh(X, { parent: root, s: 0.9 }); jr.userData.fill(1);
        const B = { k, L, a, jar: jr, S: climbFresh(L.n - HAND_UP, 30), t: 0, acc: 0, next: 'L', pend: null, drag: 0.35 + 0.05 * others.length, wait: 0.6 + 0.9 * others.length, poured: 0, bowl: 0, lit: 0, flame: null, oilD: null };
        others.push(B); poseBoy(B);
      }
    }
    function poseBoy(B) {
      const S2 = B.S, yL = B.L.y(S2.L + HAND_UP) + (S2.up === 'L' ? 0.5 : 0), yR = B.L.y(S2.R + HAND_UP) + (S2.up === 'R' ? 0.5 : 0);
      poseClimber(B.a, B.L, B.L.y(S2.rung), yL, yR, S2.phi, B.poured ? null : B.jar);
    }
    const BOWLS = lv === 1 ? null : bowlsOf();
    function othersFrame(dt) {
      for (const B of others) {
        if (B.S.rung < B.S.top) { stepBoy(B, dt); poseBoy(B); continue; }
        if (!B.poured) { B.poured = 1; const Bw = BOWLS[B.k]; B.bowl = B.S.oil; B.jar.visible = false; B.oilD = oilDisc(X, Bw, 0.4, 0.7, 0.5, root); B.oilD.userData.set(B.bowl / 30); ev('boy' + B.k + ':top'); }
      }
    }

    /* ═══ 4. the pour, the wick, the flame ═══ */
    const bowlAt = lv === 1 ? [LT.practice.bowl[0], GFLOOR, LT.practice.bowl[1]] : (() => { const b = BOWLS[myK]; return [b.x, b.y, b.z]; })();
    const bowlTop = lv === 1 ? [bowlAt[0], bowlAt[1] + 0.3, bowlAt[2]] : [bowlAt[0], bowlAt[1] + 0.1, bowlAt[2]];
    let P = null, bowlOil = null, stream = null, clay = null, wickM = null, taper = null, flame = null;
    if (lv === 1) { clay = clayBowl(X, bowlAt, root); }
    const jarHold = () => [bowlTop[0] + LD.out[0] * 0.75, bowlTop[1] + 0.35, bowlTop[2] + LD.out[1] * 0.75];
    function pourStart() {
      A.phase = 'pour'; P = pourFresh(S.oil, 30); A.tilt = 0; A.tiltT = 0;
      bowlOil = oilDisc(X, { x: bowlTop[0], y: bowlTop[1], z: bowlTop[2] }, lv === 1 ? 0.25 : 0.4, lv === 1 ? 0.42 : 0.72, lv === 1 ? 0.3 : 0.5, root);
      const R = [-LD.left[0], -LD.left[1]];
      shot([bowlTop[0] + LD.out[0] * 4.2 + R[0] * 1.6, bowlTop[1] + 2.4, bowlTop[2] + LD.out[1] * 4.2 + R[1] * 1.6], [bowlTop[0] + LD.out[0] * 0.6, bowlTop[1] + 0.1, bowlTop[2] + LD.out[1] * 0.6], 1.2);
      const p0 = jar.position.clone(), h = jarHold();
      jar.quaternion.identity();
      tween(0.7, (u) => jar.position.set(p0.x + (h[0] - p0.x) * sm(u), p0.y + (h[1] - p0.y) * sm(u), p0.z + (h[2] - p0.z) * sm(u)));
      if (boy) boy.armT = [1.6, -0.25, 1.6, -0.25];
      if (P.oil < 0.05) { later(0.8, layStart); return; }
      say(lv === 1 ? 'pourClay' : 'pour', 0);
      later(0.75, () => X.hand({ x: h[0], y: h[1] + 0.4, z: h[2] }, -50, 40));
    }
    /** the jar's tilt (0 … 1) as it turns its mouth toward the bowl */
    function jarTilt(k) {
      const h = jarHold(), ax = new T.Vector3(LD.left[0], 0, LD.left[1]);
      jar.position.set(h[0], h[1] - 0.15 * k, h[2]); jar.quaternion.setFromAxisAngle(ax, -1.9 * k);
    }
    const tiltDir = () => { const a = scr(jarHold()), b = scr(bowlTop), d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / d, (b[1] - a[1]) / d, d]; };
    function pourFrame(dt) {
      const f = Object.values(A.fing).includes('jar');
      A.tilt += ((f ? A.tiltT : 0) - A.tilt) * clamp(dt * 10, 0, 1);
      const r = pourStep(P, A.tilt, dt);
      jarTilt(A.tilt); jar.userData.fill(P.oil / 30);
      bowlOil.userData.set(P.bowl / Math.max(1, oil0));
      const flowing = r.into + r.out > 1e-4;
      if (!stream) { stream = new T.Mesh(new T.CylinderGeometry(0.03, 0.02, 1, 6), MT.l30oil); root.add(stream); }
      stream.visible = flowing;
      if (flowing) { const m0 = jar.localToWorld(new T.Vector3(0, jar.userData.h, 0)), b = r.out > r.into ? [bowlTop[0] + LD.left[0] * 0.9, FLOOR + (lv === 1 ? GFLOOR - FLOOR : LT.h - 0.2), bowlTop[2] + LD.left[1] * 0.9] : bowlTop; const d = new T.Vector3(b[0] - m0.x, b[1] - m0.y, b[2] - m0.z), L = d.length() || 0.01; stream.scale.set(1, L, 1); stream.position.set((m0.x + b[0]) / 2, (m0.y + b[1]) / 2, (m0.z + b[2]) / 2); stream.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); }
      if (r.out > 1e-4) { A.outT = (A.outT || 0) + dt; if (!A.said.out) { A.said.out = 1; say('outside', 2600); } if (A.outT > 0.25) { A.outT = 0; drip(0.2); } }
      if (P.oil < 0.05 || P.bowl >= P.cap - 1e-3) {
        A.phase = 'between'; stream.visible = false; X.hand(null); ev('poured:' + P.bowl.toFixed(2));
        if (P.out < 0.01) X.quick({ x: bowlTop[0], y: bowlTop[1] + 0.4, z: bowlTop[2] }, QUICK.poured, clay || null);
        later(0.5, () => { tween(0.5, (u) => jarTilt(1 - u)); later(0.7, layStart); });
      }
    }
    const wickHome = () => [bowlTop[0] + LD.out[0] * 0.8 - LD.left[0] * 0.7, bowlTop[1] + 0.3, bowlTop[2] + LD.out[1] * 0.8 - LD.left[1] * 0.7];
    function layStart() {
      A.phase = 'lay'; if (jar) jar.visible = false;
      const w = A.wicks[0] || WICK.MID;
      wickM = new T.Mesh(new T.CylinderGeometry(w * 0.25, w * 0.25, 0.7, 6), MT.l30linen); wickM.castShadow = true; root.add(wickM); wickM.position.set(...wickHome()); wickM.rotation.z = 1.2;
      say('lay', 0); const h = wickHome(); X.hand({ x: h[0], y: h[1], z: h[2] }, 50, 30);
    }
    const wickTip = () => [bowlTop[0] + LD.out[0] * 0.25, bowlTop[1] + 0.12, bowlTop[2] + LD.out[1] * 0.25];
    function laid() {
      A.phase = 'between'; X.hand(null); V.cloak();
      const t = wickTip(); wickM.position.set((t[0] + bowlTop[0]) / 2, bowlTop[1] + 0.02, (t[2] + bowlTop[2]) / 2); wickM.rotation.set(0, Math.atan2(LD.out[0], LD.out[1]), 0); wickM.rotateX(1.35);
      later(0.5, lightStart);
    }
    const taperHome = () => [bowlTop[0] + LD.out[0] * 1.0 + LD.left[0] * 0.9, bowlTop[1] + 0.45, bowlTop[2] + LD.out[1] * 1.0 + LD.left[1] * 0.9];
    function lightStart() {
      A.phase = 'light';
      taper = new T.Group(); root.add(taper); rod(X, MT.l30woodD, [0, -0.35, 0], [0, 0.15, 0], 0.025, taper); const fl = flameMesh(X, [0, 0.15, 0], taper, 0.35); fl.userData.k = 1; taper.userData.fl = fl;
      taper.position.set(...taperHome());
      say('light', 0); const h = taperHome(); X.hand({ x: h[0], y: h[1], z: h[2] }, -40, 30);
    }
    const taperTip = () => [taper.position.x, taper.position.y + 0.25, taper.position.z];
    function lit() {
      A.phase = 'lit'; X.hand(null); A.lit = 1; ev('lit');
      const t = wickTip(); flame = flameMesh(X, [t[0], t[1] + 0.02, t[2]], root, lv === 1 ? 0.7 : 1.3); flame.userData.k = 0.05;
      tween(1.2, (u) => { flame.userData.k = 0.05 + 0.95 * sm(u); }, () => { X.quick({ x: t[0], y: t[1] + 0.6, z: t[2] }, QUICK.lit, null); });
      later(0.4, () => { if (taper) { root.remove(taper); taper = null; } });
      // (light3: the other three bowls lit in turn from his)
      others.forEach((B, i) => later(1.2 + 0.7 * i, () => { const Bw = BOWLS[B.k]; B.flame = flameMesh(X, [Bw.x + Bw.dir[0] * 0.25, Bw.y + 0.05, Bw.z + Bw.dir[1] * 0.25], root, 1.3); B.flame.userData.k = 0.05; tween(1, (u) => { B.flame.userData.k = 0.05 + 0.95 * sm(u); }); B.lit = 1; }));
      later(1.6 + 0.7 * others.length, finish);
    }
    /** the act's end: the save keeps what burns; the points (any jar broken caps at 10; 40 when no oil was lost and the measure was מהודר) */
    function finish() {
      if (A.phase === 'done') return; A.phase = 'done';
      const L = st.light || (st.light = {}); L.lit = L.lit || {};
      if (lv === 1) L.lit.clay = 1; else L.lit['b' + myK] = 1;
      const bowls = [0, 0, 0, 0], wicks = [WICK.MID, WICK.MID, WICK.MID, WICK.MID];
      if (lv >= 2) { bowls[myK] = +P.bowl.toFixed(2); wicks[myK] = A.wicks[0]; }
      others.forEach((B, i) => { L.lit['b' + B.k] = 1; bowls[B.k] = +B.bowl.toFixed(2); wicks[B.k] = A.wicks[i + 1] || A.wicks[0]; });
      const spilled = +(A.spilled + (S ? S.spilled : 0)).toFixed(3), out = P ? +P.out.toFixed(3) : 0;
      L[m.id] = { wicks: A.wicks.slice(), pours: A.pours.slice(), mehudar: !!A.mehudar, spilled, out, bowl: P ? +P.bowl.toFixed(2) : 0, drops: A.drops, tears: A.tears };
      if (lv === 3) { L.bowls = bowls; L.wicks = wicks; L.reach = lightOf(bowls, wicks).reach; }
      X.save();
      const clean = !(spilled > 0.01) && !(out > 0.01) && !!A.mehudar, pts = grade(A.dmg, clean), q = qOf(pts);
      X.end({ stars: starsOf(q), q, pts, perfect: pts >= 40, flags: { spilled, out, 'light.jar': A.drops, tears: A.tears, over: A.over, mehudar: A.mehudar ? 1 : 0, perfectRungs: A.perfect }, at: { x: bowlTop[0], y: bowlTop[1] + 0.6, z: bowlTop[2] } });
    }

    /* ═══ the fingers ═══ */
    const handNear = (f, h) => S && !(S.up && S.up !== h) && near(f, hpt(h), gripPx());
    const FG = fingers(X, {
      down(f) {
        const btn = f.type === 'mouse' ? A.btn : -1;
        if (A.phase === 'wick') {
          if (!MOUSE && near(f, holdPt(), gripPx() * 1.3) && !Object.values(A.fing).includes('cloth')) { A.fing[f.id] = 'cloth'; f.k = 'cloth'; X.hand(null); return; }
          // the edge: where the thumb takes it is the strip's width
          const a = scr(edgePt(0)), b = scr(edgePt(1)), vx = b[0] - a[0], vy = b[1] - a[1], L2 = vx * vx + vy * vy || 1;
          const u = ((f.x - a[0]) * vx + (f.y - a[1]) * vy) / L2, dx = f.x - (a[0] + u * vx), dy = f.y - (a[1] + u * vy);
          if (u > -0.6 && u < 1.6 && Math.hypot(dx, dy) < gripPx()) {
            A.fing[f.id] = 'strip'; f.k = 'strip'; f.w = widthAt(u); f.d = 0; f.v = 0; X.hand(null);
            WS = wickFresh(f.w); WS.tears = A.tearSince | 0; stripAt(0, f.w); ev('take:' + f.w);
          }
          return;
        }
        if (A.phase === 'oil') { const c = cupUnder(f); if (c) { A.fing[f.id] = 'cup'; f.k = 'cup'; f.cup = c; c.drag = 1; X.hand(null); } return; }
        if (A.phase === 'climb' && S) {
          let h = null;
          if (MOUSE) { const want = btn === 2 ? 'R' : 'L'; if (handNear(f, want)) h = want; }
          else { const dL = handNear(f, 'L') ? Math.hypot(f.x - scr(hpt('L'))[0], f.y - scr(hpt('L'))[1]) : 1e9, dR = handNear(f, 'R') ? Math.hypot(f.x - scr(hpt('R'))[0], f.y - scr(hpt('R'))[1]) : 1e9; if (dL < 1e9 || dR < 1e9) h = dL <= dR ? 'L' : 'R'; }
          if (!h || Object.values(A.fing).includes(h)) return;
          A.fing[f.id] = h; f.k = h; f.p0 = S.up === h ? hands[h].p : 0; X.hand(null);
          if (S.up !== h) { climbEvents(climbStep(S, { h, a: 'lift' }, 0)); hands[h].p = 0; A.steps++; ev('lift:' + h); }
          return;
        }
        if (A.phase === 'pour' && near(f, jarHold(), gripPx() * 1.2)) { A.fing[f.id] = 'jar'; f.k = 'jar'; X.hand(null); return; }
        if (A.phase === 'lay' && near(f, wickM.position.toArray(), gripPx())) { A.fing[f.id] = 'wick'; f.k = 'wick'; X.hand(null); return; }
        if (A.phase === 'light' && taper && near(f, taper.position.toArray(), gripPx())) { A.fing[f.id] = 'taper'; f.k = 'taper'; X.hand(null); }
      },
      move(f) {
        if (f.k === 'strip') { f.mv = 1; return; }   // (the pull is read in update(): its speed in the act's own time)
        if (f.k === 'cup') { const p = onPlane(f, FLOOR + 1.9); if (p) f.cup.g.position.set(p[0], p[1], p[2]); return; }
        if (f.k === 'L' || f.k === 'R') {
          const h = f.k, a = scr(handPt(h, LD, handBase(h))), b = scr(handPt(h, LD, handBase(h) + 1)), px = Math.hypot(b[0] - a[0], b[1] - a[1]) || 40;
          const ux = (b[0] - a[0]) / px, uy = (b[1] - a[1]) / px; hands[h].p = clamp(f.p0 + ((f.x - f.x0) * ux + (f.y - f.y0) * uy) / px, 0, 1.15); return;
        }
        if (f.k === 'jar') { const [ux, uy, d] = tiltDir(); A.tiltT = clamp(((f.x - f.x0) * ux + (f.y - f.y0) * uy) / Math.max(90, Math.min(d * 1.4, 0.32 * innerHeight)), 0, 1); return; }
        if (f.k === 'wick' || f.k === 'taper') { const o = f.k === 'wick' ? wickM : taper, home = f.k === 'wick' ? wickHome() : taperHome(); const pl = onPlane(f, home[1]); if (pl) { const dx = pl[0] - home[0], dz = pl[2] - home[2], L = Math.hypot(dx, dz), k = L > 2.5 ? 2.5 / L : 1; o.position.set(home[0] + dx * k, home[1], home[2] + dz * k); } if (f.k === 'taper' && A.phase === 'light') { const a = taper.position, b = wickTip(); if (Math.hypot(a.x - b[0], a.z - b[2]) < 0.3) lit(); } }
      },
      up(f) {
        const k = f.k; delete A.fing[f.id];
        if (k === 'strip') { if (!f.done) { cloth.position.x = cx; if (!f.torn && WS && WS.len > 0) { if (strip) strip.visible = false; } WS = null; } return; }
        if (k === 'cup') { f.cup.drag = 0; cupDrop(f.cup, f); return; }
        if (k === 'L' || k === 'R') { if (A.phase === 'climb' && S && S.up === k && hands[k].p >= 0.55) { hands[k].p = 0; climbEvents(climbStep(S, { h: k, a: 'place' }, 0)); ev('place:' + k); } return; }
        if (k === 'jar') { A.tiltT = 0; return; }
        if (k === 'wick' && A.phase === 'lay') { const a = wickM.position; if (Math.hypot(a.x - bowlTop[0], a.z - bowlTop[2]) < 0.45) laid(); else wickM.position.set(...wickHome()); return; }
        if (k === 'taper' && taper) taper.position.set(...taperHome());
      },
    });

    // (the wick's pull speed and the jar on the ladder: read each frame in the act's time)
    function stripFrame(dt) { for (const f of FG.L.values()) if (f.k === 'strip' && !f.done) wickMove(f, dt); }
    function climbFrame(dt) {
      climbEvents(climbStep(S, null, dt));
      if (A.phase !== 'climb' || !boy) return;
      poseClimber(boy, LD, LD.y(S.rung), handY('L'), handY('R'), S.phi, jar);
    }
    const lightNow = () => { try { const L = X.lookNow(); return L; } catch (e) { return null; } };

    return {
      close: true, hintOnce: true,
      begin() {
        FG.attach();
        // which way the strip comes off: toward the screen's right
        closeShot([W.cloth[0] - 0.2, W.cloth[1], W.cloth[2]], CAM.wicks[0], 4.6, 0.4, 1.3);
        later(0.05, () => { const a = X.scr(cx, cy, cz), b = X.scr(cx - 1, cy, cz); pullDir = b.x > a.x ? [-1, 0] : [1, 0]; clothDraw(); });
        X.line(LIGHT_LINES['w' + lv], 2400);
        later(1.6, wickStart);
      },
      update(dt) {
        A.t += dt;
        try {
          V.frame();
          for (const tw of A.tw.slice()) { tw.t += dt; const u = clamp(tw.t / tw.dur, 0, 1); tw.fn(u); if (u >= 1) { const i = A.tw.indexOf(tw); if (i >= 0) A.tw.splice(i, 1); if (tw.done) tw.done(); } }
          if (A.phase === 'wick') stripFrame(dt);
          if (A.phase === 'oil') labelsFrame();
          if (A.phase === 'climb' && S) climbFrame(dt);
          if (A.phase === 'pour' && P) pourFrame(dt);
          if (others.length) othersFrame(dt);
          if (flame) flame.userData.tick(A.t); if (taper) taper.userData.fl.userData.tick(A.t);
          for (const B of others) if (B.flame) B.flame.userData.tick(A.t);
        } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h130] light', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
      },
      down(p) { A.btn = p && p.button | 0; FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { for (const f of FG.L.values()) FG.up(f); A.fing = {}; },
      /** rule 66: on the right a touch is the act's only on its own grips; on the ladder, also while the jar is not quiet (both his
       *  hands are on the work then); with both hands holding and the jar quiet, empty space is the camera's */
      wants(p) {
        if (!p) return true;
        const f = { x: p.x, y: p.y };
        if (A.phase === 'wick') { const a = scr(edgePt(0)), b = scr(edgePt(1)); return Math.hypot(f.x - (a[0] + b[0]) / 2, f.y - (a[1] + b[1]) / 2) < gripPx() * 1.4 || near(f, holdPt(), gripPx() * 1.3); }
        if (A.phase === 'oil') return !!cupUnder(f);
        if (A.phase === 'climb' && S) return handNear(f, 'L') || handNear(f, 'R') || !climbQuiet(S);
        if (A.phase === 'pour') return near(f, jarHold(), gripPx() * 1.2);
        if (A.phase === 'lay') return !!wickM && near(f, wickM.position.toArray(), gripPx());
        if (A.phase === 'light') return !!taper && near(f, taper.position.toArray(), gripPx());
        return false;
      },
      /** the mouse's right button is the boy's right hand, on it */
      mouseRight(p) { return A.phase === 'climb' && !!S && handNear({ x: p.x, y: p.y }, 'R'); },
      holds() { return Object.keys(A.fing).length > 0; },
      end() {
        X.lookLift(0); FG.detach(); V.stop(); X.hand(null); labelsOff();
        try { SL.cups && SL.cups.forEach((c) => { c.visible = true; }); } catch (e) { /* */ }
        if (boy) AC.remove(boy); for (const B of others) if (B.a) AC.remove(B.a);
        X.props.remove(root);
      },
      at() { return new T.Vector3(...(A.phase === 'wick' || A.phase === 'intro' ? W.cloth : A.phase === 'oil' || A.phase === 'oilcard' ? ML.jar : S && (A.phase === 'climb' || A.phase === 'fell') ? LD.at(LD.y(S.rung) + 2) : bowlTop)); },
      dbg() {
        const o = { id: m.id, lv, phase: A.phase, mouse: MOUSE, ev: A.ev.slice(-10), nf: FG.n, fing: Object.values(A.fing), wicks: A.wicks.slice(), tears: A.tears, gripPx: Math.round(gripPx()), dmg: A.dmg, drops: A.drops, perfect: A.perfect, steps: A.steps, look: lightNow() };
        if (A.phase === 'wick') { o.hold = scr(holdPt()); o.edge = [scr(edgePt(0)), scr(edgePt(1))]; const P2 = pxA(); o.pull = { px: Math.round(P2.px), ux: +P2.ux.toFixed(3), uy: +P2.uy.toFixed(3), limit: WICK.LIMIT, len: WICK.LEN }; o.strip = WS ? { w: WS.w, len: +WS.len.toFixed(3), tears: WS.tears } : null; o.need = nStrips; }
        if (A.phase === 'oil' || A.phase === 'oilcard') { o.cups = cups.map((c) => ({ id: c.id, log: c.log, at: scr([c.g.position.x, c.g.position.y + c.g.userData.s * 0.8, c.g.position.z]), busy: !!c.busy })); o.jar = jarB ? scr(jarMouth()) : null; o.pours = A.pours.slice(); o.total = OS.total || 0; o.min = minPours(30); }
        if (S) { o.climb = { rung: S.rung, top: S.top, L: S.L, R: S.R, up: S.up, phi: +S.phi.toFixed(3), w: +S.w.toFixed(3), oil: +S.oil.toFixed(2), spilled: +S.spilled.toFixed(3), quiet: climbQuiet(S), hands: { L: scr(hpt('L')), R: scr(hpt('R')) }, next: { L: scr(handPt('L', LD, handBase('L') + 1)), R: scr(handPt('R', LD, handBase('R') + 1)) }, p: { L: +hands.L.p.toFixed(2), R: +hands.R.p.toFixed(2) }, MID: CLIMB.MID, SPILL: CLIMB.SPILL }; }
        if (P) { o.pour = { oil: +P.oil.toFixed(2), bowl: +P.bowl.toFixed(2), out: +P.out.toFixed(3), tilt: +A.tilt.toFixed(2), jar: scr(jarHold()), bowlAt: scr(bowlTop), dir: tiltDir().map((v) => +v.toFixed(3)) }; }
        if (A.phase === 'lay' && wickM) { o.wick = scr(wickM.position.toArray()); o.bowl = scr(bowlTop); o.aim = scr([bowlTop[0], wickHome()[1], bowlTop[2]]); }
        if (A.phase === 'light' && taper) { o.taper = scr(taper.position.toArray()); o.tip = scr(taperTip()); o.wickTip = scr(wickTip()); const wt = wickTip(); o.aim = scr([wt[0], taperHome()[1], wt[2]]); }
        if (others.length) o.others = others.map((B) => ({ k: B.k, rung: B.S.rung, top: B.S.top, oil: +B.S.oil.toFixed(2), poured: B.poured, lit: B.lit }));
        return o;
      },
    };
  },
};
