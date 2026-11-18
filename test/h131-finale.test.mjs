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

// ── b131 (PC run 6: the whitening stood still on a fast PC) the cloth's step is the same at any frame rate, and wipes at fixed places
// over the yesod bring it to cover 1 at 144, 60 and 20 frames a second; the act never refuses a touch on the yesod in the whitening
test('finale whitening: wipes at fixed places reach cover 1 at dt 1/144, 1/60 and 1/20', () => {
  const F0 = FM.FIN, rows = []; for (let z = F0.Z0 + 1.5; z < F0.Z0 + F0.NZ; z += 4) rows.push(z);
  const path = []; rows.forEach((z, i) => { const a = [F0.X0 + 0.5, z], b = [F0.X0 + F0.NX - 0.5, z]; path.push(...(i % 2 ? [b, a] : [a, b])); });
  const out = {};
  for (const fps of [144, 60, 20]) {
    const F = FM.finFresh(), dt = 1 / fps, V = 12, CL = { x: path[0][0], z: path[0][1], tx: path[0][0], tz: path[0][1] };
    for (let i = 1; i < path.length; i++) {
      const [x0, z0] = path[i - 1], [x1, z1] = path[i], L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.ceil(L / (V * dt)));
      for (let s = 1; s <= n; s++) { CL.tx = x0 + ((x1 - x0) * s) / n; CL.tz = z0 + ((z1 - z0) * s) / n; FM.clothStep(F, CL, dt, NK.CLOTH); }
    }
    for (let t = 0; t < 1; t += dt) FM.clothStep(F, CL, dt, NK.CLOTH);
    out[fps] = FM.cover(F);
    assert.equal(out[fps], 1, `cover at ${fps} frames a second: ${out[fps]}`);
  }
  // (one step of a long frame lands where many short ones do)
  const a = { x: 0, z: 0, tx: 10, tz: 0 }, b = { ...a }, Fa = FM.finFresh(), Fb = FM.finFresh();
  FM.clothStep(Fa, a, 0.2, NK.CLOTH); for (let i = 0; i < 29; i++) FM.clothStep(Fb, b, 0.2 / 29, NK.CLOTH);
  assert.ok(Math.abs(a.x - b.x) < 1e-9);
});
test('finale whitening: any touch on the yesod takes the cloth (a refused touch turned the look out and the act waited)', () => {
  const src = readFileSync(new URL('../src/game/h131/finale.js', import.meta.url), 'utf8');
  assert.match(src, /A\.step === 'white' && onYesod\(f\)\) return \{ k: 'cloth' \}/);
  assert.ok(!/q\.y < H - 100 && manPlace/.test(src), 'the grey a finger can wipe is not narrowed by the man\'s place');
});
// ── b131 review item 6: the timber is heavy — held at the full pull GIVE s before it gives, the screen shaken SHAKE s, a heavy wood
// sound; every touch in the finale answers at once (the grip, the cloth, the jar)
test('finale: the pull is heavy and every touch answers at once', () => {
  assert.ok(NK.GIVE >= 0.6 && NK.GIVE <= 0.9); assert.ok(NK.SHAKE >= 0.3 && NK.SHAKE <= 0.4);
  const src = readFileSync(new URL('../src/game/h131/finale.js', import.meta.url), 'utf8');
  assert.match(src, /A\.giveT >= NK\.GIVE/); assert.match(src, /X\.shake\(NK\.SHAKE/); assert.match(src, /V\.thud\(\); V\.knock\(1\.8\)/);
  for (const k of ['grip', 'cloth', 'jar']) assert.match(src, new RegExp(`A\\.ans = '${k}'`), k + ' answers at once');
  assert.ok(!/iron|ברזל\(/.test(src.replace(/ולא בכף ברזל|no iron[^\n]*|No iron[^\n]*|LINES\.iron/g, '')), 'no iron sound');
});
// ── b131: a cut and the man it moves happen inside the act's frame (after the figures gate, before the camera's step); from a finger's
// lift or a wait's end the man stood one frame at his new place under the old picture, and the gate had him cut
test('finale whitening: the cloth\'s cuts are made inside the act\'s frame', () => {
  const src = readFileSync(new URL('../src/game/h131/finale.js', import.meta.url), 'utf8');
  assert.match(src, /if \(A\.q && A\.q\.length\) for \(const fn of A\.q\.splice\(0\)\) fn\(\);/);
  assert.match(src, /inFrame\(\(\) => \{ show\('white'\); clothShot/);
  assert.match(src, /keep\(\); inFrame\(\(\) => \{ if \(!A\.whiteDone && A\.fl == null\) clothShot/);
  assert.match(src, /> 2\.5\) inFrame\(\(\) => \{ X\.shot\(e, t\.slice\(\), 0\); clothMan\(true\); \}\)/);
});
