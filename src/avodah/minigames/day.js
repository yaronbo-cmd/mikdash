/* ─────────────────────────────────────────────────────────────────────────────
 * day.js: ── avoda12 ── the day in detail (wave 12; the owner, 29.9: "בשלב ב' של פעולות היום נצטרך לתת יותר פירוט").
 * Five short moments from his services table (docs/avodot/rows.json, the daily rows marked part/no), each with its source
 * (content/avodah_day.json, drafts), each a tap, a choice or a small game — and the kohen walks to each place:
 *   chavitin  the High Priest's griddle-cakes: twelve, one at a time, taken off "בין בשל ונא", then each split in two —
 *             half in the morning, half in the evening (Rambam, Maaseh HaKorbanot 13:2–4; Tamid 1:3; Menachot 4:5)
 *             · rows a006, a036, a056. In the afternoon chain: the kept half is carried up.
 *   shaarim   the three blasts at the opening of the gates (Sukkah 5:5) · a017
 *   kelim     the 93 vessels of silver and gold from the chamber of vessels (Tamid 3:4) · a016
 *   machar    tomorrow's lamb: three new lambs are checked in the evening, two go in, six checked stay (Tamid 3:4 "מבקר
 *             מבערב"; Arachin 2:5; Bekhorot 6:1) · a057
 *   neilah    the seven gates of the azara closed (Middot 1:4; Shekalim 5:1 "בן גבר על נעילת שערים"), the keys to the elders
 *             in Beit HaMoked (Tamid 1:1) — and the fire on the altar burns on all night (Lev. 6:6) · a058, a061
 * No gore: nothing here touches the slaughter. Every tap target is ≥ 44 px (r ≥ 22 in a 360-wide picture).
 * ──────────────────────────────────────────────────────────────────────────── */
import { svgEl, press, kohenFig } from './common.js';
import { dayLine, BLEMISHES } from '../data.js';
import { hall, beast, person } from './art.js';
import { KEVESH, LAMBS_CHAMBER_DOOR, GATES } from '../../places.js';

const CSS = `
.av-mg .av-d-hit{fill:transparent;cursor:pointer}
.av-mg .av-d-tgt{cursor:pointer}
.av-mg .av-d-tgt:focus{outline:none}
.av-mg .av-d-tgt:focus .av-d-ring,.av-mg .av-d-tgt.on .av-d-ring{stroke:#E8B94A;stroke-width:3}
.av-mg .av-d-ring{fill:none;stroke:rgba(232,185,74,.55);stroke-width:2;stroke-dasharray:4 3}
.av-mg .av-d-griddle{fill:#4A4038;stroke:#2A231D;stroke-width:1.5}
.av-mg .av-d-coal{fill:#E8591F;filter:drop-shadow(0 0 4px #FF7A1A)}
.av-mg .av-d-board{fill:#C9A26B;stroke:#8A6A3F;stroke-width:1}
.av-mg .av-d-cake{stroke:#9A7240;stroke-width:1}
.av-mg .av-d-half{stroke:#9A7240;stroke-width:.8;transition:transform .45s ease-in;transform-box:fill-box;transform-origin:50% 50%}
.av-mg .av-d-tray{fill:#D8C6A0;stroke:#A8916A;stroke-width:1.2}
.av-mg .av-d-bar{fill:#3B2E1E}
.av-mg .av-d-zone{fill:#E0A94A;opacity:.85}
.av-mg .av-d-needle{fill:#FFF3D6;stroke:#3B2A08;stroke-width:1}
.av-mg .av-d-sky{fill:#F5C98A}
.av-mg .av-d-wall{fill:#D8C194;stroke:#B99E70;stroke-width:1}
.av-mg .av-d-leaf{fill:#B8862A;stroke:#7A5A1A;stroke-width:1.2;transition:transform .8s ease-out;transform-box:fill-box}
.av-mg .av-d-leaf.l{transform-origin:0% 50%}
.av-mg .av-d-leaf.r{transform-origin:100% 50%}
.av-mg .av-d-light{fill:#FFE9B0;opacity:0;transition:opacity .8s}
.av-mg .av-d-shelf{fill:#8C6A3F;stroke:#5A4226;stroke-width:1}
.av-mg .av-d-silver{fill:#D9DEE3;stroke:#7C8792;stroke-width:.8}
.av-mg .av-d-goldv{fill:#E9C35E;stroke:#8A6420;stroke-width:.8}
.av-mg .av-d-fly{transition:transform .5s ease-in,opacity .5s}
.av-mg .av-d-plan{fill:#E8DABF;stroke:#8A7350;stroke-width:2}
.av-mg .av-d-gate{fill:#B8862A;stroke:#6E4A1A;stroke-width:1;transition:transform .5s}
.av-mg .av-d-gate.open{fill:#F4ECDA}
.av-mg .av-d-key{fill:#C9A24A;stroke:#6E4A1A;stroke-width:1}
.av-mg .av-d-dim{fill:#0E1222;opacity:0;transition:opacity 1.4s;pointer-events:none}
.av-mg .av-d-mark{fill:none;stroke:#A3261F;stroke-width:1.6;stroke-linecap:round}
.av-mg .av-d-scratch{fill:none;stroke:#C9A07A;stroke-width:1;stroke-linecap:round}
`;
function ensureCss() {
  if (typeof document === 'undefined' || document.getElementById('av-day-css')) return;
  const s = document.createElement('style'); s.id = 'av-day-css'; s.textContent = CSS; document.head.appendChild(s);
}
/** a tap target in the picture: a group with a dashed ring and a transparent hit circle (r ≥ 22 → ≥ 44 px) */
function target(svg, x, y, r, label, onTap) {
  const g = svgEl('g', { class: 'av-d-tgt', tabindex: '0', role: 'button', 'aria-label': label }, svg);
  svgEl('circle', { cx: x, cy: y, r, class: 'av-d-ring' }, g);
  const hit = svgEl('circle', { cx: x, cy: y, r: Math.max(22, r), class: 'av-d-hit av-hit' }, g);
  g.addEventListener('pointerdown', (e) => { e.preventDefault(); onTap(g); });
  return { g, hit };
}
const walk = (W, to) => { try { return W.kohen('player', { garments: 'kohen' }).walkTo(to); } catch (e) { return null; } };

/* ═════════ the chavitin (Rambam, Maaseh HaKorbanot 13:2–4) ═════════ */
const CHAV_SHOT = { p: [-30, 26, 36], t: [0, 18, 10] };   // the chavitin makers' chamber, left of Nikanor (Middot 1:4)
export const chavitin = {
  id: 'chavitin', title: 'החביתין', kicker: 'לשכת עושי החביתין',
  intro: '"העמידו עושי חבתים לעשות חבתים": שתים עשרה חלות, אחת אחת על המחבת בשמן — והורד כל אחת כשהיא "בין בשל ונא".',
  introAgain: 'החביתין: הורד כל חלה "בין בשל ונא", וחלק לשניים.',
  stage(W, ctx) {
    if (ctx && ctx.segment === 'erev') { W.look('kevesh', 1500); return walk(W, [(KEVESH.x0 + KEVESH.x1) / 2, KEVESH.zFoot - 2]); }
    W.time('night'); W.look(CHAV_SHOT, 1500); return walk(W, [-5, 12]);
  },
  play(api) {
    ensureCss();
    const { ctx } = api, W = api.world;
    if (ctx.segment === 'erev') return evening(api, W);
    const svg = api.svg('0 0 360 230', 'המחבת, החלות והטסים');
    hall(svg, 360, 230, { wall: 40 });
    // the board of twelve cakes (2 × 6), the griddle over the coals, the two trays: "בבוקר" and "בערב"
    svgEl('rect', { x: 12, y: 52, width: 196, height: 86, rx: 8, class: 'av-d-board' }, svg);
    const cakes = [];
    for (let i = 0; i < 12; i++) {
      const x = 30 + (i % 6) * 32, y = 74 + Math.floor(i / 6) * 42;
      const c = svgEl('circle', { cx: x, cy: y, r: 13, class: 'av-d-cake', fill: '#F4E6C4' }, svg);
      cakes.push({ x, y, el: c, u: 0, done: false, split: false });
    }
    for (let k = 0; k < 5; k++) svgEl('circle', { cx: 262 + k * 10, cy: 132, r: 4, class: 'av-d-coal' }, svg);
    svgEl('ellipse', { cx: 282, cy: 116, rx: 50, ry: 14, class: 'av-d-griddle' }, svg);
    svgEl('text', { x: 282, y: 96, class: 'av-lab', 'text-anchor': 'middle' }, svg).textContent = 'המחבת';
    const pan = svgEl('circle', { cx: 282, cy: 112, r: 0, class: 'av-d-cake', fill: '#F4E6C4' }, svg);
    // the doneness bar: raw → "בין בשל ונא" → overdone
    svgEl('rect', { x: 232, y: 146, width: 100, height: 10, rx: 5, class: 'av-d-bar' }, svg);
    svgEl('rect', { x: 232 + 45, y: 146, width: 30, height: 10, class: 'av-d-zone' }, svg);
    svgEl('text', { x: 282, y: 170, class: 'av-lab small', 'text-anchor': 'middle' }, svg).textContent = 'בין בשל ונא';
    const needle = svgEl('rect', { x: 230, y: 142, width: 4, height: 18, rx: 2, class: 'av-d-needle' }, svg);
    const trays = [{ x: 60, he: 'בבוקר' }, { x: 160, he: 'בערב' }].map((t) => {
      svgEl('rect', { x: t.x - 44, y: 176, width: 88, height: 36, rx: 10, class: 'av-d-tray' }, svg);
      svgEl('text', { x: t.x, y: 225, class: 'av-lab small', 'text-anchor': 'middle' }, svg).textContent = t.he;
      return { ...t, n: 0 };
    });
    const count = svgEl('text', { x: 110, y: 46, class: 'av-lab', 'text-anchor': 'middle' }, svg);
    const color = (u) => (u < 0.45 ? '#F4E6C4' : u <= 0.75 ? '#E0A94A' : u < 1 ? '#A8682C' : '#6E4122');
    const BY_HAND = 4;
    let cur = 0, u = 0, phase = 'fry', fast = false;
    const takeBtn = api.button('הורד מן המחבת', () => take(), 'gold');
    takeBtn.dataset.k = 'take';
    api.cite(dayLine('chavitin_make'));
    const load = () => { const c = cakes[cur]; c.el.setAttribute('opacity', '0.25'); pan.setAttribute('r', 16); pan.setAttribute('fill', color(0)); u = 0; count.textContent = `חלה ${cur + 1} מתוך 12`; };
    load();
    api.hint('"ואחת אחת היו נעשות" — קולים על המחבת. הורד כשהחלה מזהיבה: לא נא ולא מבושלת הרבה.');
    function land(ok) {
      const c = cakes[cur];
      c.done = true; c.u = u; c.el.setAttribute('opacity', '1'); c.el.setAttribute('fill', color(Math.min(u, 0.99)));
      api.sfx && api.sfx.play(ok ? 'chime' : 'thud', { n: 3 + (cur % 4) });
      cur++;
      if (cur >= 12) { pan.setAttribute('r', 0); return splitPhase(); }
      if (cur === BY_HAND) { fast = true; takeBtn.disabled = true; api.hint('ועושי החביתין ממשיכים — אחת אחת, עד שתים עשרה.'); }
      load();
    }
    function take() {
      if (phase !== 'fry' || fast) return;
      if (u < 0.45) { api.hint('עוד נא — חכה שתזהיב.'); return; }
      if (u > 0.75) { api.miss('בישלת הרבה — "תפיני": בין בשל ונא (רמב״ם, מעשה הקרבנות יג, ג).'); land(false); return; }
      api.sparkle(282 / 360 * 100, 112 / 230 * 100, 8);
      api.hint('"תפיני" — בין בשל ונא!', 'ok');
      land(true);
    }
    api.loop((dt) => {
      if (phase !== 'fry') return;
      u = Math.min(1.05, u + dt * (fast ? 2.8 : 0.42));
      pan.setAttribute('fill', color(u));
      needle.setAttribute('x', 230 + Math.min(1, u) * 100);
      if (fast && u >= 0.6) land(true);
      else if (!fast && u >= 1.05) { api.miss('בישלת הרבה — "תפיני": בין בשל ונא.'); land(false); }
    });
    // the split: tap each cake — one half to "בבוקר", the other to "בערב" (Rambam 13:4)
    function splitPhase() {
      phase = 'split'; takeBtn.remove();
      count.textContent = 'חלק כל חלה לשתיים';
      api.cite(dayLine('chavitin_split'));
      api.hint('"חולק כל חלה וחלה לשנים באומד" — הקש על כל חלה: חצי לבוקר, חצי לערב.');
      cakes.forEach((c, i) => {
        const t = target(svg, c.x, c.y, 16, `חלה ${i + 1}`, () => splitOne(c, t));
        c.t = t;
      });
    }
    function splitOne(c, t) {
      if (c.split) return;
      c.split = true; t.g.remove();
      const fill = c.el.getAttribute('fill'); c.el.remove();
      trays.forEach((tr, k) => {
        const h = svgEl('path', { d: `M${c.x - 12} ${c.y} A12 12 0 0 ${k ? 0 : 1} ${c.x + 12} ${c.y} Z`, class: 'av-d-half', fill }, svg);
        const tx = tr.x - 30 + (tr.n % 6) * 12 - c.x, ty = 188 + Math.floor(tr.n / 6) * 12 - c.y;
        tr.n++;
        requestAnimationFrame(() => { h.style.transform = `translate(${tx}px, ${ty}px) scale(.5)`; });
      });
      api.sfx && api.sfx.play('ui');
      const left = cakes.filter((x) => !x.split).length;
      count.textContent = left ? `עוד ${left}` : 'שתים עשרה חלות — עשרים וארבעה חצאים';
      if (!left) api.done({ text: 'חצי מכל חלה — עכשיו, בתמיד של שחר; והחצי השני נשמר לבין הערביים: "ומקריב מחצה בבקר, ומחצה בין הערבים" (מנחות ד, ה).', linger: 1400 });
    }
    api.solver(async () => {
      while (phase === 'fry') {
        if (!fast && u >= 0.52 && u <= 0.7) press(takeBtn);
        await api.wait(10);
      }
      for (const c of cakes) { if (c.t) press(c.t.hit, 'down'); await api.wait(20); }
    });
    return null;
  },
};
/** the afternoon: the kept half of each cake goes up with the evening Tamid (Menachot 4:5) */
function evening(api, W) {
  const svg = api.svg('0 0 360 200', 'הטס של הערב');
  hall(svg, 360, 200, { wall: 40 });
  svgEl('rect', { x: 110, y: 96, width: 140, height: 60, rx: 12, class: 'av-d-tray' }, svg);
  for (let i = 0; i < 12; i++) { const x = 128 + (i % 6) * 21, y = 114 + Math.floor(i / 6) * 22; svgEl('path', { d: `M${x - 9} ${y} A9 9 0 0 1 ${x + 9} ${y} Z`, class: 'av-d-half', fill: '#E0A94A' }, svg); }
  svgEl('text', { x: 180, y: 84, class: 'av-lab', 'text-anchor': 'middle' }, svg).textContent = 'שנים עשר החצאים שנשמרו מן הבוקר';
  const meter = document.createElement('div');
  meter.className = 'av-meter'; meter.innerHTML = '<i></i><span>לכבש</span>';
  api.controls.appendChild(meter);
  const btn = api.button('החזק כדי להעלות', () => {}, 'gold hold');
  btn.dataset.k = 'carry';
  const H = api.hold(btn);
  let u = 0, fin = false;
  api.hint('החצי השני של החביתין — עם התמיד של בין הערביים. החזק כדי להעלות אותו לכבש.');
  api.cite(dayLine('chavitin_split'));
  api.loop((dt) => {
    if (fin || !H.held()) return;
    u = Math.min(1, u + dt * 0.7);
    meter.querySelector('i').style.width = `${Math.round(u * 100)}%`;
    if (u < 1) return;
    fin = true; btn.remove(); meter.remove();
    W && W.kohen('player').carry(null);
    api.done({ text: '"ומקריב מחצה בבקר, ומחצה בין הערבים" — החביתין של היום הושלמו.', linger: 1200 });
  });
  W && W.kohen('player').carry('bread');
  api.solver(async () => { await api.wait(40); press(btn, 'down'); while (!fin) await api.wait(30); press(btn, 'up'); });
  return null;
}

/* ═════════ the three blasts at the opening of the gates (Sukkah 5:5) ═════════ */
const GATE_SHOT = { p: [-46, 30, 28], t: [2, 21, 0] };   // from inside the azara, east to the Nikanor gate
export const shaarim = {
  id: 'shaarim', title: 'פתיחת השערים', kicker: 'עם האור',
  intro: 'בכל יום תקעו שלוש תקיעות לפתיחת השערים: תקיעה, תרועה, תקיעה — והשערים נפתחים לעם.',
  introAgain: 'תקיעה, תרועה, תקיעה — והשערים נפתחים.',
  stage(W) { W.time('dawn'); W.look(GATE_SHOT, 1500); return walk(W, [-8, 3]); },
  play(api) {
    ensureCss();
    const { ctx } = api, W = api.world;
    const svg = api.svg('0 0 360 220', 'שער ניקנור עם עלות השחר');
    svgEl('rect', { x: 0, y: 0, width: 360, height: 220, class: 'av-d-sky' }, svg);
    const light = svgEl('rect', { x: 130, y: 40, width: 100, height: 150, class: 'av-d-light' }, svg);
    svgEl('rect', { x: 0, y: 30, width: 130, height: 170, class: 'av-d-wall' }, svg);
    svgEl('rect', { x: 230, y: 30, width: 130, height: 170, class: 'av-d-wall' }, svg);
    svgEl('rect', { x: 120, y: 24, width: 120, height: 18, class: 'av-d-wall' }, svg);
    const L = svgEl('rect', { x: 130, y: 42, width: 50, height: 148, class: 'av-d-leaf l' }, svg);
    const R = svgEl('rect', { x: 180, y: 42, width: 50, height: 148, class: 'av-d-leaf r' }, svg);
    svgEl('text', { x: 180, y: 18, class: 'av-lab', 'text-anchor': 'middle' }, svg).textContent = 'שער ניקנור';
    kohenFig(svg, { x: 62, y: 150, s: 1.3 });
    svgEl('path', { d: 'M70 148 L100 126', stroke: '#C9CED6', 'stroke-width': 3.2, fill: 'none', 'stroke-linecap': 'round' }, svg);   // the silver trumpet: a long tube …
    svgEl('path', { d: 'M99.1 124.8 L104.5 115.2 L111.5 124.8 L100.9 127.2 Z', fill: '#D9DEE3', stroke: '#7C8792', 'stroke-width': 0.8 }, svg);   // … its flared bell
    svgEl('line', { x1: 104.5, y1: 115.2, x2: 111.5, y2: 124.8, stroke: '#5E6873', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, svg);         // (the bell's rim)
    const people = svgEl('g', { class: 'av-crowd' }, svg);
    const seq = ['tekiah', 'teruah', 'tekiah'];
    let st = 0, pressT = 0, taps = 0, tapT = null, fin = false;
    const btn = api.button('חצוצרה', () => {}, 'gold');
    btn.dataset.k = 'trumpet';
    btn.addEventListener('pointerdown', () => { pressT = performance.now(); });
    btn.addEventListener('pointerup', () => blow(performance.now() - pressT));
    const open = (k) => { const s = k / 3; L.style.transform = `scaleX(${1 - s * 0.85})`; R.style.transform = `scaleX(${1 - s * 0.85})`; light.style.opacity = String(s * 0.9); };
    api.hint('תקיעה — קול ארוך: החזק את החצוצרה.');
    api.cite(dayLine('gates_blasts'));
    function blow(ms) {
      if (fin) return;
      const want = seq[st];
      if (want === 'tekiah') {
        if (ms < 450) { api.hint('תקיעה — קול ארוך: החזק את החצוצרה.'); return; }
        api.sfx && api.sfx.play('tekiah');
      } else {
        taps++; clearTimeout(tapT);
        if (taps < 3) { tapT = setTimeout(() => { taps = 0; }, 900); api.hint('תרועה — שלוש הקשות קצרות ברצף.'); return; }
        taps = 0; api.sfx && api.sfx.play('teruah');
      }
      try { if (ctx.emit) ctx.emit('shirBlast', { n: 0, kind: want, gates: true }); } catch (e) { /* music optional */ }
      st++; open(st);
      if (st === 1) api.hint('תרועה — שלוש הקשות קצרות.');
      if (st === 2) api.hint('ועוד תקיעה.');
      if (st < 3) return;
      fin = true; btn.remove();
      api.sfx && api.sfx.play('creak');
      for (let k = 0; k < 8; k++) person(people, 150 + (k % 4) * 18, 176 + Math.floor(k / 4) * 18, 0.9, k);
      api.done({ text: 'השערים נפתחו. בכל יום עשרים ואחת תקיעות במקדש: שלוש לפתיחת השערים, תשע לתמיד של שחר ותשע לתמיד של בין הערביים (סוכה ה, ה).', linger: 1500 });
    }
    api.solver(async () => {
      const blowT = async (ms) => { btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); await new Promise((r) => setTimeout(r, ms)); btn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); await new Promise((r) => setTimeout(r, 30)); };
      await api.wait(30); await blowT(520); for (let k = 0; k < 3; k++) await blowT(40); await blowT(520);
    });
    return null;
  },
};

/* ═════════ the 93 vessels (Tamid 3:4) ═════════ */
const KELIM_SHOT = { p: [-52, 30, -22], t: [-80, 18, -58] };   // the north side, toward the chambers by Beit HaMoked (the chamber of vessels' place: illustration)
const VESSELS_HE = ['מזרקים', 'כפות', 'מחתות', 'בזיכים', 'כוסות'];   // (which vessels: the Mishnah does not list them — illustration ⚑)
export const kelim = {
  id: 'kelim', title: 'תשעים ושלשה כלים', kicker: 'לשכת הכלים',
  intro: 'לפני שמשקים את הטלה — מוציאים מלשכת הכלים תשעים ושלושה כלי כסף וכלי זהב לעבודת היום. הקש על המדפים.',
  introAgain: 'תשעים ושלשה כלים — הקש על המדפים.',
  stage(W) { W.time('dawn'); W.look(KELIM_SHOT, 1500); return walk(W, [-72, -50]); },
  play(api) {
    ensureCss();
    const svg = api.svg('0 0 360 220', 'לשכת הכלים והשולחן');
    hall(svg, 360, 220, { wall: 34 });
    // four shelves (two of silver, two of gold) at the left; the table and its count at the right
    const shelves = [];
    for (let k = 0; k < 4; k++) {
      const y = 58 + k * 42, gold = k % 2 === 1;
      svgEl('rect', { x: 14, y: y + 14, width: 150, height: 6, class: 'av-d-shelf' }, svg);
      const vs = [];
      for (let i = 0; i < 7; i++) vs.push(svgEl('path', { d: `M${24 + i * 20} ${y + 14} l-6 -12 h12 z`, class: gold ? 'av-d-goldv' : 'av-d-silver' }, svg));
      const t = target(svg, 89, y + 4, 22, gold ? 'מדף כלי הזהב' : 'מדף כלי הכסף', () => take(k));
      svgEl('rect', { x: 14, y: y - 16, width: 150, height: 40, class: 'av-d-hit av-hit' }, t.g);
      shelves.push({ y, gold, vs, t });
    }
    svgEl('rect', { x: 206, y: 118, width: 140, height: 12, rx: 3, class: 'av-d-shelf' }, svg);
    svgEl('rect', { x: 214, y: 130, width: 8, height: 60, class: 'av-d-shelf' }, svg);
    svgEl('rect', { x: 330, y: 130, width: 8, height: 60, class: 'av-d-shelf' }, svg);
    const count = svgEl('text', { x: 276, y: 76, class: 'av-count', 'text-anchor': 'middle' }, svg);
    svgEl('text', { x: 276, y: 96, class: 'av-lab small', 'text-anchor': 'middle' }, svg).textContent = 'מתוך תשעים ושלשה';
    const pile = svgEl('g', {}, svg);
    let n = 0, taps = 0, fin = false;
    const TOTAL = 93, BATCH = 12;
    count.textContent = '0';
    api.hint('הקש על המדפים — כלי כסף וכלי זהב אל השולחן.');
    api.cite(dayLine('kelim_93'));
    function take(k) {
      if (fin) return;
      const s = shelves[k];
      const add = Math.min(BATCH, TOTAL - n), last = n + add >= TOTAL;
      n += add; taps++;
      // the batch flies to the table
      const fly = svgEl('path', { d: `M${89} ${s.y + 14} l-8 -16 h16 z`, class: `${s.gold ? 'av-d-goldv' : 'av-d-silver'} av-d-fly` }, svg);
      requestAnimationFrame(() => { fly.style.transform = `translate(${190}px, ${118 - s.y - 14}px)`; fly.style.opacity = '0'; });
      setTimeout(() => fly.remove(), 600);
      const px = 216 + ((taps - 1) % 8) * 16, py = 116 - Math.floor((taps - 1) / 8) * 12;
      svgEl('path', { d: `M${px} ${py} l-5 -10 h10 z`, class: s.gold ? 'av-d-goldv' : 'av-d-silver' }, pile);
      count.textContent = String(n);
      api.sfx && api.sfx.play('chime', { n: 1 + (taps % 8) });
      api.float(`+${add} ${VESSELS_HE[(taps - 1) % VESSELS_HE.length]}`, 70, 20);
      if (!last) return;
      fin = true;
      api.sparkle(276 / 360 * 100, 76 / 220 * 100, 12);
      api.done({ text: 'תשעים ושלשה כלי כסף וכלי זהב על השולחן. ועכשיו — משקים את הטלה בכוס של זהב (תמיד ג, ד).', linger: 1400 });
    }
    api.solver(async () => { let k = 0; while (!fin) { press(shelves[k % 4].t.hit, 'down'); k++; await api.wait(60); } });
    return null;
  },
};

/* ═════════ tomorrow's lamb (Tamid 3:4 "מבקר מבערב"; Arachin 2:5; Bekhorot 6:1) ═════════ */
export const machar = {
  id: 'machar', title: 'הטלה של מחר', kicker: 'לשכת הטלאים · בערב',
  intro: 'טלה התמיד של מחר נבדק כבר הערב. שלושה טלאים חדשים הגיעו: בדוק כל אחד — התמים נכנס ללשכה.',
  introAgain: 'שלושה טלאים חדשים: בדוק — והתמימים ללשכה.',
  stage(W) { W.time('dusk'); W.look('lambs', 1500); return walk(W, [LAMBS_CHAMBER_DOOR.x + 3, LAMBS_CHAMBER_DOOR.z + 2]); },
  play(api) {
    ensureCss();
    const { ctx } = api, W = api.world;
    const svg = api.svg('0 0 360 230', 'שלושה טלאים ולשכת הטלאים');
    hall(svg, 360, 230, { wall: 36 });
    // the chamber's door at the right, with its count
    svgEl('rect', { x: 296, y: 60, width: 52, height: 100, rx: 4, class: 'av-d-wall' }, svg);
    svgEl('rect', { x: 306, y: 84, width: 32, height: 76, rx: 3, class: 'av-d-leaf' }, svg);
    const inCount = svgEl('text', { x: 322, y: 52, class: 'av-lab', 'text-anchor': 'middle' }, svg);
    let inside = 4;
    const showCount = () => { inCount.textContent = `בלשכה: ${inside}`; };
    showCount();
    // three lambs: one with nothing, one with a scratch on the ear's skin only (NOT a blemish), one with a notch in the ear's
    // cartilage (a blemish) — Bekhorot 6:1; the order by the day
    const by = (id) => BLEMISHES.find((b) => b.id === id) || null;
    const kinds = [null, 'ear-skin', 'ear-cartilage'];
    const seed = String(ctx.day || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const order = [0, 1, 2].sort((a, b) => ((a * 7 + seed) % 5) - ((b * 7 + seed) % 5));
    const lambs = order.map((ki, i) => ({ i, x: 60 + i * 90, y: 170, mark: kinds[ki] ? by(kinds[ki]) : null, state: 'new' }));
    let sel = null, fin = false;
    for (const L of lambs) {
      L.g = svgEl('g', {}, svg);   // (a wrapper: its CSS transform moves the lamb without replacing the lamb's own transform)
      beast(L.g, 'lamb', L.x, L.y, 2.2);
      L.t = target(svg, L.x + 6, L.y - 8, 30, `טלה ${L.i + 1}`, () => look(L));
    }
    // the close-up: the head, big, at the top middle, with its mark
    const close = svgEl('g', { opacity: 0 }, svg);
    svgEl('rect', { x: 96, y: 40, width: 168, height: 84, rx: 12, fill: 'rgba(255,248,232,.95)', stroke: '#A8916A' }, close);
    svgEl('ellipse', { cx: 180, cy: 84, rx: 34, ry: 24, fill: '#EADDC4', stroke: '#8C7658' }, close);
    svgEl('path', { d: 'M150 70 q-16 -14 -22 -2 q8 8 22 8 z', fill: '#E3D2B2', stroke: '#8C7658' }, close);   // the ear
    svgEl('circle', { cx: 196, cy: 78, r: 3, fill: '#2A1C10' }, close);
    const markG = svgEl('g', {}, close);
    const say = svgEl('text', { x: 180, y: 118, class: 'av-lab small', 'text-anchor': 'middle' }, close);
    const yes = api.button('תמים — ללשכה', () => judge(true), 'gold'); yes.dataset.k = 'tamim';
    const no = api.button('בעל מום — לא', () => judge(false), ''); no.dataset.k = 'mum';
    yes.disabled = no.disabled = true;
    api.hint('הקש על טלה כדי לבדוק אותו.');
    api.cite(dayLine('machar_lamb'));
    function look(L) {
      if (fin || L.state !== 'new') return;
      sel = L; lambs.forEach((x) => x.t.g.classList.toggle('on', x === L));
      markG.innerHTML = '';
      if (L.mark && L.mark.id === 'ear-skin') svgEl('path', { d: 'M136 66 l8 4', class: 'av-d-scratch' }, markG);
      if (L.mark && L.mark.id === 'ear-cartilage') svgEl('path', { d: 'M129 66 l5 5 l-4 3', class: 'av-d-mark' }, markG);
      say.textContent = L.mark ? L.mark.he : 'אוזן, עין, חוטם, שפה — אין סימן';
      close.setAttribute('opacity', 1);
      yes.disabled = no.disabled = false;
      api.sfx && api.sfx.play('ui');
      api.hint('תמים או בעל מום?');
    }
    function judge(ok) {
      const L = sel;
      if (!L || fin) return;
      const blem = !!(L.mark && L.mark.blemish);
      if (ok === blem) api.miss(blem ? `"${L.mark.quote}" — זה מום (${L.mark.source}).` : L.mark ? `"${L.mark.quote}" — זה אינו מום (${L.mark.source}).` : 'אין בו שום סימן — תמים.');
      else api.hint(blem ? `נכון — "${L.mark.quote}": מום.` : L.mark ? `נכון — "${L.mark.quote}": אינו מום.` : 'נכון — תמים.', 'ok');
      L.state = blem ? 'out' : 'in';
      L.t.g.remove(); close.setAttribute('opacity', 0); yes.disabled = no.disabled = true; sel = null;
      L.g.style.transformBox = 'fill-box'; L.g.style.transformOrigin = '50% 50%';
      if (!blem) { inside++; showCount(); L.g.style.transition = 'transform .8s ease-in, opacity .8s'; L.g.style.transform = `translate(${300 - L.x}px, -30px) scale(.4)`; L.g.style.opacity = '0'; api.sfx && api.sfx.play('chime', { n: 4 + inside }); }
      else { L.g.style.transition = 'opacity .8s'; L.g.style.opacity = '.35'; }
      if (lambs.some((x) => x.state === 'new')) return;
      fin = true;
      W && W.avSub && W.avSub('lambsChamber', 'count', 6);
      api.done({ text: `${inside === 6 ? 'שישה' : inside} טלאים בדוקים בלשכה — "אין פוחתין מששה טלאים המבקרין" (ערכין ב, ה). ומחר בבוקר בודקים שוב, לאור האבוקות (תמיד ג, ד).`, linger: 1600 });
    }
    api.solver(async () => {
      for (const L of lambs) { press(L.t.hit, 'down'); await api.wait(40); press(!(L.mark && L.mark.blemish) ? yes : no); await api.wait(40); }
    });
    return null;
  },
};

/* ═════════ the closing of the gates (Middot 1:4; Shekalim 5:1; Tamid 1:1) — and the fire burns on (Lev. 6:6) ═════════ */
const NEILAH_SHOT = { p: [40, 70, 80], t: [-70, 16, 0] };   // over the azara from the east at dusk: the gates and the altar's fire
// the names as in Middot 1:4–5 (read on Sefaria 29.9): south — הדלק, הבכורות, המים; east — ניקנור; north — הניצוץ, הקרבן, בית המוקד
const GATE_NAMES = { nitzotz: 'שער הניצוץ', korban: 'שער הקרבן', moked: 'בית המוקד', mayim: 'שער המים', bechorot: 'שער הבכורות', delek: 'שער הדלק', nikanor: 'שער ניקנור' };
export const neilah = {
  id: 'neilah', title: 'נעילת השערים', kicker: 'בערב',
  intro: 'העבודה של היום נגמרה. סגור את שבעת שערי העזרה — ואת המפתחות מסור לזקני בית אב, בבית המוקד.',
  introAgain: 'שבעה שערים — ננעלים. והמפתחות לבית המוקד.',
  stage(W) { W.time('dusk'); W.look(NEILAH_SHOT, 1600); },
  play(api) {
    ensureCss();
    const W = api.world;
    const svg = api.svg('0 0 360 230', 'תכנית העזרה ושבעת שעריה');
    svgEl('rect', { x: 0, y: 0, width: 360, height: 230, class: 'av-court' }, svg);
    // the plan: west (the House) at the left, east (Nikanor) at the right; north at the top
    const X = (x) => 34 + ((x + 187) / 190) * 290, Y = (z) => 44 + ((z + 71) / 142) * 150;
    svgEl('rect', { x: X(-187), y: Y(-71), width: X(3) - X(-187), height: Y(71) - Y(-71), class: 'av-d-plan' }, svg);
    svgEl('rect', { x: X(-159), y: Y(-12), width: X(-92) - X(-159), height: Y(12) - Y(-12), rx: 2, fill: '#E9C35E', stroke: '#8A6420' }, svg);   // the House
    svgEl('rect', { x: X(-54), y: Y(-19.5), width: X(-22) - X(-54), height: Y(12.5) - Y(-19.5), class: 'av-altartop' }, svg);   // the altar
    const fire = svgEl('path', { d: `M${X(-38)} ${Y(-4) + 6} q-6 -10 0 -18 q6 8 0 18 z`, class: 'av-flame big' }, svg);
    svgEl('text', { x: 346, y: 30, class: 'av-lab small', 'text-anchor': 'middle' }, svg).textContent = 'צפון';
    svgEl('text', { x: 346, y: 214, class: 'av-lab small', 'text-anchor': 'middle' }, svg).textContent = 'דרום';
    svgEl('text', { x: (X(-159) + X(-92)) / 2, y: Y(0) + 4, class: 'av-lab small', 'text-anchor': 'middle' }, svg).textContent = 'הבית';
    svgEl('text', { x: X(-38), y: Y(12.5) + 12, class: 'av-lab small', 'text-anchor': 'middle' }, svg).textContent = 'המזבח';
    const dim = svgEl('rect', { x: 0, y: 0, width: 360, height: 230, class: 'av-d-dim' }, svg);
    const gates = [];
    for (const [id, he] of Object.entries(GATE_NAMES)) {
      const g0 = GATES[id]; if (!g0) continue;
      const east = id === 'nikanor', x = east ? X(3) : X(g0.x), y = east ? Y(0) : g0.z < 0 ? Y(-71) : Y(71);
      const door = svgEl('rect', east ? { x: x - 4, y: y - 14, width: 8, height: 28, rx: 2, class: 'av-d-gate open' } : { x: x - 14, y: y - 4, width: 28, height: 8, rx: 2, class: 'av-d-gate open' }, svg);
      const ty = east ? y + 26 : g0.z < 0 ? y - 10 : y + 18;
      svgEl('text', { x: east ? x - 6 : x, y: ty, class: 'av-lab small', 'text-anchor': 'middle' }, svg).textContent = he.replace(/^שער /, '');
      const G = { id, he, door, shut: false };
      G.t = target(svg, x, y, 22, he, () => shut(G));
      gates.push(G);
    }
    let fin = false, keyT = null;
    api.hint('הקש על כל שער כדי לנעול אותו.');
    api.cite(dayLine('neilat_shearim'));
    function shut(G) {
      if (G.shut || fin) return;
      G.shut = true; G.door.classList.remove('open'); G.t.g.remove();
      api.sfx && api.sfx.play('thud');
      const left = gates.filter((x) => !x.shut).length;
      api.hint(left ? `${G.he} ננעל — עוד ${left}.` : 'שבעה שערים ננעלו. עכשיו המפתחות — לבית המוקד.', left ? '' : 'ok');
      if (!left) keys();
    }
    function keys() {
      const g0 = GATES.moked, x = X(g0.x), y = Y(g0.z) + 26;
      svgEl('path', { d: `M${x - 10} ${y} a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 M${x} ${y} h14 v5 M${x + 9} ${y} v4`, class: 'av-d-key' }, svg);
      keyT = target(svg, x + 2, y, 22, 'המפתחות לבית המוקד', () => give());
      api.cite(dayLine('esh_tamid'));
    }
    function give() {
      if (fin) return;
      fin = true; keyT.g.remove();
      api.sfx && api.sfx.play('creak');
      dim.style.opacity = '0.55';
      fire.style.filter = 'drop-shadow(0 0 8px #FF9A2E)';
      W && W.time('night');
      walk(W, [GATES.moked.x + 2, GATES.moked.z + 4]);
      api.done({ text: 'השערים נעולים, המפתחות בבית המוקד — ורק האש על המזבח ערה כל הלילה: "אש תמיד תוקד על המזבח לא תכבה" (ויקרא ו, ו).', linger: 1800 });
    }
    api.solver(async () => { for (const G of gates) { press(G.t.hit, 'down'); await api.wait(30); } while (!keyT) await api.wait(20); press(keyT.hit, 'down'); });
    return null;
  },
};
