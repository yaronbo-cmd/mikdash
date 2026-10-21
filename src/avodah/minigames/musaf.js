/* ─────────────────────────────────────────────────────────────────────────────
 * musaf.js: the day's musaf (Numbers 28–29; calendar_offerings.json; Zevachim 10:1).
 * 1. When several musafim fall on one day, "כל התדיר מחברו קודם": put them in order (Tamid → Shabbat → Rosh
 *    Chodesh → the festival).
 * 2. Count the animals: for each kind, pick today's number. On Sukkot the bulls go down day by day, 13 … 7.
 * A weekday has no musaf: practice then uses the coming Shabbat's.
 * ──────────────────────────────────────────────────────────────────────────── */
import { press, esc, svgEl } from './common.js';
import { hall, beast } from './art.js';
import { MUSAF, gap, gapLine } from '../data.js';

/** The Levites' song at the musaf (avodah_gaps.json): on the days of Chol HaMoed Sukkot, the day's psalm (Sukkah 55a —
 *  needs_check: that it is the musaf's song is inferred from the passage); on Shabbat, a sixth of Haazinu (Rosh Hashanah 31a).
 *  Rosh Chodesh: not stated in the Talmud (the content note) — nothing is shown. → a line for api.cite, or null. */
function musafSong(ctx, list) {
  const th = (ctx && ctx.theme) || {}, suk = th.sukkot, shabbat = !!(th.info && th.info.isShabbat);
  if (suk && !shabbat && suk.day >= 2 && suk.day <= 7) {
    const g = gap('shir_musaf_days'), ps = g && Array.isArray(g.psalms) ? g.psalms.find((p) => p && p.day === suk.day - 1) : null;
    if (ps && ps.incipit_he) return { quote: ps.incipit_he, source: `${g.source} · ${ps.psalm || ''} · חול המועד, היום ה${['', 'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'][suk.day - 1]}`, needsCheck: g.needs_check };
  }
  if (list.some((m) => m.day_id === 'shabbat')) return gapLine('shir_shabbat_musaf_mincha');
  return null;
}

const KINDS = [['bulls', 'פרים'], ['rams', 'אילים'], ['lambs', 'כבשים'], ['goats', 'שעירים']];
const ONE = { bulls: 'bull', rams: 'ram', lambs: 'lamb', goats: 'goat' };

export const musaf = {
  id: 'musaf', title: 'קרבן מוסף', kicker: 'המזבח',
  intro: 'מוסף היום בא אחרי התמיד של שחר. סדר את המוספים — התדיר קודם — וספור את הבהמות.',
  introAgain: 'סדר את המוספים — התדיר קודם — וספור.',
  stage(W, ctx) {
    W.look('altarTop', 1500);
    const n = ((ctx && ctx.theme && ctx.theme.musaf) || []).reduce((a, m) => a + (m.bulls || 0) + (m.rams || 0) + (m.lambs || 0) + (m.goats || 0), 0);
    if (n) W.avSub('pens', 'fill', n);
  },
  play(api) {
    const { ctx } = api;
    let list = (ctx.theme && ctx.theme.musaf) || [];
    if (!list.length) list = MUSAF.filter((m) => m.day_id === 'shabbat');
    // the picture: the kind being counted, then the herd once the number is right (calm, standing animals)
    const pic = api.svg('0 0 360 118', 'בהמות המוסף');
    hall(pic, 360, 118, { wall: 30 });
    const herd = svgEl('g', {}, pic);
    const ask = svgEl('text', { x: 236, y: 58, class: 'av-count', 'text-anchor': 'middle' }, pic);
    function showOne(k) { herd.innerHTML = ''; beast(herd, ONE[k], 170, 66, 2.1); ask.textContent = '?'; }
    function showHerd(k, n) {
      herd.innerHTML = ''; ask.textContent = '';
      const rows = Math.ceil(n / 7), rowH = Math.min(44, 88 / rows), sc = Math.min(1.25, rowH / 30);
      for (let i = 0; i < n; i++) {
        const r = Math.floor(i / 7), c = i % 7, inRow = Math.min(7, n - r * 7);
        beast(herd, ONE[k], 180 + (c - (inRow - 1) / 2) * 46, 40 + r * rowH + (rows === 1 ? 20 : 0), sc);
      }
    }
    const box = document.createElement('div');
    box.className = 'av-quiz';
    api.play.appendChild(box);
    const total = list.reduce((a, m) => { for (const [k] of KINDS) a[k] = (a[k] || 0) + (m[k] || 0); return a; }, {});
    let phase = list.length > 1 ? 1 : 2, got = 0;
    // 1: order
    const orderItems = [{ id: 'tamid', he: 'עולת התמיד (כבר הוקרבה)' }, ...list.map((m) => ({ id: m.day_id, he: `מוסף ${m.name_he}` }))];
    let nextIx = 1;
    function orderPhase() {
      const shuffled = orderItems.slice(1).sort(() => Math.random() - 0.5);
      box.innerHTML = `<p class="av-q">מה קודם? (התמיד כבר הוקרב)</p><div class="av-opts">${shuffled.map((o) => `<button type="button" class="av-opt" data-id="${o.id}">${esc(o.he)}</button>`).join('')}</div>`;
      box.querySelectorAll('.av-opt').forEach((b) => b.addEventListener('click', () => {
        if (b.classList.contains('ok')) return;
        if (b.dataset.id !== orderItems[nextIx].id) { api.miss('"כל התדיר מחברו קודם את חברו": מוספי שבת לפני מוספי ראש חודש, ומוספי ראש חודש לפני המועד (זבחים י, א).'); return; }
        b.classList.add('ok'); nextIx++; api.sfx && api.sfx.play('coin');
        if (nextIx >= orderItems.length) { phase = 2; api.after(400, countPhase); }
      }));
      api.hint('סדר את המוספים של היום.');
    }
    // 2: counts
    const kinds = KINDS.filter(([k]) => total[k] > 0);
    let ki = 0;
    function countPhase() {
      if (ki >= kinds.length) {
        const s = list.map((m) => `${m.name_he}: ${KINDS.filter(([k]) => m[k]).map(([k, he]) => `${m[k]} ${he}`).join(', ')}`).join(' · ');
        const song = musafSong(ctx, list);
        if (song) api.cite(song);
        api.done({ text: `מוסף היום — ${s}.${song ? ' ובשעת הנסכים — שיר המוסף של הלויים.' : ''}`, linger: song ? 2600 : 1600 });
        return;
      }
      const [k, he] = kinds[ki], n = total[k];
      const opts = [...new Set([n, n + 1, Math.max(1, n - 1), n + 2].filter((x) => x > 0))].slice(0, 3).sort((a, b) => a - b);
      showOne(k);
      box.innerHTML = `<p class="av-q">כמה ${he} היום${list.length > 1 ? ' (בכל המוספים)' : ''}?</p><div class="av-opts">${opts.map((o) => `<button type="button" class="av-opt num" data-n="${o}">${o}</button>`).join('')}</div>`;
      box.querySelectorAll('.av-opt').forEach((b) => b.addEventListener('click', () => {
        if (+b.dataset.n !== n) {
          const src = list.map((m) => `${m.name_he}: ${m[k] || 0} ${he} (${m.source})`).join(' · ');
          api.miss(src);
          return;
        }
        b.classList.add('ok'); got++; api.sfx && api.sfx.play('chime', { n: got + 2 });
        showHerd(k, n);
        ki++; api.after(900, countPhase);
      }));
      const suk = list.find((m) => /^sukkot_/.test(m.day_id));
      api.hint(suk && k === 'bulls' ? 'בסוכות הפרים מתמעטים מיום ליום: שלושה עשר ביום הראשון…' : 'ספור לפי הפסוקים של היום.');
    }
    // while ordering: one of each kind the day's musaf brings
    kinds.forEach(([k], i) => beast(herd, ONE[k], 180 + (i - (kinds.length - 1) / 2) * 78, 64, 1.5));
    if (phase === 1) orderPhase(); else countPhase();
    api.solver(async () => {
      while (phase === 1) { const b = box.querySelector(`.av-opt[data-id="${orderItems[nextIx] && orderItems[nextIx].id}"]`); if (b) press(b); await api.wait(60); }
      while (ki < kinds.length) { const b = box.querySelector(`.av-opt[data-n="${total[kinds[ki][0]]}"]`); if (b && !b.classList.contains('ok')) press(b); await api.wait(60); }
    });
  },
};
