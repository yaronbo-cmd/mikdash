/* שפשף עד שיבריק · סיד על המזבח · נחושת מצהיבה (cover.js) — GAMES14, wave 14: her ❤️ gold, and its two cheap skins.
 * Rub with the cloth, back and forth, until the plate shines: the gold of the House (gates · ulam · heichal · kodesh), the
 * altar's whitewash by cloth (yesod · sovev · guf · karnot), Nikanor's yellowing bronze (nikanor · kiyor). One 24×16 grid;
 * each drag segment stamps the cloth along its path. Levels (FUN14's 0–2): L1 a big cloth, 70 % · L2 85 %, and a place to
 * keep off (the gold: "חוץ מאחר הדלתות") or stubborn spots · L3 92 %, two coats. q = .55 her share + .25 clean edges + .2 par.
 * The autopilot sweeps the dullest row; the hand shows it. Idle: the crew polishes, slowly (a calm quality). */
import { clamp } from './frame.js';
import { act as actNow, bonus, actsQ } from './acts.js';   // ── craftb19 ── ── /craftb19 ──

const C = 24, R = 16, X0 = 0.07, X1 = 0.93, Y0 = 0.13, Y1 = 0.9, AR = 0.86, N = C * R;
// ── craftb19 ── (FUN19 §2, the rub: "per tile (a 4×3 grid): rubbed 20, done in one unbroken stroke 40, a tap fill 10; a full panel +80")
// the plate's 12 tiles are its scoring acts: a tile is done when its cells are clean (L1 80 % · L2 88 % · L3 92 %); the act fires on the
// frame its last cell turns, graded by HOW: within the one stroke that first touched it (gold), over several strokes (good), by a tap's
// sweep (ok). All 12 done = the panel: +80, the glint sweeps it. TCOL/TROW: the tile of a cell.
const TC = 4, TR = 3, NT = TC * TR, TCOL = (i) => Math.min(TC - 1, Math.floor((i * TC) / C)), TROW = (j) => Math.min(TR - 1, Math.floor((j * TR) / R));
export const TILE_OF = new Uint8Array(N); for (let j = 0; j < R; j++) for (let i = 0; i < C; i++) TILE_OF[j * C + i] = TROW(j) * TC + TCOL(i);
export const GRID = { C, R, X0, X1, Y0, Y1, TC, TR, NT };
// ── /craftb19 ──
const cx = (i) => X0 + ((i + 0.5) * (X1 - X0)) / C, cy = (j) => Y0 + ((j + 0.5) * (Y1 - Y0)) / R;
const hex = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
const mix = (a, b, f) => `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * f)).join(',')})`;

export const SKINS = {
  gold: {
    n: 'שפשף עד שיבריק', kicker: 'צורפים · ציפוי הזהב', dull: '#7D6633', hi: '#FFEDB0', lo: '#C9922F',
    hint: 'שפשף עם המטלית הלוך ושוב, עד שהזהב מבריק', howto: 'שפשף את הזהב עם המטלית — הלוך ושוב, שורה אחרי שורה', keep: 'אחר הדלת — בלי זהב',
    fact: { he: 'ההיכל כולו היה מצופה זהב: "שכל הבית טוח בזהב, חוץ מאחר הדלתות". השפשוף כאן — המחשה.', ref: 'משנה מדות ד, א', status: 'draft', illus: true },
  },
  plaster: {
    n: 'סיד על המזבח', kicker: 'סיידים · המזבח', dull: '#8F8573', hi: '#FFFFFF', lo: '#E6E1D3',
    hint: 'מלבנים את אבני המזבח במטלית — הלוך ושוב, עד שהן לבנות', howto: 'העבר את המטלית הלוך ושוב על האבנים עד שהן לבנות',
    fact: { he: 'את אבני המזבח היו מלבנים: "ומלבנים אותן פעמים בשנה"; ורבי אומר: "מלבנים אותו במפה". המטלית כאן — המחשה.', ref: 'משנה מדות ג, ד', status: 'draft', illus: true },
  },
  bronze: {
    n: 'נחושת מצהיבה', kicker: 'נחושתנים · שער נקנור', dull: '#4C4A30', hi: '#FFE39A', lo: '#B47A2C',
    hint: 'מרק את הנחושת הלוך ושוב, עד שהיא מצהיבה כמו זהב', howto: 'מרק את דלת הנחושת במטלית — הלוך ושוב, עד שהיא זוהרת',
    fact: { he: 'שערי נקנור לא הוחלפו בזהב, ויש אומרים: "מפני שנחשתן מצהיב" — הנחושת הבהיקה כזהב. המירוק כאן — המחשה.', ref: 'משנה מדות ב, ג', status: 'draft', illus: true },
  },
};
const BY_SITE = { nikanor: 'bronze', kiyor: 'bronze', yesod: 'plaster', sovev: 'plaster', guf: 'plaster', karnot: 'plaster' };

function model({ level = 0, rng = Math.random, setup = {} } = {}) {
  const L = clamp(+level || 0, 0, 2), Li = Math.round(L);
  const skin = SKINS[setup.skin] ? setup.skin : BY_SITE[setup.site] || 'gold', S = SKINS[skin];
  const r = 0.12 - 0.02 * L, ry = r / AR, target = [0.7, 0.85, 0.92][Li], amt = [0.035, 0.05, 0.1][Li];
  const need = new Float32Array(N).fill(L >= 1.5 ? 1.7 : 1), got = new Float32Array(N), off = new Uint8Array(N);
  if (Li >= 1 && skin === 'gold') { for (let j = 0; j < R; j++) for (let i = 0; i < 4; i++) { off[j * C + i] = 1; need[j * C + i] = 0; } }   // behind the door: the left edge (the hinge side), no gold
  else if (Li >= 1) for (let s = 0; s < 3; s++) {                                    // stubborn spots: the soot of the fires, the green of the patina
    const si = 3 + Math.floor(rng() * (C - 6)), sj = 2 + Math.floor(rng() * (R - 4));
    for (let j = sj - 1; j <= sj + 1; j++) for (let i = si - 2; i <= si + 2; i++) need[j * C + i] += 0.8;
  }
  let active = 0; for (let k = 0; k < N; k++) if (!off[k]) active++;
  const cols = Array.from({ length: 9 }, (_, st) => mix(hex(S.dull), hex(S.lo).map((v, q) => Math.round(v + (hex(S.hi)[q] - v) * 0.55)), st / 8));   // dull → shining, 8 steps
  const parT = 26 + 4 * L;
  // ── craftb19 ── the tiles: active cells, done flags, the stroke that first touched each; the strokes (id → { n, tap })
  const tCnt = new Uint16Array(NT), tDone = new Uint8Array(NT), tFirst = new Int32Array(NT).fill(-1), tTap = new Uint8Array(NT), tileQ = [0.8, 0.88, 0.92][Li];
  // the pad (two thumbs): a tile is rubbed by the thumb's own path — PAD_NEED[L] of it (in the pad's units, 160 px each) finishes the
  // tile the cloth is on, whatever the speed; GOLD: in one unbroken stroke at a brisk rub (≥ PAD_RATE u/s ≈ 2 circles a second of a
  // 36-px circle) — the tile's own rubbing time ≤ need / rate. tW: the path given to it · tT: its rubbing time · tBrk: a lift on it
  const padNeed = [1.8, 2.0, 2.6][Li], padGoldT = padNeed / [1.3, 1.4, 1.5][Li];
  const tW = new Float32Array(NT), tT = new Float32Array(NT), tBrk = new Uint8Array(NT);
  for (let k = 0; k < N; k++) if (!off[k]) tCnt[TILE_OF[k]]++;
  let tAct = 0; for (let t = 0; t < NT; t++) { if (!tCnt[t]) tDone[t] = 1; else tAct++; }
  // ── /craftb19 ──
  const M = {
    kind: 'cover', skin, S, level: L, r, ry, target, need, got, off, cols, t: 0, done: false, progress: 0, fx: [], phase: 'rub', pt: 0,
    cov: 0, mine: 0, spill: 0, quiet: 0, ps: {}, last: 0, mile: 0, sfxT: 0, crew: 0, _a: null, cbud: 0,
    // ── craftb19 ── (ver: bumps when a cell changes — the world's mask redraws then; acts: the scoring acts; tiles: done of NT)
    coach: 'שפשפו בעיגולים על "עבודה"',
    ver: 0, acts: [], tiles: 0, nTiles: tAct, tDone, tFirst, tCnt, sid: {}, strokes: 0, cur: 0, curTap: false, tileQ, X0, X1, Y0, Y1, TC, TR, tW, tT, tBrk, padNeed, padGoldT,
    // ── /craftb19 ──
    edge: off[0] ? cx(3) + (X1 - X0) / C / 2 : 0,               // the door's edge (the gold at L2–L3): the cloth keeps right of it
    clean(k) { return off[k] ? 1 : Math.min(1, got[k] / need[k]); },
    count() { let c = 0; for (let k = 0; k < N; k++) if (!off[k] && got[k] >= need[k]) c++; return c / active; },
    stamp(x, y, mine) {
      let sp = 0, gain = 0;
      for (let j = 0; j < R; j++) {
        const dy = (cy(j) - y) / ry; if (dy * dy >= 1) continue;
        for (let i = 0; i < C; i++) {
          const dx = (cx(i) - x) / r, d2 = dx * dx + dy * dy; if (d2 >= 1) continue;
          const k = j * C + i, w = amt * (1 - d2) * (this._pk || 1);   // ── craftb19 ── (_pk: the pad's cloth presses harder — its tile turns as the thumb's path fills it) ── /craftb19 ──
          if (off[k]) { sp += w; continue; }
          if (got[k] < need[k]) { const was = got[k] >= need[k]; got[k] = Math.max(got[k], Math.min(this._pk > 1 ? need[k] * Math.min(0.95, 0.2 + (0.8 * tW[TILE_OF[k]]) / padNeed) : need[k], got[k] + w));   /* (the pad's cloth: a cell no brighter than its tile's work) */ if (!was && got[k] >= need[k] && mine) gain++; this.ver++; if (mine && this.cur) { const t = TILE_OF[k]; if (tFirst[t] < 0) { tFirst[t] = this.cur; tTap[t] = this.curTap ? 1 : 0; } else if (tFirst[t] !== this.cur) tFirst[t] = 0; if (this.curTap) tTap[t] = 1; } }   // ── craftb19 ── (ver, the tile's strokes) ── /craftb19 ──
        }
      }
      if (mine) { this.mine += gain / active; if (sp > 0) this.spill += sp / 60; }
      return sp;
    },
    rub(a, b, mine = true) {                                // the cloth along a segment (in the 0…1 box): her whole stroke counts, however slow the phone (the crew's has a budget)
      const len0 = Math.hypot(b[0] - a[0], (b[1] - a[1]) * AR), len = mine ? len0 : Math.min(len0, this.cbud);
      if (!mine) this.cbud -= len;
      if (len0 > 1e-6 && len < len0) b = [a[0] + ((b[0] - a[0]) * len) / len0, a[1] + ((b[1] - a[1]) * len) / len0];
      const n = Math.max(1, Math.ceil(len / (r * 0.35)));
      let sp = 0;
      for (let s = 1; s <= n; s++) sp += this.stamp(a[0] + ((b[0] - a[0]) * s) / n, a[1] + ((b[1] - a[1]) * s) / n, mine);
      if (mine && len > 0.004) { this.quiet = 0; if (this.t - this.sfxT > 0.14) { this.sfxT = this.t; this.fx.push({ sfx: 'brush', haptic: 4 }); } }
      if (sp > 0 && mine && this._pk <= 1 && this.t - this.last > 1.2) { this.last = this.t; this.fx.push({ pop: { t: S.keep || 'לא כאן', x: 0.2, y: 0.5, kind: 'bad' }, haptic: [10, 20, 10] }); }
    },
    drag(x, y, ph, id) {
      if (this.done || this.phase !== 'rub') return;
      // ── craftb19 ── the pad (two thumbs: the right thumb rubs on the work button, not on the panel — M.pad, set by the world craft):
      // the cloth rubs the tile it is on, following the thumb's own motion (its circles, its back and forth, scaled), round the tile's
      // middle; the thumb's path length is the coverage (FUN19: "coverage follows the length of the thumb's path"); a tile done, the
      // cloth glides on to the next (right to left, row by row). The autopilot (a tap, id 1) keeps its sweep on the panel.
      if (this.pad && !(id === 1 && this._a)) {
        const pd = this.pd || (this.pd = { ex: 0, ey: 0, on: false, cx: 0.5, cy: 0.5, tile: -1, lx: 0, ly: 0 });
        if (ph === 'down') { pd.ex = x; pd.ey = y; pd.lx = x; pd.ly = y; pd.on = true; pd.m0 = true; this.padTile(); const cx = pd.cx, cy = pd.cy; x = cx; y = cy; }
        else if (ph === 'move' && pd.on) {
          if (pd.m0) { pd.m0 = false; pd.lx = x; pd.ly = y; pd.ex = x; pd.ey = y; }   // (the first move carries the drag's 18-px threshold: the base, not a stroke)
          const t = pd.tile; if (t >= 0 && !tDone[t]) { const w0 = tW[t]; tW[t] = Math.min(tW[t] + Math.min(0.5, Math.hypot(x - pd.lx, y - pd.ly)), ((tT[t] + 0.1) * padNeed) / 0.75); if (w0 < padNeed && tW[t] >= padNeed) this.ver++; }   // (the thumb's own path: the tile's work; at most a tile in 0.75 s — no farm)
          pd.lx = x; pd.ly = y;
          pd.ex += (x - pd.ex) * 0.12; pd.ey += (y - pd.ey) * 0.12; const tw = (X1 - X0) / TC * 0.35, th = (Y1 - Y0) / TR * 0.35; x = pd.cx + clamp((x - pd.ex) * 0.42, -tw, tw); y = pd.cy + clamp((y - pd.ey) * 0.42, -th, th);
        }
        else { if (pd.on && pd.tile >= 0 && !tDone[pd.tile] && tW[pd.tile] > 0) tBrk[pd.tile] = 1; pd.on = false; }   // (a lift on a tile half rubbed: not one unbroken stroke)
      }
      // ── /craftb19 ──
      this._pk = this.pad && !(id === 1 && this._a) ? 2.5 : 1;   // ── craftb19 ── ── /craftb19 ──
      if (ph === 'down') { this.sid[id] = { n: ++this.strokes, tap: id === 1 && !!this._a }; this.cur = this.sid[id].n; this.curTap = this.sid[id].tap; this.ps[id] = [x, y]; this.rub([x, y], [x, y]); this._pk = 1; return; }   // ── craftb19 ── (a stroke: its number; the autopilot's = a tap's) ── /craftb19 ──
      const p = this.ps[id]; if (!p) return;
      { const sd = this.sid[id]; if (sd) { this.cur = sd.n; this.curTap = sd.tap; } }   // ── craftb19 ── ── /craftb19 ──
      if (ph === 'move') { const P0 = this._p0 || (this._p0 = [0, 0]); P0[0] = p[0]; P0[1] = p[1]; p[0] = x; p[1] = y; this.rub(P0, p); this._pk = 1; }   // ── craftb19 ── (no array per move: the last point kept in p, the segment from _p0) ── /craftb19 ──
      else { delete this.ps[id]; delete this.sid[id]; this.cur = 0; this._pk = 1; }   // ── craftb19 ── ── /craftb19 ──
    },
    tap(x = 0.5, y = 0.5) { if (this.phase === 'rub') this.rub([x - r, y], [x + r, y]); },
    // ── craftb19 ── the pad's tile: the one the cloth is on while it is not done, else the next undone (right to left, top to bottom)
    padTile() {
      const pd = this.pd; if (!pd) return;
      if (pd.tile >= 0 && !tDone[pd.tile]) return;
      let best = -1; for (let row = 0; row < TR && best < 0; row++) for (let col = TC - 1; col >= 0; col--) { const t = row * TC + col; if (!tDone[t]) { best = t; break; } }
      if (best < 0) return;
      pd.tile = best; pd.tx = X0 + ((best % TC) + 0.5) * (X1 - X0) / TC; pd.ty = Y0 + (((best / TC) | 0) + 0.5) * (Y1 - Y0) / TR;
      if (!pd.moved) { pd.cx = pd.tx; pd.cy = pd.ty; pd.moved = true; }
    },
    // ── /craftb19 ──
    step(dt) {
      if (this.done) return;
      this.t += dt; this.pt += dt; this.quiet += dt;
      if (this.phase === 'shine') { if (this.pt > 0.9) { this.done = true; this.phase = 'done'; } return; }
      if (this.pd && this.pd.on && this.pd.tile >= 0 && !tDone[this.pd.tile]) tT[this.pd.tile] += this.rdt > 0 ? Math.min(this.rdt, 0.25) : dt;   // (the tile's rubbing time, in real time)
      if (this.pd) { this.padTile(); const pd = this.pd, k = Math.min(1, dt * 7); if (pd.tx != null) { pd.cx += (pd.tx - pd.cx) * k; pd.cy += (pd.ty - pd.cy) * k; } }   // ── craftb19 ── (the cloth glides on to the next tile) ── /craftb19 ──
      if (!this.patient && !this.hold && (this.quiet > 3 || this.t > 45)) {           // a test's idle hand: the crew polishes, slowly
        this.crew += dt; this.cbud = Math.min(0.3, this.cbud + dt * (this.t > 45 ? 1.5 : 0.45));
        const k = this.dirtiest(); if (k && this.cbud > 0.05) { const u = (this.t * 0.4) % 1; this.rub([k.x + (k.x2 - k.x) * u, k.y], [k.x2, k.y2], false); }
      }
      const cov = this.count();
      let rubbed = 0; for (let k = 0; k < N; k++) if (!off[k]) rubbed += Math.min(got[k], need[k]) / need[k];
      this.progress = Math.floor(Math.min(1, rubbed / active / target) * 100);   // every stroke shows (the frame's idle clock)
      if (this.nTiles) this.progress = Math.max(this.progress | 0, Math.floor((this.tiles / this.nTiles) * 100));   // ── craftb19 ── ── /craftb19 ──
      if (cov !== this.cov) {
        this.cov = cov;
        const m = Math.floor((cov / target) * 4);
        if (m > this.mile && m < 4) { this.mile = m; if (!this.nTiles) this.fx.push({ sfx: 'chime', o: { combo: m }, pop: { t: `${Math.round(cov * 100)}%`, x: 0.5, y: 0.08, kind: 'good' } }); }   // ── craftb19 ── (the tiles' "+N" are the numbers now) ── /craftb19 ──
      }
      // ── craftb19 ── the tiles: a tile whose cells are clean is an act, on this frame (its "+N" at its middle)
      if (this.ver !== this._tv) {
        this._tv = this.ver;
        for (let t = 0; t < NT; t++) {
          if (tDone[t]) continue;
          let c = 0; for (let k = 0; k < N; k++) if (TILE_OF[k] === t && !off[k]) c += Math.min(got[k], need[k]) / need[k];
          if (this.pad ? !(tW[t] >= padNeed || (c / tCnt[t] >= tileQ && tW[t] < padNeed * 0.5)) : c / tCnt[t] < tileQ) continue;   // (the pad: the thumb's path finishes its tile; a tap's sweep by the cells)
          tDone[t] = 1; this.tiles++;
          if (this.pad) for (let k = 0; k < N; k++) if (TILE_OF[k] === t && !off[k]) got[k] = need[k];   // (two thumbs: the tile turns whole — the mask shows it done; the sheet keeps its cells as rubbed)
          const tx = X0 + ((t % TC) + 0.5) * (X1 - X0) / TC, ty = Y0 + (((t / TC) | 0) + 0.5) * (Y1 - Y0) / TR;
          if (tFirst[t] === -1 && !this.cur) continue;   // (the crew's: no act without a touch)
          const q = this.pad && tW[t] >= padNeed * 0.5 ? (!tBrk[t] && tT[t] <= padGoldT ? 2 : 1) : tTap[t] ? 0 : tFirst[t] > 0 ? 2 : 1;   // (the pad: one unbroken, brisk stroke = gold)
          actNow(this, q, { x: tx, y: ty, power: 1, tile: t, sfx: tTap[t] ? 'brush' : undefined });
          this.acts[this.acts.length - 1].tile = t;
        }
        if (this.tiles >= this.nTiles && this.phase === 'rub') { for (let k = 0; k < N; k++) if (!off[k]) got[k] = need[k]; this.ver++; this.cov = 1; this.phase = 'shine'; this.pt = 0; this.ps = {}; bonus(this, 80, skin === 'plaster' ? 'לבן ונקי!' : 'מבריק!', { x: 0.5, y: 0.45 }); return; }
      }
      // ── /craftb19 ──
      if (cov >= target && this.phase === 'rub' && this.nTiles && !this.pad) { for (let k = 0; k < N; k++) if (!off[k]) got[k] = need[k]; this.ver++; this.tiles = this.nTiles; this.phase = 'shine'; this.pt = 0; this.ps = {}; bonus(this, 80, skin === 'plaster' ? 'לבן ונקי!' : 'מבריק!', { x: 0.5, y: 0.45 }); return; }   // ── craftb19 ── (the sheet: done at its aim, as before) ── /craftb19 ──
      if (cov >= target && this.phase === 'rub' && !this.nTiles) { this.phase = 'shine'; this.pt = 0; this.ps = {}; this.fx.push({ sfx: 'chime', o: { combo: 5 }, haptic: [10, 30, 10, 30, 10], pop: { t: skin === 'plaster' ? 'לבן ונקי!' : 'מבריק!', x: 0.5, y: 0.45, kind: 'big' } }); }
    },
    dirtiest() {                                          // the dullest row and its dirty span → a stroke across it
      let bj = -1, bs = 0;
      for (let j = 0; j < R; j++) { let s = 0; for (let i = 0; i < C; i++) { const k = j * C + i; if (!off[k]) s += Math.max(0, need[k] - got[k]); } if (s > bs) { bs = s; bj = j; } }
      if (bj < 0) return null;
      let a = C, b = -1; for (let i = 0; i < C; i++) { const k = bj * C + i; if (!off[k] && got[k] < need[k]) { a = Math.min(a, i); b = Math.max(b, i); } }
      let xa = cx(Math.max(0, a)) - r * 0.3, xb = cx(Math.min(C - 1, b)) + r * 0.3;
      if (xb - xa < 0.3) { const m = (xa + xb) / 2; xa = m - 0.15; xb = m + 0.15; }
      if (this.edge) { xa = Math.max(xa, this.edge + r * 0.85); xb = Math.max(xb, xa + 0.1); }
      const y = clamp(cy(bj), Y0 + ry * 0.4, Y1 - ry * 0.4);
      return { x: clamp(xb, 0.04, 0.96), y, x2: clamp(xa, 0.04, 0.96), y2: y };   // right to left, as she reads
    },
    cue() { return this.phase === 'rub' && !this.done ? this.dirtiest() : null; },
    auto() {
      if (this.phase !== 'rub') return null;
      const a = this._a;
      if (!a) { const c = this.dirtiest(); if (!c) return null; this._a = { ...c, k: 0, n: Math.max(6, Math.round(Math.abs(c.x2 - c.x) / 0.02)) }; return { x: c.x, y: c.y, p: 'down', id: 1 }; }
      a.k++;
      const f = a.k / a.n, back = Math.floor(f) % 2 === 1, u = f % 1, s = back ? 1 - u : u;   // there and back again
      if (f >= 2) { this._a = null; return { x: a.x, y: a.y, p: 'up', id: 1 }; }
      return { x: a.x + (a.x2 - a.x) * s, y: a.y, p: 'move', id: 1 };
    },
    result() {
      let quality = clamp(0.55 * clamp(this.mine / target) + 0.25 * (1 - clamp(this.spill)) + 0.2 * clamp(1 - (this.t - parT) / parT));
      if (this.acts.length && this.pad) quality = clamp(actsQ(this));   // (two thumbs: the tiles' grades — where the pad's cloth strays is wasted, never punished; the sheet keeps its sweep's measure)   // ── craftb19 ── (the tiles' grades) ── /craftb19 ──
      return { quality, perfect: quality >= 0.97, score: Math.round(quality * 300), cov: this.cov, mine: this.mine, spill: this.spill, pts: this.pts | 0, acts: this.acts.length };
    },
  };
  return M;
}

function draw(g, M, W, H) {
  const S = M.S;
  g.fillStyle = M.skin === 'plaster' ? '#6F6553' : '#2B2014'; g.fillRect(0, 0, W, H);
  const x0 = X0 * W, y0 = Y0 * H, cw = ((X1 - X0) * W) / C, ch = ((Y1 - Y0) * H) / R;
  const pw = (X1 - X0) * W, ph = (Y1 - Y0) * H, D = globalThis.document;
  if (M._img === undefined) {                                                       // the plate as a 24×16 bitmap, drawn in one image (cheap on every phone)
    try { const c = D.createElement('canvas'); c.width = C; c.height = R; const x = c.getContext('2d'); M._img = { c, x, d: x.createImageData(C, R), rgb: M.cols.map((s) => s.match(/\d+/g).map(Number)) }; } catch (e) { M._img = null; }
  }
  if (M._img) {
    const { c, x, d, rgb } = M._img;
    for (let k = 0; k < N; k++) { const v = M.off[k] ? [132, 86, 47] : rgb[Math.round(M.clean(k) * 8)]; d.data[k * 4] = v[0]; d.data[k * 4 + 1] = v[1]; d.data[k * 4 + 2] = v[2]; d.data[k * 4 + 3] = 255; }
    x.putImageData(d, 0, 0); g.imageSmoothingEnabled = true; g.drawImage(c, x0, y0, pw, ph);
  } else for (let st = -1; st <= 8; st++) {                                           // (no DOM: one path a colour)
    g.beginPath();
    for (let k = 0; k < N; k++) { if (st < 0 ? !M.off[k] : M.off[k] || Math.round(M.clean(k) * 8) !== st) continue; const i = k % C, j = (k / C) | 0; g.rect(x0 + i * cw, y0 + j * ch, cw + 0.6, ch + 0.6); }
    g.fillStyle = st < 0 ? '#84562F' : M.cols[st]; g.fill();
  }
  if (!M._mo || M._mo.w !== W || M._mo.h !== H) {                                   // the sheen and the engraving: drawn once into a layer
    let L2 = null; const tr = typeof g.getTransform === 'function' ? g.getTransform() : null, k = (tr && tr.a) || 1;   // at the screen's own pixel density
    try { const c = D.createElement('canvas'); c.width = Math.round(W * k); c.height = Math.round(H * k); L2 = { c, x: c.getContext('2d') }; if (L2.x.scale) L2.x.scale(k, k); } catch (e) { L2 = null; }
    M._mo = { w: W, h: H, L: L2 };
    if (L2) motifs(L2.x, M, W, H, x0, y0, cw, ch);
  }
  if (M._mo.L) g.drawImage(M._mo.L.c, 0, 0, W, H); else motifs(g, M, W, H, x0, y0, cw, ch);
  if (M.off[0]) {                                                                    // the door's edge, and what it says
    g.fillStyle = 'rgba(28,20,10,.55)'; g.fillRect(x0 + 4 * cw - 3, y0, 6, (Y1 - Y0) * H);
    g.save(); g.translate(x0 + 2 * cw, H * 0.5); g.rotate(-Math.PI / 2); g.fillStyle = '#F3E6C4'; g.font = '700 13px Heebo, system-ui, sans-serif'; g.textAlign = 'center'; g.direction = 'rtl'; g.fillText(S.keep, 0, 4); g.restore();
  }
  if (M.phase === 'shine') {                                                         // the light runs across the finished plate
    const p = M.pt / 0.9, bx = x0 - W * 0.3 + p * W * 1.4;
    const gr = g.createLinearGradient(bx - W * 0.15, 0, bx + W * 0.15, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,.65)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(x0, y0, (X1 - X0) * W, (Y1 - Y0) * H);
  }
  for (const id in M.ps) {                                                           // the cloth under her finger
    const [px, py] = M.ps[id];
    g.save(); g.translate(px * W, py * H); g.rotate(0.3 * Math.sin(M.t * 9));
    g.fillStyle = 'rgba(244,241,232,.92)'; g.beginPath(); g.ellipse(0, 0, M.r * W * 0.75, M.r * W * 0.5, 0, 0, 6.2832); g.fill();
    g.strokeStyle = 'rgba(150,135,110,.8)'; g.lineWidth = 1.5; g.stroke(); g.restore();
  }
  const pct = Math.round(M.cov * 100), tg = Math.round(M.target * 100);                // the bar: how bright, and the aim
  g.fillStyle = 'rgba(28,20,10,.75)'; g.fillRect(W * 0.18, 6, W * 0.64, 20);
  g.fillStyle = M.skin === 'plaster' ? '#FFFFFF' : '#FFD66E'; g.fillRect(W * 0.18 + 2, 8, (W * 0.64 - 4) * Math.min(1, M.cov / M.target), 16);
  g.font = '800 13px Heebo, system-ui, sans-serif'; g.textAlign = 'center'; g.direction = 'rtl'; g.lineWidth = 3; g.strokeStyle = 'rgba(28,20,10,.9)';
  const bt = `${M.skin === 'plaster' ? 'לבן' : 'מבריק'} ${pct}% · היעד ${tg}%`; g.strokeText(bt, W * 0.5, 21); g.fillStyle = '#FFF6DA'; g.fillText(bt, W * 0.5, 21);
}

function motifs(g, M, W, H, x0, y0, cw, ch) {
  { const gr = g.createLinearGradient(x0, y0, x0 + (X1 - X0) * W, y0 + (Y1 - Y0) * H); gr.addColorStop(0, 'rgba(255,255,255,.16)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(90,60,20,.14)'); g.fillStyle = gr; }
   g.fillRect(x0 + (M.off[0] ? 4 * cw : 0), y0, (X1 - X0) * W - (M.off[0] ? 4 * cw : 0), (Y1 - Y0) * H);   // the sheen
  g.lineWidth = 2; g.strokeStyle = M.skin === 'plaster' ? 'rgba(90,80,62,.35)' : 'rgba(60,40,10,.4)';
  g.beginPath();
  if (M.skin === 'gold') {                                                          // the engraved lattice of rosettes
    for (let a = 0; a < 5; a++) for (let b = 0; b < 4; b++) { const px = x0 + (a + 0.5) * ((X1 - X0) * W) / 5, py = y0 + (b + 0.5) * ((Y1 - Y0) * H) / 4, rr = Math.min(cw, ch) * 1.6; if (px < x0 + 4 * cw && M.off[0]) continue; g.moveTo(px + rr, py); g.arc(px, py, rr, 0, 6.2832); for (let q = 0; q < 6; q++) { const an = (q * Math.PI) / 3; g.moveTo(px, py); g.lineTo(px + Math.cos(an) * rr, py + Math.sin(an) * rr); } }
  } else if (M.skin === 'plaster') {                                                 // the altar's whole stones, under the white
    for (let b = 0; b < 4; b++) for (let a = 0; a < 5; a++) { const w = ((X1 - X0) * W) / 5, h = ((Y1 - Y0) * H) / 4, px = x0 + a * w + (b % 2 ? w * 0.3 : 0) + w * 0.5, py = y0 + b * h + h * 0.5, ro = ((a + b) % 3) * 0.2; g.moveTo(px + Math.cos(ro) * w * 0.44, py + Math.sin(ro) * w * 0.44); g.ellipse(px, py, w * 0.44, h * 0.4, ro, 0, 6.2832); }
  } else {                                                                           // the bronze door's panels and studs
    const w = ((X1 - X0) * W) / 2, h = ((Y1 - Y0) * H) / 3;
    for (let b = 0; b < 3; b++) for (let a = 0; a < 2; a++) g.rect(x0 + a * w + 8, y0 + b * h + 8, w - 16, h - 16);
  }
  g.stroke();
  if (M.skin === 'bronze') {
    const w = ((X1 - X0) * W) / 2, h = ((Y1 - Y0) * H) / 3; g.fillStyle = 'rgba(60,40,10,.35)'; g.beginPath();
    for (let b = 0; b < 3; b++) for (let a = 0; a < 2; a++) for (const [u, v] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { const cx2 = x0 + a * w + 14 + u * (w - 28), cy2 = y0 + b * h + 14 + v * (h - 28); g.moveTo(cx2 + 3.5, cy2); g.arc(cx2, cy2, 3.5, 0, 6.2832); }
    g.fill();
  }
}

const mk = (skin) => {
  const S = SKINS[skin];
  return { kind: 'cover', skin, topic: skin === 'gold' ? 'gold' : skin, n: S.n, kicker: S.kicker, hint: S.hint, howto: S.howto, step: 'craft', secs: [18, 30], fact: S.fact, guide: 2, draw,
    model: (o = {}) => model({ ...o, setup: { ...(o.setup || {}), skin } }) };
};
export const coverSkins = { gold: mk('gold'), plaster: mk('plaster'), bronze: mk('bronze') };
/** the gold is the face; ctx.skin (or the site) picks the plaster or the bronze */
export const cover = { ...coverSkins.gold, pick: (ctx = {}) => coverSkins[ctx.skin] || coverSkins[BY_SITE[ctx.site]] || coverSkins.gold };
