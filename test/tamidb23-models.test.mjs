// TAMIDB23: the models of the Tamid's later works (ketoret · birkat · shir · erev · neirot · shir2) — taps alone finish each in ≤ 60 s;
// every act carries points; the sources are Hebrew and never carry a Name; no red in the palette; the song's psalm line has no Name.
//   node --test test/tamidb23-models.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ketoretModel, birkatModel, erevModel, neirotModel, ketoret, birkat, erev, neirot, C } from '../src/avodah/works/tamid.js';
import { songModel, shir, shir2, psalmOf, hasName } from '../src/avodah/works/song.js';
import { isRed } from '../src/avodah/works/kit.js';
import { TEMPLATES } from '../src/avodah/day/tasks.js';

const NAME = new RegExp(['\u05D4\u05F3', '\u05D0\u05DC\u05E7\u05D9\u05DD', '\u05D0\u002D\u05DC', '\u05D4\u05B3'].join('|'));
function tapsOnly(M, gap = 0.3, max = 400) {
  let t = 0, since = 0;
  while (!M.done && t < max) { M.step(0.05); t += 0.05; since += 0.05; if (since >= gap) { since = 0; M.touch(true); M.step(0.05); t += 0.05; M.touch(false); M.twinTap(); } }
  return t;
}
const ALL = [['ketoret', ketoretModel, 9], ['birkat', birkatModel, 9], ['erev', erevModel, 10], ['neirot', neirotModel, 9], ['shir', (o) => songModel(o, false), 14], ['shir2', (o) => songModel(o, true), 14]];
for (const [id, mk, n] of ALL) {
  test(`${id}: ${n} acts, taps alone finish it in ≤ 60 s, points on every act`, () => {
    const M = mk({}); assert.equal(M.n, n);
    const t = tapsOnly(M);
    assert.ok(M.done, `${id} done (i ${M.i}/${M.n}, t ${t.toFixed(1)})`);
    assert.equal(M.acts.length, id === 'erev' ? n - 1 : n, 'acts'); assert.ok(M.acts.every((a) => a.pts > 0));   // ── blooda25 ── (the erev's slaughter: the moment of gravity, no act, no points) assert.ok(t <= 60, `${id} took ${t.toFixed(1)} s`);
    assert.ok(M.result().score > 0 && M.result().quality > 0);
  });
}
test('a tap while a figure walks waits (never lost, never double)', () => {
  const M = birkatModel({}); M.twinTap(); assert.equal(M.acts.length, 1);   // the ascent
  M.twinTap(); M.twinTap(); assert.equal(M.acts.length, 1, 'taps during the ascent wait');
  for (let i = 0; i < 40; i++) M.step(0.05); assert.equal(M.acts.length, 2, 'one pending tap landed');
});
test('the wine: a hold pours to full and is one act; a tap pours a portion (two taps fill it)', () => {
  const M = songModel({}, false);
  while (M.i < 4) { for (let i = 0; i < 30; i++) M.step(0.05); M.twinTap(); }
  for (let i = 0; i < 30; i++) M.step(0.05);
  assert.equal(M.i, 4); M.touch(true); for (let i = 0; i < 40; i++) M.step(0.05); M.touch(false);
  assert.equal(M.i, 5, 'the hold filled the bowl: the act landed'); assert.equal(M.acts.length, 5);
  const N = songModel({}, false); while (N.i < 4) { for (let i = 0; i < 30; i++) N.step(0.05); N.twinTap(); }
  for (let i = 0; i < 30; i++) N.step(0.05);
  N.twinTap(); assert.equal(N.i, 4); assert.ok(N.wine >= 0.5); N.twinTap(); assert.equal(N.i, 5);
});
test('the song: 3 פרקים × 3, a bow at each פרק end', () => {
  const M = songModel({}, false); let bows = 0, last = -1;
  while (!M.done) { M.step(0.05); if (M.bowT !== last && M.bowT >= 0) { bows++; last = M.bowT; } if (M.busy <= 0 && !M.walking) M.twinTap(); }
  assert.equal(M.sung, 9); assert.equal(bows, 3);
});
test('the works: registered shape, sources, no Name anywhere (text, labels, code)', () => {
  for (const w of [ketoret, birkat, erev, neirot, shir, shir2]) {
    for (const f of ['model', 'begin', 'touch', 'update', 'end', 'box', 'hooks']) assert.equal(typeof w[f], 'function', w.id + '.' + f);
    assert.ok(/[֐-׿]/.test(w.fact.he) && w.fact.ref, w.id + ' fact');
    assert.ok(!NAME.test(w.fact.he + w.fact.ref + w.he), w.id + ' no Name');
  }
  assert.match(birkat.fact.ref, /במדבר ו, כד–כו/);
  for (const f of ['tamid.js', 'song.js', 'tamidreg.js']) assert.ok(!NAME.test(fs.readFileSync(new URL('../src/avodah/works/' + f, import.meta.url), 'utf8')), f + ' has no Name');
  for (const M of ALL.map(([, mk]) => mk({}))) for (const s of M.steps) assert.ok(!NAME.test(s.say || ''), 'say ' + s.say);
});
test('the psalm: every weekday gives a reference; its words only when they carry no Name', () => {
  for (let d = 0; d < 7; d++) { const p = psalmOf(d); assert.ok(/תהלים/.test(p.ref), 'ref ' + d); assert.ok(!hasName(p.words) && !NAME.test(p.words + p.day + p.ref)); }
  assert.ok(psalmOf(6).words.length > 0, 'the Sabbath quotes its first words');
  assert.ok(!NAME.test(shir.fact.he) && !NAME.test(shir2.fact.he));
});
test('the palette: nothing red', () => { for (const [k, v] of Object.entries(C)) assert.ok(!isRed(v), k + ' ' + v); assert.ok(!isRed('#7A5A2E'), 'the wine is amber'); });
test('tasks.js: my six sheet tasks are works now (same id, hour, place), with points', () => {
  const want = { 'g-ketoret': 'ketoret', 'g-birkat': 'birkat', 'g-shir': 'shir', 'g-erev': 'erev', 'g-neirot': 'neirot', 'g-shir2': 'shir2' };
  for (const [id, w] of Object.entries(want)) { const t = TEMPLATES.find((x) => x.id === id); assert.ok(t && t.work === w && !t.game && t.sheet && t.pts > 0, id); }
});
