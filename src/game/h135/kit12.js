/* ── build 135 ── h135/kit12.js — what the acts of stage 12 share (spec docs/specs/shlav-12-he.md v7, "משותף לכל העבודות"):
 *   · award / extra / finish / lens / V3 / px360 / MIN_GRIP — stage 11's (h134/kit11.js): the one old system (X.hit 40 / 20 / 10, the
 *     run), the level's multiplier on top, the work's perfect word on the full screen;
 *   · hurt(X, Mo, f, at, o) — real damage kept in the world (Mo.flaw) and its points off (X.loss), this stage's labels;
 *   · voices12(X) — stage 11's voices (stone, wood, rope) and this stage's own: water on stone, a stream's hiss, the wooden tongue's
 *     click, the screw's creak, wet earth's creak, the earth giving way. Every sound wood, water and stone (no metal by the altar).
 */
import { award, extra, finish, lens, V3, voices, px360, MIN_GRIP } from '../h134/kit11.js';
import { LOSS } from './model.js';

export { award, extra, finish, lens, V3, px360, MIN_GRIP };
export function hurt(X, Mo, f, at, o = {}) {
  const p = Mo.flaw(f, o);
  try { X.loss(p, at, LOSS[f] ? LOSS[f][0] : ''); } catch (e) { /* */ }
  try { X.shake(0.16, 0.28); } catch (e) { /* */ }
  return p;
}
export function voices12(X) {
  const V = voices(X), ctx = () => { try { return X.sfx && X.sfx.context; } catch (e) { return null; } };
  const ok = () => { const c = ctx(); if (!c || c.state !== 'running') return null; try { if (X.sfx && X.sfx.muted) return null; } catch (e) { /* */ } return c; };
  const tone = (f0, f1, dur, peak, type = 'sine', at = 0) => {
    const c = ok(); if (!c) return;
    const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.__bhOut || c.destination); o.start(t); o.stop(t + dur + 0.05);
  };
  // a noise burst through a band filter (water: a splash, a hiss; earth: a slump)
  let NB = null;
  const noise = (dur, f, q, peak, at = 0) => {
    const c = ok(); if (!c) return;
    if (!NB) { NB = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = NB.getChannelData(0); let s = 3; for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; } }
    const t = c.currentTime + at, src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain(); src.buffer = NB; bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp); bp.connect(g); g.connect(c.__bhOut || c.destination); src.start(t); src.stop(t + dur + 0.05);
  };
  let hs = null;
  return Object.assign(V, {
    splash(k = 1) { noise(0.35, 1800, 0.9, 0.06 * k); noise(0.2, 3400, 1.2, 0.03 * k, 0.04); },                 // water on stone
    gold() { noise(0.3, 2200, 1, 0.07); tone(880, 990, 0.25, 0.05, 'sine', 0.02); tone(1320, 1480, 0.3, 0.035, 'sine', 0.1); },   // the hands lit
    wet() { noise(0.45, 900, 0.7, 0.05); tone(300, 200, 0.2, 0.02); },                                                       // on the floor
    clash() { noise(0.4, 2600, 0.6, 0.07); noise(0.3, 1200, 0.6, 0.05, 0.08); },
    plug() { V.knock(2.8); tone(520, 380, 0.08, 0.04, 'triangle'); },                                                        // the plug's wood
    seat() { V.knock(2); tone(260, 180, 0.1, 0.05, 'triangle'); },
    click() { tone(1300, 1000, 0.035, 0.06, 'triangle'); V.knock(3); },                                                     // the tongue
    creak() { tone(180, 120, 0.5, 0.05, 'sawtooth'); tone(240, 150, 0.4, 0.02, 'sawtooth', 0.1); },                        // the screw
    stuck() { tone(150, 90, 0.7, 0.06, 'sawtooth'); V.thud(); },
    dent() { V.thud(); tone(140, 60, 0.6, 0.08, 'triangle'); noise(0.3, 600, 0.8, 0.05); },                                  // copper on stone, dull
    earth() { noise(0.18, 400, 0.6, 0.03); },
    creakEarth() { noise(0.5, 300, 2, 0.05); tone(90, 60, 0.4, 0.03, 'sawtooth'); },                                         // wet earth
    breach() { noise(0.7, 260, 0.6, 0.09); V.thud(); },
    trough() { V.knock(1.2); tone(200, 140, 0.18, 0.06, 'triangle'); },                                                      // a dull wooden X
    meet() { tone(660, 520, 0.6, 0.05); tone(825, 650, 0.6, 0.04, 'sine', 0.05); noise(0.5, 1500, 0.8, 0.04); },
    /** a running hiss (0 … 1): the streams while they run */
    hiss(k) { const c = ok(); if (!c) return; try { if (!hs) { if (!NB) noise(0.01, 1000, 1, 0.0001); const src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain(); src.buffer = NB; src.loop = true; bp.type = 'bandpass'; bp.frequency.value = 1600; bp.Q.value = 0.5; g.gain.value = 0.0001; src.connect(bp); bp.connect(g); g.connect(c.__bhOut || c.destination); src.start(); hs = { g }; } hs.g.gain.setTargetAtTime(0.0001 + 0.03 * Math.max(0, Math.min(1, k)), c.currentTime, 0.08); } catch (e) { /* */ } },
    hush() { V.hush(); try { if (hs) hs.g.gain.value = 0.0001; } catch (e) { /* */ } },
  });
}
/** the ground point under a screen point at height y (null off the plane) */
export function groundAt(X, sx, sy, y) {
  const T = X.THREE, r = X.rayAt ? X.rayAt(sx, sy) : null; if (!r) return null;
  const ray = r.ray || r, o = ray.origin, d = ray.direction; if (Math.abs(d.y) < 1e-6) return null;
  const t = (y - o.y) / d.y; if (t <= 0) return null;
  return new T.Vector3(o.x + d.x * t, y, o.z + d.z * t);
}
