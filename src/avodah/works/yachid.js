/* ── bloodb25 ── yachid.js — קרבנות היחיד at the north rings, each by its own kind (DAM25 §3, §2.4; the owner: "דם כן, פגר לא").
 * The kinds come from the gate's queue (offerq.js: the order the אמרכל sent them in, two an errand; with none sent: חטאת · קן):
 *   every beast   the owner leads it to the ring and leans both hands (סמיכה) · THE SCREEN: the slaughter is behind the linen, the moment of
 *                 gravity — a deep soft tone, 1.2 s of stillness, no "+N", a tap in it is swallowed (zero points: we reward the work, not the
 *                 killing) · the receiver comes out from behind it with the vessel, a dark liquid in it (קבלה: the first "+N")
 *   עולה/שלמים   two gifts that are four, below the red line: north-east, then (round the north and the west) south-west (זבחים ה, ד; תמיד ד, א)
 *   חטאת         up the ramp, right onto the walk, the four horns by the finger in order — south-east, north-east, north-west, south-west —
 *                 a small dark dot on each horn's top ABOVE the line; the finger wiped on the vessel's rim (זבחים ה, ג; רמב"ם מעשה הקרבנות ה).
 *                 A horn out of order: "קודם …", and it waits — no penalty
 *   קן (עוף)     no screen and no leaning: the kohen's back hides the מליקה; the camera on the altar's wall; the mark below (חטאת העוף, first:
 *                 זבחים י, ד · לבדיקה) or above (עולת העוף), and the חטאת's rest drained to the yesod (זבחים ו, ב–ה · לבדיקה)
 *   every one     the rest poured on the southern yesod (שיריים — תמיד ד, א; מידות ג, ב); the bird's drained there
 * Red only as the offering's blood: the liquid in the vessel and the marks on the altar's stone (the world's own, avodah3d cornerMarks via
 * blood.js worldMark). Never on a beast, a kohen, the floor or in the air. Taps alone finish it. No Divine Name. ── /bloodb25 ── */
import { baseModel, clamp, ease } from './craft.js';
import { man, lamb, ROBE, SKIN } from './figures.js';
import { mk, lerp, STONE, STONE2, GOLD, LINEN, memune, cue, says, tickSay } from './dawn.js';
import { ringKinds } from './offerq.js';
import { figW, labelW, cueW, follow, along, plen, slow, dirL } from './places24.js';
import { BLOOD, GRAVE, graveStart, graveStep, worldMark, worldShirayim, liquid, tagBlood } from './blood.js';   // (BLOODA25: the one palette, the moment of gravity, the real altar's marks)

/* ───────── the kinds and their chains ───────── */
export const KINDS = {
  olah: { he: 'עולה — כבש', robe: '#7F9A83', wool: undefined, sc: 1.3 },
  shelamim: { he: 'שלמים — איל', robe: '#8E8AA8', wool: '#E8DFC9', sc: 1.5 },
  chatat: { he: 'חטאת — שעירה', robe: '#A39A6E', wool: '#B09C7C', sc: 1.3 },
  ken: { he: 'קן — שתי תורים', robe: '#9A8A6E' },
};
export const HORNS = ['SE', 'NE', 'NW', 'SW'];   // (זבחים ה, ג: דרומית מזרחית, מזרחית צפונית, צפונית מערבית, מערבית דרומית)
export const HORN_HE = { SE: 'דרומית־מזרחית', NE: 'מזרחית־צפונית', NW: 'צפונית־מערבית', SW: 'מערבית־דרומית' };
export const YACHID_LINES = {
  recv: 'שחט השוחט וקבל המקבל — בכלי שרת, בצפון',
  zerika: 'שתי מתנות שהן ארבע — למטה מחוט הסיקרא',
  chatat: 'החטאת — באצבע, על ארבע הקרנות, למעלה',
  shirayim: 'ושירים היה שופך על יסוד דרומית',
  bird: 'חטאת העוף — למטה; עולת העוף — למעלה',
};
/** one round's steps by its kind (r: the round's index) */
export function stepsOf(kind, r) {
  const K = KINDS[kind] || KINDS.olah, S = [];
  const P = (o) => S.push(Object.assign({ r, kind }, o));
  if (kind === 'ken') {
    P({ k: 'bring', d: 1.0, say: K.he, sayT: 2, sfx: 'soft', at: () => [SPOT.a - 0.9, SPOT.s - 0.2, 2.0] });
    // חטאת העוף first (זבחים י, ד · לבדיקה): at the south-west corner, below; the rest drained to the yesod
    P({ k: 'melak', c: 'SW', level: 'lower', bird: 'chatat', d: 1.5, say: 'חטאת העוף — למטה', sayT: 2.2, sfx: 'soft', at: () => [ALTC.a - 0.6, ALTC.s, 0.9], done: (m) => markOn(m, 'SW', 'lower') });
    P({ k: 'mitzui', c: 'SW', d: 1.0, say: 'והשאר מתמצה ליסוד', sayT: 2, sfx: 'soft', at: () => [ALTC.a - 0.6, ALTC.s, 0.25], done: (m) => markOn(m, 'SW', 'yesod') });
    P({ k: 'melak', c: 'SE', level: 'upper', bird: 'olah', d: 1.5, say: 'עולת העוף — למעלה', sayT: 2.2, sfx: 'soft', at: () => [ALTC.a - 0.6, ALTC.s, 1.7], done: (m) => { markOn(m, 'SE', 'upper'); m.say = YACHID_LINES.bird; m.sayT = 5; m.mentorLine = { text: YACHID_LINES.bird, src: 'זבחים ו, ב–ה · לבדיקה' }; } });
    return S;
  }
  P({ k: 'lead', d: 1.0, say: K.he, sayT: 2, sfx: 'soft', at: () => [SPOT.a - 0.9, SPOT.s - 0.2, 2.0] });
  P({ k: 'lean', d: 0.9, say: 'סמיכה — בשתי ידיו', sayT: 2, sfx: 'soft', at: () => [SPOT.a - 0.9, SPOT.s - 0.2, 2.0], done: (m) => { m.leaned++; } });
  // the moment of gravity (§2.4): the screen, the deep tone, stillness — no pay, no cue, a tap in it is swallowed
  P({ k: 'shecht', d: 0.6 + GRAVE.dur, nopay: true, swallow: true, begin: (m) => { graveStart(m); m.screenUp = 1; }, done: (m) => { m.slaughtered++; } });
  P({ k: 'recv', d: 0.9, say: YACHID_LINES.recv, sayT: 2.4, sfx: 'chime', o: { n: 2 }, at: () => [KOH.a, KOH.s, 1.4], done: (m) => { m.fill = 0.7; m.screenUp = 0; } });
  if (kind === 'chatat') {
    P({ k: 'up', d: 1.2, say: 'עולה בכבש, ופונה לימין — לסובב', sayT: 2.2, sfx: 'soft', at: () => [ALTC.a, ALTC.s, 1.5] });
    HORNS.forEach((c, j) => P({ k: 'horn', c, j, d: 0.8, say: j === 0 ? `${HORN_HE[c]} — טובל אצבע ונותן` : j === 3 ? YACHID_LINES.chatat : HORN_HE[c], sayT: j === 3 ? 3 : 1.6, sfx: j === 3 ? 'chime' : 'soft', o: { n: 2 }, at: () => hornAt(c), done: (m) => { markOn(m, c, 'upper'); m.wiped++; } }));
  } else {
    P({ k: 'zerika', c: 'NE', d: 1.2, say: 'קרן מזרחית צפונית', sayT: 1.8, sfx: 'soft', at: () => [ALTC.a - 0.6, ALTC.s - 0.6, 0.8], done: (m) => markOn(m, 'NE', 'lower') });
    P({ k: 'zerika', c: 'SW', d: 1.2, say: YACHID_LINES.zerika, sayT: 2.4, sfx: 'chime', o: { n: 2 }, at: () => [ALTC.a - 0.6, ALTC.s + 0.6, 0.8], done: (m) => markOn(m, 'SW', 'lower') });
  }
  P({ k: 'shirayim', d: 1.1, say: YACHID_LINES.shirayim, sayT: 2.4, sfx: 'soft', at: () => [ALTC.a - 0.5, ALTC.s + 0.9, 0.2], done: (m) => { m.fill = 0; m.poured++; try { worldShirayim(); } catch (e) { /* the world's */ } } });
  return S;
}
/** a mark on the real altar (blood.js worldMark → avodah3d cornerMarks), and the model's own record (tests, the diorama) */
function markOn(m, c, level) { m.marks.push({ c, level, r: m.cur ? m.cur.r : -1 }); try { worldMark(c, level); } catch (e) { /* the world's */ } }

/* ───────── the chain (more.js's, plus: a step that does not pay, one that swallows the taps that came during it, a horn by choice) ───────── */
function chainY(o, steps, coach, init) {
  const M = baseModel('yachid', o, {
    n: steps.length, coach, ready: (m) => !m.cur,
    tap(m) { const s = steps[m.i]; if (!s) return; m.cur = s; m.u = 0; if (s.begin) s.begin(m); if (s.sfx) m.fx.push({ sfx: s.sfx, o: s.o, haptic: s.haptic || 8 }); },
    aim(m, dx, dy) {
      // a drag toward a horn chooses it (the precise act); anything else is a tap
      const s = steps[m.i];
      if (s && s.k === 'horn' && m.scr && m.scr.cue) { let best = null, bd = -2; const L = Math.hypot(dx, dy) || 1; for (const c of HORNS) { const p = m.scr[c]; if (!p) continue; const vx = p[0] - m.scr.cue[0], vy = p[1] - m.scr.cue[1], l = Math.hypot(vx, vy) || 1, d = (vx * dx + vy * dy) / (l * L); if (d > bd) { bd = d; best = c; } } if (best) { m.horn(best); return; } }
      this.tap(m);
    },
    step(m, dt) {
      tickSay(m, dt);
      graveStep(m, dt);   // (the moment of gravity runs its 1.2 s: taps swallowed, the music back up after)
      const s = m.cur; if (!s) return;
      m.u = Math.min(1, m.u + dt / (s.d || 0.5));
      if (s.tick) s.tick(m, m.u);
      if (m.u < 1) return;
      if (s.done) s.done(m);
      m.cur = null; m.u = 0;
      if (s.swallow) m.pending = 0;   // (the moment of gravity: a tap in it is swallowed, never paid, never punished)
      if (!s.nopay) m.pay(s.at ? s.at(m) : null, s.say || '');
      if (s.say) { m.say = s.say; m.sayT = s.sayT || 1.6; }
      m.advance();
    },
  });
  Object.assign(M, { cur: null, u: 0, sayT: 0, later: [], steps, marks: [], fill: 0, leaned: 0, slaughtered: 0, wiped: 0, poured: 0, screenUp: 0, wrong: 0, scr: null, mentorLine: null });
  /** the horn the player chose (a drag toward it, or a test): the right one is the act; another — "קודם …", and it waits (no penalty) */
  M.horn = (c) => {
    if (M.phase !== 'work') return false;
    const s = steps[M.i]; if (!s || s.k !== 'horn' || M.cur) return false;
    if (c !== s.c) { M.wrong++; M.warn = 'קודם ' + HORN_HE[s.c]; M.warnT = 1.8; return false; }
    M.twinTap(); return true;
  };
  M.kinds = [...new Set(steps.map((s) => s.kind))]; M.rounds = []; for (const s of steps) M.rounds[s.r] = s.kind;
  if (init) init(M);
  try { globalThis.__P24M = M; globalThis.__YACHID = M; } catch (e) { /* tests */ }
  return M;
}
export const YACHID_STEPS = ringKinds().flatMap((kd, r) => stepsOf(kd, r));
export function yachidModel(o = {}) {
  let T = null; try { T = globalThis.__YACHID_KINDS; } catch (e) { /* */ }   // (a test may name the rounds)
  const kinds = Array.isArray(o.kinds) && o.kinds.length ? o.kinds : Array.isArray(T) && T.length ? T : ringKinds();
  const steps = kinds.flatMap((kd, r) => stepsOf(kd, r));
  return chainY(o, steps, "הקישו על 'עבודה' — הבעלים מביא וסומך; המסך; הכהן מקבל בכלי ונותן על המזבח — כל קרבן כדינו");
}
const cu = (m) => (m.cur ? m.cur.k : '');
const stepAt = (M) => M.cur || M.steps[Math.min(M.i, M.steps.length - 1)];
const roundOf = (M) => { const s = stepAt(M); return s ? s.r : 0; };
const kindOf = (M) => { const s = stepAt(M); return s ? s.kind : 'olah'; };
/** a step of this round already done (by its tag) */
const doneIn = (M, k) => { for (let i = 0; i < M.i; i++) { const s = M.steps[i]; if (s.r === roundOf(M) && s.k === k) return true; } return false; };

/* ───────── the diorama (the model stage, when the real places are off) ───────── */
const SPOT = { a: 3.3, s: -0.6 }, ENTER = { a: 1.4, s: -3.3 }, KOH = { a: 4.0, s: 0.9 }, ALTC = { a: 5.3, s: 2.6 };
const AH = 1.1;   // the diorama altar's height
/** where he stands to give at a corner (on the floor, 1.1 off the horn along the line: no mark within 1.5 amot of a figure — DAM25 §4.4) */
const standAt = (c) => { const h = hornAt(c); return [h[0] + (c[1] === 'E' ? -1.1 : 1.1), h[1]]; };
const hornAt = (c) => [ALTC.a + 0.3 + (c[1] === 'E' ? -0.5 : 0.5), ALTC.s + (c[0] === 'S' ? 0.62 : -0.62), AH + 0.3];
export const SCREEN_H = 2.4;   // (DAM25 §4.5: the screen high enough that the camera never sees over it)
export function yachidDraw(k, M, T) {
  if (!M) return;
  const kd = cu(M), u = M.u, kind = kindOf(M), K = KINDS[kind] || KINDS.olah, bird = kind === 'ken';
  k.b(3.5, 0, 0.02, 6.4, 6.6, 0.04, '#D4CBB5');
  k.label('הטבעות — בצפון', 2.6, -2.2, 1.4, 0.24);
  // the altar's corner: a block with its four horns (the line is the world's own: not drawn in the model)
  k.b(ALTC.a + 0.3, ALTC.s, AH / 2, 1.5, 1.2, AH, STONE);
  for (const c of HORNS) { const h = hornAt(c); k.b(h[0], h[1], AH + 0.1, 0.2, 0.2, 0.2, STONE2); }
  k.label('המזבח', ALTC.a + 0.4, ALTC.s, AH + 0.75, 0.22);
  // the marks of this work, on the stone: below (a Γ of two small faces), above (a dot on the horn), the yesod (low)
  for (const mk of M.marks) {
    const h = hornAt(mk.c);
    if (mk.level === 'upper') { k.s(h[0], h[1], AH + 0.21, 0.05, 0.02, 0.05, BLOOD.mark); tagBlood(k, 'horn'); }
    else { const y = mk.level === 'yesod' ? 0.12 : AH * 0.3, tg = mk.level === 'yesod' ? 'yesod' : 'horn'; k.b(h[0] - 0.09, h[1], y, 0.14, 0.02, 0.2, BLOOD.mark); tagBlood(k, tg); k.b(h[0], h[1] + (mk.c[0] === 'S' ? 0.11 : -0.11), y, 0.02, 0.14, 0.2, BLOOD.mark); tagBlood(k, tg); }
  }
  // the beast: led to the spot, stands; from the screen on it is never drawn again
  const fin = M.i >= M.steps.length, r = roundOf(M);
  const lead = kd === 'lead' ? ease(u) : doneIn(M, 'lead') ? 1 : 0, gone = doneIn(M, 'shecht') || kd === 'shecht';
  if (!bird && !fin && !gone) lamb(k, lerpA(ENTER.a, SPOT.a, lead), lerpA(ENTER.s, SPOT.s, lead), 0, { yaw: lead < 1 ? Math.atan2(SPOT.s - ENTER.s, SPOT.a - ENTER.a) : 0, scale: K.sc, wool: K.wool, step: kd === 'lead' ? T * 8 : 0, t: T, head: kd === 'lean' ? 0.1 : 0.4 });
  // the owner: beside it; both hands on its head; steps back as the screen rises
  const back = gone ? 1 : 0;
  if (!fin) man(k, lerpA(lerpA(ENTER.a - 0.5, SPOT.a - 0.9, bird ? 1 : lead), ENTER.a + 0.4, back), lerpA(lerpA(ENTER.s - 0.1, SPOT.s - 0.2, bird ? 1 : lead), ENTER.s + 0.2, back), 0, { robe: K.robe, skin: SKIN[r % 3], yaw: back ? Math.PI : 0, arms: kd === 'lean' ? 0.95 : 0.3, lean: kd === 'lean' ? 0.5 * Math.sin(clamp(u) * Math.PI) : 0.1 });
  // the next owners wait at the door
  for (let q = r + 1; q < M.rounds.length; q++) man(k, 0.9, -3.8 + (q - r) * 0.55, 0, { robe: (KINDS[M.rounds[q]] || KINDS.olah).robe, yaw: 0.3, arms: 0.1, skin: SKIN[q % 3] });
  // the screen of linen (§2.4): up for the act, high — the camera never sees over it; its two kohanim bow their heads in the stillness
  const sc = kd === 'shecht' ? ease(clamp(u / (0.6 / M.cur.d))) : kd === 'recv' ? 1 - ease(clamp((u - 0.5) / 0.5)) : 0;
  if (sc > 0) { const sw = 2.6 * sc; k.b(SPOT.a - 0.8, SPOT.s - 1.3 + sw / 2, SCREEN_H / 2, sw, 0.06, SCREEN_H, LINEN); k.b(SPOT.a - 0.8, SPOT.s - 1.3 + sw / 2, SCREEN_H + 0.04, sw + 0.1, 0.1, 0.08, '#C9B58A'); for (const sg of [0, 1]) man(k, SPOT.a - 1.1, SPOT.s - 1.3 + sg * sw, 0, { robe: ROBE.kohen, yaw: Math.PI * 0.1, arms: 0.95, lean: kd === 'shecht' && u > 0.35 ? 0.35 : 0, skin: SKIN[sg + 1] }); }
  // the receiver (or, for the birds, the kohen at the wall)
  const P = priestD(M, kd, u), g = man(k, P.a, P.s, P.y, { robe: ROBE.kohen, yaw: P.yaw, arms: P.arms, skin: SKIN[1] });
  if (!bird && (M.fill > 0 || kd === 'recv')) vesselD(k, P, kd === 'zerika' || kd === 'shirayim' ? clamp((u - 0.6) / 0.3) : 0, M.fill > 0 || (kd === 'recv' && u > 0.5));
  if (bird && (kd === 'bring' || (kd === 'melak' && u < 0.3))) { const ca = Math.cos(P.yaw), sa = Math.sin(P.yaw); k.s(P.a + ca * 0.35, P.s + sa * 0.35, P.y + 1.05, 0.09, 0.07, 0.12, '#B9B4AA'); k.s(P.a + ca * 0.45, P.s + sa * 0.45, P.y + 1.12, 0.045, 0.045, 0.045, '#A9A49A'); }
  void g;
  memune(k, 1.4, 1.8, SPOT.a, SPOT.s, 0.3, T);
  if (M.phase === 'work' && !M.cur) { const t = yachidTarget(M); cue(k, M, t[0], t[1], t[2] > 1.2 ? AH : 0, 0.55, T); }
  says(k, M);
}
const lerpA = (a, b, u) => a + (b - a) * clamp(u);
function priestD(M, kd, u) {
  const kind = kindOf(M), s = stepAt(M);
  const at = (c, arms) => { const p = standAt(c), h = hornAt(c); return { a: p[0], s: p[1], y: 0, yaw: Math.atan2(h[1] - p[1], h[0] - p[0]), arms }; };
  if (kind === 'ken') return at(s && s.c ? s.c : 'SW', kd === 'melak' ? 0.95 : 0.5);
  if (kd === 'recv') return { a: lerpA(SPOT.a - 0.2, KOH.a, ease(u)), s: lerpA(SPOT.s - 0.2, KOH.s, ease(u)), y: 0, yaw: -Math.PI * 0.4, arms: 0.7 };
  if (s && (s.k === 'zerika' || s.k === 'horn' || s.k === 'up')) {
    const c = s.k === 'up' ? 'SE' : s.c, P = at(c, kd === 'horn' || kd === 'zerika' ? 0.95 : 0.6);
    if (M.cur && (kd === 'zerika' || kd === 'up')) { const w = ease(clamp(u / 0.6)); P.a = lerpA(KOH.a, P.a, w); P.s = lerpA(KOH.s, P.s, w); }
    return P;
  }
  if (s && s.k === 'shirayim') return at('SW', 0.6);
  return { a: KOH.a, s: KOH.s, y: 0, yaw: -Math.PI * 0.5, arms: 0.7 };
}
/** the vessel in his hands (gold) and, while there is something in it, the dark liquid (level, even as the vessel tilts) */
function vesselD(k, P, tilt, full) {
  const ca = Math.cos(P.yaw), sa = Math.sin(P.yaw), va = P.a + ca * 0.55, vs = P.s + sa * 0.55, vy = P.y + 1.15;
  k.c(va, vs, vy, 0.13, 0.26, GOLD, { yaw: -P.yaw, pitch: -tilt * 0.9 }); k.c(va, vs, vy - 0.17, 0.05, 0.12, GOLD);
  if (full) liquid(k, va, vs, vy + 0.1 - tilt * 0.05, 0.1, tilt);
}
function yachidTarget(M) {
  const s = M.steps[Math.min(M.i, M.steps.length - 1)]; if (!s) return [SPOT.a, SPOT.s, 1.3];
  if (s.k === 'lead' || s.k === 'lean' || s.k === 'shecht' || s.k === 'bring') return [SPOT.a, SPOT.s, 1.3];
  if (s.k === 'recv') return [KOH.a, KOH.s, 1.4];
  if (s.k === 'horn' || s.k === 'melak' || s.k === 'mitzui' || s.k === 'zerika' || s.k === 'up') { const h = hornAt(s.c || 'SE'); return [h[0], h[1], h[2]]; }
  return [ALTC.a - 0.5, ALTC.s + 0.9, 0.4];
}

/* ───────── on the real places: the rings, the altar's corners, the ramp, the walk round the top, the yesod (anchor 'rings') ───────── */
const RG = [-41, -37.5];                                                  // the ring (מדות ג, ה: the second row; ⚑ which ring — המחשה)
const R_FROM = [-50.5, -46.5], R_OWN = [RG[0] - 1.6, RG[1] - 0.4], R_RECV = [RG[0] + 3.4, RG[1] + 2.6];
const SCR = { z: RG[1] + 1.6, x0: RG[0] - 3, w: 6, h: 4.2 };              // the screen, real amot: between the ring and the camera
const C4 = { NE: [-23, -18.5], NW: [-53, -18.5], SE: [-23, 11.5], SW: [-53, 11.5] };
const FLOOR_AT = { NE: [-20.8, -20.9], SW: [-55.6, 13.9] };               // (where he stands at a corner to give below the line)
const TOP_AT = { SE: [-25.9, 8.3], NE: [-25.9, -15.3], NW: [-50.1, -15.3], SW: [-50.1, 8.3] };   // (on the walk round the top, beside each horn)
const HORN_W = { SE: [-24.5, 10], NE: [-24.5, -17], NW: [-51.5, -17], SW: [-51.5, 10] };       // (the horn he faces)
const YES_S = [-52.2, 13.05], YES_FACE = [-52.2, 11];
const RAMP_FOOT = [-37.5, 41.5], RAMP_TOP = [-37.5, 11.5];
const PATH = {
  NE: [R_RECV, [-31.5, -24.6], FLOOR_AT.NE], SW: [FLOOR_AT.NE, [-56.8, -23.2], FLOOR_AT.SW], shir: [FLOOR_AT.SW, [-54.4, 13.4], YES_S],
  up: [RAMP_FOOT, RAMP_TOP, [-30, 10], TOP_AT.SE], SE: [TOP_AT.SE, TOP_AT.SE], NEh: [TOP_AT.SE, TOP_AT.NE], NWh: [TOP_AT.NE, TOP_AT.NW], SWh: [TOP_AT.NW, TOP_AT.SW],
};
/** where the kohen is (world x, z, his facing) at this moment of the step */
function priestA(M) {
  const s = stepAt(M), kd = cu(M), u = M.u, kind = kindOf(M), on = !!M.cur;
  if (!s) return { x: R_RECV[0], z: R_RECV[1], dir: [0, 1] };
  const walk = (path, w, faceEnd) => { const p = along(path, w); return { x: p.x, z: p.z, dir: w < 1 ? [p.dx, p.dz] : faceEnd }; };
  const towards = (from, to) => [to[0] - from[0], to[1] - from[1]];
  if (kind === 'ken') {
    const c = s.c || 'SW', up = c === 'SE';
    const at = up ? TOP_AT.SE : [-55.3, 13.8], face = up ? HORN_W.SE : C4.SW;
    if (s.k === 'bring') return { x: R_OWN[0] + 2, z: R_OWN[1] + 2.4, dir: [1, 1], bird: 1 };
    return { x: at[0], z: at[1], dir: towards(at, face), back: 1, bird: s.k === 'melak' && (!on || u < 0.3) ? 1 : 0, pose: s.k === 'melak' && on ? 'reach' : 'stand' };
  }
  switch (s.k) {
    case 'recv': { const w = on ? ease(u) : 0; return { x: lerp(RG[0] + 0.6, R_RECV[0], w), z: lerp(SCR.z - 1, R_RECV[1], w), dir: [1, 1] }; }
    case 'zerika': { const path = s.c === 'NE' ? PATH.NE : PATH.SW, w = on ? ease(clamp(u / 0.65)) : 0; return Object.assign(walk(path, w, towards(path[path.length - 1], C4[s.c])), { pose: on && u > 0.65 ? 'pour' : 'carry', tilt: on ? clamp((u - 0.65) / 0.3) : 0 }); }
    case 'up': { const w = on ? ease(u) : 0; return Object.assign(walk(PATH.up, w, towards(TOP_AT.SE, HORN_W.SE)), { pose: 'carry' }); }
    case 'horn': { const path = s.c === 'SE' ? PATH.SE : s.c === 'NE' ? PATH.NEh : s.c === 'NW' ? PATH.NWh : PATH.SWh, w = on ? ease(clamp(u / 0.6)) : 0; return Object.assign(walk(path, w, towards(TOP_AT[s.c], HORN_W[s.c])), { pose: on && u > 0.6 ? 'reach' : 'carry' }); }
    case 'shirayim': { const from = kind === 'chatat' ? [-55.4, 15.6] : FLOOR_AT.SW, w = on ? ease(clamp(u / 0.5)) : 0; return Object.assign(walk([from, YES_S], w, towards(YES_S, YES_FACE)), { pose: on && u > 0.5 ? 'pour' : 'carry', tilt: on ? clamp((u - 0.5) / 0.3) : 0 }); }
    default: return { x: R_RECV[0], z: R_RECV[1], dir: [-1, -0.4], idle: 1 };
  }
}
/** the camera of each moment (never over the screen: from the south-east, low enough that the line to the ring passes under its top) */
function viewA(k, M, P) {
  const s = stepAt(M), kind = kindOf(M);
  if (kind === 'ken' && s && s.k !== 'bring') { if ((s.c || 'SW') === 'SE') k.view([-31.8, 30.8, 1.6], [-25.4, 25.6, 8.9]); else k.view([-60.8, 21.4, 20.6], [-54.9, 16.9, 13.2]); return; }   // (behind his back: the kohen in the frame, the wall beyond — the מליקה hidden by his back)
  if (!s || s.k === 'lead' || s.k === 'lean' || s.k === 'shecht' || s.k === 'bring' || (s.k === 'recv' && !M.cur)) { k.view([RG[0] + 8, 24, RG[1] + 14], [RG[0], 17.5, RG[1]]); return; }
  if (s.k === 'horn' || s.k === 'up') { const c = s.k === 'up' ? 'SE' : s.c; follow(k, P.x, 25, P.z, [c[1] === 'E' ? 9 : -9, 9, c[0] === 'S' ? 11 : -11]); return; }
  if (s.k === 'zerika') { const C = C4[s.c], o = s.c === 'NE' ? [7.5, 6.5, -7.5] : [-7.5, 6.5, 7.5]; k.view([C[0] + o[0], 16 + o[1], C[1] + o[2]], [C[0], 18.6, C[1]]); return; }   // (from outside the corner: he arrives, the Γ on its two faces)
  if (s.k === 'shirayim') { k.view([-58.2, 21.6, 21.5], [-52.6, 17.2, 12.4]); return; }
  follow(k, P.x, 16, P.z, [9, 12, 12]);
}
function yachidDrawA(k, M, T, dt) {
  if (!M) return;
  const kd = cu(M), u = M.u, kind = kindOf(M), K = KINDS[kind] || KINDS.olah, bird = kind === 'ken', s = stepAt(M), r = roundOf(M);
  // the real way is longer than the model's: the walks last by their length (~2–4 s)
  if (M.cur && dt > 0) {
    const d = M.cur.d || 0.5, L = kd === 'zerika' ? plen(M.cur.c === 'NE' ? PATH.NE : PATH.SW) : kd === 'up' ? 34 : kd === 'horn' ? (M.cur.c === 'SE' ? 2 : plen(M.cur.c === 'NE' ? PATH.NEh : M.cur.c === 'NW' ? PATH.NWh : PATH.SWh)) : kd === 'recv' ? 6 : 0;
    if (L > 0) slow(M, 'u', d, Math.min(3, 1.0 + L / 20), dt);   // (a brisk walk; at most 3 s a leg)
  }
  // the beast: led to the ring, the owner leans; behind the screen it is never drawn again
  const fin = M.i >= M.steps.length, lead = kd === 'lead' ? ease(u) : doneIn(M, 'lead') ? 1 : 0, gone = doneIn(M, 'shecht') || kd === 'shecht';
  if (!bird && !fin && !gone) { const x = lerp(R_FROM[0], RG[0], lead), z = lerp(R_FROM[1], RG[1], lead), q = k.loc(x, 16, z); lamb(k, q[0], q[1], k.gy(q[0], q[1]), { yaw: lead < 1 ? dirL(k, RG[0] - R_FROM[0], RG[1] - R_FROM[1]) : dirL(k, 0, 1), scale: K.sc / 1.3, wool: K.wool, step: kd === 'lead' ? T * 8 : 0, t: T, head: kd === 'lean' ? 0.1 : 0.4 }); }
  if (!fin) { const ox = gone ? lerp(R_OWN[0], R_FROM[0], 0.6) : lerp(R_FROM[0] - 1, R_OWN[0], bird ? 1 : lead), oz = gone ? lerp(R_OWN[1], R_FROM[1], 0.6) : lerp(R_FROM[1], R_OWN[1], bird ? 1 : lead); figW(k, ox, oz, { face: gone ? R_FROM : RG, robe: K.robe, skin: SKIN[r % 3], arms: kd === 'lean' ? 0.95 : 0.3, lean: kd === 'lean' ? 0.5 * Math.sin(clamp(u) * Math.PI) : 0.1, pose: kd === 'lean' ? 'reach' : 'stand', u: 0.8, t: T }); }
  // the screen (§2.4): two kohanim raise it before the act; in the stillness they bow their heads; it comes down as the receiver comes out
  const sUp = kd === 'shecht' ? ease(clamp(u * M.cur.d / 0.6)) : kd === 'recv' ? 1 - ease(clamp((u - 0.55) / 0.45)) : 0;
  if (sUp > 0) {
    const sw = SCR.w * sUp, cx = SCR.x0 + sw / 2;
    k.wb(cx, 16 + SCR.h / 2, SCR.z, 0.12, sw, SCR.h, LINEN, { yaw: Math.PI / 2 - k.F.yaw }); k.wb(cx, 16 + SCR.h + 0.08, SCR.z, 0.2, sw + 0.2, 0.18, '#C9B58A', { yaw: Math.PI / 2 - k.F.yaw });
    const bow = kd === 'shecht' && u * M.cur.d > 0.6 ? 0.45 : 0;
    for (const sg of [-1, 1]) figW(k, cx + sg * sw / 2, SCR.z + 0.9, { dir: [0, -1], robe: ROBE.kohen, arms: 0.95, skin: SKIN[2], pose: 'raise', u: 1, lean: bow, t: T });
  }
  // the kohen with the vessel (or, for the birds, at the wall with his back to us)
  const P = priestA(M);
  if (!fin && (bird || doneIn(M, 'recv') || kd === 'recv')) {
    const g = figW(k, P.x, P.z, { dir: P.dir, robe: ROBE.kohen, arms: 0.7, skin: SKIN[1], pose: P.pose || (bird ? 'stand' : 'carry'), u: P.tilt || 1, t: T });
    const ca = Math.cos(g.yaw), sa = Math.sin(g.yaw);
    if (!bird) {
      const va = g.a + ca * 0.5, vs = g.s + sa * 0.5, vy = g.y + 1.0, tl = P.tilt || 0;
      k.c(va, vs, vy, 0.13, 0.28, GOLD, { yaw: -g.yaw, pitch: -tl * 0.9 }); k.c(va, vs, vy - 0.16, 0.05, 0.12, GOLD);
      if (M.fill > 0 || (kd === 'recv' && u > 0.5)) liquid(k, va, vs, vy + 0.11 - tl * 0.05, 0.1, tl);
    } else if (P.bird) { k.s(g.a + ca * 0.38, g.s + sa * 0.38, g.y + 1.0, 0.09, 0.07, 0.12, '#B9B4AA', { yaw: -g.yaw }); k.s(g.a + ca * 0.48, g.s + sa * 0.48, g.y + 1.08, 0.045, 0.045, 0.045, '#A9A49A'); }
  }
  // the horns: their names; the next one (chatat) a ring; the screen points of the horns for the aimed drag
  if (s && (s.k === 'horn' || s.k === 'up')) {
    for (const c of HORNS) labelW(k, HORN_HE[c], HORN_W[c][0], 27.0, HORN_W[c][1], 0.12);
    try { const sc = { cue: null }; for (const c of HORNS) { const q = k.loc(HORN_W[c][0], 26, HORN_W[c][1]); const p = k.screen(q[0], q[1], q[2]); sc[c] = [p.x, p.y]; } const t = hornTarget(M, k), p = k.screen(t[0], t[1], t[2]); sc.cue = [p.x, p.y]; M.scr = sc; } catch (e) { M.scr = null; }
  } else M.scr = null;
  viewA(k, M, P);
  // the cue: none in the moment of gravity
  if (!M.cur && M.phase === 'work' && s) { const t = cueAt(M); cueW(k, M, t[0], t[1], t[2], 1.2, T); }
  if (M.say) { const t = sayAt(M); labelW(k, M.say, t[0], t[1], t[2], M.say.length > 30 ? 0.13 : 0.16); }
  if (M.warn) { const t = sayAt(M); labelW(k, M.warn, t[0], t[1] - 0.9, t[2], 0.16, { bg: 'rgba(240,244,255,.94)' }); }
}
function cueAt(M) {
  const s = M.steps[M.i]; if (!s) return [RG[0], 16, RG[1]];
  if (s.k === 'lead' || s.k === 'lean' || s.k === 'shecht' || s.k === 'bring') return [RG[0], 16, RG[1]];
  if (s.k === 'recv') return [RG[0] + 1.5, 16, SCR.z + 0.6];
  if (s.k === 'zerika') return [FLOOR_AT[s.c][0], 16, FLOOR_AT[s.c][1]];
  if (s.k === 'up') return [RAMP_FOOT[0], 16, RAMP_FOOT[1]];
  if (s.k === 'horn') return [HORN_W[s.c][0], 26, HORN_W[s.c][1]];
  if (s.k === 'melak') return s.c === 'SE' ? [TOP_AT.SE[0], 25, TOP_AT.SE[1]] : [-55.3, 16, 13.8];
  if (s.k === 'mitzui') return [-53.4, 17, 12];
  return [YES_S[0], 16, YES_S[1]];
}
const sayAt = (M) => { const s = M.steps[Math.min(M.i, M.steps.length - 1)]; if (s && s.kind === 'ken' && s.k !== 'bring') { const C = C4[s.c || 'SW']; return [C[0], s.c === 'SE' ? 29 : 23.6, C[1]]; } const t = cueAt(M); return [t[0], Math.max(t[1], 16) + 3.6, t[2]]; };   // (the birds: over the corner, not in front of the camera)
function hornTarget(M, k) { const t = cueAt(M); return k.loc(t[0], t[1], t[2]); }
const yachidTargetA = (M, k) => { const t = cueAt(M); return k.loc(t[0], t[1] + 2, t[2]); };
/** the mentor line at the end: by the kinds played */
export function yachidMentor(M) {
  const ks = M ? M.kinds : ['olah'];
  const beast = ks.some((x) => x !== 'ken'), parts = [];
  if (beast) parts.push('קדשי קדשים נשחטים בצפון: הבעלים סומך שתי ידיו, הכהן שוחט מאחורי המסך — ומכאן הדם הוא העבודה: קבלה, הולכה, זריקה');
  else parts.push('בקן העוף אין סמיכה ואין כלי: הכהן עושה בידו, על קיר המזבח');
  if (ks.includes('olah') || ks.includes('shelamim')) parts.push('עולה ושלמים — שתי מתנות שהן ארבע, למטה מחוט הסיקרא');
  if (ks.includes('chatat')) parts.push('חטאת — באצבע, על ארבע הקרנות, למעלה: דרומית מזרחית, מזרחית צפונית, צפונית מערבית, מערבית דרומית');
  if (ks.includes('ken')) parts.push('ובעוף — הפוך: חטאת העוף למטה, עולת העוף למעלה');
  return { text: parts.join('. ') + '.', src: 'זבחים ה, א–ה; ו, ב–ה; מידות ג, א; תמיד ד, א; רמב"ם מעשה הקרבנות ה · טיוטה' };
}
export const yachid = mk({
  id: 'yachid', he: 'קרבנות היחיד בצפון', place: 'rings',
  fact: { he: 'קדשי קדשים נשחטים בצפון: הבעלים סומך את שתי ידיו, הכהן שוחט — מאחורי המסך — ומקבל את הדם בכלי שרת. עולה ושלמים: שתי מתנות שהן ארבע, למטה מחוט הסיקרא; חטאת: באצבע על ארבע הקרנות, למעלה; ובעוף — הפוך: חטאת העוף למטה ועולת העוף למעלה. ושירי הדם — על יסוד דרומית. במשחק: דם כן, פגר לא', ref: 'זבחים ה, א–ה; ו, ב–ה (לבדיקה); מידות ג, א; תמיד ד, א; רמב"ם מעשה הקרבנות ה' },
  stage: { ahead: -0.4, lat: 0, K: 1.45 }, bounds: [0.8, 6.4, -3.6, 3.8, 2.6],
  model: yachidModel, draw: yachidDraw, target: yachidTarget,
});
// the real place (craft.js: W.anchored → kit.place({ anchor }) and this draw)
yachid.anchored = { anchor: 'rings', draw: yachidDrawA, target: yachidTargetA, mid: [0, 0, 1], bounds: [-3, 3, -3, 3, 3] };
try { globalThis.__YACHID25 = { stepsOf, KINDS, HORNS, SCREEN_H, SCR, RG, viewA }; } catch (e) { /* tests */ }
