/* ── fable32 (build 28) ── prefs28.js — the player's two switches in the shift: the sound (צליל) and the buzz (רטט); and the shift's
 * own cover over the old Phase B top bar (docs/specs/rohvi-he.md §10, §16; hachraot-he.md "המערכות הרוחביות", 22.10 09:19).
 *   - the sound: the one mute of build 26c (sound.js's sfx.muted, which writes only bh_avodah_mute) — no second key;
 *   - the buzz: bh_haptics ('0' = off; anything else, or nothing, = on). ONE guard over navigator.vibrate, installed once
 *     (installHaptics28): every module of the shift and the interludes calls navigator.vibrate(...) as before; with the switch
 *     off the call stops here and nothing reaches the browser (a vibration under way is cancelled once, with the browser's own 0);
 *   - prefsHTML / bindPrefs: the two toggles (≥ 44 px, RTL) on the lobby's start screen and on the pause card;
 *   - cover28(doc): body.sh28 — the old top bar (⌂, the status, the mute) neither shows nor takes a tap while the shift is on
 *     (the lobby, the day). The first-run name and mishmar screens come before it and keep the bar;
 *   - turnCard / createTurn28: the "turn the phone" card (fable29's, at a portrait start) — and, mid-play, over the paused day: a turn
 *     to portrait no longer leaves for the old Phase B home (avodah/index.js's tick; shift/index.js's SH.turn28).
 * Storage may throw (a private window, a sandboxed frame): the switch then lives in memory for the session. Never a Divine Name. */
export const HAPTICS_KEY = 'bh_haptics';
export const MUTE_KEY = 'bh_avodah_mute';
let mem = null;   // (the switch when the storage cannot keep it)
const ls = () => { try { return globalThis.localStorage || null; } catch (e) { return null; } };
const read = (k) => { try { const s = ls(); return s ? s.getItem(k) : null; } catch (e) { return null; } };
const write = (k, v) => { try { const s = ls(); if (!s) return false; s.setItem(k, v); return true; } catch (e) { return false; } };

/** is the buzz on? (default on) */
export function hapticsOn() {
  const v = read(HAPTICS_KEY);
  if (v != null) return v !== '0';
  return mem == null ? true : !!mem;
}
const G = { nav: null, orig: null, wrapped: null, blocked: 0, passed: 0 };
/** the switch: kept in bh_haptics; off cancels a vibration under way (once, through the browser's own vibrate) */
export function setHaptics(on) {
  on = !!on; mem = on;
  write(HAPTICS_KEY, on ? '1' : '0');
  if (!on && G.orig && G.nav) { try { G.orig.call(G.nav, 0); } catch (e) { /* */ } }
  return on;
}
/** the guard over navigator.vibrate, once per navigator: with the switch off a call returns false and never reaches the browser */
export function installHaptics28(nav = (typeof navigator !== 'undefined' ? navigator : null)) {
  if (!nav) return false;
  if (G.nav === nav && nav.vibrate === G.wrapped) return true;
  const orig = nav.vibrate;
  if (typeof orig !== 'function') return false;   // (no vibration here — iOS Safari: the modules' own checks see none)
  const wrapped = function vibrate28(p) {
    if (!hapticsOn()) { G.blocked++; return false; }
    G.passed++;
    return orig.call(nav, p);   // (the browser's own vibrate, with navigator as its receiver)
  };
  try { Object.defineProperty(nav, 'vibrate', { value: wrapped, configurable: true, writable: true, enumerable: false }); } catch (e) { try { nav.vibrate = wrapped; } catch (e2) { return false; } }
  if (nav.vibrate !== wrapped) return false;
  Object.assign(G, { nav, orig, wrapped });
  try { globalThis.__H28 = haptics28; } catch (e) { /* */ }   // (the browser checks: the guard's counts)
  return true;
}
/** tests: the guard's counts (calls stopped while off · calls let through) */
export const haptics28 = () => ({ on: hapticsOn(), installed: !!(G.nav && G.nav.vibrate === G.wrapped), blocked: G.blocked, passed: G.passed });

/** the sound's state: the kit's own mute when there is a kit, else the key */
export const mutedNow = (sfx) => { try { if (sfx && typeof sfx.muted === 'boolean') return sfx.muted; } catch (e) { /* */ } return read(MUTE_KEY) === '1'; };
function toggleMute(sfx) {
  const m = !mutedNow(sfx);
  try { if (sfx && typeof sfx.muted === 'boolean') { sfx.muted = m; if (!m && sfx.unlock) sfx.unlock(); } else write(MUTE_KEY, m ? '1' : '0'); } catch (e) { write(MUTE_KEY, m ? '1' : '0'); }
  return m;
}

export const PREFS28_CSS = `
body.sh28 .av-top{display:none!important}
.p28-row{display:flex;gap:6px;direction:rtl;pointer-events:auto}
.p28{min-height:44px;min-width:44px;display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:0 10px;border-radius:12px;border:2px solid rgba(255,230,180,.45);background:linear-gradient(180deg,rgba(60,42,16,.82),rgba(28,18,8,.86));color:#FFF6DA;font:800 12px/1 "Heebo",system-ui,sans-serif;cursor:pointer;touch-action:manipulation;box-shadow:0 3px 10px rgba(0,0,0,.35)}
.p28 i{font-style:normal;font-size:18px;line-height:1}
.p28.off{opacity:.78;border-style:dashed}
.p28:active{transform:scale(.95)}
`;
function css(doc) { if (!doc || doc.getElementById('p28-css')) return; const s = doc.createElement('style'); s.id = 'p28-css'; s.textContent = PREFS28_CSS; doc.head.appendChild(s); }
/** the shift is on: the old top bar off (and its CSS in) */
export function cover28(doc = (typeof document !== 'undefined' ? document : null), on = true) {
  if (!doc) return false;
  css(doc);
  try { doc.body.classList.toggle('sh28', !!on); } catch (e) { return false; }
  return true;
}
const one = (kind, sfx) => {
  if (kind === 'mute') { const m = mutedNow(sfx); return `<button class="p28${m ? ' off' : ''}" type="button" data-p28="mute" aria-pressed="${m ? 'false' : 'true'}" aria-label="צליל"><i>${m ? '🔇' : '🔊'}</i><span>${m ? 'צליל כבוי' : 'צליל'}</span></button>`; }
  const h = hapticsOn(); return `<button class="p28${h ? '' : ' off'}" type="button" data-p28="haptics" aria-pressed="${h ? 'true' : 'false'}" aria-label="רטט"><i>${h ? '📳' : '📴'}</i><span>${h ? 'רטט' : 'רטט כבוי'}</span></button>`;
};
/** the two toggles, as HTML (the row) */
export function prefsHTML(sfx, cls = '') { return `<div class="p28-row${cls ? ' ' + cls : ''}" data-p28="row">${one('mute', sfx)}${one('haptics', sfx)}</div>`; }
/** wire the toggles inside root: a tap flips the switch and redraws the button in place; onChange(kind, value) */
export function bindPrefs(root, o = {}) {
  if (!root || !root.querySelectorAll) return 0;
  css(root.ownerDocument || (typeof document !== 'undefined' ? document : null));
  let n = 0;
  root.querySelectorAll('[data-p28=mute],[data-p28=haptics]').forEach((b) => {
    n++;
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const kind = b.dataset.p28;
      const v = kind === 'mute' ? toggleMute(o.sfx) : setHaptics(!hapticsOn());
      try { if (o.sfx && o.sfx.play) o.sfx.play('ui'); } catch (err) { /* */ }   // (the sound back on: its first tap heard; off: silent)
      if (kind === 'haptics' && v) { try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(18); } catch (err) { /* */ } }   // (the buzz back on: one short buzz, its twin the button's redraw)
      const t = b.ownerDocument.createElement('div'); t.innerHTML = one(kind, o.sfx); const nb = t.firstChild;
      if (nb) { b.replaceWith(nb); bindPrefs({ querySelectorAll: () => [nb], ownerDocument: b.ownerDocument }, o); }
      if (o.onChange) { try { o.onChange(kind, v); } catch (err) { /* */ } }
    });
  });
  return n;
}

// ── the "turn the phone" card: fable29's look and words (a portrait window at the start), and mid-play with a line that the day waits ──
export function turnCard(doc, id = 'sh-turn', line = '') {
  const el = doc.createElement('div'); el.id = id; el.dir = 'rtl';
  el.style.cssText = 'position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;background:rgba(28,20,10,.92);color:#FFF4DC;font:600 22px/1.5 Heebo,sans-serif;text-align:center;padding:24px';
  el.innerHTML = `<div><div style="font-size:64px;line-height:1">📱↻</div><div style="margin-top:12px">המשמרת משחקים לרוחב</div><div style="font:500 16px/1.6 Heebo,sans-serif;opacity:.85;margin-top:8px">סובבו את הטלפון — או הרחיבו את החלון במחשב (במסך מלא: F11)</div>${line ? `<div style="font:700 15px/1.5 Heebo,sans-serif;color:#FFD66E;margin-top:10px">${line}</div>` : ''}</div>`;
  el.addEventListener('pointerdown', (e) => e.stopPropagation());
  doc.body.appendChild(el);
  return el;
}
/** mid-play: set(port) — portrait: the card over the day and the day's clock held (E().pause(true), unless the player had paused it:
 *  then it stays his); landscape: the card off and the day on again (only if the card paused it). release(): the player paused while
 *  the card was up — the pause is his now. o = { doc, E: () => the day's engine | null, log(type, data) } */
export function createTurn28(o = {}) {
  let cur = null;
  const doc = o.doc || null, E = () => { try { return o.E ? o.E() : null; } catch (e) { return null; } }, log = (t, d) => { try { if (o.log) o.log(t, d); } catch (e) { /* */ } };
  return {
    get on() { return !!cur; },
    set(port) {
      if (!doc) return false;
      if (port && !cur) {
        const el = turnCard(doc, 'sh-turn28', 'המשחק מחכה — השעון עצר'), e = E();
        let mine = false;
        try { if (e && e.pause && e.state && !e.state().paused) { e.pause(true); mine = true; } } catch (err) { /* */ }
        cur = { el, mine, e };
        log('turn', { port: true, paused: mine });
        return true;
      }
      if (!port && cur) {
        const c = cur; cur = null;
        try { c.el.remove(); } catch (err) { /* */ }
        try { if (c.mine && c.e && c.e === E() && c.e.pause) c.e.pause(false); } catch (err) { /* */ }
        log('turn', { port: false, resumed: !!c.mine });
        return true;
      }
      return false;
    },
    release() { if (cur) cur.mine = false; },
  };
}
