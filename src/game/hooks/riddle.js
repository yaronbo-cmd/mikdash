/* ─────────────────────────────────────────────────────────────────────────────
 * hooks/riddle.js — HOOK20: "חידת היום", the rules (pure; the sheet is hooks/riddle-ui.js). One riddle a calendar day, 2–4 steps on the real
 * Temple (content/riddle.json: drafts with sources). A wrong try costs nothing and is never counted; a hint at 30 s and a second at 60 s;
 * no timer is shown; a reset; never a dead end. Solved = one dinar (RIDDLE_PTS, once a day) + the fact kept in the book; left = nothing:
 * "מחר חידה חדשה". Levels: a riddle has `min`, the stages done. The save: G.riddle = { day, id, step, solved } and G.book.riddles = { id: fact }.
 * ──────────────────────────────────────────────────────────────────────────── */
import RJ from '../../../content/riddle.json' with { type: 'json' };

/** ⚑ one dinar = the master score's 10,000 points (score.js MILESTONE); the owner may lower it */
export const RIDDLE_PTS = 10000;
export const HINT_MS = [30000, 60000];
const okStep = (s) => s && ((s.t === 'place' && Array.isArray(s.items) && Array.isArray(s.slots)) || (s.t === 'choose' && Array.isArray(s.a) && Number.isInteger(s.ok))
  || (s.t === 'count' && Number.isInteger(s.n)) || (s.t === 'order' && Array.isArray(s.items)));
export const RIDDLES = (RJ && Array.isArray(RJ.riddles) ? RJ.riddles : []).filter((r) => r && r.id && r.title && Array.isArray(r.steps) && r.steps.length >= 1 && r.steps.length <= 4 && r.steps.every(okStep) && r.fact && r.ref);
const dayNum = (k) => { const [y, m, d] = String(k).split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 86400000); };

/** the riddle of a day for a save with `done` stages built: the pool is those with min ≤ done, the day picks by its number (no luck) */
export function pickFor(day, done = 0) {
  const pool = RIDDLES.filter((r) => (r.min | 0) <= done);
  return pool.length ? pool[((dayNum(day) % pool.length) + pool.length) % pool.length] : null;
}
export const byId = (id) => RIDDLES.find((r) => r.id === id) || null;

/** G.riddle for today: a new day starts a new riddle (a riddle left unsolved leaves nothing behind) */
export function ensure(G, day, done = 0) {
  const R = G.riddle;
  if (R && typeof R === 'object' && R.day === day && byId(R.id)) return R;
  const r = pickFor(day, done);
  G.riddle = r ? { day, id: r.id, step: 0, solved: false } : { day, id: '', step: 0, solved: false };
  return G.riddle;
}
export const current = (G, day, done = 0) => { const R = ensure(G, day, done); return R.id ? { R, def: byId(R.id), step: byId(R.id).steps[Math.min(R.step, byId(R.id).steps.length - 1)] } : null; };

/** the shuffle shown for an order step: fixed (the same every time), never the right order */
export function shown(step) {
  const n = step.items.length, idx = [...Array(n).keys()];
  const sh = idx.map((_, i) => idx[(i * 2 + 1) % n === i ? (i + 1) % n : (i * 2 + 1) % n]);
  const seen = new Set(sh); const out = seen.size === n ? sh : idx.slice().reverse();
  return (out.every((v, i) => v === i) ? idx.slice().reverse() : out);
}
/** one try: a place — { item, slot } → ok; a choose — index; a count — number; an order — the whole sequence of indices (original order) */
export function check(step, ans) {
  if (!step) return false;
  if (step.t === 'place') { const it = step.items.find((x) => x.id === (ans && ans.item)); return !!it && it.to === ans.slot; }
  if (step.t === 'choose') return ans === step.ok;
  if (step.t === 'count') return ans === step.n;
  if (step.t === 'order') return Array.isArray(ans) && ans.length === step.items.length && ans.every((v, i) => v === i);
  return false;
}
/** a step is passed: the next step, or solved. Returns { done, solved } */
export function advance(G, day) {
  const R = G.riddle; if (!R || R.day !== day || R.solved) return { done: false, solved: !!(R && R.solved) };
  const def = byId(R.id); if (!def) return { done: false, solved: false };
  R.step++;
  if (R.step >= def.steps.length) { R.step = def.steps.length; R.solved = true; return { done: true, solved: true }; }
  return { done: true, solved: false };
}
/** the solve: the fact goes into the book, the dinar once (the caller adds the points through the score) */
export function keep(G, day) {
  const R = G.riddle, def = R && byId(R.id); if (!def) return null;
  if (!G.book || typeof G.book !== 'object') return null;
  if (!G.book.riddles || typeof G.book.riddles !== 'object') G.book.riddles = {};
  G.book.riddles[def.id] = { fact: def.fact, ref: def.ref, day };
  return def;
}
/** which hint level the time on a step has earned: 0 none · 1 at 30 s · 2 at 60 s */
export const hintAt = (ms) => (ms >= HINT_MS[1] ? 2 : ms >= HINT_MS[0] ? 1 : 0);
/** tomorrow's riddle's title, for the locked silhouette */
export const tomorrow = (day, done = 0) => { const r = pickFor(new Date((dayNum(day) + 1) * 86400000).toISOString().slice(0, 10), done); return r ? r.title : ''; };
export const solvedBook = (G) => (G && G.book && G.book.riddles && typeof G.book.riddles === 'object' ? Object.entries(G.book.riddles).map(([id, v]) => ({ id, ...v, title: (byId(id) || {}).title || '' })) : []);
