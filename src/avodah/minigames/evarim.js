/* ─────────────────────────────────────────────────────────────────────────────
 * evarim.js: the limbs to the kevesh (Tamid 4:2–3).
 * 1. "נמצאו כלן עומדין בשורה והאברים בידם": put the nine carriers in the Mishnah's order (head and right leg ·
 *    the two forelegs · the tail and left leg · the breast and neck · the two flanks · the innards in a bowl with
 *    the lower legs · the fine flour · the chavitin · the wine). The player's own portion is marked.
 * 2. "ונתנום מחצי הכבש ולמטה במערבו": the lower half of the ramp, on its west side.
 * 3. "ומלחום": salt them.
 * From the tier "בקי" (gctx.tier ≥ 3) the row is from memory: a wrong carrier is not told who comes next.
 * ──────────────────────────────────────────────────────────────────────────── */
import { svgEl, press } from './common.js';
import { CARRIERS } from '../data.js';
import { KEVESH, LEVEL } from '../../places.js';
/** height of the kevesh at z (it rises from the floor at its foot to the altar top) */
const keveshY = (z) => LEVEL.altarTop - ((z - KEVESH.zTop) / (KEVESH.zFoot - KEVESH.zTop)) * (LEVEL.altarTop - LEVEL.azara);

// low, from the south, along the ramp: its upper half, the altar's edge and fire above it (a higher camera saw only the altar's top)
const RAMP_SHOT = { p: [(KEVESH.x0 + KEVESH.x1) / 2, 29, 66], t: [(KEVESH.x0 + KEVESH.x1) / 2, 27.5, 6] };

export const evarim = {
  id: 'evarim', title: 'האברים בשורה ועל הכבש', kicker: 'בין בית המטבחיים לכבש',
  intro: 'תשעה כהנים עומדים בשורה, כל אחד עם חלקו. סדר אותם כסדר המשנה, הנח על הכבש — ומלח.',
  introAgain: 'תשעה בשורה כסדר המשנה, על הכבש — ומלח.',
  // (QA P2-6: the close kevesh shot showed a kohen's back over paving while the row is ordered in the card) — up the
  // ramp from the south to the altar and its fire while the row is ordered; the close kevesh shot for the places on it
  stage(W) { W.look(RAMP_SHOT, 1600); W.kohen('player').carry('limb'); },
  play(api) {
    const { ctx } = api, W = api.world;
    const mine = ctx.role && ctx.role.limb ? ctx.role.limb : 0;          // 1..9 when his role is a portion
    const pro = api.tier >= 3;                                           // the order from memory
    const svg = api.svg('0 0 360 150', 'השורה של תשעת הכהנים');
    const slots = [];
    for (let k = 0; k < 9; k++) {
      const x = 340 - k * 38;                                          // RTL: the first stands on the right
      svgEl('rect', { x: x - 16, y: 30, width: 32, height: 70, rx: 6, class: 'av-slot' }, svg);
      svgEl('text', { x, y: 22, class: 'av-lab', 'text-anchor': 'middle' }, svg).textContent = String(k + 1);
      slots.push({ x, t: svgEl('text', { x, y: 70, class: 'av-lab small', 'text-anchor': 'middle' }, svg) });
    }
    const tray = document.createElement('div');
    tray.className = 'av-tray';
    api.play.appendChild(tray);
    const order = CARRIERS.map((c) => c.n);
    const shuffled = CARRIERS.slice().sort(() => Math.random() - 0.5);
    let next = 1, phase = 1;
    const chips = [];
    for (const c of shuffled) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'av-chip' + (c.n === mine ? ' mine' : '');
      b.innerHTML = `${c.short}${c.n === mine ? ' <small>שלך</small>' : ''}`;
      b.addEventListener('click', () => pick(c, b));
      tray.appendChild(b);
      chips.push({ c, b });
    }
    function pick(c, b) {
      if (phase !== 1 || b.disabled) return;
      if (c.n !== next) {
        if (pro) { api.miss(`לא ${c.short} — מן הראש ועד היין, כסדר המשנה (תמיד ד, ג).`); return; }
        api.miss(`לא ${c.short}. ${next === 1 ? 'הראשון בשורה' : `ה${['', 'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שביעי', 'שמיני', 'תשיעי'][next]}`}: ${CARRIERS[next - 1].he}.`); return;
      }
      b.disabled = true; b.classList.add('set');
      const s = slots[next - 1];
      s.t.textContent = c.short.split(' ')[0];
      svgEl('circle', { cx: s.x, cy: 88, r: 6, class: c.n === mine ? 'av-dot mine' : 'av-dot' }, svg);
      api.sfx && api.sfx.play('chime', { n: next });
      next++;
      if (next > 9) { phase = 2; api.after(350, keveshPhase); }
      else api.hint(`${next - 1}/9 — הבא בשורה?`);
    }
    api.hint(pro ? 'מן הזיכרון: הקש על החלקים כסדר השורה.' : 'מי ראשון בשורה? הקש על החלקים לפי הסדר.');
    let zones = null, saltBtn = null;
    function keveshPhase() {
      tray.remove();
      svg.setAttribute('viewBox', '0 0 360 250');
      svg.innerHTML = '';
      svgEl('rect', { x: 0, y: 0, width: 360, height: 250, class: 'av-court' }, svg);
      svgEl('rect', { x: 120, y: 10, width: 120, height: 40, class: 'av-altartop' }, svg);
      svgEl('text', { x: 180, y: 36, class: 'av-lab', 'text-anchor': 'middle' }, svg).textContent = 'המזבח';
      // the ramp, plan view, running south (down); split into west/east × upper/lower halves
      zones = {};
      for (const [k, x, y, he] of [['uw', 130, 50, 'עליון מערבי'], ['ue', 180, 50, 'עליון מזרחי'], ['lw', 130, 145, 'תחתון מערבי'], ['le', 180, 145, 'תחתון מזרחי']]) {
        const z = svgEl('rect', { x, y, width: 50, height: 95, class: 'av-rampzone', tabindex: 0 }, svg);
        z.addEventListener('pointerdown', () => place(k));
        zones[k] = z;
        svgEl('text', { x: x + 25, y: y + 52, class: 'av-lab small', 'text-anchor': 'middle' }, svg).textContent = he;
      }
      svgEl('line', { x1: 125, y1: 145, x2: 235, y2: 145, class: 'av-mid' }, svg);
      svgEl('text', { x: 240, y: 149, class: 'av-lab small' }, svg).textContent = 'חצי הכבש';
      svgEl('text', { x: 20, y: 120, class: 'av-lab' }, svg).textContent = '→ מערב';
      svgEl('text', { x: 340, y: 120, class: 'av-lab', 'text-anchor': 'end' }, svg).textContent = 'מזרח ←';
      api.hint('היכן מניחים את האברים על הכבש?');
      const T3 = api.three;
      if (T3) {
        T3.frame('kevesh', 1000);
        const xw = KEVESH.x0 + 4, xe = KEVESH.x1 - 4, zu = KEVESH.zTop + 8, zl = KEVESH.zFoot - 8;
        T3.targets([['uw', xw, zu, 'עליון מערבי'], ['ue', xe, zu, 'עליון מזרחי'], ['lw', xw, zl, 'תחתון מערבי'], ['le', xe, zl, 'תחתון מזרחי']]
          .map(([k, x, z, he]) => ({ key: `kevesh-${k}`, at: [x, keveshY(z) + 0.4, z], label: he, onTap: () => place(k) })));
      }
    }
    function place(k) {
      if (phase !== 2) return;
      if (k !== 'lw') { api.miss('"מחצי הכבש ולמטה במערבו" (תמיד ד, ג).'); return; }
      phase = 3;
      zones.lw.classList.add('set');
      for (let i = 0; i < 9; i++) svgEl('rect', { x: 136 + (i % 3) * 13, y: 160 + Math.floor(i / 3) * 22, width: 10, height: 14, rx: 3, class: 'av-limb' }, svg);
      W && W.av('limbs', 'kevesh'); W && W.kohen('player').carry(null);
      saltBtn = api.button('מלח את האברים', () => {
        if (phase !== 3) return;
        phase = 4;
        for (let i = 0; i < 16; i++) svgEl('circle', { cx: 134 + Math.random() * 42, cy: 156 + Math.random() * 70, r: 1.4, class: 'av-salt' }, svg);
        W && W.av('limbs', 'salt');
        api.sfx && api.sfx.play('chime', { n: 6 });
        api.done({ text: '"ומלחום". הכהנים יורדים ללשכת הגזית לקרוא את שמע.', linger: 900 });
      }, 'gold');
      api.hint('"ומלחום" — מלח.', 'ok');
      if (api.three) api.three.targets([{ key: 'salt', at: [KEVESH.x0 + 4, keveshY(KEVESH.zFoot - 8) + 0.6, KEVESH.zFoot - 8], label: 'מלח', onTap: () => saltBtn.click() }]);
    }
    api.solver(async () => {
      for (const n of order) { const c = chips.find((x) => x.c.n === n); press(c.b); await api.wait(40); }
      while (!zones) await api.wait(40);
      await api.wait(60);
      api.hit('kevesh-lw', zones.lw, 'down');
      while (!saltBtn) await api.wait(40);
      await api.wait(40);
      api.hit('salt', saltBtn);
    });
  },
};
