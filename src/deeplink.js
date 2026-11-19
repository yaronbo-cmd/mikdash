// ── deep132 ── (build 132; the owner, 18.11) the presentation links: a version page opened with '#hatzaga' goes straight into
// the Phase B preview ("הצצה: העבודה בבית"), with '#siyur' into the Temple tour ("סיור בבית המקדש") — the same calls as the
// menu's two entries (main.js startGame). Exact names only, so they never meet a work link (#pit1, #form2 …: h109/director.js
// workFlag reads only a plain hash that is one of the works' ids, and ?work= / #work=), #avodah, #shift or #demo.
export const DEEP_LINKS = Object.freeze({ hatzaga: 'preview', siyur: 'tour' });
/** '#hatzaga' → 'preview' · '#siyur' → 'tour' · anything else → null */
export function deepLinkOf(hash) {
  const h = String(hash || '').replace(/^#/, '');
  return Object.prototype.hasOwnProperty.call(DEEP_LINKS, h) ? DEEP_LINKS[h] : null;
}
// ── /deep132 ──
