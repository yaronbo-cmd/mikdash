/* ── build 137 ── h137/kit14.js — what the acts of stage 14 share (spec docs/specs/shlav-14-he.md v3, "משותף לכל העבודות"):
 *   · award / extra / finish / lens / V3 — the one old system (X.hit 40 / 20 / 10, the run) with the level's multiplier, the perfect
 *     word on the full screen (stage 10's kit, the same in every stage since);
 *   · hurt(X, Mo, f, at, o) — real damage kept in the world (Mo.flaw) and its points off (X.loss), this stage's labels;
 *   · voices14(X) — the stage's sounds: stone (hollow, by the space: a small cell, a high one, the mesibah), wood (the depth wheel's
 *     click, the plane's creak turning to a hiss, the chip), the gold leaf's breath and the agate's soft hiss — no metal anywhere in
 *     the House (1 Kings 6:7; the plane's iron only in the yard, and even there its sound is the wood's);
 *   · ring(color) — a hand's coloured ring under the thumb (DOM), dp(n) — dp on this screen (the 360-px design).
 * Standalone of the director: the lab's prototypes use it as the game does. */
import { LOSS, mulOf } from './model.js';
import { HANDS } from './look.js';

export { HANDS };
export const V3 = (X, x, y, z) => new X.THREE.Vector3(x, y, z);
export const px360 = () => (typeof innerHeight === 'number' && innerHeight > 0 ? innerHeight / 360 : 1);
export const dp = (n) => n * px360();
export function lens(X, fov) { try { const c = X.camera; if (c && fov && Math.abs(c.fov - fov) > 0.01) { c.fov = fov; c.updateProjectionMatrix(); } } catch (e) { /* */ } }
export function award(X, at, grade, lv, craft, text) {
  if (!grade) return 0;
  const base = grade === 'gold' ? 40 : grade === 'good' ? 20 : 10, mul = mulOf(lv);
  try { X.hit(at, grade, { craft: craft || 'בונים', text: text != null ? text : mul > 1 ? `+${base * mul}` : '', dust: 0.08, lift: 0.12 }); } catch (e) { /* */ }
  if (mul > 1) { try { if (X.bonus) X.bonus(base * (mul - 1), 'lvmul', `×${mul}`); } catch (e) { /* */ } }
  return base * mul;
}
export function extra(X, n, lv, why, label) { const k = n * mulOf(lv); try { if (X.bonus) X.bonus(k, why, label); } catch (e) { /* */ } return k; }
export function hurt(X, Mo, f, at, o = {}) {
  const p = Mo.flaw(f, o);
  try { X.loss(p, at, LOSS[f] ? LOSS[f][0] : ''); } catch (e) { /* */ }
  try { X.shake(0.16, 0.28); } catch (e) { /* */ }
  return p;
}
export async function finish(X, A, res, word, at, film) {
  if (A.ended) return; A.finished = true;
  if (res.perfect) { try { X.perfect(word, at); } catch (e) { /* */ } await X.wait(1.0); }
  if (A.ended) return;
  X.end({ stars: res.stars, q: res.q, pts: res.pts, perfect: res.perfect, at, flags: res.flags, film });
}
export function voices14(X) {
  const ctx = () => { try { return X.sfx && X.sfx.context; } catch (e) { return null; } };
  const ok = () => { const c = ctx(); if (!c || c.state !== 'running') return null; try { if (X.sfx && X.sfx.muted) return null; } catch (e) { /* */ } return c; };
  const out = (c) => c.__bhOut || c.destination;
  const tone = (f0, f1, dur, peak, type = 'sine', at = 0) => {
    const c = ok(); if (!c) return;
    const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out(c)); o.start(t); o.stop(t + dur + 0.05);
  };
  let NB = null;
  const noise = (dur, f, q, peak, at = 0) => {
    const c = ok(); if (!c) return;
    if (!NB) { NB = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = NB.getChannelData(0); let s = 7; for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; } }
    const t = c.currentTime + at, src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain(); src.buffer = NB; src.loop = true; bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp); bp.connect(g); g.connect(out(c)); src.start(t); src.stop(t + dur + 0.05);
  };
  // a held voice (the plane's creak/hiss, the agate's hiss): level 0 … 1, its pitch
  const held = {};
  const hold = (k, lvl, f, q = 1) => {
    const c = ok(); if (!c) return;
    try {
      if (!held[k]) { if (!NB) noise(0.01, 500, 1, 0.0001); const src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain(); src.buffer = NB; src.loop = true; bp.type = 'bandpass'; bp.Q.value = q; g.gain.value = 0.0001; src.connect(bp); bp.connect(g); g.connect(out(c)); src.start(); held[k] = { src, bp, g }; }
      const H = held[k]; H.g.gain.setTargetAtTime(0.0001 + 0.06 * Math.max(0, Math.min(1, lvl)), c.currentTime, 0.04); H.bp.frequency.setTargetAtTime(f, c.currentTime, 0.05);
    } catch (e) { /* */ }
  };
  return {
    step(space = 1) { noise(0.08, 240 / space, 2, 0.03); tone(90 / space, 70 / space, 0.12, 0.02, 'triangle'); },   // a footfall, hollow by the space
    hollow(space = 1) { tone(110 / space, 80 / space, 0.9, 0.035, 'sine'); noise(0.5, 300 / space, 0.6, 0.02); },
    knock() { noise(0.12, 900, 2, 0.05); tone(160, 110, 0.12, 0.05, 'triangle'); },
    crack() { noise(0.45, 1100, 3, 0.07); tone(70, 45, 0.5, 0.05, 'sawtooth'); },
    thud() { tone(80, 50, 0.5, 0.08, 'sine'); noise(0.35, 260, 0.8, 0.05); },
    rise() { tone(220, 330, 0.9, 0.025, 'sine'); noise(0.6, 600, 0.8, 0.015); },
    right() { tone(660, 880, 0.18, 0.03, 'sine'); },
    ray() { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 1.6, 0.025, 'sine', i * 0.12)); tone(131, 130, 2.2, 0.04, 'sine'); },
    click() { noise(0.05, 1800, 4, 0.05); tone(420, 300, 0.05, 0.04, 'triangle'); },
    plane(lvl, smooth) { hold('plane', lvl, smooth ? 2600 : 900, smooth ? 0.8 : 2.5); },
    chip() { noise(0.15, 3200, 1.2, 0.03); },
    clean() { tone(880, 1320, 0.4, 0.03, 'sine'); tone(1320, 1320, 0.5, 0.018, 'sine', 0.1); },
    tear() { noise(0.3, 700, 1.5, 0.08); tone(140, 70, 0.3, 0.05, 'sawtooth'); },
    board() { tone(150, 120, 0.4, 0.06, 'triangle'); noise(0.3, 400, 0.8, 0.04); },
    brush(lvl) { hold('brush', lvl, 1400, 0.7); },
    breath() { noise(0.5, 900, 0.6, 0.025); },
    settle() { noise(0.2, 2400, 1, 0.02); tone(1175, 1568, 0.3, 0.015); },
    agate(lvl) { hold('agate', lvl, 3800, 1.2); },
    shine() { tone(988, 1319, 0.6, 0.03); tone(1568, 1568, 0.8, 0.02, 'sine', 0.12); },
    deep() { tone(65, 64, 2.6, 0.08, 'sine'); tone(98, 97, 2.2, 0.04, 'triangle'); noise(1.2, 300, 0.5, 0.03); },
    wind() { noise(1.1, 420, 0.4, 0.04); },
    hush() { for (const k of Object.keys(held)) { try { held[k].g.gain.value = 0.0001; } catch (e) { /* */ } } },
    stop() { for (const k of Object.keys(held)) { try { held[k].src.stop(); } catch (e) { /* */ } delete held[k]; } },
  };
}
/** a hand's ring under the thumb (DOM, no pointer events): show(x, y, k 0 … 1 filled, glow) / hide() / remove() */
export function ring(color, size = 56) {
  let el = null;
  try { el = document.createElement('div'); el.className = 'h109-ui h137-ring'; el.style.cssText = `position:fixed;z-index:5;pointer-events:none;width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;border-radius:50%;border:4px solid ${color};box-sizing:border-box;display:none;box-shadow:0 0 8px ${color}`; document.body.appendChild(el); } catch (e) { el = null; }
  return {
    el,
    show(x, y, k = 0, glow = false) {
      if (!el) return; el.style.display = 'block'; el.style.left = x + 'px'; el.style.top = y + 'px';
      el.style.background = `radial-gradient(circle, ${color} ${Math.round(k * 62)}%, transparent ${Math.round(k * 62) + 4}%)`;
      el.style.boxShadow = glow ? `0 0 22px 8px #FFF0B8` : `0 0 8px ${color}`;
    },
    hide() { if (el) el.style.display = 'none'; },
    remove() { try { if (el) el.remove(); } catch (e) { /* */ } },
  };
}
/** the fingers on the canvas: every pointer by its id (the director passes the primary one through down/move/up; the rest come from
 *  the window), as stage 07's fingers() — its own copy here so that the lab can run the acts without the old station */
export function fingers(X, h) {
  const L = new Map(); let primary = null;
  const hud = (e) => !!(e.target && e.target.closest && e.target.closest('.gm-top,.gm-tabs,.gm-menu,.gm-modal,button,.h109-ui,.lab-ui'));
  const now = () => performance.now() / 1000;
  const add = (id, x, y, type, button) => { const f = { id, x, y, x0: x, y0: y, t0: now(), type, moved: 0, button: button | 0 }; L.set(id, f); if (h.down) h.down(f); return f; };
  function onWin(e) {
    if (e.pointerId === primary) return;
    if (e.type === 'pointerdown') {
      if (hud(e)) return; const c = document.getElementById('c') || document.querySelector('canvas'); if (e.target !== c) return;
      try { e.preventDefault(); } catch (er) { /* */ }
      add(e.pointerId, e.clientX, e.clientY, e.pointerType, e.button); return;
    }
    const f = L.get(e.pointerId); if (!f) return;
    if (e.type === 'pointermove') { f.moved = Math.max(f.moved, Math.hypot(e.clientX - f.x0, e.clientY - f.y0)); f.x = e.clientX; f.y = e.clientY; if (h.move) h.move(f); return; }
    L.delete(e.pointerId); f.x = e.clientX; f.y = e.clientY; if (h.up) h.up(f);
  }
  const TY = ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'];
  return {
    L,
    attach() { for (const t of TY) window.addEventListener(t, onWin, true); try { const c = document.getElementById('c') || document.querySelector('canvas'); if (c) { this.ta = c.style.touchAction; c.style.touchAction = 'none'; } } catch (e) { /* */ } },
    detach() { for (const t of TY) window.removeEventListener(t, onWin, true); L.clear(); primary = null; try { const c = document.getElementById('c') || document.querySelector('canvas'); if (c && this.ta !== undefined) c.style.touchAction = this.ta; } catch (e) { /* */ } },
    down(p) { primary = p.id; add(p.id, p.x, p.y, p.type || 'touch', p.button); },
    move(p) { const f = L.get(p.id); if (!f) return; f.moved = Math.max(f.moved, Math.hypot(p.x - f.x0, p.y - f.y0)); f.x = p.x; f.y = p.y; if (h.move) h.move(f); },
    up(p) { const f = L.get(p.id); if (primary === p.id) primary = null; if (!f) return; L.delete(p.id); f.x = p.x; f.y = p.y; if (h.up) h.up(f); },
    get n() { return L.size; },
  };
}
