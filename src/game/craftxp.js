/* ─────────────────────────────────────────────────────────────────────────────
 * craftxp.js — נקודות מלאכה: every work act of a craft adds its points; levels per craft (PRINCIPLES §6: a level for each
 * craft, fixed and known — no loot, nothing random, nothing lost). WAVE18-BRIEF contract 1.
 *   const X = createCraftXP(() => G, persist);
 *   X.add('סתתים', 1) → { craft, xp, level, up, base, next, name, icon }   (up: the new level when this add crossed one, else 0)
 *   X.get('סתתים')    → the same shape, nothing added
 *   X.cur()           → the craft played last (or the first one), its shape
 * The save: one field, G.xp = { [craft]: points }. A craft is jobs.js `trade` (the guild's plural, as the deal cards say it).
 * ──────────────────────────────────────────────────────────────────────────── */
/** the points at which levels 2…7 begin (level 1 from 0) */
export const LEVELS = [10, 25, 50, 100, 175, 275];
/** the crafts: jobs.js `trade` → the one craftsman's name and an icon (המחשה: UI words) */
export const CRAFTS = {
  'סתתים': { name: 'הסתת', icon: '⚒' },
  'חוצבים': { name: 'החוצב', icon: '⛏' },
  'מנופאים': { name: 'המנופאי', icon: '⚙' },
  'נגרים': { name: 'הנגר', icon: '🪚' },
  'צורפים': { name: 'הצורף', icon: '✦' },
  'סיידים': { name: 'הסייד', icon: '▤' },
  'נחושתנים': { name: 'הנחושתן', icon: '◉' },
  'שואבי מים': { name: 'שואב המים', icon: '◎' },
  'בוני האמה': { name: 'בונה האמה', icon: '⌇' },
  'מודדים': { name: 'המודד', icon: '📏' },
};
export const DEFAULT_CRAFT = 'סתתים';
/** the craft of a touch: its trade, else by the kind of act ('rock' is the quarrying of the Mount) */
export function craftOf(craft, kind) {
  if (craft && typeof craft === 'string') return craft;
  return kind === 'rock' ? 'חוצבים' : DEFAULT_CRAFT;
}
/** points → level 1…7 */
export function levelOf(xp) { let l = 1; for (const t of LEVELS) if (xp >= t) l++; return l; }
/** the shape the HUD draws (ui.xp): base = the level's floor, next = the next level's points (null at the top) */
export function shapeOf(craft, xp, up = 0) {
  const level = levelOf(xp), C = CRAFTS[craft] || { name: craft, icon: '⚒' };
  const base = level > 1 ? LEVELS[level - 2] : 0;
  return { craft, xp, level, up, base, from: base, next: level <= LEVELS.length ? LEVELS[level - 1] : null, name: C.name, icon: C.icon };   // (from: HUD18's ui.xp name for base)
}
export function createCraftXP(getG, persist = null) {
  let last = null;
  const box = () => { const G = getG && getG(); if (!G) return null; if (!G.xp || typeof G.xp !== 'object' || Array.isArray(G.xp)) G.xp = {}; return G.xp; };
  const val = (b, c) => { const v = b ? +b[c] : 0; return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0; };
  return {
    add(craft, n = 1) {
      const c = craft || DEFAULT_CRAFT, b = box(); last = c;
      const k = Math.max(0, Math.floor(+n || 0)), x0 = val(b, c), x1 = x0 + k;
      if (b && k) b[c] = x1;
      const l0 = levelOf(x0), l1 = levelOf(x1);
      if (k && typeof persist === 'function') { try { persist(); } catch (e) { /* the game's */ } }
      return shapeOf(c, x1, l1 > l0 ? l1 : 0);
    },
    get(craft) { const c = craft || last || DEFAULT_CRAFT; return shapeOf(c, val(box(), c)); },
    cur() { const b = box(), c = last || (b && Object.keys(b)[0]) || DEFAULT_CRAFT; return shapeOf(c, val(b, c)); },
  };
}
