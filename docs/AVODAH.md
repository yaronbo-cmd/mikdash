# Phase B — "העבודה בבית" (the service in the House): design and implementation

**Status:** DRAFT v1 (Sprint 2, night of 2026-09-25), wave 4 (2026-09-26 night, branch `s5-avodah`: see §0).
**Nothing here is approved.** Every content card carries a visible **טיוטה** tag; owner decisions are marked **⚑**.
Companion: `docs/AVODAH-he.md` (short Hebrew summary for the owner). Code: `src/avodah/`.

---

## 0.13 Wave 13 (30 Sep 2026, SERVICE13): פיטום הקטורת, and the pens and the lambs' chamber
The owner (30.9): "קטורת - פיטום הקטרת, עדיין לדעתי לא נכנס למשחק" · "צריך לנהל את הדירים והאורוות מסביב לבית" (a first slice).
Reached from the home's box **"בית אבטינס והדיר"** (`ui.js svcHTML`: the store, tomorrow's need, the chamber; two buttons), the
practice grid and ספר העבודה's "ועוד מעבודות היום"; directly `#avodah=pitum`, `#avodah=dir`.

**`minigames/pitum.js` — at Beit Avtinas** (`AVTINAS_SHOT`, the kohen walks to the Water Gate; שקלים ה, א).
1. Weigh the eleven in the baraita's order on a balance: the weight stone (70 · 16 · 12 · 3 · 9; a group's stone stays for its
   four) — a wrong stone quotes the group's words (`data.SPICE_WORDS`, כריתות ו ע״א) — then hold "שפוך" until the green line
   (±10 %); the jar stops at 130 %; "הסר מעט" takes 7 % and settles in the zone. The honey jar: "ואם נתן בה דבש פסלה".
2. Grind: "הדק · היטב · היטב · הדק" come to the line at `PITUM_BPM` 80; a tap on the line strikes (a lyre note, the word
   floats); off-beat still pounds (hint only). 16 words, 8 on a repeat.
3. A pinch of "מעלה עשן" (Keritot 6a) and an illustrated inset: Beit Avtinas' smoke "מתמר ועולה כמקל", the others' "מפציע
   לכאן ולכאן" (Yoma 38a). The galbanum's lesson (Keritot 6b) is cited when it is weighed.
4. The store: +368 (365 + 3). `r.pitum` → `index.js` → `state.pitumAdd` (`A.pitum.half`, half-manim, ≤ 736). The morning
   `ketoret` and the evening `neirot` take ½ each, once a day (`state.pitumUse` → `{ used, fromStore }`); an empty store
   never stops them (the Temple's own), and the home only invites (below 30 manim).

**`minigames/dir.js` — the pens and the lambs' chamber.** Hold the jar/button to fill the trough, tap three hay bundles (the 3D
flock walks to the troughs and the hay: `pens.tend('water' | 'hay')`, pens.js → avodah3d.js); tomorrow's need (`data.needOf(info)`:
the Tamid's 2 lambs + `musafOf`; `needHe`) over the hills; tomorrow's musaf bulls, rams and goats led out one tap each to "למחר"
(Sukkot 13 → 7; skipped when there are none or more than 18; the musaf's lambs "the other kohanim bring"); three new lambs (seeded by the
day: none, a not-a-blemish, a blemish — `BLEMISHES`), each looked at in four places (ear, eye, nose, lip; ≥ 44 px), judged; the
unblemished go in (4 → 6; `lambsChamber.count(6)`). Shabbat / Yom Tov: water, hay, count the six (Arachin 2:5). `r.dir` →
`state.dirTend` (adds only).

**Verified on Sefaria, 30.9** (Bavli: Wikisource/Vilna; Mishnah: Torat Emet; Yerushalmi: Guggenheimer): Keritot 6a (the
eleven and their weights; שס״ח/שס״ה/שלשה מנין יתירין; the honey), Keritot 6b (פרס בשחרית ופרס בין הערבים; the mortar twice a
year; "הדק היטב היטב הדק" — Abba Yossi ben Yochanan; "כשם שהדיבור רע ליין כן הדיבור יפה לבשמים"), Y. Yoma 4:5 ("שהקול יפה
לבשמים"), Shekalim 5:1, Middot 1:6, Tamid 3:3, Arachin 2:5 (incl. "ומוסיפין עד לעולם"). **Correction to the brief:** "מפני
שהקול יפה לבשמים" is the siddur's wording, not the Bavli's.

**Bundle:** ketoret.json, kiyor.json and mysteries.json were each bundled twice (scenes imported them without `with { type:
'json' }`, a separate module to esbuild); now once (−16.7 KB). **Tests:** `test/avodah-pitum.test.mjs` (7: the eleven, the store, the
need 13 → 7), `test/avodah-pitum-play.test.mjs` (6: both games played through by their solvers over `test/avodah-dom-shim.mjs`, a
small DOM shim — no browser), harness part `13`, `test/avodah-touch-w13.cjs` (real touch, 390×844, on **dist/test.html**: dist/temple3d.html
is the artifact's fragment with no viewport meta, so under a phone's emulation it is laid out 980 px wide — the desktop panel — and
touches at an element's rect land elsewhere). **The home's 20-s refresh** kept throwing the player to the top of the panel
(`renderHome` set scrollTop 0): it keeps the scroll now (`renderHome(true)` from `tick`).

## 0.12 Wave 12 (29 Sep 2026, AVODA12): the Levites' song every day, the day in detail, N69
The owner (29.9): "הלויים שיר של יום בכל יום" · "בגדול בשלב ב' של פעולות היום נצטרך לתת יותר פירוט". New content:
`content/avodah_day.json` (12 drafts, each with its exact source; read by `data.js DAY / dayItem / dayLine`).

**The song of the day (`minigames/shir.js`).**
- The wine is given → the two kohanim at the table of fats blow tekiah–teruah–tekiah (`W.av('trumpets')`, Tamid 7:3).
- **The player strikes the cymbal**: the kohen bends to pour, the sgan waves the cloths after 0.9–1.8 s, and the tap on "צלצל!"
  (`[data-k="tziltzal"]`) starts the Levites — "והקיש בן ארזא בצלצל, ודברו הלוים בשיר". An early tap only waits ("עוד לא");
  within 1.2 s of the wave is "בדיוק בזמן!"; after 7 s Ben Arza strikes by himself (never stuck). ⚑ the player in Ben Arza's place.
- **The duchan**: twelve Levites (Arachin 2:6) drawn with their instruments (`art.js levite(…, kind)`): kinorot, two nevalim, Ben
  Arza's tziltzal in the middle, and **on the chalil's twelve days** (Arachin 2:3: the first day of Pesach, Shavuot, the eight days
  of the Chag — `data.chalilToday(info)`) two chalilim. The same in 3D: `avodah3d.levites(true, { chalil })` gives two Levites the
  `halil`. A line names them (`.av-shir-kelim`).
- **Today's psalm with its source** (`.av-shir-psalm`: the day, the Mishnah's words, `תמיד ז, ד`), and **one true line per פרק**
  (`.av-shir-perek` + the cited quote): 1 — today's words (Tamid 7:4); 2 — **why this psalm today** (RH 31a, verified on Sefaria
  29.9: "על שם שקנה והקנה ושליט בעולמו" … "ליום שכולו שבת"; `data.shirWhy(weekday)`); 3 — the chalil's days, or the ma'amad
  ("עמדו כהנים לעבודתכם ולוים לדוכנכם וישראל למעמדכם", Yoma 20b). On a repeat, the one פרק shows the why.
- **The musaf's song** (the musaf segment now plays `shir` after the count): on Shabbat **Haazinu**, one of its six parts
  (RH 31a "הזי״ו ל״ך", Rashi's openings; ⚑ which part: a six-Shabbat cycle counted from Shabbat 5 Tishrei 5786 —
  `data.haazinuPart(day)`); on Chol HaMoed Sukkot the day's psalm (Sukkah 55a, בבדיקה); Rosh Chodesh none.
- **The music** (agreed with WORLD12 on the bus): Phase B events through `ctx.emit` → main.js → `music.event(type, d, 'B')`:
  `shirBlast {n:0, kind:'ttt'}` (the wine given) · `shirStart {day, psalm, chalil, perakim, bpm, musaf?, part?, segment}` (the
  cymbal) · `shirBlast {n, kind}` (each blast the player blows) · `shirEnd` (the end, or a skip). The lane runs one note a beat at
  `SHIR_BPM` (92).

**Five new moments of the day (`minigames/day.js`)**, from the owner's table (the daily rows marked part/no), each with its
sourced draft card, each walking the kohen to its place (`W.kohen('player').walkTo`); no step of the 40 changes:
| id | where in the day | what you do | sources | rows |
|---|---|---|---|---|
| `chavitin` | morning, after the patrol ("העמידו עושי חבתים לעשות חבתים") · evening, before the wine | fry twelve cakes one at a time, take each off "בין בשל ונא" (a doneness bar); four by hand, the makers do the rest; tap each cake to split it: half to "בבוקר", half to "בערב" · in the evening: hold to carry the kept half up | Rambam, Maaseh HaKorbanot 13:2–4 (Sefaria, 29.9); Tamid 1:3; Menachot 4:5 | a006 a036 a056 |
| `shaarim` | at first light, after barkai (⚑ placement) | tekiah (hold) · teruah (three taps) · tekiah — Nikanor's leaves open with each blast | Sukkah 5:5; Middot 1:4 | a017 |
| `kelim` | before the lamb is watered | tap the shelves of silver and gold: the vessels fly to the table, the count runs to 93 | Tamid 3:4 (⚑ which vessels: illustration) | a016 |
| `machar` | evening, after the song | three new lambs: check each (its ear in close-up) and judge — the ear's skin scratched is **not** a blemish, its cartilage notched is; two go in, six checked stay (`lambsChamber.count(6)`) | Tamid 3:4 "מבקר מבערב"; Arachin 2:5; Bekhorot 6:1 | a057 |
| `neilah` | evening, the last | on the azara's plan, close its seven gates (names from Middot 1:4–5), give the keys to the elders in Beit HaMoked; night falls and the altar's fire burns on | Shekalim 5:1 "בן גבר על נעילת שערים"; Tamid 1:1; Lev. 6:6 | a058 a061 |
The morning chain is now 17 games (`SHACHAR`), the afternoon chain 8 (`EREV`: erev, zerika, evarim, neirot, chavitin, shir,
machar, neilah). `data.DETAIL` lists the new ids.

**The song every day, on the home too.** The day panel has a box `.av-shirday`: today's psalm with its source, why today (RH
31a), the chalil on its days, on Shabbat the musaf's Haazinu part (⚑), and "לשיר עם הלויים" (plays `shir`); the "מחר" line names
tomorrow's psalm (hooks `tomorrowHe`). ספר העבודה ends with "ועוד מעבודות היום": the five new moments with their sources, a tap
plays one. The evening's two (machar, neilah) also have practice tiles.

**N69.** A name he chose in Phase A is never asked again: `ui.namePick({ name })` greets "שלום, הכהן <name>!" and asks only the
mishmar (a save with a name and no mishmar); the first-visit intro says "שלום, הכהן <name> — ברוך הבא לעבודה". A Phase A save with
both skips the card, as before. `state.adoptPhaseA`: the Phase A name now wins over an older Phase B pick (a player who peeked
into Phase B before naming his kohen); an empty Phase A name never erases his. The button's words "יאללה לעבודה" stay (⚑ owner).

**Tests.** `node --test test/avodah-games.test.mjs` (+3: the chalil's days, RH 31a / Haazinu / the musaf's song, the new moments'
cards and places) · the harness (§6c: N69, the song on Chol HaMoed and on a plain Tuesday, the five moments, the events) ·
`test/avodah-touch-w12.cjs` — the real build by CDP touch at 390×844 (N69, the song, the five moments; shots
`test/out/avodah/w12-touch-*.png`).

---

## 0. Wave 4 (26 Sep 2026, motzaei Shabbat): what changed

**On the world's new APIs (docs/SCENES.md §4), all guarded — `world = {}`, no `project()` and a broken world still play the
illustrated cards.**
- **The lamb is chosen in 3D** (`taleh.js`): a ring over each of the six lambs in their stalls (`lambsChamber.positions()`
  through `world.js lambs()`); a tap on a lamb itself is picked by the world (`lambsChamber.pick(ray)` through
  `world.js pickLamb(x, y)`: a ray from the camera through the tap, built without importing three.js); the chosen one is
  taken by index (`animal('lamb', 'lambsChamber', { tamid: true, index })`). The gold cup and the ear, eyelid, nose and lip
  rings are anchored on the head **as the lamb draws it** (`animal.partPosition(part, side)` through the handle's `part()`)
  and follow it (`interact3d` targets take `at` as a function). The world's camera keeps ≥ 35 amot from what it looks at
  (main.js `controls.minDistance`), where a lamb's head is a few pixels, so the four rings **fan out round the head on the
  screen's plane**, each on the side of its part (the nose ahead — by the lamb's `facing` — the lip ahead and below, the
  eyelid ahead and above, the ear behind and above; each bent toward where `partPosition` draws its part), 2.7 amot out (≈ 90
  px, rings ≥ 50 px apart), like the Menorah's lamps (`spreadLamps`). The six lambs are
  framed from the open court (`T3.fit(ms, { pts, dir })`, new). The lamb stands calm.
- **The Heichal** (`heichal.js`): the gate, the golden altar's top, the Menorah stone (top step, and the second step for the
  kuz) from `sanctuary.anchor(…)`; the lamps from `lampPosition` (`world.js lampsWestToEast`). **⚑ The wicket route** behind a
  flag (`HEICHAL_OPTS.wicket` or `window.__AV_WICKET`; the harness `wicket=1`): in by the northern wicket and the cell
  (`enter('heichal', { via: 'wicket' })`, Tamid 3:7), then, inside and facing the shut gate (`focus('heichal-gate')`), the
  player opens it from within (the ring at `anchor('gate-in')`). The default is unchanged: the gate held open from the Ulam.
- **The showbread and the lamps**: the Shulchan's ends from `anchor('shulchan-east' | 'shulchan-west')`; the lamps from
  `lampPosition`; the lamp left burning for the evening follows `state.menorahAxis` in the stage too (it was always index 5).
- `world.js`: `kohen.walkTo(p, { speed, maxSec: 11 })`; `interact3d.focus` waits 2.5 s past the motion (was 6 s).
- QA **P2-3**: the ring labels sit on a solid dark backing (cream on rgba(34,24,10,.86): ≥ 8:1 over any stone).

**The hooks agent's requests (docs/HOOKS.md §13).** Every game gets `gctx.repeat` and `gctx.tier`:
- repeats (`api.repeat` = played before, ever or in the session): a short intro (`def.introAgain`, all 19 game files), walk-ins
  capped at 1.5 s, **the song plays one פרק of the three** (the card says so), **the lotteries count faster** (×0.6);
- from the tier **בקי** (`api.tier ≥ 3`): **taleh** — three lambs (the third clean or blemished), fainter marks, and a mark shows
  its detail only at a second, closer look; **zerika** — the corners and the red line without guide labels; **evarim** — the
  row from memory (a wrong carrier is not told who is next); **payis** — faster counts (×0.45);
- `data.js` exposes the garments: `GARMENTS` (the eight in the order of Yoma 7:5, `gadol` for the four the Kohen Gadol adds),
  `GARMENT_ITEMS` (the eight items of garments.json), `garmentItem(id)`.

**The verified gaps (content/avodah_gaps.json, CONTENT-S3 §5)** — `data.js GAPS / gap(id) / gapLine(id, view) / gapGame(id, key,
d)`, tolerant of missing fields; each shows with **טיוטה** and its source, and **בבדיקה** when needs_check (in the game:
`api.cite(line)`; on the cards: `card()` adds "· בבדיקה" to the source line until the HUD draws its own chip):
| where | what |
|---|---|
| payis (1–3) | **the count as the sources tell it**: the memuneh takes the mitznefet off one kohen's head — the count starts from him (Yoma 25a) — names a round number far above the kohanim (60 for the player's own lots, "או ששים", Bartenura; 24/30/36 for the others') and counts the fingers round the circle until it ends at the winner's finger (Rambam, Temidin uMusafin 4:3 — cited in the game). The lot is still the day's seeded one: the game seats the mitznefet so that the number ends there. |
| kiddush | **hands and feet together**, as Zevachim 19b: two thumbs, the right hand on the right foot and the left on the left, held together while the water runs (it was hands, then feet). |
| shir | the three פרקים (Rashi, Sukkah 53b), the 21 blasts of the day (Sukkah 5:5); in the afternoon, that the Levites sang then too (the Rambam, ⚑ which psalm: בבדיקה); "לתמיד של בין הערביים" in the afternoon (was always "של שחר"). |
| musaf | the Levites' musaf song: on Chol HaMoed Sukkot the day's psalm (Sukkah 55a, בבדיקה); on Shabbat a sixth of Haazinu (Rosh Hashanah 31a); Rosh Chodesh — none (not stated in the Talmud). |
| erev | the afternoon's eleven kohanim (Yoma 2:5). |
| shoevah | Sukkah 5:2 — "במוצאי יום טוב הראשון של חג, ירדו לעזרת נשים". |
| aravot | the aravot eleven amot high (Sukkah 45a); the hour of the circling: ⚑ בבדיקה. |
The fallback cards (avodah_fallbacks.json) no longer show "waiting for the content agent": they are in the content files.

**QA P2-6 — frames that looked at nothing** (each shot from places.js constants):
- after the zerika: the old yesod ring stood under the kevesh (x −38) and `fit()` then flew in close and steep (paving, a
  headless kohen). The remnants go on **the southern yesod, which runs only one amah into the south side from the west**
  (Middot 3:1): the ring is by the SW corner, framed from the south-west, and the card keeps the altar's south-west quarter;
- evarim: the row is ordered over `SHOTS.keveshWide` (the altar and the ramp); the close kevesh shot only for the places;
- barkai: from the roof of the house, east over the courts to the Mount of Olives (was: south-east into the haze);
- the payis: the Chamber of Hewn Stone seen whole from the azara's east end, beside the Ulam's steps (was: its outer wall's
  window slits).

**Checked in the real build (phone 390×844, SwiftShader)** — `test/integration-s2.cjs phone` **10/10** (the whole morning over
the real world, no page errors, and — new — **no world call timed out**): `test/out/integration/phone-05-payis2.png` (the Gazit
and the Ulam's steps), `-06-barkai.png` (the Mount of Olives and the sky), `-07-taleh.png` (six rings over the six lambs, the
docked card), `-08-heichal.png` (the gate's ring on its dark label), `-09-zerika-after.png` (the altar's SW corner, the red line,
the fire and the silver bowls), `-10-evarim.png`, `-12-ketoret.png`, `-14-shir.png` (the labelled bowls) — run twice, 10/10
both times, the second on the committed code. `test/avodah-shots-w4.cjs`: `test/out/avodah/w4-phone-evarim.png` (the altar's
top from the ramp: the tapuach, the fire and a kohen), `w4-phone-taleh-choose.png` and
`w4-phone-taleh-close.png` (the six rings; the four fanned round the chosen lamb, by torchlight), `w4-phone-heichal-wicket.png` (⚑
inside the Heichal before the shut gate, "החזק — פתח מבפנים"). One test artefact: with the render loop paused, a camera flight
lands only at the next render, so a 3D layer whose rings wait for a flight may retire to the illustrated card if the shot comes
more than ~5 s later (seen in the first taleh shots; real play runs the flight in ~1 s). `interact3d` now restarts its
out-of-reach count after a stall of the main thread (> 0.4 s: a heavy frame, a shader compile, a slow renderer), so neither a
test render nor a hitch on a phone retires a 3D step.

---

## 1. What the player does

You are a young kohen of your *mishmar* (the name and mishmar come from the Phase A save when it exists; otherwise a
10-second pick). The Temple runs by the **real Jerusalem clock and the Hebrew calendar** (`src/calendar.js`).

**Two ways to play — nobody is ever locked out**

| mode | what | reward |
|---|---|---|
| **LIVE** — "מה קורה עכשיו במקדש" | The top bar always says what the Temple is doing now and what comes next ("התמיד של שחר בעוד 2:32", "ברקאי מחר ב-05:36"). When a segment is live (the morning Tamid, the musaf, the pilgrims, the afternoon Tamid, Simchat Beit HaShoevah), **הצטרף עכשיו** joins it **where the Temple is now** (calendar.js's current event → the matching mini-game: at 06:50 on a weekday you join at the wine and the song; the earlier steps stay open in practice). | every step gets the **נכחת בזמן** mark, +5 points, and the day is saved in the live log |
| **PRACTICE** — "לימוד" | Any segment or any single mini-game, at any hour, from the home panel. | fills **ספר העבודה** (the 40 steps of the day) |

**The day's lots (fair by design).** The first time a player plays on a Jerusalem day, the lots are drawn — seeded by
player id + day, so they are deterministic and cannot be re-rolled (`state.lotsFor`):
- **first lottery** (terumat hadeshen): won about one day in four;
- **second lottery** — the player's **role** for the day, one of the 13 roles of Tamid 3:1. Each player has his own
  permutation of the 13; **13 consecutive days give all 13 roles** with no repeat;
- **third lottery, "חדשים לקטורת"** (Tamid 5:2): only while he has never offered the ketoret. A new kohen wins one day in
  three and **surely on his third try**. Once he offers it, he is never "new" again — "מעולם לא שנה אדם בה" (Yoma 26a).
  The legendary, once-in-a-lifetime moment, with a collectible;
- **fourth lottery** (limbs to the altar, new and old together): one day in two.

The role decides which mini-game is **עבודה בפועל** (for real: +10 points, the role counts toward the 13); the player still
plays, watches and learns every other step. The home shows **הפייס של היום** (today's role) once it is drawn.

**The home is a live window.** While the home is open, the 3D camera goes to what the Temple is doing now (each
calendar event has a place: the altar burning the limbs at night, the kevesh at the lifting of the ashes, the Gazit at the
lottery, the slaughter area, the Heichal door, the Ulam steps, Ezrat Nashim on Beit HaShoevah nights), under the real
Jerusalem sky (`schedule.skyOf`: night · dawn · noon · dusk from the sun times). It changes only when the event or the sky
changes.

**First visit:** the name + mishmar pick (skipped with a Phase A save), then a four-line intro (the real clock, live vs
practice, the daily payis, no punishment). The path tab shows the Phase A trained priests as the player's beit av.

## 2. The morning service: 14 short mini-games in the Mishnah's order

Each is 20–60 s, teaches one true detail, never punishes (a mistake shows a gentle, sourced hint and play goes on at
once; "דלג" always completes), and is followed by a source card (tamid.json step + verified fallbacks), draft-tagged.

| # | game (file) | what you do | the detail it teaches | steps it fills |
|---|---|---|---|---|
| 1 | **הפיס הראשון** `payis.js` | stand in the circle, raise 1 or 2 fingers (the thumb button is a trap), watch the memuneh count fingers | "אחת או שתים, ואין מוציאין אגודל במקדש" (Yoma 2:1); count fingers, never people (Yoma 22b); why a lottery (Yoma 2:1–2) | night_watch, immersion, payis_1 |
| 2 | **שלום, הכל שלום — ואל הכיור** `kiddush.js` | two torch groups circle the azara; call "שלום, הכל שלום" when they meet; pick a free spigot of the kiyor; two thumbs — the right hand on the right foot, the left on the left — held together while the water runs (wave 4) | the patrol (Tamid 1:3); Ben Katin's 12 spigots (Yoma 3:10); "קדש ידיו ורגליו מן הכיור" (Tamid 1:4) | patrol |
| 3 | **תרומת הדשן** `deshen.js` | hold to climb the kevesh in the dark; push the coals aside; scoop only the inner, consumed coals; heap them east of the kevesh | no lamp, by the light of the pyre; "פנה את הגחלים הילך והילך, חתה מן המאוכלות הפנימיות"; east of the kevesh, 3 tefachim from it (Tamid 1:4) | terumat_hadeshen |
| 4 | **סידור המערכה** `maaracha.js` | sort the logs (fig, nut, pine-wood: yes; olive, vine: no), then pick only fine fig wood for the second pyre, light both | Tamid 2:3, 2:5 | clearing_altar, maarachah_gedolah, maarachah_ketoret |
| 5 | **הפיס השני** `payis.js` | 13 quick counts, one per role; yours is revealed with a fanfare | the 13 roles (Tamid 3:1); the circle in the Gazit (Yoma 25a) | payis_2 |
| 6 | **ברקאי!** `barkai.js` | watch the eastern sky; call "ברקאי!" when the east is lit as far as Hebron (early → "not yet") | Tamid 3:2 (Tanna Kamma: ברקאי; Mattiya ben Shmuel: "עד שבחברון… הין"). **Live:** the sky runs through today's real dawn with the Jerusalem clock | dawn_check |
| 7 | **הטלה** `taleh.js` | pick one of the six lambs (in 3D: in their stalls, wave 4); water it from the gold cup; inspect ear, eyelid, nose, lip by torchlight (the torch follows your finger); decide. Lamb 1 has a real blemish, lamb 2 a mark the Mishnah says is **not** a blemish | Tamid 3:3–4; six checked lambs (Arachin 2:5); Bekhorot 6:1, 6:2, 6:4 | lamb, to_slaughterhouse |
| 8 | **בהיכל** `heichal.js` | hold to open the great gate from inside; scoop the golden altar's ash handful by handful, then sweep; step on the 3-step stone, clean five lamps and leave the two eastern ones burning; put the kuz on the 2nd step | Tamid 3:6–9 | heichal_gate, dishun_inner_altar, hatavat_5 |
| 9 | **שחיטה, קבלה וזריקה** `zerika.js` | pick the ring (NW corner, second ring); a quiet cut-away "שָׁחַט הַשּׁוֹחֵט" (no animal is drawn); catch in the mizrak (timing); NE corner then SW, **below** the red line; the rest on the southern base | Tamid 4:1; Zevachim 5:4; Middot 3:1. PROJECT.md §2.9 | shechita, blood |
| 10 | **האברים** `evarim.js` | put the nine carriers in the Mishnah's order (your own portion is marked "שלך"); place on the lower western half of the kevesh; salt | Tamid 4:2–3 | hafshet, limbs_row, shema |
| 11 | **חדשים לקטורת** `payis.js` | the third lottery (only if you are new) and the fourth | Tamid 5:2; Yoma 26a | payis_3, payis_4 |
| 12 | **הקטורת** `ketoret.js` | throw the magrefa (the loudest sound in Jerusalem); clean the eastern lamp, leave the western; spread the coals with your finger; wait for "הַקְטֵר!", then hold to pour; the cloud fills the Heichal; bow and go out. Not your lot (live) → you withdraw at "הקטר" and watch | Tamid 5:6, 6:1–3; 3:8 | ketoret_machta, magrefa, ulam_steps, hatavat_2, machta_inner, ketoret, prostration_heichal |
| 13 | **ברכת כהנים** `birkat.js` | hold to raise the hands above the head and keep them there to the end; the first words appear, with ה׳ | Tamid 7:2; PROJECT.md §2.10 | birkat_kohanim |
| 14 | **נסכים ושיר של יום** `shir.js` | (Sukkot) "הגבה ידך!" and pour the water; hold to pour the wine; the sgan waves, Ben Arza strikes the cymbal; a rhythm game on TODAY's psalm (shir_shel_yom.json); at each פרק blow tekiah (hold) – teruah (3 taps) – tekiah, and the people bow | Tamid 7:3–4; Sukkah 4:9, 5:5; Arachin 2:5 | limbs_to_altar, mincha_chavitin, nesachim, shir, hishtachavaya |

Then the summary: "זֶה הוּא סֵדֶר הַתָּמִיד לַעֲבוֹדַת בֵּית אֱלֹקֵינוּ" (Tamid 7:3), the day's totals, a new ממונה met, the
streak, and the next appointment. The home button during a service stops it after the current step (no lock-in).

**Pacing** (normal speed, measured with the solvers — a perfect, instant player): payis1 4.7 s · kiddush 6.6 · deshen
4.9 · maaracha 1.9 · payis2 ≈ 10 (after shortening the other kohanim's counts; was 19.6) · barkai 4.7 · taleh 4.1 ·
heichal 5.2 · zerika 4.4 · evarim 1.7 · payis3 7.0 · ketoret 10.2 · birkat 6.7 · shir 32.7 (three פרקים). A person
reading, looking and erring takes roughly 3–5× as long: ~15–45 s a game, ~8–12 min for the whole morning with the cards.
The song has a combo (×n at the hit line; a sparkle every six).

## 3. The day goes on

| segment | game | notes |
|---|---|---|
| **קרבנות העולים לרגל** — the repeatable core loop | `korbanot.js` | 4 pilgrims per wave; for each: where it is slaughtered, how the blood is given, who eats it and where, until when. The right answers are **derived from korbanot.json fields** (`classify()`), so corrections to the content flow into the game. A wrong answer quotes the offering's own line and source. Offerings: chatat, olah, asham, todah, eil nazir, shelamim, bechor, maaser (not the Yom Kippur / burnt bulls, the Pesach, meal or bird offerings yet). |
| **מוסף היום** | `musaf.js` | order the day's musafim ("כל התדיר מחברו קודם", Zevachim 10:1), then count the animals per kind from calendar_offerings.json. A weekday practices Shabbat's. On Sukkot the bulls fall 13 → 7 (70 in all — a test checks the content sums to 70). |
| **התמיד של בין הערביים** (short chain) | `erev.js` + zerika, evarim, neirot, shir | tap when the sun reaches 8½ seasonal hours (Pesachim 5:1; live: today's clock times); slaughter at the north-east ring |
| **קטורת והדלקת הנרות** | `neirot.js` | take the flame from the western lamp (the one left burning in the morning) and light the rest; the night burning card |
| **שמחת בית השואבה** (Sukkot nights) | `shoevah.js` | light the golden menorot (four, as in the 3D scene: an illustration — the Mishnah gives no number), catch the torches of the dancing pious (Sukkah 5:4), and at "קרא הגבר" blow the trumpets. Live only on the nights calendar.js gives (not on Shabbat / Yom Tov nights). |
| **ערבות סביב המזבח** (Sukkot days) | `aravot.js` | stand the willows from Motza at the sides of the altar, tops bent over it; trumpets; go round the altar with your finger (or hold) — once a day, seven times on the seventh — "אנא ה׳ הושיעה נא"; "יפי לך מזבח" (Sukkah 4:5, verified). **Not on Shabbat** unless it is the seventh day (Sukkah 4:1, 4:3): tomorrow, 15 Tishrei = Shabbat, has no aravah; the water libation is all seven days. In the live musaf segment it follows the musaf (our placement ⚑). |
| **לחם הפנים** (Shabbat) | `lechem.js` | two thumbs: pull the old row out while sliding the new one in — the table is never empty (Menachot 11:7, content event). In the live musaf segment on Shabbat, after the musaf ("ומוספין לבזיכין", Yoma 33a). |

The pilgrims' loop repeats: its card offers **עוד עולי רגל** for another wave; the card lists the offerings just routed
with their Zevachim quotes. The musaf card shows the day's musaf entries (calendar_offerings.json). A mini-game done
without a mistake gets a **בלי טעויות** mark; each new rank shows the new ממונה's card.

**Sukkot (from Friday evening 25.9.2026):** the home shows the day (ט״ו תשרי · סוכות · שבת), both musafim (Shabbat 2 lambs;
Sukkot 13 bulls, 2 rams, 14 lambs, 1 goat), the water libation, the aravot around the altar (Sukkah 4:5, verified),
the showbread (Shabbat), and Simchat Beit HaShoevah ("מחר ב-19:06" — not on the first night). The water is poured in
the shir game; the aravot card follows the maaracha game on Sukkot days.

## 4. Progress and hooks (simple tonight; the hooks agent refines them)
- **ספר העבודה** — the 40 steps of tamid.json; each game fills its steps (a test checks that the 18 games cover all 40
  exactly once, in the Mishnah's order for the morning chain).
- **13 roles** done for real; **15 ממונים** as a rank ladder (memunim.json, the Mishnah's order, Shekalim 5:1) — each rank
  "meets" the next ממונה and shows his card; thresholds in `state.RANKS`.
- **Mishmar of the week** badge (calendar.currentMishmar; "המשמר שלך בשבוע!" when it is his).
- **Streak**: one service a day; Shabbat and Yom Tov never break it.
- **The ketoret**: the legendary role, once in a lifetime, with a collectible.
- No loot boxes, no purchases, no punishment, no pressure notifications.

## 5. Architecture

```
src/avodah/
  index.js        createAvodah({ world, root, onEvent, options }) → { start({mode, segment}), stop(), frame(now), state }
  state.js        save 'bh_avodah' v1 (pure; migrate()); lots; learn; ranks; streak; reads 'bh_beta2' read-only
  schedule.js     calendar.js → segments + live windows, liveStatus (now/next/barkai), dayTheme (Hebrew day from sunset)
  data.js         the ONLY reader of content/*.json; tolerant; isDraft(); FALLBACK texts; ROLES, CARRIERS, BLEMISHES, WOODS;
                  GAMES (game → the steps it teaches); hasDivineName()
  world.js        guardWorld(): every §12 call guarded (missing → no-op, throw → logged once, promise → timeout);
                  project() / canProject / sanctState() / lampsWestToEast() for the 3D targets
  interact3d.js   createInteract3D(): world-anchored touch targets projected every frame; the compact docked card;
                  frame(shot) / focus(vessel); spreadLamps(); null when the world cannot project (the SVG is played)
  sound.js        procedural WebAudio: silver trumpets (tekiah / teruah), cymbal, lyre, magrefa thud, gate creak, water…
  ui.js ui.css.js the HUD: status bar, service progress, home panel (היום · ספר העבודה · הדרך שלי), cards, name pick
  minigames/      common.js (the frame: hint, miss, done, loop, hold, sparkle, keyboard, solver, three, hit, walk),
                  art.js (the illustrated warm style: hall, kohanim, raised hands, animals, Levites, people)
                  + one file per game:
                  payis kiddush deshen maaracha barkai taleh heichal zerika evarim ketoret birkat shir (the morning),
                  korbanot musaf erev neirot aravot shoevah lechem (the day) + index.js (the registry)
```
- `options`: `now()` (a clock to pin), `storage`, `fast` (short animations, tests), `production` (approved cards only),
  `sfx` (share a sound kit).
- Every mini-game registers a **solver** that plays it through real DOM events on its own elements; the harness uses it.

### Playing in the 3D world (Sprint 3: `interact3d.js`)
Where the world can carry the action, the player acts **in the 3D scene**: each target is a DOM button (a glowing,
pulsing gold ring, 64 px, or 52 px where they crowd) whose position is `world.project(x, y, z)` every frame — no
raycasting, so it works on phones, with any renderer and under a paused loop. While targets are up the card docks at the
bottom as a compact bar (title, hint, buttons; the illustration is hidden) and the camera's view offset (main.js) keeps
the looked-at point above it. Each step frames its camera (`T3.frame(shot)` → `world.look`, or `T3.focus(vessel)` →
`world.sanctuary.focus`). Every target has its SVG twin: when `world.project` is missing or throws (world = {}, the
harness with `no3d=1`, a broken world) the illustrated card is played instead. A target counts as reachable when it
is on screen and above the docked card; when a live one is out of reach the camera first frames all the step's targets
(`fit`: keeps the view direction, looks down 30–65°, steps back until they fit the narrower field of view; never inside
the house, where the sanctuary's focus poses frame the vessels), and if one is still out of reach 3 s later the layer
retires for the rest of the game (`T3.alive` = false, the step's `onLost` runs: e.g. the second pyre goes straight to
the lighting) — never a stuck step. The first real-build run (before `fit`) retired four steps this way: the SW pyre,
8 of the 24 rings, the magrefa and the blessing on the Ulam steps (each game then went on in its illustrated card);
the kiyor's spigots, the deshen game, the lamb's close-up, the Heichal (gate, ash, stone, lamps), the kevesh places and
the salt, and the silver bowls stayed in 3D.

| game | 3D targets (world points from places.js) |
|---|---|
| kiddush | the 12 spigots round the kiyor (KIYOR; busy ones dimmed), after the mukhni's creak ("הגיע עת", Tamid 1:4) |
| deshen | hold on the kevesh to climb; the two heaps and five embers on the great maaracha; the place east of the kevesh (DESHEN_PLACE) |
| maaracha | where the second pyre goes (by the SW horn, Tamid 2:5), then light the great maaracha |
| taleh | the six lambs in their stalls (`lambsChamber.positions`; a tap on a lamb: `pick(ray)`), the cup at the chosen lamb's mouth, its ear, eyelid, nose and lip in close-up (`partPosition`, following the head; the lamb stands calm) |
| heichal | the great gate (hold, from the Ulam, with the gate's creak; ⚑ or from inside after the wicket), the ash on the golden altar, the stone before the Menorah and each lamp (`sanctuary.anchor`: gate, gate-in, gold-altar-top, menorah-stone, menorah-stone-2; `lampPosition`) |
| zerika | the 24 rings (RINGS), the NE and SW corners, the red line (LEVEL.redLine) up/down, the yesod |
| evarim | the four places on the kevesh (lower/upper × west/east), the salt |
| ketoret | the magrefa, the lamps, the coals on the golden altar (then the cloud in view) |
| birkat | the Ulam steps (ULAM_STEPS) |
| shir | the two silver bowls (west: water, east: wine — Sukkah 4:9) at the SW horn |
| neirot | each of the seven lamps (`lampPosition`; the western lamp by `state.menorahAxis`) |
| lechem | the Shulchan's two ends (`anchor('shulchan-east' / 'shulchan-west')`: the old loaves out, the new in) |

`world.js` adds `project(x,y,z)` (guarded; null when missing), `canProject`, `sanctState()` and `lampsWestToEast()` (the
lamp positions in gameplay order, west → east, from `sanctuary.lampPosition`, or computed from places.MENORAH).
**main.js** (one marked block `// ── avodah interact ──` in avodahWorld()): `world.project` = `view.project` (CSS px with
the view offset) and `world.camera`. The 7 lamps are 0.4 amah apart, so their rings fan out ×1.9 around the centre
(`spreadLamps`).

**Pacing.** Walk-ins the game waits for go through `api.walk(promise, label)`: capped at 3.5 s (1.5 s on a repeat play
in the session), with a "דלג ›" chip; the stage and after waits in index.js are ≤ 2.6 s. Sound cues: the gate's and the
mukhni's creak, trumpets, the crowd at the bow and at each pilgrim.

**Illustrated cards (`minigames/art.js`).** Where the 3D cannot carry the action — the lotteries' fingers, the musaf
count, the song — the SVG is illustrated in one warm style (lit limestone, linen, gold): the Chamber of Hewn Stone with
ashlar walls, kohanim with sleeves, sash and turban (kohenFig, shared by every fallback), raised hands with one or two
fingers instead of digits, calm standing bulls, rams, lambs and goats (the herd fills in once the count is right), twelve
Levites with kinorot on the duchan (Arakhin 2:6) and people who bow. Less on-screen text; the sourced card follows each
game as before.

### The exact world calls (PROJECT.md §12)
Called through `world.js` only; all optional.
- `world.look(p, t, ms)` with places.SHOTS: `kiyor kevesh altarTop lambs heichalDoor slaughter ulamSteps barkai`, plus
  the Gazit `{p:[-60,40,110], t:[-81,18,70]}` and Ezrat Nashim at night `{p:[200,60,60], t:[75,20,0]}`.
- `world.setTimeOfDay('night' | 'dawn' | 'noon' | 'dusk')` — per game, and on the home by the real sky.
- On the home: `world.look(EVENT_SHOT[current event])` (schedule.js), once per change of event or sky.
- `world.sanctuary.enter('heichal')` (heichal, ketoret, neirot) → awaited ≤ 7 s; `exit()` after them;
  `setDoors(u)` (0…1, while the gate opens, in 0.1 steps); `setLamps(levels[7])` — **index 0 = westernmost … 6 =
  easternmost**; morning `[0,0,0,0,0,1,1]` (the two eastern burn), after the 5 lamps `[0.6×5,1,1]`, after the 2 lamps
  `[0.6×5,1,0.6]` (the western of the two stays, Tamid 6:1), evening all `1`; `setGoldAltar({coals, smoke})`.
- `world.sanctuary.highlight('kiyor' | 'lambs' | null)`, `focus('gold-altar' | 'menorah' | 'shulchan', 1200)`,
  `setBread('full')`, `setBezichin(true)` (the showbread game).
- `world.avodah.kohen('player', {garments:'kohen', role})` — created **once per session** (world.js caches the actor by
  id; `stop()` removes it) → `.walkTo([x,z])` (kiyor, top of the kevesh, DESHEN_PLACE, the NE corner), `.carry(item)`
  with `machta mizrak teni kuz limb kaf null`, `.pose('throw' | 'bless' | 'stand' | 'pour' | 'bow')`;
  `animal('lamb', LAMBS_CHAMBER centre, {tamid:true})` → `.inspect(true/false)`, `.leadTo(TAMID_RING.morning)`; the same
  handle is passed to `slaughter(handle, TAMID_RING.morning | .afternoon)` (awaited ≤ 5 s behind the cut-away card),
  then `.hide()` after the blood is received; `sprinkle('NE','lower')`, `sprinkle('SW','lower')`;
  `limbs('kevesh' | 'salt' | 'fire')`; `libation('water' | 'wine')`; `levites(true/false)`, `trumpets()` (×3 per perek,
  and in the aravot and Beit HaShoevah games), `bow(true/false)`, `blessing(true/false)`, `fire(0.4 … 1)`,
  `pilgrims(4 | 6)`, `pilgrim({id})` (a korbanot.json id), `lambsChamber.count(6)`, `pens.fill(n)` (the day's musaf
  animals).

## 6. Tests
- All three unit files together: 33 tests.
- `node --test test/avodah-state.test.mjs test/avodah-schedule.test.mjs` — 29 tests: save/migrate/Phase A read-only,
  fair lots (13 days → 13 roles; ketoret within 3 tries, then never), learn/points/ranks, streak with rest days, live
  marks; schedule for a weekday, Friday noon vs Friday evening (Sukkot + Shabbat), 15 Tishrei, Chol HaMoed, a plain
  Shabbat, Rosh Chodesh; live status + next appointment; data coverage; no Divine Name in the content.
- `node --test test/avodah-games.test.mjs` — 4 tests: the pilgrims' answers derived from korbanot.json, the pilgrim
  offerings, carriers ↔ roles, the chains.
- `NODE_PATH=… node test/avodah-harness.cjs` — DOM harness with a mock world that records every call: 62 checks (the
  whole morning by simulated input in the Mishnah's order, a draft-tagged sourced card after every game, the summary,
  a new ממונה's card, the world call order, no Divine Name in ~1,500 rendered texts, practice of all 21 games, gentle
  mistakes, the pilgrims' replay, the afternoon chain, live mode with "נכחת בזמן", joining late, Shabbat Sukkot I
  (musaf → showbread, no aravot), Chol HaMoed (musaf → aravot; Beit HaShoevah live at night), the ketoret lot,
  `world = {}` and a broken world, production mode (approved content only), desktop dark). A full morning by solver takes ~30 s at fast=1.
  Sprint 3: the mock world projects (a deterministic stand-in for `world.project`) so the solvers press the **3D
  targets** (`api.hit(key, svgFallback)`); the harness counts the targets pressed per game (`window.__AV3D_HITS`: all 12
  3D games), measures the rings (≥ 52 px, above the compact card; `h-3d-zerika.png`) and plays the whole morning again
  with `no3d=1` (no `project`: the illustrated SVG, no target shown) — 70 checks.
- Wave 4: the harness has **81 checks** — a returning player's seven games (repeats and the tier בקי): the lamb chosen in
  3D (`lambsChamber.positions` → `animal(…, { index: 0 })`, the cup at its mouth), three inspections at the tier בקי, the rings
  on the drawn parts, the ⚑ wicket route (`enter via wicket`, `focus('heichal-gate')`, the anchors `gate-in`,
  `gold-altar-top`, `menorah-stone(-2)`), one פרק on a repeat (two tekiot), zerika's corners without labels, the short intro,
  the payis's mitznefet and the Rambam's line, the kiddush posture cited (Zevachim 19b). The mock world has the wave-4 APIs
  (anchors, the six lambs, `partPosition`/`facing`, `state`). `node --test test/avodah-games.test.mjs`: 8 tests (+4: the gaps
  with בבדיקה, the eight garments, the fallback cards without the stale note, and `pickLamb` — the ray through a tap hits the
  lamb drawn there, with a three.js camera and the world's own pick).
- `node build.mjs && NODE_PATH=… node test/avodah-shots-w4.cjs [payis2,barkai,taleh,zerika,evarim,wicket]` — real-build phone
  shots of the wave-4 moments: `test/out/avodah/w4-phone-*.png`.
- `node build.mjs && NODE_PATH=… node test/integration-s2.cjs phone` — the real build (SwiftShader): the morning over
  the real world with screenshots in `test/out/integration/phone-*.png` (the rings over the scene). Sprint 3, with the
  auto-fit: 9/10 — the whole morning over the real world, no page errors, and no 3D step retired (the rings, the
  magrefa, the Ulam steps, the kevesh, the gate and the bowls all in 3D); the one FAIL is "no world call timed out":
  a stage `kohen.walkTo` (15 s) and one `sanctuary.focus` (6.9 s) under SwiftShader — neither blocks a step (index.js
  races the stage at 2.6 s; nothing awaits a focus).
- `node build.mjs && NODE_PATH=… node test/avodah-shots.cjs [phone|desktop|both] [names]` — real-build screenshots through
  the temporary entry (SwiftShader: 1–3 min a frame under load). Saved in `test/out/avodah/`: `real-phone-{home, altar,
  payis2, deshen, zerika, shir}.png`, `real-desktop-{home, ketoret, korbanot, shoevah}.png`; the DOM harness saves
  `h-*.png` (name pick, intro, home, path, live home, games, desktop dark).

## 7. Content: fallbacks and gaps
Fallback texts in `data.js` (read on Sefaria 2026-09-25, quoted verbatim, drafts): Yoma 25a (the circle), Yoma 2:1 (fingers,
the race), Yoma 22b (not counting people), Yoma 26a (ketoret once), Yoma 3:10 (12 spigots), Tamid 1:4 (no lamp; the inner
coals; east of the kevesh), Tamid 2:3 (wood), Tamid 3:9 (the stone), Middot 3:1 (the red line), Sukkah 4:5 (aravot),
Sukkah 4:1 + 4:3 (the aravah not on Shabbat), Sukkah 5:4 (the torches, the Levites on the 15 steps, "קרא הגבר" — cut
before the words that contain a Divine Name), Arachin 2:5 (six lambs; instruments), Bekhorot 6:1, 6:2, 6:4 (blemishes).
Sprint 3 (read on Sefaria 2026-09-25): Kelim 1:9 (kiddush of hands and feet before the Heichal — the fallback `kelim_1_9`
on the heichal card), Sukkah 4:9 (the two silver bowls, `bowls`), Tamid 1:4 (the mukhni's sound, "הגיע עת", `mukhni`),
Arakhin 2:6 (no fewer than twelve Levites on the duchan: the song's illustration), Yoma 12b (the avnet, ⚑15). The content
agent is moving the fallbacks into content/; data.js keeps reading either.
**Gaps — delivered** in content/avodah_gaps.json (CONTENT-S3 §5) and shown since wave 4 (§0). The old list, for the record:
the lottery method in the Gemara (the number, the mitznefet — not stated in the game);
the psalms of the musaf days (Sukkot, Rosh Chodesh) — the game uses the weekday psalm of the Tamid only; the number of
פרקים in the song (the game uses 3 × tekiah-teruah-tekiah = the 9 blasts of Sukkah 5:5 — our division ⚑); Simchat Beit
HaShoevah quotes beyond 5:1; the posture of kiddush (Zevachim 19b) not used; the afternoon's 11 kohanim (Yoma 2:5) not
yet shown in the evarim game.

## 8. Decisions awaiting the owner (⚑)
1. ⚑ **Menorah orientation**: the lamps are drawn in a west→east row and `setLamps` index 0 = westernmost; which two are
   "eastern" (Tamid 3:9, 6:1; Menachot 98b) needs a ruling.
2. ⚑ **Where "for real" counts**: tonight the day's role counts in practice too (so players in any time zone can
   complete the 13); live adds the "נכחת בזמן" mark and points. Alternative: roles only in live.
3. ⚑ **The ketoret lottery** is won within 3 tries and then never again (Yoma 26a); also in practice mode when the lot
   says so.
4. ⚑ **Ranks = the 15 ממונים** in the Mishnah's order; thresholds are placeholders for the hooks agent.
5. ⚑ **The song**: three פרקים per psalm (from the 9 blasts); the melody is procedural, not liturgical.
6. ⚑ **Invented names** for other kohanim in the lottery (שמעון, אלעזר …) and pilgrims ("אשה מיריחו" …) are fiction.
7. ⚑ Production mode hides every draft card: with nothing approved yet, a production build shows the games without cards.
8. ⚑ **Aravot timing**: the Mishnah (Sukkah 4:5) does not say at which point of the day the altar was circled; the game
   puts it right after the musaf. The number of golden menorot of Beit HaShoevah (four) follows the 3D scene.
9. ⚑ **Joining late** starts the live service at the current step; the earlier steps are left to practice.
10. ⚑ **The afternoon song**: the afternoon chain repeats the day's psalm (Tamid 7:4 lists the psalms of the day; what
    the Levites sang at the afternoon Tamid is not settled here).
11. ⚑ **The western lamp in 3D** follows the Sanctuary's Menorah axis (`sanctuary.state.menorahAxis`): north–south →
    the middle lamp (index 3); east–west → the second from the east (index 5), per the content note on Tamid 6:1 (the
    same open question as ⚑1).
12. ⚑ **The Heichal's gate is opened from the Ulam** in 3D (the player holds the gate's ring from outside); in the
    Mishnah (Tamid 3:7) the opener goes in through the northern wicket and the chamber and opens it from within. Wave 4:
    that route is built and tested behind a flag (`HEICHAL_OPTS.wicket`, §0) — the owner chooses the default.
13. ⚑ **The lamb's close-up**: the ear, eyelid, nose and lip rings sit on the parts as the world draws them
    (`animal.partPosition`, wave 4; an illustration of where the blemishes of Bekhorot 6 are looked for). The lamb stands calm; binding (akeida) is not
    shown: the owner's decision is pending. No slaughter is visible (the cut-away card stays).
14. ⚑ **The silver bowls** stand on the altar's top by the south-west horn, the water bowl west of the wine (Sukkah
    4:9 "מערבי של מים ומזרחי של יין"); their exact place and size are illustrative.
15. ⚑ **The illustrated style**: the ordinary kohen's avnet is drawn in wool colours (Rabbi: "של כלאים"; Rabbi Elazar
    b. R. Shimon: "של בוץ", Yoma 12b); the Levites' robes, the people's clothes and the animals are illustrations.
16. ⚑ **Repeat pacing**: a walk-in the game waits for is capped at 3.5 s the first time and 1.5 s on a repeat, and can
    always be skipped ("דלג ›"). Wave 4: a repeat is any game played before (the hooks' `gctx.repeat`), not only in the session.
17. ⚑ **The song on a repeat**: one פרק of the three (the hooks' request: ~10 s a morning); the first time, and on the card,
    the full three פרקים and nine blasts.
18. ⚑ **The lottery's number**: 60 for the player's own lots (Bartenura: "או מאה, או ששים"), 24/30/36 for the others' (a
    quick count); every raised finger counts, as the Rambam ("ואם הוציא שלש מונין לו שלש"); Bartenura's sick kohen whose
    two count as one is not modelled (content ⚑20).
19. ⚑ **Harder variants from the tier "בקי"** (three lambs and a closer look; corners without labels; the row from memory;
    faster counts) — the tier thresholds are the hooks agent's.
20. ⚑ **The musaf song**: Chol HaMoed's psalms follow Sukkah 55a as the content reads it (needs_check: that it is the musaf's
    song is inferred from the passage); on Shabbat Chol HaMoed the Shabbat song is shown ("ימוטו ידחה"); Rosh Chodesh none.

## 9. What's next
- Wire the entry point in main.js / the Phase A menu (the supervisor; the temporary `#avodah` block goes away).
- When `world.sanctuary` / `world.avodah` land: tune the camera shots and timings; show the lamb/kohanim in the scenes.
- Sprint 3: more offerings in the pilgrims' loop (birds, meal offerings, Pesach groups), the Shabbat showbread game, the
  afternoon's 11 kohanim, the full Sukkot set (aravot procession game, water drawing, Beit HaShoevah dancing), musaf songs.
- The hooks agent: pacing of the 14-game chain (~8–10 min), daily goals, notifications design (no pressure).

## Appendix: running it
- Harness (fast, no WebGL): `node test/avodah-harness.cjs --build`, then open `test/avodah-harness.html?fast=1`
  (`&now=2026-09-25T20:00:00%2B03:00`, `&world=none`, `&theme=dark`, `&mode=practice&segment=shachar`).
- Real build: `node build.mjs`, open `dist/temple3d.html#avodah` (`#avodah=live`, `#avodah=shachar`, `#avodah=korbanot`).
