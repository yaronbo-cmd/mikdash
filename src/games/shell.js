/* ─────────────────────────────────────────────────────────────────────────────
 * games/shell.js — (GAMES10, wave 10) the frame every classic in-between game shares: the full-screen overlay in the board's
 * look (src/match3: the warm quarry gradient, cream cards with a gold rim, Heebo / Frank Ruhl), the one-screen how-to that is
 * also the mode card (לבד · שניים בטלפון אחד), the duel layout (the top half turned 180° to the player across), the players'
 * bands, and the friendly result with its true fact (טיוטה + source) and the small pay line.
 *   const S = createShell(root, { onClose });  S.hub(games) · S.howto(game) · S.turnLayout(duel) · S.splitLayout(duel)
 *   S.result({...}) · S.confirm(text) · S.destroy()
 * DOM only; RTL; every target ≥ 44 px; `.g10` sets pointer-events:auto itself (it may sit inside `.gm{pointer-events:none}`).
 * ──────────────────────────────────────────────────────────────────────────── */
export const esc = (x) => String(x == null ? '' : x).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* the two players' colours: the belt's תכלת and ארגמן (שמות לט, כט) — also told apart by name and side, never by colour alone */
export const PLAYERS = [
  { key: 'a', name: 'תכלת', color: '#2F6DB5', soft: '#D8E7F8' },
  { key: 'b', name: 'ארגמן', color: '#9A2F5E', soft: '#F5DCE7' },
];

const CSS = `
.g10{position:fixed;inset:0;z-index:230;pointer-events:auto;direction:rtl;overflow:hidden;font-family:"Heebo",system-ui,sans-serif;color:#FFF6E4;
 -webkit-user-select:none;user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent;
 background:radial-gradient(120% 60% at 50% 38%,rgba(255,236,190,.16),rgba(20,10,2,.72)),linear-gradient(180deg,#E9C48A,#AA7646 45%,#4E3016);animation:g10in .3s ease-out}
.g10 *{box-sizing:border-box}
.g10 button{font-family:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
@keyframes g10in{from{opacity:0}to{opacity:1}}
.g10-scr{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center}
.g10-head{width:100%;max-width:520px;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 6px}
.g10-title{flex:1;text-align:center;font:900 25px/1.15 "Frank Ruhl Libre","Heebo",serif;text-shadow:0 2px 0 rgba(0,0,0,.4)}
.g10-title small{display:block;font:600 13.5px/1.35 "Heebo",sans-serif;opacity:.95;margin-top:3px;text-shadow:0 1px 2px rgba(0,0,0,.6)}
.g10-x{min-width:44px;min-height:44px;border-radius:14px;border:1px solid rgba(255,226,160,.55);background:linear-gradient(#6E4822,#3D230E);color:#FFF1D0;
 font:800 15px "Heebo",sans-serif;padding:0 12px;box-shadow:0 2px 0 rgba(0,0,0,.35)}
.g10-list{width:100%;max-width:520px;flex:1;min-height:0;overflow:auto;padding:8px 14px calc(env(safe-area-inset-bottom,0px) + 16px);display:flex;flex-direction:column;gap:12px;touch-action:pan-y}
.g10-tile{display:flex;align-items:center;gap:12px;width:100%;min-height:96px;border-radius:20px;border:0;padding:10px 12px;text-align:start;
 background:linear-gradient(#FFF8E8,#F0DBB0);color:#3A220C;box-shadow:0 6px 18px rgba(0,0,0,.35),inset 0 0 0 2px #D8AB58}
.g10-tile canvas{width:76px;height:76px;flex:none;border-radius:16px}
.g10-tile b{display:block;font:900 21px/1.2 "Frank Ruhl Libre","Heebo",serif;color:#5A300A}
.g10-tile span{display:block;font:500 14.5px/1.35 "Heebo",sans-serif;margin-top:2px}
.g10-tile i{display:inline-block;margin-top:6px;font:700 12.5px/1.7 "Heebo",sans-serif;font-style:normal;background:#FCE3AA;color:#6E4200;border-radius:8px;padding:0 8px}
.g10-tile.g10-feat{min-height:112px;box-shadow:0 6px 22px rgba(0,0,0,.4),inset 0 0 0 3px #DF951A,0 0 0 3px rgba(255,213,105,.55)}
.g10-rib{display:inline-block;margin-bottom:3px;padding:0 9px;border-radius:999px;background:linear-gradient(#FFD569,#DF951A);color:#452300;font:800 12px/1.8 "Heebo",sans-serif;font-style:normal}
.g10-foot{font:500 12.5px/1.4 "Heebo",sans-serif;opacity:.9;text-align:center;padding:4px 8px;text-shadow:0 1px 2px rgba(0,0,0,.6)}
.g10-wrap{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;background:rgba(12,6,0,.55);padding:14px;animation:g10in .2s ease-out}
.g10-card{width:100%;max-width:370px;max-height:100%;overflow:auto;background:linear-gradient(#FFF8E8,#F0DBB0);color:#3A220C;border-radius:22px;padding:14px 16px;
 text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.55),inset 0 0 0 2px #D8AB58;touch-action:pan-y}
.g10-card h2{font:900 25px/1.2 "Frank Ruhl Libre","Heebo",serif;margin:2px 0 6px;color:#5A300A}
.g10-card p{font:500 16px/1.45 "Heebo",sans-serif;margin:6px 0}
.g10-hic{display:block;width:56px;height:56px;margin:0 auto 2px;border-radius:14px}
.g10-how{list-style:none;margin:8px 0;padding:0;text-align:start}
.g10-how li{font:500 15.5px/1.4 "Heebo",sans-serif;margin:7px 0;padding-inline-start:28px;position:relative}
.g10-how li::before{content:attr(data-n);position:absolute;inset-inline-start:0;top:1px;width:21px;height:21px;border-radius:50%;background:#DF951A;color:#fff;font:800 12.5px/21px "Heebo",sans-serif;text-align:center}
.g10-cta{display:block;width:100%;min-height:56px;border:0;border-radius:16px;background:linear-gradient(#FFD569,#DF951A);color:#452300;font:900 19px/1.2 "Heebo",sans-serif;box-shadow:0 4px 0 #94580C;margin-top:10px;padding:6px 10px}
.g10-cta small,.g10-sec small{display:block;font:600 12.5px/1.3 "Heebo",sans-serif;opacity:.88}
.g10-sec{display:block;width:100%;min-height:50px;border-radius:14px;border:2px solid #C8964A;background:rgba(255,255,255,.35);color:#5A300A;font:800 16px/1.2 "Heebo",sans-serif;margin-top:8px;padding:4px 10px}
.g10-row{display:flex;gap:8px}.g10-row>*{flex:1}
.g10-fact{margin:10px 0 2px;padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.6);border:1px dashed #C8964A;text-align:start;font:500 14.5px/1.45 "Heebo",sans-serif}
.g10-fact b{color:#7A3E00}
.g10-src{display:block;margin-top:4px;font:600 12px/1.4 "Heebo",sans-serif;color:#6E4200}
.g10-tag{display:inline-block;vertical-align:middle;background:#FCE3AA;color:#6E4200;border-radius:7px;padding:0 6px;font:700 11px/1.6 "Heebo",sans-serif;margin-inline-start:4px}
.g10-pay{display:inline-flex;align-items:center;gap:6px;margin:6px auto 0;background:#FFF1D2;border:1px solid #D8AB58;border-radius:999px;padding:3px 14px;font:800 15.5px "Heebo",sans-serif;color:#4A2A0A}
.g10-q{font:600 14px/1.45 "Frank Ruhl Libre",serif;color:#5A300A;margin:6px 0 0}
.g10-cta:focus-visible,.g10-sec:focus-visible,.g10-tile:focus-visible,.g10-x:focus-visible,.g10-foot-b:focus-visible{outline:3px solid #FFF3C4;outline-offset:2px}
/* a turn game: the across player's band on top (turned to him), the board, the near player's band */
.g10-tb{position:absolute;inset:0;display:flex;flex-direction:column;align-items:stretch}
.g10-band{flex:none;position:relative;display:flex;align-items:center;gap:10px;min-height:74px;padding:8px 12px;background:rgba(28,14,2,.5);border-top:3px solid transparent;transition:background .25s}
.g10-band.g10-t{transform:rotate(180deg)}
.g10-band.solo.g10-t{transform:none}
.g10-band .who{display:flex;align-items:center;gap:8px;min-width:0;flex:1}
.g10-band .dot{width:30px;height:30px;border-radius:50%;flex:none;box-shadow:0 0 0 3px rgba(255,255,255,.75)}
.g10-band .nm{font:800 17px/1.2 "Heebo",sans-serif;white-space:nowrap}
.g10-band .msg{font:600 14px/1.25 "Heebo",sans-serif;opacity:.92}
.g10-band .sc{min-width:58px;text-align:center;background:linear-gradient(#FFF3D6,#E6BE72);color:#46270A;border-radius:14px;padding:2px 6px;box-shadow:0 3px 0 #8A5A1E}
.g10-band .sc b{display:block;font:900 24px/1.1 "Frank Ruhl Libre","Heebo",serif}.g10-band .sc small{font:700 11px "Heebo",sans-serif}
.g10-band.on{background:rgba(255,214,110,.28)}
.g10-band.on .msg{opacity:1;font-weight:800;color:#FFF3C4}
.g10-band.on .dot{animation:g10pulse 1.2s ease-in-out infinite}
@keyframes g10pulse{50%{transform:scale(1.12)}}
.g10-board{flex:1;min-height:0;position:relative;display:flex;align-items:center;justify-content:center;padding:6px}
/* the race: two halves, each with its own scene and feet; the top one is turned to the player across */
.g10-split{position:absolute;inset:0;display:flex;flex-direction:column}
.g10-half{position:relative;flex:1 1 0;min-height:0;display:flex;flex-direction:column}
.g10-half.g10-t{transform:rotate(180deg);border-bottom:2px solid rgba(255,230,170,.55)}
.g10-ov{position:absolute;inset:0;z-index:20}
.g10-toast{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:8;max-width:88%;pointer-events:none;background:rgba(255,248,232,.97);color:#3A220C;
 border-radius:16px;padding:8px 14px;text-align:center;font:600 15px/1.4 "Heebo",sans-serif;box-shadow:0 8px 26px rgba(0,0,0,.45),inset 0 0 0 2px #D8AB58;animation:g10in .2s ease-out}
.g10-toast b{display:block;font:900 19px/1.2 "Frank Ruhl Libre","Heebo",serif;color:#5A300A}
.g10-toast.flip{transform:translate(-50%,-50%) rotate(180deg)}
.g10-halfcard{position:absolute;inset:0;z-index:12;display:flex;align-items:center;justify-content:center;padding:10px;background:rgba(12,6,0,.5);animation:g10in .2s ease-out}
.g10-halfcard .g10-card{max-width:360px;padding:10px 14px}
.g10-halfcard .g10-card h2{font-size:22px;margin:0 0 4px}
.g10-halfcard .g10-card p{font-size:15px;margin:4px 0}
.g10-halfcard .g10-cta{min-height:50px;font-size:17px;margin-top:8px}
.g10-halfcard .g10-sec{min-height:46px;font-size:15px;margin-top:6px}
.g10-halfcard .g10-fact{font-size:13.5px;margin-top:6px;padding:6px 9px}
@media (prefers-reduced-motion:reduce){.g10,.g10-wrap,.g10-toast,.g10-halfcard,.g10-band.on .dot{animation:none}}
`;
export function injectCSS(id, css) {
  if (document.getElementById(id)) return;
  const s = document.createElement('style'); s.id = id; s.textContent = css; document.head.appendChild(s);
}
export const reducedMotion = () => { try { return !!(globalThis.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } };

/** a canvas that fills its box at the device's pixel ratio (≤ 2): fit() → { w, h, g } in CSS px */
export function fitCanvas(cv) {
  const dpr = Math.min(2, globalThis.devicePixelRatio || 1);
  const r = cv.getBoundingClientRect();
  const w = Math.max(1, Math.round(r.width)), hh = Math.max(1, Math.round(r.height));
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(hh * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(hh * dpr); }
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h: hh, g };
}

/** (GAMES13) a static layer (a scene's sky, walls, floor) drawn once per size and signature, then only copied each frame:
 *  layer(key, w, h, sig, draw(g)) → a canvas to drawImage(c, 0, 0, w, h) (CSS px at the page's dpr, ≤ 2). A software-rendered
 *  phone (or a busy test machine) keeps its frames for the moving parts. */
const LAYERS = new Map();
export function layer(key, w, h, sig, draw) {
  const dpr = Math.min(2, globalThis.devicePixelRatio || 1), W = Math.max(1, Math.round(w * dpr)), H = Math.max(1, Math.round(h * dpr));
  let L = LAYERS.get(key);
  if (!L || L.cv.width !== W || L.cv.height !== H || L.sig !== sig) {
    const cv = (L && L.cv) || document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
    draw(g);
    L = { cv, sig }; LAYERS.set(key, L);
  }
  return L.cv;
}

export function createShell(root, o = {}) {
  injectCSS('g10-css', CSS);
  const el = h('div', 'g10');
  el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'משחקי ביניים');
  (root || document.body).appendChild(el);
  let scr = null;
  // (FUN11) a ghost click: an opener that runs on pointerup (SITE11's game table in the world) puts the hub under the finger, and
  // the same tap's click then lands on a tile and opens a game nobody chose (seen by touch: the table → the race's how-to)
  // — a click is a ghost when no pointer went down on the games since they opened (a real tap, even a quick one, has its own
  // pointerdown here; a keyboard's click comes later than 0.8 s)
  const born = Date.now();
  let downIn = false;
  el.addEventListener('pointerdown', () => { downIn = true; }, true);
  const ghost = () => !downIn && Date.now() - born < 800;
  const S = {
    el,
    /** a fresh full screen (the previous one goes) */
    screen(cls = '') { if (scr) scr.remove(); scr = h('div', 'g10-scr ' + cls); el.appendChild(scr); return scr; },
    /** the hub: the three games; resolves { id } or null (back to the building) */
    hub(games, note, opt) {
      const s = S.screen('g10-hubs');
      const feat = opt && opt.featured ? opt.featured : '';
      s.innerHTML = `<div class="g10-head"><button class="g10-x" type="button" data-v="close" aria-label="חזרה לבנייה">חזרה</button>
        <div class="g10-title">משחקי ביניים<small>משחקים קלאסיים מעולם המקדש · לבד, או שניים על טלפון אחד</small></div><span style="width:44px"></span></div>
        <div class="g10-list"></div>`;
      const list = s.querySelector('.g10-list');
      for (const gm of games) {
        const isF = feat && gm.id === feat;   // (FUN11) the game that fits what he is building: first, with its reason
        const b = h('button', 'g10-tile' + (isF ? ' g10-feat' : '')); b.type = 'button'; b.dataset.v = gm.id; b.dataset.g10Game = gm.id;
        const cv = document.createElement('canvas'); b.appendChild(cv);
        const t = h('div', null, `${isF ? '<em class="g10-rib">מתאים למה שאתה בונה</em>' : ''}<b>${esc(gm.title)}</b><span>${esc(isF && opt.why ? opt.why : gm.sub)}</span><i>${esc(gm.chip)}</i>`); b.appendChild(t);
        list.appendChild(b);
        try { const dpr = Math.min(2, globalThis.devicePixelRatio || 1); cv.width = cv.height = Math.round(76 * dpr); const g = cv.getContext('2d'); g.scale(dpr, dpr); gm.icon(g, 76); } catch (e) { /* an icon is decoration */ }
      }
      if (note) list.appendChild(h('div', 'g10-foot', esc(note)));
      return new Promise((res) => {
        s.addEventListener('click', (e) => { if (ghost()) return; const b = e.target.closest('[data-v]'); if (!b) return; o.sfx && o.sfx('ui'); res(b.dataset.v === 'close' ? null : { id: b.dataset.v }); });
      });
    },
    /** a centred card over the current screen; resolves the tapped button's value */
    card(html, buttons, { cls = '' } = {}) {
      const w = h('div', 'g10-wrap ' + cls);
      const c = h('div', 'g10-card', html);
      for (const bt of buttons || []) {
        const b = h('button', bt.gold ? 'g10-cta' : 'g10-sec', `${esc(bt.label)}${bt.sub ? `<small>${esc(bt.sub)}</small>` : ''}`);
        b.type = 'button'; b.dataset.v = bt.value; c.appendChild(b);
      }
      w.appendChild(c); el.appendChild(w);
      return new Promise((res) => {
        w.addEventListener('click', (e) => { if (ghost()) return; const b = e.target.closest('button[data-v]'); if (!b) return; o.sfx && o.sfx('ui'); try { if (o.gesture) o.gesture(); } catch (x) { /* */ } w.remove(); res(b.dataset.v); });
      });
    },
    /** the game's one-screen how-to, which is also the mode card: resolves 'solo' | 'duel' | null */
    async howto(gm) {
      const lis = gm.how.map((l, i) => `<li data-n="${i + 1}">${l}</li>`).join('');
      const q = gm.quote ? `<p class="g10-q">״${esc(gm.quote.he)}״ <span class="g10-src" style="display:inline">(${esc(gm.quote.src)}) <span class="g10-tag">טיוטה</span></span></p>` : '';
      const pv = S.card(`<canvas class="g10-hic" width="64" height="64" aria-hidden="true"></canvas><h2>${esc(gm.title)}</h2><ul class="g10-how">${lis}</ul>${q}`, [
        { value: 'solo', label: gm.solo || 'לבד', sub: gm.soloSub || '', gold: true },
        ...(gm.noDuel ? [] : [{ value: 'duel', label: 'שניים — טלפון אחד', sub: gm.duelSub || 'כל אחד בקצה שלו, הטלפון על השולחן', gold: true }]),   // (FUN12: a game may be one player's, or a duel in turns)
        { value: 'back', label: 'למשחק אחר' },
      ], { cls: 'g10-howto' });
      try { const cv = el.querySelector('.g10-howto .g10-hic'), dpr = Math.min(2, globalThis.devicePixelRatio || 1); cv.width = cv.height = Math.round(56 * dpr); const g = cv.getContext('2d'); g.scale(dpr, dpr); gm.icon(g, 56); } catch (e) { /* decoration */ }
      const v = await pv;
      return v === 'back' ? null : v;
    },
    /** a turn game's frame: { top, board, bot } — the top band is turned to the player across in a duel */
    turnLayout(duel) {
      const s = S.screen('g10-turn');
      const tb = h('div', 'g10-tb');
      const top = band(duel ? 1 : 1, true, !duel), board = h('div', 'g10-board'), bot = band(0, false, !duel);
      tb.append(top.el, board, bot.el); s.appendChild(tb);
      return { top, board, bot, root: s };
    },
    /** the race's frame: two halves (or one) → [bottom half, top half] */
    splitLayout(duel) {
      const s = S.screen('g10-race');
      const sp = h('div', 'g10-split');
      const halves = [h('div', 'g10-half g10-b')];
      if (duel) halves.push(h('div', 'g10-half g10-t'));
      for (const x of halves.slice().reverse()) sp.appendChild(x);
      s.appendChild(sp);
      return { halves, root: s };
    },
    /** the duel's end: two halves over the finished board (each card turned to its player) → { halves, root } */
    overlaySplit() {
      const ov = h('div', 'g10-ov'); const sp = h('div', 'g10-split');
      const halves = [h('div', 'g10-half g10-b'), h('div', 'g10-half g10-t')];
      sp.append(halves[1], halves[0]); ov.appendChild(sp); el.appendChild(ov);
      return { halves, root: ov };
    },
    /** a short line over a box (a found pair, a round's end); flip: turned to the player across */
    toast(box, html, ms = 1500, flip = false) {
      const t = h('div', 'g10-toast' + (flip ? ' flip' : ''), html);
      box.appendChild(t);
      setTimeout(() => t.remove(), ms);
      return t;
    },
    /** a card inside one half (turned with it): resolves the tapped button's value */
    halfCard(half, html, buttons) {
      const w = h('div', 'g10-halfcard');
      const c = h('div', 'g10-card', html);
      const row = h('div', buttons && buttons.length > 1 ? 'g10-row' : '');
      for (const bt of buttons || []) {
        const b = h('button', bt.gold ? 'g10-cta' : 'g10-sec', `${esc(bt.label)}${bt.sub ? `<small>${esc(bt.sub)}</small>` : ''}`);
        b.type = 'button'; b.dataset.v = bt.value; row.appendChild(b);
      }
      c.appendChild(row); w.appendChild(c); half.appendChild(w);
      let done;
      const p = new Promise((res) => { done = res; w.addEventListener('click', (e) => { const b = e.target.closest('button[data-v]'); if (!b) return; o.sfx && o.sfx('ui'); res(b.dataset.v); }); });
      p.el = w; p.close = () => { w.remove(); done && done(null); };
      return p;
    },
    confirm(text) { return S.card(`<h2>${esc(text)}</h2><p>מה שכבר נעשה נשאר; אפשר לחזור בכל עת.</p>`, [{ value: 'yes', label: 'כן, לצאת', gold: true }, { value: 'no', label: 'להמשיך לשחק' }]).then((v) => v === 'yes'); },
    destroy() { try { el.remove(); } catch (e) { /* */ } },
  };
  /* a player's band: a coloured dot, the name, a line, a score box; the near band carries the exit button */
  function band(i, top, solo) {
    const P = PLAYERS[i];
    const b = h('div', `g10-band ${top ? 'g10-t' : 'g10-b'}${solo ? ' solo' : ''}`);   // (not .top/.bot: page.html and ui.css.js hide a bare .top under body.gm-on — PRODUCER10 N37)
    b.dataset.p = String(i);
    b.innerHTML = `<div class="who"><span class="dot" style="background:${P.color}"></span><div><div class="nm"></div><div class="msg" aria-live="polite"></div></div></div><div class="sc"><b>0</b><small></small></div>`;
    if (!top) { const x = h('button', 'g10-x', 'יציאה'); x.type = 'button'; x.dataset.exit = '1'; b.insertBefore(x, b.firstChild); }
    const q = (s) => b.querySelector(s);
    return {
      el: b,
      set({ name, msg, score, unit, on, color } = {}) {
        if (name != null) q('.nm').textContent = name;
        if (msg != null) q('.msg').textContent = msg;
        if (score != null) q('.sc b').textContent = score;
        if (unit != null) q('.sc small').textContent = unit;
        if (on != null) b.classList.toggle('on', !!on);
        if (color) q('.dot').style.background = color;
      },
    };
  }
  return S;
}

/** the fact box (a draft with its source) */
export function factHTML(f) {
  if (!f || !f.he) return '';
  return `<div class="g10-fact"><b>הידעת?</b> ${esc(f.he)}<span class="g10-src">${esc(f.ref)} <span class="g10-tag">טיוטה</span></span></div>`;
}
