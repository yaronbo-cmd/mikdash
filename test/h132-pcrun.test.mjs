// build 132: the PC runner counts the return visits a script plans and fails a lane that skipped them (the 12d7879 PC run ended
// after the end card with "no errors" and none of its eight visits)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pcrun-'));
process.env.PC_OUT = dir;
const require = createRequire(import.meta.url);
const R = require('../tools/pc/run.cjs');
const job = { name: 'lane', script: 'tools/probes/s09-pc.json' };

test('the stage 09 PC script plans eight return visits', () => {
  assert.equal(R.visitsPlanned('tools/probes/s09-pc.json'), 8);
});

test('a lane that ended after the end card with no visit has FAILED and does not say no errors', () => {
  fs.writeFileSync(path.join(dir, 'lane.log'), '[274s] bot MODAL x\n[279s] bot done 277s 661 actions\nno errors\n');
  const vc = R.visitCheck(job);
  assert.deepEqual(vc, { want: 8, got: 0, failed: true });
  const d = R.digest('lane', vc).join('\n');
  assert.match(d, /visits: 0 of 8 played/);
  assert.match(d, /FAILED: return visits not played/);
  assert.doesNotMatch(d, /^\s*no errors\s*$/m);
});

test('a lane with all eight visits passes', () => {
  const L = ['form2', 'fill2', 'strip2', 'sikra2', 'form3', 'fill3', 'strip3', 'sikra3'].map((k, i) => `[${300 + i}s] bot VISIT END ${k} {"stars":3}`);
  fs.writeFileSync(path.join(dir, 'lane.log'), L.join('\n') + '\n[400s] bot VISITS DONE {}\nno errors\n');
  const vc = R.visitCheck(job);
  assert.deepEqual(vc, { want: 8, got: 8, failed: false });
  assert.match(R.digest('lane', vc).join('\n'), /visits: 8 of 8 played/);
});

test('the script waits for the visits after the end card and fails loudly when they never open', () => {
  const t = fs.readFileSync('tools/probes/s09-pc.json', 'utf8');
  assert.match(t, /VISITS NOT OPEN after/);
  assert.match(t, /fail:/);
  assert.match(fs.readFileSync('tools/probe109.cjs', 'utf8'), /a\.fail\) errs\.push\('FAILED: '/);
});
