// build 131 — the saves kept apart per version page (src/game/savekey.js): on …/v/<seg>/… every save key gets ':v<seg>'; anywhere
// else exactly as before.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { verSuffix, saveKey, SAVE_KEYS } from '../src/game/savekey.js';

test('save key: the main site unchanged, a version page suffixed, an artifact page unchanged', () => {
  assert.equal(saveKey('bh_beta2', '/mikdash/'), 'bh_beta2');
  assert.equal(saveKey('bh_beta2', '/mikdash/v/131/'), 'bh_beta2:v131');
  assert.equal(saveKey('bh_beta2', '/mikdash/v/131/index.html'), 'bh_beta2:v131');
  assert.equal(saveKey('bh_beta2', '/code/artifact/3f2a9c1e-77aa-4b1c-9d0e-1a2b3c4d5e6f'), 'bh_beta2');
  assert.equal(saveKey('bh_beta2', ''), 'bh_beta2'); assert.equal(verSuffix('/mikdash/v/131'), '');   // (file://, the probes; no closing slash: none)
  for (const k of ['bh_demo', 'bh_save_k2', 'bh_slots', 'bh_slot', 'bh_settings', 'bh_avodah']) assert.equal(saveKey(k, '/mikdash/v/12b/'), k + ':v12b', k);
  for (const k of ['bh_fx_boot', 'sh.zoom', 'bh_twin_tips', 'bh_avodah_intent', 'bh_stamps', 'bh_seen_moments']) assert.equal(saveKey(k, '/mikdash/v/131/'), k, k);
  assert.ok(SAVE_KEYS.test('bh_beta2'));
});
test('save key: every store of the game and the director\'s reload go through it', () => {
  const rd = (p) => readFileSync(new URL('../src/' + p, import.meta.url), 'utf8');
  for (const p of ['game/state.js', 'avodah/state.js']) { const s = rd(p); for (const f of ['getItem', 'setItem', 'removeItem']) assert.match(s, new RegExp(f + '\\(saveKey\\(k\\)'), p + ' ' + f); }
  assert.match(rd('game/h109/director.js'), /localStorage\.removeItem\(saveKey\('bh_beta2'\)\)/);
  assert.match(rd('game/facts.js'), /localStorage\.getItem\(saveKey\(k\)\)/);
});
