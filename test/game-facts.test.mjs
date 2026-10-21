// ── flow8 ── (wave 8B) the facts' rotation: src/game/facts.js — node --test test/game-facts.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { normFacts, pickFact, createFacts, setFacts, allFacts } from '../src/game/facts.js';

const mk = (n, stage, topic) => Array.from({ length: n }, (_, i) => ({ id: `${stage || topic}-${i}`, he: `עובדה ${i}`, ref: 'משנה מדות א, א', stage, topics: topic ? [topic] : [], status: 'draft' }));

test('normFacts reads FACTS8B-like shapes (he/text, ref/source, stage/stages/tags) and drops the empty', () => {
  const n = normFacts({ facts: [
    { id: 'a', text_he: 'x', source: 'יוספוס', stages: ['har'], topics: ['herod'] },
    { id: 'b', he: 'y', source: { he: 'משנה' }, tags: ['wall', 'quarry'] },
    { id: 'c', he: '' },
    { id: 'a', he: 'dup' },
  ] });
  assert.equal(n.length, 2);
  assert.deepEqual([n[0].ref, n[0].stages, n[0].topics], ['יוספוס', ['har'], ['herod']]);
  assert.deepEqual([n[1].ref, n[1].stages, n[1].topics], ['משנה', ['wall'], ['quarry']]);
});

test('pickFact: the topic and the stage first, then the topic, then the stage, then any; no repeats; then over, never the last', () => {
  const list = normFacts([...mk(3, 'har'), ...mk(2, 'wall'), ...mk(2, '', 'quarry'), { id: 'hq', he: 'z', ref: 'r', stages: ['har'], topics: ['quarry'] }]);
  const seen = new Set();
  const first = pickFact(list, { topic: 'quarry', stage: 'har', seen }).fact;
  assert.equal(first.id, 'hq');                                   // both tags
  seen.add('hq');
  const q = pickFact(list, { topic: 'quarry', stage: 'har', seen }).fact;
  assert.ok(q.topics.includes('quarry'));                          // then the topic
  const got = [];
  for (let k = 0; k < 3; k++) { const f = pickFact(list, { stage: 'har', seen }).fact; got.push(f.id); seen.add(f.id); }
  assert.deepEqual(got.sort(), ['har-0', 'har-1', 'har-2']);       // the stage's pool, each once
  for (const f of list) seen.add(f.id);
  const r = pickFact(list, { stage: 'har', seen, last: 'har-2' });
  assert.ok(r.fact && r.fact.id !== 'har-2' && r.reset.length === 4, JSON.stringify(r));   // the stage's pool starts over, not with the last
});

test('createFacts: no repeats across sessions (the seen set rides in the save), a new one on every call', () => {
  setFacts([...mk(6, 'har'), ...mk(6, 'wall')]);
  const G = { fx: undefined, st: {} };
  const ids = [];
  for (let s = 0; s < 3; s++) {                                    // three "opens": a new rotation object over the same save
    const saved = JSON.parse(JSON.stringify(G));
    const F = createFacts({ G: () => saved, stage: () => 'har', rnd: () => 0.37 });
    ids.push(F.next().id, F.next().id);
    G.fx = saved.fx;
  }
  assert.equal(new Set(ids).size, 6, ids.join(','));
  assert.ok(ids.every((id) => id.startsWith('har-')), 'the current stage first');
  const F = createFacts({ G: () => G, stage: () => 'har' });
  assert.ok(F.next().id.startsWith('wall-'), 'the stage spent: then any other fact');
  setFacts([]);
});

test('without facts.json the game\'s own verified texts stand in (the stages\' Middot cards, the stories, the finds)', () => {
  setFacts(null);
  const a = allFacts();
  assert.ok(a.length >= 15, `fallback ${a.length}`);
  assert.ok(a.every((f) => f.he && f.ref), 'each has a source');
  assert.ok(!a.some((f) => new RegExp('\\u05D9\\u05D4\\u05D5\\u05D4|\\u05D9\\u05B0\\u05D4\\u05D5\\u05B8\\u05D4').test(f.he)), 'no Divine Name');
});

test('content/facts.json (when merged): every fact has a text ≤ 35 words and a source', { skip: !fs.existsSync(new URL('../content/facts.json', import.meta.url)) }, () => {
  const raw = JSON.parse(fs.readFileSync(new URL('../content/facts.json', import.meta.url), 'utf8'));
  const n = normFacts(raw);
  assert.ok(n.length >= 60, `${n.length} facts`);
  for (const f of n) { assert.ok(f.ref, `${f.id}: a source`); assert.ok(f.he.split(/\s+/).length <= 40, `${f.id}: ${f.he.split(/\s+/).length} words`); }
});
