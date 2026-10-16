/* ─────────────────────────────────────────────────────────────────────────────
 * ketoret.js: הקטורת (Tamid 5:4–6:3). The legendary moment.
 * 1. The magrefa is thrown between the Ulam and the altar: no one in Jerusalem can hear his friend (5:6).
 * 2. The two eastern lamps: clean the eastern one, leave the western one burning (6:1).
 * 3. The coals from the second pyre: heap them on the golden altar and spread them with the edge of the
 *    machta (6:2).
 * 4. Wait for the memuneh: "הקטר!" — the people withdraw — then pour the ketoret slowly and evenly (6:3).
 * 5. Bow, and go out.
 * When today's lot is not the ketoret (live), the player stands with the kohanim: throw the magrefa, withdraw
 * at "הקטר", bow — and watch the cloud.
 * ──────────────────────────────────────────────────────────────────────────── */
import { svgEl, press } from './common.js';
import { spreadLamps } from '../interact3d.js';
import { GOLD_ALTAR } from '../../places.js';

export const ketoret = {
  id: 'ketoret', title: 'הקטורת', kicker: 'בין האולם ולמזבח — ובהיכל',
  intro: 'המגרפה, שני הנרות, הגחלים על מזבח הזהב — ואז, כשהממונה אומר "הקטר!", כל העם פורשים, והקטורת עולה.',
  introAgain: 'המגרפה, הנרות, הגחלים — וב"הקטר!" הקטורת עולה.',
  stage(W) { W.time('dawn'); W.look('ulamSteps', 1400); },
  after(W) { W.sanct('setGoldAltar', { coals: 1, smoke: 0.2 }); return W.sanctWait('exit', [], 6000); },
  play(api) {
    const { ctx } = api, W = api.world;
    const offer = !ctx.watch;                   // he offers (won the lot, or practice) — or he watches
    const svg = api.svg('0 0 360 250', 'בין האולם ולמזבח');
    let phase = 1;
    const g1 = svgEl('g', {}, svg);
    svgEl('rect', { x: 0, y: 0, width: 360, height: 250, class: 'av-court' }, g1);
    // plan: west (the Ulam) left, east (the altar) right
    svgEl('rect', { x: 10, y: 30, width: 100, height: 200, class: 'av-ulam' }, g1);
    svgEl('text', { x: 60, y: 22, class: 'av-lab', 'text-anchor': 'middle' }, g1).textContent = 'האולם (מערב)';
    svgEl('rect', { x: 260, y: 60, width: 90, height: 130, class: 'av-altartop' }, g1);
    svgEl('text', { x: 305, y: 52, class: 'av-lab', 'text-anchor': 'middle' }, g1).textContent = 'המזבח (מזרח)';
    const rake = svgEl('g', { transform: 'translate(170 150)' }, g1);
    svgEl('rect', { x: -4, y: -50, width: 8, height: 60, class: 'av-bronze' }, rake);
    svgEl('path', { d: 'M-22 10 L22 10 L18 22 L-18 22 Z', class: 'av-bronze' }, rake);
    let throwBtn = api.button('זרוק את המגרפה', () => {
      if (phase !== 1) return;
      phase = 2; throwBtn.remove();
      rake.setAttribute('transform', 'translate(170 205) rotate(80)');
      api.sfx && api.sfx.play('thud');
      api.play.classList.add('quake');
      api.after(700, () => api.play.classList.remove('quake'));
      api.hint('"אין אדם שומע קול חברו בירושלים מקול המגרפה". הכהנים עולים במעלות האולם.', 'ok');
      api.after(1500, () => { g1.remove(); lamps(); });
    }, 'gold');
    api.hint('הגעתם בין האולם ולמזבח.');
    const T3 = api.three;
    if (T3) T3.targets([{ key: 'magrefa', at: [-64, 16.4, 4], label: 'זרוק את המגרפה', onTap: () => throwBtn.click() }]);

    // 2: the two eastern lamps (west → east; the illustration of heichal.js)
    let lampEls = null;
    async function lamps() {
      phase = 3;
      if (W) await Promise.race([W.sanctWait('enter', ['heichal'], 6000), api.wait(2600)]);
      W && W.sanct('setLamps', [0.6, 0.6, 0.6, 0.6, 0.6, 1, 1]);
      W && W.sanct('focus', 'menorah', 1200);
      const g = svgEl('g', {}, svg);
      svgEl('rect', { x: 0, y: 0, width: 360, height: 250, class: 'av-hall' }, g);
      svgEl('text', { x: 16, y: 20, class: 'av-lab light' }, g).textContent = '→ מערב';
      svgEl('text', { x: 344, y: 20, class: 'av-lab light', 'text-anchor': 'end' }, g).textContent = 'מזרח ←';
      svgEl('text', { x: 180, y: 110, class: 'av-lab light', 'text-anchor': 'middle' }, g).textContent = 'שני הנרות המזרחיים דולקים';
      lampEls = [];
      for (let i = 0; i < 7; i++) {
        const x = 96 + i * 28, lit = i >= 5;
        const L = svgEl('g', { class: 'av-lamp' + (lit ? ' lit' : ' fresh'), tabindex: 0 }, g);
        svgEl('ellipse', { cx: x, cy: 66, rx: 9, ry: 5, class: 'av-gold' }, L);
        svgEl('path', { d: `M${x} 60 q-5 -9 0 -18 q5 9 0 18`, class: 'av-flame small' }, L);
        svgEl('rect', { x: x - 13, y: 38, width: 26, height: 40, class: 'av-hit' }, L);
        L.addEventListener('pointerdown', () => {
          if (phase !== 3) return;
          if (i === 6) {
            L.classList.remove('lit'); L.classList.add('fresh');
            W && W.sanct('setLamps', [0.6, 0.6, 0.6, 0.6, 0.6, 1, 0.6]);
            api.sfx && api.sfx.play('chime', { n: 4 });
            api.hint('"מדשן את המזרחי, ומניח את המערבי דולק" — ממנו ידליקו בערב.', 'ok');
            api.after(1200, () => { g.remove(); coals(); });
          } else if (i === 5) api.miss('את המערבי שבשניים מניחים דולק — "שממנו היה מדליק את המנורה בין הערבים".');
          else api.miss('אלה כבר הוטבו. עכשיו — שני הנרות המזרחיים הדולקים.');
        });
        lampEls.push(L);
      }
      api.hint('איזה משני הנרות המזרחיים מדשנים עכשיו?');
      if (T3) {
        T3.focus('menorah', 900);
        T3.targets(spreadLamps(W.lampsWestToEast()).map((p, i) => ({ key: `lamp-${i}`, at: p, small: true, onTap: () => lampEls[i].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })) })));
      }
    }
    // 3: coals on the golden altar
    let spread = 0, spreadDots = [], coalZone = null;
    function coals() {
      phase = 4;
      W && W.sanct('setGoldAltar', { coals: 1, smoke: 0 });
      W && W.sanct('focus', 'gold-altar', 1200); W && W.kohen('player').carry(offer ? 'kaf' : null);
      const g = svgEl('g', {}, svg);
      svgEl('rect', { x: 0, y: 0, width: 360, height: 250, class: 'av-hall' }, g);
      svgEl('rect', { x: 90, y: 70, width: 180, height: 120, rx: 6, class: 'av-gold' }, g);
      svgEl('text', { x: 180, y: 60, class: 'av-lab light', 'text-anchor': 'middle' }, g).textContent = 'מזבח הזהב';
      const heap = svgEl('circle', { cx: 180, cy: 130, r: 26, class: 'av-ember' }, g);
      coalZone = svgEl('rect', { x: 90, y: 70, width: 180, height: 120, class: 'av-hit' }, g);
      for (let k = 0; k < 6; k++) spreadDots.push([110 + (k % 3) * 70, 95 + Math.floor(k / 3) * 70]);
      let covered = new Set();
      const touch = (e) => {
        if (phase !== 4) return;
        const r = api.play.querySelector('svg').getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 360, y = ((e.clientY - r.top) / r.height) * 250;
        spreadDots.forEach(([dx, dy], k) => { if (!covered.has(k) && Math.hypot(dx - x, dy - y) < 45) { covered.add(k); svgEl('circle', { cx: dx, cy: dy, r: 16, class: 'av-ember' }, g); api.sfx && api.sfx.play('fire'); } });
        spread = covered.size;
        heap.setAttribute('r', 26 - spread * 3);
        if (spread >= 6) { phase = 5; api.hint('"ורדדן בשולי המחתה". עכשיו — חכה לממונה.', 'ok'); api.after(700, () => { g.remove(); pour(); }); }
      };
      coalZone.addEventListener('pointerdown', touch);
      coalZone.addEventListener('pointermove', (e) => { if (e.buttons || e.pointerType === 'touch') touch(e); });
      api.hint(offer ? 'שטח את הגחלים על כל המזבח: גרור את האצבע על פניו.' : 'את הגחלים צובר ומשטח הזוכה במחתה. כדי ללמוד איך — גרור את האצבע על פני המזבח.');
      if (T3) {
        T3.focus('gold-altar', 900);
        const top = GOLD_ALTAR.y + GOLD_ALTAR.h + 0.05;
        T3.targets(spreadDots.map((_, k) => ({ key: `coal-${k}`, at: [GOLD_ALTAR.x - 0.36 + (k % 3) * 0.36, top, GOLD_ALTAR.z - 0.25 + Math.floor(k / 3) * 0.5], small: true, onTap: () => { cover(k); T3.done(`coal-${k}`, true); } })));
        api.hint(offer ? 'שטח את הגחלים על פני מזבח הזהב: הקש על כל מקום.' : 'את הגחלים צובר ומשטח הזוכה במחתה. כדי ללמוד איך — הקש על פני המזבח.');
      }
      function cover(k) {
        if (phase !== 4 || covered.has(k)) return;
        covered.add(k); svgEl('circle', { cx: spreadDots[k][0], cy: spreadDots[k][1], r: 16, class: 'av-ember' }, g); api.sfx && api.sfx.play('fire');
        spread = covered.size; heap.setAttribute('r', 26 - spread * 3);
        if (spread >= 6) { phase = 5; api.hint('"ורדדן בשולי המחתה". עכשיו — חכה לממונה.', 'ok'); api.after(700, () => { g.remove(); pour(); }); }
      }
      api.solverStep3d = async () => { while (phase === 4 && T3.alive) { for (let k = 0; k < spreadDots.length; k++) if (!covered.has(k)) { api.hit(`coal-${k}`, null, 'down'); await api.wait(30); } await api.wait(60); } if (phase === 4) await api.solverStep(); };
      api.solverStep = async () => { for (const [dx, dy] of spreadDots) { const r = api.play.querySelector('svg').getBoundingClientRect(); coalZone.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r.left + (dx / 360) * r.width, clientY: r.top + (dy / 250) * r.height })); await api.wait(30); } };
    }
    // 4: "הקטר!" — withdraw — pour
    let said = false, poured = 0, pourBtn = null, withdrawn = false, cloud = null, bowBtn = null;
    function pour() {
      if (T3) T3.targets([]);
      const g = svgEl('g', {}, svg);
      svgEl('rect', { x: 0, y: 0, width: 360, height: 250, class: 'av-hall' }, g);
      svgEl('rect', { x: 110, y: 110, width: 140, height: 90, rx: 6, class: 'av-gold' }, g);
      for (let k = 0; k < 6; k++) svgEl('circle', { cx: 130 + (k % 3) * 50, cy: 135 + Math.floor(k / 3) * 40, r: 13, class: 'av-ember' }, g);
      const say = svgEl('text', { x: 180, y: 60, class: 'av-say', 'text-anchor': 'middle' }, g);
      cloud = svgEl('g', { class: 'av-cloud' }, g);
      const people = svgEl('g', {}, g);
      for (let k = 0; k < 6; k++) svgEl('circle', { cx: 40 + k * 56, cy: 230, r: 7, class: 'av-person' }, people);
      api.after(1400 + Math.random() * 1200, () => {
        said = true; say.textContent = 'הַקְטֵר!';
        api.sfx && api.sfx.play('ui');
        people.classList.add('away');
        api.hint(offer ? '"פרשו העם" — עכשיו הקטר, לאט ובשווה.' : 'הממונה אמר "הקטר" — פרוש מן ההיכל!');
      });
      if (offer) {
        pourBtn = api.button('החזק כדי להקטיר', () => {}, 'gold hold');
        const H = api.hold(pourBtn);
        pourBtn.addEventListener('pointerdown', () => { if (!said) api.miss('"לא היה המקטיר מקטיר עד שהממנה אומר לו, הקטר" (תמיד ו, ג).'); });
        api.loop((dt) => {
          if (!said || poured >= 1) return;
          if (H.held()) {
            poured = Math.min(1, poured + dt * 0.4);
            if (Math.random() < 0.3) puff();
            if (Math.random() < 0.05) api.sfx && api.sfx.play('pour');
            if (poured >= 1) finale();
          }
        });
        api.hint('חכה לממונה…');
      } else {
        const wBtn = api.button('פרוש מן ההיכל', () => {
          if (!said) { api.miss('עוד לא — חכה עד שהממונה יאמר "הקטר".'); return; }
          if (withdrawn) return;
          withdrawn = true; wBtn.remove();
          let n = 0;
          api.loop(() => { if (n++ < 90 && Math.random() < 0.5) puff(); });
          api.after(1600, finale);
        }, 'gold');
        pourBtn = wBtn;
        api.hint('עמוד עם הכהנים. חכה לממונה…');
      }
    }
    function puff() {
      const x = 130 + Math.random() * 100, y = 110 - Math.random() * 60;
      svgEl('circle', { cx: x, cy: y, r: 10 + Math.random() * 18, class: 'av-puff' }, cloud);
      if (cloud.childNodes.length > 60) cloud.firstChild.remove();
    }
    function finale() {
      if (phase === 9) return;
      phase = 9;
      if (pourBtn && pourBtn.isConnected) pourBtn.disabled = true;
      W && W.sanct('setGoldAltar', { coals: 1, smoke: 1 });
      api.sfx && api.sfx.play('solemn');
      api.sparkle(50, 30, 16);
      const veil = document.createElement('div');
      veil.className = 'av-incense';
      api.play.appendChild(veil);
      api.hint('הענן ממלא את ההיכל. "מיריחו היו מריחים ריח פטום הקטרת".', 'ok');
      bowBtn = api.button('השתחווה וצא', () => {
        bowBtn.disabled = true;
        W && W.av('bow', true); W && W.kohen('player').pose('bow'); W && W.kohen('player').carry(null);
        api.done({ text: offer ? 'הקטרת, השתחווית ויצאת.' : 'הקטורת עלתה. השתחווית ויצאת עם אחיך הכהנים.', offered: offer, linger: 1200 });
      }, 'gold');
    }
    api.solver(async () => {
      api.hit('magrefa', throwBtn);
      while (!lampEls) await api.wait(40);
      await api.wait(60);
      api.hit('lamp-6', lampEls[6].querySelector('.av-hit'), 'down');
      while (!api.solverStep) await api.wait(40);
      if (T3 && T3.alive && api.solverStep3d) await api.solverStep3d(); else await api.solverStep();
      while (!said || !pourBtn) await api.wait(40);
      if (offer) { press(pourBtn, 'down'); while (poured < 1) await api.wait(40); press(pourBtn, 'up'); } else press(pourBtn);
      while (!bowBtn) await api.wait(40);
      press(bowBtn);
    });
  },
};
