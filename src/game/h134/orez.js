/* ── build 134 ── h134/orez.js — work 1 "אריזת הקרנות", one corner's station (spec docs/specs/shlav-11-he.md, עבודה 1; the rules:
 * orez-model.js). Also the repair of a flawed horn (fix<c>: the whole horn again, at the level it was flawed at) and a packing's replay
 * (the second layer only); both go on at once into the extraction of the same horn (chilutz.js makeExtract), "רצף אחד אוטומטי".
 * From above, 30° off the vertical: the frame takes about 70 % of the screen's height in the middle; the pebbles spread on the priests'
 * walk at the left (each over 48 px); past the outer edge the sovev's step and the Mount below. The kohen kneels by the corner and is out
 * of the picture: only his hands. The two crewmen of the corner by the pot.
 *   · the WORK hand (the first finger on a pebble, anywhere on the screen) lifts it (0.15 s late: it is heavy), drags it over the ring —
 *     the shadow of its footprint on the cells it would land on (level 1 also the gold ghost of where it belongs) — and lets go;
 *   · the HELPING hand (a second finger while one holds) turns the held pebble a quarter for every quarter round it, and flips it with a
 *     tap; the mouse: the wheel turns, the right button flips (and R / F);
 *   · a finger on nothing, with nothing held, is the camera's: on the left it pans the view a little (a far pebble to the middle), on the
 *     right the director's look lifts and pulls back (rule 66: the right thumb is the camera only when the game has no use for it);
 *   · the layer closes with a tap on the pot once 92 cells are covered and nothing is loose (a full ring closes by itself).
 *   OREZ_ACT · FIX_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { WORDS, CORNER_OF } from './model.js';
import { fresh, load, save, lift, drop, step, canClose, full, close, result, ghost, fits, cellsOf, covered, anyLoose, tarShine, secondOnly, sideOf, OK } from './orez-model.js';
import { orient, N, setOf } from './sets.js';
import { RING } from './sets.js';
import { mats11, CELL, LAYER_H, cellXZ, pebbleGeo, viewOf } from './look.js';
export { viewOf };
import { hornGroup, own, SH11 } from './world.js';
import { award, extra, hurt, zero, finish, V3, lens, voices, px360, MIN_GRIP } from './kit11.js';
import { createSalt } from './salt.js';
import { makeExtract } from './chilutz.js';
import { box } from '../h131/world.js';
import { fingers } from '../h113/acts.js';
import { createGang, createBeat, onPlane } from '../h109/kit.js';

const S11 = BOOK.s11, Y = S11.top;
export const OA = Object.freeze({ FOV: 16, DIST: 4.6, TILT: 18, LIFT_SHOW: 0.25, HOVER: 0.14, TRAY_U: [-1.34, -0.62], TRAY_V: [-0.6, 0.34], POT: [0.86, 0.42], PAN: 0.45, TAP_T: 0.25, TAP_D: 12 });
const MOUSE = typeof matchMedia === 'function' && matchMedia('(pointer: fine)').matches;

function stand(m) { const c = m.corner || CORNER_OF(m.k), h = S11.horns[c]; return { x: h.stand[0], z: h.stand[1], face: h.core.slice() }; }

function makeOrez(m, X, mode) {
  const T = X.THREE, Mo = X.M, c = m.corner, h = S11.horns[c], lv = m.lv | 0 || 1, V = voices(X), Mt = mats11(X);
  const HC = Mo.st.horns[c], replay = mode === 'orez' && Mo.isReplay(m), fix = mode === 'fix', chainOn = replay || fix;
  const root = new T.Group(); root.name = 'h134-orez-act'; X.props.root.add(root);
  const A = { t: 0, ev: [], ended: false, finished: false, busy: 0, w: null, hp: null, pan: null, panUV: [0, 0], seat: [], salt: null, chain: null, fallAnim: null, layerT: 0 };
  const ev = (e) => { A.ev.push(e); if (A.ev.length > 20) A.ev.shift(); };
  // ── the work: resumed (the same station, the same level), or fresh; a replay packs the second layer only
  const b0 = Mo.workOf(m.k);
  let S = b0 && b0.id === m.id ? load(b0) : null; if (S && (S.lv !== lv || S.done)) S = null; const resumed = !!S;
  if (!S) { S = fresh(c, lv, { free: !(Mo.st.done || []).some((id) => /^(orez|fix)/.test(id)) && !fix }); if (replay && HC.layers) secondOnly(S, HC.layers.l1, HC.layers.p1); }
  else if (b0.replay) S.replay = true;
  if (S.layer >= 2 && !S.l1P) S.l1P = setOf(c, S.lv, 1).map((p, i) => ({ i, id: p.id, shape: p.shape }));
  let k0 = ''; const keep = () => { const b = save(S, m.id); b.replay = !!S.replay; const k = JSON.stringify(b); if (k === k0) return; k0 = k; Mo.keep(m.k, b); X.save(); };
  // ── the horn: the act draws it while it plays (the world leaves it); what stands of it now
  own('horn:' + c, true);
  const V3c = (u, v, y) => { const { f, r } = VW; return new T.Vector3(h.core[0] + r[0] * u + f[0] * v, y, h.core[1] + r[1] * u + f[1] * v); };
  const VW = viewOf(c);
  const ring = new T.Group(); root.add(ring);
  const fixed = new T.Group(); root.add(fixed);   // (the first layer standing in a replay; the pitch beds; the core)
  function drawFixed() {
    while (fixed.children.length) fixed.remove(fixed.children[0]);
    const st2 = { horns: { [c]: { ...HC, packed: S.layer >= 2 ? 1 : 0, cored: 0, layers: S.layer >= 2 ? { l1: l1Cells(), l2: [], p1: S.pitchBelow.map((k) => [Math.floor(k / 16), k % 16]), p2: [] } : null } }, flaws: Mo.st.flaws.filter((x) => x.corner === c && !(x.f === 'chilutz.scuff')) };
    const g = hornGroup(X, c, st2, { skip: { l2: true, basket: true, frame: true } }); fixed.add(g);
  }
  const l1Cells = () => (S.replay && HC.layers ? HC.layers.l1 : (S.seats1 || []).map((q) => ({ c: cellsOf(S.l1P[q.i] || S.P[q.i], q.at.o, q.at.x, q.at.z), s: q.i + 1 })));
  // the frame (the crews set it before the work): four beams round the amah, 5 tefachim high; the pot of pitch and its fire
  const frame = new T.Group(); root.add(frame);
  { const [x0, z0, x1, z1] = h.box, t = 0.06; for (const q of [[x0 - t, z0 - t, x1 + t, z0], [x0 - t, z1, x1 + t, z1 + t], [x0 - t, z0, x0, z1], [x1, z0, x1 + t, z1]]) box(X, Mt.y11wood, q[0], Y, q[1], q[2], Y + S11.hornH + 0.02, q[3], frame).name = 'h134-frame'; }
  const potAt = V3c(OA.POT[0], OA.POT[1], Y);
  const pot = new T.Group(); root.add(pot); pot.position.copy(potAt);
  { const b = new T.Mesh(new T.CylinderGeometry(0.17, 0.13, 0.22, 14), Mt.y11woodD); b.position.y = 0.11; pot.add(b); const p = new T.Mesh(new T.CircleGeometry(0.15, 14), Mt.y11pitch); p.rotation.x = -Math.PI / 2; p.position.y = 0.215; p.name = 'h134-pot-pitch'; pot.add(p); pot.userData.top = p; const gl = new T.Mesh(new T.TorusGeometry(0.2, 0.025, 6, 20), Mt.y11glow); gl.rotation.x = Math.PI / 2; gl.position.y = 0.23; gl.visible = false; pot.add(gl); pot.userData.glow = gl; }
  // the pebbles' meshes: one per pebble and orientation (cached)
  const GEO = new Map();
  const geoOf = (p, o) => { const k = p.id + ':' + o; if (!GEO.has(k)) GEO.set(k, pebbleGeo(T, orient(p.shape, o), p.i + 1 + (S.layer === 2 ? 20 : 0), LAYER_H)); return GEO.get(k); };
  let MESH = [];
  const base = () => Y + (S.layer === 2 ? LAYER_H : 0);
  // ── the tray: where each pebble waits on the priests' walk (fixed, its own orientation: 0)
  let TRAY = [];
  function layoutTray() {
    const [u0, u1] = OA.TRAY_U, [v0, v1] = OA.TRAY_V;
    for (let s = 1; s >= 0.4; s -= 0.05) {
      const out = []; let u = u0, v = v1, colW = 0, ok = true;
      for (const p of S.P) {
        const c0 = orient(p.shape, 0); const w = (Math.max(...c0.map((q) => q[0])) + 1) * CELL * s, d = (Math.max(...c0.map((q) => q[1])) + 1) * CELL * s;
        // (the tray's u runs along the view's right, its v along its forward; a pebble's world x/z → its own w (along r) and d (along f))
        const wu = Math.abs(VW.r[0]) > 0.5 ? w : d, dv = Math.abs(VW.r[0]) > 0.5 ? d : w;
        if (v - dv < v0) { u += colW + 0.05; v = v1; colW = 0; }
        if (u + wu > u1 + 1e-6) { ok = false; break; }
        out.push({ u: u + wu / 2, v: v - dv / 2, s }); v -= dv + 0.05; colW = Math.max(colW, wu);
      }
      if (ok) { TRAY = out; return; }
    }
    TRAY = S.P.map((p, i) => ({ u: u0 + 0.1 + (i % 3) * 0.2, v: v1 - 0.1 - Math.floor(i / 3) * 0.2, s: 0.4 }));
  }
  // ── the bed (build 134, the first still: white pebbles on the white top did not read): each free ring cell a warm sand-pitch square,
  //    the joints between them white — the grid the pebbles fill shows, and a seated pebble stands out against it
  const bed = new T.Group(); bed.name = 'h134-bed'; root.add(bed);
  const bedMat = new T.MeshStandardMaterial({ color: '#A8916B', roughness: 0.95, flatShading: true });
  function drawBed() { while (bed.children.length) bed.remove(bed.children[0]); for (const [x, z] of RING) { const [wx, wz] = cellXZ(h, x, z); const q = box(X, bedMat, wx - CELL * 0.44, base() + 0.002, wz - CELL * 0.44, wx + CELL * 0.44, base() + 0.008, wz + CELL * 0.44, bed); q.castShadow = false; } }
  function rebuild() {
    drawBed();
    for (const q of MESH) if (q) ring.remove(q);
    MESH = S.P.map((p) => { const mm = new T.Mesh(geoOf(p, p.at ? p.at.o : 0), Mt['y11stone' + c]); mm.castShadow = true; mm.receiveShadow = true; mm.name = 'h134-pebble'; ring.add(mm); return mm; });
    layoutTray(); drawFixed();
  }
  // where a pose's middle lies in the world (its cells' middle) and the cells' grid → world
  const midOf = (p, o, x, z) => { const cs = cellsOf(p, o, x, z); let a = 0, b = 0; for (const [u, v] of cs) { a += u + 0.5; b += v + 0.5; } a /= cs.length; b /= cs.length; return [h.box[0] + a * CELL, h.box[1] + b * CELL]; };
  const gridOf = (wx, wz) => [(wx - h.box[0]) / CELL, (wz - h.box[1]) / CELL];
  // ── the shadow and the ghost (level 1): flat quads on the cells
  const shade = new T.Group(); root.add(shade);
  const ghostG = new T.Group(); root.add(ghostG);
  const looseG = new T.Group(); root.add(looseG); let looseK = '';   // (build 134, the review: the cells under a loose pebble glow red)
  function cellsQuads(G, cells, mat, y) { while (G.children.length) G.remove(G.children[0]); for (const [x, z] of cells || []) { const [wx, wz] = cellXZ(h, x, z); const q = box(X, mat, wx - CELL * 0.46, y, wz - CELL * 0.46, wx + CELL * 0.46, y + 0.004, wz + CELL * 0.46, G); q.castShadow = false; q.receiveShadow = false; } }
  // ── the crew: two men by the pot (they pour, lift the frame); the kohen out of the picture
  const Bt = createBeat(X), gang = createGang(X), crew = [];
  function castMen() { gang.clear(); crew.length = 0; for (const [u, v] of [[1.15, 0.0], [1.15, 0.8]]) { const p = V3c(u, v, Y); const w = gang.add(p.x, p.z, { role: 'hold', crew: 1, fx: h.core[0], fz: h.core[1] }); if (w && w.a) w.a.fixedY = Y; crew.push(w); } }
  // ── the camera: 30° off the vertical, forward along the view's outer axis
  const cam0 = X.camera, fov0 = cam0.fov;
  function home(d = 0) {
    lens(X, OA.FOV);
    const [pu, pv] = A.panUV, t = V3c(pu, pv, Y + 0.3), a = (OA.TILT * Math.PI) / 180;
    X.shot([t.x - VW.f[0] * OA.DIST * Math.sin(a), t.y + OA.DIST * Math.cos(a), t.z - VW.f[1] * OA.DIST * Math.sin(a)], [t.x, t.y, t.z], d);
  }
  // ── picking: the top face that holds the point first, else the nearest edge within the grip
  const scrOf = (v) => { const r = X.scr(v.x, v.y, v.z); return { x: r.x, y: r.y }; };
  function cellPx() { const a = scrOf(V3c(0, 0, base())), b = scrOf(V3c(CELL, 0, base())); return Math.max(4, Math.hypot(a.x - b.x, a.y - b.y)); }
  function screenCells(i) {
    const p = S.P[i], mm = MESH[i]; if (!mm || !mm.visible) return [];
    const o = p.at ? p.at.o : 0, cs = orient(p.shape, o), g = geoOf(p, o).userData, s = mm.scale.x, out = [];
    for (const [x, z] of cs) { const lx = (x + 0.5 - g.cx) * CELL * s, lz = (z + 0.5 - g.cz) * CELL * s; out.push(scrOf(new T.Vector3(mm.position.x + lx, mm.position.y + LAYER_H * s, mm.position.z + lz))); }
    return out;
  }
  function pick(f) {
    const cp = cellPx(); let best = -1, bd = 1e9, inside = -1;
    S.P.forEach((p, i) => {
      if (p.back > 0 || p.spare > 0) return; const sc = screenCells(i), half = cp * (p.at ? 1 : TRAY[i] ? TRAY[i].s : 1) * 0.55;
      for (const q of sc) { const d = Math.max(Math.abs(q.x - f.x), Math.abs(q.y - f.y)); if (d <= half && inside < 0) inside = i; const e = Math.hypot(q.x - f.x, q.y - f.y) - half; if (e < bd) { bd = e; best = i; } }
    });
    if (inside >= 0) return inside;
    return bd <= MIN_GRIP * px360() ? best : -1;
  }
  const onPot = (f) => { const p = scrOf(potAt.clone().add(new T.Vector3(0, 0.2, 0))); return Math.hypot(f.x - p.x, f.y - p.y) < Math.max(MIN_GRIP * px360() * 1.3, cellPx() * 3); };
  // ── the held pebble: its pose from the finger (its middle a tefach and a half ahead of the thumb, so the shadow is not under it)
  function poseOf(i, f, o) {
    const p = S.P[i], g = onPlane(X, f.x, f.y, base() + LAYER_H); if (!g) return null;
    g.x += VW.f[0] * OA.LIFT_SHOW; g.z += VW.f[1] * OA.LIFT_SHOW;
    const cs = orient(p.shape, o); let a = 0, b = 0; for (const [u, v] of cs) { a += u + 0.5; b += v + 0.5; } a /= cs.length; b /= cs.length;
    const [gx, gz] = gridOf(g.x, g.z);
    return { o, x: Math.round(gx - a), z: Math.round(gz - b), mx: gx, mz: gz, wx: g.x, wz: g.z };
  }
  // ── the fingers by role
  const FG = fingers(X, {
    down(f) {
      if (A.finished || A.busy === 2) return;
      if (A.salt && A.salt.on) { if (!A.salt.down(f) && !A.salt.helperDown(f)) { /* */ } return; }
      if (A.chain) { A.chain.down(f); return; }
      if (A.busy) return;
      if (A.w) {
        // a second finger while one holds: the helping hand (always on the held pebble, never another)
        if (!A.hp && A.w.i >= 0) { A.hp = { id: f.id, x0: f.x, y0: f.y, t0: A.t, a: null, acc: 0 }; ev('help'); }
        return;
      }
      if (onPot(f)) { A.w = { id: f.id, pot: true, x0: f.x, y0: f.y, t0: A.t }; return; }
      const i = pick(f);
      if (i >= 0 && lift(S, i)) { const p = S.P[i]; A.w = { id: f.id, i, o: p.at ? p.at.o : (TRAY[i] && TRAY[i].o) || 0, t0: A.t, x: f.x, y: f.y, from: p.at ? { ...p.at } : null, lifted: false }; p.wasLoose = p.loose; p.at = null; p.loose = false; X.hand(null); ev('lift:' + p.id); return; }
      A.pan = { id: f.id, x0: f.x, y0: f.y, uv0: A.panUV.slice() };   // (nothing under it: the camera's)
    },
    move(f) {
      if (A.salt && A.salt.on) { A.salt.move(f); return; }
      if (A.chain) { A.chain.move(f); return; }
      if (A.hp && f.id === A.hp.id && A.w && A.w.i >= 0) {
        const c0 = heldScr(); const a = Math.atan2(f.y - c0.y, f.x - c0.x);
        if (A.hp.a == null) A.hp.a = a; else { let d = a - A.hp.a; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; A.hp.acc += d; A.hp.a = a; while (A.hp.acc > Math.PI / 2) { A.hp.acc -= Math.PI / 2; turn(1); } while (A.hp.acc < -Math.PI / 2) { A.hp.acc += Math.PI / 2; turn(-1); } }
        A.hp.moved = Math.max(A.hp.moved || 0, Math.hypot(f.x - A.hp.x0, f.y - A.hp.y0)); return;
      }
      if (A.w && f.id === A.w.id) {
        A.w.x = f.x; A.w.y = f.y;
        if (f.chord && A.w.i >= 0) { const b2 = (f.chord.buttons & 2) !== 0; if (b2 && !A.w.b2) flip(); A.w.b2 = b2; }
        return;
      }
      if (A.pan && f.id === A.pan.id) { const k = 1 / Math.max(1, innerHeight); A.panUV = [Math.max(-OA.PAN, Math.min(OA.PAN, A.pan.uv0[0] - (f.x - A.pan.x0) * k * 1.6)), Math.max(-OA.PAN, Math.min(OA.PAN, A.pan.uv0[1] + (f.y - A.pan.y0) * k * 1.6))]; home(0.01); }
    },
    up(f) {
      if (A.salt && A.salt.on) { A.salt.up(f); return; }
      if (A.chain) { A.chain.up(f); return; }
      if (A.hp && f.id === A.hp.id) { const tap = A.t - A.hp.t0 < OA.TAP_T && (A.hp.moved || 0) < OA.TAP_D; if (tap && !A.hp.dead && A.w && A.w.i >= 0) flip(); A.hp = null; return; }
      if (A.w && f.id === A.w.id) {
        const W = A.w; A.w = null; if (A.hp) A.hp.dead = true;   // (the work hand off first: the helping hand stays with no role until it lifts)
        if (W.pot) { if (Math.hypot(f.x - W.x0, f.y - W.y0) < 20 && onPot(f)) tryClose(); return; }
        letGo(W, f); return;
      }
      if (A.pan && f.id === A.pan.id) A.pan = null;
    },
  });
  const heldScr = () => { const mm = A.w && A.w.i >= 0 ? MESH[A.w.i] : null; return mm ? scrOf(mm.position) : { x: innerWidth / 2, y: innerHeight / 2 }; };
  function turn(dir) { if (!A.w || A.w.i < 0) return; const o = A.w.o; A.w.o = (o & 4) | ((o + (dir > 0 ? 1 : 3)) & 3); V.bump && V.bump(); ev('turn'); }
  function flip() { if (!A.w || A.w.i < 0) return; const o = A.w.o, r = o & 3; A.w.o = ((o & 4) ^ 4) | ((4 - r) & 3); V.knock(2); ev('flip'); }
  const onWheel = (e) => { if (A.salt && A.salt.on) { A.salt.wheel(e.deltaY); return; } if (A.w && A.w.i >= 0) { turn(e.deltaY > 0 ? 1 : -1); try { e.preventDefault(); } catch (er) { /* */ } } };
  const onKey = (e) => { if (!A.w || A.w.i < 0) { if (A.salt && A.salt.on && /^[rR]$/.test(e.key)) A.salt.wheel(1); return; } if (/^[rR]$/.test(e.key)) turn(1); else if (/^[fF]$/.test(e.key)) flip(); };
  function letGo(W, f) {
    const i = W.i, p = S.P[i];
    if (!W.lifted) { /* (a touch shorter than the lift's lag: it seats where it was, or goes back) */ }
    const q = poseOf(i, f, W.o);
    if (!q) { S.held = -1; p.at = null; p.loose = false; keep(); return; }   // (no ground under the finger: back to the basket)
    // (its middle in grid cells: the side it lands on — inward the priests' walk, outward the sovev)
    const r = drop(S, q.o, q.x, q.z, q.mx, q.mz, h.in);
    after(r, i, q);
  }
  function after(r, i, q) {
    if (!r) return; const p = S.P[i], at = MESH[i] ? MESH[i].position.clone() : V3(X, h.core[0], Y, h.core[1]);
    ev(r.k + ':' + p.id);
    if (r.k === 'seat') { A.seat.push({ i, t: 0 }); V.click(); try { X.dust(at.x, base() + 0.1, at.z, 3, 0.06); } catch (e) { /* */ } }
    else if (r.k === 'loose') { V.bump(); X.shake(0.05, 0.12); }
    else if (r.k === 'lip') { V.bump(); X.shake(0.04, 0.1); try { X.line('כמעט נפל! החלוק חזר לסל', 1600); } catch (e) { /* */ } }
    else if (r.k === 'fall') {
      A.fallAnim = { i, t: 0, from: at, to: V3(X, h.core[0] - h.in[0] * 1.3, S11.top - 3 + 0.05, h.core[1] - h.in[1] * 1.3) };
      if (!r.free) {
        const hit = V3(X, h.core[0] - h.in[0] * 0.5, Y + S11.hornH * 0.6, h.core[1] - h.in[1] * 0.5);
        hurt(X, Mo, 'orez.fall', hit, { corner: c, lv, layer: S.layer });
        V.crack(); keep(); saltNow(hit);
      } else { try { X.line('ניסוי חינם: החלוק חוזר לסל', 1800); } catch (e) { /* */ } }
    }
    keep();
  }
  function saltNow(hit) {
    A.salt = createSalt(X, { at: [hit.x, hit.y, hit.z], corner: c, onDone: () => { Mo.salted(c); keep(); X.save(); V.knock(1.2); A.salt = null; }, onLater: () => { A.salt = null; } });
  }
  async function tryClose() {
    if (A.busy || !canClose(S)) {
      if (!A.busy) {
        V.bump(); pot.position.x += 0.01; setTimeout(() => { pot.position.copy(potAt); }, 120);
        // (build 134, the review: a tap that does nothing reads as a stuck game — the loose pebbles jump, and one line says why)
        try { if (anyLoose(S)) { A.looseJump = 0.5; X.line('חלוק רופף (באדום): הזיזו אותו עד שיישב במקום', 2000); } else X.line(`עוד לא: לכסות עוד ${OK.CLOSE - covered(S)} משבצות`, 1800); } catch (e) { /* */ }
      }
      return;
    }
    A.busy = 1; X.hand(null);
    const layer = S.layer, snap = S.P.filter((p) => p.at && !p.loose).map((p) => ({ c: cellsOf(p, p.at.o, p.at.x, p.at.z), s: p.i + 1 })), keepP = S.P;
    const R = close(S); if (!R) { A.busy = 0; return; }
    if (layer === 1) S.l1P = keepP;
    ev('close:' + layer);
    // the crews pour: the black river round the ring, stopping at the lip
    for (const w of crew) if (w) gang.setRole(w, 'pour');
    V.pour();
    const pitch = new T.Group(); root.add(pitch); const pY = Y + (layer === 2 ? LAYER_H : 0);
    for (const [x, z] of R.pitch) { const [wx, wz] = cellXZ(h, x, z); box(X, Mt.y11pitch, wx - CELL / 2, pY, wz - CELL / 2, wx + CELL / 2, pY + LAYER_H * 0.94, wz + CELL / 2, pitch); }
    pitch.scale.y = 0.01; A.pour = { g: pitch, t: 0 };
    await X.wait(0.9); if (A.ended) return;
    for (const w of crew) if (w) gang.setRole(w, 'hold');
    // the account of the layer, every pebble once, where it lies
    let n = 0;
    for (const s of R.steps) { const p = keepP[s.i], mm = MESH[s.i]; const at = mm ? mm.position.clone().add(new T.Vector3(0, 0.3, 0)) : V3(X, h.core[0], Y + 0.4, h.core[1]); award(X, at, s.grade, lv, 'בונים'); n++; if (n % 3 === 0) await X.wait(0.05); void p; }
    if (R.left.length) zero(X, V3(X, h.core[0], Y + 0.6, h.core[1]), R.left.length === 1 ? 'חלוק אחד נשאר בסל' : `${R.left.length} חלוקים נשארו בסל`);
    const at0 = V3(X, h.core[0], Y + 0.7, h.core[1]);
    if (R.clean) extra(X, 40, lv, 'clean', 'שכבה נקייה');
    if (R.bonded) extra(X, 40, lv, 'bonded', 'שכבה קשורה');
    for (const cells of R.stains) {
      const xs = cells.map((q) => q[0]), zs = cells.map((q) => q[1]), side = Math.max(...xs) === N - 1 ? 'E' : Math.min(...xs) === 0 ? 'W' : Math.max(...zs) === N - 1 ? 'S' : 'N';
      const u = (side === 'E' || side === 'W' ? Math.min(...zs) : Math.min(...xs)) / N;
      hurt(X, Mo, 'orez.stain', at0, { corner: c, lv, layer, at: { side, u } });
    }
    if (R.ridge) hurt(X, Mo, 'orez.ridge', at0, { corner: c, lv, layer });
    // the layer's snapshot for the world
    if (layer === 1) { A.l1 = snap; A.p1 = R.pitch; } else { A.l2 = snap; A.p2 = R.pitch; }
    A.pour = null;
    if (layer === 1) {
      // the second layer: its own set, on the flat top of the first
      X.line('השכבה השנייה: כל חלוק על שני חלוקים שמתחתיו', 2600); rebuild(); A.busy = 0; keep(); return;
    }
    // the horn stands round the core: the frame comes off; the whole ring settles at once
    V.thud(); X.shake(0.1, 0.2);
    await liftFrame(); if (A.ended) return;
    HC.packed = 1; HC.rebuilt = (HC.rebuilt | 0) + (fix ? 1 : 0);
    HC.layers = { l1: S.replay && HC.layers ? HC.layers.l1 : A.l1 || [], l2: A.l2 || [], p1: S.replay && HC.layers ? HC.layers.p1 : A.p1 || [], p2: A.p2 || [], lv };
    if (replay || fix) HC.cored = 0;
    Mo.keep(m.k, null); X.save();
    const looks = Mo.st.flaws.filter((x) => x.corner === c && x.work === m.id && LOOKS.has(x.f)).length, flaws = Mo.st.flaws.filter((x) => x.corner === c && x.work === m.id && x.f === 'orez.fall').length;
    const res = result(S, { flaws, looks });
    if (!Mo.flawed(c)) HC.salt = 0;
    if (chainOn) { await chainExtract(res); return; }
    A.busy = 2;
    await finish(X, A, res, fix ? WORDS.fix : WORDS.orez, at0, film());
  }
  const LOOKS = new Set(['orez.stain', 'orez.ridge']);
  const film = () => ({ eye: [h.core[0] - VW.f[0] * 3.2, Y + 3.4, h.core[1] - VW.f[1] * 3.2], aim: [h.core[0], Y + 0.4, h.core[1]], secs: 1.6, kohen: false, own: () => (gang.list || []).map((w) => w.a), after: () => { try { Mo.filmOver(); } catch (er) { /* */ } try { gang.clear(); } catch (er) { /* */ } } });
  function liftFrame() { return new Promise((res) => { A.frameUp = { t: 0, res }; for (const w of crew) if (w) gang.setRole(w, 'pull'); }); }
  // ── the chained extraction (a replay, a repair): the core taken again from the new pitch, at once
  async function chainExtract(resOrez) {
    A.busy = 1; X.line('', 0);
    rebuildForChain();
    await new Promise((resolve) => {
      A.chain = makeExtract(X, { corner: c, lv, chained: true, root, onEnd: (rc) => { A.chainRes = rc; resolve(); } });
      A.chain.begin();
    });
    if (A.ended) return;
    const rc = A.chainRes || { stars: 1, q: 0, pts: 0 }; A.chain = null;
    Mo.doneChain(c, lv, rc);
    try { if (rc.stars > 0) X.bonus([0, 50, 100, 200][rc.stars], 'job' + rc.stars, `${'★'.repeat(rc.stars)} חילוץ הגוף`); } catch (e) { /* */ }
    HC.cored = 1; X.save(); home(0.6);
    // (build 134, the review: the repair shows — the salt's white patch gone, the horn whole, said in words)
    if (fix && !Mo.flawed(c)) { try { const p = V3(X, h.core[0], Y + 0.6, h.core[1]); X.sparks(p.x, p.y, p.z, 24); X.line('הקרן שלמה שוב: הטלאי של המלח הוסר', 2400); } catch (e) { /* */ } await X.wait(0.8); if (A.ended) return; }
    A.busy = 2;
    await finish(X, A, { ...resOrez, perfect: resOrez.perfect && rc.perfect }, fix ? WORDS.fix : WORDS.orez, V3(X, h.core[0], Y + 0.7, h.core[1]), film());
  }
  function rebuildForChain() {
    // (the act's own horn now as packed, the core in it: the extraction draws its core itself)
    for (const q of MESH) if (q) ring.remove(q); MESH = [];
    while (fixed.children.length) fixed.remove(fixed.children[0]);
    const g = hornGroup(X, c, { horns: { [c]: { ...HC, packed: 1, cored: 0 } }, flaws: Mo.st.flaws.filter((x) => x.corner === c) }, { skip: { core: true, basket: true } }); fixed.add(g);
    frame.visible = false; pot.visible = false; shade.visible = false; ghostG.visible = false;
  }
  // ── each frame
  function draw(dt) {
    const b = base(); bed.visible = !S.done && !A.chain && !A.finished;
    S.P.forEach((p, i) => {
      const mm = MESH[i]; if (!mm) return;
      const held = A.w && A.w.i === i;
      mm.visible = !(p.back > 0 || p.spare > 0) || held;
      if (held) {
        const q = poseOf(i, { x: A.w.x, y: A.w.y }, A.w.o), up = Math.min(1, (A.t - A.w.t0) / OK.LIFT_LAG);
        if (up >= 1) A.w.lifted = true;
        if (mm.geometry !== geoOf(p, A.w.o)) mm.geometry = geoOf(p, A.w.o);
        mm.scale.setScalar(1); mm.rotation.set(0, 0, 0);
        if (q) { const [mx, mz] = midOf(p, q.o, q.x, q.z); const sx = q.wx, sz = q.wz; mm.position.set(sx + (mx - sx) * 0.0, b + LAYER_H + OA.HOVER * up, sz); A.w.q = q;
          const out = sideOf(S, q.mx, q.mz, h.in), edge = out === 'lip' || out === 'fall';
          const cells = cellsOf(p, q.o, q.x, q.z); cellsQuads(shade, cells, fits(S, i, q.o, q.x, q.z) && !edge ? Mt.y11shadow : Mt.y11bad, b + 0.005); shade.visible = true;
          // (build 134, the review: over the outer lip the shadow turns red and a word warns, once a hold, before the finger lets go)
          if (edge && !A.w.warned) { A.w.warned = true; try { X.line(out === 'fall' ? 'זהירות! כאן החלוק נופל מהמזבח ונשבר' : 'זהירות: עוד קצת החוצה והחלוק נופל', 1600); } catch (e) { /* */ } } }
        if (lv === 1) { cellsQuads(ghostG, ghost(S, i), Mt.y11ghost, b + 0.003); ghostG.visible = true; } else ghostG.visible = false;
        return;
      }
      if (p.at) {
        if (mm.geometry !== geoOf(p, p.at.o)) mm.geometry = geoOf(p, p.at.o);
        const [mx, mz] = midOf(p, p.at.o, p.at.x, p.at.z); const sk = A.seat.find((s) => s.i === i);
        const sink = sk ? Math.max(0, 1 - sk.t / OK.SEAT) : 0;
        const wob = p.loose ? Math.sin(A.t * 7 + i) * 0.05 : 0, jump = p.loose && A.looseJump > 0 ? Math.abs(Math.sin(A.looseJump * 18)) * 0.08 : 0;
        mm.scale.setScalar(1); mm.position.set(mx, b + (p.loose ? 0.04 : 0) + 0.08 * sink + jump, mz); mm.rotation.set(p.loose ? 0.2 + wob : 0, 0, p.loose ? -0.14 - wob : 0);
      } else {
        const tr = TRAY[i] || { u: -1, v: 0, s: 0.5 }; if (mm.geometry !== geoOf(p, 0)) mm.geometry = geoOf(p, 0);
        const w = V3c(tr.u, tr.v, Y + 0.01); mm.scale.setScalar(tr.s); mm.position.copy(w); mm.rotation.set(0, 0, 0);
      }
    });
    if (!A.w) { shade.visible = false; ghostG.visible = false; }
    { const L = S.P.filter((p) => p.at && p.loose), k = L.map((p) => p.i + ':' + p.at.o + ':' + p.at.x + ':' + p.at.z).join('|'); if (k !== looseK) { looseK = k; cellsQuads(looseG, L.flatMap((p) => cellsOf(p, p.at.o, p.at.x, p.at.z)), Mt.y11bad, b + 0.006); } looseG.visible = !!L.length && !A.chain; }
    if (A.looseJump > 0) A.looseJump = Math.max(0, A.looseJump - dt);
    for (const s of A.seat) s.t += dt; A.seat = A.seat.filter((s) => s.t < OK.SEAT);
    // the pot glows once the layer may close; the pitch dulls in the level-3 window
    const cc = canClose(S) && !A.busy; pot.userData.glow.visible = cc; if (cc) pot.userData.glow.scale.setScalar(1 + 0.08 * Math.sin(A.t * 6));
    pot.userData.top.material = tarShine(S) < 0.35 ? Mt.y11pitchDull : Mt.y11pitch;
    if (A.pour) { A.pour.t += dt; A.pour.g.scale.y = Math.max(0.01, Math.min(1, A.pour.t / 0.8)); A.pour.g.position.y = (1 - A.pour.g.scale.y) * 0; }
    if (A.frameUp) { const F = A.frameUp; F.t += dt; frame.position.y = Math.min(1.5, F.t * 1.6); if (F.t > 0.9 && !F.done) { F.done = 1; frame.visible = false; for (const w of crew) if (w) gang.setRole(w, 'hold'); F.res(); } }
    if (A.fallAnim) { const F = A.fallAnim; F.t += dt; const k = Math.min(1, F.t / 0.6), mm = MESH[F.i]; if (mm) { mm.visible = true; mm.position.lerpVectors(F.from, F.to, k); mm.position.y = F.from.y + (F.to.y - F.from.y) * k * k; mm.rotation.x += dt * 6; } if (k >= 1) { try { X.dust(F.to.x, F.to.y, F.to.z, 8, 1); } catch (e) { /* */ } A.fallAnim = null; } }
  }
  function hint() {
    if (resumed || A.hintOn || !S.free) return; A.hintOn = 1;
    const i = S.P.findIndex((p) => !p.at); if (i < 0) return; const mm = MESH[i]; if (!mm) return;
    const a = scrOf(mm.position), b = scrOf(V3(X, h.core[0], Y, h.core[1]));
    X.hand({ x: mm.position.x, y: mm.position.y, z: mm.position.z }, Math.round((b.x - a.x) * 0.6), Math.round((b.y - a.y) * 0.6));
  }
  return {
    close: true,
    begin() {
      try { X.kohen(false); } catch (e) { /* (the kohen kneels by the corner, out of the picture: his hands) */ }
      castMen(); rebuild(); FG.attach(); home(0.01); X.line('', 0);
      // (build 134, the review: one short line at the start, gone at the first touch)
      if (!resumed && !(HC.salt === 1 && Mo.flawed(c))) { A.first = true; try { X.line(fix ? 'תיקון: אורזים את הקרן מחדש, ואחר כך מחלצים את הגוף' : S.layer >= 2 ? 'כל חלוק על שני חלוקים שמתחתיו: שכבה קשורה' : 'גררו חלוקים מהסל ומלאו את המסגרת. אצבע שנייה: טאפ מסובב, גרירה הופכת', 5000); } catch (e) { /* */ } }
      try { addEventListener('wheel', onWheel, { passive: false }); addEventListener('keydown', onKey); } catch (e) { /* */ }
      X.wait(0.8).then(() => { if (!A.ended) hint(); });
      if (HC.salt === 1 && Mo.flawed(c)) { const hit = V3(X, h.core[0] - h.in[0] * 0.5, Y + 0.4, h.core[1] - h.in[1] * 0.5); X.wait(0.6).then(() => { if (!A.ended && !A.salt) saltNow(hit); }); }
      ev(resumed ? 'resume' : replay ? 'replay' : fix ? 'fix' : 'begin'); keep();
    },
    update(dt) {
      A.t += dt;
      try {
        V.frame(); Bt.step(dt); gang.update(dt, Bt);
        if (A.chain) { A.chain.update(dt); return; }
        for (const e of step(S, dt)) { ev(e.k); if (e.k === 'thick') { try { X.line('הזפת מתקררת', 1400); } catch (er) { /* */ } } }
        if (A.salt) A.salt.update(dt);
        draw(dt);
        if (!A.busy && full(S)) tryClose();
        if (A.t % 1 < dt) keep();
      } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h134] orez', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
    },
    down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
    cancel() { if (A.w && A.w.i >= 0) { const p = S.P[A.w.i]; S.held = -1; if (A.w.from) { p.at = A.w.from; p.loose = !!p.wasLoose; } } A.w = null; A.hp = null; A.pan = null; keep(); },
    /** a touch is the act's when it lands on a work thing (a pebble, the pot, the salt), or a work hand already holds */
    wants(p) { if (!p) return true; if (A.chain) return A.chain.wants(p); if (A.salt && A.salt.on) return true; if (A.w) return true; return onPot(p) || pick(p) >= 0; },
    holds() { return !!A.w || !!(A.chain && A.chain.holds()); },
    lensFov: OA.FOV,
    end() {
      A.ended = true; FG.detach(); V.hush(); X.hand(null); lens(X, fov0);
      try { removeEventListener('wheel', onWheel); removeEventListener('keydown', onKey); } catch (e) { /* */ }
      if (A.salt) A.salt.end(); if (A.chain && A.chain.end) A.chain.end();
      try { gang.clear(); } catch (e) { /* */ } X.props.remove(root); own('horn:' + c, false);
      for (const g of GEO.values()) { try { g.dispose(); } catch (e) { /* */ } }
    },
    at() { return V3(X, h.core[0], Y + 0.5, h.core[1]); },
    dbg() {
      if (A.chain) return { id: m.id, chain: A.chain.dbg(), ev: A.ev.slice(-10) };
      const cp = cellPx(), pieces = S.P.map((p, i) => { const sc = screenCells(i); const ctr = sc.length ? { x: Math.round(sc.reduce((a, q) => a + q.x, 0) / sc.length), y: Math.round(sc.reduce((a, q) => a + q.y, 0) / sc.length) } : null; return { id: p.id, at: p.at, loose: p.loose, back: p.back > 0 || p.spare > 0, scr: ctr, sol: p.sol }; });
      const ringScr = (x, z) => { const [wx, wz] = cellXZ(h, x, z); const s = scrOf(new T.Vector3(wx, base() + LAYER_H, wz)); return [Math.round(s.x), Math.round(s.y)]; };
      return { id: m.id, lv, corner: c, layer: S.layer, covered: covered(S), canClose: canClose(S), loose: anyLoose(S), free: S.free, cellPx: +cp.toFixed(1), held: A.w ? { i: A.w.i, o: A.w.o, q: A.w.q || null } : null, help: !!A.hp,
        pieces, pot: (() => { const p = scrOf(potAt.clone().add(new T.Vector3(0, 0.2, 0))); return [Math.round(p.x), Math.round(p.y)]; })(), cell0: ringScr(0, 0), cell11: ringScr(11, 11), salt: A.salt ? A.salt.dbg() : null, busy: A.busy, finished: A.finished, ev: A.ev.slice(-10), fell: S.fell, tarT: S.tarT, replay: !!S.replay, fix };
    },
    /** (probes: a pose from grid cells → the screen point a finger lets go at, for pebble i at orientation o, anchor x, z) */
    aim(i, o, x, z) { const p = S.P[i]; if (!p) return null; const [mx, mz] = midOf(p, o, x, z); const v = new T.Vector3(mx - VW.f[0] * OA.LIFT_SHOW, base() + LAYER_H, mz - VW.f[1] * OA.LIFT_SHOW); const s = scrOf(v); return { x: s.x, y: s.y }; },
  };
}
export const OREZ_ACT = { icon: '🪨', title: 'אריזת הקרנות', walkLine: () => '', stand, prepare() {}, make(m, X) { return makeOrez(m, X, 'orez'); } };
export const FIX_ACT = { icon: '🧂', title: 'תיקון קרן פגומה', walkLine: () => '', stand, prepare() {}, make(m, X) { return makeOrez(m, X, 'fix'); } };
void SH11;
