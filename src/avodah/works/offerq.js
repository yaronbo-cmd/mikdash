/* ── bloodb25 ── offerq.js — the private offerings the gate's queue sent on (gate.js → more.js yachid): the kinds in the order they were
 * sent, so the rings play each one's own chain (DAM25 §3: עולה / שלמים below the line, חטאת on the four horns above, the birds on the wall).
 * A small ledger, no imports (both sides read it without a cycle). ── /bloodb25 ── */
const SENT = [];
/** the gate's kinds → the kinds of the rings: olah · shelamim · chatat · ken (a pair of birds: חטאת העוף and עולת העוף) */
export const RING_KIND = { olah: 'olah', shelamim: 'shelamim', chatat: 'chatat', kinim: 'ken', ken: 'ken', asham: 'olah' };
/** the default (when the queue sent nothing yet): the two chains the Tamid does not show — the חטאת's four horns and the birds' wall
 *  (the עולה's two corners are the Tamid's own: BLOODA25's zerika); then the עולה */
export const DEFAULT_KINDS = ['chatat', 'ken', 'olah'];
/** how many offerings one errand at the rings plays (a phone's minute) */
export const ROUNDS_N = 2;
export function noteSent(kind) { const k = RING_KIND[kind]; if (!k) return; SENT.push(k); if (SENT.length > 24) SENT.shift(); }
/** the next n kinds for the rings: the distinct kinds the queue sent (in order), then the defaults not yet among them */
export function ringKinds(n = ROUNDS_N) {
  const out = [];
  for (const k of SENT) if (!out.includes(k) && out.length < n) out.push(k);
  for (const k of DEFAULT_KINDS) if (!out.includes(k) && out.length < n) out.push(k);
  return out;
}
export const sentKinds = () => SENT.slice();
export function clearSent() { SENT.length = 0; }
try { globalThis.__OFFERQ = { noteSent, ringKinds, sentKinds, clearSent }; } catch (e) { /* tests */ }
