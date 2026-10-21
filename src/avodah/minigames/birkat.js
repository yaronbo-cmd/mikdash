/* ─────────────────────────────────────────────────────────────────────────────
 * birkat.js: ברכת כהנים on the steps of the Ulam (Tamid 7:2). Calm and respectful: no score.
 * In the Temple the kohanim raised their hands above their heads (in the country: at shoulder height), and it was
 * said as one blessing. ── light28 ── The three verses in full, as a printed siddur prints them (the owner, 12.10; birkat28.js), one after
 * the other as the hands stay up. ── /light28 ──
 * ──────────────────────────────────────────────────────────────────────────── */
import { svgEl, kohenFig, press } from './common.js';
import { ULAM_STEPS, LEVEL } from '../../places.js';

import { BIRKAT_VERSES } from '../works/birkat28.js';   // ── light28 ── ── /light28 ──
const WORDS = BIRKAT_VERSES;   // ── light28 ── (was the first words only) ── /light28 ──

export const birkat = {
  id: 'birkat', title: 'ברכת כהנים', kicker: 'על מעלות האולם',
  intro: 'הכהנים עומדים על מעלות האולם ומברכים את העם ברכה אחת. במקדש — הידיים למעלה, על גבי הראש.',
  introAgain: 'על מעלות האולם — הידיים למעלה, על גבי הראש.',
  stage(W) { W.look('ulamSteps', 1600); W.av('blessing', true); W.kohen('player').pose('bless'); },
  after(W) { W.av('blessing', false); W.kohen('player').pose('stand'); },
  play(api) {
    const svg = api.svg('0 0 360 250', 'הכהנים על מעלות האולם');
    svgEl('rect', { x: 0, y: 0, width: 360, height: 250, class: 'av-court' }, svg);
    for (let k = 0; k < 6; k++) svgEl('rect', { x: 20, y: 90 + k * 12, width: 320, height: 12, class: 'av-step' }, svg);
    const figs = [];
    for (let k = 0; k < 7; k++) figs.push(kohenFig(svg, { x: 45 + k * 45, y: 58, s: 1, hl: k === 3 }));
    const armsL = [], line = svgEl('line', { x1: 10, y1: 44, x2: 350, y2: 44, class: 'av-headline' }, svg);
    figs.forEach((f, k) => { const a = svgEl('path', { d: '', class: 'av-arms' + (k === 3 ? ' hl' : '') }, svg); armsL.push({ a, x: 45 + k * 45 }); });
    for (let k = 0; k < 16; k++) svgEl('circle', { cx: 20 + k * 21, cy: 200 + (k % 2) * 14, r: 7, class: 'av-person' }, svg);
    const words = svgEl('text', { x: 180, y: 180, class: 'av-say small' /* ── light28 ── (a whole verse fits the 360 width) ── /light28 ── */, 'text-anchor': 'middle' }, svg);
    const H = api.hold(api.button('החזק — הרם ידיים', () => {}, 'gold hold'));
    const btn = api.controls.lastChild;
    const T3 = api.three;
    if (T3) T3.targets([{ key: 'bless', at: [(ULAM_STEPS.x0 + ULAM_STEPS.x1) / 2 - 4, (LEVEL.azara + LEVEL.heichal) / 2 + 2.5, 0], label: 'החזק — ידיים על גבי הראש', onHold: (d) => H.set(d) }]);
    let u = 0, lift = 0, w = 0;
    const draw = () => armsL.forEach(({ a, x }) => { const y = 70 - lift * 40; a.setAttribute('d', `M${x - 7} 66 L${x - 12} ${y} M${x + 7} 66 L${x + 12} ${y}`); });
    draw();
    api.loop((dt) => {
      if (u >= 1) return;
      const held = H.held();
      lift = Math.max(0, Math.min(1, lift + (held ? dt * 2.2 : -dt * 2)));
      draw();
      line.classList.toggle('on', lift > 0.95);
      if (held && lift > 0.95) {
        u = Math.min(1, u + dt / 4.5);
        const k = Math.min(WORDS.length, Math.floor(u * (WORDS.length + 1)));
        if (k !== w) { w = k; words.textContent = k ? WORDS[k - 1] : ''; /* ── light28 ── (one whole verse at a time) ── /light28 ── */ if (T3) api.hint(words.textContent, 'ok'); api.sfx && api.sfx.play('lyre', { n: k * 2 }); }
        if (u >= 1) { btn.disabled = true; api.sfx && api.sfx.play('solemn'); api.done({ text: 'ברכה אחת, והידיים על גבי הראש — כך בירכו במקדש.', linger: 1400 }); }
      } else if (!held && u > 0 && u < 1 && lift < 0.5) {
        api.hint('במקדש — הידיים על גבי הראש, עד סוף הברכה. הרם שוב.');
      }
    });
    api.hint('החזק כדי להרים את הידיים מעל הראש, והחזק עד סוף הברכה.');
    api.solver(async () => { await api.wait(40); api.hit('bless', btn, 'down'); while (u < 1) await api.wait(40); api.hit('bless', btn, 'up'); });
  },
};
