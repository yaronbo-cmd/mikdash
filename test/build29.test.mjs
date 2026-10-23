// ── fable32 (build 29) ── build 29 (node): the opening screen at the real hour and the Shabbat and Yom Tov lock (HANDOFF rule 16; the
// owner 22.10 08:15 / 08:18 / 08:59; docs/specs/rohvi-he.md §1–§2). time29.js: where the phone is (the time zone's city, the precise
// position kept rounded, Jerusalem by default), the lock (an hour before candle-lighting to צאת הכוכבים, Israel / abroad), the calm line,
// the sky and the Temple now by the local sun; lock29.js: the lock screen, the "מכאן" card, the watch (the day saved, stopped, resumed);
// lobby35: the two doors. And a Divine-Name scan of the changed files, by code points.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { status29, where29, runs29, restDay29, yomTov29, softLine29, lockText29, sky29, templeNow29, srcHe29, hm29, clock29, query29, saveLoc29, readLoc29, inIsrael29, ZONES29, LOCK29, VERSE29, NIGHT29, LOC29_KEY, JERUSALEM29 } from '../src/avodah/shift/time29.js';
import { createWatch29, saveDay29, lockHTML29, hereHTML29, nowLineHTML29, softDay29, dropGames29, SOON29, LOCK29_CSS } from '../src/avodah/shift/lock29.js';
import { createLobby, LOBBY29 } from '../src/avodah/shift/lobby35.js';
import { civilDay, sunOnDay, sunTimes, templeSchedule, nowInTemple, TEMPLE_MOUNT } from '../src/calendar.js';
import { skyOf } from '../src/avodah/schedule.js';
import { rig, FLAGS, FLAGS34 } from './rig33.mjs';

const read = (f) => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const MIN = 60e3, H = 3600e3;
const JLM = where29({ tz: 'Asia/Jerusalem', query: null }), NY = where29({ tz: 'America/New_York', query: null });
const at = (iso, w = JLM) => status29(Date.parse(iso), w);
const hm = (ms, w = JLM) => hm29(ms, w.tz);
function withGlobals(g, fn) {
  const was = {}; for (const k of Object.keys(g)) { was[k] = Object.getOwnPropertyDescriptor(globalThis, k); Object.defineProperty(globalThis, k, { value: g[k], configurable: true, writable: true }); }
  const back = () => { for (const k of Object.keys(g)) { if (was[k]) Object.defineProperty(globalThis, k, was[k]); else delete globalThis[k]; } };
  let r; try { r = fn(); } catch (e) { back(); throw e; }
  if (r && typeof r.then === 'function') return r.finally(back);
  back(); return r;
}
const memStore = (o = {}) => ({ m: { ...o }, getItem(k) { return k in this.m ? this.m[k] : null; }, setItem(k, v) { this.m[k] = String(v); }, removeItem(k) { delete this.m[k]; } });

// ───────── B. the lock table ─────────
test('build 29 (B): Friday 23.10.2026, Jerusalem — open until an hour before candle-lighting (40 min before sunset), locked to צאת הכוכבים (8.5°)', () => {
  const fri = civilDay(new Date('2026-10-23T12:00:00+03:00'), 'Asia/Jerusalem'), sun = sunOnDay(fri, JLM), sat = sunOnDay(fri + 1, JLM);
  const s = at('2026-10-23T12:00:00+03:00');
  assert.equal(s.locked, false); assert.equal(s.kind, 'shabbat');
  assert.equal(s.candle, +sun.sunset - 40 * MIN, 'Jerusalem: 40 minutes'); assert.equal(s.locksAt, s.candle - 60 * MIN); assert.equal(s.opensAt, +sat.tzeit);
  assert.deepEqual([hm(s.locksAt), hm(s.candle), hm(s.opensAt)], ['16:18', '17:18', '18:33']);
  assert.equal(at('2026-10-23T16:17:00+03:00').locked, false); assert.equal(at('2026-10-23T16:19:00+03:00').locked, true);
  for (let t = s.locksAt + MIN; t < s.opensAt; t += 20 * MIN) assert.equal(status29(t, JLM).locked, true, new Date(t).toISOString());
  assert.equal(at('2026-10-24T18:32:00+03:00').locked, true); assert.equal(at('2026-10-24T18:35:00+03:00').locked, false);
  const L = lockText29(at('2026-10-23T21:00:00+03:00'), JLM);
  assert.equal(L.greet, 'שבת שלום'); assert.equal(L.open, 'המקדש ייפתח במוצאי שבת, בשעה 18:33'); assert.equal(L.jer, '', 'in Jerusalem itself no "already in Jerusalem"');
  assert.deepEqual([L.verse, L.src], ['וְשָׁמְרוּ בְנֵי יִשְׂרָאֵל אֶת הַשַּׁבָּת', 'שמות לא, טז']);
});
test('build 29 (B): New York, Friday 23.10.2026 — candle-lighting 18 min before its sunset, the lock an hour before, Shabbat out at its 8.5°; Jerusalem\'s began earlier', () => {
  const s = status29(Date.parse('2026-10-23T12:00:00-04:00'), NY), fri = civilDay(new Date('2026-10-23T12:00:00-04:00'), NY.tz);
  assert.equal(s.candle, +sunOnDay(fri, NY).sunset - 18 * MIN); assert.equal(s.opensAt, +sunOnDay(fri + 1, NY).tzeit);
  assert.deepEqual([hm(s.locksAt, NY), hm(s.candle, NY), hm(s.opensAt, NY)], ['16:45', '17:45', '18:43']);
  const n = status29(Date.parse('2026-10-23T20:00:00-04:00'), NY); assert.equal(n.locked, true);
  assert.equal(lockText29(n, NY).jer, 'בירושלים כבר נכנסה השבת');
  // Saturday afternoon in New York Jerusalem's Shabbat is over — no line
  assert.equal(lockText29(status29(Date.parse('2026-10-24T14:00:00-04:00'), NY), NY).jer, '');
});
test('build 29 (B): Rosh HaShana 5787 — both days, one lock from Friday to Sunday night (Jerusalem and New York); "שנה טובה"', () => {
  for (const w of [JLM, NY]) {
    const off = w === NY ? '-04:00' : '+03:00';
    const fri = status29(Date.parse(`2026-09-11T12:00:00${off}`), w);
    assert.equal(fri.locked, false);
    for (const iso of ['2026-09-11T21:00:00', '2026-09-12T12:00:00', '2026-09-12T21:00:00', '2026-09-13T12:00:00']) assert.equal(status29(Date.parse(iso + off), w).locked, true, `${w.city} ${iso}`);
    const sun = status29(Date.parse(`2026-09-13T12:00:00${off}`), w);
    assert.equal(sun.opensAt, +sunOnDay(civilDay(new Date(`2026-09-13T12:00:00${off}`), w.tz), w).tzeit); assert.equal(sun.locksAt, fri.locksAt, 'one lock');
    assert.equal(sun.greet, 'שנה טובה'); assert.equal(sun.name, 'ראש השנה'); assert.deepEqual(sun.verse, VERSE29.rh);
    assert.equal(status29(sun.opensAt + 2 * MIN, w).locked, false);
  }
});
test('build 29 (B): Yom Kippur 5787 (Monday 21.9.2026) — locked, "גמר חתימה טובה", opens במוצאי יום הכיפורים', () => {
  const s = at('2026-09-21T12:00:00+03:00');
  assert.equal(s.locked, true); assert.equal(s.greet, 'גמר חתימה טובה'); assert.equal(s.name, 'יום הכיפורים'); assert.match(lockText29(s, JLM).open, /^המקדש ייפתח במוצאי יום הכיפורים, בשעה \d\d:\d\d$/);
  assert.equal(at('2026-09-20T12:00:00+03:00').locked, false, 'Erev Yom Kippur at noon: open'); assert.equal(at('2026-09-22T12:00:00+03:00').locked, false);
  assert.equal(softLine29({ ...at('2026-09-20T12:00:00+03:00'), soft: true }), `עוד מעט יום הכיפורים — המקדש ייסגר ב-${hm(s.locksAt)}`);
});
test('build 29 (B): Sukkot — day 1 locked, Chol HaMoed open, Shemini Atzeret locked (Jerusalem); abroad also Sukkot 2 and Simchat Torah', () => {
  assert.equal(at('2026-09-26T12:00:00+03:00').locked, true, 'Sukkot 1 (Shabbat)');
  for (const iso of ['2026-09-27T12:00:00+03:00', '2026-09-28T12:00:00+03:00', '2026-09-29T12:00:00+03:00', '2026-09-30T12:00:00+03:00', '2026-10-01T12:00:00+03:00']) assert.equal(at(iso).locked, false, `Chol HaMoed ${iso}`);
  assert.equal(at('2026-10-03T12:00:00+03:00').locked, true, 'Shemini Atzeret'); assert.equal(at('2026-10-03T12:00:00+03:00').name, 'שבת · שמיני עצרת · שמחת תורה');
  assert.equal(at('2026-10-04T12:00:00+03:00').locked, false, 'Jerusalem: Sunday 4.10 open');
  const ny = (iso) => status29(Date.parse(iso), NY);
  assert.equal(ny('2026-09-27T12:00:00-04:00').locked, true, 'New York: Sukkot 2'); assert.equal(ny('2026-09-27T12:00:00-04:00').name, 'סוכות');
  assert.equal(ny('2026-09-28T12:00:00-04:00').locked, false, 'New York: Chol HaMoed open');
  assert.equal(ny('2026-10-04T12:00:00-04:00').locked, true, 'New York: Simchat Torah'); assert.equal(ny('2026-10-04T12:00:00-04:00').name, 'שמחת תורה');
  assert.equal(ny('2026-10-04T12:00:00-04:00').greet, 'חג שמח'); assert.deepEqual(ny('2026-10-04T12:00:00-04:00').verse, VERSE29.yt);
  // the one lock from Friday's candle-lighting to Sunday night (Shemini Atzeret on Shabbat + Simchat Torah)
  assert.equal(ny('2026-10-04T12:00:00-04:00').locksAt, ny('2026-10-02T12:00:00-04:00').locksAt);
  const L = lockText29(ny('2026-09-27T12:00:00-04:00'), NY); assert.equal(L.jer, '', 'Jerusalem is in Chol HaMoed by then');
});
test('build 29 (B): Pesach 5787 — Jerusalem days 1 and 7; New York also 2 and 8 (Thursday–Shabbat one lock; 22 Nisan "אחרון של פסח")', () => {
  assert.equal(at('2027-04-22T12:00:00+03:00').locked, true); assert.equal(at('2027-04-23T12:00:00+03:00').locked, false, 'Jerusalem: 16 Nisan is Chol HaMoed');
  assert.equal(at('2027-04-28T12:00:00+03:00').locked, true); assert.equal(at('2027-04-29T12:00:00+03:00').locked, false);
  const ny = (iso) => status29(Date.parse(iso), NY);
  for (const iso of ['2027-04-22T12:00:00-04:00', '2027-04-23T12:00:00-04:00', '2027-04-24T12:00:00-04:00']) assert.equal(ny(iso).locked, true, iso);
  assert.equal(ny('2027-04-24T12:00:00-04:00').locksAt, ny('2027-04-22T12:00:00-04:00').locksAt, 'Pesach 1, 2 and Shabbat: one lock');
  assert.equal(ny('2027-04-25T12:00:00-04:00').locked, false, 'Chol HaMoed');
  assert.equal(ny('2027-04-29T12:00:00-04:00').locked, true, 'Pesach 8'); assert.equal(ny('2027-04-29T12:00:00-04:00').name, 'אחרון של פסח');
});
test('build 29 (B): Shavuot — one day in Israel, two abroad (5788: Wednesday–Thursday); a Yom Tov on Friday runs into Shabbat as one lock (5787)', () => {
  assert.equal(at('2028-05-31T12:00:00+03:00').locked, true); assert.equal(at('2028-06-01T12:00:00+03:00').locked, false, 'Israel: 7 Sivan open');
  assert.equal(status29(Date.parse('2028-05-31T12:00:00-04:00'), NY).locked, true); assert.equal(status29(Date.parse('2028-06-01T12:00:00-04:00'), NY).locked, true, 'abroad: Shavuot 2');
  assert.equal(yomTov29(civilDay(new Date('2028-06-01T12:00:00Z')), true), null); assert.equal(yomTov29(civilDay(new Date('2028-06-01T12:00:00Z')), false).name, 'שבועות');
  // Shavuot 5787 on Friday 11.6.2027 (Jerusalem): Thursday's candle-lighting − 1 h → Saturday's צאת הכוכבים, no gap at Friday's sunset
  const thu = at('2027-06-10T12:00:00+03:00'), fri = at('2027-06-11T12:00:00+03:00'), satN = at('2027-06-12T12:00:00+03:00');
  assert.equal(thu.locked, false); assert.equal(fri.locked, true); assert.equal(satN.locked, true);
  assert.equal(fri.locksAt, thu.locksAt); assert.equal(satN.locksAt, thu.locksAt); assert.equal(fri.opensAt, satN.opensAt);
  assert.equal(fri.opensAt, +sunOnDay(civilDay(new Date('2027-06-12T12:00:00+03:00'), 'Asia/Jerusalem'), JLM).tzeit);
  for (let t = fri.locksAt + MIN; t < fri.opensAt; t += 15 * MIN) assert.equal(status29(t, JLM).locked, true, new Date(t).toISOString());
  assert.equal(fri.name, 'שבועות'); assert.equal(fri.greet, 'חג שמח'); assert.equal(satN.name, 'שבת'); assert.equal(satN.greet, 'שבת שלום');
  assert.equal(lockText29(fri, JLM).open.startsWith('המקדש ייפתח במוצאי שבת,'), true, 'it opens after Shabbat');
  assert.equal(runs29(civilDay(new Date('2027-06-11T12:00:00+03:00'), 'Asia/Jerusalem'), JLM).filter((r) => r.days.some((d) => d.yt)).length, 1);
});
test('build 29 (B): days that are not Yom Tov stay open — Chanukah, Purim, Erev Pesach, 9 Av, Rosh Chodesh (weekdays)', () => {
  for (const iso of ['2026-12-07T12:00:00+02:00', '2027-03-23T12:00:00+02:00', '2027-04-21T12:00:00+03:00', '2027-08-12T12:00:00+03:00', '2026-11-11T12:00:00+02:00']) {
    const dn = civilDay(new Date(iso), 'Asia/Jerusalem');
    if (restDay29(dn, true)) continue;   // (a Shabbat would be locked anyway)
    assert.equal(status29(Date.parse(iso), JLM).locked, false, iso);
  }
});

// ───────── A. where the phone is ─────────
test('build 29 (A): the time zone → a city (Israel → Jerusalem; the families\' zones abroad); unlisted → its offset; no zone → Jerusalem', () => {
  const near = (w, lat, lon) => Math.abs(w.lat - lat) < 0.6 && Math.abs(w.lon - lon) < 0.6;
  assert.ok(near(JLM, 31.78, 35.23) && JLM.israel && JLM.source === 'tz' && JLM.city === 'ירושלים');
  const table = { 'America/New_York': [40.7, -74], 'America/Chicago': [41.9, -87.6], 'America/Los_Angeles': [34.05, -118.2], 'America/Toronto': [43.65, -79.4], 'America/Montreal': [45.5, -73.6], 'Europe/London': [51.5, -0.1], 'Europe/Paris': [48.86, 2.35], 'Europe/Brussels': [51.2, 4.4], 'Europe/Amsterdam': [52.37, 4.9], 'Europe/Berlin': [52.5, 13.4], 'Europe/Zurich': [47.4, 8.5], 'Europe/Rome': [41.9, 12.5], 'Europe/Moscow': [55.75, 37.6], 'Europe/Kiev': [50.45, 30.5], 'Europe/Kyiv': [50.45, 30.5], 'Africa/Johannesburg': [-26.2, 28.05], 'Australia/Sydney': [-33.87, 151.2], 'Australia/Melbourne': [-37.8, 145], 'America/Argentina/Buenos_Aires': [-34.6, -58.4], 'America/Sao_Paulo': [-23.55, -46.6], 'America/Mexico_City': [19.43, -99.13] };
  for (const [tz, [lat, lon]] of Object.entries(table)) { const w = where29({ tz, query: null }); assert.ok(near(w, lat, lon), `${tz}: ${w.lat},${w.lon}`); assert.equal(w.israel, false, tz); assert.equal(w.source, 'tz'); assert.equal(w.tz, tz); assert.ok(w.city && !/[A-Za-z]/.test(w.city), w.city); }
  for (const tz of ['Asia/Jerusalem', 'Asia/Tel_Aviv']) assert.equal(where29({ tz, query: null }).israel, true);
  const kat = where29({ tz: 'Asia/Kathmandu', query: null }); assert.equal(kat.israel, false); assert.equal(kat.approx, true); assert.ok(Math.abs(kat.lon - 86.25) < 0.01, `lon ${kat.lon}`);
  const south = where29({ tz: 'America/Lima', query: null }); assert.ok(south.lat < 0, 'a southern zone: south');
  for (const tz of ['UTC', 'Etc/UTC', 'Not/AZone', '']) { const w = where29({ tz, query: null, }); if (tz === '' ) continue; assert.equal(w.source, 'default', tz); assert.equal(w.israel, true); assert.ok(near(w, 31.78, 35.23)); }
  assert.ok(Object.keys(ZONES29).length >= 40);
});
test('build 29 (A): "מיקום מדויק" — off by default; on: kept ROUNDED (2 decimals) with the Israel flag in bh_loc29, and where29 → gps; off: forgotten', () => {
  const store = memStore();
  withGlobals({ localStorage: store }, () => {
    assert.equal(readLoc29(), null); assert.equal(where29({ tz: 'Asia/Jerusalem', query: null }).source, 'tz');
    const v = saveLoc29(32.085312, 34.781768);
    assert.deepEqual(JSON.parse(store.getItem(LOC29_KEY)), { on: true, lat: 32.09, lon: 34.78, israel: true }); assert.deepEqual(v, { on: true, lat: 32.09, lon: 34.78, israel: true });
    const w = where29({ tz: 'Asia/Jerusalem', query: null }); assert.equal(w.source, 'gps'); assert.equal(w.lat, 32.09); assert.equal(w.israel, true);
    // Tel Aviv: candle-lighting 18 minutes (not Jerusalem's 40); the Jerusalem line shows (Jerusalem's began 23 minutes earlier)
    const s = status29(Date.parse('2026-10-23T12:00:00+03:00'), w), fri = civilDay(new Date('2026-10-23T12:00:00+03:00'), 'Asia/Jerusalem');
    assert.equal(s.candle, +sunOnDay(fri, w).sunset - 18 * MIN);
    assert.equal(lockText29(status29(Date.parse('2026-10-23T18:00:00+03:00'), w), w).jer, 'בירושלים כבר נכנסה השבת');
    saveLoc29(40.7128, -74.006); assert.equal(readLoc29().israel, false);
    saveLoc29(null); assert.equal(store.getItem(LOC29_KEY), null); assert.equal(where29({ tz: 'Asia/Jerusalem', query: null }).source, 'tz');
  });
  assert.equal(inIsrael29(31.25, 34.79), true, 'Beer Sheva'); assert.equal(inIsrael29(29.56, 34.95), true, 'Eilat'); assert.equal(inIsrael29(33.2, 35.6), true, 'Golan'); assert.equal(inIsrael29(30.04, 31.24), false, 'Cairo');
  // the code never sends it: no fetch / XMLHttpRequest / sendBeacon / WebSocket in the build-29 modules
  for (const f of ['src/avodah/shift/time29.js', 'src/avodah/shift/lock29.js']) assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon|WebSocket/.test(read(f)), f);
  // the lobby asks only on the player's tap (getCurrentPosition in loc29(), nowhere else; no watchPosition)
  const lb = read('src/avodah/shift/lobby35.js'); assert.equal((lb.match(/getCurrentPosition\(/g) || []).length, 1); assert.ok(!/watchPosition/.test(lb));
  assert.ok(lb.indexOf('getCurrentPosition') > lb.indexOf('function loc29()'));
});
test('build 29 (A): the test hook — __NOW29 (ms, ISO, a function), __TZ29, __LOC29; ?now=&tz= only on a local page (file:, localhost), never on the published one', () => {
  withGlobals({ __NOW29: Date.parse('2026-10-23T16:30:00+03:00') }, () => assert.equal(clock29(), Date.parse('2026-10-23T16:30:00+03:00')));
  withGlobals({ __NOW29: '2026-10-23T16:30:00+03:00' }, () => assert.equal(clock29(), Date.parse('2026-10-23T16:30:00+03:00')));
  withGlobals({ __NOW29: () => 42 }, () => assert.equal(clock29(), 42));
  withGlobals({ __TZ29: 'America/New_York' }, () => assert.equal(where29({ query: null }).city, 'ניו יורק'));
  withGlobals({ __LOC29: { lat: 51.5, lon: -0.12 } }, () => { const w = where29({ tz: 'Europe/London', query: null }); assert.equal(w.source, 'gps'); assert.equal(w.israel, false); });
  const q = '?now=2026-10-23T16:30:00%2B03:00&tz=America/New_York';
  withGlobals({ location: { href: 'file:///home/x/out/index.html' + q + '#shift', search: q } }, () => {
    assert.deepEqual(query29(), { now: '2026-10-23T16:30:00+03:00', tz: 'America/New_York' });
    assert.ok(Math.abs(clock29() - Date.parse('2026-10-23T16:30:00+03:00')) < 60e3 * 60, 'the clock runs on from it');
    assert.equal(where29().city, 'ניו יורק');
  });
  withGlobals({ location: { href: 'https://yaronbo-cmd.github.io/mikdash/' + q, search: q } }, () => { assert.equal(query29(), null); assert.ok(Math.abs(clock29() - Date.now()) < 5000, 'the real clock'); });
});

// ───────── the soft notice ─────────
test('build 29 (soft): the calm line in the last 15 minutes before the lock — one fixed line (the hour, no countdown); on the lobby, over the day, on the pause card', () => {
  const s0 = at('2026-10-23T12:00:00+03:00');
  assert.equal(status29(s0.locksAt - 16 * MIN, JLM).soft, false); assert.equal(softLine29(status29(s0.locksAt - 16 * MIN, JLM)), '');
  const lines = new Set();
  for (let t = s0.locksAt - 15 * MIN; t < s0.locksAt; t += 37e3) { const s = status29(t, JLM); assert.equal(s.soft, true); assert.equal(s.locked, false); lines.add(softLine29(s)); }
  assert.deepEqual([...lines], ['עוד מעט שבת — המקדש ייסגר ב-16:18'], 'the same words all the way: no ticking');
  assert.equal(LOCK29.soft, 15); assert.equal(LOCK29.before, 60);
  // the lobby's start screen and full screen
  const Lb = createLobby({ save: {}, start: true, now: () => s0.locksAt - 5 * MIN, where: () => JLM });
  assert.ok(!/lb-soft/.test(Lb.html())); Lb.soft29('עוד מעט שבת — המקדש ייסגר ב-16:18');
  assert.match(Lb.html(), /<div class="lb-soft" data-lb29="soft">עוד מעט שבת — המקדש ייסגר ב-16:18<\/div>/); assert.equal(Lb.state().soft, 'עוד מעט שבת — המקדש ייסגר ב-16:18');
  // the day: the line under its top bar; the pause card's note
  const ix = read('src/avodah/shift/index.js'), hud = read('src/avodah/shift/hud.js');
  assert.match(ix, /note: W29\.softLine/); assert.match(ix, /softDay29\(doc, E \? line : ''\)/); assert.match(hud, /\$\{h\.note \? `<p class="sh-note29">/);
  assert.match(LOCK29_CSS, /#s29-soft\{position:fixed;/); assert.ok(!/@keyframes|animation/.test(LOCK29_CSS), 'calm: nothing pulses');
  // no buzz, no sound with it
  const l29 = read('src/avodah/shift/lock29.js'); assert.ok(!/vibrate|sfx\.play|\.play\(/.test(l29));
});

// ───────── the lock mid-day: saved, stopped, the lock screen; resumed after ─────────
const mid3 = () => ({ day33state: { day: 3, at: Date.now() - 3 * H, washed: true, fuel: 61, fed: 25, logs: 2, left: 120, perutot: 9, p23day: 3, lot: 'lamb', d21day: 3, p25day: 3, p26day: 3, role26: 'menorah', g26day: 3, r26day: 3, tamD: 'ok', lambs: [true, false, false, false, false, false], tasks: [] } });
// (build 35: in the morning of the work a morning whose work is done goes to its close and its summary at once — mid3's day 3 is "mid-day"
// only in the old loop (FLAGS34); in the morning of the work the lock comes mid-morning: the second lot drawn, his role not yet done — mid3b)
const mid3b = () => { const s = mid3(); delete s.day33state.r26day; delete s.day33state.g26day; return s; };
for (const [FL, mk, tag] of [[FLAGS34, mid3, ''], [FLAGS, mid3b, ' (build 35: mid-morning)']])
test(`build 29 (B): the lock mid-day — the watch saves the day as it is (day33's saveState), stops it, shows the lock screen; at its end the lobby; the day resumes ("המשך יום 3")${tag}`, async () => {
  const save = mk(), R = rig(FL, { save }); R.E.start(); await R.step(8);
  const s0 = at('2026-10-23T12:00:00+03:00');
  let t = s0.locksAt - 3 * MIN, stopped = 0, shown = null, hidden = 0, reopened = 0, persisted = 0; const softs = [], logs = [];
  const W = createWatch29({ now: () => t, where: () => JLM, active: () => true, E: () => R.E, persist: () => persisted++, stop: () => { stopped++; R.E.stop(); }, show: (s) => { shown = s; }, hide: () => hidden++, reopen: () => reopened++, soft: (l) => softs.push(l), log: (k, d) => logs.push([k, d]) });
  W.check(); assert.equal(W.locked, false); assert.deepEqual(softs, ['עוד מעט שבת — המקדש ייסגר ב-16:18']); assert.equal(W.softLine, softs[0]);
  const before = { day: R.E.state().day, fuel: R.E.state().fuel, logs: R.E.state().logs };
  t = s0.locksAt + 30e3; W.check();
  assert.equal(W.locked, true); assert.equal(stopped, 1); assert.ok(shown && shown.locked && shown.kind === 'shabbat'); assert.equal(persisted, 1); assert.equal(softs.at(-1), '', 'the calm line off');
  assert.equal(save.day33state.day, 3); assert.ok(['lock29', 'stop'].includes(save.day33state.why), save.day33state.why); assert.equal(save.day33state.fuel, before.fuel === undefined ? save.day33state.fuel : save.day33state.fuel);
  assert.deepEqual(logs[0][0], 'lock29'); assert.equal(logs[0][1].saved, true);
  t = Date.parse('2026-10-23T21:00:00+03:00'); W.check(); assert.equal(stopped, 1, 'once'); assert.equal(W.locked, true);
  t = s0.opensAt + 60e3; W.check(); assert.equal(W.locked, false); assert.equal(hidden, 1); assert.equal(reopened, 1);
  // the lobby after the lock: "המשך יום 3"; the day resumes as it was
  assert.match(createLobby({ save, start: true, now: () => t, where: () => JLM }).html(), /נקודת המוצא שלי<\/small>המשך יום 3/);
  const R2 = rig(FL, { save }); R2.E.start(); await R2.step(0.3);
  const s = R2.E.state(); assert.equal(s.day, 3); assert.equal(s.resumed, 3); assert.equal(s.lot, 'lamb'); assert.equal(s.role26, 'menorah'); assert.equal(s.washed33, true);
  assert.equal(saveDay29(null), false); assert.equal(saveDay29({}), false);
});
test('build 29 (B): the gate — the lobby and the day open only through it; a page opened during the lock shows its screen alone (before the first-run screens); the watch waits for the shift', () => {
  const ix = read('src/avodah/shift/index.js');
  const card = ix.slice(ix.indexOf('function card()'), ix.indexOf('function card()') + 400); assert.match(card, /hero35\(\); goLive\(\);[^\n]*\n\s*if \(gate29\(\)\) return;/);
  const rd = ix.slice(ix.indexOf('function runDay()'), ix.indexOf('function runDay()') + 300); assert.match(rd, /if \(gate29\(\)\) return false;/);
  assert.match(ix, /function gate29\(after\) \{ W29\.check\(true\); if \(!W29\.locked\) return false;/);
  assert.match(ix, /active: \(\) => live/); assert.match(ix, /turn28: \(port\) => turn28\(port && !W29\.locked\)/, 'no "turn the phone" over the lock');
  assert.match(ix, /stop: \(\) => \{ teardown\(\); dropGames29\(doc\);/);
  const av = read('src/avodah/index.js'), g = av.indexOf('SH.gate29(() => start(o))'), n = av.indexOf('if (!S.hasPlayer(A)) {');
  assert.ok(g > 0 && g < n, 'before the name and mishmar screens');
  // the watch does nothing before the shift is up, unless forced (the gate)
  let shown = 0; const W = createWatch29({ now: () => Date.parse('2026-10-23T21:00:00+03:00'), where: () => JLM, active: () => false, show: () => shown++ });
  assert.equal(W.check(), null); assert.equal(shown, 0); assert.ok(W.check(true).locked); assert.equal(shown, 1);
});
test('build 29 (B): the lock screen — the court at rest (no kohen, no lamb, no motes), the greeting, the hour it opens (no countdown), the verse (טיוטה), the switches; no door to play', () => {
  const s = at('2026-10-23T21:00:00+03:00');
  const Lb = createLobby({ save: mid3(), start: true, lock: s, now: () => Date.parse('2026-10-23T21:00:00+03:00'), where: () => JLM, on: { day: () => { throw new Error('no day in the lock'); } } });
  const h = Lb.html();
  assert.match(h, /<h2>שבת שלום<\/h2>/); assert.match(h, /המקדש ייפתח במוצאי שבת, בשעה 18:33/); assert.match(h, /שמות לא, טז · טיוטה/);
  assert.ok(!/data-lb="(play|games|here|home|full|loc)"/.test(h), 'no door'); assert.match(h, /data-p28="mute"/); assert.match(h, /data-p28="haptics"/);
  assert.ok(!/עוד \d+ דקות|\d+:\d\d:\d\d|בעוד/.test(h), 'the time only — no countdown');
  assert.equal(Lb.pick('play'), false); assert.equal(Lb.state().lock, true);
  const lb = read('src/avodah/shift/lobby35.js'), d = lb.slice(lb.indexOf('function draw(k, t, dt)'), lb.indexOf('/* ── the doors ── */'));
  assert.match(d, /if \(st\.lock\) return;/); const r0 = d.indexOf('if (st.lock) return;');
  for (const s of ['k.c(a, s, y + 0.01', 'const H = H35();', 'lamb(k,', 'LOBBY35.motes']) assert.ok(d.indexOf(s) > r0, `before ${s}: the disc, the kohen, the lamb, the motes`);
  assert.match(lb, /S\.hero\.show\(!!H35\(\) && !st\.lock\)/);
  assert.match(LOCK29_CSS, /\.lb\.lb-lock\{z-index:9100\}/); assert.match(LOCK29_CSS, /@media \(orientation:portrait\)\{\.lb\.lb-lock\{background:/);
  // Yom Tov and Yom Kippur greetings; abroad the second day's note; Jerusalem's line in New York
  assert.match(lockHTML29(status29(Date.parse('2026-09-27T12:00:00-04:00'), NY), NY), /<h2>חג שמח<\/h2>[^]*סוכות[^]*חוץ לארץ: גם יום טוב שני/);
  assert.match(lockHTML29(at('2026-09-21T12:00:00+03:00'), JLM), /<h2>גמר חתימה טובה<\/h2>/);
  assert.match(lockHTML29(status29(Date.parse('2026-10-23T20:00:00-04:00'), NY), NY), /<div class="lk-jer">בירושלים כבר נכנסה השבת<\/div>/);
  assert.deepEqual(VERSE29.shabbat, ['וְשָׁמְרוּ בְנֵי יִשְׂרָאֵל אֶת הַשַּׁבָּת', 'שמות לא, טז']);
  assert.equal(dropGames29(null), 0);
});

// ───────── C. the opening screen at the real hour ─────────
test('build 29 (C): the court lit by the real sun where the phone is — dawn, noon, dusk, night (Jerusalem); New York by its own date (schedule.js skyOf took Jerusalem\'s)', () => {
  const rec = [];
  withGlobals({ __T: { setTime: (k) => rec.push(k) } }, () => {
    for (const [iso, w, want] of [['2026-10-22T06:45:00+03:00', JLM, 'dawn'], ['2026-10-22T12:30:00+03:00', JLM, 'noon'], ['2026-10-22T17:30:00+03:00', JLM, 'dusk'], ['2026-10-22T21:30:00+03:00', JLM, 'night'], ['2026-10-22T03:00:00+03:00', JLM, 'night'], ['2026-10-22T12:30:00-04:00', NY, 'noon'], ['2026-10-22T17:45:00-04:00', NY, 'dusk']]) {
      const Lb = createLobby({ save: {}, start: true, now: () => Date.parse(iso), where: () => w });
      assert.equal(Lb.state().sky, want, iso); assert.equal(rec.at(-1), LOBBY29.sky[want], iso); assert.equal(sky29(Date.parse(iso), w), want);
    }
  });
  assert.equal(skyOf(Date.parse('2026-10-22T17:45:00-04:00'), NY), 'night', '(the old skyOf, by Jerusalem\'s date: night at a New York dusk)');
  assert.equal(LOBBY29.sky.night, 'night', 'the readable moonlit night (HANDOFF §3), not the day\'s dark nightd');
  assert.ok(!/W\.setTime\('dawn'\)/.test(read('src/avodah/shift/lobby35.js')), 'no longer always dawn');
});
test('build 29 (C): "עכשיו במקדש: …" — calendar.js\'s service now by the local sun, its source (טיוטה); at night the guards (מידות א, א)', () => {
  const noon = templeNow29(Date.parse('2026-10-22T12:30:00+03:00'), JLM);
  assert.equal(noon.current.id, 'korbanot-yachid'); assert.equal(noon.line, 'עכשיו במקדש: קרבנות יחיד'); assert.match(noon.src, /^פסחים נח ע״ב/);
  const ref = nowInTemple(new Date('2026-10-22T12:30:00+03:00'), JLM, JLM.tz); assert.equal(noon.current.name, ref.current.nameHe);
  const night = templeNow29(Date.parse('2026-10-22T21:30:00+03:00'), JLM);
  assert.equal(night.sky, 'night'); assert.equal(night.current.id, 'haktarat-halaila'); assert.equal(night.night, NIGHT29); assert.equal(NIGHT29.src, 'מידות א, א');
  assert.equal(NIGHT29.quote, 'בִּשְׁלֹשָׁה מְקוֹמוֹת הַכֹּהֲנִים שׁוֹמְרִים בְּבֵית הַמִּקְדָּשׁ');
  const gap = templeNow29(Date.parse('2026-10-22T17:30:00+03:00'), JLM);   // (after the lamps, before sunset: nothing in calendar.js)
  assert.equal(gap.current, null); assert.equal(gap.line, `עכשיו במקדש: בין העבודות · הבא ב-${gap.next[0].hm}`); assert.equal(gap.next[0].id, 'haktarat-halaila');
  assert.match(nowLineHTML29(gap, ''), /בין העבודות · הבא ב-\d\d:\d\d <small>· המחשה<\/small>/, 'no source of its own: המחשה');
  const h = nowLineHTML29(night, ''); assert.match(h, /עכשיו במקדש: הקטר חלבים ואיברים <small>· ברכות א, א · טיוטה<\/small>/); assert.match(h, /שומרים בשלשה מקומות <small>· מידות א, א · טיוטה<\/small>/);
  // New York: the afternoon Tamid at New York's 8.5 seasonal hours (Pesachim 5:1), not Jerusalem's
  const nyEv = templeSchedule(new Date('2026-10-22T12:00:00-04:00'), NY, NY.tz).find((e) => e.id === 'tamid-bein-haarbayim');
  const nyNext = templeNow29(Date.parse('2026-10-22T12:30:00-04:00'), NY).next.find((e) => e.id === 'tamid-bein-haarbayim');
  assert.equal(nyNext.at, +nyEv.start); assert.equal(nyNext.hm, hm29(+nyEv.start, NY.tz)); assert.equal(nyNext.approx, false); assert.match(nyNext.hm, /^1[45]:\d\d$/);
  assert.deepEqual(['Mishnah Tamid 3:2', 'Yoma 33a', 'Numbers 28-29', 'Mishnah Sukkah 5:1-4', 'Mishneh Torah, Paschal Offering 1:4', 'Exodus 30:8'].map(srcHe29), ['תמיד ג, ב', 'יומא לג ע״א', 'במדבר כח–כט', 'סוכה ה, א–ד', 'רמב״ם, קרבן פסח א, ד', 'שמות ל, ח']);
});
test('build 29 (C): the two doors — the gold one stays the player\'s own ("נקודת המוצא שלי · המשך יום N" / "משחק"); "מכאן — המקדש עכשיו" opens a card (now, next, the chambers to come — locked), no reward', () => {
  const t = Date.parse('2026-10-22T12:30:00+03:00'), calls = [];
  const save = mid3(), Lb = createLobby({ save, start: true, now: () => t, where: () => JLM, on: { day: () => calls.push('day') } });
  const h = Lb.html();
  assert.match(h, /data-lb="play"><small class="lb-k">נקודת המוצא שלי<\/small>המשך יום 3/); assert.match(h, /data-lb="here"[^]*מכאן — המקדש עכשיו/);
  assert.ok(h.indexOf('data-lb="here"') < h.indexOf('data-lb="play"'), 'the second door above the gold one'); assert.match(h, /עכשיו במקדש: קרבנות יחיד/);
  assert.match(h, /data-lb="loc"[^>]*aria-pressed="false"[^]*מיקום מדויק/, '"מיקום מדויק" off by default');
  assert.match(createLobby({ save: {}, start: true, now: () => t, where: () => JLM }).html(), /נקודת המוצא שלי<\/small>משחק/);
  const per = JSON.stringify(save);
  assert.equal(Lb.pick('here'), true); assert.equal(Lb.state().here, true);
  const c = Lb.html(); assert.match(c, /המקדש עכשיו · 12:30/); assert.match(c, /<b>עכשיו<\/b><span>קרבנות יחיד/);
  const pm = hm29(+templeSchedule(new Date(t), JLM, JLM.tz).find((e) => e.id === 'tamid-bein-haarbayim').start, JLM.tz);   // (Pesachim 5:1's 8½ seasonal hours: exact — no ≈)
  assert.match(c, new RegExp(`<b>${pm}</b><span>תמיד של בין הערביים<small>פסחים ה, א · טיוטה`)); assert.match(c, /<b>≈ \d\d:\d\d<\/b><span>קטורת של בין הערביים/);
  // ── fable32 (build 33) ── (לשכת הטלאים is open now — chamber33's door, given by the lobby when the shift wires on.chamber; this lobby has
  // no on.chamber, so no door — the wood chamber alone stays "בקרוב"; build 33's own test holds the open door) ── /fable32 ──
  assert.match(c, /🔒 בקרוב מכאן: לשכת העצים/); assert.deepEqual([...SOON29], ['לשכת העצים']);
  assert.ok(!/פרוטות|\+\d|★/.test(c.slice(c.indexOf('lk-here'))), 'no reward in the card'); assert.ok(!/בעוד|עוד \d+ דקות/.test(c), 'no countdown');
  assert.equal(Lb.pick('here:close'), true); assert.equal(Lb.state().here, false);
  assert.deepEqual(calls, []); assert.equal(JSON.stringify(save), per, 'nothing paid, nothing changed');
  Lb.pick('play'); assert.deepEqual(calls, ['day'], 'the gold door: the day, as before');
  assert.match(hereHTML29(null, JLM, t), /בין העבודות<small>המחשה/);
});
test('build 29 (C): every new target ≥ 44 px (the second door, "מיקום מדויק", the card\'s סגור); the start screen keeps its build-28 doors', () => {
  const lb = read('src/avodah/shift/lobby35.js');
  assert.match(LOCK29_CSS, /\.lb \.lb-here\{min-height:44px\}/); assert.match(lb, /\.lb \.lb-door\{pointer-events:auto;position:relative;display:flex;align-items:center;gap:8px;min-height:44px/);
  assert.match(lb, /\.lb \.lb-pkx\{margin-top:8px;min-height:44px/); assert.match(read('src/avodah/shift/prefs28.js'), /\.p28\{min-height:44px;min-width:44px/);
  const h = createLobby({ save: {}, start: true, now: () => Date.parse('2026-10-22T12:30:00+03:00'), where: () => JLM }).html();
  for (const k of ['play', 'games', 'home', 'full', 'here', 'loc']) assert.match(h, new RegExp(`data-lb="${k}"`)); assert.match(h, /data-p28="mute"/);
  assert.ok(!/משמרת|סיור/.test(h), 'build 28: no משמרת / סיור');
});
test('build 29: calendar.js — the time zone is optional (Jerusalem by default, every old call the same); the day-number helpers', () => {
  const d = new Date('2026-10-22T23:30:00-04:00');   // (already 23.10 in Jerusalem)
  assert.deepEqual(sunTimes(d, TEMPLE_MOUNT), sunTimes(d, TEMPLE_MOUNT, 'Asia/Jerusalem'));
  assert.equal(civilDay(d) - civilDay(d, 'America/New_York'), 1);
  assert.deepEqual(templeSchedule(d).map((e) => e.id), templeSchedule(d, TEMPLE_MOUNT, 'Asia/Jerusalem').map((e) => e.id));
  assert.equal(+sunOnDay(civilDay(d), TEMPLE_MOUNT).sunset, +sunTimes(d).sunset);
  assert.equal(JERUSALEM29.lat, TEMPLE_MOUNT.lat);
});

// ───────── the Divine Name: never, in any file this build touched (by code points) ─────────
test('build 29: no Divine Name in the changed files (by code points; spaced, hyphenated or pointed forms too)', () => {
  const N = [[0x5d9, 0x5d4, 0x5d5, 0x5d4], [0x5d0, 0x5dc, 0x5d4, 0x5d9, 0x5dd], [0x5d0, 0x5d3, 0x5e0, 0x5d9], [0x5d0, 0x5dc, 0x5d5, 0x5d4, 0x5d9, 0x5e0, 0x5d5]];
  const sep = '[\\u0591-\\u05C7\\s\\-\\u05BE\\u05F3\\u05F4\'".]*';
  const res = N.map((c) => new RegExp(c.map((x) => String.fromCharCode(x)).join(sep)));
  const files = ['src/calendar.js', 'src/avodah/shift/time29.js', 'src/avodah/shift/lock29.js', 'src/avodah/shift/lobby35.js', 'src/avodah/shift/prefs28.js', 'src/avodah/shift/hud.js', 'src/avodah/shift/index.js', 'src/avodah/index.js', 'test/build29.test.mjs', 'PROJECT.md'];
  const hits = []; for (const f of files) { const s = read(f); res.forEach((r, i) => { const m = s.match(r); if (m) hits.push(`${f}: name ${i} at ${m.index}`); }); }
  assert.deepEqual(hits, []);
  // and the screens' words: every verse and line the lock and the lobby can show
  const words = [...Object.values(VERSE29).flat(), NIGHT29.text, NIGHT29.quote, ...SOON29].join(' ');
  for (const r of res) assert.ok(!r.test(words));
});
