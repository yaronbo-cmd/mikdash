/* ── build 134 ── h134/sets.js — the 24 fixed pebble sets of work 1 (spec docs/specs/shlav-11-he.md, "הערכות: קבועות, לא הגרלה"),
 * read from docs/specs/shlav-11-horn-sets.json (written and checked by docs/specs/shlav-11-horn-sets-gen.py). Pure: no three.js, no DOM.
 * The grid (logic only, never drawn): half-tefach cells, the ring of 12 × 12 minus the 6 × 6 core (cells 3 … 8): 108 cells; x east,
 * z south; neighbours by edges only. A pebble is a polyomino of constant thickness (2.5 tefachim, one layer); its eight orientations are
 * the four quarter turns, and the same mirrored (a flip on its back).
 *   RING · RINGSET · onRing(x, z) · edgeOfFrame(x, z) · setOf(corner, lv, layer) · orient(shape, o) · ORIENTS · checkSets() → problems[]
 */
import SETS from '../../../docs/specs/shlav-11-horn-sets.json' with { type: 'json' };

export const N = 12, CORE0 = 3, CORE1 = 8, RING_N = 108;
export const onRing = (x, z) => x >= 0 && x < N && z >= 0 && z < N && !(x >= CORE0 && x <= CORE1 && z >= CORE0 && z <= CORE1);
export const RING = Object.freeze((() => { const o = []; for (let x = 0; x < N; x++) for (let z = 0; z < N; z++) if (onRing(x, z)) o.push([x, z]); return o; })());
export const key = (x, z) => x * 16 + z;
export const RINGSET = new Set(RING.map(([x, z]) => key(x, z)));
/** a ring cell on the frame (the outer edge: where pitch leaks out once the frame comes off) */
export const edgeOfFrame = (x, z) => x === 0 || z === 0 || x === N - 1 || z === N - 1;
export const LV = Object.freeze({ 1: 'a', 2: 'b', 3: 'c' });

/** cells normalised: the smallest x and z to 0, sorted */
export function norm(cells) {
  let mx = Infinity, mz = Infinity; for (const [x, z] of cells) { if (x < mx) mx = x; if (z < mz) mz = z; }
  return cells.map(([x, z]) => [x - mx, z - mz]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}
/** orientation o (0 … 7): o & 3 quarter turns (a turn: (x, z) → (z, −x), as the generator), o & 4 mirrored first ((x, z) → (−x, z)) */
export function orient(shape, o) {
  let c = shape.map(([x, z]) => [x, z]);
  if (o & 4) c = c.map(([x, z]) => [-x, z]);
  for (let r = 0; r < (o & 3); r++) c = c.map(([x, z]) => [z, -x]);
  return norm(c);
}
export const sameCells = (a, b) => a.length === b.length && a.every((p, i) => p[0] === b[i][0] && p[1] === b[i][1]);
/** the distinct orientations of a shape (the count the file gives: 1, 2, 4 or 8) */
export function orients(shape) { const out = []; for (let o = 0; o < 8; o++) { const c = orient(shape, o); if (!out.some((q) => sameCells(q, c))) out.push(c); } return out; }

/** one set: corner 'SE' | 'NE' | 'NW' | 'SW', level 1 … 3, layer 1 | 2 → [{ id, shape, cells, solution, orientations }] (frozen copies) */
export function setOf(corner, lv, layer) {
  const S = SETS.sets[`${corner}:${LV[Math.max(1, Math.min(3, lv | 0 || 1))]}`];
  if (!S) return [];
  return S['layer' + (layer === 2 ? 2 : 1)].map((p) => ({ id: p.id, shape: p.shape.map((c) => c.slice()), cells: p.cells, solution: p.solution.map((c) => c.slice()), orientations: p.orientations }));
}
/** where a pebble's solution lies: its orientation (o) and anchor (the smallest x and z) */
export function solutionPose(p) {
  const s = norm(p.solution); let mx = Infinity, mz = Infinity; for (const [x, z] of p.solution) { if (x < mx) mx = x; if (z < mz) mz = z; }
  for (let o = 0; o < 8; o++) if (sameCells(orient(p.shape, o), s)) return { o, x: mx, z: mz };
  return null;
}
const conn = (cells) => { if (!cells.length) return false; const S = new Set(cells.map(([x, z]) => key(x, z))), seen = new Set([key(...cells[0])]), st = [cells[0]]; while (st.length) { const [x, z] = st.pop(); for (const [a, b] of [[x + 1, z], [x - 1, z], [x, z + 1], [x, z - 1]]) { const k = key(a, b); if (S.has(k) && !seen.has(k)) { seen.add(k); st.push([a, b]); } } } return seen.size === cells.length; };
/** the build's check of the file (spec "מה נבדק לפני מסירה" 2): every solution covers exactly the 108 cells, every pebble connected,
 *  its shape its solution's, its orientation count right, and every layer-2 pebble of the solution on two layer-1 pebbles at least;
 *  level 1's first layer as the spec's table (six pebbles three wide) → the problems found (none: []) */
export const CORNERS = Object.freeze(['SE', 'NE', 'NW', 'SW']);
export const SIZES = Object.freeze({ 1: [6, 8], 2: [8, 10], 3: [10, 12] });
export function checkSets() {
  const bad = [];
  for (const c of CORNERS) for (const lv of [1, 2, 3]) {
    const own = new Map();
    for (const layer of [1, 2]) {
      const P = setOf(c, lv, layer), tag = `${c}:${LV[lv]}:${layer}`;
      if (P.length !== SIZES[lv][layer - 1]) bad.push(`${tag}: ${P.length} pebbles`);
      const cov = new Set();
      P.forEach((p, i) => {
        for (const [x, z] of p.solution) { const k = key(x, z); if (!RINGSET.has(k)) bad.push(`${tag}: ${p.id} off the ring`); if (cov.has(k)) bad.push(`${tag}: ${p.id} overlaps`); cov.add(k); if (layer === 1) own.set(k, i); }
        if (!conn(p.solution)) bad.push(`${tag}: ${p.id} not connected`);
        if (p.cells !== p.solution.length || p.shape.length !== p.cells) bad.push(`${tag}: ${p.id} cell count`);
        if (!solutionPose(p)) bad.push(`${tag}: ${p.id} its solution is not an orientation of its shape`);
        if (orients(p.shape).length !== p.orientations) bad.push(`${tag}: ${p.id} orientations ${orients(p.shape).length} ≠ ${p.orientations}`);
        if (layer === 2 && new Set(p.solution.map(([x, z]) => own.get(key(x, z)))).size < 2) bad.push(`${tag}: ${p.id} on one layer-1 pebble`);
      });
      if (cov.size !== RING_N) bad.push(`${tag}: covers ${cov.size}`);
      if (lv === 1 && layer === 1) for (const p of P) { const n = norm(p.solution), w = Math.min(n[n.length - 1][0], n[n.length - 1][1]) + 1; if (w !== 3) bad.push(`${tag}: ${p.id} not three wide`); }
    }
  }
  return bad;
}
