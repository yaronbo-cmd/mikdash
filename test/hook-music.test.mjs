// HOOK19 (wave 19, the owner's note 4: "חוץ מהשלב הראשון… הביט פר מינט נחלש וירד משמעותית"): under two thumbs the work music —
// 124 BPM, a dum on every beat — plays at EVERY stage and at ANY hour; the night is a colour (workN), never a slower pulse.
//   node --test test/hook-music.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createMusic, stateInfo } from '../src/game/music.js';

const STAGES = ['har', 'wall', 'sorag', 'gates', 'nashim', 'nikanor', 'lishka', 'yesod', 'sovev', 'guf', 'karnot', 'kiyor', 'ulam', 'heichal', 'kodesh'];
const HOURS = ['dawn', 'noon', 'dusk', 'night'];
const mk = (flags = {}) => { const f = Object.assign({ twin: true, precision: false }, flags); return { f, m: createMusic({ seed: 1, watch: () => f }) }; };

test('the cause: the old order let the night (69.8 BPM) and a minigame sheet (96 BPM) win over the work state', () => {
  assert.ok(stateInfo('night').bpm < 75 && stateInfo('precision').bpm < 100 && stateInfo('work').bpm === 124);
});

test('workN: the same pulse as work (124 BPM, drums, key), only the colour differs', () => {
  const a = stateInfo('work'), b = stateInfo('workN');
  assert.equal(b.bpm, 124); assert.equal(b.root, a.root); assert.equal(b.mode, a.mode); assert.ok(b.drums && b.tof && b.darbuka); assert.equal(b.blocks, a.blocks);
});

for (const hour of HOURS) {
  test(`two thumbs, every stage, ${hour}: the want is the work state — with a sheet open, a minigame running, and not`, () => {
    for (const stage of STAGES) {
      for (const sheet of [false, true]) {
        const { f, m } = mk({ precision: sheet });
        m.event('start', {}, 'A'); m.event('timeOfDay', hour, 'A'); m.event('twin', { on: true }, 'A');
        m.event('phase', { id: stage, ph: 'survey' }, 'A');
        assert.equal(m.get().want, 'work', `${stage} ${hour} sheet=${sheet}`);
        m.event('minigameStart', { kind: 'tread' }, 'A'); assert.equal(m.get().want, 'work', `${stage} ${hour} minigameStart`);
        m.event('minigame', { kind: 'tread' }, 'A');
        f.twin = false; m.event('twin', { on: false }, 'A');
      }
    }
  });
}

test('without two thumbs nothing changes: the night keeps its calm, a sheet keeps its precision, the building its groove', () => {
  const { m } = mk({ twin: false });
  assert.equal(m.get().want, 'build');
  m.event('timeOfDay', 'night', 'A'); assert.equal(m.get().want, 'night');
  m.event('timeOfDay', 'noon', 'A'); m.event('minigameStart', {}, 'A'); assert.equal(m.get().want, 'precision'); m.event('minigame', {}, 'A');
  const q = mk({ twin: false, precision: true }); assert.equal(q.m.get().want, 'precision');
});

test('the cinematic and the games keep their own music over the work (a key moment, the board, the quarry games, the festive state)', () => {
  const { m } = mk();
  m.event('timeOfDay', 'night', 'A');
  m.event('momentStart', { id: 'wall' }, 'A'); assert.equal(m.get().want, 'moment'); m.event('moment', { id: 'wall' }, 'A');
  m.event('m3open', {}, 'A'); assert.equal(m.get().want, 'board'); m.event('m3close', {}, 'A');
  m.event('m3open', { field: 'quarry', game: 'sling' }, 'A'); assert.equal(m.get().want, 'quarry'); m.event('m3close', {}, 'A');
  m.event('stageDone', { id: 'wall' }, 'A'); assert.equal(m.get().want, 'chag');
  m.event('start', {}, 'A');
});

test('phase B (the service) is untouched: the song and its quiet state', () => {
  const { m } = mk({ twin: false });
  m.event('start', {}, 'B'); assert.equal(m.get().want, 'phaseB');
  m.event('shirStart', { day: 0, bpm: 70 }, 'B'); assert.equal(m.get().want, 'shir');
});

// ── stages21 ── (the owner, 8.10, note 4: "המוסיקה בביפי אם נחלשת") a stage's ground ready ('phase' → courses) is a 6.5 s 'reveal' — the moment's 72 BPM
// over the work at every stage's arrival; under two thumbs the work's 124 stays, a key moment's film still has its own music
test('stages21: the reveal at a stage\'s arrival does not take the pulse under two thumbs (every stage, every hour)', () => {
  for (const hour of HOURS) for (const stage of STAGES) {
    const { f, m } = mk();
    m.event('start', {}, 'A'); m.event('timeOfDay', hour, 'A'); m.event('twin', { on: true }, 'A');
    m.event('phase', { id: stage, ph: 'courses' }, 'A');
    assert.equal(m.get().want, 'work', `${stage} ${hour} reveal`);
    m.event('reveal', {}, 'A'); assert.equal(m.get().want, 'work', `${stage} ${hour} reveal event`);
  }
  const off = mk({ twin: false }); off.m.event('phase', { id: 'wall', ph: 'courses' }, 'A'); assert.equal(off.m.get().want, 'moment', 'without two thumbs the reveal is the moment as before');
});
