/* ── build 134 ── h134/chilutz.js — work 2 "חילוץ הגופים", one corner's station (spec docs/specs/shlav-11-he.md, עבודה 2; the rules:
 * chilutz-model.js). Open only once all four horns are packed (Rambam 2:16, the owner's pick "כמו הרמבם"). Also run inside a packing's
 * replay or a repair (makeExtract with chained: true), at once after the frame comes off.
 * A low camera a little over the horn's lip, on the core's head and its rope loop; round it the horn's inner lip.
 *   · the WORK hand on the core's head tilts it (a drag a little to a side: its screen direction turned into a world one by the camera at
 *     the touch, and locked); on the rope's loop it pulls up (once every point is let go — earlier, the core catches);
 *   · the HELPING hand turns the view round the opening while the work hand holds the tilt (a drag); a strip of light opens on the side
 *     of a caught point when the tilt is away from it, and shows only from that side;
 *   · out: one long buzz and the dull release; the camera dives into the hollow horn — the light above, the walls he built, dust in the
 *     light — and stays until a touch, or 4 s.
 *   CHIL_ACT = { icon, title, walkLine, stand, prepare, make } · makeExtract(X, o) → act
 */
import { BOOK } from '../world/grid.js';
import { WORDS, CORNER_OF } from './model.js';
import { fresh, load, save, tiltTo, tiltEnd, step, pullBy, pullEnd, lights, allFree, result, CK, DIRS } from './chilutz-model.js';
import { mats11, viewOf } from './look.js';
import { hornGroup, own } from './world.js';
import { award, extra, hurt, finish, V3, lens, voices, px360, MIN_GRIP, basis } from './kit11.js';
import { createSalt } from './salt.js';
import { box } from '../h131/world.js';
import { fingers } from '../h113/acts.js';

const S11 = BOOK.s11, Y = S11.top, HH = S11.hornH;
export const CA = Object.freeze({ FOV: 22, R: 3.0, UP: 1.05, LOOP: 0.34, DIVE: 4, YAW_K: 3.2, TILT_VIS: 2.2 });

export function makeExtract(X, o) {
  const T = X.THREE, Mo = X.M, c = o.corner, h = S11.horns[c], lv = o.lv | 0 || 1, V = voices(X), Mt = mats11(X), HC = Mo.st.horns[c];
  const m = o.m || { id: 'chilutz' + c + lv, k: 'chilutz' + c, lv, corner: c };
  const root = new T.Group(); root.name = 'h134-chilutz'; (o.root || X.props.root).add(root);
  const A = { t: 0, ev: [], ended: false, finished: false, busy: 0, w: null, hp: null, salt: null, dive: null, yaw: 0, lockB: null, dragPx: 0 };
  const ev = (e) => { A.ev.push(e); if (A.ev.length > 20) A.ev.shift(); };
  const b0 = o.chained ? null : Mo.workOf(m.k);
  let S = b0 && b0.id === m.id ? load(b0) : null; if (S && S.lv !== lv) S = null; const resumed = !!S;
  if (!S) S = fresh(c, lv);
  let k0 = ''; const keep = () => { if (o.chained) return; const b = save(S, m.id), k = JSON.stringify(b); if (k === k0) return; k0 = k; Mo.keep(m.k, b); X.save(); };
  // ── the horn as packed, without its core (the act draws the core)
  if (!o.chained) { own('horn:' + c, true); root.add(hornGroup(X, c, Mo.st, { skip: { core: true, basket: true } })); }
  const core = new T.Group(); root.add(core); core.position.set(h.core[0], Y, h.core[1]);
  const hf = h.coreHalf, CH = 1;
  const body = box(X, lv === 2 ? Mt.y11stoneNW : Mt.y11wood, -hf, 0, -hf, hf, CH, hf, core); body.name = 'h134-core';
  const loop = new T.Mesh(new T.TorusGeometry(0.1, 0.022, 6, 16), Mt.y11rope); loop.position.set(0, CH + CA.LOOP, 0); core.add(loop);
  const rope = box(X, Mt.y11rope, -0.012, CH, -0.012, 0.012, CH + CA.LOOP - 0.09, 0.012, core);
  // the strips of light: one per point, in the gap on its side (level 1 wide and bright, level 3 thin)
  const strips = S.pts.map((p) => {
    const d = DIRS[p.d], w = lv === 1 ? 0.05 : lv === 2 ? 0.03 : 0.014, L = 0.44, g = new T.PlaneGeometry(L, w); g.rotateX(-Math.PI / 2);
    const mat = Mt.y11light.clone(); mat.opacity = 0; const q = new T.Mesh(g, mat); q.rotation.y = -Math.atan2(d[1], d[0]) - Math.PI / 2;
    q.position.set(h.core[0] + d[0] * (hf + w / 2), Y + HH + 0.006, h.core[1] + d[1] * (hf + w / 2)); q.name = 'h134-strip'; root.add(q);
    return q;
  });
  const dust = new T.Group(); root.add(dust);
  // ── the camera: low over the lip, round the core (the helping hand turns it)
  const cam0 = X.camera, fov0 = cam0.fov;
  { const v = viewOf(c), d0 = lv === 1 ? DIRS[S.pts[0].d] : [v.f[0], v.f[1]]; A.yaw = Math.atan2(-d0[1], -d0[0]); }   // (level 1: from opposite its point: the strip shows from the first view)
  function home(d = 0) {
    lens(X, CA.FOV);
    const R = CA.R, ex = h.core[0] + Math.cos(A.yaw) * R, ez = h.core[1] + Math.sin(A.yaw) * R;
    X.shot([ex, Y + HH + CA.UP, ez], [h.core[0], Y + HH + 0.25, h.core[1]], d);
  }
  const scrOf = (v) => { const r = X.scr(v.x, v.y, v.z); return { x: r.x, y: r.y }; };
  const headScr = () => scrOf(new T.Vector3(h.core[0], Y + CH * 0.95 + S.rise * CK.TEF, h.core[1]));
  const loopScr = () => scrOf(new T.Vector3(h.core[0], Y + CH + CA.LOOP + S.rise * CK.TEF, h.core[1]));
  const grip = () => Math.max(MIN_GRIP * px360(), 30);
  const onLoop = (f) => { const p = loopScr(); return Math.hypot(f.x - p.x, f.y - p.y) < grip(); };
  const onHead = (f) => { const p = headScr(); return Math.hypot(f.x - p.x, f.y - p.y) < grip() * 1.4; };
  const FG = fingers(X, {
    down(f) {
      if (A.finished || A.busy) { if (A.dive && !A.dive.out && A.dive.t > 0.4) A.dive.tap = true; return; }
      if (A.salt && A.salt.on) { if (!A.salt.down(f)) A.salt.helperDown(f); return; }
      if (A.w) { if (!A.hp) { A.hp = { id: f.id, x: f.x, y0: f.y, yaw0: A.yaw }; ev('help'); } return; }
      if (onLoop(f)) { A.w = { id: f.id, k: 'pull', x0: f.x, y0: f.y, y: f.y, last: f.y }; ev('loop'); X.hand(null); return; }
      if (onHead(f)) { A.w = { id: f.id, k: 'tilt', x0: f.x, y0: f.y, B: basis(X) }; ev('head'); X.hand(null); return; }
    },
    move(f) {
      if (A.salt && A.salt.on) { A.salt.move(f); return; }
      if (A.hp && f.id === A.hp.id) { A.yaw = A.hp.yaw0 - ((f.x - A.hp.x) / Math.max(1, innerWidth)) * CA.YAW_K; home(0.01); return; }
      if (!A.w || f.id !== A.w.id) return;
      if (A.w.k === 'tilt') {
        const dx = f.x - A.w.x0, dy = f.y - A.w.y0, B = A.w.B, wx = B.r[0] * dx + B.f[0] * -dy, wz = B.r[1] * dx + B.f[1] * -dy;
        const k = Math.hypot(dx, dy) / (CK.DRAG * Math.max(1, innerHeight));
        tiltTo(S, [wx, wz], k);
      } else A.w.y = f.y;
    },
    up(f) {
      if (A.salt && A.salt.on) { A.salt.up(f); return; }
      if (A.hp && f.id === A.hp.id) { A.hp = null; return; }
      if (A.w && f.id === A.w.id) { const W = A.w; A.w = null; if (W.k === 'tilt') tiltEnd(S); else { if (pullEnd(S)) ev('sink'); } keep(); }
    },
  });
  function saltNow(at) { A.salt = createSalt(X, { at: [at.x, at.y, at.z], corner: c, onDone: () => { Mo.salted(c); X.save(); A.salt = null; }, onLater: () => { A.salt = null; } }); }
  const buzz = (p) => { try { if (X.haptic) X.haptic(p); } catch (e) { /* */ } };
  function onEv(e) {
    ev(e.k + (e.d ? ':' + e.d : ''));
    const side = e.d ? DIRS[e.d] : [0, 0], at = V3(X, h.core[0] + side[0] * 0.3, Y + HH, h.core[1] + side[1] * 0.3);
    if (e.k === 'free') { V.tick(); buzz(25); award(X, at, e.scuff ? 'good' : 'gold', lv, 'חולצים'); core.position.y = Y + 0.01; setTimeout(() => { core.position.y = Y; }, 90); }
    else if (e.k === 'scuff') { V.scrape(0.8); setTimeout(() => V.scrape(0), 260); buzz([20, 40, 20]); hurt(X, Mo, 'chilutz.scuff', at, { corner: c, lv, side: e.d }); }
    else if (e.k === 'break') { V.crack(); buzz([40, 30, 60]); hurt(X, Mo, 'chilutz.break', at, { corner: c, lv }); saltNow(V3(X, h.core[0] - 0.3, Y + HH, h.core[1])); }
    else if (e.k === 'out') out();
    keep();
  }
  async function out() {
    A.busy = 1; V.release(); buzz(220);
    const R = result(S, { flaws: 0 }), at = V3(X, h.core[0], Y + HH + 0.6, h.core[1]);
    award(X, at, R.steps[R.steps.length - 1] === 40 ? 'gold' : R.steps[R.steps.length - 1] === 20 ? 'good' : 'ok', lv, 'חולצים');
    if (R.clean) extra(X, 40, lv, 'clean', 'גוף נקי');
    // the core away to the crew; the camera dives into the hollow horn and stays there until a touch (or 4 s)
    A.lift = { t: 0 };
    await X.wait(0.6); if (A.ended) return;
    core.visible = false;
    X.shot([h.core[0] + 0.05, Y + 0.95, h.core[1] + 0.04], [h.core[0], Y + 0.02, h.core[1]], 0.9); lens(X, 60);
    A.dive = { t: 0, tap: false };
    for (let i = 0; i < 10; i++) { const p = box(X, Mt.y11light, -0.006, -0.006, -0.006, 0.006, 0.006, 0.006, dust); p.position.set(h.core[0] + ((i * 37) % 9 - 4) * 0.04, Y + 0.2 + (i % 5) * 0.12, h.core[1] + ((i * 53) % 7 - 3) * 0.04); p.material = Mt.y11glow; }
    while (!A.ended && !A.dive.tap && A.dive.t < CA.DIVE) await X.wait(0.1);
    if (A.ended) return;
    lens(X, CA.FOV); home(0.8);
    const res = result(S, {});
    A.finished = true;
    if (!o.chained) { HC.cored = 1; X.save(); }
    if (o.onEnd) { if (res.perfect) { try { X.perfect(WORDS.chilutz, at); await X.wait(1.0); } catch (e) { /* */ } } o.onEnd(res); return; }
    A.finished = false; await finish(X, A, res, WORDS.chilutz, at, { eye: [h.core[0] + Math.cos(A.yaw) * 4, Y + 3.2, h.core[1] + Math.sin(A.yaw) * 4], aim: [h.core[0], Y + 0.5, h.core[1]], secs: 1.4, kohen: false, after: () => { try { Mo.filmOver(); } catch (er) { /* */ } } });
  }
  function draw(dt) {
    const k = S.k, d = S.dir, a = (k * CK.FULL * CA.TILT_VIS * Math.PI) / 180;
    core.rotation.set(d[1] * a, 0, -d[0] * a);
    if (!A.lift) core.position.set(h.core[0], Y + S.rise * CK.TEF, h.core[1]);
    else { A.lift.t += dt; core.position.y = Y + S.rise * CK.TEF + A.lift.t * 2.2; }
    // the strips: open by the tilt away from their point, shown only from their side (the view facing it)
    const fx = h.core[0] - (h.core[0] + Math.cos(A.yaw)), fz = h.core[1] - (h.core[1] + Math.sin(A.yaw));
    const L = lights(S);
    L.forEach((q, i) => { const st = strips[i], dd = DIRS[q.d]; const face = Math.max(0, fx * dd[0] + fz * dd[1]); const vis = lv === 1 ? Math.max(0.5, face) : face * face; st.material.opacity = q.done ? 0 : Math.min(0.95, q.k * vis * (lv === 3 ? 0.55 : 1) + (q.hold > 0 && lv < 3 ? 0.15 * q.hold : 0)); });
    // the rope creaks in the full range and while pulling fast
    const cr = k > CK.WORK ? (k - CK.WORK) / (CK.STOP - CK.WORK) : 0, pv = S.speed / CK.SPEED;
    V.creak(Math.max(cr, pv > CK.CREAK ? Math.min(1, pv) : 0));
    if (pv > CK.CREAK && A.t % 0.25 < dt) { try { X.dust(h.core[0], Y + HH, h.core[1], 3, 0.05); } catch (e) { /* */ } }
    if (A.dive) { A.dive.t += dt; dust.children.forEach((p, i) => { p.position.y += Math.sin(A.t * 0.7 + i) * 0.0008; }); }
  }
  function hint() { if (resumed || A.hintOn || o.chained && lv > 1) return; A.hintOn = 1; const d = DIRS[S.pts[0].d]; const B = basis(X); const sx = -(d[0] * B.r[0] + d[1] * B.r[1]), sy = (d[0] * B.f[0] + d[1] * B.f[1]); X.hand({ x: h.core[0], y: Y + CH, z: h.core[1] }, Math.round(sx * 50), Math.round(sy * 50)); }
  const act = {
    close: true,
    begin() {
      try { X.kohen(false); } catch (e) { /* (he kneels on the priests' walk, out of the picture) */ }
      FG.attach(); home(o.chained ? 0.8 : 0.01);
      if (!o.chained) X.line('', 0); else X.line('חילוץ הגוף מהזפת החדשה', 1800);
      X.wait(0.9).then(() => { if (!A.ended) hint(); });
      ev(resumed ? 'resume' : 'begin'); keep();
    },
    update(dt) {
      A.t += dt;
      try {
        V.frame();
        if (A.salt) A.salt.update(dt);
        if (!A.busy) {
          for (const e of step(S, dt)) onEv(e);
          if (A.w && A.w.k === 'pull') { const dy = A.w.last - A.w.y; A.w.last = A.w.y; const dR = (dy / Math.max(1, innerHeight)) * CK.PULL_SCREEN; for (const e of pullBy(S, dR, dt)) onEv(e); }
          else if (!A.w) pullBy(S, 0, dt);
        }
        draw(dt);
        if (A.t % 1 < dt) keep();
      } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h134] chilutz', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
    },
    down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
    cancel() { if (A.w) { if (A.w.k === 'tilt') tiltEnd(S); else pullEnd(S); } A.w = null; A.hp = null; keep(); },
    wants(p) { if (!p) return true; if (A.salt && A.salt.on) return true; if (A.w) return true; if (A.dive) return true; return onLoop(p) || onHead(p); },
    holds() { return !!A.w; },
    lensFov: CA.FOV,
    end() {
      A.ended = true; FG.detach(); V.hush(); X.hand(null); lens(X, fov0); if (A.salt) A.salt.end();
      try { (o.root || X.props.root).remove(root); } catch (e) { /* */ }
      if (!o.chained) { X.props.remove(root); own('horn:' + c, false); }
    },
    at() { return V3(X, h.core[0], Y + HH, h.core[1]); },
    dbg() { const hs = headScr(), ls = loopScr(); return { id: m.id, lv, corner: c, pts: S.pts.map((p) => ({ d: p.d, done: p.done, scuff: p.scuff })), k: +S.k.toFixed(3), dir: S.dir.map((v) => +v.toFixed(2)), rise: +S.rise.toFixed(2), speed: +S.speed.toFixed(2), caught: S.caught, scuffs: S.scuffs, broke: S.broke, out: S.out, head: [Math.round(hs.x), Math.round(hs.y)], loop: [Math.round(ls.x), Math.round(ls.y)], yaw: +A.yaw.toFixed(2), salt: A.salt ? A.salt.dbg() : null, dive: !!A.dive, busy: A.busy, finished: A.finished, ev: A.ev.slice(-10), basis: basis(X) }; },
  };
  return act;
}
function stand(m) { const c = m.corner || CORNER_OF(m.k), h = S11.horns[c]; return { x: h.stand[0], z: h.stand[1], face: h.core.slice() }; }
export const CHIL_ACT = { icon: '🪢', title: 'חילוץ הגופים', walkLine: () => '', stand, prepare() {}, make(m, X) { return makeExtract(X, { corner: m.corner || CORNER_OF(m.k), lv: m.lv, m }); } };
