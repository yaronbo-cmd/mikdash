/* ── build 133 ── h133/kevesh.js — work 3 "הכבש" (spec docs/specs/shlav-10-he.md, עבודה 3). The rules: kevesh-model.js.
 * South of the altar the kevesh's rough body stands in its scaffold. Its face is six stone slabs, 16 wide and 5 long, from the foot
 * (z 42.5) to the ground's line of its head (z 12.5). Each slab starts by the foot on wooden rollers; the left thumb drags up the way
 * (the crew above pulls on the rope, the kohen at the head of the laid part leads), lets go (it goes on, slows on the slope, stops, and
 * 0.6 s later slides back), holds (a wooden brake bar under it, from nothing to full in half a second). The moment the thumb leaves
 * the brake the crew pulls the rollers and it comes down where it is: still — no lip; slow — a tiny lip the crew rubs off; moving — a
 * lip stays (a shadow line across). Its stop line is a stretched rope and charcoal dots. Slab 3 has the rabuva's window on its west
 * side: stopped before the body's opening it stays open. A slab slid to the foot cracks (the crew brings another; never stuck).
 * Level 1 seats 1–3 and the crew seats 4–6 quickly; levels 2 and 3 all six (side drags straighten 2, 4, 6); level 3 the lime bed
 * darkens in 12 s (a bonus before). At the end a round stone runs from the top to the ground: smooth on a good joint, a hop on a lip.
 * The right thumb is the camera (the director's look). No iron: wood, rope, stone, lime.
 *   KEVESH_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { WORDS, LOSS, SLABS_OF } from './model.js';
import { fresh, load, save, step, slabNow, done, result, errOf, KM, wayOf } from './kevesh-model.js';
import { mats10, own, wedge, slabMesh, rampBody, rampScaffold } from './world.js';
import { award, extra, hurt, finish, thumb, V3, lens } from './kit10.js';
import { box } from '../h131/world.js';
import { createVoices } from '../h129/sound129.js';
import { fingers } from '../h113/acts.js';
import { createGang, createBeat } from '../h109/kit.js';

const S10 = BOOK.s10, R = S10.ramp, F = S10.floor, SL = 9 / 32;
export const KA = Object.freeze({ FOV: 50, TOP: 43.5, ROLL: 3.2, CREW: 5 });
/** a slab's upper edge (z) at its way s (from its start one amah south of the foot) */
const zOf = (s) => KA.TOP - s;
const yOn = (z) => S10.rampY(Math.min(R.foot, z));

export const KEVESH_ACT = {
  icon: '⛰',
  title: 'הכבש',
  walkLine: () => '',
  stand(m) { const lv = (m && m.lv) | 0 || 1, s = S10[`w3`][['a', 'b', 'c'][lv - 1]]; return { x: s[0], z: s[1], face: [(R.x0 + R.x1) / 2, 28] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, Mo = X.M, lv = m.lv | 0 || 1, V = createVoices(X.sfx), Mt = mats10(X);
    const root = new T.Group(); root.name = 'h133-kevesh-act'; X.props.root.add(root);
    const A = { t: 0, ev: [], ended: false, finished: false, busy: 0, roll: null, crewSeat: null, flash: 0, said: {} };
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
    const b0 = Mo.workOf('kevesh');
    let S = b0 && b0.id === m.id ? load(b0) : null; if (S && (done(S) || S.lv !== lv)) S = null; const resumed = !!S;
    if (!S) S = fresh(lv);
    let n0 = -1; const keep = () => { const b = save(S, m.id), k0 = JSON.stringify(b); if (k0 === n0) return; n0 = k0; Mo.keep('kevesh', b); X.save(); };   // (review fix 3/4: any change of the work is kept, not only a new count)
    const builtBefore = (Mo.st.done || []).some((id) => id.startsWith('kevesh')) || !!Mo.st.crews;
    const mine = SLABS_OF[lv];
    // ── the things: the body (and its scaffold, the first time), the slabs that stand, the one on its rollers
    own('ramp', true);
    rampBody(X, Mt, root);
    if (!builtBefore) rampScaffold(X, Mt, root);
    const seatedM = {};
    function drawSeated(i, lip) {
      if (seatedM[i]) { root.remove(seatedM[i]); }
      const s = S10.slabs[i - 1], g = new T.Group(); root.add(g); seatedM[i] = g;
      slabMesh(X, Mt.y10white, R.x0, R.x1, s.z0, s.z1, 0.5, lip ? 0.09 : 0, g);
      if (lip) box(X, Mt.y10shade, R.x0, yOn(s.z1) - 0.04, s.z1 - 0.05, R.x1, yOn(s.z1) + 0.1, s.z1 + 0.18, g);
      if (i === 3 && seatedM.cov) { /* */ }
    }
    // the slabs not this level's (level 1 replayed: 4–6 stand) — and their dark lines
    if (builtBefore) for (let i = 1; i <= 6; i++) if (!mine.includes(i)) { drawSeated(i, Mo.flaws('kevesh.lip').some((x) => (x.slab | 0) === i)); if (Mo.flaws('nail.bad').some((x) => (x.slab | 0) === i)) darkLine(i); }
    // seated ones of a resumed play
    S.list.forEach((p) => { if (p.res) drawSeated(p.i, p.res.lip === 'lip'); });
    function darkLine(i) { const s = S10.slabs[i - 1], zc = (s.z0 + s.z1) / 2 + 0.8, y = yOn(zc) + 0.015; const l = box(X, Mt.y10line, R.x0 + 2.5, y - 0.01, zc - 0.07, R.x0 + 9, y + 0.02, zc + 0.07, root); l.rotation.x = -Math.atan(SL); }
    // the moving slab: one solid (built at the foot's slope, moved by its way: the slope is straight)
    const mov = new T.Group(); root.add(mov);
    // (a flat slab, its top at local y 0, its middle at the origin: laid along the two ends' heights — flat on the ground before the foot)
    const flatSlab = (g) => box(X, Mt.y10white, -8, -0.5, -2.5, 8, 0, 2.5, g);
    const slabG = flatSlab(mov);
    const win = box(X, Mt.y10hole, -8.03, -0.48, -0.5, -7.96, -0.02, 0.5, mov); win.visible = false;   // (slab 3's rabuva window, on its west side, 2–3 amot from its head)
    /** a slab (its group) with its upper edge at zU: the two ends' heights on what is under them */
    const lay = (g, zU, x, lift) => { const yF = yOn(zU), yB = yOn(zU + 5); g.position.set((R.x0 + R.x1) / 2 + x, (yF + yB) / 2 + lift, zU + 2.5); g.rotation.set(Math.atan((yF - yB) / 5), x * 0.05, 0); };   // (slab 3's rabuva window, on its west side)
    const rollers = []; for (let k = 0; k < 4; k++) { const c = new T.Mesh(new T.CylinderGeometry(0.18, 0.18, 16.6, 10), Mt.y10wood); c.rotation.z = Math.PI / 2; c.castShadow = true; root.add(c); rollers.push(c); }
    const bar = box(X, Mt.y10woodD, -0.12, -0.12, -1.4, 0.12, 0.12, 1.4, root); bar.visible = false;   // (the brake bar the crew drives under it)
    const rope = box(X, Mt.y10rope, -0.03, -0.03, 0, 0.03, 0.03, 1, root);
    // the stop line: a stretched rope and charcoal dots on what is under it
    const stopG = new T.Group(); root.add(stopG);
    const lime = box(X, Mt.y10lime.clone(), R.x0 + 0.2, 0, -2.4, R.x1 - 0.2, 0.04, 0, root); lime.visible = lv === 3;
    function stopAt(i) {
      while (stopG.children.length) stopG.remove(stopG.children[0]);
      const z = S10.slabs[i - 1].z0, y = yOn(z) + 0.06;
      box(X, Mt.y10rope, R.x0 - 0.6, y + 0.05, z - 0.03, R.x1 + 0.6, y + 0.11, z + 0.03, stopG);
      for (let x = R.x0 + 0.8; x < R.x1; x += 1.6) box(X, Mt.y10charcoal, x - 0.12, y - 0.04, z - 0.25, x + 0.12, y + 0.02, z - 0.05, stopG);
      for (const x of [R.x0 - 0.6, R.x1 + 0.6]) box(X, Mt.y10woodD, x - 0.06, y - 1, z - 0.06, x + 0.06, y + 0.6, z + 0.06, stopG);
      lime.position.set(0, yOn(z + 1.2) - 0.47, z + 2.4); lime.rotation.x = -Math.atan(SL);
    }
    // ── the crew: three pullers above the slab on what is laid (or on the body's scaffold), the roller's man, the kohen at the head
    const Bt = createBeat(X), gang = createGang(X), men = [];
    function castMen(i) {
      gang.clear(); men.length = 0;
      const z = S10.slabs[i - 1].z0 - 2.2, y = yOn(z);
      for (let k = 0; k < 3; k++) { const w = gang.add(-41 + k * 3, z - k * 0.6, { role: 'pull', item: 'rope', crew: k, fx: -38, fz: 42 }); if (w && w.a) w.a.fixedY = yOn(z - k * 0.6); men.push(w); }
      const r = gang.add(R.x1 + 1.4, zOf(KA.TOP) + 1, { role: 'hold', item: 'log', crew: 4, fx: -38, fz: 30 }); if (r && r.a) r.a.fixedY = F; men.push(r);
      const k = gang.add(-33.5, z - 2.5, { role: 'pull', item: 'rope', variant: 'kohen', fx: -38, fz: 42 }); if (k && k.a) k.a.fixedY = yOn(z - 2.5); men.push(k);
      void y;
    }
    // ── the camera: the book's side view from the south-east, the whole kevesh along the screen, the altar up on the right
    const cam0 = X.camera, fov0 = cam0.fov;
    const home = (d = 0) => { lens(X, KA.FOV); X.shot(S10.cam.w3[0].slice(), S10.cam.w3[1].slice(), d); };
    const slabAt = () => { const Mm = S.mo; const z = Mm ? zOf(Mm.s) : 40; return { x: (R.x0 + R.x1) / 2 + (Mm ? Mm.x : 0), y: yOn(z + 2.5) + 0.3, z: z + 2.5 }; };
    // the thumb: forward is up the kevesh on the screen (from the slab toward the altar)
    const TH = thumb({ side: true,   // (review fix 14: slab 2 sways at level 1 too, and the spec straightens it with a small side drag)
      dir() { const a = slabAt(), p = X.scr(a.x, a.y, a.z), q = X.scr(a.x, yOn(a.z - 4) + 0.3, a.z - 4); const dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy) || 1; return { x: dx / L, y: dy / L }; } });
    const FG = fingers(X, {
      down(f) { if (A.finished || A.busy || f.x > innerWidth * 0.6) return; TH.down(f); X.hand(null); },
      move(f) { TH.move(f); },
      up(f) { TH.up(f); },
    });
    // ── drawing each frame
    function drawSlab(dt) {
      const P = slabNow(S), Mm = S.mo;
      mov.visible = !!P && !A.crewSeat;
      if (!P || !Mm) { bar.visible = false; rope.visible = false; for (const c of rollers) c.visible = false; return; }
      const zU = zOf(Mm.s); lay(mov, zU, Mm.x, 0.4);
      win.visible = !!P.rabuva;
      // rollers under it, turning with it; the man brings the last round to the front
      rollers.forEach((c, k) => { const z = zU + 0.6 + k * 1.3; c.visible = true; c.position.set((R.x0 + R.x1) / 2 + Mm.x, yOn(z) - 0.08, z); c.rotation.x += (Mm.v * dt) / 0.18; });
      bar.visible = Mm.brake > 0.05; if (bar.visible) { const z = zU + 5.4, y = yOn(Math.min(R.foot, z)); bar.position.set(-38 + Mm.x, y + 0.35, z - 0.2); bar.rotation.x = -0.9 * Mm.brake; }
      // the rope from the slab's head to the pullers
      const w = men[1], a = [-38 + Mm.x, yOn(zU) + 0.2, zU], b = w && w.a ? [w.a.x, (w.a.fixedY || F) + 1.1, w.a.z] : [-38, yOn(zU - 6) + 1, zU - 6];
      const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); rope.visible = L > 0.4;
      rope.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); rope.scale.set(1, 1, L); rope.lookAt(b[0], b[1], b[2]);
      // the lime bed (level 3): darkens from its edges inward over 12 s
      if (lv === 3) { const u = Math.min(1, S.tSlab / KM.LIME); lime.material.color.setRGB(0.91 - 0.45 * u, 0.89 - 0.47 * u, 0.85 - 0.48 * u); }
      for (const w2 of men.slice(0, 3)) if (w2) w2.role = TH.state === 'pull' ? 'pull' : Mm.brake > 0.05 ? 'brace' : 'hold';
      V.scrape(Math.min(1, Math.abs(Mm.v) / 3)); V.creak(Mm.brake * Math.min(1, Math.abs(Mm.v)));
    }
    function crewStep(dt) {
      const C = A.crewSeat; if (!C) return;
      C.t += dt; const k = Math.min(1, C.t / 1.6), i = C.list[0];
      if (i == null) { A.crewSeat = null; C.res(); return; }
      if (!C.g) { const s = S10.slabs[i - 1]; C.g = new T.Group(); root.add(C.g); flatSlab(C.g); C.z = s.z0; }
      const e = k * k * (3 - 2 * k), dz = (1 - e) * (KA.TOP - C.z); lay(C.g, C.z + dz, 0, 0.4 * (1 - e));
      if (k >= 1) { V.thud(); X.dust(-38, yOn(C.z + 2.5) + 0.3, C.z + 2.5, 8, 4); root.remove(C.g); drawSeated(i, false); C.list.shift(); C.g = null; C.t = 0; }
    }
    // the round stone at the end: from the head of slab 6 down to the ground; a hop on every lip, a soft sound and a glint on a good joint
    const ball = new T.Mesh(new T.SphereGeometry(0.45, 14, 10), Mt.y10field); ball.visible = false; root.add(ball);
    function rollStep(dt) {
      const Rr = A.roll; if (!Rr) return;
      Rr.v = Math.min(9, Rr.v + 3.2 * dt); Rr.z += Rr.v * dt; Rr.hop = Math.max(0, Rr.hop - dt * 4);
      const y = yOn(Rr.z) + 0.45 + Math.sin(Math.min(1, Rr.hop) * Math.PI) * 0.9;
      ball.position.set(-38, y, Math.min(R.foot + 3, Rr.z)); ball.rotation.x += (Rr.v * dt) / 0.45;
      // each joint between slabs (z 37.5, 32.5, 27.5, 22.5, 17.5)
      for (const s of S10.slabs) {
        if (s.i === 1 || Rr.past[s.i] || Rr.z < s.z1) continue; Rr.past[s.i] = 1;
        const lip = Rr.lips.includes(s.i);
        if (lip) { Rr.hop = 1; V.knock(1.4); X.dust(-38, yOn(s.z1) + 0.2, s.z1, 5, 1.2); Rr.jumps++; } else { V.knock(0.7); X.sparks(-38, yOn(s.z1) + 0.1, s.z1, 6); }
      }
      if (Rr.cam) X.shot([-24, yOn(Rr.z) + 3.2, Rr.z + 7], [-38, yOn(Rr.z) + 0.5, Rr.z - 2], 0.01);
      if (Rr.z >= R.foot + 3) { A.roll = null; ball.visible = false; Rr.res(); }
    }
    function rollDown(lipsOf) {
      return new Promise((res) => { ball.visible = true; A.roll = { z: 12.6, v: 0.5, hop: 0, past: {}, lips: lipsOf, jumps: 0, res, cam: true }; });
    }
    // ── the events of the model
    const atSlab = () => { const a = slabAt(); return V3(X, a.x, a.y + 0.6, a.z); };
    function onEvents(es) {
      for (const e of es) {
        ev(e.k + (e.slab ? ':' + e.slab : ''));
        if (e.k === 'slip') { V.groan(); }
        else if (e.k === 'cracked') { V.crack(); X.dust(-38, F + 0.5, R.foot + 1, 16, 4); hurt(X, Mo, 'kevesh.cracked', V3(X, -38, F + 1, R.foot), { slab: e.slab, lv }); X.line('לוח נסדק. הצוות מביא אחר מהערימה', 2200); }
        else if (e.k === 'again') { if (e.free) X.line('הניסוי החינם: הלוח לא נסדק. עוד פעם', 2000); }
        else if (e.k === 'seated') seated(e);
        else if (e.k === 'done') whenDone();
      }
    }
    function seated(e) {
      const s = S10.slabs[e.slab - 1], at = V3(X, -38, yOn(s.z0 + 2.5) + 0.8, s.z0 + 2.5);
      V.thud(); X.dust(-38, yOn(s.z1) + 0.2, s.z1, 10, 5); X.shake(0.12, 0.2);
      drawSeated(e.slab, e.lip === 'lip');
      if (e.grade) award(X, at, e.grade, lv, 'מושיבים');
      if (e.grade === 'gold') { try { X.quick(at, WORDS.quick); } catch (er) { /* */ } A.flash = 0.6; }
      if (e.lip === 'tiny') X.line('שפה זעירה: הצוות משייף אותה במפה', 1800);
      if (e.far) X.line('רחוק מהקו: הצוות דוחף, והרווח מתמלא בסיד', 1800);
      if (e.lip === 'lip') hurt(X, Mo, 'kevesh.lip', at, { slab: e.slab, lv });
      else if (Mo.mendLip && Mo.mendLip(e.slab)) X.line('השפה הישנה תוקנה: הלוח הושב חלק', 1800);
      if (e.rabuva === 'open') extra(X, KM.PTS.rabuva, lv, 'rabuva', 'הרבובה פתוחה');
      if (e.rabuva === 'covered') { hurt(X, Mo, 'kevesh.rabuva', V3(X, S10.rabuva.x, S10.rabuva.y1, 30), { slab: e.slab, lv }); }
      if (e.lime) extra(X, KM.PTS.lime, lv, 'lime', 'מצע הסיד');
      keep();
      const nx = slabNow(S); if (nx) { stopAt(nx.i); castMen(nx.i); }
    }
    async function whenDone() {
      if (A.finished) return; A.busy = 1; X.hand(null); V.stop();
      // level 1: the crew seats 4–6 quickly (the thirty amot stand after the first completion)
      if (lv === 1 && !builtBefore) { home(0.6); await new Promise((res) => { A.crewSeat = { t: 0, list: [4, 5, 6], g: null, res }; }); }
      if (A.ended) return;
      // the round stone runs down; the lips it meets are the slabs' that stand with one
      const lips = [];
      for (let i = 1; i <= 6; i++) { const r = S.list.find((p) => p.i === i); if (r ? r.res && r.res.lip === 'lip' : Mo.flaws('kevesh.lip').some((x) => (x.slab | 0) === i)) lips.push(i); }
      await rollDown(lips); if (A.ended) return;
      if (!lips.length) { try { X.quick(V3(X, -38, F + 2, R.foot), 'חלק!'); } catch (er) { /* */ } }
      for (const w of gang.list || []) { try { gang.setRole(w, 'point'); } catch (er) { /* */ } }
      Mo.keep('kevesh', null);
      const res = result(S);
      await finish(X, A, res, WORDS.kevesh, V3(X, -38, 22, 26), { eye: S10.cam.w3[0].slice(), aim: S10.cam.w3[1].slice(), secs: 1.6, kohen: false, own: () => (gang.list || []).map((w) => w.a), after: () => { try { Mo.filmOver(); } catch (er) { /* */ } try { gang.clear(); } catch (er) { /* */ } } });
    }
    function hint() {
      if (resumed || !S.free || A.hintOn) return; A.hintOn = 1;
      const a = slabAt(), p = X.scr(a.x, a.y, a.z), q = X.scr(a.x, yOn(a.z - 6), a.z - 6);
      X.hand({ x: a.x, y: a.y, z: a.z }, Math.max(-90, Math.min(90, q.x - p.x)), Math.max(-90, Math.min(90, q.y - p.y)));
    }
    return {
      close: true, kohenWorks: true,
      begin() {
        try { X.kohen(false); } catch (e) { /* (his figure leads on the kevesh as one of the crew: the hero stays at the stand) */ }
        const P = slabNow(S); if (P) { stopAt(P.i); castMen(P.i); }
        FG.attach(); home(0.01); X.line('', 0);
        X.wait(0.9).then(() => { if (!A.ended) hint(); });
        ev(resumed ? 'resume' : 'begin'); keep();
      },
      update(dt) {
        A.t += dt;
        try {
          V.frame(); Bt.step(dt); gang.update(dt, Bt);
          if (!A.busy && !A.finished) { const inp = TH.read(dt); onEvents(step(S, inp, dt)); }
          drawSlab(dt); crewStep(dt); rollStep(dt);
          if (A.flash > 0) { A.flash -= dt; }
          if (A.t % 1 < dt) keep();
        } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h133] kevesh', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
      },
      down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { TH.up(null); keep(); },
      wants(p) { if (!p) return true; return p.x < innerWidth * 0.6; },
      holds() { return TH.on; },
      lensFov: KA.FOV,
      end() { A.ended = true; FG.detach(); V.stop(); X.hand(null); lens(X, fov0); try { gang.clear(); } catch (e) { /* */ } X.props.remove(root); own('ramp', false); },
      at() { return atSlab(); },
      dbg() {
        const P = slabNow(S), Mm = S.mo, a = slabAt(), sc = X.scr(a.x, a.y, a.z), d = TH.dbg();
        return { id: m.id, lv, t: +A.t.toFixed(2), ev: A.ev.slice(-10), slab: P ? P.i : null, k: S.k, s: Mm ? +Mm.s.toFixed(3) : null, len: Mm ? Mm.len : null, v: Mm ? +Mm.v.toFixed(3) : null, x: Mm ? +Mm.x.toFixed(3) : null, brake: Mm ? +Mm.brake.toFixed(2) : 0, err: +errOf(S).toFixed(3), still: Mm ? +Mm.still.toFixed(2) : 0, at: [Math.round(sc.x), Math.round(sc.y)], thumb: d, dir: (() => { try { const a = slabAt(), p = X.scr(a.x, a.y, a.z), q = X.scr(a.x, yOn(a.z - 4) + 0.3, a.z - 4), L = Math.hypot(q.x - p.x, q.y - p.y) || 1; return [+((q.x - p.x) / L).toFixed(3), +((q.y - p.y) / L).toFixed(3)]; } catch (e) { return null; } })(), pts: S.pts, dmg: S.dmg, lips: S.lips, cracked: S.cracked, free: S.free, busy: A.busy, roll: !!A.roll, crew: !!A.crewSeat, finished: A.finished, way: P ? wayOf(P.i) : null };
      },
    };
  },
};
void LOSS; void wedge;
