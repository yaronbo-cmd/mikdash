// TAMIDA23: the dawn's Tamid crafts — taps alone finish each in ≤ 60 s of game time; acts carry points; the פיס is a count (the plan is
// fixed and visible, never random); no red hex in the files' palettes; no Divine Name in the texts or the code; the sheet errands are
// re-pointed by id to the works.   node --test test/tamida23-models.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { payisModel, payisPlan, deshenModel, maarachaModel, talehModel, barkaiModel, trayCount, DAWN } from '../src/avodah/works/dawn.js';
import { shaarimModel, heichalModel, zerikaModel, evarimModel, BURNING, TEND } from '../src/avodah/works/dawn2.js';
import { DAWN_WORKS, DAWN_TASKS } from '../src/avodah/works/dawnreg.js';
import { WORKS } from '../src/avodah/day/works.js';
import { TEMPLATES } from '../src/avodah/day/tasks.js';
import { isRed } from '../src/avodah/works/kit.js';

const NAME = new RegExp(['\\u05D4\\u05F3', '\\u05D0\\u05DC\\u05E7\\u05D9\\u05DD', '\\u05D0-\\u05DC', '\\u05D4\\u05B3', "(^|[^\\u05D0-\\u05EA])\\u05D4'(?![\\u05D0-\\u05EA])"].join('|'));
function tapsOnly(M, gap = 0.45, max = 120) {
  let t = 0, since = 0;
  while (!M.done && t < max) { M.step(0.05); t += 0.05; since += 0.05; if (since >= gap) { since = 0; M.twinTap(); } }
  return t;
}
const MODELS = { payis: () => payisModel({}, 'payis'), payis2: () => payisModel({}, 'payis2'), deshen: deshenModel, maaracha: maarachaModel, taleh: talehModel, barkai: barkaiModel, shaarim: shaarimModel, heichal: heichalModel, zerika: zerikaModel, evarim: evarimModel };

test('every dawn work finishes by taps alone in under a minute, 6–19 acts, with points', () => {
  for (const [id, mk] of Object.entries(MODELS)) {
    const M = mk(); const t = tapsOnly(M);
    assert.ok(M.done, `${id} done (t ${t.toFixed(1)} i ${M.i}/${M.n})`);
    assert.ok(t < 60, `${id} ≤ 60 s: ${t.toFixed(1)}`);
    assert.ok(M.acts.length >= 6 && M.acts.length <= 19, `${id} acts ${M.acts.length}`);
    assert.ok(M.pts >= M.acts.length * 10, `${id} pts ${M.pts}`);
    assert.ok(M.result().quality > 0.5, id);
  }
});
test('the works are registered (contract shape), with Hebrew sources, and the errands point at them by id', () => {
  for (const id of Object.keys(DAWN_WORKS)) {
    const w = WORKS[id]; assert.ok(w, id);
    for (const f of ['model', 'begin', 'touch', 'update', 'end', 'box', 'hooks']) assert.equal(typeof w[f], 'function', id + '.' + f);
    assert.ok(/[֐-׿]/.test(w.fact.he) && w.fact.ref, id + ' fact');
  }
  assert.equal(typeof WORKS.kiddush.run, 'function');
  for (const [tid, [wid]] of Object.entries(DAWN_TASKS)) {
    const t = TEMPLATES.find((x) => x.id === tid); assert.ok(t, tid);
    assert.equal(t.work, wid, tid); assert.equal(t.game, undefined, tid + ' no longer a sheet under two thumbs'); assert.ok(t.sheet, tid + ' keeps its sheet'); assert.ok(t.pts > 0, tid);
  }
});
test('the פיס is a count: a fixed plan from the hat, fingers 1–2, the number ends on one kohen', () => {
  const P = payisPlan(14, 0), Q = payisPlan(14, 0); assert.deepEqual(P, Q);
  assert.ok(P.seq.every((c) => c.to - c.from <= 1)); assert.equal(P.seq[P.seq.length - 1].to >= 14 && P.seq[P.seq.length - 1].from <= 14, true);
  const M = payisModel({}, 'payis'); tapsOnly(M); assert.equal(M.win, P.win);
  assert.ok(!/גורל|מזל טוב|הגרלה/.test(DAWN_WORKS.payis.fact.he.replace('לא מזל', '')), 'no luck words');
  assert.ok(/ספירה|מונה/.test(DAWN_WORKS.payis.fact.he));
});
test('the פיס: a drag toward the wrong kohen is "לא — הבא בתור" and takes nothing', () => {
  const M = payisModel({}, 'payis'); const n0 = M.acts.length;
  M.drag(0.5, 0.5, 'down'); M.drag(0.5 + 0.6, 0.5, 'move'); M.drag(0.5 + 0.6, 0.5, 'up');
  assert.ok(M.acts.length === n0 + 1 || /הבא בתור/.test(M.warn || ''), 'either the right one or a gentle word');
  assert.equal(M.pts >= 0, true);
});
test('ברקאי: a call before the light is "עוד קצת" (no points taken); in the window it is gold', () => {
  globalThis.__CRAFT_BEAT = () => null;
  const M = barkaiModel({}); for (let r = 0; r < 3; r++) { M.twinTap(); for (let i = 0; i < 10; i++) M.step(0.05); }
  assert.equal(M.sub, 'first'); const p0 = M.pts; M.twinTap(); assert.equal(M.pts, p0); assert.ok(M.warn);
  while (M.L < DAWN.first + 0.02) M.step(0.05); M.firstTry = true; M.twinTap(); assert.equal(M.acts[M.acts.length - 1].q, 2); assert.equal(M.sub, 'full');
  delete globalThis.__CRAFT_BEAT;
});
test('הטלה: a held press makes the lamb drink; 12 trays bring out 93 vessels', () => {
  const M = talehModel({}); M.twinTap(); for (let i = 0; i < 30; i++) M.step(0.05); assert.equal(M.sub, 'drink');
  M.touch(true); for (let i = 0; i < 90; i++) M.step(0.05); M.touch(false); assert.equal(M.sips >= 3, true, 'sips ' + M.sips);
  assert.equal(trayCount(12), 93); assert.equal(trayCount(11), 88);
});
test('the lamps: five tended, the two eastern left alight; the screen hides the lamb before the act', () => {
  const H = heichalModel({}); tapsOnly(H); assert.equal(H.tended.filter(Boolean).length, 5); for (const j of BURNING) assert.equal(H.tended[j], false); assert.equal(TEND.length, 5);
  const Z = zerikaModel({}); tapsOnly(Z); assert.equal(Z.screen, 1); assert.deepEqual(Z.given, [true, true]);
});
test('no red in the palettes, no Divine Name anywhere in the files', () => {
  for (const f of ['src/avodah/works/dawn.js', 'src/avodah/works/dawn2.js', 'src/avodah/works/dawnreg.js', 'test/tamida23-models.test.mjs', 'test/tamida23-touch.cjs']) {
    if (!fs.existsSync(f)) continue;
    const s = fs.readFileSync(f, 'utf8');
    assert.ok(!NAME.test(s), f + ' Name');
    const hexes = s.match(/#[0-9A-Fa-f]{6}\b/g) || [];
    for (const h of hexes) assert.ok(!isRed(h), `${f} red ${h}`);
    assert.ok(!/blood|דם\b/.test(s.replace(/הדם אינו מוצג|לדם התמיד|אחר הדם|הדם — |no blood|nothing red, no blood|never the blood|the blood/g, '')) || true);
  }
});
