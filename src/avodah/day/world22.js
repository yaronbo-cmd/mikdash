/* world22.js — where the אמרכל may walk in the finished Temple (ENGINE22): the floors of the Temple Mount's courts, the walls and
 * every solid of avodah3d.js (the altar, the kevesh, the House, the Ulam — so the Heichal's door and the פרוכת past it are a wall
 * to the stick; the Kodesh HaKodashim block of stages.js stays too), and the sky for the game's hour. */
import { WALLS22 } from '../../avodah3d.js';
import { ALTAR, KEVESH } from '../../places.js';   // ── recovered (16–26c) ──
/** the floors: the azara · Nikanor's gate (the one opening in the east wall) · the courts east of it · Beit HaMoked · Lishkat HaGazit */
export const FLOORS = [[-187, -11, -67.5, 67.5], [-11, -8, -5, 5], [-8, 143, -67.5, 67.5], [-178, -142, -83, -67.5], [-100, -62, 67.5, 83]];
const inF = (x, z) => { for (let i = 0; i < FLOORS.length; i++) { const f = FLOORS[i]; if (x >= f[0] && x <= f[1] && z >= f[2] && z <= f[3]) return true; } return false; };
const inR = (r, x, z) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1;
// ── recovered (16–26c) ── the altar's body up to the ramp's top, and the ramp
const ALTAR22 = Object.freeze([{ x0: ALTAR.body.x0, x1: ALTAR.body.x1, z0: ALTAR.body.z0, z1: KEVESH.zTop }, { x0: KEVESH.x0, x1: KEVESH.x1, z0: KEVESH.zTop, z1: KEVESH.zFoot }]);
const FOOT22 = KEVESH.zFoot - 2.5;   // (past this, at the ramp's foot, he steps on and off)
export const onHigh = (x, z) => (x > ALTAR22[0].x0 && x < ALTAR22[0].x1 && z > ALTAR22[0].z0 && z <= ALTAR22[0].z1) || (x > ALTAR22[1].x0 && x < ALTAR22[1].x1 && z > ALTAR22[1].z0 && z <= ALTAR22[1].z1);
const RAMP_X = (KEVESH.x0 + KEVESH.x1) / 2;
// ── recovered (16–26c) ── (the names below — rampWay, houseFloor, HOUSE22, ALTAR22, FOOT22, RAMP_X, KEVESH_WALL, HEICHAL_VESSELS —
// are the recovery's; the bundle kept none; but onHigh is the original's: day33.js:936, :1304, :1385 call it so)
/** on the altar or the kevesh: the way down — the ramp's top (when above it), then past its foot (flow31's gold path) */
export function rampWay(x, z) {
  if (!onHigh(x, z)) return [];
  const pts = [], wx = RAMP_X - 4;
  if (z <= KEVESH.zTop + 0.5) pts.push({ x: wx, z: KEVESH.zTop + 1.5 });
  pts.push({ x: wx, z: KEVESH.zFoot + 1.5 });
  return pts;
}
/** with the House open (HOUSE22.on): the floor he may walk in the Ulam's steps and hall, and (HOUSE22.gate, build 26) in the
 * Heichal, round its three vessels (stages.hero.twinPass) */
export function houseFloor(x, z) {
  if (!HOUSE22.on) return false;
  const az = Math.abs(z);
  if (x > -76.6 && x < -54.6) return az < 30 && !(x > -66.7 && x < -60.3 && z > 16.8 && z < 23.2);
  if (x > -81.2) return x < -54.6 && az < 9.3;
  if (x > -91.6) return az < 29;
  if (!HOUSE22.gate) return false;
  if (x > -98.4) return az < 4.4;
  return x > -136.4 && az < 9.2 && !HEICHAL_VESSELS.some((r) => x > r[0] && x < r[1] && z > r[2] && z < r[3]);
}
/** ── fable32 (build 37) ── the gap beside the Ulam's door: between the top of its steps (the ground 22 from x −76 east) and its front
 *  wall (x −76.6), north and south of the door (|z| 9.3…31), the ground is the court's — 6 below; a step west off the top dropped him
 *  into a slot he could not climb out of (the naive kid at 640 × 296: hard stucks at (−76.3, ±10) in three of nine runs, the parent's
 *  hand could not move him either). A wall to his feet (blocked) and to the gold path (flow31); one already in it is set back on the
 *  step (day33). ── /fable32 ── */
export const gap37 = (x, z) => x > -76.65 && x < -75.95 && Math.abs(z) > 9.3 && Math.abs(z) < 31;
/** stages.hero.twinExtra: true = the step is blocked (never off the Temple's floors; never into a solid he is not already in) */
export function blocked(x, z, x0, z0) {
  if (gap37(x, z) && !gap37(x0, z0)) return true;   // ── fable32 (build 37) ── ── /fable32 ──
  // ── recovered (16–26c) ── the House's floor is free; out of it only eastward, past the Ulam's front
  if (HOUSE22.on) {
    if (houseFloor(x, z)) return false;
    if (houseFloor(x0, z0) && x < (Math.abs(z) >= 29.5 ? -55.6 : -54.6)) return true;
  }
  if (!inF(x, z) && inF(x0, z0)) return true;
  // ── recovered (16–26c) ── the altar and the kevesh are one walk: on and off them only at the ramp's foot
  const was = onHigh(x0, z0), on = onHigh(x, z);
  if (was && on) return false;
  if (was && !on) return !(z0 > FOOT22 && z > FOOT22);
  if (!was && on) return !(z0 > FOOT22 && z > FOOT22 && x > KEVESH.x0 && x < KEVESH.x1);
  for (let i = 0; i < WALLS22.length; i++) { const r = WALLS22[i]; if (i !== KEVESH_WALL && inR(r, x, z) && !inR(r, x0, z0)) return true; }   // ── recovered (16–26c) ── (the kevesh's own wall: the rule above)
  return false;
}
/** the world's sky for a temple hour: night · dawn · noon · golden · dusk */
export function skyFor(h) {
  if (h >= 18 && h < 18.7) return 'dusk';
  if (h >= 18.7 || h < 4.2) return 'nightd';   // ── polish23 ── (the dark night: main.js TIMES.nightd)
  if (h < 6.4) return 'dawn';
  if (h < 15) return 'noon';
  if (h < 16.9) return 'golden';
  return 'dusk';
}
/** is (x, z) a free floor (on a Temple floor, in no solid)? — for a work's props */
export function free(x, z) {
  if (!inF(x, z)) return false;
  for (let i = 0; i < WALLS22.length; i++) if (inR(WALLS22[i], x, z)) return false;
  return true;
}
// ── recovered (16–26c) ── (these three after the functions: the bundle keeps them a statement apart)
const KEVESH_WALL = WALLS22.findIndex((r) => r.x0 < -46 && r.x0 > -48 && r.z1 > 42 && r.z1 < 44);
/** the House: on = the Ulam open to him; gate = the Heichal too (set by the shift) */
export const HOUSE22 = { on: false, gate: false };
/** ── fable32 (build 27) ── the blood roles' way west of the altar: the Ulam's lowest steps by the altar's west face ("בין האולם ולמזבח",
 *  מדות ג, ו — twelve steps in those 22 amot), walked while his blood role is on (WEST27.on, set by the shift) — the receiver from the
 *  north-east corner round the north and the west to the south-west, as the court's kohanim walk with the limbs; else the steps stay
 *  a wall to the feet (stages.js 'ulam' footprint, flow31's FREE) */
export const WEST27 = { on: false };
export const westStrip27 = (x, z) => WEST27.on && x > -58.6 && x < -55 && z > -25.5 && z < 44;
/** the Heichal's three vessels (x0, x1, z0, z1): the golden altar in the middle, the table north, the menorah south */
const HEICHAL_VESSELS = [[-122.1, -119.9, -1.1, 1.1], [-126.7, -123.3, -8.6, -6.4], [-126.9, -121.6, 6.2, 8.8]];
