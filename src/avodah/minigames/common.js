/* ─────────────────────────────────────────────────────────────────────────────
 * common.js: the mini-game frame of the service.
 *
 *   const r = await runGame(def, ctx);   // → { ok, skipped, score, perfect, mistakes }
 *
 * def: { id, title, kicker?, intro, play(api) → cleanup? }
 * A mini-game is a 20–60 s hands-on card over the 3D view. There is no fail state: a mistake shows a gentle,
 * sourced hint and play goes on at once; "דלג" always completes it.
 * api: play (the play area) · svg(viewBox, label) · el(tag, attrs, parent) · hint(text, kind) · miss(text) ·
 *      done(o) · loop(fn) · after(ms, fn) · wait(ms) · button(label, onClick, cls) · controls · float(text, x, y) ·
 *      sparkle(x, y) · hold(el) · solver(fn) (the test harness plays the game through it: real DOM events on the
 *      game's own elements) · sfx · world · ctx · T (the time scale: 1, or short in tests)
 * ──────────────────────────────────────────────────────────────────────────── */
import { createInteract3D } from '../interact3d.js';
import { ensureArt } from './art.js';
const SVGNS = 'http://www.w3.org/2000/svg';
export const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
export function svgEl(tag, attrs = {}, parent) {
  const e = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Dispatch a pointer press on an element (used by solvers and the harness). */
export function press(target, type = 'tap') {
  if (!target) return;
  const r = target.getBoundingClientRect ? target.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
  const o = { bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, pointerId: 1, isPrimary: true, button: 0 };
  const P = typeof PointerEvent === 'function' ? PointerEvent : MouseEvent;
  if (type === 'down' || type === 'tap') target.dispatchEvent(new P('pointerdown', o));
  if (type === 'up' || type === 'tap') { target.dispatchEvent(new P('pointerup', o)); target.dispatchEvent(new MouseEvent('click', o)); }
}

const PLAYED = new Set();   // games played in this session: their walk-ins are shortened on a repeat

export function runGame(def, ctx) {
  // a repeat: played before in this session, or ever (the hooks' gctx.repeat): the short intro (def.introAgain), the
  // walk-ins capped at 1.5 s, and each game's own shortening (one פרק of the song, a quicker count in the lotteries …)
  const repeat = PLAYED.has(def.id) || !!ctx.repeat;
  PLAYED.add(def.id);
  return new Promise((resolve) => {
    const doc = document;
    const T = ctx.fast ? 0.12 : 1;
    const wrap = doc.createElement('div');
    wrap.className = 'av-mg';
    wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-label', def.title);
    wrap.dataset.game = def.id;
    const badge = ctx.forReal ? '<span class="av-badge real">עבודה בפועל</span>' : ctx.watch ? '<span class="av-badge">צפייה ולימוד</span>' : '<span class="av-badge">לימוד</span>';
    wrap.innerHTML = `<div class="av-mg-card">
      <div class="av-mg-top"><span class="av-kick">${esc(def.kicker || '')}</span><b class="av-mg-t">${esc(def.title)}</b>${badge}${ctx.live ? '<span class="av-badge live">חי</span>' : ''}<span class="av-draft">טיוטה</span></div>
      <p class="av-mg-intro">${ctx.forReal ? '<b class="av-mine">היום זו העבודה שלך! </b>' : ''}${esc((repeat && def.introAgain) || def.intro || '')}</p>
      <div class="av-play"></div>
      <div class="av-ctl"></div>
      <p class="av-hint" aria-live="polite"></p>
      <button type="button" class="av-skip">דלג</button>
    </div>`;
    (ctx.root || doc.body).appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('on'));
    const play = wrap.querySelector('.av-play'), hintEl = wrap.querySelector('.av-hint'), controls = wrap.querySelector('.av-ctl');
    // keyboard: Enter / Space on a focused target in the picture acts as a tap on it
    play.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const t = e.target.closest('[tabindex]');
      if (!t || !play.contains(t)) return;
      e.preventDefault();
      press(t.querySelector('.av-hit') || t, 'tap');
    });
    const timers = new Set(), loops = new Set(), cleanups = [];
    let finished = false, mistakes = 0, solverFn = null;
    const stopAll = () => {
      for (const t of timers) clearTimeout(t); timers.clear();
      for (const l of loops) l.live = false; loops.clear();
      for (const c of cleanups.splice(0)) { try { c(); } catch (e) { /* ignore */ } }
      if (three) three.end();
    };
    const finish = (res) => {
      if (finished) return;
      finished = true;
      stopAll();
      if (ctx.onGame) ctx.onGame(null);
      wrap.classList.remove('on');
      setTimeout(() => wrap.remove(), ctx.fast ? 30 : 240);
      resolve({ ok: true, skipped: false, score: 0, perfect: mistakes === 0, mistakes, ...res });
    };
    // the 3D session: targets in the world (null with world = {} or no projection: the SVG card stays)
    let three = null;
    try { three = ctx.three === false ? null : createInteract3D({ world: ctx.world, wrap, fast: !!ctx.fast }); } catch (e) { console.warn('[avodah] 3D targets', e); three = null; }
    const api = {
      play, controls, ctx, sfx: ctx.sfx, world: ctx.world, T, data: ctx.data, three,
      /** solver helper: press the 3D target `key` when it is on screen, else the SVG element */
      hit(key, el, type = 'tap') { const t = three && key ? three.el(key) : null; if (t) press(t, type === 'down' && !t.dataset.hold ? 'tap' : type); else if (el) press(el, type); },
      el: svgEl,
      svg(viewBox, label) { const s = svgEl('svg', { viewBox, class: 'av-svg', role: 'img', 'aria-label': label || def.title }); play.appendChild(s); return s; },
      hint(text, kind = '') { hintEl.textContent = text || ''; hintEl.className = 'av-hint' + (kind ? ' ' + kind : ''); },
      miss(text) {
        mistakes++;
        api.hint(text, 'miss');
        ctx.sfx && ctx.sfx.play('miss');
        if (ctx.haptic) ctx.haptic(18);
        play.classList.remove('shake'); void play.offsetWidth; play.classList.add('shake');
        if (ctx.onMiss) ctx.onMiss(def.id, text);
      },
      get mistakes() { return mistakes; },
      done(o = {}) { api.hint(o.text || '', 'ok'); ctx.sfx && ctx.sfx.play('ok'); const t = setTimeout(() => finish(o), (o.linger != null ? o.linger : 650) * T); timers.add(t); },
      loop(fn) {
        const L = { live: true };
        let last = performance.now();
        const f = (now) => { if (!L.live || finished) return; const dt = Math.min(0.05, (now - last) / 1000); last = now; try { fn(dt / T, now); } catch (e) { console.error(e); L.live = false; return; } requestAnimationFrame(f); };
        requestAnimationFrame(f);
        loops.add(L);
        return () => { L.live = false; };
      },
      after(ms, fn) { const t = setTimeout(() => { timers.delete(t); if (!finished) fn(); }, ms * T); timers.add(t); return t; },
      wait(ms) { return new Promise((r) => { const t = setTimeout(() => { timers.delete(t); r(); }, ms * T); timers.add(t); }); },
      button(label, onClick, cls = '') {
        const b = doc.createElement('button');
        b.type = 'button'; b.className = 'av-btn ' + cls; b.innerHTML = label;
        b.addEventListener('click', (e) => { if (!finished) onClick(e); });
        controls.appendChild(b);
        return b;
      },
      float(text, x, y, cls = '') {
        const f = doc.createElement('div');
        f.className = 'av-float ' + cls; f.textContent = text;
        f.style.left = x + '%'; f.style.top = y + '%';
        play.appendChild(f);
        setTimeout(() => f.remove(), 1100);
      },
      sparkle(x, y, n = 8) {
        for (let k = 0; k < n; k++) {
          const s = doc.createElement('i');
          s.className = 'av-spark';
          const a = (k / n) * Math.PI * 2, d = 18 + Math.random() * 22;
          s.style.left = x + '%'; s.style.top = y + '%';
          s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d + 'px');
          play.appendChild(s);
          setTimeout(() => s.remove(), 800);
        }
      },
      /** press-and-hold on an element (and Space): → { held(), off() } */
      hold(target) {
        let held = false;
        const on = (e) => { held = true; if (e && e.cancelable) e.preventDefault(); };
        const off = () => { held = false; };
        for (const ev of ['pointerdown']) target.addEventListener(ev, on);
        for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) target.addEventListener(ev, off);
        const key = (e) => { if (e.code === 'Space') { held = e.type === 'keydown'; e.preventDefault(); } };
        addEventListener('keydown', key); addEventListener('keyup', key);
        cleanups.push(() => { removeEventListener('keydown', key); removeEventListener('keyup', key); });
        return { held: () => held, set: (v) => { held = !!v; } };
      },
      /** a verified line in the card (a gap item of avodah_gaps.json, data.gapLine): "quote" · source · טיוטה (· בבדיקה when
       *  needs_check). One at a time; null removes it. */
      cite(line) {
        const old = wrap.querySelector('.av-cite'); if (old) old.remove();
        if (!line || !line.quote) return null;
        const p = doc.createElement('p');
        p.className = 'av-cite';
        p.style.cssText = 'margin:6px 2px 0;font-size:13.5px;line-height:1.4';
        p.innerHTML = `"${esc(line.quote)}" <span class="av-ref">${esc(line.source || '')}</span> <span class="av-draft">טיוטה</span>${line.needsCheck ? ' <span class="av-draft av-check">בבדיקה</span>' : ''}`;
        hintEl.parentNode.insertBefore(p, hintEl);
        return p;
      },
      onCleanup(fn) { cleanups.push(fn); },
      solver(fn) { solverFn = fn; },
      /** a walk-in or camera move the game waits for: capped (3.5 s, 1.5 s on a repeat), with a "דלג ›" chip */
      walk(p, label = '') {
        const cap = (repeat ? 1500 : 3500) * T;
        return new Promise((resolve) => {
          let done = false;
          const chip = doc.createElement('button');
          chip.type = 'button'; chip.className = 'av-btn ghost av-walkskip'; chip.textContent = 'דלג ›';
          const end = () => { if (done) return; done = true; chip.remove(); resolve(true); };
          chip.addEventListener('click', end);
          controls.appendChild(chip);
          if (label) api.hint(label);
          Promise.resolve(p).then(end, end);
          const t = setTimeout(end, cap); timers.add(t);
        });
      },
      get repeat() { return repeat; },
      /** the mastery tier of this game (0 = never finished … 4 = מומחה; docs/HOOKS.md §13): harder variants from 3 */
      get tier() { return typeof ctx.tier === 'number' ? ctx.tier : 0; },
    };
    wrap.querySelector('.av-skip').addEventListener('click', () => { if (!finished) { finished = true; stopAll(); if (ctx.onGame) ctx.onGame(null); wrap.remove(); resolve({ ok: true, skipped: true, score: 0, perfect: false, mistakes }); } });
    if (ctx.onGame) ctx.onGame({ id: def.id, solve: () => (solverFn ? solverFn() : null), wrap, api });
    try {
      const c = def.play(api);
      if (typeof c === 'function') cleanups.push(c);
    } catch (e) {
      console.error('[avodah] game failed', def.id, e);
      finish({ error: String(e) });
    }
  });
}

/* ───────── small SVG drawing helpers shared by the games ───────── */
/** A kohen seen from the front, in the illustrated style (art.js): the linen ketonet with its folds and sleeves,
 *  the avnet, the turban. o: {x, y, s, hl, label} */
export function kohenFig(svg, o = {}) {
  ensureArt(svg.ownerDocument);
  const g = svgEl('g', { transform: `translate(${o.x || 0} ${o.y || 0}) scale(${o.s || 1})`, class: 'av-kohen' + (o.hl ? ' hl' : '') }, svg);
  svgEl('ellipse', { cx: 0, cy: 30.5, rx: 10.5, ry: 2.4, class: 'av-shadow' }, g);
  svgEl('path', { d: 'M-7 3 Q-11.5 9 -10.8 17 L-7.6 17 Q-7.6 10.5 -5.5 6.5 Z', class: 'av-sleeve' }, g);
  svgEl('path', { d: 'M7 3 Q11.5 9 10.8 17 L7.6 17 Q7.6 10.5 5.5 6.5 Z', class: 'av-sleeve' }, g);
  svgEl('path', { d: 'M-9 30 L-7 2 Q0 -3 7 2 L9 30 Z', class: 'av-robe' }, g);
  svgEl('path', { d: 'M-3.2 16.5 L-4.2 29 M3.2 16.5 L4.2 29 M0 17 L0 29.5', class: 'av-fold' }, g);
  svgEl('circle', { cx: -9.2, cy: 17.6, r: 1.9, class: 'av-hand' }, g);
  svgEl('circle', { cx: 9.2, cy: 17.6, r: 1.9, class: 'av-hand' }, g);
  svgEl('rect', { x: -7.5, y: 12, width: 15, height: 3, rx: 1, class: 'av-belt' }, g);
  svgEl('circle', { cx: 0, cy: -5, r: 5.2, class: 'av-face' }, g);
  svgEl('path', { d: 'M-4.4 -3.4 Q0 4 4.4 -3.4 Q2.8 0.6 0 1 Q-2.8 0.6 -4.4 -3.4 Z', class: 'av-beard' }, g);
  svgEl('path', { d: 'M-5.6 -7 Q0 -15 5.6 -7 Z', class: 'av-turban' }, g);
  if (o.label) svgEl('text', { x: 0, y: 42, class: 'av-lab', 'text-anchor': 'middle' }, g).textContent = o.label;
  return g;
}
