/* ─────────────────────────────────────────────────────────────────────────────
 * dir.js: ── service13 ── "הדיר ולשכת הטלאים" (wave 13; the owner, 30.9: "חשבתי גם על המסביב שיהיו מקומות לקורבנות לפרים
 * לעזים וכו', צריך לנהל את הדירים והאורוות מסביב לבית" — a first slice). Rows a015, a057 of his table. No fail state:
 *   1. THE PENS (pens.js, north of the Mount — an illustration): hold to fill the trough, tap the hay into the manger; the
 *      flock comes to drink and eat.
 *   2. TOMORROW'S NEED, from the calendar (data.needOf ← calendar.js / calendar_offerings.json): the two Tamid lambs and the
 *      musaf — Shabbat, Rosh Chodesh, the festivals (Sukkot's bulls 13 → 7).
 *   3. THE LAMBS' CHAMBER (מדות א, ו "לשכת טלאי קרבן"; תמיד ג, ג): new lambs are checked before they go in — tap the ear, the
 *      eye, the nose and the lip (Bekhorot 6, the taleh's BLEMISHES: two of them are the Mishnah's "not a blemish"), then judge.
 *      The unblemished go in; the chamber never holds fewer than six (ערכין ב, ה). No blood: a mark is a notch or a scratch.
 * On Shabbat and Yom Tov no new lambs come: water and hay, and count the six that wait — "כדי לשבת ולשני ימים טובים של ראש
 * השנה" (⚑ our illustration of that line). A day he does not come costs nothing: other kohanim tend (state.js dirTend only adds).
 * Every tap target is ≥ 44 px on a 390-px phone (r ≥ 23 in the 360×230 picture).
 * ──────────────────────────────────────────────────────────────────────────── */
import { svgEl, press, clamp } from './common.js';
import { beast } from './art.js';
import { BLEMISHES, PITUM_LINES, needHe } from '../data.js';
import { SHOTS } from '../../places.js';

const CSS = `
.av-mg .av-r-hit{fill:transparent;cursor:pointer}
.av-mg .av-r-tgt{cursor:pointer}
.av-mg .av-r-tgt:focus{outline:none}
.av-mg .av-r-tgt:focus .av-r-ring,.av-mg .av-r-tgt.on .av-r-ring{stroke:#E8B94A;stroke-width:3}
.av-mg .av-r-ring{fill:none;stroke:rgba(232,185,74,.6);stroke-width:2;stroke-dasharray:4 3}
.av-mg .av-r-tgt.seen .av-r-ring{stroke:#3F8F4E;stroke-dasharray:none}
.av-mg .av-r-sky{fill:#CFE0EA}
.av-mg .av-r-hill{fill:#B9A77E}
.av-mg .av-r-ground{fill:#C8B48A}
.av-mg .av-r-wall{fill:#D3C7AC;stroke:#9C8D6E;stroke-width:1}
.av-mg .av-r-trough{fill:#BFB6A4;stroke:#6E675B;stroke-width:1.2}
.av-mg .av-r-water{fill:#5E97B8;transition:height .2s,y .2s}
.av-mg .av-r-manger{fill:#8C6A3F;stroke:#5A4226;stroke-width:1}
.av-mg .av-r-hay{fill:#D9C07A;stroke:#A88F46;stroke-width:1}
.av-mg .av-r-mover{transition:transform 1.1s ease-in-out}
.av-mg .av-r-door{fill:#6E4A1A;stroke:#3F2A0E;stroke-width:1}
.av-mg .av-r-chamber{fill:#D8C194;stroke:#B99E70;stroke-width:1}
.av-mg .av-r-panel{fill:rgba(255,248,232,.96);stroke:#A8916A;stroke-width:1.2}
.av-mg .av-r-head{fill:#EADDC4;stroke:#8C7658;stroke-width:1.2}
.av-mg .av-r-mark{fill:none;stroke:#4A2E18;stroke-width:2;stroke-linecap:round}
.av-mg .av-r-scratch{fill:none;stroke:#B08A62;stroke-width:1.2;stroke-linecap:round}
.av-mg .av-r-need{fill:#3B2A12;font:700 12.5px Heebo,sans-serif}
.av-mg .av-r-illus{fill:rgba(60,40,20,.7);font:500 9.5px Heebo,sans-serif}
.av-mg .av-r-rtl{direction:rtl}
.av-mg .av-r-part{fill:#6B5234;font:600 9.5px Heebo,sans-serif}
`;
function ensureCss() {
  if (typeof document === 'undefined' || document.getElementById('av-dir-css')) return;
  const s = document.createElement('style'); s.id = 'av-dir-css'; s.textContent = CSS; document.head.appendChild(s);
}
function target(svg, x, y, r, label, onTap) {
  const g = svgEl('g', { class: 'av-r-tgt', tabindex: '0', role: 'button', 'aria-label': label }, svg);
  svgEl('circle', { cx: x, cy: y, r, class: 'av-r-ring' }, g);
  const hit = svgEl('circle', { cx: x, cy: y, r: Math.max(23, r), class: 'av-r-hit av-hit' }, g);
  g.addEventListener('pointerdown', (e) => { e.preventDefault(); onTap(g); });
  return { g, hit };
}
const PARTS = [
  { id: 'ear', he: 'האוזן', x: 136, y: 70 }, { id: 'eye', he: 'העין', x: 196, y: 82 },
  { id: 'nose', he: 'החוטם', x: 258, y: 98 }, { id: 'lip', he: 'השפה', x: 228, y: 136 },
];
/** how a mark looks on the close-up (no blood: notches and scratches in the wool's colours) */
function drawMark(g, m) {
  if (!m) return;
  const P = (d, cls = 'av-r-mark') => svgEl('path', { d, class: cls }, g);
  if (m.id === 'ear-cartilage') P('M124 60 l6 6 l-5 4');
  else if (m.id === 'ear-skin') P('M128 72 l10 5', 'av-r-scratch');
  else if (m.id === 'ear-split') P('M122 64 l14 12');
  else if (m.id === 'eyelid') P('M190 74 l4 4 l4 -4');
  else if (m.id === 'eye-white') svgEl('circle', { cx: 199, cy: 84, r: 1.6, fill: '#B08A62' }, g);
  else if (m.id === 'nose') P('M254 92 l4 5 l-4 4');
  else if (m.id === 'lip') P('M224 128 l4 5 l4 -5');
}
const seedOf = (s) => String(s || '').split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

export const dir = {
  id: 'dir', title: 'הדיר ולשכת הטלאים', kicker: 'הדירים · לשכת הטלאים',
  intro: 'לפני שטלה נכנס ללשכת הטלאים — בודקים אותו. קודם מים ומספוא לעדר בדיר; אחר כך הטלאים החדשים: אוזן, עין, חוטם ושפה.',
  introAgain: 'מים ומספוא לעדר, ובדיקת הטלאים החדשים — התמימים ללשכה.',
  stage(W) { W.time('noon'); W.look('pens', 1600); W.avSub('pens', 'fill', 48); return null; },
  play(api) {
    ensureCss();
    const { ctx } = api, W = api.world;
    const need = ctx.need || {};
    const rest = !!need.restToday;
    const svg = api.svg('0 0 360 230', 'הדיר, השוקת והאבוס, ולשכת הטלאים');   // (360×230: full width in a phone's card)
    // ── 1. the pens ──
    const pens = svgEl('g', {}, svg);
    svgEl('rect', { x: 0, y: 0, width: 360, height: 64, class: 'av-r-sky' }, pens);
    svgEl('path', { d: 'M0 64 q60 -22 130 -6 q70 -20 140 2 q50 -10 90 4 v10 h-360 z', class: 'av-r-hill' }, pens);
    svgEl('rect', { x: 0, y: 70, width: 360, height: 160, class: 'av-r-ground' }, pens);
    for (let x = 4; x < 356; x += 22) svgEl('rect', { x, y: 76, width: 20, height: 11, rx: 3, class: 'av-r-wall' }, pens);
    svgEl('text', { x: 356, y: 227, class: 'av-r-illus', 'text-anchor': 'end' }, pens).textContent = 'הדיר מצפון להר הבית — המחשה';
    // the trough (left) and the manger (right)
    svgEl('rect', { x: 26, y: 180, width: 96, height: 22, rx: 5, class: 'av-r-trough' }, pens);
    const water = svgEl('rect', { x: 31, y: 198, width: 86, height: 0, rx: 3, class: 'av-r-water' }, pens);
    svgEl('rect', { x: 226, y: 180, width: 120, height: 22, rx: 4, class: 'av-r-manger' }, pens);
    const hayIn = svgEl('g', {}, pens);
    // the flock
    const flock = [];
    for (let i = 0; i < 6; i++) {
      const g = svgEl('g', { class: 'av-r-mover' }, pens);
      beast(g, i === 4 ? 'ram' : i === 5 ? 'goat' : 'lamb', 104 + (i % 3) * 46, 112 + Math.floor(i / 3) * 28, 1.4);
      flock.push(g);
    }
    const jar = target(svg, 70, 152, 24, 'כד המים', () => {});
    svgEl('path', { d: 'M60 164 q-4 -16 4 -24 h12 q8 8 4 24 z', fill: '#B87A4B', stroke: '#6E4A2A' }, jar.g);
    const hays = [0, 1, 2].map((i) => {
      const x = 244 + i * 46, y = 150;
      const t = target(svg, x, y, 23, `אלומת מספוא ${i + 1}`, () => feed(i));
      svgEl('path', { d: `M${x - 13} ${y + 8} q13 -26 26 0 z`, class: 'av-r-hay' }, t.g);
      return { t, used: false };
    });
    const pourB = api.button('החזק — מלא את השוקת', () => {}, 'gold hold'); pourB.dataset.k = 'water';
    const holdW = api.hold(pourB);
    holdW.set(false);
    jar.g.addEventListener('pointerdown', () => holdW.set(true));
    jar.g.addEventListener('pointerup', () => holdW.set(false));
    jar.g.addEventListener('pointerleave', () => holdW.set(false));
    let phase = 'tend', level = 0, fed = 0, watered = false;
    api.hint('החזק את כד המים עד שהשוקת מלאה, והקש על המספוא — לאבוס.');
    // tomorrow's need, from the calendar: "מחר צריך:" and the animals, on two lines over the hills
    if (need.tomorrow) {
      svgEl('text', { x: 180, y: 22, class: 'av-r-need av-r-rtl', 'text-anchor': 'middle' }, pens).textContent = need.tomorrowRest ? 'מחר צריך (ומחר מנוחה — מכינים היום):' : 'מחר צריך:';
      svgEl('text', { x: 180, y: 40, class: 'av-r-need av-r-rtl', 'text-anchor': 'middle' }, pens).textContent = needHe(need.tomorrow);
    }
    const goTo = (idx, x, y) => { flock[idx].style.transform = `translate(${x}px, ${y}px)`; };
    api.loop((dt) => {
      if (phase !== 'tend' || watered) return;
      if (holdW.held()) {
        level = clamp(level + dt / 1.4, 0, 1);
        water.setAttribute('height', 16 * level); water.setAttribute('y', 198 - 16 * level);
        if (Math.random() < dt * 6) api.sfx && api.sfx.play('water');
        if (level >= 1) {
          watered = true; pourB.disabled = true;
          api.sfx && api.sfx.play('ok');
          goTo(0, -58, 44); goTo(3, -66, 24);
          W && W.avSub && W.avSub('pens', 'tend', 'water');   // the flock in the world comes to the troughs
          api.hint(fed < 3 ? 'השוקת מלאה — הצאן שותים. עכשיו המספוא לאבוס.' : 'השוקת מלאה.', 'ok');
          tended();
        }
      }
    });
    function feed(i) {
      const h = hays[i];
      if (phase !== 'tend' || h.used) return;
      h.used = true; fed++;
      h.t.g.remove();
      svgEl('path', { d: `M${234 + i * 36} 184 q12 -14 24 0 z`, class: 'av-r-hay' }, hayIn);
      api.sfx && api.sfx.play('ui');
      if (fed === 1) { goTo(2, 90, 40); goTo(5, 60, 18); }
      if (fed === 3) { goTo(1, 70, 44); goTo(4, 40, 26); W && W.avSub && W.avSub('pens', 'tend', 'hay'); api.hint(watered ? 'המספוא באבוס.' : 'המספוא באבוס — עכשיו מים לשוקת.', 'ok'); tended(); }
    }
    function tended() {
      if (!(watered && fed >= 3) || phase !== 'tend') return;
      phase = 'need';
      api.sparkle(50, 70, 10);
      const T = need.tomorrow, big = T ? T.bulls + T.rams + T.goats : 0;
      api.after(900, rest ? countSix : big > 0 && big <= 18 ? musafPrep : lambsCome);
    }

    // ── 2. tomorrow's musaf (the calendar's): the bulls, the rams and the goat are led out, one tap each, to the fold by the gate
    // — Sukkot's bulls count down 13 → 7, Rosh Chodesh brings two, a festival day its own; the musaf's lambs the other kohanim bring
    let musafT = [], musafLeft = 0;
    function musafPrep() {
      phase = 'musaf';
      [jar.g, ...hays.map((h) => h.t.g)].forEach((g) => g.remove());
      pourB.remove();
      flock.forEach((g) => { g.style.transition = 'opacity .4s'; g.style.opacity = '0'; });
      const T = need.tomorrow, kinds = [...Array(T.bulls).fill('bull'), ...Array(T.rams).fill('ram'), ...Array(T.goats).fill('goat')];
      const HE = { bull: 'פר', ram: 'איל', goat: 'שעיר' };
      const cols = 6, gate = svgEl('g', {}, svg);
      svgEl('rect', { x: 318, y: 96, width: 34, height: 70, rx: 5, class: 'av-r-door' }, gate);
      svgEl('text', { x: 335, y: 90, class: 'av-lab small', 'text-anchor': 'middle' }, gate).textContent = 'למחר';
      const cnt = svgEl('text', { x: 180, y: 61, class: 'av-lab av-r-rtl', 'text-anchor': 'middle' }, svg);
      const left = { bull: T.bulls, ram: T.rams, goat: T.goats };
      const show = () => { cnt.textContent = [T.bulls && `פרים ${T.bulls - left.bull}/${T.bulls}`, T.rams && `אילים ${T.rams - left.ram}/${T.rams}`, T.goats && `שעיר ${T.goats - left.goat}/${T.goats}`].filter(Boolean).join(' · '); };
      show();
      musafLeft = kinds.length;
      const rows = Math.ceil(kinds.length / cols), dy = rows > 2 ? 46 : 50, y0 = rows > 2 ? 98 : 106;
      musafT = kinds.map((k, i) => {
        const x = 34 + (i % cols) * 50, y = y0 + Math.floor(i / cols) * dy;
        const g = svgEl('g', { class: 'av-r-mover' }, svg);
        beast(g, k, x - 2, y + 4, k === 'bull' ? 1.05 : 1.2);
        const t = target(svg, x, y, 23, `${HE[k]} ${i + 1}`, () => {
          if (phase !== 'musaf' || t.g.dataset.gone) return;
          t.g.dataset.gone = '1'; t.g.remove();
          g.style.transform = `translate(${330 - x}px, ${128 - y}px) scale(.5)`; g.style.opacity = '0';
          left[k]--; musafLeft--; show();
          api.sfx && api.sfx.play('step');
          if (!musafLeft) { api.hint(`מוכנים למחר${T.musafLambs ? ` — ואת ${T.musafLambs} הכבשים של המוסף מביאים הכהנים האחרים` : ''}.`, 'ok'); api.sparkle(90, 50, 10); api.after(1200, () => { cnt.remove(); gate.remove(); lambsCome(); }); }
        });
        return { t, g, k };
      });
      api.hint(`מחר במוסף: ${needHe(T).replace(/^.*מוסף: /, '')}. הקש על כל אחד — אל הדיר של מחר.`);
    }

    // ── 2–3. the lambs' chamber ──
    let inside = rest ? 6 : clamp(6 - Math.max(2, Math.min(3, (need.tomorrow && need.tomorrow.tamid) || 2)), 3, 4);
    let chamber = null, countEl = null, lambs = [], sel = null, close = null, parts = [], yes = null, no = null, seen = new Set(), okN = 0;
    function drawChamber() {
      pens.style.transition = 'opacity .5s'; pens.style.opacity = '0';
      [jar.g, ...hays.map((h) => h.t.g), ...musafT.map((m) => m.t.g), ...musafT.map((m) => m.g)].forEach((g) => g.remove());
      pourB.remove();
      chamber = svgEl('g', {}, svg);
      svgEl('rect', { x: 0, y: 0, width: 360, height: 230, class: 'av-r-chamber' }, chamber);
      for (let x = 0; x < 360; x += 48) svgEl('rect', { x: x + 1, y: 1, width: 46, height: 20, rx: 1, class: 'av-ashlar' }, chamber);
      svgEl('rect', { x: 298, y: 132, width: 54, height: 84, rx: 4, class: 'av-r-door' }, chamber);
      countEl = svgEl('text', { x: 325, y: 126, class: 'av-lab av-r-rtl', 'text-anchor': 'middle' }, chamber);
      svgEl('text', { x: 325, y: 228, class: 'av-lab small', 'text-anchor': 'middle' }, chamber).textContent = 'לשכת הטלאים';
      showCount();
      W && W.look && W.look('lambs', 1400);
      api.cite(PITUM_LINES.chamber);
    }
    const showCount = () => { if (countEl) countEl.textContent = `בלשכה: ${inside}`; };
    function lambsCome() {
      phase = 'check';
      drawChamber();
      const kinds = BLEMISHES.filter((b) => !b.blemish), blem = BLEMISHES.filter((b) => b.blemish);
      const s = seedOf(ctx.day || 'day');
      const marks = [null, kinds[s % kinds.length], blem[(s >> 3) % blem.length]];
      const order = [0, 1, 2].sort((a, b) => ((a * 5 + s) % 7) - ((b * 5 + s) % 7));
      lambs = order.map((mi, i) => {
        const L = { i, x: 56 + i * 84, y: 194, mark: marks[mi], state: 'new' };
        L.g = svgEl('g', {}, chamber);
        beast(L.g, 'lamb', L.x, L.y, 2.1);
        L.t = target(chamber, L.x + 6, L.y - 8, 30, `טלה ${i + 1}`, () => look(L));
        return L;
      });
      close = svgEl('g', { opacity: 0, transform: 'translate(0 -12)' }, chamber);   // (the close-up, 12 up: the lambs' row stays below it)
      svgEl('rect', { x: 62, y: 34, width: 236, height: 128, rx: 14, class: 'av-r-panel' }, close);
      svgEl('ellipse', { cx: 196, cy: 104, rx: 54, ry: 32, class: 'av-r-head' }, close);
      svgEl('path', { d: 'M236 88 q30 4 28 22 q-4 14 -30 12 z', class: 'av-r-head' }, close);   // the snout
      svgEl('path', { d: 'M150 84 q-30 -30 -34 -10 q10 14 34 16 z', class: 'av-r-head' }, close);   // the ear
      svgEl('circle', { cx: 199, cy: 84, r: 4.2, fill: '#FFF', stroke: '#8C7658' }, close);
      svgEl('circle', { cx: 200, cy: 84, r: 2.4, fill: '#2A1C10' }, close);
      svgEl('path', { d: 'M261 96 q-3 4 0 6', fill: 'none', stroke: '#6E5A48', 'stroke-width': 1.4 }, close);
      svgEl('path', { d: 'M222 126 q8 5 16 0', fill: 'none', stroke: '#6E5A48', 'stroke-width': 1.4 }, close);
      const markG = svgEl('g', {}, close);
      close.markG = markG;
      close.say = svgEl('text', { x: 180, y: 156, class: 'av-lab small', 'text-anchor': 'middle' }, close);
      for (const p of PARTS) svgEl('text', { x: p.id === 'lip' ? p.x + 28 : p.x, y: p.id === 'lip' ? p.y + 4 : p.y - 27, class: 'av-r-part', 'text-anchor': p.id === 'lip' ? 'start' : 'middle' }, close).textContent = p.he.replace(/^ה/, '');
      parts = PARTS.map((p) => {
        const t = target(close, p.x, p.y, 23, p.he, () => lookAt(p, t));
        return { p, t };
      });
      yes = api.button('תמים — ללשכה', () => judge(true), 'gold'); yes.dataset.k = 'tamim';
      no = api.button('בעל מום — לא', () => judge(false), ''); no.dataset.k = 'mum';
      yes.disabled = no.disabled = true;
      api.hint(`הגיעו טלאים חדשים מן הדיר. הקש על טלה כדי לבדוק אותו.`);
      api.cite(PITUM_LINES.bring);
    }
    function look(L) {
      if (phase !== 'check' || L.state !== 'new') return;
      sel = L; seen = new Set();
      lambs.forEach((x) => x.t.g.classList.toggle('on', x === L));
      close.markG.innerHTML = ''; close.say.textContent = 'הקש על האוזן, העין, החוטם והשפה';
      parts.forEach((q) => q.t.g.classList.remove('seen'));
      close.setAttribute('opacity', 1);
      yes.disabled = no.disabled = true;
      api.sfx && api.sfx.play('ui');
      api.hint('בדוק ארבעה מקומות: האוזן, העין, החוטם והשפה.');
    }
    function lookAt(p, t) {
      const L = sel;
      if (!L || phase !== 'check' || seen.has(p.id)) return;
      seen.add(p.id); t.g.classList.add('seen');
      const m = L.mark && L.mark.part === p.id ? L.mark : null;
      if (m) { drawMark(close.markG, m); close.say.textContent = m.he; }
      else close.say.textContent = `${p.he} — נקי`;
      api.sfx && api.sfx.play('ui');
      if (seen.size === PARTS.length) { yes.disabled = no.disabled = false; api.hint(L.mark ? `${L.mark.he} — תמים או בעל מום?` : 'לא נמצא סימן — תמים או בעל מום?'); }
    }
    function judge(ok) {
      const L = sel;
      if (!L || phase !== 'check') return;
      const blem = !!(L.mark && L.mark.blemish);
      if (ok === blem) api.miss(blem ? `"${L.mark.quote}" — זה מום (${L.mark.source}).` : L.mark ? `"${L.mark.quote}" — זה אינו מום (${L.mark.source}).` : 'אין בו שום סימן — תמים.');
      else api.hint(blem ? `נכון — "${L.mark.quote}": מום. הוא חוזר לדיר.` : L.mark ? `נכון — "${L.mark.quote}": אינו מום.` : 'נכון — תמים.', 'ok');
      L.state = blem ? 'out' : 'in';
      L.t.g.remove(); close.setAttribute('opacity', 0); yes.disabled = no.disabled = true; sel = null;
      L.g.style.transformBox = 'fill-box'; L.g.style.transformOrigin = '50% 50%';
      if (!blem) {
        inside++; okN++; showCount();
        L.g.style.transition = 'transform .8s ease-in, opacity .8s'; L.g.style.transform = `translate(${316 - L.x}px, -20px) scale(.4)`; L.g.style.opacity = '0';
        api.sfx && api.sfx.play('chime', { n: 3 + inside });
      } else { L.g.style.transition = 'opacity .8s'; L.g.style.opacity = '.35'; }
      if (lambs.some((x) => x.state === 'new')) return;
      finish();
    }
    // Shabbat and Yom Tov: no new lambs — count the six that wait (Arachin 2:5)
    function countSix() {
      phase = 'count';
      drawChamber();
      let n = 0;
      countEl.textContent = 'בלשכה: ?';
      api.hint(`${need.restHe || 'היום מנוחה'} — אין טלאים חדשים. הקש על כל טלה בלשכה וספור.`);
      api.cite(PITUM_LINES.six);
      for (let i = 0; i < 6; i++) {
        const x = 50 + (i % 3) * 86, y = 104 + Math.floor(i / 3) * 70, g = svgEl('g', {}, chamber);
        beast(g, 'lamb', x, y, 1.9);
        const t = target(chamber, x + 6, y - 6, 28, `טלה ${i + 1}`, () => {
          if (t.g.dataset.c) return;
          t.g.dataset.c = '1'; t.g.classList.add('on'); n++;
          countEl.textContent = `בלשכה: ${n}`;
          api.sfx && api.sfx.play('chime', { n: 2 + n });
          if (n === 6) { inside = 6; finish(); }
        });
        lambs.push({ t, state: 'count' });
      }
    }
    function finish() {
      phase = 'done';
      if (yes) yes.remove(); if (no) no.remove();
      W && W.avSub && W.avSub('lambsChamber', 'count', Math.max(6, inside));
      api.cite(inside > 6 ? PITUM_LINES.more : PITUM_LINES.six);
      const t = rest
        ? `שישה טלאים בדוקים בלשכה — "${PITUM_LINES.six.quote}" (${PITUM_LINES.six.source}).`
        : `${inside} טלאים בדוקים בלשכה${inside > 6 ? ' — ויותר משישה: "ומוסיפין עד לעולם"' : ''}. ${need.tomorrow ? `ומחר: ${needHe(need.tomorrow)}.` : ''}`;
      api.done({ text: t, linger: 1900, dir: { w: watered ? 1 : 0, f: fed >= 3 ? 1 : 0, n: okN }, score: okN });
    }

    // the solver (the harness): fill, feed, then look at every part of every lamb and judge by the Mishnah
    api.solver(async () => {
      press(pourB, 'down');
      while (!watered) await api.wait(10);
      press(pourB, 'up');
      for (const h of hays) { if (!h.used) press(h.t.hit, 'down'); await api.wait(20); }
      while (phase === 'need') await api.wait(20);
      if (phase === 'musaf') { for (const m of musafT) { press(m.t.hit, 'down'); await api.wait(15); } while (phase === 'musaf') await api.wait(20); }
      if (phase === 'count') { for (const L of lambs) { press(L.t.hit, 'down'); await api.wait(20); } return; }
      for (const L of lambs) {
        press(L.t.hit, 'down'); await api.wait(30);
        for (const q of parts) { press(q.t.hit, 'down'); await api.wait(15); }
        press(!(L.mark && L.mark.blemish) ? yes : no); await api.wait(40);
      }
    });
    return null;
  },
};
