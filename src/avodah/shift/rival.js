// ── shift29 ── rival.js — the NPC משמר whose bar runs beside yours (GAME29-PRINCIPLES §1.4, §2.5). A steady rate per second with a
// slow ±noise (a wave, so the bar never jumps backwards), integers only. The name is a משמר of the 24 (calendar.js MISHMAROT) —
// never a real person, never the player's own משמר.
import { MISHMAROT } from '../../calendar.js';
// the order a level picks from (ידעיה first, as GAME29 §2.8 tells it), skipping the player's own
const PICK = [1, 0, 14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23];
export function rivalName(level = 1, own = 0) {
  const list = PICK.filter((i) => i !== (own | 0) - 1);
  return MISHMAROT[list[((level | 0) - 1 + list.length) % list.length]];
}
export function createRival(spec = {}) {
  const perS = Number.isFinite(spec.perS) ? spec.perS : 1.5, noise = Number.isFinite(spec.noise) ? spec.noise : 0.25;
  let rnd = typeof spec.rng === 'function' ? spec.rng : Math.random;
  const ph = rnd() * 6.283, ph2 = rnd() * 6.283;
  let t = 0, acc = 0;
  const R = {
    name: spec.name || rivalName(spec.level || 1, spec.own || 0),
    score: 0,
    tick(dt) {
      if (!(dt > 0)) return R.score;
      t += dt;
      // the rate wanders within ±noise of perS (two slow waves), never below a fifth of it
      const k = 1 + noise * (0.65 * Math.sin(t * 0.21 + ph) + 0.35 * Math.sin(t * 0.53 + ph2));
      acc += Math.max(perS * 0.2, perS * k) * dt;
      R.score = Math.floor(acc);
      return R.score;
    },
    get t() { return t; },
  };
  return R;
}
// ── /shift29 ──
