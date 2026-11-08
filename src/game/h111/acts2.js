/* ── build 111 ── h111/acts2.js — the twists of stage 02 (spec "המשחקונים עד רמת המגע" §4–6):
 *   4 the great stone on the crowbar (stretches 4, 6, 8): the treadwheel sets an 8–10 amot stone beside its bed; he levers it out
 *     to the face, end by end. Its losses, mild to grave: no fulcrum (the bar slips), too strong (past the mark), a chip (> 3 heaves
 *     from one end), on the edge (it leans and creaks: one warning), the fall (−40, three stones, the run broken; a new one comes).
 *   5 the gates' openings (once, before level 3): from above the whole ring, seven timber frames to their sides — 3 north, 3 south,
 *     1 east (Middot 1:4); the west has none.
 *   6 the closing stone: the ring's last gap; every rule together — choose, turn, set, true it with the setback; no marks.
 */
import { H111, STRETCH, GIANT, starsOf } from './model.js';
import { SH2, frameOf, stoneMesh, label, gateFrame, giantFrame, giantPose, GIANT_C } from './world.js';
import { onPlane, clamp, lerp, ease } from '../h109/kit.js';

const H = H111.H;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SB = 2 / 24;   // the setback (two fingers of an amah's 24)

function rampAt(F, along) { const p = F.at(along, -3); return { x: p.x, z: p.z, nx: F.nx, nz: F.nz }; }
function beam(T, PR, a, b, r = 0.13, mat) {
  const v = new T.Vector3(b.x - a.x, b.y - a.y, b.z - a.z), L = v.length();
  const m = new T.Mesh(new T.CylinderGeometry(r, r, 1, 6), mat || PR.M.wood); m.castShadow = true;
  m.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); m.scale.set(1, L, 1);
  m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v.normalize()); PR.root.add(m); return m;
}
function beamSet(T, m, a, b) {
  const v = new T.Vector3(b.x - a.x, b.y - a.y, b.z - a.z), L = v.length() || 0.01;
  m.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); m.scale.set(1, L, 1); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v.normalize());
}

/* ───────── 4. the great stone on the crowbar ───────── */
// its start (each end's distance in from the face) and the bed's way per stretch: 4 slides only (a heave moves the whole stone),
// 6 also turns a little (the other end follows a fifth), 8 pivots on the far end (the bed has a corner: turned too far, it jams —
// he must change ends to bring it straight), and the bed is wet at level 3 (the same heave sends it further)
const LV = { 4: { d: [2.4, 2.4], follow: 1, jam: 9 }, 6: { d: [2.0, 2.8], follow: 0.2, jam: 1.6 }, 8: { d: [3.0, 1.8], follow: 0, jam: 1.25 } };
export const LEVER = {
  icon: '🪨', title: 'אבן הענק בלום',
  walkLine: (m) => `אבן הענק של קטע ${m.s}: גלגל הדריכה מניח אותה על החומה`,
  stand(m) { const F = giantFrame(m.s); const p = F.at(-1.6, -2.2); const c = F.at(F.G / 2, 0); return { x: p.x, z: p.z, face: [c.x, c.z] }; },
  prepare(m, X) {
    const F = giantFrame(m.s); try { X.stages.s20Pin(rampAt(F, -6)); } catch (e) { /* */ }
    const p = F.at(F.G + 4.5, -0.4); SH2.crane.place(p.x, p.z, F.yaw); SH2.crane.g.visible = true; const c = F.at(F.G / 2, 0); SH2.crane.aim(c.x, c.z, 1);
  },
  make(m, X) {
    const F = giantFrame(m.s), lv = X.level(), T3 = X.THREE, PR = X.props, R = LV[m.s] || LV[4], L = F.G;
    const wet = lv >= 3 || m.s === 8;
    const A = { d: [...R.d], moves: 0, par: 0, chipF: 1, fell: 0, lastEnd: -1, run: 0, teeter: false, tilt: 0, press: null, done: false, busy: true, t: 0, slips: 0, overs: 0, chips: [] };
    A.par = Math.ceil(R.d[0] / 1.0) + Math.ceil(R.d[1] / 1.0) + (R.follow >= 1 ? -Math.ceil(Math.min(R.d[0], R.d[1]) / 1.0) : 0) + 1;
    let stone = stoneMesh(X, 1, 1, 1);
    // the mark on the bed: a chalk line along the face where the stone must come, and a count at each end
    const ck = new T3.Mesh(PR.geo.box, PR.M.chalk); const cp = F.at(L / 2, 2.95, 0.03); ck.scale.set(L + 0.4, 0.03, 0.12); ck.position.set(cp.x, cp.y, cp.z); ck.rotation.y = F.yaw; PR.root.add(ck);
    const ends = [label(X), label(X)];
    // the bar and its fulcrum (a block of wood under it)
    const bar = beam(T3, PR, F.at(0, -2, 1.6), F.at(0, 0, 0.2), 0.11, PR.M.woodD); bar.visible = false;
    const ful = new T3.Mesh(PR.geo.box, PR.M.wood); ful.scale.set(0.5, 0.35, 0.5); ful.visible = false; PR.root.add(ful);
    // the crew: two with ropes on the wall's inner side (they hold it if it leans), one pointing at the mark, the wheel's men
    const C = SH2.crew;
    const r1 = F.at(L + 1.6, -1.6), r2 = F.at(L + 3.2, -0.6), pt = F.at(L + 2.2, 1.6);   // (beyond the far end: never between the camera and the stone)
    const crew = [C.add(r1.x, r1.z, { role: 'hold', item: 'rope', fx: F.at(L * 0.7, 1).x, fz: F.at(L * 0.7, 1).z, crew: 2 }), C.add(r2.x, r2.z, { role: 'hold', item: 'rope', fx: F.at(L * 0.7, 1).x, fz: F.at(L * 0.7, 1).z, crew: 2 }), C.add(pt.x, pt.z, { role: 'point', fx: cp.x, fz: cp.z, crew: 0 })];
    const pullers = [];
    function draw() {
      giantPose(F, stone, A.d[0], A.d[1], A.tilt);
      for (let i = 0; i < 2; i++) {
        const d = A.d[i], al = i ? L - 0.6 : 0.6;
        ends[i].set(Math.abs(d) <= 0.12 ? '✓' : d > 0 ? `עוד ${d.toFixed(1)}` : `עבר ${(-d).toFixed(1)}`, F.at(al, GIANT_C - d, H + 0.9));
        ends[i].el.classList.toggle('hot', Math.abs(d) <= 0.12);
      }
    }
    function shot() {
      // wide, from outside and the side: the stone's whole way to the face, the crane, the edge and the drop (spec: "מבט רחב מהצד")
      const t = F.at(L / 2 + 0.5, 0.6, -1.2), p = F.at(L * 0.25 - 4, L * 1.05 + 9, L * 0.85 + 6);   // (from outside: the face, the edge, the drop where it would fall)
      X.shot([p.x, p.y, p.z], [t.x, t.y, t.z], 1.0);
    }
    async function lower(first) {
      // the treadwheel lowers it beside the bed, an amah or two in (the old world's crane, its rope swaying a little)
      A.busy = true; const tip = new T3.Vector3();
      for (let k = 0; k <= 30; k++) {
        const u = ease(k / 30); giantPose(F, stone, A.d[0], A.d[1], 0, (1 - u) * 7);
        try { SH2.crane.tipWorld(tip); SH2.crane.rope.show(true); SH2.crane.rope.set({ x: tip.x, y: tip.y, z: tip.z }, { x: stone.position.x, y: stone.position.y + H / 2, z: stone.position.z }, 0); } catch (e) { /* */ }
        await sleep(40);
      }
      try { SH2.crane.rope.show(false); } catch (e) { /* */ }
      X.play('settle'); X.shake(0.25, 0.35); X.dust(stone.position.x, F.y + 0.2, stone.position.z, 18, L * 0.3);
      draw(); A.busy = false;
      if (first) {
        X.line(R.follow >= 1 ? 'הקישו על קצה האבן ליד המצע, ואז הניפו למעלה: הנפה קצרה מזיזה מעט, ארוכה הרבה' : R.follow > 0 ? 'כל קצה זז לחוד: בחרו קצה, הניפו, ועברו לקצה השני' : 'המצע עם פינה: קצה שמתקדם לבד נתקע · החליפו קצוות');
        const e = F.at(0.8, GIANT_C - A.d[0] - 1.1, H * 0.6); X.hand(e, 0, -46);
      } else X.line('אבן חדשה על המצע · מתחילים שוב, בזהירות ליד השפה');
    }
    /** the finger on the stone → which end (0 | 1) and how far from it; null: not on the stone */
    function onStone(p) {
      const hits = X.rayAt(p.x, p.y).intersectObject(stone, false); if (!hits.length) return null;
      const lo = F.local(hits[0].point.x, hits[0].point.z);
      return lo.along < L / 2 ? { i: 0, far: lo.along } : { i: 1, far: L - lo.along };
    }
    function barAt(i, k = 0) {
      // the bar's tip under the stone's inner edge at the end, its fulcrum a little behind, its handle in his hands (raised as he heaves)
      const al = i ? L - 0.7 : 0.7, edge = GIANT_C - A.d[i] - 1.35;   // the stone's inner edge at that end
      const tip = F.at(al, edge + 0.15, 0.15), fp = F.at(al, edge - 0.6, 0.18), hand = F.at(al + (i ? 0.4 : -0.4), edge - 2.6, 1.1 + k * 1.2);
      bar.visible = true; beamSet(T3, bar, hand, tip); ful.visible = true; ful.position.set(fp.x, fp.y, fp.z); ful.rotation.y = F.yaw;
      return { tip, hand };
    }
    function standAt(i) { const p = F.at(i ? L + 0.9 : -0.9, Math.max(-2.5, GIANT_C - A.d[i] - 2.4));   /* (beyond the end, on the wall's top) */ const t = F.at(i ? L - 0.7 : 0.7, 0); try { X.hero.setPos(p.x, p.z, Math.atan2(t.x - p.x, t.z - p.z)); } catch (e) { /* */ } }
    async function fall() {
      // the second strong heave on the edge: it goes over, breaks below in noise and dust (−40, three stones, the run broken)
      A.busy = true; A.fell++; A.teeter = false; X.hand(null); X.meter(null);
      const out = { x: F.nx, z: F.nz }, base = stone.position.clone();
      const gy = X.ground(base.x + out.x * 6, base.z + out.z * 6);
      X.play('crack');
      for (let k = 1; k <= 26; k++) {
        const u = k / 26; A.tilt = 0.4 + u * 1.2; giantPose(F, stone, A.d[0], A.d[1], A.tilt);
        stone.position.x = base.x + out.x * (u * 4.5); stone.position.z = base.z + out.z * (u * 4.5); stone.position.y = lerp(base.y, gy + H / 2, u * u);
        await sleep(30);
      }
      const at = { x: stone.position.x, y: gy + 3, z: stone.position.z };
      X.shake(0.6, 0.9); X.play('crash'); X.dust(at.x, gy + 0.5, at.z, 40, 5);
      try { PR.chunksAt({ x: at.x, y: gy + 0.6, z: at.z, r: 2.4 }, 14); } catch (e) { /* */ }
      X.loss(40, at, 'אבן הענק נפלה מהחומה ונשברה', 3);
      for (const w of pullers) C.remove(w); pullers.length = 0;
      await sleep(900); PR.remove(stone);
      X.line('הצוות גורר את השברים לערימת הפסולת · מזחלת השוורים מביאה אבן ענק חדשה');
      await sleep(2400);
      stone = stoneMesh(X, 1, 1, 1); A.d = [...R.d]; A.tilt = 0; A.run = 0; A.lastEnd = -1; A.moves = 0;
      await lower(false);
    }
    function heave(i, f, up) {
      // a heave: up pushes the end out (the other follows by the bed's rule); down draws it back in (a smaller move)
      const move = (0.12 + 0.95 * clamp(f, 0, 1.2)) * (wet ? 1.4 : 1);
      A.moves++;
      if (i === A.lastEnd) A.run++; else { A.run = 1; A.lastEnd = i; }
      const j = 1 - i, before = [...A.d];
      if (up) { A.d[i] -= move; A.d[j] -= move * R.follow; } else { A.d[i] += move * 0.7; A.d[j] += move * 0.7 * R.follow; }
      const k0 = barAt(i, 1);
      try { X.hero.act('split', { x: k0.tip.x, y: k0.tip.y, z: k0.tip.z }, { snap: true }); } catch (e) { /* */ }
      X.play(f > 0.6 ? 'strike' : 'stamp'); X.shake(0.08 + f * 0.12, 0.2); X.dust(k0.tip.x, F.y + 0.2, k0.tip.z, 6 + f * 8, 1.4);
      setTimeout(() => { if (!A.done && bar.visible) barAt(i, 0); }, 260);
      const at = F.at(i ? L - 1 : 1, GIANT_C - A.d[i], H + 1.4);
      // the corner of the bed: one end run out too far ahead of the other jams the stone — the heave is lost
      if (Math.abs(A.d[0] - A.d[1]) > R.jam) { A.d = before; X.word(at, 'הקצה נתקע בפינת המצע · עברו לקצה השני'); X.play('thud'); draw(); return; }
      // a chip off the end: more than three heaves in a row from one end — a flaw that stays in the wall
      if (A.run > 3) {
        A.chipF *= 0.85; A.run = 0; X.word(at, 'הלום נגס בקצה: שבב נשבר · עברו לקצה השני'); X.play('chip');
        try { PR.chunksAt({ x: at.x, y: F.y + H, z: at.z, r: 0.4 }, 3); } catch (e) { /* */ }
        const cm = new T3.Mesh(PR.geo.box, PR.M.seam); cm.scale.set(0.5, 0.3, 0.25); const q = F.at(i ? L - 0.3 : 0.3, GIANT_C - A.d[i] - 1.25, H - 0.2); cm.position.set(q.x, q.y, q.z); cm.rotation.y = F.yaw; PR.root.add(cm); A.chips.push({ m: cm, i });
      }
      const mn = Math.min(A.d[0], A.d[1]);
      // the edge: it leans out and creaks (one warning); a strong heave then, or further out, and it falls
      if (A.teeter && up && (f > 0.4 || mn < -1.3)) { draw(); fall(); return; }
      if (mn < -1.3) { draw(); fall(); return; }
      if (mn < -0.7 && !A.teeter) {
        A.teeter = true; A.tilt = 0.12; X.play('creak'); X.shake(0.2, 0.6);
        X.word(at, 'על השפה! האבן נוטה וחורקת · משכו אותה פנימה בעדינות');
        const p1 = F.at(L * 0.6, -2.7), p2 = F.at(L * 0.9, -2.7);
        for (const p of [p1, p2]) pullers.push(C.add(p.x, p.z, { role: 'pull', item: 'rope', fx: stone.position.x, fz: stone.position.z, crew: 1 }));
      } else if (A.teeter && mn >= -0.7) { A.teeter = false; A.tilt = 0; for (const w of pullers) C.remove(w); pullers.length = 0; X.line('הצלתם אותה · עכשיו בעדינות'); }
      else if (Math.min(...A.d) < -0.08 && Math.min(...before) >= -0.08) { A.overs++; X.word(at, 'חזק מדי: עברה את הסימן · מחזירים בהנפה למטה'); }
      draw();
      if (Math.abs(A.d[0]) <= 0.12 && Math.abs(A.d[1]) <= 0.12) finish();
    }
    async function finish() {
      A.done = true; X.hand(null); X.meter(null); bar.visible = false; ful.visible = false; A.tilt = 0;
      const gold = Math.abs(A.d[0]) <= 0.06 && Math.abs(A.d[1]) <= 0.06;
      const at = F.at(L / 2, GIANT_C, H + 1.6);
      X.play('settle'); X.shake(0.35, 0.5); X.dust(at.x, F.y + 0.3, at.z, 24, L * 0.35);
      X.hit(at, gold ? 'gold' : 'good', { text: 'אבן הענק במקומה', craft: 'בנאים' });
      for (const w of crew) { try { w.a && (w.a.cheer = 1.5); } catch (e) { /* */ } }
      X.play('tier');
      if (!A.fell && !A.overs && A.chipF >= 1) X.bonus(100, 'giant', 'בלי שבב ובלי לעבור את הסימן');
      const st = X.M.st; st.giant = st.giant || {}; st.giant[m.s] = { done: 1, d0: +A.d[0].toFixed(3), d1: +A.d[1].toFixed(3) };
      SH2.giants[m.s] = stone; X.save();
      const q = clamp(A.par / Math.max(A.par, A.moves), 0.3, 1) * A.chipF * (A.fell ? 0.6 : 1) * (gold ? 1 : 0.92);
      await sleep(900);
      X.end({ q, stars: starsOf(q), at });
    }
    return {
      begin() { shot(); standAt(0); draw(); for (const e of ends) e.set('', null); lower(true); },
      update(dt) {
        A.t += dt;
        if (A.teeter && !A.busy) { A.tilt = 0.12 + Math.sin(A.t * 9) * 0.03; giantPose(F, stone, A.d[0], A.d[1], A.tilt); }
        if (A.press && A.press.lever) { const f = clamp((A.press.y0 - A.press.y) / (innerHeight * 0.28), -1.2, 1.2); X.meter(A.press.at, Math.abs(f)); barAt(A.press.i, clamp(f, 0, 1) * 0.6); }
        if (A.busy) for (const e of ends) e.set('', null); else draw();
      },
      down(p) {
        if (A.done || A.busy) return;
        const o = onStone(p); if (!o) return;
        X.hand(null);
        if (o.far > 1.6) {
          // no fulcrum: far from the end the bar slips; he flinches and the stone stays (a move lost)
          A.moves++; A.slips++; const at = F.at(L / 2, GIANT_C - (A.d[0] + A.d[1]) / 2, H + 1.2);
          X.word(at, 'הלום החליק: אין משען · הקישו ממש ליד הקצה'); X.play('chip'); return;
        }
        standAt(o.i); barAt(o.i, 0);
        A.press = { i: o.i, y0: p.y, y: p.y, lever: true, at: F.at(o.i ? L - 0.7 : 0.7, GIANT_C - A.d[o.i], H + 1.8) };
        X.play('rope');
      },
      move(p) { if (A.press) A.press.y = p.y; },
      up(p) {
        const pr = A.press; A.press = null; X.meter(null); if (!pr || A.done || A.busy) return;
        const dy = pr.y0 - (p && Number.isFinite(p.y) ? p.y : pr.y), f = Math.abs(dy) / (innerHeight * 0.28);
        if (f < 0.06) { X.line('הניפו: גררו למעלה כדי לדחוף החוצה, למטה כדי למשוך פנימה'); return; }
        heave(pr.i, f, dy > 0);
      },
      end() {
        for (const o of [ck, bar, ful, ...A.chips.map((c) => c.m)]) PR.remove(o);
        for (const e of ends) e.remove(); for (const w of [...crew, ...pullers]) C.remove(w);
        if (!A.done && stone) PR.remove(stone);
        try { SH2.crane.rope.show(false); } catch (e) { /* */ }
      },
      at() { return F.at(L / 2, GIANT_C, H + 1); },
      dbg() {
        const sc = (o) => { const r = X.scr(o.x, o.y, o.z); return [Math.round(r.x), Math.round(r.y)]; };
        return { s: m.s, lv, wet, busy: A.busy, done: A.done, d: A.d.map((v) => +v.toFixed(3)), teeter: A.teeter, moves: A.moves, fell: A.fell, run: A.run, last: A.lastEnd, follow: R.follow, jam: R.jam,
          end0: sc(F.at(0.7, GIANT_C - A.d[0] - 0.4, H * 0.7)), end1: sc(F.at(L - 0.7, GIANT_C - A.d[1] - 0.4, H * 0.7)), mid: sc(F.at(L / 2, GIANT_C - (A.d[0] + A.d[1]) / 2, H * 0.7)), H: innerHeight };
      },
    };
  },
};

/* ───────── 5. the gates' openings ───────── */
const WEST = [{ x: -190, z: -30 }, { x: -190, z: 30 }];
export const GATES = {
  icon: '🚪', title: 'פתחי השערים',
  walkLine: () => 'אמצע העזרה: שבע תבניות של פתחים מחכות',
  stand() { return { x: -95, z: 9, face: [-95, 0] }; },
  prepare(m, X) { try { X.stages.s20Pin(null); } catch (e) { /* */ } SH2.crane.g.visible = false; },
  make(m, X) {
    const T3 = X.THREE, PR = X.props, G = H111.GATES, st = X.M.st;
    st.gates = st.gates || [];
    const A = { held: null, set: new Set(st.gates), miss: 0, done: false, t: 0 };
    // the slots: the seven openings (chalk on the wall's top, over each) and two in the west, where there is no gate
    const slots = [...G.map((g, gi) => ({ gi, x: g.k === 'E' ? 3 : g.x, z: g.k === 'N' ? -70.5 : g.k === 'S' ? 70.5 : 0, k: g.k, n: g.n })), ...WEST.map((w) => ({ gi: -1, x: w.x, z: w.z, k: 'W', n: '' }))];
    const slotM = slots.map((s) => {
      const mm = new T3.Mesh(new T3.PlaneGeometry(1, 1), PR.M.chalk.clone());   // (a lime outline on the wall's top, rule 9) mm.rotation.x = -Math.PI / 2;
      const along = s.k === 'N' || s.k === 'S'; mm.scale.set(along ? 10 : 6.4, along ? 6.4 : 10, 1); mm.material.opacity = 0.55; mm.material.depthTest = false; mm.renderOrder = 997;
      let y = 16; try { const t = X.stages.wallTopAt(s.x + (along ? 6.5 : 0), s.z + (along ? 0 : 6.5)); if (Number.isFinite(t)) y = t + 0.4; } catch (e) { /* */ }
      mm.position.set(s.x, y, s.z); PR.root.add(mm); s.y = y; return mm;
    });
    // the frames lying in the court (7, the ones already set stand in their openings)
    const toks = [];
    for (let i = 0; i < 7; i++) {
      if (A.set.has(i)) continue;
      const gr = new T3.Group(); const Wd = PR.M.wood;
      for (const [w, d, x, z] of [[0.8, 6, -4.6, 0], [0.8, 6, 4.6, 0], [10, 0.8, 0, -2.6], [10, 0.8, 0, 2.6], [10, 0.5, 0, 0]]) { const b = new T3.Mesh(PR.geo.box, Wd); b.scale.set(w, 0.7, d); b.position.set(x, 0.35, z); b.castShadow = true; gr.add(b); }
      const home = { x: -126 + (i % 4) * 14 + (i >= 4 ? 7 : 0), z: -6 + Math.floor(i / 4) * 12 };
      gr.position.set(home.x, X.ground(home.x, home.z) + 0.1, home.z); PR.root.add(gr);
      toks.push({ i, g: gr, home });
    }
    const labs = { N: label(X), S: label(X), E: label(X) };
    const crew = [SH2.crew.add(-104, 14, { role: 'carry', item: 'beam', from: [-104, 14], to: [-112, 30], crew: 1 }), SH2.crew.add(-84, -10, { role: 'point', fx: -95, fz: -40, crew: 0 })];
    function count() {
      const n = { N: 0, S: 0, E: 0 }; for (const gi of A.set) n[G[gi].k]++;
      labs.N.set(`צפון ${n.N}/3`, { x: -125, y: 16, z: -56 }); labs.S.set(`דרום ${n.S}/3`, { x: -125, y: 16, z: 56 }); labs.E.set(`מזרח ${n.E}/1`, { x: -14, y: 16, z: 0 });
      for (const k of ['N', 'S', 'E']) labs[k].el.classList.toggle('hot', n[k] === (k === 'E' ? 1 : 3));
    }
    function shot() { const k = innerWidth / Math.max(1, innerHeight) < 1.6 ? 1.18 : 1; X.shot([-95, 330 * k, 72 * k], [-95, 0, -14], 1.0); }
    function tokAt(p) {
      const hits = X.rayAt(p.x, p.y).intersectObjects(toks.map((t) => t.g), true); if (!hits.length) return null;
      let o = hits[0].object; while (o && !toks.find((t) => t.g === o)) o = o.parent; return toks.find((t) => t.g === o) || null;
    }
    async function finish() {
      A.done = true; X.hand(null);
      X.line('שבעה פתחים: שלושה בצפון, שלושה בדרום ואחד במזרח (מדות א, ד)');
      X.bonus(A.miss ? 0 : 100, 'gates', 'כל השערים במקומם'); X.play('tier');
      X.save(); await sleep(1600);
      const q = 7 / (7 + A.miss);
      X.end({ q, stars: starsOf(q), at: { x: -95, y: 20, z: 0 } });
    }
    return {
      begin() {
        shot(); count();
        X.line('גררו כל תבנית לפתח שלה בחומה: שלושה בצפון, שלושה בדרום ואחד במזרח');
        const t = toks[0]; if (t) { const s0 = X.scr(t.g.position.x, t.g.position.y, t.g.position.z), s1 = X.scr(slots[1].x, slots[1].y, slots[1].z); X.hand({ x: t.g.position.x, y: t.g.position.y + 1, z: t.g.position.z }, (s1.x - s0.x) * 0.5, (s1.y - s0.y) * 0.5); }
        if (!toks.length) setTimeout(finish, 400);
      },
      update(dt) { A.t += dt; for (const [i, s] of slots.entries()) { if (s.gi >= 0 && A.set.has(s.gi)) slotM[i].visible = false; else slotM[i].material.opacity = 0.62 + Math.sin(A.t * 3 + i) * 0.2; } },
      down(p) { if (A.done) return; const t = tokAt(p); if (t) { A.held = t; X.hand(null); X.play('rope'); } },
      move(p) { if (!A.held) return; const q = onPlane(X, p.x, p.y, 14); if (!q) return; A.held.g.position.set(q.x, 14, q.z); A.held.g.rotation.y = Math.abs(q.z) > 50 ? 0 : q.x > -20 ? Math.PI / 2 : 0; },
      up() {
        const t = A.held; A.held = null; if (!t || A.done) return;
        const p = t.g.position; let best = null, bd = 1e9;
        for (const s of slots) { if (s.gi >= 0 && A.set.has(s.gi)) continue; const d = Math.hypot(s.x - p.x, s.z - p.z); if (d < bd) { bd = d; best = s; } }
        const back = () => { t.g.position.set(t.home.x, X.ground(t.home.x, t.home.z) + 0.1, t.home.z); t.g.rotation.y = 0; };
        if (!best || bd > 16) { back(); return; }
        const at = { x: best.x, y: best.y + 4, z: best.z };
        if (best.gi < 0) { A.miss++; X.word(at, 'במערב אין שער (מדות א, ד)'); X.play('thud'); back(); return; }
        // set: the frame stands in its opening, the gate's name over it
        PR.remove(t.g); toks.splice(toks.indexOf(t), 1);
        A.set.add(best.gi); st.gates = [...A.set]; SH2.frames[best.gi] = gateFrame(X, best.gi);
        X.dust(best.x, best.y - 2, best.z, 14, 4); X.play('settle'); X.hit(at, 'gold', { text: best.n, craft: 'נגרים' });
        count(); X.save();
        if (A.set.size >= 7) finish();
      },
      end() {
        for (const o of [...slotM, ...toks.map((t) => t.g)]) PR.remove(o);
        for (const k of Object.keys(labs)) labs[k].remove(); for (const w of crew) SH2.crew.remove(w);
      },
      at() { return { x: -95, y: 20, z: 0 }; },
      dbg() {
        const sc = (o) => { const r = X.scr(o.x, o.y, o.z); return [Math.round(r.x), Math.round(r.y)]; };
        return { done: A.done, miss: A.miss, set: [...A.set], toks: toks.map((t) => ({ i: t.i, scr: sc(t.g.position) })), slots: slots.map((s) => ({ gi: s.gi, k: s.k, scr: sc({ x: s.x, y: s.y, z: s.z }) })) };
      },
    };
  },
};

/* ───────── 6. the closing stone ───────── */
// the ring's last stone (the world's last: on the west wall's outer face, course 19). Four stones beside the gap: one is right.
function closingSlot(X) {
  let N = 0; try { N = X.stages.siteInfo('wall').stones; } catch (e) { N = 0; }
  let s = null; try { s = X.stages.slotAt('wall', N - 1); } catch (e) { s = null; }
  if (!s) s = { x: -192, y: 42.5, z: -4.8, w: 6.36, h: H, d: 1.96, n: [-1, 0], yaw: Math.atan2(-1, 0) };
  return s;
}
export const CLOSING = {
  icon: '👑', title: 'אבן הסגירה',
  walkLine: () => 'הרווח האחרון בטבעת: כל הצוותים מחכים',
  stand(m, X) { const F = closeFrame(X); const p = F.at(-2.2, -2.6, 0); const c = F.at(F.w / 2, 0); return { x: p.x, z: p.z, face: [c.x, c.z] }; },
  prepare(m, X) { const F = closeFrame(X); const r = F.at(-6, -6.2, 0); try { X.stages.s20Pin({ x: r.x, z: r.z, nx: F.nx, nz: F.nz }); } catch (e) { /* */ } SH2.crane.g.visible = false; try { X.stages.craneOff(true); } catch (e) { /* */ } },
  make(m, X) {
    const F = closeFrame(X), T3 = X.THREE, PR = X.props, lv = X.level();
    const W = F.w, target = -SB, wet = true;
    // the four: too short, the right one, too long, and the right length with a broken corner
    const C = [{ L: +(W - 1.7).toFixed(2) }, { L: W, ok: 1 }, { L: +(W + 1.05).toFixed(2) }, { L: W, chip: 1 }];
    const order = [2, 0, 3, 1];
    const A = { phase: 'choose', held: null, tap0: null, t: 0, wrong: 0, hard: 0, taps: 0, off: 0.42, cracked: false, breaks: 0, done: false, busy: false, press: null };
    const stones = order.map((ci, k) => {
      const c = C[ci], mm = stoneMesh(X, 1, 1, 1);
      const o = { ...c, rot: k % 2, m: mm, home: { along: W + 1.6 + k * 0.0, across: 0, k } };
      if (c.chip) { const n = new T3.Mesh(PR.geo.box, PR.M.seam); n.scale.set(0.9, 0.7, 0.6); mm.add(n); n.position.set(0.42, 0.3, -0.35); n.scale.set(0.16, 0.4, 0.35); o.notch = n; }
      return o;
    });
    // they lie on the wall's top along it, past the gap (each on its own little stack)
    function home(o) {
      // (two stacks of two beside the gap, as the crane set them down)
      const k = o.home.k, al = W + 1.0 + (k % 2) * 8.4, layer = k >> 1, w = o.rot ? 2 : o.L;
      const p = F.at(al + (o.rot ? 1 : o.L / 2), -0.9, H + H / 2 + 0.02 + layer * H);
      o.m.position.set(p.x, p.y, p.z); o.m.rotation.set(0, F.yaw + (o.rot ? Math.PI / 2 : 0), 0); o.m.scale.set(o.L - 0.05, H - 0.02, F.d + 0.02); void w;
      o.at = p;
    }
    stones.forEach(home);
    const crew = [];
    for (let k = 0; k < 4; k++) { const p = F.at(-4 - k * 3.2, k % 2 ? -1.6 : -0.4, 0); crew.push(SH2.crew.add(p.x, p.z, { role: 'point', fx: F.at(W / 2, 0).x, fz: F.at(W / 2, 0).z, crew: k % 3 })); }
    for (let k = 0; k < 3; k++) { const p = F.at(W + 30 + k * 3, -1, 0); crew.push(SH2.crew.add(p.x, p.z, { role: 'hold', item: 'mallet', fx: F.at(W / 2, 0).x, fz: F.at(W / 2, 0).z, crew: (k + 1) % 3 })); }
    const ghost = new T3.Mesh(new T3.PlaneGeometry(1, 1), new T3.MeshBasicMaterial({ color: 0xFFD66E, transparent: true, opacity: 0.5, depthWrite: false, side: T3.DoubleSide }));
    ghost.visible = false; ghost.renderOrder = 998; PR.root.add(ghost);
    let set = null, rod = null, str = null, bob = null, tick = null, ind = null, crack = null;
    const goldLine = new T3.MeshBasicMaterial({ color: 0xFFD66E, transparent: true, opacity: 0.9, depthWrite: false });
    function shot() { const t = F.at(W / 2 + 4.5, 0.4, H * 0.4), p = F.at(W / 2 + 1, -30, 25); X.shot([p.x, p.y, p.z], [t.x, t.y, t.z], 1.0); }
    function shotPlumb() { const t = F.at(W / 2, F.d, F.h * 0.3), p = F.at(W / 2 - 10, F.d + 9, F.h + 5); X.shot([p.x, p.y, p.z], [t.x, t.y, t.z], 1.0); }
    function pick(p) {
      const hits = X.rayAt(p.x, p.y).intersectObjects(stones.map((o) => o.m), true); if (!hits.length) return null;
      let ob = hits[0].object; while (ob && !stones.find((o) => o.m === ob)) ob = ob.parent; return stones.find((o) => o.m === ob) || null;
    }
    function inGap(px, py) { const q = onPlane(X, px, py, F.y + F.h); if (!q) return null; const lo = F.local(q.x, q.z); return { q, lo, in: lo.along > -2.5 && lo.along < W + 2.5 && Math.abs(lo.across) < 4 }; }
    function placeAt(o, off = 0, lift = 0) { const p = F.at(W / 2, F.d / 2 + off, F.h / 2 + lift); o.m.position.set(p.x, p.y, p.z); o.m.rotation.set(0, F.yaw, 0); o.m.scale.set(o.L - 0.04, F.h - 0.02, F.d + 0.04); }
    async function seat(o) {
      A.busy = true; set = o; X.hand(null); ghost.visible = false;
      for (let k = 0; k <= 16; k++) { placeAt(o, A.off, (1 - ease(k / 16)) * 2.5); await sleep(35); }
      X.play('settle'); X.shake(0.25, 0.35); X.dust(o.m.position.x, F.y + 0.2, o.m.position.z, 14, 2.4);
      try { X.hero.act('tamp', { x: o.m.position.x, y: F.y + F.h, z: o.m.position.z }, { snap: true }); } catch (e) { /* */ }
      X.hit({ x: o.m.position.x, y: F.y + F.h + 1.4, z: o.m.position.z }, A.wrong ? 'good' : 'gold', { text: 'נכנסה', craft: 'בנאים' });
      await sleep(700);
      // the plumb: it stands proud of the face; true it to two fingers in (no marks: the line and the bob only)
      A.phase = 'plumb'; shotPlumb();
      const sp = F.at(W / 2 - 1.2, -2.2, 0); try { X.hero.setPos(sp.x, sp.z, Math.atan2(F.nx, F.nz)); } catch (e) { /* */ }
      const al = W / 2;
      rod = new T3.Mesh(PR.geo.box, PR.M.wood); const r0 = F.at(al, F.d - 0.4, F.h + 0.45); rod.scale.set(0.16, 0.16, 2.8); rod.position.set(r0.x, r0.y, r0.z); rod.rotation.y = F.yaw; PR.root.add(rod);
      const top = F.at(al, F.d + 0.02, F.h + 0.45), bot = F.at(al, F.d + 0.02, -F.h * 0.6);
      str = new T3.Mesh(PR.geo.box, new T3.MeshBasicMaterial({ color: 0x2A1E12 })); str.scale.set(0.03, top.y - bot.y, 0.03); str.position.set(top.x, (top.y + bot.y) / 2, top.z); PR.root.add(str);
      bob = new T3.Mesh(new T3.ConeGeometry(0.18, 0.4, 8), PR.M.woodD); bob.rotation.x = Math.PI; bob.position.set(bot.x, bot.y - 0.2, bot.z); PR.root.add(bob);
      ind = new T3.Mesh(new T3.ConeGeometry(0.28, 0.7, 3), new T3.MeshBasicMaterial({ color: 0xE0563E, transparent: true, opacity: 0.95, depthWrite: false })); PR.root.add(ind); indSync();
      X.line('יישור אחרון: לחיצה על האבן · היעד שתי אצבעות פנימה מהקו, בלי סימון');
      X.hand({ x: o.m.position.x, y: o.m.position.y, z: o.m.position.z }, 0, 10);
      A.busy = false;
    }
    const err = () => A.off - target;
    function indSync() {
      if (!ind || !set) return; const e = err(); const p = F.at(W / 2, F.d + A.off + (e > 0 ? 0.6 : 1.4), F.h + 0.9); ind.position.set(p.x, p.y, p.z);
      const dir = e > 0 ? -1 : 1, yaw = Math.atan2(F.nx * dir, F.nz * dir); ind.quaternion.setFromEuler(new T3.Euler(Math.PI / 2, yaw, 0, 'YXZ'));
      const k = clamp(Math.abs(e) / 0.5, 0.35, 1.2); ind.scale.set(k, k, k); ind.material.color.setHex(Math.abs(e) <= 0.1 ? 0xFFD66E : 0xE0563E);
    }
    async function breakIt() {
      A.busy = true; A.breaks++;
      const c = set.m.position, at = { x: c.x, y: c.y + F.h, z: c.z };
      try { PR.chunksAt({ x: c.x + F.nx, y: c.y - F.h / 2, z: c.z + F.nz, r: 0.8 }, 5); } catch (e) { /* */ }
      X.dust(c.x, c.y, c.z, 18, 1.6); X.shake(0.3, 0.5); X.loss(20, at, 'הפינה נשברה · אבן הסגירה נפסלה', 1);
      if (crack) { PR.remove(crack); crack = null; }
      X.line('מורידים אותה ומביאים אבן שלמה מהמחצבה');
      const y0 = set.m.position.y; for (let k = 1; k <= 16; k++) { await sleep(45); set.m.position.y = y0 + ease(k / 16) * 5; }
      A.off = 0.38; A.hard = 0; A.taps = 0; A.cracked = false;
      for (let k = 1; k <= 16; k++) { await sleep(45); placeAt(set, A.off, (1 - ease(k / 16)) * 5); }
      X.play('settle'); indSync(); X.line('מיישרים את החדשה'); A.busy = false;
    }
    function strike(hold) {
      const push = (0.03 + clamp(hold, 0, 0.9) * 0.8) * (wet ? 1.2 : 1), hard = hold >= 0.42, e0 = err(), dir = e0 > 0 ? -1 : 1;
      A.taps++; A.off += dir * push;
      try { X.hero.act('tamp', { x: set.m.position.x, y: set.m.position.y + F.h / 2, z: set.m.position.z }, { snap: true }); } catch (e) { /* */ }
      X.play(hard ? 'strike' : 'chip'); X.dust(set.m.position.x + F.nx * 0.8, set.m.position.y, set.m.position.z + F.nz * 0.8, hard ? 7 : 3, 0.8);
      placeAt(set, A.off); indSync();
      const at = { x: set.m.position.x, y: set.m.position.y + F.h, z: set.m.position.z };
      if (hard) {
        A.hard++;
        if (A.hard === 2) { X.play('crack'); X.word(at, 'סדק דק! עוד מכה חזקה והפינה תישבר'); crack = new T3.Mesh(PR.geo.box, PR.M.seam); const p = F.at(W * 0.3, F.d + A.off, F.h * 0.5); crack.scale.set(0.05, F.h * 0.75, 0.05); crack.position.set(p.x, p.y, p.z); crack.rotation.set(0, F.yaw, 0.4); PR.root.add(crack); A.cracked = true; }
        if (A.hard >= 3) { breakIt(); return; }
      }
      const e = err();
      if (Math.sign(e) !== Math.sign(e0) && Math.abs(e) > 0.1) X.word(at, 'עבר את הקו · מחזירים מהצד השני');
      if (Math.abs(e) <= 0.1) finish(Math.abs(e) <= 0.04);
    }
    async function finish(goldAlign) {
      A.done = true; X.hand(null); X.meter(null); if (ind) ind.visible = false;
      const at = { x: set.m.position.x, y: set.m.position.y + F.h + 1.4, z: set.m.position.z };
      X.hit(at, goldAlign && !A.cracked ? 'gold' : 'good', { text: 'הטבעת נסגרה!', craft: 'בנאים' });
      X.play('tier'); X.shake(0.4, 0.8); X.dust(at.x, F.y + F.h, at.z, 30, 4);
      if (!A.wrong && !A.breaks && !A.cracked) X.bonus(200, 'closing', 'אבן הסגירה, בלי טעות');
      // kept: the last stone of the ring
      const st = X.M.st; const c = set.m.position; st.closing = { done: 1, x: +c.x.toFixed(3), y: +c.y.toFixed(3), z: +c.z.toFixed(3), w: set.L, h: F.h, d: F.d, yaw: F.yaw };
      SH2.closeM = set.m; X.save();
      const q = (goldAlign ? 1 : 0.85) * (A.wrong ? Math.max(0.6, 1 - A.wrong * 0.12) : 1) * (A.breaks ? 0.7 : 1) * (A.cracked ? 0.85 : 1);
      await sleep(1100);
      X.end({ q, stars: starsOf(q), at });
    }
    return {
      close: true,
      begin() {
        shot(); const sp = F.at(-2.2, -2.6, 0); try { X.hero.setPos(sp.x, sp.z, Math.atan2(F.at(W / 2, 0).x - sp.x, F.at(W / 2, 0).z - sp.z)); } catch (e) { /* */ }
        X.line('בחרו את אבן הסגירה: גררו אותה לרווח · הקשה מסובבת אותה');
        const o = stones[0]; const s0 = X.scr(o.at.x, o.at.y, o.at.z), g = F.at(W / 2, 0, F.h), s1 = X.scr(g.x, g.y, g.z); X.hand(o.at, (s1.x - s0.x) * 0.5, (s1.y - s0.y) * 0.5);
      },
      update(dt) {
        A.t += dt;
        if (A.press) { const k = clamp((A.t - A.press) / 0.9, 0, 1); X.meter({ x: set.m.position.x, y: set.m.position.y + F.h * 1.2, z: set.m.position.z }, k); }
        if (A.held && A.held.g) {
          const g = A.held.g; const o = A.held.o; o.m.position.set(g.q.x, F.y + F.h + 1.4, g.q.z);
          if (g.in) { const c = F.at(W / 2, F.d / 2, F.h + 0.06); ghost.position.set(c.x, c.y, c.z); ghost.rotation.set(-Math.PI / 2, 0, F.yaw); ghost.scale.set(W, F.d, 1); ghost.material.color.setHex(o.ok && !o.rot ? 0xFFD66E : 0xE0563E); ghost.visible = true; } else ghost.visible = false;
        }
      },
      down(p) {
        if (A.done || A.busy) return;
        if (A.phase === 'plumb') { const h = X.rayAt(p.x, p.y).intersectObject(set.m, false); if (h.length) { A.press = A.t; X.hand(null); } return; }
        const o = pick(p); A.tap0 = { x: p.x, y: p.y, o };
      },
      move(p) {
        if (A.phase !== 'choose' || A.done || A.busy || !A.tap0) return;
        if (!A.held && A.tap0.o && Math.hypot(p.x - A.tap0.x, p.y - A.tap0.y) > 10) { A.held = { o: A.tap0.o, g: null }; X.play('rope'); X.hand(null); }
        if (A.held) { const g = inGap(p.x, p.y); if (g) A.held.g = g; }
      },
      up() {
        if (A.phase === 'plumb') { const pr = A.press; A.press = null; X.meter(null); if (pr == null || A.done || A.busy) return; strike(A.t - pr); return; }
        const t0 = A.tap0; A.tap0 = null; if (A.done || A.busy) return;
        if (!A.held) {
          if (t0 && t0.o) { const o = t0.o; o.rot = 1 - o.rot; home(o); X.play('stamp'); X.line(o.rot ? 'לרוחב' : 'לאורך החומה'); }
          return;
        }
        const { o, g } = A.held; A.held = null; ghost.visible = false;
        if (!g || !g.in) { home(o); return; }
        const at = F.at(W / 2, 0, F.h + 1.6);
        let why = '';
        if (o.rot) why = 'לרוחב היא לא נכנסת: הרווח לאורך החומה · הקישו כדי לסובב';
        else if (o.L < W - 0.2) why = 'קצרה מדי: יישאר רווח בטבעת';
        else if (o.L > W + 0.2) why = 'ארוכה מדי: היא לא נכנסת ברווח';
        else if (o.chip) why = 'לאבן הזאת שבורה פינה: אבן הסגירה צריכה להיות שלמה';
        if (why) { A.wrong++; X.word(at, why); X.play('thud'); home(o); return; }
        for (const s of stones) if (s !== o) s.m.visible = false;
        seat(o);
      },
      end() {
        for (const o of [ghost, rod, str, bob, ind, crack]) if (o) PR.remove(o);
        for (const s of stones) if (s !== set || !A.done) PR.remove(s.m);
        try { X.stages.craneOff(false); } catch (e) { /* */ }
        for (const w of crew) SH2.crew.remove(w);
      },
      at() { return F.at(W / 2, 0, F.h + 1); },
      dbg() {
        const sc = (o) => { const r = X.scr(o.x, o.y, o.z); return [Math.round(r.x), Math.round(r.y)]; };
        return { phase: A.phase, done: A.done, busy: A.busy, wrong: A.wrong, err: +err().toFixed(3), hard: A.hard, breaks: A.breaks, W,
          stones: stones.map((o) => ({ L: o.L, ok: !!o.ok, chip: !!o.chip, rot: o.rot, scr: sc(o.m.position) })), gap: sc(F.at(W / 2, 0, F.h)), set: set ? sc(set.m.position) : null };
      },
    };
  },
};
/** the closing stone's frame: O at the gap's start on the stone's own line (across 0 = the stone's inner face), n outward */
function closeFrame(X) {
  const s = closingSlot(X), nx = s.n[0], nz = s.n[1], ux = -nz, uz = nx;   // u: so that from inside the court the gap runs right
  const d = s.d || 1.96, w = s.w, h = s.h || H, y = s.y - h / 2;
  // the stone's centre is s.(x, z); its inner face at centre − n·d/2
  const O = { x: s.x - ux * (w / 2) - nx * (d / 2), z: s.z - uz * (w / 2) - nz * (d / 2) };
  const F = { w, h, d, y, nx, nz, ux, uz, O };
  F.at = (along, across = 0, dy = 0) => ({ x: O.x + ux * along + nx * across, y: y + dy, z: O.z + uz * along + nz * across });
  F.local = (x, z) => { const dx = x - O.x, dz = z - O.z; return { along: dx * ux + dz * uz, across: dx * nx + dz * nz }; };
  F.yaw = Math.atan2(-uz, ux);
  return F;
}
void STRETCH; void GIANT; void frameOf;
