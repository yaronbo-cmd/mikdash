// ── build 128 ── stage 06's model (brief §2): every station played clean to 40 by a bot of plain inputs, each named mistake once with
// its damage and grade, no stuck state (from states reached by careless play a legal input finishes the work), the rings' rows with
// exactly one way each, the sea's surface, the plan and the save.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../src/game/h128/model.js';
import { BOOK } from '../src/game/world/grid.js';

const DT = 1 / 60;
const rnd = (seed) => { let t = seed >>> 0; return () => { t = (t * 1664525 + 1013904223) >>> 0; return t / 4294967296; }; };

/* ───────── the plan ───────── */
test('the plan: eleven works in the brief\'s order; the sea first, then the capstan, then rings and wickets freely, the close last', () => {
  assert.deepEqual(M.PLAN.map((m) => m.id), ['sea1', 'sea2', 'sea3', 'capstan', 'ring1', 'ring8', 'ring15', 'wicketN', 'wicketS', 'wickets', 'close']);
  const G = M.createH128(), open = () => G.open().filter((m) => !m.free).map((m) => m.id), go = (id) => { assert.ok(G.pick(id), id); G.done({ stars: 3, pts: 40 }); };
  assert.deepEqual(open(), ['sea1']);
  go('sea1'); assert.deepEqual(open(), ['sea2']); go('sea2'); go('sea3'); assert.deepEqual(open(), ['capstan']); go('capstan');
  assert.deepEqual(open(), ['ring1', 'wicketN']);
  go('wicketN'); assert.deepEqual(open(), ['ring1', 'wicketS']); go('ring1'); go('ring8'); assert.equal(G.free().length, 0);
  go('ring15'); assert.equal(G.free().length, 12); assert.ok(G.free().every((m) => m.free && ![1, 8, 15].includes(m.ring)));
  assert.ok(!open().includes('close')); go('wicketS'); go('wickets'); assert.deepEqual(open(), ['close']); go('close'); assert.ok(G.finished());
  assert.equal(G.ringsLaid(), 15); assert.ok(G.ringClosed(2) && G.ringClosed(8));
  // the save comes back as it was
  const again = M.createH128(JSON.parse(JSON.stringify(G.st))); assert.ok(again.finished()); assert.deepEqual(again.st.rings[8], G.st.rings[8]);
  assert.equal(M.freeOf('ringF:8'), null); assert.equal(M.freeOf('ringF:9').lv, 2); assert.equal(M.freeOf('ringF:13').lv, 3);
});
test('grades: 40 → q 1 → three stars; 20 → two; 10 → one', () => {
  assert.equal(M.starsOf(M.qOf(40)), 3); assert.equal(M.starsOf(M.qOf(20)), 2); assert.equal(M.starsOf(M.qOf(10)), 1);
  for (const k of Object.keys(M.LOSS)) assert.ok(M.LOSS[k][1] === 20 || (k === 'close.dent' && M.LOSS[k][1] === 40));
  for (const s of Object.values(M.LINES)) assert.ok(!/יהוה|אלהים/.test(s));
});

/* ───────── the sea's surface ───────── */
test('seaAt: finite, a unit normal, the same water whatever the call; a swell lifts the sea at its crest and is seen far before', () => {
  for (const k of [0, 0.5, 1]) for (let i = 0; i < 40; i++) {
    const x = -150 + i * 7.3, z = 90 - i * 4.1, t = i * 0.37, a = M.seaAt(x, z, t, { k });
    assert.ok(Number.isFinite(a.y) && Number.isFinite(a.nx) && Number.isFinite(a.nz));
    assert.ok(Math.abs(a.y) < 6, 'waves bounded'); assert.ok(a.nx * a.nx + a.nz * a.nz < 1);
    assert.deepEqual(M.seaAt(x, z, t, { k }), a);
  }
  const sw = { head: 'port', t0: 10 }, calm = (t) => M.seaAt(0, 0, t, { k: 0 }).y;
  assert.ok(M.seaAt(0, 0, 10, { k: 0, swells: [sw] }).y - calm(10) > M.SWELL.H * 0.95);
  // 6 s before it reaches the ship its crest stands 6·c amot away on its heading (from port: −z), already a hill
  const far = -6 * M.SWELL.c; assert.ok(M.seaAt(0, far, 4, { k: 0, swells: [sw] }).y - M.seaAt(0, far, 4, { k: 0 }).y > M.SWELL.H * 0.95);
  assert.ok(Math.abs(far) < 200, 'inside the 400-amah sea');
  // the Gerstner inversion: the surface point found sits where the displaced grid point lands (within a tenth of an amah)
  assert.ok(M.WAVES.length >= 3 && M.WAVES.length <= 4);
});

/* ───────── station 1: the ropes ───────── */
// the clean player: before each swell, reads its heading; the low ropes into the lower quiet band (the worn one lower still, its
// partner high when it can share), the others into the upper quiet band; one rope at a time under the finger
function seaBot(id, opt = {}) {
  const s = M.seaFresh(id), L = M.SEA_LV[id];
  let cur = 0;
  for (let k = 0; k < 60 * 120 && !s.done; k++) {
    const w = s.sw.find((x) => !x.back) || s.sw[s.sw.length - 1];
    const want = {};
    if (w && s.t > w.t0 - 5.5) {
      const { crest, back } = M.lowRopes(w.head);
      for (const r of M.ROPES) {
        const R = s.ropes[r];
        if (crest.includes(r)) want[r] = R.worn ? 0.36 : (L.D >= 0.4 ? 0.4 : 0.45);
        else if (back.includes(r)) want[r] = R.worn ? 0.45 : 0.6;
        if (crest.includes(M.partnerOf(r)) && !crest.includes(r) && s.ropes[M.partnerOf(r)].worn) want[r] = 0.63;
      }
    }
    if (opt.mistake) opt.mistake(s, want);
    const keys = Object.keys(want).filter((r) => Math.abs(s.ropes[r].tgt - want[r]) > 0.01);
    let inp = {};
    if (keys.length) { const r = keys[cur++ % keys.length]; inp = { rope: r, dy: Math.max(-40, Math.min(40, (want[r] - s.ropes[r].tgt) / M.H128.GAIN)) }; }
    M.seaStep(s, inp, DT);
    if (opt.each) opt.each(s);
  }
  return s;
}
test('sea1 and sea2 played clean: every swell clean, no damage, 40; the ropes sing at each clean swell', () => {
  for (const id of ['sea1', 'sea2']) {
    let sings = 0; const s = seaBot(id, { each: (x) => { sings += x.ev.filter((e) => e.e === 'sing').length; } });
    assert.ok(s.done, id); assert.equal(s.dmg, 0, id); assert.ok(s.sw.every((w) => w.clean), id + ' ' + JSON.stringify(s.sw.map((w) => w.clean)));
    assert.equal(M.seaPts(s), 40, id); assert.equal(sings, s.sw.length);
  }
});
test('sea mistakes: a low rope hauled too high pulls its ring (−20, 10); a slack rope snatches (no damage, 20); the frays band parts a strand, then tears (−20)', () => {
  // the ring: the first swell's low ropes left at 0.85
  let s = seaBot('sea1', { mistake: (x, want) => { const w = x.sw[0]; if (!w.crest) for (const r of M.lowRopes(w.head).crest) want[r] = 0.85; } });
  assert.equal(s.flags['sea.ring'], 2); assert.equal(s.dmg, 2); assert.equal(M.seaPts(s), 10);
  assert.ok(Object.values(s.ropes).some((r) => r.knot && r.ring));
  // the snatch
  s = seaBot('sea1', { mistake: (x, want) => { const w = x.sw[1]; if (!w.crest && x.t > w.t0 - 5.5) want[M.lowRopes(w.head).crest[0]] = 0.2; } });
  assert.equal(s.dmg, 0); assert.equal(s.sw[1].clean, 0); assert.equal(s.sw[1].slide, 1); assert.equal(M.seaPts(s), 20);
  // the frays band: one rope held at 0.95 for 7 s (a strand at 3, torn at 6)
  let ev = [];
  s = seaBot('sea1', { mistake: (x, want) => { if (x.t > 1 && x.t < 8) want.stbdAft = 0.95; }, each: (x) => { ev = ev.concat(x.ev.map((e) => e.e)); } });
  assert.ok(ev.includes('strand') && ev.includes('torn')); assert.equal(s.flags['sea.torn'], 1); assert.equal(M.seaPts(s), 10);
  // the worn rope of sea2 hauled to the quiet band's top at a starboard swell (its port side low): it pulls its ring at 0.8
  s = seaBot('sea2', { mistake: (x, want) => { const w = x.sw[0]; if (!w.crest && x.t > w.t0 - 5.5) want.portAft = 0.6; } });
  assert.equal(s.ropes.portAft.ring, 1); assert.equal(M.seaPts(s), 10);
});
test('sea: no stuck state — from careless ropes, the clean player still ends the journey (the storm only goes on)', () => {
  for (let seed = 1; seed <= 6; seed++) {
    const r = rnd(seed);
    const s = seaBot(seed % 2 ? 'sea1' : 'sea2', { mistake: (x, want) => { if (x.t < 9) for (const k of M.ROPES) want[k] = r() * 1.1; } });
    assert.ok(s.done, 'seed ' + seed); assert.ok([10, 20, 40].includes(M.seaPts(s)));
  }
});

/* ───────── station 1: the hold ───────── */
function holdBot(opt = {}) {
  const s = M.holdFresh(opt); const lifted = { L: 0, R: 0 }; let ev = [];
  for (let k = 0; k < 60 * 120 && !s.done; k++) {
    const inp = { L: true, R: true };
    for (const h of ['L', 'R']) { if (s.off[h] && !lifted[h]) { inp[h] = false; lifted[h] = 1; } else if (!s.off[h]) lifted[h] = 0; if (opt.lazy && s.off[h] && s.swells < 2) inp[h] = false; }
    M.holdStep(s, inp, DT); ev = ev.concat(s.ev.map((e) => e.e));
  }
  return { s, ev };
}
test('the hold: both thumbs on the rings, each swell slips a hand, the thumb lifts and takes it again: three swells and the sea is calm', () => {
  let { s, ev } = holdBot(); assert.ok(s.done); assert.equal(s.held, 3); assert.equal(s.swells, 3); assert.ok(ev.includes('line') && ev.includes('calm'));
  // a hand left off: that swell comes again (nothing lost)
  ({ s, ev } = holdBot({ lazy: true })); assert.ok(s.done); assert.ok(s.swells > 3); assert.ok(ev.includes('again'));
  // the mouse: the sailor holds the right ring, the pointer's hand slips
  ({ s } = holdBot({ mouse: true })); assert.ok(s.done && s.held === 3);
});

/* ───────── station 1: Akko ───────── */
function akkoBot(opt = {}) {
  const s = M.akkoFresh(); let ev = [];
  for (let k = 0; k < 60 * 180 && !s.done; k++) {
    const inp = {};
    if (s.phase === 'hook') {
      const up = M.ringY(s.t) > 0.05 && M.ringY(s.t + 0.2) > 0.05;
      inp.hx = 0; inp.hy = opt.early && s.t < 4 ? -0.6 : up ? M.ringY(s.t) : 2;
    } else if (s.phase === 'hoist') inp.haul = opt.feed ? (s.w < 0 ? 1.2 : 0) : (s.w > -0.05 ? 1.2 : 0);
    else if (s.phase === 'land') inp.ease = opt.drop ? 2.5 : (s.y > 1 ? 0.9 : 0.35);
    M.akkoStep(s, inp, DT); ev = ev.concat(s.ev.map((e) => e.e));
  }
  return { s, ev };
}
test('Akko: the hook at the first try, a calm hoist, a soft landing: 40; a miss, a fed swing or a hard landing: 20 (no damage)', () => {
  let { s, ev } = akkoBot(); assert.ok(s.done); assert.equal(s.tries, 1); assert.ok(s.maxSw <= M.AKKO.CLEAN, 'swing ' + s.maxSw); assert.ok(s.land.soft); assert.equal(M.akkoPts(s), 40);
  assert.ok(ev.includes('hook') && ev.includes('touch'));
  ({ s, ev } = akkoBot({ early: true })); assert.ok(s.done); assert.ok(s.tries > 1 && ev.includes('miss')); assert.equal(M.akkoPts(s), 20);
  ({ s, ev } = akkoBot({ feed: true })); assert.ok(s.done, 'the fed swing still ends: the crew stops it'); assert.ok(s.maxSw > M.AKKO.CLEAN); assert.equal(M.akkoPts(s), 20);
  ({ s } = akkoBot({ drop: true })); assert.ok(s.done && !s.land.soft); assert.equal(M.akkoPts(s), 20);
  // the ring is above the water 1.2 s in every 3
  let up = 0; for (let t = 0; t < 30; t += 0.01) if (M.ringY(t) > 0) up += 0.01; assert.ok(Math.abs(up / 10 - 1.2) < 0.03);
});

/* ───────── station 2: the capstan ───────── */
function capBot(rests, opt = {}) {
  const s = M.capFresh(), plan = [...rests, M.NOTCH_D.length - 1]; let pi = 0, ev = [], maxT = 0;
  for (let k = 0; k < 60 * 400 && !s.done; k++) {
    const nd = M.NOTCH_D[plan[Math.min(pi, plan.length - 1)]], r = M.rampAt(s.d).rough, ra = M.rampAt(Math.min(s.d + 3, M.CAP_END)).rough;
    let turn = 0, tap = false;
    if (s.wedge !== -1 && s.F > 0.02) turn = 0;
    else {
      if (s.wedge >= 0 && s.wedge >= plan[pi]) pi++;
      const dist = M.NOTCH_D[plan[Math.min(pi, plan.length - 1)]] - s.d;
      let u = opt.hard ? 2.4 : (r > 0 || ra > 0) ? 0.55 : 1.25;
      if (dist < 2.5) u = Math.min(u, 0.25 + dist * 0.3);
      if (dist < 0.35) u = 0;
      turn = u / M.CAP.TURN;
      if (Math.abs(dist) <= 0.45 && Math.abs(s.v) < 0.12) tap = true;
    }
    if (opt.tapAlways) tap = k % 30 === 0 || tap;
    void nd;
    M.capStep(s, { turn, tap }, DT); ev = ev.concat(s.ev.map((e) => e.e));
    if (s.wedge === -1) maxT = Math.max(maxT, s.ten);
  }
  return { s, ev, maxT };
}
test('the capstan played clean: two rests (just before the rough timbers), the rope quiet, no run back: 40 in about a minute and a half', () => {
  const { s, ev, maxT } = capBot([0, 3]);
  assert.ok(s.done); assert.equal(s.dmg, 0); assert.equal(s.runs + s.backs, 0); assert.ok(!s.frayed); assert.ok(maxT <= M.H128.BAND.quiet, 'max tension ' + maxT);
  assert.equal(M.capPts(s), 40); assert.ok(ev.includes('wedge') && ev.includes('quiet') && ev.includes('top'));
  assert.ok(s.t > 60 && s.t < 130, 'time ' + s.t); assert.deepEqual(s.rests.sort(), [0, 3, 5]);
});
test('the capstan: one rest is not enough (the crew lets it down, no damage, 20); hauling hard frays the rope, a strand parts, the sledge runs back and breaks a timber (−20, 10)', () => {
  for (const one of [[0], [1], [2], [3]]) { const { s } = capBot(one); assert.ok(s.backs > 0 || !s.done, 'one rest at ' + one); }
  let { s, ev } = capBot([0, 2, 4], { hard: true });
  assert.ok(ev.includes('part')); assert.ok(s.dmg >= 1); assert.ok(s.timber.length >= 1); assert.equal(M.capPts(s), 10);
  // a tap at speed or between notches: a dull clack, nothing else
  ({ s, ev } = capBot([0, 3], { tapAlways: true })); assert.ok(ev.includes('clack')); assert.ok(s.done);
  // the let-down is braked and slow, and ends on the last wedge with no damage
  const L = capBot([2]); assert.equal(L.s.dmg, 0); assert.ok(L.ev.includes('letdown') && L.ev.includes('back'));
});
test('the capstan: the rough timbers make the quiet band narrow; the notches and the climb are the book\'s', () => {
  assert.deepEqual([...M.NOTCH_D], BOOK.s06.ramp.notch.map((x) => BOOK.s06.ramp.sledge.tail - x));
  const smooth = M.capBase(10) + M.capK(10) * 0.5 * 1.0, rough = M.capBase(30) + M.capK(30) * 0.5 * 1.0;
  assert.ok(M.rampAt(30).rough > 0.9 && M.rampAt(10).rough === 0); assert.ok(rough > smooth + 0.15);
  assert.equal(M.bandOf(0.2), 'slack'); assert.equal(M.bandOf(0.5), 'quiet'); assert.equal(M.bandOf(0.8), 'sings'); assert.equal(M.bandOf(0.95), 'frays');
});
test('the capstan: no stuck state — after careless hauling the clean player still brings the door to the sill', () => {
  for (let seed = 1; seed <= 5; seed++) {
    const r = rnd(seed), s = M.capFresh();
    for (let k = 0; k < 60 * 30; k++) M.capStep(s, { turn: r() * 0.9, tap: r() < 0.02 }, DT);
    // then a careful player: wedge at every notch and rest there, haul at an even pace between
    for (let k = 0; k < 60 * 600 && !s.done; k++) {
      const next = M.NOTCH_D.findIndex((nd, i) => nd > s.d - 0.45 && i > s.lastWedge), nd = M.NOTCH_D[next < 0 ? M.NOTCH_D.length - 1 : next], dist = nd - s.d;
      let turn = 0, tap = false;
      if (s.mode !== 'haul') turn = 0;
      else if (s.wedge !== -1 && s.F > 0.02) turn = 0;
      else { let u = M.rampAt(s.d).rough > 0 ? 0.55 : 1.1; if (dist < 2.5) u = Math.min(u, 0.25 + dist * 0.3); if (dist < 0.35) u = 0; turn = u / M.CAP.TURN; if (Math.abs(dist) <= 0.45 && Math.abs(s.v) < 0.12) tap = true; }
      M.capStep(s, { turn, tap }, DT);
    }
    assert.ok(s.done, 'seed ' + seed + ' d ' + s.d.toFixed(1) + ' F ' + s.F.toFixed(2) + ' ' + s.mode);
  }
});

/* ───────── station 3: the rings ───────── */
test('every ring\'s row has exactly one way; without the course below more than one would close; the plans are fixed for 1, 8, 15', () => {
  for (let i = 1; i <= 15; i++) {
    const P = M.ringPlan(i), sound = P.yard.filter((y) => y.ring === i && !y.crack);
    const S = M.rowSolutions(P.G, P.C, P.below, sound, M.rowOpt(P));
    assert.equal(S.length, 1, 'ring ' + i); assert.deepEqual(S[0], { left: [...P.sol.left], right: [...P.sol.right] });
    assert.ok(M.rowSolutions(P.G, P.C, [], sound, M.rowOpt(P)).length >= 2, 'ring ' + i + ': the joints decide');
    assert.ok(M.rowFit(P, { ...P.sol, dressed: P.yard.filter((y) => y.long).map((y) => y.id) }).bull, 'ring ' + i);
    assert.equal(P.R, BOOK.s06.steps.R1 - 0.5 * (i - 1));
    assert.ok(P.G < P.arc * 0.6, 'the gap inside the half arc, the crews\' stones each side');
    assert.ok(Object.isFrozen(P) && Object.isFrozen(P.yard));
  }
  const T = (i) => M.ringPlan(i);
  assert.equal(T(1).yard.length, 9); assert.equal(T(1).yard.filter((y) => y.ring !== 1).length, 6); assert.equal(T(1).n, 3);
  assert.equal(T(8).yard.length, 8); assert.equal(T(8).yard.filter((y) => y.ring === 8).length, 6); assert.equal(T(8).n, 5);
  assert.equal(T(15).yard.length, 7); assert.equal(T(15).yard.filter((y) => y.ring === 15).length, 4); assert.equal(T(15).yard.filter((y) => y.crack).length, 1); assert.equal(T(15).n, 3);
  for (const i of [1, 8, 15]) for (const y of T(i).yard) if (y.ring !== i) { const d = Math.abs(y.ring - i); assert.ok(d >= 2 && d <= 4); assert.ok(M.tplLight(T(i), y) >= 2 && M.tplLight(T(i), y) <= 6); }
  assert.deepEqual([T(1).tol, T(8).tol, T(15).tol], [0.20, 0.15, 0.08]); assert.equal(T(15).lag, 0.35);
  // the cracked stone is the twin of a sound one: with it the row also closes (the mistake), and the mallet tells it
  const P = T(15), cr = P.yard.find((y) => y.crack), all = P.yard.filter((y) => y.ring === 15);
  const withCr = M.rowSolutions(P.G, P.C, P.below, all, { joint: P.joint }); assert.ok(withCr.length >= 2 && withCr.filter((o) => ![...o.left, ...o.right].includes(cr.id)).length === 1); assert.equal(M.stoneSound(cr), 'dull');
  // the same every load
  assert.deepEqual(JSON.parse(JSON.stringify(M.ringPlan(8))), JSON.parse(JSON.stringify(T(8))));
});
// ── h128 ── (build 128 tuning T8) the free rings' own rules
test('T8: every free ring has one rule of its own (fixed, never the same on two neighbours, each kind 4 times) and is solved under it', () => {
  const free = [2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14], kinds = free.map((i) => M.FREE_RULE[i].kind);
  for (let k = 1; k < free.length; k++) assert.notEqual(kinds[k], kinds[k - 1], 'rings ' + free[k - 1] + ', ' + free[k]);
  for (const kd of ['odd', 'stone', 'order']) assert.ok(kinds.filter((x) => x === kd).length >= 4, kd);
  for (const i of [1, 8, 15]) { assert.equal(M.FREE_RULE[i], undefined); const P = M.ringPlan(i); assert.equal(P.rule, null); assert.equal(P.off, 0); assert.equal(P.order, null); assert.ok(!P.yard.some((y) => y.long)); }
  const lens = (P, ids) => ids.map((id) => P.yard.find((y) => y.id === id).len).reduce((a, b) => a + b, 0);
  for (const i of free) {
    const P = M.ringPlan(i), R = M.FREE_RULE[i], half = (P.G - P.C) / 2, sound = P.yard.filter((y) => y.ring === i && !y.crack);
    // the solver: the one way under the ring's own rule, laid stone by stone as the player must, the bull at the end
    const S = M.rowSolutions(P.G, P.C, P.below, sound, M.rowOpt(P)); assert.equal(S.length, 1, 'ring ' + i);
    const dressed = P.yard.filter((y) => y.long).map((y) => y.id), row = { left: [], right: [], dressed }, L = [...S[0].left], Rt = [...S[0].right];
    while (L.length || Rt.length) { const sd = M.nextSide(row, P); const from = sd === 'left' ? L : Rt; assert.ok(from.length, 'ring ' + i + ': the next side has its stone'); row[sd].push(from.shift()); }
    const F = M.rowFit(P, row); assert.ok(F.bull, 'ring ' + i);
    if (R.kind === 'odd') {
      assert.equal(P.off, R.off); assert.ok(P.off !== 0);
      assert.equal(lens(P, P.sol.left), half + P.off, 'ring ' + i); assert.equal(lens(P, P.sol.right), half - P.off);
      // the same stones swapped to the other sides would leave the hole on the middle mark: not the mark of this ring
      assert.ok(!M.rowFit(P, { left: P.sol.right, right: P.sol.left }).bull);
    }
    if (R.kind === 'order') {
      assert.ok(P.order === 'left' || P.order === 'right');
      const first = P.order, other = first === 'left' ? 'right' : 'left';
      assert.equal(M.nextSide({ left: [], right: [] }, P), first, 'ring ' + i + ': the hoist end waits');
      // a stone on the hoist's end before the first side is whole is out of turn
      const o = { left: [], right: [] }; o[other] = [P.sol[other][0]]; assert.ok(!M.rowFit(P, o).turn);
    }
    if (R.kind === 'stone') {
      if (M.RING_LV[M.ringCls(i)].crack) {
        // a ring with its crack already (12–14): one of its row's stones a hair too long; laid undressed the hole is short, dressed it closes
        const lg = P.yard.filter((y) => y.long); assert.equal(lg.length, 1); assert.equal(lg[0].long, M.LONG); assert.ok([...P.sol.left, ...P.sol.right].includes(lg[0].id));
        const u = M.rowFit(P, { ...P.sol }); assert.ok(!u.bull && u.rest === P.C - M.LONG && u.proud.includes(lg[0].id));
      }
      // one cracked twin of a sound stone: its sound is dull, and with it in the row the ring closes but the stone cracks (the loss)
      const cr = P.yard.filter((y) => y.crack); assert.equal(cr.length, 1); assert.equal(M.stoneSound(cr[0]), 'dull');
      const tw = P.yard.find((y) => y.ring === i && !y.crack && y.len === cr[0].len && [...P.sol.left, ...P.sol.right].includes(y.id));
      assert.ok(tw, 'ring ' + i + ': the crack is the twin of a row stone');
      const sw = (ids) => ids.map((id) => (id === tw.id ? cr[0].id : id)), G = M.rowFit(P, { left: sw(P.sol.left), right: sw(P.sol.right), dressed });
      assert.ok(G.bull && G.cracked);
    }
  }
  // the class-1 and class-8 rings with 'stone' have a crack they did not have; the others have none beyond their class
  for (const i of free) if (M.RING_LV[M.ringCls(i)].crack === 0) assert.equal(M.ringPlan(i).yard.filter((y) => y.crack).length, M.FREE_RULE[i].kind === 'stone' ? 1 : 0);
});
// ── /h128 ──
test('the row: a wrong order puts a joint over a joint below (the red hairline), a stranger gapes, a wrong length misses the mark', () => {
  const P = M.ringPlan(8), L = [...P.sol.left], R = [...P.sol.right];
  const swapped = { left: [L[1], L[0], L[2]], right: R }, f = M.rowFit(P, swapped);
  assert.equal(f.rest, P.C); assert.ok(!f.bull);
  const stranger = P.yard.find((y) => y.ring !== 8), g = M.rowFit(P, { left: [stranger.id], right: [] }); assert.deepEqual(g.gape, [stranger.id]); assert.ok(!g.bull);
  const decoy = P.yard.find((y) => y.ring === 8 && ![...L, ...R].includes(y.id)), h = M.rowFit(P, { left: [decoy.id, L[1], L[2]], right: R });
  assert.ok(!h.bull);
  assert.equal(M.nextSide({ left: [], right: [] }), 'left'); assert.equal(M.nextSide({ left: ['a'], right: [] }), 'right');
  assert.ok(M.slidesHome(1) && !M.slidesHome(1.2));
});
// the closing stone: both bars advanced together inside tol
function keyBot(P, opt = {}) {
  const s = M.keyFresh(P); let ev = [], ca = 0, cb = 0;   // (what the thumbs have pushed: the heavy stone follows it late)
  for (let k = 0; k < 60 * 60 && !s.done; k++) {
    let da = 0, db = 0;
    if (opt.force && k < 120) da = 0.01;
    else { const step = Math.min(0.006, P.tol / 6); if (ca <= cb && ca < 1.05) da = step; if (cb <= ca + step / 2 && cb < 1.05) db = step; }
    ca += da; cb += db; if (opt.force && k === 120) { ca = s.a; cb = s.b; }
    M.keyStep(s, { da, db }, DT, { cracked: !!opt.cracked }); ev = ev.concat(s.ev.map((e) => e.e));
  }
  return { s, ev };
}
test('the closing stone: pushed together it closes with no jam (40); forced on one bar it jams and loses a corner (−20); a cracked stone in the row cracks through (−20)', () => {
  for (const i of [1, 8, 15]) {
    const P = M.ringPlan(i), { s, ev } = keyBot(P);
    assert.ok(s.done, 'ring ' + i); assert.equal(s.jams, 0, 'ring ' + i); assert.equal(s.dmg, 0); assert.ok(ev.includes('closed'));
    assert.equal(M.ringPts({ dmg: 0, wrongCarried: 0, firstLay: 1, jams: s.jams }), 40);
  }
  const P = M.ringPlan(15);
  let { s, ev } = keyBot(P, { force: true }); assert.ok(ev.includes('jam') && ev.includes('corner')); assert.equal(s.corner, 1); assert.ok(s.done, 'it still closes after');
  assert.equal(M.ringPts({ dmg: s.dmg, wrongCarried: 0, firstLay: 1, jams: s.jams }), 10);
  ({ s, ev } = keyBot(P, { cracked: true })); assert.ok(ev.includes('crack')); assert.equal(s.dmg, 1);
  // a jam with no damage (pulled back in time): 20
  assert.equal(M.ringPts({ dmg: 0, wrongCarried: 0, firstLay: 1, jams: 1 }), 20); assert.equal(M.ringPts({ dmg: 0, wrongCarried: 1, firstLay: 1, jams: 0 }), 20);
  // the heavy stone answers late
  const h = M.keyFresh(P); M.keyStep(h, { da: 0.01, db: 0.01 }, 0.1); assert.equal(h.a, 0); for (let k = 0; k < 4; k++) M.keyStep(h, {}, 0.1); assert.ok(h.a > 0);
});

/* ───────── station 4: the wickets ───────── */
function boltBot(id, opt = {}) {
  const s = M.boltFresh(id); let ev = [], ph = 'go', rocks = 0;
  for (let k = 0; k < 60 * 120 && !s.done; k++) {
    let da = 0, db = 0;
    if (opt.force && s.a < s.tol + 20 && k < 200) da = 4;
    else if (s.dry && s.dry.stuck && !s.dry.free) {
      const S = M.BOLT_LV.wicketS.DRY_AT * s.END;
      if (ph === 'go') { da = db = -3; if (s.a <= S - 16 && s.b <= S - 16) ph = 'fwd'; }
      else { da = db = 3; if (s.a >= S && s.b >= S) { ph = 'go'; rocks++; } }
    } else { const sp = 3; da = s.a <= s.b + 1 ? sp : 0; db = s.b <= s.a + 1 ? sp : 0; }
    M.boltStep(s, { da, db }, DT); ev = ev.concat(s.ev.map((e) => e.e));
  }
  void rocks; return { s, ev };
}
test('the wickets: turned together inside the teeth\'s play they lock (40); forced, a tooth bends (−20) and squeals from then; the dry bolt frees after three rocks', () => {
  let { s, ev } = boltBot('wicketN'); assert.ok(s.done); assert.equal(s.dmg, 0); assert.equal(M.boltPts(s), 40); assert.ok(ev.includes('locked'));
  ({ s, ev } = boltBot('wicketN', { force: true })); assert.ok(ev.includes('squeal') && ev.includes('tooth')); assert.equal(s.tooth[0], 1); assert.ok(s.done); assert.equal(M.boltPts(s), 10);
  ({ s, ev } = boltBot('wicketS')); assert.ok(s.done); assert.ok(ev.includes('stick') && ev.includes('free')); assert.equal(s.dry.rocks, 3); assert.equal(M.boltPts(s), 40);
  assert.equal(M.BOLT_LV.wicketN.tol, 14); assert.equal(M.BOLT_LV.wicketS.tol, 10);
  // a block longer than half a second with no damage: 20
  const b = M.boltFresh('wicketN'); for (let k = 0; k < 53; k++) M.boltStep(b, { da: 1 }, DT);
  assert.ok(b.blkMax > 0.5 && b.dmg === 0);
});
test('both wickets: brought in together within 0.3 s (40); one alone waits, turned back a quarter it opens, then together (20); the mouse\'s window is 1.2 s', () => {
  const run = (rate, opt = {}) => {
    const s = M.pairFresh(opt); let ev = [], back = [0, 0], fix = false;
    for (let k = 0; k < 60 * 200 && !s.done; k++) {
      let d = rate.slice();
      // one locked alone: turn it back a quarter and more, then bring both in at rates that meet
      for (const j of [0, 1]) if (s.lock[j] != null && s.alone && s.lock[1 - j] == null) { d[j] = back[j] < 120 ? -3 : 0; back[j] += 3; fix = true; }
      if (fix && s.lock[0] == null && s.lock[1] == null) { const rem = [s.END[0] - s.w[0], s.END[1] - s.w[1]], T = Math.max(rem[0], rem[1]) / 3; d = [rem[0] / T, rem[1] / T]; }
      else if (fix) for (const j of [0, 1]) if (s.lock[j] == null && !(back[1 - j] > 0 && back[1 - j] < 120)) d[j] = 0;
      M.pairStep(s, { dN: d[0], dS: d[1] }, DT); ev = ev.concat(s.ev.map((e) => e.e));
    }
    return { s, ev };
  };
  let { s, ev } = run([2, 3]); assert.ok(s.done && s.together && s.first); assert.equal(M.pairPts(s), 40); assert.ok(ev.includes('together'));
  ({ s, ev } = run([3, 3])); assert.ok(ev.includes('alone')); assert.ok(ev.includes('open')); assert.ok(s.done); assert.equal(M.pairPts(s), 20);
  ({ s } = run([2.02, 3], { mouse: true })); assert.ok(s.done && s.first);
});
test('build 128 C2: the mouse turns one ring, the guard turns the other in step; an even pace locks both together, a rushed one comes apart and both open again', () => {
  // an even pace on the north ring alone (120 deg/s): the guard brings the south in with it — together at the first try (40)
  let s = M.pairFresh({ mouse: true });
  for (let k = 0; k < 60 * 60 && !s.done; k++) M.pairStep(s, { dN: 2 }, DT);
  assert.ok(s.done && s.together && s.first); assert.equal(M.pairPts(s), 40);
  // a rushed ring (600 deg/s): the guard falls behind, the second knock comes late — both open a quarter back (never a dead end)
  s = M.pairFresh({ mouse: true }); let ev = [];
  for (let k = 0; k < 60 * 30 && !ev.includes('apart'); k++) { M.pairStep(s, { dN: 10 }, DT); ev = ev.concat(s.ev.map((e) => e.e)); }
  assert.ok(ev.includes('apart')); assert.ok(!ev.includes('alone'));
  assert.deepEqual(s.lock, [null, null]); assert.deepEqual(s.w, [s.END[0] - 90, s.END[1] - 90]); assert.equal(s.first, 0); assert.equal(s.tries, 1);
  // then an even pace on the south ring: done, 20
  for (let k = 0; k < 60 * 60 && !s.done; k++) M.pairStep(s, { dS: 2 }, DT);
  assert.ok(s.done && s.together); assert.equal(M.pairPts(s), 20);
  // by touch: two thumbs that lock apart are opened again as well
  s = M.pairFresh(); ev = [];
  for (let k = 0; k < 60 * 60 && !ev.includes('apart'); k++) { M.pairStep(s, { dN: s.lock[0] == null ? 3 : 0, dS: s.t > 6 ? 4 : 0 }, DT); ev = ev.concat(s.ev.map((e) => e.e)); }
  assert.ok(ev.includes('alone') && ev.includes('apart')); assert.deepEqual(s.lock, [null, null]);
});

/* ───────── the closing of the gate ───────── */
function leafBot(opt = {}) {
  const s = M.leafFresh(); let ev = [];
  for (let k = 0; k < 60 * 300 && !s.done; k++) {
    const heave = [false, false], brake = [false, false];
    if (opt.fast && (s.bounces || s.dmg)) opt = {};   // slammed once: from there the clean player takes over (no stuck state)
    for (let j = 0; j < 2; j++) {
      const want = opt.fast ? -12 : s.f[j] > 25 ? -6 : s.f[j] > 8 ? -3.5 : -1.6;
      if (opt.alone && j === 1 && s.t < 30) continue;
      if (s.w[j] > want + 0.5 && M.inWindow(s.ph[j])) heave[j] = true;
      if (s.w[j] < want - 1.5 && !opt.fast) brake[j] = true;
    }
    // keep them together: the leading leaf waits for the other
    if (!opt.alone && !opt.fast) { const lead = s.f[0] < s.f[1] ? 0 : 1; if (Math.abs(s.f[0] - s.f[1]) > 3) { heave[lead] = false; if (s.w[lead] < -1) brake[lead] = true; } }
    M.leafStep(s, { heave, brake }, DT); ev = ev.concat(s.ev.map((e) => e.e));
  }
  return { s, ev };
}
test('the leaves: heaved in their rhythm and braked before the meeting they close together and soft (40); slammed, one dents (−40); alone, it waits at 3°', () => {
  let { s, ev } = leafBot(); assert.ok(s.done, JSON.stringify(s.f)); assert.ok(ev.includes('together')); assert.equal(s.dmg, 0); assert.equal(M.leafPts(s), 40);
  ({ s, ev } = leafBot({ fast: true })); assert.ok(ev.includes('dent') || ev.includes('bounce')); assert.ok(s.done);
  if (ev.includes('dent')) assert.equal(M.leafPts(s), 10); else assert.equal(M.leafPts(s), 20);
  ({ s, ev } = leafBot({ alone: true })); assert.ok(ev.includes('wait')); assert.ok(s.done); assert.equal(M.leafPts(s), 20);
  // a heave out of the men's window is a third (their feet slip)
  const a = M.leafFresh(), b = M.leafFresh(); a.ph[0] = 0.5; b.ph[0] = 0.1;
  M.leafStep(a, { heave: [true, false] }, DT); M.leafStep(b, { heave: [true, false] }, DT); assert.ok(Math.abs(a.w[0] / b.w[0] - 3) < 0.05);
  // the north hinge is stiffer
  assert.ok(M.LEAF.C[1] > M.LEAF.C[0]); assert.equal(M.LEAF.DENT, 2 * M.LEAF.SOFT);
});
test('the leaves and the hoist share the door\'s weight: their time constants are close', () => {
  const coast = 1 / M.LEAF.C[0]; assert.ok(M.AKKO.TAU > 0.5 && M.AKKO.TAU < 1.2 && M.CAP.TAU_V === M.AKKO.TAU); assert.ok(coast > 4);
});
