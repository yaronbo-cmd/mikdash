/* ── build 131 ── h131/pack.js — stage 08 "יסוד המזבח" (spec docs/specs/shlav-08-he.md) as a pack for the stage director
 * (h109/director.js `pack`): its plan and save (model.js createH131: the pit and the frame free between them, the pour after both, the
 * finale after the pour), its acts (acts.js), its world (world.js: the pit at Beit Kerem and the altar's site, drawn from the save);
 * the opening (rule 3: the Mount from high, down to the altar's place; a tap skips it); the end (the white step in the middle of the
 * great court, from high: BOOK.s08.cam.end — the game holds it under the end card, which names the next stage, NEXT_STAGE).
 */
import { PLAN, LINES, NEXT_STAGE, createH131, fromOld } from './model.js';
import { ACTS } from './acts.js';
import { SH8, initWorld, finalWorld, restWorld } from './world.js';
import { makeLook, ringBoxes, LOOK_RING_K } from '../world/look.js';
import { BOOK } from '../world/grid.js';

const S8 = BOOK.s08, CAM = S8.cam;
// the right thumb's look inside the Azarah's walls (as stage 07's), the House kept out
const LOOK8 = makeLook({ boxes: [...ringBoxes(BOOK.s02.side, BOOK.s02.ring.T, BOOK.s02.ring.top), BOOK.s06.house], K: LOOK_RING_K });
const near = (X, on) => { try { if (X.view && X.view.closeCam) X.view.closeCam(!!on, 'h131-film'); } catch (e) { /* */ } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const beat = (X, ms) => (X && X.wait ? X.wait(ms / 1000) : sleep(ms));
/** a tap anywhere (or `ms`) ends a picture of a film */
function tapOr(X, ms) {
  return new Promise((res) => {
    let done = false; const f = () => { if (done) return; done = true; removeEventListener('pointerdown', f, true); res(true); };
    setTimeout(() => addEventListener('pointerdown', f, true), 250);
    beat(X, ms).then(() => { if (!done) { done = true; removeEventListener('pointerdown', f, true); res(false); } });
  });
}
/** an old save (the game before build 131) whose stage 08 (the old yesod site) was done: the new stage stands built by the crews (once) */
export function migrate08(G, oldDone) {
  if (!G || G.h131) return false;
  if (!oldDone) return false;
  G.h131 = fromOld(true); return true;
}
export function makePack08(env = {}) {
  const P = {
    time: env,
    id: 'yesod', key: 'h131', name: 'יסוד המזבח', PLAN, ACTS, icon: '🔥',
    create: (save) => createH131(save),
    count: (M) => M.count(),
    freeFilms: true,
    look: LOOK8,
    endTitle: 'יסוד המזבח נבנה!',
    endSub: 'עלה אמה וכנס אמה, זה היסוד (מידות ג, א)',
    nextStage: NEXT_STAGE,
    endView: CAM.end,
    film: [[CAM.end[0], CAM.end[1], 2.4]],
    /** the world as the save has it (world.js rebuilds on a key) */
    sync(M, S0, instant, X) { if (!X || !SH8.X) return; if (M.finished()) finalWorld(X); },
    unitEnd: () => null,
    /** the opening (rule 3: where am I): the Mount from high, down to the altar's place; a tap skips it */
    before(m, X, M) {
      const st = M.st;
      if (m || st.intro) return null;
      return (async () => {
        st.intro = 1; X.save(); near(X, true);
        const acting = () => { try { return !!(X.acting && X.acting()); } catch (e) { return false; } };
        X.line(LINES.stage, 0);
        for (let i = 0; i < CAM.open.length; i++) {
          if (acting()) break;
          X.shot(CAM.open[i][0], CAM.open[i][1], i ? 2.6 : 0.01);
          if (await tapOr(X, i ? 3000 : 2200)) break;
        }
        if (!acting()) X.line('');
        near(X, false);
      })();
    },
    /** the stage's close: the world as he built it (the finale's own film is the finale lane's; build 131 part 3) */
    async finale(X) { finalWorld(X); X.M.st.film = 1; X.save(); },
    /** after a reload, the stage done: the yesod as he built it */
    rest(X, M) { restWorld(X, M); },
    dispose() {},
  };
  void initWorld;
  return P;
}
