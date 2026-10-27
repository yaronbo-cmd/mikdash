/* ── fable32 (build 42) ── har42.js — the new Phase A, stage 01 "שיטוח ההר", end to end (docs/specs/shlav-alef-v2-he.md §10-01, §7, §9;
 * shlav-alef-bimui-he.md §1–§4; shlav-alef-hard-fun-he.md §1, §5). It takes the Mount's stage over while it is not done: the old stage's
 * taps (measure, dig), its paid finishing ("🪙 לשלם"), its separate check, its card chain and its "steel tools" card are not played; the
 * stages after it (02–15) play as before. The parts, in order:
 *   open   — the flyover: dawn, from over the Mount of Olives, the whole mountain, the gold plan of the platform unrolling, a slow orbit and
 *            the dive to the work (the first time ~16 s; later 3 s, with a skip)
 *   rope   — measuring by walking the rope: held, he walks it to the far peg ("חמש מאות אמה", מדות ב, א)
 *   lift   — the treadwheel lifts the first corner stone (LIFT; ויטרוביוס י, ב — המחשה)
 *   rock0…2 — reading the rock (INSPECT): 1 a clear line, 2 faint, 3 two lines and one with the layers (המחשה)
 *   course0, course1 — his hand stones in a course (PLACE) while the crews lay the rest before his eyes; a pull-back at each course's end
 *   roll   — the great stone on rollers: the crew's chant sets the tempo; the freed roller dragged to the front (המחשה; the great course
 *            stone of the Western Wall tunnels — the game's card)
 *   pave   — the last paving slabs: sizes that fill each row exactly
 *   trace  — "לבית התקיעה", traced on the parapet stone (Mazar 1968)
 *   reveal — the crane up from the last slab to the whole smooth plaza, the opening's rock for a moment first (before / after); one card
 * Input as in Phase B: hold anywhere → he walks to the next place (build 39's guide, guide39); the act's touch on the thing (build 40's
 * touch40); no stick (the developer's flag ?stick=1 keeps the old Phase A). The materials by day (§9: fam42 caravan42). The camera: the
 * object near the right hand, him ≤ 45 % of the height (twin.js pan40 / CAM41), frozen while a finger is on the thing.
 * Its own save: localStorage bh_har42. Developer flags: ?har42=0 (the old stage), ?h42at=<part>, ?h42day=<days ahead>, ?h42stock=<n>.
 * Every text "טיוטה" + its source, or "המחשה". Never a Divine Name. ── /fable32 ── */
import * as THREE from 'three';
import { createGuide39 } from '../avodah/shift/guide39.js';
import { walk39, pan40, CAM41, HERO41 } from './twin.js';
import { createTouch40 } from '../avodah/shift/touch40.js';
import { buzz42 } from '../avodah/shift/prefs28.js';
import { RATE30, rate30 } from '../avodah/shift/rate30.js';
import * as F from './fam42.js';
import * as TX from '../tex.js';
import { XRAY } from '../batch.js';   // ── build 46 ── (his stretch of the court wall: the model's skin there is not drawn — uHole)   // ── build 43 ── (the props' stone, rock and wood: the game's own procedural textures)

export const H42KEY = 'bh_har42';
try { globalThis.__F46 = { kinds: F.LAT46.kinds, tile: F.tile46 }; } catch (e) { /* */ }
try { globalThis.__F47 = { gates: F.GATES47, fine: F.LINTEL47.fine }; } catch (e) { /* */ }   // ── build 46 ── (the tools read the lattice's rule: never write)
export const PARTS42 = Object.freeze(['open', 'rope', 'lift', 'corner', 'rock0', 'rock1', 'rock2', 'course0', 'course1', 'roll', 'pave', 'trace', 'reveal']);
/** the parts' families (for the grades' levels) and their materials (fam42 MAT42.cost) */
export const PARTS45 = Object.freeze(['open', 'line', 'pulley', 'wcourse0', 'wcourse1', 'giant', 'wcorner', 'top', 'reveal']);   // ── build 45 ── stage 02, חומת העזרה (v2 §7)
export const PARTS46 = Object.freeze(['open', 'lattice0', 'lattice1', 'lattice2', 'warn', 'bows', 'reveal']);   // ── build 46 ── stage 03, הסורג והחיל (v2 §10 "03")
export const PARTS47 = Object.freeze(['open', 'lintel', 'leaf', 'leaf7', 'names', 'reveal']);   // ── build 47 ── stage 04, שערי העזרה (v2 §10 "04")
export const PARTS48 = Object.freeze(['open', 'wood', 'beams', 'pegs', 'corner', 'walk', 'reveal']);   // ── build 48 ── stage 05, עזרת הנשים (v2 §10 "05")
const FAMOF = { wood: 'inspect', log: 'inspect', beams: 'fit', beam: 'fit', pegs: 'fit', peg: 'fit', corner: 'fit', lintel: 'lift', leaf: 'fit', leaf7: 'fit', names: 'inspect', lattice0: 'place', lattice1: 'place', lattice2: 'place', lattice: 'place', warn: 'place', line: 'place', pulley: 'lift', wcourse0: 'place', wcourse1: 'place', giant: 'place', wcorner: 'place', top: 'place', lift: 'lift', corner: 'place', rock0: 'inspect', rock1: 'inspect', rock2: 'inspect', course0: 'place', course1: 'place', roll: 'place', pave: 'place', trace: 'place' };
const MATOF = { wood: 'wood', beams: 'beams', pegs: 'pegs', corner: 'corner48', lintel: 'lintel', leaf: 'leaf', leaf7: 'leaf7', lattice0: 'lattice', lattice1: 'lattice', lattice2: 'lattice', warn: 'warnst', pulley: 'pulley', wcourse0: 'wstone', wcourse1: 'wstone', giant: 'giant', wcorner: 'wstone', top: 'top', lift: 'lift', rock0: 'rock', rock1: 'rock', rock2: 'rock', course0: 'stone', course1: 'stone', roll: 'roll', pave: 'pave' };
/** the lines (short; each with its source, or המחשה) */
export const LINE42 = Object.freeze({   // ── build 43 ── (one short instruction; after " · " the source chip — the long explanations are on the card)
  rope: 'החזיקו — הולכים עם החבל ליתד הרחוקה · "חמש מאות אמה" — מדות ב, א · טיוטה',
  walk: 'החזיקו — הולכים לעבודה הבאה',
  lift: 'החזיקו על הגלגל — הוא מרים; שחררו לפני החלון · גלגל דריכה — ויטרוביוס י, ב · המחשה',
  lift2: 'גררו — מורידים מעט · המחשה',
  corner: 'גררו את המוט — דחיפה קצרה, האבן זזה מעט · מוט ברזל · המחשה',
  sweep: 'גררו את האור על הסלע · קו השכבה נראה באור נמוך · המחשה',
  wedge: 'הקישו על הקו — יתדות במרווחים שווים · המחשה',
  pour: 'החזיקו — מים; שחררו בסוף הסדק · המחשה',
  two: 'שני קווים — רק אחד עם השכבות · המחשה',
  place: 'גררו אבן לנדבך — היא מתיישבת מעצמה · "אריח על גבי לבנה" — מגילה טז ע"ב · טיוטה',
  roll: 'גררו את הגליל מאחור — לחזית · המחשה',
  pave: 'גררו לוחות שימלאו את השורה בדיוק · המחשה',
  trace: 'גררו לאורך הנקודות · "לבית התקיעה" — ב. מזר, 1968 · טיוטה',
  courseEnd: 'הנדבך הושלם — הצוותים ממשיכים',
  line: 'גררו את החוט מיתד ליתד — ישר · "וקו ינטה על ירושלים" — זכריה א, טז · טיוטה',   // ── build 45 ── stage 02's lines
  pulley: 'משכו מטה בקצב — ובין משיכה למשיכה החזיקו רגע · גלגלת — המחשה',
  pulley2: 'גבוה מדי — הרפו מעט, החבל יורד · המחשה',
  giant: 'אבן ענק — המנוף מוריד; גררו את המוט — דחיפה קצרה · המחשה',   // (build 45: "הניפו" was no task to the naive kid K45-W — the verb of stage 01's crowbar)
  wcorner: 'אבן הפינה — הפוכה לזו שמתחת · המחשה',
  top: 'הנדבך העליון — כולו שלכם · המחשה',
  retreat: 'האנך ירד: אבן בולטת — גררו אותה פנימה · המחשה',
  yishar: 'יישר כח! — הצוות · טיוטה',
  wet: 'בלילה ירד גשם, בבוקר שמש · תענית כג ע"א · טיוטה',
  mine: 'האבנים שלך · טיוטה',
  wood: 'סובבו, קלפו, וגררו לערימה הנכונה · "כל עץ שנמצא בו תולעת, פסול" — מדות ב, ה · טיוטה',   // ── build 48 ── stage 05's lines
  woodHow: 'החלקה למעלה — מסובבת · לאורך — מקלפת · הקשה — מסמנת · המחשה',
  beams: 'גררו קורה לשקע שלה — קורות הפינה קודם · "והקיפוה גזוזטרא" — מדות ב, ה · טיוטה',
  beamPush: 'דחפו את הקורה לתוך השקע — ישר · המחשה',
  beamRim: 'הקורה נעצרה בשפת השקע — ישר יותר · המחשה',
  beamBlocked: 'קודם קורות הפינה — אחרת היא לא נכנסת · המחשה',
  beamWrong: 'זו לא הקורה לשקע הזה · המחשה',
  tenon: 'גררו את השגם לתוך החריץ — לאורך החץ · המחשה',
  pegTap: 'הקישו על היתד — עד שהצליל ננעל, ועצרו · המחשה',
  pegSplit: 'היתד נסדקה — יתד חדשה, בחינם · המחשה',
  planks: 'גררו את הקרשים אל הקורות · המחשה',
  corner48: 'הפינה הזאת — כולה שלכם: קורות, קרשים ויתדות · המחשה',
  walk48: 'החזיקו — הולכים על הגזוזטרא · "שיהו הנשים רואות מלמעלן" — מדות ב, ה · טיוטה',
  lintel: 'החזיקו להרמה, והזיזו ימינה-שמאלה — הבועה באמצע · "כל השערים... היו להן שקופות, חוץ משער טדי" — מדות ב, ג · טיוטה',   // ── build 47 ── stage 04's lines (the Mishnah's word as the game's own text has it: שקופות)
  lintelOut: 'הבועה ברחה — הזיזו לצד השני · המחשה',
  lintelSet: 'גררו את המשקוף מעל שתי המזוזות — ושחררו · המחשה',
  lintelMiss: 'קצה אחד לא נח על המזוזה — גררו שוב · המחשה',
  leafPin: 'גררו את הכנף ישר למטה — הציר לתוך הגומה · "כל הפתחים... היו להן דלתות" — מדות ב, ג · טיוטה',
  leafRim: 'הציר נעצר על שפת הגומה — ישר יותר · המחשה',
  leafSwing: 'הניפו את הכנף — שתיפתח ותיסגר בשקט · המחשה',
  leafBind: 'הכנף נתקעת — הקישו על הטריז, והניפו שוב · המחשה',
  leaf7: 'השער השביעי — הכנף הכבדה, והמנופים מתנדנדים · המחשה',
  names: 'גררו כל שם לשער שלו · "שבעה שערים היו בעזרה" — מדות א, ד · טיוטה',
  lattice: 'בחרו חלק, סובבו או הפכו, וגררו לפרצה · הקשה מסובבת, כפולה הופכת — הדוגמה ממשיכה · סורג עשרה טפחים — מדות ב, ג · טיוטה',   // ── build 46 ── stage 03's lines
  latWrong: 'הדוגמה לא ממשיכה כך — נסו אחרת · המחשה',
  warn: 'החזיקו כדי ללכת, והציבו את האבנים במרחקים שווים · אבני אזהרה על הסורג — יוספוס, מלחמות ה 193–194 · המחשה',
  warnNear: 'קרוב מדי — לכו עוד קצת · המחשה',
  warnDone: 'המרחקים האמיתיים — והמקומות השווים בזהב · המחשה',
  bowFirst: 'החליקו לאט למטה — השתחוויה · מדות ב, ג · טיוטה',
  bows: 'משתחווים מול המקדש — הודיה על הניצחון על היוונים · מדות ב, ג · ברטנורא שם · טיוטה',   // ── build 46 ── (his stones in the court wall, when he passes by)
  out: 'מחר: שיירת אבנים מהמחצבה · אלף עגלות — קדמוניות טו 390 · טיוטה',
  caravan: 'הבוקר הגיעה שיירה · אלף עגלות — קדמוניות טו 390 · טיוטה',
});
/** ── build 44 ── חצר האומנים (hard-fun §5) and the craftsman's test (v2 §8): the variants he has met (stage 01's), the families' titles
 *  (טיוטה), the points a grade gives, the test's three jobs at level 2 and its rules (pass at כשר; מהודר in all three — a gold seal; free
 *  tries; after 5 failed tries of a job רב האומנים shows it — passed without a seal) */
export const YARD44 = Object.freeze([
  Object.freeze({ part: 'lift', fam: 'lift', he: 'גלגל הדריכה' }), Object.freeze({ part: 'corner', fam: 'place', he: 'מוט הברזל' }),
  Object.freeze({ part: 'course0', fam: 'place', he: 'נדבך' }), Object.freeze({ part: 'rock', fam: 'inspect', he: 'קריאת הסלע' }),
  Object.freeze({ part: 'roll', fam: 'place', he: 'האבן על הגלילים' }), Object.freeze({ part: 'pave', fam: 'place', he: 'הריצוף' }),
  Object.freeze({ part: 'pulley', fam: 'lift', he: 'הגלגלת' }), Object.freeze({ part: 'line', fam: 'place', he: 'החוט' }), Object.freeze({ part: 'wcorner', fam: 'place', he: 'פינה' }),   // ── build 45 ── (stage 02's)
  Object.freeze({ part: 'lattice', fam: 'place', he: 'הסריג' }), Object.freeze({ part: 'warn', fam: 'place', he: 'המרחקים' }),   // ── build 46 ── (stage 03's)
  Object.freeze({ part: 'lintel', fam: 'lift', he: 'המשקוף' }), Object.freeze({ part: 'leaf', fam: 'fit', he: 'כנף על ציר' }),   // ── build 47 ── (stage 04's)
  Object.freeze({ part: 'log', fam: 'inspect', he: 'בדיקת העצים' }), Object.freeze({ part: 'beam', fam: 'fit', he: 'קורה לשקע' }), Object.freeze({ part: 'peg', fam: 'fit', he: 'שגם ויתד' }),   // ── build 48 ── (stage 05's)
]);
/** ── build 46 ── stage 03's card's sources (the find: the warning inscription, 1871 — the game's existing find) */
export const SRC46 = Object.freeze([
  'סורג גבוה עשרה טפחים; שלש עשרה פרצות פרצו מלכי יון, וגזרו כנגדן שלש עשרה השתחויות — מדות ב, ג · טיוטה',
  'משתחווים מול המקדש — הודיה על הניצחון על היוונים — ברטנורא שם · טיוטה',
  'לפנים ממנו החיל, עשר אמות — מדות ב, ג · טיוטה',
  'אבני אזהרה ביוונית על הסורג — יוספוס, מלחמות ה 193–194 · טיוטה',
  'הסריג, מקומות האבנים ושלושה עשר הסימנים בסורג — המחשה',
]);
export const FIND46 = 'ממצא: כתובת האזהרה ביוונית — נמצאה ב-1871';
/** ── build 48 ── stage 05's card's sources */
export const SRC48 = Object.freeze([
  'עזרת הנשים — מאה ושלשים וחמש על מאה ושלשים וחמש, וארבע לשכות במקצעותיה, ולא היו מקורות — מדות ב, ה · טיוטה',
  'וכל עץ שנמצא בו תולעת, פסול מעל גבי המזבח — מדות ב, ה · טיוטה',
  'כל העצים כשרין למערכה חוץ משל זית ושל גפן — תמיד ב, ג · טיוטה',
  'וחלקה היתה בראשונה, והקיפוה גזוזטרא — מדות ב, ה · טיוטה',
  'השקעים, הסדר, השגם והיתד — המחשה',
]);
/** ── build 47 ── stage 04's card's sources */
export const SRC47 = Object.freeze([
  'שבעה שערים היו בעזרה, שלשה בצפון ושלשה בדרום ואחד במזרח — מדות א, ד · טיוטה',
  'כל השערים שהיו שם היו להן שקופות, חוץ משער טדי — מדות ב, ג · טיוטה',
  'כל הפתחים שהיו שם היו להן דלתות, חוץ משל אולם — מדות ב, ג · טיוטה',
  'כל השערים שהיו שם נשתנו להיות של זהב, חוץ משערי נקנור — מדות ב, ג · טיוטה',
  'שני המנופים, הפלס, הציר והטריז — המחשה',
]);
export const TITLE44 = Object.freeze({ lift: 'מנופאי', place: 'בנאי', inspect: 'בודק', fit: 'נגר' });
export const PTS44 = Object.freeze({ mehudar: 3, kasher: 2, tikkun: 1, title: 6 });
export const TEST44 = Object.freeze({ jobs: Object.freeze(['lift', 'course0', 'corner']), L: 2, demoAfter: 5, src: 'מן הכהנים לימד סתתות ונגרות — קדמוניות טו 390 · טיוטה' });
/** the test's rule on one job's try: a grade at כשר or better passes; else another free try — the fifth failure brings the demonstration */
export function testTry44(rec, rating) {
  const r = rec || { tries: 0, fails: 0, best: null, demo: false, passed: false };
  r.tries++;
  if (rating === 'mehudar' || rating === 'kasher') { r.passed = true; if (r.best !== 'mehudar') r.best = rating; return { rec: r, next: 'pass' }; }
  r.fails++;
  return { rec: r, next: r.fails >= TEST44.demoAfter ? 'demo' : 'again' };
}
/** the test's end: passed when every job passed or was shown; the seal only when every job was מהודר */
export function testEnd44(jobs) {
  const all = TEST44.jobs.map((j) => jobs && jobs[j]); if (!all.every((r) => r && (r.passed || r.demo))) return null;
  return { passed: true, seal: all.every((r) => r.passed && r.best === 'mehudar'), shown: all.some((r) => r.demo && !r.passed) };
}
/** a family's mastery points and title (the yard's practice, the test's tries) */
export const title44 = (fam, pts) => ((pts | 0) >= PTS44.title ? TITLE44[fam] || '' : '');
/** ── build 45 ── stage 02's card's sources */
export const SRC45 = Object.freeze([
  'עזרה — מאה שמונים ושבע על מאה שלושים וחמש — מדות ה, א · טיוטה',
  'וקו ינטה על ירושלים — זכריה א, טז · טיוטה',
  'אריח על גבי לבנה — מגילה טז ע"ב · טיוטה',
  'גשמים בלילות — תענית כג ע"א · טיוטה',
  'הגלגלת, החוט, הפינות המתחלפות והנסיגה — המחשה',
]);
/** the card's sources (the long explanations, moved off the screen's line) */
export const SRC42 = Object.freeze([
  'הר הבית היה חמש מאות אמה על חמש מאות אמה — מדות ב, א · טיוטה',
  'אריח על גבי לבנה — מגילה טז ע"ב · טיוטה',
  'לבית התקיעה — חפירות ב. מזר, 1968 · טיוטה',
  'אלף עגלות הביאו אבנים — קדמוניות טו 390 · טיוטה',
  'גלגל הדריכה, המוט, הגלילים, היתדות והמים — המחשה',
]);
const CSS = `.h42{position:fixed;inset:0;z-index:40;pointer-events:none;direction:rtl;font-family:Heebo,system-ui,sans-serif}
.h42-walk{position:fixed;inset:0;z-index:41;pointer-events:auto;touch-action:none}
.h42-it.nofit{opacity:.38;filter:grayscale(.6)}.h42-pad{position:fixed;top:0;bottom:0;left:51%;right:0;z-index:45;touch-action:none;pointer-events:auto;display:none}.h42-pad.on{display:block}.h42-pad.full{left:0}
.h42-line{position:fixed;top:calc(env(safe-area-inset-top,0px) + 6px);left:50%;transform:translateX(-50%);max-width:min(64vw,520px);z-index:47;padding:4px 12px;border-radius:14px;background:rgba(28,20,10,.82);color:#FFF4DC;font:800 14px/1.3 Heebo,system-ui,sans-serif;text-align:center;pointer-events:none}
.h42-line b{display:block;font:800 14px/1.25 Heebo,system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.h42-line small{display:flex;flex-wrap:nowrap;gap:6px;justify-content:center;margin-top:2px;font:600 10.5px/1.25 Heebo,system-ui,sans-serif;white-space:nowrap;overflow:hidden}.h42-line i{font-style:normal;padding:0 6px;border-radius:8px;background:rgba(255,230,160,.16);color:#FFE6A0;overflow:hidden;text-overflow:ellipsis}.h42-line em{font-style:normal;opacity:.75}
.h42-mat{position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);right:calc(env(safe-area-inset-right,0px) + 10px);z-index:47;min-height:44px;box-sizing:border-box;padding:4px 10px;border-radius:14px;background:rgba(28,20,10,.78);color:#FFE6A0;font:900 15px/1.2 Heebo,system-ui,sans-serif;display:flex;align-items:center;gap:4px;pointer-events:none}
.h42-pile{position:fixed;right:calc(env(safe-area-inset-right,0px) + 10px);bottom:calc(env(safe-area-inset-bottom,0px) + 10px);z-index:46;display:flex;gap:8px;pointer-events:auto}
.h42-it{min-width:52px;min-height:48px;padding:4px 8px;border-radius:10px;border:2px solid #E2B65A;background:linear-gradient(#D9CBB0,#B9A888);color:#3B2A12;font:900 15px/1 Heebo,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;touch-action:none;cursor:grab;box-shadow:0 3px 8px rgba(0,0,0,.35)}
.h42-it.drag{position:fixed;z-index:60;pointer-events:none;opacity:.92}
.h42-it.no{animation:h42sh .32s}@keyframes h42sh{0%,100%{transform:translateX(0)}30%{transform:translateX(-7px)}70%{transform:translateX(7px)}}
.h42-g{position:fixed;left:0;top:0;z-index:48;pointer-events:none;font:900 24px/1 Heebo,system-ui,sans-serif;color:#FFD66E;text-shadow:0 2px 6px rgba(0,0,0,.7);transform:translate(-50%,-50%);animation:h42g 1.6s ease-out forwards}
@keyframes h42g{0%{opacity:0;margin-top:8px}15%{opacity:1}100%{opacity:0;margin-top:-40px}}
.h42-svg{position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:44;pointer-events:none;overflow:visible}
.h42-meter{position:fixed;z-index:46;width:18px;height:110px;border-radius:9px;background:rgba(28,20,10,.6);border:2px solid #FFE6A0;overflow:hidden;pointer-events:none}
.h42-meter i{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(#9FD3F0,#3C8DC4)}.h42-meter b{position:absolute;left:-2px;right:-2px;background:rgba(255,214,110,.55);border-top:2px solid #FFD66E;border-bottom:2px solid #FFD66E}.h42-meter u{position:absolute;left:-4px;right:-4px;height:3px;background:#fff;opacity:.85}
.h42-card{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;background:rgba(20,14,6,.55);pointer-events:auto}
.h42-card>div{max-width:min(420px,86vw);padding:16px 20px;border-radius:18px;background:#FBF3E2;color:#2A1804;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.5)}
.h42-card h2{margin:0 0 6px;font:900 22px/1.2 Heebo,system-ui,sans-serif}.h42-card p{margin:4px 0;font:600 15px/1.35 Heebo,system-ui,sans-serif}.h42-card small{display:block;opacity:.7;font:600 11px/1.3 Heebo,system-ui,sans-serif}
.h42-card button{margin-top:10px;min-height:48px;min-width:140px;border-radius:14px;border:0;background:#C8923A;color:#2A1804;font:900 17px/1 Heebo,system-ui,sans-serif}
.h42-skip{position:fixed;left:calc(env(safe-area-inset-left,0px) + 12px);bottom:calc(env(safe-area-inset-bottom,0px) + 12px);z-index:49;min-height:44px;min-width:88px;border-radius:14px;border:2px solid #FFE6A0;background:rgba(28,20,10,.8);color:#FFE6A0;font:900 15px/1 Heebo,system-ui,sans-serif;pointer-events:auto}
.h42-before{position:fixed;left:0;top:0;width:100vw;height:100vh;object-fit:cover;z-index:43;pointer-events:none}
.h42-tag{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 18px);transform:translateX(-50%);z-index:50;padding:2px 8px;border-radius:8px;background:rgba(28,20,10,.82);color:#FFE6A0;font:900 13px/1.2 Heebo,system-ui,sans-serif;pointer-events:none}
body.h42-on .gm{display:none!important}
.h42-card button.h44-alt{margin-inline-start:8px;background:#E8DCC0}.h44-seal{font:900 18px/1.3 Heebo,system-ui,sans-serif!important;color:#9A6B12}
.h45-yishar,.h45-wet{font-size:26px;white-space:nowrap;animation-duration:2.2s}
.h44-yard{position:relative;max-height:88vh;overflow:auto;max-width:min(560px,92vw)!important}.h44-yard>button[data-b="back"]{position:absolute;top:8px;left:8px;margin:0!important;min-width:88px!important;min-height:44px!important;font-size:14px!important}.h44-rows{display:grid;grid-template-columns:1fr 1fr;gap:0 8px}.h44-row{display:flex;align-items:center;justify-content:space-between;gap:6px;margin:5px 0;padding:4px 6px;border-radius:12px;background:#F1E6CC}.h44-row b{font:800 15px/1.2 Heebo,system-ui,sans-serif}.h44-row span{display:flex;gap:4px}.h44-row button{margin:0!important;min-width:44px!important;min-height:44px!important;font-size:15px!important}
.h44-fam{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:4px 0 6px}.h44-fam i{font-style:normal;padding:2px 8px;border-radius:10px;background:#2A1804;color:#FFE6A0;font:700 12px/1.4 Heebo,system-ui,sans-serif}
.h44-ghost{position:fixed;z-index:61;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(255,255,255,.35);border:2px dashed #FFF;box-shadow:0 0 18px rgba(255,240,200,.8);pointer-events:none;transition:left .12s linear,top .12s linear}
.h44-ghost::after{content:'רב האומנים';position:absolute;top:50px;left:50%;transform:translateX(-50%);white-space:nowrap;font:800 12px/1 Heebo,system-ui,sans-serif;color:#FFF;text-shadow:0 1px 3px #000}`;

const ls = () => { try { return globalThis.localStorage || null; } catch (e) { return null; } };
const qs = (k) => { try { const m = new RegExp(`[?&]${k}=([^&#]*)`).exec(location.search || ''); return m ? decodeURIComponent(m[1]) : null; } catch (e) { return null; } };
export function load42() { try { const s = ls(); const v = s && JSON.parse(s.getItem(H42KEY) || 'null'); if (v && typeof v === 'object' && v.v === 1) { if ((v.part | 0) >= 3) v.part = (v.part | 0) + 1; v.v = 2; }   // (build 43: the corner stone after the wheel — a build-42 save's place moves on by one)
    if (v && typeof v === 'object' && v.v === 2) return v; } catch (e) { /* */ } return { v: 2, part: 0, open: 0, fam: {}, mat: {}, grades: [], hands: 0, t0: Date.now() }; }
export function save42(S) { try { const s = ls(); if (s) s.setItem(H42KEY, JSON.stringify(S)); } catch (e) { /* not kept */ } }
/** the new stage 01 plays while the Mount is not done (and not under the developer's ?har42=0 / the old stick ?stick=1, nor the demo) */
export function wanted42(G, isDone) { if (!G || G.demo || isDone(G, 'har')) return false; if (qs('har42') === '0' || qs('stick') === '1' || globalThis.__H42_OFF) return false; return true; }

/* ───────── the director ───────── */
/* ── build 46 ── HIS STONES ARE THE WALL (v2 §1, "שלי"): the stretch of the court wall's north face he and the crews laid in stage 02 —
 * the giant, the hand stones, the corner, the top course — kept in the save (bh_har42.wall.stones: [w, h, d, x, y, z, his]) and standing
 * in the wall for good; the model's outer skin there (and the scaffold in front) is not drawn (batch.js XRAY.uHole). When he passes by,
 * his own stones glow faintly and "האבנים שלך" (טיוטה) — once a minute at most. */
let W45 = null;
export function hole45(on, h) {
  try { if (on && h && h.length >= 8) { XRAY.uHole.value.set(h[0], h[1], h[2], h[3]); XRAY.uHole2.value.set(h[4], h[5], h[6], h[7]); XRAY.uHole3.value.set(h.length > 8 ? h[8] : -1e6, 0, 0, 0); } else { XRAY.uHole.value.set(0, 0, 0, 0); XRAY.uHole2.value.set(0, 0, 0, 0); } } catch (e) { /* */ }
}
/** ── build 46 ── the model's soreg not drawn where his lattice panels stand (during stage 03; batch.js XRAY.uHoleB, below 2.2 amot) */
export function hole46(on, h, yTop = 2.2, yBot = -1e6) { try { if (on && h) { XRAY.uHoleB.value.set(h[0], h[1], h[2], h[3]); XRAY.uHole3.value.y = yTop; XRAY.uHole3.value.z = yBot; } else { XRAY.uHoleB.value.set(0, 0, 0, 0); XRAY.uHole3.value.z = -1e6; } } catch (e) { /* */ } }   // (build 47: also the scaffold in front of his gate — over the Chel's floor)
/** ── build 47 ── his stretch moved east of שער הקרבן (its gatehouse x −104…−86 rises in stage 04 — the build-46 stretch, x −111…−87, stood in it):
 *  a save from build 46 is shifted 32.5 amot east, once */
export function migrate45(w) {
  if (!w || !Array.isArray(w.hole) || !(w.hole[0] < -100) || !Array.isArray(w.stones)) return false;
  const d = 32.5; w.stones = w.stones.map((q) => [q[0], q[1], q[2], Math.round((q[3] + d) * 1000) / 1000, q[4], q[5], q[6]]);
  w.hole = w.hole.map((v, i) => (i === 0 || i === 1 || i === 6 ? Math.round((v + d) * 1000) / 1000 : v)); w.m47 = 1; return true;
}
export function wallStones45(o = {}) {
  const sc = o.scene || (globalThis.__T && globalThis.__T.scene), list = o.list || [];
  if (W45 && W45.parent) W45.parent.remove(W45); W45 = null;
  if (!sc || !list.length) return null;
  const mk = (c, r) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0 });
  const ST = mk('#FFF7E6', 0.8), BS = mk('#F1E4C6', 0.95), HB = mk('#F1E4C6', 0.95), GOLD = new THREE.Color('#E8B84A'), W0 = new THREE.Color('#4A3D2A');
  try { const r = TX.texRock(91, 256); for (const [m, k] of [[ST, 0.45], [BS, 1.5], [HB, 1.5]]) { if (m !== ST) m.map = r.map; m.normalMap = r.normalMap; m.normalScale = new THREE.Vector2(k, k); m.emissive = W0.clone(); m.emissiveIntensity = 0.55; } } catch (e) { /* the plain colours */ }
  const g = new THREE.Group(); g.name = 'wall45'; let glow = 0, shownAt = -1e9, probe = null;
  for (const [w, h, d, x, y, z, his] of list) {
    const a = new THREE.Group(); a.add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), ST));
    const m = Math.min(0.26, Math.min(w, h) * 0.12), bd = Math.min(0.16, d * 0.08);
    for (const sz of [1, -1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.1, w - 2 * m), Math.max(0.1, h - 2 * m), bd), his ? HB : BS); b.position.z = sz * (d / 2 + bd / 2); a.add(b); if (his && !probe) probe = b; }
    a.position.set(x, y, z); a.userData.his = his ? 1 : 0; g.add(a);
  }
  if (probe) probe.onBeforeRender = () => {   // (only while the stretch is on the screen)
    try {
      const T = globalThis.__T, hp = { x: 0, y: 0, z: 0 }; T.stages.heroXYZ(hp); const c = o.center || [list[0][3], list[0][5]], d = Math.hypot(hp.x - c[0], hp.z - c[1]);
      const busy = typeof document !== 'undefined' && document.body && document.body.classList.contains('h42-on'), want = d < 18 && !busy ? 1 : 0, now = performance.now() / 1000;
      glow += (want - glow) * 0.04; HB.emissive.copy(W0).lerp(GOLD, glow * (0.55 + 0.25 * Math.sin(now * 2.2)));
      if (want && glow > 0.5 && now - shownAt > 60 && typeof document !== 'undefined') { shownAt = now; const el = document.createElement('div'); el.className = 'h46-mine'; el.textContent = LINE42.mine.split(' · ')[0]; el.setAttribute('style', 'position:fixed;left:50%;top:22%;transform:translateX(-50%);z-index:46;padding:4px 14px;border-radius:14px;background:rgba(28,22,14,.62);color:#FFE7A8;font:700 17px/1.3 Heebo,system-ui,sans-serif;pointer-events:none;opacity:.92'); document.body.appendChild(el); setTimeout(() => el.remove(), 2600); globalThis.__W45SEEN = (globalThis.__W45SEEN | 0) + 1; }
    } catch (e) { /* */ }
  };
  sc.add(g); W45 = g; globalThis.__W45 = g;
  if (o.hole) hole45(true, o.hole);
  return g;
}
export function createHar42(o = {}) {
  const doc = typeof document !== 'undefined' ? document : null;
  const MODE = o.mode === 'yard' || o.mode === 'test' ? o.mode : 'stage';   // ── build 44 ── (the yard and the test: one act at a time, no building)
  const st = { on: false, part: null, t: 0, last: 0, hold: null, drag: null, finger: 0, cam: null, camLock: null, ui: {}, props: {}, job: null, out: false, done: false, snapshot: null, pending: null };
  const S = load42();
  // ── build 45 ── one director for the new stages: 'har' (stage 01) and 'wall' (stage 02, חומת העזרה — v2 §7). The families' levels, the
  // materials, the yard and the test are the save's own (S); each stage's progress — its part, its opening, its grades, its hands — R
  const STG = o.stage === 'wall' ? 'wall' : o.stage === 'soreg' ? 'soreg' : o.stage === 'gates' ? 'gates' : o.stage === 'nashim' ? 'nashim' : 'har';
  const R = STG === 'wall' ? (S.wall && typeof S.wall === 'object' ? S.wall : (S.wall = { part: 0, open: 0, grades: [], hands: 0, streak: 0 })) : STG === 'soreg' ? (S.soreg && typeof S.soreg === 'object' ? S.soreg : (S.soreg = { part: 0, open: 0, grades: [], hands: 0, streak: 0 })) : STG === 'gates' ? (S.gates && typeof S.gates === 'object' ? S.gates : (S.gates = { part: 0, open: 0, grades: [], hands: 0, streak: 0 })) : STG === 'nashim' ? (S.nashim && typeof S.nashim === 'object' ? S.nashim : (S.nashim = { part: 0, open: 0, grades: [], hands: 0, streak: 0 })) : S;
  const PARTS = STG === 'wall' ? PARTS45 : STG === 'soreg' ? PARTS46 : STG === 'gates' ? PARTS47 : STG === 'nashim' ? PARTS48 : PARTS42;
  const stages = o.stages, view = o.view;
  const scene = () => (o.scene && o.scene()) || (globalThis.__T && globalThis.__T.scene) || null;
  const camera = () => (globalThis.__T && globalThis.__T.camera) || null;
  const hp = { x: 0, y: 0, z: 0, yaw: 0 };
  const hero = () => { try { stages.heroXYZ(hp); } catch (e) { /* */ } return hp; };
  const gy = (x, z) => { try { const y = stages.groundAt(x, z); return Number.isFinite(y) ? y : 20; } catch (e) { return 20; } };
  const proj = (x, y, z) => { try { const p = view.project(x, y, z); return p && p.on !== false ? { x: p.x, y: p.y } : null; } catch (e) { return null; } };
  const W = () => (typeof innerWidth === 'number' ? innerWidth : 844), H = () => (typeof innerHeight === 'number' ? innerHeight : 390);
  const now = () => performance.now() / 1000;
  // the places: around the Mount's work corner (the old stage's banker spot) — the rope's pegs, the wheel, the rocks, the course, the stone's run, the paving, the parapet
  const base = (() => { const w = STG === 'wall' ? { x: -67.5, z: -100 } : STG === 'soreg' ? { x: -96, z: -100 } : STG === 'gates' ? { x: -38, z: -86 } : STG === 'nashim' ? { x: 58, z: -56 } : o.spot ? o.spot() : null, b0 = w && Number.isFinite(w.x) ? { x: w.x, z: w.z } : { x: -60, z: 60 }; return MODE === 'stage' ? b0 : { x: b0.x - 85, z: b0.z }; })();   // (build 44: the yard and the test on the finished plaza, 85 amot in from the Mount's east wall — at the old corner the wall stood between the camera and him)
  const P = (dx, dz) => ({ x: base.x + dx, z: base.z + dz, get y() { return gy(this.x, this.z); } });
  const PL = { peg0: P(-14, 4), peg1: P(16, 4), wheel: P(10, -10), stone0: P(16, -10), rock: [P(-12, -14), P(-24, -6), P(-30, 8)], course: P(2, 16), roll0: P(-20, 24), roll1: P(4, 24), pave: P(18, 26), trace: P(30, 14), pulley: P(-2, -18), pstone: P(1, -18) };
  const STAND = { rope: PL.peg1, lift: P(6, -10), rock0: P(-9, -12), rock1: P(-21, -4), rock2: P(-27, 10), course0: P(2, 12), course1: P(2, 12), roll: P(-18, 19.5), pave: P(28, 27), trace: P(27, 14), corner: P(12, -5),
    line: PL.peg0, pulley: P(-6, -18), wcorner: P(8, 12), wcourse0: P(2, 12), wcourse1: P(2, 12), top: P(2, 12), giant: P(12, -5) };
  if (STG === 'wall') {   // ── build 45 ── the court wall's work front: OUTSIDE the court, north of its north wall (outer face z −73.5); every camera
    // north of him (the act's: the things east or south of him; the follow's azimuth turned, FOLLOW45). Inside the court its floor rises with the
    // wall (stages.groundAt: up to 16 amot) and buried the props; at the old stage's work spot ('dress') the walk's camera stood inside the wall.
    // ── build 46 ── his courses and the giant ARE a stretch of the north wall's face (build 47: x −78.6…−54.4, between שער הקרבן and שער הניצוץ; the bodies' faces at z −73.54): the model's skin
    // there and the scaffold in front are not drawn (HOLE45); he stands 5 amot out, north of the scaffold
    Object.assign(PL, { peg0: P(12, 0), peg1: P(-12, 0), pulley: P(-9, -6), pstone: P(-12, -6), course: { x: base.x + 2, y: 6, z: -72.94 }, stone0: { x: base.x - 8, y: 6, z: -72.54 } });   // (y 6: over the Chel's terrace to come (stage 03 lays it, 6 amot, round the courts) — below it his stones would be buried)
    Object.assign(STAND, { line: PL.peg0, pulley: P(-5, -6), wcourse0: P(2, 21.5), wcourse1: P(2, 21.5), giant: P(-2, 22), wcorner: P(15, 21.5), top: P(11, 21.5) });   // (the giant, the corner, the top: from the east, the camera north — broadside)
  }
  // ── build 46 ── stage 03's places: the lattice panels on the north soreg (z −91.5, temple.js), in front of his stretch of the wall; the warning
  // stones' stretch east of them; the thirteen marks beyond. In the yard (and stage 01's layout), the same on the open plaza.
  Object.assign(PL, { soreg: P(-20, -34), warnA: P(-40, -50), bow0: P(-40, -50) });
  Object.assign(STAND, { lattice0: P(-15.5, -37.5), lattice1: P(-15.5, -37.5), lattice2: P(-15.5, -37.5), lattice: P(-15.5, -37.5), warn: P(-40, -53.5), bows: P(-41, -53.5) });
  // ── build 47 ── stage 04's places: his gate — שער הניצוץ, in the north wall (its opening x −43…−33, temple.js), the posts on the Chel's terrace in
  // front of the gatehouse (z −80); he stands north of it; the cameras from the north. In the yard, the same gate on the open plaza.
  Object.assign(PL, { gate: P(30, -34) }); Object.assign(STAND, { lintel: P(26, -41), leaf: P(28, -40.5), leaf7: P(28, -40.5) });
  // ── build 48 ── stage 05's places: the wagon of logs at the wood chamber's door (NE, its door x 117…125 on z −29.5); his stretch of the
  // gallery on the court's north wall (inner face z −67.5, x 48.5…70.5 — by the NW chamber's corner); the conclusion's corner on the south wall
  Object.assign(PL, { trestle: P(-42, 32), wallY: P(-45, 10), wallS: P(-45, 10) }); Object.assign(STAND, { log: P(-46, 37), beam: P(-45, 15.5), peg: P(-45, 15.5) });
  if (STG === 'nashim') { Object.assign(PL, { trestle: { x: 121, get y() { return gy(121, -22); }, z: -22 }, wallY: { x: 59.5, get y() { return gy(59.5, -60); }, z: -67.5 }, wallS: { x: 59.5, get y() { return gy(59.5, 60); }, z: 67.5 } });
    Object.assign(STAND, { wood: { x: 115.5, get y() { return gy(115.5, -16); }, z: -16 }, beams: { x: 66, get y() { return gy(66, -62); }, z: -62 }, pegs: { x: 66, get y() { return gy(66, -62); }, z: -62 }, corner: { x: 66, get y() { return gy(66, 62); }, z: 62 }, walk: { x: 50, get y() { return gy(50, -60); }, z: -60 } }); }
  if (STG === 'gates') { Object.assign(PL, { gate: { x: -38, get y() { return gy(-38, -80); }, z: -80 } }); Object.assign(STAND, { lintel: P(-4, 0), leaf: P(-2.5, 0.5), leaf7: P(2.5, 0.5), names: P(0, -2) }); }
  if (STG === 'soreg') {
    Object.assign(PL, { soreg: { x: base.x, y: 0, z: -91.5 }, warnA: { x: base.x + 9, y: 0, z: -93.2 }, bow0: { x: base.x + 10, y: 0, z: -91.3 } });
    Object.assign(STAND, { lattice0: P(5.5, 6.5), lattice1: P(2, 6.5), lattice2: P(-1.5, 6.5), warn: P(9, 4.5), bows: P(6.5, 5) });   // (the lattice: beside the panel, east and close — not between it and the camera; the bows: just before the first mark, the procession passing between him and the soreg)   // (the bows: at the first mark, between the procession and the soreg)
  }   // (the paving from its east: from its south the act's camera stood behind the crews' course)

  /* ── the scene's props (simple shapes; המחשה) ── */
  const mat = (c, r = 0.85) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0 });
  const STONE = mat('#FFF7E6', 0.8), BOSS = mat('#F1E4C6', 0.95), ROCK = mat('#C9BA9C', 0.95), WOOD = mat('#B98B5C', 0.9), BED = mat('#A99A7E', 0.95);   // (light: the procedural maps multiply them — Jerusalem stone, not brown)
  let texOn = false;
  /** ── build 43 ── the props' look (the coordinator: "rocks as real rocks, ashlars with Herodian drafted margins and a raised boss, the
   *  treadwheel a real wooden wheel, wooden wedges, paving slabs with joints" — procedural, within the size budget) */
  function textures() {
    if (texOn || !doc) return; texOn = true;
    try {
      const r = TX.texRock(91, 256), w = TX.texWood(61, 128), n2 = (a) => new THREE.Vector2(a, a);
      for (const [m, k] of [[STONE, 0.45], [BOSS, 1.5], [ROCK, 1.7], [BED, 0.8]]) { if (m !== STONE) m.map = r.map; m.normalMap = r.normalMap; m.normalScale = n2(k); m.needsUpdate = true; }
      for (const m of [STONE, BOSS]) { m.emissive = new THREE.Color('#4A3D2A'); m.emissiveIntensity = 0.55; }   // ── build 44 ── (the big faces read dark in the dusk: the margin's smooth face without the rock map's blotches, and a little of the stone's own warmth)
      WOOD.map = w.map; WOOD.needsUpdate = true;
    } catch (e) { /* the plain colours */ }
  }
  /** an ashlar: the drafted margin (the body, smoother) and the raised boss on both long faces (as the Western Wall's stones) */
  function ashlar(w, h, d) {
    const g = new THREE.Group(); g.userData.dims = [w, h, d]; g.add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), STONE));
    const m = Math.min(0.26, Math.min(w, h) * 0.12), bw = Math.max(0.1, w - 2 * m), bh = Math.max(0.1, h - 2 * m), bd = Math.min(0.16, d * 0.08);
    for (const sz of [1, -1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), BOSS); b.position.z = sz * (d / 2 + bd / 2); g.add(b); }
    return g;
  }
  /** a rock: an icosphere pushed in and out by a few seeded waves, its foot flattened (no assets) */
  function rockGeo(r, seed) {
    const geo = new THREE.IcosahedronGeometry(r, 3), a = geo.attributes.position, ph = [1, 2, 3, 4, 5, 6].map((k) => (Math.sin(seed * 12.9898 + k * 78.233) * 43758.5453) % 6.283);
    for (let i = 0; i < a.count; i++) {
      const x = a.getX(i) / r, y = a.getY(i) / r, z = a.getZ(i) / r;
      const f = 1 + 0.14 * Math.sin(2.9 * x + ph[0]) * Math.sin(3.3 * y + ph[1]) * Math.sin(2.6 * z + ph[2]) + 0.06 * Math.sin(7.1 * x + ph[3]) * Math.sin(6.3 * z + ph[4]) + 0.035 * Math.sin(13 * y + ph[5]);
      let Y = y * f; if (Y < -0.45) Y = -0.45 + (Y + 0.45) * 0.25;
      a.setXYZ(i, x * f * r, Y * r, z * f * r);
    }
    geo.computeVertexNormals(); return geo;
  }
  function props() {
    const sc = scene(); if (!sc || st.props.root) return;
    textures();
    const g = new THREE.Group(); g.name = 'har42'; sc.add(g); st.props.root = g;
    const add = (m, x, y, z) => { m.position.set(x, y, z); g.add(m); return m; };
    // the rope's pegs and the rope
    st.props.peg0 = add(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.6, 6), WOOD), PL.peg0.x, PL.peg0.y + 0.8, PL.peg0.z);
    st.props.peg1 = add(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.6, 6), WOOD), PL.peg1.x, PL.peg1.y + 0.8, PL.peg1.z);
    const rg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]); st.props.rope = add(new THREE.Line(rg, new THREE.LineBasicMaterial({ color: '#E8D9B0' })), 0, 0, 0);
    if (STG === 'har') {   // ── build 45 ── (stage 01's own props; the giant, the course and the crowbar are both stages')
    // the treadwheel: a wooden drum of two rims and the boards he walks on, its spokes and axle, standing in its frame; the jib over the stone and its rope
    const wy = PL.wheel.y + 3.4, wh = new THREE.Group();
    for (const z of [-1, 1]) { const rim = new THREE.Mesh(new THREE.TorusGeometry(3, 0.13, 6, 32), WOOD); rim.position.z = z; wh.add(rim); for (let i = 0; i < 4; i++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.14, 5.9, 0.14), WOOD); sp.rotation.z = (i * Math.PI) / 4; sp.position.z = z; wh.add(sp); } }
    for (let i = 0; i < 30; i++) { const a = (i / 30) * Math.PI * 2, b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.07, 2.15), WOOD); b.position.set(Math.cos(a) * 2.95, Math.sin(a) * 2.95, 0); b.rotation.z = a + Math.PI / 2; wh.add(b); }
    const ax = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2.9, 8), WOOD); ax.rotation.x = Math.PI / 2; wh.add(ax);
    st.props.wheel = add(wh, PL.wheel.x, wy, PL.wheel.z);
    const fr = new THREE.Group(); for (const z of [-1.45, 1.45]) for (const sx of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.22, 4.1, 0.22), WOOD); l.position.set(sx * 1.05, -1.75, z); l.rotation.z = sx * 0.5; fr.add(l); }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 3.4), WOOD); beam.position.y = -3.4; fr.add(beam); add(fr, PL.wheel.x, wy, PL.wheel.z);
    const jx0 = PL.wheel.x + 0.6, jx1 = PL.stone0.x, jy = wy + 4.2, jl = Math.hypot(jx1 - jx0, PL.stone0.z - PL.wheel.z);
    const mast = new THREE.Mesh(new THREE.BoxGeometry(0.3, jy - PL.wheel.y, 0.3), WOOD); add(mast, jx0, PL.wheel.y + (jy - PL.wheel.y) / 2, PL.wheel.z);
    const jib = new THREE.Mesh(new THREE.BoxGeometry(jl + 0.6, 0.26, 0.26), WOOD); jib.rotation.y = -Math.atan2(PL.stone0.z - PL.wheel.z, jx1 - jx0); add(jib, (jx0 + jx1) / 2, jy, (PL.wheel.z + PL.stone0.z) / 2);
    const cr = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(jx1, jy, PL.stone0.z), new THREE.Vector3(jx1, jy - 3, PL.stone0.z)]); st.props.crRope = add(new THREE.Line(cr, new THREE.LineBasicMaterial({ color: '#D9C9A0' })), 0, 0, 0); st.props.jibY = jy;
    }
    // the giant corner stone (lifted by the wheel, set home with the crowbar), its ghost (level 1) and the crowbar
    const GW = STG === 'wall' ? 6 : 4.2;   // (stage 02: the giant low in the wall, 6 amot)
    st.props.stone0 = add(ashlar(GW, 1.8, 2), PL.stone0.x, PL.stone0.y + 0.9, PL.stone0.z); st.props.stone0.userData.his = 1;
    const gh = new THREE.Mesh(new THREE.BoxGeometry(GW, 1.8, 2), new THREE.MeshBasicMaterial({ color: '#FFD66E', transparent: true, opacity: 0.22, depthWrite: false })); gh.visible = false; st.props.ghost = add(gh, PL.stone0.x, PL.stone0.y + 0.9, PL.stone0.z);
    const lv = new THREE.Mesh(new THREE.BoxGeometry(0.13, 2.8, 0.13), mat('#5C5650', 0.5)); lv.geometry.translate(0, 1.4, 0); lv.visible = false; st.props.lever = add(lv, PL.stone0.x - 2.2, PL.stone0.y + 0.2, PL.stone0.z);
    if (STG === 'wall' || MODE === 'yard') props45(add);
    if (STG === 'soreg' || MODE === 'yard') props46(add);   // ── build 46 ──
    if (STG === 'gates' || MODE === 'yard') props47(add);   // ── build 47 ──
    if (STG === 'nashim' || MODE === 'yard') props48(add);   // ── build 48 ──
    if (STG === 'nashim' && st.props.stone0) st.props.stone0.visible = false;
    if (STG === 'gates' && st.props.stone0) st.props.stone0.visible = false;
    if (STG === 'soreg' && st.props.stone0) st.props.stone0.visible = false;   // ── build 45 ── the pulley's rig and its stone, the wall's gold plan
    if (STG === 'har') {
    // the rocks
    st.props.rocks = PL.rock.map((p, i) => { const m = add(new THREE.Mesh(rockGeo(2.2, i + 3), ROCK), p.x, p.y + 1.3, p.z); m.scale.set(1.35, 0.85, 1.05); m.rotation.y = i * 1.3; return m; });
    }
    // the course: the crews' stones below and in his course, and the slot
    st.props.course = new THREE.Group(); add(st.props.course, PL.course.x, PL.course.y, PL.course.z);
    if (STG === 'wall' && MODE === 'stage' && migrate45(R)) save42(S);   // ── build 47 ── (a stage begun in build 46)
    if (STG === 'wall' && MODE === 'stage') {   // ── build 46 ── back to a stage begun: the stretch as he left it; the giant waits on the ground until its part
      const c = st.props.course, gi = PARTS45.indexOf('giant');
      if (R.stones && R.stones.length && R.part > PARTS45.indexOf('wcourse0')) { for (const [w, h, d, x, y, z, his] of R.stones) { const a = ashlar(w, h, d); a.position.set(x - c.position.x, y - c.position.y, z - c.position.z); a.userData.his = his ? 1 : 0; c.add(a); } c.userData.below = 1; if (R.part > gi) st.props.stone0.visible = false; }
      if (R.part <= gi && st.props.stone0) st.props.stone0.position.set(PL.stone0.x - 4, gy(PL.stone0.x - 4, PL.stone0.z - 11) + 0.9, PL.stone0.z - 11);
    }
    if (STG === 'har') {
    // the great stone (huge) and its rollers
    st.props.big = add(ashlar(12, 3, 3.6), PL.roll0.x, PL.roll0.y + 2.4, PL.roll0.z);
    st.props.rollers = [0, 1, 2, 3].map((i) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 4.4, 10), WOOD); c.rotation.x = Math.PI / 2; return add(c, PL.roll0.x - 4.5 + i * 3, PL.roll0.y + 0.45, PL.roll0.z); });
    // the paving's rows
    st.props.pave = new THREE.Group(); add(st.props.pave, PL.pave.x, PL.pave.y + 0.05, PL.pave.z);
    // the parapet stone
    st.props.parapet = add(ashlar(3.4, 1.4, 1), PL.trace.x, PL.trace.y + 0.7, PL.trace.z);
    // the gold plan of the platform (unrolling in the opening)
    const R = 140, c0 = { x: base.x - 40, z: base.z - 50 }, gm = new THREE.MeshBasicMaterial({ color: '#FFD66E', transparent: true, opacity: 0.85 }), C4 = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    st.props.plan = C4.map((a, i) => { const b = C4[(i + 1) % 4], x0 = c0.x + a[0] * R, z0 = c0.z + a[1] * R, x1 = c0.x + b[0] * R, z1 = c0.z + b[1] * R, L = Math.hypot(x1 - x0, z1 - z0); const m = new THREE.Mesh(new THREE.BoxGeometry(L, 0.6, 2.4), gm); m.geometry.translate(L / 2, 0, 0); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0); m.scale.x = 0.001; return add(m, x0, gy(x0, z0) + 2, z0); });
    }
  }
  /** ── build 45 ── stage 02's props: the pulley's rig (a gin pole of two legs, the sheave, the rope) and its stone; the court wall's gold
   *  plan, 187 × 135 amot (מדות ה, א) round the court, rising from the ground in the opening; the morning's puddles after a night's rain */
  const SG46 = { x: -23, z: 0, x0: -211, x1: 165, z0: -91.5, z1: 91.5 };   // ── build 46 ── the soreg's line round the courts (temple.js: −211…165 × ±91.5)
  const PAN46 = { w: 3.36, h: 1.68, cell: 0.42 };
  const panelAt = (k) => ({ x: PL.soreg.x - (k - 1) * (PAN46.w + 0.06), y: PL.soreg.y, z: PL.soreg.z });   // (k 0…2: east to west — on the camera's screen, from the north, left to right)
  /** stage 03's props: the gold line of the soreg (the opening), three lattice frames, the warning stones' posts, the thirteen marks */
  function props46(add) {
    st.props.panels = [0, 1, 2].map((k) => panel46(k, ['diamonds', 'interlaced', 'twotone'][k], add));
    const post = mat('#D8CBB0', 0.85), A = PL.warnA, len = F.SPACE46.len;
    for (const x of [A.x, A.x + len]) add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, 0.5), post), x, gy(x, A.z) + 0.7, A.z);
    st.props.marks = []; const gold = new THREE.MeshBasicMaterial({ color: '#E8B84A' });
    for (let i = 0; i < 13; i++) { const x = PL.bow0.x + i * 2.6, m = add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.06), gold), x, gy(x, PL.bow0.z) + 1.0, PL.bow0.z - 0.05); m.visible = false; st.props.marks.push(m); }
    if (STG === 'soreg') {
      const gm = new THREE.MeshBasicMaterial({ color: '#FFD66E', transparent: true, opacity: 0.85 }), c = SG46, w = c.x1 - c.x0, d = c.z1 - c.z0, cx = (c.x0 + c.x1) / 2;
      st.props.plan46 = [[cx, c.z0, w + 4, 4], [cx, c.z1, w + 4, 4], [c.x0, 0, 4, d], [c.x1, 0, 4, d]].map(([x, z, ww, dd]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(ww, 9, dd), gm); m.geometry.translate(0, 4.5, 0);   /* (4 wide, 9 high over the Chel's dig: from the opening's height 2 × 2.5 read as nothing) */ m.scale.y = 0.001; return add(m, x, gy(x, z), z); });
    }
  }
  const drawTile = (c, segs, x, y, sz, lw) => { for (const [x1, y1, x2, y2, t] of segs) { c.strokeStyle = t ? '#6B3E14' : '#EBD9B0'; c.lineWidth = lw; c.beginPath(); c.moveTo(x + x1 * sz, y + y1 * sz); c.lineTo(x + x2 * sz, y + y2 * sz); c.stroke(); } };
  const svgTile = (segs, x, y, sz, lw = 4) => segs.map(([x1, y1, x2, y2, t]) => `<line x1="${(x + x1 * sz).toFixed(1)}" y1="${(y + y1 * sz).toFixed(1)}" x2="${(x + x2 * sz).toFixed(1)}" y2="${(y + y2 * sz).toFixed(1)}" stroke="${t ? '#7A4718' : '#F2E2BC'}" stroke-width="${lw}" stroke-linecap="round"/>`).join('');
  /** a lattice panel in the world: two posts, a rail and the lattice (a canvas drawn from the pattern, the gap open until it is filled) */
  function panel46(k, kind, add) {
    const P = panelAt(k), g = new THREE.Group(), fr = mat('#8A6A42', 0.8);
    for (const x of [-PAN46.w / 2, PAN46.w / 2]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, PAN46.h + 0.12, 0.16), fr); m.position.set(x, PAN46.h / 2, 0); g.add(m); }
    const rail = new THREE.Mesh(new THREE.BoxGeometry(PAN46.w + 0.12, 0.1, 0.18), fr); rail.position.y = PAN46.h + 0.05; g.add(rail);
    let cv = null, tex = null; try { if (doc) { cv = doc.createElement('canvas'); cv.width = 512; cv.height = 256; tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; } } catch (e) { cv = null; }
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(PAN46.w, PAN46.h), new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.9, color: '#F2E6CC' }));
    pl.position.y = PAN46.h / 2; g.add(pl); g.rotation.y = Math.PI;   // (its face to the north: from the camera, its first column on the left)
    const draw = (gap) => { if (!cv) return; const c = cv.getContext('2d'); c.clearRect(0, 0, 512, 256); c.lineCap = 'round'; for (let r = 0; r < 4; r++) for (let q = 0; q < 8; q++) { if (gap && q === gap.c && r === gap.r) continue; const w = F.want46(kind, k * 8 + q, r); drawTile(c, F.tile46(F.LAT46.kinds[kind].tile, w.r, w.f), q * 64, r * 64, 64, 10); } tex.needsUpdate = true; };
    const done = R.grades && R.grades.some((x) => x[0] === `lattice${k}`); draw(done ? null : { c: -1, r: -1 });
    add(g, P.x, gy(P.x, P.z), P.z);
    return { g, draw, P, kind };
  }
  /** ── build 47 ── stage 04's props: his gate (two posts, the lintel, two leaves on their pivots, the sockets), the two cranes and their ropes;
   *  on the stage, the seven gate openings in gold (the opening) and a pair of small leaves at each gate (the names' moment) */
  const GATE47 = { half: 5, post: 1.5, H: 20, lw: 13, leafW: 4.9, leafH: 19.4 };
  function props47(add) {
    const G = PL.gate, g0 = G.y, stoneM = mat('#E9DFC8', 0.85), wood = mat('#8A5A32', 0.75), dark = mat('#4A3A2A', 0.9);
    st.props.posts = [-1, 1].map((sx) => add(ashlar(GATE47.post, GATE47.H, GATE47.post), G.x + sx * (GATE47.half + GATE47.post / 2), g0 + GATE47.H / 2, G.z));
    for (const sx of [-1, 1]) add(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.2, 12), dark), G.x + sx * (GATE47.half - 0.25), g0 + 0.1, G.z);   // (the sockets — גומות)
    const lt = ashlar(GATE47.lw, 1.5, 1.5); st.props.lintel = add(lt, G.x, g0 + 0.75, G.z - 4);
    st.props.leaves = [-1, 1].map((sx) => {   // (each leaf on its pivot at the opening's side: the group at the pivot, the leaf from it inward)
      const piv = new THREE.Group(), lf = new THREE.Mesh(new THREE.BoxGeometry(GATE47.leafW, GATE47.leafH, 0.35), wood); lf.position.set(-sx * GATE47.leafW / 2, GATE47.leafH / 2, 0); piv.add(lf);
      for (let i = 1; i < 4; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(GATE47.leafW * 0.96, 0.22, 0.42), dark); b.position.set(-sx * GATE47.leafW / 2, i * GATE47.leafH / 4, 0); piv.add(b); }
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.6, 8), dark); pin.position.set(-sx * 0.25, -0.3, 0); piv.add(pin);
      add(piv, G.x + sx * (GATE47.half - 0.25) + sx * 0.25, g0 + 0.5, G.z - 7 - (sx > 0 ? 0 : 1.2)); piv.rotation.x = -Math.PI / 2 + 0.02; piv.userData.sx = sx; return piv;   // (lying on the ground north of the gate until hung)
    });
    st.props.cranes = [-1, 1].map((sx) => { const g2 = new THREE.Group(); for (const dz of [-1.1, 1.1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.34, 31, 0.34), WOOD); l.position.set(0, 15.5, dz); l.rotation.x = -dz * 0.05; g2.add(l); } const arm = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.3, 0.3), WOOD); arm.position.set(-sx * 1.8, 30.6, 0); g2.add(arm); return add(g2, G.x + sx * 10.5, g0, G.z - 1.6); });
    const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(12), 3));
    st.props.ropes47 = add(new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: '#D9C9A0' })), 0, 0, 0); st.props.ropes47.visible = false;
    if (STG === 'gates') {
      const gm = new THREE.MeshBasicMaterial({ color: '#FFD66E', transparent: true, opacity: 0.85 });
      st.props.plan47 = F.GATES47.map((q) => { const f = new THREE.Group(), ax = q.side === 'E'; for (const sx of [-1, 1]) { const p2 = new THREE.Mesh(new THREE.BoxGeometry(3, 21, 3), gm); p2.position.set(ax ? 0 : sx * 6.5, 10.5, ax ? sx * 6.5 : 0); f.add(p2); } const tp = new THREE.Mesh(new THREE.BoxGeometry(ax ? 3 : 16, 3, ax ? 16 : 3), gm); tp.position.y = 22.5; f.add(tp);   /* (3 amot thick: from the opening's height 1.2 read as a hair) */ f.scale.y = 0.001; const fx = q.side === 'E' ? -0.6 : q.x, fz = q.side === 'N' ? -74.6 : q.side === 'S' ? 66.4 : q.z; return add(f, fx, gy(fx, fz), fz); });   // (on the wall's face the camera sees — inside the wall they stood hidden)
      st.props.gl47 = F.GATES47.map((q) => { const pair = [-1, 1].map((sx) => { const piv = new THREE.Group(), lf = new THREE.Mesh(new THREE.BoxGeometry(4.9, 14, 0.5), wood); const ax = q.side === 'E'; lf.position.set(ax ? 0 : -sx * 2.45, 7, ax ? -sx * 2.45 : 0); piv.add(lf); piv.position.set(q.x + (ax ? 0 : sx * 5), gy(q.x, q.z) + 0.1, q.z + (ax ? sx * 5 : 0)); piv.rotation.y = sx * 1.1; piv.visible = false; piv.userData.sx = sx; st.props.root.add(piv); return piv; }); return pair; });
    }
  }
  /** ── build 48 ── stage 05's props: the wagon of logs and the trestle; the gallery's sockets on the wall (5 a stretch: the corner beams at the
   *  ends), its beams, planks and pegs as they are set; in the yard, a short wall; on the stage, the court's and the chambers' gold plan */
  const SOCK48 = [-11, -5.5, 0, 5.5, 11];
  function props48(add) {
    const T = PL.trestle, t0 = T.y, wood = mat('#7A5A3A', 0.85), dark = mat('#3A2C1E', 0.9), bark = mat('#7E6A52', 0.95);
    for (const dx of [-1.6, 1.6]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.4, 1.6), wood); leg.position.set(T.x + dx, t0 + 0.7, T.z); st.props.root.add(leg); }
    st.props.log48 = add(new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 5, 12), bark), T.x, t0 + 1.95, T.z); st.props.log48.rotation.z = Math.PI / 2;
    const wg = new THREE.Group(), bed = new THREE.Mesh(new THREE.BoxGeometry(6, 0.4, 3), wood); bed.position.y = 1.4; wg.add(bed);
    for (const [wx, wz] of [[-2.2, -1.6], [2.2, -1.6], [-2.2, 1.6], [2.2, 1.6]]) { const w2 = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.25, 14), dark); w2.rotation.x = Math.PI / 2; w2.position.set(wx, 0.75, wz); wg.add(w2); }
    for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.45, 5.4, 9), bark); l.rotation.z = Math.PI / 2; l.position.set(0, 1.9 + Math.floor(i / 3) * 0.75, -0.9 + (i % 3) * 0.9); wg.add(l); }
    st.props.wagon48 = add(wg, T.x + 6.5, gy(T.x + 6.5, T.z + 2), T.z + 2);
    if (MODE === 'yard') { const W2 = PL.wallY; add(new THREE.Mesh(new THREE.BoxGeometry(30, 16, 2), mat('#E2D6BC', 0.9)), W2.x, W2.y + 8, W2.z - 1); }
    st.props.sock48 = {};
    for (const side of MODE === 'yard' ? ['N'] : ['N', 'S']) { const W2 = side === 'N' ? PL.wallY : PL.wallS, sz = side === 'N' ? 1 : -1; st.props.sock48[side] = SOCK48.map((dx) => add(new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.7, 0.3), dark), W2.x + dx, W2.y + 11.5, W2.z + sz * 0.1)); }
    if (STG === 'nashim') {
      const gm = new THREE.MeshBasicMaterial({ color: '#FFD66E', transparent: true, opacity: 0.85 }), x0 = 6, x1 = 141, z0 = -67.5, z1 = 67.5, cx = (x0 + x1) / 2;
      const bars = [[cx, z0, x1 - x0 + 3, 3], [cx, z1, x1 - x0 + 3, 3], [x0, 0, 3, z1 - z0], [x1, 0, 3, z1 - z0]];
      for (const [a, b, c2, d] of [[101, -67.5, 141, -27.5], [101, 27.5, 141, 67.5], [6, -67.5, 46, -27.5], [6, 27.5, 46, 67.5]]) { const ix = c2 === 141 ? a : c2, iz = b === -67.5 ? d : b; bars.push([ix, (b + d) / 2, 2, d - b], [(a + c2) / 2, iz, c2 - a, 2]); }   // (the four chambers: their inner walls — open above: "ולא היו מקורות")
      st.props.plan48 = bars.map(([x, z, ww, dd]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(ww, 14, dd), gm); m.geometry.translate(0, 7, 0); m.scale.y = 0.001; return add(m, x, gy(x, z), z); });
    }
  }
  const CW45 = { x: -93.5, z: 0, w: 187, d: 135 };   // (the court's inside, מדות ה, א: the wall's foot −193…6 × ±73.5 less its 6 amot)
  function props45(add) {
    const top = PL.pulley.y + 7.5, g2 = new THREE.Group();
    for (const sx of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.24, 7.8, 0.24), WOOD); l.position.set(sx * 1.4, -3.75, 0); l.rotation.z = -sx * 0.19; g2.add(l); }
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.22, 14), WOOD); sh.rotation.x = Math.PI / 2; g2.add(sh);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(PL.pstone.x - PL.pulley.x) + 0.4, 0.22, 0.22), WOOD); arm.position.x = (PL.pstone.x - PL.pulley.x) / 2; g2.add(arm);
    add(g2, PL.pulley.x, top, PL.pulley.z); st.props.sheave = sh;
    st.props.pstone = add(ashlar(2.4, 1.1, 1.2), PL.pstone.x, PL.pstone.y + 0.55, PL.pstone.z);
    const pr = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(PL.pstone.x, top, PL.pstone.z), new THREE.Vector3(PL.pstone.x, top - 6, PL.pstone.z), new THREE.Vector3(PL.pulley.x, top, PL.pulley.z), new THREE.Vector3(PL.pulley.x + Math.sign(STAND.pulley.x - PL.pulley.x || -1) * 0.6, PL.pulley.y + 1.4, PL.pulley.z + 0.6)]);
    st.props.pRope = add(new THREE.LineSegments(pr, new THREE.LineBasicMaterial({ color: '#D9C9A0' })), 0, 0, 0); st.props.pTop = top;
    if (STG === 'wall') {
      const gm = new THREE.MeshBasicMaterial({ color: '#FFD66E', transparent: true, opacity: 0.8 }), hw = CW45.w / 2 + 3, hd = CW45.d / 2 + 3;   // (the gold line along the wall's middle: it rises inside the wall to be)
      st.props.plan = [[0, -hd, 2 * hw + 3, 3], [0, hd, 2 * hw + 3, 3], [-hw, 0, 3, 2 * hd], [hw, 0, 3, 2 * hd]].map(([dx, dz, w, d]) => { const y0 = gy(CW45.x + dx, CW45.z + dz), yP = gy(CW45.x + dx * 1.2, CW45.z + dz * 1.25), Hh = Math.max(3, yP + 2.5 - y0); const m = new THREE.Mesh(new THREE.BoxGeometry(w, Hh, d), gm); m.geometry.translate(0, Hh / 2, 0); m.scale.y = 0.001; return add(m, CW45.x + dx, y0, CW45.z + dz); });   // (from the trench's floor to 2.5 amot over the plaza: in the wall's 4-amah trench a 3-amah plan stood hidden)
    }
  }
  /** the crane's rope from the jib's end down to the stone's top */
  function craneRope(top) { const r = st.props.crRope; if (!r) return; const a = r.geometry.attributes.position; a.setXYZ(1, a.getX(0), top, a.getZ(0)); a.needsUpdate = true; }
  function dropProps() { try { const g = st.props.root; if (g && g.parent) g.parent.remove(g); } catch (e) { /* */ } st.props = {}; }

  /* ── the DOM ── */
  const el = (cls, html = '', tag = 'div') => { const e = doc.createElement(tag); e.className = cls; if (html) e.innerHTML = html; return e; };
  function ui() {
    if (!doc || st.ui.root) return;
    if (!doc.getElementById('h42-css')) { const s = doc.createElement('style'); s.id = 'h42-css'; s.textContent = CSS; doc.head.appendChild(s); }
    const r = el('h42'); doc.body.appendChild(r); st.ui.root = r;
    st.ui.walk = el('h42-walk'); r.appendChild(st.ui.walk); st.ui.walk.setAttribute('aria-label', 'החזיקו כדי ללכת');
    st.ui.line = el('h42-line'); r.appendChild(st.ui.line);
    st.ui.mat = el('h42-mat'); r.appendChild(st.ui.mat);
    st.ui.svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg'); st.ui.svg.setAttribute('class', 'h42-svg'); r.appendChild(st.ui.svg);
    st.ui.pad = el('h42-pad'); r.appendChild(st.ui.pad);
    st.ui.pile = el('h42-pile'); r.appendChild(st.ui.pile);
    st.t40 = createTouch40({ doc, pad: st.ui.pad, id: 'h42', proj });
    // the walk: held anywhere off the thing — the guide's way; released — he stops
    const w = st.ui.walk;
    w.addEventListener('pointerdown', (e) => { e.preventDefault(); if (st.hold) return; st.hold = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY }; try { w.setPointerCapture(e.pointerId); } catch (err) { /* */ } });
    w.addEventListener('pointermove', (e) => { if (st.hold && e.pointerId === st.hold.id) { st.hold.x = e.clientX; st.hold.y = e.clientY; } });
    for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) w.addEventListener(t, (e) => { if (st.hold && e.pointerId === st.hold.id) st.hold = null; });
    // the act's surface on the thing: its gesture (each part reads st.act: { down, x0, y0, x, y, t0, moved, up })
    const pad = st.ui.pad;
    pad.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); st.act = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t0: now(), moved: 0, down: true }; st.finger++; try { pad.setPointerCapture(e.pointerId); } catch (err) { /* */ } if (st.job && st.job.down) st.job.down(st.act); });
    pad.addEventListener('pointermove', (e) => { const a = st.act; if (!a || e.pointerId !== a.id) return; a.x = e.clientX; a.y = e.clientY; a.moved = Math.max(a.moved, Math.hypot(a.x - a.x0, a.y - a.y0)); if (st.job && st.job.move) st.job.move(a); });
    const up = (e) => { const a = st.act; if (!a || e.pointerId !== a.id) return; a.down = false; st.finger = Math.max(0, st.finger - 1); if (st.job && st.job.up) st.job.up(a, e.type); st.act = null; };
    for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) pad.addEventListener(t, up);
  }
  function dropUI() { try { if (st.t40) st.t40.destroy(); if (st.ui.root) st.ui.root.remove(); } catch (e) { /* */ } st.ui = {}; if (doc) doc.body.classList.remove('h42-on'); }
  const line = (t, sub = '') => { if (!st.ui.line) return; const parts = String(t || '').split(' · '), head = parts.shift() || '', src = parts.join(' · '); const h = head ? `<b>${esc(head)}</b>${src || sub ? `<small>${src ? `<i>${esc(src)}</i>` : ''}${sub ? `<em>${esc(sub)}</em>` : ''}</small>` : ''}` : ''; if (st.ui.line.__h !== h) { st.ui.line.__h = h; st.ui.line.innerHTML = h; } st.ui.line.hidden = !head; };   // (build 43: one short instruction line and a small source chip)
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const matChip = () => { if (st.ui.mat) st.ui.mat.textContent = `🪨 ${S.mat.stock | 0}`; };
  function toast(rating, at, opened) {
    if (!doc || !st.ui.root) return;
    const g = el('h42-g', `${RATE30.icon[rating]} ${RATE30.he[rating]}${opened ? ` · רמה ${opened} נפתחה` : ''}`); g.style.left = `${Math.round(at ? at.x : W() / 2)}px`; g.style.top = `${Math.round(at ? at.y : H() * 0.4)}px`; st.ui.root.appendChild(g); setTimeout(() => g.remove(), 1700);
    buzz42(rating === 'mehudar' ? 'ok' : rating === 'kasher' ? 'tick' : 'retry');
  }
  function card(title, lines, btn, on, alt, onAlt) {
    if (!doc) return null;
    const c = el('h42-card', `<div role="dialog" aria-label="${esc(title)}"><h2>${esc(title)}</h2>${lines.map((l) => (l.startsWith('~') ? `<small>${esc(l.slice(1))}</small>` : l.startsWith('!') ? `<p class="h44-seal">${esc(l.slice(1))}</p>` : `<p>${esc(l)}</p>`)).join('')}<button type="button" data-b="go">${esc(btn)}</button>${alt ? `<button type="button" data-b="alt" class="h44-alt">${esc(alt)}</button>` : ''}</div>`);
    c.querySelector('[data-b="go"]').addEventListener('click', (e) => { e.stopPropagation(); c.remove(); st.card = null; if (on) on(); });
    if (alt) c.querySelector('[data-b="alt"]').addEventListener('click', (e) => { e.stopPropagation(); c.remove(); st.card = null; if (onAlt) onAlt(); });
    c.addEventListener('pointerdown', (e) => e.stopPropagation());
    doc.body.appendChild(c); st.card = c; return c;
  }
  const svgClear = () => { if (st.ui.svg) st.ui.svg.innerHTML = ''; };
  const svgAdd = (html) => { if (st.ui.svg) st.ui.svg.insertAdjacentHTML('beforeend', html); };

  /* ── the camera: a view of his own (the follow, the act's frame, the flyover), set each frame ── */
  const cq = { p: new THREE.Vector3(), t: new THREE.Vector3() };
  let camInit = false;
  function camTo(p, t, k) {
    if (!camInit) { cq.p.set(...p); cq.t.set(...t); camInit = true; }
    else { cq.p.x += (p[0] - cq.p.x) * k; cq.p.y += (p[1] - cq.p.y) * k; cq.p.z += (p[2] - cq.p.z) * k; cq.t.x += (t[0] - cq.t.x) * k; cq.t.y += (t[1] - cq.t.y) * k; cq.t.z += (t[2] - cq.t.z) * k; }
    try { view.camSet(cq.p.x, cq.p.y, cq.p.z, cq.t.x, cq.t.y, cq.t.z); const c = camera(); if (c) { c.lookAt(cq.t); c.updateMatrixWorld(); } } catch (e) { /* */ }   // (the matrices now: the marks and the touch ring projected this frame match the picture — without it they lagged a camera step behind)
  }
  const FOLLOW = { d: 17, el: 0.52, az: STG !== 'har' ? -0.9 : 0.9 };   // (build 47: the gates too, from the north)   // (build 45, FOLLOW45: at the wall from the north — away from it)
  // ── build 43 ── (the coordinator's #1) his figure in Phase A is taller than Phase B's kohen (twin.js HERO41 3.96): pan40 stepped back for a
  // 3.96-amah figure and stopped too near — at 640 × 296 he filled 60–70 % of the height. His own height, measured once from the visible
  // figure; the distance his figure needs to stay ≤ 45 % at the field's height (0.42: a margin), for the act and the follow alike.
  let heroH = 0;
  function heroHeight() {
    if (heroH) return heroH;
    try {
      const m = stages.hero && stages.hero.mesh; if (!m) return 6.4;
      m.updateMatrixWorld(true); const h = hero(); let top = -Infinity; const b = new THREE.Box3();
      m.traverseVisible((n) => { if (!n.isMesh || !n.geometry) return; if (n.isSkinnedMesh && n.computeBoundingBox) { n.computeBoundingBox(); b.copy(n.boundingBox); } else { if (!n.geometry.boundingBox) n.geometry.computeBoundingBox(); b.copy(n.geometry.boundingBox); } b.applyMatrix4(n.matrixWorld); if (b.max.y - b.min.y > 12) return; top = Math.max(top, b.max.y); });
      const v = top - h.y; if (v > 2 && v < 12) heroH = v;
    } catch (e) { /* */ }
    return heroH || 6.4;   // (the figure measured in the page: 6.44 amot — tools/cam41.js, build 43)
  }
  const tanV = () => { const c = camera(); return Math.tan((((c && c.fov) || 32) * Math.PI) / 360) / ((c && c.zoom) || 1); };
  const needD = () => heroHeight() / (0.42 * 2 * tanV());
  function followView(h) { const d = Math.max(FOLLOW.d, needD() + 1), ce = Math.cos(FOLLOW.el), t = [h.x, h.y + heroHeight() * 0.45, h.z]; return { p: [t[0] + Math.cos(FOLLOW.az) * ce * d, t[1] + Math.sin(FOLLOW.el) * d, t[2] + Math.sin(FOLLOW.az) * ce * d], t }; }
  /** the act's frame: from beside him, the thing at 60 % of the width, him ≤ 45 % of the height (pan40, CAM41); held while a finger is on the thing */
  function actView(O) {
    const h = hero(); if (st.finger > 0 && st.camLock) return st.camLock;
    // (ש3: from beside him, 30° down — the forward turned θ off the line from him to the thing, so the thing stands right of him)
    let ux = O.x - h.x, uz = O.z - h.z; const Lu = Math.hypot(ux, uz) || 1; ux /= Lu; uz /= Lu;
    const th = 0.95, fx = ux * Math.cos(th) + uz * Math.sin(th), fz = -ux * Math.sin(th) + uz * Math.cos(th);
    const t = [(h.x + O.x) / 2, (h.y + O.y) / 2 + 1.2, (h.z + O.z) / 2], d = 18, el = 0.5, ce = Math.cos(el);   // (18: at the camera's own distance (closeCam) 12 made his figure 60–70 % of a 640 × 296 height; ≥ 15 at his depth keeps it ≤ 45 % with the field's 32°)
    const p = [t[0] - fx * ce * d, t[1] + Math.sin(el) * d, t[2] - fz * ce * d];
    const c = camera(), tanV = Math.tan((((c && c.fov) || 50) * Math.PI) / 360), tanH = tanV * (W() / H());
    let v = { p, t };
    const HH = heroHeight(); try { const r = pan40(p, t, O, { x: h.x, y: h.y + HH / 2, z: h.z, h: HH }, tanH, CAM41, tanV); if (r) v = { p: r.p, t: r.t }; } catch (e) { /* */ }   // (build 43: his own height — not Phase B's 3.96)
    // (him ≤ 45 % of the height: at the camera's own distance pan40's pose stood ~10 amot from him — 60–70 % at 640 × 296; back along the view's ray to 16)
    { const D = needD(), dh = Math.hypot(v.p[0] - h.x, v.p[1] - h.y - HH / 2, v.p[2] - h.z), vx = v.p[0] - v.t[0], vy = v.p[1] - v.t[1], vz = v.p[2] - v.t[2], L = Math.hypot(vx, vy, vz) || 1; if (dh < D) { const k = (L + (D - dh)) / L; v = { p: [v.t[0] + vx * k, v.t[1] + vy * k, v.t[2] + vz * k], t: v.t }; } }   // (build 43: the floor from his own height)
    st.camLock = v; return v;
  }

  /* ── the walk: the guide's way to the part's stand (guide39 over the open Mount: every floor free) ── */
  const E39 = { state: () => ({ phase: 'run', acting: !!(st.job && st.job.acting) }), flowNext: () => (st.target ? { id: st.part, at: { x: st.target.x, y: st.target.y, z: st.target.z } } : null), alt39: () => [] };
  const G39 = createGuide39({ E: E39, freeFor: () => () => true });
  const vel = { vx: 0, vz: 0 };
  function walkStep(dt) {
    const h = hero(); let g = null;
    if (st.hold && !st.job) g = G39.dir(h, null);
    walk39(vel, g, 14, dt);
    try { stages.hero.drive(vel.vx, vel.vz); } catch (e) { /* */ }
    if (st.hold && !st.job) R.hands += dt;
    return st.target ? Math.hypot(st.target.x - h.x, st.target.z - h.z) : 99;
  }

  /* ── the parts ── */
  let Lover = 0;   // ── build 44 ── (the yard's chosen level, the test's 2)
  const famL = (fam) => Lover || F.famLevel(S, fam);
  function grade(part, q, at) {
    const fam = FAMOF[part] || 'place', L = famL(fam);
    if (MODE !== 'stage') {   // ── build 44 ── the yard counts toward the levels (lvl36) and the points; the test only rates
      const r = MODE === 'yard' ? F.famRate(S, fam, L, q) : { rating: rate30(q), opened: 0 }; st.actQ = q; st.actRating = r.rating;
      const Y = S.yard || (S.yard = { pts: {}, runs: 0 }); Y.pts[fam] = (Y.pts[fam] | 0) + (PTS44[r.rating] | 0); if (MODE === 'yard') Y.runs = (Y.runs | 0) + 1; save42(S);
      toast(r.rating, at, r.opened); o.emit && o.emit('h44grade', { part, rating: r.rating, q, L, fam, mode: MODE }); return r.rating;
    }
    const r = F.famRate(S, fam, L, q);
    if (STG !== 'har') { R.streak = r.rating === 'mehudar' ? (R.streak | 0) + 1 : 0; if (R.streak >= 3) { R.streak = 0; setTimeout(() => { if (!doc || !st.ui.root) return; const y = el('h42-g h45-yishar', esc(LINE42.yishar.split(' · ')[0])); y.style.left = `${W() / 2}px`; y.style.top = `${H() * 0.3}px`; st.ui.root.appendChild(y); setTimeout(() => y.remove(), 2200); buzz42('peak'); o.emit && o.emit('h45yishar', {}); }, 900); } }   // ── build 45 ── three מהודר in a row: the crew calls (טיוטה)
    R.grades.push([part, r.rating, Math.round(q * 100) / 100, L]); save42(S);
    if (STG === 'soreg' || STG === 'gates' || STG === 'nashim') { try { if (stages.setStage) stages.setStage(STG === 'soreg' ? 'sorag' : STG, 'building', Math.min(0.92, (PARTS.indexOf(part) + 1) / (PARTS.length - 1)), {}); } catch (e) { /* */ } }   // ── build 46 ── (the crews' חיל rises with his parts; build 47: the gatehouses)
    toast(r.rating, at, r.opened);
    o.emit && o.emit('h42grade', { part, rating: r.rating, q, L, fam });
    return r.rating;
  }
  /** the act's thing: for the camera always; the touch surface on it only for the acts touched on the thing (the pile's acts drag from the pile) */
  function objPlace(on, pts, id) {
    const p0 = on && pts && pts[0]; st.obj = p0 ? { x: p0.x, y: p0.y, z: p0.z } : null;
    const touch = on && !(st.job && st.job.dragOnly);
    if (st.ui.pad) st.ui.pad.classList.toggle('on', !!touch);
    if (st.job && st.job.fullPad) { if (st.t40) st.t40.place(false); if (st.ui.pad) st.ui.pad.classList.add('full'); return; }   // ── build 46 ── (the walk and the bows: the whole screen — touch40 sized the pad to a box round the thing, and the naive kid's swipes missed it: K46-dbg)
    if (st.t40) st.t40.place(touch, touch ? pts : null, id);
  }
  // ── build 46 ── his stretch of the wall: the hole in the model's skin (x0, x1, z0, z1, zOut, yTop, gx1, gyTop) and the stones laid there
  const H45 = () => { const cx = PL.course.x, y0 = PL.course.y, gx = PL.stone0.x; return [Math.min(gx - 3.05, cx - 7.05), cx + 11.05, -73.62, -71.4, -80, y0 + 5.0, gx + 3.05, y0 + 1.86, y0 - 0.02]; };
  function stones45() {
    const out = [], v = new THREE.Vector3();
    const walk = (ob, his) => { if (!ob) return; if (ob.userData && ob.userData.dims) { ob.getWorldPosition(v); out.push([...ob.userData.dims.map((q) => Math.round(q * 1000) / 1000), Math.round(v.x * 1000) / 1000, Math.round(v.y * 1000) / 1000, Math.round(v.z * 1000) / 1000, his || ob.userData.his ? 1 : 0]); return; } for (const c of ob.children) walk(c, his || !!(ob.userData && ob.userData.his)); };
    try { if (st.props.root) st.props.root.updateMatrixWorld(true); } catch (e) { /* */ }
    walk(st.props.course, false); if (st.props.stone0 && st.props.stone0.visible) walk(st.props.stone0, false); return out;
  }
  // each part: begin() → its state; frame(dt) → true when the part is done
  const PART = {
    open: {
      begin() { const first = !R.open; st.fly = { t: 0, T: first ? (STG !== 'har' ? 8 : 16) : 3, first, snap: false }; line(''); if (!first) skipBtn(); else skipBtn(STG !== 'har' ? 3 : 5); },
      frame(dt) {
        const f = st.fly; f.t += dt; const u = Math.min(1, f.t / f.T), V = (globalThis.__T && globalThis.__T.VIEWS && globalThis.__T.VIEWS.olives) || { p: [601, 301, -215], t: [-60, 20, 0] };
        if (STG === 'nashim') {   // ── build 48 ── the women's court, 135 × 135 (מדות ב, ה), its four corner chambers rising — without roofs
          const c = { x: 73.5, z: 0 }, gc = gy(c.x, 0), orbit = Math.min(1, u / 0.78), a = -1.2 + orbit * 0.6, Rr = 230 - 60 * orbit;
          let p = [c.x + Math.cos(a) * Rr, gc + 150 - 55 * orbit, c.z + Math.sin(a) * Rr], t = [c.x, gc + 4, c.z];
          if (u > 0.78) { const k = (u - 0.78) / 0.22, e = k * k * (3 - 2 * k), fv = followView(hero()); p = p.map((v, i) => v + (fv.p[i] - v) * e); t = t.map((v, i) => v + (fv.t[i] - v) * e); }
          camTo(p, t, 1);
          if (st.props.plan48) st.props.plan48.forEach((m, i) => { m.scale.y = Math.max(0.001, Math.min(1, (u - 0.02 - (i > 3 ? 0.06 : 0)) / 0.14)); });
          return u >= 1;
        }
        if (STG === 'gates') {   // ── build 47 ── the court with its seven gate openings in gold (מדות א, ד); the crews' carpenters and goldsmiths at work
          const c = { x: -93, z: 0 }, gc = gy(c.x, -110), orbit = Math.min(1, u / 0.78), a = -1.75 + orbit * 0.55, Rr = 270 - 80 * orbit;
          let p = [c.x + Math.cos(a) * Rr, gc + 160 - 60 * orbit, c.z + Math.sin(a) * Rr], t = [c.x, gc + 6, c.z];
          if (u > 0.78) { const k = (u - 0.78) / 0.22, e = k * k * (3 - 2 * k), fv = followView(hero()); p = p.map((v, i) => v + (fv.p[i] - v) * e); t = t.map((v, i) => v + (fv.t[i] - v) * e); }
          camTo(p, t, 1);
          if (st.props.plan47) st.props.plan47.forEach((m, i) => { m.scale.y = Math.max(0.001, Math.min(1, (u - 0.02 - i * 0.015) / 0.12)); });
          return u >= 1;
        }
        if (STG === 'soreg') {   // ── build 46 ── the finished court wall; the soreg's gold line rises round the courts; the crews already lay the חיל
          const c = SG46, gc = gy(c.x, -110), orbit = Math.min(1, u / 0.78), a = -1.9 + orbit * 0.6, Rr = 300 - 90 * orbit;
          let p = [c.x + Math.cos(a) * Rr, gc + 170 - 70 * orbit, c.z + Math.sin(a) * Rr], t = [c.x, gc + 4, c.z];
          if (u > 0.78) { const k = (u - 0.78) / 0.22, e = k * k * (3 - 2 * k), fv = followView(hero()); p = p.map((v, i) => v + (fv.p[i] - v) * e); t = t.map((v, i) => v + (fv.t[i] - v) * e); }
          camTo(p, t, 1);
          if (st.props.plan46) st.props.plan46.forEach((m) => { m.scale.y = Math.max(0.001, Math.min(1, (u - 0.08) / 0.45)); });
          return u >= 1;
        }
        if (STG === 'wall') {   // ── build 45 ── from the finished plaza: the court wall's gold plan rises from the ground (187 × 135, מדות ה, א); the crews already at work; the dive to him
          const c = CW45, gc = gy(c.x, c.z), orbit = Math.min(1, u / 0.78), a = 0.75 + orbit * 0.55, Rr = 230 - 60 * orbit;
          let p = [c.x + Math.cos(a) * Rr, gc + 150 - 50 * orbit, c.z + Math.sin(a) * Rr], t = [c.x, gc + 4, c.z];
          if (u > 0.78) { const k = (u - 0.78) / 0.22, e = k * k * (3 - 2 * k), fv = followView(hero()); p = p.map((v, i) => v + (fv.p[i] - v) * e); t = t.map((v, i) => v + (fv.t[i] - v) * e); }
          camTo(p, t, 1);
          if (st.props.plan) st.props.plan.forEach((m) => { m.scale.y = Math.max(0.001, Math.min(1, (u - 0.08) / 0.45)); });
          return u >= 1;
        }
        const c = { x: V.t[0], z: V.t[2] }, R0 = Math.hypot(V.p[0] - c.x, V.p[2] - c.z), a0 = Math.atan2(V.p[2] - c.z, V.p[0] - c.x);
        const orbit = Math.min(1, u / 0.78), a = a0 + orbit * 0.9, R = R0 * (1 - 0.35 * orbit), y = V.p[1] * (1 - 0.3 * orbit);
        let p = [c.x + Math.cos(a) * R, y, c.z + Math.sin(a) * R], t = [V.t[0], V.t[1], V.t[2]];
        if (u > 0.78) { const k = (u - 0.78) / 0.22, e = k * k * (3 - 2 * k), fv = followView(hero()); p = p.map((v, i) => v + (fv.p[i] - v) * e); t = t.map((v, i) => v + (fv.t[i] - v) * e); }
        camTo(p, t, 1);
        if (!f.snap && f.t > 0.05 && STG === 'har') { f.snap = true; try { if (o.snapshot) st.snapshot = o.snapshot(); } catch (e) { st.snapshot = null; } }   // (build 43: the before — from the opening's own viewpoint, before the plan unrolls)
        if (st.props.plan) st.props.plan.forEach((m, i) => { m.scale.x = Math.max(0.001, Math.min(1, (u - 0.12) * 6 - i)); });   // (the four edges unroll one after another)
        return u >= 1;
      },
      end() { R.open = (R.open | 0) + 1; if (st.ui.skip) { st.ui.skip.remove(); st.ui.skip = null; } if (st.props.plan46) st.props.plan46.forEach((m) => { m.visible = false; }); if (st.props.plan47) st.props.plan47.forEach((m) => { m.visible = false; }); if (st.props.plan48) st.props.plan48.forEach((m) => { m.visible = false; }); },
    },
    rope: {
      begin() { line(LINE42.rope); },
      frame() {
        const h = hero(), r = st.props.rope; if (r) { const a = r.geometry.attributes.position; a.setXYZ(0, PL.peg0.x, PL.peg0.y + 1.4, PL.peg0.z); a.setXYZ(1, h.x, h.y + 1.6, h.z); a.needsUpdate = true; }
        return st.near;
      },
    },
    lift: {
      begin() { const L = famL('lift'); st.job = mkLift(L); line(LINE42.lift, `רמה ${L}`); },
    },
    corner: { begin() { st.job = mkCorner(); } },
    lattice0: { begin() { st.job = mkLattice(0); } }, lattice1: { begin() { st.job = mkLattice(1); } }, lattice2: { begin() { st.job = mkLattice(2); } },   // ── build 46 ── stage 03's parts
    lattice: { begin() { st.job = mkLattice(Math.min(2, Math.max(0, (Lover || 1) - 1))); } },   // (the yard: the panel by the level)
    warn: { begin() { st.job = mkWarn(); } },
    bows: { begin() { st.job = mkBows(); } },
    lintel: { begin() { st.job = mkLintel(); } },   // ── build 47 ── stage 04's parts
    leaf: { begin() { st.job = mkLeaf(0, false); } },
    leaf7: { begin() { st.job = mkLeaf(1, true); } },
    names: { begin() { st.job = mkNames(); } },
    wood: { begin() { st.job = mkWood(); } },   // ── build 48 ── stage 05's parts
    beams: { begin() { st.job = mkBeams('N'); } },
    pegs: { begin() { st.job = mkPegs(3, 'N'); } },
    corner: { begin() { st.job = mkCorner48(); } },
    walk: { begin() { st.job = mkWalk48(); } },
    log: { begin() { st.job = mkWood(3); } }, beam: { begin() { st.job = mkBeams('N'); } }, peg: { begin() { st.job = mkPegs(1, 'N'); } },   // (the yard's)
    line: { begin() { st.job = mkLine(); } },   // ── build 45 ── stage 02's parts
    pulley: { begin() { st.job = mkPulley(); } },
    wcourse0: { begin() { st.job = mkCourse(0, '', 'wcourse0'); } }, wcourse1: { begin() { st.job = mkCourse(1, '', 'wcourse1'); } },
    giant: { begin() { const s0 = st.props.stone0; if (s0) s0.position.y = PL.stone0.y + 0.9 + 4; st.job = mkCorner(LINE42.giant, 'giant'); } },
    wcorner: { begin() { st.job = mkCourse(MODE === 'yard' ? 0 : 2, 'corner', 'wcorner'); } },   // (the yard: on the ground row)
    top: { begin() { st.job = mkCourse(3, 'top', 'top'); } },
    rock0: { begin() { st.job = mkRock(0); } }, rock1: { begin() { st.job = mkRock(1); } }, rock2: { begin() { st.job = mkRock(2); } },
    course0: { begin() { st.job = mkCourse(0); } }, course1: { begin() { st.job = mkCourse(1); } },
    roll: { begin() { st.job = mkRoll(); } },
    pave: { begin() { st.job = mkPave(); } },
    trace: { begin() { st.job = mkTrace(); } },
    reveal: {
      // ── build 43 ── (the coordinator's #2) the crane up from the last slab to the opening's own high viewpoint over the Mount of Olives — the
      // whole smooth platform in the late sun — and there a quick crossfade to the opening's rock (before) and back (after); 9.5 s, skippable
      begin() {
        line(''); objPlace(false); svgClear();
        if (STG === 'wall' && MODE === 'stage') { try { R.stones = stones45(); R.hole = H45(); save42(S); wallStones45({ list: R.stones, hole: R.hole, scene: scene(), center: [PL.course.x + 2, PL.course.z] }); } catch (e) { /* */ } }   // ── build 46 ── his stones stay in the wall
        if (st.props.root) st.props.root.visible = false;
        let out = null; try { out = o.complete ? o.complete() : null; } catch (e) { out = null; }
        try { if (o.timeOfDay) o.timeOfDay('golden'); } catch (e) { /* */ }
        const gc = gy(CW45.x, CW45.z), V = STG === 'nashim' ? { p: [10, gc + 95, -150], t: [73, gc + 6, 0] } : STG === 'gates' ? { p: [-60, gc + 95, -175], t: [-60, gc + 8, -40] } : STG === 'soreg' ? { p: [PL.soreg.x - 40, gc + 70, PL.soreg.z - 120], t: [PL.soreg.x + 10, gc + 3, PL.soreg.z + 14] } : STG === 'wall' ? { p: [CW45.x - 70, gc + 150, CW45.z - 215], t: [CW45.x, gc + 6, CW45.z] } : (globalThis.__T && globalThis.__T.VIEWS && globalThis.__T.VIEWS.olives) || { p: [601, 301, -215], t: [-60, 20, 0] };   // (build 45: the wall — up over the whole court, from the north: from its south-east the crane flew through the north wall)
        const P0 = STG === 'wall' ? PL.course : STG === 'soreg' ? PL.soreg : STG === 'gates' ? PL.gate : STG === 'nashim' ? PL.wallY : PL.pave;
        if (STG === 'gates') { hole46(false); try { if (stages.setStage) stages.setStage('gates', 'building', 1, {}); } catch (e) { /* */ } }   // ── build 47 ──
        if (STG === 'nashim') { try { stages.hero.show(true); if (stages.setStage) stages.setStage('nashim', 'building', 1, {}); } catch (e) { /* */ } }   // ── build 48 ──
        if (STG === 'soreg') { hole46(false); try { if (stages.setStage) stages.setStage('sorag', 'building', 1, {}); } catch (e) { /* */ } }   // ── build 46 ── (the soreg whole: the model's own where his panels stood)
        st.rev = { t: 0, out, V, p0: [P0.x + 7, P0.y + 4.5, P0.z + 6], t0: [P0.x, P0.y + 0.5, P0.z + 1.5] };
        if (st.snapshot && doc && STG === 'har') { const im = el('h42-before', '', 'img'); im.src = st.snapshot; im.style.opacity = '0'; st.ui.root.appendChild(im); st.ui.before = im; }
        const tg = el('h42-tag', ''); tg.hidden = true; st.ui.root.appendChild(tg); st.ui.btag = tg;
        if (doc && st.ui.root) { const b = el('h42-skip', 'דלגו', 'button'); b.type = 'button'; b.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (st.rev) st.rev.t = Math.max(st.rev.t, 8.9); }); st.ui.root.appendChild(b); st.ui.skip = b; }
        buzz42('peak');
      },
      frame(dt) {
        const r = st.rev; r.t += dt; const T = 6.5, u = Math.min(1, r.t / T), e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2, V = r.V;
        const p = r.p0.map((v, i) => v + (V.p[i] - v) * e), t = r.t0.map((v, i) => v + (V.t[i] - v) * e); p[1] += Math.sin(Math.PI * e) * 40;
        camTo(p, t, 1);
        const im = st.ui.before, tg = st.ui.btag, k = r.t;
        if (im) im.style.opacity = String(k < 6.6 ? 0 : k < 7.1 ? (k - 6.6) / 0.5 : k < 8.3 ? 1 : k < 8.9 ? 1 - (k - 8.3) / 0.6 : 0);
        if (tg && k > 6.6) { tg.hidden = false; tg.textContent = STG === 'nashim' ? 'עזרת הנשים — קל״ה על קל״ה, וארבע לשכות בלי תקרה' : STG === 'gates' ? 'שבעה שערים — עשרים אמה גובהם, עשר רוחבם' : STG === 'soreg' ? 'הסורג — עשרה טפחים; החיל — עשר אמות' : STG === 'wall' ? 'חומת העזרה — קפ״ז על קל״ה' : k < 8.6 && im ? 'לפני — הסלע של הבוקר' : 'אחרי — משטח חלק'; }   // (build 45: the court, 187 × 135 — מדות ה, א)
        return r.t > 9.5;
      },
      end() { if (st.ui.skip) { st.ui.skip.remove(); st.ui.skip = null; } finishCard(); },
    },
  };
  function skipBtn(after = 0) {
    if (!doc || !st.ui.root) return;
    setTimeout(() => { if (!st.on || st.part !== 'open' || st.ui.skip) return; const b = el('h42-skip', 'דלגו', 'button'); b.type = 'button'; b.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (st.fly) st.fly.t = st.fly.T * 0.78; }); st.ui.root.appendChild(b); st.ui.skip = b; }, after * 1000);
  }

  /* LIFT: the treadwheel — hold on the wheel: he walks it; a drag down: lowers; the shadow (level 1) and the window on a meter */
  function mkLift(L) {
    const J = F.createLift(L), mt = el('h42-meter', '<i></i><b></b><u></u>'); st.ui.root.appendChild(mt);
    const [w0, w1] = J.P.win; mt.querySelector('b').style.bottom = `${w0 * 80}%`; mt.querySelector('b').style.height = `${(w1 - w0) * 80}%`;
    const inp = { hold: false, back: false };
    return {
      acting: true, el: [mt], J, kind: 'lift',
      down() { inp.hold = true; inp.back = false; }, move(a) { const over = J.state().y > J.P.win[1]; if (a.y - a.y0 > 20 || (over && Math.hypot(a.x - a.x0, a.y - a.y0) > 20)) { inp.hold = false; inp.back = true; } },   // (over the window, a drag any way lowers it — the naive kid dragged every way but down)
      up() { inp.hold = false; inp.back = false; },
      frame(dt) {
        const s = J.step(dt, inp); if (inp.hold && s.held > F.TAP42 && Math.random() < dt * 6) buzz42('creak');
        const y = s.y + J.sway(); st.props.stone0 && (st.props.stone0.position.y = PL.stone0.y + 0.9 + y * 5); craneRope(PL.stone0.y + 1.8 + y * 5); st.props.wheel && (st.props.wheel.rotation.z -= s.v * dt * 3);
        objPlace(true, [{ x: PL.wheel.x, y: PL.wheel.y + 3.3, z: PL.wheel.z, r: 3 }], 'h42lift');
        const q = proj(PL.wheel.x, PL.wheel.y + 3.3, PL.wheel.z); if (q) { mt.style.left = `${Math.round(Math.min(W() - 40, q.x + 90))}px`; mt.style.top = `${Math.round(Math.max(60, q.y - 55))}px`; }
        mt.querySelector('i').style.height = `${Math.round(Math.min(1.2, s.y) * 80)}%`; const u = mt.querySelector('u'); u.style.display = J.P.shadow ? '' : 'none'; u.style.bottom = `${Math.round(J.stopAt() * 80)}%`;
        line(s.slip ? 'הבלם מוריד את האבן לאט אל החלון — או גררו מטה · המחשה' : s.y > J.P.win[1] + 0.02 ? LINE42.lift2 : LINE42.lift, `רמה ${s.L}`);
        if (s.done) { grade('lift', s.q, q); buzz42('settle'); return true; }
        return false;
      },
    };
  }
  /* PLACE (twist, build 43): the giant corner stone — the crane lowers it a little short of its place; short flicks of the crowbar nudge it
   * home (a flick's length is its push; too strong overshoots — nudge it back); level 1 shows a ghost of the place (v2 §3) */
  function mkCorner(label = LINE42.corner, part = 'corner') {
    const L = famL('place'), J = F.createFlick(L), S0 = PL.stone0, s0 = st.props.stone0, y1 = S0.y + 0.9, y0 = s0 ? s0.position.y : y1 + 3;
    let lowT = 0, cx = 0, lev = 0;
    if (st.props.ghost) { st.props.ghost.visible = !!J.state().ghost; st.props.ghost.position.set(S0.x, y1, S0.z); }
    const axis = () => { const a = proj(S0.x + cx, y1, S0.z), b = proj(S0.x + cx + 1, y1, S0.z); if (!a || !b) return null; const n = Math.hypot(b.x - a.x, b.y - a.y) || 1; return { x: a.x, y: a.y, ux: (b.x - a.x) / n, uy: (b.y - a.y) / n, ppm: n }; };
    line(label, `רמה ${L}`);
    if (st.ui.pad) st.ui.pad.classList.add('full');   // ── build 45 ── the lever's drag anywhere on the screen (the naive kid dragged on the stone, left of the half-screen pad: K45-P3's parent's hand)
    return {
      acting: true, J, kind: 'corner', axis, ready: () => lowT >= 1.4,
      end() { if (st.ui.pad) st.ui.pad.classList.remove('full'); },
      down() {}, move() {},
      up(a) {
        if (lowT < 1.4) return;
        const dx = a.x - a.x0, dy = a.y - a.y0, px = Math.hypot(dx, dy), A = axis(), dir = A ? (dx * A.ux + dy * A.uy >= 0 ? 1 : -1) : 1;
        const r = J.flick({ dragPx: px, dir }); if (r !== 'tap') { lev = 0.45 * dir; buzz42(r === 'over' ? 'retry' : r === 'home' ? 'settle' : 'mallet'); if (r === 'over') line('יותר מדי — גררו את המוט חזרה, בעדינות · המחשה', `רמה ${J.state().L}`); }
      },
      frame(dt) {
        lowT += dt; const s = J.state(), k = Math.min(1, lowT / 1.4), e = k * k * (3 - 2 * k);
        cx += (s.x - cx) * Math.min(1, dt * (lowT < 1.4 ? 2.5 : 10));
        const yy = y0 + (y1 - y0) * e; if (s0) s0.position.set(S0.x + cx, yy, S0.z); craneRope(lowT < 1.6 ? yy + 0.9 : (st.props.jibY || yy) - 0.5);
        if (st.props.lever) { const lv = st.props.lever; lv.visible = lowT >= 1.4; lev *= Math.max(0, 1 - dt * 5); lv.position.set(S0.x + cx - 2.3, S0.y + 0.15, S0.z + 0.3); lv.rotation.z = -0.55 + lev; }
        objPlace(true, [{ x: S0.x + cx, y: y1, z: S0.z, r: 2.4 }], 'h42corner');
        if (!s.done && lowT > 1.4 && !(s.flicks && s.side > 0)) line(label, `רמה ${s.L} · דחיפות ${s.flicks}`);
        if (s.done) { if (st.props.ghost) st.props.ghost.visible = false; if (st.props.lever) st.props.lever.visible = false; if (s0) s0.position.set(S0.x + s.x, y1, S0.z); grade(part, s.q, proj(S0.x, y1 + 1.2, S0.z)); if (STG === 'wall' && MODE === 'stage') { try { if (s0) s0.position.x = S0.x; R.stones = stones45(); save42(S); } catch (e) { /* */ } } return true; }
        return false;
      },
    };
  }
  /* ── build 46 ── the LATTICE: the panel's pattern on a board over the scene (front-on, so it reads), the gap outlined; the tray's three
   * pieces — a tap turns one, a double tap flips it, a drag sets it in the gap: the right one the right way — in; else out, a mistake */
  const addP = (m, x, y, z) => { m.position.set(x, y, z); if (st.props.root) st.props.root.add(m); return m; };   // (an act's own props, into the props' root)
  function mkLattice(k) {
    const kind = ['diamonds', 'interlaced', 'twotone'][k], L = famL('place'), pan = st.props.panels && st.props.panels[k];
    const seed = ((R.grades ? R.grades.length : 0) * 7 + k * 13 + 5) >>> 0; let a = seed * 9301 + 49297; const rnd = () => ((a = (a * 9301 + 49297) % 233280) / 233280);
    const slot = { c: k === 0 ? 2 + Math.floor(rnd() * 5) : Math.floor(rnd() * 2), r: Math.floor(rnd() * 4) };   // (from the second panel the gap is at its start: the pattern runs on from the panel before)
    const J = F.createLattice46(kind, L, { rnd, col0: k * 8, slot }), K = F.LAT46.kinds[kind];
    if (pan) pan.draw(slot);
    line(LINE42.lattice, `${K.he} · רמה ${L}`);
    const pile = st.ui.pile; pile.innerHTML = ''; pile.hidden = false;
    const geo = () => { const bw = Math.min(W() * 0.52, 430), sz = bw / 10; return { x: (W() - bw) / 2, y: Math.max(44, H() * 0.15), sz, bw }; };
    const slotRect = () => { const G = geo(); return { l: G.x + (2 + slot.c) * G.sz, t: G.y + slot.r * G.sz, s: G.sz }; };
    const board = () => {
      const G = geo(), sz = G.sz; let out = `<rect x="${G.x - 6}" y="${G.y - 6}" width="${G.bw + 12}" height="${4 * sz + 12}" rx="10" fill="rgba(40,28,14,.72)" stroke="#E2B65A" stroke-width="2"/>`;
      for (let r = 0; r < 4; r++) for (let q = -2; q < 8; q++) {
        if (q < 0 && k === 0) continue; const x = G.x + (q + 2) * sz, y = G.y + r * sz, col = k * 8 + q;
        if (q === slot.c && r === slot.r && !J.state().done) { out += `<rect x="${x + 2}" y="${y + 2}" width="${sz - 4}" height="${sz - 4}" fill="rgba(255,214,110,.12)" stroke="#FFD66E" stroke-width="2" stroke-dasharray="5 4"/>`; continue; }
        const w = F.want46(kind, col, r), seg = F.tile46(K.tile, w.r, w.f); out += `<g opacity="${q < 0 ? 0.42 : 1}">${svgTile(seg, x, y, sz, Math.max(3, sz * 0.12))}</g>`;
      }
      out += `<line x1="${G.x + 2 * sz}" y1="${G.y - 4}" x2="${G.x + 2 * sz}" y2="${G.y + 4 * sz + 4}" stroke="#E2B65A" stroke-width="2" opacity="${k === 0 ? 0 : 0.8}"/>`;
      return out;
    };
    const items = J.state().tray.map((pc, i) => { const b = el('h42-it h46-pc', '', 'button'); b.type = 'button'; b.dataset.i = String(i); b.setAttribute('aria-label', `חלק ${i + 1}`); pile.appendChild(b); return b; });
    const paint = () => items.forEach((b, i) => { const pc = J.state().tray[i]; b.innerHTML = `<svg width="40" height="40" viewBox="0 0 40 40">${svgTile(F.tile46(pc.type, pc.r, pc.f), 2, 2, 36, 4)}</svg>`; b.dataset.r = String(pc.r); b.dataset.f = String(pc.f); b.dataset.type = pc.type; });
    paint();
    let tapT = null, tapI = -1, tapAt = 0, endT = -1;
    items.forEach((b, i) => dragItem(b, (drop) => {
      if (J.state().done) return false;
      if ((drop.px || 0) < F.DRAG42) {   // a tap: turn — two taps at once: flip
        const t = now();
        if (tapI === i && t - tapAt < 0.34 && tapT) { clearTimeout(tapT); tapT = null; tapI = -1; J.flip(i); paint(); buzz42('tick'); }
        else { if (tapT) { clearTimeout(tapT); tapT = null; } tapI = i; tapAt = t; tapT = setTimeout(() => { tapT = null; tapI = -1; if (!J.state().done) { J.tap(i); paint(); buzz42('tick'); } }, 340); }
        return false;
      }
      const R2 = slotRect(), on = drop.x > R2.l - R2.s * 0.6 && drop.x < R2.l + R2.s * 1.6 && drop.y > R2.t - R2.s * 0.6 && drop.y < R2.t + R2.s * 1.6;
      const r = J.drop(i, { dragPx: drop.px, onSlot: on });
      if (r === 'ok') { buzz42('settle'); if (pan) pan.draw(null); pile.innerHTML = ''; endT = 1.1; grade(`lattice${k}`, J.state().q, { x: R2.l + R2.s / 2, y: R2.t }); return true; }
      if (r === 'wrong') { b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); buzz42('retry'); line(LINE42.latWrong, `${K.he} · טעויות ${J.state().mistakes}`); setTimeout(() => { if (!J.state().done) line(LINE42.lattice, `${K.he} · רמה ${L}`); }, 2400); }
      return false;
    }));
    const P = pan ? pan.P : PL.soreg;
    return {
      acting: true, J, kind: 'lattice', slotRect, items: () => items, panel: k,
      down() {}, move() {}, up() {},
      view(h) { const D = Math.max(24, needD() + 1.5), t = [P.x - 1.6, gy(P.x, P.z) + 3.4, P.z], p = [P.x - 1.6, t[1] + D * 0.16, P.z - D]; return { p, t }; },   // (him ≤ 45 %: needD at his depth)   // (front-on, ש3: the panel square to the camera, him beside it under 45 %)
      frame(dt) {
        objPlace(true, [{ x: P.x, y: gy(P.x, P.z) + 0.85, z: P.z, r: 1.9 }], 'h46lat');
        svgClear(); if (!J.state().done || endT > 0.4) svgAdd(board());
        if (endT >= 0) { endT -= dt; if (endT <= 0) { svgClear(); return true; } }
        return false;
      },
      end() { pile.innerHTML = ''; svgClear(); if (tapT) clearTimeout(tapT); },
    };
  }
  /* ── build 48 ── stage 05's acts ── */
  let actx = null; const tone = (f, dur = 0.12, type = 'triangle') => { try { const AC = globalThis.AudioContext || globalThis.webkitAudioContext; if (!AC) return; actx = actx || new AC(); const t = actx.currentTime, osc = actx.createOscillator(), g = actx.createGain(); osc.type = type; osc.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); osc.connect(g); g.connect(actx.destination); osc.start(t); osc.stop(t + dur + 0.02); } catch (e) { /* no sound */ } };   // (the peg's rising pitch)
  const BARK48 = { fig: ['#A39684', '#8C7F6E', 2, 0], walnut: ['#6C5846', '#4F3F31', 7, 0], shemen: ['#8B6D50', '#6C523B', 5, 1], olive: ['#8E8A72', '#6E6A55', 9, 2], vine: ['#7C5B3D', '#5A3F28', 12, 3] };
  const leafSvg = (sp, x, y, s2) => {   // a twig and its leaves by the log's end (level 1 names it too)
    const c = sp === 'olive' ? '#9DA88C' : sp === 'vine' ? '#6FA04A' : sp === 'fig' ? '#5E9440' : sp === 'walnut' ? '#4E8A3C' : '#3E7A52';
    const lf = (dx, dy, rx, ry, rot) => `<ellipse cx="${x + dx * s2}" cy="${y + dy * s2}" rx="${rx * s2}" ry="${ry * s2}" fill="${c}" stroke="#2E4A22" stroke-width="1" transform="rotate(${rot} ${x + dx * s2} ${y + dy * s2})"/>`;
    let h = `<line x1="${x}" y1="${y}" x2="${x - 18 * s2}" y2="${y - 22 * s2}" stroke="#5A4630" stroke-width="${2 * s2}"/>`;
    if (sp === 'olive') h += lf(-6, -8, 9, 2.2, -50) + lf(-12, -16, 9, 2.2, -30) + lf(-15, -10, 8, 2, -70);
    else if (sp === 'vine') h += [0, 72, 144, 216, 288].map((r) => lf(-12 + 6 * Math.cos((r * Math.PI) / 180), -16 + 6 * Math.sin((r * Math.PI) / 180), 6, 4, r)).join('');
    else if (sp === 'fig') h += [0, 60, 120, 180, 240].map((r) => lf(-12 + 5 * Math.cos((r * Math.PI) / 180), -16 + 5 * Math.sin((r * Math.PI) / 180), 7, 5, r)).join('');
    else if (sp === 'walnut') h += [-1, 0, 1].map((i) => lf(-10 + i * 6, -14 - i * 7, 6, 3, -40)).join('') + lf(-20, -24, 6, 3, -60);
    else h += [0, 1, 2, 3, 4, 5].map((i) => `<line x1="${x - 12 * s2}" y1="${y - 14 * s2}" x2="${x - 12 * s2 + 12 * s2 * Math.cos(i)}" y2="${y - 14 * s2 + 12 * s2 * Math.sin(i)}" stroke="${c}" stroke-width="${1.6 * s2}"/>`).join('');
    return h;
  };
  /** INSPECT — the WOOD CHAMBER (the shared engine: fam42 createLog48, the shuffle-bag createBag48, the defects' book): logs from the wagon,
   *  one by one in hand (a board over the scene, side light): a swipe up or down turns it, along it peels the bark (and wipes), a tap marks; a
   *  drag to "למערכה" or "לא למזבח" decides; then the reason, and a page in ספר הפגימות the first time a type is met */
  function mkWood(nLogs) {
    const L = famL('inspect'), n = nLogs || (6 + (L >= 3 ? 2 : L >= 2 ? 1 : 0)), bagS = S.bag48 || null, B = F.createBag48(bagS);
    let i = 0, J = null, res = [], wait = -1, endT = -1;
    const book = S.book48 || (S.book48 = {}); R.logSeq = R.logSeq || [];
    line(LINE42.wood, `קורה 1 / ${n} · רמה ${L}`);
    if (st.ui.pad) st.ui.pad.classList.add('full');
    const next = () => { const t = B.draw(); S.bag48 = B.state(); R.logSeq.push(t); save42(S); J = F.createLog48(t, Math.random, L); if (st.props.log48) { const c = BARK48[J.state().species]; st.props.log48.material = mat(c[0], 0.95); st.props.log48.rotation.x = 0; } line(i === 0 ? LINE42.wood : LINE42.woodHow, `קורה ${i + 1} / ${n} · רמה ${L}`); };
    next();
    const geo = () => { const w = Math.min(W() * 0.66, 560), h = Math.max(64, Math.min(H() * 0.27, 120)); return { x: (W() - w) / 2, y: Math.max(56, H() * 0.2), w, h }; };
    const zones = () => { const zw = Math.min(170, W() * 0.3), zh = Math.max(52, H() * 0.17), y = H() - zh - 12; return { altar: { x: 12, y, w: zw, h: zh }, out: { x: W() - zw - 12, y, w: zw, h: zh } }; };
    const inZ = (z, x, y) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h;
    const board = () => {
      const s2 = J.state(), G = geo(), c = BARK48[s2.species], f = s2.face, peeled = s2.peeled[f], Z = zones();
      let h = `<defs><linearGradient id="h48sl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6DA" stop-opacity=".42"/><stop offset=".45" stop-color="#FFF" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient><clipPath id="h48cl"><rect x="${G.x}" y="${G.y}" width="${G.w}" height="${G.h}" rx="${G.h / 2}"/></clipPath></defs>`;
      h += `<rect x="${G.x}" y="${G.y}" width="${G.w}" height="${G.h}" rx="${G.h / 2}" fill="${peeled ? '#E7CFA0' : c[0]}"/>`;
      h += `<g clip-path="url(#h48cl)">`;
      const nn = peeled ? 9 : c[2] + 3; for (let k = 0; k < nn; k++) { const yy = G.y + ((k + 0.5) / nn) * G.h, wv = peeled ? 2 : c[3] * 3; h += `<path d="M${G.x} ${yy} Q ${G.x + G.w * 0.3} ${yy + wv + (k % 2 ? 3 : -3)} ${G.x + G.w * 0.55} ${yy} T ${G.x + G.w} ${yy}" fill="none" stroke="${peeled ? '#C9A874' : c[1]}" stroke-width="${peeled ? 1.2 : 2.4}" opacity=".85"/>`; }
      const A = s2.at, T2 = J.T, onF = A.face === f, ax = G.x + A.u * G.w, ay = G.y + A.v * G.h, sz = A.size * G.h * 0.18;
      if (onF && s2.type === 'holes') for (let k = 0; k < 7; k++) { const a2 = A.turn + k * 0.9, r2 = sz * (0.3 + (k % 3) * 0.35); h += `<circle cx="${ax + Math.cos(a2) * r2 * 1.6}" cy="${ay + Math.sin(a2) * r2}" r="${Math.max(1.6, sz * 0.14)}" fill="#1E140C"/>`; }
      if (onF && s2.type === 'gallery' && peeled) for (let k = 0; k < 3; k++) { const yy = ay + (k - 1) * sz * 0.8; h += `<path d="M${ax - sz * 2.4} ${yy} q ${sz * 0.6} ${-sz * 0.5} ${sz * 1.2} 0 t ${sz * 1.2} 0 t ${sz * 1.2} 0 t ${sz * 1.2} 0" fill="none" stroke="#5B3A1C" stroke-width="${Math.max(2.5, sz * 0.22)}" stroke-linecap="round"/>`; }
      if (onF && s2.type === 'knot') h += `<ellipse cx="${ax}" cy="${ay}" rx="${sz * 1.1}" ry="${sz * 0.7}" fill="#4A3524"/><ellipse cx="${ax}" cy="${ay}" rx="${sz * 0.7}" ry="${sz * 0.42}" fill="none" stroke="#7A5C40" stroke-width="2"/><ellipse cx="${ax}" cy="${ay}" rx="${sz * 0.3}" ry="${sz * 0.2}" fill="#2A1C10"/>`;
      if (onF && s2.type === 'scar') h += `<path d="M${ax - sz * 1.8} ${ay} q ${sz * 1.8} ${-sz * 1.1} ${sz * 3.6} 0 q ${-sz * 1.8} ${sz * 1.1} ${-sz * 3.6} 0" fill="#B9A586" stroke="#8A7458" stroke-width="1.5"/>`;
      if (onF && s2.type === 'drop' && !s2.wiped) h += `<path d="M${ax} ${ay - sz} q ${sz} ${sz * 0.2} ${sz * 0.6} ${sz} q ${-sz * 0.4} ${sz * 0.6} ${-sz * 1.1} ${sz * 0.1} q ${-sz * 0.7} ${-sz * 0.6} ${sz * 0.5} ${-sz * 1.1}" fill="#F4F1E6" stroke="#9A988C" stroke-width="1.2"/><circle cx="${ax + sz * 0.2}" cy="${ay}" r="${sz * 0.18}" fill="#5A5A50"/>`;
      h += `<rect x="${G.x}" y="${G.y}" width="${G.w}" height="${G.h}" fill="url(#h48sl)"/></g>`;   // (the side light)
      h += `<ellipse cx="${G.x + G.w}" cy="${G.y + G.h / 2}" rx="${G.h * 0.2}" ry="${G.h / 2}" fill="#D8BC8A" stroke="${c[1]}" stroke-width="3"/>`;
      for (let r = 1; r <= 3; r++) h += `<ellipse cx="${G.x + G.w}" cy="${G.y + G.h / 2}" rx="${G.h * 0.2 * r / 4}" ry="${(G.h / 2) * r / 4}" fill="none" stroke="#B8955E" stroke-width="1"/>`;
      h += leafSvg(s2.species, G.x + 10, G.y + 6, Math.max(1, G.h / 70));
      if (L <= 1) h += `<text x="${G.x + 14}" y="${G.y + G.h + 18}" font-size="13" font-weight="800" fill="#FFF4DC" stroke="#2A1804" stroke-width="3" paint-order="stroke">${esc(F.WOOD48[s2.species].he)}</text>`;
      for (const m of s2.marks) if (m.face === f) h += `<circle cx="${G.x + m.u * G.w}" cy="${G.y + G.h / 2}" r="${G.h * 0.32}" fill="none" stroke="#FFD66E" stroke-width="3" stroke-dasharray="5 4"/>`;
      for (let q = 0; q < 4; q++) h += `<circle cx="${W() / 2 + (q - 1.5) * 16}" cy="${G.y + G.h + 14}" r="5" fill="${q === f ? '#FFD66E' : 'rgba(255,255,255,.35)'}" stroke="#2A1804" stroke-width="1"/>${s2.peeled[q] ? `<circle cx="${W() / 2 + (q - 1.5) * 16}" cy="${G.y + G.h + 14}" r="2" fill="#E7CFA0"/>` : ''}`;
      for (const [k2, z, t2, col] of [['altar', Z.altar, '🔥 למערכה', 'rgba(90,150,70,.78)'], ['out', Z.out, '✗ לא למזבח', 'rgba(170,70,50,.78)']]) h += `<rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="12" fill="${col}" stroke="#FFF4DC" stroke-width="2" data-z="${k2}"/><text x="${z.x + z.w / 2}" y="${z.y + z.h / 2 + 6}" font-size="16" font-weight="900" text-anchor="middle" fill="#FFF">${t2}</text>`;
      return h;
    };
    const job = {
      acting: true, fullPad: true, kind: 'wood', get J() { return J; }, geo, zones, n, res: () => res,
      down() {}, move() {},
      up(a) {
        if (!J || J.state().decided || wait >= 0) return; const dx = a.x - a.x0, dy = a.y - a.y0, px = Math.hypot(dx, dy), Z = zones();
        const z = inZ(Z.altar, a.x, a.y) ? true : inZ(Z.out, a.x, a.y) ? false : null;
        if (z != null && px >= F.DRAG42) {
          const r = J.decide(z, px), s2 = J.state(), T2 = F.WOOD48[s2.type]; res.push(r); buzz42(r === 'ok' ? 'settle' : 'retry'); o.sound && o.sound(r === 'ok' ? (z ? 'wood' : 'thud') : 'grind');
          const isNew = !book[s2.type]; if (isNew) book[s2.type] = { t: Date.now() }; save42(S);
          line(`${r === 'bad' ? 'הוסרה מן המערכה: ' : ''}${T2.he} — ${T2.bad ? 'לא למזבח' : 'כשר למערכה'} · ${T2.why}`, `${isNew ? '📖 עמוד חדש בספר הפגימות · ' : ''}${r === 'ok' ? 'נכון' : r === 'waste' ? 'נפסלה קורה כשרה — כשר' : 'קורה פסולה הונחה — טעון תיקון'}`);
          o.emit && o.emit('h48log', { type: s2.type, r }); wait = 2.6; return;
        }
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) >= F.DRAG42) { const r = J.peel(Math.abs(dx)); if (r === 'peel') { buzz42('tick'); o.sound && o.sound('brush'); } return; }
        if (Math.abs(dy) >= F.DRAG42) { J.turn(dy < 0 ? 1 : -1); if (st.props.log48) st.props.log48.rotation.x += (dy < 0 ? 1 : -1) * Math.PI / 2; buzz42('tick'); return; }
        const G = geo(); if (a.x >= G.x && a.x <= G.x + G.w && a.y >= G.y && a.y <= G.y + G.h) { J.mark((a.x - G.x) / G.w, (a.y - G.y) / G.h); buzz42('tick'); }
      },
      frame(dt) {
        objPlace(true, [{ x: PL.trestle.x, y: PL.trestle.y + 2, z: PL.trestle.z, r: 3 }], 'h48wood');
        svgClear(); if (J && endT < 0) svgAdd(board());
        if (wait >= 0) { wait -= dt; if (wait < 0) { i++; if (i >= n) { svgClear(); grade('wood', F.woodGrade48(res), { x: W() / 2, y: H() * 0.35 }); endT = 1.4; J = null; } else next(); } }
        if (endT >= 0) { endT -= dt; if (endT <= 0) return true; }
        return false;
      },
      end() { svgClear(); if (st.ui.pad) st.ui.pad.classList.remove('full'); },
    };
    return job;
  }
  /** FIT — the GALLERY's beams into the wall's sockets (fam42 createGallery48): chips "קורת פינה" ×2 and "קורה" ×3 dragged to their sockets
   *  (the corner beams first — else blocked, free), each then pushed in: the push's angle is the beam's — straight, it locks with a wooden
   *  click; crooked, it stops at the rim. From below, looking up at the sockets (ש3) */
  function mkBeams(side = 'N', onDone) {
    const L = famL('fit'), J = F.createGallery48(L), W2 = side === 'N' ? PL.wallY : PL.wallS, sz = side === 'N' ? 1 : -1, socks = (st.props.sock48 && st.props.sock48[side]) || [];
    line(LINE42.beams, `רמה ${L}`);
    const pile = st.ui.pile; pile.innerHTML = ''; pile.hidden = false; let cur = -1, endT = -1; const beams = [];
    const sockAt = (i) => proj(W2.x + SOCK48[i], W2.y + 11.5, W2.z);
    const endAt = (i) => proj(W2.x + SOCK48[i], W2.y + 11.0, W2.z + sz * 4.2);
    const left = { corner: 2, next: 3 };
    const chips = ['corner', 'next'].map((kd) => { const b = el('h42-it h48-beam', '', 'button'); b.type = 'button'; b.dataset.kind = kd; pile.appendChild(b); return b; });
    const paint = () => chips.forEach((b) => { const kd = b.dataset.kind; b.textContent = `${kd === 'corner' ? '┗ קורת פינה' : '━ קורה'} ×${left[kd]}`; b.style.display = left[kd] > 0 && cur < 0 ? '' : 'none'; });
    paint();
    chips.forEach((b) => dragItem(b, (drop) => {
      if (cur >= 0 || J.state().done) return false; let on = -1, bd = 1e9; for (let i = 0; i < 5; i++) { const p2 = sockAt(i); if (!p2) continue; const d = Math.hypot(drop.x - p2.x, drop.y - p2.y); if (d < bd) { bd = d; on = i; } }
      if (bd > Math.max(56, H() * 0.15)) on = -1; const kd = b.dataset.kind, r = J.place(on, kd, { dragPx: drop.px });
      if (r === 'ok') { left[kd]--; cur = on; const m = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.5, 4.2), mat('#8A6038', 0.8)); m.position.set(W2.x + SOCK48[on], W2.y + 11.4, W2.z + sz * 3.4); m.rotation.y = 0.18 * (on % 2 ? 1 : -1); st.props.root.add(m); beams[on] = m; paint(); line(LINE42.beamPush, `רמה ${L}`); buzz42('settle'); return true; }
      b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); buzz42('retry');
      if (r === 'blocked') line(LINE42.beamBlocked, `טעויות סדר ${J.state().order}`); else if (r === 'wrong') line(LINE42.beamWrong, `רמה ${L}`);
      return false;
    }));
    let anim = null;
    return {
      acting: true, fullPad: true, kind: 'beams', J, side, sockAt, endAt, chips, cur: () => cur,
      down() {}, move() {},
      up(a) {
        if (cur < 0 || anim) return; const p0 = endAt(cur), p1 = sockAt(cur); if (!p0 || !p1) return;
        const r = J.push(cur, a.x - a.x0, a.y - a.y0, p1.x - p0.x, p1.y - p0.y);
        if (r === 'lock') { anim = { i: cur, t: 0 }; o.sound && o.sound('wood'); buzz42('settle'); }
        else if (r === 'rim') { anim = { i: cur, t: 0, rim: true }; buzz42('retry'); line(LINE42.beamRim, `רמה ${L}`); }
      },
      view() { const D = Math.max(needD() + 2, 30); return { p: [W2.x + 4, W2.y + 3.5, W2.z - sz * D], t: [W2.x, W2.y + 10, W2.z] }; },   // (ש3: from below, looking up at the sockets)
      frame(dt) {
        objPlace(true, [{ x: W2.x, y: W2.y + 11, z: W2.z, r: 12 }], 'h48beams');
        if (anim) { anim.t += dt; const m = beams[anim.i]; if (m) { if (anim.rim) { m.position.z = W2.z + sz * (3.4 - 0.6 * Math.sin(Math.min(1, anim.t / 0.4) * Math.PI)); if (anim.t > 0.45) { anim = null; } } else { const u = Math.min(1, anim.t / 0.35); m.position.z = W2.z + sz * (3.4 - 1.5 * u); m.rotation.y *= 1 - u; if (u >= 1) { anim = null; cur = -1; paint(); if (!J.state().done) line(LINE42.beams, `רמה ${L}`); } } } }
        svgClear();
        for (let i = 0; i < 5; i++) { const p2 = sockAt(i); if (!p2) continue; const st2 = J.state(), lk = st2.locked[i], cor = st2.kinds[i] === 'corner'; svgAdd(`<rect x="${p2.x - 12}" y="${p2.y - 14}" width="24" height="28" rx="4" fill="${lk ? 'rgba(232,181,49,.55)' : 'rgba(0,0,0,.25)'}" stroke="${cur === i ? '#FFF' : '#FFD66E'}" stroke-width="${cur === i ? 3 : 2}"/>${cor && !lk ? `<text x="${p2.x}" y="${p2.y - 20}" font-size="12" font-weight="800" text-anchor="middle" fill="#FFF4DC" stroke="#2A1804" stroke-width="3" paint-order="stroke">פינה</text>` : ''}`); }
        if (cur >= 0 && !anim && J.state().L <= 1) { const p0 = endAt(cur), p1 = sockAt(cur); if (p0 && p1) svgAdd(`<line x1="${p0.x}" y1="${p0.y}" x2="${p1.x}" y2="${p1.y}" stroke="#FFD66E" stroke-width="3" stroke-dasharray="6 5"/>`); }
        if (J.state().done && endT < 0 && !anim) { endT = 1.1; if (onDone) onDone(J.state().q); else grade('beams', J.state().q, sockAt(2)); }
        if (endT >= 0) { endT -= dt; if (endT <= 0) { svgClear(); return true; } }
        return false;
      },
      end() { pile.innerHTML = ''; svgClear(); },
    };
  }
  /** TENON & PEG (fam42 createPeg48): a detail over the scene — the tenon slid into its mortise along the arrow (its angle), then taps on the
   *  peg with the mallet, the pitch rising as it goes in; when it locks the sound changes — stop (a tap after it splits the peg: a new one,
   *  free) */
  function mkPegs(nPegs, side = 'N', onDone) {
    const L = famL('fit'), n = nPegs || 3; let i = 0, P = F.createPeg48(L), qs2 = [], endT = -1, flash = 0;
    const W2 = side === 'N' ? PL.wallY : PL.wallS, sz = side === 'N' ? 1 : -1;
    if (MODE === 'stage' && !st.props.planks48) { st.props.planks48 = []; }
    const plankFor = (k) => { const m = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.3, 4.6), mat('#B08A5E', 0.85)); m.position.set(W2.x - 8.25 + k * 5.5, W2.y + 12.4, W2.z + sz * 2.4); st.props.root.add(m); return m; };
    if (!(st.props['pl' + side] || []).length) st.props['pl' + side] = [0, 1, 2].map(plankFor);   // (the crews lay the planks; he pegs them)
    line(LINE42.tenon, `יתד ${i + 1} / ${n} · רמה ${L}`);
    const geo = () => { const w = Math.min(W() * 0.5, 380), h = Math.max(110, Math.min(H() * 0.44, 190)); return { x: (W() - w) / 2, y: Math.max(52, H() * 0.16), w, h }; };
    const arrow = () => { const G = geo(); return { x0: G.x + G.w * 0.12, y0: G.y + G.h * 0.62, x1: G.x + G.w * 0.5, y1: G.y + G.h * 0.62 }; };
    const det = () => {
      const G = geo(), s2 = P.state(), A = arrow(), tx = s2.tenon ? G.x + G.w * 0.38 : G.x + G.w * 0.1, py = G.y + G.h * 0.1 + s2.depth * G.h * 0.36;
      let h = `<rect x="${G.x - 6}" y="${G.y - 6}" width="${G.w + 12}" height="${G.h + 12}" rx="12" fill="rgba(40,28,14,.78)" stroke="#E2B65A" stroke-width="2"/>`;
      h += `<rect x="${G.x + G.w * 0.5}" y="${G.y + G.h * 0.45}" width="${G.w * 0.46}" height="${G.h * 0.4}" fill="#9C7448" stroke="#5A3F24" stroke-width="2"/><rect x="${G.x + G.w * 0.5}" y="${G.y + G.h * 0.55}" width="${G.w * 0.16}" height="${G.h * 0.14}" fill="#3A2818"/>`;   // (the beam and its mortise)
      h += `<rect x="${tx - G.w * 0.4}" y="${G.y + G.h * 0.47}" width="${G.w * 0.4}" height="${G.h * 0.36}" fill="#C79E6C" stroke="#6E4E2C" stroke-width="2"/><rect x="${tx}" y="${G.y + G.h * 0.56}" width="${G.w * 0.15}" height="${G.h * 0.12}" fill="#D9B27E" stroke="#6E4E2C" stroke-width="2"/>`;   // (the plank and its tenon)
      if (!s2.tenon) h += `<line x1="${A.x0}" y1="${A.y0 + G.h * 0.3}" x2="${A.x1}" y2="${A.y1 + G.h * 0.3}" stroke="#FFD66E" stroke-width="4" stroke-dasharray="7 5"/><text x="${A.x1 + 12}" y="${A.y1 + G.h * 0.3 + 6}" font-size="22" fill="#FFD66E">➜</text>`;
      else { const pc = s2.locked ? '#E8B531' : '#D8C098'; h += `<rect x="${G.x + G.w * 0.555}" y="${py}" width="${G.w * 0.05}" height="${G.h * 0.4}" fill="${pc}" stroke="#5A3F24" stroke-width="2"/><rect x="${G.x + G.w * 0.53}" y="${py - 8}" width="${G.w * 0.1}" height="8" fill="${pc}" stroke="#5A3F24" stroke-width="1.5"/>`;
        h += `<text x="${G.x + G.w * 0.82}" y="${G.y + G.h * 0.3}" font-size="28" text-anchor="middle" fill="#FFF4DC">🔨</text>`; for (let q = 0; q < 6; q++) h += `<rect x="${G.x + 12 + q * 12}" y="${G.y + G.h - 18 - q * 4}" width="8" height="${6 + q * 4}" fill="${s2.depth >= (q + 1) / 6 ? '#FFD66E' : 'rgba(255,255,255,.2)'}"/>`; }
      if (flash > 0) h += `<circle cx="${G.x + G.w * 0.58}" cy="${G.y + G.h * 0.5}" r="${30 + (1 - flash) * 30}" fill="none" stroke="#FFD66E" stroke-width="4" opacity="${flash}"/>`;
      return h;
    };
    return {
      acting: true, fullPad: true, kind: 'pegs', get P() { return P; }, i: () => i, n, arrow, geo,
      down() {}, move() {},
      up(a) {
        const s2 = P.state(); if (s2.done || endT >= 0) return; const dx = a.x - a.x0, dy = a.y - a.y0, A = arrow();
        if (!s2.tenon) { const r = P.tenon(dx, dy, A.x1 - A.x0, A.y1 - A.y0); if (r === 'in') { buzz42('settle'); o.sound && o.sound('wood'); line(LINE42.pegTap, `יתד ${i + 1} / ${n} · רמה ${L}`); } else if (r === 'rim') { buzz42('retry'); line('השגם נעצר — לאורך החץ · המחשה', `רמה ${L}`); } return; }
        if (Math.hypot(dx, dy) >= F.DRAG42) return;
        const r = P.tap(); if (r === 'lock') { flash = 1; tone(P.pitch(), 0.22, 'square'); o.sound && o.sound('wood'); buzz42('settle'); } else if (r === 'split') { buzz42('retry'); o.sound && o.sound('crack'); line(LINE42.pegSplit, `יתד ${i + 1} / ${n}`); } else if (r === 'in') { tone(P.pitch()); buzz42('tick'); }
      },
      view() { const D = Math.max(needD() + 2, 30); return { p: [W2.x + 4, W2.y + 3.5, W2.z - sz * D], t: [W2.x, W2.y + 10, W2.z] }; },
      frame(dt) {
        objPlace(true, [{ x: W2.x, y: W2.y + 12, z: W2.z + sz * 2, r: 9 }], 'h48pegs');
        P.step(dt); flash = Math.max(0, flash - dt * 1.6);
        svgClear(); if (endT < 0) svgAdd(det());
        if (P.state().done && endT < 0) { qs2.push(P.state().q); i++; if (i >= n) { const q = qs2.reduce((a2, b2) => a2 + b2, 0) / qs2.length; endT = 1.1; svgClear(); if (onDone) onDone(q); else grade('pegs', q, { x: W() / 2, y: H() * 0.35 }); } else { P = F.createPeg48(L); line(LINE42.tenon, `יתד ${i + 1} / ${n} · רמה ${L}`); } }
        if (endT >= 0) { endT -= dt; if (endT <= 0) return true; }
        return false;
      },
      end() { svgClear(); },
    };
  }
  /** the conclusion: one corner of the gallery — the south wall's stretch — entirely his: the beams (their order), the planks, the pegs */
  function mkCorner48() {
    let sub = null, phase = 'beams', qB = 1, qP = 1, endT = -1, planks = 0; const W2 = PL.wallS, sz = -1;
    line(LINE42.corner48);
    const pile = st.ui.pile;
    const startPlanks = () => { phase = 'planks'; line(LINE42.planks); pile.innerHTML = ''; pile.hidden = false; const b = el('h42-it h48-plank', '▭ קרש ×3', 'button'); b.type = 'button'; pile.appendChild(b);
      dragItem(b, (drop) => { const a = proj(W2.x - 12, W2.y + 12.4, W2.z + sz * 2.4), c = proj(W2.x + 12, W2.y + 12.4, W2.z + sz * 2.4); if (!a || !c || drop.px < F.DRAG42) return false; const l = Math.min(a.x, c.x) - 30, r2 = Math.max(a.x, c.x) + 30, yy = (a.y + c.y) / 2; if (drop.x < l || drop.x > r2 || Math.abs(drop.y - yy) > Math.max(60, H() * 0.18)) return false;
        const m = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.3, 4.6), mat('#B08A5E', 0.85)); m.position.set(W2.x - 5.5 + planks * 5.5, W2.y + 12.4, W2.z + sz * 2.4); st.props.root.add(m); (st.props.plS = st.props.plS || []).push(m); planks++; o.sound && o.sound('wood'); buzz42('settle'); b.textContent = `▭ קרש ×${3 - planks}`;
        if (planks >= 3) { pile.innerHTML = ''; phase = 'pegs'; sub = mkPegs(2, 'S', (q) => { qP = q; }); } return true; }); };
    sub = mkBeams('S', (q) => { qB = q; });
    return {
      acting: true, fullPad: true, kind: 'corner48', sub: () => sub, phase: () => phase,
      down(a) { if (sub && sub.down) sub.down(a); }, move(a) { if (sub && sub.move) sub.move(a); }, up(a) { if (sub && phase !== 'planks') sub.up(a); },
      view(h) { return sub && sub.view ? sub.view(h) : null; },
      frame(dt) {
        if (phase === 'planks') { objPlace(true, [{ x: W2.x, y: W2.y + 12, z: W2.z - 2, r: 12 }], 'h48planks'); svgClear(); const a = proj(W2.x - 8.2, W2.y + 12.4, W2.z + sz * 2.4), c = proj(W2.x + 8.2, W2.y + 12.4, W2.z + sz * 2.4); if (a && c) svgAdd(`<line x1="${a.x}" y1="${a.y}" x2="${c.x}" y2="${c.y}" stroke="#FFD66E" stroke-width="6" stroke-dasharray="10 8" opacity=".8"/>`); return false; }
        if (sub && sub.frame(dt)) { if (phase === 'beams') { sub = null; startPlanks(); return false; } if (phase === 'pegs' && endT < 0) { grade('corner', (qB + 1 + qP) / 3, { x: W() / 2, y: H() * 0.35 }); endT = 1.2; sub = null; } }
        if (endT >= 0) { endT -= dt; if (endT <= 0) return true; }
        return false;
      },
      end() { pile.innerHTML = ''; svgClear(); },
    };
  }
  /** the walk along the gallery (ש2) over the quiet court: held, it goes on; let go, it stands; after 6 s it walks by itself */
  function mkWalk48() {
    const W2 = PL.wallY, y0 = W2.y + 12.4 + 4.4, z = W2.z + 2.2; let x = W2.x - 11, hold = false, idle = 0, endT = -1;
    line(LINE42.walk48); try { stages.hero.show(false); } catch (e) { /* */ }
    if (st.ui.pad) st.ui.pad.classList.add('full');
    return {
      acting: true, fullPad: true, kind: 'walk48', x: () => x,
      down() { hold = true; }, move() {}, up() { hold = false; },
      view() { return { p: [x, y0, z], t: [x + 9, y0 - 3.2, z + 5] }; },
      frame(dt) {
        objPlace(true, [{ x, y: y0, z, r: 2 }], 'h48walk');
        idle = hold ? 0 : idle + dt; if (hold || idle > 6) x += dt * 2.6;
        if (x >= W2.x + 11 && endT < 0) { endT = 1.0; R.walked48 = 1; }
        if (endT >= 0) { endT -= dt; if (endT <= 0) return true; }
        return false;
      },
      end() { if (st.ui.pad) st.ui.pad.classList.remove('full'); try { stages.hero.show(true); } catch (e) { /* */ } },
    };
  }
  /* ── build 47 ── stage 04's acts ── */
  const gateView = (cy, D0) => { const G = PL.gate, g0 = G.y, D = Math.max(needD() + 2, D0 || 0, 15.5 / tanV()); return { p: [G.x - 3, g0 + 6, G.z - D], t: [G.x, g0 + cy, G.z] }; };   // (ש5 low, from the north: the whole gate and him; him ≤ 45 % at needD)
  const sgnR47 = () => { const G = PL.gate, a = proj(G.x, G.y + 10, G.z), b = proj(G.x + 1, G.y + 10, G.z); return a && b && b.x < a.x ? -1 : 1; };   // (+x toward the screen's right: 1)
  const level47 = (s, L) => {   // the bubble level, big, under the line
    const cx = W() / 2, cy = H() - Math.max(38, H() * 0.13), hw = Math.min(150, W() * 0.24), /* (at the screen's bottom: at the top it hid the lintel) */ bx = cx - (s.tilt / F.LINTEL47.lim) * (hw - 14), cz = (s.centre / F.LINTEL47.lim) * (hw - 14);
    let h = `<rect x="${cx - hw}" y="${cy - 15}" width="${2 * hw}" height="30" rx="15" fill="rgba(210,235,190,.9)" stroke="#5B4A2A" stroke-width="3"/><rect x="${cx - cz - 13}" y="${cy - 15}" width="${2 * cz + 26}" height="30" fill="${L <= 1 ? 'rgba(90,170,80,.35)' : 'none'}" stroke="#5B4A2A" stroke-width="2" stroke-dasharray="${L <= 1 ? '0' : '4 3'}"/><ellipse cx="${bx}" cy="${cy}" rx="13" ry="10" fill="#FFFDF2" stroke="#9AB98A" stroke-width="2"/>`;
    if (s.out) { const right = s.tilt > 0; h += `<text x="${cx + (right ? hw + 26 : -hw - 26)}" y="${cy + 9}" font-size="30" font-weight="900" text-anchor="middle" fill="#FFD66E" stroke="#2A1804" stroke-width="3" paint-order="stroke">${right ? '→' : '←'}</text>`; }
    return h;
  };
  /** LIFT on two cranes: the lintel (or the heavy leaf): hold — it rises; slide — the pull between the crews; the bubble; then set (the lintel) */
  function lift47(J, kind, done) {
    const G = PL.gate, g0 = G.y, ob = kind === 'lintel' ? st.props.lintel : st.props.leaves[1], L = J.state().L;
    let x0 = null, lowerT = -1, liftT = 0;
    if (st.ui.pad) st.ui.pad.classList.add('full'); if (st.props.ropes47) st.props.ropes47.visible = true;
    const ropes = (a, b) => { const r = st.props.ropes47; if (!r) return; const P2 = r.geometry.attributes.position, tip = [-1, 1].map((sx) => [G.x + sx * 8.7, g0 + 30.6, G.z - 1.6]); P2.setXYZ(0, ...tip[0]); P2.setXYZ(1, ...a); P2.setXYZ(2, ...tip[1]); P2.setXYZ(3, ...b); P2.needsUpdate = true; };
    const place = () => {
      const s = J.state(), sr = sgnR47();
      if (kind === 'lintel') {
        const y = lowerT >= 0 ? g0 + GATE47.H + 0.75 + 1.6 * Math.max(0, 1 - lowerT / 0.5) : g0 + 0.75 + s.y * (GATE47.H + 1.6), x = G.x + s.dx * sr, z = G.z - 4 * (1 - s.y), rz = -sr * s.tilt * 0.2;
        ob.position.set(x, y, z); ob.rotation.z = rz; const c = Math.cos(rz), sn = Math.sin(rz), hl = GATE47.lw / 2 - 0.6; ropes([x - hl * c, y - hl * sn + 0.75, z], [x + hl * c, y + hl * sn + 0.75, z]);
      } else {
        const sx = ob.userData.sx, u = s.y, px2 = G.x + sx * GATE47.half; ob.rotation.x = (-Math.PI / 2 + 0.02) * (1 - Math.min(1, u / 0.45)); ob.rotation.z = -sr * s.tilt * 0.2;
        ob.position.set(px2, g0 + 0.5 + 2.4 * u, G.z - 7 * (1 - u)); const top = g0 + 0.5 + 2.4 * u + GATE47.leafH * Math.min(1, u / 0.45); ropes([px2 - sx * 0.6, top, ob.position.z], [px2 - sx * (GATE47.leafW - 0.6), top, ob.position.z]);
      }
    };
    place();
    return {
      down(a) { if (J.state().phase === 'lift') { x0 = a.x; J.hold(true); } },
      move(a) { if (J.state().phase === 'lift' && x0 != null) J.slide((x0 - a.x) / (W() * 0.22)); },
      up(a) {
        const s = J.state();
        if (s.phase === 'lift') { J.hold(false); x0 = null; return; }
        if (kind !== 'lintel' || s.done || lowerT >= 0) return;
        const G2 = PL.gate, p0 = proj(G2.x, G2.y + 20, G2.z), p1 = proj(G2.x + 1, G2.y + 20, G2.z), ppa = p0 && p1 ? Math.abs(p1.x - p0.x) : 0;
        const r = J.set(a.x - a.x0, ppa);
        if (r === 'ok') { lowerT = 0; buzz42('settle'); o.sound && o.sound('thud'); }
        else if (r === 'miss') { buzz42('retry'); line(LINE42.lintelMiss, `רמה ${L}`); setTimeout(() => { if (!J.state().done) line(LINE42.lintelSet, `רמה ${L}`); }, 2200); }
      },
      frame(dt) {
        const s = J.state(), was = s.phase; J.step(dt); place();
        objPlace(true, [{ x: G.x, y: g0 + 10, z: G.z, r: 8 }], 'h47lift');
        svgClear(); if (s.phase === 'lift' || (kind === 'lintel' && !s.done)) svgAdd(level47(s, L));
        if (s.phase === 'lift') { liftT += dt; if (s.out && !this.outSaid) { this.outSaid = 1; line(LINE42.lintelOut, `רמה ${L}`); buzz42('retry'); } else if (!s.out && this.outSaid) { this.outSaid = 0; line(kind === 'lintel' ? LINE42.lintel : LINE42.leaf7, `רמה ${L}`); } }
        if (was === 'lift' && s.phase === 'set') { if (kind === 'lintel') line(LINE42.lintelSet, `רמה ${L}`); else { done(); return false; } }
        if (lowerT >= 0) { lowerT += dt; if (lowerT > 0.5 && !this.graded) { this.graded = 1; if (st.props.ropes47) st.props.ropes47.visible = false; done(); } }
        return false;
      },
    };
  }
  function mkLintel() {
    const LL = famL('lift'), J = F.createLintel47(LL); line(LINE42.lintel, `רמה ${LL}`);
    let endT = -1; const G = PL.gate;
    const C = lift47(J, 'lintel', () => { grade('lintel', J.state().q, proj(G.x, G.y + 21, G.z)); endT = 1.2; });
    return { acting: true, fullPad: true, J, kind: 'lintel', down: (a) => C.down(a), move: (a) => C.move(a), up: (a) => C.up(a), sgn: sgnR47,
      ppa: () => { const p0 = proj(G.x, G.y + 20, G.z), p1 = proj(G.x + 1, G.y + 20, G.z); return p0 && p1 ? Math.abs(p1.x - p0.x) : 20; },
      view() { return gateView(13); },   // (the lintel at the posts' top, 21.6 amot, in the frame: the shot at the top had it out)
      frame(dt) { C.frame(dt); if (endT >= 0) { endT -= dt; if (endT <= 0) { svgClear(); return true; } } return false; },
      end() { svgClear(); if (st.ui.pad) st.ui.pad.classList.remove('full'); } };
  }
  /** FIT: the door leaf on its pivot — the pin into the socket (a drag down; its angle), then a flick swings it (bound — the wedge); the heavy
   *  leaf of the seventh gate first lifted on the two cranes (level 3, swaying) */
  function mkLeaf(idx, heavy) {
    const LF = famL('fit'), J = F.createLeaf47(LF), G = PL.gate, g0 = G.y, piv = st.props.leaves[idx], sx = piv.userData.sx, pivX = G.x + sx * GATE47.half;
    const LJ = heavy ? F.createLintel47(Math.max(3, famL('lift')), { heavy: true }) : null; let qLift = null, phase = heavy ? 'lift' : 'pin', anim = null, endT = -1, flickT0 = 0;
    const hang = () => { piv.rotation.set(0, 0, 0); piv.position.set(pivX, g0 + 0.5 + 2.4, G.z); };
    const C = heavy ? lift47(LJ, 'leaf', () => { const s = LJ.state(), f = s.faults + Math.floor(s.off / F.LINTEL47.offFault); qLift = f <= 0 ? 1 : f <= 2 ? 0.65 : 0.3; phase = 'pin'; if (st.props.ropes47) st.props.ropes47.visible = false; hang(); line(LINE42.leafPin, `רמה ${LF}`); }) : null;
    if (!heavy) { hang(); line(LINE42.leafPin, `רמה ${LF}`); } else line(LINE42.leaf7, `רמה ${LJ.state().L}`);
    if (st.ui.pad) st.ui.pad.classList.add('full');
    const pile = st.ui.pile; pile.innerHTML = ''; pile.hidden = false;
    const wedgeB = el('h42-it h47-wedge', '◢ טריז', 'button'); wedgeB.type = 'button'; wedgeB.hidden = true; wedgeB.style.display = 'none'; pile.appendChild(wedgeB);   // (display: the class's flex beat [hidden])
    wedgeB.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); if (J.wedge() === 'ok') { wedgeB.hidden = true; wedgeB.style.display = 'none'; buzz42('mallet'); o.sound && o.sound('wedge'); anim = { k: 'shut', t: 0, from: J.state().open || 0.3 }; line(LINE42.leafSwing, `רמה ${LF}`); } });
    const openOf = (v) => -sx * 1.3 * v;
    return {
      acting: true, fullPad: true, J, LJ, kind: 'leaf', phase: () => phase, socket: () => proj(pivX - sx * 0.25, g0 + 0.1, G.z), pinAt: () => proj(pivX - sx * 0.25, piv.position.y - 0.6, G.z), wedgeB,
      down(a) { if (phase === 'lift') C.down(a); else flickT0 = now(); },
      move(a) { if (phase === 'lift') C.move(a); },
      up(a) {
        if (phase === 'lift') { C.up(a); return; }
        const dx = a.x - a.x0, dy = a.y - a.y0;
        if (phase === 'pin' && !anim) { const r = J.pin(dx, dy); if (r === 'rim') { anim = { k: 'rim', t: 0, tilt: Math.sign(dx || 1) * 0.16 }; buzz42('retry'); line(LINE42.leafRim, `זווית ${Math.round(J.state().angle)}° · רמה ${LF}`); } else if (r === 'seated') { anim = { k: 'seat', t: 0 }; buzz42('settle'); o.sound && o.sound('wood'); } return; }
        if (phase === 'swing' && !anim) { const r = J.flick(Math.abs(dx), Math.max(0.01, now() - flickT0));
          if (r === 'binds') { anim = { k: 'bind', t: 0 }; buzz42('retry'); o.sound && o.sound('grind'); line(LINE42.leafBind, `רמה ${LF}`); wedgeB.hidden = false; wedgeB.style.display = ''; }
          else if (r === 'ok' || r === 'slam') { anim = { k: r, t: 0 }; o.sound && o.sound('creak'); }
          else if (r === 'weak') { anim = { k: 'weak', t: 0 }; } }
      },
      view() { if (phase === 'lift') return gateView(12); const v = gateView(10); v.t[0] = pivX - sx * GATE47.leafW / 2; v.p[0] = v.t[0] - 2; return v; },
      frame(dt) {
        objPlace(true, [{ x: pivX - sx * GATE47.leafW / 2, y: g0 + 9, z: G.z, r: 5 }], 'h47leaf');
        if (phase === 'lift') { C.frame(dt); return false; }
        svgClear();
        if (phase === 'pin' && J.state().L <= 1 && !anim) { const a2 = this.pinAt(), b2 = this.socket(); if (a2 && b2) svgAdd(`<line x1="${a2.x}" y1="${a2.y}" x2="${b2.x}" y2="${b2.y}" stroke="#FFD66E" stroke-width="3" stroke-dasharray="6 5"/><circle cx="${b2.x}" cy="${b2.y}" r="9" fill="none" stroke="#FFD66E" stroke-width="3"/>`); }
        if (anim) {
          anim.t += dt; const t = anim.t;
          if (anim.k === 'rim') { const u = t < 0.3 ? t / 0.3 : Math.max(0, 1 - (t - 0.5) / 0.4); piv.position.y = g0 + 0.5 + 2.4 - 1.9 * u; piv.rotation.z = anim.tilt * u; if (t > 0.9) { anim = null; hang(); } }
          else if (anim.k === 'seat') { const u = Math.min(1, t / 0.45); piv.position.y = g0 + 0.5 + 2.4 * (1 - u); if (u >= 1) { anim = null; phase = 'swing'; line(LINE42.leafSwing, `רמה ${LF}`); } }
          else if (anim.k === 'bind') { piv.rotation.y = openOf(0.3 * Math.min(1, t / 0.35)); if (t > 0.4) anim = null; }
          else if (anim.k === 'shut') { piv.rotation.y = openOf(anim.from * Math.max(0, 1 - t / 0.5)); if (t > 0.5) anim = null; }
          else if (anim.k === 'weak') { piv.rotation.y = openOf(0.15 * Math.sin(Math.min(1, t / 0.8) * Math.PI)); if (t > 0.8) { anim = null; line('חזק מעט יותר — הנפה מהירה · המחשה', `רמה ${LF}`); } }
          else { const hard = anim.k === 'slam', T1 = 0.8, T2 = hard ? 0.35 : 1.7; const v = t < T1 ? Math.sin((t / T1) * Math.PI / 2) : Math.max(0, 1 - (t - T1) / T2); piv.rotation.y = openOf(v);
            if (t > T1 + T2 && !this.graded) { this.graded = 1; if (hard) { buzz42('retry'); o.sound && o.sound('thud'); } else o.sound && o.sound('settle');
              const q = heavy ? ((qLift == null ? 1 : qLift) + J.state().q) / 2 : J.state().q; grade(heavy ? 'leaf7' : 'leaf', q, proj(pivX - sx * 2.4, g0 + 12, G.z)); endT = 1.3; } }
        }
        if (endT >= 0) { endT -= dt; if (endT <= 0) return true; }
        return false;
      },
      end() { pile.innerHTML = ''; svgClear(); if (st.ui.pad) st.ui.pad.classList.remove('full'); },
    };
  }
  /** "שבעת השערים" (the moment, upgraded): top-down (ש8) over the built court — drag each name to its gate; as each is set its leaves close
   *  with their own sound; no mistake — מהודר (מדות א, ד–ה) */
  function mkNames() {
    const N = F.createNames47(['mayim', 'nitzotz', 'nikanor', 'delek', 'korban', 'bechorot', 'moked']), SND = { delek: 'gate26', bechorot: 'bolt26', mayim: 'splash', moked: 'wood', korban: 'creak', nitzotz: 'bell', nikanor: 'thud' };
    line(LINE42.names);
    const pile = st.ui.pile; pile.innerHTML = ''; pile.hidden = false;
    const chip = el('h42-it h47-name', '', 'button'); chip.type = 'button'; pile.appendChild(chip);
    const paint = () => { const c = N.current(); chip.textContent = c ? c.n : ''; chip.hidden = !c; };
    paint();
    (st.props.gl47 || []).forEach((pr) => pr.forEach((pv) => { pv.visible = true; pv.rotation.y = pv.userData.sx * 1.1; }));
    const at = (q) => proj(q.x, gy(q.x, q.z) + 9, q.z);
    const closing = []; let endT = -1;
    dragItem(chip, (drop) => {
      if (N.state().done) return false;
      let on = null, bd = 1e9; for (const q of F.GATES47) { const p2 = at(q); if (!p2) continue; const d = Math.hypot(drop.x - p2.x, drop.y - p2.y); if (d < bd) { bd = d; on = q.id; } }
      if (bd > Math.max(46, H() * 0.12)) on = null;
      const want = N.current(), r = N.drop({ dragPx: drop.px, on });
      if (r === 'ok') { const i = F.GATES47.findIndex((q) => q.id === want.id); closing.push({ i, t: 0 }); o.sound && o.sound(SND[want.id] || 'wood'); buzz42('settle'); paint(); if (N.state().done) { pile.innerHTML = ''; endT = 2.2; grade('names', N.state().q, { x: W() / 2, y: H() * 0.4 }); } else line(LINE42.names, `שער ${N.state().i + 1} / 7`); return true; }
      if (r === 'wrong') { chip.classList.remove('no'); void chip.offsetWidth; chip.classList.add('no'); buzz42('retry'); line(`${want.why} · מדות א, ד–ה`, `טעויות ${N.state().mistakes}`); }
      return false;
    });
    return {
      acting: true, kind: 'names', N, chip, at, dragOnly: true,
      down() {}, move() {}, up() {},
      view() { const c = { x: -93, z: 0 }, Hh = Math.max(230, 98 / tanV()); return { p: [c.x, Hh, c.z - Hh * 0.18], t: [c.x, 0, c.z] }; },   // (ש8: over the court, north at the screen's bottom)
      frame(dt) {
        objPlace(true, [{ x: -93, y: 8, z: 0, r: 90 }], 'h47names');
        for (const c of closing) { c.t += dt; const u = Math.min(1, c.t / 0.9), e = 1 - (1 - u) * (1 - u); (st.props.gl47[c.i] || []).forEach((pv) => { pv.rotation.y = pv.userData.sx * 1.1 * (1 - e); }); }
        svgClear(); const S2 = N.state();
        for (const q of F.GATES47) { const p2 = at(q); if (!p2) continue; const set = S2.set.includes(q.id); svgAdd(`<circle cx="${p2.x}" cy="${p2.y}" r="${set ? 9 : 16}" fill="${set ? '#E8B531' : 'rgba(255,214,110,.22)'}" stroke="#FFD66E" stroke-width="3"/>${set ? `<text x="${p2.x}" y="${p2.y - 14}" font-size="12" font-weight="800" text-anchor="middle" fill="#FFF4DC" stroke="#2A1804" stroke-width="3" paint-order="stroke">${esc(q.n)}</text>` : ''}`); }
        if (endT >= 0) { endT -= dt; if (endT <= 0) { svgClear(); return true; } }
        return false;
      },
      end() { pile.innerHTML = ''; svgClear(); },
    };
  }
  /** ── build 46 ── the WARNING STONES: held, he walks along the soreg (the side he holds — the way he goes); "הציבו כאן" sets a stone where he
   *  stands; after the last — the real gaps (gold) against the even ones (faint), and the grade */
  function mkWarn() {
    const L = famL('place'), J = F.createSpacing46(L), A = PL.warnA, len = J.state().len, z = A.z - 2.3;
    line(LINE42.warn, `אבנים ${J.state().n} · רמה ${L}`);
    try { const h = hero(); stages.hero.setPos(A.x + 0.2, z, 0); } catch (e) { /* */ }
    if (st.ui.pad) st.ui.pad.classList.add('full');
    const pile = st.ui.pile; pile.innerHTML = ''; pile.hidden = false;
    const btn = el('h42-it h46-set', 'הציבו כאן', 'button'); btn.type = 'button'; pile.appendChild(btn);
    const stele = (x, ghost) => { const m = new THREE.Group(), body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.15, 0.22), ghost ? new THREE.MeshBasicMaterial({ color: '#FFD66E', transparent: true, opacity: 0.35, depthWrite: false }) : mat('#E9E1CF', 0.7)); body.position.y = 0.58; m.add(body);
      if (!ghost && greek) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), new THREE.MeshBasicMaterial({ map: greek, transparent: true })); f.position.set(0, 0.72, -0.12); f.rotation.y = Math.PI; m.add(f); }
      st.props.steles = (st.props.steles || []).concat([m]); return addP(m, x, gy(x, A.z), A.z); };
    let greek = null; try { if (doc) { const cv = doc.createElement('canvas'); cv.width = 256; cv.height = 160; const c = cv.getContext('2d'); c.fillStyle = '#3A2A18'; c.font = 'bold 22px serif'; c.textAlign = 'center'; ['ΜΗΘΕΝΑ ΑΛΛΟ', 'ΓΕΝΗ ΕΙΣΠΟΡΕΥ', 'ΕΣΘΑΙ ΕΝΤΟΣ', 'ΤΟΥ ΠΕΡΙ ΤΟ', 'ΙΕΡΟΝ ΤΡΥΦΑ'].forEach((t, i) => c.fillText(t, 128, 30 + i * 28)); greek = new THREE.CanvasTexture(cv); greek.colorSpace = THREE.SRGBColorSpace; } } catch (e) { greek = null; }
    let walkDir = 0, endT = -1, shown = null;
    const sideDir = (x) => { const h = hero(), a = proj(h.x, h.y + 1, h.z), b = proj(h.x + 1, h.y + 1, h.z); if (!a || !b) return 1; return Math.sign((x - W() / 2) * (b.x - a.x)) || 1; };
    btn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); if (J.state().done) return; walkDir = 0; const r = J.set();
      if (r === 'near') { btn.classList.remove('no'); void btn.offsetWidth; btn.classList.add('no'); buzz42('retry'); line(LINE42.warnNear, `אבנים ${J.state().stones.length}/${J.state().n}`); return; }
      stele(A.x + Math.round(J.state().x * 10) / 10, false); buzz42('settle'); o.emit && o.emit('h46stone', {});
      if (r === 'last') { pile.innerHTML = ''; endT = 3.4; shown = J.ideal(); for (const u of shown) stele(A.x + u, true); line(LINE42.warnDone, `הפער הגדול ${Math.round(J.state().miss * 100)}%`); }
      else line(LINE42.warn, `אבנים ${J.state().stones.length}/${J.state().n} · רמה ${L}`);
    });
    const job = {
      acting: true, fullPad: true, J, kind: 'warn', A, len, setBtn: btn, u: () => J.state().x,
      down(a2) { if (!J.state().done) walkDir = sideDir(a2.x); }, move() {}, up() { walkDir = 0; try { stages.hero.drive(0, 0); } catch (e) { /* */ } },
      view(h) { if (endT >= 0) { const mx = A.x + len / 2; return { p: [mx, gy(mx, A.z) + 21, A.z - 34], t: [mx, gy(mx, A.z), A.z] }; } const D = Math.max(24, needD() + 1.5); return { p: [h.x - 2, h.y + 2.6 + D * 0.24, h.z - D], t: [h.x - 2, h.y + 2.6, h.z + 3] }; },
      frame(dt) {
        const h = hero(), s = J.state();
        objPlace(!s.done, [{ x: h.x, y: h.y + 1.2, z: h.z, r: 1.6 }], 'h46warn');   // (the act's surface on: held anywhere — the bot's events reached the pad, a finger never did: K46-P)
        if (!s.done && walkDir && ((walkDir < 0 && h.x <= A.x + 0.05) || (walkDir > 0 && h.x >= A.x + len - 0.05))) walkDir = -walkDir;   // (at the soreg's post he turns back: the fence goes on only one way — K46-P2 held toward the post for minutes)
        if (!s.done && walkDir) { const stop = (walkDir < 0 && h.x <= A.x + 0.05) || (walkDir > 0 && h.x >= A.x + len - 0.05); try { stages.hero.drive(stop ? 0 : walkDir * 6, (z - h.z) * 3); } catch (e) { /* */ } }   // (the stretch's ends stop him: K46-S walked on past post A, the stones all refused there)
        if (h.x < A.x - 0.4 || h.x > A.x + len + 0.4) { try { stages.hero.drive(0, 0); stages.hero.setPos(Math.max(A.x, Math.min(A.x + len, h.x)), z, 0); } catch (e) { /* */ } }
        J.walk(Math.max(0, Math.min(len, h.x - A.x)) - s.x);
        svgClear();
        if (endT >= 0) {   // the real gaps
          const pts = [0, ...s.stones, len]; for (let i = 1; i < pts.length; i++) { const p0 = proj(A.x + pts[i - 1], gy(A.x, A.z) + 0.15, A.z - 0.6), p1 = proj(A.x + pts[i], gy(A.x, A.z) + 0.15, A.z - 0.6); if (p0 && p1) svgAdd(`<line x1="${p0.x}" y1="${p0.y}" x2="${p1.x}" y2="${p1.y}" stroke="#FFD66E" stroke-width="4"/><text x="${(p0.x + p1.x) / 2}" y="${(p0.y + p1.y) / 2 - 10}" fill="#FFF4DC" font-size="15" font-weight="800" text-anchor="middle" stroke="#2A1804" stroke-width="3" paint-order="stroke">${s.gaps[i - 1]}</text>`); }
          endT -= dt; if (endT <= 0 && !this.graded) { this.graded = 1; grade('warn', s.q, proj(A.x + len / 2, 2, A.z)); endT = -2; return false; }
        }
        if (this.graded) { this.after = (this.after || 0) + dt; return this.after > 1.6; }
        return false;
      },
      end() { pile.innerHTML = ''; svgClear(); if (st.ui.pad) st.ui.pad.classList.remove('full'); try { stages.hero.drive(0, 0); } catch (e) { /* */ } },
    };
    return job;
  }
  /** ── build 46 ── the THIRTEEN PROSTRATIONS: a quiet moment, not a skill — a procession of priests along the soreg; at each marked place a slow
   *  swipe down bows. He does the first; then the procession goes on in its own rhythm, and he may bow with each (or just watch). No grade, no
   *  jingle, no haptics during the bows (מדות ב, ג; ברטנורא שם — טיוטה; the thirteen marks in Herod's soreg — המחשה) */
  function mkBows() {
    line(LINE42.bowFirst);
    if (st.ui.pad) st.ui.pad.classList.add('full');
    const z = PL.bow0.z - 1.3, N = 6, robe = mat('#F4F1E8', 0.9), skin = mat('#C99B72', 0.8), sash = mat('#3E5A9A', 0.7);
    (st.props.marks || []).forEach((m) => { m.visible = true; });
    const priests = Array.from({ length: N }, (_, i) => {
      const g = new THREE.Group(), top = new THREE.Group(); top.position.y = 1.5; g.add(top);
      const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 1.5, 10), robe); legs.position.y = 0.75; g.add(legs);
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 1.1, 10), robe); body.position.y = 0.55; top.add(body);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.345, 0.345, 0.14, 10), sash); band.position.y = 0.08; top.add(band);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), skin); head.position.y = 1.32; top.add(head);
      const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.2, 12), robe); hat.position.y = 1.52; top.add(hat);
      for (const sx of [-1, 1]) { const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.95, 8), robe); arm.position.set(sx * 0.37, 0.62, 0.06); arm.rotation.z = sx * 0.12; top.add(arm); const hand = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 6), skin); hand.position.set(sx * 0.42, 0.13, 0.1); top.add(hand); }
      g.scale.setScalar(2.1); addP(g, PL.bow0.x - 8 - i * 3.4, gy(PL.bow0.x, z), z); return { g, top };   // (his own figure's scale)
    });
    const M = { at: -1, t: 0, phase: 'wait', first: false, joined: 0, bowT: 0, kid: 0, swipe: null, done: false, hold: 0 };
    const bowAt = (i) => PL.bow0.x + i * 2.6;
    const job = {
      acting: true, fullPad: true, kind: 'bows', M,
      down(a2) { M.swipe = { y0: a2.y, t0: now() }; },
      move() {},
      up(a2) {
        const sw = M.swipe || { y0: a2.y0, t0: a2.t0 }; M.swipe = null; const dy = a2.y - sw.y0, dt2 = now() - sw.t0;   // (the touch's own start when the down came before the job's)
        if (dy > 40 && dt2 > 0.25) {   // a slow swipe down: a bow (0.25 s, 40 px: the naive kid K46-W2's 22 swipes joined none at 0.45 s)
          if (!M.first && M.phase === 'wait') { M.first = true; M.phase = 'bow'; M.t = 0; M.kid = 1; line(LINE42.bows); o.emit && o.emit('h46bow', { first: true }); }
          else if (M.phase === 'bow' || M.phase === 'walk') { M.kid = 1; M.joined++; o.emit && o.emit('h46bow', { first: false }); }
        }
      },
      view() { const x = (M.at < 0 ? PL.bow0.x - 4 : bowAt(Math.max(0, Math.min(12, M.at)))), y0 = gy(x, z); const D = Math.max(24, needD() + 1.5); return { p: [x - D * 0.72, y0 + 3.8, z - D * 0.7], t: [x + 5, y0 + 2.6, z + 2.2] }; },   // (low along the soreg)
      frame(dt) {
        M.t += dt; objPlace(M.phase !== 'end', [{ x: bowAt(Math.max(0, Math.min(12, M.at))), y: gy(PL.bow0.x, z) + 1, z: PL.bow0.z, r: 1.4 }], 'h46bows');
        const target = M.at < 0 ? 0 : M.at;
        if (M.phase === 'wait') { M.at = 0; const lead = priests[0].g.position.x; if (lead < bowAt(0)) priests.forEach((p, i) => { p.g.position.x = Math.min(p.g.position.x + dt * 3.2, bowAt(0) - i * 3.4); }); M.hold += dt; if (M.hold > 14 && !M.first) { M.first = true; M.phase = 'bow'; M.t = 0; line(LINE42.bows); } }
        else if (M.phase === 'walk') { const goal = bowAt(target); priests.forEach((p, i) => { p.g.position.x = Math.min(p.g.position.x + dt * 4.5, goal - i * 3.4); }); if (priests[0].g.position.x >= goal - 0.01) { M.phase = 'bow'; M.t = 0; } }
        else if (M.phase === 'bow') {
          const T = 1.3, u = Math.min(1, M.t / T), k = u < 0.35 ? u / 0.35 : u < 0.6 ? 1 : 1 - (u - 0.6) / 0.4, e = k * k * (3 - 2 * k);
          priests.forEach((p, i) => { p.top.rotation.x = 0.95 * e * (i === 0 || M.t > 0.08 * i ? 1 : 0); });
          if (M.kid) { try { const hh = stages.hero; if (hh && hh.mesh) hh.mesh.rotation.x = 0.5 * e; } catch (e2) { /* */ } }
          if (u >= 1) { M.kid = 0; try { if (stages.hero.mesh) stages.hero.mesh.rotation.x = 0; } catch (e2) { /* */ } if (st.props.marks && st.props.marks[target]) st.props.marks[target].material = st.props.marks[target].material; M.at = target + 1; if (M.at >= 13) { M.phase = 'end'; M.t = 0; } else { M.phase = 'walk'; M.t = 0; } }
        } else if (M.phase === 'end' && M.t > 1.4) { R.bows = { joined: M.joined }; return true; }
        return false;
      },
      end() { if (st.ui.pad) st.ui.pad.classList.remove('full'); try { if (stages.hero.mesh) stages.hero.mesh.rotation.x = 0; } catch (e) { /* */ } },
    };
    return job;
  }
  /* ── build 45 ── the LINE: stretched from pin to pin — a drag from the near pin to the far one, graded by its straightness ("וקו ינטה על
   * ירושלים", זכריה א, טז; the chalk line itself המחשה); the touch on the whole screen for it */
  function mkLine() {
    const L = famL('place'), J = F.createLine45(L), A = PL.peg0, B = PL.peg1, ya = A.y + 1.2, yb = B.y + 1.2;
    line(LINE42.line, `רמה ${L}`);
    const ends = () => { const a = proj(A.x, ya, A.z), b = proj(B.x, yb, B.z); return a && b ? { a, b } : null; };
    const uv = (x, y) => { const E = ends(); if (!E) return null; const vx = E.b.x - E.a.x, vy = E.b.y - E.a.y, L2 = vx * vx + vy * vy || 1, Ln = Math.sqrt(L2); return { u: ((x - E.a.x) * vx + (y - E.a.y) * vy) / L2, d: ((x - E.a.x) * -vy + (y - E.a.y) * vx) / L2, Ln }; };
    let path = [];
    const ropeTo = (x, y, z) => { const r = st.props.rope; if (!r) return; const a = r.geometry.attributes.position; a.setXYZ(0, A.x, ya, A.z); a.setXYZ(1, x, y, z); a.needsUpdate = true; };
    if (st.ui.pad) st.ui.pad.classList.add('full');
    return {
      acting: true, J, kind: 'line', ends,
      down(a) { const q = uv(a.x, a.y); if (q) J.down(q.u, q.d); path = J.state().on ? [[a.x, a.y]] : []; if (!J.state().on) line('מתחילים ביתד הקרובה — שם החוט קשור · המחשה', `רמה ${J.state().L}`); },
      move(a) { const q = uv(a.x, a.y); if (!q) return; J.move(q.u, q.d); if (J.state().on || J.state().done) path.push([a.x, a.y]); const k = Math.max(0, Math.min(1, q.u)); ropeTo(A.x + (B.x - A.x) * k, ya + (yb - ya) * k, A.z + (B.z - A.z) * k); },
      up() { J.up(); if (!J.state().done) path = []; },
      frame() {
        const s = J.state(), E = ends(); objPlace(true, [{ x: (A.x + B.x) / 2, y: (ya + yb) / 2, z: (A.z + B.z) / 2, r: Math.hypot(B.x - A.x, B.z - A.z) / 2 }], 'h45line');
        if (st.ui.pad) st.ui.pad.classList.add('full');
        svgClear(); if (E) { svgAdd(`<circle cx="${E.a.x}" cy="${E.a.y}" r="14" fill="rgba(255,214,110,.35)" stroke="#FFD66E" stroke-width="2"/><circle cx="${E.b.x}" cy="${E.b.y}" r="14" fill="none" stroke="#FFD66E" stroke-width="2" stroke-dasharray="4 3"/>`); if (s.L <= 1) svgAdd(`<line x1="${E.a.x}" y1="${E.a.y}" x2="${E.b.x}" y2="${E.b.y}" stroke="#FFE6A0" stroke-width="1.5" stroke-dasharray="3 6" opacity=".6"/>`); }
        if (path.length > 1) svgAdd(`<polyline points="${path.map((p2) => p2.join(',')).join(' ')}" fill="none" stroke="#F4EBD6" stroke-width="3"/>`);
        if (s.done) { if (st.ui.pad) st.ui.pad.classList.remove('full'); ropeTo(B.x, yb, B.z); svgClear(); grade('line', s.q, E ? E.b : null); return true; }
        return false;
      },
      end() { if (st.ui.pad) st.ui.pad.classList.remove('full'); },
    };
  }
  /* ── build 45 ── LIFT on the wall: the PULLEY, hand over hand — swipe down in rhythm; between pulls a still hold catches the rope (else it
   * slips back); stop in the window; the meter and, at level 1, the window's shadow (v2 §2) */
  function mkPulley() {
    const L = famL('lift'), J = F.createPulley(L), mt = el('h42-meter', '<i></i><b></b><u></u>'); st.ui.root.appendChild(mt);
    const [w0, w1] = J.P.win; mt.querySelector('b').style.bottom = `${w0 * 80}%`; mt.querySelector('b').style.height = `${(w1 - w0) * 80}%`; mt.querySelector('u').style.display = 'none';
    let lastY = 0, ps = st.props.pstone, y0 = ps ? PL.pstone.y + 0.55 : 0;
    line(LINE42.pulley, `רמה ${L}`);
    return {
      acting: true, el: [mt], J, kind: 'pulley',
      down(a) { J.grab(); lastY = a.y; },
      move(a) { const dy = a.y - lastY; lastY = a.y; if (dy > 0) J.pull(dy); },
      up() { J.release(); },
      frame(dt) {
        const a = st.act; if (a && a.down && Math.abs(a.y - lastY) < 2) J.hold(dt);
        const s = J.step(dt), y = s.y + J.sway();
        if (ps) ps.position.y = y0 + y * 6; if (st.props.sheave) st.props.sheave.rotation.z = -s.y * 9;
        const r = st.props.pRope; if (r && ps) { const p = r.geometry.attributes.position; p.setY(1, ps.position.y + 0.55); p.needsUpdate = true; }
        const top = ps ? ps.position.y + 0.6 : PL.pstone.y + 2;
        objPlace(true, [{ x: (PL.pulley.x + PL.pstone.x) / 2, y: Math.min(top, PL.pulley.y + 4), z: PL.pulley.z, r: 2.6 }], 'h45pulley');
        const q = proj(PL.pstone.x, top, PL.pstone.z); if (q) { mt.style.left = `${Math.round(Math.min(W() - 40, q.x + 70))}px`; mt.style.top = `${Math.round(Math.max(60, q.y - 55))}px`; }
        mt.querySelector('i').style.height = `${Math.round(Math.min(1.2, s.y) * 80)}%`;
        line(s.y > w1 + 0.02 ? LINE42.pulley2 : LINE42.pulley, `רמה ${s.L} · משיכות ${s.pulls}`);
        if (s.done) { grade('pulley', s.q, q); buzz42('settle'); return true; }
        return false;
      },
    };
  }
  /* INSPECT: reading the rock — sweep (drag), wedges (taps on the shown line), the water (hold), let go at the end */
  function mkRock(i) {
    const L = famL('inspect'), J = F.createRock(i, L), R = PL.rock[i], C = { x: R.x, y: R.y + 1.6, z: R.z };
    line(LINE42.sweep, i === 2 ? LINE42.two : `סלע ${i + 1} מתוך 3 · רמה ${L}`);
    const box = () => { const a = proj(C.x - 2.8, C.y + 1.6, C.z), b = proj(C.x + 2.8, C.y - 1.4, C.z), c = proj(C.x, C.y, C.z); if (!a || !b || !c) return null; const l = Math.min(a.x, b.x), r = Math.max(a.x, b.x), t = Math.min(a.y, b.y), bt = Math.max(a.y, b.y); return { l, r, t, b: bt, w: Math.max(40, r - l), h: Math.max(30, bt - t), cx: c.x, cy: c.y }; };
    // a line on the rock: from its graze across the box at a slope (screen space; drawn when seen)
    const seg = (l, B) => { const y0 = B.t + B.h * (0.35 + l.graze * 0.35), y1 = y0 + B.h * (l.id === 'a' ? 0.12 : -0.1); return { x0: B.l + B.w * 0.08, y0, x1: B.r - B.w * 0.08, y1 }; };
    let mode = '', pourOn = false, swept = 0;
    return {
      acting: true, J, kind: 'rock', box, lines: () => { const B = box(); return B ? J.rock.lines.filter((l) => J.state().seen[l.id]).map((l) => ({ id: l.id, ...seg(l, B) })) : []; },
      down(a) { mode = ''; pourOn = false; a.tDown = now(); },
      move(a) { if (a.moved > 10) { mode = 'sweep'; const B = box(); if (B) { const u = (a.x - B.l) / B.w; J.sweep(Math.max(0, Math.min(1, u))); swept++; if (swept % 6 === 0) buzz42('creak'); } } },
      up(a) {
        if (mode === 'sweep') { mode = ''; return; }
        if (pourOn) { pourOn = false; J.pour(0.016, false); return; }
        if (now() - (a.tDown || 0) < F.TAP42 + 0.05 && a.moved < 10) {   // a tap: a wedge on a seen line near the touch
          const B = box(); if (!B) return;
          let best = null, bd = J.state().L <= 1 ? Math.max(B.w, B.h) : 26;   // (level 1: a tap anywhere on the rock goes to the line — and to its nearest free mark)
          for (const l of J.rock.lines) { if (!J.state().seen[l.id]) continue; const s = seg(l, B), vx = s.x1 - s.x0, vy = s.y1 - s.y0, t = Math.max(0, Math.min(1, ((a.x - s.x0) * vx + (a.y - s.y0) * vy) / (vx * vx + vy * vy))), d = Math.hypot(a.x - (s.x0 + vx * t), a.y - (s.y0 + vy * t)); if (d < bd) { bd = d; best = { id: l.id, t }; } }
          if (best && J.state().L <= 1) { const ws = J.state().wedges, free = [0.2, 0.4, 0.6, 0.8].filter((m) => !ws.some((w) => Math.abs(w - m) < 0.04)); if (free.length) best.t = free.reduce((p, m) => (Math.abs(m - best.t) < Math.abs(p - best.t) ? m : p), free[0]); }   // (level 1: a tap lands on the nearest free marked place — the marks teach the even spacing)
          if (best) { const r = J.wedge(best.id, best.t); if (r === 'ok') buzz42('mallet'); }
        }
      },
      frame(dt) {
        const s = J.state(), B = box(); objPlace(true, [{ x: C.x, y: C.y, z: C.z, r: 2.6 }], 'h42rock');
        // the hold: past the tap, without moving → the water
        const a = st.act; if (a && a.down && mode !== 'sweep' && a.moved < 10 && now() - (a.tDown || 0) > F.TAP42 && s.wedges.length >= F.INSPECT42.minWedges) pourOn = true;
        J.pour(dt, pourOn);
        svgClear();
        if (B) {
          for (const l of J.rock.lines) { if (!s.seen[l.id]) continue; const g = seg(l, B), op = l.band < 0.12 ? 0.55 : 0.9; svgAdd(`<line x1="${g.x0}" y1="${g.y0}" x2="${g.x1}" y2="${g.y1}" stroke="#2A1804" stroke-width="3" stroke-dasharray="2 5" opacity="${op}"/>`);
            if (s.L <= 1 && s.wedges.length < F.INSPECT42.wedges && (!s.line || s.line === l.id)) for (const t of [0.2, 0.4, 0.6, 0.8]) { if (s.wedges.some((w) => Math.abs(w - t) < 0.04)) continue; svgAdd(`<circle cx="${g.x0 + (g.x1 - g.x0) * t}" cy="${g.y0 + (g.y1 - g.y0) * t}" r="9" fill="none" stroke="#FFE6A0" stroke-width="2" stroke-dasharray="3 3" opacity=".8"/>`); }   // (level 1: the even places marked)
            if (s.line === l.id) { for (const t of s.wedges) { const wx = g.x0 + (g.x1 - g.x0) * t, wy = g.y0 + (g.y1 - g.y0) * t; svgAdd(`<polygon points="${wx - 6},${wy - 13} ${wx + 6},${wy - 13} ${wx + 1.5},${wy + 4} ${wx - 1.5},${wy + 4}" fill="#9A6A3A" stroke="#4A2E12" stroke-width="1.5"/><line x1="${wx - 4}" y1="${wy - 9}" x2="${wx + 4}" y2="${wy - 9}" stroke="#6B4520" stroke-width="1"/>`); }   /* (wooden wedges, driven into the line) */ const c = Math.min(1, s.crack); svgAdd(`<line x1="${g.x0}" y1="${g.y0}" x2="${g.x0 + (g.x1 - g.x0) * c}" y2="${g.y0 + (g.y1 - g.y0) * c}" stroke="#111" stroke-width="4"/>`); svgAdd(`<rect x="${g.x0 + (g.x1 - g.x0) * 0.9 - 4}" y="${Math.min(g.y0, g.y1) - 16}" width="${(g.x1 - g.x0) * 0.14 + 8}" height="${Math.abs(g.y1 - g.y0) + 32}" fill="none" stroke="#FFD66E" stroke-width="2" stroke-dasharray="4 4"/>`); } }
          if (s.light >= 0) svgAdd(`<rect x="${B.l + B.w * s.light - 10}" y="${B.t}" width="20" height="${B.h}" fill="rgba(255,240,190,.35)"/>`);
        }
        const seen = Object.keys(s.seen).length;
        line(!seen ? LINE42.sweep : s.wedges.length < F.INSPECT42.minWedges ? LINE42.wedge : LINE42.pour, i === 2 ? LINE42.two : `סלע ${i + 1} מתוך 3 · רמה ${J.state().L}`);
        if (s.done) { const q = proj(C.x, C.y, C.z); grade(`rock${i}`, s.q, q); buzz42('heavy'); if (st.props.rocks && st.props.rocks[i]) st.props.rocks[i].scale.set(1.3, 0.35, 1); svgClear(); return true; }
        return false;
      },
    };
  }
  /* PLACE: his hand stones in the course — drag from the pile, let go over the course — it settles by itself (build 45: the hold was the naive kid's stall); the crews lay the rest */
  function mkCourse(n, kind = '', part = '') {
    const L = famL('place'), spec = kind ? F.wallSpec45(kind, L, n) : F.courseSpec(n, L), J = F.createCourse(spec), U = 1.2, C = { x: PL.course.x, y: PL.course.y + 1.5 + n * 1.0, z: PL.course.z };
    line(kind === 'corner' ? LINE42.wcorner : kind === 'top' ? LINE42.top : LINE42.place, `נדבך ${n + 1} · רמה ${L}`);
    // the course below (the crews'), and the crews' stones of this course outside his stretch, laid one by one
    const g = st.props.course; const box3 = (len, x0, y) => { const m = ashlar(len * U - 0.1, 0.96, 1.2); m.position.set((x0 + len / 2) * U - 7, y, 0); g.add(m); return m; };   // (build 43: drafted margins and a boss)
    if (n === 0 || (STG === 'wall' && !g.userData.below)) { g.userData.below = 1; let x = 0; const bl = spec.below.concat([15]); for (const j of bl) { box3(j - x, x, 0.5 + (n > 0 ? n - 1 : 0) * 1.0); x = j; } }
    // ── build 45 ── a corner at the course's east end: the corner stone the other way from the one below (they alternate, המחשה) — the one below is shown
    const cornerM = (dir, y) => { const m = new THREE.Group(), a1 = ashlar(2 * U - 0.1, 0.96, 1.2), a2 = ashlar(1.1, 0.96, 1.8); a2.position.set(dir === 'a' ? 0.55 - U : U - 0.55, 0, 1.45); m.add(a1, a2); m.position.set((spec.b - 1) * U - 7, y, 0); g.add(m); return m; };
    if (spec.corner) cornerM(spec.corner.want === 'a' ? 'b' : 'a', 0.5 + (n > 0 ? n - 1 : 0) * 1.0);
    const settle = (m) => { if (!m) return; const y1 = m.position.y; m.position.y = y1 + 0.7; st.anims = (st.anims || []).concat([{ m, y0: y1 + 0.7, y1, t: 0, T: 0.22 }]); buzz42('settle'); o.emit && o.emit('h45thud', {}); };   // (#6: it settles by itself — a short drop, the thud, the haptic)
    const crew = []; for (let x = 0; x < spec.a; x += 2) crew.push([x, Math.min(2, spec.a - x)]); for (let x = spec.b; x < 15; x += 3) crew.push([x, Math.min(3, 15 - x)]);
    let crewT = 0, crewN = 0, graded = false, backT = 0, fitT = 0;
    // the pile
    const pile = st.ui.pile; pile.innerHTML = '';
    const laid = [];
    for (const len of F.PLACE42.lens) { const b = el('h42-it', `${'▭'.repeat(1)} ${len}`, 'button'); b.type = 'button'; b.dataset.len = String(len); b.setAttribute('aria-label', `אבן באורך ${len}`); pile.appendChild(b); dragItem(b, (drop) => tryPlace(len, b, drop)); }
    if (spec.corner) for (const dir of ['a', 'b']) { const b = el('h42-it', dir === 'a' ? '┐ פינה' : '┌ פינה', 'button'); b.type = 'button'; b.dataset.corner = dir; b.setAttribute('aria-label', `אבן פינה ${dir === 'a' ? 'לצפון' : 'לדרום'}`); pile.appendChild(b); dragItem(b, (drop) => { const q = uAt(spec.b - 1); if (!q || Math.hypot(drop.x - q.x, drop.y - q.y) > Math.max(70, H() * 0.22)) return false; const r = J.placeCorner(dir, { dragPx: drop.px }); if (r === 'ok') { const cm = cornerM(dir, 1.5 + n * 1.0); cm.userData.his = 1; settle(cm); b.remove(); const o2 = pile.querySelector('[data-corner]'); if (o2) o2.remove(); if (dir !== spec.corner.want) line('הפינה באותו כיוון כמו שמתחת — חיבור חלש · המחשה', `נדבך ${n + 1}`); return true; } return false; }); }
    // ── build 43 ── the drop: anywhere over his stretch — the stone goes to the free place nearest where it was let go (#6)
    const uAt = (u) => proj(C.x + u * U - 7, C.y, C.z);
    const stretch = () => { const a = uAt(spec.a), b = uAt(spec.b); return a && b ? { a, b } : null; };
    const slotBox = () => { const a = proj(C.x + (spec.a * U - 7) - 0.2, C.y + 0.7, C.z), b = proj(C.x + (spec.b * U - 7) + 0.2, C.y - 0.6, C.z); return a && b ? { l: Math.min(a.x, b.x) - 30, r: Math.max(a.x, b.x) + 30, t: Math.min(a.y, b.y) - 30, b: Math.max(a.y, b.y) + 30 } : null; };
    function tryPlace(len, b, drop) {
      const S2 = stretch(); if (!S2) return false;
      // ── build 45 ── where it was let go, in the course's own units: the nearest of its points AS PROJECTED (every quarter unit) — the
      // screen's straight line between the stretch's ends is not the course's measure in perspective: over the top course (15 units, seen
      // from one end) a drop on its middle read up to 3 units off — "imprecise" and the wrong place, the bot's top course טעון תיקון 3 runs of 3
      let bu = null, bd = Infinity; for (let u = spec.a; u <= spec.b + 1e-9; u += 0.25) { const p = uAt(u); if (!p) continue; const dd = Math.hypot(drop.x - p.x, drop.y - p.y); if (dd < bd) { bd = dd; bu = u; } }
      if (bu == null || bd > Math.max(64, H() * 0.2)) return false;
      const r = J.place(len, { dragPx: drop.px, u: bu });
      if (r === 'ok') { const [s0, l0] = J.state().last; const m = box3(l0, s0, 1.5 + n * 1.0); m.userData.his = 1; laid.push(m); settle(m); return true; }
      if (r === 'unsettled') line('החזיקו רגע על הנדבך — שתתיישב · המחשה', `נדבך ${n + 1}`);
      if (r === 'long' || r === 'gap') { b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); buzz42('retry'); line(r === 'gap' ? 'תישאר שם פרצה קטנה מדי — גררו אבן אחרת · המחשה' : 'אין לה מקום שם — גררו אבן קצרה יותר · המחשה', `נדבך ${n + 1}`); backT = 2.6; }   // (build 45: the verb kept, and back to the course's own line in 2.6 s — the naive kid K45-P read "בחרו" as no task and walked for 5 minutes)
      return false;
    }
    return {
      acting: true, dragOnly: true, J, kind: 'course', slot: slotBox, uAt, spec, cornerAt: () => (spec.corner ? uAt(spec.b - 1) : null),
      down() {}, move() {},
      up(a) { if (J.state().prot && J.state().prot.length && Math.hypot(a.x - a.x0, a.y - a.y0) >= F.DRAG42) { const i = J.state().prot[0], m = laid[i]; if (J.pushIn({ dragPx: Math.hypot(a.x - a.x0, a.y - a.y0) }) === 'ok' && m) { m.position.z = 0; buzz42('settle'); } } },   // (the retreat: a drag pushes the next stone that stands out back into line)
      frame(dt) {
        if (J.state().prot && J.state().prot.length && !this.plumb) { this.plumb = 1; this.dragOnly = false; J.state().prot.forEach((i) => { if (laid[i]) laid[i].position.z = 0.35; }); line(LINE42.retreat, `נדבך ${n + 1} · רמה ${L}`); }
        if (backT > 0 && (backT -= dt) <= 0 && !J.state().done && !(J.state().prot && J.state().prot.length)) line(kind === 'corner' ? LINE42.wcorner : kind === 'top' ? LINE42.top : LINE42.place, `נדבך ${n + 1} · רמה ${L}`);
        fitT -= dt; if (fitT <= 0) { fitT = 0.3; for (const it of pile.querySelectorAll('.h42-it[data-len]')) { const len = +it.dataset.len; let ok = false; for (let s0 = spec.a; !ok && s0 + len <= spec.b; s0++) ok = J.fits(len, s0 + len / 2); it.classList.toggle('nofit', !ok); } }   // ── build 45 ── the stones that fit no free place are dimmed
        crewT += dt; if (crewN < crew.length && crewT > 1.6) { crewT = 0; const [x, len] = crew[crewN++]; box3(len, x, 1.5 + n * 1.0); }
        objPlace(true, [{ x: C.x + ((spec.a + spec.b) / 2) * U - 7, y: C.y + 1, z: C.z, r: ((spec.b - spec.a) * U) / 2 + 0.6 }], 'h42course');
        // the joints below his stretch, shown at level 1 (the rule's teacher)
        svgClear(); if (!J.state().done) for (const [r0, rl] of J.runs()) { const a = proj(C.x + r0 * U - 7 + 0.08, C.y + 0.5, C.z), b = proj(C.x + (r0 + rl) * U - 7 - 0.08, C.y - 0.5, C.z), c2 = proj(C.x + r0 * U - 7 + 0.08, C.y - 0.5, C.z), d2 = proj(C.x + (r0 + rl) * U - 7 - 0.08, C.y + 0.5, C.z); if (a && b && c2 && d2) svgAdd(`<polygon points="${a.x},${a.y} ${d2.x},${d2.y} ${b.x},${b.y} ${c2.x},${c2.y}" fill="rgba(255,214,110,.16)" stroke="#FFD66E" stroke-width="2" stroke-dasharray="6 4"/>`); }   // (build 43: each empty place of the course, on the course)
        if (spec.corner && !J.state().corner.dir && !J.state().done) { const a = proj(C.x + (spec.b - 2) * U - 7 + 0.08, C.y + 0.5, C.z), b = proj(C.x + spec.b * U - 7 - 0.08, C.y - 0.5, C.z), c2 = proj(C.x + (spec.b - 2) * U - 7 + 0.08, C.y - 0.5, C.z), d2 = proj(C.x + spec.b * U - 7 - 0.08, C.y + 0.5, C.z); if (a && b && c2 && d2) svgAdd(`<polygon points="${a.x},${a.y} ${d2.x},${d2.y} ${b.x},${b.y} ${c2.x},${c2.y}" fill="rgba(255,160,80,.2)" stroke="#FFA94D" stroke-width="2" stroke-dasharray="4 3"/>`); }   // (build 45: the corner's place)
        if (J.state().L <= 1) for (const j of spec.below) { if (j <= spec.a || j >= spec.b) continue; const q = proj(C.x + j * U - 7, C.y + 0.4, C.z); if (q) svgAdd(`<line x1="${q.x}" y1="${q.y - 22}" x2="${q.x}" y2="${q.y + 6}" stroke="#C0392B" stroke-width="3" opacity=".7"/>`); }
        if (J.state().done) { if (!graded) { graded = true; pile.innerHTML = ''; svgClear(); const q = proj(C.x, C.y + 1, C.z); grade(part || `course${n}`, J.state().q, q); if (STG === 'wall' && MODE === 'stage') { try { if (stages.setStage) stages.setStage('wall', 'building', PARTS.indexOf(part) / (PARTS.length - 2), {}); } catch (e) { /* */ } }   /* (build 45: the court wall's own model rises with the courses — the pull-back shows it) */ } if (crewN >= crew.length && STG === 'wall' && MODE === 'stage' && !this.kept) { this.kept = 1; try { R.stones = stones45(); save42(S); } catch (e) { /* */ } } return crewN >= crew.length; }   /* (build 46: the stretch as laid so far, kept — a later visit finds it) */   /* (graded once; the part ends when the crews have laid the rest) */
        return false;
      },
      end() { pile.innerHTML = ''; st.pull = { t: 0 }; line(LINE42.courseEnd); },
    };
  }
  /* PLACE (twist): the great stone on rollers — the chant's beat; drag the freed roller (its handle at the back) to the front */
  function mkRoll() {
    const L = famL('place'), J = F.createRoll(L); line(LINE42.roll, `האבן הגדולה · רמה ${L}`);
    let beatT = 0; const h = el('h42-it', '⟳', 'button'); h.type = 'button'; h.setAttribute('aria-label', 'הגליל שהשתחרר'); h.style.position = 'fixed'; h.style.zIndex = '46'; h.style.pointerEvents = 'auto';   /* (the layer above is pointer-events none: without this a finger fell through to the walk — the naive kid's K42-P-roll / K42-W-roll; the autoplayer's events had gone straight to it) */ h.hidden = true; st.ui.root.appendChild(h);
    dragItem(h, (drop) => { const r = J.moveRoller({ dragPx: drop.px }); if (r === 'ok') { buzz42('heavy'); return true; } return false; }, true);
    return {
      acting: true, dragOnly: true, el: [h], J, kind: 'roll', handle: () => (h.hidden ? null : h.getBoundingClientRect()),
      frame(dt) {
        const s = J.step(dt); beatT += dt; if (beatT > s.beat) { beatT = 0; if (!s.waiting) buzz42('tick'); }
        const x = PL.roll0.x + s.x * 2; if (st.props.big) st.props.big.position.x = x;
        if (st.props.rollers) st.props.rollers.forEach((c, i) => { const k = (i + s.moved) % 4; c.position.x = x - 4.5 + k * 3; c.rotation.y += dt * (s.waiting ? 0 : 2); });
        objPlace(true, [{ x: x - 4, y: PL.roll0.y + 1.4, z: PL.roll0.z, r: 3.6 }], 'h42roll');   // (build 43: the stone's back end — where the freed roller comes out)
        const back = proj(x - 5.2, PL.roll0.y + 0.45, PL.roll0.z); h.hidden = !s.free; if (back && s.free) { h.style.left = `${Math.round(back.x - 26)}px`; h.style.top = `${Math.round(back.y - 24)}px`; }
        line(s.waiting ? 'האבן נעצרה — אין גליל בחזית. גררו אותו קדימה · המחשה' : LINE42.roll, `גלגלים: ${s.moved} / ${F.ROLL42.moves} · השירה קובעת את הקצב`);
        if (s.done) { const q = proj(x, PL.roll0.y + 2, PL.roll0.z); grade('roll', s.q, q); h.remove(); return true; }
        return false;
      },
    };
  }
  /* PLACE (end): the last paving slabs — drag slabs whose sizes fill each row exactly */
  function mkPave() {
    const J = F.createPave(), U = 1.4, rowsY = [0, 1.5, 3]; line(LINE42.pave, `השורה ${J.state().row + 1} · נשארו ${J.state().left[0]}`);
    const pile = st.ui.pile; pile.innerHTML = '';
    for (const n of F.PAVE42.sizes) { const b = el('h42-it', `▢ ${n}`, 'button'); b.type = 'button'; b.setAttribute('aria-label', `לוח בגודל ${n}`); pile.appendChild(b); dragItem(b, (drop) => { const B = paveBox(); if (!B || !(drop.x >= B.l && drop.x <= B.r && drop.y >= B.t && drop.y <= B.b)) return false; const row = J.state().row, at = J.state().rows[row] - J.state().left[row], r = J.lay(n, { dragPx: drop.px }); if (r === 'ok') { const m = new THREE.Mesh(new THREE.BoxGeometry(n * U - 0.12, 0.2, 1.24), STONE); m.position.set((at + n / 2) * U - 4, 0.1, rowsY[row]); st.props.pave.add(m); buzz42('settle'); return true; } if (r === 'long') { b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); buzz42('retry'); } return false; }); }
    // the rows' empty beds (darker) inside the paving already laid round them — the gap each row's slabs must fill exactly (simple shapes · המחשה)
    const X0 = -4, g0 = st.props.pave;
    if (g0 && !g0.userData.bed) {
      g0.userData.bed = true;
      const slab = (w, d, x, z, m, h) => { const k = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); k.position.set(x, h / 2, z); g0.add(k); };
      const run = (x0, x1, z, d) => { const n = Math.max(1, Math.round((x1 - x0) / 1.5)), w = (x1 - x0) / n; for (let k = 0; k < n; k++) slab(w - 0.12, d - 0.1, x0 + w * (k + 0.5), z, STONE, 0.2); };   // (build 43: the laid paving in slabs with their joints)
      slab(13.6, 5.9, 1.35, 1.5, BED, 0.04);
      J.state().rows.forEach((n, r) => { slab(n * U, 1.3, X0 + (n * U) / 2, rowsY[r], BED, 0.06); const e = X0 + n * U; if (6.7 - e > 0.05) run(e, 6.7, rowsY[r], 1.4); });
      run(-5.4, 8.1, -1.35, 1.4); run(-5.4, 8.1, 4.35, 1.4); for (const z of [0, 1.5, 3]) { slab(1.3, 1.3, -4.7, z, STONE, 0.2); slab(1.3, 1.3, 7.4, z, STONE, 0.2); }
    }
    // the drop's box from the points in front of the camera (its near plane is 4 amot: a corner of the paving can fall behind it), kept on the screen
    const at3 = (u, r, dz = 0) => [PL.pave.x + X0 + u * U, PL.pave.y + 0.1, PL.pave.z + rowsY[r] + dz];
    const boxOf = (pts, m) => { const q = pts.map((p) => proj(p[0], p[1], p[2])).filter(Boolean); if (q.length < 2) return null; const xs = q.map((p) => p.x), ys = q.map((p) => p.y); const B = { l: Math.max(0, Math.min(...xs) - m), r: Math.min(W(), Math.max(...xs) + m), t: Math.max(0, Math.min(...ys) - m), b: Math.min(H(), Math.max(...ys) + m) }; return B.r - B.l > 20 && B.b - B.t > 20 ? B : null; };
    const paveBox = () => boxOf([0, 3.5, 7].flatMap((u) => [0, 1, 2].map((r) => at3(u, r, r === 0 ? -0.7 : r === 2 ? 0.7 : 0))), 40);
    const gapBox = () => { const s = J.state(); if (s.done) return null; const r = s.row, a = s.rows[r] - s.left[r], b = s.rows[r]; return boxOf([at3(a, r, -0.65), at3(b, r, -0.65), at3(a, r, 0.65), at3(b, r, 0.65), at3((a + b) / 2, r)], 12); };   // (a row is 1.3 amot deep: ~15 px on a phone — the outline a little wider than the gap)
    return {
      acting: true, dragOnly: true, J, kind: 'pave', box: paveBox,
      frame() {
        const s = J.state(); objPlace(true, [{ x: PL.pave.x, y: PL.pave.y, z: PL.pave.z + 1.5, r: 5 }], 'h42pave');
        svgClear(); if (!s.done) { const r = s.row, a = s.rows[r] - s.left[r], b = s.rows[r], q = [at3(a, r, -0.62), at3(b, r, -0.62), at3(b, r, 0.62), at3(a, r, 0.62)].map((p) => proj(p[0], p[1] + 0.12, p[2])); if (q.every(Boolean)) svgAdd(`<polygon points="${q.map((v) => `${v.x},${v.y}`).join(' ')}" fill="rgba(255,214,110,.18)" stroke="#FFD66E" stroke-width="2" stroke-dasharray="6 4"/>`); }   // (build 43: the gap's outline on its row — #7)
        if (!s.done) line(LINE42.pave, `שורה ${s.row + 1} מתוך ${s.rows.length} · נשארו ${s.left[s.row]}`);
        if (s.done) { pile.innerHTML = ''; svgClear(); grade('pave', s.q, proj(PL.pave.x, PL.pave.y, PL.pave.z)); return true; }
        return false;
      },
    };
  }
  /* the inscription "לבית התקיעה": drag along the dotted line (right to left), in order */
  function mkTrace() {
    line(LINE42.trace); const N = 9; let hit = 0, lastT = -1;
    const pts = () => { const a = proj(PL.trace.x + 1.4, PL.trace.y + 0.9, PL.trace.z + 0.55), b = proj(PL.trace.x - 1.4, PL.trace.y + 0.9, PL.trace.z + 0.55); if (!a || !b) return null; return Array.from({ length: N }, (_, i) => ({ x: a.x + ((b.x - a.x) * i) / (N - 1), y: a.y + ((b.y - a.y) * i) / (N - 1) + Math.sin(i * 1.3) * 6 })); };
    return {
      acting: true, kind: 'trace', dots: () => pts(), hit: () => hit,
      move(a) { if (a.moved < 8) return; const P2 = pts(); if (!P2 || hit >= N) return; const q = P2[hit]; if (Math.hypot(a.x - q.x, a.y - q.y) < 30) { hit++; lastT = now(); buzz42('tick'); } },
      frame() {
        objPlace(true, [{ x: PL.trace.x, y: PL.trace.y + 0.9, z: PL.trace.z, r: 2 }], 'h42trace');
        svgClear(); const P2 = pts(); if (P2) P2.forEach((q, i) => svgAdd(`<circle cx="${q.x}" cy="${q.y}" r="${i < hit ? 6 : 5}" fill="${i < hit ? '#2A1804' : 'none'}" stroke="#FFE6A0" stroke-width="2"/>`));
        if (hit >= N) { svgClear(); grade('trace', 1, P2 ? P2[N >> 1] : null); return true; }
        if (hit > 0 && !st.act && now() - lastT > 1.2 && hit < N) { line('מהתחלה — לאורך הנקודות, בלי לעצור · טיוטה'); hit = 0; }
        return false;
      },
    };
  }
  /** a pile item dragged: its clone follows the finger; a still moment (≥ 0.5 s within 6 px) counts as the settle; on release → onDrop({x, y, px, still}) → true keeps it */
  function dragItem(b, onDrop, keep) {
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault(); e.stopPropagation();
      const g = b.cloneNode(true); g.classList.add('drag'); doc.body.appendChild(g);
      const d = { x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, px: 0, still: 0, sx: e.clientX, sy: e.clientY, st0: now() };
      const place = () => { g.style.left = `${Math.round(d.x - 26)}px`; g.style.top = `${Math.round(d.y - 40)}px`; }; place();
      st.finger++;
      try { b.setPointerCapture(e.pointerId); } catch (err) { /* */ }
      const mv = (ev) => { d.x = ev.clientX; d.y = ev.clientY; d.px = Math.max(d.px, Math.hypot(d.x - d.x0, d.y - d.y0)); if (Math.hypot(d.x - d.sx, d.y - d.sy) > 6) { d.sx = d.x; d.sy = d.y; d.st0 = now(); } d.still = now() - d.st0; place(); };
      const upF = () => { b.removeEventListener('pointermove', mv); b.removeEventListener('pointerup', upF); b.removeEventListener('pointercancel', upF); d.still = now() - d.st0; st.finger = Math.max(0, st.finger - 1); let ok = false; try { ok = onDrop({ x: d.x, y: d.y, px: d.px, still: d.still }); } catch (err) { ok = false; } g.remove(); if (ok && !keep) { /* the pile stays (the stones are many) */ } };
      b.addEventListener('pointermove', mv); b.addEventListener('pointerup', upF); b.addEventListener('pointercancel', upF);
    });
  }

  /* ── the flow ── */
  function standOf(part) { const s = STAND[part]; return s ? { x: s.x, y: s.y, z: s.z } : null; }
  function startPart(i) {
    if (i >= PARTS.length) { finish(); return; }
    const part = PARTS[i]; R.part = i; save42(S);
    // the materials: checked at a part's start only (never mid-act): out → "מחר: …" (the open loop)
    const m = MATOF[part];
    if (m && !F.enough42(S.mat, m)) { st.part = 'out'; st.target = null; line(''); card('השיירה של היום נגמרה', [LINE42.out, '~הצוותים ממשיכים לבנות גם כשאתם לא כאן · המחשה'], 'עד מחר', () => {}); return; }
    if (m) { F.spend42(S.mat, m); matChip(); save42(S); }
    st.part = part; st.job = null; st.near = false; st.camLock = null; svgClear(); if (st.ui.pile) st.ui.pile.innerHTML = '';
    st.target = standOf(part); G39.reset();
    const p = PART[part];
    if (st.target && part !== 'rope') { line(LINE42.walk, labelOf(part)); st.pending = p; }
    else { st.pending = null; p.begin && p.begin(); }
  }
  const labelOf = (part) => ({ wood: 'לשכת העצים', beams: 'קורות הגזוזטרא', pegs: 'השגמים והיתדות', corner: 'הפינה שלכם', walk: 'ההליכה על הגזוזטרא', log: 'בדיקת העצים', beam: 'קורה לשקע', peg: 'שגם ויתד', lintel: 'המשקוף', leaf: 'כנף הדלת', leaf7: 'הכנף הכבדה', names: 'שבעת השערים', lattice0: 'לוח הסריג', lattice1: 'הסריג השזור', lattice2: 'הסריג בשני גוונים', lattice: 'הסריג', warn: 'אבני האזהרה', bows: 'ההשתחוויות', line: 'החוט', pulley: 'הגלגלת', wcourse0: 'הנדבך', wcourse1: 'הנדבך הבא', giant: 'אבן הענק', wcorner: 'הפינה', top: 'הנדבך העליון', lift: 'גלגל הדריכה', corner: 'אבן הפינה', rock0: 'הסלע הראשון', rock1: 'הסלע השני', rock2: 'הסלע השלישי', course0: 'הנדבך', course1: 'הנדבך הבא', roll: 'האבן הגדולה', pave: 'הריצוף', trace: 'אבן המעקה' })[part] || '';
  function endPart() { const p = PART[st.part]; if (st.job && st.job.end) st.job.end(); if (p && p.end) p.end(); if (st.job && st.job.el) st.job.el.forEach((e) => { try { e.remove(); } catch (err) { /* */ } }); st.job = null; objPlace(false); if (MODE !== 'stage') { svgClear(); if (st.ui.pile) st.ui.pile.innerHTML = ''; line(''); st.part = 'menu'; const cb = st.onAct; st.onAct = null; Lover = 0; if (cb) setTimeout(() => cb(st.actQ, st.actRating), st.pull ? 2700 : 700); return; } startPart(R.part + 1); }
  function finish() { st.part = 'done'; }
  function finishCard() {
    const n = { mehudar: 0, kasher: 0, tikkun: 0 }; for (const g of R.grades) n[g[1]] = (n[g[1]] || 0) + 1;
    R.done = Date.now(); save42(S);
    card(STG === 'nashim' ? 'עזרת הנשים — נבנתה' : STG === 'gates' ? 'שערי העזרה — נבנו' : STG === 'soreg' ? 'הסורג והחיל — נבנו' : STG === 'wall' ? 'חומת העזרה — נבנתה' : 'שיטוח ההר — נבנה', [`${RATE30.icon.mehudar} מהודר ${n.mehudar} · ${RATE30.icon.kasher} כשר ${n.kasher} · ${RATE30.icon.tikkun} טעון תיקון ${n.tikkun}`, `ידיים: ${Math.round(R.hands / 60)} דק׳`, ...(STG === 'nashim' ? [`ספר הפגימות: ${Object.keys(S.book48 || {}).length} עמודים`] : []), ...(STG === 'soreg' ? [FIND46, `השתחוויות: ${(R.bows && R.bows.joined) | 0} יחד עם התהלוכה`] : []), `נפתח: ${STG !== 'har' ? o.nextName || 'השלב הבא' : 'חומת העזרה'}`, ...(STG === 'nashim' ? SRC48 : STG === 'gates' ? SRC47 : STG === 'soreg' ? SRC46 : STG === 'wall' ? SRC45 : SRC42).map((x) => `~${x}`)], 'המשך', () => stop(true));
  }

  /* ── build 44 ── one act on its own (the yard, the test): he is set at its place (no walk), no materials, the level chosen; its end → cb(q, rating) */
  function resetFor(part) {
    try {
      if (part === 'lift' || part === 'corner') { const up = part === 'corner' ? 3.5 : 0, s0 = st.props.stone0; if (s0) s0.position.set(PL.stone0.x, PL.stone0.y + 0.9 + up, PL.stone0.z); craneRope(PL.stone0.y + 1.8 + up); if (st.props.ghost) st.props.ghost.visible = false; }
      if (/^rock/.test(part) && st.props.rocks) st.props.rocks.forEach((m) => m.scale.set(1.35, 0.85, 1.05));
      if (/^course|^wcourse|^wcorner|^top/.test(part) && st.props.course) { st.props.course.clear(); st.props.course.userData.below = 0; }
      if (part === 'pulley' && st.props.pstone) st.props.pstone.position.y = PL.pstone.y + 0.55;
      if (/^lattice/.test(part) && st.props.panels) st.props.panels.forEach((pn) => pn.draw(null));   // ── build 46 ──
      if ((part === 'beam' || part === 'peg') && st.props.root) { for (const k of ['plN', 'plS']) (st.props[k] || []).forEach((m) => m.parent && m.parent.remove(m)); st.props.plN = []; st.props.plS = []; st.props.root.children.filter((m) => m.geometry && m.geometry.parameters && m.geometry.parameters.depth === 4.2).forEach((m) => m.parent.remove(m)); }   // ── build 48 ──
      if ((part === 'lintel' || part === 'leaf') && st.props.lintel) { const G = PL.gate; st.props.lintel.position.set(G.x, G.y + 0.75, G.z - 4); st.props.lintel.rotation.set(0, 0, 0); (st.props.leaves || []).forEach((pv) => { pv.position.set(G.x + pv.userData.sx * GATE47.half, G.y + 0.5, G.z - 7 - (pv.userData.sx > 0 ? 0 : 1.2)); pv.rotation.set(-Math.PI / 2 + 0.02, 0, 0); }); }   // ── build 47 ──
      if (part === 'warn' && st.props.steles) { st.props.steles.forEach((m) => { if (m.parent) m.parent.remove(m); }); st.props.steles = []; }
      if (part === 'pave' && st.props.pave) { st.props.pave.clear(); st.props.pave.userData.bed = false; }
    } catch (e) { /* */ }
  }
  function runAct(part, L, cb) {
    if (part === 'rock') part = `rock${L >= 3 ? 2 : L === 2 ? 1 : 0}`;
    resetFor(part); Lover = L; st.actQ = null; st.actRating = null; st.onAct = cb;
    st.part = part; st.job = null; st.pending = null; st.camLock = null; st.pull = null; svgClear(); if (st.ui.pad) st.ui.pad.classList.remove('full');
    const p = standOf(part) || standOf('lift'); try { stages.hero.setPos(p.x, p.z, 0); stages.hero.show(true); stages.hero.drive(0, 0); } catch (e) { /* */ }
    PART[part].begin();
  }
  const sleep44 = (ms) => new Promise((r) => setTimeout(r, ms));
  async function waitFor44(f, ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { let v = false; try { v = f(); } catch (e) { v = true; } if (v) return true; await sleep44(40); } return false; }
  /** the demonstration (the test, after 5 failed tries of a job): רב האומנים's hand does it through the same surfaces — a ghost circle where it touches */
  async function demo44(part) {
    if (!doc || !st.ui.root) return;
    const gh = el('h44-ghost'); st.ui.root.appendChild(gh); const at = (x, y) => { gh.style.left = `${Math.round(x)}px`; gh.style.top = `${Math.round(y)}px`; };
    const ev = (t, type, x, y) => t.dispatchEvent(new PointerEvent(type, { pointerId: 777, clientX: x, clientY: y, bubbles: true, cancelable: true, pointerType: 'touch', isPrimary: true, button: 0, buttons: type === 'pointerup' ? 0 : 1 }));
    try {
      for (let k = 0; k < 40 && st.on && st.job && st.part === part; k++) {
        const j = st.job, pad = st.ui.pad;
        if (j.kind === 'lift') {
          const q = proj(PL.wheel.x, PL.wheel.y + 3.3, PL.wheel.z); if (!q) { await sleep44(200); continue; } at(q.x, q.y);
          const P = j.J.P, aim = (P.win[0] + P.win[1]) / 2;
          if (j.J.state().y > P.win[1]) { ev(pad, 'pointerdown', q.x, q.y); for (let i = 1; i <= 4; i++) { await sleep44(30); ev(pad, 'pointermove', q.x, q.y + i * 10); at(q.x, q.y + i * 10); } await waitFor44(() => !st.job || j.J.state().y < aim, 6000); ev(pad, 'pointerup', q.x, q.y + 40); }
          else { ev(pad, 'pointerdown', q.x, q.y); await waitFor44(() => !st.job || j.J.stopAt() >= aim, 12000); ev(pad, 'pointerup', q.x, q.y); }
          await sleep44(1200);
        } else if (j.kind === 'corner') {
          if (!j.ready()) { await sleep44(200); continue; }
          const A = j.axis(), s = j.J.state(); if (!A) { await sleep44(200); continue; }
          const dir = s.x < 0 ? 1 : -1, px = Math.min(220, Math.abs(s.x) / j.J.P.gain + F.DRAG42 / 2);
          ev(pad, 'pointerdown', A.x, A.y); at(A.x, A.y);
          for (let i = 1; i <= 8; i++) { await sleep44(40); const x = A.x + (A.ux * dir * px * i) / 8, y = A.y + (A.uy * dir * px * i) / 8; ev(pad, 'pointermove', x, y); at(x, y); }
          ev(pad, 'pointerup', A.x + A.ux * dir * px, A.y + A.uy * dir * px); await sleep44(700);
        } else if (j.kind === 'course') {
          const s = j.J.state(), left = s.b - s.at, ok = [4, 3, 2].filter((n) => n <= left && j.J.fits(n, s.at + n / 2)), good = ok.filter((n) => !j.J.overAt(n, s.at + n / 2)), n = (good.length ? good : ok)[0];
          const item = n ? st.ui.pile.querySelector(`[data-len="${n}"]`) : null, T = n ? j.uAt(s.at + n / 2) : null; if (!item || !T) { await sleep44(300); continue; }
          const r = item.getBoundingClientRect(), x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
          ev(item, 'pointerdown', x0, y0); at(x0, y0);
          for (let i = 1; i <= 12; i++) { await sleep44(40); const x = x0 + ((T.x - x0) * i) / 12, y = y0 + ((T.y - y0) * i) / 12; ev(item, 'pointermove', x, y); at(x, y); }
          await sleep44(700); ev(item, 'pointerup', T.x, T.y); await sleep44(500);
        } else await sleep44(300);
      }
    } finally { gh.remove(); }
  }
  /** the craftsman's test (v2 §8): three short jobs at level 2 — pass at כשר; מהודר in all three: the gold seal; free tries; the fifth failure: the demonstration */
  function test44() {
    const T = S.test44 || (S.test44 = { jobs: {}, passed: false, seal: false }); save42(S);
    const label = { lift: 'גלגל הדריכה', course0: 'נדבך', corner: 'מוט הברזל' };
    const next = () => TEST44.jobs.find((j) => !(T.jobs[j] && (T.jobs[j].passed || T.jobs[j].demo)));
    const go = (j) => runAct(j, TEST44.L, (q, rating) => after(j, rating));
    const run = () => { const j = next(); if (!j) { end(); return; } line(''); go(j); };
    function after(j, rating) {
      if (T.demoing === j) { T.demoing = null; const r = T.jobs[j] || { tries: 0, fails: 0, best: null }; r.demo = true; T.jobs[j] = r; save42(S); card('רב האומנים הראה', [`${label[j]} — הושלם`, '~בלי חותם · אפשר לתרגל אותה בחצר האומנים'], 'הלאה', run); return; }
      const { rec, next: nx } = testTry44(T.jobs[j], rating); T.jobs[j] = rec; save42(S);
      o.emit && o.emit('h44try', { job: j, rating, tries: rec.tries, next: nx });
      if (nx === 'pass') card(rating === 'mehudar' ? `${RATE30.icon.mehudar} מהודר` : `${RATE30.icon.kasher} כשר — עברתם`, [`${label[j]}`], 'הלאה', run);
      else if (nx === 'again') card('עוד ניסיון', [`${label[j]} — ${RATE30.he[rating]}`, `ניסיונות: ${rec.tries} · בלי הגבלה`], 'שוב', () => go(j));
      else card('רב האומנים מדגים', [`${label[j]} — אחרי חמישה ניסיונות הוא מראה, ואתם ממשיכים`, '~המחשה'], 'הראו לי', () => { T.demoing = j; save42(S); go(j); setTimeout(() => demo44(j), 900); });
    }
    function end() {
      const e = testEnd44(T.jobs); T.passed = true; T.seal = !!(e && e.seal); T.at = Date.now(); save42(S);
      o.emit && o.emit('h44test', { seal: T.seal, shown: !!(e && e.shown) });
      card(T.seal ? 'חותם זהב' : 'עברתם את מבחן האומן', T.seal ? ['!🏅 חותם זהב — מהודר בשלוש העבודות', 'נפתח: פרק ב׳ — העזרות', `~${TEST44.src}`] : ['נפתח: פרק ב׳ — העזרות', e && e.shown ? '~רב האומנים הראה חלק מהעבודות — בלי חותם' : '~"מהודר" בשלושתן — חותם זהב; אפשר לתרגל בחצר האומנים', `~${TEST44.src}`], 'לבנות', () => stop(true));
    }
    if (next()) card('מבחן אומן — לפני פרק ב׳', ['שלוש עבודות קצרות, ברמה 2: גלגל הדריכה · נדבך · מוט הברזל', 'עוברים ב"כשר" · "מהודר" בשלושתן — חותם זהב · ניסיונות בלי הגבלה', `~${TEST44.src}`], 'להתחיל', run, 'לחצר האומנים קודם', () => stop(false, 'yard'));
    else end();
  }
  /** ── build 48 ── ספר הפגימות (v2 §4.4): a page for every type met — its verdict and its source; the decoys too */
  function book48(back) {
    const B = S.book48 || {}, pages = F.WOOD48_TYPES.filter((t) => B[t]).map((t) => { const T = F.WOOD48[t]; return [`${T.bad ? '✗' : '✓'} ${T.he} — ${T.bad ? 'לא למזבח' : 'כשר'}`, `~${T.why}`]; }).flat();
    card('ספר הפגימות', pages.length ? pages : ['עוד לא נמצאה פגימה'], 'חזרה', back);
  }
  /** חצר האומנים (hard-fun §5): every variant he has met, at any level opened; points and a title per family — no building */
  function yard44() {
    const Y = S.yard || (S.yard = { pts: {}, runs: 0 }); save42(S);
    const met = new Set(R.grades.map((g) => g[0]).concat(S.wall && S.wall.grades ? S.wall.grades.map((g) => g[0]) : []).concat(S.soreg && S.soreg.grades ? S.soreg.grades.map((g) => (/^lattice/.test(g[0]) ? 'lattice' : g[0])) : []).concat(S.gates && S.gates.grades ? S.gates.grades.map((g) => (g[0] === 'leaf7' ? 'leaf' : g[0])) : []).concat(S.nashim && S.nashim.grades ? S.nashim.grades.flatMap((g) => (g[0] === 'wood' ? ['log'] : g[0] === 'beams' ? ['beam'] : g[0] === 'pegs' ? ['peg'] : g[0] === 'corner' ? ['beam', 'peg'] : [g[0]])) : []));   // (build 46–47: stages 03 and 04's variants once met there) if (R.done) for (const v of YARD44.slice(0, 6)) met.add(v.part);   // (build 45: stage 02's variants once met there)
    const has = (v) => (v.part === 'rock' ? [...met].some((p) => /^rock/.test(p)) || met.has('rock') : met.has(v.part) || (v.part === 'course0' && met.has('course1')));
    const list = YARD44.filter(has), famH = { lift: 'הרמה', place: 'הנחה', inspect: 'בדיקה', fit: 'התאמה' }, fromTest = o.from === 'test'; let visit = 0;   // (from the test's card: after two runs רב האומנים asks — back to the test, the naive kid's runs stayed in the yard)
    function open() {
      line(''); st.part = 'menu';
      const fams = ['lift', 'place', 'inspect', 'fit'].map((f) => `<i>${famH[f]} · ${Y.pts[f] | 0} נק׳${title44(f, Y.pts[f]) ? ` · ${title44(f, Y.pts[f])}` : ''}</i>`).join('');
      const rows = list.map((v, k) => { const top = Math.max(1, F.famLevel(S, v.fam)); let b = ''; for (let L = 1; L <= top; L++) b += `<button type="button" data-k="${k}" data-l="${L}" aria-label="${esc(v.he)} רמה ${L}">${L}</button>`; return `<div class="h44-row"><b>${esc(v.he)}</b><span>${b}</span></div>`; }).join('');
      const seal = S.test44 && S.test44.seal ? '<p class="h44-seal">🏅 חותם זהב — מבחן אומן</p>' : '';
      const sh = el('h42-card', `<div role="dialog" class="h44-yard" aria-label="חצר האומנים"><h2>חצר האומנים</h2><small>תרגול — בלי לבנות · בחרו עבודה ורמה · התארים: טיוטה</small><div class="h44-fam">${fams}</div>${seal}<div class="h44-rows">${rows}</div>${Object.keys(S.book48 || {}).length ? `<button type="button" data-b="book">📖 ספר הפגימות (${Object.keys(S.book48).length})</button>` : ''}<button type="button" data-b="back">${fromTest ? 'חזרה למבחן' : 'חזרה'}</button></div>`);
      sh.addEventListener('pointerdown', (e) => e.stopPropagation());
      sh.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); const v = list[+b.dataset.k], L = +b.dataset.l; sh.remove(); st.card = null; const again = () => runAct(v.part, L, done); function done(q, rating) { visit++; const head = `${v.he} — ${RATE30.icon[rating] || ''} ${RATE30.he[rating] || ''}`, ln = [`רמה ${L} · +${PTS44[rating] | 0} נק׳`]; if (fromTest && visit >= 2) card(head, [...ln, '~רב האומנים: מוכנים למבחן? · המחשה'], 'למבחן', () => stop(false), 'עוד פעם', again); else card(head, ln, 'עוד פעם', again, 'לחצר', open); } again(); }));
      sh.querySelector('[data-b="back"]').addEventListener('click', (e) => { e.stopPropagation(); sh.remove(); st.card = null; stop(false); });
      { const bk = sh.querySelector('[data-b="book"]'); if (bk) bk.addEventListener('click', (e) => { e.stopPropagation(); sh.remove(); st.card = null; book48(open); }); }   // ── build 48 ── ספר הפגימות
      doc.body.appendChild(sh); st.card = sh;
    }
    open();
  }

  /* ── the frame ── */
  function frame(ms) {
    if (!st.on) return;
    const t = ms / 1000, dt = st.last ? Math.min(0.1, Math.max(0, t - st.last)) : 0.016; st.last = t;
    if (o.keepAwake) o.keepAwake();
    if (st.anims && st.anims.length) st.anims = st.anims.filter((A2) => { A2.t += dt; const k = Math.min(1, A2.t / A2.T); A2.m.position.y = A2.y0 + (A2.y1 - A2.y0) * k * k; return k < 1; });   // ── build 45 ── (a stone settling)
    if (st.wet > 0) dry45(dt);
    if (st.card) return;
    const part = st.part;
    if (part === 'open' || part === 'reveal') { const p = PART[part]; if (p.frame(dt)) { if (p.end) p.end(); if (part === 'open') { const r = st.resumeAt; st.resumeAt = null; startPart(r != null ? r : R.part + 1); } else { st.part = 'done'; } } return; }
    if (part === 'done' || part === 'out') return;
    if (part === 'menu') { const h0 = hero(), fv = followView(h0); camTo(fv.p, fv.t, Math.min(1, dt * 2)); return; }   // ── build 44 ──
    const d = walkStep(dt), h = hero();
    if (st.pending) {   // walking to the part's place
      camTo(followView(h).p, followView(h).t, Math.min(1, dt * 3));
      if (d < 2.6) { const p = st.pending; st.pending = null; try { stages.hero.drive(0, 0); } catch (e) { /* */ } if (p.begin) p.begin(); }
      return;
    }
    if (part === 'rope') { st.near = d < 2.6; camTo(followView(h).p, followView(h).t, Math.min(1, dt * 3)); if (PART.rope.frame()) endPart(); return; }
    if (st.pull) { st.pull.t += dt; const fv = followView(h), u = Math.min(1, st.pull.t / 2.6), k = Math.sin(u * Math.PI); camTo(fv.p.map((v, i) => (i === 1 ? v + 30 * k : v + (v - fv.t[i]) * 1.6 * k)), fv.t, Math.min(1, dt * 4)); if (u >= 1) st.pull = null; return; }
    const J = st.job; if (!J) return;
    R.hands += dt;
    const O = st.obj || { x: h.x, y: h.y + 1, z: h.z };
    const v = (J.view && J.view(h)) || actView(O); camTo(v.p, v.t, J.view ? Math.min(1, dt * 2.5) : st.finger > 0 ? 0 : Math.min(1, dt * 2));   // (build 46: an act's own view — the lattice front-on, the walk along the soreg, the procession low)
    if (J.frame(dt)) endPart();
  }

  // ── build 45 ── (#7) rain at night (תענית כג ע"א): a morning whose caravan came during stage 02 opens wet — the plaza's paving dark and
  // glossy (stages.wet), the props' stones darker, a few puddles — and dries as the sun rises (≈ 70 s); no effect on the work
  const STONE0 = STONE.color.clone(), BOSS0 = BOSS.color.clone();
  function wetMorning() {
    st.wet = 1; st.puddles = [];
    try { const pm = new THREE.MeshStandardMaterial({ color: '#5A6470', roughness: 0.05, metalness: 0.35, transparent: true, opacity: 0.8, depthWrite: false });
      for (const [dx, dz, r] of [[-6, 2, 1.6], [4, 3, 1.1], [7, 9, 1.9], [-3, 9, 1.2], [12, -2, 1.4]]) { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 18), pm.clone()); m.rotation.x = -Math.PI / 2; m.position.set(base.x + dx, gy(base.x + dx, base.z + dz) + 0.06, base.z + dz); m.scale.set(1, 0.7 + 0.3 * Math.sin(dx), 1); st.props.root && st.props.root.add(m); st.puddles.push(m); } } catch (e) { /* */ }
    dry45(0);
    setTimeout(() => { if (!st.on || !doc || !st.ui.root) return; const w = el('h42-g h45-wet', esc(LINE42.wet.split(' · ')[0])); w.style.left = `${W() / 2}px`; w.style.top = `${H() * 0.25}px`; st.ui.root.appendChild(w); setTimeout(() => w.remove(), 2400); }, 1200);
  }
  function dry45(dt) {
    st.wet = Math.max(0, st.wet - dt / 70); const k = st.wet;
    try { if (stages.wet) stages.wet(k); } catch (e) { /* */ }
    STONE.color.copy(STONE0).multiplyScalar(1 - 0.3 * k); BOSS.color.copy(BOSS0).multiplyScalar(1 - 0.3 * k);
    if (st.puddles) for (const m of st.puddles) m.material.opacity = 0.8 * k;
  }
  function start() {
    if (st.on || !doc) return false;
    st.on = true; doc.body.classList.add('h42-on'); ui(); props();
    try { if (view.closeCam) view.closeCam(true); } catch (e) { /* */ }
    if (MODE !== 'stage') {   // ── build 44 ── the yard and the test: by the wheel, a quiet view; their sheet
      if (st.ui.mat) st.ui.mat.hidden = true;
      try { const p = standOf('lift'); stages.hero.setPos(p.x, p.z, 0); stages.hero.show(true); } catch (e) { /* */ }
      st.part = 'menu'; if (MODE === 'yard') yard44(); else test44();
      o.emit && o.emit(MODE === 'yard' ? 'h44yard' : 'h44testStart', {});
      return true;
    }   // (main.js's OrbitControls keep the camera 35 amot from its target and the near plane at 4: the stage's follow (17) and act (12) views were pushed back to 35 — the picture farther than the frame, the marks projected off the things; Phase B's close-up gives way the same way)
    // the morning's caravan (and the developer's flags)
    const add = +(qs('h42day') || 0) + (globalThis.__H42_DAY | 0), came = F.caravan42(S.mat, Date.now(), add);
    if (STG === 'nashim') { try { if (stages.setStage) stages.setStage('nashim', 'building', Math.max(0.3, Math.min(0.92, (R.part - 1) / (PARTS.length - 1))), { instant: true }); } catch (e) { /* */ } }   // ── build 48 ── (the court and its chambers' walls already up — open above)
    if (STG === 'gates') hole46(true, [PL.gate.x - 10, PL.gate.x + 10, PL.gate.z - 4, PL.gate.z + 1.8], 80, PL.gate.y + 0.2);   // ── build 47 ── (the gatehouse's scaffold not drawn in front of his gate)
    if (STG === 'gates') { try { if (stages.setStage) stages.setStage('gates', 'building', Math.max(0.04, Math.min(0.92, (R.part - 1) / (PARTS.length - 1))), { instant: true }); } catch (e) { /* */ } }   // ── build 47 ──
    if (STG === 'soreg') { const x0 = PL.soreg.x - 2 * (PAN46.w + 0.06) - PAN46.w / 2 - 0.25, x1 = PL.soreg.x + PAN46.w / 2 + 0.25; hole46(true, [x0, x1, PL.soreg.z - 0.9, PL.soreg.z + 0.9]); try { if (stages.setStage) stages.setStage('sorag', 'building', Math.max(0.04, Math.min(0.92, (R.part - 1) / (PARTS.length - 1))), { instant: true }); } catch (e) { /* */ } }   // ── build 46 ──
    if (STG === 'wall') { R.hole = H45(); hole45(true, R.hole); if (came > 0 || qs('h45wet') === '1') wetMorning(); try { if (stages.setStage) stages.setStage('wall', 'building', Math.max(0, (R.part - 1) / (PARTS.length - 2)), { instant: true }); } catch (e) { /* */ } }   // ── build 45 ── (the wall's own model as far as it is built)
    if (qs('h42stock') != null) S.mat.stock = +qs('h42stock') | 0;
    const at = qs('h42at'); if (at && PARTS.includes(at)) R.part = PARTS.indexOf(at);
    matChip(); save42(S);
    // where he stands at the start: by the first peg (a new stage) or at his part
    try { const p = R.part <= 1 ? PL.peg0 : standOf(PARTS[R.part]) || PL.peg0; stages.hero.setPos(p.x, p.z, 0); stages.hero.show(true); } catch (e) { /* */ }
    // (a new stage: the flyover in full; back to it: the flyover's 3 s, then his part)
    const go = () => { if (R.part > 0 && R.part < PARTS.indexOf('reveal')) { st.resumeAt = R.part; st.part = 'open'; PART.open.begin(); } else startPart(R.part); };
    if (came && R.part > 0) card('בוקר טוב', [LINE42.caravan, `+${F.MAT42.daily * came} אבנים`], 'לעבודה', go); else go();
    o.emit && o.emit('h42start', { part: PARTS[R.part] });
    return true;
  }
  function stop(done, next) {
    if (!st.on) return; st.on = false;
    try { if (st.wet > 0 && stages.wet) stages.wet(0); STONE.color.copy(STONE0); BOSS.color.copy(BOSS0); } catch (e) { /* */ }
    try { if (view.closeCam) view.closeCam(false); } catch (e) { /* */ }
    try { stages.hero.drive(0, 0); } catch (e) { /* */ }
    dropUI(); dropProps();
    if (STG === 'wall' && MODE === 'stage' && !(R.stones && R.stones.length)) hole45(false);
    if (STG === 'soreg' || STG === 'gates') hole46(false);   // ── build 46 ── (left before the end: no gap without his stones)
    if (o.onExit) o.onExit(!!done, next || '');
  }
  const api = {
    start, stop, frame, get on() { return st.on; },
    state: () => ({ mode: MODE, stg: STG, test: S.test44 || null, yard: S.yard || null, rev: st.rev ? Math.round(st.rev.t * 10) / 10 : null, part: st.part, idx: R.part, job: !!st.job, pending: !!st.pending, hold: !!st.hold, finger: st.finger, mat: S.mat.stock | 0, grades: R.grades.slice(), hands: Math.round(R.hands), card: !!st.card, fam: Object.fromEntries(F.FAM42.map((f) => [f, famL(f)])) }),
    sig: () => `${MODE}|${st.part}|${R.part}|${R.grades.length}|${st.card ? 'card' : ''}|${st.job && st.job.frame ? 'job' : ''}|${S.test44 ? JSON.stringify(Object.values(S.test44.jobs || {}).map((r) => [r.tries, r.passed, r.demo])) : ''}`,
    line: () => (st.ui.line ? st.ui.line.textContent : ''),
    save: () => S, places: () => ({ PL, STAND, base }),
    heroBox: () => { const h = hero(); return { x: h.x, y: h.y, z: h.z, h: heroHeight() }; },
    objAt: () => (st.obj ? { x: st.obj.x, y: st.obj.y, z: st.obj.z } : null), camAt: () => ({ p: [cq.p.x, cq.p.y, cq.p.z], t: [cq.t.x, cq.t.y, cq.t.z] }),   // (build 43: the camera's measure — tools/cam41.js)
    job: () => (st.job ? { kind: st.job.kind || '', s: st.job.J ? st.job.J.state() : null, ref: st.job } : null),   // (the tools read the act: never write)
  };
  try { globalThis.__H42 = api; } catch (e) { /* */ }
  return api;
}
