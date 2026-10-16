/* הגלגל על הבור (FUN14, wave 14 — her ❤️): "לשכת הגולה, שם היה בור קבוע, והגלגל נתון עליו, ומשם מספיקים מים לכל העזרה"
 * (מדות ה, ד). Turn the wheel over the cistern: the bucket comes up full, tips into the channel, and the court's basin fills
 * to the gold line. Gesture: circle the finger round the wheel (GAMES14's drag channel); before it, tap the handle as it
 * passes the gold mark at the top — each push in time turns the wheel faster. Too fast and the bucket spills (a little
 * water lost, never a loss of the job). L1: 3 buckets · L2: 4 · L3: 5, a heavier bucket. At the kiyor the same wheel is the
 * mukhni (יומא ג, י: "ואף הוא עשה מוכני לכיור"). */
import { clamp } from './frame.js';

export const wheel = {
  kind: 'wheel', topic: 'water', n: 'הגלגל על הבור', kicker: 'לשכת הגולה', step: 'water', secs: [15, 25],
  hint: 'הקש על הידית כשהיא עוברת בסימן הזהוב — והגלגל מסתובב',
  howto: 'סובב את הגלגל: הקש על הידית בכל פעם שהיא עוברת בסימן הזהוב למעלה', guide: 2,
  fact: { he: '"לשכת הגולה, שם היה בור קבוע, והגלגל נתון עליו, ומשם מספיקים מים לכל העזרה".', ref: 'מדות ה, ד', status: 'draft', illus: false },

  model({ level = 0, rng = Math.random, setup = {} } = {}) {
    const L = clamp(level | 0, 0, 2), need = 3 + L, heavy = 1 + 0.15 * L;
    const M = {
      level: L, need, a: Math.PI / 2, v: 0, lift: 0, full: 0, basin: 0, spills: 0, pushes: [], t: 0, pt: 0, done: false, progress: 0, fx: [],
      tip: 0, err: 0.15 + 0.1 * rng(), dragA: null, kiyor: setup.site === 'kiyor',
      handle() { return { x: 0.5 + Math.cos(this.a) * 0.2, y: 0.38 - Math.sin(this.a) * 0.2 * 1.25 }; },
      near() { const d = Math.atan2(Math.sin(this.a - Math.PI / 2), Math.cos(this.a - Math.PI / 2)); return Math.abs(d) < 0.38; },
      step(dt) {
        if (this.done) return;
        this.t += dt; this.pt += dt;
        // the wheel turns (friction), the rope winds the bucket up; at the top it tips into the channel, then drops again
        this.v = Math.max(0, this.v - dt * (0.45 + 0.1 * L));
        this.a += this.v * dt;
        if (!this.near()) this.passed = false;            // (one push a turn: the handle left the gold mark)
        if (this.tip > 0) { this.tip -= dt; if (this.tip <= 0) { this.lift = 0; } return; }
        this.lift += this.v * dt * 0.06;
        if (this.v > 8) { this.spills++; this.v = 5; this.lift = Math.max(0, this.lift - 0.15); this.fx.push({ sfx: 'crack', pop: { t: 'לאט! המים נשפכים', x: 0.5, y: 0.6, kind: 'bad' } }); }
        if (this.lift >= 1) {
          this.basin++; this.progress++; this.tip = 0.7;
          this.fx.push({ sfx: 'split', haptic: [10, 30, 10], dust: { x: 0.8, y: 0.62, n: 10 }, pop: { t: this.basin >= need ? 'הכיור מלא!' : `דלי ${this.basin} מתוך ${need}`, x: 0.72, y: 0.52, kind: 'good' } });
          if (this.basin >= need) { this.done = true; this.fx.push({ sfx: 'chime', o: { combo: 8 } }); }
        }
        if (!this.patient && this.pt > 4 && this.v < 0.5) { this.v = 3.5; this.pt = 0; this.pushes.push(0.5); }
      },
      push(q) { this.passed = true; this.v = Math.min(8, this.v + ((1.6 + 2.4 * q) / heavy) * (1 - this.v / 9)); this.pushes.push(q); this.pt = 0; this.fx.push({ sfx: q >= 0.9 ? 'perfect' : 'strike', haptic: q >= 0.9 ? 12 : 6 }); },
      tap(x = 0.5, y = 0.5) {
        if (this.done) return;
        if (this.near() && !this.passed) { this.push(1); return; }
        if (this.near()) return;
        if (this.v < 0.6) { this.push(0.6); return; }       // (a wheel that stopped: any push starts it again)
        this.pushes.push(0); this.fx.push({ pop: { t: 'חכה לסימן הזהוב', x: 0.5, y: 0.08, kind: 'bad' } });
      },
      drag(x, y, ph) {
        if (this.done) return;
        const ang = Math.atan2(-(y - 0.38) / 1.25, x - 0.5);
        if (ph === 'down') { this.dragA = ang; if (this.near() && !this.passed) this.push(1); else if (this.v < 0.6) this.push(0.6); return; }   // (on the drag channel a tap still pushes on the gold mark; circling never counts a miss)
        if (ph === 'move' && this.dragA != null) {
          let d = ang - this.dragA; d = Math.atan2(Math.sin(d), Math.cos(d));
          this.dragA = ang;
          if (Math.abs(d) > 0.02) { this.v = Math.min(9, Math.max(this.v, Math.abs(d) * 22 / heavy)); this.a += Math.abs(d) * 0.3; this.pt = 0; }
          return;
        }
        if (ph === 'up' || ph === 'cancel') this.dragA = null;
      },
      cue() { return this.done ? null : { x: 0.5, y: 0.14, now: this.near(), timed: true }; },
      auto() { return this.near() && !this.passed && this.tip <= 0; },
      result() {
        const par = 10 + 4 * L, slow = Math.max(0, this.t - par) / 30;
        const acc = this.pushes.length ? this.pushes.reduce((a, b) => a + b, 0) / this.pushes.length : 0.5;
        const quality = clamp(0.5 * acc + 0.5 - slow - 0.08 * this.spills, 0.3, 1);
        return { quality, perfect: this.spills === 0 && acc > 0.95 && slow === 0, score: Math.round(quality * 250) };
      },
    };
    return M;
  },

  draw(g, M, W, H) {
    g.fillStyle = '#2E2416'; g.fillRect(0, 0, W, H);
    const cx = W * 0.5, cy = H * 0.38, R = W * 0.2;
    // the cistern's mouth and the posts
    g.fillStyle = '#5A4630'; g.fillRect(cx - R * 1.4, H * 0.78, R * 2.8, H * 0.06);
    g.fillStyle = '#1B2733'; g.fillRect(cx - R * 1.2, H * 0.84, R * 2.4, H * 0.16);
    g.fillStyle = '#7A5A36'; g.fillRect(cx - R * 1.35, cy - 6, 10, H * 0.46); g.fillRect(cx + R * 1.35 - 10, cy - 6, 10, H * 0.46);
    // the basin of the court, filling to the gold line
    const bx = W * 0.74, by = H * 0.56, bw = W * 0.22, bh = H * 0.22;
    g.fillStyle = '#C9B285'; g.fillRect(bx, by, bw, bh);
    g.fillStyle = '#4C8DB8'; const f = M.basin / M.need; g.fillRect(bx + 4, by + bh - 4 - (bh - 8) * f, bw - 8, (bh - 8) * f);
    g.strokeStyle = '#FFD66E'; g.lineWidth = 2; g.beginPath(); g.moveTo(bx, by + 6); g.lineTo(bx + bw, by + 6); g.stroke();
    // the wheel and its spokes, the handle, the gold mark at the top
    g.strokeStyle = '#8B5A2B'; g.lineWidth = 7; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 3; for (let k = 0; k < 6; k++) { const a = M.a + (k * Math.PI) / 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R, cy - Math.sin(a) * R); g.stroke(); }
    g.fillStyle = M.near() ? 'rgba(255,214,110,.55)' : 'rgba(255,214,110,.25)'; g.beginPath(); g.arc(cx, cy - R - 2, 16, 0, Math.PI * 2); g.fill();
    const hx = cx + Math.cos(M.a) * R, hy = cy - Math.sin(M.a) * R;
    g.fillStyle = '#FFF6DA'; g.beginPath(); g.arc(hx, hy, 10, 0, Math.PI * 2); g.fill();
    // the rope and the bucket (it rises with the lift, tips at the top)
    const yb = H * 0.92 - (H * 0.92 - (cy + R * 0.3)) * Math.min(1, M.lift);
    g.strokeStyle = '#CDBB93'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, yb); g.stroke();
    g.save(); g.translate(cx, yb); if (M.tip > 0) g.rotate(-0.9);
    g.fillStyle = '#6B4A2A'; g.fillRect(-12, 0, 24, 20); g.fillStyle = '#4C8DB8'; g.fillRect(-10, 2, 20, 6); g.restore();
    g.font = '700 14px Heebo, system-ui, sans-serif'; g.textAlign = 'center'; g.direction = 'rtl'; g.fillStyle = '#F3E6C4';
    g.fillText(`${M.kiyor ? 'מי הכיור' : 'מים לעזרה'}: ${M.basin} מתוך ${M.need}`, W / 2, H * 0.08);
  },
};
