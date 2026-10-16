/* החוט הצבוע (the snap-line, FUN14 wave 14 — her ❤️): every walled course opens with it. The cord, dyed red with chalk, is
 * stretched along the course between two pegs; lift its middle, let go — snap! — and a straight red line is left on the stone.
 * The line is how the masons know where the course runs.
 * Gesture: drag the cord's middle up and let go when the lift is in the gold band (GAMES14's drag channel: M.drag). Before the
 * drag channel, two taps: the first grabs the cord (the hand lifts it, up and down), the second lets go — at the gold band.
 * Too little lift: a faint line; too much: the cord slips and the line blurs. L1: 2 lines, a wide band · L2: 3 · L3: 3, a
 * narrower band and a breeze that sways the cord. Source: "וקו ינטה על ירושלים" (זכריה א, טז — these words only); the
 * dyed snap-line itself is המחשה. */
import { clamp } from './frame.js';

export const snap = {
  kind: 'snap', topic: 'stone', n: 'החוט הצבוע', kicker: 'פותחים נדבך', step: 'line', secs: [5, 9],
  hint: 'הרם את החוט באמצע ושחרר כשהוא בפס הזהוב',
  howto: 'גרור את החוט למעלה ושחרר בפס הזהוב: טראח! קו אדום על האבן', guide: 1,
  fact: { he: '"וקו ינטה על ירושלים": הבנאים מתחו חוט כדי שהנדבך יהיה ישר. החוט הצבוע שמשאיר קו על האבן הוא המחשה.', ref: 'זכריה א, טז', status: 'draft', illus: true },

  model({ level = 0, rng = Math.random, setup = {} } = {}) {
    const L = clamp(level | 0, 0, 2), lines = L ? 3 : 2;
    const band = [0.55 - 0.03 * L, 0.78 - 0.06 * L];           // the gold band of the lift (0…1)
    const M = {
      level: L, lines, r: 0, phase: 'show', pt: 0, lift: 0, held: false, mode: null, q: [], done: false, progress: 0, fx: [],
      band, wind: 0, drawn: [], grabT: 0, err: 0.03 + 0.04 * rng(), y0: 0,
      cordY() { return 0.42 + 0.12 * this.r; },                // each line a little lower on the course
      step(dt) {
        if (this.done) return;
        this.pt += dt;
        this.wind = L >= 2 ? 0.05 * Math.sin(this.pt * 2.3) : 0;
        if (this.phase === 'show' && this.pt > 0.35) { this.phase = 'ready'; this.pt = 0; }
        if (this.phase === 'lift' && this.mode === 'tap') {    // (two taps: the hand lifts the cord slowly, then lets it sag back)
          this.grabT += dt;
          const per = 1.7 - 0.25 * L, u = this.grabT % (per + 0.45);
          this.lift = u < per ? u / per : Math.max(0, 1 - (u - per) / 0.45);   // (a slow, even rise: ≈ 0.4 s in the gold band at L1)
          if (this.grabT > (per + 0.45) * 3.2 && !this.patient) this.release();
        }
        if (this.phase === 'ready' && this.pt > 6 && !this.patient) { this.phase = 'lift'; this.mode = 'tap'; this.lift = 0.3; this.release('הצוות מתח בעצמו'); }
        if (this.phase === 'snap' && this.pt > 0.75) {
          this.r++;
          if (this.r >= lines) { this.done = true; this.phase = 'done'; } else { this.phase = 'ready'; this.pt = 0; this.lift = 0; this.mode = null; }
        }
      },
      inBand(v = this.lift + this.wind) { return v >= band[0] && v <= band[1]; },
      release(say) {
        if (this.phase !== 'lift') return;
        const v = this.lift + this.wind, mid = (band[0] + band[1]) / 2, half = (band[1] - band[0]) / 2;
        const q = this.inBand(v) ? (Math.abs(v - mid) < half * 0.5 ? 1 : 0.9) : clamp(1 - (Math.abs(v - mid) - half) * 2.4, 0.3, 0.85);
        this.q.push(q); this.drawn.push({ y: this.cordY(), q }); this.progress++;
        this.phase = 'snap'; this.pt = 0; this.held = false;
        this.fx.push({ sfx: q >= 0.9 ? 'split' : 'thud', haptic: q >= 0.9 ? [12, 30, 12] : 12, shake: q >= 0.9 ? 0.6 : 0.2, dust: { x: 0.5, y: this.cordY(), n: q >= 0.9 ? 18 : 8 },
          pop: { t: say || (q >= 1 ? 'טראח! ישר!' : q >= 0.9 ? 'קו יפה' : v < band[0] ? 'חלש מדי' : 'החוט החליק'), x: 0.5, y: this.cordY() - 0.12, kind: q >= 0.9 ? 'good' : 'bad' } });
        if (q >= 1) this.fx.push({ sfx: 'chime', o: { combo: this.q.filter((k) => k >= 1).length + 2 } });
      },
      /* two taps (before the drag channel, and the autopilot): grab, then let go */
      tap() {
        if (this.done) return;
        if (this.phase === 'ready') { this.phase = 'lift'; this.mode = 'tap'; this.grabT = 0; this.lift = 0; this.held = true; this.fx.push({ sfx: 'creak', haptic: 8 }); return; }
        if (this.phase === 'lift' && this.mode === 'tap') this.release();
      },
      /* the drag channel (GAMES14): down on the cord, lift it, let go */
      drag(x, y, ph) {
        if (this.done) return;
        if (ph === 'down') {
          if (this.phase === 'lift' && this.mode === 'tap') { this.release(); return; }   // (two taps work on the drag channel too)
          if (this.phase !== 'ready') return;
          this.phase = 'lift'; this.mode = 'drag'; this.held = true; this.y0 = Math.max(y, this.cordY() - 0.05); this.lift = 0; this.downT = this.pt; this.moved = 0;
          this.fx.push({ sfx: 'creak', haptic: 8 });
        } else if (ph === 'move' && this.phase === 'lift' && this.mode === 'drag') {
          this.moved = Math.max(this.moved || 0, Math.abs(this.y0 - y));
          this.lift = clamp((this.y0 - y) / 0.36, 0, 1.15);
        } else if ((ph === 'up' || ph === 'cancel') && this.phase === 'lift' && this.mode === 'drag') {
          if ((this.moved || 0) < 0.03) { this.mode = 'tap'; this.grabT = 0; return; }   // (a tap, not a pull: the hand lifts it; the next tap lets go)
          this.release();
        }
      },
      cue() {
        if (this.done || this.phase === 'snap') return null;
        const cy = this.cordY();
        if (this.phase === 'lift' && this.mode === 'tap') return { x: 0.5, y: cy - 0.3, now: this.inBand(), timed: true };
        return { x: 0.5, y: cy, x2: 0.5, y2: cy - 0.24 };
      },
      auto() {
        if (this.phase === 'ready' && this.pt > 0.3) return true;
        return this.phase === 'lift' && this.mode === 'tap' && Math.abs(this.lift + this.wind - (band[0] + band[1]) / 2) < this.err + 0.02 && this.grabT > 0.2;
      },
      result() {
        const quality = this.q.length ? this.q.reduce((a, b) => a + b, 0) / this.q.length : 0;
        return { quality, perfect: this.q.length === lines && this.q.every((k) => k >= 1), score: Math.round(quality * 200) + this.q.filter((k) => k >= 1).length * 25 };
      },
    };
    return M;
  },

  draw(g, M, W, H, fx) {
    const sh = fx && fx.shake ? fx.shake : 0;
    g.save(); g.translate(sh * (Math.random() - 0.5), 0);
    g.fillStyle = '#2E2416'; g.fillRect(0, 0, W, H);
    // the course: dressed blocks with drafted margins, of mixed lengths
    const top = H * 0.3, rowH = H * 0.24;
    for (let row = 0; row < 3; row++) {
      let x = -W * 0.08 + (row % 2) * W * 0.1;
      const lens = [0.28, 0.22, 0.34, 0.26, 0.3];
      for (let i = 0; x < W; i++) {
        const w = W * lens[(i + row * 2) % lens.length];
        g.fillStyle = row === 0 ? '#D8C49A' : '#C9B285'; g.fillRect(x + 2, top + row * rowH + 2, w - 4, rowH - 4);
        g.strokeStyle = 'rgba(120,92,52,.55)'; g.lineWidth = 1.5; g.strokeRect(x + 7, top + row * rowH + 7, w - 14, rowH - 14);
        x += w;
      }
    }
    // the lines already snapped
    for (const d of M.drawn) {
      g.strokeStyle = d.q >= 0.9 ? 'rgba(178,34,34,.92)' : 'rgba(178,34,34,.45)'; g.lineWidth = d.q >= 0.9 ? 3 : 5;
      g.beginPath(); g.moveTo(W * 0.06, d.y * H); g.lineTo(W * 0.94, d.y * H); g.stroke();
    }
    if (M.phase === 'done') { g.restore(); return; }
    // the gold band: where the lift should be when she lets go
    const cy = M.cordY() * H, maxL = H * 0.36;
    const b0 = cy - M.band[1] * maxL, b1 = cy - M.band[0] * maxL;
    g.fillStyle = M.phase === 'lift' && M.inBand() ? 'rgba(255,214,110,.42)' : 'rgba(255,214,110,.2)';
    g.fillRect(W * 0.36, b0, W * 0.28, b1 - b0);
    g.strokeStyle = '#FFD66E'; g.lineWidth = 2; g.strokeRect(W * 0.36, b0, W * 0.28, b1 - b0);
    // the pegs and the cord
    g.fillStyle = '#6B4A2A'; g.fillRect(W * 0.05 - 4, cy - 14, 8, 28); g.fillRect(W * 0.95 - 4, cy - 14, 8, 28);
    const ly = M.phase === 'snap' ? cy : cy - (M.lift + M.wind) * maxL;
    g.strokeStyle = '#C0392B'; g.lineWidth = 3.5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(W * 0.05, cy); g.lineTo(W * 0.5, M.phase === 'show' || M.phase === 'ready' ? cy + 3 : ly); g.lineTo(W * 0.95, cy); g.stroke();
    // the hand on the cord while it is held
    if (M.held) { g.fillStyle = '#FFF6DA'; g.beginPath(); g.arc(W * 0.5, ly - 4, 9, 0, Math.PI * 2); g.fill(); }
    g.font = '700 14px Heebo, system-ui, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#F3E6C4'; g.direction = 'rtl';
    g.fillText(`קו ${Math.min(M.r + 1, M.lines)} מתוך ${M.lines}`, W / 2, H * 0.1);
    g.restore();
  },
};
// ── crafta19 ── the dyed cord IN THE WORLD under two thumbs (FUN19 §2, binding; the owner's note 17: "החוט האדום לפילוס יפה אבל נעדר
// משמעות ולא מתיישר"). PULL: the thumb drags back from the work button — the farther, the tighter (120 px = full); the cord in the world
// goes from a slack sag to dead straight and from dull to bright red as the tension rises, and the kohen leans back on it. RELEASE =
// the snap (the impact): 90–100 % gold (a straight line), 75–90 % good (it prints a little wavy), else ok — over 105 % the cord slips
// (good). The red line stays on the course; the stones are laid along it. A tap: the crew's hand tensions it to good and he lets go.
// L1 one cord · L2/L3 two (a corner). The dyed cord itself: המחשה; "וקו ינטה על ירושלים" (זכריה א, טז).
import { act as caAct, actsQ as caQ } from './acts.js';
const CA_FULL = 120;
function cordModel({ level = 0 } = {}) {
  const L = clamp(level | 0, 0, 2), lines = L >= 1 ? 2 : 1;
  const M = {
    kind: 'snap', juice: true, twinOnly: true, level: L, lines, r: 0, phase: 'ready', pt: 0, t: 0, tension: 0, lift: 0, wind: 0, held: false, q: [], fx: [], acts: [], pts: 0, done: false, progress: 0,
    x0: 0, y0: 0, autoT: 0, grip: 0, h: 0, tol: 0.075, mark() { return 0.975; },   // (hands.js's meter by the cord: the tension against its gold band)
    coach: 'משכו לאחור מהכפתור — החוט נמתח ומתיישר. שחררו כשהוא ישר: טראח!',
    cordY() { return 0.42; },
    step(dt) {
      if (this.done) return;
      this.t += dt; this.pt += dt;
      if (this.phase === 'auto') { this.autoT += dt; this.tension = Math.min(0.82, this.autoT / 0.55 * 0.82); if (this.autoT >= 0.6) this.release(true); }
      this.h = this.phase === 'snap' ? 0 : Math.max(this.tension, this.grip);
      if (this.phase === 'snap' && this.pt > 0.9) { this.r++; this.tension = 0; if (this.r >= lines) { this.done = true; this.phase = 'done'; } else { this.phase = 'ready'; this.pt = 0; if (this.qTap) { this.qTap = 0; this.twinTap(); } } }
    },
    /** the snap: graded by the tension at the release (the impact) */
    release(tap) {
      if (this.phase !== 'pull' && this.phase !== 'auto') return;
      const v = this.tension, q = v >= 0.9 && v <= 1.05 ? 2 : v >= 0.75 ? 1 : 0;
      this.q.push(q === 2 ? 1 : q === 1 ? 0.85 : 0.6); this.progress++; this.held = false;
      this.phase = 'snap'; this.pt = 0;
      caAct(this, q, { tap: !!tap, power: v, x: 0.5, y: 0.3 });
      this.fx.push({ sfx: q === 2 ? 'split' : 'thud', haptic: q === 2 ? [12, 30, 12] : 12 });
    },
    drag(x, y, ph) {
      if (this.done) return;
      if (ph === 'down') { if (this.phase !== 'ready') return; this.phase = 'pull'; this.held = true; this.x0 = x; this.y0 = y; this.tension = 0.05; this.fx.push({ sfx: 'creak', haptic: 8 }); return; }
      if (this.phase !== 'pull') return;
      if (ph === 'move') { this.tension = clamp(Math.hypot(x - this.x0, y - this.y0) * 160 / (CA_FULL - 18), 0, 1.15); return; }
      if (ph === 'up') this.release(false);
      else if (ph === 'cancel') { this.phase = 'ready'; this.held = false; this.tension = 0; }
    },
    /** the touch-down (hands.js 'press'): his grip takes up the slack at once — the lean's first frame */
    touch(down) { this.grip = down && this.phase === 'ready' ? 0.08 : 0; },
    twinTap() { if (this.phase === 'ready') { this.phase = 'auto'; this.autoT = 0; this.held = true; } else if (this.phase === 'snap') this.qTap = 1; },
    tap() { this.twinTap(); },
    cue() { return null; },
    auto() { return null; },
    result() { const q = caQ(this, 0.8); return { quality: q, perfect: q >= 0.97 && this.acts.length === lines, score: this.pts | 0, lines: this.r }; },
  };
  return M;
}
snap.world = { kind: 'snap', model: cordModel, twinOnly: true, hint: 'משכו לאחור — ושחררו כשהחוט ישר', howto: 'משיכה לאחור מותחת את החוט; שחרור = טראח! קו אדום על הנדבך', fact: snap.fact };
// ── /crafta19 ──
