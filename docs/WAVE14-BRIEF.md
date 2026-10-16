# Wave 14: more building work than dressing stones (the owner's daughter)

2026-10-01. Part 0 (the brainstorm) runs first. Part 1 (the build) starts when the supervisor has fixed the picks below.

## The owner's words, for every agent

**30.9, 23:27 Jerusalem** (after his daughter played on her phone):
> "טוב, יש כמה הערות לילדה שלי ששיחקה מהנייד.
> דבר ראשון - מטבעות. כל שלב שאתה מצליח אתה מקבל מספר מטבעות בהתאם לקושי של המשימה כמות המטבעות ועם המטבעות האלה את קונה דברים.
> שתיים - בשלב ההקשות על הסלע, המשחקון לא ברור, בעיקרון שלוש הקשות זה אבן מסותתת, אבל מכה מדויקת אחת היא גם מסתתת, אבל השחקן לא יודע איך ועל מה ללחוץ כדי לתזמן מכה מדויקת. צריך לשפר את זה.
> שלוש - והכי חשוב בגרסה הזו - הילדה מציעה שחוץ מלחצוב אבנים שיהיו עוד פעולות שהשחקן עושה (כי זה ארוך ומשעמם, היא רק "בורחת" למשחקי הביניים..) צריך לחשוב על זה היטב, אילו עוד פעולות בנייה השחקן יכול לעשות לגוון. אבקש שכל הסוכנים ביחד יעשו סיעור מוחות בעניין הזה, בייחוד המנהל והאחראי על הכיף. אני יודע שזה מצריך כח ואנרגיה. אבל לכו על זה בכל הכח. בסופו של דבר זה המשחק. בהצלחה חבר'ה.
> ועוד הערה - הדמות עדיין לפעמים צפה באוויר או שוקעת תשומת לבכם. בהצלחה חברה. לילה טוב. אתם עושים עבודה נפלאה. להשאיר מתח עבודה גבוה."

**The compass: "זה הכי חשוב שיהיה כיף ומעניין ותקין".** He loves the kohen walking from point to point at his work.

## Where we are
- **v26 is published:** wave 13 is merged. Master is the merge plus BRAINSTORM14.
- **Read first:**
  - **docs/BRAINSTORM14.md**: the supervisor's seed. It has the numbers (§1), the finding that the moments hold 15 actions played once each (§2), the principles (§3), a pool of 28 jobs (§4), the course loop (§5), the coins (§6), the strike (§7), the floating kohen (§8);
  - **the family's votes:** the vote page (artifact T9iqzBo9mQPYoPGXQf7Ufk; the supervisor reads it with ArtifactData and pastes the result into bus/VOTES14.md);
  - docs/PRODUCER-S13.md §0 headline: "the first course end comes 3.5–4.5 minutes after a pick".

## Rules
The rules of docs/WAVE6–13-BRIEF.md apply in full:
- drafts marked טיוטה, each with its exact source, or המחשה;
- never write the Name, not even in code or tests (use ה׳, אלקים, א-ל);
- no gore;
- no Ark in the Second Temple, and the player never enters the Kodesh HaKodashim;
- no gambling, no loot, no real-money purchases, no guilt; coins buy at fixed prices only;
- Shabbat and Yom Tov never break a streak or cost anything;
- Hebrew RTL, phone first, 44-px targets;
- no paid services;
- no sub-agents.

**Testing:** real touch at 390×844 on **dist/test.html** (it has the viewport meta; temple3d.html is the artifact's fragment and lays out 980 px wide under a phone's emulation). No autoplay flags in acceptance tests. Look at every screenshot you take. Test in the demo, as the owner does.

**Usage:** commit every 15 minutes; read big files by ranges; keep your outputs short.

**The machine has 2 cores.** Every browser run goes through `/home/claude/wt/bus/brun <command…>`. A run is cut at 10 minutes. The producer has a lane (`BRUN_LANE=producer`).

**Budget:** raised for this wave to **≤ 3.25 MB** (v26 is 3,085,797 bytes; gzip 1.0 MB).
- A job costs ≤ 15 KB; the shop ≤ 20 KB.
- Reuse the moments' code and the frame (src/game/minigames/frame.js), draw with code, and add no new libraries.
- Move dead weight out where you find it.
- Report your delta.

## Part 0: the brainstorm (all agents together, about 35 minutes) — ✓ done 1.10 05:43–06:10 UTC at the owner's word ("סיעור מוחות - כעת"); the files are in docs/brainstorm14/

**Each agent writes `bus/BRAIN14-<AGENT>.md`.**

1. **Minutes 0–20: your list.**
   - **5 new ideas** that are not in BRAINSTORM14 §4. Each gets one line apiece for:
     - the gesture;
     - what the kohen does in 3D, and what stays in the building after;
     - its stage(s);
     - its source (or המחשה);
     - why a child of 8–12 would like it;
     - its effort (S / M / L) in our code.
   - **Your top 6 of all ideas** (§4 and yours), for her, with one line why.
   - **3 cuts:** what in §4 would be boring, wrong or too costly, and why.
   - Your lens's own answer (below).
2. **Minutes 20–30: the others.** Read the other four files and the votes. Append `## Response` to your own file: what you would merge, what you disagree with, and what you would build first.
3. **FUN14 (the fun owner), minutes 30–35:** write `bus/BRAIN14-JOINT.md`.
   - The joint pick: the jobs for Part 1, in build order, with an owner each.
   - Fit it to five agents for about two hours, and to 14 KB.
   - Also: the deck for each of the 15 stages, and what is left for wave 15.
4. **Your final message:** your top 6 and your 3 cuts, in under 250 words.
5. No code in Part 0, and no browser runs.

**The lenses:**
- **FUN14, the fun owner:** what her thumb does in the first 3 seconds of a job; the deck and the choice ("מה נעשה עכשיו?"); the pacing targets (§5); the course loop (does the strike become help?).
- **GAMES14:** which moment mechanic generalizes most easily into a repeatable job with three levels (moments.js); which new gesture is the most fun per hour of work; a two-player job on one phone.
- **SITE14:** what looks best in the 3D world and stays visible in the building; how the kohen and a partner perform each job at his banker; the floating/sinking fix (§8): its probe and its cause.
- **ECON14:** the coins and the shop (§6); the pay table by difficulty and stars; what a child would save up for; the strike's legibility (§7). Read the family's vote on ring vs. bar.
- **HISTORY14:** what the builders of the Second Temple and Herod's rebuilding really did:
  - Josephus, *Antiquities* 15.11 and *War* 5.5;
  - the Mishnah, Middot;
  - the Bavli (סוכה נא ע״ב, בבא בתרא ג ע״ב–ד ע״א, תענית כג ע״א);
  - the archaeology around the Mount.
  New authentic jobs from them. Then **verify every source in BRAINSTORM14 §4**: the exact words and the ref, using the repo's verified content first (content/*.json, src/middot.js) and Sefaria where you can reach it. Write a table: ✓ verified / ✗ wrong (with the right one) / ? unreachable.

## Part 1: the build — launched 1.10 at 12:25 UTC (the owner, 15:00 Jerusalem: "אפשר להתקדם עכשיו")

**Times (UTC):**
- start 12:25; plans on the bus by 12:40;
- the first throwaway merge for PRODUCER14 (wt/peek14) at ~13:10, then every ~40 min;
- feature freeze **14:25**, hard stop **14:40**.

**If the account's usage limit cuts you** (it cut every agent at about 2 h 35 min last night), the supervisor resumes the work by itself when the limit resets, as the owner asked ("כשהמכסה תחזור תתחיל שוב.. עצמאית"). So that nothing is lost:
- **commit every 15 minutes;**
- **keep your report on the bus, updated every 30 minutes;**
- **end your bus file with a `NEXT:` line:** the item you would do next, with file:line, so a resumed agent picks it up.

### Her votes (VOTES14.md; she voted 1.10 07:45–07:52 UTC)

The vote page promised her **"את מה שתאהבי, נבנה קודם"**. Her ❤️ jobs therefore come first in every owner's list, and the round's other picks follow:
- **her ❤️ jobs:** gold (שפשוף הזהב), saw (ניסור קורות ארז), raise-column (מקימים עמוד), arch (בניית קשת), line (החוט הצבוע), letters (חריטת אותיות), treadwheel (גלגל הדריכה), wheel (הגלגל בלשכת הגולה), rafts (רפסודות הארזים);
- **her 👎:** weave, which is already out;
- **the strike: the ring**, her choice and her father's;
- **the shop, her ❤️:** machines, tools, האבן שלי, the Levites' instruments, lamps.

She overrules three of the round's cuts. They come back in the forms below:
- **the treadwheel:** המחשה; the crews' treadwheel cranes already stand at every walled site;
- **the rafts:** a 2D game, with no new 3D scene;
- **the arch:** Robinson's Arch, already modeled.

What doesn't fit tonight goes to the resumed wave (14b).

### The decisions (the manager's, from the round and her votes)

**D1. The course loop (FUN14).**
- **Jobs per course:** J = clamp(round(10 / C), 1, 3), and at most the deck's size. So about 10 jobs a stage.
- **A job's work:** each job sets ⌈the course's stones left ÷ its jobs left⌉ through S.quickSet, and the crews' stones count in. Stars pay coins, not work.
- **The deal, "מה נעשה עכשיו?":**
  - two cards and one ↻;
  - one stone card and one card of another craft (Herod had priests taught as masons and as carpenters, Ant. 15.11.2). Without a craft card in the deck, two gesture families;
  - never the job just played;
  - "חדש!" on a job not yet played here;
  - the stage's signature within the first two deals;
  - at most one key stone a course. One she doesn't pick is set by the crane at q 0.8.
  - **Her ❤️ jobs go in every deck where they fit.** For example, har's deck has the arch (Robinson's Arch), the column (the Stoa), the letters ("לבית התקיעה") and the snap-line.
- **Materials (the regular game):** a job's stones come from the site's stock. When the stock can't pay, the stone card is the quarry cycle's next game ("▶ הביאו אבנים", src/games/cycle.js). game-sim checks that waits do not grow beyond v26's.
- **The checks:** the plumb and the level close the course. They are not cards.
- **The strike:** a card, "סתת בקצב" (10 strikes, ~20 s, paid by accuracy). A free tap outside a job still helps the crews, unpaid.
- **The moments** stay as they are this wave.
- **Pacing:** a job 20–30 s; a course 40–80 s; a stage 7–12 min; no gesture over 25 s; a new kind of job at least every 90 s.

**D2. Stars and coins (ECON14).**
- **Stars:** a finished job = ★, q ≥ .7 = ★★, q ≥ .9 = ★★★, never ☆☆☆.
- **Pay:** coins = stars × (level + 2). A skip pays 3; a course end +5; the moment ×2 on top of REWARD.
- **The coin:** the silver (key `silver`), shown as a coin with a number. In sentences it is "מטבעות", her word. Its face is match3's pomegranates, never a Tyrian shekel.
- **The purse** opens **"אוצר המלאכה"** (עזרא ב, סט: "ככחם נתנו לאוצר המלאכה").
- **Paid at once** (Ant. 20.220). The first pay's card: "ויתנו כסף לחצבים ולחרשים" (עזרא ג, ז).
- **The treasurer** pays a survey's or a dig's shortfall ("הגזבר שילם מקופת המקדש"; שקלים ה, ב).
- **Rules:** fixed prices, nothing random, no timers. Closed on Shabbat and Yom Tov, with nothing lost. In-between games pay at most half a job's rate a minute.

**D3. The precise strike: the ring, as she chose (ECON14).** The vote page's demo is the model (docs/brainstorm14-vote.html, the strike lab):
- a fixed gold target circle on the stone, and the ring closes onto it at the beat;
- the target glows inside the window, and "עכשיו!" shows at the beat;
- **taught once:** on the first stone after the tutorial the beat comes slowly (2.0 s, then 1.4, then 0.86). A hand taps as the ring meets the gold: "הקש כשהטבעת נוגעת בזהב". After five tries it moves on;
- **feedback:** "מוקדם, חכה עוד רגע", "מאוחר, הקש קצת קודם" or "מדויק! מכה כפולה" (a gold burst, and the stone jumps a dressing state). Words for the first 8 misses only. The combo reads "3 ברצף!";
- the music ticks on the ring's close, and the tof sounds on the beat.

**D4. Sources: HISTORY14's table governs** (docs/brainstorm14/BRAIN14-HISTORY14.md §5).
- **A2:** altar firewood only.
- **B3:** quote only "ומלבנים אותן פעמים בשנה" and "לא היו סדין אותן בכפיס של ברזל". The cloth is "מלבנים אותו במפה" (רבי).
- **B15:** "לשכת הגולה, שם היה בור קבוע, והגלגל נתון עליו" (מדות ה, ד).
- **B20's half-amah** is מדות ב, ג.
- **מדות ג, ח:** "מכתלו של היכל לכתלו של אולם" and "ושרשרות".
- **The arch:** Robinson's Arch (archaeology) and Ant. 15.11.5, never פרה ג, ג.
- **B13:** "לבית התקיעה" (Mazar 1968) and War 4.9.12.
- **The rafts:** עזרא ג, ז and דברי הימים ב ב, טו ("רפסדות על ים יפו").
- **המחשה** on the saw, the bellows, the pour, the snap-line, the mallet, the treadwheel and the rafts' route.
- **No quote from a verse that holds the Name:** זכריה א, טז as a fragment only; עזרא ח, לג never.

**D5. Cut, and later.**
- **Cut:** B7 (counting), A1's quiz, A7 as a job, B4, the weave (her 👎).
- **Wave 14b/15:** whatever her list doesn't reach tonight, then:
  - the aqueduct, the waves, F1, plaster's and bronze's skins if missed, the fill;
  - כלונסות הארז, the chains, B9 as a job, B2 → A5, B20, A4, the horns, the ravens, the rosette;
  - חן חן לה as the end beat; E1 the scales; E3 the oxen; the moments as level 4.

### The five agents
| agent | worktree · branch | owns |
|---|---|---|
| FUN14 | wt/fun14 · s14-fun | **The course loop:** new src/game/jobs.js (the registry, the decks, the deal, playJob, J); in index.js `// ── fun14 ──` fences (the course's call sites, the strike card); ui.js and ui.css.js fences (the deal's sheet and cards, the pips); content.js `DECKS` (fenced); new src/game/minigames/place.js (the arch, then F1); new snap.js (the line); wheel.js (stretch). Tests: new test/course-jobs.test.mjs, game-harness, game-flow, game-touch, game-courses-touch (1, 2, wall) |
| GAMES14 | wt/games14 · s14-games | **The jobs' games:** src/game/minigames/frame.js (the drag channel); new saw.js, cover.js, pull.js, tread.js and rafts.js. Tests: minigames.test, minigames-touch, new test/jobs-touch.cjs, games-touch |
| ECON14 | wt/econ14 · s14-econ | **The coins, the shop, the ring, the letters:** content.js `PAY` (fenced); state.js `payJob` and the treasurer (fenced); the purse and the coins' flight; new src/game/shop.js (אוצר המלאכה); the ring's legibility and the teach (index.js runJob and ui.js ring, in `// ── econ14 ──` fences); music.js instrument gains (fenced); new minigames/draw.js (the draw pad: האבן שלי's mark and the letters). Tests: new test/econ.test.mjs, game-sim |
| SITE14 | wt/site14 · s14-site | **The kohen on the ground, and the jobs in the building:** src/stages.js (the hero's height, groundAt, footings, `jobReveal`, the stone's mark), temple.js, crews.js, mount.js and a main.js fence (Robinson's Arch, the Stoa's columns). Tests: new test/hero-ground.cjs, site_*, stages_api*, crews |
| PRODUCER14 | wt/producer14 · s14-producer | test/produce-*.cjs, new docs/PRODUCER-S14.md, bus/PRODUCER14.md. Plays every merge by touch, as the owner and as his daughter would; changes no game code |

Fences: a fence starts with `// ── <agent> ──` and ends with `// ── /<agent> ──`. Only its owner edits inside it. Keep every older fence working. Anything outside your files: ask on the bus with file:line, and the supervisor decides.

**The contracts** (post the signatures on the bus by 12:45):
- **A job** is a frame game plus `{id, kind: 'stone'|'craft', family, sites, src}`. playJob (FUN14) runs it, S.payJob (ECON14) pays it, and stages.jobReveal(id, kind, q) (SITE14) leaves it in the building.
- **GAMES14's drag channel** lands first, in one commit announced on the bus. Everyone's drag, hold and trace games build on it.

### The work (her ❤️ marked ❤️)

**FUN14: the course loop.**
1. **src/game/jobs.js:**
   - the registry and the decks per stage (BRAIN14-JOINT (b), with her jobs added where they fit);
   - J;
   - the deal (D1);
   - playJob: the walk to the spot, the game, S.quickSet × the share, S.payJob, stages.jobReveal;
   - `G.jobs` in the save. Three ★★★ raise a job's level.
2. **The deal's sheet "מה נעשה עכשיו?":** two big cards (the gesture's looping hand, the name, "עד N מטבעות", "חדש!"), the ↻, and the pips (●●○) on the pill.
3. **The strike card "סתת בקצב"** on ECON14's ring. Free taps still help the crews, unpaid.
4. **The materials rule (D1).**
5. **❤️ "החוט הצבוע"** (snap.js, S): each course opens with it. Pull the dyed cord taut, lift it, release: snap! The chalk line stays on the course (SITE14). Its source: זכריה א, טז ("וקו ינטה על ירושלים", these words only); the snap-line is המחשה.
6. **❤️ "בניית קשת"** (place.js; the arch is its first skin):
   - the voussoirs seat in order from both sides, the keystone last; then two taps knock out the wooden frame's wedges, and the arch stands;
   - at har, Robinson's Arch rises stone by stone (SITE14's reveal; mount.js 109–125);
   - L1: 5 stones · L2: 7, matched by size · L3: 9, with an even knock-out;
   - then **F1 "השלם את הנדבך"** as place.js's second skin.
7. **Stretch: ❤️ "הגלגל בלשכת הגולה"** (wheel.js: circle the finger to turn the wheel over the cistern; water for the whole court, at lishka; the mukhni at kiyor, יומא ג, י).
- **Acceptance:**
  - **test/course-jobs.test.mjs:** J per stage; the deal's rules over 1,000 deals; the shares set the course; an empty stock deals the quarry.
  - **The courses tests (game-courses-touch 1, 2, wall) play the deal's cards by touch.** Update them, and keep their K80, banker and slot checks.
  - game-harness, game-flow and game-touch stay green, or each change is explained.
  - A course takes 40–80 s by touch in the demo at har and at the wall.

**GAMES14: the jobs' games.**
1. **frame.js:**
   - **the drag channel:** pointermove/up/cancel → `M.drag(x, y, phase, id)`; `auto()`/`simulate()` take `{x, y, p}`; `cue()` may return `{x, y, x2, y2}`; `buttons[].hold` → `press(id, down)`; `game.tall`;
   - **the first touch is a move;**
   - **the star floor.**
   One commit, ~3 KB. Announce it on the bus at once.
2. **❤️ saw.js "ניסור קורות ארז":** solo first. Pull toward yourself on the partner's off-beat, on the line (BRAIN14-GAMES14's levels; q = .5 beat + .3 line + .2 par). Then the duel on one phone (the top half turned; the halves alternate; both at once: it sticks, a laugh).
3. **❤️ cover.js "שפשף עד שיבריק":** the gold, at gates, ulam, heichal and kodesh. Its other skins come cheap: "סיד על המזבח" (the cloth, the four altar stages) and "נחושת מצהיבה" (nikanor, kiyor; מדות ב, ג).
4. **❤️ pull.js "מקימים עמוד":** hand over hand; too fast and it sways, but it never falls. Release when the plumb hangs true. One more column stands in the Stoa (War 5.5.2; Ant. 15.11.5: three men with arms outstretched round one).
5. **❤️ tread.js "גלגל הדריכה":** two hold buttons, left and right, walk the wheel in step, and the stone rises. Stop it on the gold mark, then the crane sets it. It is a stone card at every walled site; המחשה (the Roman treadwheel crane, Vitruvius 10.2).
6. **Stretch: ❤️ rafts.js "רפסודות הארזים":** a 2D steering game from Lebanon to Jaffa, between rocks and waves. The cedar reaches the site. Sources: עזרא ג, ז; דברי הימים ב ב, טו.
- **Acceptance:**
  - each job ≤ 15 KB;
  - its solver scores ★★★ at L1 and ≥ ★★ at L3; mashing scores lower; idling ends kindly;
  - 44-px targets; its result card has a sourced fact (טיוטה) or המחשה;
  - **test/jobs-touch.cjs** plays each job by real touch (CDP drags) at 390×844, and you look at its shots.

**ECON14: the coins, the shop, the ring, the letters.**
1. **❤️ The ring, legible (D3).**
   - Acceptance: game-touch and the courses tests stay green; PRODUCER14 measures a first-time player's first perfect strike within 5 tries.
2. **PAY, S.payJob, the purse and the coins' flight** (≤ 12 sprites, ≤ 1.2 s, a tap skips): the first pay's card and the treasurer's net. It lands with FUN14's first job.
3. **❤️ אוצר המלאכה v1, her five:**
   - **the machines and the tools**, UPGRADES re-skinned and seen: the hammer and chisel in his hands, the treadwheel's walkers, the ox carts (their 3D with SITE14);
   - **האבן שלי:** the draw pad (draw.js); the crane sets her stone in this course (SITE14's mark);
   - **the Levites' instruments:** music.js gains; "הדוכן שלם" at the full set (ערכין ב, ג; ב, ה);
   - **the lamps:** a Herodian clay lamp at her banker, lit at dusk (up to 6).
   Her first purchase comes in minutes 5–8 (the mentor says so once). Then the vine's gifts, if place.js has landed.
4. **❤️ "חריטת אותיות"** (draw.js's second use): trace the letters of "לבית התקיעה" on the corner parapet stone at har's last course (the stone found in 1968 below the south-west corner). The stone keeps the inscription (SITE14).
5. **If free:** pipes.js "אמת המים", after claiming it on the bus.
- **Acceptance:**
  - **test/econ.test.mjs:** the pay table; nothing random, no timer; Shabbat closes the shop with nothing lost;
  - **game-sim:** ≈ 150–180 coins a stage; the first purchase by minute 8; the materials' waits;
  - every shop button ≥ 44 px, by touch.

**SITE14: the kohen on the ground, and the jobs in the building.**
1. **test/hero-ground.cjs, before any fix** (BRAIN14-SITE14's probe): 15 stages × their phases × the dep orders; 5 down-rays; the hill's heightAt; a table of float and sink per stage, with crops of the worst five, looked at.
2. **The fix, by reach:**
   - (a) the height filter (stages.js 3573) only for rises ≤ 0.6;
   - (b) stairs as stairs;
   - (c) reveal-aware surfaces;
   - (d) a fade over an edge > 1 amah;
   - (e) footings 0 → 6 under the base-6 parts.
   Re-run until 15 of 15 are ≤ 0.2 amah.
3. **stages.jobReveal(id, kind, q), for her jobs first:**
   - ❤️ the gold;
   - ❤️ the saw (sawB at the crews' bench, the plank pile);
   - ❤️ the Stoa's column (the count and the tilt);
   - ❤️ Robinson's Arch, stone by stone;
   - ❤️ the chalk line on the course;
   - ❤️ the treadwheel's spin and the stone on its rope;
   - ❤️ the inscription stone and her mark;
   - ❤️ the lamps at her banker;
   - the machines;
   - then the plaster (one uniform).
   All with 0 lasting draw calls where possible.
- **Acceptance:** hero-ground 15/15 ≤ 0.2; site_mount, site_api, stages_api* and crews green; ≤ 150 draw calls at every job's frame.

**PRODUCER14: the owner's eyes, and his daughter's.**
1. **The v26 baseline, by touch,** in the REGULAR game (a fresh phone, normal mode) and in the demo. Over har's first 10 minutes, record: the gestures, the longest run of one gesture, the time to the first course end, and every moment she would escape.
2. **Every merge** (wt/peek14, ~40 min) by touch, as she would:
   - each of her ❤️ jobs;
   - the deal's cards;
   - the purse, the first purchase and her five shop items;
   - the ring's first tries;
   - in the regular game, the waits for materials.
3. **The K80 gate:** produce-play `--stages`, in two parts.
4. **The verdict, docs/PRODUCER-S14.md:**
   - per stage ✓/½/✗;
   - each ❤️ job ✓/½/✗;
   - the numbers before and after;
   - the top 10 for wave 14b/15;
   - ⚑ lines in Hebrew, each with a default.

### At the hard stop (14:40 UTC)
- **Your branch:**
  - everything is committed;
  - it builds;
  - your tests are green, or each failure is explained;
  - `git merge-tree --write-tree master s14-<you>` is clean.
- **Your report is on the bus already**, ending with `NEXT:`:
  - what you built, by file:line;
  - the real-touch results and the shots you looked at;
  - the bundle delta;
  - ⚑ lines in Hebrew, each with a default;
  - requests, as file:line.
  - Under 700 words.
