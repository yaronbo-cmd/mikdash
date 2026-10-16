# STARS15: the game in the style of Gardenscapes

**Drafted** by the supervisor, 1.10 night, for wave 15. Every line a player reads stays a draft marked **טיוטה**, with its exact source or **המחשה**.

## 0. The owner's words (verbatim)

1.10, 18:22 Jerusalem, after his daughter played v26:

> "אוקי תקשיב הבת שלי אמרה ואני מסכים איתה אני רוצה שהמשחק יהיה בסגנון של המשחק garden scapes ומשחקים שבסגנון אתה יכול לעשות את זה? אנימציה והמשחק בפועל שיש משימות שאני צרחהה לעשות וכל משימה עולה מספר מסויים של כוכבים יכדח להשיג כןכב צריך לשחק בקנדי קראש שעשיץ.או לעבןר חידון בנושא וכאלה"

What he asks for:
- the game in the style of Gardenscapes, with **animation**;
- a list of **tasks** to do, each costing a number of **stars**;
- to **earn a star**, she plays a Candy Crush level, or passes a quiz on the subject, "and such".

The compass stands: **"זה הכי חשוב שיהיה כיף ומעניין ותקין"**. He loves the kohen walking from point to point at his work.

## 1. The loop, mapped onto what already exists

| Gardenscapes | בית המקדש השני |
|---|---|
| The garden, one area at a time | The Temple's site, one stage at a time (the 15 stages in 4 chapters, content.js STAGES) |
| Austin the butler | **רב האומנים**, the mentor (already in the game, a fictional character), and the player's kohen with his name |
| "Play" opens the next match-3 level | **"שחק ▶ שלב 12"** opens the next level of **משחק האוצר**. The match-3 engine already exists (src/match3: three fields, a 15-level tutorial ladder, procedural levels from 16 on, goals and stars calibrated by a bot) |
| A level won = ★ (and coins) | A level won = **★ 1**, plus **מטבעות** for the moves left |
| The task list, each task 1–3 ★ | **"משימות"**: the stage's tasks, each 1–3 ★, with prerequisites |
| A task done → an animation | The kohen walks to the spot, the crews work, the building changes in 3D (the reveals that exist and SITE14's `jobReveal`), sparkles and a sound, then one line from the mentor (טיוטה + its source) |
| "Choose one of three designs" | Once a stage, choose one of 2–3, where a source allows it, otherwise marked המחשה (for example, the Stoa's capital, a gate's ornament, the lamp at the gate) |
| A new area opens | The next stage opens. Each stage's **key moment** (the 15 that exist) is its last task: "the big one" |
| Boosters for coins | Boosters for מטבעות at fixed prices: a hammer, +5 moves, a shuffle |
| Lives (5, refilled over time) | **Decision ⚑1. Default: no lives.** She plays as much as she likes, with no waiting and no guilt (PROJECT.md §2) |

**The big change:** building no longer happens by tapping stones, buying segments with six materials and waiting for crews. **She plays, earns stars, and chooses what to build.** Her escape to the in-between games becomes the game itself.

## 2. Where stars come from (decision ⚑2; default: all of these, with match-3 first)

1. **A level of משחק האוצר:** ★ 1. The field follows the stage: the quarry for stone work, the Lebanon forest for cedar, the gold for gold. The big gold button always opens it.
2. **"חידון":** 5 questions from the Middot bank (content/middot-quiz.json, 68 questions, sourced drafts) and from the stage's own facts. 4 or more right = ★ 1. A wrong answer explains itself with its source.
3. **The period's games:** the sling, חמש אבנים, the eight torches, the nut tower, the race, the memory game, four in a row, the stack, the Levites' song. A game won = ★ 1, and each game gets harder as she wins.
4. **The building jobs from wave 14** (the saw, the gold, the column, the arch, the treadwheel, the wheel, the rafts, the waves, the snap-line, the letters) become **the interactive form of a task's animation**. On a task whose kind has a job, two buttons: "אני אעשה את זה" (play the job: +מטבעות for its stars) or "הצוות יעשה" (watch the animation). Wave 14's work stays in the game, where she chose it.

Items 2–4 sit under the button in one row: **"עוד דרכים לכוכב"**.

## 3. Tasks: the shape of a stage

- A stage has **8–12 tasks** costing **15–25 ★**, so 15–25 levels at Gardenscapes' pace: a task every 1–2 levels, a stage in about 30–50 minutes over several sessions.
- **Tasks come from the stage's real work** (content.js PROJ): the survey, the dig, the courses (one task per course, or two courses per task where C is large), the finish steps, her ❤️ jobs, and the key moment last.
- **Each task names what it does in the world.** The world calls exist:
  - `setStage(id, 'building')`;
  - `quickSet` n stones;
  - a finish step's reveal;
  - `jobReveal(kind)`;
  - the moment.

### The Mount (har), for example (STORY15 writes all 15; the sources to be checked)

| # | task (on screen) | ★ | after | what the world does | its line (טיוטה) |
|---|---|---|---|---|---|
| 1 | מדדו את ההר | 1 | — | the survey: stakes and the cord | הר הבית: חמש מאות אמה על חמש מאות (מדות ב, א) |
| 2 | פנו את הסלעים | 2 | 1 | the dig: the boulders split and carted away | המחשה |
| 3 | הניחו את האבן הגדולה | 1 | 2 | the great stone on the crane | the great stones of the course, by the excavations (ארכאולוגיה) |
| 4 | בנו את הנדבך הראשון | 1 | 3 | course 1 | — |
| 5 | החוט הצבוע ❤️ | 1 | 4 | the chalk line on course 2 | "וקו ינטה על ירושלים" (זכריה א, טז; these words only) |
| 6 | נדבכים 2–3 | 2 | 5 | courses 2–3 | — |
| 7 | הקימו את עמודי הסטיו ❤️ | 2 | 6 | the Stoa's columns rise | יוספוס, מלחמת היהודים ה, ה, ב |
| 8 | בנו את קשת רובינסון ❤️ | 3 | 6 | the arch, a course at a time | קשת רובינסון (ארכאולוגיה); קדמוניות טו, יא, ה |
| 9 | נדבכים 4–6 | 3 | 7 | courses 4–6 | — |
| 10 | חרטו "לבית התקיעה" ❤️ | 1 | 9 | the inscribed stone at the south-west corner | בנימין מזר, 1968; מלחמת היהודים ד, ט, יב |
| 11 | רצפו את הרחבה | 2 | 9 | the plaza's paving | המחשה (the Sifting Project's opus sectile tiles: a choice of pattern) |
| 12 | ★ האבן הגדולה (the moment) | 2 | 10, 11 | greatStone, played | its card as today |

That makes 21 ★. A choice: the paving's pattern, one of three from the Sifting Project's tiles (המחשה).

## 4. The animation

Every task plays a short scene, 4–8 s, which a tap can skip:
1. the camera frames the spot (DIRECTOR's frames, K80);
2. the kohen walks there, point to point (the owner's favourite);
3. the crew and the machines work (crews.js, SITE13's machines);
4. the building changes: the reveal, with dust, sparkles and a "ta-da" sound;
5. the mentor's line, in a speech bubble with his portrait (an illustrated fictional character), טיוטה with its source;
6. the next tasks light up with a "!" marker in the scene.

Wave 14's jobs play here when she chooses "אני אעשה את זה".

**Art direction (Gardenscapes' warmth):** brighter, warmer light; bigger and more expressive characters in the cut-scenes; speech bubbles; a celebration at each stage's end. The world stays the period's (PROJECT.md §2): no Ark; never inside the Kodesh HaKodashim; no faces of real people.

## 5. Screens (phone portrait, RTL, 44-px targets)

- **Home:**
  - the 3D site;
  - top: ★ count, מטבעות, ☰;
  - bottom: the big gold **"שחק ▶ שלב N"**;
  - **"משימות"** with a badge counting the tasks she can afford;
  - the row **"עוד דרכים לכוכב"**.
- **Tasks sheet:** 2–4 cards, each with an icon, a name, its ★ cost and a "בצע" button. A locked task is dimmed and says what it waits for.
- **The level:** the match-3 as it is, with its goal, moves and boosters. A win shows ★ and coins flying to the counters. A loss: "עוד ניסיון" (no lives by default).
- **The quiz:** one question a screen, three answers, the source shown after.
- **The task's scene:** as in §4.
- **The chapter's end:** a celebration and the chapter's card.

## 6. What stays, what leaves the main path

**Stays:**
- the 3D world, the kohen and the crews;
- the 15 key moments, as each stage's last task;
- the facts with their sources, and the finds;
- Phase B (העבודה בבית) as it is;
- the demo's stage picker for the owner's testing;
- the period's games and the quiz, now as star sources;
- wave 14's jobs, as interactive task scenes;
- the coins and אוצר המלאכה (her five), bought with מטבעות.

**Leaves the main path** (the code stays this wave, hidden):
- the strike on stones, and with it the ring;
- segments and the six materials;
- the crews' timers;
- the caravans and the kings' deals;
- the quarry cycle's pill.

**Saves:** a stage that was done stays done. The current stage's progress becomes its done tasks, and the materials in stock become ★ at a fair rate, so no player loses anything.

## 7. Rules (PROJECT.md §2, unchanged)

- Drafts marked טיוטה with exact sources, or המחשה.
- Never write the Divine Name.
- No gore; no Ark; never inside the Kodesh HaKodashim.
- No gambling, no loot boxes, no real money, no guilt, no timers (hence no lives by default).
- Shabbat and Yom Tov cost nothing.
- RTL, phone first, 44-px targets.
- No paid services.

## 8. Decisions for the owner (each with its default)

1. **⚑1 Replace or add:** the new loop replaces the old way of building in the main path. *(Default: replace.)*
2. **⚑2 Lives:** none, so she plays as much as she likes. *(Default: none.)*
3. **⚑3 Star sources:** match-3 first, plus the quiz, the period's games and the jobs. *(Default: all.)*
4. **⚑4 When to build:** as soon as he answers. *(Default: as soon as he answers.)*

## 9. Wave 15 (five agents, about 2.5 h)

A playable loop for chapters 1–2 (har to lishka); wave 16 does the rest of the stages, the story's polish and the choices.

| agent | owns |
|---|---|
| **META15** | The loop: new src/game/meta.js (stars, tasks, spend → world calls, `G.meta` in the save and the migration); the home HUD (★, מטבעות, "שחק ▶", "משימות" with its badge, "עוד דרכים לכוכב"); the tasks sheet; the first-time flow (the mentor → the first level → the first ★ → the first task). |
| **MATCH15** | "שחק ▶": the level flow from home (the level number, the field by stage; a win → ★ and coins; a loss → "עוד ניסיון"); boosters for coins; the quiz round; the period's games paying ★. |
| **STORY15** | The tasks of the 15 stages (content/tasks.json): names, ★, prerequisites, world calls, one sourced line each (טיוטה) or המחשה, one choice per stage; the mentor's short lines and two more fictional characters; a source check in HISTORY14's manner. |
| **SITE15** | Each task's scene in 3D: the walk, the crews, the reveal by task, the FX, the camera (K80), the "!" markers; wave 14's jobs as "אני אעשה את זה". |
| **PRODUCER15** | Plays as the daughter, by touch. Measures: the time to the first ★ and the first task; ★ a minute; how often a task's scene is skipped; any wait; "escapes" (now there should be none). The K80 gate; the verdict. |
