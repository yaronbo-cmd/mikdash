/* ─────────────────────────────────────────────────────────────────────────────
 * shoevah.js: שמחת בית השואבה (Sukkah 5:1–4), the nights of Chol HaMoed Sukkot, in Ezrat Nashim.
 * 1. Light the golden menorot: the young kohanim climb the ladders. The Mishnah does not give how
 *    many menorot there were — four here, as in the 3D scene (an illustration choice).
 * 2. The dance: the pious dance with torches of light — catch the torches as they fall (no fail: a dropped torch
 *    is picked up again).
 * 3. The Levites on the fifteen steps; at "קרא הגבר" — tekiah, teruah, tekiah.
 * ──────────────────────────────────────────────────────────────────────────── */
import { svgEl, press } from './common.js';
import { gapLine } from '../data.js';

export const shoevah = {
  id: 'shoevah', title: 'שמחת בית השואבה', kicker: 'עזרת הנשים, בלילה',
  intro: 'במוצאי יום טוב הראשון יורדים לעזרת נשים. הדלק את מנורות הזהב, רקוד עם האבוקות — ובקריאת הגבר, תקעו. "מי שלא ראה שמחת בית השואבה, לא ראה שמחה מימיו".',
  introAgain: 'הדלק את המנורות, רקוד עם האבוקות — ובקריאת הגבר, תקעו.',
  stage(W) { W.time('night'); W.look({ p: [200, 60, 60], t: [75, 20, 0] }, 2000); },
  play(api) {
    const W = api.world, { ctx } = api;
    const svg = api.svg('0 0 360 260', 'עזרת הנשים בלילה ומנורות הזהב');
    svgEl('rect', { x: 0, y: 0, width: 360, height: 260, class: 'av-hall' }, svg);
    const city = svgEl('g', {}, svg);
    for (let k = 0; k < 18; k++) svgEl('rect', { x: 8 + k * 20, y: 214 - (k % 4) * 8, width: 16, height: 46 + (k % 4) * 8, class: 'av-house' }, city);
    const menorot = [];
    for (let m = 0; m < 4; m++) {
      const x = 60 + m * 80;
      const g = svgEl('g', { class: 'av-menorah50', tabindex: 0 }, svg);
      svgEl('rect', { x: x - 3, y: 70, width: 6, height: 120, class: 'av-gold' }, g);
      for (let c = 0; c < 4; c++) svgEl('ellipse', { cx: x - 21 + c * 14, cy: 66, rx: 6, ry: 3, class: 'av-gold' }, g);
      const fl = svgEl('g', { class: 'av-fl' }, g);
      for (let c = 0; c < 4; c++) svgEl('path', { d: `M${x - 21 + c * 14} 62 q-5 -10 0 -20 q5 10 0 20`, class: 'av-flame small' }, fl);
      svgEl('path', { d: `M${x + 10} 190 L${x + 22} 70 M${x + 18} 190 L${x + 30} 70`, class: 'av-ladder' }, g);
      svgEl('rect', { x: x - 30, y: 40, width: 60, height: 150, class: 'av-hit' }, g);
      g.addEventListener('pointerdown', () => light(m, g));
      menorot.push(g);
    }
    let lit = 0, phase = 1;
    api.hint('ילדי כהונה עולים בסולמות: הקש על כל מנורה כדי להדליק אותה.');
    api.cite(gapLine('shoevah_when_where'));   // "במוצאי יום טוב הראשון של חג, ירדו לעזרת נשים, ומתקנין שם תקון גדול" (Sukkah 5:2)
    function light(m, g) {
      if (phase !== 1 || g.classList.contains('on')) return;
      g.classList.add('on'); lit++;
      city.setAttribute('class', 'lit' + lit);
      api.sfx && api.sfx.play('fire');
      if (lit === 4) { phase = 2; api.hint('"ולא היתה חצר בירושלים שאינה מאירה מאור בית השואבה". עכשיו — הריקוד!', 'ok'); api.after(900, dance); }
    }
    // the dance: catch the falling torches
    let caught = 0, torches = [], catchBtn = null;
    const NEED = 8;
    function dance() {
      phase = 2;
      const layer = svgEl('g', {}, svg);
      const spawn = () => {
        const x = 40 + Math.random() * 280;
        const el = svgEl('g', { class: 'av-torchfly', tabindex: 0 }, layer);
        svgEl('rect', { x: -2, y: -2, width: 4, height: 18, rx: 2, class: 'av-log' }, el);
        svgEl('circle', { cx: 0, cy: -5, r: 7, class: 'av-torch' }, el);
        svgEl('circle', { cx: 0, cy: 4, r: 18, class: 'av-hit' }, el);
        const t = { x, y: -20, v: 40 + Math.random() * 30, el, done: false };
        el.addEventListener('pointerdown', () => grab(t));
        torches.push(t);
      };
      spawn();
      let tSpawn = 0;
      api.loop((dt) => {
        if (phase !== 2) return;
        tSpawn += dt;
        if (tSpawn > 0.9 && torches.filter((t) => !t.done).length < 3) { tSpawn = 0; spawn(); }
        for (const t of torches) {
          if (t.done) continue;
          t.y += t.v * dt; t.el.setAttribute('transform', `translate(${t.x} ${t.y}) rotate(${(t.y * 3) % 360})`);
          if (t.y > 250) { t.done = true; t.el.remove(); api.hint('אבוקה נפלה — מרימים אותה וממשיכים לרקוד.'); }
        }
      });
      api.hint(`תפוס את האבוקות באוויר (${caught}/${NEED}).`);
    }
    function grab(t) {
      if (t.done || phase !== 2) return;
      t.done = true; caught++;
      t.el.remove();
      api.sparkle((t.x / 360) * 100, (t.y / 260) * 100, 6);
      api.sfx && api.sfx.play('lyre', { n: [0, 4, 7, 12, 7, 4, 2, 9][caught % 8] });
      api.hint(`תפוס את האבוקות באוויר (${caught}/${NEED}).`);
      if (caught >= NEED) { phase = 3; api.after(400, gever); }
    }
    let blowBtn = null;
    function gever() {
      torches.forEach((t) => { if (!t.done) { t.done = true; t.el.remove(); } });
      const steps = svgEl('g', {}, svg);
      for (let k = 0; k < 15; k++) svgEl('rect', { x: 60 + k * 16, y: 200 - k * 6, width: 16, height: 6 + k * 6, class: 'av-step' }, steps);
      for (let k = 0; k < 8; k++) svgEl('rect', { x: 70 + k * 30, y: 176 - k * 12, width: 8, height: 18, rx: 3, class: 'av-levite' }, steps);
      svgEl('text', { x: 180, y: 32, class: 'av-say small light', 'text-anchor': 'middle' }, svg).textContent = 'קָרָא הַגֶּבֶר';
      api.hint('הלויים מנגנים על חמש עשרה המעלות. "קרא הגבר" — תקעו!', 'ok');
      blowBtn = api.button('תקעו והריעו ותקעו', () => {
        blowBtn.disabled = true;
        api.sfx && api.sfx.play('tekiah'); api.after(900, () => api.sfx && api.sfx.play('teruah')); api.after(1700, () => api.sfx && api.sfx.play('tekiah'));
        W && W.av('trumpets');
        api.after(2200, () => api.done({ text: 'שמחה שאין כמותה. הלילה הבא — שוב, עד תום החג.', linger: 1400 }));
      }, 'gold');
    }
    api.solver(async () => {
      for (const g of menorot) { press(g.querySelector('.av-hit'), 'down'); await api.wait(40); }
      while (phase < 3) { const t = torches.find((x) => !x.done && x.y > 0); if (t) press(t.el.querySelector('.av-hit'), 'down'); await api.wait(40); }
      while (!blowBtn) await api.wait(40);
      press(blowBtn);
    });
  },
};
