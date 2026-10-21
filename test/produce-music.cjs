// PRODUCER12 (wave 12, the owner's note 5: "המוסיקה — האם לא צריך מוסיקה יותר קצבית ומעניינת?"): the score as a listener gets it,
// rendered offline (OfflineAudioContext, no speakers) from a build's own src/game/music.js, with WORLD12's measuring page
// (test/music.html: analyse → tempo = the strongest autocorrelation lag, onsets per second). One WAV of the build state at work
// (to listen to), and a table per state: tempo, onsets/s, loudness — beside master's build state (v21, 70 BPM).
//   node test/produce-music.cjs --tree=/home/claude/wt/peek12 [--secs=20]
// Writes test/out/produce/music-build-at-work.wav (the tree's), music-build-v21.wav (master's) and music-log.json.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), cp = require('child_process');
const A = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true]; }));
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/produce'), TREE = path.resolve(A.tree || ROOT), SECS = +(A.secs || 20);
fs.mkdirSync(OUT, { recursive: true });
const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));
const TMP = path.join(TREE, 'test/out'); fs.mkdirSync(TMP, { recursive: true });
esbuild.buildSync({ entryPoints: [path.join(TREE, 'src/game/music.js')], bundle: true, format: 'iife', globalName: 'MUSIC', target: 'es2020', outfile: path.join(TMP, 'music.bundle.js'), logLevel: 'warning' });
let master = null;
try {   // master's score (v21) for the comparison
  const src = cp.execSync('git show master:src/game/music.js', { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const tmp = path.join(TMP, 'music-v21.src.js'); fs.writeFileSync(tmp, src);
  esbuild.buildSync({ entryPoints: [tmp], bundle: true, format: 'iife', globalName: 'MUSIC0', target: 'es2020', outfile: path.join(TMP, 'music-v21.bundle.js'), logLevel: 'warning' });
  master = path.join(TMP, 'music-v21.bundle.js');
} catch (e) { console.log('no master score: ' + e.message.split('\n')[0]); }
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
  const rows = [];
  try {
    const pg = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
    const errors = []; pg.on('pageerror', (e) => errors.push(String(e)));
    await pg.goto('file://' + path.join(TREE, 'test/music.html'));
    await pg.waitForFunction(() => typeof analyse === 'function' && typeof MUSIC === 'object', null, { timeout: 30000 });
    const states = await pg.evaluate(() => (MUSIC.MUSIC_STATES || []).slice());
    console.log('states:', states.join(', '));
    const want = [['build', 0], ['build', 1], ['build', 2], ['board', 0], ['quarry', 0], ['precision', 0], ['moment', 0], ['chag', 0], ['shir', 0], ['phaseB', 0], ['night', 0]].filter(([s]) => states.includes(s));
    for (const [s, lv] of want) {
      const r = await pg.evaluate(([s, lv, secs]) => analyse([[0, 'int', lv], [0, 'state', s]], secs, { tempo: true }), [s, lv, SECS]);
      const row = { state: s, int: lv, bpm: r.bpm, raw: r.raw, onsets: r.onsets, rms: r.rms, peak: r.peak, info: await pg.evaluate((s) => { try { return MUSIC.stateInfo ? MUSIC.stateInfo(s) : null; } catch (e) { return null; } }, s) };
      rows.push(row); console.log(`${s.padEnd(9)} int ${lv} · ${String(r.bpm).padStart(6)} BPM (repeat ${r.raw}) · ${r.onsets} onsets/s · rms ${r.rms} · peak ${r.peak} · ${JSON.stringify(row.info)}`);
    }
    const w = await pg.evaluate((secs) => analyse([[0, 'int', 1], [0, 'state', 'build']], secs, { wav: true, tempo: true }), SECS);
    fs.writeFileSync(path.join(OUT, 'music-build-at-work.wav'), Buffer.from(w.wav, 'base64'));
    console.log(`WAV test/out/produce/music-build-at-work.wav · ${SECS} s · ${w.bpm} BPM · ${w.onsets} onsets/s`);
    if (master) {
      await pg.addScriptTag({ path: master });
      const m = await pg.evaluate((secs) => analyse([[0, 'state', 'build']], secs, { tempo: true, wav: true, lib: 'MUSIC0' }), SECS);
      fs.writeFileSync(path.join(OUT, 'music-build-v21.wav'), Buffer.from(m.wav, 'base64'));
      rows.push({ state: 'build (v21 master)', int: 0, bpm: m.bpm, raw: m.raw, onsets: m.onsets, rms: m.rms, peak: m.peak });
      console.log(`v21 build · ${m.bpm} BPM (repeat ${m.raw}) · ${m.onsets} onsets/s · rms ${m.rms} · WAV test/out/produce/music-build-v21.wav`);
    }
    if (errors.length) console.log('page errors: ' + errors.slice(0, 3).join(' | '));
  } catch (e) { console.error('RUN ERROR', e.message); }
  fs.writeFileSync(path.join(OUT, 'music-log.json'), JSON.stringify(rows, null, 1));
  await b.close();
})();
