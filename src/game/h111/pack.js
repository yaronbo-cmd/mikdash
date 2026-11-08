/* ── build 111 ── h111/pack.js — stage 02 "חומת העזרה" as a pack for the stage director (h109/director.js `pack`): its plan, its save,
 * its acts; how the world shows the wall's progress (the crews' courses round the whole ring, up to under the kohen's course); what
 * closes a unit (a stretch: its course and its plumb line); the night between two levels (rain at night, the sun in the morning —
 * Taanit 23a); the end: the camera round the closed ring, then the next stage opens in the world.
 *
 *   makePack02(env) — env: { setTime(k), rain(on), restoreTime() } from the game (the world's clock is the game's)
 */
import { PLAN, createH111 } from './model.js';
import { ACTS } from './acts.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// the films' beats in the world's time when the director gives one (X.wait), else the wall clock's
const beat = (X, ms) => (X && X.wait ? X.wait(ms / 1000) : sleep(ms));
const FOUND = 0.15;   // stages.js: the progress under which a site is in its foundation

export function makePack02(env = {}) {
  const call = (k, ...a) => { try { if (env[k]) env[k](...a); } catch (e) { /* the world's */ } };
  const P = {
    id: 'wall', key: 'h111', PLAN, create: createH111, ACTS, icon: '🧱',
    crews: ['wall', 3, [0, 1, 2]],
    endTitle: 'חומת העזרה נבנתה!',
    endSub: 'העזרה מאה ושמונים ושבע אמה על מאה שלושים וחמש (מדות ה, א)',
    // the film (צילום ביצוע): the ring from high, the north with its three openings, the west, the south, the court from above
    film: [[[-95, 230, 210], [-95, 10, 0], 3.0], [[-95, 60, -150], [-95, 14, -70], 2.6], [[-260, 70, 0], [-190, 20, 0], 2.4], [[-60, 60, 160], [-95, 14, 70], 2.4], [[60, 300, 260], [-60, 0, 0], 1.6]],
    /** the wall as the crews have built it while mission m is open */
    sync(M, S0, instant) {
      const m = M.mission(), cs = M.coursesShown(m);
      const info = S0.siteInfo('wall'); if (!info) return;
      let n = 0;
      if (cs === 'last') n = info.stones - 1;
      else if (cs !== 'done' && cs > 0) for (let c = 0; c < cs && c < info.perCourse.length; c++) n += info.perCourse[c];
      // (the same mission and the world already there: nothing to do — but the world is checked, not trusted: a reload, a resync, a
      // replay of the site can have set it back)
      const want = cs === 'done' ? 'done' : cs === -1 ? 'survey' : n > 0 ? 'courses' : 'foundation';
      const there = cs === 'done' ? info.status === 'done' : info.phase === want && (cs === -1 || info.set === n);
      if (there && !instant) return;
      if (cs !== 'done' && info.phase !== want) instant = true;   // (a replay or a reset of the site in the world: set it at once)
      if (cs === 'done') { S0.setWork('wall', { phase: 'done' }); return; }
      if (cs === -1) { S0.setWork('wall', { phase: 'survey', stones: 0, ghost: 0, instant: !!instant }); return; }
      // (the closing: the crews' crane rests — the last stone is the kohen's)
      S0.setWork('wall', { phase: want, stones: n, ghost: 0, stock: cs === 'last' ? 0 : 12, instant: !!instant });
      if (instant) { try { S0.setStage('wall', 'building', FOUND + (1 - FOUND) * (info.stones ? n / info.stones : 0), { instant: true }); } catch (e) { /* */ } }
    },
    unitEnd: (m, M) => M.unitEnd(m),
    /** the night between two levels: rain on the wall, then the wind, the clouds part, the sun; the crews go out to work (6–8 s) */
    before(m, X, M) {
      const st = M.st;
      // the stage's opening (rule 3: where am I): the whole Mount from high, then down to the courts and the first corner
      if (m && m.id === 'stakes' && !st.intro) {
        return (async () => {
          st.intro = 1; X.save();
          X.shot([-60, 520, 520], [-40, 0, 0], 0.01); await beat(X, 300);
          X.line('שלב 02: חומת העזרה · מאה שמונים ושבע על מאה שלושים וחמש אמה (מדות ה, א)');
          X.shot([-95, 260, 230], [-95, 0, 0], 2.6); await beat(X, 3000);
          X.shot([-30, 60, -20], [-4, 0, -64], 2.0); await beat(X, 2200);
          X.line('');
        })();
      }
      if (!m || !m.night || (st.nights || []).includes(m.night)) return null;
      return (async () => {
        st.nights = [...(st.nights || []), m.night]; X.save();
        X.shot([-95, 120, 150], [-95, 14, 0], 1.6);
        await beat(X, 600);
        call('setTime', 'night'); call('rain', true); X.play('rain');
        X.line('בלילה יורד גשם על החומה…');
        await beat(X, 3200);
        call('rain', false); call('setTime', 'dawn');
        X.line('בבוקר נושבת רוח, העננים מתפזרים והשמש זורחת (תענית כג, א)');
        await beat(X, 3000);
        call('restoreTime');
        X.line(m.night === 1 ? 'רמה 2: אבן ראש בכל קטע, ונסיגה של שתי אצבעות' : 'רמה 3: משאירים את פתחי השערים ריקים');
        await beat(X, 1400);
      })();
    },
    /** the ring closed: the crews cheer, the camera goes round the whole wall */
    async finale(X) {
      try { X.stages.setWork('wall', { phase: 'done' }); } catch (e) { /* */ }
      try { if (X.stages.crewsCheer) X.stages.crewsCheer('wall'); } catch (e) { /* */ }
      const c = { x: -95, z: 0 }, R = 210, y = 120;
      for (let k = 0; k <= 8; k++) { const a = Math.PI * 0.5 + (k / 8) * Math.PI * 2; X.shot([c.x + Math.cos(a) * R, y, c.z + Math.sin(a) * R * 0.8], [c.x, 14, c.z], 0.9); await beat(X, 650); }
    },
  };
  return P;
}
