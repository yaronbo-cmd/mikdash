/* הסיתות (the dressing): chisel the drafted margins of an ashlar in rhythm, then flatten its boss.
 * The chisel travels round the face; a tap as it crosses a mark cuts a clean stretch of margin (a miss leaves it rough,
 * a tap between marks nicks the stone). Then the boss: tap when the shrinking ring meets the gold circle. The stone
 * changes as you work: rough → drafted (world: hero.workpiece('drafted')) → dressed ('dressed'). */
import { clamp } from './frame.js';

const BOX = { x0: 0.12, x1: 0.88, y0: 0.16, y1: 0.8 };

/** a point on the face's perimeter: p ∈ [0, 4), from the top-right corner leftwards (RTL), then down, right, up */
export function perim(p) {
  const k = Math.floor(p) % 4, f = p - Math.floor(p);
  const { x0, x1, y0, y1 } = BOX;
  if (k === 0) return [x1 - (x1 - x0) * f, y0];
  if (k === 1) return [x0, y0 + (y1 - y0) * f];
  if (k === 2) return [x0 + (x1 - x0) * f, y1];
  return [x1, y1 - (y1 - y0) * f];
}

export const dress = {
  kind: 'dress', topic: 'stone', n: 'הסיתות', kicker: 'אבן פינה', step: 'dress', secs: [18, 30],
  hint: 'הקש כשהאזמל נוגע בעיגול הזהוב — עיגול אחרי עיגול',
  howto: 'הקש על המסך כשהאזמל נוגע בעיגול הזהוב — עיגול אחרי עיגול', guide: 3, howAt: 'bottom',   // (wave 8B) the first-time how-to (low: the first marks run along the top)
  fact: { he: 'לאבני הגזית של הורדוס שוליים שקועים ברוחב כ־8 ס״מ סביב בליטה שטוחה — כך מזהים אותן עד היום בכותל.', ref: 'הנדבכים ההרודיאניים בכותל המערבי ובכותל הדרומי', status: 'draft', illus: false },

  model({ level = 0, rng, setup = {} } = {}) {
    // (wave 8B) level 0: four marks a side at a calm beat (16 in all, was 24 at 0.62 s); then the curve
    const m = 4 + level, N = 4 * m, I = 0.8 - 0.06 * level, speed = 1 / (m * I);   // p-units per second
    const PERF = 0.08 - 0.008 * level, GOOD = 0.18 - 0.015 * level;                    // the timing windows (s), tighter by level
    const boss = 4, Pb = 1.1 - 0.08 * level, rT = 0.35;
    const marks = Array.from({ length: N }, (_, i) => ({ p: Math.floor(i / m) + ((i % m) + 0.5) / m, q: -1 }));
    const M = {
      level, m, N, marks, speed, GOOD, p: -0.35, phase: 'margins', t: 0, next: 0, nicks: [], slips: 0, combo: 0,
      bq: [], ring: 1, stroke: 0, bossHits: [], done: false, progress: 0, fx: [], err: 0.02 + 0.03 * rng(),
      step(dt) {
        if (this.done) return;
        this.t += dt;
        if (this.hold) return;                                                          // (wave 8B) under the how-to the chisel waits
        if (this.phase === 'margins') {
          this.p += speed * dt;
          while (this.next < N && this.p - marks[this.next].p > GOOD * speed) {       // a mark passed untouched: rough
            marks[this.next].q = 0.35; this.next++; this.combo = 0; this.progress++;
          }
          if (this.next >= N && this.p >= 4) {
            this.phase = 'boss'; this.ring = 1; this.fx.push({ world: 'drafted', sfx: 'tier', o: { n: 1 }, howto: 'השוליים מוכנים. עכשיו הבליטה: הקש כשהטבעת הלבנה פוגשת את העיגול הזהוב', guide: 1 });
          }
        } else if (this.phase === 'boss') {
          this.ring -= dt / Pb;
          if (this.ring <= 0) { this.bq.push(0.3); this.ring = 1; this.stroke++; this.progress++; this.checkEnd(); }
        }
      },
      checkEnd() {
        if (this.stroke >= boss) { this.done = true; this.phase = 'done'; this.fx.push({ world: 'dressed' }); }
      },
      tap() {
        if (this.done) return;
        if (this.phase === 'margins') {
          const mk = marks[this.next];
          const dtm = mk ? Math.abs(this.p - mk.p) / speed : 9;
          const [x, y] = perim(Math.max(0, Math.min(3.999, this.p)));
          if (mk && dtm <= GOOD) {
            const perfect = dtm <= PERF;
            mk.q = perfect ? 1 : 0.7; this.next++; this.progress++;
            this.combo = perfect ? this.combo + 1 : 0;
            this.fx.push({ sfx: 'chisel', o: { force: perfect ? 0.9 : 0.6 }, haptic: 8 });
            if (perfect) this.fx.push({ sfx: 'chime', o: { combo: Math.min(9, this.combo) } });
            if (this.combo && this.combo % 6 === 0) this.fx.push({ pop: { t: `רצף ×${this.combo}`, x, y: y + 0.08, kind: 'good' } });
          } else {
            this.slips++; this.combo = 0;
            this.nicks.push([x, y]);
            this.fx.push({ sfx: 'grind', haptic: 20, pop: { t: 'שבב!', x, y: y + 0.08, kind: 'bad' } });
          }
        } else if (this.phase === 'boss') {
          const e = Math.abs(this.ring - rT);
          const q = e < 0.05 ? 1 : clamp(1 - e * 2.5, 0.2, 0.95);
          this.bq.push(q); this.bossHits.push(this.stroke);
          this.fx.push({ sfx: 'hammer', o: { stone: 'hard', tool: 'mallet', force: 0.5 + q * 0.5, quality: q >= 1 ? 'perfect' : '' }, haptic: q >= 1 ? [14, 30, 14] : 14, shake: 0.8, dust: { x: 0.5, y: 0.48, n: 10 } });
          this.fx.push({ pop: { t: q >= 1 ? 'מושלם!' : q > 0.7 ? 'טוב' : 'עוד', x: 0.5, y: 0.36, kind: q >= 1 ? 'good' : '' } });
          this.ring = 1; this.stroke++; this.progress++; this.checkEnd();
        }
      },
      /** (wave 8B) where and when a player taps: the next mark as the chisel reaches it; then the boss's gold circle */
      cue() {
        if (this.phase === 'margins') { const mk = marks[this.next]; if (!mk) return null; const [x, y] = perim(mk.p); return { x, y, now: Math.abs(this.p - mk.p) / speed < PERF + 0.02, timed: true }; }
        if (this.phase === 'boss') return { x: 0.5, y: 0.48, now: Math.abs(this.ring - rT) < 0.035, timed: true };
        return null;
      },
      auto() {
        if (this.phase === 'margins') { const mk = marks[this.next]; return !!mk && Math.abs(this.p - mk.p) / speed < this.err; }
        if (this.phase === 'boss') return Math.abs(this.ring - rT) < 0.02 + this.err * 0.5;
        return false;
      },
      result() {
        const mq = marks.map((k) => (k.q < 0 ? 0.35 : k.q)), avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
        const quality = clamp(0.75 * avg(mq) + 0.25 * avg(this.bq) - Math.min(0.2, this.slips * 0.03));
        const perfect = mq.every((q) => q >= 1) && this.bq.length === boss && this.bq.every((q) => q >= 1) && !this.slips;
        return { quality, perfect, score: Math.round(quality * 300) + mq.filter((q) => q >= 1).length * 5 + (perfect ? 100 : 0) };
      },
    };
    if (setup && setup.onWorld) M.fx.push({ world: 'rough' });
    return M;
  },

  draw(g, M, W, H, fx) {
    const X = (x) => x * W, Y = (y) => y * H;
    const sh = fx.shake ? (Math.random() - 0.5) * fx.shake : 0;
    g.save(); g.translate(sh, sh * 0.4);
    g.fillStyle = '#3A2A18'; g.fillRect(-10, -10, W + 20, H + 20);
    g.fillStyle = '#5A4028'; g.fillRect(0, Y(0.86), W, H);                                    // the banker
    const { x0, x1, y0, y1 } = BOX, mw = Math.min(W, H) * 0.075;
    if (!M._tex || M._tex.w !== W) {                                                            // the rough face, made once per size
      const c = document.createElement('canvas'); c.width = Math.round(X(x1 - x0)); c.height = Math.round(Y(y1 - y0));
      const t = c.getContext('2d'); t.fillStyle = '#CDBB93'; t.fillRect(0, 0, c.width, c.height);
      for (let i = 0; i < 900; i++) { const r = Math.random(); t.fillStyle = r < 0.5 ? 'rgba(90,70,40,.22)' : 'rgba(255,245,220,.25)'; t.fillRect(Math.random() * c.width, Math.random() * c.height, 2 + r * 4, 2 + r * 3); }
      M._tex = { w: W, c };
    }
    g.drawImage(M._tex.c, X(x0), Y(y0));
    // the boss: flatter and lighter with every good stroke
    const bossDone = M.bq.reduce((a, q) => a + q, 0) / 4;
    if (bossDone > 0) { g.fillStyle = `rgba(236,224,196,${0.25 + 0.6 * bossDone})`; g.fillRect(X(x0) + mw * 1.2, Y(y0) + mw * 1.2, X(x1 - x0) - mw * 2.4, Y(y1 - y0) - mw * 2.4); }
    // the margins: each mark owns a stretch; a clean cut is smooth with fine comb lines, a miss stays rough
    for (let i = 0; i < M.N; i++) {
      const k = M.marks[i];
      if (k.q >= 0 && k.q < 0.5) { const [mx, my] = perim(k.p); g.fillStyle = 'rgba(60,44,26,.8)'; g.beginPath(); g.arc(X(mx), Y(my), 4, 0, 6.29); g.fill(); continue; }   // (wave 8B) a missed mark stays rough
      if (k.q < 0.5) continue;
      const a = perim(k.p - 0.5 / M.m), b = perim(Math.min(k.p + 0.5 / M.m, Math.floor(k.p) + 0.9999));
      const vert = Math.floor(k.p) % 2 === 1;
      const x = Math.min(X(a[0]), X(b[0])) - (vert ? mw / 2 : 0), y = Math.min(Y(a[1]), Y(b[1])) - (vert ? 0 : mw / 2);
      const w = vert ? mw : Math.abs(X(b[0]) - X(a[0])), h = vert ? Math.abs(Y(b[1]) - Y(a[1])) : mw;
      g.fillStyle = k.q >= 1 ? '#F1E6CB' : '#E2D4B0'; g.fillRect(x, y, w, h);
      g.strokeStyle = 'rgba(120,100,70,.35)'; g.lineWidth = 1; g.beginPath();
      if (vert) for (let yy = y + 3; yy < y + h; yy += 4) { g.moveTo(x, yy); g.lineTo(x + w, yy); }
      else for (let xx = x + 3; xx < x + w; xx += 4) { g.moveTo(xx, y); g.lineTo(xx, y + h); }
      g.stroke();
    }
    for (const [x, y] of M.nicks) { g.fillStyle = '#6B5436'; g.beginPath(); g.arc(X(x), Y(y), 5, 0, 6.29); g.fill(); }
    if (M.phase === 'margins') {
      for (let i = M.next; i < Math.min(M.N, M.next + 6); i++) {                                 // the next marks; the first one pulses
        const [x, y] = perim(M.marks[i].p);
        const tt = (M.marks[i].p - M.p) / M.speed, inW = i === M.next && Math.abs(tt) <= M.GOOD;
        if (inW) { g.fillStyle = M.level <= 1 ? 'rgba(124,224,160,.85)' : 'rgba(255,214,110,.6)'; g.beginPath(); g.arc(X(x), Y(y), 12, 0, 6.29); g.fill(); }
        g.strokeStyle = i === M.next ? '#FFD66E' : 'rgba(255,214,110,.45)'; g.lineWidth = i === M.next ? 3.5 : 2;
        g.beginPath(); g.arc(X(x), Y(y), i === M.next ? 11 + 2 * Math.sin(M.t * 12) : 7, 0, 6.29); g.stroke();
        if (i === M.next && tt > 0 && tt < 1.1) {                                                   // (wave 8B) the approach ring closes on the beat
          g.strokeStyle = `rgba(255,246,218,${0.35 + 0.5 * (1 - tt / 1.1)})`; g.lineWidth = 2.5;
          g.beginPath(); g.arc(X(x), Y(y), 11 + 34 * (tt / 1.1), 0, 6.29); g.stroke();
        }
      }
      const [cx, cy] = perim(Math.max(0, Math.min(3.999, M.p)));                                   // the chisel and the mallet
      g.fillStyle = '#2B2B2B'; g.beginPath(); g.moveTo(X(cx), Y(cy)); g.lineTo(X(cx) - 7, Y(cy) - 26); g.lineTo(X(cx) + 7, Y(cy) - 26); g.fill();
      g.fillStyle = '#7A5230'; g.fillRect(X(cx) - 12, Y(cy) - 40, 24, 12);
    } else if (M.phase === 'boss') {
      const cx = X(0.5), cy = Y(0.48), R = Math.min(W, H) * 0.3;
      g.setLineDash([5, 5]); g.strokeStyle = '#FFD66E'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R * 0.35, 0, 6.29); g.stroke(); g.setLineDash([]);
      g.strokeStyle = '#FFF6DA'; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, Math.max(2, R * M.ring), 0, 6.29); g.stroke();
    }
    g.restore();
    g.fillStyle = '#F3E6C4'; g.font = '700 14px Heebo, system-ui, sans-serif'; g.textAlign = 'right'; g.direction = 'rtl';
    g.fillText(M.phase === 'margins' ? `שוליים ${M.next}/${M.N}` : `הבליטה ${Math.min(M.stroke + 1, 4)}/4`, W - 10, H - 10);
  },
};
// ── crafta19 ── dressing AT THE BANKER in the world under two thumbs (FUN19 §2, binding; RESEARCH19's B2, approved): a short swipe on the
// work button (≥ 26 px) is one chisel stroke — the touch-down drops the mallet on the chisel (his snap stroke from the raised mallet:
// the first frame at once) and the impact is the act, graded on the music's beat (gold ±90 ms, ±120 at L1); a tap is a stroke too (≤ good). Four margins round the
// stone's face, a few strokes each: the struck margin turns smooth and pale strip by strip; a margin without an ok stroke +60
// "שוליים נקיים". The four margins done: the drafted frame round the boss (המחשה: Herodian margins).
import { act as caAct, bonus as caBonus, actsQ as caQ, beatQ as caBeatQ } from './acts.js';
const DS_PER = [3, 3, 4];
function dressModel({ level = 0 } = {}) {
  const L = clamp(level | 0, 0, 2), per = DS_PER[L];
  const M = {
    kind: 'dress', juice: true, twinOnly: true, level: L, per, m: 0, k: 0, cur: null, pressed: false, prog: [0, 0, 0, 0], gap: [false, false, false, false], queue: [], pending: 0,
    phase: 'cut', t: 0, pt: 0, d0x: 0, d0y: 0, d0on: false, d0used: false, fx: [], acts: [], pts: 0, done: false, progress: 0,
    coach: "החליקו קצר על 'עבודה' בקצב — כל החלקה: מכת אזמל. השוליים מתיישרים",
    /** a stroke asked for (the world strikes it: its contact calls impact) */
    want(it) { if (this.phase !== 'cut' || this.pending >= 2) return null; this.pending++; this.queue.push(it); return it; },
    /** the touch-down IS the stroke's start (the mallet falls at once); its grade's cap is known at the impact: released unmoved = a tap */
    touch(down) {
      if (down) { this.cur = this.want({ moved: false, up: false }); this.pressed = true; }
      else if (this.cur) { this.cur.up = true; this.cur = null; }
    },
    /** the mallet met the chisel: the act */
    impact(it) {
      if (this.phase !== 'cut') return null;
      const tap = it === true || !!(it && it.up && !it.moved);
      const q = caBeatQ(L), a = caAct(this, q, { tap, power: 1, x: 0.5, y: 0.35 });
      if (a.q === 0) this.gap[this.m] = true;
      this.k++; this.prog[this.m] = this.k / per; this.progress++;
      if (this.k >= per) {
        if (!this.gap[this.m]) caBonus(this, 60, 'שוליים נקיים');
        this.m++; this.k = 0;
        if (this.m >= 4) { this.phase = 'end'; this.pt = 0; this.fx.push({ sfx: 'chime', o: { combo: 6 } }); }
      }
      return a;
    },
    step(dt) { if (this.done) return; this.t += dt; this.pt += dt; if (this.phase === 'end' && this.pt > 1.1 && !this.pending) { this.done = true; this.phase = 'done'; } },
    drag(x, y, ph) {
      if (this.phase !== 'cut') return;
      if (ph === 'down') { this.d0on = true; this.d0used = false; this.d0x = x; this.d0y = y; return; }
      if (!this.d0on) return;
      if (ph === 'move') { if (!this.d0used && Math.hypot(x - this.d0x, y - this.d0y) * 160 >= 26 - 18) { this.d0used = true; if (this.cur) this.cur.moved = true; else if (!this.pressed) this.want({ moved: true, up: false }); } return; }
      this.d0on = false;
    },
    twinTap() { if (this.pressed) { this.pressed = false; return; } this.want({ moved: false, up: true }); },   // (the press already struck)
    tap() { this.want({ moved: false, up: true }); },
    cue() { return null; },
    auto() { return null; },
    result() { const q = caQ(this, 0.8); return { quality: q, perfect: q >= 0.97 && this.acts.length > 0, score: this.pts | 0, margins: this.m }; },
  };
  return M;
}
dress.world = { kind: 'dress', model: dressModel, twinOnly: true, beatRing: true, hint: 'החלקה קצרה בקצב — מכת אזמל', howto: 'כל החלקה קצרה היא מכת אזמל; בקצב — זהב', fact: dress.fact };
// ── /crafta19 ──
