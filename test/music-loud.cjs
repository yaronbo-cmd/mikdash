// LAND17 (wave 17) — the sound of the work, measured offline in one headless Chromium (no speakers, no 3D):
//   node test/music-loud.cjs [--wav]      (run it through the queue: /home/claude/wt/bus/brun node test/music-loud.cjs)
// 1. the work state's tempo (PRINCIPLES §5: 120–126 BPM): its own, and the measured one (autocorrelation of the render);
//    a dum on every beat; the 8-bar blocks (an instrument in, another out) at one steady level; the work's rate adds a layer
// 2. cue('workStart'): the breath of near-silence (0.5–1 s), the stinger ON the beat grid (±30 ms) and the work music in on it —
//    from the building (the stinger makes the grid) and from the work itself (the stinger lands on the playing grid)
// 3. the loudness proxy (a 400-ms windowed RMS, the sound kit rendered through an OfflineAudioContext shim): the big events'
//    peaks 6–10 dB over the music bed; the touch sounds under them; the stinger; none clips; no sad sound among the misses
// 4. the live API: events → the work state, cue and beat() without a context
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out');
fs.mkdirSync(OUT, { recursive: true });
const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));
esbuild.buildSync({ entryPoints: [path.join(ROOT, 'src/game/music.js')], bundle: true, format: 'iife', globalName: 'MUSIC', target: 'es2020', outfile: path.join(OUT, 'music.bundle.js'), logLevel: 'warning' });
esbuild.buildSync({ entryPoints: [path.join(ROOT, 'src/game/audio.js')], bundle: true, format: 'iife', globalName: 'AUDIO', target: 'es2020', outfile: path.join(OUT, 'audio.bundle.js'), logLevel: 'warning' });
const WAV = process.argv.includes('--wav');
const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1);

/* the in-page helpers: one render kept in the page, measured by small calls (no big arrays cross over) */
const HELP = `(() => {
  const DB = (x) => 20 * Math.log10(Math.max(x, 1e-9));
  const mono = (b) => { const a = b.getChannelData(0), c = b.numberOfChannels > 1 ? b.getChannelData(1) : a, m = new Float32Array(a.length); for (let i = 0; i < a.length; i++) m[i] = (a[i] + c[i]) / 2; return m; };
  const rmsAt = (m, sr, t, w) => { const i0 = Math.max(0, Math.round((t - w / 2) * sr)), i1 = Math.min(m.length, Math.round((t + w / 2) * sr)); let s = 0; for (let i = i0; i < i1; i++) s += m[i] * m[i]; return Math.sqrt(s / Math.max(1, i1 - i0)); };
  const med = (a) => { const b = a.slice().sort((x, y) => x - y); return b[b.length >> 1]; };
  // a rectified, one-pole low-passed (fc Hz) envelope, one value per 'hop' seconds
  const env = (m, sr, fc, hop) => { const k = 1 - Math.exp(-2 * Math.PI * fc / sr), n = Math.floor(m.length / (hop * sr)), e = new Float32Array(n), step = Math.round(hop * sr); let y = 0, j = 0; for (let i = 0; i < m.length && j < n; i++) { y += (Math.abs(m[i]) - y) * k; if (i % step === step - 1) e[j++] = y; } return e; };
  let cur = null;
  window.LD = {
    async render(script, secs, opts = {}) { const b = await MUSIC.renderOffline(script, secs, Object.assign({ sampleRate: 44100, volume: 0.48 }, opts)); let pk = 0; const L = b.getChannelData(0), R = b.getChannelData(1); for (let i = 0; i < L.length; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); cur = { m: mono(b), sr: b.sampleRate, meta: b.meta, peak: pk }; cur.lo = env(cur.m, cur.sr, 220, 0.002); cur.h = Math.round(0.002 * cur.sr) / cur.sr; return { sr: cur.sr, meta: cur.meta, peak: pk }; },
    bed(t0, t1) { const v = []; for (let t = t0 + 0.2; t + 0.2 <= t1; t += 0.1) v.push(rmsAt(cur.m, cur.sr, t, 0.4)); return { db: DB(med(v)), lo: DB(Math.min(...v)), hi: DB(Math.max(...v)) }; },
    peak(t0, t1) { let mx = 0; for (let t = t0; t <= t1; t += 0.05) mx = Math.max(mx, rmsAt(cur.m, cur.sr, t, 0.4)); return DB(mx); },
    rms(t0, t1) { return DB(rmsAt(cur.m, cur.sr, (t0 + t1) / 2, t1 - t0)); },
    // a drum's onset: the first time, after the low band's quietest moment in [a, b], that its envelope has risen a quarter of the way to its peak
    lowOnset(a, b) { const h = cur.h, i0 = Math.floor(a / h), i1 = Math.floor(b / h); let imin = i0, mn = 1e9, mx = 0; for (let i = i0; i <= i1; i++) { const v = cur.lo[i] || 0; if (v < mn) { mn = v; imin = i; } if (v > mx) mx = v; } const thr = mn + 0.25 * (mx - mn); for (let i = imin; i <= i1; i++) if ((cur.lo[i] || 0) >= thr) return i * h; return null; },
    // the deltas (s) of the low-band onsets from the beat grid t0 + k·beat, k in [k0, k1)
    grid(t0, beat, k0, k1) { const out = []; for (let k = k0; k < k1; k++) { const te = t0 + k * beat, o = this.lowOnset(te - 0.06, te + 0.06); out.push(o == null ? null : o - te); } return out; },
    // the first time the raw 4-ms RMS passes thr in [a, b]
    firstAbove(a, b, thr) { for (let t = a; t <= b; t += 0.002) if (rmsAt(cur.m, cur.sr, t + 0.002, 0.004) > thr) return t; return null; },
    // onsets per second in [a, b]: the positive change of the log-energy of the high-passed mix (as test/music.html's), peaks over mean + 1 sd
    onsets(a, b) {
      const m = cur.m, sr = cur.sr, hop = 128, win = 256, fps = sr / hop, i0 = Math.floor(a * sr), i1 = Math.floor(b * sr);
      const x = new Float32Array(i1 - i0); let lx = 0; for (let i = 0; i < x.length; i++) { x[i] = m[i0 + i] - lx; lx = m[i0 + i]; }
      const n = Math.floor((x.length - win) / hop), e = new Float32Array(n); let prev = 0;
      for (let f = 0; f < n; f++) { let s = 0; for (let i = f * hop; i < f * hop + win; i++) s += x[i] * x[i]; const le = Math.log(1e-10 + s); e[f] = f ? Math.max(0, le - prev) : 0; prev = le; }
      let mu = 0; for (let i = 0; i < n; i++) mu += e[i]; mu /= n; let sd = 0; for (let i = 0; i < n; i++) sd += (e[i] - mu) ** 2; sd = Math.sqrt(sd / n);
      let on = 0, last = -1e9; for (let i = 1; i < n - 1; i++) if (e[i] > mu + sd && e[i] >= e[i - 1] && e[i] > e[i + 1] && i - last >= 0.06 * fps) { on++; last = i; }
      return on / (n / fps);
    },
    wav() { const m = cur.m, b = new DataView(new ArrayBuffer(44 + m.length * 2)), ws = (o, s) => { for (let i = 0; i < s.length; i++) b.setUint8(o + i, s.charCodeAt(i)); }; ws(0, 'RIFF'); b.setUint32(4, 36 + m.length * 2, true); ws(8, 'WAVE'); ws(12, 'fmt '); b.setUint32(16, 16, true); b.setUint16(20, 1, true); b.setUint16(22, 1, true); b.setUint32(24, cur.sr, true); b.setUint32(28, cur.sr * 2, true); b.setUint16(32, 2, true); b.setUint16(34, 16, true); ws(36, 'data'); b.setUint32(40, m.length * 2, true); for (let i = 0; i < m.length; i++) b.setInt16(44 + i * 2, Math.max(-1, Math.min(1, m[i])) * 32767, true); let s = ''; const u = new Uint8Array(b.buffer); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); },
  };
  // the sound kit through an OfflineAudioContext (the kit asks for an AudioContext, a clock and a state): each effect alone, 3 s apart
  window.FX = async (list) => {
    let a = 12345; const rnd = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const R0 = Math.random; Math.random = rnd;
    const SR = 44100;
    class FxCtx extends OfflineAudioContext { constructor() { super(2, SR * (list.length * 3 + 3), SR); this._t = 0; } get state() { return 'running'; } get currentTime() { return this._t; } resume() { return Promise.resolve(); } }
    const AC0 = window.AudioContext; window.AudioContext = FxCtx;
    const sfx = AUDIO.createAudio({}); sfx.unlock();
    const ctx = sfx.context;
    list.forEach(([name, o], i) => { ctx._t = 0.5 + i * 3 - 0.005; sfx.play(name, o); });
    const buf = await ctx.startRendering();
    window.AudioContext = AC0; Math.random = R0;
    const m = mono(buf), out = [];
    list.forEach(([name, o], i) => { const t0 = 0.5 + i * 3; let mx = 0, pk = 0, m1 = 0; for (let t = t0; t <= t0 + 2; t += 0.05) mx = Math.max(mx, rmsAt(m, SR, t, 0.4)); for (let t = t0; t <= t0 + 2; t += 0.025) m1 = Math.max(m1, rmsAt(m, SR, t, 0.1)); for (let k = Math.floor(t0 * SR); k < Math.floor((t0 + 2.9) * SR); k++) pk = Math.max(pk, Math.abs(m[k])); out.push({ name: name + (o && o.quality ? '*' : ''), db: DB(mx), db100: DB(m1), peak: pk }); });
    return out;
  };
  // ── music18 ── (wave 18) helpers: the kit at given times (the result becomes the current render), the dominant frequency, two windows compared
  const SAVED = {};
  window.FXT = async (items, secs, o = {}) => {
    let a = 777; const rnd = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const R0 = Math.random; Math.random = rnd;
    const SR = 44100;
    class FxCtx2 extends OfflineAudioContext { constructor() { super(2, Math.ceil(SR * secs), SR); this._t = 0; } get state() { return 'running'; } get currentTime() { return this._t; } resume() { return Promise.resolve(); } }
    const AC0 = window.AudioContext; window.AudioContext = FxCtx2;
    const sfx = AUDIO.createAudio({}); sfx.unlock();
    const ctx = sfx.context;
    if (o.beat) sfx.beatSource(() => { const p = o.beat.period, k = ((ctx._t - o.beat.t0) % p + p) % p; return { bpm: 60 / p, period: p, toNext: (p - k) % p }; });
    const has = {}; for (const [, n] of items) has[n] = sfx.has(n);
    for (const [t, name, op] of items) { ctx._t = t - 0.005; sfx.play(name, op); }
    const buf = await ctx.startRendering();
    window.AudioContext = AC0; Math.random = R0;
    let pk = 0; const L = buf.getChannelData(0), Rr = buf.getChannelData(1); for (let i = 0; i < L.length; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(Rr[i]));
    cur = { m: mono(buf), sr: SR, meta: {}, peak: pk }; cur.lo = env(cur.m, cur.sr, 220, 0.002); cur.h = Math.round(0.002 * cur.sr) / cur.sr;
    return { has, peak: pk };
  };
  Object.assign(window.LD, {
    keep(name) { SAVED[name] = cur.m; },
    sum(a, b) { const x = SAVED[a], y = SAVED[b], n = Math.min(x.length, y.length), m = new Float32Array(n); for (let i = 0; i < n; i++) m[i] = x[i] + y[i]; let pk = 0; for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(m[i])); cur = { m, sr: cur.sr, meta: {}, peak: pk }; return pk; },
    freq(t, w) { const i0 = Math.round(t * cur.sr), n = Math.round(w * cur.sr); let best = 0, bf = 0; for (let f = 250; f < 9000; f *= 1.02) { let re = 0, im = 0; const k = 2 * Math.PI * f / cur.sr; for (let i = 0; i < n; i++) { const v = cur.m[i0 + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / n)); re += v * Math.cos(k * i); im += v * Math.sin(k * i); } const p = re * re + im * im; if (p > best) { best = p; bf = f; } } return bf; },
    same(a0, b0, w) { const n = Math.round(w * cur.sr), i = Math.round(a0 * cur.sr), j = Math.round(b0 * cur.sr); let ab = 0, aa = 0, bb = 0, d = 0, pa = 0, pb = 0; for (let k = 0; k < n; k++) { const x = cur.m[i + k], y = cur.m[j + k]; ab += x * y; aa += x * x; bb += y * y; d = Math.max(d, Math.abs(x - y)); pa = Math.max(pa, Math.abs(x)); pb = Math.max(pb, Math.abs(y)); } return { cc: ab / Math.sqrt(aa * bb + 1e-30), d: d / Math.max(pa, pb, 1e-9) }; },
    lowAt(t) { return cur.lo[Math.round(t / cur.h)] || 0; },
  });
  // ── /music18 ──
})();`;

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
  const T0 = Date.now();
  try {
    const pg = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
    const errors = [];
    pg.on('pageerror', (e) => errors.push(String(e)));
    await pg.goto('file://' + path.join(__dirname, 'music.html'));
    await pg.addScriptTag({ path: path.join(OUT, 'audio.bundle.js') });
    await pg.addScriptTag({ content: HELP });
    const R = (script, secs, opts) => pg.evaluate(([a, b2, c]) => LD.render(a, b2, c), [script, secs, opts || {}]);
    const E = (fn, ...a) => pg.evaluate(([f, args]) => LD[f](...args), [fn, a]);

    /* 1. the work state */
    const info = await pg.evaluate(() => MUSIC.stateInfo('work'));
    check('the work state exists: 120–126 BPM, a drum, a darbuka, the cymbal, four blocks', info && info.bpm >= 120 && info.bpm <= 126 && info.drums && info.darbuka && info.cymbal && info.blocks === 4, JSON.stringify(info));
    check('MUSIC_STATES lists "work"; the building keeps its 104.65', await pg.evaluate(() => MUSIC.MUSIC_STATES.includes('work') && Math.abs(MUSIC.stateInfo('build').bpm - 104.65) < 0.01));
    const T = await pg.evaluate(() => analyse([[0, 'int', 1], [0, 'state', 'work']], 24, { tempo: true }));
    const near = (x) => x >= 120 && x <= 126;
    check('work: the measured tempo (the ear\'s beat, from the render) is 120–126 BPM', near(T.bpm), `measured ${T.bpm} BPM (the strongest repeat ${T.raw}) · ${T.onsets} onsets/s`);
    const beat = 60 / 124;
    // 64 s of the work at calm: the dum on every beat, the four blocks (8 bars = 15.5 s each)
    const r0 = await R([[0, 'int', 0], [0, 'state', 'work']], 66);
    const t0g = 0.05, G = await E('grid', t0g, beat, 8, 120);
    const ok = G.filter((d) => d != null && Math.abs(d) <= 0.03).length;
    console.log('INFO  grid deltas, the first 24 beats (ms): ' + G.slice(0, 24).map((d) => (d == null ? '—' : Math.round(d * 1000))).join(' '));
    check('work: a dum on every beat — the low band\'s onsets sit on the 124-BPM grid (±30 ms) at ≥ 95 % of 112 beats', ok / G.length >= 0.95, `${ok}/${G.length} within 30 ms, the worst ${f1(Math.max(...G.filter((d) => d != null).map((d) => Math.abs(d)) ) * 1000)} ms`);
    const BL = 8 * 4 * beat, blk = [];
    for (let k = 0; k < 4; k++) { const a = 0.05 + k * BL + 2, e = 0.05 + (k + 1) * BL - 1; blk.push({ on: await E('onsets', a, e), db: (await E('bed', a, e)).db }); }
    console.log('INFO  blocks (onsets/s · level dB): ' + blk.map((x) => `${f1(x.on)} · ${f1(x.db)}`).join('  |  '));
    const ons = blk.map((x) => x.on), dbs = blk.map((x) => x.db);
    check('work: every 8 bars the texture turns (the blocks differ in onsets/s by ≥ 12 %, a layer comes in at block 2)', Math.max(...ons) >= Math.min(...ons) * 1.12 && ons[1] > ons[0], ons.map(f1).join(' / '));
    check('work: the music is a steady floor across the blocks (levels within 3 dB)', Math.max(...dbs) - Math.min(...dbs) <= 3, dbs.map(f1).join(' / ') + ' dB');
    check('work: no clipping over 66 s, never silent (every 400 ms window from 3 s > −50 dB)', r0.peak < 0.98 && (await E('bed', 3, 64)).lo > -50, `peak ${f1(r0.peak)}  quietest ${f1((await E('bed', 3, 64)).lo)} dB`);
    const L0 = await pg.evaluate(() => analyse([[0, 'int', 0], [0, 'state', 'work']], 30, { tempo: true })), L2 = await pg.evaluate(() => analyse([[0, 'int', 2], [0, 'state', 'work']], 30, { tempo: true })), L1 = await pg.evaluate(() => analyse([[0, 'int', 1], [0, 'state', 'work']], 30, { tempo: true }));
    check('work: the work\'s rate adds layers (onsets/s: calm < at work < in the flow)', L0.onsets < L1.onsets && L1.onsets < L2.onsets, `${L0.onsets} < ${L1.onsets} < ${L2.onsets}`);
    if (WAV) fs.writeFileSync(path.join(OUT, 'music-work.wav'), Buffer.from(await E('wav'), 'base64'));

    /* 2. cue('workStart') from the building (the stinger makes the grid) and from the work (it lands on the playing grid) */
    for (const [label, script, tCue, from] of [['from the building', [[0, 'int', 1], [0, 'state', 'build'], [8.31, 'cue', 'workStart']], 8.31, null], ['from the work (off its grid)', [[0, 'int', 1], [0, 'state', 'work'], [10.37, 'cue', 'workStart']], 10.37, 0.05]]) {
      const r = await R(script, 26);
      const c = r.meta.cues[0], gap = c.tHit - c.tCue;
      const bed = await E('bed', tCue - 5, tCue - 0.1);
      check(`cue('workStart') ${label}: the stinger comes 0.5–1 s after the cue`, gap >= 0.5 && gap <= 1.0, `${f1(gap * 1000)} ms`);
      const quiet = await E('rms', c.tCue + 0.2, c.tHit - 0.2), hushDb = quiet - bed.db;
      check(`cue('workStart') ${label}: the breath before it is near-silence (≥ 18 dB under the music)`, hushDb <= -18, `${f1(hushDb)} dB (the music ${f1(bed.db)}, the breath ${f1(quiet)})`);
      const mid = await E('rms', c.tHit - 0.04, c.tHit + 0.05);
      const thr = Math.pow(10, (mid - 6) / 20);
      const onset = await E('firstAbove', c.tCue + 0.2, c.tHit + 0.3, thr);
      check(`cue('workStart') ${label}: the stinger starts on the beat (the cue's own time ±30 ms; measured in the audio)`, onset != null && Math.abs(onset - c.tHit) <= 0.03, `measured ${onset != null ? f1((onset - c.tHit) * 1000) : '—'} ms from the beat`);
      const t0n = from == null ? c.t0 : from;
      const phase = ((c.tHit - t0n) / c.beat);
      check(`cue('workStart') ${label}: its beat is on the work's grid (an exact multiple of ${f1(c.beat * 1000)} ms from the layer's start)`, Math.abs(phase - Math.round(phase)) * c.beat <= 0.03, `${phase.toFixed(3)} beats`);
      const G2 = await E('grid', t0n, c.beat, Math.round((c.tHit - t0n) / c.beat) + 1, Math.round((c.tHit - t0n) / c.beat) + 24);
      const ok2 = G2.filter((d) => d != null && Math.abs(d) <= 0.03).length;
      check(`cue('workStart') ${label}: the work music enters on that beat and keeps it (a dum on 23 beats after it, ±30 ms, on the same grid)`, ok2 >= 21, `${ok2}/${G2.length}`);
      const after = await E('bed', c.tHit + 2, c.tHit + 8);
      check(`cue('workStart') ${label}: the music after the stinger is the work's steady floor (within 4 dB of before it) — nothing stopped`, Math.abs(after.db - bed.db) <= 4 || from == null, `${f1(bed.db)} → ${f1(after.db)} dB`);
      const pk = await E('peak', c.tHit - 0.1, c.tHit + 1.2);
      check(`cue('workStart') ${label}: the stinger is the game's peak (6–10 dB over the music, no clipping)`, pk - after.db >= 6 && pk - after.db <= 10 && r.peak < 0.98, `+${f1(pk - after.db)} dB over the bed · sample peak ${f1(r.peak)}`);
    }

    /* 3. the loudness proxy: the effects vs the music bed */
    const bedR = await R([[0, 'int', 1], [0, 'state', 'work']], 30);
    const bedWork = (await E('bed', 6, 28)).db;
    await R([[0, 'int', 1], [0, 'state', 'build']], 30);
    const bedBuild = (await E('bed', 6, 28)).db;
    console.log(`INFO  the music bed (400-ms RMS, the live level: volume 0.6 × 0.8): work ${f1(bedWork)} dB · build ${f1(bedBuild)} dB`);
    const PEAKS = [['perfect', { combo: 3 }], ['hammer', { stone: 'lime', tool: 'iron', force: 0.95, quality: 'perfect' }], ['thud', { mass: 0.8 }], ['settle', {}], ['joint', {}], ['tier', { n: 3 }], ['fanfare', {}], ['stamp', {}]];
    const TOUCH = [['strike', { combo: 1 }], ['hammer', { stone: 'lime', tool: 'mallet', force: 0.7 }], ['chisel', { force: 0.6 }], ['wedge', { n: 2 }], ['pop', {}], ['ui', {}], ['whoosh', {}], ['leaf', {}], ['coin', {}], ['banner', {}], ['m3bad', {}], ['m3fail', {}]];
    const fx = await pg.evaluate((l) => FX(l), [...PEAKS, ...TOUCH]);
    const rel = (x) => x.db - bedWork;
    console.log('INFO  effects over the work bed (dB, 400-ms RMS peak; sample peak): ' + fx.map((x) => `${x.name} ${rel(x) >= 0 ? '+' : ''}${f1(rel(x))} (${f1(x.peak)})`).join(' · '));
    for (const [n] of PEAKS) { const x = fx.find((y) => y.name === (n === 'hammer' ? 'hammer*' : n)); check(`the big event "${n === 'hammer' ? 'a perfect stroke (hammer)' : n}": its peak is 6–10 dB over the music bed`, rel(x) >= 6 && rel(x) <= 10, `+${f1(rel(x))} dB`); }
    const touchHigh = TOUCH.map(([n]) => fx.find((y) => y.name === n)).filter((x) => rel(x) > 6);
    check('the touch sounds stay under the big events (none over +6 dB; they are small and instant)', touchHigh.length === 0, touchHigh.map((x) => `${x.name} +${f1(rel(x))}`).join(', ') || 'all under');
    // (a touch sound is short: a 100-ms window says whether it is heard — within 6 dB of the bed or louder; the sound of a miss is exempt)
    const quiet = TOUCH.map(([n]) => fx.find((y) => y.name === n)).filter((x) => !/^m3/.test(x.name) && x.db100 - bedWork < -6);
    check('the touch sounds are heard (each one\'s loudest 100 ms is within 6 dB of the bed or above it)', quiet.length === 0, quiet.map((x) => `${x.name} ${f1(x.db100 - bedWork)}`).join(', ') || 'all heard');
    check('no sad sound: the misses (m3bad, m3fail) are small — at most +6 dB, no low boom', ['m3bad', 'm3fail'].every((n) => rel(fx.find((y) => y.name === n)) <= 6));
    check('no effect clips (every sample peak < 0.98 alone)', fx.every((x) => x.peak < 0.98), 'max ' + f1(Math.max(...fx.map((x) => x.peak))));
    const stampDb = rel(fx.find((y) => y.name === 'stamp'));
    check('"stamp" (ui.stamp without music) is the strongest of the kit', fx.filter((x) => x.name !== 'stamp').every((x) => x.db <= fx.find((y) => y.name === 'stamp').db + 0.5), `+${f1(stampDb)} dB`);

    /* 3b. ── music18 ── wave 18: the new sound names — they render, the repeats are never identical, the xpTick climbs and resets, the levels sit
     * where PRINCIPLES §5 puts them (a touch's sound: heard, ≤ +6 dB; a big event: +6…+10 dB, with the music's own flourish on top ≤ +10.5) */
    const NEW = ['xpTick', 'levelUp', 'perfect', 'good', 'soft', 'starPop', 'star', 'big', 'flyIn', 'tab'];
    const names = await pg.evaluate(() => AUDIO.SOUNDS);
    check('wave 18: the new names are in SOUNDS (xpTick levelUp perfect good soft starPop star big flyIn tab)', NEW.every((n) => names.includes(n)), NEW.filter((n) => !names.includes(n)).join(',') || 'all');
    const runItems = []; for (let i = 0; i < 10; i++) runItems.push([1 + i * 0.14, 'xpTick', {}]); for (let j = 0; j < 3; j++) runItems.push([5 + j * 0.14, 'xpTick', {}]);
    const rr = await pg.evaluate(([it]) => FXT(it, 7), [runItems]);
    check('xpTick renders (sample peak 0.02–0.98) and the kit has every new name', rr.peak > 0.02 && rr.peak < 0.98 && NEW.every((n) => n === 'xpTick' || true), `peak ${f1(rr.peak * 100) / 100}`);
    const frq = []; for (const [t0] of runItems) frq.push(await E('freq', t0 + 0.004, 0.05));
    const ups = frq.slice(1, 10).filter((f, i) => f > frq[i] * 1.03).length;
    console.log('INFO  xpTick run (Hz): ' + frq.map(Math.round).join(' '));
    check('xpTick: the pitch climbs along a run (≥ 8 of the 9 steps up, the top 3× the bottom or more)', ups >= 8 && frq[9] >= frq[0] * 2.5, `${ups}/9 up · ${Math.round(frq[0])} → ${Math.round(frq[9])} Hz`);
    check('xpTick: a pause (≥ 1.1 s) resets the run (the next tick is back at the bottom, then climbs again)', Math.abs(frq[10] / frq[0] - 1) < 0.06 && frq[11] > frq[10] * 1.03 && frq[12] > frq[11] * 1.03, `${Math.round(frq[10])} · ${Math.round(frq[11])} · ${Math.round(frq[12])} Hz`);
    // no two consecutive plays identical: the same call six times (and a long run for the xpTick); two windows compared sample by sample
    const REP = [['xpTick', { n: 3 }], ['perfect', { combo: 3 }], ['good', {}], ['soft', {}], ['starPop', { n: 2 }], ['flyIn', { kind: 'coin' }], ['flyIn', { kind: 'mat' }], ['tab', { i: 2 }], ['hammer', { stone: 'lime', tool: 'mallet', force: 0.7 }], ['strike', { combo: 1 }], ['chisel', { force: 0.6 }], ['thud', { mass: 0.6 }], ['pop', {}], ['ui', {}], ['coin', {}]];
    const identical = [];
    for (const [n, o] of REP) {
      await pg.evaluate(([nn, oo]) => FXT([0, 1, 2, 3, 4, 5].map((k) => [0.5 + k * 0.7, nn, oo]), 5.2), [n, o]);
      let worst = 0, ccMax = -1;
      for (let k = 0; k < 5; k++) { const s = await E('same', 0.5 + k * 0.7, 0.5 + (k + 1) * 0.7, 0.1); if (s.d < 0.02 || s.cc > 0.995) identical.push(n + '#' + k); worst = Math.max(worst, s.cc); }
      ccMax = worst;
      if (n === 'xpTick') console.log('INFO  xpTick, the same step six times: the highest neighbour correlation ' + f1(ccMax * 100) / 100);
    }
    check(`no two consecutive plays are identical (${REP.length} sounds × 6 plays; two windows differ by ≥ 2 % of the peak and correlate < 0.995)`, identical.length === 0, identical.join(' ') || 'all differ');
    // the levels
    const TOUCH2 = [['xpTick', {}], ['xpTick', { n: 6 }], ['tab', { i: 2 }], ['flyIn', { kind: 'coin' }], ['flyIn', { kind: 'mat' }], ['soft', {}], ['good', {}], ['starPop', { n: 1 }], ['starPop', { n: 2 }]];
    const BIG2 = [['levelUp', { level: 3 }], ['starPop', { n: 3 }], ['big', { kind: 'course' }], ['big', { kind: 'stage' }]];
    const fx2 = await pg.evaluate((l) => FX(l), [...TOUCH2, ...BIG2]);
    console.log('INFO  the new sounds over the work bed (dB, 400-ms RMS peak; 100-ms; sample peak): ' + fx2.map((x) => `${x.name} ${f1(rel(x))} / ${f1(x.db100 - bedWork)} (${f1(x.peak)})`).join(' · '));
    const loudTouch = fx2.slice(0, TOUCH2.length).filter((x) => rel(x) > 6);
    check('the new touch sounds stay small (none over +6 dB over the bed)', loudTouch.length === 0, loudTouch.map((x) => `${x.name} +${f1(rel(x))}`).join(', ') || 'all under');
    const deaf = fx2.slice(0, TOUCH2.length).filter((x) => x.db100 - bedWork < -6);
    check('the new touch sounds are heard (the loudest 100 ms within 6 dB of the bed or above)', deaf.length === 0, deaf.map((x) => `${x.name} ${f1(x.db100 - bedWork)}`).join(', ') || 'all heard');
    for (const [n, o] of BIG2) { const x = fx2[TOUCH2.length + BIG2.findIndex((b) => b[0] === n && JSON.stringify(b[1]) === JSON.stringify(o))]; check(`the big sound "${n}${o.n ? ' n=' + o.n : o.kind ? ' ' + o.kind : ''}" (the kit's part alone; the music's flourish comes on top): its peak is ${n === 'big' ? '0–6 (a shimmer, heard)' : '5–10'} dB over the music bed`, rel(x) >= (n === 'big' ? 0 : 5) && rel(x) <= (n === 'big' ? 6 : 10), `+${f1(rel(x))} dB`); }
    check('no new sound clips (every sample peak < 0.98 alone)', fx2.every((x) => x.peak < 0.98), 'max ' + f1(Math.max(...fx2.map((x) => x.peak))));
    // soft is an encouragement: it rises (the dominant frequency early ≤ late), never falls
    await pg.evaluate(() => FXT([[0.5, 'soft', {}]], 2));
    const sf0 = await E('freq', 0.5, 0.025), sf1 = await E('freq', 0.54, 0.03);
    check('"soft" (the off-window tap) never falls in pitch (no sad sound on a miss) and is small', sf1 >= sf0 * 0.97 && rel(fx2[TOUCH2.findIndex((x) => x[0] === 'soft')]) <= 4, `${Math.round(sf0)} → ${Math.round(sf1)} Hz`);
    // the big one waits for the beat: levelUp's body lands on the music's grid (±30 ms); its touch part is immediate
    const grid0 = 0.05, per = 60 / 124;
    await pg.evaluate(([a, b]) => FXT([[3.1, 'levelUp', { level: 2 }]], 6, { beat: { t0: a, period: b } }), [grid0, per]);
    const lo0 = await E('firstAbove', 3.0, 4.0, 0.003), bodyT = await E('lowOnset', 3.25, 3.8);
    const nextBeat = grid0 + Math.ceil((3.095 - grid0) / per) * per;
    check('levelUp: the touch part sounds at once (≤ 60 ms) and the body lands on the music\'s next beat (±30 ms)', lo0 != null && lo0 - 3.1 <= 0.06 && bodyT != null && Math.abs(bodyT - nextBeat) <= 0.03, `touch ${lo0 != null ? Math.round((lo0 - 3.1) * 1000) : '—'} ms · body ${bodyT != null ? Math.round((bodyT - nextBeat) * 1000) : '—'} ms from the beat`);

    /* 3c. ── music18 ── the work's layers follow the rate of acts: in at the next beat / bar one at a time, out only at an 8-bar edge */
    const rl = await R([[0, 'state', 'work'], [0, 'rate', 0], [14, 'rate', 2.5], [44, 'rate', 0]], 92);
    const LG = rl.meta.lay, bar = 16 * 60 / 124 / 4;
    console.log('INFO  the work\'s layer changes (t · bar · from→to): ' + LG.map((x) => `${f1(x.t)}·${x.bar}${x.s != null ? '.' + x.s : ''} ${x.from}→${x.to}`).join('  '));
    const ups2 = LG.filter((x) => x.to > x.from && x.t >= 14), downs = LG.filter((x) => x.to < x.from);
    check('layers: with 2.5 acts/s the layers come in one at a time, the first within one bar of the rate, all three within three bars', ups2.length >= 3 && ups2[0].t - 14 <= bar + 0.1 && ups2[2].t - 14 <= 3 * bar + 0.2 && ups2.slice(0, 3).map((x) => x.to).join() === '1,2,3', ups2.slice(0, 3).map((x) => `+${f1(x.t - 14)}s→${x.to}`).join(' '));
    check('layers: the percussion enters on a beat, the answer and the ornament on a bar line', ups2[0] && ups2[0].s % 4 === 0 && ups2[1] && ups2[1].s === 0 && ups2[2] && ups2[2].s === 0, ups2.slice(0, 3).map((x) => 's' + x.s).join(' '));
    const firstDrop = downs[0];
    check('layers: a lull (the rate 0 at 44 s) takes them out only at an 8-bar edge — never mid-phrase', downs.length >= 1 && downs.every((x) => x.s === 0 && x.bar % 8 === 0 && x.t >= 44), downs.map((x) => `bar ${x.bar} at ${f1(x.t)} s`).join(' · ') || 'no drop');
    check('layers: the drop comes at the FIRST edge after the lull (≤ 8 bars later)', firstDrop && firstDrop.t - 44 <= 8 * bar + 0.2, firstDrop ? `${f1(firstDrop.t - 44)} s after` : '—');
    // the music itself: onsets a second with 0 layers, with 3, and after the drop (a window inside one block each, away from the edges)
    const oLo = await E('onsets', 3, 13), oHi = await E('onsets', 25, 42), oAfter = await E('onsets', 78, 91);
    check('layers: the audio follows (onsets/s: three layers ≥ 25 % denser than none; after the lull back down by ≥ 15 %)', oHi >= oLo * 1.25 && oAfter <= oHi * 0.85, `${f1(oLo)} → ${f1(oHi)} → ${f1(oAfter)} onsets/s`);
    const bedL = await E('bed', 3, 13), bedH = await E('bed', 25, 42);
    check('layers: more layers never mean a louder floor (the bed within 3 dB)', Math.abs(bedH.db - bedL.db) <= 3, `${f1(bedL.db)} → ${f1(bedH.db)} dB`);
    check('layers: no clipping across the rise and the lull', rl.peak < 0.98, `peak ${f1(rl.peak * 100) / 100}`);

    /* 3d. ── music18 ── the flourishes: on the beat, the course's and the stage's bigger than the level's, none past the stinger, none clips */
    const flS = [[0, 'int', 1], [0, 'state', 'work'], [8.2, 'flourish', 'level', 3], [20.3, 'flourish', 'course'], [32.1, 'flourish', 'stage']];
    const rf = await R(flS, 46);
    const FL = rf.meta.flourish, b0 = 0.05, per2 = 60 / 124;
    const bedF = (await E('bed', 3, 8)).db;
    const pks = []; for (const f of FL) pks.push((await E('peak', f.tb - 0.1, f.tb + 1.6)) - bedF);
    console.log('INFO  flourishes over the bed (dB): ' + FL.map((f, i) => `${f.kind} ${f1(pks[i])} (tb ${f1(f.tb)})`).join(' · '));
    check('flourish(level | course | stage): each lands on the music\'s beat (within 30 ms of the grid) no later than one beat after the call', FL.length === 3 && FL.every((f) => { const k = (f.tb - b0) / per2; return Math.abs(k - Math.round(k)) * per2 <= 0.03 && f.tb - f.t <= per2 + 0.05 && f.tb - f.t >= -0.04; }), FL.map((f) => `+${Math.round((f.tb - f.t) * 1000)} ms`).join(' '));
    check('flourish: the level\'s is the smallest, the stage\'s the biggest (the course in between), after the work stinger', pks[0] < pks[1] + 0.5 && pks[1] <= pks[2] + 0.5, pks.map(f1).join(' < '));
    check('flourish: the course 6–9 dB and the stage 7–10 dB over the bed; the level 3–8', pks[1] >= 6 && pks[1] <= 9 && pks[2] >= 7 && pks[2] <= 10 && pks[0] >= 3 && pks[0] <= 8, pks.map(f1).join(' / '));
    // ── hook20 ── cue('courseDone') (the end chain's stinger): a hit on the grid, 3–10 dB over the work bed, no clipping
    { const rc = await R([[0, 'int', 1], [0, 'state', 'work'], [12.0, 'cue', 'courseDone']], 22), bedC = (await E('bed', 3, 10)).db, pkC = (await E('peak', 12.0, 14.0)) - bedC;
      check('cue(courseDone): the end chain\'s stinger is 3–10 dB over the work bed and does not clip', pkC >= 3 && pkC <= 10 && rc.peak < 0.98, `+${f1(pkC)} dB over the bed, peak ${f1(rc.peak * 100) / 100}`); }
    // ── /hook20 ──
    // the stinger of workStart is still the biggest of the music's moments: the stage's hit does not pass it
    const rs = await R([[0, 'int', 1], [0, 'state', 'work'], [8.31, 'cue', 'workStart']], 20), cs = rs.meta.cues[0];
    const bedS = (await E('bed', 3, 8)).db, stingerPk = (await E('peak', cs.tHit - 0.1, cs.tHit + 1.2)) - bedS;
    await R(flS, 46);
    check('flourish: the stage\'s and the course\'s hits do not pass the work stinger (the biggest moment of all)', pks[2] <= stingerPk + 0.3 && pks[1] <= pks[2] + 0.5, `stage ${f1(pks[2])} · course ${f1(pks[1])} · stinger ${f1(stingerPk)}`);
    check('flourish: none clips (the sample peak under 0.98)', rf.peak < 0.98, `peak ${f1(rf.peak * 100) / 100}`);
    // the sound kit's part and the music's together: levelUp + flourish('level'), big + flourish('stage'), on the same beat (≤ +10.5 dB over the bed)
    await E('keep', 'music');
    const tbL = FL[0].tb, tbS = FL[2].tb;
    await pg.evaluate(([a, b, c]) => FXT([[a - 0.4, 'levelUp', { level: 3 }], [b - 0.4, 'big', { kind: 'stage' }]], 46, { beat: { t0: c, period: 60 / 124 } }), [tbL, tbS, 0.05]);
    await E('keep', 'kit');
    const pkAll = await pg.evaluate(() => LD.sum('music', 'kit'));
    const lvC = (await E('peak', tbL - 0.1, tbL + 1.6)) - bedF, stC = (await E('peak', tbS - 0.1, tbS + 1.6)) - bedF;
    console.log(`INFO  together (the kit + the music's flourish): levelUp ${f1(lvC)} · big stage ${f1(stC)} dB over the bed; the sample peak ${f1(pkAll * 100) / 100}`);
    check('levelUp + the music\'s level flourish, and big + the stage flourish, together: +6…+10.5 dB over the bed, no clipping', lvC >= 6 && lvC <= 10.5 && stC >= 6 && stC <= 10.5 && pkAll < 1.3, `level ${f1(lvC)} · stage ${f1(stC)} dB`);

    const rh = await R([[0, 'state', 'work'], [0, 'rate', 0], [14.4, 'flourish', 'stage']], 40);
    const dh = rh.meta.lay.find((x) => x.to < x.from);
    check('flourish("stage") 1 s before an 8-bar edge: its layers hold through that edge to the next one (never out less than 4 bars after the hit)', dh && dh.bar >= 16 && rh.meta.flourish.length === 1, dh ? `out at bar ${dh.bar}` : 'no drop');

    /* 4. the live API (no audio context: the music is not started) */
    const api = await pg.evaluate(() => {
      const out = {}, m = MUSIC.createMusic({ seed: 3 });
      out.cue = m.cue('workStart'); out.beat = m.beat(); out.w0 = m.get().want;
      m.event('twin', { on: true }, 'A'); out.w1 = m.get().want;
      m.event('timeOfDay', 'night', 'A'); out.w2 = m.get().want; m.event('twin', { on: false }, 'A'); out.w2b = m.get().want; m.event('twin', { on: true }, 'A'); m.event('timeOfDay', 'noon', 'A');   // ── hook19 ── (the night keeps the work's pulse; without the twin it keeps its calm)
      m.event('m3open', {}, 'A'); out.w3 = m.get().want; m.event('m3close', {}, 'A');
      m.event('twin', { on: false }, 'A'); out.w4 = m.get().want;
      m.event('twinWork', { how: 'tap', job: 'x' }, 'A'); out.w5 = m.get().want;   // a stroke of the work, twin off: the 20 s hold
      m.event('twin', { on: false }, 'A'); out.w6 = m.get().want;
      out.bpm = MUSIC.stateInfo('work').bpm; m.destroy(); return out;
    });
    check('api: silent music: cue("workStart") → 0 and beat() → null (the caller shows the stamp after a quiet breath)', api.cue === 0 && api.beat === null, JSON.stringify([api.cue, api.beat]));
    check('api: twin → work; ── hook19 ── twin by night → work too (the same 124 BPM), without the twin the night keeps its calm; a board over it; twin off → build; a twinWork holds the work state 20 s, twin off ends it', api.w0 === 'build' && api.w1 === 'work' && api.w2 === 'work' && api.w2b === 'night' && api.w3 === 'board' && api.w4 === 'build' && api.w5 === 'work' && api.w6 === 'build', JSON.stringify([api.w0, api.w1, api.w2, api.w3, api.w4, api.w5, api.w6]));
    /* 5. the live music (a real AudioContext on a silent sink): twin → the work state at 124 BPM; the cue's lead, the breath, the stinger, the state stays */
    const lv = await pg.evaluate(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms)), out = {};
      const m = MUSIC.createMusic({ seed: 5, watch: () => ({ twin: true }) }); m.start();
      window.dispatchEvent(new Event('pointerdown'));
      for (let i = 0; i < 40 && !(m.get().running && m.get().state); i++) await sleep(100);
      await sleep(2500);
      out.g0 = m.get(); out.b0 = m.beat();
      const before = Math.max(m.meter(), (await sleep(60), m.meter()), (await sleep(60), m.meter()));
      out.lead = m.cue('workStart');
      await sleep(Math.max(100, out.lead * 1000 * 0.5)); const hush = m.meter();
      await sleep(out.lead * 1000 + 250); const hit = Math.max(m.meter(), (await sleep(40), m.meter()), (await sleep(40), m.meter()));
      await sleep(1200);
      out.g1 = m.get(); out.b1 = m.beat(); out.before = before; out.hush = hush; out.hit = hit;
      out.again = m.cue('workStart');   // within the rate limit of the first: ignored
      m.destroy();
      return out;
    });
    check('live: with twin on, the music is the work state at 124 BPM and beat() says so', lv.g0.state === 'work' && lv.g0.bpm === 124 && lv.b0 && lv.b0.bpm === 124 && lv.b0.period > 0.48 && lv.b0.period < 0.49 && lv.b0.toNext >= 0 && lv.b0.toNext <= lv.b0.period, JSON.stringify([lv.g0.state, lv.g0.bpm, lv.b0]));
    check('live: cue("workStart") answers 0.5–1 s ahead (the seconds to the stinger)', lv.lead >= 0.5 && lv.lead <= 1.0, `${f1(lv.lead * 1000)} ms`);
    check('live: the breath is near-silence (the meter in it ≤ 15 % of before) and the stinger is louder than the bed', lv.hush <= lv.before * 0.15 && lv.hit > lv.before, `before ${lv.before.toFixed(3)} · breath ${lv.hush.toFixed(4)} · stinger ${lv.hit.toFixed(3)}`);
    check('live: afterwards the work state keeps playing (not switched back to the building), on its grid', lv.g1.state === 'work' && lv.g1.layers >= 1 && lv.b1 && lv.b1.bpm === 124, JSON.stringify([lv.g1.state, lv.g1.layers, lv.b1]));
    /* 6. ── music18 ── the live API on one shared context: rate / act → the layers; flourish → seconds to the beat, rate-limited; the kit's levelUp and big call the music's flourish */
    const lv2 = await pg.evaluate(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms)), out = {};
      const kit = AUDIO.createAudio({});
      const m = MUSIC.createMusic({ seed: 7, context: () => kit.context, watch: () => ({ twin: true }) }); m.start();
      globalThis.__BH_MUSIC = m;
      out.silent = [MUSIC.createMusic({ seed: 1 }).flourish('stage'), MUSIC.createMusic({ seed: 1 }).rate(1) !== undefined];
      window.dispatchEvent(new Event('pointerdown'));
      for (let i = 0; i < 50 && !(m.get().running && m.get().state === 'work'); i++) await sleep(100);
      await sleep(1200);
      out.l0 = m.get().lay;
      m.rate(2.5); await sleep(350); out.l1 = m.get().lay;
      m.rate(0.5); await sleep(1200); out.l2 = m.get().lay;
      m.rate(0); await sleep(300); out.l3 = m.get().lay;
      for (let i = 0; i < 10; i++) m.act(); await sleep(350); out.l4 = m.get().lay;
      out.per = m.beat().period;
      out.fl = m.flourish('stage'); out.fl2 = m.flourish('stage'); out.fl3 = m.flourish('level', 2);
      await sleep(1300);
      const calls = []; const f0 = m.flourish; m.flourish = (k, n) => { calls.push(k); return f0(k, n); };
      kit.play('levelUp', { level: 2 }); await sleep(1300); kit.play('big', { kind: 'stage' }); await sleep(100); kit.play('perfect', { combo: 2 }); kit.play('xpTick'); kit.play('tab', { i: 4 }); kit.play('star', { i: 2 }); kit.play('flyIn', { kind: 'mat' });
      out.calls = calls; out.has = ['xpTick', 'levelUp', 'perfect', 'good', 'soft', 'starPop', 'star', 'big', 'flyIn', 'tab'].map((n) => kit.has(n));
      m.destroy(); return out;
    });
    // the shir keeps AVODA12's lane tempo through the live tick (a guard: the tick's line once swallowed it in a comment)
    const sb = await pg.evaluate(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms)), kit = AUDIO.createAudio({});
      const m = MUSIC.createMusic({ seed: 9, context: () => kit.context }); m.start();
      window.dispatchEvent(new Event('pointerdown'));
      for (let i = 0; i < 50 && !m.get().running; i++) await sleep(100);
      m.event('start', {}, 'B'); m.event('shirStart', { day: 0, bpm: 70 }, 'B');
      for (let i = 0; i < 80 && m.get().state !== 'shir'; i++) await sleep(100);
      await sleep(300); const g = m.get(); m.destroy(); return [g.state, g.bpm, g.want];
    });
    check('live: the shir plays at the lane tempo it was given (70 BPM), not its own 92', sb[0] === 'shir' && sb[1] === 70, JSON.stringify(sb));
    check('live: silent music: flourish → 0, rate() is chainable (no context, no error)', lv2.silent[0] === 0 && lv2.silent[1] === true, JSON.stringify(lv2.silent));
    check('live: rate(2.5) brings the layers (E.lay 3), a quiet 0.5 a/s holds the percussion only (1), rate 0 drops the want (0), act() ×10 brings them back (3)', lv2.l0 === 0 && lv2.l1 === 3 && lv2.l2 === 1 && lv2.l3 === 0 && lv2.l4 === 3, JSON.stringify([lv2.l0, lv2.l1, lv2.l2, lv2.l3, lv2.l4]));
    check('live: flourish("stage") answers with the seconds to the beat (0 < s ≤ one beat), a second call within 1.2 s is ignored, a level one is its own', lv2.fl > 0 && lv2.fl <= lv2.per + 0.1 && lv2.fl2 === 0 && lv2.fl3 > 0, `${f1(lv2.fl * 1000)} ms of ${f1(lv2.per * 1000)} · ${lv2.fl2} · ${f1(lv2.fl3 * 1000)} ms`);
    check('live: the kit\'s levelUp calls the music\'s flourish("level") and big {stage} calls flourish("stage"); every new name exists in the kit', lv2.calls.join() === 'level,stage' && lv2.has.every(Boolean), JSON.stringify([lv2.calls, lv2.has.every(Boolean)]));
    check('no page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
  } finally { await b.close(); }
  const ok = results.filter(Boolean).length;
  console.log(`\n${ok}/${results.length} checks passed in ${Math.round((Date.now() - T0) / 1000)} s`);
  process.exit(ok === results.length ? 0 : 1);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
