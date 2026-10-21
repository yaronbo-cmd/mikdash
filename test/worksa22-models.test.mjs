// WORKSA22: the models of Phase B's night / pen / wood works — taps alone finish each; acts carry points; a wrong try takes nothing;
// the sources are Hebrew and never carry a Divine Name; nothing red in the kit's palette.   node --test test/worksa22-models.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { nightModel, mokedModel, lambsModel, night, moked, lambs } from '../src/avodah/works/night.js';
import { penModel, pen } from '../src/avodah/works/pen.js';
import { woodModel, wood } from '../src/avodah/works/wood.js';
import { isRed } from '../src/avodah/works/kit.js';
import { WORKS } from '../src/avodah/works/index.js';

const NAME = new RegExp(['\u05D4\u05F3', '\u05D0\u05DC\u05E7\u05D9\u05DD', '\u05D0-\u05DC', '\u05D4\u05B3'].join('|'));   // (the Name's forms, as escapes: never written out)
/** tap until done (a tap every 0.25 s of game time); returns the seconds taken */
function tapsOnly(M, gap = 0.25, max = 400) {
  let t = 0, since = 0;
  while (!M.done && t < max) { M.step(0.05); t += 0.05; since += 0.05; if (since >= gap) { since = 0; M.twinTap(); } }
  return t;
}
test('the five works are registered with sources and the contract shape', () => {
  assert.deepEqual(Object.keys(WORKS).sort(), ['lambs', 'moked', 'night', 'pen', 'wood']);
  for (const w of Object.values(WORKS)) {
    for (const f of ['model', 'begin', 'touch', 'update', 'end', 'box', 'hooks']) assert.equal(typeof w[f], 'function', w.id + '.' + f);
    assert.ok(w.fact && /[֐-׿]/.test(w.fact.he) && w.fact.ref, w.id + ' fact');
    assert.ok(!NAME.test(w.fact.he + w.fact.ref + w.he), w.id + ' no Name');
  }
  assert.equal(pen.fact.illus, true); assert.equal(moked.fact.illus, true); assert.equal(lambs.fact.illus, true);
});
test('night: three posts, three acts with points, finishes by taps alone; the sleeper is nudged (not struck)', () => {
  const M = nightModel({}); assert.equal(M.n, 3);
  const t = tapsOnly(M);
  assert.ok(M.done && M.i === 3 && M.acts.length === 3 && M.pts >= 30 + 60, `done ${M.done} i ${M.i} acts ${M.acts.length} pts ${M.pts} t ${t}`);
  assert.ok(M.ans.every(Boolean)); assert.ok(t < 60, 'about a minute at most ' + t);
  assert.ok(M.result().quality > 0);
});
test('night: a tap while he walks waits for the post (never lost, never double)', () => {
  const M = nightModel({}); M.twinTap(); M.twinTap(); assert.equal(M.acts.length, 0);
  for (let i = 0; i < 60; i++) M.step(0.05); assert.equal(M.acts.length, 1, 'one tap landed when he arrived (the second was dropped to one pending)');
});
test('moked: four logs, the flames grow, a drag lays a bigger log; taps finish it', () => {
  const M = mokedModel({}); const h0 = M.heat; assert.equal(M.n, 4);
  tapsOnly(M); assert.ok(M.done && M.laid === 4 && M.acts.length === 4); assert.ok(M.heat > h0 + 1.5, 'heat ' + M.heat);
  const B = mokedModel({}); B.drag(0.5, 0.5, 'down'); B.drag(0.7, 0.5, 'move'); B.drag(0.7, 0.5, 'up');
  for (let i = 0; i < 20; i++) B.step(0.05); assert.equal(B.laid, 1); assert.ok(B.target > 1.5, 'a bigger log: ' + B.target);
});
test('lambs: six counted, then ear · eye · foot; the words; 9 acts; no blemish word', () => {
  const M = lambsModel({}); let said = '';
  let t = 0, since = 0;
  while (!M.done && t < 300) { M.step(0.05); t += 0.05; since += 0.05; if (M.say) said += M.say + '|'; if (since >= 0.3) { since = 0; M.twinTap(); } }
  assert.ok(M.done && M.acts.length === 9, 'acts ' + M.acts.length);
  assert.ok(said.includes('ששה טלאים מבוקרים') && said.includes('אוזן') && said.includes('עין') && said.includes('רגל'), said);
  assert.ok(!/מום|דם/.test(said), 'no blemish, no blood in the words');
});
test('pen: water by holding; or by taps; fodder; four sorted; a wrong side takes nothing and the lamb comes back', () => {
  const H = penModel({});
  H.touch(true); for (let i = 0; i < 60; i++) H.step(0.05); H.touch(false);
  assert.equal(H.wDone, 3, 'a hold fills it: ' + H.wDone); assert.equal(H.acts.length, 3);
  const M = penModel({}); const t = tapsOnly(M, 0.3);
  assert.ok(M.done && M.acts.length === 10 && M.hay === 3 && M.penned[0] === 2 && M.penned[1] === 2, `acts ${M.acts.length} penned ${M.penned} t ${t}`);
  // the wrong side: drag the first lamb (new) to the right
  const W = penModel({}); W.sub = 'sort'; W.wDone = 3; W.hay = 3; W.next();
  for (let i = 0; i < 40; i++) W.step(0.05);
  assert.equal(W.lam.mode, 'wait'); const p0 = W.pts;
  W.drag(0.5, 0.5, 'down'); W.drag(0.8, 0.5, 'move'); W.drag(0.8, 0.5, 'up');
  assert.equal(W.warn, 'לא כאן — עוד קצת'); assert.equal(W.pts, p0, 'nothing taken, nothing paid'); assert.equal(W.miss, 1);
  for (let i = 0; i < 20; i++) W.step(0.05); assert.equal(W.lam.mode, 'wait', 'back where it was');
  W.drag(0.5, 0.5, 'down'); W.drag(0.2, 0.5, 'move'); W.drag(0.2, 0.5, 'up'); for (let i = 0; i < 40; i++) W.step(0.05);
  assert.equal(W.penned[0], 1); assert.ok(W.pts > p0 && W.acts[W.acts.length - 1].q <= 1, 'after a slip at most good');
});
test('wood: 8 logs, three wormy to the side, five to the stock; stock.add(wood, 5); a wrong side takes nothing', () => {
  const M = woodModel({}); const added = []; M.onEnd({ stock: { add: (k, n) => added.push([k, n]) } }); // (not yet — only the count at the end)
  assert.deepEqual(added, [[ 'wood', 0 ]].filter((x) => x[1] > 0));
  const A = woodModel({}); const got = [];
  tapsOnly(A, 0.25); A.stocked = false; A.onEnd({ stock: { add: (k, n) => got.push([k, n]) } });
  assert.ok(A.done && A.acts.length === 8 && A.bad === 3 && A.good === 5, `bad ${A.bad} good ${A.good}`); assert.deepEqual(got, [['wood', 5]]);
  A.onEnd({ stock: { add: (k, n) => got.push([k, n]) } }); assert.equal(got.length, 1, 'once');
  const W = woodModel({}); W.twinTap(); for (let i = 0; i < 20; i++) W.step(0.05); const p0 = W.pts;
  W.drag(0.5, 0.5, 'down'); W.drag(0.8, 0.5, 'move'); W.drag(0.8, 0.5, 'up');   // log 0 is sound: right is correct
  for (let i = 0; i < 20; i++) W.step(0.05); assert.equal(W.good, 1);
  W.twinTap(); for (let i = 0; i < 20; i++) W.step(0.05);   // log 1 is wormy: turned; drag it right (wrong)
  W.drag(0.5, 0.5, 'down'); W.drag(0.8, 0.5, 'move'); W.drag(0.8, 0.5, 'up'); const p1 = W.pts;
  for (let i = 0; i < 20; i++) W.step(0.05); assert.equal(W.pts, p1); assert.equal(W.bad, 0); assert.equal(W.miss, 1); assert.ok(p1 > p0);
});
test('the palette: no red anywhere in the works\' hex colours', () => {
  for (const f of ['night.js', 'pen.js', 'wood.js', 'figures.js']) {
    const src = require_('../src/avodah/works/' + f);
    for (const m of src.matchAll(/'(!?#[0-9A-Fa-f]{6})'/g)) assert.ok(!isRed(m[1]), f + ' ' + m[1]);
  }
});
import fs from 'node:fs';
function require_(p) { return fs.readFileSync(new URL(p, import.meta.url), 'utf8'); }
