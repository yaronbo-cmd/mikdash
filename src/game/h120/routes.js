/* ── build 120 ── h120/routes.js — the fixed places of stage 05's site (rule 56) and station 3's three ways (brief §6), pure: no
 * three.js, no DOM, so the world draws them, the act reads them and the tests prove them from one table.
 *   YARD, SCAFF, PILES, LANE, LIME     the site's places (world.js draws them)
 *   CARRY_PLACES[lv]                   station 3's way at bay lv: its start, its marking, its checkpoints, its jars, the worker in the
 *                                      way, the moving carriers' lane (level 3)
 *   carryObs(lv, o)                    every obstacle the beam meets on that way, as model.beamHits reads them
 *   carryStart(lv, L), markOf(lv, L), inMark(s, mk, tolDeg), laneAt(s), laneState(t, which), moverAt(lv, k, t)
 * Amot throughout: +x east, +z south.
 */
import { H120, COLS, COL_IDS, BAYS, LADDERS, bayDir } from './model.js';

/** the carpenters' yard: brief "about (90, −24)", moved south-west (it met the crane's drop at (96, −25) and its jib) */
export const YARD = Object.freeze({
  his: Object.freeze({ x0: 80, x1: 92, z: -31.5 }),      // his beam's trestles (station 2)
  saw: Object.freeze({ x0: 79, x1: 91, z: -26.6 }),      // the yard sawyers' beam
  stock: Object.freeze({ x: 99.4, z0: -33.2, z1: -21.2 }),   // the beam stock along the wood chamber's west wall
  offcut: Object.freeze([94.6, -34.2]), short: Object.freeze([84, -35.4]), bench: Object.freeze([95.6, -29.6]),
});
/** scaffolds on the chambers' walls: [x0, z0, x1, z1] footprints (two lifts). The wood chamber's (index 1) stands west of the east
 *  wing's marking: with the lime pit it makes level 3's narrow pass of four amot (x 130.6 … 134.6) */
export const SCAFF = Object.freeze([[46.2, -47, 48.4, -41], [126.6, -27.3, 130.6, -25.3], [107, 25.3, 113, 27.3], [46.2, 38, 48.4, 44]]);
/** stone piles: [x, z, n] */
export const PILES = Object.freeze([[64, -40, 7], [109, -14, 6], [70, 42, 6], [112, 40, 5]]);
/** the sledges' lane: from outside the east gate through it to the wood chamber's door (x 117…125, z −27.5) */
export const LANE = Object.freeze([[156, -5.5], [139, -5.5], [128, -12], [121, -21], [121, -29.2]]);
/** the plasterers' lime pit by the wood chamber's south wall, east of the scaffold (level 3's pass; only feet count) */
export const LIME = Object.freeze({ x0: 134.6, z0: -27.3, x1: 137.4, z1: -23.3 });

/* ───────── the lane's timetable (the sledge and the ox cart: fixed periods, rule 56) ───────── */
export const LANE_L = (() => { let L = 0; for (let i = 1; i < LANE.length; i++) L += Math.hypot(LANE[i][0] - LANE[i - 1][0], LANE[i][1] - LANE[i - 1][1]); return L; })();
/** a point along the lane at distance s (amot from its outer end), and its heading */
export function laneAt(s) {
  let acc = 0;
  for (let i = 1; i < LANE.length; i++) { const [ax, az] = LANE[i - 1], [bx, bz] = LANE[i], L = Math.hypot(bx - ax, bz - az); if (s <= acc + L || i === LANE.length - 1) { const u = Math.max(0, Math.min(1, (s - acc) / L)); return { x: ax + (bx - ax) * u, z: az + (bz - az) * u, yaw: Math.atan2(bx - ax, bz - az) }; } acc += L; }
  return { x: LANE[0][0], z: LANE[0][1], yaw: 0 };
}
/** where the sledge and the cart are at time t (their own clocks): in at 1.1 / 1.6 amot/s, unloading 5 s, out, then outside the gate
 *  50 / 40 s (the quarry's and the farm's way: so the court's crossing is clear now and then); the cart half a period later */
export const LANE_OFF = Object.freeze({ sledge: 50, cart: 40 });
export const lanePeriod = (which) => 2 * LANE_L / (which === 'sledge' ? 1.1 : 1.6) + 5 + LANE_OFF[which];
export function laneState(t, which = 'sledge') {
  const V = which === 'sledge' ? 1.1 : 1.6, P = lanePeriod(which), u = (((t + (which === 'sledge' ? 0 : P / 2)) % P) + P) % P, tin = LANE_L / V;
  if (u < tin) return { s: u * V, dir: 1 };
  if (u < tin + 5) return { s: LANE_L, dir: 0 };
  if (u < 2 * tin + 5) return { s: LANE_L - (u - tin - 5) * V, dir: -1 };
  return { s: 0, dir: 0, off: 1 };
}
/** the footprint (circles) of the sledge with its three men, or of the cart with its oxen and drover, at lane distance s going dir */
export function laneShape(which, s, dir) {
  const q = laneAt(s), ahead = (d) => laneAt(Math.max(0, Math.min(LANE_L, s + (dir >= 0 ? d : -d))));
  if (which === 'sledge') return [{ c: [q.x, q.z], r: 1.7 }, ...[3.2, 4.3, 5.4].map((d) => { const p = ahead(d); return { c: [p.x, p.z], r: 0.5 }; })];
  const o = ahead(5), d = ahead(6.5);
  return [{ c: [q.x, q.z], r: 1.6 }, { c: [o.x, o.z], r: 1.3 }, { c: [d.x, d.z], r: 0.5 }];
}

/* ───────── station 3: the three ways ───────── */
/**
 * per bay: start — the beam lifted off his trestles (along x at z −29.6, the kohen at the west end, the worker at the east);
 * mark — the green marking on the floor (centre, axis, the across tolerance); checks — checkpoints { id, name, rect, by: 'mid' |
 * 'front' | 'both' }; jars, worker — [x, z]; movers — the carriers' lane (level 3: firewood from the pile to the wood chamber's door).
 * The narrowest pass of each way (brief's table 6 / 5 / 4): pass { a, b, w } its two sides and its width.
 */
export const CARRY_PLACES = Object.freeze({
  1: Object.freeze({
    mark: Object.freeze({ c: [62.5, 59.5], axis: 'x', across: 0.8 }),
    jars: Object.freeze([[78.5, 42]]), worker: Object.freeze([73.5, 8]),
    pass: Object.freeze({ a: 'the stone pile (70, 42)', b: 'the jar (78.5, 42)', w: 6 }),
    checks: Object.freeze([Object.freeze({ id: 'turn', name: 'הסיבוב הרחב', rect: [60, 50, 86, 61], by: 'front' })]),
    up: Object.freeze([0, 1]),                // (the way runs up the screen: the camera looks along it)
  }),
  2: Object.freeze({
    mark: Object.freeze({ c: [62.5, -65], axis: 'x', across: 0.8 }),
    jars: Object.freeze([[66.2, -55.4]]), worker: Object.freeze([73.6, -44]),
    pass: Object.freeze({ a: 'the column line (z −62.5)', b: 'the court\'s north wall (z −67.5)', w: 5 }),
    checks: Object.freeze([Object.freeze({ id: 'cols', name: 'בין העמודים', rect: [68.8, -63.3, 78.2, -61.7], by: 'front' }), Object.freeze({ id: 'strip', name: 'לרצועה', rect: [56, -67.5, 72, -63.4], by: 'both' })]),
    up: Object.freeze([0, -1]),
  }),
  3: Object.freeze({
    mark: Object.freeze({ c: [132.6, -21.2], axis: 'z', across: 0.8 }),
    jars: Object.freeze([[116.2, -23.6]]), worker: Object.freeze([104.5, -18.4]),
    pass: Object.freeze({ a: 'the scaffold\'s legs (x 130.6)', b: 'the lime pit (x 134.6)', w: 4 }),
    checks: Object.freeze([Object.freeze({ id: 'lane', name: 'מעבר השביל', rect: [119, -24, 127, -14], by: 'mid' }), Object.freeze({ id: 'pass', name: 'המעבר הצר', rect: [130.6, -27.3, 134.6, -23.3], by: 'front' })]),
    movers: Object.freeze([[108.6, -12.2], [114, -19.6], [119.4, -26.6]]),
    up: Object.freeze([1, 0]),
  }),
});
/** the beam lifted off his trestles: front (the kohen) and rear (the worker) */
export function carryStart(lv, L) { const z = -29.6, x0 = YARD.his.x0; void lv; return { f: [x0, z], r: [x0 + L, z], L }; }
/** the marking for a beam of length L: its rect, axis and centre (the ends inside it, a little to spare) */
export function markOf(lv, L) {
  const P = CARRY_PLACES[lv].mark, h = (L + 0.9) / 2, a = P.across, [cx, cz] = P.c;
  const rect = P.axis === 'x' ? [cx - h, cz - a, cx + h, cz + a] : [cx - a, cz - h, cx + a, cz + h];
  return { rect, axis: P.axis, c: P.c, L };
}
const inR = (p, r) => p[0] >= r[0] && p[0] <= r[2] && p[1] >= r[1] && p[1] <= r[3];
/** the beam handed over: both ends inside the marking, its angle to the marking's axis (deg) within tol → { ends, ang, ok } */
export function inMark(s, mk, tol) {
  const ends = inR(s.f, mk.rect) && inR(s.r, mk.rect);
  const a = Math.abs(Math.atan2(s.f[1] - s.r[1], s.f[0] - s.r[0])) * 180 / Math.PI, ax = a > 90 ? 180 - a : a, ang = mk.axis === 'x' ? ax : 90 - ax;
  return { ends, ang: +ang.toFixed(2), ok: ends && ang <= tol + 1e-9 };
}
/** a level-3 carrier on the movers' lane at time t (k: 0 or 1, half a period apart): position, heading, loaded */
export const MOVER_V = 1.3;
export function moverAt(lv, k, t) {
  const L = CARRY_PLACES[lv].movers; if (!L) return null;
  let len = 0; const seg = []; for (let i = 1; i < L.length; i++) { const d = Math.hypot(L[i][0] - L[i - 1][0], L[i][1] - L[i - 1][1]); seg.push(d); len += d; }
  const P = 2 * (len / MOVER_V + 1.5), u = (((t + k * P / 2) % P) + P) % P, tin = len / MOVER_V;
  let s, dir; if (u < tin) { s = u * MOVER_V; dir = 1; } else if (u < tin + 1.5) { s = len; dir = 0; } else if (u < 2 * tin + 1.5) { s = len - (u - tin - 1.5) * MOVER_V; dir = -1; } else { s = 0; dir = 0; }
  let acc = 0; for (let i = 0; i < seg.length; i++) { if (s <= acc + seg[i] || i === seg.length - 1) { const v = Math.max(0, Math.min(1, (s - acc) / seg[i])), a = L[i], b = L[i + 1]; const yaw = Math.atan2(b[0] - a[0], b[1] - a[1]) + (dir < 0 ? Math.PI : 0); return { x: a[0] + (b[0] - a[0]) * v, z: a[1] + (b[1] - a[1]) * v, yaw, dir, loaded: dir >= 0 ? 1 : 0, s, len }; } acc += seg[i]; }
  return null;
}

/** a careful player's way at each bay (the bot's, and the tests' proof that each way is open): [lead 'f' | 'r', x, z] — the leading
 *  end walked to the point, the other trailing. Level 2 is the three-move turn: into the strip at the wall, back with the rear into
 *  the strip's east end, then forward along it. Each way ends with the rear set on its mark (the trailer never quite straightens). */
export function carryWay(lv, L) {
  const m = CARRY_PLACES[lv].mark.c;
  if (lv === 1) return [['f', 66, -28.8], ['f', 75, 30], ['f', 75, 46], ['f', 80, 57], ['f', 79, 59.5], ['f', 57, 59.5], ['r', 57 + L, 59.5]];
  if (lv === 2) return [['f', 66, -28.8], ['f', 72, -40], ['f', 76.5, -50], ['f', 76.5, -66.2], ['f', 77.8 - L, -66.2], ['r', 77.4, -63.9], ['f', 57, -65.3], ['r', 57 + L, -65.2]];
  return [['f', 66, -28.8], ['f', 64, -21], ['f', 70, -16], ['f', 96, -17.5], ['f', 120, -17], ['f', 131, -7], ['f', m[0], -16], ['f', m[0], -23], ['r', m[0], -11.5], ['f', m[0], -26.6], ['r', m[0], -26.6 + L]];
}

/* ───────── the obstacles (beam half-width 0.4 in model.beamHits) ───────── */
/** the court's walls, the four chambers' walls (their doors open), the gate house, the steps to Nikanor */
export const WALLS = Object.freeze([
  [0, -76, 150, -67.5], [0, 67.5, 150, 76], [-2, -76, 6, 76], [141, -76, 152, -13], [141, 13, 152, 76], [138, -13, 152, 13], [6, -14, 24, 14],
  [101, 27.5, 103, 67.5], [101, 27.5, 117, 29.5], [125, 27.5, 141, 29.5],
  [101, -67.5, 103, -27.5], [101, -29.5, 117, -27.5], [125, -29.5, 141, -27.5],
  [44, -67.5, 46, -27.5], [6, -29.5, 22, -27.5], [30, -29.5, 46, -27.5],
  [44, 27.5, 46, 67.5], [6, 27.5, 22, 29.5], [30, 27.5, 46, 29.5],
].map((r) => Object.freeze(r)));
/** a column lying on its cradle: which way it lies (as world.js colFrame) */
function lieAlong(id) { for (const lv of [1, 2, 3]) if (BAYS[lv].col === id) return bayDir(lv); return COLS[id].side === 'E' ? [0, 1] : [1, 0]; }
/**
 * every obstacle on the way at bay lv: o = { stands(id) → the column stands, jarsBroken: Set of jar indices, scafDown: Set of scaffold
 * indices, workerAt: [x, z] where the worker stands now (he jumps aside), lime: true (the level-3 pit) }. → [{ kind, id, c, r } |
 * { kind, id, x0, z0, x1, z1 }] for beamHits. The yard: his trestles, the sawyers' trestles and beam, the stock along the wall.
 */
export function carryObs(lv, o = {}) {
  const P = CARRY_PLACES[lv], out = [];
  WALLS.forEach((r, i) => out.push({ kind: 'hard', id: 'wall' + i, x0: r[0], z0: r[1], x1: r[2], z1: r[3] }));
  for (const id of COL_IDS) {
    const c = COLS[id];
    if (!o.stands || o.stands(id)) out.push({ kind: 'hard', id: 'col' + id, c: [c.x, c.z], r: 0.95 });
    else { const a = lieAlong(id), x1 = c.x + a[0] * 10.4, z1 = c.z + a[1] * 10.4; out.push({ kind: 'hard', id: 'lie' + id, x0: Math.min(c.x, x1) - 0.8, z0: Math.min(c.z, z1) - 0.8, x1: Math.max(c.x, x1) + 0.8, z1: Math.max(c.z, z1) + 0.8 }); }
  }
  PILES.forEach(([x, z], i) => out.push({ kind: 'hard', id: 'pile' + i, x0: x - 1.7, z0: z - 0.65, x1: x + 2.0, z1: z + 0.65 }));
  SCAFF.forEach(([x0, z0, x1, z1], si) => { if (o.scafDown && o.scafDown.has(si)) return; for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) out.push({ kind: o.scafHard && o.scafHard.has(si) ? 'hard' : 'scaffold', id: 'sc' + si, c: [x, z], r: 0.15 }); });   // (set up again after a fall: now it only stops the beam)
  LADDERS.forEach(([x, z, fx, fz], i) => { const d = Math.hypot(fx - x, fz - z) || 1, ux = (fx - x) / d, uz = (fz - z) / d; out.push({ kind: 'hard', id: 'lad' + i, c: [x + ux * 0.3, z + uz * 0.3], r: 0.45 }); });
  // the yard: his two trestles, the sawyers' two trestles and their beam, the stock along the wood chamber's wall
  for (const x of [YARD.his.x0 + 2, YARD.his.x1 - 2]) out.push({ kind: 'hard', id: 'tr' + x, x0: x - 0.5, z0: YARD.his.z - 1.1, x1: x + 0.5, z1: YARD.his.z + 1.1 });
  for (const x of [YARD.saw.x0 + 2, YARD.saw.x1 - 2.6]) out.push({ kind: 'hard', id: 'tr' + x, x0: x - 0.5, z0: YARD.saw.z - 1.1, x1: x + 0.5, z1: YARD.saw.z + 1.1 });
  out.push({ kind: 'hard', id: 'sawbeam', x0: YARD.saw.x0, z0: YARD.saw.z - 0.3, x1: YARD.saw.x1, z1: YARD.saw.z + 0.3 });
  out.push({ kind: 'hard', id: 'stock', x0: YARD.stock.x - 1.2, z0: YARD.stock.z0, x1: YARD.stock.x + 1.0, z1: YARD.stock.z1 });
  // the act's things on the way: the jars, the worker in the way, the lime pit (feet only)
  P.jars.forEach(([x, z], i) => { if (!(o.jarsBroken && o.jarsBroken.has(i))) out.push({ kind: 'jar', id: 'jar' + i, c: [x, z], r: 0.5 }); });
  const w = o.workerAt || P.worker; if (w) out.push({ kind: 'worker', id: 'worker', c: [w[0], w[1]], r: 0.35 });
  if (lv === 3) out.push({ kind: 'lime', id: 'lime', ...LIME });
  return out;
}
/** the narrowest pass of a way as the tables have it (amot between the hard sides the beam goes through) */
export function passOf(lv) {
  if (lv === 1) { const p = PILES[2], j = CARRY_PLACES[1].jars[0]; return +((j[0] - 0.5) - (p[0] + 2.0)).toFixed(2); }
  if (lv === 2) return +(-62.5 - -67.5).toFixed(2);
  return +(LIME.x0 - SCAFF[1][2]).toFixed(2);
}
void H120;
