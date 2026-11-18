/* ── build 132 ── h132/form.js — work 1 "הקמת התבנית" (spec docs/specs/shlav-09-he.md, עבודה 1). LANE A's file.
 * The four walls lie round the yesod. First the four stakes: at NW, NE and SW a short shoulder rod lies on the yesod's top — the left
 * thumb slides it in until it stops, a tap drives the stake beside it; at SE (no yesod) a tap on the pour's line drives it. The stake man
 * strikes each with his wooden mallet. Then the walls: the left thumb touches a wall and drags up; the wall follows the thumb's speed
 * late (0.6 s), heavy, and goes on after the thumb stops; at rest it is judged (form-model.js). The crew of four lift each wall
 * together — all four at the wall in hand, wooden poles against it, pushing as it rises — then walk round the form to the next one;
 * the shot comes close while a wall is lifted (the crew big and whole, the wall's angle read from its end) and goes wide between
 * walls and for the close. A locked wall: a flash at its corners, a heavy wooden
 * sound, "מושלם!" for a 40. The fourth closes: a ring of dust, the camera rises. Level 3: the wind's signs (the flag, the dust cloud),
 * then the gust; a raised wall not locked sways, and is steadied by a drag against its sway.
 * No text on screen but the words of a result; no side button; no gauge. The right thumb is the camera. No iron: wood on wood.
 *   FORM_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { LOSS, WORDS } from './model.js';
import { FK, WALLS, STAKES, RODS, fresh, load, save, rodTo, stakeTap, stakesIn, canGrab, grab, push, release, step, shown, result, done, windOn, signOf } from './form-model.js';
import { addLane, SH9, wallSet } from './world.js';
import { WALLS3D, hold, homeWalls, dress, wallHead, wallHinge, outward } from './walls3d.js';
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
  CREW_U: [0.2, 0.4, 0.6, 0.8], PACE: 7, RING: 3, CLOSE_R: { lo: 14, hi: 46 }, CLOSE_UP: 0.42, CLOSE_END: 0.8, CLOSE_OUT: 0.6, BACK: 0.9,
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
    // (a work's own pre-state whatever the save holds: only an unfinished blob of this very work, of its level, is taken up again)
    let S = b0 && b0.id === m.id ? load(b0) : null; if (S && (done(S) || S.lv !== lv)) S = null; const resumed = !!S;
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
      gang.clear(); man = null; for (const i of [0, 1, 2, 3]) crew[i] = null; A.crewK = null;
      const p = manAt(k), s = stakeAt(k);
      man = now1(gang.add(p[0], p[1], { role: 'hold', item: 'mallet', fx: s[0], fz: s[1], crew: 1 }));
    }
    /** a crewman's place by his wall: outside its head as it lies (the west one inside, on the yesod's top), at its face upright */
    function crewAt(k, deg, i = 1) {
      const h = wallHinge(k), n = outward(k), s = h.inside ? -1 : 1, a = (Math.max(0, Math.min(95, deg)) * Math.PI) / 180, u = FA.CREW_U[i];
      const d = H * Math.cos(a) + 1.25, x0 = h.p[0] + h.along[0] * h.L * u, z0 = h.p[1] + h.along[1] * h.L * u;
      return [x0 + s * n[0] * d, z0 + s * n[1] * d, x0, z0, h.inside ? Y0 : F];
    }
    const crewI = [0, 1, 2, 3];   // (the crew's four: crew[i])
    /** the ground under a walker: the yesod's top within the form and its rim, the court's floor beyond */
    const inForm = (x, z) => Math.max(S9.block[0] - x, x - S9.block[2], S9.block[1] - z, z - S9.block[3]) <= 1;
    /** the way round the form from a to b (outside both: by the corners outside, the short way round; else straight over the lying wall) */
    function route(a, b) {
      if (inForm(a[0], a[1]) || inForm(b[0], b[1])) return [b];
      const ring = ['NE', 'SE', 'SW', 'NW'].map((c) => { const [x, z] = S9.corner[c], d = DIAG[c]; return [x + d[0] * FA.RING, z + d[1] * FA.RING]; });
      const ang = (q) => Math.atan2(q[1] - MID[1], q[0] - MID[0]), ia = ang(a), ib = ang(b); let d = ib - ia; d = Math.atan2(Math.sin(d), Math.cos(d));
      const pts = ring.map((q) => ({ q, t: Math.atan2(Math.sin(ang(q) - ia), Math.cos(ang(q) - ia)) })).filter((r) => (d > 0 ? r.t > 0 && r.t < d : r.t < 0 && r.t > d)).sort((x, y) => Math.abs(x.t) - Math.abs(y.t));
      return [...pts.map((r) => r.q), b];
    }
    function castCrew(k) {
      gang.clear(); man = null; A.crewK = k;
      for (const i of crewI) {
        const p = crewAt(k, A.va[k] || 0, i), w = now1(gang.add(p[0], p[1], { role: 'brace', item: 'staff', fx: p[2], fz: p[3], crew: i }));
        if (w && w.a) { w.a.fixedY = p[4]; w.a.y = p[4]; w.path = null; }
        crew[i] = w;
      }
    }
    /** the crew to wall k: walking round (jump: at once, under a cut) */
    function crewTo(k, jump) {
      if (!crew[0]) { castCrew(k); return; }
      A.crewK = k;
      for (const i of crewI) {
        const w = crew[i]; if (!w || !w.a) continue; const p = crewAt(k, A.va[k] || 0, i);
        if (jump) { w.a.x = p[0]; w.a.z = p[1]; w.a.fixedY = p[4]; w.path = null; } else w.path = route([w.a.x, w.a.z], [p[0], p[1]]);
      }
    }
    /** the wall the crew goes to next: the nearest still down to where they stand (no hint of the order) */
    function nearestOpen(from) {
      let best = null, bd = 1e9;
      for (const k of WALLS) { if (S.W[k].st === 'lock') continue; const p = crewAt(k, A.va[k] || 0, 1), d = Math.hypot(p[0] - from[0], p[1] - from[1]); if (d < bd) { bd = d; best = k; } }
      return best;
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
    /** the close shot of wall k while it is lifted: from outside its end, a little to its crew's side — the four whole, lying and upright */
    function closeShot(k) {
      const h = wallHinge(k), n = outward(k), s = h.inside ? -1 : 1, asp = cam0.aspect || 1.6, far = k === 'N' || k === 'E' ? 1 : -1;
      const c = [h.p[0] + h.along[0] * h.L * 0.5, h.p[1] + h.along[1] * h.L * 0.5], aim = [c[0] + s * n[0] * H * 0.5, Y0 + H * 0.45, c[1] + s * n[1] * H * 0.5];
      let dx = h.along[0] * far * FA.CLOSE_END + s * n[0] * FA.CLOSE_OUT, dz = h.along[1] * far * FA.CLOSE_END + s * n[1] * FA.CLOSE_OUT; const L = Math.hypot(dx, dz); dx /= L; dz /= L;
      for (let R = FA.CLOSE_R.lo; R <= FA.CLOSE_R.hi; R += 1) {
        const eye = [aim[0] + dx * R, aim[1] + R * FA.CLOSE_UP, aim[2] + dz * R];
        if (crewI.every((i) => [LIE, UP].every((dg) => { const p = crewAt(k, dg, i); return fig([eye, aim], FA.FOV, asp, p[0], p[4], p[1], null, 0.9) === 'whole'; }))) return [eye, aim];
      }
      ev('shot:nofit:' + k); const R = FA.CLOSE_R.hi; return [[aim[0] + dx * R, aim[1] + R * FA.CLOSE_UP, aim[2] + dz * R], aim];
    }
    function wideShot() {
      const asp = cam0.aspect || 1.6, [e0, aim] = FA.WIDE, dx = e0[0] - aim[0], dy = e0[1] - aim[1], dz = e0[2] - aim[2];
      for (let f = 1; f <= 1.6; f += 0.05) {
        const eye = [aim[0] + dx * f, aim[1] + dy * f, aim[2] + dz * f];
        const ok = WALLS.every((k) => [LIE, UP].every((dg) => [0, 3].every((i) => { const p = crewAt(k, dg, i); return fig([eye, aim], FA.FOV, asp, p[0], p[4], p[1], null, 0.9) === 'whole'; })));
        if (ok) return [eye, aim];
      }
      ev('shot:nofit:wide'); return [[aim[0] + dx * 1.6, aim[1] + dy * 1.6, aim[2] + dz * 1.6], aim];
    }
    function shotTo(key, P, ease) { A.shotK = key; A.shotT = A.t; lens(FA.FOV); X.shot(P[0].slice(), P[1].slice(), ease); ev('shot:' + key); }
    const nextCorner = () => CORNER_ORDER.find((k) => !S.stakes[k]) || null;
    function plan(ease = 0.9) {
      if (A.fl != null || A.done) return;
      if (!stakesIn(S)) { const k = nextCorner(); if (k !== A.cur || A.shotK !== 'c:' + k) { A.cur = k; castMan(k); shotTo('c:' + k, cornerShot(k), ease); hint(true); } return; }
      if (A.phase !== 'walls') { A.phase = 'walls'; A.cur = null; const W0 = wideShot(); castCrew(nearestOpen([W0[0][0], W0[0][2]]) || 'E'); shotTo('wide', W0, ease); hint(true); return; }
      // (between walls: back to the whole form once the wall in hand is locked, down again, or let go a while — the crew walks on)
      if (A.shotK.startsWith('w:') && S.hold == null) {
        const k = A.shotK.slice(2), st = S.W[k].st, still = Math.abs(S.W[k].v) < 0.05;
        if (st === 'lock' || (st === 'lie' && still) || A.t - (A.letT || 0) > 6) { if (A.t - (A.letT || 0) > FA.BACK) { shotTo('wide', wideShot(), ease); const nx = nearestOpen(crew[0] && crew[0].a ? [crew[0].a.x, crew[0].a.z] : MID); if (nx && nx !== A.crewK) crewTo(nx, false); } }
      }
    }
    /** a wall taken in hand: the close shot of it, the crew there (a cut when they were at another wall) */
    function closeOn(k) {
      if (A.shotK === 'w:' + k) return;
      const cut = A.crewK !== k || crewI.some((i) => crew[i] && crew[i].path && crew[i].path.length);
      crewTo(k, cut); shotTo('w:' + k, closeShot(k), cut ? 0.01 : 0.5);
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
        if (A.fl != null) return; const k = pick(f);
        if (!k) { if (A.shotK.startsWith('w:') && !A.done) { shotTo('wide', wideShot(), 0.6); A.letT = -99; } try { if (X.lookHome) X.lookHome(); } catch (e) { /* */ } return; }
        A.fl = f.id; f.w = { ...k, ly: f.y, t0: A.t };
        if (k.k === 'rod') { const p = onPlane(X, f.x, f.y, Y0 + 0.2); f.w.off = p ? S.rods[k.c] - rodU(k.c, p) : 0.3; }
        if (k.k === 'wall') { if (grab(S, k.w)) { ev('grab:' + k.w); X.hand(null); A.hintK = 'x'; closeOn(k.w); } else A.fl = null; }
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
        if (w.k === 'wall') { release(S); A.letT = A.t; ev('let:' + w.w); keep(); return; }
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
      for (let i = 0; i < 8; i++) { const a = ((i + 0.5) / 8) * Math.PI * 2; X.dust(MID[0] + Math.cos(a) * 21, F + 0.3, MID[1] + Math.sin(a) * 21, 3, 2.5); }   // (a few soft puffs off the corners and faces, not a band along the walls)
      V.dust(); X.shake(0.25, 0.4);
      for (const i of crewI) if (crew[i]) { crew[i].path = null; gang.setRole(crew[i], 'hold', { item: 'staff', fx: MID[0], fz: MID[1], stride: 0 }); }
      shotTo('wide', wideShot(), 0.8);
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
      // the crew: all four at the wall in hand, pushing while it moves, holding it when still; walking round to the next between walls
      if (A.phase !== 'stakes' && !A.done && A.crewK) for (const i of crewI) {
        const w = crew[i]; if (!w || !w.a) continue; const k = A.crewK, dg = A.va[k] || 0, p = crewAt(k, Math.min(90, dg), i);
        let walking = false;
        if (w.path && w.path.length) {
          const q = w.path[0], dx = q[0] - w.a.x, dz = q[1] - w.a.z, d = Math.hypot(dx, dz), st = Math.min(d, FA.PACE * dt);
          if (d > 0.05) { w.a.x += (dx / d) * st; w.a.z += (dz / d) * st; walking = true; w.wf = [q[0], q[1]]; } else w.path.shift();
          w.a.fixedY = inForm(w.a.x, w.a.z) ? Y0 : F;
        } else {
          const dd = Math.hypot(w.a.x - p[0], w.a.z - p[1]); if (dd > 0.02) { const kk = 1 - Math.exp(-dt * 6); w.a.x += (p[0] - w.a.x) * kk; w.a.z += (p[1] - w.a.z) * kk; }
          w.a.fixedY = p[4];
        }
        const moving = !walking && S.W[k].st === 'up' && (Math.abs(S.W[k].v) > 2 || S.hold === k || S.W[k].swayA > 0);
        const want = walking ? 'brace' : moving ? 'push' : S.W[k].st === 'lock' ? 'hold' : 'brace';
        if (w.role !== want || (!!w.stride) !== walking) gang.setRole(w, want, { item: 'staff', fx: walking ? w.wf[0] : p[2], fz: walking ? w.wf[1] : p[3], stride: walking ? 0.8 : 0, rate: 1.4 });
        if (walking) { w.fx = w.wf[0]; w.fz = w.wf[1]; } else { w.fx = p[2]; w.fz = p[3]; }
      }
    }
    let rumT = 0;
    return {
      close: true,
      begin() {
        hold('form', true); homeWalls(); dress(X); fmats(X);
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
        o.figs = { man: man && man.a ? [r2(man.a.x), r2(man.a.z)] : null, crew: crewI.map((i) => (crew[i] && crew[i].a ? [r2(crew[i].a.x), r2(crew[i].a.z)] : null)), at: A.crewK || null, walking: crewI.some((i) => crew[i] && crew[i].path && crew[i].path.length) };
        o.mallet = !!(man && man.role === 'hammer'); o.shot = A.shotK;
        const cp = cam0.position; o.cam = [cp.x, cp.y, cp.z].map((v) => +v.toFixed(1));
        return o;
      },
    };
  },
};
void done;
