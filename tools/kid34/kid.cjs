// build 34 — the naive kid: a child of 8–12 with two thumbs on a landscape phone who does NOT know the answers. He reads the one line, looks
// at what glows, pushes the stick toward the gold path he sees (and into walls), pokes everything, double- and triple-taps, holds too long
// and too short, drags the wrong way, opens the pause card mid-act, turns the phone, reloads, leaves it idle, makes wrong choices on
// purpose. Real touch (CDP Input.dispatchTouchEvent). Run ONLY through brun:
//   /home/claude/wt/bus/brun node tools/kid34/kid.cjs --mode day|lobby|chamber|lock|diag|screens|sumdiag|firstrun|ch33cam|views|botlook --size 640x296 --seed 3 --run NAME
//        [--save fresh|new|d3|d5 | --from RUN] [--now ISO --tz Zone] [--minutes 8.5] [--shots 8] [--idle] [--reload] [--rotate] [--page FILE]
// Writes …/auto/b34-<run>/: kid.json (the findings, the events, the guards, the engine's outcome events, the page errors, the stuck
// episodes — "hard" when the scripted bot, called in as a parent's hand after 75 s without a change, could not move it on either),
// shot-*.png, storage.json (the next run's --from). The page's eyes: kidpage.js (an init script); the sessions: kidmodes.cjs.
// (build 34, fable32: the naive kid's bug sweep — PROJECT.md "### build 34")
const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const ROOT = '/home/claude/temple3d';
const AUTO = '/tmp/claude-0/-home-claude/92bf52df-7cb5-51be-8ceb-ea3690eaf336/auto';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 && args[i + 1] != null && !args[i + 1].startsWith('--') ? args[i + 1] : d; };
const flag = (k) => args.includes(k);
const MODE = opt('--mode', 'day'), [VW, VH] = opt('--size', '640x296').split('x').map(Number), SEED = +opt('--seed', 1) || 1;
const RUN = opt('--run', `${MODE}-${VW}-${SEED}`), OUT = path.join(AUTO, 'b34-' + RUN), PAGE = path.resolve(ROOT, opt('--page', 'out/index.html'));
const MIN = +opt('--minutes', 8.6), SHOTS = +opt('--shots', 8), SAVE = opt('--save', 'd3'), FROM = opt('--from', ''), NOW = opt('--now', ''), TZ = opt('--tz', 'Asia/Jerusalem');
const BUILD = +opt('--build', 33);
fs.mkdirSync(OUT, { recursive: true });
const t0 = Date.now(), el = () => +((Date.now() - t0) / 1000).toFixed(1), END = t0 + MIN * 60000;
const left = () => END - Date.now();
const log = (...a) => console.log(el() + 's', ...a);
let seed = SEED * 7919 + 17; const rnd = () => { seed = (seed + 0x6d2b79f5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const between = (a, b) => a + rnd() * (b - a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const H = 3600e3;

// ── the saves ──
function preset(k) {
  const now = Date.now();
  if (k === 'fresh') return {};   // (no save at all: the first run's name and mishmar screens)
  if (k === 'new') return { bh_avodah: JSON.stringify({ v: 1, name: 'דרור', mishmar: 5, seenIntro: true, created: now, lastSeen: now }) };
  const d = k === 'd5' ? 5 : k === 'd2' ? 2 : 3;   // ── fable32 (build 39) ── (d2: a day-2 morning) ── /fable32 ──
  const shift = { day33state: { day: d, night: false, at: now - 3 * H, fuel: 64, fed: 25, logs: 0, left: 180, perutot: 12, washed: false, tamD: 'wait', tamE: 'wait', lambs: [true, true, false, false, false, false], tasks: [] },
    roles23: { m: d - 1, h: [[1, 'deshen', 'deshen'], [2, 'm22', 'm22'], [3, 'lamb', 'lamb'], [4, 'deshen', 'deshen']].slice(0, d - 1), kiyor: { n: d - 1, best: 100, last: 100 }, deshen: { n: 1, best: 90, last: 90 }, m22: { n: 1, best: 85, last: 85 }, ...(d > 3 ? { lamb: { n: 1, best: 80, last: 80 } } : {}) },
    roles26: { m: d - 1, h: [[1, 'menorah'], [2, 'inner'], [3, 'menorah'], [4, 'shochet']].slice(0, d - 1) }, perutot: 12, served30: d - 1 };
  if (d > 3) shift.roles23.menorah = { n: 2, best: 80, last: 80 }, shift.roles23.inner = { n: 1, best: 85, last: 85 }, shift.roles23.shochet = { n: 1, best: 90, last: 90 };
  else shift.roles23.menorah = { n: 1, best: 80, last: 80 }, shift.roles23.inner = { n: 1, best: 85, last: 85 };
  for (const id of (opt('--roles', '') || '').split(',').filter(Boolean)) shift.roles23[id] = shift.roles23[id] || { n: 1, best: 90, last: 90 };   // ── fable32 (build 39) ── (--roles: roles he has had — a practice of the zorek) ── /fable32 ──
  return { bh_avodah: JSON.stringify({ v: 1, name: 'דרור', mishmar: 5, seenIntro: true, created: now - 9 * 24 * H, lastSeen: now - 3 * H, shift }) };
}
const fromFile = FROM ? (fs.existsSync(FROM) ? FROM : [path.join(AUTO, 'b34-' + FROM, 'storage.json'), path.join(AUTO, FROM, 'storage.json')].find((f) => fs.existsSync(f))) : null;
if (FROM && !fromFile) { console.log('FAIL --from: no storage for', FROM); process.exit(2); }
const SAVED = fromFile ? JSON.parse(fs.readFileSync(fromFile, 'utf8')) : preset(SAVE);

const R = { run: RUN, mode: MODE, size: [VW, VH], seed: SEED, save: FROM || SAVE, now: NOW || null, findings: {}, events: [], errors: [], stuck: [], shots: [], guards: null, coins: [], screens: {}, notes: [] };
const ev = (k, d = '') => { R.events.push([el(), k, d]); if (R.events.length > 2500) R.events.shift(); };
const note = (s) => { R.notes.push([el(), s]); log('·', s); };
let pg, ctx, cdp, b, shotsLeft = SHOTS;
const fingers = new Map();
async function send(type) { await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 7, radiusY: 7, force: 1 })) }).catch((e) => note('touch ' + e.message)); }
const clampX = (x) => Math.max(2, Math.min(VW_() - 2, x)), clampY = (y) => Math.max(2, Math.min(VH_() - 2, y));
let curW = VW, curH = VH; const VW_ = () => curW, VH_ = () => curH;
async function down(id, x, y) { fingers.set(id, [clampX(x), clampY(y)]); await send('touchStart'); }
async function move(id, x, y) { if (!fingers.has(id)) return; fingers.set(id, [clampX(x), clampY(y)]); await send('touchMove'); }
async function up(id) { if (!fingers.has(id)) return; fingers.delete(id); if (fingers.size) await send('touchEnd'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }).catch(() => {}); }
async function liftAll() { for (const id of [...fingers.keys()]) await up(id); }
async function tap(x, y, ms = between(40, 110)) { await down(9, x, y); await sleep(ms); await up(9); }
async function taps(x, y, n) { for (let i = 0; i < n; i++) { await tap(x + between(-3, 3), y + between(-3, 3), between(30, 70)); await sleep(between(40, 120)); } }
async function swipe(x, y, dx, dy, ms = between(90, 260), id = 8) { const n = Math.max(3, Math.round(ms / 30)); await down(id, x, y); for (let i = 1; i <= n; i++) { await sleep(ms / n); await move(id, x + (dx * i) / n, y + (dy * i) / n); } await up(id); }
async function hold(x, y, ms, id = 8) { await down(id, x, y); const tEnd = Date.now() + ms; while (Date.now() < tEnd) { await sleep(Math.min(120, tEnd - Date.now())); await move(id, x + between(-1.5, 1.5), y + between(-1.5, 1.5)); } await up(id); }
// the stick: a thumb on the left half pushed toward (ux, uy) (screen: up = forward) for ms; it wobbles like a child's
// ── fable32 (build 39) ── the guided walk (no stick on the screen): the same thumb is a hold on the world — it lands anywhere (mostly the
// left half, now and then the right), drags a little in its direction (the choice between open places) and lets go; ?stick=1 pages keep
// the old stick ── /fable32 ──
async function stick(ux, uy, ms, id = 1) {
  const x0 = curW * (rnd() < 0.75 ? between(0.06, 0.45) : between(0.52, 0.72)), y0 = curH * between(0.3, 0.85), m = Math.hypot(ux, uy) || 1, R0 = 56 * between(0.3, 1.1);
  await down(id, x0, y0); const tEnd = Date.now() + ms;
  while (Date.now() < tEnd) { const wob = between(-0.25, 0.25); const a = Math.atan2(uy, ux) + wob; await move(id, x0 + Math.cos(a) * R0, y0 + Math.sin(a) * R0); await sleep(between(60, 140)); }
  await up(id);
}

// ── the findings (one per kind and text; the first time a shot while the budget lasts) ──
const IGNORE = [/^ellipsis/];   // (logged, judged by eye)
async function look() { return pg.evaluate((o) => (globalThis.__KID ? globalThis.__KID.scan(o) : null), { build: BUILD }).catch((e) => ({ err: e.message })); }
async function record(s, where) {
  if (!s || !s.checks) return;
  for (const [k, t, p] of s.checks) {
    const key = `${k}|${t.replace(/\d+(\.\d+)?/g, '#').slice(0, 90)}`;
    const f = R.findings[key] || (R.findings[key] = { k, t, p, n: 0, first: el(), where, screens: s.screens.join(' '), size: `${curW}x${curH}` });
    f.n++;
    if (f.n === 1 && !/^(ellipsis|latin|small|overlap|cut)$/.test(k)) log('FIND', k, t, '·', p);
    if (f.n === 1 && /^(overlap|cut|clipped|code|placeholder|stale-build|over-hero|offscreen|covered|fullscreen)$/.test(k) && shotsLeft > 2) { f.shot = await shot('f-' + k); }
  }
}
async function shot(name) {
  if (shotsLeft <= 0) return null; shotsLeft--;
  const file = `shot-${String(R.shots.length).padStart(2, '0')}-${name}.png`.replace(/[^A-Za-z0-9._-]/g, '_');
  await pg.evaluate(() => { try { window.__T.simulate(false); window.__HUD_HOLD = true; window.__T.render(); } catch (e) { /* */ } }).catch(() => {});
  await pg.screenshot({ path: path.join(OUT, file), timeout: 240000 }).catch((e) => note('shot failed ' + e.message));
  await pg.evaluate(() => { try { window.__HUD_HOLD = false; window.__T.simulate(true, 0.05); } catch (e) { /* */ } }).catch(() => {});
  R.shots.push([el(), file]); log('shot', file);
  return file;
}

// ── the stuck watch: the meaningful state (the screens, the act's phases, the gates, the line) unchanged for 60 s while he plays ──
let lastSig = '', sigAt = Date.now(), stuckOpen = null;
function watch(s) {
  if (!s || s.err) return;
  const core = s.sig;
  if (core !== lastSig) { if (stuckOpen) { stuckOpen.end = el(); stuckOpen.endSig = core.slice(0, 200); stuckOpen = null; } lastSig = core; sigAt = Date.now(); return; }
  if (!stuckOpen && Date.now() - sigAt > 60000) { stuckOpen = { at: el(), sig: core.slice(0, 300), line: s.line, screens: s.screens, eng: s.eng }; R.stuck.push(stuckOpen); log('STUCK 60 s', core.slice(0, 200)); }
}
const stuckFor = () => (Date.now() - sigAt) / 1000;

// ── the child's hands on whatever is on the screen ──
const isCard = (s) => s.screens.some((x) => /sh-pause|f17-sum|j32|p31-end|r30-c|tl33|j32u|lb-pk|sh-turn28|f17-rot|ch33/.test(x));
async function pokeButton(s, filt = null, why = 'poke') {
  let c = s.tp.filter((q) => q.reach && (!filt || filt(q)));
  if (!c.length) return false;
  // what glows draws the eye; then anything
  const g = c.filter((q) => q.glow); const q = g.length && rnd() < 0.5 ? pick(g) : pick(c);
  const r = rnd(), x = q.x + between(-q.w / 4, q.w / 4), y = q.y + between(-q.h / 4, q.h / 4);
  const before = s.coins;
  if (r < 0.7) await tap(x, y); else if (r < 0.85) await taps(x, y, 2); else if (r < 0.92) await taps(x, y, 3); else await hold(x, y, between(600, 1600));
  ev(why, `${q.lb.slice(0, 40)} (${Math.round(q.w)}×${Math.round(q.h)}) ${r < 0.7 ? 'tap' : r < 0.85 ? 'x2' : r < 0.92 ? 'x3' : 'hold'}`);
  await sleep(between(250, 700));
  const after = await pg.evaluate(() => { try { return JSON.parse(localStorage.getItem('bh_avodah') || '{}').shift.perutot; } catch (e) { return null; } }).catch(() => null);
  if (before != null && after != null && after !== before) { R.coins.push([el(), q.lb.slice(0, 40), before, after, r < 0.7 ? 1 : r < 0.85 ? 2 : r < 0.92 ? 3 : 'hold']); ev('coins', `${before}→${after} by ${q.lb.slice(0, 30)}`); }
  return q;
}
async function randomRight(s) {
  const W = curW, Hh = curH, x = between(W * 0.55, W * 0.95), y = between(Hh * 0.2, Hh * 0.9), r = rnd();
  if (r < 0.3) { await tap(x, y); ev('R-tap'); }
  else if (r < 0.4) { await taps(x, y, 2 + (rnd() < 0.3 ? 1 : 0)); ev('R-taps'); }
  else if (r < 0.55) { await hold(x, y, pick([120, 300, 900, 2500, 4500])); ev('R-hold'); }
  else if (r < 0.85) { const a = rnd() * Math.PI * 2, L = between(20, 160); await swipe(x, y, Math.cos(a) * L, Math.sin(a) * L, between(60, 500)); ev('R-swipe'); }
  else { // a wiggle drag
    await down(8, x, y); for (let i = 0; i < 12; i++) { await sleep(60); await move(8, x + between(-60, 60), y + between(-40, 40)); } await up(8); ev('R-wiggle');
  }
}
async function towardPath(s, ms) {
  const a = s.aim; if (!a || !s.hero || !s.hero.on) { await stick(between(-1, 1), between(-1, 0.3), ms); ev('stick-blind'); return; }
  let ux = a.sx - a.hx, uy = a.sy - a.hy; const m = Math.hypot(ux, uy); if (m < 4) { ux = 0; uy = -1; }
  await stick(ux / (m || 1) + between(-0.3, 0.3), uy / (m || 1) + between(-0.3, 0.3), ms); ev('stick-path', `${Math.round(a.d)}m`);
}
// read the line and try (a child who reads but does not know the answers)
async function tryLine(s) {
  const L = s.line || '', W = curW, Hh = curH, rx = () => between(W * 0.6, W * 0.9), ry = () => between(Hh * 0.35, Hh * 0.8);
  const rings = s.tp.filter((q) => /k20-r/.test(q.cls));
  if (/החזיקו/.test(L) && rings.length) {   // the laver: thumbs on the rings — sometimes one, sometimes lifted early
    const ms = pick([400, 1500, 3000, 5000, 6000]);
    const both = rnd() < 0.75; const [a, c] = rings.length > 1 ? rings : [rings[0], rings[0]];
    await down(3, a.x, a.y); if (both) { await sleep(between(50, 600)); await down(4, c.x, c.y); }
    const tEnd = Date.now() + ms; while (Date.now() < tEnd) { await sleep(150); await move(3, a.x + between(-2, 2), a.y); if (both) await move(4, c.x + between(-2, 2), c.y); }
    await liftAll(); ev('laver', `${both ? 'both' : 'one'} ${ms}ms`); return;
  }
  if (/למעלה/.test(L)) { await swipe(rx(), Hh * 0.75, between(-20, 20), -between(40, 150), between(80, 300)); ev('swipe-up'); return; }
  if (/הילך|להבריש|קנחו|הוציאו|ארוך|מהר|לרוחב/.test(L)) {   // (a child reads "ארוך יותר" / "מהר יותר" and swipes longer / quicker)
    const dir = rnd() < 0.5 ? 1 : -1, longer = /ארוך/.test(L) ? 1.6 : 1, quicker = /מהר/.test(L) ? 0.6 : 1, x0 = dir > 0 ? W * between(0.55, 0.7) : W * between(0.8, 0.95);
    await swipe(x0, ry(), dir * between(60, 230) * longer, between(-20, 20), between(70, 320) * quicker); ev('swipe-h'); return;
  }
  if (/אזנו/.test(L)) {   // the pan: the stick forward and the right thumb holds the balance by the tilt he sees (late and rough)
    const d21 = await pg.evaluate(() => { try { const K = globalThis.__SHIFT.E.d21(); return K ? K.b : 0; } catch (e) { return 0; } }).catch(() => 0);
    const x0 = W * 0.75, y0 = Hh * 0.62; await down(5, x0, y0);
    const x1 = curW * 0.2, y1 = curH * 0.7; await down(1, x1, y1);
    for (let i = 0, n = Math.round(between(25, 70)); i < n; i++) { const b0 = await pg.evaluate(() => { try { const K = globalThis.__SHIFT.E.d21(); return K ? K.b : null; } catch (e) { return null; } }).catch(() => null); if (b0 == null) break; await move(5, x0 - 70 * Math.max(-1, Math.min(1, b0 * between(0.8, 2.6) + between(-0.3, 0.3))), y0); await move(1, x1 + between(-8, 8), y1 - 56 * between(0.4, 1)); await sleep(between(90, 200)); }
    await liftAll(); ev('balance', String(d21).slice(0, 5)); return;
  }
  if (/ימינה|שמאלה/.test(L)) { const d = rnd() < 0.5 ? 1 : -1; await swipe(d > 0 ? W * 0.58 : W * 0.92, ry(), d * between(60, 300), between(-10, 10), between(80, 260)); ev('sort', d > 0 ? 'right' : 'left'); return; }
  if (/עבים|בינוני|דק|לבסיס|לרוחב|במרכז/.test(L)) { if (rnd() < 0.5) await stick(between(-1, 1), between(-0.3, 0.3), between(200, 900)); await tap(rx(), ry()); ev('stack'); return; }
  if (/האירו|כתם/.test(L)) { await down(6, rx(), ry()); for (let i = 0; i < 14; i++) { await sleep(70); await move(6, rx(), ry()); } await up(6); await sleep(200); if (rnd() < 0.6) await tap(rx(), ry()); ev('scan'); return; }
  if (/נגר/.test(L)) { await swipe(rx(), ry(), (rnd() < 0.5 ? 1 : -1) * between(60, 160), 0, between(150, 500)); ev('bolt'); return; }
  if (/סובבו/.test(L)) { const cx = W * 0.75, cy = Hh * 0.6; await down(6, cx + 50, cy); for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI * between(1, 2.2) * (rnd() < 0.8 ? 1 : -1); await move(6, cx + 50 * Math.cos(a), cy + 50 * Math.sin(a)); await sleep(50); } await up(6); ev('key'); return; }
  if (/חפנו|הטני|לאט/.test(L)) { await swipe(rx(), Hh * 0.35, between(-10, 10), between(40, 150), pick([150, 500, 1200])); ev('pull'); return; }
  if (/הפס|עד/.test(L)) { await hold(rx(), ry(), pick([300, 900, 1600, 2600, 4000])); ev('pour'); return; }
  if (/גררו/.test(L)) { const a = rnd() * Math.PI * 2; await swipe(rx(), ry(), Math.cos(a) * between(50, 150), Math.sin(a) * between(30, 100), between(200, 700)); ev('drag'); return; }
  if (/שחטו|הקישו|הציתו/.test(L)) { await sleep(between(0, 1500)); await tap(rx(), ry()); ev('tap-line'); return; }
  if (/מזרק|הזרם/.test(L)) { await down(6, W * 0.75, ry()); for (let i = 0; i < 20; i++) { await sleep(90); await move(6, W * between(0.6, 0.9), Hh * 0.6); } await up(6); ev('catch'); return; }
  if (/מרסו/.test(L)) { const x = rx(), y = Hh * 0.55; await down(6, x, y); for (let i = 0; i < 16; i++) { await sleep(between(80, 260)); await move(6, x, y + (i % 2 ? -40 : 40)); } await up(6); ev('shake'); return; }
  if (/זרקו|מתחת/.test(L)) { await swipe(rx(), Hh * 0.8, between(-30, 30), -between(40, 200), between(80, 300)); ev('throw'); return; }
  if (/שפכו|היסוד/.test(L)) { await swipe(rx(), Hh * 0.4, 0, between(40, 120), between(100, 300)); ev('pour-base'); return; }
  // a walk line, a wait line, or none: the path
  await towardPath(s, between(600, 2600));
}

// ── the run ──
(async () => {
  b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
  ctx = await b.newContext({ viewport: { width: VW, height: VH }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL', timezoneId: TZ });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await ctx.addInitScript(({ saved, seed }) => {
    window.__FORCE_Q = 'low';
    let a = seed >>> 0; Math.random = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    try { if (!sessionStorage.getItem('kid34')) { sessionStorage.setItem('kid34', '1'); localStorage.clear(); for (const [k, v] of Object.entries(saved)) localStorage.setItem(k, v); } } catch (e) { /* */ }
  }, { saved: SAVED, seed: SEED });
  await ctx.addInitScript({ path: path.join(__dirname, 'kidpage.js') });
  pg = await ctx.newPage();
  pg.on('console', (m) => { if (m.type() === 'error') R.errors.push([el(), 'console', m.text().slice(0, 300)]); });
  pg.on('pageerror', (e) => { R.errors.push([el(), 'PAGEERR', String(e.message).slice(0, 300)]); log('PAGEERR', e.message.slice(0, 200)); });
  cdp = await ctx.newCDPSession(pg);
  const url = 'file://' + PAGE + (NOW ? `?now=${encodeURIComponent(NOW)}&tz=${encodeURIComponent(TZ)}` : '');
  log('kid34', RUN, MODE, `${VW}x${VH}`, 'seed', SEED, 'save', FROM || SAVE, NOW || '');
  await pg.goto(url, { waitUntil: 'load', timeout: 180000 });
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 240000, polling: 500 });
  log('booted');
  await pg.evaluate(() => { window.__T.pause(true); window.__T.simulate(true, 0.05); });
  await sleep(1500);
  const M = require(path.join(__dirname, 'kidmodes.cjs'));
  const api = { R, pg, ctx, cdp, rnd, pick, between, sleep, el, left, log, ev, note, look, record, shot, watch, stuckFor, tap, taps, swipe, hold, stick, down, move, up, liftAll, pokeButton, randomRight, towardPath, tryLine, isCard,
    setSize: async (w, h) => { curW = w; curH = h; await pg.setViewportSize({ width: w, height: h }); }, size: () => [curW, curH], VW, VH, NOW, TZ, url, args, opt, flag, OUT, AUTO };
  try { await (M[MODE] || M.day)(api); } catch (e) { note('mode error ' + (e && e.stack || e).slice(0, 400)); }
  await liftAll().catch(() => {});
  R.guards = await pg.evaluate(() => (globalThis.__KID ? { ...globalThis.__KID.G } : null)).catch(() => null);
  R.engineEv = await pg.evaluate(() => (globalThis.__KID ? { n: globalThis.__KID.EV.n, rate: globalThis.__KID.EV.rate } : null)).catch(() => null);
  const ls = await pg.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)]))).catch(() => null);
  if (ls) fs.writeFileSync(path.join(OUT, 'storage.json'), JSON.stringify(ls));
  R.wallS = el();
  fs.writeFileSync(path.join(OUT, 'kid.json'), JSON.stringify(R, null, 1));
  const F = Object.values(R.findings);
  console.log('\n== findings', F.length);
  for (const f of F.sort((a, b) => a.k.localeCompare(b.k))) console.log(`  ${f.k.padEnd(12)} ×${String(f.n).padEnd(4)} ${f.t.slice(0, 110)}  ·  ${f.p.slice(0, 90)}${f.shot ? '  [' + f.shot + ']' : ''}`);
  console.log('== stuck', R.stuck.length, JSON.stringify(R.stuck).slice(0, 1200));
  console.log('== coins', JSON.stringify(R.coins));
  console.log('== guards', JSON.stringify(R.guards));
  console.log('== engine events', JSON.stringify(R.engineEv));
  console.log('== errors', R.errors.length); for (const e of R.errors.slice(0, 15)) console.log('  ', JSON.stringify(e));
  console.log('== screens', JSON.stringify(R.screens).slice(0, 1500));
  console.log('done', el() + 's');
  await b.close();
})().catch(async (e) => { console.error('FAIL', e && e.stack || e); try { fs.writeFileSync(path.join(OUT, 'kid.json'), JSON.stringify(R, null, 1)); } catch (err) { /* */ } process.exit(1); });
