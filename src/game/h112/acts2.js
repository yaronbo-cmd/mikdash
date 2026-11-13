/* ── build 112 ── h112/acts2.js — stations 4 and 5 of stage 03 (spec "המשחקונים, תחנה אחרי תחנה"):
 *   4 the steps: a step stone against the wooden L-gauge (half an amah up, half an amah in): drag it on its bed to the gauge's arm,
 *     tap it to bed it down in the fill; over the lower step's edge it tips and breaks (−20); too low, the crew lifts it and adds earth.
 *   5 the ring's closing bay: the drift of his posts (station 1) left it narrow or wide; the rod measures it; choose the slab that fits,
 *     or drag one to the stone-cutter's bench (10 s, a low score); a slab too wide pressed in by force cracks (−20).
 * Same act contract as acts.js.
 */
import { H112, RUNS, LINE, STEPS, stepOf, STEPS_OF, closingOf, fingers, halfW, starsOf, runPosts } from './model.js';
import { SH3, bayFrame, runBuild, stepsBuild, stepStone, latticeSlab, label, keep, bayKeep } from './world.js';
import { createHoist } from './hoist.js';
import { craneFor, candAt, bayShot, standBay } from './acts.js';
import { BOOK } from '../world/grid.js';   // (build 126: the places are the book's)
import { clamp, lerp, ease, onPlane } from '../h109/kit.js';
import { gripR, bigR, nearSeg, nearObjs } from '../h109/grips.js';   // (build 125)

const rnd = (k) => { const v = Math.sin(k * 12.9898 + 4.1) * 43758.5453; return v - Math.floor(v); };
const sc = (X, o) => { const r = X.scr(o.x, o.y, o.z); return [Math.round(r.x), Math.round(r.y)]; };
const heroAt = (X, x, z, fx, fz) => { try { X.hero.setPos(x, z, Math.atan2(fx - x, fz - z)); } catch (e) { /* */ } };

/* ───────── 4. the steps ───────── */
const ZC = (STEPS.z0 + STEPS.z1) / 2, ZG = 3.0;   // (the gauge stands near the flight's south end, on the camera's side)
/** the stones of this mission: the level's four, from where the save has got to */
function stonesOf(m, st) { const L = STEPS_OF[m.lv], n = (st.steps && st.steps.n) | 0, todo = L.filter((k) => k > n); return todo.length ? todo : L.slice(); }
/** where the kohen stands for stone k: on the bed behind it (he pushes it out, or pulls it in), or on the Chel's floor for the top two */
function stepStand(k) { const s = stepOf(k), [xT, zS] = BOOK.s03.stepStand; const x = k >= 11 ? xT : Math.max(STEPS.x0 + 0.25, s.face - s.D - (k <= 8 ? 1.05 : 0.45)); return { x, z: zS, face: [x + 4, zS] }; }

export const STEPS_ACT = {
  icon: '🪜', title: 'המעלות',
  walkLine: (m) => `ציר המזרח: מעלות ${STEPS_OF[m.lv][0]}–${STEPS_OF[m.lv][3]}`,
  stand(m, X) { return stepStand(stonesOf(m, X.M.st)[0]); },
  prepare(m, X) { SH3.crane.g.visible = false; try { SH3.crane.rope.show(false); } catch (e) { /* */ } },
  make(m, X) {
    const lv = X.level(), st = X.M.st, PR = X.props, T = X.THREE;
    SH3.busy = 1; SH3.camD = 24;
    const ks = stonesOf(m, st), gauge = lv < 3, marks = lv === 1;
    if (!st.steps) st.steps = { n: 0, h: [] };
    const A = { i: -1, K: null, done: false, busy: false, t: 0, press: null, idle: 0, hinted: 0, falls: 0, lows: 0, qs: [], crew: [], gauge: null };
    const W = STEPS.z1 - STEPS.z0;
    keep(X, [[STEPS.x0 - 2, STEPS.z0 - 2.2, BOOK.s03.stepsKeep, STEPS.z1 + 24]]);
    // the crew: two at the stone's ends (they slide it on its bed), one ramming the fill behind (spec "הצוותים": no idle figure)
    function crewFor(K) {
      for (const w of A.crew) SH3.crew.remove(w); A.crew = [];
      const s = K.s, x = s.face - s.D / 2;
      for (const z of [STEPS.z0 - 0.8, STEPS.z1 + 0.8]) A.crew.push(SH3.crew.add(x, z, { role: 'push', fx: x, fz: ZC, crew: 1 }));
      A.crew.push(SH3.crew.add(STEPS.x0 + 1.2, STEPS.z1 + 2.6, { role: 'hammer', item: 'mallet', fx: STEPS.x0 + 1.2, fz: STEPS.z1 + 0.5, off: 0.3, crew: 3 }));
    }
    function gaugeFor(K) {
      if (A.gauge) PR.remove(A.gauge); A.gauge = null; if (!gauge) return;
      // the wooden L on the lower tread: its foot half an amah long, its arm half an amah high at the new step's face (spec 4)
      const s = K.s, y0 = s.bed, g = new T.Group(), wd = PR.M.wood || PR.M.woodD;
      const foot = new T.Mesh(PR.geo.box, wd); foot.scale.set(0.56, 0.06, 0.14); foot.position.set(s.face + 0.28, y0 + 0.03, 0); g.add(foot);
      const arm = new T.Mesh(PR.geo.box, wd); arm.scale.set(0.06, H112.STEP, 0.14); arm.position.set(s.face + 0.03, y0 + H112.STEP / 2, 0); g.add(arm);
      const brace = new T.Mesh(PR.geo.box, wd); brace.scale.set(0.05, 0.36, 0.1); brace.position.set(s.face + 0.2, y0 + 0.2, 0); brace.rotation.z = 0.78; g.add(brace);
      if (marks) {
        // level 1: its marks, a red notch at half an amah up and the arm's foot chalked (they go from level 2: "התבנית בלי סימנים")
        const r = new T.Mesh(PR.geo.box, PR.M.redc); r.scale.set(0.09, 0.03, 0.17); r.position.set(s.face + 0.03, y0 + H112.STEP - 0.015, 0); g.add(r);
        const c = new T.Mesh(PR.geo.box, PR.M.chalk); c.scale.set(0.03, 0.065, 0.17); c.position.set(s.face + 0.5, y0 + 0.035, 0); g.add(c);
      }
      g.position.z = ZG; PR.root.add(g); A.gauge = g;
    }
    /** the stone as it lies: dx (+ out, to the Mount), h (+ high) */
    function place(K) { const s = K.s; K.m.position.set(s.face - s.D / 2 + K.dx, s.top - H112.STEP / 2 + K.h, ZC); }
    const inLim = (K) => STEPS.x0 + K.s.D - K.s.face + 0.002;    // (its back against the Chel's core)
    const outLim = (K) => (gauge ? 0 : K.k === 1 ? 0.6 : 2);     // (the gauge's arm stops it; without it, the edge)
    function shot(K) {
      // from the side, low (spec "מעלות: מהצד, נמוכה, המדרגות עולות אל החומה"): the flight rises to the left, to the wall
      const s = K.s; X.shot([s.face + 4.6, s.top + 2.3, STEPS.z1 + 6.2], [s.face - 0.9, s.top - 0.15, ZC], 1.0);
    }
    async function bring() {
      A.i++; if (A.i >= ks.length) { finish(); return; }
      const k = ks[A.i], s = stepOf(k);
      A.busy = true;
      stepsBuild(X, { n: k - 1 });
      const fromIn = k <= 8;
      const K = { k, s, dx: 0, h: 0, soft: 0.8 + 0.45 * rnd(k * 3.1), taps: 0, m: stepStone(X, k), fromIn, retake: 0 };
      // the start: behind it on the bed (levels 1–2) or overhanging the lower tread, from the crews' rollers (level 3: no room behind)
      K.dx = fromIn ? Math.max(inLim(K) + 0.05, -(0.36 + 0.22 * rnd(k * 1.7))) : 0.26 + 0.14 * rnd(k * 2.3);
      if (k >= 11) K.dx = 0.24 + 0.14 * rnd(k * 2.3);
      K.h = 0.07 + 0.05 * rnd(k * 5.3);
      A.K = K; A.idle = 0; A.hinted = 0;
      crewFor(K); gaugeFor(K); shot(K);
      const sp = stepStand(k); heroAt(X, sp.x, sp.z, sp.face[0], sp.face[1]);
      // the crew slides it in from where it came
      const dx1 = K.dx; K.dx = fromIn ? dx1 - 0.9 : dx1 + 0.9; K.m.visible = true; place(K);
      for (let i = 1; i <= 14; i++) { await X.wait(0.04); K.dx = lerp(fromIn ? dx1 - 0.9 : dx1 + 0.9, dx1, ease(i / 14)); place(K); }
      K.dx = dx1; place(K); X.play('thud'); X.dust(s.face - s.D / 2 + K.dx, s.bed + 0.1, STEPS.z1, 6, 1);
      A.busy = false;
      X.line(k === 12 ? 'האחרונה: בדיוק בגובה רצפת החיל' : lv === 1 ? 'גררו לזרוע · הקישו עד הסימן' : lv === 2 ? 'התבנית בלי סימן: עד ראש הזרוע' : 'בלי תבנית: חצי אמה פנימה, חצי אמה למעלה');
      const p = { x: s.face - s.D / 2 + K.dx, y: s.top + K.h + 0.2, z: ZC + 1.5 }; X.hand(p, K.dx < 0 ? 52 : -52, 0);
    }
    function pxPer(K) { const s = K.s, a = X.scr(s.face, s.top, ZC + 2), b = X.scr(s.face + 0.5, s.top, ZC + 2); return (b.x - a.x) / 0.5 || 60; }
    function onStone(p) { const K = A.K; if (!K || !K.m) return false; return X.rayAt(p.x, p.y).intersectObject(K.m, false).length > 0; }
    async function tamp() {
      const K = A.K; if (!K || A.busy) return;
      // each blow beds it a little in the fill, less as the fill packs (spec 4: "כל הקשה משקעת אותה מעט")
      const sink = K.soft * 0.05 * Math.pow(0.72, K.taps); K.taps++; K.h -= sink; place(K);
      const s = K.s, at = { x: s.face - s.D / 2 + K.dx, y: s.top + K.h, z: ZC - 1.4 };
      try { X.hero.act('tamp', at, { snap: true }); } catch (e) { /* */ }
      X.play('stamp'); X.dust(at.x, s.bed + 0.05, STEPS.z1, 4, 0.8); X.shake(0.04, 0.08);
      A.idle = 0; A.hinted = 0;
      if (K.h < -0.03) {
        // too low: the crew lifts it on bars and throws earth under it (no damage; spec 4)
        A.busy = true; A.lows++; K.retake++;
        X.word({ x: at.x, y: s.top + 1.2, z: ZC }, 'נמוכה מדי: מוסיפים עפר');
        for (const w of A.crew) SH3.crew.setRole(w, 'lever', { item: null });
        await X.wait(0.6);
        const h0 = K.h, h1 = 0.05 + 0.02 * rnd(K.k + K.retake);
        for (let i = 1; i <= 10; i++) { await X.wait(0.04); K.h = lerp(h0, h1, i / 10); place(K); }
        K.taps = 0; for (const w of A.crew) SH3.crew.setRole(w, 'push');
        X.dust(at.x, s.bed + 0.1, STEPS.z1, 8, 1); A.busy = false;
      }
    }
    async function tip() {
      // over the lower step's edge: it tips, falls and breaks on the step below (−20, a stone off the stock: spec "הניקוד בהפסד")
      const K = A.K; if (!K || A.busy) return; A.busy = true; A.falls++; A.press = null; X.hand(null);
      const s = K.s, x0 = K.m.position.x, y0 = K.m.position.y, lowTop = Math.max(0, s.bed - H112.STEP);
      for (let i = 1; i <= 16; i++) { await X.wait(0.035); const u = i / 16; K.m.position.x = x0 + 0.9 * u; K.m.position.y = lerp(y0, lowTop + 0.25, u * u); K.m.rotation.z = -1.35 * u * u; }
      X.play('crash'); X.shake(0.35, 0.45);
      const at = { x: K.m.position.x, y: K.m.position.y + 0.5, z: ZC };
      try { PR.chunksAt({ x: at.x, y: at.y, z: ZC + 2.5, r: 0.8 }, 6); PR.chunksAt({ x: at.x, y: at.y, z: ZC - 2.5, r: 0.8 }, 6); } catch (e) { /* */ }
      X.dust(at.x, at.y, ZC, 30, 3.2);
      X.loss(20, at, 'האבן עברה את השפה, נפלה ונשברה', 1);
      await X.wait(1.0); PR.remove(K.m); A.K = null;
      X.line('אבן אחרת · לא מעבר לשפה');
      await X.wait(0.6);
      A.i--; A.busy = false; bring();
    }
    async function accept() {
      const K = A.K; if (!K || A.busy) return; A.busy = true; X.hand(null);
      const s = K.s, ad = Math.abs(K.dx), ah = Math.abs(K.h);
      const qd = ad <= 0.04 ? 1 : ad <= 0.1 ? 0.8 : 0.5, qh = ah <= 0.012 ? 1 : ah <= 0.03 ? 0.8 : 0.5;
      const q = qd * qh * Math.pow(0.92, K.retake), grade = qd === 1 && qh === 1 ? 'gold' : Math.min(qd, qh) >= 0.8 ? 'good' : 'ok';
      A.qs.push(q);
      X.play('settle'); X.dust(s.face - s.D / 2 + K.dx, s.top, STEPS.z1, 10, 1.2);
      X.hit({ x: s.face - s.D / 2 + K.dx, y: s.top + 1.1, z: ZC + 1.5 }, grade, { text: K.k === 12 ? 'פוגשת את החיל!' : grade === 'gold' ? 'חצי אמה!' : '', craft: 'בנאים' });
      // the save: the stone as laid (its height error stays visible in the flight)
      while (st.steps.h.length < K.k) st.steps.h.push(0);
      st.steps.h[K.k - 1] = +clamp(K.h, -0.03, 0.04).toFixed(3); st.steps.n = Math.max(st.steps.n | 0, K.k); X.save();
      await X.wait(0.9);
      PR.remove(K.m); A.K = null; stepsBuild(X, { n: K.k });
      // he steps up onto it (spec "כל מדרגה נוספת מרימה את הכהן מעט")
      try { const x = Math.max(STEPS.x0 + 0.2, s.face - 0.3); X.hero.walkTo({ x, z: -2.6, face: [x + 4, -2.6] }); } catch (e) { /* */ }
      await X.wait(0.7);
      A.busy = false; bring();
    }
    async function finish() {
      A.done = true; X.hand(null); X.line('');
      for (const w of A.crew) SH3.crew.remove(w); A.crew = []; if (A.gauge) { PR.remove(A.gauge); A.gauge = null; }
      const top = stepOf(ks[ks.length - 1]).top;
      { const [SE, ST] = BOOK.s03.cam.steps; X.shot([SE[0], top + 6, SE[1]], [ST[0], top * 0.6, ST[1]], 1.4); }
      const q = (A.qs.reduce((a, b) => a + b, 0) / Math.max(1, A.qs.length)) * Math.pow(0.7, A.falls);
      if (!A.falls && !A.lows && A.qs.every((x) => x >= 1)) X.bonus(100, 'steps', 'כל המעלות במידה');
      await X.wait(1.5);
      X.end({ q, stars: starsOf(q), at: { x: BOOK.s03.flight[0], y: top + 1.5, z: BOOK.s03.flight[1] } });
    }
    return {
      begin() { bring(); },
      update(dt) {
        A.t += dt; const K = A.K; if (!K || A.busy || A.done) return;
        const P = A.press;
        if (P && P.moved) {
          // the stone follows with a heavy lag (rule 21); the gauge's arm or the Chel's core stops it
          const want = clamp(P.dx0 + (P.x - P.x0) / P.px, inLim(K), outLim(K));
          K.dx += (want - K.dx) * Math.min(1, dt * 6); place(K);
          if (!gauge && K.k > 1 && K.dx > 0.5) tip();
          return;
        }
        if (P) return;
        A.idle += dt;
        // let go a moment: the crew judges it (no button: rule 20)
        if (A.idle > 1.3) {
          const okD = Math.abs(K.dx) <= (gauge ? 0.12 : 0.15), okH = K.h <= 0.04 && K.h >= -0.03;
          if (okD && okH) { accept(); return; }
          if (A.idle > 2.6 && !A.hinted) {
            A.hinted = 1;
            X.line(!okD ? (gauge ? 'עוד לא נוגעת בזרוע: גררו' : 'עומק: השוו למדרגה שמתחת') : 'עדיין גבוהה: הקישו עליה');
          }
        }
      },
      down(p) {
        if (A.done || A.busy || !A.K) return;
        A.press = { x0: p.x, x: p.x, y0: p.y, dx0: A.K.dx, px: pxPer(A.K), moved: false, on: onStone(p) };
        A.idle = 0; X.hand(null);
      },
      move(p) { const P = A.press; if (!P) return; P.x = p.x; if (!P.moved && Math.abs(p.x - P.x0) > 9) P.moved = true; },
      // (build 125: the step stone in the crew's hands is the act's on the right half; the rest is the look)
      wants(p) { if (A.done || A.busy || !A.K) return false; return !!A.K.m && nearObjs(X, p, [A.K.m]); },
      up(p) {
        const P = A.press; A.press = null; if (!P || A.done || A.busy || !A.K) return;
        A.idle = 0;
        if (P.moved) {
          // (where the finger left it: the crew finishes the slide)
          const K = A.K; K.dx = clamp(P.dx0 + (p.x - P.x0) / P.px, inLim(K), outLim(K)); place(K);
          if (!gauge && K.k > 1 && K.dx > 0.5) tip();
          return;
        }
        if (P.on && Math.hypot(p.x - P.x0, p.y - P.y0) < 12) tamp();
      },
      end() {
        for (const w of A.crew) SH3.crew.remove(w); if (A.gauge) PR.remove(A.gauge); if (A.K && A.K.m) PR.remove(A.K.m);
        keep(X, []); SH3.busy = 0; stepsBuild(X);
      },
      at() { const K = A.K; return K ? { x: K.s.face, y: K.s.top + 1, z: 0 } : { x: BOOK.s03.flight[0], y: 3, z: BOOK.s03.flight[1] }; },
      dbg() {
        const K = A.K;
        return { lv, done: A.done, busy: A.busy, i: A.i, ks, falls: A.falls, lows: A.lows, gauge,
          k: K ? K.k : null, dx: K ? +K.dx.toFixed(3) : null, h: K ? +K.h.toFixed(3) : null, px: K ? +pxPer(K).toFixed(1) : null, idle: +A.idle.toFixed(2),
          scr: K ? sc(X, { x: K.s.face - K.s.D / 2 + K.dx, y: K.s.top + K.h, z: ZC + 2 }) : null };
      },
    };
  },
};

/* ───────── 5. the ring's closing bay ───────── */
const closeFrame = (m, X) => { const [a, b] = RUNS[m.lv].close; return bayFrame(m.lv, a, b, runPosts(m.lv, X.M.st)); };
const FIT = { wide: 0.03, gold: -0.05, good: -0.1 };   // (w − need: a slab wider than the bay by more than its play does not go in)
export const CLOSE = {
  icon: '◫', title: 'סגירת הטבעת',
  walkLine: (m) => `${RUNS[m.lv].where}: המפרץ האחרון`,
  stand(m, X) { return standBay(closeFrame(m, X)); },
  prepare(m, X) { craneFor(X, closeFrame(m, X)); },
  make(m, X) {
    const lv = X.level(), R = RUNS[m.lv], st = X.M.st, PR = X.props, T = X.THREE;
    SH3.busy = 1; SH3.camD = 24;
    runBuild(X, m.lv, { close: true });
    const C = closingOf(m.lv, st), F = closeFrame(m, X), need = C.need;
    const marks = lv === 1, digits = lv < 3, windy = lv >= 3 || C.wind;
    keep(X, [bayKeep(F)]);
    const A = { phase: 'measure', rod: null, tip: 0, read: 0, measured: false, cands: [], held: null, H: null, done: false, busy: false, t: 0, cracks: 0, chips: 0, cut: 0, tries: 0, crew: [], bench: null, drag: null, press: null, labs: [] };
    // the bay's geometry along u (from post A's centre): its faces, the rod's start in A's groove
    const fa = halfW(F.A), fb = F.L - halfW(F.B), rod0 = fa - H112.GROOVE;
    const readOf = (tip) => tip - fa + 2 * H112.GROOVE;    // (the rod reads groove to groove: the slab's width)
    /* the rod: a cubit-staff with finger ticks (level 1), plain digits (level 2), bare (level 3) */
    function rodMake() {
      const g = new T.Group(), body = new T.Mesh(PR.geo.box, PR.M.wood || PR.M.woodD); body.scale.set(1, 0.07, 0.09); g.add(body); g.userData.body = body;
      if (marks) {
        for (let f = 6; f <= 84; f += 6) { const t = new T.Mesh(PR.geo.box, PR.M.seam); t.scale.set(0.015, 0.075, f % 24 === 0 ? 0.1 : 0.06); t.position.set(f / 24, 0.005, 0); t.userData.f = f; g.add(t); }
        const nm = new T.Mesh(PR.geo.box, PR.M.redc); nm.scale.set(0.03, 0.08, 0.11); nm.position.set(C.nominal - H112.GROOVE, 0.006, 0); g.add(nm);
      }
      g.rotation.y = F.yaw; PR.root.add(g); return g;
    }
    function rodSet(tip) {
      A.tip = tip; const g = A.rod, len = Math.max(0.1, tip - rod0), b = g.userData.body;
      const p = F.at(rod0, -0.05, H112.SILL + 0.05); g.position.set(p.x, p.y, p.z);
      b.scale.x = len; b.position.x = len / 2;
      for (const c of g.children) if (c.userData.f) c.visible = c.userData.f / 24 <= len;
      A.read = readOf(tip);
      if (A.rl) { const q = F.at(tip, 0, H112.SILL + 0.45); A.rl.set(digits ? `${fingers(A.read)} אצבעות` : 'המוט', q); }
    }
    /* the slabs on their stands beside the bay (the ox-cart brought them), and the stone-cutter's bench past them */
    function standSlab(c) {
      c.g.position.set(c.home.x, X.ground(c.home.x, c.home.z) + H112.SLAB_H / 2 + 0.04, c.home.z); c.g.rotation.set(0, F.yaw, 0); c.g.visible = true;
      const s = c.g.userData.slab; s.rotation.set(0, 0, 0);
    }
    function slabLabel(c) {
      if (!c.lab) c.lab = label(X);
      const at = { x: c.home.x, y: H112.SLAB_H + 0.55, z: c.home.z };
      if (digits) c.lab.set(c.cut ? 'לפי המידה' : `${fingers(c.w)} אצבעות`, at);
      // level 3: no numbers; the crew holds his rod against each (as he set it: a careless rod tells a wrong tale)
      else if (!A.measured) c.lab.set('', at);
      else { const d = c.w - A.read; c.lab.set(c.cut ? 'לפי המידה' : Math.abs(d) <= 0.03 ? 'כמו המוט' : d < 0 ? 'קצר מהמוט' : 'ארוך מהמוט', at); }
    }
    function makeCands() {
      for (const c of A.cands) { PR.remove(c.g); if (c.lab) c.lab.remove(); } A.cands = [];
      // their order on the stands: not by size (the eye must read them)
      const ws = C.cart.slice(), ord = [0, 1, 2].sort((a, b) => rnd(a * 7 + m.lv * 3) - rnd(b * 7 + m.lv * 3));
      ord.forEach((wi, k) => {
        const w = ws[wi], g = latticeSlab(X, { type: R.pattern, s0: F.s0, W: w, outer: F.ns, shift: 0 });
        const c = { w, g, k, home: candAt(F, k, 3), cut: 0, lab: null }; standSlab(c); slabLabel(c); A.cands.push(c);
      });
    }
    function benchMake() {
      const g = new T.Group(), wd = PR.M.wood || PR.M.woodD, wdd = PR.M.woodD || wd;
      const top = new T.Mesh(PR.geo.box, wd); top.scale.set(3.4, 0.16, 1.1); top.position.y = 0.82; g.add(top);
      for (const sx of [-1.5, 1.5]) for (const sz of [-0.42, 0.42]) { const l = new T.Mesh(PR.geo.box, wdd); l.scale.set(0.14, 0.8, 0.14); l.position.set(sx, 0.4, sz); g.add(l); }
      // (between the kohen and the crane, on the Mount's side: in frame)
      const x = F.cx - F.ux * (F.W / 2 + 2.6) + F.nx * 5.0, z = F.cz - F.uz * (F.W / 2 + 2.6) + F.nz * 5.0;
      g.position.set(x, X.ground(x, z), z); g.rotation.y = F.yaw; PR.root.add(g);
      A.crew.push(SH3.crew.add(x + F.nx * 1.3, z + F.nz * 1.3, { role: 'hammer', item: 'chisel', fx: x, fz: z, k: 1, crew: 3 }));
      A.bench = { g, x, z, y: X.ground(x, z) + 0.9 };
    }
    function crewAt() {
      const b = SH3.crane.base;
      A.crew.push(SH3.crew.add(b.x + F.ux * 1.6, b.z + F.uz * 1.6, { role: 'pull', item: 'rope', fx: F.cx, fz: F.cz, crew: 1 }));
      A.crew.push(SH3.crew.add(F.cx + F.nx * 2.0 - F.ux * (F.W / 2 + 1.7), F.cz + F.nz * 2.0 - F.uz * (F.W / 2 + 1.7), { role: 'hold', item: 'rope', fx: F.cx, fz: F.cz, crew: 2 }));
    }
    async function choose(c) {
      if (A.busy) return;
      if (!A.measured) { X.word({ x: F.cx, y: H112.POST_H + 1, z: F.cz }, 'קודם מודדים: גררו את קצה המוט'); return; }
      A.busy = true; X.hand(null); A.tries++;
      if (A.held && A.held !== c) { standSlab(A.held); A.H.release(); }
      A.held = c; A.phase = 'hang'; if (c.lab) c.lab.set('', null);
      // the crew lifts the rod off the sill and hooks the slab; the wheel lifts it over the bay
      A.rod.visible = false; if (A.rl) A.rl.set('', null);
      X.play('rope');
      const from = c.g.position.clone(), to = { x: F.cx, y: A.H.hang0 + H112.SLAB_H / 2, z: F.cz }, th0 = (rnd(A.tries + lv) > 0.5 ? 1 : -1) * (0.8 + 1.2 * rnd(A.tries * 3 + 1));
      for (let i = 1; i <= 22; i++) { await X.wait(0.04); const u = ease(i / 22); c.g.position.set(lerp(from.x, to.x, u), lerp(from.y, to.y, u) + Math.sin(u * Math.PI) * 1.2, lerp(from.z, to.z, u)); c.g.rotation.y = F.yaw + th0 * u; }
      A.H.hang(c.g, { th: th0 });
      bayShot(X, F); A.busy = false;
      X.line('גררו לסובב · החזיקו להוריד');
      X.hand({ x: F.cx, y: A.H.y + H112.SLAB_H / 2, z: F.cz }, 50, 0);
    }
    function backToStands(c) {
      A.H.release(); standSlab(c); A.held = null; A.phase = 'choose'; slabLabel(c);
      A.rod.visible = true; rodSet(A.tip); chooseShot();
    }
    /** the bay, the three slabs on their stands and the stone-cutter's bench: one wide shot */
    function chooseShot() { bayShot(X, F, { d: 19, h: 8, look: 3.5, side: 2.4, ty: 1.2 }); }
    async function onEvent(k, i) {
      const H = A.H, c = A.held, at = { x: F.cx, y: H112.POST_H + 1.2, z: F.cz };
      if (!c) return;
      if (k === 'gust-warn') { X.line('הדגלון מתנופף: משב בדרך!', 1600); return; }
      if (k === 'entry-miss') { X.word(at, c.w - need > FIT.wide ? 'רחב מדי: לא נכנס בין הניצבים' : 'לא בכיוון החריצים · סובבו'); return; }
      if (k === 'force' || k === 'gust-hit' || k === 'chip') {
        // real damage (spec 5): a slab too wide forced in cracks; (level 3) one let go in a gust smashes on a post; a hard landing chips
        if (k === 'force') { A.cracks++; X.loss(20, at, 'רחב מדי ונדחק בכוח: הלוח נסדק', 1); }
        else if (k === 'chip') { A.chips++; X.loss(20, at, 'נחיתה קשה: פינה נשברה', 1); }
        else { A.chips += 2; X.loss(40, at, 'המשב הטיח את הלוח בניצב: נשבר לשניים', 2); }
        X.shake(k === 'gust-hit' ? 0.45 : 0.22, 0.4); X.dust(c.g.position.x, H112.POST_H, c.g.position.z, 16, 1.6);
        try { PR.chunksAt({ x: c.g.position.x, y: c.g.position.y, z: c.g.position.z, r: 0.6 }, k === 'gust-hit' ? 7 : 3); } catch (e) { /* */ }
        H.busy = true; await X.wait(0.8); H.busy = false;
        // a new one of the same size from the cart (the broken one is off the stock)
        const g = latticeSlab(X, { type: R.pattern, s0: F.s0, W: c.w, outer: F.ns, shift: 0 }); PR.remove(c.g); c.g = g;
        backToStands(c);
        X.line(k === 'force' ? 'לוח אחר, או גררו לסתת' : 'לוח חדש · בעדינות בסוף');
        return;
      }
      if (k === 'seat') {
        if (i.mirrored) { X.word(at, 'הדוגמה הפוכה: סובבו חצי סיבוב'); X.play('thud'); await H.raise(2.6); return; }
        const d = c.w - need;
        const grade = c.cut ? 'ok' : d >= FIT.gold ? 'gold' : d >= FIT.good ? 'good' : 'ok';
        X.play('settle'); X.dust(F.cx, 0.3, F.cz, 12, F.W * 0.4); X.shake(0.08, 0.15);
        try { X.hero.act('tamp', { x: F.cx, y: 1.0, z: F.cz }, { snap: true }); } catch (e) { /* */ }
        X.hit({ x: F.cx, y: H112.SLAB_H + 1.0, z: F.cz }, grade, { text: d < FIT.good && !c.cut ? 'צר: נשאר רווח' : 'הטבעת נסגרה!', craft: 'בנאים' });
        if (d < FIT.good && !c.cut) X.line('הסתת ממלא את הרווח', 1800);
        A.grade = grade; H.release();
        st.close[m.lv] = { done: 1, w: +c.w.toFixed(3), cut: c.cut ? 1 : 0 }; X.save();
        await X.wait(1.0);
        finish();
      }
    }
    async function cutAt(c) {
      // the stone-cutter saws it to the bay (10 s, the crew works; spec 5: "10 במקום 40")
      A.busy = true; A.phase = 'cut'; X.hand(null);
      const B = A.bench; c.g.position.set(B.x, B.y + 0.1, B.z); c.g.rotation.set(-Math.PI / 2, F.yaw, 0, 'YXZ');
      if (c.lab) c.lab.set('', null);
      const sawer = SH3.crew.add(B.x - F.ux * 1.9 + F.nx * 0.3, B.z - F.uz * 1.9 + F.nz * 0.3, { role: 'push', item: 'saw', fx: B.x, fz: B.z, crew: 2 });
      X.line('הסתת מנסר למידה');
      for (let s = 10; s > 0; s--) { X.count({ x: B.x, y: B.y + 1.6, z: B.z }, String(s)); X.dust(B.x - F.ux * 1.2, B.y + 0.2, B.z - F.uz * 1.2, 3, 0.4); X.play('chisel'); await X.wait(1.0); }
      X.count(null); SH3.crew.remove(sawer);
      const g = latticeSlab(X, { type: R.pattern, s0: F.s0, W: need - 0.02, outer: F.ns, shift: 0 }); PR.remove(c.g); c.g = g; c.w = need - 0.02; c.cut = 1;
      standSlab(c); slabLabel(c); A.cut = 1; A.phase = 'choose'; A.busy = false;
      X.line('נוסר: הקישו לתלות');
    }
    async function finish() {
      A.done = true; X.hand(null); X.line('');
      for (const c of A.cands) { if (c !== A.held) PR.remove(c.g); if (c.lab) c.lab.remove(); }
      if (A.H) A.H.dispose(); SH3.crane.g.visible = false;
      const base = A.grade === 'gold' ? 1 : A.grade === 'good' ? 0.8 : 0.5;
      const q = (A.cut ? Math.min(0.35, base) : base) * Math.pow(0.7, A.cracks + A.chips);
      if (A.grade === 'gold' && !A.cut && !A.cracks && !A.chips) X.bonus(100, 'close', 'המפרץ נסגר במידה');
      // the pull-back: the soreg whole from end to end (spec 5: "המצלמה נמשכת לאחור")
      const a = R.posts[0], b = R.posts[R.posts.length - 1], mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2;
      X.shot([mx + 16, 12, mz + (m.lv === 2 ? 10 : -10)], [mx, 1, mz], 1.5);
      await X.wait(1.6);
      X.end({ q, stars: starsOf(q), at: { x: F.cx, y: 2.5, z: F.cz } });
    }
    function candAtP(p) {
      const objs = A.cands.filter((c) => c !== A.held && c.g.visible).map((c) => c.g);
      const hits = X.rayAt(p.x, p.y).intersectObjects(objs, true); if (!hits.length) return null;
      let ob = hits[0].object; while (ob && !A.cands.find((c) => c.g === ob)) ob = ob.parent; return A.cands.find((c) => c.g === ob) || null;
    }
    const along = (p) => { const q = onPlane(X, p.x, p.y, H112.SILL + 0.05); if (!q) return null; return (q.x - F.A.x) * F.ux + (q.z - F.A.z) * F.uz; };
    return {
      begin() {
        A.rod = rodMake(); A.rl = label(X); rodSet(fa + 0.7);
        makeCands(); benchMake(); crewAt();
        A.H = createHoist(X, { F, seatY: H112.SILL, entryY: H112.POST_H, tol: 0.12, vSafe: 0.85, wind: windy, crane: SH3.crane, onEvent, blockAtEntry: () => !!(A.held && A.held.w - need > FIT.wide) });
        bayShot(X, F, { d: 9, h: 4.6, look: 1.0, side: 3.4, ty: 1.0 }); const sp = standBay(F, -(F.W / 2 + 3.4), 0.8); heroAt(X, sp.x, sp.z, F.cx, F.cz);   // (past post A: the rod's start in the clear)
        X.line(digits ? 'גררו את המוט עד הניצב' : 'מוט בלי סימנים: גררו עד הניצב');
        X.hand(F.at(A.tip, 0, H112.SILL + 0.1), 60, 0);
      },
      update(dt) {
        A.t += dt; if (A.H) { A.H.tick(); A.H.update(dt); }
        const P = A.press;
        if (P && P.rod && P.moved) {
          // the rod's tip follows the finger along the bay (no stop: the eye puts it at the post's face)
          const a = along(P); if (a != null) rodSet(clamp(A.tip + (clamp(a, fa + 0.4, fb + 0.6) - A.tip) * Math.min(1, dt * 12), fa + 0.4, fb + 0.6));
        }
        if (P && P.drag && P.moved) {
          // a slab carried to the bench (rule 21: it lags)
          const q = onPlane(X, P.x, P.y, 0.9); if (q) { const g = P.drag.g; g.position.x += (q.x - g.position.x) * Math.min(1, dt * 8); g.position.z += (q.z - g.position.z) * Math.min(1, dt * 8); g.position.y = 1.4 + H112.SLAB_H / 2; }
        }
      },
      down(p) {
        if (A.done || A.busy) return;
        if (A.phase === 'measure' || A.phase === 'choose') {
          const c = candAtP(p);
          if (c) { A.press = { x0: p.x, y0: p.y, x: p.x, y: p.y, cand: c, moved: false }; return; }
          A.press = { x0: p.x, y0: p.y, x: p.x, y: p.y, rod: true, moved: false }; X.hand(null);
          return;
        }
        if (A.phase === 'hang' && A.H) { A.H.down(p); X.hand(null); }
      },
      // (build 125: measuring and choosing, the rod along the bay and the slabs lying by it; hanging, the slab on the rope — the rest is the look)
      wants(p) {
        if (A.done || A.busy) return false; if (!p) return true;
        if (A.phase === 'measure' || A.phase === 'choose') {
          if (candAtP(p) || nearObjs(X, p, A.cands.filter((c) => c !== A.held && c.g.visible).map((c) => c.g))) return true;
          return nearSeg(X, p, F.at(rod0, 0, H112.SILL), F.at(fb + 0.6, 0, H112.SILL), gripR());
        }
        if (A.phase === 'hang') return !!(A.H && A.H.g) && nearObjs(X, p, [A.H.g], bigR());
        return false;
      },
      move(p) {
        const P = A.press;
        if (P) {
          P.x = p.x; P.y = p.y;
          if (!P.moved && Math.hypot(p.x - P.x0, p.y - P.y0) > 12) { P.moved = true; if (P.cand && P.cand.g.visible) { P.drag = P.cand; X.line('אל ספסל הסתת: שחררו עליו'); } }
          return;
        }
        if (A.phase === 'hang' && A.H) A.H.move(p);
      },
      up(p) {
        const P = A.press; A.press = null;
        if (P) {
          if (P.rod) {
            if (P.moved) {
              const a = along(p); if (a != null) rodSet(clamp(a, fa + 0.4, fb + 0.6));
              A.measured = true; A.phase = 'choose';
              for (const c of A.cands) slabLabel(c);
              chooseShot();
              X.line(digits ? `${fingers(A.read)} אצבעות: הקישו על המתאים` : 'השוו למוט · הקישו על המתאים');
            }
            return;
          }
          if (P.drag) {
            const g = P.drag.g, B = A.bench, near = Math.hypot(g.position.x - B.x, g.position.z - B.z) < 2.6;
            if (near && !P.drag.cut) cutAt(P.drag); else { standSlab(P.drag); slabLabel(P.drag); }
            return;
          }
          if (P.cand && Math.hypot(p.x - P.x0, p.y - P.y0) < 14) choose(P.cand);
          return;
        }
        if (A.phase === 'hang' && A.H) {
          const r = A.H.up(p);
          void r;   // (another slab: a tap on it on its stand)
        }
      },
      end() {
        if (A.H) A.H.dispose(); for (const c of A.cands) { PR.remove(c.g); if (c.lab) c.lab.remove(); }
        if (A.rod) PR.remove(A.rod); if (A.rl) A.rl.remove(); if (A.bench) PR.remove(A.bench.g); X.count(null);
        for (const w of A.crew) SH3.crew.remove(w); SH3.crane.g.visible = false;
        keep(X, []); SH3.busy = 0; runBuild(X, m.lv);
      },
      at() { return { x: F.cx, y: 2.5, z: F.cz }; },
      dbg() {
        const H = A.H;
        return { lv, phase: A.phase, done: A.done, busy: A.busy, need, nominal: C.nominal, read: +A.read.toFixed(3), measured: A.measured, cracks: A.cracks, chips: A.chips, cut: A.cut,
          tip: sc(X, F.at(A.tip, 0, H112.SILL + 0.05)), tipTo: sc(X, F.at(fb, 0, H112.SILL + 0.05)), 
          cands: A.cands.map((c) => ({ w: c.w, fits: c.w - need <= FIT.wide && c.w - need >= FIT.gold ? 1 : 0, scr: sc(X, { x: c.g.position.x, y: c.g.position.y, z: c.g.position.z }) })),
          bench: A.bench ? sc(X, { x: A.bench.x, y: A.bench.y, z: A.bench.z }) : null, held: A.held ? A.cands.indexOf(A.held) : -1,
          h: H ? H.state() : null, slab: A.held ? sc(X, { x: F.cx, y: (H ? H.y : 3) + H112.SLAB_H * 0.5, z: F.cz }) : null };
      },
    };
  },
};
void LINE;
