// ── present132 ── (build 132; the owner, 18.11 16:22) the presentation version: the lighter page (LINE=new, build.mjs) keeps the
// menu's two entries "הצצה: העבודה בבית" and "סיור בבית המקדש" in their places, as links to this full version page, which opens
// them by its hash (src/deeplink.js: #hatzaga, #siyur). The one place of the address.
export const PRESENT_URL = 'https://yaronbo-cmd.github.io/mikdash/v/131/';
export const PRESENT_HINT = 'נפתח בגרסת ההצגה';
/** the link of an entry: 'preview' → …#hatzaga · 'tour' → …#siyur */
export function presentHref(kind, base = PRESENT_URL) {
  return String(base) + (kind === 'tour' ? '#siyur' : '#hatzaga');
}
// ── /present132 ──
