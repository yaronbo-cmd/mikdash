// Pure parts of the Phase B mini-games. Run: node --test test/avodah-games.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify, pilgrimOfferings } from '../src/avodah/minigames/korbanot.js';
import { korban, CARRIERS, ROLES, GAMES, SHACHAR, EREV } from '../src/avodah/data.js';

test('pilgrims: the routing answers derive from korbanot.json (Zevachim 5)', () => {
  assert.deepEqual(classify(korban('olah')), { place: 'north', blood: 'two', eat: 'none', time: null });
  assert.deepEqual(classify(korban('chatat')), { place: 'north', blood: 'four', eat: 'kohanim', time: 'day-night' });
  assert.deepEqual(classify(korban('asham')), { place: 'north', blood: 'two', eat: 'kohanim', time: 'day-night' });
  assert.deepEqual(classify(korban('todah')), { place: 'any', blood: 'two', eat: 'all', time: 'day-night' });
  assert.deepEqual(classify(korban('shelamim')), { place: 'any', blood: 'two', eat: 'all', time: 'two-days' });
  assert.deepEqual(classify(korban('bechor')), { place: 'any', blood: 'one', eat: 'kohanim-city', time: 'two-days' });
  assert.deepEqual(classify(korban('maaser')), { place: 'any', blood: 'one', eat: 'all', time: 'two-days' });
});

test('pilgrims bring private offerings only (no Yom Kippur, burnt bulls, Pesach, public, bird or meal offerings)', () => {
  const ids = pilgrimOfferings().map((k) => k.id).sort();
  assert.deepEqual(ids, ['asham', 'bechor', 'chatat', 'eil_nazir', 'maaser', 'olah', 'shelamim', 'todah']);
});

test('the nine carriers (Tamid 4:3) map to the nine portion roles of the second lottery', () => {
  assert.equal(CARRIERS.length, 9);
  CARRIERS.forEach((c, i) => assert.equal(c.role, ROLES[4 + i].id));
  assert.equal(ROLES.filter((r) => r.limb).length, 9);
});

test('chains: the morning has 14 games, the afternoon omits the lotteries, the ashes and the pyres', () => {
  assert.equal(SHACHAR.length, 17);   // (wave 12: + chavitin, shaarim, kelim)
  for (const g of ['payis1', 'payis2', 'payis3', 'deshen', 'maaracha']) assert.ok(!EREV.includes(g));
  for (const g of [...SHACHAR, ...EREV]) assert.ok(GAMES[g], g);
});

// ── wave 4: the Avodah gaps (content/avodah_gaps.json) and the garments (content/garments.json) through data.js ──
import { GAPS, gap, gapLine, gapGame, GARMENTS, GARMENT_ITEMS, cardsFor, card, hasDivineName, CHECK_HE } from '../src/avodah/data.js';

test('gaps: read tolerantly; each shown item is a draft with a source; needs_check → "בבדיקה"', () => {
  for (const id of ['payis_method', 'shir_perakim', 'trumpets_count', 'shir_musaf_days', 'shir_shabbat_musaf_mincha', 'shir_afternoon', 'kiddush_posture', 'shoevah_when_where', 'erev_eleven', 'aravot_timing']) {
    const g = gap(id);
    assert.ok(g, id);
    assert.ok(g.source && g.status === 'draft', id);
    const c = card(g);
    assert.equal(c.draft, true, id);
    assert.equal(c.needsCheck, !!g.needs_check, id);
    assert.equal(c.source.includes(CHECK_HE), false, id);   // the "בבדיקה" chip is drawn by ui.js cardHTML from c.needsCheck, not glued to the source
  }
  assert.equal(gap('nope'), null);
  assert.equal(gapLine('nope'), null);
  assert.equal(gapGame('nope', 'x', 7), 7);
  assert.equal(gapGame('shir_perakim', 'perakim', 0), 3);
  assert.equal(gapGame('trumpets_count', 'min', 0), 21);
  // the games' cards carry them (the lottery, the kiddush, the song, the musaf days, the afternoon, the aravot, Sukkah 5:2)
  const ids = (g) => cardsFor(g).map((c) => c.id);
  assert.ok(ids('payis1').includes('payis_method'));
  assert.ok(ids('kiddush').includes('kiddush_posture'));
  assert.ok(ids('shir').includes('shir_perakim') && ids('shir').includes('trumpets_count'));
  assert.ok(ids('musaf').includes('shir_musaf_days') && ids('musaf').includes('shir_shabbat_musaf_mincha'));
  assert.ok(ids('erev').includes('shir_afternoon') && ids('erev').includes('erev_eleven'));
  assert.ok(ids('shoevah').includes('shoevah_when_where'));
  assert.ok(ids('aravot').includes('aravot_timing'));
  // a view by its label; the Bavli has no nikud (quote), the Mishnah and the Rambam do (quote_nikud)
  const r = gapLine('payis_method', 'הרמב״ם — איך סופרים');
  assert.ok(r && /רמב״ם/.test(r.source) && r.quote.length > 20);
  assert.equal(hasDivineName(JSON.stringify(GAPS)), false);
});

test('garments: the eight in the Mishnah\'s order (Yoma 7:5) — four of every kohen, four more of the Kohen Gadol', () => {
  assert.equal(GARMENTS.length, 8);
  assert.deepEqual(GARMENTS.map((g) => g.gadol), [false, false, false, false, true, true, true, true]);
  assert.ok(GARMENTS.every((g) => g.id && g.he && g.source && g.status === 'draft'));
  assert.ok(GARMENT_ITEMS.length >= 1 && GARMENT_ITEMS.every((g) => g.name_he && g.status));
  assert.equal(hasDivineName(JSON.stringify(GARMENT_ITEMS)), false);
});

test('fallback cards: in the content files now — no "waiting for the content agent" note', () => {
  const c = cardsFor('payis1').find((x) => x.id === 'payis_fingers');
  assert.ok(c && c.fromFallbacks && !c.fallback);
});

// ── wave 4: a tap on a lamb in its chamber → world.avodah.lambsChamber.pick(ray) (world.js pickLamb builds the ray itself) ──
import * as THREE from 'three';
import { guardWorld } from '../src/avodah/world.js';

test('pickLamb: the ray from the camera through a tap hits the lamb drawn there (three.js camera, the world\'s pick)', () => {
  const g = globalThis;
  const saved = [g.innerWidth, g.innerHeight];
  g.innerWidth = 390; g.innerHeight = 844;
  try {
    const cam = new THREE.PerspectiveCamera(32, 390 / 844, 0.5, 5000);
    cam.position.set(-155, 30, -45); cam.lookAt(-172, 17, -62); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    const lambs = [[-175, 16, -64], [-172, 16, -64], [-169, 16, -64], [-175, 16, -60], [-172, 16, -60], [-169, 16, -60]];
    const sph = new THREE.Sphere(), hit = new THREE.Vector3();
    // the world's pick as avodah3d.js has it: a sphere round each lamb's body, the nearest hit wins
    const pick = (ray) => { const r = ray && ray.ray ? ray.ray : ray; let best = -1, bd = Infinity; lambs.forEach(([x, y, z], i) => { sph.center.set(x, y + 1.15, z); sph.radius = 1; if (r.intersectSphere(sph, hit)) { const d = hit.distanceTo(r.origin); if (d < bd) { bd = d; best = i; } } }); return best; };
    const W = guardWorld({ camera: cam, avodah: { lambsChamber: { pick, positions: () => lambs.map(([x, y, z], i) => ({ i, x, y, z, yaw: 0 })) } } });
    lambs.forEach(([x, y, z], i) => {
      const v = new THREE.Vector3(x, y + 1.15, z).project(cam);
      assert.equal(W.pickLamb((v.x * 0.5 + 0.5) * 390, (-v.y * 0.5 + 0.5) * 844), i);
    });
    assert.equal(W.pickLamb(5, 5), -1);                       // the sky: no lamb
    assert.equal(W.lambs().length, 6);
    assert.equal(guardWorld({}).pickLamb(10, 10), -1);        // no world: nothing, no throw
  } finally { [g.innerWidth, g.innerHeight] = saved; }
});

/* ── wave 12 (AVODA12): the Levites' song every day, the day in detail ── */
import * as D12 from '../src/avodah/data.js';
import { dayInfo } from '../src/calendar.js';
import { musafSong } from '../src/avodah/minigames/shir.js';
import { MINIGAMES } from '../src/avodah/minigames/index.js';

test('wave 12: the chalil before the altar only on its twelve days (Arachin 2:3)', () => {
  const on = (iso) => D12.chalilToday(dayInfo(new Date(iso + 'T10:00:00+03:00')));
  assert.equal(on('2026-09-29'), true, '18 Tishrei, Chol HaMoed Sukkot');
  assert.equal(on('2026-10-03'), true, '22 Tishrei, Shemini Atzeret ("שמונת ימי החג")');
  assert.equal(on('2026-10-06'), false, '25 Tishrei, a weekday');
  assert.equal(D12.chalilToday({ holiday: { id: 'pesach', day: 1 } }), true);
  assert.equal(D12.chalilToday({ holiday: { id: 'pesach', day: 2 } }), false);
  assert.equal(D12.chalilToday({ holiday: { id: 'shavuot', day: 1 } }), true);
  assert.equal(D12.chalilToday(null), false);
});

test('wave 12: why each day\'s psalm (RH 31a), Haazinu\'s six parts by Shabbat, the musaf\'s song', () => {
  for (let d = 0; d < 7; d++) assert.ok(D12.shirWhy(d).length > 8, String(d));
  assert.equal(D12.shirWhy(6), 'ליום שכולו שבת');
  assert.match(D12.shirWhy(0), /שקנה והקנה/);
  assert.equal(D12.haazinuPart('2025-09-27').n, 1);
  assert.equal(D12.haazinuPart('2025-10-04').n, 2);
  assert.equal(D12.haazinuPart('2025-11-08').n, 1, 'six Shabbatot later: again the first');
  assert.equal(D12.haazinuPart('2025-09-27').he, 'האזינו');
  const shabbat = { info: { isShabbat: true, weekday: 6 }, sukkot: null };
  assert.equal(musafSong(shabbat, '2026-10-10').kind, 'haazinu');
  const cholHaMoed = { info: { isShabbat: false, weekday: 1 }, sukkot: { day: 3 } };
  const m = musafSong(cholHaMoed, '2026-09-28');
  assert.equal(m.kind, 'sukkot'); assert.match(m.title, /ולרשע אמר אלקים/); assert.equal(m.check, true);
  assert.equal(musafSong({ info: { isShabbat: false, isRoshChodesh: true, weekday: 3 }, sukkot: null }, '2026-10-12'), null, 'Rosh Chodesh: no song known');
});

test('wave 12: the new moments are games with sourced draft cards; the chains place them; no Divine Name', () => {
  for (const g of D12.DETAIL) {
    assert.ok(MINIGAMES[g] && typeof MINIGAMES[g].play === 'function', g);
    const cs = D12.cardsFor(g);
    assert.ok(cs.length >= 1, g);
    for (const c of cs) { assert.equal(c.draft, true, c.id); assert.ok(c.source, c.id); assert.ok(c.quote, c.id); }
  }
  assert.deepEqual(D12.SHACHAR.slice(1, 4), ['kiddush', 'chavitin', 'deshen'], 'the chavitin makers after the patrol (Tamid 1:3)');
  assert.ok(D12.SHACHAR.indexOf('kelim') === D12.SHACHAR.indexOf('taleh') - 1, 'the 93 vessels before the lamb is watered (Tamid 3:4)');
  assert.deepEqual(D12.EREV.slice(-3), ['shir', 'machar', 'neilah']);
  assert.equal(D12.hasDivineName(JSON.stringify(D12.DAY)), false);
  for (const id of Object.keys(D12.DAY)) assert.ok(D12.DAY[id].source && D12.DAY[id].status === 'draft', id);
});
