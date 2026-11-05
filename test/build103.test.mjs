// build 103 — stage 08, היסוד, rebuilt on build 101's world (the owner 5.11 07:41: "אל תחכה. תתקדם"): the stone on the bench with every
// tool at hand (turn, cloth, nail, the iron's glint), and the yesod's field stones laid end to slanted end, chinked with slivers and a
// wooden mallet, and the two ends where the yesod eats one amah (מדות ג, א).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as L from '../src/game/lish103.js';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/** turn the stone slowly a whole round (drag px per step), spinning between */
function round(J, px = 6, steps = 400) { for (let q = 0; q < steps; q++) { J.turn(px); J.spin(1 / 30); } J.release(); }
/** bring face f to the front */
function face(J, f) { const k = J.state(); for (let q = 0; q < 900 && J.front() !== f; q++) { J.turn(5); J.spin(1 / 30); } J.release(); for (let q = 0; q < 200 && Math.abs(J.off(f)) > 0.05; q++) { J.turn(-Math.sign(J.off(f)) * Math.min(4, Math.abs(J.off(f)) / 0.011)); J.spin(1 / 30); } J.release(); k.w = 0; }

test('build 103: the bench — a crack is seen only on its face turned to him; mud hides it till wiped; the nail catches only slowly and only on its edge', () => {
  assert.equal(L.BENCH103.stones.length, 7); assert.deepEqual(L.BENCH103.stones.slice(0, 5).map((s) => s.tool), ['turn', 'cloth', 'cloth', 'nail', 'glint']);
  { const J = L.createBench103(0, rnd), k = J.state(); assert.equal(k.type, 'crack'); assert.ok(k.flaw.face >= 1, 'the first crack is a turn away'); for (let q = 0; q < 30; q++) J.spin(1 / 30); assert.equal(k.seen.crack, 0); round(J); assert.ok(k.seen.crack >= L.BENCH103.crackT, 'seen once turned round'); }
  { const J = L.createBench103(2, rnd), k = J.state(); assert.equal(k.type, 'mudcrack'); face(J, k.mud); for (let q = 0; q < 30; q++) J.spin(1 / 30); assert.equal(k.seen.crack, 0, 'under the mud: not seen');
    assert.equal(J.wipe(0.5), 'wiping'); let r = ''; for (let q = 0; q < 20 && r !== 'wiped'; q++) r = J.wipe(0.3); assert.equal(r, 'wiped'); for (let q = 0; q < 30; q++) J.spin(1 / 30); assert.ok(k.seen.crack > 0, 'wiped: the crack shows'); }
  { const J = L.createBench103(1, rnd), k = J.state(); assert.equal(k.mud, 0); face(J, 2); assert.equal(J.wipe(1), 'other', 'the cloth works on the face in front only'); }
  { const J = L.createBench103(3, rnd), k = J.state(); assert.equal(k.type, 'nick'); assert.equal(k.flaw.face, 0);
    assert.equal(J.slide(0, 0.5, 0.1), 'fast', 'fast: nothing felt'); assert.ok(!k.caught);
    let r = ''; for (let u = 0; u < 1 && r !== 'caught'; u += 0.02) r = J.slide(u, u + 0.02, 0.05); assert.equal(r, 'caught'); assert.ok(Math.abs(k.nick - 0.5) <= 0.31); }
  { const J = L.createBench103(3, rnd); face(J, 2); for (let u = 0; u < 1; u += 0.02) assert.notEqual(J.slide(u, u + 0.02, 0.05), 'caught', 'another edge is smooth'); assert.ok(J.feltEdge(2) >= 0.95); }
});
test('build 103: the iron — a perfect stone whose glint shows only in a narrow window; a fast spin passes it unseen; narrower each level', () => {
  assert.ok(L.BENCH103.win[1] > L.BENCH103.win[2] && L.BENCH103.win[2] > L.BENCH103.win[3]);
  { const J = L.createBench103(4, rnd), k = J.state(); assert.equal(k.type, 'iron'); assert.ok(k.bad); for (let q = 0; q < 40; q++) J.spin(1 / 30); assert.equal(k.seen.glint, 0, 'square on: no glint'); round(J, 4, 900); assert.ok(k.seen.glint >= L.BENCH103.seeT, 'turned slowly: seen'); }
  { const J = L.createBench103(4, rnd), k = J.state(); for (let q = 0; q < 6; q++) { J.turn(700); J.spin(1 / 30); } J.release(); for (let q = 0; q < 60; q++) J.spin(1 / 30); assert.ok(k.seen.glint < L.BENCH103.seeT, `a flung stone: ${k.seen.glint}`); }
  { const J = L.createBench103(4, rnd), k = J.state(); J.turn(100); const y = k.yaw; J.release(); J.spin(1 / 30); assert.ok(Math.abs(k.yaw - y) > 0, 'heavy: it keeps turning after the finger'); for (let q = 0; q < 200; q++) J.spin(1 / 30); assert.equal(k.w, 0, 'and slows to a stop'); }
});
test('build 103: the verdict — kasher ➡, pasul ⬅; a flawed stone sent to the altar is stopped and stays; a sound one thrown out is lost', () => {
  const J = L.createBench103(0, rnd); assert.equal(J.decide('altar'), 'stop'); assert.equal(J.state().decided, null); assert.equal(J.decide('out'), 'ok'); assert.equal(J.decide('out'), 'done');
  const M = L.createBench103(1, rnd); assert.equal(M.state().bad, false, 'mud is no flaw'); assert.equal(M.decide('out'), 'waste'); assert.equal(M.state().right, false);
  const W = L.createBench103(5, rnd); assert.equal(W.state().type, 'whole'); assert.ok(W.state().mud >= 0, 'a decoy stain'); assert.equal(W.decide('altar'), 'ok');
  const mixes = new Set(); for (let q = 0; q < 60; q++) mixes.add(L.createBench103(6, rnd).state().type); assert.ok(mixes.size >= 3 && [...mixes].every((t) => L.BENCH103.mix.includes(t)));
  assert.equal(L.benchQ103(0), 1); assert.equal(L.benchQ103(2), 0.5); assert.equal(L.benchQ103(3), 0);
});

/** the yesod's stretch played: by the hint (good), or by the first stone that sits (careless) */
function stretch(i, how = 'good') {
  const J = L.createStretch103(i, rnd), k = J.state(); let guard = 0;
  while (k.ph === 'lay' && guard++ < 40) {
    if (how === 'good') { const h = J.hint(); assert.ok(h, 'there is always a good stone'); const t = J.lay(h.s, h.flip, h.twist); assert.ok(t.r === 'tight' || t.r === 'wedge', t.r); }
    else { let laid = false; for (let s = 0; s < k.pile.length && !laid; s++) for (const f of [false, true]) { if (laid) break; const t = J.trial(s, f, how === 'twist' ? 0.18 : 0); if (t.r === 'tight' || t.r === 'wedge') { J.lay(s, f, how === 'twist' ? 0.18 : 0); laid = true; } } if (!laid) { const h = J.hint(); J.lay(h.s, h.flip, h.twist); } }
  }
  for (let g = 0; g < k.gaps.length; g++) { const z = J.sliverFor(g); let r = J.chink(g, z); assert.ok(r === 'in' || r === 'deep', r); while (r === 'deep') r = J.chink(g, J.sliverFor(g)); for (let t = 0; t < L.YESOD103.taps; t++) J.tap(g); }
  return k;
}
test('build 103: the field stones — a chain of slanted ends; a stone meets the last end or leaves a wedge; too wide it does not sit; the last fits both ends and the length', () => {
  assert.equal(L.YESOD103.stretches.length, 2); assert.ok(L.YESOD103.stretches[0].ghost && !L.YESOD103.stretches[1].ghost);
  for (let r = 0; r < 25; r++) for (let i = 0; i < 2; i++) { const k = stretch(i); assert.ok(k.done, 'closed'); assert.ok(k.laid.length >= k.n - 1 && k.laid.length <= k.n + 1, `${k.laid.length}`); assert.ok(k.q >= 0.5, `the hint's way is at least כשר: ${k.pen}`); assert.equal(k.faceFaults, 0); }
  let mehudar = 0; for (let r = 0; r < 25; r++) if (stretch(0).q === 1) mehudar++; assert.ok(mehudar >= 15, `the good way mostly מהודר: ${mehudar}`);
  let worse = 0, brought = 0; for (let r = 0; r < 25; r++) { const k = stretch(1, 'twist'); assert.ok(k.done, 'a careless hand still closes it — the porters bring a stone that sits'); brought += k.supplied; if (k.faceFaults >= 1 && k.q < 1) worse++; } assert.ok(worse >= 20, 'twisted far: the faces run off the line'); assert.ok(brought >= 1);
  { const J = L.createStretch103(0, rnd), k = J.state(), h = J.hint(), S = k.pile[h.s]; const bad = J.trial(h.s, !h.flip, 0); const fit = Math.abs((h.flip ? S.a : S.b) - J.lastSlant()); if (fit > L.YESOD103.chink) assert.equal(bad.r, 'open', 'turned the wrong way: it does not sit'); assert.equal(J.lay(h.s, h.flip, h.twist).r === 'open', false);
    const before = k.laid.length; assert.ok(J.back()); assert.equal(k.laid.length, before - 1); assert.equal(k.pile[h.s].used, false, 'back up to the pile'); }
  { const J = L.createStretch103(0, rnd), k = J.state(); while (k.laid.length < k.n - 1) { const h = J.hint(); J.lay(h.s, h.flip, h.twist); } const long = k.pile.findIndex((s) => !s.used && s.l > J.state().len - J.x0() + L.YESOD103.longBy); if (long >= 0) assert.equal(J.trial(long, false, 0).r, 'long'); }
});
test('build 103: the slivers and the wooden mallet — the right thickness goes in and three taps drive it; too thick will not; too thin drops in', () => {
  const J = L.createStretch103(0, rnd), k = J.state(); k.ph = 'chink'; k.gaps = [{ j: 1, w: 0.2, left: 0.2, fill: [], taps: 0, shut: false }, { j: 2, w: 0.2, left: 0.2, fill: [], taps: 0, shut: false }];
  assert.equal(J.chink(0, 0.3), 'thick'); assert.equal(J.chink(0, 0.08), 'deep'); assert.ok(Math.abs(k.gaps[0].left - 0.12) < 1e-9); assert.equal(J.chink(0, 0.16), 'in'); assert.equal(J.chink(0, 0.08), 'busy', 'drive the one in first');
  assert.equal(J.tap(0), 'tap'); assert.equal(J.tap(0), 'tap'); assert.equal(J.tap(0), 'home'); assert.ok(k.gaps[0].shut); assert.equal(k.done, false);
  assert.equal(J.sliverFor(1), 0.26); assert.equal(J.chink(1, 0.26), 'in'); for (let t = 0; t < 3; t++) J.tap(1); assert.ok(k.done); assert.equal(k.fills, 3); assert.equal(k.extra, 1); assert.equal(k.q, 0, "three slivers and one dropped in: טעון תיקון");
});
test('build 103: the ends — the yesod eats one amah into the south and one into the east (מדות ג, א); a stone anywhere else on the rim: "כאן אין יסוד"', () => {
  const E = L.createEnds103();
  assert.equal(E.drop(31, 31).r, 'noyesod', 'the south-east corner: none'); assert.equal(E.drop(16, 31.5).r, 'noyesod', 'the south\'s middle: none'); assert.equal(E.drop(31.5, 20).r, 'noyesod');
  assert.equal(E.drop(60, 60).r, 'away'); assert.equal(E.drop(1.4, 31.6).r, 'set'); assert.equal(E.drop(1.5, 31.5).r, 'taken'); assert.equal(E.drop(31.4, 1.6).r, 'set');
  const k = E.state(); assert.ok(k.done); assert.equal(k.strays, 3); assert.equal(k.q, 0.5);
  const E2 = L.createEnds103(); E2.drop(1.5, 31.5); E2.drop(31.5, 1.5); assert.equal(E2.state().q, 1);
  assert.equal(L.yesodQ103([1, 1, 1]), 1); assert.equal(L.yesodQ103([1, 0.5, 0.5]), 0.5); assert.equal(L.yesodQ103([0, 0, 0.5]), 0);
});
test('build 103: the lines and sources — every line sourced or marked; no Divine Name; the stage\'s parts', () => {
  for (const [key, v] of Object.entries(L.L103)) assert.ok(/ · (טיוטה|המחשה)$/.test(v), key);
  for (const v of L.SRC103) assert.ok(/(טיוטה|המחשה)$/.test(v));
  const all = JSON.stringify([L.L103, L.SRC103]); for (const w of ['יהוה', 'אלהים', 'אלוהים', 'השם']) assert.ok(!all.includes(w), w);
  assert.deepEqual([...L.PARTS103], ['open', 'bench', 'course', 'reveal']); assert.deepEqual([...L.DEP103.course], ['bench']); assert.deepEqual([...L.PARTS103.filter((p) => !['open', 'reveal'].includes(p))].map((p) => typeof p), ['string', 'string']);
  assert.ok(read('src/game/lish103.js').includes('Never a Divine Name'));
});
test('build 103: the wiring — each work of the stage has its act and its label; the site opens the bench, then the course, then the reveal', async () => {
  const H = read('src/game/har42.js'), { open63 } = await import('../src/game/site63.js');
  for (const p of L.PARTS103.filter((q) => q !== 'open' && q !== 'reveal')) { assert.match(H, new RegExp(`\\n    ${p}: \\{ begin\\(\\) \\{ st\\.job = mk`), `${p}: its act`); assert.match(H, new RegExp(`[ {]${p}: '`), `${p}: its label`); }
  assert.deepEqual(open63('yesod', L.PARTS103, []), ['bench']); assert.deepEqual(open63('yesod', L.PARTS103, ['bench']), ['course']); assert.deepEqual(open63('yesod', L.PARTS103, ['bench', 'course']), ['reveal']);
  assert.match(H, /STG === 'yesod' \? \(ON103 \? F103\.PARTS103 : PARTS55\)/);
});
