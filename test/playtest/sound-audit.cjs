// (wave 7, FUN) The sound kit's loudness audit: every sound of src/game/audio.js rendered offline (1.8 s, mono), its peak and
// its loudest 300-ms RMS against the kit's median, so no sound is a blast or a whisper by accident (a teen mutes for good).
//   NODE_PATH=… node test/playtest/sound-audit.cjs   → a table here (LOUD > ×2.2 the median, quiet < ×0.3; climaxes may be loud)
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '../..'), OUT = path.join(ROOT, 'test/out/sound');
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'entry.js'), `import { createAudio, SOUNDS } from '../../../src/game/audio.js';\nwindow.__CA = createAudio; window.__S = SOUNDS;\n`);
require(require.resolve('esbuild', { paths: [ROOT] })).buildSync({ entryPoints: [path.join(OUT, 'entry.js')], bundle: true, format: 'iife', outfile: path.join(OUT, 'a.js'), logLevel: 'error' });
fs.writeFileSync(path.join(OUT, 'a.html'), '<!doctype html><meta charset="utf-8"><body><script src="a.js"></script></body>');
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    const pg = await b.newPage();
    await pg.goto('file://' + path.join(OUT, 'a.html'));
    const res = await pg.evaluate(async () => {
      const out = [];
      const opts = { m3match: { n: 3, combo: 1 }, hammer: { stone: 'lime', tool: 'mallet', force: 0.7 }, chime: { combo: 3 }, tier: { n: 3 }, m3stars: { n: 3 }, m3blast: { kind: 'line' } };
      for (const name of window.__S) {
        let c = null;
        window.AudioContext = function () { c = new OfflineAudioContext(1, 44100 * 1.8, 44100); Object.defineProperty(c, 'state', { value: 'running' }); c.resume = () => Promise.resolve(); return c; };
        const a = window.__CA({});
        a.unlock(); a.play(name, opts[name] || {});
        const buf = await c.startRendering(); const d = buf.getChannelData(0);
        let peak = 0; for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]));
        const W = 13230; let best = 0; let acc = 0; for (let i = 0; i < d.length; i++) { acc += d[i] * d[i]; if (i >= W) acc -= d[i - W] * d[i - W]; if (i >= W - 1) best = Math.max(best, acc / W); }
        let last = 0; for (let i = d.length - 1; i >= 0; i--) if (Math.abs(d[i]) > 0.01) { last = i; break; }
        out.push({ name, peak: +peak.toFixed(3), rms: +Math.sqrt(best).toFixed(4), len: +(last / 44100).toFixed(2) });
      }
      return out;
    });
    const med = res.map((r) => r.rms).filter((x) => x > 0).sort((a, b) => a - b)[Math.floor(res.length / 2)];
    console.log('median rms (300 ms window):', med);
    for (const r of res.sort((x, y) => y.rms - x.rms)) console.log(`${r.name.padEnd(10)} peak ${String(r.peak).padEnd(6)} rms ${String(r.rms).padEnd(7)} ×${(r.rms / med).toFixed(2)} len ${r.len}s${r.rms > 2.2 * med ? '  LOUD' : r.rms < 0.3 * med ? '  quiet' : ''}`);
  } finally { await b.close(); }
})();
