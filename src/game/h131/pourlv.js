/* ── build 131 ── h131/pourlv.js — the pour's three levels and its rules, pure (no three.js, no DOM: node runs it, test/h131-pour.test.mjs).
 * The simulation is the approved sample's (sim.js, its grid and tuning as they are: a segment of 12 × 8 amot inside its boards); a level
 * gives it its stones and its fixed shapes. The section stands where the book puts it (BOOK.s08.sections, near): the segment's local frame
 * (lx across, lz from the far board −4 to the near board +4, where the crew stand and the spout comes over) turned to face the player.
 *   LEVELS[lv] = { stones, targets, timber, reeds }     the spec's three levels (part 3, "שלוש הרמות")
 *   toWorld(lv, lx, ly, lz) · toLocal(lv, x, z)          the section's frame on the court (ly over the floor)
 *   blockOf(lv)                                          the timber and the reeds standing in the segment like stones (or null)
 *   newSim(lv)                                           the segment's simulation for the level
 *   landing(sim, lv) → null | 'timber' | 'reed:<i>'      where the stream lands: over the timber (a spill), on a reed (it clogs)
 *   packWork(sim, o) · unpackWork(sim, blob)             a pour kept in the save (a reload in the middle of it) and set back
 */
import { createSim, STONES, TARGETS, NX, NZ, N, DX, X0, Z0, cellX, cellZ, T } from './sim.js';
import { BOOK } from '../world/grid.js';

const S8 = BOOK.s08;
const mid = (b) => [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];

/** the section's frame: its middle on the court and which way its near board faces (N: the near board north, lz → −z) */
export function frameOf(lv) { const [cx, cz] = mid(S8.sections[lv]); return { cx, cz, s: S8.near[lv] === 'N' ? -1 : 1, y: S8.floor }; }
export function toWorld(lv, lx, ly, lz) { const f = frameOf(lv); return [f.cx + f.s * lx, f.y + ly, f.cz + f.s * lz]; }
export function toLocal(lv, x, z) { const f = frameOf(lv); return [(x - f.cx) * f.s, (z - f.cz) * f.s]; }
/** the segment's turn about y for three.js (a group at the section's middle): 0 when lz is +z (near board south), π when it is −z */
export const yawOf = (lv) => (frameOf(lv).s < 0 ? Math.PI : 0);

/* ───────── the three levels (spec part 3: "שלוש הרמות"; the stones' places המחשה) ─────────
 * a stone: [x, z, rx, rz, height, turn, tinted] (sim.js) — tinted: a stone he raised himself in the pit ("מסומנות בגוון קצת שונה")
 * 1. a section in the north: few stones, a generous flow — he learns the mix runs to the low place and hardens;
 * 2. the middle: big and small stones make narrow passages; the order decides whether a hollow is left (the approved sample's own layout);
 * 3. the south-west: fill tight against the south timber without spilling over it, and round the two reeds without clogging them. */
const L1 = [
  [-3.70, -1.50, 0.95, 0.80, 1.25, 0.30, 1],
  [3.40, -1.10, 1.05, 0.85, 1.30, -0.20, 0],
  [0.20, -2.70, 0.85, 0.70, 1.15, 0.50, 0],
  [-1.30, 1.50, 0.62, 0.52, 0.95, 0.20, 1],
  [4.30, 2.30, 0.45, 0.40, 0.60, 0.00, 0],
  [-4.70, 2.50, 0.40, 0.38, 0.50, 0.60, 0],
];
const L3 = [
  // a row with three passages (west, middle, east) to the back
  [-2.80, -1.30, 1.25, 0.90, 1.35, 0.10, 0],
  [1.00, -1.55, 1.40, 1.00, 1.40, -0.15, 1],
  [4.70, -1.20, 1.15, 0.95, 1.40, 0.20, 0],
  [-5.92, -1.20, 0.42, 0.85, 1.15, 0.00, 0],
  [5.92, -1.15, 0.42, 0.85, 1.20, 0.00, 0],
  // the near area (the timber along the near board behind it)
  [-1.20, 1.25, 0.80, 0.68, 1.20, 0.30, 0],
  [2.90, 1.45, 0.70, 0.60, 1.10, -0.20, 1],
  // in the pockets
  [-1.10, -3.20, 0.45, 0.40, 0.50, 0.40, 0],
  [3.00, -3.30, 0.40, 0.40, 0.50, 0.00, 0],
];
// the timber and the reeds in the segment's frame (level 3, from the book: the south timber's west end and the two reeds)
function level3Fixed() {
  const W = S8.wood.S, [ax, az] = toLocal(3, W[0], W[1]), [bx, bz] = toLocal(3, W[2], W[3]);
  const timber = [Math.min(ax, bx), Math.min(az, bz), Math.max(ax, bx), Math.max(az, bz)];
  const reeds = S8.reeds.map(([x, z]) => toLocal(3, x, z));
  return { timber, reeds };
}
const F3 = level3Fixed();
export const REED_R = 0.16, REED_H = 1.7, TIMBER_H = 1.3;
export const LEVELS = Object.freeze({
  1: Object.freeze({ lv: 1, stones: L1, targets: [
    { name: 'cornerL', x: -5.6, z: -3.6, r: 0.45, word: 'פינה!' }, { name: 'cornerR', x: 5.6, z: -3.6, r: 0.45, word: 'פינה!' },
    { name: 'back', x: 1.8, z: -3.4, r: 0.5, word: 'הגיע!' }] }),
  2: Object.freeze({ lv: 2, stones: STONES, targets: TARGETS }),
  3: Object.freeze({ lv: 3, stones: L3, timber: F3.timber, reeds: F3.reeds, targets: [
    { name: 'reeds', x: (F3.reeds[0][0] + F3.reeds[1][0]) / 2, z: F3.reeds[0][1] - 0.55, r: 0.4, word: 'סביב הקנים!' },
    { name: 'cornerL', x: -5.6, z: -3.6, r: 0.45, word: 'פינה!' }, { name: 'cornerR', x: 5.6, z: -3.6, r: 0.45, word: 'פינה!' },
    { name: 'pocket', x: 1.0, z: -3.0, r: 0.5, word: 'הגיע!' }] }),
});

/** level 3's fixed shapes as heights the simulation reads like stones (the timber a flat block, each reed a thin post) */
export function blockOf(lv) {
  const L = LEVELS[lv]; if (!L.timber) return null;
  const B = L.timber, R = L.reeds;
  return (x, z) => {
    if (x >= B[0] && x <= B[2] && z >= B[1] && z <= B[3]) return TIMBER_H;
    for (const [rx, rz] of R) if (Math.hypot(x - rx, z - rz) <= REED_R + DX * 0.5) return REED_H;
    return 0;
  };
}
export function newSim(lv) { return createSim(8, LEVELS[lv].stones, blockOf(lv)); }

/** cells of the timber and of each reed (for the spill and the clog) */
export function cellsOf(lv) {
  const L = LEVELS[lv], timber = new Uint8Array(N), reed = new Int8Array(N).fill(-1);
  if (!L.timber) return { timber, reed };
  const B = L.timber;
  for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++) {
    const x = cellX(i), z = cellZ(k), c = k * NX + i;
    if (x >= B[0] && x <= B[2] && z >= B[1] && z <= B[3]) timber[c] = 1;
    L.reeds.forEach(([rx, rz], j) => { if (Math.hypot(x - rx, z - rz) <= REED_R + DX * 0.5) reed[c] = j; });
  }
  return { timber, reed };
}
/** where the falling stream meets the segment this step (sim.spout.lx, lz: the cell it lands on, before it runs off a stone) */
export function landing(sim, lv, C) {
  const L = LEVELS[lv]; if (!L.timber || !(sim.spout.q > 0)) return null;
  const sp = sim.spout, i0 = Math.max(1, Math.min(NX - 2, Math.round((sp.lx - X0) / DX - 0.5))), k0 = Math.max(1, Math.min(NZ - 2, Math.round((sp.lz - Z0) / DX - 0.5)));
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const c = (k0 + a) * NX + (i0 + b), r = C.reed[c]; if (r >= 0) return 'reed:' + r; }
  return C.timber[k0 * NX + i0] ? 'timber' : null;
}
/** the mix that landed on the timber went over it: out of the segment (returns its volume, amah³) */
export function spillOff(sim, C) {
  let v = 0; for (let c = 0; c < N; c++) if (C.timber[c] && sim.vol[c] > 0) { v += sim.vol[c]; sim.vol[c] = 0; }
  return v * DX * DX;
}
/** the crew pull a clogged reed and set a new one: the corner's mix round it comes out, to be poured again */
export function clearAround(sim, x, z, r) {
  for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++) { const c = k * NX + i; if (Math.hypot(cellX(i) - x, cellZ(k) - z) <= r) { sim.vol[c] = 0; sim.solid[c] = 0; sim.heat[c] = 0; } }
  sim.updateHollow();
}

/* ───────── a pour in the save (rule: progress survives a reload) ─────────
 * what stands in the segment, set: ground excluded, the liquid counted as set where it lies (a cold mix does not flow, so a reload in
 * the middle of a pour keeps it as it stopped: the spec's "התוצאה נשארת במקום שבו הוא נעצר"); the patch's cells; the cauldrons used */
const Q = 100;   // (the set mix in hundredths of an amah, one byte a cell)
const b64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return typeof btoa === 'function' ? btoa(s) : Buffer.from(u8).toString('base64'); };
const unb64 = (s) => { if (typeof atob !== 'function') return new Uint8Array(Buffer.from(s, 'base64')); const t = atob(s), u = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i); return u; };
export function packWork(sim, o = {}) {
  const set = new Uint8Array(N), patch = new Uint8Array(N);
  for (let c = 0; c < N; c++) { set[c] = Math.max(0, Math.min(255, Math.round((sim.solid[c] + sim.vol[c]) * Q))); patch[c] = sim.patch[c]; }
  return { v: 1, set: b64(set), patch: b64(patch), used: sim.cauldron.used | 0, repour: !!sim.repour, ...o };
}
export function unpackWork(sim, w) {
  if (!w || w.v !== 1 || !w.set) return false;
  const set = unb64(w.set), patch = w.patch ? unb64(w.patch) : null; if (set.length !== N) return false;
  for (let c = 0; c < N; c++) { sim.vol[c] = 0; sim.heat[c] = 0; sim.solid[c] = set[c] / Q; if (patch) sim.patch[c] = patch[c]; }
  sim.repour = !!w.repour;
  const ca = sim.cauldron; ca.used = Math.max(1, w.used | 0); ca.amount = ca.cap; ca.heat = 1; ca.swapping = 0;
  sim.updateHollow();
  return true;
}
/* ───────── a re-poured place's patch (the world draws it, the finale whitens it a little grey): one ragged outline for both ─────────
 * at [x, z] and n (the hollow's radius in tenths of an amah, pour.hollow's mark); never smaller than a man's stride across */
export const PATCH_MIN = 1.5, PATCH_MAX = 2.2;
export const patchR = (n) => Math.min(PATCH_MAX, Math.max(PATCH_MIN, (+n || 0) / 10));
export const patchSeed = (x, z) => x * 7.1 + z;
/** the outline's reach at angle a (radians), as a share of the radius */
export const patchK = (a, seed) => 0.82 + 0.1 * Math.sin(a * 3 + seed) + 0.08 * Math.sin(a * 7 + seed * 1.7);
/** is the point (px, pz) inside the patch of a mark? */
export function inPatch(px, pz, x, z, n) { const dx = px - x, dz = pz - z, d = Math.hypot(dx, dz), R = patchR(n); return d <= R * patchK(Math.atan2(dz, dx), patchSeed(x, z)); }
export { T as SIM_T, NX, NZ, N, DX, X0, Z0, cellX, cellZ };
