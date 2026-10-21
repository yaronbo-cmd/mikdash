/* רפסודות הארזים (the cedar rafts) — GAMES14, wave 14: her ❤️ (VOTES14), a 2D steering game, no new 3D scene.
 * The cedars float down the coast from the Lebanon to Jaffa, tied as a raft. Drag left and right: the raft follows the
 * finger — round the rocks, into the gold current (it speeds the raft). A rock only bumps it (it slows; nothing is lost).
 * Facing the way she sails (south), the shore is on her left. The route: המחשה.
 * Levels (FUN14's 0–2): L1 few rocks · L2 more, closer · L3 a cross-swell that pushes the raft toward the shore.
 * q = .6 clear of rocks + .2 the current + .2 par. The autopilot steers to the safest lane ahead. */
import { clamp } from './frame.js';

const FACT = { he: 'בימי שיבת ציון הביאו "עֲצֵי אֲרָזִים מִן־הַלְּבָנוֹן אֶל־יָם יָפוֹא"; ובימי שלמה כתוב: "ונביאם לך רפסדות על ים יפו". הדרך בים כאן — המחשה.', ref: 'עזרא ג, ז; דברי הימים ב ב, טו', status: 'draft', illus: true };
const SHORE = 0.14, RY = 0.78, LEN = 7;                  // the shore's edge · the raft's row · the trip, in screens

function model({ level = 0, rng = Math.random } = {}) {
  const L = clamp(+level || 0, 0, 2);
  const speed = 0.3, gap = 0.55 - 0.1 * L, rocks = [], cur = [], path = [];
  for (let y = 0, px = 0.55; y <= LEN + 1.5; y += 0.5) { path.push(px); px = clamp(px + (rng() - 0.5) * 0.44, SHORE + 0.12, 0.85); }   // the open channel (always there)
  const pathAt = (y) => { const i = clamp(y / 0.5, 0, path.length - 1.001), i0 = Math.floor(i), f = i - i0, e = f * f * (3 - 2 * f); return path[i0] + (path[i0 + 1] - path[i0]) * e; };
  const put = (x, y, r) => { if (Math.abs(x - pathAt(y)) > r + 0.17 && x > SHORE + 0.06 && x < 0.95) rocks.push({ x, y, r, hit: false }); };
  for (let y = 1.3; y < LEN - 0.4; y += gap * (0.75 + rng() * 0.5)) {   // rocks along the way, off the channel (a calm start)
    const r = 0.05 + rng() * 0.03 + 0.01 * L;
    for (let k = 0; k < 6; k++) { const x = SHORE + 0.08 + rng() * (0.86 - SHORE - 0.08), n = rocks.length; put(x, y, r); if (rocks.length > n) { if (L >= 1 && rng() < 0.35 * L) put(clamp(x + (x > 0.55 ? -0.36 : 0.36), SHORE + 0.06, 0.92), y + 0.12, 0.045); break; } }
  }
  for (let y = 1.4; y < LEN - 0.5; y += 1.3 + rng() * 0.5) cur.push({ x: pathAt(y + 0.22), y, len: 0.45, got: false });   // the gold current runs in the channel
  const parT = LEN / (speed * 1.08) + 1;
  const M = {
    kind: 'rafts', level: L, rocks, cur, pathAt, d: 0, x: 0.55, tx: 0.55, vx: 0, boost: 0, slow: 0, t: 0, hits: 0, caught: 0, phase: 'sail', pt: 0,
    done: false, progress: 0, fx: [], quiet: 0, swell: 0, held: false, LEN,
    drag(x, y, ph) {
      if (this.done || this.phase !== 'sail') return;
      if (ph === 'down' || ph === 'move') { this.tx = clamp(x, SHORE + 0.05, 0.95); this.held = true; this.quiet = 0; }
      else this.held = false;
    },
    tap(x = 0.5) { if (this.phase === 'sail') { this.tx = clamp(x, SHORE + 0.05, 0.95); this.quiet = 0; } },
    step(dt) {
      if (this.done) return;
      this.t += dt; this.pt += dt; if (!this.held) this.quiet += dt;   // (v27: a finger that holds the raft still is not an idle hand — the raftsmen never take over under it)
      if (this.hold) return;                                // under the first-time how-to the raft waits at the start
      if (this.phase === 'port') { if (this.pt > 1.4) { this.done = true; this.phase = 'done'; } return; }
      if (L >= 1.5) { this.swell = Math.sin(this.t * 0.9) * 0.07; this.tx = clamp(this.tx - Math.max(0, this.swell) * dt, SHORE + 0.05, 0.95); }   // the cross-swell sets toward the shore
      this.vx += ((this.tx - this.x) * 24 - this.vx * 8) * dt; this.x = clamp(this.x + this.vx * dt, SHORE + 0.04, 0.96);
      const v = speed * (this.slow > 0 ? 0.45 : 1) * (this.boost > 0 ? 1.6 : 1);
      this.slow = Math.max(0, this.slow - dt); this.boost = Math.max(0, this.boost - dt);
      this.d += v * dt; this.progress = Math.floor((this.d / LEN) * 40);
      for (const k of rocks) {
        if (k.hit) continue;
        const dy = k.y - (this.d + (1 - RY)), dx = k.x - this.x;                       // the rock's place relative to the raft
        if (Math.abs(dy) < k.r + 0.05 && Math.abs(dx) < k.r + 0.07) {
          k.hit = true; this.hits++; this.slow = 1; this.vx += (dx > 0 ? -1 : 1) * 0.8;
          this.fx.push({ sfx: 'thud', shake: 0.5, haptic: [25, 30, 25], pop: { t: 'בום! עקוף את הסלעים', x: this.x, y: RY - 0.12, kind: 'bad' } });
        }
      }
      for (const c of cur) {
        if (c.got) continue;
        const dy = this.d + (1 - RY) - c.y;
        if (dy > 0 && dy < c.len && Math.abs(c.x - this.x) < 0.08) { c.got = true; this.caught++; this.boost = 1.4; this.fx.push({ sfx: 'chime', o: { combo: this.caught + 1 }, pop: { t: 'זרם טוב!', x: this.x, y: RY - 0.15, kind: 'good' } }); }
      }
      if (this.d >= LEN) { this.phase = 'port'; this.pt = 0; this.fx.push({ sfx: 'arrive', haptic: [15, 40, 15], pop: { t: 'הגענו ליפו!', x: 0.55, y: 0.35, kind: 'big' } }); }
      if (!this.patient && !this.hold && this.quiet > 3) { this.slow = 0.2; const a = this.safe(); this.tx = a; this.crew = 1; }   // a test's idle hand: the raftsmen steer, slowly
    },
    safe() {                                              // the clearest lane ahead (a near rock rules; never cut across one; a current if it is near)
      const here = this.d + (1 - RY), lo = Math.min, hi = Math.max;
      let best = this.x, bs = -1e9;
      for (let x = SHORE + 0.08; x <= 0.92; x += 0.02) {
        let sc = -Math.abs(x - this.x) * 2 - Math.abs(x - pathAt(here + 0.3)) * 4;
        for (const k of rocks) {
          const dy = k.y - here; if (k.hit || dy < -0.06 || dy > 0.9) continue;
          const w = k.r + 0.11;
          if (Math.abs(k.x - x) < w) sc -= 40 * (1.2 - dy);
          if (dy < 0.3 && hi(x, this.x) > k.x - w && lo(x, this.x) < k.x + w) sc -= 30;
        }
        for (const c of cur) { const dy = c.y - here; if (!c.got && dy > 0 && dy < 0.6 && Math.abs(c.x - x) < 0.05) sc += 3; }
        if (sc > bs) { bs = sc; best = x; }
      }
      return best;
    },
    cue() {
      if (this.phase !== 'sail') return null;
      const s = this.safe();
      // (v27: under the how-to the hand slides the raft sideways — a first-time player sees the gesture at once; jobs-touch reads it)
      if (this.hold) { const far = Math.abs(s - this.x) >= 0.08 ? s : clamp(this.x + (this.x < 0.6 ? 0.2 : -0.2), SHORE + 0.05, 0.95); return { x: this.x, y: RY, x2: far, y2: RY }; }
      // (the lane is clear: the hand rests on the raft — a touch there keeps the raftsmen from taking over)
      return Math.abs(s - this.tx) < 0.06 ? { x: this.x, y: RY } : { x: this.x, y: RY, x2: s, y2: RY };
    },
    auto() {
      if (this.phase !== 'sail') return this.held ? { x: this.tx, y: RY, p: 'up', id: 1 } : null;
      const s = this.safe();
      if (!this.held) return { x: this.x, y: RY, p: 'down', id: 1 };
      return { x: this.tx + clamp(s - this.tx, -0.03, 0.03), y: RY, p: 'move', id: 1 };
    },
    result() {
      const max = Math.max(3, Math.round(rocks.length * 0.4)), par = clamp(1 - (this.t - parT) / parT);
      const quality = clamp(0.6 * clamp(1 - this.hits / max) * (this.crew ? 0.3 : 1) + 0.2 * (cur.length ? this.caught / cur.length : 1) + 0.2 * par);
      return { quality, perfect: !this.hits && this.caught === cur.length, score: Math.round(quality * 300), hits: this.hits, caught: this.caught, currents: cur.length, rocks: rocks.length };
    },
  };
  return M;
}

function draw(g, M, W, H) {
  const sea = g.createLinearGradient(0, 0, 0, H); sea.addColorStop(0, '#2F6E9A'); sea.addColorStop(1, '#3E8AB8'); g.fillStyle = sea; g.fillRect(0, 0, W, H);
  const yOf = (wy) => H * (RY - (wy - (M.d + (1 - RY)))) ;                          // a world height → the screen (the sea runs down past the raft)
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2;                         // the swell's lines
  g.beginPath(); for (let k = 0; k < 9; k++) { const y = ((k / 9 + M.d * 0.9) % 1) * H; g.moveTo(SHORE * W, y); for (let x = SHORE * W; x <= W; x += 28) g.lineTo(x, y + Math.sin(x * 0.05 + k) * 4); } g.stroke();
  g.fillStyle = '#E3CF9B'; g.beginPath(); g.moveTo(0, 0);                            // the shore on her left, with a wavy edge
  for (let y = 0; y <= H + 30; y += 30) g.lineTo(W * (SHORE + 0.015 * Math.sin((y / H + M.d) * 9)), y);
  g.lineTo(0, H); g.fill();
  g.fillStyle = 'rgba(70,120,60,.8)'; for (let k = 0; k < 4; k++) { const y = ((k * 0.27 + M.d) % 1.1) * H; g.beginPath(); g.arc(W * 0.05, y, 7, 0, 6.2832); g.fill(); }
  for (const c of M.cur) {                                                           // the gold current: chevrons pointing the way
    const y0 = yOf(c.y), y1 = yOf(c.y + c.len); if (y0 < -20 || y1 > H + 20) continue;
    g.strokeStyle = c.got ? 'rgba(255,214,110,.3)' : '#FFD66E'; g.lineWidth = 3;
    g.beginPath(); for (let y = y1; y < y0; y += 16) { g.moveTo(c.x * W - 9, y + 8); g.lineTo(c.x * W, y); g.lineTo(c.x * W + 9, y + 8); } g.stroke();
  }
  for (const k of M.rocks) {                                                         // the rocks, with foam
    const y = yOf(k.y); if (y < -40 || y > H + 40) continue;
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(k.x * W, y, k.r * W * 1.35, k.r * W * 1.0, 0, 0, 6.2832); g.fill();
    g.fillStyle = k.hit ? '#7B6F62' : '#5E5348'; g.beginPath(); g.ellipse(k.x * W, y, k.r * W, k.r * W * 0.75, 0.4, 0, 6.2832); g.fill();
  }
  if (M.phase === 'port' || M.d > M.LEN - 1) {                                       // Jaffa's harbour, at the end
    const y = yOf(M.LEN + (1 - RY) + 0.12);
    g.fillStyle = '#C9B48A'; g.fillRect(0, y - H * 0.18, W, H * 0.18);
    g.fillStyle = '#A8916A'; for (let k = 0; k < 5; k++) g.fillRect(W * (0.2 + k * 0.15), y - H * 0.3, W * 0.1, H * 0.14);
    g.fillStyle = '#1C140A'; g.font = '800 18px Heebo, system-ui, sans-serif'; g.textAlign = 'center'; g.direction = 'rtl'; g.fillText('יפו', W * 0.55, y - H * 0.2);
  }
  const rx = M.x * W, ry = RY * H, lw = W * 0.05, sw = M.slow > 0 ? Math.sin(M.t * 40) * 3 : 0;   // the raft: five cedar logs, roped
  g.save(); g.translate(rx + sw, ry); g.rotate(clamp(M.vx * 0.3, -0.35, 0.35));
  for (let k = -2; k <= 2; k++) { g.fillStyle = k % 2 ? '#9C5B3B' : '#A9683F'; g.fillRect(k * lw - lw / 2, -H * 0.09, lw - 2, H * 0.18); g.fillStyle = '#C98A5A'; g.beginPath(); g.ellipse(k * lw - 1, -H * 0.09, lw / 2 - 1, 3, 0, 0, 6.2832); g.fill(); }
  g.strokeStyle = '#E8D7A8'; g.lineWidth = 2; for (const y of [-0.05, 0.05]) { g.beginPath(); g.moveTo(-2.5 * lw, y * H); g.lineTo(2.5 * lw, y * H); g.stroke(); }
  g.fillStyle = '#3A6E9A'; g.fillRect(-4, -H * 0.03, 8, H * 0.05); g.fillStyle = '#D9A77B'; g.beginPath(); g.arc(0, -H * 0.04, 5, 0, 6.2832); g.fill();   // a raftsman with his pole
  g.strokeStyle = '#6E4A2A'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-3, -H * 0.02); g.lineTo(-lw * 1.8, H * 0.07); g.stroke();
  g.restore();
  if (M.boost > 0) { g.fillStyle = 'rgba(255,214,110,.5)'; for (let k = 0; k < 4; k++) g.fillRect(rx - 12 + k * 8, ry + H * 0.1 + ((M.t * 200 + k * 9) % 20), 3, 8); }
  const px = W - 18, top = H * 0.08, bot = H * 0.92, p = clamp(M.d / M.LEN);          // the route: from the Lebanon (below) to Jaffa (above)
  g.strokeStyle = 'rgba(255,246,218,.75)'; g.lineWidth = 3; g.beginPath(); g.moveTo(px, bot); g.lineTo(px, top); g.stroke();
  g.font = '700 11px Heebo, system-ui, sans-serif'; g.textAlign = 'right'; g.direction = 'rtl';
  for (const [f, name] of [[0, 'הלבנון'], [0.4, 'צור'], [0.7, 'דור'], [1, 'יפו']]) { const y = bot - (bot - top) * f; g.fillStyle = '#FFF6DA'; g.beginPath(); g.arc(px, y, 3.5, 0, 6.2832); g.fill(); g.fillStyle = 'rgba(28,20,10,.65)'; g.fillRect(px - 52, y - 8, 44, 15); g.fillStyle = '#FFF6DA'; g.fillText(name, px - 10, y + 4); }
  g.fillStyle = '#FFD66E'; g.beginPath(); g.arc(px, bot - (bot - top) * p, 7, 0, 6.2832); g.fill();
}

export const rafts = {
  kind: 'rafts', topic: 'cedar', n: 'רפסודות הארזים', kicker: 'מן הלבנון ליפו', step: 'craft', secs: [20, 30], fact: FACT, guide: 8, model, draw,
  hint: 'גרור ימינה ושמאלה: הרפסודה הולכת אחרי האצבע — עקוף סלעים, היכנס לזרם הזהוב',
  howto: 'גרור את הרפסודה ימינה ושמאלה — עקוף את הסלעים ותפוס את הזרם הזהוב, עד יפו',
};
