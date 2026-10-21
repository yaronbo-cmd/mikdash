# Wave 6 — common brief (2026-09-27; resumed again 20:50 UTC; hard stop 23:30 UTC = 02:30 Jerusalem)

**Why the restarts.**
- A first start at 08:03 UTC was stopped at 08:13, because the owner added his daughter's idea (below).
- The nine-agent start at 08:20 UTC was stopped at 08:30 by an account usage limit.
- The 11:05 UTC run was stopped at ≈ 12:00 UTC by the usage limit again. Its work is committed on your branch and described
  in your notes. Nothing has been merged or published yet: the owner still sees v14.
- The owner (23:34 Jerusalem): "תפעיל. ואל תעצר חבל על הזמן."

**This run: finish, harden, make it merge-ready.** At 23:30 UTC the supervisor merges all nine branches and publishes v15.
A branch that doesn't build, or leaves half-wired code behind, cannot ship. So until then:
- complete what is started;
- wire it for real;
- test it;
- commit every 15–20 minutes, so that a sudden stop loses almost nothing.
Big new features wait for wave 7, which starts right after v15.

Every agent now is a FRESH agent resuming a role. Before new work:
- read your notes on the bus (bus/<AGENT>.md) in full, and skim the others' latest sections;
- read your worktree's state (`git status`, `git log --oneline c4e8113..`, uncommitted files);
- keep and commit what works, and drop what's broken;
- append a "20:50 resume" section to your notes: done, left, and your plan to 23:30.

**Usage economy — this is real.** The wave was killed once by the usage limit, and every token counts toward it:
- Read big files by ranges. Use `grep -n`, then Read with offset/limit. src/stages.js is 194 KB, and main.js, sanctuary.js,
  avodah3d.js, crews.js and actors.js are large: never read one whole.
- Keep tool output short (`| head`, `| tail -20`, `--stat`). Never paste whole logs or JSON dumps.
- Don't re-render full-world screenshot loops. Take a few targeted shots and look at them once.
- No sub-agents.
- Commit small increments often, so a sudden stop loses little.

## The owner's words (ירון בן אור, 27.9, 11:13 Jerusalem — verbatim)
"קודם כל יפה מאוד עד עכשיו. אבל - בשלב הנוכחי אני רוצה לשפר 2 נושאים: 1. את הנראות של העולם התלת מימד והדמויות והבית.
ו-2. את חוויית המשחק, בתחילה בשלב הראשון ואח"כ נעבור לשני. כיום, כשאני בונה את הבית הדמות שלי רק מכה בפטיש באופן שנרהא
מלאכותי ובאוויר. בנוסף, גם התקדמות הבנייה נעשית רק על ידי הקשות וכבר כל הקומה נבנית, צריך לתת שם יותר מחשבה ויותר דיוק,
שהשחקן יעבוד יותר, שייקח לו זמן לבנות את הבית, ממשך כמו אתר בניה שהוא מנהל הפרויקט היזם והמהנדס. אני לא רוצה שהחלק הזה
ייגמר מהר בכמה לחיצות, להיפך. הליך הבנייה שיהיה מורכב ובעולם שנראה מהמם ומזמין, אמיתי, עננים בשמים שמויות בעיר העתיקה
חומות ירושלים, אנשים ברחבה שעושים פעילות אמיתית וכו'. דבר נוסף, אין זרימת מים או דם. הכיור לא מזרים מים ולא שוטף באמת את
רגליה הכהנים, אין ניקוז. גם לא במזבח. ואולי הכי חשוב בשלב הזה זה רמת המשחק שתשאיר את השחקן במשחק כמה שיותר זמן, אז ככל
שיהיו לו יותר אתגרים ומשחקים ו"הוקים" להישאר במשחק כן ייטב, ולכן צריך סוכן שפשוט יהיה אחראי על הכיף וחווית המשתמש, נניח
נער בן 15-18 שנכנס לשחק. ... כרגע בוא נתחיל בלייפות את העולם ולדייק אותו ולציור חוויית בנייה של משחק שתהיה הרבה יותר
יסודית מזו הנוכחית."
"תייצר סוכנים רלוונטים יעודיים ככל שיידרש לקידום העניין."
**And his daughter's idea, which he adopted:** "עוד רעיון שעלה לבת שלי זה שבתור ה'הוקים' כמו במשחקים אחרים בסגנון, לפני כל
שלב בנייה (אפילו חציבה) - יהיה משחק של לפחות שלוש דקות שהרמה שלו עולה ממשחק למשחק נגיד של מהו בסגנון של 'קנדי קראש' אבל
עם דברים של בית המקדש נגיד מנורה, מזבח, כד שמן כל מיני כאלה. ושיהיה אופציה לחצוב ואת הזהב ולכרות עצים. ושיהיה אופציה לדבר
עם מלכי אומות העולם ולעשות איתם עסקים. שיהיה לי מד של מטבעות כסף זהב עצים לבנים כל מה שאני צריך ושבעזרת המטבעות אני אוכל
להתקדם בכל שלב שאני רוצה ואת המטבעות אני אשיג מה'הוק' שלפני כל שלב. ממש את האבנים".

## The wave's three goals
1. **A stunning, inviting, real world.**
   - Sky with clouds; the Old City and the walls of Jerusalem; people in the plaza doing real things; better characters; a
     better House.
   - Water that flows: the kiyor's spigots pour, kohanim really wash hands and feet, and the water drains away.
   - The altar's drainage is shown with dignity.
2. **Phase A as a deep construction game.**
   - The hero's hammer lands on real stones.
   - Building rises stone by stone and course by course. Never a whole floor per tap.
   - It follows a real process: survey → quarry → transport → dress → lift → set → inspect.
   - The player is its project manager, developer and engineer.
   - Long, precise and varied, with challenges and hooks that keep players playing.
   - A fun/UX owner judges it all through the eyes of a 15–18-year-old.
3. **The daughter's economy of hooks.**
   - **A match-3 in the style of Candy Crush, before every building step (even quarrying).** Its pieces are Temple things:
     menorah, altar, oil jug and the like. Each game lasts at least three minutes, and the level rises from game to game.
     What you collect on the board is literally the building material: "ממש את האבנים".
   - **Its fields** are the options the owner asked for: the quarry (stones), the Lebanon forest (cedar) and the gold mines
     (gold). Choosing which field to play is choosing what to gather.
   - **Business with the kings of the nations.** Talk with them and make deals for cedar, copper, gold and doors.
   - **A resource meter always on screen:** silver coins, gold, wood, stones, bronze — everything needed.
   - **Resources are spent to advance any stage the player chooses.**

**Paid services: none.** The owner forwarded a post about someone who spent $80–100 on AI video without approval. We never
spend money, or use paid APIs (ElevenLabs, fal, image or video generators…), without the owner's explicit approval. The shell
only reaches npm, pip and GitHub anyway. All assets are procedural: code-built geometry, canvas/SVG art and WebAudio. The one
exception is a CC0 or MIT asset from npm or GitHub, with its licence recorded in your report. Never GPL, AGPL,
non-commercial or Mixamo.

## Read first
- `PROJECT.md` (the bible):
  - §2 content rules
  - §4 world conventions: 1 unit = 1 amah; +x east, +z south, +y up
  - §5 code map
  - §12 world contract
  - §13 how agents work
  - §11 decisions
- The docs for your area: docs/GDD.md (Phase A's old design, all DRAFT), CREWS, MOMENTS, SCENES, HOOKS, PLAYTEST, AVODAH,
  UI-S5.
- Your worktree has these at master c4e8113.

## Content rules (unchanged, strict)
- **Drafts and sources.** Every text is a draft tagged "טיוטה" with an exact source. Quote verbatim only when the quote is
  verified; otherwise paraphrase and say so.
- **The Name.** Never write a Divine Name — not in texts, code, comments or tests. Write ה׳ or אלקינו.
- **No Ark** in the Second Temple (Yoma 5:2).
- **The Kodesh HaKodashim.** The player never walks into it.
- **No gambling, loot boxes, purchases or guilt.**
  - The match-3 has no paid lives, paid boosters or paid moves. Retries are free.
  - Shabbat and Yom Tov never break a streak.
- **Layout.** Hebrew RTL, phone portrait first, 44-px touch targets, AA contrast.
- **Dignity for holy vessels.** In the match-3 the vessels are never smashed, crushed or exploded. A match makes them glow
  and rise into the collection. The tools (hammer, chisel, wedges) act only on stone, rubble, earth and wood.
- **No gore.** The shechita is a cut-away. The owner now wants the altar's drainage seen:
  - The rest of the blood, poured at the yesod, runs into the two shitin holes at the south-west corner and away with the
    water of the amah to the Kidron (Middot 3:2; Yoma 5:6).
  - Show a thin dark-red trickle into the holes, then clear water in the channel.
  - Never spray, pools, wounds or a bleeding animal. Nothing graphic: the audience is 10+.
- **Historical figures** (kings, queens). Deals and facts come from sources. Dialogue is short, dignified and marked as
  dramatization ("המחשה"). Portraits are stylized, not likenesses, and never show pagan cult symbols.
- **Silent sources.** Where the sources are silent, make an illustration choice and say so (`illus: true`, a ⚑ for the
  owner).

## Git
- Work only in your worktree and branch. Commit small, finished steps.
- End every commit message with these two lines:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FJuHTqUYJ3XzQa8HvJetqN
- Never commit dist/ or test/out/.
- Never touch master or another agent's worktree. The supervisor merges.
- **Playing or testing others' committed work.** Use a detached worktree and remove it when done:
  1. `git worktree add --detach /home/claude/wt/peek-<you> s6-<branch>`
  2. `ln -s /home/claude/temple3d/node_modules` inside it, then `node build.mjs`.
  3. You may `git merge` other s6-* branches there. It is throwaway; never push it anywhere.

## The machine: 2 cores, 7 GB, shared by NINE agents
- **Browsers.**
  - Never run more than ONE browser at a time, and always close it (`finally { await b.close() }`).
  - DOM-only work (match-3, kings, UI) runs a page without the 3D world where possible (a harness page); it is much
    lighter.
- **Prefer fast checks:** node tests, the DOM harnesses and lab scenes (test/*-lab.html).
- **Rendering.**
  - Render at small sizes: phone portrait 390×844 at dpr 1, or 640×360, with `__FORCE_Q='normal'`.
  - Full-world SwiftShader frames take 20–300 s under load. Keep full-world screenshot runs few and targeted.
  - Look at every screenshot you take.
- Kill only processes you started.
- **Build:** `node build.mjs` → dist/temple3d.html (the page) + dist/test.html (a full document for tests).
- **Browser tests:**
  - `NODE_PATH=/home/claude/.npm-global/lib/node_modules`.
  - Chromium: `/opt/pw-browsers/chromium`, args `['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']`.
  - In real-build tests: set `window.__DT_MAX = 0.6`, pause the loop with `__T.pause(true)` and render on demand with
    `__T.render()`.
  - Also available: `window.__START_PAUSED`, `__NO_GAME`, `__FORCE_Q`, `__AV_NOW`.
- **Budgets.**
  - Bundle: master is 1,986,668 bytes; the wave total is 3 MB. Your share, in bytes added:

    | agent | share |
    |---|---|
    | WORLD | 160 K |
    | PEOPLE | 100 K |
    | WATER | 60 K |
    | SITE | 100 K |
    | BUILD | 100 K |
    | FUN | 100 K |
    | MATCH3 | 90 K |
    | KINGS | 60 K |
    | CONTENT | 50 K (the build strips reviewers' fields) |

  - Phone frame: ≤ 150 draw calls, ≤ 1.5 M vertices, no per-frame allocations. Instance and merge.
  - New shader programs are precompiled; night must not recompile (test/qa-shaders.cjs, ≤ 12 programs).

## Coordination: the bus `/home/claude/wt/bus/`
- **Your notes file.** Each agent keeps one notes file there, `bus/<AGENT>.md`. Append to it; never edit others'.
- **Every 45 minutes:**
  - Post an update: what landed (commit hash), what changed in your promises, what you need.
  - Read the other notes.
- You may read other agents' worktrees (read-only): /home/claude/wt/<name>.
- **Milestones (UTC; check the clock with `date -u`):**
  - **21:05:** everyone's "20:50 resume" section is on the bus.
  - **21:20:** BUILD, MATCH3 and FUN settle the first-session economy (FUN's 11:53 P0: boards' share ≤ 55%, first course
    ≤ 6:00), and post the agreed numbers.
  - **22:00:** every promised API is committed and BUILD has wired it for real. main.js wiring goes in marked blocks.
  - **22:15:** CONTENT's verification pass of every branch's new Hebrew texts (file:line → fix).
  - **22:30:** FUN's final teen playtest, on a throwaway merge of all nine branches (docs/PLAYTEST-S6.md, top-10 fixes).
    The P0s go to their owners.
  - **23:00:** feature freeze.
    - Tests green.
    - Screenshots looked at.
    - Check that your branch merges cleanly with master (`git merge-tree --write-tree master s6-<you>`, or a throwaway
      worktree).
  - **23:30 (02:30 Jerusalem):** hard stop and your report.
- **Guarded calls.** Every cross-agent call is guarded, using the has()/call()/settle() pattern of src/game/index.js. The
  flow always continues without the other agent's work: a card, a camera move, or nothing.

## The nine agents, their files and their promises
| agent | worktree / branch | owns |
|---|---|---|
| WORLD | wt/world · s6-world | world.js, mount.js, tex.js; temple.js + sanctuary.js for LOOK only (materials, ornament, detail — keep ids, stage tags, positions; leave WATER's `// ── water ──` blocks alone); info.js (cards for new landmarks); main.js blocks marked `// ── world6 ──` (sky, lights, fog, time presets, post); new src/sky.js, src/city.js |
| PEOPLE | wt/people · s6-people | actors.js (the human rig and dress); crews.js (Phase A workers); life.js (its people); new src/crowd.js (plaza activities); the HERO inside stages.js, only within the fences `// ── hero (PEOPLE) ──` … `// ── /hero ──` (already committed as a812bbc; SITE has the same change); main.js blocks `// ── crowd ──` |
| WATER | wt/water · s6-water | new src/water.js (+ helpers); the flow parts of avodah3d.js (wash, sprinkle, libation, shirayim); temple.js ONLY the kiyor and the altar-drain meshes, in `// ── water ──` blocks; main.js `// ── water ──` block; a `// ── water ──` block in actors.js only if the washing posture truly needs the rig (tell PEOPLE on the bus first) |
| SITE | wt/site · s6-site | the construction site in 3D: src/stages.js (everything EXCEPT PEOPLE's hero fences), src/batch.js (the reveal shader), test/stages_api*.cjs, test/stage_shots.cjs; new docs/SITE.md |
| BUILD | wt/build · s6-build | the Phase A game: src/game/state.js, index.js, content.js, ui.js, ui.css.js, moments.js, middot.js; the resource meter and the spend-to-build loop; wiring MATCH3, KINGS, FUN, SITE, PEOPLE and WATER into the flow; test/game-state.test.mjs, game-sim.mjs, game-harness*, game-e2e.cjs, moments.cjs; new docs/BUILD.md + docs/BUILD-he.md |
| FUN | wt/fun · s6-fun | src/game/hooks/*; new src/game/minigames/* (the precision games of the site: crane, dressing, plumb, whole stones); src/game/audio.js (sound + juice for everyone); test/playtest/*, test/hooks*.test.mjs; new docs/FUN.md, docs/PLAYTEST-S6.md. The teen's voice in every review |
| MATCH3 | wt/match3 · s6-match3 | new src/match3/* (the Temple match-3: engine, art, levels, fields, juice); test/match3*.{test.mjs,cjs,html}; new docs/MATCH3.md |
| KINGS | wt/kings · s6-kings | new src/kings/* (trade and diplomacy with the kings of the nations: the map, the courts, the deals, the voyages); test/kings*.{test.mjs,cjs,html}; new docs/KINGS.md |
| CONTENT | wt/content · s6-content | content/*.json (new: build_process, city, plaza, water, finds, kings, vessels); content/REVIEW.md (a ⚑ section for wave 6); docs/CONTENT-S6.md; bus/SOURCES.md |

**Promised APIs** (the names are the contract; add more if you need them; post every change on the bus)
- **SITE**, on `stages`. Its detailed promise is in bus/SITE.md.
  - `siteInfo(id)`
  - `setWork(id, {phase, stones, ghost, stock, dressing, finish})`
  - `liftStone(id, opts)` → Promise
  - `nextSlot(id)`, `slots(id, course)`
  - `workSpot(id, kind)`
  - `setStage(id, 'building', p)` keeps working.
- **PEOPLE**, on `stages.hero`: the existing calls plus the following.
  - `act(kind, target)` → Promise per stroke. kind ∈ `dress | tamp | split | pick | measure | pull | carry`. The tool
    head meets the target at contact.
  - `onImpact(cb)`
  - `workpiece(state)`
  - Crowds: `crowd.setScene('site'|'plaza'|'festival'|'night')`.
- **WATER**, as `world.water`:
  - `kiyor({spigots, flow})`
  - `wash(kohen | position)` → Promise
  - `pour('shirayim'|'wine'|'water', opts)`
  - `mukhni(down)` → Promise
  - `channel(on)`
  - `waterMaterial()`
- **FUN**
  - `src/game/minigames/index.js`: `MINIGAMES`, and `runMinigame(kind, ctx)` → Promise<{ok, quality, perfect, ms, score}>.
    It always resolves, with a calm skip.
  - Hooks and audio, as in bus/FUN.md.
- **MATCH3**, in `src/match3/index.js`:
  - `runLevel(ctx)` → Promise<{ won, stars, moves, collected:{stone, cedar, gold, silver, bronze}, score, ms, quit }>
  - ctx = `{ root, field: 'quarry'|'forest'|'gold'|…, level, need, seed, demo, onEvent, sfx, haptic, save }`
  - `levelInfo(field, level)` and `FIELDS`
  - Pure engine functions, for tests and bots.
- **KINGS**, in `src/kings/index.js`:
  - `openCourt(ctx)` → Promise (the map and the courts; resolves on close). ctx = `{ root, G, now, apply, onEvent, demo, sfx }`.
  - Pure `partners(G, now)`, `offers(G, partner, now)`, `accept(G, offerId, now)` and `settle(G, now)`, which returns the
    deliveries due.
- **BUILD**
  - Calls all of the above, guarded.
  - Owns the flow, the save (slots `G.fun`, `G.m3`, `G.kings` for the others), the migration, the resource meter and #demo.

## The new Phase A loop, in one paragraph (BUILD designs it; FUN, MATCH3 and KINGS shape it; the owner decides)
**What you have.** A resource meter is always on screen: stones, cedar/wood, gold, silver shekels and bronze.

**Where resources come from:**
- **The pre-step game (the hook).** A 3–4-minute match-3 level in the field that matches what the next step needs. What
  you collect is the material itself.
- **Crews and stations over real time.** The quarry, the dressing yard and the carts, with offline progress (capped;
  nothing is lost).
- **Deals with the kings of the nations.** Voyages that take hours.
- **Daily goals and finds.**

**Where they go.** Every construction step of any available stage, chosen freely by the player:
- survey;
- dig and footing;
- each group of stones in a course (stone by stone, course by course);
- key stones through the precision games;
- finish, then inspection, then the stage's dedication moment.

**The player's roles:**
- manager: crews and schedule;
- developer: budget, deals, supply;
- engineer: the Middot measures, quality, inspections;
- builder: his hands on the key stones.

**How long it takes.**
- The first real stone is set within 60 s. The first session gives 10+ minutes of satisfying progress.
- The whole Temple takes weeks for a regular player, with no hard walls, and never money.

## Performance, tests, report
**Suites.** Keep every existing suite green, or update it with a one-line reason in the commit. Run the ones your files
touch:
- `node --test test/*.test.mjs`
- `node test/game-sim.mjs`
- `node test/game-harness.cjs`
- `node test/avodah-harness.cjs`
- `node test/moments.cjs --harness`
- `node test/scenes.cjs`
- `node test/qa-content-scan.cjs`
- `node test/integration-s2.cjs`
- `node test/game-e2e.cjs`
- `node test/qa-walk.cjs`
- `node test/qa-shaders.cjs`

**At the hard stop:**
- everything is committed;
- the branch builds;
- your tests are green, or each failure is explained.

**Your final message is your report to the supervisor:**
- what you built, by file;
- how to test it, and the test results;
- screenshot paths (you looked at them);
- the bundle delta and the phone draw calls;
- ⚑ decisions for the owner: one Hebrew line each, with a default;
- requests to other owners (file:line).

Work in small, finished increments, so that whatever time you have produces complete, committed pieces.
