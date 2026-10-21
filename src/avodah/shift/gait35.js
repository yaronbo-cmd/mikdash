/* ── recovered (16–26c) ── gait35.js — the kohen's gait by his pace (amot/s), taken out of hero35.js (its HERO35 spreads GAIT35):
 * Idle under walkAt; Walking_A at a rate of his pace over the clip's own (walkV), held within walkRates; Running_A from runAt — and
 * back to the walk only under runAt − runHys, so it does not flicker at the edge; slip: how far the feet slide (1 = none).
 * The file's and its exports' names (gait35.js, GAIT35, gaitFor) are the recovery's: the bundle kept none. Never a Divine Name. */
export const GAIT35 = Object.freeze({ walkAt: 0.5, runAt: 3.4, runHys: 0.3, walkV: 1.28, runV: 5.64, walkRates: Object.freeze([0.7, 2.9]), runRates: Object.freeze([0.6, 2]), walkClip: 'Walking_A', runClip: 'Running_A', idleClip: 'Idle' });

/** his pace, the clip playing now → { clip, rate, slip } */
export function gaitFor(sp, cur = '') {
  const G = GAIT35, clamp = (v, r) => Math.max(r[0], Math.min(r[1], v));
  if (!(sp >= G.walkAt)) return { clip: G.idleClip, rate: 1, slip: 0 };
  if (sp >= (cur === G.runClip ? G.runAt - G.runHys : G.runAt)) { const r = clamp(sp / G.runV, G.runRates); return { clip: G.runClip, rate: r, slip: +(r * G.runV / sp).toFixed(2) }; }
  const w = clamp(sp / G.walkV, G.walkRates);
  return { clip: G.walkClip, rate: w, slip: +(w * G.walkV / sp).toFixed(2) };
}
