// build 94: stage 06 rebuilt as physical acts (the owner, 3.11 22:12: "תמשיך ל 4-6"; the task doc stage 06: the bronze leaf raised on the
// lever and wedges, a wedge under it while the gap is open; the leaf hung on its pivot; the fifteen steps on their half circle, each note true
// where it lies — מדות ב, ה; the review §3: each act more than once, each time harder). Never a Divine Name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F from '../src/game/nikanor94.js';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const run = (J, sec, dt = 1 / 30) => { for (let t = 0; t < sec; t += dt) J.step(dt); };

/** a good hand on the lever: the pole all the way down, let go, the blow at once */
function goodLever(i) { const J = F.createLever94(i); for (let n = 0; n < 20 && !J.state().done; n++) { J.press(1); run(J, 2); J.letGo(); run(J, 0.1); J.wedge(); } return J.state(); }

test('build 94: the lever — the pole all the way down, let go and strike at once: every wedge in, at every level', () => {
  for (let i = 0; i < 3; i++) { const s = goodLever(i); assert.ok(s.done && !s.crew, `leaf ${i}`); assert.equal(s.q, 1); assert.equal(s.notch, s.n); }
  assert.ok(F.LEVER94.L[1].n >= F.LEVER94.L[0].n && F.LEVER94.L[1].sink > F.LEVER94.L[0].sink && F.LEVER94.L[1].reach < F.LEVER94.L[0].reach, 'the north leaf heavier');
});

test('build 94: the lever — the leaf follows his weight late; let go it sinks, faster the higher it stands; a late blow: a short wedge or none', () => {
  const J = F.createLever94(0); J.press(1); J.step(0.2); assert.ok(J.state().lift > 0 && J.state().lift < J.P.reach, 'it rises after him, heavy');
  run(J, 2); assert.ok(Math.abs(J.state().lift - J.P.reach) < 1e-9);
  const v0 = J.sinkV(); J.letGo(); run(J, 0.1); assert.equal(J.wedge(), 'in');
  J.press(1); run(J, 2); J.letGo(); run(J, 3); assert.equal(J.state().misses, 1, 'he waited: it sank back'); assert.ok(J.sinkV() > v0, 'faster a wedge higher');
  J.press(0.55); run(J, 2); J.letGo(); assert.equal(J.wedge(), 'short', 'the gap too small: it springs out'); assert.equal(J.state().shorts, 1);
  J.press(0.2); run(J, 2); assert.equal(J.wedge(), 'low'); assert.equal(J.state().lows, 1, 'said, not counted');
  const B = F.createLever94(2); for (let n = 0; n < 12 && !B.state().done; n++) { B.press(1); run(B, 2); B.letGo(); run(B, 3); }
  assert.ok(B.state().done && B.state().crew && B.state().q === 0, 'five failures: the crews lift it');
});

test('build 94: the steps — slid to the line and let go still: five true notes, at every level; the tune climbs', () => {
  for (let i = 0; i < 3; i++) {
    const S = F.createSteps94(i);
    for (let n = 0; n < 12 && !S.state().done; n++) { S.grab(); S.drag(0); run(S, 3); S.letGo(); for (let q = 0; q < 60; q++) if (S.step(1 / 30)) break; }
    const k = S.state(); assert.ok(k.done && k.q === 1 && k.offs === 0, `part ${i}`); assert.deepEqual(k.notes.map((n) => n.cents), [0, 0, 0, 0, 0]);
    assert.deepEqual(k.notes.map((n) => n.deg), [0, 1, 2, 3, 4].map((j) => F.deg94(5 * i + j)));
  }
  assert.ok(F.freq94(F.deg94(14)) > F.freq94(F.deg94(0)), 'up the steps, up the tune');
  assert.ok(F.STEPS94.L[2].tol < F.STEPS94.L[0].tol && F.STEPS94.L[2].mu < F.STEPS94.L[0].mu, 'each part harder');
});

test('build 94: the steps — let go while it moves and it rolls on: it rocks off the line; a little off, it lies but its note is off', () => {
  const S = F.createSteps94(1); S.grab(); S.drag(0); run(S, 0.15); S.letGo(); let r = null; for (let q = 0; q < 300 && !r; q++) r = S.step(1 / 30);
  assert.equal(r, 'rock'); assert.equal(S.state().offs, 1); assert.equal(S.state().j, 0, 'not laid: slide it again');
  const O = F.createSteps94(0); O.grab(); O.drag(0.4); run(O, 3); assert.notEqual(O.hum(), 0, 'off the line: the hum is off'); O.letGo(); r = null; for (let q = 0; q < 60 && !r; q++) r = O.step(1 / 30);
  assert.equal(r, 'off'); assert.ok(O.state().notes[0].cents !== 0); assert.equal(O.state().qs[0], 0.5);
  const T = F.createSteps94(0); T.grab(); T.drag(0); run(T, 3); assert.equal(T.hum(), 0, 'on the line: true');
});

test('build 94: wiring — the parts, the order, the acts in the world; lines sourced and short', async () => {
  const { LINE42, PARTS94 } = await import('../src/game/har42.js');
  const { DEP63, open63 } = await import('../src/game/site63.js');
  assert.deepEqual([...PARTS94], ['open', 'voyage', 'lever', 'hang', 'lever2', 'hang2', 'steps', 'steps2', 'steps3', 'reveal']);
  assert.deepEqual(open63('nikanor94', PARTS94, ['voyage', 'lever', 'hang']), ['lever2', 'steps']);
  assert.ok(DEP63.nikanor, 'the old order kept for ?h94=0');
  const h = read('src/game/har42.js');
  assert.match(h, /const ON94 = MODE === 'stage' && STG === 'nikanor' && qs\('h94'\)/);
  for (const f of ['props94', 'mkLever94', 'mkHang94', 'mkSteps94']) assert.match(h, new RegExp(`function ${f}\\(`), f);
  assert.doesNotMatch(h.slice(h.indexOf('function mkSteps94('), h.indexOf('// ── /build 94 ──')), /dragItem|createElement\('button'\)|'button'\)/, 'the steps: no side button — the stone in the world');
  for (const k of ['lever94', 'lever94b', 'lever94c', 'lever94d', 'hang94', 'steps94', 'steps94b', 'steps94c']) { const t = LINE42[k]; assert.ok(t, k); assert.ok(/המחשה|מדות|טיוטה/.test(t), k); assert.ok(t.split(' · ')[0].length <= 50, `${k} head ${t.split(' · ')[0].length}`); }
});
