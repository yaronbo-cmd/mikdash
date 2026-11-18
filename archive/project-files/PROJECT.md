# בית המקדש — Project Bible

Owner: ירון בן אור (yaron.bo@gmail.com). Language of the product: Hebrew (RTL). This file is the single
source of truth for every agent and every future session. Read it fully before touching code or content.

## 1. Vision (the owner's words)
- **Phase A — לבנות את הבית.** The player physically builds the Second Temple stage by stage: leveling the
  mount, foundations, frames, walls. Tap-to-build with a character *inside* the world (Brawl-Stars feel),
  SimCity-style real-time long builds and expeditions that finish while the player is away.
- **Phase B — העבודה בבית.** Operate the Temple by the *real* clock and Hebrew calendar: the daily Tamid,
  ketoret, lamps, Musaf on Shabbat/Rosh Chodesh/festivals, pilgrims' offerings. It must teach the Avodah
  truthfully, and it must have hooks strong enough that players don't want to leave.
- Visual bar: Megapolis / SimCity BuildIt level. Accuracy bar: Mishnah Middot / Tamid / Zevachim.
- Target: investor demo now → iOS/Android store launch later.
- **Owner directive, 2026-09-25 (verbatim, then its meaning):** "אין קורבנות. אין חיות. אין דיר ואחסון לחיות. אין שחיטה
  והקרבת קורבנות. אין קטורת. אין כניסה לבית המקדש. אין מנורה ארון הברית אין קודש הקדשים אין פרוכות וכו', אין כיור" —
  "כשאני כותב אין, הכוונה חסר. צריך להשלים וכן להכניס למשחק." So all of these are MISSING and must be built into the
  game, in full detail: the offerings and their animals, pens and animal storage, slaughter and offering, the ketoret,
  entering the house (Ulam → Heichal), the Menorah, the Kodesh HaKodashim, the parochot, the kiyor. (On the Ark: see §2.8.)
  Also: "שהסוכנים ימשיכו בביצוע הכול בפירוט יתר", and a dedicated hooks agent that plays the game in its own version,
  finds where it is boring, studies player psychology in similar games and adopts their styles — "סופר-מקצועי".

## 2. Non-negotiable content rules
1. **Every halachic/historical statement has an exact source** (Mishnah/Gemara/Rambam/Josephus/archaeology),
   quoted verbatim from Sefaria (Torat Emet default; note Kaufman/Vilna variants when they differ).
2. **Approval workflow:** all content items carry `status: "draft" | "approved"`. Only Yaron approves.
   Production builds show only approved items (enforced in code); drafts appear only with a visible "טיוטה" tag.
3. **Never write the Tetragrammaton or other Divine Names in full** in any text, code comment or asset. Use ה׳.
4. Where the Mishnah is silent (wall heights, porticoes, façade ornament), use Josephus / archaeology and
   say so in the card. Where opinions differ, follow the Tanna Kamma and mention the other view.
5. Respectful treatment: the Kohen Gadol's Yom Kippur service and the Holy of Holies are "watch & learn"
   scenes, not free play. The owner asked (2026-09-25) for the Kodesh HaKodashim to be in the game: it is built
   and seen, but the player never walks in — only the Kohen Gadol on Yom Kippur enters (Kelim 1:9), and the player
   watches that scene. Kept dim and bare: the Even HaShtiya, the parochot, the ketoret cloud.
6. **Nothing from the 2D game is approved** (owner, 2026-09-23: "אל תעביר אישורים מהגרסה הקודמת"). Its texts,
   numbers and mechanics are drafts to be improved; every fact must be re-verified against the source.
   Game design authority: make it genuinely fun and interesting for the player — think it through, don't copy.
7. Illustrations from מכון "לשכנו תדרשו" (mikdash3.co.il) may be used with credit (written terms pending).
8. **No Ark in the Second Temple.** Yoma 5:2: "מִשֶּׁנִּטַּל הָאָרוֹן, אֶבֶן הָיְתָה שָׁם מִימוֹת נְבִיאִים רִאשׁוֹנִים, וּשְׁתִיָּה
   הָיְתָה נִקְרֵאת". The Kodesh HaKodashim holds the Even HaShtiya. "Where is the Ark?" is a sourced mystery
   (Shekalim 6:1–2: the tradition that it was hidden under the wood chamber, and the kohen who noticed the odd
   paving stone). Never model the Ark inside the Second Temple (a clearly labelled First-Temple flashback would be
   an owner decision).
9. **Slaughter and blood, with dignity.** No gore, no wounds, no suffering animal, no spray. The camera cuts away at
   the moment of shechita (to the kohen's hands, the mizrak, faces). Blood is seen only in the service vessel and as
   the prescribed marks on the altar (it was whitewashed twice a year, Middot 3:4). Suitable for ages 10+.
10. The priestly blessing and any verse with the Name: show the first words with ה׳, or describe it; never the Name.

## 3. Technology
- Engine: **three.js r186** (WebGL2), bundled with **esbuild** into ONE self-contained HTML file (no CDN).
- Delivery: claude.ai Artifacts (private links for demos). Store phase: wrap the same web build with
  **Capacitor** for iOS/Android; cloud save + accounts via **Supabase**; native push for the real schedule.
- Licences: **no GPL/AGPL dependencies** (commercial product). Hebrew dates via `Intl` (`he-u-ca-hebrew`),
  solar times via our own NOAA implementation.
- Build: `node build.mjs` → `dist/temple3d.html` (+ test wrapper). Keep bundle < 5 MiB (3 MiB from wave 6, 2026-09-27; 3.25 for wave 14's building jobs, 2026-10-01; 5 MiB on 7.10 — the cap is ours, for a phone's load; gzip ≈ ⅓; the artifact allows 16 MB, GitHub Pages 100 MB per file; past 5 MiB, split the bundle into lazily loaded files).
- Test: Playwright with system Chromium: `executablePath: '/opt/pw-browsers/chromium'`, args
  `['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']`. Rendering in
  SwiftShader is slow (10–40 s/frame) — pause the loop (`__T.pause(true)`) and render on demand
  (`__T.jump(view)`, `__T.render()`), screenshot with a long timeout. Force quality with
  `page.addInitScript(()=>{window.__FORCE_Q='normal'})`. Harness: `test/shot.cjs` (see §8).
- Mobile first: must run on a mid-range phone. Budget: ≤ 150 draw calls, ≤ 1.5 M vertices,
  pixel ratio ≤ 1.5 on phones, shadow map 2048 on phones.

## 4. World conventions
- **1 unit = 1 amah** (~48 cm). Axes: **+x = east, +z = south, +y = up** (north = −z).
- Levels (y): Temple Mount paving 0 · Chel & Ezrat Nashim 6 (12 steps × ½) · Ezrat Yisrael 13.5
  (15 steps × ½) · Ezrat Kohanim 16 (+2½, R. Eliezer b. Yaakov, Middot 2:6) · Heichal floor 22 (אוטם 6).
- Azara interior x ∈ [−187, 0], z ∈ [−67.5, 67.5] (187 × 135, Middot 5:1). Ezrat Nashim interior
  x ∈ [6, 141] (135 × 135, Middot 2:5). Walls 6 thick. Chel = walls + 10; soreg ring at walls + 18.
- Altar x ∈ [−54, −22], z ∈ [−19.5, 12.5] (Middot 3:1, 5:2); kevesh south x ∈ [−46, −30], z to 42.5.
- Heichal: rear block x ∈ [−176, −92], z ±35; Ulam front x ∈ [−92, −76], z ±50; height to 112 + parapet
  3 + כלה עורב 1 (Middot 4:6–7). Kodesh HaKodashim interior x ∈ [−159, −139].
- Herodian platform x ∈ [−300, 277], z ∈ [−480, 400]; Middot's 500×500 square x ∈ [−223, 277],
  z ∈ [−183.5, 316.5] ("רובו מן הדרום" — margins S 243 > E 130 > N 110 > W 30).
- Sun/time presets: dawn, noon, dusk, night (Simchat Beit HaShoevah). NB: Sukkah 5:2 does not give the number
  of menorot — the scene shows four; label it as an illustration choice.

## 5. Code map (src/)
| file | owns |
|---|---|
| `main.js` | renderer, camera + OrbitControls, lights/sky/time presets, composer (bloom, GTAO on high), picking + info cards, boot, `window.__T` test hooks |
| `batch.js` | `Batch` (world-space geometry → world UVs + `aBase` → merged per material), `groundAO()` shader patch (ground occlusion + macro variation), `mkParts()` (wall/cornice/door/gate helpers) |
| `tex.js` | procedural canvas textures: Herodian ashlar, paving, marble waves (אפיק שפה ועייל שפה), plaster, roof tiles, wood, ground, lattice, particles |
| `temple.js` | inner complex per Middot (chel, soreg, walls, gates, Beit HaMoked, Gazit, floors, 12 & 15 steps, altar + kevesh, kiyor, slaughter area, Heichal/Ulam with gold details, Nikanor, Ezrat Nashim), `buildMenorot` |
| `mount.js` | Herodian platform, pilastered walls, porticoes, Royal Stoa, Chuldah gates + southern steps, Robinson & Wilson arches, Shushan gate, Antonia, Western-Wall street |
| `world.js` | `terrainH(x,z)` (Jerusalem valleys & Mount of Olives), terrain mesh, city (instanced houses, doors, windows, lamps), trees, Herod's towers, sky dome, stars, clouds |
| `life.js` | people (bodies+heads+priestly belts), walkers, sheep, doves, altar fire, smoke column, night flames/lights |
| `info.js` | verified card texts for tap-to-identify |
| `page.html` | page shell + UI chrome (RTL). Content only — the Artifact wraps it in <html>/<body> |

Sprint 1 added: `stages.js` (3D construction layer, see its header for the API), `game/` (economy, state, UI), `calendar.js`
(time & calendar engine), `content/` (Avodah database).
Wave 6 adds (2026-09-27, v15): `sky.js` (sky + clouds per preset), `city.js` (Jerusalem around the Mount: the First and Second
walls and towers, Herod's palace, the Upper and Lower City, the stepped street, Siloam, Bethesda, the Mount of Olives; `BEAUTY`
camera shots), `crowd.js` (people at real activities: `crowd.setScene('site'|'plaza'|'festival'|'night')`), `water.js`
(`world.water`: the kiyor's 12 spigots, washing, the mukhni, the shitin, the amah and its outlet), `game/minigames/*` (the precision
games: crane, dress, quarry, plumb, whole stones, frame — `runMinigame(kind, ctx)`), `game/hooks/loop.js` (orders, finds, daily),
`match3/*` (the Temple match-3 before every step: `runLevel(ctx)`, fields quarry / forest / gold), `kings/*` (trade with the kings
of the nations: `openCourt(ctx)`, pure `partners / offers / accept / settle / bestFor`). Docs: BUILD(-he), SITE, FUN, PLAYTEST-S6, SOURCES-S6 (the verified source pack), WAVE6-BRIEF (the common brief),
MATCH3, KINGS, CONTENT-S6.
Sprint 2 adds: `places.js` (THE shared map of service places — read it first), `sanctuary.js` (the house inside + its
vessels), `animals.js` / `actors.js` / `avodah3d.js` (animals, kohanim, the service's world layer), `avodah/` (Phase B
gameplay: index.js flow, state.js save 'bh_avodah', schedule.js real clock, data.js the only content reader, world.js the
guarded bridge, minigames/*, ui.js), `game/hooks/` (engagement systems, see docs/HOOKS.md). See §12 for the contract.

## 6. Build stages (Phase A) — ids are stable; all texts are drafts
`har` שיטוח ההר · `wall` חומת העזרה · `sorag` הסורג והחיל · `gates` שערי העזרה · `nashim` עזרת הנשים ·
`nikanor` שער ניקנור וט״ו המעלות · `lishka` לשכות הכהנים · `yesod` יסוד המזבח · `sovev` הסובב ·
`guf` גוף המזבח (+כבש) · `karnot` הקרנות · `kiyor` הכיור · `ulam` האולם · `heichal` ההיכל · `kodesh` קודש הקדשים.
Mapping to 3D: `har` = the whole Herodian platform (mount.js) replacing a rough rocky hill with 12 boulders;
`wall` = azara + Ezrat Nashim outer walls and the azara floors; `sorag` = chel podium, its steps, soreg;
`gates` = azara gatehouses + Ezrat Nashim east gate; `nashim` = corner chambers, gallery, props;
`nikanor` = gatehouse, its chambers, 15 steps; `lishka` = Beit HaMoked, Gazit, slaughter-area fittings;
`yesod`/`sovev`/`guf`/`karnot` = altar tiers (kevesh with `guf`, red line with `sovev`, fire only when
altar complete); `kiyor`; `ulam` = façade wall, shoulders, hall, columns, lintels, 12 steps;
`heichal` = rear block x ∈ [−139, −92] + its parapet/spikes/bands; `kodesh` = rear block x ∈ [−176, −139].
The 2D game (artifact 46bgWDHedDV54kemeFVtvM) holds the earlier DRAFT data (not approved): RES, BLD (15),
EXP (7 expeditions, 3–24 h real time), QUIZ, KETORET, save key `bh_beta2` v4. Source corrections (verified 2026-09-23, see docs/GDD.md):
wall → מדות ה,א (וכן ב,ו); gates → מדות א,ד (north gates א,ה; other view ב,ו: 13 gates); lishka → split: ה,ג
(six chambers), ה,ד (Gazit), ג,ה (rings/tables), א,ו (Beit HaMoked), א,ד (Pinchas HaMalbish); kodesh → יומא ה,ב
(אבן שתיה) + כלים א,ט, keep מדות ד,ה for the craftsmen in boxes; har → "מי שלא ראה בנין הורדוס" is Bava Batra 4a
(Sukkah 51b has a parallel in other words); "144 dunam" unverified.

## 7. Phase B design (draft — needs Yaron's decisions)
- Real day (Jerusalem zmanim, Mishnah Tamid): lotteries (פיס) → terumat hadeshen → Tamid shel shachar
  at dawn → lamps & inner altar → ketoret → birkat kohanim → limbs → nesachim + שיר של יום →
  day offerings → Tamid bein ha'arbayim (slaughtered 8½, offered 9½ halachic hours, Pesachim 5:1)
  → ketoret + lighting → night burning.
- Core loop: pilgrims arrive with offerings; the player routes each correctly (place of slaughter,
  blood application vs. the red line, what is burnt, who eats, where and until when — Zevachim 5).
  Mistakes open a sourced explanation; no punishment.
- Daily payis (lottery) = daily reward; ketoret lottery = rare legendary event (חדשים לקטורת).
- Real-calendar events: Shabbat (showbread), Rosh Chodesh, Pesach (3 groups), Omer, Shavuot
  (two loaves, bikkurim procession), Sukkot (70 bulls, water libation, Simchat Beit HaShoevah),
  Adar (half-shekel).
- Social: 24 mishmarot as guilds with real duty weeks; ranks = the 15 ממונים (Shekalim 5:1);
  collections: vessels, priestly garments.
- Open decisions: player identity (proposed: young kohen of a beit av), Yom Kippur/Holy of Holies as
  watch-only scenes, content partner (Machon "לשכנו תדרשו"), monetization.

## 7b. Phase A design
The authoritative design is docs/GDD.md (English) with the owner summary docs/GDD-he.md. All of it is DRAFT.

## 8. Roadmap
- **Sprint 0 ✓** 3D world per Middot (published demo), sources verified (26/32 exact, 6 wording fixes applied).
- **Sprint 1 ✓ (2026-09-24)** Phase A playable in 3D, redesigned from scratch (docs/GDD.md): stages.js construction
  layer + §12 world API (vision, hot spot, crane, red line, boxes, vine, rain, night lights, quarry, timelapse),
  game/ (5 materials, crews offline 12 h, stage graph, rhythm strike + combo, caravans, priest training, golden vine,
  Middot book, daily wage + Shabbat-safe streak, demo mode ×60 via menu or #demo, procedural sound),
  calendar.js (22 tests), content/ Avodah DB drafts (40 Tamid steps, 15 korbanot, REVIEW.md for the owner).
  Tests: game-state 18, calendar 22, harness 64, e2e 51 — all green.
- **Sprint 2 ✓ wave 1 (2026-09-25 night)** Everything the owner listed as missing, built in: the house inside (sanctuary.js:
  walk-in through the Ulam, gold interior, Menorah (straight/round), Shulchan + 12 loaves, golden altar, two parochot,
  Kodesh HaKodashim + Even HaShtiya, no Ark), kiyor with Ben Katin's mechanism, altar details, Beit HaMoked cutaway with
  the lambs' chamber, north chambers, Beit Avtinas; animals + pens + kohanim + Kohen Gadol + Levites + pilgrims and the
  service layer (animals.js, actors.js, pens.js, avodah3d.js); Phase B playable (src/avodah: 14 mini-games of the morning
  Tamid in the Mishnah's order + the day: offerings routing, musaf, afternoon Tamid, lamps, Sukkot, showbread; live on
  the real clock + practice); hooks (src/game/hooks: next-goal engine, rhythm fairness, weekly goal, investor demo reel,
  rest card, Sukkot card) with docs/HOOKS*.md; content (10 new files, 118 items, REVIEW.md Sprint 2 section).
  Phase A ↔ Phase B: the Phase A menu button "העבודה בבית · שלב ב׳", the Phase B home "חזרה לבניית הבית", or `#avodah`.
- **Sprint 2 ✓ wave 2 (2026-09-25 morning, published v10)** Phase B hooks (src/avodah/hooks: the daily 3-minute "העבודה שלך
  היום", short repeat cards, a longer ממונים ladder, the Sukkot live event, 25 vessels + mastery levels, a streak with one forgiven
  weekday, the soft Phase A→B gate: "הצצה" → the altar complete (Ezra 3:6) → Chanukat HaBayit; `#avodah=mine` investor demo);
  3D-first mini-games (src/avodah/interact3d.js: world-anchored touch rings, illustrated fallback cards in minigames/art.js);
  the Temple tour, "איפה הארון?" and the watch-only Yom Kippur service (src/avodah/scenes; from the Phase B home and the Phase A
  menu); content/scenes.json + content/moments.json; UTF-8 build (1.76 MB).
- **Sprint 2 ✓ wave 3 (2026-09-25 afternoon, published v11)** Phase A: all 15 stages end in a key moment (src/game/moments.js,
  docs/MOMENTS.md, test/moments.cjs); crews you can see — masons, carriers, sawyers, rope teams, the quarry, ox-cart caravans, the
  training yard (src/crews.js, docs/CREWS.md); scenes: texts from content/scenes.json, the Yom Kippur choreography
  (avodah3d `yomKippur(step)`), `sanctuary.anchor(id)`, the wicket route (Tamid 3:7, an option), walks and fades on the wall
  clock (docs/SCENES.md); content: 59-row code-fix table (docs/CONTENT-S3.md §2, to apply), avodah_fallbacks.json,
  avodah_gaps.json, REVIEW.md ⚑ checklist (48); QA report docs/QA-S2.md (P0s and main P1s fixed in master).
  v12 (2026-09-25, before Shabbat): the QA P0s and P1-1/2/4/6/7/8/9 fixed; the CONTENT-S3 §2 table applied (58 rows); every tap
  card tagged טיוטה in its data; qa-content-scan 11/11.
- **Sprint 2 ✓ wave 4 (2026-09-26 night, published v14)** Phase B fallbacks from content/avodah_fallbacks.json; UI polish
  (docs/UI-S5.md: 44-px targets across Phase A/B, AA contrast, the tap card above the panels, counters in RTL, tablets and
  small phones, shader precompile — the night recompile 79 → 12 programs); world & scenes (docs/SCENES.md: the golden vine
  hung after the Ulam and grown in the finished Temple, the tour panel's dark mode / 44-px targets / SVG icons / active chip /
  side panel on wide screens, the Even HaShtiya as pale rock, hay, the pens and animal market, Phase A camera framing so crews
  read, the Coponius gate, `stages.crane()` / `scaffold(id)`); Avodah (docs/AVODAH.md: the lamb chosen in 3D, partPosition
  rings, anchors in the Heichal, the wicket route behind a flag, repeat intros and harder tiers, content/avodah_gaps.json in the
  games, reframed shots, ring labels on a dark backing); hooks round 3 (docs/HOOKS.md, docs/PLAYTEST.md: the demo outro,
  25 tour stamps and doors, the Ark invitation after the Ezrat Nashim, the idle-crew cue, the caravan arrival beat, repeat
  flags for moments; crews idle at a blocked site 65% → 17%); content round 4 (docs/CONTENT-S4.md: 26 rows applied, the ⚑6 row
  waits; yom_kippur/mysteries/crews cards; 611 quotes verified); the build ships content without reviewers' fields (1.99 MB).
  Supervisor's integration: the Phase B home on narrow phones uses far establishing shots (schedule.js EVENT_SHOT_TALL — its
  panel leaves a third of the screen); at night the great fire's flames burn at a tenth (life.js — 46 additive sprites under
  the night bloom flooded any close view of the altar); #demo shows dusk instead of night and rain; the tutorial's timers stop
  with the HUD and wait out a key moment; no info card under a Phase B mini-game; a "בבדיקה" chip on cards.
- **Wave 6 ✓ (2026-09-27/28, published v15)** The owner's two goals of 27.9 (a stunning real world; Phase A as a deep construction
  game) + his daughter's idea (a match-3 before every step, a resource meter, quarry / cedar / gold, trade with the kings). Nine agents
  (WORLD, PEOPLE, WATER, SITE, BUILD, FUN, MATCH3, KINGS, CONTENT) on branches s6-*, coordinated on a file bus (/home/claude/wt/bus,
  kept only in the container: BRIEF.md + one notes file per agent + SOURCES.md). Built:
  world — a sky with lit clouds per preset, Jerusalem around the Mount (walls, towers, palace, city, pools, Olivet), aerial haze,
  ashlar relief and weathering, night lamps and gate torches; people — the hero's strokes land ON a real stone (dress / tamp / pick /
  split / measure / pull / carry, contact = sound = chips), a stone on the banker that changes rough → drafted → dressed, crews at
  SITE's bankers, crowds at real activities (pilgrims circling, bikkurim, doves, a teacher in the shade, guards, Sukkot, Simchat Beit
  HaShoeva); water — the 12 spigots pour, a kohen washes hands and feet (Zevachim 19b), twelve together (Yoma 37a), the mukhni by
  night, libations and the rest of the blood into the shitin (a thin trickle, §2.9), the amah to the Kidron; site — the building rises
  stone by stone along real joints (35,867 stones at har … 12 pours at the kiyor), the crane lifts real stones, survey cords, trench,
  scaffolds, finish; the game (docs/BUILD.md) — every stage a project (survey → dig → courses → finish → inspection → dedication),
  every step paid from the meter (stone · cedar · gold · silver · bronze · whole stones), the ONE action always on screen, key stones
  by the player's hands in precision games, course checks, crews offline, v14 saves migrate; the match-3 (3-minute boards, rising
  levels, vessels glow and rise — never smashed); the kings (Tyre and Sidon's cedar to Jaffa, Ezra 3:7, and four more courts;
  voyages in real time; a shortage chip). Pacing (game-sim): the whole Temple ≈ 24 days at three short sessions a day.
  Supervisor's integration: all nine merged clean; water.js outlet-stream closure fix; the flow test (test/game-flow.cjs 12/12).
- **Wave 7 ✓ (2026-09-28 morning, published v16)** Four agents (BUILD7, WORLD7, PEOPLE7, FUN7; brief: docs/WAVE7-BRIEF.md) on the
  first ten minutes: the opening vision (the finished House over the Old City at the golden hour, a flight down to the hero at the
  first boulder, skippable, once per new game — `stages.vision`), the pill by what a board pays ("כ־45 אבנים"), plural counts, one
  toast at a time, the crew chip in words, crews set stones while a board is open, a 3★ board pays a third segment, a king's deal
  first when bronze is short (the bronze step had become a gold farm); the world — a golden preset, night that reads (moonlight from
  the south-east), noon without burnt paving, gold that reads as gold, the altar's stripes fixed (a z-fight of the building cap);
  the hero — the kohen's white linen with the avnet (Josephus, Ant. 15.390), a face with eyes and brows, blinking, gestures
  (`hero.gesture`), an outline, young faces among the crews; FUN — "חפירת היום" (a find a day from content/finds.json, brushed out
  of the earth, Shabbat-safe), the match-3's first board teaches a special, the vessel album strip, the kings' first deal as a small
  story, level chips and accuracy in the precision games, sounds rebalanced (docs/PLAYTEST-S7.md). game-sim: 23 days, 138 boards.
- **Wave 8B ✓ (2026-09-28, published v17)** The owner's notes on v16 (docs/WAVE8B-BRIEF.md, verbatim): the Mount's last boulders
  hidden, a mini-game that runs fast and plays alone, one fact repeated, the chosen name nowhere, the Mount far away, empty and
  unclear, "הנח את אבן הפינה" after one tap, the frozen "בעוד 0:02", no music; look at how building games stage construction.
  Lesson: every suite was green while a real player on a phone failed — the tests played with autoplay hooks and the demo's ×60
  clock. New standard: real touch at 390×844 with no autoplay (test/real-play.cjs, game-touch.cjs, minigames-touch.cjs,
  site_mount.cjs). Seven agents (QA8B, DESIGN8B, SITE8B, FLOW8B, GAMES8B, MUSIC8B, FACTS8B); stopped at ≈ 11:07 UTC by the usage
  limit, integrated by the supervisor. Built: the boulders were buried under the drawn hill (a stale uCut morph) — fixed, every rock
  seen when struck; a close work camera on the Mount; a living site (gangs, an ox cart hauling rubble, the treadwheel crane, tools,
  stakes and cords, the levelled patches that grow, the spoil heap); a gold pointer and ring ON the target, a tap beside the rock
  strikes it; the panel says what a segment does ("▶ הביאו 8 אבנים"), a delivery beat before the next prompt; the name — "שלום,
  הכהן <שם>", a HUD chip, a plate over the hero, the coach uses it; live countdowns; the demo is never persisted (a v16 phone left in
  it is healed); 204 verified facts (content/facts.json) rotating per stage without repeats across sessions (loading screen, the
  precision games, idle tips); every precision game and the board playable by touch with a first-time how-to (nothing plays by
  itself outside #demo); an original adaptive score in WebAudio (src/game/music.js: kinnor, nevel, chalil, tof and a drone; build /
  board / precision / moment / night / Phase B); docs/STAGING.md + STAGING-he.md — how building games stage construction and the
  storyboard of the Mount, the wall, the gates and the altar.
- **Wave 9 ✓ (2026-09-28 evening, published v18)** Four agents (SITE9, FLOW9, QA9, DESIGN9; docs/WAVE9-BRIEF.md). QA9's real-touch
  rewrite of test/real-play.cjs found a P0 no suite had caught: **the match-3 board was dead to touch in the real game** (mounted
  inside `.gm{pointer-events:none}`; the touch test mounted it on the body and the other tests autoplayed it) — very likely the owner's
  "משחקון המחצבה תקול"; fixed (ui.css.js `.gm .m3{pointer-events:auto}`). Built: the 12 rocks in one field on the Mount's east shoulder
  (24 amot apart, `stages.boulderSpots()` with `.order`; old saves keep their indices); the pointer on every next target through a
  strike run and on the builder's banker in the courses, with a safety net that re-aims once when the target stays hidden; the Mount's
  walls phase framed — a working bay dug at the east face down to the first courses (illustration), the crane on the course, the stock
  and banker there, gangs at work; the corner stone hewn in the quarry game → an ox cart brings it → the crane sets it
  (`stages.deliverKeyStone`); one verb per game in every text ("הנח … במנוף", "חצוב", "סתת", "בחר אבנים שלמות"); stock arrives by
  cart; the wall's camera over the builder's shoulder; docs/STAGING.md §6–8 — the wall, the gates and the altar shot lists, rule 8
  (the stone is dressed where it is set), docs/staging-wall.svg. Tests: game-touch 19/19 on the merge, game-e2e phone 34/34 (updated to
  the new flow), game-harness 105/105.
- **v19 ✓ (2026-09-28 night, hotfixes from the owner's play of v18)** (1) The whole-Temple view lost the plaza on zoom-out: the
  game's site syncs (a crew's stone) rebuilt the Mount's site under the finished House — now nothing of the game reaches the world
  while the whole House is shown, and exitWhole resyncs. (2) "Too much yellow light" at the chapter's end (passing to the altar's
  yesod): the gestures' commit (0accecd) declared a one-argument `smooth` inside createStages, shadowing util's
  `smooth(e0, e1, x)` for the whole closure — the showcase's fade grew to ~200 (pins 800 amot tall, a yellow wedge over the screen),
  the vision's fade stuck at 0.12, and **the hill's cut stood still at 6 % through the Mount's courses**. Renamed (`ease01`), every
  smooth call checked for three arguments; the showcase also softened (a paler gold, a faint band, no hologram over the Mount).
  (3) "The builder vanishes in course 1 and 5; in course 2 he is far from the site, stuck; the stone hangs in the air": he stayed
  where his last job ended while the camera framed the working bay (after the great stone, after the bay moved on along the front)
  — now he re-walks when his banker moved (`hero.atXZ`), goes back to his work by himself when idle in the courses (`keepAtWork`,
  event `heroReturn`), and the camera returns to him when he is out of frame for 1.5 s after the first-time flow (`keepInFrame`,
  event `heroAim`).
- **Wave 10 ✓ (2026-09-28 night, published v20)** Five agents: PRODUCER10 (new), FLOW10, MIDDOT10, GAMES10 and NET10
  (docs/WAVE10-BRIEF.md). The verdict is docs/PRODUCER-S10.md; the producer's notes N1–N38 are on the bus, each answered by its
  owner. The owner's message to the agents ("…שימשיכו ככה ויגדילו ראש!!") was relayed word for word.
  - **FLOW10.**
    - The banker's flip, found: the Mount's front 0 also held the outer face of the Shushan gate's stairs (mount.js, x 295),
      and course 0 swallowed every deep row, down to y −148.
    - Slots are now only on the east face's own line (`harSlotOk`/`nextWorkIdx`), so the first slot sits at −64 and site_mount
      is 8/8.
    - A set stone stays in place (`L.pend`); the stock and banker stand where the pose will put them; the crane is posed again
      once the bay is dug.
    - The course check is framed: he walks to the course and measures with the plumb (`checkView`, `courseCheck`).
    - The corner stone's lift is framed from the hill.
    - `keepAtWork`/`bankerSpot`/`placeNext`; after the first-time flow the ring stays under his banker in the Mount's courses;
      the stale coach line is cleared; the name plate hides under sheets; 44-px chips.
    - test/game-courses-touch.cjs: part 2 is 10/10, with the builder on screen at 34/34 stones and no flips.
  - **MIDDOT10.**
    - 68 draft quiz questions (content/middot-quiz.json), each quoting its mishna word for word.
    - A quiz per chapter read: up to 5 questions, 10 points each. The final test: 10 questions, 20 points each plus 100.
    - Titles: "מסיים מסכת מידות" and "בקי במסכת מידות". One silver per 5 points, paid once.
    - 62 places are linked at their first mention in a mishna. A tap flies there (to the whole-Temple view when the place is
      not built yet), opens its card, and "חזרה לספר" returns.
    - Tests: middot-quiz.test.mjs; middot-touch.cjs 35/35.
  - **GAMES10.** "משחקי ביניים" in the menu (src/games/*):
    - ארבע בנדבך;
    - זיכרון הכלים;
    - מרוץ הכבש (Yoma 2:1, without the injury);
    - נדבך על נדבך;
    - שיר הלויים (Sukkah 5:4's instruments).
    Each is solo or a duel on one phone (the top half turned 180°; "תכלת" and "ארגמן"). Small fixed pay, six paying games a day,
    an invitation once a day after a stage (never in the first-time flow or the demo). games-touch: lab 71/71, real 8/8.
  - **NET10.** "כהנים יחד" on two devices of one Claude account, over the artifact runtime's `room`, with a BroadcastChannel mock
    for tests.
    - The partner's kohen with his plate and strikes, "+1 אבן", an edge chip that flies to him.
    - "יחד: N" and a gentle race sheet (מדויק / זריז, "יישר כוח"); a cheer every 10 stones.
    - net-together.cjs 28/28 (two pages).
  - **Integration:**
    - main.js hooks pass `showInfo`/`hideInfo` to the book's flights;
    - `api.hold` for the games' overlay;
    - toasts wait while an in-between game is open.
  - Bundle 2.64 MiB.
  - Published with `capabilities: {room: {topics: {cheer: 'interact'}}}` only. `db` would make the artifact organization-internal,
    with no public link (db.d.ts), so it is ⚑ for the owner.
- **Wave 11 ✓ (2026-09-29 morning, published v21)** Four agents: PRODUCER11, FLOW11, SITE11 and FUN11 (docs/WAVE11-BRIEF.md). The
  owner's compass was "כיף, מעניין ותקין", and he liked the kohen walking from point to point at his work.
  - **PRODUCER11** played every stage by touch: the wall start to end, every later stage from its start, and the finale into
    Phase B. The verdict is docs/PRODUCER-S11.md; the notes N39–N69 are on the bus, each answered.
    - produce-play gained `--jump='{"stage":…}'` (any stage), `--jumpReload`, `--stages=…`, and the K80 check at every shot.
  - **FLOW11.**
    - N34: a reopen lands on the kohen at his work on the first frame (`landWork`, `relanded`). There is no absence tour; the
      welcome card tells what the crews built.
    - keepAtWork, keepInFrame and bankerSpot now work at every stage (`workSite`, `curWork`, `workSpotAt`).
    - `fitHero`: every frame the game flies keeps him ≥ 80 px.
    - The course check at every walled stage.
    - A tap on the world while he works does his work (N67 had blocked the step before the finale).
    - N15, N6, N36, N35, N18, N41, N42, N65.
    - Tests: game-reload-touch.cjs; game-courses-touch `--part=wall`.
  - **SITE11.**
    - The working front at every site: `craneWorkPose`; the crane rolls along the course; rule 8's banker at the next slot's foot
      everywhere.
    - `siteWorkView`: working-distance frames. `frameBlocked`/`clearPose`: a clear line of sight.
    - `onPosed` for the reload.
    - Visible progress: the survey's stakes, the Mount's paving strips, the finish items stacking.
    - The altar: whole field stones and the wooden mallet.
    - The game table by the quarry. The rocks' camera at 18°.
    - Tests: site_wall_touch.cjs, site_corner_touch.cjs.
  - **FUN11.**
    - The quiz's longest-answer bias removed: 25 answers rebalanced, and a test guards it.
    - The daily Middot question folded into the learning points: three a day, 10 points each.
    - "איפה זה?": name the place the camera flew to, with the Mishnah's words.
    - A game for every stage, with its reason; a chip after the board; the table's sign; variety.
    - "כהנים יחד" N31: a closer look. `db` stays behind a flag.
    - A no-pressure walk through Tishrei 5787 (hooks-loop.test.mjs).
  - Bundle 2.69 MiB.
- **Wave 12 ✓ (2026-09-29 evening → 30.9 morning, published v22)** Five agents (docs/WAVE12-BRIEF.md): PRODUCER12, FUN12, SITE12,
  WORLD12 and AVODA12. All five were cut at 20:40 UTC by the account's usage limit, after ~2.5 h and 17–23 commits each. The
  supervisor integrated on 30.9 morning.
  - **The quarry's cycle and "הקלע של דוד"** (FUN12: src/games/cycle.js, sling.js; matter-js trimmed to 40 KB).
    - Every "▶ המחצבה" takes the next game: the sling, then נדבך על נדבך, then the board (round 2, longer and harder), then the precision quarry.
    - The sling has 10 levels, five stones each (שמואל א יז, מ). The last is Goliath, who falls, with no blood.
  - **The Mount shows its work from far at every course** (SITE12). The crest is cut in benches, the fill rises, and there are spoil heaps and carts.
    - The course → course change is 10–88 % of the Mount's pixels (v21: ~0 at courses 2–4).
    - At each course's end the game shows the whole Mount (`courseView`).
    - The clear line to the kohen at the digs (N74) and at the chambers' walks (N75).
    - A wooden mallet at the altar (N59).
  - **Rain by the Hebrew date** (WORLD12: src/weather.js).
    - None from Pesach until after Shemini Atzeret. About a third of winter nights. Decided per night by the date.
    - The moon at its phase on dry nights.
  - **The music with a pulse:** build 70 → 104.65 BPM, a darbuka and a motif, intensity from the work, and a `chag` state.
  - **The finale:** pilgrims from 8 named lands, lamps hung, and a night of light at חנוכת הבית (16 bowls on four golden menorot, Sukkah 5:2–4). No fireworks.
  - **Phase B** (AVODA12): the Levites' song of the day with the player as Ben Arza (Tamid 7:3), and five new moments of the day (chavitin, the gates' blasts, the 93 vessels, tomorrow's lamb, the closing of the gates). N69 fixed: Phase B greets him by his Phase A name.
  - **Gates on the merge:**
    - node tests: 21/21 files;
    - game-harness 106/106;
    - game-flow 12/12, game-touch 19/19;
    - games-touch 85/85, cycle-touch 20/20;
    - site_mount_courses: all pass;
    - finale-touch 14/14, music 74/74, moments 94/94;
    - avodah-harness 100/100;
    - produce-play over all 15 stages: K80 ✓ 24, ✗ 3. The ✗ are measuring quirks at the Mount's survey; the shots show him at about 90 px.
  - **Open:**
    - sling-touch fails at level 6: the test's aim finds no line to the last target. The node replay wins all 10 levels.
    - avodah-touch-w12: 6/8. The cymbal's early-tap check, and the run's 10-minute cut.
    - N76: the dig label above the yesod, the karnot's survey spot, and the crew's dark hammers at the altar.
    - N64: the corner stone on the hook.
    - docs/PRODUCER-S12.md is partial.
- **30.9 day (v23–v25, the supervisor)** The owner tests in the demo.
  - **v23:** "שלבים ▾" is a stage picker. A stage starts fresh with every stage before it built (`state.js demoAt`). A finished demo save opens the picker.
  - **v24:** the demo plays like the real game (`reelOn()`: only the investor reel, after "הרגע הבא ✦", keeps its curated behavior).
  - **PRODUCER13a's day pass:** docs/PRODUCER-S13a.md (top 12).
  - **v25 fixes from it:**
    - the demo's games wait for a touch;
    - the quarry's cycle plays in the demo;
    - `stages.js route()` walks a short step (≤ 20 amot) straight inside one region (the owner's "side to side": a 4-amah step made a 236-amah loop);
    - idle, he follows the crews' slot at most once in 8 s;
    - N77: the strip is below the coach's hand.
  - **Still for wave 13 (PRODUCER-S13a top 12):**
    - #3 N79: courses the crews finish get their toast, beat and plumb check;
    - #5 the plumb at the leveling stages;
    - #6 the hidden progress (Ezrat Nashim's chambers and gallery; the House's upper halves and gold);
    - #7 machines (one crane in the world today);
    - #9–10 the director's frames;
    - #11 the demo's stones per tap;
    - #12 the sling's fallback pull;
    - game-courses-touch part 1 fails 7/9 on v24 too: K80 77 px, and the Mount's slot off frame at s3.
- **Wave 13 ✓ (2026-09-30 night, published v26 on 1.10 morning)** Five agents (docs/WAVE13-BRIEF.md): PRODUCER13, SITE13, DIRECTOR13,
  GAMES13, SERVICE13. All five were cut by the account's usage limit at ~21:40 UTC with their work committed and no final reports; the
  supervisor merged the branches in the morning (service, games, site, director, producer: no conflicts).
  - **SERVICE13:** פיטום הקטורת at Beit Avtinas — weigh the eleven by the baraita's weights, grind to "הדק היטב" as a rhythm, the pinch of
    "מעלה עשן" (כריתות ו ע״א), the galbanum's lesson (כריתות ו ע״ב), Beit Avtinas' secret (יומא לח ע״א); the year's 368 manim feed the daily
    ketoret. The pens and the lambs' chamber: water, hay, tomorrow's need from the calendar (Sukkot's bulls 13 → 7, Rosh Chodesh), ≥ 6
    inspected lambs (ערכין ב, ה), tomorrow's musaf led out. The home's box "בית אבטינס והדיר". Real touch found a P1: the home's 20-s refresh
    threw the player back to the top (fixed).
  - **GAMES13:** חמש אבנים, שמונה אבוקות and מגדל האגוזים (duels on one phone, sourced facts). The level with the needle at the leveling stages
    (every course end at the Mount, the plaza's paving, the Ezrat Nashim's floor, the 15 steps, the altar's top: two level rounds, then the
    plumb). In the demo a picked stage's own game is offered after 25 s of calm. The sling's child pull.
  - **SITE13:** machines and life at every walled site (a crews' treadwheel crane, a shear-legs, a sledge on rollers, ox-cart trains from the
    quarry, also at the altar); the Ezrat Nashim's corner chambers rise one by one, each named; the gallery in cedar; the House's finish on the
    building (lintels, poles, the vine, the gold) and the Heichal's cedar doors. Walks in the Azara go by its aisles, never the hub's
    out-and-back (N87 44 → 42 amot, N90 230 → 44). The karnot are worked from the altar's top. N64: the key stone glows on the hook.
  - **DIRECTOR13:** every course end gets its moment whoever set the last stone (N79); every work frame is fitted to him (K80); a tracking shot
    on long walks; a pick lands at the new stage's survey stake; no frame through marble (N91); idle, he rests at his banker; the demo's one
    payment buys the three segments.
  - **PRODUCER13:** docs/PRODUCER-S13.md (partial): the K80 gate ✓ at the end frames of 11 stages. Still open: the pace (the first course end
    comes 3.5–4.5 min after a pick), and the ×1 working frame shows none of the crews' machines.
  - **Integration (1.10, v26):**
    - The Mount keeps its bay's own work frame. DIRECTOR13's blocked-line rule had sent it to a 66° close frame, a top-down 25-px kohen.
    - The Phase B touch tests touch a button once the home's sheet has risen and stopped.
    - Bundle 3,085,808 bytes (+104,846 on v25).
  - **v26 gates:**
    - node 244/244; qa-content-scan 12; game-harness 108; avodah-harness 99 + part 13 ✓; moments --harness 94; game-flow 12;
    - game-touch 19/19; game-courses-touch: part 1 7/9 (the same two as v24–v25: K80 72–77 px at s1–s3, the slot off frame at s0–s3), part 2 10/11 (v25: 8/11), the wall 6/6;
    - games-touch 85; games13-touch 28 (חמש אבנים ones → fours by touch); sling-touch levels 6–10 by touch 21; cycle-touch 20; minigames-touch 47; finale-touch 14; music 74; music-touch 10;
    - avodah-touch-w13 20/20 (פיטום הקטורת and the pens by real touch on the real build).
    - The K80 gate in the demo: every stage's end frame ✓ except the House. The Heichal's end frame is 44 px; the Kodesh is hidden behind the Heichal's marble (N91, already ✗ on v25); the Ulam's end frame has a worker in front of him.
    - The "jump" shots are the harness's state write (the owner's picker lands on him).
- **Wave 14 ✓ (1.10; v27 published 2.10 morning): the owner's daughter played on her phone (30.9 23:27).**
  - **Her four notes:**
    - **coins** by the task's difficulty, to buy things;
    - **the precise strike was unclear** ("השחקן לא יודע איך ועל מה ללחוץ כדי לתזמן מכה מדויקת");
    - **most important: more building work than dressing stones** ("זה ארוך ומשעמם, היא רק בורחת למשחקי הביניים");
    - **the kohen floats or sinks.**
  - **Part 0, the brainstorm (1.10 morning, at the owner's word "סיעור מוחות - כעת"):**
    - the supervisor's seed docs/BRAINSTORM14.md;
    - five lenses (FUN14, GAMES14, SITE14, ECON14, HISTORY14), in docs/brainstorm14/;
    - the vote page (artifact T9iqzBo9mQPYoPGXQf7Ufk) with the agents' 15 new ideas.
  - **Her votes:**
    - ❤️ on nine jobs: the gold, the saw, the column, Robinson's Arch, the snap-line, the letters, the treadwheel, the wheel, the rafts;
    - 👎 on the weave;
    - the ring for the strike;
    - five shop items.
  - **Part 1, the build (12:05–14:35 UTC, at "אפשר להתקדם עכשיו"; no agent was cut):**
    - **FUN14:** the course loop.
      - src/game/jobs.js: the registry, `J()` = clamp(round(10/C), 1, 3), and the deal "מה נעשה עכשיו?" (one stone card and one craft card, never the last job, "חדש!", the signature early, at most one key stone a course, an empty stock deals "▶ הביאו אבנים");
      - `share()` and playJob, and `G.jobs` (three ★★★ raise a job's level);
      - content.js DECKS, with her jobs in every deck where they fit;
      - the strike card "סתת בקצב";
      - snap.js (the snap-line opens every walled course), place.js (Robinson's Arch, then F1 "השלם את הנדבך") and wheel.js.
    - **GAMES14:** the jobs' games.
      - frame.js's drag channel, hold buttons, swipe cue, `game.tall` and the star floor (never ☆☆☆);
      - saw.js (and its duel on one phone), cover.js (gold, plaster, bronze), pull.js (the Stoa's column), tread.js, rafts.js and waves.js.
    - **ECON14:** coins and the shop.
      - The ring she chose, made legible: a fixed gold target, "עכשיו!", taught once in slow motion, and "מוקדם / מאוחר / מדויק! מכה כפולה".
      - PAY = stars × (level + 2), with the purse and the coins' flight.
      - src/game/shop.js "אוצר המלאכה": her five, plus the vine's gifts. Fixed prices, closed on Shabbat, opens with her first pay.
      - draw.js (her mark, and the letters "לבית התקיעה"), and pipes.js (the aqueduct).
    - **SITE14:** the kohen on the ground.
      - test/hero-ground.cjs: v26 had 2 of 15 stages within 0.2 amah (floats to +5.2, sinks to −3.0); now 11 of 15, with no float anywhere. The four left are walks across low objects.
      - floors as they build, stairs as stairs, footings;
      - `jobReveal`: every job leaves its mark in the building (63–108 draw calls).
    - **PRODUCER14:** docs/PRODUCER-S14.md, by touch, as she plays.
      - Before her first choice: v26 had 80 strikes and no choice at all; now 32 strikes, with a deal from stone 3 of the courses.
      - The ring teaches a perfect strike in 3–4 tries.
      - The arch ★★★ by touch.
      - K80 10 of 11 (the Heichal and the Kodesh, hidden in v26, now ✓; Ezrat Nashim hidden).
  - **Integration (1.10 afternoon):** the bundle is 3,245,477 bytes (3.10 MiB), and the budget is raised to 3.25 MiB (§3).
  - **Integration fixes (2.10 night, before publishing):**
    - **The course loop stalled at the Mount** on the merge (courses 4/9, 8/11, 3/7): the deal's sheet (z-index 6) covered the first wage's card, so its "המשך" could not be tapped. ui.js marks the root `.modal-open` while a card is up and ui.css.js moves the deal aside.
    - **The banker hung 12 amot in the air** when the Mount's bay opened (the bay opens over 2.2 s, uPitK; the banker was set at the old height) — and the ring with it. stages.js wpUpdate stands the banker on the ground as it is now (the floor also rises with the courses).
    - The rafts' and the waves' how-to hands; a held raft is never taken over by the raftsmen; an eager finger grabs the swinging stone.
    - Tests: game-courses-touch and fun14-jobs-touch play swipes and held buttons as a finger does (CDP touch), fun14-jobs-touch runs with __START_PAUSED like every touch test; game-harness follows wave 14's loop to the crane; the ring probe closes the loop's deal first and reads the ring once it is seen.
  - **v27 gates (build 9d06f75):** node 271/0; qa-content-scan 12/12; game-harness 108/108; game-touch 19/19; game-courses-touch part 1 8/9, part 2 10/11 (the slot/crane-in-frame read at s0/s16/s48/s64, v24–v26's own), the wall 7/7; jobs-touch 63/63; fun14-jobs-touch 13/13; econ-ring-probe 10/11 ("עכשיו!" read at the beat: a timing read on the slow machine); econ-shop-touch 9/11 (the coins' flight read 450 ms after the pay: the page is blocked ~20 s at that moment on the headless machine — probably the first sound's audio init; ⚑ to look at); hero-ground 11/15, no floating bases; game-flow 12/12; avodah-harness 117; moments 94; finale-touch 14; music 74; games-touch 85; cycle-touch 20; minigames-touch 47. K80 in the demo: part a 23/25 (the wall's jump frame, Ezrat Nashim hidden — N99), part b 19/20 (karnot's end frame 62 px).
  - **The owner, 2.10 02:52:** "תן בריף על כל ההערות שלי מתחילת השרשור, ותראה שהסוכנים פועלים בהתאם. יישר סדר ותקן את מה שצריך ותנפיק גרסה עדכנית" → docs/OWNER-NOTES.md (every note with its status; what "acting accordingly" means for wave 15), the fixes above, v27 published. 08:45: "שילמתי. אין מגבלת שימוש כעת. תמשיך בכל הכח והמרץ."
- **Wave 15 ✓ (2.10; v28 published 17:00 Jerusalem): "הכהן לומד מקצוע" — the kohen learns a craft; her Gardenscapes ideas as hooks over the game, not instead of it.**
  - **The owner's turn of the day** (docs/OWNER-NOTES.md): 08:45 "תמשיך בכל הכח" → five agents launched on docs/WAVE15-BRIEF.md (the stars-and-tasks loop, defaults standing); 10:13 "אני לא רוצה שנהרוס את כל מה שבנינו… רק לקחת ממנו רעיונות והוקים" → ⚑1 = add, not replace; 14:28–14:34, thinking together: "פעולות בנייה אחרות… לא רק סתת" → **the heart: the kohen learns a craft** — Josephus, Ant. 15.11.2 §390 (a thousand priests taught as stone-cutters and carpenters; verified verbatim by STORY15) — each craft an action IN the world, the stars a thin layer; "אל תתן לסוכנים להתפזר… ב-17:30 תפסיק" → narrow scopes, four agents finished and closed, everything stopped for Shabbat.
  - **SITE15 — המנופאי, the first craft in the world** (stages.js `// ── site15 ── המנופאי`, tread.js/frame.js small fences): the 'tread' job walks the kohen INTO the lifting crane's great wheel; the hold buttons turn the real wheel; the real block rises from the stock and swings over the slot; a release in the mark seats it (dust, sparkle); he walks back. test/tread-world.cjs 8/8 by touch (in the wheel d 0.0; K80 125 px; 81 draw calls; 3 stones seated; ★★★). The fallback (no crane, the demo, the lab): the sheet game as before. Also `taskScene` (the tasks' 3D scenes, 10/12 at the Mount) kept for the stars layer; the Mount's camera floor 8 over the ground in the survey and dig. The deck (v28): the wheel dealt at the Mount too and the wall's signature, so she meets it early; the card "המנופאי: גלגל הדריכה".
  - **STORY15 — content/tasks.json** (not yet bundled): 153 tasks for the 15 stages, 283 ★, 139 sourced lines + 14 המחשה, 8 choices, the mentor's lines; docs/STORY15-SOURCES.md (150 ✓ · 3 ?); content/stage_quiz.json (60 questions, for the next wave); content/REVIEW.md ⚑ 102–111; test/tasks.test.mjs 12/12.
  - **MATCH15 — the stars' sources (branch s15-match, merge-clean, NOT merged: it waits for the add-mode HUD):** `__BH_PARTS.stars.play(G,'level'|'quiz'|'game')`, the match-3 star mode with boosters for coins (15/20/10, one of each a level, closed on Shabbat), the quiz round (5 × 3, the source after each, ≥ 4 → ★), a ★ for a game's first win of the day; stars-touch 32/32. Also a v27 fix worth taking alone: page.html's `.hint` leak hid every level's teach line.
  - **META15 — the loop in "replace" mode (branch s15-meta; stopped by the owner before add mode was built):** the home HUD of the mockup, the tasks sheet, the migration — kept as the owner's preview (artifact Czcyjrckh4QL8Ek1PtUqnj, the five branches merged as of 08:20) and as the base for add mode next wave.
  - **PRODUCER15** (docs/PRODUCER-S15.md): המנופאי seen in the world ("real"); the 'replace' loop works end to end on a fresh save (first ★ at 150 s) but is the mode the owner declined; v27 baseline: the first choice at 3:20, no course end in 10 minutes; scenes 60/84 at K80 (nashim, lishka, guf framed from outside the walls). Top: the next craft by the same pattern; hands on the rim and work-dress; frames inside the court.
  - **v28 gates (build da8793c, 2.10 16:15–16:35 Jerusalem):** node 283/0; qa-content-scan 12/12 (3.12 MiB); tread-world 8/8 by touch; game-touch 19/19; game-courses-touch wall 7/7 (the deal key+tread), part 1 8/9 (the deal tread+column→column; the slot/crane read as before), part 2 10/11 (the same read); game-harness 108/108; jobs-touch tread 7/7 (the lab's fallback); hero-ground 11/15, no floating bases; game-flow 12/12. The rest of the suites ran green on v27 the same morning and no file of theirs changed except through SITE15's fences.
- **Wave 16 ✓ (3–4.10 night; v29 published 4.10 07:40 Jerusalem): the screen is the tool — at the owner's notes on v28 (docs/OWNER-NOTES.md, docs/WAVE16-BRIEF.md).** Two agents (FLOW16, SITE16), cut at ~23:20 UTC by the model's limit after their work was committed; the supervisor merged and ran the gates.
  - **FLOW16 — the balance:** the deal is dealt whatever the stock (his hands never wait; up to 4 hand stones a job); when the stock is out the crews wait and the pill says so ("המלאי: 0 אבנים · הצוותים ממתינים · הכהן ממשיך"), with one extra card "▶ הביאו אבנים · כ־N אבנים · לוח של ≈ 3 דק׳" — the board opens only from it; the pill never opens a period game (fun12's cycle retired from it); the snap-line once a stage; no rest card while his hands can work.
  - **FLOW16 — src/game/hands.js (`runInWorld`):** a craft played in the world — gestures on the 3D canvas (a finger right/left of the kohen = his feet in the wheel; a drag/rub in the work's screen box), the coach's hand anchored at the work, a small meter, the float and the mentor's line; no sheet, no card. minigames/index.js routes a kind to it when `world.craft[kind]` exists and the site is live (not the demo, not `__MG_AUTO`); the sheet stays the lab's and the fallback.
  - **SITE16 — `stages.craft = { tread, saw, line }`:** המנופאי (SITE15's wheel), **הנסר** (the bench, the log, the blade, the kerf; the log parts, the planks to the pile) and **המודד** (the dyed cord from the stake to his hand, lifted and snapped, the chalk line left); `dustBurst`/`sparkBurst` on the API. **The life layer** (crews.js `// ── site16 ──`): ~28 at the active stage (bankers, carriers, the crane's crew, the quarry road, sawyers, a surveyor pair, a foreman), 3–4 at the last finished stages; a tap: "הצוות של <name>" / "פועלי הורדוס · המחשה"; 0 new draw calls.
  - **v29 gates (40dabcb + c4babd3):** node 283/0; qa-content-scan 12/12 (3.15 MiB); hands-touch 14/14; craft-world 18/18; life 9/9; game-touch 19/19; courses wall 7/7, part 1 8/9 (the slot/crane read as before); cycle-touch 8/8 (the balance); game-harness 111/111; game-flow 12/12 (its driver fitted to the balance); hero-ground 11/15, no floating bases.
  - **Open:** the saw and the line are dealt where their jobs are in the decks (saw: wall, gates, nashim, lishka, ulam–kodesh; line: once a stage); the workers cluster round the active bay — the Mount's other faces and the plaza still thin; the thin stars layer (MATCH15's branch, META15's add mode) waits.
- **Wave 17 ✓ (5.10 evening): the Mount in landscape with two thumbs — at the owner's decisions of 5.10 (docs/PRINCIPLES.md, docs/WAVE17-BRIEF.md).** v29 kept first at the owner's word ("את הגרסה הנוכחית שמור"): tag `v29` (c4babd3), branch `v29-base`, the built files in /home/claude/archive/v29; the main game artifact stays at Version 29 and wave 17 is a separate preview artifact (https://claude.ai/artifact/DWoQSjEyXnGtPH3eQF1bJF, published 5.10 23:35 Jerusalem from tag v30-twin). Two agents: TWIN17 (Opus) and LAND17 (Sonnet); the supervisor's own play (test/kid17.cjs: a fresh save that follows only the screen) found the crane's sheet in the first-time flow, a lock of the thumbs around the course events and the coach's bubble over him — TWIN17 fixed them in two short rounds.
  - **TWIN17 — src/game/twin.js:** the mode (landscape ≥ 640 px, stage `har`, live; `.gm.tw-on`, the `twin` event; `?twin=0`); the floating stick; the work button by place (pips 3, ≈ 1 s refill), "יד של אומן"; the follow camera (one bearing, 57°, 30 amot, a lead, pinch out, the stick brings it back; `cam: 'director'` = today's frames); four answers on touch-down; the deal as markers in the world (only where his feet can reach), the edge arrow (never in the thumbs' zones); `hero.drive` (no climbing over an amah, rocks/crane/stock stop him, he always gets out); the first-time key stones, the quick lift and the course check in the world on the button (no sheet); only cards hold the thumbs.
  - **LAND17:** the landscape shell (the zones, sheets as a side panel, ≥ 44 px, the dock folds into the menu under tw-on); settings `cam` (follow/director) and `popups` (show/book — info cards become "נוסף לספר"); `ui.stamp`, `ui.banner`; the work music (124 BPM, B Dorian) with `music.cue('workStart')` (a hush, the stinger on the beat), level trims (effects 6–10 dB over the bed), a soft clip.
  - **Gates on master (949c202 + the land-hud fix):** node 293/0; qa-content-scan 12/12 (3.20 MiB); twin-touch 36/36 (one run 35/36: the pips read raced the refill); land-hud 42/42 (2 of 3; one run 39/42 on UI timing); music-loud 42/42; game-touch 19/19; hands-touch 14/14; game-harness 111/111; game-flow 12/12; courses wall 7/7; kid17 at 844×390: sheets 0, errors 0, first work at 49 s, the dig, the special stone, the key stone, the courses by the button.
  - **Open:** jobs with no look in the world yet (arch, column, the course's finish, letters) are played on the button "blind"; taps are near-always ★★★ (a timing ring on the button if too easy); walls are not see-through; a marker behind the crane needs a walk around it; "סתת בקצב" still hangs on the ring.
- **Wave 18 ✓ (5–6.10 night): v30 "אבן הפינה" — the first good version, in landscape with two thumbs (docs/WAVE18-BRIEF.md). Published 6.10 ~07:20 Jerusalem as a separate artifact: https://claude.ai/artifact/9qrAnEpw1u1CtTRFnM6A6U (tag v30; the built file in /home/claude/archive/v30).** At the owner's notes on the preview ("הרבה יותר מגניב ככה… הנקודות לא נצברות למעלה… הפניות למלכים לספר המידות… למעלה… תעברו שוב על ברול סטאר… כנ"ל המוסיקה"). Four agents: TWIN18 (Opus, TWIN17 resumed), JUICE18 (Opus), HUD18 (Sonnet), MUSIC18 (Sonnet).
  - **TWIN18:** two thumbs at every stage of the site (see-through by screen-door in the cone to him, slide round rocks/cranes/stock, markers only where reachable, the button does what the pill does), the timing ring on the work button (gold ±85 ms, good ±200 ms; quality capped by the touches' grades), `juice.hit`; a drag craft's stroke at 60 steps/s whatever the frame rate (the merge's slower frames had stopped the plaster and the bronze).
  - **JUICE18 — src/game/juice.js, src/game/craftxp.js:** the study of both recordings (no hit-stop, numbers 50→115→100 % in 6–7 frames, a 1-frame tint decaying over 28 frames → our gold flash, never red; end-screen pops ≈ 9 frames, bars 20–25); every "+1" flies to the craft's points at the top (levels 10·25·50·100·175·275, `G.xp`), coins fly to their chip; `juice.result` (stars one by one), the level-up stamp, `juice.big` for a course (3.2 s) and a stage (4.2 s).
  - **HUD18:** the landscape top bar — the five tabs visible (☰ keeps the settings), the counters at the top left with the craft's slot, `ui.counter/bump/hold/xp`; cards and moments above the thumbs (z 8).
  - **MUSIC18:** the sound names (xpTick ladder, levelUp, perfect/good/soft, starPop, flyIn, tab, big), per-play variation, the work's layers by acts per second (0.35/0.9/1.8; leave at an 8-bar edge), `music.flourish` on the beat; the shir's lane tempo kept.
  - **Gates on master 8c855a6:** node 293/0; qa 12/12 (3,400,253 B = 3.24 MiB — 7.6 KB under the cap); twin-touch 40/40; twin-stages 81/81 (three groups, all 13 stages besides the Mount's own test); juice-touch green (the heap check noisy once: +829 KB, then −144 KB); hud-top 54/54; land-hud 42/42; music-loud 75/75; game-touch 19/19 (the known banker flake 1 of 2); hands-touch 14/14; game-harness 111/111; game-flow 12/12; kid17 fresh: sheets 0, errors 0, first work 40 s, through the Mount's first course to the quarry board.
  - **Open (⚑ defaults stand):** the level pace (one job ≈ level 3 — fast), the quarry board is still a full screen (by choice), "+1" only in landscape, the bundle's last 7.6 KB.
- **Wave 19 ✓ (6–7.10 night): v31 — the crafts come alive (the owner's 23 notes on v30; docs/WAVE19-BRIEF.md, docs/FUN19.md). Published 7.10 ~08:10 Jerusalem as a separate artifact https://claude.ai/artifact/K1rRSh63JozXMujFVphvj4 (tag v31; dist/play.html as index.html for the owner's GitHub page).** At the owner's 01:31 the wave ran in phases: RESEARCH19 wrote FUN19 (binding, approved by the supervisor), the crafts and hooks built by it, RESEARCH19 kept the fun (reviews on the bus), NAV19 the stick and the walks. The user stopped the agents once (~00:20 UTC; TWIN18's long agent cancelled); a new CRAFTA19 took the early crafts. **Lesson:** SendMessage resumes in one message run one after another, not in parallel — launch parallel work with Agent calls.
  - **The rule (FUN19):** touch → the kohen's act ≤ 50 ms → impact ≈ 90 ms → the "+N", the world's answer, the sound on the impact frame; nothing without a touch; the ring ≥ 110 px on the beat (gold ±90/±120 ms); points 10/20/40/50.
  - **CRAFTA19:** the rocks (raised ready pose, a blow per HP, the split +60), the survey (the cord paid out to 500 אמה, מדות ב, א), the treadwheel by swipes (the wheel turns, the rope coils, the stone rises), the dyed cord (tension, straight, the red line printed), the key stone on the crane (hold to lower, the shadow, the brake, soft landing), dressing (the margins), the column (heaves on the beat).
  - **CRAFTB19:** DECKS `sig` per stage; rub (plaster, bronze, gold) graded by the thumb's path; the saw (push and bite, the log across the view); the plumb (the hammer stowed); the craft camera closer (cbCam) and the view fully clear while crafting; one-line coach. Not built: arch/F1, pipes, waves, the well's wheel, letters (W20).
  - **NAV19:** the stick reads the real camera (the reversed stick); the overview "מבט על"; the compass brings him to work (a dash or a fade); the walk audit (18 walks; the needless ones gone); portrait turns two thumbs off at once; the wall seen from its outer side (plan B; plan A — on the wall's top — W20); the walking tip retires after 3 walks.
  - **HOOK19:** the work music at 124 BPM at every stage, day and night; the master score (10/20/40/50, bonuses) and the dinar every 10,000 (kept, titles); match-3 on a landscape phone (41–43 px cells); the tabs that call (nudge.js); learning pays (★500, the book star, "שאלו בבית").
  - **RESEARCH19:** docs/FUN19.md, docs/ENGAGEMENT19.md, docs/PHASEB-CONCEPT.md (recommendation: Phase B as one day of a kohen's service in the 3D world after wave 20; the first slice "הבוקר").
  - **The bundle cap is 5 MiB** (ours; 3,518,949 B now).
  - **Gates on master 22c76dd:** node 324/0; qa 12/12; twin-touch 40/40 (CRAFTA19 on the merge); craft-feel rock/tread/cord/key 28/28, survey green, banker/dress/column 9/10 (the banker's first fall 218 ms on SwiftShader, median fine); crafts-world 22/22; nav-touch 19/19; hud-top 54/54; land-hud 41/42 (the plain-landscape deal sheet's known timing race); juice-touch 7/8 on its job part (the saw: 8 points for 13 taps — FUN19 scores acts, not touches; the test's rule is older); music-loud 75/75; game-touch 19/19; hands-touch 14/14; game-harness 111/111; game-flow 12/12; kid17 fresh: sheets 0, errors 0, the survey's 500 אמה, the dig, levels, the special stone, the courses.
- **Next (wave 20):** the landing beat (key stone), F1 at sorag, pipes, waves, the well's wheel, letters; plan A at the wall top; the stage set pieces of FUN19 §3; a playtest with the children (the first dinar's minute).
  - Crafts by המנופאי's pattern, one at a time, each verified by a real-touch probe like test/tread-world.cjs: **המודד** (the surveyor walks between the stakes and stretches the cord — the snap-line in the world), **העגלון** (the ox cart down the quarry road, the rafts' steering on the real road), **הנגר** (the saw at the crews' bench, the arch's wooden frame), **המצפה** (the gold on the real gate), **המהנדס** (the plumb and level at the course — the inspection, already in the world), **מהנדס המים** (the aqueduct's pipes along the real channel). The kohen changes tool and work-dress per craft; hands on the rim for המנופאי.
  - Add mode (bus/OWNER15.md's eight points) on META15's branch: the ★ chip, "משימות" in the dock, the milestone sheet with "done by hand" marking and "הצוות יעשה" for ★, the row "עוד דרכים לכוכב" inside it (MATCH15's level, quiz, games), one mentor bubble after the first deal; v27's HUD untouched; all v27 gates unchanged.
  - Then the previous list (wave 14b's) as it stands.
- **The former plan for wave 15 (kept for the record): the game in the style of Gardenscapes (the owner and his daughter, 1.10 18:22).** docs/STARS15.md (the design), docs/WAVE15-BRIEF.md (five agents: META15, MATCH15, STORY15, SITE15, PRODUCER15), the home mockup (artifact WGwzGNqiEyvCX7vpTQ8Z9Z). Four ⚑ for the owner, each with a default: replace the old main path (default yes; the code stays, hidden); lives (default none); star sources (default all: a match-3 level first, the quiz, the period's games, wave 14's jobs); when (default: at once). Wave 14b's list below folds into it.
- **Wave 14b's list (PRODUCER-S14's top 10, and what each agent's NEXT: line left) — now inside wave 15:**
  - **The Mount's first minutes:** 24 rock strikes before her first choice. Make the dig a card, or clear 6 rocks in the tutorial; her first deal by minute 2.
  - **Not yet reached:** the snap-line also opens a stage's first deal; the letters become the last course's first card.
  - **The deal:** never a stale site's (N98); it must not hide him.
  - **Coins:** ≥ 30 from her work by minute 6.
  - **The shop:** her five on the first screen of אוצר המלאכה.
  - **The treadwheel and the gold** must be finished by touch in 20–30 s on a slow phone.
  - **Ezrat Nashim's frame** hides him (N99).
  - **The demo strip** covers world pointers (N96).
  - **SITE14:** the low obstacles (15 of 15 in hero-ground), and site_mount's slot and crane in one frame at har.
  - **Still owed from earlier:**
    - the opening film (paid; the owner chooses the tool);
    - "כהנים יחד" on two real phones;
    - multiplayer, each player building his own segment (the owner: "לשלב הבא");
    - the older backlog (links and radio, Phase B through a teen's eyes).
- **Earlier backlog** Moments: read `ctx.repeat` (core step only on replays, HOOKS ⚑R3-3); a visible "waiting" pose for crews at a
  blocked site (`setCrews(id, n, ids, {waiting})`); the Heichal polishing moment inside the gold interior
  (`momentFX('inside'|'outside','heichal')`, docs/SCENES.md); the kiyor sinking by the mukhni (needs its own mesh);
  a per-look `controls.minDistance` for mini-game close-ups (main.js:48 — re-check every mini-game's framing);
  the menorot lights kept in the scene at 0 so night never recompiles (life.js); short leads for tour cards over 50 words;
  owner decisions (REVIEW.md ⚑ checklist, 59 items with defaults).
- **Sprint 3** Pilgrims & offerings loop + Shabbat / Rosh Chodesh Musaf.
- **Sprint 4** Meta: mishmarot guilds, ranks, collections, festival events, notifications design.
- **Sprint 5** Store readiness: accounts, cloud save, push, analytics, Capacitor builds, store assets;
  investor deck + trailer captured from the engine.

## 9. Agent roster (spawned per sprint by the supervisor session)
Usage notes (learned 2026-09-27): the account's usage limit stopped wave 6 three times (08:30, ≈ 12:00 and 22:26 UTC). So: a common
brief + a notes file per agent on a bus, commits every 15–20 minutes, reads by ranges, short outputs, no sub-agents inside agents;
a fresh agent resumes a role from its notes and its branch. Never spend on paid services (image / video / voice APIs) without the
owner's explicit approval.
Orchestration notes (learned 2026-09-25): fresh `Agent` calls in one message run in parallel; resuming finished agents with
`SendMessage` runs them one after another (each call waits for that agent), so parallel rounds use fresh agents with a full brief
(the repo docs carry the context). Each agent gets its own git worktree/branch; the supervisor merges. Keep at most ~5 agents
with browsers on this 2-core machine.
| agent | inputs | outputs | done when |
|---|---|---|---|
| Content & halacha | Sefaria API | `content/*.json` + `content/REVIEW.md` | every item has exact quote + ref, status draft |
| Calendar engine | this file | `src/calendar.js` + `test/calendar.test.mjs` | `node --test` green, no deps |
| 3D engine & world | src/*, this file | `src/stages.js` + edits, screenshots | stages build visibly on phone & desktop |
| Game systems | 2D game.html | `src/game/*` + harness | flows pass: stage start→taps→done, expeditions, save/load |
| Sanctuary (S2) | places.js, Middot 4 | `sanctuary.js`, temple.js edits | walk into the Heichal; vessels, parochot, Kodesh HaKodashim |
| Life (S2) | places.js | `animals.js`, `actors.js`, `avodah3d.js`, life.js edits | §12 `world.avodah` works in a test scene and the world |
| Avodah (S2) | content/, calendar.js, §12 | `src/avodah/*` + tests | the morning Tamid playable end to end, live + practice |
| Hooks (S2) | the game, research | `docs/HOOKS*.md`, playtest bots, hook code | boredom map + fixes shipped, Phase B hooks spec |
| QA | builds | screenshots, perf numbers, content-vs-approved check | no errors, ≥ 30 fps target on phone profile |
| Supervisor (main session) | all | merge, integration, publish, Yaron's approvals | — |

## 10. Artifacts (all private to Yaron until shared)
- **Game** (3D, Sprint 1; the full source tree is stored alongside it under `source/`): https://claude.ai/artifact/46bgWDHedDV54kemeFVtvM
  (the old 2D beta 4.0 is kept in the repo at legacy/game-2d-beta4.html)
- 3D visualization showcase v1 (Sprint 0 source under `source/`): https://claude.ai/artifact/E4Fcs6LrJGJy5pSkQGKa1A
- Art-production spec: https://claude.ai/artifact/BwowYTtC5TFNCESZykcU4f
To restore the source in a new session: Artifact `list` with scope 'files' on the GAME artifact, `read` each
`source/...` path, then `npm i three esbuild` and `node build.mjs`. Browser tests need
`NODE_PATH=/home/claude/.npm-global/lib/node_modules` (or wherever playwright is installed).

## 12. Phase B world contract (Sprint 2)
**Additions since wave 3 (2026-09-25):** see docs/SCENES.md §4 (all backward compatible) — `sanctuary.anchor(id)`,
`focus('heichal-gate' | 'parochot-south' | 'parochet-front')`, `enter('heichal', {via: 'wicket'})` (Tamid 3:7; ⚑ option),
`state.menorahAxis`; `animal.partPosition(part, side)` / `facing` / `forward` / `scale`; `lambsChamber.positions()` /
`pick(ray)` / `animal('lamb', 'lambsChamber', {index})`; `kohen().walkTo(place, {speed, maxSec})`;
`avodah.yomKippur(step)` / `ykState()`; walks, tweens, waits and fades run on the wall clock with backstops (every promise
resolves). Phase A: `stages.momentFX(kind, arg)` (docs/MOMENTS.md); crews `stages.setCrews / setQuarry / caravan / trainees /
crewsCheer` (src/crews.js, docs/CREWS.md).
**Wave 4 (2026-09-26):** `stages.crane(out)` → `{site,x,y,z,carry}`, `stages.scaffold(id)`, `stages.vineState()`;
`setVine(n | {leaves,grapes,clusters}, vine, {demo})` (hung after the Ulam, grown in demoMode); `momentFX('inside' |
'outside', 'heichal')`; `sanctuary.enter(room, {force})` (for a moment only); main.js view offset also for a panel docked at
the right (`viewOffX`) and for the scenes panel on desktop; `__T.render()` moves the camera before the world updates.
The Avodah bridge (src/avodah/world.js): `anchor(id)`, `lambs()`, `pickLamb(x, y)`, animal handles with `part(p, side)`,
`facing`, `position`, `scale`; interact3d targets can follow a moving point (`at` as a function) and `fit(ms, {pts, dir})`.
Coordinates: `src/places.js` only. Every function below may be missing while agents work in parallel, so callers
wrap every call (see `src/game/index.js` → `has()` / `call()` / `settle()`) and the flow must continue without it
(a card, a camera move, or nothing). Promises resolve when the motion ends; they never reject for a missing part.

**`world.sanctuary`** — `createSanctuary(ctx)` in `src/sanctuary.js` (owner: Sanctuary agent)
- `enter(room)` room ∈ `'ulam' | 'heichal' | 'kodesh-view'` → Promise. Camera walks in through the Ulam and the doors;
  the interior becomes visible (culled when outside). `'kodesh-view'` = the watch-only Yom Kippur view.
- `exit()` → Promise (back outside, to `SHOTS.ulamSteps`).
- `setLamps(levels[7])` 0 = out … 1 = full flame (index 0 = the western lamp as the content defines it).
- `setGoldAltar({ coals, smoke })`, `setParochot({ outer, inner })` (0 closed … 1 folded open), `setDoors(0…1)`,
  `setBread('full' | 'empty')`, `setBezichin(on)`.
- `highlight(id | null)`, `focus(id, ms)` → Promise, `pick(raycaster)` → `{ kind: 'vessel', id } | null`.
  Ids: `menorah shulchan gold-altar parochet even-shtiya ulam-tables kiyor mechanism lambs avtinas salt parva rinse`.
- `update(dt)`.

**`world.avodah`** — `createAvodah3D(ctx)` in `src/avodah3d.js` (owner: Life agent)
- `kohen(id, { garments: 'kohen' | 'gadol', role })` → actor `{ walkTo(place | [x, z]) → Promise, face(target),
  carry(item | null), pose(p) → Promise, remove() }`. Items: `machta mizrak kaf bazach teni kuz limb salt log lamb oil
  trumpet bread`. Poses: `stand lift pour throw bless bow kneel`.
- `animal(kind, at, opts)` kind ∈ `lamb ram goat bull calf dove turtledove` → `{ leadTo(place) → Promise,
  inspect(on), hide(), remove() }`.
- `slaughter(animal, at)` → Promise (stylized per §2.9; ends with blood in the mizrak).
- `sprinkle(corner, level)` corner ∈ `NE SW NW SE`, level ∈ `lower upper yesod` → Promise.
- `limbs(step)` step ∈ `kevesh salt fire` → Promise. `libation(kind)` kind ∈ `wine water` → Promise.
- `trumpets()`, `levites(on)`, `blessing(on)`, `bow(on)`, `fire(level)`, `smoke(level)`.
- `pilgrim(offering)` → handle (a pilgrim with an animal entering through a gate), `pilgrims(n)`.
- `birdOffering(kind)` kind ∈ `olah chatat` → Promise. `pens.fill(n)`, `lambsChamber.count(n)`.
- `update(dt)`.

**`world.look(p, t, ms)`** → Promise (camera flight; in main.js `avodahWorld()`; portrait screens get a farther, higher
shot, and on phones a view offset keeps the subject above the bottom panels). `SHOTS` in places.js has hints.
As built: `sanctuary.pick` also returns `dist` and `box`; `sanctuary.setLamps` numbers lamps by NAME (0 = "the western
lamp", 1 = the easternmost, 2–6 westward) while the gameplay counts west → east — the bridge src/avodah/world.js maps
them by `lampPosition(i)`. world.avodah extras: `ambient(on)` (cleared during a service), `kohen().place/wash/look`,
`animal('lamb', 'lambsChamber')` (one of the six), `leadTo(p, {by, speed})`, `pick`, `wait`.

**Phase B gameplay** — `createAvodah({ world, root, onEvent, options })` in `src/avodah/index.js` (owner: Avodah
agent), `start()`, `stop()`, `frame(now)`. Save key `bh_avodah` (v1). Reads the Phase A save (`bh_beta2`) for the
player's name, mishmar and trained priests, read-only. The supervisor wires the entry point into main.js / game UI.

## 13. How agents work (Sprint 2 on)
- Each agent works in its own git worktree and branch under `/home/claude/wt/<name>` (node_modules is a symlink).
  Commit small, working steps to your branch. Never commit `dist/` or `test/out/` (ignored). The supervisor merges.
- **Own only your files** (listed in your brief). Anything else: write the request in your final report instead.
- The machine has **2 CPU cores and 7 GB RAM** shared by all agents. SwiftShader is slow: iterate in a small test
  scene or a small viewport (e.g. 640×360, `__FORCE_Q='normal'`), render the full world only for final checks,
  keep at most ONE browser open, and always close it (`await b.close()` in `finally`).
- Hard stop at the time in your brief: stop starting new work, make the branch build and pass its tests, commit,
  and report (what was done, files, how to test, screenshots, open questions, requests to other owners).

**Wave 6 (2026-09-27), all guarded, details in the docs:**
- **stages (SITE, docs/SITE.md):** `siteInfo(id)`, `setWork(id, {phase, stones, ghost, stock, dressing, finish})`,
  `liftStone(id, opts)` → Promise, `nextSlot(id)`, `slots(id, course)`, `workSpot(id, 'dress'|'set'|'survey'|'quarry'|'stock'|'yard')`,
  `frontView(id)`, `setQuarryStock`, `ashlar`. `setStage(id, 'building', p)` still works.
- **stages.hero (PEOPLE; fenced `// ── hero (PEOPLE) ──` in stages.js):** `act(kind, target, opts)` → Promise at the contact frame,
  `onImpact(cb)`, `contact(out)`, `workpiece(state, at)`, `busy`.
- **crowd:** `setScene(kind)`.
- **world.water (WATER):** `kiyor({spigots, flow})`, `wash(kohen | position | 'twelve')`, `washTogether({n})`,
  `pour('shirayim'|'wine'|'water', opts)`, `shirayimSpot(corner)`, `mukhni(down)`, `channel(on)`, `waterMaterial(opts)`, `state`.
- **Phase A parts:** `createGame({ parts: { match3, kings, minigames, … } })` (main.js `// ── build6 ──`); `hooks.pauseWorld` holds
  the 3D loop only under a full-screen board or court. Test hooks `__M3_AUTO`, `__MG_AUTO`. Save v6 keeps `G.m3`, `G.kings`, `G.fun`.

**Wave 7 (2026-09-28):** `stages.vision({ms, restore, to})` → Promise<{skipped}> and `visionSkip()` (city.js `BEAUTY.vision`, the
'golden' light preset — never picked by the real clock); `stages.hero.gesture('gotit'|'proud'|'wipe'|'think'|'stretch', {hold})`
→ Promise, `hero.gesturing`, `hero.look({skin, hair, beard, avnet})`, `hero.view(dist, el, 'shoulder'|{az})` → {p, t};
`S.nextAction(G, {deal})` may return `{kind:'deal', …}` (KINGS' `bestFor`); `S.crewEta`; hooks/dig.js ("חפירת היום").

## 11. Decisions log
- 2026-09-29 morning — **Wave 11.** The ⚑ defaults were applied (the owner may reverse any):
  - A reopen goes straight to the kohen at his work, with no absence tour.
  - The camera leaves the player alone for 6 s after a drag, and 15 s after a far one.
  - A tap on the world while he works does his work.
  - The kohen comes first in a crowded frame.
  - Illustrations: the crane rolls along the wall with its stock; the paving grows west of Solomon's portico; the game table
    under an awning by the quarry.
  - The rocks' camera is at 18°.
  - The daily Middot question pays 10 learning points; "איפה זה?" pays 5 a place.
  - One game per stage; a chip after a board at most every 10 minutes.
  - כהנים יחד: `db` stays off.
  - The wall's corner at ⚑W moves to wave 12.
- 2026-09-28 night — **Wave 10.** The ⚑ defaults were applied (the owner may reverse any). The full list is in the agents' reports
  and in docs/PRODUCER-S10.md.
  - Quizzes: chapter quizzes of up to 5 questions at 10 points each; the final test at 20 points each plus 100; one silver per
    5 points; titles that are never taken back.
  - Place links: at the first mention in a mishna; a place not yet built shows in the whole-Temple view.
  - In-between games: fixed small pay, six a day; the invitation once a day.
  - Duel players: "תכלת" / "ארגמן".
  - כהנים יחד: presence only (`room`) on the main artifact; a cheer every 10 stones with no reward.
  - The rocks' camera stays at 28°.
  - The crane game's moment is gold.
  - The owner approved a producer agent in every wave (21:42).
- 2026-09-28 Wave 7 defaults applied (owner may reverse): the opening vision once per new game; a 3★ board pays a third segment for
  its own site; crews set stones while a board is open; a king's deal first when bronze is short; the hero in the kohen's white linen
  with the avnet; the dig of the day as a ten-find season. New ⚑ lines: docs/BUILD-he.md, docs/PLAYTEST-S7.md.
- 2026-09-27 Owner: two goals — a stunning, real world (sky, clouds, the Old City and its walls, people at real activities, flowing
  water and drainage) and Phase A as a long, deep construction game where the player is manager, developer and engineer; a fun/UX
  owner with a teen's eyes. His daughter's idea, adopted: a Temple match-3 before every step (≥ 3 minutes, rising levels, the prize
  is the material itself), quarry / cedar / gold, trade with the kings of the nations, a resource meter, free choice of the next stage.
  Later: links to favourite sites and an in-game radio. No paid asset services without his approval. Wave-6 ⚑ items: content/REVIEW.md
  (⚑ 60 on), docs/BUILD-he.md, docs/PLAYTEST-S6.md §6.
- 2026-09-23 Façade: four engaged columns from the Bar Kokhba tetradrachm (schematic) — pending approval.
- 2026-09-23 Walls: marble courses "כי אידוותא דימא" without full gold plating (Bava Batra 4a; Josephus
  describes gold) — pending approval.
- 2026-09-23 Wall heights, porticoes, Royal Stoa from Josephus — pending approval.
- 2026-09-23 Tech: stay on three.js web build; Capacitor for stores; no GPL.
- 2026-09-25 Owner: build everything that is missing (offerings, animals, pens, slaughter, ketoret, the house inside,
  Menorah, Kodesh HaKodashim, parochot, kiyor) into the game; a dedicated hooks agent. Drafts until approved.
- 2026-09-25 Ark: not in the Second Temple (Yoma 5:2) — Even HaShtiya + the hidden-Ark mystery (Shekalim 6:1–2).
- 2026-09-25 Kodesh HaKodashim: built; the player never enters; seen only in the watch-only Yom Kippur scene.
- 2026-09-25 Shechita: shown with dignity, no gore (§2.9).
- 2026-09-25 Places: vessel positions along the Heichal, the lambs' chamber corner, the north chambers, Beit Avtinas
  and the pens are illustration choices (places.js `illus: true`) until the content agent confirms them.
  Content agent's findings (docs/CONTENT-S2.md): the vessels' source is Yoma 33b (not Menachot 98b); DESHEN_PLACE per
  Tamid 1:4 is ~10 amot east of the kevesh (z ≈ 32.5) — fixed in places.js; the Menorah stone "before the Menorah" depends on its
  orientation ⚑; Kodesh HaKodashim walls gold (Middot 4:1 "the whole house") — needs_check.
- 2026-09-26 #demo never shows night or rain (dusk instead), like the first minutes of a new game; Phase B keeps the real sky.
- 2026-09-26 Build: content/*.json keep the reviewers' fields (note, do_not_show_he, supporting views); the bundle drops them.
- 2026-09-26 The owner's checklist lives at the top of content/REVIEW.md (59 ⚑, each with a default); new this wave: the vine's
  first foliage and cedar poles, the Even HaShtiya's look, the tour's side panel, the wicket route as default?, one פרק on
  repeats, the lottery number 60, harder tiers, the demo outro's two doors, a child-length first version of each moment,
  moments' core step on replays, stamps on the device, the Ark as an invitation, the YK home line 12 days ahead, the lots'
  inscription (default the Mishnah's "לשם"), a key moment in all 15 stages, the wall moment's name.
- 2026-09-25 OPEN ⚑ for the owner (collected): Menorah branches straight (default, Rashi/Rambam) or round (Arch of Titus);
  Menorah orientation east–west (default) or north–south (decides "the western lamp"); vessels in the inner half;
  Kodesh HaKodashim gold or stone; parochet abstract weave or woven cherubim; the Tamid lamb shown standing calm (the
  Mishnah: bound, מעקדין); Levites facing west; choshen stone colours; blood marks fade (whitewash twice a year in
  reality); pens north of the Mount (illustration); the rest card ("you can leave now"); faster first days (10.5 days);
  Phase B live service on Shabbat/Yom Tov; both demo buttons; the role "for real" in practice mode; the ketoret rule
  (won by the third try, then never); the 15 ממונים as ranks; three פרקים per song; invented names for other kohanim;
  production mode hides all drafts; when the aravot circle; late joiners start at the current step; the afternoon psalm.

### v32 (fable20, 7.10) — the general work craft
Supervisor alone (Fable), no agents. Root of the owner's notes 2/13/19/21: every job without a craft of its own in the world (F1/arch, waves, letters, wheel, aqueduct, rafts) was played "at his hands" — numbers, no act. Now `stages.craft.work` (stages.js `// ── fable20 ──`) + `minigames/work.js`: a real piece beside him (the course stone sliding onto its gold bed, the well's wheel and bucket, the channel laid segment by segment, the logs pegged, the slab grooved), touch-down = his stroke, impact = the act on the beat (acts.js), the piece answers on that frame; the spot is chosen at his side where it is walkable, clear of the stock and in the camera's sight — never up the screen behind him. No coach bubble over the general work; the bubble flips at most every 700 ms. Gates: node 324/0 · qa 12/12 · twin-touch 40/40 · twin-stages wall/gates/nashim/nikanor 25/25 · work-touch sorag/kiyor/ulam 13/13 · game-touch 19/19 · kid17 (first work 38 s, sheets 0, errors 0). Artifact Uc1oXLxkuaWKNMZ7M32wvR · tag v32 · archive /home/claude/archive/v32. Still open from the notes: wall plan A (kohen on the wall's top), the key stone's framing, the crowd standing before the piece at busy yards.

### v33 (wave 20, 8.10) — "המסביב"
Three Sonnet agents in parallel, the supervisor (Fable) merging only. Yardstick: the owner's 12-minute Brawl Stars recording with sound (4 min of play out of 12; the rest a puzzle, profiles and leaderboards, the end chain). HOOK20: real badges (G.seen), the end chain after a course/stage (stamp → crew → points into the dinar → "מחר"), the daily riddle (hooks/riddle.js, content/riddle.json, 4 drafts), "היום" as a live board, the kohen's profile, "המשמר שלי" (save slots + a 6-symbol family code, local only), music: the menu bed +6 dB over the work bed, cue('courseDone'); docs/PHASEB-AROUND.md. SITE20: plan A at the wall (the kohen on the laid top from the 3rd course, an earth ramp, edges are walls), the key stone's landing (camera on the stone, dust ring, nudge, thud on the beat, "+N" on the stone), the crowd steps aside from the general work's piece. TWIN20: the right joystick (drag = direction picks the marker, length = power 1.0/1.3/1.6, an arrow on the ground; tap unchanged). Supervisor's merge fix: the end chain's layer never takes the thumbs. Gates: node 335/0 · qa 12/12 · twin-touch 40/40 · hook20-touch 47/47 · site20-touch 24/24 · twin20-touch 10/10 · work-touch 9/9 · game-touch 19/19 · twin-stages wall/gates/nashim 19/19 · kid17 (first work 44 s, sheets 0, errors 0). Bundle 3.42 MiB. Artifact CoSpBZjWfeqiPBDAazWoGK · tag v33 · archive /home/claude/archive/v33. Next: מרוץ המשמרות (RACE), more riddles (4 → 12), the riddle as a drawn room rather than a text sheet, the course-completion jump on the wall top smoothed, Nikanor's wall band.

### v34 (wave 21, 8.10) — the later stages as the first; the tools; the board never empty
STAGES21: test/stages21-kid.cjs (the kid at every stage: first work, markers, touch-free walks, four answers, music, framing) and its table on the bus; nashim's banker on the court floor (was inside the wall's ring); the follow camera turns or rises when a built mass hides him (all stages but the wall); long game-asked walks go by heroDash (≤ 1.5 s); the stage's reveal no longer drops the work to 72 BPM; the banker's strike button awake within 22 amot. TOOLS21: src/game/tools.js — one tool at a time, hung on the back/belt when idle, in hand ≤ 100 ms at a stroke; 3 tiers per tool (look, ×1/1.15/1.3 points, 300/900 silver in the shop, earned free at stages 3 and 7); "הכלים שלי" in the profile. BOARD21: 3 demo kohanim marked "לדוגמה" paced to the player (deterministic), the board scrolls to him, staggered rows, count-ups, gold glow, medal flips, rank-up stamp, the profile's level ring, the end chain's count-up and shine; reduced motion respected. Supervisor: the Name in a test's pattern → \u escapes; rounding; docs/PHASEB-PLAN.md (the curriculum check: ממ"ד history grade 6 "המלך הורדוס" 2 h; חמ"ד תושב"ע סוכה grade 4, ראש השנה grade 5; תמיד/מידות not in any curriculum). Gates: node 352/0 · qa 12/12 · twin-touch 40/40 · tools21-touch 17/18 (the "×1.15" float count flake) · board21-touch 24/24 · hook20-touch 47/47 · site20-touch 24/24 · work-touch 10/11 (ulam marker walk flake) · twin-stages wall/gates/nashim/lishka 28/29 (gates camera check) · game-touch 19/19 · hud-top 39/39 · craft-feel rock/dress/key (one 106-ms fall). Bundle 3.44 MiB. Artifact RFKmWxzf3KhYFMWPJxSJ8K · tag v34 · archive /home/claude/archive/v34. Open: kiyor's finish phase (14 s with nothing to follow), the saw's first-act juice, the wall ring crossing, the riddle as a drawn room, 4 → 12 riddles.

### v35 (wave 22, 8.10) — Phase B "יום במקדש": one whole weekday, the first rough slice
Research docs/DAY22.md (RESEARCH22: the 24 hours with sources, the animals, the 15 ממונים, the gaps), design docs/PHASEB-DAY-DESIGN.md (the day in game time — 3 real min per temple hour, the night 5 min, paused when away; the player is the אמרכל; the ממונים as the task engine). ENGINE22: src/avodah/day/ (clock, tasks 39 errands + 8 restocks, stock, works registry, world22 solids, the day's own twin instance in the finished Temple, horizon HUD "השעה … בעוד N שעות (M דק׳) — …", the requests list, dayEnd stamp+card, save A.day). WORKSA22: src/avodah/works/ night.js (the watch round, the fire at בית המוקד, the lamb count+check), pen.js (water/fodder/sorting, המחשה), wood.js (worm check), kit/figures/craft. WORKSB22: gate.js (the pilgrims' queue — direction decisions), seals.js (4 seals, nesachim, the evening account), kiyor.js (the muchni wheel), close.js (93 vessels, the gate's stone/keys). The morning/evening sheets play as before at their hours. Gates: node 375/0 · qa 12/12 · engine22-touch 31/31 · engine22-day 16/16 · worksa22-day 24/24 · worksb22-game 17/17 · twin-touch 40/40 · game-touch 19/19 · hook20-touch 47/47 · work-touch 9/9. Bundle 3.68 MiB. Artifact QMssPyJc6czY2gVMfU1rUn · tag v35 · archive /home/claude/archive/v35. Next (wave 23): the morning/evening Tamid as world crafts (not sheets), the bridge day points → the dinar, the queue's default pace for a kid, the works' stage size under the Phase B camera, PLACE22.close in the open, the night render darker.

### v36 (wave 23, 8–9.10) — the Tamid in the world
TAMIDA23 (Opus): src/avodah/works/dawn.js + dawn2.js + dawnreg.js — פיס ×2 (counting from the hat, never luck), תרומת הדשן, המערכה (6+2+1), הטלה (cup, check, 93 vessels), ברקאי (a timing act on the eastern light), פתיחת השערים (3 blasts on the beat), הנרות (the אמרכל at the door, the kohen inside: 2 dishun + 5 lamps, the 2 eastern stay lit), השחיטה behind a linen screen + זריקה as a tilting vessel (nothing red), האברים (9 carriers, pale abstract parts); קידוש = WORKSB's kiyor; stages refit onto free floor. TAMIDB23 (Opus): tamid.js + song.js + tamidreg.js — הקטורת (mortar at בית אבטינס, coals, the מגרפה, the cloud at the door), ברכת כהנים (never written, cited), the parts up + the wine (hold) + trumpets + שיר של יום (9 taps on the beat, 3 פרקים, bows), בין הערביים, the evening lamps lit from the western lamp. POLISH23 (Sonnet): the dark night preset `nightd` with the amarkal's torch and dim menorot; bridge.js (day points ×10 → Phase A's score/dinar, 250 a finished day, the coin chip in the HUD); the queue every 8 s; camWork zoom 0.62 + kit.refit (kit stages ≥ 60 % of the frame); close place in the open; fire/lambs markers 20 amot apart. Supervisor: a marker's job sticks only while he is about as near to it (twin-touch job 2); engine22-touch follows the works. Gates: node 396/0 · qa 12/12 · tamida23 81/81 · tamidb23 50/50 · polish23 39/39 · engine22-day 16/16 · engine22-touch 31/31 · twin-touch 40/40 · game-touch 19/19 · twin-stages gates/nashim 14/15 (gates camera check flake). Bundle 3.75 MiB. Artifact CDxZ9Qio86Tid3o98a3Lzp · tag v36 · archive /home/claude/archive/v36. Known: WORKSB's DOM-chip works stay small (24 % and under) under the zoom; the 0.8-s camera glide delays a work's first taps; the sheets remain for portrait.

### v37 (wave 24, 9.10) — Phase B on the real places, real kohanim; a UX pass on Phase A
FIGURES24 (Opus): works/figures.js rewritten — a rigged kohen (head, מצנפת, tunic, אבנט, elbows, palms, fingers), poses (stand/walk/carry/scoop/pour/bow/bless/reach/raise/torch/point/hold/lots), shared instancing (80 figures, 10 meshes), two-bone IK; ברכת כהנים as the kohanim do it (hands above the head, palms out, fingers split); works/closeup.js the precision camera (dolly 1.2 s, clear-line check) wired into the blessing, the ketoret cloud, the lamps, the song's bows; view.workRes (pixel ratio 2 during a work), view.closeCam (OrbitControls' minDistance 35 lifted during a close-up — polish23's zoom never showed because of it). PLACES24 (Opus): works/anchors.js (11 real places with ground heights: the ramp's slope, the altar top, the Ulam steps, the Heichal, the דוכן, Nikanor's 15 steps), places24.js — every Tamid work on its real place (the deshen up the real ramp, the pyres on the real altar, the camera inside the Heichal door for the lamps/golden altar, the blessing on the real steps, the song on the real דוכן, the real laver with water.js, Nikanor's leaves). PAYIS24 (Sonnet): payis.js — the four lots: a gold ring runs round the kohanim with a rising tick, the player's tap stops it, the count then goes round by taps (counting, not luck); more.js — pitum (11 spices), the private offering at the rings (screen, nothing red), tomorrow's lamb, the wood offering, the trumpeters (gate + דוכן, "בית התקיעה" with its sources). UX24 (Opus): docs/UX24.md (15 ranked problems with shots, the first 60 s storyboard, orientation, HUD order, every line shortened, 5 Brawl Stars things) + 5 S fixes: quiet HUD in the first-time flow, the pill under two thumbs, short teach lines, the edge arrow never on the HUD, a way back from the quarry board; the turn-the-phone card in portrait (⚑). Gates: node 430/0 · qa 12/12 · figures24 47/47 · places24 160/160 · payis24 82/82 · ux24 21/21 · tamida23 81/81 · tamidb23 50/50 · engine22-day 16/16 · twin-touch 40/40 · game-touch 19/19 · kid17 (first work 44 s, 0 sheets, 0 errors). Bundle 3.84 MiB. Artifact TCVmNn7q6UMQ2zs4LMi6Tu · tag v37 · archive /home/claude/archive/v37. Open (UX24 M items): the quarry out of the first-time flow, rocks before the survey, the name first, one text layer at a time; the stamp clipped under the Phase B HUD; music (owner: next phase).

### v38 (wave 25, 9–10.10) — the blood as the work ("דם כן, פגר לא")
Research+design docs/DAM25.md (Opus): the map of 21 places where blood flows (rings, hooks, tables, the vessel, carrying, the two corners below the red line, the chatat's four horns above it by the finger — רמב"ם, the southern/western base, the two holes, the shit, the amah to Kidron, the gardeners — יומא ה,ו, the floor, ערב פסח "עד ארכובותיהם" — knees, מדיחין on Shabbat only, birds, Yom Kippur, garments never stained, washing, archaeology), the color rule (red only as the offering's blood — the BLOOD palette — and the red line), the moment of gravity (screen, one deep tone, 1.2 s, no points), the store/parents lens, 8 ⚑ (defaults taken). BLOODA25 (Opus): works/blood.js (palette, hue test replacing "no red", gravity helper, drying wet→dry→trace on the day clock, amah tint), the morning zerika and the evening Tamid as 7/10-act chains (slaughter 0 pts → receiving with the liquid → the Γ marks on the real altar's NE/SW below the line → the rest poured on the southern base into the two holes → the amah runs and pales eastward), bloodteach.js (tap the red line: חטאת above / עולה·שלמים·אשם below; tap a grate: the camera follows the amah 4 s to the outlet), the embers orange, the sheet's colors from the palette, the tests' "reds 0" → "reds ⊆ BLOOD at their places" + no palette pixel near a figure/animal or on the floor. BLOODB25 (Opus): works/yachid.js — the private offering by its kind from the queue (olah/shlamim: two corners below; chatat: SE→NE→NW→SW above by the finger, a wrong horn waits; bird: the kohen's back hides the מליקה, the wall mark below/above, the מיצוי), offerq.js ledger from gate.js, the vessel washing after the 93 count (close.js), ganan.js the gardener at the outlet (+1 a day). Supervisor: indexb.js restored (a wave-22 conflict leftover), worksb22-game follows the moved markers. Gates: node 444/0 · qa 12/12 · blooda25 34/34 · bloodb25 41/41 · tamida23 81/81 · tamidb23 50/50 · places24 160/160 · payis24 82/82 · engine22-day 16/16 · worksb22-game 17/17 · twin-touch 40/40 · game-touch 19/19. Bundle 3.87 MiB. Artifact (v38) · tag v38 · archive /home/claude/archive/v38. Open: the Γ reads as a grey-brown stain from the high camera (a close-up at the corner and a wetter look), the vessel's liquid small, the base thread thin; the non-blood reds outside the works (the High Priest's garments, the wine, UI) left as they are.

### v39 (wave 26, 10–11.10) — the player IS the kohen; the owner's Phase B notes of 10.10
HERO26 (Opus): works/hero26.js — every work's acting figure wears the hero's look (`man(…,{hero:true})`, ACTOR per work: payis seat 0, zerika/erev the receiver, shir the trumpeter, birkat the middle one), the hero mesh hidden during the work and back at the actor's last spot facing the next errand with one step (never a cut); the epilogue `after` hook with per-work timings (evarim 3.8 s: the row walks off to the לשכה; maaracha the fire takes; deshen the ash; payis the winner steps out; shir the last bow; default 1.5 s); the mentor line and the next bubble wait for the epilogue; "no shock": the next marker pulses 9 s and he turns to it. FIX26 (Opus): payis — "מי יזכה?" prediction tap before the count (right = gold + "ניחשתם!"), rising tick, 120 ms stop grace, the lots' camera 60°; kiyor — the spouts close (water.js washAt reopened them), the mukhni as hold-release (gold at the mark), rope heaves with the water sound, the fill on the real basin, kiyor2 opens right after the kiddush with the bubble, a level bar on its chip; evarim — every portion named from the start (9 labels), the last three on gold + the mentor line "המנחה והנסכים שעם התמיד, לא מן הטלה" (במדבר כח, ה–ז); zoom — the pinch no longer caught by the walk zone, the page's own zoom disabled, ×0.7–6 free / ×0.7–1.6 in a work, two-finger double-tap resets; the double start of a work after its epilogue (h26.closing) fixed. docs/FUN26.md: the gameplay of every work (six skill axes, a gold window + a stamp per work, S/M/L) and the economy (points = rank, dinars = building/vessels; titles by thresholds; no streaks). Gates: node 459/0 · qa 12/12 · hero26 103/103 · fix26 32/32 · payis24 82/82 · tamida23 81/81 · tamidb23 50/50 · places24 160/160 · blooda25 34/34 · bloodb25 41/41 · engine22-day 16/16 · twin-touch 40/40 · game-touch 19/19 · engine22-touch 31/31 · worksb22-game 15/17 in the chain (gates+account 4/4 alone: the chain's clock passes the account's hour). Bundle 3.89 MiB. Artifact (v39) · tag v39 · archive /home/claude/archive/v39. Open: in the lots' close-up the fingers are too small to count from the frame and the errand marker overlaps the prompt; evarim's labels stack over each other in the row; the stamp under the Phase B HUD bar.

### v40 (wave 27, 11.10) — the vertical slice: never lost, never idle; six works done; one world
Strategy reset (the owner 11.10: "בתכלס אני עדיין תקוע… נראה שאנחנו מתברברים"): breadth frozen; docs/PLAY27.md — six thumb verbs (tap-on-beat, hold-release, drag-aim, carry on the stick, tap the target, stop) and the per-work pick for all 30 actions; a "done" definition of six screen tests; the FRESH-EYES gate. GUIDE27 (Opus): day/guide27.js — path finding over the floors, the arrow chip at the screen's edge to the primary task + 8 floor discs, HUD "עכשיו: לך ל___ — ___" / "בינתיים: ___", tap-the-arrow autowalk, the idle ladder (3 s turn + pulse, 8 s the ממונה's bubble, 20 s he walks), never-empty (≥ 2 open: primary + meanwhile; `practice` re-opens a done task at half points), the skip card ("קפוץ" to 10 min before the next primary), the 2D sheets out of the landscape flow (the Phase A invitation, `live`, segments and the home's buttons enter the day). SLICE27 (Opus): works/slice27.js — per-work level counter (3 gold → level 2), events table (the coal on the ramp), world taps, a beat without music, stamps; the six: המדורה (beat; L2 faster, two piles), תרומת הדשן (carry: steadiness meter, hold-scoop, the coal event), המערכה (drag to one of three spots; L2 names hidden), המוכני והקידוש (the basin fills; "יד ימין על רגל ימין"), האברים (tap the right kohen; L2 shuffled), הפיס (he raises his own finger; L2 faster ring). Supervisor: life.js the pyre dims as the camera comes close (the white blot over the kohen on the ramp); the intro card rewritten for a kid (three lines; the old text spoke of a "fair lottery"); payis24-touch and twin-touch test fixes (the finger phase; a clock-dependent check). FRESH27 (Sonnet, no context): docs/FRESH27.md — knew where to go (the HUD line, the arrow, the ring at the marker: "הרגע הכי ברור במשחק"); confused by: the loading wait, the 24 mishmar buttons, the welcome text wall (fixed), the four stacked right-side buttons, not seeing himself at the start (altar smoke). Gates: node 473/0 · guide27 29/29 · slice27 fire/level 16/17 (level-2 beat when run after the level test) · maaracha+kiddush 19/20 (the maaracha per-touch change 7–10 % vs 10 %) · evarim+payis 20/20 · hero26 103/103 · fix26 32/32 · twin-touch 40/40 · game-touch 19/19 · payis24 82/82 · tamida23 81/81 · blooda25 34/34 · avodah-harness 117/117 · qa 12/12. Bundle 3.93 MiB. Artifact (v40) · tag v40 · archive /home/claude/archive/v40. Open: the name/mishmar screen (24 buttons) and the four right-side buttons for a kid; the start camera (he is hidden by the altar's smoke); the stamp vs the skip card/bubble overlap; the evarim labels stack; the lots' fingers small.

### v41 (wave 28, 12.10 — folded into v42) — light that does not blind, a camera never inside a wall, text that never hides, the blessing in full
The owner's five PC shots (docs/owner-1012/). LIGHT28 (Opus): src/light28.js `nearDim` — every additive glow and PointLight dims with the camera's distance (full at 40 amot, 0.12 at ≤ 6; the night torch 38×k² capped 14, 16-amot reach, warm colour); the label safe zone (`claim`: HUD bottom + 8 → buttons' top − 8, stacked, ≤ 34 px tall; the chips, says lines and bubbles obey; the kiyor's 3D count removed); ברכת כהנים in full (works/birkat28.js — the three verses with ה׳ per the owner's 12.10 decision, 24 px, one per tap, the crowd after each; the portrait sheet too); the תפוח as a grey-brown heap with a rim. Luminance ≤ 250 in 0 % of pixels over 11 shots. CAM28 (Opus): day/cam28.js `createCamGuard` — a per-frame sphere-cast from the hero's head to the camera against the solids (+ the smoke column, laver, tables, Ulam+House as one block), gliding ≤ 2.5 amot/50 ms (7.5 while cut); the "lift me up" vertical drag on the right half (+15°/×1.3 at 24 px → the overview at 120 px; eases back 1.5 s; double-tap stays; a ⌃ hint 3 days); the HUD "כאן: X · אחר כך: Y" at a non-primary marker with the button's label; the start/teleport frame from behind at 20 amot with no wall or smoke between; chips behind walls at 50 % and never over the HUD. Walk test: 57/1800 samples still blocked while gliding through gateways (3 %). Gates: light28 31/32 (the last shot hit the 10-min cut) · cam28 start/lift/here 28/28 · guide27 29/29 · hero26 103/103 · fix26 32/32 · twin 40/40 · game 19/19. Bundle 3.95 MiB. Not published separately.

### v42 (wave 29, 12.10) — "משמרת": the Temple as a 90-second shift game (the prototype the owner's son judges)
Strategy (docs/GAME29-PRINCIPLES.md, after the owner 12.10: "דרור לא רוצה לשחק. אומר שזה משעמם"): Phase B was a guided tour — no goal, no fail, no decision, no round, no rival; the genre with a proven loop for 7–12 is order fulfilment / time management. Rules changed with the owner's approval: a clock inside the round, a soft fail, an NPC rival; the day engine becomes "סיור". SHIFT29A (Opus): src/avodah/shift/{engine,levels,hud,rival,index}.js — the 90-s clock (a sun arc), the spawner per LEVELS 1–5 (olah → +ken → +mincha; counts 5/7/8/10/11; rival 1.4…2.9/s named from the 24 משמרות), score (10 + patience bonus) × gold ×1.5 × combo (×1.2/1.5/2), the wrong-order line once, the opening ritual (4 rings in the Tamid's order — the lot, the laver, the ash, the pyre — fixed by the supervisor from the brief's wrong order), the coal event at 5, stars [0.6, 0.85, beat the rival], the end card (★, score vs rival, שיא, "עוד פעם" in ~1 s, "המשמרת הבאה" at ≥ 2★, the sources folded), the entry card ("משמרת" big, "סיור" small), `#shift=N`, save A.shift; no info card during a shift. SHIFT29B (Opus): shift/{pilgrims,stations,camera,walk,draw,lab}.js — pilgrims as figures with a lamb/doves/flour, a queue of 3 west of the דוכן's steps, the icon + patience bar chip (green → amber → deep orange), take/follow/leave ("הלך", a puff); five stations on the real places (laver hold with a gold mark; three seal chips; the beat ring → linen screen → one deep tone → the vessel; the drag → the Γ per DAM25; the dove at the דוכן) each ≤ 3 touches ≤ 4 s; a still 54° overview camera fitted to the queue and all stations with a 30-amot glide per act; the stick ×1.8 and a dash of ~31 amot/s on a station tap. Agents' own scores by touch: L1 42→109→145 (★★★ vs 122), L2 41→138→120 (★★). Gates: node 500/0 · shift29-touch 15/16 (the last was the opening-order line, test fixed) · shift29-world 44/44 · cam28 28/28 · guide27 29/29 · hero26 103/103 · fix26 32/32 · twin 40/40 · game 19/19 · qa 12/12 · harness 117/117. Bundle 4.03 MiB. Artifact (v42) · tag v42 · archive /home/claude/archive/v42. Open: a pilgrim's trip is 14–18 s because the real stations are 60–120 amot apart (the laver's corridor opens only south) — the round is slow for 90 s; the figures are ~20 px on the overview (the chips carry the game); the lab shots still show the day HUD; the first second before the camera settles.

### v43 (wave 30, 12.10) — the shift from inside the world; no jumps; short trips
The owner on v42's shift (PC): "קפיצות קשה… נראה מלמעלה מדי… הייתי משלב אני בתוך העולם מלווה את הולך הרגל". SHIFT30 (Opus): camera.js CAM30 — a follow camera behind the kohen (30° down, 20 amot, the look point 2.5 ahead; turns with his walk, after 1.4 s still toward the next station; a cut line → 15 amot then up to 80°; an act = a 15 % push-in only); edge chips (draw.js edgeChip) — every station and the gate ("השער · תור N") over its anchor when on-screen, at the screen edge with an arrow and the distance when not, the next station's chip on top; compact stations (a shift basin 10 amot SE of the altar instead of the real laver's 123-amot corridor; seals 8.5 amot from the line; the queue 7 amot east of the altar); the pilgrim walks 1.6 amot at his right; tap-walk 20 amot/s (the 31-amot/s dash gone); levels back to 6/8/10/12/14; an engine fix (an arrival during the "לא —" pause ran no act); a profiler (src/prof30.js, `?prof30=1`). The jumps were the old camera's glide per act and the dash, not CPU (p99 11.5 → 13 ms; camera steps > 1.5 amot 12.9 % → 6.1 %, the rest CAM28's fast fixes at the east wall/altar). Supervisor: the shift in portrait shows a turn/widen card instead of the old home (the owner opened the artifact in a side panel); a `mishmeret-v43.html` that opens straight into the shift. Scores by touch: L1 232/201/231 (★★★ ×3 vs 125), L2 130/252/170. Gates: node 506/0 · shift30 all but the framing check (80–87 % vs 90 %) · shift29-touch 16/16 · shift29-world 42–43/44 (flaky) · guide27 29/29 · hero26 103/103. Bundle 4.04 MiB. Artifact (v43) · tag v43 · archive. Open: framing 80–87 %; chips over the kohen's chest when busy; the day crowd not avoided by the guard; the scripted player beats the rival 2:1 at level 1 — retune after the son plays; a trip of 3.3 s mean.

### v44 (wave 31, 12–13.10) — the shift a child can play: never search, one verb, the true route, the slice
The owner's 108-s phone video of v43 (docs/owner-1012/video-sheets): 25 s wandering to the rings around the altar, the button's stale verb far from any station ("שיכור"), seven overlapping chips, no zoom-out, 14 vs 125 and 0 stars; and the route not the true one. FLOW31 (Opus): layout31.js — the stations in one open field east/south-east of the altar (every leg ≤ 14 amot but the ramp's 62); flow31.js — the gold path on the floor to the next station, only three chips during a take (the pilgrim's always on top, the lit station, the gate "תור N"), the "מבט על" hold button (zoom out with "אני"), the lift gesture off in the shift, the day's crowd cleared from the field; engine.js `work31` — the big button has two states only: "לך ל<station>" (a tap walks him) / the act's verb within 3 amot, "קחו את עולה הרגל" when one waits, "✓ יפה!" in the tail; level 1 cannot be lost (one pilgrim at a time, patience 45 s, rival 0.6/s, 4 pilgrims; ★ 2 / ★★ 3 / ★★★ 4 + the rival); the ⛶ full-screen button; the kid harness test/kid31.cjs (a child-like scripted player reading only the DOM: ★★ 133/131/131 at level 1, 0 s of not knowing). ROUTE31 (Opus): route31.js + stations.js — עולה: סמיכה (the owner leans) → שחיטה by a SLICE (≥ 60 px in 300 ms; the linen screen, one deep tone, the vessel) → זריקה (drag to the corner, the Γ) → ניתוח (three taps, pale parts on the table) → העלאה בכבש (hold = the climb up the real ramp, release = the parts onto the pyre); מנחה: הגשה → קמיצה (hold, the fistful) → הקטרה; קן: מליקה (on the beat, his back to the camera) → מיצוי (drag down the wall); the laver once per round as the kohen's own opening act; the sources at the end card's fold. Supervisor: the 10-minute rule — both agents posted a shot and the two child's questions every 10 minutes (37/39 bus entries); the supervisor's own 10-minute reads were not possible mid-run with the launch tool at hand (the agents return only at the end) — read post hoc. Gates: node 520/0 · flow31 17/17 · route31 19/19 · shift29-touch 16/16 · shift29-world 42/44 (the removed seals booth check; a screenshot-timing miss) · shift30 12/13 (the camera-step check, since wave 30) · guide27 29/29 · hero26 103/103. Bundle 4.07 MiB. `mishmeret-v44.html` · tag v44 · archive. Open: the linen screen fills the frame's middle at the slaughter; the ramp leg is 62 amot (one tap, ~3 s); the camera follows the climb 32 amot up and down; הגשה at the SE corner as המחשה (the true SW is behind the ramp).

### v45 in progress (13.10, "הבייסיק", fable32 — no agents; the owner tests each build on the phone within two minutes)
The owner on v44: "הג׳ויסטיק לא מתפקד… שביל הזהב מריץ אותי… אגודל ימין לא מצליח לעשות זום אאוט… הפעולות לא מבוצעות במקומן… איבדנו כיוון, מתקשים בבייסיק." Four basics in order, small builds by Fable alone, each published as artifact "משמרת 45 (בנייה N)":
- **Build 1** (camera.js, engine.js, flow31.js): the follow camera holds its bearing under the stick (`steady`), never turns when he stands; the away button only lights the path (no autowalk); zoom − / + buttons (5 levels, kept in localStorage).
- **Build 2** (twin.js, engine.js, stations.js): the stick's bearing from the camera's INTENDED bearing (`__SH_STICK_AZ`, no jitter); the arrival stop at the next place (`__SH_STOP` ≤ 2.4 amot — he parks facing it; the thumb must be lifted and pushed again); no pilgrim taken by himself after the washing; no act ends by itself (`__S29_CAP` tests only); the act push-in 24 %.
- **Build 3** (layout31.js, route31.js, stations.js, engine.js, hud.js, index.js, flow31.js, twin.js): the stations at their REAL places (PLACE31 is the one source: the laver at (−63.5, 20) with the kohen at the steps' foot and the act walking him up the steps and back; the slaughter at the morning ring (−47, −33.5); the cutting at a marble table (−34, −56); the הגשה at the SW corner; the ken at the SE corner; the ramp's foot) — the shift basin prop off (`BASIN30.off`); "הגעת": a sound, a buzz, a landing ring on the floor, the big button lit gold for 1 s, the hint "הגעתם!"; every button touch answers at once (a buzz; a tick when no act answers; the act's touch-down buzzes); the pause button (top-left, 46 px) → the clock, the pilgrims and the rival stand still; the card "המשך" / "מהתחלה" / "לסיור". Legs by the planner: gate→laver 2.2 s, laver→ring 5.7 s (round the altar's east), ring→corner 1.3 s, corner→table ~2 s, table→ramp 3.4 s at 20 amot/s. Tests: node 519/0 (shift29-world's overview fit skipped — the overview is gone since shift30); test/fable32b-touch.cjs (places, pause, basin off pass; the walking checks cannot run here — the headless SwiftShader renders the shift at one frame per ~10–20 s on this machine, build 2 the same).
- **Build 4** (camera.js, twin.js, shift/index.js, flow31.js, engine.js) — the owner (13.10 17:36, "בוא נעתיק לא נמציא"): the genre's controls. The stick is OFF in the shift (`T.noStick`); he moves by a tap on the next place's chip, on a pilgrim, or on the big button "לך ל…" (autowalk on: `__SH_AUTOWALK = true`); the walk ends AT the place and stops there with the "הגעת" signal — the act is the player's own tap on the button (`__SH_WALKACT` keeps wave 29/31's walk-then-act for their tests). The camera never turns: CAM32 — one fixed bearing from the south-south-east (az 1.05, measured against the smoke column and the real stations), 49° down, dragged after the kohen, pulled back by itself so he and his next place are both in the frame (fitD, 24…110 amot), the look point up to 14 amot toward the place; an act at 22 amot. No zoom buttons, no "מבט על", no start glide. Tests: node 520/0 (flow31: the new "walk ends at the place" test); test/out/fable32-4b.png — the fixed frame at the round's start (him at the gate, the laver chip at the far edge, the path round the altar).
- **Build 5** (13.10 late — "הידיים של רובלוקס", after Dror's 10-min video of 99 Nights in the Forest, docs/owner-1013, docs/FOREST33-RESEARCH.md, docs/MIKDASH99.md, docs/OUTSIDE34.md): the floating stick is BACK in the shift (the owner: "שם הילד הולך בעצמו עם יד שמאל די בקלות"); the camera is Roblox's — CAM32.orbit: the right thumb's drag on the empty world turns it (az) and lifts it (el 0.22…1.25), the pinch zooms (twin zoom.k, no reset on a stick touch in the shift), it NEVER turns by itself, no fit (d 26, the look point ≤ 5 amot toward the next place); the stick's bearing is the thumb's bearing (`__SH_STICK_AZ`), so it is steady. The PROMPT button (ProximityPrompt): within reach the big button leaves its corner and stands beside the thing (68 px, `.tw-btn.f31-prompt`, the verb, a hold ring that fills over 1 s while pressed, a name tag over it); far away it is hidden (`f31-far`) — the stick, the gold path and the chip are the way; "קחו את עולה הרגל" stands beside the waiting pilgrim. A hotbar of four tools at the foot (knife / bowl / basket / pail), the one the next act uses lit (visual only yet). Hints: "הקישו על הכפתור שליד הכיור". Tests: node 520/0; test/out/fable32-5.png (the prompt beside the laver, the chip, the lit pail). Known: the orbit drag starts only on the world canvas right of the stick's zone; the prompt's z-order sits under the chips' layer (the claim rects keep them apart).
- **Build 6** (14.10 00:40 — "האש והיום", docs/MIKDASH99.md §3–4, FOREST33 §8 #1–#4): a third mode on the entry card — **"יום במקדש"** (`#shift=day`, src/avodah/shift/day33.js in the shift's rig: stations, walk, orbit camera, flow31's path and prompt, the hud): **אש המערכה** — a fuel meter 0…100 on the altar (a hud pin "🔥 22/100 · רמה 1" at the pyre, the score slot shows it) draining 100 in 240 s by day, half at night, NEVER out (a floor of 5 — embers, "נשארה גחלת — הביאו עצים!"); **לשכת העץ** at the court's south (x −38, z 58; מידות ה, ד, ⚑ the exact spot) with a log pile — "בקעו — 5 הקשות" (stations.js `tapN`, the arms fall on each tap), a log into the basket (5 at most), one in four wormy — "גזר מתולע — פסול למזבח (מידות ב, ה)"; **the ramp** — "העלו עצים — החזיקו" (the kevesh climb), +10 fuel a log, the level by logs fed in all (6/17/67/137/300 → 2…6, "המערכה ברמה N — העזרה נפתחת"); **day 180 s / night 60 s** (the sky to `nightd`), at night "איש הר הבית עובר — הקישו על הלפיד!" once (a miss after night 1: −10 fuel, "חובטו במקלו"), day N+1, the best day kept (save.bestDay); hints for day 1; pause card; the hotbar's axe lit at the wood. Tests: test/day33.test.mjs (5: levels, the drain to embers, 6 chops → 5 logs + 1 worm, the ramp feeds and levels, night → torch → day 2); node 525/0; test/out/fable32-6.png (the pile, the prompt beside it, the HUD). Open for build 7: the court opening by level (fog), the laver's water, the stores, the strength meter, the night in בית המוקד.
- **Build 7** (14.10 01:15 — "לפתוח שטח", MIKDASH99 §3–4, FOREST33 §7d/§8): the court opens by the fire's level (`DAY33.unlock`: the wood and the ramp at 1, the laver at 2, the oil store / the salt chamber / the bakers' table at 3) — every open station has its chip at the edge with its distance, and any open station within reach is the kohen's to use (free choice, the Roblox way; the next one is only the path's suggestion; a station that cannot be used now — a full basket at the wood, nothing to carry at the ramp, an already-washed morning, a bowl without its three — shows no prompt, "נפתח ברמה N" for a closed one); **the laver** once each morning (hold) — "ידיים ורגליים מקודשות": every log +25% that day; **לשכת השמנים** (jars, 3 taps → oil + flour), **לשכת המלח** (the court's north, 3 taps → salt), **לשכת האופים** (⚑ המחשה — בית גרמו is in בית המוקד; 3 taps with oil+flour+salt → bread); **strength** 💪 100: running and chopping tire him, under 30 the axe needs 8 taps — "אכלו לחם" (a corner button when bread is in the basket) +60; day N+1 restores 30. Props: the jars, the salt heap, the bakers' table and bowl. Tests: day33 6/6 (+ the build-7 test: unlocks, the washing's +25%, oil→salt→bread→eat); node 526/0; test/out/fable32-7.png. Honest open items for the owner: the night is still in the court (not בית המוקד); the "fog" is unlock-by-level, not a visible fog; no shop/פרוטות yet (build 9); the prompt sits under the chips' layer.
- **Build 8** (14.10 ~01:00 — "הכלכלה", MIKDASH99 §5, FOREST33 §3/§8 #6, #8): **פרוטות** (save.perutot) — never from days: **משימות הממונה**, three a day (day 1: בקעו 6 / העלו 10 / בקעו 12; day 2: קדשו / פתחו 2 כדים / אפו לחם; …), a panel at the top-left with n/goal, ✓ and +5 פרוטות each; **the merchant** at the gate on day 2 (then 35 % of days), 75 s, a figure in a dark cloak by a basket with a ring and a pin — "הסוחר — תנו לחם": a loaf for one of three (a 10-log basket / a 3-tap axe / 12 פרוטות) on a choice card; **the shop** on the entry card ("🪙 חנות · N פרוטות"): גרזן טוב 25, טנא גדול 30, טנא ענק 90 (needs the big one), קערת לישה 35, אבנט תכלת/ארגמן 15 (cosmetic, not yet drawn) — kept in save.day33 and applied at the day's start (axe taps, basket size, bread's power). Tests: day33 7/7; node 527/0; test/out/fable32-8.png. Open: the merchant's figure is drawn small (man() without the hero's scale); the sash dye is not yet on the kohen.
- **Build 9** (14.10 ~01:40 — "הטלאים", OUTSIDE34 ב.3 #1 in miniature, FOREST33 §7 "missing kids" → lost lambs): **דיר הטלאים** at the court's north-east (⚑ המחשה — the real לשכת הטלאים is in בית המוקד, 170 amot west; ערכין ב, ה: six inspected lambs) — a fenced pen with six lambs (figures.js `lamb`, a gold ear-ring = מבוקר), open from fire level 2; **"בקרו — הקישו בקצב"** (the tapBeat act: on the beat = inspected, off = "לא בקצב — בדקו שוב"); **the tamid** at dusk and at dawn takes one inspected lamb (+15 fire) or misses (−10, "אין טלה מבוקר!"); the path sends him to the pen when none is ready and the tamid is near; **a lost lamb** from level 2, once a day: wanders the court with a gold ring, the path and the hint point at it — "קחו את הטלה" (tap) → it follows at his heels to the pen → inspected + 15 פרוטות. HUD "🐑 n/6". Tests: day33 8/8; node 528/0; test/out/fable32-9.png.
- **Build 10** (14.10 14:30 — "הלילה והשיר", MIKDASH99 §3, OUTSIDE34 ב.3 #13/#18): **the night in בית המוקד** — at dusk a fade ("השמש שקעה — לבית המוקד, מידות א, ו–ח") and he is in the hall (x −160, z −68; the real chambers are modeled), the torch prompt there; at dawn a fade back to the court ("ראו טלה מלשכת הטלאים", תמיד ג, ג); **the Levites' song** — a new station `song` at the דוכן (unlock at level 3): after a dawn tamid with a lamb ready, a 60-s window "לכו לשיר" — "שירו — הקישו בקצב" (tapBeat), on the beat +10 fire and +5 פרוטות; **the fire's look** follows the meter and the level (`__FIRE33` → life.js fireNear: embers 0.25 … a high level 1.6). Tests: day33 9/9 (+ dusk → the Moked → dawn → the song); node 529/0. Open: the hall at night has no bed/fire props of its own yet; the Moked's camera may meet its walls (the guard).
- **Build 11** (14.10 15:10 — "ספר הזכרונות", FOREST33 §3a/§4c badges → OUTSIDE34/MIKDASH99 "ספר הזכרונות"): 15 badges earned by play (the first log, 25/100 logs, levels 2/4/6, the first bread, six lambs, a lost lamb, three songs, days 3/7/33, five watches, a trade) — a stamp when earned, claimed at night in בית המוקד by the corner button "ספר הזכרונות (N)" (a choice card, each +2…15 פרוטות; kept in save.badges33); the Moked's night corner drawn (a brazier; the shop's rug and oil lamp if bought — the sash dyes are gone: the אבנט's colours are the halacha's, not a cosmetic); the 33rd day: a fade "33 ימי שירות" and the badge. Tests: day33 10/10; node 530/0.
- **Build 11.1–11.2** (14.10 evening): the tap that opens a tapN act is its first hit (`ST.poke('start')`); an act left alone 8 s is cancelled, nothing gained (`__S29_IDLE`); hints one small line, 4 s, each once a round (the owner: "תופס לי חצי מסך"); `out/index.html` for GitHub Pages (the artifact runs in a small frame in the Claude app; Chrome gives the full screen).
- **Build 12** (14.10 22:40–23:50 — "המצלמה של האגודל והפעולות הנראות"; the owner: "העדשה לא טובה. עדיין נעלם במרחב… הפוכה… לא עוקבת… קופצנית… בלילה לא רואים כלום… שאראה את הפעולה שביצעה הדמות — כל הפעולות… פתח את הדיר: הצלחת / לא הצלחת"). **The root of "נעלם/קופצנית/הפוכה": CAM28's wall guard** turned and lifted the camera to the far side whenever a wall crossed its line (at לשכת העץ — against the chamber wall — every act; the headless shots proved it: a top-down camera during the wood act). Now `__CAM28_PULL` (set by camera.js while the orbit camera is on): the guard never turns or rises — blocked, the camera only comes in to the wall (first hit − 0.8, ≥ 5 amot), and when nearer than 9 amot it rises a little to look over his shoulder (≤ +0.8 rad, at most 4 amot farther) — Roblox's rule, the thumb's bearing sacred. The orbit drag's sign flipped (a swipe right looks right), eased 12/s; vertical only on a clearly vertical swipe; **follow**: while he walks with the stick and the thumb is off the world, the bearing eases behind his way (0.9 rad/s after 0.4 s); the stick's bearing frozen at touch-down (twin.js) so the follow never turns "up" under the thumb; the act's camera nearer and lower (15 amot, el ≤ 0.6); the intro after a fade on the thumb's own bearing (no turn afterwards; `__SH_NOINTRO` for headless tests). The night sky 'dusk' (not 'night'): the court readable. **Every act visibly performed** (stations.js drawAct): the wood — a block and a log, the axe in his right hand falling on each tap, chips, the log split in two; the oil — the jar tips, a gold stream, the bowl fills; the salt — the heap sinks, grains fly into the basket; the bakers' table — dough pressed on each tap, loaves set one a tap, flour; the song — a harp in his hands, notes rising; the ramp — logs on his shoulder, laid on the pyre at the top; the pen — two posts and a bar swinging up with the taps, the lamb trotting in through the open gate. The pen result reads "הצלחתם! הדיר נפתח…" / "לא הצלחתם — הדיר לא נפתח בזמן, הטלה ברח! תפסו אותו" (3 taps within 4 s). Two agents in parallel: **src/tiles/** "זיכרון המקדש" (a memory tile-flip interlude: 16 original code-drawn Temple pictograms, 3D CSS flips, streaks, פרוטות, fireworks, hints/shuffle/undo; docs/TILES35.md; not yet wired in) and **src/match3** laid out for a landscape phone (`isLand()` by aspect: the board the full height, the HUD in side columns; 43-px cells at 844×390 — the height's ceiling; 80 px on a 1280×720 tablet; docs/MATCH3.md §6b). Tests: cam28 8/8 (pull-only), day33 10/10, tiles 10/10; node 541/0.
- **Build 13** (15.10 06:20 — "מסך הבית התלת-ממדי"; the owner 14.10 23:18–23:20 on Dror's 4-minute lobby video: "רק במסך פתיחה יש מלא אופציות ומלא תנועה. העין לא נחה לרגע… החלק הכי מגניב שתופס אותך בפנים הוא השוט התלת-מימדי"): **src/avodah/shift/lobby35.js** replaces the flat entry card. The kohen stands LIVE in the court at dawn (the world renders behind him — the kohanim pass, the camera drifts ±0.45 rad round him at 11 amot, el 0.24; the thumb can turn it; `CAM32.orbit(az, el, d)` took a distance), he breathes, waves every 7 s and swings the axe; gold motes spiral up round a glowing disc; a lamb trots a ring round him, a small brazier burns at his side. Round him the doors, as in the genre: right (RTL first) — the watch's card (the best day, the shift's best, the badges' bar), ספר הזכרונות (read-only here: claimed ✅ / what waits, the claim stays at night in the Moked), today's three tasks (+5🪙 each); left — the shop (a dot when something is affordable), the merchant ("מגיע ביום 2"), **זיכרון המקדש** (src/tiles, "חדש" dot; its פרוטות go to save.perutot; its own save in save.tiles) and **משחק האוצר** (src/match3 runLevel with its map; a won board 4 + 2 a star, a try 1 — טיוטה); bottom — the mode pill (יום במקדש / משמרת / סיור, kept in save.lobbyMode) and the big pulsing gold "משחק". `__SH_OLDCARD` keeps the old card for a test; `__LOBBY` for tests. The day's HUD, the thumbs, the craftsman's hand and the mute button hidden under the lobby (`body.lb-on`). **At night in the Moked** the corner button offers "🃏 זיכרון המקדש — משחק לילה" once a night (the clock held, the פרוטות stamped). Headless shots test/out/fable32-13c-lobby.png. Tests: lobby35 3/3; node 544/0.
- **Build 14** (15.10 09:00–13:50 — "הכלים, ההעמסה והניקוד האחד"; the owner 15.10 08:55–13:03: "אם אני חוטב עץ אני צריך גרזן… להעמיס את העצים… ולראות מה אני עושה… לא צריך שורת 'עכשיו' — להאיר את הבועה הרלוונטית… לשלב את לוח הניקוד משלב א׳… משחקוני ביניים אמיתיים יקפצו… להוציא עז פרה מהדיר"): **the gear on him** (flow31 draws it on the world's own figure; the act draws its own): the axe in his right hand within reach of the wood; a back-basket (⚑ המחשה — a wheelbarrow would be anachronistic; the owner was told) with his logs sticking out wherever he walks; a split log arcs from the block into the basket at each chop; on the ramp the act carries the same basket (the shoulder logs are gone) and at the top the logs arc onto the pyre (`E.gear()`, `E.fx33()`). **No walk hints** — the next place's chip pulses bigger with a bouncing ▼ (stations `.s29-st.cue::before`). **The one score** (score35.js): Phase A's master score (G.score/dinars, bh_beta2) read and written from the day — an act ok/good/gold 10/20/40 by `S.grade`, a task 50, a badge 100, a new day 250, a lost lamb 100, an interlude won 200 (tiles) / 150 (pen) / 100 (m3) + 50 a star; the capsule "★ 12,340 ◉3" in the day's line and the lobby's bar. **The interludes everywhere**: `games()` in index.js (tiles · pen · m3, one shape) for the lobby (`play(key)`) and the day (`E.playGame`, `E.offerPlay`: a choice card, the clock held); **idle 12 s with nothing near → the corner offers "🃏 משחק קצר?"** (never a must; `DAY33.idleOffer`); the night corner in the Moked offers the same card once a night. **src/pen** (agent): "הוצאת הטלה מהדיר" — the sliding-pen puzzle (the owner's "להוציא רכב מחניה"): 6×6, the lamb out through the gate, goats/cows/hay/trough/kohen as blocks, BFS solver, seeded generator by level band, hand boards 1–6, hints/undo, stars by moves; docs/PEN35.md. Headless shot test/out/fable32-14-gear.png (the basket with 3 logs on his back, the ▼ on the chip). Tests: day33 11/11, pen 12/12; node 557/0.
- **Build 14.1** (15.10 14:10 — the owner: "יש לחיצה בראש מהגזרים אל המערכה? כי צריך כזו. זו פעולה שהדמות עושה. גם העליה לכבש צריכה להיות לא-אוטומטית"): climbed to the top (the hold), he STAYS there with his basket (stations finish: no return to the foot); nothing is fed by itself; the corner prompt there reads "הניחו על המערכה — הקישו" (`E.work` → `layLogs`): the logs arc from his basket onto the pyre (fx 'unload'), the fire rises, +20 score. The ramp's act is offered only from the foot (`usable('kevesh')` false while up). The ground follows the ramp's slope (groundAt 16 → 25 along it), so a free climb with the stick is possible in principle — to be verified in Chrome when the computer is linked; until then the hold at the foot is the climb. Tests: day33 12/12 (the older ramp tests lay by the tap); node 558/0.
- **Build 15** (15.10 21:00–22:30 — "הכהן האמיתי"; the owner 08:53 "הלובי התלת-ממדי מאוד גרוע ביחס לרמה העיצובית של בראול סטארס… למה?" → the figure of cylinders; 18:40 "יש מה לעשות בינתיים?"): a **rigged, animated glTF kohen** — the CC0 KayKit "Adventurers" Mage (Kay Lousberg; `git clone` from GitHub works through the proxy), pruned and recoloured by `tools/kohen-glb.mjs` (hat/cape/props gone, 20 of 76 clips, constant channels dropped, meshopt: 3.5 MB → 448 KB), the palette atlas repainted (white linen robe, a sash ground of תכלת, barefoot, dark beard; `assets/kohen_tex.png`); docs/KOHEN35.md. **src/avodah/shift/hero35.js**: the model follows the world's hero every frame (x, y, z, yaw, vis) and hides the box-figure; Idle / Walking_A / Running_A by his pace; our props on its bones (the מצנפת on the head, the sash's four stripes on the waist). **The acts play his clips** (stations.js `CLIP35`: the axe chop on every tap of the wood, PickUp at the stores, Interact at the pen and bakers, Use_Item at the laver, Spellcast_Raise for the song, Throw for the sprinklings; Walking_A up the ramp; Cheer on a gold) and take his hands' world places for the props; he is never hidden any more (`S.hero.show(true)` and turned to the thing). flow31's gear (the axe, the back-basket) rides his hand/chest bones. The lobby: he faces the camera (setPos yaw), Cheer and the chop on the cycle; camera 15 amot, el 0.2 (the owner's "⅔ frame"). `build.mjs` inlines `.glb` as a data URL (4.90 MiB of the 5 — a Pages folder will serve it as a file). `__SH_NOHERO35` keeps the old figure for tests. Shots: test/out/fable32-15e-lobby.png (the face), fable32-15e-gear.png (the basket on his back). Also out/hachana-technit.docx — the technician's handout for 16.10 (repo + Pages, the allowed hosts, the computer link). Tests: node 558/0.
