// TOOLS21 (wave 21, notes 6 and 7): tiers, prices, the multiplier maths, the earned upgrades, the shop section, the job → tool table.
//   node --test test/tools21.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import * as TL from '../src/game/tools.js';
import * as S from '../src/game/state.js';
import * as SHOP from '../src/game/shop.js';
import { JOBS } from '../src/game/jobs.js';
import { act, toolMult, PTS } from '../src/game/minigames/acts.js';

const mk = () => { const G = S.fresh(1e12, { demo: true }); G.res.silver = 5000; return G; };
const M = () => ({ t: 0, fx: [], acts: [] });

test('three tiers per tool: names, ×1.0 / 1.15 / 1.3, 300 and 900 silver, never real money', () => {
  assert.deepEqual(TL.TIER_MULT, [1, 1.15, 1.3]); assert.deepEqual(TL.TIER_PRICE, [0, 300, 900]);
  for (const id of TL.IDS) assert.equal(TL.TOOLS[id].tiers.length, 3, id);
  const G = mk();
  assert.equal(TL.tierOf(G, 'hammer'), 1); assert.equal(TL.nameOf(G, 'hammer'), 'פטיש ברזל פשוט');
  assert.equal(TL.priceOf(G, 'hammer'), 300);
  const r = TL.buy(G, 'hammer'); assert.ok(r.ok); assert.equal(r.tier, 2); assert.equal(G.res.silver, 4700);
  assert.equal(TL.multOf(G, 'hammer'), 1.15); assert.equal(TL.priceOf(G, 'hammer'), 900);
  const r3 = TL.buy(G, 'hammer'); assert.equal(r3.tier, 3); assert.equal(r3.name, 'פטיש האומן'); assert.equal(TL.multOf(G, 'hammer'), 1.3);
  assert.equal(TL.priceOf(G, 'hammer'), null); assert.equal(TL.buy(G, 'hammer').ok, false); assert.equal(G.res.silver, 3800);
});

test('a shortfall is a goal, not a loss: nothing changes', () => {
  const G = mk(); G.res.silver = 120;
  const c = TL.canBuy(G, 'pick'); assert.equal(c.ok, false); assert.equal(c.lack, 180);
  assert.equal(TL.buy(G, 'pick').ok, false); assert.equal(G.res.silver, 120); assert.equal(TL.tierOf(G, 'pick'), 1);
});

test('the earned upgrades: stage 3 (nashim) and 7 (yesod) lift tier 1 to 2 for free, once; a bought tier 3 stays', () => {
  const G = mk(); TL.buy(G, 'hammer'); TL.buy(G, 'hammer');
  assert.deepEqual(TL.earn(G, 2), []);
  assert.deepEqual(TL.earn(G, 3).sort(), ['chisel', 'mallet']); assert.equal(TL.tierOf(G, 'hammer'), 3, 'bought tier 3 is not lowered');
  assert.deepEqual(TL.earn(G, 3), [], 'once'); assert.equal(TL.tierOf(G, 'sledge'), 1);
  assert.equal(TL.earn(G, 7).length, 6); assert.equal(TL.tierOf(G, 'sledge'), 2); assert.equal(G.res.silver, 5000 - 1200, 'earned = free');
  assert.deepEqual(TL.earn(G, 14), []);
});

test('a save without G.tools (or a broken one) is made whole; it round-trips', () => {
  const G = mk(); delete G.tools; TL.ensure(G); assert.equal(TL.tierOf(G, 'saw'), 1);
  G.tools = { tier: { hammer: 9, ghost: 2, pick: 'x' }, earned: 5 }; TL.ensure(G);
  assert.equal(G.tools.tier.hammer, 3); assert.equal(G.tools.tier.ghost, undefined); assert.equal(G.tools.tier.pick, 1); assert.deepEqual(G.tools.earned, {});
  const F = S.fresh(1e12); assert.ok(F.tools && F.tools.tier);
});

test('the multiplier maths in act(): 10 · 20 · 40 (and 50) × the tier, rounded; ×1 without a tool', () => {
  const G = mk(); TL.attach(G, () => {});
  TL.use(null); assert.equal(toolMult(), 1);
  assert.deepEqual([0, 1, 2].map((q) => act(M(), q).pts), PTS);
  TL.buy(G, 'hammer'); TL.use('hammer'); assert.equal(globalThis.__TOOL_MULT, 1.15);
  assert.deepEqual([0, 1, 2].map((q) => act(M(), q).pts), [12, 23, 46]);
  TL.buy(G, 'hammer'); TL.use('hammer');
  assert.deepEqual([0, 1, 2].map((q) => act(M(), q).pts), [13, 26, 52]);
  const m = M(); act(m, 2); act(m, 2); const third = act(m, 2); assert.equal(third.pts, 65, 'the 50 streak × 1.3');
  assert.equal(m.pts, 52 + 52 + 65, 'M.pts is the paid sum');
  TL.release(); assert.equal(act(M(), 2).pts, 40);
});

test('the float says the multiplier once per job, and only when > 1', () => {
  const G = mk(); const said = []; TL.attach(G, (t) => said.push(t));
  TL.use('hammer'); TL.use('hammer'); assert.equal(said.length, 0, 'tier 1: silent');
  TL.buy(G, 'hammer'); TL.buy(G, 'hammer'); TL.use('hammer'); TL.use('hammer'); TL.use('hammer');
  assert.deepEqual(said, [`${TL.XM(1.3)} פטיש האומן`]);
  TL.release(); TL.use('hammer'); assert.equal(said.length, 2, 'the next job says it again');
  TL.release();
});

test('every job names its tool; wood at the altar; the table is whole', () => {
  assert.equal(JOBS.strike.tool, 'hammer'); assert.equal(JOBS.key.tool, 'chisel'); assert.equal(JOBS.line.tool, 'cord'); assert.equal(JOBS.column.tool, 'rope'); assert.equal(JOBS.saw.tool, 'saw'); assert.equal(JOBS.plumb.tool, 'plumb');
  assert.equal(JOBS.gold.tool, null);
  for (const k of Object.keys(JOBS)) assert.ok(JOBS[k].tool === null || TL.TOOLS[JOBS[k].tool], k);
  assert.equal(TL.jobTool('strike', true), 'mallet'); assert.equal(TL.jobTool('strike', false), 'hammer');
  assert.equal(TL.strokeTool('dress', true), 'mallet'); assert.equal(TL.strokeTool('pick', true), 'mallet'); assert.equal(TL.strokeTool('split', false), 'sledge'); assert.equal(TL.strokeTool('pick', false), 'pick');
  assert.equal(TL.strokeTool('tamp', true), 'mallet'); assert.equal(TL.strokeTool('measure', true), 'plumb');
});

test('the shop: a "כלי העבודה" section, 300 then 900 silver, shortfall as "עוד N", the hint never a tool', () => {
  assert.ok(SHOP.SECTIONS.some((s) => s.k === 'worktools' && s.n === 'כלי העבודה'));
  const G = mk(); const k = SHOP.TOOL_KEY('hammer');
  assert.equal(SHOP.priceOf(G, k), 300); assert.ok(SHOP.canBuy(G, k).ok);
  const r = SHOP.buy(G, k); assert.ok(r.ok); assert.equal(r.n, 1); assert.equal(TL.tierOf(G, 'hammer'), 2); assert.equal(G.res.silver, 4700);
  assert.equal(SHOP.priceOf(G, k), 900);
  const h = SHOP.html(G, {}); assert.ok(h.includes('כלי העבודה')); assert.ok(h.includes('data-k="tl_hammer"')); assert.ok(h.includes('פטיש פלדה מחוזקת'));
  G.res.silver = 0; assert.equal(SHOP.canBuy(G, k).lack, 900);
  G.res.silver = 5; assert.ok(!SHOP.cheapest(G, {}) || !SHOP.ITEMS[SHOP.cheapest(G, {}).k].tool);
});

test('no Divine Name in the module', async () => {
  const fs = await import('node:fs'); const src = fs.readFileSync(new URL('../src/game/tools.js', import.meta.url), 'utf8');
  // (the Tetragrammaton's pattern from \u escapes: never written in full, even in a test — qa-content-scan §2)
  const tetra = String.fromCharCode(0x05D9, 0x05D4, 0x05D5, 0x05D4);
  for (const bad of ['ה׳', 'אלקים', 'א-ל', tetra]) assert.ok(!src.includes(bad), bad === tetra ? 'the Name' : bad);
  assert.ok(!/(^|[\s"'(])ה'(?![א-ת])/.test(src), "a lone ה'");
});

test('the profile lists "הכלים שלי" with each tool, its tier and its multiplier', async () => {
  const { profileHTML } = await import('../src/game/hooks/around-ui.js');
  const G = mk(); TL.buy(G, 'hammer');
  const h = profileHTML(G, 1.8e12, {});
  assert.ok(h.includes('הכלים שלי')); assert.ok(h.includes('פטיש פלדה מחוזקת') && h.includes(TL.XM(1.15))); assert.ok(h.includes('מכוש ברזל פשוט'));
  assert.equal((h.match(/data-tool=/g) || []).length, TL.IDS.length);
});

test('a tier bought while the tool is in hand pays at once (attach re-reads it) and the float says it', () => {
  const G = mk(); const said = []; TL.attach(G, (t) => said.push(t));
  TL.use('pick'); assert.equal(toolMult(), 1);
  TL.buy(G, 'pick'); TL.attach(G);
  assert.equal(toolMult(), 1.15); assert.deepEqual(said, [`${TL.XM(1.15)} מכוש פלדה מחוזקת`]);
  TL.release();
});
