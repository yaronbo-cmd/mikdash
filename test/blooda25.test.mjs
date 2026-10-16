// BLOODA25 (DAM25): the blood's palette and red test, the moment of gravity, the Tamid's blood acts (zerika, erev), the drying, the amah's hue.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BLOOD, isBloodHex, isRed, isRedHue, markStage, amahTint, nextDawn, GRAVE, graveStart, graveStep } from '../src/avodah/works/blood.js';
import { isRed as kitRed } from '../src/avodah/works/kit.js';
import { zerikaModel, ZDUR } from '../src/avodah/works/dawn2.js';
import { erevModel, EV_I } from '../src/avodah/works/tamid.js';

const run = (M, sec) => { for (let t = 0; t < sec; t += 0.05) M.step(0.05); };
test('the palette: one source; the hue test catches the dark reds the old r ≥ 140 test missed; the palette is not "forbidden"', () => {
  for (const h of ['#5A1418', '#4C0B0E', '#8E2A22', '#A3261F', '#B8222C']) assert.ok(isRedHue(h), h);
  for (const h of [BLOOD.wet, BLOOD.mark, BLOOD.line, BLOOD.dry]) { assert.ok(isBloodHex(h), h); assert.equal(isRed(h), false, h); }
  assert.ok(isRed('#A3261F') && isRed('#B8222C'), 'a free red is forbidden');
  assert.equal(isRedHue(BLOOD.ember), false, 'the coals are orange'); assert.equal(isRedHue(BLOOD.dry), false, 'dry is brown');
  assert.ok(isBloodHex('#4E0D10'), 'a GPU round-trip of wet still reads as the palette');
  assert.equal(kitRed('#A3261F'), true); assert.equal(kitRed(BLOOD.mark), false);
  // no other works file defines a blood colour of its own
  for (const f of fs.readdirSync('src/avodah/works')) {
    if (f === 'blood.js') continue; const s = fs.readFileSync('src/avodah/works/' + f, 'utf8');
    for (const m of s.matchAll(/'!?#([0-9A-Fa-f]{6})'/g)) assert.ok(!isRedHue('#' + m[1]), `${f}: a free red #${m[1]}`);
  }
});
test('the moment of gravity: the slaughter pays nothing, sounds one deep tone (not a chime), 1.2 s in which a tap is swallowed', () => {
  const M = zerikaModel({});
  for (let i = 0; i < 2; i++) { M.twinTap(); run(M, ZDUR[i] + 0.1); }
  assert.equal(M.i, 2); const acts0 = M.acts.length, pts0 = M.pts;
  M.fx.length = 0; M.twinTap(); run(M, ZDUR[2] + 0.06);
  assert.equal(M.i, 3, 'the screen act is done'); assert.ok(M.grave > 0 && M.grave <= GRAVE.dur, 'the stillness is on');
  assert.equal(M.acts.length, acts0, 'no act'); assert.equal(M.pts, pts0, 'no points');
  assert.ok(M.fx.some((f) => f.sfx === 'grave'), 'the deep tone'); assert.ok(!M.fx.some((f) => f.sfx === 'chime' || f.act), 'no chime, no "+N"');
  assert.ok(/הדם הוא העבודה/.test(M.say), 'the mentor line');
  M.twinTap(); run(M, 0.3); assert.equal(M.i, 3); assert.equal(M.pending, 0, 'a tap now is swallowed');
  run(M, 1.2); assert.equal(M.grave, 0); assert.equal(M.i, 3, 'nothing moved on by itself');
  M.twinTap(); run(M, ZDUR[3] + 0.1); assert.equal(M.i, 4); assert.equal(M.vessel, 1); assert.equal(M.fill, 0.7, 'the vessel comes with the liquid at 0.7');
  assert.equal(M.acts.length, acts0 + 1, 'the first "+N" is the receiving');
});
test('the morning zerika: 7 acts by taps alone — receiving, NE then SW below the line, the four faces glow, the rest on the yesod', () => {
  const M = zerikaModel({}); assert.equal(M.n, 7);
  let t = 0; while (!M.done && t < 60) { M.twinTap(); M.step(0.05); t += 0.05; }
  assert.ok(M.done, 'done by taps'); assert.deepEqual(M.given, [true, true]); assert.equal(M.poured, 1); assert.equal(M.fill, 0);
  assert.equal(M.acts.length, 6, 'six acts: the slaughter pays nothing'); assert.equal(M.graveN, 1);
  const N = zerikaModel({}); for (let i = 0; i < 6; i++) { N.twinTap(); run(N, (ZDUR[i] || 0.5) + (i === 2 ? 1.4 : 0.1)); }
  assert.equal(N.i, 6); assert.ok(N.glowT > 0 || N.given[1], 'after SW the glow'); assert.equal(N.bloom[0], 1, 'the Γ bloomed (0.35 s)');
  N.touch(true); N.twinTap(); run(N, 1.0); N.touch(false); assert.ok(N.done || N.poured, 'a hold pours the rest');
});
test('the evening Tamid: 10 acts at the afternoon ring; its slaughter is the moment of gravity; receiving, NE, SW, the yesod', () => {
  const M = erevModel({}); assert.equal(M.n, 10);
  let t = 0; while (M.i <= EV_I.grave && t < 20) { M.twinTap(); M.step(0.05); t += 0.05; }
  assert.equal(M.i, EV_I.receive); assert.ok(M.grave > 0); assert.equal(M.acts.length, 1, 'only the lamb so far');
  while (!M.done && t < 80) { M.twinTap(); M.step(0.05); t += 0.05; }
  assert.ok(M.done); assert.equal(M.acts.length, 9); assert.deepEqual(M.given, [1, 1]); assert.ok(M.pourT > 0); assert.equal(M.fill, 0);
  const src = fs.readFileSync('src/avodah/works/places24.js', 'utf8'); assert.ok(/EV_RING = TAMID_AFTERNOON/.test(src), 'the erev at TAMID_RING.afternoon');
});
test('the drying: wet 20′ → dry to 90′ → a trace; gone at the next dawn; the amah pales east of the holes', () => {
  assert.equal(markStage(5).stage, 'wet'); assert.equal(markStage(5).hex, BLOOD.mark);
  assert.equal(markStage(40).stage, 'dry'); assert.equal(markStage(40).hex, BLOOD.dry);
  assert.equal(markStage(200).stage, 'trace'); assert.ok(markStage(200).k <= 0.15 && markStage(200).k >= 0.12);
  const born = 700; assert.equal(nextDawn(born), 1440 + 600); assert.equal(nextDawn(300), 600);
  assert.equal(amahTint(-54.6), 0.35); assert.ok(Math.abs(amahTint(-26) - 0.12) < 1e-9); assert.ok(Math.abs(amahTint(-4) - 0.04) < 1e-9);
  assert.equal(amahTint(0), 0); assert.equal(amahTint(277), 0, 'the outlet: clear water');
  for (let x = -54; x < 0; x += 3) assert.ok(amahTint(x) <= amahTint(x - 3) + 1e-9, 'paler eastward');
});
test('gravity helpers alone (a chain step), and no Divine Name in the new files', () => {
  const M = { t: 0, fx: [], pending: 1 }; graveStart(M); assert.equal(M.pending, 0); assert.equal(M.fx[0].sfx, 'grave');
  assert.equal(graveStep(M, 0.6), true); assert.equal(graveStep(M, 0.7), true); assert.equal(graveStep(M, 0.1), false);
  const NAME = new RegExp(['\\u05D9\\u05D4\\u05D5\\u05D4', '\\u05D0\\u05DC\\u05D4\\u05D9\\u05DD', '\\u05D4\\u05F3(?![\\u05D0-\\u05EA])'].join('|'));
  for (const f of ['src/avodah/works/blood.js', 'src/avodah/works/bloodteach.js', 'test/blooda25.test.mjs']) assert.ok(!NAME.test(fs.readFileSync(f, 'utf8')), f);
  const s = fs.readFileSync('src/avodah/sound.js', 'utf8') + fs.readFileSync('src/game/audio.js', 'utf8'); assert.ok(/grave\(t/.test(s), 'the grave sound exists');
});
