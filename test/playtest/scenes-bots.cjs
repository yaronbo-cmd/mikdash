// Scenes playtest (HOOKS agent, round 3): the Temple tour (10 stops), "איפה הארון?" (5 steps) and the watch-only Yom
// Kippur service (10 chapters), walked card by card in the REAL scenes panel over a mock world whose camera moves take
// their device time (test/playtest/scenes-bot-entry.js). The bot reads what each card says (words in the text, the quote
// and the source), counts the taps, and then five personas "read" the same walk: each card takes the words at the
// persona's reading speed (capped by its patience), the first card of a stop waits for the camera, and a persona leaves
// when its attention budget runs out or after too many text cards in a row without a new view (the museum-fatigue shape:
// Serrell 1998, Bitgood 2009; docs/HOOKS.md §14). The numbers are a model on measured text, not a claim about people.
//   node test/playtest/scenes-bots.cjs [--label=before] [--no-build]
// Output: test/out/playtest/scenes-<label>.json and a table on stdout.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'test/out/playtest');
fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const LABEL = (args.find((a) => a.startsWith('--label=')) || '--label=now').slice(8);
const BUNDLE = path.join(OUT, 'scenes-bot.bundle.js');
if (!args.includes('--no-build')) {
  const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));
  esbuild.buildSync({ entryPoints: [path.join(__dirname, 'scenes-bot-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: BUNDLE, logLevel: 'warning', loader: { '.json': 'json' } });
}
const HTML = path.join(OUT, 'scenes-bot.html');
fs.writeFileSync(HTML, `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{height:100%;margin:0;background:#CBB28A}</style></head><body><script src="scenes-bot.bundle.js"></script></body></html>`);

/* ── personas: wpm (Hebrew on a phone) · patience: most seconds on one card · budget: minutes of attention for the
   panel · wall: text cards in a row (same view) before leaving · subs: opens the Heichal's four vessels ── */
const PERSONAS = {
  firstTimer: { label: 'the curious first-timer', wpm: 160, patience: 20, budget: 9, wall: 5, subs: true, tap: 0.9 },
  child: { label: 'the child (10–12)', wpm: 90, patience: 5, budget: 4, wall: 2, subs: false, tap: 0.6 },
  regular: { label: 'the regular (a daily player)', wpm: 170, patience: 12, budget: 6, wall: 3, subs: false, tap: 0.8 },
  binger: { label: 'the binger', wpm: 180, patience: 15, budget: 20, wall: 7, subs: true, tap: 0.8 },
  investor: { label: 'the investor (with a presenter)', wpm: 200, patience: 5, budget: 3, wall: 2, subs: false, tap: 0.7 },
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-first-run', '--disable-background-networking'] });
  const walk = {};
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const errors = [];
    pg.on('pageerror', (e) => errors.push(e.message));
    pg.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await pg.goto('file://' + HTML + '?now=2026-09-27T20:00:00%2B03:00');
    await pg.waitForFunction(() => !!window.__SC, null, { timeout: 20000 });
    for (const tab of ['tour', 'ark', 'yk']) {
      walk[tab] = await pg.evaluate(async (tab) => {
        const S = window.__SC, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const words = (s) => (String(s || '').match(/[֐-׿A-Za-z0-9]+/g) || []).length;
        const txt = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '');
        const t0 = performance.now();
        const openP = S.open(tab);
        const stops = []; let taps = 0, guard = 0, lastKey = '';
        const snap = () => {
          const root = document.querySelector('.sc-root'); if (!root) return null;
          const card = root.querySelector('.sc-card').cloneNode(true);
          const doorEl = card.querySelector('.sc-done'); const doorTxt = txt(doorEl); if (doorEl) doorEl.remove();   // (the door is not the card's text)
          const ps = [...card.querySelectorAll('p')];
          const title = txt(ps[0] && ps[0].querySelector('b'));
          const body = ps.filter((p) => !p.classList.contains('sc-q') && !p.classList.contains('sc-src')).slice(1).map(txt).join(' ');
          const quote = txt(card.querySelector('.sc-q'));
          const src = txt(card.querySelector('.sc-src'));
          return { stop: S.state.id, card: S.state.card, title, w: words(title) + words(body), qw: words(quote), sw: words(src), extra: [...root.querySelectorAll('.sc-row .sc-btn.gold')].map(txt).filter((x) => !/^(הבא|המשך)$/.test(x)), stamps: txt(root.querySelector('.sc-stamps')), nextStop: !!root.querySelector('[data-hk="nextstop"]'), door: doorTxt };
        };
        while (guard++ < 120) {
          await sleep(30);
          const s = snap(); if (!s) break;
          const key = s.stop + ':' + s.card;
          if (key !== lastKey) {
            lastKey = key;
            let st = stops[stops.length - 1];
            if (!st || st.id !== s.stop) { st = { id: s.stop, cards: [], t: Math.round(performance.now() - t0) }; stops.push(st); }
            st.cards.push({ t: s.title, w: s.w, qw: s.qw, sw: s.sw, extra: s.extra, nextStop: s.nextStop });
            st.stamps = s.stamps; if (s.door) st.door = s.door;
          }
          // wait for the camera of this stop before the next tap (a player watches it arrive)
          const t1 = performance.now(); while (S.state.busy && performance.now() - t1 < 8000) await sleep(40);
          const btn = document.querySelector('.sc-row .sc-btn.gold[data-a="next"]');
          if (!btn) break;
          btn.click(); taps++;
        }
        await openP;
        const closed = !document.querySelector('.sc-root');
        const last = stops[stops.length - 1];
        return { stops, taps, closed, ms: Math.round(performance.now() - t0), endCard: last && last.door ? last.door.slice(0, 200) : '' };
      }, tab);
      // (close anything the end left open)
      await pg.evaluate(() => { const S = window.__SC; if (S && S.state.open) S.close(); document.querySelectorAll('.sc-done').forEach((e) => e.remove()); });
    }
    // the Heichal's four vessels (sub-cards), for the personas that open them
    walk.subs = await pg.evaluate(async () => {
      const S = window.__SC, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const words = (s) => (String(s || '').match(/[֐-׿A-Za-z0-9]+/g) || []).length;
      await S.open('tour');
      const i = S.state.stops.indexOf('heichal'); S.wash(); await S.goStop(i);
      const out = [];
      const nb = document.querySelectorAll('.sc-row [data-sub]').length;
      for (let k = 0; k < nb; k++) {
        const bs = document.querySelectorAll('.sc-row [data-sub]'); if (!bs[k]) break;
        bs[k].click(); await sleep(40);
        let n = 0, guard = 0;
        while (guard++ < 8) {
          const card = document.querySelector('.sc-card');
          const w = words(card.textContent);
          out.push({ sub: k, card: n, w });
          const cs = S.state.card; await S.next(); await sleep(20);
          if (S.state.card === cs) break; n++;
        }
        await S.goStop(i); await sleep(20);
      }
      S.close();
      return out;
    });
    walk.errors = errors;
  } finally { await b.close(); }

  /* ── the personas read the walk ── */
  const CAM = { tour: null, ark: null, yk: null };
  const res = { walk, personas: {} };
  for (const [key, P] of Object.entries(PERSONAS)) {
    res.personas[key] = {};
    for (const tab of ['tour', 'ark', 'yk']) {
      const W = walk[tab]; let t = 0, cards = 0, readW = 0, allW = 0, wall = 0, left = null, stopsDone = 0, cut = 0, skipped = 0;
      for (const [si, st] of W.stops.entries()) {
        const nextT = W.stops[si + 1] ? W.stops[si + 1].t - st.t : 0;
        for (const [ci, c] of st.cards.entries()) {
          const w = c.w + c.qw;                              // (the source line is glanced at, not read)
          allW += w;
          const need = (w / P.wpm) * 60, spend = Math.min(P.patience, need);
          if (spend < need - 0.5) cut++;
          readW += Math.round(w * (spend / Math.max(need, 0.01)));
          const cam = ci === 0 ? Math.min(6, Math.max(0, (nextT || 3000) / 1000 - 0)) : 0;
          t += Math.max(spend, ci === 0 ? Math.min(cam, 5) : 0) + P.tap;
          cards++;
          wall = ci === 0 ? 1 : wall + 1;
          if (t > P.budget * 60) { left = { stop: st.id, n: si + 1, card: ci + 1, why: 'budget' }; break; }
          if (wall > P.wall && ci < st.cards.length - 1) {
            if (c.nextStop) { t += P.tap; skipped += st.cards.length - 1 - ci; wall = 0; break; }       // "לתחנה הבאה": on to the next view
            left = { stop: st.id, n: si + 1, card: ci + 1, why: 'text wall' }; break;
          }
        }
        if (left) break;
        stopsDone++;
        if (tab === 'tour' && st.id === 'heichal' && P.subs && walk.subs) for (const s of walk.subs) { const need = (s.w / P.wpm) * 60; t += Math.min(P.patience, need) + P.tap; allW += s.w; }
      }
      res.personas[key][tab] = { min: +(t / 60).toFixed(1), cards, stopsDone, of: W.stops.length, left, readShare: Math.round((100 * readW) / Math.max(1, allW)), cutCards: cut, skipped, door: !left && !!(W.stops[W.stops.length - 1] || {}).door };
    }
  }
  // the text load of each tab
  res.load = {};
  for (const tab of ['tour', 'ark', 'yk']) {
    const W = walk[tab], cs = W.stops.flatMap((s) => s.cards);
    const ws = cs.map((c) => c.w + c.qw);
    res.load[tab] = { stops: W.stops.length, cards: cs.length, taps: W.taps, words: ws.reduce((a, b) => a + b, 0), median: ws.slice().sort((a, b) => a - b)[Math.floor(ws.length / 2)], over50: ws.filter((w) => w > 50).length, over80: ws.filter((w) => w > 80).length, maxStop: W.stops.reduce((m, s) => (s.cards.length > m.n ? { id: s.id, n: s.cards.length } : m), { id: '', n: 0 }), closed: W.closed, endCard: W.endCard, stamps: W.stops.map((s) => s.stamps || '').filter(Boolean).slice(-1)[0] || '' };
  }
  fs.writeFileSync(path.join(OUT, `scenes-${LABEL}.json`), JSON.stringify(res, null, 1));
  console.log(`\nscenes · ${LABEL}`);
  for (const tab of ['tour', 'ark', 'yk']) {
    const L = res.load[tab];
    console.log(`\n${tab}: ${L.stops} stops · ${L.cards} cards · ${L.taps} taps · ${L.words} words (median ${L.median}/card; ${L.over50} cards > 50 words, ${L.over80} > 80) · longest stop ${L.maxStop.id} (${L.maxStop.n} cards) · at the end: ${L.endCard ? L.endCard.slice(0, 80) : 'the panel closes, nothing else'}${L.stamps ? ' · stamps: ' + L.stamps : ''}`);
    for (const [key, P] of Object.entries(PERSONAS)) {
      const r = res.personas[key][tab];
      console.log(`  ${P.label.padEnd(34)} ${String(r.min).padStart(5)} min · ${r.stopsDone}/${r.of} stops · read ${r.readShare}% of the words · ${r.left ? `leaves at ${r.left.n}. ${r.left.stop} (card ${r.left.card}, ${r.left.why})` : 'finishes'}${r.skipped ? ` · moved on past ${r.skipped} cards` : ''}${r.door ? ' · sees the door' : ''}`);
    }
  }
  if (walk.errors.length) console.log('\npage errors:', walk.errors.slice(0, 5));
})().catch((e) => { console.error(e); process.exit(1); });
