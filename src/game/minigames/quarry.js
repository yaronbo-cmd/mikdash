/* המחצבה (the quarry): free a block from the bedrock — cut the channels around it with the pick, then drive the wedges
 * under it evenly until it splits off its bed.
 * Part 1 · three channel strokes: the pick's force rises and falls; tap at the top (the gold band) for a deep, clean cut.
 * Part 2 · the wedges: tap a wedge to drive it; keep the row even (always the lowest one) or the crack runs astray. The
 * wedges slacken while you wait, faster by level; a fast tap is queued, never lost. The period's quarry tools (picks and
 * wedges, Ramat Shlomo): bus/SOURCES.md §3.10 quarry_tools; the method drawn as a game is an illustration. */
import { clamp } from './frame.js';

export const quarry = {
  kind: 'quarry', topic: 'stone', n: 'המחצבה', kicker: 'חציבת גוש', step: 'quarry', secs: [12, 28],
  hint: 'הקש כשמד הכוח מגיע לפס הזהוב; אחר כך הקש תמיד על היתד הנמוכה',
  howto: 'הקש על המסך כשמד הכוח מגיע לפס הזהוב — חריץ עמוק', guide: 1,   // (wave 8B) the first-time how-to
  fact: { he: 'ברמת שלמה, כ־3 ק״מ צפונית להר הבית, נחשפה מחצבה מימי הבית השני ובה נחצבו גושים באורך של עד כ־8 מטרים — כמו האבנים הגדולות של הר הבית.', ref: 'רשות העתיקות (2007); רוזנפלד, אילני ואחרים, GSA 2014', status: 'draft', illus: false },

  model({ level = 0, rng, setup = {} } = {}) {
    // (wave 7) the curve: harder = a faster swing and a thinner gold band, not a longer game (L4 was 24–27 s at quality 1.0 until then)
    const cuts = 3, P = 1.25 - 0.09 * level, band = 0.13 - 0.02 * level;           // the pick's cycle (s) and its gold band
    // (wave 8B) level 0 is gentle: 3 blows a wedge, the wedges slacken slowly and only once the driving began
    const nW = 4 + (level >= 3 ? 1 : 0), slack = (level ? 0.035 : 0.018) * (1 + 0.3 * level), cap = 9 + 2 * nW;
    const inc = level ? 0.25 : 0.34, even = inc + 0.05;
    const M = {
      level, part: 'cut', phase: 'show', pt: 0, st: 0, f: 0, c: 0, qc: [], qw: [], d: new Array(nW).fill(0), nW, band,
      cool: 0, queued: -1, since: 9, wt: 0, crack: 0, spread: 0, helped: false, stuckAt: -9, done: false, progress: 0, fx: [],
      err: 0.02 + 0.03 * rng(), rest: 0.26 + 0.06 * rng(),
      force(t) { const s = Math.sin((Math.PI * t) / (this.c === 0 && level <= 1 ? P * 1.3 : P)); return s * s; },   // a slow first cut         // 0 → 1 → 0: the top of the swing is the sweet spot
      lowest() { let k = -1; for (let i = 0; i < nW; i++) if (this.d[i] < 1 && (k < 0 || this.d[i] < this.d[k])) k = i; return k; },
      step(dt) {
        if (this.done) return;
        this.pt += dt;
        if (this.part === 'cut') {
          if (this.phase === 'show' && this.pt > 0.4) { this.phase = 'swing'; this.pt = 0; this.st = 0; }
          if (this.phase === 'swing') { this.st += dt; this.f = this.force(this.st); if (this.st > 5 && !this.patient) this.cut(0.4, 'החוצבים העמיקו'); }
          else if (this.phase === 'result' && this.pt > 0.5) {
            this.c++; this.phase = 'show'; this.pt = 0;
            if (this.c >= cuts) { this.part = 'wedge'; this.fx.push({ howto: 'עכשיו היתדות: הקש על היתד שהיד מראה — תמיד על הנמוכה, שהסדק ילך ישר', guide: 4 }); }
          }
          return;
        }
        if (this.phase === 'show' && this.pt > 0.5) { this.phase = 'drive'; this.pt = 0; }
        else if (this.phase === 'drive') {
          this.wt += dt; this.since += dt; this.cool -= dt;
          if (this.qw.length) for (let i = 0; i < nW; i++) if (this.d[i] < 1) this.d[i] = Math.max(0, this.d[i] - slack * dt);
          if (this.cool <= 0 && this.queued >= 0) { const i = this.queued; this.queued = -1; this.strike(i); }
          this.crack = Math.min(...this.d);
          if (this.crack >= 1) this.split('נבקע!');
          else if (this.wt > cap && !this.patient) { this.helped = true; this.split('החוצבים השלימו'); }
        } else if (this.phase === 'split' && this.pt > 1.0) { this.done = true; this.phase = 'done'; }
      },
      cut(q, text) {
        this.qc.push(q); this.phase = 'result'; this.pt = 0; this.progress++;
        const perfect = q >= 1;
        this.fx.push({ sfx: 'hammer', o: { stone: 'bedrock', tool: 'pick', force: 0.4 + 0.6 * q }, haptic: perfect ? [10, 25, 10] : 12, shake: perfect ? 0.6 : 0.2, dust: { x: 0.5, y: 0.2, n: perfect ? 14 : 6 }, pop: { t: text, x: 0.5, y: 0.3, kind: perfect ? 'good' : q < 0.5 ? 'bad' : '' } });
        if (perfect) this.fx.push({ sfx: 'chime', o: { combo: this.qc.filter((k) => k >= 1).length } });
      },
      strike(i) {
        this.cool = 0.22; this.since = 0; this.progress++;
        if (this.d[i] >= 1) {                                           // already home: answered, never swallowed
          this.fx.push({ sfx: 'wedge', o: { n: i, dull: true }, haptic: 6 });
          if (this.wt - this.stuckAt > 1.5) { this.stuckAt = this.wt; this.fx.push({ pop: { t: 'היתד הזו כבר תקועה', x: (i + 0.5) / nW, y: 0.55, kind: '' } }); }
          return;
        }
        this.d[i] = Math.min(1, this.d[i] + inc);
        const s = Math.max(...this.d) - Math.min(...this.d);
        const q = s <= even ? 1 : clamp(1 - (s - even) * 2.2, 0.2, 0.95);
        this.qw.push(q); this.spread = s;
        this.fx.push({ sfx: 'wedge', o: { n: i }, haptic: q >= 1 ? 8 : [8, 20, 8], dust: { x: (i + 0.5) / nW, y: 0.62, n: 4 } });
        if (q < 0.6) this.fx.push({ pop: { t: 'הסדק סוטה — הכה בנמוכה', x: (i + 0.5) / nW, y: 0.5, kind: 'bad' } });
      },
      split(text) {
        this.phase = 'split'; this.pt = 0; this.progress++;
        this.fx.push({ sfx: 'split' }, { sfx: 'thud', o: { mass: 2 }, haptic: [20, 40, 30], shake: 1.2, dust: { x: 0.5, y: 0.62, n: 24 }, pop: { t: text, x: 0.5, y: 0.35, kind: this.helped ? '' : 'big' } });
      },
      tap(x) {
        if (this.done) return;
        if (this.part === 'cut') {
          if (this.phase !== 'swing') return;
          const q = this.f >= 1 - band ? 1 : clamp(1 - (1 - band - this.f) * 1.6, 0.15, 0.95);
          this.cut(q, q >= 1 ? 'עמוק ונקי!' : q > 0.7 ? 'כמעט' : 'רדוד');
          return;
        }
        if (this.phase !== 'drive') return;
        const i = x == null ? Math.floor(nW / 2) : clamp(Math.floor(x * nW), 0, nW - 1);
        if (this.cool > 0) this.queued = i; else this.strike(i);
      },
      press(id) { if (/^w\d+$/.test(id)) this.tap((+id.slice(1) + 0.5) / nW); },
      /** (wave 8B) where and when a player taps: the force meter at its gold band; then the lowest wedge */
      cue() {
        if (this.part === 'cut') return { x: 0.5, y: 0.5, now: this.phase === 'swing' && this.f >= 1 - band + 0.01, timed: true };
        const k = this.lowest();
        return k < 0 || this.phase !== 'drive' ? null : { x: (k + 0.5) / nW, y: this.wedgeY || 0.72, now: false, timed: false };
      },
      auto() {
        if (this.part === 'cut') return this.phase === 'swing' && this.st > 0.3 && this.f >= 1 - Math.max(0.01, band - this.err - 0.03);
        if (this.phase !== 'drive' || this.cool > 0 || this.since < this.rest) return false;
        const k = this.lowest(); return k < 0 ? false : 'w' + k;
      },
      result() {
        const mc = this.qc.length ? this.qc.reduce((a, b) => a + b, 0) / this.qc.length : 0;
        const mw = this.qw.length ? this.qw.reduce((a, b) => a + b, 0) / this.qw.length : 0.3;
        const quality = clamp(0.45 * mc + 0.55 * mw * (this.helped ? 0.6 : 1));
        const perfect = !this.helped && this.qc.length === cuts && this.qc.every((k) => k >= 1) && mw >= 0.97;
        return { quality, perfect, score: Math.round(quality * 300) + this.qc.filter((k) => k >= 1).length * 20 + (perfect ? 50 : 0) };
      },
    };
    if (setup && setup.onWorld) M.fx.push({ world: 'quarry' });                  // PEOPLE: a quarry block at the hero's feet
    return M;
  },

  draw(g, M, W, H) {
    g.fillStyle = '#A8956C'; g.fillRect(0, 0, W, H);                                   // the bedrock and its strata
    g.strokeStyle = 'rgba(80,62,38,.35)'; g.lineWidth = 2;
    for (let k = 1; k < 6; k++) { const y = H * (0.12 + 0.16 * k); g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(W * 0.3, y - 6, W * 0.7, y + 6, W, y - 2); g.stroke(); }
    const x0 = W * 0.06, x1 = W * 0.94, y0 = H * 0.2, y1 = H * 0.62, lift = M.phase === 'split' || M.phase === 'done' ? Math.min(1, M.pt * 2) * H * 0.04 : 0;
    g.fillStyle = '#E6D6B0'; g.fillRect(x0, y0 - lift, x1 - x0, y1 - y0);                 // the block (meleke, the soft white limestone)
    g.strokeStyle = 'rgba(120,96,60,.5)'; g.lineWidth = 1; g.strokeRect(x0 + 6, y0 + 6 - lift, x1 - x0 - 12, y1 - y0 - 12);   // its drafted margin to come
    const ch = (q) => 3 + 5 * q;                                                        // the channels already cut: right, back, left
    g.strokeStyle = '#4E3E28';
    if (M.qc[0] != null) { g.lineWidth = ch(M.qc[0]); g.beginPath(); g.moveTo(x1 + 3, y0 - 3); g.lineTo(x1 + 3, y1); g.stroke(); }
    if (M.qc[1] != null) { g.lineWidth = ch(M.qc[1]); g.beginPath(); g.moveTo(x0 - 3, y0 - 3); g.lineTo(x1 + 3, y0 - 3); g.stroke(); }
    if (M.qc[2] != null) { g.lineWidth = ch(M.qc[2]); g.beginPath(); g.moveTo(x0 - 3, y0 - 3); g.lineTo(x0 - 3, y1); g.stroke(); }
    g.font = '700 14px Heebo, system-ui, sans-serif'; g.textAlign = 'right'; g.direction = 'rtl'; g.fillStyle = '#FFF4DA';
    if (M.part === 'cut') {
      const bx = W * 0.82, bw = W * 0.1, by = H * 0.66, bh = H * 0.3;                    // the force meter with its gold band
      g.fillStyle = 'rgba(30,22,12,.6)'; g.fillRect(bx, by, bw, bh);
      g.fillStyle = '#FFD66E'; g.fillRect(bx, by, bw, bh * M.band);
      const on = M.level <= 1 && M.phase === 'swing' && M.f >= 1 - M.band;             // training wheels
      g.fillStyle = on ? '#7CE0A0' : '#F3E6C4'; g.fillRect(bx + 3, by + bh * (1 - M.f), bw - 6, bh * M.f);
      const px = [x1 + 3, (x0 + x1) / 2, x0 - 3][Math.min(2, M.c)], py = [H * 0.4, y0 - 3, H * 0.4][Math.min(2, M.c)], a = -1.2 + 1.3 * M.f;
      g.save(); g.translate(px, py - 30); g.rotate(a); g.fillStyle = '#6B4A2A'; g.fillRect(-3, -60, 6, 60); g.fillStyle = '#7C7C84';
      g.beginPath(); g.moveTo(-18, -62); g.lineTo(20, -58); g.lineTo(-18, -52); g.fill(); g.restore();
      g.fillStyle = '#FFF4DA'; g.fillText(`חריץ ${Math.min(M.c + 1, 3)}/3`, W - 10, H - 10);
      return;
    }
    const low = M.lowest(), wy = y1 + 2, crackW = (x1 - x0) * M.crack;                    // the crack along the bed, then the wedges
    M.wedgeY = (wy + 26) / H;
    g.strokeStyle = M.spread > 0.5 ? '#B8452E' : '#2B2014'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, wy);
    for (let x = 0; x <= crackW; x += 8) g.lineTo(x0 + x, wy + (M.spread > 0.5 ? Math.sin(x * 0.3) * 4 : Math.sin(x * 0.7)));
    g.stroke();
    for (let i = 0; i < M.nW; i++) {
      const cx = ((i + 0.5) / M.nW) * W, dp = M.d[i], tip = wy - dp * (y1 - y0) * 0.22;
      if (M.level <= 1 && i === low && M.phase === 'drive') { g.fillStyle = 'rgba(124,224,160,.35)'; g.beginPath(); g.arc(cx, wy + 22, 26, 0, 6.29); g.fill(); }
      g.fillStyle = dp >= 1 ? '#5E5E66' : '#8A8A94'; g.beginPath(); g.moveTo(cx - 12, wy + 40); g.lineTo(cx + 12, wy + 40); g.lineTo(cx, tip); g.fill();
      g.fillStyle = 'rgba(30,22,12,.6)'; g.fillRect(cx - 16, wy + 48, 32, 8);
      g.fillStyle = dp >= 1 ? '#7CE0A0' : Math.max(...M.d) - dp > 0.3 ? '#F0A04B' : '#F3E6C4'; g.fillRect(cx - 16, wy + 48, 32 * dp, 8);
    }
    g.fillStyle = '#FFF4DA'; g.fillText(`יתדות · ${M.d.filter((v) => v >= 1).length}/${M.nW}`, W - 10, H - 10);
  },
};
