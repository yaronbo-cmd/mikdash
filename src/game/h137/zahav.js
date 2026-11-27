/* ── build 137 ── h137/zahav.js — work 3 "הזהבת המים והדלתות", the act (spec docs/specs/shlav-14-he.md v3, עבודה 3; the model
 * zahav-model.js). Inside the Heichal, on the scaffold before a wall (BOOK.s14.zahav: level 1 the north wall, 2 the east wall round the
 * opening, 3 the south wall). The wall's band at eye height is cut into segments (280 × 120 dp on the screen: 2.8 × 1.2 m, a metre 100
 * dp); one fixed view per segment, square to the wall; it moves on only with no finger down.
 *   · the work hand's tool changes by itself, in order: the broad brush (wet the segment: the wet shine must close, no puddle), the
 *     gilder's tip (a touch on the cushion lifts a leaf; one motion to its slot and release, no pulling back), the agate (short strokes
 *     until the whole segment shines). The three tools' places by the cushion: the active one glows. No buttons.
 *   · the helper: level 1 — a second finger near the held leaf steadies its corner against the opening's draught (+10); levels 2–3 —
 *     the wooden mask on its track along the border of "אחר הדלתות", moved before wetting or laying there; it stays where it is left.
 * Juice: the leaf flutters and settles at once, matte to deep gold cell by cell under the agate, its soft hiss, the shine. */
import { BOOK } from '../world/grid.js';
import * as K from './zahav-model.js';
import { WORDS } from './model.js';
import { mats14, box } from './look.js';
import { award, extra, hurt, finish, V3, lens, voices14, ring, HANDS, dp, fingers } from './kit14.js';

const S14 = BOOK.s14, ZB = S14.zahav, ZH = K.ZH;
export const ZT = Object.freeze({ FOV: 40, MASK: 56, STEADY: 90, CUSH: 64, Y: 34 });
const M_DP = 0.01, RAD = Math.PI / 180;

function make(m, X) {
  const T = X.THREE, Mo = X.M, lv = m.lv | 0 || 1, V = voices14(X), Mt = mats14(X);
  const root = new T.Group(); root.name = 'h137-zahav-act'; X.props.root.add(root);
  const A = { t: 0, ev: [], ended: false, finished: false, busy: 0, work: null, mask: null, steady: null, cushion: null, camKey: '', settle: [] };
  const ev = (e) => { A.ev.push(e); if (A.ev.length > 30) A.ev.shift(); };
  const b0 = Mo.workOf(m.k);
  let S = b0 && b0.id === m.id ? K.load(b0) : null; if (S && S.lv !== lv) S = null; const resumed = !!S;
  if (!S) S = K.fresh(lv);
  let k0 = ''; const keep = () => { const b = K.save(S, m.id), k = JSON.stringify(b); if (k === k0) return; k0 = k; Mo.keep(m.k, b); X.save(); };
  // ── the wall and its band: segments side by side, centred on the wall; a segment's frame (dp: x along, y up) → the world
  const W = ZB[S.P.wall], N = S.P.segs.length, SW = ZH.W * M_DP, SH = ZH.H * M_DP;
  const along = W.axis === 'x' ? [1, 0] : [0, 1];
  const nrm = W.normal, mid = (W.a0 + W.a1) / 2, a0 = mid - N * SW / 2, yb = ZT.Y - SH / 2;
  // level 2 (the east wall): the inner leaves, open 180°, cover the wall from the floor to their tops (BOOK: line) on both sides of the
  // opening, so the band runs along the leaves' tops: a border segment straddles the line (its share below it = "אחר הדלתות", the
  // height its plank was set at), and the mask is a horizontal rule slid up and down onto the line (Middot 4:1; build 137 review)
  const horiz = lv === 2 && W.line != null, LINE = W.line;
  const ybOf = (i) => (!horiz ? yb : S.P.segs[i] && S.P.segs[i].border ? LINE - S.P.segs[i].border * SH : LINE + 0.25);
  // the frame's "along" runs left to right as he faces the wall: flip when the wall's axis runs the other way on his screen
  const flip = (W.axis === 'x' ? nrm[1] < 0 : nrm[0] > 0) ? -1 : 1;
  const wallPt = (i, x, y, off = 0.02) => { const s = a0 + (flip > 0 ? i * SW + x * M_DP : (N - i) * SW - x * M_DP); const p = W.axis === 'x' ? [s, W.face] : [W.face, s]; return [p[0] + nrm[0] * off, ybOf(i) + y * M_DP, p[1] + nrm[1] * off]; };
  const faceRot = Math.atan2(nrm[0], nrm[1]);   // (a plane facing out of the wall)
  const quad = (mat, i, x0, y0, x1, y1, off = 0.02) => { const q = new T.Mesh(new T.PlaneGeometry(Math.abs(x1 - x0) * M_DP, Math.abs(y1 - y0) * M_DP), mat); const c = wallPt(i, (x0 + x1) / 2, (y0 + y1) / 2, off); q.position.set(c[0], c[1], c[2]); q.rotation.y = faceRot; root.add(q); return q; };
  // the wall itself (white stone), the band of bole on gesso, the scaffold's deck under him
  { const L = W.a1 - W.a0, c = W.axis === 'x' ? [mid, W.face] : [W.face, mid]; const wl = new T.Mesh(new T.PlaneGeometry(L, 14), Mt.y14stone); wl.position.set(c[0] + nrm[0] * 0.01, horiz ? LINE + 1 : ZT.Y, c[1] + nrm[1] * 0.01); wl.rotation.y = faceRot; root.add(wl);
    const deck = box(X, Mt.y14wood, -2, 0, -1.5, 2, 0.2, 1.5, root); deck.scale.set(W.axis === 'x' ? N * SW + 2 : 3, 0.2, W.axis === 'x' ? 3 : N * SW + 2); deck.position.set(c[0] + nrm[0] * 1.6, (horiz ? LINE - SH : yb) - 1.6, c[1] + nrm[1] * 1.6); }
  const segG = [];
  const wetQ = [], burnQ = [], leafQ = [];
  for (let i = 0; i < N; i++) {
    quad(Mt.y14bole, i, 0, 0, ZH.W, ZH.H, 0.015);
    const wq = [], bq = [];
    for (let r = 0; r < ZH.ROWS; r++) for (let c = 0; c < ZH.COLS; c++) {
      const x0 = c * ZH.W / ZH.COLS, y0 = r * ZH.H / ZH.ROWS, x1 = x0 + ZH.W / ZH.COLS, y1 = y0 + ZH.H / ZH.ROWS;
      const w = quad(Mt.y14wet, i, x0, y0, x1, y1, 0.02); w.visible = false; wq.push(w);
      const b = quad(Mt.y14gold.clone(), i, x0, y0, x1, y1, 0.035); b.visible = false; b.material.transparent = true; b.material.opacity = 0; bq.push(b);
    }
    wetQ.push(wq); burnQ.push(bq); leafQ.push([]); segG.push(i);
  }
  // level 3's carving: the grooves of each carved segment (dark until the tamping brush presses the leaf into them, then bright)
  const grooves = new Map();
  const grooveM = new T.MeshBasicMaterial({ color: '#4A2A12' }), groovePressed = new T.MeshBasicMaterial({ color: '#FFE08A' }), creaseM = new T.MeshBasicMaterial({ color: '#5A3A1A' });
  for (let i = 0; i < N; i++) {
    const name = S.P.segs[i].relief; if (!name) continue;
    const pieces = []; let j0 = 0;
    for (const line of K.MOTIF[name]) for (let q = 0; q < line.length - 1; q++) {
      const [ax, ay] = line[q], [bx, by] = line[q + 1], L = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.round(L / 4));
      const m = new T.Mesh(new T.PlaneGeometry(L * M_DP + 0.02, 0.05), grooveM); const c = wallPt(i, (ax + bx) / 2, (ay + by) / 2, 0.033);
      m.position.set(c[0], c[1], c[2]); m.rotation.set(0, faceRot, Math.atan2(by - ay, bx - ax)); root.add(m); pieces.push({ m, j0, j1: j0 + n }); j0 += n;
    }
    grooves.set(i, pieces);
  }
  // the border of "אחר הדלתות" (levels 2–3): a hatched strip past each border segment's line, and the mask on its track under the band
  const track = { y: -16 };
  const borders = [];
  const ghostM = new T.MeshBasicMaterial({ color: '#7A4A26', transparent: true, opacity: 0.7, depthWrite: false });   // (the leaves' place, swung away)
  if (horiz) for (let i = 0; i < N; i++) { const g = S.P.segs[i]; if (!g.border) { quad(ghostM, i, -2, -70, ZH.W + 2, -25, 0.04); continue; } const y = g.border * ZH.H; const z = quad(ghostM, i, -2, -70, ZH.W + 2, y, 0.04); const l = quad(Mt.y14scar, i, -6, y - 1.2, ZH.W + 6, y + 1.2, 0.05); borders.push({ i, x: y, z, l }); }
  else for (let i = 0; i < N; i++) { const g = S.P.segs[i]; if (!g.border) continue; const x = (g.border * N - i) * ZH.W, side = g.border < 0.5 ? -1 : 1; const z = quad(Mt.y14dark, i, side < 0 ? x - 40 : x, 0, side < 0 ? x : x + 40, ZH.H, 0.04); z.material = Mt.y14dark.clone(); z.material.transparent = true; z.material.opacity = 0.18; const l = quad(Mt.y14scar, i, x - 1.2, -6, x + 1.2, ZH.H + 6, 0.05); borders.push({ i, x, z, l }); }
  let maskM = null;
  if (horiz) { maskM = new T.Group(); root.add(maskM); const pl = new T.Mesh(new T.BoxGeometry(SW + 0.5, 0.34, 0.06), Mt.y14mask); pl.position.y = -0.17; maskM.add(pl); const hd = new T.Mesh(new T.BoxGeometry(0.22, 0.4, 0.12), Mt.y14handL); hd.position.x = SW / 2 + 0.36; hd.position.y = -0.17; maskM.add(hd); }
  else if (lv > 1) { maskM = new T.Group(); root.add(maskM); const pl = new T.Mesh(new T.BoxGeometry(0.34, SH + 0.5, 0.06), Mt.y14mask); maskM.add(pl); const hd = new T.Mesh(new T.BoxGeometry(0.4, 0.22, 0.12), Mt.y14handL); hd.position.y = -(SH / 2 + 0.25); maskM.add(hd);
    const tr = new T.Mesh(new T.BoxGeometry(W.axis === 'x' ? N * SW : 0.05, 0.05, W.axis === 'x' ? 0.05 : N * SW), Mt.y14woodD); const tc = wallPt(0, 0, 0); const tc2 = wallPt(N - 1, ZH.W, 0); tr.position.set((tc[0] + tc2[0]) / 2 + nrm[0] * 0.05, yb + track.y * M_DP - 0.35, (tc[2] + tc2[2]) / 2 + nrm[1] * 0.05); root.add(tr); }
  const maskWorld = () => { if (horiz) return wallPt(S.k, ZH.W / 2, S.mask * ZH.H, 0.08); const t = S.mask * N; const i = Math.min(N - 1, Math.floor(t)); return wallPt(i, (t - i) * ZH.W, ZH.H / 2, 0.08); };
  // the cushion and the three tools' places (left of the segment), the held leaf on the gilder's tip
  const cushX = 24, cushY = -58;   // (under the segment's left end: never over a neighbour's gold)
  const cushM = new T.Mesh(new T.BoxGeometry(0.5, 0.36, 0.1), Mt.y14belt); root.add(cushM);
  const leafOnCush = new T.Mesh(new T.PlaneGeometry(0.32, 0.26), Mt.y14leaf); root.add(leafOnCush);
  const toolM = [Mt.y14woodL, Mt.y14wood, Mt.y14agate].map((mt) => { const t = new T.Mesh(new T.BoxGeometry(0.1, 0.32, 0.06), mt.clone()); root.add(t); return t; });
  const held = new T.Mesh(new T.PlaneGeometry(1, 1, 6, 1), Mt.y14leaf); held.visible = false; root.add(held);
  const tip = new T.Mesh(new T.BoxGeometry(0.06, 0.5, 0.02), Mt.y14woodD); tip.visible = false; root.add(tip);
  const rings = { work: ring(HANDS.R), helper: ring(HANDS.L) };
  try { X.kohen(false); } catch (e) { /* */ }
  // ── the view: square to the wall, a metre 100 dp; the segment and the cushion on its left
  const cam0 = X.camera, fov0 = cam0.fov;
  const D = 360 / (200 * Math.tan(ZT.FOV / 2 * RAD));
  function camTo(d = 0.6) {
    const key = 'seg:' + S.k; if (key === A.camKey) return; A.camKey = key;
    const c = wallPt(S.k, ZH.W / 2, (ZH.H + cushY) / 2 + 4, 0);
    lens(X, ZT.FOV); X.shot([c[0] + nrm[0] * D, c[1] + 0.6, c[2] + nrm[1] * D], c, d);
  }
  // ── screen ↔ the segment's frame (the finger's ray on the wall's plane)
  const scr = (p) => { try { const r = X.scr(p[0], p[1], p[2]); return { x: r.x, y: r.y }; } catch (e) { return { x: innerWidth / 2, y: innerHeight / 2 }; } };
  function toSeg(f) {
    try {
      const ray = X.rayAt(f.x, f.y), n = new T.Vector3(nrm[0], 0, nrm[1]), p0 = new T.Vector3(...wallPt(S.k, 0, 0, 0));
      const den = ray.direction.dot(n); if (Math.abs(den) < 1e-6) return null;
      const t = p0.clone().sub(ray.origin).dot(n) / den, h = ray.origin.clone().addScaledVector(ray.direction, t), d = h.sub(p0);
      const ax = new T.Vector3(along[0], 0, along[1]).multiplyScalar(flip);
      return { x: d.dot(ax) / M_DP, y: d.y / M_DP };
    } catch (e) { return null; }
  }
  const segScr = (x, y) => scr(wallPt(S.k, x, y, 0));
  const inBox = (f, c, n) => Math.abs(f.x - c.x) <= dp(n) / 2 + dp(4) && Math.abs(f.y - c.y) <= dp(n) / 2 + dp(4);
  const maskScr = () => { if (!maskM) return null; if (horiz) { const c = segScr(ZH.W + 36 * (flip > 0 ? 1 : 1), S.mask * ZH.H - 17); return { x: Math.max(dp(30), Math.min(innerWidth - dp(30), c.x)), y: c.y, off: 0 }; } const p = maskWorld(); const c = scr([p[0], yb + track.y * M_DP - 0.3, p[2]]); return { x: Math.max(dp(30), Math.min(innerWidth - dp(30), c.x)), y: c.y, off: c.x < dp(30) ? -1 : c.x > innerWidth - dp(30) ? 1 : 0 }; };
  const onMask = (f) => { const c = maskScr(); return !!c && inBox(f, c, ZT.MASK); };
  const onCush = (f) => inBox(f, segScr(cushX, cushY), ZT.CUSH);
  // ── the fingers
  const FG = fingers(X, {
    down(f) {
      if (A.finished || A.busy || S.phase === 'next' || S.phase === 'done') return;
      if (lv > 1 && !A.mask && (onMask(f) || (f.button === 2 && maskM))) { const s = toSeg(f); A.mask = { id: f.id, x0: f.x, m0: S.mask, s0: s, f }; ev('mask'); return; }
      if (A.work && lv === 1 && !A.steady && S.held) { A.steady = { id: f.id }; ev('steady'); return; }
      if (A.work) return;
      const s = toSeg(f); if (!s) return;
      if (S.phase === 'leaf' && !S.held) { if (onCush(f)) { A.cushion = { x: cushX, y: cushY }; A.work = { id: f.id, ...s }; X.hand(null); ev('cushion'); } return; }
      A.work = { id: f.id, ...s }; X.hand(null); ev('work:' + S.phase);
    },
    move(f) {
      if (A.work && f.id === A.work.id) { const s = toSeg(f); if (s) { A.work.x = s.x; A.work.y = s.y; } }
      if (A.mask && f.id === A.mask.id) {
        const s = toSeg(f), t0 = A.mask.s0; if (s && t0) { const m2 = A.mask.m0 + (horiz ? (s.y - t0.y) / ZH.H : (s.x - t0.x) / (N * ZH.W)); A.mask.want = Math.max(0, Math.min(1, m2)); }
      }
    },
    up(f) { if (A.work && f.id === A.work.id) A.work = null; if (A.mask && f.id === A.mask.id) A.mask = null; if (A.steady && f.id === A.steady.id) A.steady = null; },
  });
  function input() {
    const out = { free: !A.work && !A.mask && !A.steady && FG.n === 0 };
    if (A.feed) return A.feed(S, out);
    out.work = A.work ? { x: A.work.x, y: A.work.y, down: true } : { down: false };
    if (A.cushion) { out.cushion = A.cushion; A.cushion = null; }
    if (A.mask && A.mask.want != null) out.mask = A.mask.want;
    if (A.steady) out.steady = true;
    return out;
  }
  const at = () => { const p = wallPt(S.k, ZH.W / 2, ZH.H / 2, 0.3); return V3(X, p[0], p[1], p[2]); };
  // the leaves laid (matte; under the agate their cells turn deep), the patches, the seams
  function layLeaf(i, k, q, ex, ey) {
    const n = S.P.segs[i].n, w = K.leafW(n), x = K.slotX(n, k) + (ex || 0), y = ZH.H / 2 + (ey || 0);
    const L = quad(Mt.y14goldMatte, i, x - w / 2, y - ZH.H / 2, x + w / 2, y + ZH.H / 2, 0.025 + k * 0.002);
    if (q === 'bad') { L.material = Mt.y14goldMatte.clone(); L.material.color.set('#A88437'); }
    leafQ[i].push(L);
    A.settle.push({ m: L, t: 0 });
  }
  function paint() {
    const wq = wetQ[S.k], bq = burnQ[S.k];
    if (!wq) return;
    for (let c = 0; c < wq.length; c++) {
      wq[c].visible = S.phase === 'wet' && S.wet[c] > 0 || (S.phase === 'leaf' && S.wet[c] > 0);
      if (S.phase === 'burnish' || S.phase === 'next') { const v = Math.min(1, S.burn[c] / ZH.BURN_N); bq[c].visible = v > 0; bq[c].material.opacity = 0.25 + 0.75 * v; }
    }
  }
  // a short word where it happened: which of the three actions did it (wet / leaf / agate) — build 137 review
  function pop(text, col, x, y) {
    try {
      const p = segScr(x == null ? ZH.W / 2 : x, y == null ? ZH.H + 14 : y), d = document.createElement('div'); d.className = 'h109-ui h137-pop';
      d.style.cssText = `position:fixed;z-index:5;pointer-events:none;left:${p.x}px;top:${p.y}px;transform:translate(-50%,-50%);font:700 15px system-ui;color:${col};text-shadow:0 1px 2px #0008;transition:transform .7s ease-out,opacity .7s ease-in`;
      d.textContent = text; document.body.appendChild(d);
      requestAnimationFrame(() => { d.style.transform = 'translate(-50%,-150%)'; d.style.opacity = '0'; }); setTimeout(() => d.remove(), 800);
    } catch (er) { /* */ }
  }
  // the agate's glint: a bright spot riding under the stone while it burnishes (no reflection map: the shine moves with the hand)
  const glint = new T.Mesh(new T.PlaneGeometry(0.34, 0.34), new T.MeshBasicMaterial({ color: '#FFF4C8', transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending })); root.add(glint);
  function handle(e) {
    if (e.k === 'warn') { V.breath(); ev('warn'); try { X.line('המסכה לא במקום: הרטיבות נמרחת על אחר הדלתות. הזיזו אותה אל הקו', 2400); } catch (er) { /* */ } }
    else if (e.k === 'puddle') { V.breath(); ev('puddle'); pop('שלולית', '#9ED0FF'); }
    else if (e.k === 'wet-done') { V.settle(); ev('wet-done'); pop('רטוב: לעלה', '#F6EAD2'); }
    else if (e.k === 'lift') { V.breath(); ev('lift'); }
    else if (e.k === 'laid') { V.settle(); ev('laid:' + e.q); layLeaf(S.k, e.i, e.q, e.q === 'bad' ? e.ex : 0, e.q === 'bad' ? e.ey : 0); if (e.q !== 'bad') pop(e.q === 'gold' ? 'נמתח ונצמד' : 'נצמד', e.q === 'gold' ? '#FFD45A' : '#E8C77A', K.slotX(S.g.n, e.i), ZH.H / 2); try { X.haptic && X.haptic(10); } catch (er) { /* */ } }
    else if (e.k === 'tear') { V.tear(); ev('tear'); pop('נקרע', '#FF8A6A'); if (e.dmg) hurt(X, Mo, 'zahav.tear', at(), { lv, at: S.k }); }
    else if (e.k === 'hole' || e.k === 'wrinkle') { ev(e.k); pop(e.k === 'hole' ? 'חור' : 'קמט', '#FF8A6A'); if (e.dmg) hurt(X, Mo, 'zahav.' + e.k, at(), { lv, at: S.k }); }
    else if (e.k === 'border') { ev('border'); if (e.dmg) hurt(X, Mo, 'zahav.border', at(), { lv, at: S.k }); }
    else if (e.k === 'free') { V.knock(); ev('free:' + e.why); const t = { pull: 'ניסוי חינם: משיכה אחורה בשחרור קורעת את העלה. תנועה אחת, ושחרור', hole: 'ניסוי חינם: העלה רחוק מהמקום שלו, נשאר חור. כוונו לחפיפה הקטנה', wrinkle: 'ניסוי חינם: חפיפה גדולה מדי מקמטת. כוונו לחפיפה הקטנה', border: 'ניסוי חינם: זהב מעבר לקו, על אחר הדלתות. קודם המסכה' }[e.why]; try { X.line(t || '', 2800); } catch (er) { /* */ } }
    else if (e.k === 'ready') { ev('ready'); }
    else if (e.k === 'carved') { ev('carved'); V.settle(); pop('מגולף: הכניסו את העלה לחריצים', '#FFD45A'); if (!A.carvedSaid) { A.carvedSaid = 1; try { X.line('תבליט: העלה מונח מעל החריצים כמו גשר. עברו במכחול הרך לאורך כל חריץ ולחצו את הזהב פנימה, ורק אז אגט', 3400); } catch (er) { /* */ } } }
    else if (e.k === 'crease') { V.tear(); ev('crease'); pop('קמט: יצאתם מהחריץ', '#FF8A6A');
      // the crease is seen on the leaf itself, where the brush left the groove (a small dark fold)
      if (e.x != null) try { for (const r of [0.5, -0.5]) { const f = new T.Mesh(new T.PlaneGeometry(10 * M_DP, 0.018), creaseM); const c = wallPt(S.k, e.x + r * 3, e.y, 0.036); f.position.set(c[0], c[1], c[2]); f.rotation.set(0, faceRot, r * 1.2); root.add(f); } } catch (er) { /* */ } }
    else if (e.k === 'pressed') { ev('pressed'); V.right(); pop('הזהב בתוך החריצים', '#FFD45A'); }
    else if (e.k === 'small-wrinkle') { V.tear(); ev('swrinkle'); pop('קמט קטן: לאט יותר', '#FF8A6A'); }
    else if (e.k === 'seg-done') {
      ev('seg:' + e.grade); award(X, at(), e.grade, lv, 'זהב');
      if (lv === 1 && e.steady) extra(X, 10, lv, 'two', 'שתי ידיים');
      V.shine(); for (const b of burnQ[S.k]) { b.visible = true; b.material = Mt.y14gold; }
      for (const L of leafQ[S.k]) L.visible = false;
      keep();
    } else if (e.k === 'seg') { ev('seg' + e.i); keep(); }
    else if (e.k === 'done') { ev('done'); done(); }
  }
  async function done() {
    if (A.busy) return; A.busy = 2;
    const res = K.result(S);
    if (res.bonus) extra(X, 40, lv, 'work', 'כל הקיר בזהב');
    Mo.keep(m.k, null); X.save();
    // the wall's end: the camera draws back, the whole band in gold
    const c = wallPt(Math.floor(N / 2), N % 2 ? ZH.W / 2 : 0, ZH.H / 2, 0);
    lens(X, 46); X.shot([c[0] + nrm[0] * (D + 4), c[1] + 1, c[2] + nrm[1] * (D + 4)], c, 1.4);
    await X.wait(1.6);
    await finish(X, A, res, WORDS.zahav, V3(X, c[0], c[1], c[2]), { eye: [c[0] + nrm[0] * 12, c[1] + 2, c[2] + nrm[1] * 12], aim: c, secs: 1.4, after: () => { try { Mo.filmOver(); } catch (er) { /* */ } } });
  }
  function hint() { if (resumed || A.hintOn || lv > 1) return; A.hintOn = 1; try { const p = wallPt(S.k, 30, ZH.H / 2, 0.3); X.hand({ x: p[0], y: p[1], z: p[2] }, 0, 40); } catch (e) { /* */ } }
  function draw(dt) {
    paint();
    // the cushion, the tools' places (the active one glows), the leaf waiting on the cushion
    const cp = wallPt(S.k, cushX, cushY, 0.1); cushM.position.set(cp[0], cp[1], cp[2]); cushM.rotation.y = faceRot;
    leafOnCush.position.set(cp[0] + nrm[0] * 0.06, cp[1], cp[2] + nrm[1] * 0.06); leafOnCush.rotation.y = faceRot; leafOnCush.visible = S.phase === 'leaf' && !S.held;
    const ti = S.phase === 'wet' || S.phase === 'press' ? 0 : S.phase === 'leaf' ? 1 : 2;   // (the press: the soft brush, dry)
    { const P = grooves.get(S.k); if (P && S.pressed) for (const pc of P) { let n = 0; for (let j = pc.j0; j < pc.j1; j++) n += S.pressed[j] || 0; const ok = n >= (pc.j1 - pc.j0) * 0.7; pc.m.material = ok ? groovePressed : grooveM; pc.m.scale.y = !ok && S.phase === 'press' ? 1.3 + 0.5 * Math.sin(A.t * 5) : 1; } }   // (the grooves still to press throb: no hunting for the missed bit)
    toolM.forEach((t, j) => { const p = wallPt(S.k, cushX + 52 + j * 20, cushY, 0.1); t.position.set(p[0], p[1], p[2]); t.rotation.y = faceRot; t.material.emissive && t.material.emissive.set(j === ti ? '#FFC23A' : '#000000'); t.material.emissiveIntensity = j === ti ? 0.6 + 0.3 * Math.sin(A.t * 5) : 0; t.scale.setScalar(j === ti ? 1.25 : 1); });
    // the held leaf on the gilder's tip (it flutters a little unless steadied)
    if (S.held && S.held.on !== undefined) {
      const n = S.g.n, w = K.leafW(n), H = S.held, fl = lv === 1 && !A.steady ? ZH.FLUTTER * Math.sin(A.t * 7) : 0;
      const p = wallPt(S.k, H.x, H.y + fl, 0.12); held.visible = true; held.position.set(p[0], p[1], p[2]); held.rotation.set(0, faceRot, 0.02 * Math.sin(A.t * 9) * (A.steady ? 0.2 : 1)); held.scale.set(w * M_DP, ZH.H * M_DP, 1);
      tip.visible = true; tip.position.set(p[0] + nrm[0] * 0.05, p[1] + SH / 2 + 0.2, p[2] + nrm[1] * 0.05); tip.rotation.y = faceRot;
      // the slot's guide: the overlap's place lights faintly (level 1–2)
    } else { held.visible = false; tip.visible = false; }
    // the mask on its track (levels 2–3)
    if (maskM) { const p = maskWorld(); maskM.position.set(p[0], p[1], p[2]); maskM.rotation.y = faceRot; }
    for (const b of borders) { const ok = Math.abs(S.mask - S.P.segs[b.i].border) <= ZH.MASK_TOL; b.l.material = ok ? Mt.y14woodD : Mt.y14scar; }
    // the leaves settling at once
    for (let i = A.settle.length - 1; i >= 0; i--) { const s = A.settle[i]; s.t += dt; const k = Math.min(1, s.t / 0.18); s.m.scale.set(1, 1 + 0.12 * (1 - k), 1); if (k >= 1) A.settle.splice(i, 1); }
    { const on = S.phase === 'burnish' && A.work && A.work.x != null; glint.material.opacity += ((on ? 0.55 + 0.25 * Math.sin(A.t * 11) : 0) - glint.material.opacity) * Math.min(1, dt * 12);
      if (on) { const p = wallPt(S.k, A.work.x, A.work.y, 0.06); glint.position.set(p[0], p[1], p[2]); glint.rotation.set(0, faceRot, A.t * 2); } }
    // voices: the brush, the agate
    V.brush(S.phase === 'wet' && A.work ? 0.6 : 0); V.agate(S.phase === 'burnish' && A.work ? 0.8 : 0);
    // the rings
    if (A.work && A.work.x != null) { const p = segScr(A.work.x, A.work.y); rings.work.show(p.x, p.y, S.phase === 'burnish' ? S.burn.filter((v) => v >= ZH.BURN_N).length / S.burn.length : 0.3, false); } else rings.work.hide();
    const mk = maskScr();
    if (A.mask && mk) rings.helper.show(mk.x, mk.y, 0.5, K.masked(S)); else if (A.steady && S.held) { const p = segScr(S.held.x, S.held.y + ZH.H / 2); rings.helper.show(p.x, p.y, 0.5, true); } else rings.helper.hide();
  }
  return {
    close: true, kohenWorks: false,
    begin() {
      FG.attach(); A.camKey = ''; camTo(0.01);
      // the segments already done (a resumed visit): gold
      for (let i = 0; i < S.steps.length; i++) for (const b of burnQ[i]) { b.visible = true; b.material = Mt.y14gold; }
      X.line(resumed ? '' : lv === 1 ? 'מרחו את ההרטבה על כל המקטע, ואז געו בכרית וגררו עלה אל מקומו בתנועה אחת' : lv === 2 ? 'הכותל המזרחי, לאורך ראשי הכנפיים: מאחורי הדלתות לא מזהיבים. בכל מקטע הקו בגובה אחר: הורידו את סרגל המסכה אל הקו לפני שמרטיבים' : 'הכותל הדרומי: שלושה עלים צרים לכל מקטע, ובמקטעים המגולפים לוחצים את הזהב לתוך החריצים לפני האגט', resumed ? 0 : 5200);
      X.wait(0.9).then(() => { if (!A.ended) hint(); });
      ev(resumed ? 'resume' : 'begin'); keep();
    },
    update(dt) {
      A.t += dt;
      try {
        if (!A.busy && !A.finished) {
          const inp = input();
          const evs = K.step(S, Math.min(dt, 1 / 30), inp);
          for (const e of evs) handle(e);
          if (inp.free && S.phase !== 'next') camTo(0.7);
        }
        draw(dt);
        if (A.t % 1 < dt) keep();
      } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h137] zahav', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
    },
    down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
    cancel() { A.work = null; A.mask = null; A.steady = null; keep(); },
    wants(p) { if (!p) return true; if (A.work || A.mask) return true; if (onMask(p)) return true; const s = toSeg(p); return !!s && s.x > -30 && s.x < ZH.W + 30 && s.y > cushY - 40 && s.y < ZH.H + 30; },
    holds() { return !!(A.work || A.mask || A.steady); },
    lensFov: ZT.FOV,
    end() {
      A.ended = true; FG.detach(); V.hush(); V.stop(); X.hand(null); lens(X, fov0);
      for (const r of Object.values(rings)) r.remove();
      try { X.kohen(true); } catch (e) { /* */ }
      X.props.remove(root);
    },
    at,
    dbg() {
      const r = (v) => Math.round(v), sc = (x, y) => { const p = segScr(x, y); return [r(p.x), r(p.y)]; }, mk = maskScr();
      return { id: m.id, lv, finished: A.finished, busy: A.busy, k: S.k, phase: S.phase, leaf: S.leaf, held: !!S.held, wet: S.wet.filter((v) => v).length, burn: S.burn.filter((v) => v >= ZH.BURN_N).length, pressed: S.pressed ? S.pressed.filter((v) => v).length + '/' + S.pressed.length : null, mask: +(S.mask == null ? -1 : S.mask).toFixed(3), need: S.g.border, steps: S.steps.map((s) => s.grade[0]).join(''), flaws: S.flaws.length, done: S.done,
        cush: sc(cushX, cushY), seg0: sc(0, 0), seg1: sc(ZH.W, ZH.H), slot: S.phase === 'leaf' ? sc(K.slotX(S.g.n, S.leaf), ZH.H / 2) : null, maskAt: mk ? [r(mk.x), r(mk.y)] : null, ev: A.ev.slice(-12) };
    },
    probe() { return { S, K, A }; },
  };
}
export const ZAHAV_ACT = { icon: '✨', title: 'הזהבת המים והדלתות', walkLine: () => 'הזהבת הכתלים: אל הפיגום שבתוך ההיכל', stand() { return { x: S14.stands.zahav[0], z: S14.stands.zahav[1], face: [-110, 0] }; }, prepare() {}, make };
