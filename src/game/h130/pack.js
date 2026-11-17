/* ── build 130 ── h130/pack.js — the NEW stage 05 "עזרת הנשים" (spec docs/specs/shlav-05-hadash-he.md, brief §7) as a pack for the stage
 * director (h109/director.js `pack`): its plan and save (model.js createH130: the gallery in order, the wood free, the light after the
 * gallery, the evening after the light), its acts (acts.js), its world (world.js: the gallery as he built it, drawn from the save); the
 * right thumb's look over the walled court (world/look.js with the court's walls at their built tops and the galleries); how the crews'
 * share shows (the chambers' walls rise with his works, as build 120's stage did); the stage's short opening (a tap skips it).
 * The game's stage 05 always (build 130 part 3): the gallery, the wood chamber, the light and the evening; the film after the evening.
 */
import { PLAN, LINES, createH130, fromOld } from './model.js';
import { playFilm } from './film130.js';
import { ACTS } from './acts.js';
import { SH130, initWorld, finalWorld, restWorld, Y, GEO } from './world.js';
import { makeLook, LOOK_RING_K } from '../world/look.js';
import { BOOK } from '../world/grid.js';

const S5 = BOOK.s05, GB = S5.gal, CAM = S5.cam;
/** the look's boxes: the court's walls and the chambers' at their built tops (BOOK.s05.walls, gal.wallTops), the three galleries
 *  (from the wall's face to the column line, from the beam's foot to the railing's top) */
export const BOXES130 = Object.freeze([
  ...S5.walls.map((r, i) => [r[0], GEO.FLOOR - 1, r[1], r[2], GB.wallTops[i] != null ? GB.wallTops[i] : 40, r[3]]).filter((b) => b[4] > GEO.FLOOR + 0.5),
  ...Object.values(GB.runs).map((R) => {
    const e = R.line - Math.sign(R.wall - R.line) * 0.4, w0 = Math.min(R.wall, e), w1 = Math.max(R.wall, e);
    return R.axis === 'x' ? [R.a0, Y.COL_TOP, w0, R.a1, Y.GFLOOR + GEO.RAIL, w1] : [w0, Y.COL_TOP, R.a0, w1, Y.GFLOOR + GEO.RAIL, R.a1];
  }),
].map((b) => Object.freeze(b)));
const LOOK130 = makeLook({ boxes: BOXES130, K: LOOK_RING_K });
export const PLINES = Object.freeze({
  stage: 'שלב 05: עזרת הנשים · הגזוזטרא, לשכת העצים, ואור בית השואבה',
});
const FOUND = 0.15;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const beat = (X, ms) => (X && X.wait ? X.wait(ms / 1000) : sleep(ms));
/** a tap anywhere (or `ms`) ends a part of a film */
function tapOr(X, ms) {
  return new Promise((res) => {
    let done = false; const f = () => { if (done) return; done = true; removeEventListener('pointerdown', f, true); res(true); };
    setTimeout(() => addEventListener('pointerdown', f, true), 250);
    beat(X, ms).then(() => { if (!done) { done = true; removeEventListener('pointerdown', f, true); res(false); } });
  });
}
const near = (X, on) => { try { if (X.view && X.view.closeCam) X.view.closeCam(!!on, 'h130-film'); } catch (e) { /* */ } };

/** an old save of build 120's stage 05 (G.h120) → the new stage's (G.h130), once: finished → built by the crews, in the middle → from the
 *  beginning (model.js fromOld); the old key goes. Later stages' progress lives in other keys and is never touched. Returns true when it moved */
export function migrate05(G, oldDone) {
  if (!G || G.h130 || !G.h120) return false;
  G.h130 = fromOld(G.h120, !!oldDone); delete G.h120;
  return true;
}
export function makePack130(env = {}) {
  const P = {
    id: 'nashim', key: 'h130', name: 'עזרת הנשים', PLAN, ACTS, icon: '🏛',
    create: (save) => createH130(save),
    count: (M) => M.count(),
    freeFilms: true,
    look: LOOK130,
    crews: ['nashim', 3, [0, 1, 2]],
    endTitle: 'עזרת הנשים נבנתה!',
    endSub: LINES.middot25,
    film: [],
    time: env,   // (the world's clock: setTime(k), restoreTime() — the evening's dark, eve.js)
    /** the chambers' walls as they stand while he works: their courses rise with his ten works; the gallery as the save has it */
    sync(M, S0, instant, X) {
      const info = S0.siteInfo('nashim'); if (!info) return;
      if (M.finished()) {
        if (info.status !== 'done') { try { S0.setWork('nashim', { phase: 'done' }); } catch (e) { /* */ } }
        if (X && SH130.X) finalWorld(X);
        return;
      }
      const n = Math.round(M.progress() * (info.stones || 0));
      if (info.phase === 'courses' && info.set === n && !instant) return;
      if (info.phase !== 'courses') instant = true;
      S0.setWork('nashim', { phase: 'courses', stones: n, ghost: 0, stock: 10, instant: !!instant });
      if (instant) { try { S0.setStage('nashim', 'building', FOUND + (1 - FOUND) * (info.stones ? n / info.stones : 0), { instant: true }); } catch (e) { /* */ } }
    },
    unitEnd: () => null,
    /** the opening (rule 3: where am I): the Mount from high, down to the bare court of the women; a tap skips it */
    before(m, X, M) {
      const st = M.st;
      if (m || st.intro) return null;
      return (async () => {
        st.intro = 1; X.save(); near(X, true);
        const O = CAM.open130;
        X.shot(O[0][0], O[0][1], 0.01); await beat(X, 200);
        X.line(PLINES.stage, 0);
        X.shot(O[1][0], O[1][1], 2.8);
        if (await tapOr(X, 3200)) { X.line(''); near(X, false); return; }
        X.shot(O[2][0], O[2][1], 2.2);
        await tapOr(X, 2800);
        X.line(''); near(X, false);
      })();
    },
    /** the stage's close: the world as he built it, then the film of Simchat Beit HaShoeva (v3, full screen, a tap skips it; a film that
     *  cannot load or play is skipped in silence), then the director's end card */
    async finale(X) { finalWorld(X); try { await playFilm(X); } catch (e) { console.warn('[h130] film', e && e.message); } },
    /** after a reload, the stage done: his galleries as he built them, the model's own hidden, no crews of the stage */
    rest(X, M) { restWorld(X, M); },
    dispose() {},
  };
  void initWorld;
  return P;
}
