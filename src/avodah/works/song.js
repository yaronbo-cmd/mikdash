// ── tamidb23 ──
/* song.js — the parts burnt, the wine, the trumpets and the Levites' song (תמיד ז, ג–ד; ערכין ב, ג–ו), on WORKSA22's kit:
 *   1–3  the parts up the ramp and onto the fire (the carrier climbs; a tap casts it: the flames flare) — TAMIDA23's g-evarim carries
 *        them TO the ramp; this is the הקטרה on the altar.
 *   4    the trumpets: תקיעה · תרועה · תקיעה (the two kohanim on the שלחן החלבים).
 *   5    the wine: hold = pour into the bowl on the altar's corner (a tap pours a portion — taps alone finish it); at full the סגן waves
 *        the cloth and בן ארזא strikes the צלצל.
 *   6–14 the song: 3 פרקים × 3 taps on the music's beat (a ring closes on the דוכן to the gold band at the beat); at each פרק's end
 *        a blast and the people bow (the stamp "השתחוו").
 * The day's psalm by the real weekday (shir_shel_yom.json): its reference is shown; its first words only when they carry no Name
 * (⚑ default — of the seven days only the Sabbath's opening line is quoted). ── /tamidb23 ── */
import { makeWork, clamp, getCtx } from './craft.js';
import { man, flame, ROBE, SKIN } from './figures.js';
import { closeAt } from './closeup.js';   // ── figures24 ── (the close-up at the key act) ── /figures24 ──
import { C, chainModel, fig, moveTo, walkPh, cue, says, partShape, people, lerp } from './tamid.js';
import SHIR from '../../../content/shir_shel_yom.json' with { type: 'json' };

// ── tamidb23 ── the day's psalm, without a Name ──
const NAME = new RegExp(['\u05D4\u05F3', '\u05D4\u0027', '\u05D0\u05DC\u05E7', '\u05D0\u002D\u05DC', '\u05D0\u05DC\u05D4', '\u05D9\u05D4\u05D5'].join('|'));
export const hasName = (s) => NAME.test(String(s || ''));
export function psalmOf(weekday = new Date().getDay()) {
  const d = (SHIR || []).find((x) => x.js_weekday === weekday) || (SHIR || [])[0] || {};
  const words = d.first_words_he && !hasName(d.first_words_he) ? d.first_words_he : '';
  return { day: d.day_he || '', ref: d.psalm_ref || '', words, src: d.source || 'תמיד ז, ד' };
}
// ── /tamidb23 ──

const SG = { ramp: [1.8, -3.6], top: [4.0, -3.6], fire: [4.5, -2.6], bowl: [4.1, -1.3], tr: [3.0, 0.3], duchan: [4.2, 2.9] };
const PEREK = ['פרק ראשון', 'פרק שני', 'פרק שלישי'];
function songSteps(evening) {
  return [
    ...[0, 1, 2].map((j) => ({ say: j === 2 ? 'האברים על האש' : '', at: () => [SG.fire[0], SG.fire[1], 2.0], wait: 0.25,
      ready: (m) => m.f.c.t >= 1,
      enter: (m) => { m.carry = j; moveTo(m.f.c, SG.top[0] - 0.4, SG.top[1] + 0.1, 1.0); },
      act: (m) => { m.burnt[j] = 1; m.flare = 1; m.carry = -1; moveTo(m.f.c, SG.ramp[0] - 0.2, SG.ramp[1] + 0.6, 0.8); } })),
    { say: 'תקיעה · תרועה · תקיעה', at: () => [SG.tr[0], SG.tr[1], 2.2], sfx: 'chime', wait: 0.9, sayT: 2.0, act: (m) => { m.blast = m.t; } },
    { say: 'הסגן מניף בסודר — בן ארזא בצלצל', hold: true, at: () => [SG.bowl[0], SG.bowl[1], 1.8], sfx: 'chime', wait: 0.9, sayT: 2.2,
      tapPart: (m) => { if (m.wine >= 1) return true; m.wine = Math.min(1, m.wine + 0.5); m.fx.push({ sfx: 'soft', haptic: 6 }); return m.wine >= 1; },
      act: (m) => { m.wave = m.t; } },
    ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ say: n % 3 === 2 ? `${PEREK[n / 3 | 0]} — תקעו, והשתחוו העם` : '', at: () => [SG.duchan[0], SG.duchan[1], 2.4], sfx: n % 3 === 2 ? 'chime' : 'good', wait: n % 3 === 2 ? 0.9 : 0.15, sayT: 1.6,
      act: (m) => { m.sung = n + 1; if (n % 3 === 2) { m.bowT = m.t; m.blast = m.t; } } })),
  ].map((s) => Object.assign(s, { evening }));
}
export function songModel(o = {}, evening = false) {
  const steps = songSteps(evening);
  const M = chainModel(evening ? 'shir2' : 'shir', o, steps, {
    holds: true, coach: "הקישו על 'עבודה' — האברים, החצוצרות, היין (החזיקו — לנסך), והשיר על הקצב",
    init(m) { Object.assign(m, { burnt: [0, 0, 0], carry: -1, flare: 0, blast: -1, wine: 0, wave: -1, sung: 0, bowT: -1, ps: psalmOf(o.weekday), downAt: -1 }); m.f.c = fig(SG.ramp[0] - 0.2, SG.ramp[1] + 0.6, 0); },
    press(m, down) { const was = m.downAt; m.downAt = down ? m.t : -1; if (!down && was >= 0 && m.t - was >= 0.25 && m.i !== 4) m.twinTap(); },   // (a hold elsewhere is a tap: the hold's release tap is swallowed by hands.js)
    step(m, dt) {
      if (m.flare > 0) m.flare = Math.max(0, m.flare - dt * 1.2);
      // the hold pours (≈ 1.4 s for the bowl) — the act lands when it is full, the tap that ends the hold is not a second act
      if (m.phase === 'work' && m.i === 4 && m.pressed && m.busy <= 0 && m.walking === 0 && m.wine < 1) { m.wine = Math.min(1, m.wine + dt / 1.4); if (m.wine >= 1) m.twinTap(); }
    },
  });
  return M;
}
/** the beat ring: from the music's beat grid (music.beat()), else a steady 0.9 s pulse — 0 at the gold band, 1 a beat away */
function beatU() {
  try { const B = globalThis.__CRAFT_BEAT ? globalThis.__CRAFT_BEAT() : (globalThis.__BH_MUSIC && globalThis.__BH_MUSIC.beat && globalThis.__BH_MUSIC.beat()); if (B && B.period > 0) { const to = (((+B.toNext - 0.09) % B.period) + B.period) % B.period; return to / B.period; } } catch (e) { /* */ }
  return ((performance.now() / 1000) % 0.9) / 0.9;
}
function songDraw(k, M, T) {
  if (!M) return;
  const F = M.f;
  // the altar's south-west: the ramp rising to the top and the fire
  k.b(SG.ramp[0] + 1.1, SG.ramp[1], 0.6, 1.4, 3.0, 1.2, C.stone, { pitch: -0.36 });
  k.b(SG.fire[0], SG.fire[1] + 0.2, 0.8, 2.4, 1.6, 1.6, C.stone); k.b(SG.fire[0], SG.fire[1] + 0.2, 1.65, 2.5, 1.7, 0.1, C.stone2);
  const n = M.burnt.reduce((a, b) => a + b, 0);
  for (let j = 0; j < n; j++) partShape(k, SG.fire[0] + 0.25 - j * 0.2, SG.fire[1] + (j - 1) * 0.3, 1.8, 0.8);
  flame(k, SG.fire[0] + 0.3, SG.fire[1], 1.7, 0.9 + n * 0.12 + M.flare * 0.8, T); flame(k, SG.fire[0] - 0.2, SG.fire[1] + 0.4, 1.7, 0.6 + M.flare * 0.5, T + 2);
  k.torch(SG.fire[0], SG.fire[1], 2.4, 0.4 + M.flare * 0.4);
  // the carrier: up the ramp with a pale part (abstract), down again
  const c = F.c, cy = clamp((c.a - SG.ramp[0]) / (SG.top[0] - SG.ramp[0])) * 1.1;
  man(k, c.a, c.s + walkPh(c, T), cy, { robe: ROBE.kohen, yaw: c.yaw, arms: M.carry >= 0 ? 0.6 : 0.15 });
  if (M.carry >= 0) partShape(k, c.a + 0.4 * Math.cos(c.yaw), c.s + 0.4 * Math.sin(c.yaw), cy + 1.05, 0.9);
  // the bowl on the corner (silver), the wine rising in it (a deep amber — never red), the kohen bending to pour
  k.c(SG.bowl[0], SG.bowl[1], 1.75, 0.2, 0.18, C.silver);
  if (M.wine > 0) k.c(SG.bowl[0], SG.bowl[1], 1.66 + 0.08 * M.wine, 0.17, 0.02 + 0.12 * M.wine, '#7A5A2E');
  const pour = M.i === 4 && (M.pressed || M.wine > 0) && M.wine < 1;
  man(k, SG.bowl[0] - 0.7, SG.bowl[1] - 0.2, 0.9, { robe: ROBE.kohen, yaw: 0.3, arms: M.i >= 4 ? 0.6 : 0.2, lean: pour ? 0.9 : 0 });
  if (pour) k.c(SG.bowl[0] - 0.25, SG.bowl[1] - 0.1, 2.0, 0.05, 0.3, '#7A5A2E', { roll: 0.6 });
  // the סגן on the horn with the cloth; בן ארזא and the צלצל
  const wv = M.wave >= 0 ? M.t - M.wave : -1, flag = wv >= 0 && wv < 1.4 ? Math.sin(wv * 14) * 0.5 : 0;
  man(k, SG.bowl[0] + 0.4, SG.bowl[1] + 0.9, 0.9, { robe: ROBE.kohen, yaw: Math.PI * 0.75, arms: wv >= 0 && wv < 1.4 ? 1.1 : 0.2, skin: SKIN[2] });
  if (wv >= 0 && wv < 1.4) k.b(SG.bowl[0] + 0.1, SG.bowl[1] + 0.9 + flag * 0.3, 2.9, 0.5, 0.05, 0.35, C.cloth, { roll: flag });
  const ba = SG.duchan[0] - 1.3, bs = SG.duchan[1] - 1.2, clash = wv >= 0 && wv < 0.3 ? 0.08 : 0.28;
  man(k, ba, bs, 0, { robe: ROBE.levi, yaw: Math.PI * 0.85, arms: 0.7, skin: SKIN[0] });
  for (const sg of [-1, 1]) k.c(ba - 0.35, bs + sg * clash, 1.15, 0.16, 0.03, C.gold, { roll: Math.PI / 2 });
  // the two trumpeters on the שלחן החלבים (silver trumpets raised at a blast)
  const bl = M.blast >= 0 ? M.t - M.blast : -1, up = bl >= 0 && bl < 1.2;
  k.b(SG.tr[0], SG.tr[1], 0.4, 1.8, 0.8, 0.8, '#E4DED0');
  for (const d of [-0.45, 0.45]) { man(k, SG.tr[0], SG.tr[1] + d, 0.8, { robe: ROBE.kohen, yaw: Math.PI, arms: up ? 0.95 : 0.3, scale: 0.9 }); k.c(SG.tr[0] - 0.45, SG.tr[1] + d, up ? 2.0 : 1.4, 0.04, 0.7, C.silver, { pitch: up ? 1.1 : 0.2 }); if (up) k.c(SG.tr[0] - 0.75, SG.tr[1] + d, 2.15, 0.1, 0.08, C.silver, { pitch: 1.1 }); }
  // the דוכן: the Levites in two rows with their lyres; they sway with the song
  k.b(SG.duchan[0] + 0.3, SG.duchan[1], 0.25, 3.2, 1.6, 0.5, C.step);
  for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) {
    const s = SG.duchan[1] - 1.4 + i * 0.56, a = SG.duchan[0] + r * 0.7, sw = M.sung ? Math.sin(T * 3 + i + r) * 0.25 : 0;
    man(k, a, s, 0.5, { robe: ROBE.levi, yaw: Math.PI, arms: 0.45 + sw * 0.2, scale: 0.82, skin: SKIN[(i + r) % 3] });
    if (r === 0) k.b(a - 0.32, s + 0.12, 1.15, 0.05, 0.22, 0.38, C.bronze, { roll: 0.3 });
  }
  // the beat ring on the דוכן during the song: closes to the gold band at the beat (the impact lands on it)
  if (M.i >= 5 && M.phase === 'work') { const u = beatU(); k.ring(SG.duchan[0] - 0.9, SG.duchan[1], 0.05, 0.75, '!#FFD24A', 18); k.ring(SG.duchan[0] - 0.9, SG.duchan[1], 0.06, 0.75 + u * 1.3, '!#FFF3C4', 20); }
  // the פרקים: three gold marks over the דוכן fill one per tap
  for (let j = 0; j < 9; j++) { const on = j < M.sung; k.s(SG.duchan[0] + 1.3, SG.duchan[1] - 1.3 + j * 0.32 + (j / 3 | 0) * 0.16, 2.6, on ? 0.09 : 0.05, on ? 0.09 : 0.05, on ? 0.09 : 0.05, on ? '!#FFD24A' : '#A89A7C'); }
  // the people bow at each פרק's end
  const bw = M.bowT >= 0 ? clamp((M.t - M.bowT) * 2) * (1 - clamp((M.t - M.bowT - 1.0) * 1.5)) : 0;
  people(k, 1.0, -1.4, 2.4, 5, { bow: bw * 0.6 });
  if (bw > 0 || (M.bowT >= 0 && M.t - M.bowT < 0.3)) closeAt(k, 1.1, 0.5, 0.95, { dist: 5.5, el: 0.3, from: -Math.PI / 2, hold: 0.6, key: 'song-bow' });   // ── figures24 ── the people's bow at a פרק's end ── /figures24 ──
  // the psalm's line (the reference; the first words only when they carry no Name)
  if (M.i >= 5) k.label(`${M.ps.day}: ${M.ps.words ? M.ps.words + ' — ' : ''}${M.ps.ref}`, SG.duchan[0] + 1.6, SG.duchan[1] - 0.2, 3.3, 0.26);
  // the next thing to touch
  const st = M.i;
  if (st < 3) cue(k, M, T, SG.top[0], SG.top[1], 0.7); else if (st === 3) cue(k, M, T, SG.tr[0], SG.tr[1], 0.9); else if (st === 4) cue(k, M, T, SG.bowl[0], SG.bowl[1], 0.6);
  says(k, M, 3.0, -0.4, 3.7);
}
const FACT = (ev) => {
  const ps = psalmOf();
  return { he: `${ev ? 'בין הערביים כסדר הבוקר: ' : ''}נתנו לו יין לנסך; הסגן עומד על הקרן והסודרים בידו, ושני כהנים בחצוצרות של כסף — תקעו והריעו ותקעו; שחה לנסך, הניף הסגן בסודרין, הקיש בן ארזא בצלצל, ודברו הלוים בשיר. הגיעו לפרק — תקעו והשתחוו העם. השיר של היום, ${ps.day}: ${ps.ref}${ps.words ? ' — "' + ps.words + '"' : ''}`,
    ref: `תמיד ז, ג–ד; ערכין ב, ג–ו${ev ? '; רמב״ם תמידין ומוספין ו, יא' : ''}` };
};
function makeSong(id, ev) {
  const W = makeWork({
    id, he: ev ? 'נסכים ושיר של בין הערביים' : 'נסכים ושיר של יום', place: 'duchan', fact: FACT(ev),
    stage: { ahead: -0.5, lat: 0, K: 1.45 }, bounds: [1.0, 6.0, -4.6, 4.6, 3.4],
    model: (o) => { const M = songModel(o, ev); M.onEnd = () => { const s = getCtx().stock; if (s && s.take) { try { s.take('wine', 1); } catch (e) { /* */ } } }; return M; },
    draw: songDraw,
    target: (M) => { const st = M.steps[Math.min(M.i, M.steps.length - 1)]; return st.at(M); },
  });
  return W;
}
export const shir = makeSong('shir', false);
export const shir2 = makeSong('shir2', true);
void lerp;
// ── /tamidb23 ──
