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
  assert.match(rd('game/facts.js'), /localStorage\.getItem\(verKey\(k\)\)/);
});
test('save key: the loading screen\'s fact reads the save of its own version page (its parameter saveKey must not hide the key function)', async () => {
  const { bootFact } = await import('../src/game/facts.js');
  const got = [], put = [];
  const mem = { 'bh_beta2:v131': JSON.stringify({ fx: { seen: [], last: '' }, st: {} }) };
  const ls = { getItem(k) { got.push(k); return k in mem ? mem[k] : null; }, setItem(k, v) { put.push(k); mem[k] = String(v); }, removeItem(k) { delete mem[k]; } };
  const had = { ls: Object.getOwnPropertyDescriptor(globalThis, 'localStorage'), loc: Object.getOwnPropertyDescriptor(globalThis, 'location'), doc: Object.getOwnPropertyDescriptor(globalThis, 'document') };
  const box = { style: {}, className: '', innerHTML: '' };
  const el = { querySelector: () => null, appendChild() {} };
  Object.defineProperty(globalThis, 'localStorage', { value: ls, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'location', { value: { pathname: '/mikdash/v/131/' }, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'document', { value: { createElement: () => box }, configurable: true, writable: true });
  try {
    const f = bootFact(el);
    assert.ok(f && f.id, 'a fact is shown');
    assert.ok(got.includes('bh_beta2:v131'), 'the save is read under the version page\'s key: ' + got.join(','));
    assert.ok(!got.includes('bh_beta2'), 'the main site\'s save is not read');
    assert.ok(put.includes('bh_fx_boot'), 'the shown fact is remembered: ' + put.join(','));
  } finally {
    for (const [k, n] of [['ls', 'localStorage'], ['loc', 'location'], ['doc', 'document']]) { if (had[k]) Object.defineProperty(globalThis, n, had[k]); else delete globalThis[n]; }
  }
});
