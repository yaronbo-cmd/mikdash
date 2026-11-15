/* ── build 129 ── h129/ui7.js — the stage's small words over the world: a part of a film that a tap ends, a card (title, lines), the
 * mishnah's words with their source on a line of their own. Shared by the pack and its acts. */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const beat = (X, ms) => (X && X.wait ? X.wait(ms / 1000) : sleep(ms));
/** a tap anywhere (or `ms`) ends a part of a film */
export function tapOr(X, ms) {
  return new Promise((res) => {
    let done = false; const f = () => { if (done) return; done = true; removeEventListener('pointerdown', f, true); res(true); };
    setTimeout(() => addEventListener('pointerdown', f, true), 250);
    beat(X, ms).then(() => { if (!done) { done = true; removeEventListener('pointerdown', f, true); res(false); } });
  });
}
/** a card over the world: title, lines; a tap or `ms` closes it */
export function card(X, html, ms = 7000) {
  const el = document.createElement('div'); el.className = 'h109-ui h129-card';
  el.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);max-width:min(600px,88vw);padding:18px 22px;border-radius:16px;background:rgba(255,248,230,.96);color:#3A2608;font:600 17px/1.5 Heebo,system-ui;direction:rtl;text-align:center;z-index:70;box-shadow:0 6px 24px rgba(0,0,0,.35)';
  el.innerHTML = html; document.body.appendChild(el);
  return tapOr(X, ms).then(() => { el.remove(); });
}
export const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export const cite = (s) => { const m = String(s).match(/^(.*)\s\(([^()]*)\)$/); return m ? `<p style="margin:10px 0">${esc(m[1])}</p><small>(${esc(m[2])})</small>` : `<p>${esc(s)}</p>`; };

