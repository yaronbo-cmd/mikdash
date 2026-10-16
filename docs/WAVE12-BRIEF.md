# Wave 12: variety at the quarry, the Mount that shows its work, a real sky, a music with a pulse, the day's service in detail

2026-09-29, evening. Start 18:25 UTC. Plans on the bus by 18:45. Feature freeze 21:10 UTC. Hard stop 21:25 UTC (00:25 Jerusalem).

## The owner's words, for every agent

**29.9, 21:01 Jerusalem, after playing v21:**
> 1. "המחצבה שלב 2 נשאר אותו משחק קנדי קראש. לא גוון. גם שלב 3 אותו משחק. זה חוזר על עצמו וגם אם קצת יותר קשה עדיין משעמם. צריך
> לגוון עם משחק אחר ואח"כ לחזור לקנדי קראש הקשה יותר בסבב יותר ארוך של משחקים. בירדס זה משחק טוב אפשר לשחק רוגטקה של דוד המלך נגד
> גוליית או משהו בסגנון..."
> 2. "בשלב שיטוח ההר צריך שכשעשים זום אאוט רואים את ההתקדמות של החציבה. אני בשלב 3 עכשיו וזה נראה בדיוק כמו בשלב ראשון, למרות
> שהכהן שלי זז. שזה לכשעצמו מצויין."
> 3. "ותמיד גשום בערב. זה נכון שירד גשם רק בלילה אבל לא כל לילה ירד גשם.."
> 4. "בגדול בשלב ב' של פעולות היום נצטרך לתת יותר פירוט."
> 5. "המוסיקה - האם לא צריך מוסיקה יותר קצבית ומעניינת?"
> 6. (an opening film, possibly paid: the supervisor handles it with the owner; not this wave's work)

**29.9, 20:37 Jerusalem:**
> "שלקראת טקס חנוכת הבית יהיה עניין והפנינג כלשהוא ושבחנוכת הבית תהיה מסיבה וחגיגה ויהיו זיקוקים והרבה אור, אולי אפילו להזמין
> למסיבה מכל קצוות תבל. הכול לייחד ולהמליך שם השם בעולם. עוד רעיון - הלויים שיר של יום בכל יום."

- **Fireworks are anachronistic.** They were invented about a thousand years after the destruction. The supervisor told the owner so, and his answer is pending.
  - Until he answers, the celebration's light is authentic: lamps, torches and the lit courts, in the manner of Simchat Beit HaShoeivah (Sukkah 5:2–4), marked המחשה.
  - No fireworks.
- **He made a table of all the services:** `docs/avodot/rows.json`.
  - It has 118 services by part of day and festival, each with its source and its state in the game.
  - His page is "לוח עבודות המקדש". His כן/אולי/לא marks decide what Phase B adds next.
  - At 18:00 UTC it had no marks yet. The supervisor relays new marks on the bus.

**The compass stays: "זה הכי חשוב שיהיה כיף ומעניין ותקין".** He still loves that the kohen walks from point to point at his work: keep it everywhere.

## Where we are
- **v21 is published.** Master is 51ff175 (wave 11 plus the services table).
- **Read first:**
  - PROJECT.md §8: "Wave 11" and "Next (wave 12)";
  - docs/PRODUCER-S11.md: its top 10 is still owed;
  - the wave-11 notes in bus/w11/ (read-only).

## Rules
The rules of docs/WAVE6-BRIEF.md, WAVE8B-BRIEF.md and WAVE9–11-BRIEF.md apply in full:
- drafts marked טיוטה, each with its exact source;
- never write the Name, not even in code or tests (use ה׳, אלקים, א-ל);
- no gore (the shechita is a cut-away);
- no Ark in the Second Temple, and the player never enters the Kodesh HaKodashim;
- no gambling, loot, purchases or guilt;
- Shabbat and Yom Tov never break a streak;
- Hebrew RTL, phone first, 44-px targets;
- no paid services;
- no sub-agents.

**New for the sling game:**
- no blood and no death shown;
- targets are towers, shields and helmets on poles, not people;
- only in its last level does Goliath fall, like a cartoon, on his face (1 Samuel 17:49);
- no caricature of any people.

**Testing:** real touch at 390×844, no autoplay flags in acceptance tests. Look at every screenshot you take.

**Usage:**
- commit every 15 minutes;
- read big files by ranges;
- keep your outputs short.

**The machine has 2 cores. Every browser run goes through the queue:** `/home/claude/wt/bus/brun <command…>`.
- It is first come, first served, and a run is cut at 10 minutes.
- **New:** the producer's lane. `BRUN_LANE=producer /home/claude/wt/bus/brun …` jumps the line when its last run ended 12+ minutes ago.
- Never `pkill -f` a pattern that matches your own shell.

**Never shadow an imported helper** (`smooth`, `clamp`, `lerp`…) inside a module's closure (v19's yellow wash).

**Budget:** the bundle is ≤ 3 MB (v21 is 2.69 MiB). A library needs ≤ 100 KB minified, and the supervisor's OK on the bus.

## The bus
- It lives at /home/claude/wt/bus/, with a notes file per agent: bus/<AGENT>.md.
- Post your plan by 18:45 UTC, then an update every 40 minutes.
- **bus/PRODUCER12.md is the inbox.** Each note gives:
  - the owner;
  - the severity (P0 stops play · P1 the owner would notice · P2 polish);
  - the stage;
  - the screenshot;
  - what "fixed" looks like.
  Owners answer under the note: fixed at <sha>, or why not.

## The five agents
| agent | worktree · branch | owns |
|---|---|---|
| PRODUCER12 | wt/producer12 · s12-producer | test/produce-*.cjs, new docs/PRODUCER-S12.md, bus/PRODUCER12.md. Plays every stage; changes no game code |
| FUN12 | wt/fun12 · s12-fun | src/games/* (new: sling.js, cycle.js), src/match3/*, src/game/minigames/*, src/game/middot*.js, src/net/*, src/game/hooks/*. A `// ── fun12 ──` fence in src/game/index.js (`playLevel`: the quarry's cycle) and in ui.js if needed. Tests: games-touch, games-rules, match3*, minigames*, middot-touch, net-together, new sling tests |
| SITE12 | wt/site12 · s12-site | src/stages.js, crews.js, batch.js, mount.js, the construction layer's parts of temple.js; main.js `// ── site12 ──`. Tests: site_*.cjs, stages_api*.cjs, crews.cjs; docs/SITE.md |
| WORLD12 | wt/world12 · s12-world | src/game/music.js, src/game/audio.js, src/sky.js, src/life.js, src/crowd.js, src/water.js. The finale's parts of src/game/moments.js (חנוכת הבית). A `// ── world12 ──` fence in index.js `syncTime` (the rain) and in content.js (STORY.rain); main.js `// ── world12 ──`. Tests: music*.cjs, moments.cjs, life-*.cjs, new rain test; docs/MUSIC.md |
| AVODA12 | wt/avoda12 · s12-avoda | src/avodah/*, src/avodah3d.js, src/calendar.js (WORLD12 reads it), content/*.json of Phase B. A `// ── avoda12 ──` fence in index.js/ui.js for Phase B's entry (N69). Tests: avodah-*, calendar.test, hooks-avodah, qa-content-scan; docs/AVODAH.md |

A fence starts with `// ── <agent> ──` and ends with `// ── /<agent> ──`. Only its owner edits inside it, and it stays small: a hook, not a feature. There is no FLOW agent this wave.
- Keep every older fence working.
- Anything else in index.js, ui.js, state.js or content.js: ask on the bus with file:line. The supervisor decides.

## The work

**PRODUCER12: the owner's eyes.** You play; you never change game code.
1. **First:** pass the owner's words above to everyone, in your first bus note.
2. **By 19:15, the Mount (the owner is at its course 3), by touch from its course 1 to course 4:**
   - **Note 2:** a zoomed-out shot at the end of each course, from the same camera (the whole view). Put them side by side in one image. Can a child see the work progress?
   - **Note 1:** five stone-gathering actions ("▶ המחצבה") in a row: which game came each time, and when the board came back, was it harder and was its round longer?
   - Play the sling game's levels by touch.
3. **By 20:15:**
   - Every later stage, in order: a declared jump, then a few minutes by touch each.
   - **Phase B:** the new detail and the day's Levites' song.
   - **The finale:** its build-up and celebration.
   - **The rain (note 3):** on WORLD12's date hook, a night in Sukkot, 10 Cheshvan, 1 Tevet and 20 Nisan.
   - **The music (note 5):** its state and tempo per scene (`music.get()`), and one offline render of the build state.
4. **Every note answers:** is it fun, is it interesting, is it working?
   - Can I see my kohen (≥ 80 px, in frame; K80 logged at every shot)?
   - Does he walk from point to point?
   - Do I know what to tap?
   - Is anything floating, flickering, stuck, zoomed out, too dark or too yellow?
5. **From 19:30, every ~40 minutes:** re-play the fixes on a throwaway merge of the others' branches (wt/peek12), through your lane.
6. **By 21:05, the verdict:** docs/PRODUCER-S12.md.
   - Each stage ✓/½/✗, with evidence.
   - The notes' state.
   - `produce-play --stages` on the merge.
   - The top 10 for wave 13.
   - ⚑ lines in Hebrew, each with a default.

**FUN12: variety at the quarry (note 1).**
1. **The quarry's cycle.** Every "▶ המחצבה" (a 'play' action, `playLevel` in index.js) now takes the next game of a cycle.
   - The order: the board, then other games, then the board again, harder, in a round that grows. The default: board → 2 games → board; the next cycle has 3 games between boards.
   - The other games pay the step's need the way the board does: the same accounting path (`grantLevel`, the live meter, `starBonus` or its equal). So the build never slows.
   - They are games that fit the work: נדבך על נדבך (stack), the new sling, and the quarry's own precision game (channels and wedges), or others you justify.
   - The pill says which game is next ("▶ הקלע של דוד · כ־40 אבנים").
   - A cycle's place is saved and survives a reload.
   - Tests: a node test of the cycle's order and pay; a touch run of five actions in a row.
2. **"הקלע של דוד": a new game in the Angry Birds manner, in our world, original art.**
   - **The controls:** pull the sling back and release, by touch (44 px). Dots show the arc for the first shots of a level.
   - **The stones:** five per level, "וַיִּבְחַר לוֹ חֲמִשָּׁה חַלֻּקֵי אֲבָנִים מִן הַנַּחַל" (שמואל א יז, מ).
   - **The levels:** 8–12. Towers of beams and stones, shields and helmets on poles, knocked down by physics. The last level is Goliath, who falls on his face (יז, מט). No blood.
   - **The facts at the end of a level** (drafts, sourced):
     - a sling, not a slingshot: "כָּל זֶה קֹלֵעַ בָּאֶבֶן אֶל הַשַּׂעֲרָה וְלֹא יַחֲטִא" (שופטים כ, טז);
     - David gave the spoils of his wars to the House's building (שמואל ב ח, יא; דברי הימים א יח, ח; כו, כז);
     - he bought the threshing floor that became the altar's place (שמואל ב כד, יח–כה);
     - Goliath's sword was kept at Nob behind the ephod (שמואל א כא, י).
   - **Physics:** a small library (matter-js or planck, ≤ 100 KB minified) or your own. Ask on the bus.
   - **A duel on one phone:** turns, if time allows.
3. **The board comes back harder:** a higher level, a longer goal. The owner: "לחזור לקנדי קראש הקשה יותר בסבב יותר ארוך של משחקים".
4. **If time allows:** the games' table found by a child (PRODUCER-S11 #9).
5. **Keep green:**
   - games-touch, games-rules, match3, minigames;
   - middot-touch, net-together;
   - their node tests.

**SITE12: the Mount shows its work (note 2), and the producer's world items.**
1. **Each course of the Mount changes what you see from far.**
   - The hill's crest comes down in steps, course by course: benches, fresh pale cut faces, spoil heaps and carts, and the platform's retaining wall rising in the bay.
   - Today the hill's shape is almost fixed after the first course (stages.js: the hill shader's `uCut` and its "85 % at once" low ground, ~l.303–308, and `uCut = smooth(FOUND, 0.95, disp)` ~l.5057).
   - Make the progress stepwise and legible from the zoomed-out view at every course.
   - **The test:** shots of the whole view at courses 1…6 from one fixed camera. A measured difference between consecutive courses (for example ≥ 3 % of the Mount's pixels changed), and you look at them.
2. **A clear line to the kohen at every frame** (PRODUCER-S11 #1: N45, N47, N55): the world's side. No built mesh between the camera and his chest at the altar, the chambers and the court walls.
3. **The corner stone seen on the hook and landing** (N64).
4. **No iron at the altar** (N59): the tool in his hand at yesod, sovev, guf and karnot.
5. **The Ulam's dig rock** (N61).
6. **Keep green:**
   - site_mount, site_api, stages_api*, crews;
   - ≤ 150 draw calls per phone view.

**WORLD12: a real sky, a music with a pulse, and the celebration.**
1. **The rain (note 3).**
   - **When:** it rains on some nights, by the real Hebrew date (src/calendar.js):
     - none from Pesach until after Shemini Atzeret;
     - a small chance until 7 Cheshvan;
     - winter nights (Kislev to Shevat) about 35 %;
     - fewer in Adar and Nisan.
   - **Always the same:** a night's rain is decided by its date (a seeded hash), so all players see the same night and a reload never flips it.
   - **Only at night** (Taanit 23a; Josephus, Ant. 15.425).
   - **The dry nights:** clear stars and the moon at its phase by the Hebrew date (full on the 15th).
   - **The story card** "גשם רק בלילה" on the first rainy night.
   - **A date hook for the producer:** `window.__FORCE_DATE = 'YYYY-MM-DD'`.
   - **A node test** of the calendar's rain rules.
2. **The music (note 5): "יותר קצבית ומעניינת".**
   - The build state is 70 BPM today. Take it to about 100–110.
   - **Grooves:** original tof and darbuka patterns in the manner of maqsum and baladi, a bass line on the nevel, and a short original theme motif that returns.
   - **Intensity follows the work:** strikes per minute bring a second drum layer and the motif. A fill ends each course.
   - **A festive state** for key moments and the finale.
   - **The quarry's games:** the board state, or a new one for the cycle's games.
   - **Phase B keeps the Levites' instruments only.** Give AVODA12 a `shir` state for the daily song: kinnor, nevel, chalil and tziltzal, with trumpet blasts at the section ends (Tamid 7:3).
   - **Still:** no audio files, no existing melody, no liturgy.
   - **Tests:** offline renders, tempo and onset density.
3. **The finale (20:37): a build-up toward חנוכת הבית, and a celebration full of light.**
   - **The build-up:** as the last stages near their end, pilgrims arrive from every land, each named: Babylon, Egypt, Rome, Persia, Yemen and more. They bring gifts, the city fills, and lamps are hung.
   - **The celebration at night:** the golden house lit, torches and lamps in the courts, the Levites' music and the crowd. It is an illustration (המחשה), in the manner of Sukkah 5:2–4.
   - **Its sources:** Ezra 6:16–18; Josephus, Ant. 15.421–423 (300 oxen; the day of the king's accession).
   - **No fireworks** (⚑ owner).
   - **If time allows:** a card "הזמינו חברים לחגיגה" that opens "כהנים יחד" (FUN12's net; agree on the bus).
4. **Keep green:** music.cjs, music-touch.cjs, moments.cjs, life-*.cjs.

**AVODA12: the day's service in detail (note 4, and the Levites' song every day).**
1. **The Levites' song of the day, every day (20:37).**
   - **The moment:** at the nesachim the Levites stand on the duchan with kinnor, nevel, chalil and tziltzal, and the day's psalm is shown (content/shir_shel_yom.json, the forms ה׳ and א-ל) with its source.
   - **The sections:** its three sections, each with its blast and the people's bowing (Tamid 7:3–4).
   - **The sound:** WORLD12's `shir` music state.
   - **On Shabbat:** the Musaf's Haazinu (RH 31a), marked ⚑ draft.
2. **More of the day (note 4), from docs/avodot/rows.json.** Take its daily rows marked `part` or `no` and build the 5–6 that are the most fun as short steps or moments, each with its source. Candidates:
   - the chavitin (a006, a036, a056);
   - the 93 vessels (a016);
   - the three blasts at the opening of the gates (a017);
   - the closing of the gates at evening (a058);
   - choosing tomorrow's lamb among the six inspected (a057);
   - the eternal fire (a061);
   - the men of the ma'amad (a063).
   No gore.
3. **N69:** Phase B greets him by the name he chose in Phase A and does not ask again. Its button's words stay "יאללה לעבודה" until the owner decides.
4. **The owner's marks:** when the supervisor relays them on the bus, they come first.
5. **Keep green:**
   - avodah-harness, avodah-*.test.mjs, calendar.test, hooks-avodah;
   - qa-content-scan.

## At the hard stop (21:25 UTC)
- **Your branch:**
  - everything is committed;
  - it builds;
  - your tests are green, or each failure is explained;
  - `git merge-tree --write-tree master s12-<you>` is clean.
- **Your final message** is your report:
  - what you built, by file:line;
  - the real-touch results;
  - the screenshots (you looked at them);
  - the bundle delta;
  - ⚑ lines in Hebrew, each with a default;
  - requests, as file:line.
