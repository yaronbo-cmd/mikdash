/* ── build 136 ── h136/kit13.js — what the acts of stage 13 share (spec docs/specs/shlav-13-he.md v4, "משותף לכל העבודות"):
 *   · award / extra / finish / lens / V3 / px360 / MIN_GRIP — stage 11's (h134/kit11.js): the one old system (X.hit 40 / 20 / 10, the
 *     run), the level's multiplier on top, the work's perfect word on the full screen;
 *   · hurt(X, Mo, f, at, o) — real damage kept in the world (Mo.flaw) and its points off (X.loss), this stage's labels;
 *   · voices13(X) — stage 11's voices (stone, wood, rope) and this stage's own: a lintel's deep boom (each its own wood's tone — the
 *     chord), the rope drawn taut, the lines' glow, the deep "תוק" of a pole locked, the plaster's crack, a low dull gold rustle (no
 *     ring), the wind's gust, a breath. Every sound wood, stone, rope and breath (no metal by the altar, Middot 3:4).
 *   · ring(cls, color) — a hand's coloured ring under the thumb (right gold, left sky blue: spec "סימון הידיים")
 */
import { award, extra, finish, lens, V3, voices, px360, MIN_GRIP } from '../h134/kit11.js';
import { LOSS } from './model.js';
import { HANDS } from './look.js';

export { award, extra, finish, lens, V3, px360, MIN_GRIP, HANDS };
export const dp = (n) => n * px360();
export function hurt(X, Mo, f, at, o = {}) {
  const p = Mo.flaw(f, o);
  try { X.loss(p, at, LOSS[f] ? LOSS[f][0] : ''); } catch (e) { /* */ }
  try { X.shake(0.16, 0.28); } catch (e) { /* */ }
  return p;
}
// (the five lintels' woods: a chord, each a step up — C, E, G, B♭, C over a low drone: "כל אחת מצלצלת בגוון עץ אחר, עד אקורד אחד")
export const CHORD = Object.freeze([130.8, 164.8, 196.0, 233.1, 261.6]);
export function voices13(X) {
  const V = voices(X), ctx = () => { try { return X.sfx && X.sfx.context; } catch (e) { return null; } };
  const ok = () => { const c = ctx(); if (!c || c.state !== 'running') return null; try { if (X.sfx && X.sfx.muted) return null; } catch (e) { /* */ } return c; };
  const tone = (f0, f1, dur, peak, type = 'sine', at = 0) => {
    const c = ok(); if (!c) return;
    const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.__bhOut || c.destination); o.start(t); o.stop(t + dur + 0.05);
  };
  let NB = null;
  const noise = (dur, f, q, peak, at = 0) => {
    const c = ok(); if (!c) return;
    if (!NB) { NB = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = NB.getChannelData(0); let s = 7; for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; } }
    const t = c.currentTime + at, src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain(); src.buffer = NB; bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp); bp.connect(g); g.connect(c.__bhOut || c.destination); src.start(t); src.stop(t + dur + 0.05);
  };
  return Object.assign(V, {
    /** a lintel on its course: a deep boom of wood on stone, in its own wood's tone */
    boom(i = 0) { V.thud(); const f = CHORD[i % 5]; tone(f, f * 0.98, 1.6, 0.07, 'triangle'); tone(f * 1.5, f * 1.48, 1.1, 0.025, 'sine', 0.03); noise(0.4, 300, 0.7, 0.05); },
    /** the whole chord (the five, after the last) */
    chord() { CHORD.forEach((f, i) => { tone(f, f * 0.99, 2.6, 0.04, 'triangle', i * 0.09); }); tone(65.4, 65, 2.8, 0.05, 'sine'); },
    taut() { tone(220, 330, 0.12, 0.03, 'triangle'); },
    glow() { tone(523, 523, 0.5, 0.025, 'sine'); tone(784, 784, 0.6, 0.018, 'sine', 0.08); },
    lower() { tone(110, 90, 1.8, 0.03, 'sawtooth'); },                     // the machine's rope paying out (a wooden drum)
    tok() { V.thud(); tone(95, 60, 0.5, 0.09, 'triangle'); V.knock(1.2); },  // a pole locked: a deep "תוק"
    seat() { V.knock(1.6); tone(180, 140, 0.15, 0.04, 'triangle'); },
    rim() { noise(0.25, 1400, 1.2, 0.05); V.knock(2.2); },                 // wood scraping stone
    crack() { noise(0.5, 900, 3, 0.06); tone(70, 45, 0.6, 0.04, 'sawtooth'); },
    rustle(k = 1) { noise(0.22, 700, 0.9, 0.035 * k); },                   // the gold chains: low, dull, near (no ring)
    breath() { noise(0.7, 500, 0.5, 0.025); },
    wind() { noise(1.1, 420, 0.4, 0.05); noise(0.9, 900, 0.6, 0.02, 0.15); },
    flap() { noise(0.12, 1200, 1, 0.025); noise(0.12, 1200, 1, 0.02, 0.18); },
    shine() { tone(988, 1175, 0.6, 0.03); tone(1319, 1319, 0.8, 0.02, 'sine', 0.12); },   // a crown in the sun (soft: no metal ring)
    spark() { tone(700, 900, 0.08, 0.02); },
    hush() { V.stop && V.stop(); },
  });
}
/** a hand's ring under the thumb (DOM, no pointer events): show(x, y, k 0 … 1 filled) / hide() */
export function ring(color, size = 56) {
  let el = null;
  try { el = document.createElement('div'); el.className = 'h109-ui h136-ring'; el.style.cssText = `position:fixed;z-index:5;pointer-events:none;width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;border-radius:50%;border:4px solid ${color};box-sizing:border-box;display:none;box-shadow:0 0 8px ${color}`; document.body.appendChild(el); } catch (e) { el = null; }
  return {
    el,
    /** o: { q: 0 … 1 the quiet growing (a white halo widening), win: 0 … 1 what is left of a window (the ring swells, white, pulsing), halo: the glow's colour } */
    show(x, y, k = 0, glow = false, o = null) {
      if (!el) return; el.style.display = 'block'; el.style.left = x + 'px'; el.style.top = y + 'px';
      el.style.background = `radial-gradient(circle, ${color} ${Math.round(k * 62)}%, transparent ${Math.round(k * 62) + 4}%)`;
      const q = o && o.q > 0 ? Math.min(1, o.q) : 0, w = o && o.win > 0 ? Math.min(1, o.win) : 0;
      el.style.opacity = glow || w ? '1' : '0.85';
      el.style.borderColor = w ? (Math.floor(performance.now() / 110) % 2 ? '#FFFFFF' : color) : color;
      el.style.transform = w ? `scale(${(1.15 + 0.25 * w).toFixed(2)})` : glow ? `scale(${(1.06 + 0.06 * Math.sin(performance.now() / 160)).toFixed(3)})` : '';
      el.style.boxShadow = glow ? `0 0 22px 8px ${(o && o.halo) || '#FFF0B8'}` : q ? `0 0 ${Math.round(6 + 14 * q)}px ${Math.round(4 * q)}px rgba(255,248,220,${(0.3 + 0.5 * q).toFixed(2)})` : `0 0 8px ${color}`;
    },
    hide() { if (el) el.style.display = 'none'; },
    remove() { try { if (el) el.remove(); } catch (e) { /* */ } },
  };
}
