# Wave 7 — common brief (2026-09-28, 05:10 UTC; feature freeze 07:10 UTC, hard stop 07:30 UTC = 10:30 Jerusalem)

**Where we are.** v15 is published: wave 6, nine agents, all merged into master at b32cc0f. The owner's two goals (27.9) still
drive everything:
1. a stunning, inviting, REAL world — the House, the characters, the city;
2. Phase A as a long, deep construction game that keeps a 15–18-year-old playing. Phase B's experience comes after Phase A.

His words, the full rules and the machine limits are in **docs/WAVE6-BRIEF.md** (read it: the content rules, git, the machine,
budgets, the guarded calls). They all apply here. What wave 6 built is in PROJECT.md §5, §8 (the "Wave 6" entry) and §12
(the "Wave 6" API block), plus the docs listed there. The owner's messages this morning:
- "מה קורה?" — he follows closely.
- "תפעיל. ואל תעצר חבל על הזמן." — steady progress, no stalls.

**This wave: four agents, polish that the owner and a teen will feel on the phone within the first 10 minutes.** Small,
finished, committed pieces.

**Usage economy is real.** Wave 6 was stopped three times by the account's usage limit. So:
- Read big files by ranges (grep -n, then Read with offset/limit). stages.js is 290 KB; main.js, game/index.js, crews.js,
  avodah3d.js and actors.js are large.
- Keep outputs short.
- Take few, targeted screenshots, and look at each one.
- No sub-agents.
- Commit every 15–20 minutes, so a sudden stop loses nothing.

## The bus
- The bus is /home/claude/wt/bus/. Wave 6's notes are in bus/w6/, read-only; the source pack is also in docs/SOURCES-S6.md.
- Keep ONE notes file, bus/<AGENT>7.md.
- By 05:30 UTC, post your plan there.
- Every 40 minutes, post what landed (hash) and what you need. Read the others' notes when you post.

## Git
- Own worktree and branch; commit small steps; end every message with the two lines from docs/WAVE6-BRIEF.md.
- Never touch master or another worktree. To try another branch, make a throwaway detached worktree and remove it afterwards.
- At the freeze, check that your branch merges cleanly into master: `git merge-tree --write-tree master s7-<you>`.

## The four agents
| agent | worktree · branch | owns |
|---|---|---|
| BUILD7 | wt/build7 · s7-build | src/game/state.js, index.js, content.js, ui.js, ui.css.js, moments.js, middot.js; test/game-*.{cjs,mjs}, test/moments.cjs; docs/BUILD.md, docs/BUILD-he.md; main.js blocks `// ── build6 ──` / `// ── build7 ──` |
| WORLD7 | wt/world7 · s7-world | world.js, city.js, sky.js, mount.js, tex.js; temple.js + sanctuary.js for LOOK only (keep ids, stage tags, positions; leave `// ── water ──` blocks alone); src/batch.js (the reveal shader, SITE's in wave 6); main.js blocks `// ── world6 ──` / `// ── world7 ──`; info.js |
| PEOPLE7 | wt/people7 · s7-people | actors.js, crews.js, life.js, crowd.js, animals.js; the hero fences in stages.js (`// ── hero (PEOPLE) ──` … `// ── /hero ──`); main.js `// ── crowd ──` |
| FUN7 | wt/fun7 · s7-fun | src/game/hooks/*, src/game/minigames/*, src/game/audio.js, src/match3/*, src/kings/*; test/playtest/*, test/hooks*, test/minigames*, test/match3*, test/kings*; docs/FUN.md, new docs/PLAYTEST-S7.md |

Nobody owns the rest of stages.js (SITE's) this wave. Only a one-line fix there, with a note on the bus.

## The work (the priorities; each agent reads its section)

**BUILD7 — the first ten minutes and the fixes of docs/PLAYTEST-S6.md §5** (the owner's defaults, docs/BUILD-he.md, apply):
1. **The opening.** The first frame is the vision: the finished House over the Old City at the golden hour (WORLD7 gives the
   camera, `BEAUTY` in src/city.js), then a flight down to the rough Mount where the player starts ("כאן ייבנה הבית").
   It is skippable with a tap, 6–8 s, once per new game. #demo opens the same way.
2. **The pill and the text.**
   - The pill frames a board by what it pays: "▶ המחצבה · כ־40 אבנים".
   - Counts in the plural wherever a count of stones is a sentence.
   - Toasts one at a time, 1.5 s apart.
   - The crew chip in words: "הצוות מניח אבן בעוד 3:03".
   - The Mount's stock chip reads as a plan ("מלאי לחומה").
3. **Boards and crews (the owner's defaults ⚑1).**
   - A 3★ board pays a third segment.
   - The crews keep setting stones while a board is open, and on close: "בזמן שחצבת: הצוותים הניחו N אבנים".
   - Re-run game-sim, and FUN's loop-sim (test/playtest/loop-sim.mjs). Targets: the first course ≤ 6:00; the boards' share of
     the first session ≤ 55% for Maya.
4. Keep green: node tests, game-sim, game-harness, game-flow, game-e2e, moments --harness, qa-content-scan.

**WORLD7 — what the player sees most, made beautiful:**
1. **The opening vision shot** (for BUILD7): the House over the Old City at the golden hour, the city's roofs and walls around it.
   Export it with the other BEAUTY shots.
2. **The Phase A site view at every time of day:**
   - the rough Mount;
   - the wall site;
   - the altar;
   - the house.
   Light, shadows, haze, ground detail, and the clouds in frame. Before/after pairs from the same camera.
3. **Night must read.** The Kidron night shot is nearly black. The city at night needs moonlight, lamps and a sky gradient,
   readable on a phone, with no new shader programs at night (test/qa-shaders.cjs: ≤ 12 added).
4. **The Ulam's façade and the Heichal up close:** richer ornament and material, the gold reading as gold. Keep the ids.
5. **SITE's open bug:** stripes on the altar's top while it is building (docs/SITE.md). A candidate fix in batch.js is in master
   (b8ba830): check it on the phone, and finish it.
6. Phone draw calls ≤ 150; bundle growth ≤ 60 K.

**PEOPLE7 — characters that charm on a phone** (the bar: Brawl Stars / SimCity figures, dignified):
1. **The hero:**
   - a readable silhouette, face and eyes, a hair/beard variety, the kohen's dress;
   - idle life between strokes;
   - a small "got it" gesture when a stone is set;
   - a proud pose at a key moment's end.
2. **Crews and crowds.** Variety of faces, skin, cloth and height. No two neighbours in sync. The plaza's families and
   activities read at the usual game distance.
3. **Animals** that read (oxen at the carts, sheep, doves), within their draw calls.
4. **Tests:** crews.cjs, life-lab.cjs, avodah3d.cjs, stages_api*.cjs and game-harness stay green.
5. **Phone shots:** the hero at 3 distances; the plaza; a crew.
6. **Budget:** ≤ +3 draw calls, bundle ≤ +50 K.

**FUN7 — the teen's second look, on the published v15 (master b32cc0f):**
1. **Play it as Noam and Maya** (docs/FUN.md personas): the first 10 minutes, day 1, a return visit. Write
   docs/PLAYTEST-S7.md with the new top 10.
2. **Fix what is yours:**
   - the precision games' feel, juice and difficulty curve;
   - the match-3's first boards, which must dazzle: cascades, specials, the vessel collection;
   - the kings' first deal as a small story;
   - the sounds.
3. **One new hook with a real reason to come back tomorrow**, for example a daily "find of the day" from finds.json with its
   true archaeology, or the week's challenge. Use only facts already verified in docs/SOURCES-S6.md / content/*.json (no new
   quotes this wave).
   - No gambling, loot boxes, purchases or guilt.
   - Shabbat and Yom Tov never break a streak.
4. **Post P0s for BUILD7 on the bus by 06:15 UTC**, so they can land before the freeze.
5. **Tests:** minigames, hooks*, match3*, kings* stay green.

## At the hard stop (07:30 UTC)
- **Your branch:** everything committed; the branch builds; your tests are green, or each failure is explained.
- **Your final message** is your report to the supervisor:
  - what you built, by file;
  - how to test it, and the results;
  - screenshot paths (looked at);
  - the bundle delta;
  - ⚑ decisions for the owner, one Hebrew line each with a default;
  - requests to others, as file:line.
