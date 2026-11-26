// build 136 — stage 13 "האולם" (spec docs/specs/shlav-13-he.md v4): the book's places (BOOK.s13) and step 0's prototype of the three
// works' models, each played to its end at every level by a bot that plays by the rules a child can learn.
import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOK } from '../src/game/world/grid.js';
import * as ML from '../src/game/h136/maltra-model.js';
import * as KL from '../src/game/h136/kelonsa-model.js';
import * as SH from '../src/game/h136/sharsheret-model.js';
import { createH136, PLAN, STAGE_FLOW, fromOld, lossPts } from '../src/game/h136/model.js';

const S13 = BOOK.s13;
const ov = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

test('book: the Ulam, its opening and lintels, the Heichal wall, the poles, the chains and crowns, no clashes', () => {
  const H = S13.hall, F = S13.front;
  assert.equal(H.x1 - H.x0, 11, 'the hall is 11 amot deep (Middot 4:7)');
  assert.equal(F.x1 - F.x0, 5, 'the front is 5 thick');
  assert.equal(S13.opening.y1 - S13.opening.y0, 40, 'the opening 40 high'); assert.equal(S13.opening.z1 - S13.opening.z0, 20, 'and 20 wide');
  const B = S13.maltra.beams;
  B.forEach((b, i) => { assert.equal(b.len, 22 + 2 * i); if (i) { assert.equal(b.len - B[i - 1].len, 2, 'an amah past on each side'); assert.ok(b.y - (B[i - 1].y + B[i - 1].h) > 0.5, 'a course between, not touching'); } });
  assert.ok(B[0].len / 2 > (S13.opening.z1 - S13.opening.z0) / 2, 'the lowest lintel spans the opening');
  // the poles: over the opening (above 40), across the gap, their pockets in the Heichal's wall, seats in the Ulam's front
  const K = S13.kelonsa;
  assert.ok(K.y > S13.opening.y1, 'the poles above the opening (R\' Shemaiah: above 40)');
  assert.ok(Math.abs(K.lock.e - K.lock.w - K.len) < 1e-9, 'the pole fits its sockets');
  assert.ok(K.pocket.x0 >= S13.heichalWall.x0 && K.seat.x1 <= F.x1, 'pocket in the Heichal wall, seat in the front');
  // the chains: inside the hall, clear of the tables (x −89.5, z ±7) and the Heichal's door (z ±5) and the poles (z −20, 0, 20)
  const C = S13.chains;
  for (const z of C.z) { assert.ok(z > H.z0 && z < H.z1); for (const kz of K.zs) assert.ok(Math.abs(z - kz) > 2, 'chains clear of the poles'); assert.ok(Math.abs(z) > 5 + 2, 'clear of the Heichal door'); }
  for (const t of Object.values(S13.tables)) assert.ok(Math.abs(t[1] - C.zc) > 3 || Math.abs(t[0] - C.x) > 1.5, 'chains clear of the tables');
  // the crane does not block the steps: a small thing on their top, room on both sides
  assert.ok(S13.maltra.crane.x > F.x1 && S13.maltra.crane.x < S13.steps.x1, 'the crane on the steps');
  // the crowns over the windows, the windows on the Heichal's face
  for (const c of S13.crowns) { const w = S13.windows.find((x) => x.z === c.z); assert.ok(w && c.y0 >= w.y1, 'crown over its window'); }
  // the stands in the court, out of the altar (x −54 … −22, z −19.5 … 12.5) except the spec's handler spot at its west foot
  for (const [k, p] of Object.entries(S13.stands)) assert.ok(!(p[0] > -54 && p[0] < -22 && p[1] > -19.5 && p[1] < 12.5), 'stand off the altar ' + k);
  // the rail and the scaffold under each pole inside the hall
  assert.ok(K.rail.x0 > H.x0 && K.rail.x1 < H.x1);
  assert.ok(S13.entries.length > 30);
  const ids = new Set(); for (const e of S13.entries) { assert.ok(!ids.has(e.id), 'one id ' + e.id); ids.add(e.id); }
  void ov;
});

test('flow: works 1 and 2 in any order, work 3 after both; a level per visit; the links bring the crews', () => {
  const M = createH136(null);
  assert.deepEqual(M.open().map((m) => m.id), ['maltra1', 'kelonsa1']);
  M.pick('kelonsa1'); M.done({ stars: 3, pts: 40 });
  assert.deepEqual(M.open().map((m) => m.id), ['maltra1']);
  M.pick('maltra1'); M.done({ stars: 2, pts: 60 });
  assert.ok(M.roofed());
  assert.deepEqual(M.open().map((m) => m.id), ['sharsheret1']);
  M.pick('sharsheret1'); M.done({ stars: 1, pts: 100 });
  assert.ok(M.finished());
  assert.deepEqual(M.open().map((m) => m.id), ['maltra2', 'kelonsa2', 'sharsheret2']);
  const N = createH136(null); N.autoTo((m) => m.id === 'sharsheret3');
  assert.equal(N.mission().id, 'sharsheret3'); assert.ok(N.roofed());
  assert.ok(fromOld(true).crews && createH136(fromOld(true)).finished());
  assert.equal(lossPts('kelonsa.crack', 3), 80);
  assert.equal(PLAN.length, 9); assert.equal(STAGE_FLOW.length, 3);
});

function playM(lv, o) { const S = ML.fresh(lv); let t = 0; while (!S.done && t < 300) { ML.step(S, 1 / 60, ML.bot(S, o)); t += 1 / 60; } return { S, t }; }
test('maltra (step 0): the pendulum, the free hook, pulses brake turn and sway; every level ends gold by a learning hand', () => {
  for (const lv of [1, 2, 3]) { const { S, t } = playM(lv); assert.ok(S.done, 'level ' + lv + ' done'); const r = ML.result(S); assert.equal(r.stars, 3, 'level ' + lv + ' ' + JSON.stringify(r)); assert.ok(t < 120); }
  // the model's numbers (spec table): one line full → the centre ~0.16 east, ~0.09 inward; both full → ~0.3 east, no turn
  const S = ML.fresh(2); S.phase = 'hang'; S.hook = 0; S.cx = S.cz = S.vx = S.vz = S.th = S.w = 0;
  for (let i = 0; i < 60 * 20; i++) ML.step(S, 1 / 60, { T: [1, 1] });
  assert.ok(Math.abs(S.cx - 0.3) < 0.06 && Math.abs(S.cz) < 0.01 && Math.abs(S.th) < 1e-6, 'both: ' + S.cx + ' ' + S.cz);
  const S2 = ML.fresh(2); S2.phase = 'hang'; S2.hook = 0; S2.cx = S2.cz = S2.vx = S2.vz = S2.th = S2.w = 0;
  for (let i = 0; i < 30; i++) ML.step(S2, 1 / 60, { T: [1, null] });
  assert.ok(S2.w > 0, 'the north line turns the north end east');
  // a careless release (straight away, at an angle) is a free try then real damage
  const S3 = ML.fresh(2); let hits = 0, free = 0;
  for (let i = 0; i < 60 * 120 && !S3.done; i++) { const e = ML.step(S3, 1 / 60, { T: [null, null], tap: true }); for (const x of e) { if (x.k === 'hit') hits++; if (x.k === 'free') free++; } }
  assert.equal(free, 1); assert.ok(hits >= 1, 'damage kept');
});

function playK(lv, order) { const S = KL.fresh(lv); let t = 0; while (!S.done && t < 300) { const b = KL.bot(S, { order }); if (b.pick != null) { KL.pick(S, b.pick); continue; } KL.step(S, 1 / 60, b); t += 1 / 60; } return S; }
test('kelonsa (step 0): tilt, deep pocket, back to the seat, lock; the lean in sections; 0.6 of bearing', () => {
  for (const lv of [1, 2, 3]) { const S = playK(lv); assert.ok(S.done, 'level ' + lv); assert.equal(S.steps.length, KL.KL.POLES[lv].length); assert.ok(KL.result(S).q >= 0.8, JSON.stringify(KL.result(S))); }
  // the trap: tilting it level in the middle of the gap is not a lock (it never went deep)
  const T = KL.fresh(1); for (let i = 0; i < 600; i++) KL.step(T, 1 / 60, { held: false }); assert.ok(!T.done && !T.steps.length, 'no lock without the deep pocket');
  // a jam over the threshold: the first is free, the next a scratch
  const J = KL.fresh(2); KL.pick(J, -20); let jam = 0, free = 0;
  for (let k = 0; k < 2; k++) { for (let i = 0; i < 120; i++) { const e = KL.step(J, 1 / 60, { tilt: 15, slide: J.px - 2, held: true }); for (const x of e) { if (x.k === 'jam') jam++; if (x.k === 'free') free++; } } for (let i = 0; i < 60; i++) KL.step(J, 1 / 60, { tilt: 15, slide: -86.5, held: true }); }
  assert.equal(free, 1); assert.ok(jam >= 1);
  // the arithmetic: balanced at lean d, each end bears 0.3 − d/2
  const D = KL.fresh(3); D.leaning = true; for (let i = 0; i < 60 * 25; i++) KL.step(D, 1 / 60, {}); assert.ok(D.d.every((v) => Math.abs(v - 0.4) < 1e-9), 'capped at 0.4'); assert.equal(D.flaws.filter((x) => x.f === 'kelonsa.crack').length, 3);
  // a frozen section slows its neighbours to half
  const N = KL.fresh(3); N.leaning = true; N.frozen[1] = true; for (let i = 0; i < 60 * 10; i++) KL.step(N, 1 / 60, {}); assert.ok(Math.abs(N.d[0] - 0.1) < 0.01 && N.d[1] === 0, 'half pace ' + N.d);
});

function playS(lv) { const S = SH.fresh(lv); let t = 0, cd = 0; while (!S.done && t < 300) { const b = SH.bot(S, { calmAt: lv === 3 ? 0.025 : 0.04 }); const e = []; if (cd <= 0) { if (b.nudge) { SH.nudge(S, b.nudge, e); cd = 0.25; } if (b.lift) { SH.lift(S, b.lift); cd = 0.45; } else if (b.aim != null) { SH.aim(S, b.aim); if (b.grab) { SH.grab(S, e); cd = 0.3; } } } cd -= 1 / 60; SH.step(S, 1 / 60, { turn: b.turn, steady: b.steady }); t += 1 / 60; } return { S, t }; }
test('sharsheret (step 0): hand over hand, never two in the air, the swing graded, the crowns, Hen by a deliberate swing', () => {
  const want = { 1: [6, 1], 2: [10, 2], 3: [18, 4] };
  for (const lv of [1, 2, 3]) {
    const { S, t } = playS(lv); assert.ok(S.done, 'level ' + lv); assert.equal(S.seen.length, want[lv][1]);
    assert.ok(S.grabs <= want[lv][0] && S.grabs >= want[lv][0] - 2, 'grabs ' + S.grabs); assert.ok(t < 120, 'time ' + t);
    assert.ok(SH.result(S).q >= 0.95, JSON.stringify(SH.result(S)));
  }
  const S = SH.fresh(2); assert.ok(SH.lift(S, 'L')); assert.ok(!SH.lift(S, 'R'), 'never two in the air');
  SH.aim(S, S.h.R + 9); const e = SH.grab(S); assert.equal(e[0].k, 'back', 'too far: the hand returns');
  assert.ok(SH.omega(SH.fresh(1)) > SH.omega(SH.fresh(3)), 'faster as he climbs');
});
