/* ── fable32 (build 30) ── end30.js — an act's end: ONE source line, tappable (rohvi-he.md §14; the owner, 22.10 09:19: "המקור — שורה אחת
 * בסוף הפעולה; המשנה המלאה ביומן הכהן"). The act's rating is the step card's word (day33's step17, RATE30.wordS — gold for מהודר, cream
 * for כשר, soft for טעון תיקון, never red); under the day's top bar this line: the act's own source (SRC30[id].chip, each module's text)
 * — "…" — מסכת פרק משנה · טיוטה ›; for טעון תיקון first a soft "אפשר לנסות שוב בספר התפקידים". A tap opens the card of every line the act
 * showed (SRC30[id].all — the quotes, their sources, the המחשה notes; the day waits while it is open). The line goes when the next act
 * begins (the lot after the laver) or after RATE30.chipS; the kohen's journal (a later build) will keep the full Mishnah.
 *   createEnd30({ E, doc, sfx }) → { destroy(), state(), busy() }      (focus17.js makes it with the other modules; globalThis.__R30)
 * Never a Divine Name. ── /fable32 ── */
import { onTick } from './draw.js';
import { RATE30, SRC30, ACT30, draft30 } from './rate30.js';
const CSS = `.r30{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 56px);transform:translateX(-50%);z-index:32;display:none;flex-direction:column;align-items:center;gap:3px;direction:rtl;pointer-events:none;font-family:Heebo,system-ui,sans-serif;max-width:min(76vw,560px)}
.r30.on{display:flex;animation:r30in .35s ease-out}
.r30.sl,.r30.sr{transform:none;max-width:min(46vw,360px);animation:none}.r30.sl{left:max(8px,env(safe-area-inset-left,0px));align-items:flex-start}.r30.sr{left:auto;right:max(8px,env(safe-area-inset-right,0px));align-items:flex-end}
.r30 .iv{font:800 13px/1.2 Heebo,system-ui,sans-serif;color:#E6D9BE;background:#1C140ACC;border-radius:10px;padding:2px 10px;white-space:nowrap}
.r30 .ch{pointer-events:auto;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;min-height:44px;max-width:100%;box-sizing:border-box;display:flex;align-items:center;padding:0;border:0;background:transparent;color:#FFF6DA;font:700 13px/1.25 Heebo,system-ui,sans-serif}
.r30 .ch u{text-decoration:none;display:flex;align-items:center;gap:6px;max-width:100%;box-sizing:border-box;padding:5px 12px;border-radius:14px;border:1.5px solid #E2B65A;background:#1C140AD9;box-shadow:0 3px 10px #0007}
.r30 .ch .q{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:0 1 auto}.r30 .ch .r{flex:none;white-space:nowrap;color:#FFE6A0}.r30 .ch i{font-style:normal;flex:none;opacity:.9}.r30 .ch b{flex:none;color:#FFD66E;font-size:15px}
.r30 .ch:active{transform:scale(.96)}
.r30-c{position:fixed;inset:0;z-index:62;display:flex;align-items:center;justify-content:center;background:#0E0A05B0;direction:rtl;font-family:Heebo,system-ui,sans-serif;color:#FFF6DA}
.r30-c .c{width:min(560px,calc(100vw - 24px));max-height:calc(100vh - 16px);overflow:auto;box-sizing:border-box;padding:10px 16px 12px;border-radius:20px;background:linear-gradient(#3A2A16,#21170B);border:2px solid #C8923A;text-align:center;box-shadow:0 10px 40px #0009}
.r30-c h2{margin:2px 0 4px;font:900 20px/1.2 Heebo,system-ui,sans-serif}.r30-c h3{margin:10px 0 2px;font:900 16px/1.2 Heebo,system-ui,sans-serif;text-align:right;color:#FFE6A0}.r30-c h3 em{font-style:normal;margin-inline-start:8px;padding:1px 8px;border-radius:9px;font-size:13px}.r30-c h3 em.mehudar{color:#2A1804;background:#FFD66E}.r30-c h3 em.kasher{color:#2A1804;background:#F2E6C8}.r30-c h3 em.tikkun{color:#3A3328;background:#D8CDB8}.r30-c h2 em{font-style:normal;margin-inline-start:8px;padding:1px 10px;border-radius:10px;font-size:16px}
.r30-c h2 em.mehudar{color:#2A1804;background:#FFD66E}.r30-c h2 em.kasher{color:#2A1804;background:#F2E6C8}.r30-c h2 em.tikkun{color:#3A3328;background:#D8CDB8}
.r30-c p{margin:6px 0;text-align:right;font:700 14px/1.45 Heebo,system-ui,sans-serif}.r30-c p.n{font-size:12px;opacity:.8}
.r30-c small{display:block;font:600 11px/1.3 Heebo,system-ui,sans-serif;opacity:.65;margin-top:6px}
.r30-c button{margin-top:8px;min-height:48px;min-width:160px;border-radius:16px;border:2px solid #E2B65A;background:#FFECBE1F;color:#FFF6DA;font:900 18px/1 Heebo,system-ui,sans-serif;cursor:pointer}
@keyframes r30in{from{opacity:0;transform:translate(-50%,-8px)}to{opacity:1;transform:translate(-50%,0)}}`;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export function createEnd30(o = {}) {
  const E = o.E,
    view = o.view || null,   // (the hero's head on the screen: the line steps aside from it)
    doc = o.doc || (typeof document < 'u' ? document : null),
    stat = { shows: 0, opens: 0, last: null, lots: 0 };
  if (!doc || !E || !E.on17) return { destroy() {}, state: () => stat, busy: () => false };
  if (!doc.getElementById('r30-css')) {
    const css = doc.createElement('style');
    css.id = 'r30-css';
    css.textContent = CSS;
    doc.head.appendChild(css);
  }
  const snd = (n, a) => {
      try {
        o.sfx.play(n, a);
      } catch (e) {}
    },
    el = doc.createElement('div');
  el.className = 'r30';
  el.setAttribute('role', 'status');
  doc.body.appendChild(el);
  el.addEventListener('pointerdown', (ev) => ev.stopPropagation());
  let cur = null,
    shownAt = 0,
    left = 0,
    card = null,
    paused = false;
  const now = () => (typeof performance < 'u' ? performance.now() / 1e3 : Date.now() / 1e3);
  function show(id, rating) {
    const S = SRC30[id];
    if (!S || !S.chip) return;
    cur = { id, rating: rating || null };
    stat.shows++;
    stat.last = { id, rating: cur.rating, chip: S.chip };
    // (the quote may be cut with "…" on a narrow phone — never its source: the reference and "טיוטה" keep their place)
    const line = draft30(S.chip),
      cut = line.lastIndexOf(' — '),
      q = cut > 0 ? line.slice(0, cut) : '',
      r = cut > 0 ? line.slice(cut) : line;
    el.innerHTML = `${rating === 'tikkun' ? `<div class="iv">${esc(RATE30.invite)}</div>` : ''}<button type="button" class="ch" aria-label="המקור — הקישו לפתוח"><u><i aria-hidden="true">📜</i>${q ? `<span class="q">${esc(q)}</span>` : ''}<span class="r">${esc(r)}</span><b aria-hidden="true">›</b></u></button>`;
    el.querySelector('.ch').addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      open();
    });
    el.classList.remove('on');
    el.offsetWidth;
    el.classList.add('on');
    shownAt = now();
    left = RATE30.chipS;
  }
  // ── never over the kohen's head: when his head is under the line (an end's view frames him large — the lamb's, the laver's), the line
  // stands at the screen's other side, narrower (its quote cut sooner, its source whole) ──
  const hp = { x: 0, y: 16, z: 0 };
  function side() {
    let want = '';
    try {
      const T = globalThis.__T,
        H = globalThis.__HERO35,
        hd = H && H.loaded && H.head ? H.head() : null;   // (the real kohen's head bone; else the figure's height — flow31 claims 6.6 above the feet)
      if (view && view.project && ((hd && Number.isFinite(hd.x)) || (T && T.stages && T.stages.heroXYZ))) {
        if (hd && Number.isFinite(hd.x)) Object.assign(hp, { x: hd.x, y: hd.y - 0.4, z: hd.z });   // (the bone at the neck: the cap's top ≈ 1.8 above it)
        else {
          T.stages.heroXYZ(hp);
          hp.y = (hp.y || 16) + 4.2;
        }
        const W = innerWidth || 844,
          a = view.project(hp.x, hp.y + 2.2, hp.z),
          b = view.project(hp.x, hp.y + 0.6, hp.z);
        if (a && b && a.on !== false) {
          const r = el.getBoundingClientRect(),
            top = Math.min(a.y, b.y) - 16,
            bot = Math.max(a.y, b.y) + 10,
            rad = Math.max(28, Math.abs(b.y - a.y));
          if (r.width && top < r.bottom + 6 && bot > r.top - 6 && a.x + rad > W / 2 - r.width / 2 - 8 && a.x - rad < W / 2 + r.width / 2 + 8) want = a.x < W / 2 ? 'sr' : 'sl';
          if (el.__side && !want && top < r.bottom + 30 && a.x + rad > W * 0.15 && a.x - rad < W * 0.85) want = el.__side;   // (no flicker at the edge)
        }
      }
    } catch (e) {}
    if (el.__side !== want) {
      if (el.__side) el.classList.remove(el.__side);
      if (want) el.classList.add(want);
      el.__side = want;
      stat.side = want;
    }
  }
  function hide() {
    if (!cur) return;
    cur = null;
    el.classList.remove('on');
    el.innerHTML = '';
  }
  const lines = (S) => S.all.map((x) => `<p class="${/המחשה/.test(x) && !/״|"/.test(x) ? 'n' : ''}">${esc(draft30(x))}</p>`).join(''),
    head = (id, r, tag = 'h2') => {
      const S = SRC30[id],
        A = ACT30[id] || { he: S.he, icon: S.icon };
      return `<${tag}>${esc(A.icon)} ${esc(A.he)}${r ? `<em class="${r}">${esc(RATE30.he[r])}</em>` : ''}</${tag}>`;
    };
  /** the card: one act's lines (the chip's tap), or — openDay — every act of the day, from its summary (its "📜 המקורות של היום") */
  function open(list) {
    const day = Array.isArray(list) ? list.filter((x) => x && SRC30[x.id]) : null;
    if (card || (!day && !cur) || (day && !day.length)) return false;
    stat.opens++;
    snd('ui');
    try {
      if (E.state && !E.state().paused) {
        E.pause(true);
        paused = true;
      }
    } catch (e) {}
    card = doc.createElement('div');
    card.className = 'r30-c';
    const body = day ? `<h2>📜 המקורות של היום</h2>${day.map((x) => `${head(x.id, x.rating, 'h3')}${lines(SRC30[x.id])}`).join('')}` : `${head(cur.id, cur.rating)}${lines(SRC30[cur.id])}`;
    card.innerHTML = `<div class="c" role="dialog" aria-label="המקורות">${body}<small>המשנה המלאה — ביומן הכהן (בקרוב) · טיוטה</small><button type="button">סגור</button></div>`;
    card.addEventListener('pointerdown', (ev) => ev.stopPropagation());
    card.querySelector('button').addEventListener('click', (ev) => {
      ev.stopPropagation();
      close();
    });
    card.__day = !!day;
    doc.body.appendChild(card);
    return true;
  }
  function close() {
    if (!card) return;
    card.remove();
    card = null;
    snd('ui');
    if (paused) {
      paused = false;
      try {
        E.pause(false);
      } catch (e) {}
    }
    hide();
  }
  const openDay = (list) => open(list || []);
  const offEv = E.on17((ev) => {
      if (ev.type === 'rate30') show(ev.id, ev.rating);
      else if (ev.type === 'p23done') {
        stat.lots++;
        show(ev.k26 ? 'lot2' : 'lot', null);
      }
    }),
    offTick = onTick((ms, dt) => {
      if (!cur || card) return;
      const st = E.st33;
      if (!st || st.phase !== 'run' || st.summary || st.night) return hide();
      if (!st.paused) left -= dt;
      // (the next act begins — the lot after the laver, the second lot after the pre-dawn task: the line goes, the act's own line is the card's)
      const busy = E.act30 && E.act30();
      if (left <= 0 || (busy && now() - shownAt > 0.4)) return hide();
      side();
    }),
    api = {
      destroy() {
        offEv();
        offTick();
        if (card) close();
        el.remove();
        try {
          if (globalThis.__R30 === api) delete globalThis.__R30;
        } catch (e) {}
      },
      state: () => ({ ...stat, on: !!cur, cur: cur ? { ...cur } : null, text: cur ? el.textContent : '', card: !!card, cardText: card ? card.textContent : '' }),
      busy: () => !!cur,
      open: () => open(),
      openDay,
      close,
    };
  try {
    globalThis.__R30 = api;
  } catch (e) {}
  return api;
}
