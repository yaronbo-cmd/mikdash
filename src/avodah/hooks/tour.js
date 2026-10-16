/* ─────────────────────────────────────────────────────────────────────────────
 * avodah/hooks/tour.js (HOOKS agent, round 3; docs/HOOKS.md §14, docs/PLAYTEST.md round 3): what the scenes panel
 * (src/avodah/scenes: the tour, "איפה הארון?", the Yom Kippur service) was missing between "a card" and "a reason to
 * come back". The playtest found a 40-card tour that simply closed at the end, with 3–7 text cards in a row at one
 * view (the child and the investor left at the first stop in the model), and nothing kept between visits.
 *   stamps     a stamp ("חותמת") for every stop, chapter and step visited, kept on the device (25 in all; the museum
 *              passport, never a currency: nothing is bought or unlocked with them)
 *   next stop  at a stop with more cards, "לתחנה הבאה" moves on to the next view (the cards stay one tap back)
 *   doors      each tab's last card opens the next question: the tour → the Ark (Yoma 5:2), the Ark → the one day a
 *              man entered where it stood (Kelim 1:9), the service → when the real Yom Kippur comes (the calendar)
 *   home       the Phase B home shows the stamps and, from Rosh HaShana, the coming Yom Kippur (an announced event)
 * The scenes panel calls `globalThis.__bhSceneHooks.render(el, state, api)` after each render (one marked line in
 * scenes/index.js); everything here is optional for it. Texts are drafts ("טיוטה") with their sources; ה׳ only.
 * ──────────────────────────────────────────────────────────────────────────── */
import { dayInfo } from '../../calendar.js';

export const KEY = 'bh_stamps';
export const TABS = { tour: { he: 'הסיור', n: 10 }, ark: { he: 'איפה הארון?', n: 5 }, yk: { he: 'סדר העבודה', n: 10 } };
export const TOTAL = 25;
const DAY = 864e5;
const LRI = '⁦', PDI = '⁩';
const iso = (n) => LRI + n + PDI;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DRAFT = '<span class="sc-draft">טיוטה</span>';
const DRAFT_AV = '<span class="av-draft">טיוטה</span>';   // (the Phase B home's own draft chip)

/* ── the stamps (pure over a plain object) ── */
export function blank() { return { v: 1, tour: {}, ark: {}, yk: {}, done: {} }; }
export function load(store) {
  try { const o = JSON.parse((store || globalThis.localStorage).getItem(KEY) || 'null'); if (o && o.v === 1) return { ...blank(), ...o }; } catch (e) { /* no storage */ }
  return blank();
}
export function save(o, store) { try { (store || globalThis.localStorage).setItem(KEY, JSON.stringify(o)); } catch (e) { /* no storage: the stamps last this visit */ } }
/** stamp a stop; → 'new' | 'done' (the tab's last stamp, first time) | null */
export function stamp(o, mode, id, n) {
  if (!TABS[mode] || !id) return null;
  const m = o[mode] || (o[mode] = {});
  if (m[id]) return null;
  m[id] = 1;
  if (Object.keys(m).length >= (n || TABS[mode].n) && !o.done[mode]) { o.done[mode] = 1; return 'done'; }
  return 'new';
}
export const count = (o, mode) => (mode ? Object.keys(o[mode] || {}).length : Object.keys(TABS).reduce((a, k) => a + Object.keys(o[k] || {}).length, 0));

/* ── the real Yom Kippur (the calendar engine): the next one, and how far ── */
export function nextYomKippur(from = new Date()) {
  const t0 = +from;
  for (let d = 0; d < 400; d++) {
    try { const i = dayInfo(new Date(t0 + d * DAY)); if (i && i.holiday && i.holiday.id === 'yom-kippur') return { days: d, date: new Date(t0 + d * DAY), today: d === 0 }; } catch (e) { return null; }
  }
  return null;
}
/** an announced event: from Rosh HaShana (~10 days before) the home says it is coming; on the day it says "today" */
export const YK_ANNOUNCE_DAYS = 12;

/* ── the doors at each tab's end: knowledge, never currency ── */
export const DOORS = {
  tour: { to: 'ark', go: 'לתעלומה: איפה הארון?', h: 'דבר אחד לא ראית בבית: את הארון.', q: 'מִשֶּׁנִּטַּל הָאָרוֹן, אֶבֶן הָיְתָה שָׁם מִימוֹת נְבִיאִים רִאשׁוֹנִים, וּשְׁתִיָּה הָיְתָה נִקְרֵאת', ref: 'יומא ה, ב', d: 'בבית השני עמדה בקודש הקדשים אבן, ולא ארון. אז לאן נעלם הארון?' },
  ark: { to: 'yk', go: 'לסדר העבודה · צפייה', h: 'למקום שבו עמד הארון נכנס אדם אחד, יום אחד בשנה.', d: 'הכהן הגדול, ביום הכיפורים — ורק הוא. את עבודתו רואים בלשונית "סדר העבודה", בצפייה.', ref: 'כלים א, ט' },
  yk: { to: null },
};

/* ── the panel ── */
const CSS = `
.sc-stamps{display:flex;align-items:center;gap:6px;margin:-2px 0 4px;font:600 12px/1.2 Heebo,Arial,sans-serif;color:var(--sc-lock-ink,#6B5A45)}
.sc-stamps i{display:inline-block;width:9px;height:9px;border-radius:50%;border:1.5px solid var(--sc-on-line,#B8862B);background:transparent}
.sc-stamps i.on{background:var(--sc-on-line,#B8862B);border-color:var(--sc-on-line,#B8862B)}
.sc-stops button .sc-st{color:var(--sc-count,#7E5210);font-weight:800;margin-inline-end:3px}
.sc-done{margin-top:8px;padding:9px 11px;border-radius:12px;background:var(--sc-draft,#FFE7B8);border:1px solid var(--sc-line,#D9C49A);color:var(--sc-ink,#2A2016)}
.sc-done b{display:block;font:700 14.5px/1.35 Heebo,Arial,sans-serif;color:var(--sc-draft-ink,#7A4B00)}
.sc-done p{margin:4px 0 0;font-size:13.5px}
.sc-done .sc-btn{margin-top:8px;min-height:44px}
.sc-hk-next{min-height:44px}`;   // (a 44-px touch target, like the rest of the tour panel)
function css() {
  if (typeof document === 'undefined' || document.getElementById('sc-hk-css')) return;
  const st = document.createElement('style'); st.id = 'sc-hk-css'; st.textContent = CSS; document.head.appendChild(st);
}

let S = null;                                     // the stamps, loaded once per page
const stamps = () => S || (S = load());

/** after each render of the scenes panel: state {mode, stop, card, cards, n, id, sub, washed}, api {goStop, open} */
export function render(el, st, api = {}) {
  if (!el || !st || !TABS[st.mode]) return;
  css();
  const o = stamps();
  const got = stamp(o, st.mode, st.id, st.n);
  if (got) save(o);
  // the stamp row under the tabs
  const panel = el.firstElementChild;
  const tabs = panel && panel.querySelector('.sc-tabs');
  const n = st.n || TABS[st.mode].n, have = count(o, st.mode);
  if (tabs && !panel.querySelector('.sc-stamps')) {
    const row = document.createElement('div');
    row.className = 'sc-stamps'; row.setAttribute('aria-label', `חותמות: ${have} מתוך ${n}`);
    let dots = ''; for (let k = 0; k < n; k++) dots += `<i class="${k < have ? 'on' : ''}"></i>`;
    row.innerHTML = `<span>חותמות ${esc(TABS[st.mode].he)}</span>${dots}<span>${iso(`${have}/${n}`)}</span>`;
    tabs.insertAdjacentElement('afterend', row);
  }
  // a small seal on every chip already stamped
  const m = o[st.mode] || {};
  const ids = st.ids || [];
  panel.querySelectorAll('.sc-stops button[data-s]').forEach((b) => { const id = ids[+b.dataset.s]; if (id && m[id] && !b.querySelector('.sc-st')) b.insertAdjacentHTML('afterbegin', '<span class="sc-st" aria-hidden="true">✓</span>'); });
  // at a stop with more cards: a way on to the next view (the cards stay one tap back)
  const row = panel.querySelectorAll('.sc-row'); const bar = row[row.length - 1];
  const more = st.cards - 1 - st.card;
  if (bar && more > 0 && st.stop < n - 1 && !st.sub && api.goStop) {
    const b = document.createElement('button');
    b.className = 'sc-btn sc-hk-next'; b.type = 'button'; b.dataset.hk = 'nextstop';
    b.textContent = `לתחנה הבאה ⟵`;
    b.setAttribute('aria-label', `לתחנה הבאה (עוד ${more} כרטיסים כאן)`);
    const next = bar.querySelector('[data-a="next"]'); if (next) next.insertAdjacentElement('beforebegin', b); else bar.appendChild(b);
  }
  // the tab's end: the door to the next question
  if (st.stop === n - 1 && st.card >= st.cards - 1 && !st.sub) {
    const card = panel.querySelector('.sc-card');
    if (card && !card.querySelector('.sc-done')) card.insertAdjacentHTML('beforeend', doorHTML(st.mode, o));
  }
  el.__hkStop = st.stop; el.__hkApi = api;
  if (!el.__hk) {
    el.__hk = true;
    el.addEventListener('click', (e) => {
      const b = e.target && e.target.closest && e.target.closest('[data-hk]'); if (!b) return;
      e.stopPropagation();
      const A = el.__hkApi || {};
      if (b.dataset.hk === 'nextstop' && A.goStop) A.goStop((el.__hkStop || 0) + 1);
      else if (b.dataset.hk === 'door' && A.open) A.open(b.dataset.k);
    }, true);
  }
}
/** the box at the end of a tab */
export function doorHTML(mode, o, now = new Date()) {
  const n = TABS[mode].n, have = count(o, mode), all = count(o);
  let h = `<div class="sc-done" role="note"><b>${have >= n ? `${esc(TABS[mode].he)}: כל ${iso(n)} החותמות` : `${esc(TABS[mode].he)}: ${iso(`${have}/${n}`)} חותמות`}${all >= TOTAL ? ` · כל ${iso(TOTAL)} החותמות של הבית` : ''}</b>`;
  const D = DOORS[mode];
  if (D && D.to) {
    h += `<p><b style="display:inline">${esc(D.h)}</b> ${D.q ? `״${esc(D.q)}״ ` : ''}${esc(D.d)} <span class="sc-src">(${esc(D.ref)})</span> ${DRAFT}</p>`;
    h += `<button class="sc-btn gold" type="button" data-hk="door" data-k="${D.to}">${esc(D.go)} ⟵</button>`;
  } else {
    const y = nextYomKippur(now);
    if (y) h += `<p>${y.today ? 'היום יום הכיפורים: זה היום שבו העבודה הזאת נעשתה.' : `יום הכיפורים הבא: בעוד ${iso(y.days)} ימים (י׳ בתשרי). ביום עצמו הלשונית "סדר העבודה" מסומנת "היום".`} ${DRAFT}</p>`;
  }
  return h + '</div>';
}
/** the Phase B home: the stamps and, near the day, the coming Yom Kippur (an announced event, never a countdown to lose);
    for a player who came by the link (no Phase A, so no wood chamber), the Ark mystery on his second day of service */
export const ARK_AFTER_DAYS = 2;
export function homeHTML(now = new Date(), store, A = null) {
  const o = store ? load(store) : stamps();
  const all = count(o);
  const y = nextYomKippur(now);
  let h = '';
  const days = A && A.hk && A.hk.days ? Object.values(A.hk.days).filter((d) => d && d.g > 0).length : 0;
  if (days >= ARK_AFTER_DAYS && !count(o, 'ark')) {
    h += `<div class="av-box hk-ark"><small><b>תעלומה: איפה הארון?</b> בבית השני לא היה ארון בקודש הקדשים — אבל הייתה מסורת על אבן אחת ברצפה (שקלים ו, א–ב). חמישה צעדים. ${DRAFT_AV}</small><div style="margin-top:6px"><button class="av-btn" data-a="scenes" data-k="ark">לחקור</button></div></div>`;
  }
  if (y && y.days <= YK_ANNOUNCE_DAYS) {
    h += `<div class="av-box hk-yk"><small><b>${y.today ? 'היום: יום הכיפורים' : `בעוד ${iso(y.days)} ימים: יום הכיפורים`}</b> — עבודת הכהן הגדול, בצפייה: הטבילות, הקטורת לפני ולפנים, ההזאות. ${DRAFT_AV}</small><div style="margin-top:6px"><button class="av-btn${y.today ? ' gold' : ''}" data-a="scenes" data-k="yk">סדר העבודה</button></div></div>`;
  }
  if (all > 0 && all < TOTAL) h += `<div class="av-box hk-stamps"><small>חותמות הבית: ${iso(`${all}/${TOTAL}`)} — הסיור ${iso(`${count(o, 'tour')}/10`)} · הארון ${iso(`${count(o, 'ark')}/5`)} · יום הכיפורים ${iso(`${count(o, 'yk')}/10`)}</small></div>`;
  return h;
}

// (registered on import: the scenes panel may open before Phase B loads, from the Phase A menu)
if (typeof globalThis !== 'undefined') globalThis.__bhSceneHooks = { render, v: 1 };
