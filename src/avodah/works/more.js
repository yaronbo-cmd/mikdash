/* ── payis24 ── more.js — the errands that still played as sheets under two thumbs, as world crafts on WORKSA22's kit (craft.js ·
 * kit.js · figures.js; the sheets stay in the code for portrait):
 *   pitum   פיטום הקטורת at בית אבטינס — the eleven spices named one by one from ketoret.json (data.js SPICES), weighed against the stone,
 *           poured into the mortar, ground "הדק היטב, היטב הדק", the year's store (כריתות ו, א–ב; שקלים ה, א)
 *   yachid  קרבנות היחיד at the north rings — now in yachid.js (bloodb25): each offering by its kind, the blood as the work (DAM25)
 *   machar  the lamb of tomorrow — three new lambs looked at by torch, the sound ones into the chamber (תמיד ג, ד; ערכין ב, ה)
 *   etzim   the wood offering — families bring wood to the chamber of wood (תענית ד, ה)
 *   tokim   the trumpeters: two silver trumpets at the gate (three blasts on the beat) and on the דוכן in the song (תקיעה · תרועה · תקיעה),
 *           with the sound; "לבית התקיעה" explained in the mentor line with its source
 * Each: an acts.js model (taps alone finish it in under a minute; a miss is "עוד קצת", never a penalty), a diorama beside the אמרכל, the
 * source line after the end ("טיוטה" or "המחשה"). Nothing red but the offering's blood (yachid.js, DAM25), no Divine Name. Local frame: a along his line, s to his right, y up. ── /payis24 ── */
import { baseModel, clamp, ease } from './craft.js';
import { man, lamb, flame, ROBE, SKIN } from './figures.js';
import { mk, lerp, STONE, STONE2, SILVER, GOLD, LINEN, memune, cue, says, tickSay } from './dawn.js';
import { SPICES, PITUM_LINES } from '../data.js';
import { WORKS } from '../day/works.js';
import { TEMPLATES, RESTOCK } from '../day/tasks.js';
import { PLACE22 } from '../day/places.js';
import { warmWorks } from './register.js';
import { refit } from './dawnreg.js';
import { payis, payis2, payis3, payis4 } from './payis.js';
import { s27Opts } from './slice27.js';   // ── slice27 ── ── /slice27 ──

/** a chain of steps: a tap starts the next step (it plays for `d` seconds; a tap that comes during it waits), its end pays, says and advances.
 *  step: { k (a tag the draw reads), d, say, sayT, sfx, o, haptic, begin(m), tick(m, u), done(m), at(m) → [a, s, y] } */
function chain(kind, o, steps, coach, init) {
  const M = baseModel(kind, o, {
    n: steps.length, coach, ready: (m) => !m.cur,
    tap(m) { const s = steps[m.i]; m.cur = s; m.u = 0; if (s.begin) s.begin(m); if (s.sfx) m.fx.push({ sfx: s.sfx, o: s.o, haptic: s.haptic || 8 }); },
    step(m, dt) {
      tickSay(m, dt);
      for (let i = m.later.length - 1; i >= 0; i--) { const L = m.later[i]; L.t -= dt; if (L.t <= 0) { m.fx.push(L.fx); m.later.splice(i, 1); } }
      const s = m.cur; if (!s) return;
      m.u = Math.min(1, m.u + dt / (s.d || 0.5));
      if (s.tick) s.tick(m, m.u);
      if (m.u < 1) return;
      m.cur = null; m.u = 0;
      if (s.done) s.done(m);
      m.pay(s.at ? s.at(m) : null, s.say || '');
      if (s.say) { m.say = s.say; m.sayT = s.sayT || 1.6; }
      m.advance();
    },
  });
  Object.assign(M, { cur: null, u: 0, sayT: 0, later: [] });
  if (init) init(M);
  try { globalThis.__P24M = M; } catch (e) { /* tests */ }
  return M;
}
const cu = (m) => (m.cur ? m.cur.k : '');
const lerpA = (a, b, u) => a + (b - a) * clamp(u);
/** a silver trumpet from the mouth (a, s, y) along the facing `ya`, tilted `p` from the vertical (π/2 = level): a thin tube and a flared bell */
export function trumpet(k, a, s, y, ya, p = 1.2, up = 0) {
  const q = p - up * 0.25, h = Math.sin(q), v = Math.cos(q), L = 0.95;
  const at = (t) => [a + Math.cos(ya) * h * t, s + Math.sin(ya) * h * t, y + v * t];
  const c = at(L / 2), b1 = at(L * 0.86), b2 = at(L * 0.98);
  k.c(c[0], c[1], c[2], 0.034, L, SILVER, { yaw: -ya, pitch: q });
  k.c(b1[0], b1[1], b1[2], 0.075, 0.16, SILVER, { yaw: -ya, pitch: q });
  k.c(b2[0], b2[1], b2[2], 0.125, 0.1, '#DDE1E8', { yaw: -ya, pitch: q });
}
/** the music's beat as 0…1 (0 at the beat), else a steady pulse */
export function beatU() {
  try { const B = globalThis.__CRAFT_BEAT ? globalThis.__CRAFT_BEAT() : (globalThis.__BH_MUSIC && globalThis.__BH_MUSIC.beat && globalThis.__BH_MUSIC.beat()); if (B && B.period > 0) { const to = (((+B.toNext - 0.09) % B.period) + B.period) % B.period; return to / B.period; } } catch (e) { /* */ }
  return ((performance.now() / 1000) % 0.9) / 0.9;
}
const jarRing = (k, M, a, s, y, r, T) => { if (M.phase === 'work' && !M.cur) k.ring(a, s, y, (r + 0.07 * Math.sin(T * 5)) * (M.pressed ? 1.2 : 1), '!#FFD24A', 14); };

/* ───────────────────────────── 1. פיטום הקטורת — בית אבטינס (כריתות ו, א–ב; שקלים ה, א) ───────────────────────────── */
const TAB = { a: 4.7, y: 0.9 }, MORT = { a: 2.7, s: 1.7 }, BAL = { a: 3.3, s: -1.2 };
const JAR_COL = ['#9AA55E', '#8A6B4A', '#B8A86A', '#F0E8D0', '#A98B5E', '#7C6444', '#8E9A62', '#E3B23C', '#B08A55', '#9C7A50', '#B28858'];
const jarS = (j) => -2.5 + j * 0.5, HONEY_S = 3.15;
const GRIND = ['הדק', 'היטב', 'היטב', 'הדק'];
const stoneOf = (j) => SPICES[j].manah;
export const PITUM_STEPS = [
  ...SPICES.map((sp, j) => ({ k: 'pour', j, d: 1.0, say: `${sp.he} — ${sp.manah} מנה`, sayT: 1.8, sfx: 'soft', at: () => [MORT.a, MORT.s, 1.1], done: (m) => { m.poured = j + 1; } })),
  { k: 'add', d: 0.8, say: 'מלח סדומית ומעלה עשן — ודבש לא', sayT: 2.4, sfx: 'soft', at: () => [MORT.a, MORT.s, 1.1], done: (m) => { m.added = 1; } },
  ...GRIND.map((w, j) => ({ k: 'grind', j, d: 0.4, say: w, sayT: 0.8, sfx: 'soft', haptic: 10, at: () => [MORT.a, MORT.s, 1.0], done: (m) => { m.ground = j + 1; } })),
  { k: 'store', d: 1.2, say: 'שס״ח מנה — לשנה', sayT: 6, sfx: 'chime', o: { n: 5 }, at: () => [TAB.a, 3.2, 1.6], done: (m) => { m.stored = 1; } },
];
export function pitumModel(o = {}) {
  return chain('pitum', o, PITUM_STEPS, "הקישו על 'עבודה' — צנצנת אחר צנצנת: שוקלים כל סממן ויוצקים למכתשת; ואחר כך שוחקים ומאחסנים לשנה",
    (m) => Object.assign(m, { poured: 0, added: 0, ground: 0, stored: 0 }));
}
function pitumDraw(k, M, T) {
  if (!M) return;
  const kd = cu(M), cj = M.cur && kd === 'pour' ? M.cur.j : -1, u = M.u;
  k.b(3.1, 0, 0.02, 7.4, 4.8, 0.04, '#CDBF9F');                                                                                          // the floor
  k.b(TAB.a + 0.5, 0, 0.5, 6.8, 0.5, 1.0, '#8C6A3F'); k.b(TAB.a, 0, TAB.y + 0.02, 6.8, 0.9, 0.08, '#A3814F');                            // the shelf-table
  for (let j = 0; j < 11; j++) {
    const taken = j < M.poured || j === cj; if (taken && j !== cj) { k.c(TAB.a, jarS(j), TAB.y + 0.18, 0.2, 0.3, JAR_COL[j], { }); continue; }
    if (j === cj) continue;
    k.c(TAB.a, jarS(j), TAB.y + 0.24, 0.2, 0.38, JAR_COL[j]); k.c(TAB.a, jarS(j), TAB.y + 0.46, 0.13, 0.06, '#5C4630');
  }
  k.c(TAB.a, HONEY_S, TAB.y + 0.2, 0.2, 0.32, '#C89B3C'); k.c(TAB.a, HONEY_S, TAB.y + 0.4, 0.14, 0.05, '#5C4630');                         // the honey: set aside
  if (M.added || M.i >= 11) k.label('דבש — לא', TAB.a - 0.4, HONEY_S, 1.9, 0.26, { bg: 'rgba(240,244,255,.94)' });
  // the balance: post, beam (tilts while the spice is poured on the right pan, level when it matches the stone on the left)
  const tilt = kd === 'pour' ? (u < 0.35 ? 0 : u < 0.55 ? -0.28 * ease((u - 0.35) / 0.2) : -0.28 * (1 - ease(clamp((u - 0.55) / 0.2)))) : 0;
  k.c(BAL.a, BAL.s, 0.8, 0.06, 1.6, '#7A5535'); k.b(BAL.a, BAL.s, 0.05, 0.7, 0.7, 0.1, '#7A5535');
  k.b(BAL.a, BAL.s, 1.62, 1.9, 0.07, 0.07, '#B8862A', { roll: tilt });
  const sy = Math.sin(tilt) * 0.95, cs = Math.cos(tilt) * 0.95;
  const jj = kd === 'pour' ? cj : Math.min(10, Math.max(0, M.poured - 1));
  const lw = stoneOf(jj), sz = 0.1 + lw / 70 * 0.16;
  for (const sg of [-1, 1]) {
    const ps = BAL.s + sg * cs, py = 1.62 - sg * sy * 1.0 - 0.55;
    k.b(BAL.a, ps, py + 0.55, 0.02, 0.02, 0.55, '#6E5A3A'); k.c(BAL.a, ps, py, 0.3, 0.05, '#C9A24A');
    if (sg < 0 && M.i < 11) { k.b(BAL.a, ps, py + 0.05 + sz / 2, sz, sz, sz, '#7C766C'); k.label(`${lw}`, BAL.a - 0.45, ps, py + 0.7, 0.2); }
    if (sg > 0 && kd === 'pour' && u >= 0.3 && u < 0.78) k.s(BAL.a, ps, py + 0.1, 0.2 * clamp((u - 0.3) / 0.25), 0.1, 0.2 * clamp((u - 0.3) / 0.25), JAR_COL[cj]);
  }
  // the jar in flight: from its place to the right pan, tips, and back
  if (cj >= 0) {
    const pan = { a: BAL.a, s: BAL.s + Math.cos(tilt) * 0.95 }, from = { a: TAB.a, s: jarS(cj) }, w = ease(clamp(u / 0.3)), back = ease(clamp((u - 0.8) / 0.2));
    const ja = lerpA(lerpA(from.a, pan.a, w), from.a, back), js = lerpA(lerpA(from.s, pan.s, w), from.s, back), jy = lerpA(TAB.y + 0.24, 1.15, Math.sin(w * Math.PI / 2) * (1 - back)) + 0.2 * Math.sin(clamp(u / 0.8) * Math.PI);
    k.c(ja, js, jy, 0.2, 0.38, JAR_COL[cj], { roll: u > 0.3 && u < 0.6 ? 0.9 : 0 });
  }
  // the mortar (a stone bowl; the heap in it takes the colour of what was poured), the pestle, the one who grinds
  k.c(MORT.a, MORT.s, 0.22, 0.5, 0.44, '#BFB6A4'); k.c(MORT.a, MORT.s, 0.46, 0.4, 0.06, '#9E9585');
  const heap = (M.poured + (kd === 'pour' && u > 0.8 ? clamp((u - 0.8) / 0.2) : 0)) / 11;
  if (heap > 0) k.s(MORT.a, MORT.s, 0.5, 0.12 + 0.3 * heap, 0.05 + 0.12 * heap, 0.12 + 0.3 * heap, M.poured >= 11 ? '#B49A6A' : JAR_COL[Math.max(0, M.poured - 1)]);
  const pound = kd === 'grind' ? Math.sin(clamp(u) * Math.PI) : 0;
  k.c(MORT.a, MORT.s, 1.05 + 0.25 * (1 - pound), 0.07, 0.95, '#9C8A6C', { });
  const store = M.stored || (kd === 'store' && u > 0.6);
  k.b(TAB.a - 0.5, 3.0, 0.45, 0.8, 1.0, 0.9, '#8C6A3F'); k.b(TAB.a - 0.5, 3.0, 0.92, 0.9, 1.1, 0.08, '#A3814F');                           // the store chest
  if (store) k.s(TAB.a - 0.5, 3.0, 1.0, 0.3, 0.16, 0.3, '#B49A6A');
  // the two men of בית אבטינס: one weighs, one grinds
  const arms = kd === 'pour' ? 0.5 + 0.4 * Math.sin(clamp(u) * Math.PI) : 0.25;
  man(k, 2.1, -2.4, 0, { robe: ROBE.worker, yaw: Math.atan2(0.6, 1.1), arms, skin: SKIN[1] });
  man(k, MORT.a - 0.9, MORT.s + 0.2, 0, { robe: ROBE.worker, yaw: 0, arms: kd === 'grind' ? 0.55 + 0.4 * pound : 0.35, lean: 0.3, skin: SKIN[2] });
  if (M.phase === 'work' && !M.cur) { if (M.i < 11) jarRing(k, M, TAB.a, jarS(M.i), TAB.y, 0.3, T); else if (M.i === 11) jarRing(k, M, TAB.a, HONEY_S, TAB.y, 0.3, T); else if (M.i < 16) jarRing(k, M, MORT.a, MORT.s, 0.45, 0.55, T); else jarRing(k, M, TAB.a - 0.5, 3.0, 0.9, 0.55, T); }
  k.label('בית אבטינס', TAB.a + 0.6, 0, 2.5, 0.3);
  if (M.i < 11 && !M.say && M.phase === 'work') k.label(`${SPICES[M.i].he} — ${SPICES[M.i].manah} מנה`, 1.6, 0, 2.4, 0.3);
  says(k, M);
}
export const pitum = mk({
  id: 'pitum', he: 'פיטום הקטורת', place: 'avtinas',
  fact: { he: 'בית אבטינס עשו את הקטורת: אחד עשר סממנים בשקילה — ארבעה של שבעים מנה, ארבעה של שישה עשר, ועוד שנים עשר, שלושה ותשעה; שוחקים "הדק היטב, היטב הדק" כי הקול יפה לבשמים, ודבש אין נותנים בה. שס״ח מנה בשנה: מנה ליום ועוד שלושה ליום הכיפורים', ref: `${PITUM_LINES.avtinas.source}; כריתות ו, א–ב` },
  stage: { ahead: -0.5, lat: 0, K: 1.45 }, bounds: [1.2, 6.2, -3.4, 3.6, 2.6],
  model: pitumModel, draw: pitumDraw,
  target: (M) => (M.i < 11 ? [TAB.a, jarS(M.i), 1.2] : M.i < 16 ? [MORT.a, MORT.s, 1.1] : [TAB.a, 3.0, 1.2]),
});

/* ───────────────────────────── 2. קרבנות היחיד — בצפון, כל קרבן כדינו (bloodb25: yachid.js — DAM25 §3) ───────────────────────────── */
// ── bloodb25 ── the private offerings by their kind from the gate's queue: the screen and the moment of gravity (0 points), the vessel with the
// dark liquid, then עולה/שלמים below the line · חטאת on the four horns above, by the finger · the birds on the wall; the rest on the yesod
export { yachid, yachidModel, yachidDraw, YACHID_STEPS } from './yachid.js';
import { yachid, yachidMentor } from './yachid.js';
import { ganan, GANAN_TASK, GANAN_PLACE } from './ganan.js';   // ── bloodb25 ── the gardeners at the amah's outlet (⚑7)
// ── /bloodb25 ──

/* ───────────────────────────── 3. הטלה של מחר — מבקרים מבערב (תמיד ג, ד; ערכין ב, ה) ───────────────────────────── */
const CH = { a: 5.4, s0: -1.0, s1: 3.2 }, LMB = (j) => ({ a: 2.4, s: -2.5 + j * 1.6 }), DOOR = { a: 5.0, s: 2.2 };
const MCHECK = ['אין בו מום', 'סדק בעור בלבד — אינו מום', 'חריץ בסחוס האוזן — מום'];
export const MACHAR_STEPS = [0, 1, 2].flatMap((j) => [
  { k: 'look', j, d: 0.9, say: j === 0 ? 'בודקים לאור האבוקה — אוזן, עין, רגל' : '', sayT: 1.6, sfx: 'soft', at: () => [LMB(j).a, LMB(j).s, 1.2] },
  { k: 'judge', j, d: j === 2 ? 0.8 : 1.4, say: MCHECK[j], sayT: 2.4, sfx: j === 2 ? 'soft' : 'chime', o: { n: 2 }, at: () => [j === 2 ? LMB(j).a : DOOR.a, j === 2 ? LMB(j).s : DOOR.s, 1.4], done: (m) => { if (j < 2) m.inside++; else m.out = 1; } },
]).concat([{ k: 'close', d: 0.9, say: 'ששה טלאים מבוקרים בלשכה', sayT: 8, sfx: 'chime', o: { n: 5 }, at: () => [DOOR.a, DOOR.s, 2.0] }]);
export function macharModel(o = {}) {
  return chain('machar', o, MACHAR_STEPS, "הקישו על 'עבודה' — בודקים כל טלה לאור האבוקה; התמים נכנס ללשכה, ובעל המום נשאר בחוץ",
    (m) => Object.assign(m, { inside: 4, out: 0 }));
}
function macharDraw(k, M, T) {
  if (!M) return;
  const kd = cu(M), u = M.u, cj = M.cur ? M.cur.j : Math.min(2, Math.floor(M.i / 2));
  k.b(3.4, 0.5, 0.02, 6.2, 7.2, 0.04, '#CDBF9F');
  k.b(CH.a + 0.4, (CH.s0 + CH.s1) / 2, 1.1, CH.s1 - CH.s0 + 1, 0.8, 2.2, STONE); k.b(DOOR.a - 0.4, DOOR.s, 0.9, 0.9, 0.12, 1.8, '#6B4F2F');                 // the chamber and its door
  k.b(DOOR.a - 0.35, DOOR.s + 0.8, 1.0, 0.35, 0.12, 2.0, STONE2);
  k.label(`לשכת הטלאים — בפנים: ${M.inside}`, CH.a - 0.5, 0.9, 2.6, 0.32);
  // the lambs: each at its place; the sound one walks in at the door; the third stays outside, apart (plain: no mark drawn)
  for (let j = 0; j < 3; j++) {
    if (j < 2 && M.i >= 2 * j + 2) continue;
    const P = LMB(j), moving = kd === 'judge' && cj === j && j < 2;
    if (moving && u > 0.92) continue;
    const t = moving ? ease(u) : 0, a = lerpA(P.a, DOOR.a - 0.5, t), s = lerpA(P.s, DOOR.s, t), apart = j === 2 && M.out ? 1 : 0;
    lamb(k, a + apart * 0.6, s + apart * 1.0, 0, { yaw: moving ? Math.atan2(DOOR.s - P.s, DOOR.a - P.a) : 0, scale: 1.25, step: moving ? T * 8 : 0, t: T, head: 0.35, glow: kd === 'look' && cj === j ? 0.6 : 0 });
  }
  // the ממונה with the torch walks to the lamb he looks at
  const P = LMB(cj), wa = P.a - 0.9, ws = P.s - 0.5;
  man(k, wa, ws, 0, { robe: ROBE.kohen, yaw: 0.5, arms: kd === 'look' ? 0.55 + 0.2 * Math.sin(u * Math.PI) : 0.3, torch: 0.7, t: T, skin: SKIN[2] });
  k.torch(wa + 0.6, ws + 0.6, 1.6, 0.5);
  if (kd === 'look') k.ring(P.a + 0.4, P.s + 0.1, 0.9 + 0.1 * Math.sin(u * 12), 0.22, '!#FFE08A', 10);
  if (kd === 'judge' && cj < 2) k.s(DOOR.a - 0.6, DOOR.s, 2.2, 0.1, 0.1, 0.1, '!#FFD24A');
  for (let q = 0; q < Math.min(M.i / 2 | 0, 3); q++) k.s(3.0, -2.5 + q * 1.6, 1.6, 0.07, 0.07, 0.07, q < 2 ? '!#FFD24A' : '#8E8A82');
  if (M.phase === 'work' && !M.cur) cue(k, M, LMB(cj).a, LMB(cj).s, 0, 0.7, T);
  says(k, M);
}
export const machar = mk({
  id: 'machar', he: 'הטלה של מחר', place: 'lambs',
  fact: { he: 'טלה התמיד מבקרים כבר מערב קודם — "מבקר" — ובלשכת הטלאים לא פוחתים משישה טלאים מבוקרים; התמימים נכנסים ללשכה, ובעל מום אינו נכנס. סדק בעור בלבד אינו מום', ref: 'תמיד ג, ד; ערכין ב, ה; בכורות ו, א' },
  stage: { ahead: -0.4, lat: 0, K: 1.45 }, bounds: [1.0, 6.0, -3.4, 3.8, 2.6],
  model: macharModel, draw: macharDraw, target: (M) => { const j = Math.min(2, Math.floor(M.i / 2)); return [LMB(j).a, LMB(j).s, 1.2]; },
});

/* ───────────────────────────── 4. עצי כהנים והעם — מנדבים עצים ללשכת העצים (תענית ד, ה) ───────────────────────────── */
const WDOOR = { a: 5.0, s: 0.0 }, FAMS = [{ robe: '#7F9A83', n: 3 }, { robe: '#8E8AA8', n: 4 }, { robe: '#A39A6E', n: 3 }];
const WOODC = ['#7A5535', '#6E4A2A', '#85603C'];
export const ETZIM_STEPS = FAMS.flatMap((F, f) => [
  { k: 'bring', f, d: 1.0, say: f === 0 ? 'משפחה מנדבת עצים' : '', sayT: 1.6, sfx: 'soft', at: () => [WDOOR.a - 1.4, WDOOR.s - 1.4 + f * 1.4, 1.4] },
  { k: 'lay', f, d: 0.8, say: f === 2 ? 'ושמחו — יום טוב של עצים' : 'העצים אל הערימה', sayT: f === 2 ? 8 : 1.6, sfx: f === 2 ? 'chime' : 'good', at: () => [WDOOR.a + 0.5, WDOOR.s, 1.0], done: (m) => { m.piled += F.n; } },
]);
export function etzimModel(o = {}) {
  return chain('etzim', o, ETZIM_STEPS, "הקישו על 'עבודה' — כל משפחה מביאה אגודת עצים ללשכה ומניחה אותה על הערימה",
    (m) => Object.assign(m, { piled: 0 }));
}
function etzimDraw(k, M, T) {
  if (!M) return;
  const kd = cu(M), u = M.u, cf = M.cur ? M.cur.f : Math.min(2, Math.floor(M.i / 2));
  k.b(3.4, 0, 0.02, 6.2, 6.8, 0.04, '#CDBF9F');
  for (const sg of [-1, 1]) { k.b(WDOOR.a, sg * 1.5, 1.2, 0.7, 1.0, 2.4, STONE); k.b(WDOOR.a + 0.2, sg * 3.0, 0.9, 2.2, 0.7, 1.8, STONE2); }
  k.b(WDOOR.a, 0, 2.5, 4.0, 0.7, 0.3, STONE2);
  k.label('לשכת העצים', WDOOR.a - 0.4, 0, 3.0, 0.3);
  // the pile inside the door: logs by layers
  const total = M.piled + (M.cur && M.cur.k === 'lay' ? FAMS[cf].n * ease(M.u) : 0);
  for (let j = 0; j < Math.floor(total + 0.01); j++) { const lay = j / 4 | 0, c = j % 4; k.c(WDOOR.a + 0.9, -0.9 + c * 0.55, 0.2 + lay * 0.2, 0.12, 1.1, WOODC[j % 3], { yaw: lay % 2 ? 0 : Math.PI / 2, pitch: Math.PI / 2 }); }
  // the family at the door with a bundle on the shoulder; the kohen who receives at the door
  for (let f = 0; f < 3; f++) {
    if (f < cf && !(f === cf)) continue;
    if (f > cf + 0) { if (f === cf + 1) man(k, 0.8, -3.0, 0, { robe: FAMS[f].robe, yaw: 0.4, arms: 0.1, skin: SKIN[f] }); continue; }
    const arrive = kd === 'bring' ? ease(u) : 1, a = lerpA(0.8, WDOOR.a - 1.4, arrive), s = lerpA(-3.0, WDOOR.s - 1.4 + f * 1.4, arrive);
    const lay = kd === 'lay' ? ease(u) : 0;
    for (let q = 0; q < 2; q++) man(k, a - 0.5 * q, s - 0.6 * q, 0, { robe: FAMS[f].robe, yaw: lerpA(0.2, 0, lay), arms: 0.5 + 0.2 * lay, skin: SKIN[(f + q) % 3] });
    if (!(kd === 'lay' && u > 0.5) && M.piled <= f * 3.1 + 0.5) for (let j = 0; j < FAMS[f].n; j++) k.c(a + 0.3, s, 1.15 + (j % 2) * 0.1, 0.1, 0.9, WOODC[j % 3], { yaw: 0.3 * j, pitch: Math.PI / 2 - 0.2 });
  }
  man(k, WDOOR.a - 0.9, 1.7, 0, { robe: ROBE.kohen, yaw: -0.5, arms: kd === 'lay' ? 0.6 : 0.3, skin: SKIN[1] });
  memune(k, 1.6, 2.2, WDOOR.a, 0, 0.3, T);
  if (M.phase === 'work' && !M.cur) cue(k, M, M.i % 2 ? WDOOR.a + 0.5 : WDOOR.a - 1.4, M.i % 2 ? 0 : -1.4 + cf * 1.4, 0, 0.6, T);
  says(k, M);
}
export const etzim = mk({
  id: 'etzim', he: 'נדבת עצים', place: 'wood',
  fact: { he: 'תשעה זמנים בשנה היו משפחות מתנדבות עצים ללשכת העצים — עצי כהנים והעם; והיום ההוא יום טוב להם. העצים נבדקים אחר כך, לפני המזבח: עץ תולע פסול', ref: 'תענית ד, ה; מידות ב, ה' },
  stage: { ahead: -0.4, lat: 0, K: 1.45 }, bounds: [0.8, 6.0, -3.6, 3.6, 3.0],
  model: etzimModel, draw: etzimDraw, target: (M) => [WDOOR.a, WDOOR.s, 1.2],
});

/* ───────────────────────────── 5. התוקעים — שתי חצוצרות כסף בשער ועל הדוכן (סוכה ה, ה; תמיד ז, ג; "לבית התקיעה") ───────────────────────────── */
const GT = { a: 4.9, s: 0.6, w: 1.5, h: 3.0 }, TR = [{ a: 2.6, s: -2.4 }, { a: 2.6, s: 3.2 }], BLASTS = ['תקיעה', 'תרועה', 'תקיעה'];
const DU = { a0: 3.6, a1: 5.6, s0: -3.0, s1: 3.2, h: 0.55 };
const blastFx = (m, j, now = true) => { const f = { sfx: j === 1 ? 'teruah' : 'tekiah', haptic: 20 }; if (now) m.fx.push(f); return f; };
export const TOKIM_STEPS = [
  ...BLASTS.map((w, j) => ({ k: 'gate', j, d: j === 1 ? 0.85 : 1.0, say: w, sayT: 1.0, begin: (m) => { blastFx(m, j); m.blast = j; }, at: () => [TR[j % 2].a, TR[j % 2].s, 2.3], done: (m) => { if (j === 2) { m.scene = 1; m.say = 'ועכשיו — על הדוכן, בשיר'; m.sayT = 2.4; } } })),
  ...[0, 1, 2].flatMap((p) => [
    { k: 'song', p, d: 0.9, say: ['פרק ראשון', 'פרק שני', 'פרק שלישי'][p], sayT: 1.6, sfx: 'good', at: () => [4.6, 0, 2.6], done: (m) => { m.sung = p + 1; } },
    { k: 'ttt', p, d: 2.7, say: 'תקיעה · תרועה · תקיעה', sayT: 2.6, begin: (m) => { m.blast = 0; blastFx(m, 0); m.later.push({ t: 0.9, fx: blastFx(m, 1, false) }, { t: 1.8, fx: blastFx(m, 2, false) }); }, tick: (m, u) => { m.blast = u < 0.34 ? 0 : u < 0.67 ? 1 : 2; }, at: () => [3.0, 0.4, 2.4], done: (m) => { m.bowed = p + 1; if (p === 2) { m.say = 'לבית התקיעה'; m.sayT = 8; } } },
  ]),
];
export function tokimModel(o = {}) {
  return chain('tokim', o, TOKIM_STEPS, "הקישו על 'עבודה' — שלוש תקיעות בשער על הקצב; ואחר כך על הדוכן, בשיר: תקיעה · תרועה · תקיעה",
    (m) => Object.assign(m, { scene: 0, blast: -1, sung: 0, bowed: 0 }));
}
function tokimDraw(k, M, T) {
  if (!M) return;
  const kd = cu(M), u = M.u, up = (kd === 'gate' ? Math.sin(clamp(u) * Math.PI) : kd === 'ttt' ? (u % 0.34 < 0.28 ? 1 : 0.3) : 0), bu = beatU();
  k.b(3.6, 0.3, 0.02, 6.6, 7.4, 0.04, '#CDBF9F');
  if (M.scene === 0) {
    // the gate: wall, posts, lintel, the leaves; the corner stone with the inscription beside the trumpeters
    for (const sg of [-1, 1]) { k.b(GT.a + 0.1, GT.s + sg * (GT.w + 2.2), GT.h / 2 + 0.3, 3.2, 0.7, GT.h + 0.6, STONE); k.b(GT.a, GT.s + sg * (GT.w + 0.25), GT.h / 2, 0.5, 0.8, GT.h, STONE2); }
    k.b(GT.a, GT.s, GT.h + 0.25, 2 * GT.w + 1.0, 0.8, 0.5, STONE2);
    for (const sg of [-1, 1]) k.b(GT.a - 0.1, GT.s + sg * GT.w * 0.5, GT.h / 2, GT.w, 0.14, GT.h - 0.1, '#9C7A45');
    k.b(1.9, -3.5, 0.45, 0.8, 0.9, 0.9, '#C9BFA4'); k.label('לבית התקיעה לה[…]', 1.9, -3.1, 1.5, 0.26, { bg: 'rgba(255,244,214,.96)' });
    for (let j = 0; j < 2; j++) {
      const P = TR[j], ya = Math.atan2(GT.s - P.s, GT.a - P.a), on = kd === 'gate';
      man(k, P.a, P.s, 0, { robe: ROBE.kohen, yaw: ya, arms: 1.2 + (on ? 0.1 * up : 0), skin: SKIN[j] });
      trumpet(k, P.a + Math.cos(ya) * 0.5, P.s + Math.sin(ya) * 0.5, 1.02, ya, 1.2, on ? up : 0);
      if (on && up > 0.5) for (let z = 0; z < 3; z++) k.ring(P.a + Math.cos(ya) * (1.7 + z * 0.45), P.s + Math.sin(ya) * (1.7 + z * 0.45), 1.5, 0.14 + z * 0.12, '!#FFF3C4', 8);
      if (M.phase === 'work' && !M.cur && M.i < 3) k.ring(P.a, P.s, 0.03, 0.2 + 0.7 * (1 - bu), '!#FFD24A', 14);                          // the beat ring closing on each trumpeter
    }
    man(k, GT.a - 1.2, GT.s + 2.4, 0, { robe: ROBE.levi, yaw: 0, arms: 0.2, skin: SKIN[2] });
    for (let j = 0; j < 3; j++) if (M.i > j) k.s(2.6, -0.6 + j * 0.6, 2.9, 0.09, 0.09, 0.09, '!#FFD24A');
    if (M.i >= 3) k.label('נשמע עד יריחו', GT.a - 1.0, GT.s, 3.5, 0.34, { bg: 'rgba(255,236,170,.95)' });
  } else {
    // the דוכן: the Levites' platform with three steps, the singers in two rows, בן ארזא with the cymbal, the two trumpeters at the edge, the people below
    k.b((DU.a0 + DU.a1) / 2, 0.1, DU.h / 2, DU.s1 - DU.s0, DU.a1 - DU.a0, DU.h, STONE);
    for (let st = 0; st < 3; st++) k.b(DU.a0 - 0.2 - st * 0.22, 0.1, 0.12 + (2 - st) * 0.12, DU.s1 - DU.s0 - 0.8, 0.4, 0.18, STONE2);
    k.label('הדוכן — הלוים בשיר', 5.5, 0.1, 2.9, 0.3);
    for (let r = 0; r < 2; r++) for (let q = 0; q < 5; q++) {
      const a = 5.1 - r * 0.9, s = -2.2 + q * 1.0, sing = kd === 'song' || kd === 'ttt';
      man(k, a, s, DU.h, { robe: ROBE.levi, yaw: Math.PI, arms: sing ? 0.5 + 0.1 * Math.sin(T * 5 + q) : 0.2, skin: SKIN[(q + r) % 3] });
      if (r === 0) k.b(a - 0.35, s, DU.h + 0.75, 0.3, 0.06, 0.4, GOLD);                                                                    // a lyre
    }
    man(k, 4.2, -2.6, DU.h, { robe: ROBE.kohen, yaw: Math.PI, arms: 0.6, skin: SKIN[1], cap: '#B59B62' });                              // בן ארזא
    k.c(3.7, -2.6, DU.h + 1.1, 0.22, 0.03, GOLD, { }); k.c(3.7, -2.35, DU.h + 1.1, 0.22, 0.03, GOLD, { });
    for (let j = 0; j < 2; j++) {
      const P = { a: 3.9, s: j ? 1.4 : -0.4 }, on = kd === 'ttt';
      man(k, P.a, P.s, DU.h, { robe: ROBE.kohen, yaw: Math.PI, arms: 1.2 + (on ? 0.1 * up : 0), skin: SKIN[j] });
      trumpet(k, P.a - 0.5, P.s, DU.h + 1.02, Math.PI, 1.2, on ? up : 0);
      if (on && up > 0.5) for (let z = 0; z < 3; z++) k.ring(P.a - (1.5 + z * 0.45), P.s, DU.h + 1.65, 0.14 + z * 0.12, '!#FFF3C4', 8);
    }
    const bow = kd === 'ttt' ? Math.sin(clamp(u) * Math.PI) : 0;
    for (let q = 0; q < 4; q++) man(k, 1.3 + (q % 2) * 0.6, -2.2 + q * 1.5, 0, { robe: ROBE.worker, yaw: 0, arms: 0.1, lean: 0.2 + 0.8 * bow, skin: SKIN[q % 3] });
    for (let p = 0; p < M.sung; p++) k.s(2.8, -0.9 + p * 0.5, 3.0, 0.09, 0.09, 0.09, '!#FFD24A');
    if (M.phase === 'work' && !M.cur) k.ring(3.8, 0.5, DU.h, 0.4 + 0.5 * (1 - bu), '!#FFD24A', 14);
  }
  if (M.cur && M.cur.k === 'ttt') k.label(BLASTS[M.blast < 0 ? 0 : M.blast], 3.0, 0.4, 3.5, 0.4, { bg: 'rgba(255,236,170,.95)' });
  says(k, M);
}
export const tokim = mk({
  id: 'tokim', he: 'התוקעים — בית התקיעה', place: 'tokim',
  fact: { he: 'שתי חצוצרות כסף — בשער שלוש תקיעות: תקיעה, תרועה, תקיעה; ועל הדוכן, בסוף כל פרק של שיר הלוים, תוקעים וכל העם משתחווים. "לבית התקיעה" — כך חרות על אבן שנמצאה בפינה הדרומית־מערבית של הר הבית; משם תקע כהן בחצוצרה להודיע על כניסת השבת ויציאתה', ref: 'סוכה ה, ה; תמיד ז, ג; יוספוס, מלחמת היהודים ד, ט, יב; חפירות בנימין מזר, 1968' },
  stage: { ahead: -0.5, lat: 0, K: 1.45 }, bounds: [0.8, 6.0, -3.6, 3.6, 3.8],
  model: tokimModel, draw: tokimDraw, target: (M) => (M.scene ? [3.8, 0.5, 2.4] : [TR[0].a, TR[0].s, 2.2]),
});


export { pitumDraw, macharDraw, etzimDraw, tokimDraw };
/* ───────────────────────────── registration: the registry (day/works.js) and the errands (day/tasks.js) ───────────────────────────── */
export const PAYIS_WORKS = { payis, payis2, payis3, payis4, pitum, yachid, machar, etzim, tokim, ganan };   // ── bloodb25 ── (+ ganan)
const ICON = { payis: '☝', payis2: '☝', payis3: '☝', payis4: '☝', pitum: '💨', yachid: '🐑', machar: '🐑', etzim: '🪵', tokim: '🎺', ganan: '🪙' };
function reg(id, w) {
  WORKS[id] = {
    id, he: w.he, icon: ICON[id], fact: w.fact, place: w.place,
    begin(ctx) { if (!warmWorks(ctx)) return null; const r = w.begin(); if (r && r.ok) { try { w.lastFit = refit(ctx, w.bounds); } catch (e) { /* the kit's own place stands */ } } return r && r.ok ? { ok: true, at: r.at } : null; },
    model(ctx) { warmWorks(ctx); return w.model(s27Opts(ctx) /* ── slice27 ── (the level: L1 / L2) ── /slice27 ── */); },
    update: (M) => w.update(M), touch: (d, M) => w.touch(d, M), box: () => w.box(), hooks: () => w.hooks(),
    end(r, ctx) {
      w.end(r);
      try { if (id === 'pitum' && ctx && ctx.stock && ctx.task && !ctx.task.restock && r && !r.skipped) ctx.stock.add('ketoret', 2); } catch (e) { /* the store's */ }
      try { if (ctx && typeof ctx.mentor === 'function' && r && !r.skipped) { ctx.mentored = true; if (id === 'yachid') { const L = yachidMentor(globalThis.__YACHID); ctx.mentor(L.text, L.src); } else ctx.mentor(w.fact.he, `${w.fact.ref}${w.fact.illus ? ' · המחשה' : ''} · טיוטה`); } } catch (e) { /* the mentor's */ }   // ── bloodb25 ── (yachid: the line by the kinds played)
    },
  };
}
for (const id in PAYIS_WORKS) reg(id, PAYIS_WORKS[id]);
/** the errands: the third lot and tomorrow's lamb leave their sheets (the sheet stays: portrait plays it, the home's sheet settles the errand through `sheet`);
 *  the fourth lot, the pitum, the private offerings, the wood offering and the trumpeters are errands of their own (the day's list is built after this file loads) */
PLACE22.avtinas = { x: -38, z: 58, he: 'בית אבטינס' };
PLACE22.tokim = { x: -58, z: -36, he: 'העזרה' };   // (the open floor of the north azara: the gate and the platform are drawn by the work itself)
PLACE22.gazit = { x: -108, z: 51, he: 'לשכת הגזית' };   // (the old spot stands in a two-amot lane against the chambers' wall: the lots' circle had no room — ⚑ default: the open floor at the chamber's west end)
RESTOCK.ketoret.place = 'avtinas';
PLACE22.ganan = GANAN_PLACE;   // ── bloodb25 ──
const NEW = [
  { id: 'g-payis4', work: 'payis4', from: 'matitya_ben_shmuel', place: 'gazit', openH: 6.7, dueH: 8, pts: 10, icon: '☝', he: 'חדשים עם ישנים — מי מעלה אברים לכבש?', src: 'תמיד ה, ב' },
  { id: 'pitum', work: 'pitum', from: 'beit_avtinas', place: 'avtinas', openH: 9, dueH: 14, pts: 16, icon: '💨', he: 'בית אבטינס — פיטום הקטורת: אחד עשר הסממנים.', src: 'כריתות ו, א; שקלים ה, א' },
  { id: 'yachid', work: 'yachid', from: 'hamemune', fromHe: 'הממונה', place: 'rings', openH: 8.2, dueH: 13, pts: 14, icon: '🐑', he: 'קרבנות היחיד בצפון — הבעלים סומך, והכהן מקבל.', src: 'זבחים ה, א' },
  { id: 'etzim', work: 'etzim', from: 'hamemune', fromHe: 'לשכת העצים', place: 'wood', openH: 13.2, dueH: 16, pts: 10, icon: '🪵', he: 'משפחות מנדבות עצים — עצי כהנים והעם.', src: 'תענית ד, ה' },
  GANAN_TASK,   // ── bloodb25 ── (once a day: the gardeners at the outlet, "+1")
  { id: 'tokim', work: 'tokim', from: 'hugras_ben_levi', place: 'tokim', openH: 10, dueH: 14, pts: 14, icon: '🎺', he: 'התוקעים — שתי חצוצרות כסף: בשער ועל הדוכן.', src: 'סוכה ה, ה' },
];
for (const t of TEMPLATES) {
  if (t.id === 'g-payis3') { t.sheet = t.game; delete t.game; t.work = 'payis3'; t.pts = 12; t.he = 'חדשים לקטורת — באו והפיסו (עוצרים את הטבעת).'; }
  if (t.id === 'g-machar') { t.sheet = t.game; delete t.game; t.work = 'machar'; t.pts = 12; t.icon = '🐑'; }
}
for (const t of NEW) if (!TEMPLATES.some((x) => x.id === t.id)) TEMPLATES.push(t);
try { globalThis.__PAYIS24 = { works: PAYIS_WORKS, tasks: ['g-payis1', 'g-payis2', 'g-payis3', 'g-payis4', 'g-machar', 'pitum', 'yachid', 'etzim', 'tokim'] }; } catch (e) { /* tests */ }
