/* ── build 120 ── h120/acts5.js — the closing work of stage 05, "סידור הלוחות" (brief §8.1): his south bay (SB1, between S1 and S2) in
 * the evening light. Six cedar planks, one after another, come up over the beam's edge from the court; a finger (or the mouse) slides
 * each along the joists toward the wall until it meets its neighbour with a knock. No puzzle and no fail: a plank let go past a quarter of
 * its way glides home by itself; one let go before it stays where it is. Meanwhile the crews plank the bays on both sides in view.
 * A reload lays the planks already laid (st.planks.at) and goes on from the next.
 *   PLANKS = { icon, title, walkLine, stand, prepare, make(m, X) → act }   (the registry of acts.js)
 */
import { H120, Y, RUNS, BEAM_OF, joistsOf } from './model.js';
import { SH5, mats, box, viewCone, coneKeep } from './world.js';
import { nightRig } from './film.js';
import { fingers, MOUSE } from '../h113/acts.js';
import { clamp, lerp, ease } from '../h109/kit.js';

const RUN = RUNS[0];                                  // the south run: the wall z 67.5, the column line z 62.5
const B = BEAM_OF.SB1, X0 = B.pa[0], X1 = B.pb[0];   // his bay: x 57 … 68
const HW = H120.BEAM_W / 2, OUT = RUN.line + (HW + 0.25) * RUN.dir;   // the joists' court end (z 61.9)
const N = 6, WID = (RUN.wall - OUT) / N;              // six planks across the bay, each about 0.93 wide
const zIn = (i) => RUN.wall - (i + 1) * WID;          // a plank's court-side edge when laid (plank 0 against the wall)
const START = OUT - WID - 0.35;                       // where each comes up: its court edge out over the court, held from below
const NEIGH = [[46, 57], [68, 79]];                   // the crews' bays in view (SB0, SB2)
const sc = (X, x, y, z) => { const r = X.scr(x, y, z); return [Math.round(r.x), Math.round(r.y)]; };

export const PLANKS = {
  icon: '🪵', title: 'סידור הלוחות',
  walkLine: () => 'הקורות במקומן: עכשיו הלוחות על הקורות',
  stand() { return { x: (X0 + X1) / 2, z: RUN.line - 9, face: [(X0 + X1) / 2, RUN.line] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, PR = X.props, M = mats(X), st = X.M.st;
    SH5.busy = 1;
    const all = [], crew = [];
    const done0 = Array.isArray(st.planks.at) ? st.planks.at.filter((i) => i >= 0 && i < N) : [];
    const S = { phase: 'intro', busy: true, i: done0.length, p: 0, pT: 0, glide: 0, drag: null, laid: done0.slice(), t: 0, rise: 0, knocks: 0, crewN: 0, crewT: 0, events: [] };
    const rig = nightRig(X, 'evening');
    const ev = (e) => { S.events.push(e); if (S.events.length > 12) S.events.shift(); };

    /* ── the planks: those laid (from the save), the one in hand ── */
    const g = new T.Group(); PR.root.add(g); all.push(g);
    const plankAt = (z0, x0 = X0 + 0.05, x1 = X1 - 0.05) => box(X, M.h5cedarL, x0, Y.JOIST_TOP, z0 + 0.02, x1, Y.GFLOOR, z0 + WID - 0.02, g);
    for (const i of done0) plankAt(zIn(i));
    let cur = null;
    const D = () => zIn(S.i) - START;                     // the way the plank in hand goes (amot)
    function next() {
      if (S.i >= N) { cur = null; return; }
      cur = plankAt(START); S.p = 0; S.pT = 0; S.glide = 0; S.rise = 0; cur.position.y -= 0.9;
    }
    function place() { if (cur) { cur.position.z = (START + WID / 2) + S.p; cur.position.y = (Y.JOIST_TOP + Y.GFLOOR) / 2 - (1 - ease(S.rise)) * 0.9; } }

    /* ── the crews on both sides: two men a bay, a plank every so often, the knock of the mallet ── */
    const gal = (w) => { if (w) { w.a.ground = () => Y.GFLOOR; w.a.y = Y.GFLOOR; w.fx = null; } return w; };
    NEIGH.forEach(([a0, a1], b) => { for (let k = 0; k < 2; k++) { const w = gal(SH5.crew.add(a0 + 2.5 + k * 5.5, RUN.wall - 1.4 - k * 1.6, { role: 'hammer', item: 'mallet', crew: b + 1 })); if (w) { w.fx = w.a.x; w.fz = RUN.wall - 3; crew.push(w); } } });
    // the man below who hands each plank up (at the bay's middle, on the court under the beam's edge)
    const hander = SH5.crew.add((X0 + X1) / 2 + 3.2, OUT - 2.2, { role: 'hold', crew: 3 }); if (hander) { hander.fx = (X0 + X1) / 2; hander.fz = OUT; crew.push(hander); }
    const crewPl = [];   // [bay, row]
    function crewFrame(dt) {
      S.crewT += dt; if (S.crewT < 1.7 || S.crewN >= N * NEIGH.length) return; S.crewT = 0;
      const b = S.crewN % NEIGH.length, r = Math.floor(S.crewN / NEIGH.length), [a0, a1] = NEIGH[b];
      crewPl.push(plankAt(zIn(r), a0 + 0.05, a1 - 0.05)); S.crewN++;
      if (b === 0) X.play('wood', { level: 1 });
    }

    /* ── the camera: over the court, looking south and down onto his bay, his neighbours' bays at the frame's sides ── */
    const MID = (X0 + X1) / 2, ZM = (RUN.wall + OUT) / 2;
    const S_BAY = { p: [MID, Y.GFLOOR + 13, ZM - 13.5], t: [MID, Y.GFLOOR - 0.4, ZM + 0.6] };
    const S_ALL = { p: [MID + 4, Y.GFLOOR + 22, ZM - 34], t: [MID + 4, Y.GFLOOR - 2, ZM] };
    viewCone(X, [[S_BAY.p, S_BAY.t, 3]], { depth: 12, skip: crew });

    /* ── the finger: a drag anywhere slides the plank in hand along the joists (its screen direction from its start to its place) ── */
    function screenWay() {
      const yy = Y.GFLOOR, a = sc(X, MID, yy, START + WID / 2), b = sc(X, MID, yy, zIn(S.i) + WID / 2);
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return { a, b, ux: dx / L, uy: dy / L, L };
    }
    const FG = fingers(X, {
      down(f) { if (S.phase !== 'lay' || !cur || S.glide) return; S.drag = { f, p0: S.pT, w: screenWay() }; ev('down'); },
      move(f) { const d = S.drag; if (!d || d.f.id !== f.id) return; const pr = (f.x - f.x0) * d.w.ux + (f.y - f.y0) * d.w.uy; S.pT = clamp(d.p0 + (pr / d.w.L) * D(), 0, D()); },
      up(f) { const d = S.drag; if (!d || d.f.id !== f.id) return; S.drag = null; if (S.pT > D() * 0.25) S.glide = 1; ev('up ' + (S.pT / D()).toFixed(2)); },
    });

    function knock() {
      const i = S.i; S.laid.push(i); S.knocks++;
      X.play('wood', { level: 3 }); X.play('tap');
      try { X.quick({ x: MID, y: Y.GFLOOR + 0.6, z: zIn(i) + WID / 2 }, 'נקש!', cur); } catch (e) { /* */ }
      st.planks = { done: 0, at: S.laid.slice() }; try { X.save(); } catch (e) { /* */ }
      cur = null; S.i++; ev('knock ' + i);
      if (S.i >= N) { finish(); return; }
      setTimeout(() => { if (S.phase === 'lay') next(); }, 380);
    }
    function finish() {
      S.phase = 'done'; S.busy = true; X.hand(null);
      X.line('הלוחות נקשו זה בזה: הגזוזטרא סגורה', 2600);
      setTimeout(() => {
        // the crews' bays and the rest of the gallery: the world draws them all now (st.planks.done)
        st.planks = { done: 1, at: S.laid.slice() }; try { X.save(); } catch (e) { /* */ }
        X.shot(S_ALL.p, S_ALL.t, 2.4);
      }, 900);
      setTimeout(() => X.end({ stars: 3, q: 1, perfect: true, at: { x: MID, y: Y.GFLOOR, z: ZM } }), 4200);
    }

    function frame(dt) {
      S.t += dt; rig.apply(); crewFrame(dt);
      for (const w of crew) if (w.role === 'hammer') w.fx = w.a.x;
      if (S.phase !== 'lay' || !cur) return;
      S.rise = Math.min(1, S.rise + dt * 1.8);
      if (S.glide) S.pT = Math.min(D(), S.pT + dt * 6.5);
      S.p = lerp(S.p, S.pT, 1 - Math.exp(-dt * 14)); if (Math.abs(S.p - S.pT) < 0.003) S.p = S.pT;
      place();
      if (S.p >= D() - 0.004 && S.rise >= 1) knock();
    }

    return {
      close: true,
      begin() {
        X.kohen(false); coneKeep(X); FG.attach(); rig.on();
        X.shot(S_BAY.p, S_BAY.t, 1.4);
        X.line('הגזוזטרא נגמרת: ששה לוחות ארז על הקורות במפתח שלנו', 3000);
        if (S.i >= N) { finish(); return; }
        next();
        setTimeout(() => {
          if (S.phase !== 'intro') return; S.phase = 'lay'; S.busy = false;
          X.line('גררו כל לוח לאורך הקורות עד שהוא נוקש בשכנו', 0);
          if (cur) X.hand({ x: MID, y: Y.GFLOOR, z: START + WID / 2 }, 0, -40);
        }, 1600);
      },
      update(dt) { try { frame(dt); } catch (e) { if (!S.errT || S.t - S.errT > 5) { S.errT = S.t; console.error('[h120] planks', e && e.message); } } },
      down(p) { FG.down(p); },
      move(p) { FG.move(p); },
      up(p) { FG.up(p); },
      cancel() { S.drag = null; },
      wants() { return S.phase === 'lay'; },
      holds() { return !!S.drag; },
      end() {
        FG.detach(); rig.off(); rig.dispose();
        for (const o of all) PR.remove(o);
        for (const w of crew) SH5.crew.remove(w);
        X.hand(null); viewCone(X, null); SH5.busy = 0;
      },
      at() { return new T.Vector3(MID, Y.GFLOOR, ZM); },
      dbg() {
        const w = S.phase === 'lay' && cur ? screenWay() : null;
        return { t: +S.t.toFixed(2), phase: S.phase, busy: S.busy, i: S.i, n: N, p: +S.p.toFixed(2), pT: +S.pT.toFixed(2), D: cur ? +D().toFixed(2) : 0, glide: S.glide, laid: S.laid.slice(), crewN: S.crewN, mouse: MOUSE,
          from: w ? w.a : null, to: w ? w.b : null, nf: FG.n, events: S.events.slice(-6), joists: joistsOf(RUN).filter((a) => a > X0 && a < X1).length };
      },
    };
  },
};
