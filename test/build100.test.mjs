// build 100 — the oil (the owner, 4.11 13:37–16:34: "אפשר לשמן את הדלת שלא תחרוק?" — "כן. ושאת החריקה ירגישו בנייד"): a jar by the
// socket, poured before the pin goes in; a dry leaf sticks, jerks free and creaks — a grating buzz in the hand — and costs half its grade.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

/** a player who leads the leaf with the finger and pushes harder while it sticks */
function swing(F, i, dry) {
  const S = F.createSwing98(i, 0, { dry }); let phi = 0, t = 0, push = 0; S.grab(phi);
  while (!S.state().done && t < 90) {
    const k = S.state(), rem = S.target() - k.th; push = Math.abs(k.w) < 0.03 ? push + 0.3 / 60 : Math.max(0, push - 1 / 60);
    const want = k.th + Math.sign(rem) * (Math.min(Math.abs(rem), 0.3) + 0.05 + push), d = want - k.tt; phi += Math.sign(d) * Math.min(Math.abs(d), 0.8 / 60); S.drag(phi); S.step(1 / 60); t += 1 / 60;
  }
  return { k: S.state(), t };
}

test('build 100: a dry socket — the leaf sticks, jerks, creaks, takes longer and grades half; oiled, as before', async () => {
  const F = await import('../src/game/nik98.js');
  for (const i of [0, 1]) {
    const w = swing(F, i, false), d = swing(F, i, true);
    assert.ok(w.k.done && d.k.done, `leaf ${i}`); assert.equal(w.k.creaks, 0); assert.equal(w.k.q, 1);
    assert.ok(d.k.creaks >= 5, `dry leaf ${i}: ${d.k.creaks} creaks`); assert.ok(d.t > w.t, 'dry is slower'); assert.equal(d.k.q, 0.5, 'dry: half');
  }
  // held without a lead past the stick, the dry leaf does not move at all
  const S = F.createSwing98(0, 0, { dry: true }); S.grab(0); S.drag(F.DRY100.stick * 0.6); for (let u = 0; u < 2; u += 1 / 60) S.step(1 / 60);
  assert.equal(S.state().th, 0, 'stuck');
  const { HAPTIC42 } = await import('../src/avodah/shift/prefs28.js');
  assert.ok(Array.isArray(HAPTIC42.grate) && HAPTIC42.grate.length >= 5, 'a stutter, felt in the hand');
});

test('build 100: wiring — the flag, the jar in both leaves\' acts, the creak buzzed; lines sourced and short', async () => {
  const { LINE42 } = await import('../src/game/har42.js');
  const h = read('src/game/har42.js');
  assert.match(h, /const ON100 = qs\('h100'\) !== '0'/);
  assert.match(h, /function oil100\(at, off, fy\)/); assert.match(h, /function creak100\(c\) \{ const t = now\(\); if \(t - \(c\.t \|\| 0\) < 0\.3\) return; c\.t = t; buzz42\('grate'\)/);
  assert.equal((h.match(/SW = F98\.createSwing98\(i, 0, \{ dry \}\)/g) || []).length, 2, 'stage 06 and stage 04');
  assert.equal((h.match(/OIL\.near\(a\)\) \{ OIL\.pour\(\); return; \}/g) || []).length, 2);
  for (const k of ['oil100', 'oil100b', 'dry100']) { const t = LINE42[k]; assert.ok(t, k); assert.ok(/המחשה/.test(t), k); assert.ok(t.split(' · ')[0].length <= 50, k); }
});
