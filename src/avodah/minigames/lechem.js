/* ─────────────────────────────────────────────────────────────────────────────
 * lechem.js: the showbread is changed on Shabbat (Menachot 11:7; Leviticus 24:5–9; calendar_offerings.json
 * lechem_hapanim). Four kohanim go in with the two rows and the two bowls of frankincense; four go before them.
 * Two thumbs: pull the old row out and slide the new one in together — the table is never left empty,
 * "לפני ה׳ תמיד". Then the frankincense is burned, and the old loaves are shared among the kohanim.
 * ──────────────────────────────────────────────────────────────────────────── */
import { svgEl, press } from './common.js';
import { SHULCHAN } from '../../places.js';

export const lechem = {
  id: 'lechem', title: 'לחם הפנים — שבת', kicker: 'ההיכל, השולחן',
  intro: 'שתים עשרה חלות בשתי מערכות. משוך את הישנות והנח את החדשות יחד — השולחן לעולם אינו ריק.',
  introAgain: 'משוך את הישנות והנח את החדשות — יחד.',
  stage(W) { if (!W.hasFn('sanctuary', 'enter')) W.look('heichalDoor', 1200); W.sanct('setBread', 'full'); return W.sanctWait('enter', ['heichal', { ms: 6000 }], 11000); },
  after(W) { W.sanct('setBezichin', true); return W.sanctWait('exit', [], 6000); },
  play(api) {
    const W = api.world;
    const svg = api.svg('0 0 360 240', 'שולחן לחם הפנים');
    svgEl('rect', { x: 0, y: 0, width: 360, height: 240, class: 'av-hall' }, svg);
    svgEl('rect', { x: 110, y: 60, width: 140, height: 120, rx: 4, class: 'av-gold' }, svg);
    svgEl('text', { x: 180, y: 50, class: 'av-lab light', 'text-anchor': 'middle' }, svg).textContent = 'השולחן';
    const oldG = svgEl('g', {}, svg), newG = svgEl('g', {}, svg);
    const loaf = (g, x, y, cls) => svgEl('rect', { x, y, width: 18, height: 12, rx: 5, class: cls }, g);
    for (let r = 0; r < 2; r++) for (let k = 0; k < 6; k++) { loaf(oldG, 126 + r * 70, 70 + k * 17, 'av-bread old'); loaf(newG, 126 + r * 70, 70 + k * 17, 'av-bread'); }
    const cover = svgEl('text', { x: 180, y: 222, class: 'av-lab light', 'text-anchor': 'middle' }, svg);
    let out = 0, inn = 0, phase = 1, warned = 0;
    const draw = () => {
      oldG.setAttribute('transform', `translate(${-out * 150} 0)`);
      newG.setAttribute('transform', `translate(${(1 - inn) * 150} 0)`);
      newG.setAttribute('opacity', inn > 0 ? 1 : 0.25);
      cover.textContent = `על השולחן: ${Math.round(Math.min(1, (1 - out) + inn) * 100)}%`;
    };
    draw();
    W && W.sanct('focus', 'shulchan', 1200);
    const bOut = api.button('משוך את הישנות', () => {}, 'hold');
    const bIn = api.button('הנח את החדשות', () => {}, 'gold hold');
    const HO = api.hold(bOut), HI = api.hold(bIn);
    const T3 = api.three;
    if (T3) {
      T3.focus('shulchan', 900);
      // the table's two ends (world.sanctuary.anchor 'shulchan-east' / 'shulchan-west'; places.js when missing), a little above
      const y = SHULCHAN.y + SHULCHAN.h;
      const end = (id, fb) => { const a = W.anchor(id) || fb; return [a[0], a[1] + 0.3, a[2]]; };
      T3.targets([
        { key: 'bread-out', at: end('shulchan-east', [SHULCHAN.x + SHULCHAN.len / 2 + 0.2, y, SHULCHAN.z]), label: 'משוך את הישנות', onHold: (d) => HO.set(d) },
        { key: 'bread-in', at: end('shulchan-west', [SHULCHAN.x - SHULCHAN.len / 2 - 0.2, y, SHULCHAN.z]), label: 'הנח את החדשות', onHold: (d) => HI.set(d) },
      ]);
    }
    const mouse = typeof matchMedia === 'function' && matchMedia('(pointer: fine)').matches && !matchMedia('(any-pointer: coarse)').matches;
    api.hint(`החזק את שני הכפתורים יחד — אחד מושך ואחד מניח.${mouse ? ' (בעכבר: החזק את מקש הרווח.)' : ''}`);
    api.loop((dt) => {
      if (phase !== 1) return;
      const sp = dt * 0.45;
      if (HI.held()) inn = Math.min(1, inn + sp);
      if (HO.held()) {
        const next = Math.min(1, out + sp);
        if ((1 - next) + inn < 0.95) { if (performance.now() - warned > 1500) { warned = performance.now(); api.hint('השולחן לעולם אינו ריק — הנח חדשות בזמן שאתה מושך.'); } }
        else out = next;
      }
      draw();
      if (out >= 1 && inn >= 1) {
        phase = 2; bOut.disabled = bIn.disabled = true;
        W && W.sanct('setBread', 'full');
        api.sfx && api.sfx.play('chime', { n: 6 });
        api.hint('הוחלף — ולא היה השולחן ריק אף רגע. הבזיכים מוקטרים, והחלות מתחלקות לכהנים.', 'ok');
        api.after(1300, () => api.done({ text: '"הקטירו הבזיכין, והחלות מתחלקות לכהנים" — ביום השבת, לפני ה׳ תמיד.', linger: 1300 }));
      }
    });
    api.solver(async () => { await api.wait(40); api.hit('bread-in', bIn, 'down'); api.hit('bread-out', bOut, 'down'); while (phase === 1) await api.wait(40); });
  },
};
