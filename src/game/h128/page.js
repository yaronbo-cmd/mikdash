/* ── build 128 ── h128/page.js — the whole-stage page's fresh game (index.js h28Only: stages 01–05 done at once). The game's builders'
 * account (index.js scoreLegacy) pays 500 for every done stage whose 'stage:<id>' once-flag is missing — a save from before the master
 * score. A stage done by this page has no such flag, so the first ordinary load of its save paid 5 × 500 (510 → 3,010 after a
 * reload). In a game played through, each stage's end sets the flag (its stageDone bonus); here the page sets it as that end would.
 *   pageBuilt(G, ids) → the ids flagged */
import { NEXT_STAGE } from '../h131/model.js';   // ── h131 ── ── /h131 ──
import { NEXT_STAGE as NEXT09 } from '../h132/model.js';   // ── h132 ── ── /h132 ──
import { NEXT_STAGE as NEXT10 } from '../h133/model.js';   // ── h133 ── ── /h133 ──
export function pageBuilt(G, ids) {
  if (!G) return [];
  if (!G.scf || typeof G.scf !== 'object' || Array.isArray(G.scf)) G.scf = {};
  const out = [];
  for (const id of ids || []) { if (!G.scf['stage:' + id]) { G.scf['stage:' + id] = 1; out.push(id); } }
  return out;
}

/* ── the frontier (the owner 15.11: "the button on the right side has come back"). In the director's game the old right pad (twin.js
 * .tw-pad, its work button and "מבט על") never shows: the director hid it only while a stage of its own ran, so it came back between
 * stages, under the cards, and for good after the last stage a pack owns — when the old game took the next stage over (its pill
 * "התחל לבנות", its minigames, story and moment). PACKED lists the stages a pack owns, in play order; once all are done the game is
 * built to here: one card names the next stage from the stage table (state.recommend → content.stageById), the world stays to walk,
 * and the old game does not start. The next build adds its stage's id to PACKED.
 *   PACKED · NEXT_NAMED · frontier(G, S) → bool · frontLine(G, S, stageById) → the card's words · noPad(doc) → the class on .gm */
export const PACKED = ['har', 'wall', 'sorag', 'gates', 'nashim', 'nikanor', 'lishka', 'yesod', 'sovev', 'guf'];   // ── h133 ── (build 133: stage 10 too) ── /h133 ──   // ── h132 ── (build 132: stage 09 too) ── /h132 ──   // ── h129 ── (build 129: stage 07 is a pack's) ── /h129 ──   // ── h131 ── (build 131: stage 08 too) ── /h131 ──
// ── h131 ── (the spec of stage 08: "לשלב הבא (גוף המזבח)" — the card after the last packed stage names the next stage as its spec does,
// where the old stage table would say otherwise: after the yesod the table's next is the sovev, which the spec folds into the body) ── /h131 ──
// ── h132 ── (build 132: after the sovev, stage 09's spec names stage 10 "גוף המזבח", not built yet) ── /h132 ──
export const NEXT_NAMED = Object.freeze({ yesod: NEXT_STAGE, sovev: NEXT09, guf: NEXT10 });   // ── h133 ── (after stage 10: הקרנות) ── /h133 ──
export function frontier(G, S) {
  if (!G || !S) return false;
  try { return PACKED.every((id) => S.isDone(G, id)); } catch (e) { return false; }
}
export function frontNext(G, S, stageById) {
  { const last = PACKED[PACKED.length - 1]; if (NEXT_NAMED[last]) return NEXT_NAMED[last]; }   // ── h131 ── ── /h131 ──
  let id = null;
  try { const r = S.recommend(G); if (r && r.id && !PACKED.includes(r.id)) id = r.id; } catch (e) { /* */ }
  const d = id && stageById ? stageById(id) : null;
  return d ? d.n : '';
}
export function frontLine(G, S, stageById) {
  const n = frontNext(G, S, stageById);
  return n ? `עד כאן בנוי המשחק · השלב הבא: ${n} (בבנייה)` : 'עד כאן בנוי המשחק';
}
// (and "↩ מבט רגיל" (director.js h109-lkb): since build 125 a tap on the world brings the camera back from outside the play zone, and
//  inside it the act plays on — the button only stood at the right edge, also under the act's own small lift; removed)
const CSS = '.gm.h128-nopad .tw-pad{display:none!important}.gm.h128-nopad ~ .h109-lkb,.h128-nopad .h109-lkb,body.h128-nopad .h109-lkb{display:none!important}';
export function noPad(doc) {
  try {
    const d = doc || (typeof document !== 'undefined' ? document : null); if (!d) return false;
    if (!d.getElementById('h128-nopad')) { const s = d.createElement('style'); s.id = 'h128-nopad'; s.textContent = CSS; (d.head || d.documentElement).appendChild(s); }
    const g = d.querySelector('.gm'); if (g) g.classList.add('h128-nopad'); if (d.body) d.body.classList.add('h128-nopad');
    return !!g;
  } catch (e) { return false; }
}
