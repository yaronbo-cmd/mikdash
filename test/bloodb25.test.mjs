// BLOODB25 (DAM25 §3 lower half): the private offerings at the rings each by its kind from the gate's queue — olah/shelamim two corners below the
// line, chatat the four horns above in order by the finger (a wrong horn waits, no penalty), the birds on the wall (chatat haof below first,
// then olat haof above) — the slaughter behind the screen pays nothing and swallows a tap; the gardeners' errand; no Name, no forbidden red.
//   node --test test/bloodb25.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { yachidModel, stepsOf, HORNS, SCREEN_H, yachidMentor } from '../src/avodah/works/yachid.js';
import { noteSent, ringKinds, clearSent, DEFAULT_KINDS } from '../src/avodah/works/offerq.js';
import { gananModel, GANAN_TASK, GANAN_LINE } from '../src/avodah/works/ganan.js';
import { WASH, WASH_LINE } from '../src/avodah/works/close.js';
import { isRed } from '../src/avodah/works/blood.js';
import { TEMPLATES } from '../src/avodah/day/tasks.js';
import { WORKS } from '../src/avodah/day/works.js';
import '../src/avodah/works/more.js';

/** play by taps alone (one every 0.45 s) → { t, sfx, actsAt: acts count when each step began } */
function play(M, every = 0.45) {
  let t = 0, since = 0; const sfx = [];
  while (!M.done && t < 90) { M.step(0.05); t += 0.05; since += 0.05; if (since >= every) { since = 0; M.twinTap(); } for (const f of M.fx) if (f.sfx) sfx.push(f.sfx); M.fx.length = 0; }
  return { t, sfx };
}
test('the queue gives the kinds: what the gate sent, in order, then the defaults', () => {
  clearSent(); assert.deepEqual(ringKinds(3), DEFAULT_KINDS); assert.deepEqual(ringKinds(), ['chatat', 'ken']);
  noteSent('olah'); noteSent('kinim'); noteSent('olah'); noteSent('mincha'); noteSent('shelamim');
  assert.deepEqual(ringKinds(3), ['olah', 'ken', 'shelamim']); assert.deepEqual(ringKinds(), ['olah', 'ken']);
  clearSent(); noteSent('shelamim'); assert.deepEqual(ringKinds(), ['shelamim', 'chatat']);
  clearSent();
});
test('olah and shelamim: the screen (0 points, the grave tone), receiving, two corners below the line (NE then SW), the rest on the yesod', () => {
  for (const kind of ['olah', 'shelamim']) {
    const M = yachidModel({ kinds: [kind] }); const r = play(M);
    assert.ok(M.done && r.t < 60, kind);
    assert.deepEqual(M.steps.map((s) => s.k), ['lead', 'lean', 'shecht', 'recv', 'zerika', 'zerika', 'shirayim']);
    assert.deepEqual(M.marks.map((m) => m.c + ':' + m.level), ['NE:lower', 'SW:lower']);
    assert.equal(M.acts.length, M.n - 1, 'every step pays but the slaughter');
    assert.ok(r.sfx.includes('grave') && M.poured === 1 && M.fill === 0);
  }
});
test('chatat: up the ramp, the four horns ABOVE in order SE → NE → NW → SW by the finger; a wrong horn: "קודם …", it waits, no penalty', () => {
  const M = yachidModel({ kinds: ['chatat'] });
  // up to the first horn by taps
  let t = 0; while (t < 30) { M.step(0.05); t += 0.05; if (M.cur) continue; if (M.steps[M.i].k === 'horn') break; M.twinTap(); }
  assert.equal(M.steps[M.i].c, 'SE');
  const miss0 = M.miss, i0 = M.i;
  assert.equal(M.horn('NW'), false); assert.equal(M.warn, 'קודם דרומית־מזרחית'); assert.equal(M.i, i0); assert.equal(M.miss, miss0); assert.ok(M.firstTry);
  for (const c of HORNS) { assert.equal(M.horn(c), true, c); for (let k = 0; k < 40 && M.cur; k++) M.step(0.05); }
  assert.deepEqual(M.marks.map((m) => m.c + ':' + m.level), ['SE:upper', 'NE:upper', 'NW:upper', 'SW:upper']);
  assert.equal(M.wiped, 4);
  play(M); assert.ok(M.done); assert.equal(M.wrong, 1); assert.equal(M.miss, 0);
  assert.deepEqual(stepsOf('chatat', 0).map((s) => s.k), ['lead', 'lean', 'shecht', 'recv', 'up', 'horn', 'horn', 'horn', 'horn', 'shirayim']);
});
test('the birds: no screen, no leaning; chatat haof below at SW (and drained to the yesod) before olat haof above at SE; the mentor line', () => {
  const M = yachidModel({ kinds: ['ken'] }); play(M);
  assert.ok(M.done); assert.deepEqual(M.steps.map((s) => s.k), ['bring', 'melak', 'mitzui', 'melak']);
  assert.deepEqual(M.marks.map((m) => m.c + ':' + m.level), ['SW:lower', 'SW:yesod', 'SE:upper']);
  assert.ok(/חטאת העוף — למטה; עולת העוף — למעלה/.test(M.mentorLine.text) && /זבחים ו/.test(M.mentorLine.src));
  assert.ok(/ובעוף — הפוך/.test(yachidMentor(M).text));
});
test('the slaughter: no act, no "+N", a tap during it is swallowed (the receiving waits for its own tap)', () => {
  const M = yachidModel({ kinds: ['olah'] });
  M.twinTap(); for (let k = 0; k < 40 && M.cur; k++) M.step(0.05);   // lead
  M.twinTap(); for (let k = 0; k < 40 && M.cur; k++) M.step(0.05);   // lean
  const a0 = M.acts.length; M.twinTap(); assert.equal(M.cur.k, 'shecht');
  M.step(0.3); M.twinTap(); M.twinTap();                              // taps in the stillness
  for (let k = 0; k < 60 && M.cur; k++) M.step(0.05);
  M.step(0.05); M.step(0.05);
  assert.equal(M.acts.length, a0, 'no act for the slaughter'); assert.equal(M.cur, null, 'the swallowed tap did not start the receiving'); assert.equal(M.steps[M.i].k, 'recv');
  assert.equal(M.slaughtered, 1); assert.ok(!(M.grave > 0));
  M.twinTap(); for (let k = 0; k < 40 && M.cur; k++) M.step(0.05);
  assert.equal(M.acts.length, a0 + 1, 'the first "+N" is the receiving'); assert.equal(M.fill, 0.7);
});
test('the default errand (chatat · ken) and all three chains by taps alone under a minute; the screen is 2.4 high', () => {
  clearSent(); const M = yachidModel(); const r = play(M);
  assert.ok(M.done && r.t < 60, 't ' + r.t); assert.deepEqual(M.kinds, ['chatat', 'ken']); assert.equal(SCREEN_H, 2.4);
  assert.equal(r.sfx.filter((x) => x === 'grave').length, 1, 'one moment of gravity per beast (none for the birds)');
  const M3 = yachidModel({ kinds: ['olah', 'chatat', 'ken'] }), r3 = play(M3); assert.ok(M3.done && r3.t < 60, 't ' + r3.t);
});
test('the gardeners: one tap, a daily errand of +1, the line of Yoma 5:6; the washing: six', () => {
  const M = gananModel(); play(M); assert.ok(M.done && M.paid === 1);
  const t = TEMPLATES.find((x) => x.id === 'ganan'); assert.ok(t && t.work === 'ganan' && t.pts === 1 && /יומא ה, ו/.test(t.src)); assert.ok(WORKS.ganan && typeof WORKS.ganan.model === 'function');
  assert.equal(GANAN_TASK.pts, 1); assert.ok(/לגננין/.test(GANAN_LINE.text) && /ומועלין/.test(GANAN_LINE.text));
  assert.equal(WASH, 6); assert.ok(/המחשה/.test(WASH_LINE.src));
});
test('no Divine Name and no forbidden red in the new files', () => {
  const NAME = new RegExp(['\\u05D4\\u05F3', '\\u05D0\\u05DC\\u05E7\\u05D9\\u05DD', '\\u05D0-\\u05DC', '\\u05D9\\u05D4\\u05D5\\u05D4', '\\u05D0\\u05DC\\u05D4\\u05D9\\u05DD', "(^|[^\\u05D0-\\u05EA])\\u05D4'(?![\\u05D0-\\u05EA])"].join('|'));
  for (const f of ['yachid.js', 'ganan.js', 'offerq.js', 'close.js', 'more.js', 'gate.js']) {
    const src = fs.readFileSync(new URL('../src/avodah/works/' + f, import.meta.url), 'utf8').replace(/\b(ref|src): `?'?[^'`]*['`]/g, '');
    assert.ok(!NAME.test(src), f + ' has a Name');
    for (const m of src.matchAll(/'!?#([0-9A-Fa-f]{6})'/g)) assert.ok(!isRed('#' + m[1]), f + ' red ' + m[0]);
    if (f !== 'yachid.js') assert.ok(!/#4C0B0E|#5A1418/i.test(src), f + ' a free blood hex (BLOOD is blood.js)');
  }
});
