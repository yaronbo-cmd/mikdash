/* האנך והפלס (the plumb and the level): the engineer's inspection of a course.
 * Three checks with the plumb line against the wall, then two with the A-frame level on the course: tap when the bob's
 * string crosses the gold mark. The bob is fastest at the mark, so it is a real timing skill; it speeds up by level.
 * (GAMES13, wave 13 — the owner, 30.9 11:12: "הפלס עם המחט … תוסיף אותו לשלבי הפילוס") `setup.order` sets the rounds' tools
 * (e.g. ['level', 'level', 'plumb']: the level first, where the work IS leveling), and `setup.surface` what the A-frame stands on:
 * 'rock' (the Mount's bedrock) · 'course' (the Mount's course) · 'paving' (the plaza) · 'floor' (Ezrat Nashim) · 'steps' (the 15 steps) · 'altar' (its top:
 * whole stones and white plaster; the level is wood — no iron at the altar, מדות ג, ד). The line changes with the tool. */
import { clamp } from './frame.js';

export const plumb = {
  kind: 'plumb', topic: 'herod', n: 'האנך והפלס', kicker: 'בדיקת נדבך', step: 'inspect', secs: [10, 20],
  hint: 'הקש כשחוט האנך עובר על הקו הזהוב',
  howto: 'הקש על המסך כשחוט האנך עובר בדיוק על הקו הזהוב', guide: 1,   // (wave 8B) the first-time how-to
  fact: { he: 'כל נדבך הורדוסי הונח 3–5 ס״מ פנימה מזה שמתחתיו: האנך מגלה שהחומה נוטה פנימה מעט — בכוונה.', ref: 'הנדבכים ההרודיאניים בכותל המערבי ובכותל הדרומי', status: 'draft', illus: false },

  model({ level = 0, rng, setup = {} } = {}) {
    const order = Array.isArray(setup.order) && setup.order.length ? setup.order.map((k) => (k === 'level' ? 'level' : 'plumb')) : null;   // ── games13 ──
    const rounds = order ? order.length : setup.rounds || 5, P = 2.2 - 0.18 * level;   // the course check (BUILD, every 2 courses): 3 · slower at the first levels
    const M = {
      level, rounds, r: 0, phase: 'show', pt: 0, st: 0, x: 0, phi: 0, q: [], stops: [], done: false, progress: 0, fx: [],
      err: 0.02 + 0.05 * rng(), order, surface: setup.surface || 'course',
      kind(r = this.r) { return order ? order[Math.min(r, order.length - 1)] : r < 3 ? 'plumb' : 'level'; },
      pos(t) {                                        // the bob's offset from true, −1…1
        const Pr = this.r === 0 && level <= 1 ? P * 1.3 : P;                          // (wave 8B) a slow first check
        if (this.kind() === 'plumb') return Math.sin((2 * Math.PI * t) / Pr + this.phi) * (1 - Math.min(0.35, t * 0.05));
        return 0.8 * Math.sin((2 * Math.PI * t) / (P * 1.35) + this.phi) + 0.12 * Math.sin(t * 7.3);
      },
      step(dt) {
        if (this.done) return;
        this.pt += dt;
        if (this.phase === 'show' && this.pt > 0.5) { this.phase = 'swing'; this.pt = 0; this.st = 0; this.phi = rng() * 6.28; }
        if (this.phase === 'swing') {
          this.st += dt; this.x = this.pos(this.st);
          if (this.st > 6 && !this.patient) this.record(0.4, 'המשגיח בדק בעצמו');
        } else if (this.phase === 'result' && this.pt > 0.6) {
          this.r++;
          if (this.r >= rounds) { this.done = true; this.phase = 'done'; }
          else {
            this.phase = 'show'; this.pt = 0;
            if (this.kind() !== this.kind(this.r - 1)) this.fx.push(this.kind() === 'level'   // (games13: the line follows the tool, in either order)
              ? { howto: 'עכשיו הפלס: הקש כשהחוט עובר על החריץ הזהוב שבמרכז', guide: 1, sfx: 'level' }
              : { howto: 'עכשיו האנך: הקש כשחוט האנך עובר על הקו הזהוב', guide: 1, sfx: 'plumb' });
          }
        }
      },
      record(q, text) {
        this.q.push(q); this.stops.push(this.x); this.phase = 'result'; this.pt = 0; this.progress++;
        const perfect = q >= 1;
        this.fx.push({ sfx: this.kind() === 'plumb' ? 'plumb' : 'level', haptic: perfect ? [10, 25, 10] : 10, pop: { t: text, x: 0.5, y: 0.3, kind: perfect ? 'good' : q < 0.5 ? 'bad' : '' } });
        if (perfect) this.fx.push({ sfx: 'chime', o: { combo: this.q.filter((k) => k >= 1).length + 1 } });
      },
      tap() {
        if (this.phase !== 'swing' || this.done) return;
        const a = Math.abs(this.x);
        const q = a < (level ? 0.06 : 0.08) ? 1 : clamp(1 - a * (level ? 1.1 + 0.1 * level : 0.9), 0.15, 0.95);   // (wave 8B) level 0 a little kinder
        this.record(q, q >= 1 ? 'אמת!' : q > 0.7 ? 'כמעט' : 'עקום — שוב בנדבך הבא');
      },
      /** (wave 8B) where and when a player taps: the gold line (the level's notch), as the string crosses it */
      cue() { return this.phase === 'done' ? null : { x: 0.5, y: this.kind() === 'plumb' ? 0.86 : 0.58, now: this.phase === 'swing' && Math.abs(this.x) < 0.07, timed: true }; },
      auto() { return this.phase === 'swing' && this.st > 0.4 && Math.abs(this.x) < this.err; },
      result() {
        const quality = this.q.length ? this.q.reduce((a, b) => a + b, 0) / this.q.length : 0;
        return { quality, perfect: this.q.length === rounds && this.q.every((k) => k >= 1), score: Math.round(quality * 250) + this.q.filter((k) => k >= 1).length * 20 };
      },
    };
    return M;
  },

  draw(g, M, W, H) {
    g.fillStyle = '#2E2416'; g.fillRect(0, 0, W, H);
    const cx = W / 2, gx = W / 2;
    if (M.kind() === 'plumb') {
      g.fillStyle = '#CDBB93';                                                        // the wall's courses
      for (let row = 0; row < 5; row++) for (let i = -1; i < 4; i++) { const w = W * 0.34, x = i * w + (row % 2 ? w / 2 : 0) - W * 0.06; g.fillRect(x + 2, H * 0.12 + row * H * 0.16 + 2, w - 4, H * 0.16 - 4); }
      g.fillStyle = 'rgba(46,36,22,.35)'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#6B4A2A'; g.fillRect(cx - W * 0.22, H * 0.06, W * 0.44, 10);  // the arm
      const top = H * 0.08, len = H * 0.64, ang = M.x * 0.32;
      const bx = cx + Math.sin(ang) * len, by = top + Math.cos(ang) * len;
      const on = M.level <= 1 && M.phase === 'swing' && Math.abs(M.x) < 0.08;                          // training wheels
      g.strokeStyle = on ? '#7CE0A0' : '#FFD66E'; g.lineWidth = on ? 6 : 3; g.beginPath(); g.moveTo(gx, H * 0.78); g.lineTo(gx, H * 0.94); g.stroke();   // the true line
      g.strokeStyle = '#F3E6C4'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(cx, top); g.lineTo(bx, by); g.stroke();
      g.fillStyle = '#7C7C84'; g.beginPath(); g.moveTo(bx - 9, by); g.lineTo(bx + 9, by); g.lineTo(bx, by + 20); g.fill();
    } else {
      surface(g, M.surface, W, H);                                                    // what is leveled (games13): the course, the paving, the floor, a step, the altar's top
      const ax = cx, ay = H * 0.12, fl = W * 0.34, fy = H * 0.84, bar = H * 0.58;
      g.strokeStyle = '#7A5230'; g.lineWidth = 8; g.lineCap = 'round';
      g.beginPath(); g.moveTo(ax - fl, fy); g.lineTo(ax, ay); g.lineTo(ax + fl, fy); g.stroke();
      const bw = fl * ((bar - ay) / (fy - ay));
      g.beginPath(); g.moveTo(ax - bw, bar); g.lineTo(ax + bw, bar); g.stroke(); g.lineCap = 'butt';
      g.fillStyle = '#FFD66E'; g.fillRect(ax - 2, bar - 12, 4, 24);                   // the notch at the centre of the bar
      const len = (bar - ay) + 26, ang = M.x * 0.28, bx = ax + Math.sin(ang) * len, by = ay + Math.cos(ang) * len;
      g.strokeStyle = '#F3E6C4'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
      g.fillStyle = '#7C7C84'; g.beginPath(); g.arc(bx, by, 8, 0, 6.29); g.fill();
    }
    g.fillStyle = '#F3E6C4'; g.font = '700 14px Heebo, system-ui, sans-serif'; g.textAlign = 'right'; g.direction = 'rtl';
    if (M.kind() === 'level') { g.fillStyle = 'rgba(28,20,10,.72)'; g.fillRect(W - 128, H - 30, 122, 24); g.fillStyle = '#F3E6C4'; }   // (on the stones: a dark plate under the label)
    g.fillText(`${M.kind() === 'plumb' ? 'אנך' : 'פלס'} · בדיקה ${Math.min(M.r + 1, M.rounds)}/${M.rounds}`, W - 10, H - 12);
  },
};

/* ── games13 ── what the A-frame stands on (the level's rounds): canvas only, the sheet's warm stone tones */
function surface(g, kind, W, H) {
  const y0 = H * 0.84, hh = H - y0;
  if (kind === 'steps') {                                                             // ט״ו המעלות: the A-frame on one step, the next ones below
    for (let i = 0; i < 4; i++) { const y = y0 + i * hh * 0.34, x = i * W * 0.1; g.fillStyle = i % 2 ? '#C9B48A' : '#D8C49C'; g.fillRect(x, y, W - 2 * x, hh * 0.34 + 1); g.fillStyle = 'rgba(80,58,30,.35)'; g.fillRect(x, y, W - 2 * x, 2); }
    return;
  }
  if (kind === 'rock') {                                                              // the Mount's bedrock once the rocks are gone: rough, cut flat on top
    const gr = g.createLinearGradient(0, y0, 0, H); gr.addColorStop(0, '#D9C49A'); gr.addColorStop(1, '#A8875A');
    g.fillStyle = gr; g.fillRect(0, y0, W, hh);
    g.strokeStyle = 'rgba(90,64,34,.4)'; g.lineWidth = 1.5;
    for (const [a, b, c] of [[0.08, 0.2, 0.7], [0.3, 0.45, 0.4], [0.62, 0.7, 0.8], [0.85, 0.9, 0.35]]) { g.beginPath(); g.moveTo(W * a, y0 + hh * 0.15); g.lineTo(W * b, y0 + hh * c); g.lineTo(W * (b + 0.05), H); g.stroke(); }
    g.fillStyle = 'rgba(255,248,225,.5)'; g.fillRect(0, y0, W, 3);
    return;
  }
  if (kind === 'altar') {                                                             // ראש המזבח: whole field stones under white plaster (סיד), no hewn edges
    g.fillStyle = '#EEE9DC'; g.fillRect(0, y0, W, hh);
    g.fillStyle = 'rgba(150,140,120,.35)';
    for (let i = 0; i < 9; i++) { const x = (i + 0.5) * (W / 9), r = W / 22 + ((i * 7) % 5); g.beginPath(); g.ellipse(x, y0 + hh * 0.55, r, hh * 0.28, 0, 0, 6.2832); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(0, y0, W, 3);
    return;
  }
  const paving = kind === 'paving' || kind === 'floor';
  g.fillStyle = paving ? '#D6C6A0' : '#CDBB93'; g.fillRect(0, y0, W, hh);            // the course's top (as before) or the flagstones
  g.strokeStyle = 'rgba(90,66,36,.45)'; g.lineWidth = 1.5;
  const rows = paving ? 2 : 1, cw = paving ? W / 5 : W / 3;
  for (let r = 0; r < rows; r++) {
    const y = y0 + (r * hh) / rows;
    g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke();
    for (let x = (r % 2 ? cw / 2 : 0) - cw; x < W + cw; x += cw) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + hh / rows); g.stroke(); }
  }
}

// ── craftb19 ── האנך בעולם (FUN19 §2's plumb row; the owner's note 15: "הדמות מחזיקה חוט עם אבן בקצה ולא מבינים מה עושה, הגם שעדיין
// היא עם הפטיש"). In the world (stages.craft.plumb) the kohen holds the plumb line at the top stone's edge — the hammer on his belt —
// and the check is a thing you see: a hold (or a tap) pays the line out, the bob drops and swings, and damps; the line hangs `d` off
// the gold mark at the base because the top stone sits `d` out of true; small left/right swipes nudge the stone (1:1 with the thumb),
// the bob follows, and when it hangs still on the mark — "ting", the act (≤ .03 gold, ≤ .09 good, else ok and the crew sets it).
// L1 one point · L2 two (the course's two ends) · L3 two, and a gust that sets the bob swinging again once (telegraphed: its flag lifts
// first; wait, then settle). Taps alone: the first pays the line out, each next nudges the stone toward the mark (aimed; at most good).
// The bonus: every point good or better → "ישר כחוט" +100. Nothing moves before the first touch.
import { act as actNow, bonus, actsQ } from './acts.js';
const NOOP = { x: 0.5, y: 0.5, p: 'up', id: 1 };   // (a drag's end with no drag: lands, does nothing)
const PL_FACT = { he: 'האנך — חוט ובקצהו משקולת — תלוי ישר כלפי מטה; כשהחוט נח על הסימן שבבסיס, הנדבך ישר. עמוס ראה בנבואה "חוֹמַת אֲנָךְ" — חומה שנבנתה באנך. הבדיקה כאן: המחשה.', ref: 'עמוס ז, ז', status: 'draft', illus: true };
function plumbWorldModel({ level = 0, rng = Math.random, setup = {} } = {}) {
  const L = clamp(+level || 0, 0, 2), Li = Math.round(L), n = setup.check || setup.rounds || setup.order ? 1 : Li >= 1 ? 2 : 1;   // (a course check: one point)
  const W2 = (2 * Math.PI) / 1.25, DAMP = 2.4, GOLD = 0.03, GOOD = 0.09;
  const d0 = () => (0.2 + 0.18 * rng()) * (rng() < 0.5 ? -1 : 1);
  const M = {
    kind: 'plumb', world: true, holds: true, level: L, n, i: 0, phase: 'ready', pay: 0, d: d0(), s: 0, v: 0, t: 0, pt: 0, still: 0, nudges: 0, tapN: false, lastNudge: -9,
    gust: Li >= 2 ? { at: 1.6 + rng(), done: false, warn: 0 } : null, acts: [], fx: [], progress: 0, done: false, ps: {}, _a: null, held: false, quiet: 0, pts: 0, results: [],
    fact: PL_FACT, coach: 'החזיקו — החוט יורד; החליקו אל הסימן',
    bob() { return this.d + this.s; },                       // the bob's x off the mark (−1…1 of the mark's span)
    grab(x, id, tap) { this.ps[id] = { x0: x, x, tap: !!tap }; this.quiet = 0; if (this.phase === 'ready') { this.phase = 'pay'; this.held = true; this.fx.push({ sfx: 'rope', haptic: 6 }); } },
    drag(x, y, ph, id) {
      if (this.done) return;
      const tap = id === 1 && !!this._a;
      if (ph === 'down') { this.grab(x, id, tap); return; }
      const p = this.ps[id]; if (!p) return;
      if (ph === 'move') {
        if (!p.moved) { p.moved = true; p.x = x; return; }   // (the pad's first move carries the drag's threshold: the base, not a nudge)
        const dx = x - p.x; p.x = x;
        if ((this.phase === 'swing' || this.phase === 'pay') && this.pay >= 1 && Math.abs(dx) > 1e-4) {
          const step = clamp(dx * 1.1, -0.2, 0.2), was = this.d;
          this.d = clamp(this.d + step, -0.6, 0.6); this.s -= (this.d - was) * 0.35;   // (the stone moves; the bob lags behind it, then swings)
          if (Math.abs(this.d - was) > 0.004) { if (this.t - this.lastNudge > 0.12) { this.nudges++; this.fx.push({ sfx: 'joint', haptic: 5 }); } this.lastNudge = this.t; if (p.tap) this.tapN = true; this.phase = 'swing'; }
        }
        return;
      }
      delete this.ps[id];
      if (this.phase === 'pay') { this.held = false; if (this.pay < 1) this.auto0 = true; }   // (let go early: the line runs out to its length by itself)
    },
    tap() { if (this.phase === 'ready') { this.grab(0.5, 0, true); this.held = false; this.auto0 = true; } else if (this.phase === 'swing') this.aim(true); },
    aim(tap) { const was = this.d, step = clamp(-this.d, -0.14, 0.14); this.d += step; this.s -= step * 0.35; this.nudges++; this.lastNudge = this.t; if (tap) this.tapN = true; if (Math.abs(this.d - was) > 0.004) this.fx.push({ sfx: 'joint', haptic: 5 }); },
    step(dt) {
      if (this.done) return;
      this.t += dt; this.pt += dt; this.quiet += dt;
      if (this.phase === 'ready') return;                  // nothing before a touch
      if (this.phase === 'pay') {
        this.pay = Math.min(1, this.pay + dt * (this.held ? 1.6 : 2.4));
        if (this.pay >= 1) { this.phase = 'swing'; this.s = this.d > 0 ? -0.3 : 0.3; this.v = 0; this.fx.push({ sfx: 'plumb', haptic: 8 }); }   // (the bob drops and swings)
        return;
      }
      if (this.phase === 'result') { if (this.pt > 0.9) this.next(); return; }
      // the pendulum (the bob's swing about the stone's line), damped
      const a = -W2 * W2 * this.s - DAMP * this.v; this.v += a * dt; this.s += this.v * dt;
      if (this.gust && !this.gust.done && this.i === this.n - 1) {
        if (this.t > this.gust.at - 1.0 && !this.gust.warn) { this.gust.warn = 1; this.fx.push({ hint: 'רוח! חכה שהחוט יירגע', sfx: 'whoosh' }); }
        if (this.t > this.gust.at) { this.gust.done = true; this.v += 0.9; this.fx.push({ sfx: 'whoosh', haptic: 6 }); }
      }
      const calm = Math.abs(this.s) < 0.025 && Math.abs(this.v) < 0.12;
      this.still = calm ? this.still + dt : 0;
      const sinceN = this.t - this.lastNudge, err = Math.abs(this.d);
      if (this.still > 0.25 && sinceN > 0.45 && (!this.gust || this.gust.done || this.i < this.n - 1) && (err <= GOOD || (this.nudges >= 3 && sinceN > 1.6))) this.settle(err);
    },
    settle(err) {
      let q = err <= GOLD ? 2 : err <= GOOD ? 1 : 0;
      const a = actNow(this, q, { x: 0.5 + this.d * 0.4, y: 0.86, sfx: q >= 1 ? 'bell' : 'plumb', tap: this.tapN, say: q >= 2 ? 'ישר!' : '' });
      this.results.push(a.q); this.progress++;
      if (a.q === 0) this.d = 0;                            // (the crew sets the stone true: a weak check still builds)
      this.s = 0; this.v = 0; this.phase = 'result'; this.pt = 0;
    },
    next() {
      this.i++;
      if (this.i >= this.n) { if (this.results.every((q) => q >= 1)) bonus(this, 100, 'ישר כחוט', { x: 0.5, y: 0.3 }); this.phase = 'done'; this.done = true; return; }
      this.phase = 'ready'; this.pay = 0; this.d = d0(); this.s = 0; this.v = 0; this.nudges = 0; this.tapN = false; this.still = 0; this.auto0 = false; this.ps = {}; this.pt = 0;
      this.fx.push({ hint: 'עכשיו הקצה השני של הנדבך: הורידו את האנך', sfx: 'ui' });
    },
    cue() { if (this.done || this.phase === 'result') return null; if (this.phase === 'ready' || this.phase === 'pay') return { x: 0.5, y: 0.3, now: true }; const dir = this.d > 0 ? -1 : 1; return Math.abs(this.d) <= GOLD ? { x: 0.5, y: 0.7 } : { x: 0.5, y: 0.7, x2: 0.5 + dir * 0.22, y2: 0.7 }; },
    auto() {
      // a tap's act: the line paid out (first), then one nudge toward the mark (aimed), as a short drag
      const a = this._a;
      if (a) { a.k++; if (a.k >= a.n) { this._a = null; return { x: a.x1, y: 0.5, p: 'up', id: 1 }; } const u = a.k / a.n; return { x: a.x0 + (a.x1 - a.x0) * u, y: 0.5, p: 'move', id: 1 }; }
      if (this.phase === 'ready') { this._a = { k: 0, n: 30, x0: 0.5, x1: 0.5 }; return { x: 0.5, y: 0.5, p: 'down', id: 1 }; }
      if (this.phase === 'swing' && Math.abs(this.d) > GOLD * 0.5) { const step = clamp(-this.d, -0.14, 0.14) / 1.1; this._a = { k: 0, n: 8, x0: 0.5, x1: 0.5 + step }; return { x: 0.5, y: 0.5, p: 'down', id: 1 }; }
      return this.done ? null : NOOP;   // (nothing to do now — the line still running out, the bob on its mark: the tap lands as nothing, never a stuck thumb)
    },
    result() {
      const quality = this.acts.length ? actsQ(this) : 0.6;
      return { quality, perfect: this.acts.length === this.n && this.acts.every((a) => a.q === 2), score: Math.round(quality * 250), pts: this.pts | 0, acts: this.acts.length };
    },
  };
  return M;
}
/** the plumb in the world: minigames/index.js takes `world` when a world craft runs it (the sheet keeps its game) */
plumb.world = { ...plumb, model: plumbWorldModel, fact: PL_FACT, hint: 'החזיקו להורדת האנך, ואז החליקו ימינה ושמאלה עד שהחוט נח על הסימן', howto: 'האנך: הורידו את החוט, ואז הזיזו את האבן בהחלקות קטנות עד שהחוט נח על הסימן הזהוב' };
// ── /craftb19 ──
