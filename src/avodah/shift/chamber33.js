/* ── fable32 (build 33) ── chamber33.js — "הטלה המבוקר" on the screen (lamb33.js keeps its data; time-gating-hooks-he.md hook 1):
 *   hereDoor33(save, dn)    — the "מכאן — המקדש עכשיו" card's door to לשכת הטלאים (active; לשכת העצים stays "בקרוב")
 *   stockHTML33(save, dn)   — the chamber's stock: his lambs with their tags and their days to ready ("מוכן", "מוכן מחר", "בעוד 2 ימים" —
 *                             never hours), the court's that fill to six ("של הלשכה"); Thursday and Friday "יש די טלאים לשבת" (a fact)
 *   endHTML33(o)            — the chamber's end card: תמים → its tag, "נכנס ללשכה · מוכן בעוד 4 ימים"; בעל מום → it does not enter, the
 *                             blemish and its source, "מחר יש טלה אחר"; today's done → the stock and "הטלה הבא — מחר"; the rating (rate30)
 *   createChamber33({ E, doc, sfx, save(), dn, onBack, onJournal }) → { destroy(), state(), back(), journal() }  (the chamber's run: its
 *                             tag in the top bar, the day's meters off, the end card on "ch33end" — or at once when today's is done)
 *   upHTML33(o) · createTl33({ E, doc, sfx }) — the morning's card ("tl33new"): "הטלה שבדקת ביום שני עולה היום לתמיד", the tag, the
 *                             source; "המשך" (E.tl33done) — the day waits under it, nothing is lost by "המשך"
 *   lambsTab33(save, dn)    — the journal's tab "הטלאים שבדקתי": each lamb — inspected (the real and the Hebrew date), ready, offered (by
 *                             him on his morning, or by the chamber's kohanim on its day) or "בלשכה"; the sources' page
 * Every word a draft (טיוטה + source) or המחשה; never a Divine Name; RTL; every button ≥ 44 px; no red; no countdown, no clock. ── /fable32 ── */
import { L33, SRC33, ILL33, SHABBAT33, lb33, stock33, canInspect33, readyDay33, readyHe33, weekdayHe33, hisDayHe33, dateHe33, hebDay33, whenHe33, shabbat33 } from './lamb33.js';
import { RATE30 } from './rate30.js';
import { BLEM25 } from './day33.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const col = (c) => L33.tags[((c | 0) % L33.tags.length + L33.tags.length) % L33.tags.length];
const tagHe = (c) => L33.tagHe[((c | 0) % L33.tagHe.length + L33.tagHe.length) % L33.tagHe.length];
const dot = (c) => `<i class="t33" style="background:${col(c)}" aria-hidden="true"></i>`;
const q33 = (S) => `"${esc(S.quote)}" — ${esc(S.ref)} · טיוטה`;
// (the existing inspection's source for a blemish — pen25's SAY.blem)
const BLEM_SRC = '"כל מום משלשה ושבעים מום המנויין בבהמה פוסלין אותה מן הקרבן" — רמב״ם, איסורי מזבח ב, י · טיוטה';
const CSS = `body.ch33-on .f17-fire,body.ch33-on .f17-tam,body.ch33-on .f17-bar,body.ch33-on .p25-w{display:none!important}
.ch33-tag{flex:none;min-height:44px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:2px 12px;border-radius:14px;border:2px solid #C8923A;background:rgba(28,20,10,.82);color:#FFE6A0;font:900 14px/1.05 Heebo,system-ui,sans-serif;pointer-events:none;white-space:nowrap;direction:rtl}
.ch33-tag small{font:700 9px/1 Heebo,system-ui,sans-serif;color:#FFF6DA;opacity:.75}.ch33-tag.fx{position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);right:calc(env(safe-area-inset-right,0px) + 12px);z-index:31}
.ch33{position:fixed;top:0;bottom:0;left:0;z-index:61;display:flex;align-items:center;padding:6px 0 6px calc(env(safe-area-inset-left,0px) + 8px);box-sizing:border-box;direction:rtl;font-family:Heebo,system-ui,sans-serif;color:#FFF6DA;pointer-events:none}
.ch33 .c{pointer-events:auto;width:min(380px,calc(100vw - 280px));min-width:300px;max-height:100%;overflow:auto;box-sizing:border-box;padding:8px 14px 8px;border-radius:18px;background:linear-gradient(rgba(58,42,22,.95),rgba(33,23,11,.95));border:2px solid #C8923A;text-align:center;box-shadow:0 10px 40px #0009;overscroll-behavior:contain}
body.ch33-card .tw-btn,body.ch33-card .tw-zone,body.ch33-card .tw-pad,body.ch33-card .f31-hot,body.ch33-card .sh-hint{display:none!important}
.ch33 h2{margin:0;display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;font:900 17px/1.2 Heebo,system-ui,sans-serif;color:#FFE6A0}
.ch33 .rt{display:inline-block;padding:1px 12px;border-radius:12px;font:900 16px/1.3 Heebo,system-ui,sans-serif}
.ch33 .rt.mehudar{background:#FFD66E;color:#2A1804;box-shadow:0 0 14px rgba(255,214,110,.6)}.ch33 .rt.kasher{background:#F2E6C8;color:#2A1804}.ch33 .rt.tikkun{background:#D8CDB8;color:#3A3328}
.ch33 .ou{display:flex;align-items:center;justify-content:center;gap:6px;margin:3px 0;font:900 15px/1.3 Heebo,system-ui,sans-serif}.ch33 .ou.no{color:#E6D9BE}
.ch33 .bl{font:800 13px/1.3 Heebo,system-ui,sans-serif;color:#FFE6A0}.ch33 .bl small,.ch33 .sh small,.ch33 .sk small{font:700 10px/1.3 Heebo,system-ui,sans-serif;opacity:.75}
.ch33 .sr{margin:3px 0 2px;padding:3px 10px;border-radius:12px;background:#1C140AD9;border:1.5px solid #8A6A3A;font:700 11px/1.35 Heebo,system-ui,sans-serif;text-align:right}
.ch33 .nx{margin:4px 0 0;font:900 14px/1.3 Heebo,system-ui,sans-serif;color:#FFE6A0}
.ch33 .sk{margin:3px 0 0;font:800 12px/1.3 Heebo,system-ui,sans-serif;text-align:right}
.ch33 .st,.j32 .st33{display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-start}
.ch33 .ch,.j32 .ch33c{display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:10px;background:#FFF6DA14;border:1px solid #8A6A3A;font:700 12px/1.6 Heebo,system-ui,sans-serif;white-space:nowrap}
.ch33 .ch b{color:#FFE6A0;font-weight:900}.ch33 .ch.rd b{color:#FFD66E}.ch33 .ch.ct{opacity:.85;border-style:dashed}
i.t33,.j32 .mr i.t33{display:inline-block;flex:none;width:13px;height:13px;padding:0;border-radius:50%;box-shadow:0 0 0 2px rgba(20,14,6,.85),0 0 0 3px rgba(255,236,190,.45);font-style:normal}
.ch33 .sh{margin:4px 0 4px;padding:3px 10px;border-radius:12px;background:#3A2A12;border:1px solid #E2B65A66;font:800 13px/1.35 Heebo,system-ui,sans-serif;text-align:right}
.ch33 .bt{position:sticky;bottom:-8px;display:flex;gap:8px;margin:6px -14px -8px;padding:6px 14px 8px;background:linear-gradient(rgba(33,23,11,.0),rgba(33,23,11,.97) 30%)}.ch33 .bt button{flex:1;min-height:48px;min-width:44px;border-radius:16px;font:900 18px/1 Heebo,system-ui,sans-serif;cursor:pointer;touch-action:manipulation}
.ch33 .bt .bk{border:0;background:radial-gradient(circle at 40% 30%,#FFE6A0,#E2B65A 70%,#9A6F1E);color:#2A1804;box-shadow:0 4px 0 #6A4614}.ch33 .bt .jr{border:2px solid rgba(255,236,190,.55);background:#4A3418;color:#FFF6DA;font-size:15px}
.ch33 button:active{transform:scale(.96)}.ch33 .c>small{display:block;margin-top:4px;font:600 10px/1.3 Heebo,system-ui,sans-serif;opacity:.6}
.tl33{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:#0E0A05A6;direction:rtl;font-family:Heebo,system-ui,sans-serif;color:#FFF6DA;pointer-events:auto}
.tl33 .c{width:min(480px,calc(100vw - 24px));max-height:calc(100% - 12px);overflow:auto;box-sizing:border-box;padding:10px 16px;border-radius:20px;background:radial-gradient(120% 90% at 50% 0%,#5A4220,#21170B 70%);border:2px solid #E2B65A;text-align:center;box-shadow:0 0 30px #FFD66E33,0 10px 40px #0009}
.tl33 .hl{display:inline-flex;align-items:center;gap:6px;margin:0 0 4px;padding:2px 12px;border-radius:12px;background:#FFD66E;color:#2A1804;font:900 14px/1.4 Heebo,system-ui,sans-serif}
.tl33 h2{margin:2px 0 4px;font:900 19px/1.25 Heebo,system-ui,sans-serif}
.tl33 blockquote{margin:4px 0;padding:6px 12px;border-radius:12px;background:#FFF6DA14;font:800 16px/1.45 Heebo,system-ui,sans-serif}.tl33 .rf{font:900 13px/1.3 Heebo,system-ui,sans-serif;color:#FFE6A0}
.tl33 .ex{margin:4px 0 0;font:700 12px/1.35 Heebo,system-ui,sans-serif;opacity:.85}
.tl33 .bt{display:flex;gap:10px;margin-top:10px}.tl33 .bt button{flex:1;min-height:52px;border-radius:16px;border:0;background:radial-gradient(circle at 40% 30%,#FFE6A0,#E2B65A 70%,#9A6F1E);color:#2A1804;box-shadow:0 4px 0 #6A4614;font:900 18px/1 Heebo,system-ui,sans-serif;cursor:pointer;touch-action:manipulation}
.tl33 small{display:block;margin-top:4px;font:600 10px/1.3 Heebo,system-ui,sans-serif;opacity:.55}
.j32 .l33{display:flex;flex-direction:column;gap:2px}.j32 .l33 .mh i.t33{align-self:center}.j32 .l33 .mr i{font-style:normal}.j32 .l33 .mr i.up{color:#FFD66E}.j32 .q33{margin:6px 0;padding:6px 12px;border-radius:12px;border-inline-start:4px solid #FFD66E;background:#FFF6DA14;text-align:right;font:800 15px/1.5 Heebo,system-ui,sans-serif}.j32 .q33 b{display:block;font:900 12px/1.3 Heebo,system-ui,sans-serif;color:#FFE6A0}
@media (max-width:560px){.ch33 .c{width:calc(100vw - 16px);min-width:0}}`;
export const css33 = (doc) => {
  if (!doc || !doc.getElementById || doc.getElementById('ch33-css')) return;
  const el = doc.createElement('style');
  el.id = 'ch33-css';
  el.textContent = CSS;
  doc.head.appendChild(el);
};
export const CSS33 = CSS;

// ── the "מכאן" card's door ──
/** לשכת הטלאים — open (today's lamb, or the next tomorrow; his lambs in it) */
export function hereDoor33(save, dn) {
  let can = true,
    mine = 0;
  try {
    can = canInspect33(save, dn);
    mine = stock33(save, dn).mine.length;
  } catch (e) {}
  const sub = `${can ? 'טלה אחד לבדוק היום' : 'הטלה הבא — מחר'}${mine ? ` · ${mine === 1 ? 'טלה אחד שלך' : `${mine} טלאים שלך`} בלשכה` : ''}`;
  return `<button class="lb-door lk-ch" type="button" data-lb="ch33"><i>🐑</i><span><b>לשכת הטלאים</b><small>${esc(sub)}</small></span></button>`;
}

// ── the stock ──
/** the chamber's lambs: his (tag, the day he inspected it, its days to ready), the court's to six; Thursday–Friday's line */
export function stockHTML33(save, dn, o = {}) {
  const S = stock33(save, dn),
    mine = S.mine
      .map((L) => `<span class="ch${L.readyIn ? '' : ' rd'}" data-l33="${L.i | 0}">${dot(L.c)}${esc(hisDayHe33(L.d)) /* ── fable32 (build 34) ── (his inspection's day: a Saturday is מוצאי שבת) ── /fable32 ── */}<b>${esc(readyHe33(L.readyIn))}</b></span>`)
      .join(''),
    court = S.court ? `<span class="ch ct" data-l33="court">🐑 ${S.court === 1 ? 'טלה אחד' : `${S.court} טלאים`} של הלשכה</span>` : '';
  return `${shabbat33(dn) && !o.noShabbat ? `<div class="sh" data-ch33="shabbat">${esc(SHABBAT33)} <small>— "${esc(SRC33.shabbat.quote)}" — ${esc(SRC33.shabbat.ref)} · טיוטה</small></div>` : ''}
    <div class="st">${mine}${court}</div>
    <div class="sk">בלשכה ${S.total} טלאים <small>"${esc(SRC33.six.quote)}" — ${esc(SRC33.six.ref)} · טיוטה</small></div>`;   // (Thursday and Friday's line first: it is about the stock under it)
}
/** the chamber's card: o = { out: 'tamim' | 'blem' | 'done', rating, blem: { c, r }, fa (approved with a blemish), coins, lamb, save, dn } */
export function endHTML33(o = {}) {
  const r = RATE30.ids.includes(o.rating) ? o.rating : null,
    save = o.save,
    dn = o.dn | 0,
    L = o.lamb || null;
  let head = '';
  if (o.out === 'tamim') {
    head = `<div class="ou" data-ch33="tamim">${L ? dot(L.c) : ''}תמים — נכנס ללשכה · ${esc(readyHe33(L ? readyDay33(L) - dn : L33.ready).replace(/^בעוד/, 'מוכן בעוד'))}</div>
      ${L ? `<div class="bl">הסימן ה${esc(tagHe(L.c))} — שלך</div>` : ''}
      <div class="sr">${esc(q33(SRC33.visit))}</div>
      <div class="nx">הטלה הבא — מחר${o.coins ? ` · 🪙 +${o.coins | 0}` : ''}</div>`;
  } else if (o.out === 'blem') {
    const b = o.blem && BLEM25.cats[o.blem.c] ? o.blem : null;
    head = `<div class="ou no" data-ch33="blem">${o.fa ? 'היה בו מום' : 'בעל מום'} — לא נכנס ללשכה</div>
      ${b ? `<div class="bl">${esc(BLEM25.cats[b.c].he)} · ${esc(BLEM25.regs[b.r].he)} <small>(המחשה: סוגי המומים ומקומם במשחק)</small></div>` : ''}
      <div class="sr">${esc(BLEM_SRC)}</div>
      <div class="nx">מחר יש טלה אחר${o.coins ? ` · 🪙 +${o.coins | 0}` : ''}</div>`;
  } else {
    head = `<div class="ou" data-ch33="done">את הטלה של היום כבר בדקת</div><div class="nx">הטלה הבא — מחר</div>`;
  }
  return `<div class="c" role="dialog" aria-label="לשכת הטלאים"><h2>🐑 לשכת הטלאים${r ? ` <span class="rt ${r}">${RATE30.icon[r]} ${RATE30.he[r]}</span>` : ''}</h2>
    ${head}
    ${save ? stockHTML33(save, dn) : ''}
    <small>"${esc(SRC33.place.quote)}" — ${esc(SRC33.place.ref)} · טיוטה · המחשה: ${esc(ILL33[0])}; ${esc(ILL33[1])}</small>
    <div class="bt"><button type="button" class="jr" data-ch33="journal">📖 ביומן</button><button type="button" class="bk" data-ch33="back">חזרה</button></div></div>`;   // (the buttons stay in sight when the card scrolls)
}
/** the chamber's run on the screen: its tag beside the act's line, the day's meters off, the card */
export function createChamber33(o = {}) {
  const E = o.E,
    doc = o.doc || (typeof document < 'u' ? document : null),
    stat = { cards: 0, back: 0, journal: 0, last: null };
  if (!doc || !E || !E.on17 || !E.ch33 || !E.ch33()) return { destroy() {}, state: () => stat };
  css33(doc);
  const snd = (n, a) => {
      try {
        o.sfx && o.sfx.play && o.sfx.play(n, a);
      } catch (e) {}
    },
    saveOf = () => {
      try {
        return (o.save && o.save()) || null;
      } catch (e) {
        return null;
      }
    };
  doc.body.classList.add('ch33-on');
  const tag = doc.createElement('div'),
    top = doc.querySelector ? doc.querySelector('.f17-top') : null;
  tag.className = top ? 'ch33-tag' : 'ch33-tag fx';
  tag.setAttribute('role', 'note');
  tag.innerHTML = '<b>🐑 לשכת הטלאים</b><small>בית המוקד · המחשה</small>';
  (top || doc.body).appendChild(tag);
  let card = null,
    gone = false,
    used = false;
  function show(ev) {
    if (card || gone) return;
    stat.cards++;
    stat.last = { out: ev.out, rating: ev.rating || null };
    const save = saveOf(),
      b = save ? lb33(save) : null,
      L = ev.out === 'tamim' && b ? b.list.filter((x) => x.d === (o.dn | 0)).slice(-1)[0] || null : null,
      C = E.ch33() || {};
    card = doc.createElement('div');
    card.className = 'ch33';
    card.innerHTML = endHTML33({ out: ev.out, rating: ev.rating, blem: ev.blem, fa: ev.out === 'blem' && E.p25r && E.p25r() ? E.p25r().falseApprovals | 0 : 0, coins: ev.coins, lamb: L, save, dn: o.dn | 0 });
    void C;
    card.addEventListener('pointerdown', (e) => e.stopPropagation());
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const t = e.target && e.target.closest ? e.target.closest('[data-ch33]') : null;
      if (!t || used) return;
      const k = t.dataset.ch33;
      if (k !== 'back' && k !== 'journal') return;
      used = true;
      stat[k]++;
      snd('ui');
      try {
        (k === 'back' ? o.onBack : o.onJournal || o.onBack)();
      } catch (err) {
        console.warn('[ch33]', err && err.message);
      }
    });
    doc.body.appendChild(card);
    doc.body.classList.add('ch33-card');   // (the day's buttons and stick off under it)
    snd(ev.out === 'tamim' ? 'bell25' : 'ui');
  }
  const off = E.on17((ev) => {
    if (ev.type === 'ch33end') show(ev);
  });
  // (today's lamb already inspected: the stock at once — no lamb comes)
  if (E.ch33().done) setTimeout(() => show({ out: 'done' }), 900);
  const api = {
    destroy() {
      gone = true;
      try {
        off();
      } catch (e) {}
      try {
        tag.remove();
      } catch (e) {}
      if (card) {
        try {
          card.remove();
        } catch (e) {}
        card = null;
      }
      doc.body.classList.remove('ch33-on', 'ch33-card');
      try {
        if (globalThis.__CH33 === api) delete globalThis.__CH33;
      } catch (e) {}
    },
    state: () => ({ ...stat, card: !!card, text: card ? card.textContent : '', tag: tag.isConnected !== false }),
    back: () => {
      const x = card && card.querySelector('[data-ch33="back"]');
      if (x) x.click();
      return !!x;
    },
    journal: () => {
      const x = card && card.querySelector('[data-ch33="journal"]');
      if (x) x.click();
      return !!x;
    },
  };
  try {
    globalThis.__CH33 = api;
  } catch (e) {}
  return api;
}

// ── the morning's card ──
/** "הטלה שבדקת ביום שני עולה היום לתמיד" — o = { line, c, role } */
export function upHTML33(o = {}) {
  const lamb = o.role === 'lamb';
  return `<div class="c" role="dialog" aria-label="הטלה שבדקת"><div class="hl">${dot(o.c)} הטלה המבוקר</div>
    <h2>${esc(o.line || 'הטלה שבדקת עולה היום לתמיד')}</h2>
    <blockquote>״${esc(SRC33.visit.quote)}״</blockquote><div class="rf">${esc(SRC33.visit.ref)} · טיוטה</div>
    <p class="ex">${lamb ? `הסימן ה${esc(tagHe(o.c))} שלו — הנה הוא בפתח הדיר. "${esc(SRC33.torch.quote)}" (${esc(SRC33.torch.ref)} · טיוטה)` : `הסימן ה${esc(tagHe(o.c))} שלו — "צאו והביאו טלה מלשכת הטלאים" (תמיד ג, ג · טיוטה)`}</p>
    <div class="bt"><button type="button" data-tl33="go">המשך</button></div><small>טיוטה · המחשה: הסימן — סימן המשחק; ביומן: הטלאים שבדקתי</small></div>`;
}
export function createTl33(o = {}) {
  const E = o.E,
    doc = o.doc || (typeof document < 'u' ? document : null),
    stat = { cards: 0, conts: 0, last: null };
  if (!doc || !E || !E.on17 || !E.tl33done) return { destroy() {}, state: () => stat };
  css33(doc);
  let card = null,
    gone = false;
  const snd = (n, a) => {
    try {
      o.sfx && o.sfx.play && o.sfx.play(n, a);
    } catch (e) {}
  };
  function done() {
    if (card) {
      card.remove();
      card = null;
    }
    try {
      E.tl33done();
    } catch (e) {}
  }
  function show(ev) {
    if (card || gone) return;
    stat.cards++;
    stat.last = { i: ev.i, c: ev.c, role: ev.role, line: ev.line };
    card = doc.createElement('div');
    card.className = 'tl33';
    card.innerHTML = upHTML33(ev);
    card.addEventListener('pointerdown', (e) => e.stopPropagation());
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const b = e.target && e.target.closest ? e.target.closest('[data-tl33]') : null;
      if (!b || !card) return;
      snd('ui');
      stat.conts++;
      done();
    });
    doc.body.appendChild(card);
    snd('lyre');
  }
  const off = E.on17((ev) => {
      if (ev.type === 'tl33new') show(ev);
    }),
    api = {
      destroy() {
        gone = true;
        try {
          off();
        } catch (e) {}
        if (card) card.remove();
        card = null;
        try {
          if (globalThis.__TL33 === api) delete globalThis.__TL33;
        } catch (e) {}
      },
      state: () => ({ ...stat, card: !!card, text: card ? card.textContent : '' }),
      cont: () => {
        const b = card && card.querySelector('[data-tl33="go"]');
        if (b) b.click();
        return !!b;
      },
    };
  try {
    globalThis.__TL33 = api;
  } catch (e) {}
  return api;
}

// ── the journal's tab ──
const when2 = (dn) => `${weekdayHe33(dn)}, ${dateHe33(dn)}`;
const his2 = (dn) => `${hisDayHe33(dn)}, ${dateHe33(dn)}`;   // ── fable32 (build 34) ── (what he did — his inspection, his morning: a Saturday is מוצאי שבת; the chamber's kohanim's offering on Shabbat stays שבת) ── /fable32 ──
/** "הטלאים שבדקתי": each lamb (newest first) — inspected, ready, offered (or in the chamber); the blemished ones counted; the sources */
export function lambsTab33(save, dn) {
  const b = lb33(save) || { list: [], blem: [] };
  stock33(save, dn);   // (the chamber's kohanim's offerings settled: their lambs say so)
  const list = b.list.slice().sort((x, y) => y.d - x.d || y.i - x.i),
    up = list.filter((L) => L.at).length,
    nB = b.blem.length,
    row = (L) => {
      const rd = readyDay33(L),
        offered = L.at ? (L.by === 'me' ? `עלה לתמיד: ${his2(L.at)}${L.oh ? ` · ${L.oh}` : ''}${L.gd ? ` — בבוקר שלך (יום ${L.gd | 0})` : ''}` : `עלה לתמיד: ${when2(L.at)} · ${hebDay33(L.at)} — בידי כהני הלשכה`) : `בלשכה · ${readyHe33(rd - (dn | 0))}`;
      return `<div class="mo l33" data-l33="${L.i | 0}"><div class="mh">${dot(L.c)}<b>הטלה ה${esc(tagHe(L.c))}</b><span>נבדק: ${esc(his2(L.d))}${L.h ? ` · <span class="hb">${esc(L.h)}</span>` : ''}</span></div>
        <div class="mr"><i>מוכן: ${esc(when2(rd))}</i><i class="${L.at ? 'up' : ''}">${esc(offered)}</i></div></div>`;
    };
  return `<div class="ct"><b>🐑 הטלאים שבדקתי</b><small>${list.length ? `${list.length === 1 ? 'טלה אחד נכנס ללשכה' : `${list.length} טלאים נכנסו ללשכה`} · ${up} עלו לתמיד` : 'לשכת הטלאים — במסך הפתיחה, "🕍 מכאן — המקדש עכשיו": טלה אחד ביום'}</small></div>
    ${list.map(row).join('')}
    ${nB ? `<small class="old">ועוד ${nB === 1 ? 'טלה אחד בעל מום' : `${nB} טלאים בעלי מום`} שבדקת — לא נכנסו ללשכה</small>` : ''}
    ${!list.length && !nB ? '<p class="emp">כאן יירשם כל טלה שתבדקו: מתי נבדק, מתי מוכן, ומתי עלה לתמיד</p>' : ''}
    <h3>📜 המקורות</h3>
    ${[SRC33.visit, SRC33.six, SRC33.shabbat, SRC33.more, SRC33.place].map((S) => `<div class="q33">״${esc(S.quote)}״<b>${esc(S.ref)} <span class="tt">טיוטה</span></b></div>`).join('')}
    <small class="dr">המחשה: ${ILL33.map(esc).join(' · ')} · התאריך העברי — לפי השקיעה; הימים נספרים גם בשבת</small>`;
}
