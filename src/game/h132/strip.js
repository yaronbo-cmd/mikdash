/* ── build 132 ── h132/strip.js — work 3 "שליפת התבנית" (spec docs/specs/shlav-09-he.md, עבודה 3). LANE A's file.
 * Morning. Each wall of the form is held by three things: a diagonal brace outside, a belt beam, and the tongue at the corner. A tap of
 * the left thumb on a part tests it (free: it wobbles; loaded: it creaks — at level 3 only a creak, higher the more still rests on it);
 * a drag outward pulls it (the wedge: up; level 3's stuck south wall: along itself to the west, one amah, then out). The rules:
 * strip-model.js. Two pullers pull the part dragged (ropes on the braces and belts, wooden poles from the block's top on the walls).
 * A wall falls outward in a cloud of dust and a white face of the block lights (the west one falls onto the Ulam's steps and leans
 * there; the pullers lower it). The right thumb is the camera (turned, it shows who lies on whom at the far corners); the work goes on
 * while it is turned. The right thumb is the director's look as in every act (its lift, zoom-out, pinch and wheel), its turn let go
 * all the way round here (act.lookYaw): on release the view settles at the nearest of the four corner views (the book's morning view
 * from the south-east and its three quarter turns, act.lookEnd), each showing two faces whole; the pullers wait there, seen whole.
 * No text but the words of a result; no button; no gauge; no iron.
 *   STRIP_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { LOSS, WORDS } from './model.js';
import { PARTS, fresh, load, save, tap, pull, slide, done, result, deps } from './strip-model.js';
import { SH9, wallSet, siteClear } from './world.js';
import { hold, homeWalls, dress, wallHead, wallHinge, lieAfter, stackAt } from './walls3d.js';
import { smats, blockBody, scar, braceMesh, braceEnds, beltMesh, beltEnds, wedgeMesh, bulgeOn, NORM } from './strip3d.js';
import { createVoices } from '../h129/sound129.js';
import { fingers, MOUSE } from '../h113/acts.js';
import { createGang, createBeat, clamp } from '../h109/kit.js';
import { figTest } from '../h131/frame3d.js';

const S9 = BOOK.s09, B = S9.block, Y0 = S9.base, Y1 = S9.top, H = S9.H, F = S9.floor, MID = S9.mid;
/** the act's numbers: pick reach (px), a tap's most travel (px), a pull's least travel (px) and how straight it must be (cos), the
 *  falls (s), the west wall's lean on the steps (rad), the pullers' pace */
export const SA = Object.freeze({ PICK: 46, PICKM: 30, TAP: 12, PULL: 34, COS: 0.55, FALL: 1.0, LEAN: 1.28, DOWN: 1.52, PACE: 5, FOV: 50, OUT: 1.6,
  SNAP: 0.55, NUDGE: 0.3, EDGE: 0.9, HOP: 5,
  CARRY: 3.2, CLEAN: 1.6, SHOULDER: 3.3, CLEAR: 1.5, SIDE: 0.55, CARRY_EYE: [6, 8, -21] });   // (the carry: its seconds, the board's height on the shoulders, how far north of the block it starts, the bearers' step off its edge, the eye from the route's middle: low, from the north, the bearers whole beside and under it)   // (the settle's seconds; a turn past NUDGE rad goes on to the next corner; how far in from the frame's edge a puller stands)
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
    const A = { t: 0, ev: [], fl: null, busy: 0, done: 0, fallK: {}, tug: {}, shakeP: null, wob: null, lit: {}, at: null, hintOn: 0, th: TH0, ease: null, camT: 0 };
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
    const b0 = Mo.workOf('strip');
    // (a work's own pre-state whatever the save holds: only an unfinished blob of this very work, of its level, is taken up again)
    let S = b0 && b0.id === m.id ? load(b0) : null; if (S && (done(S) || S.lv !== lv)) S = null; const resumed = !!S;
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
    /** the right thumb let go turned by yaw: the act's base view taken to where the eye is now (the director's yaw then 0: no jump), and
     *  eased to the nearest corner — one more on when he turned past NUDGE and it would fall back to the one he left */
    function lookEnd(yaw) {
      if (!Number.isFinite(yaw) || Math.abs(yaw) < 1e-3) return undefined;
      const k0 = cornerOf(A.th), th = A.th + yaw; let k = cornerOf(th);
      if (k === k0 && Math.abs(yaw) > SA.NUDGE) k += Math.sign(yaw);
      const b = TH0 + k * (Math.PI / 2); let u = 0; try { u = X.lookNow ? +X.lookNow().u || 0 : 0; } catch (e) { /* */ }
      // (the eye still at the look's own lift: the act eases its base itself, frame by frame; else one eased shot from where the eye is —
      //  the director then reads the figures only once it has settled)
      A.th = th; view(th, 0.01); A.ease = { a: th, b, t: 0, own: u > 0.02 }; if (!A.ease.own) view(b, SA.SNAP); A.camT = A.t + SA.SNAP + 0.2;
      try { if (workP === 'idle' || A.t > A.idleT) sendIdle(true); else { const r = men[0] && men[0].want; sendMen(workP, r && r !== 'hold' ? r : null, true); ev('refit:' + workP); } } catch (e) { ev('err:idle:' + (e && e.message)); }   // (a cut for the waiting pullers: at the new corner as the camera turns to it; round 8: the working pair too — fitted for the corner he left they stood cut at the new one's edge)
      return 0;
    }
    function easeStep(dt) {
      const E = A.ease; if (!E) return; A.esN = (A.esN | 0) + 1; E.t = Math.min(1, E.t + dt / SA.SNAP); const u = E.t * E.t * (3 - 2 * E.t);
      A.th = E.a + (E.b - E.a) * u; if (E.own) view(A.th, 0.01);
      if (E.t >= 1) { A.ease = null; A.th = E.b; ev('view:' + (((cornerOf(A.th) % 4) + 4) % 4)); }
    }
    // ── the pullers (two), at the part he works
    const Bt = createBeat(X), gang = createGang(X), men = [null, null];
    /** where the pullers work part p: [[x, z, fx, fz, y], …] — outside on the floor for a brace or a belt (the west one in the gap
     *  between the yesod and the steps), on the block's top behind a wall (they push it out with poles), at the corner for the wedge */
    function placeOf(p) {
      const k = sideOf(p), n = NORM[k];
      if (p === 'wedge') { const [x, z] = S9.wedge; return [[x - 2.4, z + 2.4, x, z, F], [x - 4.6, z + 2.4, x, z, F]]; }   // (on the floor south of the corner, the rope up to the wedge's head)
      // (review P2: a wall's two pullers — the spec's השולפים — stand on the court beyond where it lies, their ropes to its head, not on the
      //  fill's top; the west one from the line's path between the yesod and the Ulam's steps)
      if (p.startsWith('wall:') && k !== 'W') {
        const c = k === 'N' || k === 'S' ? [MID[0], k === 'N' ? B[1] : B[3]] : [k === 'E' ? B[2] : B[0], MID[1]], al = n[0] ? [0, 1] : [1, 0], d = H + 3.5;
        return [-1, 1].map((s) => [c[0] + n[0] * d + al[0] * s * 3, c[1] + n[1] * d + al[1] * s * 3, c[0], c[1], F]);
      }
      if (k === 'W') { const z = MID[1], x = S9.sikra.pathW.x; return [-1, 1].map((s) => [x, z + s * 3.2, x, z, F]); }   // (the one-amah gap between the yesod and the steps: the line's west path)
      const g = p.startsWith('brace:') ? braceEnds(k)[0] : S9.belt[k], al = n[0] ? [0, 1] : [1, 0], d = p.startsWith('brace:') ? 1.4 : 4.2;
      return [-1, 1].map((s) => [g[0] + n[0] * d + al[0] * s * 1.6, g[2 - (p.startsWith('brace:') ? 0 : 1)] + n[1] * d + al[1] * s * 1.6, g[0], p.startsWith('brace:') ? g[2] : g[1], F]);
    }
    let workP = 'idle';
    // (the figure rule: a puller stands whole in the corner view the camera settles on, at its lens and the look's u 0.3 lens, and never
    //  over the work's middle nearer the eye — h131's figTest, the figures gate's own test)
    const fig = figTest(T), focus = [MID[0], Y1, MID[1]];
    const whole = (q) => {
      // (the camera settled: the director's own figures gate asked, at u 0 and the look's u 0.3 as it will judge him; turning: figTest)
      const G = globalThis.__FIG; if (!A.ease && A.t > A.camT && G && typeof G.probe === 'function') { try { const r = G.probe(q[0], q[4], q[1], { x: focus[0], y: focus[1], z: focus[2] }, 1.1);   /* (round 8: at the tallest a man is drawn — actors.js's 0.92–1.08 × life — as the gate's own reading of him) */ return !!(r && r.on && !r.cut && !r.between); } catch (e) { /* */ } }
      const v = cornerView(A.ease ? A.ease.b : A.th); return fig([v.eye, v.aim], SA.FOV, cam0.aspect || 1.6, q[0], q[4], q[1], focus, SA.EDGE) === 'whole';
    };
    /** the pair P slid along its face (al) until both stand whole: the nearest such place, or P itself */
    function fitPair(P, al, n) {
      for (const o of n ? [0, -1.4, -2.4] : [0]) for (const sft of [0, 1.6, -1.6, 3.2, -3.2, 4.8, -4.8, 6.4, -6.4, 8, -8, 10, -10, 12, -12]) {
        const Q = P.map((q) => [q[0] + al[0] * sft + (n ? n[0] * o : 0), q[1] + al[1] * sft + (n ? n[1] * o : 0), q[2], q[3], q[4]]); if (Q.every(whole)) return Q;
      }
      ev('fit:none'); return P;
    }
    /** the ground under a walker: the block's top inside it, the yesod's rim (one amah) round it, the court's floor beyond */
    const groundAt = (x, z) => { const o = Math.max(B[0] - x, x - B[2], B[1] - z, z - B[3]); return o <= 0 ? Y1 - 0.02 : o <= S9.rod.NW.to[0] - S9.rod.NW.from[0] ? Y0 : F; };
    /** where the pullers wait between parts: on the court outside a face toward the eye, toward its far end, both seen whole */
    function idleOf() {
      const th = A.ease ? A.ease.b : A.th, c = [Math.cos(th), Math.sin(th)];
      for (const k of ['N', 'S', 'E', 'W']) {
        const n = NORM[k]; if (n[0] * c[0] + n[1] * c[1] <= 0.1) continue;
        const al = n[0] ? [0, 1] : [1, 0], f = k === 'W' ? [S9.sikra.pathW.x, MID[1]] : n[0] ? [B[2] + 4.4, MID[1]] : [MID[0], (k === 'N' ? B[1] : B[3]) + n[1] * 4.4];
        for (const a of [12, -12, 9, -9, 6, -6, 3, -3]) {
          const P = [0, 1].map((i) => { const x = f[0] + al[0] * (a + i * 3 * Math.sign(a)), z = f[1] + al[1] * (a + i * 3 * Math.sign(a)); return [x, z, x + n[0] * 6, z + n[1] * 6, F]; });
          if (P.every(whole)) return P;
        }
      }
      const sx = c[0] > 0 ? 1 : -1, sz = c[1] > 0 ? 1 : -1, cx = sx > 0 ? B[2] : B[0], z = (sz > 0 ? B[3] : B[1]) + sz * 4.4;
      return [3, 7].map((d) => [cx - sx * d, z, cx - sx * d, z + sz * 6, F]);
    }
    // (waiting, the pullers stand with the rope in hand — not crouched over nothing)
    function castMen() {
      gang.clear(); const P = idleOf();
      for (let i = 0; i < 2; i++) { const q = P[i], w = gang.add(q[0], q[1], { role: 'hold', item: 'rope', fx: q[2], fz: q[3], crew: 2 + i }); if (w && w.a) { w.a.vis = 1; w.a.fixedY = q[4]; w.a.y = q[4]; } men[i] = w; }
    }
    function sendIdle(jump) {
      if (A.done) return; workP = 'idle'; A.idleT = 0; const P = idleOf();
      for (let i = 0; i < 2; i++) { const w = men[i]; if (!w) continue; w.goal = P[i]; w.want = 'hold'; w.item = 'rope'; w.until = 0; if (jump && w.a) { w.a.x = P[i][0]; w.a.z = P[i][1]; w.a.fixedY = P[i][4]; } }
    }
    function sendMen(p, role, jump) {
      workP = p; A.idleT = A.t + 2.4; const k = sideOf(p), isWall = p.startsWith('wall:'), P = p === 'wedge' ? fitPair(placeOf(p), [-1, 0]) : fitPair(placeOf(p), NORM[k][0] ? [0, 1] : [1, 0], p.startsWith('belt:') && k !== 'W' ? NORM[k] : null);
      for (let i = 0; i < 2; i++) { const w = men[i]; if (!w) continue; w.goal = P[i]; w.want = role || 'pull'; w.item = role === 'push' ? 'staff' : 'rope'; w.until = A.t + (jump ? 2.6 : 1.6); if (jump && w.a) { w.hop = 0; w.a.x = P[i][0]; w.a.z = P[i][1]; w.a.fixedY = P[i][4]; w.a.vis = w.a.visT = 1; } }
    }
    function moveMen(dt) {
      for (const w of men) {
        if (!w || !w.a) continue; const q = w.goal; if (!q) continue;
        // (a far place — across the block, over a wall, round a corner near the eye — is not walked in the picture: he steps out of it
        //  and is there; "whole or absent")
        if (Math.hypot(q[0] - w.a.x, q[1] - w.a.z) > SA.HOP || w.hop) {
          if (!w.hop) { w.hop = 1; w.hopT = A.t; w.a.visT = 0; }
          if (w.hop === 1 && (!(w.a.vis > 0.02) || A.t - w.hopT > 0.8)) { w.a.x = q[0]; w.a.z = q[1]; w.a.fixedY = q[4]; w.a.visT = 1; w.hop = 2; }
          if (w.hop === 2 && (w.a.vis >= 0.98 || A.t - w.hopT > 1.8)) w.hop = 0;
          if (w.hop === 1) continue;
        }
        const dx = q[0] - w.a.x, dz = q[1] - w.a.z, d = Math.hypot(dx, dz), st = Math.min(d, SA.PACE * dt);
        if (d > 0.02) { w.a.x += (dx / d) * st; w.a.z += (dz / d) * st; }
        // (from the floor to the block's top and back: a step at each edge — the yesod's rim, the block — never inside it)
        w.a.fixedY = d < 0.6 ? q[4] : groundAt(w.a.x, w.a.z);
        const walking = d > 0.15, role = walking ? 'brace' : A.t < (w.until || 0) ? w.want || 'pull' : 'hold';   // (between pulls he stands, the rope or staff in hand)
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
      const n = NORM[sideOf(p)], o = dir([n[0] * 2, 0, n[1] * 2]), co = ux * o[0] + uy * o[1];
      // (level 3's stuck south wall: along itself to the west is the slide — the nearer of the two ways wins; once slid, only out)
      if (lv === 3 && p === 'wall:S' && !S.slid) { const w = dir([-2, 0, 0]), cw = ux * w[0] + uy * w[1]; if (cw > SA.COS && cw >= co) return 'slide'; }
      return co > SA.COS ? 'pull' : null;
    }
    const FG = fingers(X, {
      // (the pair at the part his finger took, rope or staff in hand, before it moves: the pull is theirs — not the pointer's alone)
      down(f) { if (A.fl != null) return; const p = pick(f); if (!p) return; A.fl = f.id; f.w = { p, t0: A.t }; X.hand(null); try { if (workP !== p) sendMen(p, null, true); } catch (e) { ev('err:men:' + (e && e.message)); } },
      move(f) {
        const w = f.w; if (!w || A.fl !== f.id || w.did) return;
        if (f.moved < SA.PULL) return;
        const k = dragOf(w.p, f.x - f.x0, f.y - f.y0); if (!k) return;
        w.did = 1; if (k === 'slide') doSlide(); else doPull(w.p);
      },
      up(f) { const w = f.w; if (!w || A.fl !== f.id) return; A.fl = null; if (!w.did && f.moved <= SA.TAP) doTap(w.p); },
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
        V.creak(0.75); V.groan(); A.creakT = A.t + 0.6; A.shakeP = { p, t: 0 }; tugHolders(p); X.loss(0, at, ''); keep(); return;
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
      } else if (r.kind === 'wall') { X.hit(at, 'gold', { text: '', craft: 'נגרים' }); X.quick(at && { x: at.x, y: at.y, z: at.z, sep: true }, WORDS.quick, null); }
      else X.hit(at, 'good', { text: '', craft: 'נגרים' });
      if (p.startsWith('wall:')) fall(sideOf(p)); else out(p);
      keep();
      if (done(S)) closeSoon();
    }
    /** (review 132 R2) what holds a loaded part answers its pull: each holder still in place tugs — a short jolt toward the pulled
     *  part, a puff of dust where it bears — so the player sees what to free first. The pulled part itself does not move (spec line 185:
     *  "תומכה או חגורה טעונה לא זזה וחורקת"); nothing else lights */
    function tugHolders(p) {
      let hs = []; try { hs = deps(S, p).hard.filter((q) => S.left[q]); } catch (e) { hs = []; }
      for (const q of hs) {
        A.tug[q] = { t: -0.12 };   // (a beat after the pull: the cause after the effect's creak)
        const m = mid(q); setTimeout(() => { try { X.dust(m[0], m[1], m[2], 6, 1.2); } catch (e) { /* */ } }, 140);
      }
      if (hs.length) ev('tug:' + hs.join('+'));
    }
    function doSlide() {
      const r = slide(S); ev('slide:' + (r.ok ? 'ok' : 'no'));
      const at = atOf('wall:S');
      if (!r.ok) { if (r.loaded) { V.creak(0.75); A.creakT = A.t + 0.5; A.shakeP = { p: 'wall:S', t: 0 }; X.loss(0, at, ''); } keep(); return; }
      sendMen('wall:S', 'push'); V.scrape(0.7); setTimeout(() => V.scrape(0), 600); A.slideT = 0; X.hit(at, 'good', { text: '', craft: 'נגרים' }); keep();
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
      settle();
      // (a breath on the site as the strip left it: the white block, the four walls lying where they fell round it)
      { const v = cornerView(TH0); X.shot(v.eye, v.aim, 0.6); await X.wait(SA.CLEAN); }
      // (review P8, round 8: no men in the film — settle() above has laid the timber on the pile and cleared the gang, the pullers
      //  with it (the probes' log: both null in the film), and the spec's 'what stays in the world' at the strip's end (shlav-09 line 218)
      //  asks for the white block and the four walls lying where they fell, no men: the film shows that alone)
      // (the probes' log: where the film's two men are, whether they live and are drawn, and where on the screen — review P8)
      globalThis.__H132_FILMMEN = () => men.map((w) => { if (!w || !w.a) return null; const a = w.a, s = X.scr(a.x, (a.y || 0) + 1.8, a.z); return { x: r2(a.x), y: r2(a.y), fy: r2(a.fixedY), z: r2(a.z), vis: r2(a.vis), visT: a.visT, alive: !!a.alive, gateOff: !!a.gateOff, scr: [Math.round(s.x), Math.round(s.y), s.on === false ? 0 : 1] }; });
      ev('film:men ' + men.map((w) => (w && w.a ? 'up' : 'none')).join(','));
      // (far enough that the whole block and the four walls lying round it stand in the frame: at 40 amot the top alone filled it)
      const R = 58, sh = [1, -1].map((i) => { const a = (i * Math.PI) / 4;   // (from the south-east and the north-east: west of the block stand the Ulam's steps)
        return [[MID[0] + Math.cos(a) * R, Y1 + 22, MID[1] + Math.sin(a) * R], [MID[0], Y1 + 0.5, MID[1]], 2.0]; });   // (aimed on the block's top)
      X.end({ stars: res.stars, q: res.q, pts: res.pts, perfect: res.perfect, flags: res.flags, at: { x: MID[0], y: Y1, z: MID[1] },
        film: { shots: sh, secs: 4, kohen: false, own: () => [], after: () => { try { gang.clear(); } catch (e) { /* */ } } } });
    }
    /** the site cleared for the line: four men carry the north wall on their shoulders to the timber pile (a short shot), and with a
     *  cut every board of the form — the four walls, the braces, the belts, the wedge — lies stacked there; the white block alone */
    async function carry() {
      const W = SH9.walls && SH9.walls.N; if (!W) { stackAll(); return; }
      const q1 = stackAt('N'), h = wallHinge('N'), sy = F + SA.SHOULDER, p0 = [h.p[0], sy, h.p[1] - H - SA.CLEAR], p1 = [q1.p[0], sy, q1.p[2]];
      gang.clear(); men[0] = men[1] = null; const crew = [];
      for (let i = 0; i < 4; i++) { const w = gang.add(p0[0], p0[2], { role: 'hold', crew: 2 + i, fx: MID[0], fz: MID[1] }); if (w && w.a) { w.a.vis = 1; w.a.fixedY = F; } crew.push(w); }
      A.carry = { t: 0, W, p0, p1, r: q1.r, crew, L: h.L };
      const mid0 = [(p0[0] + p1[0]) / 2 + h.L / 2, F + 1.5, (p0[2] + p1[2]) / 2 + H / 2], E = SA.CARRY_EYE;
      // (pulled back until the four bearers stand whole at the route's start and its end)
      const bearers = (q) => [0, 1, 2, 3].map((i) => [q[0] + h.L * (i % 2 ? 0.78 : 0.22), i < 2 ? q[2] - SA.SIDE : q[2] + H + SA.SIDE]);
      let eye = null;
      for (let f = 1; f <= 2.6 && !eye; f += 0.1) {
        const e = [mid0[0] + E[0] * f, F + E[1] * f, mid0[2] + E[2] * f];
        if ([p0, p1].every((q) => bearers(q).every((b) => fig([e, mid0], SA.FOV, cam0.aspect || 1.6, b[0], F, b[1], null, SA.EDGE) === 'whole'))) eye = e;
      }
      X.shot(eye || [mid0[0] + E[0] * 2.6, F + E[1] * 2.6, mid0[2] + E[2] * 2.6], mid0, 0.6);
      await X.wait(SA.CARRY + 0.6);
      stackAll();
      // (a breath on the cleared site: the white block alone on a clean floor, from the morning's corner)
      const v = cornerView(TH0); X.shot(v.eye, v.aim, 0.01); await X.wait(SA.CLEAN);
    }
    /** the strip's end: the walls left where they fell (lieAfter), the braces, belts and wedge to the timber pile (the world's), the sills off */
    function settle() { stackAll(); }
    function stackAll() {
      A.carry = null; A.stacked = 1; lieAfter(); try { siteClear(true); } catch (e) { /* */ }   // (the world: the sills off, the timber on the pile)
      for (const p of Object.keys(parts)) parts[p].visible = false;
      try { gang.clear(); } catch (e) { /* */ } men[0] = men[1] = null;
    }
    function carryStep(dt) {
      const C = A.carry; if (!C) return; C.t += dt; const u = Math.min(1, C.t / SA.CARRY);
      const x = C.p0[0] + (C.p1[0] - C.p0[0]) * u, z = C.p0[2] + (C.p1[2] - C.p0[2]) * u;
      C.W.grp.position.set(x, C.p0[1], z); C.W.grp.rotation.set(C.r[0], C.r[1], C.r[2]);
      const dx = C.p1[0] - C.p0[0], dz = C.p1[2] - C.p0[2], L = Math.hypot(dx, dz) || 1;
      C.crew.forEach((w, i) => {
        if (!w || !w.a) return; const ax = x + C.L * (i % 2 ? 0.78 : 0.22), az = i < 2 ? z - SA.SIDE : z + H + SA.SIDE;
        w.a.x = ax; w.a.z = az; w.a.fixedY = F;
        if (!w.stride && u < 1) gang.setRole(w, 'hold', { fx: ax + (dx / L) * 4, fz: az + (dz / L) * 4, stride: 0.8, rate: 1.2 });
        w.fx = ax + (dx / L) * 4; w.fz = az + (dz / L) * 4;
      });
    }
    // ── drawing
    function draw(dt) {
      if (A.carry) carryStep(dt);
      if (A.stacked || A.carry) return;
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
      for (const q of Object.keys(A.tug)) {
        const T0 = A.tug[q]; T0.t += dt; const g = q.startsWith('wall:') ? SH9.walls && SH9.walls[sideOf(q)] && SH9.walls[sideOf(q)].grp : parts[q]; if (!g) { delete A.tug[q]; continue; }
        if (g.userData.ty0 == null) g.userData.ty0 = g.position.y;
        const u = T0.t, s = u > 0 && u < 0.45 ? Math.sin(u * 46) * 0.09 * (1 - u / 0.45) : 0;
        if (q.startsWith('wall:')) g.rotation.z = (g.userData.rz0 || 0) + s * 0.08; else g.position.y = g.userData.ty0 + s;
        if (u >= 0.45) { if (q.startsWith('wall:')) g.rotation.z = g.userData.rz0 || 0; else g.position.y = g.userData.ty0; delete A.tug[q]; }
      }
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
        hold('strip', true); homeWalls(); dress(X); smats(X);
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
        easeStep(dt);
        // (the look let go and home: the act's own lens — after a turn the director's look can leave its lifted lens on the camera)
        if (!A.done) { try { const L = X.lookNow ? X.lookNow() : null; const home = L && L.u < 1e-3 && Math.abs(L.yaw) < 1e-3; if (L && !home && L.u > 0.05) A.wasOut = 1; if (home && A.wasOut && !A.ease) { A.wasOut = 0; view(A.th, 0.4); }   /* (back from a lift: the act's own shot retaken, its aim too) */ if (home && Math.abs(cam0.fov - SA.FOV) > 0.05) { if (!A.fovN) ev('lens:' + cam0.fov.toFixed(1)); A.fovN = (A.fovN | 0) + 1; lens(SA.FOV); } } catch (e) { /* */ } }
        try { V.frame(); Bt.step(dt); gang.update(dt, Bt); moveMen(dt); draw(dt); }
        catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h132] strip', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
      },
      down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { A.fl = null; V.creak(0); keep(); },
      wants(p) { if (!p) return true; return !!pick(p); },
      holds() { return A.fl != null; },
      // (the director's look, turned all the way round in this act, and settled on a corner when let go)
      lookYaw: Math.PI,
      lookEnd,
      end() {
        FG.detach(); V.stop(); X.hand(null); lens(fov0);
        if (!A.done) gang.clear();
        for (const g of bulges) { try { g.parent.remove(g); } catch (e) { /* */ } }
        if (SH9.walls && !A.stacked) { SH9.walls.S.grp.position.x = B[0]; SH9.walls.W.grp.rotation.set(0, 0, 0); }
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
        o.step = workP + ':v' + (((cornerOf(A.th) % 4) + 4) % 4) + (A.ease ? ':ease' : A.t < A.camT ? ':cam' : '');
        o.pulling = men.some((w) => w && w.role && (w.role === 'pull' || w.role === 'push') && !w.stride);
        o.settled = A.t > 1.2 && A.t > A.camT && !A.ease && !Object.values(A.fallK).some((f) => f && !f.landed);
        o.view = ((cornerOf(A.th) % 4) + 4) % 4; o.th = r2(A.th); o.carry = !!A.carry; o.stacked = !!A.stacked; o.esN = A.esN | 0; o.ease = A.ease ? { a: r2(A.ease.a), b: r2(A.ease.b), t: r2(A.ease.t), own: A.ease.own } : null;
        try { const L = X.lookNow ? X.lookNow() : null; o.look = L ? { u: r2(L.u), yaw: r2(L.yaw), play: L.play } : null; } catch (e) { o.look = null; }
        const cp = cam0.position; o.cam = [cp.x, cp.y, cp.z].map((v) => +v.toFixed(1));
        return o;
      },
    };
  },
};
void Y0;
