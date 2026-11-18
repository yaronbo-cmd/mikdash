/* ── build 132 ── h132/strip.js — work 3 "שליפת התבנית" (spec docs/specs/shlav-09-he.md, עבודה 3). LANE A's file.
 * Morning. Each wall of the form is held by three things: a diagonal brace outside, a belt beam, and the tongue at the corner. A tap of
 * the left thumb on a part tests it (free: it wobbles; loaded: it creaks — at level 3 only a creak, higher the more still rests on it);
 * a drag outward pulls it (the wedge: up; level 3's stuck south wall: along itself to the west, one amah, then out). The rules:
 * strip-model.js. Two pullers pull the part dragged (ropes on the braces and belts, wooden poles from the block's top on the walls).
 * A wall falls outward in a cloud of dust and a white face of the block lights (the west one falls onto the Ulam's steps and leans
 * there; the pullers lower it). The right thumb is the camera (turned, it shows who lies on whom at the far corners); the work goes on
 * while it is turned. The turn is the act's own: a drag that does not start on a part (or the right mouse button) swings the camera round
 * the form, and on release it settles at the nearest of the four corner views (the book's morning view from the south-east and its three
 * turns), each showing two faces whole — the director's look stops at a quarter turn, and the north and west faces are behind it.
 * No text but the words of a result; no button; no gauge; no iron.
 *   STRIP_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { LOSS, WORDS } from './model.js';
import { PARTS, fresh, load, save, tap, pull, slide, done, result } from './strip-model.js';
import { SH9, wallSet } from './world.js';
import { hold, dress, wallHead } from './walls3d.js';
import { smats, blockBody, scar, braceMesh, braceEnds, beltMesh, beltEnds, wedgeMesh, bulgeOn, NORM } from './strip3d.js';
import { createVoices } from '../h129/sound129.js';
import { fingers, MOUSE } from '../h113/acts.js';
import { createGang, createBeat, clamp } from '../h109/kit.js';

const S9 = BOOK.s09, B = S9.block, Y0 = S9.base, Y1 = S9.top, H = S9.H, F = S9.floor, MID = S9.mid;
/** the act's numbers: pick reach (px), a tap's most travel (px), a pull's least travel (px) and how straight it must be (cos), the
 *  falls (s), the west wall's lean on the steps (rad), the pullers' pace */
export const SA = Object.freeze({ PICK: 46, PICKM: 30, TAP: 12, PULL: 34, COS: 0.55, FALL: 1.0, LEAN: 1.28, DOWN: 1.52, PACE: 5, FOV: 50, OUT: 1.6,
  TURN: 3.2, SNAP: 0.55, NUDGE: 0.3, LIFT: 1.8 });   // (the swing: radians per screen width, as the director's look; the settle's seconds; a drag past NUDGE rad goes on to the next corner)
/** the four corner views: the book's w3 (from the south-east) turned round the form's middle by quarter turns → { eye, aim } */
export function cornerView(th) {
  const [e, t] = S9.cam.w3, R = Math.hypot(e[0] - t[0], e[2] - t[2]);
  return { eye: [t[0] + R * Math.cos(th), e[1], t[2] + R * Math.sin(th)], aim: t.slice() };
}
export const TH0 = Math.atan2(S9.cam.w3[0][2] - S9.cam.w3[1][2], S9.cam.w3[0][0] - S9.cam.w3[1][0]);
const r2 = (v) => +(+v).toFixed(2), UP = 90;
const sideOf = (p) => (p === 'wedge' ? 'S' : p.split(':')[1]);

export const STRIP_ACT = {
  icon: '🪓',
  title: 'שליפת התבנית',
  walkLine: () => '',
  stand() { const s = S9.stand.w3; return { x: s[0], z: s[1], face: [MID[0], MID[1]] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, Mo = X.M, lv = m.lv | 0 || 1, V = createVoices(X.sfx), Mt = smats(X);
    const root = new T.Group(); root.name = 'h132-strip-act'; X.props.root.add(root);
    const A = { t: 0, ev: [], fl: null, busy: 0, done: 0, fallK: {}, shakeP: null, wob: null, lit: {}, at: null, hintOn: 0, th: TH0, orb: null, camT: 0, btn: 0 };
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
    const b0 = Mo.workOf('strip');
    let S = b0 && b0.id === m.id ? load(b0) : null; const resumed = !!S;
    if (!S) S = fresh(lv);
    let n0 = -1; const keep = () => { if (S.n === n0) return; n0 = S.n; Mo.keep('strip', save(S, m.id)); X.save(); };
    // ── the things: the block's white body with the fill's marks, the parts, the bulged boards on the walls
    const flaws = Mo.flaws ? Mo.flaws() : [];
    const body = blockBody(X, flaws, root);
    const parts = {};
    for (const p of PARTS[lv]) {
      if (p.startsWith('brace:')) parts[p] = braceMesh(X, sideOf(p), root);
      else if (p.startsWith('belt:')) parts[p] = beltMesh(X, sideOf(p), root);
      else if (p === 'wedge') parts[p] = wedgeMesh(X, root);
    }
    const bulges = []; for (const b of flaws.filter((x) => x.f === 'fill.bulge')) { const g = bulgeOn(X, b.wall || 'N'); if (g) bulges.push(g); }
    for (const t of S.torn) scar(X, 'torn', t, body); if (S.patch) scar(X, 'patch', null, body);
    // ── the camera: the book's morning view from the south-east; the right thumb turns it
    const cam0 = X.camera, fov0 = cam0.fov, lens = (f) => { try { cam0.fov = f; cam0.updateProjectionMatrix(); } catch (e) { /* */ } };
    const view = (th, secs) => { const v = cornerView(th); X.shot(v.eye, v.aim, secs); A.camT = A.t + secs + 0.1; };
    const cornerOf = (th) => Math.round((th - TH0) / (Math.PI / 2));
    function swing(f) {
      A.th = A.orb.th0 - ((f.x - A.orb.x0) / innerWidth) * SA.TURN; view(A.th, 0.01);
      // (the same finger's vertical: the director's lift, as the right thumb's in every act — until the director's look takes the whole turn)
      const dy = f.y - A.orb.y0; if (X.lookLift && Math.abs(dy) > SA.TAP) X.lookLift(clamp(A.orb.u0 + (dy / innerHeight) * SA.LIFT, 0, 1));
    }
    function settle() {
      const d = A.th - A.orb.th0; let k = cornerOf(A.orb.th0) + Math.round(d / (Math.PI / 2));
      if (k === cornerOf(A.orb.th0) && Math.abs(d) > SA.NUDGE) k += Math.sign(d);
      A.th = TH0 + k * (Math.PI / 2); A.orb = null; view(A.th, SA.SNAP); ev('view:' + (((k % 4) + 4) % 4));
      if (workP === 'idle' || A.t > A.idleT) sendIdle(true);   // (a cut for the waiting pullers: they stand at the new corner as the camera settles)
    }
    // ── the pullers (two), at the part he works
    const Bt = createBeat(X), gang = createGang(X), men = [null, null];
    /** where the pullers work part p: [[x, z, fx, fz, y], …] — outside on the floor for a brace or a belt (the west one in the gap
     *  between the yesod and the steps), on the block's top behind a wall (they push it out with poles), at the corner for the wedge */
    function placeOf(p) {
      const k = sideOf(p), n = NORM[k];
      if (p === 'wedge') { const [x, z] = S9.wedge; return [[x - 2.2, z - 1.6, x, z, Y1 - 0.02], [x - 1.6, z - 3.4, x, z, Y1 - 0.02]]; }
      if (p.startsWith('wall:')) {
        const c = k === 'N' || k === 'S' ? [MID[0], k === 'N' ? B[1] : B[3]] : [k === 'E' ? B[2] : B[0], MID[1]], al = n[0] ? [0, 1] : [1, 0];
        return [-1, 1].map((s) => [c[0] - n[0] * 2.2 + al[0] * s * 3, c[1] - n[1] * 2.2 + al[1] * s * 3, c[0] + n[0] * 3, c[1] + n[1] * 3, Y1 - 0.02]);
      }
      if (k === 'W') { const z = MID[1], x = S9.sikra.pathW.x; return [-1, 1].map((s) => [x, z + s * 3.2, x, z, F]); }   // (the one-amah gap between the yesod and the steps: the line's west path)
      const g = p.startsWith('brace:') ? braceEnds(k)[0] : S9.belt[k], al = n[0] ? [0, 1] : [1, 0], d = p.startsWith('brace:') ? 1.4 : 4.2;
      return [-1, 1].map((s) => [g[0] + n[0] * d + al[0] * s * 1.6, g[2 - (p.startsWith('brace:') ? 0 : 1)] + n[1] * d + al[1] * s * 1.6, g[0], p.startsWith('brace:') ? g[2] : g[1], F]);
    }
    let workP = 'idle';
    /** the ground under a walker: the block's top inside it, the yesod's rim (one amah) round it, the court's floor beyond */
    const groundAt = (x, z) => { const o = Math.max(B[0] - x, x - B[2], B[1] - z, z - B[3]); return o <= 0 ? Y1 - 0.02 : o <= S9.rod.NW.to[0] - S9.rod.NW.from[0] ? Y0 : F; };
    /** where the pullers wait between parts: outside the corner nearest the eye, along its north or south face, seen whole */
    function idleOf() {
      const sx = Math.cos(A.th) > 0 ? 1 : -1, sz = Math.sin(A.th) > 0 ? 1 : -1, cx = sx > 0 ? B[2] : B[0], z = (sz > 0 ? B[3] : B[1]) + sz * 4.4;
      return [3, 7].map((d) => [cx - sx * d, z, cx - sx * d, z + sz * 6, F]);
    }
    function castMen() {
      gang.clear(); const P = idleOf();
      for (let i = 0; i < 2; i++) { const q = P[i], w = gang.add(q[0], q[1], { role: 'brace', item: 'rope', fx: q[2], fz: q[3], crew: 2 + i }); if (w && w.a) { w.a.vis = 1; w.a.fixedY = q[4]; w.a.y = q[4]; } men[i] = w; }
    }
    function sendIdle(jump) {
      if (A.done) return; workP = 'idle'; A.idleT = 0; const P = idleOf();
      for (let i = 0; i < 2; i++) { const w = men[i]; if (!w) continue; w.goal = P[i]; w.want = 'brace'; w.item = 'rope'; w.until = 0; if (jump && w.a) { w.a.x = P[i][0]; w.a.z = P[i][1]; w.a.fixedY = P[i][4]; } }
    }
    function sendMen(p, role) {
      workP = p; A.idleT = A.t + 2.4; const P = placeOf(p), isWall = p.startsWith('wall:');
      for (let i = 0; i < 2; i++) { const w = men[i]; if (!w) continue; w.goal = P[i]; w.want = role || (isWall ? 'push' : 'pull'); w.item = isWall ? 'staff' : 'rope'; w.until = A.t + 1.6; }
    }
    function moveMen(dt) {
      for (const w of men) {
        if (!w || !w.a) continue; const q = w.goal; if (!q) continue;
        const dx = q[0] - w.a.x, dz = q[1] - w.a.z, d = Math.hypot(dx, dz), st = Math.min(d, SA.PACE * dt * (d > 6 ? 2.2 : 1));
        if (d > 0.02) { w.a.x += (dx / d) * st; w.a.z += (dz / d) * st; }
        // (from the floor to the block's top and back: a step at each edge — the yesod's rim, the block — never inside it)
        w.a.fixedY = d < 0.6 ? q[4] : groundAt(w.a.x, w.a.z);
        const walking = d > 0.15, role = walking ? 'brace' : A.t < (w.until || 0) ? w.want || 'pull' : 'brace';
        if (w.role !== role || !!w.stride !== walking) gang.setRole(w, role, { item: w.item || 'rope', fx: walking ? q[0] + dx : q[2], fz: walking ? q[1] + dz : q[3], stride: walking ? 0.8 : 0, rate: 1.6 });
        if (!walking) { w.fx = q[2]; w.fz = q[3]; }
      }
    }
    // ── where a part is on the screen, and whether its face is toward the eye
    const sp = (x, y, z) => X.scr(x, y, z);
    const segD = (p, a, b) => { const vx = b.x - a.x, vy = b.y - a.y, L2 = vx * vx + vy * vy || 1, u = clamp(((p.x - a.x) * vx + (p.y - a.y) * vy) / L2, 0, 1); return Math.hypot(p.x - a.x - vx * u, p.y - a.y - vy * u); };
    function ends(p) {
      const k = sideOf(p);
      if (p.startsWith('brace:')) { const [a, b] = braceEnds(k); return [a, b]; }
      if (p.startsWith('belt:')) { const [a, b] = beltEnds(k), u0 = 0.18, u1 = 0.82; return [[a[0] + (b[0] - a[0]) * u0, a[1], a[2] + (b[2] - a[2]) * u0], [a[0] + (b[0] - a[0]) * u1, a[1], a[2] + (b[2] - a[2]) * u1]]; }
      if (p === 'wedge') { const q = parts.wedge.userData.at; return [q, q]; }
      const n = NORM[k], h0 = wallHead(k, UP, 0.2), h1 = wallHead(k, UP, 0.8), y = Y0 + H * 0.62;
      return [[h0[0] + n[0] * 0.3, y, h0[2] + n[1] * 0.3], [h1[0] + n[0] * 0.3, y, h1[2] + n[1] * 0.3]];
    }
    const mid = (p) => { const [a, b] = ends(p); return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]; };
    function facing(p) { const k = sideOf(p), n = NORM[k], q = mid(p), c = cam0.position; return (c.x - q[0]) * n[0] + (c.z - q[2]) * n[1] > -0.5; }
    function pick(f) {
      if (A.busy || A.done) return null;
      let best = null, bd = MOUSE ? SA.PICKM : SA.PICK;
      for (const p of PARTS[lv]) {
        if (!S.left[p] || A.fallK[p] || !facing(p)) continue;
        const [a, b] = ends(p), sa = sp(...a), sb = sp(...b); if (sa.on === false && sb.on === false) continue;
        const d = segD(f, sa, sb) + (p.startsWith('wall:') ? 10 : 0);
        if (d < bd) { bd = d; best = p; }
      }
      return best;
    }
    /** a drag's meaning on part p: 'pull' (outward; the wedge: up), 'slide' (the stuck south wall, along itself to the west), or null */
    function dragOf(p, dx, dy) {
      const L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, q = mid(p), s0 = sp(...q);
      const dir = (v) => { const s1 = sp(q[0] + v[0], q[1] + v[1], q[2] + v[2]), l = Math.hypot(s1.x - s0.x, s1.y - s0.y) || 1; return [(s1.x - s0.x) / l, (s1.y - s0.y) / l]; };
      if (p === 'wedge') return -uy > SA.COS ? 'pull' : null;
      const n = NORM[sideOf(p)], o = dir([n[0] * 2, 0, n[1] * 2]);
      if (lv === 3 && p === 'wall:S') { const w = dir([-2, 0, 0]); if (ux * w[0] + uy * w[1] > SA.COS) return 'slide'; }
      return ux * o[0] + uy * o[1] > SA.COS ? 'pull' : null;
    }
    const FG = fingers(X, {
      down(f) {
        if (A.fl != null || A.orb) return; const p = A.btn === 2 ? null : pick(f);
        if (!p) { if (!A.done) { let u0 = 0; try { u0 = X.lookNow ? +X.lookNow().u || 0 : 0; } catch (e) { /* */ } A.orb = { id: f.id, x0: f.x, y0: f.y, th0: A.th, u0 }; } return; }   // (not on a part: the camera's swing)
        A.fl = f.id; f.w = { p, t0: A.t }; X.hand(null);
      },
      move(f) {
        if (A.orb && A.orb.id === f.id) { swing(f); return; }
        const w = f.w; if (!w || A.fl !== f.id || w.did) return;
        if (f.moved < SA.PULL) return;
        const k = dragOf(w.p, f.x - f.x0, f.y - f.y0); if (!k) return;
        w.did = 1; if (k === 'slide') doSlide(); else doPull(w.p);
      },
      up(f) { if (A.orb && A.orb.id === f.id) { swing(f); settle(); return; } const w = f.w; if (!w || A.fl !== f.id) return; A.fl = null; if (!w.did && f.moved <= SA.TAP) doTap(w.p); },
    });
    // ── a tap: the test
    function doTap(p) {
      const r = tap(S, p); if (!r) return; ev('tap:' + p + ':' + r.sound + ':' + r.n);
      if (r.sound === 'wobble') { V.bump(); setTimeout(() => V.bump(), 140); A.wob = { p, t: 0 }; }
      else { const k = Math.min(1, 0.22 + 0.13 * r.pitch); V.creak(k); A.creakT = A.t + 0.45; A.wob = { p, t: 0, tiny: 1 }; }
      keep();
    }
    function atOf(p) { const q = mid(p); return { x: q[0], y: q[1] + 0.6, z: q[2] }; }
    // ── a pull, and what it does
    function doPull(p) {
      const r = pull(S, p); if (!r) return; ev('pull:' + p + ':' + r.kind); const at = atOf(p);
      sendMen(p);
      if (!r.out) {
        // loaded (or the stuck wall's first pull): it does not move, it shudders and creaks; 0, the streak broken
        V.creak(0.75); V.groan(); A.creakT = A.t + 0.6; A.shakeP = { p, t: 0 }; X.loss(0, at, ''); keep(); return;
      }
      if (r.kind === 'torn') {
        const c = r.corner, [x, z] = S9.corner[c];
        const pts = Mo.flaw('strip.torn', { at: [x, z], wall: sideOf(p), n: S.torn.length - 1 });
        scar(X, 'torn', c, body); V.crack(); X.shake(0.25, 0.4); X.dust(x, Y0 + 2.5, z, 14, 3);
        X.loss(pts, { x, y: Y0 + 3, z }, LOSS['strip.torn'][0]);
      } else if (r.kind === 'patch') {
        const g = S9.belt.S, pts = Mo.flaw('strip.patch', { at: [g[0], g[1]], wall: 'S' });
        scar(X, 'patch', null, body); V.crack(); X.shake(0.25, 0.4); X.dust(g[0], Y0 + 2.4, g[1], 14, 3);
        X.loss(pts, { x: g[0], y: Y0 + 3, z: g[1] }, LOSS['strip.patch'][0]);
      } else if (r.kind === 'wall') { X.hit(at, 'gold', { text: '' }); X.quick(at, WORDS.quick, null); }
      else X.hit(at, 'good', { text: '' });
      if (p.startsWith('wall:')) fall(sideOf(p)); else out(p);
      keep();
      if (done(S)) closeSoon();
    }
    function doSlide() {
      const r = slide(S); ev('slide:' + (r.ok ? 'ok' : 'no'));
      const at = atOf('wall:S');
      if (!r.ok) { if (r.loaded) { V.creak(0.75); A.creakT = A.t + 0.5; A.shakeP = { p: 'wall:S', t: 0 }; X.loss(0, at, ''); } keep(); return; }
      sendMen('wall:S', 'push'); V.scrape(0.7); setTimeout(() => V.scrape(0), 600); A.slideT = 0; X.hit(at, 'good', { text: '' }); keep();
    }
    /** a brace, a belt or the wedge comes out: it slides out (the wedge up) and lies on the ground below */
    function out(p) {
      const g = parts[p]; if (!g) return; const k = sideOf(p), n = NORM[k];
      V.knock(0.9); A.fallK[p] = { t: 0, g, n: p === 'wedge' ? [0.6, 0.6] : n, up: p === 'wedge' ? 1 : 0 };
    }
    /** a wall falls outward, dust, its white face lights (the west one onto the Ulam's steps, leaning, then lowered there) */
    function fall(k) {
      A.fallK['wall:' + k] = { t: 0, k };
      V.groan();
    }
    async function closeSoon() {
      A.done = 1; X.hand(null);
      await X.wait(SA.FALL + 1.6);
      const res = result(S);
      if (res.perfect) { try { X.perfect(WORDS.strip, { x: MID[0], y: Y1, z: MID[1] }); } catch (e) { /* */ } await X.wait(1.0); }
      const R = 40, sh = [0, 1, 2, 3].map((i) => { const a = Math.PI / 4 + (i * Math.PI) / 2; return [[MID[0] + Math.cos(a) * R, Y1 + 16, MID[1] + Math.sin(a) * R], [MID[0], Y0 + 2, MID[1]], 1.0]; });
      X.end({ stars: res.stars, q: res.q, pts: res.pts, perfect: res.perfect, flags: res.flags, at: { x: MID[0], y: Y1, z: MID[1] },
        film: { shots: sh, secs: 4, kohen: false, own: () => men.map((w) => w && w.a), after: () => { try { gang.clear(); } catch (e) { /* */ } } } });
    }
    // ── drawing
    function draw(dt) {
      for (const [p, f] of Object.entries(A.fallK)) {
        if (!f) continue; f.t += dt;
        if (f.k) {
          const k = f.k, u = Math.min(1, f.t / SA.FALL), e = u * u, W = SH9.walls && SH9.walls[k];
          if (W) {
            if (k === 'W') {
              // (west: it falls onto the Ulam's lowest steps and leans there, then the pullers lower it)
              const lean = SA.LEAN * e, down = f.t > SA.FALL + 1.2 ? Math.min(1, (f.t - SA.FALL - 1.2) / 1.4) : 0;
              W.grp.rotation.set(0, 0, lean + (SA.DOWN - SA.LEAN) * down);
            } else wallSet(k, 90 * (1 - e));
          }
          if (u >= 1 && !f.landed) {
            f.landed = 1; const hd = wallHead(k, k === 'W' ? 90 : 0); V.thud(); X.shake(0.22, 0.35);
            const n = NORM[k]; X.dust(hd[0] + n[0] * (k === 'W' ? 3 : 0), F + 0.6, hd[2] + n[1] * (k === 'W' ? 3 : 0), 22, 5);
            const fc = body.userData.faces[k]; if (fc) { A.lit[k] = 1.2; }
          }
          continue;
        }
        const g = f.g, u = Math.min(1, f.t / 0.7);
        g.position.set(f.n[0] * SA.OUT * u, f.up ? 1.6 * Math.sin(u * Math.PI * 0.5) - (u > 0.6 ? (u - 0.6) * 6 : 0) : -(u * u) * 2.6, f.n[1] * SA.OUT * u);
        if (u >= 1 && !f.landed) { f.landed = 1; V.knock(0.6); X.dust(g.position.x + mid(p)[0], F + 0.3, g.position.z + mid(p)[2], 5, 1.5); g.visible = !p.startsWith('belt:') || true; }
      }
      // the lit faces: a white glow that fades
      for (const k of Object.keys(A.lit)) { const fc = body.userData.faces[k]; A.lit[k] = Math.max(0, A.lit[k] - dt); if (fc) fc.material.emissiveIntensity = 1 + 1.6 * A.lit[k]; }
      // a shudder (a loaded pull) and a wobble (a free tap)
      if (A.shakeP) { A.shakeP.t += dt; const g = A.shakeP.p.startsWith('wall:') ? SH9.walls && SH9.walls[sideOf(A.shakeP.p)] && SH9.walls[sideOf(A.shakeP.p)].grp : parts[A.shakeP.p]; const s = A.shakeP.t < 0.5 ? Math.sin(A.shakeP.t * 70) * 0.06 : 0; if (g) g.rotation.z = (g.userData.rz0 || 0) + s * (A.shakeP.p.startsWith('wall:') ? 0.15 : 1); if (A.shakeP.t >= 0.5) { if (g) g.rotation.z = g.userData.rz0 || 0; A.shakeP = null; } }
      if (A.wob) { A.wob.t += dt; const g = parts[A.wob.p]; const s = A.wob.t < 0.55 ? Math.sin(A.wob.t * 38) * (A.wob.tiny ? 0.006 : 0.05) * (1 - A.wob.t / 0.55) : 0; if (g) g.rotation.y = s; if (A.wob.t >= 0.55) A.wob = null; }
      if (A.creakT && A.t > A.creakT) { A.creakT = 0; V.creak(0); }
      if (A.slideT != null) { A.slideT += dt; const u = Math.min(1, A.slideT / 0.8), W = SH9.walls && SH9.walls.S; if (W) W.grp.position.x = B[0] - u; if (u >= 1) A.slideT = null; }
    }
    function hint() {
      // (rule 25: one hint hand, on the free trial: the first tap — on the first brace he sees)
      if (A.hintOn || S.taps || resumed) return; A.hintOn = 1;
      const p = PARTS[lv].find((q) => facing(q) && S.left[q]); if (!p) return; const q = mid(p); X.hand({ x: q[0], y: q[1], z: q[2] }, 0, 14);
    }
    return {
      close: true,
      begin() {
        hold('strip', true); dress(X); smats(X);
        try { X.kohen(false); } catch (e) { /* */ }
        for (const k of ['N', 'S', 'E', 'W']) { const W = SH9.walls && SH9.walls[k]; if (!W) continue; W.grp.visible = true; W.grp.userData.rz0 = W.grp.rotation.z; wallSet(k, S.left['wall:' + k] ? 90 : 0); if (!S.left['wall:' + k]) A.fallK['wall:' + k] = { t: 9, k, landed: 1 }; }
        if (S.slid && SH9.walls) SH9.walls.S.grp.position.x = B[0] - 1;
        for (const p of Object.keys(parts)) if (!S.left[p]) parts[p].visible = false;
        castMen(); FG.attach(); X.line('', 0);
        lens(SA.FOV); view(A.th, 0.01);
        X.wait(1.0).then(hint);
        ev(resumed ? 'resume' : 'begin'); keep();
      },
      update(dt) {
        A.t += dt;
        if (A.idleT && A.t > A.idleT && !A.fl) sendIdle();
        try { V.frame(); Bt.step(dt); gang.update(dt, Bt); moveMen(dt); draw(dt); }
        catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h132] strip', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
      },
      down(p) { A.btn = p && p.button | 0; FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { A.fl = null; if (A.orb) settle(); V.creak(0); keep(); },
      // (every touch is the act's: on a part it tests or pulls, elsewhere it swings the camera — the right button too)
      wants() { return true; },
      mouseRight() { return true; },
      holds() { return A.fl != null; },   // (a swing's finger is no grip: a second finger makes it the director's pinch)
      end() {
        FG.detach(); V.stop(); X.hand(null); lens(fov0);
        if (!A.done) gang.clear();
        for (const g of bulges) { try { g.parent.remove(g); } catch (e) { /* */ } }
        if (SH9.walls) { SH9.walls.S.grp.position.x = B[0]; SH9.walls.W.grp.rotation.set(0, 0, 0); }
        X.props.remove(root); hold('strip', false);
      },
      at() { return new T.Vector3(MID[0], Y1, MID[1]); },
      dbg() {
        const s2 = (q) => { const r = X.scr(q[0], q[1], q[2]); return [Math.round(r.x), Math.round(r.y), r.on === false ? 0 : 1]; };
        const R = result(S), o = { id: m.id, lv, busy: A.busy, done: A.done, t: +A.t.toFixed(2), ev: A.ev.slice(-10), n: S.n, pts: R.pts, max: R.max, dmg: S.dmg, breaks: S.breaks, taps: S.taps, slid: S.slid, left: Object.keys(S.left).length, mouse: MOUSE };
        o.parts = PARTS[lv].filter((p) => S.left[p]).map((p) => {
          const q = mid(p), at = s2(q), k = sideOf(p), n = NORM[k];
          const ou = p === 'wedge' ? [at[0], at[1] - 70] : (() => { const s = s2([q[0] + n[0] * 3, q[1], q[2] + n[1] * 3]), dx = s[0] - at[0], dy = s[1] - at[1], L = Math.hypot(dx, dy) || 1; return [Math.round(at[0] + (dx / L) * 70), Math.round(at[1] + (dy / L) * 70)]; })();
          const r = { p, at: at.slice(0, 2), on: !!at[2] && facing(p) && at[0] > 30 && at[0] < innerWidth - 30 && at[1] > 90 && at[1] < innerHeight - 40, out: ou };
          if (lv === 3 && p === 'wall:S') { const s = s2([q[0] - 3, q[1], q[2]]), dx = s[0] - at[0], dy = s[1] - at[1], L = Math.hypot(dx, dy) || 1; r.west = [Math.round(at[0] + (dx / L) * 70), Math.round(at[1] + (dy / L) * 70)]; }
          return r;
        });
        o.men = men.map((w) => (w && w.a ? [r2(w.a.x), r2(w.a.z), r2(w.a.fixedY)] : null)); o.work = workP;
        o.step = workP + ':v' + (((cornerOf(A.th) % 4) + 4) % 4) + (A.orb ? ':swing' : A.t < A.camT ? ':cam' : '');
        o.pulling = men.some((w) => w && w.role && (w.role === 'pull' || w.role === 'push') && !w.stride);
        o.settled = A.t > 1.2 && A.t > A.camT && !A.orb && !Object.values(A.fallK).some((f) => f && !f.landed);
        o.view = ((cornerOf(A.th) % 4) + 4) % 4;
        try { const L = X.lookNow ? X.lookNow() : null; o.look = L ? { u: r2(L.u), yaw: r2(L.yaw), play: L.play } : null; } catch (e) { o.look = null; }
        const cp = cam0.position; o.cam = [cp.x, cp.y, cp.z].map((v) => +v.toFixed(1));
        return o;
      },
    };
  },
};
void Y0;
