// build 131 — stage 08 part 4, "הסיום" (src/game/h131/frame-model.js FIN…, finale.js): the timbers in their order (the south first,
// then the east), the whitened place = the yesod's own boxes (the strip along the south and east stays out), the cloth's wipe and its
// cover, the save's blob (a reload resumes at the step, the white kept), the water's way to the south-west corner's holes, the result.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as FM from '../src/game/h131/frame-model.js';
import { FINALE_ACT, NLINES, NK } from '../src/game/h131/finale.js';
import { createH131 } from '../src/game/h131/model.js';
import { BOOK } from '../src/game/world/grid.js';

const S8 = BOOK.s08, area = (b) => (b[2] - b[0]) * (b[3] - b[1]);

test('finale: the whitened place is the yesod as the world builds it — the strip of the timbers along the south and east stays out', () => {
  const C = FM.cellsOf(), N = FM.finCells();
  assert.equal(N, Object.values(S8.yesod).reduce((a, b) => a + area(b), 0));
  const cell = (x, z) => C[Math.floor(z - FM.FIN.Z0) * FM.FIN.NX + Math.floor(x - FM.FIN.X0)];
  for (const k of ['E', 'S']) { const b = S8.wood[k]; assert.equal(cell((b[0] + b[2]) / 2, (b[1] + b[3]) / 2), 0, k); }
  assert.equal(cell(-52.5, 12), 1, 'the south amah (S1)'); assert.equal(cell(-22.5, -18), 1, 'the east amah (E1)'); assert.equal(cell(-22.5, 0), 0);
  assert.equal(cell(-38, -3.5), 1);
});

test('finale: the timbers come out in their order — the south first, then the east (held at the corner until then)', () => {
  const F = FM.finFresh(); assert.equal(F.step, 'down');
  assert.ok(FM.pullable(F, 'S')); assert.ok(!FM.pullable(F, 'E'));
  F.out.S = 1; assert.ok(!FM.pullable(F, 'S')); assert.ok(FM.pullable(F, 'E'));
  F.out.E = 1; assert.ok(!FM.pullable(F, 'E'));
});

test('finale: the cloth whitens where it goes; the cover; the crew wipes the rest', () => {
  const F = FM.finFresh(); assert.equal(FM.cover(F), 0);
  const n = FM.wipe(F, -38, -3.5); assert.ok(n > 20 && n < 40, String(n));
  assert.equal(FM.wipe(F, -38, -3.5), 0, 'the same place twice: nothing new');
  assert.equal(FM.wipe(F, -22.5, 5, 0.45), 0, 'the empty strip takes no lime');
  for (let z = -18; z < 12; z += 4) for (let x = -53; x < -22; x += 2) FM.wipe(F, x, z);
  assert.ok(FM.cover(F) > FM.FIN.WHITE);
  FM.whiteAll(F); assert.equal(FM.cover(F), 1);
});

test('finale: the save\'s blob — a reload resumes at the step reached, the timbers out stay out, the white stays', () => {
  const F = FM.finFresh(); F.step = 'white'; F.out = { S: 1, E: 1 }; FM.wipe(F, -40, -10); FM.wipe(F, -30, 0);
  const b = JSON.parse(JSON.stringify(FM.finSave(F))); const R = FM.finLoad(b);
  assert.equal(R.step, 'white'); assert.deepEqual(R.out, { S: 1, E: 1 }); assert.equal(FM.cover(R), FM.cover(F)); assert.deepEqual([...R.mask], [...F.mask]);
  const W = FM.finFresh(); W.step = 'water'; W.water = 1; assert.ok(FM.finLoad(FM.finSave(W)).water < 1, 'the water poured again from where the jar was');
  assert.equal(FM.finLoad(null).step, 'down'); assert.equal(FM.finLoad({ step: 'nonsense' }).step, 'down');
  const M = createH131(null); assert.equal(M.autoTo((m) => m.id === 'finale').id, 'finale'); M.keep('finale', b); assert.deepEqual(createH131(JSON.parse(JSON.stringify(M.st))).workOf('finale'), b);
  M.done({ stars: 3 }); assert.equal(M.workOf('finale'), null);
});

test('finale: the water is poured on the yesod and runs to the south-west corner, down the two reeds\' holes (מידות ג, ב)', () => {
  const P = FM.waterPath(), C = FM.cellsOf(), cell = (x, z) => C[Math.floor(z - FM.FIN.Z0) * FM.FIN.NX + Math.floor(x - FM.FIN.X0)];
  assert.deepEqual(P[0], S8.work.water);
  for (const p of P) assert.equal(cell(p[0], p[1]), 1, 'on the yesod ' + p);
  const last = P[P.length - 1], R = S8.reeds; assert.ok(R.some((r) => Math.hypot(r[0] - last[0], r[1] - last[1]) < 1), 'it ends at a hole');
  assert.ok(R.every((r) => cell(r[0], r[1]) === 1), 'the holes in the yesod');
  assert.deepEqual(FM.finResult(), { pts: 40, q: 1, stars: 3, perfect: true });
});

test('finale act: the stand south of the frame (the book\'s), its words short, the ending from the book\'s camera; no iron', () => {
  const s = FINALE_ACT.stand(); assert.deepEqual([s.x, s.z], S8.stand.south.slice(0, 2));
  for (const [k, t] of Object.entries(NLINES)) { if (k === 'cloth') continue; assert.ok(t.split(/\s+/).length <= 6, k + ': ' + t); }
  assert.match(NLINES.cloth, /במפה, ולא בכף ברזל \(מידות ג, ד\)$/);
  const spec = readFileSync(new URL('../docs/specs/shlav-08-he.md', import.meta.url), 'utf8'); assert.ok(spec.includes('במפה, ולא בכף ברזל (מידות ג, ד)'));
  const src = readFileSync(new URL('../src/game/h131/finale.js', import.meta.url), 'utf8');
  assert.match(src, /W8\.cam\.rise/); assert.ok(NK.RISE[0][1] > S8.floor + 20 && NK.RISE[0][1] > NK.DOWN[0][1] + 10, 'the end rises high over the whole yesod'); assert.doesNotMatch(src, /\.play\('(strike|chisel|tool|wedge|clang|anvil)'/); assert.doesNotMatch(src, /'hammer'|'pick'|'saw'|חוט הסיקרא/);
  for (const k of ['DOWN', 'WHITE', 'WATER', 'RISE']) assert.ok(NK[k].flat().every(Number.isFinite), k);
  for (const k of ['S', 'E']) assert.ok(NK.PULL[k].flat().every(Number.isFinite), 'PULL ' + k);
  // (b131 look round: the working shots close — the eye within 30 amot of what it looks at)
  for (const C of [NK.DOWN, NK.PULL.S, NK.PULL.E, NK.WATER]) assert.ok(Math.hypot(C[0][0] - C[1][0], C[0][1] - C[1][1], C[0][2] - C[1][2]) < 30, String(C));
});

// ── b131 ── (the end card: the old game's yesod crew cheered on the white yesod with raised mallets, then walked across it) the last
// stage the director built ends with its old crews fading where they stand: no cheer, no walk ── /b131 ──
test('the director\'s last stage done: its old crews fade where they stand (no cheer on the white yesod, no walk across it)', async () => {
  const fs = await import('node:fs');
  const idx = fs.readFileSync(new URL('../src/game/index.js', import.meta.url), 'utf8'), cr = fs.readFileSync(new URL('../src/crews.js', import.meta.url), 'utf8');
  if (!/const gone = !a\.length && H109_ON && frontier\(G, S\) && S\.isDone\(G, s\.id\);/.test(idx)) throw new Error('syncCrews: gone');
  if (!/waiting \? \{ waiting: true \} : gone \? \{ vanish: true \} : null/.test(idx)) throw new Error('syncCrews: vanish');
  if (!/if \(!\(H109_ON && frontier\(G, S\)\)\) W\.crewsCheer\(c\.id\);/.test(idx)) throw new Error('completeFlow: no cheer');
  if (!/s\.vanish = !!\(opts && opts\.vanish\);/.test(cr) || !/if \(s\.vanish\) \{ w\.cheer = 0; dismiss\(w\); w\.a\.path = null; \}/.test(cr)) throw new Error('crews: vanish');
});
