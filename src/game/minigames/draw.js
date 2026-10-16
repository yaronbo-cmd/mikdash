/* ── econ14 ── draw.js (ECON14, wave 14): the draw pad, two skins on GAMES14's drag channel (frame.js M.drag).
 *   draw     ❤️ "חריטת אותיות" (her vote): trace the letters of "לבית התקיעה" on the parapet stone of the Mount's south-west corner,
 *            word by word, right to left; each letter is cut when the finger has passed along it. q = .7 coverage + .3 precision;
 *            the tolerance tightens by level. The stone keeps the inscription (SITE14: stages.jobReveal('letters', …)).
 *            Source: the stone found in 1968 below the corner (B. Mazar; the Israel Museum) and War 4.9.12 (582), as finds.json.
 *   drawMark ❤️ "האבן שלי" (אוצר המלאכה): she draws her own mark on a dressed stone; setup.out.strokes gets it in the stone's 0…1
 *            box (y down) for SITE14's stages.stoneMark(site, { strokes }). Any mark is a good mark: q 1.
 * Both: drag down / move / up (one finger draws; a second finger is ignored), tap() only hints. Nothing random, no timer. */
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
/* the square letters as strokes in an em box: x 0…1 left → right, y 0…1 top → baseline (lamed rises to −.42, qof falls to 1.42) */
const GLYPH = {
  'ל': [[[0.2, -0.42], [0.2, 0.14], [0.84, 0.14], [0.84, 0.6], [0.42, 1]]],
  'ב': [[[0.14, 0], [0.82, 0], [0.82, 1]], [[0.06, 1], [0.98, 1]]],
  'י': [[[0.3, 0], [0.7, 0], [0.7, 0.42]]],
  'ת': [[[0.08, 0], [0.9, 0], [0.9, 1]], [[0.3, 0], [0.3, 0.86], [0.12, 1]]],
  'ה': [[[0.08, 0], [0.9, 0], [0.9, 1]], [[0.22, 0.42], [0.22, 1]]],
  'ק': [[[0.1, 0], [0.9, 0], [0.9, 0.55]], [[0.22, 0.32], [0.22, 1.42]]],
  'ע': [[[0.14, 0], [0.56, 0.86]], [[0.86, 0], [0.56, 0.86], [0.08, 1]]],
};
const WORDS = [['ל', 'ב', 'י', 'ת'], ['ה', 'ת', 'ק', 'י', 'ע', 'ה']];
const TOL = [0.05, 0.04, 0.032];                         // (W units) how near the finger must pass, by level
const STONE = { x0: 0.1, x1: 0.9, y0: 0.12, y1: 0.88 };  // the stone's face in the canvas (0…1)
function stoneFace(g, W, H, lit) {
  const x0 = W * STONE.x0, y0 = H * STONE.y0, w = W * (STONE.x1 - STONE.x0), h = H * (STONE.y1 - STONE.y0);
  g.fillStyle = '#3A2C1A'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#B9A47C'; g.fillRect(x0 - 6, y0 - 6, w + 12, h + 12);           // the drafted margin
  g.fillStyle = lit ? '#E4D5B1' : '#D8C8A2'; g.fillRect(x0 + 6, y0 + 6, w - 12, h - 12);   // the boss, dressed smooth
  g.strokeStyle = 'rgba(90,70,40,.35)'; g.lineWidth = 1;
  for (let k = 1; k < 9; k++) { g.beginPath(); g.moveTo(x0 + 6, y0 + 6 + (h - 12) * k / 9); g.lineTo(x0 + w - 6, y0 + 6 + (h - 12) * k / 9 + 2); g.stroke(); }   // the comb's lines
}
function cut(g, pts, W, H, wpx, light) {                 // a chiselled line: the shadow, then the lit edge
  if (pts.length < 2) return;
  for (const [c, dx, lw] of [['rgba(40,26,10,.85)', 0, wpx], [light || 'rgba(255,240,200,.55)', -1.2, Math.max(1, wpx * 0.35)]]) {
    g.strokeStyle = c; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
    pts.forEach((p, i) => g[i ? 'lineTo' : 'moveTo'](p[0] * W + dx, p[1] * H + dx)); g.stroke();
  }
}

export const draw = {
  kind: 'draw', topic: 'har', n: 'חריטת אותיות', kicker: 'אבן פינת התקיעה', step: 'letters', secs: [15, 25], tall: 0.5,
  hint: 'העבר את האצבע לאורך האות הזוהרת, מימין לשמאל',
  howto: 'חרוט את "לבית התקיעה": העבר את האצבע לאורך האות הזוהרת', guide: 1,
  fact: { he: 'אבן מראש הפינה הדרומית־מערבית של הר הבית, ועליה חקוק "לבית התקיעה לה...". יוספוס מספר שכהן עמד שם ותקע בחצוצרה להודיע על כניסת השבת ועל צאתה.', ref: 'חפירות ב׳ מזר, 1968 (מוזיאון ישראל); יוספוס, מלחמת היהודים ד, ט, יב (582), בתרגום חופשי', status: 'draft', illus: false },

  model({ level = 0, setup = {} } = {}) {
    const lv = clamp(level | 0, 0, 2), tol = TOL[lv];
    const M = {
      level: lv, page: 0, A: 0.86, done: false, progress: 0, fx: [], ink: 0, on: 0, told: false, finger: null, last: null,
      letters: [], trail: [], ap: null,
      /** the page's layout for the canvas' aspect A = H / W (the draw sets it; headless: the normal sheet's .86) */
      layout(A = this.A) {
        this.A = A;
        const word = WORDS[this.page], n = word.length, em = Math.min(0.17, 0.78 / (n * 1.22)), gap = em * 0.22;
        const right = 0.5 + (n * em + (n - 1) * gap) / 2, yTop = A * 0.5 - em * 0.5;
        const old = this.letters;
        this.letters = word.map((ch, i) => {
          const x0 = right - (i + 1) * em - i * gap;
          const strokes = GLYPH[ch].map((s) => s.map(([u, v]) => [x0 + u * em, (yTop + v * em) / A]));
          const samples = [];
          for (const s of strokes) for (let k = 1; k < s.length; k++) {
            const [ax, ay] = s[k - 1], [bx, by] = s[k], L = Math.hypot(bx - ax, (by - ay) * A), m = Math.max(1, Math.ceil(L / (em * 0.14)));
            for (let j = k === 1 ? 0 : 1; j <= m; j++) samples.push({ x: ax + (bx - ax) * j / m, y: ay + (by - ay) * j / m, hit: false });
          }
          const prev = old[i] && old[i].ch === ch ? old[i] : null;
          if (prev) samples.forEach((p, k) => { p.hit = !!(prev.samples[k] && prev.samples[k].hit); });
          return { ch, strokes, samples, done: !!(prev && prev.done), em };
        });
        return this.letters;
      },
      cur() { return this.letters.find((l) => !l.done) || null; },
      cov(l) { return l.samples.filter((p) => p.hit).length / l.samples.length; },
      mark(x, y) {
        const A = this.A, l = this.cur(); if (!l) return;
        this.ink++;
        let near = false;
        for (const L of this.letters) for (const p of L.samples) { const d = Math.hypot(p.x - x, (p.y - y) * A); if (d < tol * 2) near = true; if (d < tol && L === l) p.hit = true; }
        if (near) this.on++;
        if (this.cov(l) >= 0.8) {
          l.done = true; this.progress++;
          this.fx.push({ sfx: 'chisel', o: { force: 0.8 }, haptic: 10, pop: { t: l.ch, x: l.samples[0].x, y: Math.max(0.08, l.samples[0].y - 0.12), kind: 'good' } });
          if (!this.cur()) {
            if (this.page + 1 < WORDS.length) { this.page++; this.trail.length = 0; this.layout(); this.fx.push({ sfx: 'tier', o: { n: 2 }, hint: 'עכשיו: "התקיעה"' }); this.finger = null; }
            else { this.done = true; this.fx.push({ sfx: 'pb' }); }
          }
        }
      },
      drag(x, y, phase, id) {
        if (this.done) return;
        if (phase === 'down') { if (this.finger != null && this.finger !== id) return; this.finger = id; this.trail.push([[x, y]]); this.mark(x, y); this.last = [x, y]; return; }
        if (id !== this.finger) return;
        if (phase === 'up' || phase === 'cancel') { this.finger = null; return; }
        const [lx, ly] = this.last || [x, y], d = Math.hypot(x - lx, (y - ly) * this.A), n = d > 0.12 ? 1 : Math.max(1, Math.ceil(d / (tol * 0.5)));
        for (let k = 1; k <= n; k++) this.mark(lx + (x - lx) * k / n, ly + (y - ly) * k / n);   // (a fast finger leaves no gaps; a jump is no stroke)
        const t = this.trail[this.trail.length - 1]; if (t && t.length < 400) t.push([x, y]);
        this.last = [x, y];
      },
      tap() { if (!this.told) { this.told = true; this.fx.push({ hint: 'לא מקישים: מעבירים את האצבע לאורך האות', sfx: 'ui' }); } },
      step() {},
      /** the hand swipes along the glowing letter's first stroke */
      cue() { const l = this.cur(); if (!l) return null; const s = l.strokes[0]; return { x: s[0][0], y: s[0][1], x2: s[s.length - 1][0], y2: s[s.length - 1][1] }; },
      /** the autopilot traces each stroke of the glowing letter, down → moves → up */
      auto() {
        const l = this.cur(); if (!l) return false;
        if (!this.ap || this.ap.l !== l) this.ap = { l, s: 0, k: 0, u: 0, down: false };
        const a = this.ap, s = l.strokes[a.s]; if (!s) { a.s = 0; return false; }
        if (!a.down) { a.down = true; return { x: s[0][0], y: s[0][1], p: 'down' }; }
        if (a.k >= s.length - 1) { a.down = false; a.s = (a.s + 1) % l.strokes.length; a.k = 0; a.u = 0; return { x: s[s.length - 1][0], y: s[s.length - 1][1], p: 'up' }; }
        a.u += 0.22; if (a.u >= 1) { a.u = 0; a.k++; }
        const [ax, ay] = s[a.k], [bx, by] = s[Math.min(a.k + 1, s.length - 1)];
        return { x: ax + (bx - ax) * a.u, y: ay + (by - ay) * a.u, p: 'move' };
      },
      result() {
        const all = [];
        for (let p = 0; p < WORDS.length; p++) all.push(...(p === this.page ? this.letters : p < this.page ? WORDS[p].map(() => ({ done: true })) : WORDS[p].map(() => ({ done: false, samples: [] }))));
        const cov = all.reduce((a, l) => a + (l.done ? 1 : l.samples && l.samples.length ? Math.min(1, this.cov(l) / 0.8) : 0), 0) / all.length;
        const prec = this.ink ? this.on / this.ink : 0;
        const quality = clamp(0.7 * cov + 0.3 * prec);
        return { quality, perfect: quality >= 0.9, score: Math.round(quality * 300) };
      },
    };
    M.layout();
    return M;
  },

  draw(g, M, W, H) {
    const A = H / W; if (Math.abs(A - M.A) > 0.01) M.layout(A);
    stoneFace(g, W, H, true);
    const t = (globalThis.performance ? performance.now() : 0) / 1000, cur = M.cur();
    for (const l of M.letters) {
      const w = Math.max(3, l.em * W * 0.13);
      if (l.done) { for (const s of l.strokes) cut(g, s, W, H, w); continue; }
      for (const s of l.strokes) {                          // the guide: faint; the glowing letter in gold, breathing
        g.strokeStyle = l === cur ? `rgba(255,${200 + 30 * Math.sin(t * 4) | 0},90,.95)` : 'rgba(110,85,50,.35)';
        g.lineWidth = l === cur ? w + 3 : w; g.lineCap = 'round'; g.lineJoin = 'round'; g.setLineDash(l === cur ? [] : [w * 0.6, w * 1.2]);
        g.beginPath(); s.forEach((p, i) => g[i ? 'lineTo' : 'moveTo'](p[0] * W, p[1] * H)); g.stroke(); g.setLineDash([]);
      }
      g.fillStyle = 'rgba(60,40,15,.9)'; g.beginPath();   // (one path for the cut so far: few canvas calls a frame)
      for (const p of l.samples) if (p.hit) { const r = Math.max(2, w * 0.45); g.moveTo(p.x * W + r, p.y * H); g.arc(p.x * W, p.y * H, r, 0, 6.29); }
      g.fill();
    }
    g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 3; g.beginPath();
    for (const tr of M.trail) tr.forEach((p, i) => g[i ? 'lineTo' : 'moveTo'](p[0] * W, p[1] * H));
    g.stroke();
    g.fillStyle = '#FFF6DA'; g.font = '700 14px Heebo, system-ui, sans-serif'; g.textAlign = 'right'; g.direction = 'rtl';
    const n = WORDS.reduce((a, w) => a + w.length, 0), d = WORDS.slice(0, M.page).reduce((a, w) => a + w.length, 0) + M.letters.filter((l) => l.done).length;
    g.fillText(`אות ${Math.min(n, d + 1)}/${n} · "לבית התקיעה"`, W - 10, H - 8);
  },
};

/* ❤️ האבן שלי: her mark, drawn freely; "✓ זה הסימן שלי" keeps it, "נקה" starts again */
export const drawMark = {
  kind: 'drawMark', topic: 'har', n: 'האבן שלי', kicker: 'אוצר המלאכה', step: 'mark', secs: [10, 30], tall: 0.5,
  hint: 'צייר באצבע סימן משלך על האבן', howto: 'צייר באצבע סימן משלך על האבן, ואז "זה הסימן שלי"', guide: 1,
  buttons: [{ id: 'done', label: '✓ זה הסימן שלי', cls: 'fx-ok' }, { id: 'clear', label: 'נקה', cls: 'fx-no' }],
  fact: { he: 'הבונים חרטו לפעמים סימנים על האבנים. האבן שלך תונח בנדבך, וכשתחזור לאתר תוכל למצוא אותה.', ref: 'המחשה', status: 'draft', illus: true },
  model({ setup = {} } = {}) {
    const M = {
      done: false, progress: 0, fx: [], strokes: [], finger: null, told: false, ap: 0,
      drag(x, y, phase, id) {
        if (this.done) return;
        if (phase === 'down') { if (this.finger != null && this.finger !== id) return; if (this.strokes.length >= 12) return; this.finger = id; this.strokes.push([[clamp(x), clamp(y)]]); this.fx.push({ sfx: 'chisel', o: { force: 0.3 } }); return; }
        if (id !== this.finger) return;
        if (phase === 'up' || phase === 'cancel') { this.finger = null; this.progress = this.strokes.length; return; }
        const s = this.strokes[this.strokes.length - 1], p = s[s.length - 1];
        if (s.length < 160 && Math.hypot(x - p[0], y - p[1]) > 0.008) s.push([clamp(x), clamp(y)]);
      },
      tap() { if (!this.told) { this.told = true; this.fx.push({ hint: 'מציירים: גוררים את האצבע על האבן', sfx: 'ui' }); } },
      press(id) {
        if (id === 'clear') { this.strokes.length = 0; this.progress = 0; this.fx.push({ sfx: 'brush', hint: drawMark.hint }); return; }
        if (id === 'done') {
          if (!this.strokes.some((s) => s.length >= 3)) { this.fx.push({ hint: 'קודם צייר סימן על האבן', sfx: 'ui' }); return; }
          this.done = true; this.fx.push({ sfx: 'pb' });
          if (setup.out) setup.out.strokes = this.box();
        }
      },
      /** the strokes in the stone's 0…1 box (y down), for stages.stoneMark */
      box() { return this.strokes.filter((s) => s.length >= 2).map((s) => s.map(([x, y]) => [+clamp((x - STONE.x0) / (STONE.x1 - STONE.x0)).toFixed(3), +clamp((y - STONE.y0) / (STONE.y1 - STONE.y0)).toFixed(3)])); },
      step() {},
      cue() { return this.strokes.length ? { btn: 'done', now: false, timed: false } : { x: 0.35, y: 0.4, x2: 0.65, y2: 0.6 }; },
      /** the autopilot draws a pomegranate (a circle and its crown), then keeps it */
      auto() {
        const k = this.ap++, N = 24;
        if (k === 0) return { x: 0.5 + 0.18, y: 0.55, p: 'down' };
        if (k <= N) { const a = (k / N) * 6.283; return { x: 0.5 + 0.18 * Math.cos(a), y: 0.55 + 0.2 * Math.sin(a), p: 'move' }; }
        if (k === N + 1) return { x: 0.68, y: 0.55, p: 'up' };
        if (k === N + 2) return { x: 0.42, y: 0.3, p: 'down' };
        if (k === N + 3) return { x: 0.5, y: 0.22, p: 'move' };
        if (k === N + 4) return { x: 0.58, y: 0.3, p: 'move' };
        if (k === N + 5) return { x: 0.58, y: 0.3, p: 'up' };
        return 'done';
      },
      result() { return { quality: 1, perfect: true, score: 100, strokes: this.box() }; },
    };
    return M;
  },
  draw(g, M, W, H) {
    stoneFace(g, W, H, false);
    for (const s of M.strokes) cut(g, s, W, H, 5, 'rgba(255,224,138,.9)');
    if (!M.strokes.length) { g.fillStyle = 'rgba(70,50,20,.55)'; g.font = '700 16px Heebo, system-ui, sans-serif'; g.textAlign = 'center'; g.direction = 'rtl'; g.fillText('כאן הסימן שלך', W / 2, H / 2); }
  },
};
/* ── /econ14 ── */
