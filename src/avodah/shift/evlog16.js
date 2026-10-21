/* ── fable32 (build 16) ── ── recovered (build 16) ── evlog16.js — the day's event log: each event { t: seconds since the log was first read (to 0.1 s),
 * name, data, at: Date.now() } is kept in localStorage 'mk.evlog' (the last 400; written 2 s after the first new one), and the
 * pause card's "העתק לוג" (hud.js) copies it as JSON { v: 16, n, ev } — what a played day looked like, sent back by the owner.
 * The file's name and its exports' (evlog, copyEvlog) are the recovery's: the bundle kept none. Never a Divine Name. */
const KEY = 'mk.evlog';
let list = null, pending = 0, t0 = 0;
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
function load() {
  if (list) return list;
  list = []; t0 = now();
  try { const a = JSON.parse(localStorage.getItem(KEY) || '[]'); if (Array.isArray(a)) list = a.slice(-400); } catch (e) { /* no storage */ }
  return list;
}
function flush() { pending = 0; try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* not kept */ } }
/** one event (a name, any JSON data) → the log's length */
export function evlog(name, data) {
  const L = load();
  L.push({ t: Math.round((now() - t0) / 100) / 10, name: String(name), data: data === undefined ? null : data, at: Date.now() });
  if (L.length > 400) L.splice(0, L.length - 400);
  if (!pending) { pending = 1; try { setTimeout(flush, 2000); } catch (e) { flush(); } }
  return L.length;
}
const dump = () => JSON.stringify({ v: 16, n: load().length, ev: load() });
/** the log to the clipboard → Promise<true when copied> (a hidden textarea and execCommand where the clipboard API is missing or refuses) */
export function copyEvlog() {
  const text = dump(), byHand = () => {
    try {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(ta); ta.focus(); ta.select();
      const ok = document.execCommand && document.execCommand('copy');
      ta.remove(); return !!ok;
    } catch (e) { return false; }
  };
  try { if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(() => true, () => byHand()); } catch (e) { /* */ }
  return Promise.resolve(byHand());
}
