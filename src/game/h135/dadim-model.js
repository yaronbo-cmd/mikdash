/* ── build 135 ── h135/dadim-model.js — work 1 "שנים עשר הדדים" (spec docs/specs/shlav-12-he.md v7, עבודה 1). Pure: no three.js,
 * no DOM. Every place is BOOK.s12's (the seats, the stations, their slabs, the rings). Units: amot, seconds, degrees.
 *
 * Six stone stations east of the kiyor (spec v6: no figures), each a slab with two engraved hands over two engraved feet (Rambam Biat
 * Mikdash 5:16); each station has two sources: one upper spigot for the morning, one lower for the evening (Yoma 37a). A spigot is
 * dragged from the basket to a free seat (its height is the seat's); the work finger on it turns its mouth (±30° each way); the water:
 * at level 1 the plug opens by itself; from level 2 the helping hand holds the knob that popped out on the rack (the rod pulls the
 * plug) — the arc lives while it is held; letting the knob go closes the plug and LOCKS the spigot as it points (level 1: lifting the
 * work finger locks it).
 * WHERE THE ARC LANDS at the lock: on the engraved hands of a station that has no stream of this row yet = 40; on the feet = 20; on the
 * slab = 10; on the floor or the kiyor = wet: the spigot opens again (free, no damage) and is aimed again; two of one row on one station
 * = 10, the streams clash and splash. Forcing the mouth past its range for half a second scratches the seat (−20).
 * THE TESTS (levels 2–3; level 1 the morning only, a show): the morning — the kiyor full to the sun ring, the six upper open together;
 * the evening — the water down to the moon ring by the drain, the upper shut, the six lower open (level 3: the lower arcs weaker and
 * flatter — less head). A station dry in a test: the spigot of that row that serves no station alone opens for a fix (a new step, 20 at most).
 *   fresh(lv, S12) · arc(S, seat, o) → { pts, land } · place(S, seat) · aim(S, seat, dyaw, dpitch) · lock(S, seat) → { grade | wet } ·
 *   test(S, 'morning' | 'evening') → { dry: [stations], fix: [seats] } · result(S) · save / load
 */
export const DK = Object.freeze({ RANGE: 30, FORCE_T: 0.5, G: 9.8, V: { up: 3.8, down: 4.0, eve3: 3.6 }, TIP: 0.28, SLAB_T: 0.14 });
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const RAD = Math.PI / 180;

export function fresh(lv, S12) {
  lv = clamp(lv | 0 || 1, 1, 3);
  // level 1: two spigots only, before Ben Katin (Yoma 3:10) — the two middle upper seats, the two middle stations
  const seats = lv === 1 ? S12.seats.filter((s) => s.row === 'up' && (s.i === 2 || s.i === 3)) : S12.seats.slice();
  const stations = lv === 1 ? S12.stations.filter((s) => s.i === 2 || s.i === 3) : S12.stations.slice();
  const sp = {}; for (const s of seats) sp[s.n] = { n: s.n, placed: false, locked: false, yaw: 0, pitch: 0, land: null, grade: null, fix: false, scratched: false };
  return { lv, S12, mount: mounts(S12), seats: seats.map((s) => s.n), stations: stations.map((s) => s.i), sp, basket: seats.length, steps: [], flaws: [], tests: {}, phase: 'place', first: true, wets: 0, clashes: 0 };
}
export const seatOf = (S, n) => S.S12.seats[n];
/** each seat's mount (המחשה): the spigot sits in its seat tilted so its own station is within its range — the pitch that lands a
 *  morning stream (its row's speed) on the station's middle at the seat's bearing, rounded to 5° (so the rest aim never lands exact) */
const MOUNTS = new Map();
export function mounts(S12) {
  if (MOUNTS.has(S12)) return MOUNTS.get(S12);
  const out = {};
  for (const s of S12.seats) {
    const st = S12.stations[s.i], b = s.bear * RAD, v = s.row === 'up' ? DK.V.up : DK.V.down;
    const x0 = s.x + Math.cos(b) * DK.TIP, z0 = s.z + Math.sin(b) * DK.TIP, d = Math.hypot(st.x - x0, st.z - z0), h = s.y - (S12.floor + DK.SLAB_T);
    let best = 0, bd = 1e9;
    for (let q = -40; q <= 40; q += 0.5) { const r = q * RAD, vy = v * Math.sin(r), vh = v * Math.cos(r), t = (vy + Math.sqrt(vy * vy + 2 * DK.G * h)) / DK.G, e = Math.abs(vh * t - d); if (e < bd) { bd = e; best = q; } }
    out[s.n] = Math.round(best / 5) * 5;
  }
  MOUNTS.set(S12, out); return out;
}
export const stationOf = (S, i) => S.S12.stations[i];
/** a station's slab top (its low step's height by level, the slab's own thickness) */
export const slabY = (S, st) => S.S12.floor + (st.h[S.lv] || 0) + DK.SLAB_T;
/** the station's frame: forward (toward the kiyor) and right, on the ground */
export function frame(st) { const f = [Math.sin(st.yaw), Math.cos(st.yaw)], r = [f[1], -f[0]]; return { f, r }; }
/** the speed of a row's stream: the morning (the kiyor full), the evening (level 3: less head on the lower row) */
export function speedOf(S, row, when = 'morning') { if (row === 'up') return DK.V.up; return S.lv === 3 && when === 'evening' ? DK.V.eve3 : DK.V.down; }
/** the spigot's mouth: its seat on the kiyor's wall, its direction (yaw: the seat's bearing + the turn; pitch: up +) */
export function mouthOf(S, n) {
  const s = seatOf(S, n), p = S.sp[n] || { yaw: 0, pitch: 0 }, b = (s.bear + p.yaw) * RAD, pr = (p.pitch + ((S.mount && S.mount[n]) || 0)) * RAD, br = s.bear * RAD;
  return { x: s.x + Math.cos(br) * DK.TIP, y: s.y, z: s.z + Math.sin(br) * DK.TIP, dx: Math.cos(b) * Math.cos(pr), dy: Math.sin(pr), dz: Math.sin(b) * Math.cos(pr) };
}
/** where a point on the ground is on a station: 'hands' | 'feet' | 'slab' | null */
export function zoneOf(S, st, x, z) {
  const { f, r } = frame(st), dx = x - st.x, dz = z - st.z, u = dx * f[0] + dz * f[1], v = dx * r[0] + dz * r[1], SL = S.S12.slab;
  if (Math.abs(u) > SL.d / 2 || Math.abs(v) > SL.w / 2) return null;
  const H = SL.hands, hr = S.lv === 1 ? H.rL1 : H.r;
  for (const sd of [-1, 1]) if (Math.hypot(u - H.fwd, v - sd * H.side) <= hr) return 'hands';
  const Ft = SL.feet; for (const sd of [-1, 1]) if (Math.abs(u - Ft.fwd) <= Ft.l / 2 && Math.abs(v - sd * Ft.side) <= Ft.w / 2) return 'feet';
  return 'slab';
}
/** the arc of a spigot's stream: its points (for the drawing) and where it lands — the first slab under it, else the floor */
export function arc(S, n, o = {}) {
  const m = mouthOf(S, n), s = seatOf(S, n), v = o.v != null ? o.v : speedOf(S, s.row, o.when), g = DK.G, F = S.S12.floor;
  const vx = m.dx * v, vy = m.dy * v, vz = m.dz * v;
  const tAt = (y) => { const a = -g / 2, b = vy, c = m.y - y, D = b * b - 4 * a * c; if (D < 0) return null; return (-b - Math.sqrt(D)) / (2 * a); };
  let land = null;
  for (const i of S.stations) {
    const st = stationOf(S, i), y = slabY(S, st), t = tAt(y); if (!(t > 0)) continue;
    const x = m.x + vx * t, z = m.z + vz * t, zone = zoneOf(S, st, x, z);
    if (zone && (!land || t < land.t)) land = { t, x, y, z, station: i, zone };
  }
  // (a station not in play this level: its slab still catches the water — a slab, nothing more)
  if (!land) { const t = tAt(F); land = { t, x: m.x + vx * t, y: F, z: m.z + vz * t, station: null, zone: 'floor' }; }
  // the kiyor itself (a stream turned back on the wall): inside its radius at the landing
  const K = S.S12.kiyor; if (Math.hypot(land.x - K.x, land.z - K.z) < K.r1 + 0.1) land.zone = 'kiyor';
  const N = o.n || 18, pts = []; for (let k = 0; k <= N; k++) { const t = (land.t * k) / N; pts.push([m.x + vx * t, m.y + vy * t - (g / 2) * t * t, m.z + vz * t]); }
  return { pts, land, v };
}
export function place(S, n) { const p = S.sp[n]; if (!p || p.placed) return false; p.placed = true; S.basket = Math.max(0, S.basket - 1); return true; }
/** turn the mouth by (dyaw, dpitch) degrees; past the range it stops — held there, `force` counts toward a scratch */
export function aim(S, n, yaw, pitch) {
  const p = S.sp[n]; if (!p || p.locked) return { out: false };
  const out = Math.abs(yaw) > DK.RANGE + 0.5 || Math.abs(pitch) > DK.RANGE + 0.5;
  p.yaw = clamp(yaw, -DK.RANGE, DK.RANGE); p.pitch = clamp(pitch, -DK.RANGE, DK.RANGE);
  return { out };
}
export function scratch(S, n) { const p = S.sp[n]; if (!p || p.scratched) return false; p.scratched = true; S.flaws.push({ f: 'dadim.scratch', seat: n }); return true; }
/** the lock: the stream where it lands now → the step's grade, or wet (it opens again) */
export function lock(S, n) {
  const p = S.sp[n]; if (!p || !p.placed || p.locked) return null;
  const s = seatOf(S, n), A = arc(S, n, { when: whenOf(S, n) }), L = A.land;
  if (L.station == null || L.zone === 'floor' || L.zone === 'kiyor') { S.wets++; return { wet: true, land: L }; }
  const same = Object.values(S.sp).some((q) => q !== p && q.locked && seatOf(S, q.n).row === s.row && q.land && q.land.station === L.station);
  let grade = same ? 'soft' : L.zone === 'hands' ? 'gold' : L.zone === 'feet' ? 'good' : 'soft';
  if (p.fix && grade === 'gold') grade = 'good';   // (a fix: 20 at most)
  if (same) S.clashes++;
  p.locked = true; p.land = { station: L.station, zone: L.zone, x: L.x, z: L.z }; p.grade = grade;
  S.steps.push({ n, grade, fix: !!p.fix, clash: same }); p.fix = false;
  return { grade, land: L, clash: same };
}
/** the hour a spigot serves — the hour its lock is judged at (level 3: the lower row in the evening's weaker stream; the live arc while
 *  aiming is the full kiyor's: he must aim the lower ones so the weak stream still reaches) */
export const whenOf = (S, n) => (S.lv === 3 && seatOf(S, n).row === 'down' ? 'evening' : 'morning');
/** a test: the row's streams at that hour; the dry stations; the spigots to open for a fix (those of the row that serve no station alone) */
export function test(S, when) {
  const row = when === 'evening' ? 'down' : 'up', mine = S.seats.filter((n) => seatOf(S, n).row === row);
  const hits = {}, land = {};
  for (const n of mine) { const L = arc(S, n, { when }).land; land[n] = L; if (L.station != null && L.zone !== 'kiyor') (hits[L.station] = hits[L.station] || []).push(n); }
  const dry = S.stations.filter((i) => !hits[i]);
  const fix = [];
  if (dry.length) {
    const spare = mine.filter((n) => { const L = land[n]; return L.station == null || L.zone === 'kiyor' || (hits[L.station] && hits[L.station].length > 1 && hits[L.station][0] !== n); });
    for (let k = 0; k < Math.min(dry.length, spare.length); k++) { const q = S.sp[spare[k]]; q.locked = false; q.fix = true; fix.push(spare[k]); }
  }
  const all = S.stations.every((i) => hits[i] && hits[i].some((n) => land[n].zone === 'hands'));
  S.tests[when] = { dry, fix, hits, all, n: (S.tests[when] ? S.tests[when].n : 0) + 1 };
  return { dry, fix, hits, land, all };
}
/** all the spigots in play locked */
export const allLocked = (S) => S.seats.every((n) => S.sp[n].locked);
export function result(S) {
  const n = S.steps.length || 1, pts = S.steps.reduce((a, s) => a + (s.grade === 'gold' ? 40 : s.grade === 'good' ? 20 : 10), 0), gold = S.steps.filter((s) => s.grade === 'gold').length;
  const scr = S.flaws.filter((x) => x.f === 'dadim.scratch').length, fixes = S.steps.filter((s) => s.fix).length;
  const firstAll = !!(S.tests.morning && S.tests.morning.all && S.tests.morning.n === 1 && (S.lv === 1 || (S.tests.evening && S.tests.evening.all && S.tests.evening.n === 1)));
  const stars = gold === S.steps.length && !scr && !fixes && !S.clashes ? 3 : !scr && gold / n >= 0.6 ? 2 : 1;
  return { stars, q: pts / (n * 40), pts, perfect: stars === 3, bonus: firstAll, flags: { spigots: S.seats.length, gold, scratches: scr, fixes, clashes: S.clashes, wets: S.wets } };
}
export function save(S, id) { const sp = {}; for (const [k, p] of Object.entries(S.sp)) sp[k] = { ...p }; return { id, v: 1, lv: S.lv, sp, steps: S.steps, flaws: S.flaws, tests: S.tests, phase: S.phase, wets: S.wets, clashes: S.clashes }; }
export function load(b, S12) { if (!b || b.v !== 1) return null; const S = fresh(b.lv, S12); for (const [k, p] of Object.entries(b.sp || {})) if (S.sp[k]) Object.assign(S.sp[k], p); S.basket = S.seats.filter((n) => !S.sp[n].placed).length; Object.assign(S, { steps: b.steps || [], flaws: b.flaws || [], tests: b.tests || {}, phase: b.phase || 'place', wets: b.wets | 0, clashes: b.clashes | 0, first: false }); return S; }
/** the aim that lands a stream on a station's hands (the tests' solver: a grid search over the range) */
export function solve(S, n, i, when) {
  const p = S.sp[n], keep = [p.yaw, p.pitch]; let best = null;
  for (let y = -DK.RANGE; y <= DK.RANGE; y += 0.5) for (let q = -DK.RANGE; q <= DK.RANGE; q += 0.5) {
    p.yaw = y; p.pitch = q; const L = arc(S, n, { when }).land;
    if (L.station === i && L.zone === 'hands') { const st = stationOf(S, i), d = Math.hypot(L.x - st.x, L.z - st.z); if (!best || d < best.d) best = { yaw: y, pitch: q, d }; }
  }
  [p.yaw, p.pitch] = keep; return best;
}
