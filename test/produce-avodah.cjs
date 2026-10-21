// PRODUCER12 (wave 12, the owner's note 4 "בשלב ב' של פעולות היום נצטרך לתת יותר פירוט" and 20:37 "הלויים שיר של יום בכל יום"):
// Phase B by REAL TOUCH on a phone (390×844, touch, he-IL), the way a child plays it: its own entry links (#avodah=<segment|game>),
// every card's gold button, and in each mini-game (.av-mg[data-game]) what its hint asks —
//   the song (shir): the cymbal ([data-k="tziltzal"]) when the sgan waves ("עכשיו"), the lyre ([data-k="nagen"]) on the beat,
//   the trumpets ([data-k="trumpet"]): תקיעה held ~1.1 s, תרועה three quick taps;
//   any other game: its targets in the picture (.av-play [tabindex], the 3D targets .av3d-t) and its controls (.av-ctl button),
//   one after another as a child tries them; after --stuck seconds without an end, "דלג" (logged).
// Logs the words a player reads (title, intro, hints, the psalm, the section, the instruments, the sources), the music's state
// (__BH_MUSIC.get()) and the Phase B events (__GAME_LOG 'shir' …); a shot on each new game, each new section and every ~10 s.
//   node test/produce-avodah.cjs --url=file:///…/dist/test.html --tag=b1 --entries=shir,shachar,erev [--budget=560] [--stuck=45]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const A = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true]; }));
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/produce');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = A.url || 'file://' + path.join(ROOT, 'dist/test.html'), TAG = A.tag || 'avodah';
const ENTRIES = String(A.entries || 'shir,shachar').split(','), BUDGET = +(A.budget || 560) * 1000, STUCK = +(A.stuck || 45) * 1000;
const T0 = Date.now(), sec = () => Math.round((Date.now() - T0) / 1000), left = () => BUDGET - (Date.now() - T0);
const note = (s) => console.log(`${String(sec()).padStart(4)}s ${s}`);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=user-gesture-required'] });
  const log = { tag: TAG, url: URL0, entries: [], games: [], words: [], shots: [], errors: [] };
  let n = 0;
  try {
    for (const ent of ENTRIES) {
      const [entry, eachS] = ent.split(':');   // (an entry may carry its own seconds: shir:110)
      if (left() < 60000) { note(`no time left for ${entry}`); break; }
      const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
      const pg = await ctx.newPage();
      pg.on('pageerror', (e) => log.errors.push(`${entry}: ${e.message.slice(0, 160)}`));
      pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) log.errors.push(`${entry}: ${m.text().slice(0, 160)}`); });
      await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
      await pg.addInitScript((t) => { window.__FORCE_Q = 'normal'; window.__GAME_LOG = []; window.__NO_OPENING = true; window.__START_PAUSED = true; if (t) window.__FORCE_TIME = t; }, A.time || null);   // (the world's loop paused, the world advanced by __T.simulate and drawn per shot, as produce-play: SwiftShader cannot run it at 60 fps)
      const E = (fn, a) => pg.evaluate(fn, a);
      const wait = (ms) => pg.waitForTimeout(ms);
      await pg.goto(URL0 + '#avodah=' + entry);
      await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 }).catch(() => {});
      await E(() => { try { __T.simulate(true); } catch (e) { /* */ } });
      await wait(2500);
      note(`ENTRY #avodah=${entry}`);
      const shot = async (name) => {
        const f = path.join(OUT, `${TAG}-${String(++n).padStart(2, '0')}-${entry}-${name}.png`);
        await E(() => { try { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); } catch (e) { /* */ } });
        await pg.screenshot({ path: f, timeout: 120000 });
        await E(() => { window.__HUD_HOLD = false; });
        const mus = await E(() => { try { const g = globalThis.__BH_MUSIC && globalThis.__BH_MUSIC.get(); return g ? { state: g.state, bpm: g.bpm, int: g.intensity } : null; } catch (e) { return null; } });
        log.shots.push({ f: path.relative(ROOT, f), t: sec(), mus }); note(`SHOT ${path.relative(ROOT, f)} · music ${JSON.stringify(mus)}`);
        return f;
      };
      const tapXY = async (x, y, why) => { await pg.touchscreen.tap(x, y); if (why) note(`tap (${x | 0},${y | 0}) ${why}`); };
      const tapSel = async (sel, why) => { const h = await pg.$(sel); const r = h && await h.boundingBox(); if (!r) return false; await tapXY(r.x + r.width / 2, r.y + r.height / 2, `${why || sel} [${r.width | 0}×${r.height | 0}]`); return true; };
      const hold = async (sel, ms, why) => { const h = await pg.$(sel); const r = h && await h.boundingBox(); if (!r) return false; const cdp = await ctx.newCDPSession(pg); const p = { x: r.x + r.width / 2, y: r.y + r.height / 2 }; await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [p] }); await wait(ms); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach().catch(() => {}); note(`hold ${ms} ms ${why || sel}`); return true; };
      await shot('open');
      const seenGame = new Set(), seenPerek = new Set(); let game = null, gT0 = 0, lastShot = 0, lastWords = '', tried = new Set(), shotsN = 0, lyreAt = 0;
      const entryEnd = Date.now() + Math.min(left() - 20000, +(eachS || A.each || 240) * 1000);
      while (Date.now() < entryEnd) {
        const s = await E(() => {
          const vis = (x) => { if (!x) return false; const r = x.getBoundingClientRect(), cs = getComputedStyle(x); return r.width > 4 && r.height > 4 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
          const tx = (q, root = document) => { const x = root.querySelector(q); return x && vis(x) ? x.innerText.replace(/\s+/g, ' ').trim() : ''; };
          const mg = [...document.querySelectorAll('.av-mg')].find(vis);
          const o = { mg: mg ? mg.dataset.game : null };
          if (mg) {
            Object.assign(o, { title: tx('.av-mg-t', mg), intro: tx('.av-mg-intro', mg).slice(0, 220), hint: tx('.av-hint', mg), psalm: tx('.av-shir-psalm', mg).slice(0, 200), perek: tx('.av-shir-perek', mg), kelim: tx('.av-shir-kelim', mg), ref: [...mg.querySelectorAll('.av-ref')].filter(vis).map((x) => x.innerText.trim()).join(' | ').slice(0, 160), end: !!mg.querySelector('.av-mg-end, .av-done, .done-card') });
            o.keys = [...mg.querySelectorAll('[data-k]')].filter(vis).map((x) => x.dataset.k);
            o.go = !![...mg.querySelectorAll('button')].find((x) => vis(x) && /המשך|סיום|הבא/.test(x.textContent));
          } else {
            const say = [...document.querySelectorAll('.av-say, .av-card h2, .av-card h3, .av-status, .av-modal h2, .av-modal p')].filter(vis).map((x) => x.innerText.replace(/\s+/g, ' ').trim()).join(' | ').slice(0, 260);
            const btn = [...document.querySelectorAll('.av-modal .av-btn, .av-card .av-btn, .av-btn')].filter(vis);
            const g = btn.find((x) => /gold|primary|go/.test(x.className)) || btn[0];
            if (g) g.dataset.qa = 'avb';
            Object.assign(o, { say, btn: g ? g.innerText.replace(/\s+/g, ' ').trim().slice(0, 40) : null });
          }
          o.log = window.__GAME_LOG.filter((e) => /shir|blast|bow|avodah|game/.test(e.type)).slice(-3).map((e) => `${e.type}:${JSON.stringify(e.d || {}).slice(0, 80)}`);
          return o;
        }).catch(() => ({}));
        const words = JSON.stringify([s.mg, s.title, s.hint, s.perek, s.say]);
        if (words !== lastWords) { lastWords = words; log.words.push({ t: sec(), entry, ...s }); note(`${s.mg ? `GAME ${s.mg} "${s.title}" · hint "${s.hint}"${s.perek ? ' · perek "' + s.perek + '"' : ''}` : `card "${(s.say || '').slice(0, 140)}" · next "${s.btn || '—'}"`}`); }
        if (s.mg && s.mg !== game) {
          game = s.mg; gT0 = Date.now(); tried = new Set();
          if (!seenGame.has(game)) { seenGame.add(game); log.games.push({ t: sec(), entry, game, title: s.title, intro: s.intro, psalm: s.psalm, kelim: s.kelim, ref: s.ref }); note(`NEW GAME ${game}: "${s.title}" · intro "${s.intro}"${s.psalm ? ' · psalm "' + s.psalm + '"' : ''}${s.kelim ? ' · kelim "' + s.kelim + '"' : ''}`); await wait(700); await shot(`g-${game}`); lastShot = Date.now(); }
        }
        if (!s.mg && game) { const g = log.games.filter((x) => x.game === game).pop(); if (g && !g.s) g.s = Math.round((Date.now() - gT0) / 1000); note(`GAME ENDED ${game} after ${Math.round((Date.now() - gT0) / 1000)} s`); game = null; }
        if (s.perek && !seenPerek.has(s.perek)) { seenPerek.add(s.perek); await shot(`perek${seenPerek.size}`); lastShot = Date.now(); }
        if (Date.now() - lastShot > +(A.every || 10) * 1000 && shotsN < 30) { shotsN++; lastShot = Date.now(); await shot(s.mg ? `play-${s.mg}` : 'card'); }
        if (s.mg) {
          const g = log.games.filter((x) => x.game === s.mg).pop();
          if (Date.now() - gT0 > STUCK) { note(`GAME ${s.mg} not ended by my hand in ${STUCK / 1000} s: דלג`); if (g) g.stuck = true; await shot(`stuck-${s.mg}`); await tapSel('.av-mg .av-skip', 'דלג'); await wait(1500); continue; }
          if (s.go) { const ok = await E(() => { const b = [...document.querySelectorAll('.av-mg button')].find((x) => x.offsetParent && /המשך|סיום|הבא/.test(x.textContent)); if (b) b.dataset.qa = 'mgo'; return !!b; }); if (ok) { await shot(`end-${s.mg}`); await tapSel('.av-mg button[data-qa="mgo"]', 'the game: המשך'); await wait(1200); continue; } }
          const h = s.hint || '';
          // the libations (shir's first part): hold on the bowl the hint means — water in the western, wine in the eastern (סוכה ד, ט)
          if (/ניסוך המים|הגבה ידך|לנסך|יין/.test(h) && !s.keys.includes('nagen') && !s.keys.includes('trumpet')) {
            const want = /יין|מזרחי של יין|הדרומית/.test(h) && !/ניסוך המים/.test(h) ? 'המזרחי' : 'המערבי';
            const bx = await E((want) => { const t = [...document.querySelectorAll('.av3d-t')].find((x) => x.offsetParent !== null && !x.classList.contains('off') && (x.innerText || '').includes(want)); if (!t) return null; const r = t.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, want);
            if (bx) { const cdp = await ctx.newCDPSession(pg); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [bx] }); await wait(2600); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach().catch(() => {}); note(`hold 2.6 s on "הספל ${want}" (the hint: "${h.slice(0, 50)}")`); await wait(900); continue; }
            if (await hold('.av-mg .av-ctl .hold, .av-mg .av-ctl button', 2600, 'the hold button (no bowl in view)')) { await wait(900); continue; }
          }
          if (s.keys.includes('tziltzal') && /עכשיו|הקש בצלצל!/.test(h) && !/חכה/.test(h)) { await tapSel('.av-mg [data-k="tziltzal"]', 'the cymbal (the sgan waves)'); await wait(400); continue; }
          if (s.keys.includes('trumpet') && /תרועה/.test(h)) { for (let q = 0; q < 3; q++) { await tapSel('.av-mg [data-k="trumpet"]', q ? '' : 'the trumpet: תרועה ×3'); await wait(160); } await wait(500); continue; }
          if (s.keys.includes('trumpet') && /תקיעה|החזק/.test(h)) { await hold('.av-mg [data-k="trumpet"]', 1150, 'the trumpet: תקיעה'); await wait(500); continue; }
          if (s.keys.includes('nagen')) { if (Date.now() - lyreAt > 640) { lyreAt = Date.now(); await tapSel('.av-mg [data-k="nagen"]', ''); } await wait(120); continue; }
          if (s.keys.includes('tziltzal')) { await wait(250); continue; }   // (the cymbal waits for its moment: an early tap only waits)
          // any other game: its targets and controls, one after another as a child tries them
          const t = await E((tried) => {
            const vis = (x) => { const r = x.getBoundingClientRect(), cs = getComputedStyle(x); return r.width > 6 && r.height > 6 && r.y > 60 && r.y < innerHeight - 40 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.2; };
            const mg = document.querySelector('.av-mg'); if (!mg) return null;
            const c = [...mg.querySelectorAll('.av-play [tabindex], .av-play [role=button], .av3d-t, .av-ctl button, .av-play .av-hit')].filter(vis).filter((x) => !x.classList.contains('done') && !x.classList.contains('ok') && !x.disabled);
            if (!c.length) return null;
            const key = (x) => (x.dataset.k || x.getAttribute('aria-label') || x.textContent || x.tagName).trim().slice(0, 30) + '@' + Math.round(x.getBoundingClientRect().x / 20) + ',' + Math.round(x.getBoundingClientRect().y / 20);
            let x = c.find((y) => !tried.includes(key(y))) || c[0];
            const r = x.getBoundingClientRect();
            return { x: r.x + r.width / 2, y: r.y + r.height / 2, k: key(x), w: Math.round(r.width), h: Math.round(r.height), n: c.length };
          }, [...tried]);
          if (t) { tried.add(t.k); if (tried.size > 60) tried = new Set(); await tapXY(t.x, t.y, `the game's target "${t.k}" [${t.w}×${t.h}] (${t.n} targets)`); await wait(700); continue; }
          await wait(500); continue;
        }
        if (s.btn) { await tapSel('[data-qa="avb"]', `phase B: "${s.btn}"`); await wait(1800); continue; }
        await wait(1000);
      }
      await shot('end');
      log.entries.push({ entry, games: [...seenGame], t: sec() });
      await ctx.close();
    }
  } catch (e) { console.error('RUN ERROR', e.message); log.fatal = e.message; }
  fs.writeFileSync(path.join(OUT, `${TAG}-log.json`), JSON.stringify(log, null, 1));
  note(`games seen: ${log.games.map((g) => `${g.game}${g.stuck ? '(stuck)' : ''}${g.s ? ' ' + g.s + 's' : ''}`).join(', ')} · errors ${log.errors.length} ${log.errors.slice(0, 2).join(' | ')}`);
  await b.close();
})();
