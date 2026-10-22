// ── recovered (R9) ── build 26c (node): the day's sounds actually play — since build 17 every new sound had gone into audio.js's kit, which
// Phase B never played (src/main.js passes no kit; the shift's is src/avodah/sound.js): createSound now composes both kits on one context
// (one unlock, one mute — bh_avodah_mute), sound.js's name first, each audio.js sound at its measured gain (TRIM26C); the guard that every
// literal sound name the shift plays exists; and a scan of every recovered file for a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createSound } from '../src/avodah/sound.js';
import { SOUNDS } from '../src/game/audio.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const SHIFT = fs.readdirSync(new URL('src/avodah/shift/', ROOT)).filter((f) => f.endsWith('.js')).map((f) => 'src/avodah/shift/' + f);
// every quoted name inside an sfx( … ) / snd( … ) / sfx.play( … ) call of the shift's modules (ternaries too; not a compared value)
function playedNames() {
  const out = new Map();
  for (const f of SHIFT) {
    const s = read(f);
    for (const m of s.matchAll(/\b(?:sfx|snd)(?:\.play)?\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g)) for (const q of m[1].matchAll(/(===?\s*|!==?\s*)?'([A-Za-z][A-Za-z0-9_]*)'/g)) { if (!q[1] && !out.has(q[2])) out.set(q[2], f); }   // (not a compared value)
  }
  return out;
}

test('build 26c: the composed kit — sound.js\'s names and audio.js\'s, in one callable kit (has, names, own)', () => {
  const k = createSound({}); assert.equal(typeof k, 'function'); assert.equal(typeof k.play, 'function');
  const names = k.names(); assert.ok(names.length >= 100, String(names.length));
  for (const n of ['ui', 'chime', 'coin', 'chord17', 'gate26', 'pour26', 'near17']) assert.ok(k.has(n), n);
  assert.equal(k.has('no-such-sound'), false);
});
test('build 26c: sound.js\'s own name wins where both kits have it', () => {
  const k = createSound({}); const both = SOUNDS.filter((n) => k.own(n)); assert.ok(both.length >= 1);
  assert.equal(k.own('ui'), true); assert.equal(k.own('chord17'), false);
});
test('build 26c: the guard — every literal sound name the shift plays (sfx/snd in src/avodah/shift/*.js) exists in the composed kit', () => {
  const k = createSound({}), names = playedNames(); assert.ok(names.size >= 40, String(names.size));
  const missing = [...names].filter(([n]) => !k.has(n)).map(([n, f]) => `${n} (${f})`); assert.deepEqual(missing, []);
  for (const n of ['unlock20', 'bolt26', 'wick26', 'stamp25', 'scrape21', 'crack22', 'drum23', 'trumpet17']) assert.ok(names.has(n) || n === 'trumpet17', n);
});
test('build 26c: TRIM26C — each trimmed name is one of audio.js\'s sounds, its gain measured (0 < g ≤ 3: some quiet ones raised)', () => {
  const src = read('src/avodah/sound.js'); const body = /const TRIM26C = \{([^}]*)\}/.exec(src)[1];
  const pairs = [...body.matchAll(/([A-Za-z0-9_]+):\s*([0-9.]+)/g)].map((m) => [m[1], +m[2]]); assert.ok(pairs.length >= 20);
  for (const [n, g] of pairs) { assert.ok(SOUNDS.includes(n) || n === 'choir', n);   // (choir: the held choir, kit.choir())
    assert.ok(g > 0 && g <= 3, `${n} ${g}`); }
});
test('build 26c: one mute — bh_avodah_mute read at the start (and the old bh_mute), written by the kit\'s muted', () => {
  const store = new Map([['bh_avodah_mute', '1']]), storage = { get: (k) => store.get(k) ?? null, set: (k, v) => store.set(k, v) };
  const k = createSound({ storage }); assert.equal(k.muted, true);
  const s2 = new Map([['bh_mute', '1']]); assert.equal(createSound({ storage: { get: (x) => s2.get(x) ?? null, set() {} } }).muted, true);
  try { k.muted = false; } catch (e) { /* no context in node */ } assert.equal(store.get('bh_avodah_mute'), '0');
});
test('build 26c: the counters for the tests (globalThis.__SFX26C) — calls by name; nothing plays before the first gesture', () => {
  globalThis.__SFX26C = {}; const k = createSound({}); k('chord17'); k.play('ui'); k.play('chord17');
  assert.deepEqual({ ...globalThis.__SFX26C.calls }, { chord17: 2, ui: 1 }); assert.equal(globalThis.__SFX26C.voices.chord17 | 0, 0, 'no context, no voice');
  delete globalThis.__SFX26C;
});
test('build 26c: the shift\'s modules pass their sounds to the kit (focus17 builds fx18 with the kit\'s pop; the day\'s sfx is o.sfx.play)', () => {
  assert.match(read('src/avodah/shift/focus17.js'), /createFx18\(\{[^}]*pop: o\.sfx && o\.sfx\.pop/);
  assert.match(read('src/avodah/shift/day33.js'), /o\.sfx && o\.sfx\.play/);
});
test('the recovered files carry no Divine Name (scanned by code points)', () => {
  const N = [[0x5d9, 0x5d4, 0x5d5, 0x5d4], [0x5d0, 0x5dc, 0x5d4, 0x5d9, 0x5dd], [0x5d0, 0x5d3, 0x5e0, 0x5d9], [0x5d0, 0x5dc, 0x5d5, 0x5d4, 0x5d9, 0x5e0, 0x5d5]].map((c) => String.fromCharCode(...c));
  const files = [...SHIFT, 'src/avodah/sound.js', 'src/game/audio.js', 'src/game/twin.js', 'src/avodah/day/world22.js', 'src/animals.js',
    ...fs.readdirSync(new URL('test/', ROOT)).filter((f) => /^(build(1[6-9]|2\d)[a-z]?\.test\.mjs|rig33\.mjs)$/.test(f)).map((f) => 'test/' + f),
    ...['tools/mkout.cjs', 'tools/autoplay35.js', 'tools/autoplay35-run.cjs'].filter((f) => fs.existsSync(new URL(f, ROOT)))];
  assert.ok(files.length >= 30);
  const hits = []; for (const f of files) { const s = read(f); for (const n of N) if (s.includes(n)) hits.push(f); }
  assert.deepEqual(hits, []);
});
