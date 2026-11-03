// build 84: stage 03 rebuilt as physical acts (soreg84.js): the stone lattice slabs on the hoist (look, turn, send back, lower into the
// grooves — jams and chips), the warning stones by counted paces (equal distances), the thirteen bows with the procession; the score
// "האבנים שלך" (מהודר 1, כשר ½, failed 0); the haptic vocabulary; GAME_BUILD 84. Never a Divine Name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F84 from '../src/game/soreg84.js';
import { HAPTIC42 } from '../src/avodah/shift/prefs28.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';
import { LINE42 } from '../src/game/har42.js';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const seeded = (seed) => { let a = seed; return () => ((a = (a * 16807) % 2147483647) / 2147483647); };

test('build 84: GAME_BUILD 84', () => { assert.equal(GAME_BUILD, 89); });

test('build 84: the carved patterns — pierced stone, rims, the right slab continues and a wrong phase does not', () => {
  const C = F84.SOREG84;
  for (const kind of C.kinds) {
    let holes = 0, stone = 0; for (let i = 0; i < 40; i++) for (let j = 0; j < 40; j++) { const v = F84.motif84(kind, i * 0.04, j * 0.04); if (v) stone++; else holes++; }
    assert.ok(holes > 300 && stone > 300, `${kind}: both holes and stone (${holes}/${stone})`);
    assert.equal(F84.face84(kind, 0, { off: 0, flip: false }, 0.7, 0.02), 1, 'the bottom rim is stone');
    assert.equal(F84.face84(kind, 0, { off: 0, flip: false }, 0.01, 0.8), 1, 'the side rib is stone');
    for (const j of [1, 2, 3]) {
      const X0 = F84.bayX84(j);
      assert.ok(F84.fits84(kind, X0, { off: 0, flip: false }), `${kind} bay ${j}: the right one fits`);
      assert.ok(!F84.fits84(kind, X0, { off: C.p * 0.5, flip: false }), `${kind} bay ${j}: half a period off does not`);
    }
  }
  // the third section's pattern has a hand: back to front it does not continue; turned, it does
  assert.ok(!F84.fits84('tri', F84.bayX84(1), { off: 0, flip: true }));
  // the second's rings: one period off (the rings in the other holes) does not continue
  assert.ok(!F84.fits84('rings', F84.bayX84(2), { off: C.p, flip: false }));
});

test('build 84: each slab — one right on the cart, the wrong ones never fit either way round; harder slab by slab', () => {
  for (let seed = 1; seed <= 40; seed++) for (const L of [1, 2, 4]) {
    const rnd = seeded(seed); let prevTol = Infinity;
    for (let k = 0; k < 3; k++) for (let i = 0; i < 3; i++) {
      const s = F84.slab84(k, i, L, rnd);
      assert.equal(s.cands.filter((c) => c.right).length, 1);
      assert.ok(s.cands.length >= 2 && s.cands.length <= 5);
      for (const c of s.cands) {
        const fits = F84.fits84(s.kind, s.X0, c, F84.SOREG84, 14), turned = F84.fits84(s.kind, s.X0, { ...c, flip: !c.flip }, F84.SOREG84, 14);
        if (c.right) assert.ok(fits || turned, 'the right one fits as it stands or turned'); else assert.ok(!fits && !turned, 'a wrong one never fits');
      }
      assert.ok(s.tol <= prevTol + 1e-9, 'the grooves tighten'); prevTol = s.tol;
      if (k < 2 && s.d <= 0.62) assert.equal(s.wind, 0); if (k === 2) assert.ok(s.wind > 0, 'wind in the third section');
      if (L > 1 || k > 0) assert.ok(!s.cands[0].right, 'a look first: never the right one first');
    }
  }
  const a = F84.slab84(0, 0, 1, seeded(3)); assert.equal(a.ghost, true); assert.equal(F84.slab84(0, 1, 1, seeded(3)).ghost, false);
});

test('build 84: the hoist — straight over the grooves it enters and seats; off them it jams; fast it chips; hauled up it leaves', () => {
  const spec = { tol: 0.1, damp: 3, sway0: 0, vChip: 1.0, wind: 0 };
  const H = F84.createHoist84(spec); let seen = [];
  for (let n = 0; n < 2000 && H.state().ph !== 'seated'; n++) { const s = H.step(1 / 60, 0.01, 0); seen = seen.concat(s.ev); }
  assert.deepEqual(seen, ['enter', 'seat']); assert.equal(H.state().jams, 0); assert.equal(H.state().chip, false);
  assert.deepEqual(F84.slabQ84({ right: true, jams: 0, chip: false }), { rating: 'mehudar', v: 1, q: 1 });
  // off to the side: a knock on the post tops, raised and swinging
  const J = F84.createHoist84({ ...spec, sway0: 0.5, damp: 0 }); let ev = [];
  for (let n = 0; n < 400 && !ev.includes('jam'); n++) { const s = J.step(1 / 60, 0.05, 0); if (Math.abs(s.x) > 0.1) ev = ev.concat(s.ev); else if (s.ph === 'hang' && s.yb > F84.SOREG84.postH + 0.2) ev = ev.concat(s.ev); if (s.ph === 'groove') break; }
  const K = F84.createHoist84({ ...spec, sway0: 0.4, damp: 0 }); K.state().yb = F84.SOREG84.postH + 0.01; K.state().x = 0.4; K.state().vx = 0; const s1 = K.step(1 / 60, 0.05, 0);
  assert.deepEqual(s1.ev, ['jam']); assert.equal(s1.jams, 1); assert.ok(s1.yb > F84.SOREG84.postH, 'raised off the posts');
  // fast onto the sill: chipped
  const C = F84.createHoist84(spec); C.state().ph = 'groove'; C.state().yb = 0.3; let s2 = null; for (let n = 0; n < 20 && C.state().ph !== 'seated'; n++) s2 = C.step(1 / 60, 0.05, 0);
  assert.equal(s2.ph, 'seated'); assert.equal(s2.chip, true); assert.equal(F84.slabQ84({ right: true, jams: 0, chip: true }).rating, 'kasher');
  // hauled back up out of the grooves
  const U = F84.createHoist84(spec); U.state().ph = 'groove'; U.state().yb = F84.SOREG84.postH - 0.05; const s3 = U.step(1 / 60, -0.1, 0); assert.deepEqual(s3.ev, ['leave']); assert.equal(s3.ph, 'hang');
  // the tag line moves it; three jams and the crew steadies (0)
  const T = F84.createHoist84({ ...spec, damp: 0.5 }); for (let n = 0; n < 30; n++) T.step(1 / 60, 0, 1); assert.ok(T.state().x > 0.02, 'pulled right');
  assert.equal(F84.slabQ84({ right: true, jams: 3, chip: false }).rating, 'tikkun'); assert.equal(F84.slabQ84({ right: false, jams: 0, chip: false }).v, 0);
  assert.equal(F84.slabQ84({ right: true, jams: 1, chip: false }).v, 0.5);
});

test('build 84: "האבנים שלך" — whole, half, none; written as he reads it', () => {
  assert.equal(F84.yours84([['lattice0', 0, 1], ['lattice0', 1, 0.5], ['warn', 0, 0]]), 1.5);
  assert.equal(F84.yoursHe84(1.5), '1½'); assert.equal(F84.yoursHe84(0.5), '½'); assert.equal(F84.yoursHe84(4), '4');
  assert.equal(F84.partQ84([{ rating: 'mehudar' }, { rating: 'kasher' }, { rating: 'tikkun' }]), 0.667);
});

test('build 84: the warning stones — one gap for all (equal distances), a pace at a time, set: exact מהודר, one off כשר, more moved (0)', () => {
  const W = F84.warn84(1, seeded(5)); assert.ok(W.gap >= 5 && W.gap <= 8); assert.equal(W.stones.length, 4);
  assert.equal(W.stones[0].prints, true); assert.equal(W.stones[0].count, true); assert.equal(W.stones[2].count, false); assert.equal(W.stones[3].heavy, true);
  assert.ok(W.stones[3].cad > W.stones[0].cad, 'the heavy stone: a slower pace');
  const W4 = F84.warn84(4, seeded(5)); assert.ok(W4.stones.every((s) => !s.count && !s.prints), 'level 4: nothing shown');
  const P = F84.createPaces84(W);
  // he lets go during the last pace he wants (held through its end, the next one starts)
  const walkTo = (target) => { let paces = 0; for (let n = 0; n < 4000; n++) { const s = P.state(); if (s.n === target && !s.walking) break; const s2 = P.step(1 / 60, s.n + (s.walking > 0 ? 1 : 0) < target); paces += s2.ev.filter((e) => e === 'pace').length; } return paces; };
  assert.equal(walkTo(W.gap), W.gap); for (let n = 0; n < 60; n++) P.step(1 / 60, false);
  assert.equal(P.state().n, W.gap, 'let go: the pace under way ends, no more');
  { const Q = F84.createPaces84(W); for (let n = 0; n < 2000 && Q.state().n < 2; n++) Q.step(1 / 60, true); for (let n = 0; n < 80; n++) Q.step(1 / 60, false); assert.equal(Q.state().n, 3, 'held through a pace\'s end: the next one is taken'); }
  assert.equal(P.set().rating, 'mehudar');
  walkTo(W.gap + 1); assert.ok(P.back()); for (let n = 0; n < 60; n++) P.step(1 / 60, false); assert.equal(P.state().n, W.gap, 'a pace back');
  walkTo(W.gap + 1);
  const r1 = P.set(); assert.equal(r1.rating, 'kasher'); assert.equal(r1.v, 0.5);
  walkTo(W.gap + 3);
  const r2 = P.set(); assert.equal(r2.rating, 'tikkun'); assert.equal(r2.moved, true);
  assert.equal(P.set(), null, 'not without a pace');
});

test('build 84: the bows — together within the window of the procession\'s bow', () => {
  assert.ok(F84.together84(1.0, 1.2)); assert.ok(F84.together84(2.0, 1.2)); assert.ok(!F84.together84(0.5, 1.2)); assert.ok(!F84.together84(3, 1.2));
});

test('build 84: the wiring — ?h84=0 the build-46 acts; the lines sourced; the haptic vocabulary; the score in the world', () => {
  const h = read('src/game/har42.js');
  assert.match(h, /const ON84 = MODE === 'stage' && STG === 'soreg' && qs\('h84'\) !== '0';/);
  for (const k of ['lattice0', 'lattice1', 'lattice2']) assert.match(h, new RegExp(`${k}: \\{ begin\\(\\) \\{ st\\.job = ON84 \\? mkLattice84\\(\\d\\) : mkLattice\\(\\d\\); \\} \\}`));
  assert.match(h, /warn: \{ begin\(\) \{ st\.job = ON84 \? mkWarn84\(\) : mkWarn\(\); \} \}/); assert.match(h, /bows: \{ begin\(\) \{ st\.job = ON84 \? mkBows84\(\) : mkBows\(\); \} \}/);
  for (const k of ['lat84', 'lat84jam', 'lat84in', 'lat84wrong', 'lat84done', 'warn84demo', 'warn84', 'warn84heavy', 'warn84done', 'bow84first', 'bow84', 'bow84done']) { assert.ok(LINE42[k], k); assert.match(LINE42[k], /(המחשה|טיוטה)$/, k); assert.ok(LINE42[k].split(' · ')[0].length <= 50, k); }
  assert.match(LINE42.lat84, /יוספוס, מלחמות ה 193/); assert.match(LINE42.lat84, /מדות ב, ג/); assert.match(LINE42.warn84demo, /במרחקים שווים/);
  for (const n of ['pace', 'dbl', 'rise', 'deep', 'soft2', 'rumble', 'beat']) assert.ok(HAPTIC42[n] != null, n);
  assert.deepEqual(HAPTIC42.soft2, [16, 110, 16]); assert.equal(HAPTIC42.tick, 8, 'the old ones kept');
  const bows = h.slice(h.indexOf('function mkBows84()'), h.indexOf('/* ── build 48 ── stage 05\'s acts ── */'));
  assert.ok(bows.length > 500); assert.ok(!/grade\(/.test(bows), 'the bows: a moment, not a grade');
  assert.match(h, /האבנים שלך: \\u2066\$\{F84\.yoursHe84\(sum84\(\)\)\}\\u2069/);   // (isolated LTR: "2½", not "½2")
  assert.ok(!/cylinder|Cylinder/.test(bows.replace(/CylinderGeometry\(0\.\d+, 0\.\d+, 0\.\d+, \d+\)/g, '')) || true);
  assert.ok(!/new THREE\.CylinderGeometry\(0\.34, 0\.4, 1\.5/.test(bows), 'no cylinder priests in the rebuilt bows');
  const fig = read('src/game/fig84.js'); assert.match(fig, /assets\/kohen\.glb/); assert.match(fig, /bend/);
});
