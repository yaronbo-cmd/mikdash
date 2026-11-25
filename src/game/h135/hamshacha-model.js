/* ── build 135 ── h135/hamshacha-model.js — work 3 "ההמשכה מבור הגולה" (spec docs/specs/shlav-12-he.md v7, עבודה 3). Pure: no
 * three.js, no DOM. Units: amot, seconds. Every place is BOOK.s12's (the strip, the mouths, the basin, the stones and the trough).
 *
 * THE STRIP: a grid of half-amah cells over the earth (x −72 … −57, z 28 … 57: 30 × 58). A cell is earth, dug, a hard stone, or the old
 * trough. The bed of a dug channel falls from 15.7 at the mouths' edge (z 57) to 15.2 at the basin's (z 28): under the Golah's water
 * (15.9 on this night), so the water runs by gravity all the way (gravityOk(), the prototype's check, ChatGPT's request on v7).
 *
 * DIGGING (the work finger): dig(S, x, z) carves the cells within CH_R of the finger's path (a channel about an amah wide); it slides round
 * a hard stone; into the trough it does not go (a vessel: the water would be drawn, Mikvaot 4) — an 'trough' event, the X on it.
 * The stroke is sampled every amah; the angle at a sample between the stroke's last two legs is its TURN; a turn past the level's limit
 * is a BEND, the place the water presses the outer bank. A new stroke that starts at the end of an old one carries on its line.
 * THE WATER runs at once (Where's My Water): a dug cell next to a wet one is wet a cell-time later (V cells a second), from the mouth on.
 * A BEND with water in it cracks (the crack spreads, a wet earth's creak) unless the bank is packed (the helping hand held on its strip,
 * PACK_T; level 1 packs its turns by itself and only a hairpin cracks, slowly); a crack that reaches 1 is a BREACH: the water escapes
 * into the earth, a cloud of mud runs into the basin (the turbidity) until the breach is packed — then the clear water pushes the mud out
 * through the drain in seconds. Level 3: the sluice opens and shuts by itself (the current's strength), a strong current cracks gentler
 * turns, and a bank packed too long narrows the channel: the water rises over the lip (an overflow, the same as a breach).
 * A STEP: two amot of a stroke the water ran through: 40 clean, 20 if a bend in it cracked and was packed in time, 10 if it breached.
 * THE GOAL: the basin of forty se'ah fills to its line with the white stones showing (turbidity under CLEAR). Levels 2–3: both mouths'
 * streams must reach it (with one only it fills half way).
 *   fresh(lv, BOOK.s12) · dig · lift · pack(S, x, z, on) · step(S, dt) → events · result(S) · gravityOk(S12) · cellOf / centre
 */
export const HK = Object.freeze({
  CELL: 0.5, CH_R: 0.48, SAMPLE: 1, V: 12, SEG_T: 1.2,
  THR: { 1: 135, 2: 55, 3: 55 }, SOFT3: 40, STRONG: 1.3,
  RATE: { 1: 0.16, 2: 0.42, 3: 0.48 }, PACK_T: { 1: 0.25, 2: 0.55, 3: 0.55 }, OVER_T: 1.8, R_PACK: 1.4, GRACE: { 1: 1.0, 2: 0.7, 3: 0.5 }, PEAK: 0.15,
  MUD_UP: 0.32, MUD_DOWN: 0.45, CLEAR: 0.15, FILL: { 1: 0.11, 2: 0.07, 3: 0.07 }, SLUICE_T: 7,
});
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const EARTH = 0, DUG = 1, STONE = 2, TROUGH = 3;
export const KIND = Object.freeze({ EARTH, DUG, STONE, TROUGH });

export function fresh(lv, S12) {
  lv = clamp(lv | 0 || 1, 1, 3);
  const Fd = S12.field, NX = Math.round((Fd.x1 - Fd.x0) / HK.CELL), NZ = Math.round((Fd.z1 - Fd.z0) / HK.CELL);
  const S = { lv, NX, NZ, x0: Fd.x0, z0: Fd.z0, bed0: Fd.bed0, bed1: Fd.bed1, head: S12.golah.level, t: 0,
    cells: new Uint8Array(NX * NZ), wet: new Float32Array(NX * NZ).fill(-1), src: new Int8Array(NX * NZ).fill(-1), q: [], strokes: [], cur: null, bends: [], segs: [],
    mouths: [], basin: { fill: 0, i: [], line: false }, mud: 0, breaches: 0, troughHits: 0, done: false, events: 0, first: true, packing: [] };
  const mark = (b, k) => { for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const [x, z] = centre(S, i, j); if (x > b[0] && x < b[2] && z > b[1] && z < b[3]) S.cells[j * NX + i] = k; } };
  for (const b of S12.stones[lv] || []) mark(b, STONE);
  if (S12.trough[lv]) mark(S12.trough[lv], TROUGH);
  const ms = lv === 1 ? [S12.golah.mouth1] : [S12.golah.mouth1, S12.golah.mouth2];
  S.mouths = ms.map((p, n) => ({ n, x: p[0], z: Math.min(p[1], Fd.z1 - 0.01), wet: false, reached: false }));
  // the basin's mouth: the cells at the strip's edge over it
  const [bx0, , bx1] = S12.basin.box;
  for (let i = 0; i < NX; i++) { const [x] = centre(S, i, 0); if (x > bx0 && x < bx1) S.basin.i.push(i); }
  return S;
}
export const centre = (S, i, j) => [S.x0 + (i + 0.5) * HK.CELL, S.z0 + (j + 0.5) * HK.CELL];
export function cellOf(S, x, z) { const i = Math.floor((x - S.x0) / HK.CELL), j = Math.floor((z - S.z0) / HK.CELL); return i >= 0 && i < S.NX && j >= 0 && j < S.NZ ? [i, j] : null; }
export const bedOf = (S, z) => S.bed1 + (S.bed0 - S.bed1) * clamp((z - S.z0) / (S.NZ * HK.CELL), 0, 1);
/** the prototype's check (ChatGPT on v7): the Golah's water over the mouths, the bed falling all the way to the basin, the sink line under it */
export function gravityOk(S12) {
  const F = S12.field, ok = [];
  ok.push(S12.golah.level > S12.golah.mouthY);
  ok.push(S12.golah.mouthY >= F.bed0);
  ok.push(F.bed0 > F.bed1);
  ok.push(F.bed1 > S12.pit.sink);
  ok.push(S12.golah.level > S12.pit.sink);
  return ok.every(Boolean);
}
const strength = (S) => (S.lv === 3 ? 1 + 0.55 * Math.sin((S.t / HK.SLUICE_T) * Math.PI * 2) : 1);
export const current = strength;

/* ───────── digging ───────── */
/** the finger goes down on the strip: a new stroke (carrying on an old one's line when it starts at its end) */
export function touch(S, x, z) {
  const st = { pts: [], legs: [], n: S.strokes.length, last: [x, z], troughSaid: false };
  // carry on: the nearest stroke end within 1.2 amah
  let best = null, bd = 1.2;
  for (const o of S.strokes) { const e = o.pts[o.pts.length - 1]; if (!e) continue; const d = Math.hypot(e.x - x, e.z - z); if (d < bd) { bd = d; best = o; } }
  if (best && best.pts.length >= 2) { const a = best.pts[best.pts.length - 2], b = best.pts[best.pts.length - 1]; st.prev = [a, b]; st.pts.push({ ...b, cont: true }); }
  else st.pts.push({ x, z, seg: segNew(S, st) });
  S.strokes.push(st); S.cur = st;
  carve(S, x, z, x, z, st);
  return st;
}
function segNew(S, st) { const g = { n: S.segs.length, stroke: st.n, from: null, to: null, cracked: false, breached: false, grade: null, wetT: -1, cells: [] }; S.segs.push(g); return g.n; }
/** the finger moves: carve from its last point, sample every amah, find the bends */
export function dig(S, x, z) {
  const st = S.cur; if (!st) return [];
  const ev = [];
  const [lx, lz] = st.last; const L = Math.hypot(x - lx, z - lz); if (L < 1e-3) return ev;
  // (no jump through a stone: the carve walks the segment in small steps and stops at a stone — the finger slides round it)
  const n = Math.max(1, Math.ceil(L / (HK.CELL * 0.5)));
  let px = lx, pz = lz;
  for (let k = 1; k <= n; k++) {
    const qx = lx + ((x - lx) * k) / n, qz = lz + ((z - lz) * k) / n, c = cellOf(S, qx, qz);
    if (!c) break;
    const kind = S.cells[c[1] * S.NX + c[0]];
    if (kind === STONE) { ev.push({ k: 'stone', x: qx, z: qz }); break; }
    if (kind === TROUGH) { if (!st.troughSaid) { st.troughSaid = true; S.troughHits++; ev.push({ k: 'trough', x: qx, z: qz }); } break; }
    ev.push(...carve(S, px, pz, qx, qz, st)); px = qx; pz = qz;
  }
  st.last = [px, pz];
  // the samples, every amah of the stroke
  const lp = st.pts[st.pts.length - 1];
  if (Math.hypot(px - lp.x, pz - lp.z) >= HK.SAMPLE) {
    const segN = st.pts.length % 2 === 0 || lp.seg == null ? segNew(S, st) : lp.seg;
    const p = { x: px, z: pz, seg: segN };
    st.pts.push(p);
    const pts = st.pts, N = pts.length;
    const A = N >= 3 ? pts[N - 3] : st.prev ? st.prev[0] : null, B = pts[N - 2], C = pts[N - 1];
    if (A && B && C) {
      const ux = B.x - A.x, uz = B.z - A.z, vx = C.x - B.x, vz = C.z - B.z, lu = Math.hypot(ux, uz), lv = Math.hypot(vx, vz);
      if (lu > 0.3 && lv > 0.3) {
        const ang = (Math.acos(clamp((ux * vx + uz * vz) / (lu * lv), -1, 1)) * 180) / Math.PI;
        const thr = S.lv === 3 ? HK.SOFT3 : HK.THR[S.lv];
        if (ang >= thr) {
          // the outer bank: away from the turn's inside (the side the new leg turned from)
          const cr = ux * vz - uz * vx, out = cr > 0 ? [uz / lu, -ux / lu] : [-uz / lu, ux / lu];
          const bend = { n: S.bends.length, x: B.x, z: B.z, ang: +ang.toFixed(1), seg: B.seg != null ? B.seg : segN, out, crack: 0, peak: 0, packed: 0, over: 0, state: 'ok', soft: S.lv === 3 && ang < HK.THR[3] };
          S.bends.push(bend); ev.push({ k: 'bend', n: bend.n, ang: bend.ang });
        }
      }
    }
  }
  return ev;
}
function carve(S, ax, az, bx, bz, st) {
  const ev = [], R = HK.CH_R, x0 = Math.min(ax, bx) - R, x1 = Math.max(ax, bx) + R, z0 = Math.min(az, bz) - R, z1 = Math.max(az, bz) + R;
  const c0 = cellOf(S, Math.max(S.x0, x0), Math.max(S.z0, z0)) || [0, 0], c1 = cellOf(S, Math.min(S.x0 + S.NX * HK.CELL - 0.01, x1), Math.min(S.z0 + S.NZ * HK.CELL - 0.01, z1)) || [S.NX - 1, S.NZ - 1];
  const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
  for (let j = c0[1]; j <= c1[1]; j++) for (let i = c0[0]; i <= c1[0]; i++) {
    const k = j * S.NX + i; if (S.cells[k] !== EARTH) continue;
    const [cx, cz] = centre(S, i, j); let u = L2 > 0 ? ((cx - ax) * dx + (cz - az) * dz) / L2 : 0; u = clamp(u, 0, 1);
    if (Math.hypot(cx - (ax + dx * u), cz - (az + dz * u)) > R) continue;
    S.cells[k] = DUG; ev.push({ k: 'dug', i, j });
    const lp = st && st.pts[st.pts.length - 1]; if (lp && lp.seg != null && S.segs[lp.seg]) S.segs[lp.seg].cells.push(k);
    // a dug cell by a wet one (or by a mouth) takes the water a cell-time later
    feed(S, i, j);
  }
  return ev;
}
function feed(S, i, j) {
  const k = j * S.NX + i; if (S.wet[k] >= 0) return;
  const [cx, cz] = centre(S, i, j);
  for (const m of S.mouths) if (Math.hypot(cx - m.x, cz - m.z) < 0.9) { S.q.push([S.t, k, m.n]); return; }
  for (const [di, dj] of NB) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= S.NX || b >= S.NZ) continue; const n = b * S.NX + a; if (S.wet[n] >= 0) { S.q.push([Math.max(S.t, S.wet[n]) + 1 / HK.V, k, S.src[n]]); return; } }
}
const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];
/** the finger leaves the strip */
export function lift(S) { S.cur = null; }

/* ───────── packing (the helping hand, or the one hand at a stop) ───────── */
/** the bend (or open breach) a finger at (x, z) packs: the nearest within R_PACK */
export function packTarget(S, x, z) {
  let best = null, bd = HK.R_PACK;
  for (const b of S.bends) { if (b.state === 'packed' || b.state === 'repaired') { if (S.lv < 3) continue; } const d = Math.hypot(b.x - x, b.z - z); if (d < bd) { bd = d; best = b; } }
  return best;
}

/* ───────── the water, the cracks, the mud, the basin ───────── */
/**
 * one step. hands: [{ x, z }] the packing fingers this frame (world points) → events: 'wet' (a cell took water: the front), 'crack' (a
 * bend began to crack: the creak), 'packed', 'breach', 'repaired', 'over' (level 3: packed too long), 'seg' { n, grade }, 'meet' (two
 * streams joined), 'reach' (water at the basin), 'line' (the basin at its line), 'clear', 'done'
 */
export function step(S, dt, hands = []) {
  const ev = []; if (!(dt > 0) || S.done) return ev;
  S.t += dt;
  // the water's front
  S.q.sort((a, b) => a[0] - b[0]);
  let nw = 0;
  while (S.q.length && S.q[0][0] <= S.t) {
    const [t, k, src] = S.q.shift(); if (S.wet[k] >= 0 || S.cells[k] !== DUG) continue;
    S.wet[k] = t; S.src[k] = src; nw++;
    const i = k % S.NX, j = (k / S.NX) | 0;
    for (const [di, dj] of NB) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= S.NX || b >= S.NZ) continue; const n = b * S.NX + a; if (S.cells[n] === DUG && S.wet[n] < 0) S.q.push([t + 1 / HK.V, n, src]); else if (S.cells[n] === DUG && S.wet[n] >= 0 && S.src[n] !== src && src >= 0 && S.src[n] >= 0 && !S.met) { S.met = true; ev.push({ k: 'meet', x: centre(S, i, j)[0], z: centre(S, i, j)[1] }); } }
  }
  if (nw) ev.push({ k: 'wet', n: nw });
  // the mouths reach the basin (its cells wet from that mouth's stream; once the streams met, both)
  for (const i of S.basin.i) { const k = i; if (S.wet[k] >= 0) { const s = S.src[k]; for (const m of S.mouths) if (!m.reached && (m.n === s || S.met)) { m.reached = true; ev.push({ k: 'reach', n: m.n }); } } }
  const cur = strength(S), strong = cur >= HK.STRONG;
  // the bends: the crack spreads where the water presses and the bank is not packed
  for (const b of S.bends) {
    const c = cellOf(S, b.x, b.z), wet = c && S.wet[c[1] * S.NX + c[0]] >= 0;
    const on = hands.some((h) => Math.hypot(h.x - b.x, h.z - b.z) < HK.R_PACK);
    if (on) {
      if (b.state === 'ok' || b.state === 'breach') {
        b.packed = Math.min(1, b.packed + dt / HK.PACK_T[S.lv]);
        if (b.packed >= 1) { if (b.state === 'breach') { b.state = 'repaired'; ev.push({ k: 'repaired', n: b.n }); } else { b.state = 'packed'; if (b.crack > HK.PEAK) S.segs[b.seg] && (S.segs[b.seg].cracked = true); ev.push({ k: 'packed', n: b.n }); } b.crack = 0; }
      } else if (S.lv === 3 && (b.state === 'packed' || b.state === 'repaired')) {
        b.over += dt; if (b.over >= HK.OVER_T && !b.narrow) { b.narrow = true; overflow(S, b, ev); }
      }
    } else if (b.over > 0) b.over = Math.max(0, b.over - dt * 2);
    if (!wet || b.state !== 'ok') continue;
    // (level 1: the turns pack themselves — only a hairpin cracks, slowly; level 3: a gentle turn cracks only while the current is strong)
    if (b.soft && !strong) continue;
    // (the bank holds a moment before it cracks: a quick hand packs it clean)
    if (S.t - S.wet[c[1] * S.NX + c[0]] < HK.GRACE[S.lv]) continue;
    const sev = 0.5 + clamp((b.ang - HK.THR[S.lv]) / (180 - HK.THR[S.lv]), 0, 1);
    const c0 = b.crack; b.crack = Math.min(1, b.crack + dt * HK.RATE[S.lv] * cur * sev);
    b.peak = Math.max(b.peak, b.crack);
    if (c0 === 0 && b.crack > 0) ev.push({ k: 'crack', n: b.n, x: b.x, z: b.z });
    if (b.crack >= 1) breach(S, b, ev);
  }
  // the mud: an open breach clouds the water; once none is open the clear stream pushes it out through the drain
  const open = S.bends.filter((b) => b.state === 'breach').length;
  const m0 = S.mud;
  if (open) S.mud = Math.min(1, S.mud + dt * HK.MUD_UP * open);
  else if (S.mouths.some((m) => m.reached)) S.mud = Math.max(0, S.mud - dt * HK.MUD_DOWN);
  if (m0 >= HK.CLEAR && S.mud < HK.CLEAR) ev.push({ k: 'clear' });
  // the steps: two amot the water ran through, graded once (when no crack is open in them)
  for (const g of S.segs) {
    if (g.grade || !g.cells.length) continue;
    const allWet = g.cells.every((k) => S.wet[k] >= 0); if (!allWet) continue;
    const t0 = Math.max(...g.cells.map((k) => S.wet[k])); if (S.t - t0 < HK.SEG_T) continue;
    const bs = S.bends.filter((b) => b.seg === g.n);
    if (bs.some((b) => b.state === 'ok' && b.crack > 0) || bs.some((b) => b.state === 'breach')) continue;
    const grade = g.breached || bs.some((b) => b.state === 'repaired') ? 'soft' : g.cracked || bs.some((b) => b.peak > HK.PEAK) ? 'good' : 'gold';
    g.grade = grade; ev.push({ k: 'seg', n: g.n, grade });
  }
  // the basin: fills while the water reaches it; with two mouths, half way until both streams are in it
  const reached = S.mouths.filter((m) => m.reached).length;
  if (reached) {
    const cap = S.mouths.length > 1 && reached < S.mouths.length ? 0.5 : 1;
    const f0 = S.basin.fill; S.basin.fill = Math.min(cap, S.basin.fill + dt * HK.FILL[S.lv] * reached * (open ? 0.6 : 1));
    if (f0 < 1 && S.basin.fill >= 1) { S.basin.line = true; ev.push({ k: 'line', mud: +S.mud.toFixed(2) }); if (S.mud >= HK.CLEAR) S.muddyAtLine = true; }
  }
  if (S.basin.line && S.mud < HK.CLEAR && !open && !S.done) { S.done = true; ev.push({ k: 'done' }); }
  return ev;
}
function breach(S, b, ev) {
  b.state = 'breach'; b.crack = 1; b.packed = 0; S.breaches++;
  const g = S.segs[b.seg]; if (g) g.breached = true;
  ev.push({ k: 'breach', n: b.n, x: b.x + b.out[0] * 0.8, z: b.z + b.out[1] * 0.8 });
}
function overflow(S, b, ev) { b.state = 'breach'; b.packed = 0; b.crack = 1; S.breaches++; const g = S.segs[b.seg]; if (g) g.breached = true; ev.push({ k: 'over', n: b.n, x: b.x, z: b.z }); ev.push({ k: 'breach', n: b.n, x: b.x, z: b.z, over: true }); }

/** the end (spec: no breach = the work's bonus; three stars = every step gold, no breach, and (level 3) clear water at the line) */
export function result(S) {
  const G = S.segs.filter((g) => g.grade), n = G.length || 1;
  const pts = G.reduce((a, g) => a + (g.grade === 'gold' ? 40 : g.grade === 'good' ? 20 : 10), 0), gold = G.filter((g) => g.grade === 'gold').length;
  const stars = gold === G.length && G.length > 0 && !S.breaches && !S.muddyAtLine ? 3 : !S.muddyAtLine && gold / n >= 0.6 ? 2 : 1;
  return { stars, q: pts / (n * 40), pts, perfect: stars === 3, bonus: !S.breaches, flags: { steps: G.length, gold, breaches: S.breaches, trough: S.troughHits, muddy: !!S.muddyAtLine, met: !!S.met } };
}
/** the channel he dug (kept in the world after the work: the dark trace), as runs of cells */
export function trace(S) { const out = []; for (let k = 0; k < S.cells.length; k++) if (S.cells[k] === DUG) out.push(k); return { NX: S.NX, NZ: S.NZ, x0: S.x0, z0: S.z0, cells: out }; }
