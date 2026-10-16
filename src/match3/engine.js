/* ─────────────────────────────────────────────────────────────────────────────
 * engine.js: the pure match-3 engine of "משחק האוצר" (no DOM, deterministic by seed).
 *
 *   const s = createBoard(spec, seed);          // spec from levels.js (shape, colours, goals, objects)
 *   const r = resolve(s, a, b, true);           // a swap of cells a,b → { ok, steps:[…] } (steps only when rec)
 *   hasMove(s) · hint(s) · reshuffle(s) · findMatches(s) · botMove(s, skill) · finale(s, rec) · goalsMet(s)
 *
 * Cells are indices i = r*C + c (row 0 is the top). Per cell (typed arrays):
 *   vd  1 = not part of the board (a hole; pieces fall through it)
 *   k   the piece: -1 empty · 0…5 a vessel kind · LIGHT · LOG (a cedar log) · ASHLAR (a dressed stone) · WSTONE (a whole
 *       field stone: gathered only by a match beside it, never by a tool — Middot 3:4)
 *   sp  0 · ROW (מקבת sweeps a row) · COL (אזמל sweeps a column) · AREA (יתד, 3×3) · SLIGHT (the light)
 *   bn  1 = a silver shekel rides on this vessel · lk vine layers (the piece is held and does not fall)
 *   bk  a blocker's layers (bedrock / a standing cedar / ore rock; the cell holds no piece)
 *   ea  earth layers under the piece · ng 1 = a gold nugget is hidden under that earth · id the piece's id (for the view)
 * Holy vessels are never destroyed: a matched vessel is "gathered" (it rises into the bar in light). Tools and wedges
 * act on stone, earth and wood; vessels in their path are gathered too.
 * ──────────────────────────────────────────────────────────────────────────── */
export const LIGHT = 8, LOG = 10, ASHLAR = 11, WSTONE = 12, NUGGET = 13;   // objects are k ≥ 10
export const isObj = (k) => k >= 10;
export const ROW = 1, COL = 2, AREA = 3, SLIGHT = 4;
export const KINDS = ['menorah', 'altar', 'jug', 'bread', 'pomegranate', 'trumpets'];
/* what each field's objects yield (the building material itself) */
export const YIELD = {
  quarry: { blk: 'stone', blkN: 1, obj: 'stone', objN: 1 },    // a bedrock layer → 1 stone · an ashlar → 1 (one board ≈ 2–4 of BUILD's segments)
  forest: { blk: 'cedar', blkN: 1, obj: 'cedar', objN: 2 },    // a cedar's layer → 1 · a log that reaches the sea → 2
  gold: { blk: 'bronze', blkN: 1, obj: 'gold', objN: 1, hidN: 2 },   // copper ore → 1 bronze · a loose nugget → 1 · one under earth → 2
};
const PTS = { v: 20, blk: 50, earth: 40, nug: 200, obj: 250, vine: 60, coin: 100, made: [0, 120, 120, 200, 300] };
const TALLY = ['stone', 'cedar', 'gold', 'silver', 'bronze', 'wstone', 'blk', 'blkx', 'earth', 'vine', 'log', 'ashlar', 'nugget', 'whole',
  'k0', 'k1', 'k2', 'k3', 'k4', 'k5', 'made', 'light', 'combo', 'cascade'];
const zeroTally = () => { const t = {}; for (const k of TALLY) t[k] = 0; return t; };

/* ── seeded random (mulberry32 over s.rs) ── */
export function rand(s) {
  let t = (s.rs = (s.rs + 0x6D2B79F5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export function hashSeed(...parts) {
  let h = 2166136261 >>> 0;
  for (const p of parts) for (const ch of String(p)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

/* ── state ── */
function blank(R, C) {
  const N = R * C;
  return {
    R, C, N, vd: new Uint8Array(N), k: new Int8Array(N).fill(-1), sp: new Uint8Array(N), bn: new Uint8Array(N),
    lk: new Uint8Array(N), bk: new Uint8Array(N), ea: new Uint8Array(N), ng: new Uint8Array(N), id: new Int32Array(N),
    nid: 1, rs: 1, colors: 5, moves: 0, used: 0, score: 0, t: zeroTally(), goals: [], field: 'quarry',
    obj: null, coin: 0, spawnN: 0, cascade: 0, mark: new Uint8Array(N), hitM: new Uint8Array(N),
  };
}
export function cloneState(s) {
  const o = Object.assign({}, s);
  for (const f of ['vd', 'k', 'sp', 'bn', 'lk', 'bk', 'ea', 'ng', 'id', 'mark', 'hitM']) o[f] = s[f].slice();
  o.t = Object.assign({}, s.t);
  o.goals = s.goals.map((g) => Object.assign({}, g));
  o.obj = s.obj ? Object.assign({}, s.obj) : null;
  return o;
}

/* spec: { field, rows:[strings], colors, moves, goals:[{t,n}], obj:{kind:'log'|'ashlar', total, max, every}, coin }
 * row chars: '.' cell · '#' hole · '1'-'3' blocker layers · 'e'/'E' earth 1/2 · 'n'/'N' a nugget under earth 1/2 ·
 *            'v' a vine on the vessel · 'a' a log/ashlar at start · 's' a silver shekel on the vessel */
export function createBoard(spec, seed) {
  const rows = spec.rows, R = rows.length, C = rows[0].length;
  const s = blank(R, C);
  s.rs = (seed >>> 0) || 1;
  s.field = spec.field || 'quarry';
  s.colors = spec.colors || 5;
  s.moves = spec.moves || 30;
  s.goals = (spec.goals || []).map((g) => ({ t: g.t, n: g.n }));
  s.obj = spec.obj ? { kind: spec.obj.kind === 'log' ? LOG : spec.obj.kind === 'wstone' ? WSTONE : spec.obj.kind === 'nugget' ? NUGGET : ASHLAR, left: spec.obj.total | 0, max: spec.obj.max || 2, every: spec.obj.every || 9 } : null;
  s.coin = spec.coin || 0;
  const objAt = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    const i = r * C + c, ch = rows[r][c] || '.';
    if (ch === '#') s.vd[i] = 1;
    else if (ch >= '1' && ch <= '3') s.bk[i] = ch.charCodeAt(0) - 48;
    else if (ch === 'e' || ch === 'E') s.ea[i] = ch === 'e' ? 1 : 2;
    else if (ch === 'n' || ch === 'N') { s.ea[i] = ch === 'n' ? 1 : 2; s.ng[i] = 1; }
    else if (ch === 'v') s.lk[i] = 1;
    else if (ch === 'a') objAt.push(i);
    else if (ch === 's') s.bn[i] = 1;
  }
  // earth "all" goals: count the layers
  for (const g of s.goals) if (g.n === 'all') g.n = g.t === 'earth' ? s.ea.reduce((a, b) => a + b, 0) : g.t === 'blk' ? s.bk.reduce((a, b) => a + b, 0) : 1;
  for (let i = 0; i < s.N; i++) {
    if (s.vd[i] || s.bk[i]) continue;
    if (objAt.includes(i) && s.obj) { s.k[i] = s.obj.kind; s.id[i] = s.nid++; continue; }
    s.k[i] = pickNoMatch(s, i);
    s.id[i] = s.nid++;
  }
  if (!hasMove(s) || findMatches(s).length) reshuffle(s);
  return s;
}
function pickNoMatch(s, i) {
  const C = s.C, r = (i / C) | 0, c = i % C;
  for (let tries = 0; tries < 20; tries++) {
    const k = (rand(s) * s.colors) | 0;
    const h = c >= 2 && colorAt(s, i - 1) === k && colorAt(s, i - 2) === k;
    const v = r >= 2 && colorAt(s, i - C) === k && colorAt(s, i - 2 * C) === k;
    if (!h && !v) return k;
  }
  return (rand(s) * s.colors) | 0;
}

/* ── queries ── */
export const colorAt = (s, i) => {
  if (s.vd[i] || s.bk[i]) return -1;
  const k = s.k[i];
  return k >= 0 && k < 6 ? k : -1;
};
const isPiece = (s, i) => !s.vd[i] && !s.bk[i] && s.k[i] >= 0;
const fixed = (s, i) => s.vd[i] || s.bk[i] || s.lk[i];                   // does not move
export function tallyOf(s, t) { return s.t[t] || 0; }
export function goalsMet(s) { return s.goals.length > 0 && s.goals.every((g) => tallyOf(s, g.t) >= g.n); }
export function goalLeft(s) { return s.goals.map((g) => ({ t: g.t, n: g.n, got: Math.min(g.n, tallyOf(s, g.t)), left: Math.max(0, g.n - tallyOf(s, g.t)) })); }
export const adjacent = (s, a, b) => {
  const ra = (a / s.C) | 0, rb = (b / s.C) | 0;
  return (ra === rb && Math.abs(a - b) === 1) || (a % s.C === b % s.C && Math.abs(ra - rb) === 1);
};
export function canSwap(s, a, b) {
  if (a === b || a < 0 || b < 0 || a >= s.N || b >= s.N || !adjacent(s, a, b)) return false;
  if (s.vd[a] || s.vd[b] || s.bk[a] || s.bk[b] || s.lk[a] || s.lk[b]) return false;
  return s.k[a] >= 0 && s.k[b] >= 0;
}

/* all runs of ≥3 same-colour vessels: [{d:0 row|1 col, k, cells:[…]}] (holes and blockers break a run) */
export function findRuns(s) {
  const { R, C } = s, runs = [];
  for (let r = 0; r < R; r++) {
    let c = 0;
    while (c < C) {
      const k = colorAt(s, r * C + c);
      if (k < 0) { c++; continue; }
      let e = c + 1;
      while (e < C && colorAt(s, r * C + e) === k) e++;
      if (e - c >= 3) { const cells = []; for (let x = c; x < e; x++) cells.push(r * C + x); runs.push({ d: 0, k, cells }); }
      c = e;
    }
  }
  for (let c = 0; c < C; c++) {
    let r = 0;
    while (r < R) {
      const k = colorAt(s, r * C + c);
      if (k < 0) { r++; continue; }
      let e = r + 1;
      while (e < R && colorAt(s, e * C + c) === k) e++;
      if (e - r >= 3) { const cells = []; for (let y = r; y < e; y++) cells.push(y * C + c); runs.push({ d: 1, k, cells }); }
      r = e;
    }
  }
  return runs;
}
/* runs grouped into shapes (an L/T is one group): [{k, cells:[…], runs:[…]}] */
export function findMatches(s) {
  const runs = findRuns(s);
  if (!runs.length) return [];
  const owner = new Map(), groups = [];
  for (const run of runs) {
    let g = null;
    for (const i of run.cells) { const o = owner.get(i); if (o && o.k === run.k) { g = o; break; } }
    if (!g) { g = { k: run.k, cells: [], runs: [] }; groups.push(g); }
    g.runs.push(run);
    for (const i of run.cells) { if (owner.get(i) !== g) { if (!owner.has(i)) g.cells.push(i); owner.set(i, g); } }
  }
  return groups;
}
/* the length of the same-colour line through i (row and column), assuming the piece at i were `k` */
function lineLen(s, i, k) {
  const C = s.C, r = (i / C) | 0, c = i % C;
  let h = 1, v = 1;
  for (let x = c - 1; x >= 0 && colorAt(s, r * C + x) === k; x--) h++;
  for (let x = c + 1; x < C && colorAt(s, r * C + x) === k; x++) h++;
  for (let y = r - 1; y >= 0 && colorAt(s, y * C + c) === k; y--) v++;
  for (let y = r + 1; y < s.R && colorAt(s, y * C + c) === k; y++) v++;
  return [h, v];
}
function swapCells(s, a, b) {
  for (const f of ['k', 'sp', 'bn', 'id']) { const x = s[f][a]; s[f][a] = s[f][b]; s[f][b] = x; }
}
export function isValidSwap(s, a, b) {
  if (!canSwap(s, a, b)) return false;
  const ka = s.k[a], kb = s.k[b];
  // a log rolls one row down the slope for a move (the forest's own move: bring the cedar to the sea)
  if ((ka === LOG && b === a + s.C && kb < 6) || (kb === LOG && a === b + s.C && ka < 6)) return true;
  if (isObj(ka) || isObj(kb)) {
    // an object moves only when the swap makes a match
    swapCells(s, a, b);
    const ok = matchThrough(s, a) || matchThrough(s, b);
    swapCells(s, a, b);
    return ok;
  }
  if (s.sp[a] && s.sp[b]) return true;                          // two specials: a combo
  if (s.sp[a] === SLIGHT || s.sp[b] === SLIGHT) return true;    // the light with any vessel
  swapCells(s, a, b);
  const ok = matchThrough(s, a) || matchThrough(s, b);
  swapCells(s, a, b);
  return ok;
}
function matchThrough(s, i) {
  const k = colorAt(s, i);
  if (k < 0) return false;
  const [h, v] = lineLen(s, i, k);
  return h >= 3 || v >= 3;
}
export function allMoves(s) {
  const out = [];
  for (let i = 0; i < s.N; i++) {
    const c = i % s.C;
    if (c + 1 < s.C && isValidSwap(s, i, i + 1)) out.push([i, i + 1]);
    if (i + s.C < s.N && isValidSwap(s, i, i + s.C)) out.push([i, i + s.C]);
  }
  return out;
}
export function hasMove(s) {
  for (let i = 0; i < s.N; i++) {
    const c = i % s.C;
    if (c + 1 < s.C && isValidSwap(s, i, i + 1)) return true;
    if (i + s.C < s.N && isValidSwap(s, i, i + s.C)) return true;
  }
  return false;
}

/* ── the step recorder (the view replays it; the bots pass rec=false) ── */
function newStep(s) {
  return { c: s.cascade, gone: [], made: [], blasts: [], hits: [], earth: [], vines: [], res: {}, pts: 0, fall: [], spawn: [], exit: [] };
}
function gain(s, st, res, n) {
  if (!res || !n) return;
  s.t[res] += n;
  if (st) st.res[res] = (st.res[res] || 0) + n;
}
function addPts(s, st, n) { s.score += n; if (st) st.pts += n; }

/* one hit on a blocker: a layer comes off and yields the field's material */
function hitBlock(s, st, i) {
  if (!s.bk[i]) return;
  s.bk[i]--;
  s.t.blk++;
  gain(s, st, YIELD[s.field].blk, YIELD[s.field].blkN);
  addPts(s, st, PTS.blk);
  if (!s.bk[i]) s.t.blkx++;
  if (st) st.hits.push([i, s.bk[i]]);
}
function clearEarth(s, st, i) {
  if (!s.ea[i]) return;
  s.ea[i]--;
  s.t.earth++;
  addPts(s, st, PTS.earth);
  let nug = 0;
  if (!s.ea[i] && s.ng[i]) { s.ng[i] = 0; s.t.nugget++; gain(s, st, 'gold', YIELD.gold.hidN); addPts(s, st, PTS.nug); nug = 1; }
  if (st) st.earth.push([i, s.ea[i], nug]);
}
function collectObj(s, st, i, why) {
  const k = s.k[i];
  if (k === ASHLAR) { s.t.ashlar++; gain(s, st, 'stone', YIELD.quarry.objN); }
  else if (k === LOG) { s.t.log++; gain(s, st, 'cedar', YIELD.forest.objN); }
  else if (k === WSTONE) { s.t.whole++; gain(s, st, 'wstone', 1); }
  else if (k === NUGGET) { s.t.nugget++; gain(s, st, 'gold', YIELD.gold.objN); }
  addPts(s, st, PTS.obj);
  if (st) st.gone.push([s.id[i], i, k, 0, why]);
  s.k[i] = -1; s.sp[i] = 0; s.bn[i] = 0; s.id[i] = 0;
}
/* a vessel leaves the board in light: gathered into the bar */
function gather(s, st, i, why) {
  const k = s.k[i];
  if (k >= 0 && k < 6) s.t['k' + k]++;
  if (s.bn[i]) { gain(s, st, 'silver', 1); addPts(s, st, PTS.coin); }
  addPts(s, st, PTS.v * Math.max(1, s.cascade));
  if (st) st.gone.push([s.id[i], i, k, s.bn[i], why]);
  s.k[i] = -1; s.sp[i] = 0; s.bn[i] = 0; s.id[i] = 0;
}

/* a blast (tool / wedge / light / combo) touches cell j: stone, earth and wood are worked; vessels rise; objects: ashlar
 * is collected, a log is untouched (it must reach the sea). Specials in the path join the queue. */
function blastCell(s, st, j, queue) {
  if (j < 0 || j >= s.N || s.vd[j]) return;
  if (s.bk[j]) { hitBlock(s, st, j); return; }
  if (s.mark[j]) return;
  s.mark[j] = 1;
  clearEarth(s, st, j);
  if (s.lk[j]) { s.lk[j]--; s.t.vine++; addPts(s, st, PTS.vine); if (st) st.vines.push(j); return; }
  const k = s.k[j];
  if (k < 0 || k === LOG || k === WSTONE) return;               // a log must reach the sea; no iron touches a whole stone
  if (k === ASHLAR || k === NUGGET) { collectObj(s, st, j, 'b'); return; }
  if (s.sp[j]) { queue.push([j, s.sp[j], k]); return; }
  gather(s, st, j, 'b');
}
function mostCommonColor(s) {
  const n = new Array(6).fill(0);
  for (let i = 0; i < s.N; i++) { const k = colorAt(s, i); if (k >= 0 && !s.lk[i]) n[k]++; }
  let best = 0; for (let k = 1; k < 6; k++) if (n[k] > n[best]) best = k;
  return best;
}
/* fire the queued specials (breadth first; each fires once) */
function fireQueue(s, st, queue) {
  while (queue.length) {
    const [i, sp, k, arg] = queue.shift();
    const C = s.C, r = (i / C) | 0, c = i % C;
    if (st) st.blasts.push([i, sp, k, arg == null ? -1 : arg]);
    // the special itself leaves in light
    if (s.k[i] >= 0 && !isObj(s.k[i]) && s.sp[i] === sp) { s.mark[i] = 1; clearEarth(s, st, i); gather(s, st, i, 'b'); }
    if (sp === ROW) for (let x = 0; x < C; x++) blastCell(s, st, r * C + x, queue);
    else if (sp === COL) for (let y = 0; y < s.R; y++) blastCell(s, st, y * C + c, queue);
    else if (sp === AREA) {
      const rad = arg === 2 ? 2 : 1;
      for (let y = r - rad; y <= r + rad; y++) for (let x = c - rad; x <= c + rad; x++) if (y >= 0 && y < s.R && x >= 0 && x < C) blastCell(s, st, y * C + x, queue);
    } else if (sp === SLIGHT) {
      const target = arg != null && arg >= 0 ? arg : mostCommonColor(s);
      for (let j = 0; j < s.N; j++) if (colorAt(s, j) === target) blastCell(s, st, j, queue);
    }
  }
}

/* ── gravity: pieces fall through holes, stop on blockers and held (vine) pieces, slide diagonally under them;
 *    new pieces enter at the top of each open column ── */
function spawnKind(s) {
  s.spawnN++;
  const o = s.obj;
  if (o && o.left > 0 && s.spawnN >= o.every) {
    let on = 0;
    for (let i = 0; i < s.N; i++) if (s.k[i] === o.kind) on++;
    if (on < o.max) { s.spawnN = 0; o.left--; return [o.kind, 0]; }
  }
  const k = (rand(s) * s.colors) | 0;
  const bn = s.coin && rand(s) < s.coin ? 1 : 0;
  return [k, bn];
}
function gravity(s, st) {
  const { R, C } = s;
  for (let guard = 0; guard < 200; guard++) {
    // vertical compaction per column segment
    for (let c = 0; c < C; c++) {
      let r = R - 1;
      while (r >= 0) {
        // a segment: from r upward until a fixed cell (blocker / vine) or the top
        const cells = [];
        let y = r;
        while (y >= 0) {
          const i = y * C + c;
          if (s.vd[i]) { y--; continue; }
          if (s.bk[i] || s.lk[i]) break;
          cells.push(i);
          y--;
        }
        const top = y < 0;                     // open to the sky: new pieces enter here
        // compact: pieces to the bottom of the segment
        let w = 0;
        for (let q = 0; q < cells.length; q++) {
          const i = cells[q];
          if (s.k[i] >= 0) {
            const to = cells[w];
            if (to !== i) {
              s.k[to] = s.k[i]; s.sp[to] = s.sp[i]; s.bn[to] = s.bn[i]; s.id[to] = s.id[i];
              if (st) st.fall.push([s.id[i], i, to]);
              s.k[i] = -1; s.sp[i] = 0; s.bn[i] = 0; s.id[i] = 0;
            }
            w++;
          }
        }
        if (top) {
          let drop = 1;
          for (let q = w; q < cells.length; q++) {
            const i = cells[q];
            const [k, bn] = spawnKind(s);
            s.k[i] = k; s.sp[i] = 0; s.bn[i] = bn; s.id[i] = s.nid++;
            if (st) st.spawn.push([s.id[i], i, k, 0, bn, drop++]);
          }
        }
        r = y - 1;
      }
    }
    // a diagonal slide into the top-most empty cell of a closed segment
    let slid = false;
    for (let r = R - 1; r >= 1 && !slid; r--) {
      for (let c = 0; c < C && !slid; c++) {
        const i = r * C + c;
        if (s.vd[i] || s.bk[i] || s.k[i] >= 0) continue;
        // is anything above in this segment? (then it is not the top empty cell)
        let y = r - 1, above = -1;
        while (y >= 0 && s.vd[y * C + c]) y--;
        if (y >= 0) above = y * C + c;
        if (above >= 0 && !s.bk[above] && !s.lk[above]) continue;
        const order = (r + c) & 1 ? [-1, 1] : [1, -1];
        for (const dc of order) {
          const x = c + dc;
          if (x < 0 || x >= C) continue;
          const j = (r - 1) * C + x;
          if (s.vd[j] || s.bk[j] || s.lk[j] || s.k[j] < 0) continue;
          s.k[i] = s.k[j]; s.sp[i] = s.sp[j]; s.bn[i] = s.bn[j]; s.id[i] = s.id[j];
          if (st) st.fall.push([s.id[j], j, i]);
          s.k[j] = -1; s.sp[j] = 0; s.bn[j] = 0; s.id[j] = 0;
          slid = true;
          break;
        }
      }
    }
    if (!slid) {
      // logs that reached the bottom of their column float away to the sea (Ezra 3:7)
      let out = false;
      for (let c = 0; c < C; c++) {
        let r = R - 1;
        while (r >= 0 && s.vd[r * C + c]) r--;
        if (r < 0) continue;
        const i = r * C + c;
        if (s.k[i] === LOG) { if (st) st.exit.push([s.id[i], i]); collectObj(s, null, i, 'x'); if (st) { st.res.cedar = (st.res.cedar || 0) + YIELD.forest.objN; st.gone.push([0, i, LOG, 0, 'x']); } out = true; }
      }
      if (!out) return;
    }
  }
}

/* ── one match pass: clear the groups, make specials, touch neighbours ── */
function matchPass(s, st, groups, prefer) {
  const queue = [];
  const made = [];
  for (const g of groups) {
    const long = g.runs.some((r) => r.cells.length >= 5);
    const cross = g.runs.some((r) => r.d === 0) && g.runs.some((r) => r.d === 1);
    const four = g.runs.find((r) => r.cells.length === 4);
    let spec = long ? SLIGHT : cross ? AREA : four ? (four.d === 0 ? ROW : COL) : 0;
    let pivot = -1;
    if (spec) {
      const ok = (i) => !s.lk[i] && !s.sp[i];
      for (const p of prefer) if (g.cells.includes(p) && ok(p)) { pivot = p; break; }
      if (pivot < 0 && cross) {
        const h = g.runs.filter((r) => r.d === 0), v = g.runs.filter((r) => r.d === 1);
        for (const a of h) for (const b of v) for (const i of a.cells) if (b.cells.includes(i) && ok(i) && pivot < 0) pivot = i;
      }
      if (pivot < 0) {
        const run = g.runs.slice().sort((a, b) => b.cells.length - a.cells.length)[0];
        const mid = run.cells[(run.cells.length / 2) | 0];
        pivot = ok(mid) ? mid : (run.cells.find(ok) ?? -1);
      }
      if (pivot < 0) spec = 0;
    }
    for (const i of g.cells) {
      if (s.mark[i]) continue;
      s.mark[i] = 1;
      clearEarth(s, st, i);
      // neighbours: a blocker takes one layer per pass; an ashlar beside the match is collected
      const r = (i / s.C) | 0, c = i % s.C;
      const nb = [r > 0 ? i - s.C : -1, r < s.R - 1 ? i + s.C : -1, c > 0 ? i - 1 : -1, c < s.C - 1 ? i + 1 : -1];
      for (const j of nb) {
        if (j < 0 || s.vd[j]) continue;
        if (s.bk[j] && !s.hitM[j]) { s.hitM[j] = 1; hitBlock(s, st, j); }
        else if (s.k[j] === ASHLAR || s.k[j] === WSTONE || s.k[j] === NUGGET) collectObj(s, st, j, 'a');
      }
      if (s.lk[i]) { s.lk[i]--; s.t.vine++; addPts(s, st, PTS.vine); if (st) st.vines.push(i); continue; }
      if (i === pivot) continue;
      if (s.sp[i]) { queue.push([i, s.sp[i], s.k[i]]); continue; }
      gather(s, st, i, 'm');
    }
    if (spec && pivot >= 0) {
      s.sp[pivot] = spec;
      if (spec === SLIGHT) s.k[pivot] = LIGHT;
      s.t.made++;
      if (spec === SLIGHT) s.t.light++;
      addPts(s, st, PTS.made[spec]);
      made.push([s.id[pivot], pivot, spec, s.k[pivot]]);
      if (s.bn[pivot]) { gain(s, st, 'silver', 1); s.bn[pivot] = 0; }
    }
  }
  if (st) st.made.push(...made);
  fireQueue(s, st, queue);
}

/* the swap of two specials, or the light with a vessel */
function comboSwap(s, st, a, b) {
  const sa = s.sp[a], sb = s.sp[b];
  const C = s.C, r = (b / C) | 0, c = b % C;
  const queue = [];
  const take = (i) => { if (s.k[i] >= 0) { s.mark[i] = 1; clearEarth(s, st, i); gather(s, st, i, 'b'); } };
  s.t.combo++;
  if (sa === SLIGHT && sb === SLIGHT) {
    if (st) st.blasts.push([b, SLIGHT, LIGHT, 99]);
    take(a); take(b);
    for (let j = 0; j < s.N; j++) {
      if (s.vd[j]) continue;
      if (s.bk[j]) { hitBlock(s, st, j); continue; }
      if (s.mark[j]) continue;
      s.mark[j] = 1;
      clearEarth(s, st, j);
      if (s.lk[j]) { s.lk[j]--; s.t.vine++; if (st) st.vines.push(j); continue; }
      if (s.k[j] === ASHLAR || s.k[j] === NUGGET) collectObj(s, st, j, 'b');
      else if (s.k[j] >= 0 && !isObj(s.k[j])) gather(s, st, j, 'l');
    }
    return;
  }
  if (sa === SLIGHT || sb === SLIGHT) {
    const li = sa === SLIGHT ? a : b, other = li === a ? b : a;
    const ok = s.k[other], osp = s.sp[other];
    if (st) st.blasts.push([li, SLIGHT, LIGHT, ok]);
    take(li);
    if (!osp) { fireQueue(s, st, [[other, SLIGHT, LIGHT, ok]]); blastCell(s, st, other, queue); fireQueue(s, st, queue); return; }
    // every vessel of that colour becomes the same kind of special, then all of them fire
    const list = [];
    for (let j = 0; j < s.N; j++) {
      if (colorAt(s, j) !== ok || s.lk[j]) continue;
      if (!s.sp[j]) s.sp[j] = osp === AREA ? AREA : (rand(s) < 0.5 ? ROW : COL);
      if (st) st.made.push([s.id[j], j, s.sp[j], ok]);
      list.push([j, s.sp[j], ok]);
    }
    fireQueue(s, st, list);
    return;
  }
  // two tools / wedges
  const area = (sa === AREA) + (sb === AREA);
  take(a); take(b);
  if (st) st.blasts.push([b, area === 2 ? AREA : area === 1 ? 5 : 6, -1, -1]);
  if (area === 2) { for (let y = r - 2; y <= r + 2; y++) for (let x = c - 2; x <= c + 2; x++) if (y >= 0 && y < s.R && x >= 0 && x < C) blastCell(s, st, y * C + x, queue); }
  else if (area === 1) {
    for (let d = -1; d <= 1; d++) {
      if (r + d >= 0 && r + d < s.R) for (let x = 0; x < C; x++) blastCell(s, st, (r + d) * C + x, queue);
      if (c + d >= 0 && c + d < C) for (let y = 0; y < s.R; y++) blastCell(s, st, y * C + c + d, queue);
    }
  } else {
    for (let x = 0; x < C; x++) blastCell(s, st, r * C + x, queue);
    for (let y = 0; y < s.R; y++) blastCell(s, st, y * C + c, queue);
  }
  fireQueue(s, st, queue);
}

/* ── a move: swap a and b; cascades until the board is still ── */
export function resolve(s, a, b, rec = false) {
  if (!isValidSwap(s, a, b)) return { ok: false, steps: [] };
  const steps = [];
  s.cascade = 1;
  const begin = () => { s.mark.fill(0); s.hitM.fill(0); const st = rec ? newStep(s) : null; if (st) steps.push(st); return st; };
  swapCells(s, a, b);
  let st = begin();
  if (st) st.swap = [a, b];
  const combo = (s.sp[a] && s.sp[b]) || s.sp[a] === SLIGHT || s.sp[b] === SLIGHT;
  if (combo && !isObj(s.k[a]) && !isObj(s.k[b])) {
    comboSwap(s, st, a, b);           // the combo goes off where the player moved the piece: at b
    gravity(s, st);
  } else {
    const groups = findMatches(s);
    matchPass(s, st, groups, [b, a]);
    gravity(s, st);
  }
  for (let guard = 0; guard < 60; guard++) {
    const groups = findMatches(s);
    if (!groups.length) break;
    s.cascade++;
    s.t.cascade = Math.max(s.t.cascade, s.cascade);
    st = begin();
    matchPass(s, st, groups, []);
    gravity(s, st);
  }
  s.moves--;
  s.used++;
  if (!goalsMet(s) && s.moves > 0 && !hasMove(s)) {
    const sh = reshuffle(s);
    if (rec) { const x = newStep(s); x.shuffle = sh; steps.push(x); }
  }
  return { ok: true, steps };
}

/* no move left: the plain vessels trade places (specials, objects and held pieces stay) until a move exists */
export function reshuffle(s) {
  const cells = [];
  for (let i = 0; i < s.N; i++) if (isPiece(s, i) && !s.lk[i] && !s.sp[i] && s.k[i] < 6) cells.push(i);
  const kinds = cells.map((i) => [s.k[i], s.bn[i], s.id[i]]);
  for (let tries = 0; tries < 60; tries++) {
    for (let q = kinds.length - 1; q > 0; q--) { const j = (rand(s) * (q + 1)) | 0; const x = kinds[q]; kinds[q] = kinds[j]; kinds[j] = x; }
    cells.forEach((i, q) => { s.k[i] = kinds[q][0]; s.bn[i] = kinds[q][1]; s.id[i] = kinds[q][2]; });
    if (!findMatches(s).length && hasMove(s)) return cells.map((i) => [s.id[i], i]);
  }
  // re-roll colours (a tiny or crowded board)
  for (let tries = 0; tries < 200; tries++) {
    for (const i of cells) s.k[i] = pickNoMatch(s, i);
    if (!findMatches(s).length && hasMove(s)) break;
  }
  if (!hasMove(s)) forceMove(s, cells);
  return cells.map((i) => [s.id[i], i]);
}
function forceMove(s, cells) {
  // make a move by hand: x x . x in a row
  const set = new Set(cells);
  for (const i of cells) {
    const c = i % s.C;
    if (c + 3 < s.C && set.has(i + 1) && set.has(i + 2) && set.has(i + 3)) {
      const k = s.k[i] === 0 ? 1 : 0;
      s.k[i] = k; s.k[i + 1] = k; s.k[i + 3] = k;
      s.k[i + 2] = (k + 2) % s.colors;
      if (findMatches(s).length) continue;
      if (hasMove(s)) return;
    }
  }
}

/* ── the bots and the hint: a quick look at a swap, the way a player sees it (no cascades) ── */
export function evalSwap(s, a, b) {
  const sa = s.sp[a], sb = s.sp[b];
  let v = 0;
  const lg = s.k[a] === LOG ? a : s.k[b] === LOG ? b : -1;
  if (lg >= 0) v += 2 + 1.2 * (((Math.max(a, b) / s.C) | 0) + 1);   // rolling a log down: worth more near the sea
  if ((sa && sb) || sa === SLIGHT || sb === SLIGHT) {
    v = 30 + (sa === SLIGHT || sb === SLIGHT ? 25 : 0) + (sa && sb ? 20 : 0);
    return v;
  }
  swapCells(s, a, b);
  for (const i of [a, b]) {
    const k = colorAt(s, i);
    if (k < 0) continue;
    const [h, vv] = lineLen(s, i, k);
    const n = (h >= 3 ? h : 0) + (vv >= 3 ? vv : 0);
    if (!n) continue;
    v += n;
    if (h >= 5 || vv >= 5) v += 14; else if (h >= 3 && vv >= 3) v += 9; else if (h === 4 || vv === 4) v += 6;
    // goal work around the line: blockers, earth, vines, ashlar, specials that will fire, logs above
    const C = s.C, r = (i / C) | 0, c = i % C;
    const cells = [];
    if (h >= 3) { let x = c; while (x > 0 && colorAt(s, r * C + x - 1) === k) x--; for (let q = 0; q < h; q++) cells.push(r * C + x + q); }
    if (vv >= 3) { let y = r; while (y > 0 && colorAt(s, (y - 1) * C + c) === k) y--; for (let q = 0; q < vv; q++) cells.push((y + q) * C + c); }
    for (const j of cells) {
      if (s.ea[j]) v += 3 + (s.ng[j] && s.ea[j] === 1 ? 4 : 0);
      if (s.lk[j]) v += 3;
      if (s.sp[j] && j !== i) v += 8;
      const jr = (j / C) | 0, jc = j % C;
      for (const q of [jr > 0 ? j - C : -1, jr < s.R - 1 ? j + C : -1, jc > 0 ? j - 1 : -1, jc < C - 1 ? j + 1 : -1]) {
        if (q < 0 || s.vd[q]) continue;
        if (s.bk[q]) v += 4; else if (s.k[q] === ASHLAR || s.k[q] === WSTONE || s.k[q] === NUGGET) v += 5;
      }
      for (let y = jr - 1; y >= 0; y--) { const q = y * C + jc; if (s.bk[q]) break; if (s.k[q] === LOG) { v += 3 + y; break; } }   // a log comes down, the more so near the sea
    }
    v += r * 0.15;
  }
  swapCells(s, a, b);
  return v;
}
/** (wave 7, FUN) the first board of a field opens with a four-in-a-row one swap away, in the middle rows, so the first tool
 *  of the game comes in its first seconds (the hint points at it: it is the best swap). Returns [a, b] or null. */
export function plantFour(s) {
  const R = s.R, C = s.C, ok = (i) => i >= 0 && i < s.N && !s.vd[i] && !s.bk[i] && !s.lk[i] && s.k[i] >= 0 && s.k[i] < 6 && !s.sp[i];
  const save = Array.from(s.k), back = () => { for (let i = 0; i < s.N; i++) s.k[i] = save[i]; };
  const rows = []; for (let d = 0; d < R; d++) { const r = (R >> 1) + (d % 2 ? -((d + 1) >> 1) : d >> 1); if (r >= 1 && r < R - 1) rows.push(r); }
  for (const r of rows) for (let c0 = 0; c0 + 3 < C; c0++) {
    const c = (c0 + ((C - 4) >> 1)) % (C - 3);
    const row = [0, 1, 2, 3].map((d) => r * C + c + d), dn = (r + 1) * C + c + 2;
    if (!row.every(ok) || !ok(dn)) continue;
    for (let K = 0; K < s.colors; K++) {
      s.k[row[0]] = K; s.k[row[1]] = K; s.k[row[3]] = K; s.k[dn] = K; s.k[row[2]] = (K + 1 + ((r + c) % (s.colors - 1))) % s.colors;
      if (!findMatches(s).length && isValidSwap(s, row[2], dn) && hasMove(s)) return [row[2], dn];
      back();
    }
  }
  return null;
}
export function hint(s) {
  let best = null, bv = -1;
  for (const [a, b] of allMoves(s)) { const v = evalSwap(s, a, b); if (v > bv) { bv = v; best = [a, b]; } }
  return best;
}
/* skill 0…1: 1 always takes the best quick look; lower picks among the top few (a typical player) */
export function botMove(s, skill = 0.7, rnd = Math.random) {
  const moves = allMoves(s);
  if (!moves.length) return null;
  const scored = moves.map(([a, b]) => [evalSwap(s, a, b) + rnd() * (1 - skill) * 6, a, b]).sort((x, y) => y[0] - x[0]);
  const pick = rnd() < skill ? 0 : Math.min(scored.length - 1, (rnd() * 3) | 0);
  return [scored[pick][1], scored[pick][2]];
}

/* the level is won: every move left becomes a tool that sweeps a line (the builders' blessing), then the board settles */
export function finale(s, rec = false, cap = 10) {
  const steps = [];
  const n = Math.max(0, s.moves), rounds = Math.min(cap, n), per = rounds ? Math.ceil(n / rounds) : 0;   // EVERY move left becomes a tool (≤ cap rounds)
  s.cascade = 1;
  for (let q = 0; q < rounds && s.moves > 0; q++) {
    s.mark.fill(0); s.hitM.fill(0);
    const st = rec ? newStep(s) : null;
    if (st) steps.push(st);
    const pool = [];
    for (let i = 0; i < s.N; i++) if (colorAt(s, i) >= 0 && !s.sp[i] && !s.lk[i]) pool.push(i);
    if (!pool.length) break;
    const fire = [];
    for (let j = 0; j < per && pool.length && s.moves - j > 0; j++) {
      const i = pool.splice((rand(s) * pool.length) | 0, 1)[0];
      s.sp[i] = rand(s) < 0.5 ? ROW : COL;
      if (st) st.made.push([s.id[i], i, s.sp[i], s.k[i]]);
      addPts(s, st, 300);
      fire.push([i, s.sp[i], s.k[i]]);
    }
    s.moves -= fire.length - 1;
    fireQueue(s, st, fire);
    gravity(s, st);
    for (let guard = 0; guard < 30; guard++) {
      const groups = findMatches(s);
      if (!groups.length) break;
      s.mark.fill(0); s.hitM.fill(0);
      const st2 = rec ? newStep(s) : null;
      if (st2) steps.push(st2);
      matchPass(s, st2, groups, []);
      gravity(s, st2);
    }
    s.moves--;
  }
  // specials still on the board fire too
  s.mark.fill(0); s.hitM.fill(0);
  const q = [];
  for (let i = 0; i < s.N; i++) if (s.sp[i] && s.k[i] >= 0) q.push([i, s.sp[i], s.k[i]]);
  if (q.length) {
    const st = rec ? newStep(s) : null;
    if (st) steps.push(st);
    fireQueue(s, st, q);
    gravity(s, st);
  }
  return steps;
}

/* play a whole level with the bot (pure, fast): → { won, moves, used, score, t } */
export function playBot(spec, seed, skill = 0.7, hand = 0) {
  const s = createBoard(spec, seed);
  let r = (hashSeed('hand', seed, hand) ^ 0x9E3779B9) >>> 0;
  const rnd = () => { r = (r + 0x6D2B79F5) >>> 0; let t = Math.imul(r ^ (r >>> 15), r | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  for (let guard = 0; s.moves > 0 && !goalsMet(s) && guard < 400; guard++) {
    const m = botMove(s, skill, rnd);
    if (!m) { reshuffle(s); if (!hasMove(s)) break; continue; }
    resolve(s, m[0], m[1], false);
  }
  const won = goalsMet(s);
  const left = s.moves;
  if (won) finale(s, false);
  return { won, used: s.used, left, score: s.score, t: s.t, s };
}
