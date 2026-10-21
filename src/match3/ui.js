/* ─────────────────────────────────────────────────────────────────────────────
 * ui.js: the overlay of "משחק האוצר" — HUD (moves, goals, the collection bar, the star meter), the cards (start, won,
 * near miss, exit), the level map per field and the vessel album. DOM only; RTL; 44-px targets; AA contrast.
 *   const U = createUI(root, { field, onExit });  U.hud({…}) · await U.card(kind, data) → choice · U.target(res)
 * Texts that state facts are drafts (טיוטה) with a source (PROJECT.md §2).
 * ──────────────────────────────────────────────────────────────────────────── */
import { ICON, KIND_HE } from './art.js';
import { FIELDS, FIELD_IDS, RES_HE } from './levels.js';

const CSS = `
.m3{position:fixed;inset:0;z-index:200;direction:rtl;display:flex;flex-direction:column;align-items:center;overflow:hidden;
 font-family:"Heebo",system-ui,sans-serif;color:#FFF6E4;-webkit-user-select:none;user-select:none;touch-action:none;
 background:radial-gradient(120% 60% at 50% 38%,rgba(255,236,190,.16),rgba(20,10,2,.72)),var(--m3bg);animation:m3in .35s ease-out}
@keyframes m3in{from{opacity:0}to{opacity:1}}
.m3[data-field=quarry]{--m3bg:linear-gradient(180deg,rgba(233,196,138,.985),rgba(170,118,70,.97) 45%,rgba(78,48,22,.985))}
.m3[data-field=forest]{--m3bg:linear-gradient(180deg,rgba(150,196,146,.985),rgba(52,110,66,.97) 45%,rgba(18,44,28,.985))}
.m3[data-field=gold]{--m3bg:linear-gradient(180deg,rgba(116,82,46,.985),rgba(58,38,20,.97) 45%,rgba(18,11,5,.985))}
.m3-cv{position:absolute;left:0;top:0;pointer-events:none;z-index:3}
.m3-bgc{position:absolute;left:0;top:0;pointer-events:none;z-index:0}
.m3-top{position:relative;z-index:2;width:100%;max-width:520px;box-sizing:border-box;padding:calc(env(safe-area-inset-top,0px) + 8px) 10px 2px}
.m3-row{display:flex;align-items:center;gap:8px}
.m3-btn{min-width:44px;min-height:44px;border-radius:14px;border:1px solid rgba(255,226,160,.55);background:linear-gradient(#6E4822,#3D230E);
 color:#FFF1D0;font:700 15px "Heebo",system-ui,sans-serif;padding:0 12px;box-shadow:0 2px 0 rgba(0,0,0,.35)}
.m3-btn:focus-visible,.m3-cta:focus-visible,.m3-sec:focus-visible{outline:3px solid #FFF3C4;outline-offset:2px}
.m3-title{flex:1;text-align:center;font:900 19px/1.15 "Frank Ruhl Libre","Heebo",serif;text-shadow:0 2px 0 rgba(0,0,0,.4)}
.m3-title small{display:block;font:600 12px "Heebo",sans-serif;opacity:.9}
.m3-moves{min-width:62px;text-align:center;background:linear-gradient(#FFF3D6,#E6BE72);color:#46270A;border-radius:16px;padding:3px 6px;
 box-shadow:0 3px 0 #8A5A1E,inset 0 1px 0 #fff}
.m3-moves b{display:block;font:900 27px/1 "Frank Ruhl Libre","Heebo",serif}.m3-moves small{font:700 11px "Heebo",sans-serif}
.m3-moves.low{animation:m3pulse 1s ease-in-out infinite}
@keyframes m3pulse{50%{transform:scale(1.07)}}
.m3-goals{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-top:8px;min-height:38px}
.m3-gl{align-self:center;font:700 12px "Heebo",sans-serif;color:#FFE9B8;background:rgba(28,14,2,.55);border-radius:8px;padding:2px 7px}
.m3-chip{display:inline-flex;align-items:center;gap:5px;background:rgba(28,14,2,.6);border:1px solid rgba(255,220,150,.4);border-radius:999px;
 padding:2px 11px 2px 4px;font:800 17px "Heebo",sans-serif;white-space:nowrap}
.m3-chip canvas{width:30px;height:30px}
.m3-chip.sm{font-size:14px;padding:1px 9px 1px 3px;opacity:.95}.m3-chip.sm canvas{width:22px;height:22px}
.m3-chip.done{background:rgba(34,104,48,.8);border-color:#B9F2C8}
.m3-chip.bump{animation:m3bump .25s ease-out}
@keyframes m3bump{50%{transform:scale(1.14)}}
.m3-meter{position:relative;height:9px;border-radius:6px;background:rgba(0,0,0,.38);margin:9px auto 0;max-width:340px;
 box-shadow:inset 0 1px 2px rgba(0,0,0,.5)}
.m3-meter i{position:absolute;right:0;top:0;bottom:0;border-radius:6px;background:linear-gradient(270deg,#FFC94A,#FFF0B5);width:0;transition:width .3s}
.m3-meter b{position:absolute;top:-7px;width:20px;margin-right:-10px;text-align:center;font:14px/1 sans-serif;color:rgba(255,255,255,.4)}
.m3-meter b.on{color:#FFD24A;text-shadow:0 0 6px #FFE9A0}
.m3-board{position:relative;z-index:1;flex:1;min-height:0;width:100%;max-width:520px;display:flex;align-items:center;justify-content:center;
 box-sizing:border-box;padding:8px}
.m3-hit{width:100%;max-height:100%;touch-action:none;border-radius:14px;box-shadow:0 0 0 3px rgba(255,214,120,.55),0 12px 34px rgba(0,0,0,.45)}
.m3-foot{position:relative;z-index:2;width:100%;max-width:520px;box-sizing:border-box;min-height:54px;text-align:center;
 padding:2px 14px calc(env(safe-area-inset-bottom,0px) + 10px);font:600 15px/1.35 "Heebo",sans-serif;text-shadow:0 1px 2px rgba(0,0,0,.6)}
.m3-foot .need[hidden]{display:none}
.m3-back[hidden]{display:none}
.m3-back{display:inline-block;margin-top:6px;min-height:48px;padding:10px 18px;border:0;border-radius:24px;background:linear-gradient(#FFE08A,#E5A11C);color:#2A1804;font:800 16px/1.2 "Heebo",sans-serif;box-shadow:0 0 0 3px rgba(255,236,170,.6),0 6px 16px rgba(0,0,0,.45);animation:m3back 1s ease-in-out infinite alternate;cursor:pointer;touch-action:manipulation}
@keyframes m3back{from{transform:scale(1)}to{transform:scale(1.06)}}
.m3-foot .need{display:inline-block;margin-top:4px;background:rgba(28,14,2,.55);border-radius:10px;padding:3px 10px;font-weight:700}
.m3-wrap{position:absolute;inset:0;z-index:6;display:flex;align-items:center;justify-content:center;background:rgba(12,6,0,.55);padding:14px;
 box-sizing:border-box;animation:m3in .25s ease-out}
.m3-card{width:100%;max-width:370px;max-height:100%;overflow:auto;box-sizing:border-box;background:linear-gradient(#FFF8E8,#F0DBB0);color:#3A220C;
 border-radius:22px;padding:16px 16px 14px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.55),inset 0 0 0 2px #D8AB58;touch-action:pan-y}
.m3-card h2{font:900 26px/1.2 "Frank Ruhl Libre","Heebo",serif;margin:2px 0 6px;color:#5A300A}
.m3-card p{font:500 16px/1.45 "Heebo",sans-serif;margin:6px 0}
.m3-card .m3-chip{background:#FFF1D2;color:#4A2A0A;border-color:#D8AB58}
.m3-card .m3-goals{margin:8px 0}
.m3-cta{display:block;width:100%;min-height:52px;border:0;border-radius:16px;background:linear-gradient(#FFD569,#DF951A);color:#452300;
 font:900 20px "Heebo",sans-serif;box-shadow:0 4px 0 #94580C;margin-top:12px}
.m3-sec{display:block;width:100%;min-height:46px;border-radius:14px;border:2px solid #C8964A;background:transparent;color:#5A300A;
 font:800 16px "Heebo",sans-serif;margin-top:8px}
.m3-stars3{font:44px/1.1 serif;letter-spacing:4px;margin:4px 0;direction:ltr}
.m3-stars3 span{color:rgba(90,48,10,.2);display:inline-block}
.m3-stars3 span.on{color:#E5A11C;text-shadow:0 2px 0 #9A5E0E,0 0 12px #FFE08A;animation:m3star .45s ease-out both}
@keyframes m3star{0%{transform:scale(0) rotate(-40deg)}70%{transform:scale(1.25)}100%{transform:scale(1)}}
.m3-tag{display:inline-block;vertical-align:middle;background:#FCE3AA;color:#6E4200;border-radius:7px;padding:0 6px;font:700 11px/1.6 "Heebo",sans-serif;margin-inline-start:4px}
.m3-top .m3-tag{background:rgba(255,236,190,.9)}
.m3-tabs{display:flex;gap:6px;margin:4px 0 10px}
.m3-tabs button{flex:1;min-height:46px;border-radius:12px;border:2px solid #D8AB58;background:#FFF3D8;color:#5A300A;font:800 14px "Heebo",sans-serif}
.m3-tabs button[aria-pressed=true]{background:linear-gradient(#FFD569,#DF951A);border-color:#94580C}
.m3-tabs button .dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#C0392B;margin-inline-start:4px;vertical-align:middle}
.m3-path{display:flex;flex-direction:column-reverse;gap:6px;max-height:44vh;overflow:auto;padding:6px 4px;touch-action:pan-y;-webkit-mask-image:linear-gradient(#0000,#000 30px);mask-image:linear-gradient(#0000,#000 30px)}
.m3-node{align-self:center;min-width:56px;min-height:56px;border-radius:50%;border:3px solid #C8964A;background:radial-gradient(circle at 35% 30%,#FFF6DC,#E8C27A);
 color:#4A2A0A;font:900 19px "Frank Ruhl Libre",serif;position:relative}
.m3-node small{position:absolute;bottom:-11px;left:50%;transform:translateX(-50%);font:12px/1 serif;color:#E5A11C;white-space:nowrap;direction:ltr;text-shadow:0 1px 0 #7A4A00}
.m3-node.cur{border-color:#FFF;box-shadow:0 0 0 4px #F2B233,0 0 18px #FFD66E;animation:m3pulse 1.4s ease-in-out infinite}
.m3-node.lock{background:#D9CBB0;color:rgba(74,42,10,.45);border-color:#B8A585}
.m3-node.hard{border-color:#8E2A1C}
.m3-album{display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:start}
.m3-vc{background:#FFF4DC;border:2px solid #D8AB58;border-radius:14px;padding:8px;min-height:120px;font:500 13px/1.4 "Heebo",sans-serif}
.m3-vc canvas{width:48px;height:48px;display:block;margin:0 auto 2px}
.m3-vc b{display:block;text-align:center;font:800 15px "Heebo",sans-serif}
.m3-vc.lock{filter:grayscale(.85);opacity:.7}
.m3-albw{margin:8px 0 4px}.m3-alt{margin:0 0 4px;font:700 13px "Heebo",sans-serif;color:#7A5A30}
.m3-alb{display:flex;justify-content:center;gap:6px;direction:rtl}
.m3-av{width:44px;padding:3px 2px;border-radius:10px;background:#FFF4DC;border:1.5px solid #E2C58A}.m3-av canvas{width:30px;height:30px;display:block;margin:0 auto}
.m3-av i{display:block;height:4px;border-radius:3px;background:rgba(90,48,10,.15);margin:2px 3px 0;overflow:hidden;direction:ltr}.m3-av i b{display:block;height:100%;background:#E5A11C}
.m3-av.fed{animation:m3fed .7s ease-out 1}.m3-av.on{border-color:#C8962E;box-shadow:0 0 0 2px #F3D27A inset}
.m3-av.new{border-color:#C8962E;animation:m3new 1.2s ease-in-out 3;box-shadow:0 0 14px #FFE08A}
.m3-newv{margin:6px 0 0;padding:6px 8px;border-radius:10px;background:#FFF1C9;font-size:13.5px;line-height:1.4}
@keyframes m3fed{0%{transform:translateY(0)}40%{transform:translateY(-5px)}100%{transform:none}}
@keyframes m3new{0%,100%{transform:scale(1)}50%{transform:scale(1.14)}}
.m3-diff{margin:-4px 0 6px;color:#9A5B12;letter-spacing:2px;font-size:13px}.m3-diff span{color:rgba(90,48,10,.22)}
.m3-fact{font-size:13px;color:#4A3418}.m3-fact .src{color:#7A5A30;font-size:11px}
.m3-vc small{display:block;font-size:12px;color:#4A3418;margin-top:3px}
.m3-vc .src{display:block;color:#7A5A30;font-size:11px;margin-top:3px}
.m3-bar{height:8px;border-radius:5px;background:rgba(90,48,10,.15);margin-top:4px;direction:ltr}.m3-bar i{display:block;height:100%;border-radius:5px;background:#E5A11C}
@media (prefers-reduced-motion:reduce){.m3,.m3-wrap,.m3-chip.bump,.m3-moves.low,.m3-node.cur,.m3-stars3 span.on,.m3-av.fed,.m3-av.new{animation:none}}
`;
// ── hook19 ──  (the owner's note 10: "מאוד קטן ולא מותאם") the board on a phone held sideways: the board takes the whole height and
// the screen's middle, the bar's pieces move to its two sides: on the start side (right, RTL) the exit, the moves, the title and
// the hint · on the end side (left) the goals and the star meter. Portrait is untouched: every rule below hangs on `.m3[data-land]`.
// ── land33 ── sideways is decided by the aspect (innerWidth > innerHeight; fitBoard sets data-land, re-run on resize and
// orientationchange), not by a media query, so a 1280×720 tablet is sideways too. The cell is floor(height / rows): the
// whole height (8 × 9 → 43 px at 390 high — 390/9 is the ceiling — 45 at 412, 80 at 720); each side column keeps ≥ 120 px.
// The cards shrink only when the screen is also short (≤ 560 px), so a tablet keeps the upright cards.
export const LAND = '(orientation:landscape) and (max-height:560px) and (min-width:560px)';   // (kept for callers; the layout no longer reads it)
export const SIDE_MIN = 120;   // the least width of each side column (the exit button beside the moves pill)
const LAND_CSS = `
.m3[data-land="1"]{display:grid;grid-template-columns:minmax(0,1fr) var(--m3bw,344px) minmax(0,1fr);grid-template-rows:1fr auto auto 1fr;
 justify-items:stretch;align-items:start;column-gap:0;padding:0 env(safe-area-inset-right,0px) 0 env(safe-area-inset-left,0px)}
.m3[data-land="1"] .m3-top{display:contents}
.m3[data-land="1"] .m3-row{grid-column:1;grid-row:2;flex-wrap:wrap;justify-content:space-between;gap:6px 8px;padding:0 10px 4px;position:relative;z-index:2;
 width:100%;max-width:360px;box-sizing:border-box;justify-self:center}
.m3[data-land="1"] .m3-title{order:3;flex:1 0 100%;font-size:17px;padding-top:2px}
.m3[data-land="1"] .m3-title small{font-size:11px}
.m3[data-land="1"] .m3-moves{min-width:58px}
.m3[data-land="1"] .m3-top .m3-goals{grid-column:3;grid-row:2;margin:0;padding:0 10px 4px;min-height:0;flex-direction:column;align-items:stretch;gap:5px;position:relative;z-index:2;
 width:100%;max-width:360px;box-sizing:border-box;justify-self:center}
.m3[data-land="1"] .m3-top .m3-gl{align-self:flex-start}
.m3[data-land="1"] .m3-top .m3-chip{align-self:flex-start}
.m3[data-land="1"] .m3-meter{grid-column:3;grid-row:3;margin:14px 10px 0;width:auto;max-width:340px;align-self:start;justify-self:stretch;position:relative;z-index:2}
.m3[data-land="1"] .m3-board{grid-column:2;grid-row:1/-1;align-self:stretch;max-width:none;padding:0}
.m3[data-land="1"] .m3-hit{border-radius:10px;box-shadow:0 0 0 2px rgba(255,214,120,.6),0 6px 20px rgba(0,0,0,.45)}
.m3[data-land="1"] .m3-foot{grid-column:1;grid-row:3;min-height:0;text-align:start;padding:2px 12px 0;font-size:13.5px;line-height:1.35;position:relative;z-index:2;
 width:100%;max-width:360px;box-sizing:border-box;justify-self:center}
.m3[data-land="1"] .m3-foot .need{font-size:13px}
@media (min-height:600px){
 .m3[data-land="1"] .m3-title{font-size:21px}.m3[data-land="1"] .m3-title small{font-size:13px}
 .m3[data-land="1"] .m3-foot{font-size:16px;line-height:1.4}.m3[data-land="1"] .m3-foot .need{font-size:15px}
 .m3[data-land="1"] .m3-top .m3-chip{font-size:19px}.m3[data-land="1"] .m3-top .m3-gl{font-size:14px}
}
@media (max-height:560px){
 .m3[data-land="1"] .m3-wrap{padding:4px 12px}
 .m3[data-land="1"] .m3-card{max-width:520px;padding:8px 16px 8px;border-radius:18px;display:flex;flex-wrap:wrap;align-content:flex-start;column-gap:8px}
 .m3[data-land="1"] .m3-card>*{flex:1 0 100%;min-width:0;box-sizing:border-box}
 .m3[data-land="1"] .m3-card>.m3-cta,.m3[data-land="1"] .m3-card>.m3-sec{flex:1 1 40%;width:auto}
 .m3[data-land="1"] .m3-albw{margin:4px 0 2px}.m3[data-land="1"] .m3-alt{display:none}
 .m3[data-land="1"] .m3-newv{margin:4px 0 0;padding:4px 8px}
 .m3[data-land="1"] .m3-card h2{font-size:22px;margin:0 0 2px}
 .m3[data-land="1"] .m3-card p{font-size:14.5px;line-height:1.35;margin:3px 0}
 .m3[data-land="1"] .m3-card .m3-goals{flex-direction:row;margin:4px 0;padding:0}
 .m3[data-land="1"] .m3-cta{min-height:48px;font-size:18px;margin-top:8px}
 .m3[data-land="1"] .m3-sec{min-height:44px;margin-top:6px}
 .m3[data-land="1"] .m3-stars3{font-size:30px;margin:0}
 .m3[data-land="1"] .m3-path{max-height:40vh}
}`;
let cssDone = false;
function css() {
  if (cssDone || !globalThis.document) return;
  cssDone = true;
  const st = document.createElement('style'); st.id = 'm3-css'; st.textContent = CSS + LAND_CSS; document.head.appendChild(st);
}
/* sideways = wider than tall (the phone's own aspect; the first frame's zeros count as upright) */
export const isLand = () => { try { const w = globalThis.innerWidth | 0, h = globalThis.innerHeight | 0; return w > 0 && h > 0 && w > h; } catch (e) { return false; } };
// ── /hook19 ── ── /land33 ──
const esc = (x) => String(x).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const iconEl = (key, size) => { const c = ICON(key, size); const e = document.createElement('canvas'); e.width = c.width; e.height = c.height; e.getContext('2d').drawImage(c, 0, 0); return e; };
export const GOAL_HE = { stone: 'אבנים', cedar: 'ארזים', gold: 'זהב', silver: 'כסף', bronze: 'נחושת', wstone: 'אבנים שלמות', log: 'קורות לים', earth: 'עפר', vine: 'גפנים' };
const GOAL_ICON = { log: 'log', earth: 'earth1', vine: 'vine', cedar: 'blk:forest:3' };
const RES = ['stone', 'cedar', 'gold', 'silver', 'bronze', 'wstone'];

/* the vessel album: draft cards (CONTENT's vessels.json overrides them by id when BUILD passes ctx.vessels) */
/* the album: CONTENT's drafts (content/vessels.json, s6-content 4cefdbd/9791593 — card_he · text_he · source), carried here
   because the host may not pass ctx.vessels; ctx.vessels still overrides by piece/id */
export const VESSEL_CARDS = [
  { id: 'menorah', k: 0, title: 'המנורה', card_he: 'מנורת זהב טהור, מקשה אחת, ובה שבעה נרות.', text_he: 'המנורה נעשתה מקשה — מגוש זהב אחד. החשמונאים עשו אותה תחילה משיפודי ברזל מצופים בבעץ (בדיל); כשהעשירו — מכסף, ואחר כך מזהב.', source: 'שמות כה, לא; מנחות כח, ב' },
  { id: 'altar', k: 1, title: 'המזבח', card_he: 'מזבח של אבנים שלמות, שלושים ושתיים על שלושים ושתיים אמה.', text_he: 'באבני המזבח לא נגע ברזל. חוט של סקרא חגר אותו באמצע, ופעמיים בשנה סיידו אותו בלבן.', source: 'מדות ג, א–ד' },
  { id: 'oil_jug', k: 2, title: 'פך השמן', card_he: 'פך אחד של שמן, חתום בחותמו של הכהן הגדול.', text_he: 'כשנכנסו היוונים להיכל טימאו את השמנים. החשמונאים מצאו רק פך אחד בחותמו של הכהן הגדול — ונעשה בו נס שמונה ימים. הצבע הכחול במשחק — המחשה.', source: 'שבת כא, ב', illus: true },
  { id: 'showbread', k: 3, title: 'לחם הפנים', card_he: 'שתים עשרה חלות בשתי מערכות, שש בכל מערכה, על השולחן.', text_he: 'לחם הפנים עמד תמיד על השולחן. כל חלה הייתה ארוכה עשרה טפחים ורחבה חמישה, וקרנותיה שבע אצבעות.', source: 'שמות כה, ל; ויקרא כד, ו; מנחות יא, ד' },
  { id: 'pomegranate', k: 4, title: 'רימוני המעיל', card_he: 'רימונים של תכלת, ארגמן ותולעת שני בשולי מעיל הכהן הגדול.', text_he: 'בשולי המעיל נתלו לסירוגין פעמון זהב ורימון — פעמון ורימון, סביב סביב.', source: 'שמות כח, לג–לד' },
  { id: 'trumpets', k: 5, title: 'חצוצרות הכסף', card_he: 'שתי חצוצרות כסף, מקשה.', text_he: 'בשעת ניסוך היין עמדו שני כהנים עם חצוצרות כסף ותקעו, הריעו ותקעו. במקדש לא היו פחות משתי חצוצרות.', source: 'במדבר י, ב; תמיד ז, ג; ערכין ב, ג' },
];
export const ALBUM_AT = 30;          // gather this many of a vessel (over all games) to open its card
/** (wave 7, FUN) the k-th vessel's card needs ALBUM_AT × (k + 1): 30, 60, 90 … — and opens at a board's end, one at a time */
export const albumAt = (k) => ALBUM_AT * (1 + (k | 0));
const isOpen = (d, v) => ((d.album && d.album[v.id]) || 0) >= albumAt(v.k) && (!d.told || !!d.told[v.id]);

export function createUI(root, o = {}) {
  css();
  const el = h('div', 'm3');
  el.dataset.field = o.field || 'quarry';
  el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'משחק האוצר');
  el.innerHTML = `
  <div class="m3-top">
    <div class="m3-row"><button class="m3-btn m3-exit" type="button">יציאה</button>
      <div class="m3-title"><span class="t"></span><small class="st"></small></div>
      <div class="m3-moves" aria-live="polite"><b>0</b><small>מהלכים</small></div></div>
    <div class="m3-goals" aria-live="polite"></div>
    <div class="m3-meter" aria-hidden="true"><i></i><b>★</b><b>★</b><b>★</b></div>
  </div>
  <div class="m3-board"><div class="m3-hit" role="application" aria-label="לוח המשחק: החלק כלי אל שכנו"></div></div>
  <div class="m3-foot"><div class="hint"></div><div class="need" hidden></div><button type="button" class="m3-back" hidden>✓ חזרה לבנייה ▶</button></div>`;   // ── ux24 ── (the way back, once enough) ── /ux24 ──
  (root || document.body).appendChild(el);
  const $ = (q) => el.querySelector(q);
  const hit = $('.m3-hit');
  let backFn = null; $('.m3-back').addEventListener('click', () => { if (backFn) backFn(); });   // ── ux24 ── ── /ux24 ──
  let chips = {}, goals = [], stars = [0, 1, 2], shown = {}, extra = {}, board = { R: 9, C: 8 };
  $('.m3-exit').addEventListener('click', () => o.onExit && o.onExit());

  // ── hook19 ── ── land33 ──  sideways (by the aspect): the board's column is as wide as the cells need; the whole height goes
  // to the rows (floor(height / rows)); the two side columns keep SIDE_MIN each. Upright: the old flow, untouched.
  function layoutLand() {
    const land = isLand();
    if (land) {
      el.dataset.land = '1';
      const rr = el.getBoundingClientRect();
      const cl = Math.floor(Math.min(rr.height / board.R, (rr.width - 2 * SIDE_MIN) / board.C));
      el.style.setProperty('--m3bw', Math.max(20, cl) * board.C + 8 + 'px');
    } else { delete el.dataset.land; el.style.removeProperty('--m3bw'); }
    return land;
  }
  layoutLand();   // the HUD stands at the sides from the first frame (the map and the album open before a board is set up)
  // ── /hook19 ── ── /land33 ──
  function fitBoard() {
    const land = layoutLand();
    const b = $('.m3-board').getBoundingClientRect(), pad = land ? 0 : 16;
    const cs = Math.max(20, Math.floor(Math.min((b.width - pad) / board.C, (b.height - pad) / board.R)));
    hit.style.width = cs * board.C + 'px'; hit.style.height = cs * board.R + 'px';
  }
  function chip(key, txt, sm) {
    const c = h('div', 'm3-chip' + (sm ? ' sm' : ''));
    c.appendChild(iconEl(GOAL_ICON[key] || key, sm ? 22 : 30));
    const t = h('span', null, txt); c.appendChild(t);
    c._t = t;
    return c;
  }
  const U = {
    el, hit,
    setup({ field, level, R, C, moves, goals: gs, stars: sts, hint, need, illus, place }) {
      el.dataset.field = field;
      board = { R, C };
      $('.t').textContent = `${place || FIELDS[field].he} · שלב ${level}`;
      $('.st').innerHTML = illus ? `${esc(FIELDS[field].label || 'המחשה')} <span class="m3-tag">⚑</span>` : '';
      goals = gs.map((g) => ({ t: g.t, n: g.n })); stars = sts; shown = {}; extra = {};
      const box = $('.m3-goals'); box.innerHTML = '<span class="m3-gl">מטרת השלב</span>'; chips = {};
      for (const g of goals) { const c = chip(g.t, `0/${g.n}`); c.title = GOAL_HE[g.t] || g.t; box.appendChild(c); chips[g.t] = c; shown[g.t] = 0; }
      const m = $('.m3-meter'); const top = stars[2] * 1.08;
      m.querySelectorAll('b').forEach((b, q) => { b.style.right = (q === 0 ? 4 : stars[q] / top * 100) + '%'; b.classList.remove('on'); });
      m._top = top;
      U.moves(moves);
      $('.hint').textContent = hint || '';
      U.need(need, {});
      fitBoard();
    },
    fit: fitBoard,
    moves(n) { const m = $('.m3-moves'); m.querySelector('b').textContent = n; m.classList.toggle('low', n <= 5 && n > 0); },
    score(sc, won) {
      const m = $('.m3-meter'); m.querySelector('i').style.width = Math.min(100, sc / (m._top || 1) * 100) + '%';
      m.querySelectorAll('b').forEach((b, q) => b.classList.toggle('on', q === 0 ? !!won : sc >= stars[q]));
    },
    /* a material or a goal counter goes up (the flights land here) */
    add(key, n) {
      if (!n) return;
      shown[key] = (shown[key] || 0) + n;
      let c = chips[key];
      if (!c) {
        if (!RES.includes(key)) return;
        c = chip(key, '0', true); chips[key] = c; extra[key] = 1; $('.m3-goals').appendChild(c);
      }
      U.paint(key);
    },
    set(key, v) { shown[key] = v; if (chips[key]) U.paint(key); },
    paint(key) {
      const c = chips[key], g = goals.find((x) => x.t === key), v = shown[key] || 0;
      if (g) { c._t.textContent = v >= g.n ? `✓ ${g.n}` : `${v}/${g.n}`; c.classList.toggle('done', v >= g.n); }
      else c._t.textContent = String(v);
      c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
    },
    need(need, got) {
      const e = $('.need');
      const k = need && Object.keys(need).find((x) => need[x] > 0 && RES.includes(x));
      if (!k) { e.hidden = true; return; }
      e.hidden = false;
      const v = Math.min(need[k], got[k] || 0);
      e.textContent = v >= need[k] ? `✓ יש מספיק ${RES_HE[k]} לצעד הבנייה הבא` : `לבנייה: ${v}/${need[k]} ${RES_HE[k]} לצעד הבא`;
      // ── ux24 ── (docs/UX24.md #5) enough for the step: the line becomes the big gold way back to the site (shot l-740s: "יש מספיק"
      // in small print while the kid swiped on for minutes; the only way out was "יציאה" and its "are you sure" card) ── /ux24 ──
      const bk = $('.m3-back'); if (bk) { const ok = v >= need[k] && !!backFn; bk.hidden = !ok; e.hidden = ok; }
    },
    onBack(f) { backFn = typeof f === 'function' ? f : null; },   // ── ux24 ── ── /ux24 ──
    hint(t) { $('.hint').textContent = t || ''; },
    /* where a flying thing lands: a goal/material chip, or the collection bar for a vessel */
    target(key) {
      const rr = el.getBoundingClientRect();
      let c = chips[key];
      if (!c && RES.includes(key)) { U.add(key, 0); c = chips[key]; }
      const r = (c || $('.m3-goals')).getBoundingClientRect();
      return { x: r.left - rr.left + (c ? r.width - 18 : r.width / 2), y: r.top - rr.top + r.height / 2 };
    },
    card(kind, d = {}) {
      return new Promise((resolve) => {
        const w = h('div', 'm3-wrap'), c = h('div', 'm3-card');
        c.setAttribute('role', 'alertdialog');
        w.appendChild(c); el.appendChild(w);
        const done = (v) => { w.remove(); resolve(v); };
        const btn = (cls, txt, v) => { const b = h('button', cls, esc(txt)); b.type = 'button'; b.addEventListener('click', () => done(v)); c.appendChild(b); return b; };
        const goalsRow = (list, cls = '') => { const r = h('div', 'm3-goals ' + cls); for (const [k, n] of list) r.appendChild(chip(k, String(n))); return r; };
        if (kind === 'start') {
          c.innerHTML = `<h2>${esc(d.place || FIELDS[d.field].he)} · שלב ${d.level}${d.hard ? ' <span class="m3-tag">קשה</span>' : ''}</h2>`;
          if (d.diff != null) { const n = Math.max(1, Math.min(5, 1 + Math.round(d.diff / 1.3 * 4))); c.innerHTML += `<p class="m3-diff" aria-label="רמת קושי ${n} מתוך 5">רמה ${'●'.repeat(n)}<span>${'●'.repeat(5 - n)}</span></p>`; }
          if (d.illus) c.innerHTML += `<p><span class="m3-tag">${esc(FIELDS[d.field].label || 'המחשה')}</span> ${esc(FIELDS[d.field].src)}</p>`;
          c.innerHTML += `<p>אסוף ב־<b>${d.moves}</b> מהלכים:</p>`;
          c.appendChild(goalsRow(d.goals.map((g) => [g.t, g.n])));
          if (d.level === 1) { const the = { stone: 'האבנים', cedar: 'הארזים', gold: 'הזהב', wstone: 'האבנים השלמות' }[d.goals[0].t]; if (the) c.appendChild(h('p', null, `<b>ממש את ${the}:</b> כל מה שתאסוף כאן נכנס לבנייה.`)); }
          if (d.round) c.appendChild(h('p', null, `<b>הלוח חוזר, ארוך יותר:</b> סבב ${d.round + 1} במחצבה — עוד מהלכים ויעד גדול יותר.`));   // (FUN12: the quarry's cycle)
          if (d.gift) c.appendChild(h('p', null, '<b>מתנת הבונים:</b> יתד מוכן כבר על הלוח.'));
          if (d.daily) c.appendChild(h('p', null, `<b>בונוס היום:</b> ${esc(GOAL_HE[d.daily.res] || '')} ×${d.daily.mult} בניצחון`));
          if (d.hint) c.appendChild(h('p', null, `<b>טיפ:</b> ${esc(d.hint)}`));
          const b = btn('m3-cta', 'התחל', 'go'); setTimeout(() => b.focus && b.focus(), 50);
          if (d.canMap) btn('m3-sec', 'מפת השדה והאלבום', 'map');
          btn('m3-sec', 'חזרה לבנייה', 'quit');
        } else if (kind === 'won') {
          c.innerHTML = `<h2>${d.stars === 3 ? 'מושלם!' : 'כל הכבוד!'}</h2><div class="m3-stars3">${[1, 2, 3].map((q) => `<span class="${q <= d.stars ? 'on' : ''}" style="animation-delay:${0.25 * q}s">★</span>`).join('')}</div>
            <p>ניקוד: <b>${d.score.toLocaleString('he-IL')}</b>${d.best ? ' · שיא חדש!' : ''}</p><p>נאסף לבנייה:</p>`;
          c.appendChild(goalsRow(RES.filter((k) => d.got[k] > 0).map((k) => [k, d.got[k]])));
          if (d.bonus) c.appendChild(h('p', null, `כולל בונוס כוכבים: +${d.bonus} ${esc(RES_HE[d.res])}`));
          if (d.needLeft > 0) c.appendChild(h('p', null, `לצעד הבא חסרים עוד <b>${d.needLeft}</b> ${esc(RES_HE[d.res])} — עוד שלב?`));
          albumStrip(c, d);
          const main = btn('m3-cta', d.needLeft > 0 ? `עוד שלב (${d.next})` : 'חזרה לבנייה', d.needLeft > 0 ? 'next' : 'done');
          btn('m3-sec', d.needLeft > 0 ? 'חזרה לבנייה' : `עוד שלב (${d.next})`, d.needLeft > 0 ? 'done' : 'next');
          setTimeout(() => main.focus && main.focus(), 50);
        } else if (kind === 'lost') {
          const near = d.left.filter((g) => g.left > 0);
          const line = near.map((g) => `עוד ${g.left} ${esc(GOAL_HE[g.t] || g.t)}`).join(' · ');
          c.innerHTML = `<h2>${d.near ? 'כמעט!' : 'נגמרו המהלכים'}</h2><p style="font-size:20px;font-weight:800">${line}!</p>
            <p>מה שנאסף נשאר שלך — וניסיון נוסף תמיד בחינם.</p>`;
          c.appendChild(goalsRow(RES.filter((k) => d.got[k] > 0).map((k) => [k, d.got[k]])));
          albumStrip(c, d);
          const b = btn('m3-cta', 'נסה שוב', 'retry'); btn('m3-sec', 'חזרה לבנייה', 'done');
          setTimeout(() => b.focus && b.focus(), 50);
        } else if (kind === 'exit') {
          c.innerHTML = '<h2>לצאת מהשלב?</h2><p>מה שנאסף עד עכשיו נשאר שלך.</p>';
          btn('m3-cta', 'להמשיך לשחק', 'stay'); btn('m3-sec', 'לצאת', 'quit');
        } else if (kind === 'map') mapCard(c, d, done);
        else if (kind === 'album') albumCard(c, d, done);
        else { c.innerHTML = `<p>${esc(d.text || '')}</p>`; btn('m3-cta', 'המשך', 'ok'); }
      });
    },
    destroy() { el.remove(); },
  };
  return U;
}

function mapCard(c, d, done) {
  // d: { field, fields:{quarry:{cur, best:{L:{stars}}}}, need, levelInfo(field, L) → {hard} }
  let f = d.field;
  const draw = () => {
    c.innerHTML = '';
    c.appendChild(h('h2', null, 'משחק האוצר'));
    const tabs = h('div', 'm3-tabs');
    for (const id of FIELD_IDS) {
      const b = h('button', null, esc(FIELDS[id].he) + (d.needField === id ? '<span class="dot" aria-label="נחוץ עכשיו"></span>' : ''));
      b.type = 'button'; b.setAttribute('aria-pressed', String(id === f));
      b.addEventListener('click', () => { f = id; draw(); });
      tabs.appendChild(b);
    }
    c.appendChild(tabs);
    const F = FIELDS[f];
    c.appendChild(h('p', null, `${esc(F.blurb)}${F.illus ? ` <span class="m3-tag">${esc(F.label)} ⚑</span>` : ''}`));
    if (F.fact) c.appendChild(h('p', 'm3-fact', `${esc(F.fact)} <span class="m3-tag">טיוטה</span> <span class="src">${esc(F.srcShort || '')}</span>`));
    const info = d.fields[f] || { cur: 1, best: {} };
    const path = h('div', 'm3-path');
    const lo = Math.max(1, info.cur - 10), hi = info.cur + 6;
    for (let L = lo; L <= hi; L++) {
      const n = h('button', 'm3-node' + (L === info.cur ? ' cur' : '') + (L > info.cur ? ' lock' : '') + (d.hardOf && d.hardOf(L) ? ' hard' : ''));
      n.type = 'button';
      const st = (info.best[L] && info.best[L].stars) || 0;
      n.innerHTML = `${L}${L < info.cur || st ? `<small>${'★'.repeat(st)}${'☆'.repeat(3 - st)}</small>` : ''}`;
      n.style.marginInlineStart = `${[0, 34, 50, 34, 0, -34, -50, -34][L % 8]}%`;
      n.setAttribute('aria-label', `שלב ${L}${L > info.cur ? ' (נעול)' : ''}`);
      if (L > info.cur) n.disabled = true;
      else n.addEventListener('click', () => done({ play: f, level: L }));
      path.appendChild(n);
    }
    c.appendChild(path);
    setTimeout(() => { const cur = path.querySelector('.cur'); if (cur && cur.scrollIntoView) { cur.scrollIntoView({ block: 'center' }); c.scrollTop = 0; } }, 30);   // (land33: the path scrolls to the level, the card itself stays at its title)
    const b = h('button', 'm3-cta', `שחק · ${esc(F.he)} שלב ${info.cur}`); b.type = 'button';
    b.addEventListener('click', () => done({ play: f, level: info.cur }));
    c.appendChild(b);
    const a = h('button', 'm3-sec', 'אלבום הכלים'); a.type = 'button'; a.addEventListener('click', () => done({ album: true, field: f })); c.appendChild(a);
    const x = h('button', 'm3-sec', 'חזרה לבנייה'); x.type = 'button'; x.addEventListener('click', () => done({ quit: true })); c.appendChild(x);
  };
  draw();
}
/* (wave 7, FUN) the vessel collection on every end card: each vessel's way to its card (n / ALBUM_AT), the ones this board
   fed pulse once, and a card that opens now is told right here with its line (Maya: "עכשיו יש לי מה לאסוף") */
function albumStrip(c, d) {
  if (!d || !d.album) return;
  const n = (id) => d.album[id] || 0, fed = d.gathered || [];
  const list = VESSEL_CARDS.filter((v) => v.k < 5 || n(v.id) > 0);          // the trumpets join with the sixth colour
  const w = h('div', 'm3-albw'); w.appendChild(h('p', 'm3-alt', 'אלבום הכלים'));
  const row = h('div', 'm3-alb');
  for (const v of list) {
    const got = n(v.id), at = albumAt(v.k), open = isOpen(d, v), isNew = (d.opened || []).includes(v.id);
    const e = h('div', 'm3-av' + (open ? ' on' : '') + (isNew ? ' new' : fed[v.k] ? ' fed' : ''));
    e.appendChild(iconEl('v' + v.k, 30));
    e.appendChild(h('i', null, `<b style="width:${open ? 100 : Math.min(100, Math.round((got / at) * 100))}%"></b>`));
    e.setAttribute('aria-label', `${v.title}: ${open ? 'הכרטיס פתוח' : `${Math.min(got, at)} מתוך ${at}`}`);
    row.appendChild(e);
  }
  w.appendChild(row);
  for (const id of d.opened || []) { const v = VESSEL_CARDS.find((x) => x.id === id); if (v) w.appendChild(h('p', 'm3-newv', `✦ כרטיס חדש באלבום: <b>${esc(v.title)}</b> — ${esc(v.card_he)} <small>${esc(v.source || '')}</small> <span class="m3-tag">טיוטה</span>`)); }
  c.appendChild(w);
}
function albumCard(c, d, done) {
  c.innerHTML = `<h2>אלבום הכלים</h2><p>כשאספת מספיק מכלי, הכרטיס שלו נפתח בסוף הלוח — אחד בכל פעם. <span class="m3-tag">טיוטה</span></p>`;
  const g = h('div', 'm3-album');
  const cards = VESSEL_CARDS.map((v) => Object.assign({}, v, (d.vessels || []).find((x) => x && (x.piece === v.id || x.id === v.id)) || {}));
  for (const v of cards) {
    const n = (d.album && d.album[v.id]) || 0, open = isOpen(d, v), at = albumAt(v.k);
    const e = h('div', 'm3-vc' + (open ? '' : ' lock'));
    e.appendChild(iconEl('v' + v.k, 48));
    const title = v.title_he || v.title || KIND_HE[v.k];
    if (open) e.appendChild(h('div', null, `<b>${esc(title)}</b>${esc(v.card_he || v.text_he || v.text || '')}${v.card_he && v.text_he ? `<small>${esc(v.text_he)}</small>` : ''} <span class="m3-tag">טיוטה</span><span class="src">${esc(v.source || v.src || '')}</span>`));
    else e.appendChild(h('div', null, `<b>${esc(title)}</b><div class="m3-bar"><i style="width:${Math.min(100, n / at * 100)}%"></i></div>${Math.min(n, at)}/${at}${n >= at ? ' · נפתח בסוף הלוח הבא' : ''}`));
    g.appendChild(e);
  }
  c.appendChild(g);
  const b = h('button', 'm3-cta', 'חזרה למפה'); b.type = 'button'; b.addEventListener('click', () => done({ back: true, field: d.field })); c.appendChild(b);
}
