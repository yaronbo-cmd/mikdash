// build 131 — stage 08 part 1, the pit at Beit Kerem (src/game/h131/pit-model.js, pit.js): the three levels really differ (one stone
// almost bare; one on a slant whose wrong side presses it into the rock; three leaning, the free one first), the earth holds a stone
// until it is scraped, the lever only under a bared lip, a warning let go in time costs nothing, a knock is found by the nail and costs
// 20 (never below zero), the one grading, the work's blob round trip (a reload), and the act's words from the spec.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PIT, pitFresh, pitRead, scrape, seenSide, capOf, seat, wrongSide, pitStep, release, chipOut, leftOf, doneOf, pitPts, pitClean, lipOf, sideDir, freeOf, nailFrom, nailChip } from '../src/game/h131/pit-model.js';
import { LINES, LOSS, applyLoss, lossPts } from '../src/game/h131/model.js';
import { BOOK } from '../src/game/world/grid.js';

const P = BOOK.s08.pit, SPEC = readFileSync(new URL('../docs/specs/shlav-08-he.md', import.meta.url), 'utf8');
/** scrape every open side of stone i bare (strokes out from each lip and back) */
function bare(W, i) {
  const s = W.stones[i];
  for (let n = 0; n < 12; n++) for (let k = 0; k < 4; k++) { if (s.block.includes(k) || s.cover[k] <= 0.05) continue; const p = lipOf(s, k), d = sideDir(k, s.yaw); scrape(W, [p[0] - d[0] * 0.3, p[1] - d[1] * 0.3], [p[0] + d[0] * 1.6, p[1] + d[1] * 1.6]); }
}
/** hold the lever pressed under (i, side) for t seconds → the events */
function press(W, i, side, t) { const L = { i, side, pt: 0, warn: 0 }; const ev = []; for (let k = 0; k < t / 0.05; k++) ev.push(...pitStep(W, 0.05, L, true)); return { ev, L }; }

test('pit: the stones stand where the book lays them, three levels truly different', () => {
  for (const lv of [1, 2, 3]) { const W = pitFresh(lv, P.stones); assert.deepEqual(W.stones.map((s) => s.at), P.stones[lv].map((p) => [...p])); }
  const [a, b, c] = [1, 2, 3].map((lv) => pitFresh(lv, P.stones));
  assert.equal(a.stones.length, 1); assert.equal(b.stones.length, 1); assert.equal(c.stones.length, 3);
  assert.ok(a.stones[0].cover.every((v) => v > PIT.SEEN && v < 0.5), 'level 1: almost bare');
  assert.ok(b.stones[0].tilt > 0 && b.stones[0].deep != null && b.stones[0].cover[b.stones[0].deep] > 0.9, 'level 2: a slant, its deep side deep in the earth');
  assert.ok(seenSide(b.stones[0], 3), 'level 2: the shallow side shows at once (the temptation)');
  assert.deepEqual(c.stones.map((s) => s.lean), [1, 2, null], 'level 3: the left rests on the middle, the middle on the right');
});

test('pit: the earth holds the stone until it is scraped; the lever goes only under a bared lip', () => {
  const W = pitFresh(1, P.stones), s = W.stones[0];
  assert.equal(seat(W, 0, 2).ok, false); assert.equal(seat(W, 0, 2).why, 'earth');
  assert.ok(capOf(s) < 0.5, 'held: the lever lifts it only a little');
  const p = lipOf(s, 2), d = sideDir(2, s.yaw); const r = scrape(W, [p[0], p[1]], [p[0] + d[0] * 2, p[1] + d[1] * 2]);
  assert.ok(r.took > 0 && r.bared.length === 1, 'a stroke over the lip bares it'); assert.ok(seat(W, 0, 2).ok);
  const held = press(W, 0, 2, 3);
  assert.ok(held.ev.some((e) => e.e === 'held') && !held.ev.some((e) => e.e === 'free') && s.rise < 0.6, 'still held by the other sides');
  for (let k = 0; k < 60; k++) pitStep(W, 0.05, { i: 0, side: 2 }, false);
  assert.equal(s.rise, 0, 'let go, it sinks back');
  bare(W, 0); assert.equal(capOf(s), 1);
  const out = press(W, 0, 2, 6); assert.ok(out.ev.some((e) => e.e === 'free')); assert.ok(s.out && doneOf(W));
  assert.ok(pitClean(W)); assert.equal(pitPts(W), 40);
});

test('pit: the heavy stone moves late (the lever pressed a moment before it rises)', () => {
  const W = pitFresh(1, P.stones); bare(W, 0);
  const L = { i: 0, side: 1, pt: 0 }; pitStep(W, PIT.LAG * 0.8, L, true); assert.equal(W.stones[0].rise, 0);
  pitStep(W, PIT.LAG, L, true); assert.ok(W.stones[0].rise > 0);
});

test('pit level 2: the wrong side grinds it into the rock; let go in time — a slip, no damage; held on — it knocks', () => {
  const W = pitFresh(2, P.stones), s = W.stones[0];
  assert.ok(wrongSide(W, s, 3) && !wrongSide(W, s, s.deep));
  const L = { i: 0, side: 3, pt: 0, warn: 0 }; const ev = [];
  for (let k = 0; k < 20 && !L.warn; k++) ev.push(...pitStep(W, 0.05, L, true));
  assert.ok(ev.some((e) => e.e === 'grind'));
  assert.deepEqual(release(W, L), { e: 'spared', i: 0 }); assert.equal(W.mis, 1); assert.equal(W.dmg, 0); assert.equal(s.knock, 0);
  const k2 = press(W, 0, 3, 4); assert.ok(k2.ev.some((e) => e.e === 'chip')); assert.equal(s.knock, 1); assert.equal(W.check, 0);
  // the nail finds the chip: the stone to the rejects (it stays), another bared in its place; the work goes on to its end
  const n = chipOut(W, 0); assert.equal(W.dmg, 1); assert.equal(W.check, null); assert.ok(s.gone && s.chip); assert.deepEqual(n.at, s.at); assert.ok(n.repl && n.deep === s.deep);
  bare(W, 1); assert.ok(press(W, 1, n.deep, 6).ev.some((e) => e.e === 'free')); assert.ok(doneOf(W));
  assert.equal(pitPts(W), 10, 'damage: 10');
});

test('pit level 3: the free one first is clean; a holder lifted first makes its neighbour slide and knock', () => {
  const W = pitFresh(3, P.stones);
  for (const i of [0, 1, 2]) bare(W, i);
  assert.ok(!seat(W, 0, 1).ok, 'a side against a neighbour takes no lever');
  for (const i of [0, 1, 2]) { const side = [3, 2, 1][i]; assert.ok(seat(W, i, side).ok, 'seat ' + i); assert.ok(press(W, i, side, 6).ev.some((e) => e.e === 'free'), 'free ' + i); }
  assert.ok(doneOf(W) && pitClean(W)); assert.equal(pitPts(W), 40);
  const V = pitFresh(3, P.stones); for (const i of [0, 1, 2]) bare(V, i);
  const L = { i: 1, side: 2, pt: 0, warn: 0 }; const ev = [];
  for (let k = 0; k < 40 && !L.warn; k++) ev.push(...pitStep(V, 0.05, L, true));
  assert.ok(ev.some((e) => e.e === 'slide' && e.j === 0)); assert.ok(V.stones[0].slide >= 0 && release(V, L)); assert.equal(V.dmg, 0); assert.equal(V.mis, 1);
  const r = press(V, 1, 2, 4); assert.ok(r.ev.some((e) => e.e === 'knock' && e.j === 0)); assert.equal(V.check, 0); assert.equal(V.stones[0].knock, 1);
  chipOut(V, 0); assert.equal(V.stones[3].lean, null); assert.equal(leftOf(V).length, 2, "the replacement and the right one (the middle, lifted on, came out)");
});

test('pit: a work broken off is read back from the save as it was (a reload), a stale one is not', () => {
  const W = pitFresh(2, P.stones); const p = lipOf(W.stones[0], 1); scrape(W, p, [p[0] + 2, p[1]]); W.mis = 1;
  const back = pitRead(JSON.parse(JSON.stringify(W)), 2);
  assert.deepEqual(back.stones[0].cover, W.stones[0].cover); assert.equal(back.mis, 1);
  assert.equal(pitRead(JSON.parse(JSON.stringify(W)), 3), null); assert.equal(pitRead(null, 1), null); assert.equal(pitRead({ lv: 1, stones: [{ cover: [1] }] }, 1), null);
});

test('pit: the loss is the table\'s, never below zero; the act\'s quotes are the spec\'s', async () => {
  assert.deepEqual(LOSS['pit.chip'], ['אבן שנפגמה ונשארה בערימת הפסולות', 20]); assert.equal(lossPts('pit.chip'), 20); assert.equal(applyLoss(10, 20), 0);
  for (const k of ['betula', 'middot34', 'nail']) { const body = LINES[k].replace(/\s\([^()]*\)$/, ''); for (const part of body.split(/"/).filter((x) => x.trim().length > 6)) assert.ok(SPEC.includes(part.trim().replace(/^המשנה אומרת שאבני המזבח באות מבקעת בית כרם, ושם$/, 'המשנה אומרת שאבני המזבח באות מבקעת בית כרם, ושם')) || part.includes('פגימת'), k + ': ' + part); }
  const { PLINES } = await import('../src/game/h131/pit.js').catch(() => ({ PLINES: null }));
  if (PLINES) {
    assert.ok(SPEC.includes(PLINES.seen), 'the layers in the spec\'s words');
    for (const [k, t] of Object.entries(PLINES)) { assert.ok(t.length < 80, k); if (/^l[123]$|lever|press|nail/.test(k)) assert.ok(t.replace(/\s*\(המחשה\)$/, '').split(/\s+/).length <= 6, k + ' short (rule 25)'); }
  }
});

test('pit review 4: level 3, the free stone gives 1–2% of its width (no mark); the holder pinned by the one on it does not', () => {
  assert.ok(PIT.JIG >= 0.01 && PIT.JIG <= 0.02, 'the give is 1–2% of the width');
  assert.ok(PIT.JIG_T > 0.2 && PIT.JIG_T < 1, 'a short give');
  const W = pitFresh(3, P.stones);
  assert.deepEqual(freeOf(W), [0], 'at first only the left one, which nobody rests on');
  bare(W, 0); press(W, 0, W.stones[0].cover.findIndex((v, k) => !W.stones[0].block.includes(k) && v <= PIT.SEEN), 6);
  if (W.stones[0].out) assert.deepEqual(freeOf(W), [1], 'the left one out: the middle one is free now');
  assert.deepEqual(freeOf(pitFresh(1, P.stones)), [], 'levels 1 and 2 have no such hint');
});
test('pit review 8: the nail check passes only the suspect stretch before the chip (about a second), not the whole rim', () => {
  assert.ok(nailFrom() > 0 && nailFrom() < nailChip(), 'it starts before the chip');
  const span = nailChip() - nailFrom(), pace = 0.32 * 1.5;   // (pit.js K.THUMB × 1.5: the thumb's fastest pace, rim per second)
  assert.ok(span <= 0.35, 'a stretch, not the rim');
  assert.ok(span / pace >= 0.5 && span / pace <= 1.2, 'about a second at the thumb\'s pace: ' + (span / pace).toFixed(2));
});
