// ── recovered (R9) ── build 26c (node): the day's sounds actually play — since build 17 every new sound had gone into audio.js's kit, which
// Phase B never played (src/main.js passes no kit; the shift's is src/avodah/sound.js): createSound now composes both kits on one context
// (one unlock, one mute — bh_avodah_mute), sound.js's name first, each audio.js sound at its measured gain (TRIM26C); the guard that every
// literal sound name the day plays (the report's 63) exists and starts a voice — and that 43 of them made none before; and a scan of every
// recovered file for a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createSound } from '../src/avodah/sound.js';
import { SOUNDS } from '../src/game/audio.js';
import { SWING17 } from '../src/avodah/shift/stations.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const js = (d) => fs.readdirSync(new URL(d, ROOT)).filter((f) => f.endsWith('.js')).map((f) => d + f);
const SHIFT = js('src/avodah/shift/');
// the guard's sources (the 26c report's): shift/, day/, works/, minigames/, index.js and ui.js
const PLAYERS = [...SHIFT, ...js('src/avodah/day/'), ...js('src/avodah/works/'), ...js('src/avodah/minigames/'), 'src/avodah/index.js', 'src/avodah/ui.js'];
// every quoted name inside an sfx( … ) / snd( … ) / sfxPlay( … ) / .sfx.play( … ) call (ctx.sfx, this.sfx; both branches of a ternary; not a
// compared value), the works' { sfx: 'x' }, and the name tables SWING17.sfx and fx18's SND (= SWING17.sfx + lay/kiyor)
function playedNames() {
  const out = new Map(), add = (n, f) => { if (!out.has(n)) out.set(n, f); };
  for (const f of PLAYERS) {
    const s = read(f);
    for (const m of s.matchAll(/\b(?:sfx|snd|sfxPlay)(?:\.play)?\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g)) for (const q of m[1].matchAll(/(===?\s*|!==?\s*)?'([A-Za-z][A-Za-z0-9_]*)'/g)) if (!q[1]) add(q[2], f);
    for (const m of s.matchAll(/\bsfx\s*:\s*'([A-Za-z][A-Za-z0-9_]*)'/g)) add(m[1], f);
  }
  for (const n of Object.values(SWING17.sfx)) add(n, 'src/avodah/shift/stations.js (SWING17.sfx)');
  const snd = /const SND = \{ \.\.\.SWING17\.sfx, ([^}]*)\}/.exec(read('src/avodah/shift/fx18.js'));
  for (const m of snd[1].matchAll(/'([A-Za-z][A-Za-z0-9_]*)'/g)) add(m[1], 'src/avodah/shift/fx18.js (SND)');
  return out;
}
/* a minimal fake WebAudio (hooks-audio.test.mjs's, with the nodes the day kit makes): every voice started counts */
function fakeAudio() {
  const log = { started: 0, bad: [] };
  const param = (v = 0) => ({ value: v, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime(x) { if (!(x > 0)) log.bad.push(x); }, setTargetAtTime() {}, cancelScheduledValues() {} });
  const node = (extra = {}) => ({ connect() {}, disconnect() {}, ...extra });
  class AC {
    constructor() { this.state = 'running'; this.currentTime = 1; this.sampleRate = 8000; this.destination = node(); }
    resume() { this.state = 'running'; return Promise.resolve(); }
    suspend() { return Promise.resolve(); }
    createDynamicsCompressor() { return node({ threshold: param(), ratio: param(), attack: param(), release: param(), knee: param() }); }
    createGain() { return node({ gain: param(1) }); }
    createBiquadFilter() { return node({ type: '', frequency: param(350), Q: param(1), gain: param(0) }); }
    createOscillator() { return node({ type: '', frequency: param(440), detune: param(0), start() { log.started++; }, stop() {} }); }
    createBuffer(ch, n) { const d = new Float32Array(n); return { getChannelData: () => d, length: n }; }
    createBufferSource() { return node({ buffer: null, loop: false, playbackRate: param(1), start() { log.started++; }, stop() {} }); }
    createStereoPanner() { return node({ pan: param(0) }); }
    createDelay() { return node({ delayTime: param(0) }); }
    createConvolver() { return node({ buffer: null }); }
  }
  return { AC, log };
}
/** the names that start no voice on a fake context, through the kit as src/avodah/index.js builds it (createSound({ storage })) */
function silent(names, more) {
  const { AC, log } = fakeAudio(), had = globalThis.AudioContext;
  globalThis.AudioContext = AC; globalThis.__SFX26C = {};
  try {
    const store = new Map(), k = createSound({ storage: { get: (x) => store.get(x) ?? null, set: (x, v) => store.set(x, v) }, more });
    k.unlock(); const none = [];
    for (const n of names) { const v0 = globalThis.__SFX26C.voices[n] | 0; k.play(n, {}); if (!((globalThis.__SFX26C.voices[n] | 0) > v0)) none.push(n); }
    return { none, bad: log.bad };
  } finally { delete globalThis.__SFX26C; if (had === undefined) delete globalThis.AudioContext; else globalThis.AudioContext = had; }
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
// (build 27 added its own names — blade27 … bind27; the 26c report's counts are of the names before it: 63, and 43 of them silent)
const of26c = (names) => [...names].filter((n) => !/27$/.test(n));
test('build 26c: the guard — every literal sound name the day plays (63 in 26c: shift/, day/, works/, minigames/, index.js, ui.js, SWING17.sfx, SND) exists in the composed kit', () => {
  const k = createSound({}), names = playedNames(); assert.equal(of26c(names.keys()).length, 63, [...names.keys()].join(' '));
  const missing = [...names].filter(([n]) => !k.has(n)).map(([n, f]) => `${n} (${f})`); assert.deepEqual(missing, []);
  for (const n of ['unlock20', 'bolt26', 'wick26', 'stamp25', 'scrape21', 'crack22', 'drum23', 'trumpet17', 'split', 'creak']) assert.ok(names.has(n), n);
});
test('build 26c: the guard — each of the 63 starts a voice on a fake WebAudio context; without audio.js\'s kit (26b\'s day) 43 of them made none', () => {
  const names = [...playedNames().keys()];
  const now = silent(names); assert.deepEqual(now.none, []); assert.deepEqual(now.bad, [], 'every exponential ramp stays > 0');
  const before = silent(of26c(names), false); assert.equal(before.none.length, 43, before.none.join(' '));   // (the report: "43 of 63 names make no voice")
  for (const n of ['chord17', 'gate26', 'pour26', 'coin18', 'salt19', 'bolt26', 'wick26']) assert.ok(before.none.includes(n), n);
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
