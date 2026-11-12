/* ── build 112 ── h112/world.js — the things of stage 03 in the old world, shared by its acts: the soreg's three runs on the east side
 * (the crews' posts and lattice slabs to both ends of each run, the kohen's posts, slabs, warning slabs and closing slabs as the save
 * has them), the twelve steps of the east axis and the fill behind them, the lattice patterns (openwork: light passes through), the
 * warning slab's text (English in the game, the owner 8.11; the real one Greek, in ספר המידות), the treadwheel crane and the ox-cart,
 * the openings the crews leave in their ring for the kohen's work (the site's reveal drops its own stones there: stages.siteHoles).
 * Built, not boxes where it shows (rule 9): the posts white stone, the slabs pierced, the frames real timber, the steps ashlar.
 */
import { H112, RUNS, LINE, STEPS, stepOf, runPosts, bayWidth, halfW, warnOf } from './model.js';
import { createBeat, createGang, clamp } from '../h109/kit.js';
import { makeCrane } from '../h109/acts3.js';

export const SH3 = { final: 0, X: null, B: null, crew: null, crane: null, runs: {}, keys: {}, steps: null, stepKey: '', labels: [], chip: null, holeT: 0, busy: 0, cart: null };

/* ───────── the run's geometry ───────── */
/** the posts' running distance along a run (the pattern's phase: one lattice runs on from slab to slab) */
export function runS(lv) {
  const ps = RUNS[lv].posts, s = [0];
  for (let i = 1; i < ps.length; i++) s.push(s[i - 1] + Math.hypot(ps[i].x - ps[i - 1].x, ps[i].z - ps[i - 1].z));
  return s;
}
/** a bay's frame: centre, u (a → b), n (out, to the Temple Mount), the yaw that puts a mesh's local x along u, which local z faces out,
 *  the slab's width (groove to groove) between the posts as they stand, its pattern's start along the run (from the true posts) */
export function bayFrame(lv, a, b, ps) {
  ps = ps || runPosts(lv, SH3.X && SH3.X.M ? SH3.X.M.st : null);
  const A = ps[a], Bp = ps[b], R = RUNS[lv];
  const L = Math.hypot(Bp.x - A.x, Bp.z - A.z) || 1, ux = (Bp.x - A.x) / L, uz = (Bp.z - A.z) / L;
  const line = A.corner ? Bp.line : A.line, n = LINE[line];
  const yaw = Math.atan2(-uz, ux), ns = Math.sign(-uz * n[0] + ux * n[1]) || 1;
  // the slab's middle: between the posts' faces (a tall frame is wider than a post)
  const ha = halfW(A), hb = halfW(Bp), m = (ha + (L - hb)) / 2;
  const S = runS(lv), s0 = S[a] + halfW(R.posts[a]) - H112.GROOVE;
  return { lv, a, b, cx: A.x + ux * m, cz: A.z + uz * m, ux, uz, nx: n[0], nz: n[1], yaw, ns, W: bayWidth(A, Bp), s0, line,
    at: (along, across = 0, y = 0) => ({ x: A.x + ux * along + n[0] * across, y, z: A.z + uz * along + n[1] * across }), A, B: Bp, L };
}

/* ───────── materials ───────── */
function mats(X) {
  const P = X.props, T = X.THREE;
  if (P.M.marble) return P.M;
  P.M.marble = new T.MeshStandardMaterial({ color: '#EDE5D6', roughness: 0.45, flatShading: true });
  P.M.marbleD = new T.MeshStandardMaterial({ color: '#D9CFBC', roughness: 0.6, flatShading: true });
  P.M.earth = new T.MeshStandardMaterial({ color: '#8E7656', roughness: 1, flatShading: true });
  P.M.earthT = new T.MeshStandardMaterial({ color: '#9C8463', roughness: 1, flatShading: true });
  P.M.chalk = P.M.chalk || new T.MeshBasicMaterial({ color: 0xFFF6DA, transparent: true, opacity: 0.95, depthWrite: false });
  P.M.redc = P.M.redc || new T.MeshBasicMaterial({ color: 0xD8432E, transparent: true, opacity: 0.95, depthWrite: false });
  P.M.hole = new T.MeshBasicMaterial({ color: 0x4A3A28, transparent: true, opacity: 0.85, depthWrite: false });
  P.M.poleR = new T.MeshStandardMaterial({ color: '#B8322A', roughness: 0.8 });
  P.M.poleW = new T.MeshStandardMaterial({ color: '#F4EEE0', roughness: 0.8 });
  P.M.ash = X.props.M.ash;   // ── look A ── (the stone system's: src/look/stone.js) ── /look A ──
  return P.M;
}

/* ───────── the lattice: openwork patterns drawn per slab (alpha: the holes) ───────── */
const PX = 120;   // pixels per amah
const RIM = 0.09, BAND = 0.22;
/** solid stone at (s, y) of a run's lattice? s along the run, y up from the slab's foot (amot) */
export function solidAt(type, s, y, H) {
  if (y < RIM || y > H - BAND || s < 0) return true;
  if (type === 'diag') { const P = 0.42, f = ((s + y) / P) % 1; const g = f < 0 ? f + 1 : f; return !(g > 0.32 && g < 0.78); }
  // 'ring': diamonds, and in every other column a stone ring inside the diamond (the pattern's phase is two columns)
  const P = 0.5, cs = Math.floor(s / P), a = s / P - cs - 0.5, b = (y - RIM) / P - Math.floor((y - RIM) / P) - 0.5;
  const d = Math.abs(a) + Math.abs(b);
  if (d >= 0.36) return true;
  if (cs % 2 === 0) { const r = Math.hypot(a, b); return r > 0.1 && r < 0.17; }
  return false;
}
/**
 * a slab's two faces as canvases: the same holes on both (the back face's texture is mirrored, so they meet); the carved band on the
 * outer face only. o: { type, s0 (the pattern's start), W, H, outer: +1 | -1 (which face is outer), shift (a wrong slab: the pattern's
 * phase moved), band: the band's carving }
 */
function latticeCanvases(o) {
  const w = Math.max(8, Math.round(o.W * PX)), h = Math.max(8, Math.round(o.H * PX));
  const mk = (carve) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); const img = g.createImageData(w, h); const d = img.data;
    for (let j = 0; j < h; j++) {
      const y = o.H - (j + 0.5) / PX;   // (row 0 is the slab's top)
      for (let i = 0; i < w; i++) {
        const s = (i + 0.5) / PX, sol = s < RIM || s > o.W - RIM || solidAt(o.type, o.s0 + s + (o.shift || 0), y, o.H);
        const k = (j * w + i) * 4;
        let v = 236 - ((i * 7 + j * 13) % 11);   // (a little grain)
        if (carve && y > o.H - BAND && y < o.H - 0.04) { const q = Math.floor((s + 0.04) / 0.22) % 2, yy = (o.H - y) / BAND; if ((q === 0 && yy > 0.25 && yy < 0.75) || Math.abs(yy - 0.12) < 0.05 || Math.abs(yy - 0.88) < 0.05) v -= 48; }
        if (sol && (y < RIM + 0.02 || s < RIM + 0.02 || s > o.W - RIM - 0.02)) v -= 12;
        d[k] = v; d[k + 1] = v - 10; d[k + 2] = v - 30; d[k + 3] = sol ? 255 : 0;
      }
    }
    g.putImageData(img, 0, 0); return c;
  };
  return { out: mk(true), inn: mk(false) };
}
/** a lattice slab: a group (at the slab's centre) holding the stone (local x along the run, local z across) */
export function latticeSlab(X, o) {
  const T = X.THREE, M = mats(X);
  const H = o.H || H112.SLAB_H, cv = latticeCanvases({ ...o, H });
  const tex = (c, mirror) => { const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace || t.colorSpace; t.anisotropy = 4; if (mirror) { t.wrapS = T.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1; } return t; };
  const mf = (c, mirror) => new T.MeshStandardMaterial({ map: tex(c, mirror), alphaTest: 0.5, roughness: 0.75, color: '#FFF8EC' });
  const outer = o.outer || 1;
  // (BoxGeometry's faces: +x −x +y −y +z −z; the −z face's u runs the other way: mirrored, so the holes meet)
  const fz = outer > 0 ? mf(cv.out, false) : mf(cv.inn, false), bz = outer > 0 ? mf(cv.inn, true) : mf(cv.out, true);
  const edge = M.marble;
  const m = new T.Mesh(new T.BoxGeometry(o.W, H, H112.SLAB_T), [edge, edge, edge, edge, fz, bz]);
  m.castShadow = true; m.receiveShadow = true;
  const g = new T.Group(); g.add(m); X.props.root.add(g);
  g.userData = { slab: m, W: o.W, H, type: o.type };
  return g;
}

/* ───────── the posts ───────── */
export function postMesh(X, p, h = H112.POST_H) {
  const T = X.THREE, M = mats(X), g = new T.Group();
  if (p.tall) {
    // a frame for the warning slab: two uprights with their grooves, a sill, open above (spec 3: "ניצב גבוה, עם חריץ")
    const up = (s) => { const m = new T.Mesh(X.props.geo.box, M.marble); m.scale.set(0.25, H112.TALL_H, 0.42); m.position.set(s * 0.6, H112.TALL_H / 2, 0); m.castShadow = true; g.add(m); const gr = new T.Mesh(X.props.geo.box, X.props.M.seam); gr.scale.set(0.03, H112.TALL_H - 0.5, 0.14); gr.position.set(s * 0.475, H112.TALL_H / 2 + 0.1, 0); g.add(gr); };
    up(-1); up(1);
    const sill = new T.Mesh(X.props.geo.box, M.marbleD); sill.scale.set(1.45, 0.9, 0.42); sill.position.set(0, 0.45, 0); sill.castShadow = true; g.add(sill);
    // (no head beam across the top: the crane lowers the warning slab into the grooves from above; each upright has its own cap)
    for (const s of [-1, 1]) { const cap = new T.Mesh(X.props.geo.box, M.marbleD); cap.scale.set(0.33, 0.12, 0.5); cap.position.set(s * 0.6, H112.TALL_H + 0.06, 0); cap.castShadow = true; g.add(cap); }
  } else {
    const m = new T.Mesh(X.props.geo.box, M.marble); m.scale.set(H112.POST_W, h, H112.POST_W); m.position.y = h / 2; m.castShadow = true; m.receiveShadow = true; g.add(m);
    const cap = new T.Mesh(X.props.geo.box, M.marbleD); cap.scale.set(H112.POST_W + 0.08, 0.1, H112.POST_W + 0.08); cap.position.y = h - 0.05; g.add(cap);
  }
  g.position.set(p.x, X.ground(p.x, p.z), p.z);
  // (along its line: a frame's uprights stand along the run)
  const n = LINE[p.line] || [1, 0]; g.rotation.y = Math.atan2(-n[0], -n[1]);
  X.props.root.add(g); return g;
}
/** a sighting pole on a post (spec 1: the crews' red-and-white ranging rod; the kohen's eye hides one behind the other) */
export function poleMesh(X, p, topY) {
  const T = X.THREE, M = mats(X), g = new T.Group();
  for (let k = 0; k < 4; k++) { const m = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 0.32, 6), k % 2 ? M.poleW : M.poleR); m.position.y = 0.16 + k * 0.32; g.add(m); }
  g.position.set(p.x, topY, p.z); X.props.root.add(g); return g;
}

/* ───────── the warning slab: the carved text, the red paint ───────── */
const WPX = 420;
/** the text's layout on the slab's face (canvas px): lines and each word's box; mask: the letters (for the paint) */
export function warnCanvas(word, painted = 0) {
  const W = Math.round(H112.WARN_W * WPX), Hh = Math.round(H112.WARN_H * WPX);
  const c = document.createElement('canvas'); c.width = W; c.height = Hh; const g = c.getContext('2d');
  const mask = document.createElement('canvas'); mask.width = W; mask.height = Hh; const gm = mask.getContext('2d');
  const font = (px) => `900 ${px}px Georgia, 'Times New Roman', serif`;
  const lines = H112.TEXT, ys = [0.27, 0.52, 0.77].map((f) => f * Hh), px = [96, 70, 64];
  const boxes = [];
  // the stone: white limestone with a drafted margin
  g.fillStyle = '#F2ECDF'; g.fillRect(0, 0, W, Hh);
  g.strokeStyle = '#D9CFBC'; g.lineWidth = 10; g.strokeRect(10, 10, W - 20, Hh - 20);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(120,100,70,${0.03 + (i % 5) * 0.01})`; g.fillRect((i * 97) % W, (i * 57) % Hh, 2, 2); }
  g.textAlign = 'center'; g.textBaseline = 'middle'; gm.textAlign = 'center'; gm.textBaseline = 'middle';
  lines.forEach((t, i) => {
    g.font = font(px[i]); gm.font = font(px[i]);
    // carved: a dark cut and a light edge below it
    g.fillStyle = '#FFFFFF'; g.fillText(t, W / 2 + 2, ys[i] + 3);
    g.fillStyle = '#5E564A'; g.fillText(t, W / 2, ys[i]);
    // each word's box on its line
    const words = t.split(' '); let x = W / 2 - g.measureText(t).width / 2;
    for (const w of words) { const ww = g.measureText(w).width; boxes.push({ w, line: i, x0: x, x1: x + ww, y0: ys[i] - px[i] * 0.45, y1: ys[i] + px[i] * 0.42, px: px[i], cx: x + ww / 2, cy: ys[i] }); x += ww + g.measureText(' ').width; }
  });
  const B = boxes.find((b) => b.w === word) || boxes[0];
  gm.font = font(B.px); gm.fillStyle = '#FFF'; gm.textAlign = 'left'; gm.fillText(B.w, B.x0, B.cy);
  if (painted > 0) { g.save(); g.globalAlpha = Math.min(1, painted); g.drawImage(redLetters(mask), 0, 0); g.restore(); }
  return { c, mask, box: B, W, H: Hh };
}
function redLetters(mask) {
  const c = document.createElement('canvas'); c.width = mask.width; c.height = mask.height; const g = c.getContext('2d');
  g.drawImage(mask, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#B8241A'; g.fillRect(0, 0, c.width, c.height); return c;
}
export function warnSlab(X, word, painted = 0) {
  const T = X.THREE, M = mats(X), wc = warnCanvas(word, painted);
  const tex = new T.CanvasTexture(wc.c); tex.colorSpace = T.SRGBColorSpace || tex.colorSpace; tex.anisotropy = 4;
  const face = new T.MeshStandardMaterial({ map: tex, roughness: 0.6 });
  const m = new T.Mesh(new T.BoxGeometry(H112.WARN_W - 0.04, H112.WARN_H, H112.WARN_T), [M.marble, M.marble, M.marble, M.marble, face, M.marble]);
  m.castShadow = true; const g = new T.Group(); g.add(m); X.props.root.add(g);
  g.userData = { slab: m, wc, tex, face };
  return g;
}
/** the warning slab's seat in a tall post: its centre, the frame's outward normal (its text faces the Mount) */
export function warnSeat(lv, pi, ps) {
  ps = ps || runPosts(lv, SH3.X && SH3.X.M ? SH3.X.M.st : null);
  const p = ps[pi], n = LINE[p.line];
  return { x: p.x, z: p.z, y: 0.9 + H112.WARN_H / 2, nx: n[0], nz: n[1], yaw: Math.atan2(n[0], n[1]) };
}

/* ───────── a run as the save has it ───────── */
function runClear(lv) {
  const R = SH3.runs[lv]; if (!R) return;
  for (const o of R.all) SH3.X.props.remove(o);
  SH3.runs[lv] = null;
}
function runKey(lv, st) { return JSON.stringify([st.posts[lv] || 0, st.slabs[lv] || 0, st.warn[lv] || 0, st.close[lv] || 0]); }
/** the run's meshes: the crews' part always (the ring round it), the kohen's as far as the save goes; skip: the bays an act holds */
export function runBuild(X, lv, skip = {}) {
  runClear(lv);
  const st = X.M.st, R = RUNS[lv], ps = runPosts(lv, st), P = st.posts[lv], all = [];
  const out = { posts: [], slabs: {}, warns: {}, holes: [], close: null, all };
  if (SH3.final) {
    // the stage done: the site's own soreg stands whole; the warning slabs stay, in their frames, set against it on the Mount's side
    const W = warnOf(lv), Wn = st.warn[lv];
    ps.forEach((p, i) => {
      if (!(p.warn || (i === W.at && Wn && Wn.done))) return;
      const n = LINE[p.line], q = { ...p, x: p.x + n[0] * 0.42, z: p.z + n[1] * 0.42 };
      const m = postMesh(X, q); out.posts[i] = m; all.push(m);
      const s = warnSeat(lv, i, [...ps.slice(0, i), q, ...ps.slice(i + 1)]), g = warnSlab(X, W.word, p.warn ? 0 : (Wn.cov >= 0.5 ? 1 : Wn.cov));
      g.position.set(s.x, s.y, s.z); g.rotation.y = s.yaw; out.warns[i] = g; all.push(g);
    });
    SH3.runs[lv] = out; SH3.keys[lv] = runKey(lv, st);
    return out;
  }
  ps.forEach((p, i) => {
    if (p.k && !(P && P.done) && !skip.posts) {
      // the crews dug its hole on the lime line (spec 1: "שורת גומות לאורך קו הסיד")
      const T = X.THREE, h = new T.Mesh(new T.CircleGeometry(0.42, 14), mats(X).hole); h.rotation.x = -Math.PI / 2; h.position.set(R.posts[i].x, X.ground(R.posts[i].x, R.posts[i].z) + 0.04, R.posts[i].z); X.props.root.add(h); out.holes[i] = h; all.push(h);
      return;
    }
    if (p.k && skip.posts) return;
    const m = postMesh(X, p); out.posts[i] = m; all.push(m);
  });
  const bay = (a, b, o = {}) => {
    const F = bayFrame(lv, a, b, ps);
    const sill = new X.THREE.Mesh(X.props.geo.box, mats(X).marbleD); sill.scale.set(F.L - halfW(F.A) - halfW(F.B), H112.SILL, 0.3); sill.position.set(F.cx, H112.SILL / 2, F.cz); sill.rotation.y = F.yaw; X.props.root.add(sill); all.push(sill);
    if (o.noSlab) return null;
    const g = latticeSlab(X, { type: R.pattern, s0: F.s0, W: o.W || F.W, outer: F.ns, shift: 0 });
    g.position.set(F.cx, H112.SILL + H112.SLAB_H / 2, F.cz); g.rotation.y = F.yaw; out.slabs[`${a}-${b}`] = g; all.push(g);
    return g;
  };
  for (const [a, b] of R.crewBays) bay(a, b);
  const S = st.slabs[lv];
  const posted = P && P.done && !skip.posts;
  R.bays.forEach(([a, b], j) => { if (posted) bay(a, b, { noSlab: !(S && S.laid && S.laid[j]) || skip[`${a}-${b}`] }); });
  // the warning slabs: the crews' (already set) and his (once set, its word painted)
  ps.forEach((p, i) => { if (p.warn) { const s = warnSeat(lv, i, ps), g = warnSlab(X, warnOf(lv).word, 0); g.position.set(s.x, s.y, s.z); g.rotation.y = s.yaw; out.warns[i] = g; all.push(g); } });
  const Wn = st.warn[lv];
  if (Wn && Wn.done && !skip.warn) { const W = warnOf(lv), s = warnSeat(lv, W.at, ps), g = warnSlab(X, W.word, Wn.cov >= 0.5 ? 1 : Wn.cov); g.position.set(s.x, s.y, s.z); g.rotation.y = s.yaw; out.warns[W.at] = g; all.push(g); }
  const C = st.close[lv];
  if (posted) { const [a, b] = R.close; out.close = bay(a, b, { W: C && C.done ? Math.min(C.w, bayFrame(lv, a, b, ps).W) : 0, noSlab: !(C && C.done) || skip.close }); }
  SH3.runs[lv] = out; SH3.keys[lv] = runKey(lv, st);
  return out;
}

/* ───────── the steps of the east axis ───────── */
function stepsKey(st) { return JSON.stringify(st.steps || {}); }
/** the kohen's flight as laid (n stones; h: each one's height error), the fill behind it at the next stone's bed */
export function stepsBuild(X, o = {}) {
  const T = X.THREE, M = mats(X), st = X.M.st, S = st.steps || { n: 0, h: [] };
  if (SH3.steps) for (const m of SH3.steps.all) X.props.remove(m);
  const all = [], stones = [];
  const W = STEPS.z1 - STEPS.z0, zc = (STEPS.z0 + STEPS.z1) / 2;
  const n = SH3.final ? 0 : o.n != null ? o.n : S.n;
  for (let k = 1; k <= n; k++) {
    const s = stepOf(k), e = (S.h && S.h[k - 1]) || 0;
    const m = stepStone(X, k); m.position.set(s.face - s.D / 2, s.top - H112.STEP / 2 + e, zc); stones.push(m); all.push(m);
    // the fill under it (the crews' rammed earth)
    if (s.bed > 0.01) { const f = new T.Mesh(X.props.geo.box, M.earth); f.scale.set(s.D, s.bed, W - 0.02); f.position.set(s.face - s.D / 2, s.bed / 2, zc); X.props.root.add(f); all.push(f); }
  }
  // the bed for the next stone: the fill raised to the top of the last one, from behind it to the Chel's podium
  const top = n * H112.STEP;
  if (n > 0 && n < 11) { const s = stepOf(n), x1 = s.face - s.D, x0 = STEPS.x0; if (x1 - x0 > 0.05) { const f = new T.Mesh(X.props.geo.box, M.earthT); f.scale.set(x1 - x0, top, W - 0.02); f.position.set((x0 + x1) / 2, top / 2, zc); f.receiveShadow = true; X.props.root.add(f); all.push(f); } }
  if (SH3.final) { SH3.steps = { all, stones, n: 0 }; SH3.stepKey = stepsKey(st); return SH3.steps; }
  // the podium's own ashlar core behind the flight (the opening is keyed half an amah into it): up to the 11th stone's bed; above it the
  // notch the coping (the 12th) fills, flush with the Chel's floor
  { const c = new T.Mesh(X.props.geo.box, M.ash); c.scale.set(157.0 - STEPS.x0, 5.0, W - 0.02); c.position.set((STEPS.x0 + 157.0) / 2, 2.5, zc); c.receiveShadow = true; X.props.root.add(c); all.push(c); }
  SH3.steps = { all, stones, n }; SH3.stepKey = stepsKey(st);
  return SH3.steps;
}
/** the floor of his flight as laid (stages.floorHook): the stones, the bed behind the last, the podium's core; null outside it, and
 *  once the stage is done (the site's own steps show then) */
export function flightFloor(x, z) {
  if (SH3.final || x < STEPS.x0 || x > STEPS.hole[2] || z < STEPS.z0 || z > STEPS.z1) return null;
  const st = SH3.X && SH3.X.M && SH3.X.M.st, S = (st && st.steps) || { n: 0, h: [] }, n = SH3.steps ? SH3.steps.n : S.n | 0;
  let y = 0;
  if (x < 157) y = n >= 12 ? 6 : 5.0;
  for (let k = 1; k <= n; k++) { const s = stepOf(k); if (x <= s.face + 1e-3 && x >= s.face - s.D - 1e-3) y = Math.max(y, s.top + ((S.h && S.h[k - 1]) || 0)); }
  if (n > 0 && n < 11 && x <= stepOf(n).face - stepOf(n).D) y = Math.max(y, n * H112.STEP);
  return y;
}
export function stepStone(X, k) {
  const T = X.THREE, s = stepOf(k), geo = (X.stages.ashlar && X.stages.ashlar.geometry) || X.props.geo.box;
  mats(X); const m = new T.Mesh(geo, X.props.ashOf(k * 5.3 + 1.1, { set: 1 })); m.scale.set(s.D, H112.STEP, STEPS.z1 - STEPS.z0 - 0.04); m.castShadow = true; m.receiveShadow = true; X.props.root.add(m); return m;
}

/* ───────── the crews keep out of the act's frame (rule 19: nothing between the eye and the work; crews.js keepOut) ───────── */
/** an act's camera (rule 15: the work large): its shots come in to SH3.camD amot of their target (OrbitControls' 35 give way while
 *  an act holds the site: keep()), never nearer than that — the acts frame each shot's direction, this sets its distance */
export const CAM_D = 24;
function nearShots(X) {
  if (X.__h112shot) return; const raw = X.__h112shot = X.shot;
  X.shot = (p, t, dur) => {
    if (SH3.busy && p && t) {
      // (a macro shot, under 4 amot: the delicate moment, rule 16, comes in to 6)
      const dx = p[0] - t[0], dy = p[1] - t[1], dz = p[2] - t[2], L = Math.hypot(dx, dy, dz) || 1, D = L < 4 ? 6 : SH3.camD || CAM_D, k = D / L;
      p = [t[0] + dx * k, t[1] + dy * k, t[2] + dz * k];
    }
    return raw(p, t, dur);
  };
}
export function keep(X, rects) {
  try { if (X.view && X.view.closeCam) X.view.closeCam(!!(rects && rects.length), 'h112-act'); } catch (e) { /* */ }
  try { if (X.stages.keepOut) X.stages.keepOut(rects || []); } catch (e) { /* */ }
  // (and the crews' own crane rests while he works: its jib swung through his frame)
  try { if (X.stages.craneOff) X.stages.craneOff(!!(rects && rects.length)); } catch (e) { /* */ }
}
/** the axis-aligned box round some points, with a margin */
export function boxOf(pts, m = 0) { const xs = pts.map((p) => p.x), zs = pts.map((p) => p.z); return [Math.min(...xs) - m, Math.min(...zs) - m, Math.max(...xs) + m, Math.max(...zs) + m]; }
/** a bay's work frame: the bay, the stands beside it, the crane, the camera on the Mount's side */
export function bayKeep(F, far = 15) { const c = { x: F.cx, z: F.cz }, a = (k, n) => ({ x: c.x + F.ux * k + F.nx * n, z: c.z + F.uz * k + F.nz * n }); return boxOf([a(-(F.W / 2 + 9), -1.5), a(F.W / 2 + 11, -1.5), a(-(F.W / 2 + 9), far), a(F.W / 2 + 11, far)]); }

/* ───────── the crane and the ox-cart (the acts place them) ───────── */
export function cartMake(X) {
  const T = X.THREE, P = X.props, g = new T.Group();
  const bed = new T.Mesh(new T.BoxGeometry(4.2, 0.25, 2.2), P.M.wood); bed.position.y = 1.05; bed.castShadow = true; g.add(bed);
  for (const s of [-1, 1]) { const rail = new T.Mesh(new T.BoxGeometry(4.2, 0.35, 0.12), P.M.woodD); rail.position.set(0, 1.3, s * 1.05); g.add(rail); }
  for (const s of [-1, 1]) { const w = new T.Mesh(new T.CylinderGeometry(0.85, 0.85, 0.2, 14), P.M.woodD); w.rotation.x = Math.PI / 2; w.position.set(0, 0.85, s * 1.25); g.add(w); }
  const pole = new T.Mesh(new T.BoxGeometry(3.6, 0.14, 0.14), P.M.woodD); pole.position.set(3.6, 1.0, 0); g.add(pole);
  X.props.root.add(g);
  const C = { g, oxen: [], drover: null, top: 1.18 };
  C.place = (x, z, yaw) => {
    g.position.set(x, X.ground(x, z), z); g.rotation.y = yaw; g.visible = true;
    const an = X.stages.crewAnimals || null; const fx = Math.cos(yaw), fz = -Math.sin(yaw);
    if (an && !C.oxen.length) for (const s of [-0.75, 0.75]) { const h = an.add('bull', x + fx * 6 - fz * s, z + fz * 6 + fx * s, { yaw: Math.atan2(fx, fz), calm: true }); if (h) C.oxen.push(h); }
    else C.oxen.forEach((h, i) => { const s = i ? 0.75 : -0.75; h.x = x + fx * 6 - fz * s; h.z = z + fz * 6 + fx * s; h.yaw = Math.atan2(fx, fz); });
  };
  C.hide = () => { g.visible = false; const an = X.stages.crewAnimals; for (const h of C.oxen) { try { an.remove(h); } catch (e) { /* */ } } C.oxen = []; };
  C.hide();
  return C;
}

/* ───────── the act's labels (a count over a thing): DOM chips that follow a world point ───────── */
export function label(X) {
  const el = document.createElement('div'); el.className = 'h109-ui h112-lab'; document.body.appendChild(el);
  const L = { el, at: null, set(text, at) { el.textContent = text; L.at = at; el.style.display = text ? '' : 'none'; }, frame() { if (!L.at) return; const q = X.scr(L.at.x, L.at.y, L.at.z); el.style.left = q.x + 'px'; el.style.top = q.y + 'px'; el.style.opacity = q.on ? '1' : '0'; }, remove() { el.remove(); const i = SH3.labels.indexOf(L); if (i >= 0) SH3.labels.splice(i, 1); } };
  SH3.labels.push(L); return L;
}
let cssOn = false;
function css() {
  if (cssOn) return; cssOn = true;
  const st = document.createElement('style');
  st.textContent = `.h112-lab{transform:translate(-50%,-50%);font:900 16px/1 Heebo,system-ui;color:#3A2608;background:rgba(255,246,222,.94);border:2px solid #C8A04A;border-radius:12px;padding:3px 8px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.25);direction:rtl}
.h112-lab.hot{background:#FFE7A0}
.h112-goal{display:flex;align-items:center;gap:6px;padding:4px 12px 4px 10px;border-radius:18px;background:rgba(255,248,228,.92);color:#5A3A0A;font:900 16px/1 Heebo,system-ui;box-shadow:0 2px 6px rgba(0,0,0,.18);pointer-events:none;direction:rtl;white-space:nowrap}
.h112-goal small{font:700 11px/1 Heebo,system-ui;color:#8A6A3A}`;
  document.head.appendChild(st);
}
/** the 13 at the top (spec: "מונה היעד למעלה סופר אותם"), beside the streak chip */
function goalChip(X) {
  if (!SH3.chip) { SH3.chip = document.createElement('div'); SH3.chip.className = 'h112-goal'; SH3.chip.innerHTML = '<span>▦</span><b>0/13</b><small>לוחות הסורג</small>'; }
  const top = document.querySelector('.gm-top'); if (!top) return;
  const after = top.querySelector('.h109-chip') || top.querySelector('.gm-sc'); const host = (after && after.parentNode) || top;
  if (SH3.chip.parentNode !== host) { if (after && after.nextSibling) host.insertBefore(SH3.chip, after.nextSibling); else host.appendChild(SH3.chip); }
  const n = X.M ? X.M.slabsLaid() : 0; const b = SH3.chip.querySelector('b'); const t = `${n}/13`; if (b.textContent !== t) b.textContent = t;
}

/* ───────── the openings the crews leave for him (the site's reveal drops its own soreg and steps there) ───────── */
export function holeRects() {
  const out = [];
  for (const lv of [1, 2, 3]) for (const r of RUNS[lv].hole) out.push(r);
  out.push(STEPS.hole);
  return out;
}
function holesSync(X) { if (SH3.final) return; try { if (X.stages.siteHoles) X.stages.siteHoles('sorag', holeRects(), -1, 6.02); } catch (e) { /* */ } }

/* ───────── the world as the save has it ───────── */
export function initWorld(X) {
  css(); mats(X);
  SH3.X = X; SH3.B = createBeat(X); SH3.crew = createGang(X);
  SH3.crane = makeCrane(X); SH3.crane.g.visible = false; try { SH3.crane.rope.show(false); } catch (e) { /* */ }
  SH3.cart = cartMake(X);
  for (const lv of [1, 2, 3]) runBuild(X, lv);
  stepsBuild(X);
  holesSync(X);
  try { if (X.stages.floorHook) X.stages.floorHook(flightFloor); } catch (e) { /* */ }
  nearShots(X);
}
/** the stage done (its finale, or a game loaded after it): the kohen's own pieces give way to the site's, but the warning slabs */
export function finalWorld(X) {
  if (!SH3.X) return;
  SH3.final = 1;
  for (const lv of [1, 2, 3]) runBuild(X, lv);
  stepsBuild(X);
  try { X.stages.siteHoles('sorag', [], -1, 6.02); } catch (e) { /* */ }
  try { if (SH3.crane) { SH3.crane.g.visible = false; SH3.crane.rope.show(false); } if (SH3.cart) SH3.cart.hide(); } catch (e) { /* */ }
}
/** what the save has and the world does not show yet (a mission passed without being played; a run an act has just closed) */
function ensureWorld(X) {
  const st = X.M && X.M.st; if (!st) return;
  const cur = X.mission, acting = !!SH3.busy;
  for (const lv of [1, 2, 3]) { if (acting && cur && cur.lv === lv && cur.k !== 'steps') continue; if (SH3.keys[lv] !== runKey(lv, st)) runBuild(X, lv); }
  if (!(acting && cur && cur.k === 'steps') && SH3.stepKey !== stepsKey(st)) stepsBuild(X);
}
/* ───────── every frame ───────── */
let jT = 0;
export function frameWorld(dt, X) {
  if (!SH3.B) return;
  SH3.B.step(dt); if (SH3.crew) SH3.crew.update(dt, SH3.B);
  jT -= dt; if (jT <= 0) { jT = 0.5; holesSync(X); ensureWorld(X); goalChip(X); }
  for (const L of SH3.labels) L.frame();
}
export function disposeChip() { try { if (SH3.chip) SH3.chip.remove(); } catch (e) { /* */ } }
export { clamp };
