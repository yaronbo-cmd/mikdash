// build 138 — stage 15: the book's section (BOOK.s15) and the two works' models (spec docs/specs/shlav-15-he.md v4).
import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOK } from '../src/game/world/grid.js';
import * as T from '../src/game/h138/teivah-model.js';
import * as P from '../src/game/h138/parochot-model.js';

test('BOOK.s15: derived from places.js; the amah between the two parochot; the void west of the inner', () => {
  const B = BOOK.s15;
  assert.equal(B.parochet.outer.x, -138); assert.equal(B.parochet.inner.x, -139);
  assert.ok(B.kodesh.void.x1 < B.parochet.inner.x);
  assert.equal(B.aliyah.y, 67);
  for (const k of ['1', '2', '3', 'amah']) assert.ok(B.aliyah.lul[k]);
  // zigzag: the openings at opposite ends (Tosafot Yom Tov): no straight line from the Heichal through both into the void
  assert.notEqual(B.parochet.outer.open, B.parochet.inner.open);
});
test('teivah: a slow pass along the lip flattens it; the levels differ (stations, heights, the rope)', () => {
  const n = [1, 2, 3].map((lv) => T.fresh(lv).n); assert.deepEqual(n, [3, 4, 5]);
  assert.ok(T.LEVELS[2].spin > T.LEVELS[1].spin);
  assert.ok(T.LEVELS[3].stations.some((s) => s.corner));
  const S = T.enter(T.fresh(1)); S.pole = true;
  const l = S.st.lips[0], a = l.s[0], b = l.s[l.s.length - 1];
  for (let r = 0; r < 3 && !l.fixed; r++) {
    S.tip = { x: a.x, y: a.y }; const dx = (b.x - a.x) * T.TV.K, dy = -(b.y - a.y) * T.TV.K, N = 120;
    for (let i = 0; i < N; i++) T.step(S, 1 / 60, { tool: { down: true, dx: dx / N, dy: dy / N } });
    T.step(S, 1 / 60, { tool: { down: false } });
  }
  assert.equal(S.k, 1); assert.equal(S.creases.length, 0); assert.equal(S.grades[0], 'gold');
});
test('teivah: crossing a raised lip fast leaves a crease (not on the free first drag)', () => {
  const S = T.enter(T.fresh(1)); S.pole = true;
  T.step(S, 1 / 60, { tool: { down: true, dx: 1, dy: 0 } }); T.step(S, 1 / 60, { tool: { down: false } });   // (the free trial)
  const l = S.st.lips[0], m = l.s[l.s.length >> 1], d = l.dirs[0] + Math.PI / 2;
  S.tip = { x: m.x - Math.cos(d) * 0.06, y: m.y - Math.sin(d) * 0.06 };
  for (let i = 0; i < 20; i++) T.step(S, 1 / 60, { tool: { down: true, dx: Math.cos(d) * 0.12 * T.TV.K / 20, dy: -Math.sin(d) * 0.12 * T.TV.K / 20 } });
  assert.ok(S.creases.length >= 1);
});
test('parochot: the finale\'s numbers (0.25 → 0.19 → catch → echo 0.019 → catch by the other hand)', () => {
  const S = P.fresh('neshima'); const dt = 1 / 120; let plan = null; const pos = { N: 0, H: 0 }; let t = 0; const got = [];
  for (let i = 0; i < 120 * 20 && !S.done; i++) {
    t += dt;
    if (!plan) for (const p of S.pulses) if (p.dir < 0 && p.planned !== (p.arr || 0) + 1) { const ta = (p.z + 10) / 8; if (ta < 0.35) { p.planned = (p.arr || 0) + 1; const Aa = p.A * Math.pow(2, -ta / 6); plan = { who: S.finale.got === 0 ? 'N' : 'H', v: P.vFor(Aa) * Math.sign(Aa), until: t + ta + 0.22 }; } }
    if (plan) { pos[plan.who] += plan.v * dt; if (t > plan.until) plan = null; }
    for (const e of P.step(S, dt, { N: { down: true, x: 0, y: pos.N }, H: { down: true, y: pos.H } })) if (e.e === 'catch') got.push([e.who, +e.A.toFixed(3)]);
  }
  assert.ok(S.done); assert.deepEqual(got.map((g) => g[0]), ['N', 'H']);
  assert.ok(Math.abs(got[0][1] - 0.187) < 0.01 && Math.abs(got[1][1] - 0.019) < 0.004);
});
test('parochot: level 1 folds slowly with no light; a fast fold lifts the limp inner (light)', () => {
  const run = (speed) => { const S = P.fresh(1); let x = 0; for (let i = 0; i < 600 && x < 135; i++) { x += speed / 60; P.step(S, 1 / 60, { S: { down: true, x, y: 0 } }); } for (let i = 0; i < 600; i++) P.step(S, 1 / 60, { S: { down: true, x, y: 0 } }); return S; };
  assert.equal(run(60).lights.length, 0);
  assert.ok(run(900).lights.length >= 1);
});
