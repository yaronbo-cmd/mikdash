/* ─────────────────────────────────────────────────────────────────────────────
 * ui.js: the Phase A HUD (DOM, RTL, mobile first). No game rules here: it reads the save through
 * ctx.G() and calls ctx.act.* for every decision.
 *
 * Layers (all under one .gm root, pointer-events only where needed):
 *   top bar (menu · contextual resources · mute) · goal pill · demo strip · toasts · dock (5 tabs) ·
 *   one sheet (stage / crews / caravans / book / daily / store / menu) · modal cards · world anchors
 *   (rhythm ring, combo, "+N" floats, the FTUE coach) · the vision title.
 * Per-frame work (frame()) only moves a handful of pooled elements; nothing is created per frame.
 * ──────────────────────────────────────────────────────────────────────────── */
import { CSS } from './ui.css.js';
import { PROJ, PH, PH_N, FIELD_N, FIELD_OF, SOURCES, UPGRADES, EVENTS, keyOf, keyWords, SEG } from './content.js';
import { PAY } from './content.js';   // ── econ14 ── ── /econ14 ──
import * as SHOP from './shop.js';   // ── econ14 ── אוצר המלאכה ── /econ14 ──
import {
  STAGES, stageById, RES, RES_KEYS, CHAPTERS, ROUTES, RIDX, PHASES, PHASE_AT, T, TASKS, FINDS, TRAIN, STORY, DONORS, RATE,
} from './content.js';
import { MIDDOT, MIDX, MIDDOT_CHAPTERS } from './middot.js';
// ── middot10 ── (MIDDOT10, wave 10) the book's chapter quizzes and its place links: middot-ui.js decorates the book's page
import { decorateBook } from './middot-ui.js';
import { READ, isRead, starOf, askOf } from './learn.js';   // ── hook19 ── (reading pays; the book star; the family's question)
// ── /middot10 ──
import { MISHMAROT } from '../calendar.js';
import * as S from './state.js';
// ── hook20 ── ("המסביב": real badges, the live board, the profile, the near circle, the daily riddle — hooks/around*.js, riddle*.js)
import * as AR from './hooks/around.js';
import * as ARU from './hooks/around-ui.js';
import * as RDU from './hooks/riddle-ui.js';
import * as RDL from './hooks/riddle.js';
// ── /hook20 ──

/* ───────── helpers ───────── */
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LRI = '\u2066', PDI = '\u2069';
/** a number in an LTR isolate (so "+20" stays "+20" inside Hebrew text) */
export const isoNum = (n, sign = false) => LRI + (sign && n > 0 ? '+' : '') + Math.floor(n).toLocaleString('en-US') + PDI;
/** a fraction "a/b" in ONE left-to-right isolate (FUN P1 21:31: two isolates around a neutral "/" flip in RTL: "נדבך 6/1") */
export const isoFrac = (a, b) => LRI + Math.floor(a).toLocaleString('en-US') + '/' + Math.floor(b).toLocaleString('en-US') + PDI;
/** ── build7 ── a count of a material as Hebrew says it (PLAYTEST-S6 #6): "אבן אחת" · "8 אבנים" · "12 אבנים שלמות" · "60 ארז" */
export function countTxt(k, n, sign = false) {
  const v = Math.floor(n), num = isoNum(v, sign);
  if (k === 'stone') return v === 1 && !sign ? 'אבן אחת' : `${num} אבנים`;
  if (k === 'wstone') return v === 1 && !sign ? 'אבן שלמה אחת' : `${num} אבנים שלמות`;
  return `${num} ${RES[k] ? RES[k].n : k}`;
}
const fmt = (n) => Math.floor(n).toLocaleString('en-US');
/** the meter's compact number: 999 · 1.2K · 12K */
const fmtK = (n) => { const v = Math.floor(n); return v < 1000 ? String(v) : v < 10000 ? (Math.floor(v / 100) / 10) + 'K' : Math.floor(v / 1000) + 'K'; };
/** "42%" kept together in RTL text */
const pct = (p) => LRI + Math.floor(p * 100) + '%' + PDI;
export function fmtClock(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`;
}
export function fmtSpan(ms) {
  const s = Math.round(ms / 1000);
  if (s < 90) return `${s} שנ׳`;
  const m = Math.round(s / 60);
  if (m < 90) return `${m} דק׳`;
  const h = Math.round(m / 6) / 10;
  return `${h % 1 ? h.toFixed(1) : h} שע׳`;
}

/* ───────── icons (inline SVG: consistent on every platform, no emoji fonts) ───────── */
const SVG = (body, cls = '') => `<svg class="gm-i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
const ST = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
export const ICON = {
  stone: SVG('<rect x="2.5" y="6.5" width="19" height="12" rx="1.6" fill="#CDBB94" stroke="#8C7550" stroke-width="1.3"/><rect x="5" y="9" width="14" height="7" rx=".8" fill="#DECFAC"/>'),
  cedar: SVG('<path d="M12 2.5 17.5 10H14.6L19 16.5H5L9.4 10H6.5Z" fill="#4F7F4B" stroke="#2F5A2C" stroke-width="1"/><rect x="10.9" y="16.5" width="2.2" height="4.5" fill="#7A5A36"/>'),
  bronze: SVG('<path d="M3.5 16.5 7 8.5h10l3.5 8Z" fill="#C98B4B" stroke="#8A5A2B" stroke-width="1.2"/><path d="M8 11h7" stroke="#E3B07A" stroke-width="1.2"/>'),
  gold: SVG('<path d="M3.5 16.5 7 8.5h10l3.5 8Z" fill="#EBBE4C" stroke="#A7791C" stroke-width="1.2"/><path d="M8 11h7" stroke="#FFF1BF" stroke-width="1.4"/>'),
  silver: SVG('<circle cx="12" cy="12" r="8.5" fill="#D9DCE1" stroke="#858C96" stroke-width="1.3"/><circle cx="12" cy="12" r="5.6" fill="none" stroke="#A4AAB3" stroke-width="1"/><path d="M10 11.5h4v2.5a2 2 0 0 1-4 0z" fill="#9AA1AA"/>'),
  wstone: SVG('<path d="M4.3 15.2C3.6 10.4 7.6 6.3 12.6 6.3c5 0 8.1 3.6 7.3 7.6-.8 4-5.4 5.1-9.4 4.7-3.2-.3-5.7-1.2-6.2-3.4Z" fill="#F1ECE1" stroke="#A89C86" stroke-width="1.3"/><path d="M8 13c2-.8 4.5-.9 7 .2" stroke="#CFC5B2" stroke-width="1"/>'),
  menu: SVG(`<path ${ST} d="M4 7h16M4 12h16M4 17h16"/>`),
  soundOn: SVG(`<path ${ST} d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path ${ST} d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>`),
  soundOff: SVG(`<path ${ST} d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path ${ST} d="m16 9.5 5 5m0-5-5 5"/>`),
  crew: SVG(`<path ${ST} d="M5.5 19.5 13 12"/><path ${ST} d="m11.2 6.8 3-3 6 6-3 3z"/>`),
  caravan: SVG(`<path ${ST} d="M3 14.5h13.5l2.5-5H6.5z"/><circle ${ST} cx="7.5" cy="17.5" r="2"/><circle ${ST} cx="14.5" cy="17.5" r="2"/><path ${ST} d="M19 9.5l2.5-2"/>`),
  book: SVG(`<path ${ST} d="M12 6.5C10 5 6.5 4.5 3.5 5v13c3-.5 6.5 0 8.5 1.5 2-1.5 5.5-2 8.5-1.5V5c-3-.5-6.5 0-8.5 1.5z"/><path ${ST} d="M12 6.5v13"/>`),
  vine: SVG(`<path ${ST} d="M12 3.5v4"/><path ${ST} d="M12 7.5c2.5-2.2 5.5-2 7-.5-1.5 2.5-4.5 3-7 .5z"/><circle ${ST} cx="12" cy="11" r="1.8"/><circle ${ST} cx="9.3" cy="13.8" r="1.8"/><circle ${ST} cx="14.7" cy="13.8" r="1.8"/><circle ${ST} cx="12" cy="16.6" r="1.8"/><circle ${ST} cx="12" cy="19.8" r="1.4"/>`),
  store: SVG(`<path ${ST} d="M3.5 10 12 4.5l8.5 5.5"/><path ${ST} d="M5.5 9.5V19h13V9.5"/><path ${ST} d="M10 19v-5h4v5"/>`),
  map: SVG(`<path ${ST} d="M3.5 6.5 9 4.5l6 2 5.5-2v13l-5.5 2-6-2-5.5 2z"/><path ${ST} d="M9 4.5v13M15 6.5v13"/>`),
  priest: SVG(`<circle ${ST} cx="12" cy="6.5" r="2.6"/><path ${ST} d="M7.5 20.5 9 11h6l1.5 9.5z"/><path ${ST} d="M9.5 14.5h5"/>`),
  lock: SVG(`<rect ${ST} x="6" y="11" width="12" height="9" rx="2"/><path ${ST} d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/>`),
  check: SVG(`<path ${ST} d="m5 12.5 4.5 4.5L19 7.5"/>`),
  x: SVG(`<path ${ST} d="m6.5 6.5 11 11m0-11-11 11"/>`),
  pin: SVG(`<path ${ST} d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle ${ST} cx="12" cy="10" r="2.3"/>`),
  back: SVG(`<path ${ST} d="M9 6l6 6-6 6"/>`),
  star: SVG('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="#E8B94A" stroke="#A7791C" stroke-width="1"/>'),
  hand: '<svg class="gm-hand" viewBox="0 0 40 40" aria-hidden="true"><path d="M15 36c-2.2-3-6-7.2-7.4-9.6-1-1.8.6-3.6 2.4-2.6l3.8 2.6V8.5a2.6 2.6 0 0 1 5.2 0V19l1-.3V16a2.4 2.4 0 0 1 4.8 0v3.2l1-.2v-1.4a2.4 2.4 0 0 1 4.8 0v2l.8-.1a2.3 2.3 0 0 1 3 2.2v5.6c0 3.5-1.6 6.3-3.6 8.7z" fill="#FFF8EA" stroke="#2A2016" stroke-width="1.8" stroke-linejoin="round"/></svg>',
};
// ── econ14 ── the coin: a silver shekel with match3's three pomegranates (never a Tyrian shekel: no pagan image)
ICON.coin = SVG('<circle cx="12" cy="12" r="9.6" fill="#DADDE2" stroke="#7E858F" stroke-width="1.4"/><circle cx="12" cy="12" r="7.4" fill="none" stroke="#9AA1AA" stroke-width=".9"/><path d="M12 17.2v-6.4M12 13 9.2 10.2M12 13l2.8-2.8" stroke="#4E5660" stroke-width="1.3" stroke-linecap="round" fill="none"/><circle cx="12" cy="8.4" r="1.35" fill="#4E5660"/><circle cx="8.6" cy="9" r="1.35" fill="#4E5660"/><circle cx="15.4" cy="9" r="1.35" fill="#4E5660"/>');
// ── /econ14 ──
const resIcon = (k) => ICON[RES[k] ? RES[k].icon : k] || '';
/** "40 [stone] 20 [cedar]" with the missing part in red */
function costHTML(cost, res) {
  const parts = Object.entries(cost || {}).map(([k, v]) => `<span class="${res && (res[k] || 0) + 1e-6 < v ? 'lack' : ''}" title="${esc(RES[k] ? RES[k].n : k)}">${resIcon(k)}<span class="gm-num">${fmt(v)}</span></span>`);
  return parts.length ? `<span class="gm-cost">${parts.join('')}</span>` : `<span class="gm-muted">בלי חומרים</span>`;
}
function lackText(lack) {
  return Object.entries(lack || {}).map(([k, v]) => `${RES[k] ? RES[k].n : k} ${isoNum(v)}`).join(', ');
}
/** an exact quote + ref, or a plain line + ref (content items) */
// ── director13 ── (N76a, PRODUCER-S12: "'חפירה עד הסלע' on the altar's ledge is untrue") above the yesod nothing is dug: the step
// levels the top of the tier already laid for the next one (an altar of whole stones, מדות ג, ד); elsewhere the dig goes down
// to the rock. → { pill, act, say, row } for site `id`'s dig
const DIG_ON = { sovev: 'ראש היסוד', guf: 'ראש הסובב', karnot: 'ראש המזבח' };
export function digWords(id) {
  const on = DIG_ON[id];
  return on ? { pill: `יישור ${on}`, act: `ישר את ${on}`, say: `מיישרים את ${on}`, row: 'יישור' }
    : { pill: 'חפירה עד הסלע', act: 'חפור עד הסלע', say: 'חופרים עד הסלע', row: '' };
}
/** ── director13 ── (GAMES13's request, PRODUCER-S13a #12: "הביאו 4 אבנים · 80 נחושת" for a bronze laver) what a segment brings
    to site `id`: the kiyor's bronze castings, else stones → { n: "N אבנים" | "אבן אחת" | "N יציקות נחושת" | "יציקה אחת", one } */
export function segWords(id, n) {
  const cast = id === 'kiyor';
  return { n: n === 1 ? (cast ? 'יציקה אחת' : 'אבן אחת') : `${isoNum(n)} ${cast ? 'יציקות נחושת' : 'אבנים'}`, one: n === 1 };
}
// ── /director13 ──
export function srcHTML(o) {
  if (!o) return '';
  return `${o.q ? `<p class="gm-q">"${esc(o.q)}"</p>` : ''}${o.d ? `<p>${esc(o.d)}</p>` : ''}${o.ref ? `<span class="gm-ref">${esc(o.ref)}</span>` : ''}`;
}

/* ───────── the UI ───────── */
export function createUI({ root, ctx }) {
  const doc = root.ownerDocument || document;
  const PURSE = `<button class="gm-chip gm-purse" data-a="shop" data-r="silver" aria-label="${PAY.shop.n}: המטבעות שלך">${ICON.coin}<span class="gm-num"></span></button>`;   // ── econ14 ── ── /econ14 ──
  let rootEl = null, style = null, sheetKind = null, sheetArg = null, modalOpen = 0, whole = false;
  const E = {};                     // element refs
  const floats = [], FLOATS = 10;
  const anchor = { ring: null, coach: null };
  let bookCh = 0, bookSel = null, confirmNew = false;

  function mount() {
    if (rootEl) return;
    if (!doc.getElementById('gm-css')) { style = doc.createElement('style'); style.id = 'gm-css'; style.textContent = CSS; doc.head.appendChild(style); }
    rootEl = doc.createElement('div');
    rootEl.className = 'gm';
    rootEl.innerHTML = `
      <div class="gm-top">
        <button class="gm-rb" data-a="sheet" data-k="menu" aria-label="${T.menu}">${ICON.menu}</button>
        <div class="gm-res" role="group" aria-label="המלאי שלך: הקש על חומר כדי לראות מאיפה משיגים אותו"></div>
        <div class="gm-xp gm-hidden" role="group" data-a="sheet" data-k="profile" aria-label="הכהן שלי: רמה ופרופיל"><span class="gm-xp-ic" aria-hidden="true"></span><span class="gm-xp-tx"><b></b><small></small></span><span class="gm-xp-bar" aria-hidden="true"><i></i><em class="gm-num"></em></span></div>
        <button class="gm-chip gm-name gm-hidden" data-a="sheet" data-k="profile">${ICON.priest}<span></span></button>
      </div>
      <button class="gm-sc gm-hidden" type="button" data-a="sheet" data-k="treasure"><span class="gm-sc-r"><svg viewBox="0 0 36 36" aria-hidden="true"><circle class="bg" cx="18" cy="18" r="15.5" pathLength="100"/><circle class="fg" cx="18" cy="18" r="15.5" pathLength="100" stroke-dasharray="0 100"/></svg><b></b></span><span class="gm-sc-n"><i aria-hidden="true">★</i><span class="gm-num">0</span></span></button><!-- ── hook19 ── the master score's capsule -->
      <div class="gm-goal"><button class="gm-pill" data-a="goal"></button><button class="gm-pill-alt gm-hidden" data-a="kingsOffer"></button></div>
      <div class="gm-demo gm-hidden"><button class="gm-demo-x" data-a="demoExit" aria-label="${T.demoExit}: ${T.demoBadge}">${T.demoExit} ✕</button><button data-a="pickStage" aria-label="${T.demoPickTitle}">${T.demoPick}</button></div>
      <div class="gm-toasts" aria-live="polite"></div>
      <div class="gm-dock"><nav aria-label="תפריט המשחק">
        <button class="gm-db" data-a="sheet" data-k="crews" aria-pressed="false">${ICON.crew}<span>${T.crews}</span><i class="gm-badge gm-hidden"></i></button>
        <button class="gm-db" data-a="kings" data-k="kings" aria-pressed="false">${ICON.caravan}<span>מלכים</span><i class="gm-badge gm-hidden"></i></button>
        <button class="gm-db" data-a="sheet" data-k="book" aria-pressed="false">${ICON.book}<span>${T.book}</span><i class="gm-badge gold gm-hidden"></i></button>
        <button class="gm-db" data-a="sheet" data-k="daily" aria-pressed="false">${ICON.vine}<span>${T.daily}</span><i class="gm-badge gold gm-hidden"></i></button>
        <button class="gm-db" data-a="sheet" data-k="store" aria-pressed="false">${ICON.map}<span>הפרויקט</span><i class="gm-badge gold gm-hidden"></i></button>
        <button class="gm-db" data-a="sheet" data-k="profile" aria-pressed="false">${ICON.priest}<span>הכהן</span><i class="gm-badge gm-hidden"></i></button>
        <button class="gm-db" data-a="sheet" data-k="circle" aria-pressed="false">${ICON.crew}<span>המשמר</span><i class="gm-badge gm-hidden"></i></button>
      </nav></div>
      <section class="gm-deal" role="dialog" aria-modal="false" aria-hidden="true" aria-label="מה נעשה עכשיו?"></section>
      <section class="gm-sheet" role="dialog" aria-modal="false" aria-hidden="true"><div class="gm-sh-h"><h2></h2><span class="gm-draft">${T.draft}</span><button class="gm-x" data-a="close" aria-label="${T.close}">${ICON.x}</button></div><div class="gm-sh-b"></div></section>
      <div class="gm-anchor gm-ring" aria-hidden="true"><b></b><i></i><em>עכשיו!</em><u>${ICON.hand}</u><s></s><small>הקש כשהטבעת נוגעת בזהב</small></div>`/* ── econ14 ── (D3: the gold target, the blue ring, "עכשיו!", the teach's hand, the feedback line) ── /econ14 ── */ + `
      <div class="gm-anchor gm-combo" aria-hidden="true"></div>
      <div class="gm-anchor gm-plate gm-hidden" aria-hidden="true"></div>
      <div class="gm-anchor gm-mark gm-hidden" aria-hidden="true"><i class="gm-mark-ring"></i><b class="gm-mark-ptr"><svg viewBox="0 0 40 56" aria-hidden="true"><path d="M13 3h14v25h9L20 52 4 28h9z" fill="#FFD66E" stroke="#5A3A0A" stroke-width="3" stroke-linejoin="round"/></svg></b></div>
      <div class="gm-anchor gm-coach gm-hidden"><div class="gm-hand-wrap">${ICON.hand}</div></div>
      <div class="gm-bub gm-hidden" role="status" aria-live="polite"></div>
      <div class="gm-vision" aria-live="polite"><h1></h1></div>
      <button class="gm-cine gm-hidden" type="button" aria-label="דלג על הפתיחה"><span>הקש כדי לדלג</span></button>
      <button class="gm-btn gm-btn-gold gm-back gm-hidden" data-a="exitWhole">${ICON.back}<span>${T.backToGame}</span></button>
      <div class="gm-banner" role="status" aria-live="polite"></div>
      <div class="gm-stamp" aria-hidden="true"><i class="gm-st-rays"></i><b class="gm-st-t"></b></div>`   // ── land17 ── the banner and the stamp (below)
      // ── ux24 ── (docs/UX24.md ⚑ the orientation) the game is built for a phone held sideways (the owner, 5.10: "לרוחב"): held upright
      // on a phone, a card asks to turn it; "להמשיך לאורך" lets him play upright anyway (the old taps-only game), once a session
      + `<div class="gm-turn gm-hidden" role="dialog" aria-label="סובבו את הטלפון"><div class="gm-turn-c"><i class="gm-turn-ph" aria-hidden="true"></i><b>סובבו את הטלפון</b><span>המשחק לרוחב — שתי ידיים!</span><button type="button" class="gm-turn-x">להמשיך לאורך</button></div></div>`;   // ── /ux24 ──
    root.appendChild(rootEl);
    ARU.injectCSS(doc);   // ── hook20 ──
    // ── ux24 ── the turn card: a phone (a coarse pointer, ≤ 640 px wide) held upright; not under a test driver unless asked
    {
      const tc = rootEl.querySelector('.gm-turn'); let skip = false;
      try { skip = sessionStorage.getItem('bh_ux24_upright') === '1'; } catch (e) { /* */ }
      const want = () => { try { const w = globalThis.innerWidth, h = globalThis.innerHeight; if (skip || !(h > w) || w > 640) return false; if (globalThis.__UX24_TURN != null) return !!globalThis.__UX24_TURN; return !navigator.webdriver && !!(globalThis.matchMedia && matchMedia('(pointer: coarse)').matches) && !/[?&]upright=1\b/.test(location.search || ''); } catch (e) { return false; } };
      const sync = () => { if (tc) tc.classList.toggle('gm-hidden', !want()); };
      tc.querySelector('.gm-turn-x').addEventListener('click', () => { skip = true; try { sessionStorage.setItem('bh_ux24_upright', '1'); } catch (e) { /* */ } sync(); });
      globalThis.addEventListener('resize', sync); globalThis.addEventListener('orientationchange', sync); sync();
      E.turnSync = sync;
    }
    // ── /ux24 ──
    const q = (s) => rootEl.querySelector(s);
    Object.assign(E, {
      res: q('.gm-res'), mute: q('[data-a="mute"]'), pill: q('.gm-pill'), pillAlt: q('.gm-pill-alt'), demo: q('.gm-demo'), toasts: q('.gm-toasts'),
      dock: q('.gm-dock'), sheet: q('.gm-sheet'), shTitle: q('.gm-sheet h2'), shBody: q('.gm-sh-b'),
      ring: q('.gm-ring'), ringI: q('.gm-ring i'), ringB: q('.gm-ring b'), ringFb: q('.gm-ring s'),   /* ── econ14 ── the feedback line ── /econ14 ── */
      combo: q('.gm-combo'), coach: q('.gm-coach'), bub: q('.gm-bub'),
      vision: q('.gm-vision'), visionH: q('.gm-vision h1'), back: q('.gm-back'), top: q('.gm-top'), goal: q('.gm-goal'),
      cine: q('.gm-cine'), name: q('.gm-name'), plate: q('.gm-plate'), mark: q('.gm-mark'),   // ── flow8 ──
      deal: q('.gm-deal'),   // ── fun14 ──
      banner: q('.gm-banner'), stamp: q('.gm-stamp'), stampT: q('.gm-st-t'), menuBtn: q('.gm-rb'),   // ── land17 ──
      sc: q('.gm-sc'), scFg: q('.gm-sc .fg'), scN: q('.gm-sc-n .gm-num'), scC: q('.gm-sc-r b'),   // ── hook19 ── ── /hook19 ──
      xp: q('.gm-xp'), xpIc: q('.gm-xp-ic'), xpN: q('.gm-xp-tx b'), xpLv: q('.gm-xp-tx small'), xpFill: q('.gm-xp-bar i'), xpNum: q('.gm-xp-bar em'),   // ── hud18 ── ── /hud18 ──
    });
    E.cine.addEventListener('click', (e) => { e.stopPropagation(); const f = cineSkip; cineSkip = null; if (f) f(); });
    for (let k = 0; k < FLOATS; k++) { const f = doc.createElement('div'); f.className = 'gm-anchor gm-float'; rootEl.appendChild(f); floats.push({ el: f, t0: -1, dur: 1, x: 0, y: 0 }); }
    rootEl.addEventListener('click', onClick);
    rootEl.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (sheetKind) closeSheet(); } });
    doc.body.classList.add('gm-on');
    pillLast = '';                        // (a fresh pill element: render it even if the text is unchanged)
    addEventListener('resize', onResize);   // ── hud18 ── (a turned phone: the top row is measured at once, not at the next second's refresh)
    refresh();
  }
  const onResize = () => { topSig = ''; if (rootEl) fitTop(ctx.G()); };   // ── hud18 ── ── /hud18 ──
  function destroy() {
    if (!rootEl) return;
    rootEl.remove(); rootEl = null;
    doc.body.classList.remove('gm-on', 'gm-view', 'gm-demo-on');
    tq.length = 0; clearTimeout(tPump); tCur = null;   // ── build7 ── the toast queue
    bq.length = 0; if (bCur) { clearTimeout(bCur.tm); bCur.res(); bCur = null; } if (stampRun) { clearTimeout(stampRun.tm); clearTimeout(stampRun.t0); stampRun.res(); stampRun = null; }   // ── land17 ──
    ctReset(); removeEventListener('resize', onResize);   // ── hud18 ── ── /hud18 ──
  }

  /* ───────── events ───────── */
  function onClick(e) {
    // ── build6 ── FUN's sheets (orders, daily, album): their buttons carry data-fun
    const fb = e.target.closest('[data-fun]');
    if (fb && rootEl.contains(fb) && ctx.act.funTap) { ctx.act.funTap(fb); renderSheet(); return; }
    // ── games10 ── the classic games' buttons (menu section) carry data-g10; src/games registers __BH_PARTS.games
    const g10 = e.target.closest('[data-g10]');
    if (g10 && rootEl.contains(g10)) { const P = (globalThis.__BH_PARTS || {}).games; if (P && typeof P.open === 'function') { if (ctx.sfx) ctx.sfx.play('ui'); closeSheet(); P.open(g10.dataset.g10); } return; }
    // ── /games10 ──
    const b = e.target.closest('[data-a]');
    if (!b || !rootEl.contains(b)) return;
    const a = b.dataset.a, d = b.dataset, act = ctx.act;
    if (ctx.sfx && a !== 'mute') { const ti = b.classList.contains('gm-db') && ctx.sfx.has && ctx.sfx.has('tab') ? [...b.parentNode.children].indexOf(b) : -1; if (ti >= 0) ctx.sfx.play('tab', { i: ti }); else ctx.sfx.play('ui'); }   // ── hud18 ── (MUSIC18's `tab` { i: 0…4 } when it exists) ── /hud18 ──
    switch (a) {
      case 'sheet': toggleSheet(d.k, d.arg); break;
      case 'close': closeSheet(); break;
      case 'goal': act.goal(); break;
      case 'kingsOffer': if (act.kingsOffer) act.kingsOffer(d.p, d.o); break;
      case 'mute': act.setSetting('mute', !ctx.settings().mute); refresh(); break;
      case 'skipChapter': act.skipChapter(); break;
      case 'pickStage': act.pickStage(); break;   // ── supervisor (30.9) ── the demo's stage picker (and the next stage)
      case 'skipStage': act.skipStage(); break;
      case 'exitWhole': act.exitWhole(); break;
      case 'start': act.startBuild(d.id); break;
      case 'focus': act.focus(d.id); break;
      case 'moment': closeSheet(); act.moment(d.id); break;
      case 'crew': act.assignCrew(+d.i, d.at === 'none' ? null : d.at); renderSheet(); break;
      case 'crewHere': act.crewHere(d.id, +d.dir); renderSheet(); break;
      case 'send': act.startCaravan(d.r, d.len); renderSheet(); break;
      case 'collect': act.collectCaravan(+d.k); renderSheet(); break;
      case 'train': act.train(); renderSheet(); break;
      case 'quiz': act.quizOpen(); break;
      case 'vol': act.volunteers(d.id); renderSheet(); break;
      case 'bookCh': bookCh = +d.c; bookSel = null; renderSheet(); break;
      case 'mishnah': bookSel = d.id; act.readMishnah(d.id); renderSheet(); E.shBody.scrollTop = 0; break;
      case 'bookBack': bookSel = null; renderSheet(); break;
      case 'bookRead': act.bookRead(d.id); renderSheet(); break;   // ── hook19 ──
      case 'where': closeSheet(); act.focus(d.id); break;
      case 'set': act.setSetting(d.k, !(ctx.settings()[d.k])); renderSheet(); refresh(); break;
      case 'setv': act.setSetting(d.k, d.v); renderSheet(); refresh(); break;   // ── land17 ── a choice of two words (cam, popups)
      case 'demo': act.toggleDemo(); break;
      case 'demoExit': if (act.exitDemo) act.exitDemo(); else act.toggleDemo(); break;   // ── flow8 ── the demo's exit chip
      case 'whole': closeSheet(); act.enterWhole(); break;
      case 'avodah': closeSheet(); act.enterAvodah(); break;
      case 'yard44': closeSheet(); if (act.openYard) act.openYard(); break;   // ── fable32 (build 44) ── חצר האומנים ── /fable32 ──
      case 'scenes': closeSheet(); if (window.__openScenes) window.__openScenes(d.k || 'tour'); break;   // ── scenes ──
      case 'newGame': if (!confirmNew) { confirmNew = true; renderSheet(); } else { confirmNew = false; closeSheet(); act.newGame(); } break;
      case 'newNo': confirmNew = false; renderSheet(); break;
      case 'quarry': closeSheet(); act.heroQuarry(); break;
      // ── build6 ── the site panel, the meter, the kings, the upgrades
      case 'build': act.build(d.id); break;
      case 'play': closeSheet(); act.play(d.id); break;
      case 'playField': closeSheet(); act.playField(d.k); break;
      case 'key': closeSheet(); act.key(d.id); break;
      case 'inspect': closeSheet(); act.inspect(d.id); break;
      case 'work': closeSheet(); act.work(d.id); break;
      case 'kings': closeSheet(); act.kings(); break;
      case 'upgrade': act.upgrade(d.k); renderSheet(); break;
      case 'shop': coinsSkip(); if (sheetKind === 'shop') closeSheet(); else openSheet('shop'); break;   // ── econ14 ── the purse
      case 'buy': if (act.buy) act.buy(d.k); renderSheet(); refresh(); break;   // ── econ14 ── ── /econ14 ──
      case 'node': act.focus(d.id); openSheet('stage', d.id); break;
      case 'replay': closeSheet(); if (act.replayMoment) act.replayMoment(d.k); break;
      // ── fun14 ── the deal's cards, its ↻ and its close
      case 'jobPick': if (act.jobPick) act.jobPick(d.job); break;
      case 'jobRe': if (act.jobRedeal) act.jobRedeal(); break;
      case 'jobClose': if (act.dealClose) act.dealClose(); break;
      // ── /fun14 ──
      default: if (String(a).startsWith('around')) { try { ARU.handle(a, d, { ui: { openSheet, renderSheet, toast, closeSheet }, ctx, store: S.storage, reload: () => { try { location.reload(); } catch (e) { /* no reload */ } } }, b); } catch (e) { console.warn('[hook20]', e); } } break;   // ── hook20 ──
    }
  }

  /* ───────── HUD ───────── */
  function refresh() {
    if (!rootEl) return;
    const G = ctx.G(), set = ctx.settings();
    // resources: what the current goal needs, plus silver
    const keys = S.hudRes(G);
    const want = keys.join(',');
    if (E.res.dataset.keys !== want) {
      E.res.dataset.keys = want; ctChips = null;   // ── hud18 ── (the chips are new elements: the counters' map is rebuilt)
      E.res.innerHTML = keys.map((k) => k === 'silver' ? PURSE /* ── econ14 ── the silver chip is the purse: it opens אוצר המלאכה ── /econ14 ── */ : `<button class="gm-chip" data-a="sheet" data-k="res" data-arg="${k}" data-r="${k}" aria-label="${esc(RES[k].n)}: מאיפה משיגים">${resIcon(k)}<span class="gm-num"></span>${k === 'stone' ? '<small class="gm-chip-tag gm-hidden">לחומה</small>' : ''}</button>`).join('');
    }
    // ── build7 ── the Mount's surplus reads as a plan: "מלאי לחומה" (PLAYTEST-S6 #9)
    const plan = S.stockPlan(G), sc = E.res.querySelector('[data-r="stone"]'), tag = sc && sc.querySelector('.gm-chip-tag');
    if (tag && tag.classList.contains('gm-hidden') === !!plan) { tag.classList.toggle('gm-hidden', !plan); sc.setAttribute('aria-label', plan ? `אבן: מלאי לחומה. מאיפה משיגים` : 'אבן: מאיפה משיגים'); }
    const need = (() => { const a = S.nextAction(G); return a.cost || {}; })();   // (a 'deal' is a 'play' underneath: the same need)
    // ── hud18 ── the chip's number is the model's shown value (ctPaintChip): the real stock minus what a flight still holds and what a bump is still ticking up
    for (const c of E.res.children) { const k = c.dataset.r, v = G.res[k] || 0, ct = ctOf(k); ct.real = v; ct.need = need[k] || 0; if (!(coinRun && k === 'silver')) ctPaintChip(k, c);   /* ── econ14 ── (the purse counts up with its coins) ── /econ14 ── */   /* ── flow16 ── (short: "have / the crews need") ── /flow16 ── */
      c.classList.toggle('low', need[k] > v + 1e-6); c.classList.toggle('need', need[k] > 0);
      c.classList.toggle('ux-zero', !(v > 0) && !(need[k] > 0) && k !== 'silver'); }   // ── ux24 ── (an empty chip says nothing to a kid: it waits until he has some) ── /ux24 ──
    // ── /hud18 ──
    if (E.mute) { E.mute.innerHTML = set.mute ? ICON.soundOff : ICON.soundOn; E.mute.setAttribute('aria-pressed', set.mute ? 'true' : 'false'); }
    refreshPill(G);
    // ── flow8 ── the player's name on a HUD chip (the first word; the whole name and the mishmar in its label)
    const nm = G.name ? String(G.name).trim() : '';
    if (E.name.dataset.n !== nm) { E.name.dataset.n = nm; E.name.querySelector('span').textContent = nm.split(/\s+/)[0] || ''; E.name.setAttribute('aria-label', nm ? `${T.kohen(nm)}${G.mishmar ? ` · משמר ${MISHMAROT[G.mishmar - 1] || ''}` : ''}: התפריט` : ''); }
    E.name.classList.toggle('gm-hidden', !nm || whole);
    fitTop(G);   // ── flow11 ── (N18: after the name chip — it takes the row's room)
    score();   // ── hook19 ──
    // demo
    E.demo.classList.toggle('gm-hidden', !G.demo || whole);
    doc.body.classList.toggle('gm-demo-on', !!G.demo && !whole);
    badges();
    if (sheetKind) renderSheet();
  }
  /** ── flow11 ── (PRODUCER10/11 N18: "the silver chip '0' half off-screen" — six chips, the name and the 44-px menu on a 390-px
      phone) the top row fits: when its chips overflow, tighter chips (.gm-tight), then no tag and the name as its icon
      (.gm-tighter). Measured only when what the row shows changes (its texts, the name, the width) */
  let topSig = '';
  function fitTop(G) {
    const top = E.top; if (!top || !E.res) return;
    const sig = `${E.res.textContent}|${E.name.classList.contains('gm-hidden') ? '' : G.name || ''}|${typeof innerWidth === 'number' ? innerWidth : 0}|${whole}|${E.xp.classList.contains('gm-hidden') ? 0 : 1}`;   // ── hud18 ── (the xp slot takes the row's room) ── /hud18 ──
    if (sig === topSig) return;
    topSig = sig;
    top.classList.remove('gm-tight', 'gm-tighter', 'gm-tightest');
    const over = () => E.res.scrollWidth > E.res.clientWidth + 1;
    if (over()) { top.classList.add('gm-tight'); if (over()) { top.classList.add('gm-tighter'); if (over()) top.classList.add('gm-tightest'); } }   // ── hud18 ── (+ the xp slot's third step) ── /hud18 ──
  }
  /* the goal pill alone (the hooks call it every second: a waiting goal counts down) */
  let pillLast = '';
  function refreshPill(G = ctx.G()) {
    if (!rootEl) return;
    // ── ux24 ── (docs/UX24.md #1) the first-time flow shows only what the kid needs: the empty chips, the five tabs, "מבט על" and an
    // uncharged "יד של אומן" wait (ui.css.js `ux-early`) until the flow ends (G.ftue 99) ── /ux24 ──
    rootEl.classList.toggle('ux-early', !(G.ftue >= 99) && !G.demo);
    const a = S.nextAction(G, ctx.act.dealOpt ? ctx.act.dealOpt() : null);
    // ── flow8 ── the delivery beat: while a segment's stones arrive the pill says so (the next prompt waits for it)
    const hold = ctx.act.pillHold ? ctx.act.pillHold() : '';
    const jp = !hold && ctx.act.jobPill ? ctx.act.jobPill(a) || '' : '';   // ── fun14 ── the course loop's pill (מה נעשה עכשיו? · ●●○) ── /fun14 ──
    const h = hold ? `<span class="gm-k">באתר</span>${ICON.stone}<span>${a.id && stageById(a.id) ? `<b>${esc(stageById(a.id).n)}</b>` : ''} <span class="gm-sub">· ${esc(hold)}</span></span>` : jp || pillHTML(G, a);
    // ── ux24 ── (docs/UX24.md #2) under two thumbs nothing is tapped on the world: the pill's "· הקש על הכהן / על סלע" lied to the
    // kid, and "אבן 2 מתוך 32" was a second count no one follows — the pill keeps the goal and the course ── /ux24 ──
    const hx = rootEl.classList.contains('tw-on') ? uxPill(h) : h;
    if (hx !== pillLast) { pillLast = hx; E.pill.innerHTML = hx; }
    E.pill.classList.toggle('attn', !!jp || ['moment', 'start', 'key', 'play', 'deal', 'build', 'inspect', 'check'].includes(a.kind));
    E.pill.classList.toggle('play', !jp && (a.kind === 'play' || a.kind === 'deal'));
    E.pill.classList.toggle('jobs', !!jp);   // ── fun14 ──
    // build6: the king's offer beside a board for cedar / gold / bronze (silver's sink): "⚓ צור וצידון: 60 ארז ב־5 כסף"
    // build7: beside a king's deal (a bronze need), the board is the second chip: "▶ מכרות הזהב"
    const kb = a.kind === 'deal' ? null : E.pillAlt && ctx.act.kingsBest ? ctx.act.kingsBest(a) : null;
    if (E.pillAlt) {
      const alt = a.kind === 'deal' ? `▶ ${FIELD_N[a.play.field] || 'משחק האוצר'}` : kb ? `⚓ ${kb.who}: ${isoNum(kb.n)} ${RES[kb.res].n} ${kb.cost ? `ב־${isoNum(kb.cost)} כסף` : 'במתנה'}` : '';
      E.pillAlt.classList.toggle('gm-hidden', !alt); rootEl.classList.toggle('alt-on', !!alt);   // ── hud18 ── (the toasts clear the second chip) ── /hud18 ──
      if (alt && E.pillAlt.textContent !== alt) E.pillAlt.textContent = alt;
      if (a.kind === 'deal') { E.pillAlt.dataset.a = 'play'; E.pillAlt.dataset.id = a.id || ''; }
      else if (kb) { E.pillAlt.dataset.a = 'kingsOffer'; E.pillAlt.dataset.p = kb.partner; E.pillAlt.dataset.o = kb.offer; }
    }
    E.pill.dataset.kind = jp ? 'jobs' : a.kind;   // ── fun14 ──
  }
  // ── fun14 ── "מה נעשה עכשיו?" (src/game/jobs.js): two big cards — the gesture's looping hand, the name, the trade, "עד N מטבעות",
  // "חדש!" — one ↻ and a close (a free tap on him still strikes). v: index.js dealView, or null to hide it
  const HANDS = { tap: 'tap', drag: 'drag', rub: 'rub', pull: 'pull', hold: 'hold', circle: 'circle', draw: 'drag' };
  /* what the job builds, drawn behind the hand (viewBox 0 0 120 60; stone #E3D2AC, wood #8B5A2B, gold #E8B94A) */
  const ST = 'fill="#E3D2AC" stroke="#7A5E36" stroke-width="1.5"', WD = 'stroke="#8B5A2B" stroke-width="4" fill="none"';
  const GLYPH = {
    arch: `<path d="M22 56V34a38 38 0 0 1 76 0v22h-12V36a26 26 0 0 0-52 0v20z" ${ST}/><path d="M52 6h16l-2 12h-12z" fill="#F2CF77" stroke="#7A5E36"/>`,
    F1: `<path d="M4 34h112v22H4z" ${ST}/><path d="M4 12h30v20H4zM36 12h22v20H36zM88 12h28v20H88z" ${ST}/><path d="M60 12h26v20H60z" fill="rgba(255,214,110,.35)" stroke="#E8B94A" stroke-dasharray="4 3"/>`,
    key: `<path d="M60 2v18" ${WD}/><path d="M60 20a5 5 0 1 0 5 5" stroke="#555" stroke-width="3" fill="none"/><path d="M36 32h48v24H36z" ${ST}/>`,
    strike: `<path d="M30 40h60v16H30z" ${ST}/><path d="M66 8l14 26" stroke="#555" stroke-width="5"/><path d="M48 14l26 10" ${WD}/><circle cx="72" cy="40" r="5" fill="#FFD66E"/>`,
    line: `<path d="M8 40h104v16H8z" ${ST}/><path d="M12 30v14M108 30v14" ${WD}/><path d="M12 36L60 22l48 14" stroke="#C0392B" stroke-width="3" fill="none"/>`,
    column: `<path d="M50 6h20v50H50z" fill="#F4EFE4" stroke="#7A5E36" stroke-width="1.5"/><path d="M44 4h32v6H44zM44 52h32v6H44z" ${ST}/><path d="M70 10l30 40" stroke="#CDBB93" stroke-width="2"/>`,
    tread: `<circle cx="60" cy="30" r="24" ${WD}/><path d="M60 6v48M36 30h48M43 13l34 34M77 13L43 47" stroke="#8B5A2B" stroke-width="2"/>`,
    letters: `<path d="M20 10h80v42H20z" ${ST}/><text x="60" y="38" text-anchor="middle" font-size="18" font-weight="800" fill="#5A3A0A" font-family="Heebo,sans-serif">לבית</text>`,
    saw: `<path d="M14 40h92v12H14z" fill="#B9874F" stroke="#6B4A2A"/><path d="M30 16h60v10H30z" fill="#C9CED6" stroke="#555"/><path d="M30 26l5 6 5-6 5 6 5-6 5 6 5-6 5 6 5-6 5 6 5-6 5 6 5-6" stroke="#555" fill="none"/>`,
    gold: `<path d="M24 8h72v46H24z" fill="#E8B94A" stroke="#8B6A14" stroke-width="2"/><path d="M40 20l6 6-6 6-6-6zM78 32l4 4-4 4-4-4z" fill="#FFF6C0"/>`,
    plaster: `<path d="M16 22h88v34H16z" ${ST}/><path d="M16 22h88v14H16z" fill="#FFFFFF" stroke="#7A5E36"/>`,
    bronze: `<path d="M24 8h72v46H24z" fill="#C88A3A" stroke="#6B4A1E" stroke-width="2"/><path d="M60 8v46" stroke="#6B4A1E" stroke-width="2"/>`,
    wheel: `<circle cx="60" cy="24" r="18" ${WD}/><path d="M60 6v36M42 24h36" stroke="#8B5A2B" stroke-width="2"/><path d="M34 48h52v10H34z" fill="#4C8DB8"/>`,
    waves: `<path d="M24 8h72v9H24zM18 17h72v9H18zM24 26h72v9H24zM18 35h72v9H18zM24 44h72v9H24z" ${ST}/>`,
    rafts: `<path d="M0 46q15-8 30 0t30 0 30 0 30 0v14H0z" fill="#4C8DB8"/><path d="M26 34h68v8H26zM26 26h68v8H26z" fill="#B9874F" stroke="#6B4A2A"/>`,
    quarry: `<path d="M10 56l20-40h60l20 40z" fill="#CDBB93" stroke="#7A5E36"/><path d="M44 30h32v18H44z" ${ST}/>`,
    aqueduct: `<path d="M6 44h108v12H6z" ${ST}/><path d="M10 40h100" stroke="#4C8DB8" stroke-width="5"/><path d="M20 44v-8M60 44v-8M100 44v-8" stroke="#7A5E36" stroke-width="2"/>`,
  };
  const glyph = (job) => (GLYPH[job] ? `<svg class="gm-jc-g" viewBox="0 0 120 60" aria-hidden="true">${GLYPH[job]}</svg>` : '');
  function deal(v) {
    if (!rootEl || !E.deal) return;
    if (!v) { E.deal.classList.remove('on'); E.deal.setAttribute('aria-hidden', 'true'); rootEl.classList.remove('deal-open'); return; }
    const pips = (v.pips || []).map((p) => `<i class="${p ? 'on' : ''}"></i>`).join('');
    const card = (c) => `<button type="button" class="gm-jc ${c.kind === 'craft' ? 'craft' : 'stone'}" data-a="jobPick" data-job="${esc(c.job)}" aria-label="${esc(c.n)}${c.isNew ? ', חדש' : ''}: עד ${isoNum(c.coins)} מטבעות">
        <span class="gm-jc-art">${glyph(c.art || c.job)}<span class="gm-jc-hand h-${HANDS[c.hand] || 'tap'}">${ICON.hand}</span>${c.isNew ? '<b class="gm-jc-new">חדש!</b>' : ''}</span>
        <span class="gm-jc-trade">${esc(c.trade)}${c.lv > 1 ? ` · רמה ${isoNum(c.lv)}` : ''}</span><b class="gm-jc-n">${esc(c.n)}</b>
        <span class="gm-jc-pay">${ICON.silver || ''}עד ${isoNum(c.coins)} מטבעות</span>${c.src && c.src.ref ? `<small class="gm-jc-src">${esc(c.src.ref)}</small>` : ''}</button>`;
    const q = v.quarry ? `<button type="button" class="gm-jc quarry" data-a="jobPick" data-job="quarry"><span class="gm-jc-art">${glyph('quarry')}<span class="gm-jc-hand h-tap">${ICON.hand}</span></span><b class="gm-jc-n">${esc(v.quarry.label)}</b><span class="gm-jc-pay">${esc(v.quarry.sub)}</span></button>` : '';
    E.deal.innerHTML = `<div class="gm-deal-h"><div><h2>${esc(v.title)} <span class="gm-draft">${T.draft}</span></h2><span class="gm-deal-sub">${esc(v.place)} · ${esc(v.course)} <span class="gm-pips">${pips}</span></span></div>${v.re ? '<button type="button" class="gm-deal-re" data-a="jobRe" aria-label="זוג אחר">↻ זוג אחר</button>' : ''}<button class="gm-x" data-a="jobClose" aria-label="${T.close}">${ICON.x}</button></div>
      ${v.tip ? `<p class="gm-deal-tip">${esc(v.tip)}</p>` : ''}<div class="gm-deal-cards${v.quarry && !(v.cards || []).length ? ' one' : ''}${v.quarry && (v.cards || []).length ? ' extra' : ''}">${(v.cards || []).map(card).join('') + q}</div>`;   // ── flow16 ── (the extra card beside the jobs when the stock is out) ── /flow16 ──
    E.deal.classList.add('on'); E.deal.setAttribute('aria-hidden', 'false'); rootEl.classList.add('deal-open');
  }
  // ── /fun14 ──
  // ── ux24 ── the pill's words for two thumbs (exported for the test through ui.uxPill)
  function uxPill(h) {
    return String(h || '').replace(/ ?· (?:סתת: )?הקש(?:ו)?(?: על [^<·]*)?(?=<|$| ·)/g, '').replace(/ · אבן [^<·]*מתוך[^<·]*(?=<| ·|$)/g, '');
  }
  // ── /ux24 ──
  /* the ONE prominent action (state.js nextAction) */
  function pillHTML(G, a) {
    const d = a.id ? stageById(a.id) : null, n = d ? `<b>${esc(d.n)}</b>` : '';
    const ring = (p) => `<svg class="gm-prog" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="var(--gm-bar)" stroke-width="3.2"/><circle cx="12" cy="12" r="9" fill="none" stroke="var(--gm-gold-hi)" stroke-width="3.2" stroke-dasharray="${(56.5 * p).toFixed(1)} 60" transform="rotate(-90 12 12)" stroke-linecap="round"/></svg>`;
    const sub = (t) => ` <span class="gm-sub">· ${t}</span>`;
    const stepName = (x) => (x.step === 'seg' ? 'למקטע הבא' : x.step === 'finish' ? `ל${esc(G.st[x.id] && PROJ[x.id].fin[G.st[x.id].fd] ? PROJ[x.id].fin[G.st[x.id].fd].n : 'גימור')}` : x.step === 'dig' ? 'לחפירה' : 'למדידה');
    switch (a.kind) {
      case 'moment': return `<span class="gm-k">${T.goal}</span>${ICON.star}<span>${n}${sub(T.momentReady)}</span>`;
      case 'key': return `<span class="gm-k">בידיים שלך</span>${ICON.star}<span>${n}${sub(keyWords(a).sub)}</span>`;   // ── flow9 ── one verb per game (content.js keyWords)
      case 'event': return `<span class="gm-k">באתר</span>${ICON.crew}<span>${n}${sub(`${esc(EVENTS[a.ev].n)} · הקש על האתר`)}</span>`;
      case 'inspect': return `<span class="gm-k">המהנדס</span>${ICON.check}<span>${n}${sub('הבדיקה: האנך והפלס')}</span>`;
      case 'check': return `<span class="gm-k">המהנדס</span>${ICON.check}<span>${n}${sub('בדיקת הנדבכים: האנך')}</span>`;
      case 'work': {   // ── flow10 ── (PRODUCER10 N7, N10) the pill names what the pointer marks: the kohen, in the survey and the courses
        const v = S.siteView(G, a.id);
        const t = a.job === 'survey' ? 'מדידה · הקש על הכהן' : a.job === 'boulders' ? `${isoNum(S.bouldersLeft(G))} סלעים · הקש על סלע` : a.job === 'dig' ? `${digWords(a.id).pill} · הקש` : a.job === 'stone' ? `נדבך ${isoNum(v.course)} מתוך ${isoNum(v.C)} · אבן ${isoNum(v.inCourse + 1)} מתוך ${isoNum(v.per)} · ${a.id === 'har' ? 'סתת: הקש על הכהן' : 'הקש'}` : a.job === 'finish' ? `${esc(PROJ[a.id].fin[v.fd].n)} · הקש` : a.job === 'reset' ? 'מפרקים ומניחים מחדש · הקש' : 'הקש על האתר';
        return `<span class="gm-k">${T.goal}</span>${ring(S.progressOf(G, a.id))}<span>${n}${sub(t)}</span>`;
      }
      // ── flow9 ── (QA9 15:46 N4d: "למקטע הבא · 12 אבנים" → "8 אבנים הגיעו לאתר" read as 12 vs 8; DESIGN9 16:10) a segment says
      // only what arrives, as M7's button; its price shows where it is paid (the meter's stone drops as the stones arrive)
      case 'build': return `<span class="gm-k">בנה</span>${ICON.stone}<span>${n}${sub(a.step === 'seg' && a.stones ? `הביאו ${segWords(a.id, a.stones).n}` : `${stepName(a)} · ${costTxt(a.cost)}`)}</span>`;
      case 'play': {   // ── build7 ── framed by what the board pays, "▶ המחצבה · כ־40 אבנים" (PLAYTEST-S6 #3); without MATCH3, the shortfall
        const bp = ctx.act.boardPays ? ctx.act.boardPays(a) : null;
        // ── fun12 ── (the quarry's cycle) the kicker names the game this action opens: "▶ הקלע של דוד"
        return `<span class="gm-k">▶ ${esc((bp && bp.name) || FIELD_N[a.field] || '')}</span>${resIcon(bp ? bp.res : Object.keys(a.need)[0] || 'stone')}<span>${n || '<b>משחק האוצר</b>'}${sub(bp ? `כ־${esc(countTxt(bp.res, bp.n))}` : `עוד ${costTxt(a.need)} ${stepName(a)}`)}</span>`;
        // ── /fun12 ──
      }
      case 'deal': return `<span class="gm-k">⚓ ${esc(a.who || 'המלכים')}</span>${resIcon('bronze')}<span>${n}${sub(`${esc(countTxt('bronze', a.n))} ${a.cost ? `ב־${isoNum(a.cost)} כסף` : 'במתנה'}`)}</span>`;   // ── build7 ── (FUN7 P0)
      case 'start': return `<span class="gm-k">${T.goal}</span>${ICON.pin}<span>${n}${sub(`${T.start}${Object.keys(a.cost || {}).length ? ` · ${costTxt(a.cost)}` : ''}`)}</span>`;
      case 'priests': return `<span class="gm-k">${T.goal}</span>${ICON.priest}<span>${n}${sub(T.needPriests(isoNum(a.need)))}</span>`;
      case 'done': return `<span class="gm-k">${T.finale}</span>${ICON.star}<span><b>הבית נבנה</b></span>`;
      default: return `<span class="gm-k">${T.goal}</span><span>…</span>`;
    }
  }
  const costTxt = (c) => Object.entries(c || {}).filter(([, v]) => v > 0).map(([k, v]) => esc(countTxt(k, v))).join(' · ');   // (build7: plural counts)
  /* (hooks/next.js) a waiting goal gets its ETA or its action: "מגיע בעוד 4:12" · "שלח משלחת" */
  function noteHTML(G, r) {
    const h = ctx.hooks && ctx.hooks();
    const n = h && h.goalNote ? h.goalNote(G, r) : null;
    return n && n.text ? ` <span class="gm-sub gm-note2">· ${esc(n.text)}</span>` : '';
  }
  function badgeCounts(G = ctx.G(), now = ctx.now()) {   // ── land17 ── (the dock's, and the landscape menu's: one source)
    const quiet = G.ftue < 6;           // the first minutes: no badges competing with the coach
    // ── hook20 ── (item 1) a number only when something NEW waits behind the tab; the marks are the save's (G.seen); opening the tab clears it
    try {
      const K = globalThis.__BH_PARTS && globalThis.__BH_PARTS.kings, st = K && typeof K.status === 'function' ? K.status(G, now) : null;
      const day = AR.dayOf(now), rs = ARU.riddleState(G, day, STAGES.filter((x) => S.isDone(G, x.id)).length);
      const n = AR.counts(G, st ? +st.badge || 0 : 0, { riddleDay: rs.has ? day : '', riddleSolved: !!rs.solved });
      return n.map((v, i) => (quiet && i !== 1 ? 0 : v));
    } catch (e) { /* the old count below */ }
    // ── /hook20 ──
    const n = [
      G.crews.filter((c) => !c.at).length,
      (() => { try { const K = globalThis.__BH_PARTS && globalThis.__BH_PARTS.kings; const st = K && typeof K.status === 'function' ? K.status(G, now) : null; return st ? +st.badge || 0 : 0; } catch (e) { return 0; } })(),   // ── build6 ── the kings' ships in port
      Object.keys(G.book.un).filter((k) => !isRead(G, k)).length,   // ── hook19 ── (an entry waits until it is read to its end: ★500)
      G.daily.tasks.filter((t) => !t.done).length + (() => { try { const F = (globalThis.__BH_PARTS || {}).fun; return F && typeof F.badge === 'function' ? F.badge(G, now) | 0 : 0; } catch (e) { return 0; } })(),   // ── build7 ── FUN's dig of the day / ready orders
    ];
    n.push((() => { try { return ctx.news ? ctx.news() | 0 : 0; } catch (e) { return 0; } })());   // ── hook19 ── the project's (a new stage opened, until the tab is opened)
    return n.map((v, i) => (quiet && i !== 1 ? 0 : v));
  }
  function badges() {
    const G = ctx.G(), now = ctx.now();
    const dock = E.dock.querySelectorAll('.gm-db');
    const cnt = badgeCounts(G, now);
    cnt.forEach((n, i) => { const b = dock[i] && dock[i].querySelector('.gm-badge'); if (!b) return; b.textContent = n > 0 ? String(n) : ''; b.classList.toggle('gm-hidden', !(n > 0)); });
    for (const b of dock) b.setAttribute('aria-pressed', b.dataset.k === sheetKind ? 'true' : 'false');
    // ── hud18 ── (the dock's five tabs sit in the landscape top bar as they are: no sum on the menu button any more)
  }
  function flashRes(keys) {
    for (const k of keys || []) { const c = E.res.querySelector(`[data-r="${k}"]`); if (c) { c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash'); setTimeout(() => c.classList.remove('flash'), 260); } }
  }

  // ── hud18 ── (wave 18, contract 1: "the points accumulate") the counters as targets. JUICE18's flights land on them:
  //   ui.counter(key) → DOMRect | null     'xp' · 'coins' (= 'silver') · a material key of .gm-res; null when it is not on screen
  //   ui.hold(key, n)                      a flight carries n: the number shows (real − n) until it lands (optional; the economy counts at once)
  //   ui.bump(key, delta, { scale })       the landing: the chip swells (1.25×) and its number ticks up by delta over 220 ms; releases the hold
  //   ui.xp({ craft, icon, name, level, xp, next, from })   the slot .gm-top .gm-xp (hidden until the first call; ui.xp(null) hides it)
  // A re-render (refresh()) never fights a bump: it sets the real value; what is shown is  real − held − the part of the tick still to come.
  const CT = Object.create(null), CT_DUR = 220, CT_HOLD_MS = 3000, XP_LV = [0, 10, 25, 50, 100, 175, 275];   // (craftxp.js's levels: level N starts at XP_LV[N-1])
  let ctChips = null, ctIv = 0, xpCur = null;
  const ctOf = (k) => CT[k] || (CT[k] = { real: 0, need: 0, held: 0, heldT: 0, from: 0, t0: 0, sw: null });
  const ctKey = (k) => (k === 'coins' || k === 'coin' ? 'silver' : String(k || ''));
  function ctEl(k) {
    if (!rootEl) return null;
    if (k === 'xp') return E.xp;
    if (k === 'score') return E.sc;   // ── hook19 ── the master score's capsule
    if (!ctChips) { ctChips = {}; for (const c of E.res.children) ctChips[c.dataset.r] = c; }
    return ctChips[k] || null;
  }
  /** what a counter shows now: the real value − what a flight still holds − the part of a tick that has not happened yet */
  function ctShown(k, now) {
    const c = ctOf(k);
    if (c.held && now - c.heldT > CT_HOLD_MS) c.held = 0;   // (a flight that never landed does not keep the number down)
    let p = 0;
    if (c.from > 0) { const u = (now - c.t0) / CT_DUR; if (u >= 1) c.from = 0; else p = c.from * (1 - u * (2 - u)); }
    return Math.max(0, Math.floor(c.real + 1e-6) - c.held - Math.round(p));   // (whole numbers: a +1 ticks as the chip swells, not at the end of its 220 ms)
  }
  function ctPaintChip(k, el) {
    const c = ctOf(k), v = ctShown(k, performance.now()), n = el.querySelector('.gm-num');
    if (!n) return;
    const t = c.need > c.real + 1e-6 && k !== 'silver' ? `${fmtK(v)} / ${fmtK(c.need)}` : fmtK(v);
    if (n.textContent !== t) n.textContent = t;
  }
  function ctPaintXp() {
    const X = xpCur; if (!X) return;
    const v = Math.max(X.from, ctShown('xp', performance.now())), pw = X.next ? Math.max(0, Math.min(1, (v - X.from) / Math.max(1, X.next - X.from))) : 1;
    const t = X.next ? isoFrac(v, X.next) : isoNum(v);
    if (E.xpNum.textContent !== t) E.xpNum.textContent = t;
    const w = (pw * 100).toFixed(1) + '%'; if (X.w !== w) { X.w = w; E.xpFill.style.width = w; }
  }
  function ctPaint(k) { if (k === 'xp') ctPaintXp(); else if (k === 'score') scPaint(); else if (!(coinRun && k === 'silver')) { const el = ctEl(k); if (el) ctPaintChip(k, el); } }
  function ctRun() {
    if (ctIv) return;
    ctIv = setInterval(() => {   // (a timer, not frames: a slow phone or a paused page still lands the number on time)
      let live = false;
      for (const k in CT) { const c = CT[k]; if (c.from > 0) { ctPaint(k); if (c.from > 0) live = true; else ctPaint(k); } }
      if (!live) { clearInterval(ctIv); ctIv = 0; }
    }, 32);
  }
  function ctReset() { clearInterval(ctIv); ctIv = 0; for (const k in CT) { try { if (CT[k].sw) CT[k].sw.cancel(); } catch (e) { /* gone */ } delete CT[k]; } ctChips = null; xpCur = null; }
  function ctSync(k) { if (k === 'score') ctOf(k).real = Math.max(0, Math.floor(+ctx.G().score) || 0); else if (k !== 'xp') ctOf(k).real = (ctx.G().res || {})[k] || 0; }   // ── hook19 ── (score: the save's total)   // (the economy counted it already; refresh() has not yet been told)
  function counter(key) {
    const el = ctEl(ctKey(key));
    if (!el || !el.getClientRects().length) return null;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 ? r : null;
  }
  function hold(key, n = 1) {
    const k = ctKey(key), d = Math.floor(+n || 0);
    if (!rootEl || d <= 0 || !ctEl(k)) return false;
    ctSync(k); const c = ctOf(k); c.held += d; c.heldT = performance.now(); ctPaint(k); return true;
  }
  function bump(key, delta = 1, o = {}) {
    const k = ctKey(key), el = ctEl(k), d = Math.floor(+delta) || 0;
    if (!el || !el.getClientRects().length) return false;
    const c = ctOf(k), now = performance.now();
    ctSync(k);
    const reduced = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
    if (d > 0) {
      c.held = Math.max(0, c.held - d);
      const pend = c.from > 0 ? c.from * (1 - ((u) => (u >= 1 ? 1 : u * (2 - u)))((now - c.t0) / CT_DUR)) : 0;
      if (reduced) { c.from = 0; } else { c.from = pend + d; c.t0 = now; ctRun(); }
      if (!reduced && el.animate) { try { if (c.sw) c.sw.cancel(); c.sw = el.animate([{ transform: 'scale(1)' }, { transform: `scale(${+o.scale > 1 ? +o.scale : 1.25})`, offset: 0.4 }, { transform: 'scale(1)' }], { duration: 280, easing: 'ease-out' }); } catch (e) { /* no animation */ } }
    } else { c.held = 0; c.from = 0; }   // (bump(key, 0): release a flight's hold without a tick)
    ctPaint(k);
    return true;
  }
  /** the craft slot: icon (an ICON name, an inline <svg>, or a glyph), name, "רמה N", the bar and its number. level N starts at XP_LV[N-1]; `next` null/0 = the last level */
  function xp(o) {
    if (!rootEl) return;
    if (!o) { E.xp.classList.add('gm-hidden'); xpCur = null; return; }
    const lvl = Math.max(1, Math.floor(+o.level) || 1), v = Math.max(0, +o.xp || 0), next = +o.next > 0 ? +o.next : 0;
    const fb = o.base != null ? o.base : o.from, from = fb != null && Number.isFinite(+fb) ? +fb : XP_LV[Math.min(lvl, XP_LV.length) - 1];   // (`base` = the level's floor, as juice.js sends it; `from` is the same)
    const fresh = !xpCur, same = xpCur && xpCur.craft === o.craft, up = same && lvl > xpCur.level;
    const prev = xpCur;
    xpCur = { craft: o.craft, level: lvl, from, next, w: null };
    ctOf('xp').real = v;
    const ic = o.icon == null ? '' : String(o.icon), html = ICON[ic] ? ICON[ic] : ic.charAt(0) === '<' ? ic : esc(ic);
    if (E.xpIc.dataset.k !== ic) { E.xpIc.dataset.k = ic; E.xpIc.innerHTML = html; }
    const nm = o.name == null ? '' : String(o.name); if (E.xpN.textContent !== nm) E.xpN.textContent = nm;
    const lt = `רמה ${isoNum(lvl)}`; if (E.xpLv.textContent !== lt) E.xpLv.textContent = lt;
    E.xp.setAttribute('aria-label', `${nm} רמה ${lvl}${next ? `: ${Math.floor(v)} מתוך ${next}` : ''}`);
    if (fresh || !same || lvl !== (prev && prev.level)) { E.xpFill.style.transition = 'none'; ctPaintXp(); void E.xpFill.offsetWidth; E.xpFill.style.transition = ''; }   // (a new craft or a new level: the bar snaps, it does not slide back)
    else ctPaintXp();
    if (E.xp.classList.contains('gm-hidden')) { E.xp.classList.remove('gm-hidden'); topSig = ''; fitTop(ctx.G()); }
    if (up) { E.xp.classList.remove('lvup'); void E.xp.offsetWidth; E.xp.classList.add('lvup'); }
  }
  // ── /hud18 ──

  // ── hook19 ── (wave 19, note 6; docs/FUN19.md §4.1) the master score: the capsule "★ 12,340" with the coin's ring filling toward the next
  // 10,000 (glowing from 90 %, and full while a coin's celebration waits for a pause), the flights' target (ui.counter('score')), the
  // bonuses' small notes (scoreGain), the coin's celebration (dinar) and the treasure's sheet (the faces, the title ladder).
  //   ui.score()                       re-render from ctx.score() ({ total, coins, unseen, title, left, ... }) — also on every refresh()
  //   ui.hold('score', n) · ui.bump('score', n)   the counters' machinery above: a flight carries n, the number shows (total − n) until it lands
  //   ui.scoreGain(n, label)           a note "+250 · נדבך" by the capsule, then the number ticks up (the caller has added it and held it)
  //   ui.dinar({ n, stage, onLand })   → Promise<skipped>: the coin spins out of the capsule, lands with the stamp, flies to the box (3–4 s, a tap skips)
  const fmtN = (n) => String(Math.max(0, Math.floor(+n || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  let scView = null, scDash = '', scNext = 0;
  function scPaint() {
    if (!E.sc || !scView) return;
    const v = ctShown('score', performance.now()), f = scView.unseen ? 1 : (((v % 10000) + 10000) % 10000) / 10000, t = fmtN(v);
    if (E.scN.textContent !== t) E.scN.textContent = t;
    const d = `${(f * 100).toFixed(1)} 100`; if (d !== scDash) { scDash = d; E.scFg.setAttribute('stroke-dasharray', d); }
    E.sc.classList.toggle('glow', f >= 0.9);
  }
  function score() {
    if (!rootEl || !E.sc) return;
    const g = ctx.score ? ctx.score() : null; if (!g) return;
    scView = g; ctOf('score').real = g.total;
    const have = Math.max(0, g.coins - g.unseen); if (E.scC.textContent !== String(have)) E.scC.textContent = String(have);
    E.sc.classList.remove('gm-hidden'); E.sc.classList.toggle('has', have > 0);
    E.sc.setAttribute('aria-label', `הניקוד שלך: ${fmtN(g.total)}. ${have ? `דינרי זהב: ${have}${g.title ? `, התואר: ${g.title}` : ''}. ` : ''}הדינר הבא בעוד ${fmtN(g.left)} נקודות. פתח את האוצר שלי`);
    scPaint();
  }
  function scoreGain(n, label = '') {
    if (!rootEl || !E.sc || !(n > 0)) return;
    const t0 = performance.now(), at = Math.max(t0, scNext); scNext = at + 520;
    setTimeout(() => {
      const e = doc.createElement('div'); e.className = 'gm-sg'; e.setAttribute('aria-hidden', 'true');
      e.innerHTML = `<b>+${fmtN(n)}</b>${label ? `<span>${esc(label)}</span>` : ''}`;
      rootEl.appendChild(e); requestAnimationFrame(() => e.classList.add('on'));
      setTimeout(() => bump('score', n), 480);   // the number ticks up as the note lifts
      setTimeout(() => e.remove(), 1700);
    }, Math.max(0, at - t0));
  }
  /** the coin's face: the stage's number (1…15) and its name — the stage where it was earned (המחשה) */
  const faceOf = (id) => { const i = STAGES.findIndex((x) => x.id === id), d = i >= 0 ? STAGES[i] : null; return { k: i >= 0 ? String(i + 1) : '★', n: d ? d.n : '' }; };
  function dinar(o = {}) {
    return new Promise((res) => {
      if (!rootEl || !E.sc) return res(false);
      const f = faceOf(o.stage), w = doc.createElement('div');
      w.className = 'gm-dn'; w.setAttribute('role', 'status');
      w.innerHTML = `<i class="gm-dn-rays"></i><span class="gm-dn-c"><b>${esc(f.k)}</b><small>${esc(f.n)}</small></span><span class="gm-dn-t">דינר זהב!</span><span class="gm-dn-s">${f.n ? `על ${esc(f.n)}` : ''}${o.n ? ` · הדינר ה-${fmtN(o.n)}` : ''}</span>`;
      rootEl.appendChild(w);
      const c = w.querySelector('.gm-dn-c'), r = E.sc.getBoundingClientRect(), W0 = innerWidth, H0 = innerHeight;
      const ox = r.left + 24 - W0 / 2, oy = r.top + r.height / 2 - H0 * 0.42;   // the capsule's coin, relative to the centre (0.42 of the height)
      let done = false, skip = false, anim = null;
      const reduced = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
      const end = () => { if (done) return; done = true; clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); try { if (anim) anim.cancel(); } catch (e) { /* gone */ } w.classList.remove('on'); setTimeout(() => w.remove(), 260); try { if (typeof o.onEnd === 'function') o.onEnd(); } catch (e) { /* the host's */ } res(skip); };
      w.classList.add('on');
      const T1 = reduced ? 0 : 900, T2 = 2700, T3 = 3500;
      // the flight out of the capsule: a spin and a growth to the centre, a landing with a small bounce; then the way back into the box
      const fly = [
        { transform: `translate(${ox}px,${oy}px) rotateY(0deg) scale(.28)`, opacity: 0, offset: 0 },
        { transform: `translate(${ox * 0.35}px,${oy * 0.35 - 30}px) rotateY(540deg) scale(1.1)`, opacity: 1, offset: 0.55 },
        { transform: 'translate(0,0) rotateY(1080deg) scale(1.38)', opacity: 1, offset: 0.82 },
        { transform: 'translate(0,0) rotateY(1080deg) scale(1.22)', opacity: 1, offset: 1 },
      ];
      try { anim = c.animate(fly, { duration: T1, easing: 'cubic-bezier(.25,.8,.3,1)', fill: 'forwards' }); } catch (e) { anim = null; }
      let t2 = 0, t3 = 0;
      const t1 = setTimeout(() => {   // the landing: the ring (the host plays its two-partial ring), the stamp
        w.classList.add('land'); try { if (typeof o.onLand === 'function') o.onLand(); } catch (e) { /* the host's */ }
        t2 = setTimeout(() => {   // to the box
          w.classList.add('away');
          let back = null; try { back = c.animate([{ transform: 'translate(0,0) rotateY(1080deg) scale(1.22)', opacity: 1 }, { transform: `translate(${ox}px,${oy}px) rotateY(1260deg) scale(.26)`, opacity: 0.9 }], { duration: 640, easing: 'cubic-bezier(.5,0,.8,.4)', fill: 'forwards' }); } catch (e) { /* no animation */ }
          t3 = setTimeout(end, back ? 660 : 0);
        }, T2 - T1);
      }, T1);
      // a tap skips: straight to the way home (never before the coin has landed)
      w.addEventListener('pointerdown', () => { if (!w.classList.contains('land') || w.classList.contains('away') || done) return; skip = true; clearTimeout(t2); w.classList.add('away'); try { c.animate([{ transform: 'translate(0,0) rotateY(1080deg) scale(1.22)', opacity: 1 }, { transform: `translate(${ox}px,${oy}px) scale(.26)`, opacity: 0.9 }], { duration: 300, fill: 'forwards' }); } catch (e) { /* no animation */ } t3 = setTimeout(end, 320); });
      void T3;
    });
  }
  /** the treasure's sheet: the score, the way to the next coin, the title ladder, the 15 faces (what is had, what is still to come) */
  function treasureHTML(G) {
    const g = ctx.score ? ctx.score() : { total: 0, coins: 0, unseen: 0, next: 10000, left: 10000, frac: 0, title: null, nextTitle: null };
    const have = Math.max(0, g.coins - g.unseen), list = (G.dinars || []).slice(0, have), by = {};
    for (const d of list) by[d.stage || '?'] = (by[d.stage || '?'] || 0) + 1;
    const lad = [[1, 'פועל'], [3, 'אומן'], [6, 'אומן בכיר'], [10, 'ראש אומנים'], [15, 'בונה הבית']];
    let h = `<div class="gm-tr-top"><b class="gm-num">★ ${fmtN(g.total)}</b><span>${have ? `◉ ${have}` : ''}</span></div>
      <div class="gm-tr-bar" role="img" aria-label="${Math.round(g.frac * 100)} אחוז לדינר הבא"><i style="width:${(g.frac * 100).toFixed(1)}%"></i></div>
      <p class="gm-muted">עוד <b class="gm-num">${fmtN(g.left)}</b> נקודות לדינר הזהב הבא${g.title ? `. התואר שלך: <b>${esc(g.title)}</b>` : ''}</p>`;
    h += `<div class="gm-sec">התארים</div><div class="gm-tr-lad">`;
    for (const [n, t] of lad) h += `<div class="${have >= n ? 'on' : ''}"><b>${esc(t)}</b><small>${n === 1 ? 'דינר אחד' : `${n} דינרים`}</small></div>`;
    h += `</div><div class="gm-sec">פני הדינרים: השלב שבו הרווחת כל דינר</div><div class="gm-tr-faces">`;
    STAGES.forEach((d, i) => { const k = by[d.id] || 0; h += `<div class="${k ? 'on' : ''}" title="${esc(d.n)}"><span class="gm-cn">${k ? i + 1 : '·'}</span><small>${esc(d.n)}</small>${k > 1 ? `<em>×${k}</em>` : ''}</div>`; });
    h += `</div><p class="gm-muted" style="margin-top:10px">כל 10,000 נקודות מביאות דינר זהב (המחשה). את הדינר לא מוציאים ולא מאבדים, והוא לא קונה כלום: הוא נשאר בתיבה.</p>`;
    h += `<div class="gm-note">מהאולם והלאה תוכל לתלות דינר כעלה זהב בגפן שעל פתח ההיכל: ${esc('"כָּל מִי שֶׁהוּא מִתְנַדֵּב עָלֶה, אוֹ גַרְגִּיר, אוֹ אֶשְׁכּוֹל, מֵבִיא וְתוֹלֶה בָהּ"')} <span class="gm-ref">משנה מדות ג, ח</span></div>`;
    return h;
  }
  // ── /hook19 ──
  // ── hook19 ── (docs/FUN19.md §4.2) a tab calls: the mentor's line in the bubble, a gold arrow from the line to the tab for 1.5 s, one pulse
  // of the tab. The badge is the game's (badges()), so it stays until the tab is opened. ui.nudge({ tab: 'book' | 'crews' | 'kings' | 'daily' | 'store', line })
  let ndT = 0;
  function nudge(o = {}) {
    if (!rootEl || !o.line) return false;
    const b = E.dock && E.dock.querySelector(`.gm-db[data-k="${o.tab}"]`);
    if (!b || whole || sheetKind || modalOpen) return false;
    coach(null, o.line);
    clearTimeout(ndT); ndT = setTimeout(() => { try { if (!sheetKind && E.bub.textContent.includes(String(o.line).slice(0, 10))) coach(null, ''); } catch (e) { /* gone */ } }, 5200);
    const from = E.bub.getBoundingClientRect(), to = b.getBoundingClientRect();
    const a = doc.createElement('div'); a.className = 'gm-nda'; a.setAttribute('aria-hidden', 'true');
    a.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2.5l8.5 11h-5.2V21h-6.6v-7.5H3.5z" fill="currentColor" stroke="#7A5410" stroke-width="1.2" stroke-linejoin="round"/></svg>';
    rootEl.appendChild(a);
    const x0 = from.left + from.width / 2, y0 = from.top + from.height / 2, x1 = to.left + to.width / 2, y1 = to.top + to.height / 2;
    const ang = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI + 90;   // (the arrow's tip is up)
    const at = (x, y) => `translate(${x - 18}px,${y - 18}px) rotate(${ang}deg)`;
    try { a.animate([{ transform: at(x0, y0), opacity: 0 }, { transform: at(x0 + (x1 - x0) * 0.12, y0 + (y1 - y0) * 0.12), opacity: 1, offset: 0.15 }, { transform: at(x1 - (x1 - x0) * 0.1, y1 - (y1 - y0) * 0.1), opacity: 1, offset: 0.85 }, { transform: at(x1, y1), opacity: 0 }], { duration: 1500, easing: 'ease-in-out', fill: 'forwards' }); } catch (e) { a.style.transform = at(x1, y1); }
    setTimeout(() => a.remove(), 1560);
    b.classList.remove('gm-nd'); void b.offsetWidth; b.classList.add('gm-nd'); setTimeout(() => b.classList.remove('gm-nd'), 1700);
    return true;
  }
  // ── /hook19 ──

  /* ───────── toasts ───────── */
  /* ── build7 ── one toast at a time, ≥ 1.5 s apart (PLAYTEST-S6 #7): the one on screen yields after 1.5 s when another waits;
     all wait while a precision game (.fx-mg), a board (.m3), a key moment (.gm-mo) or the opening is on screen, then come one
     by one (FUN7 P0 1). A burst keeps its last five. */
  const TOAST_GAP = 1500, tq = [];
  let tCur = null, tPump = 0;
  const toastHeld = () => !!rootEl && (rootEl.classList.contains('gm-cinema') || !!doc.querySelector('.fx-mg, div.m3, .gm-mo, div.g10') || !!(ctx.act.strikeRun && ctx.act.strikeRun() && !(tq[0] && tq[0].pause)));   // ── flow8 ── (DESIGN8B R6) none during a strike run — ── director13 ── (a toast that IS the pause — a course end's beat — is not held by the run: PRODUCER13 m1, "no toast נדבך 1 מתוך 6 on screen")
  function toast(o = {}) {
    if (!rootEl) return;
    tq.push(o);
    while (tq.length > 5) tq.splice(tq.findIndex((x) => x.kind === 'mini') >= 0 ? tq.findIndex((x) => x.kind === 'mini') : 0, 1);
    pumpToasts();
  }
  function pumpToasts() {
    clearTimeout(tPump); tPump = 0;
    if (!rootEl || !tq.length) return;
    if (toastHeld()) { tPump = setTimeout(pumpToasts, 400); return; }
    const now = performance.now();
    if (tCur) {
      const left = TOAST_GAP - (now - tCur.t0);
      if (left > 0) { tPump = setTimeout(pumpToasts, left + 10); return; }
      dropToast(tCur);
    }
    showToast(tq.shift());
    if (tq.length) tPump = setTimeout(pumpToasts, TOAST_GAP + 10);
  }
  function dropToast(c) {
    if (!c) return;
    clearTimeout(c.tm);
    c.el.classList.remove('on'); setTimeout(() => c.el.remove(), 260);
    if (tCur === c) tCur = null;
  }
  function showToast({ icon = '', title = '', body = '', kind = '', ms = 4200 } = {}) {
    const t = doc.createElement('div');
    t.className = 'gm-toast' + (kind ? ' ' + kind : '');
    t.innerHTML = `${icon ? (ICON[icon] || resIcon(icon) || '') : ''}<div>${title ? `<b>${esc(title)}</b>` : ''}${body ? `<span>${body}</span>` : ''}</div>`;
    E.toasts.appendChild(t);
    while (E.toasts.children.length > 2) E.toasts.firstElementChild.remove();   // (a leaving toast may still fade out)
    const c = { el: t, t0: performance.now(), tm: 0 };
    tCur = c;
    requestAnimationFrame(() => t.classList.add('on'));
    t.addEventListener('click', () => { dropToast(c); pumpToasts(); });
    c.tm = setTimeout(() => { dropToast(c); pumpToasts(); }, Math.max(TOAST_GAP, ms));
  }

  /* ───────── sheets ───────── */
  const TITLES = { crews: T.crews, caravans: T.caravans, book: T.book, daily: T.daily, store: 'לוח הפרויקט', menu: T.menu, treasure: 'האוצר שלי', profile: 'הכהן שלי', circle: 'המשמר שלי', riddle: 'חידת היום' };   // ── hook20 ── (profile · circle · riddle)   // ── hook19 ── (treasure)
  function toggleSheet(kind, arg) { if (sheetKind === kind && sheetArg === (arg || null)) closeSheet(); else openSheet(kind, arg); }
  // ── flow11 ── (PRODUCER10 N36: "the segment sheet's red line runs through the progress bar" — the game's "המלאי ריק" float was
  // drawn over the sheet it opened) a line the sheet itself shows, under its bar: openSheet('stage', id, warn)
  let sheetWarn = '', arHtml0 = '';   // ── hook20 ── (arHtml0: the last profile/circle body)
  function openSheet(kind, arg, warn) {
    if (!rootEl) return;
    arHtml0 = '';   // ── hook20 ──   // ── ui ── (a Phase A timer may fire after the HUD is gone: Phase B or the tour took over)
    sheetKind = kind; sheetArg = arg || null; confirmNew = false; sheetWarn = typeof warn === 'string' ? warn : '';
    if (kind === 'book' && arg && MIDX[arg] !== undefined) { bookSel = arg; bookCh = +arg.split('.')[0] - 1; }
    else if (kind === 'book') {
      // open at the chapter of the first unread mishnah (or of the first unlocked one)
      const G = ctx.G(), m = MIDDOT.find((x) => G.book.un[x.id] && !G.book.read[x.id]) || MIDDOT.find((x) => G.book.un[x.id]);
      bookSel = null; if (m) bookCh = +m.id.split('.')[0] - 1;
    }
    renderSheet();
    E.sheet.classList.add('on'); E.sheet.setAttribute('aria-hidden', 'false');
    rootEl.classList.add('sheet-open');
    E.shBody.scrollTop = 0;
    if (kind === 'circle' || kind === 'profile') { try { ARU.onOpen(kind, E.shBody, { G: ctx.G(), now: ctx.now(), stamp, banner }); } catch (e) { console.warn('[board21]', e); } }   // ── board21 ── (scroll to his row, the flashes, the rank-up stamp)
    badges();
    ctx.act.sheetChanged && ctx.act.sheetChanged(kind, sheetArg);
  }
  function closeSheet() {
    if (!sheetKind || !rootEl) return;   // ── ui ──
    if (sheetKind === 'riddle') { try { RDU.stop(); E.shBody.textContent = ''; } catch (e) { /* the riddle's */ } }   // ── hook20 ──
    arHtml0 = '';   // ── hook20 ──
    sheetKind = null; sheetArg = null; confirmNew = false; sheetWarn = '';
    E.sheet.classList.remove('on'); E.sheet.setAttribute('aria-hidden', 'true');
    rootEl.classList.remove('sheet-open');
    badges();
    ctx.act.sheetChanged && ctx.act.sheetChanged(null);
  }
  function renderSheet() {
    if (!sheetKind || !rootEl) return;
    const G = ctx.G(), now = ctx.now();
    let title = TITLES[sheetKind] || '', html = '';
    switch (sheetKind) {
      case 'stage': { const d = stageById(sheetArg); title = d ? d.n : ''; html = stageHTML(G, sheetArg, now); break; }
      case 'res': { title = RES[sheetArg] ? RES[sheetArg].n : ''; html = sourcesHTML(G, sheetArg); break; }
      case 'crews': html = crewsHTML(G, now); break;
      case 'caravans': html = caravansHTML(G, now); break;
      case 'book': html = bookHTML(G); break;
      case 'daily': html = ARU.boardHTML(G, now, ctx.score ? ctx.score() : null) + funHTML(G, now) + dailyHTML(G, now); break;   // ── hook20 ── (the live board first)
      // ── hook20 ── ("היום" is a live board first; the profile; the near circle; the daily riddle — its body is built once per state, the sheet's refresh leaves it alone)
      case 'profile': html = ARU.profileHTML(G, now); break;
      case 'circle': html = ARU.circleHTML(G, now, S.storage); break;
      case 'riddle': { const day = AR.dayOf(now), dn = STAGES.filter((x) => S.isDone(G, x.id)).length; RDL.ensure(G, day, dn); const sg = RDU.sig(G, day, dn); const ex = E.shBody.querySelector('.rd'); if (ex && ex.dataset.sig === sg) return; html = RDU.shell(G, day, dn); break; }
      // ── /hook20 ──
      case 'store': html = storeHTML(G); break;
      case 'treasure': html = treasureHTML(G); break;   // ── hook19 ──
      case 'menu': html = menuHTML(G); break;
      case 'shop': { title = PAY.shop.n; const o = ctx.act.shopCtx ? ctx.act.shopCtx() : {}; html = SHOP.html(G, { ...o, esc, num: (n) => isoNum(n), coin: ICON.coin }); break; }   // ── econ14 ── ── /econ14 ──
      default: break;
    }
    // ── econ14 ── (PRODUCER14 pc1: her finger's swipe never scrolled אוצר המלאכה — refresh() re-rendered it every second and the
    // new HTML broke the scroll) the shop's sheet is rebuilt only when what it shows changes
    if (sheetKind === 'shop') { if (html === shopHTML0 && E.shBody.firstChild) return; shopHTML0 = html; } else shopHTML0 = '';
    // ── /econ14 ──
    // ── hook20 ── (a sheet with inputs or a live body is rebuilt only when what it shows changes: a typed code and a riddle's placements survive the second's refresh)
    if (sheetKind === 'circle' || sheetKind === 'profile') { if (html === arHtml0 && E.shBody.firstChild) return; arHtml0 = html; } else arHtml0 = '';
    // ── /hook20 ──
    E.shTitle.textContent = title;
    const top = E.shBody.scrollTop;
    E.shBody.innerHTML = html;
    // ── hook20 ──
    if (sheetKind === 'riddle') { try { const dn = STAGES.filter((x) => S.isDone(G, x.id)).length, day = AR.dayOf(now), el = E.shBody.querySelector('.rd'); if (el) { RDU.mount(el, { G, day, done: dn, act: ctx.act, sfx: ctx.sfx, onChange: () => { try { ctx.act.persistNow && ctx.act.persistNow(); badges(); } catch (e) { /* the host's */ } } }); el.dataset.sig = RDU.sig(G, day, dn); } } catch (e) { console.warn('[hook20]', e); } }
    // ── /hook20 ──
    // ── middot10 ── the book's page: its place names become links, each chapter's short quiz, the learning points (middot-ui.js)
    if (sheetKind === 'book') { try { decorateBook(E.shBody, { G, sel: bookSel, ch: bookCh, ctx, ui: { closeSheet, openSheet, renderSheet, toast, flashRes, refresh, icon: (k) => ICON[k] || '' } }); } catch (e) { console.warn('[middot10]', e); } }
    // ── /middot10 ──
    E.shBody.scrollTop = top;
    // ── hook19 ── "קראתי ✓" wakes when the entry was scrolled to its end (no timer; an entry that fits on the screen is at its end already)
    if (sheetKind === 'book' && bookSel) { const rd = E.shBody.querySelector('.gm-rd[disabled]'); if (rd) { const chk = () => { if (E.shBody.scrollTop + E.shBody.clientHeight >= E.shBody.scrollHeight - 14) { rd.disabled = false; E.shBody.removeEventListener('scroll', chk); } }; E.shBody.addEventListener('scroll', chk, { passive: true }); setTimeout(chk, 60); } }
    // ── /hook19 ──
  }

  /** ── flow8 ── the segment in one line. ── flow9 ── the key stone's verb is its game's (content.js keyWords; DESIGN8B 11:03):
      on the Mount "8 אבנים מגיעות לאתר. את האבן הראשונה, האבן הגדולה, תניח אתה במנוף; את השאר הצוות, ואתה מאיץ בהקשות." */
  function segLine(G, id, v) {
    const s = G.st[id], from = s ? s.paid || 0 : 0, n = v.step.stones || SEG;
    let key = null, at = -1; for (let i = from; i < from + n && !key; i++) { key = keyOf(id, i); at = i; }
    return `${n} אבנים מגיעות לאתר. ${key ? `${keyWords(key, at === 0).line}; את השאר הצוות, ואתה מאיץ בהקשות.` : 'הצוות מניח אותן, ואתה מאיץ: שלוש הקשות לאבן.'}`;
  }
  /* ── build6 ── the site panel: the phase, course N/M, stone k/n, the stock, what the next step needs, one big action */
  function stageHTML(G, id, now) {
    const d = stageById(id); if (!d) return '';
    const st = S.statusOf(G, id), ch = CHAPTERS.find((c) => c.id === d.ch), P = PROJ[id];
    let h = `<p class="gm-muted">פרק ${'אבגד'[d.ch - 1]}׳ · ${esc(ch.n)} · ${isoNum(P.C)} נדבכים · ${isoNum(P.C * P.P)} אבנים</p>`;
    const big = (a, label, extra = '', gold = true) => `<button class="gm-btn ${gold ? 'gm-btn-gold' : ''} gm-big" data-a="${a}" data-id="${id}" ${extra}>${label}</button>`;
    const playBtn = (lack) => { const f = S.fieldFor(lack), need = S.needFor(lack, f); return big('play', `▶ ${esc(FIELD_N[f])}<small>עוד ${costTxt(need)}: משחק האוצר</small>`); };
    if (st === 'locked') {
      const need = d.deps.filter((x) => !S.isDone(G, x)).map((x) => stageById(x).n);
      h += `<div class="gm-note">${ICON.lock} ${T.locked}. נפתח אחרי: ${esc(need.join(', '))}</div>`;
      h += planHTML(d, P);
    } else if (st === 'avail') {
      const cost = P.sv ? { silver: P.sv } : {}, lack = S.lacking(G.res, cost), needP = d.priests > G.priests;
      h += stepsHTML(null);
      h += `<p style="margin-top:8px">כל שלב עולה חומרים מהמלאי שלך, ואתה בוחר מה לבנות ומתי. ראשית: מדידה${P.sv ? ` (${costTxt(cost)})` : ''}.</p>`;
      if (needP) h += `<div class="gm-warn">${T.needPriests(isoNum(d.priests))} (יש ${isoNum(G.priests)}). ${G.trainOn ? 'אפשר להכשיר בלשונית הצוותים.' : ''}</div>`;
      else h += Object.keys(lack).length ? playBtn(lack) : big('start', `${T.start}${P.sv ? `<small>${costTxt(cost)}</small>` : ''}`);
      h += planHTML(d, P);
    } else if (st === 'building') {
      const v = S.siteView(G, id), j = v.job || {}, p = v.p;
      h += `<div class="gm-bar" style="margin-top:10px" role="progressbar" aria-valuenow="${Math.round(p * 100)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${(p * 100).toFixed(1)}%"></i></div>`;
      if (sheetWarn && sheetArg === id && j.kind === 'pay') h += `<div class="gm-warn">${esc(sheetWarn)}</div>`;   // ── flow11 ── (N36) under the bar
      h += stepsHTML(v.ph, id);
      // the one action for this site
      if (G.st[id].ready) h += big('moment', `${ICON.star} לרגע המיוחד`);
      else if (j.kind === 'key') { const kw = keyWords(j, j.i === 0); h += `<div class="gm-note">${ICON.star} ${kw.def} מחכה לידיים שלך. הנדבך ממתין ${j.what === 'lintel' ? 'לו' : 'לה'}.</div>` + big('key', kw.act); }   // ── flow9 ── the game's verb
      else if (j.kind === 'inspect') h += `<div class="gm-note">${ICON.check} הבנייה הושלמה. המהנדס בודק כל אבן מיוחדת באנך ובפלס.</div>` + big('inspect', 'לבדיקה');
      else if (j.kind === 'pay') {   // ── flow8 ── (the owner, 28.9) one line: what the step does and what the player does next
        if (v.step && v.step.step === 'seg') h += `<p class="gm-line">${esc(segLine(G, id, v))}</p>`;
        h += Object.keys(v.lack || {}).length ? playBtn(v.lack) : big('build', v.step.step === 'seg' ? `▶ הביאו ${segWords(id, v.step.stones).n}<small>${costTxt(v.step.cost)}</small>` : `בנה ${esc(v.step.n || '')}<small>${costTxt(v.step.cost)}</small>`);
      }
      else if (j.kind === 'event') h += `<div class="gm-warn">${esc(EVENTS[j.ev].n)}: ${esc(EVENTS[j.ev].d)}</div>` + big('work', 'לאתר', '', false);
      else h += big('work', { survey: 'מדוד את האתר', dig: digWords(id).act, boulders: 'פנה את הסלעים', stone: 'הנח אבנים', finish: esc(PROJ[id].fin[v.fd] ? PROJ[id].fin[v.fd].n : 'גימור'), reset: 'פרק והנח מחדש' }[j.kind] || 'לאתר', '', false) + `<p class="gm-muted" style="text-align:center">או הקש על האתר עצמו. מכה בקצב = כפולה.</p>`;
      // courses: course N of M, stone k of n, the stock
      if (v.ph === 'courses' || v.ph === 'finish' || v.ph === 'inspect') {
        const base = (v.course - 1) * v.per;
        const cells = Array.from({ length: v.per }, (_, k) => { const i = base + k, key = keyOf(id, i); return `<i class="${i < v.set ? 'on' : i < v.paid ? 'stock' : ''}${key ? ' key' : ''}"></i>`; }).join('');
        h += `<div class="gm-sec">נדבך ${isoNum(v.course)} מתוך ${isoNum(v.C)}</div><div class="gm-course" aria-label="אבן ${v.inCourse} מתוך ${v.per}">${cells}</div>`;
        h += `<div class="gm-kv"><span>אבנים שהונחו</span><b class="gm-num">${isoFrac(v.set, v.n)}</b><span>במלאי באתר</span><b class="gm-num">${isoNum(v.stock)}</b><span>אבנים מיוחדות לפניך</span><b class="gm-num">${isoNum(v.keysLeft)}</b></div>`;
        if (v.step && v.step.ahead && j.kind !== 'pay') h += `<div class="gm-row"><span class="gm-grow">המקטע הבא: ${segWords(id, v.step.stones).n}<small>אפשר לקנות מראש, והצוותים ימשיכו גם בלעדיך</small></span>${Object.keys(v.lack || {}).length ? `<button class="gm-btn sm" data-a="play" data-id="${id}">▶ ${esc(FIELD_N[S.fieldFor(v.lack)])}</button>` : `<button class="gm-btn sm gm-btn-gold" data-a="build" data-id="${id}">${costTxt(v.step.cost)}</button>`}</div>`;
      }
      if (P.fin.length && (v.ph === 'finish' || v.ph === 'courses')) h += `<div class="gm-sec">גימור</div>` + P.fin.map((f, k) => `<div class="gm-row"><span class="gm-grow">${esc(f.n)}${f.src ? `<small>${esc(f.src)}</small>` : '<small>המחשה</small>'}</span>${k < v.fd ? `<span class="gm-check">${ICON.check}</span>` : costHTML(f.cost, G.res)}</div>`).join('');
      // crews
      const n = S.crewsAt(G, id), waits = j.kind && !j.crew && j.kind !== 'boulders';
      h += `<div class="gm-sec">${T.crews}</div><div class="gm-row"><span class="gm-grow">צוותים באתר: <b class="gm-num">${n}</b><small>${n ? (waits ? 'מחכים לך: ' + ({ pay: 'חומרים', key: 'האבן המיוחדת', inspect: 'הבדיקה', moment: 'הרגע' }[j.kind] || '') : 'מניחים אבן כל 3 דקות לצוות, גם כשאינך כאן') : 'אין צוות באתר'}</small></span>
        <button class="gm-btn sm" data-a="crewHere" data-id="${id}" data-dir="-1" ${n ? '' : 'disabled'} aria-label="פחות צוותים">−</button>
        <button class="gm-btn sm" data-a="crewHere" data-id="${id}" data-dir="1" ${G.crews.some((c) => c.at !== id) ? '' : 'disabled'} aria-label="עוד צוות">+</button></div>`;
      if (G.daily.vol !== S.dayKey(now)) h += `<div class="gm-row"><span class="gm-grow">${T.volunteers}<small>${T.volunteersNote} · ${T.gameNote}</small></span><button class="gm-btn sm" data-a="vol" data-id="${id}">הזמן</button></div>`;
      h += planHTML(d, P);
    } else {
      h += `<div class="gm-note" style="margin-top:10px">${ICON.check} ${T.stageDone}</div>${d.card ? `<div style="margin-top:10px">${srcHTML(d.card)}</div>` : ''}`;
      h += `<div class="gm-btn-row"><button class="gm-btn" data-a="focus" data-id="${id}">${ICON.pin} ${T.where}</button></div>`;
    }
    return h;
  }
  /* the six phases of every project, the current one lit */
  function stepsHTML(ph, id) {
    const i = ph === 'done' ? 99 : PH.indexOf(ph), dw = id ? digWords(id).row : '';   // ── director13 ── (N76a: the altar's row)
    return `<ol class="gm-steps">${PH.map((x, k) => `<li class="${k < i ? 'done' : k === i ? 'on' : ''}">${x === 'dig' && dw ? dw : PH_N[x]}</li>`).join('')}</ol>`;
  }
  /* the blueprint: Middot is the plan */
  function planHTML(d, P) {
    return d.card ? `<div class="gm-sec">התוכנית</div><div class="gm-plan">${srcHTML(d.card)}</div>` : '';
  }
  /* the meter's chip: what you hold, what the next step needs, and where to get it */
  function sourcesHTML(G, k) {
    const a = S.nextAction(G), need = (a.cost || {})[k] || 0, plan = k === 'stone' ? S.stockPlan(G) : null;
    let h = plan ? `<p class="gm-note">מלאי לחומה: בהר הבית מקטע עולה רק ${esc(countTxt('stone', plan.per))}. מה שנצבר ישמש גם את חומת העזרה, שם מקטע עולה ${esc(countTxt('stone', plan.next))}.</p>` : '';
    h += `<div class="gm-kv"><span>${resIcon(k)} יש לך</span><b class="gm-num">${fmt(G.res[k] || 0)}</b>${need ? `<span>הצעד הבא צריך</span><b class="gm-num">${isoNum(need)}</b>` : ''}</div><div class="gm-sec">מאיפה משיגים</div>`;
    // ── fun12 ── (the quarry's cycle) the stone's "▶ שחק" names the game it opens now ("▶ הקלע של דוד")
    const cyN = '';   // ── flow16 ── (fun12's cycle retired from the big button: the chip names the board alone) ── /flow16 ──
    // ── /fun12 ──
    for (const [kind, t, line] of SOURCES[k] || []) {
      // ── fun12 ── (the m3 row's label: cyN)
      const btn = kind === 'm3' ? `<button class="gm-btn sm gm-btn-gold" data-a="playField" data-k="${FIELD_OF[k]}">▶ ${esc(cyN || 'שחק')}</button>` : kind === 'kings' ? `<button class="gm-btn sm" data-a="kings">למלכים</button>` : kind === 'crew' ? `<button class="gm-btn sm" data-a="sheet" data-k="crews">לצוותים</button>` : kind === 'daily' ? `<button class="gm-btn sm" data-a="sheet" data-k="daily">היום</button>` : '';
      // ── /fun12 ──
      h += `<div class="gm-row"><span class="gm-grow"><b>${esc(t)}</b><small>${esc(line)}</small></span>${btn}</div>`;
    }
    return h;
  }

  function crewsHTML(G, now) {
    const sites = S.buildingSites(G);
    let h = `<p class="gm-muted">כל צוות עובד באתר אחד, גם כשאינך במשחק (עד 12 שעות). במחצבה הוא חוצב אבן.</p>`;
    if (!G.crews.length) h += `<div class="gm-note">עוד אין צוותים. הם יגיעו בקרוב.</div>`;
    G.crews.forEach((c, i) => {
      const opts = [...sites.map((id) => [id, stageById(id).n]), ...(S.isDone(G, 'har') ? [['quarry', T.quarry]] : []), ['none', T.idle]];
      h += `<div class="gm-row" style="display:block"><b>צוות ${i + 1}</b><div class="gm-seg" role="group" aria-label="מקום העבודה של צוות ${i + 1}">${opts.map(([at, n]) => `<button data-a="crew" data-i="${i}" data-at="${at}" aria-pressed="${(c.at || 'none') === at ? 'true' : 'false'}">${esc(n)}</button>`).join('')}</div></div>`;
    });
    if (S.isDone(G, 'har')) h += `<div class="gm-row"><span class="gm-grow">${ICON.stone} ${T.quarry}<small>${isoNum(S.crewsAt(G, 'quarry') * RATE.quarry * 60 * S.speedOf(G))} אבן בשעה מהצוותים · אפשר גם לחצוב בעצמך</small></span><button class="gm-btn sm" data-a="quarry">לחצוב</button></div>`;
    h += `<div class="gm-sec">${PAY.shop.n}</div><div class="gm-btn-row"><button class="gm-btn gm-btn-gold" data-a="shop">${ICON.coin}<span>המכונות, הכלים, האבן שלי, כלי הלויים והנרות</span></button></div>`;   // ── econ14 ── (the upgrades are bought in אוצר המלאכה now) ── /econ14 ──
    if (G.trainOn) {
      h += `<div class="gm-sec">${T.training}</div><div class="gm-row"><span class="gm-grow">${ICON.priest} ${T.priests}: <b class="gm-num">${G.priests}</b><small>רק כהנים בונים את הבית עצמו (יוספוס, קדמוניות 15.11.6)</small></span></div>`;
      for (const t of G.train) h += `<div class="gm-row"><span class="gm-grow">כהן בהכשרה</span><span class="gm-num" data-until="${t.t1}">${fmtClock(t.t1 - now)}</span></div>`;
      const free = G.train.length < G.trainSlots;
      h += `<div class="gm-btn-row"><button class="gm-btn gm-btn-gold" data-a="train" ${free && G.res.silver >= TRAIN.cost ? '' : 'disabled'}>${T.train} · ${ICON.silver}<span class="gm-num">${TRAIN.cost}</span> · ${fmtSpan(S.gmMs(G, TRAIN.min))}</button>
        <button class="gm-btn" data-a="quiz">${ICON.book} ${T.quizTitle}</button></div><p class="gm-muted" style="margin-top:8px">כל תשובה נכונה מקצרת הכשרה ב-${TRAIN.quizCutMin} דקות (עד ${TRAIN.quizPerDay} ביום).</p>`;
    }
    return h;
  }

  function caravansHTML(G, now) {
    // (hooks) the routes that bring what the goal waits for are tagged, so the right one is sent
    const goal = S.recommend(G), want = new Set(goal.kind === 'blocked' ? Object.keys(goal.lack || {}) : []);
    let h = `<p class="gm-muted">משלחת מביאה חומרים שאי אפשר לחצוב. קצרה משתלמת קצת יותר לשעה; ארוכה מכסה את הזמן שאינך כאן. אין מזל: אותה משלחת מביאה תמיד אותה כמות.</p>`;
    h += `<div class="gm-sec">בדרך (${G.car.length}/${G.carSlots})</div>`;
    if (!G.car.length) h += `<p class="gm-muted">אין משלחות בדרך.</p>`;
    G.car.forEach((c, k) => {
      const R = ROUTES[RIDX[c.r]], back = S.carState(c, now) === 'back';
      h += `<div class="gm-row"><span class="gm-grow">${resIcon(R.res)} ${esc(R.n)}<small>${isoNum(c.y, true)} ${esc(RES[R.res].n)}</small></span>${back ? `<button class="gm-btn sm gm-btn-gold" data-a="collect" data-k="${k}">${T.collect}</button>` : `<span class="gm-num" data-until="${c.t1}">${fmtClock(c.t1 - now)}</span>`}</div>`;
    });
    h += `<div class="gm-sec">מסלולים</div>`;
    for (const R of ROUTES) {
      const open = S.routeOpen(G, R.id), free = S.carFree(G) > 0;
      h += `<div class="gm-row" style="display:block" data-route="${R.id}"><div style="display:flex;gap:8px;align-items:center">${resIcon(R.res)}<b style="flex:1">${esc(R.n)}</b>${open && want.has(R.res) ? `<span class="gm-badge gold gm-need" style="position:static">נחוץ עכשיו</span>` : ''}${open ? '' : `<span class="gm-muted">${ICON.lock}</span>`}</div>`;
      const away = G.car.some((c) => c.r === R.id);
      if (open && away) h += `<small class="gm-muted">המשלחת של המסלול הזה בדרך. אפשר לשלוח שוב כשתחזור.</small>`;
      else if (open) {
        const ftue = R.ftue && !G.carCount[R.id];
        const opt = (len) => { const L = len === 'ftue' ? R.ftue : R[len]; return `<button class="gm-btn sm ${len === 'ftue' ? 'gm-btn-gold' : ''}" data-a="send" data-r="${R.id}" data-len="${len}" ${free && G.res.silver >= L.cost ? '' : 'disabled'}>${fmtSpan(S.gmMs(G, L.min))} · ${isoNum(L.y, true)}${L.cost ? ` · ${ICON.silver}<span class="gm-num">${L.cost}</span>` : ''}</button>`; };
        h += `<div class="gm-btn-row" style="margin-top:8px">${ftue ? opt('ftue') : ''}${opt('short')}${opt('long')}</div>`;
        h += `<div style="margin-top:8px;font-size:13px">${srcHTML(R.src)}</div>`;
      } else h += `<small class="gm-muted">${R.id === 'alexandria' || R.id === 'beitkerem' ? 'נפתח כשחומת העזרה נבנית' : 'נפתח אחרי שיטוח ההר'}</small>`;
      h += `</div>`;
    }
    return h;
  }

  function bookHTML(G) {
    const un = Object.keys(G.book.un).length, rd = Object.keys(G.book.read).length;
    if (bookSel && MIDX[bookSel] !== undefined) {
      const m = MIDDOT[MIDX[bookSel]];
      if (!G.book.un[m.id]) { bookSel = null; return bookHTML(G); }
      const i = MIDX[m.id], prev = MIDDOT[i - 1], next = MIDDOT[i + 1];
      return `<button class="gm-btn sm" data-a="bookBack">${ICON.back} כל המשניות</button>
        <h3 style="margin:12px 0 6px;font:700 18px/1.2 'Frank Ruhl Libre',serif">${esc(m.ref)}</h3>
        <p class="gm-q">${esc(m.he)}</p>
        <div class="gm-note">${esc(m.ex)}</div>
        ${m.nameSub ? `<p class="gm-muted" style="margin-top:6px;font-size:12px">שם ה׳ בפסוק נכתב כאן בכינוי.</p>` : ''}
        <div class="gm-btn-row"><button class="gm-btn" data-a="where" data-id="${m.focus}">${ICON.pin} ${T.where}</button>
        ${next && G.book.un[next.id] ? `<button class="gm-btn" data-a="mishnah" data-id="${next.id}">המשנה הבאה</button>` : ''}
        ${prev && G.book.un[prev.id] ? `<button class="gm-btn" data-a="mishnah" data-id="${prev.id}">הקודמת</button>` : ''}</div>
        <span class="gm-ref" style="margin-top:12px">ספריא, משנה מדות (תורת אמת)</span>
        <!-- ── hook19 -->
        <div class="gm-ask"><b>שאלו בבית</b>${esc(askOf(m.id))} <span class="gm-draft">טיוטה</span></div>
        ${isRead(G, m.id) ? `<div class="gm-rd done" role="status">✓ קראת את המשנה הזאת. הכוכב שלה נשמר</div>` : `<button class="gm-btn gm-btn-gold gm-rd" data-a="bookRead" data-id="${m.id}" disabled>קראתי ✓</button><small class="gm-muted gm-rd-h">קרא עד סוף המשנה, ואז לחץ: ★${READ.pts} וחמש נקודות מלאכה, פעם אחת לכל משנה</small>`}
        <!-- ── /hook19 -->`;
    }
    // ── ui ── (QA P2-8) "x מתוך N": a number and a bare "/" displayed reversed in RTL ("34/4 נפתחו")
    let h = `<p class="gm-muted">כל 34 המשניות של מסכת מידות. כל שלב שנבנה פותח את המשניות שלו. נפתחו <b class="gm-num">${un}</b> מתוך 34 · נקראו <b class="gm-num">${rd}</b></p>`;
    h += ARU.bookRiddle(G, ctx.now());   // ── hook20 ── (the daily riddle's row, and the facts it saved)
    h += `<div class="gm-btn-row" style="margin:0 0 10px"><button class="gm-btn sm" data-a="quiz">${ICON.book} ${T.quizTitle}</button><small class="gm-muted" style="align-self:center">שלוש ביום · כל תשובה נכונה: כסף${G.trainOn ? ' וקיצור הכשרה' : ''}</small></div>`;
    h += `<div class="gm-tabs" role="group" aria-label="פרקים">${MIDDOT_CHAPTERS.map((c, k) => `<button data-a="bookCh" data-c="${k}" aria-pressed="${k === bookCh}">פרק ${c}׳</button>`).join('')}</div>`;
    for (const m of MIDDOT.filter((x) => x.id.startsWith(`${bookCh + 1}.`))) {
      const open = !!G.book.un[m.id], read = !!G.book.read[m.id];
      const lead = m.he.split(' ').slice(0, 6).join(' ');
      h += open
        ? `<button class="gm-row" style="width:100%;text-align:start" data-a="mishnah" data-id="${m.id}"><span class="gm-grow"><b>${esc(m.ref.replace('משנה מדות ', ''))}</b> <span style="font-family:'Frank Ruhl Libre',serif">${esc(lead)}…</span></span>${isRead(G, m.id) ? `<span class="gm-check">${ICON.check}</span>` : `<span class="gm-badge gold" style="position:static">${read ? '★' + READ.pts : 'חדש'}</span>`}</button>`   // ── hook19 ──
        : `<div class="gm-row gm-lock"><span class="gm-grow"><b>${esc(m.ref.replace('משנה מדות ', ''))}</b> <small>${m.at === 'start' ? 'נפתחת בתחילת המשחק' : `נפתחת בסוף הבנייה של ${esc(stageById(m.at).n)}`}</small></span>${ICON.lock}</div>`;
    }
    // ── land17 ── "נוסף לספר": the info pop-ups that did not open (settings: חלונות מידע · רק בספר), newest first
    const notes = (G.notes || []).slice().reverse();
    if (notes.length) h += `<div class="gm-sec">נוסף לספר · <span class="gm-num">${notes.length}</span></div>` + notes.map((n) => `<div class="gm-row gm-note-row" style="display:block"><b>${esc(n.t)}</b>${srcHTML({ q: n.q, d: n.d, ref: n.ref })}</div>`).join('');
    // ── /land17 ──
    return h;
  }

  function dailyHTML(G, now) {
    const D = G.daily;
    let h = `<div class="gm-row"><span class="gm-grow"><b>${T.wage}</b><small>${T.streak(D.streak)} · ${T.shabbatGrace}</small></span>${D.wageDay === S.dayKey(now) ? `<span class="gm-check">${ICON.check}</span>` : ''}</div>`;
    h += `<div class="gm-sec">המשימות של היום</div>`;
    for (const t of D.tasks) {
      const def = TASKS[t.id];
      // (hooks) the learning tasks can be done right here, from the first day (the quiz used to live only in the
      // training yard, which opens with the altar's base: on a "quiz" day a new player could not finish the day's tasks)
      const go = t.done ? '' : t.id === 'quiz' ? `<button class="gm-btn sm" data-a="quiz">${ICON.book} לשאלה</button>` : t.id === 'learn' ? `<button class="gm-btn sm" data-a="sheet" data-k="book">${ICON.book} לספר</button>` : '';
      h += `<div class="gm-row"><span class="gm-grow">${esc(def.n(t.goal))}<small>${t.done ? 'הושלם: עלה לגפן' : `<span class="gm-num">${t.n}/${t.goal}</span>`}</small></span>${t.done ? `<span class="gm-check">${ICON.check}</span>` : go || ICON.vine}</div>`;
    }
    h += `<div class="gm-sec">${T.vine}</div>${vineSVG(G)}<div class="gm-kv"><span>עלים</span><b class="gm-num">${G.vine.leaves}</b><span>גרגירים</span><b class="gm-num">${G.vine.grapes}</b><span>אשכולות</span><b class="gm-num">${G.vine.clusters}</b></div>`;
    h += `<div style="margin-top:10px;font-size:13px">${srcHTML({ q: 'כָּל מִי שֶׁהוּא מִתְנַדֵּב עָלֶה, אוֹ גַרְגִּיר, אוֹ אֶשְׁכּוֹל, מֵבִיא וְתוֹלֶה בָהּ', ref: 'משנה מדות ג, ח' })}</div>`;
    h += `<p class="gm-muted" style="margin-top:8px">כל משימה נותנת עלה. שלוש משימות ביום נותנות גרגיר, ושבעה ימים כאלה נותנים אשכול. כשהאולם ייבנה, הגפן תיתלה על פתח ההיכל.</p>`;
    const hk = ctx.hooks && ctx.hooks();
    if (hk && hk.weekHTML) h += hk.weekHTML(G);           // (hooks/week.js) the weekly goal
    return h;
  }
  function vineSVG(G) {
    // a golden vine on a trellis beam, growing from the right (the reading side) as the collection grows:
    // leaves alternate above and below the stem; single grapes and clusters hang between them
    const L = Math.min(G.vine.leaves, 28), Gr = Math.min(G.vine.grapes, 14), C = Math.min(G.vine.clusters, 5);
    const X0 = 310, len = 70 + 234 * Math.min(1, (L + Gr * 2 + C * 6) / 70);
    const stemY = (x) => 44 + Math.sin(x / 34) * 7;
    const at = (f) => X0 - f * len;
    const leaf = (x, y, r, k) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r}) scale(${k})"><path d="M0 0c-3-5-9-6-11-2-5-2-9 3-6 7-4 3-1 9 4 8 1 5 7 6 9 2 4 3 9-1 7-6 5-1 5-8 0-9 1-5-5-7-8-3-1 1-3 2-5 3z" fill="#E7BC52" stroke="#9A7424" stroke-width=".9"/><path d="M-2 5 7 -1M-2 5l-3 5M-2 5l7 5" stroke="#B88E34" stroke-width=".7" fill="none"/></g>`;
    const berry = (x, y, r = 3.6) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="url(#gm-gr)" stroke="#8C6A1E" stroke-width=".7"/>`;
    let s = '<defs><radialGradient id="gm-gr" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#FFF1BF"/><stop offset=".55" stop-color="#EBBE4C"/><stop offset="1" stop-color="#B8871F"/></radialGradient></defs>';
    s += '<rect x="4" y="28" width="312" height="6" rx="3" fill="#8B6A3E" opacity=".5"/>';
    const n = Math.max(2, Math.round(len / 12));
    s += `<path d="M${X0} ${stemY(X0).toFixed(1)}` + Array.from({ length: n }, (_, k) => { const x = at((k + 1) / n); return ` L${x.toFixed(1)} ${stemY(x).toFixed(1)}`; }).join('') + '" fill="none" stroke="#A67B24" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>';
    for (let x = X0 - 26; x > X0 - len + 8; x -= 44) s += `<path d="M${x.toFixed(1)} ${stemY(x).toFixed(1)} q-6 -10 -12 -4 q-4 4 2 8" fill="none" stroke="#B88E34" stroke-width="1"/>`;
    // hanging fruit first (behind the leaves): clusters spread evenly, single grapes in the gaps
    const N = Gr + C, hang = [];
    for (let j = 0; j < C; j++) hang[Math.min(N - 1, Math.round((j + 0.5) * N / C - 0.5))] = 'c';
    for (let i = 0; i < N; i++) {
      const x = at((i + 0.5) / N * 0.94 + 0.03), y = stemY(x);
      if (hang[i] === 'c') {
        s += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} v9" stroke="#A67B24" stroke-width="1.4"/>`;
        [4, 3, 3, 2, 1].forEach((m, r) => { for (let j = 0; j < m; j++) s += berry(x + (j - (m - 1) / 2) * 7.2, y + 13 + r * 6.4, 3.9); });
      } else s += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} v8" stroke="#A67B24" stroke-width="1"/>` + berry(x, y + 12);
    }
    for (let k = 0; k < L; k++) {
      const x = at((k + 0.5) / L * 0.96 + 0.02), up = k % 2 === 0;
      s += leaf(x, stemY(x) + (up ? -5 : 4), up ? -40 + (k % 3) * 14 : 160 - (k % 3) * 14, 0.8 + (k % 4) * 0.05);
    }
    return `<svg class="gm-vine" viewBox="0 0 320 110" role="img" aria-label="${T.vine}: ${G.vine.leaves} עלים, ${G.vine.grapes} גרגירים, ${G.vine.clusters} אשכולות">${s}</svg>`;
  }


  function mapHTML(G) {
    // the stage graph: every chapter with its sites; what is open now stands out
    let h = '';
    for (const c of CHAPTERS) {
      h += `<div class="gm-sec">פרק ${'אבגד'[c.id - 1]}׳ · ${esc(c.n)}</div><div class="gm-map">`;
      for (const id of c.stages) {
        const st = S.statusOf(G, id), d = stageById(id), p = S.progressOf(G, id);
        const tag = st === 'done' ? ICON.check : st === 'building' ? `<span class="gm-num">${pct(p)}</span>` : st === 'avail' ? ICON.pin : ICON.lock;
        const need = st === 'locked' ? d.deps.filter((x) => !S.isDone(G, x)).map((x) => stageById(x).n).join(', ') : '';
        h += `<button class="gm-node ${st}" data-a="node" data-id="${id}" title="${esc(need ? 'אחרי: ' + need : d.n)}">${tag}<span>${esc(d.n)}</span><i class="gm-bs${starOf(G, id) ? ' on' : ''}" title="כוכב הספר"${starOf(G, id) ? ' aria-label="כוכב הספר: קראת משנה על השלב"' : ' aria-hidden="true"'}>★</i></button>`;   // ── hook19 ── the 4th star
      }
      h += `</div>`;
    }
    return h;
  }
  /* ── build6 ── the project board: every stage, its phase and progress; the open ones first */
  /* ── build6 ── FUN's loop sheets (hooks/loop.js registered as __BH_PARTS.fun): the overseer's orders, the daily, the album */
  function funHTML(G, now) {
    const L = (globalThis.__BH_PARTS || {}).fun;
    if (!L) return '';
    let h = '';
    for (const k of ['ordersHTML', 'dailyHTML', 'albumHTML']) { try { if (typeof L[k] === 'function') h += L[k](G, now) || ''; } catch (e) { /* FUN's part */ } }
    return h;
  }
  function boardHTML(G) {
    const rows = S.boardView(G).filter((b) => b.st === 'building' || b.st === 'avail');
    return `<div class="gm-board">${rows.map((b) => `<button class="gm-row gm-brow" data-a="node" data-id="${b.id}"><span class="gm-grow"><b>${esc(b.name)}</b><small>${b.st === 'avail' ? 'מוכן להתחלה' : esc(PH_N[b.ph] || '')}${b.crews ? ` · ${isoNum(b.crews)} צוותים` : ''}</small></span><span class="gm-num">${pct(b.p)}</span></button>`).join('')}</div>`;
  }
  function storeHTML(G) {
    const open = STAGES.filter((s) => { const st = S.statusOf(G, s.id); return st === 'avail' || st === 'building'; }).length;
    let h = `<p class="gm-muted">פתוחים עכשיו: <b class="gm-num">${open}</b> אתרים. אתה בוחר מה לבנות: הקש על אתר.</p>${boardHTML(G)}${mapHTML(G)}`;
    const hk = ctx.hooks && ctx.hooks();
    if (hk && hk.momentsHTML) h += hk.momentsHTML(G);        // (hooks) replay the key moments already played
    h += `<div class="gm-sec">חומרים</div>`;
    for (const k of RES_KEYS) h += `<div class="gm-row"><span class="gm-grow">${resIcon(k)} ${esc(RES[k].n)}</span><b class="gm-num">${fmt(G.res[k])}</b></div>`;
    h += `<div class="gm-row"><span class="gm-grow">${ICON.crew} ${T.crews}</span><b class="gm-num">${G.crews.length}</b></div>`;
    h += `<div class="gm-row"><span class="gm-grow">${ICON.priest} ${T.priests}</span><b class="gm-num">${G.priests}</b></div>`;
    const finds = Object.keys(G.finds).filter((k) => FINDS[k]);
    h += `<div class="gm-sec">ממצאים</div>` + (finds.length ? finds.map((k) => `<div class="gm-row" style="display:block"><b>${esc(FINDS[k].n)}</b><p style="font-size:13.5px;margin-top:4px">${esc(FINDS[k].d)}</p><span class="gm-ref">${esc(FINDS[k].ref)}</span></div>`).join('') : '<p class="gm-muted">עוד לא נמצאו ממצאים.</p>');
    h += `<div class="gm-sec">מכות</div><div class="gm-kv"><span>מכות בפטיש</span><b class="gm-num">${G.stats.strikes}</b><span>מכות מדויקות</span><b class="gm-num">${G.stats.perfect}</b><span>הרצף הארוך</span><b class="gm-num">${G.stats.best}</b></div>`;
    if (G.name || G.mishmar) h += `<p class="gm-muted" style="margin-top:12px">${esc(G.name || 'כהן')}${G.mishmar ? ` · משמר ${esc(MISHMAROT[G.mishmar - 1])}` : ''}</p>`;
    return h;
  }

  function menuHTML(G) {
    const s = ctx.settings();
    const tg = (k, label, note, on) => `<div class="gm-toggle"><span>${label}${note ? `<small>${note}</small>` : ''}</span><button class="gm-sw" role="switch" aria-checked="${on ? 'true' : 'false'}" data-a="${k === 'demo' ? 'demo' : 'set'}" data-k="${k}" aria-label="${esc(label)}"></button></div>`;
    // ── land17 ── the two choices (cam, popups); ── hud18 ── the dock's five tabs are in the landscape top bar now, not in the menu
    let h = '';
    const sg = (k, label, opts, cur) => `<div class="gm-toggle gm-choice"><span>${label}</span><div class="gm-seg" role="group" aria-label="${esc(label)}">${opts.map(([v, t]) => `<button type="button" data-a="setv" data-k="${k}" data-v="${v}" aria-pressed="${cur === v ? 'true' : 'false'}">${t}</button>`).join('')}</div></div>`;
    // ── /hud18 ── ── /land17 ──
    h += tg('rhythm', T.rhythm, T.rhythmNote, s.rhythm !== false);
    h += tg('haptics', T.haptics, '', s.haptics !== false);
    h += tg('mute', 'השתקה', '', !!s.mute);
    h += sg('cam', 'מצלמה', [['follow', 'עוקבת'], ['director', 'במאי']], s.cam === 'director' ? 'director' : 'follow');   // ── land17 ── (PRINCIPLES §0.4)
    h += sg('popups', 'חלונות מידע', [['show', 'מופיעים'], ['book', 'רק בספר']], s.popups === 'book' ? 'book' : 'show');   // ── land17 ── (§0.5)
    h += tg('demo', T.demoMode, T.demoNote, !!G.demo);
    // ── hooks ── the label follows the building (a preview → the altar complete → Chanukat HaBayit; hooks/avodah.js)
    const avL = ctx.act && ctx.act.canAvodah ? ((ctx.hooks && ctx.hooks() && ctx.hooks().avodahMenu) ? ctx.hooks().avodahMenu() : { t: 'העבודה בבית · שלב ב׳', sub: 'התמיד, הקטורת והנרות — לפי השעון האמיתי' }) : null;
    if (ctx.act && ctx.act.canYard) h += `<button class="gm-btn gm-btn-block" data-a="yard44" style="width:100%;margin:6px 0 4px">${ICON.star} חצר האומנים<small style="display:block;font-weight:500;font-size:12px;opacity:.85">תרגול כל עבודה, בכל רמה שנפתחה — בלי לבנות</small></button>`;   // ── fable32 (build 44) ── ── /fable32 ──
    if (avL) h += `<button class="gm-btn gm-btn-gold gm-btn-block" data-a="avodah" style="width:100%;margin:6px 0 10px">${ICON.star} ${esc(avL.t)}<small style="display:block;font-weight:500;font-size:12px;opacity:.85">${esc(avL.sub)}</small></button>`;
    if (ctx.act && ctx.act.canAvodah) h += `<button class="gm-btn gm-btn-block" data-a="scenes" data-k="tour" style="width:100%;margin:0 0 10px">${ICON.star} סיור בבית המקדש<small style="display:block;font-weight:500;font-size:12px;opacity:.85">ההיכל, הכיור, לשכת הטלאים · איפה הארון? · יום הכיפורים</small></button>`;   // ── scenes ──
    h += `<div class="gm-btn-row"><button class="gm-btn" data-a="whole">${ICON.star} ${T.wholeView}</button><button class="gm-btn" data-a="sheet" data-k="book">${ICON.book} ${T.book}</button></div>`;
    // ── fable20 ── (the owner, 8.10 08:17: "תוציא אותם החוצה") the profile and the near circle as rows of their own, in portrait's menu too
    h += `<div class="gm-btn-row"><button class="gm-btn" data-a="sheet" data-k="profile">${ICON.priest} הכהן שלי</button><button class="gm-btn" data-a="sheet" data-k="circle">${ICON.crew} המשמר שלי</button><button class="gm-btn" data-a="sheet" data-k="daily">${ICON.vine} ${T.daily}</button></div>`;
    // ── /fable20 ──
    // ── games10 ── "משחקי ביניים": the classic games' section (src/games menuHTML; absent part → nothing)
    try { const P = (globalThis.__BH_PARTS || {}).games; if (P && typeof P.menuHTML === 'function') h += P.menuHTML(G); } catch (e) { /* the menu goes on */ }
    try { const N = globalThis.__BH_NET; if (N && typeof N.menuHTML === 'function') h += N.menuHTML(); } catch (e) { /* NET10's "כהנים יחד" (its own inserter skips then) */ }
    // ── /games10 ──
    h += `<div class="gm-sec">משחק</div>`;
    h += confirmNew
      ? `<div class="gm-warn">${T.newGameSure}${G.demo ? ' (שמירת ההדגמה בלבד)' : ''}</div><div class="gm-btn-row"><button class="gm-btn" data-a="newGame">${T.yes}</button><button class="gm-btn" data-a="newNo">${T.no}</button></div>`
      : `<div class="gm-btn-row"><button class="gm-btn" data-a="newGame">${T.newGame}</button></div>`;
    h += `<p class="gm-muted" style="margin-top:14px;font-size:12.5px">כל הטקסטים במשחק הם טיוטה עד לאישור. מקורות: ספריא (משנה: תורת אמת; בבלי: מהדורת ויליאם דוידסון), יוספוס בתרגום חופשי, וארכאולוגיה. דמות רב האומנים ו"עזרת העם" הם ${T.gameNote}.</p>`;
    return h;
  }

  /* ───────── modal cards ───────── */
  const queue = [];
  let showing = false;
  /** show a card; resolves with the value of the button pressed. Cards queue up. */
  function modal(html, { cls = '', buttons = [{ label: T.next, value: true, gold: true }], onOpen } = {}) {
    return new Promise((resolve) => { queue.push({ html, cls, buttons, onOpen, resolve }); pumpModal(); });
  }
  function pumpModal() {
    if (showing || !queue.length || !rootEl) return;
    showing = true; modalOpen++;
    rootEl.classList.add('modal-open');   // (v27: the deal's sheet, z-index 6, steps aside while a card is up — it covered the first wage's "המשך")
    if (ctx.act && typeof ctx.act.hideInfo === 'function') ctx.act.hideInfo();   // ── flow11 ── (N67) a place card never over a card
    const m = queue.shift();
    const w = doc.createElement('div');
    w.className = 'gm-modal';
    w.innerHTML = `<div class="gm-card ${m.cls}" role="dialog" aria-modal="true">${m.html}<div class="gm-btn-row">${m.buttons.map((b, i) => `<button class="gm-btn ${b.gold ? 'gm-btn-gold' : ''}" data-i="${i}" style="flex:1">${b.label}</button>`).join('')}</div></div>`;
    rootEl.appendChild(w);
    if (m.onOpen) m.onOpen(w);
    requestAnimationFrame(() => w.classList.add('on'));
    const first = w.querySelector('.gm-btn-gold') || w.querySelector('.gm-btn');
    if (first) first.focus({ preventScroll: true });
    w.addEventListener('click', (e) => {
      const b = e.target.closest('.gm-btn[data-i]'); if (!b) return;
      const v = m.buttons[+b.dataset.i].value;
      const out = typeof v === 'function' ? v(w) : v;
      w.classList.remove('on');
      setTimeout(() => { w.remove(); showing = false; modalOpen--; if (modalOpen <= 0) rootEl.classList.remove('modal-open'); m.resolve(out); pumpModal(); }, 220);
    });
  }
  const draftTag = `<span class="gm-draft">${T.draft}</span>`;
  // ── land17 ── (PRINCIPLES §0.5, §4) popups 'book': an info pop-up does not open; a small "נוסף לספר" float shows and the card's fact
  // is kept in the book (G.notes). A card that asks the player something (the quiz, the name, a choice) is never routed here.
  const bookMode = () => { try { return ctx.settings().popups === 'book'; } catch (e) { return false; } };
  function noted(kind, o) {
    if (!rootEl || !bookMode()) return false;
    try { if (ctx.act.bookNote) ctx.act.bookNote({ k: kind, t: o.t, q: o.q, d: o.d, ref: o.ref }); } catch (e) { /* the save's */ }
    float('נוסף לספר', (typeof innerWidth === 'number' ? innerWidth : 400) * 0.62, (typeof innerHeight === 'number' ? innerHeight : 800) * 0.36, 'gold');
    if (ctx.sfx) ctx.sfx.play('pop');
    return true;
  }
  // ── /land17 ──
  function stageDoneCard(r, extra = '') {
    const d = stageById(r.id);
    const rew = [];
    for (const [k, v] of Object.entries(r.rewards || {})) rew.push(`<span>${resIcon(k)}${isoNum(v, true)}</span>`);
    if (r.crewsNow) rew.push(`<span>${ICON.crew} צוות חדש</span>`);
    for (const u of r.routes || []) rew.push(`<span>${ICON.caravan} ${esc(ROUTES[RIDX[u]].n)}</span>`);
    if (r.training) rew.push(`<span>${ICON.priest} ${T.training}</span>`);
    if (r.mishnayot && r.mishnayot.length) rew.push(`<span>${ICON.book} ${r.mishnayot.length === 1 ? 'משנה חדשה' : `${isoNum(r.mishnayot.length)} משניות חדשות`}</span>`);
    // ── land17 ── popups 'book': the stage's source card is kept in the book; the stage's words and what it brings go to one banner and one toast
    if (!d.quiet && noted('stage', { t: d.n, q: d.card && d.card.q, d: d.card && d.card.d, ref: d.card && d.card.ref })) {
      banner(`${d.n}: ${T.stageDone}`);
      if (rew.length) toast({ icon: 'star', title: d.n, body: rew.join(' '), kind: 'mini', ms: 3600 });
      return Promise.resolve(true);
    }
    // ── /land17 ──
    return modal(`<div class="gm-kick">${d.quiet ? '' : T.stageDone} ${draftTag}</div><h2>${esc(d.n)}</h2>${srcHTML(d.card)}${rew.length ? `<div class="gm-rew">${rew.join('')}</div>` : ''}${extra}`, { cls: d.quiet ? 'quiet' : '' });
  }
  function storyCard(o, kick = '') {
    if (noted('story', o || {})) return Promise.resolve(true);   // ── land17 ──
    return modal(`<div class="gm-kick">${esc(kick)} ${draftTag}</div><h2>${esc(o.t || '')}</h2>${srcHTML(o)}`);
  }
  function donorCard(k) {
    const o = DONORS[k]; if (!o) return Promise.resolve();
    if (noted('donor', o)) return Promise.resolve(true);   // ── land17 ──
    return modal(`<div class="gm-kick">תרומה ${draftTag}</div><h2>${esc(o.t)}</h2>${srcHTML(o)}`);
  }
  function findCard(k) {
    const f = FINDS[k]; if (!f) return Promise.resolve();
    if (noted('find', { t: f.n, d: f.d, ref: f.ref })) return Promise.resolve(true);   // ── land17 ──
    return modal(`<div class="gm-kick">ממצא ${draftTag}</div><h2>${esc(f.n)}</h2><p>${esc(f.d)}</p><span class="gm-ref">${esc(f.ref)}</span>`);
  }
  function chapterCard(n) {
    const next = STORY['ch' + (n + 1)];
    // ── land17 ── popups 'book': the chapter's end is one banner; the next chapter's story is kept in the book
    if (bookMode()) { if (next) noted('story', { t: next.t, q: next.q, d: next.d, ref: next.ref }); banner(T.chapterDone(`${'אבגד'[n - 1]}׳`)); return Promise.resolve(true); }
    // ── /land17 ──
    return modal(`<div class="gm-kick">${ICON.star} ${draftTag}</div><h2>${T.chapterDone(`${'אבגד'[n - 1]}׳`)}</h2>${next ? `<p style="margin-top:6px"><b>${esc(next.t)}</b></p>${srcHTML({ q: next.q, d: next.d, ref: next.ref })}` : ''}`);
  }
  function welcomeCard(lines, extra = '') {
    return modal(`<div class="gm-kick">${T.welcome}${ctx.G().name ? `, ${esc(T.kohen(ctx.G().name))}` : ''} ${draftTag}</div><h2>${T.whileAway}</h2>${lines.length ? `<ul style="padding-inline-start:18px;margin:0;font:500 15px/1.7 'Heebo',sans-serif">${lines.map((l) => `<li>${l}</li>`).join('')}</ul>` : '<p>האתר חיכה לך.</p>'}${extra}`);
  }
  function namePrompt() {
    let pick = 0;
    const html = `<div class="gm-kick">${T.mentor} · ${T.mentorNote} ${draftTag}</div><h2>${T.nameAsk}</h2><input class="gm-input" maxlength="24" aria-label="${T.nameAsk}" placeholder="השם שלך (לא חובה)"><p style="margin-top:12px"><b>${T.mishmarAsk}</b></p><div class="gm-mishmarot" role="group" aria-label="${T.mishmarAsk}">${MISHMAROT.map((m, i) => `<button type="button" data-m="${i + 1}" aria-pressed="false">${esc(m)}</button>`).join('')}</div><p class="gm-muted" style="margin-top:8px;font-size:12.5px">24 משמרות הכהונה (דברי הימים א כד).</p>`;
    return modal(html, {
      buttons: [{ label: T.next, gold: true, value: (w) => ({ name: w.querySelector('.gm-input').value.trim().slice(0, 24), mishmar: pick || 1 + Math.floor(Math.random() * 24) }) },
        { label: T.pickForMe, value: (w) => ({ name: w.querySelector('.gm-input').value.trim().slice(0, 24), mishmar: 1 + Math.floor(Math.random() * 24) }) }],
      onOpen: (w) => w.querySelector('.gm-mishmarot').addEventListener('click', (e) => {
        const b = e.target.closest('[data-m]'); if (!b) return;
        pick = +b.dataset.m;
        for (const x of w.querySelectorAll('[data-m]')) x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      }),
    });
  }
  /** ── flow8 ── right after the name: "שלום, הכהן <שם>" (the mentor, a made-up figure) */
  function greetCard(G) {
    const m = G.mishmar ? MISHMAROT[G.mishmar - 1] : '';
    return modal(`<div class="gm-kick">${T.mentor} · ${T.mentorNote} ${draftTag}</div><div class="gm-greet">${ICON.priest}</div><h2 class="gm-greet-h">${esc(T.greet(G.name ? String(G.name).trim() : ''))}</h2><p>${esc(T.greetD(m))}</p><span class="gm-ref">אלף כהנים אומנים: יוספוס, קדמוניות היהודים 15.11.2 (בתרגום חופשי)</span>`, { cls: 'greet', buttons: [{ label: T.greetGo, value: true, gold: true }] });
  }
  /** ── flow8 ── a small plate over the hero ("הכהן יכין"); pos: () => {x, y, on} CSS px (a shared object), null hides it */
  let plateP = null, plateX = -1e9, plateY = -1e9, plateVis = null;
  function plate(pos, text = '') {
    if (!rootEl) return;
    plateP = pos && text ? pos : null;
    if (text) E.plate.textContent = text;
    E.plate.classList.toggle('gm-hidden', !plateP); plateX = plateY = -1e9; plateVis = null;
  }
  /** ── flow8 ── (BRIEF8B · DESIGN8B R2) THE target of the Mount's work: a big gold pointer bobbing over it and a gold ring on it,
      kept until the step is done. pos: () => {x, y, on} CSS px (a shared object); null hides it. r: the ring's radius (px) */
  let markP = null, markX = -1e9, markY = -1e9, markVis = null, markR = 0, markNoRing = false;
  function mark(pos, r = 40, solo = false) {
    if (!rootEl) return;
    markP = pos || null;
    E.mark.classList.toggle('solo', !!solo);   // ── flow10 ── (PRODUCER10 N7) the pointer alone: the world's ring is under his feet
    if (r !== markR) { markR = r; E.mark.style.setProperty('--r', `${Math.round(r)}px`); }
    E.mark.classList.toggle('gm-hidden', !markP); markX = markY = -1e9; markVis = null;
  }
  function quizCard(q) {
    if (!q) return modal(`<h2>${T.quizTitle}</h2><p>לשאלות של היום כבר ענית. נתראה מחר.</p>`);
    let chosen = -1;
    return modal(`<div class="gm-kick">${T.quizTitle} ${draftTag}</div><h2 style="font-size:21px">${esc(q.q)}</h2><div class="gm-seg" style="flex-direction:column">${q.a.map((a, i) => `<button type="button" data-c="${i}" aria-pressed="false" style="text-align:start">${esc(a)}</button>`).join('')}</div><span class="gm-ref">${esc(q.ref)}</span>`, {
      buttons: [{ label: 'בדוק', gold: true, value: () => chosen }, { label: T.close, value: -1 }],
      onOpen: (w) => w.querySelector('.gm-seg').addEventListener('click', (e) => {
        const b = e.target.closest('[data-c]'); if (!b) return;
        chosen = +b.dataset.c;
        for (const x of w.querySelectorAll('[data-c]')) x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      }),
    });
  }

  /* ───────── vision title ───────── */
  function vision(text, ms = 2600, top = false) {
    return new Promise((res) => {
      if (!rootEl) { res(); return; }
      E.visionH.textContent = text; E.vision.classList.toggle('top', !!top); E.vision.classList.add('on');
      setTimeout(() => { E.vision.classList.remove('on'); setTimeout(res, 500); }, ms);
    });
  }
  // ── land17 ── (wave 17, contract 4; PRINCIPLES §1: "BRAWL!" and the one-line messages at every change of mode)
  /** the banner: ONE imperative line at the top, queued — never two at once, none while a stamp is up. ui.banner(text, { ms = 2200 }) → a promise, resolved when it has left */
  const bq = []; let bCur = null, stampRun = null;
  function pumpBanner() {
    if (bCur || !bq.length || !rootEl || stampRun) return;
    const b = bq.shift(); bCur = b;
    E.banner.textContent = b.text; E.banner.classList.add('on');
    if (ctx.sfx && !b.quiet) ctx.sfx.play('banner');
    b.tm = setTimeout(() => { E.banner.classList.remove('on'); b.tm = setTimeout(() => { bCur = null; b.res(); pumpBanner(); }, 260); }, b.ms);
  }
  function banner(text, { ms = 2200, quiet = false } = {}) {
    return new Promise((res) => {
      if (!rootEl || !text) { res(); return; }
      bq.push({ text: String(text), ms: Math.max(600, +ms || 2200), quiet, res });
      while (bq.length > 4) bq.shift().res();   // (a burst keeps its latest four)
      pumpBanner();
    });
  }
  // ── hook20 ── ui.rays(el, { ms }) → remove(): the stamp's light rays, turning slowly behind the content of any positioned, overflow-hidden card (a reward's light)
  function rays(el, o = {}) {
    if (!el) return () => {};
    const i = doc.createElement('i'); i.className = 'gm-st-rays'; i.setAttribute('aria-hidden', 'true'); i.style.animation = `ec-spin ${o.ms || 6000}ms linear infinite`;
    el.insertBefore(i, el.firstChild); return () => i.remove();
  }
  // ── /hook20 ──
  /** the stamp: a huge centred word with rays, no buttons, no touch (pointer-events: none). ui.stamp(text, { ms = 1100, cue, delay }) → a promise, resolved when it has left.
      cue: a music cue ('workStart': the breath, then the stinger on the beat) — the stamp then lands with the cue's boom (≈ 0.16 s of its slam before it) */
  function stamp(text, { ms = 1100, cue, delay = 0 } = {}) {
    if (cue === undefined) cue = /^יוצאים לעבודה/.test(String(text || '')) ? 'workStart' : '';   // (the work's own stamp always has its stinger)
    return new Promise((res) => {
      if (!rootEl || !text) { res(); return; }
      if (stampRun) { clearTimeout(stampRun.t0); clearTimeout(stampRun.tm); E.stamp.classList.remove('on'); stampRun.res(); stampRun = null; }
      let lead = Math.max(0, +delay || 0), stinger = false;
      if (cue) {
        let r = 0; try { const M = globalThis.__BH_MUSIC; r = M && typeof M.cue === 'function' ? +M.cue(cue) || 0 : 0; } catch (e) { r = 0; }
        stinger = r > 0;
        lead = Math.max(lead, r > 0 ? Math.max(0, r - 0.16) : 0.6);   // (no music — muted, or a state with its own score: the same breath, then the kit's own stamp)
      }
      const run = { res, t0: 0, tm: 0 };
      stampRun = run;
      run.t0 = setTimeout(() => {
        if (stampRun !== run || !rootEl) { res(); return; }
        E.stampT.textContent = String(text); E.stamp.style.setProperty('--ms', `${Math.max(500, ms)}ms`);
        E.stamp.classList.remove('on'); void E.stamp.offsetWidth; E.stamp.classList.add('on');
        if (!stinger && ctx.sfx) ctx.sfx.play('stamp');
        if (E.banner.classList.contains('on')) E.banner.classList.remove('on');
        run.tm = setTimeout(() => { E.stamp.classList.remove('on'); if (stampRun === run) stampRun = null; res(); pumpBanner(); }, Math.max(500, ms));
      }, lead * 1000);
    });
  }
  // ── /land17 ──
  /* ── build7 ── the opening's cinema: the HUD steps aside, a tap anywhere skips (onSkip), a title over the first shot */
  let cineSkip = null, cineT = 0, cineTitle = '';
  /** ── flow11 ── (N41) a key moment on screen: the HUD steps back (the top row, the pill, the dock, the toasts), as in the cinema */
  function momentOn(on) { if (rootEl) rootEl.classList.toggle('gm-momenton', !!on); }
  function cinema(on, onSkip, title = '') {
    if (!rootEl) return;
    rootEl.classList.toggle('gm-cinema', !!on);
    E.cine.classList.toggle('gm-hidden', !on);
    cineSkip = on ? onSkip || null : null;
    clearTimeout(cineT);
    const mine = () => E.visionH.textContent === cineTitle;   // (the game's own title — "כאן ייבנה הבית" at the swap — is left alone)
    if (on && title) { cineTitle = title; E.visionH.textContent = title; E.vision.classList.add('top', 'on'); cineT = setTimeout(() => { if (mine()) E.vision.classList.remove('on'); }, 2400); }
    else if (!on && mine()) E.vision.classList.remove('on');
    if (on) { closeSheet(); coach(null, ''); }
  }

  // ── econ14 ── (D2) the coins' flight: ≤ 12 coins arc from the work to the purse in ≤ 1.2 s, each landing a clink; the purse bumps
  // and counts up; a tap anywhere skips to the end. → a promise (resolved when they land)
  const coinEls = []; let coinRun = null, shopHTML0 = '';
  function coinsSkip() { const r = coinRun; if (r) r.end(); }
  function coins(n, x, y) {
    if (!rootEl || !(n > 0)) return Promise.resolve();
    coinsSkip();
    const pe = E.res && E.res.querySelector('.gm-purse'), pr = pe && pe.getBoundingClientRect();
    const tx = pr && pr.width ? pr.left + pr.width / 2 : 60, ty = pr && pr.height ? pr.top + pr.height / 2 : 28;
    const numEl = pe && pe.querySelector('.gm-num'), to = Math.floor(ctx.G().res.silver || 0), from = Math.max(0, to - n);
    const sx0 = Number.isFinite(x) ? x : innerWidth / 2, sy0 = Number.isFinite(y) ? y : innerHeight * 0.55;
    const k = Math.min(12, Math.max(3, Math.ceil(n / 2))), dur = 640, gap = Math.min(45, 480 / k);
    while (coinEls.length < k) { const el = doc.createElement('div'); el.className = 'gm-anchor gm-coin'; el.innerHTML = ICON.coin; rootEl.appendChild(el); coinEls.push(el); }
    const reduced = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
    if (numEl) numEl.textContent = fmtK(from);
    return new Promise((res) => {
      const anims = [], t0 = performance.now(), total = dur + gap * (k - 1);
      let done = false, iv = 0;
      const end = () => {
        if (done) return; done = true; coinRun = null; clearInterval(iv); removeEventListener('pointerdown', end, true);
        for (const a of anims) { try { a.cancel(); } catch (e) { /* gone */ } }
        for (const el of coinEls) el.style.opacity = '0';
        if (numEl) numEl.textContent = fmtK(ctx.G().res.silver || 0);
        if (pe && pe.animate && !reduced) pe.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.22)' }, { transform: 'scale(1)' }], { duration: 220 });
        res();
      };
      coinRun = { end };
      addEventListener('pointerdown', end, true);
      if (ctx.sfx) setTimeout(() => { if (!done && ctx.sfx) ctx.sfx.play('coinsIn', { n: Math.min(8, k) }); }, dur - 40);
      if (reduced || !coinEls[0].animate) { setTimeout(end, 250); return; }
      for (let i = 0; i < k; i++) {
        const el = coinEls[i], sx = sx0 + ((i % 3) - 1) * 16, sy = sy0 + (((i * 7) % 5) - 2) * 7;
        const mx = (sx + tx) / 2 + (i % 2 ? 46 : -46), my = Math.min(sy, ty) + (sy - ty) * 0.25;
        el.style.opacity = '1';
        anims.push(el.animate([
          { transform: `translate(${sx}px,${sy}px) scale(.5)`, opacity: 0 },
          { transform: `translate(${mx}px,${my}px) scale(1.15)`, opacity: 1, offset: 0.45 },
          { transform: `translate(${tx}px,${ty}px) scale(.7)`, opacity: 1 },
        ], { duration: dur, delay: i * gap, easing: 'cubic-bezier(.33,.1,.45,1)', fill: 'both' }));
      }
      // (the count on a timer, not on frames: a tab in the background or a paused page still lands the coins on time)
      iv = setInterval(() => { const u = Math.min(1, Math.max(0, (performance.now() - t0 - dur * 0.9) / Math.max(1, total - dur * 0.9))); if (numEl) numEl.textContent = fmtK(from + (to - from) * u); if (u >= 1) end(); }, 40);
    });
  }
  // ── /econ14 ──

  /* ───────── world anchors: ring, floats, coach ───────── */
  // ── econ14 ── (D3, her choice: the ring) a fixed gold target on the stone and a blue ring that closes onto it at the beat; the
  // gold glows inside the window (nr), "עכשיו!" at the beat (nw); while the teach runs a hand presses on the gold at the beat
  const ringS = { on: false, t0: 0, beat: 0, win: 0.2, pos: null, hitT: -1, rx: -1e9, ry: -1e9, sk: -1, ak: -1, nr: false, nw: false, teach: false, fbT: 0 };
  /** pos: () => ({x,y,on}) in CSS px (shared object is fine) · o.teach: the slow first tries (the hand on the gold) */
  function ringStart(pos, t0, beat, win, o = {}) {
    ringS.on = true; ringS.t0 = t0; ringS.beat = beat; ringS.win = win; ringS.pos = pos; ringS.sk = ringS.ak = -1;
    ringS.teach = !!o.teach; E.ring.classList.add('live'); E.ring.classList.toggle('teach', ringS.teach);
  }
  function ringStop() { ringS.on = false; ringS.ak = 0; ringS.nr = ringS.nw = false; E.ring.classList.remove('live', 'hit', 'near', 'now', 'teach'); E.ringI.style.opacity = '0'; E.ringB.style.opacity = ''; }
  function ringHit(perfect) { ringS.hitT = performance.now() / 1000; E.ring.classList.toggle('hit', !!perfect); }
  /** the feedback line under the gold: kind 'ok' | 'warn'; it fades by itself (1.3 s) */
  function ringSay(text, kind = '') {
    if (!E.ringFb) return;
    E.ringFb.textContent = text || ''; E.ringFb.className = text ? `on ${kind}` : '';
    clearTimeout(ringS.fbT); if (text) ringS.fbT = setTimeout(() => { if (E.ringFb) E.ringFb.className = ''; }, 1300);
  }
  function clearFloats() { for (const f of floats) { f.t0 = -1; f.el.style.opacity = '0'; } E.combo.classList.remove('on'); }
  function combo(n) {
    // (D3: "3 ברצף!", her words on the vote page; no multiplier)
    E.combo.textContent = n >= 2 ? `${n} ברצף!` : '';
    E.combo.classList.toggle('on', n >= 2);
  }
  // ── /econ14 ──
  let fi = 0;
  function float(text, x, y, kind = '') {
    const f = floats[fi++ % FLOATS];
    f.el.textContent = text; f.el.className = 'gm-anchor gm-float ' + kind;
    // ── flow10 ── (PRODUCER10 N35: "12/32" half off the left edge) a float stays inside the screen
    const W = typeof innerWidth === 'number' ? innerWidth : 400, H = typeof innerHeight === 'number' ? innerHeight : 800;
    // ── flow11 ── (PRODUCER11 N51: "9/32 אבן" drawn over the pill's corner) and it never rises into the pill: it starts below the
    // pill's bottom by its 46-px rise and half its height
    let top = 110; try { const g = E.goal && E.goal.getBoundingClientRect(); if (g && g.height > 0) top = Math.max(top, g.bottom + 46 + 16); } catch (e) { /* no layout */ }
    f.t0 = performance.now(); f.dur = kind === 'warn' ? 1700 : 1150; f.x = Math.max(56, Math.min(W - 56, x)); f.y = Math.max(top, Math.min(H - 140, y));
  }
  let coachPos = null, coachShown = false, coachX = -1e9, coachY = -1e9, coachVis = null;
  function coach(pos, text, who = T.mentor) {
    if (!rootEl) return;   // ── ui ── (the FTUE's timers are not cleared on destroy: "Cannot read … 'classList'" after Phase B opened)
    coachPos = pos || null;
    if (!text) {   // no text: hide all — or, with a position, the pointing hand alone
      E.bub.classList.add('gm-hidden'); rootEl.classList.remove('coach-on');
      E.coach.classList.toggle('gm-hidden', !pos); coachShown = !!pos; coachX = coachY = -1e9; coachVis = null; return;
    }
    E.bub.innerHTML = `${who ? `<small>${esc(who)}</small>` : ''}${esc(text)}`;
    E.bub.classList.remove('gm-hidden');
    rootEl.classList.add('coach-on');
    E.coach.classList.toggle('gm-hidden', !pos); coachShown = !!pos; coachX = coachY = -1e9; coachVis = null;
  }

  function frame(nowMs) {
    if (!rootEl) return;
    const t = nowMs / 1000;
    if (markP) {    // ── flow8 ── the target's pointer and ring (the ring steps aside while the rhythm ring is live on it)
      const p = markP();
      const vis = !!(p && p.on && p.x > 8 && p.x < innerWidth - 8 && p.y > 70 && p.y < innerHeight - 90) && !whole && !modalOpen && !rootEl.classList.contains('gm-cinema');
      if (vis !== markVis) { markVis = vis; E.mark.style.opacity = vis ? '' : '0'; }
      if (vis) { const x = Math.round(p.x), y = Math.round(p.y); if (x !== markX || y !== markY) { markX = x; markY = y; E.mark.style.transform = `translate(${x}px,${y}px)`; } }
      // (the ring steps aside only while the rhythm ring is visibly live on the same spot: one ring at a time)
      const rr = ringS.on && ringS.ak > 5 && Math.hypot(ringS.rx - markX, ringS.ry - markY) < 60;
      if (rr !== markNoRing) { markNoRing = rr; E.mark.classList.toggle('noring', rr); }
    }
    if (plateP) {   // ── flow8 ── the plate follows the hero
      const p = plateP();
      const vis = !!(p && p.on && p.x > 20 && p.x < innerWidth - 20 && p.y > 110 && p.y < innerHeight - 120) && !whole && !modalOpen && !sheetKind && !rootEl.classList.contains('gm-cinema');   // ── flow10 ── (PRODUCER10 N17: not over a sheet)
      if (vis !== plateVis) { plateVis = vis; E.plate.style.opacity = vis ? '' : '0'; }
      if (vis) { const x = Math.round(p.x), y = Math.round(p.y); if (x !== plateX || y !== plateY) { plateX = x; plateY = y; E.plate.style.transform = `translate(${x}px,${y}px) translate(-50%,-100%)`; } }
    }
    // rhythm ring: contracts from 2.8× to 1× at the beat (── econ14 ── was 2.2×: the vote page's 66 → 22 reads as "closing")
    if (ringS.on && ringS.pos) {
      const p = ringS.pos();
      if (p && p.on) {
        if (Math.abs(p.x - ringS.rx) > 0.4 || Math.abs(p.y - ringS.ry) > 0.4) { ringS.rx = p.x; ringS.ry = p.y; E.ring.style.transform = `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px)`; E.combo.style.transform = `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px) translate(-50%,-72px)`; }   // (the CSS offset, kept)
        const u = (t - ringS.t0) / Math.max(0.05, ringS.beat - ringS.t0);
        const s = u < 1 ? 2.8 - 1.8 * u : 1;
        const a = u < 0 ? 0 : u < 1 ? 0.35 + 0.65 * u : Math.max(0, 1 - (t - ringS.beat) / 0.9);
        // ── econ14 ── the gold glows inside the window; "עכשיו!" (and the teach's hand) at the beat
        const toB = ringS.beat - t, nr = Math.abs(toB) <= ringS.win && a > 0, nw = toB < 0.12 && toB > -0.1;
        if (nr !== ringS.nr) { ringS.nr = nr; E.ring.classList.toggle('near', nr); }
        if (nw !== ringS.nw) { ringS.nw = nw; E.ring.classList.toggle('now', nw); }
        // ── /econ14 ──
        // DOM writes only when the value changes (an idle ring costs nothing per frame)
        const sk = Math.round(s * 1000), ak = Math.round(a * 100);
        if (sk !== ringS.sk) { ringS.sk = sk; E.ringI.style.transform = `scale(${sk / 1000})`; }
        if (ak !== ringS.ak) { ringS.ak = ak; E.ringI.style.opacity = String(ak / 100); }
      } else if (ringS.ak !== 0) { ringS.ak = 0; E.ringI.style.opacity = '0'; }
    }
    // floats
    for (const f of floats) {
      if (f.t0 < 0) continue;
      const u = (nowMs - f.t0) / f.dur;
      if (u >= 1) { f.t0 = -1; f.el.style.opacity = '0'; continue; }
      f.el.style.transform = `translate(${f.x.toFixed(1)}px,${(f.y - 46 * u).toFixed(1)}px) translate(-50%,-50%) scale(${(1 + 0.25 * Math.max(0, 1 - u * 4)).toFixed(2)})`;
      f.el.style.opacity = (u < 0.75 ? 1 : 1 - (u - 0.75) / 0.25).toFixed(2);
    }
    // coach
    if (coachShown && coachPos) {
      const p = coachPos();
      const vis = !!(p && p.on && p.x > 10 && p.x < innerWidth - 10 && p.y > 60 && p.y < innerHeight - 110);
      if (vis !== coachVis) { coachVis = vis; E.coach.style.opacity = vis ? '1' : '0'; }
      if (vis) { const x = Math.round(p.x), y = Math.round(p.y); if (x !== coachX || y !== coachY) { coachX = x; coachY = y; E.coach.style.transform = `translate(${x}px,${y}px)`; } }
    }
  }

  /* ───────── tick: countdowns in the open sheet ───────── */
  function tick(now) {
    if (!rootEl) return;
    if (sheetKind) for (const el of E.shBody.querySelectorAll('[data-until]')) {
      const left = +el.dataset.until - now;
      if (left <= 0) { renderSheet(); break; }
      el.textContent = fmtClock(left);
    }
    // ── flow8 ── (the owner, 28.9: "בעוד 0:02 לא סופר אחורה") every clock in a card, a toast or the coach ticks: a `.gm-live`
    // element reads its appointment again each second (the crews' next stone starts over once one is set); gone → "עכשיו"
    for (const el of rootEl.querySelectorAll('.gm-toasts .gm-live, .gm-modal .gm-live, .gm-bub .gm-live')) {
      const h = ctx.hooks && ctx.hooks(), key = el.dataset.live;
      let left = key && h && h.liveMs ? h.liveMs(key) : undefined;
      if (left === undefined) left = +el.dataset.until - now;
      const txt = left == null || left <= 0 ? 'עכשיו' : fmtClock(left);
      if (el.textContent !== txt) el.textContent = txt;
    }
    badges();
  }

  function setWhole(on) {
    whole = !!on;
    doc.body.classList.toggle('gm-view', whole);
    for (const k of ['top', 'goal', 'dock']) E[k].classList.toggle('gm-hidden', whole);
    E.back.classList.toggle('gm-hidden', !whole);
    if (whole) { closeSheet(); coach(null, ''); ringStop(); }
    refresh();
  }

  return {
    mount, destroy, refresh, refreshPill, tick, frame, toast, flashRes, float, clearFloats, combo, coach, vision, cinema,
    stamp, banner, rays,   // ── land17 ── (contract 4) ── hook20 ── (rays)
    uxPill,   // ── ux24 ── ── /ux24 ──
    counter, bump, hold, xp,   // ── hud18 ── (contract 1) the counters as targets
    score, scoreGain, dinar, nudge,   // ── hook19 ── the master score's capsule, its notes and the coin's celebration
    /** popups 'book': a key moment's source is kept in the book instead of its end card → true when it was (moments.js asks) */
    noteMoment: (M) => noted('moment', { t: M && M.n, q: M && M.src && M.src.q, d: M && M.src && M.src.d, ref: M && M.src && M.src.ref }),
    openSheet, closeSheet, renderSheet, modal, momentOn, stageDoneCard, storyCard, findCard, donorCard, chapterCard, welcomeCard, namePrompt, quizCard, greetCard, plate, mark, get markOn() { return !!markP && markVis === true; },
    ring: { start: ringStart, stop: ringStop, hit: ringHit, say: ringSay /* ── econ14 ── */ }, setWhole, coins, coinsSkip, /* ── econ14 ── */
    get sheet() { return sheetKind; }, get sheetArg() { return sheetArg; },
    get busy() { return !!sheetKind || modalOpen > 0 || showing; },     // (key moments are tracked by the controller)
    get root() { return rootEl; },
    get whole() { return whole; },
    deal,   // ── fun14 ── the course loop's deal ── /fun14 ──
    /** ── flow10 ── the coach's words on screen now ('' when hidden) */
    get coachText() { return E.bub && !E.bub.classList.contains('gm-hidden') ? E.bub.textContent || '' : ''; },
    /** an inline SVG icon by name or resource key (for the hooks' strip) */
    icon: (k) => ICON[k] || resIcon(k),
  };
}
