// ── fable32 (build 28) ── build 28 (node): the cleanup of what in the shipped game contradicted the owner's decisions (22.10 09:19;
// docs/specs/rohvi-he.md "סדר בנייה מוצע", hachraot-he.md "המערכות הרוחביות"): (1) no 24 h expiry of the saved day; (2) no "משמרת" and
// no "סיור" (the lobby's pill, the pause card's "לסיור", the shipped page's links); (3) no side doors to the old Phase B home (the old top
// bar off in the shift, the switches on the lobby and the pause card; a turn to portrait shows the "turn the phone" card over the paused
// day); (4) the first lot draws ONE card, never yesterday's; (5) "משחק קצר" only from the lobby's start screen (a picker of the three
// interludes); (6) the gift (nedava) at a fixed moment; (7) the buzz's off switch (bh_haptics) — one guard over navigator.vibrate;
// (8) the full lobby's ממונה's tasks are the day's own. And a Divine-Name scan of the changed files, by code points.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DAY33, C18, P23, POOL23, TASKS33, resumeDay33, tasksNow33, tasksForDay, B17, E35, tasks35ForDay } from '../src/avodah/shift/day33.js';
import { createLobby } from '../src/avodah/shift/lobby35.js';
import { installHaptics28, setHaptics, hapticsOn, haptics28, prefsHTML, cover28, createTurn28, PREFS28_CSS, HAPTICS_KEY, MUTE_KEY } from '../src/avodah/shift/prefs28.js';
// (shift/index.js itself is not imported: it pulls the kohen's .glb, which only esbuild loads — its build-28 lines are read as text below)
import { rig, FLAGS, FLAGS34, upTo, seeded } from './rig33.mjs';

const read = (f) => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const H = 3600e3;
// ── a tiny document (no browser): enough for the lobby, the cover and the turn card ──
function mkDoc() {
  const cl = () => { const s = new Set(); return { add: (...c) => c.forEach((x) => s.add(x)), remove: (...c) => c.forEach((x) => s.delete(x)), toggle: (c, on) => { const w = on === undefined ? !s.has(c) : !!on; if (w) s.add(c); else s.delete(c); return w; }, contains: (c) => s.has(c) }; };
  const mk = (tag) => ({ tagName: tag, children: [], style: {}, dataset: {}, attrs: {}, id: '', className: '', innerHTML: '', textContent: '', parent: null, classList: cl(),
    setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'id') this.id = String(v); }, getAttribute(k) { return this.attrs[k] ?? null; },
    appendChild(c) { c.parent = this; this.children.push(c); return c; }, remove() { if (this.parent) { const a = this.parent.children; a.splice(a.indexOf(this), 1); this.parent = null; } },
    addEventListener() {}, querySelectorAll: () => [], querySelector: () => null });
  const doc = { body: mk('body'), head: mk('head'), documentElement: mk('html'), createElement: mk };
  doc.getElementById = (id) => [...doc.head.children, ...doc.body.children].find((x) => x.id === id) || null;
  return doc;
}
function withGlobals(g, fn) {
  const was = {}; for (const k of Object.keys(g)) { was[k] = Object.getOwnPropertyDescriptor(globalThis, k); Object.defineProperty(globalThis, k, { value: g[k], configurable: true, writable: true }); }
  const back = () => { for (const k of Object.keys(g)) { if (was[k]) Object.defineProperty(globalThis, k, was[k]); else delete globalThis[k]; } };
  let r; try { r = fn(); } catch (e) { back(); throw e; }
  if (r && typeof r.then === 'function') return r.finally(back);
  back(); return r;
}
const memStore = (o = {}) => ({ m: { ...o }, getItem(k) { return k in this.m ? this.m[k] : null; }, setItem(k, v) { this.m[k] = String(v); }, removeItem(k) { delete this.m[k]; } });

// ───────── (1) no 24 h expiry ─────────
// a mid-morning save of day 3 (the lamb's lot and its task done, the second lot and the menorah done): the laver washed, the gates passed,
// the fire at 61 with 25 logs fed (the level 3 of B17.levels)
const mid3 = (at) => ({ day33state: { day: 3, at, washed: true, fuel: 61, fed: 25, logs: 2, left: 120, perutot: 9, p23day: 3, lot: 'lamb', d21day: 3, p25day: 3, p26day: 3, role26: 'menorah', g26day: 3, r26day: 3, tamD: 'ok', lambs: [true, false, false, false, false, false], tasks: [] } });
test('build 28 (1): DAY33.saveMaxH is gone; resumeDay33 — a day saved 48 h and 30 days ago → its day (the shape still checked: no day, an array, a string → 0)', () => {
  assert.equal(DAY33.saveMaxH, undefined);
  assert.equal(resumeDay33(mid3(Date.now() - 48 * H)), 3);
  assert.equal(resumeDay33(mid3(Date.now() - 30 * 24 * H)), 3);
  assert.equal(resumeDay33({ day33state: { day: 2, night: true, at: Date.now() - 30 * 24 * H } }), 3, 'saved at night → the next morning');
  assert.equal(resumeDay33({ day33state: { day: 4 } }), 4, 'no stamp at all: still the day');
  for (const bad of [{ day33state: { day: 0 } }, { day33state: [3] }, { day33state: 'x' }, { day33state: null }, {}, null]) assert.equal(resumeDay33(bad), 0, JSON.stringify(bad));
});
// (build 35: the old loop's fuel and basket — FLAGS34; in the morning of the work the saved fuel is not the fire (its look: the court's pyre,
// כשר — E35.fuel.kasher on the old scale), the old basket is let go, and the morning whose work was done goes to its close)
for (const [name, ago, FL] of [['48 h', 48 * H, FLAGS34], ['30 days', 30 * 24 * H, FLAGS34], ['48 h (build 35)', 48 * H, FLAGS], ['30 days (build 35)', 30 * 24 * H, FLAGS]]) {
  test(`build 28 (1): a day saved ${name} ago goes on — the same day, the gates passed, the fire and its level`, async () => {
    const R = rig(FL, { save: mid3(Date.now() - ago) }); R.E.start(); await R.step(0.3);
    const s = R.E.state();
    assert.equal(s.day, 3); assert.equal(s.resumed, 3); assert.equal(s.level, 3); assert.equal(s.lambsOk, 1);
    if (FL.e35) { assert.equal(s.fuel, E35.fuel.kasher); assert.equal(s.look35, 'kasher'); assert.equal(s.logs, 0); assert.equal(s.close35, 'fade', 'the work was done: the close'); }
    else { assert.ok(s.fuel > 59 && s.fuel <= 61, `fuel ${s.fuel}`); assert.equal(s.logs, 2); }
    assert.equal(s.washed33, true);
    for (const g of ['gate20', 'gate23', 'gate21', 'gate22', 'gate25', 'gate26L', 'gate26', 'gate27']) assert.equal(R.E[g](), false, g);
    assert.equal(s.lot, 'lamb'); assert.equal(s.role26, 'menorah');
    await new Promise((r) => setTimeout(r, 1300)); assert.ok(R.hud.st.some((t) => /המשך יום 3/.test(t)), R.hud.st.join(' | '));
    // the same as a day saved a minute ago
    const F = rig(FL, { save: mid3(Date.now() - 60e3) }); F.E.start(); await F.step(0.3); const f = F.E.state();
    for (const k of ['day', 'resumed', 'level', 'fuel', 'fed', 'logs', 'lot', 'role26', 'tamD', 'gate', 'gate21', 'gate22', 'gate23', 'gate25', 'gate26L', 'gate26', 'gate27', 'open']) assert.deepEqual(s[k], f[k], k);
  });
}
test('build 28 (1): the lobby offers "המשך יום 3" for a day saved 30 days ago', () => {
  const Lb = createLobby({ save: mid3(Date.now() - 30 * 24 * H), start: true });
  assert.match(Lb.html(), /המשך יום 3/);
});

// ───────── (2) no "משמרת", no "סיור" ─────────
test('build 28 (2): the lobby — no mode pill (one mode, the day); a save\'s lobbyMode shift / tour opens the day; the full screen has no shift record', () => {
  for (const m of ['shift', 'tour', 'day', undefined]) {
    const calls = []; const Lb = createLobby({ save: { lobbyMode: m }, on: { day: () => calls.push('day'), shift: () => calls.push('shift'), tour: () => calls.push('tour') } });
    assert.equal(Lb.state().mode, 'day'); const h = Lb.html();
    assert.ok(!/lb-mode|data-lb="mode:/.test(h), 'no pill'); assert.ok(!/משמרת|סיור/.test(h), 'no משמרת / סיור in the lobby');
    assert.equal(Lb.pick('mode:shift'), false); assert.equal(Lb.pick('mode:tour'), false);
    Lb.pick('play'); assert.deepEqual(calls, ['day']);
  }
  const st = createLobby({ save: {}, start: true }).html(); assert.ok(!/משמרת|סיור/.test(st));
});
test('build 28 (2): the shift\'s doors — the lobby gets no shift / tour; the day\'s pause card no "לסיור"; the shipped page opens the lobby for any link', () => {
  const ix = read('src/avodah/shift/index.js');
  const lobbyOn = ix.slice(ix.indexOf('cardCtl = createLobby('), ix.indexOf('// ── /fable32 ──', ix.indexOf('cardCtl = createLobby(')));
  assert.ok(/day: \(\) => \{ cardCtl = null; runDay\(\); \}/.test(lobbyOn)); assert.ok(!/shift: \(\)|tour: \(\)/.test(lobbyOn), lobbyOn);
  const dayPause = ix.slice(ix.indexOf('function runDay()'), ix.indexOf('function tour()'));
  // (build 34: the day's pause card has a way back to the opening screen between the restart and the switches)
  assert.ok(/restart: \(\) => runDay\(\), back: \{ label: 'חזרה למסך הפתיחה'[^\n]*prefs: \{ sfx: o\.sfx \} \}\);/.test(dayPause), 'the switches on the day\'s pause card'); assert.ok(!/tour: \(\) => tour\(\)/.test(dayPause), 'no לסיור');
  const main = read('src/main.js'), sg = main.slice(main.indexOf('function startGame()'), main.indexOf('// the world the game drives'));
  const iF = sg.indexOf('if (globalThis.__FORCE_SHIFT) { const f'), iA = sg.indexOf("if (/^#avodah/.test(location.hash))"), iS = sg.indexOf('if (/^#shift\\b/.test(location.hash))');
  assert.ok(iF >= 0 && iF < iA && iF < iS, 'the shipped flag first, before #avodah and #shift=N');
  assert.ok(/'shift:day' : 'shift:card'/.test(sg));
});

// ───────── (3) the side doors ─────────
test('build 28 (3a): the old top bar off while the shift is up (body.sh28 .av-top) — the lobby, the day (and the 90 s round\'s code) set it; the switches on the start screen and the pause card', () => {
  assert.match(PREFS28_CSS, /body\.sh28 \.av-top\{display:none!important\}/);
  const doc = mkDoc();
  assert.equal(cover28(doc, true), true); assert.equal(doc.body.classList.contains('sh28'), true); assert.ok(doc.getElementById('p28-css'), 'the cover\'s CSS in');
  cover28(doc, false); assert.equal(doc.body.classList.contains('sh28'), false);
  const ix = read('src/avodah/shift/index.js');
  assert.match(ix, /const goLive = \(\) => \{ live = true; cover28\(doc, true\); \};/);
  for (const f of ['function run(n)', 'function runDay()', 'function card()']) { const i = ix.indexOf(f); assert.ok(i > 0 && /hero35\(\); goLive\(\);/.test(ix.slice(i, i + 200)), f); }
  assert.ok(ix.indexOf('goLive();') > ix.indexOf('function run(n)'), 'not at the mount: the first-run name and mishmar screens keep the bar');
  const h = createLobby({ save: {}, start: true }).html();
  assert.match(h, /data-p28="mute"/); assert.match(h, /data-p28="haptics"/);
  // (build 40: the pause card's row carries the work pad's switch too — prefsHTML's extra, pad40HTML())
  assert.match(read('src/avodah/shift/hud.js'), /\$\{h\.prefs \? prefsHTML\(h\.prefs\.sfx, 'sh-p28', pad40HTML\(\)\)/);
  assert.match(read('src/avodah/shift/hud.js'), /if \(h\.prefs\) bindPrefs\(pauseEl, h\.prefs\)/);
  assert.match(PREFS28_CSS, /\.p28\{min-height:44px;min-width:44px/);
});
test('build 28 (3a): the mute switch is the one mute (bh_avodah_mute through the kit) — the button shows the kit\'s state', () => {
  assert.equal(MUTE_KEY, 'bh_avodah_mute');
  assert.match(prefsHTML({ muted: true }), /data-p28="mute"[^>]*aria-pressed="false"[^]*צליל כבוי/);
  assert.match(prefsHTML({ muted: false }), /data-p28="mute"[^>]*aria-pressed="true"/);
});
test('build 28 (3b): a turn to portrait while the shift is up — the "turn the phone" card over the paused day, no D.exit, no old home; back to landscape: the card off, the day on', async () => {
  const doc = mkDoc(), R = rig(FLAGS); R.E.start(); await R.step(0.3);
  const T = createTurn28({ doc, E: () => R.E });
  assert.equal(T.set(true), true); assert.equal(T.on, true);
  const el = doc.getElementById('sh-turn28'); assert.ok(el, 'the card'); assert.match(el.innerHTML, /סובבו את הטלפון/); assert.match(el.innerHTML, /השעון עצר/); assert.match(el.style.cssText, /z-index:9000/);
  assert.equal(R.E.state().paused, true, 'the day paused'); const t0 = R.E.state().left; await R.step(3); assert.equal(R.E.state().left, t0, 'its clock held');
  assert.equal(T.set(true), false, 'once');
  assert.equal(T.set(false), true); assert.equal(doc.getElementById('sh-turn28'), null); assert.equal(T.on, false); assert.equal(R.E.state().paused, false, 'the day on again');
  // the player's own pause stays his: paused before the turn → still paused after it
  R.E.pause(true); T.set(true); T.set(false); assert.equal(R.E.state().paused, true); R.E.pause(false);
  // paused (the pause card) while the card was up → his
  T.set(true); T.release(); T.set(false); assert.equal(R.E.state().paused, true); R.E.pause(false);
  // the lobby (no day): the card alone
  const T2 = createTurn28({ doc, E: () => null }); assert.equal(T2.set(true), true); assert.ok(doc.getElementById('sh-turn28')); assert.ok(!/השעון עצר/.test(doc.getElementById('sh-turn28').innerHTML), 'no clock line over the lobby'); T2.set(false); assert.equal(doc.getElementById('sh-turn28'), null);
  const ix = read('src/avodah/shift/index.js');
  assert.match(ix, /const T28 = createTurn28\(\{ doc, E: \(\) => E, log: \(t, d\) => evlog\(t, d\) \}\);/); assert.match(ix, /const turn28 = \(port\) => T28\.set\(port\);/); assert.match(ix, /E\.pause\(true\); T28\.release\(\); hud\.pauseCard\(/);
  // avodah/index.js's tick: with the shift up, the portrait branch is the card's — never D.exit or the old home
  const av = read('src/avodah/index.js'), a = av.indexOf('if (D && started && SH && SH.live) {'), b = av.indexOf('else if (D && started && !busy && !ui.busy) {');
  assert.ok(a > 0 && b > a); const br = av.slice(a, b);
  assert.match(br, /SH\.turn28\(port\)/); assert.ok(!/D\.exit|showHome/.test(br), br);
});

// ───────── (4) the first lot: one card ─────────
async function lot(save, seed) {
  const R = rig(FLAGS, { save, seed }); R.E.start(); await R.step(0.2); R.E.debug.wash20(); await R.step(0.3);
  const ph = []; for (let i = 0; i < 80 && R.E.p23(); i++) { const K = R.E.p23(); if (ph.at(-1) !== K.ph) ph.push(K.ph); if (K.ph === 'in' || K.ph === 'raise') R.E.p23raise(); await R.step(0.2); }
  return { R, ph };
}
const hist = (ids) => { const rec = { m: ids.length, h: ids.map((id, i) => [i + 1, id, id]) }; for (const id of ids) rec[id] = { n: ((rec[id] && rec[id].n) | 0) + 1, best: 80, last: 80 }; return { roles23: rec }; };
test('build 28 (4): P23.draw 4 (was two: 4); mornings 1–3 as before — the ashes, the pyre, the lamb', async () => {
  assert.equal(P23.draw, 4); assert.equal(P23.two, undefined);
  const want = ['deshen', 'm22', 'lamb'];
  for (let n = 1; n <= 3; n++) { const { R } = await lot(hist(want.slice(0, n - 1)), 3); assert.equal(R.E.lot23(), want[n - 1], `morning ${n}`); }
});
test('build 28 (4): from the fourth morning — one card, drawn, never yesterday\'s; no choice phase (seeds × histories)', async () => {
  const built = POOL23.filter((r) => r.built).map((r) => r.id);
  const H0 = [['deshen', 'm22', 'lamb'], ['deshen', 'm22', 'lamb', 'm22'], ['deshen', 'm22', 'lamb', 'deshen', 'lamb'], ['deshen', 'm22', 'lamb', 'lamb', 'deshen', 'm22']];
  for (const h of H0) for (const seed of [1, 2, 5, 9]) {
    const { R, ph } = await lot(hist(h), seed);
    const cards = R.ev('p23').find((e) => e.cards).cards;
    assert.equal(cards.length, 1, `${h} seed ${seed}: ${cards}`); assert.ok(!ph.includes('choose'), ph.join());
    assert.notEqual(cards[0], h[h.length - 1], `never yesterday's (${h.at(-1)})`); assert.ok(built.includes(cards[0]));
    assert.equal(R.E.lot23(), cards[0]); assert.deepEqual(R.save.roles23.h.at(-1), [h.length + 1, cards[0], cards[0]]);
  }
});
// ── fable32 (build 30) ── the card's record is the best rating ("השיא שלך: מהודר · רגיל"); its source line follows the lot (end30, tappable) ── /fable32 ──
test('build 28 (4): the card — one, its record line ("השיא שלך: מהודר" / "תפקיד חדש!" — build 30), the first lot\'s source (יומא ב, ב — at the lot\'s end, build 30), no "במה תבחר?"', () => {
  const p = read('src/avodah/shift/pis23.js');
  assert.ok(!/<h3>[^<]*במה תבחר/.test(p), 'no choice heading'); assert.ok(!/p23-t"/.test(p.slice(p.indexOf('function showCards'))), 'no time bar');
  assert.match(p, /cards\.innerHTML = `<div>\$\{cardHtml\(p\.cards\[0\], 0, 1, p\.k26\)\}<\/div>`/);
  assert.match(p, /reg30\('lot', \{ chip: SRC_LOT1/); assert.match(p, /השיא שלך: \$\{RATE30\.he\[r\.best\]\}/); assert.match(p, /תפקיד חדש!/);
  const quote = 'הִתְקִינוּ שֶׁלֹּא יְהוּ תוֹרְמִין אֶת הַמִּזְבֵּחַ אֶלָּא בְפַיִס';
  assert.ok(p.includes(`const SRC_LOT1 = '"${quote}" — יומא ב, ב · טיוטה'`));
  assert.ok(!read('src/avodah/shift/day33.js').includes("'במה תבחרו? הקישו על כרטיס'"), 'no choice line on the step card');
});

// ───────── (5) "משחק קצר" only from the start screen ─────────
test('build 28 (5): the day never offers "משחק קצר?" — idle 30 s far from everything, on a morning and in the day', async () => {
  const games = { tiles: async () => ({ won: true }) };   // (the day has the interludes — o.games — as shift/index.js gives them; the offer needed them)
  const R = rig({ ...upTo('court18'), games }); R.E.start(); await R.step(0.5);
  R.at(-60, 0); await R.step(30);
  const w = R.E.work(R.H); assert.ok(w && w.job !== 'sh:play' && !/משחק קצר/.test(w.label || ''), JSON.stringify(w));
  assert.equal(DAY33.idleOffer, undefined);
  const d = read('src/avodah/shift/day33.js'); assert.ok(!/job: 'sh:play'/.test(d), 'no sh:play job left'); assert.ok(!d.includes("title: 'משחק קצר?'"));
});
test('build 28 (5): the start screen — one door "משחק קצר" → a picker of the three interludes; a pick runs the game through the lobby\'s own way (פרוטות, score); the picker closes', async () => {
  const doc = mkDoc();
  await withGlobals({ document: doc, localStorage: memStore() }, async () => {
    const played = [], scored = [], save = { perutot: 3 };
    const games = { tiles: async () => { played.push('tiles'); return { won: true, stars: 3, perutot: 9 }; }, pen: async () => { played.push('pen'); return { won: true, stars: 1, perutot: 4 }; }, m3: async () => { played.push('m3'); return { won: false, quit: true, perutot: 0 }; } };
    const Lb = createLobby({ save, start: true, games, score: { add: (n, k) => scored.push([n, k]), get: () => ({ total: 0 }) }, persist() {} });
    const h0 = Lb.html(); assert.match(h0, /data-lb="games"[^]*משחק קצר/); assert.ok(!/lb-pk"/.test(h0), 'no picker yet');
    assert.equal((h0.match(/data-lb="(tiles|pen|m3)"/g) || []).length, 0, 'the start has the one door, not the games');
    assert.equal(Lb.pick('games'), true); assert.equal(Lb.state().games, true);
    const h1 = Lb.html(); for (const k of ['tiles', 'pen', 'm3']) assert.match(h1, new RegExp(`data-lb="${k}"`)); assert.match(h1, /זיכרון המקדש[^]*הוצאת הטלה מהדיר[^]*משחק האוצר/); assert.match(h1, /המחשה/);
    assert.equal(Lb.pick('tiles'), true); assert.equal(Lb.state().games, false, 'the picker closes');
    for (let i = 0; i < 6; i++) await null;
    assert.deepEqual(played, ['tiles']); assert.equal(save.perutot, 12); assert.ok(scored.some((q) => q[1] === 'tiles' && q[0] === 350), JSON.stringify(scored));
    Lb.pick('games'); Lb.pick('games:close'); assert.equal(Lb.state().games, false);
    Lb.close();
  });
});

// ───────── (6) the gift at a fixed moment ─────────
test('build 28 (6): the nedava — no chance (no nedavaP, no rng in nedavaStep): at 140 s of the day, once, the same moment for every seed', async () => {
  assert.equal(C18.nedavaP, undefined); assert.equal(C18.nedavaAt, 140);
  const d = read('src/avodah/shift/day33.js'), f = d.slice(d.indexOf('function nedavaStep()'), d.indexOf('}', d.indexOf('function nedavaStep()') + 200));
  assert.ok(!/rng|random/i.test(f.split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n')), f);
  const at = [];
  for (const seed of [1, 4, 11]) {
    const R = rig(upTo('court18'), { seed }); R.E.start(); await R.step(139.5);
    assert.equal(R.ev('nedava').length, 0, `seed ${seed}: not before 140 s`);
    await R.step(1.5); const g = R.ev('nedava'); assert.equal(g.length, 1); at.push(g[0].t);
    assert.equal(R.ev('coins').filter((e) => e.why === 'nedava').length, 1);
    await R.step(20); assert.equal(R.ev('nedava').length, 1, 'once a day');
  }
  assert.ok(at.every((t) => Math.abs(t - at[0]) < 1e-9 && t >= 140 && t < 140.25), String(at));
});

// ───────── (7) the buzz's off switch ─────────
test('build 28 (7): one guard over navigator.vibrate — off: no call reaches the browser\'s vibrate; on: they do; kept in bh_haptics (default on)', () => {
  const browser = [], store = memStore();
  const nav = { vibrate(p) { browser.push(p); return true; } };
  withGlobals({ navigator: nav, localStorage: store }, () => {
    assert.equal(hapticsOn(), true, 'default on');
    assert.equal(installHaptics28(), true); assert.equal(installHaptics28(), true, 'once');
    assert.notEqual(navigator.vibrate, undefined);
    navigator.vibrate([30, 40, 60]); assert.deepEqual(browser, [[30, 40, 60]]);
    setHaptics(false); assert.equal(store.getItem(HAPTICS_KEY), '0'); assert.equal(hapticsOn(), false);
    const n0 = browser.length;   // (the switch off sent the browser's own cancel, 0, once)
    assert.deepEqual(browser.slice(-1), [0]);
    // every module's call shape: `if (navigator.vibrate) navigator.vibrate(p)` at the call — none reaches the browser
    for (const p of [[18, 40, 18], 25, [30, 40, 30, 40, 60], 12]) { if (navigator.vibrate) assert.equal(navigator.vibrate(p), false); }
    assert.equal(browser.length, n0, 'nothing reached the browser while off'); assert.ok(haptics28().blocked >= 4);
    setHaptics(true); assert.equal(store.getItem(HAPTICS_KEY), '1'); navigator.vibrate(12); assert.deepEqual(browser.slice(-1), [12]);
  });
});
test('build 28 (7): every vibrate in the code is navigator.vibrate(…) looked up at the call (so the one guard sees them all); the switch is on the start screen and the pause card', () => {
  const files = [];
  const walk = (d) => { for (const e of fs.readdirSync(new URL('../' + d, import.meta.url), { withFileTypes: true })) { const p = d + '/' + e.name; if (e.isDirectory()) walk(p); else if (/\.js$/.test(e.name)) files.push(p); } };
  walk('src');
  const bad = []; let calls = 0;
  for (const f of files) {
    if (f.endsWith('prefs28.js')) continue;
    for (const line of read(f).split('\n')) {
      if (!/vibrate/.test(line) || /^\s*(\/\/|\*|\/\*)/.test(line)) continue;
      for (const m of line.matchAll(/vibrate/g)) { if (line.slice(Math.max(0, m.index - 10), m.index) !== 'navigator.') bad.push(`${f}: ${line.trim().slice(0, 120)}`); else calls++; }
    }
  }
  assert.deepEqual(bad, []); assert.ok(calls >= 20, `${calls} calls`);
  assert.match(createLobby({ save: {}, start: true }).html(), /data-p28="haptics"[^]*רטט/);
  assert.match(read('src/avodah/shift/index.js'), /installHaptics28\(\);/);
});

// ───────── (8) the full lobby's ממונה's tasks ─────────
test('build 28 (8): "משימות הממונה — יום N" — the day the player goes on with, its own tasks and marks (it always said "יום 1")', () => {
  // (build 35: the shipped tasks are the work's — TASKS35, tasksNow33's default; the old pool and its marks are tasksNow33(save, false), tested here)
  const none = tasksNow33({}, false); assert.equal(none.day, 1); assert.deepEqual(none.tasks.map((q) => q.id), tasksForDay(1, 1, ['kiyor']).map((q) => q.id));
  const t5 = tasksForDay(5, 3, ['kiyor']);
  const mid = { day33state: { day: 5, at: Date.now() - 40 * H, fed: 25, tasks: [[t5[0].id, true], [t5[1].id, false], [t5[2].id, false]] } };
  const a = tasksNow33(mid, false); assert.equal(a.day, 5); assert.deepEqual(a.tasks.map((q) => [q.id, q.done]), [[t5[0].id, true], [t5[1].id, false], [t5[2].id, false]]);
  const night = tasksNow33({ day33state: { day: 5, night: true, fed: 25, tasks: [[t5[0].id, true]] } }, false); assert.equal(night.day, 6); assert.ok(night.tasks.every((q) => !q.done));
  assert.deepEqual(night.tasks.map((q) => q.id), tasksForDay(6, 3, ['kiyor']).map((q) => q.id));
  const h = createLobby({ save: mid }).html();
  assert.match(h, /משימות הממונה — יום 5/); assert.ok(!/משימות הממונה — יום 1/.test(h));
  // (build 35: the lobby's card shows the work's three — an older save's wood and ramp tasks give way to them, unmarked)
  assert.ok(!/בקעו|העלו \d+ גזרים/.test(h)); for (const q of tasks35ForDay(5, mid)) assert.ok(h.includes(`lb-task"><span>${q.text}</span>`), q.text);
  assert.ok(TASKS33.length && B17.levels.length);
});

// ───────── the Divine Name: never, in any file this build touched (by code points) ─────────
test('build 28: no Divine Name in the changed files (by code points; spaced, hyphenated or pointed forms too)', () => {
  const N = [[0x5d9, 0x5d4, 0x5d5, 0x5d4], [0x5d0, 0x5dc, 0x5d4, 0x5d9, 0x5dd], [0x5d0, 0x5d3, 0x5e0, 0x5d9], [0x5d0, 0x5dc, 0x5d5, 0x5d4, 0x5d9, 0x5e0, 0x5d5]];
  const sep = '[\\u0591-\\u05C7\\s\\-\\u05BE\\u05F3\\u05F4\'".]*';
  const res = N.map((c) => new RegExp(c.map((x) => String.fromCharCode(x)).join(sep)));
  const files = ['src/avodah/shift/prefs28.js', 'src/avodah/shift/day33.js', 'src/avodah/shift/lobby35.js', 'src/avodah/shift/hud.js', 'src/avodah/shift/index.js', 'src/avodah/shift/pis23.js', 'src/avodah/index.js', 'src/main.js',
    'test/build28.test.mjs', 'test/build16.test.mjs', 'test/build18.test.mjs', 'test/build23.test.mjs', 'test/lobby35.test.mjs', 'test/day33.test.mjs', 'tools/autoplay35-run.cjs', 'PROJECT.md'];
  const hits = []; for (const f of files) { const s = read(f); res.forEach((r, i) => { const m = s.match(r); if (m) hits.push(`${f}: name ${i} at ${m.index}`); }); }
  assert.deepEqual(hits, []);
});
