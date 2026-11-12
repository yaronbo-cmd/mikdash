// ── build 120 ── stage 05's model: the plan and what is open, the spec's table, the precision chain, the column, the saw, the beam
// on two shoulders, the water, the mikveh's arithmetic, the bays' grade, the crews' share, the defaults (brief §10)
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PLAN, KINDS, LV, H120, Y, COLS, BEAMS, BEAM_OF, BAYS, MIK, CHAMBER, spanTrue, spanOf, cutLength, fitOf, bayGrade, creakWhy, crewUnits, createH120, freshH120,
  colFresh, colStep, colPts, wedge, leanAfter, windAt, pullShare, sawFresh, sawStep, sawPts, SAW_K, measOf, lineOf, carryStep, carryAngle, beamHits, CARRY,
  floorH, flow, pourPath, refChannel, straightChannel, greedy, reaches, starts, deepenAt, resample, depthOfSeah, outletOf, waterGoal, vesselsOf, freeOf, qOf, starsOf,
} from '../src/game/h120/model.js';
import { RUNS, joistsOf, LADDERS } from '../src/game/h120/layout.js';

const F = 1 / 24, T = 1 / 6;

/* ───────── the plan and what is open ───────── */
test('the plan: twelve works and the closing one, four kinds × three levels in their order', () => {
  assert.equal(PLAN.length, 13);
  assert.deepEqual(PLAN.map((m) => m.id), ['col1', 'saw1', 'carry1', 'mikveh1', 'col2', 'saw2', 'carry2', 'mikveh2', 'col3', 'saw3', 'carry3', 'mikveh3', 'planks']);
  for (const m of PLAN) assert.ok(KINDS.includes(m.k));
  assert.equal(PLAN.filter((m) => m.k !== 'planks').length, 12);
});
test('open at the first moment: the first column and the first mikveh only (and free columns)', () => {
  const M = createH120();
  assert.deepEqual(M.open().filter((m) => !m.free).map((m) => m.id), ['col1', 'mikveh1']);
});
test('saw n opens only after col n; carry n after saw n; col n+1 after col n; mikveh n+1 after mikveh n', () => {
  const M = createH120(), go = (id) => { assert.ok(M.pick(id), id + ' should be open'); M.done({ stars: 3 }); };
  const can = (id) => M.canDo(PLAN.find((m) => m.id === id));
  assert.ok(!can('saw1') && !can('carry1') && !can('col2') && !can('mikveh2'));
  go('col1'); assert.ok(can('saw1') && can('col2') && !can('carry1'));
  go('saw1'); assert.ok(can('carry1'));
  go('mikveh1'); assert.ok(can('mikveh2') && !can('mikveh3'));
  go('col2'); assert.ok(can('saw2') && !can('saw3'));
  assert.ok(!can('planks'));
});
test('every order of play ends in the planks: random walks over the open works always finish', () => {
  for (let seed = 1; seed <= 40; seed++) {
    let r = seed; const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
    const M = createH120(undefined, { freeKinds: [] });
    for (let g = 0; g < 30 && !M.finished(); g++) {
      const O = M.open(); assert.ok(O.length > 0, 'never stuck');
      if (O.some((m) => m.k === 'planks')) assert.equal(M.nDone(), 12);
      M.pick(O[Math.floor(rnd() * O.length)].id); M.done({ stars: 2 });
    }
    assert.ok(M.finished(), 'seed ' + seed);
  }
});
test('the pill counts the twelve, not the planks (PK.count)', () => {
  const M = createH120();
  assert.deepEqual(M.count(), [0, 12]);
  M.autoTo((m) => m.k === 'planks'); assert.deepEqual(M.count(), [12, 12]);
  M.done({ stars: 3 }); assert.deepEqual(M.count(), [12, 12]); assert.ok(M.finished());
});
test('autoTo never picks a free work; free works never block the plan', () => {
  const M = createH120();
  const m = M.autoTo((x) => x.k === 'carry' && x.lv === 2); assert.equal(m.id, 'carry2');
  assert.ok(!M.st.done.some((id) => /F:/.test(id)));
});
test('levels are fixed by the place; a replay one higher; a free work plays at level 3', () => {
  const M = createH120();
  assert.equal(M.levelOf(PLAN[0]), 1); assert.equal(M.levelOf(PLAN.find((m) => m.id === 'col3')), 3);
  M.st.plays.col1 = 1; assert.equal(M.levelOf(PLAN[0]), 2);
  assert.equal(M.levelOf(M.freeMission('colF:S4')), 3);
});

/* ───────── the spec's table ───────── */
test('LV equals the spec\'s table "מידות וספים"', () => {
  const T0 = { land: [12, 10, 8], lean: [4, 3, 2], foot: [2, 1.5, 1], strokes: [8, 9, 9], cut: [2, 1.5, 1], pass: [6, 5, 4], channel: [10, 25, 15] };
  for (const [k, v] of Object.entries(T0)) assert.deepEqual([1, 2, 3].map((lv) => LV[lv][k]), v, k);
  assert.equal(LV[3].over, 12);
  assert.equal(H120.BAL, 78); assert.equal(H120.OVER, 97); assert.equal(H120.COL_H, 10); assert.equal(H120.SPAN, 11); assert.equal(H120.SPAN_E, 11.25);
});
test('the heights: plinth top 6.4, column top 16.4, beam top 17.0, gallery floor 17.4 (about eleven over the court)', () => {
  assert.equal(Y.PLINTH_TOP, 6.4); assert.ok(Math.abs(Y.COL_TOP - 16.4) < 1e-9); assert.ok(Math.abs(Y.BEAM_TOP - 17) < 1e-9); assert.ok(Math.abs(Y.GFLOOR - 17.4) < 1e-9);
  assert.ok(Math.abs(Y.GFLOOR - H120.FLOOR - 11) < 0.5);
});
test('the layout: ten columns five amot from the wall; fourteen beams of 11 (11¼ the east bay), ends on corbels', () => {
  assert.equal(Object.keys(COLS).length, 10); assert.equal(BEAMS.length, 14);
  for (const c of Object.values(COLS)) { const out = c.side === 'S' ? 67.5 - c.z : c.side === 'N' ? c.z + 67.5 : 141 - c.x; assert.equal(out, H120.OUT); }
  for (const id of ['SB1', 'SB2', 'NB1', 'NB3']) assert.equal(spanOf(id), 11);
  assert.equal(spanOf('ENB0'), 11.25); assert.equal(spanOf('ESB0'), 11.25); assert.equal(spanOf('ENB1'), 3.25);
  assert.equal(BEAM_OF.SB0.a, null); assert.equal(BEAM_OF.SB4.b, null);
  for (const r of RUNS) { const J = joistsOf(r); assert.ok(J.length >= 5); for (let i = 1; i < J.length; i++) assert.ok(J[i] - J[i - 1] <= H120.JOIST_GAP + 0.01); }
  assert.equal(LADDERS.length, 6);
});

/* ───────── the precision chain ───────── */
test('spanTrue: nominal, plus the foot\'s offset and the top\'s lean along the axis (fingers → amot)', () => {
  const st = freshH120();
  assert.equal(spanTrue(st, 1), 11); assert.equal(spanTrue(st, 3), 11.25);
  st.col.S2 = { done: 1, off: [2, 1], lean: [3, -2] }; assert.ok(Math.abs(spanTrue(st, 1) - (11 + 5 * F)) < 1e-12);
  st.col.S2 = { done: 1, off: [-1.5, 0], lean: [0, 0] }; assert.ok(Math.abs(spanTrue(st, 1) - (11 - 1.5 * F)) < 1e-12);
});
test('spanTrue: the stop log keeps the foot within a tefach, the wedges the lean within six fingers', () => {
  const st = freshH120(); st.col.N1 = { done: 1, off: [9, 0], lean: [11, 0] };
  assert.ok(Math.abs(spanTrue(st, 2) - (11 + 10 * F)) < 1e-12);
});
test('cutLength: mark plus drift, a skew end on its short side, a tear one finger', () => {
  assert.ok(Math.abs(cutLength({ mark: 11, drift: 1, skew: 0 }) - (11 + F)) < 1e-12);
  assert.ok(Math.abs(cutLength({ mark: 11, drift: 1, skew: -0.5 }) - (11 + 0.5 * F)) < 1e-12);
  assert.ok(Math.abs(cutLength({ mark: 11, drift: 0, skew: 0, torn: 1 }) - (11 - F)) < 1e-12);
});
test('fitOf at its exact boundaries: half a finger knocks; longer trims; short to a tefach inclusive shims; more is lost', () => {
  assert.equal(fitOf(11, 11, 1), 'knock');
  assert.equal(fitOf(11, 11 + 0.5 * F, 1), 'knock'); assert.equal(fitOf(11, 11 - 0.5 * F, 1), 'knock');
  assert.equal(fitOf(11, 11 + 0.51 * F, 1), 'trim');
  assert.equal(fitOf(11, 11 - 0.51 * F, 1), 'shim');
  assert.equal(fitOf(11, 11 - T, 1), 'shim');
  assert.equal(fitOf(11, 11 - T - 0.01 * F, 1), 'lost');
});
test('the chain: a column a tefach off makes a beam cut to "eleven" short, and a measured one knock', () => {
  const st = freshH120(); st.col.S2 = { done: 1, off: [2, 0], lean: [1, 0] };
  const need = spanTrue(st, 1);
  assert.equal(fitOf(need, cutLength({ mark: 11, drift: 0, skew: 0 }), 1), 'shim');
  assert.equal(fitOf(need, cutLength({ mark: need, drift: 0, skew: 0 }), 1), 'knock');
  st.col.S2.lean = [6, 0]; assert.equal(fitOf(spanTrue(st, 1), cutLength({ mark: 11, drift: 0, skew: 0 }), 1), 'lost');
});

/* ───────── the column ───────── */
const runCol = (s, L, f, T0 = 12, dt = 1 / 60) => { const ev = []; for (let t = 0; t < T0 && s.phase === 'rise'; t += dt) ev.push(...colStep(s, f(t, s) || {}, dt, L)); return ev; };
const atBal = () => { const s = colFresh(); s.th = H120.BAL; s.w = 3; s.crossed = 1; return s; };
test('the column: no brake at all → past the balance at 3°/s it lands above 18°/s, rocks over and falls', () => {
  for (const lv of [1, 2, 3]) { const s = atBal(); const ev = runCol(s, LV[lv], () => ({})); assert.ok(ev.includes('fall'), 'lv ' + lv); assert.ok(s.land > 18, `lv ${lv} land ${s.land}`); assert.equal(s.phase, 'fell'); }
});
test('the column: a firm press stops it within 2°', () => {
  for (const lv of [1, 2, 3]) {
    for (const at of [H120.BAL + 1, 84, 88]) {
      const s = atBal(); let p0 = null;
      runCol(s, LV[lv], (t, c) => { if (p0 == null && c.th >= at) p0 = c.th; return p0 != null ? { press: true } : {}; }, 4);
      assert.ok(s.phase === 'rise' && s.th - p0 <= 2, `lv ${lv} at ${at}: ${s.th - p0}`);
    }
  }
});
test('the column: a press held from the start → it cannot rise (the rope creaks)', () => {
  for (const lv of [1, 2, 3]) { const s = colFresh(); const ev = runCol(s, LV[lv], () => ({ pT: 1, held: true, press: true }), 5); assert.ok(s.th < H120.CRADLE + 1, `lv ${lv} ${s.th}`); assert.ok(ev.includes('creak')); }
});
test('the column: below the balance it never sinks back while the crew holds the rope (finger lifted)', () => {
  const s = colFresh(); runCol(s, LV[1], (t) => (t < 5.5 ? { pT: 1, held: true } : {}), 8); assert.ok(s.th > 20 && s.th < H120.BAL);
  const th = s.th; runCol(s, LV[1], () => ({}), 3); assert.ok(s.th >= th - 1e-9 && s.phase === 'rise');
});
/** pressing at tp after the crossing and paying out slowly: is the landing clean? (the save window, brief §4) */
function savedAt(lv, tp) {
  const L = LV[lv], s = atBal(); let pressed = false, still = 0;
  runCol(s, L, (t, c) => { if (t < tp) return {}; const inp = { press: true, pay: pressed ? (L.land * 0.6) / 60 : 0 }; pressed = true; still = c.w < 0.05 ? still + 1 / 60 : 0; if (still > 0.5) { inp.heave = true; still = 0; } return inp; }, 20);
  return s.phase === 'landed' && !s.chip;
}
test('the save windows: from the crossing at 3°/s, ≥ 1.6 s (L1), 1.3 s (L2), 1.0 s (L3) to the point it can no longer be saved', () => {
  for (const [lv, win] of [[1, 1.6], [2, 1.3], [3, 1.0]]) { for (let tp = 0; tp <= win; tp += 0.05) assert.ok(savedAt(lv, tp), `lv ${lv} pressed at ${tp.toFixed(2)} s`); }
  assert.ok(!savedAt(1, 3.0));
});
test('the column: a soft landing (paid out slowly) leaves the foot within a finger and a lean of at most two', () => {
  const L = LV[1], s = atBal(); let pressed = false;
  runCol(s, L, (t, c) => { const inp = { press: true, pay: pressed ? 4 / 60 : 0 }; pressed = true; if (c.w < 0.05 && c.th < 80) inp.heave = true; return inp; }, 20);
  assert.equal(s.phase, 'landed'); assert.ok(s.land <= 6.01, 'soft ' + s.land);
  assert.ok(Math.abs(s.off[0]) <= 1); assert.ok(leanAfter(s)[0] <= 2 + 1e-9);
});
test('the column: a fast landing (between land and 18°/s) chips the foot\'s rim', () => {
  const L = LV[1], s = atBal(); let pressed = false;
  runCol(s, L, (t, c) => { if (c.th < 86) return {}; const inp = { press: true, pay: pressed ? 15 / 60 : 0 }; pressed = true; return inp; }, 20);
  assert.equal(s.phase, 'landed'); assert.ok(s.land > L.land && s.land <= 18, 'land ' + s.land); assert.equal(s.chip, 1);
});
test('the column, level 3: two sharp pulls tear a strand; below 45° no damage, above 45° a crack', () => {
  const L = LV[3];
  const lo = colFresh(); lo.th = 30; let e = colStep(lo, { pT: 1, held: true, sharp: true }, 1 / 60, L); assert.ok(e.includes('warn'));
  e = colStep(lo, { pT: 1, held: true, sharp: true }, 1 / 60, L); assert.ok(e.includes('tear') && !e.includes('crack')); assert.equal(lo.th, H120.CRADLE); assert.equal(lo.crack, 0);
  const hi = colFresh(); hi.th = 55; colStep(hi, { sharp: true }, 1 / 60, L); e = colStep(hi, { sharp: true }, 1 / 60, L); assert.ok(e.includes('crack')); assert.equal(hi.crack, 1);
  const l1 = colFresh(); l1.th = 55; colStep(l1, { sharp: true }, 1 / 60, LV[1]); assert.equal(l1.sharp, 0, 'no pulley at level 1: no strand to tear');
});
test('the column: a jerk on the pull rope between 20° and 70° walks the foot a quarter finger; smooth play does not', () => {
  const s = colFresh(); s.th = 40;
  colStep(s, { pT: 0, held: true }, 1 / 60, LV[1]); const e = colStep(s, { pT: 0.9, held: true }, 1 / 60, LV[1]);
  assert.ok(e.includes('jerk')); assert.equal(s.off[0], 0.25);
  const s2 = colFresh(); s2.th = 40; for (let i = 0; i < 60; i++) colStep(s2, { pT: i / 60, held: true }, 1 / 60, LV[1]); assert.equal(s2.off[0], 0);
});
test('the column: the pull rope slackens past the balance (whole below, none 4° over)', () => {
  assert.equal(pullShare(70), 1); assert.equal(pullShare(78), 1); assert.equal(pullShare(80), 0.5); assert.equal(pullShare(82), 0); assert.equal(pullShare(90), 0);
});
test('the column\'s grade: 40 clean; 20 within twice the bounds and two wedges; 10 a chip; a wedge moves the top a finger away', () => {
  assert.equal(colPts({ off: [1, 0], lean: [2, 1], wedges: 0 }, 1), 40);
  assert.equal(colPts({ off: [1, 0], lean: [2, 1], wedges: 1 }, 1), 20);
  assert.equal(colPts({ off: [3, 0], lean: [6, 0], wedges: 2 }, 1), 20);
  assert.equal(colPts({ off: [0, 0], lean: [0, 0], wedges: 0, chip: 1 }, 1), 10);
  assert.equal(colPts({ off: [0, 0], lean: [3, 0], wedges: 0 }, 3), 20);
  const c = { lean: [2, -1], wedges: 0 }; wedge(c, [1, 0]); wedge(c, [0, -1]); assert.deepEqual(c.lean, [1, 0]); assert.equal(c.wedges, 2);
});
test('the wind of level 2: fixed gusts (the same at the same time), at most two fingers a second', () => {
  let mx = 0; for (let t = 0; t < 60; t += 0.05) { const w = windAt(t); mx = Math.max(mx, w); assert.equal(w, windAt(t)); }
  assert.ok(mx <= 2 + 1e-9 && mx > 1.5);
  const s = colFresh(); colStep(s, { wind: 2 }, 1, LV[2]); assert.ok(Math.abs(s.sway - 2) < 1e-9); colStep(s, { haul: true }, 1 / 60, LV[2]); assert.ok(Math.abs(s.sway) < 1e-9);
});

/* ───────── the saw ───────── */
function sawPlay(lv, o = {}) {
  const L = LV[lv], s = sawFresh(lv), dt = 1 / 120, ev = []; let g = 0;
  while (!s.done && g++ < 40000) {
    if (s.turn === 'carp') { ev.push(...sawStep(s, { down: true, v: o.push && s.ct > 0.2 ? -1 : 0 }, dt, L)); continue; }
    const inK = L.knot && s.depth >= SAW_K.KNOT[0] && s.depth <= SAW_K.KNOT[1];
    const len = s.n < 2 ? 0.4 : inK ? (o.fastKnot ? 1 : 0.5) : 1, v = (s.n < 2 || inK) && !(o.fastKnot && inK) ? 1.2 : o.fastKnot && inK ? 3 : 2;
    const prop = o.noProp ? false : !!s.sag;
    let l = 0; while (l < len && !s.done) { ev.push(...sawStep(s, { down: true, v, w: o.wander || 0, prop }, dt, L)); l += v * dt; }
    ev.push(...sawStep(s, { down: true, v: 0, prop }, dt, L));
  }
  return { s, ev };
}
test('the saw: played well, 8 strokes at level 1 and 9 at levels 2–3, no bind, no drift, in rhythm', () => {
  for (const [lv, n] of [[1, 8], [2, 9], [3, 9]]) { const { s, ev } = sawPlay(lv); assert.equal(s.n, n, 'lv ' + lv); assert.equal(s.binds, 0); assert.equal(s.drift, 0); assert.ok(ev.includes('rhythm')); assert.ok(!s.torn); }
});
test('the saw: driving against the carpenter\'s return binds it (half a finger off the line)', () => {
  const { s, ev } = sawPlay(1, { push: true }); assert.ok(ev.includes('bind')); assert.ok(s.binds >= 1); assert.ok(s.drift >= 0.5);
});
test('the saw: the finger wandering across the axis skews the cut', () => {
  const { s } = sawPlay(1, { wander: 0.8 }); assert.ok(s.skew > 0.5, 'skew ' + s.skew);
});
test('the saw: without the prop the last fibres tear', () => {
  const { s, ev } = sawPlay(1, { noProp: true }); assert.ok(ev.includes('tear')); assert.equal(s.torn, 1);
});
test('the saw: a fast stroke in the knot jumps; the start skips when the first stroke is long', () => {
  const { s, ev } = sawPlay(2, { fastKnot: true }); assert.ok(ev.includes('jump')); assert.ok(s.drift >= 0.5);
  const s2 = sawFresh(1); let l = 0; while (l < 1) { sawStep(s2, { down: true, v: 3 }, 1 / 120, LV[1]); l += 3 / 120; } const e = sawStep(s2, { down: true, v: 0 }, 1 / 120, LV[1]); assert.ok(e.includes('skip'));
});
test('the saw: past 14 strokes the carpenter finishes it (graded 10)', () => {
  const s = sawFresh(1); let g = 0;
  while (!s.done && g++ < 99999) { if (s.turn === 'carp') { sawStep(s, { down: true, v: 0 }, 1 / 120, LV[1]); continue; } for (let i = 0; i < 6; i++) sawStep(s, { down: true, v: 0.4, prop: true }, 1 / 120, LV[1]); sawStep(s, { down: true, v: 0, prop: true }, 1 / 120, LV[1]); }
  assert.equal(s.n, 14); assert.ok(s.over); assert.equal(sawPts({ ...s, line: 'sharp' }, 1), 10);
});
test('the saw\'s grade, the measure\'s slack and the red line', () => {
  assert.equal(sawPts({ drift: 1, skew: 0.5, line: 'sharp', binds: 1 }, 1), 40);
  assert.equal(sawPts({ drift: 1, skew: 0.5, line: 'faint', binds: 0 }, 1), 20);
  assert.equal(sawPts({ drift: 2, skew: 1.5, line: 'sharp', binds: 0 }, 1), 20);
  assert.equal(sawPts({ drift: 2, skew: 1.5, line: 'sharp', binds: 0 }, 3), 10);
  assert.ok(Math.abs(measOf(11, 0.4) - (11 + T)) < 1e-12); assert.equal(measOf(11, 1), 11);
  assert.equal(measOf(11, 0.9), 11); assert.ok(measOf(11, 0.5) - 11 > 2.5 / 24);   // (taut wherever the quick says so; the bot's slack pull reads three fingers long)
  assert.equal(lineOf(0.2), 'faint'); assert.equal(lineOf(0.5), 'sharp'); assert.equal(lineOf(0.9), 'smear');
});

/* ───────── the beam on two shoulders ───────── */
test('the beam: the length is kept to 1e-6 whichever end leads (and with two fingers)', () => {
  const s = { f: [90, -30], r: [90, -41], L: 11 };
  for (let i = 0; i < 400; i++) { carryStep(s, { lead: i % 3 === 2 ? 'rear' : 'front', to: [90 + 20 * Math.sin(i / 30), -10 + i * 0.1] }, 1 / 30); assert.ok(Math.abs(Math.hypot(s.f[0] - s.r[0], s.f[1] - s.r[1]) - 11) < 1e-6); }
  carryStep(s, { lead: 'both', to: [50, 50], to2: [40, 40] }, 1 / 30); assert.ok(Math.abs(Math.hypot(s.f[0] - s.r[0], s.f[1] - s.r[1]) - 11) < 1e-6);
});
test('the beam: with the front leading through a 90° turn the rear\'s path lies inside the front\'s', () => {
  const c = [80, 0], R = 14, s = { f: [80 + R, -11], r: [80 + R, -22], L: 11 };
  for (let a = 0; a <= Math.PI / 2; a += 0.01) carryStep(s, { to: [c[0] + R * Math.cos(-a), c[1] + R * Math.sin(-a) * -1] }, 1);
  for (let k = 0; k < 200; k++) { carryStep(s, { to: [c[0] - 30, c[1] + R] }, 1 / 30); const dr = Math.hypot(s.r[0] - c[0], s.r[1] - c[1]); if (s.r[0] > c[0] - 1 && s.r[1] > 0) assert.ok(dr < R + 1e-6, 'rear inside ' + dr); }
});
test('the beam: a full turn both ways (rule 23), and the angle to an axis', () => {
  const s = { f: [0, 11], r: [0, 0], L: 11 }; assert.ok(Math.abs(carryAngle(s, 'z')) < 1e-9 && Math.abs(carryAngle(s, 'x') - 90) < 1e-9);
  for (let i = 0; i < 400; i++) { const a = (i / 400) * Math.PI * 2; carryStep(s, { lead: 'both', to: [5.5 * Math.cos(a), 5.5 * Math.sin(a)], to2: [-5.5 * Math.cos(a), -5.5 * Math.sin(a)] }, 1); }
  assert.ok(Math.abs(Math.hypot(s.f[0] - s.r[0], s.f[1] - s.r[1]) - 11) < 1e-6);
});
test('the beam\'s obstacles: each class is found (hard, scaffold, jar, lime under a foot, worker); clear space finds none', () => {
  const s = { f: [10, 0], r: [0, 0], L: 10 };
  const obs = [{ kind: 'hard', id: 'col', c: [5, 0.6], r: 0.6 }, { kind: 'scaffold', id: 'sc', x0: 7, z0: -0.5, x1: 7.2, z1: -0.3 }, { kind: 'jar', id: 'j', c: [2, -0.8], r: 0.5 },
    { kind: 'lime', id: 'pit', x0: 9, z0: -1, x1: 11, z1: 1 }, { kind: 'worker', id: 'w', c: [3, 0.7], r: 0.35 }, { kind: 'hard', id: 'far', x0: 0, z0: 5, x1: 10, z1: 6 }];
  const H = beamHits(s, obs).map((h) => h.kind + ':' + h.id).sort();
  assert.deepEqual(H, ['hard:col', 'jar:j', 'lime:pit', 'scaffold:sc', 'worker:w'].sort());
  assert.equal(beamHits({ f: [10, 3], r: [0, 3], L: 10 }, obs).length, 0);
  assert.equal(beamHits(s, [{ kind: 'lime', id: 'p', x0: 4, z0: -1, x1: 6, z1: 1 }]).length, 0, 'the beam passes over the lime; only feet count');
  assert.equal(CARRY.V, 2.5); assert.equal(CARRY.HALF, 0.4);
});

/* ───────── the water ───────── */
test('the floor is a fixed field (rule 56) that falls toward the basin, with rises of at most 1.5 tefachim', () => {
  assert.equal(floorH(20, -50), floorH(20, -50));
  assert.ok(floorH(13, -52.5) > floorH(13, -44)); assert.ok(floorH(36, -51.5) > floorH(18.6, -43));
  for (let x = CHAMBER.x0; x <= CHAMBER.x1; x += 0.5) for (let z = CHAMBER.z0; z <= CHAMBER.z1; z += 0.5) { const h = floorH(x, z) - 6; assert.ok(h > -1 && h < 2.2, `${x},${z}: ${h}`); }
});
test('the water runs downhill along a channel', () => {
  const ch = { pts: [[13, -45, 1], [13, -42.3, 1]] }; const f = flow(ch); assert.ok(f.ok && !f.vessel && !f.pit);
});
test('a rise stops the water (level 1\'s straight way at one finger); deepened two fingers over it, it passes', () => {
  const c = straightChannel(1); const f = flow(c); assert.ok(!f.ok); assert.ok(Math.abs(f.at[1] - -47.4) < 1.6, 'stops before the rise ' + f.at);
  for (const p of c.pts) if (Math.abs(p[1] + 47.4) < 0.8) p[2] = 3; assert.ok(flow(c).ok);
});
test('standing water held by the brim: a small dip before a low lip fills and runs on', () => {
  // a channel down the fall that dips one finger deeper for an amah and comes back: the water stands in the dip (the brim holds) and runs
  const c = { pts: [[13, -45.5, 1], [13, -44.8, 2.2], [13, -44.3, 1], [13, -42.3, 1]] };
  const f = flow(c); assert.ok(f.ok); assert.ok(f.pools.length > 0);
});
test('every level\'s reference way runs to the basin within four fingers of depth, through no vessel', () => {
  for (const lv of [1, 2, 3]) {
    const c = refChannel(lv, 'in'), f = flow(c);
    assert.ok(f.ok && !f.vessel && !f.pit, 'lv ' + lv); assert.ok(reaches(c) && starts(c)); assert.ok(c.maxDepth <= 4, 'max ' + c.maxDepth);
    assert.ok(Math.abs(f.len - LV[lv].channel) < 2.5, `lv ${lv} channel ${f.len.toFixed(1)}`);
  }
  const o = refChannel(3, 'over'), fo = flow(o); assert.ok(fo.ok && !fo.pit && reaches(o) && starts(o) && o.maxDepth <= 4);
});
test('a vessel on the path: level 2\'s straight way (deepened enough) runs through the plasterers\' trough; moved away, it is clean', () => {
  const c = greedy(straightChannel(2)), f = flow(c); assert.equal(f.vessel, 'trough');
  const f2 = flow(c, { moved: { trough: [25, -55] } }); assert.equal(f2.vessel, null);
  assert.equal(vesselsOf({ jar1: [1, 2] }).find((v) => v.id === 'jar1').at[0], 1);
});
test('the fifth finger of depth cracks the slab', () => {
  const pts = [[13, -45, 1], [13, -44, 1]];
  assert.equal(deepenAt(pts, 13, -45, 3).cracked.length, 0); assert.equal(pts[0][2], 4);
  assert.deepEqual(deepenAt(pts, 13, -45, 0.5).cracked, [0]);
});
test('the overflow: the straight downhill line ends in the lime pit; the test pour from the outlet runs into it too', () => {
  const s = straightChannel(3, 'over'); assert.ok(flow(s).pit);
  const p = pourPath(MIK.outlet[0], MIK.outlet[1], 30), e = p[p.length - 1];
  assert.ok(e[0] > MIK.pit.x0 && e[0] < MIK.pit.x1 && e[1] > MIK.pit.z0 && e[1] < MIK.pit.z1, 'ends in the pit ' + e);
  const q = pourPath(20, -55, 4); assert.ok(q.length > 3 && q.length <= 21);
});
test('the outlet: low, exact (within a finger of three amot), high, over the rim', () => {
  assert.equal(outletOf(2.5), 'low'); assert.equal(outletOf(3), 'exact'); assert.equal(outletOf(3 + F), 'exact'); assert.equal(outletOf(3 - F), 'exact');
  assert.equal(outletOf(3 + 2 * F), 'high'); assert.equal(outletOf(3 + T * 2 + 0.01), 'over');
  assert.equal(waterGoal(3, 2.5), 2.5); assert.equal(waterGoal(3, 3), 3); assert.equal(waterGoal(1), 0.5); assert.equal(waterGoal(2), 1.5);
});
test('40 seah stand half an amah deep in the 2 × 3 basin (Eruvin 4:2: an amah by an amah by three)', () => {
  assert.equal((MIK.x1 - MIK.x0) * (MIK.z1 - MIK.z0), 6); assert.equal(depthOfSeah(40), 0.5); assert.equal(MIK.goal[1], 0.5); assert.equal(MIK.deep, 3);
  assert.equal(resample([[0, 0, 1], [1, 0, 3]], 0.5).length, 3);
});

/* ───────── the bays, the crews, the defaults ───────── */
test('bayGrade: perfect only for a clean column and a beam in with a knock; the creak names its reason', () => {
  const st = freshH120();
  st.col.S2 = { done: 1, off: [1, 0], lean: [2, 1], wedges: 0 }; st.beam.SB1 = { fit: 'knock' };
  assert.equal(bayGrade(st, 1), 'perfect'); assert.equal(creakWhy(st, 1), '');
  st.col.S2.wedges = 1; assert.equal(bayGrade(st, 1), 'creak'); assert.match(creakWhy(st, 1), /טריזים/);
  st.col.S2.wedges = 0; st.beam.SB1 = { fit: 'shim', shim: 1 }; assert.equal(bayGrade(st, 1), 'creak'); assert.match(creakWhy(st, 1), /כפיס/);
  st.beam.SB1 = { fit: 'knock' }; st.col.S2.lean = [5, 0]; assert.equal(bayGrade(st, 1), 'creak');
});
test('crewUnits: S1 stands at 0; N2 stands before saw2 can open; no beam before its two supports; all at twelve', () => {
  assert.ok(crewUnits(0).cols.includes('S1'));
  const M = createH120(); M.pick('col1'); M.done({}); M.pick('col2'); M.done({});
  assert.ok(M.canDo(PLAN.find((m) => m.id === 'saw2'))); assert.ok(M.stands('N2'), 'N2 before saw2 opens');
  for (let n = 0; n <= 12; n++) {
    const his = n >= 12 ? ['S2', 'N1', 'EN'] : [], U = crewUnits(n, his), up = new Set([...U.cols, ...his]);
    for (const id of U.beams) { const B = BEAM_OF[id]; assert.ok((B.a == null || up.has(B.a)) && (B.b == null || up.has(B.b)), `n ${n}: ${id}`); }
  }
  const A = crewUnits(12); assert.equal(A.cols.length + 3, 10); assert.equal(A.beams.length + 3, 14);
});
test('crewUnits: a column he took as a free work is never also the crews\'', () => {
  const U = crewUnits(12, ['S4'], ['S4']); assert.ok(!U.cols.includes('S4'));
  const M = createH120(); assert.ok(M.free().some((m) => m.id === 'colF:S4'));
  M.pick('colF:S4'); M.done({ stars: 3 }); assert.ok(!M.crew().cols.includes('S4')); assert.ok(M.stands('S4'));
  assert.ok(!M.free().some((m) => m.id === 'colF:S4')); assert.equal(freeOf('colF:S2'), null, 'his plan column is never a free work');
});
test('free beams: sawF once both supports stand, then carryF; seated by him, never the crews\'', () => {
  const M = createH120();
  assert.ok(M.free().some((m) => m.id === 'sawF:SB0'), 'SB0 rests on the corbel and S1');
  assert.ok(!M.free().some((m) => m.id === 'sawF:SB3'));
  M.pick('sawF:SB0'); M.done({ stars: 2 }); assert.ok(M.free().some((m) => m.id === 'carryF:SB0'));
  M.pick('carryF:SB0'); M.done({ stars: 2 }); assert.ok(M.seated('SB0')); assert.ok(!M.crew().beams.includes('SB0'));
  const M2 = createH120(undefined, { freeKinds: ['col'] }); assert.ok(!M2.free().some((m) => m.k !== 'col'));
});
test('M.done on works not played leaves what the crews would: exact column, true cut with a sharp line, the reference channel, the water', () => {
  const M = createH120(); M.autoTo((m) => m.id === 'planks'); M.done({ stars: 3 });
  const st = M.st;
  assert.deepEqual(st.col.S2.off, [0, 0]); assert.equal(st.col.S2.wedges, 0);
  for (const lv of [1, 2, 3]) { const b = st.beam[BAYS[lv].beam]; assert.equal(b.line, 'sharp'); assert.ok(Math.abs(b.cut - spanTrue(st, lv)) < 1e-12); assert.equal(b.fit, 'knock'); assert.equal(bayGrade(st, lv), 'perfect'); }
  assert.ok(st.mik.ch.length >= 4); assert.equal(st.mik.water, 3); assert.equal(st.mik.outlet, 3); assert.equal(st.planks.done, 1);
  assert.equal(M.bays(), 14);
});
test('M.done keeps what the act left: a chipped column stays chipped, a short cut is shimmed', () => {
  const M = createH120(); M.pick('col1'); M.st.col.S2 = { done: 1, by: 'k', off: [4, 0], lean: [0, 0], wedges: 0, chip: 1 }; M.done({ stars: 1 });
  assert.equal(M.st.col.S2.chip, 1);
  M.pick('saw1'); M.st.beam.SB1 = { done: 1, by: 'k', need: spanTrue(M.st, 1), mark: 11, drift: 0, skew: 0, cut: 11, line: 'sharp' }; M.done({ stars: 3 });
  M.pick('carry1'); M.done({ stars: 1 }); assert.equal(M.st.beam.SB1.fit, 'shim'); assert.equal(M.st.beam.SB1.shim, 1);
  assert.equal(bayGrade(M.st, 1), 'creak');
});
test('the save survives a reload; a bay closes with its carry (מהודר on three stars); stars from quality', () => {
  const M = createH120(); for (const id of ['col1', 'saw1', 'carry1']) { M.pick(id); M.done({ stars: 3 }); }
  const u = M.unitEnd(PLAN.find((m) => m.id === 'carry1')); assert.equal(u.title, 'מפתח נסגר בגזוזטרא'); assert.equal(u.sub, 'מהודר');
  assert.equal(M.unitEnd(PLAN.find((m) => m.id === 'col1')), null);
  const M2 = createH120(JSON.parse(JSON.stringify(M.st))); assert.deepEqual(M2.st.done, M.st.done); assert.ok(M2.seated('SB1'));
  assert.equal(qOf(40), 1); assert.equal(qOf(20), 0.75); assert.equal(starsOf(qOf(10)), 1); assert.equal(starsOf(1), 3);
  assert.ok(M.shown() > 0.18 && M.shown() < 1);
});

test('the column (level 2): a haul inside a gust holds the guy taut for the rest of it; between gusts the haul takes 3 fingers back, never past plumb', () => {
  const L = LV[2];
  // a whole gust with no haul pushes the top across
  let s = colFresh(), t = 0; for (; t < 7.3; t += 1 / 60) colStep(s, { wind: windAt(t), held: true, pT: 0 }, 1 / 60, L);
  const free = s.sway; assert.ok(free > 1.5, 'a gust moves it ' + free);
  // the same gust with one haul early inside it: only the baseline breeze is left
  s = colFresh(); let hauled = false;
  for (t = 0; t < 7.3; t += 1 / 60) { const w = windAt(t), h = !hauled && Math.abs(w) > 0.5; if (h) hauled = true; colStep(s, { wind: w, haul: h, held: true, pT: 0 }, 1 / 60, L); }
  assert.ok(hauled && Math.abs(s.sway) < 1.0, 'held ' + s.sway);
  s = colFresh(); s.sway = 1.2; colStep(s, { haul: true }, 1 / 60, L); assert.equal(s.sway, 0);
  s = colFresh(); s.sway = -4; colStep(s, { haul: true }, 1 / 60, L); assert.ok(Math.abs(s.sway + 1) < 1e-9);
});

// ── station 3's ways (h120/routes.js): each careful way is open end to end and lies in its marking; the narrowest passes 6 / 5 / 4
import { carryWay, CARRY_PLACES, carryObs, carryStart, markOf, inMark, passOf, laneState, lanePeriod, moverAt, LANE_L } from '../src/game/h120/routes.js';
import { carryPts } from '../src/game/h120/model.js';
test('station 3: the three ways are open, end inside the marking, and their narrowest passes are 6 / 5 / 4', () => {
  assert.deepEqual([1, 2, 3].map(passOf), [6, 5, 4]);
  for (const lv of [1, 2, 3]) for (const L of [0, -0.3, -4 / 24, 3 / 24, 0.2].map((d) => (lv === 3 ? 11.25 : 11) + d)) {
    const obs = carryObs(lv, { stands: () => true }), s = carryStart(lv, L);
    for (const [m, x, z] of carryWay(lv, L)) {
      const p = m === 'r' ? s.r : s.f; let n = 0;
      while (Math.hypot(p[0] - x, p[1] - z) > 0.02 && n++ < 9000) {
        carryStep(s, { lead: m === 'r' ? 'rear' : 'front', to: [x, z] }, 1 / 60);
        const h = beamHits(s, obs).filter((q) => q.kind !== 'worker' && q.kind !== 'lime');
        assert.equal(h.length, 0, `level ${lv} (L ${L.toFixed(3)}): ${JSON.stringify(h)} on the way to ${m} ${x},${z}`);
      }
    }
    const r = inMark(s, markOf(lv, L), LV[lv].angle); assert.ok(r.ok, `level ${lv} hands over: ${JSON.stringify(r)}`);
  }
});
test('station 3: a beam across a jar breaks it; across a scaffold leg brings it down; the lime pit counts feet only', () => {
  const obs = carryObs(1, {}), j = CARRY_PLACES[1].jars[0];
  assert.ok(beamHits({ f: [j[0], j[1] - 5], r: [j[0], j[1] + 5], L: 10 }, obs).some((h) => h.kind === 'jar'));
  const o3 = carryObs(3, {}); assert.ok(beamHits({ f: [130.6, -30], r: [130.6, -20], L: 10 }, o3).some((h) => h.kind === 'scaffold'));
  const lime = beamHits({ f: [136, -24], r: [125, -24], L: 11 }, o3).filter((h) => h.kind === 'lime'); assert.deepEqual(lime.map((h) => h.who), ['front']);
  assert.ok(!carryObs(3, { scafDown: new Set([1]) }).some((o) => o.id === 'sc1'));
});
test('station 3: points 40 / 20 / 10', () => {
  assert.equal(carryPts({ bumps: 0, tries: 1, fit: 'knock' }), 40);
  assert.equal(carryPts({ bumps: 2, tries: 1, fit: 'knock' }), 20);
  assert.equal(carryPts({ bumps: 0, tries: 2, fit: 'knock' }), 20);
  assert.equal(carryPts({ bumps: 0, tries: 1, fit: 'trim' }), 20);
  assert.equal(carryPts({ bumps: 3, tries: 1, fit: 'trim' }), 10);
  assert.equal(carryPts({ bumps: 0, tries: 1, fit: 'shim' }), 10);
  assert.equal(carryPts({ bumps: 0, tries: 1, fit: 'lost' }), 10);
  assert.equal(carryPts({ bumps: 0, tries: 1, fit: 'knock', dmg: 1 }), 10);
});
test('station 3: the lane and the carriers keep fixed periods', () => {
  for (const t of [0, 13.7, 99]) { const a = laneState(t), b = laneState(t + lanePeriod('sledge')); assert.ok(Math.abs(a.s - b.s) < 1e-6); assert.ok(lanePeriod('sledge') > 2 * LANE_L / 1.1); }
  const m0 = moverAt(3, 0, 5), m1 = moverAt(3, 0, 5 + 2 * (m0.len / 1.3 + 1.5)); assert.ok(Math.abs(m0.x - m1.x) < 1e-6 && Math.abs(m0.z - m1.z) < 1e-6);
  assert.equal(moverAt(1, 0, 0), null);
});
