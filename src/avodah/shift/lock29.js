/* ── fable32 (build 29) ── lock29.js — the Shabbat and Yom Tov lock's screen and its watch, the "מכאן — המקדש עכשיו" card, the calm line
 * (HANDOFF rule 16; docs/specs/rohvi-he.md §1–§2; the owner 22.10 08:15 / 08:18 / 08:59). The times are time29.js's.
 *   - lockHTML29(s, w, sfx): the lock screen over the lobby's court at rest — "שבת שלום" / "חג שמח" / "גמר חתימה טובה", "המקדש ייפתח במוצאי
 *     …, בשעה HH:MM" (the time only, no countdown), "בירושלים כבר נכנסה השבת" when Jerusalem's began earlier, the verse (טיוטה), the
 *     two switches (צליל, רטט). No door to play.
 *   - hereHTML29(tn, w, now): the second door's card — the Temple's service now and next by the sun where the phone is; the chambers
 *     to visit from here come later (a visible lock, no countdown); no rewards.
 *   - nowLineHTML29(tn, soft): the start screen's line "עכשיו במקדש: …" (and at night the guards, Middot 1:1), and the calm line.
 *   - softDay29(doc, line): the calm line over the day (under its top bar); createWatch29(o): the watch — at the lock the day is saved
 *     as it is (its own saveState: "המשך יום N" goes on after), stopped, and the lock screen shown; at its end the lobby again.
 * Every text a draft (טיוטה + source, or המחשה); ≥ 44-px targets; RTL; never a Divine Name. ── /fable32 ── */
import { status29, softLine29, lockText29, clock29, where29, hm29 } from './time29.js';
import { prefsHTML } from './prefs28.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
/** the chambers the second door will lead to (build 32 on: the hooks of time-gating-hooks-he.md) — ── fable32 (build 33) ── לשכת הטלאים is
 *  open (chamber33.js's door, given to hereHTML29 as o.door); the wood chamber stays "בקרוב" ── /fable32 ── */
export const SOON29 = Object.freeze(['לשכת העצים']);

export const LOCK29_CSS = `
.lb .lb-now{position:absolute;top:calc(max(6px,env(safe-area-inset-top)) + 30px);left:50%;transform:translateX(-50%);max-width:min(64vw,520px);display:flex;flex-direction:column;align-items:center;gap:3px;pointer-events:none}
.lb .lb-now div{padding:3px 12px;border-radius:999px;background:rgba(20,14,6,.58);border:1px solid rgba(255,220,150,.3);font:800 12px/1.3 "Heebo",system-ui,sans-serif;text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lb .lb-now small{font:700 10px/1 "Heebo",system-ui,sans-serif;opacity:.7}
.lb .lb-now .lb-soft{background:rgba(70,48,12,.82);border-color:rgba(255,214,110,.6);color:#FFE7A6;font-size:13px}
.lb .lb-here{min-height:44px}
.lb .lb-play .lb-k{display:block;font:900 11px/1.1 "Heebo",system-ui,sans-serif;opacity:.78;margin:0 0 3px}
.lb .p28.lb-loc span{white-space:nowrap}
@media (max-width:700px){.lb .p28.lb-loc:not(.msg) span{display:none}}
.lb .lk-here{text-align:right;padding:6px 12px 8px}
.lb .lk-here h2{text-align:center;font-size:18px}.lb .lk-here>p{text-align:center;margin:1px 0 4px;font-size:10px}
.lb .lk-row{display:flex;gap:8px;align-items:baseline;font:800 13px/1.25 "Heebo",system-ui,sans-serif;padding:2px 0;border-top:1px solid rgba(255,230,180,.15)}
.lb .lk-row b{flex:none;min-width:58px;color:#FFD66E;font-weight:900}.lb .lk-row span{flex:1}.lb .lk-row small{display:block;font:700 10px/1.2 "Heebo",system-ui,sans-serif;opacity:.7}
.lb .lk-end{display:flex;gap:8px;align-items:stretch;margin-top:5px}
.lb .lk-soon{flex:1;display:flex;align-items:center;justify-content:center;padding:4px 10px;border-radius:12px;border:2px dashed rgba(255,230,180,.4);font:800 12px/1.3 "Heebo",system-ui,sans-serif;opacity:.85;text-align:center}
.lb .lk-end .lb-pkx{margin-top:0;min-width:96px}
.lb .lk-end .lk-ch{flex:1.4;min-height:48px;border-color:#FFD66E;background:linear-gradient(180deg,rgba(120,84,20,.92),rgba(70,46,10,.94))}.lb .lk-end .lk-ch small{white-space:nowrap}   /* ── fable32 (build 33) ── (לשכת הטלאים, open) ── */
.lb.lb-lock{z-index:9100}
.lb-on .tw-lift{display:none!important}
.lb.lb-lock .lk-card{position:absolute;bottom:max(10px,env(safe-area-inset-bottom));left:max(12px,env(safe-area-inset-left));width:min(440px,calc(100vw - 210px));box-sizing:border-box;padding:10px 16px;border-radius:18px;border:2px solid rgba(255,222,150,.55);background:linear-gradient(180deg,rgba(40,28,12,.8),rgba(20,13,5,.84));text-align:center;box-shadow:0 8px 28px rgba(0,0,0,.45);pointer-events:auto}
.lb.lb-lock .lk-card h2{margin:0;font:900 30px/1.12 "Heebo",system-ui,sans-serif;color:#FFE7A6;text-shadow:0 2px 10px rgba(0,0,0,.5)}
.lb.lb-lock .lk-name{font:800 12px/1.2 "Heebo",system-ui,sans-serif;opacity:.75;margin-top:2px}
.lb.lb-lock .lk-open{font:800 16px/1.35 "Heebo",system-ui,sans-serif;margin-top:6px}
.lb.lb-lock .lk-jer{font:800 13px/1.3 "Heebo",system-ui,sans-serif;color:#FFD66E;margin-top:3px}
.lb.lb-lock .lk-v{font:700 14px/1.45 "Frank Ruhl Libre","David Libre","Heebo",serif;margin-top:6px;opacity:.92}
.lb.lb-lock .lk-v small{font:700 10px/1 "Heebo",system-ui,sans-serif;opacity:.75;white-space:nowrap}
.lb.lb-lock .lk-f{font:700 10px/1.25 "Heebo",system-ui,sans-serif;opacity:.6;margin-top:4px}
.lb.lb-lock .lb-side{position:absolute;right:max(8px,env(safe-area-inset-right));bottom:calc(max(10px,env(safe-area-inset-bottom)) + 14px);top:auto;left:auto}
.lb.lb-lock .lb-side .p28 span{display:inline}
@media (orientation:portrait){.lb.lb-lock{background:linear-gradient(180deg,#34260F,#120C05)}.lb.lb-lock .lk-card{bottom:auto;top:22%;left:50%;transform:translateX(-50%);width:calc(100vw - 24px)}}
@media (max-height:340px){.lb.lb-lock .lk-card{padding:7px 12px}.lb.lb-lock .lk-card h2{font-size:26px}.lb.lb-lock .lk-open{font-size:15px;margin-top:3px}.lb.lb-lock .lk-v{margin-top:3px}}
#s29-soft{position:fixed;left:50%;transform:translateX(-50%);z-index:29;pointer-events:none;padding:4px 12px;border-radius:999px;background:rgba(40,28,10,.8);border:1px solid rgba(255,214,110,.55);color:#FFE7A6;font:800 13px/1.25 "Heebo",system-ui,sans-serif;direction:rtl;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,.3)}
.sh-pause .sh-note29{margin:4px 0 0;font:800 13px/1.3 "Heebo",system-ui,sans-serif;color:#FFE7A6}
`;
export function css29(doc) { if (!doc || !doc.getElementById || doc.getElementById('lk29-css')) return; const s = doc.createElement('style'); s.id = 'lk29-css'; s.textContent = LOCK29_CSS; doc.head.appendChild(s); }

const whereHe = (w) => (w && w.source === 'gps' ? 'לפי מיקום הטלפון' : w && w.source === 'tz' ? `לפי ${w.city}${w.approx ? ' (משוער, לפי אזור הזמן)' : ''}` : 'לפי ירושלים');
/** the lock screen (inside the lobby's root, class lb-lock) */
export function lockHTML29(s, w, sfx) {
  const L = lockText29(s, w);
  if (!L) return '';
  return `<div class="lk-card" role="status" aria-live="polite">
      <h2>${esc(L.greet)}</h2><div class="lk-name">${esc(L.name)}</div>
      <div class="lk-open">${esc(L.open)}</div>
      ${L.jer ? `<div class="lk-jer">${esc(L.jer)}</div>` : ''}
      ${L.verse ? `<div class="lk-v">"${esc(L.verse)}" <small>— ${esc(L.src)} · טיוטה</small></div>` : ''}
      <div class="lk-f">המקדש נח — המשחק שומר שבת וחג · הזמנים ${esc(whereHe(w))}${w && w.israel ? '' : ' · חוץ לארץ: גם יום טוב שני'} · טיוטה</div>
    </div>
    <div class="lb-side">${prefsHTML(sfx)}</div>`;
}
/** the start screen's line(s): the Temple now, at night its guards, and the calm line before the lock */
export function nowLineHTML29(tn, soft) {
  if (!tn && !soft) return '';
  const src = tn && tn.src ? tn.src.split('; ')[0] : '';
  return `<div class="lb-now" data-lb29="now">${tn ? `<div>${esc(tn.line)} <small>· ${src ? `${esc(src)} · טיוטה` : 'המחשה'}</small></div>` : ''}${tn && tn.night ? `<div>${esc(tn.night.text.split(' — ')[0])} <small>· ${esc(tn.night.src)} · טיוטה</small></div>` : ''}${soft ? `<div class="lb-soft" data-lb29="soft">${esc(soft)}</div>` : ''}</div>`;
}
/** the second door: "מכאן — המקדש עכשיו" */
export const hereDoor29 = () => `<button class="lb-door lb-here" type="button" data-lb="here"><i>🕍</i><span><b>מכאן — המקדש עכשיו</b><small>מה קורה עכשיו במקדש, ומה אחר כך</small></span></button>`;
/** its card: now, next (times by the sun where the phone is), the chambers to come (a visible lock) — ── fable32 (build 33) ── and the
 *  open ones (o.door: לשכת הטלאים) ── /fable32 ── */
export function hereHTML29(tn, w, now = clock29(), o = {}) {
  const t = tn || { current: null, next: [], night: null };
  const row = (k, e) => `<div class="lk-row"><b>${esc(k)}</b><span>${esc(e.name)}<small>${esc(e.src)} · טיוטה</small></span></div>`;
  const nowRow = t.current ? row('עכשיו', t.current) : `<div class="lk-row"><b>עכשיו</b><span>בין העבודות<small>המחשה</small></span></div>`;
  const night = t.night ? `<div class="lk-row"><b>בלילה</b><span>${esc(t.night.text)}<small>"${esc(t.night.quote)}" — ${esc(t.night.src)} · טיוטה</small></span></div>` : '';
  const next = (t.next || []).map((e) => row(`${e.approx ? '≈ ' : ''}${e.hm}`, e)).join('');
  return `<div class="lb-pk" role="dialog" aria-label="המקדש עכשיו"><div class="lb-pkc lk-here">
      <h2>המקדש עכשיו · ${esc(hm29(now, (w && w.tz) || 'Asia/Jerusalem'))}</h2>
      <p>${esc(whereHe(w))} · ≈ שעה משוערת: המשנה קובעת את הסדר, לא את הדקה · טיוטה</p>
      ${nowRow}${night}${next}
      <div class="lk-end">${o.door || ''}<div class="lk-soon">🔒 בקרוב${o.door ? '' : ' מכאן'}: ${SOON29.map(esc).join(' · ')}</div><button class="lb-pkx" type="button" data-lb="here:close">סגור</button></div>
    </div></div>`;
}
/** the "מיקום מדויק" switch (off by default; ≥ 44 px) */
// ── fable32 (build 34) ── (on a phone ≤ 700 px wide the button is its 📍 alone — its words reached the kohen's feet and his ring on the
// opening screen at 640×296; a message while it asks — "מאתר…" — still shows: .msg) ── /fable32 ──
export function locButton29(on, msg) {
  return `<button class="p28 lb-loc${on ? '' : ' off'}${msg ? ' msg' : ''}" type="button" data-lb="loc" aria-pressed="${on ? 'true' : 'false'}" aria-label="מיקום מדויק"><i>📍</i><span>${esc(msg || (on ? 'מיקום מדויק ✓' : 'מיקום מדויק'))}</span></button>`;
}

/** the calm line over the day, under its top bar (focus17's); '' takes it off */
export function softDay29(doc, line) {
  if (!doc || !doc.getElementById) return null;
  let el = doc.getElementById('s29-soft');
  if (!line) { if (el) el.remove(); return null; }
  css29(doc);
  if (!el) { el = doc.createElement('div'); el.id = 's29-soft'; el.setAttribute('role', 'status'); doc.body.appendChild(el); }
  if (el.textContent !== line) el.textContent = line;
  let top = 58;
  try { const b = doc.querySelector && doc.querySelector('.f17-top'); const r = b && b.getBoundingClientRect ? b.getBoundingClientRect() : null; if (r && r.height > 0) top = Math.round(r.bottom + 6); } catch (e) { /* */ }
  el.style.top = `${top}px`;
  return el;
}
/** the interludes (their roots over the court) leave with the lock — their round is a round, nothing of the player's is lost */
export function dropGames29(doc) {
  let n = 0;
  try { if (doc && doc.querySelectorAll) doc.querySelectorAll('.tl, .pn, .m3').forEach((e) => { e.remove(); n++; }); } catch (e) { /* */ }
  return n;
}
/** the day saved exactly as it is (day33's own saveState — "המשך יום N" goes on with it, build 28's no-expiry save) */
export function saveDay29(E) {
  try { if (E && E.debug && typeof E.debug.saveState === 'function') { E.debug.saveState('lock29'); return true; } } catch (e) { /* */ }
  return false;
}
/**
 * The watch: call check() every few seconds (and before opening the lobby or the day).
 * o = { now(), where(), active() (the shift is up), E() (the day's engine or null), persist(), stop() (the day and the lobby off),
 *       show(s) (the lock screen), refresh(s), hide(), reopen(), soft(line), log(type, data) }
 */
export function createWatch29(o = {}) {
  let up = null, softNow = '';
  const call = (f, ...a) => { try { return f ? f(...a) : undefined; } catch (e) { return undefined; } };
  const soft = (line) => { if (line === softNow) return; softNow = line; call(o.soft, line); };
  function check(force = false) {
    if (!force && o.active && !o.active()) return up;   // (the first-run name and mishmar screens: the lobby's gate takes it from there)
    let s;
    try { s = status29(o.now ? o.now() : clock29(), o.where ? o.where() : where29()); } catch (e) { return up; }
    if (s.locked) {
      if (!up) {
        up = s;
        const E = call(o.E);
        const saved = E ? saveDay29(E) : false;
        call(o.persist);
        soft('');
        call(o.stop);
        call(o.show, s);
        call(o.log, 'lock29', { kind: s.kind, name: s.name, saved, opens: hm29(s.opensAt, s.tz) });
      } else { up = s; call(o.refresh, s); }
      return s;
    }
    if (up) { up = null; call(o.hide); call(o.log, 'unlock29', {}); call(o.reopen); }
    soft(softLine29(s));
    return s;
  }
  return { check, get locked() { return !!up; }, get status() { return up; }, get softLine() { return softNow; } };
}
