/* ── econ14 ── shop.js: אוצר המלאכה v1 (ECON14, wave 14), her five ❤️ (VOTES14): the machines and the tools, האבן שלי, the
 * Levites' instruments, the lamps. "ככחם נתנו לאוצר המלאכה" (עזרא ב, סט): what she buys goes into the building.
 * Pure rules over the save G (G.shop, G.up, G.res.silver) and the sheet's HTML; the host (index.js, econ14) plays them in 3D
 * (SITE14's stages.setOwned / stoneMark) and in the music (music.js instruments).
 * The rules (D2): fixed prices, nothing random, no timers, no sales; a shortfall reads "עוד N" (a goal, not a scold); closed on
 * Shabbat and Yom Tov with nothing lost; the demo is never closed. Building never waits on the shop (the treasurer, state.js). */
import { UPGRADES, PAY } from './content.js';
import { upgrade } from './state.js';
import * as TL from './tools.js';   // ── tools21 ──

const P = (b) => `<svg class="gm-shop-pic" viewBox="0 0 40 40" aria-hidden="true">${b}</svg>`;
const INK = 'fill="none" stroke="#5A3A12" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';
export const PICS = {
  tools: P(`<path d="M8 30 22 16" ${INK}/><rect x="19" y="8" width="14" height="8" rx="2" transform="rotate(45 26 12)" fill="#9AA1AA" stroke="#5A3A12" stroke-width="2"/><path d="M26 32 33 25M30 22l6 6" ${INK}/>`),
  crane: P(`<circle cx="20" cy="20" r="13" ${INK}/><circle cx="20" cy="20" r="3" fill="#5A3A12"/><path d="M20 7v26M7 20h26M11 11l18 18M29 11 11 29" ${INK} stroke-width="1.6"/>`),
  carts: P(`<rect x="6" y="14" width="22" height="10" rx="2" fill="#C9A26A" stroke="#5A3A12" stroke-width="2"/><circle cx="13" cy="28" r="5" ${INK}/><circle cx="24" cy="28" r="5" ${INK}/><path d="M28 18h8" ${INK}/>`),
  mark: P(`<rect x="5" y="9" width="30" height="22" rx="2" fill="#E4D5B1" stroke="#5A3A12" stroke-width="2"/><path d="M12 24c3-8 6 4 9-4s5 2 7-2" fill="none" stroke="#B07A12" stroke-width="2.6" stroke-linecap="round"/>`),
  kinnor: P(`<path d="M11 34V12c0-4 3-6 5-6M29 34V12c0-4-3-6-5-6M9 14h22M10 34h20" ${INK}/><path d="M15 14v20M20 14v20M25 14v20" stroke="#B07A12" stroke-width="1.2"/>`),
  nevel: P(`<path d="M9 34 14 6c6 4 14 14 17 28z" fill="#E8D2A0" stroke="#5A3A12" stroke-width="2.2" stroke-linejoin="round"/><path d="M15 12v22M19 16v18M23 21v13M27 27v7" stroke="#B07A12" stroke-width="1.2"/>`),
  chalil: P(`<path d="M8 32 32 8" stroke="#8A5A22" stroke-width="5" stroke-linecap="round"/><circle cx="16" cy="24" r="1.4" fill="#F5E6C0"/><circle cx="20" cy="20" r="1.4" fill="#F5E6C0"/><circle cx="24" cy="16" r="1.4" fill="#F5E6C0"/>`),
  chatzotzrah: P(`<path d="M6 20h22" stroke="#C9C9CF" stroke-width="3.4" stroke-linecap="round"/><path d="M27 20l8-7v14z" fill="#DADAE0" stroke="#5A5A62" stroke-width="1.6" stroke-linejoin="round"/>`),
  tziltzal: P(`<ellipse cx="14" cy="21" rx="9" ry="4" transform="rotate(-25 14 21)" fill="#E3B94A" stroke="#6A4A12" stroke-width="1.8"/><ellipse cx="26" cy="21" rx="9" ry="4" transform="rotate(25 26 21)" fill="#E3B94A" stroke="#6A4A12" stroke-width="1.8"/>`),
  leaf: P(`<path d="M20 34C8 28 8 12 20 6c12 6 12 22 0 28z" fill="#E7C24A" stroke="#7A5A10" stroke-width="1.8"/><path d="M20 10v22" stroke="#7A5A10" stroke-width="1.4"/>`),
  grape: P(`<circle cx="20" cy="22" r="8" fill="#E7C24A" stroke="#7A5A10" stroke-width="1.8"/><path d="M20 14c0-4 3-7 6-8" fill="none" stroke="#7A5A10" stroke-width="1.6"/>`),
  cluster: P(`${[[16, 12], [24, 12], [12, 19], [20, 19], [28, 19], [16, 26], [24, 26], [20, 33]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.6" fill="#E7C24A" stroke="#7A5A10" stroke-width="1.3"/>`).join('')}`),
  lamp: P(`<path d="M6 25c4-6 22-6 26-1l4-1-4 4c-6 4-20 4-26-2z" fill="#B5673A" stroke="#5A2A12" stroke-width="1.8" stroke-linejoin="round"/><circle cx="17" cy="23" r="2" fill="#5A2A12"/><path d="M35 21c-2-3 0-7 1-9 1 3 3 6-1 9z" fill="#FFC23A"/>`),
};
/** her five, in her vote's order: the machines, the tools, the mark, the instruments, the lamps */
export const SECTIONS = [
  { k: 'machines', n: 'המכונות והכלים' }, { k: 'worktools', n: 'כלי העבודה' }, { k: 'mark', n: 'האבן שלי' }, { k: 'levites', n: 'כלי הלויים' }, { k: 'lamps', n: 'הנרות' },
  { k: 'vine', n: 'נדבה לגפן הזהב' },   // (then the vine's gifts, WAVE14-BRIEF: place.js has landed)
];
export const ITEMS = {
  tools: { sec: 'machines', up: 'tools', n: UPGRADES.tools.n, d: UPGRADES.tools.d },
  crane: { sec: 'machines', up: 'crane', n: UPGRADES.crane.n, d: UPGRADES.crane.d, src: 'המחשה (ויטרוביוס 10.2)' },
  carts: { sec: 'machines', up: 'carts', n: UPGRADES.carts.n, d: UPGRADES.carts.d, src: 'הורדוס הכין אלף עגלות (קדמוניות 15.11.2)' },
  mark: { sec: 'mark', price: 25, n: 'האבן שלי', d: 'צייר סימן, והמנוף יניח את האבן שלך בנדבך הזה', src: 'המחשה', per: 'stage' },
  kinnor: { sec: 'levites', price: 20, max: 9, n: 'כינור' },
  nevel: { sec: 'levites', price: 40, max: 2, n: 'נבל' },
  chalil: { sec: 'levites', price: 30, max: 2, n: 'חליל' },
  chatzotzrah: { sec: 'levites', price: 50, max: 2, n: 'חצוצרה' },
  tziltzal: { sec: 'levites', price: 60, max: 1, n: 'צלצל' },
  lamp: { sec: 'lamps', price: 30, max: 6, n: 'נר חרס', d: 'ליד הבנקר שלך, דולק עם רדת החשכה', src: 'המחשה' },
  // מדות ג, ח: "כל מי שהוא מתנדב עלה, או גרגיר, או אשכול, מביא ותולה בה" — a grape is three leaves' worth, a cluster ten (stages setVine)
  leaf: { sec: 'vine', price: 15, max: 12, n: 'עלה של זהב', d: 'ייתלה על הגפן שעל פתח ההיכל', vine: 1 },
  grape: { sec: 'vine', price: 30, max: 6, n: 'גרגיר של זהב', d: 'ייתלה על הגפן שעל פתח ההיכל', vine: 3 },
  cluster: { sec: 'vine', price: 60, max: 3, n: 'אשכול של זהב', d: 'ייתלה על הגפן שעל פתח ההיכל', vine: 10 },
};
// ── tools21 ── "כלי העבודה": each of his tools in three tiers (tools.js), bought in silver (⚑ 300 · 900) or earned at stages 3 and 7
export const TOOL_KEY = (id) => 'tl_' + id;
for (const id of TL.IDS) PICS[TOOL_KEY(id)] = PICS.tools;
for (const id of TL.IDS) ITEMS[TOOL_KEY(id)] = { sec: 'worktools', tool: id, n: TL.TOOLS[id].n, d: 'כלי טוב יותר: יפה יותר, וכל מכה שווה יותר' };
// ── /tools21 ──
export const LEVITES = ['kinnor', 'nevel', 'chalil', 'chatzotzrah', 'tziltzal'];
export const VINE = { q: 'כל מי שהוא מתנדב עלה, או גרגיר, או אשכול, מביא ותולה בה', ref: 'משנה מדות ג, ח' };
/** "הדוכן שלם": the Mishnah's least for the platform (the counts above are its minimum: Arakhin 2:3, 2:5) */
export const DUCHAN = {
  q: 'אֵין פּוֹחֲתִין מִשְּׁתֵּי חֲצוֹצְרוֹת, וּמוֹסִיפִין עַד לְעוֹלָם. אֵין פּוֹחֲתִין מִתִּשְׁעָה כִנּוֹרוֹת, וּמוֹסִיפִין עַד לְעוֹלָם. וְהַצִּלְצָל לְבָד',
  ref: 'משנה ערכין ב, ה', more: 'ערכין ב, ג: "אין פוחתין משני נבלין ולא מוסיפין על ששה"',
};

const shopOf = (G) => (G.shop && typeof G.shop === 'object' ? G.shop : (G.shop = {}));
export const count = (G, k) => { const s = shopOf(G); if (ITEMS[k] && ITEMS[k].tool) return TL.tierOf(G, ITEMS[k].tool) - 1; return k === 'lamp' ? s.lamps | 0 : ITEMS[k] && ITEMS[k].up ? G.up[ITEMS[k].up] | 0 : ITEMS[k] && ITEMS[k].vine ? ((s.vine || {})[k] | 0) : (s.inst && s.inst[k]) | 0; };
/** the price of the next one, or null when it is full (or the mark already bought at this stage) */
export function priceOf(G, k, site = null) {
  const it = ITEMS[k]; if (!it) return null;
  if (it.tool) return TL.priceOf(G, it.tool);   // ── tools21 ──
  if (it.up) { const U = UPGRADES[it.up], l = G.up[it.up] | 0; return l < U.cost.length ? U.cost[l] : null; }
  if (k === 'mark') return site && !(shopOf(G).marks || {})[site] ? it.price : null;
  return count(G, k) < it.max ? it.price : null;
}
/** can she buy it now? → { ok, price, closed?, lack?, full?, noSite? } (nothing changes) */
export function canBuy(G, k, { rest = false, site = null } = {}) {
  const it = ITEMS[k]; if (!it) return { ok: false };
  if (rest && !G.demo) return { ok: false, closed: true };
  if (locked(G)) return { ok: false, locked: true };
  if (k === 'mark' && !site) return { ok: false, noSite: true };
  const price = priceOf(G, k, site); if (price == null) return { ok: false, full: true };
  const have = Math.floor(G.res.silver || 0);
  return have >= price ? { ok: true, price } : { ok: false, price, lack: price - have };
}
/** buy it: the coins go, the thing is hers. → { ok, k, n (how many now), price, duchan? } (the mark: o.site, o.mark strokes) */
export function buy(G, k, o = {}) {
  const c = canBuy(G, k, o); if (!c.ok) return { ...c, k };
  const it = ITEMS[k], s = shopOf(G);
  if (it.tool) { const r = TL.buy(G, it.tool); if (!r.ok) return { ok: false, k }; }   // ── tools21 ──
  else if (it.up) { const r = upgrade(G, it.up); if (!r.ok) return { ok: false, k }; }
  else {
    G.res.silver = Math.max(0, (G.res.silver || 0) - c.price);
    if (k === 'lamp') s.lamps = (s.lamps | 0) + 1;
    else if (k === 'mark') { s.marks = s.marks || {}; s.marks[o.site] = 1; }
    else if (it.vine) { s.vine = s.vine || {}; s.vine[k] = (s.vine[k] | 0) + 1; if (G.vine && typeof G.vine === 'object') G.vine.leaves = (G.vine.leaves | 0) + it.vine; }
    else { s.inst = s.inst || {}; s.inst[k] = (s.inst[k] | 0) + 1; }
  }
  s.n = (s.n | 0) + 1; s.spent = (s.spent | 0) + c.price;
  if (s.n === 1 && o.now) s.firstAt = o.now;
  const out = { ok: true, k, n: count(G, k), price: c.price };
  if (it.sec === 'levites' && duchan(G) && !s.duchan) { s.duchan = 1; out.duchan = true; }
  return out;
}
/** (PRODUCER14 pb2: her first purchase came from the start money at 3.5 min, before any work) the treasury opens with her first
 *  pay — "ויתנו כסף לחצבים ולחרשים": what she buys, her work bought. The demo is always open. */
export const locked = (G) => !G.demo && !(G.econ && G.econ.paid1);
/** the full platform: every instrument at its least (DUCHAN) */
export const duchan = (G) => LEVITES.every((k) => count(G, k) >= ITEMS[k].max);
/** what the world shows (SITE14's stages.setOwned) */
export const owned = (G) => ({ lamps: count(G, 'lamp'), tools: G.up.tools | 0, machines: G.up.crane | 0, oxen: G.up.carts | 0 });
/** what the music adds (music.js instruments) */
export const instruments = (G) => Object.fromEntries(LEVITES.map((k) => [k, count(G, k)]));
/** the cheapest thing she can buy next (the mentor's "יש לך מספיק" and the purse's dot) */
export function cheapest(G, o = {}) {
  let best = null;
  for (const k of Object.keys(ITEMS)) { if (ITEMS[k].tool) continue; const p = priceOf(G, k, o.site);   // (tools21: a tool is never the mentor's hint)
    if (p != null && (!best || p < best.price)) best = { k, price: p }; }
  return best;
}

/** the sheet: four sections of cards (a picture, the name, a line, one button with the price on a coin) */
export function html(G, { rest = false, site = null, siteN = '', esc = (x) => x, num = (n) => String(n), coin = '' } = {}) {
  const have = Math.floor(G.res.silver || 0);
  let h = `<div class="gm-shop-head"><span class="gm-shop-have">${coin}<b class="gm-num">${num(have)}</b> מטבעות</span><small>"${esc(PAY.shop.q)}" · ${esc(PAY.shop.ref)}</small></div>`;
  if (rest && !G.demo) return h + `<div class="gm-shop-closed"><b>שבת שלום!</b> אוצר המלאכה סגור בשבת ובחג. המטבעות שלך שמורים, ושום דבר לא הולך לאיבוד.</div>`;
  if (locked(G)) h += `<div class="gm-shop-closed">אוצר המלאכה נפתח עם השכר הראשון שלך: בחר עבודה ב"מה נעשה עכשיו?", ושכרך ישולם מיד.</div>`;
  for (const S of SECTIONS) {
    const ks = Object.keys(ITEMS).filter((k) => ITEMS[k].sec === S.k);
    h += `<div class="gm-sec">${esc(S.n)}${S.k === 'levites' ? ` <small class="gm-muted">${duchan(G) ? 'הדוכן שלם!' : 'לדוכן שלם: 9 כינורות, 2 נבלים, 2 חלילים, 2 חצוצרות וצלצל'}</small>` : S.k === 'vine' ? ` <small class="gm-muted">"${esc(VINE.q)}" · ${esc(VINE.ref)}</small>` : ''}</div><div class="gm-shop">`;
    for (const k of ks) {
      const it = ITEMS[k], c = canBuy(G, k, { rest, site }), n = count(G, k), lim = it.tool ? 2 : it.up ? UPGRADES[it.up].cost.length : it.max;
      const tag = it.tool ? `${esc(TL.nameOf(G, it.tool))} · ${TL.XM(TL.multOf(G, it.tool))}` : it.up ? `דרגה ${n}/${lim}` : lim ? `${n}/${lim}` : k === 'mark' && site ? esc(siteN) : '';
      const btn = c.locked ? '<span class="gm-shop-full">אחרי השכר הראשון</span>' : c.full ? `<span class="gm-shop-full">${k === 'mark' ? 'כבר יש לך כאן אבן' : 'יש לך הכול'}</span>`
        : c.noSite ? '<span class="gm-shop-full">כשבונים נדבכים</span>'
          : `<button class="gm-btn gm-buy${c.ok ? ' gm-btn-gold' : ''}" data-a="buy" data-k="${k}" ${c.ok ? '' : 'aria-disabled="true"'} aria-label="${esc(it.n)}: ${num(c.price)} מטבעות">${coin}<span class="gm-num">${num(c.price)}</span>${c.ok ? '' : `<small>עוד ${num(c.lack)}</small>`}</button>`;
      h += `<div class="gm-shop-card" data-k="${k}">${PICS[k] || ''}<b>${esc(it.n)}</b>${tag ? `<small class="gm-shop-tag">${tag}</small>` : ''}${it.d ? `<small>${esc(it.d)}</small>` : ''}${btn}</div>`;
    }
    h += '</div>';
  }
  return h + `<p class="gm-muted gm-shop-note">מחירים קבועים, בלי הגרלות ובלי שעון. ${esc(DUCHAN.ref)} · ${esc(DUCHAN.more)}</p>`;
}
/* ── /econ14 ── */
