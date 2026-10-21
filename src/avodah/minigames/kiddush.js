/* ─────────────────────────────────────────────────────────────────────────────
 * kiddush.js: the patrol and קידוש ידיים ורגליים at the kiyor.
 * 1. Two groups with torches go round the azara in opposite directions; where they meet: "שלום, הכל שלום"
 *    (Tamid 1:3). Tap when they meet.
 * 2. The kiyor has twelve spigots (Ben Katin, Yoma 3:10): find a free one, then sanctify hands and feet together, as
 *    Zevachim 19b tells it (avodah_gaps.json kiddush_posture): "מניח ידו הימנית על גבי רגלו הימנית וידו השמאלית על גבי
 *    רגלו השמאלית ומקדש" — two thumbs: the right hand on the right foot and the left on the left, held together while the
 *    water runs ("קדש ידיו ורגליו מן הכיור", Tamid 1:4).
 * ──────────────────────────────────────────────────────────────────────────── */
import { svgEl, kohenFig, press } from './common.js';
import { KIYOR } from '../../places.js';
import { gapLine } from '../data.js';

export const kiddush = {
  id: 'kiddush', title: 'שלום, הכל שלום — ואל הכיור', kicker: 'העזרה, לפני השחר',
  intro: 'שתי כתות עם אבוקות בודקות את העזרה מסביב. כשהן נפגשות — אמור "שלום, הכל שלום". אחר כך קדש ידיים ורגליים מן הכיור.',
  introAgain: 'כשהכתות נפגשות — "שלום, הכל שלום". ואחר כך — אל הכיור.',
  stage(W) { W.time('night'); W.look('kiyor', 1600); W.kohen('player', { garments: 'kohen' }).walkTo([-63.5, 24]); },
  play(api) {
    const svg = api.svg('0 0 360 260', 'העזרה והכיור');
    // phase 1: the azara as a rectangle; two torch groups go round it
    const g1 = svgEl('g', {}, svg);
    svgEl('rect', { x: 40, y: 40, width: 280, height: 170, rx: 8, class: 'av-azara' }, g1);
    svgEl('text', { x: 180, y: 130, class: 'av-lab big', 'text-anchor': 'middle' }, g1).textContent = 'העזרה';
    const tA = svgEl('circle', { r: 9, class: 'av-torch' }, g1), tB = svgEl('circle', { r: 9, class: 'av-torch' }, g1);
    const per = 2 * (280 + 170);
    const at = (d) => { d = ((d % per) + per) % per; if (d < 280) return [40 + d, 40]; d -= 280; if (d < 170) return [320, 40 + d]; d -= 170; if (d < 280) return [320 - d, 210]; d -= 280; return [40, 210 - d]; };
    let u = 0, met = false, phase = 1;
    const shalom = api.button('"שלום, הכל שלום!"', () => {
      if (phase !== 1) return;
      if (!met) { api.miss('עוד לא נפגשו — חכה עד שהכתות ייפגשו בקצה השני.'); return; }
      phase = 2; shalom.remove(); api.sfx && api.sfx.play('chime', { n: 3 });
      api.hint('הכל שלום.', 'ok');
      // "עד ששומעין קול העץ שעשה בן קטין מוכני לכיור, והן אומרים הגיע עת" (Tamid 1:4)
      api.after(600, () => {
        api.sfx && api.sfx.play('creak');
        // ── water ── (WATER, wave 6) the real wheel turns and raises the kiyor from its pit, before the first washing
        if (api.world && typeof api.world.water === 'function') api.world.water('mukhni', false, { sec: 3.5 });
        // ── end water ──
        if (api.three) api.three.focus('mechanism', 900);
        api.hint('קול העץ — המוכני של בן קטין מעלה את הכיור: "הגיע עת!"', 'ok');
        api.after(1500, kiyorPhase);
      });
    }, 'gold');
    const stopLoop = api.loop((dt) => {
      if (phase !== 1) return;
      u = Math.min(per / 2, u + dt * 170);
      const a = at(u), b = at(-u);
      tA.setAttribute('cx', a[0]); tA.setAttribute('cy', a[1]); tB.setAttribute('cx', b[0]); tB.setAttribute('cy', b[1]);
      if (!met && u >= per / 2 - 1) { met = true; api.hint('נפגשו!'); }
    });
    api.hint('צפה באבוקות…');

    // phase 2: the kiyor with 12 spigots
    let sel = -1, wash = 0, HR = null, HL = null, part = 'posture', holdR = null, holdL = null, spigots = [], warned = 0;
    const busy = new Set([1, 4, 5, 8, 10]);
    function kiyorPhase() {
      stopLoop();
      g1.remove();
      api.world && api.world.sanct('highlight', 'kiyor');
      const g = svgEl('g', {}, svg);
      svgEl('path', { d: 'M60 120 Q180 170 300 120 L290 150 Q180 200 70 150 Z', class: 'av-bronze' }, g);
      svgEl('rect', { x: 170, y: 150, width: 20, height: 70, class: 'av-bronze' }, g);
      svgEl('text', { x: 180, y: 110, class: 'av-lab big', 'text-anchor': 'middle' }, g).textContent = 'הכיור — שנים עשר דדים';
      for (let i = 0; i < 12; i++) {
        const x = 78 + i * 18.5;
        const s = svgEl('g', { class: 'av-spigot' + (busy.has(i) ? ' busy' : ''), tabindex: 0 }, g);
        svgEl('rect', { x: x - 4, y: 142, width: 8, height: 12, rx: 2 }, s);
        svgEl('rect', { x: x - 9, y: 150, width: 18, height: 60, class: 'av-hit' }, s);
        if (busy.has(i)) kohenFig(g, { x, y: 196, s: 0.55 });
        s.addEventListener('pointerdown', () => choose(i, x));
        spigots.push({ s, x });
      }
      api.hint('בחר דד פנוי.');
      const T3 = api.three;
      if (T3) {
        T3.focus('kiyor', 900);
        T3.targets(spigots.map(({ x }, i) => {
          const a = (i / KIYOR.spigots) * Math.PI * 2 + Math.PI / 12;
          return { key: `spigot-${i}`, at: [KIYOR.x + Math.cos(a) * 2.3, KIYOR.rim - 1.0, KIYOR.z + Math.sin(a) * 2.3], small: true, onTap: () => choose(i, x) };
        }));
        busy.forEach((i) => T3.dim(`spigot-${i}`));
      }
    }
    const meter = document.createElement('div');
    meter.className = 'av-meter'; meter.innerHTML = '<i></i><span></span>';
    function choose(i, x) {
      if (sel >= 0) return;
      if (busy.has(i)) { api.miss('כהן אחר מקדש כאן — יש עוד דדים פנויים.'); return; }
      sel = i;
      kohenFig(svg, { x, y: 196, s: 0.6, hl: true });
      const water = svgEl('rect', { x: x - 2, y: 154, width: 4, height: 0, class: 'av-water' }, svg);
      (api.three && api.three.active ? api.controls : api.play).appendChild(meter);
      if (api.three) api.three.targets([]);
      // ── water ── (WATER, wave 6) the real kiyor: the player's kohen steps to this spigot; while both are held its water
      // falls on his hands and feet (world.water.hold), released → it closes. Nothing without the water layer.
      const WW = api.world && typeof api.world.water === 'function' && typeof api.world.has === 'function' && api.world.has('water') ? api.world : null;
      const me = WW && typeof WW.kohen === 'function' ? WW.kohen('player').raw || null : null;
      if (WW) WW.water('approach', me, i);
      let wet = false;
      const pour3d = (on) => { if (WW && on !== wet) { wet = on; WW.water('hold', me, i, on); } };
      // ── end water ──
      // "מניח ידו הימנית על גבי רגלו הימנית וידו השמאלית על גבי רגלו השמאלית ומקדש" (Zevachim 19b): both at once
      holdR = api.button('יד ימין על רגל ימין', () => {}, 'gold hold');
      holdL = api.button('יד שמאל על רגל שמאל', () => {}, 'gold hold');
      HR = api.hold(holdR); HL = api.hold(holdL);
      api.cite(gapLine('kiddush_posture'));
      const mouse = typeof matchMedia === 'function' && matchMedia('(pointer: fine)').matches && !matchMedia('(any-pointer: coarse)').matches;
      api.hint(`החזק את שניהם יחד — כל יד על רגלה — והמים יורדים על הידיים והרגליים.${mouse ? ' (בעכבר: החזק את מקש הרווח.)' : ''}`);
      api.loop((dt) => {
        if (part !== 'posture') return;
        const r = HR.held(), l = HL.held(), on = r && l;
        water.setAttribute('height', on ? 40 : 0);
        pour3d(on);   // ── water ──
        if (on && Math.random() < 0.15) api.sfx && api.sfx.play('water');
        if ((r || l) && !on && performance.now() - warned > 1600) { warned = performance.now(); api.hint(r ? 'ועכשיו גם יד שמאל על רגל שמאל — יחד.' : 'ועכשיו גם יד ימין על רגל ימין — יחד.'); }
        if (!on) return;
        wash = Math.min(1, wash + dt * 0.6);
        meter.querySelector('i').style.width = `${Math.round(wash * 100)}%`;
        meter.querySelector('span').textContent = 'ידיים ורגליים';
        if (wash >= 1) {
          part = 'done'; HR.set(false); HL.set(false); holdR.disabled = holdL.disabled = true;
          setTimeout(() => pour3d(false), 700);   // ── water ── (the last of the water runs off, then the spigot closes)
          api.world && api.world.sanct('highlight', null);
          api.done({ text: 'קידשת ידיים ורגליים — יחד, כל יד על רגלה. עכשיו אפשר לגעת בכלי השרת.' });
        }
      });
    }
    api.solver(async () => {
      while (!met) await new Promise((r) => setTimeout(r, 30));
      press(shalom);
      while (!spigots.length) await new Promise((r) => setTimeout(r, 30));
      const fi = spigots.findIndex((_, i) => !busy.has(i));
      await api.wait(60);
      api.hit(`spigot-${fi}`, spigots[fi].s.querySelector('.av-hit'), 'down');
      while (!holdR) await new Promise((r) => setTimeout(r, 30));
      press(holdR, 'down'); press(holdL, 'down');
    });
  },
};
