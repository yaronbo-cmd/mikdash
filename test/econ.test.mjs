// ECON14 (wave 14): the coins and אוצר המלאכה (D2), by node alone.
//   node --test test/econ.test.mjs
// The pay table (stars × (level + 2), a skip 3, a course +5, the moment ×2); nothing random and no timer in the coins' code; the
// treasurer (a survey or a dig short only of coins); the shop's fixed prices, its limits and "הדוכן שלם"; Shabbat and Yom Tov
// close the shop with nothing lost (the demo never closes); the draw pad's solver and a masher.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as S from '../src/game/state.js';
import { PAY, UPGRADES } from '../src/game/content.js';
import * as SHOP from '../src/game/shop.js';
import { simulate, GAMES, drawMark } from '../src/game/minigames/index.js';

const T0 = Date.UTC(2026, 9, 4, 5, 0);
const fresh = () => { const G = S.fresh(T0); G.ftue = 99; G.econ.paid1 = 1; return G; };   // (the treasury opens with her first pay)

test('the pay table: stars × (level + 2); a skip 3; a course +5; the moment ×2', () => {
  const want = { 1: [3, 6, 9], 2: [4, 8, 12], 3: [5, 10, 15] };
  for (const lv of [1, 2, 3]) for (const st of [1, 2, 3]) assert.equal(PAY.coins(st, lv), want[lv][st - 1], `L${lv} ${st}★`);
  // the stars from q: done ★, q ≥ .7 ★★, q ≥ .9 ★★★ (never ☆☆☆ unless skipped)
  assert.deepEqual([0, 0.69, 0.7, 0.89, 0.9, 1].map((q) => PAY.starsOf(q)), [1, 1, 2, 2, 3, 3]);
  assert.equal(PAY.starsOf(1, true), 0);
  const G = S.fresh(T0), s0 = G.res.silver;
  const a = S.payJob(G, { id: 'saw', site: 'wall', level: 2, q: 0.95 });
  assert.deepEqual([a.coins, a.stars, a.first], [12, 3, true]);
  assert.equal(S.payJob(G, { level: 1, q: 0.5 }).first, false, 'the first pay is once a save');
  assert.equal(S.payJob(G, { level: 3, skipped: true }).coins, PAY.skip);
  assert.deepEqual(S.payCourse(G), { coins: 5, course: true });
  assert.equal(S.payMoment(G, 0.95).coins, 30, 'the moment: 2 × 3★ × (3 + 2)');
  assert.equal(S.payMoment(G, 0).coins, 10, 'a skipped moment still pays its ★');
  assert.equal(G.res.silver - s0, 12 + 3 + 3 + 5 + 30 + 10, 'paid at once into the purse');
  assert.equal(G.econ.earned, 63);
  // the level is clamped (1–3) and a bad q is a ★
  assert.equal(S.payJob(G, { level: 9, q: 0.9 }).coins, 15);
  assert.equal(S.payJob(G, { level: 0, q: NaN }).coins, 3);
});

test('in-between games pay at most half a job\'s rate a minute', () => {
  const G = fresh(), s0 = G.res.silver;
  assert.equal(S.payGame(G, 100, 2), 2 * PAY.gameMin);
  assert.equal(S.payGame(G, 3, 2), 3);
  assert.equal(G.res.silver - s0, 2 * PAY.gameMin + 3);
});

test('nothing random, no timer: the same work pays the same, and the coins\' code reads no clock', () => {
  const run = () => { const G = fresh(); for (let k = 0; k < 40; k++) S.payJob(G, { level: 1 + (k % 3), q: (k * 37 % 100) / 100 }); S.payCourse(G); S.payMoment(G, 0.8); return [G.res.silver, JSON.stringify(G.econ)]; };
  assert.deepEqual(run(), run());
  const src = fs.readFileSync(new URL('../src/game/shop.js', import.meta.url), 'utf8');
  const fence = (f) => { const t = fs.readFileSync(new URL(f, import.meta.url), 'utf8'); return [...t.matchAll(/── econ14 ──([\s\S]*?)── \/econ14 ──/g)].map((m) => m[1]).join('\n'); };
  for (const [name, code] of [['shop.js', src], ['state.js (econ14)', fence('../src/game/state.js')], ['content.js (econ14)', fence('../src/game/content.js')]]) {
    for (const bad of ['Math.random', 'Date.now', 'setTimeout', 'setInterval', 'performance.now']) assert.ok(!code.includes(bad), `${name} has ${bad}`);
  }
});

test('the treasurer pays a survey or a dig short only of coins; never a cost of other materials', () => {
  const G = fresh();
  for (const id of ['har']) G.st[id] = { done: true };
  G.res.silver = 3;                                                    // the wall's survey costs 10
  const a = S.nextAction(G);
  assert.equal(a.kind, 'start', 'the survey is offered, not a board for coins');
  const r = S.startBuild(G, 'wall');
  assert.ok(r.ok, 'the survey is paid');
  assert.equal(G.econ.tre, 7);
  assert.deepEqual(G.econ.treLast, { id: 'wall', n: 7 });
  assert.equal(G.res.silver, 0);
  // the dig: short again → paid by the treasurer
  G.st.wall.p = 'dig'; G.st.wall.dp = 0; G.res.silver = 0;
  assert.equal(S.nextAction(G).kind, 'build');
  assert.ok(S.payStep(G, 'wall').ok);
  assert.equal(G.econ.tre, 17);
  // a segment of stone is never the treasurer's
  assert.equal(S.treasurerCovers(G, { stone: 12 }), false);
  assert.equal(S.treasurerCovers(G, { silver: 5, stone: 1 }), false);
  assert.equal(S.treasurer(G, { stone: 99 }), 0);
});

test('אוצר המלאכה: fixed prices, her five, the limits, "הדוכן שלם"', () => {
  const G = fresh(); G.res.silver = 5000;
  // the machines and the tools are UPGRADES re-skinned, at UPGRADES' prices
  for (const [k, up] of [['tools', 'tools'], ['crane', 'crane'], ['carts', 'carts']]) {
    for (let l = 0; l < 3; l++) { const s0 = G.res.silver, r = SHOP.buy(G, k); assert.ok(r.ok); assert.equal(s0 - G.res.silver, UPGRADES[up].cost[l]); assert.equal(G.up[up], l + 1); }
    assert.equal(SHOP.buy(G, k).full, true, `${k} is full at level 3`);
  }
  // the lamps: 30 each, up to 6
  for (let k = 0; k < 6; k++) assert.equal(SHOP.buy(G, 'lamp').price, 30);
  assert.equal(SHOP.buy(G, 'lamp').ok, false);
  assert.equal(SHOP.owned(G).lamps, 6);
  // the mark: 25, one a stage, only where courses are laid
  assert.equal(SHOP.canBuy(G, 'mark').noSite, true);
  assert.equal(SHOP.buy(G, 'mark', { site: 'wall' }).price, 25);
  assert.equal(SHOP.buy(G, 'mark', { site: 'wall' }).full, true);
  assert.equal(SHOP.buy(G, 'mark', { site: 'gates' }).ok, true);
  // the Levites: the Mishnah's least (9 kinnorot, 2 nevalim, 2 chalilim, 2 trumpets, one cymbal) is the full platform
  let duchan = 0;
  for (const k of SHOP.LEVITES) for (let n = 0; n < SHOP.ITEMS[k].max; n++) { const r = SHOP.buy(G, k); assert.ok(r.ok, `${k} ${n}`); if (r.duchan) duchan++; }
  assert.equal(duchan, 1, '"הדוכן שלם" once, at the last instrument');
  assert.ok(SHOP.duchan(G));
  assert.deepEqual(SHOP.instruments(G), { kinnor: 9, nevel: 2, chalil: 2, chatzotzrah: 2, tziltzal: 1 });
  // the vine's gifts (מדות ג, ח): a leaf, a grape (3 leaves' worth), a cluster (10) on the golden vine
  const v0 = G.vine.leaves;
  assert.equal(SHOP.buy(G, 'leaf').price, 15); assert.equal(SHOP.buy(G, 'grape').price, 30); assert.equal(SHOP.buy(G, 'cluster').price, 60);
  assert.equal(G.vine.leaves - v0, 14);
  for (let n = 1; n < 3; n++) SHOP.buy(G, 'cluster');
  assert.equal(SHOP.buy(G, 'cluster').full, true);
  // a shortfall is a goal, not a scold: "עוד N"
  const H = fresh(); H.res.silver = 12;
  assert.deepEqual(SHOP.canBuy(H, 'lamp'), { ok: false, price: 30, lack: 18 });
  assert.ok(/עוד/.test(SHOP.html(H, { site: 'wall' })));
  // every card is in the sheet, with one 44-px button (class gm-buy) or a calm "full" line
  const html = SHOP.html(fresh(), { site: 'wall' });
  for (const k of Object.keys(SHOP.ITEMS)) assert.ok(html.includes(`data-k="${k}"`), k);
  assert.equal((html.match(/class="gm-btn gm-buy/g) || []).length, Object.keys(SHOP.ITEMS).length);
});

test('the treasury opens with her first pay (her work buys her first thing); the demo is always open', () => {
  const G = S.fresh(T0); G.ftue = 99; G.res.silver = 100;
  assert.deepEqual(SHOP.canBuy(G, 'kinnor'), { ok: false, locked: true });
  assert.ok(/אחרי השכר הראשון/.test(SHOP.html(G)) && !/data-a="buy"/.test(SHOP.html(G)));
  S.payJob(G, { level: 1, q: 0.8 });
  assert.ok(SHOP.buy(G, 'kinnor').ok);
  const D = S.fresh(T0, { demo: true }); D.res.silver = 100;
  assert.ok(SHOP.buy(D, 'lamp').ok);
});

test('Shabbat and Yom Tov close the shop with nothing lost; the demo never closes', () => {
  const G = fresh(); G.res.silver = 200;
  const before = JSON.stringify([G.res, G.shop, G.up]);
  for (const k of Object.keys(SHOP.ITEMS)) { const r = SHOP.buy(G, k, { rest: true, site: 'wall' }); assert.equal(r.ok, false); assert.equal(r.closed, true); }
  assert.equal(JSON.stringify([G.res, G.shop, G.up]), before, 'nothing paid, nothing taken');
  assert.ok(/שבת שלום/.test(SHOP.html(G, { rest: true })));
  assert.ok(!/data-a="buy"/.test(SHOP.html(G, { rest: true })), 'no buy button on Shabbat');
  // the coins wait: after Shabbat the same coins buy the same thing
  assert.ok(SHOP.buy(G, 'lamp', { rest: false }).ok);
  const D = S.fresh(T0, { demo: true }); D.res.silver = 100;
  assert.ok(SHOP.buy(D, 'lamp', { rest: true }).ok, 'the demo is never closed');
});

test('the save keeps the coins\' counts and the shop (and an old save gets them empty)', () => {
  const G = fresh(); SHOP.buy(Object.assign(G, { res: { ...G.res, silver: 100 } }), 'lamp'); S.payJob(G, { q: 1 });
  const store = { m: new Map(), get(k) { return this.m.get(k) || null; }, set(k, v) { this.m.set(k, v); } };
  S.save(G, store, 'k', T0);
  const L = S.load(store, 'k', T0).G;
  assert.equal(L.shop.lamps, 1); assert.equal(L.econ.paid1, 1);
  const old = S.fresh(T0); delete old.econ; delete old.shop; store.set('k2', JSON.stringify(old));
  const L2 = S.load(store, 'k2', T0).G;
  assert.deepEqual([L2.econ, L2.shop], [{}, {}]);
});

test('draw.js: the letters\' solver is ★★★ at every level; a masher and an idle player are not; the mark keeps her strokes', () => {
  for (const level of [0, 1, 2]) { const r = simulate(GAMES.draw, { level, setup: {} }); assert.ok(r.done && r.stars === 3, `L${level}: ${JSON.stringify(r)}`); assert.ok(r.s <= 25, 'within a gesture\'s 25 s'); }
  let k = 0;
  const m = simulate(GAMES.draw, { level: 0, setup: {} }, () => { k++; return { x: (k * 0.37) % 1, y: (k * 0.61) % 1, p: k % 7 === 0 ? 'down' : k % 7 === 6 ? 'up' : 'move' }; }, 25);
  assert.ok(m.quality < 0.5, `a masher: ${m.quality}`);
  const idle = simulate(GAMES.draw, { level: 0, setup: {} }, () => false, 25);
  assert.equal(idle.done, false);
  const out = {}, mk = simulate(drawMark, { setup: { out } });
  assert.ok(mk.done && out.strokes.length >= 1 && out.strokes.every((s) => s.every(([x, y]) => x >= 0 && x <= 1 && y >= 0 && y <= 1)));
});

test('pipes.js "אמת המים": the generator is its own solver (★★★ at par, every level); a masher is not; the channel grows by level', async () => {
  const { pipes } = await import('../src/game/minigames/pipes.js');
  const { rng } = await import('../src/game/minigames/index.js');
  assert.ok(GAMES.pipes, 'registered for FUN14 (job aqueduct → game pipes)');
  const len = [0, 0, 0];
  for (let seed = 1; seed <= 60; seed++) for (const level of [0, 1, 2]) {
    const r = simulate(pipes, { level, rng: rng(seed * 7 + level), setup: {} });
    assert.ok(r.done && r.stars === 3 && r.taps <= r.par, `seed ${seed} L${level}: ${JSON.stringify(r)}`);   // (the water may find a shorter way through a decoy)
    len[level] += pipes.model({ level, rng: rng(seed) }).path.length;
  }
  assert.ok(len[0] < len[1] && len[1] < len[2], `the channel grows: ${len}`);
  let q = 0;
  for (let seed = 1; seed <= 30; seed++) { let k = 0; q += simulate(pipes, { level: 1, rng: rng(seed), setup: {} }, () => { k++; return { x: (k * 0.37) % 1, y: 0.1 + ((k * 0.61) % 0.8), p: 'tap' }; }, 25).quality; }
  assert.ok(q / 30 < 0.5, `a masher: ${q / 30}`);
});

test('the Levites\' instruments: nothing bought = today\'s mix; each one adds presence to its own voice', async () => {
  const { instrumentGains } = await import('../src/game/music.js');
  assert.deepEqual(instrumentGains({}), [1, 1, 1, 1, 1, 1, 1], 'nothing bought: the music as it was');
  const g = instrumentGains({ kinnor: 9, nevel: 2, chalil: 2, tziltzal: 1, chatzotzrah: 2 });
  assert.ok(g[0] > 1 && g[1] > 1 && g[2] > 1 && g[6] > 1 && g[3] === 1 && g[4] === 1 && g[5] === 1, String(g));
  instrumentGains({});   // (leave the module's mix as it was for the other tests)
});
