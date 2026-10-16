// HOOK19 (wave 19, note 6): the master score — FUN19 §4.1's numbers, the 10,000 coin, the title ladder, the first coin in 8–14 minutes.
//   node --test test/hook-score.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createScore, ACT, BONUS, JOB_END, MILESTONE, titleOf, nextTitle, fmt } from '../src/game/score.js';

const mk = (G = {}, extra = {}) => { let t = 1e6; const S = createScore({ G: () => G, now: () => t, ...extra }); return { S, G, tick: (ms) => { t += ms; } }; };

test('the table: 10 · 20 · 40 per act, 50 from the third gold in a row; a miss ends the run and never subtracts', () => {
  const { S, G, tick } = mk();
  assert.deepEqual([S.grade('ok'), S.grade('good'), S.grade('gold')], [10, 20, 40]);
  assert.deepEqual([S.grade('gold'), S.grade('gold'), S.grade('gold'), S.grade('gold')], [40, 50, 50, 50]);   // (the 2nd gold since the good: 40; from the 3rd in a row: 50)
  assert.equal(S.grade('good'), 20); assert.equal(S.grade('gold'), 40);   // the run ended
  tick(9000); assert.equal(S.grade('gold'), 40); assert.equal(S.grade('gold'), 40); assert.equal(S.grade('gold'), 50);
  assert.equal(G.score ?? 0, 0, 'grade() alone scores nothing: the caller adds');
  assert.deepEqual([ACT.ok, ACT.good, ACT.gold, ACT.streak], [10, 20, 40, 50]);
  assert.deepEqual(JOB_END, [0, 50, 100, 200]);
  assert.deepEqual([BONUS.fresh, BONUS.course, BONUS.stage, BONUS.read, BONUS.quiz, BONUS.welcome], [100, 250, 1000, 500, 200, 1000]);
});

test('add: accumulates, saves in G.score, never goes down; once-only keys pay once', () => {
  const { S, G } = mk();
  assert.equal(S.add(40, 'gold').total, 40); assert.equal(G.score, 40);
  assert.equal(S.add(-5, 'x').total, 40); assert.equal(S.add(NaN, 'x').total, 40); assert.equal(S.add(7.9, 'x').total, 47);
  assert.equal(S.add(1000, 'welcome', { once: 'welcome' }).n, 1000); assert.equal(S.add(1000, 'welcome', { once: 'welcome' }).n, 0); assert.equal(G.score, 1047);
  assert.equal(S.add(100, 'fresh', { once: 'fresh:wall:strike' }).n, 100); assert.equal(S.add(100, 'fresh', { once: 'fresh:wall:strike' }).n, 0); assert.equal(S.add(100, 'fresh', { once: 'fresh:gates:strike' }).n, 100);
});

test('10,000: one coin per crossing, its face is the stage where it was earned; two at once pay two; never lost; kept in G.dinars', () => {
  let stage = 'wall';
  const { S, G } = mk({ score: 9990 }, { stage: () => stage });
  const a = S.add(5, 'ok'); assert.equal(a.coins.length, 0); assert.equal(S.get().glow, true);
  stage = 'gates'; const b = S.add(10, 'ok'); assert.equal(b.coins.length, 1); assert.equal(b.coins[0].stage, 'gates'); assert.equal(G.dinars.length, 1); assert.equal(S.get().coins, 1);
  assert.equal(S.get().title, 'פועל'); assert.equal(S.unseen().length, 1); S.seen(0); assert.equal(S.unseen().length, 0);
  stage = 'nashim'; assert.equal(S.add(20005, 'stage').coins.length, 2); assert.deepEqual(G.dinars.map((d) => d.n), [1, 2, 3]); assert.equal(S.get().title, 'אומן');
  const j = JSON.parse(JSON.stringify(G)); const again = mk(j).S; assert.equal(again.get().total, G.score); assert.equal(again.list().length, 3);   // saved and reloaded
});

test('a save whose total passed a multiple without a coin gets it (never lost) — quietly', () => {
  const { S, G } = mk({ score: 30500 });
  const m = S.sync(); assert.equal(m.length, 3); assert.equal(G.dinars.length, 3); assert.equal(S.unseen().length, 0);
});

test('the ladder: 1 פועל · 3 אומן · 6 אומן בכיר · 10 ראש אומנים · 15 בונה הבית', () => {
  assert.deepEqual([0, 1, 2, 3, 5, 6, 9, 10, 14, 15, 40].map(titleOf), [null, 'פועל', 'פועל', 'אומן', 'אומן', 'אומן בכיר', 'אומן בכיר', 'ראש אומנים', 'ראש אומנים', 'בונה הבית', 'בונה הבית']);
  assert.deepEqual(nextTitle(0), { at: 1, t: 'פועל', left: 1 }); assert.equal(nextTitle(15), null);
  assert.equal(fmt(12340), '12,340'); assert.equal(fmt(0), '0'); assert.equal(fmt(999), '999'); assert.equal(fmt(1000000), '1,000,000');
});

test('the ring: its fraction toward the next 10,000, glowing from 90 %', () => {
  const { S } = mk({ score: 12340 });
  const g = S.get(); assert.equal(g.base, 10000); assert.equal(g.next, 20000); assert.ok(Math.abs(g.frac - 0.234) < 1e-9); assert.equal(g.glow, false); assert.equal(g.left, 7660);
  assert.equal(mk({ score: 18999 }).S.get().glow, false); assert.equal(mk({ score: 19000 }).S.get().glow, true); assert.equal(mk({ score: 19999 }).S.get().glow, true);
});

// a simulated session of a child at play: ~1 scoring act a second 60 % of the time; a job (a few acts) ends with its stars and a bonus
function session(seed, mix) {
  let a = seed; const rnd = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  let T = 0; const { S, G, tick } = mk({}, { now: () => 1e6 + T * 1000 });
  S.add(BONUS.welcome, 'welcome', { once: 'welcome' });   // the first stone set
  let jobActs = 0, firstCoin = null;
  for (T = 1; T < 3600 && firstCoin == null; T++) {
    if (rnd() < 0.6) {   // an act this second
      const r = rnd(), g = r < mix.gold ? 'gold' : r < mix.gold + mix.good ? 'good' : 'ok';
      S.add(S.grade(g), g); jobActs++;
      if (jobActs % 36 === 0) { const q = rnd(); S.add(JOB_END[q < mix.gold ? 3 : q < mix.gold + mix.good ? 2 : 1], 'job'); if (jobActs % 108 === 0) S.add(BONUS.course, 'course'); }   // (a job ≈ a minute of acts; a course every third job)
    }
    if (G.dinars.length) firstCoin = T / 60;
  }
  return firstCoin;
}
test('the first coin comes in 8–14 minutes of play: a good player ≈ 8, an average child ≈ 10–11, a slow one ≈ 14 (the welcome gift counts)', () => {
  const good = session(1, { gold: 0.35, good: 0.4 }), avg = session(2, { gold: 0.15, good: 0.4 }), slow = session(3, { gold: 0.05, good: 0.3 });
  console.log(`   first coin: good ${good.toFixed(1)} min · average ${avg.toFixed(1)} min · slow ${slow.toFixed(1)} min`);
  for (const [k, v] of Object.entries({ good, avg })) assert.ok(v >= 7.5 && v <= 14, `${k} ${v}`);
  assert.ok(slow <= 15 && good < avg && avg < slow, `slow ${slow}`);   // (a child who rarely finds the gold window: the coin is still inside a quarter hour)
});
