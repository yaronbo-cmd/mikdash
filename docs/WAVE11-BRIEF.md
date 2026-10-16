# Wave 11: the producer plays the whole game; the team makes every stage fun, interesting and working

2026-09-29. Start 06:25 UTC. Plans on the bus by 06:45. Feature freeze 09:10 UTC. Hard stop 09:25 UTC (12:25 Jerusalem).

## The owner's words (29.9, 09:13 Jerusalem), for every agent
> "כן. תן לו לרוץ על כל המשחק גם על השבים [השלבים] הבאים ולהעיר הערותיו ולשפר בהתאם. אגב, זה שהכהן עכשיו זז מנקודה לנקודה זה
> מאוד יפה. שימשיכו ככה. תודה. זה הכי חשוב שיהיה כיף ומעניין ותקין כמובן."

- **The compass for every change: כיף, מעניין ותקין.**
  - Fun: something happens that a child wants to see.
  - Interesting: a true thing learned, a view, a choice.
  - Working: a tap gives a result, and nothing is stuck, floating, hidden or zoomed out.
- **He loves that the kohen now walks from point to point** at his work (the Mount's courses: his banker, the course, the check).
  Keep it, and bring it to every stage.
- He approved the plan: PRODUCER11 plays the whole game, stage after stage, and the others improve it by its notes.

## Where we are
- **v20 is published** (master 524881b).
- **Wave 10's work:**
  - the Mount's courses fixed: the banker stays in the bay, the builder is in frame, the course check;
  - Middot quizzes with learning points and place links that fly to the world;
  - five in-between games with a duel on one phone;
  - "כהנים יחד" over the artifact's `room`.
- **Read first:**
  - PROJECT.md §8 ("Wave 10" and "Next (wave 11)");
  - docs/PRODUCER-S10.md: the verdict, the top 10, and notes N1–N38 with their state;
  - the wave-10 notes in bus/w10/ (read-only).
- **The Phase A stages, in the order a player meets them** (content.js STAGES):
  - שיטוח ההר;
  - חומת העזרה, then שערי העזרה, עזרת הנשים, הסורג והחיל, שער ניקנור, הלשכות;
  - יסוד המזבח, הסובב, גוף המזבח והכבש, הקרנות, הכיור;
  - האולם, ההיכל, קודש הקדשים;
  - then חנוכת הבית (the finale) and Phase B (the service).

## Rules
The rules of docs/WAVE6-BRIEF.md, WAVE8B-BRIEF.md, WAVE9-BRIEF.md and WAVE10-BRIEF.md apply in full:
- drafts marked טיוטה, each with its exact source;
- never write the Name, not even in code or tests;
- no gore;
- no gambling, loot, purchases or guilt;
- Shabbat and Yom Tov never break a streak;
- Hebrew RTL, phone first, 44-px targets;
- no paid services;
- no sub-agents.

**Testing:** real touch at 390×844, no autoplay flags in acceptance tests. Look at every screenshot you take.

**Usage:**
- **commit every 15 minutes**;
- read big files by ranges;
- keep your outputs short.

**The machine has 2 cores. Every browser run goes through the queue:** `/home/claude/wt/bus/brun <command…>`.
- It is first come, first served, one run at a time.
- A run is cut at 10 minutes, so split long plays into parts.
- (Wave 10's flock lottery made runs wait up to 25 minutes.) Never `pkill -f` a pattern that matches your own shell.

**Never shadow an imported helper** (`smooth`, `clamp`, `lerp`…) inside a module's closure (v19's yellow wash).

## The bus
- It lives at /home/claude/wt/bus/, with a notes file per agent: bus/<AGENT>.md.
- Post your plan by 06:45 UTC, then an update every 40 minutes.
- **bus/PRODUCER11.md is the inbox.** Each note gives:
  - the owner;
  - the severity (P0 stops play · P1 the owner would notice · P2 polish);
  - the stage;
  - the screenshot;
  - what "fixed" looks like.
  Owners answer under the note: fixed at <sha>, or why not.

## The four agents
| agent | worktree · branch | owns |
|---|---|---|
| PRODUCER11 | wt/producer11 · s11-producer | test/produce-*.cjs, new docs/PRODUCER-S11.md, bus/PRODUCER11.md. Plays every stage; changes no game code |
| FLOW11 | wt/flow11 · s11-flow | src/game/state.js, index.js, content.js, ui.js, ui.css.js, moments.js, facts.js, minigames/*; main.js `// ── build* ──`. Tests: game-*.{cjs,mjs}, game-courses-touch.cjs, moments.cjs |
| SITE11 | wt/site11 · s11-site | src/stages.js, crews.js, batch.js, mount.js, and the construction layer's parts of temple.js; main.js `// ── site11 ──`. Tests: site_*.cjs, stages_api*.cjs, crews.cjs; docs/SITE.md |
| FUN11 | wt/fun11 · s11-fun | src/games/*, src/game/middot*.js + content/middot-quiz.json, src/game/hooks/*, src/net/*, src/match3/* (fixes); a `// ── fun11 ──` fence in ui.js/index.js if needed (agree on the bus with FLOW11). Tests: games-touch, middot-touch, net-together, their node tests |

A fence starts with `// ── <agent> ──` and ends with `// ── /<agent> ──`. Only its owner edits inside it, and it stays small: a hook,
not a feature. Keep the wave-10 fences (middot10, games10, net10) working. FUN11 now owns them.

## The work

**PRODUCER11: the whole game, stage by stage.** You play; you never change game code.
1. **First:** pass the owner's words above to everyone, in your first bus note.
2. **By 07:00, the wall (חומת העזרה) fully.** From the Mount's last course, through the wall's survey, foundation and courses,
   to its end. It is where the owner goes next, and nobody has played it by touch.
3. **By 08:00, every later stage, in order.**
   - Reach each stage's start with produce-play's declared jump (the state is written once, then only touch).
   - Play a few minutes of it by touch: its first work, one course or phase, and its key moment when you can.
   - Also play:
     - the finale (חנוכת הבית);
     - a short look at Phase B (the morning's service);
     - wave 10's features on the phone: the Middot place links (N24–N30 re-seen), the games' door, and N31.
4. **Every note answers three questions:** is it fun, is it interesting, is it working? Also: can I see my kohen (≥ 80 px, in
   frame)? Does he walk from point to point at his work? Do I know what to tap? Does the stone go where I see it go? Is anything
   floating, flickering, stuck, zoomed out, too dark or too yellow?
5. **Make "the kohen ≥ 80 px and in frame" a logged check** at every shot of produce-play (top-10 #3).
6. **From 07:30, every ~40 minutes:** re-play the fixes on a throwaway merge of the others' branches in wt/peek11, and post
   notes.
7. **By 09:05, the verdict:** docs/PRODUCER-S11.md.
   - Each stage ✓/✗ on fun, interesting and working, with evidence.
   - The notes' state.
   - The top 10 for wave 12.
   - ⚑ lines in Hebrew, each with a default.

**FLOW11: the game's flow at every stage.**
1. **N34 first: a reopened game lands on the kohen at his work.** At the Mount's courses and at every other stage:
   - place him after the site is posed;
   - fly the work frame on the load's first frame;
   - no empty frame.
2. **PRODUCER11's notes on flow, UI and words, stage by stage.** Every P0 is fixed the same hour.
3. **Known items:**
   - the ring waits for him at the corner stone (N15);
   - the coach line after the opening's camera lands (N6);
   - the stage sheet's red line under the bar (N36);
   - the course label (N35 re-seen).
4. **Bring "he walks from point to point at his work" into the game side of every stage:** `keepAtWork`, `workSpot` kinds, and
   the key moments' spots. Do it with SITE11.
5. **Keep green:**
   - game-harness, game-flow, game-touch;
   - game-courses-touch, both parts;
   - moments --harness;
   - node tests and qa-content-scan.

**SITE11: the world at every site, and the kohen moves from point to point everywhere.**
1. **The wall first: its living site.** Use docs/STAGING.md §6, the wall's shot list:
   - his banker at the course's next slot (rule 8: the stone is dressed where it is set);
   - the crane on the course;
   - stock that shrinks;
   - gangs and scaffolds that climb.
   Frame it with CAM.WALL; the kohen is ≥ 80 px.
2. **Then the gates (§7) and the altar (§8).** The altar's stones are carried, fitted and seated with a wooden mallet, never dressed.
3. **At every stage:**
   - the builder's work points (workSpot) are sensible, and he walks between them in the frame;
   - the camera is at working distance;
   - no stone floats;
   - the progress shows in the world.
4. **The corner stone seen on the hook and landing** (top-10 #4), with FLOW11's ring.
5. **A door to the in-between games in the world** (top-10 #6): a game table by the quarry, with a pick target that calls FUN11's
   opener. Agree on the bus.
6. **The rocks' camera, 28° → 18° (N9).** Decide by the producer's evidence; the default is 18°.
7. **Keep green:**
   - site_mount, site_api, stages_api*, crews;
   - ≤ 150 draw calls per phone view.

**FUN11: fun and interest across the game.**
1. **Every stage needs a moment a child wants to see.** Use the producer's notes per stage.
   - Propose changes to key moments on the bus with file:line (moments.js is FLOW11's).
   - Build what lives in your files.
2. **Middot:**
   - fold the daily Middot question into the learning points (wave 10's ⚑ default);
   - fix the quiz's longest-answer bias (15 of 68);
   - re-verify the place links on the phone with the producer (N24–N30).
3. **The in-between games:**
   - the world's door with SITE11 (your side: open the games from the table, and a chip after the board);
   - variety in which game is offered when.
4. **"כהנים יחד":**
   - N31: the flight to the other kohen lands close, with him ≥ 80 px;
   - keep the `db` path ready behind a flag (the owner decides on public sharing).
5. **Engagement without pressure:** days and streaks respect Shabbat and Yom Tov, and there is no guilt.
6. **Keep green:** games-touch, middot-touch, net-together, and their node tests.

## At the hard stop (09:25 UTC)
- **Your branch:**
  - everything is committed;
  - it builds;
  - your tests are green, or each failure is explained;
  - `git merge-tree --write-tree master s11-<you>` is clean.
- **Your final message** is your report:
  - what you built, by file:line;
  - the real-touch results;
  - the screenshots (you looked at them);
  - the bundle delta (budget 3 MB; v20 is 2.64 MiB);
  - ⚑ lines in Hebrew, each with a default;
  - requests, as file:line.
