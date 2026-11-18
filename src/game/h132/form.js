/* ── build 132 ── h132/form.js — work 1 "הקמת התבנית" (spec docs/specs/shlav-09-he.md, עבודה 1). LANE A's file.
 * The four walls lie round the yesod. First the four stakes: at NW, NE and SW a short shoulder rod lies on the yesod's top — the left
 * thumb slides it in until it stops, a tap drives the stake beside it; at SE (no yesod) a tap on the pour's line drives it. The stake man
 * strikes each with his wooden mallet. Then the walls: the left thumb touches a wall and drags up; the wall follows the thumb's speed
 * late (0.6 s), heavy, and goes on after the thumb stops; at rest it is judged (form-model.js). The crew of four — one at each wall,
 * a wooden pole in his hands — push as the thumb drags and hold the locked walls. A locked wall: a flash at its corners, a heavy wooden
 * sound, "מושלם!" for a 40. The fourth closes: a ring of dust, the camera rises. Level 3: the wind's signs (the flag, the dust cloud),
 * then the gust; a raised wall not locked sways, and is steadied by a drag against its sway.
 * No text on screen but the words of a result; no side button; no gauge. The right thumb is the camera. No iron: wood on wood.
 *   FORM_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { LOSS, WORDS } from './model.js';
import { FK, WALLS, STAKES, RODS, fresh, load, save, rodTo, stakeTap, stakesIn, canGrab, grab, push, release, step, shown, result, done, windOn, signOf } from './form-model.js';
import { addLane, SH9, wallSet } from './world.js';
import { WALLS3D, hold, dress, wallHead, wallHinge, outward } from './walls3d.js';
import { fmats, rodMesh, rodAt, stakeMesh, seLine, flagMesh, flap, cloudMesh, cloudAt } from './form3d.js';
import { figTest } from '../h131/frame3d.js';
import { createVoices } from '../h129/sound129.js';
import { fingers, MOUSE } from '../h113/acts.js';
import { createGang, createBeat, onPlane, clamp } from '../h109/kit.js';

addLane(WALLS3D);

const S9 = BOOK.s09, Y0 = S9.base, F = S9.floor, H = S9.H, MID = S9.mid;
/** the act's numbers: how near a finger must be (px), a tap's most travel (px) and time (s), the thumb's degrees per pixel (as a share
 *  of the screen's height: half the height lifts a wall from lying to upright), the shots (amot), the lens, the mallet's blows (s) */
export const FA = Object.freeze({
  PICK: 54, PICKM: 34, TAP: 12, TAPT: 0.35, HALF: 0.5,
  FOV: 50, CORNER_R: [11, 22], CORNER_UP: 0.62, CORNER_TURN: 0.75, WIDE: S9.cam.w1,
  MALLET: 1.5, FALL: 150, STAKE_OUT: 0.55, ROD_L: 0.5,
});
const CORNER_ORDER = ['NE', 'NW', 'SW', 'SE'];
/** a wall lying and upright (deg); the hint hand's longest gesture (px); the buzz of a lock (ms) */
const LIE = 0, UP = 90, HM = 80, BZ = Object.freeze({ lock: '20 30 20'.split(' ').map(Number) });
const DIAG = { NE: [1, -1], NW: [-1, -1], SW: [-1, 1], SE: [1, 1] };
const r2 = (v) => +(+v).toFixed(2);

export const FORM_ACT = {
  icon: '🪵',
  title: 'הקמת התבנית',
  walkLine: () => '',
  stand() { const s = S9.stand.w1; return { x: s[0], z: s[1], face: [MID[0], MID[1]] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, Mo = X.M, lv = m.lv | 0 || 1, V = createVoices(X.sfx), Mt = fmats(X);
    const root = new T.Group(); root.name = 'h132-form-act'; X.props.root.add(root);
    const A = { t: 0, ev: [], fl: null, phase: 'stakes', cur: null, busy: 0, done: 0, hintK: '', shotK: '', shotT: -9, holdT: 0, va: {}, hz: 0, sayT: 0 };
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
    // ── the work in hand: a fresh one, or the one a reload broke off
    const b0 = Mo.workOf('form');
    let S = b0 && b0.id === m.id ? load(b0) : null; const resumed = !!S;
    if (!S) S = fresh(lv);
    let n0 = -1; const keep = () => { if (S.n === n0) return; n0 = S.n; Mo.keep('form', save(S, m.id)); X.save(); };
    // ── the things: the rods, the stakes (waiting, or driven), the SE line, the wind's flag and cloud
    const rods = {}; for (const k of RODS) rods[k] = rodAt(rodMesh(X, k, root), k, S.rods[k]);
    for (const k of RODS) rods[k].children[0].scale.x = FA.ROD_L, rods[k].children[0].position.x = -FA.ROD_L / 2 + 0.06;
    const stakes = {}; for (const k of STAKES) { const g = stakeMesh(X, root); const p = stakeAt(k); g.position.set(p[0], Y0 + (S.stakes[k] ? 0 : 0.95), p[1]); g.visible = !!S.stakes[k]; stakes[k] = g; }
    const se = seLine(X, root);
    const flag = lv === 3 ? flagMesh(X, root) : null, cloud = lv === 3 ? cloudMesh(X, root) : null;
    function stakeAt(k) { const [x, z] = S9.corner[k], d = DIAG[k]; return [x + d[0] * FA.STAKE_OUT, z + d[1] * FA.STAKE_OUT]; }
    // ── the camera
    const cam0 = X.camera, fov0 = cam0.fov, fig = figTest(T);
    const lens = (f) => { try { cam0.fov = f; cam0.updateProjectionMatrix(); } catch (e) { /* */ } };
    // ── the figures: the stake man (stakes), the wall crew (walls)
    const Bt = createBeat(X), gang = createGang(X);
    let man = null; const crew = {};
    const now1 = (w) => { if (w && w.a) w.a.vis = 1; return w; };
    // (outside the corner, north or south of it — never west of the west face, where the Ulam's steps are — on the court's floor)
    function manAt(k) { const [x, z] = S9.corner[k], d = DIAG[k]; return [x + d[0] * (k.includes('W') ? 0.7 : 1.5), z + d[1] * 2.6]; }
    function castMan(k) {
      gang.clear(); man = null; for (const q of WALLS) crew[q] = null;
      const p = manAt(k), s = stakeAt(k);
      man = now1(gang.add(p[0], p[1], { role: 'hold', item: 'mallet', fx: s[0], fz: s[1], crew: 1 }));
    }
    /** a crewman's place by his wall: outside its head as it lies (the west one inside, on the yesod's top), at its face upright */
    function crewAt(k, deg) {
      const h = wallHinge(k), n = outward(k), s = h.inside ? -1 : 1, a = (Math.max(0, Math.min(95, deg)) * Math.PI) / 180, u = k === 'N' || k === 'E' ? 0.42 : 0.58;
      const d = H * Math.cos(a) + 1.25, x0 = h.p[0] + h.along[0] * h.L * u, z0 = h.p[1] + h.along[1] * h.L * u;
      return [x0 + s * n[0] * d, z0 + s * n[1] * d, x0, z0, h.inside ? Y0 : F];
    }
    function castCrew() {
      gang.clear(); man = null;
      for (const k of WALLS) {
        const p = crewAt(k, A.va[k] || 0), w = now1(gang.add(p[0], p[1], { role: 'brace', item: 'staff', fx: p[2], fz: p[3], crew: WALLS.indexOf(k) }));
        if (w && w.a) { w.a.fixedY = p[4]; w.a.y = p[4]; }
        crew[k] = w;
      }
    }
    // ── the shots: a corner close (the stake man whole, the rod and the stake large) or the whole form (the walls, the four men)
    function cornerShot(k) {
      const [x, z] = S9.corner[k], d = DIAG[k], asp = cam0.aspect || 1.6, p = manAt(k), aim = [x, Y0 + 0.4, z];
      const turn = FA.CORNER_TURN * (k === 'NE' || k === 'SW' ? 1 : -1), c = Math.cos(turn), s = Math.sin(turn);
      const dx = (d[0] * c - d[1] * s) / Math.SQRT2, dz = (d[0] * s + d[1] * c) / Math.SQRT2;
      for (let R = FA.CORNER_R[0]; R <= FA.CORNER_R[1]; R += 1) {
        const eye = [x + dx * R, Y0 + R * FA.CORNER_UP, z + dz * R];
        if (fig([eye, aim], FA.FOV, asp, p[0], F, p[1], aim, 0.82) === 'whole') return [eye, aim];
      }
      ev('shot:nofit:' + k); const R = FA.CORNER_R[1]; return [[x + dx * R, Y0 + R * FA.CORNER_UP, z + dz * R], aim];
    }
    function wideShot() {
      const asp = cam0.aspect || 1.6, [e0, aim] = FA.WIDE, dx = e0[0] - aim[0], dy = e0[1] - aim[1], dz = e0[2] - aim[2];
      for (let f = 1; f <= 1.6; f += 0.05) {
        const eye = [aim[0] + dx * f, aim[1] + dy * f, aim[2] + dz * f];
        const ok = WALLS.every((k) => [LIE, UP].every((dg) => { const p = crewAt(k, dg); return fig([eye, aim], FA.FOV, asp, p[0], p[4], p[1], null, 0.9) === 'whole'; }));
        if (ok) return [eye, aim];
      }
      ev('shot:nofit:wide'); return [[aim[0] + dx * 1.6, aim[1] + dy * 1.6, aim[2] + dz * 1.6], aim];
    }
    function shotTo(key, P, ease) { A.shotK = key; A.shotT = A.t; lens(FA.FOV); X.shot(P[0].slice(), P[1].slice(), ease); ev('shot:' + key); }
    const nextCorner = () => CORNER_ORDER.find((k) => !S.stakes[k]) || null;
    function plan(ease = 0.9) {
      if (A.fl != null || A.done) return;
      if (!stakesIn(S)) { const k = nextCorner(); if (k !== A.cur || A.shotK !== 'c:' + k) { A.cur = k; castMan(k); shotTo('c:' + k, cornerShot(k), ease); hint(true); } return; }
      if (A.phase !== 'walls') { A.phase = 'walls'; A.cur = null; castCrew(); shotTo('wide', wideShot(), ease); hint(true); }
    }
    // ── the hint hand (rule 25: one, in the free trial: the first rod, the first wall)
    function hint(force) {
      let k = '', at = null, dx = 0, dy = 0;
      if (A.phase === 'stakes' && A.cur && S.n === 0) {
        const c = A.cur;
        if (RODS.includes(c) && S.rods[c] < 1) { const R = S9.rod[c], a = X.scr(R.from[0], Y0 + 0.2, R.from[1]), b = X.scr(R.to[0], Y0 + 0.2, R.to[1]); k = 'rod' + c; at = { x: R.from[0], y: Y0 + 0.2, z: R.from[1] }; dx = clamp(b.x - a.x, -HM, HM); dy = clamp(b.y - a.y, -HM, HM); }
      } else if (A.phase === 'walls' && S.free && S.hold == null) { const w = WALLS.find((q) => S.W[q].st !== 'lock'); if (w) { const p = wallHead(w, A.va[w] || 0); k = 'wall' + w; at = { x: p[0], y: p[1], z: p[2] }; dy = -90; } }
      if (!force && k === A.hintK) return; A.hintK = k; X.hand(at, dx, dy);
    }
    // ── the fingers
    const sp = (x, y, z) => X.scr(x, y, z);
    const PR = () => (MOUSE ? FA.PICKM : FA.PICK);
    const segD = (p, a, b) => { const vx = b.x - a.x, vy = b.y - a.y, L2 = vx * vx + vy * vy || 1, u = clamp(((p.x - a.x) * vx + (p.y - a.y) * vy) / L2, 0, 1); return Math.hypot(p.x - a.x - vx * u, p.y - a.y - vy * u); };
    /** what a finger at f takes: { k: 'rod', c } | { k: 'stake', c } | { k: 'wall', w } | null */
    function pick(f) {
      if (A.busy || A.done) return null;
      if (A.phase === 'stakes') {
        const c = A.cur; if (!c) return null;
        if (RODS.includes(c) && S.rods[c] < 1) {
          const R = S9.rod[c], u = S.rods[c], h = [R.from[0] + (R.to[0] - R.from[0]) * u, R.from[1] + (R.to[1] - R.from[1]) * u];
          const a = sp(h[0], Y0 + 0.2, h[1]), b = sp(h[0] - (R.to[0] - R.from[0]) * 0.5, Y0 + 0.2, h[1] - (R.to[1] - R.from[1]) * 0.5);
          return segD(f, a, b) < PR() * 1.3 ? { k: 'rod', c } : null;
        }
        const s = stakeAt(c), q = sp(s[0], Y0 + 0.4, s[1]), q2 = sp(S9.corner[c][0], Y0, S9.corner[c][1]);
        return Math.min(Math.hypot(f.x - q.x, f.y - q.y), Math.hypot(f.x - q2.x, f.y - q2.y)) < PR() * 1.4 ? { k: 'stake', c } : null;
      }
      let best = null, bd = PR();
      for (const k of WALLS) {
        if (!canGrab(S, k)) continue;
        const dg = A.va[k] || 0, a = sp(...wallHead(k, dg, 0.1)), b = sp(...wallHead(k, dg, 0.9)), c = sp(...mid3(k, dg, 0.1)), d = sp(...mid3(k, dg, 0.9));
        const dd = Math.min(segD(f, a, b), segD(f, c, d), segD(f, a, c) + 9, segD(f, b, d) + 9, inQuad(f, a, b, d, c) ? 0 : 1e9);
        if (dd < bd) { bd = dd; best = { k: 'wall', w: k }; }
      }
      return best;
    }
    function mid3(k, dg, u) { const h = wallHead(k, dg, u), hh = wallHinge(k), x0 = hh.p[0] + hh.along[0] * hh.L * u, z0 = hh.p[1] + hh.along[1] * hh.L * u; return [(h[0] + x0) / 2, (h[1] + Y0) / 2, (h[2] + z0) / 2]; }
    function inQuad(p, a, b, c, d) { const s = (P, Q, R) => (Q.x - P.x) * (R.y - P.y) - (Q.y - P.y) * (R.x - P.x); const q = [s(a, b, p), s(b, c, p), s(c, d, p), s(d, a, p)]; return q.every((v) => v >= 0) || q.every((v) => v <= 0); }
    /** a world point's place along a rod's slide (0 the outer corner, 1 the block's corner) */
    function rodU(c, p) { const R = S9.rod[c], vx = R.to[0] - R.from[0], vz = R.to[1] - R.from[1]; return ((p.x - R.from[0]) * vx + (p.z - R.from[1]) * vz) / (vx * vx + vz * vz); }
    const KPX = () => 90 / (FA.HALF * (innerHeight || 600));
    const FG = fingers(X, {
      down(f) {
        if (A.fl != null) return; const k = pick(f); if (!k) { try { if (X.lookHome) X.lookHome(); } catch (e) { /* */ } return; }
        A.fl = f.id; f.w = { ...k, ly: f.y, t0: A.t };
        if (k.k === 'rod') { const p = onPlane(X, f.x, f.y, Y0 + 0.2); f.w.off = p ? S.rods[k.c] - rodU(k.c, p) : 0.3; }
        if (k.k === 'wall') { if (grab(S, k.w)) { ev('grab:' + k.w); X.hand(null); A.hintK = 'x'; } else A.fl = null; }
      },
      move(f) {
        const w = f.w; if (!w || A.fl !== f.id) return;
        if (w.k === 'rod' && f.moved > FA.TAP * 0.5) {
          const p = onPlane(X, f.x, f.y, Y0 + 0.2); if (!p) return;
          const R = S9.rod[w.c], was = S.rods[w.c], now = rodTo(S, w.c, rodU(w.c, p) + w.off);
          if (now > was + 1e-3) { V.scrape(0.5); if (now >= 1 && was < 1) { V.knock(0.8); X.dust(R.to[0], Y0 + 0.2, R.to[1], 3, 1); ev('rodHome:' + w.c); X.hand(null); } }
        } else if (w.k === 'wall') { push(S, (w.ly - f.y) * KPX()); w.ly = f.y; }
      },
      up(f) {
        const w = f.w; if (!w || A.fl !== f.id) return; A.fl = null; V.scrape(0);
        if (w.k === 'wall') { release(S); ev('let:' + w.w); keep(); return; }
        if (w.k === 'rod') { keep(); return; }
        if (w.k === 'stake' && f.moved <= FA.TAP && A.t - w.t0 <= FA.TAPT * 2) drive(w.c);
      },
    });
    /** the stake driven: the man strikes it with his wooden mallet; it sinks on the blows */
    function drive(c) {
      const r = stakeTap(S, c); if (!r.ok) return;
      const s = stakeAt(c), at = { x: s[0], y: Y0 + 1.2, z: s[1] };
      stakes[c].visible = true; stakes[c].position.y = Y0 + 0.95; A.sink = { c, t: 0 };
      V.knock(1.2); X.dust(s[0], Y0 + 0.2, s[1], 4, 1.4);
      X.hit(at, 'ok', { text: '' }); ev('stake:' + c);
      if (man) gang.setRole(man, 'hammer', { item: 'mallet', fx: s[0], fz: s[1], stride: 0 });
      A.holdT = A.t + FA.MALLET; A.busy = 1;
      X.wait(FA.MALLET).then(() => { A.busy = 0; if (man) gang.setRole(man, 'brace', { item: 'mallet', fx: s[0], fz: s[1] }); keep(); });
    }
    // ── what the model says each step: a lock, a fall, a catch, the order
    function cornersOf(k) { return k === 'N' ? ['NW', 'NE'] : k === 'S' ? ['SW', 'SE'] : k === 'E' ? ['NE', 'SE'] : ['NW', 'SW']; }
    function onEvent(e) {
      const k = e.wall, hd = wallHead(k, 90), at = { x: hd[0], y: Y0 + H * 0.7, z: hd[2] };
      if (e.k === 'lock') {
        V.thud(); V.lock(WALLS.indexOf(k)); X.shake(0.18, 0.3); try { if (X.haptic) X.haptic(BZ.lock); } catch (er) { /* */ }
        for (const c of cornersOf(k)) { const [x, z] = S9.corner[c]; X.sparks(x, Y0 + H * 0.6, z, 10); X.dust(x, Y0 + 0.3, z, 4, 1.2); }
        X.hit(at, e.pts >= 40 ? 'gold' : e.pts >= 20 ? 'good' : 'ok', { text: '' });
        if (e.pts >= 40) X.quick(at, WORDS.quick, SH9.walls && SH9.walls[k] ? SH9.walls[k].grp.children[0] : null);
        ev('lock:' + k + ':' + e.how + ':' + e.at);
        if (e.last) close();
      } else if (e.k === 'crack') {
        A.fall = A.fall || {}; A.fall[k] = 1; V.crack(); V.thud(); X.shake(0.3, 0.45);
        const hdl = wallHead(k, 0); X.dust(hdl[0], F + 0.5, hdl[2], 18, 4);
        const p = Mo.flaw('form.crack', { wall: k, n: S.dmg - 1, at: [r2(hdl[0]), r2(hdl[2])] });
        X.loss(p, { x: hdl[0], y: F + 2, z: hdl[2] }, LOSS['form.crack'][0]);
        ev('crack:' + k);
      } else if (e.k === 'caught') { V.groan(); A.fall = A.fall || {}; A.fall[k] = 1; ev('caught:' + k); }
      else if (e.k === 'order') { V.groan(); A.fall = A.fall || {}; A.fall[k] = 1; X.loss(0, at, ''); ev('order:' + k); }
      else if (e.k === 'sway') { V.creak(0.5); ev('sway:' + k); }
      else if (e.k === 'still') { V.creak(0); ev('still:' + k); }
      keep();
    }
    // ── the close: a ring of dust round the form, the camera rises over it
    async function close() {
      A.done = 1; A.phase = 'done'; release(S); keep();
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; X.dust(MID[0] + Math.cos(a) * 17, Y0 + 0.4, MID[1] + Math.sin(a) * 17, 8, 3); }
      V.dust(); X.shake(0.25, 0.4);
      for (const k of WALLS) if (crew[k]) gang.setRole(crew[k], 'hold', { fx: MID[0], fz: MID[1], stride: 0 });
      const res = result(S);
      await X.wait(1.2);
      if (res.perfect) { try { X.perfect(WORDS.form, { x: MID[0], y: Y0 + H, z: MID[1] }); } catch (e) { /* */ } await X.wait(1.0); }
      const [e0, aim] = FA.WIDE;
      X.end({ stars: res.stars, q: res.q, pts: res.pts, perfect: res.perfect, flags: res.flags, at: { x: MID[0], y: Y0 + H, z: MID[1] },
        film: { eye: [e0[0] + 6, e0[1] + 16, e0[2] - 8], aim: aim.slice(), secs: 2.2, ease: 2.0, kohen: false, own: () => gang.list.map((w) => w.a), after: () => { try { gang.clear(); } catch (e) { /* */ } } } });
    }
    // ── drawing
    function draw(dt) {
      for (const k of WALLS) {
        const tgt = shown(S, k); let v = A.va[k] == null ? tgt : A.va[k];
        if (A.fall && A.fall[k]) { v = Math.max(tgt, v - FA.FALL * dt * (1 + (A.fallT = (A.fallT || 0) + dt))); if (v <= tgt + 0.01) { A.fall[k] = 0; A.fallT = 0; if (tgt === 0) { const p = wallHead(k, 0); X.dust(p[0], F + 0.4, p[2], 10, 3); V.thud(); } } }
        else if (Math.abs(tgt - v) > 8 && S.W[k].st === 'lock') v += Math.sign(tgt - v) * Math.min(Math.abs(tgt - v), 60 * dt);   // (pulled back by the crew)
        else v = tgt;
        A.va[k] = v; wallSet(k, v);
        if (SH9.walls && SH9.walls[k]) SH9.walls[k].grp.visible = true;
      }
      for (const k of RODS) rodAt(rods[k], k, S.rods[k]);
      if (A.sink) { A.sink.t += A.t - (A.sink.l || A.t); A.sink.l = A.t; const u = Math.min(1, A.sink.t / (FA.MALLET * 0.8)); stakes[A.sink.c].position.y = Y0 + 0.95 * (1 - Math.floor(u * 3) / 3); if (u >= 1) { stakes[A.sink.c].position.y = Y0; A.sink = null; } }
      se.visible = !S.stakes.SE;
      if (flag) { const s = signOf(S); flap(flag, s, A.t); cloudAt(cloud, s); }
      // the crew: each by his wall, pushing while it moves under the thumb, holding it when still
      if (A.phase !== 'stakes') for (const k of WALLS) {
        const w = crew[k]; if (!w || !w.a) continue; const dg = A.va[k] || 0, p = crewAt(k, Math.min(90, dg));
        const dd = Math.hypot(w.a.x - p[0], w.a.z - p[1]); if (dd > 0.02) { const kk = 1 - Math.exp(-dt * 6); w.a.x += (p[0] - w.a.x) * kk; w.a.z += (p[1] - w.a.z) * kk; }
        const moving = S.W[k].st === 'up' && (Math.abs(S.W[k].v) > 2 || S.hold === k || S.W[k].swayA > 0), want = moving ? 'push' : 'brace';
        if (w.role !== want || (!!w.stride) !== (dd > 0.15)) gang.setRole(w, want, { item: 'staff', fx: p[2], fz: p[3], stride: dd > 0.15 ? 0.6 : 0, rate: 1.4 });
        w.fx = p[2]; w.fz = p[3];
      }
    }
    let rumT = 0;
    return {
      close: true,
      begin() {
        hold('form', true); dress(X); fmats(X);
        try { X.kohen(false); } catch (e) { /* */ }
        for (const k of WALLS) { A.va[k] = shown(S, k); if (SH9.walls && SH9.walls[k]) { SH9.walls[k].grp.visible = true; wallSet(k, A.va[k]); } }
        FG.attach(); X.line('', 0);
        if (stakesIn(S)) { A.phase = 'stakes'; plan(0.01); } else plan(0.01);
        ev(resumed ? 'resume' : 'begin'); keep();
      },
      update(dt) {
        A.t += dt;
        try {
          V.frame(); Bt.step(dt); gang.update(dt, Bt);
          if (!A.done) {
            const E = step(S, dt); for (const e of E) onEvent(e);
            if (S.lv === 3 && windOn(S) && !A.windSaid) { A.windSaid = 1; V.dust(); X.shake(0.12, 0.25); ev('gust'); }
            // the rumble and the long buzz while a wall swings, fading as it settles
            const sw = Math.max(0, ...WALLS.map((k) => (S.W[k].st === 'up' ? Math.abs(S.W[k].v) : 0)));
            V.scrape(A.fl != null && S.hold == null ? 0.5 : Math.min(1, sw / 70));
            rumT -= dt; if (sw > 6 && rumT <= 0) { rumT = 0.28; try { if (X.haptic) X.haptic(Math.round(6 + Math.min(24, sw / 4))); } catch (e) { /* */ } }
          }
          draw(dt);
          if (!A.busy && A.t >= A.holdT) plan();
        } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h132] form', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
      },
      down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { release(S); A.fl = null; V.scrape(0); keep(); },
      wants(p) { if (!p) return true; return !!pick(p); },
      holds() { return A.fl != null; },
      end() {
        FG.detach(); V.stop(); X.hand(null); lens(fov0);
        if (!A.done) gang.clear();
        X.props.remove(root); hold('form', false);
      },
      at() { return new T.Vector3(MID[0], Y0 + 1, MID[1]); },
      dbg() {
        const s2 = (x, y, z) => { const r = X.scr(x, y, z); return [Math.round(r.x), Math.round(r.y)]; };
        const R = result(S), o = { id: m.id, lv, phase: A.phase, cur: A.cur, busy: A.busy, done: A.done, t: +A.t.toFixed(2), ev: A.ev.slice(-10), n: S.n, pts: R.pts, max: R.max, dmg: S.dmg, breaks: S.breaks, free: S.free, hold: S.hold, mouse: MOUSE, kpx: +KPX().toFixed(4) };
        o.settled = A.t - A.shotT > 1.2 && A.t >= A.holdT && !A.busy;
        if (A.phase === 'stakes' && A.cur) {
          const c = A.cur, s = stakeAt(c); o.stakeAt = s2(s[0], Y0 + 0.4, s[1]); o.rodU = RODS.includes(c) ? r2(S.rods[c]) : null;
          if (RODS.includes(c)) { const Rr = S9.rod[c], u = S.rods[c], h = [Rr.from[0] + (Rr.to[0] - Rr.from[0]) * u, Rr.from[1] + (Rr.to[1] - Rr.from[1]) * u]; o.rod = { at: s2(h[0] - (Rr.to[0] - Rr.from[0]) * 0.2, Y0 + 0.2, h[1] - (Rr.to[1] - Rr.from[1]) * 0.2), to: s2(Rr.to[0] + (Rr.to[0] - Rr.from[0]) * 0.5, Y0 + 0.2, Rr.to[1] + (Rr.to[1] - Rr.from[1]) * 0.5) }; }
        }
        o.stakes = { ...S.stakes }; o.placed = STAKES.filter((k) => S.stakes[k]).length + WALLS.filter((k) => S.W[k].st === 'lock').length;
        o.walls = WALLS.map((k) => { const w = S.W[k], dg = A.va[k] || 0; return { k, st: w.st, a: r2(w.a), v: r2(w.v), how: w.how, sway: r2(w.swayA), swayV: r2(Math.cos(w.swayP)), at: s2(...mid3(k, dg, 0.5)) }; });
        o.wind = S.lv === 3 ? { sign: r2(signOf(S)), on: windOn(S), tw: S.tw == null ? null : r2(S.tw), gust: FK.WIND.GUST, dur: FK.WIND.DUR } : null;
        o.figs = { man: man && man.a ? [r2(man.a.x), r2(man.a.z)] : null, crew: WALLS.map((k) => (crew[k] && crew[k].a ? [r2(crew[k].a.x), r2(crew[k].a.z)] : null)) };
        o.mallet = !!(man && man.role === 'hammer'); o.shot = A.shotK;
        const cp = cam0.position; o.cam = [cp.x, cp.y, cp.z].map((v) => +v.toFixed(1));
        return o;
      },
    };
  },
};
void done;
