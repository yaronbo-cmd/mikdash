# Wave 16: the screen is the tool — crafts in the world, workers everywhere, a balance instead of a gate

2026-10-04, launched 00:45 Jerusalem (21:45 UTC 3.10) at the owner's word "צא לדרך. (זכור לא להתפזר. להתקמצן)". **Two agents, few browser runs, short bus entries. Hard stop 01:00 UTC (04:00 Jerusalem).**

## The owner's words (4.10 00:33–00:41), the yardstick
> "הדמות לא עושה כלום. אני לא מצליח להבין כמה מטבעות אני נדרש כדי שתתחיל לזוז, רק משחקי ביניים די דביליים ולא מהנים. המשחקון עם החוט האדום קופץ כל רגע והוא לא טוב."
> "תפקידי הדמות המתחלפות יהיו בתוך המשחק… ללחוץ ימין שמאל, לדוגמא, או לשפשף המסך או כל פעולה נדרשת אחרת, אבל שזה יהיה בתוך העולם ולא כמשחקון חיצוני, ז"א שלא יראו חלונית נפתחת אלא אינהרנטי בתוך העולם. באותו אופן תבנה גם את יתר המקצועות."
> "צריך להוסיף דמויות שעובדות בכל אזורי הפרויקט… הוא ריק מפועלים… בעתיד שיהיו שחקנים נוספים שיוכלו לבנות גם."
> On the materials gate: "אם נבטל לגמרי את השער אז גם אנחנו נהיה בבעיה מהצד השני… צריך איכשהו למצוא איזון."
> His decisions: the strike is one craft among many; no result cards in the world; ~40 working figures; beta later; the טיוטה tags stay.

## Rules (unchanged; PROJECT.md §2 and docs/OWNER-NOTES.md)
Drafts marked טיוטה with exact sources or המחשה · never a Divine Name anywhere (ה׳ / אלקים / א-ל) · no gore, no Ark, never inside the Kodesh HaKodashim · no gambling, loot, real money, guilt, pressuring timers · Shabbat and Yom Tov cost nothing · RTL, phone portrait, 44-px targets · no paid services · no sub-agents · real touch at 390×844 on dist/test.html, no autoplay flags · bundle < 3.25 MiB (v28: 3.12).

## The three changes

### A. The balance (FLOW16): the kohen never stops; the materials pace the crews
- **His own work never waits for stock.** His banker always has a stone to dress; a key stone, a job, a craft is always offered. The materials rule of wave 14 ("the pill stays ▶ המחצבה when there is no stone to pay") goes: the deal is dealt whatever the stock.
- **The stock paces the crews**, visibly: when it is out, the crews stand by and the pill's sub-line says it plainly — "המלאי: 0 אבנים · הצוותים ממתינים · הכהן ממשיך" — and the deal keeps one extra card "▶ הביאו אבנים · כ־45 אבנים · לוח של ≈ 3 דק׳" (the count needed and the time). Her hand-built stones count as before.
- **The big button never opens a period game.** fun12's quarry cycle (`cyclePlan` / `cyclePill`) is retired from the pill: the board is offered only as that extra card when the stock is out; the period games live only at their table and in the games menu.
- **The snap-line opens once a stage** (its first course), never every course (`lineDue`: `cur.c === 0`).
- The materials chips show "have / the crews need" when something is short (the existing chips, one number added).

### B. The screen is the tool (FLOW16 the input, SITE16 the world)
No sheet, no pane, no result card for a craft played in the world. The 3D canvas takes the gestures; a hand hint anchored in the world (the ring's anchor system, `ui.coach(() => pos)`) shows where and when; progress is shown in the world (a small anchored meter where a craft needs one — the rope's lift, the saw's line) and by the world itself; the result is a float over the work ("★★★ מושלם · +12 מטבעות") and the mentor's one line with its source (the job's fact: טיוטה + ref) in his bubble, dismissed by a tap. The stars, coins, levels and FUN14's counting (`playJob` → `setShare`, `payJob`, `jobReveal`) are untouched: only the UI and the kohen's place change.
- **FLOW16: new src/game/hands.js** — a second frame for the existing UI-free models (tread.js, saw.js, snap.js… each has `step(dt)`, `tap(x,y)`, `drag(x,y,ph,id)`, `press(id, down)`, `cue()`, `result()`, `fact`): `runInWorld(model, { site, world, hooks: { begin, update, end }, hint, fx })` → the same Promise shape `runMinigame` resolves with. Gestures on the canvas while a craft is on: tap left/right of the kohen's screen point = `press('L'/'R')` (a tap is a step, a hold a stride — the model already does both); a hold = `press(id, true/false)`; a rub (back-and-forth swipe over the work's screen point) and a drag = `drag(x, y, ph, id)` in the work's local 0…1 box projected from the world (SITE16's `craft.box()` returns the screen rect of the work: the wheel, the log, the cord); a timed tap = `tap`. The hint hand follows `cue()` mapped the same way. The model's `fx` → the world's dust/sparkle/sfx at the work's point. `minigames/index.js runMinigame` routes a kind to `runInWorld` when `world.craft[kind]` exists and the site is live (not the demo reel, not `__MG_AUTO`), else to frame.js as today (the sheet stays the fallback and the lab).
- **SITE16: `stages.craft = { tread, saw, line }`**, each `{ begin(site) → {ok, at, box()}, update(state), end(result), box() }` (`tread` = SITE15's treadBegin/Update/End wrapped). **saw** — the sawyer at the crews' bench by the site: the kohen walks to the bench, takes the saw; the rub drives the real saw stroke on the real log (saw.js's model: pull on the off-beat); the log parts at the end; the planks go to the pile (sawB exists). **line** — the surveyor: the kohen walks to the course's end, the cord stretched from the first stake on the real wall; the drag lifts the real cord (snap.js's lift); the snap leaves the chalk line on the course (jobReveal 'line' exists). Each with the camera at K80 on the work (the slot/the bench/the cord in frame), his tool and pose, and his walk back.

### C. Workers everywhere (SITE16)
A life layer, not an economy: at the active stage ~30 figures at real work points (bankers along the front, the stock pile, the crane's crew, carriers on the road from the quarry, two sawyers at the bench, a surveyor pair), and a few at every finished stage (plasterers, sweepers, a guard), ~40 in all, with distance LOD (crowd.js), no per-frame allocation, ≤ +15 draw calls at any frame. The player's crew wears his colour (a sash) and his name on tap; the ambient workers are "פועלי הורדוס" (fiction, marked in the book's note). Multiplayer later renders other players' crews the same way — nothing of that is built now.

## Agents
| agent | worktree · branch | owns |
|---|---|---|
| FLOW16 | wt/flow16 · s16-flow | A (index.js `// ── flow16 ──` fences, content.js, jobs.js, games/cycle.js's hooks), B's input (new src/game/hands.js; minigames/index.js routing; tread.js/saw.js/snap.js minimal fences if a model needs a hook), the mentor's line/float; tests: new test/hands-touch.cjs (the tread in the world by canvas gestures: no `.fx-mg` element; the hint anchored in the world; the stone rises and seats; the float and the mentor's line; then the saw and the line when SITE16's hooks land), test/game-touch.cjs, game-courses-touch wall and part 1, game-harness, game-flow — all unchanged or explained |
| SITE16 | wt/site16 · s16-site | B's world (stages.js `// ── site16 ──`: `stages.craft`, the sawyer's bench and the surveyor's cord with the kohen's poses and tools), C (crews.js/crowd.js/stages.js: the life layer); tests: new test/life.cjs (≥ 25 workers in view at the Mount's zoom-out, ≥ 3 at a finished stage, draw calls ≤ 150, no console errors, 3 shots looked at), test/tread-world.cjs updated to the no-pane version once FLOW16's hands.js is on the bus (until then as is), hero-ground ≥ 11/15, site_mount, stages_api*, crews |

The supervisor plays the first ten minutes himself on the merge (game-touch, courses, a fresh-save probe) — no producer agent this wave (the owner: "להתקמצן").

## The bus (/home/claude/wt/bus)
FLOW16.md and SITE16.md, UTC-timed entries, the last line `NEXT:`. Contracts within 30 minutes: FLOW16 posts `runInWorld`'s hooks shape and what `craft.box()` must return; SITE16 posts `stages.craft`'s signatures. Requests `→ AGENT file:line`. Browser runs through `/home/claude/wt/bus/brun` (one at a time, cut at 10 min); `export NODE_PATH=/home/claude/.npm-global/lib/node_modules`; build your worktree (`node build.mjs`); test on YOUR dist/test.html. The supervisor's board: bus/SUPER16.md.

## At the hard stop (01:00 UTC)
Everything committed; it builds; your tests green or each failure explained; `git merge-tree --write-tree master s16-<you>` clean (rebase on master if needed); the final bus report ends with `NEXT:` and has: what you built (file:line), the real-touch results and the shots you looked at, the bundle delta, ⚑ lines in Hebrew with defaults.
