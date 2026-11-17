// build 130 part 3: the ending's pure helpers (eve.js), the film's chooser (film130.js), an old save of build 120's stage 05 (pack.js)
import test from 'node:test';
import assert from 'node:assert/strict';
import { filmSrc, FILM } from '../src/game/h130/film130.js';
import { reachRadius, cityLit, badCols, evePts, EK, EVE } from '../src/game/h130/eve.js';
import { migrate05 } from '../src/game/h130/pack.js';
import { createH130, CREW_COLS, KINDS } from '../src/game/h130/model.js';
import { ACTS } from '../src/game/h130/acts.js';

test('the film: inline first, then the file beside the page, else skipped', () => {
  const data = 'data:video/mp4;base64,' + 'A'.repeat(100);
  assert.deepEqual(filmSrc({ inline: data, protocol: 'https:', file: FILM.FILE }), { kind: 'inline', src: data });
  assert.deepEqual(filmSrc({ inline: data, protocol: 'about:', file: FILM.FILE }), { kind: 'inline', src: data });
  assert.deepEqual(filmSrc({ protocol: 'file:', file: FILM.FILE }), { kind: 'relative', src: 'sbh-film-v3-small.mp4' });
  assert.deepEqual(filmSrc({ protocol: 'https:', file: FILM.FILE }), { kind: 'relative', src: 'sbh-film-v3-small.mp4' });
  assert.equal(filmSrc({ inline: 'not a film', protocol: 'https:', file: FILM.FILE }).kind, 'relative');
  for (const p of ['about:', 'data:', 'blob:', '']) assert.equal(filmSrc({ protocol: p, file: FILM.FILE }).kind, 'skip');
  assert.equal(filmSrc({ inline: data, protocol: 'https:', file: FILM.FILE, off: true }).kind, 'skip');
  assert.equal(filmSrc().kind, 'skip');
  assert.ok(FILM.WAIT <= 4000, 'a film that will not load is given up within four seconds');
});

test('the evening: the light reaches farther with a better result; the courtyards light nearest first', () => {
  assert.equal(reachRadius(0), EK.R0); assert.equal(reachRadius(1), EK.R1); assert.ok(reachRadius(0.5) > reachRadius(0.2));
  assert.equal(reachRadius(-3), EK.R0); assert.equal(reachRadius(9), EK.R1);
  const d = [200, 300, 500, 900, 1500, 1800, 2500];
  assert.equal(cityLit(d, 1, 1), 6); assert.equal(cityLit(d, 0, 1), 1); assert.equal(cityLit(d, 1, 0), 0);
  assert.ok(cityLit(d, 0.5, 1) >= cityLit(d, 0.3, 1));
  for (let u = 0; u < 1; u += 0.1) assert.ok(cityLit(d, 1, u) <= cityLit(d, 1, u + 0.1), 'the wave only grows');
  assert.deepEqual([evePts(1), evePts(0.5), evePts(0.1)], [40, 20, 10]);
});

test('the evening: a badly placed column (at the end of a sagging or cracked span) throws the shadow; a straight run none', () => {
  assert.deepEqual(badCols({}), []);
  assert.deepEqual(badCols({ N: { cols: CREW_COLS.N.slice() } }).length, 0, 'the crews\' columns are straight');
  const b = badCols({ N: { cols: [57, 68, 79, 92.5] } });
  assert.ok(b.length >= 1 && b.every((c) => c.side === 'N' && Number.isFinite(c.x) && Number.isFinite(c.z)));
  assert.ok(b.some((c) => c.a === 92.5 || c.a === 79));
  assert.ok(b.every((c) => [57, 68, 79, 92.5].includes(c.a)), 'only columns, never the walls the beams bear on');
});

test('the four kinds each have an act; the evening stands by the menorah', () => {
  for (const k of KINDS) assert.ok(ACTS[k] && typeof ACTS[k].make === 'function' && typeof ACTS[k].stand === 'function', k);
  const s = EVE.stand();
  assert.ok(Number.isFinite(s.x) && Number.isFinite(s.z) && Array.isArray(s.face));
});

test('an old save of build 120\'s stage 05 — finished: built by the crews, drawn done; in the middle: from the beginning; once', () => {
  const G1 = { h120: { v: 1, done: ['col1', 'saw1'] }, h128: { keep: 1 }, h129: { keep: 2 } };
  assert.equal(migrate05(G1, true), true);
  assert.equal(G1.h120, undefined); assert.deepEqual(G1.h128, { keep: 1 }); assert.deepEqual(G1.h129, { keep: 2 });
  const C = createH130(G1.h130);
  assert.equal(C.st.crews, 1); assert.equal(C.finished(), true, 'the stage stands done (the world draws it on a reload)');
  assert.deepEqual(C.galOf('N').cols, CREW_COLS.N); assert.equal(C.nDone(), 0);
  assert.equal(migrate05(G1, true), false, 'a second time does nothing');
  const G2 = { h120: { v: 1, done: ['col1'] } };
  assert.equal(migrate05(G2, false), true);
  const D = createH130(G2.h130);
  assert.equal(D.st.crews, 0); assert.equal(D.finished(), false); assert.deepEqual(D.open().map((m) => m.id), ['gal1', 'wood1']);
  const G3 = { h130: { v: 1, done: ['gal1'] }, h120: { v: 1 } };
  assert.equal(migrate05(G3, true), false, 'a save that has the new stage keeps it'); assert.deepEqual(G3.h130.done, ['gal1']);
  assert.equal(migrate05({}, true), false); assert.equal(migrate05(null, true), false);
});
