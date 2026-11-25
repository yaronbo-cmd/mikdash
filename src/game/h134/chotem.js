/* ── build 134 ── h134/chotem.js — work 3 "שני החוטמים" (spec docs/specs/shlav-11-he.md, עבודה 3; the rules: chotem-model.js). At the
 * goldsmith's bench in the south of the women's court (המחשה: no source for where the Temple's smith worked). The kohen in the picture,
 * by the smith (rule 62); the smith holds the stand. Two silver cups on the test stand side by side: water at the left (the western),
 * wine at the right (the eastern), each with its sealed spout; over the chosen one the bow drill with its copper bit.
 *   · a tap on a cup moves the drill to it;
 *   · ONE thumb on the drill's head pushes down along its axis (the push is the pressure: the whistle changes with it), the OTHER drags the
 *     bow's string to and fro (a stroke: 15 % of the screen's width one way) — both together;
 *   · a pull down on the wooden handle: the test — the crew fills both cups level, the two streams fall into the stone basin; the one
 *     that ends first leaves the other dripping, its level showing how late (no numbers, no text);
 *   · level 1: the gold ring of the right bore round the drill, beside the ring of the bore so far.
 * Mouse: the left button on the bow, the space bar held is the pressure (1, 2, 3 by how long). Never iron by the altar: the drill works
 * only here; the cups go up finished.
 *   CHOTEM_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { WORDS } from './model.js';
import { fresh, load, save, press, stroke, replace, test, result, right, empty, betterPair, DK, WINE, SIDES } from './chotem-model.js';
import { mats11, cupMesh } from './look.js';
import { own, SH11 } from './world.js';
import { award, extra, hurt, finish, V3, lens, voices, px360, MIN_GRIP } from './kit11.js';
import { box } from '../h131/world.js';
import { fingers } from '../h113/acts.js';
import { createGang, createBeat } from '../h109/kit.js';

const S11 = BOOK.s11, TZ = S11.tz, NY = TZ.y, TOP = NY + 1.2;
export const DA = Object.freeze({ FOV: 13, CUP_R: 0.12, GAP: 0.36, RING: 0.11, ANIM: 4.5, HANDLE: [0.62, 0.1], PULL: 0.08, SPACE: [0.25, 0.6] });
const CX = { water: TZ.stand[0] - DA.GAP / 2, wine: TZ.stand[0] + DA.GAP / 2 };

function make(m, X) {
  const T = X.THREE, Mo = X.M, lv = m.lv | 0 || 1, V = voices(X), Mt = mats11(X);
  const root = new T.Group(); root.name = 'h134-chotem-act'; X.props.root.add(root);
  const A = { t: 0, ev: [], ended: false, finished: false, busy: 0, pr: null, bow: null, hd: null, test: null, sp: null, tear: {} };
  const ev = (e) => { A.ev.push(e); if (A.ev.length > 20) A.ev.shift(); };
  const b0 = Mo.workOf(m.k);
  let S = b0 && b0.id === m.id ? load(b0) : null; if (S && S.lv !== lv) S = null; const resumed = !!S;
  if (!S) S = fresh(lv);
  let k0 = ''; const keep = () => { const b = save(S, m.id), k = JSON.stringify(b); if (k === k0) return; k0 = k; Mo.keep(m.k, b); X.save(); };
  own('cupsWork', true);
  // ── the two cups, their spouts, the liquid levels, the streams
  const cups = {}, lvlM = {}, streams = {};
  function castCup(side) {
    if (cups[side]) root.remove(cups[side]);
    const g = cupMesh(X, DA.CUP_R); g.position.set(CX[side], TOP, TZ.stand[1]); g.name = 'h134-cup-' + side; root.add(g); cups[side] = g;
    const lq = new T.Mesh(new T.CylinderGeometry(DA.CUP_R * 0.95, DA.CUP_R * 0.7, 1, 16), side === 'water' ? Mt.y11water : Mt.y11wine); lq.visible = false; g.add(lq); lvlM[side] = lq;
    const st = new T.Mesh(new T.CylinderGeometry(1, 1, 1, 8), side === 'water' ? Mt.y11water : Mt.y11wine); st.visible = false; root.add(st); streams[side] = st;
    const ring = new T.Mesh(new T.TorusGeometry(1, 0.08, 6, 24), Mt.y11hollow); ring.rotation.x = Math.PI / 2; ring.position.y = DA.CUP_R * 1.72; ring.visible = false; g.add(ring); g.userData.hole = ring;
  }
  for (const s of SIDES) castCup(s);
  // ── the bow drill: a spindle with its copper bit, the head (a stone cap), the bow and its string
  const drill = new T.Group(); root.add(drill);
  const spindle = new T.Mesh(new T.CylinderGeometry(0.012, 0.012, 0.42, 8), Mt.y11wood); spindle.position.y = 0.21; drill.add(spindle);
  const bit = new T.Mesh(new T.ConeGeometry(0.016, 0.05, 8), Mt.y11copper); bit.rotation.x = Math.PI; bit.position.y = -0.02; drill.add(bit);
  const head = new T.Mesh(new T.CylinderGeometry(0.045, 0.05, 0.05, 12), Mt.y11white); head.position.y = 0.44; drill.add(head);
  const bow = new T.Group(); drill.add(bow); bow.position.y = 0.24;
  const bowArc = new T.Mesh(new T.TorusGeometry(0.22, 0.01, 6, 20, Math.PI * 0.7), Mt.y11woodD); bowArc.rotation.z = Math.PI * 0.15; bowArc.position.set(0, -0.12, 0.04); bow.add(bowArc);
  const string = box(X, Mt.y11rope, -0.2, -0.003, 0.035, 0.2, 0.003, 0.041, bow);
  // level 1: the gold ring of the right bore round the drill's foot, and the bore's own ring
  const rightRing = new T.Mesh(new T.TorusGeometry(1, 0.06, 6, 28), Mt.y11glow); rightRing.rotation.x = Math.PI / 2; rightRing.visible = lv === 1; root.add(rightRing);
  // ── the test handle (wood), the basin under the stand (the world's), the smith and the kohen, two pourers
  const handle = new T.Group(); root.add(handle); handle.position.set(TZ.stand[0] + DA.HANDLE[0], TOP - 0.25, TZ.stand[1] + DA.HANDLE[1]);
  box(X, Mt.y11woodD, -0.025, -0.25, -0.025, 0.025, 0.25, 0.025, handle); const knob = new T.Mesh(new T.SphereGeometry(0.05, 10, 8), Mt.y11wood); knob.position.y = 0.27; handle.add(knob);
  const Bt = createBeat(X), gang = createGang(X), crew = [];
  function castMen() {
    gang.clear(); crew.length = 0;
    const sm = gang.add(TZ.stand[0] + 0.95, TZ.stand[1] - 0.35, { role: 'hold', crew: 2, fx: TZ.stand[0], fz: TZ.stand[1] }); if (sm && sm.a) sm.a.fixedY = NY; crew.push(sm);
    for (const dx of [-0.45, 0.45]) { const w = gang.add(TZ.stand[0] + dx, TZ.stand[1] - 0.8, { role: 'hold', item: 'jar', crew: 3, fx: TZ.stand[0], fz: TZ.stand[1] }); if (w && w.a) w.a.fixedY = NY; crew.push(w); }
  }
  // ── the camera: the bench from the south, the cups big (each about a quarter of the screen's width)
  const cam0 = X.camera, fov0 = cam0.fov;
  const home = (d = 0) => { lens(X, DA.FOV); X.shot(S11.cam.tz[0].slice(), [TZ.stand[0], TOP + 0.12, TZ.stand[1]], d); };
  const scrOf = (v) => { const r = X.scr(v.x, v.y, v.z); return { x: r.x, y: r.y }; };
  const g2 = () => Math.max(MIN_GRIP * px360(), 26);
  const headScr = () => scrOf(head.getWorldPosition(new T.Vector3()));
  const bowScr = () => scrOf(new T.Vector3(drill.position.x, drill.position.y + 0.24, drill.position.z + 0.04));
  const cupScr = (s) => scrOf(new T.Vector3(CX[s], TOP + DA.CUP_R, TZ.stand[1]));
  const knobScr = () => scrOf(knob.getWorldPosition(new T.Vector3()));
  const onHead = (f) => { const p = headScr(); return Math.hypot(f.x - p.x, f.y - p.y) < g2() * 1.2; };
  const onBow = (f) => { const p = bowScr(), w = Math.abs(scrOf(new T.Vector3(drill.position.x + 0.2, 0, 0).setY(drill.position.y + 0.24).setZ(drill.position.z)).x - p.x); return Math.abs(f.y - p.y) < g2() && Math.abs(f.x - p.x) < w + g2(); };
  const onCup = (f) => SIDES.find((s) => { const p = cupScr(s); return Math.hypot(f.x - p.x, f.y - p.y) < Math.max(g2() * 1.6, 50 * px360()); }) || null;
  const onKnob = (f) => { const p = knobScr(); return Math.hypot(f.x - p.x, f.y - p.y) < g2() * 1.4; };
  // ── the fingers: each on the thing it lands on (spec: the head is the pressure, the string the bow, whatever the order)
  const FG = fingers(X, {
    down(f) {
      if (A.finished || A.busy) return;
      if (onHead(f) && !A.pr) { A.pr = { id: f.id, y0: f.y, k: 0 }; X.hand(null); ev('press'); return; }
      if (onBow(f) && !A.bow) { A.bow = { id: f.id, x: f.x, run: 0, dir: 0, lastX: f.x, t0: A.t }; X.hand(null); ev('bow'); return; }
      if (onKnob(f) && !A.hd) { A.hd = { id: f.id, y0: f.y }; return; }
      const s = onCup(f); if (s) { A.tapCup = { id: f.id, s, x0: f.x, y0: f.y }; }
    },
    move(f) {
      if (A.pr && f.id === A.pr.id) { A.pr.k = Math.max(0, (f.y - A.pr.y0) / Math.max(1, innerHeight)); return; }
      if (A.bow && f.id === A.bow.id) {
        const dx = f.x - A.bow.lastX; A.bow.lastX = f.x; if (!dx) return; const dir = Math.sign(dx);
        if (dir !== A.bow.dir) { A.bow.dir = dir; A.bow.run = 0; A.bow.counted = false; }
        A.bow.run += Math.abs(dx);
        if (!A.bow.counted && A.bow.run >= DK.STROKE * Math.max(1, innerWidth)) { A.bow.counted = true; strokeNow(); }
        return;
      }
      if (A.hd && f.id === A.hd.id) { const k = (f.y - A.hd.y0) / Math.max(1, innerHeight); handle.rotation.x = -Math.min(0.6, Math.max(0, k) * 6); if (k >= DA.PULL && !A.hd.done) { A.hd.done = true; runTest(); } }
    },
    up(f) {
      if (A.pr && f.id === A.pr.id) { A.pr = null; return; }
      if (A.bow && f.id === A.bow.id) { A.bow = null; return; }
      if (A.hd && f.id === A.hd.id) { A.hd = null; handle.rotation.x = 0; return; }
      if (A.tapCup && f.id === A.tapCup.id) { const q = A.tapCup; A.tapCup = null; if (Math.hypot(f.x - q.x0, f.y - q.y0) < 14) { S.sel = q.s; V.knock(2.2); ev('sel:' + q.s); keep(); } }
    },
  });
  // (the mouse: the left button on the bow; the space bar held is the pressure)
  const onKey = (e) => { if (e.code !== 'Space') return; try { e.preventDefault(); } catch (er) { /* */ } if (e.type === 'keydown') { if (!A.sp) A.sp = { t0: A.t }; } else A.sp = null; };
  const pressure = () => { if (A.pr) return press(A.pr.k); if (A.sp) { const h = A.t - A.sp.t0; return h > DA.SPACE[1] ? 3 : h > DA.SPACE[0] ? 2 : 1; } return 0; };
  function strokeNow() {
    const side = S.sel, C = S.c[side]; if (C.torn || C.wide) return;
    const pr = pressure(), r = stroke(S, side, pr); if (!r) return;
    ev(r.k + ':' + side + ':' + pr);
    const at = V3(X, CX[side], TOP + 0.05, TZ.stand[1]);
    if (r.k === 'skid') { V.scrape(0.5); setTimeout(() => V.scrape(0), 200); hurt(X, Mo, 'chotem.scratch', at, { lv, side }); }
    else if (r.k === 'tear') { V.crack(); hurt(X, Mo, 'chotem.tear', at, { lv, side }); A.tear[side] = 1.2; }
    else if (r.k === 'through') { V.harp(440); try { X.sparks(at.x, at.y, at.z, 6); } catch (e) { /* */ } }
    else { V.rope(true); }
    keep();
  }
  async function runTest() {
    if (A.busy || A.tear.water > 0 || A.tear.wine > 0) return;
    A.busy = 1; ev('test');
    for (const w of crew.slice(1)) if (w) gang.setRole(w, 'pour');
    const R = test(S);
    // the fill (both level), then the two streams together
    const k = Math.min(1, DA.ANIM / Math.max(1, ...[R.tw, R.tv].filter(Number.isFinite)));
    A.test = { t: 0, R, k, fill: 0.5, done: { water: false, wine: false } };
    await X.wait(0.5); if (A.ended) return;
    for (const w of crew.slice(1)) if (w) gang.setRole(w, 'hold');
    const longest = Math.max(...[R.tw, R.tv].filter(Number.isFinite).map((v) => v * k), 0.5);
    await X.wait(longest + 0.9); if (A.ended) return;
    // the account: a test after a change, once; the first test that passes +40
    const at = V3(X, TZ.stand[0], TOP + 0.4, TZ.stand[1]);
    if (R.counted) award(X, at, R.grade, lv, 'צורפים');
    if (R.first) extra(X, 40, lv, 'first', 'בדיקה ראשונה');
    for (const s of R.wide) { hurt(X, Mo, 'chotem.wide', V3(X, CX[s], TOP, TZ.stand[1]), { lv, side: s }); A.tear[s] = 1.2; }
    A.test = null; keep();
    if (R.pass) { await done(); return; }
    A.busy = 0;
  }
  async function done() {
    A.busy = 2; V.together(); try { if (X.haptic) X.haptic([60, 60, 60]); } catch (e) { /* */ }
    const res = result(S), at = V3(X, TZ.stand[0], TOP + 0.3, TZ.stand[1]);
    // (the pair to the altar — or, after round 1, only a better pair; the other to the smith's spare shelf)
    const C = Mo.st.cups, last = S.tests[S.tests.length - 1];
    if (!C.on || C.on.crews || betterPair(last, C.on.test)) { if (C.on) C.spare = (C.spare | 0) + 1; C.on = { lv, test: { tw: last.tw, tv: last.tv, gap: last.gap } }; ev('toAltar'); }
    else { C.spare = (C.spare | 0) + 1; ev('toSpare'); }
    C.tests = (C.tests | 0) + S.tests.length; X.save();
    Mo.keep(m.k, null);
    await finish(X, A, res, WORDS.chotem, at, { eye: [TZ.stand[0] + 3.5, NY + 3.4, TZ.stand[1] + 5], aim: [TZ.stand[0], TOP, TZ.stand[1]], secs: 1.4, kohen: true, own: () => (gang.list || []).map((w) => w.a), after: () => { try { Mo.filmOver(); } catch (er) { /* */ } try { gang.clear(); } catch (er) { /* */ } } });
  }
  function draw(dt) {
    const side = S.sel, x = CX[side]; drill.position.x += (x - drill.position.x) * Math.min(1, dt * 8); drill.position.z = TZ.stand[1];
    const pr = pressure(), C = S.c[side];
    drill.position.y = TOP + DA.CUP_R * 0.32 + 0.02 - [0, 0.004, 0.009, 0.016][pr];
    if (A.bow) { spindle.rotation.y += dt * 30; bow.position.x = Math.sin(A.t * 9) * 0.04; }
    V.whistle(A.bow ? 0.25 + pr * 0.25 : 0);
    for (const s of SIDES) {
      const Cs = S.c[s], g = cups[s]; if (!g) continue;
      const hr = g.userData.hole; hr.visible = Cs.open; if (Cs.open) { const r = Math.max(0.01, DA.RING * Cs.d * 0.5); hr.scale.set(r, r, r); }
      g.position.y = TOP; g.rotation.z = Cs.torn ? 0.15 : 0;
      if (A.tear[s] > 0) { A.tear[s] -= dt; if (A.tear[s] <= 0) { A.tear[s] = 0; replace(S, s); Mo.st.cups.shelf = (Mo.st.cups.shelf | 0) + 1; SH11.key = ''; castCup(s); X.save(); keep(); ev('new:' + s); } }
    }
    rightRing.visible = lv === 1 && !A.test; rightRing.position.set(drill.position.x, TOP + DA.CUP_R * 1.74, TZ.stand[1]); { const r = DA.RING * right(S, side) * 0.5; rightRing.scale.set(r, r, r); }
    // the test: the levels fall together; a stream under each open spout, the drops of the late one
    if (A.test) {
      const Q = A.test; Q.t += dt;
      for (const s of SIDES) {
        const lq = lvlM[s], st = streams[s], tt = s === 'water' ? Q.R.tw : Q.R.tv, dur = Number.isFinite(tt) ? tt * Q.k : Infinity;
        const fill = Math.min(1, Q.t / 0.5), drain = Q.t > 0.5 ? Math.min(1, (Q.t - 0.5) / dur) : 0, lev = fill * (1 - drain);
        lq.visible = lev > 0.01; lq.scale.y = Math.max(0.01, DA.CUP_R * 1.3 * lev); lq.position.y = DA.CUP_R * 0.3 + lq.scale.y / 2;
        const on = Q.t > 0.5 && drain < 1 && Number.isFinite(dur);
        const Cs = S.c[s], wide = Q.R.wide.includes(s);
        st.visible = on; if (on) { const r = 0.004 + 0.006 * (Cs.d || 0); st.scale.set(r, 0.5, r); st.position.set(CX[s] + (wide ? Math.sin(Q.t * 20) * 0.03 : 0), TOP - 0.25, TZ.stand[1]); st.rotation.z = wide ? Math.sin(Q.t * 13) * 0.4 : 0; }
        if (drain >= 1 && !Q.done[s]) { Q.done[s] = true; V.drip(); }
        if (on && A.t % 0.3 < dt && Q.done[s === 'water' ? 'wine' : 'water']) V.drip();
      }
      if (Q.done.water && Q.done.wine && !Q.both) { Q.both = true; if (Q.R.pass) V.together(); else V.apart(); }
    } else for (const s of SIDES) { if (lvlM[s]) lvlM[s].visible = false; if (streams[s]) streams[s].visible = false; }
  }
  function hint() { if (resumed || A.hintOn) return; A.hintOn = 1; const p = head.getWorldPosition(new T.Vector3()); X.hand({ x: p.x, y: p.y, z: p.z }, 0, 40); }
  return {
    close: true, kohenWorks: true,
    begin() {
      castMen(); FG.attach(); home(0.01); X.line('', 0);
      drill.position.set(CX[S.sel], TOP + 0.06, TZ.stand[1]);
      try { addEventListener('keydown', onKey); addEventListener('keyup', onKey); } catch (e) { /* */ }
      try { X.stages.hero.place({ x: TZ.kohen[0], z: TZ.kohen[1], face: TZ.stand.slice() }); } catch (e) { /* (the kohen by the smith, in the picture) */ }
      X.wait(0.9).then(() => { if (!A.ended) hint(); });
      ev(resumed ? 'resume' : 'begin'); keep();
    },
    update(dt) {
      A.t += dt;
      try { V.frame(); Bt.step(dt); gang.update(dt, Bt); draw(dt); if (A.t % 1 < dt) keep(); }
      catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h134] chotem', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
    },
    down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
    cancel() { A.pr = null; A.bow = null; A.hd = null; keep(); },
    wants(p) { if (!p) return true; if (A.pr || A.bow) return true; return onHead(p) || onBow(p) || onKnob(p) || !!onCup(p); },
    holds() { return !!(A.pr || A.bow || A.hd); },
    lensFov: DA.FOV,
    end() { A.ended = true; FG.detach(); V.hush(); X.hand(null); lens(X, fov0); try { removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); } catch (e) { /* */ } try { gang.clear(); } catch (e) { /* */ } X.props.remove(root); own('cupsWork', false); },
    at() { return V3(X, TZ.stand[0], TOP, TZ.stand[1]); },
    dbg() {
      const r2 = (v) => (Number.isFinite(v) ? +v.toFixed(3) : null), hs = headScr(), bs = bowScr(), ks = knobScr();
      return { id: m.id, lv, sel: S.sel, c: { water: { ...S.c.water, d: r2(S.c.water.d) }, wine: { ...S.c.wine, d: r2(S.c.wine.d) } }, wine: WINE[lv], tests: S.tests.map((t) => ({ tw: r2(t.tw), tv: r2(t.tv), pass: t.pass, grade: t.grade })), rejects: S.rejects.length,
        head: [Math.round(hs.x), Math.round(hs.y)], bow: [Math.round(bs.x), Math.round(bs.y)], knob: [Math.round(ks.x), Math.round(ks.y)], cups: SIDES.map((s) => { const p = cupScr(s); return [Math.round(p.x), Math.round(p.y)]; }),
        times: { water: r2(empty(S, 'water')), wine: r2(empty(S, 'wine')) }, pr: pressure(), busy: A.busy, finished: A.finished, ev: A.ev.slice(-10) };
    },
  };
}
export const CHOTEM_ACT = { icon: '🏺', title: 'שני החוטמים', walkLine: () => '', stand() { return { x: TZ.kohen[0], z: TZ.kohen[1], face: TZ.stand.slice() }; }, prepare() {}, make };
