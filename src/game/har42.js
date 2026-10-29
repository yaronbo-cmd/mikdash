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
import { walk39, pan40, CAM41, HERO41, WALK39, obj51, OBJ51, share51 } from './twin.js';
import { createTouch40, bb51 } from '../avodah/shift/touch40.js';
import { buzz42 } from '../avodah/shift/prefs28.js';
import { RATE30, rate30 } from '../avodah/shift/rate30.js';
import * as F from './fam42.js';
import * as TX from '../tex.js';
import { createVoyage49, figure49 } from './voyage49.js';   // ── build 49 ── (the voyage of the doors: Nicanor's, once)
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
export const PARTS49 = Object.freeze(['open', 'voyage', 'lever', 'hang', 'steps', 'reveal']);
export const PARTS55 = Object.freeze(['open', 'inspect', 'field', 'nail', 'iron', 'last', 'reveal']);   // ── build 55 ── stage 08, היסוד (docs/specs/shlav-alef-08-16-he.md §3 "08")
/** ── build 55 ── the altar's footprint (stages.js yesod.foot: its north-west corner, 32 × 32 — מדות ג, א); the views' shares of the width */
export const ALT55 = Object.freeze({ x0: -54, z0: -19.5, side: 32 });
export const VIEW55 = Object.freeze({ stone: 0.45, edge: 0.66, course: 0.5 });
export const SRC55 = Object.freeze([
  'אחד אבני הכבש ואחד אבני המזבח, מבקעת בית כרם — מדות ג, ד · טיוטה',
  'שהברזל פוסל בנגיעה, ובפגימה לכל דבר — מדות ג, ד · טיוטה',
  'היה מהלך על פני כל הצפון ועל פני כל המערב, ואוכל בדרום אמה אחת ובמזרח אמה אחת — מדות ג, א · טיוטה',
]);
export const PARTS56 = Object.freeze(['open', 'light', 'tap', 'sovev', 'thread', 'reveal']);   // ── build 56 ── stage 09, הסובב וחוט הסיקרא (§3 "09")
export const SRC56 = Object.freeze([
  'עלה חמש וכנס אמה, זה הסובב — מדות ג, א · טיוטה',
  'וחוט של סיקרא חוגרו באמצע, להבדיל בין דמים העליונים לדמים התחתונים — מדות ג, א · טיוטה',
  'שהברזל פוסל בנגיעה, ובפגימה לכל דבר — מדות ג, ד · טיוטה',
  'המנורה, הפטיש ואבן העדות, האנך, הקנה והפלס — המחשה',
]);
export const PARTS57 = Object.freeze(['open', 'decoy', 'kevesh', 'sid', 'reveal']);   // ── build 57 ── stage 10, גוף המזבח והכבש (§3 "10")
export const SRC57 = Object.freeze([
  'וכבש היה לדרומו של מזבח, "שְׁלֹשִׁים וּשְׁתַּיִם עַל רֹחַב שֵׁשׁ עֶשְׂרֵה" — מדות ג, ג · טיוטה',
  '"וּמְלַבְּנִין אוֹתָן פַּעֲמַיִם בַּשָּׁנָה, אַחַת בַּפֶּסַח וְאַחַת בֶּחָג" — מדות ג, ד · טיוטה',
  '"לֹא הָיוּ סָדִין אוֹתָן בְּכָפִיס שֶׁל בַּרְזֶל" — מדות ג, ד · טיוטה',
  'רבי: "מְלַבְּנִים אוֹתוֹ בְמַפָּה" — מדות ג, ד · טיוטה',
  'שהברזל פוסל בנגיעה, ובפגימה לכל דבר — מדות ג, ד · טיוטה',
  'המאובן, הגומות והטחב, מד השיפוע, המטלית והסיד — המחשה',
]);
/** ── build 57 ── the kevesh in the world (temple.js: x −46…−30, from the altar's south face z 10.5 at its top, 25, down to the court's floor, 16, at z 42.5) */
export const KEV57 = Object.freeze({ x0: -46, x1: -30, zTop: 10.5, zFoot: 42.5, y0: 16, y1: 25 });
/** ── build 57 ── the whitewash's face: a patch of the altar's east face (x −23) in the morning light, its width's share of the frame */
export const SID57V = Object.freeze({ x: -22.96, z0: -5, z1: 1, y0: 16.6, y1: 20.6, share: 0.7 });   // (under the red line — it stays red over the white)
/** ── build 57 ── (§1 rule 12) the end card on the right two-thirds: him seen in the left third — the turn of the view (its share of the half-width) */
export const CARD57 = Object.freeze({ at: 0.62 });
export const PARTS50 = Object.freeze(['open', 'compass', 'benches', 'hub', 'wheel', 'dome', 'reveal']);   // ── build 50 ── stage 07, הלשכות: "קשתות ועיגולים" (v2 §10 "07")   // ── build 49 ── stage 06, שער ניקנור וט״ו המעלות (v2 §10 "06", §11)
// ── build 53 ── Phase A, round 1 (docs/specs/bikoret-mefakeach-27-10-he.md §4): the opening's fade after the first viewing (T s, the first pre s
// under the black at the opening's viewpoint — stage 01's before-picture); the guided walk's slowing near the target (as Phase B's WALK51) ── /build 53 ──
export const FADE53 = Object.freeze({ T: 1.1, pre: 0.15 });
export const WALK53 = Object.freeze({ near: 6, v: 5, lead: 4, under: 0.9 });
/** ── build 53 ── the guided walk's slowing near the place (pure): from WALK53.near + lead amot out, the guide's pace capped at v × under of
 *  the walk's top (walk39 eases toward it — he is at most v by near) ── /build 53 ── */
export function slow53(g, top = 14) {
  if (!g || !Number.isFinite(g.left) || g.left >= WALK53.near + WALK53.lead || !(top > 0)) return g;
  return Object.assign({}, g, { k: Math.min(g.k == null ? 1 : g.k, (WALK53.v * WALK53.under) / (top * WALK39.speed)) });
}
// ── build 53 ── the object rule in Phase A (§4 must 1): the stages whose act views take Phase B's obj51 now (03–07: build 54)
// ── build 54 ── Phase A, round 2 (stages 03–07; docs/specs/bikoret-mefakeach-27-10-he.md §2 and §4): the lintel's stand (its share of the height and
// of the half-width, to the left), the warning stones' walk (amot/s) and the gauge, the lattice's window (its share of the width), the parts whose
// views now take the object rule (obj51 + fig53, as stages 01–02's act view) ── /build 54 ──
export const LINTEL54 = Object.freeze({ h: 0.275, x: 0.62 });
export const WARN54 = Object.freeze({ v: 3 });
export const LAT54 = Object.freeze({ win: 0.4, fill: 0.72, gx: 0.3, gy: 0.25 });   // (gx, gy: the gap this share of the half-frame right of and below the middle — clear of the window)
export const OBJ54 = Object.freeze({ parts: Object.freeze(['warn', 'leaf', 'wood', 'hub', 'wheel']), gate: 0.86, leaf7: 0.78 });   // (gate: the lintel's and the heavy leaf's lift a little nearer — 29 % → over 30; obj51 would slide past his left-third place; leaf7: the heavy leaf's lift nearer still — its leaf 32 % wide on average at 0.86, 28 % of the frames under 30: c54A-04R)
export const OBJ53 = Object.freeze({ stg: Object.freeze(['har', 'wall']), big: 0.45, margin: 0.06 });   // (margin: the thing kept 6 % over the rule when he is stepped back from — at the rule's edge the second AFTER page held it in 43–64 % of the frames)
/** his figure on a view (pure; as twin.js's fig51): his middle across the width (NDC), his half-height share s, whole in the frame */
export function fig53(P, T, H, tanH, tanV) {
  let fx = T[0] - P[0], fy = T[1] - P[1], fz = T[2] - P[2]; const fl = Math.hypot(fx, fy, fz) || 1; fx /= fl; fy /= fl; fz /= fl;
  const rl = Math.hypot(fx, fz) || 1, rx = -fz / rl, rz = fx / rl, ux = -rz * fy, uy = rz * fx - rx * fz, uz = rx * fy;
  const pr = (y) => { const vx = H.x - P[0], vy = y - P[1], vz = H.z - P[2], d = vx * fx + vy * fy + vz * fz; return d > 0.2 ? { x: (vx * rx + vz * rz) / (d * tanH), y: (vx * ux + vy * uy + vz * uz) / (d * tanV), d } : null; };
  const a = pr(H.y), b = pr(H.y + H.h), m = pr(H.y + H.h / 2); if (!a || !b || !m) return null;
  const inS = (q) => Math.abs(q.x) <= 1 && Math.abs(q.y) <= 1;
  return { x: m.x, s: Math.abs(b.y - a.y) / 2, whole: inS(a) && inS(b) };
}
// ── build 53 ── the macros and the side view (§4 important 9, 10; the rock's ש4): the share of the width each view gives its thing
export const VIEW53 = Object.freeze({ trace: 0.7, rock: 0.62, course: 0.44, courseMin: 9, courseMax: 24, roll: 17 });
// ── build 53 ── the rope (§4 nice 19): the pull off the line (amot/s of drift at each level) and the deviation that is still מהודר / כשר
export const ROPE53 = Object.freeze({ drift: Object.freeze([0, 0.32, 0.42, 0.52, 0.6]), steer: 0.9, ok: 1.2, kasher: 2.6 });   // (from near + lead amot out: v × under — walk39's ease (tau 0.18) then has him ≤ v by near: 4.75 amot/s at most, simulated)
const FAMOF = { rope: 'rope', light: 'inspect', tap: 'inspect', sovev: 'place', thread: 'fit', /* ── build 56 ── */ decoy: 'inspect', kevesh: 'place', sid: 'place', /* ── build 57 ── */ inspect: 'inspect', field: 'place', nail: 'inspect', iron: 'inspect', last: 'place', stone: 'inspect', mud: 'inspect',   /* ── build 55 ── */ compass: 'place', benches: 'place', hub: 'fit', wheel: 'lift', dome: 'place', arch: 'place', voyage: 'lift', lever: 'lift', hang: 'fit', steps: 'place', step: 'place', wood: 'inspect', log: 'inspect', beams: 'fit', beam: 'fit', pegs: 'fit', peg: 'fit', corner48: 'fit', lintel: 'lift', leaf: 'fit', leaf7: 'fit', names: 'inspect', lattice0: 'place', lattice1: 'place', lattice2: 'place', lattice: 'place', warn: 'place', line: 'place', pulley: 'lift', wcourse0: 'place', wcourse1: 'place', giant: 'place', wcorner: 'place', top: 'place', lift: 'lift', corner: 'place', rock0: 'inspect', rock1: 'inspect', rock2: 'inspect', course0: 'place', course1: 'place', roll: 'place', pave: 'place', trace: 'place' };
const MATOF = { compass: 'compass', benches: 'benches', hub: 'hub', wheel: 'wheel', dome: 'dome', voyage: 'voyage', lever: 'lever', hang: 'leaf49', steps: 'steps', wood: 'wood', beams: 'beams', pegs: 'pegs', corner48: 'corner48', lintel: 'lintel', leaf: 'leaf', leaf7: 'leaf7', lattice0: 'lattice', lattice1: 'lattice', lattice2: 'lattice', warn: 'warnst', pulley: 'pulley', wcourse0: 'wstone', wcourse1: 'wstone', giant: 'giant', wcorner: 'wstone', top: 'top', lift: 'lift', rock0: 'rock', rock1: 'rock', rock2: 'rock', course0: 'stone', course1: 'stone', roll: 'roll', pave: 'pave' };
/** the lines (short; each with its source, or המחשה) */
export const LINE42 = Object.freeze({   // ── build 43 ── (one short instruction; after " · " the source chip — the long explanations are on the card)
  rope: 'החזיקו — הולכים ליתד; גררו הצידה — ישר על הקו · "חמש מאות אמה" — מדות ב, א · טיוטה',   // ── build 53 ── (the rope's steer — §4 nice 19) ── /build 53 ──
  walk: 'החזיקו — הולכים לעבודה הבאה',
  lift: 'החזיקו על הגלגל — הוא מרים; שחררו לפני החלון · גלגל דריכה — ויטרוביוס י, ב · המחשה',
  lift2: 'גררו ⬇ — מורידים מעט · המחשה',   // ── build 53 ── (the arrow: which way — §4 must 5)
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
  pulley: 'משכו ⬇\u00a0·\u00a0החזיקו\u00a0·\u00a0משכו ⬇ · גלגלת — המחשה',   // ── build 53 ── three signs for 14 words (§4 nice 21; the inner dots joined by no-break spaces: the line's ' · ' is the source's) ── /build 53 ──
  pulley2: 'גבוה מדי — הרפו מעט, החבל יורד · המחשה',
  giant: 'אבן ענק — המנוף מוריד; גררו את המוט — דחיפה קצרה · המחשה',   // (build 45: "הניפו" was no task to the naive kid K45-W — the verb of stage 01's crowbar)
  wcorner: 'אבן הפינה — הפוכה לזו שמתחת · המחשה',
  top: 'הנדבך העליון — כולו שלכם · המחשה',
  retreat: 'האנך ירד: אבן בולטת — גררו אותה פנימה · המחשה',
  yishar: 'יישר כח! — הצוות · טיוטה',
  wet: 'בלילה ירד גשם, בבוקר שמש · תענית כג ע"א · טיוטה',
  mine: 'האבנים שלך · טיוטה',
  wood: 'סובבו, קלפו ∙ כשר ➡ פסול ⬅ · "כל עץ שנמצא בו תולעת, פסול" — מדות ב, ה · טיוטה',   // ── build 48 ── stage 05's lines   // ── build 55 ── (rule 13 of the 08–16 spec: kasher right, pasul left in the whole game) ── /build 55 ──
  woodHow: 'החלקה למעלה — מסובבת · לאורך — מקלפת · הקשה — מסמנת · המחשה',
  // ── build 55 ── stage 08's lines (§1 rule 4: a verb and the gesture's arrow, five words at most) ── /build 55 ──
  stone55: 'סובבו ↔ ∙ כשר ➡ פסול ⬅ · "שהברזל פוסל בנגיעה, ובפגימה לכל דבר" — מדות ג, ד · טיוטה',
  mud55: 'נגבו את הבוץ ⟲ ∙ כשר ➡ פסול ⬅ · המחשה',
  nail55: 'העבירו אצבע לאט ↔ · "כדי שתחגור בה צפורן" — חולין יח ע"א · טיוטה',
  slow55: 'לאט — כדי להרגיש ↔ · המחשה',
  caught55: 'נתפסה! פסול ⬅ · "כדי שתחגור בה צפורן" — חולין יח ע"א · טיוטה',
  smooth55: 'השפה חלקה ∙ כשר ➡ · המחשה',
  iron55: 'סובבו מול האור ↔ ∙ כשר ➡ פסול ⬅ · המחשה',
  ironWhy55: 'האבן שלמה. אבל ברזל נגע בה. · "שהברזל פוסל בנגיעה" — מדות ג, ד · טיוטה',
  field55: 'גררו לרווח ⤵ ∙ הקישו ⟳ · "אחד אבני הכבש ואחד אבני המזבח, מבקעת בית כרם" — מדות ג, ד · טיוטה',
  fieldTurn55: 'לא נכנסת — הקישו ⟳ · המחשה',
  fieldOther55: 'לא זו — אבן אחרת ⤵ · המחשה',
  fieldGap55: 'נשאר רווח — אבן מילוי ⤵ · המחשה',
  fieldExtra55: 'כאן אין רווח · המחשה',
  last55: 'גררו ⤵ רק על היסוד · "מהלך על פני כל הצפון ועל פני כל המערב" — מדות ג, א · טיוטה',
  noYesod55: 'כאן אין יסוד · "ואוכל בדרום אמה אחת, ובמזרח אמה אחת" — מדות ג, א · טיוטה',
  yesodDone55: 'זה היסוד · "עלה אמה וכנס אמה, זה היסוד" — מדות ג, א · טיוטה',
  // ── build 56 ── stage 09's lines ── /build 56 ──
  lamp56: 'הזיזו את האור ⟲ · "ובפגימה לכל דבר" — מדות ג, ד · טיוטה',
  rakeSeen56: 'סדק באור הצד! פסול ⬅ · המחשה',
  rakeWhole56: 'שלמה גם באור צד ∙ כשר ➡ · המחשה',
  tap56: 'הקישו 👆 ∙ השוו לעדות · אבן שלמה מצלצלת, סדוקה עמומה — המחשה',
  tapFirst56: 'הקישו קודם על העדות 👆 · המחשה',
  tapNew56: 'הקישו על החדשה 👆 · המחשה',
  tapDecide56: 'השוו ∙ כשר ➡ פסול ⬅ · המחשה',
  course56: 'גררו ⤵ ∙ יישרו לאנך ⬅ · "עלה חמש וכנס אמה, זה הסובב" — מדות ג, א · טיוטה',
  courseOut56: 'בולטת — דחפו פנימה ⬅ · המחשה',
  courseIn56: 'שקועה — משכו החוצה ➡ · המחשה',
  courseTrue56: 'ישרה לאנך ∙ גררו הבאה ⤵ · המחשה',
  thread1_56: 'גררו את היתד ⬍ · "וחוט של סיקרא חוגרו באמצע" — מדות ג, א · טיוטה',
  thread2_56: 'ימין — לאותו גובה ⬍ · בלי קנה: רק הפלס על החוט — המחשה',
  thread3_56: 'מתחו ↔ ושחררו · המחשה',
  threadWash56: 'עקום — שוטפים ושוב ⟲ · "להבדיל בין דמים העליונים לדמים התחתונים" — מדות ג, א · טיוטה',
  threadDone56: 'חוט הסיקרא — באמצע · "להבדיל בין דמים העליונים לדמים התחתונים" — מדות ג, א · טיוטה',
  // ── build 57 ── stage 10's lines (§1 rule 4: a verb and the gesture's arrow, five words at most) ── /build 57 ──
  check57: 'בדקו ∙ כשר ➡ פסול ⬅ · "ובפגימה לכל דבר" — מדות ג, ד · טיוטה',
  wiped57: 'נוגב — שלמה ∙ כשר ➡ · בוץ וטחב — לא פגימה · המחשה',
  fossil57: 'האצבע עוברת חלק ∙ כשר ➡ · מאובן — טבע, לא פגימה · המחשה',
  pits57: 'לא נתפסת — גומות ∙ כשר ➡ · גומות טבעיות — לא פגימה · המחשה',
  more57: 'חלק — בדקו עוד ↔ · שני סימנים באבן אחת · המחשה',
  catch57: 'נתפסה בסדק! פסול ⬅ · "ובפגימה לכל דבר" — מדות ג, ד · טיוטה',
  plain57: 'חלקה — הקישו או סובבו ↔ · המחשה',
  edge57: 'נתפסה בשפה! פסול ⬅ · "כדי שתחגור בה צפורן" — חולין יח ע"א · טיוטה',
  edgeOk57: 'עברה חלק ∙ השפה שלמה ↔ · המחשה',
  witness57: 'העדות מצלצלת ∙ הקישו על החדשה 👆 · המחשה',
  ring57: 'מצלצלת ∙ אין סדק עמוק 👆 · אבן שלמה מצלצלת — המחשה',
  dull57: 'עמומה — סדוקה! פסול ⬅ · צליל עמום — המחשה',
  kevesh57: 'גררו ⤵ ∙ כוונו גובה ⬍ · "שְׁלֹשִׁים וּשְׁתַּיִם עַל רֹחַב שֵׁשׁ עֶשְׂרֵה" — מדות ג, ג · טיוטה',
  keveshUp57: 'נמוכה — הרימו ⬆ · הבועה באמצע = שיפוע אחיד · המחשה',
  keveshDown57: 'גבוהה — הורידו ⬇ · הבועה באמצע = שיפוע אחיד · המחשה',
  keveshEven57: 'אחיד! ∙ גררו הבאה ⤵ · המחשה',
  keveshOff57: 'כמעט — הבאה ממשיכה ממנה ⤵ · המחשה',
  keveshCrooked57: 'עקומה — הורידו ושוב ⬍ · בחינם · המחשה',
  keveshDrop57: 'גררו לשורה הבאה ⤵ · המחשה',
  keveshTop57: 'הכבש פוגש את ראש המזבח · "שְׁלֹשִׁים וּשְׁתַּיִם עַל רֹחַב שֵׁשׁ עֶשְׂרֵה" — מדות ג, ג · טיוטה',
  sid57: 'מרחו ↔ — לא לאט מדי · "וּמְלַבְּנִין אוֹתָן פַּעֲמַיִם בַּשָּׁנָה, אַחַת בַּפֶּסַח וְאַחַת בֶּחָג" — מדות ג, ד · טיוטה',
  sidSlow57: 'לאט מדי — נוטף! מהר יותר ↔ · המחשה',
  sidFast57: 'מהר מדי — פסים! לאט יותר ↔ · המחשה',
  sidCloth57: 'מרחו במטלית, לא בברזל ↔ · "לֹא הָיוּ סָדִין אוֹתָן בְּכָפִיס שֶׁל בַּרְזֶל" — מדות ג, ד · טיוטה',
  sidDone57: 'לבן! · רבי: "מְלַבְּנִים אוֹתוֹ בְמַפָּה" — מדות ג, ד · טיוטה',
  beams: 'גררו קורה לשקע שלה — קורות הפינה קודם · "והקיפוה גזוזטרא" — מדות ב, ה · טיוטה',
  beamPush: 'דחפו את הקורה לתוך השקע — ישר למעלה · המחשה',
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
  lever: 'גררו את המוט למטה, ארוך — הדלת עולה מעט · מוט ויתדות — המחשה',   // ── build 49 ── stage 06's lines
  leverTop: 'בשיא — הקישו: יתד נכנסת מתחת לדלת · המחשה',
  leverShort: 'קצר מדי — גררו ארוך יותר, עד למטה · המחשה',
  leverSank: 'היתד לא נכנסה בזמן — הדלת שקעה; שוב · המחשה',
  hang: 'גררו את הכנף ישר למטה — הציר לגומה · דלתות הנחושת — יומא לח ע"א · טיוטה',
  ungilded: 'השער נשאר נחושת — "מפני שנעשו בהן נסים" · יומא לח ע"א; מדות ב, ג · טיוטה',
  steps: 'גררו את המעלה אל הקשת — ישרה, והצליל נקי · "מקפות כחצי גרן עגלה" — מדות ב, ה · טיוטה',
  stepOff: 'עקומה — הצליל מזייף; גררו שוב, על הקו · המחשה',
  stepTrue: 'נקי! — המעלה הבאה · המחשה',
  levites: 'הלויים עומדים על המעלות ושרים את הלחן שבניתם · "שעליהן הלוים אומרים בשיר" — מדות ב, ה · טיוטה',
  compass: 'החזיקו במרכז — היתד ננעצת · "כחצי גורן עגולה" — סנהדרין ד, ג · טיוטה',   // ── build 50 ── stage 07's lines
  compass2: 'סובבו את האצבע סביב היתד — החבל מסמן קשת · המחשה',
  slack: 'החבל רפוי — התרחקו מעט מהיתד · המחשה',
  strain: 'החבל מתוח מדי — התקרבו מעט · המחשה',
  half: 'לשכת הגזית — חציה בקודש וחציה בחול · יומא כה ע"א · טיוטה',
  benches: 'גררו ספסל אל הקשת — הסנהדרין יושבת בחצי גורן · המחשה',
  hub: 'גררו לרוחב — הטבור מסתובב; חריץ למעלה — גררו חישור · "והגלגל נתון עליו" — מדות ה, ד · טיוטה',
  hubJam: 'החריץ לא למעלה — החישור נתקע; סובבו עוד · המחשה',
  wheel: 'החזיקו — הגלגל מעלה דלי מן הבור; מהר מדי — נשפך · "ומשם מספקים מים לכל העזרה" — מדות ה, ד · טיוטה',
  spill: 'מהר מדי — המים נשפכים! הרפו מעט · המחשה',
  dome: 'גררו אבן קשת — לסירוגין, שמאל וימין · "בית המוקד כפה" — מדות א, ח · טיוטה',
  tilt: 'התבנית נוטה — צד אחד הקדים; הניחו בצד השני · המחשה',
  key: 'עכשיו אבן הראשה — למעלה, באמצע · המחשה',
  early: 'אבן הראשה אחרונה — קודם שני הצדדים · המחשה',
  strike: 'הקישו — הטריזים יוצאים מתחת לתבנית · המחשה',
  holds: 'הכיפה עומדת · "מקף רובדין של אבן" — מדות א, ח · טיוטה',
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
  Object.freeze({ part: 'lever', fam: 'lift', he: 'מוט ויתדות' }), Object.freeze({ part: 'step', fam: 'place', he: 'מעלה מכוונת' }),   // ── build 49 ── (stage 06's)
  Object.freeze({ part: 'compass', fam: 'place', he: 'המחוגה' }), Object.freeze({ part: 'wheel', fam: 'lift', he: 'הגלגל והדליים' }), Object.freeze({ part: 'arch', fam: 'place', he: 'הקשת' }),   // ── build 50 ── (stage 07's)
]);
/** ── build 50 ── stage 07's card's sources (the find: the Herodian arches) */
export const SRC50 = Object.freeze([
  'לשכת הגזית — שם היתה סנהדרין גדולה של ישראל יושבת; וסנהדרין היתה כחצי גורן עגולה — מדות ה, ד; סנהדרין ד, ג · טיוטה',
  'לשכת הגולה — שם היה בור, והגלגל נתון עליו, ומשם מספקים מים לכל העזרה — מדות ה, ד · טיוטה',
  'בית המוקד כפה, ובית גדול היה, מקף רובדין של אבן — מדות א, ח · טיוטה',
  'המחוגה, הגלגל, התבנית והטריזים — המחשה',
]);
export const FIND50 = 'ארכאולוגיה: קשתות הורדוסיות — קשת רובינסון וקשת וילסון';
/** ── build 50 ── the craftsman's test before chapter ג׳ (the altar): the INSPECT family — a log check, a rock reading, a log check again —
 *  at level 2; the same rules as build 44's */
export const TEST50 = Object.freeze({ jobs: Object.freeze(['stone', 'mud', 'nail']), L: 2, demoAfter: 5, src: 'שהברזל פוסל בנגיעה, ובפגימה לכל דבר — מדות ג, ד · טיוטה' });   // ── build 55 ── (the 08–16 spec §2: the stone with a crack, mud or crack, the fingernail — was build 50's log, rock, log) ── /build 55 ──
/** ── build 49 ── stage 06's card's sources (בבלי יומא לח ע"א; מדות ב, ג; ב, ה) and the find */
export const SRC49 = Object.freeze([   // (the card's: short — the voyage's own lines carry the long quotes)
  'מסע הדלתות: הנחשול, הדלת שהושלכה, "הטילוני עמה", הדלת בעכו — יומא לח ע"א · טיוטה',
  'השערים נשתנו לזהב חוץ משערי נקנור, "מפני שנעשו בהן נסים" — יומא לח ע"א; מדות ב, ג · טיוטה',
  'לא היו טרוטות אלא מקפות כחצי גרן עגלה, ועליהן הלוים אומרים בשיר — מדות ב, ה · טיוטה',
  'הספינה, המגדלור, הסערה, המוט והיתדות, הצלילים — המחשה',
])
export const FIND49 = 'ממצא: גלוסקמת ניקנור (הר הצופים, 1902) — "ניקנור האלכסנדרוני, שעשה את הדלתות"';
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
export function testEnd44(jobs, list = TEST44.jobs) {
  const all = list.map((j) => jobs && jobs[j]); if (!all.every((r) => r && (r.passed || r.demo))) return null;
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
.h42-card>div{max-width:min(420px,86vw);max-height:94vh;overflow:auto;box-sizing:border-box;padding:16px 20px;border-radius:18px;background:#FBF3E2;color:#2A1804;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.5)}
.h42-card h2{margin:0 0 6px;font:900 22px/1.2 Heebo,system-ui,sans-serif}.h42-card p{margin:4px 0;font:600 15px/1.35 Heebo,system-ui,sans-serif}.h42-card small{display:block;opacity:.7;font:600 11px/1.3 Heebo,system-ui,sans-serif}
.h42-card button{margin-top:10px;min-height:48px;min-width:140px;border-radius:14px;border:0;background:#C8923A;color:#2A1804;font:900 17px/1 Heebo,system-ui,sans-serif}
.h42-skip{position:fixed;left:calc(env(safe-area-inset-left,0px) + 12px);bottom:calc(env(safe-area-inset-bottom,0px) + 12px);z-index:49;min-height:44px;min-width:88px;border-radius:14px;border:2px solid #FFE6A0;background:rgba(28,20,10,.8);color:#FFE6A0;font:900 15px/1 Heebo,system-ui,sans-serif;pointer-events:auto}
.h42-before{position:fixed;left:0;top:0;width:100vw;height:100vh;object-fit:cover;z-index:43;pointer-events:none}
.h42-tag{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 18px);transform:translateX(-50%);z-index:50;padding:2px 8px;border-radius:8px;background:rgba(28,20,10,.82);color:#FFE6A0;font:900 13px/1.2 Heebo,system-ui,sans-serif;pointer-events:none}
body.h42-on .gm{display:none!important}
@media (orientation:landscape){.h42-card.h57-end{direction:ltr;justify-content:flex-end;padding-right:calc(env(safe-area-inset-right,0px) + 10px);background:linear-gradient(to left,rgba(20,14,6,.7) 0,rgba(20,14,6,.55) 62%,rgba(20,14,6,0) 68%)}.h42-card.h57-end>div{direction:rtl;max-width:min(420px,calc(66.6vw - 22px))}}   /* ── build 57 ── (§1 rule 12: the end card on the right two-thirds, him seen on the left) */
@media (max-height:340px){.h42-card>div{padding:10px 14px}.h42-card h2{font-size:18px;margin-bottom:3px}.h42-card p{font-size:13px;line-height:1.25;margin:2px 0}.h42-card small{font-size:10px;line-height:1.2}.h42-card button{margin-top:6px;min-height:44px}}   /* (build 49: the cards on a short screen — stage 06's ran off a 296-px height) */
.h42-card button.h44-alt{margin-inline-start:8px;background:#E8DCC0}.h44-seal{font:900 18px/1.3 Heebo,system-ui,sans-serif!important;color:#9A6B12}
.h45-yishar,.h45-wet{font-size:26px;white-space:nowrap;animation-duration:2.2s}
.h44-yard{position:relative;max-height:88vh;overflow:auto;max-width:min(560px,92vw)!important}.h44-yard>button[data-b="back"]{position:absolute;top:8px;left:8px;margin:0!important;min-width:88px!important;min-height:44px!important;font-size:14px!important}.h44-rows{display:grid;grid-template-columns:1fr 1fr;gap:0 8px}.h44-row{display:flex;align-items:center;justify-content:space-between;gap:6px;margin:5px 0;padding:4px 6px;border-radius:12px;background:#F1E6CC}.h44-row b{font:800 15px/1.2 Heebo,system-ui,sans-serif}.h44-row span{display:flex;gap:4px}.h44-row button{margin:0!important;min-width:44px!important;min-height:44px!important;font-size:15px!important}
.h44-fam{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:4px 0 6px}.h44-fam i{font-style:normal;padding:2px 8px;border-radius:10px;background:#2A1804;color:#FFE6A0;font:700 12px/1.4 Heebo,system-ui,sans-serif}
.h44-ghost{position:fixed;z-index:61;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(255,255,255,.35);border:2px dashed #FFF;box-shadow:0 0 18px rgba(255,240,200,.8);pointer-events:none;transition:left .12s linear,top .12s linear}
.h44-ghost::after{content:'רב האומנים';position:absolute;top:50px;left:50%;transform:translateX(-50%);white-space:nowrap;font:800 12px/1 Heebo,system-ui,sans-serif;color:#FFF;text-shadow:0 1px 3px #000}
.h42-dn{position:fixed;z-index:47;font:800 24px/1 Heebo,system-ui,sans-serif;color:#FFE6A0;text-shadow:0 1px 4px #000,0 0 8px rgba(255,214,110,.8);pointer-events:none;animation:h42dn .7s ease-in-out infinite alternate}@keyframes h42dn{0%{transform:translateY(-5px)}100%{transform:translateY(5px)}}
.h42-more{position:fixed;z-index:47;transform:translate(-50%,-100%);padding:3px 9px;border-radius:12px;background:rgba(28,20,10,.78);border:2px solid #FFD66E;color:#FFE6A0;font:800 14px/1.2 Heebo,system-ui,sans-serif;white-space:nowrap;pointer-events:none}`;

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
  const STG = o.stage === 'wall' ? 'wall' : o.stage === 'soreg' ? 'soreg' : o.stage === 'gates' ? 'gates' : o.stage === 'nashim' ? 'nashim' : o.stage === 'nikanor' ? 'nikanor' : o.stage === 'lishka' ? 'lishka' : o.stage === 'yesod' ? 'yesod' : o.stage === 'sovev' ? 'sovev' : o.stage === 'guf' ? 'guf' : 'har';   // ── build 55 ── (stage 08) ── build 57 ── (stage 10) (stage 08) ── /build 55 ──
  const R = STG === 'guf' ? (S.guf && typeof S.guf === 'object' ? S.guf : (S.guf = { part: 0, open: 0, grades: [], hands: 0, streak: 0 })) : STG === 'sovev' ? (S.sovev && typeof S.sovev === 'object' ? S.sovev : (S.sovev = { part: 0, open: 0, grades: [], hands: 0, streak: 0 })) : STG === 'yesod' ? (S.yesod && typeof S.yesod === 'object' ? S.yesod : (S.yesod = { part: 0, open: 0, grades: [], hands: 0, streak: 0 })) : STG === 'wall' ? (S.wall && typeof S.wall === 'object' ? S.wall : (S.wall = { part: 0, open: 0, grades: [], hands: 0, streak: 0 })) : STG === 'soreg' ? (S.soreg && typeof S.soreg === 'object' ? S.soreg : (S.soreg = { part: 0, open: 0, grades: [], hands: 0, streak: 0 })) : STG === 'gates' ? (S.gates && typeof S.gates === 'object' ? S.gates : (S.gates = { part: 0, open: 0, grades: [], hands: 0, streak: 0 })) : STG === 'nashim' ? (S.nashim && typeof S.nashim === 'object' ? S.nashim : (S.nashim = { part: 0, open: 0, grades: [], hands: 0, streak: 0 })) : STG === 'nikanor' ? (S.nikanor && typeof S.nikanor === 'object' ? S.nikanor : (S.nikanor = { part: 0, open: 0, grades: [], hands: 0, streak: 0 })) : STG === 'lishka' ? (S.lishka && typeof S.lishka === 'object' ? S.lishka : (S.lishka = { part: 0, open: 0, grades: [], hands: 0, streak: 0 })) : S;
  const PARTS = STG === 'sovev' ? PARTS56 : STG === 'yesod' ? PARTS55 : STG === 'wall' ? PARTS45 : STG === 'soreg' ? PARTS46 : STG === 'gates' ? PARTS47 : STG === 'nashim' ? PARTS48 : STG === 'nikanor' ? PARTS49 : STG === 'lishka' ? PARTS50 : STG === 'guf' ? PARTS57 : PARTS42;
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
  const base = (() => { const w = STG === 'wall' ? { x: -67.5, z: -100 } : STG === 'soreg' ? { x: -96, z: -100 } : STG === 'gates' ? { x: -38, z: -86 } : STG === 'nashim' ? { x: 58, z: -56 } : STG === 'nikanor' ? { x: 40, z: 0 } : STG === 'lishka' ? { x: -120, z: 40 } : STG === 'yesod' || STG === 'sovev' || STG === 'guf' ? { x: -12, z: -27 } : o.spot ? o.spot() : null, b0 = w && Number.isFinite(w.x) ? { x: w.x, z: w.z } : { x: -60, z: 60 }; return MODE === 'stage' ? b0 : { x: b0.x - 85, z: b0.z }; })();   // (build 44: the yard and the test on the finished plaza, 85 amot in from the Mount's east wall — at the old corner the wall stood between the camera and him)
  const P = (dx, dz) => ({ x: base.x + dx, z: base.z + dz, get y() { return gy(this.x, this.z); } });
  const PL = { peg0: P(-14, 4), peg1: P(16, 4), wheel: P(10, -10), stone0: P(16, -10), rock: [P(-12, -14), P(-24, -6), P(-30, 8)], course: P(2, 16), roll0: P(-20, 24), roll1: P(4, 24), pave: P(18, 26), trace: P(30, 14), pulley: P(-2, -18), pstone: P(1, -18) };
  const STAND = { rope: PL.peg1, lift: P(6, -10), rock0: P(-3, -11), rock1: P(-15, -3), rock2: P(-21, 11),   /* ── build 54 ── (item 1: the rock's macro from the south and 4.5 aside: his stand 9 amot east of the rock and 3 south — out of its frame by more than the walk's 2.6; at +3, +2 his near figure stood cut at the frame's edge) ── /build 54 ── */ course0: P(2, 12), course1: P(2, 12), roll: P(-18, 19.5), pave: P(28, 27), trace: P(27, 14), corner: P(12, -5),
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
  Object.assign(STAND, { lattice0: P(-11.1, -36), lattice1: P(-14.5, -36), lattice2: P(-17.9, -36), lattice: P(-14.5, -36),   /* ── build 54 ── (5.5 east of each panel and 2 north: out of the lattice's macro — at 2 and 2 his near figure stood in it) ── /build 54 ── */ warn: P(-40, -53.5), bows: P(-41, -53.5) });
  // ── build 47 ── stage 04's places: his gate — שער הניצוץ, in the north wall (its opening x −43…−33, temple.js), the posts on the Chel's terrace in
  // front of the gatehouse (z −80); he stands north of it; the cameras from the north. In the yard, the same gate on the open plaza.
  Object.assign(PL, { gate: P(30, -34) });
  // ── build 54 ── (must 8: "the kohen ~12 % of the height — the opposite of Phase B's problem") the lintel's stand: in front of the gate toward
  // gateView's camera (it looks +z: the screen's left is +x) at the distance where his 6.4-amah figure is LINTEL54.h of the height, and LINTEL54.x
  // of the half-width to the left — the left third ── /build 54 ──
  const lintelStand54 = () => { const G = PL.gate, tv = tanV(), D = Math.max(needD() + 2, 15.5 / tv) * OBJ54.gate, dh = Math.min(D - 6, heroHeight() / (2 * LINTEL54.h * tv)), x = G.x - 3 + LINTEL54.x * dh * tv * (W() / H()), z = G.z - D + dh; return { x, z }; };
  Object.assign(STAND, { lintel: { get x() { return lintelStand54().x; }, get z() { return lintelStand54().z; }, get y() { const q = lintelStand54(); return gy(q.x, q.z); } } });
  Object.assign(STAND, { leaf: P(19, -40.5), leaf7: P(41, -40.5) });   // ── build 54 ── (beside the gate, 11 amot off its middle: in front of his leaf he hid it from the camera — the AFTER page's leaf, line through him 42 %) ── /build 54 ──
  // ── build 48 ── stage 05's places: the wagon of logs at the wood chamber's door (NE, its door x 117…125 on z −29.5); his stretch of the
  // gallery on the court's north wall (inner face z −67.5, x 48.5…70.5 — by the NW chamber's corner); the conclusion's corner on the south wall
  Object.assign(PL, { trestle: P(-42, 32), wallY: P(-45, 10), wallS: P(-45, 10) }); Object.assign(STAND, { log: P(-46, 37), beam: P(-45, 15.5), peg: P(-45, 15.5) });
  if (STG === 'nashim') { Object.assign(PL, { trestle: { x: 121, get y() { return gy(121, -22); }, z: -22 }, wallY: { x: 59.5, get y() { return gy(59.5, -60); }, z: -67.5 }, wallS: { x: 59.5, get y() { return gy(59.5, 60); }, z: 67.5 } });
    Object.assign(STAND, { wood: { x: 115.5, get y() { return gy(115.5, -16); }, z: -16 }, beams: { x: 66, get y() { return gy(66, -62); }, z: -62 }, pegs: { x: 66, get y() { return gy(66, -62); }, z: -62 }, corner: { x: 66, get y() { return gy(66, 62); }, z: 62 }, walk: { x: 50, get y() { return gy(50, -60); }, z: -60 } }); }
  // ── build 49 ── stage 06's places: Nicanor's gate (the courts' east gate: its face x 10, its opening z ±5, its sill 13.5 — temple.js), the
  // leaf he hangs on the south pivot; the fifteen steps' half circle (centre x 10, z 0; radii 6.5…13.5, half an amah each, from the women's
  // court's 6 to 13.5 — מדות ב, ה). In the yard: a free-standing frame and a short arc on the plaza
  Object.assign(PL, { ng: P(30, -20), arc: P(28, 4) }); Object.assign(STAND, { lever: P(33.5, -16.5), hang: P(33.5, -16.5), step: P(42, 4) });
  // ── build 50 ── stage 07's places (each with a floor of his own at 16, the azara's): the compass in לשכת הגזית (temple.js −100…−62 ×
  // 58…82 — the model's block not drawn there while he works), the wheel over the pit in לשכת הגולה by the court's south wall, the dome in
  // בית המוקד (−178…−142 × −83…−58). In the yard: on the plaza
  Object.assign(PL, { gz: P(-60, -30), gl: P(-75, 5), mk: P(-95, -30) }); Object.assign(STAND, { compass: P(-58.5, -31.5), benches: P(-58.5, -31.5),   /* ── build 54 ── (by the peg — §2 stage 07: "the kohen out of the frame") ── /build 54 ── */ hub: P(-69, -3), wheel: P(-69, -3), arch: P(-88, -22) });
  if (STG === 'lishka') { const F16 = (x, z) => ({ x, y: 16, z }); Object.assign(PL, { gz: F16(-81, 64), gl: F16(-140, 56), mk: F16(-160, -70.5) }); Object.assign(STAND, { compass: F16(-79.5, 62.5), benches: F16(-79.5, 62.5), hub: F16(-134, 48), wheel: F16(-134, 48), dome: F16(-150, -55) }); }
  if (STG === 'nikanor') { Object.assign(PL, { ng: { x: 10.4, y: 13.5, z: 0 }, arc: { x: 10, y: 6, z: 0 } }); Object.assign(STAND, { lever: { x: 13.6, y: 11.5, z: 8.6 }, hang: { x: 13.6, y: 11.5, z: 8.6 }, steps: { x: 26, get y() { return gy(26, 15); }, z: 15 } }); }
  if (STG === 'gates') { Object.assign(PL, { gate: { x: -38, get y() { return gy(-38, -80); }, z: -80 } }); Object.assign(STAND, { leaf: P(-11, 0.5), leaf7: P(11, 0.5), names: P(0, -2) }); }   // ── build 54 ── (the lintel's stand: the getter above — the left third — for this gate too) ── /build 54 ──
  // ── build 55 ── stage 08's places: the inspection bench by the altar's north-east corner (the carts from בית כרם unload there), the
  // first course on the altar's north side, the altar itself (its top view); in the test (and the yard): the bench on the plaza ── /build 55 ──
  Object.assign(PL, { bench55: P(44, -40), course55: P(44, -24), alt55: P(30, -70) }); Object.assign(STAND, { stone: P(44.5, -31), mud: P(44.5, -31), nail: P(44.5, -31) });
  if (STG === 'yesod' || STG === 'sovev' || STG === 'guf') {
    const A = (x, z) => ({ x, z, get y() { return gy(this.x, this.z); } });
    Object.assign(PL, { bench55: A(-12, -27), course55: A(-38, -19), alt55: A(ALT55.x0, ALT55.z0) });
    Object.assign(STAND, { inspect: A(-11.5, -18), nail: A(-11.5, -18), iron: A(-11.5, -18), field: A(-34, -13.5), last: A(-17, 6) });
    Object.assign(STAND, { light: A(-11.5, -18), tap: A(-11.5, -18), sovev: A(-20.5, -10), thread: A(-20.8, -21.5) });   // ── build 56 ── (the course's view and the thread's: he by the altar's east end — in the left third, not before the thing)
    Object.assign(STAND, { decoy: A(-11.5, -18), kevesh: A(-41, 48), sid: A(-11, 6) });   // ── build 57 ── (the kevesh from its east side: he at its foot, low on the left; the whitewash's macro: he behind its camera)
  }
  if (STG === 'soreg') {
    Object.assign(PL, { soreg: { x: base.x, y: 0, z: -91.5 }, warnA: { x: base.x + 9, y: 0, z: -93.2 }, bow0: { x: base.x + 10, y: 0, z: -91.3 } });
    Object.assign(STAND, { lattice0: P(9, 8), lattice1: P(5.5, 8), lattice2: P(2, 8), warn: P(9, 4.5), bows: P(6.5, 5) });   // ── build 54 ── (the lattice: 5.5 east of its panel, 2 north — out of its macro's frame) ── /build 54 ──   // (the lattice: beside the panel, east and close — not between it and the camera; the bows: just before the first mark, the procession passing between him and the soreg)   // (the bows: at the first mark, between the procession and the soreg)
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
  // ── build 53 ── THE MOUNT ALIVE (the inspector's review §4 important 18: "the Mount is an empty brown plain — no crews, no carts, not one
  // of the thousand carts in any frame I played"): the crews at work, the carts that bring the stones (קדמוניות טו 390: אלף עגלות) and the
  // heaps they leave — simple shapes, shared geometry and four materials, no assets. Fixed groups round the work, a crew with its cart and
  // heap set behind each act's thing as the act's view settles (in its frame), and the team on the great stone's ropes ── /build 53 ──
  const P53 = { g: null };
  function geo53() {
    if (P53.g) return P53.g;
    P53.g = {
      tunic: new THREE.CylinderGeometry(0.34, 0.46, 2.3, 9).translate(0, 1.15, 0), head: new THREE.SphereGeometry(0.3, 10, 8).translate(0, 2.62, 0), cap: new THREE.CylinderGeometry(0.24, 0.3, 0.2, 9).translate(0, 2.92, 0),
      arm: new THREE.CylinderGeometry(0.09, 0.1, 1.15, 6).translate(0, -0.55, 0), bed: new THREE.BoxGeometry(4, 0.3, 2.4), side: new THREE.BoxGeometry(4, 0.5, 0.12), wheel: new THREE.CylinderGeometry(1.0, 1.0, 0.22, 14).rotateX(Math.PI / 2),
      ox: new THREE.BoxGeometry(2.6, 1.3, 1.1), oxHead: new THREE.BoxGeometry(0.8, 0.7, 0.6), pole: new THREE.BoxGeometry(2.4, 0.14, 0.14), block: new THREE.BoxGeometry(1.2, 0.8, 0.9), rough: new THREE.DodecahedronGeometry(0.7, 0),
      M: { tunic: mat('#D9CBB0', 0.95), tunic2: mat('#B99D74', 0.95), skin: mat('#B07C55', 0.8), cap: mat('#7A6248', 0.9), wood: WOOD, ox: mat('#7B5A3E', 0.95), stone: STONE, rock: ROCK },
    };
    return P53.g;
  }
  function worker53(k = 0) {
    const G = geo53(), g = new THREE.Group(), tm = k % 2 ? G.M.tunic2 : G.M.tunic;
    g.add(new THREE.Mesh(G.tunic, tm), new THREE.Mesh(G.head, G.M.skin), new THREE.Mesh(G.cap, G.M.cap));
    const arms = [-1, 1].map((sx) => { const a = new THREE.Mesh(G.arm, tm); a.position.set(sx * 0.42, 2.15, 0); g.add(a); return a; });
    g.userData.arms = arms; g.userData.ph = k * 1.7; g.scale.setScalar(1.75);   // (≈ 5.4 amot: a man beside his 6.4-amah figure, a little smaller)
    return g;
  }
  function cart53() {
    const G = geo53(), g = new THREE.Group();
    const bed = new THREE.Mesh(G.bed, G.M.wood); bed.position.y = 1.25; g.add(bed);
    for (const z of [-1.14, 1.14]) { const sd = new THREE.Mesh(G.side, G.M.wood); sd.position.set(0, 1.6, z); g.add(sd); }
    g.userData.wheels = [-1.3, 1.3].map((z) => { const w = new THREE.Mesh(G.wheel, G.M.wood); w.position.set(0, 1.0, z); g.add(w); return w; });
    for (const [x, z] of [[-1, -0.5], [0.4, 0.45], [1.2, -0.4]]) { const b = new THREE.Mesh(G.block, G.M.stone); b.position.set(x, 1.8, z); b.rotation.y = x; g.add(b); }
    const pole = new THREE.Mesh(G.pole, G.M.wood); pole.position.set(3.1, 1.3, 0); g.add(pole);
    for (const z of [-0.75, 0.75]) { const ox = new THREE.Mesh(G.ox, G.M.ox); ox.position.set(5.4, 1.15, z); g.add(ox); const hd = new THREE.Mesh(G.oxHead, G.M.ox); hd.position.set(6.9, 1.5, z); g.add(hd); }
    return g;
  }
  function heap53(n = 7, seed = 1) {
    const G = geo53(), g = new THREE.Group();
    for (let i = 0; i < n; i++) { const a = (i * 2.399 + seed) % 6.283, r = 0.5 + (i % 3) * 0.7, m = new THREE.Mesh(i % 2 ? G.block : G.rough, i % 2 ? G.M.stone : G.M.rock); m.position.set(Math.cos(a) * r, 0.4 + (i > 3 ? 0.6 : 0), Math.sin(a) * r); m.rotation.set(i, i * 0.7, 0); g.add(m); }
    return g;
  }
  /** a crew: three at work round a heap, their cart beside — a group whose origin is on the ground (y set by the caller) */
  function crew53(k = 0) {
    const g = new THREE.Group(), ws = [];
    const h = heap53(8, k); g.add(h);
    for (let i = 0; i < 3; i++) { const w = worker53(k * 3 + i), a = (i / 3) * 6.283 + k; w.position.set(Math.cos(a) * 2.6, 0, Math.sin(a) * 2.6); w.rotation.y = -a - Math.PI / 2; g.add(w); ws.push(w); }
    const c = cart53(); c.position.set(-1.5, 0, 5.2); c.rotation.y = 0.4 + k; g.add(c);
    g.userData.workers = ws; return g;
  }
  function life53(root, add) {
    if (STG !== 'har') return;
    const L = { crews: [], act: null, team: null, t: 0 };
    // the fixed crews round the work, beyond its places (in the walks' frames and the wide ones — never between an act's camera and its thing:
    // the first page had one 16 amot east of the wheel, and the treadwheel's view looked at the wheel through it)
    [[-8, 52], [48, -26], [-50, -30], [52, 44], [-52, 34]].forEach(([dx, dz], k) => { const c = crew53(k); const x = base.x + dx, z = base.z + dz; add(c, x, gy(x, z), z); L.crews.push(c); });
    // the act's crew: set behind each act's thing as its view settles
    L.act = crew53(9); L.act.visible = false; add(L.act, base.x, gy(base.x, base.z), base.z); L.crews.push(L.act);
    // the team on the great stone's ropes: six in two files before it, the ropes from its front
    const tg = new THREE.Group(), pullers = [];
    for (let i = 0; i < 6; i++) { const w = worker53(i + 20); w.position.set(9.5 + (i >> 1) * 2.4, 0, i % 2 ? 1.5 : -1.5); w.rotation.y = -Math.PI / 2; tg.add(w); pullers.push(w); }
    const rp = new THREE.BufferGeometry(); rp.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(6 * 2 * 3), 3));
    const ropes = new THREE.LineSegments(rp, new THREE.LineBasicMaterial({ color: '#D9C9A0' })); tg.add(ropes);
    add(tg, PL.roll0.x, PL.roll0.y, PL.roll0.z);
    let beat = 0;
    L.team = { g: tg, pullers, pull(x, dt, idle) {
      tg.position.x = x; beat += dt * (idle ? 0 : 5);
      const a = rp.attributes.position;
      pullers.forEach((w, i) => { const lean = idle ? 0.05 : 0.32 + 0.1 * Math.sin(beat + i * 0.6); w.rotation.z = lean; w.userData.arms.forEach((m) => { m.rotation.z = 0; m.rotation.x = -1.2; }); a.setXYZ(i * 2, 6, 1.6, w.position.z * 0.6); a.setXYZ(i * 2 + 1, w.position.x - 0.4, 3.4, w.position.z); });
      a.needsUpdate = true;
    } };
    L.team.pull(PL.roll0.x, 0, true); st.props.team53 = L.team;
    st.life53 = L;
  }
  /** each frame: the crews' arms at work; the act's crew placed once per act, behind its thing in the act's view */
  function lifeFrame53(dt, v) {
    const L = st.life53; if (!L) return;
    L.t += dt; lifeFrame55(dt);   // ── build 55 ── (the carts; the crews stop to look as the yesod is whole) ── /build 55 ──
    for (const c of L.crews) { if (!c.visible || L.still) continue; c.userData.workers.forEach((w, i) => { const ph = L.t * 3.2 + w.userData.ph; w.userData.arms[0].rotation.x = -0.9 + Math.sin(ph) * 0.7; w.userData.arms[1].rotation.x = -0.9 + Math.sin(ph + 0.8) * 0.7; w.rotation.z = Math.sin(ph) * 0.06; }); }
    // (the act's crew: once the act has set its thing and the camera has begun to come round to its view (0.3 s), beyond the thing as the
    // act's own view (a macro, the side views) or else the camera now sees it —
    // camera sees it — the thing's box's middle + its half-size + 5.5 amot along the line from the camera, 4.5 to the side; the first page set it
    // from the view's target on the act's first frame, and it stood round him)
    if (st.job && st.objBB && !L.noAct) {
      if (L.part !== st.part) { L.part = st.part; L.jt = 0; L.set = false; }
      L.jt += dt;
      if (!L.set && L.jt > 0.3) {
        L.set = true;
        const b = st.objBB, ox = (b[0] + b[3]) / 2, oz = (b[2] + b[5]) / 2, rad = Math.max(b[3] - b[0], b[5] - b[2]) / 2;
        const cp = st.job.view && v ? { x: v.p[0], z: v.p[2] } : cq.p, fx0 = ox - cp.x, fz0 = oz - cp.z, fl = Math.hypot(fx0, fz0) || 1, fx = fx0 / fl, fz = fz0 / fl, rx = -fz, rz = fx, dd = rad + (st.job.view ? 11 : 5.5);   /* ── build 54 ── (a macro's crew farther: at 5.5 a worker stood cut at the rock's macro's top) ── /build 54 ── */
        const x = ox + fx * dd - rx * 4.5, z = oz + fz * dd - rz * 4.5;   // (5.5 beyond its edge: in the frame of a view that looks down on the thing — 9 put them over the top of it)
        L.act.position.set(x, gy(x, z), z); L.act.rotation.y = Math.atan2(fx, fz); L.act.visible = true; L.at = { x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10, part: st.part };
      }
    }
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
    if (STG === 'nashim' || MODE === 'yard' || MODE === 'test') props48(add);   // ── build 48 ── (build 50: and the test's — its log checks)
    if (STG === 'nikanor' || MODE === 'yard') props49(add);   // ── build 49 ──
    if (STG === 'lishka' || MODE === 'yard') props50(add);   // ── build 50 ──
    if (STG === 'yesod' || STG === 'sovev' || STG === 'guf' || MODE === 'test') props55(add);
    if (STG === 'sovev' || STG === 'guf') props56(add);
    if (STG === 'guf') props57(add);   // ── build 57 ──   // ── build 56 ──   // ── build 55 ── (stage 08; the test before chapter ג׳: the bench and its stone) ── /build 55 ──
    if (STG === 'yesod' || STG === 'sovev' || STG === 'guf') for (const k of ['stone0', 'peg0', 'peg1', 'rope']) if (st.props[k]) st.props[k].visible = false;
    if (STG === 'lishka' && st.props.stone0) st.props.stone0.visible = false;
    if (STG === 'nikanor' && st.props.stone0) st.props.stone0.visible = false;
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
    if (STG === 'yesod' || STG === 'sovev') life55(add);   // ── build 55 ── the court alive round the altar's work: crews, carts from בית כרם ── /build 55 ──
    life53(g, add);   // ── build 53 ── the Mount alive: crews, carts, heaps (§4 important 18) ── /build 53 ──
    // the gold plan of the platform (unrolling in the opening)
    const R = 140, c0 = { x: base.x - 40, z: base.z - 50 }, gm = new THREE.MeshBasicMaterial({ color: '#FFD66E', transparent: true, opacity: 0.85 }), C4 = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    st.props.plan = C4.map((a, i) => { const b = C4[(i + 1) % 4], x0 = c0.x + a[0] * R, z0 = c0.z + a[1] * R, x1 = c0.x + b[0] * R, z1 = c0.z + b[1] * R, L = Math.hypot(x1 - x0, z1 - z0); const m = new THREE.Mesh(new THREE.BoxGeometry(L, 0.6, 2.4), gm); m.geometry.translate(L / 2, 0, 0); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0); m.scale.x = 0.001; return add(m, x0, gy(x0, z0) + 2, z0); });
    }
    if (STG === 'guf') life55(add);   // ── build 57 ── (the court alive round the altar: build 55's crews and carts — its call above sits inside stage 01's block, so stages 08–09 never had them)
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
    const draw = (gap, ghost) => { if (!cv) return; const c = cv.getContext('2d'); c.clearRect(0, 0, 512, 256); c.lineCap = 'round'; for (let r = 0; r < 4; r++) for (let q = 0; q < 8; q++) { if (gap && q === gap.c && r === gap.r) continue; const w = F.want46(kind, k * 8 + q, r); drawTile(c, F.tile46(F.LAT46.kinds[kind].tile, w.r, w.f), q * 64, r * 64, 64, 10); }
      if (gap && gap.c >= 0) { c.save(); c.setLineDash([10, 8]); c.strokeStyle = '#FFD66E'; c.lineWidth = 5; c.strokeRect(gap.c * 64 + 4, gap.r * 64 + 4, 56, 56); c.restore(); if (ghost) { c.save(); c.globalAlpha = 0.62; drawTile(c, ghost, gap.c * 64, gap.r * 64, 64, 10); c.restore(); } }   // ── build 54 ── (the gap outlined in the real lattice, and the piece in hand shown in it as turned — live, §4 important 14) ── /build 54 ──
      tex.needsUpdate = true; };
    const done = R.grades && R.grades.some((x) => x[0] === `lattice${k}`); draw(done ? null : { c: -1, r: -1 });
    add(g, P.x, gy(P.x, P.z), P.z);
    return { g, draw, P, kind };
  }
  /** ── build 47 ── stage 04's props: his gate (two posts, the lintel, two leaves on their pivots, the sockets), the two cranes and their ropes;
   *  on the stage, the seven gate openings in gold (the opening) and a pair of small leaves at each gate (the names' moment) */
  const GATE47 = { half: 5, post: 1.5, H: 20, lw: 13, leafW: 4.9, leafH: 19.4 };
  const DOOR54 = { wood: mat('#6E4428', 0.7), frame: mat('#4E2F1A', 0.75), panel: mat('#7C5232', 0.65), bronze: new THREE.MeshStandardMaterial({ color: '#B08A4A', metalness: 0.7, roughness: 0.35 }) };   // ── build 54 ── the leaves' door ── /build 54 ──
  for (const [k, e] of [['wood', '#3A2010'], ['frame', '#24140A'], ['panel', '#4A2A14'], ['bronze', '#5A4420']]) { DOOR54[k].emissive = new THREE.Color(e); DOOR54[k].emissiveIntensity = 0.55; }   // ── build 54 ── (its court face in the shade read as one dark plane in the pin's macro: its panels and studs seen there too) ── /build 54 ──
  function props47(add) {
    const G = PL.gate, g0 = G.y, stoneM = mat('#E9DFC8', 0.85), wood = mat('#8A5A32', 0.75), dark = mat('#4A3A2A', 0.9);
    st.props.posts = [-1, 1].map((sx) => add(ashlar(GATE47.post, GATE47.H, GATE47.post), G.x + sx * (GATE47.half + GATE47.post / 2), g0 + GATE47.H / 2, G.z));
    for (const sx of [-1, 1]) add(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.2, 12), dark), G.x + sx * (GATE47.half - 0.25), g0 + 0.1, G.z);   // (the sockets — גומות)
    const lt = ashlar(GATE47.lw, 1.5, 1.5); st.props.lintel = add(lt, G.x, g0 + 0.75, G.z - 4);
    st.props.leaves = [-1, 1].map((sx) => {   // (each leaf on its pivot at the opening's side: the group at the pivot, the leaf from it inward)
      const piv = new THREE.Group(), lf = new THREE.Mesh(new THREE.BoxGeometry(GATE47.leafW, GATE47.leafH, 0.35), DOOR54.wood); lf.position.set(-sx * GATE47.leafW / 2, GATE47.leafH / 2, 0); piv.add(lf);
      for (let i = 1; i < 4; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(GATE47.leafW * 0.96, 0.22, 0.42), dark); b.position.set(-sx * GATE47.leafW / 2, i * GATE47.leafH / 4, 0); piv.add(b); }
      // ── build 54 ── (§2 stage 04: "the door a flat orange board") a door: its stile by the pivot, raised panels between the straps on both
      // faces, bronze studs along the straps, a ring to pull ── /build 54 ──
      { const stile = new THREE.Mesh(new THREE.BoxGeometry(0.45, GATE47.leafH, 0.5), DOOR54.frame); stile.position.set(-sx * 0.25, GATE47.leafH / 2, 0); piv.add(stile);
        for (let i = 0; i < 4; i++) for (const fz of [-1, 1]) { const pn = new THREE.Mesh(new THREE.BoxGeometry(GATE47.leafW * 0.7, GATE47.leafH / 4 - 1.1, 0.12), DOOR54.panel); pn.position.set(-sx * GATE47.leafW * 0.52, (i + 0.5) * GATE47.leafH / 4, fz * 0.22); piv.add(pn); }
        const studG = new THREE.SphereGeometry(0.11, 6, 4); for (let i = 1; i < 4; i++) for (let j = 0; j < 6; j++) for (const fz of [-1, 1]) { const sd = new THREE.Mesh(studG, DOOR54.bronze); sd.position.set(-sx * (0.5 + j * (GATE47.leafW - 0.9) / 5), i * GATE47.leafH / 4, fz * 0.24); piv.add(sd); }
        for (const fz of [-1, 1]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.06, 6, 14), DOOR54.bronze); ring.position.set(-sx * (GATE47.leafW - 0.7), GATE47.leafH * 0.45, fz * 0.3); piv.add(ring); } }
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.6, 10), DOOR54.bronze); pin.position.set(-sx * 0.25, -0.3, 0); piv.add(pin);   // ── build 54 ── (bronze: the pin seen over its socket in the macro) ── /build 54 ──
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
  /** ── build 49 ── stage 06's props: Nicanor's gate's frame (two posts, the lintel, the dark opening), his bronze leaf on the south pivot and the
   *  crews' on the north, the lever, its fulcrum and the wedges; the steps' container; on the stage, the steps' gold half circles (the opening) */
  const BRONZE49 = new THREE.MeshStandardMaterial({ color: '#C99A5E', metalness: 0.45, roughness: 0.34, emissive: new THREE.Color('#563716'), emissiveIntensity: 0.45 });   // (bright: with no environment a metal reads dark)
  const LEAF49 = { w: 4.9, h: 19.4, pz: 4.5, rise: 0.35, seat: 0.12 };   // (the leaf rests on the sill (0); each notch raises it 0.35; hung, it sits 0.12 over the sill, its pin in the socket)
  function leaf49(sgn) {   // a pivot group on the pin's axis (sgn 1: the south pivot, the leaf toward the north; −1: the north's)
    const N = PL.ng, piv = new THREE.Group(), lf = new THREE.Mesh(new THREE.BoxGeometry(0.35, LEAF49.h, LEAF49.w), BRONZE49); lf.position.set(0, LEAF49.h / 2, -sgn * (LEAF49.w / 2 - 0.25)); piv.add(lf);
    const dk = new THREE.MeshStandardMaterial({ color: '#7A4E24', metalness: 0.7, roughness: 0.45 });
    for (const f of [0.25, 0.5, 0.75]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.26, LEAF49.w - 0.3), dk); b.position.set(0.05, LEAF49.h * f, lf.position.z); piv.add(b); }
    for (const y of [-0.35, LEAF49.h + 0.35]) { const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.7, 8), dk); pin.position.set(0, y, 0); piv.add(pin); }
    try { const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.texGlow(), color: '#FFE9B8', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.5 })); gl.scale.set(5, 5, 1); gl.position.set(0.5, LEAF49.h * 0.7, lf.position.z + sgn * 0.8); piv.add(gl); piv.userData.glint = gl; } catch (e) { /* */ }   // (the bronze that shone like gold)
    piv.position.set(N.x, N.y + LEAF49.seat, N.z + sgn * LEAF49.pz); piv.userData.sgn = sgn; st.props.root.add(piv); return piv;
  }
  function props49(add) {
    const N = PL.ng, y0 = N.y, stoneM = mat('#E9DFC8', 0.85), dark = mat('#2A2018', 0.95);
    for (const sz of [-1, 1]) { const p2 = ashlar(1.3, 21.6, 1.3); p2.rotation.y = Math.PI / 2; add(p2, N.x + 0.2, y0 + 10.8, N.z + sz * 5.65); }
    const lt = ashlar(12.6, 1.6, 1.3); lt.rotation.y = Math.PI / 2; add(lt, N.x + 0.2, y0 + 22.4, N.z);
    add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 21.6, 10), dark), N.x - 0.25, y0 + 10.8, N.z);
    if (STG === 'nikanor') {   // (the gate's face where the model's is not drawn: ashlar courses on a canvas, as the walls round it)
      let map = null; try { if (doc) { const cv = doc.createElement('canvas'); cv.width = 256; cv.height = 256; const c = cv.getContext('2d'); c.fillStyle = '#E8DABD'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#B9A88A'; c.lineWidth = 3; for (let r = 0; r < 8; r++) { c.beginPath(); c.moveTo(0, r * 32); c.lineTo(256, r * 32); c.stroke(); for (let k = 0; k < 3; k++) { const x = ((k * 96 + (r % 2) * 48) % 256); c.beginPath(); c.moveTo(x, r * 32); c.lineTo(x, r * 32 + 32); c.stroke(); } } map = new THREE.CanvasTexture(cv); map.colorSpace = THREE.SRGBColorSpace; map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(3.5, 3); } } catch (e) { map = null; }
      add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 24, 28), new THREE.MeshStandardMaterial({ color: '#FFFFFF', map, roughness: 0.9, metalness: 0 })), N.x - 0.32, y0 + 12, N.z);
    }   // (the gate's face where the model's is not drawn: through its door the court showed)
    if (MODE === 'yard') add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 22, 14), stoneM), N.x - 1.1, y0 + 11, N.z);
    st.props.sock49 = add(new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.1, 8, 20), new THREE.MeshBasicMaterial({ color: '#FFD66E' })), N.x, y0 + 21.4, N.z + LEAF49.pz); st.props.sock49.rotation.x = Math.PI / 2;
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.12, 12), dark), N.x, y0 + 0.04, N.z + LEAF49.pz);
    st.props.leafS = leaf49(1); st.props.leafN = leaf49(-1); { const hung = STG === 'nikanor' && MODE === 'stage' && R.part > PARTS49.indexOf('hang'); leafAt(st.props.leafS, hung ? LEAF49.seat : 0); st.props.leafN.visible = hung; }   // (resting on the sill until he hangs it; hung, both, on a return after)
    const wood = mat('#7A5A3A', 0.85), zc = N.z + LEAF49.pz - LEAF49.w / 2;
    st.props.fulc49 = add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.9), wood), N.x + 1.6, y0 + 0.4, zc);
    const pole = new THREE.Group(), pm = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 8, 8), mat('#9A7448', 0.8)); pm.rotation.z = Math.PI / 2; pm.position.x = 2.6; pole.add(pm);
    st.props.pole49 = add(pole, N.x + 1.6, y0 + 0.85, zc); pole.rotation.z = 0.22;
    st.props.wedges49 = new THREE.Group(); add(st.props.wedges49, N.x + 0.25, y0, zc);
    st.props.steps49 = new THREE.Group(); add(st.props.steps49, PL.arc.x, PL.arc.y, PL.arc.z);
    if (STG === 'nikanor') {   // (the steps' plan: the outer and inner half circles in gold, growing in the opening)
      const gm = new THREE.MeshBasicMaterial({ color: '#FFD66E', transparent: true, opacity: 0.85 });
      st.props.plan49 = [13.5, 6.5].map((R2) => { const m = new THREE.Mesh(new THREE.TorusGeometry(R2, 0.45, 6, 48, Math.PI), gm); m.rotation.set(-Math.PI / 2, 0, -Math.PI / 2); m.scale.setScalar(0.001); return add(m, PL.arc.x, PL.arc.y + 0.3, PL.arc.z); });
    }
  }
  /** the leaf's place: its pivot raised by u amot over the hung height (the lever: from −n·rise up to 0 … the drop) */
  function leafAt(piv, u) { const N = PL.ng; piv.position.y = N.y + u; }
  /** the model's door (and, at the steps, the model's steps) not drawn where his stand (batch.js XRAY.uHoleB) */
  function hole49(k) { if (STG !== 'nikanor') return; if (!k) { hole46(false); return; } if (k === 'door') hole46(true, [10.02, 34, -17, 17], 37.5, 13.55); else hole46(true, [10.02, 34, -17, 17], 37.5, 6.03); }   // (and the stage's scaffold in front of the gate: it stood between the camera and his door)
  /** ── build 50 ── stage 07's props: his floors at 16 (where the model's chambers are not drawn while he works); the compass's peg, rope and
   *  arc; the benches; the pit, the wheel on its frame, its hub, spokes, bucket and rope; the dome's drum, the centering on its posts and
   *  wedges, the voussoirs as they are set, the shell that appears when it holds; on the stage, the three chambers' gold outlines */
  const ARC50 = { R: 8 };
  const DOME50 = { Rd: 12, Ra: 10.6, wall: 10, len: 30 };   // (the house's vault across its short side, as the model's: its arch in the plane x = const, spanning z)
  function props50(add) {
    const stoneM = mat('#E6DAC0', 0.88), wood = mat('#8A6440', 0.85), dark = mat('#1A1410', 0.95);
    if (STG === 'lishka') { add(new THREE.Mesh(new THREE.BoxGeometry(64, 0.4, 52), mat('#CFC4AA', 0.92)), -81, 15.82, 64); add(new THREE.Mesh(new THREE.BoxGeometry(38, 0.4, 28), mat('#CFC4AA', 0.92)), -160, 15.82, -70.5); }
    const C = PL.gz; st.props.peg50 = add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.4, 8), wood), C.x, C.y + 0.3, C.z); st.props.peg50.visible = false;
    const rg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]); st.props.rope50 = add(new THREE.Line(rg, new THREE.LineBasicMaterial({ color: '#E8D9B0' })), 0, 0, 0); st.props.rope50.visible = false;
    st.props.arc50 = new THREE.Group(); add(st.props.arc50, C.x, C.y + 0.06, C.z); st.props.bench50 = new THREE.Group(); add(st.props.bench50, C.x, C.y, C.z);
    // the wheel over the pit (its plane faces north: the camera from the north)
    const Gl = PL.gl, wy = Gl.y + 6.2;
    add(new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.08, 24), dark), Gl.x + 2.6, Gl.y + 0.06, Gl.z);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.3, 8, 28), stoneM); rim.rotation.x = Math.PI / 2; add(rim, Gl.x + 2.6, Gl.y + 0.3, Gl.z);
    for (const dx of [-0.6, 0.6]) { const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 7, 0.45), wood); add(p2, Gl.x + dx, Gl.y + 3.5, Gl.z + 1.3); }   // (the frame behind the wheel: in front, its post hid the hub)
    const ax = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3, 8), wood); ax.rotation.x = Math.PI / 2; add(ax, Gl.x, wy, Gl.z);
    const wg = new THREE.Group(); add(wg, Gl.x, wy, Gl.z); st.props.wheel50 = wg;
    const wr = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.17, 6, 32), wood); wg.add(wr);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.7, 12), mat('#6A4A2C', 0.85)); hub.rotation.x = Math.PI / 2; wg.add(hub);
    st.props.spokes50 = Array.from({ length: F.HUB50.n }, (_, i) => { const sp = new THREE.Group(), b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.1, 0.2), wood); b.position.y = 1.5; sp.add(b); sp.rotation.z = (i * 2 * Math.PI) / F.HUB50.n; sp.visible = false; wg.add(sp); return sp; });
    st.props.slots50 = Array.from({ length: F.HUB50.n }, (_, i) => { const sl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.75), dark); const a = (i * 2 * Math.PI) / F.HUB50.n; sl.position.set(-Math.sin(a) * 0.58, Math.cos(a) * 0.58, 0); wg.add(sl); return sl; });
    const bk = new THREE.Group(), bb = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 0.8, 12, 1, true), wood); bb.material = wood.clone(); bb.material.side = THREE.DoubleSide; bk.add(bb);
    const wat = new THREE.Mesh(new THREE.CircleGeometry(0.46, 14), new THREE.MeshStandardMaterial({ color: '#4F93B8', roughness: 0.2 })); wat.rotation.x = -Math.PI / 2; wat.position.y = 0.3; bk.add(wat); bk.userData.water = wat;
    st.props.bucket50 = add(bk, Gl.x + 2.6, Gl.y - 3, Gl.z);
    const br = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]); st.props.brope50 = add(new THREE.Line(br, new THREE.LineBasicMaterial({ color: '#D9C9A0' })), 0, 0, 0);
    st.props.drops50 = Array.from({ length: 6 }, () => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 4), wat.material); d.visible = false; return add(d, 0, 0, 0); });
    // the dome: its drum (open above until it holds), the centering, the voussoirs' places, the shell
    const M = PL.mk, ys = M.y + DOME50.wall;
    for (const sz of [-1, 1]) add(new THREE.Mesh(new THREE.BoxGeometry(DOME50.len + 2, DOME50.wall, 0.8), stoneM), M.x, M.y + DOME50.wall / 2, M.z + sz * (DOME50.Rd + 0.4));
    add(new THREE.Mesh(new THREE.BoxGeometry(0.8, DOME50.wall, 2 * DOME50.Rd + 1.6), stoneM), M.x - DOME50.len / 2 - 0.6, M.y + DOME50.wall / 2, M.z);
    const ctr = new THREE.Group(); add(ctr, M.x, ys, M.z); ctr.rotation.y = Math.PI / 2; st.props.ctr50 = ctr;
    const rib = new THREE.Mesh(new THREE.TorusGeometry(DOME50.Ra - 0.9, 0.22, 6, 32, Math.PI), wood); ctr.add(rib);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(2 * DOME50.Ra - 1, 0.4, 0.6), wood); beam.position.y = -0.2; ctr.add(beam);
    for (let i = 1; i < 6; i++) { const a = (i * Math.PI) / 6, r2 = DOME50.Ra - 0.9, st2 = new THREE.Mesh(new THREE.BoxGeometry(0.16, r2 * Math.sin(a), 0.16), wood); st2.position.set(r2 * Math.cos(a), (r2 * Math.sin(a)) / 2, 0); ctr.add(st2); }
    st.props.posts50 = []; st.props.wedges50 = [];
    for (const dx of [-DOME50.Ra + 1.2, -3.5, 3.5, DOME50.Ra - 1.2]) { const p2 = add(new THREE.Mesh(new THREE.BoxGeometry(0.4, DOME50.wall - 0.9, 0.4), wood), M.x, M.y + (DOME50.wall - 0.9) / 2, M.z - dx); st.props.posts50.push(p2); const w2 = add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.7), mat('#5A4026', 0.9)), M.x, ys - 0.67, M.z - dx); w2.userData.z0 = M.z - dx; st.props.wedges50.push(w2); }
    st.props.vous50 = new THREE.Group(); add(st.props.vous50, M.x, ys, M.z); st.props.vous50.rotation.y = Math.PI / 2;
    let shellMap = null; try { if (doc) { const cv = doc.createElement('canvas'); cv.width = 256; cv.height = 128; const c = cv.getContext('2d'); c.fillStyle = '#E2D4B6'; c.fillRect(0, 0, 256, 128); c.strokeStyle = '#B5A283'; c.lineWidth = 3; for (let r = 0; r < 8; r++) { c.beginPath(); c.moveTo(0, r * 16); c.lineTo(256, r * 16); c.stroke(); for (let q = 0; q < 8; q++) { const x = (q * 32 + (r % 2) * 16) % 256; c.beginPath(); c.moveTo(x, r * 16); c.lineTo(x, r * 16 + 16); c.stroke(); } } shellMap = new THREE.CanvasTexture(cv); shellMap.colorSpace = THREE.SRGBColorSpace; shellMap.wrapS = shellMap.wrapT = THREE.RepeatWrapping; shellMap.repeat.set(4, 2); } } catch (e) { shellMap = null; }
    const vg = new THREE.CylinderGeometry(DOME50.Rd, DOME50.Rd, DOME50.len, 32, 1, true, 0, Math.PI); vg.rotateZ(Math.PI / 2);   // (the vault, as the model's: "בית המוקד כפה")
    const shell = new THREE.Mesh(vg, new THREE.MeshStandardMaterial({ color: '#FFFFFF', map: shellMap, roughness: 0.9, side: THREE.DoubleSide, transparent: true, opacity: 0 })); shell.visible = false; st.props.shell50 = add(shell, M.x, ys, M.z);
    if (STG === 'lishka') {   // (the three chambers' gold outlines, rising in the opening)
      const gm = new THREE.MeshBasicMaterial({ color: '#FFD66E', transparent: true, opacity: 0.85 });
      st.props.plan50 = [[-100, -62, 58, 82], [-146, -134, 50, 62], [-178, -142, -83, -58]].map(([x0, x1, z0, z1]) => { const g = new THREE.Group(); for (const [x, z, w, d] of [[(x0 + x1) / 2, z0, x1 - x0, 1.2], [(x0 + x1) / 2, z1, x1 - x0, 1.2], [x0, (z0 + z1) / 2, 1.2, z1 - z0], [x1, (z0 + z1) / 2, 1.2, z1 - z0]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 10, d), gm); m.position.set(x, 5, z); g.add(m); } g.scale.y = 0.001; return add(g, 0, 16, 0); });
    }
  }
  /** the voussoir j of M on the arch (the box: tangential × radial × deep; its radial axis along the angle) */
  function vous50(j, Mn) { const Ra = DOME50.Ra, th = Math.PI - ((j + 0.5) * Math.PI) / Mn, m = new THREE.Mesh(new THREE.BoxGeometry(((Math.PI * Ra) / Mn) * 0.95, 1.25, 1.7), mat(j === (Mn - 1) / 2 ? '#F4E9CF' : '#E8DCC1', 0.85)); m.position.set(Ra * Math.cos(th), Ra * Math.sin(th), 0); m.rotation.z = th - Math.PI / 2; return m; }
  /** the model's chamber not drawn where his work stands (batch.js XRAY.uHoleB) */
  function hole50(k) { if (STG !== 'lishka') return; if (k === 'gazit') hole46(true, [-101, -61, 55, 85], 45, 16.05); else if (k === 'moked') hole46(true, [-179, -141, -84, -57], 60, 16.05); else hole46(false); }
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
      const gm = new THREE.MeshBasicMaterial({ color: '#FFD66E', transparent: true, opacity: 0.4, depthWrite: false }), hw = CW45.w / 2 + 3, hd = CW45.d / 2 + 3;   // ── build 54 ── (the coordinator's touch play of 53: "a wide glowing slab across 40 % of the screen at the giant" — 53's treatment: half seen, ¼ as wide, below) ── /build 54 ──   // (the gold line along the wall's middle: it rises inside the wall to be)
      st.props.plan = [[0, -hd, 2 * hw + 0.75, 0.75], [0, hd, 2 * hw + 0.75, 0.75], [-hw, 0, 0.75, 2 * hd], [hw, 0, 0.75, 2 * hd]].map(([dx, dz, w, d]) => { const y0 = gy(CW45.x + dx, CW45.z + dz), yP = gy(CW45.x + dx * 1.2, CW45.z + dz * 1.25), Hh = 0.35; const m = new THREE.Mesh(new THREE.BoxGeometry(w, Hh, d), gm); m.geometry.translate(0, Hh / 2, 0); m.scale.y = 0.001; return add(m, CW45.x + dx, Math.max(y0, yP) + 0.3, CW45.z + dz); });   // ── build 54 ── (a line over the plaza's level, ⅓ amah high: from the trench's floor to 2.5 over the plaza its face was the band — between the course's stones at the giant — B54G) ── /build 54 ──
    }
  }
  /** the crane's rope from the jib's end down to the stone's top */
  function craneRope(top) { const r = st.props.crRope; if (!r) return; const a = r.geometry.attributes.position; a.setXYZ(1, a.getX(0), top, a.getZ(0)); a.needsUpdate = true; }
  function dropProps() { try { const g = st.props.root; if (g && g.parent) g.parent.remove(g); } catch (e) { /* */ } st.props = {}; st.life53 = null; }

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
  // ── build 53/54 ── THE OBJECT RULE on a view (Phase A): obj51 from it, then him stepped back to ≤ OBJ53.big while the thing keeps the rule
  // and its margin; stages 01–02 on every act view, 03–07 on the parts that failed it (OBJ54.parts — their own views included) ── /build 54 ──
  function rule53(v, h, HH, tanH, tanV) {
    if (!st.objBB || globalThis.__OBJ53_OFF) return v;
    try {
      const q = obj51(v.p, v.t, st.objBB, { x: h.x, y: h.y, z: h.z, h: HH }, tanH, tanV, { ...OBJ51, ...(st.a53 == null ? {} : { prefer: st.a53 }) }); if (q && !q.self) { v = { p: q.p, t: q.t }; st.a53 = q.key; st.o53 = { w: Math.round(q.w * 100), h: Math.round(q.h * 100), occ: q.occ, a: Math.round(q.a * 57), L: q.L }; }
      const Hf = { x: h.x, y: h.y, z: h.z, h: HH }, F0 = fig53(v.p, v.t, Hf, tanH, tanV);
      if (F0 && F0.s > OBJ53.big && Math.abs(F0.x) < 1.1) { const dx = v.p[0] - v.t[0], dy = v.p[1] - v.t[1], dz = v.p[2] - v.t[2]; for (let k = 1; k <= 16; k++) { const m = 1 + 0.08 * k, P2 = [v.t[0] + dx * m, v.t[1] + dy * m, v.t[2] + dz * m], S2 = share51(P2, v.t, st.objBB, tanH, tanV); if (!(S2.w >= OBJ51.w + OBJ53.margin && S2.h >= OBJ51.h + OBJ53.margin)) break; v = { p: P2, t: v.t }; const F2 = fig53(P2, v.t, Hf, tanH, tanV); if (!F2 || F2.s <= OBJ53.big || Math.abs(F2.x) >= 1.1) break; } }
    } catch (e) { /* */ }
    return v;
  }
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
    // ── build 53 ── THE OBJECT RULE in Phase A (the inspector's review §4 must 1; the coordinator's build-53 brief, item 1): in stages 01–02 the
    // act's thing (its box, st.objBB) ≥ 30 % of the width and 20 % of the height, the line to it clear of him — Phase B's obj51 from this view
    // (him kept whole and ≤ 45 %; the turn chosen last frame preferred — no flicker) ── /build 53 ──
    // (and him ≤ 45 % of the height still — obj51 keeps him so only when he stood whole in the frame to begin with; Phase A's 6.4-amah figure
    // often did not, and the first page's slide made him 60–70 % at the treadwheel, the corner, the pulley: back along the look until he is
    // ≤ OBJ53.big or out of the frame, while the thing keeps the rule)
    if (OBJ53.stg.includes(STG) || OBJ54.parts.includes(st.part)) v = rule53(v, h, HH, tanH, tanV);
    st.camLock = v; return v;
  }

  /* ── the walk: the guide's way to the part's stand (guide39 over the open Mount: every floor free) ── */
  const E39 = { state: () => ({ phase: 'run', acting: !!(st.job && st.job.acting) }), flowNext: () => (st.target ? { id: st.part, at: { x: st.target.x, y: st.target.y, z: st.target.z } } : null), alt39: () => [] };
  const G39 = createGuide39({ E: E39, freeFor: () => () => true });
  const vel = { vx: 0, vz: 0 };
  function walkStep(dt) {
    const h = hero(); let g = null;
    if (st.hold && !st.job) g = G39.dir(h, null);
    if (g && st.part === 'rope' && st.rope53 && STG === 'har') {   // ── build 53 ── the rope's sway and his steer (a drag sideways from where the finger went down; its way on the screen read from the line's own) ── /build 53 ──
      const R5 = st.rope53; R5.t += dt; const a = proj(h.x, h.y + 1, h.z), b = proj(h.x + R5.n.x, h.y + 1, h.z + R5.n.z), sg = a && b ? (b.x - a.x >= 0 ? 1 : -1) : 1;
      const steer = st.hold ? Math.max(-1, Math.min(1, (st.hold.x - st.hold.x0) / (W() * 0.16))) * ROPE53.steer * sg : 0, lat = ROPE53.drift[R5.L] * Math.sin(R5.t * 0.9 + 0.6) + steer;
      const gx = g.x + R5.n.x * lat, gz = g.z + R5.n.z * lat, gl = Math.hypot(gx, gz) || 1; g = { ...g, x: gx / gl, z: gz / gl };
    }
    g = slow53(g, 14);   // ── build 53 ── (≤ 5 amot/s within 6 of the place — the inspector's review §4 important 13) ── /build 53 ──
    walk39(vel, g, 14, dt);
    try { stages.hero.drive(vel.vx, vel.vz); } catch (e) { /* */ }
    if (st.hold && !st.job) R.hands += dt;
    return st.target ? Math.hypot(st.target.x - h.x, st.target.z - h.z) : 99;
  }

  /* ── the parts ── */
  let Lover = 0;   // ── build 44 ── (the yard's chosen level, the test's 2)
  const famL = (fam) => Lover || F.famLevel(S, fam);
  function grade(part, q, at) {
    const fam = FAMOF[STG === 'nashim' && part === 'corner' ? 'corner48' : part] || 'place', L = famL(fam);   // ── build 49 ── (stage 05's corner: its own key)
    if (MODE !== 'stage') {   // ── build 44 ── the yard counts toward the levels (lvl36) and the points; the test only rates
      const r = MODE === 'yard' ? F.famRate(S, fam, L, q) : { rating: rate30(q), opened: 0 }; st.actQ = q; st.actRating = r.rating;
      const Y = S.yard || (S.yard = { pts: {}, runs: 0 }); Y.pts[fam] = (Y.pts[fam] | 0) + (PTS44[r.rating] | 0); if (MODE === 'yard') Y.runs = (Y.runs | 0) + 1; save42(S);
      toast(r.rating, at, r.opened); o.emit && o.emit('h44grade', { part, rating: r.rating, q, L, fam, mode: MODE }); return r.rating;
    }
    const r = F.famRate(S, fam, L, q);
    if (STG !== 'har') { R.streak = r.rating === 'mehudar' ? (R.streak | 0) + 1 : 0; if (R.streak >= 3) { R.streak = 0; setTimeout(() => { if (!doc || !st.ui.root) return; const y = el('h42-g h45-yishar', esc(LINE42.yishar.split(' · ')[0])); y.style.left = `${W() / 2}px`; y.style.top = `${H() * 0.3}px`; st.ui.root.appendChild(y); setTimeout(() => y.remove(), 2200); buzz42('peak'); o.emit && o.emit('h45yishar', {}); }, 900); } }   // ── build 45 ── three מהודר in a row: the crew calls (טיוטה)
    R.grades.push([part, r.rating, Math.round(q * 100) / 100, L]); save42(S);
    if (STG === 'soreg' || STG === 'gates' || STG === 'nashim') { try { if (stages.setStage) stages.setStage(STG === 'soreg' ? 'sorag' : STG, 'building', Math.min(STG === 'nashim' ? 0.62 : 0.92, (PARTS.indexOf(part) + 1) / (PARTS.length - 1)), {}); } catch (e) { /* */ } }   // (build 48: the women's court under 0.62 — the model's own gallery comes in its finish, at the reveal: his stands alone till then)   // ── build 46 ── (the crews' חיל rises with his parts; build 47: the gatehouses)
    toast(r.rating, at, r.opened);
    o.emit && o.emit('h42grade', { part, rating: r.rating, q, L, fam });
    return r.rating;
  }
  /** the act's thing: for the camera always; the touch surface on it only for the acts touched on the thing (the pile's acts drag from the pile) */
  function objPlace(on, pts, id, bbPts) {   // ── build 53 ── (bbPts: the thing for the camera when the touch is on a part of it — the freed roller by the stone) ── /build 53 ──
    const ref = (bbPts && bbPts.length ? bbPts : pts), p0 = on && ref && ref[0]; st.obj = p0 ? { x: p0.x, y: p0.y, z: p0.z } : null;
    st.objBB = p0 ? bb51(ref.filter((p) => p && Number.isFinite(p.x))) : null;   // ── build 53 ── (the act's thing as a box — its touch parts' spheres — for the object rule and the tools, touched or dragged) ── /build 53 ──
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
  /* ── build 55 ── STAGE 08, היסוד (docs/specs/shlav-alef-08-16-he.md §2, §3 "08"): the field stones of the altar — untrimmed, whole — from
   * בית כרם. The INSPECT family's stone on the bench (turned face by face, wiped, felt along its edge, seen against the light), kasher ➡ to
   * the "למזבח" heap, pasul ⬅ to the "לא למזבח" heap (§1 rule 13); the PLACE family's first course (an untrimmed puzzle, no snapping) and the
   * last row of the yesod, only where there is one (מדות ג, א). Simple shapes, canvas faces; המחשה ── /build 55 ── */
  const ST55 = { cv: null };
  /** a stone face drawn on a canvas: the limestone (lit from the left), its pits; the crack, the mud, the edge's nick, the iron's scratch */
  function face55(c2, w, h, o2) {
    const rnd = (() => { let a = (o2.seed | 0) + 7; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; })();
    const g = c2.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#EADFC6'); g.addColorStop(0.55, '#D6C8AA'); g.addColorStop(1, '#B9A988');
    c2.fillStyle = g; c2.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) { c2.fillStyle = rnd() < 0.5 ? 'rgba(120,100,70,.18)' : 'rgba(255,250,235,.22)'; c2.beginPath(); c2.arc(rnd() * w, rnd() * h, 1 + rnd() * 3, 0, 6.283); c2.fill(); }
    for (let i = 0; i < 5; i++) { c2.fillStyle = 'rgba(90,72,50,.22)'; c2.beginPath(); c2.ellipse(rnd() * w, rnd() * h, 4 + rnd() * 9, 3 + rnd() * 6, rnd() * 3, 0, 6.283); c2.fill(); }
    if (o2.crack) {   // a crack: a dark jagged line with two branches, a pale lip
      const x0 = (o2.u - o2.len / 2) * w, x1 = (o2.u + o2.len / 2) * w, y0 = o2.v * h; const pts = []; for (let i = 0; i <= 9; i++) pts.push([x0 + ((x1 - x0) * i) / 9, y0 + (rnd() - 0.5) * h * 0.16 + (i - 4.5) * h * 0.012]);
      for (const [col, wd] of [['rgba(255,248,230,.7)', 6], ['#2A1E14', 3.4]]) { c2.strokeStyle = col; c2.lineWidth = wd; c2.lineJoin = 'round'; c2.beginPath(); pts.forEach(([x, y], i) => (i ? c2.lineTo(x, y) : c2.moveTo(x, y))); c2.stroke(); }
      c2.lineWidth = 2; for (const k of [3, 6]) { c2.beginPath(); c2.moveTo(pts[k][0], pts[k][1]); c2.lineTo(pts[k][0] + (rnd() - 0.3) * w * 0.08, pts[k][1] + h * (0.1 + rnd() * 0.08) * (k === 3 ? 1 : -1)); c2.stroke(); }
    }
    if (o2.rake) {   // ── build 56 ── the lamp low at one side: that side bright, the far side in shade ── /build 56 ──
      const th2 = o2.rake.theta, side = th2 < 0 ? 0 : 1, gg = c2.createLinearGradient(side ? w : 0, 0, side ? 0 : w, 0), k2 = Math.min(1, Math.abs(th2) / 1.3);
      gg.addColorStop(0, `rgba(255,214,150,${(0.25 * k2).toFixed(2)})`); gg.addColorStop(1, `rgba(10,6,2,${(0.45 * k2).toFixed(2)})`); c2.fillStyle = gg; c2.fillRect(0, 0, w, h);
    }
    if (o2.hair > 0) {   // ── build 56 ── the hidden crack: a hair-thin shadow line with a lit lip, seen only as the light rakes ── /build 56 ──
      const x0 = (o2.u - o2.len / 2) * w, x1 = (o2.u + o2.len / 2) * w, y0 = o2.v * h, pts = []; for (let i = 0; i <= 12; i++) pts.push([x0 + ((x1 - x0) * i) / 12, y0 + Math.sin(i * 1.7 + (o2.seed % 5)) * h * 0.03]);
      for (const [col, wd] of [[`rgba(255,240,200,${(0.8 * o2.hair).toFixed(2)})`, 3], [`rgba(25,16,8,${(0.95 * o2.hair).toFixed(2)})`, 1.6]]) { c2.strokeStyle = col; c2.lineWidth = wd; c2.beginPath(); pts.forEach(([x, y], i) => (i ? c2.lineTo(x, y + (wd > 2 ? -1.5 : 0)) : c2.moveTo(x, y))); c2.stroke(); }
    }
    if (o2.scratch) { c2.strokeStyle = 'rgba(235,235,240,.28)'; c2.lineWidth = 1.2; c2.beginPath(); c2.moveTo((o2.u - 0.22) * w, o2.v * h + 6); c2.lineTo((o2.u + 0.22) * w, o2.v * h - 6); c2.stroke(); }
    if (o2.nick != null) { const x = o2.nick * w; c2.fillStyle = 'rgba(60,45,30,.55)'; c2.beginPath(); c2.moveTo(x - 7, 0); c2.lineTo(x + 7, 0); c2.lineTo(x + 1, 9); c2.closePath(); c2.fill(); }
    if (o2.mark === 'fossil') {   // ── build 57 ── a shell fossil: a ribbed fan, pale and a little raised — nature, not a flaw ── /build 57 ──
      const cx = (o2.mu2 != null ? o2.mu2 : 0.66) * w, cy = (o2.mv2 != null ? o2.mv2 : 0.6) * h, R0 = h * 0.22, by = cy + R0 * 0.35; c2.fillStyle = 'rgba(246,238,218,.95)'; c2.strokeStyle = 'rgba(112,92,62,.9)'; c2.lineWidth = 2.2;
      c2.beginPath(); c2.moveTo(cx, by); c2.arc(cx, by, R0, Math.PI * 1.08, Math.PI * 1.92); c2.closePath(); c2.fill(); c2.stroke();
      for (let r = 0; r < 7; r++) { const a = Math.PI * (1.12 + r * 0.11); c2.beginPath(); c2.moveTo(cx, by); c2.lineTo(cx + Math.cos(a) * R0, by + Math.sin(a) * R0); c2.stroke(); }
      c2.beginPath(); c2.ellipse(cx, by + R0 * 0.05, R0 * 0.22, R0 * 0.12, 0, 0, 6.283); c2.fill(); c2.stroke();
    }
    if (o2.mark === 'pits') {   // ── build 57 ── natural pits: small round hollows, soft-edged, shaded inside ── /build 57 ──
      for (let i = 0; i < 11; i++) { const x = ((o2.mu2 != null ? o2.mu2 : 0.5) - 0.22 + rnd() * 0.44) * w, y = ((o2.mv2 != null ? o2.mv2 : 0.5) - 0.2 + rnd() * 0.4) * h, r = 3.5 + rnd() * 5.5; const gg = c2.createRadialGradient(x - r * 0.3, y - r * 0.3, 0.5, x, y, r); gg.addColorStop(0, 'rgba(70,52,34,.8)'); gg.addColorStop(1, 'rgba(70,52,34,0)'); c2.fillStyle = gg; c2.beginPath(); c2.arc(x, y, r, 0, 6.283); c2.fill(); }
    }
    if (o2.mud > 0) {   // a mud stain over the face (o2.mud: how much is left)
      c2.globalAlpha = Math.min(1, o2.mud * 1.15); c2.fillStyle = o2.moss ? '#4F6B2E' : '#6B4A2C';   /* (── build 57 ── moss: green) */
      const cx = (o2.mu != null ? o2.mu : o2.u) * w, cy = (o2.mv != null ? o2.mv : o2.v) * h; c2.beginPath(); for (let i = 0; i <= 28; i++) { const a = (i / 28) * 6.283, r = (0.34 + 0.06 * Math.sin(a * 2 + (o2.seed % 7)) + 0.025 * Math.sin(a * 5 + 1.3)) * h;   /* (a soft blob — at 14 points ± 0.1 it was a star) */ const x = cx + Math.cos(a) * r * 1.55, y = cy + Math.sin(a) * r; i ? c2.lineTo(x, y) : c2.moveTo(x, y); } c2.closePath(); c2.fill();
      c2.fillStyle = o2.moss ? '#3A5222' : '#4E331C'; for (let i = 0; i < 9; i++) { c2.beginPath(); c2.arc(cx + (rnd() - 0.5) * h * 0.9, cy + (rnd() - 0.5) * h * 0.5, 3 + rnd() * 5, 0, 6.283); c2.fill(); }
      c2.globalAlpha = 1;
    }
  }
  /** the stone on the bench: a box, its edges a little uneven, four side faces each a canvas (redrawn as the stone changes); the iron's glint a thin bright strip */
  function stoneMesh55() {
    const geo = new THREE.BoxGeometry(1.8, 1.2, 1.5, 6, 4, 5), a = geo.attributes.position;
    for (let i = 0; i < a.count; i++) { const x = a.getX(i), y = a.getY(i), z = a.getZ(i), k = 0.045 * Math.sin(x * 7.1 + z * 3.3) + 0.035 * Math.sin(y * 9.7 + x * 2.2); a.setXYZ(i, x * (1 + k), y * (1 + k * 0.6), z * (1 + k)); }
    geo.computeVertexNormals();
    const faces = [0, 1, 2, 3].map(() => { const cv = doc ? doc.createElement('canvas') : null; if (cv) { cv.width = 256; cv.height = 176; } const tx = cv ? new THREE.CanvasTexture(cv) : null; if (tx) tx.colorSpace = THREE.SRGBColorSpace; return { cv, tx, m: new THREE.MeshStandardMaterial({ color: '#FFFFFF', map: tx, roughness: 0.92, emissive: new THREE.Color('#3A3024'), emissiveMap: tx, emissiveIntensity: 0.55 }) }; });
    const plain = mat('#CDBF9F', 0.92);
    const mats = [faces[1].m, faces[3].m, plain, plain, faces[0].m, faces[2].m];   // (+x f1, −x f3, +y, −y, +z f0, −z f2)
    const m = new THREE.Mesh(geo, mats), gl = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.045), new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    const grp = new THREE.Group(); grp.add(m); grp.add(gl); grp.userData = { faces, glint: gl, mesh: m }; return grp;
  }
  function paint55(sm, J2, o3) {
    const s2 = J2.state(), F2 = sm.userData.faces;
    for (let f = 0; f < 4; f++) {
      const fc = F2[f]; if (!fc.cv) continue; const c2 = fc.cv.getContext('2d'); if (!c2) continue;
      const on = s2.at.face === f, mudOn = s2.mud === f ? 1 - s2.wiped : 0;
      if (J2.look) { const l = J2.look(f); face55(c2, fc.cv.width, fc.cv.height, { seed: s2.at.seed + f * 31, u: l.crack ? l.crack.u : s2.at.u, v: l.crack ? l.crack.v : s2.at.v, len: s2.at.len, crack: !!l.crack, mark: l.mark, mu2: l.markAt ? l.markAt.u : null, mv2: l.markAt ? l.markAt.v : null, mud: l.coat, moss: l.moss, mu: 0.5, mv: 0.5 }); fc.tx.needsUpdate = true; continue; }   // ── build 57 ── (stage 10's stones: each face its marks)
      face55(c2, fc.cv.width, fc.cv.height, { seed: s2.at.seed + f * 31, u: s2.at.u, v: s2.at.v, len: s2.at.len, rake: o3 && f === 0 ? o3 : null, hair: on && s2.type === 'hair' ? (o3 ? o3.rake : 0) : 0, crack: on && (s2.type === 'crack' || s2.type === 'mudcrack'), scratch: on && s2.type === 'iron', mud: mudOn, mu: 0.5, mv: 0.5, nick: f === 0 && s2.edge && s2.edge.nick != null && s2.edge.L <= 1 ? s2.edge.nick : null });
      fc.tx.needsUpdate = true;
    }
    // the glint on the iron face: a thin strip just off the face's plane
    const gl = sm.userData.glint, fi = s2.type === 'iron' ? s2.at.face : -1; gl.visible = fi >= 0;
    if (fi >= 0) { const nx = [0, 1, 0, -1][fi], nz = [1, 0, -1, 0][fi], w = fi % 2 ? 1.5 : 1.8; gl.position.set(nx * 0.91 + (fi % 2 ? 0 : (s2.at.u - 0.5) * w), 0.6 - s2.at.v * 1.2, nz * 0.76 + (fi % 2 ? (0.5 - s2.at.u) * w * nx : 0)); gl.rotation.set(0, [0, Math.PI / 2, Math.PI, -Math.PI / 2][fi], -0.26); }
  }
  /** the bench, its stone, the two heaps beside it (למזבח right, לא למזבח left — as the camera sees them from the south); the cart's raw heap behind */
  function props55(add) {
    const B = PL.bench55, y0 = gy(B.x, B.z);
    st.props.bench55 = add(new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.0, 1.9), mat('#B8A27E', 0.9)), B.x, y0 + 0.5, B.z);
    const sm = stoneMesh55(); add(sm, B.x, y0 + 1.6, B.z); st.props.stone55 = sm; sm.visible = false;
    st.props.heap55 = {};
    for (const [k, dx] of [['altar', 1.75], ['out', -1.75]]) { const g2 = new THREE.Group(); add(g2, B.x + dx, y0 + 1.0, B.z + 0.1); st.props.heap55[k] = g2; }
    if (STG === 'yesod') {
      // the first course on the altar's north side: its dark bed, the fixed stones, the gaps' recesses (filled in by the job)
      const C = PL.course55, cy = gy(C.x, C.z); st.props.course55 = new THREE.Group(); add(st.props.course55, C.x, cy, C.z);
      { const bed = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.3, 2.6), mat('#4A3D2E', 0.95)); bed.position.set(0, 0.15, 0); st.props.course55.add(bed); }
      // the altar's plan: its gold line (thin, half seen), rising in the opening
      const gm = new THREE.MeshBasicMaterial({ color: '#FFD66E', transparent: true, opacity: 0.45, depthWrite: false }), X0 = ALT55.x0, Z0 = ALT55.z0, S0 = ALT55.side, ay = gy(X0 + 16, Z0 + 16);
      st.props.plan55 = [[X0 + S0 / 2, Z0, S0 + 0.5, 0.5], [X0 + S0 / 2, Z0 + S0, S0 + 0.5, 0.5], [X0, Z0 + S0 / 2, 0.5, S0 + 0.5], [X0 + S0, Z0 + S0 / 2, 0.5, S0 + 0.5]].map(([x, z, w, d]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, d), gm); m.geometry.translate(0, 0.15, 0); m.scale.y = 0.001; return add(m, x, ay + 0.05, z); });
    }
  }
  /** ── build 55 ── the court alive round the altar's work: crews at the raw heaps, the carts from בית כרם coming in through the east and unloading by the bench */
  function life55(add) {
    const L = { crews: [], act: null, t: 0, carts: [] };
    [[-12 + 4, -36], [-64, -30], [-64, 20], [-6, 14]].forEach(([x, z], k) => { const c = crew53(k + 3); add(c, x, gy(x, z), z); L.crews.push(c); });
    L.act = crew53(11); L.act.visible = false; add(L.act, -38, gy(-38, -3), -3); L.crews.push(L.act);
    for (let k = 0; k < 2; k++) { const c = cart53(); add(c, 4, gy(4, -30), -30); c.rotation.y = Math.PI; L.carts.push({ g: c, ph: k * 0.5 }); }
    L.noAct = true; st.life53 = L;   // (no crew set behind the act's thing: in the field's view from above it stood in the course)
  }
  function lifeFrame55(dt) {
    const L = st.life53; if (!L || !L.carts) return;
    for (const c of L.carts) {   // from the court's east (x 6) to the bench's heap (x −6), a pause to unload, and out again
      c.ph = (c.ph + dt / 26) % 1; const u = c.ph, k = u < 0.4 ? u / 0.4 : u < 0.6 ? 1 : 1 - (u - 0.6) / 0.4, x = 6 - 12 * k, z = -31.5 + (c.ph > 0.6 ? 2.6 : 0);
      c.g.position.set(x, gy(x, z), z); c.g.rotation.y = u < 0.6 ? Math.PI : 0; for (const w of c.g.userData.wheels) w.rotation.z -= (u < 0.4 || u > 0.6 ? 1.2 : 0) * dt;
    }
  }
  /** a screen ray to the plane y = Y → { x, z } (null off it) */
  function ground55(px, py, Y) {
    const c = camera(); if (!c) return null; const nd = new THREE.Vector2((px / W()) * 2 - 1, -(py / H()) * 2 + 1), rc = new THREE.Raycaster(); rc.setFromCamera(nd, c);
    const o3 = rc.ray.origin, d3 = rc.ray.direction; if (Math.abs(d3.y) < 1e-4) return null; const t = (Y - o3.y) / d3.y; if (t < 0) return null; return { x: o3.x + d3.x * t, z: o3.z + d3.z * t };
  }
  /** the stone on the bench in its macro: one stone after another from the list; kind 'look' (turn ↔, rub, decide) or 'nail' (feel the edge, then decide) */
  function mkStone55(kind, list, L, part) {
    const B = PL.bench55, y0 = gy(B.x, B.z), sm = st.props.stone55, heaps = st.props.heap55 || {}, book = S.book48 || (S.book48 = {});
    if (!sm) return null;
    sm.visible = true; let jt = 0, i = 0, J = null, N = null, res = [], wait = -1, endT = -1, rotY = 0, rotT = 0, tilt = 0, phase = 'look', fly = null, rub = 0, slowT = 0, catchAt = null, flash = 0, lastMv = null, holdT = 0, said = 0;
    // ── build 56 ── the lamp (kind 'lamp': its angle θ round the stone, the sides it has swept, the crack seen) and the mallet (kind 'tap': the witness struck, the new one, the rings) ── /build 56 ──
    let theta = 0.15, lampDrag = false, sides = { l: false, r: false }, seen56 = false, painted = -1, tapW = false, tapN = false, waves = [], lastWave = null, wGlow = 0, strike = 0;
    const lamp = st.props.lamp56, wit = st.props.witness56, mallet = st.props.mallet56, back = st.props.back56;
    if (kind === 'lamp') { if (lamp) lamp.visible = true; if (back) back.visible = true; }
    if (kind === 'tap' || kind === 'all') { if (wit) wit.visible = true; if (mallet) mallet.visible = true; if (back) { back.visible = true; back.scale.set(1.6, 1.4, 1); } }   // (the court's crews and carts behind: a dark cloth there too — the rings read on it)   // ── build 57 ── ('all': stage 10's stone — every tool at hand)
    // ── build 57 ── stage 10 ('all'): what the finger, the edge or the mallet just found (till the next stone); the edge felt along ── /build 57 ──
    let said57 = null, edge57 = null, edgeAt = null;
    const sub57 = () => `אבן ${i + 1} / ${list.length} · רמה ${kind === 'all' && J ? J.state().L : L}`;
    const lineFor = () => (kind === 'all' ? said57 || LINE42.check57 : kind === 'lamp' ? (seen56 ? LINE42.rakeSeen56 : sides.l && sides.r ? LINE42.rakeWhole56 : LINE42.lamp56) : kind === 'tap' ? (!tapW ? LINE42.tap56 : !tapN ? LINE42.tapNew56 : LINE42.tapDecide56) : kind === 'nail' ? (phase === 'feel' ? LINE42.nail55 : N && N.state().caught ? LINE42.caught55 : LINE42.smooth55) : part === 'iron' ? LINE42.iron55 : part === 'mud' ? LINE42.mud55 : LINE42.stone55);
    const next = () => {
      const t = list[i]; said57 = null; edge57 = null; edgeAt = null; theta = 0.15; sides = { l: false, r: false }; seen56 = false; painted = -1; tapW = false; tapN = false; lastWave = null; J = kind === 'all' ? F.createStone57(t, Math.random) : F.createStone55(kind === 'nail' ? 'whole' : t, Math.random, L); N = kind === 'nail' ? F.createNail55(t === 'nick', Math.random, L) : null;
      if (N) J.state().edge = { nick: N.state().nick, L }; phase = kind === 'nail' ? 'feel' : 'look'; rotY = rotT = 0; tilt = 0; catchAt = null; holdT = 0; said = 0;
      sm.position.set(B.x, y0 + 1.6, B.z); sm.scale.setScalar(1); sm.rotation.set(0, 0, 0); paint55(sm, J, kind === 'lamp' ? { rake: F.rake56(theta, L), theta } : null); line(lineFor(), sub57());
    };
    next();
    if (st.ui.pad) st.ui.pad.classList.add('full');
    const th = () => { const c = camera(), tv = Math.tan((((c && c.fov) || 50) * Math.PI) / 360); return { tv, th: tv * (W() / H()) }; };
    const box = () => { const a = proj(B.x - 0.95, y0 + 2.25, B.z + 0.75), b = proj(B.x + 0.95, y0 + 1.0, B.z + 0.75); if (!a || !b) return null; const l = Math.min(a.x, b.x), r = Math.max(a.x, b.x), t = Math.min(a.y, b.y), bt = Math.max(a.y, b.y); return { l, r, t, b: bt, w: r - l, h: bt - t, cx: (l + r) / 2, cy: (t + bt) / 2 }; };
    const zones = () => { const out = {}; for (const [k, dx] of [['altar', 1.75], ['out', -1.75]]) { const q = proj(B.x + dx, y0 + 1.2, B.z + 0.1), zh = Math.max(96, H() * 0.42); let zw = Math.max(96, W() * 0.22), x = k === 'altar' ? Math.max(W() * 0.745, q ? q.x - zw / 2 : 0) : Math.min(W() * 0.255 - zw, q ? q.x - zw / 2 : W()); x = Math.max(6, Math.min(W() - zw - 6, x)); if (k === 'altar' && x < W() * 0.745) { x = W() * 0.745; zw = Math.min(zw, W() - x - 6); } if (k === 'out' && x + zw > W() * 0.255) zw = Math.max(70, W() * 0.255 - x); const y = Math.max(60, Math.min(H() - zh - 6, (q ? q.y : H() * 0.6) - zh / 2)); out[k] = { x, y, w: zw, h: zh }; } return out; };   /* (beyond the stone's sides: a swipe on it turns it, a drag past it decides) */
    const inZ = (z, x, y) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h;
    const edge = () => { const a = proj(B.x - 0.9, y0 + 2.2, B.z + 0.76), b = proj(B.x + 0.9, y0 + 2.2, B.z + 0.76); return a && b ? { a, b } : null; };
    const onEdge = (x, y) => { const E = edge(); if (!E) return null; const dx = E.b.x - E.a.x, dy = E.b.y - E.a.y, l2 = dx * dx + dy * dy || 1, u = ((x - E.a.x) * dx + (y - E.a.y) * dy) / l2, px = E.a.x + dx * u, py = E.a.y + dy * u; return { u, d: Math.hypot(x - px, y - py), lenPx: Math.sqrt(l2) }; };
    function decided(r, toAltar) {
      const T2 = kind === 'nail' ? (N.state().nick != null ? F.STONE55.nick : F.STONE55.whole) : J.T, key = kind === 'nail' ? (N.state().nick != null ? 'nick' : 'whole') : J.state().type;
      res.push(r); try55(part, r === 'ok'); buzz42(r === 'ok' ? 'settle' : 'retry'); o.sound && o.sound(r === 'ok' ? 'stone' : 'grind');
      if (kind === 'all') {   // ── build 57 ── every decoy its own page in the book ("מאובן — לא פגימה"), and the flaws' pages
        const fresh = J.pages().filter((p2) => !book[p2]); for (const p2 of fresh) book[p2] = { t: Date.now() }; save42(S);
        line(`${T2.he} — ${T2.bad ? 'לא למזבח' : 'למזבח'} · ${T2.why}`, `${fresh.length ? `📖 ${fresh.map((p2) => F.PAGE57[p2] || (F.STONE55[p2] ? F.STONE55[p2].he : p2)).join(' · ')} · ` : ''}${r === 'ok' ? 'נכון' : r === 'waste' ? 'נפסלה אבן כשרה — כשר' : 'אבן פסולה הונחה — טעון תיקון'}`);
        o.emit && o.emit('h55stone', { type: key, r, pages: fresh }); fly = { t: 0, to: toAltar ? 'altar' : 'out' }; wait = 2.6; return;
      }
      const isNew = !book[key]; if (isNew) book[key] = { t: Date.now() }; save42(S);
      const why = key === 'iron' && r === 'ok' ? LINE42.ironWhy55 : `${T2.he} — ${T2.bad ? 'לא למזבח' : 'למזבח'} · ${T2.why}`;
      line(why, `${isNew ? '📖 עמוד חדש בספר הפגימות · ' : ''}${r === 'ok' ? 'נכון' : r === 'waste' ? 'נפסלה אבן כשרה — כשר' : 'אבן פסולה הונחה — טעון תיקון'}`);
      o.emit && o.emit('h55stone', { type: key, r }); fly = { t: 0, to: toAltar ? 'altar' : 'out' }; wait = key === 'iron' ? 3.4 : 2.4;
    }
    const job = {
      acting: true, fullPad: true, kind: 'stone55', mode: kind, part, get J() { return J; }, get N() { return N; }, phase: () => phase, box, zones, edge, list, res: () => res,
      lampAt: () => (lamp ? proj(lamp.position.x, lamp.position.y, lamp.position.z) : null), lampTo: (th2) => { const q = lamp; if (!q) return null; return proj(B.x + Math.sin(th2) * 1.75, q.position.y, B.z + Math.cos(th2) * 1.75); }, witAt: () => (wit ? proj(wit.position.x, wit.position.y + 0.35, wit.position.z) : null), get lastWave() { return lastWave; }, get theta() { return theta; }, taps: () => ({ w: tapW, n: tapN }),
      ownView: () => true, snapView: () => jt < 0.2,
      view() {
        const { th: t2, tv } = th();
        if (phase === 'feel') { const D = 1.8 / (2 * VIEW55.edge * t2); return { p: [B.x, y0 + 2.2 + D * 0.45, B.z + 0.76 + D * 0.9], t: [B.x, y0 + 2.12, B.z + 0.76] }; }
        if (kind === 'tap' || kind === 'all') { const D = 2.75 / (2 * VIEW55.stone * t2); return { p: [B.x - 0.55, y0 + 1.8 + D * 0.26, B.z + 0.75 + D], t: [B.x - 0.55, y0 + 2.0, B.z - 0.2] }; }   /* (the witness on its stand behind-left in the frame too) */
        const D = 1.8 / (2 * VIEW55.stone * t2); void tv; return { p: [B.x, y0 + 1.6 + D * 0.26, B.z + 0.75 + D], t: [B.x, y0 + 1.78, B.z + 0.3] };   /* (the share at its front face, a little above it: from its middle the face stood 55 % wide, its top under the line — c55-T1) */
      },
      down(a) { holdT = now(); lastMv = { x: a.x, y: a.y, t: now(), u: null }; rub = 0; edge57 = null;
        if (kind === 'all' && J && wait < 0 && !fly) { const e = onEdge(a.x, a.y); if (e && e.d < Math.max(18, H() * 0.06) && e.u > -0.05 && e.u < 1.05) edge57 = { u: e.u, t: now() }; }   // ── build 57 ── (a finger put down on the top edge's dashed line: it feels along the edge)
        if (kind === 'lamp' && lamp && !fly && wait < 0) { const q = proj(lamp.position.x, lamp.position.y, lamp.position.z); if (q && Math.hypot(q.x - a.x, q.y - a.y) < Math.max(40, W() * 0.065)) lampDrag = true; } },
      move(a) {
        if (!J || wait >= 0 || fly) return;
        if (lampDrag) {   // the lamp along its arc: the angle whose place on the screen is nearest the finger
          let best = theta, bd = 1e9; for (let th2 = -1.45; th2 <= 1.451; th2 += 0.05) { const q = proj(B.x + Math.sin(th2) * 1.75, lamp.position.y, B.z + Math.cos(th2) * 1.75); if (!q) continue; const d = Math.hypot(q.x - a.x, q.y - a.y); if (d < bd) { bd = d; best = th2; } }
          theta = best; if (theta < -0.95) sides.l = true; if (theta > 0.95) sides.r = true;
          const k = F.rake56(theta, L); if (J.state().type === 'hair' && k >= 0.6 && !seen56) { seen56 = true; buzz42('tick'); o.sound && o.sound('tick'); } line(lineFor(), `אבן ${i + 1} / ${list.length} · רמה ${L}`);
          return;
        }
        const t = now(), dt = Math.max(1e-3, t - (lastMv ? lastMv.t : t)), Bx = box();
        if (kind === 'all' && edge57) {   // ── build 57 ── along the edge, slowly: at a nick the finger catches (build 55's fingernail)
          const e = onEdge(a.x, a.y); if (!e || e.d > Math.max(46, H() * 0.12)) { lastMv = { x: a.x, y: a.y, t, u: null }; return; }
          const r = J.edgeSlide(edge57.u, e.u, Math.max(1e-3, t - edge57.t)); edge57 = { u: e.u, t };
          if (r === 'fast') { slowT = 1.6; line(LINE42.slow55, sub57()); } else if (r === 'caught' && edgeAt == null) { edgeAt = Math.max(0, Math.min(1, J.state().nick ? J.state().nick.u : e.u)); flash = 1.4; said57 = LINE42.edge57; buzz42('mallet'); o.sound && o.sound('tick'); line(lineFor(), sub57()); }
          lastMv = { x: a.x, y: a.y, t, u: null }; return;
        }
        if (phase === 'feel' && N) {
          const e = onEdge(a.x, a.y); if (!e || e.d > Math.max(46, H() * 0.12) || e.u < -0.05 || e.u > 1.05) { if (lastMv) lastMv.u = null; lastMv = { x: a.x, y: a.y, t, u: null }; return; }
          if (lastMv && lastMv.u != null) { const r = N.slide(lastMv.u, e.u, dt); if (r === 'fast') { slowT = 1.6; line(LINE42.slow55, `רמה ${L}`); } else if (r === 'caught' && !catchAt) { catchAt = Math.max(0, Math.min(1, N.state().nick)); flash = 1.4; buzz42('mallet'); o.sound && o.sound('tick'); line(LINE42.caught55, `רמה ${L}`); } }
          lastMv = { x: a.x, y: a.y, t, u: e.u }; return;
        }
        if (Bx && a.x0 >= Bx.l - 30 && a.x0 <= Bx.r + 30 && a.y0 >= Bx.t - 30 && a.y0 <= Bx.b + 30) {   // a rub on the stone: it tilts toward the finger a little, and wipes the face in view
          const d = lastMv ? Math.hypot(a.x - lastMv.x, a.y - lastMv.y) : 0; if (a.x >= Bx.l && a.x <= Bx.r && a.y >= Bx.t && a.y <= Bx.b && t - holdT > 0.22) { rub += d; const r = J.wipe(d / (Bx.w * 2.2)); if (r === 'wiping' || r === 'wiped') { paint55(sm, J); if (r === 'wiped') { buzz42('tick'); o.sound && o.sound('brush'); if (kind === 'all') { said57 = J.state().L >= 4 ? LINE42.more57 : LINE42.wiped57; line(lineFor(), sub57()); } } }
            else if (kind === 'all' && r === 'clean' && rub > Bx.w * 0.45 && J.state().felt[J.state().face] == null) {   // ── build 57 ── the finger over the clean face: a crack catches it; a fossil or pits — smooth (nature)
              const f = J.feel(); if (f === 'catch') { said57 = LINE42.catch57; flash = 1.4; buzz42('mallet'); o.sound && o.sound('tick'); } else if (f === 'fossil' || f === 'pits') { said57 = J.state().L >= 4 ? LINE42.more57 : f === 'fossil' ? LINE42.fossil57 : LINE42.pits57; buzz42('tick'); } else said57 = LINE42.plain57; line(lineFor(), sub57()); } }
          tilt = Math.max(-0.55, Math.min(0.55, ((a.x - a.x0) / Math.max(60, Bx.w)) * 0.9));
        }
        lastMv = { x: a.x, y: a.y, t, u: null };
      },
      up(a) {
        tilt = 0; if (lampDrag) { lampDrag = false; return; } if (!J || wait >= 0 || fly) return;
        const dx = a.x - a.x0, dy = a.y - a.y0, px = Math.hypot(dx, dy), dur = now() - holdT, Z = zones(), Bx = box();
        if (kind === 'all' && edge57 && px >= F.DRAG42) { edge57 = null; if (edgeAt == null && J.edgeFelt() >= 0.85) { said57 = LINE42.edgeOk57; line(lineFor(), sub57()); } return; }   // ── build 57 ── (the whole edge felt, no catch: whole)
        edge57 = null;
        if (kind === 'all' && px < F.DRAG42 && dur < 0.45) {   // ── build 57 ── the mallet among the tools: the witness rings whole; the new stone as it is
          const wq = wit ? proj(wit.position.x, wit.position.y + 0.35, wit.position.z) : null, onW = wq && Math.hypot(wq.x - a.x, wq.y - a.y) < Math.max(46, W() * 0.08), onN = Bx && a.x >= Bx.l && a.x <= Bx.r && a.y >= Bx.t && a.y <= Bx.b;
          if (onW) { waves.push({ x: wq.x, y: wq.y, t: 0, R: F.ring56(false, 3) }); strike = 0.3; if (mallet) mallet.position.set(wit.position.x + 0.5, wit.position.y + 0.6, wit.position.z + 0.3); o.sound && o.sound('ring'); buzz42('tick'); said57 = LINE42.witness57; line(lineFor(), sub57()); return; }
          if (onN) { const cr = J.tap() === 'dull', R2 = F.ring56(cr, 3); lastWave = R2.T >= 1.4 ? 'long' : 'short'; waves.push({ x: Bx.cx, y: Bx.cy, t: 0, R: R2 }); strike = 0.3; if (mallet) mallet.position.set(B.x + 1.0, y0 + 2.3, B.z + 0.9); o.sound && o.sound(cr ? 'thud' : 'ring'); buzz42(cr ? 'retry' : 'tick'); said57 = cr ? LINE42.dull57 : LINE42.ring57; line(lineFor(), sub57()); return; }
        }
        if (kind === 'tap' && px < F.DRAG42) {   // the mallet: the witness first, then the new stone — each rings as it is
          const wq = wit ? proj(wit.position.x, wit.position.y + 0.35, wit.position.z) : null, onW = wq && Math.hypot(wq.x - a.x, wq.y - a.y) < Math.max(46, W() * 0.08), onN = Bx && a.x >= Bx.l && a.x <= Bx.r && a.y >= Bx.t && a.y <= Bx.b;
          if (onW) { tapW = true; waves.push({ x: wq.x, y: wq.y, t: 0, R: F.ring56(false, L) }); strike = 0.3; if (mallet) mallet.position.set(wit.position.x + 0.5, wit.position.y + 0.6, wit.position.z + 0.3); o.sound && o.sound('ring'); buzz42('tick'); line(lineFor(), `אבן ${i + 1} / ${list.length} · רמה ${L}`); return; }
          if (onN) { if (!tapW) { wGlow = 2; line(LINE42.tapFirst56, `רמה ${L}`); return; } const cr = J.state().type === 'deep', R2 = F.ring56(cr, L); tapN = true; lastWave = R2.T >= 1.4 ? 'long' : 'short'; waves.push({ x: Bx.cx, y: Bx.cy, t: 0, R: R2 }); strike = 0.3; if (mallet) mallet.position.set(B.x + 1.0, y0 + 2.3, B.z + 0.9); o.sound && o.sound(cr ? 'thud' : 'ring'); buzz42(cr ? 'retry' : 'tick'); line(lineFor(), `אבן ${i + 1} / ${list.length} · רמה ${L}`); return; }
        }
        if (phase === 'feel') { if (catchAt != null || (N && N.felt() >= 0.9)) { phase = 'decide'; line(N.state().caught ? LINE42.caught55 : LINE42.smooth55, `אבן ${i + 1} / ${list.length}`); } return; }
        const z = inZ(Z.altar, a.x, a.y) ? true : inZ(Z.out, a.x, a.y) ? false : null;
        const fromStone = !!Bx && a.x0 >= Bx.l - 24 && a.x0 <= Bx.r + 24 && a.y0 >= Bx.t - 24 && a.y0 <= Bx.b + 24;   /* (the stone itself carried to its heap — a swipe anywhere that ended on a heap decided: the naive kid's stray swipes at 844) */
        if (z != null && px >= F.DRAG42 && fromStone) { const r = kind === 'nail' ? N.decide(z, px) : J.decide(z, px); if (r === 'ok' || r === 'waste' || r === 'bad') decided(r, z); return; }
        const thr = Math.max(W() * 0.035, Math.min(W() * 0.12, 0.4 * (Bx ? Bx.w : W() * 0.4)));
        if (kind !== 'nail' && kind !== 'lamp' && kind !== 'tap' && Math.abs(dx) >= thr && Math.abs(dx) > Math.abs(dy) * 1.2 && dur <= 0.6 && rub < thr * 2.5) { const dir = dx > 0 ? -1 : 1; J.turn(dir); rotT += dir > 0 ? -Math.PI / 2 : Math.PI / 2; buzz42('tick'); o.sound && o.sound('stone'); }
      },
      frame(dt) {
        jt += dt;
        if (kind === 'lamp' && lamp) { lamp.position.set(B.x + Math.sin(theta) * 1.75, y0 + 1.95, B.z + Math.cos(theta) * 1.75); const k = F.rake56(theta, L); if (J && Math.abs(k - painted) > 0.03) { painted = k; paint55(sm, J, { rake: k, theta }); } }
        if (mallet && strike > 0) { strike = Math.max(0, strike - dt); mallet.rotation.z = -1.1 * Math.sin((strike / 0.3) * Math.PI); }
        rotY += (rotT - rotY) * Math.min(1, dt * 9); sm.rotation.y = rotY + tilt * 0.6; sm.rotation.x = tilt * 0.08;
        if (slowT > 0) { slowT -= dt; if (slowT <= 0 && (phase === 'feel' || kind === 'all')) line(lineFor(), sub57()); }
        // the iron's glint: bright only when the face, turned or tilted, meets the light from the left (≈ 20° toward it); faint at rest
        { const gl = sm.userData.glint; if (gl && gl.visible && J) { const off = (rotY + tilt * 0.6) + J.state().at.face * Math.PI / 2, ang = Math.atan2(Math.sin(off), Math.cos(off)), k = Math.max(0, 1 - Math.abs(ang - 0.34) / 0.16); gl.material.opacity = Math.min(1, k * 1.1 + (Math.abs(ang) < 0.08 ? 0.12 + 0.18 * Math.pow(Math.abs(Math.sin(now() * 2.3)), 12) : 0)); } }
        objPlace(!!J && endT < 0, [{ x: B.x, y: y0 + 1.6, z: B.z, r: 1.05 }], 'h55stone');
        svgClear();
        if (J && endT < 0 && !fly) {
          if (phase === 'feel') { const E = edge(); if (E) { svgAdd(`<line x1="${E.a.x}" y1="${E.a.y}" x2="${E.b.x}" y2="${E.b.y}" stroke="#FFE6A0" stroke-width="3" stroke-dasharray="10 7" opacity=".9"/>`); if (catchAt != null) { const x = E.a.x + (E.b.x - E.a.x) * catchAt, y = E.a.y + (E.b.y - E.a.y) * catchAt; svgAdd(`<circle cx="${x}" cy="${y}" r="${14 + 10 * Math.max(0, flash)}" fill="rgba(255,90,60,${0.25 + 0.4 * Math.max(0, flash)})" stroke="#FF7A5A" stroke-width="3"/><text x="${x}" y="${y + 40}" font-size="34" text-anchor="middle">✋</text>`); flash = Math.max(0, flash - dt); } else if ((now() - holdT > 3 || i > 0) && !st.finger) { const k = (now() * 0.35) % 1, x = E.a.x + (E.b.x - E.a.x) * (0.1 + 0.8 * k), y = E.a.y + (E.b.y - E.a.y) * (0.1 + 0.8 * k); svgAdd(`<text x="${x}" y="${y + 34}" font-size="30" text-anchor="middle" opacity=".85">👆</text>`); } } }
          else {
            const Z = zones(), s3 = J.state(), sw = J.shows(), hint = L <= 1 && kind !== 'nail' ? (sw === 'crack' || sw === 'glint' ? 'out' : !s3.bad && (s3.mud < 0 || s3.wiped >= 1) && s3.turns >= 3 ? 'altar' : null) : null, pu = 0.5 + 0.5 * Math.sin(now() * 6);   // (level 1's shadow — §1 rule 7: the right heap glows once the stone has shown itself)
            for (const [k2, z, t2, col] of [['altar', Z.altar, 'למזבח ➡', 'rgba(90,150,70,.42)'], ['out', Z.out, '⬅ לא למזבח', 'rgba(170,70,50,.42)']]) svgAdd(`<rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="14" fill="${col}" stroke="${hint === k2 ? '#FFE27A' : '#FFF4DC'}" stroke-width="${hint === k2 ? 4 + 3 * pu : 2}" stroke-dasharray="${hint === k2 ? 'none' : '8 6'}" data-z="${k2}"${hint === k2 ? ' data-hint="1"' : ''}/><text x="${z.x + z.w / 2}" y="${z.y + 26}" font-size="17" font-weight="900" text-anchor="middle" fill="#FFF" stroke="#2A1804" stroke-width="3" paint-order="stroke">${t2}</text>`);
            if (kind === 'lamp' && lamp) {   // the lamp's arc (dashed) and its handle (52 px), a hand on it till it is first moved
              let d = ''; for (let th2 = -1.45; th2 <= 1.451; th2 += 0.1) { const q = proj(B.x + Math.sin(th2) * 1.75, lamp.position.y, B.z + Math.cos(th2) * 1.75); if (q) d += `${d ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)} `; }
              const q = proj(lamp.position.x, lamp.position.y, lamp.position.z); if (d) svgAdd(`<path d="${d}" fill="none" stroke="#FFE6A0" stroke-width="2.5" stroke-dasharray="8 7" opacity=".8"/>`);
              if (q) svgAdd(`<circle cx="${q.x}" cy="${q.y}" r="26" fill="rgba(255,214,110,.22)" stroke="#FFD66E" stroke-width="3" data-lamp="1"/><text x="${q.x}" y="${q.y + 6}" font-size="18" text-anchor="middle" fill="#FFF4DC" stroke="#2A1804" stroke-width="3" paint-order="stroke">⟲</text>${!sides.l && !sides.r && !st.finger && jt > 1.5 ? `<text x="${q.x + 8}" y="${q.y + 44}" font-size="30" text-anchor="middle" opacity=".85">👆</text>` : ''}`);
            }
            if (kind === 'all') {   // ── build 57 ── the top edge's dashed line (a finger along it feels the edge), the catch on it or on the face
              const E = edge(); if (E) svgAdd(`<line x1="${E.a.x}" y1="${E.a.y}" x2="${E.b.x}" y2="${E.b.y}" stroke="#FFE6A0" stroke-width="2" stroke-dasharray="7 7" opacity=".55" data-edge="1"/>`);
              const wq2 = wit ? proj(wit.position.x, wit.position.y + 0.35, wit.position.z) : null; if (wq2) svgAdd(`<text x="${wq2.x}" y="${wq2.y - 34}" font-size="13" font-weight="900" text-anchor="middle" fill="#FFF4DC" stroke="#2A1804" stroke-width="3" paint-order="stroke" data-wit="1">אבן העדות</text>`);
              if (flash > 0) { const Bx = box(); let x = Bx ? Bx.cx : 0, y = Bx ? Bx.cy : 0; if (edgeAt != null && E) { x = E.a.x + (E.b.x - E.a.x) * edgeAt; y = E.a.y + (E.b.y - E.a.y) * edgeAt; } if (Bx) svgAdd(`<circle cx="${x}" cy="${y}" r="${16 + 12 * flash}" fill="rgba(255,90,60,${(0.2 + 0.3 * flash).toFixed(2)})" stroke="#FF7A5A" stroke-width="3"/><text x="${x}" y="${y + 40}" font-size="32" text-anchor="middle">✋</text>`); flash = Math.max(0, flash - dt); }
            }
            if (kind === 'tap' || kind === 'all') {   // the rings: long and wide for a whole stone, short and broken for a cracked one; the witness glows when it is to be struck first
              const wq = wit ? proj(wit.position.x, wit.position.y + 0.35, wit.position.z) : null; if (wq && kind === 'tap' && (!tapW || wGlow > 0)) { wGlow = Math.max(0, wGlow - dt); svgAdd(`<circle cx="${wq.x}" cy="${wq.y}" r="${30 + 6 * Math.sin(now() * 6)}" fill="none" stroke="#FFD66E" stroke-width="3" stroke-dasharray="6 5"/><text x="${wq.x}" y="${wq.y - 38}" font-size="14" font-weight="900" text-anchor="middle" fill="#FFF4DC" stroke="#2A1804" stroke-width="3" paint-order="stroke">אבן העדות</text>`); }
              waves = waves.filter((w) => { w.t += dt; let g = ''; for (let r = 0; r < w.R.rings; r++) { const p2 = (w.t - r * 0.12) / w.R.T; if (p2 <= 0 || p2 >= 1) continue; g += `<circle cx="${w.x}" cy="${w.y}" r="${10 + p2 * w.R.reach * H()}" fill="none" stroke="#FFF4DC" stroke-width="${w.R.broken ? 3 : 4.5}" opacity="${((1 - p2) * 0.9).toFixed(2)}"${w.R.broken ? ' stroke-dasharray="7 9"' : ''}/>`; } if (g) svgAdd(g); return w.t < w.R.T + w.R.rings * 0.12; });
            }
            const s2 = J.state(); if (kind !== 'lamp' && kind !== 'tap') for (let q = 0; q < 4; q++) { const Bx = box(); if (Bx) svgAdd(`<circle cx="${Bx.cx + (q - 1.5) * 16}" cy="${Math.max(54, Bx.t - 14)}" r="5" fill="${q === s2.face ? '#FFD66E' : 'rgba(255,255,255,.4)'}" stroke="#2A1804" stroke-width="1"/>`); }
            if (kind !== 'nail' && i === 0 && s2.turns === 0 && now() - holdT > 2.5 && !st.finger) { const Bx = box(); if (Bx) { const k = (now() * 0.7) % 1; svgAdd(`<text x="${Bx.cx + (k - 0.5) * Bx.w * 0.8}" y="${Bx.cy + 20}" font-size="32" text-anchor="middle" opacity=".85">👆</text>`); } }
          }
        }
        if (fly) {   // the stone to its heap, and a rough stone added there
          fly.t += dt; const hp = heaps[fly.to], k = Math.min(1, fly.t / 0.55); if (hp) { const tx = hp.position.x, tz = hp.position.z; sm.position.set(B.x + (tx - B.x) * k, y0 + 1.6 + Math.sin(k * Math.PI) * 0.8 - k * 1.1, B.z + (tz - B.z) * k); sm.scale.setScalar(1 - 0.55 * k); }
          if (k >= 1) { if (hp) { const G = geo53(), n2 = hp.children.length, m = new THREE.Mesh(G.rough, G.M.rock); m.scale.setScalar(0.42); m.position.set(Math.cos(n2 * 2.4) * 0.32, 0.25 + Math.floor(n2 / 4) * 0.28, Math.sin(n2 * 2.4) * 0.3); m.rotation.set(n2, n2 * 0.7, 0); hp.add(m); } fly = null; sm.visible = false; }
        }
        if (wait >= 0) { wait -= dt; if (wait < 0) { i++; if (i >= list.length) { svgClear(); grade(part, F.stoneGrade55(res), { x: W() / 2, y: H() * 0.35 }); endT = 1.3; J = null; } else { sm.visible = true; next(); } } }
        if (endT >= 0) { endT -= dt; if (endT <= 0) return true; }
        return false;
      },
      end() { svgClear(); if (st.ui.pad) st.ui.pad.classList.remove('full'); if (sm) sm.visible = false; for (const m of [lamp, wit, mallet, back]) if (m) m.visible = false; },
    };
    return job;
  }
  /** the first course of the yesod: three gaps in it, three untrimmed stones beside it, a heap of small fill stones; ¾ from above (§3 08 ה׳) */
  function mkField55(L) {
    const C = PL.course55, cy = gy(C.x, C.z), top = cy + 0.3, J = F.createField55(3, Math.random, L), s0 = J.state(), grp = st.props.course55;
    if (!grp) return null;
    const shapeGeo = (k, sc = 1, h = 0.5) => { const sh = new THREE.Shape(); F.SHAPES55[k].forEach(([x, z], i) => (i ? sh.lineTo(x * sc, -z * sc) : sh.moveTo(x * sc, -z * sc))); sh.closePath(); const g = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false }); g.rotateX(-Math.PI / 2); return g; };
    const ROCK55 = mat('#C9B892', 0.95), REC = new THREE.MeshBasicMaterial({ color: '#17110B' }), SH = new THREE.MeshBasicMaterial({ color: '#FFD66E', transparent: true, opacity: 0.38, depthWrite: false });
    const made = [];
    const gx = (g) => C.x + (g - 1) * 3.6;
    // the fixed stones round the gaps (rough blocks), the gaps' dark recesses, at level 1 the good fit's shadow in each
    for (const x of [-5.5, -1.8, 1.8, 5.5]) { const m = new THREE.Mesh(new THREE.BoxGeometry(1.5 + Math.abs(x) * 0.04, 0.5, 2.1), ROCK55); m.position.set(x, 0.55, (x % 2) * 0.05); m.rotation.y = x * 0.05; grp.add(m); made.push(m); }
    const recess = s0.gaps.map((G, g) => { const m = new THREE.Mesh(new THREE.ShapeGeometry((() => { const sh = new THREE.Shape(); F.SHAPES55[G.shape].forEach(([x, z], i) => (i ? sh.lineTo(x * 1.12, -z * 1.12) : sh.moveTo(x * 1.12, -z * 1.12))); sh.closePath(); return sh; })()), REC); m.rotation.set(-Math.PI / 2, 0, -G.rot * Math.PI / 2); m.position.set(gx(g) - C.x, 0.31, 0); grp.add(m); made.push(m); return m; });
    const shadow = s0.gaps.map((G, g) => { if (L > 1) return null; const m = new THREE.Mesh(shapeGeo(G.shape, 1, 0.04), SH); m.rotation.y = -G.rot * Math.PI / 2; m.position.set(gx(g) - C.x, 0.34, 0); grp.add(m); made.push(m); return m; });
    // the loose stones north of the course (toward the camera), each lying unturned; the fill heap at the east end
    const home = s0.stones.map((_, i) => ({ x: C.x + (1 - i) * 3.4 + 0.4, z: C.z - 3.4 }));
    const stones = s0.stones.map((S2, i) => { const m = new THREE.Mesh(shapeGeo(S2.shape, 1, 0.5), ROCK55.clone()); m.material.color.offsetHSL(0, 0, (i - 1) * 0.04); add55(m, home[i].x, top, home[i].z); return m; });
    const fillHome = { x: C.x - 7.4, z: C.z - 2.4 }, fh = new THREE.Group(); for (let k = 0; k < 9; k++) { const p2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.26, 0), ROCK55); p2.position.set(Math.cos(k * 2.4) * 0.45, 0.2 + (k > 5 ? 0.25 : 0), Math.sin(k * 2.4) * 0.45); fh.add(p2); } add55(fh, fillHome.x, cy, fillHome.z);
    function add55(m, x, y, z) { m.position.set(x, y, z); if (st.props.root) st.props.root.add(m); made.push(m); return m; }
    st.props.field55 = made;
    let drag = null, endT = -1, msgT = 0, lastLine = '';
    const say = (t) => { lastLine = t; msgT = 2.6; line(t, `רמה ${L}`); };
    line(LINE42.field55, `רמה ${L}`);
    if (st.ui.pad) st.ui.pad.classList.add('full');
    const pickR = () => Math.max(46, W() * 0.075);
    const job = {
      acting: true, fullPad: true, kind: 'field55', J, stones: () => stones.map((m, i) => ({ i, p: proj(m.position.x, m.position.y + 0.25, m.position.z), placed: s0.stones[i].gap >= 0 })), gaps: () => s0.gaps.map((G, g) => ({ g, p: proj(gx(g), top, C.z), open: G.stone < 0, sliver: G.sliver })), fillAt: () => proj(fillHome.x, cy + 0.4, fillHome.z),
      ownView: () => true,
      view() { const c = camera(), tv = Math.tan((((c && c.fov) || 50) * Math.PI) / 360), t2 = tv * (W() / H()), d = 12.4 / (2 * VIEW55.course * t2); return { p: [C.x, cy + d * 0.72, C.z - 1.6 - d * 0.7], t: [C.x, cy, C.z - 1.6] }; },
      down(a) {
        const R2 = pickR(); let best = null;
        stones.forEach((m, i) => { if (s0.stones[i].gap >= 0) return; const q = proj(m.position.x, m.position.y + 0.25, m.position.z); if (!q) return; const d = Math.hypot(q.x - a.x, q.y - a.y); if (d < R2 && (!best || d < best.d)) best = { i, d }; });
        if (best) { drag = { kind: 'stone', i: best.i }; return; }
        const fq = proj(fillHome.x, cy + 0.4, fillHome.z); if (fq && Math.hypot(fq.x - a.x, fq.y - a.y) < R2 * 1.2) { const p2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 0), ROCK55); add55(p2, fillHome.x, top + 0.4, fillHome.z); drag = { kind: 'fill', m: p2 }; }
      },
      move(a) {
        if (!drag || a.moved < F.DRAG42 * 0.5) return; const gp = ground55(a.x, a.y, top); if (!gp) return;
        const m = drag.kind === 'stone' ? stones[drag.i] : drag.m; m.position.set(gp.x, top + 0.35, gp.z);
      },
      up(a) {
        const d0 = drag; drag = null; if (!d0) return;
        if (d0.kind === 'stone') {
          const m = stones[d0.i];
          if (a.moved < F.DRAG42) { if (J.rotate(d0.i) === 'turn') { m.rotation.y -= Math.PI / 2; buzz42('tick'); o.sound && o.sound('stone'); } return; }
          let best = null; s0.gaps.forEach((G, g) => { const d = Math.hypot(m.position.x - gx(g), m.position.z - C.z); if (!best || d < best.d) best = { g, d }; });
          const back = () => { m.position.set(home[d0.i].x, top, home[d0.i].z); };
          if (!best || best.d > 2.2) { back(); return; }
          const S2 = s0.stones[d0.i], G = s0.gaps[best.g], r = J.drop(d0.i, best.g, best.d); try55('field', r === 'tight' || r === 'gap');
          if (r === 'tight' || r === 'gap') { m.rotation.y = -S2.rot * Math.PI / 2; m.position.y = top - 0.3; buzz42('settle'); o.sound && o.sound('stone'); if (shadow[best.g]) shadow[best.g].visible = false; if (r === 'tight') recess[best.g].visible = false; else say(LINE42.fieldGap55); o.emit && o.emit('h55field', { r }); }
          else { back(); buzz42('retry'); say(S2.shape === G.shape ? LINE42.fieldTurn55 : LINE42.fieldOther55); }
          return;
        }
        const p2 = d0.m; let best = null; s0.gaps.forEach((G, g) => { const d = Math.hypot(p2.position.x - gx(g), p2.position.z - C.z); if (!best || d < best.d) best = { g, d }; });
        if (!best || best.d > 1.9) { if (p2.parent) p2.parent.remove(p2); return; }
        const r = J.fill(best.g);
        if (r === 'filled') { p2.position.y = top - 0.05; recess[best.g].visible = false; buzz42('tick'); o.sound && o.sound('stone'); }
        else if (r === 'extra') { p2.position.y = top + 0.15; say(LINE42.fieldExtra55); }
        else if (p2.parent) p2.parent.remove(p2);
      },
      frame(dt) {
        objPlace(endT < 0, [{ x: C.x, y: top, z: C.z, r: 2.6 }], 'h55field', [{ x: C.x - 6.2, y: top, z: C.z - 1.2, r: 0.6 }, { x: C.x + 6.2, y: top + 0.5, z: C.z + 1.2, r: 0.6 }, ...home.map((p2) => ({ x: p2.x, y: top, z: p2.z, r: 0.9 }))]);
        if (msgT > 0) { msgT -= dt; if (msgT <= 0) line(LINE42.field55, `רמה ${L}`); }
        svgClear();
        if (endT < 0) for (const [g, G] of s0.gaps.entries()) { if (G.stone >= 0 && !G.sliver) continue; const q = proj(gx(g), top, C.z); if (q && G.sliver) svgAdd(`<circle cx="${q.x}" cy="${q.y}" r="${Math.max(26, W() * 0.04)}" fill="none" stroke="#FFD66E" stroke-width="3" stroke-dasharray="7 5"/>`); }
        if (endT < 0 && !st.finger && s0.misses === 0 && !s0.stones.some((x) => x.gap >= 0)) { const q0 = proj(stones[0].position.x, top + 0.3, stones[0].position.z), q1 = proj(gx(s0.gaps.findIndex((G) => G.shape === s0.stones[0].shape)), top, C.z); if (q0 && q1) { const k = (now() * 0.45) % 1; svgAdd(`<text x="${q0.x + (q1.x - q0.x) * k}" y="${q0.y + (q1.y - q0.y) * k + 30}" font-size="30" text-anchor="middle" opacity=".85">👆</text>`); } }
        if (endT < 0 && s0.done) { grade('field', s0.q, proj(C.x, top + 1, C.z)); endT = 1.4; }
        if (endT >= 0) { endT -= dt; if (endT <= 0) return true; }
        return false;
      },
      end() { svgClear(); if (st.ui.pad) st.ui.pad.classList.remove('full'); for (const m of made) { if (m.parent && !stones.includes(m)) { /* the course stays laid */ } } },
    };
    void lastLine; return job;
  }
  /** the last row of the yesod, alone: from above the altar — the north and the west, and one amah into the south and the east (מדות ג, א) */
  function mkLast55(L) {
    const X0 = ALT55.x0, Z0 = ALT55.z0, S0 = ALT55.side, ay = gy(X0 + 16, Z0 + 16), top = ay + 1.0, J = F.createLast55(L), made = [];
    const STN = mat('#8C7856', 0.92), SHD = new THREE.MeshBasicMaterial({ color: '#FFC24A', transparent: true, opacity: 0.6, depthWrite: false });   /* (dark field stone on the light court; the shadow strong: from above the pale ones were not seen) */
    const add55 = (m, x, y, z) => { m.position.set(x, y, z); if (st.props.root) st.props.root.add(m); made.push(m); return m; };
    const block = (sl) => add55(new THREE.Mesh(new THREE.BoxGeometry(sl.w * 0.98, 1, sl.d * 0.98), STN), X0 + sl.x, ay + 0.5, Z0 + sl.z);
    for (const sl of F.LAST55.slots) if (sl.pre) block(sl);
    const shadows = {}; if (L <= 1) for (const sl of F.LAST55.slots) if (!sl.pre) shadows[sl.id] = add55(new THREE.Mesh(new THREE.BoxGeometry(sl.w, 0.12, sl.d), SHD), X0 + sl.x, ay + 0.08, Z0 + sl.z);
    const heap = { x: X0 + S0 + 7, z: Z0 + 10 }, hg = heap53(10, 3); add55(hg, heap.x, gy(heap.x, heap.z), heap.z);
    if (st.props.plan55) st.props.plan55.forEach((m) => { m.visible = false; });   // (the whole square's gold line hid the ר: only the yesod's own shadow now)
    if (st.props.course55) st.props.course55.visible = false; (st.props.field55 || []).forEach((m) => { m.visible = false; });   // (the first course under the last row: from above it lay over the north's stretches)
    let drag = null, endT = -1, msgT = 0, rise = -1;
    line(LINE42.last55, `רמה ${L}`);
    if (st.ui.pad) st.ui.pad.classList.add('full');
    const job = {
      acting: true, fullPad: true, kind: 'last55', J, heapAt: () => proj(heap.x, gy(heap.x, heap.z) + 0.8, heap.z), slotAt: (id) => { const sl = F.LAST55.slots.find((q) => q.id === id); return sl ? proj(X0 + sl.x, top, Z0 + sl.z) : null; }, rimAt: (lx, lz) => proj(X0 + lx, top, Z0 + lz),
      ownView: () => true,
      view() { const c = camera(), tv = Math.tan((((c && c.fov) || 50) * Math.PI) / 360), Hc = 21 / tv, cx = X0 + S0 / 2 + 4, cz = Z0 + S0 / 2; if (rise >= 0) { const k = Math.min(1, rise / 3); return { p: [cx, ay + Hc * (1 + 0.5 * k), cz + Hc * (0.22 + 0.25 * k)], t: [cx, ay, cz] }; } return { p: [cx, ay + Hc, cz + Hc * 0.22], t: [cx, ay, cz] }; },
      down(a) { const q = proj(heap.x, gy(heap.x, heap.z) + 0.8, heap.z); if (endT >= 0 || rise >= 0 || !q || Math.hypot(q.x - a.x, q.y - a.y) > Math.max(70, W() * 0.1)) return; const m = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1, 1), STN); add55(m, heap.x, top, heap.z); drag = { m }; },
      move(a) { if (!drag) return; const gp = ground55(a.x, a.y, top); if (gp) drag.m.position.set(gp.x, top + 0.4, gp.z); },
      up() {
        const d0 = drag; drag = null; if (!d0) return; const m = d0.m, r = J.drop(m.position.x - X0, m.position.z - Z0); if (r.r === 'set' || r.r === 'noyesod') try55('last', r.r === 'set');
        if (r.r === 'set') { const sl = r.slot; if (m.parent) m.parent.remove(m); block(sl); if (shadows[sl.id]) shadows[sl.id].visible = false; buzz42('settle'); o.sound && o.sound('stone'); o.emit && o.emit('h55last', { slot: sl.id }); }
        else { if (m.parent) m.parent.remove(m); if (r.r === 'noyesod') { msgT = 2.8; line(LINE42.noYesod55, `רמה ${L}`); buzz42('retry'); } }
      },
      frame(dt) {
        objPlace(endT < 0 && rise < 0, [{ x: X0 + S0 / 2, y: ay, z: Z0 + S0 / 2, r: 6 }], 'h55last', [{ x: X0, y: ay, z: Z0, r: 1 }, { x: X0 + S0, y: ay + 1, z: Z0 + S0, r: 1 }]);
        if (msgT > 0) { msgT -= dt; if (msgT <= 0) line(LINE42.last55, `רמה ${L}`); }
        svgClear();
        if (rise < 0 && endT < 0 && !st.finger && J.open().length === F.LAST55.slots.filter((q) => !q.pre).length) { const q0 = proj(heap.x, gy(heap.x, heap.z) + 0.8, heap.z), sl = J.open()[0], q1 = proj(X0 + sl.x, top, Z0 + sl.z); if (q0 && q1) { const k = (now() * 0.4) % 1; svgAdd(`<text x="${q0.x + (q1.x - q0.x) * k}" y="${q0.y + (q1.y - q0.y) * k + 30}" font-size="30" text-anchor="middle" opacity=".85">👆</text>`); } }
        if (rise < 0 && J.state().done) { rise = 0; line(LINE42.yesodDone55, ''); const L5 = st.life53; if (L5) L5.still = true; }
        if (rise >= 0 && endT < 0) { rise += dt; if (rise > 3.2) { grade('last', J.state().q, proj(X0 + S0 / 2, top, Z0 + S0 / 2)); endT = 1.6; } }
        if (endT >= 0) { endT -= dt; if (endT <= 0) return true; }
        return false;
      },
      end() { svgClear(); if (st.ui.pad) st.ui.pad.classList.remove('full'); if (st.life53) st.life53.still = false; if (st.props.plan55) st.props.plan55.forEach((m) => { m.visible = true; }); },
    };
    return job;
  }
  /** the §1 check's tally (the naive kid's "first success within three tries"): each act's attempts and the attempt of its first success */
  const try55 = (part, ok) => { const T = R.t55 || (R.t55 = {}), r = T[part] || (T[part] = { tries: 0, first: 0 }); r.tries++; if (ok && !r.first) r.first = r.tries; save42(S); };
  /* ── build 56 ── STAGE 09, הסובב וחוט הסיקרא (docs/specs/shlav-alef-08-16-he.md §3 "09"): the lamp, the mallet and the witness stone at
   * the bench; the sovev's top course on the altar's north face — each stone true to the plumb line (מדות ג, א: "עלה חמש וכנס אמה"); the
   * red line at the altar's middle by the reed, the level and the snap ("להבדיל בין דמים העליונים לדמים התחתונים") ── /build 56 ── */
  const NF56 = { z: -18.5, x0: -53, x1: -23, y0: 16, top: 22 };   // the sovev's north face (temple.js: the body 30 × 30 from the floor to the sovev)
  const SLOTS56 = Object.freeze([-24.5, -27.5, -30.5, -33.5]);   // his stones of the course above the yesod, from the north-east corner west
  const CY56 = 21.5, PAL56 = { x: -33, z: -23.5 };   // (his course: the five's top, under the sovev's ledge; the pallet before the face, low in the frame's right)
  /** the altar's face as courses of stone: a tile of two courses (3 amot by 1, the upper half a stone along), repeated to the box's face */
  let tile56 = null;
  function masonry56(w, h, col) {
    try {
      if (!tile56 && doc) { const cv = doc.createElement('canvas'); cv.width = 192; cv.height = 128; const c = cv.getContext('2d'); c.fillStyle = '#E6DCC4'; c.fillRect(0, 0, 192, 128); for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(${120 + (i % 7) * 10},${105 + (i % 5) * 9},${80 + (i % 3) * 8},.18)`; c.fillRect((i * 73) % 192, (i * 37) % 128, 2 + (i % 3), 2); } c.strokeStyle = '#A8967A'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 1); c.lineTo(192, 1); c.moveTo(0, 64); c.lineTo(192, 64); c.moveTo(1, 0); c.lineTo(1, 64); c.moveTo(96, 64); c.lineTo(96, 128); c.stroke(); tile56 = new THREE.CanvasTexture(cv); tile56.colorSpace = THREE.SRGBColorSpace; tile56.wrapS = tile56.wrapT = THREE.RepeatWrapping; }
      if (!tile56) return mat(col || '#E8E0CC', 0.9);
      const t = tile56.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, w / 3), Math.max(0.5, h / 2));
      return new THREE.MeshStandardMaterial({ color: col || '#FFFFFF', map: t, roughness: 0.9, metalness: 0 });
    } catch (e) { return mat(col || '#E8E0CC', 0.9); }
  }
  function props56(add) {
    const B = PL.bench55, y0 = gy(B.x, B.z), wood = mat('#8A5A32', 0.8);
    // the lamp: a clay lamp, its flame; the dark cloth behind the stone (the raking light's macro)
    const lg = new THREE.Group(); { const body = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), mat('#9C6B43', 0.85)); body.scale.set(1.3, 0.55, 1); lg.add(body); const fl = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), new THREE.MeshBasicMaterial({ color: '#FFD66E' })); fl.scale.set(0.8, 1.6, 0.8); fl.position.set(0.18, 0.14, 0); lg.add(fl); const halo = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), new THREE.MeshBasicMaterial({ color: '#FFB84A', transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })); halo.position.copy(fl.position); lg.add(halo); }
    add(lg, B.x, y0 + 1.95, B.z + 1.75); lg.visible = false; st.props.lamp56 = lg;
    const bk = new THREE.Mesh(new THREE.PlaneGeometry(9, 5), new THREE.MeshBasicMaterial({ color: '#120D0A' })); add(bk, B.x, y0 + 2.2, B.z - 1.5); bk.visible = false; st.props.back56 = bk;
    // the witness stone on its stand behind-left, and the wooden mallet
    const wg = new THREE.Group(); { const ped = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.9, 0.8), mat('#9E8A68', 0.9)); ped.position.y = -0.95; wg.add(ped); const ws = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.65, 0.8), mat('#E2D6BA', 0.85)); ws.position.y = 0.33; wg.add(ws); }
    add(wg, B.x - 1.45, y0 + 1.9, B.z - 1.1); wg.visible = false; st.props.witness56 = wg;
    const ml = new THREE.Group(); { const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.42, 10), wood); hd.rotation.x = Math.PI / 2; ml.add(hd); const hn = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.9, 6), wood); hn.position.set(0.45, -0.1, 0); hn.rotation.z = Math.PI / 2 + 0.25; ml.add(hn); }
    add(ml, B.x + 1.0, y0 + 2.3, B.z + 0.9); ml.visible = false; st.props.mallet56 = ml;
    if (STG !== 'sovev') return;
    // the altar as he finds it: the yesod's ר is the world's (done); over it the body, four amot up from the court's floor and a fifth laid by the crews
    // but for his four stones at the north-east — their face one amah in from the yesod's edge ("עלה חמש וכנס אמה")
    const box = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), masonry56(Math.max(w, d), h)); add(m, x, y, z); return m; }, P2 = masonry56(3, 1, '#F6F1E4');
    st.props.lo56 = box(30, 5, 30, -38, 18.5, -3.5);
    st.props.crw56 = box(18, 1, 30, -44, 21.5, -3.5);   // (the crews' part of his course: the west)
    st.props.in56 = box(12, 1, 29, -29, 21.5, -3);   // (his course's inner part — his stones are its face)
    // the course's stones waiting on a pallet before the corner, low in the course's frame
    const pal = new THREE.Group(); { const pw = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.25, 2.4), wood); pw.position.y = 0.12; pal.add(pw); for (let k = 0; k < 4; k++) { const m = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.95, 0.95), P2); m.position.set(0, 0.73 + Math.floor(k / 2) * 0.96, (k % 2) * 1.0 - 0.5); pal.add(m); } }
    add(pal, PAL56.x, gy(PAL56.x, PAL56.z), PAL56.z); st.props.pal56 = pal;
    st.props.red56 = null;
  }
  /** a screen ray to the plane z = Z → { x, y } */
  function planeZ56(px, py, Z) {
    const c = camera(); if (!c) return null; const nd = new THREE.Vector2((px / W()) * 2 - 1, -(py / H()) * 2 + 1), rc = new THREE.Raycaster(); rc.setFromCamera(nd, c);
    const o3 = rc.ray.origin, d3 = rc.ray.direction; if (Math.abs(d3.z) < 1e-4) return null; const t = (Z - o3.z) / d3.z; if (t < 0) return null; return { x: o3.x + d3.x * t, y: o3.y + d3.y * t };
  }
  /** פ׳ the sovev: four stones of the course above the yesod, each from the pallet to its place; the plumb line drops beside it — a stone that juts
   *  past it: a small drag ⬅ in (level 1: the true face's gold line, and a push the right way seats it); from level 2 one may sink — ➡ out */
  const BAG56 = [null, [0.6, 0.5, 0.65, 0.55], [0.45, -0.35, 0.4, 0.5], [0.4, -0.3, 0.35, -0.4], [0.3, -0.25, 0.35, -0.3]];
  function mkCourse56(L) {
    const J = F.createCourse56(SLOTS56.length, L), s0 = J.state(), P2 = masonry56(3, 2, '#FFFDF6'), made = [], ghost = new THREE.MeshBasicMaterial({ color: '#FFD66E', transparent: true, opacity: 0.35, depthWrite: false });
    const bag = mix55(BAG56[Math.max(1, Math.min(4, L | 0))]);   // (level 1: all out; the bag shuffled)
    const add56 = (m, x, y, z) => { m.position.set(x, y, z); if (st.props.root) st.props.root.add(m); made.push(m); return m; };
    const zTrue = NF56.z + 0.5, ZD = NF56.z - 1.4;   // the stone's middle when its face is on the line; the plane it is carried on (before the yesod's edge)
    let drag = null, nud = null, endT = -1, msgT = 0, cur = null, shadow = null, drop = 1;
    const slot = () => SLOTS56[s0.stones.length - (s0.cur >= 0 ? 1 : 0)];
    const plumb = new THREE.Group(); { const ln = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1, 4), new THREE.MeshBasicMaterial({ color: '#2A1E14' })); ln.position.y = -0.5; plumb.add(ln); plumb.userData.ln = ln; const bob = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.36, 8), mat('#6A5A4A', 0.6)); bob.rotation.x = Math.PI; plumb.add(bob); plumb.userData.bob = bob; }
    add56(plumb, SLOTS56[0], CY56 + 0.5, NF56.z - 0.03); plumb.visible = false;   // (held at the stone's top front edge; it hangs down the face to the yesod)
    const hang = (k) => { const len = Math.max(0.05, (CY56 + 0.5 - 17.35) * k); plumb.userData.ln.scale.y = len; plumb.userData.ln.position.y = -len / 2; plumb.userData.bob.position.y = -len - 0.18; };
    hang(1);
    const trueLine = add56(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), new THREE.MeshBasicMaterial({ color: '#FFD66E' })), 0, CY56 + 0.52, NF56.z - 0.03); trueLine.visible = false; trueLine.scale.set(2.95 / 0.06, 1, 1);
    const showShadow = () => { if (shadow) shadow.visible = false; const x = slot(); if (x == null || s0.done) return; if (L <= 1) { shadow = shadow || add56(new THREE.Mesh(new THREE.BoxGeometry(2.95, 1, 1), ghost), x, CY56, zTrue); shadow.position.set(x, CY56, zTrue); shadow.visible = true; } };
    showShadow();
    line(LINE42.course56, `רמה ${L}`); if (st.ui.pad) st.ui.pad.classList.add('full');
    const inward = (x, y, z) => { const a = proj(x, y, z), b = proj(x, y, z + 1); return a && b ? { x: b.x - a.x, y: b.y - a.y } : null; };   // the screen's way in (one amah)
    const GEAR = () => Math.max(90, W() * 0.18);   // a drag of this many px moves the stone one amah (the low view foreshortens the face's depth: one amah ≈ 16 px)
    const job = {
      acting: true, fullPad: true, kind: 'course56', J, ownView: () => true, gear: GEAR,
      palAt: () => { const p = st.props.pal56; return p ? proj(p.position.x, p.position.y + 1.9, p.position.z) : null; }, slotAt: () => { const x = slot(); return x == null ? null : proj(x, CY56, zTrue); }, curAt: () => (cur ? proj(cur.position.x, cur.position.y + 0.2, cur.position.z) : null),
      inward: () => (cur ? inward(cur.position.x, cur.position.y, cur.position.z) : null), err: () => (s0.cur >= 0 ? s0.stones[s0.cur].e : 0),
      view() { return { p: [-17, 19.6, -26.5], t: [-27.5, 19.6, -18.5] }; },   // (low, from the north-east, looking a little up: the altar's north and east faces ~70 % of the width; the yesod's step at its foot)
      down(a) {
        if (endT >= 0) return;
        if (s0.cur >= 0 && cur) { const q = job.curAt(); if (q && Math.hypot(q.x - a.x, q.y - a.y) < Math.max(80, W() * 0.13)) { nud = { e0: s0.stones[s0.cur].e, x0: a.x, y0: a.y }; return; } }
        const pq = job.palAt();
        if (s0.cur < 0 && pq && Math.hypot(pq.x - a.x, pq.y - a.y) < Math.max(70, W() * 0.11)) { const g = planeZ56(a.x, a.y, ZD); const m = add56(new THREE.Mesh(new THREE.BoxGeometry(2.95, 1, 1), P2), g ? g.x : PAL56.x, g ? Math.max(CY56 + 0.6, g.y) : 19, ZD); drag = { m }; buzz42('tick'); }
      },
      move(a) {
        if (drag) { const g = planeZ56(a.x, a.y, ZD); if (g) drag.m.position.set(g.x, Math.max(CY56 + 0.6, g.y), ZD); return; }
        if (nud && cur) { const v = inward(cur.position.x, cur.position.y, cur.position.z); if (!v) return; const vl = Math.hypot(v.x, v.y) || 1, d = ((a.x - nud.x0) * v.x + (a.y - nud.y0) * v.y) / vl / GEAR(); cur.position.z = zTrue - Math.max(-0.8, Math.min(0.8, nud.e0 - d)); }
      },
      up(a) {
        if (drag) {
          const m = drag.m; drag = null; const x = slot(), q = x == null ? null : proj(x, CY56, zTrue), dq = proj(m.position.x, m.position.y, ZD);
          if (!q || !dq || Math.hypot(q.x - dq.x, q.y - dq.y) > Math.max(90, W() * 0.16)) { if (m.parent) m.parent.remove(m); line(LINE42.course56, `רמה ${L}`); return; }
          const e0 = bag.length ? bag.shift() : 0.4; m.position.set(x, CY56, zTrue - e0); cur = m; plumb.position.set(x, CY56 + 0.5, NF56.z - e0 - 0.03); plumb.visible = true; drop = 0; trueLine.position.x = x; trueLine.visible = L <= 1;
          const r = J.lay(e0); buzz42('settle'); o.sound && o.sound('stone'); after(r); return;
        }
        if (nud && cur) {
          const n0 = nud; nud = null; const v = inward(cur.position.x, cur.position.y, cur.position.z); if (!v) return; const vl = Math.hypot(v.x, v.y) || 1;
          let d = ((a.x - n0.x0) * v.x + (a.y - n0.y0) * v.y) / vl / GEAR(); if (Math.abs(d) < 0.03) { cur.position.z = zTrue - n0.e0; return; }
          if (L <= 1 && Math.sign(d) === Math.sign(n0.e0) && Math.abs(d) >= Math.abs(n0.e0) * 0.4) d = n0.e0;   // (level 1: a push the right way seats it at the line — rule 7)
          const r = J.nudge(d); const s = s0.stones[s0.stones.length - 1]; cur.position.z = zTrue - s.e; try55('sovev', r === 'true'); buzz42(r === 'true' ? 'settle' : 'tick'); o.sound && o.sound('stone'); after(r);
        }
      },
      frame(dt) {
        objPlace(endT < 0, [{ x: SLOTS56[0], y: CY56, z: NF56.z, r: 2.5 }], 'h56course', [{ x: -36, y: 16, z: NF56.z, r: 0.5 }, { x: -23, y: 22, z: NF56.z, r: 0.5 }, { x: -23, y: 16, z: -12, r: 0.5 }, { x: PAL56.x, y: 16.2, z: PAL56.z, r: 1 }]);
        if (cur && plumb.visible) plumb.position.z = cur.position.z - 0.53;   // (the line from the stone's face: off the wall below by its jut)
        if (drop < 1) { drop = Math.min(1, drop + dt * 2.2); hang(drop); }
        if (msgT > 0) { msgT -= dt; if (msgT <= 0 && s0.cur < 0 && !s0.done) line(LINE42.course56, `רמה ${L}`); }
        svgClear();
        // the plumb line's verdict at the stone in hand: the gap between the line and its face, drawn; the arrow the way to go
        if (cur && s0.cur >= 0 && endT < 0) {
          const s = s0.stones[s0.cur], ez = zTrue - cur.position.z, xe = plumb.position.x, a2 = proj(xe, 19, NF56.z), b2 = proj(xe, 19, NF56.z - ez), col = Math.abs(ez) <= J.tol ? '#7CD86A' : ez > 0 ? '#FF8A6A' : '#8AC6FF';
          if (a2 && b2) { const len = Math.hypot(b2.x - a2.x, b2.y - a2.y), ux = len > 1 ? (b2.x - a2.x) / len : -1, uy = len > 1 ? (b2.y - a2.y) / len : 0; svgAdd(`<line x1="${a2.x}" y1="${a2.y}" x2="${b2.x + ux * 3}" y2="${b2.y + uy * 3}" stroke="${col}" stroke-width="6" stroke-linecap="round"/>`); }
          const q = job.curAt(), v = job.inward(); if (q && v && Math.abs(ez) > J.tol && !nud) { const vl = Math.hypot(v.x, v.y) || 1, sg = s.e > 0 ? 1 : -1, ax = q.x + (v.x / vl) * 34 * sg, ay = q.y + (v.y / vl) * 34 * sg; svgAdd(`<text x="${ax}" y="${ay - 18}" font-size="30" font-weight="900" text-anchor="middle" fill="${col}" stroke="#2A1804" stroke-width="4" paint-order="stroke">${(v.x * sg) < 0 ? '⬅' : '➡'}</text>`); if (!st.finger) { const k = (now() * 0.6) % 1; svgAdd(`<text x="${q.x + (v.x / vl) * 60 * sg * k}" y="${q.y + (v.y / vl) * 60 * sg * k + 28}" font-size="28" text-anchor="middle" opacity=".85">👆</text>`); } }
        }
        if (!st.finger && endT < 0 && s0.cur < 0 && !drag && !s0.done) { const p0 = job.palAt(), p1 = job.slotAt(); if (p0 && p1) { const k = (now() * 0.4) % 1; svgAdd(`<text x="${p0.x + (p1.x - p0.x) * k}" y="${p0.y + (p1.y - p0.y) * k + 30}" font-size="30" text-anchor="middle" opacity=".85">👆</text>`); } }
        if (endT < 0 && s0.done) { grade('sovev', s0.q, proj(-26.5, 19.5, NF56.z));   /* (mid-face: over the course the grade stood on the line's chip) */ endT = 1.4; trueLine.visible = false; plumb.visible = false; if (shadow) shadow.visible = false; if (st.props.pal56) st.props.pal56.visible = false; }
        if (endT >= 0) { endT -= dt; if (endT <= 0) return true; }
        return false;
      },
      end() { svgClear(); if (st.ui.pad) st.ui.pad.classList.remove('full'); plumb.visible = false; trueLine.visible = false; if (shadow) shadow.visible = false; },
    };
    function after(r) {
      if (r === 'true') { msgT = 1.6; line(LINE42.courseTrue56, `אבן ${s0.stones.length} / ${s0.n}`); if (cur) cur.position.z = zTrue; cur = null; trueLine.visible = false; plumb.visible = false; showShadow(); return; }
      msgT = 0; line(r === 'out' ? LINE42.courseOut56 : LINE42.courseIn56, `רמה ${L}`);
    }
    return job;
  }
  /** ט׳–ס׳ חוט הסיקרא: the left peg to the middle by the reed ⬍, the right to the same height by the level on the thread ⬍, then stretch ↔ and let go */
  function mkThread56(L) {
    const J = F.createThread56(L), k = J.state(), FZ = NF56.z - 0.08, XL = NF56.x1 - 0.6, XR = NF56.x0 + 0.6, made = [];   // (the left peg on the screen: the face's east end — the camera looks south)
    const add56 = (m, x, y, z) => { m.position.set(x, y, z); if (st.props.root) st.props.root.add(m); made.push(m); return m; };
    const pegM = mat('#6B4A2C', 0.8), pegs = [XL, XR].map((x) => add56(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 8), pegM), x, NF56.y0 + 3, FZ - 0.2));
    pegs.forEach((m) => { m.rotation.x = Math.PI / 2; });
    const reed = add56(new THREE.Mesh(new THREE.BoxGeometry(0.12, 10, 0.12), mat('#C9A86A', 0.8)), XL + 0.5, NF56.y0 + 5, FZ - 0.3);
    let drag = null, pull = null, endT = -1, snapT = -1, wash = 0, red = null, msgT = 0, hint = '';
    const Y = (u) => NF56.y0 + u, CAP = L <= 1 ? 1.25 : 0.5;   // (the reed's notches: the peg let go settles on the nearest amah; level 1 — the middle's gold band catches it from 1¼ amot; level 1's shadow on the right too)
    if (st.props.pal56) st.props.pal56.visible = false;
    const lineFor = () => (k.step === 1 ? LINE42.thread1_56 : k.step === 2 ? LINE42.thread2_56 : LINE42.thread3_56);
    let fine = null, doneT = -1;
    line(lineFor(), `רמה ${L}`); if (st.ui.pad) st.ui.pad.classList.add('full');
    const P = () => ({ l: proj(XL, Y(k.yL), FZ - 0.2), r: proj(XR, Y(k.yR), FZ - 0.2) });
    const job = {
      acting: true, fullPad: true, kind: 'thread56', J, ownView: () => true, pegsAt: P, reedAt: (u) => proj(XL + 0.5, Y(u), FZ - 0.3),
      view() { const c = camera(), tv = Math.tan((((c && c.fov) || 50) * Math.PI) / 360), t2 = tv * (W() / H()), D = (NF56.x1 - NF56.x0) / (2 * 0.64 * t2); return { p: [(NF56.x0 + NF56.x1) / 2, Y(4.2), NF56.z - D], t: [(NF56.x0 + NF56.x1) / 2, Y(4.2), NF56.z] }; },   // (level; the face 64 % of the width)
      down(a) {
        if (endT >= 0 || snapT >= 0 || wash > 0) return; const p = P();
        if (k.step === 1 && p.l && Math.hypot(p.l.x - a.x, p.l.y - a.y) < Math.max(44, W() * 0.07)) { drag = 'l'; hint = ''; return; }
        if ((k.step === 2 || k.step === 3) && p.r && Math.hypot(p.r.x - a.x, p.r.y - a.y) < Math.max(44, W() * 0.07)) { const q = planeZ56(a.x, a.y, FZ); drag = 'r'; hint = ''; fine = { y: a.y, t: now(), v: k.yR, q0: q ? q.y : null }; return; }
        if (k.step === 3 && p.l && p.r) { const dx = p.r.x - p.l.x, dy = p.r.y - p.l.y, l2 = dx * dx + dy * dy || 1, u = Math.max(0, Math.min(1, ((a.x - p.l.x) * dx + (a.y - p.l.y) * dy) / l2)), qx = p.l.x + dx * u, qy = p.l.y + dy * u; if (Math.hypot(a.x - qx, a.y - qy) < Math.max(40, H() * 0.1)) pull = { u, x0: a.x, y0: a.y, x: a.x, y: a.y }; }
      },
      move(a) {
        if (drag === 'l') { const q = planeZ56(a.x, a.y, FZ); if (q) J.setL(q.y - NF56.y0); return; }
        if (drag === 'r' && fine) {   // the right peg: no reed — a slow finger moves it finely (a fifth), a quick one as it goes (the level reads half a tefach)
          const q = planeZ56(a.x, a.y, FZ), q1 = planeZ56(a.x, fine.y, FZ); const t = now(), dtm = Math.max(1 / 120, t - fine.t), sp = Math.abs(a.y - fine.y) / dtm, g = L <= 1 ? 1 : Math.max(0.2, Math.min(1, sp / 500));   /* (level 1: as it goes — its shadow catches it) */
          if (q && q1) { fine.v += (q.y - q1.y) * g; J.setR(fine.v); fine.v = k.yR; } fine.y = a.y; fine.t = t; return; }
        if (pull) { pull.x = a.x; pull.y = a.y; }
      },
      up(a) {
        if (drag) {
          const d = drag; drag = null; fine = null;
          if (d === 'l') { const n = Math.abs(k.yL - F.THREAD56.mid) <= CAP ? F.THREAD56.mid : Math.round(k.yL); J.setL(n); }   // (the notch it settles in)
          else if (L <= 1 && Math.abs(k.yR - k.yL) <= CAP) J.setR(k.yL);   // (level 1: the right's shadow catches it)
          const y0 = d === 'l' ? k.yL : k.yR, r = d === 'l' ? J.releaseL() : J.releaseR(L <= 1); buzz42(r === 'next' ? 'settle' : 'tick'); if (r === 'again') try55('thread', false);   /* (a try: a peg let go off the middle, or a snap) */
          if (r === 'next') { o.sound && o.sound('wood'); line(lineFor(), `רמה ${L}`); } else if (d === 'r') { hint = k.yL > k.yR ? 'הבועה ברחה — הרימו ⬆' : 'הבועה ברחה — הורידו ⬇'; msgT = 0; line(lineFor(), `רמה ${L}`); } else { const dd = F.THREAD56.mid - y0; hint = dd > 0 ? `עוד ${Math.round(dd)} ${Math.round(dd) === 1 ? 'אמה' : 'אמות'} ⬆` : `${Math.round(-dd)} ${Math.round(-dd) === 1 ? 'אמה' : 'אמות'} למטה ⬇`; msgT = 0; }
          return;
        }
        if (pull) { const p0 = pull; pull = null; if (Math.hypot(a.x - p0.x0, a.y - p0.y0) < 30) return; const yl = k.yL, yr = k.yR, r = J.snap(); try55('thread', r === 'mehudar' || r === 'kasher'); snapT = 0.6; buzz42(r === 'wash' ? 'retry' : 'settle'); o.sound && o.sound('twang'); stamp(yl, yr);
          if (r === 'wash') { wash = 2.2; msgT = 2.6; R.wash56 = (R.wash56 | 0) + 1; line(LINE42.threadWash56, `שטיפה ${k.washes} · בחינם`); } else done(); }
      },
      frame(dt) {
        objPlace(endT < 0, [{ x: (NF56.x0 + NF56.x1) / 2, y: Y(5), z: NF56.z, r: 3 }], 'h56thread', [{ x: NF56.x0, y: NF56.y0, z: NF56.z, r: 0.3 }, { x: NF56.x1, y: NF56.top, z: NF56.z, r: 0.3 }]);
        pegs[0].position.y = Y(k.yL); pegs[1].position.y = Y(k.yR);
        if (snapT >= 0) snapT -= dt; if (wash > 0) { wash = Math.max(0, wash - dt); if (red) { red.material.opacity = Math.min(1, wash / 1.4); if (wash <= 0) { if (red.parent) red.parent.remove(red); red = null; } } }
        if (msgT > 0) { msgT -= dt; if (msgT <= 0 && endT < 0) line(lineFor(), `רמה ${L}`); }
        if (doneT > 0) { doneT -= dt; if (doneT <= 0) { grade('thread', k.q, proj((XL + XR) / 2, Y(6.5), FZ)); endT = 1.5; } }
        svgClear(); if (endT >= 0) { if ((endT -= dt) <= 0) return true; return false; }
        const p = P(); if (!p.l || !p.r) return false;
        if (wash > 0 && red) { const a3 = proj(XL - 4, red.position.y, FZ), b3 = proj(XR + 4, red.position.y, FZ); if (a3 && b3) for (let i = 0; i < 9; i++) { const u = (i + 0.5) / 9, x = a3.x + (b3.x - a3.x) * u, y = a3.y + (b3.y - a3.y) * u, dl = (2.2 - wash) * 40 * (0.6 + 0.4 * ((i * 7) % 5) / 5); svgAdd(`<line x1="${x}" y1="${y}" x2="${x}" y2="${y + dl}" stroke="#8AC6FF" stroke-width="3" stroke-linecap="round" opacity=".8"/>`); } }   // (the water running down the face)
        if (hint && k.step <= 2) { const hp2 = k.step === 1 ? p.l : p.r, rx = k.step === 1 ? hp2.x + 34 : hp2.x - 34; svgAdd(`<text x="${rx}" y="${hp2.y - 30}" font-size="18" font-weight="800" direction="rtl" text-anchor="${k.step === 1 ? 'end' : 'start'}" fill="#FFD66E" stroke="#2A1804" stroke-width="3" paint-order="stroke">${hint}</text>`); }
        if (k.step === 1 && L <= 1) { const a4 = proj(XL + 0.5, Y(F.THREAD56.mid - CAP), FZ - 0.3), b4 = proj(XL + 0.5, Y(F.THREAD56.mid + CAP), FZ - 0.3); if (a4 && b4) svgAdd(`<rect x="${a4.x - 14}" y="${b4.y}" width="28" height="${Math.max(4, a4.y - b4.y)}" rx="5" fill="rgba(255,214,110,.28)"/>`); }   // (level 1: the middle's band on the reed)
        if (k.step === 2 && L <= 1) { const g4 = proj(XR, Y(k.yL), FZ - 0.2); if (g4) svgAdd(`<circle cx="${g4.x}" cy="${g4.y}" r="13" fill="none" stroke="#FFD66E" stroke-width="3" stroke-dasharray="5 4" opacity=".85"/>`); }   // (level 1: the right's shadow at the left's height)
        // the reed and its amah marks (step 1); the middle gold at level 1
        if (k.step === 1) { for (let u = 0; u <= 10; u++) { const q = proj(XL + 0.5, Y(u), FZ - 0.3); if (!q) continue; const mid = u === 5; svgAdd(`<line x1="${q.x - (mid ? 16 : 9)}" y1="${q.y}" x2="${q.x + (mid ? 16 : 9)}" y2="${q.y}" stroke="${mid && L <= 1 ? '#FFD66E' : '#FFF4DC'}" stroke-width="${mid && L <= 1 ? 4 : 2}"/>${u % 5 === 0 ? `<text x="${q.x - 22}" y="${q.y + 5}" font-size="13" font-weight="800" text-anchor="end" fill="#FFF4DC" stroke="#2A1804" stroke-width="3" paint-order="stroke">${u}</text>` : ''}`); } }
        // the thread: straight, or drawn out by the finger, or quivering after the snap
        const qv = snapT > 0 ? Math.sin(snapT * 60) * 10 * snapT : 0, mx = (p.l.x + p.r.x) / 2, my = (p.l.y + p.r.y) / 2;
        const cx = pull ? pull.x : mx, cy = pull ? pull.y : my + qv;
        svgAdd(`<path d="M${p.l.x} ${p.l.y} Q ${cx} ${cy} ${p.r.x} ${p.r.y}" fill="none" stroke="#C0392B" stroke-width="2.5"/>`);
        // the level on the thread (step 2): the bubble off by the tilt
        if (k.step >= 2) { const b2 = J.bubble(), ok2 = Math.abs(b2) < 0.15; svgAdd(`<rect x="${mx - 36}" y="${my - 30}" width="72" height="16" rx="8" fill="rgba(200,240,190,.85)" stroke="#2A1804" stroke-width="2"/><line x1="${mx - 8}" y1="${my - 30}" x2="${mx - 8}" y2="${my - 14}" stroke="#2A1804" stroke-width="1.5"/><line x1="${mx + 8}" y1="${my - 30}" x2="${mx + 8}" y2="${my - 14}" stroke="#2A1804" stroke-width="1.5"/><circle cx="${mx + b2 * 28}" cy="${my - 22}" r="6" fill="${ok2 ? '#7CD86A' : '#FFF8D6'}" stroke="#2A1804" stroke-width="1.5"/>`); }
        // the handles (≥ 44 px) on the peg to be moved
        const hp = k.step === 1 ? p.l : k.step === 2 ? p.r : null; if (hp) svgAdd(`<circle cx="${hp.x}" cy="${hp.y}" r="24" fill="rgba(255,214,110,.25)" stroke="#FFD66E" stroke-width="3" data-peg="${k.step === 1 ? 'l' : 'r'}"/><text x="${hp.x}" y="${hp.y + 7}" font-size="20" text-anchor="middle" fill="#FFF4DC" stroke="#2A1804" stroke-width="3" paint-order="stroke">⬍</text>`);
        if (hp && !st.finger && !drag) { const k2 = 0.5 + 0.5 * Math.sin(now() * 2.2); svgAdd(`<text x="${hp.x + 6}" y="${hp.y + 40 - 30 * k2}" font-size="28" text-anchor="middle" opacity=".8">👆</text>`); }
        if (k.step === 3 && !pull && !st.finger) { const k2 = 0.5 + 0.5 * Math.sin(now() * 2.6); svgAdd(`<text x="${mx}" y="${my + 34 + 16 * k2}" font-size="28" text-anchor="middle" opacity=".8">👆</text>`); }
        return false;
      },
      end() { svgClear(); if (st.ui.pad) st.ui.pad.classList.remove('full'); reed.visible = false; },
    };
    function stamp(u1, u2) {   // the red line on the face where the thread lay (a crooked one is washed off: the water runs down the face)
      const yl = Y(u1), yr = Y(u2), len = Math.hypot(XL - XR, yl - yr), m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.28, 0.05), new THREE.MeshBasicMaterial({ color: '#B0261E', transparent: true, opacity: 1 }));
      add56(m, (XL + XR) / 2, (yl + yr) / 2, FZ); m.rotation.z = Math.atan2(yl - yr, XL - XR); if (red && red.parent) red.parent.remove(red); red = m; st.props.red56 = m;
    }
    function done() { line(LINE42.threadDone56, ''); doneT = 0.9; }
    return job;
  }
  /* ── build 57 ── STAGE 10, גוף המזבח והכבש (docs/specs/shlav-alef-08-16-he.md §3 "10"): the bench's stone with every tool at hand (decoys
   * and two marks — mkStone55 'all'); the kevesh rising from the south, its rows on an even slope by a straightedge with a bubble (מדות ג, ג:
   * "שְׁלֹשִׁים וּשְׁתַּיִם עַל רֹחַב שֵׁשׁ עֶשְׂרֵה"); the whitewash with a cloth in the morning light (מדות ג, ד) ── /build 57 ── */
  const XM57 = (KEV57.x0 + KEV57.x1) / 2, PAL57 = { x: -27.5, z: 23 };   // (the kevesh's middle; his stones on a pallet on the floor east of it — low, right of the middle in the side view, under his rows)
  const zRow57 = (i) => KEV57.zFoot - F.KEVESH57.row * i - F.KEVESH57.row / 2;   // a row's middle along the kevesh (rows from the foot)
  function props57(add) {
    // the body above the sovev (the crews' — "גוף המזבח"), the kevesh's core of stones and earth, the crews' rows from the foot, his pallet
    const body = new THREE.Mesh(new THREE.BoxGeometry(28, 3, 28), masonry56(28, 3)); add(body, -38, 23.5, -3.5); st.props.body57 = body;
    const K = F.KEVESH57, al = Math.atan(K.S), topCore = KEV57.y1 - 0.5, zGround = KEV57.zTop + (topCore - KEV57.y0) / K.S;
    const sh = new THREE.Shape(); sh.moveTo(zGround, KEV57.y0); sh.lineTo(KEV57.zTop, KEV57.y0); sh.lineTo(KEV57.zTop, topCore); sh.closePath();
    const cg = new THREE.ExtrudeGeometry(sh, { depth: KEV57.x1 - KEV57.x0, bevelEnabled: false }); cg.rotateY(-Math.PI / 2);
    const core = new THREE.Mesh(cg, mat('#8E7E66', 0.95)); add(core, KEV57.x1, 0, 0); st.props.core57 = core;
    const PM = masonry56(16, 2, '#EFE7D4'), PM2 = masonry56(16, 2, '#E2D8C2'), rows = new THREE.Group(); add(rows, 0, 0, 0); st.props.rows57 = rows;
    for (let i = 0; i < K.rows - K.his; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(16, 0.45, 2.02), i % 2 ? PM2 : PM); m.rotation.x = al; m.position.set(XM57, 16 + K.S * (1 + K.row * i) - 0.225 / Math.cos(al), zRow57(i)); rows.add(m); }
    const pal = new THREE.Group(), wood = mat('#8A5A32', 0.8); { const pw = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.25, 2.6), wood); pw.position.y = 0.12; pal.add(pw); for (let q = 0; q < 4; q++) { const m = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.42, 2.0), q % 2 ? PM2 : PM); m.position.set(0, 0.46 + q * 0.44, 0); pal.add(m); } }
    add(pal, PAL57.x, gy(PAL57.x, PAL57.z), PAL57.z); st.props.pal57 = pal;
  }
  /** a screen ray to the plane x = X → { y, z } */
  function planeX57(px, py, X) {
    const c = camera(); if (!c) return null; const nd = new THREE.Vector2((px / W()) * 2 - 1, -(py / H()) * 2 + 1), rc = new THREE.Raycaster(); rc.setFromCamera(nd, c);
    const o3 = rc.ray.origin, d3 = rc.ray.direction; if (Math.abs(d3.x) < 1e-4) return null; const t = (X - o3.x) / d3.x; if (t < 0) return null; return { y: o3.y + d3.y * t, z: o3.z + d3.z * t };
  }
  /** פ׳ הכבש: each of his six rows from the pallet to its place up the kevesh; before the stone is let go a small drag ⬍ sets its height (the
   *  finger's height over the row, geared: GEAR px an amah); the straightedge with its bubble lies on the row below and the stone in hand —
   *  centred: the slope goes on even. Each row goes on from the one below it: an error is carried up to where the kevesh meets the altar's top.
   *  Level 1: the slope's gold shadow, the next row's ghost, and within ⅐ amah the stone settles true. The side view from the east: the
   *  kevesh ≈ 70 % of the width, the altar on the right, he at its foot low on the left */
  function mkKevesh57(L) {
    const J = F.createKevesh57(L), k = J.state(), K = F.KEVESH57, al = Math.atan(K.S), made = [], laid = [];
    const add57 = (m, x, y, z) => { m.position.set(x, y, z); if (st.props.root) st.props.root.add(m); made.push(m); return m; };
    const PM = masonry56(16, 2, '#FFFDF6'), yOf = (h) => h - 0.225 / Math.cos(al);
    const slab = (m2) => { const m = new THREE.Mesh(new THREE.BoxGeometry(16, 0.45, 2.02), m2 || PM); m.rotation.x = al; return m; };
    const GM = new THREE.MeshBasicMaterial({ color: '#FFD66E', transparent: true, opacity: 0.32, depthWrite: false });
    let ghost = null, band = null;
    if (L <= 1) {   // (level 1 — §1 rule 7: the slope's shadow along the true line over his rows, and the next row's ghost)
      const n = k.n, i0 = k.first, len = n * K.row, zc = (zRow57(i0) + zRow57(i0 + n - 1)) / 2, hc = (J.ideal(i0) + J.ideal(i0 + n - 1)) / 2;
      band = add57(new THREE.Mesh(new THREE.BoxGeometry(16.4, 0.06, len), GM), XM57, hc + 0.05, zc); band.rotation.x = al;
      ghost = add57(slab(new THREE.MeshBasicMaterial({ color: '#FFD66E', transparent: true, opacity: 0.4, depthWrite: false })), XM57, 0, 0);
    }
    let drag = null, endT = -1, msgT = 0, said = '', lastCue = '';
    line(LINE42.kevesh57, `רמה ${L}`); if (st.ui.pad) st.ui.pad.classList.add('full');
    const GEAR = () => Math.max(100, H() * K.gear[k.L]);
    const nextI = () => k.first + k.rows.length;
    const slotP = () => (k.done ? null : proj(XM57, J.target(), zRow57(nextI())));
    const palAt = () => { const p = st.props.pal57; return p ? proj(p.position.x, p.position.y + 1.6, p.position.z) : null; };
    const cue = (txt) => { if (txt !== lastCue) { lastCue = txt; line(txt, `שורה ${Math.min(k.n, k.rows.length + 1)} / ${k.n} · רמה ${L}`); } };
    const job = {
      acting: true, fullPad: true, kind: 'kevesh57', J, ownView: () => true, gear: GEAR, palAt, slotAt: slotP,
      curAt: () => (drag ? proj(drag.m.position.x, drag.m.position.y + 0.25, drag.m.position.z) : null), locked: () => !!(drag && drag.lock), bubble: () => (drag && drag.lock ? J.bubble(drag.h) : null),
      view() { const c = camera(), tv = Math.tan((((c && c.fov) || 50) * Math.PI) / 360), t2 = tv * (W() / H()), zc = 28, half = 23, D = half / t2; return { p: [XM57 + D, 22.4, zc], t: [XM57, 20.6, zc] }; },   // (from the east, level: the kevesh's length ≈ 70 % of the width, the altar's south face on the right, his place at its foot on the left)
      down(a) {
        if (endT >= 0 || k.done || drag) return; const pq = palAt();
        if (pq && Math.hypot(pq.x - a.x, pq.y - a.y) < Math.max(70, W() * 0.11)) { const g = planeX57(a.x, a.y, XM57); const m = add57(slab(), XM57, g ? Math.max(16.4, g.y) : 17, g ? g.z : PAL57.z); m.rotation.x = 0; drag = { m, lock: false, h: 0 }; buzz42('tick'); o.sound && o.sound('stone'); }
      },
      move(a) {
        if (!drag) return; const sp = slotP(); if (!sp) return;
        const near = Math.abs(a.x - sp.x) < Math.max(60, W() * 0.09) && Math.abs(a.y - sp.y) < Math.max(80, GEAR() * 0.75);
        if (near) { drag.lock = true; drag.h = J.target() + (sp.y - a.y) / GEAR(); drag.m.position.set(XM57, yOf(drag.h), zRow57(nextI())); drag.m.rotation.x = al; const e = drag.h - J.target(); cue(Math.abs(e) <= (L <= 1 ? K.snap[1] : K.hi) ? LINE42.kevesh57 : e < 0 ? LINE42.keveshUp57 : LINE42.keveshDown57); }
        else { drag.lock = false; drag.m.rotation.x = 0; const g = planeX57(a.x, a.y, XM57); if (g) drag.m.position.set(XM57, Math.max(16.4, g.y), g.z); }
      },
      up() {
        if (!drag) return; const d = drag; drag = null;
        if (!d.lock) { if (d.m.parent) d.m.parent.remove(d.m); lastCue = ''; said = LINE42.keveshDrop57; msgT = 1.6; cue(said); return; }
        const r = J.lay(d.h); try55('kevesh', r === 'even');
        if (r === 'crooked') { if (d.m.parent) d.m.parent.remove(d.m); buzz42('retry'); o.sound && o.sound('grind'); said = LINE42.keveshCrooked57; msgT = 2.2; lastCue = ''; cue(said); return; }
        const row = k.rows[k.rows.length - 1]; d.m.position.set(XM57, yOf(row.h), zRow57(row.i)); laid.push(d.m); buzz42(r === 'even' ? 'settle' : 'tick'); o.sound && o.sound('stone');
        const p = st.props.pal57; if (p) p.children.forEach((c2, q) => { if (q > 0) c2.visible = q <= Math.min(4, k.n - k.rows.length); });
        said = r === 'even' ? LINE42.keveshEven57 : LINE42.keveshOff57; msgT = 1.6; lastCue = ''; cue(said);
        if (k.done) { const dr = J.drift(); R.kev57 = Math.round(dr * 600) / 100; said = Math.abs(dr) <= 0.05 ? LINE42.keveshTop57 : `${dr > 0 ? 'גבוה' : 'נמוך'} מראש המזבח — ${Math.max(1, Math.round(Math.abs(dr) * 6))} ${Math.round(Math.abs(dr) * 6) > 1 ? 'טפחים' : 'טפח'} · הטעויות הקטנות הצטברו · המחשה`; lastCue = ''; cue(said); msgT = 99; endT = 2.6; grade('kevesh', k.q, proj(XM57, 25.5, 14)); }
      },
      frame(dt) {
        objPlace(endT < 0, [{ x: XM57, y: 21, z: 26.5, r: 4 }], 'h57kevesh', [{ x: KEV57.x0, y: KEV57.y0, z: KEV57.zTop, r: 0.3 }, { x: KEV57.x1, y: KEV57.y1, z: KEV57.zFoot, r: 0.3 }]);
        if (ghost) { ghost.visible = !k.done; if (!k.done) ghost.position.set(XM57, yOf(J.target()) + 0.02, zRow57(nextI())); }
        if (msgT > 0 && msgT < 90) { msgT -= dt; if (msgT <= 0) { lastCue = ''; cue(LINE42.kevesh57); } }
        svgClear();
        if (endT >= 0) {   // where the kevesh meets the altar's top: true, or the step the small errors added up to
          const dr = J.drift(), a2 = proj(XM57, KEV57.y1, KEV57.zTop), ok = Math.abs(dr) <= 0.05; if (a2) svgAdd(`<circle cx="${a2.x}" cy="${a2.y}" r="16" fill="none" stroke="${ok ? '#7CD86A' : '#FF8A6A'}" stroke-width="4"/>`);
          if ((endT -= dt) <= 0) return true; return false;
        }
        // the straightedge with its bubble: on the row below and the stone in hand (or the last row and the next place)
        const i = nextI(), hPrev = k.rows.length ? k.rows[k.rows.length - 1].h : J.ideal(k.first - 1), hNow = drag && drag.lock ? drag.h : J.target();
        const a2 = proj(XM57, hPrev + 0.08, zRow57(i - 1)), b2 = proj(XM57, hNow + 0.08, zRow57(i));
        if (a2 && b2 && (drag ? drag.lock : true)) {
          const dx = b2.x - a2.x, dy = b2.y - a2.y, ln = Math.hypot(dx, dy) || 1, ux = dx / ln, uy = dy / ln, ex = 0.6 * ln, mx = (a2.x + b2.x) / 2, my = (a2.y + b2.y) / 2, bb = drag && drag.lock ? J.bubble(drag.h) : 0, ok2 = Math.abs(bb) < 0.16;
          svgAdd(`<line x1="${a2.x - ux * ex}" y1="${a2.y - uy * ex}" x2="${b2.x + ux * ex}" y2="${b2.y + uy * ex}" stroke="#2A1804" stroke-width="9" stroke-linecap="round"/><line x1="${a2.x - ux * ex}" y1="${a2.y - uy * ex}" x2="${b2.x + ux * ex}" y2="${b2.y + uy * ex}" stroke="#D9B77A" stroke-width="6" stroke-linecap="round" data-gauge="1"/>`);
          const vx = mx - uy * 22, vy = my + ux * 22 - 24;   // the vial over the straightedge (screen-level: the bubble runs left or right)
          svgAdd(`<rect x="${vx - 40}" y="${vy - 10}" width="80" height="20" rx="10" fill="rgba(200,240,190,.92)" stroke="#2A1804" stroke-width="2"/><line x1="${vx - 9}" y1="${vy - 10}" x2="${vx - 9}" y2="${vy + 10}" stroke="#2A1804" stroke-width="1.5"/><line x1="${vx + 9}" y1="${vy - 10}" x2="${vx + 9}" y2="${vy + 10}" stroke="#2A1804" stroke-width="1.5"/><circle cx="${vx + bb * 30}" cy="${vy}" r="7" fill="${ok2 ? '#7CD86A' : '#FFF8D6'}" stroke="#2A1804" stroke-width="1.5" data-bubble="${bb.toFixed(2)}"/>`);
          if (drag && drag.lock && !ok2) { const q = job.curAt(); if (q) svgAdd(`<text x="${q.x + 46}" y="${q.y + 10}" font-size="30" font-weight="900" text-anchor="middle" fill="#FFD66E" stroke="#2A1804" stroke-width="4" paint-order="stroke">${bb > 0 ? '⬇' : '⬆'}</text>`); }
        }
        if (L <= 1 && !k.done) { const g = slotP(); if (g) svgAdd(`<circle cx="${g.x}" cy="${g.y}" r="12" fill="none" stroke="#FFD66E" stroke-width="3" stroke-dasharray="5 4" data-slot="1"/>`); }
        // the pallet's handle (≥ 44 px) and one hand: from the pallet to the next row
        const pq = palAt(); if (pq && !k.done) svgAdd(`<circle cx="${pq.x}" cy="${pq.y}" r="26" fill="rgba(255,214,110,.18)" stroke="#FFD66E" stroke-width="3" stroke-dasharray="6 5" data-pal="1"/>`);
        if (!st.finger && !drag && !k.done) { const p0 = pq, p1 = slotP(); if (p0 && p1) { const u = (now() * 0.4) % 1; svgAdd(`<text x="${p0.x + (p1.x - p0.x) * u}" y="${p0.y + (p1.y - p0.y) * u + 30}" font-size="30" text-anchor="middle" opacity=".85">👆</text>`); } }
        return false;
      },
      end() { svgClear(); if (st.ui.pad) st.ui.pad.classList.remove('full'); if (ghost) ghost.visible = false; if (band) band.visible = false; if (drag && drag.m.parent) drag.m.parent.remove(drag.m); drag = null; },
    };
    return job;
  }
  /** ט׳ הסיד: the altar's face whitened with a cloth — never iron (מדות ג, ד) — in the morning light; a macro on a patch of its east face (≈ 70 %
   *  of the width; he behind the camera). The finger spreads the whitewash: too slow — it drips (the drops run down the face); too fast — streaks
   *  (half covered); a coverage meter at the side. "מרחו ↔ — לא לאט מדי" */
  function mkSid57(L) {
    const J = F.createSid57(L), k = J.state(), V = SID57V, Wd = V.z1 - V.z0, Ht = V.y1 - V.y0;
    try { if (o.timeOfDay) o.timeOfDay('dawn'); } catch (e) { /* */ }
    const cw = 480, ch = 320, mk = () => { const c = doc ? doc.createElement('canvas') : null; if (c) { c.width = cw; c.height = ch; } return c; };
    const base = mk(), paint = mk(), show = mk(); if (!base || !paint || !show) return null;
    { const c = base.getContext('2d'); let a0 = 977; const rnd = () => { a0 = (a0 * 16807) % 2147483647; return a0 / 2147483647; };
      c.fillStyle = '#B9AD94'; c.fillRect(0, 0, cw, ch);
      for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) { const x = q * 160 - (r % 2 ? 80 : 0), y = r * 80; c.fillStyle = `rgb(${172 + Math.floor(rnd() * 22)},${160 + Math.floor(rnd() * 20)},${136 + Math.floor(rnd() * 18)})`; c.fillRect(x + 3, y + 3, 154, 74); }
      for (let i = 0; i < 900; i++) { c.fillStyle = rnd() < 0.5 ? 'rgba(90,72,50,.16)' : 'rgba(250,244,230,.14)'; c.beginPath(); c.arc(rnd() * cw, rnd() * ch, 1 + rnd() * 3, 0, 6.283); c.fill(); }
      for (let i = 0; i < 7; i++) { const g = c.createRadialGradient(0, 0, 2, 0, 0, 40); g.addColorStop(0, 'rgba(96,58,40,.38)'); g.addColorStop(1, 'rgba(96,58,40,0)'); c.save(); c.translate(rnd() * cw, rnd() * ch); c.scale(1 + rnd(), 0.7 + rnd() * 0.6); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 40, 0, 6.283); c.fill(); c.restore(); }   // (the year's stains — "מפני הדמים")
      c.strokeStyle = 'rgba(70,58,42,.55)'; c.lineWidth = 3; for (let r = 0; r <= 4; r++) { c.beginPath(); c.moveTo(0, r * 80); c.lineTo(cw, r * 80); c.stroke(); } for (let r = 0; r < 4; r++) for (let q = 0; q <= 3; q++) { const x = q * 160 + (r % 2 ? 80 : 0); c.beginPath(); c.moveTo(x, r * 80); c.lineTo(x, r * 80 + 80); c.stroke(); } }
    const tex = new THREE.CanvasTexture(show); tex.colorSpace = THREE.SRGBColorSpace;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(Wd, Ht), new THREE.MeshStandardMaterial({ color: '#FFFFFF', map: tex, roughness: 0.95, emissive: new THREE.Color('#3A3226'), emissiveMap: tex, emissiveIntensity: 0.45 }));
    face.rotation.y = Math.PI / 2; face.position.set(V.x + 0.03, (V.y0 + V.y1) / 2, (V.z0 + V.z1) / 2); if (st.props.root) st.props.root.add(face);
    const pc = paint.getContext('2d'), sc = show.getContext('2d'), drips = []; let dirty = true;
    const redraw = () => { sc.drawImage(base, 0, 0); sc.drawImage(paint, 0, 0); for (const d of drips) { const x = d.u * cw, y = d.v * ch, L2 = d.len * ch; sc.strokeStyle = 'rgba(252,250,242,.95)'; sc.lineWidth = 5; sc.lineCap = 'round'; sc.beginPath(); sc.moveTo(x, y); sc.lineTo(x + Math.sin(d.v * 40) * 3, y + L2); sc.stroke(); sc.fillStyle = 'rgba(252,250,242,1)'; sc.beginPath(); sc.ellipse(x + Math.sin(d.v * 40) * 3, y + L2 + 4, 5, 7, 0, 0, 6.283); sc.fill(); } tex.needsUpdate = true; dirty = false; };
    redraw();
    const toUV = (px, py) => { const c = camera(); if (!c) return null; const nd = new THREE.Vector2((px / W()) * 2 - 1, -(py / H()) * 2 + 1), rc = new THREE.Raycaster(); rc.setFromCamera(nd, c); const o3 = rc.ray.origin, d3 = rc.ray.direction; if (Math.abs(d3.x) < 1e-4) return null; const t = (V.x - o3.x) / d3.x; if (t < 0) return null; const z = o3.z + d3.z * t, y = o3.y + d3.y * t; return { u: (V.z1 - z) / Wd, v: (V.y1 - y) / Ht }; };
    const faceBox = () => { const a = proj(V.x, V.y1, V.z1), b = proj(V.x, V.y0, V.z0); if (!a || !b) return null; const l = Math.min(a.x, b.x), r = Math.max(a.x, b.x), t = Math.min(a.y, b.y), bt = Math.max(a.y, b.y); return { l, r, t, b: bt, w: r - l, h: bt - t }; };
    let last = null, sp = 0, endT = -1, msgT = 0, cloth = null, still = 0;
    line(LINE42.sid57, `רמה ${L}`); if (st.ui.pad) st.ui.pad.classList.add('full');
    function stroke(u, v, r) {
      const x = u * cw, y = v * ch, R0 = cw * 0.085;
      if (r === 'fast' || r === 'streak') { pc.strokeStyle = 'rgba(250,248,240,.8)'; pc.lineWidth = 3; const ang = last && last.dir != null ? last.dir : 0; for (let q = -3; q <= 3; q++) { const ox = -Math.sin(ang) * q * 9, oy = Math.cos(ang) * q * 9; pc.beginPath(); pc.moveTo(x + ox - Math.cos(ang) * R0, y + oy - Math.sin(ang) * R0); pc.lineTo(x + ox + Math.cos(ang) * R0, y + oy + Math.sin(ang) * R0); pc.stroke(); } }
      else { const g = pc.createRadialGradient(x, y, R0 * 0.2, x, y, R0); g.addColorStop(0, 'rgba(252,250,244,.97)'); g.addColorStop(0.75, 'rgba(250,248,240,.9)'); g.addColorStop(1, 'rgba(250,248,240,0)'); pc.fillStyle = g; pc.beginPath(); pc.arc(x, y, R0, 0, 6.283); pc.fill(); }
      dirty = true;
    }
    function at(u, v, speed, t) {
      if (u < -0.05 || u > 1.05 || v < -0.05 || v > 1.05 || k.done) return;
      const r = J.wipe(Math.max(0, Math.min(1, u)), Math.max(0, Math.min(1, v)), speed, t); stroke(u, v, r);
      if (r === 'drip') { drips.push({ u, v, len: 0, t: 0 }); msgT = 1.6; line(LINE42.sidSlow57, `טפטופים ${k.drips} · פסים ${k.streaks}`); buzz42('retry'); }
      else if (r === 'streak') { msgT = 1.6; line(LINE42.sidFast57, `טפטופים ${k.drips} · פסים ${k.streaks}`); buzz42('tick'); }
      if (k.done && endT < 0) { R.sid57 = { d: k.drips, s: k.streaks }; line(LINE42.sidDone57, `טפטופים ${k.drips} · פסים ${k.streaks}`); msgT = 99; endT = 2.0; buzz42('ok'); o.sound && o.sound('brush'); grade('sid', k.q, { x: W() / 2, y: H() * 0.35 }); }
    }
    const job = {
      acting: true, fullPad: true, kind: 'sid57', J, ownView: () => true, snapView: () => true, faceBox, cover: () => J.cover(), gapRow: () => J.gapRow(), speedWin: () => { const fb = faceBox(); return fb ? { min: F.SID57.vmin[k.L] * fb.w, max: F.SID57.vmax[k.L] * fb.w } : null; },
      view() { const c = camera(), tv = Math.tan((((c && c.fov) || 50) * Math.PI) / 360), t2 = tv * (W() / H()), D = Wd / (2 * V.share * t2), ym = (V.y0 + V.y1) / 2, zm = (V.z0 + V.z1) / 2; return { p: [V.x + D, ym + 0.15, zm], t: [V.x, ym, zm] }; },   // (a macro, level, square on the face)
      down(a) { if (endT >= 0) return; const q = toUV(a.x, a.y); last = q ? { u: q.u, v: q.v, x: a.x, y: a.y, t: now(), t0: now(), dir: null } : null; sp = 0; still = 0; cloth = { x: a.x, y: a.y }; },
      move(a) {
        cloth = { x: a.x, y: a.y }; if (endT >= 0 || !last) return; const q = toUV(a.x, a.y); if (!q) return;
        const t = now(), dtm = Math.max(1 / 240, t - last.t), d = Math.hypot(a.x - last.x, a.y - last.y), fb = faceBox(), fw = fb ? Math.max(60, fb.w) : W() * 0.7;
        if (d < 2) return;   // (a tremor — not a stroke)
        const inst = d / dtm / fw; sp = sp ? sp * 0.55 + inst * 0.45 : inst; still = 0;
        const dir = Math.atan2(a.y - last.y, a.x - last.x), n = Math.max(1, Math.ceil(d / 14));
        for (let s2 = 1; s2 <= n; s2++) { const f = s2 / n; at(last.u + (q.u - last.u) * f, last.v + (q.v - last.v) * f, t - last.t0 < 0.12 ? Math.max(sp, F.SID57.vmin[k.L] * 1.01) : sp, t); }   // (the first moment of a stroke is never "too slow")
        last = { u: q.u, v: q.v, x: a.x, y: a.y, t, dir, t0: last.t0 != null ? last.t0 : last.t };
      },
      up() { last = null; cloth = null; still = 0; },
      frame(dt) {
        objPlace(endT < 0, [{ x: V.x, y: (V.y0 + V.y1) / 2, z: (V.z0 + V.z1) / 2, r: 2 }], 'h57sid', [{ x: V.x, y: V.y0, z: V.z0, r: 0.05 }, { x: V.x, y: V.y1, z: V.z1, r: 0.05 }]);
        if (last && st.finger && endT < 0) { still += dt; if (still > 0.3) { still = 0; at(last.u, last.v, 0, now()); } }   // (the cloth held still on the face: it drips)
        for (const d of drips) { if (d.t < 1.6) { d.t += dt; d.len = Math.min(0.42, d.len + dt * 0.26); dirty = true; } }
        if (dirty) redraw();
        if (msgT > 0 && msgT < 90) { msgT -= dt; if (msgT <= 0) line(k.drips + k.streaks === 0 && J.cover() < 0.25 ? LINE42.sidCloth57 : LINE42.sid57, `רמה ${L}`); }
        svgClear();
        // the coverage meter at the side (left — clear of the right hand), its mark at the cover needed
        const mh = Math.min(150, H() * 0.5), mx = 16, my = (H() - mh) / 2, cv = J.cover(), need = F.SID57.need[k.L];
        svgAdd(`<rect x="${mx}" y="${my}" width="20" height="${mh}" rx="10" fill="rgba(28,20,10,.65)" stroke="#FFE6A0" stroke-width="2"/><rect x="${mx + 3}" y="${my + mh - 3 - (mh - 6) * Math.min(1, cv / need)}" width="14" height="${(mh - 6) * Math.min(1, cv / need)}" rx="7" fill="#F6F2E6" data-cover="${cv.toFixed(2)}"/><text x="${mx + 10}" y="${my - 8}" font-size="13" font-weight="900" text-anchor="middle" fill="#FFF4DC" stroke="#2A1804" stroke-width="3" paint-order="stroke">${Math.round(Math.min(1, cv / need) * 100)}%</text>`);
        // the cloth under the finger (linen, folded) — not iron; at rest at the face's foot, and one hand ↔ till the first stroke
        const fb = faceBox(), cp = cloth || (fb ? { x: fb.r - 40, y: fb.b - 30 } : null);
        if (cp && endT < 0) svgAdd(`<g transform="translate(${cp.x},${cp.y}) rotate(-12)" data-cloth="1"><path d="M-26 -16 Q-6 -24 22 -18 Q30 0 24 18 Q0 26 -24 18 Q-32 0 -26 -16Z" fill="#F3EBD8" stroke="#8C7A5A" stroke-width="2"/><path d="M-14 -16 Q-8 0 -12 17 M4 -19 Q10 0 6 20" fill="none" stroke="#C9B994" stroke-width="1.6"/><circle cx="18" cy="12" r="3" fill="#FFFFFF" opacity=".9"/></g>`);
        if (!st.finger && !cloth && endT < 0 && J.cover() < 0.15 && fb) { const u = 0.5 + 0.5 * Math.sin(now() * 2.2); svgAdd(`<text x="${fb.l + fb.w * (0.25 + 0.5 * u)}" y="${fb.t + fb.h * 0.55}" font-size="30" text-anchor="middle" opacity=".85">👆</text>`); }
        if (endT >= 0) { if ((endT -= dt) <= 0) return true; }
        return false;
      },
      end() { svgClear(); if (st.ui.pad) st.ui.pad.classList.remove('full'); },
    };
    return job;
  }
  const mix55 = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  /** the defect bag (build 48's shuffle-bag) over the stones' types of a level: n draws */
  const bag55 = (n, L) => { const B2 = F.createBag48(S.bag55 || null, Math.random, F.BAG55[L] || F.BAG55[2]), out = []; for (let k = 0; k < n; k++) out.push(B2.draw()); S.bag55 = B2.state(); save42(S); if (!out.some((t) => F.STONE55[t].bad)) out[out.length - 1] = 'crack'; if (!out.some((t) => !F.STONE55[t].bad)) out[0] = 'mud'; return out; };
  const PART = {
    open: {
      begin() {
        // ── build 53 ── after the first viewing (and in a fixture, ?h42at=<part>): no flight — ~1 s from black to the world (the inspector's review §4 important 12) ── /build 53 ──
        const fix = !!qs('h42at') && qs('h42at') !== 'open', first = !R.open && !fix;
        if (!first) { st.fly = { t: 0, T: FADE53.T, fade: true, snap: false }; line(''); black53(1); return; }
        st.fly = { t: 0, T: STG !== 'har' ? 8 : 16, first, snap: false }; line(''); skipBtn(STG !== 'har' ? 3 : 5);
      },
      frame(dt) {
        const f = st.fly; f.t += dt; const u = Math.min(1, f.t / f.T), V = (globalThis.__T && globalThis.__T.VIEWS && globalThis.__T.VIEWS.olives) || { p: [601, 301, -215], t: [-60, 20, 0] };
        if (f.fade) {   // ── build 53 ── black → the world: the plans as they stand after the flight; stage 01's before-picture from the opening's viewpoint, under the black ── /build 53 ──
          const pre = STG === 'har' && f.t < FADE53.pre;
          if (pre) { camTo(V.p, V.t, 1); if (!f.snap && f.t > FADE53.pre * 0.5) { f.snap = true; try { if (o.snapshot) st.snapshot = o.snapshot(); } catch (e) { st.snapshot = null; } } } else { const fv = followView(hero()); camTo(fv.p, fv.t, 1); }
          if (st.props.plan) st.props.plan.forEach((m) => { if (STG === 'har') m.scale.x = pre ? 0.001 : 1; else m.scale.y = 1; });
          if (st.props.plan55) st.props.plan55.forEach((m) => { m.scale.y = 1; });   // ── build 55 ──
          if (STG === 'lishka' && !f.k50) { f.k50 = 1; try { if (stages.setStage) stages.setStage('lishka', 'done', 1, { instant: true }); } catch (e) { /* */ } }
          black53(Math.max(0, Math.min(1, 1 - (f.t - FADE53.pre) / (f.T - FADE53.pre))));
          return u >= 1;
        }
        if (STG === 'yesod' || STG === 'sovev' || STG === 'guf') {   // ── build 55 ── from over the court's heart: the altar's gold plan, 32 × 32, rises from the ground (מדות ג, א); the carts from בית כרם come in
          const c = { x: -38, z: -3.5 }, gc = gy(c.x, c.z), orbit = Math.min(1, u / 0.78), a = -1.45 + orbit * 0.5, Rr = 170 - 70 * orbit;   /* (from the north-east: from the east Nicanor's gatehouse hid the altar — stages.js's own view for it, az −60) */
          let p = [c.x + Math.cos(a) * Rr, gc + 105 - 45 * orbit, c.z + Math.sin(a) * Rr], t = [c.x, gc + 2, c.z];
          if (u > 0.78) { const k = (u - 0.78) / 0.22, e = k * k * (3 - 2 * k), fv = followView(hero()); p = p.map((v, i) => v + (fv.p[i] - v) * e); t = t.map((v, i) => v + (fv.t[i] - v) * e); }
          camTo(p, t, 1);
          if (st.props.plan55) st.props.plan55.forEach((m, i) => { m.scale.y = Math.max(0.001, Math.min(1, (u - 0.08 - i * 0.05) / 0.25)); });
          return u >= 1;
        }
        if (STG === 'lishka') {   // ── build 50 ── from over the court's west: the chambers' block rising round the court; the three he builds in gold
          const c = { x: -130, z: 0 }, orbit = Math.min(1, u / 0.78), a = 0.9 + orbit * 0.7, Rr = 230 - 70 * orbit;
          let p = [c.x + Math.cos(a) * Rr, 16 + 150 - 60 * orbit, c.z + Math.sin(a) * Rr], t = [c.x, 22, c.z];
          if (u > 0.78) { const k = (u - 0.78) / 0.22, e = k * k * (3 - 2 * k), fv = followView(hero()); p = p.map((v, i) => v + (fv.p[i] - v) * e); t = t.map((v, i) => v + (fv.t[i] - v) * e); }
          camTo(p, t, 1);
          if (!f.k50 || f.t - f.k50 > 0.25) { f.k50 = f.t; try { if (stages.setStage) stages.setStage('lishka', 'building', 0.15 + 0.8 * Math.min(1, u / 0.75), { instant: true }); } catch (e) { /* */ } }
          if (st.props.plan50) st.props.plan50.forEach((m, i) => { m.scale.y = Math.max(0.001, Math.min(1, (u - 0.1 - i * 0.08) / 0.2)); });
          return u >= 1;
        }
        if (STG === 'nikanor') {   // ── build 49 ── from over the women's court: the gate, bronze; the steps' half circle in gold; the dive to him
          const c = { x: 10, z: 0 }, orbit = Math.min(1, u / 0.78), a = 0.75 - orbit * 0.6, Rr = 150 - 60 * orbit;
          let p = [c.x + Math.cos(a) * Rr, 6 + 75 - 40 * orbit, c.z + Math.sin(a) * Rr], t = [c.x, 6 + 12, c.z];
          if (u > 0.78) { const k = (u - 0.78) / 0.22, e = k * k * (3 - 2 * k), fv = followView(hero()); p = p.map((v, i) => v + (fv.p[i] - v) * e); t = t.map((v, i) => v + (fv.t[i] - v) * e); }
          camTo(p, t, 1);
          if (st.props.plan49) st.props.plan49.forEach((m, i) => { m.scale.setScalar(Math.max(0.001, Math.min(1, (u - 0.05 - i * 0.1) / 0.3))); });
          return u >= 1;
        }
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
      end() { R.open = (R.open | 0) + 1; black53(0); if (st.ui.skip) { st.ui.skip.remove(); st.ui.skip = null; } if (st.props.plan46) st.props.plan46.forEach((m) => { m.visible = false; }); if (st.props.plan47) st.props.plan47.forEach((m) => { m.visible = false; }); if (st.props.plan48) st.props.plan48.forEach((m) => { m.visible = false; }); if (st.props.plan49) st.props.plan49.forEach((m) => { m.visible = false; }); if (st.props.plan50) st.props.plan50.forEach((m) => { m.visible = false; }); if (STG === 'lishka') { try { if (stages.setStage) stages.setStage('lishka', 'done', 1, { instant: true }); } catch (e) { /* */ } } },
    },
    rope: {
      // ── build 53 ── (the inspector's review §4 nice 19: "two holds and it's over — nothing to be precise about") the rope pulls him off the
      // line (a slow sway, stronger by level); a drag sideways while holding steers him back; the grade: his widest step off the straight
      // line from peg to peg — as the thread in stage 02 ── /build 53 ──
      begin() { line(LINE42.rope); const A = PL.peg0, B = PL.peg1, dx = B.x - A.x, dz = B.z - A.z, l = Math.hypot(dx, dz) || 1; st.rope53 = { L: Math.max(1, Math.min(4, famL('rope'))), A, u: { x: dx / l, z: dz / l }, n: { x: -dz / l, z: dx / l }, len: l, max: 0, sum: 0, k: 0, t: 0, graded: false }; },
      frame() {
        const h = hero(), r = st.props.rope; if (r) { const a = r.geometry.attributes.position; a.setXYZ(0, PL.peg0.x, PL.peg0.y + 1.4, PL.peg0.z); a.setXYZ(1, h.x, h.y + 1.6, h.z); a.needsUpdate = true; }
        const R5 = st.rope53;
        if (R5) {
          const px = h.x - R5.A.x, pz = h.z - R5.A.z, along = px * R5.u.x + pz * R5.u.z, dev = Math.abs(px * R5.n.x + pz * R5.n.z);
          if (st.hold && along > 1 && along < R5.len - 1) { R5.max = Math.max(R5.max, dev); R5.sum += dev; R5.k++; }
          svgClear(); const a = proj(PL.peg0.x, PL.peg0.y + 0.1, PL.peg0.z), b = proj(PL.peg1.x, PL.peg1.y + 0.1, PL.peg1.z); if (a && b) svgAdd(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${dev > ROPE53.kasher ? '#E8735A' : dev > ROPE53.ok ? '#FFD66E' : '#BFF0A0'}" stroke-width="3" stroke-dasharray="10 7" opacity=".85"/>`);
          if (st.near && !R5.graded) { R5.graded = true; svgClear(); const q = R5.max <= ROPE53.ok ? 1 : R5.max <= ROPE53.kasher ? 0.65 : 0.3; grade('rope', q, b); }
        }
        return st.near;
      },
    },
    lift: {
      begin() { const L = famL('lift'); st.job = mkLift(L); line(LINE42.lift, `רמה ${L}`); },
    },
    corner: { begin() { st.job = STG === 'nashim' && MODE === 'stage' ? mkCorner48() : mkCorner(); } },   // ── build 49 ── (one key: build 48's second 'corner' overrode stage 01's crowbar — in stage 01, the test and the yard)
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
    walk: { begin() { st.job = mkWalk48(); } },
    voyage: { begin() { st.job = mkVoyage49(); } },   // ── build 49 ── stage 06's parts
    compass: { begin() { st.job = mkCompass50(); } },   // ── build 50 ── stage 07's parts
    benches: { begin() { st.job = mkBenches50(); } },
    hub: { begin() { st.job = mkHub50(); } },
    wheel: { begin() { st.job = mkWheel50(); } },
    dome: { begin() { st.job = mkDome50(); } },
    arch: { begin() { st.job = mkDome50('arch'); } },   // (the yard's)
    log2: { begin() { st.job = mkWood(2); } },   // (the test's second log check)
    lever: { begin() { st.job = mkLever49(); } },
    hang: { begin() { st.job = mkHang49(); } },
    steps: { begin() { st.job = mkSteps49(); } },
    step: { begin() { st.job = mkSteps49(5, 'step'); } },   // (the yard's: five steps)
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
    // ── build 57 ── stage 10's parts (§3 "10"): what is pasul and what only looks pasul (levels 3–4), the kevesh, the whitewash ── /build 57 ──
    decoy: { begin() { st.job = mkStone55('all', F.list57(Math.random, Lover || 3), Lover || 3, 'decoy'); } },
    kevesh: { begin() { st.job = mkKevesh57(famL('place')); } },
    sid: { begin() { st.job = mkSid57(Lover || 1); } },
    // ── build 56 ── stage 09's parts (§3 "09"): the raking light (level 2), the mallet and the witness (level 3), the sovev's course, the red line ── /build 56 ──
    light: { begin() { st.job = mkStone55('lamp', mix55(['hair', 'whole']).concat(['hair']), Lover || 2, 'light'); } },
    tap: { begin() { st.job = mkStone55('tap', mix55(['deep', 'whole']).concat(['deep']), Lover || 3, 'tap'); } },
    sovev: { begin() { st.job = mkCourse56(famL('place')); } },
    thread: { begin() { st.job = mkThread56(famL('fit')); } },
    // ── build 55 ── stage 08's parts and the test's three before chapter ג׳ (§2): the stone, the mud, the fingernail ── /build 55 ──
    inspect: { begin() { st.job = mkStone55('look', bag55(4, 1), 1, 'inspect'); } },
    field: { begin() { st.job = mkField55(famL('place')); } },
    nail: { begin() { st.job = mkStone55('nail', MODE === 'test' ? mix55(['nick', 'whole']) : ['nick', 'whole', 'nick'], Math.max(2, Lover || 2), 'nail'); } },
    iron: { begin() { st.job = mkStone55('look', ['whole', 'iron', 'whole'], Lover || 1, 'iron'); } },   // (the twist met at level 1: the heap glows once the glint has shown — the first stone that looks perfect and is pasul)
    last: { begin() { st.job = mkLast55(famL('place')); } },
    stone: { begin() { st.job = mkStone55('look', mix55(['crack', 'whole']), Lover || 2, 'stone'); } },
    mud: { begin() { st.job = mkStone55('look', mix55(['mud', 'mudcrack']), Lover || 2, 'mud'); } },
    reveal: {
      // ── build 43 ── (the coordinator's #2) the crane up from the last slab to the opening's own high viewpoint over the Mount of Olives — the
      // whole smooth platform in the late sun — and there a quick crossfade to the opening's rock (before) and back (after); 9.5 s, skippable
      begin() {
        line(''); objPlace(false); svgClear();
        if (STG === 'wall' && MODE === 'stage') { try { R.stones = stones45(); R.hole = H45(); save42(S); wallStones45({ list: R.stones, hole: R.hole, scene: scene(), center: [PL.course.x + 2, PL.course.z] }); } catch (e) { /* */ } }   // ── build 46 ── his stones stay in the wall
        if (st.props.root) st.props.root.visible = false;
        let out = null; try { out = o.complete ? o.complete() : null; } catch (e) { out = null; }
        try { if (o.timeOfDay) o.timeOfDay(STG === 'yesod' || STG === 'sovev' || STG === 'guf' ? 'noon' : 'golden'); } catch (e) { /* */ }   // ── build 56 ── (the altar in the Heichal's long shadow at the golden hour: the yesod's reveal was dark) ── /build 56 ──
        const gc = gy(CW45.x, CW45.z), V = STG === 'guf' ? { p: [8, 62, 80], t: [-38, 20, 6] } : STG === 'sovev' ? { p: [14, 70, -60], t: [-38, 19, -3.5] } : STG === 'yesod' ? { p: [12, 92, 52], t: [-38, 17, -3.5] } : STG === 'lishka' ? { p: [-70, 125, -235], t: [-160, 28, -70] } : STG === 'nikanor' ? { p: [92, 52, 62], t: [8, 19, 0] } : STG === 'nashim' ? { p: [10, gc + 95, -150], t: [73, gc + 6, 0] } : STG === 'gates' ? { p: [-60, gc + 95, -175], t: [-60, gc + 8, -40] } : STG === 'soreg' ? { p: [PL.soreg.x - 40, gc + 70, PL.soreg.z - 120], t: [PL.soreg.x + 10, gc + 3, PL.soreg.z + 14] } : STG === 'wall' ? { p: [CW45.x - 70, gc + 150, CW45.z - 215], t: [CW45.x, gc + 6, CW45.z] } : (globalThis.__T && globalThis.__T.VIEWS && globalThis.__T.VIEWS.olives) || { p: [601, 301, -215], t: [-60, 20, 0] };   // (build 45: the wall — up over the whole court, from the north: from its south-east the crane flew through the north wall)
        const P0 = STG === 'yesod' || STG === 'sovev' || STG === 'guf' ? { x: -38, y: gy(-38, -3.5), z: -3.5 } : STG === 'lishka' ? PL.mk : STG === 'nikanor' ? PL.arc : STG === 'wall' ? PL.course : STG === 'soreg' ? PL.soreg : STG === 'gates' ? PL.gate : STG === 'nashim' ? PL.wallY : PL.pave;
        if (STG === 'gates') { hole46(false); try { if (stages.setStage) stages.setStage('gates', 'building', 1, {}); } catch (e) { /* */ } }   // ── build 47 ──
        if (STG === 'nashim') { try { stages.hero.show(true); if (stages.setStage) stages.setStage('nashim', 'building', 1, {}); } catch (e) { /* */ } }   // ── build 48 ──
        if (STG === 'lishka') hole50(null);   // ── build 50 ── (the chambers done — complete() set them at once)
        if (STG === 'nikanor') { hole49(null); try { stages.hero.show(true); } catch (e) { /* */ } }   // ── build 49 ── (the model's own steps and doors, done — complete() set it at once; 'building' at 1 kept the scaffold up: his Levites stand on them)
        if (STG === 'soreg') { hole46(false); try { if (stages.setStage) stages.setStage('sorag', 'building', 1, {}); } catch (e) { /* */ } }   // ── build 46 ── (the soreg whole: the model's own where his panels stood)
        st.rev = { t: 0, out, V, p0: STG === 'yesod' || STG === 'sovev' || STG === 'guf' ? [cq.p.x, cq.p.y, cq.p.z] : [P0.x + 7, P0.y + 4.5, P0.z + 6], t0: STG === 'yesod' || STG === 'sovev' || STG === 'guf' ? [cq.t.x, cq.t.y, cq.t.z] : [P0.x, P0.y + 0.5, P0.z + 1.5] };   // ── build 55 ── (from the last row's own view, risen — from close over the altar's middle the first frames were the slab's dark top) ── /build 55 ──
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
        if (STG === 'sovev' && !r.rl && k > 5.2) { r.rl = 1; try { if (stages.redLine) stages.redLine(0.5); } catch (e2) { /* */ } }   // ── build 56 ── (the red line drawn round the altar's middle as the camera settles) ── /build 56 ──
        if (im) im.style.opacity = String(k < 6.6 ? 0 : k < 7.1 ? (k - 6.6) / 0.5 : k < 8.3 ? 1 : k < 8.9 ? 1 - (k - 8.3) / 0.6 : 0);
        if (tg && k > 6.6) { tg.hidden = false; tg.textContent = STG === 'guf' ? 'הכבש והסיד — המזבח לבן מול השמש' : STG === 'sovev' ? 'הסובב — עלה חמש וכנס אמה; וחוט הסיקרא באמצע' : STG === 'yesod' ? 'יסוד המזבח — בצפון ובמערב, ואמה בדרום ובמזרח' : STG === 'lishka' ? 'הלשכות — לשכת הגזית, לשכת הגולה ובית המוקד' : STG === 'nikanor' ? 'שער ניקנור — נחושת; וחמש עשרה מעלות כחצי גורן' : STG === 'nashim' ? 'עזרת הנשים — קל״ה על קל״ה, וארבע לשכות בלי תקרה' : STG === 'gates' ? 'שבעה שערים — עשרים אמה גובהם, עשר רוחבם' : STG === 'soreg' ? 'הסורג — עשרה טפחים; החיל — עשר אמות' : STG === 'wall' ? 'חומת העזרה — קפ״ז על קל״ה' : k < 8.6 && im ? 'לפני — הסלע של הבוקר' : 'אחרי — משטח חלק'; }   // (build 45: the court, 187 × 135 — מדות ה, א)
        return r.t > 9.5;
      },
      end() { if (st.ui.skip) { st.ui.skip.remove(); st.ui.skip = null; } finishCard(); },
    },
  };
  // ── build 53 ── the opening's black: a sheet over the world, its opacity k (0: gone) ── /build 53 ──
  function black53(k) {
    if (!doc || !st.ui.root) return;
    if (k <= 0) { if (st.ui.black) { st.ui.black.remove(); st.ui.black = null; } return; }
    if (!st.ui.black) { const b = el('h42-black', ''); b.style.cssText = 'position:fixed;inset:0;background:#000;pointer-events:none;z-index:60'; st.ui.root.appendChild(b); st.ui.black = b; }
    st.ui.black.style.opacity = String(Math.min(1, k));
  }
  function skipBtn(after = 0) {
    if (!doc || !st.ui.root) return;
    setTimeout(() => { if (!st.on || st.part !== 'open' || st.ui.skip) return; const b = el('h42-skip', 'דלגו', 'button'); b.type = 'button'; b.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (st.fly) st.fly.t = Math.max(st.fly.t, st.fly.T * 0.78); }); st.ui.root.appendChild(b); st.ui.skip = b; }, after * 1000);
  }

  /* LIFT: the treadwheel — hold on the wheel: he walks it; a drag down: lowers; the shadow (level 1) and the window on a meter */
  function mkLift(L) {
    const J = F.createLift(L), mt = el('h42-meter', '<i></i><b></b><u></u>'); st.ui.root.appendChild(mt);
    const [w0, w1] = J.P.win; mt.querySelector('b').style.bottom = `${w0 * 80}%`; mt.querySelector('b').style.height = `${(w1 - w0) * 80}%`;
    const dn = el('h42-dn', '⬇'); dn.hidden = true; st.ui.root.appendChild(dn);   // ── build 53 ── the arrow on the meter once past the window (§4 must 5) ── /build 53 ──
    const inp = { hold: false, back: false };
    return {
      acting: true, el: [mt, dn], J, kind: 'lift', down53: () => (dn.hidden ? null : dn.getBoundingClientRect()),
      down() { inp.hold = true; inp.back = false; }, move(a) { const over = J.state().y > J.P.win[1], dx = a.x - a.x0, dy = a.y - a.y0; if (dy > 20 || dx < -20 || (over && Math.hypot(dx, dy) > 20)) { inp.hold = false; inp.back = true; } },   // (over the window, a drag any way lowers it — the naive kid dragged every way but down) ── build 53 ── (down and left lower it at any time — the inspector's review §4 must 5: "I tried 3 ways; only left lowered") ── /build 53 ──
      up() { inp.hold = false; inp.back = false; },
      frame(dt) {
        const s = J.step(dt, inp); if (inp.hold && s.held > F.TAP42 && Math.random() < dt * 6) buzz42('creak');
        const y = s.y + J.sway(); st.props.stone0 && (st.props.stone0.position.y = PL.stone0.y + 0.9 + y * 5); craneRope(PL.stone0.y + 1.8 + y * 5); st.props.wheel && (st.props.wheel.rotation.z -= s.v * dt * 3);
        objPlace(true, [{ x: PL.wheel.x, y: PL.wheel.y + 3.3, z: PL.wheel.z, r: 3 }], 'h42lift');
        const q = proj(PL.wheel.x, PL.wheel.y + 3.3, PL.wheel.z); if (q) { mt.style.left = `${Math.round(Math.min(W() - 40, q.x + 90))}px`; mt.style.top = `${Math.round(Math.max(60, q.y - 55))}px`; }
        { const past = s.y > J.P.win[1] + 0.02 && !s.done; dn.hidden = !past; if (past) { const r = mt.getBoundingClientRect(); dn.style.left = `${Math.round(r.left - 30)}px`; dn.style.top = `${Math.round(r.top + r.height * 0.2 * Math.max(0, 1.2 - s.y) - 6)}px`; } }   // ── build 53 ── (beside the meter, at the level's mark) ── /build 53 ──
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
    let lowT = 0, cx = 0, lev = 0, away54 = 0;
    if (st.props.ghost) { st.props.ghost.visible = !!J.state().ghost; st.props.ghost.position.set(S0.x, y1, S0.z); }
    // ── build 53 ── (§4 important 11) the place as a dashed outline on the ground under it — at every level — and "עוד X" by the bar: the way
    // still to go, in tefachim (6 to the amah) ── /build 53 ──
    const fp = (() => { try { const b = new THREE.Box3().setFromObject(s0), w = b.max.x - b.min.x, d = b.max.z - b.min.z; return Number.isFinite(w) && w > 0 ? { w, d } : { w: 4.2, d: 2 }; } catch (e) { return { w: 4.2, d: 2 }; } })();
    const more = el('h42-more', ''); more.hidden = true; st.ui.root.appendChild(more);
    const ghost53 = () => { const y = y1 - 0.88, c4 = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => proj(S0.x + (a * fp.w) / 2, y, S0.z + (b * fp.d) / 2)); return c4.every(Boolean) ? c4 : null; };
    const axis = () => { const a = proj(S0.x + cx, y1, S0.z), b = proj(S0.x + cx + 1, y1, S0.z); if (!a || !b) return null; const n = Math.hypot(b.x - a.x, b.y - a.y) || 1; return { x: a.x, y: a.y, ux: (b.x - a.x) / n, uy: (b.y - a.y) / n, ppm: n }; };
    line(label, `רמה ${L}`);
    if (st.ui.pad) st.ui.pad.classList.add('full');   // ── build 45 ── the lever's drag anywhere on the screen (the naive kid dragged on the stone, left of the half-screen pad: K45-P3's parent's hand)
    return {
      acting: true, J, kind: 'corner', axis, ready: () => lowT >= 1.4, el: [more], ghost53, more: () => (more.hidden ? '' : more.textContent),
      end() { if (st.ui.pad) st.ui.pad.classList.remove('full'); more.remove(); svgClear(); },
      down() {}, move() {},
      up(a) {
        if (lowT < 1.4) return;
        const dx = a.x - a.x0, dy = a.y - a.y0, px = Math.hypot(dx, dy), A = axis(), dir = A ? (dx * A.ux + dy * A.uy >= 0 ? 1 : -1) : 1;
        const abs0 = Math.abs(J.state().x), r = J.flick({ dragPx: px, dir }); if (r !== 'tap') { lev = 0.45 * dir; buzz42(r === 'over' ? 'retry' : r === 'home' ? 'settle' : 'mallet'); if (r === 'over') line('יותר מדי — גררו את המוט חזרה, בעדינות · המחשה', `רמה ${J.state().L}`); away54 = r === 'ok' && Math.abs(J.state().x) > abs0 + 1e-6 ? 2.4 : 0; }   // ── build 54 ── (a push away from the place: "לצד השני") ── /build 54 ──
      },
      frame(dt) {
        lowT += dt; const s = J.state(), k = Math.min(1, lowT / 1.4), e = k * k * (3 - 2 * k);
        cx += (s.x - cx) * Math.min(1, dt * (lowT < 1.4 ? 2.5 : 10));
        const yy = y0 + (y1 - y0) * e; if (s0) s0.position.set(S0.x + cx, yy, S0.z); craneRope(lowT < 1.6 ? yy + 0.9 : (st.props.jibY || yy) - 0.5);
        if (st.props.lever) { const lv = st.props.lever; lv.visible = lowT >= 1.4; lev *= Math.max(0, 1 - dt * 5); lv.position.set(S0.x + cx - 2.3, S0.y + 0.15, S0.z + 0.3); lv.rotation.z = -0.55 + lev; }
        objPlace(true, [{ x: S0.x + cx, y: y1, z: S0.z, r: 2.4 }], 'h42corner');
        if (!s.done && lowT > 1.4 && !(s.flicks && s.side > 0)) line(label, `רמה ${s.L} · דחיפות ${s.flicks}`);
        svgClear(); if (!s.done) { const G = ghost53(); if (G) svgAdd(`<polygon points="${G.map((v) => `${v.x},${v.y}`).join(' ')}" fill="rgba(255,214,110,.16)" stroke="#FFD66E" stroke-width="3" stroke-dasharray="9 6"/>`); }   // ── build 53 ── the place (§4 important 11) ── /build 53 ──
        { const lvTop = proj(S0.x + cx - 2.3, S0.y + 3.1, S0.z + 0.3), n = Math.max(1, Math.round(Math.abs(s.x) * 6)); more.hidden = s.done || lowT < 1.4 || !lvTop; away54 = Math.max(0, away54 - dt); if (!more.hidden) { const ps = proj(S0.x + cx, y1, S0.z), ph = proj(S0.x, y1, S0.z), arr = (ps && ph ? ph.x < ps.x : s.x > 0) ? '⬅' : '➡', tf = n === 1 ? 'טפח אחד' : `${n} טפחים`; more.textContent = away54 > 0 ? `לצד השני ${arr}` : s.x > 0 ? `${tf} חזרה ${arr}` : `עוד ${tf} ${arr}`;   /* ── build 54 ── (the coordinator's touch play of 53: the way to the place — an arrow by its side on the screen; one tefach in words) ── /build 54 ── */ more.style.left = `${Math.round(Math.max(60, Math.min(W() - 60, lvTop.x)))}px`; more.style.top = `${Math.round(Math.max(70, lvTop.y - 6))}px`; } }   // ── build 53 ── "עוד X" by the bar ── /build 53 ──
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
    const geo = () => { const bw = W() * LAT54.win, sz = bw / 10; return { x: 10, y: Math.max(50, H() * 0.17), sz, bw }; };   // ── build 54 ── (the board a window, 40 % of the width, in the top-left corner: the real lattice fills the frame — §4 important 14) ── /build 54 ──
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
    let sel = -1;   // ── build 54 ── (the piece last turned: shown in the real lattice's gap) ── /build 54 ──
    const live = () => { if (!pan || J.state().done) return; const pc = sel >= 0 ? J.state().tray[sel] : null; pan.draw(slot, pc ? F.tile46(pc.type, pc.r, pc.f) : null); };
    const paint = () => { items.forEach((b, i) => { const pc = J.state().tray[i]; b.innerHTML = `<svg width="40" height="40" viewBox="0 0 40 40">${svgTile(F.tile46(pc.type, pc.r, pc.f), 2, 2, 36, 4)}</svg>`; b.dataset.r = String(pc.r); b.dataset.f = String(pc.f); b.dataset.type = pc.type; }); live(); };
    paint();
    let tapT = null, tapI = -1, tapAt = 0, endT = -1;
    items.forEach((b, i) => dragItem(b, (drop) => {
      if (J.state().done) return false;
      if ((drop.px || 0) < F.DRAG42) {   // a tap: turn — two taps at once: flip
        const t = now();
        sel = i;
        if (tapI === i && t - tapAt < 0.34 && tapT) { clearTimeout(tapT); tapT = null; tapI = -1; J.flip(i); paint(); buzz42('tick'); }
        else { if (tapT) { clearTimeout(tapT); tapT = null; } tapI = i; tapAt = t; tapT = setTimeout(() => { tapT = null; tapI = -1; if (!J.state().done) { J.tap(i); paint(); buzz42('tick'); } }, 340); }
        return false;
      }
      sel = i; live();
      const R2 = slotRect(), G3 = gapAt(), on = (drop.x > R2.l - R2.s * 1.1 && drop.x < R2.l + R2.s * 2.1 && drop.y > R2.t - R2.s * 1.1 && drop.y < R2.t + R2.s * 2.1) || !!(G3 && Math.hypot(drop.x - G3.x, drop.y - G3.y) < Math.max(52, G3.s * 1.3));   /* (the window's slot is small — 26 px at 640: a finger's drop forgiven a cell round it; the naive kid K54-P-03 stood 75 s twice) */   // ── build 54 ── (or on the real lattice's gap) ── /build 54 ──
      const r = J.drop(i, { dragPx: drop.px, onSlot: on });
      if (r === 'ok') { buzz42('settle'); if (pan) pan.draw(null); pile.innerHTML = ''; endT = 1.1; grade(`lattice${k}`, J.state().q, { x: R2.l + R2.s / 2, y: R2.t }); return true; }
      if (r === 'wrong') { b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); buzz42('retry'); line(LINE42.latWrong, `${K.he} · טעויות ${J.state().mistakes}`); setTimeout(() => { if (!J.state().done) line(LINE42.lattice, `${K.he} · רמה ${L}`); }, 2400); }
      return false;
    }));
    const P = pan ? pan.P : PL.soreg;
    // ── build 54 ── the gap in the real lattice on the screen (the panel turned to the north: its first column on the camera's left) ── /build 54 ──
    function gapAt() { const y0 = gy(P.x, P.z), cw = PAN46.w / 8, ch = PAN46.h / 4, x = P.x + PAN46.w / 2 - (slot.c + 0.5) * cw, y = y0 + PAN46.h - (slot.r + 0.5) * ch, a = proj(x, y, P.z - 0.05), b = proj(x + cw, y, P.z - 0.05); return a ? { x: a.x, y: a.y, s: b ? Math.abs(b.x - a.x) : 30 } : null; }
    return {
      acting: true, J, kind: 'lattice', slotRect, gapAt, items: () => items, panel: k,
      down() {}, move() {}, up() {},
      // ── build 54 ── (§4 important 14: "a 2D board covering the world — a game inside a game") the real lattice fills the frame — front-on,
      // LAT54.fill of the width, a little right of and below the middle (the window over the top-left); he is out of its frame ── /build 54 ──
      view() { const c = camera(), tv = Math.tan((((c && c.fov) || 50) * Math.PI) / 360), th = tv * (W() / H()), D = PAN46.w / (2 * LAT54.fill * th), g0 = gy(P.x, P.z), gx = P.x + PAN46.w / 2 - (slot.c + 0.5) * (PAN46.w / 8), gyy = g0 + PAN46.h - (slot.r + 0.5) * (PAN46.h / 4), cx = gx + LAT54.gx * D * th, cy = gyy + LAT54.gy * D * tv; return { p: [cx, cy + D * 0.08, P.z - D], t: [cx, cy, P.z] }; },   // ── build 54 ── (the gap itself right of and below the middle — from the panel's middle a gap on its left half stood under the window: c54A-03P2) ── /build 54 ──
      frame(dt) {
        { const cw = PAN46.w / 8, ch = PAN46.h / 4, y0 = gy(P.x, P.z); objPlace(true, [{ x: P.x + PAN46.w / 2 - (slot.c + 0.5) * cw, y: y0 + PAN46.h - (slot.r + 0.5) * ch, z: P.z, r: 0.3 }], 'h46lat', [{ x: P.x, y: y0 + 0.85, z: P.z, r: 1.9 }]); }   // ── build 54 ── (the ring on the gap; the camera's thing the panel) ── /build 54 ──
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
    let i = 0, J = null, res = [], wait = -1, endT = -1, logT = 0;   // ── build 54 ── (logT: this log's time in hand — the level-1 name after 10 s, the peel hint after 4) ── /build 54 ──
    const book = S.book48 || (S.book48 = {}); R.logSeq = R.logSeq || [];
    line(LINE42.wood, `קורה 1 / ${n} · רמה ${L}`);
    if (st.ui.pad) st.ui.pad.classList.add('full');
    const next = () => { logT = 0; const t = B.draw(); S.bag48 = B.state(); R.logSeq.push(t); save42(S); J = F.createLog48(t, Math.random, L); if (st.props.log48) { const c = BARK48[J.state().species]; st.props.log48.material = mat(c[0], 0.95); st.props.log48.rotation.x = 0; } line(i === 0 ? LINE42.wood : LINE42.woodHow, `קורה ${i + 1} / ${n} · רמה ${L}`); };
    next();
    const geo = () => { const w = Math.min(W() * 0.66, 560), h = Math.max(64, Math.min(H() * 0.27, 120)); return { x: (W() - w) / 2, y: Math.max(56, H() * 0.2), w, h }; };
    const zones = () => { const zw = Math.min(170, W() * 0.3), zh = Math.max(52, H() * 0.17), y = H() - zh - 12; return { altar: { x: W() - zw - 12, y, w: zw, h: zh }, out: { x: 12, y, w: zw, h: zh } }; };   // ── build 55 ── (kasher ➡ right, pasul ⬅ left — the 08–16 spec's rule 13; "למערכה" stood on the left) ── /build 55 ──
    const inZ = (z, x, y) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h;
    const board = () => {
      const s2 = J.state(), G = geo(), c = BARK48[s2.species], f = s2.face, peeled = s2.peeled[f], Z = zones();
      let h = `<defs><linearGradient id="h48sl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6DA" stop-opacity=".42"/><stop offset=".45" stop-color="#FFF" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient><clipPath id="h48cl"><rect x="${G.x}" y="${G.y}" width="${G.w}" height="${G.h}" rx="${G.h / 2}"/></clipPath></defs>`;
      h += `<rect x="${G.x}" y="${G.y}" width="${G.w}" height="${G.h}" rx="${G.h / 2}" fill="${peeled ? '#E7CFA0' : c[0]}"/>`;
      h += `<g clip-path="url(#h48cl)">`;
      const nn = peeled ? 9 : c[2] + 3; for (let k = 0; k < nn; k++) { const yy = G.y + ((k + 0.5) / nn) * G.h, wv = peeled ? 2 : c[3] * 3; h += `<path d="M${G.x} ${yy} Q ${G.x + G.w * 0.3} ${yy + wv + (k % 2 ? 3 : -3)} ${G.x + G.w * 0.55} ${yy} T ${G.x + G.w} ${yy}" fill="none" stroke="${peeled ? '#C9A874' : c[1]}" stroke-width="${peeled ? 1.2 : 2.4}" opacity=".85"/>`; }
      const A = s2.at, T2 = J.T, onF = A.face === f, ax = G.x + A.u * G.w, ay = G.y + A.v * G.h, sz = A.size * G.h * 0.3;   // ── build 54 ── (0.18 → 0.3: the defect seen — §2 stage 05: "in four rounds not one defect drawn") ── /build 54 ──
      // ── build 54 ── the worm's exit holes in the bark over its galleries (as Phase B's wood): dark holes ringed with pale bore-dust — peel there ── /build 54 ──
      if (onF && s2.type === 'gallery' && !peeled) for (let k = 0; k < 6; k++) { const hx = ax + (k - 2.5) * sz * 0.7, hy = ay + Math.sin(k * 2.1) * sz * 0.5; h += `<circle cx="${hx}" cy="${hy}" r="${Math.max(3, sz * 0.24)}" fill="#E8D6A8" opacity=".7"/><circle cx="${hx}" cy="${hy}" r="${Math.max(1.8, sz * 0.12)}" fill="#1E140C"/>`; }
      if (onF && s2.type === 'holes') for (let k = 0; k < 7; k++) { const a2 = A.turn + k * 0.9, r2 = sz * (0.3 + (k % 3) * 0.35); h += `<circle cx="${ax + Math.cos(a2) * r2 * 1.6}" cy="${ay + Math.sin(a2) * r2}" r="${Math.max(3.2, sz * 0.26)}" fill="#E8D6A8" opacity=".55"/>`; }
      if (onF && s2.type === 'holes') for (let k = 0; k < 7; k++) { const a2 = A.turn + k * 0.9, r2 = sz * (0.3 + (k % 3) * 0.35); h += `<circle cx="${ax + Math.cos(a2) * r2 * 1.6}" cy="${ay + Math.sin(a2) * r2}" r="${Math.max(1.6, sz * 0.14)}" fill="#1E140C"/>`; }
      if (onF && s2.type === 'gallery' && peeled) for (let k = 0; k < 3; k++) { const yy = ay + (k - 1) * sz * 0.8; h += `<path d="M${ax - sz * 2.4} ${yy} q ${sz * 0.6} ${-sz * 0.5} ${sz * 1.2} 0 t ${sz * 1.2} 0 t ${sz * 1.2} 0 t ${sz * 1.2} 0" fill="none" stroke="#5B3A1C" stroke-width="${Math.max(2.5, sz * 0.22)}" stroke-linecap="round"/>`; }
      if (onF && s2.type === 'knot') h += `<ellipse cx="${ax}" cy="${ay}" rx="${sz * 1.1}" ry="${sz * 0.7}" fill="#4A3524"/><ellipse cx="${ax}" cy="${ay}" rx="${sz * 0.7}" ry="${sz * 0.42}" fill="none" stroke="#7A5C40" stroke-width="2"/><ellipse cx="${ax}" cy="${ay}" rx="${sz * 0.3}" ry="${sz * 0.2}" fill="#2A1C10"/>`;
      if (onF && s2.type === 'scar') h += `<path d="M${ax - sz * 1.8} ${ay} q ${sz * 1.8} ${-sz * 1.1} ${sz * 3.6} 0 q ${-sz * 1.8} ${sz * 1.1} ${-sz * 3.6} 0" fill="#B9A586" stroke="#8A7458" stroke-width="1.5"/>`;
      if (onF && s2.type === 'drop' && !s2.wiped) h += `<path d="M${ax} ${ay - sz} q ${sz} ${sz * 0.2} ${sz * 0.6} ${sz} q ${-sz * 0.4} ${sz * 0.6} ${-sz * 1.1} ${sz * 0.1} q ${-sz * 0.7} ${-sz * 0.6} ${sz * 0.5} ${-sz * 1.1}" fill="#F4F1E6" stroke="#9A988C" stroke-width="1.2"/><circle cx="${ax + sz * 0.2}" cy="${ay}" r="${sz * 0.18}" fill="#5A5A50"/>`;
      h += `<rect x="${G.x}" y="${G.y}" width="${G.w}" height="${G.h}" fill="url(#h48sl)"/></g>`;   // (the side light)
      h += `<ellipse cx="${G.x + G.w}" cy="${G.y + G.h / 2}" rx="${G.h * 0.2}" ry="${G.h / 2}" fill="#D8BC8A" stroke="${c[1]}" stroke-width="3"/>`;
      for (let r = 1; r <= 3; r++) h += `<ellipse cx="${G.x + G.w}" cy="${G.y + G.h / 2}" rx="${G.h * 0.2 * r / 4}" ry="${(G.h / 2) * r / 4}" fill="none" stroke="#B8955E" stroke-width="1"/>`;
      h += leafSvg(s2.species, G.x + 10, G.y + 6, Math.max(1, G.h / 70));
      if (s2.decided != null || (L <= 1 && logT > 10)) h += `<text x="${G.x + 14}" y="${G.y + G.h + 18}" font-size="13" font-weight="800" fill="#FFF4DC" stroke="#2A1804" stroke-width="3" paint-order="stroke">${esc(F.WOOD48[s2.species].he)}</text>`;   // ── build 54 ── (the name only after the decision — or a level-1 hint after 10 s: shown at once it solved the puzzle) ── /build 54 ──
      // ── build 54 ── the peel hint: a hand drawn along the log with "קלפו", while this face is unpeeled after 4 s (the galleries are under the bark) ── /build 54 ──
      if (s2.decided == null && !peeled && logT > 4 && (s2.type === 'gallery' || L <= 1)) { const u = (logT * 0.6) % 1, hx = G.x + G.w * (0.2 + 0.6 * u), hy = G.y + G.h * 0.55; h += `<text x="${hx}" y="${hy + 14}" font-size="34" text-anchor="middle">👆</text><text x="${hx}" y="${hy - G.h * 0.32}" font-size="16" font-weight="900" text-anchor="middle" fill="#FFE6A0" stroke="#2A1804" stroke-width="3" paint-order="stroke">קלפו ⟷</text>`; }
      for (const m of s2.marks) if (m.face === f) h += `<circle cx="${G.x + m.u * G.w}" cy="${G.y + G.h / 2}" r="${G.h * 0.32}" fill="none" stroke="#FFD66E" stroke-width="3" stroke-dasharray="5 4"/>`;
      for (let q = 0; q < 4; q++) h += `<circle cx="${W() / 2 + (q - 1.5) * 16}" cy="${G.y + G.h + 14}" r="5" fill="${q === f ? '#FFD66E' : 'rgba(255,255,255,.35)'}" stroke="#2A1804" stroke-width="1"/>${s2.peeled[q] ? `<circle cx="${W() / 2 + (q - 1.5) * 16}" cy="${G.y + G.h + 14}" r="2" fill="#E7CFA0"/>` : ''}`;
      for (const [k2, z, t2, col] of [['altar', Z.altar, 'למערכה ➡', 'rgba(90,150,70,.78)'], ['out', Z.out, '⬅ לא למזבח', 'rgba(170,70,50,.78)']]) h += `<rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="12" fill="${col}" stroke="#FFF4DC" stroke-width="2" data-z="${k2}"/><text x="${z.x + z.w / 2}" y="${z.y + z.h / 2 + 6}" font-size="16" font-weight="900" text-anchor="middle" fill="#FFF">${t2}</text>`;
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
        logT += dt;
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
    // ── build 54 ── (§2 stage 05: "the beams are buttons 'קורה ×3', not beams in the world") the beams lie on the ground by the wall — the two
    // corner beams with their return, the three plain ones — and the finger takes one where it lies (a clear handle over it, touch40's way);
    // the corner shows by its place, no label ── /build 54 ──
    const gb = []; { const bm = mat('#8A6038', 0.8); for (let k = 0; k < 5; k++) { const kd = k < 2 ? 'corner' : 'next', g2 = new THREE.Group(), b1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.1, 1.1), bm); g2.add(b1); if (kd === 'corner') { const b2 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 2.4), bm); b2.position.set(1.55, 0, 1.2); g2.add(b2); } const x = W2.x - 9 + k * 4.6, z = W2.z + sz * 3.2; g2.position.set(x, gy(x, z) + 0.55, z); if (st.props.root) st.props.root.add(g2); gb.push({ kd, m: g2, used: false }); } }
    const chips = ['corner', 'next'].map((kd) => { const b = el('h42-it h48-beam', '', 'button'); b.type = 'button'; b.dataset.kind = kd; b.setAttribute('aria-label', kd === 'corner' ? 'קורת פינה' : 'קורה'); b.style.cssText = 'position:fixed;z-index:46;pointer-events:auto;width:70px;height:46px;min-width:0;padding:0;background:transparent;box-shadow:none;border:2px dashed rgba(255,214,110,.85);border-radius:12px;color:transparent'; st.ui.root.appendChild(b); return b; });
    const nextOf = (kd) => gb.find((q) => q.kd === kd && !q.used);
    const paint = () => chips.forEach((b) => { const kd = b.dataset.kind; b.textContent = ''; b.style.display = left[kd] > 0 && cur < 0 ? '' : 'none'; });
    paint();
    chips.forEach((b) => dragItem(b, (drop) => {
      if (cur >= 0 || J.state().done) return false; let on = -1, bd = 1e9; for (let i = 0; i < 5; i++) { const p2 = sockAt(i); if (!p2) continue; const d = Math.hypot(drop.x - p2.x, drop.y - p2.y); if (d < bd) { bd = d; on = i; } }
      if (bd > Math.max(56, H() * 0.15)) on = -1; const kd = b.dataset.kind, r = J.place(on, kd, { dragPx: drop.px });
      if (r === 'ok') { const g3 = nextOf(kd); if (g3) { g3.used = true; g3.m.visible = false; } left[kd]--; cur = on; const m = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.5, 4.2), mat('#8A6038', 0.8)); m.position.set(W2.x + SOCK48[on], W2.y + 11.4, W2.z + sz * 3.4); m.rotation.y = 0.18 * (on % 2 ? 1 : -1); st.props.root.add(m); beams[on] = m; paint(); line(LINE42.beamPush, `רמה ${L}`); buzz42('settle'); return true; }
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
        const r = J.push(cur, a.x - a.x0, a.y - a.y0, 0, -1);   // (into the wall: UP the screen — from below the beam's own way in ran DOWN the screen, and the naive kid pushed up 200 times: K48-P2)
        if (r === 'lock') { anim = { i: cur, t: 0 }; o.sound && o.sound('wood'); buzz42('settle'); }
        else if (r === 'rim') { anim = { i: cur, t: 0, rim: true }; buzz42('retry'); line(LINE42.beamRim, `רמה ${L}`); }
      },
      view() { const D = Math.max(needD() + 7.5, 30), cx = cur >= 0 ? W2.x + SOCK48[cur] : W2.x;   /* (needD from him: he stands 5.5 amot off the wall — at needD + 2 from the wall his figure was 47 % of the height at 640: c54A-05BP) */ return { p: [cx + (cur >= 0 ? 0 : 4), W2.y + 6.2, W2.z + sz * D], t: [cx, W2.y + 6.2, W2.z] }; },   // ── build 54 ── (level, at the middle of the sockets' height, 30 amot off (K54-P-05 and c54A-05W: from 26, looking up, the beams on the ground lay on the frame's bottom edge, their handles half off it, him cut at the chest): him and the beams on the ground in the frame, the sockets over them — "him tiny at the bottom") ── /build 54 ──   // (ש3: from below in the court, looking up at the sockets; square to the beam being pushed — its way in straight up the screen: the naive kid K48-P pushed up 236 times at the corner sockets, whose way in leaned 30°)
      frame(dt) {
        objPlace(true, [{ x: W2.x, y: W2.y + 11, z: W2.z, r: 12 }], 'h48beams');
        for (const b of chips) { const g3 = nextOf(b.dataset.kind), q = g3 ? proj(g3.m.position.x, g3.m.position.y, g3.m.position.z) : null; if (q && b.style.display !== 'none') { b.style.left = `${Math.round(Math.max(4, Math.min(W() - 74, q.x - 35)))}px`; b.style.top = `${Math.round(Math.max(56, Math.min(H() - 50, q.y - 23)))}px`; } }   // ── build 54 ── (the handle over the beam where it lies) ── /build 54 ──
        if (anim) { anim.t += dt; const m = beams[anim.i]; if (m) { if (anim.rim) { m.position.z = W2.z + sz * (3.4 - 0.6 * Math.sin(Math.min(1, anim.t / 0.4) * Math.PI)); if (anim.t > 0.45) { anim = null; } } else { const u = Math.min(1, anim.t / 0.35); m.position.z = W2.z + sz * (3.4 - 1.5 * u); m.rotation.y *= 1 - u; if (u >= 1) { anim = null; cur = -1; paint(); if (!J.state().done) line(LINE42.beams, `רמה ${L}`); } } } }
        svgClear();
        for (let i = 0; i < 5; i++) { const p2 = sockAt(i); if (!p2) continue; const st2 = J.state(), lk = st2.locked[i], cor = st2.kinds[i] === 'corner'; svgAdd(`<rect x="${p2.x - 12}" y="${p2.y - 14}" width="24" height="28" rx="4" fill="${lk ? 'rgba(232,181,49,.55)' : 'rgba(0,0,0,.25)'}" stroke="${cur === i ? '#FFF' : '#FFD66E'}" stroke-width="${cur === i ? 3 : 2}"/>${cor && !lk ? '' : ''}`); }
        if (cur >= 0 && !anim && J.state().L <= 1) { const p1 = sockAt(cur); if (p1) svgAdd(`<line x1="${p1.x}" y1="${p1.y + 70}" x2="${p1.x}" y2="${p1.y + 18}" stroke="#FFD66E" stroke-width="4" stroke-dasharray="6 5"/><text x="${p1.x}" y="${p1.y + 92}" font-size="22" text-anchor="middle" fill="#FFD66E">⬆</text>`); }   // (level 1: the way in — up)
        if (J.state().done && endT < 0 && !anim) { endT = 1.1; if (onDone) onDone(J.state().q); else grade('beams', J.state().q, sockAt(2)); }
        if (endT >= 0) { endT -= dt; if (endT <= 0) { svgClear(); return true; } }
        return false;
      },
      end() { pile.innerHTML = ''; svgClear(); chips.forEach((b) => b.remove()); gb.forEach((q) => { if (q.m.parent) q.m.parent.remove(q.m); }); },
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
    // ── build 54 ── (§2 stage 05: "a 2D diagram on the screen — you don't see the gallery") the joint itself, on the gallery in the wall: the
    // plank's end over the beam, its tenon slid into the beam's mortise, the peg driven down through both by the mallet — a macro on it
    // (ש4), the gesture as before (along the arrow, then taps). The joint i is the i-th plank's end ── /build 54 ──
    const jointAt = () => ({ x: W2.x - 8.25 + i * 5.5 + 2.75, y: W2.y + 12.25, z: W2.z + sz * 4.5 });   // (at the plank's outer edge, its end: from over the plank the first AFTER page saw only its boards)
    const D54 = (() => { const g = new THREE.Group(), wd = mat('#C79E6C', 0.8), dk = mat('#2E2014', 0.95), pg = mat('#D8C098', 0.8), gold = mat('#E8B531', 0.6);
      const beamEnd = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.6), mat('#8A6038', 0.8)); beamEnd.position.set(0.55, -0.6, 0); g.add(beamEnd);
      const mort = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.3, 0.5), dk); mort.position.set(0.25, -0.3, 0); g.add(mort);
      const tenon = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.26, 0.42), wd); g.add(tenon);
      const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.7, 10), pg); g.add(peg);
      const mallet = new THREE.Group(), head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.26, 0.26), mat('#7A5532', 0.8)), handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), mat('#B08A5E', 0.8)); handle.rotation.z = Math.PI / 2; handle.position.x = 0.62; mallet.add(head, handle); g.add(mallet);
      if (st.props.root) st.props.root.add(g); return { g, tenon, peg, mallet, gold, pg, strike: 0 };
    })();
    const place54 = () => { const J3 = jointAt(), s2 = P.state(); D54.g.position.set(J3.x, J3.y, J3.z); D54.tenon.position.set(s2.tenon ? 0.2 : -0.9, -0.3, 0); D54.peg.position.set(0.25, 0.2 - s2.depth * 0.45, 0); D54.peg.material = s2.locked ? D54.gold : D54.pg; D54.peg.visible = s2.tenon; D54.strike = Math.max(0, D54.strike - 0.06); D54.mallet.position.set(0.25 + 0.05, 0.75 + D54.strike * 0.5 - s2.depth * 0.45 + 0.1, 0); D54.mallet.rotation.z = D54.strike * 0.9; D54.mallet.visible = s2.tenon; };
    const geo = () => { const a = proj(jointAt().x - 1.4, jointAt().y + 0.9, jointAt().z), b = proj(jointAt().x + 1.4, jointAt().y - 1.2, jointAt().z); const x = a && b ? Math.min(a.x, b.x) : W() * 0.25, y = a && b ? Math.min(a.y, b.y) : H() * 0.2; return { x, y, w: a && b ? Math.abs(b.x - a.x) : W() * 0.5, h: a && b ? Math.abs(b.y - a.y) : H() * 0.44 }; };
    const arrow = () => { const J3 = jointAt(), a = proj(J3.x - 0.9, J3.y - 0.3, J3.z), b = proj(J3.x + 0.2, J3.y - 0.3, J3.z); if (!a || !b) { const G = geo(); return { x0: G.x + G.w * 0.12, y0: G.y + G.h * 0.62, x1: G.x + G.w * 0.5, y1: G.y + G.h * 0.62 }; } return { x0: a.x, y0: a.y, x1: b.x, y1: b.y }; };
    const det = () => {
      const s2 = P.state(), A = arrow(); let h = '';
      if (!s2.tenon) h += `<line x1="${A.x0}" y1="${A.y0}" x2="${A.x1}" y2="${A.y1}" stroke="#FFD66E" stroke-width="5" stroke-dasharray="8 6"/><text x="${A.x1 + (A.x1 > A.x0 ? 16 : -16)}" y="${A.y1 + 8}" font-size="26" text-anchor="middle" fill="#FFD66E" stroke="#2A1804" stroke-width="2" paint-order="stroke">${A.x1 > A.x0 ? '➜' : '⬅'}</text>`;
      else { const G = geo(); for (let q = 0; q < 6; q++) h += `<rect x="${G.x + 6 + q * 12}" y="${G.y + G.h - 6 - q * 4}" width="8" height="${6 + q * 4}" fill="${s2.depth >= (q + 1) / 6 ? '#FFD66E' : 'rgba(255,255,255,.25)'}"/>`; }   // (the peg's way in — the pitch's meter)
      if (flash > 0) { const q = proj(jointAt().x + 0.25, jointAt().y, jointAt().z); if (q) h += `<circle cx="${q.x}" cy="${q.y}" r="${30 + (1 - flash) * 30}" fill="none" stroke="#FFD66E" stroke-width="4" opacity="${flash}"/>`; }
      return h;
    };
    return {
      acting: true, fullPad: true, kind: 'pegs', get P() { return P; }, i: () => i, n, arrow, geo,
      down() {}, move() {},
      up(a) {
        const s2 = P.state(); if (s2.done || endT >= 0) return; const dx = a.x - a.x0, dy = a.y - a.y0, A = arrow();
        if (!s2.tenon) { const r = P.tenon(dx, dy, A.x1 - A.x0, A.y1 - A.y0); if (r === 'in') { buzz42('settle'); o.sound && o.sound('wood'); line(LINE42.pegTap, `יתד ${i + 1} / ${n} · רמה ${L}`); } else if (r === 'rim') { buzz42('retry'); line('השגם נעצר — לאורך החץ · המחשה', `רמה ${L}`); } return; }
        if (Math.hypot(dx, dy) >= F.DRAG42) return;
        D54.strike = 1; const r = P.tap(); if (r === 'lock') { flash = 1; tone(P.pitch(), 0.22, 'square'); o.sound && o.sound('wood'); buzz42('settle'); } else if (r === 'split') { buzz42('retry'); o.sound && o.sound('crack'); line(LINE42.pegSplit, `יתד ${i + 1} / ${n}`); } else if (r === 'in') { tone(P.pitch()); buzz42('tick'); }
      },
      ownView: () => true,
      view() { const J3 = jointAt(); return { p: [J3.x + 1.3, J3.y + 0.35, J3.z + sz * 3.6], t: [J3.x + 0.1, J3.y - 0.25, J3.z] }; },   // ── build 54 ── (the macro on the joint, from the court) ── /build 54 ──
      frame(dt) {
        { const J3 = jointAt(); objPlace(true, [{ x: W2.x, y: W2.y + 12, z: W2.z + sz * 2, r: 9 }], 'h48pegs', [{ x: J3.x, y: J3.y - 0.25, z: J3.z, r: 0.6 }]); }
        place54();
        P.step(dt); flash = Math.max(0, flash - dt * 1.6);
        svgClear(); if (endT < 0) svgAdd(det());
        if (P.state().done && endT < 0) { qs2.push(P.state().q); i++; if (i >= n) { const q = qs2.reduce((a2, b2) => a2 + b2, 0) / qs2.length; endT = 1.1; svgClear(); if (onDone) onDone(q); else grade('pegs', q, { x: W() / 2, y: H() * 0.35 }); } else { P = F.createPeg48(L); line(LINE42.tenon, `יתד ${i + 1} / ${n} · רמה ${L}`); } }
        if (endT >= 0) { endT -= dt; if (endT <= 0) return true; }
        return false;
      },
      end() { svgClear(); try { if (D54.g.parent) D54.g.parent.remove(D54.g); } catch (e) { /* */ } },
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
  /* ── build 49 ── stage 06's acts ── */
  /** a note (the steps' tune): a plucked string — the base and its octave, fading (WebAudio; silent where there is none) */
  let AC49 = null;
  function tone49(f, dur = 0.55, off = 0) {
    try {
      if (!AC49) { const C = globalThis.AudioContext || globalThis.webkitAudioContext; if (!C) return; AC49 = new C(); }
      if (AC49.state === 'suspended') AC49.resume();
      const t0 = AC49.currentTime, g = AC49.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); g.connect(AC49.destination);
      for (const [m, a, ty] of [[1, 1, 'triangle'], [2, 0.35, 'sine'], [off ? 1.06 : 3, off ? 0.8 : 0.12, off ? 'sawtooth' : 'sine']]) { const os = AC49.createOscillator(), og = AC49.createGain(); os.type = ty; os.frequency.value = f * m; og.gain.value = a; os.connect(og); og.connect(g); os.start(t0); os.stop(t0 + dur + 0.05); }
    } catch (e) { /* no sound */ }
  }
  /** THE VOYAGE (v2 §11): the doors' story, once — here he is Nicanor (voyage49.js); its grade is the storm's */
  function mkVoyage49() {
    const L = famL('lift');
    return createVoyage49({ scene: scene(), camTo, line, root: st.ui.root, doc, W, H, buzz: buzz42, sound: o.sound, emit: o.emit, timeOfDay: o.timeOfDay, stages, L, seen: !!R.voySeen,
      done(r) {
        R.voySeen = 1; R.voy = { rating: r.rating || null, crossings: r.crossings | 0, replays: r.replays | 0, skipped: !!r.skipped }; save42(S);
        try { if (o.restoreTime) o.restoreTime(); } catch (e) { /* */ }
        if (!r.skipped && r.q != null) grade('voyage', r.q, { x: W() / 2, y: H() * 0.4 });
        o.emit && o.emit('h49voyage', R.voy);
      } });
  }
  const doorView = (cz = 0) => { const N = PL.ng, D = Math.max(needD() + 2, 10.8 / tanV()); return { p: [N.x + D * 0.94, N.y + 6, N.z + cz + D * 0.34], t: [N.x, N.y + 10.5, N.z + cz] }; };   // (ש5 low, from the court: the door fills the screen)
  /** LIFT (מוט ויתדות): a long drag down on the lever — the leaf rises a notch; at its top a tap drives a wedge under; let go; again */
  function mkLever49() {
    const L = famL('lift'), J = F.createLever49(L), N = PL.ng, piv = st.props.leafS, pole = st.props.pole49, n = J.state().n, zc = N.z + LEAF49.pz - LEAF49.w / 2;
    let u = 0, endT = -1, press = 0; const top = () => J.state().notch * LEAF49.rise;
    leafAt(piv, 0); piv.rotation.set(0, 0, 0); if (st.props.wedges49) { st.props.wedges49.clear(); st.props.wedges49.visible = true; } st.leverTop = n * LEAF49.rise;
    if (st.props.sock49) st.props.sock49.position.y = N.y + LEAF49.h + 0.7 + n * LEAF49.rise - 0.15;   // (the lintel's socket: where the top pin's tip ends, raised)
    line(LINE42.lever, `רמה ${L}`); if (st.ui.pad) st.ui.pad.classList.add('full');
    const wedge = () => { const k = J.state().notch, w = new THREE.Mesh(new THREE.BoxGeometry(0.7, LEAF49.rise, 1.1), mat('#5A4026', 0.9)); w.position.set(0, (k - 0.5) * LEAF49.rise, 0); st.props.wedges49.add(w); };
    return {
      acting: true, fullPad: true, J, kind: 'lever49', press: () => press,
      down() {}, move(a) { press = Math.max(0, Math.min(1, (a.y - a.y0) / (F.LEVER49.long * H()))); },
      up(a) {
        const dy = a.y - a.y0, mv = Math.max(a.moved || 0, Math.hypot(a.x - a.x0, dy)); press = 0;
        if (mv < F.DRAG42) { const r = J.wedge(); if (r === 'ok' || r === 'done') { wedge(); buzz42('mallet'); o.sound && o.sound('wedge'); if (r === 'ok') line(LINE42.lever, `יתד ${J.state().notch}/${n} · רמה ${L}`); } return; }
        const r = J.pump(dy, H());
        if (r === 'short') { buzz42('retry'); line(LINE42.leverShort, `רמה ${L}`); }
        else if (r === 'up') { buzz42('creak'); o.sound && o.sound('creak'); line(LINE42.leverTop, `רמה ${L}`); }
      },
      view() { return doorView(1.2); },
      frame(dt) {
        if (J.step(dt) === 'sank') { buzz42('retry'); o.sound && o.sound('thud'); line(LINE42.leverSank, `רמה ${L}`); }
        const s = J.state(), want = top() + (s.up ? LEAF49.rise : 0); u += (want - u) * Math.min(1, dt * 9); leafAt(piv, u);
        if (pole) pole.rotation.z = s.up ? -0.12 : 0.22 - 0.34 * press;
        objPlace(true, [{ x: N.x + 3, y: N.y + 3, z: zc, r: 6 }], 'h49lever');
        svgClear();
        const sk = st.props.sock49 ? proj(N.x, st.props.sock49.position.y, N.z + LEAF49.pz) : null, pin = proj(N.x, piv.position.y + LEAF49.h + 0.7, N.z + LEAF49.pz);
        if (sk && pin) svgAdd(`<line x1="${pin.x}" y1="${pin.y}" x2="${sk.x}" y2="${sk.y}" stroke="#FFD66E" stroke-width="3" stroke-dasharray="5 5"/><circle cx="${sk.x}" cy="${sk.y}" r="11" fill="none" stroke="#FFD66E" stroke-width="3"/>`);
        if (s.up && !s.done) { const w = proj(N.x + 0.3, N.y + s.notch * LEAF49.rise, zc), k = Math.max(0, 1 - s.upT / s.win); if (w) svgAdd(`<circle cx="${w.x}" cy="${w.y}" r="30" fill="rgba(255,214,110,.25)" stroke="#FFD66E" stroke-width="4" stroke-dasharray="${(k * 188).toFixed(1)} 188" transform="rotate(-90 ${w.x} ${w.y})"/><text x="${w.x}" y="${w.y - 40}" font-size="18" font-weight="900" text-anchor="middle" fill="#FFF4DC" stroke="#2A1804" stroke-width="3" paint-order="stroke">הקישו!</text>`); }
        else if (!s.done && s.L <= 1) { const x = W() * 0.82, y1 = H() * 0.26, y2 = y1 + F.LEVER49.long * H(); svgAdd(`<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#FFD66E" stroke-width="7" stroke-linecap="round" opacity=".55"/><path d="M${x - 12} ${y2 - 12} L${x} ${y2 + 4} L${x + 12} ${y2 - 12}" fill="none" stroke="#FFD66E" stroke-width="6" opacity=".7"/><circle cx="${x}" cy="${y1 + (y2 - y1) * press}" r="13" fill="#FFF4DC" opacity=".8"/>`); }
        if (s.done && endT < 0) { grade('lever', J.result().q, sk || { x: W() / 2, y: H() * 0.3 }); buzz42('settle'); endT = 1.3; }
        if (endT >= 0) { endT -= dt; if (endT <= 0) { svgClear(); return true; } }
        return false;
      },
      end() { svgClear(); if (st.ui.pad) st.ui.pad.classList.remove('full'); },
    };
  }
  /** FIT: the leaf lowered — its pin into the socket (a drag straight down; its angle), then a flick swings it (bound — the wedge); fam42 LEAF47.
   *  The crews hang the other leaf; the gate stays bronze — "מפני שנעשו בהן נסים" */
  function mkHang49() {
    const LF = famL('fit'), J = F.createLeaf47(LF), N = PL.ng, piv = st.props.leafS, other = st.props.leafN, U0 = st.leverTop || 4 * LEAF49.rise; let anim = null, endT = -1, flickT0 = 0, phase = 'pin', said = 0;
    const hang = () => { piv.rotation.set(0, 0, 0); leafAt(piv, U0); };
    hang(); if (st.props.wedges49) st.props.wedges49.visible = true; line(LINE42.hang, `רמה ${LF}`);
    if (st.ui.pad) st.ui.pad.classList.add('full');
    const pile = st.ui.pile; pile.innerHTML = ''; pile.hidden = false;
    const wedgeB = el('h42-it h47-wedge', '◢ טריז', 'button'); wedgeB.type = 'button'; wedgeB.hidden = true; wedgeB.style.display = 'none'; pile.appendChild(wedgeB);
    wedgeB.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); if (J.wedge() === 'ok') { wedgeB.hidden = true; wedgeB.style.display = 'none'; buzz42('mallet'); o.sound && o.sound('wedge'); anim = { k: 'shut', t: 0, from: J.state().open || 0.3 }; line(LINE42.leafSwing, `רמה ${LF}`); } });
    const openOf = (v) => -1.25 * v;
    return {
      acting: true, fullPad: true, J, kind: 'hang49', phase: () => phase, wedgeB, socket: () => proj(N.x, N.y + 0.05, N.z + LEAF49.pz), pinAt: () => proj(N.x, piv.position.y - 0.7, N.z + LEAF49.pz),
      down() { flickT0 = now(); }, move() {},
      up(a) {
        const dx = a.x - a.x0, dy = a.y - a.y0;
        if (phase === 'pin' && !anim) { const r = J.pin(dx, dy); if (r === 'rim') { anim = { k: 'rim', t: 0, tilt: Math.sign(dx || 1) * 0.12 }; buzz42('retry'); line(LINE42.leafRim, `זווית ${Math.round(J.state().angle)}° · רמה ${LF}`); } else if (r === 'seated') { anim = { k: 'seat', t: 0 }; buzz42('settle'); o.sound && o.sound('thud'); if (st.props.wedges49) st.props.wedges49.visible = false; } return; }
        if (phase === 'swing' && !anim) { const r = J.flick(Math.abs(dx), Math.max(0.01, now() - flickT0));
          if (r === 'binds') { anim = { k: 'bind', t: 0 }; buzz42('retry'); o.sound && o.sound('grind'); line(LINE42.leafBind, `רמה ${LF}`); wedgeB.hidden = false; wedgeB.style.display = ''; }
          else if (r === 'ok' || r === 'slam') { anim = { k: r, t: 0 }; o.sound && o.sound('creak'); }
          else if (r === 'weak') anim = { k: 'weak', t: 0 }; }
      },
      view() { return doorView(1.2); },
      frame(dt) {
        objPlace(true, [{ x: N.x, y: N.y + 9, z: N.z + 2.3, r: 6 }], 'h49hang');
        svgClear();
        if (phase === 'pin' && J.state().L <= 1 && !anim) { const a2 = this.pinAt(), b2 = this.socket(); if (a2 && b2) svgAdd(`<line x1="${a2.x}" y1="${a2.y}" x2="${b2.x}" y2="${b2.y}" stroke="#FFD66E" stroke-width="3" stroke-dasharray="6 5"/><circle cx="${b2.x}" cy="${b2.y}" r="9" fill="none" stroke="#FFD66E" stroke-width="3"/>`); }
        if (anim) {
          anim.t += dt; const t = anim.t;
          if (anim.k === 'rim') { const k = t < 0.3 ? t / 0.3 : Math.max(0, 1 - (t - 0.5) / 0.4); leafAt(piv, U0 - (U0 - LEAF49.seat) * 0.6 * k); piv.rotation.x = anim.tilt * k; if (t > 0.9) { anim = null; hang(); } }
          else if (anim.k === 'seat') { const k = Math.min(1, t / 0.45); leafAt(piv, U0 + (LEAF49.seat - U0) * k); if (k >= 1) { anim = null; phase = 'swing'; line(LINE42.leafSwing, `רמה ${LF}`); } }
          else if (anim.k === 'bind') { piv.rotation.y = openOf(0.3 * Math.min(1, t / 0.35)); if (t > 0.4) anim = null; }
          else if (anim.k === 'shut') { piv.rotation.y = openOf(anim.from * Math.max(0, 1 - t / 0.5)); if (t > 0.5) anim = null; }
          else if (anim.k === 'weak') { piv.rotation.y = openOf(0.15 * Math.sin(Math.min(1, t / 0.8) * Math.PI)); if (t > 0.8) { anim = null; line('חזק מעט יותר — הנפה מהירה · המחשה', `רמה ${LF}`); } }
          else { const hard = anim.k === 'slam', T1 = 0.8, T2 = hard ? 0.35 : 1.7; const v = t < T1 ? Math.sin((t / T1) * Math.PI / 2) : Math.max(0, 1 - (t - T1) / T2); piv.rotation.y = openOf(v);
            if (t > T1 + T2 && !this.graded) { this.graded = 1; if (hard) { buzz42('retry'); o.sound && o.sound('thud'); } else o.sound && o.sound('settle'); grade('hang', J.state().q, proj(N.x, N.y + 12, N.z + 2)); endT = 4.2; if (other) { other.visible = true; other.rotation.set(0, 0, 0); leafAt(other, LEAF49.seat); } } }
        }
        if (endT >= 0) { endT -= dt; if (endT < 3.0 && !said) { said = 1; line(LINE42.ungilded); o.emit && o.emit('h49ungilded', {}); } if (endT <= 0) return true; }
        return false;
      },
      end() { pile.innerHTML = ''; svgClear(); if (st.ui.pad) st.ui.pad.classList.remove('full'); },
    };
  }
  /** PLACE (מעלות בחצי גורן): each curved step dragged onto its arc — on the line it lies level and its note rings true; off it, tilted and
   *  off-key, and back to the pile; 15 steps, 15 notes; at the end the Levites stand on them and sing the tune he built (מדות ב, ה) */
  const ray49 = new THREE.Raycaster(), ndc49 = new THREE.Vector2();
  function onPlane49(x, y, h) { const c = camera(); if (!c) return null; ndc49.set((x / W()) * 2 - 1, -(y / H()) * 2 + 1); try { ray49.setFromCamera(ndc49, c); } catch (e) { return null; } const r = ray49.ray; if (Math.abs(r.direction.y) < 1e-4) return null; const t = (h - r.origin.y) / r.direction.y; return t > 0 ? { x: r.origin.x + r.direction.x * t, z: r.origin.z + r.direction.z * t } : null; }
  function mkSteps49(nSteps = F.STEPS49.n, part = 'steps') {
    const L = famL('place'), J = F.createSteps49(L, nSteps), A = PL.arc, G2 = st.props.steps49, pile = st.ui.pile; let endT = -1, sing = null, ghost = null, drop = null;
    hole49('steps'); if (st.props.pole49) st.props.pole49.visible = false; if (st.props.fulc49) st.props.fulc49.visible = false; if (st.props.wedges49) st.props.wedges49.visible = false;
    if (G2) G2.clear();
    const jOf = (k) => 14 - k, Rout = (j) => 6.5 + 0.5 * j, Rmid = (j) => 6.25 + 0.5 * j, topOf = (k) => 0.5 * (k + 1);   // (k: laid from the bottom, 0; j: the model's index from the top)
    const stoneM = [mat('#F1E7D0', 0.85), mat('#D9CBAE', 0.88)];   // (alternate shades: from above, the fifteen treads read as steps)
    const ring = (k) => { const j = jOf(k), h = topOf(k) + 0.06, g = new THREE.CylinderGeometry(Rout(j), Rout(j), h, 48, 1, false, 0, Math.PI); g.translate(0, h / 2 - 0.06, 0); const m = new THREE.Mesh(g, stoneM[k % 2]); return m; };
    line(LINE42.steps, `מעלה 1/${nSteps} · רמה ${L}`);
    pile.innerHTML = ''; pile.hidden = false;
    const chip = el('h42-it h49-step', `◠ מעלה 1/${nSteps}`, 'button'); chip.type = 'button'; pile.appendChild(chip);
    const ppa = (k) => { const j = jOf(k), y = A.y + topOf(k), a = proj(A.x + Rmid(j), y, A.z), b = proj(A.x + Rmid(j) + 1, y, A.z); return a && b ? Math.hypot(b.x - a.x, b.y - a.y) : 20; };
    const unit = (k) => Math.max(0.5, 36 / Math.max(1, ppa(k)));
    dragItem(chip, (d) => {
      const s = J.state(); if (s.done || sing) return false; const k = s.i, j = jOf(k), y = A.y + topOf(k), pt = onPlane49(d.x, d.y, y);
      const r = pt ? Math.hypot(pt.x - A.x, pt.z - A.z) : 0, err = !pt || pt.x < A.x - 1 ? 99 : (r - Rmid(j)) / unit(k);
      const res = J.drop({ dragPx: d.px, err }); o.emit && o.emit('h49step', { k, res, err: Math.round(err * 100) / 100 });
      if (res === 'tap') return false;
      if (res === 'off') { const m = ring(k); m.material = mat('#D8C9A8', 0.9); const rr = pt ? Math.max(2, Math.min(17, r)) : Rmid(j); m.scale.set(rr / Rout(j), 1, rr / Rout(j)); m.position.y = topOf(k) * 0.2; m.rotation.x = 0.09 * Math.sign(err || 1); G2.add(m); ghost = { m, t: 0 }; { const sc = F.STEPS49.scale, dg = sc[k % sc.length] + 12 * Math.floor(k / sc.length); tone49(J.freq(dg) * 1.06, 0.6, 1); } buzz42('retry'); line(LINE42.stepOff, `מעלה ${k + 1}/${nSteps} · רמה ${L}`); return false; }
      const m = ring(k); m.position.y = 2.5; G2.add(m); drop = { m, t: 0 }; const deg = s.notes[s.notes.length - 1]; tone49(J.freq(deg), 0.9); buzz42('settle');
      if (J.state().done) { pile.innerHTML = ''; sing = { t: -1.2, i: -1 }; line(LINE42.levites); }   // (the fifteenth rings true: the engine's 'true', then done)
      else { chip.textContent = `◠ מעלה ${s.i + 1}/${nSteps}`; line(s.i === 1 ? LINE42.stepTrue : LINE42.steps, `מעלה ${s.i + 1}/${nSteps} · רמה ${L}`); }
      return true;
    });
    const view = () => { const c = [A.x + 6.8, A.y, A.z], tH = tanV() * (W() / H()), D = Math.max(16.5 / tH, 9.2 / tanV()); return { p: [c[0] + D * 0.14, A.y + D, c[2]], t: c }; };
    function levites() {
      const g = new THREE.Group(), list = [1, 4, 7, 10, 13].filter((j) => j >= 15 - nSteps);
      for (const j of list) for (const ph of [-0.95, 0, 0.95]) { const f = figure49({ tunic: '#F2EEE2', cap: '#F2EEE2', belt: '#5B7FB0' }), R2 = 6.25 + 0.5 * j; f.position.set(A.x + R2 * Math.cos(ph), A.y + 0.5 * (15 - j), A.z + R2 * Math.sin(ph)); f.rotation.y = Math.PI / 2 - ph * 0.2; f.scale.setScalar(1.75); g.add(f); }
      (scene() || st.props.root).add(g); st.lev49 = g; return g;
    }
    return {
      acting: true, dragOnly: true, J, kind: 'steps49', chip, unit, onPlane: onPlane49, sing: () => (sing ? { t: Math.round(sing.t * 10) / 10, i: sing.i } : null), endT: () => endT, target: () => { const s = J.state(), k = s.i; if (s.done) return null; const j = jOf(k), y = A.y + topOf(k); return { k, R: Rmid(j), y, c: [A.x, A.z], at: (th) => proj(A.x + Rmid(j) * Math.cos(th), y, A.z + Rmid(j) * Math.sin(th)) }; },
      view() { if (sing && sing.t > 0) { return { p: [A.x + 36, A.y + 4.5, A.z + 9], t: [A.x + 3, A.y + 11, A.z] }; } return view(); },
      frame(dt) {
        objPlace(true, [{ x: A.x + 7, y: A.y + 3, z: A.z, r: 10 }], 'h49steps');
        if (drop) { drop.t += dt; const k2 = Math.min(1, drop.t / 0.3); drop.m.position.y = 2.5 * (1 - k2 * k2); if (k2 >= 1) drop = null; }
        if (ghost) { ghost.t += dt; ghost.m.position.y -= dt * 2; ghost.m.material.transparent = true; ghost.m.material.opacity = Math.max(0, 1 - ghost.t / 0.9); if (ghost.t > 0.9) { G2.remove(ghost.m); ghost = null; } }
        svgClear();
        const tg = this.target();
        if (tg && !sing) {   // (the next step's arc in gold; level 1: the band that rings true)
          const pts = []; for (let i = 0; i <= 28; i++) { const q = tg.at(-Math.PI / 2 + (Math.PI * i) / 28); if (q) pts.push(`${q.x.toFixed(1)},${q.y.toFixed(1)}`); }
          if (pts.length > 2) { const band = J.state().L <= 1 ? Math.max(6, F.STEPS49.tol[1] * unit(tg.k) * ppa(tg.k) * 2) : 0; if (band) svgAdd(`<polyline points="${pts.join(' ')}" fill="none" stroke="rgba(255,214,110,.28)" stroke-width="${band.toFixed(1)}" stroke-linecap="round"/>`); svgAdd(`<polyline points="${pts.join(' ')}" fill="none" stroke="#FFD66E" stroke-width="4" stroke-dasharray="10 7"/>`); }
        }
        if (sing) {   // the Levites on the steps, singing the tune he built
          sing.t += dt;
          if (sing.t > 0 && !st.lev49) { levites(); o.emit && o.emit('h49levites', { notes: J.state().notes.slice() }); }
          const notes = J.state().notes, i = Math.floor(sing.t / 0.34);
          if (sing.t > 0 && i !== sing.i && i < notes.length * 2) { sing.i = i; tone49(J.freq(notes[i % notes.length]), 0.5); }
          if (st.lev49) st.lev49.children.forEach((f, q) => { const t2 = f.userData.top; if (t2) t2.rotation.x = 0.08 * Math.max(0, Math.sin(sing.t * 6 + q)); });
          if (sing.t > notes.length * 0.68 + 1.2 && endT < 0) { grade(part, J.result().q, { x: W() / 2, y: H() * 0.3 }); endT = 1.8; }
        }
        if (endT >= 0) { endT -= dt; if (endT <= 0) return true; }
        return false;
      },
      end() { pile.innerHTML = ''; svgClear(); if (MODE !== 'stage' && st.lev49) { if (st.lev49.parent) st.lev49.parent.remove(st.lev49); st.lev49 = null; } },
    };
  }
  /* ── build 50 ── stage 07's acts ── */
  const topView50 = (C, R) => { const tH = tanV() * (W() / H()), D = Math.max((R + 3) / tH, (R + 2.5) / tanV()); return { p: [C.x + D * 0.12, C.y + D, C.z + 0.01], t: [C.x, C.y, C.z] }; };   // (ש8: from above, the gate side up)
  /** PLACE (לשכת הגזית): the COMPASS — hold at the centre: the peg; sweep round it: the rope marks the arc (fam42 createCompass50) */
  // ── build 54 ── (§2 stage 07: "the top view over an empty brown plane — no room, no walls") the chamber from above: its paved floor and its
  // four walls round the compass's place (the model's own skin is cut there for the view: hole50) ── /build 54 ──
  function room54(on) {
    if (!st.props.root) return;
    if (!st.props.room54) {
      const C = PL.gz, x0 = STG === 'lishka' ? -101 : C.x - 20, x1 = STG === 'lishka' ? -61 : C.x + 20, z0 = STG === 'lishka' ? 55 : C.z - 9, z1 = STG === 'lishka' ? 85 : C.z + 21, y0 = STG === 'lishka' ? 16.05 : gy(C.x, C.z) + 0.05, g = new THREE.Group();
      let tex = null; try { if (doc) { const cv = doc.createElement('canvas'); cv.width = 256; cv.height = 256; const c = cv.getContext('2d'); c.fillStyle = '#CDBB98'; c.fillRect(0, 0, 256, 256); for (let r = 0; r < 8; r++) for (let q = 0; q < 8; q++) { const sh = 200 + ((r * 5 + q * 11) % 25); c.fillStyle = `rgb(${sh + 14},${sh + 2},${sh - 26})`; c.fillRect(q * 32 + 1.5 + (r % 2) * 16, r * 32 + 1.5, 29, 29); } tex = new THREE.CanvasTexture(cv); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set((x1 - x0) / 8, (z1 - z0) / 8); tex.colorSpace = THREE.SRGBColorSpace; } } catch (e) { tex = null; }
      const fl = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshStandardMaterial({ map: tex, color: tex ? '#FFFFFF' : '#CDBB98', roughness: 0.95 })); fl.rotation.x = -Math.PI / 2; fl.position.set((x0 + x1) / 2, y0 + 0.04, (z0 + z1) / 2); g.add(fl);
      const wm = mat('#E6DCC6', 0.85); for (const [cx, cz, w, d] of [[(x0 + x1) / 2, z0, x1 - x0 + 2, 1.6], [(x0 + x1) / 2, z1, x1 - x0 + 2, 1.6], [x0, (z0 + z1) / 2, 1.6, z1 - z0], [x1, (z0 + z1) / 2, 1.6, z1 - z0]]) { const wl = new THREE.Mesh(new THREE.BoxGeometry(w, 5, d), wm); wl.position.set(cx, y0 + 2.5, cz); g.add(wl); }
      st.props.root.add(g); st.props.room54 = g;
    }
    st.props.room54.visible = !!on;
  }
  function mkCompass50() {
    const L = famL('place'), J = F.createCompass50(L), C = PL.gz, R = ARC50.R; let holding = false, lastA = null, endT = -1, said = '', halfT = -1;
    hole50('gazit'); room54(true); line(LINE42.compass, `רמה ${L}`); if (st.ui.pad) st.ui.pad.classList.add('full');
    st.props.arc50.clear(); st.props.bench50.clear(); st.props.peg50.visible = false; st.props.rope50.visible = false;
    const centre = () => proj(C.x, C.y, C.z);
    const mark = (a, r) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.18), new THREE.MeshBasicMaterial({ color: '#FFD66E' })); m.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); m.rotation.y = -a + Math.PI / 2; st.props.arc50.add(m); };
    return {
      acting: true, fullPad: true, J, kind: 'compass50', centre, R, rimAt: (th, k = 1) => proj(C.x + Math.cos(th) * R * k, C.y, C.z + Math.sin(th) * R * k),
      down(a) { const c = centre(); holding = !!(c && Math.hypot(a.x - c.x, a.y - c.y) < Math.max(44, H() * 0.12)); },
      move(a) {
        if (!J.state().planted || J.state().done) return; const pt = onPlane49(a.x, a.y, C.y); if (!pt) return;
        const dx = pt.x - C.x, dz = pt.z - C.z, r = Math.hypot(dx, dz), ang = Math.atan2(dz, dx); if (r < R * 0.4) return;
        const rope = J.sweep(ang, r / R - 1); const rr = Math.max(R * 0.75, Math.min(R * 1.15, r));
        if (lastA == null || Math.abs(ang - lastA) > 0.05) { mark(ang, rr); lastA = ang; }
        const rp = st.props.rope50, P2 = rp.geometry.attributes.position; rp.visible = true; P2.setXYZ(0, C.x, C.y + 0.9, C.z); P2.setXYZ(1, C.x + Math.cos(ang) * rr, C.y + (rope === 'slack' ? 0.05 : 0.5), C.z + Math.sin(ang) * rr); P2.needsUpdate = true; rp.material.color.set(rope === 'strain' ? '#E0503A' : rope === 'slack' ? '#8A7458' : '#FFE6A0');
        const dg = Math.round(J.covered() / 15) * 15; if (rope !== said || dg !== this.dg) { this.dg = dg; said = rope; line(rope === 'slack' ? LINE42.slack : rope === 'strain' ? LINE42.strain : LINE42.compass2, `${Math.round(J.covered())}° / ${F.COMPASS50.span}° · רמה ${L}`); if (rope !== 'taut') buzz42('tick'); }
      },
      up() { holding = false; J.lift(); },
      view() { return topView50(C, R); },
      frame(dt) {
        objPlace(true, [{ x: C.x, y: C.y, z: C.z, r: R }], 'h50compass');
        const s = J.state(), was = s.planted; if (!s.planted) J.hold(dt, holding && st.act && st.act.down);
        if (!was && J.state().planted) { st.props.peg50.visible = true; buzz42('mallet'); o.sound && o.sound('wedge'); line(LINE42.compass2, `רמה ${L}`); }
        svgClear(); const c = centre();
        if (c && !J.state().planted) { const k2 = s.holdT / F.COMPASS50.plant; svgAdd(`<circle cx="${c.x}" cy="${c.y}" r="26" fill="rgba(255,214,110,.22)" stroke="#FFD66E" stroke-width="4" stroke-dasharray="${(k2 * 163).toFixed(1)} 163" transform="rotate(-90 ${c.x} ${c.y})"/><circle cx="${c.x}" cy="${c.y}" r="5" fill="#FFD66E"/>`); }
        if (c && J.state().planted && !s.done) svgAdd(`<circle cx="${c.x}" cy="${c.y}" r="22" fill="rgba(255,214,110,.18)" stroke="#FFD66E" stroke-width="3"/><circle cx="${c.x}" cy="${c.y}" r="6" fill="#8A6038" stroke="#FFE6A0" stroke-width="2"/>`);   // ── build 54 ── (the peg ≥ 44 px — §2 stage 07) ── /build 54 ──
        if (c && J.state().planted && !s.done && s.L <= 1) { const pts = []; for (let i = 0; i <= 48; i++) { const a = (i / 48) * Math.PI * 2, q = proj(C.x + Math.cos(a) * R, C.y, C.z + Math.sin(a) * R); if (q) pts.push(`${q.x.toFixed(1)},${q.y.toFixed(1)}`); } if (pts.length > 3) svgAdd(`<polyline points="${pts.join(' ')}" fill="none" stroke="rgba(255,230,160,.35)" stroke-width="3" stroke-dasharray="6 8"/>`); }
        if (s.done && halfT < 0) { halfT = 0; st.arc50 = { a0: s.a0, lo: s.lo, hi: s.hi }; R.arc50 = st.arc50; save42(S); grade('compass', J.result().q, c || { x: W() / 2, y: H() * 0.4 }); st.props.rope50.visible = false; line(LINE42.half); o.emit && o.emit('h50half', {}); endT = 3.2; }
        if (endT >= 0) { endT -= dt; if (endT <= 0) return true; }
        return false;
      },
      end() { svgClear(); if (st.ui.pad) st.ui.pad.classList.remove('full'); room54(false); },
    };
  }
  /** PLACE: the benches along the arc — the Sanhedrin's half circle (fam42 createSteps49's drop: on the line, it lies true) */
  function mkBenches50() {
    const L = famL('place'), n = 5, J = F.createSteps49(L, n), C = PL.gz, R = ARC50.R, pile = st.ui.pile; let endT = -1, ghost = null;
    const A0 = st.arc50 || R.arc50 || null, span = A0 && Number.isFinite(A0.a0) ? { m: A0.a0 + (A0.lo + A0.hi) / 2, h: (A0.hi - A0.lo) / 2 } : null;   // (the half circle he drew)
    hole50('gazit'); room54(true); line(LINE42.benches, `ספסל 1/${n} · רמה ${L}`); pile.innerHTML = ''; pile.hidden = false; st.props.bench50.clear(); if (st.props.peg50) st.props.peg50.visible = true;
    const chip = el('h42-it h50-bench', `▭ ספסל 1/${n}`, 'button'); chip.type = 'button'; pile.appendChild(chip);
    const ppa = () => { const a = proj(C.x + R, C.y, C.z), b = proj(C.x + R + 1, C.y, C.z); return a && b ? Math.hypot(b.x - a.x, b.y - a.y) : 20; };
    const unit = () => Math.max(0.5, 36 / Math.max(1, ppa()));
    const bench = (ang, r, tilt) => { const m = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.9, 1.1), mat(tilt ? '#8E7A5C' : '#A88E66', 0.85)); m.position.set(Math.cos(ang) * r, 0.45, Math.sin(ang) * r); m.rotation.y = -ang + Math.PI / 2; if (tilt) m.rotation.z = 0.18; st.props.bench50.add(m); return m; };
    dragItem(chip, (d) => {
      const s = J.state(); if (s.done) return false; const pt = onPlane49(d.x, d.y, C.y); const r = pt ? Math.hypot(pt.x - C.x, pt.z - C.z) : 0, ang = pt ? Math.atan2(pt.z - C.z, pt.x - C.x) : 0;
      let inArc = true; if (span) { let d2 = ang - span.m; while (d2 > Math.PI) d2 -= 2 * Math.PI; while (d2 < -Math.PI) d2 += 2 * Math.PI; inArc = Math.abs(d2) <= span.h + 0.25; }
      const err = pt && inArc ? (r - R) / (unit() * 2) : 99, res = J.drop({ dragPx: d.px, err });
      if (res === 'tap') return false;
      if (res === 'off') { ghost = { m: bench(ang, Math.max(2, Math.min(R * 1.6, r)), true), t: 0 }; buzz42('retry'); line('הספסל לא על הקשת — גררו שוב, על הקו · המחשה', `ספסל ${s.i + 1}/${n} · רמה ${L}`); return false; }
      bench(ang, R, false); buzz42('settle'); o.sound && o.sound('thud');
      if (J.state().done) { pile.innerHTML = ''; grade('benches', J.result().q, proj(C.x, C.y + 1, C.z)); endT = 1.4; } else { chip.textContent = `▭ ספסל ${J.state().i + 1}/${n}`; line(LINE42.benches, `ספסל ${J.state().i + 1}/${n} · רמה ${L}`); }
      return true;
    });
    return {
      acting: true, dragOnly: true, J, kind: 'benches50', chip, R, span, centre: () => proj(C.x, C.y, C.z), at: (th) => proj(C.x + Math.cos(th) * R, C.y, C.z + Math.sin(th) * R), unit,
      view() { return topView50(C, R); },
      frame(dt) {
        objPlace(true, [{ x: C.x, y: C.y, z: C.z, r: R }], 'h50benches');
        if (ghost) { ghost.t += dt; ghost.m.position.y -= dt * 1.5; if (ghost.t > 0.8) { st.props.bench50.remove(ghost.m); ghost = null; } }
        svgClear(); if (!J.state().done) { const pts = []; for (let i = 0; i <= 48; i++) { const a = span ? span.m - span.h + (i / 48) * 2 * span.h : (i / 48) * Math.PI * 2, q = proj(C.x + Math.cos(a) * R, C.y, C.z + Math.sin(a) * R); if (q) pts.push(`${q.x.toFixed(1)},${q.y.toFixed(1)}`); } if (pts.length > 3) { if (J.state().L <= 1) svgAdd(`<polyline points="${pts.join(' ')}" fill="none" stroke="rgba(255,214,110,.22)" stroke-width="${Math.max(8, unit() * ppa() * 2 * F.STEPS49.tol[1]).toFixed(1)}"/>`); svgAdd(`<polyline points="${pts.join(' ')}" fill="none" stroke="#FFD66E" stroke-width="3" stroke-dasharray="9 7"/>`); } }
        if (endT >= 0) { endT -= dt; if (endT <= 0) return true; }
        return false;
      },
      end() { pile.innerHTML = ''; svgClear(); room54(false); },
    };
  }
  const wheelView50 = () => { const G = PL.gl, D = Math.max(needD() + 1, 7.2 / tanV()); return { p: [G.x + 1.6, G.y + 5.2, G.z - D], t: [G.x + 1.2, G.y + 4.4, G.z] }; };   // (ש3: from the north, the wheel's face and the pit)
  /** FIT (לשכת הגולה): the hub turned with a drag across, a spoke dragged in while its slot stands at the top (fam42 createHub50) */
  function mkHub50() {
    const L = famL('fit'), J = F.createHub50(L), G = PL.gl, pile = st.ui.pile; let lastX = null, endT = -1;
    hole50(null); line(LINE42.hub, `חישור 1/${F.HUB50.n} · רמה ${L}`); if (st.ui.pad) st.ui.pad.classList.add('full'); pile.innerHTML = ''; pile.hidden = false;
    st.props.spokes50.forEach((s2) => { s2.visible = false; });
    // ── build 54 ── (§2 stage 07: "the spokes are a button 'חישור ×8'") the spokes lie in a pile on the floor by the wheel; the finger takes one
    // from the pile where it lies (a clear handle over it) ── /build 54 ──
    const heap = []; { const wd = mat('#9A7046', 0.85); for (let k = 0; k < F.HUB50.n; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 2.2), wd), a = (k * 2.4) % 3.1 - 1.5; b.rotation.set(0, a * 0.5, 0); const x = G.x - 3.4 + (k % 3) * 0.32, z = G.z - 1.6 + (k % 2) * 0.25; b.position.set(x, G.y + 1.62 + Math.floor(k / 3) * 0.2, z); if (st.props.root) st.props.root.add(b); heap.push(b); }
      const tr = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 2.6), wd), legs = [-0.6, 0.6].map((dx) => new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.4, 2.2), wd)); tr.position.set(G.x - 3.1, G.y + 1.4, G.z - 1.5); legs.forEach((l, k2) => { l.position.set(G.x - 3.1 + [-0.6, 0.6][k2], G.y + 0.7, G.z - 1.5); }); if (st.props.root) [tr, ...legs].forEach((m) => { st.props.root.add(m); heap.push(m); m.userData.stand = 1; }); }   // (on a trestle by the wheel: on the floor the pile stood under the frame's edge)
    const chip = el('h42-it h50-spoke', '', 'button'); chip.type = 'button'; chip.setAttribute('aria-label', 'חישור'); chip.style.cssText = 'position:fixed;z-index:46;pointer-events:auto;width:76px;height:52px;min-width:0;padding:0;background:transparent;box-shadow:none;border:2px dashed rgba(255,214,110,.85);border-radius:14px;color:transparent'; st.ui.root.appendChild(chip);
    const heapAt = () => { const b = heap.find((m) => m.visible && !m.userData.stand); return b ? proj(b.position.x, b.position.y, b.position.z) : null; };
    dragItem(chip, (d) => {
      if (J.state().done || d.y > H() * 0.8) return false; const r = J.insert({ dragPx: d.px });
      if (r === 'tap') return false;
      if (r === 'jam') { buzz42('retry'); o.sound && o.sound('grind'); line(LINE42.hubJam, `רמה ${L}`); return false; }
      const filled = J.state().filled; filled.forEach((f, i) => { st.props.spokes50[i].visible = f; }); buzz42('settle'); o.sound && o.sound('wood');
      const left = filled.filter((f) => !f).length; chip.textContent = ''; heap.forEach((m, k) => { if (!m.userData.stand) m.visible = k < left; });
      if (r === 'done') { pile.innerHTML = ''; chip.style.display = 'none'; grade('hub', J.result().q, proj(G.x, G.y + 6, G.z)); endT = 1.3; } else line(LINE42.hub, `חישור ${F.HUB50.n - left + 1}/${F.HUB50.n} · רמה ${L}`);
      return true;
    });
    return {
      acting: true, fullPad: true, J, kind: 'hub50', chip, heapAt, top: () => proj(G.x, G.y + 6.2 + 0.9, G.z), hubAt: () => proj(G.x, G.y + 6.2, G.z),
      down(a) { lastX = a.x; }, move(a) { if (lastX != null) { J.turn(a.x - lastX); lastX = a.x; } }, up() { lastX = null; },
      view() { return wheelView50(); },
      frame(dt) {
        objPlace(true, [{ x: G.x, y: G.y + 6, z: G.z, r: 3 }], 'h50hub');
        { const q = heapAt(); if (q && chip.style.display !== 'none') { chip.style.left = `${Math.round(Math.max(4, Math.min(W() - 80, q.x - 38)))}px`; chip.style.top = `${Math.round(Math.max(56, Math.min(H() - 56, q.y - 26)))}px`; } }   // ── build 54 ── (over the pile, kept on the screen: K54-P-07 — at 640 its foot 14 px under the frame's edge) ── /build 54 ──
        st.props.wheel50.rotation.z = (J.state().angle * Math.PI) / 180;
        svgClear(); const t = proj(G.x, G.y + 6.2 + 1.25, G.z), nb = J.nearest();
        if (t && !J.state().done) { const ok = nb && Math.abs(nb.err) <= J.state().tol; svgAdd(`<path d="M${t.x - 11} ${t.y - 30} L${t.x + 11} ${t.y - 30} L${t.x} ${t.y - 12} Z" fill="${ok ? '#7CD67C' : '#FFD66E'}" stroke="#2A1804" stroke-width="2"/>`); if (J.state().L <= 1 && nb && !ok) svgAdd(`<text x="${t.x + (nb.err > 0 ? -40 : 40)}" y="${t.y - 14}" font-size="30" font-weight="900" text-anchor="middle" fill="#FFD66E" stroke="#2A1804" stroke-width="3" paint-order="stroke">${nb.err > 0 ? '⇦' : '⇨'}</text>`); }
        if (endT >= 0) { endT -= dt; if (endT <= 0) { svgClear(); return true; } }
        return false;
      },
      end() { pile.innerHTML = ''; svgClear(); if (st.ui.pad) st.ui.pad.classList.remove('full'); chip.remove(); heap.forEach((m) => { if (m.parent) m.parent.remove(m); }); },
    };
  }
  /** LIFT: the wheel turned — hold: it gathers speed and the bucket rises; too fast, the water spills (fam42 createWinch50) */
  function mkWheel50() {
    const L = famL('lift'), J = F.createWinch50(L), G = PL.gl, bk = st.props.bucket50, wat = bk.userData.water, pitY = G.y - 3, topY = G.y + 6.2 - 2.6 - 0.9; let endT = -1, spin = 0, said = false, dropT = 0;
    hole50(null); st.props.spokes50.forEach((s2) => { s2.visible = true; }); line(LINE42.wheel, `דלי 1/${F.WINCH50.buckets} · רמה ${L}`); if (st.ui.pad) st.ui.pad.classList.add('full');
    return {
      acting: true, fullPad: true, J, kind: 'wheel50',
      down() { J.hold(true); }, move() {}, up() { J.hold(false); },
      view() { return wheelView50(); },
      frame(dt) {
        objPlace(true, [{ x: G.x, y: G.y + 5, z: G.z, r: 3 }], 'h50wheel');
        const r = J.step(dt), s = J.state(); spin += s.v * dt; st.props.wheel50.rotation.z = -spin;
        const y = pitY + (topY - pitY) * s.h; bk.position.set(G.x + 2.6, y, G.z); wat.scale.setScalar(Math.max(0.05, s.full)); wat.visible = s.full > 0.03;
        const rp = st.props.brope50.geometry.attributes.position; rp.setXYZ(0, G.x + 2.6, G.y + 6.2, G.z); rp.setXYZ(1, G.x + 2.6, y + 0.4, G.z); rp.needsUpdate = true;
        // ── build 54 ── (§2 stage 07: "'too fast — it spills' — and you don't see the bucket spill") the bucket tips as it spills, and the water
        // lies on the floor under it — a puddle that grows with each spill and dries slowly ── /build 54 ──
        bk.rotation.z += ((s.spilling ? 0.55 : 0) - bk.rotation.z) * Math.min(1, dt * 6);
        if (!st.props.puddle54 && st.props.root) { const pm = new THREE.Mesh(new THREE.CircleGeometry(1, 24), new THREE.MeshStandardMaterial({ color: '#5A8FB8', roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.75, depthWrite: false })); pm.rotation.x = -Math.PI / 2; pm.position.set(G.x + 3.3, G.y + 0.04, G.z + 0.6); pm.scale.setScalar(0.01); st.props.root.add(pm); st.props.puddle54 = pm; }
        if (st.props.puddle54) { const pm = st.props.puddle54, k2 = pm.userData.k || 0; pm.userData.k = Math.max(0, Math.min(1.9, k2 + (s.spilling ? dt * 0.9 : -dt * 0.03))); pm.scale.set(pm.userData.k, pm.userData.k * 0.75, 1); pm.visible = pm.userData.k > 0.02; }
        dropT += dt; st.props.drops50.forEach((d, i) => { if (s.spilling) { d.visible = true; const ph = (dropT * 2 + i / 6) % 1; d.position.set(G.x + 2.6 + (i % 2 ? 0.45 : -0.45), y + 0.4 - ph * 3, G.z + (i % 3 - 1) * 0.3); } else d.visible = false; });
        if (r === 'bucket' || r === 'done') { buzz42('settle'); o.sound && o.sound('splash'); line(LINE42.wheel, `דלי ${Math.min(F.WINCH50.buckets, s.i + 1)}/${F.WINCH50.buckets} · ${s.got.map((g) => (g >= 0.9 ? 'מלא' : g >= 0.6 ? 'חסר מעט' : 'כמעט ריק')).join(' · ')}`); }
        if (s.spilling && !said) { said = true; line(LINE42.spill, `רמה ${L}`); buzz42('retry'); } else if (!s.spilling && said) { said = false; line(LINE42.wheel, `דלי ${s.i + 1}/${F.WINCH50.buckets} · רמה ${L}`); }
        svgClear(); { const x = W() * 0.86, y0 = H() * 0.24, hh = H() * 0.46, sc = (v) => y0 + hh * (1 - Math.min(1, v / F.WINCH50.vmax)); svgAdd(`<rect x="${x - 10}" y="${y0}" width="20" height="${hh}" rx="9" fill="rgba(28,20,10,.6)" stroke="#FFE6A0" stroke-width="2"/><rect x="${x - 12}" y="${y0}" width="24" height="${sc(s.spill) - y0}" fill="rgba(224,80,58,.5)" stroke="#E0503A" stroke-width="2"/><rect x="${x - 7}" y="${sc(s.v)}" width="14" height="${y0 + hh - sc(s.v)}" rx="6" fill="${s.spilling ? '#E0503A' : '#7FC0E0'}"/><text x="${x}" y="${y0 + hh + 18}" font-size="12" font-weight="800" text-anchor="middle" fill="#FFF4DC" stroke="#2A1804" stroke-width="3" paint-order="stroke">מהירות</text>`); }
        if (r === 'done' && endT < 0) { grade('wheel', J.result().q, proj(G.x, G.y + 6, G.z)); endT = 1.4; }
        if (endT >= 0) { endT -= dt; if (endT <= 0) { svgClear(); return true; } }
        return false;
      },
      end() { svgClear(); if (st.ui.pad) st.ui.pad.classList.remove('full'); st.props.drops50.forEach((d) => { d.visible = false; }); },
    };
  }
  /** PLACE (בית המוקד): the ARCH on its centering — voussoirs alternately left and right, the keystone last; then the taps knock the wedges
   *  out, the centering drops, a hush, the stones settle with a creak — THE DOME HOLDS (fam42 createArch50). From inside, low, looking up */
  function mkDome50(part = 'dome') {
    const L = famL('place'), J = F.createArch50(L), Mk = PL.mk, ys = Mk.y + DOME50.wall, n = J.state().n, Mn = 2 * n + 1, pile = st.ui.pile; let phase = 'set', endT = -1, fall = -1, tiltA = 0;
    hole50('moked'); line(LINE42.dome, `רמה ${L}`); pile.innerHTML = ''; pile.hidden = false; st.props.vous50.clear(); st.props.ctr50.position.y = ys; st.props.ctr50.visible = true; (st.props.posts50 || []).forEach((p2) => { p2.visible = true; }); st.props.wedges50.forEach((w) => { w.visible = true; w.userData.pop = 0; w.position.set(Mk.x, ys - 0.67, w.userData.z0); }); if (st.props.shell50) { st.props.shell50.visible = false; st.props.shell50.material.opacity = 0; }
    let polar0 = null; try { const ctl = globalThis.__T && globalThis.__T.controls; if (ctl) { polar0 = ctl.maxPolarAngle; ctl.maxPolarAngle = Math.PI - 0.05; } } catch (e) { /* */ }   // (from inside, looking up: the orbit's floor at 1.46 kept the camera above its target)
    const slot = (j) => { const th = Math.PI - ((j + 0.5) * Math.PI) / Mn; return proj(Mk.x, ys + DOME50.Ra * Math.sin(th), Mk.z - DOME50.Ra * Math.cos(th)); };   // (the arch's group turned a quarter: its local x is −z)
    const nextJ = (side) => (side === 'L' ? J.state().left : side === 'R' ? Mn - 1 - J.state().right : n);
    const chips = [['L', '◖ אבן שמאל'], ['K', '▲ אבן הראשה'], ['R', 'אבן ימין ◗']].map(([k, t]) => { const b = el('h42-it h50-vous', t, 'button'); b.type = 'button'; b.dataset.side = k; pile.appendChild(b); return b; });
    chips.forEach((b) => dragItem(b, (d) => {
      if (phase !== 'set') return false; const side = b.dataset.side, sp = slot(nextJ(side)); if (!sp || Math.hypot(d.x - sp.x, d.y - sp.y) > Math.max(80, W() * 0.12)) return false;
      const r = side === 'K' ? J.keystone({ dragPx: d.px }) : J.place(side, { dragPx: d.px });
      if (r === 'tap' || r === 'full') return false;
      if (r === 'tilt') { tiltA = 1; buzz42('retry'); o.sound && o.sound('creak'); line(LINE42.tilt, `רמה ${L}`); return false; }
      if (r === 'early') { buzz42('retry'); line(LINE42.early, `רמה ${L}`); return false; }
      const j = side === 'K' ? n : side === 'L' ? J.state().left - 1 : Mn - J.state().right; const m = vous50(j, Mn); m.position.y += 1.2; st.props.vous50.add(m); m.userData.settle = 0.35; buzz42('settle'); o.sound && o.sound('thud');
      const s = J.state(); if (s.key) { phase = 'strike'; pile.innerHTML = ''; line(LINE42.strike, `טריזים ${s.wedges}`); if (st.ui.pad) st.ui.pad.classList.add('full'); }
      else if (s.left >= n && s.right >= n) line(LINE42.key, `רמה ${L}`); else line(LINE42.dome, `שמאל ${s.left}/${n} · ימין ${s.right}/${n} · רמה ${L}`);
      return true;
    }));
    return {
      acting: true, fullPad: false, dragOnly: true, J, kind: 'dome50', chips, slot, nextJ, phase: () => phase,
      down() {}, move() {},
      up(a) {
        if (phase !== 'strike' || Math.hypot(a.x - a.x0, a.y - a.y0) > 30) return; const r = J.strike();
        if (r === 'out' || r === 'holds') { const w = st.props.wedges50[J.state().out - 1]; if (w) w.userData.pop = 0.0001; buzz42('mallet'); o.sound && o.sound('wedge'); line(LINE42.strike, `טריזים ${J.state().wedges - J.state().out}`); }
        if (r === 'holds') { phase = 'fall'; fall = 0; if (st.ui.pad) st.ui.pad.classList.remove('full'); line(''); }
      },
      view() { const t2 = phase === 'held' ? Math.min(1, Math.max(0, (fall - 2.8) / 3)) : 0; return { p: [Mk.x + 19 - 12 * t2, Mk.y + 2, Mk.z + 0.5], t: [Mk.x - 10 * t2, ys + 3.5 + 1.5 * t2, Mk.z] }; },   // (low, from the house's open end: the whole arch in the world's lens — a wider lens was taken back by the sanctuary's; when it holds, in under the vault)
      frame(dt) {
        if (phase === 'strike') { this.dragOnly = false; objPlace(true, [{ x: Mk.x, y: ys, z: Mk.z, r: 4 }], 'h50strike'); if (st.ui.pad) st.ui.pad.classList.add('full'); } else { this.dragOnly = true; objPlace(true, [{ x: Mk.x, y: ys + 4, z: Mk.z, r: 6 }], 'h50dome'); }
        st.props.vous50.children.forEach((m) => { if (m.userData.settle > 0) { const k2 = Math.min(m.userData.settle, dt); m.position.y -= (1.2 / 0.35) * k2; m.userData.settle -= k2; } });
        st.props.wedges50.forEach((w) => { if (w.userData.pop) { w.userData.pop += dt; w.position.y -= dt * 6; w.position.x += dt * 2; if (w.userData.pop > 0.6) w.visible = false; } });
        tiltA = Math.max(0, tiltA - dt * 1.6); st.props.ctr50.rotation.z = (phase === 'set' ? J.balance() * 0.03 : 0) + Math.sin(tiltA * 12) * 0.06 * tiltA;
        svgClear();
        if (phase === 'set') {   // the balance meter, and the next stones' places
          const cx = W() / 2, cy = H() - Math.max(34, H() * 0.12), hw = Math.min(110, W() * 0.18), b = J.balance() + (tiltA > 0 ? Math.sign(J.balance() || 1) * tiltA : 0), an = b * 0.22;
          svgAdd(`<g transform="rotate(${(an * 180) / Math.PI} ${cx} ${cy})"><rect x="${cx - hw}" y="${cy - 5}" width="${2 * hw}" height="10" rx="5" fill="#C9A26A" stroke="#2A1804" stroke-width="2"/></g><path d="M${cx - 12} ${cy + 22} L${cx + 12} ${cy + 22} L${cx} ${cy + 4} Z" fill="#5A4026"/><text x="${cx}" y="${cy - 14}" font-size="12" font-weight="800" text-anchor="middle" fill="#FFF4DC" stroke="#2A1804" stroke-width="3" paint-order="stroke">איזון</text>`);
          const s = J.state(); for (const sd of ['L', 'R', 'K']) { if ((sd === 'L' && s.left >= n) || (sd === 'R' && s.right >= n) || (sd === 'K' && (s.left < n || s.right < n) && s.L > 1)) continue; const p2 = slot(nextJ(sd)); if (p2) svgAdd(`<circle cx="${p2.x}" cy="${p2.y}" r="${sd === 'K' ? 16 : 13}" fill="none" stroke="${sd === 'K' ? '#FFF4DC' : '#FFD66E'}" stroke-width="3" stroke-dasharray="5 4"/>`); }
        }
        if (phase === 'strike') st.props.wedges50.forEach((w) => { if (!w.visible || w.userData.pop) return; const p2 = proj(w.position.x, w.position.y, w.position.z); if (p2) svgAdd(`<circle cx="${p2.x}" cy="${p2.y}" r="15" fill="rgba(255,214,110,.3)" stroke="#FFD66E" stroke-width="3"/>`); });
        if (phase === 'fall' || phase === 'held') {   // the centering drops; a hush; the creak; the stones settle; the dome holds
          fall += dt; const c = st.props.ctr50; c.position.y = ys - Math.min(2.5, fall * fall * 6); if (fall > 0.6) { c.visible = false; (st.props.posts50 || []).forEach((p2) => { p2.visible = false; }); }   // (the centering and its posts away)
          if (fall > 2.0 && !this.creak) { this.creak = 1; o.sound && o.sound('creak'); buzz42('settle'); st.props.vous50.children.forEach((m) => { m.position.y -= 0.04; }); }
          if (fall > 2.6 && phase === 'fall') { phase = 'held'; line(LINE42.holds); o.emit && o.emit('h50holds', {}); if (st.props.shell50) st.props.shell50.visible = true; }
          if (st.props.shell50 && phase === 'held') st.props.shell50.material.opacity = Math.min(1, (fall - 2.6) / 1.6);
          if (fall > 4.4 && endT < 0) { grade(part, J.result().q, { x: W() / 2, y: H() * 0.3 }); buzz42('peak'); endT = 3.2; }
        }
        if (endT >= 0) { endT -= dt; if (endT <= 0) return true; }
        return false;
      },
      end() { pile.innerHTML = ''; svgClear(); if (st.ui.pad) st.ui.pad.classList.remove('full'); try { const ctl = globalThis.__T && globalThis.__T.controls; if (ctl && polar0 != null) ctl.maxPolarAngle = polar0; } catch (e) { /* */ } },
    };
  }
  /* ── build 47 ── stage 04's acts ── */
  const gateView = (cy, D0, k = 1) => { const G = PL.gate, g0 = G.y, D = Math.max(needD() + 2, D0 || 0, 15.5 / tanV()) * k; return { p: [G.x - 3, g0 + 6, G.z - D], t: [G.x, g0 + cy, G.z] }; };   // (ש5 low, from the north: the whole gate and him; him ≤ 45 % at needD)
  const sgnR47 = () => { const G = PL.gate, a = proj(G.x, G.y + 10, G.z), b = proj(G.x + 1, G.y + 10, G.z); return a && b && b.x < a.x ? -1 : 1; };   // (+x toward the screen's right: 1)
  const level47 = (s, L) => {   // the bubble level, big, under the line
    const cx = W() / 2, cy = H() - Math.max(38, H() * 0.13), hw = Math.min(150, W() * 0.24), /* (at the screen's bottom: at the top it hid the lintel) */ bx = cx - (s.tilt / F.LINTEL47.lim) * (hw - 14), cz = (s.centre / F.LINTEL47.lim) * (hw - 14);
    let h = `<rect x="${cx - hw}" y="${cy - 15}" width="${2 * hw}" height="30" rx="15" fill="rgba(210,235,190,.9)" stroke="#5B4A2A" stroke-width="3"/><rect x="${cx - cz - 13}" y="${cy - 15}" width="${2 * cz + 26}" height="30" fill="${L <= 1 ? 'rgba(90,170,80,.35)' : 'none'}" stroke="#5B4A2A" stroke-width="2" stroke-dasharray="${L <= 1 ? '0' : '4 3'}"/><ellipse cx="${bx}" cy="${cy}" rx="13" ry="10" fill="#FFFDF2" stroke="#9AB98A" stroke-width="2"/>`;
    // ── build 54 ── (must 8: "the arrow big and blinking") the way to drag — big, blinking, beside the tube, as soon as the bubble leaves the centre ── /build 54 ──
    if (s.out || Math.abs(s.tilt) > s.centre) { const right = s.tilt > 0, ax = cx + (right ? hw + 34 : -hw - 34); h += `<text x="${ax}" y="${cy + 18}" font-size="${s.out ? 58 : 44}" font-weight="900" text-anchor="middle" fill="#FFD66E" stroke="#2A1804" stroke-width="4" paint-order="stroke">${right ? '➡' : '⬅'}<animate attributeName="opacity" values="1;.2;1" dur="0.7s" repeatCount="indefinite"/></text>`; }
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
        if (s.phase === 'lift') { liftT += dt; if (s.out && !this.outSaid) { this.outSaid = 1; line(`הבועה ברחה — הזיזו ${s.tilt > 0 ? '➡' : '⬅'} · המחשה`, `רמה ${L}`); buzz42('retry'); }   /* ── build 54 ── (the way to drag, by the side it ran — must 8) ── /build 54 ── */ else if (!s.out && this.outSaid) { this.outSaid = 0; line(kind === 'lintel' ? LINE42.lintel : LINE42.leaf7, `רמה ${L}`); } }
        if (was === 'lift' && s.phase === 'set') { if (kind === 'lintel') line(LINE42.lintelSet, `רמה ${L}`); else { done(); return false; } }
        if (lowerT >= 0) { lowerT += dt; if (lowerT > 0.5 && !this.graded) { this.graded = 1; if (st.props.ropes47) st.props.ropes47.visible = false; done(); } }
        return false;
      },
    };
  }
  function mkLintel() {
    const LL = famL('lift'), J = F.createLintel47(LL); line(LINE42.lintel, `רמה ${LL}`);
    try { const q = lintelStand54(); stages.hero.drive(0, 0); stages.hero.setPos(q.x, q.z, 0); } catch (e) { /* */ }   // ── build 54 ── (at his place in the left third — the walk stops 2.6 amot short of it) ── /build 54 ──
    let endT = -1; const G = PL.gate;
    const C = lift47(J, 'lintel', () => { grade('lintel', J.state().q, proj(G.x, G.y + 21, G.z)); endT = 1.2; });
    return { acting: true, fullPad: true, J, kind: 'lintel', down: (a) => C.down(a), move: (a) => C.move(a), up: (a) => C.up(a), sgn: sgnR47,
      ppa: () => { const p0 = proj(G.x, G.y + 20, G.z), p1 = proj(G.x + 1, G.y + 20, G.z); return p0 && p1 ? Math.abs(p1.x - p0.x) : 20; },
      view() { const v = gateView(13, 0, OBJ54.gate); v.p[1] = v.t[1] = PL.gate.y + 11.5; return v; },   // (the lintel at the posts' top, 21.6 amot, in the frame: the shot at the top had it out) ── build 54 ── (OBJ54.gate: nearer; level at 11.5 amot — the lintel's top and his feet, 6 amot before the gate, both in the frame: from 6 up he was cut at the shoulders) ── /build 54 ──
      frame(dt) { C.frame(dt); if (endT >= 0) { endT -= dt; if (endT <= 0) { svgClear(); return true; } } return false; },
      end() { svgClear(); if (st.ui.pad) st.ui.pad.classList.remove('full'); } };
  }
  /** FIT: the door leaf on its pivot — the pin into the socket (a drag down; its angle), then a flick swings it (bound — the wedge); the heavy
   *  leaf of the seventh gate first lifted on the two cranes (level 3, swaying) */
  function mkLeaf(idx, heavy) {
    const LF = famL('fit'), J = F.createLeaf47(LF), G = PL.gate, g0 = G.y, piv = st.props.leaves[idx], sx = piv.userData.sx, pivX = G.x + sx * GATE47.half;
    const LJ = heavy ? F.createLintel47(Math.max(3, famL('lift')), { heavy: true }) : null; let qLift = null, phase = heavy ? 'lift' : 'pin', anim = null, endT = -1, flickT0 = 0, stuck54 = 0;
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
      // ── build 54 ── (§2 stage 04: "you can't see whether it stuck") while the pin goes down: a macro on the pin and its socket (from the north,
      // 6.5 amot, a little above — the pin's foot, the socket's rim, the leaf's edge) ── /build 54 ──
      ownView: () => phase === 'pin',
      view() { if (phase === 'lift') return gateView(12, 0, OBJ54.leaf7); if (phase === 'pin') { const tx = pivX - sx * 0.3; return { p: [pivX - sx * 4, g0 + 1.7, G.z + 5.7], t: [tx, g0 + 1.5, G.z] }; }   /* (level, 6.8 amot off: the socket and the leaf's foot both in the frame — from 2.8 up, looking down, the pin hung at the frame's top under the line: S54-leafW) */   /* ── build 54 ── (from the court's side: he stands outside, behind the posts — not in the macro) ── /build 54 ── */ const v = gateView(10); v.t[0] = pivX - sx * GATE47.leafW / 2; v.p[0] = v.t[0] - 2; return v; },
      frame(dt) {
        if (phase === 'pin') objPlace(true, [{ x: pivX - sx * GATE47.leafW / 2, y: g0 + 9, z: G.z, r: 5 }], 'h47leaf', [{ x: pivX - sx * 0.5, y: g0 + 1.3, z: G.z, r: 1.25 }]); else objPlace(true, [{ x: pivX - sx * GATE47.leafW / 2, y: g0 + 9, z: G.z, r: 5 }], 'h47leaf');   // ── build 54 ── (in the macro: the pin and its socket) ── /build 54 ──
        if (phase === 'lift') { C.frame(dt); return false; }
        svgClear();
        if (stuck54 > 0) { stuck54 -= dt; const ex = proj(pivX - sx * (GATE47.leafW * 0.95), g0 + 0.6, G.z), op = Math.min(1, stuck54); if (ex) svgAdd(`<g opacity="${op.toFixed(2)}"><circle cx="${ex.x}" cy="${ex.y}" r="22" fill="none" stroke="#E0503A" stroke-width="4"/><path d="M${ex.x - 30} ${ex.y - 8} l-14 -10 M${ex.x + 30} ${ex.y - 8} l14 -10 M${ex.x} ${ex.y - 30} l0 -14" stroke="#E0503A" stroke-width="4" stroke-linecap="round"/><text x="${ex.x}" y="${ex.y + 44}" font-size="16" font-weight="900" text-anchor="middle" fill="#FFF4DC" stroke="#2A1804" stroke-width="3" paint-order="stroke">נתקעה</text></g>`); }
        if (phase === 'pin' && J.state().L <= 1 && !anim) { const a2 = this.pinAt(), b2 = this.socket(); if (a2 && b2) svgAdd(`<line x1="${a2.x}" y1="${a2.y}" x2="${b2.x}" y2="${b2.y}" stroke="#FFD66E" stroke-width="3" stroke-dasharray="6 5"/><circle cx="${b2.x}" cy="${b2.y}" r="9" fill="none" stroke="#FFD66E" stroke-width="3"/>`); }
        if (anim) {
          anim.t += dt; const t = anim.t;
          if (anim.k === 'rim') { const u = t < 0.3 ? t / 0.3 : Math.max(0, 1 - (t - 0.5) / 0.4); piv.position.y = g0 + 0.5 + 2.4 - 1.9 * u; piv.rotation.z = anim.tilt * u; if (t > 0.9) { anim = null; hang(); } }
          else if (anim.k === 'seat') { const u = Math.min(1, t / 0.45); piv.position.y = g0 + 0.5 + 2.4 * (1 - u); if (u >= 1) { anim = null; phase = 'swing'; line(LINE42.leafSwing, `רמה ${LF}`); } }
          else if (anim.k === 'bind') { const u = Math.min(1, t / 0.35); piv.rotation.y = openOf(0.3 * u) + (u >= 1 ? Math.sin(t * 60) * 0.025 * Math.max(0, 1 - (t - 0.35) / 0.35) : 0); if (t > 0.75) { piv.rotation.y = openOf(0.3); anim = null; } stuck54 = 2.2; }   // ── build 54 ── (the stop seen: a jolt, a shudder, and a mark at its foot) ── /build 54 ──
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
  // ── build 54 ── (§2 stage 04: "from above the court is an empty purple plane — the gates don't look like gates") for the names: the court's
  // paving (a canvas of slabs over its floor) and at each gate a gatehouse — two towers 26 amot high and the block over the opening — with its
  // shadow on the paving (the height read from above) ── /build 54 ──
  function court54(on) {
    if (!st.props.root) return;
    if (!st.props.court54) {
      const g = new THREE.Group(), xs = F.GATES47.map((q) => q.x), x0 = Math.min(...xs) - 18, x1 = Math.max(...xs) + 4, z0 = -67.5, z1 = 67.5, cy = gy((x0 + x1) / 2, 0) + 0.12;
      let tex = null; try { if (doc) { const cv = doc.createElement('canvas'); cv.width = 512; cv.height = 512; const c = cv.getContext('2d'); c.fillStyle = '#E4D7BC'; c.fillRect(0, 0, 512, 512); for (let r = 0; r < 16; r++) for (let q = 0; q < 16; q++) { const sh = 205 + ((r * 7 + q * 13) % 23); c.fillStyle = `rgb(${sh + 12},${sh + 2},${sh - 22})`; c.fillRect(q * 32 + 1.5 + (r % 2) * 16, r * 32 + 1.5, 29, 29); } tex = new THREE.CanvasTexture(cv); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set((x1 - x0) / 24, (z1 - z0) / 24); tex.colorSpace = THREE.SRGBColorSpace; } } catch (e) { tex = null; }
      const pv = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshStandardMaterial({ map: tex, color: tex ? '#FFFFFF' : '#E4D7BC', roughness: 0.95 })); pv.rotation.x = -Math.PI / 2; pv.position.set((x0 + x1) / 2, cy, (z0 + z1) / 2); g.add(pv);
      const stoneM = mat('#BFA77A', 0.8), capM = mat('#E2B65A', 0.6), shM = new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.45, depthWrite: false });
      for (const q of F.GATES47) { const ax = q.side === 'E', y0 = gy(q.x, q.z), gh = new THREE.Group();
        for (const sx of [-1, 1]) { const t = new THREE.Mesh(new THREE.BoxGeometry(ax ? 9 : 6, 26, ax ? 6 : 9), stoneM); t.position.set(ax ? 0 : sx * 8, 13, ax ? sx * 8 : 0); gh.add(t); }
        const top = new THREE.Mesh(new THREE.BoxGeometry(ax ? 9 : 22, 5, ax ? 22 : 9), capM); top.position.y = 23.5; gh.add(top);
        const sh = new THREE.Mesh(new THREE.PlaneGeometry(ax ? 14 : 26, ax ? 26 : 14), shM); sh.rotation.x = -Math.PI / 2; sh.position.set(9, Math.max(0, cy - y0) + 0.5, 11); sh.renderOrder = 2; gh.add(sh);
        gh.position.set(q.x, y0, q.z); g.add(gh); }
      st.props.root.add(g); st.props.court54 = g;
    }
    st.props.court54.visible = !!on;
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
    court54(true);   // ── build 54 ── the court and its gatehouses from above ── /build 54 ──
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
      view() { const c = { x: -93, z: 6 }, Hh = Math.max(230, 110 / tanV()); return { p: [c.x, Hh, c.z - Hh * 0.18], t: [c.x, 0, c.z] }; },   // (ש8: over the court, north at the screen's bottom)   // ── build 54 ── (a little higher, its middle 6 amot south: the south gates' row stood under the line's box at 640 — K54-P-04) ── /build 54 ──
      ownView: () => true,
      frame(dt) {
        objPlace(true, [{ x: -93, y: 8, z: 0, r: 90 }], 'h47names');
        for (const c of closing) { c.t += dt; const u = Math.min(1, c.t / 0.9), e = 1 - (1 - u) * (1 - u); (st.props.gl47[c.i] || []).forEach((pv) => { pv.rotation.y = pv.userData.sx * 1.1 * (1 - e); }); }
        svgClear(); const S2 = N.state();
        for (const q of F.GATES47) { const p2 = at(q); if (!p2) continue; const set = S2.set.includes(q.id); svgAdd(`<circle cx="${p2.x}" cy="${p2.y}" r="${set ? 9 : 16}" fill="${set ? '#E8B531' : 'rgba(255,214,110,.22)'}" stroke="#FFD66E" stroke-width="3"/>${set ? `<text x="${p2.x}" y="${p2.y + (q.z > 0 ? 30 : -18) + (q.side === 'E' ? 0 : (q.z > 0 ? 1 : -1) * (F.GATES47.filter((g) => g.side === q.side).indexOf(q) % 2 ? 0 : 18))}" font-size="${W() < 700 ? 13 : 15}" font-weight="900" text-anchor="middle" fill="#FFF4DC" stroke="#2A1804" stroke-width="4" paint-order="stroke">${esc(q.n)}</text>` : ''}`); }   /* ── build 54 ── (the name beside its gate, larger, off the wall's side) ── /build 54 ── */
        if (endT >= 0) { endT -= dt; if (endT <= 0) { svgClear(); return true; } }
        return false;
      },
      end() { pile.innerHTML = ''; svgClear(); court54(false); },
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
      view(h) { if (endT >= 0) { const mx = A.x + len / 2; return { p: [mx, gy(mx, A.z) + 21, A.z - 34], t: [mx, gy(mx, A.z), A.z] }; } const D = Math.max(24, needD() + 1.5), su = J.state().stones, pu = su.length ? su[su.length - 1] : 0, mx = A.x + (pu + Math.max(h.x - A.x, pu + len / ((J.state().n || 3) + 1))) / 2; return { p: [mx, h.y + 2.6 + D * 0.24, h.z - D], t: [mx, h.y + 2.6, h.z + 3] }; },   // ── build 54 ── (the stretch from the last stone to him or the next even place, in the middle of the frame) ── /build 54 ──
      frame(dt) {
        const h = hero(), s = J.state();
        // ── build 54 ── (the object rule: the thing is the stretch where the next stone goes — from the last stone (or the post) one even gap on —
        // not his own figure; the touch stays on him, the whole screen) ── /build 54 ──
        const prevU = s.stones.length ? s.stones[s.stones.length - 1] : 0, gapU = len / ((s.n || 3) + 1), gy0 = gy(A.x, A.z);
        objPlace(!s.done, [{ x: h.x, y: h.y + 1.2, z: h.z, r: 1.6 }], 'h46warn', [{ x: A.x + prevU + 0.6, y: gy0 + 0.6, z: A.z, r: 0.6 }, { x: A.x + Math.min(len, prevU + gapU) - 0.6, y: gy0 + 0.6, z: A.z, r: 0.6 }]);   // (the act's surface on: held anywhere — the bot's events reached the pad, a finger never did: K46-P)
        if (!s.done && walkDir && ((walkDir < 0 && h.x <= A.x + 0.05) || (walkDir > 0 && h.x >= A.x + len - 0.05))) walkDir = -walkDir;   // (at the soreg's post he turns back: the fence goes on only one way — K46-P2 held toward the post for minutes)
        if (!s.done && walkDir) { const stop = (walkDir < 0 && h.x <= A.x + 0.05) || (walkDir > 0 && h.x >= A.x + len - 0.05); try { stages.hero.drive(stop ? 0 : walkDir * WARN54.v, (z - h.z) * 3); } catch (e) { /* */ } }   /* ── build 54 ── (3 amot/s: at 6 he passed the place — §4 important 13) ── /build 54 ── */   // (the stretch's ends stop him: K46-S walked on past post A, the stones all refused there)
        if (h.x < A.x - 0.4 || h.x > A.x + len + 0.4) { try { stages.hero.drive(0, 0); stages.hero.setPos(Math.max(A.x, Math.min(A.x + len, h.x)), z, 0); } catch (e) { /* */ } }
        J.walk(Math.max(0, Math.min(len, h.x - A.x)) - s.x);
        svgClear();
        // ── build 54 ── the gauge (§2 stage 03: "no mark of distance"): from the last stone to him on the ground, a tick each amah, the count ── /build 54 ──
        if (!s.done && endT < 0) { const pu = s.stones.length ? s.stones[s.stones.length - 1] : 0, hu = Math.max(0, Math.min(len, h.x - A.x)), y2 = gy(A.x, A.z) + 0.1, a0 = proj(A.x + pu, y2, A.z - 0.9), a1 = proj(A.x + hu, y2, A.z - 0.9);
          if (a0 && a1) { let g = `<line x1="${a0.x}" y1="${a0.y}" x2="${a1.x}" y2="${a1.y}" stroke="#FFD66E" stroke-width="5" stroke-linecap="round"/>`; for (let k2 = 1; k2 < Math.floor(hu - pu + 1e-6) + 1; k2++) { const q = proj(A.x + pu + k2, y2, A.z - 0.9); if (q) g += `<line x1="${q.x}" y1="${q.y - 7}" x2="${q.x}" y2="${q.y + 7}" stroke="#FFF4DC" stroke-width="2"/>`; }
            g += `<text x="${(a0.x + a1.x) / 2}" y="${Math.min(a0.y, a1.y) - 14}" font-size="16" font-weight="900" text-anchor="middle" fill="#FFF4DC" stroke="#2A1804" stroke-width="3" paint-order="stroke">${Math.round((hu - pu) * 10) / 10} אמות</text>`; svgAdd(g); } }
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
        M.t += dt; { const yP = gy(PL.bow0.x, z); objPlace(M.phase !== 'end', [{ x: bowAt(Math.max(0, Math.min(12, M.at))), y: yP + 1, z: PL.bow0.z, r: 1.4 }], 'h46bows', [{ x: priests[0].g.position.x, y: yP + 2.4, z, r: 1.4 }, { x: priests[N - 1].g.position.x, y: yP + 2.4, z, r: 1.4 }]); }   // ── build 54 ── (the thing of this moment is the procession — the camera's and the rule's — the touch on the mark; the inspector called the low view along the soreg "a good moment": kept) ── /build 54 ──
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
      acting: true, J, kind: 'line', ends, fullPad: true,   // ── build 53 ── (the whole screen takes the drag; touch40's ring round the whole line — half the screen round him, §2 stage 02 — gone: the ring on the near peg only, below) ── /build 53 ──
      down(a) { const q = uv(a.x, a.y); if (q) J.down(q.u, q.d); path = J.state().on ? [[a.x, a.y]] : []; if (!J.state().on) line('מתחילים ביתד הקרובה — שם החוט קשור · המחשה', `רמה ${J.state().L}`); },
      move(a) { const q = uv(a.x, a.y); if (!q) return; J.move(q.u, q.d); if (J.state().on || J.state().done) path.push([a.x, a.y]); const k = Math.max(0, Math.min(1, q.u)); ropeTo(A.x + (B.x - A.x) * k, ya + (yb - ya) * k, A.z + (B.z - A.z) * k); },
      up() { J.up(); if (!J.state().done) path = []; },
      frame() {
        const s = J.state(), E = ends(); objPlace(true, [{ x: (A.x + B.x) / 2, y: (ya + yb) / 2, z: (A.z + B.z) / 2, r: Math.hypot(B.x - A.x, B.z - A.z) / 2 }], 'h45line');
        if (st.ui.pad) st.ui.pad.classList.add('full');
        svgClear(); if (E) { svgAdd(`<circle cx="${E.a.x}" cy="${E.a.y}" r="14" fill="rgba(255,214,110,.35)" stroke="#FFD66E" stroke-width="2"/>${s.on ? '' : `<circle cx="${E.a.x}" cy="${E.a.y}" r="26" fill="none" stroke="#FFE6A0" stroke-width="3" stroke-dasharray="6 4"><animate attributeName="opacity" values=".45;1;.45" dur="1.4s" repeatCount="indefinite"/></circle>`}<circle cx="${E.b.x}" cy="${E.b.y}" r="30" fill="rgba(255,214,110,.18)" stroke="none"/><circle cx="${E.b.x}" cy="${E.b.y}" r="14" fill="rgba(255,214,110,.75)" stroke="#FFF2C0" stroke-width="3"/>`); /* ── build 53 ── (the ring on the near peg — where to start — till the drag holds; the far peg lit, §4 stage 02) ── /build 53 ── */ if (s.L <= 1) svgAdd(`<line x1="${E.a.x}" y1="${E.a.y}" x2="${E.b.x}" y2="${E.b.y}" stroke="#FFE6A0" stroke-width="1.5" stroke-dasharray="3 6" opacity=".6"/>`); }
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
    // ── build 53 ── (the inspector's review §2: "the light does not look like light — no beam") a lamp held low by the rock and its beam — a
    // cone of light raking the face where the finger holds it (additive, no depth write) ── /build 53 ──
    const beam = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#FFE3A0', transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), new THREE.MeshBasicMaterial({ color: '#FFF1C4' }));
    beam.visible = lamp.visible = false; beam.renderOrder = 6; if (st.props.root) st.props.root.add(beam, lamp);
    const UP = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3();
    const beamAt = (u) => { const lx = C.x - 2.8 + 5.6 * u, A = new THREE.Vector3(lx - 0.6, C.y - 0.7, C.z + 4.2), B = new THREE.Vector3(lx, C.y + 0.1, C.z + 0.9); dir.subVectors(A, B); const L2 = dir.length() || 1; beam.scale.set(1, L2, 1); beam.position.copy(A).add(B).multiplyScalar(0.5); beam.quaternion.setFromUnitVectors(UP, dir.normalize()); lamp.position.copy(A); beam.visible = lamp.visible = true; };
    return {
      acting: true, J, kind: 'rock', box, beam: () => beam.visible,
      end() { try { beam.parent && beam.parent.remove(beam); lamp.parent && lamp.parent.remove(lamp); beam.geometry.dispose(); lamp.geometry.dispose(); } catch (e) { /* */ } },
      // ── build 53 ── (§2 stage 01: "the rock is small" — ש4's macro) the rock VIEW53.rock of the width, from its south and a little above —
      // across the line the light sweeps (the overlay's box is the rock's east–west); he stands off its east end, out of the frame ── /build 53 ──
      view(h) { const c = camera(), tanV = Math.tan((((c && c.fov) || 50) * Math.PI) / 360), tanH = tanV * (W() / H()), D = 5.6 / (2 * VIEW53.rock * tanH), sx = h && h.x > C.x ? -1 : 1; return { p: [C.x + sx * 4.5, C.y + 0.6 + D * 0.3, C.z + D], t: [C.x + sx * 0.6, C.y - 0.1, C.z] }; },   // (4.5 to the side away from him: at 0.8 and 2.6 his near figure stood huge, cut, at the frame's edge — the AFTER pages' 'big' at the rocks) lines: () => { const B = box(); return B ? J.rock.lines.filter((l) => J.state().seen[l.id]).map((l) => ({ id: l.id, ...seg(l, B) })) : []; },
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
          if (s.light >= 0 && !s.done) beamAt(s.light); else beam.visible = lamp.visible = false;   // ── build 53 ── ── /build 53 ──
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
    // ── build 53 ── (§4 important 10: "no course under it — 'a tile over a brick' says nothing in course 1") in stage 01 his first course is the
    // second: over the crews' course (laid before, seen whole), on the course whose joints he must cover; nn: the course's height ── /build 53 ──
    const n53 = STG === 'har' ? 1 : 0, nn = n + n53, yBelow = n53 ? 1.5 + (nn - 1) * 1.0 : 0.5 + (n > 0 ? n - 1 : 0) * 1.0;   // (the course under his: stage 01 — on the crews' course; stage 02 as it was)
    const L = famL('place'), spec = kind ? F.wallSpec45(kind, L, n) : F.courseSpec(n, L), J = F.createCourse(spec), U = 1.2, C = { x: PL.course.x, y: PL.course.y + 1.5 + nn * 1.0, z: PL.course.z };
    line(kind === 'corner' ? LINE42.wcorner : kind === 'top' ? LINE42.top : LINE42.place, `נדבך ${nn + 1} · רמה ${L}`);
    // the course below (the crews'), and the crews' stones of this course outside his stretch, laid one by one
    const g = st.props.course; const box3 = (len, x0, y) => { const m = ashlar(len * U - 0.1, 0.96, 1.2); m.position.set((x0 + len / 2) * U - 7, y, 0); g.add(m); return m; };   // (build 43: drafted margins and a boss)
    if (n === 0 || (STG === 'wall' && !g.userData.below)) { g.userData.below = 1; let x = 0; const bl = spec.below.concat([15]); for (const j of bl) { box3(j - x, x, yBelow); x = j; } }
    if (n53 && n === 0 && !g.userData.base53) { g.userData.base53 = 1; let x = 0; for (const j of [3.5, 6.5, 9, 12.5, 15]) { box3(j - x, x, 0.5); x = j; } }   // ── build 53 ── the crews' course under it all (its own joints), its top at the ground's level + 0 — the course he builds on stands on it ── /build 53 ──
    // ── build 45 ── a corner at the course's east end: the corner stone the other way from the one below (they alternate, המחשה) — the one below is shown
    const cornerM = (dir, y) => { const m = new THREE.Group(), a1 = ashlar(2 * U - 0.1, 0.96, 1.2), a2 = ashlar(1.1, 0.96, 1.8); a2.position.set(dir === 'a' ? 0.55 - U : U - 0.55, 0, 1.45); m.add(a1, a2); m.position.set((spec.b - 1) * U - 7, y, 0); g.add(m); return m; };
    if (spec.corner) cornerM(spec.corner.want === 'a' ? 'b' : 'a', yBelow);
    const settle = (m) => { if (!m) return; const y1 = m.position.y; m.position.y = y1 + 0.7; st.anims = (st.anims || []).concat([{ m, y0: y1 + 0.7, y1, t: 0, T: 0.22 }]); buzz42('settle'); o.emit && o.emit('h45thud', {}); };   // (#6: it settles by itself — a short drop, the thud, the haptic)
    const crew = []; for (let x = 0; x < spec.a; x += 2) crew.push([x, Math.min(2, spec.a - x)]); for (let x = spec.b; x < 15; x += 3) crew.push([x, Math.min(3, 15 - x)]);
    let crewT = 0, crewN = 0, graded = false, backT = 0, fitT = 0;
    // the pile
    const pile = st.ui.pile; pile.innerHTML = '';
    const laid = [];
    for (const len of F.PLACE42.lens) { const b = el('h42-it', `${'▭'.repeat(1)} ${len}`, 'button'); b.type = 'button'; b.dataset.len = String(len); b.setAttribute('aria-label', `אבן באורך ${len}`); pile.appendChild(b); dragItem(b, (drop) => tryPlace(len, b, drop)); }
    if (spec.corner) for (const dir of ['a', 'b']) { const b = el('h42-it', dir === 'a' ? '┐ פינה' : '┌ פינה', 'button'); b.type = 'button'; b.dataset.corner = dir; b.setAttribute('aria-label', `אבן פינה ${dir === 'a' ? 'לצפון' : 'לדרום'}`); pile.appendChild(b); dragItem(b, (drop) => { const q = uAt(spec.b - 1); if (!q || Math.hypot(drop.x - q.x, drop.y - q.y) > Math.max(70, H() * 0.22)) return false; const r = J.placeCorner(dir, { dragPx: drop.px }); if (r === 'ok') { const cm = cornerM(dir, 1.5 + nn * 1.0); cm.userData.his = 1; settle(cm); b.remove(); const o2 = pile.querySelector('[data-corner]'); if (o2) o2.remove(); if (dir !== spec.corner.want) line('הפינה באותו כיוון כמו שמתחת — חיבור חלש · המחשה', `נדבך ${nn + 1}`); return true; } return false; }); }
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
      if (r === 'ok') { const [s0, l0] = J.state().last; const m = box3(l0, s0, 1.5 + nn * 1.0); m.userData.his = 1; laid.push(m); settle(m); return true; }
      if (r === 'unsettled') line('החזיקו רגע על הנדבך — שתתיישב · המחשה', `נדבך ${nn + 1}`);
      if (r === 'long' || r === 'gap') { b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); buzz42('retry'); line(r === 'gap' ? 'תישאר שם פרצה קטנה מדי — גררו אבן אחרת · המחשה' : 'אין לה מקום שם — גררו אבן קצרה יותר · המחשה', `נדבך ${nn + 1}`); backT = 2.6; }   // (build 45: the verb kept, and back to the course's own line in 2.6 s — the naive kid K45-P read "בחרו" as no task and walked for 5 minutes)
      return false;
    }
    return {
      acting: true, dragOnly: true, J, kind: 'course', slot: slotBox, uAt, spec, cornerAt: () => (spec.corner ? uAt(spec.b - 1) : null),
      // ── build 53 ── (§4 important 10) stage 01's courses from the side — the course's far face, him beyond it (never between): his stretch
      // VIEW53.course of the width, a little from above; the pile below it ── /build 53 ──
      view: n53 ? () => { const c = camera(), tanV = Math.tan((((c && c.fov) || 50) * Math.PI) / 360), tanH = tanV * (W() / H()), Ls = Math.max(4, (spec.b - spec.a) * U + 0.6), D = Math.max(VIEW53.courseMin, Math.min(VIEW53.courseMax, Ls / (2 * VIEW53.course * tanH))), mx = C.x + ((spec.a + spec.b) / 2) * U - 7, el2 = 0.18; return { p: [mx, C.y + 0.4 + Math.sin(el2) * D, C.z + Math.cos(el2) * D], t: [mx, C.y + 1.0, C.z] }; } : null,   // (el 0.18 and the look an amah over the course's top: his head in the frame beyond it — the first pages' cut it)
      down() {}, move() {},
      up(a) { if (J.state().prot && J.state().prot.length && Math.hypot(a.x - a.x0, a.y - a.y0) >= F.DRAG42) { const i = J.state().prot[0], m = laid[i]; if (J.pushIn({ dragPx: Math.hypot(a.x - a.x0, a.y - a.y0) }) === 'ok' && m) { m.position.z = 0; buzz42('settle'); } } },   // (the retreat: a drag pushes the next stone that stands out back into line)
      frame(dt) {
        if (J.state().prot && J.state().prot.length && !this.plumb) { this.plumb = 1; this.dragOnly = false; J.state().prot.forEach((i) => { if (laid[i]) laid[i].position.z = 0.35; }); line(LINE42.retreat, `נדבך ${nn + 1} · רמה ${L}`); }
        if (backT > 0 && (backT -= dt) <= 0 && !J.state().done && !(J.state().prot && J.state().prot.length)) line(kind === 'corner' ? LINE42.wcorner : kind === 'top' ? LINE42.top : LINE42.place, `נדבך ${nn + 1} · רמה ${L}`);
        fitT -= dt; if (fitT <= 0) { fitT = 0.3; for (const it of pile.querySelectorAll('.h42-it[data-len]')) { const len = +it.dataset.len; let ok = false; for (let s0 = spec.a; !ok && s0 + len <= spec.b; s0++) ok = J.fits(len, s0 + len / 2); it.classList.toggle('nofit', !ok); } }   // ── build 45 ── the stones that fit no free place are dimmed
        crewT += dt; if (crewN < crew.length && crewT > 1.6) { crewT = 0; const [x, len] = crew[crewN++]; box3(len, x, 1.5 + nn * 1.0); }
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
    // ── build 53 ── (the inspector's review §4 must 6: "the roller is a ⟳ button by the stone, not the roller itself") the freed roller is a
    // thing in the world: it rolls out behind the stone and lies there, lit; touched where it lies (touch40's object over it) and dragged, it
    // is carried to the front. No button. The crews pull the stone on ropes before it, leaning to the chant's beat ── /build 53 ──
    let beatT = 0, carry = null, xNow = PL.roll0.x;
    const fr = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 4.4, 12), new THREE.MeshStandardMaterial({ color: '#C89A62', emissive: '#8A5410', emissiveIntensity: 0.6, roughness: 0.8 })); fr.rotation.x = Math.PI / 2; fr.visible = false; if (st.props.root) st.props.root.add(fr);
    const team = st.props.team53 || null;
    const frAt = (x) => ({ x: x - 7.4, y: PL.roll0.y + 0.45, z: PL.roll0.z });
    const stoneBack = (x) => [{ x: x - 4, y: PL.roll0.y + 1.4, z: PL.roll0.z, r: 3.6 }];
    return {
      acting: true, J, kind: 'roll',
      handle: () => { if (!J.state().free || carry) return null; const f = frAt(xNow), q = proj(f.x, f.y, f.z); return q ? { left: q.x - 22, top: q.y - 22, width: 44, height: 44, x: q.x, y: q.y } : null; },   // (the freed roller's place on the screen — the tools)
      roller: () => (fr.visible && !carry ? { ...frAt(xNow) } : null),
      // (a view of its own, from the north — across the stone's way: the freed roller behind it, the stone whole, the crew on its ropes before
      // it; him beyond the stone, never over it; it follows the stone — the first page's view from behind him showed neither the roller's
      // place nor the crew)
      view() { const y = PL.roll0.y; return { p: [xNow + 0.5, y + 5.5, PL.roll0.z + VIEW53.roll], t: [xNow + 0.5, y + 1.4, PL.roll0.z] }; },
      down() {}, move() {},
      up(a) {
        if (!J.state().free || carry) return;
        const r = J.moveRoller({ dragPx: Math.hypot(a.x - a.x0, a.y - a.y0) });
        if (r === 'ok') { buzz42('heavy'); carry = { t: 0, from: frAt(xNow) }; }
        else if (r === 'tap') line('גררו את הגליל — קדימה, אל חזית האבן · המחשה', `גלגלים: ${J.state().moved} / ${F.ROLL42.moves}`);
      },
      end() { try { if (fr.parent) fr.parent.remove(fr); fr.geometry.dispose(); } catch (e) { /* */ } },
      frame(dt) {
        const s = J.step(dt); beatT += dt; if (beatT > s.beat) { beatT = 0; if (!s.waiting) buzz42('tick'); }
        const x = PL.roll0.x + s.x * 2; xNow = x; if (st.props.big) st.props.big.position.x = x;
        if (st.props.rollers) st.props.rollers.forEach((c, i) => { const k = (i + s.moved) % 4; c.position.x = x - 4.5 + k * 3; c.rotation.y += dt * (s.waiting ? 0 : 2); c.visible = !((s.free && !carry && k === 0) || (carry && k === 3)); });
        if (carry) { carry.t += dt; const u = Math.min(1, carry.t / 0.6), e = u * u * (3 - 2 * u), x1 = x + 4.5; fr.position.set(carry.from.x + (x1 - carry.from.x) * e, carry.from.y + Math.sin(Math.PI * u) * 1.4, carry.from.z); fr.visible = true; if (u >= 1) { carry = null; fr.visible = false; } }
        else if (s.free) { const f = frAt(x); fr.position.set(f.x, f.y, f.z); fr.rotation.y += dt * 0.5; fr.visible = true; } else fr.visible = false;
        if (team) team.pull(x, dt, s.waiting);
        // the touch: the roller where it lies (when free); else the stone's back, where it will come out — the thing's box (the camera's) stays the stone's back
        if (s.free && !carry) { const f = frAt(x); objPlace(true, [{ x: f.x, y: f.y + 0.3, z: f.z, r: 1.7 }], 'h42roll', stoneBack(x)); } else objPlace(true, stoneBack(x), 'h42roll');
        line(s.waiting ? 'האבן נעצרה — אין גליל בחזית. גררו את הגליל קדימה · המחשה' : LINE42.roll, `גלגלים: ${s.moved} / ${F.ROLL42.moves} · השירה קובעת את הקצב`);
        if (s.done) { const q = proj(x, PL.roll0.y + 2, PL.roll0.z); grade('roll', s.q, q); fr.visible = false; if (team) team.pull(x, 0, true); return true; }
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
      // ── build 53 ── (§4 important 9) a macro on the parapet stone's face: the stone VIEW53.trace of the width (the dots' line then spans
      // ≥ 120 px at 640 × 296), from in front and a little above; he stands off its end — out of the frame ── /build 53 ──
      view() { const c = camera(), tanV = Math.tan((((c && c.fov) || 50) * Math.PI) / 360), tanH = tanV * (W() / H()), D = 3.4 / (2 * VIEW53.trace * tanH), T = [PL.trace.x, PL.trace.y + 0.78, PL.trace.z + 0.5]; return { p: [T[0], T[1] + D * 0.16, T[2] + D], t: T }; },
      move(a) { if (a.moved < 8) return; const P2 = pts(); if (!P2 || hit >= N) return; const q = P2[hit]; if (Math.hypot(a.x - q.x, a.y - q.y) < 30) { hit++; lastT = now(); buzz42('tick'); } },
      frame() {
        objPlace(true, [{ x: PL.trace.x + 1.15, y: PL.trace.y + 0.9, z: PL.trace.z + 0.55, r: 0.4 }, { x: PL.trace.x - 1.15, y: PL.trace.y + 0.9, z: PL.trace.z + 0.55, r: 0.4 }], 'h42trace', [{ x: PL.trace.x + 1.2, y: PL.trace.y + 0.7, z: PL.trace.z, r: 0.5 }, { x: PL.trace.x - 1.2, y: PL.trace.y + 0.7, z: PL.trace.z, r: 0.5 }]);   // ── build 53 ── (in the macro: the touch ring round the dots' line, the camera's thing the stone — the first page's 2-amah sphere drew a ring larger than the screen) ── /build 53 ──
        svgClear(); const P2 = pts(); if (P2) P2.forEach((q, i) => svgAdd(`<circle cx="${q.x}" cy="${q.y}" r="${i < hit ? 10 : 9}" fill="${i < hit ? '#2A1804' : 'rgba(42,24,4,.15)'}" stroke="#FFE6A0" stroke-width="3"/>`));   // ── build 53 ── (in the macro: a finger's dots) ── /build 53 ──
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
    const m = MATOF[STG === 'nashim' && part === 'corner' ? 'corner48' : part];   // ── build 49 ── (stage 01's corner costs nothing: build 48's duplicate key charged it stage 05's)
    if (m && !F.enough42(S.mat, m)) { st.part = 'out'; st.target = null; line(''); card('השיירה של היום נגמרה', [LINE42.out, '~הצוותים ממשיכים לבנות גם כשאתם לא כאן · המחשה'], 'עד מחר', () => {}); return; }
    if (m) { F.spend42(S.mat, m); matChip(); save42(S); }
    st.part = part; st.job = null; st.near = false; st.camLock = null; st.a53 = null; st.o53 = null; st.lock54 = null; svgClear(); if (st.ui.pile) st.ui.pile.innerHTML = '';
    st.target = standOf(part); G39.reset();
    if ((STG === 'lishka' || STG === 'guf') && st.target) { const h0 = hero(); if (Math.hypot(h0.x - st.target.x, h0.z - st.target.z) > 30) { try { stages.hero.setPos(st.target.x + 3, st.target.z + 3, 0); } catch (e) { /* */ } } }   // ── build 50 ── (across the courts, the chambers are far apart: a cut to the next — the walk round the Heichal's ground stuck at a wall)
    const p = PART[part];
    if (st.target && part !== 'rope') { line(LINE42.walk, labelOf(part)); st.pending = p; }
    else { st.pending = null; p.begin && p.begin(); }
  }
  const labelOf = (part) => (STG === 'nashim' && part === 'corner' ? 'הפינה שלכם' : part === 'corner' ? 'אבן הפינה' : null) || ({ decoy: 'מה פסול ומה רק נראה פסול', kevesh: 'הכבש', sid: 'הסיד', light: 'אור צד', tap: 'הקישו והקשיבו', sovev: 'הסובב', thread: 'חוט הסיקרא', inspect: 'הבדיקה הראשונה', field: 'אבני שדה', nail: 'מבחן הציפורן', iron: 'בלי ברזל', last: 'השורה האחרונה', stone: 'אבן עם סדק', mud: 'בוץ או סדק', compass: 'לשכת הגזית — המחוגה', benches: 'הספסלים', hub: 'לשכת הגולה — הגלגל', wheel: 'הדליים', dome: 'בית המוקד — הכיפה', arch: 'הקשת', voyage: 'מסע הדלתות', lever: 'מוט ויתדות', hang: 'הכנף על הציר', steps: 'חמש עשרה המעלות', step: 'מעלה מכוונת', wood: 'לשכת העצים', beams: 'קורות הגזוזטרא', pegs: 'השגמים והיתדות', walk: 'ההליכה על הגזוזטרא', log: 'בדיקת העצים', beam: 'קורה לשקע', peg: 'שגם ויתד', lintel: 'המשקוף', leaf: 'כנף הדלת', leaf7: 'הכנף הכבדה', names: 'שבעת השערים', lattice0: 'לוח הסריג', lattice1: 'הסריג השזור', lattice2: 'הסריג בשני גוונים', lattice: 'הסריג', warn: 'אבני האזהרה', bows: 'ההשתחוויות', line: 'החוט', pulley: 'הגלגלת', wcourse0: 'הנדבך', wcourse1: 'הנדבך הבא', giant: 'אבן הענק', wcorner: 'הפינה', top: 'הנדבך העליון', lift: 'גלגל הדריכה', corner: 'אבן הפינה', rock0: 'הסלע הראשון', rock1: 'הסלע השני', rock2: 'הסלע השלישי', course0: 'הנדבך', course1: 'הנדבך הבא', roll: 'האבן הגדולה', pave: 'הריצוף', trace: 'אבן המעקה' })[part] || '';
  function endPart() { const p = PART[st.part]; if (st.job && st.job.end) st.job.end(); if (p && p.end) p.end(); if (st.job && st.job.el) st.job.el.forEach((e) => { try { e.remove(); } catch (err) { /* */ } }); st.job = null; objPlace(false); if (MODE !== 'stage') { svgClear(); if (st.ui.pile) st.ui.pile.innerHTML = ''; line(''); st.part = 'menu'; const cb = st.onAct; st.onAct = null; Lover = 0; if (cb) setTimeout(() => cb(st.actQ, st.actRating), st.pull ? 2700 : 700); return; } startPart(R.part + 1); }
  function finish() { st.part = 'done'; }
  function finishCard() {
    const n = { mehudar: 0, kasher: 0, tikkun: 0 }; for (const g of R.grades) n[g[1]] = (n[g[1]] || 0) + 1;
    R.done = Date.now(); save42(S);
    cardView57();   // ── build 57 ── (§1 rule 12: him seen in the left third, the card on the right two-thirds)
    const fc = card(STG === 'guf' ? 'גוף המזבח והכבש — נבנו' : STG === 'sovev' ? 'הסובב וחוט הסיקרא — נבנו' : STG === 'yesod' ? 'יסוד המזבח — נבנה' : STG === 'lishka' ? 'הלשכות — נבנו' : STG === 'nikanor' ? 'שער ניקנור וט״ו המעלות — נבנו' : STG === 'nashim' ? 'עזרת הנשים — נבנתה' : STG === 'gates' ? 'שערי העזרה — נבנו' : STG === 'soreg' ? 'הסורג והחיל — נבנו' : STG === 'wall' ? 'חומת העזרה — נבנתה' : 'שיטוח ההר — נבנה', [`${RATE30.icon.mehudar} מהודר ${n.mehudar} · ${RATE30.icon.kasher} כשר ${n.kasher} · ${RATE30.icon.tikkun} טעון תיקון ${n.tikkun}`, `ידיים: ${Math.round(R.hands / 60)} דק׳`, ...(STG === 'nashim' ? [`ספר הפגימות: ${Object.keys(S.book48 || {}).length} עמודים`] : []), ...(STG === 'soreg' ? [FIND46, `השתחוויות: ${(R.bows && R.bows.joined) | 0} יחד עם התהלוכה`] : []), ...(STG === 'lishka' ? [FIND50] : []), ...(STG === 'yesod' ? [`ספר הפגימות: ${Object.keys(S.book48 || {}).length} עמודים`] : []), ...(STG === 'sovev' ? [`ספר הפגימות: ${Object.keys(S.book48 || {}).length} עמודים · חוט הסיקרא נשטף: ${(R.wash56 | 0)} פעמים`] : []), ...(STG === 'guf' ? [`ספר הפגימות: ${Object.keys(S.book48 || {}).length} עמודים · הכבש בראשו: ${Math.abs(+R.kev57 || 0) < 0.3 ? 'ישר' : `${Math.abs(Math.round(+R.kev57))} טפחים`} · סיד: ${R.sid57 ? R.sid57.d + R.sid57.s : 0} טפטופים ופסים`] : []), ...(STG === 'nikanor' ? [`הסערה: ${R.voy && R.voy.rating ? `${RATE30.icon[R.voy.rating]} ${RATE30.he[R.voy.rating]}` : '—'} · גלים שחזרו: ${(R.voy && R.voy.replays) | 0}`, FIND49] : []), `נפתח: ${STG !== 'har' ? o.nextName || 'השלב הבא' : 'חומת העזרה'}`, ...(STG === 'guf' ? SRC57 : STG === 'sovev' ? SRC56 : STG === 'yesod' ? SRC55 : STG === 'lishka' ? SRC50 : STG === 'nikanor' ? SRC49 : STG === 'nashim' ? SRC48 : STG === 'gates' ? SRC47 : STG === 'soreg' ? SRC46 : STG === 'wall' ? SRC45 : SRC42).map((x) => `~${x}`)], 'המשך', () => stop(true));
    if (fc) fc.classList.add('h57-end');   // ── build 57 ── (§1 rule 12)
    if (STG === 'sovev' && fc) zorek56(fc);   // ── build 56 ── the end card: the priest's sprinkling — above the red line and below it (Middot 3:1)
  }
  /** ── build 57 ── (§1 rule 12 — "כרטיס סיום בשני שלישים הימניים; הכהן נשאר נראה משמאל") the end card's view: from where the follow camera
   *  stands behind him (a view the walk has already used — no new wall in it), turned toward the screen's right so that he stands in the
   *  left third (CARD57.at of the half-width left of the middle); he is shown, and the card on the right two-thirds (CSS h57-end) */
  function cardView57() {
    try {
      const h = hero(); try { stages.hero.show(true); stages.hero.drive(0, 0); } catch (e) { /* */ }
      const fv = followView(h), c = camera(), tv = Math.tan((((c && c.fov) || 50) * Math.PI) / 360) / ((c && c.zoom) || 1), tH = tv * (W() / H());
      const dx = fv.t[0] - fv.p[0], dz = fv.t[2] - fv.p[2], a = Math.atan(CARD57.at * tH), ca = Math.cos(a), sa = Math.sin(a);   // (a turn to the right by a: he — on the old axis — lands CARD57.at of the half-width left)
      const t = [fv.p[0] + dx * ca - dz * sa, fv.t[1], fv.p[2] + dz * ca + dx * sa];   // (the forward turned toward the screen's right, f × up)
      st.card57 = { p: fv.p, t }; camTo(fv.p, t, 1);
    } catch (e) { /* the card as it is */ }
  }
  /** ── build 56 ── the zorek: a small drawing on the end card — the altar's corner, the red line in its middle, the blood of the upper sprinklings above it and of the lower below ("להבדיל בין דמים העליונים לדמים התחתונים") */
  function zorek56(fc) {
    const box = fc.querySelector('[role="dialog"]'); if (!box) return;
    const p0 = box.querySelector('p');
    const d = doc.createElement('div'); d.className = 'h56-zorek'; d.style.cssText = 'float:left;margin:2px 10px 2px 0;width:132px';
    d.innerHTML = `<svg viewBox="0 0 132 74" width="132" height="74" role="img" aria-label="הזריקה: למעלה מחוט הסיקרא ולמטה ממנו" style="display:block">`
      + `<rect x="58" y="4" width="56" height="62" fill="#d9cfb8" stroke="#8a7d62"/><rect x="52" y="64" width="68" height="7" fill="#cbbfa4" stroke="#8a7d62"/>`
      + `<rect x="58" y="34" width="56" height="3" fill="#c0261b"/>`
      + `<g fill="#9b1010"><circle cx="76" cy="18" r="4"/><circle cx="85" cy="13" r="2.5"/><circle cx="72" cy="26" r="2"/><circle cx="96" cy="50" r="4"/><circle cx="104" cy="56" r="2.5"/><circle cx="90" cy="45" r="2"/></g>`
      + `<text x="54" y="20" font-size="9.5" font-weight="700" text-anchor="start" direction="rtl" fill="#2A1804">דמים עליונים</text><text x="54" y="53" font-size="9.5" font-weight="700" text-anchor="start" direction="rtl" fill="#2A1804">דמים תחתונים</text><text x="54" y="38" font-size="9.5" font-weight="800" text-anchor="start" direction="rtl" fill="#c0261b">חוט הסיקרא</text></svg>`;
    if (p0) box.insertBefore(d, p0); else box.appendChild(d);
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
      if (part === 'lever' && st.props.leafS) { st.props.leafS.rotation.set(0, 0, 0); if (st.props.pole49) st.props.pole49.visible = true; }   // ── build 49 ──
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
      for (let k = 0; k < 40 && st.on && st.job && (st.part === part || (part === 'rock' && /^rock/.test(st.part))); k++) {   // (build 50: the test's rock is rock1 at level 2)
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
        } else if (j.kind === 'wood') {   // ── build 50 ── (the test before chapter ג׳) each log to its pile, as the master reads it
          const J2 = j.J; if (!J2 || J2.state().decided) { await sleep44(400); continue; }
          const T2 = F.WOOD48[J2.state().type], Z = j.zones(), z = T2.bad ? Z.out : Z.altar, G2 = j.geo(), x0 = G2.x + G2.w / 2, y0 = G2.y + G2.h / 2, x1 = z.x + z.w / 2, y1 = z.y + z.h / 2;
          ev(pad, 'pointerdown', x0, y0); at(x0, y0);
          for (let i = 1; i <= 10; i++) { await sleep44(45); const x = x0 + ((x1 - x0) * i) / 10, y = y0 + ((y1 - y0) * i) / 10; ev(pad, 'pointermove', x, y); at(x, y); }
          ev(pad, 'pointerup', x1, y1); await sleep44(2900);
        } else if (j.kind === 'stone55') {   // ── build 55 ── the master turns the stone to its defect, wipes the mud, feels the edge slowly, and decides
          const B = j.box(), Z = j.zones(); if (!B) { await sleep44(300); continue; }
          const drag = async (x0, y0, x1, y1, n, ms) => { ev(pad, 'pointerdown', x0, y0); at(x0, y0); for (let q = 1; q <= n; q++) { await sleep44(ms); const x = x0 + ((x1 - x0) * q) / n, y = y0 + ((y1 - y0) * q) / n; ev(pad, 'pointermove', x, y); at(x, y); } ev(pad, 'pointerup', x1, y1); };
          if (j.mode === 'nail' && j.phase() === 'feel') { const E = j.edge(); if (!E) { await sleep44(300); continue; } await drag(E.a.x + (E.b.x - E.a.x) * 0.02, E.a.y + (E.b.y - E.a.y) * 0.02, E.a.x + (E.b.x - E.a.x) * 0.98, E.a.y + (E.b.y - E.a.y) * 0.98, 44, 70); await sleep44(700); continue; }
          const J2 = j.J; if (!J2) { await sleep44(400); continue; } const s2 = J2.state();
          if (j.mode !== 'nail' && s2.at.face >= 0 && s2.face !== s2.at.face) { await drag(B.cx, B.cy, B.cx - B.w * 0.42, B.cy, 4, 30); await sleep44(700); continue; }
          if (j.mode !== 'nail' && s2.mud === s2.face && s2.wiped < 1) { ev(pad, 'pointerdown', B.cx, B.cy); await sleep44(260); for (let q = 0; q < 24; q++) { const x = B.cx + Math.sin(q * 0.9) * B.w * 0.3; ev(pad, 'pointermove', x, B.cy + Math.cos(q * 1.3) * 8); at(x, B.cy); await sleep44(45); } ev(pad, 'pointerup', B.cx, B.cy); await sleep44(500); continue; }
          const bad = j.mode === 'nail' ? j.N.state().nick != null : s2.bad, z = bad ? Z.out : Z.altar; await drag(B.cx, B.cy, z.x + z.w / 2, z.y + z.h / 2, 10, 45); await sleep44(3000);
        } else if (j.kind === 'rock') {   // ── build 50 ── the light swept, the wedges on the line with the layers, the water to its end
          const B = j.box && j.box(); if (!B) { await sleep44(300); continue; }
          if (!j.lines().length) { ev(pad, 'pointerdown', B.l + 6, B.cy); for (let i = 0; i <= 20; i++) { await sleep44(40); ev(pad, 'pointermove', B.l + 6 + ((B.w - 12) * i) / 20, B.cy); at(B.l + 6 + ((B.w - 12) * i) / 20, B.cy); } ev(pad, 'pointerup', B.r - 6, B.cy); await sleep44(400); continue; }
          const truth = j.J.rock.lines.find((l2) => l2.layers), g = j.lines().find((l2) => truth && l2.id === truth.id) || j.lines()[0];
          if (j.J.state().crack < 0.01) { for (let i = 0; i < 4; i++) { const t = (i + 1) / 5, x = g.x0 + (g.x1 - g.x0) * t, y = g.y0 + (g.y1 - g.y0) * t; ev(pad, 'pointerdown', x, y); at(x, y); await sleep44(90); ev(pad, 'pointerup', x, y); await sleep44(350); } }
          const c = { x: W() / 2, y: H() / 2 }; ev(pad, 'pointerdown', c.x, c.y); at(c.x, c.y); await waitFor44(() => !st.job || st.job !== j || j.J.state().crack >= 0.95, 20000); ev(pad, 'pointerup', c.x, c.y); await sleep44(800);
        } else await sleep44(300);
      }
    } finally { gh.remove(); }
  }
  /** the craftsman's test (v2 §8): three short jobs at level 2 — pass at כשר; מהודר in all three: the gold seal; free tries; the fifth failure: the demonstration */
  function test44() {
    const t50 = o.test === 50, TT = t50 ? TEST50 : TEST44, key = t50 ? 'test50' : 'test44';   // ── build 50 ── (the test before chapter ג׳: the INSPECT family)
    const T = S[key] || (S[key] = { jobs: {}, passed: false, seal: false }); save42(S);
    const label = t50 ? { stone: 'אבן עם סדק', mud: 'בוץ או סדק?', nail: 'מבחן הציפורן' } : { lift: 'גלגל הדריכה', course0: 'נדבך', corner: 'מוט הברזל' };
    const next = () => TT.jobs.find((j) => !(T.jobs[j] && (T.jobs[j].passed || T.jobs[j].demo)));
    const go = (j) => runAct(j, TT.L, (q, rating) => after(j, rating));
    const run = () => { const j = next(); if (!j) { end(); return; } line(''); go(j); };
    function after(j, rating) {
      if (T.demoing === j) { T.demoing = null; const r = T.jobs[j] || { tries: 0, fails: 0, best: null }; r.demo = true; T.jobs[j] = r; save42(S); card('רב האומנים הראה', [t50 ? `${label[j]} — השלים` : `${label[j]} — הושלם`, '~בלי חותם · אפשר לתרגל אותה בחצר האומנים'], 'הלאה', run); return; }
      const { rec, next: nx } = testTry44(T.jobs[j], rating); T.jobs[j] = rec; save42(S);
      o.emit && o.emit('h44try', { job: j, rating, tries: rec.tries, next: nx });
      if (nx === 'pass') card(rating === 'mehudar' ? `${RATE30.icon.mehudar} מהודר` : `${RATE30.icon.kasher} כשר — עברתם`, [`${label[j]}`], 'הלאה', run);
      else if (nx === 'again') card('עוד ניסיון', [`${label[j]} — ${RATE30.he[rating]}`, `ניסיונות: ${rec.tries} · בלי הגבלה`], 'שוב', () => go(j));
      else card('רב האומנים מדגים', [`${label[j]} — אחרי חמישה ניסיונות הוא מראה, ואתם ממשיכים`, '~המחשה'], 'הראו לי', () => { T.demoing = j; save42(S); go(j); setTimeout(() => demo44(j), 900); });
    }
    function end() {
      const e = testEnd44(T.jobs, TT.jobs); T.passed = true; T.seal = !!(e && e.seal); T.at = Date.now(); save42(S);
      o.emit && o.emit('h44test', { seal: T.seal, shown: !!(e && e.shown), test: t50 ? 50 : 44 });
      const ch = t50 ? 'נפתח: פרק ג׳ — המזבח' : 'נפתח: פרק ב׳ — העזרות'; card(T.seal ? 'חותם זהב' : 'עברתם את מבחן האומן', T.seal ? ['!🏅 חותם זהב — מהודר בשלוש העבודות', ch, `~${TT.src}`] : [ch, e && e.shown ? '~רב האומנים הראה חלק מהעבודות — בלי חותם' : '~"מהודר" בשלושתן — חותם זהב; אפשר לתרגל בחצר האומנים', `~${TT.src}`], 'לבנות', () => stop(true));
    }
    if (next()) card(t50 ? 'מבחן אומן — לפני פרק ג׳' : 'מבחן אומן — לפני פרק ב׳', [t50 ? 'שלוש בדיקות קצרות, ברמה 2: אבן עם סדק · בוץ או סדק? · מבחן הציפורן' : 'שלוש עבודות קצרות, ברמה 2: גלגל הדריכה · נדבך · מוט הברזל', 'עוברים ב"כשר" · "מהודר" בשלושתן — חותם זהב · ניסיונות בלי הגבלה', `~${TT.src}`], 'להתחיל', run, 'לחצר האומנים קודם', () => stop(false, 'yard'));
    else end();
  }
  /** ── build 48 ── ספר הפגימות (v2 §4.4): a page for every type met — its verdict and its source; the decoys too */
  function book48(back) {
    const B = S.book48 || {}, pages = [...F.WOOD48_TYPES, ...F.STONE55_TYPES].filter((t) => B[t]).map((t) => { const T = F.WOOD48[t] || F.STONE55[t];   /* ── build 55 ── (the stones' pages) */ return [`${T.bad ? '✗' : '✓'} ${T.he} — ${T.bad ? 'לא למזבח' : 'כשר'}`, `~${T.why}`]; }).flat();
    card('ספר הפגימות', pages.length ? pages : ['עוד לא נמצאה פגימה'], 'חזרה', back);
  }
  /** חצר האומנים (hard-fun §5): every variant he has met, at any level opened; points and a title per family — no building */
  function yard44() {
    const Y = S.yard || (S.yard = { pts: {}, runs: 0 }); save42(S);
    const met = new Set(R.grades.map((g) => g[0]).concat(S.wall && S.wall.grades ? S.wall.grades.map((g) => g[0]) : []).concat(S.soreg && S.soreg.grades ? S.soreg.grades.map((g) => (/^lattice/.test(g[0]) ? 'lattice' : g[0])) : []).concat(S.gates && S.gates.grades ? S.gates.grades.map((g) => (g[0] === 'leaf7' ? 'leaf' : g[0])) : []).concat(S.nashim && S.nashim.grades ? S.nashim.grades.flatMap((g) => (g[0] === 'wood' ? ['log'] : g[0] === 'beams' ? ['beam'] : g[0] === 'pegs' ? ['peg'] : g[0] === 'corner' ? ['beam', 'peg'] : [g[0]])) : []).concat(S.nikanor && S.nikanor.grades ? S.nikanor.grades.map((g) => (g[0] === 'steps' ? 'step' : g[0] === 'hang' ? 'leaf' : g[0])) : []).concat(S.lishka && S.lishka.grades ? S.lishka.grades.map((g) => (g[0] === 'dome' ? 'arch' : g[0])) : []));   // (build 50: stage 07's)   // (build 49: stage 06's)   // (build 46–47: stages 03 and 04's variants once met there) if (R.done) for (const v of YARD44.slice(0, 6)) met.add(v.part);   // (build 45: stage 02's variants once met there)
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
    if ((part === 'open' || part === 'reveal') && (STG === 'yesod' || STG === 'sovev' || STG === 'guf')) lifeFrame55(dt);   // ── build 55 ── (the carts come in during the opening) ── /build 55 ──
    if (part === 'open' || part === 'reveal') { const p = PART[part]; if (p.frame(dt)) { if (p.end) p.end(); if (part === 'open') { const r = st.resumeAt; st.resumeAt = null; startPart(r != null ? r : R.part + 1); } else { st.part = 'done'; } } return; }
    if (part === 'done' || part === 'out') return;
    if (part === 'menu') { const h0 = hero(), fv = followView(h0); camTo(fv.p, fv.t, Math.min(1, dt * 2)); return; }   // ── build 44 ──
    const d = walkStep(dt), h = hero();
    if (!st.job) lifeFrame53(dt, null);   // ── build 53 ── (the crews work while he walks) ── /build 53 ──
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
    if (J.camK) { if (J.frame(dt)) endPart(); return; }   // ── build 49 ── (the voyage: its own camera over its own sea)
    let v = (J.view && J.view(h)) || actView(O);
    if (J.view && OBJ54.parts.includes(st.part) && !(J.ownView && J.ownView())) { if (st.finger > 0 && st.lock54) v = st.lock54; else { const c = camera(), tv = Math.tan((((c && c.fov) || 50) * Math.PI) / 360), HH = heroHeight(); v = rule53({ p: v.p.slice(), t: v.t.slice() }, h, HH, tv * (W() / H()), tv); st.lock54 = v; } }   // ── build 54 ── (the object rule on their own views; held under the finger) ── /build 54 ──
    camTo(v.p, v.t, J.snapView && J.snapView() ? 1 : J.view ? Math.min(1, dt * 2.5) : st.finger > 0 ? 0 : Math.min(1, dt * 2));   // ── build 55 ── (snapView: a macro cut to at once — the way there passed through him) ── /build 55 ──   // (build 46: an act's own view — the lattice front-on, the walk along the soreg, the procession low)
    lifeFrame53(dt, v);   // ── build 53 ── ── /build 53 ──
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
    if (STG === 'yesod' || STG === 'sovev' || STG === 'guf') { try { if (stages.setLife) stages.setLife(false); } catch (e) { /* */ } }
    if (STG === 'sovev' || STG === 'guf') { try { if (stages.crowd && stages.crowd.setEnabled) stages.crowd.setEnabled(false); } catch (e) { /* */ } }   // ── build 56 ── (the site's crowd stations — the overseer and his man — stood before the altar's north face in the red line's view) ── /build 56 ──   // ── build 55 ── (the world's own crews at the done sites stood in the altar's north course — the chambers' crews' places: the stage's own crews and carts work round the altar instead) ── /build 55 ──
    try { if (stages.outlineThin) stages.outlineThin(0.25, 0.5); } catch (e) { /* */ }   // ── build 53 ── the gold line and the pins' beams: ¼ wide, half seen (§4 important 12) ── /build 53 ──
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
    if (STG === 'nashim') { try { if (stages.setStage) stages.setStage('nashim', 'building', Math.max(0.3, Math.min(0.62, (R.part - 1) / (PARTS.length - 1))), { instant: true }); } catch (e) { /* */ } }   // ── build 48 ── (the court and its chambers' walls already up — open above)
    if (STG === 'nikanor') { hole49(R.part > PARTS49.indexOf('hang') ? 'steps' : 'door'); try { if (stages.setStage) stages.setStage('nikanor', 'done', 1, { instant: true }); } catch (e) { /* */ } if (qs('h49voy') === '1' && R.part <= PARTS49.indexOf('voyage')) { R.part = PARTS49.indexOf('voyage'); R.open = Math.max(1, R.open | 0); st.voyNow = 1; } }   // ── build 49 ── (the gate's walls up; his door and his steps not the model's)   // (build 49: the gatehouse stands — the crews built it; his are its doors and its steps, not drawn there till he sets them: 'building' kept a scaffold before the door and its crew standing in the air where it is not drawn)
    if (STG === 'lishka' && R.part > 0) { try { if (stages.setStage) stages.setStage('lishka', 'done', 1, { instant: true }); } catch (e) { /* */ } }   // ── build 50 ── (the chambers stand — the crews built them, and no saw or chisel in the courts: "ומקבות והגרזן כל כלי ברזל לא נשמע בבית", מלכים א ו, ז; his works are not drawn in them till he does them)
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
    const go = () => { if (st.voyNow) { st.voyNow = 0; startPart(R.part); return; } if (R.part > 0 && R.part < PARTS.indexOf('reveal')) { st.resumeAt = R.part; st.part = 'open'; PART.open.begin(); } else startPart(R.part); };
    if (came && R.part > 0) card('בוקר טוב', [LINE42.caravan, `+${F.MAT42.daily * came} אבנים`], 'לעבודה', go); else go();
    o.emit && o.emit('h42start', { part: PARTS[R.part] });
    return true;
  }
  function stop(done, next) {
    if (!st.on) return; st.on = false;
    if (STG === 'yesod' || STG === 'sovev' || STG === 'guf') { try { if (stages.setLife) stages.setLife(true); } catch (e) { /* */ } }
    if (STG === 'sovev' || STG === 'guf') { try { if (stages.crowd && stages.crowd.setEnabled) stages.crowd.setEnabled(true); } catch (e) { /* */ } }   // ── build 56 ── (the crowd back) ── /build 56 ──   // ── build 55 ── (the world's own crews back) ── /build 55 ──
    try { if (st.wet > 0 && stages.wet) stages.wet(0); STONE.color.copy(STONE0); BOSS.color.copy(BOSS0); } catch (e) { /* */ }
    try { if (view.closeCam) view.closeCam(false); } catch (e) { /* */ }
    try { stages.hero.drive(0, 0); } catch (e) { /* */ }
    try { if (stages.outlineThin) stages.outlineThin(1, 1); } catch (e) { /* */ }   // ── build 53 ── ── /build 53 ──
    dropUI(); dropProps();
    if (STG === 'wall' && MODE === 'stage' && !(R.stones && R.stones.length)) hole45(false);
    if (STG === 'soreg' || STG === 'gates' || STG === 'nikanor' || STG === 'lishka') hole46(false);   // ── build 46 ── (left before the end: no gap without his stones)
    if (st.lev49) { try { if (st.lev49.parent) st.lev49.parent.remove(st.lev49); } catch (e) { /* */ } st.lev49 = null; }   // ── build 49 ──
    if (o.onExit) o.onExit(!!done, next || '');
  }
  const api = {
    start, stop, frame, get on() { return st.on; },
    state: () => ({ t55: R.t55 || null, mode: MODE, stg: STG, test: (o.test === 50 ? S.test50 : S.test44) || null, test50: o.test === 50, yard: S.yard || null, rev: st.rev ? Math.round(st.rev.t * 10) / 10 : null, part: st.part, idx: R.part, job: !!st.job, pending: !!st.pending, hold: !!st.hold, finger: st.finger, mat: S.mat.stock | 0, grades: R.grades.slice(), hands: Math.round(R.hands), card: !!st.card, fam: Object.fromEntries(F.FAM42.map((f) => [f, famL(f)])) }),
    sig: () => `${MODE}|${st.part}|${R.part}|${R.grades.length}|${st.card ? 'card' : ''}|${st.job && st.job.frame ? 'job' : ''}|${S.test44 ? JSON.stringify(Object.values(S.test44.jobs || {}).map((r) => [r.tries, r.passed, r.demo])) : ''}`,
    line: () => (st.ui.line ? st.ui.line.textContent : ''),
    save: () => S, places: () => ({ PL, STAND, base }),
    heroBox: () => { const h = hero(); return { x: h.x, y: h.y, z: h.z, h: heroHeight() }; },
    objAt: () => (st.obj ? { x: st.obj.x, y: st.obj.y, z: st.obj.z } : null), objBox: () => (st.objBB ? { bb: st.objBB } : null),   // ── build 53 ── (objBox: the thing's box — tools/cam41.js) ── /build 53 ──
    camAt: () => ({ p: [cq.p.x, cq.p.y, cq.p.z], t: [cq.t.x, cq.t.y, cq.t.z] }),   // (build 43: the camera's measure — tools/cam41.js)
    job: () => (st.job ? { kind: st.job.kind || '', s: st.job.J ? st.job.J.state() : null, ref: st.job } : null),   // (the tools read the act: never write)
  };
  try { globalThis.__H42 = api; } catch (e) { /* */ }
  return api;
}
