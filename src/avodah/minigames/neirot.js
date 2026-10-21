/* ─────────────────────────────────────────────────────────────────────────────
 * neirot.js: the evening ketoret and the lighting of the lamps (Exodus 30:8; Tamid 6:1; tamid.json ketoret_erev,
 * night_burning). The western lamp stayed alight from the morning: take its flame and light the others from it —
 * "שממנו היה מדליק את המנורה בין הערבים". Then the night: the limbs and fats burn on the altar until dawn.
 * ──────────────────────────────────────────────────────────────────────────── */
import { svgEl, press } from './common.js';
import { spreadLamps } from '../interact3d.js';

/** the lamp left burning from the morning (Tamid 6:1), west → east index: with the Menorah east–west, the second from the east
 *  (5); north–south, the middle one (3) — world.sanctuary.state.menorahAxis (⚑ the owner's decision, docs/AVODAH.md ⚑11) */
const westIx = (W) => { const st = W && W.sanctState ? W.sanctState() : null; return st && st.menorahAxis === 'ns' ? 3 : 5; };
const westLit = (W) => { const l = [0, 0, 0, 0, 0, 0, 0]; l[westIx(W)] = 1; return l; };

export const neirot = {
  id: 'neirot', title: 'קטורת והדלקת הנרות', kicker: 'ההיכל, בין הערביים',
  intro: 'הנר המערבי דולק מן הבוקר. קח ממנו את האש והדלק את כל הנרות — ואז הלילה: האש על המזבח אינה כבה.',
  introAgain: 'קח אש מן הנר המערבי והדלק את כל הנרות.',
  stage(W) { W.time('dusk'); if (!W.hasFn('sanctuary', 'enter')) W.look('heichalDoor', 1200); W.sanct('setLamps', westLit(W)); return W.sanctWait('enter', ['heichal', { ms: 6000 }], 11000); },
  after(W) { W.sanct('setLamps', [1, 1, 1, 1, 1, 1, 1]); W.time('night'); return W.sanctWait('exit', [], 6000); },
  play(api) {
    const W = api.world;
    const svg = api.svg('0 0 360 230', 'המנורה בין הערביים');
    svgEl('rect', { x: 0, y: 0, width: 360, height: 230, class: 'av-hall' }, svg);
    svgEl('text', { x: 16, y: 20, class: 'av-lab light' }, svg).textContent = '→ מערב';
    svgEl('text', { x: 344, y: 20, class: 'av-lab light', 'text-anchor': 'end' }, svg).textContent = 'מזרח ←';
    svgEl('rect', { x: 176, y: 110, width: 8, height: 90, class: 'av-gold' }, svg);
    for (let k = 0; k < 3; k++) { const r = 30 + k * 28; svgEl('path', { d: `M${180 - r} 70 Q${180 - r} ${110 + r * 0.4} 180 ${110 + r * 0.4} Q${180 + r} ${110 + r * 0.4} ${180 + r} 70`, class: 'av-arm' }, svg); }
    // the lamp left burning in the morning (Tamid 6:1): with the Menorah east–west, the second from the east (index 5 west → east);
    // north–south, the middle one (Rashi, Shabbat 22b; content note on hatavat_2 — the owner's decision is pending)
    const WEST = westIx(W);
    const state = [0, 0, 0, 0, 0, 0, 0];
    state[WEST] = 1;
    let flame = false, lit = 1;
    const els = [];
    for (let i = 0; i < 7; i++) {
      const x = 96 + i * 28;
      const L = svgEl('g', { class: 'av-lamp' + (state[i] ? ' lit' : ' fresh'), tabindex: 0 }, svg);
      svgEl('ellipse', { cx: x, cy: 66, rx: 9, ry: 5, class: 'av-gold' }, L);
      svgEl('path', { d: `M${x} 60 q-5 -9 0 -18 q5 9 0 18`, class: 'av-flame small' }, L);
      svgEl('rect', { x: x - 13, y: 38, width: 26, height: 40, class: 'av-hit' }, L);
      L.addEventListener('pointerdown', () => tap(i, L));
      els.push(L);
    }
    const taper = svgEl('circle', { cx: 330, cy: 200, r: 6, class: 'av-taper' }, svg);
    function tap(i, L) {
      if (i === WEST && !flame) { flame = true; taper.classList.add('on'); api.sfx && api.sfx.play('fire'); api.hint('לקחת אש מן הנר המערבי. עכשיו הדלק את השאר.', 'ok'); return; }
      if (state[i]) return;
      if (!flame) { api.miss('מאיפה האש? "שממנו היה מדליק את המנורה בין הערבים" — מן הנר המערבי.'); return; }
      state[i] = 1; lit++;
      L.classList.remove('fresh'); L.classList.add('lit');
      W && W.sanct('setLamps', state.slice());
      api.sfx && api.sfx.play('chime', { n: lit });
      if (lit === 7) {
        api.sparkle(50, 30, 16);
        api.done({ text: 'שבעת הנרות דולקים. כל הלילה האברים והחלבים נשרפים על המזבח — "אש תמיד תוקד על המזבח לא תכבה".', linger: 1600 });
      }
    }
    api.hint('איזה נר עדיין דולק מן הבוקר?');
    const T3 = api.three;
    if (T3) {
      T3.focus('menorah', 1000);
      // each lamp where it burns (world.sanctuary.lampPosition, west → east), fanned out for a finger; the western lamp's ring is
      // labelled once its flame is taken
      T3.targets(spreadLamps(W.lampsWestToEast()).map((p, i) => ({ key: `lamp-${i}`, at: p, small: true, onTap: () => { tap(i, els[i]); if (state[i] && (i !== WEST || flame)) T3.done(`lamp-${i}`); } })));
    }
    api.solver(async () => { await api.wait(60); api.hit(`lamp-${WEST}`, els[WEST].querySelector('.av-hit'), 'down'); for (let i = 0; i < 7; i++) { if (i !== WEST) { api.hit(`lamp-${i}`, els[i].querySelector('.av-hit'), 'down'); await api.wait(30); } } });
  },
};
