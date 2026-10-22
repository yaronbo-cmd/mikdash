// ── shift29 ── hud.js — the shift's HUD, its end card and its entry card (docs/WAVE29-BRIEF.md SHIFT29A (2)–(3), (6)).
// Top only: the sun arc (the round's 90 s), "ניקוד 180", the rival bar (yours gold, his grey — the longer one wins), the combo chip.
// Nothing else on the screen: no "עכשיו", no task list. RTL, every target ≥ 44 px, no red (the BLOOD palette is the stations').
//   const H = createShiftHud(root) → { set(state), stamp(text, o), intro(text), opening(steps, {tap, src}), pin(id, o), ring(id, o),
//                                      end(result, {again, next}), destroy() }
//   entryCard(root, { lvl, best, stars, shift(lvl), tour() }) → { close() }
import { evlog, copyEvlog } from './evlog16.js';
import { prefsHTML, bindPrefs } from './prefs28.js';   // ── fable32 (build 28) ── the two switches on the pause card ── /fable32 ──   // ── recovered (build 16) ── the event log (the names of the module and its exports are the recovery's)
const CSS = `
.sh-root{position:fixed;inset:0;z-index:30;pointer-events:none;direction:rtl;font-family:"Heebo",system-ui,sans-serif;color:#FFF6DA;-webkit-user-select:none;user-select:none}
.sh-top{position:absolute;top:calc(env(safe-area-inset-top,0px) + 6px);left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:10px;padding:4px 12px;border-radius:16px;background:rgba(28,20,10,.72);box-shadow:0 2px 10px rgba(0,0,0,.35);white-space:nowrap}
.sh-score{display:flex;align-items:baseline;gap:6px;min-width:96px}.sh-score small{font:700 12px/1 "Heebo",system-ui,sans-serif;opacity:.8}.sh-score b{font:900 24px/1 "Heebo",system-ui,sans-serif;color:#FFD66E;font-variant-numeric:tabular-nums}
.sh-combo{font:900 15px/1 "Heebo",system-ui,sans-serif;padding:4px 8px;border-radius:10px;background:#FFD66E;color:#2A1804;transform:scale(0);transition:transform .18s}
.sh-combo.on{transform:scale(1)}.sh-combo.pop{animation:sh-pop .35s}
.sh-sun{position:relative;width:78px;height:40px}.sh-sun svg{position:absolute;inset:0;overflow:visible}
.sh-sun em{position:absolute;left:0;right:0;bottom:-1px;text-align:center;font:800 12px/1 "Heebo",system-ui,sans-serif;font-style:normal;font-variant-numeric:tabular-nums}
.sh-sun.late em{color:#FFD66E;animation:sh-blink .5s infinite alternate}
.sh-riv{display:flex;flex-direction:column;gap:3px;min-width:170px}
.sh-rr{display:flex;align-items:center;gap:6px;font:700 11px/1 "Heebo",system-ui,sans-serif}.sh-rr span{width:92px;overflow:hidden;text-overflow:ellipsis}
.sh-rr b{font:800 12px/1 "Heebo",system-ui,sans-serif;font-variant-numeric:tabular-nums;width:30px;text-align:left}
.sh-bar{flex:1;height:6px;min-width:44px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden;display:flex}
.sh-bar i{display:block;height:100%;border-radius:3px;transition:width .3s}
.sh-rr.me i{background:#FFD66E}.sh-rr.them i{background:#A9A196}.sh-rr.lead span{color:#FFD66E}
.sh-stamp{position:absolute;left:50%;top:26%;transform:translate(-50%,-50%);font:900 26px/1.1 "Heebo",system-ui,sans-serif;text-align:center;padding:8px 16px;border-radius:14px;background:rgba(28,20,10,.78);box-shadow:0 4px 14px rgba(0,0,0,.4);opacity:0;pointer-events:none;white-space:nowrap}
.sh-stamp.on{animation:sh-stamp 1.15s ease-out forwards}.sh-stamp.no{color:#FFC690;font-size:22px}.sh-stamp.lost{color:#C9C3BA}.sh-stamp.combo{color:#FFD66E}
.sh-stamp.at{top:auto;font-size:20px}
.sh-fl{position:absolute;transform:translate(-50%,-50%);font:900 30px/1 "Heebo",system-ui,sans-serif;color:#FFD66E;text-shadow:0 2px 0 #6A4614,0 0 12px rgba(0,0,0,.6);pointer-events:none;animation:sh-fl 1.25s ease-out forwards}
@keyframes sh-fl{0%{opacity:0;margin-top:10px;font-size:18px}15%{opacity:1;font-size:34px}100%{opacity:0;margin-top:-60px}}
.sh-hint{position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);transform:translateX(-50%);max-width:min(60vw,420px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:5px 12px;border-radius:12px;background:rgba(255,248,232,.9);color:#2A1804;font:800 13px/1.2 "Heebo",system-ui,sans-serif;pointer-events:none;text-align:center;opacity:0;transition:opacity .2s;box-shadow:0 2px 10px rgba(0,0,0,.35)}
.sh-hint.on{opacity:1;animation:sh-bob 1.1s ease-in-out infinite alternate}
@keyframes sh-bob{from{margin-bottom:0}to{margin-bottom:5px}}
.sh-intro{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);text-align:center;padding:14px 26px;border-radius:18px;background:rgba(28,20,10,.85);opacity:0;transition:opacity .25s}
.sh-intro.on{opacity:1}.sh-intro b{display:block;font:900 30px/1.15 "Heebo",system-ui,sans-serif;color:#FFD66E}.sh-intro span{font:700 16px/1.3 "Heebo",system-ui,sans-serif}
.sh-op-b{position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 62px);transform:translateX(-50%);font:900 20px/1 "Heebo",system-ui,sans-serif;color:#FFD66E;padding:8px 16px;border-radius:14px;background:rgba(28,20,10,.8);white-space:nowrap}
.sh-op-b small{display:block;font:600 11px/1.3 "Heebo",system-ui,sans-serif;color:#FFF6DA;opacity:.8;margin-top:3px;text-align:center}
.sh-ring{position:absolute;left:0;top:0;width:72px;height:72px;margin:-36px 0 0 -36px;border-radius:50%;border:4px solid #FFD66E;background:rgba(42,30,16,.55);box-shadow:0 0 0 3px rgba(42,30,16,.6),0 0 18px rgba(255,214,110,.6);pointer-events:auto;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-direction:column;color:#FFF6DA;font:800 13px/1.1 "Heebo",system-ui,sans-serif;text-align:center;padding:0;transform:translate(-999px,-999px);animation:sh-pulse 1.1s ease-in-out infinite alternate}
.sh-ring span{position:absolute;top:100%;margin-top:4px;white-space:nowrap;padding:3px 8px;border-radius:9px;background:rgba(28,20,10,.82)}
.sh-ring i{font-style:normal;font-size:26px}
.sh-ring.ok{background:#FFD66E;color:#2A1804;animation:none;border-color:#FFF6DA}.sh-ring.ok i::after{content:"✓"}
.sh-ring.bad{animation:sh-shake .4s;border-color:#FFC690}
.sh-pin{position:absolute;left:0;top:0;min-width:56px;height:44px;margin:-22px 0 0 -28px;padding:0 10px;border-radius:22px;border:2px solid #FFD66E;background:rgba(42,30,16,.85);color:#FFF6DA;font:800 13px/1 "Heebo",system-ui,sans-serif;display:flex;align-items:center;gap:5px;pointer-events:auto;cursor:pointer;transform:translate(-999px,-999px);white-space:nowrap}
.sh-pin.sh-dock{position:static;transform:none!important;margin:0;height:40px;min-width:44px;pointer-events:auto;border-width:2px}
.sh-pin.lit{background:#C8923A;box-shadow:0 0 14px rgba(255,214,110,.8)}.sh-pin i{font-style:normal;font-size:20px}
.sh-coal{border-color:#FFB066;width:80px;height:80px;margin:-40px 0 0 -40px}
.sh-pbtn{position:absolute;top:calc(env(safe-area-inset-top,0px) + 8px);left:calc(env(safe-area-inset-left,0px) + 12px);width:46px;height:46px;border-radius:50%;border:2px solid rgba(255,236,190,.7);background:rgba(28,20,10,.78);color:#FFF6DA;font:900 20px/1 "Heebo",system-ui,sans-serif;display:flex;align-items:center;justify-content:center;pointer-events:auto;touch-action:manipulation;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.35)}
.sh-pbtn:active{transform:scale(.92);filter:brightness(1.3)}
.sh-pause .sh-card h2{margin:4px 0 10px;font:900 24px/1.2 "Heebo",system-ui,sans-serif}
.sh-pause .sh-btn.resume{background:radial-gradient(circle at 40% 30%,#FFE6A0,#E2B65A 70%,#9A6F1E);color:#2A1804;box-shadow:0 4px 0 #6A4614}
.sh-pause .sh-btn.restart{background:#4A3418;color:#FFF6DA;border:2px solid rgba(255,236,190,.55)}
.sh-day33 .sh-riv,.sh-day33 .sh-combo{display:none}
.sh-dayc{font:800 13px/1.2 "Heebo",system-ui,sans-serif;color:#FFF4DC;white-space:nowrap}
.sh-day33 .sh-score b{color:#FFB066}
/* ── fable32 (build 17a) ── the fire gauge: a flame in a ring the fuel fills; amber under 40, a red pulse under 25 (the owner: "I can't tell if it fades") */
.sh-fg{position:relative;width:44px;height:44px;flex:none;margin-inline-start:2px}.sh-fg svg{position:absolute;inset:0;transform:rotate(-90deg)}
.sh-fg circle{fill:none;stroke-width:5}.sh-fg .bg{stroke:rgba(255,236,190,.2)}.sh-fg .fl{stroke:#FFB066;stroke-linecap:round;transition:stroke-dasharray .35s,stroke .3s}
.sh-fg i{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:22px/1 "Segoe UI Emoji","Noto Color Emoji",sans-serif;font-style:normal;transition:transform .2s}
.sh-fg.low .fl{stroke:#FF9F1C}.sh-fg.low i{transform:scale(.88)}
.sh-fg.crit .fl{stroke:#E5402A}.sh-fg.crit{animation:sh-fgp .7s ease-in-out infinite alternate}.sh-fg.crit i{transform:scale(.75)}
.sh-day33 .sh-score.crit b{color:#FF6A4A}
.sh-fg.up{animation:sh-pop .35s}
@keyframes sh-fgp{from{filter:drop-shadow(0 0 0 rgba(229,64,42,0))}to{filter:drop-shadow(0 0 7px rgba(229,64,42,.95))}}
.sh-day33.sh-night .sh-top{background:rgba(10,8,20,.8)}
/* ── fable32 (build 17b) ── the top bar is focus17's three meters and its one step card: the score, the day, the level, the logs and the clock leave the bar (a change pops; the summary has them) */
.sh-b17 .sh-top,.sh-b17 .sh-tasks{display:none!important}.sh-b17 .sh-stamp{top:36%;font-size:22px}
/* ── fable32 (build 17a) ── the day's bar lets the world through: the altar's fire straight ahead of the follow camera sits behind its middle (b17-court-fire.png) */
.sh-day33:not(.sh-night) .sh-top{background:rgba(28,20,10,.38);box-shadow:none}.sh-day33 .sh-top{text-shadow:0 1px 2px rgba(0,0,0,.85),0 0 6px rgba(0,0,0,.6)}
.sh-choice .sh-card h2{margin:4px 0 6px;font:900 22px/1.2 "Heebo",system-ui,sans-serif}
.sh-choice .sh-card p{margin:0 0 10px;font:600 14px/1.35 "Heebo",system-ui,sans-serif;color:#FFF0CC}
.sh-ch{display:flex;flex-direction:column;gap:8px}
.sh-ch button{min-height:56px;border-radius:14px;border:2px solid rgba(255,236,190,.55);background:#4A3418;color:#FFF6DA;font:800 16px/1.15 "Heebo",system-ui,sans-serif;cursor:pointer;pointer-events:auto;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 12px;text-align:right}
.sh-ch button small{font:700 12px/1.2 "Heebo",system-ui,sans-serif;color:#FFD66E;white-space:nowrap}
.sh-ch button[disabled]{opacity:.45}
.sh-ch button.pick{background:radial-gradient(circle at 40% 30%,#FFE6A0,#E2B65A 70%,#9A6F1E);color:#2A1804}
.sh-tasks{position:absolute;top:calc(env(safe-area-inset-top,0px) + 62px);left:calc(env(safe-area-inset-left,0px) + 10px);display:flex;flex-direction:column;gap:4px;pointer-events:none}
.sh-tasks i{font:800 12px/1.2 "Heebo",system-ui,sans-serif;font-style:normal;color:#FFF4DC;background:rgba(28,20,10,.72);border-radius:9px;padding:3px 8px;white-space:nowrap;border:1px solid rgba(255,236,190,.35)}
.sh-tasks i.done{color:#2A1804;background:#FFD66E;border-color:#FFF1C8}
.sh-end{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(14,10,5,.55);pointer-events:auto}
.sh-card{width:min(440px,calc(100vw - 32px));max-height:calc(100vh - 16px);overflow:auto;box-sizing:border-box;padding:12px 18px 10px;border-radius:20px;background:linear-gradient(#3A2A16,#21170B);border:2px solid #C8923A;box-shadow:0 10px 40px rgba(0,0,0,.6);text-align:center}
.sh-stars{font-size:46px;line-height:1;letter-spacing:6px;color:rgba(255,236,190,.3)}.sh-stars i{font-style:normal;display:inline-block;transform:scale(0)}
.sh-stars i.on{color:#FFD66E;text-shadow:0 0 14px rgba(255,214,110,.8)}.sh-stars i.in{animation:sh-star .45s cubic-bezier(.3,1.6,.5,1) forwards}
.sh-res{font:900 21px/1.25 "Heebo",system-ui,sans-serif;margin:6px 0 2px}.sh-res .w{color:#FFD66E}
.sh-sub{font:700 14px/1.3 "Heebo",system-ui,sans-serif;opacity:.9}.sh-sub .nb{color:#FFD66E}
.sh-btns{display:flex;gap:10px;margin:10px 0 6px;justify-content:center}
.sh-btn{min-height:56px;min-width:44px;flex:1;border-radius:16px;border:0;font:900 20px/1 "Heebo",system-ui,sans-serif;cursor:pointer;pointer-events:auto}
.sh-btn.again{background:radial-gradient(circle at 40% 30%,#FFE6A0,#E2B65A 70%,#9A6F1E);color:#2A1804;box-shadow:0 4px 0 #6A4614}
.sh-btn.next{background:#6A4614;color:#FFF6DA;border:2px solid #FFD66E}
.sh-btn:active{transform:translateY(2px)}
.sh-why{font:700 12px/1.4 "Heebo",system-ui,sans-serif;opacity:.85;text-align:right}.sh-why summary{cursor:pointer;min-height:32px;line-height:32px;list-style:none;text-align:center}
.sh-why summary::-webkit-details-marker{display:none}.sh-why p{margin:2px 0}
.sh-mentor{margin:4px 0 0;padding:0 14px 0 0;font:700 11px/1.35 "Heebo",system-ui,sans-serif}.sh-mentor li{margin:1px 0}
.sh-draft{font:600 10px/1 "Heebo",system-ui,sans-serif;opacity:.55;margin-top:4px}
.sh-entry{position:fixed;inset:0;z-index:31;display:flex;align-items:center;justify-content:center;background:rgba(14,10,5,.45);direction:rtl;font-family:"Heebo",system-ui,sans-serif;color:#FFF6DA}
.sh-entry .sh-card{display:flex;flex-direction:column;align-items:center;gap:8px}
.sh-entry h2{margin:0;font:900 20px/1.2 "Heebo",system-ui,sans-serif}.sh-entry p{margin:0;font:700 13px/1.35 "Heebo",system-ui,sans-serif;opacity:.9}
.sh-go{width:100%;min-height:72px;border-radius:20px;border:0;font:900 34px/1 "Heebo",system-ui,sans-serif;cursor:pointer;background:radial-gradient(circle at 40% 30%,#FFE6A0,#E2B65A 70%,#9A6F1E);color:#2A1804;box-shadow:0 5px 0 #6A4614,0 0 24px rgba(255,214,110,.5)}
.sh-go small{display:block;font:800 13px/1.2 "Heebo",system-ui,sans-serif;margin-top:3px}
.sh-go.sh-day{background:radial-gradient(circle at 40% 30%,#FFC48A,#C86A2A 70%,#7A3A10);margin-top:8px}
.sh-tour.sm{min-height:44px;font-size:12px;border:0;opacity:.75;text-decoration:underline;padding:0 10px}
.f31-full{min-height:44px;min-width:120px;border-radius:14px;border:2px solid rgba(255,236,190,.55);background:transparent;color:#FFF6DA;font:800 14px/1 "Heebo",system-ui,sans-serif;cursor:pointer;pointer-events:auto;padding:0 12px}
.sh-sub30{margin:-4px 0 8px;font:800 14px/1.3 "Heebo",system-ui,sans-serif;color:#FFE6A0}
.sh-p28{justify-content:center;margin:2px 0 6px}   /* ── fable32 (build 28) ── (the pause card's switches) ── /fable32 ── */
.sh-tour{min-height:44px;min-width:120px;border-radius:14px;border:2px solid rgba(255,236,190,.55);background:transparent;color:#FFF6DA;font:800 15px/1 "Heebo",system-ui,sans-serif;cursor:pointer}
body.sh-on .dy-hud,body.sh-on .dy-coin,body.sh-on .dy-say,body.sh-on .dy-line,body.sh-on .dy-banner,body.sh-on .tw-goal,body.sh-on .g27-skip,body.sh-on .l28-tap,body.sh-on .s27-stamp,body.sh-on .tw-hand{display:none!important}
@keyframes sh-pop{50%{transform:scale(1.35)}}
@keyframes sh-blink{to{opacity:.45}}
@keyframes sh-stamp{0%{opacity:0;transform:translate(-50%,-30%) scale(.7)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}25%{transform:translate(-50%,-50%) scale(1)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-80%)}}
@keyframes sh-pulse{from{box-shadow:0 0 0 3px rgba(42,30,16,.6),0 0 8px rgba(255,214,110,.4)}to{box-shadow:0 0 0 3px rgba(42,30,16,.6),0 0 26px rgba(255,214,110,1)}}
@keyframes sh-shake{20%,60%{transform:var(--sh-t) translateX(-7px)}40%,80%{transform:var(--sh-t) translateX(7px)}}
@keyframes sh-star{from{transform:scale(0) rotate(-40deg)}to{transform:scale(1) rotate(0)}}
`;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function css(doc) { if (doc.getElementById('sh29-css')) return; const s = doc.createElement('style'); s.id = 'sh29-css'; s.textContent = CSS; doc.head.appendChild(s); }
const el = (doc, cls, html, tag = 'div') => { const e = doc.createElement(tag); e.className = cls; if (html != null) e.innerHTML = html; return e; };
const W = () => (typeof innerWidth === 'number' ? innerWidth : 844), Hh = () => (typeof innerHeight === 'number' ? innerHeight : 390);
const clampPos = (q, m = 44) => (q ? { x: Math.max(m, Math.min(W() - m, q.x)), y: Math.max(m + 56, Math.min(Hh() - m - 20, q.y)) } : null);
export const WHY_SRC = [
  // ── route31 ── the true routes (route31.js; the stations' own lines come from r.mentor) ── /route31 ──
  'קודם הכיור: הכהן מקדש ידיו ורגליו פעם אחת — ורק אחר כך עובד (שמות ל, יט–כא; זבחים יט:).',
  'עולה: סמיכה, שחיטה בצפון, זריקה — שתי מתנות שהן ארבע, למטה — ניתוח, והאברים עולים בכבש למערכה (זבחים ה, ד; תמיד ד, ב–ג).',
  'קן (תורים או בני יונה): בלי סכין — מליקה, ומיצוי הדם על קיר המזבח; עולת העוף למעלה (זבחים ו, ה; קנים א, א).',
  'מנחה: הגשה בקרן דרומית־מערבית, קמיצה — קומץ מלא — והקטרה על המזבח (מנחות א, ב; ה, ה).',
  'הפתיחה: תרומת הדשן, המערכה, הכיור, ואז הפיס — בסדר הזה (תמיד א–ב; יומא כב.).',
];
// the sun arc: from the east (right, as the text runs) over the top to the west; its colour warms in the last 15 s
function sunSVG() { return '<svg viewBox="0 0 78 40" aria-hidden="true"><path d="M5 38 A34 34 0 0 1 73 38" fill="none" stroke="rgba(255,236,190,.28)" stroke-width="3" stroke-linecap="round"/><path class="sh-arc" d="M73 38 A34 34 0 0 0 5 38" fill="none" stroke="#FFD66E" stroke-width="3" stroke-linecap="round" pathLength="100" stroke-dasharray="0 100"/><circle class="sh-dot" cx="73" cy="38" r="6" fill="#FFD66E" stroke="#FFF6DA" stroke-width="1.5"/></svg><em>1:30</em>'; }

// ── flow31 ── (WAVE31 FLOW31 (8)) the full-screen button on the entry card and the end card ── /flow31 ──
/** "⛶ מסך מלא": the whole document full-screen; where it is refused (a frame without allowfullscreen) the button says "פתחו בדפדפן" */
export function fullBtn(doc) {
  doc = doc || (typeof document !== 'undefined' ? document : null); if (!doc) return null;
  css(doc);
  const b = doc.createElement('button'); b.type = 'button'; b.className = 'f31-full'; b.dataset.sh = 'full';
  const inFrame = (() => { try { return globalThis.self !== globalThis.top; } catch (e) { return true; } })();
  const can = () => !!(doc.fullscreenEnabled || doc.webkitFullscreenEnabled);
  const say = () => { b.textContent = doc.fullscreenElement ? '⛶ יציאה ממסך מלא' : !can() && inFrame ? '⛶ פתחו בדפדפן — למסך מלא' : '⛶ מסך מלא'; };
  say();
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    if (doc.fullscreenElement) { try { doc.exitFullscreen().then(say, say); } catch (err) { say(); } return; }
    const el = doc.documentElement, rq = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!rq || !can()) { b.textContent = 'פתחו בדפדפן — למסך מלא'; b.dataset.refused = '1'; return; }
    try { const p = rq.call(el, { navigationUI: 'hide' }); if (p && p.then) p.then(() => { say(); try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {}); } catch (err) { /* */ } }, () => { b.textContent = 'פתחו בדפדפן — למסך מלא'; b.dataset.refused = '1'; }); } catch (err) { b.textContent = 'פתחו בדפדפן — למסך מלא'; b.dataset.refused = '1'; }
  });
  try { doc.addEventListener('fullscreenchange', say); } catch (e) { /* */ }
  return b;
}

// ── /flow31 ──

export function createShiftHud(root) {
  const doc = typeof document !== 'undefined' ? document : null;
  if (!doc) return { set() {}, stamp() {}, intro() {}, onPause() {}, pauseCard() {}, choice() { return { close() {} }; }, tasks() {}, opening() { return { mark() {}, close() {}, place() {} }; }, pin() { return { at() {}, text() {}, close() {} }; }, ring() { return { at() {}, close() {} }; }, end() {}, destroy() {}, el: null };
  css(doc);
  const R = el(doc, 'sh-root'); R.setAttribute('data-sh', 'root');
  (root || doc.body).appendChild(R);
  const top = el(doc, 'sh-top', `<div class="sh-score" aria-label="ניקוד"><small>ניקוד</small><b>0</b></div><div class="sh-combo" aria-label="קומבו">×1</div><div class="sh-sun" aria-label="הזמן">${sunSVG()}</div>
    <div class="sh-riv"><div class="sh-rr me"><span>אתם</span><div class="sh-bar"><i></i></div><b>0</b></div><div class="sh-rr them"><span>משמר</span><div class="sh-bar"><i></i></div><b>0</b></div></div>`);
  R.appendChild(top);
  const stampEl = el(doc, 'sh-stamp'); R.appendChild(stampEl);
  // ── fable32 (build 3) ── the pause button (top-left, 46 px): the clock stops; the card — "המשך" / "מהתחלה" / "לסיור"
  const pbtn = doc.createElement('button'); pbtn.type = 'button'; pbtn.className = 'sh-pbtn'; pbtn.setAttribute('aria-label', 'הפסקה'); pbtn.textContent = '❚❚'; R.appendChild(pbtn);
  let pauseEl = null, onPause = null;
  pbtn.addEventListener('click', (e) => { e.stopPropagation(); if (onPause && !pauseEl && !endEl) onPause(); });
  // ── /fable32 ──
  const introEl = el(doc, 'sh-intro'); R.appendChild(introEl);
  const E = { score: top.querySelector('.sh-score b'), combo: top.querySelector('.sh-combo'), sun: top.querySelector('.sh-sun'), arc: top.querySelector('.sh-arc'), dot: top.querySelector('.sh-dot'), sec: top.querySelector('.sh-sun em'),
    me: top.querySelector('.sh-rr.me'), them: top.querySelector('.sh-rr.them') };
  E.meI = E.me.querySelector('i'); E.meB = E.me.querySelector('b'); E.thI = E.them.querySelector('i'); E.thB = E.them.querySelector('b'); E.thN = E.them.querySelector('span');
  const last = { score: -1, combo: -1, sec: -1, rival: -1, name: '' };
  let stampT = 0, endEl = null, hintEl = null;
  const H = {
    el: R,
    set(s) {
      if (!s) return;
      // ── fable32 (build 6) ── the day's HUD: the fire (0…100) in place of the score, the day and the basket, no rival/combo; the clock = the day's or the night's
      if (s.day33 && s.day33.b17 && !R.classList.contains('sh-b17')) R.classList.add('sh-b17');   // ── recovered (build 17b) ── (focus17's bar)
      if (s.day33) { const D = s.day33; if (!R.classList.contains('sh-day33')) { R.classList.add('sh-day33'); E.score.parentNode.querySelector('small').textContent = 'אש המערכה'; E.thN.textContent = '';
          // ── recovered (build 17a) ── the fire gauge, first in the score's box
          E.fg = el(doc, 'sh-fg', '<svg viewBox="0 0 44 44" aria-hidden="true"><circle class="bg" cx="22" cy="22" r="18.5"/><circle class="fl" cx="22" cy="22" r="18.5" pathLength="100" stroke-dasharray="0 100"/></svg><i>🔥</i>'); E.fg.setAttribute('role', 'img'); E.score.parentNode.insertBefore(E.fg, E.score.parentNode.firstChild); E.fgC = E.fg.querySelector('.fl'); }
        // ── recovered (build 17a) ── the fuel (0…100) fills the ring; amber under 40, red under 25; a rise of more than 2 pops it
        if (E.fg) { const f = Math.max(0, Math.min(100, +D.fuel || 0)), r = Math.round(f); if (r !== E.fgV) { const up = E.fgV != null && r > E.fgV + 2; E.fgV = r; E.fgC.setAttribute('stroke-dasharray', `${f.toFixed(1)} 100`); E.fg.classList.toggle('low', f < 40 && f >= 25); E.fg.classList.toggle('crit', f < 25); E.score.parentNode.classList.toggle('crit', f < 25); E.fg.setAttribute('aria-label', `אש המערכה ${r} מתוך 100`); if (up) { E.fg.classList.remove('up'); E.fg.offsetWidth; E.fg.classList.add('up'); } } }
        let de = R.querySelector('.sh-dayc'); if (!de) { de = el(doc, 'sh-dayc'); top.appendChild(de); } const dt2 = `${D.night ? '🌙 לילה' : '☀️ יום'} ${D.day} · 🪵 ${D.logs}/${D.basket} · רמה ${D.level}${D.power != null ? ` · 💪 ${Math.round(D.power)}` : ''}${D.bread ? ` · 🍞 ${D.bread}` : ''}${D.lambs ? ` · 🐑 ${D.lambs}` : ''}`; if (de.textContent !== dt2) de.textContent = dt2; R.classList.toggle('sh-night', !!D.night); }
      if (s.score !== last.score) { last.score = s.score; E.score.textContent = String(s.score); E.meB.textContent = String(s.score); }
      if (s.combo !== last.combo) { const up = s.combo > last.combo && last.combo > 0; last.combo = s.combo; E.combo.textContent = `×${s.combo}`; E.combo.classList.toggle('on', s.combo > 1); if (up) { E.combo.classList.remove('pop'); void E.combo.offsetWidth; E.combo.classList.add('pop'); } }
      if (s.rivalName && s.rivalName !== last.name) { last.name = s.rivalName; E.thN.textContent = `משמר ${s.rivalName}`; }
      if (s.rival !== last.rival) { last.rival = s.rival; E.thB.textContent = String(s.rival); }
      const mx = Math.max(60, s.score, s.rival) * 1.05;
      E.meI.style.width = `${(s.score / mx * 100).toFixed(1)}%`; E.thI.style.width = `${(s.rival / mx * 100).toFixed(1)}%`;
      E.me.classList.toggle('lead', s.score > s.rival); E.them.classList.toggle('lead', s.rival > s.score);
      const span = s.day33 ? (s.day33.night ? 60 : 180) : 90; const left = Math.max(0, s.left == null ? span : s.left), u = Math.min(1, Math.max(0, 1 - left / span)), sec = Math.ceil(left);   // ── fable32 (build 6) ── (the day's clock) ── /fable32 ──
      if (sec !== last.sec) {
        last.sec = sec; E.sec.textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
        E.arc.setAttribute('stroke-dasharray', `${(u * 100).toFixed(1)} 100`);
        const a = Math.PI * (1 - u), cx = 39 - 34 * Math.cos(a), cy = 38 - 34 * Math.sin(a);
        E.dot.setAttribute('cx', cx.toFixed(1)); E.dot.setAttribute('cy', cy.toFixed(1));
        E.dot.setAttribute('fill', left <= 15 ? '#FFB066' : '#FFD66E');
        E.sun.classList.toggle('late', left <= 10 && s.phase === 'run');
      }
    },
    stamp(text, o = {}) {
      stampEl.className = 'sh-stamp ' + (o.kind || '');
      stampEl.textContent = text;
      if (o.at && Number.isFinite(o.at.x)) { const q = clampPos(o.at, 80); stampEl.classList.add('at'); stampEl.style.left = q.x + 'px'; stampEl.style.top = q.y + 'px'; } else { stampEl.style.left = ''; stampEl.style.top = ''; }
      void stampEl.offsetWidth; stampEl.classList.add('on');
      clearTimeout(stampT); stampT = setTimeout(() => stampEl.classList.remove('on'), 1200);
      H.lastStamp = text;
    },
    /** a "+N" rising from a screen point (the served pilgrim) */
    float(text, q) {
      const f = el(doc, 'sh-fl', esc(text)); const p = clampPos(q, 60) || { x: W() / 2, y: Hh() * 0.45 };
      f.style.left = Math.round(p.x) + 'px'; f.style.top = Math.round(p.y) + 'px'; R.appendChild(f); setTimeout(() => f.remove(), 1300);
    },
    /** one short line at the foot (the first round only), or none */
    hint(text) {
      if (!hintEl) { hintEl = el(doc, 'sh-hint'); hintEl.setAttribute('role', 'status'); R.appendChild(hintEl); }
      // ── fable32 (build 11.2) ── the owner (14.10): "הוא תופס לי חצי מסך" — a hint shows for 4 s and fades; one line, small; never the same hint twice in a row
      if (text && text === hintEl.__last) return; if (text) hintEl.__last = text;   /* (a hint said once is not said again this round) */
      clearTimeout(hintEl.__t); hintEl.textContent = text || ''; hintEl.classList.toggle('on', !!text);
      if (text) hintEl.__t = setTimeout(() => { hintEl.classList.remove('on'); }, 4000);
    },
    intro(title, sub, ms = 1600) {
      introEl.innerHTML = `<b>${esc(title)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}`;
      introEl.classList.add('on'); setTimeout(() => introEl.classList.remove('on'), ms);
    },
    /** the opening's four rings: steps [{id, label}], h.tap(i); the engine places them (place(i, {x,y}|null)) each frame */
    opening(steps, h = {}) {
      const ban = el(doc, 'sh-op-b', `בסדר הזה! — ${steps.length} נגיעות<small>${esc(h.src || '')}</small>`); R.appendChild(ban);
      const rings = steps.map((s, i) => { const b = el(doc, 'sh-ring', `<i></i><span>${esc(s.label)}</span>`, 'button'); b.type = 'button'; b.dataset.sh = 'op'; b.dataset.i = String(i); b.setAttribute('aria-label', s.label); b.addEventListener('click', (e) => { e.stopPropagation(); if (h.tap) h.tap(i); }); R.appendChild(b); return b; });
      // (the layout: four places scattered over the middle of the screen — not left to right, so the order is his to know; clear of the
      // stick's zone at the left foot and the button's at the right foot. The engine may place them over the world when all four are seen)
      const SPOTS = [[0.56, 0.66], [0.33, 0.42], [0.68, 0.40], [0.40, 0.75]];
      const row = (i) => { const f = SPOTS[i % SPOTS.length]; return { x: W() * f[0], y: Hh() * f[1] }; };
      rings.forEach((b, i) => { const q = row(i); b.style.transform = `translate(${q.x}px,${q.y}px)`; b.style.setProperty('--sh-t', b.style.transform); });
      const used = [];
      return {
        place(i, q) {
          const b = rings[i]; if (!b) return;
          if (!h.world) q = null;
          let p = clampPos(q) || row(i);
          // never on top of another ring (the four may stand close on screen)
          used[i] = null; for (let k = 0; k < 6; k++) { const hit = used.some((u, j) => u && j !== i && Math.hypot(u.x - p.x, u.y - p.y) < 86); if (!hit) break; p = { x: p.x, y: p.y + 30 * (k % 2 ? -k : k) + 40 }; p = clampPos(p) || p; }
          used[i] = p;
          const t = `translate(${Math.round(p.x)}px,${Math.round(p.y)}px)`; if (b.style.transform !== t) { b.style.transform = t; b.style.setProperty('--sh-t', t); }
        },
        mark(i, k) { const b = rings[i]; if (!b) return; if (k === 'ok') b.classList.add('ok'); else { b.classList.remove('bad'); void b.offsetWidth; b.classList.add('bad'); } },
        close() { ban.remove(); rings.forEach((b) => b.remove()); },
        rings,
      };
    },
    /** a chip over a world point (the gate): o = { icon, label, tap } → { at(q, lit), text(t), close() } */
    pin(id, o = {}) {
      const b = el(doc, 'sh-pin', `<i>${esc(o.icon || '')}</i><span>${esc(o.label || '')}</span>`, 'button'); b.type = 'button'; b.dataset.sh = id; b.setAttribute('aria-label', o.label || id);
      b.addEventListener('click', (e) => { e.stopPropagation(); if (o.tap) o.tap(); });
      if (o.dock) { b.classList.add('sh-dock'); top.insertBefore(b, top.firstChild); } else R.appendChild(b);   // (docked: in the top bar, beside the score — never over the world's chips)
      const sp = b.querySelector('span');
      if (o.dock) return { at(q, lit) { b.classList.toggle('lit', !!lit); }, text(t) { sp.textContent = t; }, close() { b.remove(); }, el: b };
      return { at(q, lit) { const on = q && q.x > 8 && q.x < W() - 8 && q.y > 8 && q.y < Hh() - 8; let p = on ? clampPos(q) : { x: W() - 60, y: 112 }; if (p.x > W() - 260 && p.y > Hh() - 210) p = { x: p.x, y: Hh() - 210 }; /* (off screen: docked at the right edge, under the HUD — never on the work button) */ const t = p ? `translate(${Math.round(p.x)}px,${Math.round(p.y)}px)` : 'translate(-999px,-999px)'; if (b.style.transform !== t) b.style.transform = t; b.classList.toggle('lit', !!lit); }, text(t) { sp.textContent = t; }, close() { b.remove(); }, el: b };
    },
    /** an event ring (the coal): o = { icon, label, tap } → { at(q), close() } */
    ring(id, o = {}) {
      const b = el(doc, 'sh-ring sh-coal', `<i>${esc(o.icon || '')}</i><span>${esc(o.label || '')}</span>`, 'button'); b.type = 'button'; b.dataset.sh = id;
      b.addEventListener('click', (e) => { e.stopPropagation(); if (o.tap) o.tap(); }); R.appendChild(b);
      return { at(q) { const p = clampPos(q) || { x: W() * 0.5, y: Hh() * 0.55 }; b.style.transform = `translate(${Math.round(p.x)}px,${Math.round(p.y)}px)`; }, close() { b.remove(); }, el: b };
    },
    /** the end card: ★★☆ (animated in), "180 — משמר ידעיה 165 — ניצחת!", "שיא: 210", "עוד פעם" / "המשמרת הבאה", "למה בסדר הזה? ▸" folded */
    end(r, h = {}) {
      if (endEl) endEl.remove();
      const stars = [0, 1, 2].map((i) => `<i class="${i < r.stars ? 'on' : ''}">★</i>`).join('');
      const verdict = r.score > r.rival ? '<span class="w">ניצחת!</span>' : r.score === r.rival ? 'תיקו!' : 'הפעם הם ניצחו';
      endEl = el(doc, 'sh-end', `<div class="sh-card" role="dialog" aria-label="סוף המשמרת">
        <div class="sh-stars" aria-label="${r.stars} כוכבים">${stars}</div>
        <div class="sh-res">${r.score} — משמר ${esc(r.rivalName || '')} ${r.rival} — ${verdict}</div>
        <div class="sh-sub">${r.newBest ? '<span class="nb">שיא חדש! </span>' : ''}שיא: ${r.best} · ${r.served}/${r.count} עולי רגל${r.lost ? ` · ${r.lost} הלכו` : ''}</div>
        ${r.served === 0 ? '<div class="sh-sub">טיפ: הקישו על עולה רגל — הוא בא אחריכם — ואז על התחנה המוארת, אחת אחרי השנייה.</div>' : ''}
        <div class="sh-btns"><button class="sh-btn again" type="button" data-sh="again">עוד פעם</button>${r.next ? `<button class="sh-btn next" type="button" data-sh="next">המשמרת הבאה</button>` : ''}</div>
        ${h.tour ? '<button class="sh-tour sm" type="button" data-sh="tourEnd">לסיור — היום במקדש</button>' : ''}
        <details class="sh-why"><summary data-sh="why">למה בסדר הזה? ▸</summary>${WHY_SRC.map((t) => `<p>${esc(t)}</p>`).join('')}${(r.mentor || []).length ? `<ul class="sh-mentor">${r.mentor.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}<p class="sh-draft">תמיד א–ד · זבחים ה–ו · שקלים ה · טיוטה — להמחשה</p></details>
      </div>`);
      R.appendChild(endEl);
      { const fb = fullBtn(doc); if (fb) { const bs = endEl.querySelector('.sh-btns'); bs.parentNode.insertBefore(fb, bs.nextSibling); } }   // ── flow31 ── ── /flow31 ──
      endEl.querySelectorAll('.sh-stars i').forEach((s, i) => setTimeout(() => s.classList.add('in'), 250 + i * 330));
      const once = (fn) => { let used = false; return (e) => { if (e) e.stopPropagation(); if (used) return; used = true; fn && fn(); }; };
      const ag = endEl.querySelector('[data-sh=again]'), nx = endEl.querySelector('[data-sh=next]');
      ag.addEventListener('click', once(h.again)); if (nx) nx.addEventListener('click', once(h.next));
      const tb = endEl.querySelector('[data-sh=tourEnd]'); if (tb) tb.addEventListener('click', once(h.tour));
      return endEl;
    },
    closeEnd() { if (endEl) { endEl.remove(); endEl = null; } },
    // ── fable32 (build 8) ── a choice card: a title, a line, 1–4 options (label, sub, price), a close; the merchant's wares, the shop
    choice(h = {}) {
      const c = el(doc, 'sh-end sh-choice', `<div class="sh-card" role="dialog" aria-label="${esc(h.title || '')}"><h2>${esc(h.title || '')}</h2>${h.text ? `<p>${esc(h.text)}</p>` : ''}<div class="sh-ch"></div><div class="sh-btns"><button class="sh-btn restart" type="button" data-sh="close">${esc(h.closeLabel || 'סגור')}</button></div></div>`);
      const box = c.querySelector('.sh-ch');
      if (!h.quiet) evlog('card_open', h.title || '');   // ── recovered (build 16) ── (the event log)
      const closed = () => { evlog('card_close', h.title || ''); if (h.onClose) h.onClose(); };
      for (const it of h.items || []) { const b = doc.createElement('button'); b.type = 'button'; b.innerHTML = `<span>${esc(it.icon || '')} ${esc(it.label)}${it.sub ? `<br><small>${esc(it.sub)}</small>` : ''}</span>${it.price != null ? `<small>${esc(String(it.price))} פרוטות</small>` : ''}`; if (it.disabled) b.disabled = true; if (it.pick) b.classList.add('pick'); b.addEventListener('click', (e) => { e.stopPropagation(); if (it.go && it.go() !== false) { c.remove(); closed(); } else if (h.refresh) { c.remove(); h.refresh(); } }); box.appendChild(b); }
      c.querySelector('[data-sh=close]').addEventListener('click', (e) => { e.stopPropagation(); c.remove(); closed(); });
      R.appendChild(c); return { close() { c.remove(); }, el: c };
    },
    tasks(list) {
      let t = R.querySelector('.sh-tasks'); if (!list || !list.length) { if (t) t.remove(); return; }
      if (!t) { t = el(doc, 'sh-tasks'); R.appendChild(t); }
      const html = list.map((q) => `<i class="${q.done ? 'done' : ''}">${esc(q.text)} ${q.done ? '✓' : `${q.n}/${q.goal}`}</i>`).join('');
      if (t.innerHTML !== html) t.innerHTML = html;
    },
    // ── /fable32 ──
    // ── fable32 (build 3) ── the pause
    onPause(cb) { onPause = cb; return H; },
    pauseCard(h = {}) {
      if (pauseEl) return pauseEl;
      pauseEl = el(doc, 'sh-end sh-pause', `<div class="sh-card" role="dialog" aria-label="הפסקה"><h2>הפסקה</h2>${h.sub ? `<p class="sh-sub30">${esc(h.sub)}</p>` : '' /* ── fable32 (build 30) ── "שימשת N בקרים" (the Phase A ★ capsule is not the Temple's) ── /fable32 ── */}${h.note ? `<p class="sh-note29">${String(h.note).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))}</p>` : '' /* ── fable32 (build 29) ── the calm line before the Shabbat / Yom Tov lock ── /fable32 ── */}
        <div class="sh-btns"><button class="sh-btn resume" type="button" data-sh="resume">המשך</button><button class="sh-btn restart" type="button" data-sh="restart">מהתחלה</button></div>
        ${h.prefs ? prefsHTML(h.prefs.sfx, 'sh-p28') : ''}
        ${h.tour ? '<button class="sh-tour sm" type="button" data-sh="tourP">לסיור — היום במקדש</button>' : ''}
        <button class="sh-tour sm sh-evlog" type="button" data-sh="evlog" style="opacity:.45;font-size:11px;min-height:32px">העתק לוג</button></div>`);
      R.appendChild(pauseEl);
      evlog('card_open', 'pause');   // ── recovered (build 16) ── (the event log, and "העתק לוג" copies it)
      { const b = pauseEl.querySelector('[data-sh=evlog]'); if (b) b.addEventListener('click', (e) => { e.stopPropagation(); copyEvlog().then((ok) => { b.textContent = ok ? 'הלוג הועתק ✓' : 'לא הועתק'; }); }); }
      if (h.prefs) bindPrefs(pauseEl, h.prefs);   // ── fable32 (build 28) ── (צליל, רטט: the same switches as the lobby's) ── /fable32 ──
      const once = (fn) => { let used = false; return (e) => { if (e) e.stopPropagation(); if (used) return; used = true; if (pauseEl) { pauseEl.remove(); pauseEl = null; } evlog('card_close', 'pause'); fn && fn(); }; };
      pauseEl.querySelector('[data-sh=resume]').addEventListener('click', once(h.resume));
      pauseEl.querySelector('[data-sh=restart]').addEventListener('click', once(h.restart));
      const tb = pauseEl.querySelector('[data-sh=tourP]'); if (tb) tb.addEventListener('click', once(h.tour));
      return pauseEl;
    },
    // ── /fable32 ──
    destroy() { clearTimeout(stampT); if (pauseEl) { pauseEl.remove(); pauseEl = null; } R.remove(); },
  };
  return H;
}

/** Phase B's entry card: the big gold "משמרת" (your level, your best) and the small "סיור" (the old day) */
export function entryCard(root, o = {}) {
  const doc = typeof document !== 'undefined' ? document : null; if (!doc) return { close() {} };
  css(doc);
  const lvl = Math.max(1, o.lvl | 0 || 1), best = o.best | 0;
  const c = el(doc, 'sh-entry', `<div class="sh-card" role="dialog" aria-label="משמרת או סיור"><h2>המשמר שלך בעזרה</h2>
    <p>עולי רגל בשער. קח כל אחד לתחנות שלו — בסדר הנכון, לפני שיימאס לו לחכות. 90 שניות, ומשמר אחר מתחרה בך.</p>
    <button class="sh-go" type="button" data-sh="go">משמרת<small>משמרת ${lvl}${best ? ` · שיא ${best}` : ''}</small></button>
    <button class="sh-go sh-day" type="button" data-sh="day">יום במקדש<small>האש, העצים, הלילה${o.bestDay ? ` · שיא: יום ${o.bestDay}` : ''}</small></button>
    <button class="sh-tour" type="button" data-sh="shop">🪙 חנות${o.perutot != null ? ` · ${o.perutot} פרוטות` : ''}</button>
    <button class="sh-tour" type="button" data-sh="tour">סיור — היום במקדש</button>
    <div class="sh-draft">טיוטה — להמחשה</div></div>`);
  (root || doc.body).appendChild(c);
  { const fb = fullBtn(doc); if (fb) c.querySelector('.sh-tour').after(fb); }   // ── flow31 ── ── /flow31 ──
  const close = () => c.remove();
  c.querySelector('[data-sh=go]').addEventListener('click', (e) => { e.stopPropagation(); close(); o.shift && o.shift(lvl); });
  c.querySelector('[data-sh=tour]').addEventListener('click', (e) => { e.stopPropagation(); close(); o.tour && o.tour(); });
  { const db = c.querySelector('[data-sh=day]'); if (db) db.addEventListener('click', (e) => { e.stopPropagation(); close(); o.day && o.day(); }); }   // ── fable32 (build 6) ── ── /fable32 ──
  { const sb = c.querySelector('[data-sh=shop]'); if (sb) sb.addEventListener('click', (e) => { e.stopPropagation(); o.shop && o.shop(); }); }   // ── fable32 (build 8) ── (the shop opens over the card) ── /fable32 ──
  return { close, el: c };
}
// ── /shift29 ──
