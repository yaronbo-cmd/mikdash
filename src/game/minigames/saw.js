/* ניסור קורות ארז (sawing the cedar beams) — GAMES14, wave 14: her ❤️ (VOTES14), a craft card (the carpenters, Ant. 15.11.2).
 * A two-man saw rips a cedar log along its dyed line (the saw itself: המחשה). The crew's sawyer pulls on his beat; the
 * player pulls the saw toward herself on his off-beat, straight down the gold line. Each good pull bites; the kerf runs
 * along the line, and a plank comes off the log. Both pulling at once: the saw sticks (a laugh; nothing is lost).
 * Duel (`setup.duel`, the `saw2` variant via pick(ctx.duel)): two players on one phone, a tall canvas, the top half turned
 * to the player across; each pulls toward himself in turn.
 * Levels (FUN14's 0–2): L1 1.2 s, 2 planks · L2 0.95 s, a knot · L3 a drifting tempo (0.9 ± 0.12 s), 3 planks, two knots.
 * q = .5 on the beat + .3 on the line + .2 par. The autopilot pulls on the off-beat, straight. */
import { clamp } from './frame.js';

const FACT = { he: 'ויתנו כסף לחוצבים ולחרשים, ועצי הארזים הובאו מן הלבנון: "לְהָבִיא עֲצֵי אֲרָזִים מִן־הַלְּבָנוֹן אֶל־יָם יָפוֹא". הניסור בשניים כאן — המחשה.', ref: 'עזרא ג, ז', status: 'draft', illus: true };
const K = 1 / 0.28;                                      // a full stroke = a 0.28-high drag
const OFF = 0.42;                                        // her moment in his cycle: just after his stroke ends (it takes .24 of it)
const lineQ = (dev) => clamp(1 - (dev - 0.05) / 0.15);   // straight: ≤ 0.05 of the width off the line; 0 at 0.2

function model({ level = 0, setup = {} } = {}) {
  const L = clamp(+level || 0, 0, 2), duel = !!setup.duel;
  const base = duel ? 0.8 : L < 1 ? 1.2 : 0.95 - 0.05 * (L - 1), drift = L > 1 ? 0.12 * (L - 1) : 0;
  const planks = L >= 2 ? 3 : 2, per = duel ? 11 : L >= 2 ? 7 : 8;
  const knots = L < 1 ? [] : L < 2 ? [[1, 0.5]] : [[1, 0.45], [2, 0.6]];
  const tol = 0.1 - 0.015 * L;                           // the off-beat's window, in the partner's cycle (L1 ±0.12 s)
  const parT = (planks * per + knots.length * 2) * base * 1.2 + planks * 0.9 + 2;
  const M = {
    kind: duel ? 'saw2' : 'saw', level: L, duel, planks, per, P: base, t: 0, bt: 0, pp: 0, from: 0, blade: 0, owe: false, first: true,
    plank: 0, c: 0, kn: 0, knotHit: false, kerf: [], off: 0, ps: {}, beats: [], lines: [], pulls: 0, sticks: 0, words: 0, misses: 0,
    phase: 'saw', pt: 0, quiet: 0, done: false, progress: 0, fx: [], _a: null, _w: 0,
    knotAt() { const k = knots.find((q) => q[0] === this.plank); return k ? k[1] : -1; },
    phi() { return this.bt / this.P; },
    window() { return !duel && !this.first && !this.pp && this.blade < 0.15 && Math.abs(this.phi() - OFF) <= tol; },
    active(skip) { for (const k in this.ps) { const p = this.ps[k]; if (p !== skip && p.st && !p.done) return p; } return null; },
    step(dt) {
      if (this.done) return;
      this.t += dt; this.pt += dt; if (this.stkT > 0) this.stkT -= dt;
      if (this.phase === 'plank') {
        if (this.pt > 0.9) {
          if (this.plank >= planks) { this.done = true; this.phase = 'done'; return; }
          this.phase = 'saw'; this.c = 0; this.kn = 0; this.knotHit = false; this.kerf = []; this.off = 0; this.blade = 0; this.pp = 0; this.first = true; this.ps = {};
          this.fx.push({ sfx: 'thud', o: { soft: true } });
        }
        return;
      }
      if (duel) { this.idle(dt); return; }
      this.P = base + drift * Math.sin(this.t * 0.7);
      if (this.pp) {                                       // the partner's stroke: the blade flies back to him
        this.pp = Math.min(1, this.pp + dt / (0.24 * this.P));
        const e = this.pp * this.pp * (3 - 2 * this.pp);
        this.blade = this.from * (1 - e);
        if (this.pp >= 1) { this.pp = 0; this.blade = 0; }
      }
      if (!this.first) {
        this.bt += dt;
        if (this.bt >= this.P) {
          this.bt -= this.P;
          if (this.blade >= 0.55 && !this.active()) this.partner();
          else { this.owe = true; if (this.blade < 0.55 && !this.active() && !this.hold && ++this.misses % 3 === 0) this.fx.push({ pop: { t: 'משוך אליך!', x: 0.5, y: 0.82 }, sfx: 'ui' }); }
        } else if (this.owe && this.blade >= 0.55 && !this.active()) { if (this.phi() < 0.3) this.partner(); else this.owe = false; }
      }
      this.idle(dt);
    },
    partner() { this.owe = false; this.from = this.blade; this.pp = 1e-3; this.fx.push({ sfx: 'whoosh' }); },
    idle(dt) {                                             // a player's game waits; a test's idle hand gets the crew's help
      this.quiet += dt;
      if (this.patient || this.hold || this.quiet < (duel ? 1.6 : 2.5) || this.pp) return;
      const dir = duel && this.blade > 0.5 ? -1 : 1;
      if (!duel && this.blade > 0.5) return;
      this.blade = dir > 0 ? 1 : 0;
      this.finish({ dir, dev: 0.12, beat: 0.3, crew: true });
    },
    beatNow(p) {
      if (duel) return this.active(p) ? 0.3 : 1;
      if (this.first) return 1;
      const e = Math.abs(this.phi() - OFF);
      return e <= tol ? 1 : clamp(1 - (e - tol) / 0.2);
    },
    drag(x, y, ph, id) {
      if (this.done) return;
      let p = this.ps[id];
      if (ph === 'down') {
        const dir = duel ? (y >= 0.5 ? 1 : -1) : 1;
        for (const k in this.ps) { const q = this.ps[k]; if (q.dir === dir && !q.done && this.t - q.t0 < 2.5) return; if (q.dir === dir) delete this.ps[k]; }   // one hand per player (a lost finger lapses)
        this.ps[id] = { dir, x0: x, y0: y, x, y, b0: this.blade, dev: 0, st: false, done: this.phase !== 'saw', moved: 0, t0: this.t };
        return;
      }
      if (!p) return;
      if (ph === 'up' || ph === 'cancel') {
        delete this.ps[id];
        if (p.done || ph === 'cancel') return;
        if (p.st && Math.abs(this.blade - p.b0) >= 0.45) this.finish(p);
        else if (!p.st && p.moved < 0.03 && this.words < 8 && this.phase === 'saw') { this.words++; this.fx.push({ hint: duel ? 'גרור את הידית אליך — כל אחד בתורו' : 'גרור את המסור אליך, ישר למטה על הקו הזהוב', sfx: 'ui' }); }
        return;
      }
      if (p.done) return;
      p.x = x; p.y = y; p.dev = Math.max(p.dev, Math.abs(x - p.x0)); p.moved = Math.max(p.moved, p.dir * (y - p.y0));
      const other = this.active(p);
      if ((!duel && this.pp) || (duel && other && !p.st)) {        // both pulling at once: it sticks
        if (p.dir * (y - p.y0) > 0.05 && !p.stk) this.stuck(p, other);
        return;
      }
      if (!p.st && Math.abs(p.b0 - this.blade) > 0.02) { p.b0 = this.blade; p.y0 = y; }   // the blade came back under a waiting finger
      const want = clamp(p.b0 + (y - p.y0) * K);                    // 0 = the far end (up), 1 = the near end (down)
      if (p.dir * (want - this.blade) <= 0) return;                 // nothing to pull from this end (or a push)
      if (!p.st) { if (p.dir * (want - this.blade) < 0.05) return; p.st = true; p.ph = this.phi(); p.beat = this.beatNow(p); this.quiet = 0; }
      this.blade = p.dir > 0 ? Math.max(this.blade, want) : Math.min(this.blade, want);
      if ((p.dir > 0 && this.blade >= 0.96) || (p.dir < 0 && this.blade <= 0.04)) this.finish(p);
    },
    stuck(p, other) {
      this.sticks++; p.y0 = p.y; p.b0 = this.blade; p.stk = true; this.beats.push(0); this.stkT = 0.7;   // pulling against him costs the beat; the blade bows
      if (other) { other.done = true; p.done = true; }
      this.fx.push({ sfx: 'grind', shake: 0.6, haptic: [20, 30, 20], pop: { t: duel ? 'נתקע! אחד־אחד' : 'נתקע! חכה שהוא ימשוך', x: 0.5, y: 0.5, kind: 'bad' } });
    },
    finish(p) {
      p.done = true; this.quiet = 0;
      const beat = p.beat != null ? p.beat : this.beatNow(p), line = lineQ(p.dev);
      if (this.first && !duel) { this.first = false; this.bt = 0.5 * this.P; }
      if (!duel && p.dir > 0) this.blade = 1;
      this.pulls++; this.beats.push(beat); this.lines.push(line); this.progress++;
      const side = p.x == null ? 0 : Math.sign(p.x - p.x0);
      this.off = clamp(line > 0.8 ? this.off * 0.5 : this.off + side * (1 - line) * 0.05, -0.07, 0.07);
      const ka = this.knotAt();
      let say = null, kind = '';
      if (this.kn > 0) { this.kn--; say = this.kn ? 'קשר בעץ! עוד משיכה' : 'עברנו את הקשר!'; kind = this.kn ? '' : 'good'; }
      else {
        this.c = Math.min(1, this.c + 1 / per);
        if (ka >= 0 && !this.knotHit && this.c >= ka) { this.knotHit = true; this.kn = 2; this.c = ka; say = 'קשר בעץ! משוך חזק'; }
      }
      this.kerf.push([this.c, this.off]);
      if (!say && !p.crew) {
        if (beat >= 0.9 && line >= 0.9) { if (this.pulls % 4 === 0) { say = 'ישר ובקצב!'; kind = 'good'; } }
        else if (this.words < 8) {
          this.words++;
          if (line < 0.6) { say = 'עקום — משוך ישר על הקו'; kind = 'bad'; }
          else if (duel) { say = 'אחד־אחד!'; }
          else { say = (p.ph != null ? p.ph : this.phi()) < OFF ? 'מוקדם — חכה רגע' : 'מאוחר — משוך מהר יותר'; kind = 'bad'; }
        }
      }
      if (p.crew) say = duel ? 'החבר משך' : 'השותף משך לבד';
      this.fx.push({ sfx: 'wood', haptic: beat >= 0.9 ? [8, 20, 8] : 10, dust: { x: this.cutX(), y: 0.5, n: 10 }, ...(say ? { pop: { t: say, x: 0.5, y: p.dir > 0 ? 0.8 : 0.2, kind } } : {}) });
      if (this.c >= 1) {
        this.plank++; this.phase = 'plank'; this.pt = 0; this.ps = {};
        this.fx.push({ sfx: 'split', pop: { t: 'קרש!', x: 0.5, y: 0.3, kind: 'big' }, haptic: [15, 40, 15] });
      }
    },
    cutX() { return 0.84 - 0.68 * this.c; },                // the handles stay on the screen
    tap() {                                                 // the keyboard (Space) or a still tap: a straight pull at this moment
      if (this.phase !== 'saw' || this.done) return;
      if (!duel && (this.pp || this.blade > 0.5)) return;
      const dir = duel && this.blade > 0.5 ? -1 : 1, p = { dir, dev: 0, st: true };
      p.beat = this.beatNow(p); this.blade = dir > 0 ? 1 : 0; this.finish(p);
    },
    cue() {
      if (this.phase !== 'saw' || this.done) return null;
      const x = this.cutX();
      if (duel) return this.active() ? null : this.blade > 0.5 ? { x, y: 0.3, x2: x, y2: 0.04 } : { x, y: 0.7, x2: x, y2: 0.96 };
      if (this.pp || this.blade > 0.5) return null;
      return { x, y: 0.7, x2: x, y2: 0.98, now: this.first || this.window(), timed: !this.first };
    },
    auto() {
      if (this.phase !== 'saw') { this._a = null; return null; }
      const a = this._a;
      if (a) {
        a.y += 0.07 * a.dir;
        if (a.dir > 0 ? a.y >= 0.99 : a.y <= 0.01) { this._a = null; return { x: a.x, y: a.y, p: 'up', id: a.id }; }
        return { x: a.x, y: a.y, p: 'move', id: a.id };
      }
      if ((this._w -= 1 / 60) > 0) return null;
      if (duel) {
        if (this.active()) return null;
        const dir = this.blade > 0.5 ? -1 : 1, y = dir > 0 ? 0.62 : 0.38;
        this._w = 0.3; this._a = { x: 0.5, y, dir, id: dir > 0 ? 1 : 2 };
        return { x: 0.5, y, p: 'down', id: this._a.id };
      }
      if (this.pp || this.blade > 0.1) return null;
      const ph = this.phi();
      if (!this.first && !(ph > OFF - 0.07 && ph < OFF - 0.01)) return null;
      this._a = { x: 0.5, y: 0.62, dir: 1, id: 1 };
      return { x: 0.5, y: 0.62, p: 'down', id: 1 };
    },
    result() {
      const mean = (a, d) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : d);
      const beat = mean(this.beats, 0.3), line = mean(this.lines, 0.5), par = clamp(1 - (this.t - parT) / parT);
      const quality = clamp(0.5 * beat + 0.3 * line + 0.2 * par);
      return { quality, perfect: this.done && !this.sticks && this.beats.every((b) => b >= 0.9) && this.lines.every((l) => l >= 0.9), score: Math.round(quality * 300) + this.beats.filter((b) => b >= 0.9).length * 5, planks: this.plank, pulls: this.pulls, sticks: this.sticks, beat, line, par };
    },
  };
  return M;
}

function draw(g, M, W, H) {
  g.fillStyle = '#5E4630'; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(232,201,154,.16)';                                            // the sawdust yard
  for (let i = 0; i < 26; i++) { const x = ((i * 97) % 100) / 100 * W, y = ((i * 61 + 13) % 100) / 100 * H; g.fillRect(x, y, 3 + (i % 3), 2); }
  const y0 = H * 0.38, y1 = H * 0.62, lx0 = W * 0.03, lx1 = W * 0.88, cy = H * 0.5, xc = W * M.cutX();
  g.fillStyle = '#3F2C1A'; for (const tx of [0.2, 0.8]) g.fillRect(W * tx - W * 0.03, H * 0.32, W * 0.06, H * 0.36);   // the trestles
  const k = M.phase === 'plank' ? Math.min(1, M.pt / 0.6) : 0;
  const log = (top, bot, dy, a) => {                                               // a slab of the log between two heights
    g.globalAlpha = a; g.fillStyle = '#A5653F'; g.fillRect(lx0, top + dy, lx1 - lx0, bot - top);
    g.strokeStyle = 'rgba(110,60,32,.55)'; g.lineWidth = 1.5;
    g.beginPath(); for (let i = 1; i < 6; i++) { const yy = top + dy + ((bot - top) * i) / 6; g.moveTo(lx0, yy); for (let x = lx0; x <= lx1; x += W * 0.08) g.lineTo(x, yy + Math.sin(x * 0.05 + i) * 1.6); } g.stroke();
    g.globalAlpha = 1;
  };
  if (k) { log(cy, y1, 0, 1); log(y0, cy, -k * H * 0.3, 1 - k); }
  else log(y0, y1, 0, 1);
  g.fillStyle = '#5C3A22'; g.fillRect(lx0, y0 - k * H * 0.3, lx1 - lx0, H * 0.025); g.fillRect(lx0, y1 - H * 0.025, lx1 - lx0, H * 0.025);   // the bark
  g.fillStyle = '#C98A5A'; g.beginPath(); g.ellipse(lx1, cy, W * 0.025, (y1 - y0) / 2, 0, 0, 6.2832); g.fill();                         // the end grain
  g.strokeStyle = '#9A5E38'; g.lineWidth = 1; for (const r of [0.33, 0.66]) { g.beginPath(); g.ellipse(lx1, cy, W * 0.025 * r, (y1 - y0) / 2 * r, 0, 0, 6.2832); g.stroke(); }
  if (!k) {
    const ka = M.knotAt();
    if (ka >= 0 && (M.kn > 0 || !M.knotHit)) {                                      // the knot on the line
      const kx = W * (0.84 - 0.68 * ka);
      g.fillStyle = '#5A3018'; g.beginPath(); g.ellipse(kx, cy, W * 0.035, H * 0.05, 0, 0, 6.2832); g.fill();
      g.strokeStyle = M.kn ? '#FFB45A' : '#3A1E0E'; g.lineWidth = M.kn ? 3 : 1.5; g.beginPath(); g.ellipse(kx, cy, W * 0.022, H * 0.03, 0, 0, 6.2832); g.stroke();
    }
    g.strokeStyle = '#B23A26'; g.lineWidth = 2; g.beginPath(); g.moveTo(lx0, cy); g.lineTo(xc, cy); g.stroke();     // the dyed line, ahead of the cut
    g.strokeStyle = '#24160C'; g.lineWidth = 4; g.beginPath(); g.moveTo(lx1, cy);                                   // the kerf, with its wobbles
    for (const [c, off] of M.kerf) g.lineTo(W * (0.84 - 0.68 * c), cy + off * H);
    g.stroke();
  }
  for (let i = 0; i < M.plank; i++) { g.fillStyle = i % 2 ? '#B97A4E' : '#C78958'; g.fillRect(W * 0.03, H * (0.95 - i * 0.035), W * 0.2, H * 0.028); }   // the planks' pile
  if (M.phase === 'done') return;
  const bc = H * (0.5 + (M.blade - 0.5) * 0.24), ft = bc - H * 0.34, nb = bc + H * 0.34, bw = Math.max(7, W * 0.022);
  if (!k && M.stkT > 0) {                                                          // stuck: the blade bows, and wobbles back
    g.strokeStyle = '#C7CCD4'; g.lineWidth = bw; g.beginPath(); g.moveTo(xc, ft); g.quadraticCurveTo(xc + Math.sin(M.t * 30) * W * 0.09 * M.stkT, (ft + nb) / 2, xc, nb); g.stroke();
  } else if (!k) {
    g.fillStyle = '#C7CCD4'; g.fillRect(xc - bw / 2, ft, bw, nb - ft);                                               // the blade, its teeth to the cut
    g.fillStyle = '#8E96A3'; g.beginPath(); for (let y = ft + 6; y < nb - 6; y += 8) { g.moveTo(xc - bw / 2, y); g.lineTo(xc - bw / 2 - 5, y + 4); g.lineTo(xc - bw / 2, y + 8); } g.fill();
  }
  const handle = (y, glow) => {
    if (glow) { g.strokeStyle = '#FFD66E'; g.lineWidth = 4 + 2 * Math.sin(M.t * 12); g.strokeRect(xc - W * 0.15, y - H * 0.04, W * 0.3, H * 0.08); }
    g.fillStyle = '#7A5230'; g.fillRect(xc - W * 0.13, y - H * 0.02, W * 0.26, H * 0.04);
  };
  const hands = (y, up, sleeve) => {
    for (const s of [-1, 1]) {
      const hx = xc + s * W * 0.08;
      g.fillStyle = sleeve; g.fillRect(hx - W * 0.03, up ? 0 : y, W * 0.06, up ? y : H - y);
      g.fillStyle = '#D9A77B'; g.beginPath(); g.arc(hx, y, W * 0.032, 0, 6.2832); g.fill();
    }
  };
  const c = M.cue(), glowN = !!(c && (M.duel ? c.y > 0.5 : c.now)), glowF = !!(c && M.duel && c.y < 0.5);
  if (!k) {
    if (c && c.y > 0.5) { g.strokeStyle = 'rgba(255,214,110,.6)'; g.setLineDash([6, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(xc, nb + H * 0.03); g.lineTo(xc, H); g.stroke(); g.setLineDash([]); }
    handle(ft, glowF); handle(nb, glowN);
    hands(ft, true, M.duel ? '#F4F1E8' : '#CDBF9F'); hands(nb, false, '#F4F1E8');
  }
  for (const id in M.ps) {                                                         // the finger's own line: gold when straight
    const p = M.ps[id]; if (!p.st || p.done) continue;
    g.strokeStyle = p.dev <= 0.06 ? 'rgba(255,214,110,.85)' : 'rgba(255,140,90,.85)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(p.x0 * W, p.y0 * H); g.lineTo(p.x * W, p.y * H); g.stroke();
  }
  g.font = '800 17px Heebo, system-ui, sans-serif'; g.textAlign = 'center'; g.direction = 'rtl';
  const say = (t, x, y, flip) => { g.save(); g.translate(x, y); if (flip) g.rotate(Math.PI); g.lineWidth = 4; g.strokeStyle = 'rgba(28,20,10,.85)'; g.strokeText(t, 0, 0); g.fillStyle = '#FFE08A'; g.fillText(t, 0, 0); g.restore(); };
  const sx = xc < W * 0.5 ? W * 0.74 : W * 0.26;
  if (!k && glowN) say(M.duel ? 'משוך אליך' : 'משוך!', sx, nb + 6, false);
  if (!k && glowF) say('משוך אליך', sx, ft - 2, true);
  g.font = '700 13px Heebo, system-ui, sans-serif'; g.textAlign = 'right';
  const lab = `קרש ${Math.min(M.plank + 1, M.planks)}/${M.planks}`;
  const plate = (x, y) => { g.fillStyle = 'rgba(28,20,10,.72)'; g.fillRect(x, y, 70, 22); g.fillStyle = '#F3E6C4'; g.fillText(lab, x + 64, y + 16); };
  if (!M.duel) plate(W - 76, 6);
  else { plate(W - 76, H - 28); g.save(); g.translate(W * 0.5, H * 0.5); g.rotate(Math.PI); plate(W * 0.5 - 76, H * 0.5 - 28); g.restore(); }   // each player's own, at his edge
}

const BASE = { topic: 'cedar', step: 'craft', secs: [18, 30], fact: FACT, model, draw, guide: 2 };
/** the duel: two on one phone (the top half turned to the player across) */
export const saw2 = {
  ...BASE, kind: 'saw2', n: 'ניסור בשניים', kicker: 'טלפון אחד, שני נגרים', tall: 0.64,
  hint: 'כל אחד מושך אליו בתורו — יחד זה נתקע!', howto: 'הטלפון על השולחן, כל אחד בקצה שלו: מושכים את המסור אליכם בתורות',
  model: (o = {}) => model({ ...o, setup: { ...(o.setup || {}), duel: true } }),
};
export const saw = {
  ...BASE, kind: 'saw', n: 'ניסור קורות ארז', kicker: 'נגרים · עם השותף',
  hint: 'משוך את המסור אליך כשהשותף סיים למשוך — ישר על הקו',
  howto: 'גרור את המסור אליך, ישר למטה על הקו הזהוב — ואז השותף מושך אליו',
  alt: { label: 'שוב — בשניים', game: saw2 },
  pick: (ctx = {}) => (ctx.duel ? saw2 : saw),
};

// ── craftb19 ── ניסור בעולם (FUN19 §2's saw row, binding): back and forth along the saw's axis — the blade follows the thumb (up = push, away
// from him, toward his partner; down = pull, to him). The PUSH cuts: a push of ≥ .45 of the blade's run (≈ 60 px of thumb) is a stroke, and
// its end is the impact — graded on the music's beat (acts.js beatQ), sawdust spurts, the kerf deepens along the chalk line. ≈ 2 strokes a
// second with the music = one cutting act a second. Too fast and the blade binds (it lags the thumb, a grind) — it never breaks. A stroke
// kept within 10° of the line: straight; every stroke straight → "חתך ישר" +80 at the end. The board drops (the planks: L1 1 · L2 1 with a
// knot — two strokes there for one cut's worth · L3 2). Taps alone: a tap is one push and its return (at most good).
import { act as actNow, bonus, actsQ, beatQ } from './acts.js';
function sawWorldModel({ level = 0, setup = {} } = {}) {
  const L = clamp(+level || 0, 0, 2), Li = Math.round(L), planks = Li >= 2 ? 2 : 1, per = Li >= 1 ? 9 : 8, knot = Li >= 1 ? 0.5 : -1;
  const RUN = 0.45, VMAX = 5.5, KY = 1 / 0.45;   // (a stroke: .45 of the run; the blade's top speed, runs a second; a full run = .45 of the box)
  const M = {
    kind: 'saw', world: true, level: L, planks, per, blade: 0.85, pp: 0, c: 0, plank: 0, phase: 'saw', pt: 0, t: 0, done: false, progress: 0, fx: [], acts: [], pts: 0,
    want: 0.85, ps: {}, armed: true, top: 0.85, bot: 0.85, low: 0.85, dev: 0, len: 0, straight: 0, crooked: 0, tapN: false, bindT: 0, inKnot: false, knotHit: false, _a: null, quiet: 0, P: 0.48,
    kerf: [], off: 0, pulls: 0, beats: [], lines: [], sticks: 0, coach: 'הלוך ושוב על "עבודה" — למעלה חותך',
    knotAt() { return knot; },
    drag(x, y, ph, id) {
      if (this.done) return;
      const tap = id === 1 && !!this._a;
      if (ph === 'down' && !tap && this.tp) { this.tp = 0; this.want = this.blade; this.tapN = false; }   // (a drag begun before the touch's push bit: the thumb takes the blade)
      if (ph === 'down') { this.ps[id] = { y0: y, b0: this.want, x0: x, tap }; this.quiet = 0; return; }
      const p = this.ps[id]; if (!p) return;
      if (ph === 'move' && !p.moved && !p.tap) { p.moved = true; p.y0 = y; p.x0 = x; return; }   // (the pad's first move carries the drag's threshold: the base)
      if (ph === 'move') { this.want = clamp(p.b0 + (y - p.y0) * KY); this.dev = Math.max(this.dev, Math.abs(x - p.x0)); if (p.tap) this.tapN = true; this.quiet = 0; return; }
      delete this.ps[id];
    },
    /** the touch-down (two thumbs, stages.craft.saw.touch): the push starts now from the ready pose, its bite ≈ 90 ms later (FUN19 §2) */
    touchPush() { if (this.done || this.phase !== 'saw' || !this.armed || this.tp || this.blade < 0.6 || this._a) return false; this.tp = 1; this.tpT = 0; this.tpCut = false; this.want = Math.max(0, this.blade - 0.52); this.tapN = true; return true; },
    tap() { if (!this._a && this.phase === 'saw') { this.blade = Math.max(this.blade, 0.9); this.want = 0.05; this.tapN = true; } },
    step(dt) {
      if (this.done) return;
      this.t += dt; this.pt += dt; this.quiet += dt; if (this.bindT > 0) this.bindT -= dt;
      if (this.tp && (this.tpT += dt) > 0.6) this.tp = 0;
      if (this.phase === 'plank') {
        if (this.pt > 1.0) { if (this.plank >= planks) { this.done = true; this.phase = 'done'; if (!this.crooked && this.straight >= 3) bonus(this, 80, 'חתך ישר', { x: 0.5, y: 0.3 }); return; } this.phase = 'saw'; this.c = 0; this.kerf = []; this.knotHit = false; this.fx.push({ sfx: 'thud', o: { soft: true } }); }
        return;
      }
      // the blade toward the thumb, at most VMAX runs a second (faster: it binds — lags, grinds; never breaks)
      const d = this.want - this.blade, mx = VMAX * dt * (this.inKnot ? 0.5 : 1), b0 = this.blade;
      if (Math.abs(d) > mx) { this.blade += Math.sign(d) * mx; if (Math.abs(d) > 0.35 && this.bindT <= 0) { this.bindT = 0.6; this.bindN = (this.bindN | 0) + 1; this.fx.push({ sfx: 'grind', haptic: [6, 10, 6], ...(this.bindN % 4 === 1 ? { hint: 'לאט יותר — המסור נתקע; הלוך ושוב בקצב' } : {}) }); } } else this.blade = this.want;
      // a stroke: armed at a top, a push (the blade falling) of ≥ RUN that reaches the end or turns back = the impact; then a pull back
      // of half a run arms the next
      // (the push's end: the blade at the far end, or it stops falling — the thumb turned back or rested)
      if (this.armed) { if (this.blade > this.top) { this.top = this.blade; this.bot = this.blade; } if (this.blade < this.bot) this.bot = this.blade; if (this.top - this.bot >= RUN && (this.blade <= 0.06 || b0 - this.blade < 0.002)) this.cut(); }
      else { if (this.blade < this.low) this.low = this.blade; if (this.blade - this.low >= RUN * 0.5) { this.armed = true; this.top = this.bot = this.blade; } }
    },
    cut() {
      // the push's impact: the beat's grade, the kerf, the sawdust (fx dust), the act's "+N"
      const straight = this.dev <= Math.tan(10 * Math.PI / 180) * RUN * 1.6;
      if (straight) this.straight++; else this.crooked++;
      let q = beatQ(this.level); if (!straight && q > 1) q = 1;
      const knotNow = knot >= 0 && !this.knotHit && this.c >= knot - 1e-6 && this.c < knot + 2 / per;
      this.inKnot = knotNow;
      this.c = Math.min(1, this.c + (knotNow ? 0.5 : 1) / per); if (knotNow && this.c >= knot + 1 / per) this.knotHit = true;
      this.kerf.push([this.c, 0]); this.pulls++; this.progress++; this.beats.push(q === 2 ? 1 : q === 1 ? 0.8 : 0.5); this.lines.push(straight ? 1 : 0.6);
      actNow(this, q, { x: 0.5, y: 0.3, sfx: q === 2 ? 'perfect' : 'wood', tap: this.tapN, say: knotNow ? 'קשר בעץ' : '' });
      this.fx.push({ dust: { x: 0.5, y: 0.5, n: 6 + 3 * q } });
      this.armed = false; this.low = this.blade; this.dev = 0; this.tapN = false; if (this.tp) { this.tp = 0; this.tpCut = true; }
      if (this.c >= 1) { this.plank++; this.phase = 'plank'; this.pt = 0; this.inKnot = false; this.fx.push({ sfx: 'split', haptic: [15, 40, 15], pop: { t: 'הקרש נפל!', x: 0.5, y: 0.5, kind: 'big' } }); }
    },
    cue() { if (this.phase !== 'saw' || this.done) return null; return this.blade > 0.5 ? { x: 0.5, y: 0.75, x2: 0.5, y2: 0.25 } : { x: 0.5, y: 0.25, x2: 0.5, y2: 0.75 }; },
    auto() {
      // a tap: one push from the ready pose (the blade drawn back to him) — the push starts on the tap's first frame and bites ≈ 90 ms
      // later (FUN19: the impact at +90 ms) — then the blade comes back to the ready pose. A blade not drawn back (or not re-armed) is
      // drawn back first. The keyframes: [want, steps] (60 steps a second; hands.js feeds ≤ 4 a frame on a slow phone)
      const a = this._a;
      if (a) {
        if (this.tp) return { x: 0.5, y: a.y0 + (a.w0 - a.b0) / KY, p: 'move', id: 1 };   // (the touch's push still running: the tap waits for its bite)
        a.k++;
        while (a.i < a.kf.length && a.k > a.kf[a.i][1]) { a.w0 = a.kf[a.i][0]; a.k -= a.kf[a.i][1]; a.i++; }
        if (a.i >= a.kf.length) { this._a = null; return { x: 0.5, y: a.y0 + (a.w0 - a.b0) / KY, p: 'up', id: 1 }; }
        const f = a.kf[a.i], w = a.w0 + (f[0] - a.w0) * (a.k / f[1]);
        return { x: 0.5, y: a.y0 + (w - a.b0) / KY, p: 'move', id: 1 };
      }
      if (this.phase !== 'saw') return null;
      const READY = 0.85, kf = [];
      if (this.tp || this.tpCut) { this.tpCut = false; kf.push([READY, 10], [READY, 22]); this._a = { k: 0, i: 0, kf, w0: this.want, y0: 0.5, b0: this.want }; return { x: 0.5, y: 0.5, p: 'down', id: 1 }; }   // (the touch pushed: the tap only brings the blade back)
      if (!this.armed || this.blade < 0.7) kf.push([0.92, 5]);
      kf.push([Math.max(0, Math.max(this.blade, kf.length ? 0.92 : 0) - 0.52), 4], [READY, 10], [READY, 18 - kf.length * 5]);   // (and it rests there: one stroke a tap — 32 steps, the tap's burst is half a second)
      this._a = { k: 0, i: 0, kf, w0: this.want, y0: 0.5, b0: this.want }; return { x: 0.5, y: 0.5, p: 'down', id: 1 };
    },
    result() {
      const quality = this.acts.length ? clamp(0.85 * actsQ(this) + 0.15 * (this.crooked ? 0.6 : 1)) : 0.6;
      return { quality, perfect: this.done && this.acts.every((a) => a.q === 2) && !this.crooked, score: Math.round(quality * 300), planks: this.plank, pts: this.pts | 0, acts: this.acts.length };
    },
  };
  return M;
}
saw.world = { ...saw, model: sawWorldModel, hint: 'הלוך ושוב: למעלה דוחף וחותך, למטה מושך — בקצב המוזיקה', howto: 'החליקו למעלה ולמטה: המסור הולך עם האגודל, הדחיפה חותכת על הקו' };
// ── /craftb19 ──
