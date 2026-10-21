// MUSIC8B: the score, rendered offline (OfflineAudioContext) in one headless Chromium — no speakers, no 3D.
// WORLD12 (wave 12): + the pulse measured (tempo and onsets per second from the render), the work's intensity, the fill,
// the festive / quarry / shir states, the trumpets, and Phase B's instruments (no drum in the service).
//   node test/music.cjs          build test/out/music.bundle.js; render every state, the crossfades and the ducking;
//                                check: no clipping, no silence, the render speed (CPU), the event → state mapping
//   node test/music.cjs --wav    also write test/out/music-<state>.wav (to listen)
// One browser, always closed.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out');
fs.mkdirSync(OUT, { recursive: true });
const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));
esbuild.buildSync({ entryPoints: [path.join(ROOT, 'src/game/music.js')], bundle: true, format: 'iife', globalName: 'MUSIC', target: 'es2020', outfile: path.join(OUT, 'music.bundle.js'), logLevel: 'warning' });
const WAV = process.argv.includes('--wav');

const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
const STATES = ['build', 'board', 'precision', 'moment', 'night', 'phaseB', 'chag', 'quarry', 'shir', 'work'];   // (land17: + work)
const avg = (a) => a.reduce((s, x) => s + x, 0) / Math.max(1, a.length);

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    const pg = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
    const errors = [];
    pg.on('pageerror', (e) => errors.push(String(e)));
    await pg.goto('file://' + path.join(__dirname, 'music.html'));

    // 1. every state alone, 20 s: loud enough, never clipped, never silent after its fade-in, fast to render
    for (const s of STATES) {
      const r = await pg.evaluate(([s, wav]) => analyse(s, 20, { wav }), [s, WAV]);
      if (r.wav) { fs.writeFileSync(path.join(OUT, `music-${s}.wav`), Buffer.from(r.wav, 'base64')); delete r.wav; }
      const body = r.win.slice(4), lo = Math.min(...body);
      check(`${s}: no clipping (peak < 0.98, no sample ≥ 0.99)`, r.peak < 0.98 && r.clip === 0, `peak ${r.peak}`);
      check(`${s}: never silent (every 1-s window from 4 s > 0.006 RMS)`, lo > 0.006, `rms ${r.rms}, the quietest second ${lo.toFixed(4)}`);
      const floor = s === 'night' ? 0.012 : 0.02;   // (the night is meant to be soft)
      check(`${s}: a background level (RMS ${floor}–0.2)`, r.rms > floor && r.rms < 0.2, `rms ${r.rms}`);
      // CPU: at a phone's 48 kHz, scheduled like the live music (the render pauses every 0.1 s to make the next notes)
      // (the machine is shared: the best of three 6-s renders)
      let c = { speed: 0 };
      for (let k = 0; k < 3; k++) { const x = await pg.evaluate((s) => analyse(s, 6, { sampleRate: 48000 }), s); if (x.speed > c.speed) c = x; }
      check(`${s}: light (48 kHz renders ≥ 5× faster than real time on this shared machine; ×19–30 when it is quiet)`, c.speed >= 5, `×${c.speed} (${c.ms} ms for 6 s)`);
      check(`${s}: no DC offset`, Math.abs(r.dc) < 0.01, `dc ${r.dc}`);
    }

    // 1b. (world12) the pulse, measured from the render: the tempo (the strongest autocorrelation lag, 60–180 BPM) and the
    // onsets per second; the building at the work's three intensities (calm · at work · in the flow)
    const TEMPO = {};
    for (const [s, lv, bpm] of [['build', 0, 104.65], ['build', 1, 104.65], ['build', 2, 104.65], ['board', 0, 112], ['quarry', 0, 118], ['chag', 0, 120], ['work', 1, 124], ['precision', 0, 96], ['night', 1, 69.77]]) {
      const r = await pg.evaluate(([s, lv]) => analyse([[0, 'int', lv], [0, 'state', s]], 24, { tempo: true }), [s, lv]);
      TEMPO[`${s}${lv}`] = r;
      const near = Math.abs(r.bpm - bpm) / bpm < 0.03 || Math.abs(r.bpm * 2 - bpm) / bpm < 0.03 || Math.abs(r.bpm / 2 - bpm) / bpm < 0.03;
      check(`${s} (intensity ${lv}): the measured tempo is its own (${bpm} BPM, ±3 %, or its half or double)`, near, `measured ${r.bpm} BPM (the strongest repeat: ${r.raw}) · ${r.onsets} onsets/s`);
    }
    check('build: the tempo is 100–110 BPM, as asked ("יותר קצבית": 70 → 104.65)', TEMPO.build1.bpm >= 100 && TEMPO.build1.bpm <= 110, `${TEMPO.build1.bpm} BPM`);
    // (world12) the same measure on master's score (wave 8B, 70 BPM), for the report — when git has it
    try {
      const src = require('child_process').execSync('git show 0c7150e:src/game/music.js', { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      const tmp = path.join(OUT, 'music-master.src.js'); fs.writeFileSync(tmp, src);
      esbuild.buildSync({ entryPoints: [tmp], bundle: true, format: 'iife', globalName: 'MUSIC0', target: 'es2020', outfile: path.join(OUT, 'music-master.bundle.js'), logLevel: 'warning' });
      await pg.addScriptTag({ path: path.join(OUT, 'music-master.bundle.js') });
      const m0 = await pg.evaluate(() => analyse([[0, 'state', 'build']], 24, { tempo: true, lib: 'MUSIC0' }));
      console.log(`INFO  master's build state (wave 8B): ${m0.bpm} BPM (repeat ${m0.raw}) · ${m0.onsets} onsets/s  →  now: ${TEMPO.build0.bpm} BPM · ${TEMPO.build0.onsets} (calm) · ${TEMPO.build1.onsets} (at work) · ${TEMPO.build2.onsets} (in the flow) onsets/s`);
      check('build: more onsets per second than master\'s build, even when calm', TEMPO.build0.onsets > m0.onsets, `${m0.onsets} → ${TEMPO.build0.onsets}`);
    } catch (e) { console.log('INFO  (no master comparison: ' + String(e.message || e).split('\n')[0] + ')'); }
    check('build: the work brings more (onsets/s: calm < at work < in the flow, the flow ≥ 1.25× calm)', TEMPO.build0.onsets < TEMPO.build1.onsets && TEMPO.build1.onsets < TEMPO.build2.onsets && TEMPO.build2.onsets >= TEMPO.build0.onsets * 1.25, `${TEMPO.build0.onsets} → ${TEMPO.build1.onsets} → ${TEMPO.build2.onsets}`);
    const info = await pg.evaluate(() => Object.fromEntries(MUSIC.MUSIC_STATES.map((s) => [s, MUSIC.stateInfo(s)])));
    check('Phase B keeps the Levites\' instruments: no drum in phaseB or shir; the shir has the one tziltzal', !info.phaseB.drums && !info.shir.drums && info.shir.cymbal, JSON.stringify({ phaseB: info.phaseB, shir: info.shir }));
    check('the festive state: a drum, the cymbal and the motif; the building has the motif', info.chag.drums && info.chag.cymbal && info.chag.motif && info.build.motif, JSON.stringify(info.chag));

    // 2. the crossfades: build → board → precision → moment → build → night → phaseB → silence
    const tr = await pg.evaluate(() => analyse([[0, 'state', 'build'], [6, 'state', 'board'], [12, 'state', 'precision'], [18, 'state', 'moment'], [26, 'state', 'build'], [32, 'state', 'night'], [38, 'state', 'phaseB'], [44, 'state', null]], 50));
    check('the crossfades: no clipping across seven changes of state', tr.peak < 0.98 && tr.clip === 0, `peak ${tr.peak}`);
    check('the crossfades: no hole (every second from 3 s to 44 s > 0.006)', Math.min(...tr.win.slice(3, 44)) > 0.006, `quietest ${Math.min(...tr.win.slice(3, 44)).toFixed(4)}`);
    check('null: the music fades to silence (the last second < 0.002, only the reverb tail before it)', tr.win[tr.win.length - 1] < 0.002, `last ${tr.win[tr.win.length - 1]}`);

    // 3. ducking: under a card the music drops by ≥ 12 dB and comes back
    const dk = await pg.evaluate(() => analyse([[0, 'state', 'build'], [8, 'duck', 0.15], [14, 'duck', 1]], 20));
    const before = avg(dk.win.slice(4, 8)), under = avg(dk.win.slice(9, 14)), after = avg(dk.win.slice(16, 20));
    check('ducking: ≥ 12 dB down under a card', under < before * 0.25, `${before.toFixed(4)} → ${under.toFixed(4)}`);
    check('ducking: back up after it', after > before * 0.6, `→ ${after.toFixed(4)}`);

    // 4. a flourish (a course, a stage, a won board) on top of the build never clips
    const fl = await pg.evaluate(() => analyse([[0, 'state', 'build'], [5, 'flourish'], [7, 'flourish'], [9, 'state', 'board'], [13, 'flourish']], 16));
    check('flourishes: no clipping', fl.peak < 0.98 && fl.clip === 0, `peak ${fl.peak}`);
    // the director's cues (bus/DESIGN8B.md): a boulder splits; eight stones set, one note each; the reveal's swell
    const cues = [[0, 'state', 'build']];
    for (let i = 0; i < 4; i++) cues.push([4 + i * 0.6, 'cue', 'split']);
    for (let i = 1; i <= 8; i++) cues.push([7 + i * 0.5, 'cue', 'land', i]);
    cues.push([12, 'state', 'moment'], [18, 'state', 'build']);
    const cu = await pg.evaluate((c) => analyse(c, 22), cues);
    check('cues (split ×4, land ×8, the reveal): no clipping, never silent', cu.peak < 0.98 && cu.clip === 0 && Math.min(...cu.win.slice(3)) > 0.006, `peak ${cu.peak}`);
    check('a split is heard above the bed (≥ +2 dB in its second)', cu.win[4] > avg(dk.win.slice(4, 8)) * 1.26, `${cu.win[4]} vs ${avg(dk.win.slice(4, 8)).toFixed(4)}`);
    // (world12) a course's fill, the trumpets over the shir (a tekiah; tekiah-teruah-tekiah), the chalil on its days
    const fi = await pg.evaluate(() => analyse([[0, 'int', 2], [0, 'state', 'build'], [6, 'cue', 'fill'], [10, 'cue', 'fill'], [13, 'state', 'chag'], [18, 'cue', 'fill']], 22));
    check('the fill (a darbuka roll into a dum and the cymbal): no clipping, never silent', fi.peak < 0.98 && fi.clip === 0 && Math.min(...fi.win.slice(3)) > 0.006, `peak ${fi.peak}`);
    const bl = await pg.evaluate(() => analyse([[0, 'state', 'shir'], [5, 'cue', 'blast', 1], [10, 'cue', 'blast', 3], [16, 'chalil', true], [16, 'state', 'phaseB'], [18, 'state', 'shir']], 24));
    check('the trumpets (a tekiah, then tekiah-teruah-tekiah): no clipping, heard above the song', bl.peak < 0.98 && bl.clip === 0 && Math.max(bl.win[5], bl.win[6]) > avg(bl.win.slice(2, 5)) * 1.2, `peak ${bl.peak}, ${avg(bl.win.slice(2, 5)).toFixed(4)} → ${Math.max(bl.win[5], bl.win[6])}`);

    // 5. the game's events → the state (no audio needed: the music is not started)
    const ev = await pg.evaluate(() => {
      const m = MUSIC.createMusic({ seed: 1 }), w = [];
      const e = (t, d, ph = 'A') => { m.event(t, d, ph); w.push(m.get().want); };
      e('start', { isNew: true }); e('timeOfDay', 'night'); e('m3open', {}); e('m3close', {}); e('timeOfDay', 'noon');
      e('minigameStart', { kind: 'crane' }); e('m3open', {}); e('minigame', { kind: 'crane' }); e('m3close', {});
      e('momentStart', { id: 'firstStone' }); e('moment', { id: 'firstStone' }); e('opening', { at: 'start' }); e('opening', { at: 'end' });
      e('boulder', { i: 0, left: 11 }); e('stoneSet', { id: 'wall', set: 1, by: 'player' }); e('phase', { id: 'har', ph: 'courses' });
      e('start', {}, 'B'); e('start', { isNew: false }, 'A');
      m.state('night'); w.push(m.get().want); m.state(undefined); w.push(m.get().want); m.state(null); w.push(m.get().want);
      m.destroy();
      return w;
    });
    // (world12: a moment done plays the festive state for 9 s — hence 'chag' after 'moment' and through the opening's end)
    const want = ['build', 'night', 'board', 'night', 'build', 'precision', 'precision', 'board', 'build', 'moment', 'chag', 'moment', 'chag', 'chag', 'chag', 'moment', 'phaseB', 'build', 'night', 'build', null];
    check('events → states (build, night, board, precision over board, moment, the festive end, the opening, cues, the reveal, Phase B, forced)', JSON.stringify(ev) === JSON.stringify(want), JSON.stringify(ev));
    // (world12) FUN12's cycle, the finale, AVODA12's shir, the work's pace
    const ev2 = await pg.evaluate(() => {
      const m = MUSIC.createMusic({ seed: 2 }), w = [];
      const e = (t, d, ph = 'A') => { m.event(t, d, ph); w.push(m.get().want); };
      e('start', { isNew: true }); e('m3open', { field: 'quarry', game: 'sling' }); e('m3close', {}); e('m3open', { field: 'quarry', game: 'board' }); e('m3close', {});
      e('m3open', { field: 'quarry', game: 'stack' }); e('m3close', {}); e('finale'); e('timeOfDay', 'night'); e('celebrate', { on: false });
      e('start', {}, 'B'); e('shirStart', { day: 0 }, 'B'); e('shirEnd', {}, 'B');
      const lv0 = m.get().intensity;
      for (let i = 0; i < 4; i++) m.event('strike', { combo: 1 }, 'A');
      const lv1 = m.get().intensity;
      for (let i = 0; i < 12; i++) m.event('strike', { combo: 2 }, 'A');   // (≥ 250 ms apart counts; a burst in one tick is one)
      m.event('strike', { combo: 7 }, 'A');
      const lv2 = m.get().intensity;
      m.destroy();
      return { w, lv: [lv0, lv1, lv2] };
    });
    check('events → states: the cycle\'s sling/stack → quarry, its board → board; the finale → chag (over the night); the shir in Phase B',
      JSON.stringify(ev2.w) === JSON.stringify(['build', 'quarry', 'build', 'board', 'build', 'quarry', 'build', 'chag', 'chag', 'night', 'phaseB', 'shir', 'phaseB']), JSON.stringify(ev2.w));
    check('the work\'s intensity: calm → at work (a burst counts once) → in the flow (a combo of 6)', ev2.lv[0] === 0 && ev2.lv[1] === 0 && ev2.lv[2] === 2, JSON.stringify(ev2.lv));

    // 6. the melodies: the same seed plays the same phrase; an answer lands on the final, a question on the fifth
    const mel = await pg.evaluate(() => {
      const a = MUSIC.melody(MUSIC.rng(9), [0, 3, 0, 6], 'calm', true), b = MUSIC.melody(MUSIC.rng(9), [0, 3, 0, 6], 'calm', true);
      const lastOf = (x) => { let l = null; x.forEach((n) => { if (n) l = n.deg; }); return l; };
      let ok = true;
      for (let s = 1; s < 60; s++) { const q = MUSIC.melody(MUSIC.rng(s), [0, 1, 0, 0], 'lively', false), an = MUSIC.melody(MUSIC.rng(s), [0, 6, 1, 0], 'noble', true); if (lastOf(q) !== 4 || (lastOf(an) % 7) !== 0) ok = false; }
      return { same: JSON.stringify(a) === JSON.stringify(b), ok };
    });
    check('melody: seeded (the same seed, the same phrase)', mel.same);
    check('melody: 59 seeds × 2: questions end on the fifth, answers on the final', mel.ok);
    check('no page errors', errors.length === 0, errors.join(' | '));
  } finally { await b.close(); }
  const bad = results.filter((r) => !r.ok);
  console.log(`\n${results.length - bad.length}/${results.length} passed`);
  process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
