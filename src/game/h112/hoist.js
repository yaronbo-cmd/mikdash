/* ── build 112 ── h112/hoist.js — the slab on the crane's rope, shared by stations 2 (the lattice slab), 3 (the warning slab) and 5 (the
 * closing slab): the crews hang it from the treadwheel crane over its bay; the finger turns it (a drag sideways: it follows with weight
 * and settles), a tap has the crew turn it end over end, a hold lowers it — the longer the hold the faster (the owner 3.11: "ככל
 * שמחזיקים יותר שירד מהר יותר"); a release stops it. A gentle touch at the end is always clean, even after a fast descent.
 *
 *   const H = createHoist(X, o) — o: { F (the bay's frame: at, yaw, ux, uz, nx, nz), g (the slab's group), seatY (its foot when seated),
 *     entryY (the posts' tops: it must be square to its grooves there), tol (rad), vSafe (amot/s), wind, crane, onEvent(kind, info) }
 *   H.hang(g, o2) · H.update(dt) · H.down(p) · H.move(p) · H.up(p) · H.state() · H.dispose()
 *   events: 'entry-miss' (not square: it stops on the posts' tops), 'seat' { v, mirrored }, 'chip' { v }, 'gust-hit', 'force' (pressed on
 *   the posts' tops for long: the closing's too-wide slab)
 */
import { clamp, lerp } from '../h109/kit.js';

const TAU = Math.PI * 2;
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export function createHoist(X, o) {
  const T = X.THREE, F = o.F, crane = o.crane;
  const H = {
    g: null, y: 4.4, v: 0, th: 0, thT: 0, om: 0, flip: 0, flipA: 0, sway: 0, swayV: 0,
    mode: 'off', press: null, t: 0, gust: { next: 6 + Math.random() * 2, warn: 0, on: 0, k: 0 }, stuck: 0, busy: false,
    hang0: o.hangY || 4.4, block: 0,
  };
  const tip = new T.Vector3();
  // the pennant on the crane's tip (level 3: it warns a moment before every gust)
  let pen = null;
  if (o.wind && crane) {
    pen = new T.Mesh(new T.PlaneGeometry(1.1, 0.42, 5, 1), X.props.M.cloth); pen.geometry.translate(0.55, 0, 0); X.props.root.add(pen);
    pen.userData.base = pen.geometry.attributes.position.array.slice();
  }
  function pose() {
    const g = H.g; if (!g) return;
    const half = (g.userData.H || 1.5) / 2;
    const sx = F.ux * H.sway, sz = F.uz * H.sway;
    g.position.set(F.cx + sx, H.y + half, F.cz + sz);
    g.rotation.set(0, F.yaw + H.th, 0);
    const s = g.userData.slab; if (s) s.rotation.x = H.flipA;
    if (crane) {
      try {
        crane.tipWorld(tip); crane.rope.show(true);
        crane.rope.set({ x: tip.x, y: tip.y, z: tip.z }, { x: g.position.x, y: g.position.y + half + 0.05, z: g.position.z }, 0);
      } catch (e) { /* */ }
    }
  }
  H.hang = (g, o2 = {}) => {
    H.g = g; H.y = o2.y != null ? o2.y : H.hang0; H.v = 0; H.th = H.thT = o2.th || 0; H.om = 0; H.flip = o2.flip ? 1 : 0; H.flipA = H.flip ? Math.PI : 0; H.sway = 0; H.swayV = 0;
    H.mode = 'hang'; H.block = 0; H.stuck = 0; pose();
  };
  H.release = () => { H.g = null; H.mode = 'off'; try { if (crane) crane.rope.show(false); } catch (e) { /* */ } };
  const ev = (k, i) => { try { if (o.onEvent) o.onEvent(k, i || {}); } catch (e) { console.warn('[h112] hoist', k, e && e.message); } };
  /** square to the grooves: the turn near 0 (or near half a turn: it goes in, mirrored) and right way up */
  function square() {
    const a = wrap(H.th), m = Math.abs(a) <= o.tol ? 0 : Math.abs(wrap(a - Math.PI)) <= o.tol ? 1 : -1;
    const up = !H.flip && Math.abs(H.flipA) < 0.05;
    return { ok: m === 0 && up, mirrored: m === 1 && up, upside: !!H.flip };
  }
  H.square = square;
  H.update = (dt) => {
    H.t += dt; if (!H.g) return;
    // the turn: a spring to the finger's target, with weight (rule 21: it follows a heavy thing's lag and settles)
    const acc = 26 * (H.thT - H.th) - 8.5 * H.om; H.om += acc * dt; H.th += H.om * dt;
    // the crew's turn end over end (a tap)
    const fT = H.flip ? Math.PI : 0; H.flipA += clamp(fT - H.flipA, -dt * 3.2, dt * 3.2);
    // the wind (level 3): the pennant warns 1.2 s ahead, then a gust swings the slab for 1.8 s
    if (o.wind) {
      const G = H.gust; G.next -= dt;
      if (G.next <= 1.2 && !G.warn) { G.warn = 1; ev('gust-warn'); }
      if (G.next <= 0 && !G.on) { G.on = 1.8; G.k = Math.random() > 0.5 ? 1 : -1; ev('gust'); X.play('rope'); }
      if (G.on > 0) {
        G.on -= dt; H.swayV += G.k * 2.6 * dt; H.om += G.k * 1.6 * dt;
        if (G.on <= 0) { G.on = 0; G.warn = 0; G.next = 5 + Math.random() * 3; }
      }
      if (pen && crane) {
        crane.tipWorld(tip); pen.position.set(tip.x, tip.y + 0.3, tip.z); pen.rotation.y = H.t * 0.3;
        const P = pen.geometry.attributes.position, B = pen.userData.base, amp = G.on > 0 ? 0.35 : G.warn ? 0.3 : 0.06, f = G.warn || G.on ? 14 : 4;
        for (let i = 0; i < P.count; i++) { const x = B[i * 3]; P.setZ(i, Math.sin(H.t * f + x * 4) * amp * x); }
        P.needsUpdate = true;
      }
    }
    H.swayV += -14 * H.sway * dt; H.swayV *= Math.exp(-dt * 1.6); H.sway += H.swayV * dt;
    // lowering: the hold speeds it; a release stops it (it is heavy: a short ease to rest)
    const holding = H.mode === 'lower' && H.press;
    if (holding) { const ht = H.t - H.press.t0; H.v = Math.min(3.0, 0.25 + 0.6 * ht + 0.9 * ht * ht); }
    else H.v *= Math.exp(-dt / 0.09);
    if (H.v < 0.004) H.v = 0;
    if (H.v > 0 && !H.busy) {
      const ny = H.y - H.v * dt, sq = square();
      // a gust at the posts: the slab swings into a post (level 3: "לוח ששחררו באמצע משב")
      if (o.wind && H.gust.on > 0 && holding && ny < o.entryY + 0.4) { H.v = 0; H.mode = 'hang'; H.press = null; ev('gust-hit'); return pose(); }
      if (ny <= o.entryY && H.y > o.entryY - 0.001 && (!sq.ok && !sq.mirrored || o.blockAtEntry && o.blockAtEntry())) {
        // not square to the grooves (or too wide: the closing): it stops on the posts' tops
        H.y = o.entryY; const v = H.v; H.v = 0;
        if (!H.block) { H.block = 1; X.play('thud'); X.shake(0.06, 0.12); ev('entry-miss', { v, ...sq }); }
        if (holding) { H.stuck += dt; if (H.stuck > 0.7 && o.blockAtEntry && o.blockAtEntry()) { H.stuck = 0; ev('force'); } }
        return pose();
      }
      H.block = 0; H.stuck = 0;
      if (ny <= o.seatY) {
        const v = H.v; H.y = o.seatY; H.v = 0; H.mode = 'seated'; H.press = null;
        if (v > o.vSafe) ev('chip', { v, ...sq }); else ev('seat', { v, ...sq });
        return pose();
      }
      H.y = ny;
    }
    pose();
  };
  H.down = (p) => {
    if (!H.g || H.busy || H.mode === 'seated') return false;
    H.press = { x: p.x, y: p.y, x0: p.x, t0: H.t, th0: H.thT, moved: false };
    H.om *= 0.3;   // (a hand on it: it slows)
    return true;
  };
  H.move = (p) => {
    const P = H.press; if (!P || H.busy) return;
    // (a sideways drag turns it; one that starts after the hold began lowering, wider, stops the lowering and turns it)
    if (!P.moved && Math.abs(p.x - P.x0) > (H.mode === 'lower' ? 22 : 9)) { P.moved = true; H.mode = 'turn'; P.th0 = H.thT; }
    if (H.mode === 'turn') H.thT = P.th0 + ((p.x - P.x0) / Math.max(320, innerWidth)) * TAU * 0.9;
  };
  H.up = () => {
    const P = H.press; H.press = null; if (!P || H.busy) return null;
    const dt = H.t - P.t0, was = H.mode;
    if (H.mode === 'turn' || H.mode === 'lower') H.mode = 'hang';
    if (was === 'hang' && !P.moved && dt < 0.25) return 'tap';
    return was;
  };
  /** the press held still turns into lowering (a hold, not a turn) */
  H.tick = () => { const P = H.press; if (P && !P.moved && H.mode === 'hang' && H.t - P.t0 > 0.22) { H.mode = 'lower'; P.t0 = H.t; } };
  H.flipNow = () => { H.flip = H.flip ? 0 : 1; X.play('rope'); };
  H.raise = async (to) => { H.busy = true; const y0 = H.y; for (let k = 1; k <= 20; k++) { await X.wait(0.04); H.y = lerp(y0, to, k / 20); pose(); } H.busy = false; H.mode = 'hang'; };
  H.state = () => ({ y: +H.y.toFixed(3), v: +H.v.toFixed(3), th: +wrap(H.th).toFixed(3), thT: +H.thT.toFixed(3), flip: H.flip, mode: H.mode, busy: H.busy, gust: o.wind ? { warn: H.gust.warn, on: +H.gust.on.toFixed(2), next: +H.gust.next.toFixed(2) } : null, seatY: o.seatY, entryY: o.entryY });
  H.dispose = () => { if (pen) X.props.remove(pen); try { if (crane) crane.rope.show(false); } catch (e) { /* */ } };
  return H;
}
