/* ── fable32 (build 32) ── book32.js — "יומן הכהן" on the screen (journal32.js keeps its data): ONE sheet in place of the lobby's separate
 * ספר הזכרונות and the titles' card, opened from the full lobby's one door, the start screen's small door beside "משחק קצר", the day's
 * summary and the unlock card. Its tabs (≥ 44 px; journal32's TABS32 — those that are on):
 *   תפקידים   — the roles book as it was (pis23's bookHTML23: the ratings, the titles, build 31's practice doors — from the lobby only;
 *               mid-day read-only)
 *   משניות    — a page for every source he has met at an act's end (end30's registry), grouped by the act, "חדש" until opened, "N מתוך M"
 *               (the sources not met are not listed: no spoilers); a page — the quote, its reference, טיוטה, where it came in; o.today:
 *               only today's (the summary's "📜 המקורות של היום")
 *   הבקרים שלי — the mornings served, newest first: the real date and the Hebrew one, the morning's roles and their ratings
 *   אותות     — the badges (BADGES33) as ספר הזכרונות showed them
 * The unlock moment (future-unlocks-he.md "מה לוקחים" 2; the first key, the lot): the first time the lot gives him a role he never had,
 * as that act's rating word ends, day33 pauses the day ("j32new") and the card says "עמוד חדש ביומן: ‹התפקיד›" with the role's main
 * source line — "לפתוח ביומן" (that page) and "המשך"; the first morning ever: "היומן שלך נפתח". Calm: no countdown, no timer, the day
 * waits under it; nothing is lost by "המשך".
 *   journalHTML32(save, o) — the sheet's markup (tests)      unlockHTML32({ id, hello, save }) — the card's
 *   openJournal32({ doc, save, tab, page, today, practice, can, note31, persist, sfx, onClose }) → { close(quiet), el, show(tab, page) }
 *   createUnlock32({ E, doc, sfx }) → { destroy(), state(), cont(), open() }        (focus17.js makes it; globalThis.__J32U)
 * Every word a draft (טיוטה) or המחשה; never a Divine Name; RTL; every button ≥ 44 px; no red. ── /fable32 ── */
import { J32, tabsOn32, jr32, groups32, count32, seen32, mainPage32, realDate32 } from './journal32.js';
import { ACT30, RATE30, served30, servedHe30 } from './rate30.js';
import { bookHTML23, css23 } from './pis23.js';
import { BADGES33 } from './day33.js';
import { where29 } from './time29.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// (every class under .j32 / .j32-u; the close button is .j32x — page.html's global .x is absolutely placed)
const CSS = `.j32{position:fixed;inset:0;z-index:63;display:flex;align-items:center;justify-content:center;background:#0E0A05B8;direction:rtl;font-family:Heebo,system-ui,sans-serif;color:#FFF6DA;pointer-events:auto}
.j32>.c{width:min(660px,calc(100vw - 16px));height:calc(100% - 12px);max-height:600px;display:flex;flex-direction:column;box-sizing:border-box;border-radius:18px;background:linear-gradient(#3A2A16,#21170B);border:2px solid #C8923A;box-shadow:0 10px 40px #0009;overflow:hidden}
.j32 .hd{flex:none;display:flex;align-items:center;gap:6px;padding:5px 6px;border-bottom:1px solid #C8923A66}
.j32 .hd h2{margin:0 4px 0 2px;display:flex;align-items:center;gap:4px;font:900 17px/1 Heebo,system-ui,sans-serif;color:#FFE6A0;white-space:nowrap}.j32 .hd h2 i{font-style:normal;font-size:20px}
.j32 .tb{flex:1;min-width:0;display:flex;gap:4px}
.j32 .tb button{position:relative;flex:1 1 0;min-width:0;min-height:44px;padding:0 6px;border-radius:12px;border:1.5px solid #8A6A3A;background:#1C140A;color:#E6D9BE;font:800 13px/1.1 Heebo,system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;touch-action:manipulation}
.j32 .tb button.on{background:linear-gradient(180deg,#6A4C1C,#3A2A10);border-color:#FFD66E;color:#FFF6DA}
.j32 .tb em{position:absolute;top:2px;left:4px;min-width:16px;height:16px;padding:0 4px;box-sizing:border-box;border-radius:8px;background:#FFD66E;color:#2A1804;font:900 10px/16px Heebo,system-ui,sans-serif;font-style:normal}
.j32 .hd .j32x{flex:none;width:44px;height:44px;border-radius:12px;border:1.5px solid #E2B65A;background:#FFECBE1F;color:#FFF6DA;font:900 18px/1 Heebo,system-ui,sans-serif;cursor:pointer;touch-action:manipulation}
.j32 .bd{flex:1;min-height:0;overflow:auto;padding:6px 12px 10px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
.j32 button:active{transform:scale(.97)}.j32 button:disabled{opacity:.4;cursor:default}
.j32 .p23-bk{position:static;inset:auto;z-index:auto;display:block;background:none;color:inherit}.j32 .p23-bk .c{width:auto;max-height:none;overflow:visible;padding:0;border:0;border-radius:0;background:none;box-shadow:none}
.j32 .ct{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:center;gap:2px 10px;margin:2px 0 6px;font:800 14px/1.3 Heebo,system-ui,sans-serif;color:#FFE6A0;text-align:center}.j32 .ct small{font:700 11px/1.3 Heebo,system-ui,sans-serif;color:#FFF6DA;opacity:.75}.j32 .ct em{font-style:normal;padding:0 7px;border-radius:9px;background:#FFD66E;color:#2A1804;font:900 11px/17px Heebo,system-ui,sans-serif}
.j32 .td{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 4px;padding:2px 2px 2px 0;font:900 15px/1.2 Heebo,system-ui,sans-serif;color:#FFF6DA}
.j32 h3{margin:8px 0 4px;font:900 14px/1.2 Heebo,system-ui,sans-serif;color:#FFE6A0;text-align:right}
.j32 .g{display:grid;grid-template-columns:repeat(auto-fill,minmax(176px,1fr));gap:6px}
.j32 .t{position:relative;min-height:56px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:2px;padding:5px 10px;border-radius:12px;border:1.5px solid #8A6A3A;background:#1C140A;color:#FFF6DA;text-align:right;font:700 12px/1.3 Heebo,system-ui,sans-serif;cursor:pointer;touch-action:manipulation}
.j32 .t b{font:900 13px/1.2 Heebo,system-ui,sans-serif;color:#FFD66E}.j32 .t span{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.j32 .t.nw{border-color:#FFD66E;background:linear-gradient(180deg,#3A2A12,#1C140A)}.j32 .t em{position:absolute;top:4px;left:6px;padding:0 6px;border-radius:8px;background:#FFD66E;color:#2A1804;font:900 10px/16px Heebo,system-ui,sans-serif;font-style:normal}
.j32 .pg{max-width:580px;margin:0 auto;text-align:right}
.j32 .nv{display:flex;align-items:center;justify-content:space-between;gap:8px}.j32 .nv .ac{font:800 13px/1.2 Heebo,system-ui,sans-serif;color:#FFE6A0}.j32 .nv .ix{font:700 12px/1 Heebo,system-ui,sans-serif;opacity:.7}
.j32 .nv button,.j32 .pn button,.j32 .td button{min-height:44px;padding:0 12px;border-radius:12px;border:1.5px solid #E2B65A;background:#FFECBE1F;color:#FFF6DA;font:800 14px/1 Heebo,system-ui,sans-serif;cursor:pointer;touch-action:manipulation;white-space:nowrap}
.j32 .pg .ld{margin-top:6px;font:700 13px/1.3 Heebo,system-ui,sans-serif;opacity:.85}
.j32 blockquote{margin:6px 0 6px;padding:10px 14px;border-radius:14px;border-inline-start:4px solid #FFD66E;background:#FFF6DA14;font:800 19px/1.55 Heebo,system-ui,sans-serif;color:#FFF6DA}
.j32 .gl{font:700 13px/1.3 Heebo,system-ui,sans-serif;opacity:.85}
.j32 .rf{font:900 15px/1.3 Heebo,system-ui,sans-serif;color:#FFE6A0}.j32 .rf .tt{display:inline-block;margin-inline-start:6px;padding:0 8px;border-radius:9px;border:1px dashed #E2B65A;font:700 11px/1.5 Heebo,system-ui,sans-serif;color:#E6D9BE}
.j32 .nt{margin-top:4px;font:700 12px/1.3 Heebo,system-ui,sans-serif;opacity:.75}.j32 .mt{margin-top:6px;font:700 12px/1.3 Heebo,system-ui,sans-serif;opacity:.7}
.j32 .pn{display:flex;justify-content:space-between;gap:8px;margin-top:10px}
.j32 .mo{margin:6px 0;padding:6px 10px;border-radius:12px;background:#1C140A;border:1.5px solid #8A6A3A;text-align:right}
.j32 .mh{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 10px;font:700 12px/1.35 Heebo,system-ui,sans-serif}.j32 .mh b{font:900 15px/1.2 Heebo,system-ui,sans-serif;color:#FFE6A0}.j32 .mh .hb{color:#FFE6A0}
.j32 .mr{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}.j32 .mr i{font-style:normal;padding:2px 8px;border-radius:10px;background:#FFF6DA14;font:700 12px/1.45 Heebo,system-ui,sans-serif}.j32 .mr i b{margin-inline-start:4px}.j32 .mr b.mehudar{color:#FFD66E}.j32 .mr b.kasher{color:#FFF6DA}.j32 .mr b.tikkun{color:#D8CDB8}
.j32 .bg{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:6px}
.j32 .b{display:flex;align-items:center;gap:8px;min-height:44px;box-sizing:border-box;padding:4px 10px;border-radius:12px;background:#1C140A;border:1.5px dashed #8A6A3A;text-align:right;opacity:.78}.j32 .b.on{border-style:solid;border-color:#E2B65A;opacity:1}
.j32 .b i{font-style:normal;font-size:20px;flex:none}.j32 .b b{display:block;font:800 13px/1.2 Heebo,system-ui,sans-serif}.j32 .b small{display:block;font:700 10px/1.3 Heebo,system-ui,sans-serif;opacity:.75}
.j32 .emp{margin:16px 8px;font:700 14px/1.5 Heebo,system-ui,sans-serif;opacity:.85;text-align:center}.j32 .old{display:block;margin:6px 0;font:700 12px/1.3 Heebo,system-ui,sans-serif;opacity:.75;text-align:center}
.j32 .dr{display:block;margin-top:10px;font:600 10px/1.3 Heebo,system-ui,sans-serif;opacity:.55;text-align:center}
@media (max-width:700px){.j32 .hd h2 span{display:none}.j32 .tb button{font-size:12px;padding:0 4px}}
.j32-u{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:#0E0A05A6;direction:rtl;font-family:Heebo,system-ui,sans-serif;color:#FFF6DA;pointer-events:auto;animation:j32in .45s ease-out}
.j32-u .c{width:min(480px,calc(100vw - 24px));max-height:calc(100% - 12px);overflow:auto;box-sizing:border-box;padding:10px 16px;border-radius:20px;background:radial-gradient(120% 90% at 50% 0%,#5A4220,#21170B 70%);border:2px solid #E2B65A;text-align:center;box-shadow:0 0 30px #FFD66E33,0 10px 40px #0009}
.j32-u .hl{display:inline-block;margin:0 0 4px;padding:2px 12px;border-radius:12px;background:#FFD66E;color:#2A1804;font:900 14px/1.4 Heebo,system-ui,sans-serif}
.j32-u h2{margin:2px 0 6px;font:900 19px/1.25 Heebo,system-ui,sans-serif}
.j32-u blockquote{margin:4px 0;padding:6px 12px;border-radius:12px;background:#FFF6DA14;font:800 16px/1.45 Heebo,system-ui,sans-serif}
.j32-u .rf{font:900 13px/1.3 Heebo,system-ui,sans-serif;color:#FFE6A0}.j32-u .ct{margin-top:4px;font:800 12px/1.3 Heebo,system-ui,sans-serif;opacity:.85}.j32-u .ex{margin:4px 0 0;font:700 12px/1.35 Heebo,system-ui,sans-serif;opacity:.8}
.j32-u .bt{display:flex;gap:10px;margin-top:10px}.j32-u .bt button{flex:1;min-height:52px;border-radius:16px;font:900 18px/1 Heebo,system-ui,sans-serif;cursor:pointer;touch-action:manipulation}
.j32-u .bt .op{border:0;background:radial-gradient(circle at 40% 30%,#FFE6A0,#E2B65A 70%,#9A6F1E);color:#2A1804;box-shadow:0 4px 0 #6A4614}.j32-u .bt .go{border:2px solid rgba(255,236,190,.55);background:#4A3418;color:#FFF6DA}
.j32-u button:active{transform:scale(.96)}.j32-u small{display:block;margin-top:4px;font:600 10px/1.3 Heebo,system-ui,sans-serif;opacity:.55}
@keyframes j32in{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.j32-u{animation:none}}`;
const css = (doc) => {
  if (doc.getElementById('j32-css')) return;
  const el = doc.createElement('style');
  el.id = 'j32-css';
  el.textContent = CSS;
  doc.head.appendChild(el);
};
const actOf = (id) => ACT30[id] || { he: id, icon: '•' };
const tz32 = () => {
  try {
    return where29().tz;
  } catch (e) {
    return undefined;
  }
};
// ── the tabs' pages ──
function rolesTab(save, o) {
  return `<div class="p23-bk">${bookHTML23(save, { practice: o.practice || null, can: o.can, note31: !o.practice && o.note31, bare: true })}</div>`;
}
/** the list of pages (or today's) as tiles — or one page open */
function mishnaTab(save, o) {
  const c = count32(save),
    gs = groups32(save, o.today || null),
    flat = gs.flatMap((g) => g.pages.map((p) => ({ ...p, act: g.id, d: g.d, old: g.old }))),
    i = o.page ? flat.findIndex((p) => p.key === o.page && (!o.act || p.act === o.act)) : -1;
  if (i >= 0) {
    const p = flat[i],
      A = actOf(p.act),
      inAct = flat.filter((x) => x.act === p.act),
      j = inAct.findIndex((x) => x.key === p.key),   // (the page's place in its act: "2/3" — the flat list repeats a line two acts share)
      met = p.old ? 'נכנס ליומן מהבקרים שלפני היומן' : p.d ? `נכנס ליומן ב${A.he}, ביום ${p.d}` : `נכנס ליומן ב${A.he}`;
    return `<div class="pg" data-key="${esc(p.key)}"><div class="nv"><button type="button" data-j32="list">› ${o.today ? 'המקורות של היום' : 'כל המשניות'}</button><span class="ac">${esc(A.icon)} ${esc(A.he)}</span><span class="ix">${j + 1}/${inAct.length}</span></div>
      ${p.lead ? `<div class="ld">${esc(p.lead)}:</div>` : ''}<blockquote>״${esc(p.quote)}״</blockquote>${p.gloss ? `<div class="gl">${esc(p.gloss)}</div>` : ''}
      <div class="rf">${esc(p.ref)}<span class="tt">טיוטה</span></div>${p.note ? `<div class="nt">${esc(p.note)}</div>` : ''}<div class="mt">${esc(met)}</div>
      <div class="pn"><button type="button" data-j32="prev"${i > 0 ? '' : ' disabled'}>› הקודם</button><button type="button" data-j32="next"${i < flat.length - 1 ? '' : ' disabled'}>הבא ‹</button></div></div>`;
  }
  const tile = (g, p) => `<button type="button" class="t${p.isNew ? ' nw' : ''}" data-j32p="${esc(p.key)}" data-j32a="${esc(g.id)}" aria-label="${esc(`${p.ref} — ${p.quote}`)}"><b>${esc(p.ref)}</b><span>${esc(p.quote)}</span>${p.isNew ? '<em>חדש</em>' : ''}</button>`;
  return `<div class="ct"><b>📜 ${c.n} מתוך ${c.m} משניות</b>${c.fresh ? `<em>${c.fresh} חדשות</em>` : ''}<small>${c.n < c.m ? 'עוד משניות מחכות בבקרים הבאים — כל עבודה חדשה מוסיפה עמודים' : 'כל המשניות שבמשחק עד כה — ביומן שלך'}</small></div>
    ${o.today ? `<div class="td"><span>📜 המקורות של היום${o.dayN ? ` — יום ${o.dayN | 0}` : ''}</span><button type="button" data-j32="all">כל המשניות ‹</button></div>` : ''}
    ${gs.map((g) => `<h3>${esc(g.icon)} ${esc(g.he)}</h3><div class="g">${g.pages.map((p) => tile(g, p)).join('')}</div>`).join('')}
    ${gs.length ? '' : `<p class="emp">${o.today ? 'היום עוד לא נכנסו משניות ליומן' : 'כאן ייכנסו המשניות — כל עבודה שתעשו בבוקר מוסיפה עמוד, עם המקור שלו'}</p>`}
    <small class="dr">המשניות במשחק — טיוטה: ציטוטים קצרים, כל אחד עם מקומו</small>`;
}
function morningsTab(save) {
  const j = jr32(save),
    log = j.log.filter((e) => e && typeof e === 'object'),
    n = served30(save),
    older = Math.max(0, n - log.filter((e) => e.s).length),
    tz = tz32(),
    chip = ([id, r]) => {
      const A = actOf(id);
      return `<i>${esc(A.icon)} ${esc(A.he)}${r ? `<b class="${esc(r)}">${RATE30.icon[r] || ''} ${esc(RATE30.he[r] || '')}</b>` : ''}</i>`;
    };
  return `<div class="ct"><b>🌅 ${esc(servedHe30(n) || 'עוד לא שימשת בוקר')}</b><small>כל בוקר שתשמשו נרשם כאן — התאריך, התפקידים והדירוג</small></div>
    ${log.map((e) => `<div class="mo"><div class="mh"><b>יום ${e.d | 0}</b><span>${esc(realDate32(e.t, tz))}</span><span class="hb">${esc(e.h || '')}</span></div><div class="mr">${(Array.isArray(e.r) ? e.r : []).map(chip).join('')}</div></div>`).join('')}
    ${older ? `<small class="old">ועוד ${older === 1 ? 'בוקר אחד' : `${older} בקרים`} מלפני היומן</small>` : ''}${!log.length && !older ? '<p class="emp">כאן יירשם כל בוקר שתשמשו</p>' : ''}
    <small class="dr">התאריך העברי — לפי השקיעה במקום הטלפון · טיוטה</small>`;
}
function badgesTab(save) {
  const cl = save.badges33 && typeof save.badges33 === 'object' ? save.badges33 : {},
    bd = BADGES33.filter((b) => cl[b.id]).length;
  return `<div class="ct"><b>🏅 ${bd}/${BADGES33.length} אותות</b><small>מה שעשיתם בעזרה נרשם; את הפרוטות גובים בלילה, בבית המוקד (המחשה: לוח המתגים)</small></div>
    <div class="bg">${BADGES33.map((b) => `<div class="b${cl[b.id] ? ' on' : ''}"><i>${cl[b.id] ? '✅' : '📜'}</i><span><b>${esc(b.text)}</b><small>${cl[b.id] ? 'שלכם' : `+${b.pay | 0} פרוטות — נרשם בעזרה, נגבה בלילה בבית המוקד`}</small></span></div>`).join('')}</div><small class="dr">טיוטה</small>`;
}
const TAB = { roles: rolesTab, mishna: mishnaTab, mornings: morningsTab, badges: badgesTab };   // (a hook's page joins here when its tab is turned on)
/** the sheet's markup: its header (the tabs that are on, the "חדש" count on משניות, ✕) and the tab's page */
export function journalHTML32(save, o = {}) {
  const tabs = tabsOn32().filter((t) => TAB[t.id]),
    tab = tabs.some((t) => t.id === o.tab) ? o.tab : tabs[0].id,
    c = count32(save);
  return `<div class="c" role="dialog" aria-label="יומן הכהן"><div class="hd"><h2><i aria-hidden="true">📖</i><span>יומן הכהן</span></h2><div class="tb" role="tablist">${tabs
    .map((t) => `<button type="button" role="tab" data-j32t="${t.id}" aria-selected="${t.id === tab}"${t.id === tab ? ' class="on"' : ''}>${t.icon} ${esc(t.he)}${t.id === 'mishna' && c.fresh ? `<em aria-label="חדשות">${c.fresh}</em>` : ''}</button>`)
    .join('')}</div><button type="button" class="j32x" data-j32="close" aria-label="סגור">✕</button></div><div class="bd" data-tab="${tab}">${TAB[tab](save, o)}</div></div>`;
}
/** the sheet over everything (the lobby, the day's summary, the unlock card); one at a time */
export function openJournal32(o = {}) {
  const doc = o.doc || (typeof document < 'u' ? document : null),
    save = o.save;
  if (!doc || !save || typeof save !== 'object') return { close() {}, el: null, show() {} };
  css(doc);
  css23(doc);
  try {
    doc.querySelectorAll('.j32').forEach((x) => (x.__j32 ? x.__j32.close(true) : x.remove()));
  } catch (e) {}
  jr32(save);
  const st = { tab: o.page ? 'mishna' : o.tab || 'roles', page: o.page || null, act: o.act || null, today: Array.isArray(o.today) ? o.today.slice() : null, top: 0 },
    el = doc.createElement('div'),
    snd = (n) => {
      try {
        o.sfx && o.sfx.play && o.sfx.play(n);
      } catch (e) {}
    },
    persist = () => {
      try {
        o.persist && o.persist();
      } catch (e) {}
    };
  el.className = 'j32';
  let shut = false;
  function render() {
    const bd0 = el.querySelector('.bd'),
      keep = bd0 && !st.page ? bd0.scrollTop : 0;
    if (st.page && seen32(save, st.page)) persist();   // (a page opened: no longer "חדש")
    el.innerHTML = journalHTML32(save, { ...o, tab: st.tab, page: st.page, act: st.act, today: st.today });
    const bd = el.querySelector('.bd');
    if (bd) bd.scrollTop = st.page ? 0 : st.top || keep || 0;
    try {
      globalThis.__BOOK31 =
        st.tab === 'roles'
          ? { el, close: () => close(), practice: (id) => { const b = el.querySelector(`[data-p31="${id}"]`); if (b) b.click(); return !!b; } }   // (the autoplayer, as build 31's book)
          : null;
    } catch (e) {}
  }
  function close(quiet) {
    if (shut) return;
    shut = true;
    el.remove();
    try {
      if (globalThis.__J32 === api) delete globalThis.__J32;
      if (globalThis.__BOOK31 && globalThis.__BOOK31.el === el) globalThis.__BOOK31 = null;
    } catch (e) {}
    if (!quiet && o.onClose) o.onClose();
  }
  function show(tab, page = null, act = null) {
    if (shut) return false;
    if (tab) st.tab = tab;
    st.page = page;
    st.act = act;
    render();
    return true;
  }
  el.addEventListener('pointerdown', (ev) => ev.stopPropagation());
  el.addEventListener('click', (ev) => {
    ev.stopPropagation();
    const b = ev.target && ev.target.closest ? ev.target.closest('button') : null;
    if (!b || b.disabled || shut) return;
    const d = b.dataset;
    if (d.p31) {   // ── the roles tab's "לתרגל" (from the lobby only): the sheet closes, the run begins (shift/index.js's runPractice) ──
      if (!o.practice) return;
      snd('ui');
      close(true);
      try {
        o.practice(d.p31);
      } catch (e) {
        console.warn('[j32] practice', e && e.message);
      }
      return;
    }
    snd('ui');
    if (d.j32t) return void ((st.tab = d.j32t), (st.page = null), (st.top = 0), render());
    if (d.j32p) {
      const bd = el.querySelector('.bd');
      st.top = bd ? bd.scrollTop : 0;
      return void ((st.page = d.j32p), (st.act = d.j32a || null), render());
    }
    if (d.j32 === 'close') return close();
    if (d.j32 === 'list') return void ((st.page = null), render());
    if (d.j32 === 'all') return void ((st.today = null), (st.page = null), (st.top = 0), render());
    if (d.j32 === 'prev' || d.j32 === 'next') {
      const flat = groups32(save, st.today).flatMap((g) => g.pages.map((p) => [p.key, g.id])),
        i = flat.findIndex(([k, a]) => k === st.page && (!st.act || a === st.act)),
        n = i + (d.j32 === 'next' ? 1 : -1);
      if (flat[n]) [st.page, st.act] = flat[n];
      return void render();
    }
  });
  el.__j32 = { close };
  render();
  doc.body.appendChild(el);
  const api = {
    el,
    close,
    show,
    state: () => ({ tab: st.tab, page: st.page, act: st.act, today: st.today, open: !shut, text: el.textContent }),
  };
  try {
    globalThis.__J32 = api;
  } catch (e) {}
  return api;
}

// ── the unlock moment ──
/** the card: "עמוד חדש ביומן: ‹התפקיד›" (or, the first morning ever, "היומן שלך נפתח" and its first page), the role's main source
 *  line, the count, "לפתוח ביומן" and "המשך" */
export function unlockHTML32(o = {}) {
  const A = actOf(o.id),
    p = mainPage32(o.id),
    c = o.save ? count32(o.save) : null;
  return `<div class="c" role="dialog" aria-label="עמוד חדש ביומן">${o.hello ? '<div class="hl">📖 היומן שלך נפתח</div>' : ''}
    <h2>${o.hello ? 'עמוד ראשון' : 'עמוד חדש ביומן'}: ${esc(A.icon)} ${esc(A.he)}</h2>
    ${p ? `<blockquote>״${esc(p.quote)}״</blockquote><div class="rf">${esc(p.ref)} · טיוטה</div>` : ''}
    ${c ? `<div class="ct">📜 ${c.n} מתוך ${c.m} משניות ביומן שלך</div>` : ''}
    <p class="ex">${o.hello ? 'כל עבודה שתעשו נרשמת ביומן הכהן — וכל תפקיד חדש שיעלה לכם בפיס מוסיף עמוד עם המשנה שלו' : 'הפעם הראשונה שהפיס נתן לך את התפקיד הזה — המשנה שלו ביומן'}</p>
    <div class="bt"><button type="button" class="op" data-j32u="open">📖 לפתוח ביומן</button><button type="button" class="go" data-j32u="go">המשך</button></div><small>טיוטה · המחשה</small></div>`;
}
export function createUnlock32(o = {}) {
  const E = o.E,
    doc = o.doc || (typeof document < 'u' ? document : null),
    stat = { cards: 0, opens: 0, conts: 0, last: null, ids: [] };
  if (!doc || !E || !E.on17 || !E.j32card) return { destroy() {}, state: () => stat };
  css(doc);
  const snd = (n, a) => {
      try {
        o.sfx && o.sfx.play && o.sfx.play(n, a);
      } catch (e) {}
    },
    saveOf = () => {
      try {
        return E.book31 ? E.book31() : null;
      } catch (e) {
        return null;
      }
    };
  let card = null,
    jr = null,
    gone = false;
  function done() {
    if (card) {
      card.remove();
      card = null;
    }
    try {
      E.j32done();
    } catch (e) {}
  }
  function show(ev) {
    if (card || gone) return;
    stat.cards++;
    stat.last = { id: ev.id, hello: !!ev.hello };
    stat.ids.push(ev.id);
    card = doc.createElement('div');
    card.className = 'j32-u';
    card.innerHTML = unlockHTML32({ id: ev.id, hello: ev.hello, save: saveOf() });
    card.addEventListener('pointerdown', (e) => e.stopPropagation());
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const b = e.target && e.target.closest ? e.target.closest('[data-j32u]') : null;
      if (!b || !card) return;
      snd('ui');
      if (b.dataset.j32u === 'go') {
        stat.conts++;
        return done();
      }
      // "לפתוח ביומן": the role's page; the day waits until the journal closes (read-only: no practice mid-day)
      stat.opens++;
      const id = ev.id,
        p = mainPage32(id);
      card.remove();
      card = null;
      jr = openJournal32({ doc, save: saveOf(), tab: 'mishna', page: p ? p.key : null, act: id, note31: true, sfx: o.sfx, persist: () => E.persist32 && E.persist32(),
        onClose: () => {
          jr = null;
          try {
            E.j32done();
          } catch (err) {}
        },
      });
    });
    doc.body.appendChild(card);
    snd('lyre');
  }
  const off = E.on17((ev) => {
      if (ev.type === 'j32new') show(ev);
    }),
    api = {
      destroy() {
        gone = true;
        try {
          off();
        } catch (e) {}
        if (card) card.remove();
        card = null;
        if (jr) jr.close(true);
        jr = null;
        try {
          if (globalThis.__J32U === api) delete globalThis.__J32U;
        } catch (e) {}
      },
      state: () => ({ ...stat, ids: stat.ids.slice(), card: !!card, journal: !!jr, text: card ? card.textContent : '' }),
      cont: () => {
        const b = card && card.querySelector('[data-j32u="go"]');
        if (b) b.click();
        return !!b;
      },
      open: () => {
        const b = card && card.querySelector('[data-j32u="open"]');
        if (b) b.click();
        return !!b;
      },
    };
  try {
    globalThis.__J32U = api;
  } catch (e) {}
  return api;
}
export const J32UI = Object.freeze({ z: 63, zCard: 60, cardS: J32.cardS });
