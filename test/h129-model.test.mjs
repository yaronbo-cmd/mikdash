// ── build 129 ── stage 07's model (brief §2, §10): the plan (three stations free, inside each in order, the night last), the save's round
// trip, the grades and the loss table; the Gazit's bench, sight, room, walkers and semicha; the Golah's swing, meeting, rim, pour, channel
// and troughs played clean by plain bots and with each named mistake once; the arches' legs and wedges (three right orders and three wrong
// ones in the great vault); the night's slab.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../src/game/h129/model.js';
import { BOOK } from '../src/game/world/grid.js';

const DT = 1 / 60, G = BOOK.s07.gazit;

/* ───────── the plan, the save, the grades ───────── */
test('the plan: ten works; the three stations free among themselves, in order inside each; the night after the nine', () => {
  assert.deepEqual(M.PLAN.map((m) => m.id), ['gazit1', 'gazit2', 'gazit3', 'golah1', 'golah2', 'golah3', 'vaultN', 'vaultS', 'vaultM', 'night']);
  const F = M.createH129(), open = () => F.open().map((m) => m.id), go = (id) => { assert.ok(F.pick(id), id); F.done({ stars: 3, pts: 40 }); };
  assert.deepEqual(open(), ['gazit1', 'golah1', 'vaultN']);
  assert.equal(F.pick('gazit2'), null); assert.equal(F.pick('night'), null);
  go('vaultN'); assert.deepEqual(open(), ['gazit1', 'golah1', 'vaultS']);
  go('golah1'); go('golah2'); go('gazit1'); assert.deepEqual(open(), ['gazit2', 'golah3', 'vaultS']);
  for (const id of ['gazit2', 'gazit3', 'golah3', 'vaultS']) go(id);
  assert.ok(!open().includes('night')); go('vaultM'); assert.deepEqual(open(), ['night']); go('night'); assert.ok(F.finished());
  // a damage kept in the save comes back with it, and the play count too
  const F2 = M.createH129(); F2.pick('golah1'); assert.equal(F2.mark('golah.flood', 'golah1', 'A'), 20); assert.equal(F2.mark('vault.stone', 'vaultM', 2), 40);
  assert.equal(F2.mark('nothing', 'golah1'), 0); F2.done({ stars: 1, pts: 10 });
  const again = M.createH129(JSON.parse(JSON.stringify(F2.st)));
  assert.deepEqual(again.marksOf('golah.flood').map((x) => x.at), ['A']); assert.equal(again.st.plays.golah1, 1); assert.ok(again.isDone('golah1'));
  assert.equal(M.createH129({ v: 1, cur: 'nope', done: [] }).st.cur, null);
});
test('grades and losses: 40 → three stars, 20 → two, 10 → one; the table of §10; never below zero; no Divine Name, no 71', () => {
  assert.equal(M.starsOf(M.qOf(40)), 3); assert.equal(M.starsOf(M.qOf(20)), 2); assert.equal(M.starsOf(M.qOf(10)), 1);
  assert.deepEqual(Object.keys(M.LOSS).sort(), ['gazit.crack', 'gazit.ink', 'golah.bucket', 'golah.flood', 'golah.rim', 'night.slab', 'vault.crack', 'vault.stone']);
  for (const k of Object.keys(M.LOSS)) assert.equal(M.lossPts(k, 'x'), 20, k);
  assert.equal(M.lossPts('vault.stone', 'vaultM'), 40); assert.equal(M.lossPts('vault.stone', 'vaultN'), 20);
  assert.equal(M.applyLoss(30, 40), 0); assert.equal(M.applyLoss(70, 20), 50); assert.equal(M.applyLoss(10, -5), 10);
  for (const s of [...Object.values(M.LINES), ...Object.values(M.QUICK), ...Object.values(M.LOSS).map((x) => x[0])]) { assert.ok(!/יהוה|אלהים/.test(s)); assert.ok(!/71|שבעים ואחד/.test(s)); }
  assert.ok(M.LINES.night.includes('(המחשה)'));
});

/* ───────── station 1: the Gazit ───────── */
// a round bench: seven stones on a circle of radius R (ends forward), the middle stone's back at z `back`
function arc(R, back = 79.4, xm = (G.row0.xs[0] + G.row0.xs[6]) / 2) {
  const cz = back - R, dth = 2 * Math.asin(2.0 / R), out = [];
  for (let i = 0; i < 7; i++) { const th = (i - 3) * dth; out.push({ i, x: xm + R * Math.sin(th), z: cz + R * Math.cos(th), a: -th, L: 4, D: 1.5, s: 0, crack: 0 }); }
  return out;
}
function fitMats(S, gap = 0.3) {
  const poly = M.arcPoly(S), xm = S[3].x, mats = [];
  for (let k = 0; k < 3; k++) {
    let best = null;
    for (let z = G.chol[1]; z >= G.holy; z -= 0.05) {
      const m = M.matOf(k, xm, z), c = M.corners(m);
      if (c.every((p) => p[1] >= G.holy && M.inPoly(p, poly)) && !S.some((o) => M.overlap(M.corners(o), c)) && !mats.some((o) => M.overlap(M.corners({ ...o, D: o.D + 2 * gap }), c))) { best = m; break; }
    }
    if (!best) return null; mats.push(best);
  }
  return mats;
}
function fitStands(S, mats) {
  for (let dx = 4; dx <= 9; dx += 0.25) for (let z = G.holy + 0.7; z <= G.chol[1] - 3; z += 0.25) {
    const st = [M.standOf('W', S[3].x - dx, z), M.standOf('E', S[3].x + dx, z)]; if (M.roomFor(S, mats, st).ok) return st;
  }
  return null;
}
test('the bench: the straight row is legal but its end judges do not see each other; a round bench of radius 10–14 passes; too tight or too flat fails', () => {
  const row = M.row0(), B = M.benchState(row);
  assert.ok(B.legal.every(Boolean)); assert.equal(B.allSee, false); assert.equal(B.sees[0][6], false); assert.equal(B.sees[0][1], true);
  const T = M.testPlan(row); assert.deepEqual(T.raisers, [0, 6, 3]); assert.equal(T.pass, false);
  assert.ok(T.rounds[0].leans.length >= 4, 'most lean and search when the west end raises his hand');
  for (const R of [10, 11, 12, 14]) { const S = arc(R); assert.ok(M.benchState(S).allSee, 'R ' + R); assert.ok(M.testPlan(S).rounds.every((r) => !r.leans.length)); }
  assert.ok(!M.benchState(arc(9)).legal.every(Boolean), 'a half circle too tight puts its ends over the holy line');
  assert.ok(!M.benchState(arc(9)).allSee); assert.ok(!M.benchState(arc(18)).allSee, 'too flat: a middle judge hides the ends');
  // a stone over the holy line has no judge: he stands beside it
  const S = arc(12); S[0].z -= 3; const T2 = M.testPlan(S); assert.deepEqual(T2.standing, [0]); assert.ok(!T2.rounds.some((r) => r.turns.includes(0) || r.leans.includes(0)));
});
test('a bench stone: it follows the finger late (≤ 3 amot/s), a turn keeps the other end, a wall or a stone stops it; hit fast it cracks once', () => {
  const S = M.row0(), s = S[3];
  let vmax = 0; for (let k = 0; k < 30; k++) { M.stoneStep(s, { grip: 'mid', x: s.x, z: s.z - 6 }, DT, S); vmax = Math.max(vmax, s.s); }
  assert.ok(vmax <= 3 + 1e-9 && vmax > 1); assert.ok(s.z < G.row0.z - 0.5 && s.z > G.row0.z - 3, 'late');
  const e0 = M.endOf(S[0], 1); for (let k = 0; k < 90; k++) M.stoneStep(S[0], { grip: -1, x: S[0].x - 2, z: S[0].z - 2 }, DT, []);
  const e1 = M.endOf(S[0], 1); assert.ok(Math.hypot(e1[0] - e0[0], e1[1] - e0[1]) < 1e-6, 'the east end stays'); assert.ok(S[0].a > 0.2, 'turned, its inner face toward the middle');
  // driven fast into the south wall: a cracked corner, once
  const W = M.row0(), w = W[5]; const ev = [];
  for (let k = 0; k < 120; k++) ev.push(...M.stoneStep(w, { grip: 'mid', x: w.x, z: w.z + 8 }, DT, W));
  assert.equal(ev.filter((e) => e === 'crack').length, 1); assert.equal(w.crack, 1); assert.ok(w.z + w.D / 2 <= G.in[3] + 1e-9);
  // brought slowly against its neighbour: a bump, no crack
  const N = M.row0(), n = N[2]; const ev2 = [];
  for (let k = 0; k < 600; k++) ev2.push(...M.stoneStep(n, { grip: 'mid', x: n.x + 0.3, z: n.z }, DT, N));
  assert.ok(ev2.includes('bump')); assert.equal(n.crack, 0); assert.ok(!M.overlap(M.corners(n), M.corners(N[3])));
  assert.deepEqual(M.stoneStep(n, null, DT, N), []);
});
test('the room: three mats and two scribes fit inside a good round bench; a bench pushed forward leaves no room; a scribe hidden fails', () => {
  for (const R of [10, 12, 14]) {
    const S = arc(R), mats = fitMats(S); assert.ok(mats, 'mats R ' + R); const st = fitStands(S, mats); assert.ok(st, 'stands R ' + R);
    const r = M.roomFor(S, mats, st); assert.ok(r.ok); assert.deepEqual(r.stands.map((t) => t.side), ['W', 'E']);
  }
  assert.equal(fitMats(arc(12, G.holy + 5.2)), null, 'the bench pushed forward: no room for three rows');
  const S = arc(12), mats = fitMats(S), st = fitStands(S, mats);
  assert.ok(!M.roomFor(S, mats, [st[0]]).ok, 'one scribe is not two');
  assert.ok(!M.roomFor(S, mats, [M.standOf('W', S[1].x, S[1].z), st[1]]).ok, 'a stand on a stone');
  const moved = mats.map((m) => ({ ...m })); moved[2].z = G.holy - 0.2; assert.ok(!M.roomFor(S, moved, st).ok, 'a mat over the holy line');
  assert.equal(M.matSeats(mats[0]).length, 12); assert.equal(M.matSeats(mats[2]).length, 8);
});
test('the walkers and the semicha: a mat people sit on stops a walker; near a scribe the ink spills; four moves in order seat everyone', () => {
  const S = arc(12), mats = fitMats(S), st = fitStands(S, mats);
  const plan = M.semichaPlan({ plays: { gazit3: 0 } }); assert.equal(plan.moves.length, 4); assert.deepEqual(plan.moves.map((m) => m.who), ['row0:head', 'row1:head', 'row2:head', 'crowd']);
  // never the same judge twice running, the table's wrap too; seeded by the save's play count, nothing random
  for (let n = 0; n < 20; n++) assert.notEqual(M.semichaPlan({ plays: { gazit3: n } }).leave, M.semichaPlan({ plays: { gazit3: n + 1 } }).leave);
  assert.equal(M.semichaPlan({ plays: { gazit3: 3 } }).leave, M.semichaPlan({ plays: { gazit3: 3 } }).leave);
  const seats = mats.map(M.matSeats), j = plan.leave, bench = M.seatOf(S[j]);
  const free = [{ id: 'bench:' + j, x: bench[0], z: bench[1] }, ...mats.map((m, k) => ({ id: `row${k}:end`, x: seats[k][seats[k].length - 1][0], z: seats[k][seats[k].length - 1][1] }))];
  const layout = { stones: S, mats, stands: st, free };
  // a straight line from row 2's head to the end of row 1 crosses row 1's mat: he stops at its edge and stays standing
  const head = (k) => seats[k][0], endOf = (k) => seats[k][seats[k].length - 1];
  const straight = M.walkCheck([head(2), endOf(1)], layout, 'row2:head'); assert.ok(straight.stopped); assert.equal(straight.seat, null);
  // the aisles: from the crowd's place, round the mats' ends
  const A = M.aisles(layout); assert.ok(A.ids.includes('row2:end'));
  // a path past the scribe's stand spills the ink
  const s0 = st[1], ink = M.walkCheck([[s0.x + 2, s0.z], [s0.x - 2, s0.z]], layout, 'x'); assert.ok(ink.ink);
  // four moves; sent out of order, the second finds no place and stays standing (a mistake, no damage)
  const around = (from, to, viaZ) => [from, [from[0], viaZ], [to[0] + (to[0] < S[3].x ? -0.0 : 0), viaZ], to];
  const sm = M.semichaFresh(plan);
  const r1 = M.walkCheck(around(head(1), endOf(0), mats[0].z + 0), layout, 'row1:head'); void r1;
  const bad = M.semichaSend(sm, 1, { stopped: false, seat: 'row0:end', end: endOf(0) }); assert.equal(bad.ok, false); assert.equal(bad.why, 'notFree'); assert.equal(sm.standing.length, 1);
  const sm2 = M.semichaFresh(plan);
  for (let k = 0; k < 4; k++) { const to = free.find((f) => f.id === plan.moves[k].to); assert.ok(M.semichaSend(sm2, k, { stopped: false, seat: to.id, end: [to.x, to.z] }).ok, 'move ' + k); }
  assert.equal(sm2.seated.length, 4); assert.equal(sm2.standing.length, 0);
  // a walk that ends near its free place seats him (walkCheck finds the place)
  const w = M.walkCheck([[G.crowd[0], G.crowd[1]], [G.crowd[0] - 0.5, G.holy + 0.5], [endOf(2)[0] + 0.5, G.holy + 0.5], [endOf(2)[0] + 0.5, endOf(2)[1]]], { ...layout, mats: [] }, 'crowd'); assert.equal(w.seat, 'row2:end');
  assert.equal(M.gazitPts({ dmg: 0 }), 40); assert.equal(M.gazitPts({ dmg: 0, standing: 1 }), 20); assert.equal(M.gazitPts({ dmg: 20 }), 10);
});

/* ───────── station 2: the Golah ───────── */
// the clean player: fills to what is still wanted (≤ 1), pulls at each pass of the swing's middle, pours at the rim, keeps the sluice of
// the trough that needs water open and every other closed
function golahBot(id, opt = {}) {
  const s = M.golahFresh(id), want = (k) => s.troughs[k].size - s.troughs[k].v - (s.head + M.channelWater(s) + (s.phase === 'fill' ? 0 : s.f)) * (target() === k ? 1 : 0);
  const target = () => M.CHANNEL.order.find((k) => s.troughs[k] && s.troughs[k].v + 1e-6 < s.troughs[k].size - 0.02) || null;
  let lastPh = 0, events = [];
  for (let k = 0; k < 60 * 900 && !s.done; k++) {
    const tg = target(); for (const q of ['A', 'B', 'C']) M.sluiceSet(s, q, q === tg && !(opt.noClose && q === 'A' ? false : false));
    if (opt.keepOpen) M.sluiceSet(s, opt.keepOpen, true);
    if (s.phase === 'fill') {
      const need = tg ? Math.min(1, Math.max(0.2, want(tg))) : 0;
      if (need > 0 && s.f < need - 1e-9 && !(s.head + M.channelWater(s) > 0.01 && opt.wait)) M.fillStep(s, true, DT);
      else if (need > 0 && s.head + M.channelWater(s) < 1e-6) { M.pullStep(s); lastPh = s.ph; }
    } else if (s.phase === 'pull') {
      const cross = Math.floor(s.ph / Math.PI) !== Math.floor(lastPh / Math.PI);
      if (opt.feed ? Math.abs(Math.cos(s.ph)) < 0.06 && s.A < 2 : cross) M.pullStep(s);
      lastPh = s.ph;
    } else if (s.phase === 'rim') M.pourStep(s, 1, DT);
    M.golahStep(s, DT); events.push(...s.ev); s.ev = [];
  }
  return { s, events };
}
test('the Golah\'s numbers: fill 0.5/s, weight 0.3 + f, a pull lifts 1.5 − 0.5f, the period 0.9 + 0.045 L quickens as it rises', () => {
  const s = M.golahFresh('golah2'); for (let k = 0; k < 60; k++) M.fillStep(s, true, DT); assert.ok(Math.abs(s.f - 0.5) < 1e-9); assert.ok(Math.abs(M.weightOf(s) - 0.8) < 1e-9);
  for (let k = 0; k < 120; k++) M.fillStep(s, true, DT); assert.equal(s.f, 1);
  assert.equal(s.y, 20); assert.ok(Math.abs(M.periodNow(s) - (0.9 + 0.045 * 25)) < 1e-9);
  M.pullStep(s); assert.equal(s.phase, 'pull'); assert.ok(Math.abs(s.y - 19) < 1e-9); assert.ok(Math.abs(s.A - (0.3 + 0.5) * 0.75) < 1e-9, 'the first pull at the middle calms the start swing');
  assert.equal(M.emptyY(s), 1); const T1 = M.periodNow(s); s.y = 2; assert.ok(M.periodNow(s) < T1);
  // left alone the swing dies in about six seconds
  const q = M.golahFresh('golah1'); q.f = 1; M.pullStep(q); const A0 = q.A; for (let k = 0; k < 360; k++) M.golahStep(q, DT); assert.ok(q.A < 0.14 * A0 && q.A < 0.2);
});
test('the Golah played clean, each level: every trough full, nothing spilled, no knock or clash, 40; perfect pulls and dry stops', () => {
  for (const id of ['golah1', 'golah2', 'golah3']) {
    const { s, events } = golahBot(id);
    assert.ok(s.done, id + ' ' + JSON.stringify(s.troughs)); assert.equal(s.dmg, 0, id); assert.equal(s.knocks + s.clashes, 0, id);
    for (const T of Object.values(s.troughs)) assert.ok(T.v >= 0.9 * T.size && T.v <= T.size + 0.1 + 1e-9, id);
    assert.equal(M.golahPts(s), 40, id); assert.ok(s.perfect > 5 && s.stops >= 1, id);
    assert.ok(events.some((e) => e.e === 'passed') && events.some((e) => e.e === 'full'), id);
  }
});
test('Golah mistakes: pulls that feed the swing knock the wall (spill), crack the bucket (−20, it drips), break a rim stone (−20, once per level)', () => {
  const s = M.golahFresh('golah2'); s.f = 1; M.pullStep(s); let ph = s.ph; const ev = [];
  for (let k = 0; k < 60 * 120 && s.phase === 'pull'; k++) { if (Math.floor(s.ph / Math.PI - 0.5) !== Math.floor(ph / Math.PI - 0.5)) M.pullStep(s); /* (at each end of the swing) */ ph = s.ph; M.golahStep(s, DT); ev.push(...s.ev); s.ev = []; }
  assert.ok(s.knocks > 0); assert.ok(ev.some((e) => e.e === 'knock')); assert.ok(s.flags['golah.bucket'], 'a crack'); assert.equal(s.cracked[s.b], 1);
  assert.ok(s.flags['golah.rim'] && s.flags['golah.rim'].length === 1); assert.equal(M.golahPts(s), 10);
  // the cracked bucket drips while it hangs full: 0.02 per second
  const f0 = s.f; for (let k = 0; k < 60; k++) M.golahStep(s, DT); assert.ok(Math.abs(f0 - s.f - 0.02) < 1e-6 || s.f === 0);
  // a clash at the meeting: the two buckets near the same height swinging hard
  const c = M.golahFresh('golah1'); c.f = 1; M.pullStep(c); c.A = 0.7; c.y = c.depth / 2 + 0.2; M.golahStep(c, DT);
  assert.equal(c.clashes, 1); assert.ok(c.spilled > 0); assert.ok(!c.flags['golah.bucket'], 'under 1.2 together: no crack');
  // (build 129, part 3) a pull that jumps the full bucket over the empty one's height is the meeting all the same
  for (const A of [0.7, 0.2]) {
    const j = M.golahFresh('golah1'); j.f = 0.7; M.pullStep(j); j.y = j.depth / 2 + 0.55; M.golahStep(j, DT);
    assert.equal(j.met, 0, 'not yet: outside the window');
    M.pullStep(j); assert.ok(j.y < j.depth / 2 - M.GOLAH.MEET, 'jumped over: ' + j.y); j.A = A; M.golahStep(j, DT);
    assert.equal(j.met, 1); assert.equal(j.clashes, A > 0.6 ? 1 : 0, 'A ' + A);
  }
});
test('the channel: an open sluice takes all the water, a closed one sends it on; all closed it stands, nothing lost; a trough overflows once', () => {
  const s = M.golahFresh('golah3');
  s.head = 1; M.sluiceSet(s, 'B', true); for (let k = 0; k < 600; k++) M.flow(s, DT);
  assert.ok(Math.abs(s.troughs.B.v - 1) < 1e-9); assert.equal(s.troughs.A.v, 0); assert.equal(s.troughs.C.v, 0);
  // all closed: the water stands in the channel; opened, it goes to the first open sluice
  M.sluiceSet(s, 'B', false); s.head = 0.8; for (let k = 0; k < 600; k++) M.flow(s, DT);
  assert.ok(Math.abs(M.channelWater(s) - 0.8) < 1e-9, 'stands'); assert.ok(Math.abs(s.pool - 0.8) < 1e-9);
  M.sluiceSet(s, 'C', true); for (let k = 0; k < 600; k++) M.flow(s, DT); assert.ok(Math.abs(s.troughs.C.v - 0.8) < 1e-9); assert.equal(M.channelWater(s), 0);
  // the water runs 6 amot/s: it reaches spur A (8 along) after about 8/6 s
  const r = M.golahFresh('golah1'); r.head = 0.1; M.sluiceSet(r, 'A', true); let t = 0; while (r.troughs.A.v === 0 && t < 5) { M.flow(r, DT); t += DT; }
  assert.ok(t > 8 / 6 && t < 8 / 6 + 2 / 6 + 0.2, 't ' + t);
  // a trough filled past its size + 0.1 floods: once, the puddle stays
  const o = M.golahFresh('golah1'); o.head = 2.5; M.sluiceSet(o, 'A', true); for (let k = 0; k < 600; k++) M.flow(o, DT);
  assert.ok(o.flags['golah.flood'] && o.flags['golah.flood'].length === 1); assert.deepEqual(o.puddles, ['A']); assert.ok(Math.abs(o.troughs.A.v - 2.1) < 1e-9);
  // the channel's lengths from the book
  assert.equal(M.CHANNEL.spur.A.at, 8); assert.equal(M.CHANNEL.spur.B.at, 22); assert.equal(M.CHANNEL.spur.C.at, 36); assert.deepEqual([...M.CHANNEL.order], ['A', 'B', 'C']);
});

/* ───────── station 3: the arches ───────── */
// part A's clean player: each thumb matches the leg's thrust (reach = T + creep); when both legs are light, lets go over a second
function legBot(id, opt = {}) {
  const S = M.legFresh(id), V = M.VAULT_LV[id]; let rel = -1;
  for (let k = 0; k < 60 * 90 && !S.done; k++) {
    const ready = ['L', 'R'].every((q) => S[q].rock || M.thrustOf(S, q) / V.T0 <= M.LEG.REL + 1e-9);
    if (ready && rel < 0) rel = S.t;
    const press = {};
    for (const q of ['L', 'R']) {
      const T = M.thrustOf(S, q) / V.T0, g = S[q];
      let p = T * (opt.k || 1); if (opt.early && S.t > opt.early) p = null;
      if (ready && p != null) p = Math.max(0, T * (1 - (S.t - rel) / (opt.fast ? 0.05 : 1)));
      press[q] = p == null ? null : (p <= 0 && ready ? null : p + g.g);
    }
    M.legStep(S, press, DT, { mouse: opt.mouse });
  }
  return S;
}
test('the arch\'s legs: held in the window while the crew lays the weight, let go slowly: the perfect release in about half a minute', () => {
  for (const id of ['vaultN', 'vaultS', 'vaultM']) {
    const S = legBot(id); assert.ok(S.done, id); assert.equal(S.perfect, 1, id); assert.equal(S.dmg, 0, id); assert.equal(S.runs + S.lifts, 0, id);
    assert.ok(S.t > 20 && S.t < 34, id + ' ' + S.t.toFixed(1));
  }
  // vaultS: the rock leg does not move at all; the wall leg needs eight stones
  const S = M.legFresh('vaultS'); assert.equal(M.thrustOf(S, 'R'), 0); assert.equal(M.VAULT_LV.vaultS.M.L, 8);
  assert.equal(M.thrustOf(M.legFresh('vaultM'), 'L'), 3 * M.thrustOf(M.legFresh('vaultN'), 'L'));
  // the mouse: the crew's prop holds the right leg; the pointer plays the left
  const Mo = legBot('vaultN', { mouse: true }); assert.ok(Mo.done && Mo.perfect);
});
test('the arch\'s legs: nothing moves until his thumbs are on (the centering holds; the crew waits)', () => {
  const S = M.legFresh('vaultM'); for (let k = 0; k < 200; k++) M.legStep(S, { L: 0.5, R: null }, DT);
  assert.equal(S.t, 0); assert.equal(S.laid, 0); assert.equal(S.runs, 0); assert.equal(S.dmg, 0);
  M.legStep(S, { L: 0.5, R: 0.5 }, DT); assert.ok(S.go && S.t > 0);
  const Mo = M.legFresh('vaultN'); M.legStep(Mo, { L: 0.5, R: null }, DT, { mouse: true }); assert.ok(Mo.go, 'a mouse: the left leg starts it');
  const R = M.legFresh('vaultS'); M.legStep(R, { L: 0.5, R: null }, DT); assert.ok(R.go, 'the rock leg needs no hand');
});
test('the arch\'s legs: let go early, the leg runs out (a mistake) and past the limit a joint opens (−20); pressed too hard, the crown lifts', () => {
  const E = legBot('vaultN', { early: 3 }); assert.ok(E.runs >= 1); assert.ok(E.flags['vault.crack']); assert.equal(E.dmg, 20); assert.equal(E.perfect, 0);
  const H = legBot('vaultN', { k: 1.5 }); assert.ok(H.lifts >= 1); assert.equal(H.perfect, 0);
  const F = legBot('vaultN', { fast: true }); assert.ok(F.done); assert.equal(F.perfect, 0, 'let go at once: done, not perfect');
});
// part B's player: among the wedges not yet out (and free, in the great vault) the first in his order whose step keeps the joint closed;
// none: a touch on the shoulder of the light's side first
function wedgeBot(id, order, opt = {}) {
  const S = M.wedgeFresh(id), ev = [];
  for (let k = 0; k < 400 && !S.done; k++) {
    const L = M.wedgeLoads(S); let moved = false;
    for (const w of order) {
      const i = +w[0] - 1, side = w[1], p = S.pairs[i]; if (!p || p[side] >= 1 || L[w] !== 'free') continue;
      const after = (side === 'L' ? Math.min(1, p.L + 0.2) - p.R : p.L - Math.min(1, p.R + 0.2)) + p.bias;
      if (Math.abs(after) > 0.3) continue;
      M.wedgeStep(S, i, side, 0.2); ev.push(...S.ev); moved = true; break;
    }
    if (!moved) {
      const i = S.pairs.findIndex((p) => Math.abs(p.L - p.R + p.bias) > 0.1 && (p.L < 1 || p.R < 1));
      const p = S.pairs[i >= 0 ? i : 0], imb = p.L - p.R + p.bias; M.shoulder(S, i >= 0 ? i : 0, imb > 0 ? 'L' : 'R'); ev.push(...S.ev);
    }
  }
  return { S, ev };
}
const ALLW = ['1L', '1R', '2L', '2R', '3L', '3R', '4L', '4R'];
test('the wedges: the north arch alternating, the south arch from the rock side first (its bias toward the wall), clean: 40', () => {
  const N = wedgeBot('vaultN', ['1L', '1R']); assert.ok(N.S.done); assert.equal(N.S.lights, 0); assert.equal(M.vaultPts(null, N.S), 40);
  assert.ok(N.ev.some((e) => e.e === 'out')); assert.ok(N.ev.some((e) => e.e === 'done'));
  const S = wedgeBot('vaultS', ['1L', '1R', '2L', '2R']); assert.ok(S.S.done); assert.equal(S.S.lights, 0); assert.equal(S.S.dmg, 0);
  // the south arch pulled from the wall side first: light (a mistake, no damage); on, the joint cracks (−20); on, a stone falls (−20)
  const W = M.wedgeFresh('vaultS'); M.wedgeStep(W, 0, 'L', 0.2); assert.equal(W.lights, 1); assert.equal(M.joints(W)[0].see, 'light'); assert.equal(W.dmg, 0);
  M.wedgeStep(W, 0, 'L', 0.2); assert.ok(W.flags['vault.crack']); M.wedgeStep(W, 0, 'L', 0.2); M.wedgeStep(W, 0, 'L', 0.2);
  assert.ok(W.flags['vault.stone']); assert.equal(W.dmg, 40); assert.ok(Math.abs(M.joints(W)[0].imb) < 0.85, 'the crew lays a replacement: the arch settles');
  // the cure: push back and touch that shoulder — the crew adds a weight stone there
  const C = M.wedgeFresh('vaultS'); M.wedgeStep(C, 0, 'L', 0.2); M.wedgeStep(C, 0, 'L', -0.2); M.shoulder(C, 0, 'L'); assert.ok(Math.abs(C.pairs[0].bias - 0.05) < 1e-9);
});
test('the great vault\'s wedges: loaded until what holds them is out; three right orders clean, three wrong ones open joints; a fallen stone costs 40', () => {
  const F = M.wedgeFresh('vaultM'), L0 = M.wedgeLoads(F);
  assert.deepEqual(ALLW.filter((w) => L0[w] === 'free').sort(), ['1L', '4R']);
  // at least one free wedge in every state the right orders pass through
  const rights = [['1L', '4R', '1R', '4L', '2L', '2R', '3L', '3R'], ['4R', '1R', '2R', '3R', '1L', '4L', '2L', '3L'], ['1L', '2L', '4L', '3L', '4R', '1R', '2R', '3R']];
  for (const o of rights) {
    const { S } = wedgeBot('vaultM', o); assert.ok(S.done, o.join()); assert.equal(S.dmg, 0, o.join()); assert.equal(S.lights + S.jumps, 0, o.join());
    assert.equal(M.vaultPts(null, S), 40);
  }
  // wrong: a loaded wedge pulled first, again and again; a loaded wedge yanked; all the left wedges before any right
  const w1 = M.wedgeFresh('vaultM'); for (let k = 0; k < 5; k++) M.wedgeStep(w1, 2, 'L', 0.2); assert.ok(w1.lights > 0, 'loaded 3L');
  const w2 = M.wedgeFresh('vaultM'); M.wedgeStep(w2, 1, 'R', 0.5); assert.equal(w2.jumps, 1); assert.ok(M.joints(w2)[1].imb < -0.35, 'a yank jumps its pair');
  const w3 = M.wedgeFresh('vaultM'); for (let r = 0; r < 5; r++) for (const w of ['1L', '4L', '2L', '3L']) M.wedgeStep(w3, +w[0] - 1, 'L', 0.2);
  assert.ok(w3.dmg > 0 && w3.flags['vault.stone']); assert.equal(w3.dmg % 40 === 0 || w3.dmg % 20 === 0, true);
  const per = M.wedgeFresh('vaultM'); per.pairs[0].bias = 0.9; M.wedgeStep(per, 0, 'L', 0.01); assert.equal(per.flags['vault.stone'].length, 1); assert.ok(per.dmg >= 40);
  // part A's displaced leg adds its imbalance to part B (zero otherwise)
  const legs = M.legFresh('vaultN'); legs.L.x = 0.2; assert.ok(Math.abs(M.wedgeFresh('vaultN', legs).pairs[0].bias - 0.2) < 1e-9);
  assert.equal(M.wedgeFresh('vaultN', M.legFresh('vaultN')).pairs[0].bias, 0);
});

/* ───────── the night ───────── */
test('the slab: lifted slowly it opens at 0.8 (the keys); let go half way it falls with a bang (no damage); lowered hard a corner cracks', () => {
  const S = M.slabFresh(); let t = 0;
  while (S.phase === 'lift' && t < 10) { M.slabStep(S, 1, DT); t += DT; } assert.equal(S.phase, 'open'); assert.equal(S.keys, 1); assert.ok(t >= 0.8 / 0.5 - 0.05, 'late: at most 0.5 per second');
  // lowered to the floor slowly: soft, no crack, done
  for (let k = 0; k < 600 && !S.done; k++) M.slabStep(S, 0, DT); assert.ok(S.done); assert.equal(S.dmg, 0); assert.equal(M.nightPts(S), 40);
  // let go half way while lifting: a bang, no damage
  const B = M.slabFresh(); for (let k = 0; k < 50; k++) M.slabStep(B, 1, DT); const ev = []; for (let k = 0; k < 120; k++) { M.slabStep(B, null, DT); ev.push(...B.ev); }
  assert.ok(ev.some((e) => e.e === 'bang')); assert.equal(B.dmg, 0); assert.equal(B.h, 0); assert.equal(M.nightPts(B), 20);
  // lowered pressing down (or let go above the floor): it touches down faster than 0.35: a cracked corner (−20), kept once
  for (const how of ['press', 'drop']) {
    const D = M.slabFresh(); while (D.phase !== 'open') M.slabStep(D, 1, DT);
    for (let k = 0; k < 600 && !D.done; k++) M.slabStep(D, how === 'press' ? -0.3 : (D.h > 0.5 ? 0.4 : null), DT);
    assert.ok(D.flags['night.slab'], how); assert.equal(D.dmg, 20); assert.equal(M.nightPts(D), 10);
  }
});
