# Wave 15: the game in the style of Gardenscapes (tasks that cost stars)

2026-10-02. **Launched 05:55 UTC (08:55 Jerusalem) at the owner's word "שילמתי. אין מגבלת שימוש כעת. תמשיך בכל הכח והמרץ" — with the four decisions at their defaults (§ The decisions).** His answers, when they come, are posted by the supervisor in bus/OWNER15.md; read it at every checkpoint. **Hard stop 09:00 UTC (12:00 Jerusalem); a checkpoint report on the bus at 07:30 UTC.**

## The owner's words, for every agent

**1.10, 18:22 Jerusalem** (after his daughter played v26):
> "אוקי תקשיב הבת שלי אמרה ואני מסכים איתה אני רוצה שהמשחק יהיה בסגנון של המשחק garden scapes ומשחקים שבסגנון אתה יכול לעשות את זה? אנימציה והמשחק בפועל שיש משימות שאני צרחהה לעשות וכל משימה עולה מספר מסויים של כוכבים יכדח להשיג כןכב צריך לשחק בקנדי קראש שעשיץ.או לעבןר חידון בנושא וכאלה"

What he asks for:
- the game in the style of Gardenscapes, with **animation**;
- a list of **tasks** to do, each costing a number of **stars**;
- to **earn a star**, she plays a Candy Crush level, or passes a quiz on the subject, "and such".

**The compass: "זה הכי חשוב שיהיה כיף ומעניין ותקין".** He loves the kohen walking from point to point at his work.

## Where we are
- **v27 is published** (wave 14 merged): the course loop "מה נעשה עכשיו?", her nine ❤️ jobs, coins and אוצר המלאכה, the ring, the kohen on the ground.
- **Read first:**
  - **docs/OWNER-NOTES.md**: every note the owner gave from the start, and what "acting accordingly" means this wave;
  - **docs/STARS15.md**: the design (the loop mapped onto what exists, the star sources, the tasks per stage with the Mount in full, the scenes, the screens, what leaves the main path, the decisions);
  - **the home screen's mockup**: artifact WGwzGNqiEyvCX7vpTQ8Z9Z ("מסך הבית החדש"); its source is docs/stars15-home.html;
  - docs/PRODUCER-S14.md §0 (her first minutes on v27).

## Rules
The rules of docs/WAVE6–14-BRIEF.md apply in full:
- drafts marked טיוטה, each with its exact source, or המחשה;
- never write the Name, not even in code or tests (use ה׳, אלקים, א-ל);
- no gore;
- no Ark in the Second Temple, and the player never enters the Kodesh HaKodashim;
- no gambling, no loot, no real-money purchases, no guilt, no pressuring timers; coins buy at fixed prices only;
- Shabbat and Yom Tov never break a streak or cost anything;
- Hebrew RTL, phone first, 44-px targets;
- no paid services;
- no sub-agents.

**Testing:** real touch at 390×844 on **dist/test.html**. No autoplay flags in acceptance tests. Look at every screenshot you take. Test in the demo, as the owner does, and on a fresh save, as his daughter does.

**Usage:** commit every 15 minutes; read big files by ranges; keep your outputs short.

**The machine has 2 cores.** Every browser run goes through `/home/claude/wt/bus/brun <command…>` (cut at 10 minutes; the producer's lane `BRUN_LANE=producer`).

**Budget:** ≤ 3.25 MiB (v27 is ≈ 3.10 MiB). Tasks are data (content/tasks.json ≤ 40 KB); the meta loop ≤ 25 KB; boosters ≤ 10 KB. Report your delta.

## The bus (/home/claude/wt/bus)
- Your report: **bus/<AGENT>.md** (META15.md, MATCH15.md, STORY15.md, SITE15.md, PRODUCER15.md), appended as you go, each entry with a UTC time; the last line is always `NEXT:`.
- The contracts: post your signatures in your file within 20 minutes and read the others' before building on them.
- A request to another agent: in your file, as `→ AGENT file:line: …`; read the others' files for requests to you at every checkpoint.
- The producer's notes to you: bus/PRODUCER15.md (N1, N2, …); answer each in your file (`N3: fixed at <commit>` or `N3: no — because …`).
- The owner's answers: bus/OWNER15.md (the supervisor writes it).
- Browser runs: `/home/claude/wt/bus/brun <command…>` (one at a time, cut at 10 minutes; `BRUN_LANE=producer` for the producer). `export NODE_PATH=/home/claude/.npm-global/lib/node_modules` first. Build your worktree with `node build.mjs`; test on YOUR dist/test.html.
- No sub-agents: do not use the Agent tool.

## The decisions (the owner's; defaults until he answers)
1. **⚑1 Replace or add — ANSWERED by the owner, 2.10 10:13: ADD.** "אני לא רוצה שנהרוס את כל מה שבנינו עד עכשיו עם הרעיון של הילדה, אלא רק לקחת ממנו רעיונות והוקים למשחק שלנו." The game as it is stays the main path; the stars and tasks are a layer on top. The binding integration rule (eight points) is in bus/OWNER15.md.
2. **⚑2 Lives:** none; she plays as much as she likes. *(Default: none.)*
3. **⚑3 Star sources:** a level of משחק האוצר first; the quiz, the period's games and wave 14's jobs as "עוד דרכים לכוכב". *(Default: all.)*
4. **⚑4 When:** as soon as he answers. *(Default: then.)*

## The loop (STARS15 §1–§5, in one paragraph)
Home is the 3D site with ★ and מטבעות at the top, the big gold **"שחק ▶ שלב N"** at the bottom, **"משימות"** with a badge, and the row **"עוד דרכים לכוכב"**. A level won pays ★ 1 and coins. A task costs 1–3 ★; spending plays its scene (4–8 s, a tap skips): the camera frames the spot, the kohen walks there, the crews work, the building changes with dust and sparkle, the mentor רב האומנים says one sourced line (טיוטה), and the next tasks light up. A stage is 8–12 tasks (15–25 ★); its key moment is its last task. Where a task has a wave-14 job, she may choose "אני אעשה את זה" (play the job, + coins) or "הצוות יעשה" (watch).

## The five agents
| agent | worktree · branch | owns |
|---|---|---|
| META15 | wt/meta15 · s15-meta | **The loop:** new src/game/meta.js (stars, tasks, spend → world calls; `G.meta` in the save; the migration of a v27 save); the home HUD (ui.js and ui.css.js `// ── meta15 ──` fences: ★, the big "שחק ▶", "משימות" and its badge, the row "עוד דרכים לכוכב"); the tasks sheet; the first-time flow (the mentor → the first level → the first ★ → the first task); index.js `// ── meta15 ──` fences where the old loop is hidden from the main path. Tests: new test/meta.test.mjs, new test/meta-touch.cjs, game-harness, game-touch |
| MATCH15 | wt/match15 · s15-match | **The stars' sources:** "שחק ▶ שלב N" (the level flow from home: the field by stage, a win → ★ + coins flying to the counters, a loss → "עוד ניסיון"); boosters for coins (a hammer, +5 moves, a shuffle; in src/match3, fenced); the quiz round "חידון" (5 questions from content/middot-quiz.json and the stage's facts, ≥ 4 right → ★); the period's games pay ★ (src/games, fenced). Tests: match3.test, new test/stars-touch.cjs, games-touch |
| STORY15 | wt/story15 · s15-story | **The tasks of the 15 stages:** new content/tasks.json (names, ★, prerequisites, the world call, one sourced line each (טיוטה) or המחשה, one choice per stage where a source allows it); the mentor's short lines; a source check in HISTORY14's manner (docs/STORY15-SOURCES.md). Tests: new test/tasks.test.mjs (every stage 15–25 ★, no cycles, every task reachable, every line sourced or המחשה, the scan for the Name) |
| SITE15 | wt/site15 · s15-site | **Each task's scene in 3D:** `stages.taskScene(stage, task, o) → Promise` (the frame, the walk, the crews, the reveal by task, the FX, the "!" markers over the next tasks); wave 14's jobs as "אני אעשה את זה"; K80 at every scene's frame. Tests: new test/task-scenes.cjs (every task of chapters 1–2 by touch, its frame, his size, ≤ 150 draw calls), hero-ground |
| PRODUCER15 | wt/producer15 · s15-producer | Plays every merge by touch as the daughter would, on a fresh save: the time to the first ★ and the first task; ★ a minute; how often a scene is skipped; any wait; any escape. The K80 gate. docs/PRODUCER-S15.md: the verdict, the numbers, the top 10, ⚑ lines in Hebrew with defaults. Changes no game code |

Fences: a fence starts with `// ── <agent> ──` and ends with `// ── /<agent> ──`. Only its owner edits inside it. Keep every older fence working. Anything outside your files: ask on the bus with file:line; the supervisor decides.

## The contracts (post the signatures on the bus within 20 minutes)
- **content/tasks.json** (STORY15 → META15, SITE15):
  `{ "<stage>": [ { "id": "har.survey", "n": "מדדו את ההר", "cost": 1, "after": [], "do": { "kind": "survey" | "dig" | "courses" | "finish" | "job" | "moment", "from": 0, "to": 32, "job": "arch" }, "line": { "t": "…", "ref": "מדות ב, א" } | { "illus": true }, "choice": null | { "q": "…", "opts": [ … ] } } ] }`
  The Mount's 12 from STARS15 §3 land first (in the first 30 minutes), so META15 and SITE15 build on real data.
- **meta.js** (META15): `stars(G)`, `earn(G, n, from)`, `tasks(G, stage)` → `[{…task, state: 'done' | 'open' | 'locked', waits: […]}]`, `spend(G, id)` → `{ ok, task, world }`, `badge(G)`; `G.meta = { v: 1, stars, done: {}, choice: {}, earned: { m3, quiz, games, jobs } }`.
- **The scene** (SITE15): `stages.taskScene(stage, task, { q, skip })` → Promise that resolves when the scene ends or is skipped. META15 calls it, guarded; without it, the old reveals and a toast.
- **A star source** (MATCH15): `stars.play(G, 'level' | 'quiz' | 'game', o)` → Promise `{ won, stars: 0 | 1, coins }`; META15's buttons call it.

## The work

**META15: the loop.**
1. src/game/meta.js and the save: a v27 save keeps every stage it finished; the current stage's progress becomes its done tasks; the materials in stock become ★ at a fair rate (nobody loses anything).
2. The home HUD as in the mockup (44-px targets; the big button never covered by a sheet).
3. The tasks sheet: 2–4 cards (icon, name, ★ cost, "בצע"); a locked task is dimmed and says what it waits for.
4. The first-time flow: the mentor's two lines → "שחק ▶ שלב 1" → the first ★ → the first task's scene, within 3 minutes on a fresh save.
5. Hide the old main path (the strike on stones, the segments and the six materials, the crews' timers, the caravans, the quarry cycle's pill) behind the new loop; the code stays.
- **Acceptance:** test/meta.test.mjs (the save's migration, spend rules, no double spend, nothing random, no clock); test/meta-touch.cjs (a fresh save to the first task by touch; the Mount's 12 tasks by touch with the stars granted by the test's fixture); game-harness stays green or each change is explained.

**MATCH15: where the stars come from.**
1. "שחק ▶ שלב N": the next level in the stage's field (the quarry for stone, the Lebanon forest for cedar, the gold for gold); the 15-level tutorial ladder first, then the procedural levels. A win: ★ 1 and coins for the moves left, flying to the counters. A loss: "עוד ניסיון", free.
2. Boosters for coins at fixed prices: the hammer (one tile), +5 moves, the shuffle; at most one of each a level; never sold for anything but the game's coins.
3. "חידון": 5 questions, three answers each, the source shown after; ≥ 4 right = ★ 1; a wrong answer explains itself.
4. The period's games: a game won = ★ 1, each game harder as she wins (the existing levels).
- **Acceptance:** match3.test and games-touch green; test/stars-touch.cjs: a level won by touch pays ★ and coins; a quiz passed by touch pays ★; a booster bought and used by touch.

**STORY15: the tasks.**
1. All 15 stages in content/tasks.json, the Mount first (STARS15 §3), then chapters 1–2 (har to lishka) complete, then the rest.
2. Lines from the sources the game already cites (facts.json, the stage cards, PROJ); new sources only with an exact reference; otherwise המחשה.
3. One choice per stage where a source allows it (the Stoa's capital, a gate's ornament, the lamp at the gate, the plaza's paving from the Sifting Project's tiles: המחשה).
- **Acceptance:** test/tasks.test.mjs; docs/STORY15-SOURCES.md lists every line with its source and a ✓/? per line.

**SITE15: the scenes.**
1. `taskScene` by kind: the survey (stakes and the cord), the dig (the boulders split and carted away), the courses (n stones by the crane, the courses rising), a finish step's reveal, a job's reveal (`jobReveal`), the moment.
2. The kohen walks to the spot (the owner's favourite), the crews work, the building changes, sparkle and "ta-da", the camera at K80 (≥ 80 px) and the "!" markers over the next tasks.
3. "אני אעשה את זה": the job's game, then its reveal.
- **Acceptance:** test/task-scenes.cjs for chapters 1–2 by touch (his size, the frame, ≤ 150 draw calls); hero-ground stays at 11/15 or better.

**PRODUCER15: her eyes.**
1. The v27 baseline on a fresh save (her first 10 minutes).
2. Every merge by touch as she would: the first ★, the first task, ★ a minute, the scenes skipped, waits, escapes.
3. The K80 gate in two parts; docs/PRODUCER-S15.md with the verdict and the top 10.

## Sources for STORY15 (what the game already cites)
content/facts.json (the facts by stage), content/build_process.json, content/finds.json, content/moments.json, content/middot-quiz.json, src/game/content.js (STAGES, PROJ, keyWords, DECKS, the stage cards), content/REVIEW.md (the owner's checklist of drafts). A new source only with an exact reference (Mishnah/Gemara/Rambam/Josephus/archaeology); otherwise המחשה.

## At the hard stop
- **Your branch:** everything committed; it builds; your tests green or each failure explained; `git merge-tree --write-tree master s15-<you>` clean.
- **Your report on the bus**, ending with `NEXT:`: what you built (file:line), the real-touch results and the shots you looked at, the bundle delta, ⚑ lines in Hebrew with defaults, requests as file:line.
