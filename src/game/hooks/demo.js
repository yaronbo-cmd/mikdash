/* ─────────────────────────────────────────────────────────────────────────────
 * hooks/demo.js: the investor's five minutes (HOOKS agent, docs/HOOKS.md finding 7). Pure rules, no DOM.
 *
 * The playtest found that "דלג לפרק הבא" gets an investor to the finale in ~4½ minutes but skips everything worth
 * showing (the Heichal's gold, the craftsmen in boxes, the first fire), and stalls ~50 s on "צריך 6 כהנים" in
 * chapter 4. The highlight reel is the curated path instead: each press completes what the next highlight needs
 * (silently, like skipChapter) and then plays that highlight live: a key moment, or a site finished with its full
 * celebration. Demo saves only (bh_demo); the real game never sees it.
 * ──────────────────────────────────────────────────────────────────────────── */
import { STAGES, stageById } from '../content.js';
import * as S from '../state.js';

/** In order: what each highlight shows (moment: its key moment is played; live: the site finishes with its celebration) */
export const HIGHLIGHTS = [
  { id: 'har', how: 'moment', what: 'האבן הגדולה' },
  { id: 'wall', how: 'live', what: 'העזרה נסגרת' },
  { id: 'sorag', how: 'moment', what: 'שלוש עשרה הפרצות' },
  { id: 'sovev', how: 'moment', what: 'חוט הסיקרא' },
  { id: 'karnot', how: 'moment', what: 'המזבח שלם: האש הראשונה' },     // (moments: the horns, then the first fire)
  { id: 'kiyor', how: 'moment', what: 'הכיור ושנים עשר הדדים' },        // (BUILD 21:45: WATER's twelve spigots flow in its moment)
  { id: 'ulam', how: 'moment', what: 'האולם וגפן הזהב' },               // (moments: five lintels, then the golden vine)
  { id: 'heichal', how: 'live', what: 'ההיכל בזהב' },
  { id: 'kodesh', how: 'moment', what: 'האומנים בתיבות' },
];

export function nextHighlight(G) {
  return HIGHLIGHTS.find((h) => !S.isDone(G, h.id)) || null;
}

/** Every stage `id` depends on, transitively, in an order that respects the graph. */
function ancestors(id, seen = new Set(), out = []) {
  for (const d of stageById(id).deps) if (!seen.has(d)) { seen.add(d); ancestors(d, seen, out); out.push(d); }
  return out;
}

/**
 * Make the highlight playable: complete what it needs (→ the completions, for the world), give the demo its trained
 * priests when the House is next, and leave the highlight itself ready (moment) or one strike from done (live).
 * → {h, done: [completeStage results]} | null
 */
export function prepareHighlight(G) {
  const h = nextHighlight(G);
  if (!h) return null;
  const done = [];
  for (const id of ancestors(h.id)) {
    if (S.isDone(G, id)) continue;
    if (!G.st[id]) G.st[id] = { w: 0, ph: 3 };
    G.st[id].w = stageById(id).W; G.st[id].m = true; G.st[id].ph = 3;
    if (id === 'har') G.bh = G.bh.map(() => 0);
    const c = S.completeStage(G, id);
    if (c) done.push(c);
  }
  const d = stageById(h.id);
  if (d.ch === 4 || d.priests) G.priests = Math.max(G.priests, 10);
  if (h.id === 'har') G.bh = G.bh.map(() => 0);
  // (round 3) a live highlight is marked as past its moment (m): otherwise a crew tick in the ~2 s before the celebration can
  // reach the stage's end first and open its key moment in the middle of the reel (the presenter bot met the wall's)
  G.st[h.id] = { w: d.W, ph: 3, ...(h.how === 'moment' ? { ready: true } : { m: true }) };
  return { h, done };
}

/** For the tests and the demo strip: the highlights left. */
export const highlightsLeft = (G) => HIGHLIGHTS.filter((h) => !S.isDone(G, h.id)).length;
export const ALL_STAGES = STAGES.map((s) => s.id);
