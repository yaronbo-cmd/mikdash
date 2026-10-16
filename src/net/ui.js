/* ─────────────────────────────────────────────────────────────────────────────
 * net/ui.js — NET10 (wave 10): the screens of "כהנים יחד" (DOM only; the game's tokens --gm-*; Hebrew RTL; 44-px targets).
 *
 *   const ui = createNetUI({ doc, onAction })     onAction(kind, arg): 'host' | 'join' (code) | 'close' | 'leave' | 'cheer' | 'fold' | 'edge'
 *   ui.lobby(o) / ui.lobbyOff()                   the card: status, open a work, the works seen in the room, a code
 *   ui.panel(o) / ui.panelOff()                   the race panel under the top bar (folds to a chip)
 *   ui.plate(x, y, text, sub) / ui.plateOff()     the other kohen's name plate, over his head
 *   ui.edge(x, y, dir, text) / ui.edgeOff()       his chip at the screen's edge when he is out of view (tap: look at him)
 *   ui.float(x, y, text, gold)                    a word that rises and fades (his perfect strike, his stone, a cheer)
 *   ui.menuHTML()                                 the menu's button (a hook may place it; else index.js inserts it)
 * Names come from other players: always textContent, never HTML.
 * ──────────────────────────────────────────────────────────────────────────── */

export const T = {
  mode: 'כהנים יחד',
  menuSub: 'שני כהנים בונים יחד משני מכשירים · טיוטה',
  draft: 'טיוטה',
  host: 'פתח עבודה משותפת',
  join: 'הצטרף',
  joinTo: (n, c) => `הצטרף ל${n ? `־${n}` : 'כהן'} · ${c}`,
  code: 'קוד העבודה (4 ספרות)',
  close: 'סגור',
  leave: 'צא מהעבודה המשותפת',
  leaveShort: 'יציאה',
  leaveSure: 'לצאת? הקש שוב',
  cheer: 'יישר כוח',
  wait: (c) => `ממתינים לכהן השני · קוד ${c}`,
  waitSub: 'בקש ממנו לפתוח "כהנים יחד" במכשיר שלו ולהצטרף',
  you: 'אתה',
  other: 'הכהן השני',
  together: (n) => `יחד: ${n} ${n === 1 ? 'אבן' : 'אבנים'}`,
  stones: 'אבנים', perfect: 'מושלמות', perMin: 'לדקה',
  // the verse over the card (טיוטה). The kohanim built together: Eliashib the high priest and his brothers the kohanim built
  // the Sheep Gate (Nehemiah 3:1 — the city's wall in the days of the Second Temple; our building is the Temple's: illustration)
  verse: 'ויקם אלישיב הכהן הגדול ואחיו הכהנים ויבנו את שער הצאן',
  verseRef: 'נחמיה ג, א',
  how: 'כל אחד בונה במכשיר שלו, ורואה את הכהן השני עובד לידו. כל אבן שאחד מכם מניח נספרת לשניכם, ותחרות ידידותית: מי מדויק יותר (מכות מושלמות) ומי זריז יותר (אבנים לדקה). אין הפסד.',
  status: {
    room: 'מחובר: כל מי שפותח את המשחק בחשבון הזה נמצא כאן',
    mock: 'חיבור מקומי בלבד: לשוניות של אותו דפדפן. בין שני מכשירים המצב עובד בקישור של Claude.',
    none: 'אין כאן חיבור. המצב הזה עובד כשהמשחק פתוח מהקישור של Claude בשני מכשירים של אותו חשבון. המשחק עצמו ממשיך כרגיל.',
    wait: 'מתחבר…',
  },
  seen: 'עבודות פתוחות עכשיו',
  none: 'עוד אין עבודה פתוחה. פתח אחת, או הקלד קוד.',
};

const CSS = `
.nt-hud{position:fixed;inset:0;z-index:19;pointer-events:none;direction:rtl;color:var(--gm-ink,#2A2016);font-family:"Heebo",system-ui,-apple-system,"Segoe UI",Arial,sans-serif;-webkit-tap-highlight-color:transparent}
.nt-hud .nt-anchor{position:absolute;left:0;top:0;will-change:transform}
.nt-plate{font:700 12.5px/1.05 "Heebo",sans-serif;color:#10304F;background:rgba(236,244,252,.9);border:1px solid rgba(47,109,181,.85);border-radius:999px;padding:4px 10px;white-space:nowrap;box-shadow:0 2px 8px rgba(20,40,70,.2);text-align:center}
.nt-plate small{display:block;font:500 10.5px/1.1 "Heebo",sans-serif;color:#2F5A86;margin-top:1px}
.nt-edge{pointer-events:auto;display:flex;align-items:center;gap:4px;min-height:44px;min-width:44px;padding:0 12px;border-radius:999px;background:rgba(236,244,252,.94);border:1px solid rgba(47,109,181,.85);color:#10304F;font:700 13px/1 "Heebo",sans-serif;box-shadow:0 3px 12px rgba(20,40,70,.22);white-space:nowrap}
.nt-float{position:absolute;left:0;top:0;font:800 15px/1 "Heebo",sans-serif;color:#1F4F7A;text-shadow:0 1px 0 #fff,0 0 6px rgba(255,255,255,.8);white-space:nowrap;pointer-events:none;transition:transform 1.1s cubic-bezier(.2,.8,.2,1),opacity 1.1s ease-in}
.nt-float.gold{color:#8A5F0E}
.nt-panel{position:absolute;left:50%;transform:translateX(-50%);top:102px;transition:top .25s ease;width:max-content;max-width:min(94vw,420px);display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none}
.nt-strip{pointer-events:auto;position:relative;display:flex;align-items:center;gap:6px;min-height:34px;max-width:min(94vw,420px);padding:0 12px;border-radius:999px;background:var(--gm-panel,rgba(251,246,236,.92));border:1px solid rgba(47,109,181,.6);box-shadow:0 3px 12px rgba(20,40,70,.16);font:700 12.5px/1 "Heebo",sans-serif;color:inherit;white-space:nowrap}
.nt-strip span{overflow:hidden;text-overflow:ellipsis}
.nt-strip::after{content:"";position:absolute;inset:-5px -2px}
.nt-panel.nt-away{opacity:0;visibility:hidden}
.nt-caret{font-style:normal;font-size:10px;color:var(--gm-soft,#6B5A45)}
.nt-modal.nt-race{place-items:end center;padding:0}
.nt-modal.nt-race .nt-card{width:min(100%,480px);max-height:70vh;border-radius:20px 20px 0 0;padding-bottom:calc(env(safe-area-inset-bottom,0px) + 14px);font:500 13.5px/1.35 "Heebo",sans-serif}
.nt-modal.nt-race .nt-card .gm-btn{margin-top:8px}
.nt-head{display:flex;align-items:center;gap:6px;justify-content:space-between}
.nt-head b{font:800 12.5px/1.1 "Heebo",sans-serif;color:var(--gm-gold,#855E14)}
.nt-dot{display:inline-block;flex:0 0 auto;width:8px;height:8px;border-radius:50%;background:#3C9A5F}
.nt-dot.off{background:#B9A98C}
.nt-tog{font:800 14px/1.2 "Heebo",sans-serif;margin:6px 0 4px;color:var(--gm-ink,#2A2016)}
.nt-row{display:grid;grid-template-columns:1fr auto;gap:0 6px;padding:5px 0;border-top:1px solid var(--gm-line,rgba(120,92,52,.18))}
.nt-row .nm{font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nt-row .nm.him{color:#1F4F7A}
.nt-row .st{grid-column:1 / -1;color:var(--gm-soft,#6B5A45);font-size:12px}
.nt-row .ld{font:700 11px/1.4 "Heebo",sans-serif;color:var(--gm-gold,#855E14);white-space:nowrap}
.nt-line{color:var(--gm-soft,#6B5A45);font-size:12px;margin-top:4px}
.nt-acts{display:flex;gap:6px;margin-top:8px}
.nt-acts .gm-btn{min-height:44px;padding:6px 10px;font-size:14px;flex:1;margin-top:0}
.nt-flash{animation:nt-flash .9s ease-out}
@keyframes nt-flash{0%{box-shadow:0 0 0 4px rgba(232,185,74,.55),var(--gm-shadow,0 8px 26px rgba(40,28,12,.18))}100%{box-shadow:var(--gm-shadow,0 8px 26px rgba(40,28,12,.18))}}
.nt-modal{position:fixed;inset:0;z-index:40;display:grid;place-items:center;padding:16px;background:var(--gm-scrim,rgba(24,18,10,.42));direction:rtl;color:var(--gm-ink,#2A2016);font-family:"Heebo",system-ui,sans-serif}
.nt-card{width:min(100%,440px);max-height:calc(100vh - 32px);overflow-y:auto;background:var(--gm-solid,#FBF6EC);border:1px solid var(--gm-line,rgba(120,92,52,.22));border-radius:20px;box-shadow:var(--gm-shadow,0 8px 26px rgba(40,28,12,.18));padding:16px 16px 14px}
.nt-card h2{margin:2px 0 6px;font:800 21px/1.2 "Heebo",sans-serif}
.nt-kick{font:700 12px/1 "Heebo",sans-serif;color:var(--gm-gold,#855E14);display:flex;gap:6px;align-items:center}
.nt-tag{font:700 10.5px/1 "Heebo",sans-serif;border:1px solid currentColor;border-radius:999px;padding:3px 7px;color:var(--gm-blue,#1F4F7A)}
.nt-verse{margin:8px 0 2px;font:600 14px/1.45 "Heebo",sans-serif}
.nt-ref{font-size:11.5px;color:var(--gm-soft,#6B5A45)}
.nt-p{margin:8px 0;font-size:13.5px;line-height:1.5;color:var(--gm-soft,#6B5A45)}
.nt-st{margin:8px 0;font-size:12.5px;line-height:1.45;padding:8px 10px;border-radius:10px;background:var(--gm-raise,#FFFDF8);border:1px solid var(--gm-line,rgba(120,92,52,.18))}
.nt-sec{margin:12px 0 6px;font:800 12px/1 "Heebo",sans-serif;color:var(--gm-gold,#855E14)}
.nt-card .gm-btn{width:100%;margin:6px 0 0;min-height:48px;font-size:15px}
.nt-code{display:flex;gap:8px;margin-top:6px}
.nt-code input{flex:1;min-width:0;min-height:48px;border-radius:12px;border:1px solid var(--gm-line,rgba(120,92,52,.3));background:var(--gm-raise,#FFFDF8);color:inherit;font:700 20px/1 "Heebo",sans-serif;text-align:center;letter-spacing:6px;direction:ltr}
.nt-code .gm-btn{width:auto;margin:0;flex:0 0 auto;min-width:88px}
.nt-err{color:var(--gm-red,#A3261F);font-size:12.5px;min-height:1em;margin-top:4px}
`;

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (n, d = 0) => (Number.isFinite(n) ? (d ? n.toFixed(d) : String(Math.round(n))) : '0');

/** the game's pointer on screen (the gold arrow and its ring: .gm-mark is a zero-size anchor, its parts carry the size) */
export function markRect(doc = document) {
  const mk = doc.querySelector('.gm .gm-mark');
  if (!mk || mk.classList.contains('gm-hidden') || mk.style.opacity === '0') return null;
  let r = null;
  for (const e of mk.querySelectorAll('.gm-mark-ring, .gm-mark-ptr')) {
    const b = e.getBoundingClientRect(); if (!(b.width > 0)) continue;
    r = r ? { left: Math.min(r.left, b.left), top: Math.min(r.top, b.top), right: Math.max(r.right, b.right), bottom: Math.max(r.bottom, b.bottom) } : { left: b.left, top: b.top, right: b.right, bottom: b.bottom };
  }
  return r;
}

export function createNetUI({ doc = document, onAction = () => {} } = {}) {
  let hud = null, plateEl = null, edgeEl = null, panelEl = null, modalEl = null, folded = true, lastPanel = '';
  function css() {
    if (doc.getElementById('nt-css')) return;
    const st = doc.createElement('style'); st.id = 'nt-css'; st.textContent = CSS; doc.head.appendChild(st);
  }
  function root() {
    if (hud && hud.isConnected) return hud;
    css();
    hud = doc.createElement('div'); hud.className = 'nt-hud'; hud.setAttribute('aria-live', 'polite');
    doc.body.appendChild(hud);
    plateEl = edgeEl = panelEl = null;
    return hud;
  }
  const act = (kind, arg) => { try { onAction(kind, arg); } catch (e) { console.warn('[net] action', e); } };

  /* ── the lobby card ── */
  function lobby(o = {}) {
    css();
    if (!modalEl || !modalEl.isConnected) {
      modalEl = doc.createElement('div'); modalEl.className = 'nt-modal'; modalEl.setAttribute('role', 'dialog'); modalEl.setAttribute('aria-modal', 'true');
      doc.body.appendChild(modalEl);
      modalEl.addEventListener('click', (e) => {
        const b = e.target.closest('[data-nt]'); if (!b) { if (e.target === modalEl) act('close'); return; }
        const k = b.dataset.nt;
        if (k === 'code') { const inp = modalEl.querySelector('input'); act('join', inp ? inp.value : ''); }
        else act(k, b.dataset.code || '');
      });
      modalEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') act('join', e.target.value); });
    }
    const kind = o.kind || 'wait';
    const works = (o.works || []).slice(0, 4);
    const key = JSON.stringify([kind, works, o.err || '']);
    if (key === modalEl.dataset.key) return;                         // (the room changes often: re-render only what changed)
    modalEl.dataset.key = key;
    const old = modalEl.querySelector('input'), typed = old ? old.value : '', focused = !!old && doc.activeElement === old;
    let h = `<div class="nt-card"><div class="nt-kick">${esc(T.mode)} <span class="nt-tag">${T.draft}</span></div><h2>${esc(T.mode)}</h2>`;
    h += `<div class="nt-verse">"${esc(T.verse)}"</div><div class="nt-ref">${esc(T.verseRef)} · ${T.draft}</div>`;
    h += `<p class="nt-p">${esc(T.how)}</p>`;
    h += `<div class="nt-st">${esc(T.status[kind] || T.status.wait)}</div>`;
    if (kind === 'room' || kind === 'mock') {
      h += `<button class="gm-btn gm-btn-gold" data-nt="host">${esc(T.host)}</button>`;
      h += `<div class="nt-sec">${esc(T.seen)}</div>`;
      h += works.length ? works.map((w) => `<button class="gm-btn" data-nt="join" data-code="${esc(w.code)}"></button>`).join('') : `<div class="nt-p" style="margin:4px 0">${esc(T.none)}</div>`;
      h += `<div class="nt-sec">${esc(T.code)}</div><div class="nt-code"><input inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" aria-label="${esc(T.code)}"><button class="gm-btn" data-nt="code">${esc(T.join)}</button></div>`;
      h += `<div class="nt-err" role="status">${esc(o.err || '')}</div>`;
    }
    h += `<button class="gm-btn" data-nt="close">${esc(T.close)}</button></div>`;
    modalEl.innerHTML = h;
    // (the names come from other players: text only)
    modalEl.querySelectorAll('[data-nt="join"]').forEach((b, i) => { b.textContent = T.joinTo(works[i].name, works[i].code); });
    const inp = modalEl.querySelector('input'); if (inp && typed) inp.value = typed;
    if (inp && focused) inp.focus({ preventScroll: true });
  }
  function lobbyOff() { if (modalEl) { modalEl.remove(); modalEl = null; } }
  const lobbyOn = () => !!(modalEl && modalEl.isConnected);

  /* ── the race panel: a slim strip under the goal pill (never over the play); a tap opens the details ── */
  let leaveArmed = 0, raceEl = null;
  function onTap(e) {
    const b = e.target.closest('[data-nt]');
    if (!b) { if (e.target === raceEl) { folded = true; lastPanel = ''; } return; }   // (the scrim: the card closes)
    if (b.dataset.nt === 'fold') { folded = !folded; lastPanel = ''; act('fold', folded); return; }
    // leaving asks once more (a second tap within 8 s — a child's second tap can be slow): the work is shared, a stray tap should
    // not end it
    if (b.dataset.nt === 'leave' && !(Date.now() - leaveArmed < 8000)) { leaveArmed = Date.now(); b.textContent = T.leaveSure; return; }
    if (b.dataset.nt === 'leave') { leaveArmed = 0; folded = true; lastPanel = ''; }
    act(b.dataset.nt, b.dataset.code || '');
  }
  /* The strip lives in the HUD; its details are a card over the world (the game's own sheets and cards work this way): opened
     by the player's tap on the strip (or the menu's "כהנים יחד"), closed by ✕, the scrim, or leaving. Live while open. */
  // (a finger on the strip or the card: their buttons are never replaced under it — the stats change every few seconds, and a
  //  re-render between the finger's down and up lost the tap: "יציאה" had to be tapped again and again on a slow phone)
  let pressing = false, pressAt = 0;
  const handsOn = () => pressing || Date.now() - pressAt < 450;
  function guardTaps(el) {
    el.addEventListener('pointerdown', () => { pressing = true; }, true);
    const up = () => { pressing = false; pressAt = Date.now(); };
    el.addEventListener('pointerup', up, true); el.addEventListener('pointercancel', up, true);
  }
  function panel(o) {
    const r = root();
    if (!panelEl || !panelEl.isConnected) {
      panelEl = doc.createElement('div'); panelEl.className = 'nt-panel'; panelEl.setAttribute('role', 'region'); panelEl.setAttribute('aria-label', T.mode);
      r.appendChild(panelEl); lastPanel = ''; guardOn();
      panelEl.addEventListener('click', onTap); guardTaps(panelEl);
    }
    // under the goal pill (and whatever the game shows under it), and under the game's toasts while one is shown: a toast
    // is the game speaking — the strip slides below it, never under it (a tap on the strip must reach the strip)
    const goal = doc.querySelector('.gm .gm-goal'), toasts = doc.querySelector('.gm .gm-toasts');
    let gb = goal ? goal.getBoundingClientRect().bottom : 0;
    if (toasts && toasts.children.length) { const tb = toasts.getBoundingClientRect(); if (tb.height > 4) gb = Math.max(gb, tb.bottom); }
    const top = Math.round(Math.max(96, Math.min(360, gb + 6)));
    if (panelEl.style.top !== top + 'px') panelEl.style.top = top + 'px';
    away();
    const armed = Date.now() - leaveArmed < 8000;
    const key = JSON.stringify([o, folded, armed]);
    if (key === lastPanel) return;
    if (handsOn()) return;   // (drawn on the next frame after the finger is up)
    lastPanel = key;
    const strip = o.wait ? T.wait(o.code) : `${T.together(o.total)} · ${T.you} ${num(o.me.stones)}${o.him ? ` · ${o.him.name} ${num(o.him.stones)}` : ''}`;
    panelEl.innerHTML = `<button class="nt-strip" data-nt="fold" aria-expanded="${folded ? 'false' : 'true'}"><i class="nt-dot${o.live ? '' : ' off'}"></i><span></span><i class="nt-caret">▾</i></button>`;
    panelEl.querySelector('.nt-strip span').textContent = strip;          // (his name is another player's text)
    panelEl.querySelector('.nt-strip').setAttribute('aria-label', `${T.mode}: ${strip}`);
    if (folded) { if (raceEl) { raceEl.remove(); raceEl = null; } return; }
    if (!raceEl || !raceEl.isConnected) {
      css();
      raceEl = doc.createElement('div'); raceEl.className = 'nt-modal nt-race'; raceEl.setAttribute('role', 'dialog'); raceEl.setAttribute('aria-modal', 'true'); raceEl.setAttribute('aria-label', T.mode);
      doc.body.appendChild(raceEl);
      raceEl.addEventListener('click', onTap); guardTaps(raceEl);
    }
    let h = `<div class="nt-card nt-more"><div class="nt-head"><b>${esc(T.mode)} · ${esc(o.code)}</b><span class="nt-tag">${T.draft}</span></div>`;
    if (o.wait) {
      h += `<div class="nt-tog">${esc(T.wait(o.code))}</div><div class="nt-p">${esc(T.waitSub)}</div>`;
      if (o.offer) h += `<button class="gm-btn" data-nt="join" data-code="${esc(o.offer.code)}"></button>`;
    } else {
      h += `<div class="nt-tog">${esc(T.together(o.total))}</div>`;
      for (const k of ['me', 'him']) {
        const x = o[k]; if (!x) continue;
        h += `<div class="nt-row" data-who="${k}"><span class="nm${k === 'him' ? ' him' : ''}"></span><span class="ld">${esc(x.lead || '')}</span>`
          + `<span class="st">${num(x.stones)} ${x.stones === 1 ? 'אבן' : T.stones} · ${num(x.perfect)} ${x.perfect === 1 ? 'מושלמת' : T.perfect}${x.acc != null ? ` (${num(x.acc)}%)` : ''} · ${num(x.spm, 1)} ${T.perMin}</span></div>`;
      }
      h += `<div class="nt-line"></div>`;
    }
    h += `<div class="nt-acts">${o.wait ? '' : `<button class="gm-btn gm-btn-gold" data-nt="cheer">${esc(T.cheer)}</button>`}<button class="gm-btn" data-nt="leave">${esc(armed ? T.leaveSure : T.leaveShort)}</button></div>`;
    h += `<button class="gm-btn" data-nt="fold">${esc(T.close)}</button></div>`;
    raceEl.innerHTML = h;
    const jb = raceEl.querySelector('[data-nt="join"]'); if (jb && o.offer) jb.textContent = T.joinTo(o.offer.name, o.offer.code);
    const nm = (k, t) => { const e = raceEl.querySelector(`[data-who="${k}"] .nm`); if (e) e.textContent = t; };
    nm('me', o.me ? o.me.name : ''); nm('him', o.him ? o.him.name : '');
    const ln = raceEl.querySelector('.nt-line'); if (ln && !o.wait) ln.textContent = o.line || '';
  }
  /* the game's pointer (the gold arrow and ring) always wins: when it comes near the strip, the strip steps out of its way —
     checked every frame while the strip is up, so a tap on the pointer never lands on the strip */
  const meets = (a, b, mx = 12, my = 16) => a.left < b.right + mx && a.right > b.left - mx && a.top < b.bottom + my && a.bottom > b.top - my;
  function away() {
    if (!panelEl || !panelEl.isConnected) return;
    const a = markRect(doc);
    const clash = !!a && meets(a, panelEl.getBoundingClientRect());
    if (panelEl.classList.contains('nt-away') !== clash) panelEl.classList.toggle('nt-away', clash);
  }
  let rafOn = false;
  function loop() { if (!panelEl || !panelEl.isConnected) { rafOn = false; return; } away(); requestAnimationFrame(loop); }
  function guardOn() { if (!rafOn && typeof requestAnimationFrame === 'function') { rafOn = true; requestAnimationFrame(loop); } }
  /** open the details (a partner arrives, the player asks) */
  function more(on = true) { folded = !on; lastPanel = ''; }
  function flash() { const e = panelEl && panelEl.querySelector('.nt-strip'); if (!e) return; e.classList.remove('nt-flash'); void e.offsetWidth; e.classList.add('nt-flash'); }
  function panelOff() { if (panelEl) { panelEl.remove(); panelEl = null; lastPanel = ''; } if (raceEl) { raceEl.remove(); raceEl = null; } folded = true; }

  /* ── his plate, his edge chip, the floats ── */
  function plate(x, y, text, sub) {
    const r = root();
    if (!plateEl || !plateEl.isConnected) { plateEl = doc.createElement('div'); plateEl.className = 'nt-anchor nt-plate'; plateEl.setAttribute('aria-hidden', 'true'); plateEl.innerHTML = '<span></span><small></small>'; r.appendChild(plateEl); }
    const a = plateEl.firstChild, b = plateEl.lastChild;
    if (a.textContent !== text) a.textContent = text;
    if (b.textContent !== (sub || '')) b.textContent = sub || '';
    b.style.display = sub ? '' : 'none';
    plateEl.style.display = '';
    plateEl.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px) translate(-50%,-100%)`;
  }
  function plateOff() { if (plateEl) plateEl.style.display = 'none'; }
  function edge(x, y, dir, text) {
    const r = root();
    if (!edgeEl || !edgeEl.isConnected) {
      edgeEl = doc.createElement('button'); edgeEl.className = 'nt-anchor nt-edge'; edgeEl.type = 'button';
      edgeEl.addEventListener('click', () => act('edge'));
      r.appendChild(edgeEl);
    }
    const t = dir < 0 ? `‹ ${text}` : `${text} ›`;
    if (edgeEl.textContent !== t) { edgeEl.textContent = t; edgeEl.setAttribute('aria-label', `${text}: הצג אותו`); }
    edgeEl.style.display = '';
    // (the game's pointer always wins: near it, the chip is not shown)
    const a = markRect(doc);
    if (a && x + 80 > a.left - 10 && x - 80 < a.right + 10 && y + 30 > a.top - 10 && y - 30 < a.bottom + 10) y = a.top - 44 > 130 ? a.top - 44 : a.bottom + 44;   // (the pointer wins: the chip steps above or below it)
    // (never over the race panel: below it when they would meet)
    if (panelEl && panelEl.isConnected) { const r = panelEl.getBoundingClientRect(); if (Math.abs(x - (r.left + r.width / 2)) < r.width / 2 + 70 && y > r.top - 26 && y < r.bottom + 26) y = r.bottom + 34; }
    edgeEl.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px) translate(-50%,-50%)`;
  }
  function edgeOff() { if (edgeEl) edgeEl.style.display = 'none'; }
  function float(x, y, text, gold) {
    const r = root();
    const f = doc.createElement('div'); f.className = 'nt-float' + (gold ? ' gold' : ''); f.textContent = text;
    f.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px) translate(-50%,-100%)`;
    r.appendChild(f);
    requestAnimationFrame(() => requestAnimationFrame(() => { f.style.transform = `translate(${Math.round(x)}px,${Math.round(y - 46)}px) translate(-50%,-100%)`; f.style.opacity = '0'; }));
    setTimeout(() => f.remove(), 1300);
  }
  function menuHTML() {
    return `<button class="gm-btn gm-btn-block" data-net="open" style="width:100%;margin:0 0 10px">${esc(T.mode)}<small style="display:block;font-weight:500;font-size:12px;opacity:.85">${esc(T.menuSub)}</small></button>`;
  }
  function destroy() { lobbyOff(); panelOff(); if (hud) { hud.remove(); hud = null; } plateEl = edgeEl = null; }
  return { lobby, lobbyOff, get lobbyOn() { return lobbyOn(); }, panel, more, panelOff, flash, plate, plateOff, edge, edgeOff, float, menuHTML, destroy, get folded() { return folded; } };
}
