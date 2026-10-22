/* ── fable32 (build 31) ── practice31.js — practice any role you have had, from the roles book (hachraot-he.md "עולם ומבנה", the owner,
 * 21.10 23:46: "יום מלא, רצוף, מברקאי ועד שיר הלויים" AND "ספר התפקידים — אימון בכל תפקיד בנוי, לשיא"; build 30's טעון תיקון end invites
 * to it: "אפשר לנסות שוב בספר התפקידים"). The book's "לתרגל" door (pis23's rolesBook23, from the lobby only) opens the role's act directly
 * — day33's o.practice: the same place, the same court round it, the same controls and rating; no tamid clock, no day timer — and here:
 *   canPractice31(save, id, on)  — a door only for a role he has had in a real morning (the lot is the key: a practice run never opens one)
 *   practiceSave31(save)         — the run's own save: the player's, copied, without the saved day (the run writes nothing of the day)
 *   merge31(save, id, rec)       — the run's record of that role into the player's save (its rating, מהודר count, title — and nothing else:
 *                                  no coins, no day, no lot, no mornings served, no tasks, no badges)
 *   endHTML31({ id, rating, rec, was }) — the end card's markup (the rating word, the source line, "עוד פעם" / "חזרה")
 *   createPractice31({ E, doc, sfx, save(), onAgain, onBack }) → { destroy(), state() }   — the "אימון" tag in the top bar (המחשה: the
 *                                  practice is the game's, not the Temple's), the day's meters off (the fire, the tamid's timer, the coins'
 *                                  till, the stations' bar — and the lamb pen's "שעון השחר": no clock in a practice run), the end card on
 *                                  "p31end"
 * Every word a draft (טיוטה) or המחשה; never a Divine Name; RTL; every button ≥ 44 px; no red. */
import { RATE30, SRC30, ACT30, draft30, role30 } from './rate30.js';
import { PRAC31 } from './day33.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
/** the mornings he had a role (a practice run counts apart — pr) */
const had31 = (a) => (a && typeof a === 'object' ? Math.max(0, (a.n | 0) - (a.pr | 0)) : 0);
/** may he practise this role? built (on[id] !== false) and had in a real morning */
export function canPractice31(save, id, on = null) {
  if (!PRAC31.roles.includes(id) || (on && on[id] === false)) return false;
  const r = save && save.roles23 && typeof save.roles23 === 'object' ? save.roles23 : null;
  return had31(r && r[id]) > 0;
}
/** the practice run's save: a copy of the player's without the saved day (so the run can never touch "המשך יום N") */
export function practiceSave31(save) {
  let c = {};
  try {
    c = JSON.parse(JSON.stringify(save || {}));
  } catch (e) {
    c = {};
  }
  delete c.day33state;
  return c;
}
/** the run's record of that role (day33's "p31rec": n, best, last, r30, pr) into the player's own save — that entry only */
export function merge31(save, id, rec) {
  if (!save || typeof save !== 'object' || !PRAC31.roles.includes(id) || !rec || typeof rec !== 'object' || Array.isArray(rec)) return false;
  if (!save.roles23 || typeof save.roles23 !== 'object') save.roles23 = { m: 0, h: [] };
  save.roles23[id] = JSON.parse(JSON.stringify(rec));
  return true;
}
/** the source line as end30 shows it: the quote may take the "…", its reference and "טיוטה" keep their place */
const srcParts = (id) => {
  const S = SRC30[id];
  if (!S || !S.chip) return null;
  const line = draft30(S.chip),
    cut = line.lastIndexOf(' — ');
  return { q: cut > 0 ? line.slice(0, cut) : '', r: cut > 0 ? line.slice(cut) : line };
};
/** the end card: the act, its rating (gold / cream / soft sand — never red), the record and the title (a new title said once), the
 *  source line (a tap: its card), "עוד פעם" and "חזרה"; the practice is המחשה */
export function endHTML31(o = {}) {
  const id = o.id,
    A = ACT30[id] || { he: id, icon: '•' },
    r = RATE30.ids.includes(o.rating) ? o.rating : 'kasher',
    now = role30(o.rec),
    was = o.was || null,
    title = now.title ? now.title.he : '',
    fresh = title && was && was.title && was.title.he !== title,
    s = srcParts(id);
  return `<div class="c" role="dialog" aria-label="סוף האימון"><h2>${esc(A.icon)} ${esc(A.he)} <span class="tg">אימון</span></h2>
    <div class="rt ${r}">${RATE30.icon[r]} ${RATE30.he[r]}</div>
    <div class="rc">${fresh ? `<b>תואר חדש: ${esc(title)}!</b> · ` : ''}${now.best ? `הדירוג הטוב שלך: ${RATE30.he[now.best]}` : ''}${title && !fresh ? ` · ${esc(title)}` : ''}${now.h ? ` · מהודר ×${now.h}` : ''}</div>
    ${s ? `<button type="button" class="src" data-p31="src" aria-label="המקור — הקישו לפתוח"><i aria-hidden="true">📜</i>${s.q ? `<span class="q">${esc(s.q)}</span>` : ''}<span class="r">${esc(s.r)}</span><b aria-hidden="true">›</b></button>` : ''}
    <div class="bt"><button type="button" class="ag" data-p31="again">עוד פעם</button><button type="button" class="bk" data-p31="back">חזרה</button></div>
    <small>אימון — המחשה: תרגול של המשחק, לא מסדר העבודה במקדש · הדירוג והתואר נרשמים; הפרוטות, היום והפיס — לא</small></div>`;
}
const CSS = `body.p31-on .f17-fire,body.p31-on .f17-tam,body.p31-on .f17-bar,body.p31-on .p25-w{display:none!important}
.p31-tag{flex:none;min-height:44px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:2px 12px;border-radius:14px;border:2px dashed #E2B65A;background:rgba(28,20,10,.82);color:#FFE6A0;font:900 16px/1.05 Heebo,system-ui,sans-serif;pointer-events:none;white-space:nowrap;direction:rtl}
.p31-tag small{font:700 9px/1 Heebo,system-ui,sans-serif;color:#FFF6DA;opacity:.75}
.p31-tag.fx{position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);right:calc(env(safe-area-inset-right,0px) + 12px);z-index:31}
.p31-end{position:fixed;inset:0;z-index:61;display:flex;align-items:center;justify-content:center;background:#0E0A05A8;direction:rtl;font-family:Heebo,system-ui,sans-serif;color:#FFF6DA;pointer-events:auto;animation:p31in .3s ease-out}
.p31-end .c{width:min(460px,calc(100vw - 24px));max-height:calc(100vh - 12px);overflow:auto;box-sizing:border-box;padding:8px 16px 8px;border-radius:20px;background:linear-gradient(#3A2A16,#21170B);border:2px solid #C8923A;text-align:center;box-shadow:0 10px 40px #0009}
.p31-end h2{margin:0;font:900 18px/1.25 Heebo,system-ui,sans-serif}.p31-end h2 .tg{display:inline-block;margin-inline-start:6px;padding:1px 8px;border-radius:9px;border:1.5px dashed #E2B65A;font-size:13px;color:#FFE6A0;vertical-align:middle}
.p31-end .rt{display:inline-block;margin:6px 0 2px;padding:4px 20px;border-radius:14px;font:900 28px/1.15 Heebo,system-ui,sans-serif;animation:p31pop .45s cubic-bezier(.3,1.6,.5,1)}
.p31-end .rt.mehudar{background:#FFD66E;color:#2A1804;box-shadow:0 0 18px rgba(255,214,110,.7)}.p31-end .rt.kasher{background:#F2E6C8;color:#2A1804}.p31-end .rt.tikkun{background:#D8CDB8;color:#3A3328}
.p31-end .rc{font:800 13px/1.3 Heebo,system-ui,sans-serif;color:#FFE6A0;margin:2px 0;min-height:1em}.p31-end .rc b{color:#FFD66E}
.p31-end .src{min-height:44px;max-width:100%;box-sizing:border-box;display:flex;align-items:center;gap:6px;margin:6px auto 0;padding:4px 12px;border-radius:14px;border:1.5px solid #E2B65A;background:#1C140AD9;color:#FFF6DA;font:700 13px/1.25 Heebo,system-ui,sans-serif;cursor:pointer;touch-action:manipulation}
.p31-end .src .q{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:0 1 auto}.p31-end .src .r{flex:none;white-space:nowrap;color:#FFE6A0}.p31-end .src i{font-style:normal;flex:none}.p31-end .src b{flex:none;color:#FFD66E;font-size:15px}
.p31-end .bt{display:flex;gap:10px;margin:10px 0 4px}.p31-end .bt button{flex:1;min-height:52px;min-width:44px;border-radius:16px;font:900 20px/1 Heebo,system-ui,sans-serif;cursor:pointer;touch-action:manipulation}
.p31-end .bt .ag{border:0;background:radial-gradient(circle at 40% 30%,#FFE6A0,#E2B65A 70%,#9A6F1E);color:#2A1804;box-shadow:0 4px 0 #6A4614}.p31-end .bt .bk{border:2px solid rgba(255,236,190,.55);background:#4A3418;color:#FFF6DA}
.p31-end button:active{transform:scale(.96)}.p31-end small{display:block;font:600 10px/1.3 Heebo,system-ui,sans-serif;opacity:.6}
@keyframes p31in{from{opacity:0}to{opacity:1}}@keyframes p31pop{from{transform:scale(.6)}to{transform:scale(1)}}
@media (prefers-reduced-motion:reduce){.p31-end,.p31-end .rt{animation:none}}`;
export function createPractice31(o = {}) {
  const E = o.E,
    doc = o.doc || (typeof document < 'u' ? document : null),
    stat = { ends: 0, again: 0, back: 0, src: 0, last: null };
  if (!doc || !E || !E.on17 || !E.prac31) return { destroy() {}, state: () => stat };
  const id0 = E.prac31,
    snd = (n, a) => {
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
    },
    recOf = () => {
      const s = saveOf();
      return s && s.roles23 && s.roles23[id0] ? s.roles23[id0] : null;
    },
    was = role30(recOf());   // (the title before this run: a new one is said on the card)
  if (!doc.getElementById('p31-css')) {
    const c = doc.createElement('style');
    c.id = 'p31-css';
    c.textContent = CSS;
    doc.head.appendChild(c);
  }
  doc.body.classList.add('p31-on');
  // the "אימון" tag beside the act's one line (focus17's top bar; without it, at the top right)
  const tag = doc.createElement('div'),
    top = doc.querySelector('.f17-top');
  tag.className = top ? 'p31-tag' : 'p31-tag fx';
  tag.setAttribute('role', 'note');
  tag.innerHTML = '<b>אימון</b><small>המחשה</small>';
  (top || doc.body).appendChild(tag);
  let card = null,
    gone = false;
  function show(ev) {
    if (card || gone) return;
    stat.ends++;
    stat.last = { id: ev.id, rating: ev.rating, q: ev.q };
    card = doc.createElement('div');
    card.className = 'p31-end';
    card.innerHTML = endHTML31({ id: ev.id, rating: ev.rating, rec: recOf(), was });
    card.addEventListener('pointerdown', (e) => e.stopPropagation());
    const on = (k, fn) => {
      const b = card.querySelector(`[data-p31="${k}"]`);
      if (b)
        b.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          fn();
        });
    };
    let used = false;
    const once = (k, fn) => () => {
      if (used) return;
      used = true;
      stat[k]++;
      snd('ui');
      try {
        fn && fn();
      } catch (e) {
        console.warn('[p31]', e && e.message);
      }
    };
    on('again', once('again', o.onAgain));
    on('back', once('back', o.onBack));
    on('src', () => {
      stat.src++;
      try {
        const R = globalThis.__R30;
        if (R && R.openAct) R.openAct(ev.id, ev.rating);
      } catch (e) {}
    });
    doc.body.appendChild(card);
    snd(ev.rating === 'mehudar' ? 'chord17' : 'ui', { up: 1 });
  }
  const off = E.on17((ev) => {
    if (ev.type === 'p31end') show(ev);
  });
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
      doc.body.classList.remove('p31-on');
      try {
        if (globalThis.__P31 === api) delete globalThis.__P31;
      } catch (e) {}
    },
    state: () => ({ ...stat, role: id0, card: !!card, text: card ? card.textContent : '', tag: tag.isConnected !== false }),
    again: () => {
      const b = card && card.querySelector('[data-p31="again"]');
      if (b) b.click();
      return !!b;
    },
    back: () => {
      const b = card && card.querySelector('[data-p31="back"]');
      if (b) b.click();
      return !!b;
    },
  };
  try {
    globalThis.__P31 = api;
  } catch (e) {}
  return api;
}
