// PAYIS24: the lots in the player's hand (the ring runs and accelerates, the tap stops it on a kohen, the count then goes from his hat and ends
// by taps alone) and the new world works (pitum · yachid · machar · etzim · tokim): taps alone finish each in under a minute of game time, the
// pitum names the eleven spices from ketoret.json, the trumpets sound tekiah/teruah/tekiah, no red hex, no Divine Name, the errands point at the works.
//   node --test test/payis24-models.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { lotModel, lotPlan, ringStep, LOTS, SEATS, FACTS } from '../src/avodah/works/payis.js';
import { pitumModel, yachidModel, macharModel, etzimModel, tokimModel, PITUM_STEPS, PAYIS_WORKS } from '../src/avodah/works/more.js';
import { WORKS } from '../src/avodah/day/works.js';
import { TEMPLATES } from '../src/avodah/day/tasks.js';
import { SPICES } from '../src/avodah/data.js';
import { isRed } from '../src/avodah/works/kit.js';

const NAME = new RegExp(['\\u05D4\\u05F3', '\\u05D0\\u05DC\\u05E7\\u05D9\\u05DD', '\\u05D0-\\u05DC', '\\u05D4\\u05B3', "(^|[^\\u05D0-\\u05EA])\\u05D4'(?![\\u05D0-\\u05EA])"].join('|'));
function tapsOnly(M, gap = 0.45, max = 120) {
  let t = 0, since = 0;
  while (!M.done && t < max) { M.step(0.05); t += 0.05; since += 0.05; if (since >= gap) { since = 0; M.twinTap(); } }
  return t;
}
test('the lots: the ring runs, a tap stops it on the kohen it stands on, the count starts from his hat and ends by taps', () => {
  for (const kind of Object.keys(LOTS)) {
    const M = lotModel({}, kind);
    assert.equal(M.sub, 'run');
    let t = 0; while (t < 1.7) { M.step(0.05); t += 0.05; }
    const at = M.pos; assert.ok(at >= 0 && at < SEATS);
    assert.ok(M.fx.some((f) => f.sfx === 'tick'), kind + ' ticks');
    M.fx.length = 0; M.twinTap();
    assert.equal(M.start, at, kind + ' stops where the ring stood'); assert.equal(M.sub, 'named'); assert.equal(M.i, 1);
    const plan = lotPlan(LOTS[kind].N, at); assert.equal(M.plan.win, plan.win); assert.equal(M.n, 1 + plan.n);
    const M2 = lotModel({}, kind); const tt = tapsOnly(M2); assert.ok(M2.done && tt < 60, kind + ' by taps ' + tt.toFixed(1));
    assert.ok(M2.acts.length >= 5, kind + ' acts');
  }
});
test('the ring accelerates and the stop is the player\'s: different stop times, different hats, different winners', () => {
  assert.ok(ringStep(0) > ringStep(3) && ringStep(3) > ringStep(7));
  const winners = new Set(), starts = new Set();
  for (let tap = 0; tap < 8; tap++) {
    const M = lotModel({}, 'payis'); let t = 0; while (t < 0.6 + tap * 0.37) { M.step(0.05); t += 0.05; }
    M.twinTap(); starts.add(M.start); winners.add(M.plan.win);
  }
  assert.ok(starts.size >= 4, 'starts ' + [...starts]); assert.ok(winners.size >= 2, 'winners ' + [...winners]);
  // the count itself is a sum anyone can check: the last kohen's finger is the Nth
  for (let s = 0; s < SEATS; s++) { const P = lotPlan(14, s); assert.equal(P.seq[P.seq.length - 1].to, 14); }
});
test('the new works finish by taps alone in under a minute, with points', () => {
  const MK = { pitum: pitumModel, yachid: yachidModel, machar: macharModel, etzim: etzimModel, tokim: tokimModel };
  for (const [id, mk] of Object.entries(MK)) {
    const M = mk(); const t = tapsOnly(M); assert.ok(M.done, `${id} done (t ${t.toFixed(1)} i ${M.i}/${M.n})`); assert.ok(t < 60, `${id} ≤ 60 s: ${t.toFixed(1)}`);
    assert.ok(M.pts >= M.acts.length * 10, `${id} pts ${M.pts}`); assert.ok(M.result().quality > 0.5, id);
  }
});
test('pitum names the eleven spices one by one from ketoret.json, and sets the honey aside', () => {
  assert.equal(SPICES.length, 11);
  const pours = PITUM_STEPS.filter((s) => s.k === 'pour'); assert.equal(pours.length, 11);
  pours.forEach((s, j) => assert.ok(s.say.startsWith(SPICES[j].he) && s.say.includes(`${SPICES[j].manah} מנה`), s.say));
  assert.ok(PITUM_STEPS.some((s) => /דבש/.test(s.say || '')));
  assert.equal(SPICES.reduce((a, s) => a + s.manah, 0), 368);
});
test('the trumpeters sound tekiah · teruah · tekiah (the gate by taps; the song as a set), and the mentor line explains לבית התקיעה with its source', () => {
  const M = tokimModel(); const sfx = [];
  let t = 0, since = 0;
  while (!M.done && t < 60) { M.step(0.05); t += 0.05; since += 0.05; if (since >= 0.45) { since = 0; M.twinTap(); } for (const f of M.fx) sfx.push(f.sfx); M.fx.length = 0; }
  assert.ok(M.done);
  assert.deepEqual(sfx.filter((x) => x === 'tekiah' || x === 'teruah').slice(0, 3), ['tekiah', 'teruah', 'tekiah']);
  assert.equal(sfx.filter((x) => x === 'tekiah').length, 2 + 3 * 2); assert.equal(sfx.filter((x) => x === 'teruah').length, 1 + 3);
  const f = PAYIS_WORKS.tokim.fact; assert.ok(/לבית התקיעה/.test(f.he) && /יוספוס/.test(f.ref) && /מזר/.test(f.ref));
});
test('the lots\' mentor line says it is counting, not luck; the errands point at the works; no Divine Name; no red colour', () => {
  for (const id of ['payis', 'payis2', 'payis3', 'payis4']) assert.ok(/לא מזל/.test(FACTS[id].he), id);
  for (const [tid, wid] of [['g-payis3', 'payis3'], ['g-payis4', 'payis4'], ['g-machar', 'machar'], ['pitum', 'pitum'], ['yachid', 'yachid'], ['etzim', 'etzim'], ['tokim', 'tokim']]) {
    const t = TEMPLATES.find((x) => x.id === tid); assert.ok(t, tid); assert.equal(t.work, wid); assert.ok(!t.game, tid + ' no game'); assert.ok(t.pts > 0 && t.src);
    const w = WORKS[wid]; assert.ok(w, wid); for (const f of ['model', 'begin', 'touch', 'update', 'end', 'box', 'hooks']) assert.equal(typeof w[f], 'function', wid + '.' + f);
  }
  assert.equal(TEMPLATES.find((x) => x.id === 'g-payis3').sheet, 'payis3');
  assert.notEqual(WORKS.payis, undefined);
  for (const f of ['payis.js', 'more.js']) {
    const src = fs.readFileSync(new URL('../src/avodah/works/' + f, import.meta.url), 'utf8').replace(/\b(ref|src): `?'?[^'`]*['`]/g, '');   // (a source like "תענית ד, ה" ends in ה, not a Name)
    assert.ok(!NAME.test(src), f + ' has a Name');
    for (const m of src.matchAll(/'#([0-9A-Fa-f]{6})'/g)) assert.ok(!isRed('#' + m[1]), f + ' red ' + m[0]);
    for (const m of src.matchAll(/'!#([0-9A-Fa-f]{6})'/g)) assert.ok(!isRed('#' + m[1]), f + ' red ' + m[0]);
  }
  const all = JSON.stringify(Object.values(FACTS).map((f) => f.he)) + JSON.stringify(Object.values(PAYIS_WORKS).map((w) => w.fact.he)); assert.ok(!NAME.test(all));
});
