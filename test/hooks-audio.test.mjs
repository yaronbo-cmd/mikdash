// FUN (wave 6): the audio + juice kit plays every published name on a fake WebAudio context, never throws,
// keeps the old API (play/ambience/unlock/muted) and routes PEOPLE's contact and WATER's events to sounds.
// Run: node --test test/hooks-audio.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

/* a minimal fake WebAudio: records every node started, checks every ramp gets a positive value */
function fakeAudio() {
  const log = { started: 0, bad: [] };
  const param = (v = 0) => ({
    value: v,
    setValueAtTime(x) { if (!Number.isFinite(x)) log.bad.push('set ' + x); },
    linearRampToValueAtTime(x) { if (!Number.isFinite(x)) log.bad.push('lin ' + x); },
    exponentialRampToValueAtTime(x) { if (!(x > 0) || !Number.isFinite(x)) log.bad.push('exp ' + x); },
    setTargetAtTime(x) { if (!Number.isFinite(x)) log.bad.push('tgt ' + x); },
    cancelScheduledValues() {},
  });
  const node = (extra = {}) => ({ connect() {}, disconnect() {}, ...extra });
  class AC {
    constructor() { this.state = 'running'; this.currentTime = 1; this.sampleRate = 8000; this.destination = node(); }
    resume() { this.state = 'running'; return Promise.resolve(); }
    createDynamicsCompressor() { return node({ threshold: param(), ratio: param(), attack: param(), release: param() }); }
    createGain() { return node({ gain: param(1) }); }
    createBiquadFilter() { return node({ type: '', frequency: param(350), Q: param(1) }); }
    createOscillator() { return node({ type: '', frequency: param(440), start() { log.started++; }, stop() {} }); }
    createBuffer(ch, n) { const d = new Float32Array(n); return { getChannelData: () => d }; }
    createBufferSource() { return node({ buffer: null, loop: false, start() { log.started++; }, stop() {} }); }
  }
  return { AC, log };
}

test('every published sound plays, the kit is callable, the old API stays', async () => {
  const { AC, log } = fakeAudio();
  globalThis.AudioContext = AC;
  try {
    const { createAudio, SOUNDS, BEDS } = await import('../src/game/audio.js');
    const store = new Map();
    const sfx = createAudio({ storage: { get: (k) => store.get(k), set: (k, v) => store.set(k, v) } });
    assert.equal(typeof sfx, 'function');
    for (const k of ['play', 'ambience', 'unlock', 'flow', 'water', 'bindWater', 'impact', 'bindHero', 'haptic', 'shake', 'pop', 'has']) assert.equal(typeof sfx[k], 'function', k);
    assert.equal(sfx.muted, false);
    sfx.unlock();
    for (const name of SOUNDS) {
      assert.ok(sfx.has(name), name);
      const before = log.started;
      sfx.play(name, { combo: 3, n: 4, step: 2, kind: 'bomb', stone: 'hard', tool: 'iron', force: 1, mass: 1, tension: 1 });
      assert.ok(log.started > before, 'no sound for ' + name);
      sfx(name, {});                                          // the callable form, default options
    }
    for (const bed of BEDS) sfx.ambience(bed);
    sfx.ambience(null);
    sfx.flow(0.5); sfx.flow(0);
    assert.deepEqual(log.bad, [], 'every ramp value is finite and exponential ramps stay > 0');
    // mute is remembered and silences play
    sfx.muted = true;
    assert.equal(store.get('bh_mute'), '1');
    const n = log.started; sfx.play('hammer'); assert.equal(log.started, n);
    sfx.muted = false;
    // an unknown name is a no-op, never a throw
    sfx.play('no-such-sound'); sfx('nope');
    assert.equal(sfx.has('nope'), false);
  } finally { delete globalThis.AudioContext; }
});

test('PEOPLE contact and WATER events become sounds; the binders are guarded', async () => {
  const { AC, log } = fakeAudio();
  globalThis.AudioContext = AC;
  try {
    const { createAudio } = await import('../src/game/audio.js');
    const sfx = createAudio({});
    sfx.unlock();
    let cb = null;
    const off = sfx.bindHero({ onImpact(f) { cb = f; return () => { cb = null; }; } });
    assert.equal(typeof cb, 'function');
    for (const kind of ['dress', 'tamp', 'split', 'pick', 'measure', 'pull', 'carry']) {
      const n = log.started; cb({ kind, quality: kind === 'dress' ? 'perfect' : 'good' }); assert.ok(log.started > n, kind);
    }
    off();
    assert.equal(cb, null);
    assert.equal(typeof sfx.bindHero(null), 'function');                    // no hero → a no-op unbinder
    assert.equal(typeof sfx.bindHero({ onImpact() { throw new Error('x'); } }), 'function');
    let wcb = null;
    sfx.bindWater({ onEvent(f) { wcb = f; return () => {}; } });
    for (const ev of ['tap-open', 'wash-splash', 'pour-start', 'pour-end', 'mukhni-start', 'tap-close']) {
      const n = log.started; wcb(ev, { kind: ev, spigots: 6 }); if (ev !== 'tap-close') assert.ok(log.started > n, ev);
    }
    wcb('channel', { kind: 'channel', on: true });
    assert.equal(typeof sfx.bindWater({}), 'function');
  } finally { delete globalThis.AudioContext; }
});

test('no AudioContext (node, old browsers): everything is a silent no-op', async () => {
  const { createAudio, createJuice } = await import('../src/game/audio.js');
  const sfx = createAudio({});
  sfx.unlock(); sfx.play('hammer'); sfx('m3win'); sfx.ambience('site'); sfx.flow(1);
  sfx.water({ kind: 'tap-open' }); sfx.impact({ kind: 'dress' });
  sfx.haptic(10); sfx.shake(null); sfx.pop('+3', 10, 10, 'stone');
  const J = createJuice({ settings: () => ({ haptics: false }) });
  J.haptic([10, 20]); J.pop('x', 0, 0);
  assert.equal(sfx.running, false);
});

test('one sound per blow, at contact: PEOPLE\'s real payload; the late generic strike is dropped; the first game binds once', async () => {
  const { AC, log } = fakeAudio();
  globalThis.AudioContext = AC;
  try {
    const { createAudio } = await import('../src/game/audio.js');
    const { runMinigame } = await import('../src/game/minigames/index.js');
    const sfx = createAudio({});
    sfx.unlock();
    let n = log.started; sfx.play('strike'); assert.ok(log.started > n, 'unbound: the game\'s strike sounds');
    let cb = null, binds = 0, wbinds = 0;
    const hero = { onImpact(f) { binds++; cb = f; return () => { cb = null; }; } };
    const world = { stages: { hero, nextSlot: () => null }, water: { onEvent() { wbinds++; return () => {}; } } };
    await runMinigame('plumb', { world, site: 'har', sfx });                 // no DOM: a calm result, but the sound is bound
    await runMinigame('crane', { world, site: 'har', sfx });
    assert.equal(binds, 1, 'bound once'); assert.equal(wbinds, 1, 'water bound once');
    // PEOPLE's info: { kind, tool, x, y, z, target, quality: 'normal'|'perfect'|'combo', t, workpiece }
    for (const info of [{ kind: 'dress', tool: 'hammer', target: { site: 'har' }, quality: 'perfect', workpiece: null },
      { kind: 'chisel', tool: 'chisel', target: 'wall', quality: 'normal', workpiece: 'drafted' },
      { kind: 'split', tool: 'sledge', target: 'har', quality: 'normal', workpiece: 'quarry' },
      { kind: 'tamp', tool: 'mallet', target: 'yesod', quality: 'normal', workpiece: 'field' }]) {
      n = log.started; cb(info); assert.ok(log.started > n, info.kind);
    }
    n = log.started; sfx.play('strike'); assert.equal(log.started, n, 'right after a contact the generic strike is silent');
    n = log.started; sfx.play('perfect', { combo: 2 }); assert.ok(log.started > n, 'a perfect keeps its chime');
    n = log.started; sfx.ambience(null); assert.ok(log.started > n, 'by day (BUILD asks for none) the site bed plays');
    n = log.started; sfx.ambience('rain'); assert.ok(log.started > n, 'night: the rain');
  } finally { delete globalThis.AudioContext; }
});
