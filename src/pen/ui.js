/* ─────────────────────────────────────────────────────────────────────────────
 * pen/ui.js: the overlay of "הוצאת הטלה מהדיר" — the pen (an SVG floor and fence), the pieces as draggable tokens, the HUD
 * (level, מינימום, the move counter, פרוטות), the tool buttons (רמז · ↩ ביטול · מהתחלה), the cards (start, won, exit) and the
 * particle layer (gold burst, fireworks). DOM only; RTL; 44-px targets; pointer events; all classes pn-*.
 *   const U = createUI(root, { onMove(id, delta), onTapLamb(), onBlocked(id), onHint(), onUndo(), onReset(), onExit() });
 *   U.board(state) · U.sync(state, animate) · U.lit(id, delta, ms) · U.walkOut() → promise · U.shake(id) ·
 *   await U.card(kind, data) → choice · U.fireworks(ms) · U.sparkleCoins() · U.destroy()
 * Every text that states a fact is a draft (טיוטה) with a note in docs/PEN35.md.
 * ──────────────────────────────────────────────────────────────────────────── */
import { DEFS, pieceSvg, pen, COIN, CELL, M, ML } from './art.js';
import { KIND_HE } from './engine.js';

export const LAND = '(orientation:landscape) and (max-height:560px) and (min-width:560px)';
const SIDE = 144;      // each side column in landscape (px)
const CSS = `
.pn{position:fixed;inset:0;z-index:200;direction:rtl;display:flex;flex-direction:column;align-items:center;overflow:hidden;
 font-family:"Heebo",system-ui,sans-serif;color:#3A2410;-webkit-user-select:none;user-select:none;touch-action:none;
 background:radial-gradient(120% 70% at 50% 30%,rgba(255,250,236,.55),rgba(255,240,210,0) 60%),linear-gradient(180deg,#EFE1C6 0%,#E3CDA6 55%,#CDB088 100%);animation:pnin .35s ease-out}
.pn::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.35;
 background:repeating-linear-gradient(135deg,rgba(255,255,255,.12) 0 2px,transparent 2px 7px),repeating-linear-gradient(45deg,rgba(90,54,24,.05) 0 1px,transparent 1px 9px)}
@keyframes pnin{from{opacity:0}to{opacity:1}}
.pn-side{position:relative;z-index:2;width:100%;max-width:520px;box-sizing:border-box;padding:6px 10px}
.pn-right{padding-top:calc(env(safe-area-inset-top,0px) + 8px)}
.pn-left{padding-bottom:calc(env(safe-area-inset-bottom,0px) + 8px)}
.pn-row{display:flex;align-items:center;gap:8px}
.pn-btn{min-width:44px;min-height:44px;border-radius:14px;border:1px solid rgba(255,236,190,.7);background:linear-gradient(#A8804F,#6E4A26);
 color:#FFF4DC;font:700 15px "Heebo",system-ui,sans-serif;padding:0 12px;box-shadow:0 3px 0 #4A2E12,0 4px 10px rgba(40,20,0,.25),inset 0 1px 0 rgba(255,255,255,.35);
 cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;display:inline-flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap}
.pn-btn:active{transform:translateY(2px);box-shadow:0 1px 0 #4A2E12}
.pn-btn[disabled]{opacity:.45;box-shadow:none;transform:none}
.pn-btn .n{display:inline-block;min-width:20px;height:20px;border-radius:10px;background:#FFE08A;color:#4A2E10;font:800 12px/20px "Heebo",sans-serif;text-align:center;padding:0 5px}
.pn-btn:focus-visible,.pn-cta:focus-visible,.pn-sec:focus-visible,.pn-piece:focus-visible{outline:3px solid #2A4A7A;outline-offset:2px}
.pn-exit{min-width:44px;padding:0;font-size:20px;line-height:1}
.pn-title{flex:1;text-align:center;font:900 19px/1.15 "Frank Ruhl Libre","Heebo",serif;color:#4A2E10}
.pn-title small{display:block;font:600 12.5px "Heebo",sans-serif;color:#6E4A26}
.pn-stats{display:flex;gap:8px;justify-content:center;align-items:stretch;flex-wrap:wrap;margin-top:8px}
.pn-stat{display:inline-flex;align-items:center;gap:6px;background:rgba(255,250,236,.75);border:1.5px solid #D9B45A;border-radius:999px;padding:4px 12px;
 box-shadow:0 2px 0 rgba(120,80,30,.25),inset 0 1px 0 #fff;font:800 16px "Heebo",sans-serif;color:#3A2410;min-height:36px;box-sizing:border-box}
.pn-stat small{font:600 11.5px "Heebo",sans-serif;color:#6E4A26}
.pn-stat svg{width:24px;height:24px}
.pn-stat.bump{animation:pnbump .3s ease-out}
@keyframes pnbump{40%{transform:scale(1.16)}}
.pn-min{font-size:14px;color:#5A3618;background:rgba(255,250,236,.5);border-style:dashed}
.pn-tools{display:flex;gap:8px;justify-content:center;margin-top:8px;flex-wrap:wrap}
.pn-board{position:relative;z-index:1;flex:1;min-height:0;width:100%;max-width:560px;display:flex;align-items:center;justify-content:center;box-sizing:border-box;padding:4px 8px}
.pn-pen{position:relative;width:var(--pw);height:var(--ph);filter:drop-shadow(0 10px 18px rgba(40,20,0,.35))}
.pn-bg{position:absolute;inset:0;width:100%;height:100%;display:block}
.pn-cells{position:absolute;left:var(--cx);top:var(--cy);width:calc(var(--c) * 6);height:calc(var(--c) * 6)}
.pn-piece{position:absolute;left:0;top:0;width:var(--w);height:var(--h);margin:0;padding:0;border:0;background:none;cursor:grab;touch-action:none;
 -webkit-tap-highlight-color:transparent;will-change:transform;transition:transform .22s cubic-bezier(.3,1.1,.5,1);z-index:2}
.pn-piece.drag{transition:none;z-index:5;cursor:grabbing}
.pn-piece.drag svg{filter:drop-shadow(0 6px 6px rgba(40,20,0,.35)) brightness(1.04)}
.pn-piece svg{position:absolute;left:var(--sx);top:var(--sy);width:var(--sw);height:var(--sh);transform:rotate(var(--rot,0deg));transform-origin:center;display:block;
 filter:drop-shadow(0 2px 2px rgba(40,20,0,.25));transition:filter .2s}
.pn-piece.lamb{z-index:3}
.pn-piece.lit{z-index:4}
.pn-piece.lit::after{content:"";position:absolute;inset:3px;border-radius:999px;box-shadow:0 0 0 3px #FFE08A,0 0 18px 6px rgba(255,214,110,.9),inset 0 0 12px rgba(255,236,170,.8);animation:pnlit .5s ease-in-out infinite alternate;pointer-events:none}
@keyframes pnlit{from{opacity:.55;transform:scale(.98)}to{opacity:1;transform:scale(1.03)}}
.pn-piece.bad{animation:pnshake .4s ease-in-out}
@keyframes pnshake{20%{margin-left:-3px}50%{margin-left:3px}80%{margin-left:-2px}}
.pn-piece.out{transition:transform .8s cubic-bezier(.4,0,.6,1);z-index:6}
.pn-piece.out svg{animation:pntrot .2s ease-in-out 4 alternate}
@keyframes pntrot{from{transform:rotate(var(--rot,0deg)) translateY(0)}to{transform:rotate(var(--rot,0deg)) translateY(-3px) rotate(-2deg)}}
.pn-arrow{position:absolute;z-index:7;pointer-events:none;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;background:#FFE08A;color:#4A2E10;
 font:900 26px/40px "Heebo",sans-serif;text-align:center;box-shadow:0 2px 0 #9A5E0E,0 0 14px rgba(255,214,110,.9);animation:pnarrow .6s ease-in-out infinite alternate;direction:ltr}
@keyframes pnarrow{from{transform:translate(0,0) scale(1)}to{transform:translate(var(--ax,0px),var(--ay,0px)) scale(1.1)}}
.pn-fx{position:absolute;left:0;top:0;pointer-events:none;z-index:8}
.pn-pop{position:absolute;z-index:6;pointer-events:none;font:900 19px "Heebo",sans-serif;color:#FFF3C4;text-shadow:0 2px 0 #7A4A00,0 0 12px #FFD66E,0 0 2px #7A4A00;
 transform:translate(-50%,-50%);animation:pnpop 1.1s ease-out forwards;white-space:nowrap;direction:ltr}
@keyframes pnpop{0%{opacity:0;transform:translate(-50%,-30%) scale(.6)}20%{opacity:1;transform:translate(-50%,-55%) scale(1.15)}100%{opacity:0;transform:translate(-50%,-150%) scale(1)}}
.pn-wrap{position:absolute;inset:0;z-index:9;display:flex;align-items:center;justify-content:center;background:rgba(40,24,8,.5);padding:14px;box-sizing:border-box;animation:pnin .25s ease-out}
.pn-card{width:100%;max-width:370px;max-height:100%;overflow:auto;box-sizing:border-box;background:linear-gradient(#FFF8E8,#F0DBB0);color:#3A220C;border-radius:22px;
 padding:16px 16px 14px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.5),inset 0 0 0 2px #D8AB58;touch-action:pan-y;position:relative}
.pn-card h2{font:900 26px/1.2 "Frank Ruhl Libre","Heebo",serif;margin:2px 0 6px;color:#5A300A}
.pn-card p{font:500 16px/1.45 "Heebo",sans-serif;margin:6px 0}
.pn-card .pn-stat{margin:2px 3px}
.pn-cta{display:block;width:100%;min-height:52px;border:0;border-radius:16px;background:linear-gradient(#FFD569,#DF951A);color:#452300;font:900 20px "Heebo",sans-serif;
 box-shadow:0 4px 0 #94580C;margin-top:12px;cursor:pointer;touch-action:manipulation}
.pn-sec{display:block;width:100%;min-height:46px;border-radius:14px;border:2px solid #C8964A;background:transparent;color:#5A300A;font:800 16px "Heebo",sans-serif;margin-top:8px;cursor:pointer;touch-action:manipulation}
.pn-stars3{font:44px/1.1 serif;letter-spacing:4px;margin:2px 0;direction:ltr}
.pn-stars3 span{color:rgba(90,48,10,.2);display:inline-block}
.pn-stars3 span.on{color:#E5A11C;text-shadow:0 2px 0 #9A5E0E,0 0 12px #FFE08A;animation:pnstar .45s ease-out both}
@keyframes pnstar{0%{transform:scale(0) rotate(-40deg)}70%{transform:scale(1.25)}100%{transform:scale(1)}}
.pn-tag{display:inline-block;vertical-align:middle;background:#FCE3AA;color:#6E4200;border-radius:7px;padding:0 6px;font:700 11px/1.6 "Heebo",sans-serif;margin-inline-start:4px}
.pn-sum{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:6px 0}
.pn-sum .pn-stat{font-size:15px}
.pn-coinbig{display:inline-flex;align-items:center;gap:8px;font:900 24px "Heebo",sans-serif;color:#7A4A00;margin:4px 0}
.pn-coinbig svg{width:34px;height:34px}
.pn-tip{font-size:13.5px;color:#4A3418;background:#FFF1C9;border-radius:10px;padding:5px 8px}
.pn-card .pn-lambpic{width:120px;height:60px;display:block;margin:0 auto}
@media (prefers-reduced-motion:reduce){.pn,.pn-wrap,.pn-piece.lit::after,.pn-piece.bad,.pn-piece.out svg,.pn-arrow,.pn-stat.bump,.pn-stars3 span.on{animation:none}.pn-piece{transition:none}}
@media ${LAND}{
 .pn{display:grid;grid-template-columns:minmax(${SIDE}px,1fr) auto minmax(${SIDE}px,1fr);grid-template-rows:1fr;align-items:center;
  padding:0 env(safe-area-inset-right,0px) 0 env(safe-area-inset-left,0px)}
 .pn-side{max-width:none;padding:6px 10px;align-self:center}
 .pn-right{grid-column:1;padding-top:6px}
 .pn-board{grid-column:2;max-width:none;padding:4px 2px;height:100%}
 .pn-left{grid-column:3;padding-bottom:6px}
 .pn-title{font-size:17px}
 .pn-stats{flex-direction:column;align-items:center;gap:6px}
 .pn-tools{flex-direction:column;align-items:center;margin-top:10px}
 .pn-tools .pn-btn{width:128px;max-width:100%}
 .pn-card{max-width:540px;padding:8px 16px 8px;border-radius:18px;display:flex;flex-wrap:wrap;align-content:flex-start;column-gap:8px}
 .pn-card>*{flex:1 0 100%;min-width:0;box-sizing:border-box}
 .pn-card>.pn-cta,.pn-card>.pn-sec{flex:1 1 40%;width:auto}
 .pn-card h2{font-size:22px;margin:0 0 2px}
 .pn-card p{font-size:14.5px;line-height:1.35;margin:3px 0}
 .pn-cta{min-height:48px;font-size:18px;margin-top:8px}
 .pn-sec{min-height:44px;margin-top:6px}
 .pn-stars3{font-size:30px;margin:0}
 .pn-card .pn-lambpic{width:90px;height:45px}
}
@media ${LAND} and (max-height:330px){.pn-card .pn-lambpic{display:none}.pn-card{max-height:100%;overflow-y:auto}}`;   // ── fable32 (build 34) ── (on a 296-px-high phone the start card ran 20 px over the screen and cut its title "הוצאת הטלה מהדיר · שלב N": the lamb's small picture goes, and the card scrolls if it still would not fit) ── /fable32 ──
let cssDone = false;
function css() {
  if (cssDone || !globalThis.document) return;
  cssDone = true;
  const st = document.createElement('style'); st.id = 'pn-css'; st.textContent = CSS; document.head.appendChild(st);
}
const isLand = () => { try { return !!(globalThis.matchMedia && globalThis.matchMedia(LAND).matches); } catch (e) { return false; } };
const esc = (x) => String(x).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const fmtTime = (ms) => { const t = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };

export function createUI(root, o = {}) {
  css();
  const el = h('div', 'pn');
  el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'הוצאת הטלה מהדיר');
  el.innerHTML = `${DEFS}
  <div class="pn-side pn-right">
    <div class="pn-row"><button class="pn-btn pn-exit" type="button" aria-label="יציאה">✕</button>
      <div class="pn-title"><span class="t">הוצאת הטלה מהדיר</span><small class="st"></small></div></div>
    <div class="pn-stats" aria-live="polite">
      <div class="pn-stat pn-moves"><b class="mv">0</b><small>מהלכים</small></div>
      <div class="pn-stat pn-min"><small>מינימום</small><b class="mn">0</b></div>
    </div>
  </div>
  <div class="pn-board"><div class="pn-pen" role="group" aria-label="הדיר: גררו חיה או חפץ לאורך השורה או הטור"><div class="pn-cells"></div></div></div>
  <div class="pn-side pn-left">
    <div class="pn-stats">
      <div class="pn-stat pn-coins" title="פרוטות">${COIN}<b class="pv">0</b><small>פרוטות</small></div>
    </div>
    <div class="pn-tools">
      <button class="pn-btn pn-hint" type="button">רמז <span class="n">2</span></button>
      <button class="pn-btn pn-undo" type="button">↩ ביטול</button>
      <button class="pn-btn pn-reset" type="button">מהתחלה</button>
    </div>
  </div>
  <canvas class="pn-fx" aria-hidden="true"></canvas>`;
  (root || document.body).appendChild(el);
  const $ = (q) => el.querySelector(q);
  const penEl = $('.pn-pen'), cellsEl = $('.pn-cells'), fx = $('.pn-fx'), g2 = fx.getContext('2d');
  let W = 6, H = 6, exitRow = 2, cell = 50, VW = 0, VH = 0, pieces = new Map(), cur = null, drag = null, perutot = 0;
  $('.pn-exit').addEventListener('click', () => o.onExit && o.onExit());
  $('.pn-hint').addEventListener('click', () => o.onHint && o.onHint());
  $('.pn-undo').addEventListener('click', () => o.onUndo && o.onUndo());
  $('.pn-reset').addEventListener('click', () => o.onReset && o.onReset());

  function fit() {
    const rr = el.getBoundingClientRect();
    let aw, ah;
    if (isLand()) { aw = rr.width - 2 * SIDE - 8; ah = rr.height - 10; }
    else { const b = $('.pn-board').getBoundingClientRect(); aw = b.width - 16; ah = b.height - 12; }
    const k = Math.max(0.3, Math.min(aw / VW, ah / VH));
    cell = Math.floor(CELL * k);
    const pw = Math.round(VW * k), ph = Math.round(VH * k);
    penEl.style.setProperty('--pw', pw + 'px'); penEl.style.setProperty('--ph', ph + 'px');
    penEl.style.setProperty('--c', cell + 'px'); penEl.style.setProperty('--cx', Math.round(ML * k) + 'px'); penEl.style.setProperty('--cy', Math.round(M * k) + 'px');
    for (const [, p] of pieces) size(p);
    if (cur) place(cur, false);
    fx.width = Math.round(rr.width * (devicePixelRatio || 1)); fx.height = Math.round(rr.height * (devicePixelRatio || 1));
    fx.style.width = rr.width + 'px'; fx.style.height = rr.height + 'px';
  }
  const onResize = () => fit();
  addEventListener('resize', onResize);
  function size(p) {
    const L = p.len * cell, vert = p.dir === 'v';
    p.el.style.setProperty('--w', (vert ? cell : L) + 'px'); p.el.style.setProperty('--h', (vert ? L : cell) + 'px');
    // the drawing is horizontal (face at the left); a vertical piece turns it 90° so the face looks up
    p.el.style.setProperty('--sw', L + 'px'); p.el.style.setProperty('--sh', cell + 'px');
    p.el.style.setProperty('--sx', (vert ? (cell - L) / 2 : 0) + 'px'); p.el.style.setProperty('--sy', (vert ? (L - cell) / 2 : 0) + 'px');
    p.el.style.setProperty('--rot', vert ? '90deg' : '0deg');
  }
  const xy = (q) => ({ x: q.x * cell, y: q.y * cell });
  function place(s, animate = true) {
    for (const q of s.pieces) {
      const p = pieces.get(q.id); if (!p || drag && drag.id === q.id) continue;
      p.x = q.x; p.y = q.y;
      if (!animate) p.el.style.transition = 'none';
      p.el.style.transform = `translate(${q.x * cell}px,${q.y * cell}px)`;
      if (!animate) { void p.el.offsetWidth; p.el.style.transition = ''; }
    }
  }

  /* ── dragging a piece along its axis: pointer events, snap to cells, never through another piece ── */
  function down(e) {
    if (drag || !cur || cur.won || !o.canDrag || !o.canDrag()) return;
    const pe = e.currentTarget, id = pe.dataset.id, p = pieces.get(id); if (!p) return;
    const r = o.range ? o.range(id) : { min: 0, max: 0 };
    drag = { id, p, px: e.clientX, py: e.clientY, t: Date.now(), min: r.min * cell, max: r.max * cell, d: 0, raw: 0, moved: false };
    try { pe.setPointerCapture(e.pointerId); } catch (e2) { /* */ }
    pe.classList.add('drag');
    e.preventDefault();
  }
  function moveP(e) {
    if (!drag || drag.p.el !== e.currentTarget) return;
    const horiz = drag.p.dir === 'h';
    const raw = horiz ? e.clientX - drag.px : e.clientY - drag.py;
    const other = horiz ? e.clientY - drag.py : e.clientX - drag.px;
    if (Math.abs(raw) > 4 || Math.abs(other) > 4) drag.moved = true;
    drag.raw = raw; drag.d = Math.max(drag.min, Math.min(drag.max, raw));
    const { x, y } = xy(drag.p);
    drag.p.el.style.transform = horiz ? `translate(${x + drag.d}px,${y}px)` : `translate(${x}px,${y + drag.d}px)`;
    e.preventDefault();
  }
  function up(e) {
    if (!drag || drag.p.el !== e.currentTarget) return;
    const d = drag, pe = d.p.el; drag = null;
    pe.classList.remove('drag');
    try { pe.releasePointerCapture(e.pointerId); } catch (e2) { /* */ }
    const delta = Math.round(d.d / cell);
    const tap = !d.moved && Date.now() - d.t < 400;
    if (tap && d.p.kind === 'lamb') { place(cur); if (o.onTapLamb) o.onTapLamb(); return; }
    if (delta !== 0 && o.onMove && o.onMove(d.id, delta)) return;   // the engine moved it (the state's place() follows)
    place(cur);   // snap back
    if (!tap && Math.abs(d.raw) > cell * 0.35 && Math.abs(d.raw) > Math.abs(d.d) + cell * 0.3 && o.onBlocked) o.onBlocked(d.id);
  }
  function cancel(e) { if (!drag || drag.p.el !== e.currentTarget) return; drag.p.el.classList.remove('drag'); drag = null; place(cur); }

  /* ── particles: a gold burst, fireworks on the win ── */
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
  const centerOf = (id) => { const p = pieces.get(id); if (!p) return { x: 0, y: 0 }; const r = p.el.getBoundingClientRect(), rr = el.getBoundingClientRect(); return { x: r.left - rr.left + r.width / 2, y: r.top - rr.top + r.height / 2 }; };
  function pop(x, y, txt, big) { const p = h('div', 'pn-pop' + (big ? ' big' : ''), esc(txt)); p.style.left = x + 'px'; p.style.top = y + 'px'; el.appendChild(p); setTimeout(() => p.remove(), 1200); }
  const bump = (q) => { const e = $(q); e.classList.remove('bump'); void e.offsetWidth; e.classList.add('bump'); };

  const U = {
    el, fit, cellPx: () => cell,
    /** a fresh pen for a state */
    board(s) {
      W = s.w; H = s.h; exitRow = s.exitRow; cur = s; drag = null;
      const bg = pen(W, H, exitRow); VW = bg.VW; VH = bg.VH;
      const old = penEl.querySelector('.pn-bg'); if (old) old.remove();
      penEl.insertAdjacentHTML('afterbegin', bg.svg);
      cellsEl.innerHTML = ''; pieces = new Map();
      for (const q of s.pieces) {
        const d = h('div', 'pn-piece ' + q.kind + (q.kind === 'lamb' ? ' lamb' : ''), pieceSvg(q.kind, q.len));
        d.dataset.id = q.id; d.setAttribute('role', 'button'); d.tabIndex = 0;
        d.setAttribute('aria-label', `${KIND_HE[q.kind] || q.kind}, ${q.dir === 'h' ? 'לאורך השורה' : 'לאורך הטור'}`);
        d.addEventListener('pointerdown', down); d.addEventListener('pointermove', moveP); d.addEventListener('pointerup', up); d.addEventListener('pointercancel', cancel);
        cellsEl.appendChild(d);
        pieces.set(q.id, { id: q.id, kind: q.kind, len: q.len, dir: q.dir, x: q.x, y: q.y, el: d });
      }
      $('.st').textContent = `שלב ${s.level || 1}${s.name ? ' · ' + s.name : ''}`;
      $('.mn').textContent = s.optimal;
      fit(); place(s, false); U.sync(s);
    },
    /** the HUD and every piece's place follow the state */
    sync(s, animate = true) {
      cur = s;
      place(s, animate);
      $('.mv').textContent = String(s.moves);
      $('.pv').textContent = String(perutot);
      $('.pn-hint .n').textContent = s.hints; $('.pn-hint').disabled = s.hints <= 0 || s.won;
      $('.pn-undo').disabled = !s.hist.length || s.won;
      $('.pn-reset').disabled = !s.hist.length || s.won;
    },
    coins(n) { perutot = n; $('.pv').textContent = String(n); },
    /** the hint: the piece glows and an arrow bobs the way it should go */
    lit(id, delta, ms = 1400) {
      const p = pieces.get(id); if (!p) return Promise.resolve();
      p.el.classList.add('lit');
      const horiz = p.dir === 'h', back = delta < 0;
      const a = h('div', 'pn-arrow', horiz ? (back ? '←' : '→') : (back ? '↑' : '↓'));
      const { x, y } = xy(p), L = p.len * cell;
      a.style.left = (horiz ? x + (back ? 0 : L) : x + cell / 2) + 'px'; a.style.top = (horiz ? y + cell / 2 : y + (back ? 0 : L)) + 'px';
      a.style.setProperty('--ax', horiz ? (back ? '-10px' : '10px') : '0px'); a.style.setProperty('--ay', horiz ? '0px' : (back ? '-10px' : '10px'));
      cellsEl.appendChild(a);
      return new Promise((r) => setTimeout(() => { p.el.classList.remove('lit'); a.remove(); r(); }, ms));
    },
    /** a nudge that did not go: a short shake */
    shake(id) { const p = pieces.get(id); if (!p) return; p.el.classList.remove('bad'); void p.el.offsetWidth; p.el.classList.add('bad'); setTimeout(() => p.el.classList.remove('bad'), 450); },
    /** the lamb trots out through the gate (~0.8 s), a gold burst on the way; the pieces no longer take drags */
    walkOut() {
      const p = pieces.get(cur && cur.pieces.find((q) => q.kind === 'lamb').id); if (!p) return Promise.resolve();
      const c = centerOf(p.id);
      burst(c.x, c.y, 26, 2.6);
      p.el.classList.add('out');
      void p.el.offsetWidth;
      p.el.style.transform = `translate(${-(p.len + 1.4) * cell}px,${p.y * cell}px)`;
      return new Promise((r) => setTimeout(() => { const c2 = centerOf(p.id); burst(c2.x, c2.y, 36, 3); bump('.pn-moves'); r(); }, 800));
    },
    popAt(id, txt) { const c = centerOf(id); pop(c.x, c.y - 10, txt, true); },
    fireworks(ms = 2600) { fwUntil = performance.now() + ms; fwNext = 0; tick(); },
    sparkleCoins() { const r = $('.pn-coins').getBoundingClientRect(), rr = el.getBoundingClientRect(); burst(r.left - rr.left + r.width / 2, r.top - rr.top + r.height / 2, 24, 2.2); bump('.pn-coins'); },
    card(kind, d = {}) {
      return new Promise((resolve) => {
        const w = h('div', 'pn-wrap'), c = h('div', 'pn-card');
        c.setAttribute('role', 'alertdialog');
        w.appendChild(c); el.appendChild(w);
        const done = (v) => { w.remove(); resolve(v); };
        const btn = (cls, txt, v) => { const b = h('button', cls, esc(txt)); b.type = 'button'; b.addEventListener('click', () => done(v)); c.appendChild(b); return b; };
        const stat = (txt) => `<span class="pn-stat"><b>${esc(txt)}</b></span>`;
        if (kind === 'start') {
          c.innerHTML = `<h2>הוצאת הטלה מהדיר · שלב ${d.level}</h2>${pieceSvg('lamb', 2, 'pn-lambpic')}
            <p>הטלה צריך לצאת מהדיר דרך הפתח שבגדר. גררו את החיות והחפצים לאורך השורה או הטור שלהם ופנו לו דרך.</p>
            <p>פותרים ב־<b>${d.optimal}</b> מהלכים לפחות. בלי שעון, בלי לחץ.</p>`;
          if (d.level === 1) c.appendChild(h('p', 'pn-tip', 'נגיעה בטלה כשהדרך פנויה — והוא יוצא. רמז מאיר את המהלך הבא · ביטול מחזיר מהלך · מהתחלה מסדר מחדש. הכול בחינם.'));
          c.appendChild(h('p', null, `<span class="pn-tag">טיוטה · המחשה</span> דיר הטלאים של עזרת המקדש — ציור בלבד`));
          const b = btn('pn-cta', 'התחל', 'go'); setTimeout(() => b.focus && b.focus(), 50);
          btn('pn-sec', 'חזרה', 'quit');
        } else if (kind === 'won') {
          c.innerHTML = `<h2>${d.stars === 3 ? 'מושלם! הטלה יצא' : 'הטלה יצא!'}</h2><div class="pn-stars3">${[1, 2, 3].map((q) => `<span class="${q <= d.stars ? 'on' : ''}" style="animation-delay:${0.12 * q}s">★</span>`).join('')}</div>
            <div class="pn-sum">${stat(`${d.moves} מהלכים`)}${stat(`מינימום ${d.optimal}`)}${stat(fmtTime(d.ms))}</div>
            <div class="pn-coinbig">${COIN}<span>+${d.perutot} פרוטות</span></div>
            <p>${d.total > d.perutot ? `סך הכול הסיבוב הזה: <b>${d.total}</b> פרוטות · ` : ''}${d.best ? 'שיא חדש בשלב!' : (d.stars < 3 ? `ב־${d.optimal + 2} מהלכים או פחות — שלושה כוכבים.` : '')}</p>`;
          const main = btn('pn-cta', d.next ? `עוד דיר (שלב ${d.next})` : 'עוד דיר', 'again');
          btn('pn-sec', 'חזרה', 'done');
          setTimeout(() => main.focus && main.focus(), 50);
        } else if (kind === 'exit') {
          c.innerHTML = '<h2>לצאת מהדיר?</h2><p>הפרוטות שנאספו עד עכשיו נשארות שלכם. אפשר לחזור בכל עת.</p>';
          btn('pn-cta', 'להמשיך לשחק', 'stay'); btn('pn-sec', 'לצאת', 'quit');
        } else { c.innerHTML = `<p>${esc(d.text || '')}</p>`; btn('pn-cta', 'המשך', 'ok'); }
      });
    },
    destroy() { removeEventListener('resize', onResize); if (raf) cancelAnimationFrame(raf); raf = 0; P.length = 0; el.remove(); },
  };
  VW = ML + 6 * CELL + M; VH = M + 6 * CELL + M;
  fit();
  return U;
}
