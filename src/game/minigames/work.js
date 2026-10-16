/* ── fable20 ── the general work under two thumbs (FUN19 §2, binding; the owner's notes 2, 13, 19, 21): the model of every job the world
 * has no craft of its own for — the course stone (F1, arch), the sea-wave course, the letters, the well's wheel, the aqueduct's channel,
 * the rafts. The touch-down drops his tool at once (the world strikes: stages.craft.work), the impact is the act, graded on the music's
 * beat (acts.js: gold ±90 ms, ±120 at L1; a tap on a drag/pull job ≤ good — on a tap job a tap may be gold). N acts by level finish the
 * job; a clean half (no soft act) +60 "עבודה נקייה". A miss never subtracts; taps alone always finish. */
import { act as caAct, bonus as caBonus, actsQ as caQ, beatQ as caBeatQ } from './acts.js';

export const WORK_N = [6, 8, 10, 12, 12];
const TAP_JOBS = { aqueduct: 1 };

export function workModel({ level = 0, kind = 'work', job = 'F1' } = {}) {
  const L = Math.max(0, Math.min(4, level | 0)), n = WORK_N[L], tapOk = !!TAP_JOBS[job];
  const M = {
    kind: 'work', game: kind, job, juice: true, twinOnly: true, level: L, n, i: 0, k: 0, cur: null, pressed: false, queue: [], pending: 0, soft: [false, false],
    phase: 'work', t: 0, pt: 0, d0x: 0, d0y: 0, d0on: false, d0used: false, fx: [], acts: [], pts: 0, done: false, progress: 0,
    coach: 'הקישו על \'עבודה\' בקצב המוזיקה — כל הקשה: פעולה. בקצב — זהב',
    /** a stroke asked for (the world strikes it: its contact calls impact) */
    want(it) { if (this.phase !== 'work' || this.pending >= 2) return null; this.pending++; this.queue.push(it); return it; },
    /** the touch-down IS the stroke's start; released unmoved = a tap */
    touch(down) {
      if (down) { this.cur = this.want({ moved: false, up: false }); this.pressed = true; }
      else if (this.cur) { this.cur.up = true; this.cur = null; }
    },
    /** the tool met the piece: the act */
    impact(it) {
      if (this.phase !== 'work') return null;
      const tap = it === true || !!(it && it.up && !it.moved);
      const a = caAct(this, caBeatQ(L), { tap: tap && !tapOk, power: 1, x: 0.5, y: 0.35 });
      if (a.q === 0) this.soft[this.i >= n / 2 ? 1 : 0] = true;
      this.i++; this.k = this.i; this.progress = Math.round(100 * this.i / n);
      if (this.i === Math.ceil(n / 2) && !this.soft[0]) caBonus(this, 60, 'עבודה נקייה');
      if (this.i >= n) { if (!this.soft[1]) caBonus(this, 60, 'עבודה נקייה'); this.phase = 'end'; this.pt = 0; this.fx.push({ sfx: 'chime', o: { combo: 6 } }); }
      return a;
    },
    step(dt) {
      if (this.done) return; this.t += dt; this.pt += dt;
      // no world craft striking (it refused: played at his hands): the queued stroke lands by itself 90 ms after its touch
      if (!this.worldOn && this.queue.length) { this.wait = (this.wait || 0) + dt; if (this.wait >= 0.09) { this.wait = 0; const it = this.queue.shift(); this.pending = Math.max(0, this.pending - 1); this.impact(it); } }
      if (this.phase === 'end' && this.pt > 1.1 && !this.pending) { this.done = true; this.phase = 'done'; this.progress = 100; }
    },
    drag(x, y, ph) {
      if (this.phase !== 'work') return;
      if (ph === 'down') { this.d0on = true; this.d0used = false; this.d0x = x; this.d0y = y; return; }
      if (!this.d0on) return;
      if (ph === 'move') { if (!this.d0used && Math.hypot(x - this.d0x, y - this.d0y) * 160 >= 26 - 18) { this.d0used = true; if (this.cur) this.cur.moved = true; else if (!this.pressed) this.want({ moved: true, up: false }); } return; }
      this.d0on = false;
    },
    twinTap() { if (this.pressed) { this.pressed = false; return; } this.want({ moved: false, up: true }); },   // (the press already struck)
    tap() { this.want({ moved: false, up: true }); },
    cue() { return null; },
    auto() { return null; },
    result() { const q = caQ(this, 0.8); return { quality: q, perfect: q >= 0.97 && this.acts.length > 0, score: this.pts | 0, acts: this.i }; },
  };
  return M;
}
export const work = { kind: 'work', model: workModel, twinOnly: true, beatRing: true, hint: 'הקשה בקצב — פעולה', howto: 'כל הקשה על העבודה היא פעולה; בקצב המוזיקה — זהב' };
// ── /fable20 ──
