/* ─────────────────────────────────────────────────────────────────────────────
 * maaracha.js: סידור המערכה (Tamid 2:1–5).
 * 1. The logs come up one by one: "כל העצים כשרין למערכה חוץ משל זית ושל גפן" (Tamid 2:3) — send each to the
 *    great pyre or back to the wood chamber.
 * 2. The second pyre, for the ketoret: "עצי תאנה יפין" (Tamid 2:5) — pick only fine fig wood.
 * 3. "הציתו שתי המערכות באש".
 * ──────────────────────────────────────────────────────────────────────────── */
import { svgEl, press } from './common.js';
import { WOODS } from '../data.js';
import { MAARACHOT, LEVEL } from '../../places.js';

const LEAF = {
  fig: 'M0 -10 C8 -10 10 -2 6 2 C10 6 4 12 0 8 C-4 12 -10 6 -6 2 C-10 -2 -8 -10 0 -10 Z',
  nut: 'M0 -11 C6 -6 6 6 0 11 C-6 6 -6 -6 0 -11 Z',
  pine: 'M0 -11 L2 -2 L9 -6 L3 1 L8 8 L0 4 L-8 8 L-3 1 L-9 -6 L-2 -2 Z',
  olive: 'M-10 0 C-4 -5 4 -5 10 0 C4 5 -4 5 -10 0 Z',
  vine: 'M0 -10 L4 -4 L10 -5 L6 1 L9 7 L2 5 L0 11 L-2 5 L-9 7 L-6 1 L-10 -5 L-4 -4 Z',
};

export const maaracha = {
  id: 'maaracha', title: 'סידור המערכה', kicker: 'ראש המזבח',
  intro: 'הכהנים מעלים גזרי עצים. כל העצים כשרים — חוץ מזית וגפן. אחר כך: מערכה שנייה לקטורת, מעצי תאנה יפים.',
  introAgain: 'מיין את העצים — לא זית ולא גפן — ומערכה שנייה מעצי תאנה.',
  stage(W) { W.look('altarTop', 1600); W.av('fire', 0.4); },
  play(api) {
    const svg = api.svg('0 0 360 250', 'גזרי עצים למערכה');
    svgEl('rect', { x: 0, y: 170, width: 360, height: 80, class: 'av-altartop' }, svg);
    const pyre = svgEl('g', {}, svg);
    svgEl('text', { x: 90, y: 238, class: 'av-lab', 'text-anchor': 'middle' }, svg).textContent = 'המערכה הגדולה';
    svgEl('text', { x: 280, y: 238, class: 'av-lab', 'text-anchor': 'middle' }, svg).textContent = 'המערכה השנייה';
    const second = svgEl('g', {}, svg);
    const stage = svgEl('g', { transform: 'translate(180 90)' }, svg);
    // a mixed, fixed-length queue: every species, the two unfit ones twice
    const rnd = Math.random;
    const q = ['fig', 'olive', 'nut', 'shemen', 'vine', 'fig', 'nut', 'olive'].sort(() => rnd() - 0.5);
    let i = 0, placed = 0, phase = 1, cur = null, lastWrong = null;
    const woodById = Object.fromEntries(WOODS.map((w) => [w.id, w]));
    function show() {
      stage.innerHTML = '';
      if (i >= q.length) { phase = 2; api.after(250, secondPhase); return; }
      cur = woodById[q[i]];
      const log = svgEl('g', { class: 'av-bigLog' }, stage);
      svgEl('rect', { x: -70, y: -16, width: 140, height: 32, rx: 14, fill: cur.color, class: 'av-bark' }, log);
      svgEl('ellipse', { cx: 70, cy: 0, rx: 9, ry: 16, class: 'av-ring' }, log);
      svgEl('path', { d: LEAF[cur.leaf], transform: 'translate(-40 -30) scale(1.4)', class: 'av-leaf ' + cur.leaf }, log);
      svgEl('text', { x: 0, y: 44, class: 'av-lab big', 'text-anchor': 'middle' }, stage).textContent = /^עץ/.test(cur.he) ? cur.he : `עץ ${cur.he}`;
    }
    const decide = (toPyre) => {
      if (phase !== 1 || !cur) return;
      if (toPyre !== cur.ok) {
        api.miss(cur.ok ? `${/^עץ/.test(cur.he) ? cur.he : `עץ ${cur.he}`} כשר למערכה — "כל העצים כשרין… חוץ משל זית ושל גפן".` : `לא ${cur.he === 'זית' ? 'זית' : 'גפן'}! "כל העצים כשרין למערכה, חוץ משל זית ושל גפן" (תמיד ב, ג).`);
        lastWrong = cur.id;
        return;
      }
      if (toPyre) { svgEl('rect', { x: 40 + (placed % 4) * 26, y: 196 - Math.floor(placed / 4) * 12, width: 24, height: 9, rx: 4, fill: cur.color, class: 'av-log' }, pyre); placed++; api.sfx && api.sfx.play('step'); }
      else api.sfx && api.sfx.play('ui');
      i++; show();
    };
    const bNo = api.button('לא למערכה', () => decide(false), 'ghost');
    const bYes = api.button('למערכה ←', () => decide(true), 'gold');
    api.hint('שלח כל גזיר למערכה — או החזר אותו ללשכת העצים.');
    show();

    // phase 2: the second pyre: pick the fig logs
    let figs = 0;
    const picks = [];
    function secondPhase() {
      bNo.remove(); bYes.remove();
      stage.innerHTML = '';
      api.hint('המערכה השנייה, לקטורת: בחר שלושה גזרי תאנה יפים.');
      const opts = ['fig', 'nut', 'fig', 'shemen', 'fig', 'nut'];
      opts.forEach((id, k) => {
        const w = woodById[id];
        const g = svgEl('g', { class: 'av-choice', transform: `translate(${-125 + (k % 3) * 125} ${-28 + Math.floor(k / 3) * 56})`, tabindex: 0 }, stage);
        svgEl('rect', { x: -52, y: -14, width: 104, height: 28, rx: 12, fill: w.color, class: 'av-bark' }, g);
        svgEl('path', { d: LEAF[w.leaf], transform: 'translate(-34 0)', class: 'av-leaf ' + w.leaf }, g);
        svgEl('text', { x: 6, y: 5, class: 'av-lab light', 'text-anchor': 'middle' }, g).textContent = w.he;
        g.addEventListener('pointerdown', () => {
          if (g.classList.contains('taken')) return;
          if (!w.fig) { api.miss(`למערכה השנייה בוררים "עצי תאנה יפין" (תמיד ב, ה) — לא ${w.he}.`); return; }
          g.classList.add('taken'); figs++;
          svgEl('rect', { x: 250 + (figs % 2) * 20, y: 198 - figs * 7, width: 22, height: 8, rx: 4, fill: w.color, class: 'av-log' }, second);
          api.sfx && api.sfx.play('chime', { n: figs + 2 });
          if (figs >= 3) { phase = 3; api.after(300, api.three && api.three.alive ? where : light); }
        });
        picks.push({ g, fig: !!w.fig });
      });
    }
    let lightBtn = null, placed2 = false;
    /* 3D: where is the second pyre laid? On the altar top, near the south-west horn (Tamid 2:5; places.MAARACHOT) */
    function where() {
      const T3 = api.three, y = LEVEL.altarTop + 0.6;
      T3.frame('altarTop', 1000);
      api.hint('היכן מסדרים את המערכה השנייה, לקטורת?');
      const spots = [['NE', -30, -13, 'צפון־מזרח'], ['NW', -46, -13, 'צפון־מערב'], ['SE', -30, 6, 'דרום־מזרח'], ['SW', MAARACHOT.ketoret.x, MAARACHOT.ketoret.z, 'דרום־מערב']];
      T3.targets(spots.map(([k, x, z, he]) => ({ key: `pyre-${k}`, at: [x, y, z], label: he, onTap: () => {
        if (placed2) return;
        if (k !== 'SW') { api.miss('המערכה השנייה — סמוך לקרן הדרומית־מערבית (תמיד ב, ה).'); return; }
        placed2 = true; T3.done(`pyre-${k}`); api.sfx && api.sfx.play('chime', { n: 6 });
        api.after(400, () => { T3.targets([{ key: 'light', at: [MAARACHOT.great.x, y + 0.4, MAARACHOT.great.z], label: 'הצת', onTap: () => lightBtn && lightBtn.click() }]); light(); });
      } })), { onLost: () => { if (!placed2) { placed2 = true; light(); } } });   // out of reach: straight to the lighting
    }
    function light() {
      stage.innerHTML = '';
      lightBtn = api.button('הצת את שתי המערכות', () => {
        lightBtn.disabled = true;
        for (const x of [90, 280]) svgEl('path', { d: `M${x - 30} 190 q12 -60 30 -20 q10 -50 26 -10 q8 -40 20 30 Z`, class: 'av-flame big' }, svg);
        api.sfx && api.sfx.play('fire');
        api.world && api.world.av('fire', 1);
        api.sparkle(25, 70, 10); api.sparkle(78, 70, 10);
        api.done({ text: 'שתי המערכות בוערות. הכהנים יורדים ללשכת הגזית.' });
      }, 'gold');
      api.hint('"הציתו שתי המערכות באש".');
    }
    api.solver(async () => {
      while (phase === 1) { if (cur) press(cur.ok ? bYes : bNo); await api.wait(60); }
      while (!picks.length) await api.wait(40);
      for (const p of picks.filter((x) => x.fig)) { press(p.g, 'down'); await api.wait(80); }
      if (api.three && api.three.alive) { while (!placed2 && !lightBtn) { if (api.three.el('pyre-SW')) api.hit('pyre-SW', null); await api.wait(40); } }
      while (!lightBtn) await api.wait(40);
      await api.wait(40);
      api.hit('light', lightBtn);
    });
  },
};
