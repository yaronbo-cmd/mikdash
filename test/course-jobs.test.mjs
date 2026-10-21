// FUN14 (wave 14): the course loop (src/game/jobs.js). Run: node --test test/course-jobs.test.mjs
// J per stage; the deal's rules over 1,000 deals; the shares set the course (the crews' stones count in); an empty stock deals
// the quarry; the stars and the levels; the registry's sources (a ref or המחשה on every card).
import test from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../src/game/state.js';
import * as JB from '../src/game/jobs.js';
import { STAGES, PROJ, DECKS, keyOf } from '../src/game/content.js';

const T0 = Date.UTC(2026, 9, 1, 9, 0, 0);
const BASE = ['crane', 'dress', 'quarry', 'whole', 'plumb'];
const ALL = [...BASE, 'snap', 'place', 'course', 'saw', 'cover', 'pull', 'tread', 'draw', 'wheel', 'rafts', 'pipes'];
const hasOf = (list) => (g) => list.includes(g);
/** a stage in its courses at stone `set` (the survey and the dig done, segments paid ahead) */
function atCourses(id, set = 0, o = {}) {
  const G = S.fresh(T0);
  G.ftue = 99;
  for (const s of STAGES) { if (s.id === id) break; G.st[s.id] = { done: true }; }
  G.st[id] = { p: 'courses', n: S.siteStones(id), dp: 1, paid: o.paid != null ? o.paid : 9999, set, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: set, insp: 0, w: 0, ph: 1 };
  for (let i = 0; i < set; i++) if (keyOf(id, i)) G.st[id].keys[i] = 0.9;
  for (const k of Object.keys(G.res)) G.res[k] = o.res != null ? o.res : 1e6;
  return G;
}

test('J per stage: clamp(round(10 / C), 1, 3), at most the deck', () => {
  const want = { har: 2, wall: 1, gates: 2, nashim: 2, sorag: 3, nikanor: 2, lishka: 2, yesod: 3, sovev: 3, guf: 3, karnot: 3, kiyor: 3, ulam: 1, heichal: 1, kodesh: 1 };
  for (const [id, j] of Object.entries(want)) assert.equal(JB.J(atCourses(id), id, hasOf(ALL)), j, id);
  // with only today's games the decks are smaller: the kiyor's is its key stone alone, the sorag's two cards
  assert.equal(JB.J(atCourses('kiyor'), 'kiyor', hasOf(BASE)), 1);
  assert.equal(JB.J(atCourses('sorag'), 'sorag', hasOf(BASE)), 2);
  // about ten jobs a stage (D1): J × C over the fifteen stages
  const per = STAGES.map((s) => JB.J(atCourses(s.id), s.id, hasOf(ALL)) * PROJ[s.id].C);
  assert.ok(per.every((n) => n >= 3 && n <= 14), per.join(','));
});

test('the deal: 1,000 deals keep its rules (D1)', () => {
  const has = hasOf(ALL);
  let n = 0, sigLate = 0, keys = 0;
  for (const s of STAGES) {
    const id = s.id, P = PROJ[id];
    for (let run = 0; run < 8; run++) {
      const G = atCourses(id, 0);
      JB.jobsOf(G).cur = {};
      let lastC = -1, keyThisCourse = 0, dealsHere = 0, sigSeen = false;
      for (let t = 0; t < 400 && G.st[id].p === 'courses'; t++) {
        const c = JB.courseOf(G, id);
        if (c !== lastC) { lastC = c; keyThisCourse = 0; }
        const d = JB.dealNow(G, id, has, run === 1 && t % 3 === 1 ? { re: true } : {});
        if (d.quarry) break;
        if (!d.cards.length) break;
        n++; dealsHere++;
        const [a, b] = d.cards;
        assert.ok(d.cards.length <= 2, 'two cards at most');
        if (b) assert.notEqual(a, b, 'two different cards');
        const last = JB.jobsOf(G).last[id];
        for (const j of d.cards) if (j !== 'key' && d.cards.length > 1 && JB.deckOf(G, id, has).stone.length + JB.deckOf(G, id, has).craft.length > 2) assert.notEqual(j, last, `never the job just played (${id} ${d.cards})`);
        if (b) {
          const ka = JB.JOBS[a].kind, kb = JB.JOBS[b].kind;
          const fams = JB.JOBS[a].family !== JB.JOBS[b].family;
          assert.ok((ka !== kb) || fams, `one stone and one craft, or two gesture families (${id}: ${a}, ${b})`);
        }
        if (d.cards.includes('key')) { keys++; keyThisCourse++; assert.ok(keyThisCourse <= 1, `at most one key stone a course (${id} c${c})`); }
        if (DECKS[id].sig && d.cards.includes(DECKS[id].sig)) sigSeen = true;
        if (dealsHere === 2 && DECKS[id].sig && JB.dealable(G, id, DECKS[id].sig, has) && !sigSeen) sigLate++;
        // play the first card: the share (the crews set two stones meanwhile, now and then)
        const job = d.cards[t % d.cards.length];
        if (t % 4 === 2) { for (let k = 0; k < 2 && S.jobOf(G, id).kind === 'stone'; k++) S.quickSet(G, id); }
        const s0 = G.st[id].set, upTo = s0 + JB.share(G, id, has);
        const key = job === 'key' ? d.key : null;
        const out = JB.setShare(G, id, Math.max(upTo, key ? key.i + 1 : 0), key ? { keyAt: key.i, keyR: { quality: 0.95 } } : {});
        if (key) assert.equal(G.st[id].keys[key.i], 0.95, 'the key card sets its own stone');
        JB.curOf(G, id); const cur = JB.jobsOf(G).cur[id]; if (cur && cur.c === c) cur.n++;
        JB.noteJob(G, id, job, 2, 0.8);
        JB.curOf(G, id).deal = null;
        if (S.jobOf(G, id) && S.jobOf(G, id).kind === 'check') S.courseCheck(G, id);
        assert.ok(out.ok || G.st[id].p !== 'courses', `the share set stones (${id} at ${s0})`);
      }
    }
  }
  assert.ok(n >= 1000, `${n} deals`);
  assert.equal(sigLate, 0, 'the signature by the second deal');
  assert.ok(keys > 50, `${keys} key cards`);
});

test('the shares set the course: J jobs close it, the crews\' stones count in, every key stone is set', () => {
  for (const id of ['har', 'wall', 'gates', 'yesod', 'heichal']) {
    const has = hasOf(ALL), G = atCourses(id, 0), P = PROJ[id], Jn = JB.J(G, id, has);
    const played = () => { const c = JB.courseOf(G, id); return () => { JB.curOf(G, id); const cur = JB.jobsOf(G).cur[id]; if (cur && cur.c === c) cur.n++; }; };
    for (let k = 0; k < Jn; k++) {
      const upTo = G.st[id].set + JB.share(G, id, has), done = played();
      JB.setShare(G, id, upTo); done();
    }
    assert.equal(G.st[id].set, P.P, `${id}: ${Jn} jobs set one course`);
    for (let i = 0; i < P.P; i++) if (keyOf(id, i)) assert.ok(G.st[id].keys[i] != null, `${id}: key stone ${i} set (the crane's 0.8)`);
    // the crews set 5 stones of the next course before the first job: the shares shrink, the course still closes in J jobs
    if (S.jobOf(G, id).kind === 'check') S.courseCheck(G, id);
    JB.setShare(G, id, P.P + 1);                        // (the course's first stone: its key, set by the crane)
    for (let k = 0; k < 4 && S.jobOf(G, id).kind === 'stone'; k++) S.quickSet(G, id);
    const before = JB.share(G, id, has);
    assert.ok(before <= Math.ceil((P.P - 5) / Jn), `${id}: the crews' stones count in (${before})`);
    for (let k = 0; k < Jn; k++) { const done = played(); JB.setShare(G, id, G.st[id].set + JB.share(G, id, has)); done(); }
    assert.equal(G.st[id].set, 2 * P.P, `${id}: the second course closes too`);
  }
});

test('the materials (flow16, the balance): an empty stock still deals his cards, plus "▶ הביאו אבנים"; the meter pays a segment on the way', () => {
  const has = hasOf(ALL);
  const G = atCourses('wall', 0, { paid: 0, res: 0 });
  assert.equal(JB.stockOf(G, 'wall'), 0);
  const d = JB.dealNow(G, 'wall', has);
  assert.ok(d.quarry && d.cards.length >= 1, 'stock 0, nothing to pay with → his cards and the extra card');
  assert.ok(JB.crewsNeed(G, 'wall', has) >= 5 && JB.crewsNeed(G, 'wall', has) % 5 === 0, 'the extra card counts what the crews need, by fives');
  // in the first-time flow the board is still the lesson: the quarry alone
  const F = atCourses('wall', 0, { paid: 0, res: 0 }); F.ftue = 5;
  const df = JB.dealNow(F, 'wall', has);
  assert.ok(df.quarry && !df.cards.length, 'ftue: stock 0 → "▶ הביאו אבנים" alone');
  // the board brought stone: the cards stay (only the extra card goes), and the share pays the segments as it goes
  G.res.stone = 200;
  assert.ok(JB.stockOf(G, 'wall') > 0);
  const d2 = JB.dealNow(G, 'wall', has);
  assert.ok(!d2.quarry && d2.cards.join() === d.cards.join(), 'the cards stay under her finger; the extra card goes');
  const out = JB.setShare(G, 'wall', 32);
  assert.ok(out.paid > 0 && G.st.wall.set > 8, `${out.paid} stones paid on the way, ${G.st.wall.set} set`);
  // the stock runs out mid-course: the crews' share stops at the unpaid segment, nothing is lost — but his own hands go on
  const G2 = atCourses('wall', 0, { paid: 8, res: 0 });
  const o2 = JB.setShare(G2, 'wall', 32);
  assert.equal(G2.st.wall.set, 8); assert.equal(o2.blocked, 'pay');
  const o3 = JB.setShare(G2, 'wall', 20, { hands: true });
  assert.equal(G2.st.wall.set, 8 + JB.HAND_MAX); assert.equal(o3.hand, JB.HAND_MAX, 'his stones, dressed by hand, paid nothing — at most HAND_MAX a job'); assert.equal(o3.blocked, 'pay'); assert.equal(G2.res.stone, 0); assert.equal(G2.st.wall.paid, 8 + JB.HAND_MAX);
});

test('stars, coins and levels (D2): ★ done, ★★ q ≥ .7, ★★★ q ≥ .9; three ★★★ raise a job', () => {
  assert.equal(JB.starsOf(0), 1); assert.equal(JB.starsOf(0.69), 1); assert.equal(JB.starsOf(0.7), 2); assert.equal(JB.starsOf(0.9), 3); assert.equal(JB.starsOf(1, true), 0);
  assert.equal(JB.coinsFor(3, 1), 9); assert.equal(JB.coinsFor(2, 3), 10); assert.equal(JB.coinsFor(0, 1, true), 3);
  const G = atCourses('har', 0);
  assert.equal(JB.levelOf(G, 'strike'), 1);
  JB.noteJob(G, 'har', 'strike', 3, 0.95); JB.noteJob(G, 'har', 'strike', 3, 0.95);
  assert.equal(JB.noteJob(G, 'har', 'strike', 3, 0.95).up, 2);
  assert.equal(JB.levelOf(G, 'strike'), 2);
  JB.noteJob(G, 'har', 'strike', 2, 0.8);
  assert.equal(JB.jobsOf(G).s3.strike, 0, 'a ★★ breaks the run');
  // the save keeps G.jobs
  const mem = { m: {}, get(k) { return this.m[k] ?? null; }, set(k, v) { this.m[k] = String(v); return true; } };
  S.save(G, mem); const L = S.load(mem);
  assert.equal(JB.levelOf(L.G, 'strike'), 2);
  assert.equal(JB.playsAt(L.G, 'har', 'strike'), 4);
});

test('the registry: every card has its source (a ref or המחשה); every deck job is registered', () => {
  for (const [id, R] of Object.entries(JB.JOBS)) {
    if (id === 'key') continue;
    assert.ok(R.src && R.src.ref, `${id} has a ref`);
    assert.ok(['stone', 'craft'].includes(R.kind), id);
  }
  for (const d of Object.values(DECKS)) for (const j of [...d.stone, ...d.craft]) assert.ok(JB.JOBS[j], j);
});

test('FUN14\'s job games: the solver ★★★ at L1 and ≥ ★★ at L3; idling ends kindly; a job ≤ 15 KB', async () => {
  const { simulate, rng } = await import('../src/game/minigames/frame.js');
  const { snap } = await import('../src/game/minigames/snap.js');
  const { place, course } = await import('../src/game/minigames/place.js');
  const { wheel } = await import('../src/game/minigames/wheel.js');
  for (const g of [snap, place, course, wheel]) {
    const l1 = simulate(g, { level: 0, rng: rng(11) }), l3 = simulate(g, { level: 2, rng: rng(12) });
    assert.ok(l1.done && JB.starsOf(l1.quality) === 3, `${g.kind} L1 ★★★ (${l1.quality.toFixed(2)})`);
    assert.ok(l3.done && JB.starsOf(l3.quality) >= 2, `${g.kind} L3 ≥ ★★ (${l3.quality.toFixed(2)})`);
    assert.ok(l1.s <= 30 && l3.s <= 40, `${g.kind} short (${l1.s.toFixed(1)} / ${l3.s.toFixed(1)} s)`);
    const idle = simulate(g, { level: 0, rng: rng(13) }, () => null, 120);
    assert.ok(idle.done, `${g.kind}: idling ends (the crew finishes)`);
    assert.ok(g.fact && g.fact.ref && g.fact.he, `${g.kind} has its sourced fact`);
  }
  // a job ≤ 15 KB in the bundle (minified, as build.mjs ships it)
  const fs = await import('node:fs'), { buildSync } = await import('esbuild');
  for (const f of ['minigames/snap', 'minigames/place', 'minigames/wheel', 'jobs']) {
    const src = fs.readFileSync(new URL(`../src/game/${f}.js`, import.meta.url), 'utf8');
    const n = buildSync({ stdin: { contents: src, loader: 'js' }, minify: true, write: false, format: 'esm', charset: 'utf8' }).outputFiles[0].contents.length;
    assert.ok(n <= 15 * 1024, `${f}.js ${n} B ≤ 15 KB`);
  }
});
