/* ─────────────────────────────────────────────────────────────────────────────
 * tiles/ui.js: the overlay of "זיכרון המקדש" — the board of flipping tiles (CSS 3D), the HUD (level, the gold progress bar,
 * a quiet clock, פרוטות, the streak), the tool buttons (רמז · ערבוב · ↩ ביטול), the cards (start, won, time's up, exit)
 * and the particle layer (gold bursts, fireworks). DOM only; RTL; 44-px targets; all classes tl-*.
 *   const U = createUI(root, { onTap(i), onHint(), onShuffle(), onUndo(), onExit() });
 *   U.board(state) · U.sync(state) · U.flip(i, up) · U.match(a, b, gain, streak) · U.miss(a, b) · U.lit(pair, ms) ·
 *   U.clock(ms, limit) · await U.card(kind, data) → choice · U.fireworks(ms) · U.destroy()
 * Every text that states a fact is a draft (טיוטה) with a source in docs/TILES35.md.
 * ──────────────────────────────────────────────────────────────────────────── */
import { DEFS, svg, ROSETTE, COIN } from './art.js';
import { PIC_HE, fmtTime } from './engine.js';

export const LAND = '(orientation:landscape) and (max-height:560px) and (min-width:560px)';
const SIDE = 150;      // each side column in landscape (px)
const CSS = `
.tl{position:fixed;inset:0;z-index:200;direction:rtl;display:flex;flex-direction:column;align-items:center;overflow:hidden;
 font-family:"Heebo",system-ui,sans-serif;color:#3A2410;-webkit-user-select:none;user-select:none;touch-action:none;
 background:radial-gradient(120% 70% at 50% 30%,rgba(255,250,236,.55),rgba(255,240,210,0) 60%),linear-gradient(180deg,#EFE1C6 0%,#E3CDA6 55%,#CDB088 100%);animation:tlin .35s ease-out}
.tl::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.35;
 background:repeating-linear-gradient(135deg,rgba(255,255,255,.12) 0 2px,transparent 2px 7px),repeating-linear-gradient(45deg,rgba(90,54,24,.05) 0 1px,transparent 1px 9px)}
@keyframes tlin{from{opacity:0}to{opacity:1}}
.tl-side{position:relative;z-index:2;width:100%;max-width:520px;box-sizing:border-box;padding:6px 10px}
.tl-right{padding-top:calc(env(safe-area-inset-top,0px) + 8px)}
.tl-left{padding-bottom:calc(env(safe-area-inset-bottom,0px) + 8px)}
.tl-row{display:flex;align-items:center;gap:8px}
.tl-btn{min-width:44px;min-height:44px;border-radius:14px;border:1px solid rgba(255,236,190,.7);background:linear-gradient(#A8804F,#6E4A26);
 color:#FFF4DC;font:700 15px "Heebo",system-ui,sans-serif;padding:0 12px;box-shadow:0 3px 0 #4A2E12,0 4px 10px rgba(40,20,0,.25),inset 0 1px 0 rgba(255,255,255,.35);
 cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;display:inline-flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap}
.tl-btn:active{transform:translateY(2px);box-shadow:0 1px 0 #4A2E12}
.tl-btn[disabled]{opacity:.45;box-shadow:none;transform:none}
.tl-btn .n{display:inline-block;min-width:20px;height:20px;border-radius:10px;background:#FFE08A;color:#4A2E10;font:800 12px/20px "Heebo",sans-serif;text-align:center;padding:0 5px}
.tl-btn:focus-visible,.tl-cta:focus-visible,.tl-sec:focus-visible,.tl-tile:focus-visible{outline:3px solid #2A4A7A;outline-offset:2px}
.tl-exit{min-width:44px;padding:0;font-size:20px;line-height:1}
.tl-title{flex:1;text-align:center;font:900 19px/1.15 "Frank Ruhl Libre","Heebo",serif;color:#4A2E10}
.tl-title small{display:block;font:600 12.5px "Heebo",sans-serif;color:#6E4A26}
.tl-prog{position:relative;height:12px;border-radius:7px;background:rgba(74,46,16,.18);margin:8px 2px 0;box-shadow:inset 0 1px 2px rgba(0,0,0,.25);overflow:hidden}
.tl-prog i{position:absolute;right:0;top:0;bottom:0;border-radius:7px;width:0;transition:width .45s cubic-bezier(.3,1.2,.5,1);
 background:linear-gradient(90deg,#B8841E,#E9C765 40%,#FFF3C4 50%,#E9C765 60%,#B8841E);box-shadow:0 0 8px rgba(233,199,101,.8)}
.tl-prog b{position:absolute;inset:0;text-align:center;font:800 10px/12px "Heebo",sans-serif;color:#3A2410}
.tl-clock{margin-top:6px;display:flex;align-items:center;justify-content:center;gap:6px;font:600 13px "Heebo",sans-serif;color:#6E4A26}
.tl-clock b{font:800 17px "Heebo",sans-serif;color:#3A2410;font-variant-numeric:tabular-nums;direction:ltr}
.tl-stats{display:flex;gap:8px;justify-content:center;align-items:stretch;flex-wrap:wrap}
.tl-stat{display:inline-flex;align-items:center;gap:6px;background:rgba(255,250,236,.75);border:1.5px solid #D9B45A;border-radius:999px;padding:4px 12px;
 box-shadow:0 2px 0 rgba(120,80,30,.25),inset 0 1px 0 #fff;font:800 16px "Heebo",sans-serif;color:#3A2410;min-height:36px;box-sizing:border-box}
.tl-stat small{font:600 11.5px "Heebo",sans-serif;color:#6E4A26}
.tl-stat svg{width:24px;height:24px}
.tl-stat.bump{animation:tlbump .3s ease-out}
@keyframes tlbump{40%{transform:scale(1.16)}}
.tl-streak{background:linear-gradient(#FFF3C4,#FFD66E);border-color:#B8841E;color:#5A3618;font-size:calc(15px + var(--sk,0) * 1px);transition:font-size .2s}
.tl-streak[hidden]{display:none}
.tl-streak.on{animation:tlstreak .5s ease-out}
@keyframes tlstreak{0%{transform:scale(.6) rotate(-6deg)}60%{transform:scale(1.18) rotate(3deg)}100%{transform:none}}
.tl-tools{display:flex;gap:8px;justify-content:center;margin-top:8px;flex-wrap:wrap}
.tl-board{position:relative;z-index:1;flex:1;min-height:0;width:100%;max-width:560px;display:flex;align-items:center;justify-content:center;box-sizing:border-box;padding:4px 8px}
.tl-grid{position:relative;display:grid;gap:var(--gap,6px);padding:var(--pad,10px);box-sizing:border-box;border-radius:16px;
 background:radial-gradient(ellipse at 50% 35%,#3C6399,#2A4A7A 55%,#1E3860 100%);
 box-shadow:0 0 0 3px #B8841E,0 0 0 7px #8A6A45,0 0 0 8px rgba(255,236,190,.5),inset 0 0 36px rgba(0,0,0,.35),0 14px 34px rgba(40,20,0,.45)}
.tl-grid::before{content:"";position:absolute;inset:0;border-radius:16px;pointer-events:none;opacity:.5;
 background:repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 1px,transparent 1px 3px),repeating-linear-gradient(90deg,rgba(0,0,0,.05) 0 1px,transparent 1px 3px)}
.tl-tile{position:relative;width:var(--tw);height:var(--th);border:0;background:none;padding:0;margin:0;perspective:700px;cursor:pointer;
 touch-action:manipulation;-webkit-tap-highlight-color:transparent;font:inherit;color:inherit}
.tl-in{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .45s cubic-bezier(.34,1.25,.5,1);border-radius:10px}
.tl-tile.up .tl-in{transform:rotateY(180deg)}
.tl-back,.tl-face{position:absolute;inset:0;border-radius:10px;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden}
.tl-back{background:linear-gradient(150deg,#F8EEDA 0%,#E9D7BB 48%,#D1B992 100%);
 box-shadow:inset 0 2px 0 rgba(255,255,255,.8),inset 0 -3px 0 rgba(110,74,44,.32),inset 2px 0 0 rgba(255,255,255,.4),inset -2px 0 0 rgba(110,74,44,.2),0 4px 10px rgba(10,5,0,.5)}
.tl-back svg{position:absolute;left:15%;top:15%;width:70%;height:70%}
.tl-back::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.6) 48%,transparent 60%);
 transform:translateX(-130%);animation:tlshine 8s ease-in-out infinite;animation-delay:var(--d,0s)}
@keyframes tlshine{0%,72%{transform:translateX(-130%)}88%,100%{transform:translateX(130%)}}
.tl-tile:active .tl-back{filter:brightness(1.06)}
.tl-face{transform:rotateY(180deg);background:linear-gradient(180deg,#FFFDF7,#F1ECE0 62%,#E6DCC6);display:flex;flex-direction:column;align-items:center;justify-content:center;
 gap:0;padding:3px 2px 2px;box-sizing:border-box;box-shadow:inset 0 0 0 2px #D9B45A,inset 0 0 0 4px #FFF8E6,0 4px 10px rgba(10,5,0,.5)}
.tl-face svg{width:80%;height:auto;max-height:68%;flex:1 1 auto;min-height:0;filter:drop-shadow(0 1px 1px rgba(80,50,20,.25))}
.tl-name{display:block;flex:0 0 auto;font:700 var(--fs,11px)/1.05 "Heebo",sans-serif;color:#4A2E10;text-align:center;white-space:normal;max-width:100%;max-height:2.15em;overflow:hidden;overflow-wrap:normal}
.tl-face.nm{background:linear-gradient(180deg,#FFF8E6,#F3E6CC 62%,#E6D2AC)}
.tl-face.nm svg{width:34%;max-height:30%;opacity:.75;filter:none}
.tl-face.nm .tl-name{font-size:calc(var(--fs,11px) * 1.3);line-height:1.15;max-height:2.4em;font-weight:900;color:#5A3618}
.tl-tile.ok{animation:tlrise .7s cubic-bezier(.3,1.4,.5,1);z-index:2}
@keyframes tlrise{0%{transform:none}45%{transform:translateY(-8px) scale(1.1)}100%{transform:none}}
.tl-tile.ok .tl-face{box-shadow:inset 0 0 0 2.5px #FFE08A,inset 0 0 0 5px #FFF8E6,0 0 22px 4px rgba(255,214,110,.95),0 4px 10px rgba(10,5,0,.4)}
.tl-tile.done{cursor:default}
.tl-tile.done .tl-face{box-shadow:inset 0 0 0 2.5px #E9C765,inset 0 0 0 5px #FFF3C4,0 0 12px rgba(233,199,101,.7),0 3px 8px rgba(10,5,0,.35);
 background:linear-gradient(180deg,#FFFDF4,#F7EDD3 62%,#EAD9B2)}
.tl-tile.bad{animation:tlshake .45s ease-in-out}
@keyframes tlshake{20%{transform:translateX(-3px) rotate(-1.5deg)}50%{transform:translateX(3px) rotate(1.5deg)}80%{transform:translateX(-2px)}}
.tl-tile.lit .tl-back{box-shadow:inset 0 2px 0 rgba(255,255,255,.8),inset 0 -3px 0 rgba(110,74,44,.32),0 0 0 3px #FFE08A,0 0 20px 4px rgba(255,214,110,.95);
 animation:tllit .5s ease-in-out infinite alternate}
@keyframes tllit{from{filter:brightness(1)}to{filter:brightness(1.18)}}
.tl-fx{position:absolute;left:0;top:0;pointer-events:none;z-index:7}
.tl-pop{position:absolute;z-index:5;pointer-events:none;font:900 19px "Heebo",sans-serif;color:#FFF3C4;text-shadow:0 2px 0 #7A4A00,0 0 12px #FFD66E,0 0 2px #7A4A00;
 transform:translate(-50%,-50%);animation:tlpop 1.1s ease-out forwards;white-space:nowrap;direction:ltr}
.tl-pop.big{font-size:24px;color:#FFE08A}
@keyframes tlpop{0%{opacity:0;transform:translate(-50%,-30%) scale(.6)}20%{opacity:1;transform:translate(-50%,-55%) scale(1.15)}100%{opacity:0;transform:translate(-50%,-150%) scale(1)}}
.tl-wrap{position:absolute;inset:0;z-index:6;display:flex;align-items:center;justify-content:center;background:rgba(40,24,8,.5);padding:14px;box-sizing:border-box;animation:tlin .25s ease-out}
.tl-card{width:100%;max-width:370px;max-height:100%;overflow:auto;box-sizing:border-box;background:linear-gradient(#FFF8E8,#F0DBB0);color:#3A220C;border-radius:22px;
 padding:16px 16px 14px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.5),inset 0 0 0 2px #D8AB58;touch-action:pan-y;position:relative}
.tl-card h2{font:900 26px/1.2 "Frank Ruhl Libre","Heebo",serif;margin:2px 0 6px;color:#5A300A}
.tl-card p{font:500 16px/1.45 "Heebo",sans-serif;margin:6px 0}
.tl-card .tl-stat{margin:2px 3px}
.tl-cta{display:block;width:100%;min-height:52px;border:0;border-radius:16px;background:linear-gradient(#FFD569,#DF951A);color:#452300;font:900 20px "Heebo",sans-serif;
 box-shadow:0 4px 0 #94580C;margin-top:12px;cursor:pointer;touch-action:manipulation}
.tl-sec{display:block;width:100%;min-height:46px;border-radius:14px;border:2px solid #C8964A;background:transparent;color:#5A300A;font:800 16px "Heebo",sans-serif;margin-top:8px;cursor:pointer;touch-action:manipulation}
.tl-stars3{font:44px/1.1 serif;letter-spacing:4px;margin:2px 0;direction:ltr}
.tl-stars3 span{color:rgba(90,48,10,.2);display:inline-block}
.tl-stars3 span.on{color:#E5A11C;text-shadow:0 2px 0 #9A5E0E,0 0 12px #FFE08A;animation:tlstar .45s ease-out both}
@keyframes tlstar{0%{transform:scale(0) rotate(-40deg)}70%{transform:scale(1.25)}100%{transform:scale(1)}}
.tl-tag{display:inline-block;vertical-align:middle;background:#FCE3AA;color:#6E4200;border-radius:7px;padding:0 6px;font:700 11px/1.6 "Heebo",sans-serif;margin-inline-start:4px}
.tl-sum{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:6px 0}
.tl-sum .tl-stat{font-size:15px}
.tl-coinbig{display:inline-flex;align-items:center;gap:8px;font:900 24px "Heebo",sans-serif;color:#7A4A00;margin:4px 0}
.tl-coinbig svg{width:34px;height:34px}
.tl-tip{font-size:13.5px;color:#4A3418;background:#FFF1C9;border-radius:10px;padding:5px 8px}
@media (prefers-reduced-motion:reduce){.tl,.tl-wrap,.tl-back::after,.tl-tile.ok,.tl-tile.bad,.tl-tile.lit .tl-back,.tl-stat.bump,.tl-streak.on,.tl-stars3 span.on{animation:none}.tl-in{transition:none}}
@media ${LAND}{
 .tl{display:grid;grid-template-columns:minmax(${SIDE}px,1fr) auto minmax(${SIDE}px,1fr);grid-template-rows:1fr;align-items:center;
  padding:0 env(safe-area-inset-right,0px) 0 env(safe-area-inset-left,0px)}
 .tl-side{max-width:none;padding:6px 10px;align-self:center}
 .tl-right{grid-column:1;padding-top:6px}
 .tl-board{grid-column:2;max-width:none;padding:6px 4px;height:100%}
 .tl-left{grid-column:3;padding-bottom:6px}
 .tl-title{font-size:17px}
 .tl-stats{flex-direction:column;align-items:center;gap:6px}
 .tl-tools{flex-direction:column;align-items:center;margin-top:10px}
 .tl-tools .tl-btn{width:132px;max-width:100%}
 .tl-card{max-width:540px;padding:8px 16px 8px;border-radius:18px;display:flex;flex-wrap:wrap;align-content:flex-start;column-gap:8px}
 .tl-card>*{flex:1 0 100%;min-width:0;box-sizing:border-box}
 .tl-card>.tl-cta,.tl-card>.tl-sec{flex:1 1 40%;width:auto}
 .tl-card h2{font-size:22px;margin:0 0 2px}
 .tl-card p{font-size:14.5px;line-height:1.35;margin:3px 0}
 .tl-cta{min-height:48px;font-size:18px;margin-top:8px}
 .tl-sec{min-height:44px;margin-top:6px}
 .tl-stars3{font-size:30px;margin:0}
}`;
let cssDone = false;
function css() {
  if (cssDone || !globalThis.document) return;
  cssDone = true;
  const st = document.createElement('style'); st.id = 'tl-css'; st.textContent = CSS; document.head.appendChild(st);
}
const isLand = () => { try { return !!(globalThis.matchMedia && globalThis.matchMedia(LAND).matches); } catch (e) { return false; } };
const esc = (x) => String(x).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const ASPECT = 0.84;      // a tile's width / height
const GAP = 6, PAD = 10;

export function createUI(root, o = {}) {
  css();
  const el = h('div', 'tl');
  el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'זיכרון המקדש');
  el.innerHTML = `${DEFS}
  <div class="tl-side tl-right">
    <div class="tl-row"><button class="tl-btn tl-exit" type="button" aria-label="יציאה">✕</button>
      <div class="tl-title"><span class="t">זיכרון המקדש</span><small class="st"></small></div></div>
    <div class="tl-prog" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="זוגות שנמצאו"><i></i><b></b></div>
    <div class="tl-clock" aria-live="off"><small>זמן</small><b class="ck">0:00</b></div>
  </div>
  <div class="tl-board"><div class="tl-grid" role="group" aria-label="לוח האריחים: הפכו שני אריחים זהים"></div></div>
  <div class="tl-side tl-left">
    <div class="tl-stats" aria-live="polite">
      <div class="tl-stat tl-coins" title="פרוטות">${COIN}<b class="pv">0</b><small>פרוטות</small></div>
      <div class="tl-stat tl-pairs"><b class="pp">0/0</b><small>זוגות</small></div>
      <div class="tl-stat tl-streak" hidden><b class="sv">רצף ×2</b></div>
    </div>
    <div class="tl-tools">
      <button class="tl-btn tl-hint" type="button">רמז <span class="n">2</span></button>
      <button class="tl-btn tl-shuf" type="button">ערבוב</button>
      <button class="tl-btn tl-undo" type="button">↩ ביטול <span class="n">1</span></button>
    </div>
  </div>
  <canvas class="tl-fx" aria-hidden="true"></canvas>`;
  (root || document.body).appendChild(el);
  const $ = (q) => el.querySelector(q);
  const grid = $('.tl-grid'), fx = $('.tl-fx'), g2 = fx.getContext('2d');
  let cols = 4, rows = 3, tiles = [], lastStreak = 0;
  $('.tl-exit').addEventListener('click', () => o.onExit && o.onExit());
  $('.tl-hint').addEventListener('click', () => o.onHint && o.onHint());
  $('.tl-shuf').addEventListener('click', () => o.onShuffle && o.onShuffle());
  $('.tl-undo').addEventListener('click', () => o.onUndo && o.onUndo());
  grid.addEventListener('click', (e) => { const t = e.target.closest('.tl-tile'); if (t && o.onTap) o.onTap(+t.dataset.i); });

  function fit() {
    const rr = el.getBoundingClientRect();
    let W, H;
    if (isLand()) { W = rr.width - 2 * SIDE - 16; H = rr.height - 30; }
    else { const b = $('.tl-board').getBoundingClientRect(); W = b.width - 34; H = b.height - 24; }
    let tw = Math.min((W - 2 * PAD - GAP * (cols - 1)) / cols, ((H - 2 * PAD - GAP * (rows - 1)) / rows) * ASPECT);
    tw = Math.max(36, Math.min(124, Math.floor(tw)));
    const th = Math.floor(tw / ASPECT);
    grid.style.setProperty('--tw', tw + 'px'); grid.style.setProperty('--th', th + 'px');
    grid.style.setProperty('--fs', Math.max(11, Math.min(15, Math.round(tw * 0.17))) + 'px');
    grid.style.gridTemplateColumns = `repeat(${cols}, ${tw}px)`;
    grid.style.width = cols * tw + (cols - 1) * GAP + 2 * PAD + 'px';
    fx.width = Math.round(rr.width * (devicePixelRatio || 1)); fx.height = Math.round(rr.height * (devicePixelRatio || 1));
    fx.style.width = rr.width + 'px'; fx.style.height = rr.height + 'px';
  }
  const onResize = () => fit();
  addEventListener('resize', onResize);

  /* ── particles: gold bursts on a match, fireworks on a win ── */
  const P = []; let raf = 0, fwUntil = 0, fwNext = 0;
  const COLORS = ['#FFE08A', '#FFF3C4', '#E9C765', '#FFFFFF', '#FFD66E'];
  const FW = ['#FFE08A', '#FFF3C4', '#8EC5F2', '#FF8A7A', '#9FD37A', '#FFFFFF', '#E9C765'];
  function burst(x, y, n, spd = 2.6, colors = COLORS, life = 700) {
    for (let q = 0; q < n; q++) {
      const a = Math.random() * Math.PI * 2, v = spd * (0.4 + Math.random() * 0.8);
      P.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, g: 0.05, r: 1.5 + Math.random() * 2.2, c: colors[(Math.random() * colors.length) | 0], t: life * (0.6 + Math.random() * 0.5), T: life, star: Math.random() < 0.25 });
    }
    tick();
  }
  function rocket() {
    const rr = el.getBoundingClientRect();
    const x = rr.width * (0.15 + Math.random() * 0.7), y = rr.height * (0.15 + Math.random() * 0.45);
    burst(x, y, 46 + ((Math.random() * 30) | 0), 3.4, [FW[(Math.random() * FW.length) | 0], '#FFFFFF', '#FFE08A'], 1300);
    burst(x, y, 10, 1, ['#FFFFFF'], 500);
  }
  let lastT = 0;
  function tick() {
    if (raf) return;
    lastT = performance.now();
    const step = (now) => {
      const dt = Math.min(40, now - lastT); lastT = now; const k = dt / 16.7;
      if (now < fwUntil && now >= fwNext) { rocket(); if (Math.random() < 0.4) rocket(); fwNext = now + 260 + Math.random() * 240; }
      const dpr = devicePixelRatio || 1;
      g2.setTransform(dpr, 0, 0, dpr, 0, 0); g2.clearRect(0, 0, fx.width, fx.height);
      for (let i = P.length - 1; i >= 0; i--) {
        const p = P[i];
        p.t -= dt; if (p.t <= 0) { P.splice(i, 1); continue; }
        p.x += p.vx * k; p.y += p.vy * k; p.vy += p.g * k; p.vx *= 0.985;
        const a = Math.min(1, p.t / (p.T * 0.4));
        g2.globalAlpha = a; g2.fillStyle = p.c;
        if (p.star) { g2.beginPath(); const r = p.r * 2.2; g2.moveTo(p.x, p.y - r); g2.quadraticCurveTo(p.x, p.y, p.x + r, p.y); g2.quadraticCurveTo(p.x, p.y, p.x, p.y + r); g2.quadraticCurveTo(p.x, p.y, p.x - r, p.y); g2.quadraticCurveTo(p.x, p.y, p.x, p.y - r); g2.fill(); }
        else { g2.beginPath(); g2.arc(p.x, p.y, p.r, 0, Math.PI * 2); g2.fill(); }
      }
      g2.globalAlpha = 1;
      if (P.length || now < fwUntil) raf = requestAnimationFrame(step); else { raf = 0; g2.clearRect(0, 0, fx.width, fx.height); }
    };
    raf = requestAnimationFrame(step);
  }
  const center = (i) => { const t = tiles[i]; if (!t) return { x: 0, y: 0 }; const r = t.getBoundingClientRect(), rr = el.getBoundingClientRect(); return { x: r.left - rr.left + r.width / 2, y: r.top - rr.top + r.height / 2 }; };
  function pop(x, y, txt, big) { const p = h('div', 'tl-pop' + (big ? ' big' : ''), esc(txt)); p.style.left = x + 'px'; p.style.top = y + 'px'; el.appendChild(p); setTimeout(() => p.remove(), 1200); }
  const bump = (q) => { const e = $(q); e.classList.remove('bump'); void e.offsetWidth; e.classList.add('bump'); };

  const U = {
    el, fit,
    /** a fresh board: the tiles face down */
    board(s) {
      cols = s.cols; rows = s.rows; grid.innerHTML = ''; tiles = [];
      $('.st').textContent = `שלב ${s.level} · ${s.pairs} זוגות`;
      s.tiles.forEach((t, i) => {
        const b = h('button', 'tl-tile'); b.type = 'button'; b.dataset.i = i; b.style.setProperty('--d', ((i * 0.37) % 6).toFixed(2) + 's');
        const name = t.kind === 'name' ? 'name' : 'pic';
        b.innerHTML = `<div class="tl-in"><div class="tl-back">${ROSETTE}</div><div class="tl-face ${name === 'name' ? 'nm' : ''}">${name === 'name' ? ROSETTE : svg(t.pic)}<span class="tl-name">${esc(PIC_HE[t.pic] || t.pic)}</span></div></div>`;
        b.setAttribute('aria-label', `אריח ${i + 1}, הפוך`);
        grid.appendChild(b); tiles.push(b);
      });
      lastStreak = 0; U.clock(0, s.limit);
      fit(); U.sync(s);
    },
    /** the HUD and every tile's face follow the state */
    sync(s) {
      s.tiles.forEach((t, i) => {
        const b = tiles[i]; if (!b) return;
        b.classList.toggle('up', t.up || t.done); b.classList.toggle('done', t.done);
        b.setAttribute('aria-label', t.up || t.done ? `${PIC_HE[t.pic] || t.pic}${t.done ? ', נמצא' : ''}` : `אריח ${i + 1}, הפוך`);
        b.disabled = t.done;
      });
      $('.pp').textContent = `${s.matches}/${s.pairs}`;
      $('.pv').textContent = String(s.perutot);
      const pr = $('.tl-prog'), pct = Math.round((s.matches / s.pairs) * 100);
      pr.querySelector('i').style.width = pct + '%'; pr.setAttribute('aria-valuenow', pct); pr.querySelector('b').textContent = pct >= 100 ? '✓' : '';
      const sk = $('.tl-streak');
      if (s.streak >= 2) { sk.hidden = false; $('.sv').textContent = `רצף ×${s.streak}`; sk.style.setProperty('--sk', Math.min(6, s.streak)); if (s.streak !== lastStreak) { sk.classList.remove('on'); void sk.offsetWidth; sk.classList.add('on'); } }
      else sk.hidden = true;
      lastStreak = s.streak;
      $('.tl-hint .n').textContent = s.hints; $('.tl-hint').disabled = s.hints <= 0 || s.won;
      $('.tl-undo .n').textContent = s.undos; $('.tl-undo').disabled = s.undos <= 0 || !s.last || s.won;
      $('.tl-shuf').disabled = s.won;
    },
    clock(ms, limit) { $('.ck').textContent = fmtTime(Math.max(0, limit - ms)); },
    /** the gold burst of a match: the two tiles rise, sparkles, "+N" floats toward the coins; the streak escalates */
    match(a, b, gainN, streak) {
      for (const i of [a, b]) { const t = tiles[i]; if (!t) continue; t.classList.remove('ok'); void t.offsetWidth; t.classList.add('ok'); setTimeout(() => t.classList.remove('ok'), 800); }
      const ca = center(a), cb = center(b), n = 16 + Math.min(40, streak * 8);
      burst(ca.x, ca.y, n, 2.4 + streak * 0.3); burst(cb.x, cb.y, n, 2.4 + streak * 0.3);
      pop((ca.x + cb.x) / 2, (ca.y + cb.y) / 2 - 10, `+${gainN}`, streak >= 2);
      if (streak >= 2) { const r = $('.tl-streak').getBoundingClientRect(), rr = el.getBoundingClientRect(); burst(r.left - rr.left + r.width / 2, r.top - rr.top + r.height / 2, 10 + streak * 4, 2); }
      bump('.tl-coins'); bump('.tl-pairs');
    },
    miss(a, b) { for (const i of [a, b]) { const t = tiles[i]; if (!t) continue; t.classList.remove('bad'); void t.offsetWidth; t.classList.add('bad'); setTimeout(() => t.classList.remove('bad'), 500); } },
    /** two tiles glow for a moment (a hint, or the undone pair's peek) */
    lit(pair, ms = 1000) { for (const i of pair) { const t = tiles[i]; if (t) t.classList.add('lit'); } return new Promise((r) => setTimeout(() => { for (const i of pair) { const t = tiles[i]; if (t) t.classList.remove('lit'); } r(); }, ms)); },
    /** a peek: the pair turns face up for a moment, then back (no engine change) */
    peek(pair, ms = 900) { for (const i of pair) { const t = tiles[i]; if (t) t.classList.add('up'); } return new Promise((r) => setTimeout(() => { for (const i of pair) { const t = tiles[i]; if (t && !t.classList.contains('done')) t.classList.remove('up'); } r(); }, ms)); },
    /** the shuffle: every face-down tile dips and comes back (the engine re-deals their places) */
    shuffleFx() { tiles.forEach((t, i) => { if (t.classList.contains('done')) return; t.style.transition = 'transform .3s ease-in-out'; t.style.transform = 'scale(.6) rotate(' + (i % 2 ? 8 : -8) + 'deg)'; setTimeout(() => { t.style.transform = ''; }, 300); setTimeout(() => { t.style.transition = ''; }, 650); }); return new Promise((r) => setTimeout(r, 320)); },
    fireworks(ms = 2600) { fwUntil = performance.now() + ms; fwNext = 0; tick(); },
    sparkleCoins() { const r = $('.tl-coins').getBoundingClientRect(), rr = el.getBoundingClientRect(); burst(r.left - rr.left + r.width / 2, r.top - rr.top + r.height / 2, 24, 2.2); },
    card(kind, d = {}) {
      return new Promise((resolve) => {
        const w = h('div', 'tl-wrap'), c = h('div', 'tl-card');
        c.setAttribute('role', 'alertdialog');
        w.appendChild(c); el.appendChild(w);
        const done = (v) => { w.remove(); resolve(v); };
        const btn = (cls, txt, v) => { const b = h('button', cls, esc(txt)); b.type = 'button'; b.addEventListener('click', () => done(v)); c.appendChild(b); return b; };
        const stat = (txt, icon) => `<span class="tl-stat">${icon || ''}<b>${esc(txt)}</b></span>`;
        if (kind === 'start') {
          c.innerHTML = `<h2>זיכרון המקדש · שלב ${d.level}</h2><p>מצאו את כל הזוגות: <b>${d.pairs}</b> זוגות על לוח <span dir="ltr">${d.cols}×${d.rows}</span>.</p>
            <p>הופכים שני אריחים; זוג זהה נשאר פתוח. יש זמן בנחת: <b>${fmtTime(d.limit)}</b>.</p>`;
          if (d.conn) c.appendChild(h('p', 'tl-tip', '<b>מהשלב הזה:</b> גם תמונה והכרטיס עם שמה הם זוג.'));
          if (d.level === 1) c.appendChild(h('p', 'tl-tip', 'רמז מאיר זוג · ערבוב מסדר מחדש · ביטול מוחק טעות אחת. הכול בחינם.'));
          c.appendChild(h('p', null, `<span class="tl-tag">טיוטה</span> כלי המקדש ודבריו — המחשה`));
          const b = btn('tl-cta', 'התחל', 'go'); setTimeout(() => b.focus && b.focus(), 50);
          btn('tl-sec', 'חזרה', 'quit');
        } else if (kind === 'won') {
          c.innerHTML = `<h2>${d.stars === 3 ? 'מושלם!' : 'כל הכבוד!'}</h2><div class="tl-stars3">${[1, 2, 3].map((q) => `<span class="${q <= d.stars ? 'on' : ''}" style="animation-delay:${0.12 * q}s">★</span>`).join('')}</div>
            <div class="tl-sum">${stat(`${d.pairs} זוגות`)}${stat(`${d.misses} טעויות`)}${stat(fmtTime(d.ms))}${d.bestStreak >= 2 ? stat(`רצף ×${d.bestStreak}`) : ''}</div>
            <div class="tl-coinbig">${COIN}<span>+${d.perutot} פרוטות</span></div>
            <p>${d.total > d.perutot ? `סך הכול הסיבוב הזה: <b>${d.total}</b> פרוטות · ` : ''}${d.best ? 'שיא חדש בשלב!' : ''}</p>`;
          const main = btn('tl-cta', d.next ? `עוד סיבוב (שלב ${d.next})` : 'עוד סיבוב', 'again');
          btn('tl-sec', 'חזרה', 'done');
          setTimeout(() => main.focus && main.focus(), 50);
        } else if (kind === 'lost') {
          c.innerHTML = `<h2>נגמר הזמן — נסו שוב</h2><p>מצאתם <b>${d.matches}</b> מתוך <b>${d.pairs}</b> זוגות. הפרוטות שנאספו נשארות שלכם.</p>
            <div class="tl-coinbig">${COIN}<span>+${d.perutot} פרוטות</span></div><p>ניסיון נוסף תמיד בחינם.</p>`;
          const b = btn('tl-cta', 'נסו שוב', 'retry'); btn('tl-sec', 'חזרה', 'done');
          setTimeout(() => b.focus && b.focus(), 50);
        } else if (kind === 'exit') {
          c.innerHTML = '<h2>לצאת מהמשחק?</h2><p>הפרוטות שנאספו עד עכשיו נשארות שלכם.</p>';
          btn('tl-cta', 'להמשיך לשחק', 'stay'); btn('tl-sec', 'לצאת', 'quit');
        } else { c.innerHTML = `<p>${esc(d.text || '')}</p>`; btn('tl-cta', 'המשך', 'ok'); }
      });
    },
    destroy() { removeEventListener('resize', onResize); if (raf) cancelAnimationFrame(raf); raf = 0; P.length = 0; el.remove(); },
  };
  fit();
  return U;
}
