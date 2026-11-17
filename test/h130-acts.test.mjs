// build 130 (part 1): the new stage 05's pack and its gallery act as far as node can see them — the pack's shape, the stands and the
// look's boxes from the book, the act's words (no quotation but the spec's), the raising's stand (build 120's, the book's stands.col3).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { makePack130, BOXES130 } from '../src/game/h130/pack.js';
import { GALLERY, GLINES } from '../src/game/h130/gallery.js';
import { raiseStand } from '../src/game/h130/raise.js';
import { PLAN, LEVELS, LINES } from '../src/game/h130/model.js';
import { BOOK } from '../src/game/world/grid.js';

const S5 = BOOK.s05, SPEC = readFileSync(new URL('../docs/specs/shlav-05-hadash-he.md', import.meta.url), 'utf8');

test('h130 pack: the director\'s shape, the four kinds\' acts, the plan the model\'s, the world\'s clock', () => {
  const P = makePack130();
  assert.equal(P.id, 'nashim'); assert.equal(P.key, 'h130'); assert.equal(P.PLAN, PLAN);
  for (const k of ['create', 'count', 'sync', 'before', 'finale', 'rest', 'dispose']) assert.equal(typeof P[k], 'function', k);
  assert.deepEqual(Object.keys(P.ACTS).filter((k) => !k.startsWith('__')), ['gallery', 'wood', 'light', 'eve']);
  const E = { setTime() {}, restoreTime() {} }; assert.equal(makePack130(E).time, E);
  for (const k of ['__init', '__sh', '__frame']) assert.equal(typeof P.ACTS[k], 'function', k);
  assert.ok(P.look && typeof P.look.pose === 'function' && typeof P.look.sightPose === 'function' && P.look.walk);
  const M = P.create(null); assert.deepEqual(M.count(), [0, PLAN.length]); assert.equal(M.open()[0].id, 'gal1');
});

test('h130 gallery: each level\'s stand is the book\'s gal.stand, facing the column line; the walk line names the side', () => {
  for (const m of PLAN.filter((q) => q.k === 'gallery')) {
    const L = LEVELS[m.lv], s = GALLERY.stand(m), b = S5.gal.stand[L.side], R = L.run;
    assert.deepEqual([s.x, s.z], b);
    const f = R.axis === 'x' ? [b[0], R.line] : [R.line, b[1]];
    assert.deepEqual(s.face, f, m.id);
    assert.match(GALLERY.walkLine(m), /^הגזוזטרא (בצפון|בדרום|במזרח): חידת העמודים$/);
  }
  assert.equal(LEVELS[3].raise, 'N');
});

test('h130 gallery: the act\'s own words quote nothing (no quotation marks, no source in brackets); the quotes it shows are the spec\'s', () => {
  for (const [k, t] of Object.entries(GLINES)) { assert.ok(t && t.length < 140, k); assert.doesNotMatch(t, /["״]|\([^)]*[א-ת]+ [א-ת]+, [א-ת]\)/, k); }
  for (const k of ['middot25', 'sukkah51a', 'sukkah51b', 'where', 'up']) {
    const body = LINES[k].replace(/\s\([^()]*\)$/, '').replace(/^"|"$/g, '');
    assert.ok(SPEC.includes(body), k + ': ' + body);
  }
  assert.equal(LINES.ill, '(המחשה)');
});

test('h130 raise: the kohen\'s stand at the brake post is build 120\'s level 3 (BOOK.s05.stands.col3); the rig is rig.3', () => {
  const s = raiseStand(), c = S5.stands.col3;
  assert.deepEqual([s.x, s.z, ...s.face], c);
  assert.deepEqual(S5.rig[3].post, [c[2], c[3]]);
  for (const k of ['wide', 'macro', 'plumb']) assert.equal(S5.cam.raise[k].length, 2, k);
});

test('h130 look: the court\'s walls at their built tops and the three galleries, every box from the book', () => {
  const walls = S5.walls.filter((r, i) => (S5.gal.wallTops[i] ?? 40) > S5.court.floor + 0.5);
  assert.equal(BOXES130.length, walls.length + 3);
  for (const b of BOXES130) { assert.equal(b.length, 6); assert.ok(b[0] < b[3] && b[1] < b[4] && b[2] < b[5], String(b)); }
  const gal = BOXES130.slice(-3);
  for (const [i, R] of Object.values(S5.gal.runs).entries()) { const b = gal[i]; if (R.axis === 'x') { assert.equal(b[0], R.a0); assert.equal(b[3], R.a1); } else { assert.equal(b[2], R.a0); assert.equal(b[5], R.a1); } }
});
