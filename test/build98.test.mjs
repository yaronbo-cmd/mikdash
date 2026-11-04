// build 98 — stage 06 after the owner's notes on 96 (nik98.js): the leaf turned round its pivot, heavy, to its stop and back into its jamb
// without a bang; the steps rise ring by ring round a core, the crews lay each ring and his is its key stone on the hoist; the model's own
// steps shown as far as they are laid, the core under the gate's landing (no leaf, pillar or man in the air). Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('build 98: the leaf — a gentle hand opens and shuts it clean; a yank bangs it', async () => {
  const F = await import('../src/game/nik98.js');
  for (const i of [0, 1]) {
    const S = F.createSwing98(i); let phi = 0, t = 0; S.grab(phi);
    while (!S.state().done && t < 60) { const k = S.state(), d = S.target() - k.tt; phi += Math.sign(d) * Math.min(Math.abs(d), 0.35 / 60); S.drag(phi); S.step(1 / 60); t += 1 / 60; }
    assert.ok(S.state().done, `leaf ${i} done`); assert.equal(S.state().bangs, 0); assert.equal(S.state().q, 1);
    const B = F.createSwing98(i); B.grab(0); B.drag(3); for (let u = 0; u < 3; u += 1 / 60) B.step(1 / 60);
    assert.ok(B.state().bangs >= 1, `leaf ${i}: yanked, it bangs on its stop`);
  }
  // let go while it swings: it keeps going (heavy), the north leaf longer
  const coast = (i) => { const S = F.createSwing98(i); S.grab(0); S.drag(0.5); for (let u = 0; u < 0.5; u += 1 / 60) S.step(1 / 60); S.let(); const th0 = S.state().th; for (let u = 0; u < 1; u += 1 / 60) S.step(1 / 60); return S.state().th - th0; };
  assert.ok(coast(0) > 0.05 && coast(1) > coast(0), 'it swings on when let go, the heavy one further');
  // round the pivot any number of turns: the angle unwraps
  const R = F.createSwing98(0); R.grab(3.1); R.drag(-3.1); assert.ok(Math.abs(R.state().tt - 0.083) < 0.01, 'across ±π the finger goes on round');
});

test('build 98: the steps — rings of stones, the key in the middle, the hoist sets it', async () => {
  const F = await import('../src/game/nik98.js');
  for (let k = 0; k < 15; k++) { const n = F.ringN98(k); assert.ok(n % 2 === 1 && n >= 7, `ring ${k}: ${n}`); assert.equal(F.order98(k).length, n - 1); assert.ok(!F.order98(k).includes(F.key98(k))); assert.ok(Math.abs(F.angle98(k, F.key98(k))) < 1e-9, 'the key due east'); }
  assert.equal(F.Rout98(F.jOf98(0)), 13.5); assert.equal(F.Rout98(F.jOf98(14)), 6.5); assert.equal(F.top98(14), 7.5);
  for (const i of [0, 1, 2]) for (const s of [0, 4]) {
    const H = F.hoist98(F.spec98(i, s, () => 0.7)); let t = 0;
    while (t < 90) { const k = H.state(); if (k.ph === 'seated' || k.ph === 'broken') break; const off = k.r - Math.round(k.r / Math.PI) * Math.PI; H.twistBy(-off * 0.2, 1 / 60); const calm = Math.abs(k.x) < 0.05 && Math.abs(k.z) < 0.05 && Math.abs(off) < 0.05; H.step(1 / 60, calm || k.yb > 0.75 ? 0.25 / 60 : 0, { x: -k.x * 2 - k.vx * 0.6, z: -k.z * 2 - k.vz * 0.6 }, true); t += 1 / 60; }
    assert.equal(H.state().ph, 'seated', `part ${i} stone ${s}`); assert.equal(F.stoneQ98({ jams: H.state().jams, chip: H.state().chip }), 1);
  }
  // dropped straight down, fast, unsteadied: it knocks on its neighbours or breaks
  const D = F.hoist98(F.spec98(2, 4, () => 0.9)); let t = 0; while (t < 20 && D.state().ph === 'hang') { D.step(1 / 60, 2.2 / 60, 0, false); t += 1 / 60; }
  assert.ok(D.state().jams > 0 || D.state().ph === 'broken' || D.state().chip, 'a careless drop is not clean');
  assert.equal(F.partQ98([1, 1, 1, 1, 1]), 1); assert.equal(F.partQ98([1, 0.5, 0.5, 1, 0]), 0.5); assert.equal(F.partQ98([0, 0, 0.5, 0, 0]), 0);
  assert.equal(F.laid98(1, 3), 8); assert.equal(F.laid98(3, 2), 15);
});

test('build 98: wiring — the flag, the core and the cut, the acts; lines sourced and short', async () => {
  const { LINE42 } = await import('../src/game/har42.js');
  const h = read('src/game/har42.js');
  assert.match(h, /const ON98 = ON94 && qs\('h98'\) !== '0'/);
  for (const f of ['cut98', 'props98', 'mkSteps98', 'ringStone98', 'swSign98', 'swingView98']) assert.match(h, new RegExp(`function ${f}\\(`), f);
  assert.match(h, /steps: \{ begin\(\) \{ st\.job = ON94 \? mkSteps98\(0\)/);
  assert.match(h, /if \(ON98\) cut98\(laidNow98\(\)\); else hole49\(past63\('hang'\) \? 'steps' : 'door'\)/, 'the stage opens with the steps as far as laid, the core under the landing');
  assert.match(h, /if \(ON98 && k\.ph === 'swing' && !SW\) \{ const dry = !!OIL && !OIL\.k\.oiled; SW = F98\.createSwing98\(i, 0, \{ dry \}\)/, 'seated, his hand turns the leaf');
  assert.match(h, /k0\.x = Math\.abs\(k0\.x\)/, 'the leaf comes in from the court, beside the other, not behind it');
  assert.doesNotMatch(h, /function mkLever49\(|function mkHang49\(|function mkSteps94\(/, 'the old acts out');
  for (const k of ['steps98', 'steps98crew', 'steps98jam', 'steps98brk', 'swing98a', 'swing98b', 'swing98bang']) { const t = LINE42[k]; assert.ok(t, k); assert.ok(/המחשה/.test(t), k); assert.ok(t.split(' · ')[0].length <= 50, k); }
  assert.doesNotMatch(read('src/game/nik98.js'), /יהוה|אלוהים/);
});
