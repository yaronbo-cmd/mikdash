/* ── build 134 ── h134/kit11.js — what the acts of stage 11 share (spec docs/specs/shlav-11-he.md, "משותף לכל העבודות"):
 *   · award / extra / finish / lens / V3 — stage 10's (h133/kit10.js): the one old system (X.hit 40 / 20 / 10, the run), the level's
 *     multiplier on top (×2, ×4), the work's perfect word on the full screen;
 *   · hurt(X, Mo, f, at, o) — real damage kept in the world where it happened (Mo.flaw) and its points off (X.loss), this stage's labels;
 *   · zero(X, at, label) — a step of 0 (a pebble left in the basket): no points, the run broken;
 *   · basis(X, at) — the camera's screen right and screen up on the ground at a world point (a drag's screen direction → a world one);
 *   · voices(X) — stage 09's stone, wood and rope (h129 createVoices) and this stage's own: a stone's dull click, the pitch's flow, a
 *     wooden tick, the core's release with a breath, the drill's whistle, two streams that end together. No metal sound by the altar
 *     (the drill's whistle is the workshop's only).
 *   · roleFingers — the two hands by ROLE, not by side: the first finger on a work thing is the work hand, a second while it holds is
 *     the helping hand (always on the held thing), a finger on nothing with nothing held is the camera's (the director's look).
 */
import { award, extra, finish, lens, V3 } from '../h133/kit10.js';
import { createVoices } from '../h129/sound129.js';
import { LOSS } from './model.js';

export { award, extra, finish, lens, V3 };
export function hurt(X, Mo, f, at, o = {}) {
  const p = Mo.flaw(f, o);
  try { X.loss(p, at, LOSS[f] ? LOSS[f][0] : ''); } catch (e) { /* */ }
  try { X.shake(0.16, 0.28); } catch (e) { /* */ }
  return p;
}
export function zero(X, at, label) { try { X.loss(0, at, label); } catch (e) { /* */ } }
/** the camera's right and forward on the ground (unit, x east / z south) */
export function basis(X) {
  const c = X.camera, e = c.matrixWorld.elements;
  const r = [e[0], e[2]], L = Math.hypot(r[0], r[1]) || 1; r[0] /= L; r[1] /= L;
  const f = [-e[8], -e[10]], K = Math.hypot(f[0], f[1]) || 1; f[0] /= K; f[1] /= K;   // (forward: where it looks, on the ground)
  return { r, f };
}
export function voices(X) {
  const V = createVoices(X.sfx), ctx = () => { try { return X.sfx && X.sfx.context; } catch (e) { return null; } };
  const tone = (f0, f1, dur, peak, type = 'sine', at = 0) => {
    const c = ctx(); if (!c || c.state !== 'running') return; try { if (X.sfx && X.sfx.muted) return; } catch (e) { /* */ }
    const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.__bhOut || c.destination); o.start(t); o.stop(t + dur + 0.05);
  };
  let wh = null;
  return Object.assign(V, {
    click() { V.knock(1.6); tone(240, 150, 0.12, 0.05); },                       // a pebble seated: a dull stone click
    pour() { V.dust(); tone(70, 52, 1.4, 0.07, 'sine'); tone(110, 80, 1.1, 0.03, 'triangle', 0.15); },   // the pitch's black river
    tick() { tone(1150, 900, 0.05, 0.06, 'triangle'); V.knock(2.4); },           // a point let go: wood on stone
    release() { V.thud(); tone(300, 120, 0.9, 0.035, 'sine', 0.1); V.dust(); },  // the core out, and a breath
    drip() { tone(1500, 900, 0.08, 0.03); },
    together() { tone(660, 520, 0.5, 0.06); tone(660 * 1.25, 520 * 1.25, 0.5, 0.05); },   // two streams that close together
    apart() { tone(520, 440, 0.4, 0.05); tone(392, 330, 0.4, 0.04, 'sine', 0.35); },
    whistle(k) { const c = ctx(); if (!c) return; try { if (!wh) { const o = c.createOscillator(), g = c.createGain(); o.type = 'triangle'; o.frequency.value = 700; g.gain.value = 0.0001; o.connect(g); g.connect(c.__bhOut || c.destination); o.start(); wh = { o, g }; } wh.g.gain.setTargetAtTime(0.0001 + 0.025 * Math.max(0, Math.min(1, k)), c.currentTime, 0.05); wh.o.frequency.setTargetAtTime(500 + 600 * Math.max(0, Math.min(1, k)), c.currentTime, 0.08); } catch (e) { /* */ } },
    hush() { V.stop(); try { if (wh) wh.g.gain.value = 0.0001; } catch (e) { /* */ } },
  });
}
/** the screen's own px on the 360-px design (spec "מגע במסך 640 על 360": 48 px a grip at least) */
export const px360 = () => (typeof innerHeight === 'number' && innerHeight > 0 ? innerHeight / 360 : 1);
export const MIN_GRIP = 24;   // (half of 48, on the 360-px screen)
