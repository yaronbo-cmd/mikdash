/* ── shift29 ── walk.js — running in the shift (WAVE29 SHIFT29B): the stick walks him ×1.8 (stages.hero.speedMul, a fenced hook), and a
 * tap on a station or a pilgrim walks him there by himself on guide27's path over the court's free floors (planPath) — the stick takes
 * over at its first touch. No fade, no teleport: a place he cannot reach answers false.
 *   createWalk({ world, twin, mul }) → { run(on), to(x, z, r) → Promise<bool arrived>, stop(), on, state() }
 * Never a Divine Name. ── /shift29 ── */
import { planPath } from '../day/guide27.js';
import { free, onAltar, rampWay } from '../day/world22.js';   // ── recovered (16–26c) ── onAltar, rampWay
import { onTick, SHARED } from './draw.js';
import { placeGround } from '../works/anchors.js';

// ── recovered (16–26c) ── the paced walk (walk.pace(PACE)): the stick's top speed `stick` against the run's `base`, a tap's walk at `auto`
// amot/s slowing in over the last `slowIn` amot (never under minSp), `laver` (stations.js); STICK: the stick's feel (shift/index.js).
// The names PACE and STICK are the recovery's; the bundle kept their values only.
export const PACE = Object.freeze({ stick: 7, base: 11, sprint: 1.5, rim: 0.95, rimAfter: 0.6, auto: 8, slowIn: 3, minSp: 1.6, laver: 3.2 });
export const STICK = Object.freeze({ R: 64, dead: 3, acc: 0.15, dec: 0.12, turn: 0.1, low: 0.288, ease: 1.85 });
export const RUN29 = { mul: 1.8, base: 11, minSp: 5, swing: 0.15 };   // (swing: he turns round and steps while the camera comes round behind him, ~0.5 s)   // ── shift30 ── (base 17 → 11: a tap's walk 11 × 1.8 ≈ 20 amot/s, the stick's pace — no 31-amot/s dash that reads as a jump) ── /shift30 ──   // (base × mul: the stick at full tilt 11 × 1.8 ≈ 20 amot/s; a tap's walk 17 × 1.8 ≈ 31 — a dash, as the day's compass dash ⚑)
/** the floors alone, a grid of its own (guide27 caches one grid per (free, gy) and shuts cells the feet refused on it — never this one's) */
const GY2 = (x, z) => placeGround(x, z);
/** the court's floors without the Ulam's steps (x −76…−55, |z| ≤ 50.5): their first edge is a wall to the feet (stages twinFree — a
 *  probe: free(−55.1 ← −54.65) = false), so a way over them is no way — the grid must go round (the laver's stand is at their foot) */
const FREE2 = (x, z) => free(x, z) && !(x < -54.95 && x > -76.5 && Math.abs(z) < 50.5);
/** ── recovered (16–26c) ── a walk's way: from the altar or the kevesh first down the ramp (world22 rampWay), then over the court;
 *  to a point on them, straight (feet: the hero's own rule, or null for the floors alone) */
function planWay(x, z, tx, tz, feet) {
  const down = rampWay(x, z);
  if (down.length && !onAltar(tx, tz)) {
    const p = down[down.length - 1], rest = (feet && planPath(p.x, p.z, tx, tz, FREE2, placeGround, feet)) || planPath(p.x, p.z, tx, tz, FREE2, GY2, null) || [{ x: tx, z: tz }];
    return down.concat(rest);
  }
  return onAltar(tx, tz) ? [{ x: tx, z: tz }] : (feet && planPath(x, z, tx, tz, FREE2, placeGround, feet)) || planPath(x, z, tx, tz, FREE2, GY2, null) || [{ x: tx, z: tz }];
}

export function createWalk(o = {}) {
  const S = o.world || (globalThis.__T && globalThis.__T.stages) || null, twin = o.twin || null, mul = o.mul > 0 ? o.mul : RUN29.mul;
  const gy = (x, z) => { try { const g = S && S.groundAt ? S.groundAt(x, z) : NaN; return Number.isFinite(g) ? g : 16; } catch (e) { return 16; } };
  const heroFree = (x, z, x0, z0) => { try { return !S.hero.free || S.hero.free(x, z, x0, z0) !== false; } catch (e) { return true; } };
  const hp = { x: 0, y: 0, z: 0 };
  const hero = () => { try { if (S && S.heroXYZ) S.heroXYZ(hp); } catch (e) { /* */ } return hp; };
  const W = { on: false, pts: null, i: 0, tx: 0, tz: 0, r: 2.2, res: null, raf: 0, last: 0, chk: 0, cx: 0, cz: 0, replans: 0, why: '', n: 0, L: 0, t0: 0, arrived: null, times: [] };
  let running = false;
  const speedMul = () => { try { const m = S.hero.speedMul; return m > 0 ? m : 1; } catch (e) { return 1; } };   // ── recovered (16–26c) ──
  function end(ok, why) {
    if (!W.on) return; W.on = false; W.why = why || ''; if (W.off) { W.off(); W.off = null; }
    try { if (!(twin && twin.stick && twin.stick().on)) S.hero.drive(0, 0); } catch (e) { /* */ }
    if (ok) { const h = hero(); try { S.hero.setPos(h.x, h.z, Math.atan2(W.fx - h.x, W.fz - h.z)); } catch (e) { /* */ } W.arrived = { t: Math.round(performance.now() - W.t0) }; W.times.push(W.arrived.t); if (W.times.length > 200) W.times.shift(); }
    const r = W.res; W.res = null; if (r) r(!!ok);
  }
  function step(ms, dt) {
    if (!W.on) return;
    W.el = (W.el || 0) + (dt > 0 ? Math.min(dt, 0.1) : 0); const now = W.el * 1000;   // ── flow31 ── (the walk's own clock: the frames' dt — a frame held for seconds (a shot, a stall) is not 12 s of walking) ── /flow31 ──
    if (twin && twin.stick && twin.stick().on) { end(false, 'stick'); return; }
    const h = hero(), left = Math.hypot(W.tx - h.x, W.tz - h.z);
    if (left <= W.r) { end(true, 'arrived'); return; }
    let p = W.pts[W.i];
    while (p && W.i < W.pts.length - 1) { const nx = W.pts[W.i + 1]; if (Math.hypot(p.x - h.x, p.z - h.z) < 0.8 || Math.hypot(nx.x - h.x, nx.z - h.z) < Math.hypot(nx.x - p.x, nx.z - p.z)) p = W.pts[++W.i]; else break; }
    if (!p) { end(Math.hypot(W.tx - h.x, W.tz - h.z) <= W.r + 1.2, 'end'); return; }
    const dx = p.x - h.x, dz = p.z - h.z, d = Math.hypot(dx, dz) || 1, pc = W.pace, sp = pc ? Math.max(pc.minSp, Math.min(pc.auto, pc.auto * left / pc.slowIn)) / speedMul() /* ── recovered (16–26c) ── (paced: auto, slowing in; the run's ×speedMul taken out) */ : Math.max(RUN29.minSp, Math.min(RUN29.base, left * 2.6)) * (SHARED.swing ? RUN29.swing : 1);   // (× speedMul in stages: the run) ── shift30 ── (a walk back the way he came: slow while the follow camera swings behind him — never toward the lens at a run) ── /shift30 ──
    try { S.hero.drive(dx / d * sp, dz / d * sp); } catch (e) { /* */ }
    if (now - W.chk > 900) { const moved = Math.hypot(h.x - W.cx, h.z - W.cz); W.chk = now; W.cx = h.x; W.cz = h.z; if (moved < 0.5) { if (W.replans++ < 2) { const q = planWay(h.x, h.z, W.tx, W.tz, null); if (q) { W.pts = q; W.i = 0; } } else { end(false, 'stuck'); return; } } }
    if (now > (W.limitMs || 12000)) { end(false, 'slow'); return; }   // ── flow31 ── (W.el) ── /flow31 ──   // ── recovered (16–26c) ── (limitMs: a paced walk's own limit)
  }
  const api = {
    /** the run: ×1.8 on the stick and on the walks (stages.hero.speedMul) */
    run(on) { running = !!on; try { if (S && S.hero) S.hero.speedMul = on ? (W.pace ? W.pace.stick / W.pace.base : mul) : 1; } catch (e) { /* */ } return running; },
    // ── recovered (16–26c) ── the paced walk: PACE (or null: the run as before) → the hero's speedMul now
    pace(p) { W.pace = p && p.stick > 0 ? p : null; try { if (S && S.hero) S.hero.speedMul = W.pace ? W.pace.stick / W.pace.base : running ? mul : 1; } catch (e) { /* */ } return speedMul(); },
    get paced() { return W.pace; },
    /** walk him to (x, z) — within r amot → true; the stick, a wall he cannot pass or 12 s → false */
    to(x, z, r = 2.2, face) {
      if (W.on) end(false, 'again');
      const h = hero();
      W.tx = x; W.tz = z; W.r = r; W.fx = face ? face.x : x; W.fz = face ? face.z : z;
      if (Math.hypot(x - h.x, z - h.z) <= r) { try { S.hero.setPos(h.x, h.z, Math.atan2(W.fx - h.x, W.fz - h.z)); } catch (e) { /* */ } return Promise.resolve(true); }
      // (the court's own floors (placeGround: the Ulam's steps, the דוכן's) on the grid; the feet's rule (stages twinFree) checked on the way —
      // it may shut cells for good in guide27's cached grid and give up: then the floors alone, and the feet slide round what is left)
      const pts = planWay(h.x, h.z, x, z, heroFree);   // ── recovered (16–26c) ── (planWay: down the ramp first)
      W.plan = pts.length === 1 && Math.hypot(pts[0].x - x, pts[0].z - z) < 0.01 ? 'straight' : 'path';
      let L = 0, px = h.x, pz = h.z; for (const p of pts) { L += Math.hypot(p.x - px, p.z - pz); px = p.x; pz = p.z; }
      Object.assign(W, { on: true, pts, i: 0, t0: performance.now(), chk: 0, el: 0, cx: h.x, cz: h.z, replans: 0, why: '', L, arrived: null, limitMs: W.pace ? Math.max(12000, L / W.pace.auto * 1500 + 3000) : 12000 }); W.n++;   // ── flow31 ── (chk on the walk's own clock) ── /flow31 ──
      return new Promise((res) => { W.res = res; W.off = onTick(step); });
    },
    stop() { end(false, 'stop'); },
    /** ── shift30 ── the walk's goal (the follow camera looks along it) ── /shift30 ── */
    target: () => (W.on ? { x: W.tx, z: W.tz } : null),
    /** ── shift30 ── the walks' times (ms, arrived ones; the trips' measure) ── /shift30 ── */
    times: () => W.times.slice(),
    get on() { return W.on; },
    state: () => ({ on: W.on, why: W.why, plan: W.plan || '', n: W.n, L: Math.round(W.L), i: W.i, pts: W.pts ? W.pts.length : 0, arrived: W.arrived, run: running, mul: (() => { try { return S.hero.speedMul; } catch (e) { return 1; } })(), pace: W.pace ? W.pace.auto : null }),
  };
  try { globalThis.__S29W = api; } catch (e) { /* tests */ }
  return api;
}
