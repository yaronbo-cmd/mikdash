// ── build 102 ── tools/play102.cjs — an act played through by the test's hand (?h42at=<part>, globalThis.__H102AUTO), a frame every few
// seconds, and the act's own state at each: node tools/play102.cjs OUT [W H] [jobs: 07:compass:ok 07:wheel:fast …]
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const [OUT = 'play102', VW = '1374', VH = '902', ...JOBS0] = process.argv.slice(2);
const Q = { '07': 'h50go=1&h42stock=99', '08': 'h55go=1&h42stock=99', '09': 'h56go=1&h42stock=99', '10': 'h57go=1&h42stock=99' };
const JOBS = JOBS0.length ? JOBS0 : ['07:compass:ok', '07:wheel:ok', '07:dome:ok'];
const PAGE = 'file://' + path.resolve(__dirname, '../out/index.html');
const SHOTS = +(process.env.SHOTS || 6), EVERY = +(process.env.EVERY || 8000);
(async () => {
  fs.mkdirSync(OUT, { recursive: true }); const rep = {};
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio'] });
  const one = async (job) => {
    const [id, part, hand = 'ok'] = job.split(':'), tag = `${id}-${part}-${hand}`;
    const ctx = await b.newContext({ viewport: { width: +VW, height: +VH } });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await ctx.addInitScript(([h, h2, X]) => { window.__DT_MAX = h2; window.__H102X = X; window.__CAMSNAP = 1; window.__H102AUTO = h === 'none' ? null : h; window.__F102 = 0; const tk = () => { window.__F102++; requestAnimationFrame(tk); }; requestAnimationFrame(tk); try { localStorage.clear(); } catch (e) { /* */ } }, [hand, +(process.env.DTMAX || 0.25), +(process.env.X || 1)]);
    const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    const t0 = Date.now(), lg = (m) => console.log(tag, Math.round((Date.now() - t0) / 1000) + 's', m);
    try {
      await pg.goto(`${PAGE}?h63site=1&${Q[id]}&h42at=${part}${process.env.QS || ''}`, { waitUntil: 'load', timeout: 180000 });
      await pg.waitForFunction(() => globalThis.__H42 && globalThis.__H42.on, null, { timeout: 300000, polling: 1000 }); lg('on');
      for (let k = 0; k < 90; k++) { const j = await pg.evaluate((pt) => { document.querySelectorAll('.h42-card button').forEach((x) => x.click()); const c = document.querySelector(`.h63-chip[data-part="${pt}"]`); if (c) c.click(); const j2 = globalThis.__H42.job(); return j2 ? j2.kind : ''; }, part).catch(() => ''); if (/102$/.test(j)) break; if (k % 10 === 0) lg('job ' + j + ' ' + (await pg.evaluate(() => { const s = globalThis.__H42.state(); return JSON.stringify({ part: s.part, idx: s.idx, card: s.card, hold: s.hold, pending: s.pending, job: s.job, fr: globalThis.__F102, chips: [...document.querySelectorAll('.h63-chip')].map((c) => c.dataset.part).join(',') }); }).catch(() => '?'))); await pg.waitForTimeout(2000); }
      const st = () => pg.evaluate(() => { const j = globalThis.__H42.job(); if (!j) return { none: 1, part: globalThis.__H42.state().part }; const r = j.ref, J = r.hj ? r.hj() : null, k = J ? J.state() : null; const fr = globalThis.__F102 || 0; return { fr, kind: j.kind, ph: r.ph ? r.ph() : '', qs: r.qs ? r.qs() : null, LR: k && k.L ? k.L.join('') + '|' + k.R.join('') : '', busy: r.busy ? r.busy() : '', k: k ? Object.fromEntries(Object.entries(k).filter(([, v]) => typeof v !== 'object' || v === null).map(([a, v]) => [a, typeof v === 'number' ? +v.toFixed(2) : v])) : null }; });
      for (let s = 0; s < SHOTS; s++) { await pg.screenshot({ path: path.join(OUT, `${tag}-${s}.png`), timeout: 180000 }); const q = await st(); lg(JSON.stringify(q).slice(0, 400)); rep[tag] = q; if (q.none) break; await pg.waitForTimeout(EVERY); }
      rep[tag].errors = errs.slice(0, 6);
    } catch (e) { rep[tag] = { fail: String(e.message).slice(0, 300), errors: errs.slice(0, 6) }; }
    console.log(tag, 'END', JSON.stringify(rep[tag]).slice(0, 600)); fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(rep, null, 1));
    await ctx.close();
  };
  const q = JOBS.slice(); await Promise.all(Array.from({ length: +(process.env.LANES || 2) }, (_, i) => i).map(async () => { while (q.length) await one(q.shift()); }));
  await b.close();
})();
