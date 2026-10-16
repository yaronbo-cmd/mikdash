// FIX26: the payis prediction (counting, never luck), the mukhni's grade, the evarim's names, the source text's rules — node, no browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { lotModel, lotPlan, HERO_SEAT, PREDICT_S, SEATS } from '../src/avodah/works/payis.js';
import { mukhniQ, MUKHNI } from '../src/avodah/works/kiyor.js';
import { EV_NAMES, EV_MINCHA, EV_LINE, EV_REF } from '../src/avodah/works/fix26.js';

const run = (M, s) => { for (let t = 0; t < s; t += 0.05) M.step(0.05); };
function toPredict(o = {}) { const M = lotModel({}, 'payis'); run(M, 1.3); M.twinTap(); run(M, 1.2); return M; }

test('payis: the stop → the number → "מי יזכה?" (a 6-s window) → the count', () => {
  const M = toPredict(); assert.equal(M.sub, 'predict'); assert.equal(HERO_SEAT, 0); assert.equal(PREDICT_S, 6);
  run(M, PREDICT_S + 0.2); assert.equal(M.sub, 'count'); assert.equal(M.guess, -1);
});
test('payis: a right prediction → gold and the stamp; the winner is the count\'s, not chance', () => {
  const M = toPredict(), win = lotPlan(M.N, M.start).win;
  assert.ok(M.predict(win)); assert.equal(M.sub, 'count');
  for (let i = 0; i < 30 && M.phase === 'work'; i++) { M.twinTap(); run(M, 0.4); }
  assert.equal(M.win, win); assert.ok(M.stamp); assert.ok(M.acts.some((a) => a.q === 2 && /ניחשתם/.test(a.say || '')));
});
test('payis: a wrong prediction is good — no penalty, the work still ends', () => {
  const M = toPredict(), win = lotPlan(M.N, M.start).win, g = (win + 3) % SEATS;
  M.predict(g); const n0 = M.miss;
  for (let i = 0; i < 30 && M.phase === 'work'; i++) { M.twinTap(); run(M, 0.4); }
  assert.equal(M.win, win); assert.ok(!M.stamp); assert.equal(M.miss, n0); assert.ok(M.phase !== 'work');
});
test('payis: the button in the window skips the guess; taps alone finish', () => {
  const M = toPredict(); run(M, 1); M.twinTap(); assert.equal(M.sub, 'count');
  for (let i = 0; i < 30 && M.phase === 'work'; i++) { M.twinTap(); run(M, 0.4); }
  assert.ok(M.phase !== 'work');
});
test('payis: the 120 ms grace — a touch just after the ring moved on stops on the kohen it left', () => {
  const M = lotModel({}, 'payis'); run(M, 1.0);
  M.pos = 3; M.prev = 2; M.acc = 0.05; M.touch(true); M.pos = 4; M.prev = 3; M.twinTap();
  assert.equal(M.start, 2);
});
test('kiyor: the mukhni — released at the top mark is gold, elsewhere good', () => {
  assert.equal(mukhniQ(1), 2); assert.equal(mukhniQ(1 + MUKHNI.gold * 0.9), 2); assert.equal(mukhniQ(0.7), 1); assert.equal(mukhniQ(1.25), 1);
});
test('evarim: nine portions named (תמיד ד, ג), the last three the meal offering and the wine (במדבר כח)', () => {
  assert.equal(EV_NAMES.length, 9); assert.deepEqual(EV_NAMES.slice(EV_MINCHA), ['הסולת', 'החביתין', 'היין']);
  assert.match(EV_LINE, /המנחה והנסכים/); assert.match(EV_REF, /במדבר כח/);
});
test('the texts FIX26 touched: no Divine Name, no red outside the blood', () => {
  const bad = [String.fromCharCode(0x5d4, 0x5f3), String.fromCharCode(0x5d0, 0x5dc, 0x5e7, 0x5d9, 0x5dd), String.fromCharCode(0x5d0, 0x2d, 0x5dc)];
  for (const f of ['src/avodah/works/fix26.js', 'src/avodah/works/payis.js', 'src/avodah/works/kiyor.js']) {
    const t = fs.readFileSync(f, 'utf8'); for (const b of bad) assert.ok(!t.includes(b), f);
    assert.ok(!/#(?:C|D|E|F)[0-9A-F]0{2,}\b|#FF0000|#B00/.test(t.replace(/\/\/[^\n]*/g, '')), f + ' red');
  }
});
