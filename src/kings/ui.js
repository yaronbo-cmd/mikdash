/* ─────────────────────────────────────────────────────────────────────────────
 * kings/ui.js — openCourt(ctx): the sea chart, the courts, the deal, the voyage, the arrival beat, letters & seals.
 *
 * ctx = { root, G, now: () => ms, apply(delta) → false to refuse, onEvent(name, data), demo, sfx, needs, rest,
 *         partner?, arrivals?, top?, target?(resKey) → Element }   → Promise<{ deals, unloaded }> on close.
 * Events: kingsOpen · kingsCourt {partner} · deal {king, what, cost, eta, res} · kingsArrive {partner, res} ·
 *         delivery {from, res} · kingsRel {partner, lvl} · kingsSeal {id} · kingsLetter {id} · kingsItem {id} ·
 *         kingsEvent {kind} · kingsClose {deals, unloaded}
 * Sounds (FUN's kit, guarded): court · seal · deal · sail · bell · cart · arrive · page · coinsIn {n}.
 * ──────────────────────────────────────────────────────────────────────────── */
import { CSS } from './css.js';
import { PARTNERS, PIDX, OFFERS, OIDX, LETTERS, SEALS, LEVELS, RES, GATES, PERKS } from './data.js';
import * as L from './logic.js';
import { PLACES } from './geo.js';
import { PORTRAITS, sealSVG, ICON } from './art.js';
import { buildChart, bindChart, clock } from './map.js';

const pips = (lvl) => '<span class="kpips" aria-hidden="true">' + [1, 2, 3, 4].map((i) => `<i${i <= lvl ? ' class="on"' : ''}></i>`).join('') + '</span>';
const dur = (ms) => {
  const s = Math.round(ms / 1000); if (s < 60) return s + ' שנ׳';
  const m = Math.round(ms / 60000); if (m < 60) return m + ' דק׳';
  const h = Math.floor(m / 60), r = m % 60; return h + ' שע׳' + (r ? ' ' + r + ' דק׳' : '');
};
const goods = (g) => Object.entries(g).map(([k, v]) => `<span>${ICON[k] || ''}${v} ${RES[k] || k}</span>`).join(' ');
const FLAGS = { treaty: 'אחרי ההסכם עם הקיסר' };
const lockTxt = (n) => !n ? '' : n.flag ? FLAGS[n.flag] || '' : n.lvl ? 'נפתח ברמת ' + n.label : n.gate ? 'נפתח ' + GATES[n.gate] : '';
const PH = { sea: 'בים', cart: 'בעגלות', road: 'בדרך', court: 'בחצר המלך', letter: 'האיגרת בדרך', arrived: 'הגיע' };
const ITEMS = { doors: 'דלתות הנחושת מוכנות לשער ניקנור.', lamp: 'הנברשת מוכנה לפתח ההיכל.' };

const P = (id) => PARTNERS[PIDX[id]];
const hdr = (t, sub) => `<header class="ktop"><button class="kbtn kx" data-a="back" aria-label="חזרה למפה">›</button><h2>${t}<small>${sub}</small></h2><button class="kbtn kx" data-a="close" aria-label="סגור">✕</button></header>`;
let cssDoc = null;
function injectCSS(doc) {
  if (cssDoc === doc && doc.getElementById('kcss')) return;
  const s = doc.createElement('style'); s.id = 'kcss'; s.textContent = CSS; doc.head.appendChild(s); cssDoc = doc;
}

export function openCourt(ctx = {}) {
  return new Promise((resolve) => {
    const doc = (ctx.root && ctx.root.ownerDocument) || (typeof document !== 'undefined' ? document : null);
    if (!doc || !ctx.G) { resolve({ deals: 0, unloaded: 0 }); return; }
    const win = doc.defaultView || globalThis;
    const G = ctx.G; const k = L.ensure(G);
    const now = typeof ctx.now === 'function' ? ctx.now : () => Date.now();
    const o = () => ctx;   // logic reads apply, rest, needs, demo
    const resting = () => { try { return typeof ctx.rest === 'function' ? !!ctx.rest(now()) : !!ctx.rest; } catch (e) { return false; } };
    const emit = (n, d) => { try { if (ctx.onEvent) ctx.onEvent(n, d || {}); } catch (e) { /* the host's problem */ } };
    const sfx = (n, x) => { const s = ctx.sfx; if (!s) return; try { if (typeof s.play === 'function') s.play(n, x); else if (typeof s === 'function') s(n, x); } catch (e) { /* audio is best-effort */ } };
    injectCSS(doc);

    const root = doc.createElement('div');
    root.className = 'kg'; root.dir = 'rtl'; root.lang = 'he';
    const th = doc.documentElement.getAttribute('data-theme');   // BUILD's rule: data-theme wins, else the system
    try { if (th === 'dark' || (th !== 'light' && win.matchMedia('(prefers-color-scheme: dark)').matches)) root.classList.add('kdk'); } catch (e) { /* light */ }
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'מלכי האומות');
    let top = ctx.top;
    if (top == null) { try { const bar = doc.querySelector('.gm-top'); if (bar) top = Math.round(bar.getBoundingClientRect().bottom) + 4; } catch (e) { top = 0; } }   // keep BUILD's meter in view
    if (top > 0 && top < 200) root.style.setProperty('--ktop', top + 'px');
    const target = typeof ctx.target === 'function' ? ctx.target : (r) => doc.querySelector(`.gm-chip[data-r="${r}"]`);
    root.innerHTML = '<header class="ktop"><h2>מלכי האומות<small>מסחר ומתנות למקדש · טיוטה</small></h2>'
      + '<button class="kbtn kx" data-a="close" aria-label="סגור">✕</button></header>'
      + `<div class="kbody" data-z="main"><div class="kmapwrap">${buildChart()}</div><div data-z="banners"></div><ul class="klist" data-z="list"></ul></div>`
      + '<section class="ksheet" data-z="sheet"></section><div data-z="modal"></div>';
    (ctx.root || doc.body).appendChild(root);
    const $ = (z) => root.querySelector(`[data-z="${z}"]`);
    const sheet = $('sheet'), modalHost = $('modal');
    const chart = bindChart(root.querySelector('.kchart'));

    let deals = 0, unloaded = 0, closed = false, cur = null, view = 'map', sigList = '', sigCourt = '';
    const legSeen = {};
    for (const v of k.voy) legSeen[v.id] = L.phase(v, now()).kind;
    const seenArr = new Set(k.voy.filter((v) => now() >= v.end).map((v) => v.id));

    /* ── the map view: banners, partner rows, pins ── */
    function lineOf(pv) {
      if (pv.status === 'arrived') return pv.gift ? 'המתנה הגיעה לירושלים' : 'הגיע לירושלים · מחכה לפריקה';
      if (pv.voyage) {
        const p = P(pv.id); let txt = PH[pv.voyage.kind] || 'בדרך';
        if (pv.voyage.kind === 'cart' && p.port) txt += ' מ' + PLACES[p.port].n;
        return `${txt} · עוד <span data-end="${pv.voyage.end}">${clock(pv.voyage.left)}</span>`;
      }
      if (pv.status === 'locked') return pv.why && pv.why.gate ? 'נפתח ' + GATES[pv.why.gate] : (pv.quest ? 'הדלתות הגיעו' : 'כל המתנות התקבלו');
      return pv.taste ? 'רפסודת ניסיון: מגיעה תוך 3 דקות' : pv.gift ? 'אפשר לכתוב איגרת' : 'מוכן לעסקה';
    }
    function renderMap(force) {
      const t = now(); const ps = L.partners(G, t, o());
      const sig = JSON.stringify(ps.map((p) => [p.status, p.voyage && p.voyage.id, p.voyage && p.voyage.kind, p.rel.lvl, p.seal, p.now])) + resting() + L.newsOf(G).length;
      if (!force && sig === sigList) { tickTimes(t); return; }
      sigList = sig;
      $('list').innerHTML = ps.map((pv) => {
        const p = P(pv.id); const arr = pv.status === 'arrived';
        return `<li><button class="krow${arr || pv.now || pv.taste ? ' khot' : ''}" data-a="${arr ? 'arrival' : 'court'}" data-p="${pv.id}"${arr ? ` data-v="${pv.voyage.id}"` : ''}>`
          + `<span class="kseal">${sealSVG(p.seal, pv.seal, PIDX[pv.id] + 1)}</span>`
          + `<span class="kmid"><b>${p.n}</b><small>${lineOf(pv)}${pv.now && !arr ? ' <span class="kchip know">נחוץ עכשיו</span>' : ''}</small></span>`
          + `${arr ? (resting() ? '<span class="kchip">במוצאי שבת</span>' : '<span class="kbtn kpri">פרוק</span>') : pips(pv.rel.lvl)}</button></li>`;
      }).join('');
      for (const pv of ps) {
        const pin = root.querySelector(`.kpin[data-p="${pv.id}"]`); if (!pin) continue;
        pin.classList.toggle('kbusy', !!pv.voyage && pv.status !== 'arrived');
        pin.classList.toggle('karrp', pv.status === 'arrived');
        pin.classList.toggle('klock', pv.status === 'locked');
      }
      let b = '';
      if (resting()) b += '<div class="kbanner"><span class="kmid"><b>שבת שלום.</b> עסקים ופריקה ממתינים למוצאי שבת. הספינות ממשיכות בדרכן, ושום דבר לא הולך לאיבוד.</span></div>';
      const nw = L.newsOf(G)[0];
      if (nw) {
        const txt = nw.k === 'storm' ? 'סערה בים! מה קרה לדלתות של ניקנור?' : nw.k === 'agrippa' ? 'מרקוס אגריפס בא לבקר בירושלים.' : 'חדשות מהדרך.';
        b += `<div class="kbanner"><span class="kmid"><b>חדשות מהדרך:</b> ${txt}</span><button class="kbtn kpri" data-a="news">קרא</button></div>`;
      }
      $('banners').innerHTML = b;
    }
    function tickTimes(t) {
      for (const el of root.querySelectorAll('[data-end]')) { const txt = clock(+el.dataset.end - t); if (el.textContent !== txt) el.textContent = txt; }
      for (const el of root.querySelectorAll('[data-bar]')) { const [a, b] = el.dataset.bar.split(',').map(Number); el.style.width = Math.min(100, Math.max(2, ((t - a) / (b - a)) * 100)).toFixed(1) + '%'; }
    }

    /* ── a court ── */
    function court(pid) {
      cur = pid; view = 'court'; const p = P(pid);
      sheet.innerHTML = hdr(p.n, PLACES[p.place].n) + '<div class="kbody" data-z="court"></div>';
      sigCourt = ''; renderCourt(); sheet.classList.add('kopen');
      sfx('court'); emit('kingsCourt', { partner: pid });
    }
    function voyCard(pv) {
      if (!pv.voyage) return '';
      const v = k.voy.find((x) => x.id === pv.voyage.id); if (!v) return '';
      const t = now(); const ph = L.phase(v, t); const off = OFFERS[OIDX[v.o]] || { n: 'משלוח' };
      if (ph.kind === 'arrived') {
        return `<div class="kvoy"><b>${off.n} · הגיע לירושלים</b><p class="knote">${goods(v.gives)}</p>`
          + (resting() ? '<button class="kbtn" disabled>ממתין למוצאי שבת</button>' : `<button class="kbtn kpri" data-a="arrival" data-v="${v.id}">פרוק למחסן</button>`) + '</div>';
      }
      return `<div class="kvoy"><b>${off.n} · ${PH[ph.kind] || 'בדרך'}</b><div class="kbar"><i data-bar="${v.t0},${v.end}" style="width:${Math.max(2, ((t - v.t0) / (v.end - v.t0)) * 100).toFixed(1)}%"></i></div>`
        + `<div>יגיע לירושלים בעוד <b data-end="${v.end}">${clock(v.end - t)}</b></div></div>`;
    }
    function offerCard(of) {
      const why = { busy: 'משלחת אחת בכל פעם: הקודמת עוד בדרך.', lack: of.lack ? `חסרים ${of.lack.silver} כסף.` : '', locked: lockTxt(of.need), rest: 'בשבת לא נושאים ונותנים.', done: '✓ התקבל' }[of.why] || '';
      return `<div class="koffer${of.ok ? '' : ' koff'}"><h4>${of.n}${of.now && of.ok ? '<span class="kchip know">נחוץ עכשיו</span>' : ''}${of.illus ? '<span class="kchip killus">⚑ המחשה</span>' : ''}</h4>`
        + `<div class="kterms"><span>${goods(of.gives)}</span><span class="kt">${of.gift ? 'מתנה, בלי מחיר' : ICON.silver + of.cost + ' כסף'}</span><span class="kt">${ICON.time}${dur(of.ms)}</span></div>`
        + `<p>${of.d}</p>` + (of.ok ? `<button class="kbtn kpri" data-a="offer" data-o="${of.id}">${of.gift ? 'כתוב איגרת' : 'לחוזה'}</button>` : `<div class="kwhy">${why}</div>`) + '</div>';
    }
    function renderCourt(force) {
      if (!cur) return;
      const t = now(); const p = P(cur);
      const pv = L.partners(G, t, o()).find((x) => x.id === cur); const offs = L.offers(G, cur, t, o());
      const sig = JSON.stringify([pv.status, pv.voyage && pv.voyage.kind, pv.rel.pts, offs.map((x) => x.why), Object.keys(k.letters).length]) + resting();
      if (!force && sig === sigCourt) { tickTimes(t); return; }
      sigCourt = sig;
      const rel = pv.rel; const nx = LEVELS[rel.lvl + 1];
      const perks = Object.entries(PERKS).filter(([l]) => +l > rel.lvl).map(([l, s]) => `ברמת ${LEVELS[l].n}: ${s}`)[0] || '';
      const rank = (x) => (x.ok ? (x.now ? 0 : 1) : x.why === 'done' ? 3 : 2);   // what you can do now (and need) first (FUN P1)
      const sorted = offs.map((x, i) => [x, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map((a) => a[0]);
      root.querySelector('[data-z="court"]').innerHTML = `<div class="khead"><div class="kportrait"><svg viewBox="0 0 120 140" role="img" aria-label="דיוקן מסוגנן, לא דמות אמיתית">${PORTRAITS[cur]}</svg></div>`
        + `<div class="kwho"><h3>${p.who}</h3><p>${p.n}${p.illus ? ' · <span class="kchip killus">⚑ המחשה</span>' : ''}</p>`
        + `<div class="krel">${rel.label}${pips(rel.lvl)}</div><p>${nx ? `עוד ${nx.at - rel.pts} ${nx.at - rel.pts === 1 ? 'משלוח' : 'משלוחים'} לרמת ${nx.n}` : 'הרמה הגבוהה ביותר'}${perks ? ' · ' + perks : ''}</p></div></div>`
        + `<div class="ksay">${p.lines.map((l) => `<p>${l}</p>`).join('')}<span class="kchip kdraft">המחשה · טיוטה</span></div>`
        + voyCard(pv)
        + `<div class="ksec">${p.gift ? 'איגרות ומתנות' : 'הצעות'}</div>${sorted.map(offerCard).join('')}`
        + `<div class="ksec">מן המקורות <span class="kchip kdraft">טיוטה</span></div><div class="kfacts">`
        + p.facts.map((f) => `<div class="kfact">${f.q ? `<span class="kq">״${f.q}״</span>` : ''}${f.d || ''}<span class="kref">${f.ref}${f.illus ? ' · ⚑' : ''}</span></div>`).join('') + '</div>'
        + (() => { const ls = LETTERS.filter((x) => x.p === cur && k.letters[x.id]); return ls.length ? '<div class="ksec">איגרות</div>' + ls.map(letterHTML).join('') : ''; })();
    }

    /* ── modals: the contract, the arrival, a letter ── */
    function modal(html) { modalHost.innerHTML = `<div class="kmodal">${html}</div>`; }
    function closeModal() { modalHost.innerHTML = ''; }
    function contract(oid) {
      const t = now(); const of = L.offers(G, cur, t, o()).find((x) => x.id === oid); if (!of || !of.ok) return;
      const p = P(cur); const off = OFFERS[OIDX[oid]];
      const legs = off.id === 'rome_embassy' ? 'ים יפו ← רומא ← ים יפו ← ירושלים' : p.port ? `${off.p === 'rome' ? 'קפריסין' : PLACES[p.place].n} ← ${p.port === 'jaffa' ? 'ים יפו' : 'נמל עכו'} ← ירושלים` : p.gift ? 'ירושלים ← חדייב ← ירושלים' : 'פטרה ← ירושלים';
      let notes = '';
      if (of.gift) notes += '<p class="knote">מתנה למקדש אינה מקח וממכר: אין מחיר. כותבים להם על הבנייה, והם שולחים מה שלבם נדב.</p>';
      if (of.storm) notes += '<p class="knote">כך מסופר: בדרך חזרה תקום סערה בים. הדלתות יגיעו בשלום, בלי עיכוב ובלי הפסד (בבלי יומא לח, א).</p>';
      if (of.illus) notes += '<p class="knote">⚑ המחשה: אין מקור לעסקה כזאת בימי הבית. הבחירה שלנו, לאישור הבעלים.</p>';
      modal(`<div class="kpaper" role="dialog" aria-label="חוזה"><h3>${of.gift ? 'איגרת אל ' + p.n : 'חוזה עם ' + p.n}</h3><dl class="kdl">`
        + (of.gift ? '' : `<dt>אתה נותן</dt><dd>${ICON.silver}${of.cost} כסף</dd>`) + `<dt>${of.gift ? 'הם שולחים' : 'אתה מקבל'}</dt><dd>${goods(of.gives)}</dd>`
        + `<dt>הדרך</dt><dd>${legs}</dd><dt>זמן</dt><dd>${dur(of.ms)}</dd></dl>${notes}`
        + `<div data-z="stamp"></div><div class="kacts"><button class="kbtn kpri" data-a="sign" data-o="${oid}">${of.gift ? 'חתום ושלח את האיגרת' : 'חתום ושלח'}</button><button class="kbtn" data-a="cancel">ביטול</button></div></div>`);
    }
    function sign(oid, btn) {
      const r = L.accept(G, oid, now(), o());
      const p = P(cur);
      if (!r.ok) { const n = modalHost.querySelector('.knote:last-of-type') || modalHost.querySelector('.kdl'); if (n) n.insertAdjacentHTML('afterend', `<p class="knote" style="color:var(--kr)">${r.why === 'lack' ? 'אין מספיק כסף.' : r.why === 'rest' ? 'בשבת לא נושאים ונותנים.' : 'אי אפשר עכשיו.'}</p>`); return; }
      deals++;
      for (const b of modalHost.querySelectorAll('button')) b.disabled = true;
      const st = modalHost.querySelector('[data-z="stamp"]'); if (st) st.innerHTML = `<div class="kstamp kpress">${sealSVG(p.seal, true, PIDX[cur] + 1)}</div>`;
      sfx('seal'); win.setTimeout(() => sfx('deal'), 260); emit('deal', { king: cur, what: oid, cost: r.cost, eta: r.eta, res: { ...r.voyage.gives } });
      const route = (r.voyage.legs[0] || [])[1];
      win.setTimeout(() => {
        if (closed) return; closeModal(); back(); sfx('sail');
        const el = route && root.querySelector('#kr-' + route); if (el) { el.classList.add('khl'); win.setTimeout(() => el.classList.remove('khl'), 2600); }
      }, 850);
    }
    function arrival(vid) {
      const v = k.voy.find((x) => x.id === vid); if (!v || now() < v.end) return;
      const p = P(v.p); seenArr.add(vid);
      const title = v.o === 'nik_doors' ? 'דלתות ניקנור הגיעו לירושלים!' : p.gift ? 'מתנה מחדייב הגיעה לירושלים' : 'המשלוח הגיע לירושלים';
      const crates = Object.entries(v.gives).map(([r, n]) => Array.from({ length: Math.max(1, Math.min(6, Math.round(n / 40))) }, () => `<span class="kcrate" data-r="${r}">${ICON[r] || ''}</span>`).join('')).join('');
      modal(`<div class="kpaper" role="dialog" aria-label="${title}"><h3>${title}</h3><p class="knote" style="text-align:center">${p.n}</p><div class="kcrates">${crates}</div>`
        + `<div class="kgain">${Object.entries(v.gives).map(([r, n]) => `<span>${ICON[r] || ''}+${n} ${RES[r] || r}</span>`).join('')}</div><div data-z="res"></div>`
        + `<div class="kacts" data-z="acts">${resting() ? '<button class="kbtn" disabled>ממתין למוצאי שבת</button>' : `<button class="kbtn kpri" data-a="unload" data-v="${vid}">פרוק למחסן</button>`}<button class="kbtn" data-a="cancel">אחר כך</button></div></div>`);
      sfx('arrive'); emit('kingsArrive', { partner: v.p, res: { ...v.gives } });
    }
    function fly() {
      const crates = [...modalHost.querySelectorAll('.kcrate')];
      const W = win.innerWidth || 390;
      crates.forEach((c, i) => {
        const r = c.getBoundingClientRect(); let tx = W / 2, ty = 8;
        try { const el = target(c.dataset.r); if (el) { const q = el.getBoundingClientRect(); tx = q.left + q.width / 2; ty = q.top + q.height / 2; } } catch (e) { /* default target */ }
        const f = c.cloneNode(true); f.classList.add('kfly'); f.style.left = r.left + 'px'; f.style.top = r.top + 'px'; doc.body.appendChild(f);
        c.style.visibility = 'hidden';
        win.setTimeout(() => { f.style.transform = `translate(${tx - r.left - 15}px, ${ty - r.top - 15}px) scale(.6)`; f.style.opacity = '0.15'; }, 30 + i * 70);
        win.setTimeout(() => f.remove(), 950 + i * 70);
      });
    }
    function unload(vid) {
      const r = L.unload(G, vid, now(), o());
      if (!r.ok) { const a = modalHost.querySelector('[data-z="res"]'); if (a) a.innerHTML = `<p class="knote">${r.why === 'rest' ? 'ממתין למוצאי שבת.' : 'אי אפשר לפרוק עכשיו.'}</p>`; return; }
      unloaded++; fly();
      const n = Object.values(r.res).reduce((s, x) => s + x, 0);
      sfx('coinsIn', { n: Math.min(12, Math.ceil(n / 20)) }); emit('delivery', { from: r.partner, res: { ...r.res } });
      const p = P(r.partner);
      let h = `<div class="krel" style="text-align:center">${p.short}: ${r.rel.label}${pips(r.rel.lvl)}</div>`;
      if (r.rel.up) {
        emit('kingsRel', { partner: r.partner, lvl: r.rel.lvl });
        const opened = OFFERS.filter((x) => x.p === r.partner && x.lvl === r.rel.lvl).map((x) => x.n);
        h += `<div class="kup">רמה חדשה: ${r.rel.label}!${opened.length ? ' נפתחה הצעה: ' + opened.join(', ') : ''}${PERKS[r.rel.lvl] ? ' · ' + PERKS[r.rel.lvl] : ''}</div>`;
      }
      if (r.item) { emit('kingsItem', { id: r.item }); h += `<div class="kup">${ITEMS[r.item] || ''}</div>`; }
      if (r.flag === 'treaty') h += '<div class="kup">ההסכם חתום: מעכשיו נחושת קפריסין במחיר ההובלה בלבד.</div>';
      if (r.event) { emit('kingsEvent', { kind: r.event }); h += '<div class="kup">ובירושלים: מרקוס אגריפס, ידידו של הקיסר, בא לבקר.</div>'; }
      if (r.seal) { emit('kingsSeal', { id: r.seal }); win.setTimeout(() => sfx('seal'), 500); h += `<div class="kstamp kpress">${sealSVG(p.seal, true, PIDX[r.partner] + 1)}</div><p class="knote" style="text-align:center">חותם חדש באוסף: ${SEALS[r.seal].n}</p>`; }
      for (const id of r.letters) emit('kingsLetter', { id });
      const lets = r.letters.map((id) => LETTERS.find((x) => x.id === id)).filter(Boolean);
      $('res').innerHTML = h;
      $('acts').innerHTML = lets.map((x) => `<button class="kbtn" data-a="read" data-l="${x.id}">איגרת ${x.from}</button>`).join('') + '<button class="kbtn kpri" data-a="next">המשך</button>';
    }
    const letterHTML = (x) => `<div class="kletter"><b>${x.from}</b>${x.t}<span class="kref">${x.fact ? x.ref : 'המחשה' + (x.ref ? ' · ' + x.ref : '')} · טיוטה</span></div>`;
    function read(id) {
      const x = LETTERS.find((l) => l.id === id); if (!x) return;
      sfx('page');
      const keep = modalHost.innerHTML;
      modal(`<div class="kpaper">${letterHTML(x)}<div class="kacts"><button class="kbtn kpri" data-a="${keep.includes('data-z="res"') ? 'restore' : 'cancel'}">סגור</button></div></div>`);
      restoreHTML = keep;
    }
    let restoreHTML = '';
    /* ── (wave 7, FUN) the first deal as a small story: the first time the court opens (no deal yet, not #demo, not Shabbat) —
       a messenger from Jaffa and the merchant's two lines (המחשה), then what Ezra 3:7 tells (verified, content/kings.json),
       then the taste raft's contract over Tyre's court: sign it and the raft sails. Skippable; told once (k.story). ── */
    function story(step) {
      const p = P('tyre'), f = p.facts[0], skip = '<button class="kbtn" data-a="storyskip">דלג</button>';
      k.story = 1;
      if (step === 0) {
        modal(`<div class="kpaper kstory" role="dialog" aria-label="שליח מן הנמל"><span class="kchip kdraft">המחשה · טיוטה</span><h3>שליח עולה מיפו</h3>`
          + `<p>ספינה של סוחרי צור וצידון עגנה בים יפו. השליח מביא דברים מראש הסוחרים:</p><div class="kstory-who"><div class="kportrait"><svg viewBox="0 0 120 140" role="img" aria-label="דיוקן מסוגנן, לא דמות אמיתית">${PORTRAITS.tyre}</svg></div>`
          + `<div class="ksay">${p.lines.map((l, i) => `<p style="animation-delay:${(0.4 + i * 1.1).toFixed(1)}s">${l}</p>`).join('')}</div></div>`
          + `<div class="kacts"><button class="kbtn kpri" data-a="story" data-s="1">מה הם מציעים?</button>${skip}</div></div>`);
        sfx('bell'); emit('kingsStory', { step: 0 }); return;
      }
      if (step === 1) {
        modal(`<div class="kpaper kstory" role="dialog" aria-label="מן המקורות"><span class="kchip kdraft">טיוטה</span><h3>כך עשו בימי שיבת ציון</h3>`
          + `<span class="kq">״${f.q}״</span><p>${f.d}</p><span class="kref">${f.ref}</span>`
          + `<div class="kacts"><button class="kbtn kpri" data-a="story" data-s="2">נשלח רפסודה ראשונה</button>${skip}</div></div>`);
        sfx('page'); emit('kingsStory', { step: 1 }); return;
      }
      closeModal(); court('tyre'); contract('tyre_taste'); emit('kingsStory', { step: 2 });
    }
    function back() { cur = null; view = 'map'; sheet.classList.remove('kopen'); renderMap(true); chart.update(k.voy, now()); }
    function nextArrival() {
      closeModal();
      const v = k.voy.find((x) => now() >= x.end);
      if (v) arrival(v.id); else if (view === 'court') renderCourt(true); else renderMap(true);
    }

    /* ── input ── */
    function onClick(e) {
      const el = e.target.closest('[data-a], .kpin'); if (!el || !root.contains(el)) return;
      const a = el.dataset.a || 'court';
      if (a === 'close') close();
      else if (a === 'court') court(el.dataset.p);
      else if (a === 'back') back();
      else if (a === 'offer') contract(el.dataset.o);
      else if (a === 'sign') sign(el.dataset.o, el);
      else if (a === 'cancel') closeModal();
      else if (a === 'story') story(+el.dataset.s || 0);
      else if (a === 'storyskip') { k.story = 1; closeModal(); }
      else if (a === 'arrival') arrival(el.dataset.v);
      else if (a === 'unload') unload(el.dataset.v);
      else if (a === 'next') nextArrival();
      else if (a === 'read') read(el.dataset.l);
      else if (a === 'restore') { modalHost.innerHTML = restoreHTML; }
      else if (a === 'news') {
        const nw = L.newsOf(G)[0]; L.seen(G);
        const id = nw && (nw.k === 'storm' ? 'storm' : nw.k === 'agrippa' ? 'agrippa' : null);
        renderMap(true); if (id) read(id);
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') { if (modalHost.innerHTML) closeModal(); else if (view !== 'map') back(); else close(); }
    }
    root.addEventListener('click', onClick);
    doc.addEventListener('keydown', onKey);

    /* ── time: once a second — timers, arrivals, and the chart's vessels (they move in real time: a second is plenty) ── */
    const tick = win.setInterval(() => {
      if (closed) return;
      const t = now(); L.settle(G, t);
      const fresh = k.voy.filter((v) => t >= v.end && !seenArr.has(v.id));
      if (fresh.length) { for (const v of fresh) seenArr.add(v.id); sfx('bell'); }
      for (const v of k.voy) {
        const kd = L.phase(v, t).kind;
        if (legSeen[v.id] && legSeen[v.id] !== kd && kd === 'cart') sfx('cart');   // docked at the port: the carts set out (the row says "בעגלות מיפו")
        legSeen[v.id] = kd;
      }
      if (view === 'map') { renderMap(); chart.update(k.voy, t); } else if (view === 'court') renderCourt();
    }, 1000);

    function close() {
      if (closed) return; closed = true;
      win.clearInterval(tick); doc.removeEventListener('keydown', onKey); root.remove();
      emit('kingsClose', { deals, unloaded }); resolve({ deals, unloaded });
    }

    L.settle(G, now());
    chart.update(k.voy, now());
    renderMap(true);
    emit('kingsOpen', {});
    if (ctx.partner && PIDX[ctx.partner] !== undefined) { court(ctx.partner); if (ctx.offer) contract(ctx.offer); }   // BUILD's chip opens the offer
    if (ctx.arrivals) { const v = k.voy.find((x) => now() >= x.end); if (v) arrival(v.id); }
    else if (!ctx.demo && !ctx.partner && !k.story && !k.voy.length && !Object.keys(k.done || {}).length && !resting()) {
      try { const t = L.offers(G, 'tyre', now(), o()).find((x) => x.id === 'tyre_taste'); if (t && t.ok) story(0); } catch (e) { /* the map, as always */ }
    }
    const x = root.querySelector('[data-a="close"]'); if (x && x.focus) try { x.focus({ preventScroll: true }); } catch (e) { /* old browsers */ }
    if (ctx.demo) {   // #demo: the loop plays itself — Tyre's court, the contract, the seal, the voyage (×60), the arrival, the unload
      [[1400, '.krow[data-p="tyre"]'], [3000, '[data-a="offer"]'], [4400, '[data-a="sign"]'], [9400, '.krow[data-a="arrival"]'], [10800, '[data-a="unload"]'], [12800, '[data-a="next"]']]
        .forEach(([ms, s]) => win.setTimeout(() => { const e = !closed && root.querySelector(s); if (e) e.click(); }, ms));
      win.setTimeout(close, 14500);
    }
  });
}
