// Tests for src/avodah/state.js (Phase B rules). Run: node --test test/avodah-state.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../src/avodah/state.js';

const mem = (init = {}) => { const m = { ...init }; return { get: (k) => (k in m ? m[k] : null), set: (k, v) => { m[k] = v; return true; }, remove: (k) => { delete m[k]; }, m }; };
const T0 = Date.parse('2026-09-25T20:00:00+03:00');
const plus = (key, n) => new Date(Date.parse(key + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10);

test('fresh save: v1, a player id, empty book, not new to the ketoret', () => {
  const A = S.fresh(T0);
  assert.equal(A.v, 1);
  assert.match(A.pid, /^p[0-9a-z]+$/);
  assert.deepEqual(A.book, {});
  assert.equal(A.ketoret.done, false);
  assert.equal(S.hasPlayer(A), false);
});

test('load/save round trip under the key bh_avodah; a broken save starts fresh', () => {
  const st = mem();
  const { A, isNew } = S.load(st, T0);
  assert.equal(isNew, true);
  A.name = 'אהרן'; A.mishmar = 5; A.points = 42;
  S.save(A, st, T0 + 1000);
  assert.ok(st.m.bh_avodah);
  const r = S.load(st, T0 + 2000);
  assert.equal(r.isNew, false);
  assert.equal(r.A.name, 'אהרן'); assert.equal(r.A.mishmar, 5); assert.equal(r.A.points, 42); assert.equal(r.A.pid, A.pid);
  const bad = mem({ bh_avodah: '{not json' });
  assert.equal(S.load(bad, T0).isNew, true);
  const arr = mem({ bh_avodah: '[1,2]' });
  assert.equal(S.load(arr, T0).isNew, true);
});

test('migrate: a v0 save without version keeps its fields and gains the new ones', () => {
  const A = S.migrate({ name: 'x'.repeat(40), mishmar: 99, points: -5, book: [], ketoret: { done: true } }, T0);
  assert.equal(A.v, 1);
  assert.equal(A.name.length, 24);
  assert.equal(A.mishmar, 24);
  assert.equal(A.points, 0);
  assert.deepEqual(A.book, {});
  assert.equal(A.ketoret.done, true);
  assert.equal(A.ketoret.tries, 0);
});

test('Phase A save is read-only: name and mishmar adopted, bh_beta2 never written', () => {
  const st = mem({ bh_beta2: JSON.stringify({ v: 5, name: 'פנחס', mishmar: 7, priests: 12 }) });
  const before = st.m.bh_beta2;
  const a = S.readPhaseA(st);
  assert.deepEqual(a, { name: 'פנחס', mishmar: 7, priests: 12 });
  const { A } = S.load(st, T0);
  assert.equal(S.adoptPhaseA(A, a), true);
  assert.equal(A.name, 'פנחס'); assert.equal(A.mishmar, 7); assert.equal(A.fromA, true);
  S.save(A, st, T0);
  assert.equal(st.m.bh_beta2, before);
  assert.equal(S.readPhaseA(mem({ bh_beta2: 'garbage' })), null);
  assert.equal(S.readPhaseA(mem({ bh_beta2: JSON.stringify({ v: 5, name: '', mishmar: 0 }) })), null);
  // (wave 12, N69) the Phase A name wins over an older Phase B pick; a Phase B mishmar stays; nothing new → false
  const B = { name: 'אלעזר', mishmar: 3, fromA: false };
  assert.equal(S.adoptPhaseA(B, { name: 'פנחס', mishmar: 7 }), true);
  assert.equal(B.name, 'פנחס'); assert.equal(B.mishmar, 3);
  assert.equal(S.adoptPhaseA(B, { name: 'פנחס', mishmar: 7 }), false);
  assert.equal(S.adoptPhaseA(B, { name: '', mishmar: 9 }), false, 'an empty Phase A name never erases his name');
});

test('second lottery: 13 consecutive days give all 13 roles; the order differs between players', () => {
  const A = S.fresh(T0, 'pAlpha'), B = S.fresh(T0, 'pBeta');
  const seen = new Set(), days = [];
  for (let i = 0; i < 13; i++) { const d = plus('2026-09-25', i); seen.add(S.lotsFor(A, d).role); days.push(S.lotsFor(B, d).role); }
  assert.equal(seen.size, 13);
  assert.equal(new Set(days).size, 13);
  const a13 = []; for (let i = 0; i < 13; i++) a13.push(S.lotsFor(A, plus('2026-09-25', i)).role);
  assert.notDeepEqual(a13, days);
  // deterministic
  assert.deepEqual(S.lotsFor(A, '2026-09-25'), S.lotsFor(A, '2026-09-25'));
});

test('first lottery (terumat hadeshen) is won on roughly one day in four', () => {
  const A = S.fresh(T0, 'pGamma');
  let wins = 0;
  for (let i = 0; i < 400; i++) if (S.lotsFor(A, plus('2026-01-01', i)).deshen) wins++;
  assert.ok(wins > 60 && wins < 140, `wins ${wins}/400`);
});

test('"חדשים לקטורת": a new kohen surely wins within three tries; after offering it, never again', () => {
  for (const pid of ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']) {
    const A = S.fresh(T0, pid);
    let day = '2026-09-25', won = false;
    for (let k = 0; k < 3 && !won; k++) {
      const lots = S.drawLots(A, day);
      assert.notEqual(lots.ketoret, null);
      if (lots.ketoret) won = true; else S.ketoretTry(A, day);
      day = plus(day, 1);
    }
    assert.ok(won, `${pid} did not win the ketoret within 3 tries`);
    assert.equal(S.ketoretDone(A, day, T0), true);
    assert.equal(S.ketoretDone(A, day, T0), false);
    assert.equal(S.lotsFor(A, plus(day, 1)).ketoret, null);
    assert.ok(A.collect.ketoret);
  }
});

test('ketoretTry counts once per day', () => {
  const A = S.fresh(T0, 'pDelta');
  S.ketoretTry(A, '2026-09-25'); S.ketoretTry(A, '2026-09-25');
  assert.equal(A.ketoret.tries, 1);
  S.ketoretTry(A, '2026-09-26');
  assert.equal(A.ketoret.tries, 2);
  assert.equal(S.lotsFor(A, '2026-09-27').ketoret, true);
});

test('drawLots is drawn once per day and kept', () => {
  const A = S.fresh(T0, 'pEps');
  const a = S.drawLots(A, '2026-09-25');
  A.lots.role = 'yayin';
  assert.equal(S.drawLots(A, '2026-09-25').role, 'yayin');
  assert.equal(S.drawLots(A, '2026-09-26').day, '2026-09-26');
  assert.ok(a);
});

test('learn: the book fills, points add up, a role done for real is counted', () => {
  const A = S.fresh(T0);
  const r1 = S.learn(A, 'deshen', ['terumat_hadeshen'], { live: true, forReal: true, role: 'deshen', now: T0 });
  assert.deepEqual(r1.newSteps, ['terumat_hadeshen']);
  assert.equal(r1.points, S.POINTS.game + S.POINTS.newStep + S.POINTS.live + S.POINTS.forReal);
  const r2 = S.learn(A, 'deshen', ['terumat_hadeshen'], { now: T0 });
  assert.deepEqual(r2.newSteps, []);
  assert.equal(A.book.terumat_hadeshen.n, 2);
  assert.equal(A.book.terumat_hadeshen.live, true);
  assert.equal(A.games.deshen.n, 2);
  S.learn(A, 'zerika', ['shechita', 'blood'], { forReal: true, role: 'zorek' });
  assert.equal(S.rolesCount(A), 2);
  assert.equal(S.bookCount(A), 3);
});

test('rank ladder: 15 ממונים, thresholds ascending', () => {
  assert.equal(S.RANKS.length, 15);
  for (let i = 1; i < S.RANKS.length; i++) assert.ok(S.RANKS[i] > S.RANKS[i - 1]);
  assert.deepEqual(S.rankOf(0), { rank: 0, next: 20, prev: 0 });
  assert.equal(S.rankOf(20).rank, 1);
  assert.equal(S.rankOf(119).rank, 2);
  assert.equal(S.rankOf(99999).rank, 15);
  assert.equal(S.rankOf(99999).next, null);
});

test('streak: grows day by day; Shabbat and Yom Tov never break it; a weekday gap resets it', () => {
  const rest = new Set(['2026-09-26']);         // Shabbat, Sukkot I
  const isRest = (k) => rest.has(k);
  const A = S.fresh(T0);
  assert.equal(S.touchStreak(A, '2026-09-24', isRest).n, 1);
  assert.equal(S.touchStreak(A, '2026-09-24', isRest).grew, false);
  assert.equal(S.touchStreak(A, '2026-09-25', isRest).n, 2);
  // skipped Shabbat 26.9 → 27.9 still continues
  const r = S.touchStreak(A, '2026-09-27', isRest);
  assert.equal(r.n, 3); assert.equal(r.reset, false);
  // skipped a weekday (28.9) → reset
  const r2 = S.touchStreak(A, '2026-09-29', isRest);
  assert.equal(r2.n, 1); assert.equal(r2.reset, true);
  assert.equal(A.streak.best, 3);
});

test('live marks: once per segment per day; old days are pruned on save', () => {
  const A = S.fresh(T0), st = mem();
  assert.equal(S.markLive(A, '2026-09-25', 'shachar'), true);
  assert.equal(S.markLive(A, '2026-09-25', 'shachar'), false);
  for (let i = 0; i < 50; i++) S.markLive(A, plus('2026-01-01', i), 'erev');
  S.save(A, st, T0);
  assert.ok(Object.keys(A.live).length <= 40);
});

test('hash and rng are deterministic', () => {
  assert.equal(S.hash('abc'), S.hash('abc'));
  assert.notEqual(S.hash('abc'), S.hash('abd'));
  const a = S.rng(7), b = S.rng(7);
  for (let i = 0; i < 5; i++) assert.equal(a(), b());
});
