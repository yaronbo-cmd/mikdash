/* ─────────────────────────────────────────────────────────────────────────────
 * deshen.js: תרומת הדשן (Tamid 1:4).
 * 1. Up the kevesh alone, with no lamp, by the light of the pyre: hold to climb.
 * 2. "ופנה את הגחלים הילך והילך, חתה מן המאכלות הפנימיות": push the coals aside, then scoop only the inner,
 *    well-consumed coals into the silver machta.
 * 3. Down, turn north, and heap them east of the kevesh, three tefachim from it (places.DESHEN_PLACE).
 * ──────────────────────────────────────────────────────────────────────────── */
import { svgEl, press } from './common.js';
import { DESHEN_PLACE, KEVESH, MAARACHOT, LEVEL } from '../../places.js';

export const deshen = {
  id: 'deshen', title: 'תרומת הדשן', kicker: 'המזבח, לאור המערכה',
  intro: 'אתה עולה לבדך, בלי נר — רק לאור האש שעל המזבח. חתה מן הגחלים הפנימיות והנח אותן ממזרח לכבש.',
  introAgain: 'בלי נר, לאור האש: חתה מן הפנימיות — ממזרח לכבש.',
  stage(W) {
    W.time('night'); W.look('kevesh', 1600); W.av('fire', 0.7);
    const k = W.kohen('player', { garments: 'kohen', role: 'deshen' });
    k.carry('machta');
    k.walkTo([(KEVESH.x0 + KEVESH.x1) / 2, KEVESH.zTop]);
  },
  play(api) {
    const svg = api.svg('0 0 360 260', 'הכבש והמזבח בלילה');
    const dark = svgEl('rect', { x: 0, y: 0, width: 360, height: 260, class: 'av-night' }, svg);
    // phase 1: the ramp
    const g1 = svgEl('g', {}, svg);
    svgEl('path', { d: 'M20 240 L250 90 L340 90 L340 250 L20 250 Z', class: 'av-stone' }, g1);
    const glow = svgEl('circle', { cx: 300, cy: 70, r: 60, class: 'av-glow' }, g1);
    svgEl('path', { d: 'M280 90 q10 -30 20 -10 q8 -25 16 -2 q6 -18 12 5 Z', class: 'av-flame' }, g1);
    const me = svgEl('g', { class: 'av-kohen hl' }, g1);
    svgEl('path', { d: 'M-6 18 L-5 0 Q0 -3 5 0 L6 18 Z', class: 'av-robe' }, me);
    svgEl('circle', { cx: 0, cy: -4, r: 4, class: 'av-face' }, me);
    let u = 0, phase = 1;
    const climb = api.button('החזק כדי לעלות בכבש', () => {}, 'gold hold');
    const H = api.hold(climb);
    const place = () => { const x = 40 + u * 230, y = 228 - u * 150; me.setAttribute('transform', `translate(${x} ${y})`); glow.setAttribute('opacity', 0.35 + u * 0.6); };
    place();
    api.loop((dt) => {
      if (phase !== 1) return;
      if (H.held()) { u = Math.min(1, u + dt * 0.38); if (Math.random() < 0.08) api.sfx && api.sfx.play('step'); }
      place();
      if (u >= 1) { phase = 2; climb.remove(); api.after(300, coals); }
    });
    api.hint('רק אור המערכה מאיר את הדרך.');
    const T3 = api.three;
    // the ring sits halfway up the kevesh (the centre of SHOTS.kevesh), where the climb is seen
    const zMid = (KEVESH.zTop + KEVESH.zFoot) / 2, yMid = LEVEL.altarTop - 0.5 * (LEVEL.altarTop - LEVEL.azara);
    if (T3) { T3.frame('kevesh', 900); T3.targets([{ key: 'climb', at: [(KEVESH.x0 + KEVESH.x1) / 2, yMid + 1, zMid], label: 'החזק — עלה בכבש', onHold: (d) => H.set(d) }]); }

    // phase 2: the coals
    let pushed = 0, scooped = 0;
    const heaps = [], embers = [];
    function coals() {
      g1.remove(); dark.setAttribute('opacity', 0.25);
      const g = svgEl('g', {}, svg);
      svgEl('rect', { x: 30, y: 50, width: 300, height: 170, rx: 10, class: 'av-altartop' }, g);
      svgEl('text', { x: 180, y: 40, class: 'av-lab', 'text-anchor': 'middle' }, g).textContent = 'ראש המזבח';
      // two heaps of fresh coals on the sides (to push aside), inner consumed embers in the middle
      for (const [x, side] of [[110, 'right'], [250, 'left']]) {
        const h = svgEl('g', { class: 'av-heap', tabindex: 0 }, g);
        for (let k = 0; k < 7; k++) svgEl('rect', { x: x - 30 + (k % 4) * 15, y: 110 + Math.floor(k / 4) * 16, width: 26, height: 9, rx: 4, class: 'av-log', transform: `rotate(${(k * 23) % 40 - 20} ${x} 120)` }, h);
        svgEl('rect', { x: x - 40, y: 90, width: 80, height: 70, class: 'av-hit' }, h);
        h.addEventListener('pointerdown', () => push(h, side));
        heaps.push(h);
      }
      embers.length = 0;
      for (let k = 0; k < 9; k++) {
        const e = svgEl('circle', { cx: 150 + (k % 3) * 30, cy: 115 + Math.floor(k / 3) * 22, r: 9, class: 'av-ember hidden', tabindex: 0 }, g);
        e.addEventListener('pointerdown', () => scoop(e));
        embers.push(e);
      }
      g.addEventListener('pointerdown', (ev) => { if (ev.target === g || ev.target.classList.contains('av-altartop')) { if (pushed >= 2) api.miss('"חתה מן המאכלות הפנימיות" (תמיד א, ד) — הגחלים הלוחשות שבאמצע.'); } });
      api.hint('פנה את הגחלים הנה והנה: הקש על שתי הערימות.');
      if (T3) {
        const M = MAARACHOT.great, y = LEVEL.altarTop + 0.7;
        T3.focus('maaracha', 900);
        T3.targets([
          { key: 'heap-0', at: [M.x - 3.2, y, M.z], label: 'פנה', onTap: () => { push(heaps[0], 'right'); T3.done('heap-0', true); emberTargets(); } },
          { key: 'heap-1', at: [M.x + 3.2, y, M.z], label: 'פנה', onTap: () => { push(heaps[1], 'left'); T3.done('heap-1', true); emberTargets(); } },
        ]);
      }
      function emberTargets() {
        if (!T3 || pushed < 2) return;
        const M = MAARACHOT.great, y = LEVEL.altarTop + 0.6;
        T3.targets(embers.slice(0, 5).map((e, k) => ({ key: `ember-${k}`, at: [M.x + [-0.9, 0.9, 0, -0.5, 0.6][k], y, M.z + [-0.7, -0.6, 0.2, 0.9, 0.8][k]], small: true, onTap: () => { scoop(e); T3.done(`ember-${k}`, true); } })));
      }
      function push(h, side) {
        if (h.classList.contains('moved')) return;
        h.classList.add('moved', side); pushed++;
        api.sfx && api.sfx.play('fire');
        if (pushed === 2) { embers.forEach((e) => e.classList.remove('hidden')); api.hint('עכשיו חתה שלוש פעמים מן הגחלים הפנימיות.'); }
      }
      function scoop(e) {
        if (pushed < 2) { api.miss('קודם פנה את הגחלים הילך והילך.'); return; }
        if (e.classList.contains('taken')) return;
        e.classList.add('taken'); scooped++;
        api.sfx && api.sfx.play('chime', { n: scooped + 1 });
        if (scooped >= 3) { phase = 3; api.after(400, () => { g.remove(); descend(); }); }
      }
    }
    // phase 3: east of the kevesh
    let spotEl = null;
    function descend() {
      dark.setAttribute('opacity', 0.15);
      const g = svgEl('g', {}, svg);
      // plan view: north up, east right. altar top, the kevesh running south (down)
      svgEl('rect', { x: 110, y: 20, width: 120, height: 100, class: 'av-altartop' }, g);
      svgEl('text', { x: 170, y: 72, class: 'av-lab', 'text-anchor': 'middle' }, g).textContent = 'המזבח';
      svgEl('rect', { x: 140, y: 120, width: 60, height: 120, class: 'av-stone' }, g);
      svgEl('text', { x: 170, y: 185, class: 'av-lab', 'text-anchor': 'middle' }, g).textContent = 'הכבש';
      svgEl('text', { x: 340, y: 140, class: 'av-lab', 'text-anchor': 'end' }, g).textContent = 'מזרח ←';
      svgEl('text', { x: 20, y: 140, class: 'av-lab' }, g).textContent = '→ מערב';
      const bad = svgEl('circle', { cx: 118, cy: 150, r: 16, class: 'av-spot', tabindex: 0 }, g);
      spotEl = svgEl('circle', { cx: 222, cy: 150, r: 16, class: 'av-spot', tabindex: 0 }, g);
      bad.addEventListener('pointerdown', () => api.miss('לא במערבו — "הלך למזרחו של כבש כעשר אמות".'));
      spotEl.addEventListener('pointerdown', () => {
        spotEl.classList.add('set');
        svgEl('circle', { cx: 222, cy: 150, r: 9, class: 'av-ember' }, g);
        api.world && api.world.kohen('player').walkTo([DESHEN_PLACE.x, DESHEN_PLACE.z]);
        api.sparkle(62, 58, 10);
        api.done({ text: 'צברת את הגחלים ממזרח לכבש, שלושה טפחים ממנו. תרומת הדשן נעשתה!' });
      });
      api.hint('ירדת ופנית צפונה. היכן לצבור את הגחלים?');
      if (T3) {
        T3.focus('deshen', 900);
        T3.targets([
          { key: 'place-west', at: [KEVESH.x0 - 1.2, 16.4, DESHEN_PLACE.z], label: 'מערב הכבש', onTap: () => bad.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })) },
          { key: 'place-east', at: [DESHEN_PLACE.x, 16.4, DESHEN_PLACE.z], label: 'מזרח הכבש', onTap: () => spotEl.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })) },
        ]);
      }
    }
    api.solver(async () => {
      api.hit('climb', climb, 'down');
      while (phase === 1) await api.wait(40);
      api.hit('climb', climb, 'up');
      while (!heaps.length) await api.wait(40);
      await api.wait(60);
      for (let k = 0; k < heaps.length; k++) { api.hit(`heap-${k}`, heaps[k].querySelector('.av-hit'), 'down'); await api.wait(120); }
      for (let k = 0; k < 3; k++) { const i = embers.findIndex((x) => !x.classList.contains('taken')); api.hit(`ember-${i}`, embers[i], 'down'); await api.wait(120); }
      while (!spotEl) await api.wait(40);
      await api.wait(60);
      api.hit('place-east', spotEl, 'down');
    });
  },
};
