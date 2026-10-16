// HOOK20: the daily riddle's rules (no browser). Run: node --test test/hook20-riddle.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as S from '../src/game/state.js';
import * as R from '../src/game/hooks/riddle.js';

const RAW = JSON.parse(fs.readFileSync(new URL('../content/riddle.json', import.meta.url), 'utf8'));
test('the content: drafts with sources, 2 steps or more, the right answers exist', () => {
  assert.equal(R.RIDDLES.length, RAW.riddles.length);
  for (const r of RAW.riddles) {
    assert.equal(r.status, 'draft'); assert.match(r.ref, /משנה (מדות|יומא|תמיד)/); assert.ok(r.steps.length >= 2 && r.steps.length <= 4);
    for (const s of r.steps) { assert.ok(s.h1 && s.h2, r.id + ' hints'); if (s.t === 'choose') assert.ok(s.a[s.ok]); if (s.t === 'place') for (const it of s.items) assert.ok(s.slots.some((x) => x.id === it.to)); }
  }
});
test('one riddle a day by the day\'s number (no luck), levels by stages done, tomorrow\'s title', () => {
  assert.equal(R.pickFor('2026-10-07', 0).id, R.pickFor('2026-10-07', 0).id);
  for (let i = 0; i < 12; i++) { const r = R.pickFor('2026-10-' + String(10 + i), 0); assert.ok((r.min | 0) <= 0); }
  const seen = new Set(); for (let i = 0; i < 8; i++) seen.add(R.pickFor('2026-11-' + String(10 + i), 5).id); assert.equal(seen.size, R.RIDDLES.length, 'with enough stages every riddle comes round');
  assert.ok(R.tomorrow('2026-10-07', 5).length > 0);
});
test('rules: a wrong try costs nothing, the right ones advance, solving keeps the fact once', () => {
  const G = S.fresh(1e12), day = '2026-10-07'; G.riddle = null;
  const st = R.ensure(G, day, 5); const def = R.byId(st.id);
  for (const step of def.steps) {
    const wrong = step.t === 'choose' ? (step.ok + 1) % step.a.length : step.t === 'count' ? step.n + 1 : step.t === 'order' ? [1, 0, 2, 3].slice(0, step.items.length) : { item: step.items[0].id, slot: step.slots.find((x) => x.id !== step.items[0].to).id };
    assert.equal(R.check(step, wrong), false);
    const right = step.t === 'choose' ? step.ok : step.t === 'count' ? step.n : step.t === 'order' ? step.items.map((_, i) => i) : { item: step.items[0].id, slot: step.items[0].to };
    assert.equal(R.check(step, right), true);
    R.advance(G, day);
  }
  assert.equal(G.riddle.solved, true); assert.ok(R.keep(G, day)); assert.equal(R.solvedBook(G).length, 1);
  assert.deepEqual(R.advance(G, day), { done: false, solved: true }, 'nothing more to pay');
  const again = R.ensure(G, day, 5); assert.equal(again.solved, true, 'the same day: the same riddle');
  assert.equal(R.ensure(G, '2026-10-08', 5).solved, false, 'a new day: a new riddle');
});
test('hints at 30 s and 60 s; the order step is never shown solved', () => {
  assert.deepEqual([0, 29999, 30000, 59999, 60000, 200000].map(R.hintAt), [0, 0, 1, 1, 2, 2]);
  const o = R.RIDDLES.find((r) => r.steps[0].t === 'order').steps[0]; const sh = R.shown(o);
  assert.equal(new Set(sh).size, o.items.length); assert.ok(!sh.every((v, i) => v === i));
});
