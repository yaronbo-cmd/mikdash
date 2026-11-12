# The look of the world: common rules for rounds A to D

Coding briefs for four rounds that make the world and everything in it look like real stone, earth, wood and sky, in our own
code, with no bought art. The owner approved the Hebrew spec "מפרט נראות: העולם והאבנים"
(https://claude.ai/artifact/4ckj6hwtPbyBEW5JSf7y7F) on 2026-11-11 10:36 UTC: "תכין מפרטי עבודה מפורטים לארבעת הסבבים. והתחל."
He left the spec's four questions open, so its recommendations hold: cream-white Jerusalem stone, four rounds with round A
first, trodden paths and wheel ruts on the ground (round B), the sun moves slowly within a stage (round C).

Each round is its own build, handed to the owner with before/after pictures, and the next round starts only after it.
Base: build 117 (commit 98897db). Build 118 (stage 02 fixes: `src/game/h111/stakes.js`, `bond.js`, `model.js`,
`tools/h109bot.js`) is being coded in another thread on another branch and is NOT pushed yet. To keep the later rebase small:
put new code in NEW files under `src/look/`, and touch existing files with the smallest hooks possible. Do not edit
`src/game/h111/stakes.js`, `bond.js`, `model.js` at all; in `src/game/h111/world.js` change only the two lines named in A.

## What must not change (any round)
- No minigame changes: rules, difficulty, scores, positions in the world, cameras, touch areas, texts, the bot.
  `tools/h109bot.js` must play every act exactly as before. All tests stay green (same count as before your change, plus yours).
- Sparks, dust, flash and the popping number of every hit stay. The green placement marks stay clearly readable on the new
  stone (check contrast in the shots; if a green mark is weak on cream stone, darken the stone under it, not the mark).
- The grid stays invisible. The Mount's gold square line stays. No light column returns.
- Low-poly, drawn style. Richer and believable, not photoreal. No external assets, no fetch: textures are drawn on canvas at
  load (`src/tex.js` style) or computed in shaders. Never fetch a data: or blob: URL (artifact CSP).
- NO LEFTOVERS: when a new material or geometry replaces an old one, delete the old one and every use. Grep proves it.
- Sources: any text or claim shown to the player needs a source; this work shows none. Do not add texts.

## Budget (measured, not guessed)
- Frame time in the same scene, before and after, `Q.level` 'normal', 960×600: at most +10%. Measure with the existing
  profiler (`PROF`, `src/prof30.js`) or `renderer.info` (draw calls, programs, triangles) and report the numbers.
- New shader programs: at most 3 per round. Share materials; per-object variation goes through `material.color` on a clone
  that shares the program (`customProgramCacheKey`), `instanceColor`, or vertex colours. Never one texture per stone.
- Load time: at most +1 s in total over the four rounds on the probe machine; page size: at most +150 KB in total.
  The page is already over the old 5 MiB warning; do not add binary assets.
- `Q.level` 'low' and 'normal' drop the fine relief (normal maps, shader detail octaves) but keep colours, tints and shapes.

## How to work
- One commit per lettered item of the round's brief, tests green after each, message in English, plain.
- `npm ci` (or `npm i`), `node build.mjs`, tests as the repo runs them (`node --test test/` and the h109 tests; find the
  exact command in the repo and report the count). `node tools/probe109.cjs SCRIPT.json OUTDIR 960 600` for shots; never two
  probes at once; the probe is slow (about 1 fps). Hooks: `window.__H109_ONLY='<kind>'` opens one minigame
  (course, pave, read, waste, rocks, rope, corner, great, letters), `__H109_DONE`, `__T.game.h109._goId(id)`,
  `__T.pause(true); __T.look([x,y,z],[x,y,z]); __T.render0()` for a free camera shot.
- Before/after shots are part of the work: take the "before" set at commit 98897db first, from fixed cameras, save the
  script, and retake the same set after. Sets are listed per round. Put them in `/mnt/project-files/mikdash/look/<round>/`
  (network mount: trailing slash on the path, never search the whole folder, re-read a file ten seconds after writing).
- Do not push, do not open or edit a PR, do not publish. Leave commits on branch `claude/project-thread-yk65r5`. The
  reviewer (Fable) replays, looks at every shot, sends fixes, and only then anything goes to the owner.
- End with a report: commits, test count, the budget numbers, shots list, what is weak or unfinished, said plainly.
