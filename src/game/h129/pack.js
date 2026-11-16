/* ── build 129 ── h129/pack.js — stage 07 "הלשכות" as a pack for the stage director (h109/director.js `pack`): its plan and save (free
 * choice: model.js createH129 — the three stations free among themselves, inside each in order, the night after the nine), its acts,
 * its world (world.js, drawn from the save); the opening (about 8 s, a tap skips it: the south chambers from high, the vault's hall
 * open to the sky); the night's last pictures (night.js plays the night itself as the stage's tenth work; here, after it: the fire in
 * the vault, the water standing in the troughs, the round bench waiting for the morning; the Mishnah's words and a small summary card
 * that says it is a picture of what the house was built for).
 *
 * The Golah (station 2, golah.js) is part 3: GOLAH_IN_PLAY. With it off, the pack's create() gives the Golah's three works to the
 * crews as skipped (st.res[id].skip, st.golahCrews; no stars, no points), as h128 did with the sea; the count on the top pill leaves
 * them out, and the world draws the crews' well, wheel, channel and troughs with water in them.
 */
import { PLAN, LINES, createH129 } from './model.js';
import { ACTS } from './acts.js';
import { SH7, initWorld, finalWorld, roofsOpen, vaultWhole, walkHide } from './world.js';
import { nightRig, nightRelease } from './night.js';
import { makeLook, ringBoxes, LOOK_RING_K } from '../world/look.js';
import { BOOK } from '../world/grid.js';
import { filmFigs } from '../h128/figgate.js';
import { beat, tapOr, card, esc, cite } from './ui7.js';

export const GOLAH_IN_PLAY = true;   // (build 129, part 3: golah.js)
const S7 = BOOK.s07, CAM = S7.cam;
// (the rooms' walls: four boxes each, as the Azarah's ring)
const roomBoxes = ({ T, rooms }) => rooms.flatMap(([x0, z0, x1, z1, y0, y1]) => [[x0, y0, z0, x1, y1, z0 + T], [x0, y0, z1 - T, x1, y1, z1], [x0, y0, z0, x0 + T, y1, z1], [x1 - T, y0, z0, x1, y1, z1]]);
const LOOK7a = makeLook({ boxes: [...ringBoxes(BOOK.s02.side, BOOK.s02.ring.T, BOOK.s02.ring.top), BOOK.s06.house, ...roomBoxes(S7.lookRooms)], K: LOOK_RING_K });
// (round 2, brief F5: an act that plays inside a closed room — the instruments chambers, Beit HaMoked's hall — gives its own look shape,
//  SH7.lookFn(base, u, yaw) → { p, t, fov } or null: the camera rises inside the room or out of its open top, never back through a wall)
const ownLook = (base, u, yaw) => { try { return SH7.lookFn ? SH7.lookFn(base, u, yaw) : null; } catch (e) { return null; } };
const LOOK7 = Object.freeze({ ...LOOK7a,
  pose: (base, u, yaw, lift = 0) => ownLook(base, u, yaw) || LOOK7a.pose(base, u, yaw, lift),
  sightPose: (base, u, yaw, ...more) => (ownLook(base, u, yaw) ? { lift: 0, dyaw: 0 } : LOOK7a.sightPose(base, u, yaw, ...more)) });
const GOLAH_IDS = ['golah1', 'golah2', 'golah3'];
const near = (X, on) => { try { if (X.view && X.view.closeCam) X.view.closeCam(!!on, 'h129-film'); } catch (e) { /* */ } };
export const PLINES = Object.freeze({
  stage: 'הלשכות: לשכת הגזית, לשכות כלי השיר ובית המוקד · הסדר חופשי',
  crews: 'לשכת הגולה: הצוותות בנו את הבור, הגלגל והתעלה',
  end1: 'המדורה מאירה את הקמרון', end2: 'המים עומדים בשקתות', end3: 'הספסל העגול בלשכת הגזית מחכה לבוקר',
});

/** the Golah's works given to the crews (skipped) while the Golah is not in play */
export function golahSkip(M) {
  for (const id of GOLAH_IDS) if (!M.isDone(id)) { M.st.cur = id; M.done({ stars: 0, q: 0, pts: 0 }); M.st.res[id].skip = 1; }
  M.st.golahCrews = 1; return M;
}
/** the stage's model. With the Golah in play, a save the crews' Golah came in (st.golahCrews) keeps its other works and opens the Golah
 *  to play from its start (golah1 first, each next once the one before is his); the night waits for it only if it has not opened yet */
export function createStage07(save) {
  const M = createH129(save), st = M.st;
  if (!GOLAH_IN_PLAY) return golahSkip(M);
  if (!st.golahCrews) return M;
  const crews = (id) => !!(st.res[id] && st.res[id].skip);
  if (!M.isDone('night')) {
    for (const id of GOLAH_IDS) if (crews(id)) { delete st.res[id]; st.done = st.done.filter((x) => x !== id); }
    delete st.golahCrews; st.i = st.done.length; if (GOLAH_IDS.includes(st.cur)) st.cur = null;
  }
  return M;
}
const skipped = (M) => PLAN.filter((m) => M.st.res[m.id] && M.st.res[m.id].skip).length;

export function makePack07(env = {}) {
  const P = {
    time: env,   // (the world's clock: setTime(k), restoreTime() — the night's dark and the morning after)
    id: 'lishka', key: 'h129', name: 'הלשכות', PLAN, ACTS, icon: '🏛',
    create: (save) => createStage07(save),
    count: (M) => { const k = skipped(M); return [M.nDone() - k, PLAN.length - k]; },
    freeFilms: true,
    look: LOOK7,
    endTitle: 'הלשכות נבנו!',
    endSub: 'לשכת הגזית, שם היתה סנהדרי גדולה של ישראל יושבת (מידות ה, ד)',
    film: CAM.after ? [[CAM.after[0], CAM.after[1], 2.4]] : [],   // (round 4: after the summary, the camera set on the whole before the frontier card; it stays there)
    /** the world as the save has it (world.js rebuilds on a key); the stage's end: the roofs raised */
    sync(M, S0, instant, X) { if (!X || !SH7.X) return; if (M.finished() && !SH7.final && !SH7.rig) finalWorld(X); },
    unitEnd: () => null,
    /** the opening (rule 3: where am I): the chambers from high; the line of the stage */
    before(m, X, M) {
      const st = M.st;
      if (m || st.intro) return null;
      return (async () => {
        st.intro = 1; X.save(); near(X, true);
        X.shot(CAM.open[0][0], CAM.open[0][1], 0.01); await beat(X, 200);
        X.line(PLINES.stage, 0);
        X.shot(CAM.open[1][0], CAM.open[1][1], 2.6);
        if (await tapOr(X, 3400)) { X.line(''); near(X, false); return; }
        X.shot(CAM.open[2][0], CAM.open[2][1], 2.2);
        if (st.golahCrews && !GOLAH_IN_PLAY) X.line(PLINES.crews, 0);
        await tapOr(X, 3600);
        X.line(''); near(X, false);
      })();
    },
    /** after the night: its last three pictures (in the night's light), the Mishnah's words, the summary; the roofs raised after */
    async finale(X) {
      near(X, true); X.line('');
      const st = X.M.st, rig = SH7.rig || nightRig(X); SH7.rig = rig;
      const cam = X.camera, fov0 = cam ? cam.fov : 0, lens = (f) => { try { cam.fov = f; cam.updateProjectionMatrix(); } catch (e) { /* */ } };
      const figsBack = filmFigs({ scene: X.scene, keep: () => ((SH7.nightKeep && SH7.nightKeep.actors) || []).map((a) => ({ a })), workers: (fn) => { try { if (X.hero && X.hero.h128Workers) X.hero.h128Workers(fn); } catch (e) { /* */ } } });
      try {
        vaultWhole(X); roofsOpen(X, true); rig.apply(1); try { rig.lit(1); } catch (e) { /* */ }
        try { if (X.kohen) X.kohen(false); } catch (e) { /* */ }
        // (round 3: each picture composed — its target carried out past the director's least distance so the eye stays where it is set;
        //  seen two seconds at least before a tap moves on; the moon outside the hall, the fire's glow on the barrel inside it)
        const farT = (p, t, d = 34) => { const v = [t[0] - p[0], t[1] - p[1], t[2] - p[2]], L = Math.hypot(...v) || 1; return L >= d ? t : p.map((q, i) => q + (v[i] / L) * d); };
        const pics = [[CAM.end[0], PLINES.end1, 0], [CAM.end[1], PLINES.end2, 1], [CAM.end[2], PLINES.end3, 2]];
        for (const [c, line, i] of pics) {
          try { rig.moon(i > 0); rig.glow(i === 0 ? 1 : 0); } catch (e) { /* */ }
          if (CAM.endFov) lens(CAM.endFov[i]);
          X.shot(c[0], farT(c[0], c[1]), 1.8); X.line(line, 0); await X.wait(2.0); await tapOr(X, 2600);
        }
        try { rig.glow(0); } catch (e) { /* */ }
        X.line(''); { const c3 = CAM.end[2]; X.shot(c3[0], farT(c3[0], c3[1]), 0.01); }   // (round 3: the cards come over the bench's picture, not over another camera)
        await card(X, `<b style="font:900 20px Heebo,system-ui">בית המוקד</b>${cite(LINES.middot19)}`, 10000);
        const done = PLAN.filter((m2) => !(st.res[m2.id] && st.res[m2.id].skip)), stars = done.reduce((a, m2) => a + ((st.res[m2.id] && st.res[m2.id].stars) | 0), 0);
        const LBL = { 'gazit.crack': 'אבן ספסל סדוקה', 'gazit.ink': 'כתם דיו על רצפת הגזית', 'golah.bucket': 'דלי סדוק', 'golah.rim': 'אבן שבורה בפי הבור', 'golah.flood': 'כתם מים בעזרה', 'vault.crack': 'סדק בתקרה', 'vault.stone': 'אבן קשת שנפלה', 'night.slab': 'פינה סדוקה בטבלת השיש' };
        const dmg = [...new Set((st.marks || []).map((q) => LBL[q.f]).filter(Boolean))];
        await card(X, `<b style="font:900 20px Heebo,system-ui">הלשכות</b><p style="margin:8px 0">${done.length} עבודות · ${'★'.repeat(Math.min(3, Math.round(stars / Math.max(1, done.length))))} (${stars} כוכבים)</p><small>${dmg.length ? 'נשאר בעולם: ' + esc(dmg.join(' · ')) : 'בלי נזק אחד'}</small><p style="margin:10px 0 0;font-weight:700">${esc(LINES.night)}</p>`, 8000);
      } catch (e) { console.warn('[h129] finale', e && e.message); }
      try { if (fov0) lens(fov0); } catch (e) { /* */ }
      figsBack(); nightRelease(X); try { if (X.kohen) X.kohen(true); } catch (e) { /* */ }
      try { rig.off(); } catch (e) { /* */ } SH7.rig = null;
      // (round 3: the walk's hint back once the stage's summary that follows is closed: the next tap after it, or a minute)
      { let tt = 0; const back = () => { clearTimeout(tt); window.removeEventListener('pointerup', up, true); walkHide(false); }, up = () => setTimeout(back, 400); setTimeout(() => window.addEventListener('pointerup', up, true), 1500); tt = setTimeout(back, 60000); }
      roofsOpen(X, false); finalWorld(X); X.line(''); near(X, false);
      st.film = 1; X.save();
    },
    /** after a reload, the stage done: the chambers as he built them, their roofs on */
    rest(X) { initWorld(X); finalWorld(X); },
    dispose() {},
  };
  return P;
}
