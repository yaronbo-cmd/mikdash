/* ─────────────────────────────────────────────────────────────────────────────
 * juice.js — JUICE18 (wave 18, docs/WAVE18-BRIEF.md contracts 1 and 3): every visual answer to a touch on material and to a
 * result, measured on the Brawl Stars recordings (bus/JUICE18.md, the study's table) — the technique, never their art.
 *   const J = createJuice18({ ui, sfx, haptic, stages: () => S, view, G: () => G, persist, emit, twin: () => TW });
 *   J.hit(kind, { at, text, perfect, combo, craft, quality, grade })   // kind 'rock' | 'strike' | 'craft' | 'pick' (twin.js)
 *   J.result({ craft, stars, coins, mats, at, fly })  → Promise          // the stars pop one by one; the mats fly to their chips
 *   J.big(kind, { title, sub, cheer })                → Promise          // a course's / a stage's end: 3.2–4.2 s, a tap skips it
 *   J.fly(key, n, from)                                                  // one reward flies to ui.counter(key), then ui.bump
 * hook19 (wave 19, contract 5): a scoring act's number IS its master-score points (10 · 20 · 40 · 50: d.pts, else d.act 'ok'|'good'|'gold', else its
 *   grade); ONE flight lands in the score capsule (`ui.counter('score')`) and the craft's xp rises by 1 at the same landing. d.pts = 0: no score.
 *   J.event(type, d) · J.stats() · J.show(craft) · J.destroy() · J.xp (craftxp.js)
 * The numbers (60 fps frames): the "+1" is born at 50 % → 118 % at f3–4 → 100 % by f10 while it rises ≈ 3 % of the height, holds,
 * then FLIES to the xp counter (420 ms) and is added there — nothing pops that does not land somewhere. The impact flash: 1-f
 * attack, 6-f fade. The perfect: a gold vignette, 1-f attack, 12-f decay; never red (PRINCIPLES §4). No hit-stop (none measured).
 * Everything is a pool made once (DOM nodes, slots); one rAF loop runs only while something moves, and allocates nothing per frame.
 * ──────────────────────────────────────────────────────────────────────────── */
import { createCraftXP, craftOf, shapeOf, levelOf } from './craftxp.js';

// (each animation in two copies, …a and …b: a restart by the class alone, never a reflow)
const KF = (n, b) => `@keyframes ${n}a{${b}}@keyframes ${n}b{${b}}`;
const CSS = `.jx{position:fixed;inset:0;z-index:58;pointer-events:none;overflow:hidden;contain:strict}
.jx>i{position:absolute;left:var(--x);top:var(--y);translate:-50% -50%;opacity:0;font-style:normal;animation-fill-mode:forwards}
.jx-n{font:900 22px/1 Heebo,system-ui;color:#FFF6DA;direction:ltr;unicode-bidi:isolate;white-space:nowrap;text-shadow:0 0 2px #4A2E08,0 0 2px #4A2E08,0 3px 6px #0008}
.jx-n.w{direction:rtl;font-size:26px}.jx-n.g{color:#FFD66E;font-size:28px}.jx-n.g.w{font-size:32px}.jx-n.s{color:#F3E9D2;font-size:19px}
.jx-n.a{animation:jx-pa .17s forwards}.jx-n.b{animation:jx-pb .17s forwards}.jx-n.f{animation:jx-fl .42s cubic-bezier(.5,0,.75,.5) forwards}.jx-n.o{animation:jx-fo .26s ease-in forwards}
${KF('jx-p', '0%{opacity:0;scale:.5}35%{opacity:1;scale:1.18;transform:translateY(calc(var(--r)*-.45))}to{opacity:1;transform:translateY(calc(var(--r)*-1))}')}
@keyframes jx-fl{0%{opacity:1;transform:translateY(calc(var(--r)*-1))}50%{opacity:1;scale:.92;transform:translate(var(--mx),var(--my))}to{opacity:.85;scale:.5;transform:translate(var(--dx),var(--dy))}}
@keyframes jx-fo{0%{opacity:1;transform:translateY(calc(var(--r)*-1))}to{opacity:0;scale:1.06;transform:translateY(calc(var(--r)*-1 - 14px))}}
.jx-f{width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,#fffffff2,#fff4d6b0 22%,#ffe2a02e 48%,#0000 66%)}
.jx-f.g{width:190px;height:190px;background:radial-gradient(circle,#fff,#ffe282d9 20%,#ffc43c4d 46%,#0000 66%)}
.jx-f.a{animation:jx-fa .1s linear}.jx-f.b{animation:jx-fb .1s linear}.jx-f.g.a,.jx-f.g.b{animation-duration:.16s}
${KF('jx-f', '0%{opacity:1;scale:.55}17%{opacity:1;scale:1}to{opacity:0;scale:1.2}')}
.jx>.jx-v{inset:0;left:0;top:0;translate:none;background:radial-gradient(ellipse,#0000 46%,#ffcc508c)}.jx-v.a{animation:jx-va .2s linear}.jx-v.b{animation:jx-vb .2s linear}
${KF('jx-v', '0%{opacity:.9}to{opacity:0}')}
.jx-s{font:900 34px/1 system-ui;color:#FFD66E;text-shadow:0 2px 0 #5A3A08,0 0 14px #ffc850b3}.jx-s.e{color:#fff6da80}
.jx-s.on{animation:jx-st .2s cubic-bezier(.2,.9,.3,1) forwards}.jx-s.out{animation:jx-so .3s ease-in forwards}
@keyframes jx-st{0%{opacity:0;scale:.5}45%{opacity:1;scale:1.25}to{opacity:1;scale:1}}@keyframes jx-so{0%{opacity:1}to{opacity:0;scale:.8;transform:translateY(-18px)}}
.jx>.jx-big{inset:0;left:0;top:0;translate:none;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:calc(env(safe-area-inset-top,0px) + 96px);gap:4px;direction:rtl;transition:opacity .15s}
.jx-big.on{opacity:1}.gm.jx-hush .gm-bub,.gm.jx-hush .gm-toasts{opacity:0;transition:opacity .15s}.jx-big.out{opacity:0;transition-duration:.4s}
.jx-rays{position:absolute;left:50%;top:34%;width:150vmax;height:150vmax;margin:-75vmax;opacity:.32;background:repeating-conic-gradient(#ffe28c8c 0 7deg,#0000 7deg 22deg);mask:radial-gradient(#000,#0000 55%);animation:jx-spin 9s linear infinite}
.k3 .jx-rays{opacity:.55}@keyframes jx-spin{to{rotate:1turn}}
.jx-bf{position:absolute;inset:0;background:radial-gradient(circle at 50% 34%,#fff,#ffecbecc 26%,#ffd2783f 60%,#0000 80%);opacity:0}.jx-bf.a{animation:jx-ba .33s linear forwards}.jx-bf.b{animation:jx-bb .33s linear forwards}
${KF('jx-b', '0%{opacity:0}10%{opacity:var(--k)}to{opacity:0}')}
.jx-bt,.jx-bs{position:relative;font:900 36px/1.1 Heebo,system-ui;color:#FFD66E;text-align:center;padding:0 16px;text-shadow:0 3px 0 #5A3A08,0 0 24px #ffbe46bf;opacity:0}
.jx-bs{font-size:19px;color:#FFF6DA;text-shadow:0 2px 4px #1e1204cc}
.jx-bt.on,.jx-bs.on{animation:jx-st .22s cubic-bezier(.2,.9,.3,1) forwards}
.jx-xp{position:fixed;z-index:31;top:calc(env(safe-area-inset-top,0px) + 52px);left:calc(env(safe-area-inset-left,0px) + 12px);transform-origin:0 50%;display:flex;align-items:center;gap:6px;min-height:28px;max-width:200px;padding:3px 10px 3px 8px;border-radius:15px;background:#24180ac7;color:#FFF6DA;direction:rtl;pointer-events:none;white-space:nowrap;font:800 12px/1 Heebo,system-ui;box-shadow:0 2px 8px #0006;transition:scale .22s cubic-bezier(.2,.9,.3,1.4)}
.jx-xp i{position:relative;width:44px;flex:none;height:7px;border-radius:4px;background:#fff6da38;overflow:hidden}.jx-xp i i{position:absolute;inset:0 auto 0 0;width:0;background:#FFD66E;transition:width .3s}
.jx-xp b{direction:ltr;color:#FFD66E}.jx-xp.bump{scale:1.25}.gm:not(.tw-on)~.jx-xp,.gm.sheet-open~.jx-xp{display:none}
@media (prefers-reduced-motion:reduce){.jx>i,.jx-bt,.jx-bs{animation-duration:.01s!important}.jx-rays{animation:none}}`;

const KB = ['', '.35', '.5', '.75'];   // (the three flashes, each brighter: measured 137 → 138 → 180 of 255)
const NUMS = 10, FLASH = 4, HOLD = 380, HOLD_P = 520, POP = 170, FLY = 420, WORD = 760;   // ms (the study: pop 10 f, a short hold, the flight)

export function createJuice18(o = {}) {
  const doc = document, ui = o.ui || {}, R = () => ui.root;
  const call = (f, ...a) => { try { return typeof f === 'function' ? f(...a) : undefined; } catch (e) { return undefined; } };
  const W = () => innerWidth, H = () => innerHeight;
  const st = { host: null, xp: null, xc: '', bumpT: 0, n: [], f: [], s: [], fi: 0, vi: 0, raf: 0, tDown: 0, L: { t: -1e9, x: 0, y: 0, k: 0 }, pend: {}, big: null, res: null, pT: 0, dead: false };
  const stats = { hits: 0, touch: 0, pts: 0, score: 0, lagLast: 0, lagMax: 0, evLast: 0, flights: 0, landed: 0, ups: 0, bigs: 0, results: 0 };
  const XP = createCraftXP(o.G, null), tgt = { x: 0, y: 0 }, pt = { x: 0, y: 0 };
  const el = (tag, cls, p) => { const e = doc.createElement(tag); e.className = cls; if (p) p.appendChild(e); return e; };
  const sv = (e, k, v) => e.style.setProperty(k, `${Math.round(v)}px`);
  const clrDown = () => { st.tDown = 0; };
  const cls = (e, c, ab) => { e.className = c + (ab ? ' b' : ' a'); };

  function mount() {
    if (st.host || st.dead) return !!st.host;
    const root = R() || doc.body; if (!root) return false;
    if (!doc.getElementById('jx-css')) { const c = el('style', ''); c.id = 'jx-css'; c.textContent = CSS; doc.head.appendChild(c); }
    const h = el('div', 'jx'); h.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < NUMS; i++) st.n.push({ el: el('i', 'jx-n', h), ph: 0, t0: 0, t1: 0, t2: 0, n: 0, craft: '', word: false, ab: 0, key: '', m: 0 });
    for (let i = 0; i < FLASH; i++) st.f.push({ el: el('i', 'jx-f', h), t1: 0, ab: 0 });
    for (let i = 0; i < 3; i++) st.s.push(el('i', 'jx-s', h));
    st.v = el('i', 'jx-v', h);
    const b = st.B = el('i', 'jx-big', h); el('span', 'jx-rays', b); st.bF = el('span', 'jx-bf', b); st.bT = el('b', 'jx-bt', b); st.bS = el('span', 'jx-bs', b);
    root.appendChild(h); st.host = h;
    addEventListener('pointerdown', onDown, true);
    return true;
  }
  function onDown(e) {
    st.tDown = performance.now(); st.tEv = e && e.timeStamp > 0 ? e.timeStamp : st.tDown;   // (the page has the touch now · the touch's own time)
    setTimeout(clrDown, 0);   // (an answer after this touch's own task — the impact's "מושלם!" — is not the touch's answer)
    if (st.big && st.big.t > 260) st.big.skip = true;   // (a tap skips the celebration — never before it is seen)
  }

  /* ── the counters: HUD18's ui.counter / ui.bump / ui.xp, or the stub (a small chip of our own while ui.xp does not exist) ── */
  function counter(key) {
    let r = typeof ui.counter === 'function' ? call(ui.counter, key) : null;
    if (!(r && r.width) && key === 'score' && typeof ui.counter === 'function') r = call(ui.counter, 'xp');   // ── hook19 ── (no capsule on screen: the craft's slot)
    if (!(r && r.width)) {
      const g = R(), e = key === 'xp' ? stubXP() || (g && g.querySelector('.gm-xp')) : g && g.querySelector(key === 'coins' || key === 'silver' ? '.gm-purse' : `.gm-res [data-r="${key}"]`);
      r = e && e.getBoundingClientRect();
    }
    if (r && r.width) { tgt.x = r.left + r.width / 2; tgt.y = r.top + r.height / 2; } else { tgt.x = W() / 2; tgt.y = 20; }
  }
  function bump(key, d) {
    if (typeof ui.bump === 'function') return void call(ui.bump, key, d);
    if (key !== 'xp') return void call(ui.flashRes, [key === 'coins' ? 'silver' : key]);
    if (st.xp) { st.xp.classList.add('bump'); st.bumpT = performance.now() + 220; loop0(); }
  }
  function stubXP() {
    if (typeof ui.xp === 'function') return null;
    const g = R(); if (st.xp || !g || !g.parentNode) return st.xp;
    const e = st.xp = el('div', 'jx-xp'); e.setAttribute('role', 'status');
    st.xI = el('span', '', e); st.xL = el('span', '', e); st.xB = el('i', '', el('i', '', e)); st.xN = el('b', '', e);
    g.parentNode.insertBefore(e, g.nextSibling);   // (a sibling after .gm: shown under .gm.tw-on, hidden in portrait and over a sheet)
    return e;
  }
  function showXP(sh) {
    if (typeof ui.xp === 'function') return void call(ui.xp, sh);
    if (!stubXP()) return;
    if (st.xc !== sh.craft + sh.level) { st.xc = sh.craft + sh.level; st.xI.textContent = sh.icon; st.xL.textContent = `${sh.name} · רמה ${sh.level}`; }
    st.xN.textContent = String(sh.xp);
    st.xB.style.width = `${Math.round((sh.next ? Math.max(0, Math.min(1, (sh.xp - sh.base) / (sh.next - sh.base))) : 1) * 100)}%`;
    const D = st.xp.dataset; D.craft = sh.craft; D.level = sh.level; D.xp = sh.xp;
  }
  const shown = (c) => shapeOf(c, Math.max(0, XP.get(c).xp - (st.pend[c] || 0)));

  /* ── the sound, by MUSIC18's name when it exists ── */
  const sfx = o.sfx;
  const play = (n, alt, opt) => { try { sfx.play(typeof sfx.has === 'function' && sfx.has(n) ? n : alt, opt); } catch (e) { /* no sound */ } };
  const OPT = { combo: 4, i: 0 };

  /* ── the one loop: the phases of the pooled slots ── */
  const loop0 = () => { if (!st.raf && !st.dead) st.raf = requestAnimationFrame(loop); };
  function loop() {
    st.raf = 0; if (st.dead) return;
    const t = performance.now(); let live = 0;
    for (let i = 0; i < NUMS; i++) {
      const s = st.n[i]; if (!s.ph) continue; live++;
      if (s.ph === 1 && t >= s.t1) {   // the hold is over: a point flies to its counter, a word fades
        if (!s.n) { s.ph = 3; s.t2 = t + 260; s.el.className = s.el.className.slice(0, -2) + ' o'; continue; }
        launch(s, s.p ? 'score' : 'xp', t);   // ── hook19 ── (a scoring act flies to the master score; the craft's point lands with it)
      } else if (s.ph === 2 && t >= s.t2) land(s);
      else if (s.ph === 3 && t >= s.t2) { s.ph = 0; s.el.className = 'jx-n'; }
    }
    for (let i = 0; i < FLASH; i++) { const f = st.f[i]; if (f.t1) { if (t >= f.t1) { f.t1 = 0; f.el.className = 'jx-f'; } else live++; } }
    if (st.bumpT) { if (t >= st.bumpT) { st.bumpT = 0; if (st.xp) st.xp.classList.remove('bump'); } else live++; }
    if (st.big) { live++; bigStep(t); }
    if (st.res) { live++; resStep(t); }
    if (live) loop0();
  }
  /** a slot flies from where it is to the counter of key (an arc: out to the side, then in) */
  function launch(s, key, t) {
    counter(key);
    sv(s.el, '--dx', tgt.x - s.x); sv(s.el, '--dy', tgt.y - s.y); sv(s.el, '--mx', (tgt.x - s.x) * 0.38 + (s.x < tgt.x ? -30 : 30)); sv(s.el, '--my', (tgt.y - s.y) * 0.3 - 20);
    s.el.className = s.el.className.slice(0, -2) + ' f'; s.ph = 2; s.t2 = t + FLY; stats.flights++;
  }
  /** a point lands: the counter takes it (its number rises, it swells), the bar moves; a level crossed → the level up */
  function land(s) {
    s.ph = 0; s.el.className = 'jx-n'; stats.landed++;
    if (s.key) { bump(s.key, s.m); OPT.kind = s.key === 'coins' ? 'coin' : 'mat'; play('flyIn', 'pop', OPT); s.key = ''; return; }
    if (s.p) { bump('score', s.p); s.p = 0; }   // ── hook19 ── the same landing: the capsule's number ticks up
    const c = s.craft, n = s.n, x0 = shown(c).xp; s.n = 0;
    st.pend[c] = Math.max(0, (st.pend[c] || 0) - n);
    const sh = shown(c);
    showXP(sh); bump('xp', n); play('xpTick', 'pop');
    if (levelOf(sh.xp) > levelOf(x0)) levelUp(sh);
    const t = performance.now(); if (t - st.pT > 1500) { st.pT = t; call(o.persist); }
  }
  /** "<המקצוע> — רמה N!": the stamp, the banner, the flourish, the craftsman's hand charged (contract 1) */
  function levelUp(sh) {
    stats.ups++; call(o.persist);
    call(ui.stamp, `${sh.name} — רמה ${sh.level}!`, { ms: 1300 });
    call(ui.banner, 'יד של אומן מוכנה!', { ms: 2200 });
    OPT.level = sh.level; play('levelUp', 'fanfare', OPT); call(o.haptic, [20, 40, 30]);
    const T = call(o.twin); if (T && T.event) for (let i = 0; i < 3; i++) call(T.event, 'jobDone', { q: 1 });   // (twin.js: each q ≥ .9 charges a third of the hand)
    call(o.emit, 'craftLevel', { craft: sh.craft, level: sh.level });
  }
  /** the screen point of a world point (the projection's shared object, copied at once) */
  function scr(at, dy) {
    const v = o.view, p = at && v && call(() => (v.projectRaw || v.project).call(v, at.x, at.y + dy, at.z));
    if (p && p.on) { pt.x = p.x; pt.y = p.y; return true; } return false;
  }

  /* ── the touch on material: six answers in the same call (≤ 50 ms of the touch) ── */
  const toolMult = () => { try { const m = +globalThis.__TOOL_MULT; return m > 0 && m < 3 ? m : 1; } catch (e) { return 1; } };   // ── tools21 ──
  function hit(kind, d = {}) {
    const t0 = performance.now();
    if (!mount()) return;
    const at = d.at, P = !!d.perfect, soft = d.grade === 'soft' || (!P && d.quality != null && d.quality < 0.7), text = d.text != null ? String(d.text) : '+1';
    const S = call(o.stages);
    // 1 · the world: dust (sparks on the gold) — the stages' pooled bursts
    if (at && S) { call(S.dustBurst, at.x, at.y, at.z, P ? 12 : soft ? 4 : 7, 2.4, 2, 1.2); if (P) call(S.sparkBurst, at.x, at.y + 0.6, at.z, 18, 4, 6); }
    // 2 · the screen point
    let x = W() / 2, y = H() * 0.45;
    if (scr(at, 1.6)) { x = pt.x; y = pt.y - 24; }
    x = Math.max(40, Math.min(W() - 40, x)); y = Math.max(70, Math.min(H() - 60, y));
    // 3 · the impact flash (1-f attack, 6-f fade; gold and bigger on the perfect) + the perfect's gold vignette
    const f = st.f[st.fi++ % FLASH]; f.ab ^= 1; sv(f.el, '--x', x); sv(f.el, '--y', y + 18); cls(f.el, P ? 'jx-f g' : 'jx-f', f.ab); f.t1 = t0 + 320;
    if (P) cls(st.v, 'jx-v', st.vi ^= 1);
    // 4 · the number: pops, holds, and a point flies to the xp counter (a word fades). A word that answers the touch itself (a
    //     craft's "טוב" or "מושלם!") is a work act too: its "+1" pops beside it and flies — every act counts, the gold ones too
    const m = /^\+(\d+)/.exec(text), mine = st.tDown > 0;
    let n = m ? Math.min(99, +m[1]) : 0;
    // ── hook19 ── (contract 5) the act's master-score points: d.pts, else d.act ('ok' | 'good' | 'gold'), else its grade — a number
    // pops and flies to the score capsule (the craft's point lands with it); a word alone (a grade's name at the impact) scores only
    // when this touch's own number would have; d.pts = 0 → no score. The score is made and the capsule held BEFORE the flight.
    const SCo = call(o.score), explicit = d.pts != null || !!d.act;
    let pts = 0;
    if (SCo && d.pts !== 0 && (n > 0 || explicit || (text && mine && kind !== 'pick'))) { pts = d.pts != null ? Math.max(0, d.pts | 0) : Math.round(SCo.grade(d.act || (P ? 'gold' : soft ? 'ok' : 'good')) * toolMult() + 1e-6); }   // ── tools21 ── (the tool's tier; an explicit d.pts was made with it already by acts.js)
    const sc = (cx, cy, cn) => { call(ui.hold, 'score', pts); call(SCo.add, pts, 'act'); pop(`+${pts}`, cn, x, cy, P, soft, t0, d.craft, kind, pts); };   // (hold first: the capsule shows the old number until the landing)
    if (pts && n) sc(x, y, 1);
    else if (text || pts) {
      if (text) pop(text, n, x, y, P, soft, t0, d.craft, kind);
      if (pts) sc(x, text ? y + 24 : y, n = 1);
      else if (!n && mine && kind !== 'pick') pop('+1', n = 1, x, y + 24, P, soft, t0, d.craft, kind);
    }
    if (pts) n = 1;
    // ── /hook19 ──
    // 5 · the shake (the world's, tiny: measured ±0.3–0.5 % for ≈ 6 f) and the buzz
    if (S) call(S.twinShake, 0.1, P ? 0.14 : soft ? 0.05 : 0.07);
    call(o.haptic, P ? [12, 30, 18] : soft ? 8 : 10);
    // 6 · the sound (MUSIC18's grade when it exists)
    // ── hook19 ── (FUN19 §4.3) the gold bell climbs one degree of the scale per gold in the run, up to 5, then falls back gently to the third
    if (P && SCo && typeof SCo.streak === 'function') { const r = SCo.streak(); OPT.combo = r <= 5 ? Math.max(1, r) : 3 + ((r - 6) % 3); }
    // ── /hook19 ──
    play(text ? d.grade || (P ? 'perfect' : soft ? 'soft' : 'good') : 'ui', text ? (P ? 'perfect' : 'tap') : 'ui', OPT);
    OPT.combo = 4;   // ── hook19 ──
    loop0();
    const t1 = performance.now(), lag = t1 - (mine ? st.tDown : t0);
    stats.hits++; stats.pts += n; stats.score += pts;   // (hook19: score — the master score's points this layer made)
    if (mine) { stats.touch++; stats.lagLast = lag; if (lag > stats.lagMax) stats.lagMax = lag; stats.evLast = t1 - st.tEv; }   // (from the touch's own time stamp: the browser's queue on a busy machine included)
  }

  function pop(text, n, x, y, P, soft, t0, craft, kind, pts = 0) {
    let s = st.n[0];
    for (const c of st.n) { if (!c.ph) { s = c; break; } if (c.t0 < s.t0) s = c; }
    if (s.ph) land(s);   // (all busy: the oldest lands at once — its point is never lost)
    const L = st.L, k = L.k = t0 - L.t < 600 && Math.abs(L.x - x) < 60 && Math.abs(L.y - y) < 60 ? (L.k + 1) % 4 : 0;
    L.t = t0; L.x = x; L.y = y;
    s.x = x + [0, -18, 16, -6][k]; s.y = y + [0, 10, 5, 18][k];   // (the cluster: each new one a little aside, as measured)
    s.ab ^= 1; s.n = n; s.p = pts; s.t0 = t0; s.t1 = t0 + POP + (n ? (P ? HOLD_P : HOLD) : WORD); s.ph = 1;
    s.el.textContent = text; sv(s.el, '--x', s.x); sv(s.el, '--y', s.y); sv(s.el, '--r', Math.max(10, H() * 0.03));
    cls(s.el, 'jx-n' + (P ? ' g' : soft && n ? ' s' : '') + (n ? '' : ' w'), s.ab);
    if (n) {
      const c = s.craft = craftOf(craft, kind);
      XP.add(c, n); st.pend[c] = (st.pend[c] || 0) + n;
      if (!st.xc.startsWith(c) || typeof ui.xp === 'function') showXP(shown(c));   // (the counter shows this craft before its point lands)
    }
  }

  /* ── one reward to its counter (a material, the coins) ── */
  function fly(key, n, from) {
    if (!mount() || !(n > 0)) return;
    const s = st.n.find((c) => !c.ph); if (!s) return void bump(key, n);
    s.x = from && from.x >= 0 ? from.x : W() / 2; s.y = from && from.y >= 0 ? from.y : H() / 2;
    s.key = String(key); s.m = n; s.n = 0; s.p = 0; s.t0 = performance.now();
    call(ui.hold, key, n);   // (HUD18: the counter shows its real value less what is still flying)
    s.el.textContent = `+${n}`; sv(s.el, '--x', s.x); sv(s.el, '--y', s.y); sv(s.el, '--r', 0); s.el.className = 'jx-n a';
    launch(s, key, s.t0); loop0();
  }

  /* ── a job's end: the stars pop one by one (260 ms apart, each its own rising note), then the mats fly ── */
  function result(d = {}) {
    if (!mount()) return Promise.resolve();
    stats.results++;
    let x = W() / 2, y = H() * 0.42; const at = d.at;
    if (at && at.z != null) { if (scr(at, 0)) { x = pt.x; y = pt.y; } } else if (at && Number.isFinite(+at.x)) { x = +at.x; y = +at.y; }
    x = Math.max(70, Math.min(W() - 70, x)); y = Math.max(90, Math.min(H() - 80, y));
    if (st.res) resEnd();
    const stars = Math.max(0, Math.min(3, d.stars | 0));
    st.s.forEach((e, i) => { e.className = 'jx-s'; e.textContent = i < stars ? '★' : '☆'; sv(e, '--x', x + (1 - i) * 38); sv(e, '--y', y); });   // (RTL: the first star on the right)
    return new Promise((res) => { st.res = { t0: performance.now(), i: 0, stars, res, mats: d.mats, x, y, coins: d.coins | 0, fly: !!d.fly }; loop0(); });
  }
  function resStep(t) {
    const r = st.res, k = t - r.t0;
    for (; r.i < 3 && k >= r.i * 260; r.i++) {
      st.s[r.i].className = 'jx-s on' + (r.i < r.stars ? '' : ' e');
      if (r.i < r.stars) { OPT.i = r.i; OPT.combo = 4 + 2 * r.i; play('star', 'chime', OPT); OPT.combo = 4; }
      if (r.i === 2 && r.stars === 3) { try { const M = globalThis.__BH_MUSIC; if (M && typeof M.flourish === 'function') M.flourish('level', 1); } catch (e) { /* ── hook19 ── the music's: ★★★ — the rising run on the downbeat */ } }
    }
    if (k >= 900 && !r.flown) {
      r.flown = true; let j = 0;
      for (const key in r.mats || {}) fly(key, r.mats[key], { x: r.x + 20 * j++, y: r.y + 30 });
      if (r.fly) fly('coins', r.coins, { x: r.x, y: r.y + 30 });
    }
    if (k >= 1700 && !r.out) { r.out = true; st.s.forEach((e, i) => { e.className = 'jx-s out' + (i < r.stars ? '' : ' e'); }); }
    if (k >= 2000) resEnd();
  }
  function resEnd() { const r = st.res; if (!r) return; st.res = null; for (const e of st.s) e.className = 'jx-s'; r.res(); if (r.then) r.then(); }

  /* ── a course's end, a stage's end: three rising flashes over a fixed, known reward (the Starr Drop's escalation, never its
     chance); 3.6–4.2 s; a tap skips; it yields to any card ── */
  function big(kind = 'course', d = {}) {
    if (!mount()) return Promise.resolve();
    if (st.res) return new Promise((res) => { st.res.then = () => big(kind, d).then(res); });   // (after the job's stars: one thing at a time)
    if (st.big) bigEnd();
    stats.bigs++;
    st.bT.textContent = d.title || (kind === 'stage' ? 'השלב נבנה!' : 'הנדבך הושלם!'); st.bS.textContent = d.sub || '';
    st.B.className = 'jx-big on'; st.bT.className = 'jx-bt'; st.bS.className = 'jx-bs';
    OPT.kind = kind; play('big', 'fanfare', OPT); call(o.haptic, [20, 50, 30]); call(d.cheer);
    hush(true);   // (the mentor's bubble and the toasts step back while it plays; they return when it ends or is skipped)
    return new Promise((res) => { st.big = { t0: performance.now(), t: 0, k: 0, res, skip: false, dur: kind === 'stage' ? 4200 : 3200 }; loop0(); });
  }
  function bigStep(t) {
    const b = st.big, g = R(); b.t = t - b.t0;
    if (step(b, 1, 0)) st.bT.className = 'jx-bt on';
    if (step(b, 2, 900) && st.bS.textContent) st.bS.className = 'jx-bs on';
    if (step(b, 3, 1800)) st.B.className = 'jx-big on k3';
    if (b.skip || b.t >= b.dur || (g && g.querySelector('.gm-modal.on,.gm-mo'))) bigEnd();
  }
  function hush(on) { const g = R(); if (g) g.classList.toggle('jx-hush', on); }
  function step(b, k, at) { if (b.k >= k || b.t < at) return false; b.k = k; st.bF.style.setProperty('--k', KB[k]); cls(st.bF, 'jx-bf', (k & 1) ^ 1); return true; }
  function bigEnd() {
    const b = st.big; if (!b) return; st.big = null;
    st.B.className = 'jx-big out'; st.bF.className = 'jx-bf'; hush(false);
    setTimeout(() => { if (!st.big && st.B) { st.B.className = 'jx-big'; st.bT.className = 'jx-bt'; st.bS.className = 'jx-bs'; } }, 420);
    b.res(b.skip);
  }

  mount();   // (the layer and the touch's clock from the start: the first touch is timed too)
  return {
    hit, result, big, fly, xp: XP,
    /** the game's bus (index.js sends these only under two thumbs): a course closed at his stage, a stage done */
    event(type, d = {}) { if (type === 'course') big('course', d); else if (type === 'stageDone') big('stage', d); },
    /** tests: the timings and the counts */
    stats: () => ({ ...stats, busy: st.n.filter((s) => s.ph).length, big: !!st.big }),
    show: (c) => showXP(shown(c || XP.cur().craft)),
    destroy() {
      st.dead = true; cancelAnimationFrame(st.raf); st.raf = 0;
      removeEventListener('pointerdown', onDown, true);
      bigEnd(); resEnd();
      for (const e of [st.host, st.xp]) if (e && e.parentNode) e.parentNode.removeChild(e);
      st.host = st.xp = null;
    },
  };
}
