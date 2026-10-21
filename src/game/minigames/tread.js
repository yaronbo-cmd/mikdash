/* גלגל הדריכה (the treadwheel) — GAMES14, wave 14: her ❤️ (VOTES14), a stone card at every walled site; המחשה.
 * The kohen walks inside the crane's great wheel: hold the right foot, then the left, in step — each held foot climbs the
 * wheel and winds the rope, and the stone rises. The wheel keeps its way: stop stepping in time and let the stone come to
 * rest on the gold mark (both feet at once: the brake). Then the crane sets it on the course.
 * Levels (FUN14's 0–2): three stones; L1 light · L2 heavier, a narrower mark · L3 heavier still, narrower still.
 * q = .4 in step + .4 on the mark + .2 par. A canvas tap is a quick step of that side's foot. */
import { clamp } from './frame.js';

const FACT = { he: 'גלגל דריכה — מנוף שאדם מסובב בהליכה בתוך תוף גדול — מתואר אצל ויטרוביוס, להרמת משאות כבדים מאוד (בתרגום חופשי). אין עדות שהשתמשו בו בבניין המקדש: המחשה.', ref: 'ויטרוביוס, על האדריכלות י, ב', status: 'draft', illus: true };
const STRIDE = 0.6;                                      // a foot climbs the wheel for this long, then it must step again

function model({ level = 0, rng = Math.random, setup = {} } = {}) {
  const L = clamp(+level || 0, 0, 2), n = 3;
  const push = 1.8 - 0.2 * L, fr = 2.2, tol = [0.06, 0.045, 0.032][Math.round(L)];
  const marks = Array.from({ length: n }, (_, i) => 0.62 + 0.1 * ((i + rng()) % 3) / 2);   // where each stone's bed lies (of the wall's height)
  const parT = n * 9 + 3;
  const M = {
    link: setup && setup.tread && typeof setup.tread.treadUpdate === 'function' ? setup.tread : null,   // ── site15 ── המנופאי: the world's crane in his hands
    kind: 'tread', level: L, n, i: 0, h: 0, v: 0, ang: 0, t: 0, pt: 0, phase: 'lift', feet: { R: -1, L: -1 }, last: '', steps: 0, good: 0,
    stumbles: 0, accs: [], quiet: 0, rest: 0, over: 0, stoneOvers: 0, liftT: 0, done: false, progress: 0, fx: [], _a: null, tol, marks, crewT: 0,
    mark() { return marks[this.i] || 0.7; },
    press(id, down) {
      if (this.done || this.phase !== 'lift' || this.over || (id !== 'R' && id !== 'L')) return;
      if (down === undefined) { this.press(id, true); this.feet[id] = STRIDE - 0.28; this.quick = id; return; }   // a click: a short step
      const other = id === 'R' ? 'L' : 'R';
      if (!down) { this.feet[id] = -1; return; }
      if (this.feet[other] >= 0) { this.feet[id] = 0; return; }                     // both feet down: the brake
      this.quiet = 0; this.rest = 0; this.steps++;
      if (id === this.last) { this.stumbles++; this.feet[id] = STRIDE; this.fx.push({ pop: { t: 'רגל אחרת!', x: id === 'R' ? 0.75 : 0.25, y: 0.86, kind: 'bad' }, sfx: 'ui', haptic: 25 }); return; }
      this.last = id; this.good++; this.feet[id] = 0;
      this.fx.push({ sfx: 'wheel', haptic: 8 });
    },
    tap(x = 0.5) { this.press(x >= 0.5 ? 'R' : 'L'); },
    step(dt) {
      if (this.done) return;
      this.t += dt; this.pt += dt; this.quiet += dt;
      if (this.phase === 'set') { if (this.pt > 1.2) { this.i++; if (this.i >= n) { this.done = true; this.phase = 'done'; } else { this.phase = 'lift'; this.h = 0; this.v = 0; this.last = ''; this.pt = 0; this.fx.push({ hint: `אבן ${this.i + 1}: שוב בצעד — ועצור על הסימן` }); } } return; }
      const both = this.feet.R >= 0 && this.feet.L >= 0;
      let drive = 0;
      for (const f of ['R', 'L']) if (this.feet[f] >= 0 && this.feet[f] < STRIDE && !both) { drive = 1; this.feet[f] += dt; }
      if (this.quick && this.feet[this.quick] >= STRIDE) { this.feet[this.quick] = -1; this.quick = null; }
      this.v += (drive * push - this.v * (both ? 7 : fr)) * dt;
      this.liftT += dt;
      if (this.over) { this.over = Math.max(0, this.over - dt); this.v = 0; this.h += (this.mark() - tol * 1.6 - this.h) * Math.min(1, dt * 3); if (!this.over && this.stoneOvers >= 2) { this.crew = 1; this.h = this.mark(); this.setIt(); this.fx.push({ hint: 'הצוות כיוון את האבן לסימן' }); return; } }
      else this.h += this.v * dt * 0.22;
      this.ang += this.v * dt * 1.6;
      if (!this.over && this.h > this.mark() + tol) {                                 // past the mark: the crew lets it back down
        this.over = 0.9; this.overs = (this.overs || 0) + 1; this.stoneOvers++; this.feet = { R: -1, L: -1 };
        this.fx.push({ pop: { t: 'עבר את הסימן — מורידים מעט', x: 0.5, y: 0.2, kind: 'bad' }, sfx: 'creak', o: { tension: 0.9 } });
      }
      this.progress = this.i * 20 + Math.floor(clamp(this.h / this.mark()) * 19);
      const still = Math.abs(this.v) < 0.04 && this.feet.R < 0 && this.feet.L < 0 && !this.over;
      this.rest = still ? this.rest + dt : 0;
      if (this.rest > 0.45 && Math.abs(this.h - this.mark()) <= tol) this.setIt();
      else if (this.rest > 0.45 && this.h < this.mark() - tol && this.rest < 0.47 && this.h > 0.3) this.fx.push({ hint: 'עוד קצת — צעד אחד, ועצור' });
      if (!this.patient && !this.hold && (this.quiet > 3 || this.liftT > 20)) { this.crewT += dt; this.h = Math.min(this.mark(), this.h + dt * 0.06); if (this.mark() - this.h < 0.001) { this.crew = 1; this.setIt(); } }
    },
    setIt() {
      const acc = clamp(1 - (Math.abs(this.h - this.mark()) / tol) * 0.5) * (this.crew ? 0.4 : 1);
      this.accs.push(acc); this.crew = 0; this.phase = 'set'; this.pt = 0; this.v = 0; this.progress = this.i * 20 + 20; this.stoneOvers = 0; this.liftT = 0; this.feet = { R: -1, L: -1 };
      this.fx.push({ sfx: 'thud', haptic: [15, 40, 15], pop: { t: acc > 0.85 ? 'בדיוק על הסימן!' : 'המנוף מניח', x: 0.6, y: 0.18, kind: acc > 0.85 ? 'big' : '' } }, { sfx: 'settle' });
    },
    land(tau) { let h = this.h, v = this.v, k = 0; for (; k < 400 && (tau > 0 || v > 0.04); k++) { v += ((tau > 0 ? push : 0) - v * fr) / 60; h += (v * 0.22) / 60; tau -= 1 / 60; } return h; },   // where the stone comes to rest after a hold of tau
    need() { return this.mark() - this.land(0); },          // how far it still has to rise if she stops now
    stride() { let hold = 0.38, best = 9; if (this.need() < 0.15) for (const tau of [0.38, 0.3, 0.24, 0.18, 0.13, 0.09, 0.06, 0.04]) { const e = Math.abs(this.land(tau) - this.mark()); if (e < best) { best = e; hold = tau; } } return hold; },   // a full stride, or just enough to rest on the mark
    cue() {
      if (this.phase !== 'lift' || this.over) return null;
      for (const h of ['R', 'L']) if (this.feet[h] >= 0 && this.feet[h] < STRIDE && !(this.feet.R >= 0 && this.feet.L >= 0)) return { btn: h, hold: true, ms: Math.round((STRIDE - this.feet[h]) * 1000), now: true, timed: false };   // the hand stays on the foot she holds, till its stride ends
      const f = this.last === 'R' ? 'L' : 'R';
      if (this.need() <= tol * 0.3) return null;                                      // coast now: let it come to rest on the mark
      return { btn: f, hold: true, ms: Math.round(this.stride() * 1000), now: this.feet.R < 0 && this.feet.L < 0, timed: false };
    },
    auto() {
      const a = this._a;
      if (a) { if (this.t >= a.until) { this._a = null; return { press: a.f, down: false }; } return null; }
      const c = this.cue(); if (!c || !c.now || this.t < (this.nextT || 0)) return null;
      const hold = this.stride();
      this._a = { f: c.btn, until: this.t + hold }; this.nextT = this.t + hold + 0.07;
      return { press: c.btn, down: true };
    },
    result() {
      const mean = (x, d) => (x.length ? x.reduce((s, v) => s + v, 0) / x.length : d);
      const rhythm = this.steps ? clamp(this.good / this.steps - (this.overs || 0) * 0.1) : 0, acc = mean(this.accs, 0.3), par = clamp(1 - (this.t - parT) / parT);
      const quality = clamp(0.4 * rhythm + 0.4 * acc + 0.2 * par);
      return { quality, perfect: quality >= 0.97, score: Math.round(quality * 300), rhythm, acc, par, stones: this.i, stumbles: this.stumbles, overs: this.overs || 0 };
    },
  };
  return M;
}

// ── site15 ── המנופאי: linked to the world (stages.treadUpdate), the canvas is a meter strip — the real wheel, stone and course are
// the view above the sheet: the stone's height against the gold mark, the feet, "אבן i/n"
function drawStrip(g, M, W, H) {
  g.fillStyle = '#2A1F12'; g.fillRect(0, 0, W, H);
  const x0 = W * 0.08, x1 = W * 0.72, y = H * 0.5, u = (v) => x0 + (x1 - x0) * clamp(v / 1.1, 0, 1);
  g.strokeStyle = '#6E5A3C'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
  const near = Math.abs(M.h - M.mark()) <= M.tol && M.phase === 'lift', mw = (x1 - x0) * (M.tol / 1.1);
  g.fillStyle = near ? 'rgba(124,224,160,.55)' : 'rgba(255,214,110,.45)'; g.fillRect(u(M.mark()) - mw, y - 11, mw * 2, 22);
  g.strokeStyle = near ? '#7CE0A0' : '#FFD66E'; g.lineWidth = 3; g.beginPath(); g.moveTo(u(M.mark()), y - 15); g.lineTo(u(M.mark()), y + 15); g.stroke();
  g.fillStyle = '#DCCBA2'; g.fillRect(u(M.h) - 9, y - 7, 18, 14); g.strokeStyle = '#8F7A52'; g.lineWidth = 1.5; g.strokeRect(u(M.h) - 9, y - 7, 18, 14);
  const lift = (f) => (M.feet[f] >= 0 && !(M.feet.R >= 0 && M.feet.L >= 0) ? 1 : 0);
  for (const [f, k] of [['R', 0.86], ['L', 0.8]]) { g.fillStyle = lift(f) ? '#F4F1E8' : 'rgba(244,241,232,.3)'; g.beginPath(); g.arc(W * k, y, 7, 0, 6.2832); g.fill(); }
  g.fillStyle = '#F3E6C4'; g.font = '700 13px Heebo, system-ui, sans-serif'; g.textAlign = 'right'; g.direction = 'rtl';
  g.fillText(`אבן ${Math.min(M.i + 1, M.n)}/${M.n}`, W - 10, y + 5);
}
// ── /site15 ──
function draw(g, M, W, H) {
  if (M.link) {   // ── site15 ──
    try { M.link.treadUpdate({ ang: M.ang, h: M.h, v: M.v, mark: M.mark(), phase: M.phase, pt: M.pt, i: M.i, n: M.n, over: !!M.over, done: M.done }); } catch (e) { M.link = null; }
    drawStrip(g, M, W, H); return;
  }   // ── /site15 ──
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#A8C6E0'); sky.addColorStop(1, '#E9D8B2'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  g.fillStyle = '#B9A47C'; g.fillRect(0, H * 0.9, W, H * 0.1);
  const wx = W * 0.27, wy = H * 0.6, wr = Math.min(W * 0.24, H * 0.3);              // the wheel
  const top = H * 0.12, wallX = W * 0.8, bed = (m) => H * 0.9 - m * (H * 0.78);
  g.fillStyle = '#CDBB93';                                                           // the wall's courses, up to the bed
  for (let y = bed(M.mark()), r = 0; y < H * 0.9; y += H * 0.08, r++) for (let x = wallX - (r % 2) * W * 0.06; x < W; x += W * 0.12) g.fillRect(x + 1, y + 1, W * 0.12 - 2, Math.min(H * 0.08, H * 0.9 - y) - 2);
  const by = bed(M.mark()), near = Math.abs(M.h - M.mark()) <= M.tol && M.phase === 'lift';
  g.strokeStyle = near ? '#7CE0A0' : '#FFD66E'; g.lineWidth = near ? 5 : 3; g.beginPath(); g.moveTo(W * 0.6, by); g.lineTo(W, by); g.stroke();   // the gold mark: the course's bed
  g.fillStyle = g.strokeStyle; g.beginPath(); g.moveTo(W * 0.6, by - 8); g.lineTo(W * 0.6 + 12, by); g.lineTo(W * 0.6, by + 8); g.fill();
  g.strokeStyle = '#6E4A2A'; g.lineWidth = 6; g.lineCap = 'round';                   // the jib, from the wheel's frame to the pulley over the wall
  g.beginPath(); g.moveTo(wx, wy); g.lineTo(W * 0.62, top); g.lineTo(W * 0.5, H * 0.9); g.stroke(); g.lineCap = 'butt';
  g.save(); g.translate(wx, wy); g.rotate(M.ang);
  g.strokeStyle = '#7A5230'; g.lineWidth = 7; g.beginPath(); g.arc(0, 0, wr, 0, 6.2832); g.stroke();
  g.lineWidth = 3; g.beginPath(); for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; g.moveTo(0, 0); g.lineTo(Math.cos(a) * wr, Math.sin(a) * wr); } g.stroke();
  g.strokeStyle = '#5C3A22'; g.lineWidth = 2; g.beginPath(); for (let k = 0; k < 24; k++) { const a = (k * Math.PI) / 12; g.moveTo(Math.cos(a) * (wr - 6), Math.sin(a) * (wr - 6)); g.lineTo(Math.cos(a) * wr, Math.sin(a) * wr); } g.stroke();   // the treads
  g.restore();
  g.fillStyle = '#4A3420'; g.beginPath(); g.arc(wx, wy, 7, 0, 6.2832); g.fill();
  const fx = wx, fy = wy + wr - 6, lift = (f) => (M.feet[f] >= 0 && !(M.feet.R >= 0 && M.feet.L >= 0) ? Math.min(1, M.feet[f] / STRIDE) : 0);
  g.strokeStyle = '#F4F1E8'; g.lineWidth = 5; g.lineCap = 'round';                   // the kohen walking inside, in white linen
  for (const [f, s] of [['R', 1], ['L', -1]]) { const k = lift(f); g.beginPath(); g.moveTo(fx, fy - H * 0.12); g.lineTo(fx + s * W * 0.03 - k * s * W * 0.04, fy - k * H * 0.03); g.stroke(); }
  g.fillStyle = '#F4F1E8'; g.fillRect(fx - W * 0.03, fy - H * 0.24, W * 0.06, H * 0.13); g.lineCap = 'butt';
  g.fillStyle = '#D9A77B'; g.beginPath(); g.arc(fx, fy - H * 0.27, W * 0.025, 0, 6.2832); g.fill();
  const sx = M.phase === 'set' ? W * (0.62 + 0.26 * Math.min(1, M.pt / 0.8)) : W * 0.62, sy = by + (M.mark() - M.h) * H * 0.78;   // the stone on its rope; the crane swings it onto the course
  g.strokeStyle = '#8A6A3A'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(wx, wy); g.lineTo(W * 0.62, top); g.lineTo(sx, top); g.lineTo(sx, sy - H * 0.1); g.stroke();
  g.fillStyle = '#DCCBA2'; g.fillRect(sx - W * 0.08, sy - H * 0.1, W * 0.16, H * 0.1); g.strokeStyle = '#8F7A52'; g.lineWidth = 1.5; g.strokeRect(sx - W * 0.08, sy - H * 0.1, W * 0.16, H * 0.1);
  g.fillStyle = 'rgba(28,20,10,.72)'; g.fillRect(W - 80, 6, 74, 22);
  g.fillStyle = '#F3E6C4'; g.font = '700 13px Heebo, system-ui, sans-serif'; g.textAlign = 'right'; g.direction = 'rtl';
  g.fillText(`אבן ${Math.min(M.i + 1, M.n)}/${M.n}`, W - 12, 22);
}

export const tread = {
  kind: 'tread', topic: 'crane', n: 'גלגל הדריכה', kicker: 'המנוף · הולכים בגלגל', step: 'stone', secs: [16, 30], fact: FACT, guide: 99, model, draw,   // (the hand stays on the next foot)
  hint: 'החזק רגל ימין, אחר כך שמאל — בצעד. עצור כשהאבן על הסימן הזהוב',
  howto: 'החזק רגל ימין, שחרר, ואז רגל שמאל — כך הולכים בגלגל. עצור בזמן, והאבן תנוח על הסימן',
  buttons: [{ id: 'R', label: 'רגל ימין', cls: 'fx-ok', hold: true }, { id: 'L', label: 'רגל שמאל', cls: 'fx-ok', hold: true }],
};
// ── crafta19 ── the treadwheel IN THE WORLD under two thumbs (FUN19 §2, binding; the owner's notes 5 and 18: "הגלגל לא זז… עדיף שהשחקן
// יבצע משיכות קצרות מהירות על הגלגל כדי שהגלגל יסתובב, כמובן בניקוד"; "כך גם החבל של גלגל המנוף"). Short fast DOWNWARD swipes on
// the work button (≥ 40 px within 250 ms): each one is a step of the kohen inside the wheel, at the moment the swipe crosses its
// 40 px (the foot lands: the impact). Two steps a second keep the wheel turning, faster turns it faster (to 4); the rope winds on the
// drum and the stone rises a step at a time; stop, and the pawl holds it (it never falls). A stride (two steps) is the scoring act,
// graded by its pace: 2.0–2.6 steps a second gold (124 BPM ≈ 2.07), 1.6–3.2 good, else ok — at L1 1.8–2.8 gold, 1.4–3.4 good. A tap is a step too (≤ good). At the
// top the jib swings the stone over its slot and sets it: +80. Three stones; L2/L3 more steps a stone. The wheel itself: המחשה.
import { act as caAct, bonus as caBonus, actsQ as caQ } from './acts.js';
const CA_PER = [10, 12, 14], CA_MARK = 0.7, CA_SWIPE = 40, CA_SWIPE_T = 0.25;
const CA_BAND = [[1.8, 2.8, 1.4, 3.4], [2.0, 2.6, 1.6, 3.2]];   // gold lo/hi, good lo/hi (steps a second): L1 · L2+
function worldModel({ level = 0 } = {}) {
  const L = clamp(+level || 0, 0, 2), n = 3, per = CA_PER[Math.round(L)];
  const M = {
    kind: 'tread', juice: true, twinOnly: true, level: L, n, per, i: 0, h: 0, v: 0, ang: 0, t: 0, rt: 0, rdt: 0, pt: 0, phase: 'lift', over: false, done: false, progress: 0,
    fx: [], acts: [], pts: 0, k: 0, steps: 0, taps: 0, swipes: 0, st0: -9, st1: -9, st2: -9, rate: 0, last: -9, d0y: 0, d0t: 0, d0on: false, d0used: false, lift: 0, strideTap: false,
    coach: 'החליקו מטה מהר על הכפתור — כל החלקה: צעד בגלגל. שתי החלקות בשנייה מסובבות אותו',
    mark() { return CA_MARK; },
    /** one step of his foot on the wheel's tread (a swipe crossed its 40 px, or a tap) → it landed */
    stepOnce(tap) {
      if (this.done || this.phase !== 'lift' || this.k >= per) return false;
      const t = this.rt; this.st0 = this.st1; this.st1 = this.st2; this.st2 = t;   // (the pace on the real clock: a slow frame never makes it seem fast)
      this.k++; this.steps++; if (tap) this.taps++; else this.swipes++; this.last = t; this.lift = 1;
      const d2 = this.st2 - this.st0, d1 = this.st2 - this.st1;
      this.rate = d2 < 2.5 ? Math.min(6, 2 / Math.max(0.12, d2)) : d1 < 2 ? Math.min(6, 1 / Math.max(0.12, d1)) : 0.7;
      this.fx.push({ sfx: 'wheel', haptic: 6 });
      if (tap) this.strideTap = true;
      if (this.k % 2 === 0) {   // a stride: the scoring act, by its pace
        const r = this.rate, B = CA_BAND[L ? 1 : 0], q = r >= B[0] && r <= B[1] ? 2 : r >= B[2] && r <= B[3] ? 1 : 0;   // (L1 kinder: RESEARCH19, approved)
        caAct(this, q, { tap: this.strideTap, power: Math.round(r * 100) / 100, x: 0.5, y: 0.3 }); this.strideTap = false;
      }
      this.progress = this.i * per + this.k;
      return true;
    },
    step(dt) {
      if (this.done) return;
      this.t += dt; this.pt += dt; this.rt += this.rdt > 0 ? this.rdt : dt; this.lift = Math.max(0, this.lift - dt * 4);
      if (this.phase === 'set') {
        this.v += (0 - this.v) * Math.min(1, dt * 6);
        if (this.pt > 1.15) { this.i++; if (this.i >= n) { this.done = true; this.phase = 'done'; } else { this.phase = 'lift'; this.h = 0; this.k = 0; this.pt = 0; this.strideTap = false; } }
        return;
      }
      // the wheel's pace: his steps' own while they come; when they stop the pawl clicks and holds (the stone never falls)
      const live = this.rt - this.last < Math.max(0.55, 1.5 / Math.max(1, this.rate)), r = live ? Math.min(4, this.rate) : 0;
      this.v += (r * 1.96 - this.v) * Math.min(1, dt * 8);
      const hT = Math.min(1, this.k / per) * CA_MARK;
      if (hT > this.h) this.h += (hT - this.h) * Math.min(1, dt * (live ? 4.5 : 7));
      this.ang += this.v * dt * 0.8;
      if (this.k >= per && this.h >= CA_MARK - 0.012) {
        this.h = CA_MARK; this.phase = 'set'; this.pt = 0;
        caBonus(this, 80, 'הורם!');
        this.fx.push({ sfx: 'thud', haptic: [15, 40, 15] });
      }
    },
    /** the pad (hands.js's twin drag, 160 px a unit): a swipe down of 40 px within 250 ms is a step at the moment it crosses */
    drag(x, y, ph) {
      if (this.done) return;
      if (ph === 'down') { this.d0on = true; this.d0used = false; this.d0y = y; this.d0t = this.rt; this.lift = 1; return; }
      if (!this.d0on) return;
      if (ph === 'move') { if (!this.d0used && (y - this.d0y) * 160 >= CA_SWIPE - 18) { this.d0used = true; this.stepOnce(this.rt - this.d0t > CA_SWIPE_T); } return; }
      if (ph === 'up' && !this.d0used) this.stepOnce(true);   // (a drag that was no swipe: still a step, ≤ good — no failure)
      this.d0on = false;
    },
    twinTap() { this.stepOnce(true); },   // (hands.js: a tap on the button is one step, at once)
    tap() { this.stepOnce(true); },
    cue() { return null; },   // (no coach's hand over him in the wheel: the button's own hint says it)
    auto() { return null; },
    result() { const q = caQ(this, 0.8); return { quality: q, perfect: q >= 0.97 && this.acts.length > 0, score: this.pts | 0, stones: this.i, steps: this.steps, swipes: this.swipes, taps: this.taps }; },
  };
  return M;
}
tread.world = { kind: 'tread', model: worldModel, twinOnly: true, hint: 'החליקו מטה מהר — צעד אחרי צעד', howto: 'החלקה קצרה ומהירה למטה = צעד בגלגל; שתיים בשנייה מסובבות אותו', fact: FACT };
// ── /crafta19 ──
