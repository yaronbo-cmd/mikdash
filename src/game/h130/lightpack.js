/* ── build 130 (L-wire) ── h130/lightpack.js — TEMPORARY wiring for the light station only (station 3 coder's tree): a minimal pack
 * for the director so the light's three works run on their own page (window.__H130_FULL, with __H109_ONLY = 'light'). The real pack
 * (part 1: h130/pack.js, acts.js, world.js) replaces this file at the merge: it takes LIGHT from light.js into its ACTS and calls
 * lightWorld / lightSync / lightFrame from light3d.js in its world.
 * The court's model is shown built (its gallery and the gallery's ladders stand), so level 1's practice ladder is there.
 */
import { PLAN, createH130 } from './model.js';
import { LIGHT } from './light.js';
import { lightWorld, lightSync, lightFrame, SL } from './light3d.js';
import { lookPose, sightPose, LOOK05 } from '../h120/look120.js';

let XS = null, MS = null;
const ACTS = {
  light: LIGHT,
  __init(X) { XS = X; try { lightWorld(X, MS ? MS.st : null); } catch (e) { console.warn('[h130L] world', e && e.message); } },
  __sh: () => SL,
  __frame(dt, X) { try { if (!SL.g && X) lightWorld(X, MS ? MS.st : null); lightFrame(dt); } catch (e) { /* */ } },
};
export function makePack05L() {
  return {
    id: 'nashim', key: 'h130', name: 'עזרת הנשים', PLAN, ACTS, icon: '🏛',
    // (the light opens on its own here: st.crews — the gallery "built by the crews")
    create: (save) => { const M = createH130(save); M.st.crews = 1; MS = M; return M; },
    count: (M) => M.count(),
    freeFilms: true,
    look: { pose: lookPose, sightPose, walk: true, ug: LOOK05.UG },
    endTitle: 'עזרת הנשים', endSub: '', film: [],
    sync(M, S0, instant, X) {
      MS = M;
      try { const info = S0.siteInfo('nashim'); if (info && info.status !== 'done' && info.phase !== 'done') S0.setWork('nashim', { phase: 'done', instant: true }); } catch (e) { /* */ }
      if (X) { try { lightWorld(X, M.st); lightSync(X, M.st); } catch (e) { /* */ } }
    },
    unitEnd: () => null,
    rest(X, M) { MS = M; lightWorld(X, M.st); },
    dispose() { void XS; },
  };
}
