/* ── build 120 ── h120/pack.js — stage 05 "עזרת הנשים והגזוזטרא" as a pack for the stage director (h109/director.js `pack`): its
 * plan and save (free choice, rule 54: model.js), its acts, its world; how the crews' share shows (the chambers' walls rise in their
 * hands through the stage's courses, as h113 does for the gatehouses); what closes a unit (a bay, when his beam is seated); the
 * opening film (rule 3: the whole Mount from high, down to the bare court; the crews raise the first column, S1).
 * PHASE 4 (not built yet): the load test (8.2) and the film "ליל שמחת בית השואבה" (8.3); the finale below only closes the stage.
 */
import { PLAN, COLS, H120, createH120 } from './model.js';
import { ACTS } from './acts.js';
import { SH5, finalWorld, disposeChip, colFrame, colBuild } from './world.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const beat = (X, ms) => (X && X.wait ? X.wait(ms / 1000) : sleep(ms));
const FOUND = 0.15;
const near = (X, on) => { try { if (X.view && X.view.closeCam) X.view.closeCam(!!on, 'h120-film'); } catch (e) { /* */ } };

export function makePack05() {
  const P = {
    id: 'nashim', key: 'h120', name: 'עזרת הנשים', PLAN, ACTS, icon: '🏛',
    // (the free works offered: the columns only while saw and carry are not built — PHASE 2/3)
    create: (save) => createH120(save, { freeKinds: ['col'] }),
    count: (M) => M.count(),
    freeFilms: true,
    crews: ['nashim', 3, [0, 1, 2]],
    endTitle: 'עזרת הנשים נבנתה!',
    endSub: 'עזרת הנשים היתה ארך מאה ושלשים וחמש על רוחב מאה ושלשים וחמש (מדות ב, ה)',
    // the stage's end: the court from high, the south gallery, the north, the whole
    film: [[[73, 220, 230], [73, 0, 0], 2.4], [[73, 24, 28], [73, 16, 64], 2.2], [[73, 24, -28], [73, 16, -64], 2.2], [[73, 260, 260], [73, 0, 0], 1.4]],
    /** the chambers' walls as they stand while he works: their courses rise with his twelve works (M.shown) */
    sync(M, S0, instant, X) {
      const info = S0.siteInfo('nashim'); if (!info) return;
      if (M.finished()) {
        if (info.status !== 'done') { try { S0.setWork('nashim', { phase: 'done' }); } catch (e) { /* */ } }
        if (X && SH5.X && !SH5.final) finalWorld(X);
        return;
      }
      const n = Math.round(M.shown() * (info.stones || 0));
      const there = info.phase === 'courses' && info.set === n;
      if (there && !instant) return;
      if (info.phase !== 'courses') instant = true;
      S0.setWork('nashim', { phase: 'courses', stones: n, ghost: 0, stock: 10, instant: !!instant });
      if (instant) { try { S0.setStage('nashim', 'building', FOUND + (1 - FOUND) * (info.stones ? n / info.stones : 0), { instant: true }); } catch (e) { /* */ } }
    },
    unitEnd: (m, M) => M.unitEnd(m),
    /** the opening (rule 3: where am I): the Mount from high, down to the bare court of the women; the crews raise the first column */
    before(m, X, M) {
      const st = M.st;
      if (m || st.intro) return null;
      return (async () => {
        st.intro = 1; X.save(); near(X, true);
        SH5.introHold = 'S1'; try { colBuild(X, 'S1'); } catch (e) { /* */ }   // (S1 on its cradle: the crews raise it in view below)
        X.shot([40, 460, 430], [73, 0, 0], 0.01); await beat(X, 300);
        X.line('שלב 05: עזרת הנשים · וחלקה היתה בראשונה (מדות ב, ה)');
        X.shot([150, 120, 110], [73, 6, 0], 3.2); await beat(X, 3400);
        X.shot([118, 34, 30], [70, 8, 10], 2.4); await beat(X, 2600);
        X.line('והתקינו שיהו נשים יושבות מלמעלה ואנשים מלמטה (סוכה נא, ב)');
        // the first column (S1) goes up in the crews' hands: the gallery begins
        const fr = colFrame('S1');
        X.shot([fr.x + 6, 15, fr.z - 26], [fr.x + 1.5, 10, fr.z], 2.2); await beat(X, 1600);
        SH5.introHold = null;   // (world.js raises it in view on its next beat)
        await beat(X, 1200);
        await beat(X, 3600);
        X.line('גזוזטרא על עמודים, בשלושה צדדים · אנחנו מקימים, מנסרים, נושאים, ומביאים מים למקווה', 3600);
        X.shot([95, 70, 40], [75, 8, 0], 2.4); await beat(X, 3000);
        X.line('');
        near(X, false);
      })();
    },
    /** PHASE 4 (not built yet): the load test and the night film; for now the stage closes in its own world */
    async finale(X) {
      near(X, true);
      finalWorld(X);
      try { X.stages.setWork('nashim', { phase: 'done' }); } catch (e) { /* */ }
      X.line('והקיפוה כצוצרה, שהנשים רואות מלמעלן, והאנשים מלמטן (מדות ב, ה)', 3600);
      X.shot([73, 30, 22], [73, 16, 64], 2.2); await beat(X, 3200);
      X.line('');
      near(X, false);
    },
    dispose() { disposeChip(); },
  };
  void COLS; void H120;
  return P;
}
