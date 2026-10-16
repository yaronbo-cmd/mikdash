// LAND17 (wave 17) — popups 'book' on a key moment (moments.js `// ── land17 ──`), as a DOM unit test in one headless Chromium (no WebGL):
//   /home/claude/wt/bus/brun node test/land-moment.cjs
// A moment with no play of its own ends at once (playMoment's `done`): with ctx.bookNote → true (the setting "רק בספר") the source is kept,
// the end card (source + "המשך") does not show, and the moment closes by itself a beat later; without it (setting "מופיעים") the end card
// shows its source and waits for the button, as in v29.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out');
fs.mkdirSync(OUT, { recursive: true });
const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));
esbuild.buildSync({ entryPoints: [path.join(ROOT, 'src/game/moments.js')], bundle: true, format: 'iife', globalName: 'MO', target: 'es2020', outfile: path.join(OUT, 'moments.bundle.js'), logLevel: 'warning' });
const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  try {
    const pg = await (await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true })).newPage();
    const errors = [];
    pg.on('pageerror', (e) => errors.push(String(e)));
    await pg.setContent('<!doctype html><meta charset="utf-8"><body><div id="root" style="position:relative;width:844px;height:390px"></div></body>');
    await pg.addScriptTag({ path: path.join(OUT, 'moments.bundle.js') });
    const run = (book) => pg.evaluate(async (book) => {
      const root = document.getElementById('root'), noted = [];
      const ctx = {
        root, text: { n: 'רגע לדוגמה', hint: 'רמז', done: 'סיימת', src: { q: 'ציטוט לדוגמה', d: 'פרט לדוגמה', ref: 'מקור לדוגמה' } },
        sfx: () => {}, haptic: () => {}, world: {}, reduced: true, T: { next: 'המשך', skip: 'דלג', draft: 'טיוטה', momentKicker: 'רגע מיוחד' },
        fmtSrc: (o) => `<p class="gm-q">${o.q}</p><span class="gm-ref">${o.ref}</span>`,
      };
      if (book) ctx.bookNote = (M) => { noted.push(M.n); return true; };
      const t0 = performance.now(); let res = null;
      const p = MO.playMoment('none', ctx).then((r) => { res = { r, ms: Math.round(performance.now() - t0) }; });
      await new Promise((r) => setTimeout(r, 300));
      const at300 = { open: !!root.querySelector('.gm-mo'), endShown: !!root.querySelector('.gm-mo-end') && !root.querySelector('.gm-mo-end').hidden, src: (root.querySelector('.gm-mo-src') || {}).textContent || '', go: !!root.querySelector('.gm-mo-go') && root.querySelector('.gm-mo-go').getBoundingClientRect().height > 0, skipShown: !!root.querySelector('.gm-mo-skip') && !root.querySelector('.gm-mo-skip').hidden };
      if (!book) { root.querySelector('.gm-mo-go').click(); }
      await Promise.race([p, new Promise((r) => setTimeout(r, 3000))]);
      await new Promise((r) => setTimeout(r, 400));
      return { at300, res, noted, left: !!root.querySelector('.gm-mo') };
    }, book);

    const a = await run(true);
    check("popups 'book': the end card does not show (no source, no button, no skip) and the source is noted", a.at300.open && !a.at300.endShown && !a.at300.go && !a.at300.skipShown && a.noted[0] === 'רגע לדוגמה', JSON.stringify(a.at300) + ' noted ' + JSON.stringify(a.noted));
    check("popups 'book': the moment closes by itself (≈ 1.2 s after its play), resolved {ok, skipped: false}, the overlay is gone", a.res && a.res.r.ok === true && a.res.r.skipped === false && a.res.ms >= 1000 && a.res.ms <= 2200 && !a.left, JSON.stringify(a.res) + ' left ' + a.left);
    const s = await run(false);
    check("popups 'show': the end card shows the source and \"המשך\", and waits for the button (as in v29)", s.at300.endShown && s.at300.go && /ציטוט/.test(s.at300.src) && s.noted.length === 0, JSON.stringify(s.at300));
    check("popups 'show': the button ends the moment ({ok, skipped: false})", s.res && s.res.r.ok === true && s.res.r.skipped === false && !s.left, JSON.stringify(s.res));
    check('no page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
  } finally { await b.close(); }
  const ok = results.filter(Boolean).length;
  console.log(`\n${ok}/${results.length} checks passed`);
  process.exit(ok === results.length ? 0 : 1);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
