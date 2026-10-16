// ── craftb19 ── FUN19 §3 (binding): every stage leads with its own craft (DECKS `sig`), no two neighbours alike — in STAGE_IDS and
// in the play order; each sig is in its own deck and dealable by its game; the altar stages no longer share one deck object.
import test from 'node:test';
import assert from 'node:assert/strict';
import { STAGES, DECKS } from '../src/game/content.js';
import { JOBS } from '../src/game/jobs.js';

const WANT = { har: 'arch', wall: 'tread', gates: 'gold', nashim: 'saw', sorag: 'F1', nikanor: 'column', lishka: 'wheel', yesod: 'key', sovev: 'line', guf: 'plumb', karnot: 'plaster', kiyor: 'aqueduct', ulam: 'waves', heichal: 'gold', kodesh: 'tread' };
const lead = (id) => DECKS[id].sig;
const game = (j) => (JOBS[j] || {}).game || j;   // (gold, plaster, bronze: one craft each — the rub's skins count as their own lead)

test('every stage has the sig of FUN19 §3, in its own deck', () => {
  for (const s of STAGES) {
    const D = DECKS[s.id]; assert.ok(D, s.id);
    assert.equal(D.sig, WANT[s.id], `${s.id}: sig`);
    assert.ok(JOBS[D.sig], `${s.id}: ${D.sig} in JOBS`);
    assert.ok(D.sig === 'key' || D.stone.includes(D.sig) || D.craft.includes(D.sig), `${s.id}: ${D.sig} in its deck`);
  }
});
test('no two neighbours lead with the same craft (STAGE_IDS and the play order)', () => {
  const ids = STAGES.map((s) => s.id);
  for (let i = 1; i < ids.length; i++) assert.notEqual(lead(ids[i]), lead(ids[i - 1]), `${ids[i - 1]} → ${ids[i]}`);
  const play = ['wall', 'gates', 'nashim', 'sorag', 'nikanor', 'lishka'];
  for (let i = 1; i < play.length; i++) assert.notEqual(game(lead(play[i])) + lead(play[i]), game(lead(play[i - 1])) + lead(play[i - 1]), `${play[i - 1]} → ${play[i]}`);
});
test('the altar stages have decks of their own, with the mallet (strike) and the whole stones (key)', () => {
  const alt = ['yesod', 'sovev', 'guf', 'karnot'];
  for (let i = 0; i < alt.length; i++) for (let k = i + 1; k < alt.length; k++) assert.notEqual(DECKS[alt[i]], DECKS[alt[k]], `${alt[i]} / ${alt[k]} share a deck`);
  for (const id of alt) { assert.ok(DECKS[id].stone.includes('strike') && DECKS[id].stone.includes('key'), id); }
});
