/* ── econ14 ── pipes.js "אמת המים" (ECON14, wave 14; claimed on the bus 12:45): turn the channel stones until the water runs from
 * the spring to the Temple. A tap turns a stone a quarter; the water runs as far as the channel holds, and on to the Temple when it
 * is whole. L1 4×4 · L2 5×5 · L3 6×6 (opts.level 0–2). The generator lays one channel (a random walk, seeded) and is its own
 * solver: par = the fewest quarter-turns; q = 1 at par, less for each turn beyond it (no clock). The route is המחשה; the facts are
 * יומא לא, א ("עין עיטם גבוה מקרקע עזרה עשרים ושלש אמות") and שקלים ד, ב (the aqueduct paid from the chamber's funds). */
const N_ = 1, E_ = 2, S_ = 4, W_ = 8;
const DIRS = [[N_, 0, -1, S_], [E_, 1, 0, W_], [S_, 0, 1, N_], [W_, -1, 0, E_]];   // bit, dx, dy, the opposite bit
const rot = (m, r) => { for (let k = 0; k < (r & 3); k++) m = ((m << 1) | (m >> 3)) & 15; return m; };   // clockwise quarter turns
const PIECES = [N_ | S_, N_ | E_, N_ | E_ | S_];   // a straight stone, a corner stone, a tee (the decoys)

export const pipes = {
  kind: 'pipes', topic: 'har', n: 'אמת המים', kicker: 'מעין עיטם אל המקדש', step: 'aqueduct', secs: [15, 30], tall: 0.56,
  hint: 'הקש על אבן כדי לסובב אותה, עד שהמים זורמים אל המקדש',
  howto: 'הקש על אבן התעלה כדי לסובב אותה: חבר את המעיין שלמטה אל המקדש שלמעלה', guide: 1,
  fact: { he: 'אביי אמר: "עין עיטם גבוה מקרקע עזרה עשרים ושלש אמות". ואמת המים נבנתה מכספי המקדש: "ואמת המים... באין משירי הלשכה".', ref: 'בבלי יומא לא, א; משנה שקלים ד, ב · מסלול האמה במשחק: המחשה', status: 'draft', illus: true },

  model({ level = 0, rng = Math.random, setup = {} } = {}) {
    const n = 4 + Math.max(0, Math.min(2, level | 0)), at = (x, y) => y * n + x;
    // the channel: a random self-avoiding walk from the spring (the bottom row) to the Temple (the top row)
    const sx = Math.floor(rng() * n), tx = Math.floor(rng() * n);
    const up = [0.6, 0.3, 0.1][n - 4];
    let path = null;
    for (let tries = 0; tries < 200 && !path; tries++) {
      const seen = new Set([at(sx, n - 1)]), p = [[sx, n - 1]];
      const walk = () => {
        const [x, y] = p[p.length - 1];
        if (y === 0 && x === tx) return true;
        const opts = DIRS.map((d, i) => i).filter((i) => { const nx = x + DIRS[i][1], ny = y + DIRS[i][2]; return nx >= 0 && nx < n && ny >= 0 && ny < n && !seen.has(at(nx, ny)); });
        for (let k = opts.length - 1; k > 0; k--) { const j = Math.floor(rng() * (k + 1)); [opts[k], opts[j]] = [opts[j], opts[k]]; }
        opts.sort((a, b) => (a === 0 ? -up : 0) - (b === 0 ? -up : 0) + (rng() - 0.5));   // (up is likelier: a channel, not a maze; less so by level)
        for (const i of opts) {
          const nx = x + DIRS[i][1], ny = y + DIRS[i][2];
          seen.add(at(nx, ny)); p.push([nx, ny]);
          if (p.length <= n * n * 0.7 && walk()) return true;
          p.pop(); seen.delete(at(nx, ny));
        }
        return false;
      };
      if (walk() && p.length >= n + 1) path = p;
    }
    if (!path) path = Array.from({ length: n }, (_, k) => [sx, n - 1 - k]);   // (never: a straight run)
    const cells = Array.from({ length: n * n }, () => ({ m: PIECES[Math.floor(rng() * 3)], r: 0, need: -1, wet: 0 }));
    let par = 0;
    path.forEach(([x, y], k) => {
      const dirTo = (a, b) => DIRS.findIndex((d) => a[0] + d[1] === b[0] && a[1] + d[2] === b[1]);
      const inB = k === 0 ? S_ : DIRS[dirTo(path[k], path[k - 1])][0], outB = k === path.length - 1 ? N_ : DIRS[dirTo(path[k], path[k + 1])][0];
      const want = inB | outB, straight = want === (N_ | S_) || want === (E_ | W_), base = straight ? N_ | S_ : N_ | E_;
      const okR = [0, 1, 2, 3].filter((r) => rot(base, r) === want);
      const c = cells[at(x, y)]; c.m = base; c.ok = okR; c.need = okR[0];
      const bad = [0, 1, 2, 3].filter((r) => !okR.includes(r)); c.r = bad[Math.floor(rng() * bad.length)];   // scrambled: never already right
      par += Math.min(...okR.map((r) => (r - c.r + 4) & 3));
    });
    for (const c of cells) if (c.need < 0) c.r = Math.floor(rng() * 4);
    const M = {
      n, cells, path, sx, tx, par, taps: 0, done: false, progress: 0, fx: [], flowT: 0, reach: 0,
      mask(x, y) { const c = cells[at(x, y)]; return rot(c.m, c.r); },
      /** the water from the spring: every stone it reaches (wet), and whether it reaches the Temple */
      flow() {
        for (const c of cells) c.wet = 0;
        if (!(this.mask(sx, n - 1) & S_)) return false;
        const q = [[sx, n - 1]]; cells[at(sx, n - 1)].wet = 1;
        let ok = false;
        while (q.length) {
          const [x, y] = q.shift(), m = this.mask(x, y);
          if (y === 0 && x === tx && (m & N_)) ok = true;
          for (const [b, dx, dy, ob] of DIRS) {
            const nx = x + dx, ny = y + dy;
            if (!(m & b) || nx < 0 || nx >= n || ny < 0 || ny >= n) continue;
            const c = cells[at(nx, ny)]; if (c.wet || !(this.mask(nx, ny) & ob)) continue;
            c.wet = 1; q.push([nx, ny]);
          }
        }
        this.reach = cells.filter((c) => c.wet).length;
        return ok;
      },
      tap(fx, fy) {
        if (this.done) return;
        const x = Math.floor(fx * n), y = Math.floor(((fy - 0.1) / 0.8) * n);
        if (x < 0 || x >= n || y < 0 || y >= n) { this.fx.push({ hint: pipes.hint, sfx: 'ui' }); return; }
        const c = cells[at(x, y)]; c.r = (c.r + 1) & 3; this.taps++;
        const before = this.reach, whole = this.flow();
        this.progress = path.filter(([px, py]) => { const k = cells[at(px, py)]; return k.ok.includes(k.r); }).length;
        this.fx.push({ sfx: 'grind', haptic: 6 });
        if (this.reach > before) this.fx.push({ sfx: 'drip' });
        if (whole) { this.done = true; this.fx.push({ sfx: 'pour' }, { sfx: 'chime', o: { combo: 6 } }, { pop: { t: 'המים זורמים!', x: 0.5, y: 0.06, kind: 'good' } }); }
      },
      step(dt) { this.flowT += dt; },
      /** the hand: the first stone of the channel that is not yet turned right */
      cue() { const p = path.find(([x, y]) => { const c = cells[at(x, y)]; return !c.ok.includes(c.r); }); return p ? { x: (p[0] + 0.5) / n, y: 0.1 + ((p[1] + 0.5) / n) * 0.8 } : null; },
      auto() { if (this.flowT < 0.25) return false; this.flowT = 0; const c = this.cue(); if (c) this.tap(c.x, c.y); return false; },
      result() {
        const extra = Math.max(0, this.taps - par), quality = this.done ? Math.max(0.3, Math.min(1, 1 - (0.5 * extra) / Math.max(4, par))) : (0.4 * this.progress) / path.length;
        return { quality, perfect: this.done && extra === 0, score: Math.round(quality * 200) + (this.done ? 50 : 0), taps: this.taps, par };
      },
    };
    M.flow();
    return M;
  },

  draw(g, M, W, H) {
    const n = M.n, top = H * 0.1, cw = W / n, ch = (H * 0.8) / n, cs = Math.min(cw, ch), ox = 0, t = M.flowT;   // (the model's tap box: x 0…1, y .1….9)
    g.fillStyle = '#6E5A3C'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#8FA8C8'; g.fillRect((M.tx + 0.2) * cw, 0, cw * 0.6, top);                 // the Temple's end: a gate
    g.fillStyle = '#E9DDC0'; g.fillRect((M.tx + 0.15) * cw, 0, cw * 0.7, top * 0.55);
    g.fillStyle = '#3F8ED8'; g.beginPath(); g.ellipse((M.sx + 0.5) * cw, H * 0.95, cw * 0.42, H * 0.04, 0, 0, 6.29); g.fill();   // the spring
    // (batched: one path for the stones, one for their joints, one for the grooves, one for the water — ~6 canvas calls a frame, not
    //  ~360: under SwiftShader every touch waits on the frame; GAMES14's gold, 13:00)
    const rects = (inset) => { g.beginPath(); for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) g.rect(ox + x * cw + inset, top + y * ch + inset, cw - 2 * inset, ch - 2 * inset); };
    g.fillStyle = '#D9CBA6'; rects(2); g.fill();
    g.strokeStyle = 'rgba(80,60,30,.45)'; g.lineWidth = 1; rects(2.5); g.stroke();
    const grooves = (wet) => {
      g.beginPath();
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        if (wet && !M.cells[y * n + x].wet) continue;
        const m = M.mask(x, y), cx = ox + x * cw + cw / 2, cy = top + y * ch + ch / 2;
        for (const [b, dx, dy] of DIRS) if (m & b) { g.moveTo(cx, cy); g.lineTo(cx + dx * cw / 2, cy + dy * ch / 2); }
      }
    };
    g.lineCap = 'round';
    g.strokeStyle = '#7A6440'; g.lineWidth = cs * 0.3; grooves(false); g.stroke();
    g.strokeStyle = `rgba(70,150,230,${(0.85 + 0.15 * Math.sin(t * 6)).toFixed(2)})`; g.lineWidth = cs * 0.18; grooves(true); g.stroke();
    g.font = '700 13px Heebo, system-ui, sans-serif'; g.direction = 'rtl'; g.fillStyle = '#FFF6DA';
    const side = (k) => (k < n / 2 ? 'left' : 'right'), lx = (k) => (k < n / 2 ? (k + 0.85) * cw : (k + 0.15) * cw);
    g.textAlign = side(M.tx); g.fillText('המקדש', lx(M.tx), top * 0.7);           // (beside the gate and the spring, never on them)
    g.textAlign = side(M.sx); g.fillText('עין עיטם', lx(M.sx), H * 0.965);
    if (M.done) { g.fillStyle = 'rgba(28,20,10,.75)'; g.fillRect(0, H * 0.44, W, H * 0.1); g.fillStyle = '#BFE3FF'; g.font = '800 20px Heebo, system-ui, sans-serif'; g.textAlign = 'center'; g.fillText('המים זורמים אל המקדש!', W / 2, H * 0.505); }
  },
};
/* ── /econ14 ── */
