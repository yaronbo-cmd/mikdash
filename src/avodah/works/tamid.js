// ── tamidb23 ──
/* tamid.js — the Tamid's later works as world crafts beside the אמרכל (WAVE23 "TAMIDB23"), on WORKSA22's kit (craft.js makeWork +
 * baseModel, figures.js). Each is a chain of acts: one tap = the kohen's next act (≤ 50 ms: the figure moves on the press), the "+N" born
 * on the piece, the mentor line (the source + "טיוטה") after the end. Taps alone finish every work; a hold is the better pour, never needed.
 *   ketoret — the פרס from בית אבטינס (3 grinds, המחשה), the בזך filled, the מחתה of coals from the second pyre, the מגרפה thrown,
 *             then at the door of the היכל: the kohen inside heaps the coals, "הקטר!" — the people withdraw — the cloud, the bow (9 acts).
 *   birkat  — the kohanim up the Ulam's steps, the first five with the five vessels, three verses with the hands over the head (9 acts).
 *             The words are never written: the mentor line cites במדבר ו, כד–כו only.
 *   erev    — the evening Tamid, short: the lamb to the ring, the screen ("הכהן שחט": nothing red, ever), the vessel to the two corners
 *             (NE, SW: no liquid drawn), the parts to the ramp, the two logs (8 acts).
 *   neirot  — the evening ketoret at the door (3) and the lamps lit one from another from the western lamp (6) (9 acts).
 * The player (the אמרכל) never passes the ההיכל's door: the door is a prop of the stage and the kohen inside acts on his taps.
 * Nothing red (kit.js isRed), no blood, no Name. The song (שיר של יום) is song.js. ── /tamidb23 ── */
import { baseModel, makeWork, clamp, ease, getCtx } from './craft.js';
import { man, lamb, flame, ROBE, SKIN } from './figures.js';
import { closeAt } from './closeup.js';   // ── figures24 ── (the close-up at the key act) ── /figures24 ──
import { BLOOD, GRAVE, liquid, tagBlood, graveStart, graveStep, graveOn, TEACH } from './blood.js';   // ── blooda25 ──

// ── tamidb23 ── shared: palette, the chain model, the props ──
export const C = {
  stone: '#CFC3A7', stone2: '#B9AC8E', step: '#D8CDB2', gold: '#D9B24A', gold2: '#F0D27A', silver: '#C9CED6', bronze: '#A7834F',
  wood: '#7A5535', dark: '#3E372E', inner: '#4A4236', coal: '!#FFB347', ash: '#7D766C', cloud: '!#F4F2EC', cloth: '#DCE4EE', part: '#E9DFCB', powder: '#C9A97A',
};
export const lerp = (a, b, u) => a + (b - a) * u;
const PEOPLE = ['#A8957A', '#8F8670', '#9AA0A8', '#B4A27C', '#857A68', '#A39C8C'];

/** a figure that walks: { a, s, yaw, a0, s0, a1, s1, t, dur } — moveTo starts a walk, stepFigs advances them */
export const fig = (a, s, yaw = 0) => ({ a, s, yaw, a0: a, s0: s, a1: a, s1: s, t: 1, dur: 0 });
export function moveTo(f, a, s, dur = 0.9) { f.a0 = f.a; f.s0 = f.s; f.a1 = a; f.s1 = s; f.t = 0; f.dur = Math.max(0.05, dur); if (Math.hypot(a - f.a, s - f.s) > 0.05) f.yaw = Math.atan2(s - f.s, a - f.a); }
function stepFigs(m, dt) {
  let walking = 0;
  for (const k in m.f) { const f = m.f[k]; if (f.t < 1) { f.t = Math.min(1, f.t + dt / f.dur); const u = ease(f.t); f.a = lerp(f.a0, f.a1, u); f.s = lerp(f.s0, f.s1, u); if (f.t < 1) walking++; } }
  return walking;
}
export const walkPh = (f, T) => (f.t < 1 ? Math.sin(T * 9) * 0.05 : 0);

/** the chain model. steps: [{ say, at(m) → [a, s, y], act(m), enter(m), wait (s after the act), sfx, ready(m), hold }]; o.level.
 *  m.f: the figures; m.tA[i]: the game time of act i (the draw animates from it); m.cur: the step now waiting for its tap. */
export function chainModel(kind, o, steps, ext = {}) {
  const M = baseModel(kind, o, {
    n: steps.length, holds: !!ext.holds, coach: ext.coach,
    ready: (m) => m.busy <= 0 && m.walking === 0 && (!steps[m.i] || !steps[m.i].ready || steps[m.i].ready(m)),
    tap(m) {
      const st = steps[m.i]; if (!st) return;
      if (graveOn(m)) return;   // ── blooda25 ── (the stillness: a tap is swallowed)
      if (st.grave) {   // ── blooda25 ── the slaughter behind the screen: the moment of gravity — NO "+N", no chime (DAM25 §2.4)
        m.tA[m.i] = m.t; if (st.act) st.act(m); graveStart(m); m.busy = GRAVE.dur; m.advance();
        const nx = steps[m.i]; if (nx && nx.enter && m.phase === 'work') nx.enter(m); return;
      }
      if (st.tapPart && !st.tapPart(m)) return;                  // (a step that fills by parts — the pour: a tap is one portion)
      m.tA[m.i] = m.t; if (st.act) st.act(m);
      m.pay(st.at ? st.at(m) : [3, 0, 1.2], ''); m.fx.push({ sfx: st.sfx || 'good', haptic: st.haptic || 10 });
      m.say = st.say || ''; m.sayT = st.sayT || 1.7; m.busy = st.wait == null ? 0.45 : st.wait;
      m.advance();
      const nx = steps[m.i]; if (nx && nx.enter && m.phase === 'work') nx.enter(m);
    },
    press(m, down) { m.downT = down ? m.t : -1; if (ext.press) ext.press(m, down); },
    step(m, dt) {
      if (m.sayT > 0) { m.sayT -= dt; if (m.sayT <= 0) m.say = ''; }
      if (graveStep(m, dt)) m.pending = 0;   // ── blooda25 ──
      if (m.busy > 0) m.busy -= dt;
      m.walking = stepFigs(m, dt);
      if (ext.step) ext.step(m, dt);
    },
  });
  Object.assign(M, { f: {}, tA: [], busy: 0, walking: 0, sayT: 0, downT: -1, steps });
  M.since = (i) => (M.tA[i] == null ? -1 : M.t - M.tA[i]);
  M.cur = () => steps[Math.min(M.i, steps.length - 1)];
  if (ext.init) ext.init(M);
  if (steps[0] && steps[0].enter) steps[0].enter(M);
  return M;
}

/** the gold ring of the next thing to touch (grows while his thumb is down) */
export function cue(k, M, T, a, s, r = 0.8) { if (M.phase !== 'work' || M.walking || M.busy > 0) return; const rr = (r + 0.08 * Math.sin(T * 5)) * (M.pressed ? 1.22 : 1); k.ring(a, s, 0.02, rr); }
/** the say-line over the stage, and "עוד קצת" */
export function says(k, M, a = 3.2, s = 0, y = 3.3) { if (M.say) k.label(M.say, a, s, y, 0.36); if (M.warn) k.label(M.warn, a, s, y + 0.5, 0.3); }

/** the door of the היכל (a frame in the Ulam's wall) and the room beyond it: the golden altar (ga) and, if menorah, the lamps (lit[i] 0…1).
 *  The door stands at a = A; the room runs on to A + 2.4. The אמרכל is never inside: this is a prop on the stage. */
export function heichalDoor(k, A, S0, o = {}) {
  const W = o.w || 2.6, H = o.h || 3.2;
  k.b(A, S0 - W / 2 - 1.6, H / 2 + 0.3, 3.0, 0.6, H + 0.6, C.stone);                 // the Ulam's wall, left and right of the door
  k.b(A, S0 + W / 2 + 1.6, H / 2 + 0.3, 3.0, 0.6, H + 0.6, C.stone);
  k.b(A, S0, H + 0.45, W + 0.4, 0.62, 0.5, C.stone2);                                // the lintel
  for (const sg of [-1, 1]) k.b(A - 0.05, S0 + sg * (W / 2 + 0.06), H / 2, 0.14, 0.5, H, C.gold);   // the gilded door posts
  k.b(A + 2.5, S0, H / 2 + 0.2, W + 2.4, 0.3, H + 0.4, C.inner);                     // the room's far wall (dim)
  k.b(A + 1.2, S0, 0.02, W + 1.6, 2.6, 0.04, '#6A5F4E');                              // its floor
  if (o.ga) { const g = o.ga; k.b(A + 1.5, S0 + g.s, 0.55, 0.62, 0.62, 1.1, C.gold); k.b(A + 1.5, S0 + g.s, 1.12, 0.7, 0.7, 0.06, C.gold2);
    if (g.coals) for (let i = 0; i < 5; i++) k.s(A + 1.5 + Math.cos(i * 1.3) * 0.16, S0 + g.s + Math.sin(i * 1.3) * 0.16, 1.18, 0.1 * g.coals, 0.05, 0.1 * g.coals, C.coal); }
  if (o.menorah) {
    const ms = S0 + o.menorah.s, lit = o.menorah.lit, base = A + 1.7;
    k.c(base, ms, 0.12, 0.28, 0.24, C.gold); k.c(base, ms, 0.9, 0.05, 1.5, C.gold);
    for (let i = 0; i < 7; i++) {
      const d = (i - 3) * 0.26, hgt = 1.62;
      if (i !== 3) { const r = Math.abs(d); k.c(base, ms + d * 0.5, 1.0 + 0.0 * r, 0.03, 0.04, C.gold); k.c(base, ms + d, 1.25, 0.03, 0.75 - (3 - Math.abs(i - 3)) * 0.0, C.gold, { roll: 0 }); }
      k.c(base, ms + d, hgt, 0.06, 0.08, C.gold2);                                        // the lamp
      const L = lit[i] || 0; if (L > 0.02) flame(k, base, ms + d, hgt + 0.03, 0.32 * Math.min(1, L), (o.T || 0) + i);
    }
  }
}
/** the altar's corner (a block of the outer altar with its horn) and the coals of the second pyre on it */
export function altarCorner(k, a, s, o = {}) {
  const w = o.w || 2.4, d = o.d || 1.8, h = o.h || 1.4;
  k.b(a, s, h / 2, w, d, h, C.stone); k.b(a, s, h + 0.05, w + 0.1, d + 0.1, 0.1, C.stone2);
  k.b(a - d / 2 + 0.2, s - w / 2 + 0.2, h + 0.3, 0.32, 0.32, 0.5, C.stone2);              // the horn
  if (o.fire !== false) { for (let i = 0; i < 6; i++) k.s(a + 0.25 + Math.cos(i) * 0.4, s + Math.sin(i * 1.7) * 0.5, h + 0.12, 0.2, 0.08, 0.2, C.coal); flame(k, a + 0.3, s, h + 0.1, 0.8 + (o.heat || 0) * 0.35, o.T || 0); }
}
/** the cloud of the ketoret: soft white spheres rising (u 0…1) */
export function cloud(k, a, s, y, u, T) {
  if (u <= 0) return;
  for (let i = 0; i < 9; i++) { const ph = (T * 0.25 + i / 9) % 1, r = (0.2 + 0.5 * ph) * Math.min(1, u * 1.4); k.s(a + Math.sin(i * 2.1 + T * 0.4) * 0.35 * ph, s + Math.cos(i * 1.7) * 0.45 * ph, y + ph * 2.6 * u, r, r * 0.8, r, C.cloud); }
}
/** a pale part of the offering (abstract, never anatomical) */
export const partShape = (k, a, s, y, sc = 1) => { k.s(a, s, y, 0.26 * sc, 0.14 * sc, 0.2 * sc, C.part); };
/** the people of the court, standing (bow 0…1, back 0…1: withdrawn) */
export function people(k, a, s0, s1, n, o = {}) {
  for (let i = 0; i < n; i++) { const s = lerp(s0, s1, n > 1 ? i / (n - 1) : 0.5), aa = a - (o.back || 0) * 1.1 + (i % 2) * 0.35; man(k, aa, s, 0, { robe: PEOPLE[i % PEOPLE.length], cap: '#5C5242', yaw: o.yaw == null ? 0 : o.yaw, lean: (o.bow || 0) * 1.6, skin: SKIN[i % 3], scale: 0.92 }); }
}
// ── /tamidb23 ──

/* ───────────────────────── 1. הקטורת (תמיד ה, ד–ו; ו, ב–ג; כריתות ו, א) ───────────────────────── */
// ── tamidb23 ── ketoret ──
const KM = { mortar: [2.3, -3.4], bowl: [2.0, -2.2], altar: [4.3, -0.9], magrefa: [2.7, 1.0], door: [4.6, 2.9] };
const DOOR_K = KM.door[0], DOOR_S = KM.door[1];
const KSTEPS = [
  { say: 'שוחקים — הדק היטב', at: () => [KM.mortar[0], KM.mortar[1], 1.0], sfx: 'soft', wait: 0.3 },
  { say: 'הדק היטב', at: () => [KM.mortar[0], KM.mortar[1], 1.0], sfx: 'soft', wait: 0.3 },
  { say: 'הקטורת שחוקה', at: () => [KM.mortar[0], KM.mortar[1], 1.0], sfx: 'good', wait: 0.4 },
  { say: 'הבזך — מלא וגדוש', at: () => [KM.bowl[0], KM.bowl[1], 1.1], act: (m) => moveTo(m.f.k1, 3.4, 1.6, 1.4), wait: 0.4,
    enter: () => {} },
  { say: 'מחתה של כסף — גחלים מן המערכה השנייה', at: () => [KM.altar[0], KM.altar[1], 1.7], sfx: 'soft', wait: 0.3,
    enter: (m) => moveTo(m.f.k2, KM.altar[0] - 1.4, KM.altar[1] + 0.2, 1.1),
    act: (m) => { m.pan = 1; } },
  { say: 'קול המגרפה!', at: () => [KM.magrefa[0], KM.magrefa[1], 0.6], sfx: 'chime', haptic: 30, wait: 1.0,
    enter: (m) => moveTo(m.f.k2, 3.3, 2.2, 1.1),
    act: (m) => { m.thrown = 1; for (let i = 0; i < 3; i++) moveTo(m.f['l' + i], 1.6 + i * 0.4, 5.2, 1.6); } },
  { say: 'צבר את הגחלים על מזבח הזהב', at: () => [DOOR_K + 1.5, DOOR_S - 0.6, 1.4], wait: 0.5,
    enter: (m) => moveTo(m.f.k2, DOOR_K + 1.0, DOOR_S - 0.9, 1.2),
    act: (m) => { m.pan = 0; m.coals = 1; moveTo(m.f.k2, DOOR_K - 0.6, DOOR_S + 1.9, 1.3); } },
  { say: 'הקטר!', at: () => [DOOR_K + 1.5, DOOR_S - 0.6, 1.6], wait: 0.6,
    enter: (m) => { moveTo(m.f.k1, DOOR_K + 1.0, DOOR_S - 0.2, 1.3); m.call = 1; },
    act: (m) => { m.back = 1; m.smoke = 0.01; } },
  { say: 'השתחוה ויצא', at: () => [DOOR_K + 1.0, DOOR_S - 0.2, 1.4], wait: 0.4,
    act: (m) => { m.bowT = m.t; } },
];
export function ketoretModel(o = {}) {
  return chainModel('ketoret', o, KSTEPS, {
    coach: "הקישו על 'עבודה' — כל הקשה: מעשה הכהן הבא",
    init(m) {
      Object.assign(m, { pan: 0, thrown: 0, coals: 0, call: 0, back: 0, smoke: 0, bowT: -1 });
      m.f.av = fig(KM.mortar[0] + 0.85, KM.mortar[1] + 0.2, Math.PI * 0.9);     // the man of בית אבטינס at the mortar
      m.f.k1 = fig(KM.bowl[0] + 0.1, KM.bowl[1] + 0.9, -Math.PI / 2);           // the one who won the ketoret (the כף and the בזך)
      m.f.k2 = fig(2.2, 0.0, 0);                                                 // the one who won the מחתה
      for (let i = 0; i < 3; i++) m.f['l' + i] = fig(1.5 + i * 0.5, 2.0 + i * 0.35, 0);   // the Levites, who run at the sound
    },
    step(m, dt) { if (m.smoke > 0) m.smoke = Math.min(1, m.smoke + dt / 1.6); m.back = m.back ? Math.min(1, m.back + dt) : 0; },
  });
}
function ketoretDraw(k, M, T) {
  if (!M) return;
  const F = M.f, g = Math.min(3, M.i);
  // בית אבטינס: the mortar and the pestle; the powder mound grows with each grind
  k.label('בית אבטינס', KM.mortar[0] + 0.3, KM.mortar[1], 2.6, 0.28);
  k.c(KM.mortar[0], KM.mortar[1], 0.35, 0.5, 0.7, C.stone2); k.c(KM.mortar[0], KM.mortar[1], 0.71, 0.4, 0.04, C.dark);
  if (g > 0) k.s(KM.mortar[0], KM.mortar[1], 0.7, 0.32, 0.06 + 0.04 * g, 0.32, C.powder);
  const gs = M.i < 3 ? (M.pressed ? 1 : 0) : 0, lastG = M.since(Math.max(0, Math.min(2, M.i - 1)));
  const fall = M.i <= 3 && lastG >= 0 && lastG < 0.18 ? 1 : gs ? 0.7 : 0;            // (the press lifts the pestle; the tap lets it fall)
  const py = 0.75 + (M.i < 3 ? (fall ? 0.05 : 0.55) : 0.3);
  k.c(KM.mortar[0] + 0.05, KM.mortar[1], py + 0.45, 0.07, 0.9, C.wood, { roll: 0.15 });
  man(k, F.av.a, F.av.s, 0, { robe: ROBE.worker, yaw: F.av.yaw, arms: M.i < 3 ? (fall ? 0.45 : 0.8) : 0.2, skin: SKIN[2], cap: '#5C5242' });
  // the כף with the בזך (a gold ladle-bowl); it fills at step 3, then the kohen carries it
  const full = M.i > 3 ? 1 : 0, carry = M.i > 3;
  const ba = carry ? F.k1.a + 0.35 * Math.cos(F.k1.yaw) : KM.bowl[0], bs = carry ? F.k1.s + 0.35 * Math.sin(F.k1.yaw) : KM.bowl[1], by = carry ? 1.0 : 0.5;
  if (!carry) k.b(KM.bowl[0], KM.bowl[1], 0.25, 0.7, 0.7, 0.5, C.stone2);
  k.c(ba, bs, by + 0.06, 0.24, 0.12, C.gold); if (full) k.s(ba, bs, by + 0.14, 0.2, 0.09, 0.2, C.powder);
  man(k, F.k1.a, F.k1.s + walkPh(F.k1, T), 0, { robe: ROBE.kohen, yaw: F.k1.yaw, arms: carry ? 0.55 : 0.15, lean: M.bowT >= 0 ? Math.min(1, (M.t - M.bowT) * 2) * 0.9 * (M.t - M.bowT < 1.2 ? 1 : 0) : 0 });
  // the altar's corner and the second pyre; the מחתה-kohen with his pan
  altarCorner(k, KM.altar[0], KM.altar[1], { T, heat: 0.4 });
  const pa = F.k2.a + 0.4 * Math.cos(F.k2.yaw), ps = F.k2.s + 0.4 * Math.sin(F.k2.yaw);
  if (M.i >= 4 && !M.coals) { k.c(pa, ps, 1.0, 0.2, 0.05, C.silver); if (M.pan) for (let i = 0; i < 4; i++) k.s(pa + Math.cos(i * 1.6) * 0.08, ps + Math.sin(i * 1.6) * 0.08, 1.05, 0.07, 0.05, 0.07, C.coal); }
  man(k, F.k2.a, F.k2.s + walkPh(F.k2, T), 0, { robe: ROBE.kohen, yaw: F.k2.yaw, arms: M.i >= 4 && !M.coals ? 0.5 : 0.15, skin: SKIN[1] });
  // the מגרפה: on the ground until thrown; it flies and lands between the Ulam and the altar; a shock ring and the Levites run
  const tm = M.since(5);
  if (tm < 0) { k.c(KM.magrefa[0], KM.magrefa[1], 0.06, 0.04, 1.2, C.bronze, { pitch: Math.PI / 2, yaw: 0.6 }); k.b(KM.magrefa[0] + 0.6, KM.magrefa[1] + 0.35, 0.06, 0.5, 0.2, 0.08, C.bronze, { yaw: 0.6 }); }
  else {
    const u = clamp(tm / 0.5), a = lerp(KM.magrefa[0], KM.magrefa[0] + 1.2, u), s = lerp(KM.magrefa[1], KM.magrefa[1] + 0.6, u), y = 0.1 + Math.sin(u * Math.PI) * 1.6;
    k.c(a, s, y, 0.04, 1.2, C.bronze, { pitch: Math.PI / 2, yaw: 0.6 + u * 4 }); k.b(a + 0.4, s + 0.2, y, 0.5, 0.2, 0.08, C.bronze, { yaw: 0.6 + u * 4 });
    if (tm > 0.5 && tm < 1.4) { const v = (tm - 0.5) / 0.9; k.ring(KM.magrefa[0] + 1.2, KM.magrefa[1] + 0.6, 0.05, 0.4 + v * 3.2, '!#FFE9B0', 22); k.ring(KM.magrefa[0] + 1.2, KM.magrefa[1] + 0.6, 0.05, 0.2 + v * 2.0, '!#FFE9B0', 14); }
  }
  for (let i = 0; i < 3; i++) { const L = F['l' + i]; man(k, L.a, L.s + walkPh(L, T * 1.4), 0, { robe: ROBE.levi, yaw: L.yaw, scale: 0.95, skin: SKIN[i % 3] }); }
  // the Ulam's steps and the door; inside: the golden altar, the coals heaped, the cloud
  for (let j = 0; j < 3; j++) k.b(DOOR_K - 1.0 + j * 0.3, DOOR_S, 0.06 + j * 0.06, 4.6, 0.3, 0.12 + j * 0.12, C.step);
  heichalDoor(k, DOOR_K, DOOR_S, { ga: { s: -0.6, coals: M.coals }, w: 2.4, h: 3.0 });
  cloud(k, DOOR_K + 1.5, DOOR_S - 0.6, 1.25, M.smoke, T);
  if (M.smoke > 0 && (M.bowT < 0 || M.t - M.bowT < 1.8)) closeAt(k, DOOR_K - 0.2, DOOR_S - 0.3, 1.7, { dist: 6.5, el: 0.36, from: Math.PI, hold: 0.5, key: 'ketoret' });   // ── figures24 ── the cloud rising at the door ── /figures24 ──
  // the ממונה at the door calls "הקטר!"; the people of the court withdraw
  if (M.call) man(k, DOOR_K - 0.9, DOOR_S - 1.6, 0, { robe: ROBE.amarkal, yaw: 0.4, arms: M.back ? 0.2 : 0.7, cap: '#6B5E48' });
  people(k, 1.3, 2.0, 4.2, 4, { back: M.back, bow: M.bowT >= 0 ? clamp((M.t - M.bowT) * 2) * 0.6 : 0 });
  // the next thing to touch
  const st = M.i;
  if (st < 3) cue(k, M, T, KM.mortar[0], KM.mortar[1], 0.75); else if (st === 3) cue(k, M, T, KM.bowl[0], KM.bowl[1], 0.6);
  else if (st === 4) cue(k, M, T, KM.altar[0] - 1.0, KM.altar[1], 0.7); else if (st === 5) cue(k, M, T, KM.magrefa[0], KM.magrefa[1], 0.8);
  else if (st <= 8) cue(k, M, T, DOOR_K - 0.5, DOOR_S, 0.9);
  says(k, M, 3.0, 0.4, 3.6);
}
export const ketoret = makeWork({
  id: 'ketoret', he: 'הקטורת', place: 'ketoret',
  fact: { he: 'מי שזכה בקטורת נוטל את הכף והבזך בתוכו מלא וגדוש קטורת; מי שזכה במחתה חותה גחלים מן המערכה; בין האולם ולמזבח זורקים את המגרפה — אין אדם שומע קול חברו בירושלים מקול המגרפה. בהיכל צובר את הגחלים, ואינו מקטיר עד שהממונה אומר לו "הקטר!" — פרשו העם, והקטיר והשתחוה ויצא. השחיקה בבית אבטינס כאן — המחשה', ref: 'תמיד ה, ד–ו; ו, ב–ג; כריתות ו, א', illus: true },
  stage: { ahead: -0.6, lat: 0, K: 1.5 }, bounds: [1.2, 6.0, -4.4, 5.0, 3.4],
  model: ketoretModel, draw: ketoretDraw,
  target: (M) => { const st = KSTEPS[Math.min(M.i, KSTEPS.length - 1)]; return st.at(M); },
});
// ── /tamidb23 ──

/* ───────────────────────── 2. ברכת כהנים (תמיד ז, ב) ───────────────────────── */
// ── tamidb23 ── birkat ──
import { BIRKAT_VERSES, BIRKAT_SRC } from './birkat28.js';   // ── light28 ── ── /light28 ──
const VESSELS = ['הטני', 'הכוז', 'המחתה', 'הבזך', 'הכף וכסויו'];
// ── light28 ── the owner (12.10): the whole blessing — the three verses in full (במדבר ו, כד–כו), as a printed siddur prints them, in their own
// file (birkat28.js: the one place they are written). Shown one per tap, large, over the kohanim's raised hands (day/index.js l28Frame; the crowd's "אמן")
const VERSE = BIRKAT_VERSES;
export { BIRKAT_VERSES, BIRKAT_SRC };
// ── /light28 ──
const BK = { top: 4.2, foot: 2.3, sOf: (i) => -3.3 + i * 1.1 };   // 7 kohanim along the top step
const BSTEPS = [
  { say: 'באו ועמדו על מעלות האולם', at: () => [BK.top, 0, 2.2], wait: 1.3, act: (m) => { for (let i = 0; i < 7; i++) moveTo(m.f['k' + i], BK.top, BK.sOf(i), 1.2); } },
  ...VESSELS.map((v, j) => ({ say: v, at: () => [BK.top, BK.sOf(j), 2.0], wait: 0.35, act: (m) => { m.held[j] = 1; } })),
  ...VERSE.map((v, j) => ({ say: '' /* ── light28 ── (the verse itself is shown, in full, by the day's verse line: no second label) ── /light28 ── */, at: () => [BK.top, 0, 2.8], sfx: j === 2 ? 'chime' : 'good', wait: 1.6 /* ── light28 ── (0.9 → 1.6: time to read the verse) ── /light28 ── */, sayT: j === 2 ? 2.6 : 1.4, act: (m) => { m.verse = j + 1; m.verseT = m.t; } })),
];
export function birkatModel(o = {}) {
  return chainModel('birkat', o, BSTEPS, {
    coach: "הקישו על 'עבודה' — הכהנים עולים, הכלים בידם, ובכל הקשה פסוק",
    init(m) { m.held = [0, 0, 0, 0, 0]; m.verse = 0; for (let i = 0; i < 7; i++) m.f['k' + i] = fig(BK.foot, BK.sOf(i) * 0.9, 0); },
  });
}
const VDRAW = [
  (k, a, s, y) => { k.c(a, s, y, 0.17, 0.2, C.gold); },                                           // הטני (a basket-like vessel)
  (k, a, s, y) => { k.c(a, s, y, 0.1, 0.32, C.gold); },                                           // הכוז (a jug)
  (k, a, s, y) => { k.c(a, s, y, 0.2, 0.05, C.gold); k.c(a - 0.2, s, y, 0.025, 0.4, C.gold, { pitch: Math.PI / 2 }); },   // המחתה
  (k, a, s, y) => { k.c(a, s, y, 0.13, 0.08, C.gold2); },                                         // הבזך
  (k, a, s, y) => { k.c(a, s, y, 0.18, 0.1, C.gold); k.s(a, s, y + 0.07, 0.17, 0.05, 0.17, C.gold2); },   // הכף וכסויו
];
function birkatDraw(k, M, T) {
  if (!M) return;
  // the Ulam: its steps (three broad treads rising away) and its face with the great opening behind
  for (let j = 0; j < 4; j++) k.b(BK.foot + 0.6 + j * 0.42, 0, 0.08 + j * 0.1, 9.2, 0.42 * (4 - j) + 0.1, 0.16 + j * 0.2, j & 1 ? C.step : C.stone);
  const y0 = 0.72;
  k.b(BK.top + 1.5, -3.6, 2.4, 2.4, 0.6, 4.8, C.stone); k.b(BK.top + 1.5, 3.6, 2.4, 2.4, 0.6, 4.8, C.stone); k.b(BK.top + 1.5, 0, 4.6, 9.6, 0.6, 0.6, C.stone2);
  k.b(BK.top + 1.9, 0, 2.2, 4.8, 0.2, 4.4, C.inner);
  // the kohanim: up the steps, the first five with a vessel, then the hands over the head at each verse
  const lift = M.verse ? clamp(M.since(5 + M.verse) / 0.35) : 0;
  for (let i = 0; i < 7; i++) {
    const f = M.f['k' + i], up = f.t >= 1 && M.i > 0 ? y0 : f.t < 1 ? y0 * ease(f.t) : 0;
    // ── figures24 ── the blessing as the kohanim do it (תמיד ז, ב; סוטה ז, ו): the hands raised above the head, the palms out toward the
    // people, the thumbs all but touching, each hand's fingers split in two pairs; before it, the vessel carried in both hands
    const pz = M.verse ? 'bless' : i < 5 && M.held[i] ? 'carry' : f.t < 1 ? 'walk' : 'stand', pu = M.verse ? (M.verse === 1 && lift < 1 ? lift : 1) : 1;
    const hh = man(k, f.a, f.s + walkPh(f, T), up, { robe: ROBE.kohen, yaw: M.i > 0 && f.t >= 1 ? Math.PI : 0, pose: pz, u: pu, t: T + i * 0.9, skin: SKIN[i % 3], scale: 1.12 });
    if (i < 5 && M.held[i] && !M.verse) VDRAW[i](k, (hh.L[0] + hh.R[0]) / 2, (hh.L[1] + hh.R[1]) / 2, (hh.L[2] + hh.R[2]) / 2 - 0.08);
    // ── /figures24 ──
    if (i < 5 && M.held[i] && M.verse) VDRAW[i](k, f.a + 0.25, f.s + 0.25, up + 0.1);        // (set down at his feet for the blessing)
  }
  // ── figures24 ── (the glowing line of the hands is gone: the hands themselves read now) the close-up: the middle kohen's hands, from the people's side
  if (M.verse) closeAt(k, BK.top, BK.sOf(3), y0 + 1.62 * 1.12, { dist: 5.5, el: 0.36, from: Math.PI, hold: 0.5, key: 'birkat' });
  { const q = k.world(BK.top, BK.sOf(3), y0 + 2.3 * 1.12, {}); M.l28at = [q.x, q.y, q.z]; }   // ── light28 ── (the raised hands: the verse over them) ── /light28 ──
  // ── /figures24 ──
  // the people below, facing the kohanim; they bow a little at each verse
  const bw = M.verse ? clamp(M.since(5 + M.verse) / 0.5) * (1 - clamp((M.since(5 + M.verse) - 1.2) / 0.8)) : 0;
  people(k, 1.3, -3.4, 3.4, 6, { bow: bw * 0.5 });
  for (let j = 0; j < M.verse; j++) k.s(BK.top - 0.6, -1 + j, y0 + 2.6, 0.12, 0.12, 0.12, '!#FFD24A');   // (a gold dot per verse)
  if (M.i === 0) cue(k, M, T, BK.foot, 0, 1.0); else if (M.i <= 5) { const f = M.f['k' + (M.i - 1)]; cue(k, M, T, f.a - 0.6, f.s, 0.5); } else cue(k, M, T, BK.top - 1.1, 0, 1.1);
  says(k, M, 3.0, 0, 3.6);
}
export const birkat = makeWork({
  id: 'birkat', he: 'ברכת כהנים', place: 'ulam',
  fact: { he: 'באו ועמדו על מעלות האולם; הראשונים עומדים וחמשה כלים בידם — הטני, הכוז, המחתה, הבזך, והכף וכסויו — וברכו את העם ברכה אחת. במקדש ידיהם על גבי ראשיהם. ברכת כהנים — שלושת הפסוקים במלואם, כבסידור' /* ── light28 ── ── /light28 ── */, ref: 'תמיד ז, ב; במדבר ו, כד–כו' },
  stage: { ahead: -0.4, lat: 0, K: 1.45 }, bounds: [1.0, 6.0, -4.6, 4.6, 4.6],
  model: birkatModel, draw: birkatDraw,
  target: (M) => BSTEPS[Math.min(M.i, BSTEPS.length - 1)].at(M),
});
// ── /tamidb23 ──

/* ───────────────────────── 3. התמיד של בין הערביים (פסחים ה, א; תמיד ד, א; יומא ב, ה) — short; nothing red ───────────────────────── */
// ── tamidb23 ── erev ──
const EV = { ring: [3.0, -3.0], screen: [2.6, -3.0], altar: [4.3, 0.6], ramp: [2.6, 3.4], ne: [4.3 + 0.75, 0.6 + 1.05], sw: [4.3 - 0.75, 0.6 - 1.05], yesod: [4.3 - 0.75, 0.6 - 0.2] };
// ── blooda25 ── the blood as the work (DAM25 §3): the slaughter = the moment of gravity (no "+N"); the RECEIVING (the vessel with the dark liquid);
// the gifts at NE and SW below the line (the Γ marks); the rest on the southern yesod; then the parts and the two logs — ten acts
const ESTEPS = [
  { say: 'הטלה אל הטבעת — קרן מזרחית צפונית', at: () => [EV.ring[0], EV.ring[1], 1.0], sfx: 'soft', wait: 0.2, act: (m) => moveTo(m.f.lamb, EV.ring[0], EV.ring[1] + 0.2, 1.3) },
  { say: 'הכהן שחט', grave: true, at: () => [EV.screen[0], EV.screen[1], 2.2], act: (m) => { m.screenT = m.t; } },
  { say: 'וקבל המקבל', sayT: 3.0, at: () => [EV.screen[0] + 0.6, EV.screen[1] + 1.0, 1.4], wait: 0.4, enter: (m) => moveTo(m.f.z, EV.screen[0] + 0.6, EV.screen[1] + 1.2, 0.8), act: (m) => { m.fill = 0.7; m.say2 = TEACH.receive; } },
  { say: 'קרן מזרחית צפונית', at: () => [EV.ne[0], EV.ne[1], 1.7], wait: 0.4, enter: (m) => moveTo(m.f.z, EV.ne[0] - 1.2, EV.ne[1] + 0.5, 1.4), act: (m) => { m.tilt = 1; m.fill = 0.5; m.given[0] = 1; } },
  { say: 'קרן מערבית דרומית — שתי מתנות שהן ארבע', at: () => [EV.sw[0], EV.sw[1], 1.7], wait: 0.5, sayT: 2.4, enter: (m) => { m.tilt = 0; moveTo(m.f.z, EV.sw[0] - 1.2, EV.sw[1] - 0.6, 1.5); }, act: (m) => { m.tilt = 2; m.fill = 0.32; m.given[1] = 1; m.glowAt = m.t; } },
  { say: 'ושירים — על יסוד דרומית', sayT: 2.6, at: () => [EV.yesod[0], EV.yesod[1] - 1.0, 0.6], wait: 0.6, holdPour: true, enter: (m) => { m.tilt = 0; moveTo(m.f.z, EV.yesod[0] - 0.4, EV.yesod[1] - 1.6, 1.0); }, act: (m) => { m.tilt = 3; m.fill = 0; m.pourT = m.t; m.say2 = TEACH.shirayim; } },
  ...[0, 1, 2].map((j) => ({ say: j === 2 ? 'האברים על הכבש' : 'אל הכבש', at: () => [EV.ramp[0] + 0.2 + j * 0.5, EV.ramp[1], 1.2], wait: 0.3,
    enter: (m) => { m.tilt = 0; moveTo(m.f['c' + j], EV.ramp[0] - 0.6 + j * 0.5, EV.ramp[1] - 0.8, 1.0); },
    act: (m) => { m.laid[j] = 1; moveTo(m.f['c' + j], 1.8 + j * 0.4, 1.6 + j * 0.6, 1.1); } })),
  { say: 'ועוד שנים — שני גזירי עצים', at: () => [EV.altar[0], EV.altar[1], 1.8], sfx: 'chime', wait: 0.6, sayT: 2.4,
    enter: (m) => { moveTo(m.f.w0, EV.altar[0] - 1.5, EV.altar[1] - 0.5, 1.1); moveTo(m.f.w1, EV.altar[0] - 1.5, EV.altar[1] + 0.6, 1.1); }, act: (m) => { m.logs = 1; } },
];
export const EV_I = { grave: 1, receive: 2, ne: 3, sw: 4, shirayim: 5, parts: 6, logs: 9 };
export function erevModel(o = {}) {
  return chainModel('erev', o, ESTEPS, {
    coach: "הקישו על 'עבודה' — שמונה ומחצה: התמיד של בין הערביים; הדם — קבלה, שתי מתנות, ושיריים ליסוד",
    init(m) {
      Object.assign(m, { screenT: -1, tilt: 0, laid: [0, 0, 0], logs: 0, fill: 0, given: [0, 0], glowAt: -9, glowT: 0, pourT: -9, say2: '', grave: 0 });
      m.f.lamb = fig(1.5, -4.3, Math.PI / 2); m.f.z = fig(2.0, -1.2, 0);
      for (let j = 0; j < 3; j++) m.f['c' + j] = fig(1.7 + j * 0.4, -1.6 + j * 0.5, 0);
      m.f.w0 = fig(1.4, 0.5, 0); m.f.w1 = fig(1.4, 1.2, 0);
    },
  });
}
function erevDraw(k, M, T) {
  if (!M) return;
  // the afternoon sun low in the west (a soft disc) — the hour, not a timer
  k.s(6.4, -4.2, 3.1, 0.45, 0.45, 0.45, '!#FFD08A');
  // the ring and its low pillar; the lamb led to it
  k.c(EV.ring[0] + 0.4, EV.ring[1], 0.4, 0.12, 0.8, C.stone2); k.ring(EV.ring[0], EV.ring[1], 0.03, 0.42, '#8C8A84', 14);
  const L = M.f.lamb, shown = M.screenT < 0 || M.t - M.screenT < 0.3;
  if (shown) lamb(k, L.a, L.s, 0, { yaw: L.yaw, step: L.t < 1 ? T * 8 : 0, head: 0.5 });
  // the screen: a cloth on two poles before the ring — the act is behind it; only the sound and the words
  const sh = M.since(1), bow = graveOn(M) ? 0.55 : 0;
  for (const d of [-0.9, 0.9]) k.c(EV.screen[0] - 0.4, EV.screen[1] + d, 1.2, 0.04, 2.4, C.wood);
  k.b(EV.screen[0] - 0.4, EV.screen[1], 1.25, 1.8, 0.05, 2.0, '#E3D9C2');
  man(k, EV.ring[0] + 0.7, EV.ring[1] + 0.5, 0, { robe: ROBE.kohen, yaw: Math.PI * 0.8, arms: sh >= 0 && sh < 0.4 ? 0.6 : 0.2, lean: bow, skin: SKIN[2] });
  // the altar (a block with its four horns) — the red line round it, the Γ at NE and SW below it, the rest on the yesod
  altarCorner(k, EV.altar[0], EV.altar[1], { w: 2.4, d: 1.8, T, fire: true, heat: M.logs ? 0.8 : 0.3 });
  for (const [da, ds] of [[0.75, 1.05], [-0.75, -1.05], [0.75, -1.05], [-0.75, 1.05]]) k.b(EV.altar[0] + da, EV.altar[1] + ds, 1.55, 0.25, 0.25, 0.3, C.stone2);
  erevBlood(k, M, T);
  const Z = M.f.z, za = Z.a + 0.45 * Math.cos(Z.yaw), zs = Z.s + 0.45 * Math.sin(Z.yaw);
  const holding = M.i >= EV_I.receive && M.i <= EV_I.shirayim && !graveOn(M);
  if (holding) { k.c(za, zs, 1.05, 0.11, 0.3, C.silver, { pitch: M.tilt && M.busy > 0 ? 0.8 : 0 }); if (M.fill > 0) liquid(k, za, zs, 0.92 + 0.3 * M.fill, 0.11, M.tilt && M.busy > 0 ? 0.8 : 0); }
  man(k, Z.a, Z.s + walkPh(Z, T), 0, { robe: ROBE.kohen, yaw: Z.yaw, arms: holding ? 0.55 : 0.15 });
  // the ramp (its lower half, west side) and the parts laid on it
  k.b(EV.ramp[0] + 1.0, EV.ramp[1], 0.35, 1.4, 3.2, 0.7, C.stone, { pitch: -0.18 });
  for (let j = 0; j < 3; j++) {
    const c = M.f['c' + j], carrying = M.i === EV_I.parts + j && !M.laid[j];
    if (M.laid[j]) partShape(k, EV.ramp[0] + 0.2 + j * 0.5, EV.ramp[1], 0.62 + j * 0.09);
    man(k, c.a, c.s + walkPh(c, T), 0, { robe: ROBE.kohen, yaw: c.yaw, arms: carrying ? 0.55 : 0.1, skin: SKIN[j % 3] });
    if (carrying) partShape(k, c.a + 0.4 * Math.cos(c.yaw), c.s + 0.4 * Math.sin(c.yaw), 1.05, 0.9);
  }
  // the two with the two logs
  for (const w of ['w0', 'w1']) { const f = M.f[w]; man(k, f.a, f.s + walkPh(f, T), 0, { robe: ROBE.kohen, yaw: f.yaw, arms: M.logs ? 0.2 : 0.5 }); if (!M.logs) k.c(f.a + 0.35 * Math.cos(f.yaw), f.s + 0.35 * Math.sin(f.yaw), 1.05, 0.09, 0.9, C.wood, { pitch: Math.PI / 2, yaw: -f.yaw + Math.PI / 2 }); }
  if (M.logs) for (const d of [-0.3, 0.3]) k.c(EV.altar[0] + 0.2, EV.altar[1] + d, 1.55, 0.09, 1.0, C.wood, { pitch: Math.PI / 2 });
  if (!graveOn(M)) { const st = ESTEPS[Math.min(M.i, ESTEPS.length - 1)].at(M); cue(k, M, T, st[0], st[1], 0.7); }
  says(k, M, 3.2, 0, 3.6);
}
/** the model altar's blood: the line (y 0.85), the Γ at NE / SW below it (blooming 0.35 s), the glow of the four faces, the thread on the yesod */
function erevBlood(k, M, T) {
  const A = EV.altar, w = 2.4 / 2, d = 1.8 / 2, y = 0.85;
  k.b(A[0] - w - 0.01, A[1], y, 2 * d, 0.03, 0.06, BLOOD.line); tagBlood(k, 'line'); k.b(A[0] + w + 0.01, A[1], y, 2 * d, 0.03, 0.06, BLOOD.line); tagBlood(k, 'line');
  k.b(A[0], A[1] - d - 0.01, y, 0.03, 2 * w, 0.06, BLOOD.line); tagBlood(k, 'line'); k.b(A[0], A[1] + d + 0.01, y, 0.03, 2 * w, 0.06, BLOOD.line); tagBlood(k, 'line');
  const tA = [M.since(EV_I.ne), M.since(EV_I.sw)];
  for (const [j, sa, ss] of [[0, 1, 1], [1, -1, -1]]) {
    if (!M.given[j] || tA[j] < 0) continue; const b = ease(clamp(tA[j] / 0.35)), ca = A[0] + sa * w, cs = A[1] + ss * d, hh = 0.42 * b, yy = y - 0.06 - 0.21;
    k.b(ca + sa * 0.012, cs - ss * 0.2, yy, 0.32 * b, 0.02, hh, BLOOD.mark); tagBlood(k, 'horn');
    k.b(ca - sa * 0.2, cs + ss * 0.012, yy, 0.02, 0.32 * b, hh, BLOOD.mark); tagBlood(k, 'horn');
    const g = M.t - M.glowAt; if (M.given[1] && g >= 0 && g < 1.6) { k.b(ca - sa * 0.2, cs + ss * 0.03, yy + 0.26, 0.03, 0.42, 0.03, '!#FFE6A0'); k.b(ca + sa * 0.03, cs - ss * 0.2, yy + 0.26, 0.42, 0.03, 0.03, '!#FFE6A0'); }
  }
  // the yesod's one amah on the south (here: the side toward the low s) and the thread on it into the two holes at its corner
  k.b(A[0] - 0.3, A[1] - d - 0.2, 0.12, 0.4, 2 * w - 0.6, 0.24, C.stone2);
  const pt = M.t - M.pourT;
  if (M.pourT > 0 && pt < 3.2) { const L = 1.4 * clamp(pt / 1.1) * (1 - clamp((pt - 2.2) / 1.0)); if (L > 0.02) { k.b(A[0] - w + 0.2 + L / 2, A[1] - d - 0.2, 0.245, 0.04, L, 0.01, BLOOD.wet); tagBlood(k, 'yesod'); } }
  for (const da of [-0.1, 0.1]) k.c(A[0] - w + 0.12, A[1] - d - 0.2 + da, 0.245, 0.035, 0.012, '#2A2622');
  void T;
}
export const erev = makeWork({
  id: 'erev', he: 'התמיד של בין הערביים', place: 'ringsE',
  fact: { he: 'תמיד נשחט בשמונה ומחצה וקרב בתשע ומחצה; של בין הערביים נשחט על קרן מזרחית צפונית, על טבעת שניה. קבל המקבל בכלי שרת, ונתן בקרן מזרחית צפונית ובמערבית דרומית, למטה מחוט הסיקרא, ושירים שפך על יסוד דרומית. בין הערביים — באחד עשר: תשעה כבבוקר, ועוד שנים בידם שני גזירי עצים. השחיטה — מאחורי המסך', ref: 'פסחים ה, א; תמיד ד, א; יומא ב, ה; זבחים ה, ד; מידות ג, א–ב' },
  stage: { ahead: -0.5, lat: 0, K: 1.5 }, bounds: [1.2, 6.0, -4.6, 4.6, 3.2],
  model: erevModel, draw: erevDraw,
  target: (M) => ESTEPS[Math.min(M.i, ESTEPS.length - 1)].at(M),
});
// ── /tamidb23 ──

/* ───────────────────────── 4. קטורת של בין הערביים והדלקת הנרות מן הנר המערבי (שמות ל, ח; תמיד ו, א) ───────────────────────── */
// ── tamidb23 ── neirot ──
const ND = { a: 3.6, s: 0 }, GA_S = -1.1, MEN_S = 1.0, WEST = 3;   // (the western lamp: drawn as the middle one — ⚑ מחלוקת, see the bus)
const LIGHT_ORDER = [2, 4, 1, 5, 0, 6];
const NSTEPS = [
  { say: 'צבר את הגחלים', at: () => [ND.a + 1.5, ND.s + GA_S, 1.3], wait: 0.4, enter: (m) => moveTo(m.f.k, ND.a + 1.0, ND.s + GA_S - 0.3, 1.2), act: (m) => { m.coals = 1; } },
  { say: 'הקטר!', at: () => [ND.a + 1.5, ND.s + GA_S, 1.5], wait: 0.6, act: (m) => { m.back = 0.01; m.smoke = 0.01; } },
  { say: 'השתחוה', at: () => [ND.a + 1.0, ND.s + GA_S, 1.3], wait: 0.7, act: (m) => { m.bowT = m.t; } },
  ...LIGHT_ORDER.map((li, j) => ({ say: j === 0 ? 'מן הנר המערבי' : j === 5 ? 'שבעה נרות דולקים' : '', at: () => [ND.a + 1.7, ND.s + MEN_S + (li - 3) * 0.26, 1.9], sfx: j === 5 ? 'chime' : 'good', wait: 0.25,
    enter: j === 0 ? (m) => moveTo(m.f.k, ND.a + 1.2, ND.s + MEN_S - 0.2, 1.2) : null,
    act: (m) => { m.lightT[li] = m.t; } })),
];
export function neirotModel(o = {}) {
  return chainModel('neirot', o, NSTEPS, {
    coach: "הקישו על 'עבודה' — הקטורת, ואחר כך נר מנר מן הנר המערבי",
    init(m) { Object.assign(m, { coals: 0, back: 0, smoke: 0, bowT: -1, lightT: [-1, -1, -1, 0, -1, -1, -1] }); m.f.k = fig(ND.a - 0.6, ND.s - 1.6, 0); },
    step(m, dt) { if (m.smoke > 0) m.smoke = Math.min(1, m.smoke + dt / 1.6); if (m.back > 0) m.back = Math.min(1, m.back + dt); },
  });
}
function neirotDraw(k, M, T) {
  if (!M) return;
  for (let j = 0; j < 3; j++) k.b(ND.a - 1.2 + j * 0.3, ND.s, 0.06 + j * 0.06, 5.0, 0.3, 0.12 + j * 0.12, C.step);
  // the lamps: the western burns from the morning; each tap carries the flame to the next (a little flame travels from the lit one)
  const lit = [0, 0, 0, 1, 0, 0, 0];
  for (let i = 0; i < 7; i++) if (i !== WEST && M.lightT[i] >= 0) lit[i] = clamp((M.t - M.lightT[i]) / 0.35);
  heichalDoor(k, ND.a, ND.s, { w: 3.6, h: 3.2, ga: { s: GA_S, coals: M.coals }, menorah: { s: MEN_S, lit }, T });
  k.label('הנר המערבי', ND.a + 1.7, ND.s + MEN_S, 2.55, 0.24);
  for (let i = 0; i < 7; i++) if (i !== WEST && M.lightT[i] >= 0 && M.t - M.lightT[i] < 0.35) { const u = (M.t - M.lightT[i]) / 0.35, from = (i < WEST ? i + 1 : i - 1); k.s(ND.a + 1.7, ND.s + MEN_S + lerp(from - 3, i - 3, u) * 0.26, 1.68 + Math.sin(u * Math.PI) * 0.15, 0.05, 0.07, 0.05, '!#FFD76A'); }
  cloud(k, ND.a + 1.5, ND.s + GA_S, 1.25, M.smoke, T);
  // ── figures24 ── the close-ups: the cloud at the golden altar, then the menorah as the lamps are lit one from another
  if (M.i >= 3) closeAt(k, ND.a + 1.7, ND.s + MEN_S, 1.85, { dist: 5, el: 0.38, from: Math.PI, hold: 0.5, key: 'neirot' });
  else if (M.smoke > 0) closeAt(k, ND.a + 1.3, ND.s + GA_S, 1.6, { dist: 6, el: 0.42, from: Math.PI, hold: 0.5, key: 'neirot-cloud' });
  // ── /figures24 ──
  const f = M.f.k, bow = M.bowT >= 0 ? clamp((M.t - M.bowT) * 2) * (1 - clamp((M.t - M.bowT - 0.9) * 2)) : 0;
  man(k, f.a, f.s + walkPh(f, T), 0, { robe: ROBE.kohen, yaw: f.yaw, arms: M.i >= 3 ? 0.7 : 0.4, lean: bow * 0.9 });
  people(k, 1.2, -3.0, 3.0, 4, { back: M.back });
  man(k, ND.a - 1.0, ND.s - 2.4, 0, { robe: ROBE.amarkal, yaw: 0.5, arms: M.i === 1 ? 0.7 : 0.2, cap: '#6B5E48' });   // the ממונה at the door
  cue(k, M, T, ND.a - 0.7, ND.s, 0.9);
  says(k, M, 3.0, 0, 3.8);
}
export const neirot = makeWork({
  id: 'neirot', he: 'קטורת ונרות של בין הערביים', place: 'ketoret',
  fact: { he: 'ובהעלות אהרן את הנרות בין הערביים יקטירנה — קטורת בין הערביים, והנרות נדלקים מן הנר המערבי שנשאר דולק מן הבוקר. האמרכל עומד בפתח; הכהן בפנים. מקום הנר המערבי במנורה — מחלוקת, ובמשחק הוא האמצעי: המחשה', ref: 'שמות ל, ח; תמיד ו, א; יומא לג, א', illus: true },
  stage: { ahead: -0.5, lat: 0, K: 1.5 }, bounds: [1.0, 6.0, -4.0, 4.0, 3.6],
  model: neirotModel, draw: neirotDraw,
  target: (M) => NSTEPS[Math.min(M.i, NSTEPS.length - 1)].at(M),
});
// ── /tamidb23 ──

/* the stores: the ketoret takes from the stock at its end (never a block: the Temple has its reserve) */
// ── tamidb23 ──
for (const [w, take] of [[ketoret, { ketoret: 1 }], [neirot, { ketoret: 1, oil: 1 }]]) {
  const m0 = w.model; w.model = (o) => { const M = m0(o); M.onEnd = () => { const s = getCtx().stock; if (s && s.take) for (const k in take) { try { s.take(k, take[k]); } catch (e) { /* */ } } }; return M; };
}
export const TAMID_B = { ketoret, birkat, erev, neirot };
// ── /tamidb23 ──
