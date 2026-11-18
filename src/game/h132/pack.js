/* ── build 132 ── h132/pack.js — stage 09 "הסובב וחוט הסיקרא" (spec docs/specs/shlav-09-he.md) as a pack for the stage director
 * (h109/director.js `pack`): its plan and save (model.js createH132: the stage's flow STAGE_FLOW, one table; levels 1 and 3 from the
 * works' links), its acts (acts.js), its world (world.js: the block's states drawn from the save); the opening (rule 3: where am I —
 * the altar's place from the court, the white yesod waiting; a tap skips it); the end (spec "סיום השלב": the camera rises and circles
 * the block round BOOK.s09.cam.end; the game holds it under the end card, which names the next stage, NEXT_STAGE).
 * Phase 0: the ending's film is the circle only (the line lighting, running and pulsing, the waves of light, the red and gold fireworks
 * are the lead's in phase 1).
 */
import { h131Card } from '../h131/card.js';
import { PLAN, LINES, NEXT_STAGE, createH132, fromOld } from './model.js';
import { ACTS } from './acts.js';
import { SH9, initWorld, finalWorld, restWorld } from './world.js';
import { makeLook, ringBoxes, LOOK_RING_K } from '../world/look.js';
import { BOOK } from '../world/grid.js';

const S9 = BOOK.s09, CAM = S9.cam, END = CAM.end;
// the right thumb's look inside the Azarah's walls (as stages 07 and 08), the House kept out
const LOOK9 = makeLook({ boxes: [...ringBoxes(BOOK.s02.side, BOOK.s02.ring.T, BOOK.s02.ring.top), BOOK.s06.house], K: LOOK_RING_K });
const near = (X, on) => { try { if (X.view && X.view.closeCam) X.view.closeCam(!!on, 'h132-film'); } catch (e) { /* */ } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const beat = (X, ms) => (X && X.wait ? X.wait(ms / 1000) : sleep(ms));
function tapOr(X, ms) {
  return new Promise((res) => {
    let done = false; const f = () => { if (done) return; done = true; removeEventListener('pointerdown', f, true); res(true); };
    setTimeout(() => addEventListener('pointerdown', f, true), 250);
    beat(X, ms).then(() => { if (!done) { done = true; removeEventListener('pointerdown', f, true); res(false); } });
  });
}
/** the end's round over the block (spec cam:end: a circle round the middle, radius 40, height 50): its shots from the south-east round */
export function endRound(n = 4) {
  const [cx, cz] = END.c, out = [];
  for (let i = 0; i < n; i++) { const a = Math.PI / 4 + (i / n) * Math.PI * 2; out.push([[cx + Math.cos(a) * END.R, END.y, cz + Math.sin(a) * END.R], [cx, S9.lineY, cz], 2.2]); }
  return out;
}
/** an old save whose old stage 09 (the game before build 132: the old sovev site) was done: the new stage stands built by the crews */
export function migrate09(G, oldDone) {
  if (!G || G.h132) return false;
  if (!oldDone) return false;
  G.h132 = fromOld(true); return true;
}
export function makePack09(env = {}) {
  const R = endRound();
  const P = {
    time: env,
    id: 'sovev', key: 'h132', wordScreen: true,   // (the perfect screen says the work's own word: X.perfect(WORDS[kind]))
    name: 'הסובב וחוט הסיקרא', PLAN, ACTS, icon: '🧵',
    create: (save) => createH132(save),
    count: (M) => M.count(),
    freeFilms: true,
    // a link for every work AND level (h109/director.js workFlag): the page opens at the work; the flow before its kind stands as the
    // crews' (model.js autoTo); the work begins from its own world (stage(kind, lv, save)). A work played again starts without its own
    // earlier flaws (the save keeps the last play of each work).
    workLinks: true,
    workSeed(M, id) { M.clearFlaws(id); },
    quiet: true,
    byPlan: true,
    look: LOOK9,
    endTitle: 'הסובב וחוט הסיקרא נבנו!',
    endSub: 'וחוט של סקרא חוגרו באמצע (מידות ג, א)',
    nextStage: NEXT_STAGE,
    endView: [R[0][0], R[0][1]],
    film: R,
    sync(M, S0, instant, X) { if (!X || !SH9.X) return; if (M.finished()) finalWorld(X); },
    unitEnd: () => null,
    /** the opening (rule 3): the court from the north-east, down to the white yesod; a tap skips it */
    before(m, X, M) {
      const st = M.st;
      if (m || st.intro) return null;
      return (async () => {
        st.intro = 1; X.save(); near(X, true);
        const acting = () => { try { return !!(X.acting && X.acting()); } catch (e) { return false; } };
        X.line(LINES.stage, 0);
        const shots = [[R[0][0], R[0][1]], CAM.w1];
        for (let i = 0; i < shots.length; i++) {
          if (acting()) break;
          X.shot(shots[i][0], shots[i][1], i ? 2.6 : 0.01);
          if (await tapOr(X, i ? 3000 : 2200)) break;
        }
        if (!acting()) X.line('');
        near(X, false);
      })();
    },
    /** the stage's close (phase 0: the world as he built it, the end card's large type; the ending's film is phase 1's) */
    async finale(X) { finalWorld(X); X.M.st.film = 1; X.save(); h131Card(true); try { X.kohen(false); } catch (e) { /* */ } },
    /** after a reload, the stage done: the block as he built it */
    rest(X, M) { restWorld(X, M); },
    dispose() {},
  };
  void initWorld;
  return P;
}
