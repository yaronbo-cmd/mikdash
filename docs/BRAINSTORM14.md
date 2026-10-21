# BRAINSTORM14: more building work than dressing stones

**Who and when:** the supervisor (the manager), 1.10.2026 morning. This is the seed for the agents' brainstorm that opens wave 14.

**Status:** a draft. Every source below is marked *to verify* until CONTENT/SERVICE checks it against the text. Every player-facing line stays **טיוטה** with its exact source, and **המחשה** where there is no source.

## 0. Her words (verbatim) and the owner's ask

The owner, 30.9 23:27, after his daughter played on her phone:

> "טוב, יש כמה הערות לילדה שלי ששיחקה מהנייד.
> דבר ראשון - מטבעות. כל שלב שאתה מצליח אתה מקבל מספר מטבעות בהתאם לקושי של המשימה כמות המטבעות ועם המטבעות האלה את קונה דברים.
> שתיים - בשלב ההקשות על הסלע, המשחקון לא ברור, בעיקרון שלוש הקשות זה אבן מסותתת, אבל מכה מדויקת אחת היא גם מסתתת, אבל השחקן לא יודע איך ועל מה ללחוץ כדי לתזמן מכה מדויקת. צריך לשפר את זה.
> שלוש - והכי חשוב בגרסה הזו - הילדה מציעה שחוץ מלחצוב אבנים שיהיו עוד פעולות שהשחקן עושה (כי זה ארוך ומשעמם, היא רק "בורחת" למשחקי הביניים..) צריך לחשוב על זה היטב, אילו עוד פעולות בנייה השחקן יכול לעשות לגוון. אבקש שכל הסוכנים ביחד יעשו סיעור מוחות בעניין הזה, בייחוד המנהל והאחראי על הכיף. אני יודע שזה מצריך כח ואנרגיה. אבל לכו על זה בכל הכח. בסופו של דבר זה המשחק.
> ועוד הערה - הדמות עדיין לפעמים צפה באוויר או שוקעת תשומת לבכם."

**The compass (his words, 29.9):** "זה הכי חשוב שיהיה כיף ומעניין ותקין".

**Who plays:** his daughter, and the game's audience of young boys, about 8–12. She played on a phone. Assume she doesn't read long text, plays in short sessions, and leaves anything that repeats.

## 1. What a child does now: the numbers (from content.js PROJ)

| Verb | Times over the whole Phase A | Where |
|---|---|---|
| **The strike: 3 taps a stone** (a perfect one counts 2) | **2,684 logical stones × 3 = 8,052 strokes**, shared with the crews. An active player makes thousands of the same tap. | every course of every stage |
| The crane game (a key stone) | ≈ 75 | the first stone of a course, every other course's corner, the lintels |
| The dressing game (a cornerstone) | ≈ 70 | every other course's corner |
| The plumb and the level (the course check) | ≈ 45 | every 2 courses, and every course at the Mount |
| The whole stones (the altar) | 9 | the altar's courses |
| The quarry (a block in the bedrock) | 6 | the Mount's corners |
| **Each key moment** (15 different mechanics!) | **1 each** | at each stage's end |
| The in-between games (11 kinds) | as often as she likes | the hub and the quarry's cycle. **This is where she escapes.** |

Courses per stage: har 6 · wall 8 · gates 6 · nashim 6 · sorag 3 · nikanor 6 · lishka 6 · yesod 2 · sovev 2 · guf 4 · karnot 1 · kiyor 1 · ulam 10 · heichal 14 · kodesh 10. That is **85 courses**.

## 2. The finding: we already own the variety, in the wrong place

The game already has **15 different hand actions**, but they live in the key moments, each played **once**:

| Moment | Its action | Its gesture |
|---|---|---|
| greatStone | lower the great stone | hold, then release on the mark |
| wall | choose the stone whose joint doesn't fall over a joint | tap one of three |
| gates | the side where each gate stands | tap a side |
| nashim | find the logs with worms (מדות ב, ה) | find and tap |
| breaches | close the 13 breaches (מדות ב, ג) | tap targets |
| nikanor | hold the door in the storm (יומא לח ע״א) | hold steady |
| lishka | the chisel over the stone, strip after strip (גזית) | swipe strips |
| yesod | choose a tool without iron (מדות ג, ד) | choose |
| redLine | the red line to the middle height (מדות ג, א) | drag |
| guf | drag each stone up the kevesh | drag along a path |
| karnot | each horn to its corner | drag to place |
| kiyor | pour bronze into the mould, release on the line | hold, then release |
| ulam | lower the מלתרא when it is over the opening (מדות ג, ז) | timed tap |
| heichal | rub the gold plates until they shine | rub |
| boxes | lower the craftsmen's box slowly (מדות ד, ה) | hold, ease off when it swings |

Meanwhile the one verb that repeats about 2,700 times is the strike.

**So the first move is an inversion. Each moment's mechanic becomes a repeatable course job with three levels.** It plays at its own stage's courses and wherever else it fits, and the stage still ends with its moment, as a bigger version of that job. The code exists, with solvers and tests (moments.js, test/moments.cjs), so most of the variety is a refactor, not new art.

## 3. Principles (for every new action)

1. **One action, one gesture.** Over the game: at least 10 different gestures (tap, hold-release, drag-to-place, swipe strips, rub, back-and-forth, alternate thumbs, circle, pull-and-snap, trace, steer).
2. **Short.** One job takes 20–45 s. The same gesture never runs more than ~25 s straight. A new kind of job comes at least every 90 s of play.
3. **No reading needed.** An animated hand shows the gesture, with ≤ 5 words on screen ("נסר לאורך הקו").
4. **It shows in the world.** The kohen does it in 3D, with a partner or a crew, and the result stays in the building: the beam in the ceiling, the plaster on the altar, the leaf on the vine.
5. **Skill gives stars, and stars give coins.** Failing is kind: a retry, never a loss or guilt.
6. **True to the period.** Every job carries a source (טיוטה), or the tag המחשה when we only illustrate how it was likely done.
7. **She chooses.** At a course's start, offer two jobs: "מה נעשה עכשיו?". The choice makes it hers.
8. **The strike stays, but as help.** Tapping the stones helps the crews finish the course faster. It is no longer the main work.
9. Phone portrait, 44-px targets, RTL, one hand where possible. Two-player variants on one phone where a job is naturally two-handed (the saw).

## 4. The pool of actions (the supervisor's seed; tonight every agent adds and cuts)

**A = from our moments (refactor). B = new.** Effort: S ≈ an hour on the frame, M ≈ a half-wave, L ≈ a whole agent's wave.

| # | Job (Hebrew on screen) | Gesture | What the kohen does in 3D | Where (stages) | Source (*to verify*) | Why a child likes it | Effort |
|---|---|---|---|---|---|---|---|
| A1 | **חיבור על חיבור** | tap one of three stones | sets the stone whose joint falls on a stone's middle | every walled course | Herodian masonry seen around the Mount (already sourced in the wall moment) | a quick "aha" puzzle | S |
| A2 | **מצא את התולעת** | find and tap | inspects the logs before they go up | every cedar finish; nashim's wood chamber | מדות ב, ה ("כל עץ שנמצא בו תולעת פסול") | hidden-object hunt | S |
| A3 | **גזית: פס אחרי פס** | swipe strips across the stone | smooths a block with the chisel | lishka, every ashlar stage (in place of 3 taps on some stones) | רש״י שמות כ, כב (in the game) | satisfying swipe-reveal | S |
| A4 | **במעלה הכבש** | drag along a path | hauls stones up the ramp | guf, karnot | מדות ג, ג | physical, short | S |
| A5 | **יציקה** | hold, release on the line | pours bronze into a mould | nikanor (the doors' fittings), kiyor (the 12 spouts) | יומא ג, י (בן קטין) | tension at the line | S |
| A6 | **שפשף עד שיבריק** | rub | rubs gold leaf onto the plates | every gold finish: gates, ulam, heichal, kodesh | מדות ד, א ("כל הבית טוח בזהב") | rub-to-shine is pure joy for kids | S |
| A7 | **החזק בסערה** | hold steady | holds the cargo on the ship | the sea voyages (cedar, Nikanor's doors) | יומא לח ע״א | drama | S |
| A8 | **הורד לאט** | hold, ease off when it swings | lowers a box or a beam | the House's high courses, the מלתראות | מדות ד, ה; ג, ז | careful control | S |
| B1 | **ניסור קורות ארז** | back-and-forth swipes along a line; a 2-player saw on one phone | saws planks at the saw bench with a partner | every cedar finish: the wall's beams, the gates' doors, the gallery, the chambers' ceilings, the Heichal's ceiling | עזרא ג, ז (the cedars brought by sea to Jaffa); the sawing is המחשה | rhythm and co-op; a new gesture | M |
| B2 | **המפוח והכור** | alternate thumbs (left, right) until the fire is white-hot, then the pour (A5) | pumps the bellows at the furnace | nikanor, kiyor | Nikanor's doors were bronze (מדות ב, ג; יוספוס, מלחמת היהודים ה, ה, ג *to verify*); the bellows are המחשה | frantic, colourful, sparks | M |
| B3 | **סיד על המזבח** | paint with the finger until the stone is all white (coverage) | plasters the altar's stones by hand, never with an iron tool | yesod, sovev, guf, karnot | מדות ג, ד ("ומלבנין אותן פעמיים בשנה"; "ולא בכפיס של ברזל") | colouring-in coverage: a top kids' mechanic | S–M |
| B4 | **על הגלילים** | swipe the sledge forward, then tap the free roller behind and drag it to the front | moves a great stone on rollers with the crew | har's great courses, the wall's great stones | המחשה | timing and juggling | M |
| B5 | **בלי טיט: כוונון במוט** | small nudges until the joint closes to a hair | levers the stone into its exact place | the key stones (instead of a second crane game) | Herodian dry masonry, no mortar (archaeology, *to verify*) | precision, a satisfying click | M |
| B6 | **החוט הצבוע** | pull the dyed line taut, lift, release: snap! | marks the course's straight line | the first stone of a course, the survey | זכריה א, טז ("וקו יִנָּטֶה על ירושלים", *to verify*; quote only this fragment, never the verse's opening) | a snap, sound, and a line appears | S |
| B7 | **קנה המידה** | tap at each end to lay the 6-amah reed along the line; count to the Mishnah's number | measures the court | every survey (in place of 3 taps) | יחזקאל מ, ה (קנה המידה שש אמות); the numbers from מדות | learns the real measures by counting | M |
| B8 | **קשת על פיגום** | place the wedge stones in order, the keystone last, then knock out the wooden frame | builds an arch | har (the vaults: "הר הבית והעזרות תחתיהם חלול", פרה ג, ג; "כיפין על גבי כיפין", פרה ג, ו, *to verify*) | the frame comes out and the arch stands: wow | M |
| B9 | **גפן הזהב** | drag a golden leaf, grape or cluster onto the vine, where you like | hangs the donated gold on the vine over the Heichal's door | ulam (finish), then any time as a coin purchase | מדות ג, ח ("כל מי שהוא מתנדב עלה או גרגיר או אשכול, מביא ותולה בה") | decorating; **it is also the best coin sink** (section 6) | M |
| B10 | **אריגת הפרוכת** | tap over and under in the pattern (four colours) | weaves the curtain in the weavers' workshop (never inside the Kodesh) | heichal / kodesh finish | כתובות קו ע״א (the women who wove the curtains were paid from the Temple's funds); שקלים ח, ה (its size) (*to verify*); יומא ה, א (two curtains in the Second Temple) | a calm pattern game | M |
| B11 | **רפסודות הארזים** | steer left and right between rocks and waves | floats the cedar rafts from Lebanon to Jaffa | the cedar route (play it to speed the caravan) | עזרא ג, ז | action; overlaps "מרוץ הכבש" | M |
| B12 | **גלגל הדריכה** | alternate thumbs to walk the wheel; release at the right height | the crane's treadwheel lifts a stone to a high course | ulam, heichal, kodesh (high courses) | ויטרוביוס, ספר 10 (the Roman treadwheel crane, המחשה) | rhythm and a stop-on-the-mark | M |
| B13 | **לבית התקיעה** | trace the letters with the finger | carves the inscription on the corner stone | the wall's last course (the Mount's south-west corner) | the inscribed stone found by B. Mazar (1968), יוספוס, מלחמת היהודים ד, 582 (already in the game as a find) | writing real Hebrew letters | S–M |
| B14 | **הסימן שלי** | draw your mark or initial on one stone of each stage | the stone with your mark is set by you; later "find your stones" | every stage, once | המחשה (masons' marks are known from ancient buildings) | ownership; a hunt later | S |
| B15 | **בור הגולה והגלגל** | circle with the finger to turn the wheel | draws water for the plaster and the builders | nashim / lishka (and Phase B) | מדות ה, ד ("שם בור הגולה והגלגל נתון עליו, ומשם מספקין מים לכל העזרה") | the circle gesture is new | S–M |
| B16 | **מוכני הכיור** | circle (the wheel) | sinks the laver in the well for the night | kiyor | יומא ג, י (בן קטין: "מוכני לכיור") | a fun machine | S |
| B17 | **ריצוף אופוס סקטילה** | drag tiles into the pattern (rhombi, eight-pointed stars, triangles) | lays the coloured stone floor | har's finish ("ריצוף הרחבה") and the porticos | פרויקט סינון עפר הר הבית: the opus sectile tiles reconstructed by F. Snyder (already in content/facts.json) | a colourful pattern puzzle | M |
| B18 | **כלה עורב** | place the spikes along the roof's edge, so no raven can land | fits the spikes on the House's roof | heichal (finish "כלוב עורב") | מדות ד, ו ("ואמה כלה עורב") | funny: the ravens keep trying | S |
| B19 | **פיגום** | drag poles to their slots, tap to tie | builds the scaffold before the high courses | the House | המחשה | a construction toy | M |
| B20 | **ט״ו המעלות** | stack each step at half an amah (stop the block on the mark) | builds the semicircular steps | nikanor | מדות ב, ה ("ורום כל מעלה חצי אמה, ושלחה חצי אמה") | measure-and-stack, with the Levites' song | S–M |

**Not here, on purpose:** no fireworks (the owner hasn't decided; the default is no). No real people's faces or voices. No entering the Kodesh HaKodashim. Nothing that mocks a mistake.

## 5. The new loop (the proposal tonight's agents argue about)

**A course = about three jobs by the player + the crews' stones.**

1. A course opens with a short beat (it exists: DIRECTOR13's course beat). Then two cards appear: **"מה נעשה עכשיו?"**, two jobs from the stage's deck (for example "לנסר קורות" or "לגלגל את האבן").
2. She plays the chosen job (20–45 s). Meanwhile the crews set the course's stones; the crews and machines from wave 13 are already in the world.
3. The job's stars become coins, flying into the purse.
4. The next job is offered the same way (two cards). The course closes with its end beat (DIRECTOR13's) when its work is done. The deck never deals the same job twice in a row.
5. **The strike becomes help:** tapping her own stone speeds the course. With the clear timing (section 7), a perfect strike is a fun skill, not the chore.
6. **Key stones keep their games**, crane and dressing, but at most one per course, and B5 or B6 can take a key stone's turn.
7. **The checks keep the plumb and the level.** The owner likes the level with the needle.
8. **The stage's finish steps become jobs:** cedar becomes the saw, gold the rub, plaster the paint, the vine decorating, bronze the bellows and pour.
9. **The stage ends with its moment**, the big version of one of its jobs.

**The arithmetic: a job must carry real work.**
- Today a course is P logical stones × 3 strokes, 72–120 strokes. The crews add 1 stroke per game-minute each, so with 4 crews a 32-stone course takes about 24 real minutes at ×1. The game is built to be fast only when the player strikes.
- So a job is not decoration: **a job does a share of the course's work**. A first proposal:
  - ★ = 25 % of the course's strokes, ★★ = 33 %, ★★★ = 40 %;
  - about three jobs make a course, about 1½ minutes at ×1;
  - the crews' stones and the optional strike fill the rest.
- The economy stays as it is: segments still cost materials. Only the hands change.
- **The producer's own number agrees:** "the first course end comes 3.5–4.5 minutes after a pick" (PRODUCER-S13 headline, in the demo at ×60).

**A deck per stage (the first draft):**

| Stage | Its deck |
|---|---|
| har | B7 measure · rocks (exists) · B4 rollers · quarry (exists) · B8 arch · level (exists) · B17 floor |
| wall | B6 line · A1 joints · B5 lever · B1 saw (the beams) · B13 the inscription |
| gates | A1 · B5 · B1 saw (the doors) · A6 gold |
| nashim | A1 · B1 saw (the gallery) · A2 worms (the wood chamber) · B15 the water wheel |
| sorag | the breaches as a lattice job · B6 |
| nikanor | B2 bellows · A5 pour · B20 the 15 steps · A7 the storm |
| lishka | A3 gazit · B1 · A2 |
| yesod / sovev / guf / karnot | whole stones (exists) · A4 kevesh · B3 plaster · the red line |
| kiyor | B2 · A5 · B16 mukhni |
| ulam | B12 treadwheel · A8 · B9 vine · A6 gold |
| heichal | B12 · B19 scaffold · B1 (the ceiling) · A6 · B18 ravens |
| kodesh | A8 boxes (exists) · B12 · B10 the curtain (in the workshop) |

**Pacing targets** (PRODUCER14 measures): a course in 60–90 s of play; a stage in 6–12 min; the longest run of one gesture ≤ 25 s; a new kind of job at least every 90 s; and **the escape rate**: how often a child opens the in-between games during a stage's courses. That rate should fall.

## 6. Coins (her item 1)

**Today:** silver (כסף) is already the game's money. It is earned per stage (REWARD), per in-between game (+8 כסף), and spent on surveys, digs, the three UPGRADES (כלי הסתתים, המנוף הגדול, עגלות המחצבה) and caravans. She didn't see it: it is a resource chip, not coins. The things to buy are abstract, and the shop is hard to find.

**Proposal:**

1. **One currency.** The coins *are* the silver, shown as silver coins (a coin icon and a purse in the HUD). Keep the word "כסף" or call them "שקלי כסף". FUN14 and ECON14 decide.
2. **Every task pays, by difficulty and stars**, with coins flying to the purse and a clink:
   - a job: L1 5 · L2 8 · L3 12 coins, × the stars (★ 1, ★★ 1.5, ★★★ 2);
   - a key stone: by its tier;
   - a course end: a small bonus;
   - a stage: as REWARD now, shown big.
   - The numbers are tuned by test/game-sim.mjs.
3. **The shop, "בית המלאכה" or "השוק", always one tap from the purse.** Things she can *see* after buying:
   - **machines** that join her site and work there (a treadwheel crane, a shear-legs, a sledge, an ox cart; SITE13 built these meshes): they speed the crews, like UPGRADES today, but visible;
   - **a pair of oxen** for the carts: she names them;
   - **tools** for the kohen, in his hands (the existing כלי הסתתים);
   - **a golden leaf, grape or cluster for the vine** (מדות ג, ח), hung where she likes; her name goes into the donors' book;
   - **lamps** that light her site at night;
   - **the Levites' instruments**, heard in the music (נבל, כינור, חצוצרות, מצלתיים);
   - **a stone with her mark** (B14).
4. **The rules stand:** fixed prices, nothing random (no chests or loot boxes), no real money, no timers that pressure, no "sale ends", and no guilt. Shabbat and Yom Tov never cost anything.

## 7. The precise strike (her item 2)

**Today (src/game/index.js runJob):**
- After a strike, a ring closes on the stone (ui.js ringStart). The next tap within ±0.22 s of the beat (RHYTHM.cycle 0.86 s) is perfect and counts 2 strokes.
- The first strike at a new spot can't be perfect.
- Nothing says what the ring means. She saw three taps and a mystery.

**Proposal:**
1. **Teach once, in slow motion.**
   - At the first stone after the tutorial, the ring closes slowly (2 s).
   - A hand taps exactly as the ring meets the target, and the words read "הקש כשהטבעת נסגרת · מכה מדויקת = כפול".
   - She tries three times at that slow pace, then the pace becomes normal.
2. **Make it legible.**
   - A fixed gold target circle on the stone, with the closing ring around it.
   - The target flashes "עכשיו!" at the beat.
   - A soft tick-tick-TOCK in the beat.
   - The kohen's raised hammer telegraphs the beat.
3. **Feedback that teaches:**
   - "מוקדם מדי" or "מאוחר מדי" with a small arrow on each miss;
   - "מדויק!" with a big spark burst, and the stone visibly jumps a dressing state;
   - a streak counter: "3 ברצף!".
4. **Maybe a swing meter instead of the ring.** A bar above the stone with a gold zone, the marker riding the hammer's swing. Bars read more easily than shrinking rings for some kids. Try both by touch; PRODUCER14 picks the one a child gets in under three tries.

## 8. The kohen floats or sinks (item 4)

**Today:** the hero's height is groundAt(x, z) (stages.js heroPlace / the walk). Wherever groundAt and the visible surface disagree, he floats or sinks.
- Suspects: a raised floor (the Ezrat Nashim, the Chel's terrace, the steps of the Ulam and the 15 steps), the kevesh's slope and the altar's top (SITE13 taught groundAt the altar and the kevesh), the work spots on built courses or on the scaffold, and the Mount's leveled terrain while its shader (uPitK) moves.
- Also walks that interpolate height across a step.

**A lead from the code (the supervisor, not yet measured):**
- groundAt (stages.js ≈1467) raises a floor only when its stage is done: the Chel's terrace (y 6) on `isDone('sorag')`, the Azara (y 16) on `isDone('wall')`, Nikanor's steps, the Ulam's 12 steps, and the altar's levels.
- But four stages stand on the terrace (`base: 6`): gates, nashim, nikanor and lishka.
- gates, nashim and lishka can be built before the sorag (deps: wall, wall, gates). So while one of them is building and the sorag is not done, groundAt says 0 where the stage's own geometry starts at 6.
- Check what the player sees there, and check every stage's work spots the same way.

**Fix:**
1. A probe, test/hero-ground.cjs. In the demo, pick each of the 15 stages. For 30 s each, sample his feet every 0.25 s while he works and walks.
2. Raycast straight down from 3 amot above his feet, against the visible meshes.
3. Flag any |feet − surface| > 0.2 amah, with the place, the stage and what was hit.
4. Then teach groundAt each surface, or let his height follow a "walkable" layer's raycast.
5. Accept when no frame in all 15 stages is over 0.2 amah.

## 9. The brainstorm round (WAVE14-BRIEF Part 0; run on 1.10 morning at the owner's word: "סיעור מוחות - כעת")

Each agent reads this file and writes its own `bus/BRAIN14-<AGENT>.md`:
- **5 ideas of its own** that are not in section 4: from its own field, with gesture, 3D, source and effort;
- **its top 6** of all the ideas, for a child of 8–12, with one line why;
- **3 cuts**: what in section 4 would be boring, wrong or too costly, and why.

Each agent's lens:
- **FUN14, the fun owner:** what a child does with her thumb, how a job feels in the first 3 seconds, the deck and the choice. FUN14 also writes the joint pick, `bus/BRAIN14-JOINT.md`.
- **GAMES14:** which moment mechanic generalizes most easily, and which new gesture is the most fun per hour of work.
- **SITE14:** what looks best in the 3D world, what stays visible in the building afterwards, and the floating fix.
- **ECON14:** the coins, the shop, what a child would save up for, and the strike's legibility.
- **HISTORY14:** what the builders really did, and a check of every source in section 4.
- **PRODUCER14, the owner's eyes,** plays in Part 1: every merge by touch, as the daughter would.
- **The supervisor:** reads the five lists, the joint pick and the family's votes (the vote page), puts the agents' new ideas on the vote page, and fixes the wave's picks in `docs/WAVE14-BRIEF.md` Part 1.

## 10. For the owner (and his daughter)

- **Which of these would she want to do herself?** Her picks go first. A vote page is published alongside this file.
- **Coins:** one money ("כסף" as coins), or a new coin only for the shop? The proposal is one.
- **Her age?** It sets the jobs' difficulty and how much text is on screen.

## 11. The round's outcome (1.10, 05:43–06:10 UTC)

The five files and the joint pick are in docs/brainstorm14/. The build contract is docs/WAVE14-BRIEF.md Part 1.

**Where the five agreed:**
- **In all five top-6 lists:** A6 שפשף עד שיבריק, B3 סיד על המזבח and B1 ניסור קורות ארז.
- **New, from several agents:**
  - **מקימים עמוד** (4 agents): a Stoa column raised hand over hand (War 5.5.2);
  - **אמת המים** (3 agents): a pipe puzzle from עין עיטם (יומא לא ע״א; שקלים ד, ב);
  - **גלי הים** (2 agents): the House's courses out and in, like the sea's waves (סוכה נא ע״ב).
- **Cut by most:** B7 קנה המידה (all five) and B11 רפסודות (three).

**Corrections to this seed:**
- **§5:** three jobs a course would make the Heichal a 28-minute stage. A stage is about 10 jobs, J = clamp(round(10 / C), 1, 3) a course (FUN14). Stars pay coins, not work.
- **§5, the deal:** one stone card and one card of another craft. Herod had priests taught as masons and as carpenters (Ant. 15.11.2; HISTORY14).
- **§4's sources (HISTORY14's table):** 23 ✓ · 4 ✗ (A2, B3, B15, B20) · 1 ? (B5). The vote page's cards are corrected.
- **§6:** one coin (the silver), "מטבעות" on screen, and the shop is "אוצר המלאכה" (עזרא ב, סט). Pay = stars × (level + 2) (ECON14).
- **§7:** a bar by default, taught once in slow motion (ECON14).
- **§8, the floating kohen, five causes (SITE14), which the probe tests:**
  - the height filter lags on slopes, so he sinks going uphill and floats going downhill (stages.js 3573);
  - ramps where stairs stand;
  - surfaces raised only when their stage is done;
  - a wall with no stairs;
  - the base-6 buildings hang over a bare plaza before the sorag.

**The manager's additions:**
- **The materials rule:** in the regular game an empty stock deals the quarry cycle's next game as the stone card.
- **Har's craft card is the aqueduct,** so her first stage is not all stone work.
- **The build order follows where she plays:** the saw (the wall's craft card) before the gold.

**The vote page** now carries the agents' 15 new ideas as well.
