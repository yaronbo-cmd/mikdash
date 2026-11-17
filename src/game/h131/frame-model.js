/* ── build 131 ── h131/frame-model.js — the rules of part 2, "המלבן", and of part 4, "הסיום" (spec docs/specs/shlav-08-he.md). Pure:
 * no three.js, no DOM. THE FRAME-AND-FINALE LANE'S FILE.
 *
 * The frame is a linkage on the court's floor (x east, z south, amot): its points, its beams of fixed length between them (32: רש"י
 * זבחים נד ע"א "וכל אחת ארוכה ל"ב"), a corner seated on its stake held there, a pegged corner fixed. A finger drags one point (or a
 * whole beam); the rest follows by the beams' lengths (position-based: a few passes of the length constraints a frame), late, as
 * a heavy thing. What the player sees is this state and nothing else (rule 33: every mistake is seen in the frame itself).
 *   level 1  the frame already joined (stiff: its diagonals too): seated corner by corner on the stakes, then turned about the seated one
 *   level 2  four loose beams: each laid end by end on its two stakes; two ends on one stake join (a corner). A beam pulled past its
 *            length drags a seated end off its stake: what was joined is distorted (a mistake, seen: the corner off its stake)
 *   level 3  the frame pegged at three corners, one of them off its stake; the fourth is crooked and cannot move until the wrong peg
 *            is pulled (a tap on it). Pulling a right peg is a mistake (the frame slides off it); a corner seated drives its peg again
 * The diagonal beam (המחשה) falls in only when every corner sits on its stake (the frame is square); else it sticks, and the corner
 * that lacks is shown. Pushing a stuck diagonal cracks a board: frame.crack (−20), the board replaced in another shade, for good.
 *
 *   FR · CORNERS · STAKE · fresh(lv) · load(blob) · save(S) · grab(S, i) · dragTo(S, i, x, z) · step(S, dt) · release(S) · seatAll(S)
 *   cornerAt(S, k) · offBy(S, k) · square(S) · worst(S) · diagDrop(S) · pegTap(S, k) · crackBeam(S, k) · framePts(S) · result(S)
 *   FIN · finFresh() · cellsOf() · wipe(F, x, z, r) · cover(F) · maskOf(F) · maskLoad(F, s) · waterPath()
 */
import { BOOK } from '../world/grid.js';
import { grade, qOf, starsOf } from './model.js';

const S8 = BOOK.s08, W8 = S8.work;
/** the corners in their order round the frame, and the stakes the witness shows */
export const CORNERS = Object.freeze(['NW', 'NE', 'SE', 'SW']);
export const STAKE = Object.freeze(Object.fromEntries(CORNERS.map((k) => [k, Object.freeze(S8.stakes[k].slice())])));
/** the beams round the frame: [corner a, corner b] — N, E, S, W */
export const SIDES = Object.freeze({ N: ['NW', 'NE'], E: ['NE', 'SE'], S: ['SE', 'SW'], W: ['SW', 'NW'] });
export const SIDE_K = Object.freeze(['N', 'E', 'S', 'W']);
const L = S8.frame.L, LD = L * Math.SQRT2;
/** the act's numbers: a corner seats within SEAT of its stake (on a release; a magnet), TOL the diagonal's play (a seated corner
 *  is exact), the heavy follow's rate (1/s), POP how far past its reach a finger pulls before a seated end gives way, the passes */
export const FR = Object.freeze({ SEAT: 1.1, TOL: 0.05, FOLLOW: 3.2, POP: 2.4, POPT: 0.35, PASSES: 14 });

const D2R = Math.PI / 180;
const hyp = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const rot = (p, c, a) => { const s = Math.sin(a), k = Math.cos(a), dx = p[0] - c[0], dz = p[1] - c[1]; return [c[0] + dx * k - dz * s, c[1] + dx * s + dz * k]; };
const r3 = (v) => Math.round(v * 1000) / 1000;

/* ═════════════ the frame's state ═════════════
 *  S = { lv, P: [{ x, z, k (the corner it belongs to), seat (0/1), peg (0/1), side? }], E: [{ a, b, L, beam? (N/E/S/W) }],
 *        J: [[i, j]] (joined ends: one point), drag: null | { i, beam?, x, z, tx, tz, off }, wrong, stuck, dmg, cracks: [k], diag: 0|1,
 *        strain, popT, n (the real steps, for the save) }
 * Level 1 and 3: one point per corner (P[i].k = CORNERS[i]). Level 2: two ends per beam (P[2s] its first corner's end, P[2s+1] its
 * second's), J the corners joined. */
function corners4(pts) { return CORNERS.map((k, i) => ({ x: pts[i][0], z: pts[i][1], k, seat: 0, peg: 0 })); }
export function fresh(lv) {
  lv = lv | 0 || 1;
  const S = { lv, P: [], E: [], J: [], drag: null, wrong: 0, stuck: 0, dmg: 0, cracks: [], diag: 0, strain: 0, popT: 0, n: 0 };
  if (lv === 1) {
    const C = W8.frame1, c = [S8.mid[0], S8.mid[1]], a = C.turn * D2R;
    S.P = corners4(CORNERS.map((k) => { const q = rot(STAKE[k], c, a); return [q[0] + C.shift[0], q[1] + C.shift[1]]; }));
    S.E = [[0, 1], [1, 2], [2, 3], [3, 0]].map(([a2, b], s) => ({ a: a2, b, L, beam: SIDE_K[s] })).concat([{ a: 0, b: 2, L: LD }, { a: 1, b: 3, L: LD }]);
  } else if (lv === 2) {
    SIDE_K.forEach((s, j) => {
      const [m, t] = W8.frame2[s], u = [Math.cos(t * D2R), Math.sin(t * D2R)], [ka, kb] = SIDES[s];
      // (the end nearer its own corner's stake is that corner's)
      let A = [m[0] - u[0] * L / 2, m[1] - u[1] * L / 2], B = [m[0] + u[0] * L / 2, m[1] + u[1] * L / 2];
      if (hyp(A, STAKE[ka]) + hyp(B, STAKE[kb]) > hyp(B, STAKE[ka]) + hyp(A, STAKE[kb])) [A, B] = [B, A];
      S.P.push({ x: A[0], z: A[1], k: ka, seat: 0, peg: 0, side: s }, { x: B[0], z: B[1], k: kb, seat: 0, peg: 0, side: s });
      S.E.push({ a: 2 * j, b: 2 * j + 1, L, beam: s });
    });
  } else {
    const C = W8.frame3, nw = STAKE.NW, ne = rot(STAKE.NE, nw, C.turn * D2R), sw = STAKE.SW, se = [ne[0] + sw[0] - nw[0], ne[1] + sw[1] - nw[1]];
    S.P = corners4([nw, ne, se, sw]);
    for (const k of C.pegs) { const p = S.P[CORNERS.indexOf(k)]; p.peg = 1; p.seat = k === C.wrong ? 0 : 1; }
    S.E = [[0, 1], [1, 2], [2, 3], [3, 0]].map(([a2, b], s) => ({ a: a2, b, L, beam: SIDE_K[s] }));
  }
  return S;
}
/** the save's blob (M.keep('frame', …)): what was reached — the points as they lie, seated and pegged, the joints, the mistakes */
export function save(S, id) {
  return { id, lv: S.lv, P: S.P.map((p) => [r3(p.x), r3(p.z), p.seat | 0, p.peg | 0]), J: S.J.map((j) => j.slice()), wrong: S.wrong, stuck: S.stuck, dmg: S.dmg, cracks: S.cracks.slice(), diag: S.diag, n: S.n };
}
export function load(b) {
  if (!b || !Array.isArray(b.P)) return null;
  const S = fresh(b.lv); if (b.P.length !== S.P.length) return null;
  b.P.forEach((q, i) => { Object.assign(S.P[i], { x: +q[0], z: +q[1], seat: q[2] | 0, peg: q[3] | 0 }); });
  S.J = (b.J || []).map((j) => j.slice()); for (const [i, j] of S.J) S.E.push({ a: i, b: j, L: 0, joint: 1 });
  Object.assign(S, { wrong: b.wrong | 0, stuck: b.stuck | 0, dmg: b.dmg | 0, cracks: (b.cracks || []).slice(), diag: b.diag | 0, n: b.n | 0 });
  return S;
}
/** the points that are one with point i (a joint's ends) */
const group = (S, i) => { const g = [i]; for (const [a, b] of S.J) { if (a === i) g.push(b); if (b === i) g.push(a); } return g; };
const fixed = (S, i) => { const p = S.P[i]; return !!(p.peg || p.seat); };

/* ───────── the hand on the frame ───────── */
/** a finger takes point i (or, with beam, a whole beam: the finger's offset kept) at its world place x, z */
export function grab(S, i, x, z, beam) {
  if (S.diag) return false;
  const p = S.P[i]; if (!p) return false;
  // (a pegged corner does not move under the hand: a tap on it pulls the peg, pegTap)
  if (p.peg && S.lv === 3) { S.drag = { i, x: p.x, z: p.z, tx: p.x, tz: p.z, held: 1 }; return true; }
  for (const j of group(S, i)) if (S.P[j].seat && !S.P[j].peg) S.P[j].seat = 0;   // (a seated corner taken up again: no mistake)
  if (beam) { const e = S.E.find((q) => q.beam === beam && !q.joint); const o = S.P[e.a === i ? e.b : e.a]; S.drag = { i, j: e.a === i ? e.b : e.a, ox: o.x - p.x, oz: o.z - p.z, x: p.x, z: p.z, tx: x, tz: z, beam }; }
  else S.drag = { i, x: p.x, z: p.z, tx: x, tz: z };
  if (beam) for (const j of group(S, S.drag.j)) if (S.P[j].seat && !S.P[j].peg) S.P[j].seat = 0;
  S.drag.dx = p.x - x; S.drag.dz = p.z - z;   // (the finger's offset from the point it took: the point stays under the finger)
  S.strain = 0; S.popT = 0;
  return true;
}
export function dragTo(S, x, z) { const d = S.drag; if (!d) return; d.tx = x + d.dx; d.tz = z + d.dz; }
/** one step of the world (dt seconds): the taken point follows the finger late; the beams keep their lengths. Returns what happened:
 *  { pop: [corner names] } when a seated end was dragged off its stake (level 2: a mistake), { stuck: 1 } while a pegged frame resists */
export function step(S, dt) {
  const d = S.drag, out = {};
  let px = 0, pz = 0;
  if (d && !d.held) {
    const k = 1 - Math.exp(-dt * FR.FOLLOW), p = S.P[d.i]; px = p.x; pz = p.z;
    d.x += (d.tx - d.x) * k; d.z += (d.tz - d.z) * k;
  }
  solve(S);
  if (d && !d.held) {
    const p = S.P[d.i], lag = Math.hypot(d.tx - p.x, d.tz - p.z), v = Math.hypot(p.x - px, p.z - pz) / Math.max(1e-3, dt);
    // (pulled past its reach: the point stands while the finger is far — the hand drags what holds the frame. Level 1 and 2: a seated
    //  corner gives way; level 3: the pegs do not, the frame is stuck)
    S.strain = lag > FR.POP && v < 0.8 ? lag : 0;
    if (S.strain) {
      S.popT += dt;
      if (S.popT > FR.POPT) {
        if (S.lv === 3) { out.stuck = 1; }
        else {
          const chain = reach(S, d.i).filter((j) => S.P[j].seat && !S.P[j].peg);
          if (chain.length) {
            const far = chain.sort((a, b) => Math.hypot(S.P[b].x - p.x, S.P[b].z - p.z) - Math.hypot(S.P[a].x - p.x, S.P[a].z - p.z))[0];
            const g = group(S, far); for (const j of g) S.P[j].seat = 0;
            const joined = g.length > 1;
            if (S.lv === 2 && joined) S.wrong++;
            out.pop = [S.P[far].k]; out.joined = joined; S.popT = 0; S.n++;
          }
        }
      }
    } else S.popT = Math.max(0, S.popT - dt);
    // (where the hand holds is where the solve put it: the lag is the frame's own)
    d.x = p.x; d.z = p.z;
  } else if (d && d.held && S.lv === 3) out.stuck = 1;
  return out;
}
/** the points reached from i along the beams (and joints) */
function reach(S, i) { const seen = new Set([i]), q = [i]; while (q.length) { const a = q.shift(); for (const e of S.E) { const b = e.a === a ? e.b : e.b === a ? e.a : -1; if (b >= 0 && !seen.has(b)) { seen.add(b); q.push(b); } } } seen.delete(i); return [...seen]; }
/** the length constraints, a few passes (a fixed point does not move; the taken one moves little) */
function solve(S, passes = FR.PASSES) {
  const d = S.drag, P = S.P;
  if (S.lv === 1) { stiff(S); return; }
  if (d && !d.held) { const p = P[d.i]; p.x = d.x; p.z = d.z; if (d.beam) { for (const j of group(S, d.j)) { P[j].x = d.x + d.ox; P[j].z = d.z + d.oz; } } for (const j of group(S, d.i)) if (j !== d.i) { P[j].x = p.x; P[j].z = p.z; } }
  const w = (i) => { if (fixed(S, i)) return 0; if (d && !d.held && (group(S, d.i).includes(i) || (d.beam && group(S, d.j).includes(i)))) return 0.25; return 1; };
  for (let it = 0; it < passes; it++) {
    for (const e of S.E) {
      const a = P[e.a], b = P[e.b], wa = w(e.a), wb = w(e.b), ws = wa + wb; if (ws <= 0) continue;
      const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz) || 1e-9, c = (len - e.L) / len;
      a.x += dx * c * (wa / ws); a.z += dz * c * (wa / ws); b.x -= dx * c * (wb / ws); b.z -= dz * c * (wb / ws);
    }
  }
}
/** level 1: the joined frame is stiff — with no corner seated it slides whole under the hand (the four men carry it); with one seated
 *  it turns about that one (the hand's point keeps its distance: pulled past it, the strain); with two it does not move */
function stiff(S) {
  const d = S.drag, P = S.P; if (!d || d.held) return;
  const p = P[d.i], seated = P.filter((q) => q.seat);
  if (!seated.length) { const dx = d.x - p.x, dz = d.z - p.z; for (const q of P) { q.x += dx; q.z += dz; } return; }
  if (seated.length > 1 || seated[0] === p) return;
  const c = seated[0], a0 = Math.atan2(p.z - c.z, p.x - c.x), a1 = Math.atan2(d.z - c.z, d.x - c.x);
  for (const q of P) if (q !== c) { const r = rot([q.x, q.z], [c.x, c.z], a1 - a0); q.x = r[0]; q.z = r[1]; }
}
/** level 1: corner i set on its stake by the stiff frame's own move (a slide with none seated; a turn about the seated one) — false
 *  when the frame cannot get there that way (more than one seated) */
function stiffSeat(S, i) {
  const P = S.P, p = P[i], st = STAKE[p.k], seated = P.filter((q) => q.seat);
  if (!seated.length) { const dx = st[0] - p.x, dz = st[1] - p.z; for (const q of P) { q.x += dx; q.z += dz; } p.seat = 1; return true; }
  if (seated.length > 1) return false;
  const c = seated[0], a0 = Math.atan2(p.z - c.z, p.x - c.x), a1 = Math.atan2(st[1] - c.z, st[0] - c.x);
  for (const q of P) if (q !== c) { const r = rot([q.x, q.z], [c.x, c.z], a1 - a0); q.x = r[0]; q.z = r[1]; }
  // (a stiff square turned about one stake onto a second: every corner is on its own)
  for (const q of P) { const s = STAKE[q.k]; if (Math.hypot(q.x - s[0], q.z - s[1]) < 0.01) { q.x = s[0]; q.z = s[1]; q.seat = 1; } }
  return true;
}
/** the hand let go: each free corner near its own stake sits on it (the magnet), two ends on one stake join; returns the corners
 *  that sat now */
export function release(S) {
  const d = S.drag; S.drag = null; S.strain = 0; S.popT = 0;
  if (d && d.held) return { seated: [], joined: [] };
  return seatAll(S);
}
export function seatAll(S) {
  const seated = [], joined = [];
  for (let pass = 0; pass < 3; pass++) {
    let any = false;
    S.P.forEach((p, i) => {
      if (p.seat || p.peg && S.lv !== 3) return;
      if (p.peg) return;
      const st = STAKE[p.k]; if (Math.hypot(p.x - st[0], p.z - st[1]) > FR.SEAT) return;
      if (S.lv === 1) { const was = new Set(S.P.filter((q) => q.seat).map((q) => q.k)); if (stiffSeat(S, i)) { for (const q of S.P) if (q.seat && !was.has(q.k) && !seated.includes(q.k)) { seated.push(q.k); S.n++; } any = true; } return; }
      // (a stiff frame, or one held elsewhere: it sits only if the rest can follow — tried, and kept if every length holds)
      const keep = S.P.map((q) => [q.x, q.z]);
      for (const j of group(S, i)) { S.P[j].x = st[0]; S.P[j].z = st[1]; S.P[j].seat = 1; }
      solve(S, 160);
      const bad = S.E.some((e) => Math.abs(Math.hypot(S.P[e.b].x - S.P[e.a].x, S.P[e.b].z - S.P[e.a].z) - e.L) > 0.08);
      if (bad) { S.P.forEach((q, j) => { q.x = keep[j][0]; q.z = keep[j][1]; }); for (const j of group(S, i)) S.P[j].seat = 0; return; }
      seated.push(p.k); any = true; S.n++;
      if (S.lv === 3 && W8.frame3.pegs.includes(p.k)) p.peg = 1;   // (the crew drives its peg again)
    });
    if (!any) break;
  }
  // level 2: two ends seated on one stake are one corner now
  if (S.lv === 2) for (const k of CORNERS) {
    const ends = S.P.map((p, i) => (p.k === k && p.seat ? i : -1)).filter((i) => i >= 0);
    if (ends.length === 2 && !S.J.some(([a, b]) => ends.includes(a) && ends.includes(b))) { S.J.push(ends); S.E.push({ a: ends[0], b: ends[1], L: 0, joint: 1 }); joined.push(k); S.n++; }
  }
  // (a joint's ends are one point)
  for (const [a, b] of S.J) { const p = S.P[a], q = S.P[b]; const x = (p.x + q.x) / 2, z = (p.z + q.z) / 2; p.x = q.x = x; p.z = q.z = z; }
  return { seated: [...new Set(seated)], joined };
}
/** level 3: a tap on a pegged corner pulls its peg (the right one: the corner off its stake; any other is a mistake); on a free one
 *  drives a peg where it lies (only on its stake: a peg off the stake is not driven) */
export function pegTap(S, k) {
  if (S.lv !== 3 || S.diag) return null;
  const i = CORNERS.indexOf(k), p = S.P[i]; if (!p) return null;
  if (p.peg) { p.peg = 0; p.seat = 0; const right = k === W8.frame3.wrong || offBy(S, k) > FR.TOL; if (!right) S.wrong++; S.n++; return { pulled: k, right }; }
  return null;
}
/* ───────── reading the frame ───────── */
/** where corner k is now (a joint's ends are one point; an end not yet joined: the end that belongs there, the nearer of two) */
export function cornerAt(S, k) {
  const L2 = S.P.filter((p) => p.k === k), st = STAKE[k];
  return L2.reduce((b, p) => (!b || Math.hypot(p.x - st[0], p.z - st[1]) < Math.hypot(b.x - st[0], b.z - st[1]) ? p : b), null);
}
export function offBy(S, k) { const p = cornerAt(S, k), st = STAKE[k]; return Math.hypot(p.x - st[0], p.z - st[1]); }
/** square: every corner on its stake (level 2: every corner joined) */
export function square(S) {
  if (S.lv === 2 && S.J.length < 4) return false;
  return CORNERS.every((k) => S.P.filter((p) => p.k === k).every((p) => p.seat && Math.hypot(p.x - STAKE[k][0], p.z - STAKE[k][1]) <= FR.TOL));
}
/** the corner that lacks most (where the stuck diagonal shows the gap) */
export function worst(S) {
  let w = null, wd = -1;
  for (const k of CORNERS) { const ps = S.P.filter((p) => p.k === k); const dd = Math.max(...ps.map((p) => Math.hypot(p.x - STAKE[k][0], p.z - STAKE[k][1]) + (p.seat ? 0 : 0.5))) + (S.lv === 2 && ps.length === 2 && !S.J.some(([a, b]) => ps.includes(S.P[a]) && ps.includes(S.P[b])) ? 1 : 0); if (dd > wd) { wd = dd; w = k; } }
  return w;
}
/** the diagonal lowered onto the frame: it falls in (square) or sticks (the corner that lacks) */
export function diagDrop(S) {
  if (S.diag) return { fit: S.diag === 1 };
  if (square(S)) { S.diag = 1; S.n++; return { fit: true }; }
  S.diag = 2; S.stuck++; S.n++; return { fit: false, at: worst(S) };
}
/** the stuck diagonal lifted off again (a tap) */
export function diagLift(S) { if (S.diag === 2) { S.diag = 0; return true; } return false; }
/** the stuck diagonal pushed in by force: a board of the frame cracks (the one along the corner that lacks, clockwise from it) —
 *  replaced in another shade; the diagonal comes off. Returns the side cracked */
export function crackBeam(S) {
  if (S.diag !== 2) return null;
  const k = worst(S), s = SIDE_K[CORNERS.indexOf(k)];
  S.cracks.push(s); S.dmg++; S.diag = 0; S.n++;
  return s;
}
/** the four corners' places as drawn (for a beam between two corners), and each beam's two ends */
export function beamsOf(S) {
  return S.E.filter((e) => e.beam).map((e) => ({ beam: e.beam, a: [S.P[e.a].x, S.P[e.a].z], b: [S.P[e.b].x, S.P[e.b].z], ia: e.a, ib: e.b }));
}
/** the work's result: the one grading — any crack caps it at 10; clean (no mistake, no stuck diagonal) 40; else 20 */
export function result(S) {
  const clean = !S.wrong && !S.stuck, pts = grade(S.dmg, clean), q = qOf(pts);
  return { pts, q, stars: starsOf(q), perfect: clean && !S.dmg, clean, flags: { 'frame.crack': S.dmg, wrong: S.wrong, stuck: S.stuck } };
}
/** the side a 'frame.crack' mark names (its n), for the world's board in another shade */
export const crackSide = (n) => SIDE_K[(n | 0) % 4];

/* ═════════════ the finale (part 4) ═════════════
 * F = { step: 'down' | 'pull' | 'white' | 'water' | 'rise' | 'done', out: { S: 0|1, E: 0|1 }, mask: Uint8Array (a cell of an amah:
 *       whitened), water: 0…1 (the jar poured), n }
 * The timbers come out in their order: the south one first (its east end free once the frame is down), then the east one (its south
 * end was held by the south one at the corner — the joint the pour fixed). */
export const FIN = Object.freeze({
  // the whitened area: the poured place (the yesod and the body under the altar), a cell of an amah
  X0: S8.altar[0], Z0: S8.altar[1], NX: Math.round(S8.altar[2] - S8.altar[0]), NZ: Math.round(S8.altar[3] - S8.altar[1]),
  BRUSH: 3.0, WHITE: 0.85,        // (the cloth's reach, amot; how much of the yesod he whitens before the crew wipes the last of it)
  FREE: 0.7, PULLK: 0.55,          // (a timber gives way after this much pull, amot; the pull's gain before it gives)
  WATER: 2.6,                      // (seconds of a full tilt to empty the jar)
});
const inBox = (x, z, b) => x >= b[0] && x <= b[2] && z >= b[1] && z <= b[3];
/** the cells of the poured place: the yesod's own boxes (BOOK.s08.yesod) — the strip along the south and east stays out */
export function cellsOf() {
  const out = [];
  for (let j = 0; j < FIN.NZ; j++) for (let i = 0; i < FIN.NX; i++) { const x = FIN.X0 + i + 0.5, z = FIN.Z0 + j + 0.5; out.push(Object.values(S8.yesod).some((b) => inBox(x, z, b)) ? 1 : 0); }
  return out;
}
const CELLS = cellsOf(), NCELL = CELLS.reduce((a, b) => a + b, 0);
export const finCells = () => NCELL;
export function finFresh() { return { step: 'down', out: { S: 0, E: 0 }, mask: new Uint8Array(FIN.NX * FIN.NZ), water: 0, n: 0 }; }
/** which timber may come out now (the south first) */
export const pullable = (F, k) => (k === 'S' ? !F.out.S : k === 'E' ? !!F.out.S && !F.out.E : false);
/** the cloth wiped at x, z: the cells it reached are white; returns how many cells turned now */
export function wipe(F, x, z, r = FIN.BRUSH) {
  let n = 0; const i0 = Math.max(0, Math.floor(x - r - FIN.X0)), i1 = Math.min(FIN.NX - 1, Math.floor(x + r - FIN.X0)), j0 = Math.max(0, Math.floor(z - r - FIN.Z0)), j1 = Math.min(FIN.NZ - 1, Math.floor(z + r - FIN.Z0));
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const c = j * FIN.NX + i; if (!CELLS[c] || F.mask[c]) continue; if (Math.hypot(FIN.X0 + i + 0.5 - x, FIN.Z0 + j + 0.5 - z) <= r) { F.mask[c] = 1; n++; } }
  return n;
}
export function cover(F) { let n = 0; for (let c = 0; c < CELLS.length; c++) if (CELLS[c] && F.mask[c]) n++; return n / NCELL; }
/** the crew wipes the rest */
export function whiteAll(F) { for (let c = 0; c < CELLS.length; c++) if (CELLS[c]) F.mask[c] = 1; }
/** the mask as a short string for the save (hex of 4 cells a digit), and back */
export function maskOf(F) { let s = ''; for (let c = 0; c < F.mask.length; c += 4) s += ((F.mask[c] | 0) | (F.mask[c + 1] << 1) | (F.mask[c + 2] << 2) | (F.mask[c + 3] << 3)).toString(16); return s; }
export function maskLoad(F, s) { if (typeof s !== 'string') return; for (let k = 0; k < s.length; k++) { const v = parseInt(s[k], 16) || 0; for (let b = 0; b < 4; b++) if (k * 4 + b < F.mask.length) F.mask[k * 4 + b] = (v >> b) & 1; } }
export function finSave(F) { return { step: F.step, out: { ...F.out }, mask: maskOf(F), water: +F.water.toFixed(3), n: F.n }; }
export function finLoad(b) {
  const F = finFresh(); if (!b) return F;
  if (['down', 'pull', 'white', 'water', 'rise', 'done'].includes(b.step)) F.step = b.step;
  F.out = { S: b.out && b.out.S ? 1 : 0, E: b.out && b.out.E ? 1 : 0 }; maskLoad(F, b.mask); F.water = Math.max(0, Math.min(1, +b.water || 0)); F.n = b.n | 0;
  if (F.step === 'water' || F.step === 'rise') F.water = Math.min(F.water, 0.999);   // (the water poured again from where the jar was)
  return F;
}
/** the water's way on the yesod: from where it is poured to the south-west corner, and down the two reeds' holes (מידות ג, ב) */
export function waterPath() { const w = W8.water, R = S8.reeds; return [[w[0], w[1]], [(w[0] + R[1][0]) / 2, (w[1] + R[1][1]) / 2 + 0.2], [R[1][0], R[1][1] - 0.6], [R[0][0], R[0][1] - 0.4]]; }
/** the finale's result: no damage is possible here — the work as he did it (40, the full screen) */
export function finResult() { const pts = grade(0, true), q = qOf(pts); return { pts, q, stars: starsOf(q), perfect: true }; }
