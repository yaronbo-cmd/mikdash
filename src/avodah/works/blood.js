/* ── blooda25 ── blood.js — the blood as the work (docs/DAM25.md; the owner: "דם כן, פגר לא"). The ONE source of the blood's colours and of
 * the rules that keep every other red out of the world:
 *   BLOOD                     the palette (§2.1): wet (the vessel, the thread, a fresh mark) · mark (the Γ on the corner) · dry · trace · line
 *                             (the חוט הסיקרא) — and ember (the moked's coals: orange, not blood; kept here so no one draws a free one)
 *   isBloodHex(hex)           one of the palette (±3 per channel: a colour read back from the GPU's linear floats)
 *   isRedHue(hex)             hue 345°–15°, saturation > 0.45 (the dark reds too, which the old r ≥ 140 test missed)
 *   isRed(hex)                a FORBIDDEN red: red by hue and not of the palette (kit.js's isRed is this one)
 *   liquid(k, a, s, y, r, tilt)  the dark disc inside a vessel (fill 0.7), its face level whatever the vessel's tilt; tagged 'vessel'
 *   graveStart(M) · graveStep(M, dt) · graveOn(M) · GRAVE   the moment of gravity at the slaughter (§2.4): no "+N", one soft deep tone, the
 *                             noise of the court down to 20 %, 1.2 s of stillness in which a tap is swallowed, the mentor's line
 *   worldMark(corner, level)  a mark on the REAL altar (avodah3d cornerMarks) · worldShirayim(o) the thread into the two holes (water.js)
 *   markStage(min)            a mark's look by its age in GAME minutes: wet (20′) → dry (90′) → trace (to the evening); dawn clears
 *   amahTint(x)               the channel's hue by x (§2.2): 35 % of wet by the holes → 12 % at −26 → 4 % at −4 → none east of −4
 * Never a Divine Name here, in code or comment. ── /blooda25 ── */

export const BLOOD = Object.freeze({
  wet: '#4C0B0E', mark: '#5A1418', dry: '#6E4A3C', trace: '#6E4A3C', traceA: 0.13, line: '#8E2A22',
  ember: '#C8641E',   // (not blood: the coals of בית המוקד — §4.6)
});
/** the palette's own entries (the ember is not one: it is orange and never red by the hue test) */
export const BLOOD_HEX = [BLOOD.wet, BLOOD.mark, BLOOD.dry, BLOOD.line];
const num = (hex) => (typeof hex === 'number' ? hex : parseInt(String(hex).replace(/[!#]/g, ''), 16));
const rgb = (n) => [(n >> 16) & 255, (n >> 8) & 255, n & 255];
const PAL = BLOOD_HEX.map((h) => rgb(num(h)));
export function isBloodHex(hex, tol = 3) {
  const [r, g, b] = rgb(num(hex));
  for (const p of PAL) if (Math.abs(p[0] - r) <= tol && Math.abs(p[1] - g) <= tol && Math.abs(p[2] - b) <= tol) return true;
  return false;
}
/** the hue (0…360) and saturation (HSV, 0…1) of a colour */
export function hueSat(hex) {
  const [r, g, b] = rgb(num(hex)), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (!mx || !d) return { h: 0, s: 0, v: mx / 255 };
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360;
  return { h, s: d / mx, v: mx / 255 };
}
export function isRedHue(hex) {
  const { h, s, v } = hueSat(hex);
  return v > 0.08 && s > 0.45 && (h >= 345 || h <= 15);
}
export const isRed = (hex) => isRedHue(hex) && !isBloodHex(hex);

/* ───────── the vessel's liquid ───────── */
/** the dark liquid in a vessel at (a, s, y): a flat disc of radius r at 0.7 of its height, level (it does not tilt with the vessel) */
export function liquid(k, a, s, y, r, tilt = 0) {
  const rr = r * (0.86 - 0.12 * Math.min(1, Math.abs(tilt)));
  k.c(a, s, y, rr, 0.02, BLOOD.wet); tagBlood(k, 'vessel');
  k.c(a, s, y + 0.012, rr * 0.22, 0.004, '#8C6E86'); tagBlood(k, 'vessel');   // (the narrow purplish sheen; not red: hue ~315°)
}
/** the kit's last piece is blood of this place (vessel | horn | yesod | line | amah) — kit.bloodCheck() reads the tags */
export function tagBlood(k, tag) { if (k && typeof k.tagBlood === 'function') k.tagBlood(tag); }

/* ───────── the moment of gravity (§2.4) ───────── */
export const GRAVE = Object.freeze({
  dur: 1.2, duck: 0.2,
  line: 'הכהן שחט. מכאן — הדם הוא העבודה: קבלה, הולכה, זריקה.', src: 'תמיד ד, א; זבחים ה, ד · טיוטה',
});
const music = () => { try { return globalThis.__BH_MUSIC || null; } catch (e) { return null; } };
/** the slaughter happened behind the screen: no points, one soft deep tone, the court's noise down, 1.2 s of stillness */
export function graveStart(M) {
  M.grave = GRAVE.dur; M.graveN = (M.graveN | 0) + 1; M.graveAt = M.t || 0; M.pending = 0;
  M.fx.push({ sfx: 'grave', o: { duck: GRAVE.duck }, haptic: 0 });
  M.say = GRAVE.line; M.sayT = GRAVE.dur + 3.2;
  try { const m = music(); if (m && typeof m.duck === 'function') m.duck(true, GRAVE.duck); } catch (e) { /* the music's */ }
  try { const B = globalThis.__BLOOD25; if (B) { B.graves = (B.graves | 0) + 1; (B.log || (B.log = [])).push({ kind: M.kind, i: M.i, acts: M.acts ? M.acts.length : 0, pts: M.pts | 0, swallowed: 0 }); if (typeof B.onGrave === 'function') B.onGrave(M); } } catch (e) { /* tests */ }
}
const lastLog = () => { try { const L = globalThis.__BLOOD25 && globalThis.__BLOOD25.log; return L && L[L.length - 1]; } catch (e) { return null; } };
/** the moment's clock: true while it lasts (a tap now is swallowed, not queued) */
export function graveStep(M, dt) {
  if (!(M.grave > 0)) return false;
  const L = lastLog(); if (M.pending && L) L.swallowed++;
  M.grave -= dt; M.pending = 0;
  if (M.grave <= 0) { M.grave = 0; if (L) { L.actsEnd = M.acts ? M.acts.length : 0; L.iEnd = M.i; L.ptsEnd = M.pts | 0; } try { const m = music(); if (m && typeof m.duck === 'function') m.duck(false); } catch (e) { /* */ } }
  return true;
}
export const graveOn = (M) => !!M && M.grave > 0;

/* ───────── the marks: their look by the day's clock (⚑4: wet → dry → trace to the evening; reset at dawn) ───────── */
export const DRY = Object.freeze({ wet: 20, dry: 90 });
/** game minutes since the day began (18:00) — the day's clock when the day runs, else null (the harness: real seconds then) */
export function gameMin() {
  try { const D = globalThis.__DAY; const n = D && D.clock && D.clock.now(); if (n && Number.isFinite(n.t)) return (n.n | 0) * 1440 + n.t * 60; } catch (e) { /* */ }
  return null;
}
/** the dawn of the game day the minute m falls in (04:00 = 10 h after 18:00): a mark born before it is gone */
export const dawnOf = (m) => { const d = Math.floor(m / 1440) * 1440; return d + 600; };
/** the first dawn after the minute m: a mark born at m is gone then */
export const nextDawn = (m) => (m < dawnOf(m) ? dawnOf(m) : dawnOf(m) + 1440);
/** a mark's look at age `min` (game minutes): { stage, hex, k } — k the share of the colour over the plaster */
export function markStage(min) {
  if (min < DRY.wet) return { stage: 'wet', hex: BLOOD.mark, k: 0.62 };
  if (min < DRY.dry) { const u = (min - DRY.wet) / (DRY.dry - DRY.wet); return { stage: 'dry', hex: BLOOD.dry, k: 0.62 - 0.12 * u }; }
  return { stage: 'trace', hex: BLOOD.trace, k: BLOOD.traceA };
}

/* ───────── the world (the real altar, the yesod, the amah) ───────── */
function layers() {
  let av = null, water = null;
  try { const T = globalThis.__T; if (T) { av = T.avodah || null; water = T.water || null; } } catch (e) { /* */ }
  return { av, water };
}
/** the Γ (lower) / the dot on the horn (upper) / the yesod, on the real altar */
export function worldMark(corner, level = 'lower') {
  const { av } = layers();
  try { if (av && typeof av.mark === 'function') return av.mark(corner, level); } catch (e) { /* */ }
  return false;
}
/** the rest of the blood poured on the southern yesod: the thread into the two holes (water.js shirayim) */
export function worldShirayim(o = {}) {
  const { water } = layers();
  try { const B = globalThis.__BLOOD25; if (B) B.shirayim = (B.shirayim | 0) + 1; } catch (e) { /* tests */ }
  try { if (water && typeof water.pour === 'function') { water.pour('shirayim', { corner: 'S', ...o }); if (typeof water.channelTint === 'function') water.channelTint(1); return true; } } catch (e) { /* */ }
  return false;
}
/** the amah running through the day (§2.2) */
export function worldChannel(on = true) {
  const { water } = layers();
  try { if (water && typeof water.channel === 'function') { water.channel(on); return true; } } catch (e) { /* */ }
  return false;
}
/** the channel's hue by x: 35 % of wet at the holes (x −54.6) → 12 % at −26 → 4 % at −4 → 0 east of it (the outlet: clear water) */
export function amahTint(x) {
  const P = [[-54.6, 0.35], [-26, 0.12], [-4, 0.04], [0, 0]];
  if (x <= P[0][0]) return P[0][1];
  for (let i = 1; i < P.length; i++) if (x <= P[i][0]) { const u = (x - P[i - 1][0]) / (P[i][0] - P[i - 1][0]); return P[i - 1][1] + (P[i][1] - P[i - 1][1]) * u; }
  return 0;
}
/** the teaching lines of the red line and the amah (DAM25 §3) */
export const TEACH = Object.freeze({
  line: { above: 'חטאת', below: 'עולה · שלמים · אשם', he: 'חוט של סיקרא חוגרו באמצע — להבדיל בין הדמים העליונים לדמים התחתונים.', src: 'מידות ג, א · טיוטה' },
  amah: { he: 'מתערבין באמה ויוצאין לנחל קדרון, ונמכרין לגננין לזבל — ומועלין בהן.', src: 'יומא ה, ו; מידות ג, ב · המחשה · טיוטה' },
  dry: { he: 'כאן ניתן דם של שחר.', src: 'תמיד ד, א · טיוטה' },
  receive: 'שחט השוחט וקבל המקבל — בכלי שרת, בצפון.',
  zerika: 'נותן מזרחה צפונה, מערבה דרומה — שתי מתנות שהן ארבע; למטה מחוט הסיקרא.',
  shirayim: 'ושירים היה שופך על יסוד דרומית — ויורדין בשני נקבים.',
});
try { globalThis.__BLOOD25 = Object.assign(globalThis.__BLOOD25 || {}, { BLOOD, isBloodHex, isRed, isRedHue, amahTint, markStage, gameMin }); } catch (e) { /* */ }
