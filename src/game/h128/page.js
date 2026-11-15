/* ── build 128 ── h128/page.js — the whole-stage page's fresh game (index.js h28Only: stages 01–05 done at once). The game's builders'
 * account (index.js scoreLegacy) pays 500 for every done stage whose 'stage:<id>' once-flag is missing — a save from before the master
 * score. A stage done by this page has no such flag, so the first ordinary load of its save paid 5 × 500 (510 → 3,010 after a
 * reload). In a game played through, each stage's end sets the flag (its stageDone bonus); here the page sets it as that end would.
 *   pageBuilt(G, ids) → the ids flagged */
export function pageBuilt(G, ids) {
  if (!G) return [];
  if (!G.scf || typeof G.scf !== 'object' || Array.isArray(G.scf)) G.scf = {};
  const out = [];
  for (const id of ids || []) { if (!G.scf['stage:' + id]) { G.scf['stage:' + id] = 1; out.push(id); } }
  return out;
}
