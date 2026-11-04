// build 97 — stage 05, the women's court built before his eyes (court97.js): the chambers rise from their footings by the crews' crane
// while he walks and works, never ahead of his works; build 15's treadwheel and snap-line come back among the gallery's works; the
// opening's plan drawn as the builders drew it (lime, stakes, cords, a pale line), not yellow boxes. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('build 97: the crews\' share — low at first, creeping toward his next work, never past it', async () => {
  const F = await import('../src/game/court97.js');
  const C = F.COURT97, works = F.PARTS97.length - 2;
  assert.equal(F.want97(F.share97(0, works, 0)), C.start, 'the footings and a first run when he arrives');
  let c = 0; for (let t = 0; t < 600; t++) c = F.creep97(c, 1);
  assert.equal(c, C.lead, 'the crews stop short of his next work');
  assert.ok(F.share97(0, works, c) < F.share97(1, works, 0), 'never past the share of the work he has not done');
  assert.ok(F.want97(F.share97(works, works, 0)) === C.ncap, 'all his works done: the stones of the finish\'s start');
  assert.equal(F.next97(10, 10, false), null); assert.equal(F.next97(10, 12, false), 'lift'); assert.equal(F.next97(10, 12, true), null);
  assert.equal(F.next97(10, 10 + C.behind + 1, true), 'jump', 'far behind: set at once, even while busy');
  assert.ok(F.inner97({ face: [101, 7, -40] }) && !F.inner97({ face: [141, 7, -40] }) && !F.inner97({ face: [60, 7, -67.5] }), 'the chambers\' inner faces, not the court\'s outer wall');
  assert.equal(F.foot97(600, 1000), 'R'); assert.equal(F.foot97(100, 1000), 'L');
  assert.equal(F.q97({ quality: 0.9 }), 1); assert.equal(F.q97({ quality: 0.6 }), 0.5); assert.equal(F.q97({ quality: 0.2 }), 0); assert.equal(F.q97(null), 0);
});

test('build 97: the works — build 15\'s jobs among build 93\'s, in the structure\'s order', async () => {
  const F = await import('../src/game/court97.js');
  const { DEP63, open63 } = await import('../src/game/site63.js');
  assert.deepEqual([...F.PARTS97], ['open', 'tread97', 'line97', 'beams', 'beams2', 'beams3', 'tread97b', 'pegs', 'pegs2', 'corner', 'walk', 'reveal']);
  assert.equal(DEP63.nashim97, F.DEP97);
  assert.deepEqual(open63('nashim97', F.PARTS97, []), ['tread97', 'beams'], 'the wheel and the first beam side by side');
  assert.deepEqual(open63('nashim97', F.PARTS97, ['tread97']), ['line97', 'beams']);
  assert.ok(!open63('nashim97', F.PARTS97, ['tread97', 'line97', 'beams', 'beams2', 'beams3', 'pegs', 'pegs2']).includes('corner'), 'the corner after the heavy lift too');
  for (const p of F.PARTS97) if (p !== 'open' && p !== 'reveal') assert.ok(p in F.DEP97, p);
  for (const [k, j] of Object.entries(F.JOB97)) { assert.ok(['tread', 'snap'].includes(j.game), k); assert.ok(j.L >= 0 && j.L <= 2, k); }
  assert.ok(F.JOB97.tread97b.L > F.JOB97.tread97.L, 'the second lift heavier');
});

test('build 97: the old games play to the end in node (their own autopilot) and grade', async () => {
  const F = await import('../src/game/court97.js');
  const { tread } = await import('../src/game/minigames/tread.js');
  const { snap } = await import('../src/game/minigames/snap.js');
  for (const L of [0, 1]) {
    const M = tread.model({ level: L, rng: () => 0.5 }); let t = 0;
    while (!M.done && t < 240) { const a = M.auto(); if (a) M.press(a.press, a.down); M.step(1 / 60); t += 1 / 60; }
    assert.ok(M.done, `tread L${L} done`); assert.equal(M.i, 3); assert.ok(F.q97(M.result()) >= 0.5, `tread L${L} q ${M.result().quality}`);
  }
  const N = snap.model({ level: 1, rng: () => 0.5 }); let t = 0;
  while (!N.done && t < 120) { if (N.auto()) N.tap(); N.step(1 / 60); t += 1 / 60; }
  assert.ok(N.done, 'snap done'); assert.equal(N.q.length, 3); assert.ok(F.q97(N.result()) >= 0.5);
  // a tread stepped with one foot only stumbles: no stone flies up by itself while he holds still
  const B = tread.model({ level: 0 }); B.patient = true; for (let k = 0; k < 6; k++) { B.press('R', true); B.step(0.3); B.press('R', false); B.step(0.1); }
  assert.ok(B.stumbles >= 4, 'the same foot again: a stumble');
});

test('build 97: wiring — the flag, the acts, the crews\' frame, the plan, the lines', async () => {
  const { LINE42 } = await import('../src/game/har42.js');
  const h = read('src/game/har42.js'), F = await import('../src/game/court97.js');
  assert.match(h, /const ON97 = ON93 && qs\('h97'\) !== '0'/);
  assert.match(h, /STG === 'nashim' \? \(ON97 \? F97\.PARTS97 : ON93 \? PARTS93 : PARTS48\)/);
  for (const f of ['plan97', 'frame97', 'mkTread97', 'mkLine97', 'fin97']) assert.match(h, new RegExp(`function ${f}\\(`), f);
  assert.match(h, /if \(ON97\) frame97\(dt\)/);
  assert.match(h, /stages\.liftStone\('nashim', \{ ms: F97\.COURT97\.liftMs, pick: F97\.inner97 \}\)/, 'the crane lifts the crews\' stones where they are seen');
  const sj = read('src/stages.js');
  assert.match(sj, /function pickSlots\(id, pick\)/); assert.match(sj, /function treadBegin\(site, o\)/); assert.match(sj, /if \(it\.keep\) \{ const s = slotOf\(it\.b, true\); TW\.keep\.push/);
  assert.match(h, /stages\.craft && stages\.craft\.tread/); assert.match(h, /stages\.craft && stages\.craft\.line/);
  assert.match(h, /STG === 'nashim' && ON97\) st\.props\.plan48 = plan97\(add\)/, 'the yellow boxes out');
  assert.match(h, /\(STG === 'nashim' && !ON97\)\) \{ try \{ if \(stages\.setStage\)/, 'his grade no longer jumps the chambers to 0.62');
  assert.doesNotMatch(h, /function mkWood93\(|function paint93\(/, 'the log\'s peeling gone (out since 96)');
  for (const k of ['tread97', 'line97']) { const t = LINE42[k]; assert.ok(t, k); assert.ok(/המחשה/.test(t), k); assert.ok(t.split(' · ')[0].length <= 50, k); }
  assert.equal(F.PLAN97.length, 6); for (const r of F.PLAN97) assert.equal(F.edges97(r).length, 4);
  const c = read('src/game/court97.js'); assert.doesNotMatch(c, /יהוה|אלוהים/);
});

test('build 97: never two men in one place — the crews step apart, the markers\' pairs stand side by side', () => {
  const c = read('src/crews.js'), s = read('src/stages.js');
  assert.match(c, /function apart97\(\)/); assert.match(c, /try \{ apart97\(\); \} catch/);
  assert.match(c, /const SEP97 = 1\.15/);
  assert.match(s, /\(the tangent square to the face/, 'mkAnchor: the tangent square to the face');
  assert.match(s, /T0\.begin = \(site, o\) => \{ const r = b0\(site, o\);/, 'the treadwheel\'s pick reaches treadBegin');
});
