// build 130 — the new stage 05's pure model (docs/specs/build130-brief.md §2): every function, the level tables' conditions (a)–(d),
// the loss flags, the free-choice face, the save's round trip, an old save.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../src/game/h130/model.js';
import { BOOK } from '../src/game/world/grid.js';

const S5 = BOOK.s05;
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;

/* ───────── the gallery ───────── */
test('gallery: the runs are the book\'s, with their ladders crossing along the line', () => {
  assert.deepEqual([M.RUNS.N.a0, M.RUNS.N.a1, M.RUNS.N.line], [46, 101, -62.5]);
  assert.deepEqual([M.RUNS.S.a0, M.RUNS.S.a1, M.RUNS.S.line], [46, 101, 62.5]);
  assert.deepEqual([M.RUNS.E.a0, M.RUNS.E.a1, M.RUNS.E.line, ...M.RUNS.E.cut], [-27.5, 27.5, 136, -13, 13]);
  assert.deepEqual([...M.RUNS.N.ladders].sort((a, b) => a - b), [47.4, 99.6]);
  assert.deepEqual([...M.RUNS.S.ladders].sort((a, b) => a - b), [47.4, 99.6]);
  assert.deepEqual([...M.RUNS.E.ladders].sort((a, b) => a - b), [-14.6, 26]);
  assert.deepEqual(M.colXZ(M.RUNS.N, 60), [60, -62.5]);
  assert.deepEqual(M.colXZ(M.RUNS.E, -20), [136, -20]);
});

test('gallery: spans gives every gap with the two end gaps; the beams straight, sagging, cracking', () => {
  const g = M.spans(M.RUNS.N, [90, 57, 68, 79]);
  assert.deepEqual(g.map((x) => x.len), [11, 11, 11, 11, 11]);
  assert.ok(g.every((x) => x.kind === 'straight' && x.sag === 0));
  const g2 = M.spans(M.RUNS.N, [59, 72, 85]);
  assert.deepEqual(g2.map((x) => x.kind), ['sag', 'sag', 'sag', 'crack']);
  assert.equal(M.beamOf(12), 'straight'); assert.equal(M.beamOf(12.01), 'sag'); assert.equal(M.beamOf(14), 'sag'); assert.equal(M.beamOf(14.01), 'crack');
  assert.equal(M.sagOf(12), 0); assert.ok(near(M.sagOf(14), M.GAL.SAG_MAX)); assert.ok(M.sagOf(13) > 0 && M.sagOf(13) < M.GAL.SAG_MAX);
  // the east: two segments, the gate's jambs carry the beams
  const e = M.spans(M.RUNS.E, [-20, 20]);
  assert.deepEqual(e.map((x) => [x.a0, x.a1]), [[-27.5, -20], [-20, -13], [13, 20], [20, 27.5]]);
  assert.deepEqual(e.map((x) => x.seg), [0, 0, 1, 1]);
});

test('gallery: where a column may not stand — the ends, the gate\'s passage, a ladder, another column', () => {
  const N = M.RUNS.N, E = M.RUNS.E;
  assert.equal(M.blockedAt(N, 46.5), 'end');
  assert.equal(M.blockedAt(N, 48), 'ladder');
  assert.equal(M.blockedAt(N, 60), null);
  assert.equal(M.blockedAt(N, 61, [60]), 'near');
  assert.equal(M.blockedAt(E, 0), 'gate');
  assert.equal(M.blockedAt(E, -15), 'ladder');
  assert.equal(M.blockedAt(E, -20), null);
  assert.equal(M.placeOk(N, 48), 46.9 + 2 > 48 ? M.placeOk(N, 48) : null);
  assert.ok(!M.blockedAt(N, M.placeOk(N, 48)));
  assert.ok(Math.abs(M.placeOk(E, 0) - 0) >= 13);
});

test('gallery: hides — the line from a spectator to the torch passes within 1.2 of the column', () => {
  assert.equal(M.hides([60, -62.5], [60, -65], [60, 0]), true);
  assert.equal(M.hides([61.5, -62.5], [60, -65], [60, 0]), false);
  assert.ok(near(M.segDist([1, 1], [0, 0], [2, 0]), 1));
});

test('gallery: testBelow names who loses the torch behind which column; testAbove the sagging seat rows', () => {
  const L = M.LEVELS[1], w = L.watch[0], t = L.torch[0];
  // a column right on spectator 0's line
  const k = (M.RUNS.N.line - w[1]) / (t[1] - w[1]), x = w[0] + (t[0] - w[0]) * k;
  const r = M.testBelow([x, 70, 82.5 + 7, 95], 1);
  assert.equal(r.ok, false); assert.ok(r.lost.some((q) => q.w === 0 && q.col === 0)); assert.deepEqual(r.hidden.includes(0), true);
  const sol = M.solve(1, 4).best.cols;
  assert.equal(M.testBelow(sol, 1).ok, true);
  const up = M.testAbove([59, 72, 85, 97], 1);
  assert.ok(up.rows.length >= 1 && up.cut);
  assert.equal(M.testAbove(sol, 1).cut, false);
});

test('gallery: galCheck and galPts — מהודר only with the least columns, straight beams and the torch seen', () => {
  const sol = M.solve(1, 4).best.cols;
  const c = M.galCheck(sol, 1); assert.equal(c.mehudar, true); assert.equal(M.galPts(c), 40);
  const sol5 = M.solve(1, 5, 0.5).best.cols, c5 = M.galCheck(sol5, 1);
  assert.equal(c5.mehudar, false); assert.equal(M.galPts(c5), 20);
  const cr = M.galCheck([59, 72, 85], 1); assert.ok(cr.cracks >= 1); assert.equal(M.galPts(cr), 10);
});

for (const lv of [1, 2, 3]) {
  test(`gallery level ${lv}: the table's conditions (a) even spacing fails, (b) the least has room 1.5 … 3, (c) one more is easy, (d) the menorah clear`, () => {
    const L = M.LEVELS[lv];
    // (a) the even spacing fails (a column hides the torch, or a beam is not straight)
    const ev = M.evenOf(lv), c = M.galCheck(ev, lv);
    assert.ok(!c.mehudar, 'the even spacing must fail: ' + JSON.stringify(ev));
    // (b) the least number solves it, with the tightest column's room 1.5 … 3; one less cannot
    const r = M.solve(lv, L.n);
    assert.ok(r.best, 'a solution exists');
    assert.ok(r.best.room >= 1.5 - 1e-9 && r.best.room <= 3 + 1e-9, 'room ' + r.best.room);
    assert.equal(M.solve(lv, L.n - 1).count, 0, 'one column less has no layout');
    assert.equal(M.galCheck(r.best.cols, lv).mehudar, true);
    // (c) one more column makes it easy (ten times the layouts or more, on the same grid, and as much room at least), but not מהודר
    const r1 = M.solve(lv, L.n + 1, 0.5), rh = M.solve(lv, L.n, 0.5);
    assert.ok(r1.count >= 10 * rh.count, `n+1 layouts ${r1.count} against ${rh.count}`);
    assert.ok(r1.best.room >= rh.best.room - 1e-9, 'n+1 room ' + r1.best.room);
    assert.equal(M.galCheck(r1.best.cols, lv).mehudar, false);
    // (d) no spectator-to-torch line within 2 of the menorah
    assert.ok(M.menorahGap(lv) >= M.GAL.MENORAH, 'menorah ' + M.menorahGap(lv));
    // the stock: the least plus the spare
    assert.equal(L.stock + L.spare, L.n + 1);
    // the spectators stand by the wall (the book's gal.watch)
    for (const [x, z] of L.watch) assert.ok(L.side === 'E' ? x === S5.gal.watch.E : z === S5.gal.watch[L.side]);
  });
}

test('gallery: level 2 has three spectators and three torch stops; level 3 one column a segment and the raised one', () => {
  assert.equal(M.LEVELS[1].watch.length, 2); assert.equal(M.LEVELS[1].torch.length, 1);
  assert.equal(M.LEVELS[2].watch.length, 3); assert.equal(M.LEVELS[2].torch.length, 3);
  assert.equal(M.LEVELS[3].n, 2); assert.equal(M.LEVELS[3].raise, 'N');
  const b = M.solve(3, 2).best.cols; assert.ok(b.some((a) => a < 0) && b.some((a) => a > 0));
});

test('the raising: build 120\'s column on the ropes, kept as it is (pull past the balance, brake, land; a hard landing chips, a free one falls)', () => {
  // pulled steadily with the brake held at the balance and paid out slowly: it stands
  const s = M.colFresh(); let ev = [], t = 0;
  while (s.phase === 'rise' && t < 60) { const press = s.th >= M.BAL - 1; ev = ev.concat(M.colStep(s, { held: !press, pT: press ? 0 : 1, press, pay: press ? 0.02 : 0 }, 1 / 60)); t += 1 / 60; }
  assert.equal(s.phase, 'landed'); assert.ok(ev.includes('cross'));
  assert.ok(M.colPts({ lean: M.leanAfter(s), off: s.off, wedges: 0 }) >= 10);
  // let go past the balance with no brake: it lands too hard
  const f = M.colFresh(); t = 0; while (f.phase === 'rise' && t < 60) { M.colStep(f, { held: f.th < M.BAL + 2, pT: 0.9, press: false }, 1 / 60); t += 1 / 60; }
  assert.ok(f.phase === 'fell' || f.chip === 1);
  // the sharp pull: a warning, then a tear back onto the cradle
  const g = M.colFresh(); g.th = 50; const e1 = M.colStep(g, { held: true, pT: 0.5, sharp: true }, 1 / 60), e2 = M.colStep(g, { held: true, pT: 0.5, sharp: true }, 1 / 60);
  assert.ok(e1.includes('warn')); assert.ok(e2.includes('tear')); assert.equal(g.th, M.CRADLE);
  assert.ok(near(M.pullShare(M.BAL - 1), 1)); assert.equal(M.pullShare(M.BAL + 5), 0);
  const c = { lean: [0, 0], wedges: 0 }; M.wedge(c, [1, 0]); assert.deepEqual(c.lean, [-1, 0]); assert.equal(c.wedges, 1);
});

/* ───────── the wood ───────── */
test('wood: the level tables — six, eight, six big; level 2 hides every worm under bark; level 3 has bad ends', () => {
  assert.equal(M.LOGS[1].length, 6); assert.equal(M.LOGS[2].length, 8); assert.equal(M.LOGS[3].length, 6);
  assert.ok(M.LOGS[1].some(M.wormy) && M.LOGS[1].some((l) => !M.wormy(l)));
  for (const l of M.LOGS[1]) assert.equal(l.bark.length, 0);
  for (const l of M.LOGS[2]) for (const h of l.holes) assert.ok(l.bark.some((b) => h.s >= b.s0 && h.s <= b.s1), l.id + ' a hole outside the bark');
  for (const l of M.LOGS[2]) if (l.holes.length) assert.ok(l.hollow, l.id + ' a worm the tap finds');
  assert.ok(M.LOGS[3].filter((l) => l.hollow).every((l) => l.hollow.s0 === 0 || l.hollow.s1 === l.L));
  assert.ok(M.LOGS[3].every((l) => l.L >= 5.8 && l.r >= 0.48));
});

test('wood: rolling turns it a whole turn both ways and shows the holes that face the eye', () => {
  const S = M.logFresh(1, 1); let seen = new Set(), r;
  for (let k = 0; k < 40; k++) { r = M.rollStep(S, 10); for (const i of r.seen) seen.add(i); }
  for (let k = 0; k < 40; k++) { r = M.rollStep(S, -10); for (const i of r.seen) seen.add(i); }
  assert.equal(seen.size, S.log.holes.length); assert.equal(r.turned, true);
  // under bark (level 2) the holes are not seen until peeled
  const B = M.logFresh(2, 1); const all = new Set(); for (let k = 0; k < 36; k++) for (const i of M.rollStep(B, 10).seen) all.add(i);
  assert.equal(all.size, 0);
});

test('wood: the tap — deep and still, hollow where the worm ate (trembling to the eye), less just past its end', () => {
  const L = M.LOGS[2][1];
  assert.deepEqual(M.tapAt(L, 1.0), { sound: 'deep', tremble: 0.05, dust: false });
  const h = M.tapAt(L, 2.4); assert.equal(h.sound, 'hollow'); assert.equal(h.tremble, 1); assert.equal(h.dust, true);
  const e = M.tapAt(L, L.hollow.s1 + 0.1); assert.ok(e.tremble > 0.05 && e.tremble < 1);
  assert.equal(M.tapAt(M.LOGS[1][0], 2).sound, 'deep');
});

test('wood: peeling a strip shows what is under it', () => {
  const S = M.logFresh(2, 1), h = S.log.holes[0];
  const p = M.peelAt(S, h.s, h.ang); assert.ok(p.found.includes(0));
  // now rolled to face the eye it is seen
  S.rot = -h.ang; assert.ok(M.seenHoles(S).includes(0));
  const q = M.peelAt(M.logFresh(2, 0), 1.0, 160); assert.deepEqual(q.found, []);
});

test('wood: the decision and the cut — wood.worm for a worm in the pile or a cut too near; waste for good wood thrown or cut far', () => {
  const bad = M.LOGS[1][1], good = M.LOGS[1][0];
  assert.deepEqual(M.decide(bad, 'clean'), { ok: false, flag: 'wood.worm', waste: 0 });
  assert.deepEqual(M.decide(bad, 'out'), { ok: true, flag: null, waste: 0 });
  assert.deepEqual(M.decide(good, 'out'), { ok: false, flag: null, waste: 1 });
  assert.deepEqual(M.decide(good, 'clean'), { ok: true, flag: null, waste: 0 });
  const end = M.LOGS[3][0]; // hollow 0 … 1.6
  assert.equal(M.cutAt(end, 1.6 + 0.6).res, 'right');
  const n = M.cutAt(end, 1.7); assert.equal(n.res, 'near'); assert.equal(n.flag, 'wood.worm');
  const f = M.cutAt(end, 3.5); assert.equal(f.res, 'far'); assert.ok(f.lost > 0);
  const other = M.LOGS[3][2]; // hollow 4.3 … 6 (the other end)
  assert.equal(M.cutAt(other, 4.3 - 0.5).res, 'right'); assert.equal(M.cutAt(other, 4.2).res, 'near');
  assert.equal(M.cutAt(M.LOGS[3][1], 3).res, 'waste');
  // a log cut right goes to the clean pile with no flag; cut near it carries the worm
  assert.equal(M.decide(end, 'clean', M.cutAt(end, 2.2)).flag, null);
  assert.equal(M.decide(end, 'clean', M.cutAt(end, 1.7)).flag, 'wood.worm');
  assert.equal(M.woodPts({}), 40); assert.equal(M.woodPts({ waste: 1 }), 20); assert.equal(M.woodPts({ dmg: 1 }), 10);
});

test('wood (W): a bad end thrown out whole wastes the good wood; the best cut is right; the pieces of a cut', () => {
  const end = M.LOGS[3][0], other = M.LOGS[3][2], good = M.LOGS[3][1];
  assert.ok(M.endBad(end) && M.endBad(other) && !M.endBad(good) && !M.endBad(M.LOGS[2][1]));
  assert.deepEqual(M.decide(end, 'out'), { ok: true, flag: null, waste: 1 });
  assert.deepEqual(M.decide(M.LOGS[2][1], 'out'), { ok: true, flag: null, waste: 0 });
  for (const l of M.LOGS[3]) if (M.endBad(l)) { const s = M.bestCut(l); assert.equal(M.cutAt(l, s).res, 'right', l.id); assert.equal(M.decide(l, 'clean', M.cutAt(l, s)).flag, null); }
  assert.equal(M.bestCut(good), null);
  assert.deepEqual(M.piecesOf(end, 2.35), { keep: [2.35, end.L], out: [0, 2.35] });
  assert.deepEqual(M.piecesOf(other, 3.55), { keep: [0, 3.55], out: [3.55, other.L] });
});

/* ───────── the light ───────── */
test('light: the wick — a sharp pull tears it (no loss, a new strip), a steady one makes it; the width is the choice', () => {
  const S = M.wickFresh(0.2);
  assert.deepEqual(M.wickStep(S, 0.3, 2), ['tear']); assert.equal(S.tears, 1); assert.equal(S.len, 0);
  let ev = []; for (let k = 0; k < 12; k++) ev = ev.concat(M.wickStep(S, 0.1, 0.8)); assert.ok(ev.includes('done')); assert.equal(S.done, 1);
  const thick = M.wickOf(0.22), thin = M.wickOf(0.08);
  assert.ok(thick.strength > thin.strength && thick.rate > thin.rate);
  assert.equal(M.wickFresh(1).w, M.WICK.MAX);
});

test('light: the seven measures (a hin of twelve log), thirty in three pours is מהודר, over thirty runs over', () => {
  assert.deepEqual(M.MEASURES.map((m) => m.name), ['הין', 'חצי ההין', 'שלישית ההין', 'רביעית ההין', 'לג', 'חצי לג', 'רביעית לג']);
  assert.equal(M.MEASURES[0].log, 12); assert.equal(M.minPours(30), 3);
  assert.deepEqual(M.measure(['hin', 'hin', 'half']), { total: 30, n: 3, over: false, exact: true, mehudar: true });
  const m4 = M.measure(['hin', 'half', 'half', 'half']); assert.equal(m4.exact, true); assert.equal(m4.mehudar, false);
  assert.equal(M.measure(['hin', 'hin', 'hin']).over, true);
});

test('light: the ladder — rungs taken hand by hand, the jar swings late, a lift toward its lean spills, past the limit it drops', () => {
  // a calm climb: lift each hand as the jar passes the middle going away from it
  const S = M.climbFresh(6, 30); let ev = [], guard = 0;
  while (S.rung < S.top && guard++ < 20000) {
    const e = [];
    if (!S.up) {
      const h = S.L <= S.R ? 'L' : 'R', sg = h === 'R' ? 1 : -1;
      if (Math.abs(S.phi) < 0.06 && -sg * S.w >= 0) e.push(...M.climbStep(S, { h, a: 'lift' }, 1 / 120));
      else e.push(...M.climbStep(S, null, 1 / 120));
    } else { e.push(...M.climbStep(S, null, 1 / 120)); if (S.t % 0.4 < 1 / 120) e.push(...M.climbStep(S, { h: S.up, a: 'place' }, 0)); }
    ev = ev.concat(e);
  }
  assert.ok(ev.includes('top')); assert.equal(S.dropped, 0); assert.ok(S.oil > 29);
  // a lift while the jar leans to that hand's side spills
  const T = M.climbFresh(6, 30); T.phi = 0.3; const sp = M.climbStep(T, { h: 'R', a: 'lift' }, 1 / 120); assert.ok(sp.includes('spill')); assert.ok(T.oil < 30);
  // a lean past the limit drops the jar (light.jar)
  const D = M.climbFresh(6, 30); D.phi = 0.6; D.w = 3; const dr = M.climbStep(D, null, 0.1); assert.ok(dr.includes('drop')); assert.equal(D.dropped, 1);
  assert.equal(M.climbQuiet(M.climbFresh()), true);
});

test('light: pouring — slow into the bowl, too far or too fast outside; lightOf grows with oil and wick', () => {
  const P = M.pourFresh(30); for (let k = 0; k <= 30; k++) M.pourStep(P, 0.6 * k / 30, 1 / 30); for (let k = 0; k < 200; k++) M.pourStep(P, 0.6, 1 / 30); assert.ok(P.bowl > 25 && P.out < 0.01);
  const Q = M.pourFresh(30); M.pourStep(Q, 0, 1 / 30); for (let k = 0; k < 100; k++) M.pourStep(Q, 1, 1 / 30); assert.ok(Q.out > 1);
  const a = M.lightOf([30, 30, 30, 30], [0.14, 0.14, 0.14, 0.14]), b = M.lightOf([10, 0, 30, 30], [0.14, 0.14, 0.14, 0.14]);
  assert.equal(a.flames.length, 4); assert.ok(a.reach > b.reach); assert.equal(b.flames[1].strength, 0);
  assert.equal(M.lightPts({}), 40); assert.equal(M.lightPts({ spilled: 1 }), 20); assert.equal(M.lightPts({ dmg: 1 }), 10);
});

/* ───────── the loss, the face, the save ───────── */
test('the loss table: the four flags, their points; never below zero', () => {
  assert.deepEqual(Object.keys(M.LOSS).sort(), ['gal.beam', 'gal.column', 'light.jar', 'wood.worm']);
  assert.equal(M.lossPts('gal.beam'), 20); assert.equal(M.lossPts('gal.column'), 40); assert.equal(M.lossPts('wood.worm'), 20); assert.equal(M.lossPts('light.jar'), 20);
  assert.equal(M.lossPts('nothing'), 0); assert.equal(M.applyLoss(10, 40), 0); assert.equal(M.applyLoss(100, 20), 80);
  assert.equal(M.grade(1, true), 10); assert.equal(M.grade(0, true), 40); assert.equal(M.grade(0, false), 20);
  assert.equal(M.starsOf(M.qOf(40)), 3); assert.equal(M.starsOf(M.qOf(20)), 2); assert.equal(M.starsOf(M.qOf(10)), 1);
});

test('the face: ten works; the gallery in order, the wood free, the light after gal3, the evening right after light3', () => {
  assert.deepEqual(M.PLAN.map((m) => m.id), ['gal1', 'gal2', 'gal3', 'wood1', 'wood2', 'wood3', 'light1', 'light2', 'light3', 'eve']);
  assert.deepEqual([...M.KINDS], ['gallery', 'wood', 'light', 'eve']);
  const F = M.createH130();
  assert.deepEqual(F.open().map((m) => m.id), ['gal1', 'wood1']);
  F.pick('gal1'); F.done({ stars: 3 }); F.pick('gal2'); F.done({ stars: 2 });
  assert.deepEqual(F.open().map((m) => m.id), ['gal3', 'wood1']);
  F.pick('gal3'); F.done({ stars: 2 }); assert.deepEqual(F.open().map((m) => m.id), ['wood1', 'light1']);
  for (const id of ['light1', 'light2', 'light3']) { F.pick(id); F.done({ stars: 1 }); }
  assert.ok(F.open().some((m) => m.id === 'eve'));
  F.pick('eve'); F.done({}); assert.equal(F.finished(), false);
  for (const id of ['wood1', 'wood2', 'wood3']) { F.pick(id); F.done({ stars: 3 }); }
  assert.equal(F.finished(), true); assert.equal(F.count()[0], 10);
  assert.equal(F.mark('gal.beam', 'gal1', [60, -62.5]), 20); assert.equal(F.mark('nope', 'x'), 0); assert.equal(F.marksOf('gal.beam').length, 1);
  assert.equal(F.levelOf(M.PLAN[1]), 2);
  const G = M.createH130(); G.autoTo((m) => m.id === 'light1'); assert.equal(G.mission().id, 'light1');
});

test('the save: a round trip keeps everything, an unknown current work is dropped', () => {
  const F = M.createH130(); F.pick('gal1'); F.st.gal.N = { cols: [56, 66.5, 78.5, 89], props: [] }; F.done({ stars: 3, q: 1 }); F.mark('gal.beam', 'gal1', [60, -62.5]);
  const again = M.createH130(JSON.parse(JSON.stringify(F.st)));
  assert.deepEqual(again.st, JSON.parse(JSON.stringify(F.st)));
  assert.deepEqual(again.galOf('N').cols, [56, 66.5, 78.5, 89]); assert.equal(again.galOf('S'), null);
  const bad = M.createH130({ ...JSON.parse(JSON.stringify(F.st)), cur: 'saw1' }); assert.equal(bad.st.cur, null);
  assert.equal(M.createH130({ v: 99 }).st.v, 1);
});

test('an old save (build 120\'s stage 05): finished → built by the crews, every station open; in the middle → from the beginning', () => {
  const C = M.createH130(M.fromOld({ v: 1, done: ['col1'] }, true));
  assert.equal(C.st.crews, 1); assert.equal(C.nDone(), 0);
  assert.deepEqual(C.galOf('N').cols, [57, 68, 79, 90]); assert.deepEqual(C.galOf('S').cols, [57, 68, 79, 90]); assert.equal(C.galOf('E').cols.length, 2);
  assert.deepEqual(C.open().map((m) => m.id), ['gal1', 'wood1', 'light1']);
  const Mid = M.createH130(M.fromOld({ v: 1, done: ['col1'] }, false));
  assert.equal(Mid.st.crews, 0); assert.deepEqual(Mid.open().map((m) => m.id), ['gal1', 'wood1']); assert.equal(Mid.galOf('N'), null);
});
