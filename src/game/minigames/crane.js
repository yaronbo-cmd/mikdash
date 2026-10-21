/* המנוף (the crane): lower a swinging stone onto its bed, Tower-Bloxx-like, over the real joints of the course below.
 * A tap lowers the stone; how close it lands to its bed sets its quality; an edge that falls over a joint of the
 * course below ("תפר על תפר") is weak and costs quality. The crew then slides it true, so the site is always right.
 * Units: stone widths (the first target's width = 1), measured along the wall's face. setup.crane (index.js) may hold
 * the real course: { targets:[{u, w}], below:[{u, w}] }; without it a plausible course is drawn from the seed. */
import { clamp } from './frame.js';

const PERFECT = 0.035, JOINT = 0.07;
/* BUILD's key stones (state.js keyOf → `what`): the first stone of a stage, a cornerstone, the Mount's great stones, a lintel */
const VARIANT = {
  none: { n: 4 },
  first: { n: 3 },
  corner: { n: 2 },
  great: { n: 1, w: 2.2, amp: 0.8, per: 1.3, wind: 0.08 },          // heavy and slow, the wind matters more
  lintel: { n: 1, w: 2.0, posts: true },                            // it must rest on both posts
};

function makeCourse(rand, real) {
  if (real && real.targets && real.targets.length && real.below && real.below.length > 1) return real;
  const targets = [];
  let u = 0;
  for (let i = 0; i < 4; i++) { const w = i === 0 ? 1 : 0.85 + rand() * 0.4; if (i) u += targets[i - 1].w / 2 + w / 2; targets.push({ u, w }); }
  for (let tries = 0; tries < 12; tries++) {       // the course below: its joints must not sit under a target's edge
    const below = [];
    let x = -2.6 + rand() * 0.5;
    while (x < u + 2.6) { const w = 0.8 + rand() * 0.5; below.push({ u: x + w / 2, w }); x += w; }
    const joints = below.map((b) => b.u + b.w / 2);
    const clash = targets.some((t) => joints.some((j) => Math.abs(j - (t.u - t.w / 2)) < 0.14 || Math.abs(j - (t.u + t.w / 2)) < 0.14));
    if (!clash || tries === 11) return { targets, below };
  }
  return { targets, below: [] };
}

export const crane = {
  kind: 'crane', topic: 'stone', n: 'המנוף', kicker: 'אבן גדולה', step: 'set', secs: [15, 30],
  hint: 'הקש כשהאבן מעל מקומה — לא תפר מעל תפר',
  howto: 'הקש על המסך כשהאבן התלויה מעל המקום המסומן בזהב', guide: 1,   // (wave 8B) the first-time how-to
  fact: { he: 'אבני ההיכל של הורדוס היו לבנות וחזקות; אורך כל אחת כעשרים וחמש אמה, גובהה שמונה ורוחבה כשתים־עשרה.', ref: 'יוספוס, קדמוניות היהודים טו, 391–392 (בתרגום חופשי)', status: 'draft', illus: false },

  model({ level = 0, rng, setup = {} } = {}) {
    const V = VARIANT[setup.what] || VARIANT.none;
    let full = makeCourse(rng, setup.crane);
    if (V.w) {                                            // the great stone / the lintel: one long stone
      full = { targets: [{ u: 0, w: V.w }], below: V.posts ? [] : makeCourse(rng, null).below.map((b) => ({ u: b.u - 0.6, w: b.w })) };
      if (!V.posts) for (let t = 0; t < 8 && full.below.some((b) => [b.u - b.w / 2, b.u + b.w / 2].some((j) => Math.abs(Math.abs(j) - V.w / 2) < 0.14)); t++) full.below = full.below.map((b) => ({ u: b.u + 0.23, w: b.w }));
    }
    const k = Math.max(1, Math.min(full.targets.length, setup.stones | 0 || V.n || full.targets.length));   // a quick lift: 1 stone
    const course = k === full.targets.length ? full : { targets: full.targets.slice(0, k), below: full.below };
    const joints = [];
    for (const b of course.below) joints.push(b.u - b.w / 2, b.u + b.w / 2);
    const A = (0.45 + 0.13 * level) * (V.amp || 1), P = (2.4 - 0.17 * level) * (V.per || 1), wind = (level >= 2 ? 0.1 * (level - 1) : 0) + (V.wind || 0);
    const n = course.targets.length;
    const M = {
      level, course, joints, n, i: 0, posts: !!V.posts, what: setup.what || 'first', phase: 'intro', pt: 0, st: 0, phi: rng() * 6.28, phi2: rng() * 6.28,
      u: 0, v: 0, land: 0, placed: [], q: [], perfects: 0, streak: 0, score: 0, jj: false, done: false, progress: 0, fx: [],
      view: course.targets[0].u, autoThr: 0.02 + 0.05 * rng(), creakAt: 0,
      target() { return course.targets[Math.min(this.i, n - 1)]; },
      /** where the stone would land if lowered now (the rope keeps a little of its sway) */
      aim() { return this.u + this.v * 0.1; },
      clashAt(x, w) { for (const j of joints) if (Math.abs(j - (x - w / 2)) < JOINT || Math.abs(j - (x + w / 2)) < JOINT) return true; return false; },
      step(dt) {
        if (this.done) return;
        const tg = this.target();
        this.view += (tg.u - this.view) * Math.min(1, dt * 4);
        this.pt += dt;
        if (this.phase === 'intro') { if (this.pt > 0.6) { this.phase = 'swing'; this.pt = 0; this.st = 0; } }
        if (this.phase === 'intro' || this.phase === 'swing') {
          this.st += dt;
          const slow = this.i === 0 && level <= 1;                          // (wave 8B) a slow first stone, then the curve
          const w = (2 * Math.PI) / (slow ? P * 1.3 : P), s = this.st * w + this.phi;
          const nu = tg.u + (slow ? A * 0.85 : A) * Math.sin(s) + wind * Math.sin(this.st * 0.9 + this.phi2);
          this.v = dt > 0 ? (nu - this.u) / dt : 0; this.u = nu;
          if (Math.abs(Math.cos(s)) < 0.05 && this.st - this.creakAt > 0.5) { this.creakAt = this.st; this.fx.push({ sfx: 'rope', o: { tension: 0.4 + 0.1 * level } }); }
          if (this.phase === 'swing' && this.st > 8 && !this.patient) { this.fx.push({ hint: 'הקש כדי להוריד את האבן — הצוות הוריד אותה הפעם' }); this.tap(); }
        } else if (this.phase === 'drop' && this.pt >= 0.35) {
          const off = this.land - tg.u, a = Math.abs(off);
          let q = a <= PERFECT ? 1 : clamp(1 - (a - PERFECT) / 0.5, 0.12, 0.97);
          this.jj = V.posts ? Math.abs(off) > 0.25 : this.clashAt(this.land, tg.w);   // a lintel: both ends must rest on their posts
          if (this.jj) q *= V.posts ? 0.5 : 0.75;
          const perfect = q >= 0.999;
          this.q.push(q); this.placed.push({ u: tg.u, w: tg.w, from: this.land });
          this.streak = perfect ? this.streak + 1 : 0;
          if (perfect) this.perfects++;
          this.score += Math.round(q * 100) + (perfect ? 50 : 0) + (this.streak > 1 ? 25 * (this.streak - 1) : 0);
          const x = 0.5 + (this.land - this.view) * 0.3, y = 0.6;
          this.fx.push({ sfx: 'thud', o: { mass: Math.min(1, 0.4 + 0.25 * tg.w) }, haptic: V.w ? [30, 40, 30] : perfect ? [12, 30, 18] : 16, shake: V.w ? 1.6 : perfect ? 0.6 : 1, dust: { x, y: 0.66, n: V.w ? 24 : 12 } });
          if (perfect) this.fx.push({ sfx: 'joint', pop: { t: this.streak > 1 ? `מושלם · רצף ×${this.streak}` : 'מושלם!', x, y: 0.42, kind: 'good' } });
          else if (this.jj && V.posts) this.fx.push({ sfx: 'grind', pop: { t: 'קצה אחד לא נח על העמוד', x, y: 0.42, kind: 'bad' }, hint: 'המשקוף צריך לשבת על שני העמודים. כוון למרכז.' });
          else if (this.jj) this.fx.push({ sfx: 'grind', pop: { t: 'תפר על תפר — חלש', x, y: 0.42, kind: 'bad' }, hint: 'קצה האבן נפל מעל תפר בנדבך שמתחת. כוון למרכז המקום.' });
          else this.fx.push({ sfx: 'grind', pop: { t: q >= 0.75 ? 'טוב' : 'הצוות מיישר', x, y: 0.42 } });
          this.phase = 'settle'; this.pt = 0; this.progress++;
        } else if (this.phase === 'settle' && this.pt >= 0.6) {
          this.i++;
          if (this.i >= n) { this.done = true; this.phase = 'done'; }
          else { this.phase = 'intro'; this.pt = 0; this.st = 0; this.phi = rng() * 6.28; this.autoThr = 0.02 + 0.05 * rng(); this.u = this.target().u; this.v = 0; }
        }
      },
      tap() {
        if (this.phase !== 'swing' || this.done) return;
        this.land = this.aim(); this.phase = 'drop'; this.pt = 0;
        this.fx.push({ sfx: 'rope', o: { tension: 0.9 } });
      },
      /** (wave 8B) where and when a player taps: the bed (canvas 0…1, set by draw), `now` just before the stone is over it */
      cue() {
        const tg = this.target(), a = this.aim() + this.v * 0.1, at = this.cueAt || [0.5, 0.62];
        return { x: at[0], y: at[1], now: this.phase === 'swing' && Math.abs(a - tg.u) < 0.05 && !this.clashAt(a, tg.w), timed: true };
      },
      auto() {
        if (this.phase !== 'swing') return false;
        if (this.st > 5) return true;
        const tg = this.target();
        return this.st > 0.6 && Math.abs(this.aim() - tg.u) < this.autoThr && !this.clashAt(this.aim(), tg.w);
      },
      result() {
        const quality = this.q.length ? this.q.reduce((a, b) => a + b, 0) / this.q.length : 0;
        return { quality, perfect: this.q.length === n && this.perfects === n, score: this.score, placed: this.q.length };
      },
    };
    M.u = course.targets[0].u;
    return M;
  },

  draw(g, M, W, H, fx) {
    const s = W * 0.3, h = s * 0.42, base = H * 0.78, courseY = base - h;
    const X = (u) => W / 2 + (u - M.view) * s;
    const sh = fx.shake ? (Math.random() - 0.5) * fx.shake : 0;
    g.save(); g.translate(sh, sh * 0.5);
    if (!M._sky || M._sky.h !== H) {                                            // made once per size, not per frame
      const sky = g.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#F6C98A'); sky.addColorStop(0.55, '#F3DDB0'); sky.addColorStop(1, '#CDB58A');
      M._sky = { h: H, sky };
    }
    g.fillStyle = M._sky.sky; g.fillRect(-10, -10, W + 20, H + 20);
    g.fillStyle = 'rgba(120,96,60,.25)';                                        // the far city
    for (let i = 0; i < 9; i++) { const x = ((i * 97 - M.view * 12) % (W + 80)) - 40; g.fillRect(x, base - h * 3.2 - (i % 3) * 8, 46, h * 3.2); }
    const stone = (x, y, w, fill, edge) => {
      g.fillStyle = fill; g.fillRect(x, y, w, h);
      g.strokeStyle = edge; g.lineWidth = 1.5; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      g.fillStyle = 'rgba(255,248,225,.35)'; g.fillRect(x + h * 0.18, y + h * 0.18, w - h * 0.36, h * 0.64);   // the boss inside its drafted margins
    };
    if (M.posts) { const tg0 = M.course.targets[0]; for (const e of [-1, 1]) stone(X(tg0.u + e * (tg0.w / 2 - 0.25) - 0.25), base - h * 1.2, 0.5 * s, '#D8C8A0', '#7A6541'), stone(X(tg0.u + e * (tg0.w / 2 - 0.25) - 0.25), base - h * 0.2, 0.5 * s, '#D8C8A0', '#7A6541'); }
    else for (const b of M.course.below) stone(X(b.u - b.w / 2), base, b.w * s, '#D8C8A0', '#7A6541');
    g.fillStyle = '#B9A67E'; g.fillRect(0, base + h, W, H - base - h);
    // the joints of the course below that the hanging stone's edges would sit on: warn in red
    const tg = M.target();
    M.cueAt = [X(tg.u) / W, (courseY + h * 0.55) / H];
    if (M.phase === 'swing') {
      const a = M.aim();
      g.lineWidth = 3;
      for (const j of M.joints) if (Math.abs(j - (a - tg.w / 2)) < JOINT || Math.abs(j - (a + tg.w / 2)) < JOINT) { g.strokeStyle = '#E0573A'; g.beginPath(); g.moveTo(X(j), base); g.lineTo(X(j), base + h); g.stroke(); }
    }
    for (const p of M.placed) stone(X(p.u - p.w / 2), courseY, p.w * s, '#E3D4AE', '#7A6541');
    if (!M.done) {                                                              // the bed: a gold ghost
      const now = M.level <= 1 && M.phase === 'swing' && Math.abs(M.aim() - tg.u) < 0.06;             // training wheels: "now!"
      g.setLineDash(now ? [] : [6, 5]); g.strokeStyle = now ? '#FFC93C' : '#B8860B';   /* ── flow10 ── (PRODUCER10 N5: "marked in gold" — the moment is a bright gold, not green) */  g.lineWidth = now ? 4 : 2; g.strokeRect(X(tg.u - tg.w / 2) + 1, courseY + 1, tg.w * s - 2, h - 2); g.setLineDash([]);
    }
    // the treadwheel (Vitruvius' great drum; its use on the Temple Mount is an illustration), the jib, the pulley and the rope
    const wx = W * 0.9, wy = H * 0.2, wr = H * 0.15, rot = (M.phase === 'drop' ? M.pt * 3 : 0) + M.i * 1.3;
    g.strokeStyle = '#5A3C22'; g.lineWidth = 5; g.beginPath(); g.arc(wx, wy, wr, 0, 6.29); g.stroke();
    g.lineWidth = 2; g.beginPath();
    for (let k = 0; k < 8; k++) { const a = rot + (k * Math.PI) / 4; g.moveTo(wx, wy); g.lineTo(wx + Math.cos(a) * wr, wy + Math.sin(a) * wr); }
    g.stroke();
    g.fillStyle = '#6B4A2A'; g.save(); g.translate(wx, wy); g.rotate(Math.atan2(H * 0.06 - wy, W / 2 - wx)); g.fillRect(0, -5, Math.hypot(W / 2 - wx, H * 0.06 - wy), 10); g.restore();
    const px = W / 2, py = H * 0.06;
    g.fillStyle = '#4A3320'; g.beginPath(); g.arc(px, py, 9, 0, 6.29); g.fill();
    let sx = X(M.u), sy = H * 0.3;
    if (M.phase === 'intro') sy = H * 0.3 - (1 - Math.min(1, M.pt / 0.6)) * H * 0.25;
    if (M.phase === 'drop') { const k = Math.min(1, M.pt / 0.35); sx = X(M.land); sy = H * 0.3 + (courseY - H * 0.3) * k * k; }
    if (M.phase === 'settle' || M.done) { const p = M.placed[M.placed.length - 1]; const k = Math.min(1, M.pt / 0.45); sx = X(p.from + (p.u - p.from) * k); sy = courseY; }
    if (M.phase !== 'settle' && !M.done) {
      g.strokeStyle = '#3A2A18'; g.lineWidth = 2; g.beginPath(); g.moveTo(px, py); g.lineTo(sx, sy); g.stroke();
      stone(sx - (tg.w * s) / 2, sy, tg.w * s, '#EADBB5', '#6B5A3A');
      if (M.phase === 'swing') {                                                // faint guides from the stone's edges down to the course
        g.strokeStyle = 'rgba(58,42,24,.25)'; g.lineWidth = 1; g.setLineDash([3, 4]);
        for (const e of [-1, 1]) { const x = sx + (e * tg.w * s) / 2; g.beginPath(); g.moveTo(x, sy + h); g.lineTo(x, courseY); g.stroke(); }
        g.setLineDash([]);
      }
    }
    g.restore();
    g.fillStyle = '#1C140A'; g.font = '700 14px Heebo, system-ui, sans-serif'; g.textAlign = 'right'; g.direction = 'rtl';
    g.fillText(`אבן ${Math.min(M.i + 1, M.n)} מתוך ${M.n}`, W - 10, H - 10);
  },
};
// ── crafta19 ── the key stone ON THE CRANE in the world under two thumbs (FUN19 §2, binding; RESEARCH19's B2, approved): the stone hangs
// on the site's crane over its slot. HOLD the work button = lower (the brake lets go: slow, then faster the longer it is held); RELEASE
// = the brake holds it; a small left/right DRAG aligns it along the course. Its shadow shrinks onto the slot as it nears (the
// anticipation). It lands when it reaches the bed — the landing is the act: off by ≤ 5 % of the slot 40, ≤ 12 % 20, else 10 (the crew
// nudges it true); a soft landing (it came down slowly — hold, let go, hold again near the bed) +20. Then a click, a thud and the crew's
// "הופ!". A tap lowers it a step and the crew aligns it a little (≤ good). L2+: the stone sways on its rope (land it as it swings over);
// the great stone and the lintel are heavier (slower) — המחשה.
import { act as caAct, bonus as caBonus, actsQ as caQ } from './acts.js';
const KS_V = 0.62, KS_SOFT = 0.42;   // the lowering's top speed (of the hang, a second), a soft landing's
function liftModel({ level = 0, rng = Math.random, setup = {} } = {}) {
  const L = clamp(level | 0, 0, 2), heavy = setup.what === 'great' || setup.what === 'lintel', v0 = heavy ? 0.75 : 1;
  const M = {
    kind: 'crane', juice: true, twinOnly: true, holds: true, level: L, what: setup.what || 'first', n: 1, i: 0,
    phase: 'lower', t: 0, pt: 0, y: 1, vy: 0, ox: (rng() < 0.5 ? -1 : 1) * (0.35 + 0.25 * rng()), ox0: 0, x0: 0, sw: 0, held: false, holdT: 0, tapped: false, soft: false, err: 0,
    fx: [], acts: [], pts: 0, done: false, progress: 0, h: 0, tol: 0.05,
    coach: "החזיקו את 'עבודה' — האבן יורדת; גררו ימינה ושמאלה ליישר. הצל נח על המקום — שם היא נוחתת",
    mark() { return 0; },
    /** where it would land now (the sway counts): the offset along the course, in slot widths */
    off() { return this.ox + this.sw; },
    touch(down) { if (this.phase !== 'lower') return; this.held = !!down; if (down) this.holdT = 0; },
    step(dt) {
      if (this.done) return;
      this.t += dt; this.pt += dt;
      if (this.phase === 'set') { if (this.pt > 1.1) { this.done = true; this.phase = 'done'; this.progress = 1; } return; }
      if (this.phase !== 'lower') return;
      if (this.held) { this.holdT += dt; this.vy = Math.min(KS_V * v0, (0.12 + this.holdT * 0.9) * v0); }
      else { this.vy = Math.max(0, this.vy - dt * 3.2); if (this.vy === 0 && this.y < 1) this.restY = Math.min(this.restY == null ? 1 : this.restY, this.y); }   // (the brake holds it: it never falls; where it last stood still)
      if (this.autoT > 0) { this.autoT -= dt; this.vy = Math.max(this.vy, 0.32 * v0); this.ox *= Math.exp(-dt * 2.2); if (this.autoT <= 0 && !this.held) this.vy = 0; }
      this.y = Math.max(0, this.y - this.vy * dt);
      this.sw = L >= 1 ? 0.22 * (L === 2 ? 1.3 : 1) * Math.sin(this.t * 2.1) * Math.min(1, this.y * 3 + 0.2) : 0;
      this.h = 1 - this.y;
      if (this.y <= 0) this.land();
    },
    land() {
      if (this.phase !== 'lower') return;
      const e = Math.abs(this.off()), q = e <= 0.05 ? 2 : e <= 0.12 ? 1 : 0;
      // (soft: it came down slowly, or he stopped it near the bed and let it down the last stretch)
      this.err = e; this.soft = this.vy <= KS_SOFT * v0 || (this.restY != null && this.restY <= 0.35 && !this.tapped); this.phase = 'set'; this.pt = 0; this.held = false;
      caAct(this, q, { tap: this.tapped, power: 1 - e, x: 0.5, y: 0.3, say: 'הופ!' });
      if (this.soft) caBonus(this, 20, 'נחיתה רכה');
      this.fx.push({ sfx: 'settle', haptic: [14, 40, 18] }, { sfx: 'thud' });
      this.ox = q < 2 ? this.ox : this.ox; this.landV = this.vy; this.vy = 0;
    },
    drag(x, y, ph) {
      if (this.phase !== 'lower') return;
      if (ph === 'down') { this.ox0 = this.ox; this.x0 = x; return; }
      if (ph === 'move') { this.ox = clamp(this.ox0 + (x - this.x0) * 160 / 160, -1.2, 1.2); return; }
    },
    twinTap() { if (this.phase !== 'lower') return; this.tapped = true; this.autoT = 0.75; },
    tap() { this.twinTap(); },
    cue() { return null; },
    auto() { return null; },
    result() { const q = caQ(this, 0.8); return { quality: q, perfect: q >= 0.97 && this.acts.length > 0, score: this.pts | 0, stones: this.phase === 'done' || this.phase === 'set' ? 1 : 0, soft: this.soft, err: this.err }; },
  };
  return M;
}
crane.world = { kind: 'crane', model: liftModel, twinOnly: true, hint: "החזיקו — האבן יורדת; גררו ליישר", howto: 'החזקה מורידה את האבן, גרירה מיישרת אותה מעל מקומה', fact: crane.fact };
// ── /crafta19 ──
