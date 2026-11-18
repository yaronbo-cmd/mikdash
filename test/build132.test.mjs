// build132 (build 132): the built pages — the manifest's head script once in the play page (manifest132), and the LINE=new
// flag (line132): the default build keeps Phase B and its scenes, `LINE=new` leaves them out. Runs node build.mjs (about 1 s
// each) and leaves dist/ as the default build. Run: node --test test/build132.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const build = (env = {}) => execFileSync(process.execPath, ['build.mjs'], { cwd: ROOT, env: { ...process.env, LINE: '', ...env }, stdio: 'pipe' }).toString();
const read = (f) => fs.readFileSync(ROOT + f, 'utf8');
// markers of Phase B and the scenes in the bundle: the kohen's model (only src/avodah/shift uses it), main.js's own lines
const PHASE_B = ['data:application/octet-stream;base64,Z2xURg', '[avodah] phase A destroy', '[scenes] phase A destroy', '__FORCE_SHIFT'];
const count = (s, x) => s.split(x).length - 1;

test('LINE=new: Phase B and its scenes left out; the default build keeps them', () => {
  try {
    build({ LINE: 'new' });
    const lite = read('dist/app.js');
    for (const x of PHASE_B) assert.equal(count(lite, x), 0, 'LINE=new still has ' + x);
    assert.equal(count(lite, 'enterAvodah(){'), 1, 'only the game\'s own act.enterAvodah (no hook from main.js)');
    assert.ok(Buffer.byteLength(lite) < 5 * 1048576, 'LINE=new is under 5 MiB');
  } finally {
    build();
  }
  const full = read('dist/app.js');
  for (const x of PHASE_B) assert.ok(count(full, x) >= 1, 'the default build lacks ' + x);
  assert.equal(count(full, 'enterAvodah(){'), 2);
});

test('the play page has the manifest\'s head script once, in <head>, before the app', () => {
  if (!fs.existsSync(ROOT + 'dist/play.html')) build();
  const html = read('dist/play.html');
  assert.equal(count(html, 'data:application/manifest+json,'), 1);
  const at = html.indexOf('data:application/manifest+json,');
  assert.ok(at < html.indexOf('</head>'), 'in the head');
  assert.equal(count(html, "name='mobile-web-app-capable'"), 1);
  assert.ok(!read('dist/temple3d.html').includes('data:application/manifest+json,'), 'the artifact page (a fragment) has none');
});
