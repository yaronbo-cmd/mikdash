/* ── build 113 ── h113/acts2.js — stations 2 and 3 of stage 04 (spec "המשחקונים"):
 *   2 the lintel on two fingers: a finger on each end (each its treadwheel), the A-level on the stone; up over the jambs, in over the
 *     opening, wait for the sway, down — the longer the hold the faster, a release stops it (the owner 3.11), a soft touch is clean;
 *   3 the leaf's widths puzzle in the carpenters' yard: boards of different widths that must make exactly five amot, each turned to lie
 *     along the leaf, then the battens pegged with two fingers (one holds, one taps).
 */
import { H113, GATES, LV, YARD, PILES, PISH_PILE, leafClosed, qOf, starsOf } from './model.js';
import { SH4, mats, frameOf, gateBuild, lintelMesh, LINTEL_BED, label, keep, gateKeep, box, makeLeaf } from './world.js';
import { fingers, MOUSE, sc, heroAt, nearPt, onY } from './acts.js';
import { gripR, bigR, nearPts, nearSeg, nearObjs } from '../h109/grips.js';   // (build 125)
import { clamp, lerp, ease } from '../h109/kit.js';

const D2R = Math.PI / 180;

/* ───────── 2. the lintel ───────── */
export const LINTEL = {
  icon: '🏗', title: 'המשקוף',
  walkLine: (m) => `${GATES[m.lv].name}: המשקוף בשתי אצבעות`,
  stand(m) { const G = GATES[m.lv], Fr = frameOf(G); return { x: G.c - 3.2, z: Fr.out(5.3), face: [G.c, Fr.zf] }; },
  prepare(m, X) { placeDerricks(X, GATES[m.lv]); },
  make(m, X) {
    const lv = X.level(), L = LV[lv], G = GATES[m.lv], Fr = frameOf(G), st = X.M.st, PR = X.props, T = X.THREE;
    SH4.busy = 1;
    gateBuild(X, m.lv, { lintel: true });
    const bed = LINTEL_BED(G), half = H113.LINTEL_L / 2, seatZ = (Fr.zf + Fr.zi) / 2, top = H113.TOP;
    const heavy = lv >= 3 ? 0.62 : 1, mouse = MOUSE;
    const A = { phase: 'lift', yL: bed.y, yR: bed.y, z: bed.z, zT: bed.z, sz: 0, svz: 0, held: { '-1': 0, '1': 0 }, holdT: { '-1': 0, '1': 0 }, v: { '-1': 0, '1': 0 }, creak: { '-1': 0, '1': 0 }, warned: 0,
      fast: 1, fastT: 0, pts: 40, falls: 0, chips: 0, knocks: 0, oneEnd: 0, seatedL: 0, seatedR: 0, busy: false, t: 0, drag: null, g: null, lev: null, bob: null, shadow: null, broken: [], over: false, wait: 0 };
    const D = placeDerricks(X, G);
    const sled = []; sledgeMesh();
    function sledgeMesh() { for (const o of sled) PR.remove(o); sled.length = 0; const M = mats(X); for (const dz of [-1.6, 1.6]) sled.push(box(X, M.cedarD, bed.x - 7.5, 6, bed.z + dz - 0.2, bed.x + 7.5, 6.35, bed.z + dz + 0.2)); for (const dx of [-5, 0, 5]) sled.push(box(X, M.cedar, bed.x + dx - 0.3, 6.35, bed.z - 1.9, bed.x + dx + 0.3, 6.7, bed.z + 1.9)); }
    function newLintel() {
      if (A.g) PR.remove(A.g);
      A.g = lintelMesh(X, G, null);
      // the A-level (פלס אל"ף) on its top: a timber A, a cord and its bob; a mark at the crossbar's middle (spec 2)
      const lev = new T.Group(); lev.position.set(0, H113.LINTEL_H, 0); A.g.add(lev);
      const M = mats(X), leg = (sx) => { const b = new T.Mesh(X.props.geo.box, M.cedarD); b.scale.set(0.12, 2.3, 0.12); b.position.set(sx * 0.55, 1.05, 0); b.rotation.z = sx * 0.5; lev.add(b); };
      leg(-1); leg(1); const cb = new T.Mesh(X.props.geo.box, M.cedarD); cb.scale.set(1.3, 0.1, 0.1); cb.position.set(0, 0.75, 0); lev.add(cb);
      const mk = new T.Mesh(X.props.geo.box, M.redc); mk.scale.set(0.05, 0.22, 0.12); mk.position.set(0, 0.75, 0.02); lev.add(mk);
      const bob = new T.Group(); bob.position.set(0, 2.05, 0); lev.add(bob);
      const cord = new T.Mesh(new T.CylinderGeometry(0.012, 0.012, 1.75, 4), PR.M.rope); cord.position.y = -0.87; bob.add(cord);
      const wt = new T.Mesh(new T.ConeGeometry(0.1, 0.22, 8), M.bronze); wt.rotation.x = Math.PI; wt.position.y = -1.78; bob.add(wt);
      A.lev = lev; A.bob = bob;
      if (lv === 1 && !A.shadow) { A.shadow = new T.Mesh(new T.PlaneGeometry(H113.LINTEL_L, H113.DEPTH), mats(X).shadowB.clone()); A.shadow.rotation.x = -Math.PI / 2; A.shadow.renderOrder = 996; PR.root.add(A.shadow); A.shadow.visible = false; }
      A.yL = A.yR = bed.y; A.z = A.zT = bed.z; A.sz = A.svz = 0; A.phase = 'lift'; A.seatedL = A.seatedR = 0; A.oneEnd = 0;
      pose();
    }
    const tiltDeg = () => Math.atan2(A.yR - A.yL, H113.LINTEL_L) / D2R;
    function endAt(s, dy = 0) { return { x: G.c + s * half, y: (s < 0 ? A.yL : A.yR) + dy, z: A.z + A.sz }; }
    function pose() {
      const yc = (A.yL + A.yR) / 2, a = Math.atan2(A.yR - A.yL, H113.LINTEL_L);
      A.g.position.set(G.c, yc, A.z + A.sz); A.g.rotation.set(0, 0, a);
      A.g.position.y = yc - Math.sin(Math.abs(a)) * 0;   // (its foot's middle)
      if (A.bob) A.bob.rotation.z = -a;
      // the derricks' jibs over the ends, their ropes to the stone
      for (const s of [-1, 1]) { const d = D[s < 0 ? 0 : 1], e = endAt(s, H113.LINTEL_H); d.aim(e.x, 40, A.z); d.ropeTo({ x: e.x, y: e.y + 0.02, z: e.z }); }
      if (A.shadow) {
        const over = Math.abs(A.z - seatZ) < 2.6 && Math.min(A.yL, A.yR) > top - 0.2;
        A.shadow.visible = over && A.phase !== 'done'; A.shadow.position.set(G.c, top + 0.03, A.z + A.sz);
        A.shadow.material.opacity = clamp(0.5 - (Math.min(A.yL, A.yR) - top) * 0.05, 0.12, 0.5);
      }
    }
    const F = fingers(X, {
      down(f) {
        if (A.busy) return;
        f.side = sideOf(f);
        if (A.phase === 'in') { A.drag = f; f.z0 = A.zT; X.hand(null); return; }
        if (A.phase === 'lift' || A.phase === 'lower') { A.held[f.side]++; A.holdT[f.side] = 0; X.hand(null); X.play('rope'); }
      },
      move(f) { if (A.drag === f && A.phase === 'in') { const k = (f.y0 - f.y) / Math.max(300, innerHeight) * 9; A.zT = clamp(f.z0 + Fr.s * k, Math.min(bed.z, seatZ), Math.max(bed.z, seatZ)); } },
      up(f) {
        if (A.drag === f) { A.drag = null; if (Math.abs(A.zT - seatZ) < 0.35) { A.zT = seatZ; A.phase = 'settle'; A.wait = 0; X.line('חכו שהנדנוד ידעך'); } return; }
        if (f.side && A.held[f.side] > 0) A.held[f.side]--;
      },
    });
    /** which end a finger holds: the nearer end on the screen (the camera looks in from the Chel: the world's left is the screen's right) */
    function sideOf(f) { const a = X.scr(G.c - half, A.yL + 1, A.z), b = X.scr(G.c + half, A.yR + 1, A.z); return Math.abs(f.x - a.x) < Math.abs(f.x - b.x) ? -1 : 1; }
    function shot(phase) {
      const yc = phase === 'lift' ? 15 : 22;
      X.shot([G.c + 4, yc + 3, Fr.out(32)], [G.c, phase === 'lift' ? 15 : 23, Fr.zf], 1.2);
    }
    async function fall(at) {
      // tilted past the threshold: it slides out of the slings, falls on the Chel and breaks in two (spec 2: −40, a stone off the stock)
      A.busy = true; A.phase = 'fall'; A.falls++; A.pts = Math.min(A.pts, 20);
      const y0 = Math.min(A.yL, A.yR), s = A.yL < A.yR ? -1 : 1;
      for (let i = 1; i <= 16; i++) { await X.wait(0.03); const u = (i / 16) ** 2; A.g.position.y = lerp((A.yL + A.yR) / 2, 6.2, u); A.g.rotation.z += s * 0.05; for (const d of D) d.rope.show(false); }
      X.loss(40, at, 'המשקוף החליק מהחבלים ונשבר', 1); X.shake(0.5, 0.6); X.dust(G.c, 7, A.z, 40, 6); X.play('crash');
      try { PR.chunksAt({ x: G.c, y: 6.5, z: A.z, r: 1.6 }, 8); } catch (e) { /* */ }
      A.g.visible = false;
      const M = mats(X); A.broken = [box(X, M.ash4, G.c - 7, 6, A.z - 1.25, G.c - 0.4, 8.3, A.z + 1.25), box(X, M.ash4, G.c + 0.6, 6, A.z - 1.1, G.c + 7.2, 8.0, A.z + 1.4)]; A.broken[1].rotation.y = 0.12;
      void y0;
      X.line('הצוות מפנה · מזחלת חדשה מהמחצבה');
      await X.wait(1.6);
      // the new one comes on its sledge (seen coming: it slides in from the west along the Chel)
      for (const b of A.broken) PR.remove(b); A.broken = [];
      newLintel(); const x0 = G.c - 30;
      for (let i = 0; i <= 30; i++) { await X.wait(0.04); const u = ease(i / 30); A.g.position.x = lerp(x0, G.c, u); for (const o of sled) o.position.x += 0; }
      for (const d of D) d.rope.show(true);
      A.busy = false; shot('lift'); X.line('שוב: שתי אצבעות, לאט ושווה');
    }
    async function chip(s, v) {
      A.busy = true; A.phase = 'chip'; A.chips++; A.pts = Math.min(A.pts, 20);
      const e = endAt(s);
      X.loss(20, { x: e.x, y: top + 1, z: e.z }, `נחיתה מהירה: פינה נשברה`, 1); X.sparks(e.x, top, e.z, 14); X.dust(e.x, top, e.z, 18, 2); X.shake(0.25, 0.3); X.play('crack');
      try { PR.chunksAt({ x: e.x, y: top + 0.4, z: e.z, r: 0.5 }, 3); } catch (er) { /* */ }
      void v;
      await X.wait(1.0);
      X.line('המשקוף חוזר למזחלת · מגיע חדש');
      await X.wait(1.0); newLintel(); A.busy = false; shot('lift');
    }
    async function seat() {
      A.busy = true; A.phase = 'done';
      const at = { x: G.c, y: top + 3, z: seatZ };
      A.yL = A.yR = top; A.z = seatZ; A.sz = 0; pose();
      X.play('settle'); X.dust(G.c - half + 1, top, seatZ, 14, 2); X.dust(G.c + half - 1, top, seatZ, 14, 2); X.shake(0.25, 0.4);
      if (A.oneEnd) { A.pts = Math.min(A.pts, 10); X.word(at, 'קצה אחד קודם · הצוות מתקן בטריזים'); const w = SH4.crew.add(G.c + half, Fr.out(1.2), { role: 'hammer', item: 'mallet', fx: G.c + half, fz: Fr.zf, crew: 1 }); await X.wait(2.2); SH4.crew.remove(w); }
      const grade = A.pts >= 40 ? 'gold' : A.pts >= 20 ? 'good' : 'ok';
      X.hit(at, grade, { text: A.pts >= 40 ? 'הפלס באמצע!' : 'המשקוף במקומו', craft: 'מנופאים' });
      st.lintel[m.lv] = { done: 1, tilt: +A.seatTilt.toFixed(2) }; X.save();
      for (const d of D) d.rope.show(false);
      await X.wait(1.4);
      const q = qOf(A.pts);
      A.over = true; X.end({ q, stars: starsOf(q), at });
    }
    return {
      close: true,
      begin() {
        keep(X, [gateKeep(G, 30)]); newLintel(); F.attach();
        for (const d of D) d.crewIn(1);
        heroAt(X, G.c - 3.2, Fr.out(5.3), G.c, Fr.zf);
        shot('lift');
        X.line(mouse ? 'החזיקו קצה אחד ואז את השני, לסירוגין' : 'שתי אצבעות, אחת על כל קצה ⬆');
        X.hand({ x: G.c - half + 0.6, y: A.yL + 1.4, z: A.z }, 0, -16);
      },
      update(dt) {
        A.t += dt;
        if (!A.g || A.busy) return;
        // level 2: one crew walks faster, and it changes every few seconds (the owner, build 99)
        if (lv === 2) { A.fastT -= dt; if (A.fastT <= 0) { A.fastT = 3.2 + Math.random() * 1.6; A.fast = Math.random() > 0.5 ? 1 : -1; } }
        const tilt = tiltDeg();
        if (Math.abs(tilt) > L.slip) { fall({ x: G.c, y: Math.max(A.yL, A.yR) + 2, z: A.z }); return; }
        if (A.phase === 'lift') {
          for (const s of [-1, 1]) {
            const on = A.held[s] > 0, base = 1.7 * heavy * (mouse ? 0.42 : 1) * (lv === 2 && s === A.fast ? 1.45 : 1);
            A.v[s] = lerp(A.v[s], on ? base : 0, 1 - Math.exp(-dt * 5));
            const k = s < 0 ? 'yL' : 'yR'; A[k] = Math.min(top + 1.6, A[k] + A.v[s] * dt);
            D[s < 0 ? 0 : 1].spin(-A.v[s] * dt * 0.5);
            creakStep(s, on, dt);
          }
          // (the camera rises with it: the ends stay in the frame for the fingers)
          if (Math.min(A.yL, A.yR) > 17 && !A.rose) { A.rose = 1; shot('in'); }
          if (A.yL >= top + 0.7 && A.yR >= top + 0.7 && !A.held[-1] && !A.held[1]) {
            A.phase = 'in'; shot('in');
            X.line('גררו את האבן פנימה, מעל הפתח'); X.hand({ x: G.c, y: top + 2, z: A.z }, 0, -40);
          } else if (A.yL >= top + 0.7 && A.yR >= top + 0.7 && !A.inLine) { A.inLine = 1; X.line('מעל המזוזות · שחררו'); }
        } else if (A.phase === 'in' || A.phase === 'settle') {
          // in over the opening: the load lags its jibs and swings (a pendulum along the depth), heavy (rule 21)
          const prev = A.z; A.z = lerp(A.z, A.zT, 1 - Math.exp(-dt * 2.2 * heavy));
          const acc = (A.z - prev) / Math.max(dt, 1e-3);
          A.svz += (-9.8 / 6 * A.sz - acc * 0.9) * dt; A.svz *= Math.exp(-dt * (lv === 1 ? 0.9 : 0.45) * heavy); A.sz += A.svz * dt;
          const amp = Math.hypot(A.sz, A.svz / 1.28);
          if (A.phase === 'settle') {
            if (amp < L.sway && Math.abs(A.z - seatZ) < 0.06) { A.phase = 'lower'; X.line(mouse ? 'החזיקו קצה ואז את השני · מורידים' : 'החזיקו שתי קצוות · מורידים'); X.hand({ x: G.c + half - 0.6, y: A.yR + 1.4, z: A.z }, 0, 16); }
            else if (A.held[-1] + A.held[1] > 0 && !A.early) { A.early = 1; X.line('עוד מתנדנדת · חכו', 1200); }
          }
          A.amp = amp;
        } else if (A.phase === 'lower') {
          const prev = A.svz; A.svz *= Math.exp(-dt * 0.5); A.sz += A.svz * dt; A.sz *= Math.exp(-dt * 0.4); void prev;
          for (const s of [-1, 1]) {
            const k = s < 0 ? 'yL' : 'yR', seatedK = s < 0 ? 'seatedL' : 'seatedR';
            if (A[seatedK]) continue;
            const on = A.held[s] > 0;
            if (on) { A.holdT[s] += dt; const t = A.holdT[s]; A.v[s] = Math.min(2.6, (0.22 + 0.55 * t + 0.75 * t * t) * heavy * (mouse ? 0.7 : 1)); }
            else { A.holdT[s] = 0; A.v[s] *= Math.exp(-dt / 0.1); if (A.v[s] < 0.01) A.v[s] = 0; }
            creakStep(s, on, dt);
            const ny = A[k] - A.v[s] * dt;
            if (ny <= top) {
              const v = A.v[s]; A[k] = top; A.v[s] = 0; A[seatedK] = 1;
              if (Math.hypot(A.sz, A.svz) > L.sway * 1.6) { /* a swing at the touch: a knock, lifted a little, no damage */ A[seatedK] = 0; A[k] = top + 0.4; A.knocks++; A.pts = Math.min(A.pts, 20); X.word(endAt(s, 2), 'נקישה! חכו לנדנוד'); X.play('thud'); continue; }
              if (v > L.chipV) { chip(s, v); return; }
              X.play('thud'); X.dust(G.c + s * (half - 1), top, A.z, 8, 1.5);
              const other = s < 0 ? 'seatedR' : 'seatedL';
              if (!A[other] && Math.abs(tiltDeg()) > L.tiltOk) A.oneEnd = 1;
            } else A[k] = ny;
            D[s < 0 ? 0 : 1].spin(A.v[s] * dt * 0.5);
          }
          if (A.seatedL && A.seatedR) { A.seatTilt = tiltDeg(); seat(); return; }
        }
        pose();
      },
      // (build 125: on the right half the lintel (its length, a large moving thing) is the act's; both ends held is the lift's own two
      //  fingers, never a pinch — the rest is the right thumb's look)
      wants(p) { if (A.busy || !['in', 'lift', 'lower', 'settle'].includes(A.phase)) return false; return nearSeg(X, p, endAt(-1, 0.5), endAt(1, 0.5), bigR()); },
      holds() { const L = [...F.L.values()], a = endAt(-1, 0.5), b = endAt(1, 0.5), R = gripR() * 1.5; return L.some((f) => nearPts(X, f, [a], R)) && L.some((f) => nearPts(X, f, [b], R)); },   // (one finger on each end: the lift's own; else two fingers are a pinch)
      down(p) { F.down(p); }, move(p) { F.move(p); }, up(p) { F.up(p); },
      end() {
        F.detach(); for (const d of D) { d.rope.show(false); d.hide(); }
        if (A.g) PR.remove(A.g); for (const o of sled) PR.remove(o); for (const b of A.broken) PR.remove(b); if (A.shadow) PR.remove(A.shadow);
        keep(X, []); SH4.busy = 0; gateBuild(X, m.lv);
      },
      at() { return { x: G.c, y: top + 2, z: seatZ }; },
      dbg() {
        return { lv, phase: A.phase, busy: A.busy, yL: +A.yL.toFixed(2), yR: +A.yR.toFixed(2), z: +A.z.toFixed(2), seatZ, tilt: +tiltDeg().toFixed(2), amp: +(A.amp || 0).toFixed(3), sway: L.sway, tiltOk: L.tiltOk, slip: L.slip,
          held: { L: A.held[-1], R: A.held[1] }, v: { L: +A.v[-1].toFixed(2), R: +A.v[1].toFixed(2) }, fast: A.fast, pts: A.pts, falls: A.falls, chips: A.chips, knocks: A.knocks, oneEnd: A.oneEnd,
          endL: sc(X, endAt(-1, 1)), endR: sc(X, endAt(1, 1)), mid: sc(X, { x: G.c, y: (A.yL + A.yR) / 2 + 1, z: A.z }), mouse };
      },
    };
    /* level 3: a rope held on one side alone creaks after three seconds; held on, it slips a notch (half an amah at once) */
    function creakStep(s, on, dt) {
      if (lv < 3 || mouse) return;
      const alone = on && !A.held[-s];
      A.creak[s] = alone ? A.creak[s] + dt : 0;
      if (A.creak[s] > 3 && !A.warned) { A.warned = 1; X.play('rope'); X.word(endAt(s, 3), 'החבל חורק!'); }
      if (A.creak[s] > 4.2) { const k = s < 0 ? 'yL' : 'yR'; A[k] = Math.max(bed.y, A[k] - 0.5); A.creak[s] = 0; A.warned = 0; X.play('thud'); X.shake(0.2, 0.25); X.word(endAt(s, 2), 'החבל החליק שן'); A.pts = Math.min(A.pts, 20); }
    }
  },
};
/** the two treadwheel derricks beside the opening (spec 2: "שני מנופי גלגל דריכה עומדים משני צדי הפתח") */
function placeDerricks(X, G) {
  const Fr = frameOf(G), D = SH4.dk;
  D[0].place(G.c - 11.5, Fr.out(1.6), 0); D[1].place(G.c + 11.5, Fr.out(1.6), Math.PI);
  return D;
}

/* ───────── 3. the leaf: the widths puzzle ───────── */
export const LEAF = {
  icon: '🪵', title: 'הכנף',
  walkLine: (m) => `חצר הנגרים: כנף ל${GATES[m.lv].name}`,
  stand() { return { x: YARD.x1 + 1.2, z: YARD.z - 2.9, face: [YARD.x1 - 3, YARD.z] }; },
  prepare(m, X) { for (const D of SH4.dk) D.hide(); },
  make(m, X) {
    const lv = X.level(), G = GATES[m.lv], st = X.M.st, PR = X.props, T = X.THREE, M = mats(X);
    SH4.busy = 1;
    const pile = PILES[m.lv].map((p, i) => ({ ...p, i }));
    const A = { phase: 'pick', laid: [], held: null, busy: false, pts: 40, splits: 0, refused: 0, gap: 0, battens: [], pegs: [], peg: 0, hits: 0, hold: null, crew: [], labs: [], t: 0, pish: null, over: false };
    const topY = YARD.top, zEdge = YARD.post - 0.25;   // (the boards lie from the post toward the Chel's edge)
    const rack = [];
    // the pivot post lying on the sawhorses (the leaf's spine), its pins at both ends
    const post = box(X, M.cedarD, YARD.x0, topY, YARD.post - 0.25, YARD.x1, topY + 0.5, YARD.post + 0.25);
    const pins = [YARD.x0 - 0.2, YARD.x1 + 0.2].map((x) => { const c = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, 0.4, 10), M.bronze); c.rotation.z = Math.PI / 2; c.position.set(x, topY + 0.25, YARD.post); PR.root.add(c); return c; });
    // the amah marks along the far sawhorse (level 2: widths by eye against them), a chalk line where the leaf has reached
    const ticks = []; for (let k = 0; k <= 5; k++) { const t = new T.Mesh(new T.PlaneGeometry(0.06, k % 1 ? 0.25 : 0.5), M.chalk); t.rotation.x = -Math.PI / 2; t.rotation.z = Math.PI / 2; t.position.set(YARD.x1 - 0.4, topY + 0.03, zEdge - k); PR.root.add(t); ticks.push(t); }
    const line = new T.Mesh(new T.PlaneGeometry(20.6, 0.07), M.chalk); line.rotation.x = -Math.PI / 2; line.position.set((YARD.x0 + YARD.x1) / 2, topY + 0.035, zEdge); PR.root.add(line);
    // the rack: the boards stand on the wall (spec 3: "ערימת קרשי ארז, כולם באורך הכנף אבל ברוחבים שונים"); chalked widths at level 1
    function rackBuild() {
      for (const r of rack) { PR.remove(r.g); if (r.lab) r.lab.remove(); } rack.length = 0;
      let x = YARD.rack[0];
      for (const p of pile) {
        const g = plankMesh(p, true); g.position.set(x + p.w / 2, 6, YARD.wall - 0.75); g.rotation.x = -0.06; const r = { p, g, home: { x: x + p.w / 2 } };
        if (lv === 1) { r.lab = label(X); r.lab.set(`${p.w}`, { x: x + p.w / 2, y: 14, z: YARD.wall - 1.1 }); }
        rack.push(r); x += p.w + 0.3;
      }
    }
    /** a board 19.6 long: its grain lines on its face (the rings' arcs at its ends), a knot (level 2's flaw), the wicket's hole (level 3) */
    function plankMesh(p, up) {
      const g = new T.Group(), L0 = 19.6, w = p.w - 0.06, t = 0.4;
      const body = new T.Mesh(X.props.geo.box, p.w % 1 ? M.cedarL : M.cedar); body.castShadow = true; body.receiveShadow = true;
      if (up) { body.scale.set(w, L0, t); body.position.y = L0 / 2; } else { body.scale.set(L0, t, w); }
      g.add(body);
      // grain: a few dark lines along it
      for (let k = 1; k <= 3; k++) { const gl = new T.Mesh(X.props.geo.box, M.cedarD); const off = -w / 2 + (w * k) / 4; if (up) { gl.scale.set(0.03, L0 * 0.94, t + 0.02); gl.position.set(off, L0 / 2, 0); } else { gl.scale.set(L0 * 0.94, t + 0.02, 0.03); gl.position.set(0, 0, off); } g.add(gl); }
      if (p.knot) { const kn = new T.Mesh(new T.SphereGeometry(0.14, 8, 6), M.flint); kn.scale.set(1, 0.4, 1); if (up) kn.position.set(w * 0.2, L0 * 0.32, t / 2 + 0.01); else kn.position.set(-L0 * 0.18, t / 2 + 0.01, w * 0.2); g.add(kn); }
      if (p.hole) { const hc = new T.Mesh(X.props.geo.box, M.cut); if (up) { hc.scale.set(1, 1.6, t + 0.06); hc.position.set(-w / 2 + 0.75, 0.25 + 0.8, 0); } else { hc.scale.set(1.6, t + 0.06, 1); hc.position.set(-L0 / 2 + 0.25 + 0.8, 0, w / 2 - 0.75); } g.add(hc); g.userData.hole = hc; }
      PR.root.add(g); g.userData.body = body; return g;
    }
    const sum = () => A.laid.reduce((a, l) => a + l.p.w, 0);
    const laidZ = (k) => { let z = zEdge; for (let i = 0; i < k; i++) z -= A.laid[i].p.w; return z; };   // (the next board's far edge)
    function crewAdd(x, z, o) { const w = SH4.crew.add(x, z, o); if (w) A.crew.push(w); return w; }
    // (the yard and the rack in one frame: the leaf on its sawhorses, the boards standing on the wall beyond it)
    function shot() { const cx = (YARD.x0 + YARD.rack[1]) / 2; X.shot([cx + 2, 36, -110], [cx, 11, -79.5], 1.1); }
    function pegShot(x) { X.shot([x + 3.5, topY + 7.5, YARD.z - 8.5], [x, topY + 0.6, (YARD.post + YARD.z) / 2 - 0.6], 1.0); }
    function sumLabel() { A.sumLab.set(lv === 1 ? `${sum()} / 5 אמות` : '', { x: YARD.x1 + 0.6, y: topY + 0.4, z: laidZ(A.laid.length) }, leafClosed(A.laid.map((l) => l.p.w))); }
    async function pick(r) {
      if (A.busy) return;
      if (sum() + r.p.w > 5 + 1e-6) {
        // over five: it stops in the air, the carpenter shakes his head, back to the rack (spec 3)
        A.busy = true; A.refused++; X.play('thud'); const y0 = r.g.position.y;
        for (let i = 1; i <= 8; i++) { await X.wait(0.03); r.g.position.y = y0 + Math.sin((i / 8) * Math.PI) * 0.8; }
        X.word({ x: r.g.position.x, y: 16, z: r.g.position.z }, 'רחב מדי · יותר מחמש'); A.busy = false; return;
      }
      A.busy = true; X.play('rope'); X.hand(null);
      if (r.lab) r.lab.set('');
      const i = rack.indexOf(r); rack.splice(i, 1); PR.remove(r.g);
      // the crew carries it to the leaf: it comes over its place lying flat but turned across (as it lay on the rack: spec 3, the grain)
      const g = plankMesh(r.p, false), z = laidZ(A.laid.length) - r.p.w / 2, cx = (YARD.x0 + YARD.x1) / 2;
      const ang0 = r.p.hole ? (m.lv === 3 && lv >= 3 ? Math.PI : 0.5 * Math.PI) : (0.35 + (r.p.i % 3) * 0.55) * Math.PI;
      g.position.set(r.home.x, 10, YARD.wall - 1.5); g.rotation.y = ang0;
      const from = g.position.clone(), to = new T.Vector3(cx, topY + 2.2, z);
      for (let k = 1; k <= 20; k++) { await X.wait(0.035); const u = ease(k / 20); g.position.set(lerp(from.x, to.x, u), lerp(from.y, to.y, u) + Math.sin(u * Math.PI) * 1.5, lerp(from.z, to.z, u)); }
      A.held = { r, p: r.p, g, ang: ang0, angT: ang0, om: 0, z };
      A.phase = 'turn'; A.busy = false;
      X.line('סובבו את הקרש לאורך הכנף'); X.hand({ x: cx + 6, y: topY + 2.2, z }, 0, 30);
      // (the carriers hold it)
      crewAdd(cx - 8, YARD.z - 3.4, { role: 'hold', fx: cx - 8, fz: z, crew: 2 }); crewAdd(cx + 8, YARD.z - 3.4, { role: 'hold', fx: cx + 8, fz: z, crew: 2 });
    }
    async function drop() {
      const H = A.held, a = Math.atan2(Math.sin(H.ang), Math.cos(H.ang)), off = Math.min(Math.abs(a), Math.abs(Math.PI - Math.abs(a)));
      if (off > 8 * Math.PI / 180) return false;
      // level 3: the wicket's board must lie at the pivot side (the first) and its hole low (spec 3: "למטה ובצד הציר")
      if (H.p.hole) {
        if (A.laid.length) { await refuse('החור בצד הציר: הקרש הזה ראשון'); return true; }
        if (Math.abs(a) > Math.PI / 2) { await refuse('החור למעלה · סובבו חצי סיבוב'); A.held.angT += Math.PI * 0; return true; }
      }
      A.busy = true; A.phase = 'wait';
      const flip = Math.abs(a) > Math.PI / 2 ? Math.PI : 0;
      H.g.rotation.y = flip; H.g.position.y = topY + 0.2;
      X.play('thud'); X.dust(H.g.position.x, topY + 0.3, H.z, 10, 6);
      A.laid.push({ p: H.p, g: H.g, err: off / D2R });
      A.gap += (off / D2R) * 0.22;
      A.held = null; clearCarriers(); sumLabel();
      if (lv >= 2) A.sumLab.set('');
      if (leafClosed(A.laid.map((l) => l.p.w))) { await battens(); return true; }
      A.phase = 'pick'; A.busy = false; X.line(lv === 1 ? `${sum()} אמות · עוד ${5 - sum()}` : 'עוד קרש · עד חמש בדיוק');
      return true;
    }
    async function refuse(text) {
      A.busy = true; A.refused++; X.word({ x: A.held.g.position.x, y: topY + 3, z: A.held.z }, text); X.play('thud');
      await X.wait(0.9); A.busy = false;
    }
    function clearCarriers() { for (const w of A.crew.splice(0)) SH4.crew.remove(w); }
    async function unlay(k) {
      if (A.busy || A.phase !== 'pick') return;
      // a tap on a laid board takes it back to the rack (rule 24)
      A.busy = true; const l = A.laid.splice(k, 1)[0]; PR.remove(l.g); A.gap = Math.max(0, A.gap - l.err * 0.22);
      for (let i = k; i < A.laid.length; i++) A.laid[i].g.position.z = laidZ(i) - A.laid[i].p.w / 2;
      pile.splice(pile.findIndex((p) => p.i > l.p.i), 0, l.p); if (pile.indexOf(l.p) < 0) pile.push(l.p);
      rackBuild(); sumLabel(); X.play('rope'); A.busy = false;
    }
    /* the battens across and the pegs: one finger holds the batten, the other taps the peg three times (spec 3) */
    async function battens() {
      A.busy = true; X.line('הצוות מניח קורות רוחב');
      const xs = lv === 1 ? [(YARD.x0 + YARD.x1) / 2] : [YARD.x0 + 4, YARD.x1 - 4];
      const z0 = YARD.post, z1 = laidZ(A.laid.length);
      for (const x of xs) { const b = box(X, M.cedarD, x - 0.35, topY + 0.2, z1, x + 0.35, topY + 0.55, z0); A.battens.push(b); }
      await X.wait(0.8);
      // the pegs: two per batten, over two boards (the knot's board gets the first, when it is in)
      const kn = A.laid.findIndex((l) => l.p.knot);
      for (const [bi, x] of xs.entries()) {
        const boards = [kn >= 0 && bi === 0 ? kn : 0, A.laid.length - 1];
        if (boards[0] === boards[1]) boards[0] = Math.max(0, boards[1] - 1);
        for (const k of boards) { const z = laidZ(k) - A.laid[k].p.w / 2; A.pegs.push({ x, z, k, bi, hits: 0, m: null }); }
      }
      for (const pg of A.pegs) { const c = new T.Mesh(new T.CylinderGeometry(0.1, 0.12, 0.5, 8), M.cedarL); c.position.set(pg.x, topY + 0.85, pg.z); PR.root.add(c); pg.m = c; }
      A.peg = 0; A.phase = 'peg'; A.busy = false; pegShot(xs[0]);
      if (MOUSE) crewAdd(xs[0] - 1.4, YARD.z - 3.2, { role: 'hold', fx: xs[0], fz: YARD.z, crew: 2 });
      X.line(MOUSE ? 'הפועל מחזיק את הקורה · הקישו על היתד' : 'אצבע מחזיקה את הקורה, השנייה מקישה על היתד');
      const pg = A.pegs[0]; X.hand({ x: pg.x, y: topY + 1.2, z: pg.z }, 0, 12);
    }
    const holding = (bi) => MOUSE || [...F.L.values()].some((f) => f.what === 'batten' && f.bi === bi);
    async function pegTap(f) {
      const pg = A.pegs[A.peg]; if (!pg || A.busy) return;
      A.why = holding(pg.bi) ? (f.moved > 42 ? 'hard' : 'ok') : 'nohold';
      if (!holding(pg.bi)) {
        // no hand on the batten: it slips aside (spec: "היא זזה אם משחררים")
        const b = A.battens[pg.bi]; b.position.x += 0.25; X.word({ x: pg.x, y: topY + 1.6, z: pg.z }, 'הקורה זזה · החזיקו אותה'); X.play('thud');
        await X.wait(0.3); b.position.x -= 0.25; return;
      }
      if (f.moved > 42) {
        // a hard blow (a long stroke of the finger): the board splits along its grain (spec 3: −20, a board off the stock)
        await split(pg, 'מכה חזקה: הקרש נבקע'); return;
      }
      if (A.laid[pg.k].p.knot) { await split(pg, 'סיקוס! הקרש נבקע ביתד'); return; }
      pg.hits++; pg.m.position.y = topY + 0.85 - pg.hits * 0.15; X.play('tap'); X.dust(pg.x, topY + 0.6, pg.z, 3, 0.4);
      if (pg.hits >= 3) {
        X.hit({ x: pg.x, y: topY + 1.4, z: pg.z }, 'gold', { text: '', craft: 'נגרים' });
        A.peg++;
        if (A.peg >= A.pegs.length) { await finishLeaf(); return; }
        const n = A.pegs[A.peg]; if (n.bi !== pg.bi) pegShot(n.x); X.hand({ x: n.x, y: topY + 1.2, z: n.z }, 0, 12);
      }
    }
    async function split(pg, text) {
      A.busy = true; A.splits++; A.pts = Math.min(A.pts, 20);
      const l = A.laid[pg.k], at = { x: pg.x, y: topY + 1.5, z: pg.z };
      X.loss(20, at, text, 1, 'cedar'); X.play('crack'); X.dust(pg.x, topY + 0.5, pg.z, 14, 3);
      l.g.rotation.z = 0.04; await X.wait(0.9);
      // the board goes (a cedar off the stock), the pegs and battens come off; the knot's board does not come back
      for (const pg2 of A.pegs) PR.remove(pg2.m); A.pegs = []; for (const b of A.battens) PR.remove(b); A.battens = [];
      PR.remove(l.g); A.laid.splice(pg.k, 1);
      if (!l.p.knot) { pile.push({ ...l.p, i: 99 }); }
      for (let i = 0; i < A.laid.length; i++) A.laid[i].g.position.z = laidZ(i) - A.laid[i].p.w / 2;
      rackBuild(); sumLabel(); A.phase = 'pick'; A.busy = false; shot();
      X.line(l.p.knot ? 'בחרו דרך אחרת לחמש אמות' : 'הצוות מביא קרש אחר · בחרו שוב');
    }
    async function finishLeaf() {
      A.busy = true; A.phase = 'wait';
      if (m.lv === 3 && !A.pishDone) { await pishStart(); return; }
      X.line('היתד האחרונה נכנסה');
      // the crew raises the whole leaf on its side: its real size, twenty amot, three times the kohen (spec 3)
      const g = new T.Group(); g.position.set(YARD.x0, topY, YARD.post); PR.root.add(g);
      const parts = [post, ...A.laid.map((l) => l.g), ...A.battens, ...A.pegs.map((p) => p.m), ...pins, ...(A.pishDoor ? [A.pishDoor] : [])];
      for (const o of parts) { if (!o) continue; const wp = o.getWorldPosition(new T.Vector3()); o.parent && o.parent.remove(o); g.add(o); o.position.copy(wp.sub(g.position)); }
      X.shot([(YARD.x0 + YARD.x1) / 2 + 3, 15, -103], [(YARD.x0 + YARD.x1) / 2, 12, -78], 1.4);
      crewAdd(YARD.x0 + 2, YARD.z - 3.6, { role: 'lever', fx: YARD.x0 + 2, fz: YARD.z, crew: 1 }); crewAdd(YARD.x1 - 2, YARD.z - 3.6, { role: 'lever', fx: YARD.x1 - 2, fz: YARD.z, crew: 1 });
      for (let i = 1; i <= 30; i++) { await X.wait(0.04); g.rotation.x = -ease(i / 30) * (Math.PI / 2); g.position.y = topY + ease(i / 30) * 0.1; }
      X.play('thud'); X.dust((YARD.x0 + YARD.x1) / 2, 6.3, YARD.post, 20, 9);
      const grade = A.pts >= 40 && A.gap < 1 ? 'gold' : A.pts >= 20 ? 'good' : 'ok';
      X.hit({ x: (YARD.x0 + YARD.x1) / 2, y: 18, z: YARD.post }, grade, { text: 'כנף של עשרים אמה!', craft: 'נגרים' });
      if (A.gap >= 1) A.pts = Math.min(A.pts, 20);
      st.leaf[m.lv] = { done: 1, planks: A.laid.map((l) => l.p.w), gap: +A.gap.toFixed(2), pish: m.lv === 3 ? 1 : 0 }; X.save();
      A.raised = g;
      await X.wait(1.6);
      const q = qOf(A.pts); A.over = true; X.end({ q, stars: starsOf(q), at: { x: (YARD.x0 + YARD.x1) / 2, y: 12, z: YARD.post } });
    }
    /* level 3: the wicket's little door from two narrow boards (exactly one amah) */
    async function pishStart() {
      A.phase = 'pish'; A.busy = false; A.pishSel = [];
      const hole = A.laid[0].g.userData.hole, hp = hole.getWorldPosition(new T.Vector3());
      A.pishAt = hp;
      A.pishPile = PISH_PILE.map((p, i) => { const g = box(X, M.cedarL, -0.8, 0, -p.w / 2 + 0.02, 0.8, 0.12, p.w / 2 - 0.02); g.position.set(YARD.x0 + 4.4 + i * 0.0, topY + 0.6, YARD.z - 3.5 + i * 0.0); return { p, g, home: null }; });
      // (the four boards side by side on the ground past the leaf's free edge, beside the hole: the near shot holds the hole and all four)
      const bz = YARD.z - 3.6; let bx = hp.x + 2.0;
      for (const q of A.pishPile) { const gy = (X.ground ? X.ground(bx, bz) : 6) || 6; q.g.position.set(bx, gy + 0.1, bz); q.home = q.g.position.clone(); bx += 1.9; }
      X.shot([hp.x + 4.4, topY + 7.5, hp.z - 11.5], [hp.x + 3.4, topY - 0.9, hp.z - 3.4], 1.0);
      X.line('דלת הפשפש: שני קרשים צרים, אמה בדיוק');
      X.hand({ x: A.pishPile[0].home.x, y: A.pishPile[0].home.y + 0.2, z: A.pishPile[0].home.z }, 0, 12);
    }
    async function pishPick(q) {
      if (A.busy) return;
      const ws = A.pishSel.map((s) => s.p.w);
      if (A.pishSel.length === 1 && Math.abs(ws[0] + q.p.w - 1) > 1e-6) { A.busy = true; X.word({ x: q.g.position.x, y: 7.2, z: q.g.position.z }, 'לא אמה'); X.play('thud'); await X.wait(0.6); A.busy = false; return; }
      A.busy = true; A.pishSel.push(q); X.play('rope');
      const k = A.pishSel.length - 1, to = new T.Vector3(A.pishAt.x - 0.45 + (k ? 0.5 + (A.pishSel[0].p.w - 0.5) : 0) * 1, topY + 0.25, A.pishAt.z);
      const from = q.g.position.clone();
      for (let i = 1; i <= 14; i++) { await X.wait(0.03); const u = ease(i / 14); q.g.position.set(lerp(from.x, to.x, u), lerp(from.y, to.y, u) + Math.sin(u * Math.PI), lerp(from.z, to.z, u)); }
      X.play('thud');
      if (A.pishSel.length === 2) { X.hit({ x: A.pishAt.x, y: topY + 1.2, z: A.pishAt.z }, 'gold', { text: 'הפשפש!', craft: 'נגרים' }); A.pishDone = 1; A.pishDoor = A.pishSel[0].g; for (const r of A.pishPile) if (!A.pishSel.includes(r)) PR.remove(r.g); await X.wait(0.8); A.busy = false; finishLeaf(); return; }
      A.busy = false;
    }
    const F = fingers(X, {
      down(f) {
        if (A.busy) return;
        if (A.phase === 'turn' && A.held) { f.what = 'turn'; const c = X.scr(A.held.g.position.x, A.held.g.position.y, A.held.g.position.z); f.cx = c.x; f.cy = c.y; f.a0 = Math.atan2(f.y - c.y, f.x - c.x); f.ang0 = A.held.angT; X.hand(null); return; }
        if (A.phase === 'peg') {
          A.downs = (A.downs || []).slice(-5);
          for (const [bi, b] of A.battens.entries()) { const c = X.scr(b.position.x, b.position.y + 0.3, YARD.z - 0.4), c2 = X.scr(b.position.x, b.position.y + 0.3, YARD.post); const near = distSeg(f, c, c2) < 46; if (near && !nearPeg(f)) { f.what = 'batten'; f.bi = bi; A.downs.push('batten'); return; } }
          f.what = 'peg'; A.downs.push('peg@' + Math.round(f.x) + ',' + Math.round(f.y)); return;
        }
        f.what = 'tap';
      },
      move(f) {
        if (f.what === 'turn' && A.held) { const a = Math.atan2(f.y - f.cy, f.x - f.cx); let d = a - f.a0; d = Math.atan2(Math.sin(d), Math.cos(d)); f.a0 = a; A.held.angT -= d; }
      },
      up(f) {
        if (A.busy) return;
        if (f.what === 'turn') { drop(); return; }
        if (f.what === 'peg') { if (nearPeg(f) || MOUSE) pegTap(f); return; }
        if (f.what !== 'tap' || f.moved > 14) return;
        if (A.phase === 'pick') {
          // a board on the rack (the nearest under the finger), or a laid board (back to the rack)
          let best = null, bd = 1e9;
          for (const r of rack) { const a = X.scr(r.g.position.x, 8, r.g.position.z), b = X.scr(r.g.position.x, 22, r.g.position.z); const d = distSeg(f, a, b); if (d < bd) { bd = d; best = r; } }
          if (best && bd < 54) { pick(best); return; }
          for (let k = A.laid.length - 1; k >= 0; k--) { const g = A.laid[k].g, a = X.scr(YARD.x0 + 2, topY + 0.3, g.position.z), b = X.scr(YARD.x1 - 2, topY + 0.3, g.position.z); if (distSeg(f, a, b) < 26) { unlay(k); return; } }
        }
        if (A.phase === 'pish') { for (const q of A.pishPile) { if (A.pishSel.includes(q)) continue; if (nearPt(X, q.g.position, f, 52)) { pishPick(q); return; } } }
      },
    });
    function nearPeg(f) { const pg = A.pegs[A.peg]; return pg && nearPt(X, { x: pg.x, y: topY + 0.9, z: pg.z }, f, 60); }
    function distSeg(p, a, b) { const vx = b.x - a.x, vy = b.y - a.y, L2 = vx * vx + vy * vy || 1; const t = clamp(((p.x - a.x) * vx + (p.y - a.y) * vy) / L2, 0, 1); return Math.hypot(p.x - a.x - vx * t, p.y - a.y - vy * t); }
    return {
      close: true,
      begin() {
        keep(X, [[YARD.x0 - 3, -84, YARD.rack[1] + 1, -73]]); F.attach();
        rackBuild(); A.sumLab = label(X); sumLabel();
        heroAt(X, YARD.x1 + 1.2, YARD.z - 2.9, YARD.x1 - 3, YARD.z);
        shot();
        X.line(lv === 1 ? 'בחרו קרשים: חמש אמות בדיוק' : lv === 2 ? 'חמש אמות בעין, מול סימני האמה' : 'כנף בית המוקד: הקרש עם החור בצד הציר');
        const r = rack[0]; X.hand({ x: r.g.position.x, y: 12, z: r.g.position.z }, 0, 12);
      },
      update(dt) {
        A.t += dt;
        const H = A.held;
        if (H) { const acc = 30 * (H.angT - H.ang) - 9 * H.om; H.om += acc * dt; H.ang += H.om * dt; H.g.rotation.y = H.ang; }
        if (A.raised) return;
      },
      // (build 125: on the right half only the boards (on the rack, laid), the board in hand, the battens and the peg, the wicket's boards
      //  are the act's — the rest is the right thumb's look; a batten held and the peg tapped is the work's own two fingers)
      wants(p) {
        if (A.busy) return false; if (!p) return true;
        const R = gripR();
        if (A.phase === 'pick') {
          for (const r of rack) if (nearSeg(X, p, { x: r.g.position.x, y: 8, z: r.g.position.z }, { x: r.g.position.x, y: 22, z: r.g.position.z }, R)) return true;
          for (const l of A.laid) if (nearSeg(X, p, { x: YARD.x0 + 2, y: topY + 0.3, z: l.g.position.z }, { x: YARD.x1 - 2, y: topY + 0.3, z: l.g.position.z }, R)) return true;
          return false;
        }
        if (A.phase === 'turn') return !!A.held && nearObjs(X, p, [A.held.g], bigR());
        if (A.phase === 'peg') {
          for (const b of A.battens) if (nearSeg(X, p, { x: b.position.x, y: b.position.y + 0.3, z: YARD.z - 0.4 }, { x: b.position.x, y: b.position.y + 0.3, z: YARD.post }, R)) return true;
          const pg = A.pegs[A.peg]; return !!pg && nearPts(X, p, [{ x: pg.x, y: topY + 0.9, z: pg.z }]);
        }
        if (A.phase === 'pish') return nearObjs(X, p, A.pishPile.filter((q) => !A.pishSel.includes(q)).map((q) => q.g));
        return false;
      },
      holds() { const L = [...F.L.values()]; return L.some((f) => f.what === 'batten') && L.some((f) => f.what !== 'batten' && nearPeg(f)); },
      down(p) { F.down(p); }, move(p) { F.move(p); }, up(p) { F.up(p); },
      end() {
        F.detach(); clearCarriers();
        for (const r of rack) { PR.remove(r.g); if (r.lab) r.lab.remove(); }
        for (const l of A.laid) PR.remove(l.g); if (A.held) PR.remove(A.held.g);
        for (const o of [post, line, ...pins, ...ticks, ...A.battens, ...A.pegs.map((p) => p.m)]) PR.remove(o);
        if (A.pishPile) for (const q of A.pishPile) PR.remove(q.g);
        if (A.raised) PR.remove(A.raised);
        if (A.sumLab) A.sumLab.remove();
        keep(X, []); SH4.busy = 0; gateBuild(X, m.lv);
      },
      at() { return { x: (YARD.x0 + YARD.x1) / 2, y: 10, z: YARD.post }; },
      dbg() {
        const H = A.held;
        return { downs: A.downs, why: A.why, fingers: [...F.L.values()].map((f) => f.what), lv, phase: A.phase, busy: A.busy, sum: sum(), laid: A.laid.map((l) => l.p.w), pts: A.pts, gap: +A.gap.toFixed(2), splits: A.splits, refused: A.refused, peg: A.peg, pegs: A.pegs.length,
          rack: rack.map((r) => ({ w: r.p.w, knot: !!r.p.knot, hole: !!r.p.hole, at: sc(X, { x: r.g.position.x, y: 14, z: r.g.position.z }) })),
          held: H ? { w: H.p.w, ang: +((H.ang / D2R) % 360).toFixed(1), at: sc(X, H.g.position) } : null,
          pegAt: A.pegs[A.peg] ? sc(X, { x: A.pegs[A.peg].x, y: topY + 0.9, z: A.pegs[A.peg].z }) : null,
          batten: A.battens.map((b) => sc(X, { x: b.position.x, y: b.position.y + 0.3, z: (YARD.post + YARD.z) / 2 })),
          battenEnds: A.battens.map((b) => [sc(X, { x: b.position.x, y: topY + 0.5, z: YARD.z - 0.3 }), sc(X, { x: b.position.x, y: topY + 0.5, z: YARD.post - 0.1 })]), pegBi: A.pegs[A.peg] ? A.pegs[A.peg].bi : -1,
          pish: A.pishPile ? A.pishPile.map((q) => ({ w: q.p.w, sel: A.pishSel.includes(q), at: sc(X, q.g.position) })) : null };
      },
    };
  },
};
void onY; void lerp;
