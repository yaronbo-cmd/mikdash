/* ── build 61 ── world61.js — what stands on the Mount: ONE record of the world for Phase A (docs/specs/shlav-alef-olam-he.md §3, the
 * three over-rules: one world; every work lays something; the building grows without jumps). It holds each structure's built share (0…1,
 * never down — what was built stays) and where he stood at each site; har42.js writes it as his works and the crews lay their stones, and
 * stages.js's model is set from it when a site opens again, so a reload finds the same building. The stones he laid himself keep their own
 * record where they were (bh_har42: wall.stones, build 46). Pure but for load/save (localStorage bh_world61). Never a Divine Name.
 * ── /build 61 ── */

export const W61KEY = 'bh_world61';
/** the crews' pace between his works: `crewS` seconds for a whole step (one of his works to the next), never past `cap` of the step
 *  before his next work is done (the course waits for his hand stones); saved every `saveS` s */
export const WORLD61 = Object.freeze({ crewS: 90, cap: 0.85, saveS: 2 });

export function empty61() { return { v: 1, built: {}, at: {} }; }

export function load61(ls = globalThis.localStorage) {
  try { const s = ls && ls.getItem(W61KEY); if (!s) return empty61(); const W = JSON.parse(s); if (!W || W.v !== 1) return empty61(); W.built = W.built || {}; W.at = W.at || {}; return W; } catch (e) { return empty61(); }
}
export function save61(W, ls = globalThis.localStorage) { try { if (ls) ls.setItem(W61KEY, JSON.stringify(W)); } catch (e) { /* */ } }

/** what of `id` is built (0…1) */
export function built61(W, id) { const p = W && W.built ? +W.built[id] : 0; return Number.isFinite(p) ? Math.max(0, Math.min(1, p)) : 0; }

/** the structure grows to p — never down → the share now */
export function grow61(W, id, p) {
  if (!W || !Number.isFinite(+p)) return built61(W, id);
  const q = Math.max(built61(W, id), Math.max(0, Math.min(1, +p))); W.built[id] = Math.round(q * 1e4) / 1e4; return q;
}

/** the crews between his works: from `from` (the step his last work closed) toward `to` (the step his next closes), dt s at a time, up to
 *  cap of the way (they never finish the course his hand stones belong in) → the share now */
export function creep61(W, id, from, to, dt, c = WORLD61) {
  const now = Math.max(built61(W, id), from), lim = from + (to - from) * c.cap;
  if (!(to > from) || now >= lim) return grow61(W, id, now);
  return grow61(W, id, Math.min(lim, now + ((to - from) * dt) / c.crewS));
}

/** where he stood at a site */
export function at61(W, stg) { const a = W && W.at ? W.at[stg] : null; return a && Number.isFinite(a.x) && Number.isFinite(a.z) ? { x: a.x, z: a.z } : null; }
export function stand61(W, stg, x, z) { if (W && Number.isFinite(x) && Number.isFinite(z)) W.at[stg] = { x: Math.round(x * 100) / 100, z: Math.round(z * 100) / 100 }; }
