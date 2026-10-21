/* works.js — the registry of the day's hand-works (ENGINE22; see bus/ENGINE22.md "CONTRACT"). WORKSA22/WORKSB22 register theirs:
 *   import { WORKS } from '../day/works.js'; WORKS.watch = { id: 'watch', he, icon, begin(ctx), run(ctx) | model(ctx), end?, box? }
 * Unregistered ids run the generic errand (generic.js): three taps at the marker. */
export const WORKS = {};
export const registerWork = (id, def) => { WORKS[id] = { id, ...def }; return WORKS[id]; };
/** functions called once with a ctx when Phase B's world goes live (a work's shared props / lights: WORKSA22's warmWorks) */
export const warmers = [];
