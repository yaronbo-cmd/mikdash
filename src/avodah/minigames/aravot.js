/* ─────────────────────────────────────────────────────────────────────────────
 * aravot.js: מצוות ערבה (Sukkah 4:5, 4:1, 4:3). Sukkot days — not on Shabbat unless it is the seventh day.
 * 1. Stand the willow branches from Motza at the sides of the altar, their tops bent over it.
 * 2. "תקעו והריעו ותקעו".
 * 3. Go round the altar — once a day, seven times on the seventh day — saying "אנא ה׳ הושיעה נא, אנא ה׳ הצליחה נא";
 *    drag your finger around the altar (or hold "הקף"). On the seventh day, at parting: "יפי לך מזבח".
 * ──────────────────────────────────────────────────────────────────────────── */
import { svgEl, press } from './common.js';
import { gapLine } from '../data.js';

export const aravot = {
  id: 'aravot', title: 'ערבות סביב המזבח', kicker: 'סוכות — המזבח',
  intro: 'ענפי ערבה ממוצא: זקוף אותם בצדי המזבח, וראשיהם כפופים על גביו. ואז — הקף את המזבח.',
  introAgain: 'זקוף את הערבות — והקף את המזבח.',
  stage(W) { W.time('noon'); W.look('altarTop', 1500); },
  play(api) {
    const { ctx } = api, W = api.world;
    const day7 = !!(ctx.theme && ctx.theme.sukkot && ctx.theme.sukkot.day === 7);
    const LAPS = day7 ? 7 : 1;
    const svg = api.svg('0 0 360 260', 'המזבח מלמעלה וענפי הערבה');
    svgEl('rect', { x: 0, y: 0, width: 360, height: 260, class: 'av-court' }, svg);
    svgEl('rect', { x: 110, y: 60, width: 140, height: 140, class: 'av-altartop' }, svg);
    svgEl('text', { x: 180, y: 136, class: 'av-lab', 'text-anchor': 'middle' }, svg).textContent = 'המזבח';
    const path = svgEl('circle', { cx: 180, cy: 130, r: 100, class: 'av-arc' }, svg);
    // eight places for the branches, two on each side
    const spots = [[145, 52], [215, 52], [258, 95], [258, 165], [215, 208], [145, 208], [102, 165], [102, 95]];
    let placed = 0, phase = 1;
    const spotEls = spots.map(([x, y], k) => {
      const s = svgEl('circle', { cx: x, cy: y, r: 13, class: 'av-spot', tabindex: 0 }, svg);
      s.addEventListener('pointerdown', () => {
        if (phase !== 1 || s.classList.contains('set')) return;
        s.classList.add('set'); placed++;
        const dx = 180 - x, dy = 130 - y, n = Math.hypot(dx, dy);
        svgEl('path', { d: `M${x - dx / n * 16} ${y - dy / n * 16} Q${x} ${y} ${x + dx / n * 22} ${y + dy / n * 22}`, class: 'av-willow' }, svg);
        api.sfx && api.sfx.play('chime', { n: placed });
        if (placed === spots.length) { phase = 2; api.hint('"וראשיהן כפופין על גבי המזבח". תקעו!', 'ok'); api.after(500, blow); }
      });
      return s;
    });
    api.hint('זקוף את ענפי הערבה בצדי המזבח: הקש על כל מקום.');
    api.cite(gapLine('aravot_timing'));   // "…גבוהות אחד עשר אמה כדי שיהו גוחות על המזבח אמה" (Sukkah 45a); the hour: ⚑ בבדיקה
    let blowBtn = null;
    function blow() {
      blowBtn = api.button('תקעו והריעו ותקעו', () => {
        blowBtn.remove();
        api.sfx && api.sfx.play('tekiah'); api.after(900, () => api.sfx && api.sfx.play('teruah')); api.after(1700, () => api.sfx && api.sfx.play('tekiah'));
        W && W.av('trumpets');
        api.after(2400, circle);
      }, 'gold');
    }
    // the circuit: drag round the altar, or hold
    let ang = 0, laps = 0, last = null, walker = null, holdBtn = null, H = null, sayEl = null;
    function circle() {
      phase = 3;
      walker = svgEl('circle', { r: 9, class: 'av-sun' }, svg);
      sayEl = svgEl('text', { x: 180, y: 250, class: 'av-say small', 'text-anchor': 'middle' }, svg);
      const put = () => { walker.setAttribute('cx', 180 + Math.cos(ang) * 100); walker.setAttribute('cy', 130 + Math.sin(ang) * 100); };
      put();
      const onMove = (e) => {
        if (phase !== 3 || !(e.buttons || e.pointerType === 'touch')) return;
        const r = svg.getBoundingClientRect();
        const a = Math.atan2(((e.clientY - r.top) / r.height) * 260 - 130, ((e.clientX - r.left) / r.width) * 360 - 180);
        if (last !== null) { let d = a - last; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; if (Math.abs(d) < 1) advance(Math.abs(d)); }
        last = a;
      };
      svg.addEventListener('pointermove', onMove);
      svg.addEventListener('pointerdown', () => { last = null; });
      holdBtn = api.button('החזק כדי להקיף', () => {}, 'hold');
      H = api.hold(holdBtn);
      api.loop((dt) => { if (phase === 3 && H.held()) advance(dt * 2.4); });
      api.hint(LAPS > 1 ? 'הושענא רבה: הקף את המזבח שבע פעמים — גרור סביבו או החזק.' : 'הקף את המזבח פעם אחת — גרור את האצבע סביבו, או החזק.');
      function advance(d) {
        ang += d; put();
        if (ang >= (laps + 1) * Math.PI * 2) {
          laps++;
          sayEl.textContent = laps % 2 ? 'אָנָּא ה׳ הוֹשִׁיעָה נָּא' : 'אָנָּא ה׳ הַצְלִיחָה נָּא';
          api.sfx && api.sfx.play('chime', { n: 3 + laps });
          W && W.av('pilgrims', 6);
          if (laps >= LAPS) {
            phase = 4; holdBtn.disabled = true;
            if (LAPS > 1) sayEl.textContent = 'יֹפִי לְךָ מִזְבֵּחַ, יֹפִי לְךָ מִזְבֵּחַ';
            api.sparkle(50, 50, 14);
            api.done({ text: LAPS > 1 ? 'שבע הקפות — ובשעת פטירתן: "יפי לך מזבח".' : 'הקפת את המזבח. מחר — שוב, ובהושענא רבה — שבע פעמים.', linger: 1500 });
          }
        }
      }
    }
    api.solver(async () => {
      for (const s of spotEls) { press(s, 'down'); await api.wait(30); }
      while (!blowBtn) await api.wait(30);
      press(blowBtn);
      while (!holdBtn) await api.wait(30);
      press(holdBtn, 'down');
    });
  },
};
