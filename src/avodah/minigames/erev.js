/* ─────────────────────────────────────────────────────────────────────────────
 * erev.js: the afternoon Tamid's hour (Pesachim 5:1; tamid.json tamid_erev).
 * "תמיד נשחט בשמנה ומחצה וקרב בתשע ומחצה" (Pesachim 5:1) — in seasonal hours (the day from sunrise to sunset in twelve).
 * The sun runs across the sky; tap when it reaches 8½ hours. Live: the real Jerusalem clock times of today.
 * ──────────────────────────────────────────────────────────────────────────── */
import { svgEl, press } from './common.js';
import { halachicHour } from '../../calendar.js';
import { clockHe } from '../schedule.js';
import { gapLine } from '../data.js';

export const erev = {
  id: 'erev', title: 'התמיד של בין הערביים', kicker: 'אחר הצהריים',
  intro: 'התמיד השני נשחט בשמונה שעות ומחצה וקרב בתשע ומחצה — בשעות זמניות. עקוב אחרי השמש.',
  introAgain: 'שמונה ומחצה — שוחטים. עקוב אחרי השמש.',
  stage(W) { W.time('dusk'); W.look('slaughter', 1500); },
  play(api) {
    const { ctx } = api;
    const now = ctx.now ? ctx.now() : Date.now();
    let t85 = null, t95 = null;
    try { t85 = halachicHour(new Date(now), 8.5); t95 = halachicHour(new Date(now), 9.5); } catch (e) { /* no clock */ }
    const svg = api.svg('0 0 360 220', 'השמש בשמים, משעה 0 עד 12');
    svgEl('rect', { x: 0, y: 0, width: 360, height: 220, class: 'av-sky' }, svg);
    svgEl('path', { d: 'M20 190 Q180 -40 340 190', class: 'av-arc' }, svg);
    svgEl('rect', { x: 0, y: 190, width: 360, height: 30, class: 'av-hill' }, svg);
    // hour ticks along the arc (0 at the east = right, 12 at the west = left)
    const P = (h) => { const u = h / 12, x = 340 - 320 * u, y = (1 - u) * (1 - u) * 190 + 2 * (1 - u) * u * -40 + u * u * 190; return [x, y]; };
    for (let h = 0; h <= 12; h++) { const [x, y] = P(h); svgEl('circle', { cx: x, cy: y, r: h === 8.5 ? 4 : 2, class: 'av-tick' }, svg); if (h % 3 === 0) svgEl('text', { x, y: y + 16, class: 'av-lab small', 'text-anchor': 'middle' }, svg).textContent = String(h); }
    const [mx, my] = P(8.5);
    svgEl('circle', { cx: mx, cy: my, r: 9, class: 'av-mark' }, svg);
    svgEl('text', { x: mx, y: my - 14, class: 'av-lab', 'text-anchor': 'middle' }, svg).textContent = '8½';
    const sun = svgEl('circle', { r: 11, class: 'av-sun' }, svg);
    const clock = svgEl('text', { x: 350, y: 18, class: 'av-lab', 'text-anchor': 'end' }, svg);
    let h = 6.5, done = false;
    api.loop((dt) => {
      if (done) return;
      h = Math.min(12, h + dt * 0.55);
      const [x, y] = P(h); sun.setAttribute('cx', x); sun.setAttribute('cy', y);
      clock.textContent = `שעה ${h.toFixed(1)}`;
      if (h >= 11.5 && !done) { done = true; api.done({ text: 'השעה עברה — בפעם הבאה, שחטו בשמונה שעות ומחצה.' }); }
    });
    const btn = api.button('שחטו!', () => {
      if (done) return;
      if (h < 8.3) { api.miss('עוד לא — "תמיד נשחט בשמנה ומחצה".'); return; }
      done = true;
      api.sfx && api.sfx.play('chime', { n: 6 });
      const tail = t85 ? ` היום בירושלים: שחיטה ב-${clockHe(t85)}, הקרבה ב-${clockHe(t95)}.` : '';
      api.done({ text: `שמונה ומחצה — נשחט; תשע ומחצה — קרב. בין הערביים מעלים אחד עשר כהנים: תשעה כבבוקר, ועוד שניים עם שני גזירי עצים.${tail}`, linger: 1600 });
    }, 'gold');
    api.hint('הקש "שחטו!" כשהשמש מגיעה לשמונה שעות ומחצה.');
    api.cite(gapLine('erev_eleven'));   // "בין הערבים, באחד עשר…" (Yoma 2:5)
    api.solver(async () => { while (h < 8.5) await api.wait(30); press(btn); });
  },
};
