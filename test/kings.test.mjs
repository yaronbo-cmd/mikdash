// KINGS — the pure rules (node --test test/kings.test.mjs): deals, costs, etas, offline settle, determinism, unlocks.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as K from '../src/kings/logic.js';
import { PARTNERS, OFFERS, LETTERS, SEALS } from '../src/kings/data.js';
import * as D from '../src/kings/data.js';

const MIN = 60000, H = 60 * MIN;
const T0 = Date.UTC(2026, 8, 27, 9, 0, 0);
const fresh = (res = { silver: 500 }, extra = {}) => ({ res: { ...res }, ...extra });
const offer = (G, pid, id, now = T0, o) => K.offers(G, pid, now, o).find((x) => x.id === id);

test('ensure: guarded defaults, repairs a broken slot, keeps good voyages', () => {
  const G = {};
  const k = K.ensure(G);
  assert.equal(k.v, 1); assert.deepEqual(k.voy, []); assert.deepEqual(k.rel, {});
  const G2 = { kings: { rel: 'x', voy: [null, { id: 'v1', o: 'tyre_raft', legs: [['sea', 'tyre', 0, 1, 10]], end: 1, t0: 0, p: 'tyre', gives: {} }, { id: 'v2', o: 'nope', legs: [] }], n: 'bad' } };
  const k2 = K.ensure(G2);
  assert.deepEqual(k2.rel, {}); assert.equal(k2.voy.length, 1); assert.equal(k2.n, 1, 'the next id never reuses v1');
  assert.equal(K.ensure(null), null);
  assert.deepEqual(K.settle(null, T0), []);
  assert.equal(K.status(undefined, T0).badge, 0);
});

test('partners: five sourced courts; gates follow BUILD\'s stages; no building state = all open', () => {
  const G = fresh();
  const ps = K.partners(G, T0);
  assert.deepEqual(ps.map((p) => p.id), ['tyre', 'rome', 'adiabene', 'nikanor', 'petra']);
  assert.ok(ps.every((p) => p.status === 'ready'));
  const B = fresh({ silver: 500 }, { st: { har: { ph: 'courses' } } });
  const pb = Object.fromEntries(K.partners(B, T0).map((p) => [p.id, p]));
  assert.equal(pb.nikanor.status, 'locked'); assert.equal(pb.nikanor.why.gate, 'nikanor');
  assert.equal(pb.adiabene.status, 'locked'); assert.equal(pb.adiabene.why.gate, 'har');
  B.st.har = { done: true }; B.st.wall = { done: true }; B.st.nashim = { done: true };
  const pc = Object.fromEntries(K.partners(B, T0).map((p) => [p.id, p]));
  assert.equal(pc.nikanor.status, 'ready'); assert.equal(pc.adiabene.status, 'ready');
  for (const p of PARTNERS) { assert.ok(p.facts.length >= 2, p.id + ' facts'); assert.ok(p.facts.every((f) => f.ref), p.id + ' refs'); assert.ok(p.lines.length >= 2 && p.lines.length <= 4); }
});

test('offers: a first taste, real trade-offs (fast costs more, big takes longer)', () => {
  const G = fresh();
  const o = Object.fromEntries(K.offers(G, 'tyre', T0).map((x) => [x.id, x]));
  assert.ok(o.tyre_taste.ok); assert.equal(o.tyre_taste.ms, 3 * MIN);
  assert.ok(o.tyre_fast.cost > o.tyre_raft.cost && o.tyre_fast.ms < o.tyre_raft.ms);
  assert.equal(o.tyre_fast.gives.cedar, o.tyre_raft.gives.cedar);
  assert.equal(o.tyre_bulk.why, 'locked'); assert.equal(o.tyre_bulk.need.lvl, 1);
  assert.ok(o.tyre_bulk.gives.cedar / o.tyre_bulk.cost > o.tyre_raft.gives.cedar / o.tyre_raft.cost, 'bulk is cheaper per unit');
  assert.ok(o.tyre_bulk.ms > o.tyre_raft.ms, 'bulk takes longer');
  const poor = fresh({ silver: 10 });
  const r = offer(poor, 'tyre', 'tyre_raft');
  assert.equal(r.why, 'lack'); assert.equal(r.lack.silver, 5);
  const needs = offer(G, 'tyre', 'tyre_raft', T0, { needs: { cedar: 40 } });
  assert.equal(needs.now, true);
});

test('accept: pays through apply, sets out, one voyage per court; a refused apply = lack', () => {
  const G = fresh();
  const seen = [];
  const r = K.accept(G, 'tyre_raft', T0, { apply: (d) => { seen.push(d); return K.applyRes(G, d); } });
  assert.ok(r.ok); assert.equal(r.cost, 15); assert.equal(r.eta, T0 + 45 * MIN);
  assert.deepEqual(seen, [{ silver: -15 }]); assert.equal(G.res.silver, 485);
  assert.equal(offer(G, 'tyre', 'tyre_fast').why, 'busy');
  assert.equal(K.accept(G, 'tyre_fast', T0).why, 'busy');
  const G2 = fresh();
  const no = K.accept(G2, 'tyre_raft', T0, { apply: () => false });
  assert.equal(no.ok, false); assert.equal(no.why, 'lack'); assert.equal(K.ensure(G2).voy.length, 0);
  assert.equal(K.accept(G2, 'nope', T0).why, 'unknown');
  const st = K.status(G, T0 + MIN);
  assert.equal(st.sea, 1); assert.equal(st.badge, 0);
});

test('settle: offline arrivals are due once; unload fills the meter; nothing is lost', () => {
  const G = fresh();
  K.accept(G, 'tyre_taste', T0);
  assert.deepEqual(K.settle(G, T0 + 2 * MIN), []);
  assert.equal(K.phase(K.ensure(G).voy[0], T0 + MIN).kind, 'sea');
  assert.equal(K.phase(K.ensure(G).voy[0], T0 + 2.5 * MIN).kind, 'cart');
  const later = T0 + 10 * H;            // the player was away for ten hours
  const due = K.settle(G, later);
  assert.equal(due.length, 1); assert.deepEqual(due[0].res, { cedar: 60 }); assert.equal(due[0].at, T0 + 3 * MIN);
  assert.deepEqual(K.settle(G, later + H), [], 'idempotent');
  assert.equal(K.status(G, later).arrived, 1); assert.equal(K.status(G, later).badge, 1);
  assert.equal(K.partners(G, later)[0].status, 'arrived');
  const u = K.unload(G, due[0].id, later);
  assert.ok(u.ok); assert.equal(G.res.cedar, 60); assert.equal(u.seal, 'tyre'); assert.equal(u.rel.pts, 1);
  assert.equal(K.unload(G, due[0].id, later).why, 'unknown', 'unloaded once');
  assert.equal(offer(G, 'tyre', 'tyre_taste'), undefined, 'the taste is gone after the first deal');
  const early = fresh(); const a = K.accept(early, 'tyre_raft', T0);
  assert.equal(K.unload(early, a.voyage.id, T0 + MIN).why, 'sea');
});

test('relationship: points per cargo, levels unlock better offers, a discount and faster ships', () => {
  const G = fresh({ silver: 5000 });
  let t = T0;
  const run = (id) => { const r = K.accept(G, id, t); assert.ok(r.ok, id + ' ' + r.why); t = r.eta; K.settle(G, t); const u = K.unload(G, r.voyage.id, t); assert.ok(u.ok); return u; };
  run('tyre_taste');
  const u2 = run('tyre_raft');
  assert.equal(u2.rel.lvl, 1); assert.equal(u2.rel.up, true);
  assert.ok(offer(G, 'tyre', 'tyre_bulk', t).ok);
  for (let i = 0; i < 3; i++) run('tyre_raft');
  assert.equal(K.relOf(G, 'tyre').lvl, 2);
  assert.equal(offer(G, 'tyre', 'tyre_raft', t).cost, Math.round(15 * 0.85));
  for (let i = 0; i < 9; i++) run('tyre_fast');
  assert.equal(K.relOf(G, 'tyre').lvl, 4);
  assert.equal(offer(G, 'tyre', 'tyre_raft', t).ms, Math.round(45 * MIN * 0.75));
});

test('Rome: the embassy is a one-time investment; the treaty replaces the market with cheap copper; Agrippa visits', () => {
  const G = fresh({ silver: 1000 });
  const before = Object.fromEntries(K.offers(G, 'rome', T0).map((x) => [x.id, x]));
  assert.ok(before.rome_market.ok); assert.equal(before.rome_mines.why, 'locked'); assert.equal(before.rome_mines.need.flag, 'treaty');
  const r = K.accept(G, 'rome_embassy', T0);
  assert.ok(r.ok); assert.equal(r.cost, 120); assert.equal(r.eta, T0 + 240 * MIN);
  K.settle(G, r.eta);
  const u = K.unload(G, r.voyage.id, r.eta);
  assert.equal(u.flag, 'treaty');
  const after = Object.fromEntries(K.offers(G, 'rome', r.eta).map((x) => [x.id, x]));
  assert.equal(after.rome_market, undefined); assert.ok(after.rome_mines.ok); assert.equal(after.rome_embassy.why, 'done');
  assert.ok(after.rome_mines.gives.bronze / after.rome_mines.cost > before.rome_market.gives.bronze / before.rome_market.cost * 3);
  const m = K.accept(G, 'rome_mines', r.eta);
  K.settle(G, m.eta);
  const um = K.unload(G, m.voyage.id, m.eta);
  assert.equal(um.event, 'agrippa'); assert.ok(um.letters.includes('agrippa'));
  assert.equal(K.newsOf(G).filter((x) => x.k === 'agrippa').length, 1);
  K.seen(G); assert.equal(K.newsOf(G).length, 0);
});

test('Adiabene: gifts at building milestones, never a price, never "lack"', () => {
  const G = fresh({ silver: 0 }, { st: { har: { done: true } } });
  const o = Object.fromEntries(K.offers(G, 'adiabene', T0).map((x) => [x.id, x]));
  assert.ok(o.adi_first.ok); assert.equal(o.adi_first.cost, 0); assert.equal(o.adi_first.gift, true);
  assert.equal(o.adi_monbaz.why, 'locked'); assert.equal(o.adi_monbaz.need.gate, 'karnot');
  const r = K.accept(G, 'adi_first', T0);
  assert.ok(r.ok); assert.equal(G.res.silver, 0);
  K.settle(G, r.eta);
  const u = K.unload(G, r.voyage.id, r.eta);
  assert.equal(G.res.gold, 40); assert.equal(u.seal, 'adiabene');
  G.st.karnot = { done: true }; G.st.ulam = { done: true };
  const r2 = K.accept(G, 'adi_monbaz', r.eta); K.settle(G, r2.eta); const u2 = K.unload(G, r2.voyage.id, r2.eta);
  const r3 = K.accept(G, 'adi_helena', r2.eta); K.settle(G, r3.eta); const u3 = K.unload(G, r3.voyage.id, r3.eta);
  assert.equal(u3.item, 'lamp'); assert.ok(u3.letters.includes('helena'));
  assert.equal(offer(G, 'adiabene', 'adi_helena', r3.eta).why, 'done');
});

test('Nikanor: the storm is told in advance and always ends the same way; the doors arrive at Akko', () => {
  const G = fresh();
  const o = offer(G, 'nikanor', 'nik_doors');
  assert.ok(o.ok && o.storm); assert.equal(o.item, 'doors');
  const r = K.accept(G, 'nik_doors', T0);
  const v = r.voyage;
  const stormAt = v.ev[0].at;
  assert.equal(stormAt, T0 + Math.round(300 * MIN * 0.55));
  assert.equal(K.phase(v, stormAt).kind, 'sea');
  assert.equal(K.phase(v, stormAt).path, 'alex');
  K.settle(G, stormAt - 1); assert.equal(K.ensure(G).letters.storm, undefined);
  K.settle(G, stormAt); assert.equal(K.ensure(G).letters.storm, stormAt);
  assert.equal(r.eta, T0 + 300 * MIN, 'the storm costs no time: the sea calmed at once');
  assert.equal(K.phase(v, T0 + 0.8 * 300 * MIN).path, 'akko');
  K.settle(G, r.eta);
  const u = K.unload(G, v.id, r.eta);
  assert.equal(u.item, 'doors'); assert.equal(G.res.bronze, 150); assert.ok(K.ensure(G).letters.akko);
  assert.equal(offer(G, 'nikanor', 'nik_doors', r.eta).why, 'done');
});

test('Petra: a caravan of two road legs through the desert (no wait, no extra fee); the bigger one at level 1', () => {
  const G = fresh({ silver: 2000 });
  const o = offer(G, 'petra', 'petra_small');
  assert.equal(o.ms, 120 * MIN); assert.ok(o.illus);
  const r = K.accept(G, 'petra_small', T0);
  assert.deepEqual(r.voyage.legs.map((l) => l[0]), ['road', 'road']);
  assert.equal(r.eta, T0 + 120 * MIN);
  assert.equal(offer(G, 'petra', 'petra_big', T0).why, 'locked');
});

test('Shabbat: no new deals or unloading; ships keep sailing; nothing lost', () => {
  const G = fresh();
  const r = K.accept(G, 'tyre_raft', T0);
  const rest = { rest: (t) => t >= T0 + 10 * MIN };
  assert.equal(offer(G, 'rome', 'rome_market', T0 + 20 * MIN, rest).why, 'rest');
  assert.equal(K.accept(G, 'rome_market', T0 + 20 * MIN, rest).why, 'rest');
  assert.equal(K.settle(G, r.eta).length, 1, 'it still arrives');
  assert.equal(K.unload(G, r.voyage.id, r.eta, rest).why, 'rest');
  assert.ok(K.unload(G, r.voyage.id, r.eta + 30 * H).ok, 'after Shabbat it is all there');
  assert.equal(G.res.cedar, 80);
});

test('demo ×60, tune, and determinism', () => {
  const D1 = fresh({ silver: 500 }, { demo: true });
  assert.equal(K.accept(D1, 'tyre_raft', T0).eta, T0 + 45 * MIN / 60);
  const t = K.tune({ cost: 2, yield: 0.5, time: 1 });
  assert.equal(t.cost, 2);
  const G = fresh(); const x = offer(G, 'tyre', 'tyre_raft'); assert.equal(x.cost, 30); assert.equal(x.gives.cedar, 40);
  K.tune({ cost: 1, yield: 1, time: 1 });
  const play = () => {
    const G = fresh({ silver: 900 }, { st: { har: { done: true } } }); let t = T0;
    for (const id of ['tyre_taste', 'rome_embassy', 'petra_small', 'adi_first']) K.accept(G, id, t += 7 * MIN);
    K.settle(G, t + 3 * H); K.unloadAll(G, t + 9 * H);
    K.accept(G, 'rome_mines', t + 9 * H); K.settle(G, t + 20 * H); K.unloadAll(G, t + 20 * H);
    return JSON.stringify(G);
  };
  assert.equal(play(), play());
});

test('content rules: every letter has a sender, seals for all courts, no Divine Name anywhere', () => {
  for (const L of LETTERS) { assert.ok(L.from && L.t && L.p, L.id); assert.ok(L.lvl || L.ev, L.id + ' earnable'); }
  for (const p of PARTNERS) assert.ok(SEALS[p.id], p.id);
  for (const o of OFFERS) { assert.ok(o.n && o.d, o.id); if (o.gift) assert.equal(o.cost, 0); }
  const all = JSON.stringify(D);
  const nm = (...c) => String.fromCharCode(...c);   // the Names are never written, not even here
  const banned = [nm(0x5D9, 0x5D4, 0x5D5, 0x5D4), nm(0x5D0, 0x5DC, 0x5D4, 0x5D9, 0x5DD), nm(0x5D0, 0x5DC, 0x5D5, 0x5D4, 0x5D9, 0x5DD), nm(0x5D0, 0x5D3, 0x5E0, 0x5D9) + ' '];
  for (const b of banned) assert.equal(all.includes(b), false, 'a Divine Name in data.js');
  assert.equal(/Math\.random/.test(String(K.accept) + String(K.settle) + String(K.unload)), false);
});

test('now may be a clock function (BUILD passes its now)', () => {
  const G = fresh();
  const r = K.accept(G, 'tyre_taste', () => T0);
  assert.equal(r.eta, T0 + 3 * MIN);
  assert.equal(K.status(G, () => T0 + MIN).sea, 1);
  assert.equal(K.settle(G, () => T0 + 4 * MIN).length, 1);
  assert.equal(K.status(G, () => T0 + 4 * MIN).badge, 1);
  assert.ok(K.unloadAll(G, () => T0 + 4 * MIN)[0].ok);
});

test('a new player: the Tyre taste flagged on its court, once', () => {
  const G = fresh();
  assert.equal(K.partners(G, T0)[0].taste, true);
  K.accept(G, 'tyre_taste', T0);
  assert.equal(K.partners(G, T0)[0].taste, false);
});

test('gates read BUILD v6 (G.st[id] exists once a stage is started; {done:true} when finished)', () => {
  const G = fresh({ silver: 100 }, { st: { har: { p: 'courses', set: 3 } } });
  assert.equal(offer(G, 'nikanor', 'nik_doors').why, 'locked');
  G.st.nikanor = { p: 'survey' };
  assert.ok(offer(G, 'nikanor', 'nik_doors').ok, 'the Nikanor gate is being built: the doors can be ordered');
  delete G.st.nikanor; G.st.nashim = { done: true };
  assert.ok(offer(G, 'nikanor', 'nik_doors').ok, 'its dependency is done');
  assert.equal(offer(G, 'adiabene', 'adi_first').why, 'locked');
  G.st.har = { done: true };
  assert.ok(offer(G, 'adiabene', 'adi_first').ok);
});

test('a saved voyage survives a renamed offer (nothing that set out is lost); broken ones are dropped', () => {
  const G = fresh();
  const r = K.accept(G, 'tyre_raft', T0);
  G.kings.voy[0].o = 'renamed_in_a_later_version';
  G.kings.voy.push({ id: 'vx', p: 'nowhere', o: 'tyre_raft', legs: [['sea', 'tyre', 0, 1, 1]], gives: {}, t0: 0, end: 1 });
  K.ensure(G);
  assert.equal(G.kings.voy.length, 1);
  K.settle(G, r.eta);
  const u = K.unload(G, r.voyage.id, r.eta);
  assert.ok(u.ok); assert.equal(G.res.cedar, 80);
});

test('bestFor: an open offer for a shortage (BUILD\'s chip) — one that covers the need first, then the soonest; null when none can help', () => {
  const G = fresh({ silver: 500 });
  assert.equal(K.bestFor(G, 'cedar', 100, T0).id, 'tyre_taste');
  assert.equal(K.bestFor(G, 'cedar', 70, T0).id, 'tyre_fast');
  assert.equal(K.bestFor(G, 'gold', 0, T0).id, 'adi_first', 'a gift before a purchase');
  K.accept(G, 'tyre_taste', T0);
  assert.equal(K.bestFor(G, 'cedar', 10, T0), null);
  assert.equal(K.bestFor(G, 'stone', 1, T0), null);
});

test('(wave 7, FUN) a messenger waits: the story badge after the first course, until told or a deal', async () => {
  const K = await import('../src/kings/logic.js');
  const G = { res: { silver: 200 } };
  const t = new Date('2026-10-06T10:00:00+03:00').getTime();
  assert.equal(K.status(G, t).story, 0, 'not in the first minutes');
  G.fun = { stats: { courses: 1 } };
  assert.equal(K.status(G, t).story, 1);
  assert.equal(K.status(G, t).badge, 1);
  G.kings.story = 1;
  assert.equal(K.status(G, t).badge, 0, 'told once');
});
