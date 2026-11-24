/* ── build 133 ── h133/malben.js — work 2 "המלבן במרכז" (spec docs/specs/shlav-10-he.md, עבודה 2). The rules: malben-model.js.
 * From above, almost straight down: the frame of 28 × 28 (four wooden beams, Zevachim 54a) hangs over the sovev's top on four ropes,
 * one crew on a short scaffold at each side. Four marking lines (a thin rope and charcoal dots) one amah in from each edge show where
 * it must come down. The kohen is out of the picture: the player conducts the four crews and the thumb works on the world (rule 62).
 *   · a drag from a crew outward (away from the block, across its side): that crew pulls — the frame takes it late and goes on, braking;
 *   · level 3: a drag along a crew's side turns it;
 *   · a hold on its middle for half a second: "מרפים יחד" — it comes down and is judged on its four margins.
 * Each side whose margin is one amah within a tefach glows soft green along its line. After the landing (the first time) the crews
 * fill it, quickly: pebbles, then molten lime, pitch and qunya, wooden rakes; the frame comes apart to the timber heap. Four lines of
 * light meet at the corners, the camera rises and the flat top shows: in light for a moment the horns' place, the priests' walk and the
 * fire's place 24 × 24; the light goes, no mark stays on the stone. A side farther than two tefachim: its corner strikes the sovev's edge
 * (−20, a crack stays). The right thumb is the camera.
 *   MALBEN_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { WORDS } from './model.js';
import { fresh, load, save, pull, turn, step, moving, margins, green, land, crackCorner, result, can, MK } from './malben-model.js';
import { mats10, own } from './world.js';
import { award, extra, hurt, finish, V3, lens } from './kit10.js';
import { box } from '../h131/world.js';
import { createVoices } from '../h129/sound129.js';
import { fingers } from '../h113/acts.js';
import { createGang, createBeat } from '../h109/kit.js';

const S10 = BOOK.s10, U = S10.upper, B9 = S10.block9, F = S10.floor, Y0 = S10.base, Y1 = S10.top, MID = S10.mid;
export const MA = Object.freeze({ FOV: 50, HANG: 2.6, PICK: 0.5, TAP: 14, MIDR: 80, FILL: 4.2 });
const SIDES = ['N', 'S', 'E', 'W'];
/** a side's middle on the frame (frame space: x east, z south from its centre) and its outward direction */
const SM = { N: [0, -14], S: [0, 14], E: [14, 0], W: [-14, 0] };

export const MALBEN_ACT = {
  icon: '🔲',
  title: 'המלבן במרכז',
  walkLine: () => '',
  stand(m) { const lv = (m && m.lv) | 0 || 1, s = S10.w2[['a', 'b', 'c'][lv - 1]]; return { x: s[0], z: s[1], face: MID.slice() }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, Mo = X.M, lv = m.lv | 0 || 1, V = createVoices(X.sfx), Mt = mats10(X);
    const root = new T.Group(); root.name = 'h133-malben-act'; X.props.root.add(root);
    const A = { t: 0, ev: [], ended: false, finished: false, busy: 0, f: null, drop: null, fill: null, lights: null };
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
    const b0 = Mo.workOf('malben');
    let S = b0 && b0.id === m.id ? load(b0) : null; if (S && (S.landed || S.lv !== lv)) S = null; const resumed = !!S;
    if (!S) S = fresh(lv);
    let n0 = -1; const keep = () => { if (S.n === n0) return; n0 = S.n; Mo.keep('malben', save(S, m.id)); X.save(); };
    const upperBefore = (Mo.st.done || []).some((id) => id.startsWith('malben')) || !!Mo.st.crews;
    if (!upperBefore) own('upper', true);
    // ── the marking lines: a thin rope and charcoal dots one amah in from each of the sovev's edges
    const lines = {};
    for (const k of SIDES) {
      const g = new T.Group(); root.add(g); lines[k] = g; const y = Y0 + 0.02;
      const [x0, z0, x1, z1] = k === 'N' ? [U[0], U[1], U[2], U[1]] : k === 'S' ? [U[0], U[3], U[2], U[3]] : k === 'E' ? [U[2], U[1], U[2], U[3]] : [U[0], U[1], U[0], U[3]];
      box(X, Mt.y10rope, Math.min(x0, x1) - 0.03, y, Math.min(z0, z1) - 0.03, Math.max(x0, x1) + 0.03, y + 0.05, Math.max(z0, z1) + 0.03, g);
      for (let u = 0.5; u < 28; u += 2) { const x = x0 === x1 ? x0 : x0 + u, z = z0 === z1 ? z0 : z0 + u; box(X, Mt.y10charcoal, x - 0.12, y, z - 0.12, x + 0.12, y + 0.03, z + 0.12, g); }
      const gl = box(X, Mt.y10green, Math.min(x0, x1) - 0.18, y + 0.06, Math.min(z0, z1) - 0.18, Math.max(x0, x1) + 0.18, y + 0.08, Math.max(z0, z1) + 0.18, g); gl.visible = false; g.userData.glow = gl;
    }
    // ── the frame: four beams of 28 (outer), a hand thick
    const frame = new T.Group(); root.add(frame);
    const BEAM = { N: [-14, -14, 14, -13.64], S: [-14, 13.64, 14, 14], E: [13.64, -14, 14, 14], W: [-14, -14, -13.64, 14] };
    for (const k of SIDES) { const q = BEAM[k]; box(X, Mt.y10wood, q[0], -0.25, q[1], q[2], 0.25, q[3], frame).name = 'h133-beam-' + k; }
    const ropes = {}; for (const k of SIDES) { ropes[k] = box(X, Mt.y10rope, -0.04, -0.04, 0, 0.04, 0.04, 1, root); }
    // the crews' short scaffolds (drawn by the world before the block stands; here again on a later visit)
    if (upperBefore) for (const k of SIDES) { const [x, z] = S10.crew[k], wide = k === 'N' || k === 'S', hx = wide ? 2 : 1, hz = wide ? 1 : 2, y0 = k === 'W' ? F + 0.5 : F; for (const [dx, dz] of [[-hx, -hz], [hx, -hz], [-hx, hz], [hx, hz]]) box(X, Mt.y10woodD, x + dx - 0.12, y0, z + dz - 0.12, x + dx + 0.12, y0 + 3, z + dz + 0.12, root); box(X, Mt.y10wood, x - hx, y0 + 2.8, z - hz, x + hx, y0 + 3, z + hz, root); }
    // the fill (the first time): a white body rising inside the frame; the four lines of light; the top's places in light
    const fillB = box(X, Mt.y10white, U[0], Y0, U[1], U[2], Y0 + 0.01, U[3], root); fillB.visible = false;
    // ── the crews: two men on each scaffold, the rope in hand
    const Bt = createBeat(X), gang = createGang(X), crew = {};
    function castMen() {
      gang.clear();
      for (const k of SIDES) {
        const [x, z] = S10.crew[k], wide = k === 'N' || k === 'S', y = (k === 'W' ? F + 0.5 : F) + 3; crew[k] = [];
        for (const o of [-0.7, 0.7]) { const w = gang.add(x + (wide ? o : 0), z + (wide ? 0 : o), { role: 'hold', item: 'rope', crew: SIDES.indexOf(k), fx: MID[0], fz: MID[1] }); if (w && w.a) w.a.fixedY = y; crew[k].push(w); }
      }
    }
    // ── the camera: from above, almost straight down
    const cam0 = X.camera, fov0 = cam0.fov;
    const home = (d = 0) => { lens(X, MA.FOV); X.shot(S10.cam.w2[0].slice(), S10.cam.w2[1].slice(), d); };
    const FY = () => Y0 + (A.drop ? MA.HANG * (1 - A.drop.u) : MA.HANG);
    const toW = (lx, lz) => { const a = (S.a * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); return [MID[0] + S.dx + lx * c + lz * s, MID[1] + S.dz - lx * s + lz * c]; };
    const sideScr = (k) => { const [x, z] = toW(...SM[k]); const r = X.scr(x, FY(), z); return { x: r.x, y: r.y }; };
    const midScr = () => { const r = X.scr(MID[0] + S.dx, FY(), MID[1] + S.dz); return { x: r.x, y: r.y }; };
    const kpx = () => (typeof innerHeight === 'number' && innerHeight > 0 ? 420 / innerHeight : 1);
    // ── the thumb: a drag from a crew outward pulls; along its side turns (level 3); a hold on the middle lowers
    const FG = fingers(X, {
      down(f) {
        if (A.finished || A.busy || S.landed || f.x > innerWidth * 0.6 && !nearMid(f)) return;
        const c = midScr(), dm = Math.hypot(f.x - c.x, f.y - c.y);
        let side = null, best = 1e9; for (const k of SIDES) { const p = sideScr(k), d = Math.hypot(f.x - p.x, f.y - p.y); if (d < best) { best = d; side = k; } }
        A.f = { id: f.id, x0: f.x, y0: f.y, t0: A.t, mid: dm < MA.MIDR * (innerHeight / 420) && dm < best, side };
        X.hand(null); ev('down:' + (A.f.mid ? 'mid' : side));
      },
      move() {},
      up(f) {
        const P = A.f; A.f = null; if (!P || P.id !== f.id || S.landed) return;
        const dx = (f.x - P.x0) * kpx(), dy = (f.y - P.y0) * kpx(), L = Math.hypot(dx, dy); if (L < MA.TAP) return;
        const c = midScr(), p = sideScr(P.side), ox = p.x - c.x, oy = p.y - c.y, OL = Math.hypot(ox, oy) || 1, ux = ox / OL, uy = oy / OL;
        const along = dx * ux + dy * uy, across = -dx * uy + dy * ux;
        if (Math.abs(along) >= Math.abs(across)) {
          if (along > 0 && can(S, P.side)) { pull(S, P.side, along); tug(P.side); ev('pull:' + P.side + ':' + Math.round(along)); }
          else if (!can(S, P.side)) { X.line('ברמה הזאת הצוותים של צפון ודרום נעולים', 1400); }
        } else if (lv >= 3) { turn(S, -Math.sign(across) * (P.side === 'N' || P.side === 'E' ? 1 : -1), Math.abs(across)); tug(P.side); ev('turn:' + P.side); }
        keep();
      },
    });
    const nearMid = (f) => { const c = midScr(); return Math.hypot(f.x - c.x, f.y - c.y) < MA.MIDR; };
    function tug(k) { V.rope && V.rope(true); for (const w of crew[k] || []) if (w) { gang.setRole(w, 'pull'); setTimeout(() => { try { gang.setRole(w, 'hold'); } catch (e) { /* */ } }, 900); } }
    // ── each frame
    function draw(dt) {
      const y = FY();
      frame.position.set(MID[0] + S.dx, y, MID[1] + S.dz); frame.rotation.y = (S.a * Math.PI) / 180;
      for (const k of SIDES) {
        const [x, z] = toW(...SM[k]), w = crew[k] && crew[k][0], a = [x, y, z], b = w && w.a ? [w.a.x, (w.a.fixedY || F) + 1.3, w.a.z] : [...S10.crew[k].slice(0, 1), (F + 4), S10.crew[k][1]];
        const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); const r = ropes[k]; r.visible = !A.fill; r.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); r.scale.set(1, 1, L); r.lookAt(b[0], b[1], b[2]);
      }
      const G = green(S); for (const k of SIDES) lines[k].userData.glow.visible = !!G[k] && !S.landed;
      V.creak(Math.min(1, Math.hypot(S.vx, S.vz) * 0.8 + Math.abs(S.va) * 0.2));
      // the hold on the middle: half a second lowers it
      const P = A.f; if (P && P.mid && !S.landed && A.t - P.t0 >= MK.HOLD) { const fl = FG.L.get(P.id); const mv = fl ? Math.hypot(fl.x - P.x0, fl.y - P.y0) : 0; if (mv < MA.TAP * 1.5) { A.f = null; lower(); } }
      if (A.drop) { A.drop.u = Math.min(1, A.drop.u + dt / 0.7); if (A.drop.u >= 1 && !A.drop.done) { A.drop.done = 1; A.drop.res(); } }
      if (A.fill) { const Fl = A.fill; Fl.t += dt; const u = Math.min(1, Fl.t / MA.FILL); fillB.visible = true; fillB.scale.y = Math.max(0.01, 3 * u); fillB.position.y = Y0 + 1.5 * u; if (Fl.t > 0.5 && Fl.t % 0.5 < dt) X.dust(MID[0] + Math.sin(Fl.t * 3) * 8, Y0 + 3 * u, MID[1] + Math.cos(Fl.t * 2) * 8, 5, 3); if (u >= 1 && !Fl.done) { Fl.done = 1; Fl.res(); } }
      if (A.lights) { const Lg = A.lights; Lg.t += dt; const u = Math.min(1, Lg.t / 1.0); Lg.g.children.forEach((c) => { c.scale.x = Math.max(0.001, u); }); if (Lg.t > 1.4) Lg.g.children.forEach((c) => { c.material.opacity = Math.max(0, 0.95 - (Lg.t - 1.4)); }); if (Lg.t > 2.4 && !Lg.done) { Lg.done = 1; root.remove(Lg.g); Lg.res(); } }
    }
    async function lower() {
      if (S.landed || A.busy) return; A.busy = 1; X.hand(null); ev('lower');
      V.creak(0.6);
      await new Promise((res) => { A.drop = { u: 0, res }; });
      if (A.ended) return;
      const L = land(S); keep(); V.thud(); X.shake(0.15, 0.25);
      const at = V3(X, MID[0], Y0 + 1, MID[1]);
      if (L.crack) { const corner = crackCorner(S, L.crack); const [cx, cz] = [corner.includes('E') ? B9[2] : B9[0], corner.includes('S') ? B9[3] : B9[1]]; V.crack(); X.dust(cx, Y0, cz, 14, 3); hurt(X, Mo, 'malben.crack', V3(X, cx, Y0 + 0.5, cz), { corner, lv }); }
      else award(X, at, L.grade, lv, 'מנצחים');
      if (L.grade === 'gold') { try { X.quick(at, WORDS.quick); } catch (er) { /* */ } }
      if (L.bonus) extra(X, 20, lv, 'angle', 'הזווית תוקנה');
      // the first time: the fill, quickly; the frame apart to the heap
      if (!upperBefore) {
        X.line('מילוי: חלוקי אבנים, ואחריהם סיד, זפת וקוניא מותכים', 2600);
        for (const k of SIDES) for (const w of crew[k] || []) if (w) gang.setRole(w, 'pour');
        await new Promise((res) => { A.fill = { t: 0, res }; });
        if (A.ended) return;
      }
      frame.visible = false; for (const k of SIDES) ropes[k].visible = false; X.dust(MID[0], Y1, MID[1], 16, 10);
      // four lines of light that meet at the corners; then up: the top's places in light for a moment
      if (L.grade === 'gold' || L.grade === 'good') { await lightsMeet(); if (A.ended) return; }
      if (!upperBefore) { X.shot([MID[0] + 20, Y1 + 34, MID[1] + 24], [MID[0], Y1, MID[1]], 1.2); await topPlaces(); if (A.ended) return; }
      Mo.keep('malben', null);
      await finish(X, A, result(S), WORDS.malben, V3(X, MID[0], Y1 + 1, MID[1]), { eye: [MID[0] + 24, Y1 + 30, MID[1] + 30], aim: [MID[0], Y1, MID[1]], secs: 1.4, kohen: false, own: () => (gang.list || []).map((w) => w.a), after: () => { try { Mo.filmOver(); } catch (er) { /* */ } try { gang.clear(); } catch (er) { /* */ } } });
    }
    function strip(g, x0, z0, x1, z1, y, mat) { const L = Math.hypot(x1 - x0, z1 - z0), geo = new T.BoxGeometry(L, 0.08, 0.3); geo.translate(L / 2, 0, 0); const m = new T.Mesh(geo, mat); m.position.set(x0, y, z0); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0); m.scale.x = 0.001; g.add(m); return m; }
    function lightsMeet() {
      return new Promise((res) => {
        const g = new T.Group(); root.add(g); const y = Y0 + 0.08, M = Mt.y10glow.clone();
        // from the middle of each side to its two corners
        for (const [x0, z0, x1, z1] of [[MID[0], U[1], U[0], U[1]], [MID[0], U[1], U[2], U[1]], [MID[0], U[3], U[0], U[3]], [MID[0], U[3], U[2], U[3]], [U[0], MID[1], U[0], U[1]], [U[0], MID[1], U[0], U[3]], [U[2], MID[1], U[2], U[1]], [U[2], MID[1], U[2], U[3]]]) strip(g, x0, z0, x1, z1, y, M);
        V.harp(294); A.lights = { t: 0, g, res };
      });
    }
    function topPlaces() {
      return new Promise((res) => {
        const g = new T.Group(); root.add(g); const y = Y1 + 0.03, M = Mt.y10glow.clone(), Fi = S10.fire;
        for (const [x0, z0, x1, z1] of [[Fi[0], Fi[1], Fi[2], Fi[1]], [Fi[2], Fi[1], Fi[2], Fi[3]], [Fi[2], Fi[3], Fi[0], Fi[3]], [Fi[0], Fi[3], Fi[0], Fi[1]]]) strip(g, x0, z0, x1, z1, y, M);
        for (const [cx, cz] of [[U[0] + 0.5, U[1] + 0.5], [U[2] - 0.5, U[1] + 0.5], [U[0] + 0.5, U[3] - 0.5], [U[2] - 0.5, U[3] - 0.5]]) { const c = box(X, M, cx - 0.5, y, cz - 0.5, cx + 0.5, y + 0.05, cz + 0.5, g); c.scale.x = 0.001; }
        X.line('ראש המזבח: מקום הקרנות, הילוך רגלי הכהנים, ומקום המערכה 24 על 24', 2600);
        V.harp(392); A.lights = { t: 0, g, res };
      });
    }
    function hint() {
      if (resumed || A.hintOn) return; A.hintOn = 1;
      const k = S.dx > 0 ? 'W' : 'E', p = sideScr(k), c = midScr(), dx = p.x - c.x, dy = p.y - c.y, L = Math.hypot(dx, dy) || 1;
      const [x, z] = toW(...SM[k]); X.hand({ x, y: FY(), z }, Math.round((dx / L) * 70), Math.round((dy / L) * 70));
    }
    return {
      close: true,
      begin() {
        try { X.kohen(false); } catch (e) { /* (the kohen is out: the player conducts the four crews) */ }
        castMen(); FG.attach(); home(0.01); X.line('', 0);
        X.wait(0.9).then(hint);
        ev(resumed ? 'resume' : 'begin'); keep();
      },
      update(dt) {
        A.t += dt;
        try {
          V.frame(); Bt.step(dt); gang.update(dt, Bt);
          if (!S.landed) for (const e of step(S, dt)) { ev(e.k); if (e.k === 'take') V.creak(0.5); if (e.k === 'bump') { V.bump(); X.line('הצוות שמול עוצר את המלבן לפני השפה', 1200); } }
          draw(dt);
          if (A.t % 1 < dt) keep();
        } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h133] malben', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
      },
      down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { A.f = null; keep(); },
      wants(p) { if (!p) return true; if (p.x < innerWidth * 0.6) return true; const c = midScr(); return Math.hypot(p.x - c.x, p.y - c.y) < MA.MIDR; },
      holds() { return !!A.f; },
      lensFov: MA.FOV,
      end() { A.ended = true; FG.detach(); V.stop(); X.hand(null); lens(X, fov0); try { gang.clear(); } catch (e) { /* */ } X.props.remove(root); own('upper', false); },
      at() { return V3(X, MID[0] + S.dx, FY(), MID[1] + S.dz); },
      dbg() {
        const r2 = (v) => +(+v).toFixed(3), mg = margins(S);
        const sides = {}; for (const k of SIDES) { const p = sideScr(k); sides[k] = [Math.round(p.x), Math.round(p.y)]; }
        const c = midScr();
        return { id: m.id, lv, t: +A.t.toFixed(2), ev: A.ev.slice(-10), dx: r2(S.dx), dz: r2(S.dz), a: r2(S.a), moving: moving(S), m: { N: r2(mg.N), S: r2(mg.S), E: r2(mg.E), W: r2(mg.W) }, green: green(S), landed: S.landed, pulls: S.pulls, sides, mid: [Math.round(c.x), Math.round(c.y)], busy: A.busy, finished: A.finished };
      },
    };
  },
};
