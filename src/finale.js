/* ─────────────────────────────────────────────────────────────────────────────
 * finale.js (WORLD12, wave 12): the build-up to Chanukat HaBayit and its night of light.
 *
 * The owner, 29.9 20:37: "שלקראת טקס חנוכת הבית יהיה עניין והפנינג כלשהוא ושבחנוכת הבית תהיה מסיבה וחגיגה ויהיו זיקוקים והרבה
 * אור, אולי אפילו להזמין למסיבה מכל קצוות תבל." Fireworks came a thousand years after the destruction: ⚑ for the owner; until
 * he answers the light is the Temple's own — lamps, torches, the lit courts, in the manner of Simchat Beit HaShoeva
 * (Sukkah 5:2–4). All of it is an illustration (המחשה); its sources are on the moment's card.
 *
 *   const F = createFinale({ game, life, crowd, music, setTime, time, fly, lamps, root });
 *   F.event(type, d, phase)   // every game event (main.js chains it before the score's)
 *   await F.celebrate()       // the night of light: the world, the music and the moment 'chanukat' (moments.js) → resolves
 *                             // when the player continues (index.js finale(), after the story card; main.js hooks.celebrate)
 *   F.state → { buildup, lands, lamps, celebrating }   ·   F.poll() (tests)
 *
 * The build-up: when the House's chapter begins (the Ulam started) pilgrims from named lands (crowd.js LANDS) come up to the
 * Mount with gifts, one group more as the Ulam, the Heichal and the Kodesh HaKodashim rise (their mean progress), each
 * announced once by a small toast with its source; lamps are hung along the courts (life.js setFest), lit at night.
 * ──────────────────────────────────────────────────────────────────────────── */
import { progressOf, allDone } from './game/state.js';
import { playMoment } from './game/moments.js';
import { LANDS } from './crowd.js';
import { T as TXT } from './game/content.js';
import { srcHTML } from './game/ui.js';

const HOUSE = ['ulam', 'heichal', 'kodesh'];
/** the celebration's frame: from the south-east over the plaza — the Ezrat Nashim's dancers and menorot, the altar, the lit House
 *  high in the frame (on a phone the moment's card covers the lower half) */
export const VIEW = { p: [200, 110, 110], t: [-60, 10, 0] };
/** the build-up level of a save: 0 before the House's chapter; then 0.1 … 1 with the House's three stages; 1 when all is built */
export function buildupOf(G) {
  if (!G || !G.st) return 0;
  if (allDone(G)) return 1;
  if (!HOUSE.some((id) => G.st[id])) return 0;
  const p = HOUSE.reduce((a, id) => a + progressOf(G, id), 0) / HOUSE.length;
  return Math.min(1, 0.1 + 0.9 * p);
}
export const landsOf = (b) => (b <= 0 ? 0 : Math.max(1, Math.min(LANDS.length, Math.round(b * LANDS.length))));

export const CHANUKAT = {
  n: 'חנוכת הבית',
  hint: 'הקישו על כל מנורה: הכהן הצעיר עולה בסולם, ממלא ספל שמן ומדליק. ארבעה ספלים בכל מנורה',
  done: 'לא הייתה חצר בירושלים שלא האירה',
  src: {
    q: 'לֹא הָיְתָה חָצֵר בִּירוּשָׁלַיִם שֶׁאֵינָהּ מְאִירָה מֵאוֹר בֵּית הַשּׁוֹאֵבָה',
    d: 'המחשה. כך אולי נראה הלילה: כשהבית השני נחנך לראשונה, בימי דריוש, חגגו הכהנים, הלויים וכל בני הגולה בשמחה (עזרא ו, טז–יח). כשהורדוס השלים את בניינו הקריב שלוש מאות שוורים, וכל העם הקריבו כל אחד כפי יכולתו; והיום חל ביום עלייתו של המלך למלוכה, ושני החגים נעשו לחג אחד (יוספוס). את האור ציירנו כמו בשמחת בית השואבה: מנורות של זהב, ובראשן ספלים שפרחי כהונה ממלאים בשמן. ועולי הרגל באו מכל הארצות — "כִּי בֵיתִי בֵּית תְּפִלָּה יִקָּרֵא לְכָל הָעַמִּים".',
    ref: 'עזרא ו, טז–יח · יוספוס, קדמוניות היהודים 15.11.6 (15.421–423) · משנה סוכה ה, ב–ד · ישעיהו נו, ז · המחשה, טיוטה',
  },
};

export function createFinale(o = {}) {
  const get = (k) => { try { return typeof o[k] === 'function' ? o[k]() : o[k]; } catch (e) { return null; } };
  let b = 0, lands = -1, celebrating = false, lampsN = 0, timer = 0;
  const LAMPS = () => { const l = get('life'); return l && l.fest ? l.fest.of : 0; };
  function poll() {
    const g = get('game'), G = g && g.state;
    if (!G || celebrating) return;
    b = buildupOf(G);
    const n = landsOf(b), crowd = get('crowd'), life = get('life');
    if (crowd && crowd.setBuildup) crowd.setBuildup(allDone(G) ? 0 : n);
    // the lamps: hung with the build-up (four fifths of them by the last stone; all of them on the night itself)
    const want = b > 0 ? Math.round(LAMPS() * Math.min(0.8, b * 0.8)) : 0;
    if (life && life.setFest && want !== lampsN && !(life.fest && life.fest.on)) lampsN = life.setFest(want, false);
    // a new land's group arrives: one small toast (never on load, never over a sheet, a moment or a card)
    if (lands >= 0 && n > lands && g.ui && typeof g.ui.toast === 'function' && !g.busy && !allDone(G)) {
      const L = LANDS[n - 1];
      try { g.ui.toast({ icon: 'crew', title: `עולי רגל מ${L.he} בדרך לירושלים`, body: `מביאים ${L.gift} לחנוכת הבית · ${L.src} · טיוטה`, kind: 'mini', ms: 4200 }); } catch (e) { /* the game's */ }
      const mu = get('music'); if (mu && mu.flourish) mu.flourish();   // (a small happening: the lyre greets them)
    }
    if (lands < 0 || n !== lands) lands = n;
  }
  function start() { if (!timer) timer = setInterval(poll, 2000); }
  /* the world at the celebration: night, every lamp, the crowd of every land, the dancers and the Levites, the music */
  function worldOn(on) {
    const crowd = get('crowd'), life = get('life'), music = get('music'), lamps = get('lamps');
    if (on) {
      if (life && life.setFest) lampsN = life.setFest(true, true);
      if (crowd && crowd.setScene) crowd.setScene('chag');
      if (music && music.event) music.event('celebrate', { on: true }, 'A');
      if (lamps && lamps.material) { lamps.visible = true; lamps.material.size = 5.6; }
    } else {
      if (life && life.setFest) lampsN = life.setFest(0, false);   // (the festival is over: the courts' ordinary night again)
      if (crowd && crowd.setScene) crowd.setScene('auto');
      if (music && music.event) music.event('celebrate', { on: false }, 'A');
      if (lamps && lamps.material) lamps.material.size = 4.6;
    }
  }
  /** the night of light, then the moment; resolves when the player goes on */
  async function celebrate() {
    if (celebrating) return;
    celebrating = true;
    const prev = get('time');
    try {
      const setTime = o.setTime;
      if (typeof setTime === 'function' && prev !== 'night') setTime('night');
      worldOn(true);
      const fly = (ms) => { if (typeof o.fly === 'function') o.fly(VIEW.p, VIEW.t, ms); };
      fly(2600);
      const g = get('game'), G = g && g.state;
      if (G && G.demo) { await new Promise((r) => setTimeout(r, 6500)); return; }   // the investor demo: the night of light, no taps
      await new Promise((r) => setTimeout(r, 1400));
      fly(1400);   // (again: a stage's orbit or a site's pending re-frame may have taken the camera meanwhile)
      const life = get('life'), fest = life && life.setFest ? life : null;
      const T = TXT || {};
      await playMoment('chanukat', {
        root: (g && g.ui && g.ui.root) || document.body, text: CHANUKAT, sfx: g && g.sfx, haptic: (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* no haptics */ } },
        reduced: !!(typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches),
        T: { draft: T.draft || 'טיוטה', next: T.next || 'המשך', skip: T.skip || 'דלג', momentKicker: 'רגע מיוחד · המחשה' },
        fmtSrc: srcHTML,
        world: {
          fest: (k) => { if (fest) fest.setFest(Math.round(fest.fest.of * (0.5 + 0.5 * k)), true); },
          festDone: () => { if (fest) fest.setFest(true, true); },
          invite: typeof globalThis.__BH_NET === 'object' && globalThis.__BH_NET && typeof globalThis.__BH_NET.open === 'function' ? () => globalThis.__BH_NET.open() : undefined,
        },
      });
    } catch (e) { console.warn('[finale] celebrate', e); } finally {
      worldOn(false);
      if (typeof o.setTime === 'function' && prev && prev !== 'night') o.setTime(prev);
      celebrating = false;
    }
  }
  // without index.js calling hooks.celebrate (a request on the bus), the world still celebrates behind the invitation card:
  // the night, every lamp, the crowd of every land, the music — for a while, then back
  let solo = 0;
  function soloNight() {
    if (celebrating || solo) return;
    const prev = get('time');
    if (typeof o.setTime === 'function' && prev !== 'night') o.setTime('night');
    worldOn(true);
    solo = setTimeout(() => { solo = 0; if (celebrating) return; worldOn(false); if (typeof o.setTime === 'function' && prev && prev !== 'night' && get('time') === 'night') o.setTime(prev); }, 45000);
  }
  return {
    event(type, d, phase) {
      if (phase === 'B') return;
      if (type === 'start' || type === 'stageDone' || type === 'step' || type === 'course') setTimeout(poll, 600);
      if (type === 'start') start();
      if (type === 'finale') setTimeout(soloNight, 400);   // (hooks.celebrate, when index.js calls it, starts first and wins)
    },
    celebrate, poll,
    get state() { return { buildup: b, lands: Math.max(0, lands), lamps: lampsN, celebrating }; },
  };
}
