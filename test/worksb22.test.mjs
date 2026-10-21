// ── worksb22 ── node --test test/worksb22.test.mjs — the four works' rules that need no browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tapModel } from '../src/avodah/works/common.js';
import { createGateWork, GATE_KINDS, GATE_STATIONS } from '../src/avodah/works/gate.js';
import { SEALS, ASK } from '../src/avodah/works/seals.js';
import { TRAY_CNT, TRAYS, VESSELS, PER } from '../src/avodah/works/close.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/avodah/works');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'));

test('tapModel: n right taps finish it, a miss never subtracts, the bonus is for a clean one', () => {
  const M = tapModel({ id: 't', n: 3 });
  let calls = 0; M.autoFn = () => { calls++; M.hit(2); };
  M.tap(); M.tap(); assert.equal(M.phase, 'work'); M.tap();
  assert.equal(M.phase, 'end'); assert.equal(calls, 3);
  assert.ok(M.pts >= 120 && M.pts >= M.acts.reduce((s, a) => s + a.pts, 0), 'points only grow');
  for (let i = 0; i < 40; i++) M.step(0.1);
  assert.ok(M.done && M.progress === 100);
  const r = M.result(); assert.ok(r.quality > 0.9 && r.acts === 3);
  const N = tapModel({ id: 't', n: 2 }); N.hit(0); N.hit(0); assert.equal(N.bonuses, undefined, 'no clean bonus after soft acts');
});
test('the gate: the rule of the stations (קדשי קדשים בצפון, קדשים קלים בכל העזרה, קינים אצל פתחיה)', () => {
  const W = createGateWork({});
  assert.ok(W.okAt('olah', 'north') && !W.okAt('olah', 'ramp') && !W.okAt('olah', 'birds'));
  assert.ok(W.okAt('chatat', 'north') && !W.okAt('chatat', 'menachot'));
  assert.ok(W.okAt('shelamim', 'ramp') && W.okAt('shelamim', 'north') && !W.okAt('shelamim', 'birds'));
  assert.ok(W.okAt('kinim', 'birds') && !W.okAt('kinim', 'north'));
  assert.ok(W.okAt('mincha', 'menachot') && !W.okAt('mincha', 'ramp'));
  for (const k in GATE_KINDS) assert.ok(Object.keys(GATE_STATIONS).some((s) => W.okAt(k, s)), k + ' has a place');
  for (const k in GATE_KINDS) assert.match(GATE_KINDS[k].wrong, /לא כאן/);
});
test('the seals: four, each asked for by an animal; every ask has its seal', () => {
  assert.deepEqual(Object.keys(SEALS), ['egel', 'zachar', 'gedi', 'chote']);
  for (const a of ASK) assert.ok(SEALS[a]);
});
test('the vessels: twelve trays, eleven of eight and one of five = 93', () => {
  assert.equal(TRAYS, 12); assert.equal(PER, 8); assert.equal(VESSELS, 93);
  let s = 0; for (let i = 0; i < TRAYS; i++) s += TRAY_CNT(i);
  assert.equal(s, 93); assert.equal(TRAY_CNT(0), 8); assert.equal(TRAY_CNT(11), 5);
});
test('rules: no Divine Name in the works (code and comments), no red material, no gambling words', () => {
  const C = (...c) => String.fromCharCode(...c); const names = [new RegExp(C(0x05D9, 0x05D4, 0x05D5, 0x05D4)), /אלקים/, /אלוקים/, new RegExp(C(0x05D0, 0x05D3, 0x05E0, 0x05D9)), new RegExp(C(0x05E9, 0x05D3, 0x05D9))];   // (the patterns from \u escapes: never written in full, even in a test)
  const bad = [];
  for (const f of files) {
    const t = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const re of names) if (re.test(t)) bad.push(f + ' ' + re);
    for (const m of t.matchAll(/#([0-9A-Fa-f]{6})\b/g)) { const n = parseInt(m[1], 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; if (r > 150 && g < 90 && b < 90) bad.push(f + ' red ' + m[0]); }
    if (/Math\.random|gamble|jackpot|הישור/i.test(t)) bad.push(f + ' random');
  }
  assert.deepEqual(bad, []);
});
