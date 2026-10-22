/* ── fable32 (build 17) ── ── recovered (build 17) ── focus17.js — the focused day of build 17 (E.b17; B17's numbers): one thing at a
 * time on the screen and the rest at hand —
 *   the top: the fire's ring (אש המערכה, 0…100; warn and crit shake it, "🔥 האש דועכת!" points at the altar; the gold notch at 60 when a
 *   tamid waits for the fire), the card of the step now ("משימה" — its icon, its text, n/goal), the tamid's line ("⏳ תמיד של … בעוד
 *   m:ss", the last seconds ticking); each a button (the fire and the tamid: E.fire17; the card: E.go17);
 *   the bar at the foot: the day's slots (B17.slots: kiyor, wood, kevesh, song, pen, bake) — need, empty, done, a lock (k20's), a +1
 *   flying in; a tap goes there (E.tap17);
 *   the answers: "+N" flying from the thing to its slot or to the card, sparks, the stamp ("משימה ✓", "תמיד של … — בזמן ★", "התמיד
 *   איחר" — late), "יום N", the day's summary (the stars, the tamids, the logs, the morning's roles) and "המשך ליום הבא";
 *   SHARED.hot17 (0…1: how near the next place — flow31's ring warms) with the near17 chimes; SHARED.b17 (the chips' mini mode);
 *   a portrait phone: "סובבו את הטלפון לרוחב" (the game paused till then, or "המשך בכל זאת");
 * and it makes the day's own modules as the engine opens them: ramp19 (E.b19), kiyor20 (E.g20), deshen21 (E.g21), maaracha22 (E.g22),
 * pis23 (E.p23on), pen25 (E.p25on), heichal26 (E.p26on), dam27 (E.p27on — build 27) and fx18 (E.l18: the acts' answers, one place for their sound).
 *   createFocus17({ E, view, sfx, doc }) → { destroy(), state(), stamp, banner, sparks, fly }      SHARED.hot17, SHARED.b17, globalThis.__F17
 * The bundle kept no comment and no local name: the names are the recovery's, but for createFocus17, sfx and the modules' lines
 * (focus17.js:14, :127, :129, :174–181 in the session transcript: E, doc, view, slotOf, top, sparks, stamp, pop, r19 … h26, fx). The CSS
 * keeps its own comments (build 17c). Never a Divine Name. */
import { onTick, SHARED } from './draw.js';
import { B17 } from './day33.js';
import { createFx18 } from './fx18.js';
import { createRamp19 } from './ramp19.js';
import { createKiyor20 } from './kiyor20.js';
import { createDeshen21 } from './deshen21.js';
import { createMaaracha22 } from './maaracha22.js';
import { createPen25 } from './pen25.js';
import { createHeichal26 } from './heichal26.js';
import { createDam27 } from './dam27.js';   // ── fable32 (build 27) ── ── /fable32 ──
import { createPis23, rolesBook23 } from './pis23.js';   // ── fable32 (build 31) ── (+ the roles book, from the day's summary) ── /fable32 ──
import { createEnd30 } from './end30.js';   // ── fable32 (build 30) ── an act's end: its source line, tappable ── /fable32 ──
import { openJournal32, createUnlock32 } from './book32.js';   // ── fable32 (build 32) ── the kohen's journal: the unlock card, the summary's doors ── /fable32 ──
import { createTl33 } from './chamber33.js';   // ── fable32 (build 33) ── "הטלה המבוקר": the morning's card ── /fable32 ──
import { RATE30, servedHe30 } from './rate30.js';
const F17 = Object.freeze({
  slot: 56,
  flyS: 0.55,
  stampS: 0.6,
  sparks: 10,
  bannerS: 2,
  bannerEvery: 12,
  chime: Object.freeze([12, 6]),
  tickLast: 5,
  flashLast: 10,
});
// ── fable32 (build 34) ── (.s17-mini::after: the far stations' 34-px chips take a tap over 46 px — every target ≥ 44; the look unchanged;
// the summary's "המשך ליום הבא" sticks to the card's bottom — on 296–390-px-high phones the day's rows pushed it below the screen) ── /fable32 ──
const CSS = `
.f17-top{position:fixed;top:calc(env(safe-area-inset-top,0px) + 6px);left:50%;transform:translateX(-50%);z-index:31;display:flex;align-items:flex-start;gap:8px;direction:rtl;pointer-events:none;font-family:"Heebo",system-ui,sans-serif;color:#FFF6DA;-webkit-user-select:none;user-select:none}
.f17-fire{position:relative;width:50px;height:50px;flex:none;border-radius:50%;background:rgba(28,20,10,.5)}
.f17-fire svg{position:absolute;inset:0;transform:rotate(-90deg)}.f17-fire circle{fill:none;stroke-width:5}.f17-fire .bg{stroke:rgba(255,236,190,.22)}
.f17-fire .fl{stroke:#FFB066;stroke-linecap:round;transition:stroke-dasharray .35s,stroke .3s}.f17-fire .mk{stroke:#FFF6DA;stroke-width:7}
.f17-fire i{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:24px/1 "Segoe UI Emoji","Noto Color Emoji",sans-serif;font-style:normal;transition:transform .25s,filter .25s}
.f17-fire.warn .fl{stroke:#FF9F1C}.f17-fire.warn{animation:f17-shake .5s ease-in-out infinite,f17-big 1s ease-in-out infinite alternate}.f17-fire.warn i{filter:saturate(.7)}
.f17-fire.crit .fl{stroke:#E5402A}.f17-fire.crit{animation:f17-shake .32s ease-in-out infinite,f17-big .45s ease-in-out infinite alternate;box-shadow:0 0 0 3px rgba(229,64,42,.55),0 0 18px 6px rgba(229,64,42,.6)}.f17-fire.crit i{transform:scale(.72);filter:grayscale(.45)}
.f17-fire.up{animation:f17-pop .4s ease-out}
.f17-fire b{position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:1px;font:900 12px/1 "Heebo",system-ui,sans-serif;color:#FFD66E;text-shadow:0 1px 2px #000;display:none}
.f17-fire.warn b,.f17-fire.crit b{display:block}.f17-fire.crit b{color:#FF8A6A}
.f17-card{min-height:44px;max-width:min(56vw,420px);box-sizing:border-box;display:flex;align-items:center;gap:8px;padding:4px 12px 4px 8px;border-radius:16px;background:rgba(28,20,10,.8);border:2px solid #E2B65A;box-shadow:0 3px 12px rgba(0,0,0,.45);white-space:nowrap}
.f17-card i{font:26px/1 "Segoe UI Emoji","Noto Color Emoji",sans-serif;font-style:normal}
.f17-card span{font:900 16px/1.1 "Heebo",system-ui,sans-serif;overflow:hidden;text-overflow:ellipsis}
.f17-card b{font:900 15px/1 "Heebo",system-ui,sans-serif;padding:4px 8px;border-radius:10px;background:#FFD66E;color:#2A1804;font-variant-numeric:tabular-nums;direction:ltr}
.f17-card b:empty{display:none}
.f17-card.fc{border-color:#FF8A5A;background:rgba(96,26,10,.9)}.f17-card.in{animation:f17-in .38s cubic-bezier(.2,1.4,.4,1)}.f17-card.got b{animation:f17-pop .35s ease-out}
.f17-tam{min-height:44px;box-sizing:border-box;display:flex;align-items:center;gap:4px;padding:3px 12px;border-radius:16px;background:rgba(28,20,10,.62);font:800 14px/1.15 "Heebo",system-ui,sans-serif;white-space:nowrap;opacity:.9}.f17-tam.gone{display:none}
.f17-tam em{font-style:normal;font-variant-numeric:tabular-nums;direction:ltr;display:inline-block}
.f17-tam.soon{opacity:1;background:#C8923A;color:#2A1804;animation:f17-flash .5s steps(2) infinite}.f17-tam.late{opacity:1;background:#B4521C;color:#FFF6DA;animation:f17-big .8s ease-in-out infinite alternate}
/* ── fable32 (build 17c) ── every top element a button (a pressed state); the gold notch at 60 when a tamid waits for the fire ── */
.f17-fire,.f17-card,.f17-tam{pointer-events:auto;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.f17-top .prs{transform:scale(.88)!important;filter:brightness(1.3)}
.f17-fire.n60 .mk{stroke:#FFD66E;stroke-width:12;stroke-dasharray:3 97;stroke-dashoffset:-58.5}.f17-fire.n60{box-shadow:0 0 0 2px rgba(255,214,110,.55)}
.f17-bar{position:fixed;bottom:calc(env(safe-area-inset-bottom,0px) + 6px);left:50%;transform:translateX(-50%);z-index:24;display:flex;gap:6px;direction:rtl;pointer-events:none}
@media (orientation:portrait){.f17-top{flex-wrap:wrap;justify-content:center;width:calc(100vw - 16px)}.f17-card{max-width:calc(100vw - 84px);white-space:normal}.f17-bar{bottom:auto;top:calc(env(safe-area-inset-top,0px) + 112px)}.f17-stamp b{font-size:min(44px,9vw)}.f17-ban{font-size:min(26px,6vw)}}
.f17-sl.done b{background:#3E9B4F;color:#fff}.f17-p1{position:absolute;left:50%;top:-6px;font:900 15px/1 "Heebo",system-ui,sans-serif;color:#9BFF8A;text-shadow:0 1px 2px #000;pointer-events:none;animation:f17-p1 .8s ease-out forwards}
@keyframes f17-p1{from{opacity:1;transform:translate(-50%,0)}to{opacity:0;transform:translate(-50%,-26px)}}
.f17-sl{position:relative;width:56px;height:56px;border-radius:14px;border:2px solid rgba(255,236,190,.6);background:rgba(28,20,10,.78);color:#FFF6DA;pointer-events:auto;touch-action:manipulation;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0;-webkit-tap-highlight-color:transparent;box-shadow:0 2px 8px rgba(0,0,0,.4)}
.f17-sl i{font:25px/1 "Segoe UI Emoji","Noto Color Emoji",sans-serif;font-style:normal;margin-top:-6px}
.f17-sl b{position:absolute;left:50%;bottom:2px;transform:translateX(-50%);font:900 11px/1 "Heebo",system-ui,sans-serif;padding:2px 5px;border-radius:7px;background:rgba(255,236,190,.92);color:#2A1804;white-space:nowrap;direction:ltr}
.f17-sl b:empty{display:none}
.f17-sl.need{border-color:#FFF1C8;background:radial-gradient(circle at 40% 30%,#E9C46A,#8A5A14);animation:f17-glow 1.1s ease-in-out infinite alternate}
.f17-sl.empty:not(.need){opacity:.55}.f17-sl:active{transform:scale(.92)}.f17-sl.got{animation:f17-pop .35s ease-out}
.f17-ban{position:fixed;left:50%;top:22%;transform:translate(-50%,-50%) scale(.6);z-index:33;display:flex;align-items:center;gap:10px;padding:8px 18px;border-radius:18px;background:rgba(120,24,10,.9);border:3px solid #FFB066;color:#FFF6DA;font:900 26px/1.1 "Heebo",system-ui,sans-serif;direction:rtl;white-space:nowrap;pointer-events:none;opacity:0;box-shadow:0 6px 22px rgba(0,0,0,.55)}
.f17-ban.on{animation:f17-ban 2s ease-out forwards}
.f17-ban u{display:inline-block;text-decoration:none;font:900 30px/1 "Heebo",system-ui,sans-serif;color:#FFD66E;transition:transform .2s}
.f17-stamp{position:fixed;left:50%;top:44%;transform:translate(-50%,-50%) rotate(-4deg);z-index:33;text-align:center;pointer-events:none;opacity:0;direction:rtl;white-space:nowrap;padding:12px 44px;background:radial-gradient(ellipse at center,rgba(28,20,10,.62),rgba(28,20,10,.35) 55%,rgba(28,20,10,0) 72%)}
.f17-stamp b{display:block;font:900 44px/1.05 "Heebo",system-ui,sans-serif;color:#FFD66E;-webkit-text-stroke:2px #5A3608;text-shadow:0 4px 0 #6A4614,0 0 22px rgba(255,200,80,.85)}
.f17-stamp small{display:block;margin-top:4px;font:900 17px/1.1 "Heebo",system-ui,sans-serif;color:#FFF6DA;text-shadow:0 2px 3px #000}
.f17-stamp.late b{color:#FFB066;font-size:36px}.f17-stamp.on{animation:f17-stamp .62s ease-out forwards}
.f17-fly{position:fixed;left:0;top:0;z-index:34;pointer-events:none;font:900 22px/1 "Heebo",system-ui,sans-serif;color:#FFD66E;text-shadow:0 2px 0 #6A4614,0 0 10px rgba(0,0,0,.6);white-space:nowrap;will-change:transform,opacity}
.f17-sp{position:fixed;left:0;top:0;z-index:34;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:#FFE58A;box-shadow:0 0 8px 2px rgba(255,214,110,.9);pointer-events:none;will-change:transform,opacity}
.f17-pop{position:fixed;left:50%;top:76px;transform:translateX(-50%);z-index:32;pointer-events:none;font:900 18px/1 "Heebo",system-ui,sans-serif;color:#FFF6DA;background:rgba(28,20,10,.8);padding:5px 12px;border-radius:12px;white-space:nowrap;direction:rtl;animation:f17-popup 1.4s ease-out forwards}
.f17-sum{position:fixed;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;background:rgba(14,10,5,.6);direction:rtl;font-family:"Heebo",system-ui,sans-serif;color:#FFF6DA;pointer-events:auto}
.f17-sum .c{width:min(460px,calc(100vw - 32px));max-height:calc(100vh - 16px);overflow:auto;box-sizing:border-box;padding:10px 18px 12px;border-radius:20px;background:linear-gradient(#3A2A16,#21170B);border:2px solid #C8923A;box-shadow:0 10px 40px rgba(0,0,0,.6);text-align:center}
.f17-sum h2{margin:2px 0 2px;font:900 22px/1.2 "Heebo",system-ui,sans-serif}
.f17-sum .st{font-size:44px;line-height:1;letter-spacing:6px;color:rgba(255,236,190,.28)}.f17-sum .st i{font-style:normal;display:inline-block;transform:scale(0)}
.f17-sum .st i.on{color:#FFD66E;text-shadow:0 0 14px rgba(255,214,110,.8)}.f17-sum .st i.in{animation:f17-star .45s cubic-bezier(.3,1.6,.5,1) forwards}
.f17-sum ul{list-style:none;margin:6px 0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;text-align:right;font:700 14px/1.3 "Heebo",system-ui,sans-serif}
.f17-sum li b{color:#FFD66E}.f17-sum .pr{font:900 16px/1.3 "Heebo",system-ui,sans-serif;color:#FFE6A0;margin:4px 0 8px}
.f17-sum button{width:100%;min-height:62px;border-radius:18px;border:0;font:900 26px/1 "Heebo",system-ui,sans-serif;cursor:pointer;background:radial-gradient(circle at 40% 30%,#FFE6A0,#E2B65A 70%,#9A6F1E);color:#2A1804;box-shadow:0 5px 0 #6A4614,0 0 24px rgba(255,214,110,.5);animation:f17-btn 1s ease-in-out infinite alternate}
.f17-sum .dr{font:600 10px/1 "Heebo",system-ui,sans-serif;opacity:.55;margin-top:6px}
.f17-sum .c>[data-f17=next]{position:sticky;bottom:0;z-index:1}
body.f17-on .f31-hot{display:none!important}
body.f17-crit .f17-tam,body.f17-crit .s29-st.s17-mini,body.f17-crit .sh-pin,body.f17-crit .f17-pop{display:none!important}
.f17-rot{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:rgba(20,14,7,.94);color:#FFF6DA;direction:rtl;font:900 26px/1.3 "Heebo",system-ui,sans-serif;text-align:center;padding:24px;pointer-events:auto}
.f17-rot i{font:72px/1 "Segoe UI Emoji","Noto Color Emoji",sans-serif;font-style:normal;animation:f17-rot 1.6s ease-in-out infinite}
.f17-rot button{min-height:52px;min-width:180px;border-radius:16px;border:2px solid #E2B65A;background:rgba(255,236,190,.12);color:#FFF6DA;font:800 18px/1 "Heebo",system-ui,sans-serif;cursor:pointer}
@keyframes f17-rot{0%,30%{transform:rotate(0)}60%,100%{transform:rotate(-90deg)}}
body.f17-on .tw-base{width:136px;height:136px;margin:-68px 0 0 -68px}
body.f17-on .sh-hint{bottom:calc(env(safe-area-inset-bottom,0px) + 72px)}
.s29-st.s17-mini{min-width:0;width:34px;height:34px;padding:0;justify-content:center;border-radius:50%;opacity:.5;background:rgba(40,28,12,.55);border-width:1.5px}
.s29-st.s17-mini::after{content:"";position:absolute;inset:-6px;border-radius:50%}
.s29-st.s17-mini span,.s29-st.s17-mini .s30-d,.s29-st.s17-mini .s30-ar,.s29-st.s17-mini small{display:none!important}
.s29-st.s17-mini i{font-size:18px}
body.f17-on .s29-st.cue{animation:s29cue 1.4s ease-in-out infinite alternate;box-shadow:0 0 0 calc(3px + 6px * var(--hot17,0)) rgba(255,190,90,calc(.35 + .5 * var(--hot17,0)))}
@keyframes f17-shake{0%,100%{translate:0 0}25%{translate:-3px 0}75%{translate:3px 0}}
@keyframes f17-big{from{scale:1}to{scale:1.22}}
@keyframes f17-btn{from{scale:1}to{scale:1.04}}
@keyframes f17-pop{50%{transform:scale(1.35)}}
@keyframes f17-in{from{opacity:0;transform:translateY(-26px) scale(.9)}to{opacity:1;transform:none}}
@keyframes f17-flash{50%{opacity:.55}}
@keyframes f17-glow{from{box-shadow:0 0 0 2px rgba(255,214,110,.4)}to{box-shadow:0 0 0 7px rgba(255,214,110,.8),0 0 18px 4px rgba(255,200,80,.7)}}
@keyframes f17-ban{0%{opacity:0;transform:translate(-50%,-50%) scale(.6)}12%{opacity:1;transform:translate(-50%,-50%) scale(1.1)}20%{transform:translate(-50%,-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(.95)}}
@keyframes f17-stamp{0%{opacity:0;transform:translate(-50%,-50%) rotate(-4deg) scale(1.9)}22%{opacity:1;transform:translate(-50%,-50%) rotate(-4deg) scale(1)}78%{opacity:1}100%{opacity:0;transform:translate(-50%,-56%) rotate(-4deg) scale(1.05)}}
@keyframes f17-popup{0%{opacity:0;margin-top:8px}15%{opacity:1;margin-top:0}75%{opacity:1}100%{opacity:0;margin-top:-14px}}
@keyframes f17-star{from{transform:scale(0) rotate(-40deg)}to{transform:scale(1) rotate(0)}}
/* ── fable32 (build 30) ── the step card is the act's one line; a word of feedback (sy-ok gold, sy-no amber — never red); at the act's end
   its rating: מהודר gold and glowing, כשר cream, טעון תיקון soft sand. The day's summary: the day's ratings in place of the stars ── */
.f17-top.f17-a30 .f17-tam:not(.c18-till){display:none}.f17-top.f17-a30 .f17-card span{-webkit-line-clamp:1!important;white-space:nowrap}
.f17-card.sy-ok span{color:#FFE6A0}.f17-card.sy-no span{color:#FFC690}.f17-card.sy-ok,.f17-card.sy-no{animation:f17-pop .3s ease-out}
.f17-card.r30-mehudar{border-color:#FFF1C8;box-shadow:0 0 0 2px rgba(255,214,110,.45),0 0 18px rgba(255,214,110,.7)}.f17-card.r30-mehudar span{color:#FFD66E;font-size:20px;text-shadow:0 0 10px rgba(255,214,110,.75)}.f17-card.r30-mehudar i{color:#FFD66E;font:900 22px/1 Heebo,system-ui,sans-serif}
.f17-card.r30-kasher span{color:#FFF6DA;font-size:19px}.f17-card.r30-kasher i{font:900 20px/1 Heebo,system-ui,sans-serif;color:#F2E6C8}
.f17-card.r30-tikkun{border-color:#B8A88A}.f17-card.r30-tikkun span{color:#E6D9BE;font-size:17px}.f17-card.r30-tikkun i{font:900 18px/1 Heebo,system-ui,sans-serif;color:#D8CDB8}
.f17-sum .rt{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:4px 0 2px}.f17-sum .rt i{font-style:normal;display:inline-block;transform:scale(0);font:900 17px/1 Heebo,system-ui,sans-serif;padding:5px 12px;border-radius:12px}
.f17-sum .rt i.mehudar{background:#FFD66E;color:#2A1804;box-shadow:0 0 14px rgba(255,214,110,.7)}.f17-sum .rt i.kasher{background:#F2E6C8;color:#2A1804}.f17-sum .rt i.tikkun{background:#D8CDB8;color:#3A3328}.f17-sum .rt i.in{animation:f17-star .45s cubic-bezier(.3,1.6,.5,1) forwards}
.f17-sum button.src30{min-height:44px;font:800 16px/1 Heebo,system-ui,sans-serif;margin:0 0 8px;background:#FFECBE1F;color:#FFF6DA;border:2px solid #E2B65A;box-shadow:none;animation:none}
.f17-sum .r31{display:flex;gap:8px}.f17-sum .r31 button.src30{flex:1;min-width:0;padding:0 6px;font-size:15px}   /* ── fable32 (build 31) ── (the sources and the roles book side by side) ── */
.f17-sum li b.mehudar{color:#FFD66E}.f17-sum li b.kasher{color:#FFF6DA}.f17-sum li b.tikkun{color:#E6D9BE}.f17-sum .sv{font:800 13px/1.2 Heebo,system-ui,sans-serif;opacity:.85;margin:0 0 2px}
`;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const mmss = (s) => {
  s = Math.max(0, Math.ceil(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
function buzz(p) {
  try {
    if (typeof navigator < 'u' && navigator.vibrate) navigator.vibrate(p);
  } catch (e) {}
}
function tamidLine(tm, fuel) {
  if (!tm) return { text: '', cls: 'gone', n60: false };
  if (tm.done) return { text: `🌅 שקיעה בעוד <em>${mmss(tm.inS)}</em>`, cls: '', n60: false };
  if (tm.late) return { text: '', cls: 'gone', n60: fuel < B17.tamid.fire };
  const soon = tm.inS <= F17.flashLast;
  return { text: `⏳ תמיד של ${tm.when} בעוד <em>${mmss(tm.inS)}</em>`, cls: soon ? 'soon' : '', n60: fuel < B17.tamid.fire && tm.inS <= 40 };
}
const fuelClass = (v) => (v < B17.crit ? 'crit' : v < B17.warn ? 'warn' : '');
export function createFocus17(o = {}) {
  const E = o.E,
    doc = o.doc || (typeof document < 'u' ? document : null),
    view = o.view || null,
    sfx = (n, a) => {
      try {
        if (o.sfx && o.sfx.play) o.sfx.play(n, a);
      } catch (e) {}
    },
    stat = {
      stamps: 0,
      flights: 0,
      banners: 0,
      warns: 0,
      crits: 0,
      chimes: 0,
      dings: 0,
      sparks: 0,
      cards: 0,
      ev: [],
      summaries: 0,
      lastStep: '',
      fireCls: '',
      taps: 0,
      ticks: 0,
      topTaps: 0,
      topLast: null,
      plus: 0,
      rot: 0,
    };
  if (!doc || !E || !E.on17) return { destroy() {}, state: () => stat };
  if (!doc.getElementById('f17-css')) {
    const css = doc.createElement('style');
    css.id = 'f17-css';
    css.textContent = CSS;
    doc.head.appendChild(css);
  }
  doc.body.classList.add('f17-on');
  SHARED.b17 = true;
  try {
    globalThis.__SH17UP = true;
  } catch (e) {}
  const mk = (cls, html, tag = 'div', parent = doc.body) => {
      const el = doc.createElement(tag);
      el.className = cls;
      if (html != null) el.innerHTML = html;
      parent.appendChild(el);
      return el;
    },
    top = mk('f17-top', ''),
    fire = mk(
      'f17-fire',
      '<svg viewBox="0 0 50 50" aria-hidden="true"><circle class="bg" cx="25" cy="25" r="20.5"/><circle class="fl" cx="25" cy="25" r="20.5" pathLength="100" stroke-dasharray="0 100"/><circle class="mk" cx="25" cy="25" r="20.5" pathLength="100" stroke-dasharray="1.6 98.4"/></svg><i>🔥</i><b></b>',
      'div',
      top,
    );
  fire.setAttribute('role', 'img');
  const fireArc = fire.querySelector('.fl'),
    fireNum = fire.querySelector('b');
  fire.querySelector('.mk').setAttribute('stroke-dashoffset', String(-(B17.tamid.fire - 0.8)));
  const card = mk('f17-card', '<i></i><span></span><b></b>', 'div', top);
  card.setAttribute('role', 'status');
  const cardIcon = card.querySelector('i'),
    cardText = card.querySelector('span'),
    cardProg = card.querySelector('b'),
    tam = mk('f17-tam', '', 'div', top),
    button = (el, fn) => {
      el.setAttribute('role', 'button');
      el.addEventListener('pointerdown', (ev) => ev.stopPropagation());
      el.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        stat.topTaps++;
        el.classList.add('prs');
        setTimeout(() => el.classList.remove('prs'), 160);
        sfx('tab', { i: 2 });
        buzz(15);
        let ok = false;
        try {
          ok = !!fn();
        } catch (e) {}
        stat.topLast = [el.className.split(' ')[0], ok];
      });
    };
  button(fire, () => E.fire17 && E.fire17());
  button(tam, () => E.fire17 && E.fire17());
  button(card, () => E.go17 && E.go17());
  let bar = mk('f17-bar', ''),
    banner = mk('f17-ban', '<span>🔥 האש דועכת!</span><u>➜</u>'),
    bannerArrow = banner.querySelector('u'),
    stampEl = mk('f17-stamp', '<b></b><small></small>'),
    stampB = stampEl.querySelector('b'),
    stampSmall = stampEl.querySelector('small'),
    summary = null,
    stampT = 0,
    popT = 0,
    bannerUntil = 0,
    bannerAt = -1e9,
    fireCls = '',
    chimeArm = [true, true],
    lastTick = -1,
    raf = 0,
    dead = false,
    now = () => (typeof performance < 'u' ? performance.now() / 1e3 : Date.now() / 1e3),
    slotEl = {},
    slotN = {},
    center = (el) => {
      try {
        const r = el.getBoundingClientRect();
        return r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
      } catch (e) {
        return null;
      }
    },
    proj = (p) => {
      if (!p || !view || !view.project) return null;
      try {
        const q = view.project(p.x, p.y, p.z);
        return q && q.on !== false ? { x: q.x, y: q.y } : null;
      } catch (e) {
        return null;
      }
    };
  function sparks(at, n = F17.sparks, color) {
    if (!at || !doc.body.animate) return;
    stat.sparks++;
    for (let i = 0; i < n; i++) {
      const sp = mk('f17-sp', null);
      if (color) sp.style.background = color;
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.5,
        d = 26 + Math.random() * 34;
      try {
        const an = sp.animate(
          [
            { transform: `translate(${at.x}px,${at.y}px) scale(1)`, opacity: 1 },
            { transform: `translate(${at.x + Math.cos(a) * d}px,${at.y + Math.sin(a) * d}px) scale(.3)`, opacity: 0 },
          ],
          { duration: 420 + Math.random() * 160, easing: 'cubic-bezier(.2,.8,.3,1)' },
        );
        an.onfinish = () => sp.remove();
      } catch (e) {
        sp.remove();
      }
    }
  }
  function fly(text, from, toEl, done) {
    const to = toEl ? center(toEl) : null;
    if (!from || !to || !doc.body.animate) {
      if (done) done();
      return;
    }
    stat.flights++;
    const el = mk('f17-fly', esc(text));
    try {
      const an = el.animate(
        [
          { transform: `translate(${from.x - 16}px,${from.y - 12}px) scale(.8)`, opacity: 0 },
          { transform: `translate(${from.x - 16}px,${from.y - 40}px) scale(1.25)`, opacity: 1, offset: 0.25 },
          { transform: `translate(${to.x - 16}px,${to.y - 10}px) scale(.7)`, opacity: 0.9 },
        ],
        { duration: F17.flyS * 1e3, easing: 'cubic-bezier(.5,0,.7,1)' },
      );
      an.onfinish = () => {
        el.remove();
        if (toEl) {
          toEl.classList.remove('got', 'up');
          toEl.offsetWidth;
          toEl.classList.add(toEl === fire ? 'up' : 'got');
        }
        if (done) done();
      };
    } catch (e) {
      el.remove();
      if (done) done();
    }
  }
  function stamp(title, sub, cls = '') {
    stat.stamps++;
    stampB.textContent = title;
    stampSmall.textContent = sub || '';
    stampEl.className = 'f17-stamp ' + cls;
    stampEl.offsetWidth;
    stampEl.classList.add('on');
    clearTimeout(stampT);
    stampT = setTimeout(() => stampEl.classList.remove('on'), F17.stampS * 1e3 + 80);
    if (cls !== 'late') {
      const at = center(stampB) || { x: (innerWidth || 844) / 2, y: (innerHeight || 390) * 0.44 };
      sparks(at, 16);
      sparks({ x: at.x - 90, y: at.y + 6 }, 8);
      sparks({ x: at.x + 90, y: at.y + 6 }, 8);
    }
  }
  function pop(text) {
    const el = mk('f17-pop', esc(text));
    setTimeout(() => el.remove(), 1500);
  }
  let slotOf = (id) => slotEl[id] || null,
    r19 = null;
  if (E.b19)
    try {
      r19 = createRamp19({ E, sfx: o.sfx });
    } catch (e) {
      console.warn('[focus17] r19', e && e.message);
    }
  let k20 = null;
  if (E.g20)
    try {
      k20 = createKiyor20({ E, sfx: o.sfx, doc, slot: slotOf });
    } catch (e) {
      console.warn('[focus17] k20', e && e.message);
    }
  let d21 = null;
  if (E.g21)
    try {
      d21 = createDeshen21({ E, sfx: o.sfx, doc, view });
    } catch (e) {
      console.warn('[focus17] d21', e && e.message);
    }
  let m22 = null;
  if (E.g22)
    try {
      m22 = createMaaracha22({ E, sfx: o.sfx, doc, view });
    } catch (e) {
      console.warn('[focus17] m22', e && e.message);
    }
  let p23 = null;
  if (E.p23on)
    try {
      p23 = createPis23({ E, sfx: o.sfx, doc, view });
    } catch (e) {
      console.warn('[focus17] p23', e && e.message);
    }
  let p25 = null;
  if (E.p25on)
    try {
      p25 = createPen25({ E, sfx: o.sfx, doc, view });
    } catch (e) {
      console.warn('[focus17] p25', e && e.message);
    }
  let h26 = null;
  if (E.p26on)
    try {
      h26 = createHeichal26({ E, sfx: o.sfx, doc, view });
    } catch (e) {
      console.warn('[focus17] h26', e && e.message);
    }
  // ── fable32 (build 27) ── the blood roles' module ── /fable32 ──
  let d27 = null;
  if (E.p27on)
    try {
      d27 = createDam27({ E, sfx: o.sfx, doc, view });
    } catch (e) {
      console.warn('[focus17] d27', e && e.message);
    }
  // ── fable32 (build 30) ── an act's end: the source line under the top bar, its card on a tap ── /fable32 ──
  let r30 = null;
  if (E.act30)
    try {
      r30 = createEnd30({ E, sfx: o.sfx, doc, view });
    } catch (e) {
      console.warn('[focus17] r30', e && e.message);
    }
  // ── fable32 (build 32) ── the journal's unlock card ("j32new": a role the lot never gave him, its first end — or the first page ever) ── /fable32 ──
  let u32 = null;
  if (E.j32card)
    try {
      u32 = createUnlock32({ E, sfx: o.sfx, doc });
    } catch (e) {
      console.warn('[focus17] u32', e && e.message);
    }
  // ── fable32 (build 33) ── the morning's lamb ("tl33new": the lamb he inspected four or more days ago goes up for the Tamid today) ── /fable32 ──
  let t33 = null;
  if (E.tl33card && !E.prac31)
    try {
      t33 = createTl33({ E, sfx: o.sfx, doc });
    } catch (e) {
      console.warn('[focus17] t33', e && e.message);
    }
  // ── fable32 (build 30) ── while an act is in progress (its one line) or its rating shows, the day's other words wait (a task done, a
  // level, a badge, the coins' first note): later30 holds them till the act and its word are over ── /fable32 ──
  const quiet30 = () => {
      try {
        return !!((E.act30 && E.act30()) || (E.word30 && E.word30()));
      } catch (e) {
        return false;
      }
    },
    held30 = [],
    // (a pop stands at the top, where the end's source line is: it waits for that line too — chip)
    later30 = (fn, chip) => {
      if (quiet30() || (chip && r30 && r30.busy())) held30.push(chip ? Object.assign(fn, { chip30: 1 }) : fn);
      else fn();
    },
    stampQ = (...a) => later30(() => stamp(...a)),
    popQ = (text) => later30(() => pop(text), true);
  let fx = null;
  if (E.l18)
    try {
      fx = createFx18({ E, view, sfx: o.sfx, doc, top, slot: slotOf, sparks, stamp: stampQ, note: popQ, pop: o.sfx && o.sfx.pop });   // ── fable32 (build 30) ── (its words wait for an act's end) ── /fable32 ──
    } catch (e) {
      console.warn('[focus17] fx18', e && e.message);
    }
  const onEv = (ev) => {
      stat.ev.push([ev.type, ev.t]);
      if (stat.ev.length > 60) stat.ev.shift();
      if (ev.type === 'hit') {
        const at = proj(ev.at);
        if (at && !fx) sparks(at, 9);
        const f = E.focus17(),
          stepId = f.step && f.step.id,
          toEl =
            ev.to === 'card' && (stepId === ev.id || (ev.id === 'pen' && stepId === 'pen'))
              ? cardProg
              : slotOf(ev.to === 'card' ? ev.id : ev.to) || cardProg;
        fly(ev.text, at, toEl);
      } else if (ev.type === 'lay') {
        const at = proj(ev.at);
        if (at && !fx) sparks(at, 12, '#FFB066');
        fly(`+${ev.n} 🔥`, at, fire);
      } else if (ev.type === 'done') {
        // ── fable32 (build 30) ── (in an act — the pyre's logs sorted — its one line says it for a moment; else the stamp, after the act's word) ── /fable32 ──
        if (E.act30 && E.act30() && E.say30) E.say30(String(ev.text || '').replace(/!$/, ' ✓'), 'ok', 1.8);
        else stampQ(ev.text, ev.sub || '');
        sfx('chord17');
        buzz([25, 40, 25]);
      } else if (ev.type === 'task')
        setTimeout(() => later30(() => {
          stamp('משימה ✓', `${String(ev.text || '').replace(/^\S+\s/, '')} · +${ev.pay | 0} פרוטות`);
          sfx('chord17', { up: 1 });
          buzz([20, 30, 20, 30, 40]);
        }), 700);
      else if (ev.type === 'tamid')
        if (ev.onTime) {
          stamp(`תמיד של ${ev.when} — בזמן ★`, 'החצוצרות תוקעות');
          buzz([40, 60, 40, 60, 80]);
        } else pop(`תמיד של ${ev.when} — הוקרב באיחור`);
      else if (ev.type === 'late') {
        stamp('"התמיד איחר"', `הממונה: ${ev.why || ''} — העלו עצים`, 'late');
        buzz([60, 80, 60]);
      } else if (ev.type === 'level') setTimeout(() => popQ(`🔥 המערכה ברמה ${ev.level}`), 1200);
      else if (ev.type === 'pop') (/^📜/.test(String(ev.text || '')) ? popQ : pop)(ev.text);   // ── fable32 (build 30) ── (a badge's word waits for an act's end) ── /fable32 ──
      else if (ev.type === 'arrive') {
        stat.dings++;
        sfx('ding17');
        buzz(40);
      } else if (ev.type === 'summary') showSummary(ev);
      else if (ev.type === 'day') {
        closeSummary();
        setTimeout(() => stamp(`יום ${ev.day}`, 'בוקר בעזרה — האש מחכה לעצים'), 300);
      }
    },
    offEv = E.on17(onEv);
  function showSummary(sum) {
    closeSummary();
    stat.summaries++;
    // ── fable32 (build 30) ── the day's ratings in place of the stars (they were the tamids on time): a chip for each count (מהודר · כשר ·
    // טעון תיקון), each act's word, "שימשת N בקרים"; no points (the score of Phase A is not the day's) ── /fable32 ──
    let extra = null;
    const R = sum.r30 || { h: 0, k: 0, t: 0 },
      chips = ['mehudar', 'kasher', 'tikkun']
        .map((r) => [r, R[RATE30.key[r]] | 0])
        .filter(([, n]) => n > 0)
        .map(([r, n]) => `<i class="${r}">${RATE30.icon[r]} ${RATE30.he[r]}${n > 1 ? ` ×${n}` : ''}</i>`)
        .join(''),
      acts = (sum.ratings || []).map((x) => `<li>${esc(x.he)}: <b class="${esc(x.rating)}">${esc(RATE30.he[x.rating] || '')}</b></li>`).join(''),
      // ── fable32 (build 31) ── (no guilt word after the round — HANDOFF rule 4: a tamid not on time is "הוקרב", as it was; it said "late" here) ── /fable32 ──
      tamids = (sum.tamids || []).map((tm) => `<li>תמיד של ${esc(tm.when)}: <b>${tm.ok ? 'בזמן ✓' : 'הוקרב'}</b></li>`).join(''),
      badges = (sum.badges || []).map((b) => `<li>📜 ${esc(b.text)}: <b>+${b.pay | 0}</b></li>`).join(''),
      sv = servedHe30(sum.served | 0);
    summary = mk(
      'f17-sum',
      `<div class="c" role="dialog" aria-label="סוף היום"><h2>יום ${sum.day | 0} הסתיים</h2>${sv ? `<div class="sv">${esc(sv)}</div>` : ''}<div class="rt" aria-label="הדירוגים של היום">${chips}</div>
      <ul>${acts}${tamids}<li>גזרים על המערכה: <b>${sum.logs | 0}</b></li><li>העלייה המהירה בכבש: <b>${sum.rampBest ? `${sum.rampBest} שנ׳` : '—'}</b></li><li>משימות הממונה: <b>${(sum.tasks || [0, 0])[0]}/${(sum.tasks || [0, 0])[1]}</b></li>${(extra = sum.c18) ? `<li>לקופת המקדש היום: <b>+${extra.earn} 🪙</b></li><li>בקופת המקדש: <b>${extra.total} 🪙</b></li>${extra.next ? `<li>${extra.next.icon} ${extra.next.he}: <b>${extra.next.have}/${extra.next.price} 🪙</b></li>` : ''}` : `<li>פרוטות היום: <b>+${sum.perutot | 0}</b></li>`}${badges}</ul>
      <div class="pr">${esc(sum.praise || '')}</div><div class="r31">${(sum.ratings || []).length && (E.book31 || r30) /* ── fable32 (build 32) ── (the journal's משניות, today's) ── /fable32 ── */ ? '<button type="button" class="src30" data-f17="src">📜 המקורות של היום</button>' : ''}${E.book31 ? '<button type="button" class="src30" data-f17="book">🎭 ספר התפקידים</button>' : '' /* ── fable32 (build 31) ── (the roles book, read-only mid-day) ── /fable32 ── */}</div><button type="button" data-f17="next">המשך ליום הבא</button><div class="dr">טיוטה — להמחשה</div></div>`,
    );
    // ── fable32 (build 31) ── the roles book from the day's summary: read-only (no practice mid-day — its doors are the lobby's) ── /fable32 ──
    // ── fable32 (build 32) ── now the journal, on its "תפקידים" tab (the same book, read-only here: o.note31) ── /fable32 ──
    {
      const bb = summary.querySelector('[data-f17=book]');
      if (bb) {
        bb.addEventListener('pointerdown', (ev) => ev.stopPropagation());
        bb.addEventListener('click', (ev) => {
          ev.stopPropagation();
          sfx('ui');
          try {
            if (E.book31) openJournal32({ doc, save: E.book31(), tab: 'roles', note31: true, sfx: o.sfx, persist: () => E.persist32 && E.persist32() });
            else rolesBook23({ doc, save: {}, note31: true });
          } catch (e) {}
        });
      }
    }
    // ── fable32 (build 30) ── (every act's sources, again, without a clock: the day's card — end30's openDay) ── /fable32 ──
    // ── fable32 (build 32) ── "📜 המקורות של היום" opens the journal's משניות, today's only (the day's acts and the lots that gave them);
    // "כל המשניות" there shows them all ── /fable32 ──
    {
      const sb = summary.querySelector('[data-f17=src]');
      if (sb) {
        sb.addEventListener('pointerdown', (ev) => ev.stopPropagation());
        sb.addEventListener('click', (ev) => {
          ev.stopPropagation();
          try {
            if (E.book31) openJournal32({ doc, save: E.book31(), tab: 'mishna', today: (sum.ratings || []).map((x) => x.id), dayN: sum.day | 0, note31: true, sfx: o.sfx, persist: () => E.persist32 && E.persist32() });
            else r30.openDay(sum.ratings);
          } catch (e) {}
        });
      }
    }
    summary.querySelectorAll('.rt i').forEach((st, i) =>
      setTimeout(
        () => {
          st.classList.add('in');
          sfx('starPop', { n: i + 1 });
        },
        300 + i * 330,
      ),
    );
    let next = summary.querySelector('[data-f17=next]'),
      went = false;
    next.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (!went) {
        went = true;
        sfx('ui');
        try {
          E.nextDay();
        } catch (e) {}
        closeSummary();
      }
    });
    next.addEventListener('pointerdown', (ev) => ev.stopPropagation());
  }
  function closeSummary() {
    if (summary) {
      try {
        summary.remove();
      } catch (e) {}
      summary = null;
    }
  }
  function setBar(list) {
    const key = list.map((s) => s.id).join(',');
    if (bar.__k !== key) {
      bar.__k = key;
      for (const id in slotEl) delete slotEl[id];
      bar.innerHTML = '';
      for (const s of list) {
        const btn = doc.createElement('button');
        btn.type = 'button';
        btn.className = 'f17-sl';
        btn.dataset.st = s.id;
        btn.setAttribute('aria-label', s.he);
        btn.innerHTML = `<i aria-hidden="true">${s.icon}</i><b></b>`;
        btn.addEventListener('pointerdown', (ev) => ev.stopPropagation());
        btn.addEventListener('click', (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          stat.taps++;
          sfx('tab', { i: list.findIndex((s2) => s2.id === s.id) });
          buzz(15);
          try {
            E.tap17(s.id);
          } catch (e) {}
        });
        bar.appendChild(btn);
        slotEl[s.id] = btn;
        btn.__b = btn.querySelector('b');
      }
    }
    for (const s of list) {
      const btn = slotEl[s.id];
      if (!btn) continue;
      if (btn.__b.textContent !== s.badge) btn.__b.textContent = s.badge;
      btn.classList.toggle('need', !!s.need);
      btn.classList.toggle('empty', !!s.empty);
      btn.classList.toggle('done', !!s.done);
      btn.classList.toggle('k20-lk', !!s.lock);
      const n0 = slotN[s.id];
      if (n0 != null && s.n > n0) {
        stat.plus++;
        const plus = doc.createElement('span');
        plus.className = 'f17-p1';
        plus.textContent = `+${s.n - n0}`;
        btn.appendChild(plus);
        setTimeout(() => plus.remove(), 850);
        btn.classList.remove('got');
        btn.offsetWidth;
        btn.classList.add('got');
      }
      slotN[s.id] = s.n;
    }
    if (list.length) {
      const k = `${key}|${innerWidth}x${innerHeight}`,
        r =
          bar.__r && bar.__r.k === k
            ? bar.__r
            : (bar.__r = (() => {
                const rc = bar.getBoundingClientRect();
                return {
                  k,
                  w: Math.round(rc.width),
                  v: rc.width ? [rc.left + rc.width / 2, rc.top + rc.height / 2, rc.width + 8, rc.height + 8] : null,
                };
              })());
      if (r.v) SHARED.rects.push(r.v);
      if (doc.body.__bw !== r.w) {
        doc.body.__bw = r.w;
        doc.body.style.setProperty('--f17bw', `${r.w}px`);
      }
    }
  }
  function tick() {
    if (dead) return;
    let F = null;
    try {
      F = E.focus17();
    } catch (e) {
      F = null;
    }
    const live = !!(F && F.phase === 'run' && !F.night);
    setRot(live && !F.summary);
    const disp = live && !F.summary ? '' : 'none';
    for (const el of [top, bar]) if (el.style.display !== disp) el.style.display = disp;
    if (!live) {
      SHARED.hot17 = 0;
      return;
    }
    const fuel = Math.max(0, Math.min(100, F.fuel)),
      v = Math.round(fuel);
    if (v !== fire.__v) {
      const up = fire.__v != null && v > fire.__v + 1;
      fire.__v = v;
      fireArc.setAttribute('stroke-dasharray', `${fuel.toFixed(1)} ${(100 - fuel).toFixed(1)}`);
      fireNum.textContent = String(v);
      fire.setAttribute('aria-label', `אש המערכה ${v} מתוך 100`);
      if (up) fire.classList.contains('up');
    }
    const cls = F.gate ? '' : fuelClass(fuel);
    if (cls !== fireCls) {
      const loud = (cls === 'warn' && fireCls === '') || cls === 'crit';
      fire.classList.toggle('warn', cls === 'warn');
      fire.classList.toggle('crit', cls === 'crit');
      stat.fireCls = cls;
      doc.body.classList.toggle('f17-crit', cls === 'crit');
      if (loud && cls === 'warn') {
        stat.warns++;
        sfx('warn17');
        buzz([30, 60, 30]);
      }
      if (cls === 'crit') {
        stat.crits++;
        sfx('alarm17');
        buzz([70, 80, 70, 80, 70]);
        showBanner();
      }
      fireCls = cls;
    }
    if (cls === 'crit' && now() - bannerAt >= F17.bannerEvery) {
      sfx('alarm17', { soft: 1 });
      buzz([50, 80, 50]);
      showBanner();
    }
    if (now() < bannerUntil) aimBanner();
    const step = F.step;
    if (step) {
      const key = `${step.id}|${step.text}`;
      if (key !== stat.lastStep) {
        stat.lastStep = key;
        stat.cards++;
        cardIcon.textContent = step.icon;
        cardText.textContent = step.text;
        card.classList.remove('in');
        card.offsetWidth;
        card.classList.add('in');
      }
      const prog = step.goal > 0 ? `${step.n}/${step.goal}` : step.id === 'kevesh' && step.n > 0 ? `🪵${step.n}` : '';
      if (cardProg.textContent !== prog) cardProg.textContent = prog;
      card.style.visibility = '';
      card.classList.toggle('fc', !!step.fire);
      // ── fable32 (build 30) ── (a word of feedback; the act's rating) ── /fable32 ──
      {   // (in an act and at its end the tamid's line steps aside — the morning holds its clock, and the act's one line keeps one line)
        let a30 = false;
        try {
          a30 = !!((E.act30 && E.act30()) || (E.word30 && E.word30()));
        } catch (e) {}
        if (top.__a30 !== a30) {
          top.__a30 = a30;
          top.classList.toggle('f17-a30', a30);
        }
      }
      const sy = step.say ? (/^r30-/.test(step.say) ? step.say : 'sy-' + step.say) : '';
      if (card.__sy !== sy) {
        if (card.__sy) card.classList.remove(card.__sy);
        if (sy) card.classList.add(sy);
        card.__sy = sy;
      }
    } else card.style.visibility = 'hidden';
    const tl = tamidLine(F.tamid, fuel);
    if (tam.__h !== tl.text) {
      tam.__h = tl.text;
      tam.innerHTML = tl.text;
    }
    const tcls = 'f17-tam ' + tl.cls;
    if (tam.className !== tcls) tam.className = tcls;
    fire.classList.toggle('n60', !!tl.n60);
    {
      const tm = F.tamid,
        sec = tm && !tm.done && !tm.late ? Math.ceil(tm.inS) : -1;
      if (sec >= 1 && sec <= F17.tickLast && sec !== lastTick) {
        lastTick = sec;
        stat.ticks++;
        sfx('tab', { i: Math.max(0, 5 - sec) });
      }
      if (sec > F17.tickLast || sec < 0) lastTick = -1;
    }
    setBar(F.bar || []);
    setHot(F);
    if (held30.length && !quiet30() && now() - (held30.t || 0) > 1.3 && !(held30[0].chip30 && r30 && r30.busy())) {   // ── fable32 (build 30) ── (the words that waited: one at a time) ── /fable32 ──
      held30.t = now();
      const fn = held30.shift();
      try {
        fn();
      } catch (e) {}
    }
  }
  let rotEl = null,
    pausedByRot = false,
    rotDismissed = false,
    forced = false;
  try {
    rotDismissed = sessionStorage.getItem('f17rot') === '1';
  } catch (e) {}
  const forceLand = () => {
    try {
      const tw = globalThis.__TWIN;
      if (tw && tw.force && (innerHeight || 0) > (innerWidth || 0)) {
        tw.force(true);
        forced = true;
      }
    } catch (e) {}
  };
  function setRot(want) {
    const portrait = (innerHeight || 0) > (innerWidth || 0) * 1.05,
      show = !!want && !rotDismissed && portrait;
    if (want && rotDismissed && portrait && !forced) forceLand();
    if (show && !rotEl) {
      stat.rot++;
      rotEl = mk('f17-rot', '<i aria-hidden="true">📱</i><div>סובבו את הטלפון לרוחב 🔄</div><button type="button">המשך בכל זאת</button>');
      rotEl.setAttribute('role', 'dialog');
      rotEl.addEventListener('pointerdown', (ev) => ev.stopPropagation());
      rotEl.querySelector('button').addEventListener('click', (ev) => {
        ev.stopPropagation();
        rotDismissed = true;
        try {
          sessionStorage.setItem('f17rot', '1');
        } catch (e) {}
        setRot(false);
        forceLand();
      });
      try {
        if (!E.state().paused) {
          E.pause(true);
          pausedByRot = true;
        }
      } catch (e) {}
    } else if (!show && rotEl) {
      rotEl.remove();
      rotEl = null;
      if (pausedByRot) {
        pausedByRot = false;
        try {
          E.pause(false);
        } catch (e) {}
      }
    }
  }
  function showBanner() {
    stat.banners++;
    bannerAt = now();
    bannerUntil = bannerAt + F17.bannerS;
    banner.classList.remove('on');
    banner.offsetWidth;
    banner.classList.add('on');
    aimBanner();
  }
  function aimBanner() {
    const from = center(banner),
      to =
        view && view.project
          ? (() => {
              try {
                return view.project(-29.5, 27, -3.5);
              } catch (e) {
                return null;
              }
            })()
          : null;
    if (!from || !to) return;
    let dx = to.x - from.x,
      dy = to.y - from.y;
    if (to.on === false) {
      dx = -dx;
      dy = -dy;
    }
    const deg = (Math.atan2(dy, dx) * 180) / Math.PI,
      tr = `rotate(${Math.round(deg)}deg)`;
    if (bannerArrow.style.transform !== tr) bannerArrow.style.transform = tr;
  }
  function setHot(F) {
    const hot = F.hot;
    if (!hot || F.acting) {
      SHARED.hot17 = 0;
      try {
        doc.body.style.setProperty('--hot17', '0');
      } catch (e) {}
      return;
    }
    const k = Math.max(0, Math.min(1, 1 - (hot.d - hot.r) / 18));
    SHARED.hot17 = k;
    const s = k.toFixed(2);
    if (doc.body.__hot !== s) {
      doc.body.__hot = s;
      try {
        doc.body.style.setProperty('--hot17', s);
      } catch (e) {}
    }
    F17.chime.forEach((d, i) => {
      if (hot.d <= d && hot.d > hot.r && chimeArm[i]) {
        chimeArm[i] = false;
        stat.chimes++;
        sfx('near17', { n: i + 1 });
        buzz(10);
      } else if (hot.d > d + 3) chimeArm[i] = true;
    });
    if (hot.id !== stat.hotId) {
      stat.hotId = hot.id;
      chimeArm = F17.chime.map((d) => hot.d > d);
    }
  }
  const offTick = onTick(() => {
      try {
        tick();
      } catch (err) {
        console.warn('[focus17]', err && err.message);
      }
    }),
    api = {
      destroy() {
        dead = true;
        offTick();
        if (fx) fx.destroy();
        if (r19) r19();
        if (k20) k20.destroy();
        if (d21) d21.destroy();
        if (m22) m22.destroy();
        if (p23) p23.destroy();
        if (p25) p25.destroy();
        if (h26) h26.destroy();
        if (d27) d27.destroy();   // ── fable32 (build 27) ── ── /fable32 ──
        if (r30) r30.destroy();   // ── fable32 (build 30) ── ── /fable32 ──
        if (u32) u32.destroy();   // ── fable32 (build 32) ── ── /fable32 ──
        if (t33) t33.destroy();   // ── fable32 (build 33) ── ── /fable32 ──
        try {
          if (offEv) offEv();
        } catch (e) {}
        closeSummary();
        for (const el of [top, bar, banner, stampEl])
          try {
            el.remove();
          } catch (e) {}
        rotDismissed = true;
        setRot(false);
        if (forced)
          try {
            globalThis.__TWIN.force(null);
          } catch (e) {}
        doc.body.classList.remove('f17-on', 'f17-crit');
        try {
          delete globalThis.__SH17UP;
        } catch (e) {}
        SHARED.b17 = false;
        SHARED.hot17 = 0;
        clearTimeout(stampT);
        clearTimeout(popT);
        if (raf) cancelAnimationFrame(raf);
        try {
          if (globalThis.__F17 === api) delete globalThis.__F17;
        } catch (e) {}
      },
      state: () => ({
        ...stat,
        ev: stat.ev.slice(-20),
        card: { icon: cardIcon.textContent, text: cardText.textContent, prog: cardProg.textContent, vis: card.style.visibility !== 'hidden' },
        fire: { v: fire.__v, cls: stat.fireCls },
        tam: { text: tam.textContent, cls: tam.className },
        n60: fire.classList.contains('n60'),
        rotOn: !!rotEl,
        pow: '',
        bar: Object.keys(slotEl).map((id) => [
          id,
          slotEl[id].__b.textContent,
          slotEl[id].classList.contains('need') ? 1 : 0,
          slotEl[id].classList.contains('done') ? 1 : 0,
        ]),
        sum: !!summary,
        hot: SHARED.hot17 || 0,
      }),
      stamp,
      banner: showBanner,
      sparks,
      fly,
    };
  try {
    globalThis.__F17 = api;
  } catch (e) {}
  return api;
}
