// build 99 — stage 04 after the owner's notes on 96 (gates99.js): the lintel with two hands, a finger on each end, each end on its own
// crane; the leaf turned round its pin by his finger as the crews push (build 98's heavy swing). Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

/** a player: two steady hands (each end held while it is not ahead), or one finger going from the lagging end to the other */
function play(F, i, two) {
  const L = F.createLintel99(i, () => 0.3); let t = 0, cur = 0;
  while (!L.state().done && t < 300) {
    const k = L.state();
    if (k.ph === 'lift' || k.ph === 'over') {
      const ok = k.ph !== 'over' || (Math.abs(k.sx) < 0.15 && Math.abs(k.sv) < 0.3), d = k.ph === 'lift' ? k.e[1].h - k.e[0].h : k.e[1].low - k.e[0].low;
      if (two) { const tl = k.ph === 'lift' ? 0.03 : 0.25; L.hold(0, ok && d > -tl); L.hold(1, ok && d < tl); }
      else { const w = L.want(); if (w >= 0) cur = w; if (Math.abs(d) > (k.ph === 'lift' ? 0.04 : 0.3)) cur = d > 0 ? 0 : 1; for (const e of [0, 1]) L.hold(e, ok && e === cur); }
    }
    L.step(1 / 30); t += 1 / 30;
  }
  return { k: L.state(), t };
}

test('build 99: the lintel — two hands raise it level and set it clean; one finger, end by end, too; one end alone slips', async () => {
  const F = await import('../src/game/gates99.js');
  for (const i of [0, 1]) { const { k, t } = play(F, i, true); assert.ok(k.done, `lintel ${i}`); assert.equal(k.q, 1); assert.equal(k.slips, 0); assert.ok(t < 60, `two hands: ${t.toFixed(0)} s`); }
  for (const i of [0, 1, 2]) { const { k, t } = play(F, i, false); assert.ok(k.done && k.q >= 0.5, `one finger, lintel ${i}`); assert.ok(t > play(F, i, true).t, 'one finger is slower than two'); }
  const A = F.createLintel99(0, () => 0.3); A.hold(0, true); let t = 0; while (A.state().slips === 0 && t < 20) { A.step(1 / 30); t += 1 / 30; }
  assert.ok(A.state().slips === 1 && t < 4, 'one end alone: the stone tilts past the sling and slips');
  assert.ok(F.LINTEL99.L[2].drift > F.LINTEL99.L[0].drift && F.LINTEL99.L[2].slip < F.LINTEL99.L[0].slip, 'each lintel harder');
  // lowered one end all the way: it lands first — uneven
  const B = F.createLintel99(0, () => 0.3); B.hold(0, true); B.hold(1, true); let u = 0; while (B.state().ph !== 'over' && u < 120) { const k = B.state(), d = k.e[1].h - k.e[0].h; B.hold(0, d > -0.03); B.hold(1, d < 0.03); B.step(1 / 30); u += 1 / 30; }
  B.hold(0, false); B.hold(1, false); for (let s = 0; s < 8; s++) B.step(0.5); B.hold(0, true); while (B.state().e[0].low < 1.1 && u < 200) { B.step(1 / 30); u += 1 / 30; } B.hold(1, true); while (!B.state().e[0].down && u < 220) { B.step(1 / 30); u += 1 / 30; }
  assert.equal(B.state().uneven, true, 'an end down before the other');
});

test('build 99: wiring — the flag, every finger on the stone, the leaf on its pin, the old acts out; lines sourced and short', async () => {
  const { LINE42, OUT99, YARD44 } = await import('../src/game/har42.js');
  const h = read('src/game/har42.js');
  assert.match(h, /const ON99 = ON92 && qs\('h99'\) !== '0'/);
  assert.match(h, /J = ON99 \? F99\.createLintel99\(i\) : F92\.createLintel92\(i\)/);
  assert.match(h, /raw: ON99 \? \(ty, id, x, y\) => \{/, 'every finger: the end nearer it');
  assert.match(h, /if \(ON99 && k\.ph === 'swing' && !SW\) \{ const dry = !!OIL && !OIL\.k\.oiled; SW = F98\.createSwing98\(i, 0, \{ dry \}\)/, 'seated, his hand turns the leaf');
  assert.match(h, /m\.play\(push \? 'Push_Loop' : 'Idle', 1\)/, 'the crews push it');
  assert.doesNotMatch(h, /function mkLintel\(\)|function mkLeaf\(idx, heavy\)|function lift47\(/, 'the first acts out');
  assert.deepEqual([...OUT99].slice(0, 3), ['lintel', 'leaf', 'lever']); assert.ok(OUT99.every((p) => YARD44.some((v) => v.part === p)));
  for (const k of ['lintel99', 'lintel99b', 'lintel99c', 'leaf99']) { const t = LINE42[k]; assert.ok(t, k); assert.ok(/המחשה/.test(t), k); assert.ok(t.split(' · ')[0].length <= 50, k); }
  assert.doesNotMatch(read('src/game/gates99.js'), /יהוה|אלוהים/);
});
