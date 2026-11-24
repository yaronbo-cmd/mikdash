/* ── build 133 ── h133/kit10.js — what the four acts of stage 10 share (spec docs/specs/shlav-10-he.md, "ניקוד, השיא ומה נשמר",
 * "הידיים, המצלמה והדמויות"):
 *   · award(X, at, grade, lv, craft) — one step's points in the one old system (X.hit: 40 / 20 / 10, the run), and the level's
 *     multiplier on top (×2 at level 2, ×4 at level 3: X.bonus of the rest, model.js MUL);
 *   · extra(X, n, lv, why, label) — a stage bonus (the rabuva open, the angle, the turn, the lime bed), multiplied as a step;
 *   · hurt(X, Mo, f, at, o) — real damage: the flaw kept in the world where it happened (Mo.flaw) and its points (X.loss);
 *   · thumb(X, o) — the three states of works 3 and 4 (pull / let go / brake) read from the left thumb: a drag along the way's screen
 *     direction pulls, a hold that barely moves brakes, a drag across the way straightens (side);
 *   · finish(X, A, res, word, at, film) — the perfect word on the full screen (rule: every perfect play), then the act's end;
 *   · V3, scr2, lens — small helpers.
 * Never a metal sound: the voices are h129's stone, wood, rope (createVoices).
 */
import { mulOf, LOSS } from './model.js';

export const V3 = (X, x, y, z) => new X.THREE.Vector3(x, y, z);
/** one step's points: the old system's grade, the level's multiplier on top */
export function award(X, at, grade, lv, craft, text) {
  if (!grade) return 0;
  const base = grade === 'gold' ? 40 : grade === 'good' ? 20 : 10, mul = mulOf(lv);
  try { X.hit(at, grade, { craft: craft || 'בונים', text: text != null ? text : mul > 1 ? `+${base * mul}` : '' }); } catch (e) { /* */ }
  if (mul > 1) { try { if (X.bonus) X.bonus(base * (mul - 1), 'lvmul', `×${mul}`); } catch (e) { /* */ } }
  return base * mul;
}
/** a stage bonus (level 1's 20), multiplied by the level */
export function extra(X, n, lv, why, label) { const k = n * mulOf(lv); try { if (X.bonus) X.bonus(k, why, label); } catch (e) { /* */ } return k; }
/** real damage: kept in the world (the flaw registry) and its points off (never below zero; the director caps a mission at 80) */
export function hurt(X, Mo, f, at, o = {}) {
  const p = Mo.flaw(f, o);
  try { X.loss(p, at, LOSS[f] ? LOSS[f][0] : ''); } catch (e) { /* */ }
  try { X.shake(0.18, 0.3); } catch (e) { /* */ }
  return p;
}
export const scr2 = (X, p) => { const r = X.scr(p[0], p[1], p[2]); return { x: r.x, y: r.y, on: r.on !== false }; };
export function lens(X, fov) { try { const c = X.camera; if (c && fov && Math.abs(c.fov - fov) > 0.01) { c.fov = fov; c.updateProjectionMatrix(); } } catch (e) { /* */ } }
/** the perfect play's full-screen word (the work's own: WORDS[kind]), then the act's end with its result */
export async function finish(X, A, res, word, at, film) {
  if (A.ended) return; A.finished = true;
  if (res.perfect) { try { X.perfect(word, at); } catch (e) { /* */ } await X.wait(1.0); }
  if (A.ended) return;
  X.end({ stars: res.stars, q: res.q, pts: res.pts, perfect: res.perfect, at, flags: res.flags, film });
}

/**
 * the left thumb's three states over a way (works 3 and 4). o.dir() → the way's forward screen direction { x, y } (unit), per frame.
 *   down(f) / move(f) / up(f) from the fingers; read(dt) → { pull, brake, side } for the model's step this frame.
 * pull: the thumb moved forward along the way at more than PULL px/s (on the 420-px screen) in the last tenth of a second;
 * brake: the thumb is down and not pulling (held still, or barely moving) — the brake's bar grows in the model while held;
 * side: the thumb's speed across the way, amah/s of straightening (+ toward the screen's right of the way).
 */
export const TH = Object.freeze({ PULL: 60, SIDE: 0.012, WIN: 0.1, HOLD: 0.18 });   // (HOLD: a stroke's slow end is not a brake — the thumb must rest this long)
export function thumb(o) {
  const T = { f: null, hist: [], pull: false, brake: false, side: 0, t: 0, n: 0 };
  const k = () => (typeof innerHeight === 'number' && innerHeight > 0 ? 420 / innerHeight : 1);
  return {
    get on() { return !!T.f; },
    get state() { return T.f ? (T.pull ? 'pull' : 'brake') : 'free'; },
    down(f) { T.f = f; T.hist = [{ t: T.t, x: f.x, y: f.y }]; T.pull = false; T.n++; T.calm = T.t; },
    move(f) { if (T.f && f.id === T.f.id) { T.hist.push({ t: T.t, x: f.x, y: f.y }); } },
    up(f) { if (T.f && (!f || f.id === T.f.id)) { T.f = null; T.hist = []; T.pull = false; T.side = 0; } },
    read(dt) {
      T.t += dt;
      if (!T.f) return { pull: false, brake: false, side: 0 };
      T.hist.push({ t: T.t, x: T.f.x, y: T.f.y });
      while (T.hist.length > 2 && T.t - T.hist[0].t > TH.WIN) T.hist.shift();
      const a = T.hist[0], b = T.hist[T.hist.length - 1], w = Math.max(1e-3, b.t - a.t);
      const d = o.dir ? o.dir() : { x: 0, y: -1 };
      const vx = ((b.x - a.x) / w) * k(), vy = ((b.y - a.y) / w) * k();
      const along = vx * d.x + vy * d.y, across = -vx * d.y + vy * d.x;
      T.pull = along > TH.PULL; if (T.pull || Math.hypot(vx, vy) > TH.PULL * 1.6) T.calm = T.t;
      T.side = o.side ? Math.max(-1.2, Math.min(1.2, across * TH.SIDE)) : 0;
      return { pull: T.pull, brake: !T.pull && T.t - T.calm >= TH.HOLD, side: T.side };
    },
    dbg() { return { on: !!T.f, pull: T.pull, side: +T.side.toFixed(2), n: T.n }; },
  };
}
