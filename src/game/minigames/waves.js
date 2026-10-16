/* גלי הים (the sea's waves) — GAMES14, wave 14 (JOINT #10, HISTORY14: the House's stone card at ulam · heichal · kodesh).
 * Herod's House rose in courses, one jutting out and the next set in, "so that it would hold the plaster" — and the sages
 * told him to leave it ungilded, for so it looks like the waves of the sea. A side view of the wall: drag each new stone
 * from its rope onto the wall and let go on its depth mark (out, then in, then out…). The finished wall ripples.
 * Levels (FUN14's 0–2): L1 9 stones, a wide mark · L2 10, narrower, the stone sways while held · L3 11, narrower still.
 * q = .7 on the mark + .3 par. The autopilot drags each stone to its mark. */
import { clamp } from './frame.js';

const FACT = { he: 'את הבית בנה הורדוס נדבך יוצא ונדבך נכנס — "אפיק שפה ועייל שפה, כי היכי דנקביל סידא"; רצה לצפותו זהב, וחכמים אמרו: השאר, כך הוא דומה לגלי הים. הגרירה כאן — המחשה.', ref: 'בבא בתרא ד, א', status: 'draft', illus: true };
const OUT = 0.62, IN = 0.53, START = 0.86, CH = 0.075, BASE = 0.92;

function model({ level = 0, rng = Math.random } = {}) {
  const L = clamp(+level || 0, 0, 2), n = 9 + Math.round(L), tol = 0.034 - 0.008 * L, sway = 0.012 * L;
  const first = rng() < 0.5 ? 'out' : 'in';
  const parT = n * 3 + 3;
  const M = {
    kind: 'waves', level: L, n, i: 0, x: 1.15, set: [], accs: [], t: 0, pt: 0, phase: 'bring', grab: null, quiet: 0, words: 0,
    done: false, progress: 0, fx: [], _a: null, tol, first,
    want(i = this.i) { return (i % 2 === 0) === (first === 'out') ? 'out' : 'in'; },
    target(i = this.i) { return this.want(i) === 'out' ? OUT : IN; },
    sx() { return this.x + (this.grab ? sway * Math.sin(this.t * 7) : 0); },     // where the stone hangs now (it sways while held, L2–L3)
    drag(x, y, ph, id) {
      if (this.done) return;
      if (this.phase === 'bring' && ph === 'down') { this.phase = 'hang'; this.pt = 0; this.quiet = 0; this.x = START; }   // (v27: an eager finger — the stone comes to the hand before the crane's swing ends)
      if (this.phase !== 'hang') return;
      if (ph === 'down') { this.grab = { id, x0: x, s0: this.x, moved: 0 }; return; }
      const gb = this.grab; if (!gb || gb.id !== id) return;
      if (ph === 'move') { this.x = clamp(gb.s0 + (x - gb.x0), 0.3, 0.95); gb.moved = Math.max(gb.moved, Math.abs(this.x - gb.s0)); if (gb.moved > 0.01) this.quiet = 0; return; }
      const sx = this.sx(); this.grab = null;
      if (ph === 'cancel') return;                        // a lost finger (or the autopilot's, at a takeover) sets nothing
      if (gb.moved < 0.05) { if (this.words++ < 3) this.fx.push({ hint: 'גרור את האבן אל הסימן הזהוב, ושחרר שם' }); return; }
      this.place(sx);
    },
    tap(x = 0.5) { if (this.phase === 'hang') { this.x = clamp(x, 0.3, 0.95); this.place(this.x); } },
    place(sx, crew) {
      const err = Math.abs(sx - this.target()), acc = (err <= tol ? 1 : clamp(1 - (err - tol) / (tol * 4))) * (crew ? 0.3 : 1);
      this.set.push({ x: err <= tol * 2 ? this.target() : sx, ok: err <= tol }); this.accs.push(acc);
      this.phase = 'drop'; this.pt = 0; this.progress = this.i + 1; this.quiet = 0;
      const word = this.want() === 'out' ? 'שפה יוצאת!' : 'שפה נכנסת!';
      this.fx.push({ sfx: acc >= 1 ? 'settle' : 'thud', haptic: acc >= 1 ? [8, 20, 8] : 15, dust: { x: sx, y: this.rowY(this.i), n: 8 }, pop: { t: crew ? 'הצוות הניח' : acc >= 1 ? word : sx < this.target() ? 'עמוק מדי' : 'בולט מדי', x: 0.5, y: 0.12, kind: acc >= 1 ? 'good' : 'bad' } });
      if (acc >= 1 && this.accs.slice(-3).length === 3 && this.accs.slice(-3).every((a) => a >= 1)) this.fx.push({ sfx: 'chime', o: { combo: this.accs.length } });
    },
    rowY(i) { return BASE - (i + 1) * CH; },
    step(dt) {
      if (this.done) return;
      this.t += dt; this.pt += dt; this.quiet += dt;
      if (this.phase === 'bring') { const k = Math.min(1, this.pt / 0.9); this.x = 1.15 - (1.15 - START) * k * (2 - k); if (k >= 1) { this.phase = 'hang'; this.pt = 0; this.quiet = 0; } }   // the crane swings the next stone in
      if (this.phase === 'drop' && this.pt > 0.45) {
        this.i++; this.pt = 0;
        if (this.i >= n) { this.phase = 'waves'; this.fx.push({ sfx: 'chime', o: { combo: 6 }, haptic: [10, 30, 10, 30, 10], pop: { t: 'כמו גלי הים!', x: 0.5, y: 0.1, kind: 'big' } }); }
        else { this.phase = 'bring'; this.x = 1.15; }
      } else if (this.phase === 'waves' && this.pt > 1.6) { this.done = true; this.phase = 'done'; }
      if (this.phase === 'hang' && !this.patient && !this.hold && this.quiet > 3) this.place(this.target(), true);   // a test's idle hand: the crew sets it
    },
    cue() {
      if (this.phase === 'hang') return { x: this.x, y: this.rowY(this.i) - 0.06, x2: this.target(), y2: this.rowY(this.i) - 0.06, ms: 1500 };
      if (this.phase === 'bring' && this.hold) return { x: START, y: this.rowY(this.i) - 0.06, x2: this.target(), y2: this.rowY(this.i) - 0.06, ms: 1500 };   // (v27: the how-to's hand shows the move while the crane still swings the stone in)
      return null;
    },
    auto() {
      if (this.phase !== 'hang') return this.grab ? { x: 0.5, y: 0.5, p: 'up', id: 1 } : null;
      const y = this.rowY(this.i) - 0.06;
      if (!this.grab) { this._a = { x: this.x, k: 0 }; return { x: this.x, y, p: 'down', id: 1 }; }
      const a = this._a, d = this.target() - this.sx();
      if (a.k++ > 6 && Math.abs(d) < tol * 0.4) return { x: a.x, y, p: 'up', id: 1 };
      a.x += clamp(d, -0.025, 0.025); return { x: a.x, y, p: 'move', id: 1 };
    },
    result() {
      const mean = (x, d) => (x.length ? x.reduce((s, v) => s + v, 0) / x.length : d);
      const acc = mean(this.accs, 0.3), quality = clamp(0.7 * acc + 0.3 * clamp(1 - (this.t - parT) / parT));
      return { quality, perfect: this.accs.length === n && this.accs.every((a) => a >= 1), score: Math.round(quality * 300), acc, stones: this.accs.length };
    },
  };
  return M;
}

function draw(g, M, W, H) {
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#9FC2DF'); sky.addColorStop(1, '#EADAB4'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  g.fillStyle = '#B9A47C'; g.fillRect(0, H * BASE, W, H * (1 - BASE));
  const ch = H * CH, x0 = W * 0.1, wv = M.phase === 'waves' || M.phase === 'done';
  g.fillStyle = '#E9E2CF'; g.fillRect(x0, H * BASE - ch * 0.4, W * (IN - 0.1) + 1, ch * 0.4);   // the footing
  for (let i = 0; i < M.set.length; i++) {                                           // the courses set so far: out, in, out…
    const s = M.set[i], y = H * M.rowY(i), lit = wv ? 0.5 + 0.5 * Math.sin(M.t * 5 - i * 0.9) : 0;
    g.fillStyle = s.x > (OUT + IN) / 2 ? `rgb(${236 + lit * 19},${229 + lit * 20},${212 + lit * 30})` : `rgb(${206 + lit * 30},${198 + lit * 30},${178 + lit * 40})`;
    g.fillRect(x0, y, s.x * W - x0, ch - 1);
    g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(x0, y + ch - 2, s.x * W - x0, 2);   // the plaster in the joint ("כי היכי דנקביל סידא")
    if (!s.ok) { g.fillStyle = 'rgba(160,80,40,.5)'; g.fillRect(s.x * W - 4, y, 4, ch - 1); }
  }
  if (M.phase === 'hang' || M.phase === 'drop' || M.phase === 'bring') {
    const y = H * M.rowY(M.i), tx = M.target() * W, near = M.phase === 'hang' && Math.abs(M.sx() - M.target()) <= M.tol;
    g.strokeStyle = 'rgba(255,214,110,.9)'; g.setLineDash([5, 4]); g.lineWidth = 2; g.strokeRect(x0, y, tx - x0, ch - 1); g.setLineDash([]);   // where it goes
    g.fillStyle = near ? '#7CE0A0' : '#FFD66E'; g.beginPath(); g.moveTo(tx, y + ch / 2); g.lineTo(tx + 14, y + ch / 2 - 9); g.lineTo(tx + 14, y + ch / 2 + 9); g.fill();   // the depth mark
    const sx = (M.phase === 'drop' ? M.set[M.set.length - 1].x : M.sx()) * W, sy = M.phase === 'drop' ? y : y - H * 0.06, bw = W * 0.3;
    g.strokeStyle = '#8A6A3A'; g.lineWidth = 2; g.beginPath(); g.moveTo(sx - bw / 2, 0); g.lineTo(sx - bw / 2, sy); g.stroke();   // the rope
    g.fillStyle = M.grab ? '#F6F0DE' : '#E4DCC6'; g.fillRect(sx - bw, sy, bw, ch - 1);                                             // the stone, its face at sx
    g.strokeStyle = '#9A8B66'; g.lineWidth = 1.5; g.strokeRect(sx - bw, sy, bw, ch - 1);
    g.font = '800 14px Heebo, system-ui, sans-serif'; g.textAlign = 'left'; g.direction = 'rtl'; g.lineWidth = 3; g.strokeStyle = 'rgba(28,20,10,.85)';   // the course's word, over everything
    const lab = M.want() === 'out' ? 'נדבך יוצא' : 'נדבך נכנס', ly = y + ch + 16; g.strokeText(lab, tx + 18, ly); g.fillStyle = '#FFE08A'; g.fillText(lab, tx + 18, ly);
  }
  g.fillStyle = 'rgba(28,20,10,.72)'; g.fillRect(W - 86, 6, 80, 22);
  g.fillStyle = '#F3E6C4'; g.font = '700 13px Heebo, system-ui, sans-serif'; g.textAlign = 'right'; g.direction = 'rtl';
  g.fillText(`נדבך ${Math.min(M.i + 1, M.n)}/${M.n}`, W - 12, 22);
}

export const waves = {
  kind: 'waves', topic: 'heichal', n: 'גלי הים', kicker: 'קירות הבית', step: 'stone', secs: [18, 30], fact: FACT, guide: 3, model, draw,
  hint: 'גרור את האבן אל הסימן הזהוב ושחרר: נדבך יוצא, נדבך נכנס', howto: 'גרור את האבן אל הסימן הזהוב ושחרר — פעם יוצא, פעם נכנס, כמו גלי הים',
};
