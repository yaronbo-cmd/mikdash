/* ── fable32 (build 13) ── lobby35.js — the 3D home screen ("מסך הבית"): the owner, 14.10 23:18–23:20, on Dror's 4-minute video of his
 * game's lobby — "רק במסך פתיחה יש מלא אופציות ומלא תנועה. העין לא נחה לרגע… החלק הכי מגניב שתופס אותך בפנים הוא השוט התלת-מימדי".
 * So, instead of the flat entry card: the kohen stands in the court at dawn, LIVE (the world renders behind him, pilgrims pass, the
 * altar's smoke rises), the camera drifts slowly round him, he breathes, waves, swings the axe; gold motes circle him over a glowing
 * disc. Round him the columns of doors, as in the genre: right (RTL first) — the watch's card (פרוטות, the best day, the badges),
 * ספר הזכרונות, today's tasks; left — the shop, the merchant ("ביום 2"), the two interludes (זיכרון המקדש, משחק האוצר); bottom — the
 * big gold "משחק" (pulsing) and the mode pill (יום במקדש / משמרת / סיור). A dot blinks on a door with news. Every text a draft
 * (טיוטה); never a Divine Name; 44-px targets; RTL.
 * ── fable32 (build 28) ── (the owner's decisions, 22.10 09:19) the mode pill is gone — "משמרת" (the 90 s race) and "סיור" (the old day,
 * the player as the אמרכל) left the game (their code stays: engine.js, avodah/day); a save's lobbyMode 'shift' / 'tour' opens the day.
 * The start screen: "משחק קצר" — one door to a small picker of the three interludes (זיכרון המקדש, הוצאת הטלה מהדיר, משחק האוצר; the
 * day no longer offers them) — and the two switches, צליל and רטט (prefs28.js; also on the pause card); the full screen's ממונה's
 * tasks are the day's own ("יום N", it always said "יום 1"). ── /fable32 ──
 * ── fable32 (build 29) ── (the owner, 22.10 08:59: "מסך פתיחה בשעה האמיתית - כן. וממנו השחקן יחליט אם להמשיך מפה או לחזור לנקודת המוצא
 * שלו (שהיא תהיה יותר מתגמלת)"; rule 16) the court is lit by the real sun where the phone is (time29.js's sky29: dawn · noon · dusk · the
 * readable night — no longer always dawn); the start screen says what the Temple does now ("עכשיו במקדש: …", calendar.js, drafts; at
 * night the guards, Middot 1:1) and has two doors: the gold one stays the player's own track — "נקודת המוצא שלי · המשך יום N" (the
 * rewarding one) — and a smaller "מכאן — המקדש עכשיו" (a card: now and next by the local sun; the chambers to come, locked; no rewards);
 * the "מיקום מדויק" switch beside צליל / רטט. o.lock (a time29 status): the lock screen — the court at rest (no kohen, no lamb, no
 * motes), the greeting and the hour it opens (lock29.js), the switches; no door to play. ── /fable32 ──
 *   const Lb = createLobby({ D, world, view, twin, save, persist, sfx, root, camera(view, twin, o), kit, games, score, start, on: { day, shop, book, merchant } })   (build 28: on.shift / on.tour never called)
 *   Lb.close() · Lb.refresh() · Lb.el · tests: globalThis.__LOBBY (state(), pick(name))
 * ── /fable32 ── */
import { man, lamb, flame } from '../works/figures.js';
import { addDrawer, L, SHARED } from './draw.js';
import { BADGES33, SHOP33, DAY33, tasksNow33, resumeDay33, bookOf23, POOL26 } from './day33.js';   // ── recovered (build 16) ── resumeDay33: the saved day to go on with, 0 = none (day33's; the name is the recovery's) ── fable32 (build 28) ── (tasksNow33: the day's own tasks; was tasksForDay) ── /fable32 ──
import { prefsHTML, bindPrefs } from './prefs28.js';   // ── fable32 (build 28) ── the two switches ── /fable32 ──
import { interludeScore } from './score35.js';   // ── fable32 (build 14) ── the one score ── /fable32 ── ── fable32 (build 30) ── (its ★ capsule is not shown here any more) ── /fable32 ──
import { RATE30, served30, servedHe30, TITLE36 } from './rate30.js';   // ── fable32 (build 30) ── the mornings served, the roles' titles ── /fable32 ──
import { clock29, where29, sky29, templeNow29, readLoc29, saveLoc29 } from './time29.js';   // ── fable32 (build 29) ── ── /fable32 ──
import { css29, lockHTML29, nowLineHTML29, hereDoor29, hereHTML29, locButton29 } from './lock29.js';   // ── fable32 (build 29) ── ── /fable32 ──
import { count32 } from './journal32.js';   // ── fable32 (build 32) ── the journal's door: its pages, the new ones ── /fable32 ──
import { day33n } from './lamb33.js';   // ── fable32 (build 33) ── "הטלה המבוקר": the "מכאן" card's door to לשכת הטלאים ── /fable32 ──
import { hereDoor33 } from './chamber33.js';

// ── fable32 (build 32) ── the build's number, ONE constant: the start screen's, the full screen's and the lock's footers (the full one said
// "בנייה 13" since build 13, the start and the lock "בנייה 29") ── /fable32 ──
export const GAME_BUILD = 54;   // ── fable32 (build 36) ── ── /fable32 ── ── fable32 (build 37) ── ── /fable32 ── ── fable32 (build 38) ── ── /fable32 ── ── fable32 (build 39) ── ── /fable32 ── ── fable32 (build 40) ── ── /fable32 ── ── fable32 (build 41) ── ── /fable32 ── ── fable32 (build 42) ── ── /fable32 ── ── fable32 (build 43) ── ── /fable32 ── ── fable32 (build 44) ── ── /fable32 ── ── fable32 (build 45) ── ── /fable32 ── (build 49) (build 50) (build 51)
export const LOBBY35 = Object.freeze({ x: -25, z: 34, y: 16, az0: Math.PI / 2, swing: 0.45, swingS: 0.22, el: 0.24, d: 16, motes: 14, cycleS: 7 });   // ── recovered (16–26c) ── (x −34 → −25, z 50 → 34, el 0.2 → 0.24, d 15 → 16)
// ── fable32 (build 29) ── the sky's preset for each part of the real day (main.js TIMES; the night is the readable moonlit one — HANDOFF §3
// "לילה = דמדומים (לא חושך)" — not the day's dark 'nightd'); the lock's view: the court at rest, no one at work (the hidden kohen's spot is
// only the camera's target) ── /fable32 ──
export const LOBBY29 = Object.freeze({ sky: Object.freeze({ dawn: 'dawn', noon: 'noon', dusk: 'dusk', night: 'night' }), lock: Object.freeze({ x: -12, z: 12, az: 0.75, el: 0.24, d: 45, swing: 0.15 }) });   // (the lock's view, chosen from eight framings in the browser checks: the laver, kohanim standing, the altar's side with its red line)
const lockView = () => Object.assign({}, LOBBY29.lock, globalThis.__LOCK29VIEW || {});   // (the browser checks may try another framing)

const CSS = `
.lb{position:fixed;inset:0;z-index:31;direction:rtl;font-family:"Heebo",system-ui,sans-serif;color:#FFF6DA;pointer-events:none;overflow:hidden}
.lb *{box-sizing:border-box}
.lb .lb-star{color:#FFD66E}
.lb .lb-top{position:absolute;top:max(6px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);display:flex;gap:8px;align-items:center;background:rgba(20,14,6,.62);border:1px solid rgba(255,220,150,.35);border-radius:999px;padding:4px 14px;font:900 13px/1.2 "Heebo",system-ui,sans-serif;white-space:nowrap}
.lb .lb-col{position:absolute;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:5px;width:min(34vw,200px);pointer-events:none}
.lb .lb-r{right:max(8px,env(safe-area-inset-right))}.lb .lb-l{left:max(8px,env(safe-area-inset-left))}
.lb .lb-door{pointer-events:auto;position:relative;display:flex;align-items:center;gap:8px;min-height:44px;padding:6px 10px;border-radius:14px;border:2px solid rgba(255,230,180,.45);background:linear-gradient(180deg,rgba(60,42,16,.82),rgba(28,18,8,.86));color:#FFF6DA;font:800 13px/1.15 "Heebo",system-ui,sans-serif;text-align:right;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.35);transition:transform .12s}
.lb .lb-door:active{transform:scale(.96)}
.lb .lb-door i{font-style:normal;font-size:20px;line-height:1;width:26px;text-align:center;flex:none}
.lb .lb-door b{display:block;font-weight:900}.lb .lb-door small{display:block;font:700 11px/1.2 "Heebo",system-ui,sans-serif;opacity:.8}
.lb .lb-door.pick{border-color:#FFD66E;background:linear-gradient(180deg,rgba(120,84,20,.9),rgba(70,46,10,.92))}
.lb .lb-dot{position:absolute;top:-6px;left:-6px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#E24B3A;color:#fff;font:900 11px/18px "Heebo",system-ui,sans-serif;text-align:center;box-shadow:0 0 0 2px rgba(20,14,6,.8);animation:lb-pulse 1.4s ease-in-out infinite}
.lb .lb-card{pointer-events:auto;padding:8px 10px;border-radius:14px;border:2px solid rgba(255,230,180,.45);background:linear-gradient(180deg,rgba(60,42,16,.82),rgba(28,18,8,.86));font:800 12px/1.3 "Heebo",system-ui,sans-serif;box-shadow:0 3px 10px rgba(0,0,0,.35)}
.lb .lb-card b{font-size:14px;font-weight:900}.lb .lb-cardb{display:block;width:100%;text-align:right;color:#FFF6DA;cursor:pointer;min-height:44px}   /* ── fable32 (build 30) ── (the titles' card, a door to the roles book) ── */.lb .lb-card .lb-row{display:flex;justify-content:space-between;gap:6px;opacity:.95}
.lb .lb-bar{height:7px;border-radius:4px;background:rgba(0,0,0,.45);margin-top:5px;overflow:hidden}.lb .lb-bar i{display:block;height:100%;background:linear-gradient(90deg,#FFD66E,#D9A43A);border-radius:4px;transition:width .4s}
.lb .lb-task{display:flex;justify-content:space-between;gap:6px;font:700 11px/1.35 "Heebo",system-ui,sans-serif}.lb .lb-task.done{opacity:.6;text-decoration:line-through}
.lb .lb-bottom{position:absolute;bottom:max(10px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none}
.lb .lb-mode{pointer-events:auto;display:flex;gap:4px;background:rgba(20,14,6,.62);border:1px solid rgba(255,220,150,.35);border-radius:999px;padding:3px}
.lb .lb-mode button{min-height:34px;min-width:72px;border:0;border-radius:999px;background:transparent;color:#FFF6DA;font:800 12px/1 "Heebo",system-ui,sans-serif;padding:0 10px;cursor:pointer;opacity:.75}
.lb .lb-mode button.on{background:rgba(255,214,110,.28);opacity:1}
.lb .lb-play{pointer-events:auto;min-height:58px;min-width:220px;border-radius:18px;border:3px solid #FFE8A8;background:linear-gradient(180deg,#FFD66E,#E0A83A);color:#3A2300;font:900 24px/1 "Heebo",system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.4),0 0 0 0 rgba(255,214,110,.6);cursor:pointer;animation:lb-glow 1.8s ease-in-out infinite}
.lb .lb-play small{display:block;font:800 12px/1.2 "Heebo",system-ui,sans-serif;opacity:.85;margin-top:3px}
.lb .lb-play:active{transform:scale(.97)}
.lb .lb-full{pointer-events:auto;position:absolute;top:max(6px,env(safe-area-inset-top));right:max(8px,env(safe-area-inset-right));min-height:44px /* (build 28: was 36 — every target ≥ 44) */;border-radius:10px;border:1px solid rgba(255,220,150,.4);background:rgba(20,14,6,.55);color:#FFF6DA;font:800 11px/1 "Heebo",system-ui,sans-serif;padding:0 10px}
.lb-on .tw-btn,.lb-on .tw-zone,.lb-on .f31-hot,.lb-on .sh-hint,.lb-on .dy-hud,.lb-on .dy-coin,.lb-on .dy-say,.lb-on .dy-line,.lb-on .dy-banner,.lb-on .dy-tm,.lb-on .tw-goal,.lb-on .g27-skip,.lb-on .l28-tap,.lb-on .s27-stamp,.lb-on .tw-hand,.lb-on .tw-pad,.lb-on .av-top .av-rb[data-a=mute]{display:none!important}
.lb .lb-draft{position:absolute;bottom:4px;right:8px;font:700 10px/1 "Heebo",system-ui,sans-serif;opacity:.55}
@keyframes lb-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
@keyframes lb-glow{0%,100%{box-shadow:0 6px 18px rgba(0,0,0,.4),0 0 0 0 rgba(255,214,110,.55)}50%{box-shadow:0 6px 18px rgba(0,0,0,.4),0 0 0 10px rgba(255,214,110,0)}}
.lb .lb-full{right:calc(max(8px,env(safe-area-inset-right)) + 52px)}   /* (build 16: clear of the round home icon) */
/* ── fable32 (build 28) ── the old top bar is off in the shift (prefs28's body.sh28): the full-screen button back at the corner; the start's
   side — "משחק קצר" and the two switches — at the bottom right (the full screen: the switches alone, icons, at the top left); the picker */
body.sh28 .lb .lb-full{right:max(8px,env(safe-area-inset-right))}
.lb .lb-side{position:absolute;right:max(8px,env(safe-area-inset-right));bottom:calc(max(10px,env(safe-area-inset-bottom)) + 14px);display:flex;flex-direction:column;align-items:flex-start;gap:6px;pointer-events:none}
.lb .lb-side .lb-door{min-width:170px;min-height:44px}
.lb:not(.lb-start) .lb-side{top:max(6px,env(safe-area-inset-top));bottom:auto;right:auto;left:max(8px,env(safe-area-inset-left))}
.lb:not(.lb-start) .lb-side .p28 span{display:none}
.lb .lb-pk{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(14,10,5,.55);pointer-events:auto;z-index:2}
.lb .lb-pkc{width:min(560px,calc(100vw - 24px));max-height:calc(100vh - 12px);overflow:auto;box-sizing:border-box;padding:8px 12px 10px;border-radius:18px;border:2px solid #C8923A;background:linear-gradient(#3A2A16,#21170B);text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.6)}
.lb .lb-pkc h2{margin:0;font:900 20px/1.2 "Heebo",system-ui,sans-serif}.lb .lb-pkc p{margin:2px 0 8px;font:700 11px/1.3 "Heebo",system-ui,sans-serif;opacity:.8}
.lb .lb-pkg{display:flex;gap:8px;justify-content:center}
.lb .lb-pkg .lb-door{flex:1;flex-direction:column;justify-content:center;text-align:center;min-height:96px;gap:4px;padding:8px 6px}
.lb .lb-pkg .lb-door i{font-size:30px;width:auto}
.lb .lb-pkx{margin-top:8px;min-height:44px;min-width:140px;border-radius:14px;border:2px solid rgba(255,236,190,.55);background:transparent;color:#FFF6DA;font:800 15px/1 "Heebo",system-ui,sans-serif;cursor:pointer}
/* ── /fable32 ── */
/* ── fable32 (build 32) ── the journal's doors: one on the full screen (the card that was the titles', with the pages and the badges),
   a small one on the start screen beside "משחק קצר"; "חדש" in gold, no pulse */
.lb .lb-sr{display:flex;gap:6px;align-items:stretch;pointer-events:none}
.lb .lb-side .lb-jd{min-width:60px;flex-direction:column;justify-content:center;gap:1px;padding:2px 8px}.lb .lb-jd b{font-size:12px}
.lb .lb-new{position:absolute;top:-7px;left:-6px;height:17px;padding:0 6px;border-radius:9px;background:#FFD66E;color:#2A1804;font:900 10px/17px "Heebo",system-ui,sans-serif;box-shadow:0 0 0 2px rgba(20,14,6,.8);white-space:nowrap}
.lb .lb-j32{position:relative}.lb .lb-j32 > b{display:block;font-size:15px}
/* ── /fable32 ── */
/* ── fable32 (build 16) ── the start (save.lobbyOff, default on): the world at dawn, one big button at the bottom-left (never over him — review #13), "מסך הבית" small at the top-left; minimal: the doors the owner has not asked for are hidden (DAY33.minimal) */
.lb.lb-min .lb-bottom,.lb.lb-start .lb-bottom{left:max(12px,env(safe-area-inset-left));transform:none;align-items:flex-start}
.lb.lb-start .lb-col,.lb.lb-start .lb-mode{display:none}
.lb .lb-home{pointer-events:auto;position:absolute;top:max(6px,env(safe-area-inset-top));left:max(8px,env(safe-area-inset-left));min-height:44px /* (build 28: was 36) */;border-radius:10px;border:1px solid rgba(255,220,150,.4);background:rgba(20,14,6,.55);color:#FFF6DA;font:800 11px/1 "Heebo",system-ui,sans-serif;padding:0 10px}
@media (max-height:420px){.lb .lb-col{gap:5px}.lb .lb-door{min-height:44px;padding:4px 8px}.lb .lb-play{min-height:52px;font-size:22px}}   /* (build 28: the doors 44 px here, were 42) */
@media (prefers-reduced-motion:reduce){.lb .lb-dot,.lb .lb-play{animation:none}}
`;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function createLobby(o = {}) {
  const doc = typeof document !== 'undefined' ? document : null;
  const save = o.save || {}, S = o.world || null, view = o.view || null, D = o.D || null;
  let T = o.twin || null;   // ── fable32 (build 29) ── (o.twinOf: a lock opened before the world was ever entered gets the twin once it is) ── /fable32 ──
  const on = o.on || {};
  const persist = () => { try { o.persist && o.persist(); } catch (e) { /* */ } };
  const sfx = (n) => { try { o.sfx && o.sfx.play && o.sfx.play(n); } catch (e) { /* */ } };
  const st = { t: 0, mode: 'day' /* ── fable32 (build 28) ── (always the day: a save's 'shift' / 'tour' too) ── /fable32 ── */, games: false, start: !!o.start /* ── recovered (build 16) ── the start screen */, open: true, busy: false, cam: null, offDraw: null, drags: 0, dragT: -9, az: LOBBY35.az0, pose: 'stand', u: 1, hx: LOBBY35.x, hz: LOBBY35.z, hy: LOBBY35.y, n: 0,
    lock: o.lock && o.lock.locked ? o.lock : null, soft: '', here: false, locMsg: '', sky: '', inWorld: false, key29: '' };   // ── fable32 (build 29) ── the lock, the calm line, the second door's card ── /fable32 ──
  // ── fable32 (build 29) ── the real clock and where the phone is (tests: o.now, o.where) ── /fable32 ──
  const now29 = () => { try { return o.now ? +o.now() : clock29(); } catch (e) { return Date.now(); } };
  const where = () => { try { return o.where ? o.where() : where29(); } catch (e) { return where29({ query: null }); } };
  const skyNow = () => { try { return LOBBY29.sky[sky29(now29(), where())] || 'dawn'; } catch (e) { return 'dawn'; } };
  const tnNow = () => { try { return templeNow29(now29(), where()); } catch (e) { return null; } };
  function setSky29() { const k = skyNow(); st.sky = k; try { const W = globalThis.__T; if (W && typeof W.setTime === 'function') W.setTime(k); } catch (e) { /* */ } }
  // ── /fable32 ──
  const hp = { x: 0, y: 16, z: 0 };
  const H35 = () => { const H = globalThis.__HERO35; return H && H.loaded ? H : null; };   // ── fable32 (build 15) ── the real kohen (hero35.js), when loaded ── /fable32 ──
  const camNow = () => { try { if (view && view.camNow) return view.camNow(hp); } catch (e) { /* */ } return null; };
  /* ── the world: entered, the day's HUD held, the sky at dawn, the hero at the lobby's spot (hidden: the lobby draws him), the stick off ── */
  function enterWorld() {
    try { if (D && !D.active && D.canEnter && D.canEnter()) D.enter(); } catch (e) { /* */ }
    try { if (!T && o.twinOf) T = o.twinOf() || null; } catch (e) { /* */ }
    try { if (D && D.shiftMode) D.shiftMode({ work: () => null, marks: () => [], tick: () => {} }); } catch (e) { /* */ }
    setSky29();   // ── fable32 (build 29) ── the real hour's sky where the phone is (was always 'dawn') ── /fable32 ──
    try { if (S && S.hero) { const lv = lockView(); S.hero.setPos(st.lock ? lv.x : LOBBY35.x, st.lock ? lv.z : LOBBY35.z, 0); S.hero.drive(0, 0); S.hero.show(!!H35() && !st.lock); } } catch (e) { /* */ }   // (build 15: the real kohen stands himself; without him the kit draws the figure) ── fable32 (build 29) ── (the lock: no kohen at work) ── /fable32 ──
    try { if (S && S.heroXYZ) { S.heroXYZ(hp); st.hy = Number.isFinite(hp.y) ? hp.y : 16; } } catch (e) { /* */ }
    try { if (T && T.noStick) T.noStick(true); } catch (e) { /* */ }
    try { if (o.camera && view) { if (st.cam) st.cam.off(); st.cam = o.camera(view, T, { world: S, drag: 1 }); st.cam.on(); st.cam.orbit(st.lock ? lockView().az : LOBBY35.az0, st.lock ? lockView().el : LOBBY35.el, camD()); } } catch (e) { st.cam = null; }
    SHARED.act = null;
    st.inWorld = !!(D && D.active);   // ── fable32 (build 29) ── (a lock opened in portrait enters the world when the phone turns: tick29) ── /fable32 ──
  }
  const camD = () => (st.lock ? lockView().d : LOBBY35.d);
  function leaveWorld() {
    if (st.offDraw) { try { st.offDraw(); } catch (e) { /* */ } st.offDraw = null; }
    try { if (st.cam) st.cam.off(); } catch (e) { /* */ } st.cam = null;
    try { if (S && S.hero) S.hero.show(true); } catch (e) { /* */ }
    try { if (T && T.noStick) T.noStick(false); } catch (e) { /* */ }
  }
  /* ── the figure and the motes: one drawer a frame ── */
  function draw(k, t, dt) {
    st.t += dt; st.n++;
    // the camera's slow swing round him (paused 3 s after the thumb turned it)
    if (st.cam) { const s = st.cam.state(); if (s.drags !== st.drags) { st.drags = s.drags; st.dragT = st.t; } if (st.t - st.dragT > 3) { st.az = st.lock ? lockView().az + lockView().swing * Math.sin(st.t * LOBBY35.swingS) : LOBBY35.az0 + LOBBY35.swing * Math.sin(st.t * LOBBY35.swingS); st.cam.orbit(st.az, null, camD()); } }   // ── fable32 (build 29) ── (the lock: its own view, a slower sway) ── /fable32 ──
    if (st.lock) return;   // ── fable32 (build 29) ── the Temple at rest: no kohen at work, no lamb, no motes — the court, the altar's fire, the sky ── /fable32 ──
    // the idle cycle: stand (breathing) · a wave · stand · the axe over the shoulder, swung once
    const c = st.t % LOBBY35.cycleS, breath = 0.5 + 0.5 * Math.sin(st.t * 1.7);
    let pose = 'stand', u = 1, axe = false;
    if (c > 2.2 && c < 3.4) { pose = 'raise'; u = Math.min(1, (c - 2.2) / 0.3) * (c > 3.1 ? Math.max(0, 1 - (c - 3.1) / 0.3) : 1); }
    else if (c > 4.6 && c < 6.3) { pose = 'reach'; axe = true; const w = (c - 4.6) / 1.7; u = 0.35 + 0.55 * Math.abs(Math.sin(w * Math.PI * 2)); }
    st.pose = pose; st.u = u;
    const cq = camNow(); const yaw = cq && Number.isFinite(cq.px) ? Math.atan2(cq.pz - st.hz, cq.px - st.hx) : Math.PI / 2;
    const a = L(st.hx), s = L(st.hz), y = L(st.hy);
    // the glowing disc under him, pulsing
    k.c(a, s, y + 0.01, 0.7 + 0.06 * breath, 0.02, '!#E6C25A'); k.c(a, s, y + 0.02, 0.5, 0.02, '!#FFE9A8');
    const H = H35();
    if (H) {
      // the real kohen: he faces the camera (the world hero's yaw: facing = (sin, cos)); the cycle's clips — a cheer, then the axe swung
      if (S && S.hero && cq) { const wy = Math.atan2(cq.px - st.hx, cq.pz - st.hz); if (!Number.isFinite(st.wy) || Math.abs(Math.atan2(Math.sin(wy - st.wy), Math.cos(wy - st.wy))) > 0.03) { st.wy = wy; try { S.hero.setPos(st.hx, st.hz, wy); S.hero.show(true); } catch (e) { /* */ } } }
      if (pose === 'raise' && st.lastClip !== 'Cheer' && c < 2.6) { st.lastClip = 'Cheer'; H.play('Cheer', { once: true }); }
      else if (axe && st.lastClip !== 'Chop' && c < 5.0) { st.lastClip = 'Chop'; H.play('2H_Melee_Attack_Chop', { once: true, speed: 0.8 }); }
      else if (!axe && pose === 'stand' && c > 6.3) st.lastClip = '';
      if (axe) { const R = H.handR(); if (R) { const hx = L(R.x), hz = L(R.z), hy = L(R.y); k.c(hx, hz, hy + 0.25, 0.04, 1.0, '#7A5A3A', { pitch: 0.2, yaw: -yaw }); k.b(hx + Math.cos(yaw) * 0.12, hz + Math.sin(yaw) * 0.12, hy + 0.7, 0.32, 0.08, 0.2, '#9AA3AA', { yaw: -yaw }); } }
    } else {
      const r = man(k, a, s, y + 0.012 * breath, { hero: true, pose, u, yaw, t });
      if (axe && r && r.R) { const R = r.R, dxh = Math.cos(yaw + Math.PI / 2) * 0.3, dzh = Math.sin(yaw + Math.PI / 2) * 0.3; k.b(R[0] + dxh * 0.3, R[1] + dzh * 0.3, R[2] + 0.25, 0.05, 0.05, 0.85, '#7A5A3A', { pitch: 0.35 }); k.b(R[0] + dxh, R[1] + dzh, R[2] + 0.62, 0.22, 0.05, 0.14, '#9AA3AA'); }
    }
    // a lamb trots a slow ring round him (its head up now and then); a small brazier burns at his side — the court alive
    { const ang = st.t * 0.45, rr = 2.6, lx = a + Math.cos(ang) * rr, lz = s + Math.sin(ang) * rr; lamb(k, lx, lz, y, { yaw: ang + Math.PI / 2, step: st.t * 9, head: 0.5 + 0.5 * Math.sin(st.t * 0.7), mark: true }); }
    { const bx = a - 1.3, bz = s - 0.5; k.c(bx, bz, y + 0.16, 0.13, 0.32, '#4A3A2A'); k.c(bx, bz, y + 0.33, 0.16, 0.03, '#6B5236'); flame(k, bx, bz, y + 0.34, 0.4, t); }
    // the gold motes: a slow spiral round him, rising and fading
    for (let i = 0; i < LOBBY35.motes; i++) { const ph = (st.t * 0.35 + i / LOBBY35.motes) % 1, ang = i * 2.4 + st.t * 0.6, rr = 0.7 + 0.35 * Math.sin(i * 1.3 + st.t * 0.8); const sz = 0.03 + 0.02 * (1 - ph); k.s(a + Math.cos(ang) * rr, s + Math.sin(ang) * rr, y + 0.1 + ph * 2.2, sz, sz, sz, '!#FFD66E'); }
  }
  /* ── the doors ── */
  let root = null;
  const claimed = () => { const c = save.badges33 && typeof save.badges33 === 'object' ? save.badges33 : {}; return BADGES33.filter((b) => c[b.id]).length; };
  const perutot = () => +save.perutot || 0;
  const owned = () => (save.day33 && typeof save.day33 === 'object' ? save.day33 : {});
  const canBuy = () => SHOP33.some((it) => !owned()[it.id] && !(it.needs && !owned()[it.needs]) && perutot() >= it.price);
  // ── fable32 (build 28) ── one mode: the day (the pill's "משמרת" — 90 שניות, עולי הרגל בשער — and "סיור" — היום במקדש בלי שעון — are gone) ── /fable32 ──
  const MODE = { day: ['יום במקדש', 'הכיור, הפיס ועבודת הבוקר'] };   // ── fable32 (build 35) ── (was the fire loop's "האש, העצים, הטלאים, הלילה": the morning is its work — svivat-avoda-he.md §1) ── /fable32 ──
  // ── fable32 (build 28) ── "משחק קצר": the three interludes in one small picker (their own runners, פרוטות and score: play(key) below) ── /fable32 ──
  const GAMES28 = [['tiles', '🃏', 'זיכרון המקדש', 'קלפים מתהפכים'], ['pen', '🐑', 'הוצאת הטלה מהדיר', 'פאזל הזזה'], ['m3', '💎', 'משחק האוצר', 'שלושה בשורה']];
  // ── fable32 (build 30) ── the player's titles (the owner, 22.10 09:19: "תארים לפי מיומנות בתפקיד ומניין בקרים"; Phase A's builder titles
  // — פועל … בונה הבית — and its ★ / gold dinars are not the Temple's): the mornings served, and the roles' skill titles, the highest first ── /fable32 ──
  const RANK30 = { start: 0, regular: 1, skilled: 2, expert: 3 },
    titles30 = () => {
      try {
        return [...bookOf23(save), ...bookOf23(save, POOL26)]
          .filter((a) => a.open && a.title)
          .map((a) => ({ ...a, rk: Math.max(0, TITLE36.findIndex((t) => t.he === a.title)) }))   // ── fable32 (build 36) ── (the titles by the level: אומן the highest) ── /fable32 ──
          .sort((a, b) => b.rk - a.rk || b.h - a.h || b.n - a.n);
      } catch (e) {
        return [];
      }
    },
    served = () => servedHe30(served30(save)),
    j32 = () => { try { return count32(save); } catch (e) { return { n: 0, m: 0, fresh: 0 }; } },   // ── fable32 (build 32) ── ── /fable32 ──
    door33 = () => { try { return hereDoor33(save, day33n(now29(), where())); } catch (e) { return ''; } };   // ── fable32 (build 33) ── (today's lamb, or "הטלה הבא — מחר") ── /fable32 ──
  const lvl28 = (k) => { const g = save[k] && typeof save[k] === 'object' ? save[k] : null; if (!g) return 0; return k === 'm3' ? (g.level && g.level.quarry) | 0 : g.level | 0; };
  // ── fable32 (build 32) ── (the start screen: the journal's small door beside "משחק קצר") ── /fable32 ──
  // (compact — the icon over its name — so the row ends where the switches' row ends: never over the kohen, who stands at the middle)
  const jdoor32 = () => { const c = j32(); return `<button class="lb-door lb-jd" type="button" data-lb="journal" aria-label="יומן הכהן — ${c.n} מתוך ${c.m} משניות"><i>📖</i><b>יומן</b>${c.fresh ? `<span class="lb-new">חדש ${c.fresh}</span>` : ''}</button>`; };
  const side28 = (door) => `<div class="lb-side">${door ? `<div class="lb-sr"><button class="lb-door" type="button" data-lb="games"><i>🃏</i><span><b>משחק קצר</b><small>זיכרון · הדיר · האוצר — פרוטות</small></span></button>${jdoor32()}</div>` : ''}${prefsHTML(o.sfx, '', door ? locButton29(!!readLoc29(), st.locMsg) : '') /* ── fable32 (build 29) ── (+ מיקום מדויק on the start screen) ── /fable32 ── */}</div>`;
  const picker28 = () => `<div class="lb-pk" role="dialog" aria-label="משחק קצר"><div class="lb-pkc"><h2>משחק קצר</h2><p>משחקי ביניים — הפרוטות שלכם · המחשה</p><div class="lb-pkg">${GAMES28.map(([k, ic, he, sub]) => `<button class="lb-door pick" type="button" data-lb="${k}"><i>${ic}</i><span><b>${he}</b><small>${lvl28(k) > 1 ? `${k === 'm3' ? 'מחצבה' : 'שלב'} ${lvl28(k)}` : sub}</small></span></button>`).join('')}</div><button class="lb-pkx" type="button" data-lb="games:close">סגור</button></div></div>`;
  function html() {
    const bd = claimed(), tl = save.tiles && typeof save.tiles === 'object' ? save.tiles : {}, pn = save.pen && typeof save.pen === 'object' ? save.pen : {}, m3 = save.m3 && typeof save.m3 === 'object' ? save.m3 : null;
    const sv = served(), tt = titles30();   // ── fable32 (build 30) ── (was: Phase A's score — ★, ◉ dinars, the builder's title) ── /fable32 ──
    const jc = j32();   // ── fable32 (build 32) ── ── /fable32 ──
    const tn = tasksNow33(save), tasks = tn.tasks;   // ── fable32 (build 28) ── (the day's own; was tasksForDay(1)) ── /fable32 ──
    // ── recovered (build 16) ── the start (st.start): the world at dawn, one big button — "המשך יום N" when a day is saved — "מסך הבית"
    // and the full screen; minimal (DAY33.minimal): the doors the owner has not asked for are hidden
    const cont = resumeDay33(save), minimal = !!DAY33.minimal, playLabel = cont ? `המשך יום ${cont}` : 'משחק';
    // ── fable32 (build 29) ── the lock: its screen only (lock29.js) — the court at rest behind it, the switches; no door to play ── /fable32 ──
    if (st.lock) return `${lockHTML29(st.lock, where(), o.sfx)}<div class="lb-draft">טיוטה — המחשה · בנייה ${GAME_BUILD}</div>`;
    const tn29 = st.start ? tnNow() : null;   // ── fable32 (build 29) ── the Temple now, by the sun where the phone is ── /fable32 ──
    return st.start ? `
      <div class="lb-top">🏛️ בית המקדש השני ${sv ? `<span style="opacity:.6">·</span> <span class="lb-star">${esc(sv)}</span>` : ''}${tt[0] ? ` <span style="opacity:.6">·</span> ${tt[0].icon} ${esc(tt[0].title)}` : ''}</div>
      ${nowLineHTML29(tn29, st.soft)}
      <button class="lb-home" type="button" data-lb="home">☰ מסך הבית</button>
      <button class="lb-full" type="button" data-lb="full">⛶ מסך מלא</button>
      <div class="lb-bottom">${hereDoor29()}<button class="lb-play" type="button" data-lb="play"><small class="lb-k">נקודת המוצא שלי</small>${esc(playLabel)}<small>${cont ? `הבוקר מחכה — ${MODE.day[1]}` /* ── fable32 (build 35) ── (was "המערכה מחכה") ── */ : `${MODE.day[0]} — ${MODE.day[1]}`}</small></button></div>
      ${side28(true)}${st.games ? picker28() : ''}${st.here ? hereHTML29(tn29, where(), now29(), { door: on.chamber ? door33() : '' } /* ── fable32 (build 33) ── (לשכת הטלאים, open) ── /fable32 ── */) : ''}
      <div class="lb-draft">טיוטה — להמחשה · בנייה ${GAME_BUILD}</div>` : `
      <div class="lb-top">🏛️ בית המקדש השני <span style="opacity:.6">·</span> ${sv ? `<span class="lb-star">${esc(sv)}</span> <span style="opacity:.6">·</span> ` : ''}🪙 <span data-lb="perutot">${perutot()}</span> פרוטות <span style="opacity:.6">·</span> 📜 ${bd}/${BADGES33.length}</div>
      <button class="lb-full" type="button" data-lb="full">⛶ מסך מלא</button>
      <div class="lb-col lb-r">
        ${/* ── fable32 (build 32) ── ONE door: "יומן הכהן" — the titles' card (the mornings, the two highest titles) with the journal's pages and
           badges; it replaces the titles' card and ספר הזכרונות as doors (both are tabs of the journal) ── /fable32 ── */ ''}<button class="lb-card lb-cardb lb-j32" type="button" data-lb="journal"><b>📖 יומן הכהן</b>${jc.fresh ? `<span class="lb-new">חדש ${jc.fresh}</span>` : ''}<div class="lb-row"><span>שימשת</span><span>${sv ? esc(sv.replace(/^שימשת /, '')) : '—'}</span></div>${tt.slice(0, 2).map((a) => `<div class="lb-row"><span>${a.icon} ${esc(a.he)}</span><span>${esc(a.title)}</span></div>`).join('')}<div class="lb-row"><span>📜 משניות</span><span>${jc.n}/${jc.m}</span></div><div class="lb-row"><span>🏅 אותות</span><span>${bd}/${BADGES33.length}</span></div></button>
        <div class="lb-card"><b>משימות הממונה — יום ${tn.day}</b>${tasks.map((q) => `<div class="lb-task${q.done ? ' done' : ''}"><span>${esc(q.text)}</span><span>${q.done ? '✓' : `+${DAY33.taskReward || 5}🪙`}</span></div>`).join('')}</div>
      </div>
      <div class="lb-col lb-l">
        ${minimal ? '' : `<button class="lb-door" type="button" data-lb="shop"><i>🪙</i><span><b>חנות</b><small>${perutot()} פרוטות</small></span>${canBuy() ? '<span class="lb-dot">!</span>' : ''}</button>
        <button class="lb-door" type="button" data-lb="merchant"><i>🧺</i><span><b>הסוחר</b><small>מגיע ביום 2 — סחר בעודפים</small></span></button>`}
        <button class="lb-door pick" type="button" data-lb="tiles"><i>🃏</i><span><b>זיכרון המקדש</b><small>${tl.level > 1 ? `שלב ${tl.level}` : 'קלפים מתהפכים — פרוטות'}</small></span><span class="lb-dot">${tl.level > 1 ? '★' : 'חדש'}</span></button>
        ${minimal ? '' : `<button class="lb-door pick" type="button" data-lb="pen"><i>🐑</i><span><b>הוצאת הטלה מהדיר</b><small>${pn.level > 1 ? `שלב ${pn.level}` : 'פאזל הזזה — פרוטות'}</small></span>${pn.level > 1 ? '' : '<span class="lb-dot">חדש</span>'}</button>
        <button class="lb-door pick" type="button" data-lb="m3"><i>💎</i><span><b>משחק האוצר</b><small>${m3 && m3.level ? `מחצבה ${m3.level.quarry || 1}` : 'שלושה בשורה — פרוטות'}</small></span></button>`}
      </div>
      <div class="lb-bottom">
        <button class="lb-play" type="button" data-lb="play"><small class="lb-k">נקודת המוצא שלי</small>${esc(playLabel)}<small>${MODE.day[0]} — ${MODE.day[1]}</small></button>
      </div>
      ${side28(false)}${st.games ? picker28() : ''}${nowLineHTML29(null, st.soft) /* ── fable32 (build 29) ── (the calm line here too) ── /fable32 ── */}
      <div class="lb-draft">טיוטה — להמחשה · מסך הבית · בנייה ${GAME_BUILD}</div>`;   // ── fable32 (build 28) ── (no mode pill; the switches) ── /fable32 ──
  }
  function render() {
    if (!root) return;
    root.classList.toggle('lb-start', !!st.start && !st.lock); root.classList.toggle('lb-min', !!DAY33.minimal);   // ── recovered (build 16) ──
    root.classList.toggle('lb-lock', !!st.lock);   // ── fable32 (build 29) ── ── /fable32 ──
    st.key29 = key29();
    root.innerHTML = html();
    root.querySelectorAll('[data-lb]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); pick(b.dataset.lb); }));
    bindPrefs(root, { sfx: o.sfx });   // ── fable32 (build 28) ── (the two switches redraw themselves) ── /fable32 ──
  }
  function pick(name) {
    if (!st.open || st.busy) return false;
    sfx('ui');
    if (name.startsWith('mode:')) return false;   // ── fable32 (build 28) ── (no modes but the day) ── /fable32 ──
    if (st.lock) return false;   // ── fable32 (build 29) ── (the lock: no door; its switches are prefs28's own) ── /fable32 ──
    if (name === 'here') { st.here = true; render(); return true; }   // ── fable32 (build 29) ── the second door: its card (no reward) ── /fable32 ──
    if (name === 'here:close') { st.here = false; render(); return true; }
    if (name === 'ch33') { if (!on.chamber) return false; st.here = false; close(); on.chamber(); return true; }   // ── fable32 (build 33) ── לשכת הטלאים (shift/index.js runChamber33) ── /fable32 ──
    if (name === 'loc') return loc29();
    if (name === 'play') { close(); on.day && on.day(); return true; }   // ── recovered (build 16) ── (st.start: the start's button is the day) ── fable32 (build 28) ── (and the full screen's: the day, always) ── /fable32 ──
    if (name === 'games') { st.games = true; render(); return true; }   // ── fable32 (build 28) ── "משחק קצר": the picker ── /fable32 ──
    if (name === 'games:close') { st.games = false; render(); return true; }
    if (name === 'home') { st.start = false; render(); return true; }   // ── recovered (build 16) ── (מסך הבית: the doors)
    if (name === 'full') { try { const d = doc.documentElement; if (doc.fullscreenElement) doc.exitFullscreen(); else if (d.requestFullscreen) d.requestFullscreen(); } catch (e) { /* */ } return true; }
    if (name === 'shop') { on.shop && on.shop(); return true; }
    if (name === 'book') { on.book && on.book(); return true; }
    if (name === 'journal') { if (on.journal) on.journal(st.start ? 'start' : 'full'); else if (on.roles) on.roles(); else if (on.book) on.book(); return true; }   // ── fable32 (build 32) ── the journal's door (from the start screen or the full one) ── /fable32 ──
    if (name === 'roles') { if (on.roles) on.roles(); else if (on.book) on.book(); return true; }   // ── fable32 (build 30) ── (the card of the titles opens the roles book) ── /fable32 ──
    if (name === 'merchant') { on.merchant && on.merchant(); return true; }
    if (name === 'tiles' || name === 'pen' || name === 'm3') { st.games = false; play(name); return true; }   // ── fable32 (build 28) ── (the picker closes) ── /fable32 ──
    return false;
  }
  // ── fable32 (build 14) ── one way for every interlude (o.games from index.js: tiles · pen · m3): the lobby hides while it plays; its פרוטות and score are the player's
  async function play(key) {
    const g = o.games && o.games[key]; if (st.busy || !doc || !g) return;
    st.busy = true; if (root) root.style.display = 'none';
    let r = null;
    try { r = await g(); } catch (e) { r = null; }
    if (r && r.perutot > 0) save.perutot = perutot() + (r.perutot | 0);
    const pts = interludeScore(key, r); if (pts > 0 && o.score) { try { o.score.add(pts, key); } catch (e) { /* */ } }
    persist(); st.busy = false; if (root) { root.style.display = ''; render(); }
  }
  // ── /fable32 ──
  // ── fable32 (build 29) ── "מיקום מדויק": asked once, kept rounded (time29's saveLoc29: bh_loc29, never sent); a tap again forgets it
  function loc29() {
    if (readLoc29()) { saveLoc29(null); st.locMsg = ''; afterWhere(); return true; }
    const geo = typeof navigator !== 'undefined' && navigator.geolocation;
    if (!geo || !geo.getCurrentPosition) { st.locMsg = 'אין מיקום — לפי אזור הזמן'; render(); return false; }
    st.locMsg = 'מאתר…'; render();
    try {
      geo.getCurrentPosition((p) => { saveLoc29(p.coords.latitude, p.coords.longitude); st.locMsg = ''; afterWhere(); },
        () => { st.locMsg = 'לא התקבל — לפי אזור הזמן'; if (st.open) render(); }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 6 * 3600e3 });
    } catch (e) { st.locMsg = 'לא התקבל — לפי אזור הזמן'; render(); }
    return true;
  }
  function afterWhere() { if (!st.open) return; setSky29(); render(); try { o.onWhere && o.onWhere(); } catch (e) { /* */ } }
  // what the start screen shows that time changes: the sky, the Temple's line, the calm line (tick29 redraws only when it moved)
  function key29() { if (st.lock) return `lock|${st.lock.opensAt}|${st.lock.jerusalem && st.lock.jerusalem.entered}`; const tn = st.start ? tnNow() : null; return `${tn ? tn.line + (tn.night ? '|n' : '') : ''}|${st.soft}`; }
  function tick29() {
    if (!st.open) return false;
    if (!st.inWorld && D && D.active) enterWorld();   // (the phone turned: the court, at last)
    const k = skyNow(); if (k !== st.sky) setSky29();
    if (!st.busy && key29() !== st.key29) { render(); return true; }
    return false;
  }
  function lock29(s) { const was = !!st.lock; st.lock = s && s.locked ? s : null; st.here = false; st.games = false; if (was !== !!st.lock) { try { if (S && S.hero) S.hero.show(!!H35() && !st.lock); } catch (e) { /* */ } enterWorld(); } render(); }
  function soft29(line) { line = line || ''; if (line === st.soft) return; st.soft = line; if (!st.busy) render(); }
  // ── /fable32 ──
  function close() {
    if (!st.open) return; st.open = false;
    leaveWorld();
    if (root) { root.remove(); root = null; }
    try { doc && doc.body.classList.remove('lb-on'); } catch (e) { /* */ }
    try { if (globalThis.__LOBBY && globalThis.__LOBBY.__me === me) delete globalThis.__LOBBY; } catch (e) { /* */ }
  }
  /* ── open ── */
  if (doc) {
    if (!doc.getElementById('lb-css')) { const s = doc.createElement('style'); s.id = 'lb-css'; s.textContent = CSS; doc.head.appendChild(s); }
    css29(doc);   // ── fable32 (build 29) ── ── /fable32 ──
    doc.body.classList.add('lb-on');
    root = doc.createElement('div'); root.className = 'lb'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'מסך הבית'); (o.root || doc.body).appendChild(root);
    render();
    try { st.offDraw = addDrawer(o.kit || null, draw, 5); } catch (e) { st.offDraw = null; }
  }
  enterWorld();
  const me = { close, refresh: render, pick, html /* ── fable32 (build 28) ── (tests: the screen's markup) ── /fable32 ── */, get el() { return root; }, state: () => ({ open: st.open, mode: st.mode, start: st.start, games: st.games, busy: st.busy, pose: st.pose, u: +st.u.toFixed(2), az: +st.az.toFixed(2), frames: st.n, cam: st.cam ? st.cam.state() : null, perutot: perutot(), badges: claimed(),
    lock: !!st.lock, soft: st.soft, here: st.here, sky: st.sky /* ── fable32 (build 29) ── */ }),
    lock29, soft29, tick29, view29: () => { if (st.open) enterWorld(); } /* ── fable32 (build 29) ── */ };
  try { globalThis.__LOBBY = Object.assign({ __me: me }, me, { state: me.state, pick }); } catch (e) { /* */ }
  return me;
}
