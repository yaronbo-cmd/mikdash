// NET10 — the pure rules of "כהנים יחד" (node --test test/net-session.test.mjs): codes, names, counts, the race, the room's
// presence read defensively, the partner and the open works, the spot beside me, the db's merge, and the mock's contract.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as N from '../src/net/session.js';
import { mergeDeep, connect } from '../src/net/transport.js';
import { T } from '../src/net/ui.js';

const T0 = Date.UTC(2026, 8, 28, 20, 0, 0), MIN = 60000;
const pres = (o) => ({ app: N.APP, v: N.V, code: '4821', mid: 'kaaaaaaaa', host: false, name: 'יכין', x: 10, z: 20, yaw: 0.5, site: 'har', hit: { n: 3, p: true }, st: { stones: 2, perfect: 4, strikes: 6, t0: T0 }, ...o });

test('codes: four digits, never a leading zero; device keys', () => {
  for (let i = 0; i < 200; i++) assert.ok(N.isCode(N.newCode()));
  assert.equal(N.newCode(() => 0), '1000'); assert.equal(N.newCode(() => 0.9999), '9999');
  assert.ok(!N.isCode('0123') && !N.isCode('123') && !N.isCode('12345') && !N.isCode('12a4') && !N.isCode(null));
  assert.ok(N.isCode(' 4821 '));
  assert.match(N.newMid(), /^k[0-9a-z]{8}$/);
});

test('names from another page: text only, no control or bidi characters, 18 letters at most', () => {
  assert.equal(N.cleanName('  יכין‮  בן\u0000 אהרן '), 'יכין בן אהרן');
  assert.equal(N.cleanName(null), '');
  assert.equal(Array.from(N.cleanName('א'.repeat(40))).length, 18);
});

test('counts: cleaned, the rate over the first minute is gentle, accuracy', () => {
  assert.deepEqual(N.cleanStats({ stones: -3, perfect: 'x', strikes: 2.7, t0: 0 }, T0), { stones: 0, perfect: 0, strikes: 2, t0: T0 });
  assert.equal(N.cleanStats({ perfect: 5, strikes: 2 }, T0).strikes, 5, 'strikes ≥ perfect');
  const s = { stones: 3, perfect: 6, strikes: 8, t0: T0 };
  assert.equal(N.perMin(s, T0 + 10000), 3, 'the first minute counts whole');
  assert.equal(N.perMin(s, T0 + 3 * MIN), 1);
  assert.equal(N.accuracy(s), 0.75); assert.equal(N.accuracy(N.stats0(T0)), 0);
});

test('together: the sum of the kohanim\'s own counts (no shared counter)', () => {
  assert.equal(N.together({ a: { stones: 3 }, b: { stones: 4 }, c: null, d: { stones: -2 } }), 7);
  assert.equal(N.together(null), 0);
});

test('the race: leads by accuracy and pace, small gaps are ties, gently worded (no loser)', () => {
  const me = { stones: 4, perfect: 9, strikes: 10, t0: T0 }, him = { stones: 2, perfect: 5, strikes: 10, t0: T0 };
  const r = N.race(me, him, T0 + 2 * MIN);
  assert.equal(r.q, 'me'); assert.equal(r.s, 'me');
  assert.match(N.raceLine(r, 'בועז'), /אתה מדויק וזריז/);
  const r2 = N.race(him, me, T0 + 2 * MIN);
  assert.match(N.raceLine(r2, 'בועז'), /בועז מדויק וזריז · יישר כוח לשניכם/);
  const tie = N.race({ stones: 2, perfect: 5, strikes: 10, t0: T0 }, { stones: 2, perfect: 5, strikes: 10, t0: T0 }, T0 + MIN);
  assert.equal(tie.q, 'tie'); assert.equal(tie.s, 'tie');
  assert.equal(N.race(me, null, T0).q, null);
  assert.match(N.raceLine(N.race(me, null, T0), ''), /ממתינים/);
  assert.match(N.raceLine(N.race(N.stats0(T0), N.stats0(T0), T0), ''), /כל אבן נחשבת לשניכם/);
  for (const line of [N.raceLine(r, 'x'), N.raceLine(r2, 'x'), N.raceLine(tie, 'x')]) assert.ok(!/הפסיד|מפסיד|נכשל|ניצח/.test(line), line);
});

test('presence is read defensively: only ours, cleaned; the partner is the newest other kohen with my code', () => {
  const peers = [
    { peer: 'p1', self: true, at: 5, presence: pres({ mid: 'kmeeeeeee', host: true }) },
    { peer: 'p2', self: false, at: 7, presence: pres({ name: 'בועז‮', x: 'bad', st: { stones: 1e9 * 0 + 5, perfect: 1, strikes: 1 } }) },
    { peer: 'p3', self: false, at: 9, presence: { app: 'other', code: '4821', mid: 'kx' } },
    { peer: 'p4', self: false, at: 3, presence: pres({ code: '7777', mid: 'kbbbbbbbb', host: true }) },
    { peer: 'p5', self: false, at: 1, presence: null },
  ];
  const L = N.ours(peers, T0);
  assert.equal(L.length, 3);
  const him = N.partnerOf(L, '4821', 'kmeeeeeee');
  assert.equal(him.peer, 'p2'); assert.equal(him.p.name, 'בועז'); assert.equal(him.p.x, null); assert.equal(him.p.st.stones, 5);
  assert.equal(N.partnerOf(L, '9999', 'kmeeeeeee'), null);
  // my other tab (two phones on one account): not self, another mid → a partner
  const L2 = N.ours([{ peer: 'q1', self: false, at: 1, presence: pres({ mid: 'kmeeeeeee' }) }], T0);
  assert.equal(N.partnerOf(L2, '4821', 'kmeeeeeee'), null, 'the same device key is me');
});

test('open works: hosts nobody joined yet, one per code', () => {
  const L = N.ours([
    { peer: 'a', self: false, at: 1, presence: pres({ code: '1111', mid: 'kaaaaaaa1', host: true, name: 'א' }) },
    { peer: 'b', self: false, at: 2, presence: pres({ code: '2222', mid: 'kaaaaaaa2', host: true, name: 'ב' }) },
    { peer: 'c', self: false, at: 3, presence: pres({ code: '2222', mid: 'kaaaaaaa3', host: false }) },
    { peer: 'd', self: true, at: 4, presence: pres({ code: '3333', mid: 'kmeeeeeee', host: true }) },
  ], T0);
  assert.deepEqual(N.openWorks(L, 'kmeeeeeee'), [{ code: '1111', name: 'א', peer: 'a' }]);
});

test('beside me: never inside my builder; far away he stays where he works', () => {
  assert.deepEqual(N.besideSpot(50, 60, 0, 0, [0, 100]), [50, 60]);
  const s = N.besideSpot(1, 1, 0, 0, [0, 100]);
  assert.ok(Math.abs(Math.hypot(s[0], s[1]) - 4.5) < 1e-9, 'steps 4.5 amot aside');
  assert.ok(Math.abs(s[1]) < 1e-9, 'across the line of sight (the camera looks along z)');
  assert.equal(N.besideSpot(NaN, 1, 0, 0, null), null);
  assert.deepEqual(N.besideSpot(1, 1, NaN, NaN, null), [1, 1]);
});

test('beside me, the side away from the pointer (my stone); either side when there is no pointer', () => {
  assert.equal(N.pickSide({ x: 100, y: 400 }, { x: 300, y: 400 }, { x: 110, y: 390 }), -1);
  assert.equal(N.pickSide({ x: 100, y: 400 }, { x: 300, y: 400 }, { x: 290, y: 390 }), 1);
  assert.equal(N.pickSide({ x: 100, y: 400 }, { x: 104, y: 400 }, { x: 0, y: 400 }), 1, 'a near tie keeps the first side');
  assert.equal(N.pickSide({ x: 1, y: 1 }, { x: 2, y: 2 }, null), 1);
  const a = N.besideSpot(1, 1, 0, 0, [0, 100], 1), b = N.besideSpot(1, 1, 0, 0, [0, 100], -1);
  assert.ok(Math.abs(a[0] + b[0]) < 1e-9 && Math.abs(a[1] + b[1]) < 1e-9, 'the two sides mirror across my builder');
});

test('the db\'s update: nested objects merge, arrays replace, a null removes', () => {
  const a = { v: 1, members: { k1: { stones: 1, perfect: 2 } }, list: [1, 2] };
  const m = mergeDeep(a, { members: { k2: { stones: 3 }, k1: { stones: 4 } }, list: [9], v: null });
  assert.deepEqual(m, { members: { k1: { stones: 4, perfect: 2 }, k2: { stones: 3 } }, list: [9] });
  assert.deepEqual(a.members.k1, { stones: 1, perfect: 2 }, 'the input is untouched');
});

test('connect: no platform and no BroadcastChannel → null, never a throw', async () => {
  const had = globalThis.BroadcastChannel;
  globalThis.BroadcastChannel = undefined;
  try { assert.equal(await connect({ mock: true }), null); assert.equal(await connect({ mock: false, wait: 50 }), null); }
  finally { globalThis.BroadcastChannel = had; }
});

// (FUN11, wave 11) the artifact is published with `room` only: `db` stays behind a flag until the owner decides (db = no public link)
test('connect: the room alone by default; the db only behind its flag (connect({db:true}) or __NET_DB)', async () => {
  const asked = [], docs = {};
  const room = { presence: async () => {}, peers: () => [{ peer: 'p1', sameTab: true, presence: {} }], onPeers: () => () => {}, emit: async () => {}, on: () => () => {}, connected: () => true };
  const db = { doc: (p) => ({ get: async () => docs[p] || null, set: async (o) => { docs[p] = o; }, update: async (o) => { docs[p] = { ...(docs[p] || {}), ...o }; }, onSnapshot: () => () => {} }) };
  const hadW = globalThis.window;
  globalThis.window = { claude: { use: async (k) => { asked.push(k); return k === 'room' ? room : k === 'db' ? db : null; } } };
  try {
    const t0 = await connect({ mock: false, wait: 50 });
    assert.equal(t0.kind, 'room'); assert.equal(t0.shared, false, 'the tally in this device\'s memory');
    assert.deepEqual(asked, ['room'], 'db is never asked for by default');
    asked.length = 0;
    const t1 = await connect({ mock: false, wait: 50, db: true });
    assert.deepEqual(asked.sort(), ['db', 'room']); assert.equal(t1.shared, true, 'the tally in the artifact\'s db');
    await t1.doc('games/1234').set({ members: { a: { stones: 1 } } });
    assert.deepEqual(docs['games/1234'], { members: { a: { stones: 1 } } });
    asked.length = 0; globalThis.__NET_DB = true;
    const t2 = await connect({ mock: false, wait: 50 });
    assert.ok(asked.includes('db') && t2.shared, 'the global flag turns it on');
  } finally { globalThis.window = hadW; delete globalThis.__NET_DB; }
});

test('the mock: presence, moments and the shared document between two "tabs"', async () => {
  if (typeof BroadcastChannel !== 'function') return;
  const store = new Map();
  globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
  const a = await connect({ mock: true, channel: 'nt-test' }), b = await connect({ mock: true, channel: 'nt-test' });
  try {
    assert.equal(a.kind, 'mock');
    await a.presence({ app: N.APP, code: '4821' });
    await new Promise((r) => setTimeout(r, 150));
    const seen = b.peers().find((p) => !p.self);
    assert.equal(seen && seen.presence.code, '4821');
    let got = null; b.on('cheer', (d, from) => { got = { d, from }; });
    await a.emit('cheer', { code: '4821' });
    await new Promise((r) => setTimeout(r, 100));
    assert.deepEqual(got && got.d, { code: '4821' }); assert.equal(got.from.self, false);
    const da = a.doc('games/4821'), db = b.doc('games/4821');
    await da.set({ members: { k1: { stones: 1 } } });
    await db.update({ members: { k2: { stones: 2 } } });
    assert.deepEqual(await da.get(), { members: { k1: { stones: 1 }, k2: { stones: 2 } } });
    assert.equal(await b.doc('games/0000').update({ x: 1 }), false, 'update needs the document');
  } finally { a.close(); b.close(); }
});

test('texts: every card carries טיוטה, the verse its source (the Name scan: test/qa-content-scan.cjs over the bundle)', () => {
  assert.equal(T.draft, 'טיוטה');
  assert.equal(T.verseRef, 'נחמיה ג, א');
  assert.match(T.together(1), /1 אבן$/); assert.match(T.together(3), /3 אבנים$/);
  assert.ok(T.joinTo('', '1234').includes('1234'));
});
