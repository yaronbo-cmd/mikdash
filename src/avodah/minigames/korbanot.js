/* ─────────────────────────────────────────────────────────────────────────────
 * korbanot.js: the pilgrims' offerings — the repeatable core loop (Zevachim 5; korbanot.json).
 * A pilgrim comes with an offering; route it: where it is slaughtered (north / anywhere in the azara), how its
 * blood is given (four gifts on four horns / two gifts that are four / one gift), who eats it and where, and until
 * when. A wrong choice opens the Mishnah's line for that offering; the player tries again at once.
 * The answers are derived from the content fields, so the game follows the content as it is corrected.
 * ──────────────────────────────────────────────────────────────────────────── */
import { svgEl, press, esc } from './common.js';
import { KORBANOT } from '../data.js';

const has = (s, re) => re.test(s || '');
/** classify one offering from its content fields → {place, blood, eat, time} (null = not asked) */
export function classify(k) {
  const place = has(k.slaughter_place, /בצפון/) ? 'north' : has(k.slaughter_place, /בכל מקום/) ? 'any' : null;
  const blood = has(k.blood_application, /ארבע מתנות על ארבע/) ? 'four' : has(k.blood_application, /שתי מתנות שהן ארבע/) ? 'two' : has(k.blood_application, /מתנה אחת|זריקה אחת/) ? 'one' : null;
  const eat = has(k.eaten_by, /אינה נאכלת|אינם נאכלים/) ? 'none' : has(k.eaten_by, /זכרי כהונה/) ? 'kohanim' : has(k.eaten_by, /לכל אדם/) ? 'all' : has(k.eaten_by, /^לכהנים/) ? 'kohanim-city' : null;
  const time = has(k.eating_time, /שני ימים/) ? 'two-days' : has(k.eating_time, /יום ולילה/) ? 'day-night' : null;
  return { place, blood, eat, time };
}
const Q = {
  place: { q: 'איפה שוחטים אותו?', a: { north: 'בצפון המזבח', any: 'בכל מקום בעזרה' } },
  blood: { q: 'איך נותנים את הדם?', a: { four: 'ארבע מתנות על ארבע הקרנות', two: 'שתי מתנות שהן ארבע', one: 'מתנה אחת, כנגד היסוד' } },
  eat: { q: 'מי אוכל ואיפה?', a: { none: 'אינו נאכל — כולו לאשים', kohanim: 'זכרי כהונה, בעזרה', all: 'כל אדם, בכל העיר', 'kohanim-city': 'הכהנים, בכל העיר' } },
  time: { q: 'עד מתי?', a: { 'day-night': 'ליום ולילה, עד חצות', 'two-days': 'לשני ימים ולילה אחד' } },
};
/** the offerings a pilgrim may bring (not the Yom Kippur / burnt bulls, not the Pesach, not meal or bird offerings) */
export function pilgrimOfferings() {
  return KORBANOT.filter((k) => !/yom_hakippurim|nisrafim|pesach|haof|mincha|tzibbur/.test(k.id)).filter((k) => { const c = classify(k); return c.place && c.blood; });
}
const SAY = { chatat: 'חטאת', olah: 'עולה', asham: 'אשם', todah: 'תודה', eil_nazir: 'איל נזיר', shelamim: 'שלמים', bechor: 'בכור', maaser: 'מעשר בהמה' };
const WHO = ['עולה רגל מן הגליל', 'אשה מיריחו', 'נזיר שסיים את נזירותו', 'רועה מבית לחם', 'סוחר מלוד', 'משפחה מחברון'];

export const korbanot = {
  id: 'korbanot', title: 'קרבנות העולים לרגל', kicker: 'העזרה',
  intro: 'עולי הרגל מגיעים עם קרבנותיהם. כוון כל קרבן: מקום השחיטה, מתן הדם, מי אוכל — ועד מתי.',
  introAgain: 'כוון כל קרבן: שחיטה, דם, מי אוכל ועד מתי.',
  stage(W) { W.look('slaughter', 1500); W.av('pilgrims', 4); },
  play(api) {
    const W = api.world;
    const list = pilgrimOfferings();
    const wave = [];
    const pool = list.slice().sort(() => Math.random() - 0.5);
    // a wave of four: prefer different kinds; the nazir brings his ram
    for (let k = 0; k < 4 && pool.length; k++) wave.push(pool[k % pool.length]);
    const svg = api.svg('0 0 360 120', 'עולה רגל ובידו קרבן');
    const box = document.createElement('div');
    box.className = 'av-quiz';
    api.play.appendChild(box);
    let i = 0, step = 0, handle = null, right = 0, wrong = 0;
    const keys = (c) => ['place', 'blood', 'eat', 'time'].filter((q) => c[q]);
    function pilgrim() {
      svg.innerHTML = '';
      const k = wave[i];
      svgEl('rect', { x: 0, y: 0, width: 360, height: 120, class: 'av-court' }, svg);
      const p = svgEl('g', { transform: 'translate(300 70)', class: 'av-pilgrim' }, svg);
      svgEl('path', { d: 'M-9 30 L-7 2 Q0 -3 7 2 L9 30 Z', class: 'av-cloak' }, p);
      svgEl('circle', { cx: 0, cy: -5, r: 5.2, class: 'av-face' }, p);
      svgEl('ellipse', { cx: -30, cy: 22, rx: 16, ry: 10, class: /bull|par/.test(k.id) ? 'av-hide' : 'av-wool' }, p);
      svgEl('text', { x: 250, y: 36, class: 'av-lab big', 'text-anchor': 'end' }, svg).textContent = `${WHO[i % WHO.length]}:`;
      svgEl('text', { x: 250, y: 62, class: 'av-say small', 'text-anchor': 'end' }, svg).textContent = `"הבאתי ${SAY[k.id] || k.name_he.replace(/\s*\(.*\)/, '')}"`;
      svgEl('text', { x: 16, y: 110, class: 'av-lab small' }, svg).textContent = `${i + 1}/${wave.length} · ${k.category}`;
      handle = W ? W.av('pilgrim', { id: k.id }) : null;
      api.sfx && api.sfx.play('crowd');
      step = 0;
      ask();
    }
    function ask() {
      const k = wave[i], c = classify(k), qs = keys(c);
      if (step >= qs.length) { next(); return; }
      const q = qs[step], want = c[q];
      const opts = Object.keys(Q[q].a);
      box.innerHTML = `<p class="av-q">${esc(Q[q].q)}</p><div class="av-opts">${opts.map((o) => `<button type="button" class="av-opt" data-o="${o}">${esc(Q[q].a[o])}</button>`).join('')}</div>`;
      box.querySelectorAll('.av-opt').forEach((b) => b.addEventListener('click', () => {
        if (b.dataset.o === want) {
          b.classList.add('ok'); right++;
          api.sfx && api.sfx.play('coin');
          api.float('✓', 50, 30, 'ok');
          step++;
          api.after(380, ask);
        } else {
          wrong++;
          const field = { place: k.slaughter_place, blood: k.blood_application, eat: `${k.eaten_by}${k.eating_place && k.eating_place !== '—' ? ' — ' + k.eating_place : ''}`, time: k.eating_time }[q];
          api.miss(`${k.name_he}: ${field} (${k.source.split(';')[0]}).`);
          b.disabled = true;
        }
      }));
    }
    function next() {
      api.sparkle(80, 50, 8);
      api.hint(`${wave[i].name_he} — הכל כשורה.`, 'ok');
      i++;
      if (i >= wave.length) { box.innerHTML = ''; api.done({ text: `ארבעה עולי רגל שמחים. ${right} תשובות ישרות${wrong ? `, ${wrong} תיקונים` : ''}.`, score: right, pilgrims: wave.length, offerings: [...new Set(wave.map((k) => k.id))], linger: 1200 }); return; }
      api.after(700, pilgrim);
    }
    api.hint('ענה על כל שאלה. טעות פותחת את לשון המשנה.');
    pilgrim();
    api.solver(async () => {
      while (i < wave.length) {
        const k = wave[i], c = classify(k), qs = keys(c);
        if (step < qs.length) { const b = box.querySelector(`.av-opt[data-o="${c[qs[step]]}"]`); if (b && !b.classList.contains('ok')) press(b); }
        await api.wait(60);
      }
    });
  },
};
