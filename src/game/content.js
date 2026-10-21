/* ─────────────────────────────────────────────────────────────────────────────
 * content.js: game content v2 for Phase A (GDD §4–§7).
 *
 * EVERYTHING HERE IS A DRAFT (status 'draft'). Only Yaron approves content (PROJECT.md §2.2); until then
 * every card shows the "טיוטה" tag. Quotes are verbatim from the stated edition, checked on 2026-09-23:
 * Mishnah = Sefaria, Torat Emet 357; Bavli = William Davidson; Josephus = Whiston (quoted here in a free
 * Hebrew translation, marked as such). No Divine Name is written in full (PROJECT.md §2.3).
 * Numbers are first-pass values from GDD §4.6, tuned with test/game-sim.mjs.
 * ──────────────────────────────────────────────────────────────────────────── */

export const STATUS = 'draft';
// (moments) the verified Phase A moment cards (content agent, content/moments.json) and Ben Katin's card (kiyor.json)
import MOMENT_CARDS from '../../content/moments.json' with { type: 'json' };
import KIYOR_CARDS from '../../content/kiyor.json' with { type: 'json' };

/* ───────── resources (GDD §4.1: seven 2D resources became five, plus the altar's whole stones) ───────── */
export const RES = {
  stone: { n: 'אבן', icon: 'stone' },
  cedar: { n: 'ארז', icon: 'cedar' },
  bronze: { n: 'נחושת', icon: 'bronze' },
  gold: { n: 'זהב', icon: 'gold' },
  silver: { n: 'כסף', icon: 'silver' },
  wstone: { n: 'אבנים שלמות', icon: 'wstone' },
};
export const RES_KEYS = Object.keys(RES);
// cedar 60 (was 40): the wall's three phases need 60, so the first session can finish the wall and reach the fork in
// the road (gates · Ezrat Nashim · the altar's base) instead of stopping at 70% for two hours (HOOKS.md, finding 1)
// v6: the mentor's stones pay the Mount's first segments (the first stone is set by the player's hands < 60 s); the next
// segment is the first level in the quarry. Silver pays the next surveys and digs.
export const START_RES = { stone: 40, cedar: 0, bronze: 0, gold: 0, silver: 60, wstone: 0 };
/** Demo mode (investor walkthrough): generous stock, every timer ×60. */
// v6: the demo starts like a player (the mentor's stones), so the investor sees the first level; its levels pay ×5 (DEMO_LEVEL)
export const DEMO_RES = { stone: 40, cedar: 2400, bronze: 1500, gold: 2700, silver: 900, wstone: 2700 };
export const DEMO_LEVEL = 5;
export const DEMO_SPEED = 60;

/* ───────── rates (GDD §4.2) ───────── */
export const RATE = {
  crew: 0.5,            // work units per game-minute per crew on a site
  quarry: 0.06,         // stone per game-minute per crew in the quarry (3.6 an hour; ≤ 2 crews there: ≈ 2 segments a night; v6: the match-3 is the main source)
  quarryMax: 2,         // the quarry's face takes two crews at most
  heroQuarry: 3,        // stone per hero strike in the quarry
  boulderStone: 0,      // (v6) the rough hill's boulders are rubble for the fill: the stone comes from the quarry and its level
  offlineCapMin: 720,   // crews and the quarry keep working for 12 h of absence, then wait
};
export const PHASE_AT = [0, 0.15, 0.7];             // the three phases start at these fractions of the work
export const PHASES = ['יסודות', 'מבנה', 'גימור'];
export const BOULDERS = 12, BOULDER_HP = 2;

/* ───────── rhythm (the forgiving "מכה מדויקת", supervisor note 2) ───────── */
export const RHYTHM = {
  cycle: 0.86,          // s: stages.js swing = 0.40 s to impact + 0.46 s follow-through
  windowTouch: 0.22,    // ± s around the beat on touch screens
  windowMouse: 0.16,    // ± s with a mouse
  idle: 1.6,            // s after the beat without a tap: the ring stops
};
/** Work of one strike: normal 1; a perfect strike 2 × the combo multiplier. */
export const comboMult = (c) => (c >= 10 ? 3 : c >= 6 ? 2 : c >= 3 ? 1.5 : 1);

/* ───────── chapters (GDD §2.3, §4.4) ───────── */
export const CHAPTERS = [
  { id: 1, n: 'ההר', stages: ['har'] },
  { id: 2, n: 'העזרות', stages: ['wall', 'gates', 'nashim', 'sorag', 'nikanor', 'lishka'] },
  { id: 3, n: 'המזבח', stages: ['yesod', 'sovev', 'guf', 'karnot', 'kiyor'] },
  { id: 4, n: 'הבית', stages: ['ulam', 'heichal', 'kodesh'] },
];

/* ───────── the 15 stages (ids are stable, PROJECT.md §6) ─────────
 * deps: stages that must be done first (the stage graph, GDD §4.4)
 * W: work units · crew: work/min per crew · cost: per phase [foundations, structure, finish], paid when the
 * phase starts · priests: trained priests required (chapter 4) · moment: key-moment id (moments.js)
 * card: the true-detail card shown on completion: an exact quote, its ref, one plain line. */
const S = (id, n, ch, deps, W, cost, extra = {}) => ({ id, n, ch, deps, W, cost, crew: RATE.crew, priests: 0, ...extra });
export const STAGES = [
  S('har', 'שיטוח ההר', 1, [], 24, [{}, {}, {}], {
    crew: 3, moment: 'greatStone',
    card: { q: 'הַר הַבַּיִת הָיָה חֲמֵשׁ מֵאוֹת אַמָּה עַל חֲמֵשׁ מֵאוֹת אַמָּה', ref: 'משנה מדות ב, א', d: 'הרחבה שבנית היא הבסיס לכל המקדש.' },
  }),
  S('wall', 'חומת העזרה', 2, ['har'], 48, [{ stone: 40 }, { stone: 60, cedar: 40 }, { stone: 40, cedar: 20 }], {
    moment: 'wall',
    card: { q: 'כָּל הָעֲזָרָה הָיְתָה אֹרֶךְ מֵאָה וּשְׁמוֹנִים וָשֶׁבַע עַל רֹחַב מֵאָה וּשְׁלֹשִׁים וְחָמֵשׁ', ref: 'משנה מדות ה, א', d: 'החומה סוגרת את העזרה, החצר הפנימית של המקדש.' },
  }),
  S('gates', 'שערי העזרה', 2, ['wall'], 40, [{ stone: 30 }, { stone: 50, cedar: 110 }, { stone: 30, cedar: 90 }], {
    moment: 'gates',
    card: { q: 'שִׁבְעָה שְׁעָרִים הָיוּ בָעֲזָרָה, שְׁלשָׁה בַצָּפוֹן וּשְׁלשָׁה בַדָּרוֹם וְאֶחָד בַּמִּזְרָח', ref: 'משנה מדות א, ד', d: 'לדעת אבא יוסי בן חנן היו שלושה עשר שערים (מדות ב, ו).' },
  }),
  S('nashim', 'עזרת הנשים', 2, ['wall'], 44, [{ stone: 40 }, { stone: 50, cedar: 100 }, { stone: 30, cedar: 80 }], {
    moment: 'nashim',
    card: { q: 'עֶזְרַת הַנָּשִׁים הָיְתָה אֹרֶךְ מֵאָה וּשְׁלשִׁים וְחָמֵשׁ עַל רֹחַב מֵאָה וּשְׁלֹשִׁים וְחָמֵשׁ', ref: 'משנה מדות ב, ה', d: 'בפינותיה היו ארבע לשכות בלי תקרה, ואחת מהן לשכת העצים.' },
  }),
  S('sorag', 'הסורג והחיל', 2, ['gates'], 36, [{ stone: 30 }, { stone: 40 }, { stone: 30 }], {
    moment: 'breaches',
    card: { q: 'וּשְׁלשׁ עֶשְׂרֵה פְרָצוֹת הָיוּ שָׁם, שֶׁפְּרָצוּם מַלְכֵי יָוָן. חָזְרוּ וּגְדָרוּם, וְגָזְרוּ כְנֶגְדָּם שְׁלשׁ עֶשְׂרֵה הִשְׁתַּחֲוָיוֹת', ref: 'משנה מדות ב, ג', d: 'הסורג היה גדר נמוכה, עשרה טפחים, סביב העזרות.' },
  }),
  S('nikanor', 'שער ניקנור וט״ו המעלות', 2, ['nashim'], 44, [{ stone: 30 }, { stone: 40, bronze: 120 }, { bronze: 120 }], {
    moment: 'nikanor',
    card: { q: 'כָּל הַשְּׁעָרִים שֶׁהָיוּ שָׁם, נִשְׁתַּנּוּ לִהְיוֹת שֶׁל זָהָב, חוּץ מִשַּׁעַר נִקָּנוֹר, מִפְּנֵי שֶׁנַּעֲשָׂה בָהֶן נֵס', ref: 'משנה מדות ב, ג', d: 'ממנו עלו חמש עשרה מעלות, כנגד חמש עשרה מעלות שבתהלים (מדות ב, ה).' },
  }),
  S('lishka', 'הלשכות', 2, ['gates'], 40, [{ stone: 30 }, { stone: 50, cedar: 100 }, { stone: 20, cedar: 80 }], {
    moment: 'lishka',
    card: { q: 'לִשְׁכַּת הַגָּזִית, שָׁם הָיְתָה סַנְהֶדְרִי גְדוֹלָה שֶׁל יִשְׂרָאֵל יוֹשֶׁבֶת וְדָנָה אֶת הַכְּהֻנָּה', ref: 'משנה מדות ה, ד', d: 'שש לשכות היו בעזרה, שלוש בצפון ושלוש בדרום (מדות ה, ג).' },
  }),
  S('yesod', 'יסוד המזבח', 3, ['wall'], 40, [{ wstone: 60 }, { wstone: 140 }, { wstone: 100 }], {
    moment: 'yesod',
    card: { q: 'וּמְבִיאִים מִשָּׁם אֲבָנִים שְׁלֵמוֹת, שֶׁלֹּא הוּנַף עֲלֵיהֶן בַּרְזֶל', ref: 'משנה מדות ג, ד', d: 'האבנים הובאו מבקעת בית כרם, ואבן פגומה נפסלה.' },
  }),
  S('sovev', 'הסובב', 3, ['yesod'], 30, [{ wstone: 60 }, { wstone: 120 }, { wstone: 80 }], {
    moment: 'redLine',
    card: { q: 'וְחוּט שֶׁל סִקְרָא חוֹגְרוֹ בָאֶמְצַע, לְהַבְדִּיל בֵּין הַדָּמִים הָעֶלְיוֹנִים לַדָּמִים הַתַּחְתּוֹנִים', ref: 'משנה מדות ג, א', d: 'המזבח עלה חמש אמות ונכנס אמה: זה הסובב.' },
  }),
  S('guf', 'גוף המזבח והכבש', 3, ['sovev'], 60, [{ wstone: 120 }, { wstone: 240 }, { wstone: 160 }], {
    moment: 'guf',
    card: { q: 'וְכֶבֶשׁ הָיָה לִדְרוֹמוֹ שֶׁל מִזְבֵּחַ, שְׁלֹשִׁים וּשְׁתַּיִם עַל רֹחַב שֵׁשׁ עֶשְׂרֵה', ref: 'משנה מדות ג, ג', d: 'את אבני המזבח ליבנו פעמיים בשנה, בפסח ובחג (מדות ג, ד).' },
  }),
  S('karnot', 'הקרנות', 3, ['guf'], 16, [{ wstone: 40 }, { wstone: 60 }, { wstone: 40 }], {
    moment: 'karnot',
    card: { q: 'מְקוֹם הַקְּרָנוֹת אַמָּה מִזֶּה וְאַמָּה מִזֶּה', ref: 'משנה מדות ג, א', d: 'המזבח שלם, ועכשיו אפשר להדליק עליו אש.' },
  }),
  S('kiyor', 'הכיור', 3, ['guf'], 30, [{ stone: 30 }, { bronze: 160 }, { bronze: 140 }], {
    moment: 'kiyor',
    card: { q: 'הַכִּיּוֹר הָיָה בֵּין הָאוּלָם וְלַמִּזְבֵּחַ, וּמָשׁוּךְ כְּלַפֵּי הַדָּרוֹם', ref: 'משנה מדות ג, ו', d: 'בן קטין עשה לכיור שנים עשר דדים (משנה יומא ג, י).' },
  }),
  S('ulam', 'האולם', 4, ['sorag', 'lishka', 'nikanor', 'karnot', 'kiyor'], 80, [{ stone: 100 }, { stone: 120, cedar: 180 }, { gold: 40, cedar: 120 }], {
    priests: 6, moment: 'ulam',
    card: { q: 'וְחָמֵשׁ מַלְתְּרָאוֹת שֶׁל מִילָת הָיוּ עַל גַּבָּיו', ref: 'משנה מדות ג, ז', d: 'על פתח ההיכל עמדה גפן של זהב, ומי שהתנדב הביא עלה, גרגיר או אשכול (מדות ג, ח).' },
  }),
  S('heichal', 'ההיכל', 4, ['ulam'], 120, [{ stone: 120 }, { stone: 180, cedar: 280 }, { gold: 160, cedar: 200 }], {
    priests: 10, moment: 'heichal',
    card: { q: 'שֶׁכָּל הַבַּיִת טוּחַ בְּזָהָב, חוּץ מֵאַחַר הַדְּלָתוֹת', ref: 'משנה מדות ד, א', d: 'ההיכל: מאה על מאה, ברום מאה אמה (מדות ד, ו).' },
  }),
  S('kodesh', 'קודש הקדשים', 4, ['heichal'], 80, [{ stone: 80 }, { stone: 100, cedar: 140 }, { gold: 90, cedar: 100 }], {
    priests: 6, moment: 'boxes', quiet: true,
    card: { q: 'מִשֶּׁנִּטַּל הָאָרוֹן, אֶבֶן הָיְתָה שָׁם מִימוֹת נְבִיאִים רִאשׁוֹנִים, וּשְׁתִיָּה הָיְתָה נִקְרֵאת', ref: 'משנה יומא ה, ב', d: 'רק הכהן הגדול נכנס לשם, ביום הכיפורים (משנה כלים א, ט).' },
  }),
];
export const SIDX = Object.fromEntries(STAGES.map((s, i) => [s.id, i]));
export const stageById = (id) => STAGES[SIDX[id]];

/* ───────── v6: every stage is a real project (docs/BUILD.md §2) ─────────
 * survey → dig → courses (stone by stone, course by course) → finish → inspect → the stage's key moment.
 * C courses × P logical stones (SITE maps them onto its real counts), bought in segments of SEG stones: `seg` is one
 * segment's materials (≈ one match-3 level's yield, so the pre-step level pays for the step it comes before);
 * sv / dg: the survey's and the dig's silver; fin: the finish steps (each paid, then worked);
 * key: which of FUN's precision games sets the key stones ('ashlar' crane/dress · 'altar' whole · 'cast' crane once);
 * lintel: the top course starts with a lintel; great: har's master course (the great stones). W and cost above stay for
 * the old readers (hooks/next.js); the v6 rules read only this table. Numbers tuned by test/game-sim.mjs. */
export const SEG = 8;                        // stones per segment: ≈ half a board's yield (MATCH3's level: 52–136 of its material)
export const STOCK_MAX = 3;                  // segments that may wait in a site's stock (bought ahead)
export const WORK = { stone: 3, survey: 3, dig: 4, finish: 4, reset: 3, event: 2 };   // strokes per job (a perfect stroke = 2)
export const CREW_RATE = 1;                  // strokes per game-minute per crew: a stone every 3 game-minutes
export const EVENT_CREW = 0.25;              // crews clear an event 4× slower than a stone (the hero: 2 strokes)
export const QUALITY_BAD = 0.45;             // a key stone set below this is found at the inspection and reset
const J = (C, P, seg, sv, dg, fin, extra = {}) => ({ C, P, seg, sv, dg, fin, key: 'ashlar', ...extra });
const F = (n, cost, src) => ({ n, cost, ...(src ? { src } : {}) });
export const PROJ = {
  har: J(6, 32, { stone: 12 }, 0, 0, [F('ריצוף הרחבה', { stone: 60 })], { great: true }),   // 12: the tutorial stage (FUN 20:48 · MATCH3 20:50): a tutorial board then buys the rest of the first course
  wall: J(8, 32, { stone: 45 }, 10, 10, [F('כרכוב החומה', { stone: 60 }), F('קורות הלשכות', { cedar: 60 })]),
  gates: J(6, 24, { stone: 45 }, 10, 10, [F('דלתות ארז', { cedar: 70 }), F('ציפוי זהב לשערים', { gold: 60 }, 'מדות ב, ג')], { lintel: true }),
  nashim: J(6, 24, { stone: 45 }, 10, 10, [F('הגזוזטרא', { cedar: 70 }, 'מדות ב, ה'), F('לשכות הפינות', { cedar: 60 }, 'מדות ב, ה')]),
  sorag: J(3, 32, { stone: 45 }, 10, 10, [F('הסורג', { stone: 60 }, 'מדות ב, ג')]),
  nikanor: J(6, 24, { stone: 45 }, 15, 10, [F('דלתות הנחושת', { bronze: 80 }, 'יומא לח, א'), F('דלתות הנחושת', { bronze: 80 }), F('ט״ו המעלות', { stone: 60 })], { lintel: true }),
  lishka: J(6, 24, { stone: 45 }, 10, 10, [F('תקרות ארז', { cedar: 70 }), F('תקרות ארז', { cedar: 70 })]),
  yesod: J(2, 32, { wstone: 40 }, 15, 15, [], { key: 'altar' }),
  sovev: J(2, 32, { wstone: 40 }, 15, 0, [F('חוט הסקרא', { stone: 12 }, 'מדות ג, א')], { key: 'altar' }),
  guf: J(4, 32, { wstone: 40 }, 15, 0, [F('הכבש', { wstone: 60 }, 'מדות ג, ג')], { key: 'altar' }),
  karnot: J(1, 16, { wstone: 40 }, 15, 0, [F('סיד לבן', { stone: 20 }, 'מדות ג, ד')], { key: 'altar' }),
  kiyor: J(1, 12, { bronze: 80 }, 15, 15, [F('שנים עשר דדים', { bronze: 70 }, 'יומא ג, י')], { key: 'cast', S: 4 }),
  ulam: J(10, 40, { stone: 60 }, 30, 30, [F('מלתראות', { cedar: 90 }, 'מדות ג, ז'), F('כלונסות הארז', { cedar: 90 }, 'מדות ג, ח'), F('גפן הזהב', { gold: 90 }, 'מדות ג, ח'), F('ציפוי זהב', { gold: 90 })], { lintel: true }),
  heichal: J(14, 40, { stone: 60 }, 30, 30, [F('תקרת ארז', { cedar: 90 }), F('תקרת ארז', { cedar: 90 }), F('דלתות ההיכל', { cedar: 90 }, 'מדות ד, א'), F('ציפוי זהב', { gold: 90 }, 'מדות ד, א'), F('ציפוי זהב', { gold: 90 }), F('כלוב עורב', { gold: 60 }, 'מדות ד, ו')], { lintel: true }),
  kodesh: J(10, 32, { stone: 60 }, 30, 30, [F('תקרת ארז', { cedar: 90 }), F('ציפוי זהב', { gold: 90 }, 'מדות ד, א'), F('ציפוי זהב', { gold: 90 })]),
};
/** a course check (the plumb) after every CHECK_EVERY courses: the engineer finds a badly set key stone early */
export const CHECK_EVERY = 2;
// ── games13 ── (wave 13, the owner 30.9 11:12: the level "לשלבי הפילוס") the Mount's work IS leveling: its check comes at every
// course end, and opens with the level (minigames/index.js LEVEL_AT); elsewhere every CHECK_EVERY courses, as before
export const CHECK_AT = { har: 1 };
/** courses between two course checks at stage id */
export const checkEvery = (id) => CHECK_AT[id] || CHECK_EVERY;
// ── /games13 ──
/** the key stone at logical stone i of a stage: null | {game, what} (the course waits for the player's hands) */
export function keyOf(id, i) {
  const P = PROJ[id]; if (!P) return null;
  const c = Math.floor(i / P.P), j = i % P.P;
  if (P.key === 'cast') return i === 0 ? { game: 'crane', what: 'first' } : null;
  if (P.key === 'altar') return j === 0 ? { game: 'whole', what: i === 0 ? 'first' : 'course' } : null;
  if (i === 0) return { game: 'crane', what: P.great ? 'great' : 'first' };
  if (P.lintel && c === P.C - 1 && j === 0) return { game: 'crane', what: 'lintel' };
  if (j === P.P / 2) return { game: id === 'har' ? 'quarry' : c % 2 ? 'crane' : 'dress', what: 'corner' };                      // …and turns its far corner
  if (j !== 0) return null;
  return { game: c % 2 ? 'dress' : 'crane', what: P.great && c % 2 === 0 ? 'great' : 'corner' };   // every course starts at its cornerstone
}
/** ── flow9 ── (DESIGN8B 11:03 · STAGING M8/M11: "words and game titles must match") a key stone's words, one verb per game:
    the crane SETS it ("הנח … במנוף"), the quarry HEWS it ("חצוב"), the dressing DRESSES it ("סתת"), the altar's game
    SORTS the whole stones ("בחר אבנים שלמות"). Never "הנח" for a stone the player hews. key: keyOf()'s {game, what} (or a
    job {game, what}); first: the stage's first stone (i === 0).
    → { def, act, sub, tell, line, kicker } — def "האבן הגדולה"; act the button "חצוב את אבן הפינה"; sub the pill's note;
      tell the one-time coach line; line the segment panel's clause; kicker the precision game's kicker (or null) */
export function keyWords(key, first = false) {
  const what = key && key.what, game = (key && key.game) || 'crane';
  const def = { first: 'האבן הראשונה', great: 'האבן הגדולה', corner: 'אבן הפינה', lintel: 'המשקוף', course: 'האבן השלמה' }[what] || 'האבן המיוחדת';
  const m = what === 'lintel', it = m ? 'אותו' : 'אותה';   // (המשקוף is masculine; every stone is feminine)
  const who = first && what === 'great' ? 'את האבן הראשונה, האבן הגדולה,' : `את ${def}`;
  if (game === 'quarry') return { def, act: `חצוב את ${def}`, sub: `${def}: חצוב ${it}`, tell: `${def}: אתה חוצב ${it}`, line: `${who} תחצוב אתה, והמנוף יניח ${it}`, kicker: `חציבת ${def}` };
  if (game === 'dress') return { def, act: `סתת את ${def}`, sub: `${def}: סתת ${it} בעצמך`, tell: `${def}: אתה מסתת ${it}`, line: `${who} תסתת אתה, והמנוף יניח ${it}`, kicker: `סיתות ${def}` };
  // (DESIGN9 15:44) the altar's game SORTS the field stones — whole ones to the altar, a nicked one or one iron touched aside
  // (whole.js, Middot 3:4); the carry, the fit and the wooden mallet are the stones' strokes after it
  if (game === 'whole') return { def, act: 'בחר אבנים שלמות', sub: 'אבני המזבח: רק שלמות', tell: 'אתה בוחר: שלמה — למזבח', line: 'את האבנים לנדבך תבחר אתה: רק שלמות', kicker: null };
  return { def, act: `הנח את ${def} במנוף`, sub: `${def}: הנח ${it} במנוף`, tell: `${def}: אתה מניח ${it} במנוף`, line: `${who} תניח אתה במנוף`, kicker: null };
}
/** a site event at logical stone i: 'rope' | 'crack' | null (deterministic; never a loss: time only) */
export function eventAt(id, i) {
  const P = PROJ[id]; if (!P || P.key !== 'ashlar') return null;
  const n = P.C * P.P; if (n < 32) return null;
  const at = (f) => { let k = Math.floor(n * f); while (keyOf(id, k)) k++; return k; };
  return i === at(0.4) ? 'rope' : i === at(0.75) ? 'crack' : null;
}
export const EVENTS = {
  rope: { n: 'חבל נתקע במנוף', act: 'pull', d: 'משוך בחבל כדי לשחרר אותו. הצוות לבדו ישחרר אותו לאט.' },
  crack: { n: 'גוש סדוק', act: 'split', d: 'באבן נמצא סדק. בקע אותה, ואבן שלמה נכנסת במקומה. זה עולה זמן, לא חומר.' },
};
/** the phases of every project, in order (names for the site panel) */
export const PH = ['survey', 'dig', 'courses', 'finish', 'inspect', 'moment'];
export const PH_N = { survey: 'מדידה', dig: 'חפירה ויסוד', courses: 'נדבכים', finish: 'גימור', inspect: 'בדיקה', moment: 'חנוכה' };
/** the match-3 field for a missing material (MATCH3: quarry · forest · gold) */
export const FIELD_OF = { stone: 'quarry', wstone: 'quarry', cedar: 'forest', gold: 'gold', bronze: 'gold', silver: 'quarry' };
export const FIELD_N = { quarry: 'המחצבה', forest: 'יער הלבנון', gold: 'מכרות הזהב', beitkerem: 'בקעת בית כרם' };
/* ── build7 ── what a board pays (PLAYTEST-S6 #3: frame the board by its pay, "▶ המחצבה · כ־40 אבנים"): the midpoint of MATCH3's
   levelInfo(field, level).yields (p10–p90 of the main material, before the stars' bonus) for levels 1–30, taken from src/match3 on
   b32cc0f (its calibration is too slow to run for a pill: 0.2–1.3 s a level). test/game-state.test.mjs checks a few against the
   live levelInfo. 'wstone': the quarry's level played in Beit Kerem for whole stones. Past level 30: the mean of 21–30. */
export const M3_PAY = {
  quarry: [43, 46, 50, 45, 50, 53, 56, 60, 54, 55, 37, 53, 51, 61, 36, 48, 46, 52, 50, 52, 60, 54, 41, 55, 40, 42, 46, 59, 53, 57],
  forest: [34, 32, 35, 33, 30, 40, 30, 38, 36, 39, 31, 40, 40, 38, 20, 37, 28, 28, 38, 29, 36, 35, 25, 47, 11, 32, 27, 25, 34, 48],
  gold: [48, 47, 58, 52, 48, 57, 50, 49, 45, 54, 38, 42, 54, 58, 31, 46, 45, 61, 48, 56, 60, 55, 37, 59, 28, 39, 48, 37, 57, 59],
  wstone: [33, 34, 37, 34, 37, 30, 35, 27, 30, 34, 25, 21, 34, 23, 19, 27, 28, 33, 25, 28, 35, 38, 19, 31, 17, 17, 26, 25, 32, 31],
};
export function m3Pay(field, level, wstone = false) {
  const row = M3_PAY[wstone ? 'wstone' : field]; if (!row) return 0;
  const l = Math.max(1, level | 0);
  return l <= row.length ? row[l - 1] : row.slice(-10).reduce((a, v) => a + v, 0) / 10;
}
// ── flow16 ── the board's par in minutes for the deal's extra card ("לוח של ≈ 3 דק׳"): MATCH3's levelInfo.minutes = moves × 6.5 s
// (levels.js: 30 moves at level 1, ~37 by level 15; its calibration is too slow for a card — the moves' line is enough)
export const boardPar = (level) => Math.max(3, Math.round(((30 + Math.min(15, Math.max(1, level | 0)) * 0.5) * 6.5) / 60));
// ── /flow16 ──
/** where each material comes from (the meter's "where do I get it") */
export const SOURCES = {
  stone: [['m3', 'המחצבה', 'משחק האוצר במחצבה: כל גוש שיורד מהלוח הוא אבן'], ['crew', 'צוות במחצבה', 'חוצב מעט גם כשאינך כאן, עד 12 שעות'], ['kings', 'המלכים', 'יש מלכים שמביאים גם אבן']],
  cedar: [['m3', 'יער הלבנון', 'משחק האוצר ביער: ארזים וקורות'], ['kings', 'סוחרי צור וצידון', 'רפסודות ארז אל ים יפו (עזרא ג, ז)']],
  gold: [['m3', 'מכרות הזהב', 'משחק האוצר במכרות (המחשה)'], ['kings', 'מלכים ותורמים', 'שיירות ותרומות'], ['reward', 'גמר שלבים', 'פרסים על שלבים ופרקים']],
  silver: [['daily', 'שכר היום', 'כל יום, ושבת לא שוברת את הרצף'], ['m3', 'שקלים', 'שקלי כסף בכל משחק אוצר'], ['reward', 'גמר שלבים', 'פרס על כל שלב']],
  bronze: [['m3', 'מכרות הזהב', 'עפרות נחושת על הלוח'], ['kings', 'נחושת קפריסין', 'עסקה עם רומא']],
  wstone: [['m3', 'בקעת בית כרם', 'משחק האוצר במחצבה, באבנים שלמות (מדות ג, ד)']],
};
/** upgrades, paid in silver (levels 1–3): tools = a stroke's worth, crane = crews' pace, carts = the quarry's output */
export const UPGRADES = {
  // ── econ14 ── re-skinned for אוצר המלאכה (her ❤️ "the machines and the tools", seen in 3D): the same rules and prices
  tools: { n: 'כלי הסתתים', d: 'פטיש ואזמל חדשים בידיו: כל מכה שווה יותר', cost: [60, 160, 320], by: 0.25 },
  crane: { n: 'גלגל הדריכה', d: 'עוד הולכים בגלגל: הצוותים מניחים מהר יותר', cost: [80, 200, 400], by: 0.25 },
  carts: { n: 'עגלות השוורים', d: 'עוד עגלה מהמחצבה: יותר אבן', cost: [60, 150, 300], by: 0.5 },
  // ── /econ14 ──
};

// ── econ14 ── (D2, the owner's daughter: "כל שלב שאתה מצליח אתה מקבל מספר מטבעות בהתאם לקושי של המשימה") the coins: the silver
// (key `silver`), "מטבעות" in sentences. One rule, fixed, nothing random, no timers: a job pays stars × (level + 2) (★ done ·
// ★★ q ≥ .7 · ★★★ q ≥ .9); a skip pays 3; a course end +5; the stage's moment twice a hard job's pay, on top of REWARD.
// In-between games pay at most half a job's rate a minute (gameMin). Paid at once (Ant. 20.220).
export const PAY = {
  coins: (stars, level = 1) => Math.max(0, Math.min(3, stars | 0)) * (Math.max(1, Math.min(3, level | 0 || 1)) + 2),
  starsOf: (q, skipped = false) => (skipped ? 0 : q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1),
  skip: 3, course: 5, momentX: 2, momentLevel: 3, gameMin: 7,   // (gameMin: a job ≈ 6 coins in ≈ 25 s ≈ 14 a minute; half)
  first: { q: 'וַיִּתְּנוּ־כֶסֶף לַחֹצְבִים וְלֶחָרָשִׁים', ref: 'עזרא ג, ז', d: 'כך שילמו לבונים בימי שיבת ציון: מי שעבד קיבל את שכרו.', more: 'ומי שעבד אפילו שעה אחת, קיבל את שכרו מיד (יוספוס, קדמוניות היהודים 20.220, בתרגום חופשי)' },
  treasurer: { line: 'הגזבר שילם מקופת המקדש', ref: 'משנה שקלים ה, ב (הגזברים)' },
  shop: { n: 'אוצר המלאכה', q: 'כְּכֹחָם נָתְנוּ לְאוֹצַר הַמְּלָאכָה', ref: 'עזרא ב, סט' },
};
// ── /econ14 ──
/* ───────── rewards when a stage is done (GDD §4.4 crews 1 → 2 → 3 → 4, caravan slots, the yard) ───────── */
export const REWARD = {
  har: { silver: 30, crews: 2, unlock: ['wagons', 'cedar'], find: 'trumpet' },
  wall: { silver: 30, crews: 3, unlock: ['alexandria', 'beitkerem'] },
  gates: { silver: 25 }, nashim: { silver: 25 }, lishka: { silver: 25 }, nikanor: { silver: 25 },
  sorag: { silver: 25, find: 'warning' },
  yesod: { silver: 30, training: true },
  sovev: { silver: 30 }, guf: { silver: 30 }, kiyor: { silver: 30 },
  karnot: { silver: 40, crews: 4, carSlots: 3, gold: 60, donor: 'munbaz' },
  ulam: { silver: 40, gold: 80, donor: 'helena' }, heichal: { silver: 40 }, kodesh: { silver: 50 },
};
export const CHAPTER_BONUS = { 1: { silver: 20 }, 2: { silver: 60, gold: 60 }, 3: { silver: 80, gold: 80 }, 4: {} };

/* ───────── caravans (GDD §4.6): deterministic, short or long, one per route at a time.
 * A short trip pays a little better per hour (it needs you to come back); a long one covers your absence.
 * ftue: the FIRST trip of a route is a short taste that pays off inside the session it is sent in (the wagons had
 * it; HOOKS.md finding 1 gives it to every route, so a new route is learned by a return, not by a wait of hours). */
export const ROUTES = [
  { id: 'wagons', n: 'עגלות המחצבה', res: 'stone', short: { min: 30, y: 60, cost: 5 }, long: { min: 240, y: 400, cost: 20 }, ftue: { min: 5, y: 80, cost: 0 },
    src: { d: 'הורדוס הכין אלף עגלות להבאת אבנים לבניין.', ref: 'יוספוס, קדמוניות היהודים 15.11.2 (בתרגום חופשי)' } },
  { id: 'cedar', n: 'ארזים מן הלבנון אל ים יפו', res: 'cedar', short: { min: 120, y: 70, cost: 10 }, long: { min: 480, y: 240, cost: 30 }, ftue: { min: 4, y: 120, cost: 0 },
    src: { q: 'לְהָבִיא עֲצֵי אֲרָזִים מִן־הַלְּבָנוֹן אֶל־יָם יָפוֹא', ref: 'עזרא ג, ז', d: 'כך הביאו ארזים כבר בימי שיבת ציון.' } },
  { id: 'alexandria', n: 'דלתות מאלכסנדריה', res: 'bronze', short: { min: 180, y: 70, cost: 15 }, long: { min: 720, y: 240, cost: 40 }, ftue: { min: 15, y: 120, cost: 0 },
    src: { q: 'כְּשֶׁהָלַךְ נִיקָנוֹר לְהָבִיא דְּלָתוֹת מֵאֲלֶכְּסַנְדְּרִיָּא שֶׁל מִצְרַיִם', ref: 'בבלי יומא לח, א' } },
  { id: 'beitkerem', n: 'אבנים שלמות מבקעת בית כרם', res: 'wstone', short: { min: 60, y: 40, cost: 5 }, long: { min: 360, y: 200, cost: 25 }, ftue: { min: 8, y: 60, cost: 0 },
    src: { q: 'מִבִּקְעַת בֵּית כָּרֶם. וְחוֹפְרִין לְמַטָּה מֵהַבְּתוּלָה', ref: 'משנה מדות ג, ד' } },
];
export const RIDX = Object.fromEntries(ROUTES.map((r, i) => [r.id, i]));
export const CAR_SLOTS = 2;

/* ───────── trained priests (GDD §4.1, the chapter 4 gate) ───────── */
export const TRAIN = { min: 150, cost: 20, slots: 2, quizCutMin: 20, quizPerDay: 3, quizSilver: 5 };

/* ───────── daily (GDD §9) ───────── */
export const DAILY = {
  // v6: the wage is silver (+ gold on streak days); stone comes from the quarry's level and its crew
  wage: (streak) => ({ silver: 30 + 10 * Math.min(streak, 7), ...(streak === 3 || streak === 5 || streak >= 7 ? { gold: 30 } : {}) }),
  volunteersMin: 15,     // "עזרת העם": once a day, one site gets +100% crew work for 15 game-minutes
};
/** Daily task templates: one of each kind per day (strike, caravan, learning). Each done task = a vine leaf. */
export const TASKS = {
  perfect: { n: (g) => `${g} מכות מדויקות`, goal: 5 },
  strikes: { n: (g) => `${g} מכות בפטיש`, goal: 30 },
  level: { n: () => 'לנצח במשחק אוצר', goal: 1 },
  stones: { n: (g) => `להניח ${g} אבנים`, goal: 10 },
  caravan: { n: () => 'לשלוח משלחת', goal: 1 },          // (v5 saves: a task of the day it was made)
  collect: { n: () => 'לאסוף משלחת שחזרה', goal: 1 },
  learn: { n: () => 'לקרוא משנה בספר מידות', goal: 1 },
  quiz: { n: () => 'לענות נכון על שאלה', goal: 1 },
};
export const VINE = { grapeTasks: 3, clusterDays: 7 };

/* ───────── finds (GDD §7.3, archaeology, Wikipedia-level; museum records to be cited in the content pass) ───────── */
export const FINDS = {
  trumpet: { n: 'כתובת "לבית התקיעה"', d: 'אבן עם כתובת שנמצאה ב-1968 למרגלות הפינה הדרומית־מערבית של הר הבית. חקוק בה: "לבית התקיעה". היום במוזיאון ישראל.', ref: 'ארכאולוגיה: חפירות ב. מזר, 1968 · מוזיאון ישראל' },
  warning: { n: 'כתובת האזהרה ביוונית', d: 'לוח אבן שהזהיר נכרים לא להיכנס מעבר לגדר שסביב המקדש. לוח שלם נמצא ב-1871 (היום באיסטנבול), ושבר של עותק נוסף נמצא ב-1935, מחוץ לשער האריות (היום במוזיאון ישראל).', ref: 'ארכאולוגיה: ש. קלרמון־גנו, 1871 · ג׳. ה. איליף, 1936' },
  bigstone: { n: 'האבן הגדולה בכותל', d: 'במנהרות הכותל יש אבן שחזיתה באורך כ-13.6 מטר ובגובה כ-3.3 מטר.', ref: 'ארכאולוגיה: מנהרות הכותל · הקרן למורשת הכותל המערבי' },
};

/* ───────── story beats (≤ 3 lines each, GDD §7.6) ───────── */
export const STORY = {
  priests: { t: 'אלף כהנים אומנים', d: 'הורדוס הכין אלף עגלות להבאת אבנים, בחר עשרת אלפים אומנים, וקנה בגדי כהונה לאלף כהנים. חלקם למדו סתתות וחלקם נגרות. אתה אחד מהם.', ref: 'יוספוס, קדמוניות היהודים 15.11.2 (בתרגום חופשי)' },
  ch2: { t: 'פרק ב׳ · העזרות', d: 'ההר שטוח. עכשיו בונים את החצרות שסביב הבית: חומה, שערים ולשכות.' },
  ch3: { t: 'פרק ג׳ · המזבח', q: 'מִזְרָחִית צְפוֹנִית, בָּהּ גָּנְזוּ בְנֵי חַשְׁמוֹנַאי אֶת אַבְנֵי הַמִּזְבֵּחַ שֶׁשִּׁקְּצוּם מַלְכֵי יָוָן', ref: 'משנה מדות א, ו', d: 'עכשיו בונים מזבח מאבנים שלמות, שלא נגע בהן ברזל.' },
  ch4: { t: 'פרק ד׳ · הבית', d: 'את ההיכל עצמו בנו הכהנים, בשנה ושישה חודשים.', ref: 'יוספוס, קדמוניות היהודים 15.11.6 (בתרגום חופשי)' },
  // ── world12 ── (the owner, 29.9: "לא כל לילה ירד גשם") the card of the first rainy night: not every night, but when it rained,
  // it rained at night — the Bavli and Josephus (Ant. 15.425 = 15.11.7, a free rendering). Draft.
  rain: { t: 'גשם רק בלילה', q: 'וְהָיוּ יוֹרְדִין גְּשָׁמִים בַּלַּיְלָה, לְמָחָר נָשְׁבָה הָרוּחַ וְנִתְפַּזְּרוּ הֶעָבִים וְזָרְחָה הַחַמָּה, וְיָצְאוּ הָעָם לִמְלַאכְתָּן', d: 'לא בכל לילה ירד גשם. אבל כשירד — ירד בלילה. יוספוס מספר שבכל זמן בניין ההיכל לא ירד גשם ביום, כדי שהעבודה לא תיפסק.', ref: 'בבלי תענית כג, א · יוספוס, קדמוניות היהודים 15.11.7 (בתרגום חופשי)' },
  // ── /world12 ──
  finale: { t: 'חנוכת הבית', q: 'מִי שֶׁלֹּא רָאָה בִּנְיַן הוֹרְדוֹס, לֹא רָאָה בִּנְיָן נָאֶה [מִיָּמָיו]', ref: 'בבלי בבא בתרא ד, א' },
  nikanor: [
    { t: 'סערה בים', q: 'כְּשֶׁהָלַךְ נִיקָנוֹר לְהָבִיא דְּלָתוֹת מֵאֲלֶכְּסַנְדְּרִיָּא שֶׁל מִצְרַיִם, בַּחֲזִירָתוֹ עָמַד עָלָיו נַחְשׁוֹל שֶׁבַּיָּם לְטַבְּעוֹ', ref: 'בבלי יומא לח, א' },
    { t: 'דלת אחת לים', d: 'המלחים השליכו דלת אחת לים. כשרצו להשליך גם את השנייה, חיבק ניקנור את הדלת ואמר: השליכו אותי איתה. מיד נח הים מזעפו.', ref: 'בבלי יומא לח, א (בלשון פשוטה)' },
    { t: 'בנמל עכו', d: 'כשהגיעה הספינה לנמל עכו, יצאה הדלת הראשונה מתחת לדופן הספינה. שתי הדלתות הגיעו לירושלים.', ref: 'בבלי יומא לח, א (בלשון פשוטה)' },
  ],
};

/* ───────── donors (GDD §4.1: gold comes from the treasury and from donors, not from caravans) ─────────
 * Shown when the reward that carries their gold is given. The quote is Mishnah Yoma 3:10 (S32). */
export const DONORS = {
  munbaz: { t: 'תרומת המלך מונבז', q: 'מֻנְבַּז הַמֶּלֶךְ הָיָה עוֹשֶׂה כָל יְדוֹת הַכֵּלִים שֶׁל יוֹם הַכִּפּוּרִים שֶׁל זָהָב', ref: 'משנה יומא ג, י', d: 'גם אחרים תרמו זהב למקדש. הזהב נכנס לאוצר.' },
  helena: { t: 'הנברשת של הילני המלכה', q: 'הִילְנִי אִמּוֹ עָשְׂתָה נִבְרֶשֶׁת שֶׁל זָהָב עַל פִּתְחוֹ שֶׁל הֵיכָל', ref: 'משנה יומא ג, י', d: 'האולם עומד, ופתח ההיכל מחכה לזהב.' },
};

/* ───────── key moments (moments.js) ───────── */
export const MOMENTS = {
  greatStone: { n: 'האבן הגדולה', hint: 'החזק כדי להוריד את האבן, ושחרר על הסימן', done: 'האבן במקומה!', find: 'bigstone',
    src: { d: 'יוספוס מתאר את אבני הבית שבנה הורדוס: באורך עשרים וחמש אמה, בגובה שמונה וברוחב כשתים עשרה.', ref: 'יוספוס, קדמוניות היהודים 15.11.3 (בתרגום חופשי)' } },
  breaches: { n: 'שלוש עשרה הפרצות', hint: 'הקש על כל פרצה כדי לסגור אותה', done: 'כל הפרצות נסגרו', book: '2.3',
    src: { q: 'חָזְרוּ וּגְדָרוּם, וְגָזְרוּ כְנֶגְדָּם שְׁלשׁ עֶשְׂרֵה הִשְׁתַּחֲוָיוֹת', ref: 'משנה מדות ב, ג' } },
  redLine: { n: 'חוט הסיקרא', hint: 'גרור את החוט האדום לאמצע גובה המזבח', done: 'החוט במקומו', book: '3.1',
    src: { q: 'וְחוּט שֶׁל סִקְרָא חוֹגְרוֹ בָאֶמְצַע', ref: 'משנה מדות ג, א' } },
  boxes: { n: 'האומנים בתיבות', hint: 'החזק כדי להוריד את התיבה לאט. אם היא מתנדנדת, הרפה', done: 'העבודה נעשתה בלי להביט פנימה', book: '4.5',
    src: { q: 'כְּדֵי שֶׁלֹּא יָזוּנוּ עֵינֵיהֶן מִבֵּית קָדְשֵׁי הַקֳּדָשִׁים', ref: 'משנה מדות ד, ה' } },
  /* ── wave 3: the eleven remaining moments (docs/MOMENTS.md). Each card is built from content/moments.json (verified,
     draft); a second line quotes only text already verified in middot.js / kiyor.json / STORY, or says "בתרגום חופשי". ── */
  karnot: { n: 'הקרנות והאש הראשונה', hint: 'גרור כל קרן לפינה שלה בראש המזבח', done: 'המזבח שלם, והאש בוערת עליו', book: '3.1',
    src: mcard('karnot', 'בראש המזבח נשאר ריבוע של עשרים וארבע על עשרים וארבע אמה, "מְקוֹם הַמַּעֲרָכָה": שם בערה האש (מדות ג, א).') },
  kiyor: { n: 'שנים עשר הדדים', hint: 'החזק כדי לצקת נחושת לתבנית, ושחרר על הקו', done: 'שנים עשר דדים, ומוכני לכיור', book: '3.6',
    src: { q: benKatin().quote_nikud, ref: 'משנה יומא ג, י', d: `כך יכלו שנים עשר הכהנים העסוקים בתמיד לקדש ידיהם ורגליהם בבת אחת (בבלי יומא לז, א). ועוד עשה בן קטין מוכני, גלגל ששיקע את הכיור בלילה, "${mukhni()}" (יומא ג, י), ואת קולו שמעו עד יריחו (תמיד ג, ח). ${MOMENT_CARDS.find((c) => c.id === 'kiyor').summary_he.replace(/\.$/, '')} (מדות ג, ו).` } },
  ulam: { n: 'המלתראות וגפן הזהב', hint: 'הקש "הורד" כשהמלתרא בדיוק מעל הפתח', done: 'גפן הזהב תלויה על פתח ההיכל', book: '3.8',
    src: mcard('ulam', 'מעל פתח האולם היו חמש מלתראות, קורות של מילת (אילן שגדלים בו עפצים — ברטנורא), כל אחת עודפת על שמתחתיה אמה מכל צד, והעליונה שלושים אמה (מדות ג, ז). ומי שהתנדב עלה, גרגיר או אשכול, הביא ותלה בגפן (מדות ג, ח).') },
  yesod: { n: 'בלי ברזל', hint: 'בחר כלי לבניית המזבח', done: 'רק אבנים שלמות עלו למזבח', book: '3.4',
    src: mcard('yesod', 'ברזל פוסל בנגיעה, ופגימה פוסלת בכל דבר: "נִפְגְּמָה אַחַת מֵהֶן, הִיא פְסוּלָה וְכֻלָּן כְּשֵׁרוֹת" (מדות ג, ד).') },
  heichal: { n: 'הבית בזהב', hint: 'שפשף את לוחות הזהב עד שיבריקו', done: 'ההיכל בוהק באור הבוקר', book: '4.1',
    src: mcard('heichal', 'יוספוס מתאר: חזית הבית הייתה מצופה כולה לוחות זהב כבדים, ובזריחה החזירה ברק כאש; ולבאים מרחוק נראה הבית כהר מכוסה שלג, כי מה שלא צופה זהב היה לבן מאוד (מלחמת היהודים ה, ה, ו, בתרגום חופשי).') },
  gates: { n: 'שבעת השערים', hint: 'הקש על הצד של העזרה שבו עומד השער', done: 'כל שבעת השערים במקומם', book: '1.4',
    src: mcard('gates', 'בדרום: שער הדלק, שער הבכורות ושער המים. בצפון: שער הניצוץ, שער הקרבן ובית המוקד (מדות א, ה). במזרח: שער ניקנור. (הסדר בתוך כל צד: קריאתנו — בדרום מן המערב, כמו ״שערים דרומיים סמוכים למערב״, מדות ב, ו.)') },
  nikanor: { n: 'הסערה והמעלות', hint: 'החזק את הדלת, כמו ניקנור, עד שהים ישקוט', done: 'חמש עשרה מעלות, כנגד שיר המעלות', book: '2.5',
    src: mcard('nikanor', 'הן היו "מֻקָּפוֹת כַּחֲצִי גֹרֶן עֲגֻלָּה" (מדות ב, ה). ובדרך מאלכסנדריה ניצלו דלתות השער מן הים (בבלי יומא לח, א).') },
  wall: { n: 'הנדבך הראשון', hint: 'בחר את האבן שהחיבור שלה לא ייפול מעל חיבור', done: 'חמש אבנים, אף חיבור מעל חיבור', book: '5.1',
    src: mcard('wall', 'החיבורים בין האבנים מדלגים מנדבך לנדבך, כך שכל אבן יושבת על שתיים. כך נראית הבנייה ההרודיאנית בחומות שנחשפו בחפירות סביב הר הבית (ארכאולוגיה, לא משנה).') },
  nashim: { n: 'לשכת העצים', hint: 'מצא את העצים שיש בהם תולעת, והוצא אותם', done: 'רק עצים נקיים יעלו למזבח', book: '2.5',
    src: mcard('nashim', 'שם בדקו כהנים שהיה בהם מום את העצים: "וְכָל עֵץ שֶׁנִּמְצָא בוֹ תוֹלַעַת, פָּסוּל מֵעַל גַּבֵּי הַמִּזְבֵּחַ" (מדות ב, ה).') },
  lishka: { n: 'אבן גזית', hint: 'העבר את האזמל על האבן, פס אחרי פס, עד שתהיה חלקה', done: 'אבן גזית, חלקה וישרה', book: '5.4',
    src: mcard('lishka', 'גזית: אבן מסותתת — ״לשון גזיזה, שפוסלן ומכתתן בברזל״ (רש״י שמות כ, כב). לשכת הגזית עמדה בדרום העזרה, ליד לשכת העץ ולשכת הגולה (מדות ה, ד).') },
  guf: { n: 'הכבש והסיד', hint: 'גרור כל אבן במעלה הכבש אל המזבח', done: 'המזבח לבן ונקי', book: '3.4',
    src: mcard('guf', 'את אבני המזבח והכבש ליבנו בסיד "פַּעֲמַיִם בַּשָּׁנָה, אַחַת בַּפֶּסַח וְאַחַת בֶּחָג", ולא סדו אותן בכפיס של ברזל, שמא יגע ויפסול (מדות ג, ד; הסיד — ברטנורא שם). הכבש עלה מדרום המזבח, שלושים ושתיים אמה על רוחב שש עשרה (מדות ג, ג).') },
};
/** (moments) a moment's source card from content/moments.json: its verified quote and ref, then our line */
function mcard(id, d) {
  const c = MOMENT_CARDS.find((x) => x.id === id) || {};
  return { q: c.quote_nikud || c.quote || '', ref: c.source ? `משנה ${c.source}` : '', d, status: c.status || 'draft' };
}
/** the mukhni's reason, verbatim from content/kiyor.json (Yoma 3:10) */
function mukhni() { const c = KIYOR_CARDS.find((x) => x.id === 'mukhni'); const q = c && c.quote_nikud ? c.quote_nikud.split(' ... ')[0] : ''; const i = q.indexOf('שֶׁלֹּא'); return i >= 0 ? q.slice(i) : 'שלא יהיו מימיו נפסלין בלינה'; }
function benKatin() { return KIYOR_CARDS.find((x) => x.id === 'ben_katin_spigots') || { quote_nikud: 'בֶּן קָטִין עָשָׂה שְׁנֵים עָשָׂר דַּד לַכִּיּוֹר, שֶׁלֹּא הָיוּ לוֹ אֶלָּא שְׁנַיִם' }; }

/* ───────── the Middot quiz (the training speed-up, GDD §4.7) ───────── */
export const QUIZ = [
  { id: 'q1', q: 'כמה שערים היו בעזרה, לפי התנא הראשון?', a: ['שבעה', 'חמישה', 'עשרה'], ok: 0, ref: 'משנה מדות א, ד' },
  { id: 'q2', q: 'מה היה גובה הסורג?', a: ['עשרה טפחים', 'עשר אמות', 'אמה אחת'], ok: 0, ref: 'משנה מדות ב, ג' },
  { id: 'q3', q: 'כמה פרצות פרצו מלכי יוון בסורג?', a: ['שלוש עשרה', 'שבע', 'שתים עשרה'], ok: 0, ref: 'משנה מדות ב, ג' },
  { id: 'q4', q: 'מאיפה הביאו את אבני המזבח?', a: ['מבקעת בית כרם', 'מהלבנון', 'מאלכסנדריה'], ok: 0, ref: 'משנה מדות ג, ד' },
  { id: 'q5', q: 'איזה שער לא הוחלף בשער של זהב?', a: ['שער ניקנור', 'שער המים', 'שער הדלק'], ok: 0, ref: 'משנה מדות ב, ג' },
  { id: 'q6', q: 'כמה מעלות עלו מעזרת הנשים לעזרת ישראל?', a: ['חמש עשרה', 'שתים עשרה', 'שבע'], ok: 0, ref: 'משנה מדות ב, ה' },
  { id: 'q7', q: 'היכן היה חוט הסיקרא?', a: ['באמצע גובה המזבח', 'בראש המזבח', 'ביסוד המזבח'], ok: 0, ref: 'משנה מדות ג, א' },
  { id: 'q8', q: 'כמה מלתראות היו מעל פתח האולם?', a: ['חמש', 'שלוש', 'שבע'], ok: 0, ref: 'משנה מדות ג, ז' },
  { id: 'q9', q: 'מה עמד על פתחו של ההיכל?', a: ['גפן של זהב', 'מנורה של זהב', 'שולחן של שיש'], ok: 0, ref: 'משנה מדות ג, ח' },
  { id: 'q10', q: 'היכן ישבה הסנהדרין הגדולה?', a: ['בלשכת הגזית', 'בבית המוקד', 'בלשכת הגולה'], ok: 0, ref: 'משנה מדות ה, ד' },
  { id: 'q11', q: 'מה היה גודלו של הר הבית?', a: ['חמש מאות על חמש מאות אמה', 'מאה על מאה אמה', 'אלף על אלף אמה'], ok: 0, ref: 'משנה מדות ב, א' },
  { id: 'q12', q: 'כמה פעמים בשנה ליבנו את אבני המזבח?', a: ['פעמיים', 'פעם אחת', 'בכל חודש'], ok: 0, ref: 'משנה מדות ג, ד' },
];

/* ───────── UI strings ───────── */
export const T = {
  draft: 'טיוטה',
  demoBadge: 'מצב הדגמה · זמנים ×60',
  demoSkip: 'דלג לפרק הבא',
  demoPick: 'שלבים ▾', demoPickTitle: 'בחר שלב', demoPickNext: 'לשלב הבא', demoPickTo: 'הדגמה ·',   // ── supervisor (30.9) ──
  demoPickLead: 'כל השלבים שלפני השלב שתבחר ייבנו, והשלב עצמו יתחיל מההתחלה. זו שמירת ההדגמה בלבד; המשחק הרגיל לא נפגע.',
  demoPickBody: 'השלבים שלפניו בנויים, והוא מתחיל מההתחלה',
  demoPickDone: 'ההדגמה הקודמת הגיעה עד הסוף.',
  demoExit: 'יציאה ממצב הדגמה',   // ── flow8 ── the exit chip, on screen while the demo is on
  tapBoulder: 'הקש על הסלע',
  tapRing: 'הקש כשהטבעת נוגעת בזהב',   // ── econ14 ── (D3: the teach's words) ── /econ14 ──
  perfect: 'מכה מדויקת!',
  vision: 'כאן ייבנה הבית.',
  crewIntro: 'לבד לא נגמור. הנה הצוות שלך.',
  mentor: 'רב האומנים',
  mentorNote: 'דמות בדויה',
  goal: 'המטרה',
  start: 'התחל לבנות',
  lacking: 'חסר',
  blocked: 'ממתין לחומרים',
  needPriests: (n) => `צריך ${n} כהנים אומנים`,
  momentReady: 'הרגע המיוחד מחכה לך',
  crews: 'צוותים', caravans: 'משלחות', book: 'ספר מידות', daily: 'היום', store: 'מפה', menu: 'תפריט',
  quarry: 'המחצבה', idle: 'פנוי',
  send: 'שלח', short: 'קצרה', long: 'ארוכה', collect: 'אסוף', away: 'בדרך', back: 'חזרה!',
  training: 'הכשרת כהנים', train: 'הכשר כהן', priests: 'כהנים אומנים',
  welcome: 'ברוך שובך', whileAway: 'בזמן שלא היית:',
  wage: 'שכר היום', streak: (n) => (n === 1 ? 'רצף: יום אחד' : `רצף: \u2066${n}\u2069 ימים`), shabbatGrace: 'שבת וחג לא שוברים את הרצף',
  vine: 'גפן הזהב', leaf: 'עלה', grape: 'גרגיר', cluster: 'אשכול',
  chapterDone: (n) => `פרק ${n} הושלם!`,
  stageDone: 'הבנייה הושלמה',
  source: 'מקור',
  where: 'איפה זה בעולם?',
  locked: 'נעול',
  settings: 'הגדרות', rhythm: 'טבעת הקצב', rhythmNote: 'כשהיא כבויה, כל מכה נחשבת רגילה',
  haptics: 'רטט', sound: 'צלילים', demoMode: 'מצב הדגמה', demoNote: 'שמירה נפרדת, כל הזמנים ×60 וחומרים בשפע',
  wholeView: 'תצוגת הבית השלם', backToGame: 'חזרה למשחק',
  newGame: 'משחק חדש', newGameSure: 'למחוק את ההתקדמות ולהתחיל מחדש?', yes: 'כן, מחדש', no: 'ביטול',
  close: 'סגור', next: 'המשך', skip: 'דלג', again: 'שוב',
  nameAsk: 'איך קוראים לך?', mishmarAsk: 'לאיזה משמר אתה שייך?', pickForMe: 'בחר בשבילי',
  // ── flow8 ── (the owner, 28.9: "שלום הכהן יכין") the name is seen: a greeting, a HUD chip, a plate over the hero, the coach
  kohen: (name) => `הכהן ${name}`,
  greet: (name) => (name ? `שלום, הכהן ${name}` : 'שלום, כהן'),
  greetD: (mishmar) => `${mishmar ? `ממשמר ${mishmar}, ` : ''}אחד מאלף הכהנים האומנים. מעכשיו האבנים שלך עולות לבית, והצוות בונה איתך.`,
  greetGo: 'לעבודה',
  quizTitle: 'שאלה ממסכת מידות', quizRight: 'נכון!', quizWrong: 'לא בדיוק. אפשר לנסות שאלה אחרת.',
  finale: 'חנוכת הבית',
  volunteers: 'עזרת העם', volunteersNote: 'פעם ביום: עוזרים מתנדבים לאתר אחד, לרבע שעה',
  gameNote: 'פרשנות של המשחק',
  hold: 'החזק להורדה', momentKicker: 'רגע מיוחד',
};

// ── fun14 ── (wave 14, the owner's daughter: "זה ארוך ומשעמם, היא רק בורחת למשחקי הביניים") the course loop's decks
// (src/game/jobs.js). Each stage deals two cards a turn: one stone card (סתתים) and one craft card (נגרים, צורפים, סיידים,
// נחושתנים) — Herod had priests taught as masons and as carpenters (קדמוניות היהודים טו, יא, ב). `key` is the course's key
// stone (keyOf), dealt when it is due, at most once a course. `sig` is the stage's signature, dealt by the second deal.
// `line`: every course opens with "החוט הצבוע" (snap.js). A job whose game has not landed is simply not dealt. Her ❤️ jobs go
// in every deck they fit: the rafts bring the cedar to every stage with cedar work (עזרא ג, ז; דברי הימים ב ב, טו).
const ALTAR_DECK = { stone: ['key', 'strike'], craft: ['plaster'], sig: 'plaster' };
export const DECKS = {
  // (v28, the owner 2.10: "הכהן לומד מקצוע" — המנופאי is the first craft in the world: the wheel is dealt at the Mount too, and it is
  //  the wall's signature, so she meets it in her first courses; the arch stays the Mount's ❤️ signature)
  har: { stone: ['key', 'strike', 'arch', 'tread', 'column', 'F1', 'letters'], craft: [], sig: 'arch', line: true },
  wall: { stone: ['key', 'strike', 'F1', 'tread'], craft: ['saw', 'rafts'], sig: 'tread', line: true },
  gates: { stone: ['key', 'strike', 'F1', 'tread'], craft: ['gold', 'saw', 'rafts'], sig: 'gold', line: true },
  nashim: { stone: ['key', 'strike', 'F1', 'tread'], craft: ['saw', 'rafts'], sig: 'saw', line: true },
  sorag: { stone: ['key', 'strike', 'F1'], craft: [], sig: 'F1', line: true },
  nikanor: { stone: ['key', 'strike', 'F1', 'tread'], craft: ['bronze'], sig: 'bronze', line: true },
  lishka: { stone: ['key', 'strike', 'F1', 'tread'], craft: ['saw', 'wheel', 'aqueduct'], sig: 'wheel', line: true },
  yesod: ALTAR_DECK, sovev: ALTAR_DECK, guf: ALTAR_DECK, karnot: ALTAR_DECK,
  kiyor: { stone: ['key'], craft: ['bronze', 'wheel', 'aqueduct'], sig: 'bronze' },
  ulam: { stone: ['key', 'strike', 'tread', 'waves'], craft: ['saw', 'gold', 'rafts'], sig: 'saw', line: true },
  heichal: { stone: ['key', 'strike', 'tread', 'waves'], craft: ['saw', 'gold', 'rafts'], sig: 'gold', line: true },
  kodesh: { stone: ['key', 'strike', 'tread', 'waves'], craft: ['saw', 'gold', 'rafts'], sig: 'gold', line: true },
};
// ── craftb19 ── (FUN19 §3, the owner's note 21: "שער ניקנור והלשכות — ממש אותו מסך") every stage leads with its own craft, and no two
// neighbours lead with the same one — in STAGE_IDS (har arch · wall tread · gates gold · nashim saw · sorag F1 · nikanor column ·
// lishka wheel · yesod key · sovev line · guf plumb · karnot plaster · kiyor aqueduct · ulam waves · heichal gold · kodesh tread) and in
// the play order (wall → gates → nashim → sorag → nikanor → lishka). The four altar stages no longer share ALTAR_DECK: each its own
// `sig`; all four keep the wooden mallet ('strike' there is מקבת העץ) and the whole stones ('key' there is the whole-stones game).
// Nikanor's doors are hauled up the 15 steps by the column's rope (המחשה; the skin "דלתות" is W20) and then polished (bronze).
// The plumb is a job of its own at the altar's body (guf: "4 courses, each found true").
Object.assign(DECKS, {
  nikanor: { stone: ['key', 'strike', 'column', 'F1', 'tread'], craft: ['bronze'], sig: 'column', line: true },
  kiyor: { stone: ['key'], craft: ['bronze', 'wheel', 'aqueduct'], sig: 'aqueduct' },
  ulam: { stone: ['key', 'strike', 'tread', 'waves'], craft: ['saw', 'gold', 'rafts'], sig: 'waves', line: true },
  kodesh: { stone: ['key', 'strike', 'tread', 'waves'], craft: ['saw', 'gold', 'rafts'], sig: 'tread', line: true },
  yesod: { stone: ['key', 'strike'], craft: ['plaster'], sig: 'key' },
  sovev: { stone: ['key', 'strike', 'line'], craft: ['plaster'], sig: 'line' },
  guf: { stone: ['key', 'strike', 'plumb'], craft: ['plaster'], sig: 'plumb' },
  karnot: { stone: ['key', 'strike'], craft: ['plaster'], sig: 'plaster' },
});
// ── /craftb19 ──
// ── /fun14 ──
