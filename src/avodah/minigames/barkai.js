/* ─────────────────────────────────────────────────────────────────────────────
 * barkai.js: "צאו וראו אם הגיע זמן השחיטה" (Tamid 3:2).
 * The eastern sky brightens; call "ברקאי!" when the whole east is lit "עד שהוא בחברון" (Mattiya ben Shmuel's
 * words; the Tanna Kamma: "ברקאי"). Too early → a gentle "not yet"; too late → the memuneh calls it himself.
 * Live: the sky runs through TODAY's real dawn in Jerusalem (עלות השחר → האיר פני המזרח → הנץ), with the clock.
 * The moment "the east is lit" is calendar.js's estimate (the sun 12° below the horizon).
 * ──────────────────────────────────────────────────────────────────────────── */
import { svgEl, press } from './common.js';
import { dawnOf, clockHe } from '../schedule.js';

const EAST_SHOT = { p: [-100, 122, 20], t: [800, 200, 10] };   // the horizon: the Mount of Olives' ridge and the eastern sky above it

export const barkai = {
  id: 'barkai', title: 'ברקאי!', kicker: 'על הגג, מול המזרח',
  intro: 'הממונה שולח לראות אם הגיע זמן השחיטה. צפה במזרח — וקרא "ברקאי!" כשהאיר פני כל המזרח, עד חברון.',
  introAgain: 'צפה במזרח — וקרא "ברקאי!" כשחברון מוארת.',
  // (QA P2-6: the old shot looked south-east from high up into the haze over the city) — from the roof of the house, east
  // over the courts, Nikanor and Ezrat Nashim to the Mount of Olives, where the sky brightens first
  stage(W) { W.time('dawn'); W.look(EAST_SHOT, 2200); },
  play(api) {
    const { ctx } = api;
    let dawn = null;
    try { dawn = dawnOf(ctx.now ? ctx.now() : Date.now()); } catch (e) { dawn = null; }
    const svg = api.svg('0 0 360 240', 'השמים במזרח לפני הזריחה');
    const defs = svgEl('defs', {}, svg);
    const lg = svgEl('linearGradient', { id: 'avSky', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    const s0 = svgEl('stop', { offset: '0%' }, lg), s1 = svgEl('stop', { offset: '100%' }, lg);
    svgEl('rect', { x: 0, y: 0, width: 360, height: 240, fill: 'url(#avSky)' }, svg);
    const stars = svgEl('g', {}, svg);
    for (let k = 0; k < 26; k++) svgEl('circle', { cx: (k * 137) % 360, cy: (k * 53) % 120, r: 0.9 + (k % 3) * 0.4, class: 'av-star' }, stars);
    // the hills to the east (Mount of Olives) and far to the south, Hebron
    svgEl('path', { d: 'M0 200 C60 170 110 185 160 172 C210 160 260 178 300 170 C330 165 350 175 360 172 L360 240 L0 240 Z', class: 'av-hill' }, svg);
    const hebron = svgEl('g', { transform: 'translate(62 176)' }, svg);
    svgEl('path', { d: 'M-22 8 C-10 -4 8 -6 24 8 Z', class: 'av-hill far' }, hebron);
    const hLight = svgEl('circle', { cx: 0, cy: 2, r: 12, class: 'av-hebron' }, hebron);
    svgEl('text', { x: 0, y: -10, class: 'av-lab light', 'text-anchor': 'middle' }, hebron).textContent = 'חברון';
    svgEl('rect', { x: 0, y: 212, width: 360, height: 28, class: 'av-roof' }, svg);
    const clock = svgEl('text', { x: 350, y: 20, class: 'av-lab light', 'text-anchor': 'end' }, svg);
    const DUR = 11, TARGET = 0.62;           // seconds of the sky's run; the fraction where the east is lit
    let u = 0, called = false;
    const lerp = (a, b, t) => a.map((x, i) => Math.round(x + (b[i] - x) * t));
    const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
    const T0 = dawn && dawn.alot ? +dawn.alot : null, T1 = dawn && dawn.sunrise ? +dawn.sunrise : null, TL = dawn && dawn.lit ? +dawn.lit : null;
    const target = T0 && T1 && TL ? (TL - T0) / (T1 - T0) : TARGET;
    api.loop((dt) => {
      if (called) return;
      u = Math.min(1, u + dt / DUR);
      const k = u;
      s0.setAttribute('stop-color', rgb(lerp([10, 16, 40], [120, 150, 205], k)));
      s1.setAttribute('stop-color', rgb(lerp([30, 30, 60], [250, 200, 150], Math.min(1, k * 1.3))));
      stars.setAttribute('opacity', Math.max(0, 1 - k * 1.6));
      hLight.setAttribute('opacity', k >= target ? 1 : Math.max(0, (k - target + 0.2) * 2));
      if (T0 && T1) clock.textContent = `ירושלים ${clockHe(T0 + (T1 - T0) * k)}`;
      if (u >= 1 && !called) { called = true; api.done({ text: 'הצופה קרא "ברקאי!" — הגיע זמן השחיטה. בפעם הבאה, קרא ברגע שחברון מוארת.' }); }
    });
    const btn = api.button('ברקאי!', () => {
      if (called) return;
      if (u < target - 0.03) { api.miss('עוד לא — פני המזרח עדיין לא האירו עד חברון.'); return; }
      called = true;
      api.sfx && api.sfx.play('chime', { n: 7 });
      api.sparkle(18, 72, 12);
      const tail = T0 && TL ? ` היום בירושלים: עלות השחר ${clockHe(T0)} · "האיר פני כל המזרח" ${clockHe(TL)} (אומדן) · הנץ ${clockHe(T1)}.` : '';
      api.done({ text: `"האיר פני כל המזרח" — "עד שהוא בחברון?" — "הין!"${tail}`, linger: 1400 });
    }, 'gold big');
    api.hint(T0 ? 'השמים של הבוקר האמיתי בירושלים — מהר יותר.' : 'המתן לאור.');
    api.solver(async () => { while (u < target + 0.02) await api.wait(40); press(btn); });
  },
};
