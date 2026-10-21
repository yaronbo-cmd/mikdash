# Phase A v6 — the building game (BUILD, wave 6) · DRAFT · final for v15 (27.9, 23:00 UTC)

The owner (27.9): Phase A must be *deep, long and precise*: "אני לא רוצה שהחלק הזה ייגמר מהר בכמה לחיצות, להיפך". The player is the
project manager, the developer and the engineer of a real building site. His daughter's idea, adopted: before every building
step a Candy-Crush-style match-3 of Temple things (≥ 3 minutes, harder each time) whose rewards are the materials themselves
("ממש את האבנים"), fields to quarry stone, cut cedar and mine gold, business with the kings of the nations, a meter of
everything always on screen, and the freedom to spend it on any stage. This document is how Phase A does all of that.
Code: `src/game/state.js` (rules, pure), `content.js` (tables), `index.js` (flow, guarded calls), `ui.js` + `ui.css.js` (HUD).

## 1. The loop in one paragraph
**The meter** (always on top, phone portrait, RTL): אבן · ארז · זהב · כסף · נחושת, plus אבנים שלמות once the altar opens. Tap a
chip: what you hold, what the next step needs, and where to get it (▶ play the field · the kings · the crews · the wage).
**Every stage is a project**: מדידה → חפירה ויסוד → נדבכים → גימור → בדיקה → חנוכה (its existing key moment). **Each step
costs materials** from the meter; the player picks any open stage. **The ONE prominent action** (`nextAction`) is always
something to do now: a key moment · a key stone for your hands · a site event · **the course check** (every two courses; the
crews wait for it) · the inspection · a stroke on the site ·
**"בנה"** (you hold the step's cost) · **"▶ המחצבה · עוד 11 אבן למקטע הבא"** (the match-3 level whose goal is exactly the
shortfall; a win pays the step at once and its stones go onto the site's pile). Never "blocked, wait" (FUN P0 1).

## 2. A project, step by step (state.js v6)
| phase | what the player does | paid with | who works |
|---|---|---|---|
| survey | 3 strokes: the hero measures the plan (PEOPLE `measure`); the Middot card is the blueprint | silver (the start) | hero, crews |
| dig | 4 strokes of the pick to bedrock (the Mount: its 12 rough boulders) | silver | hero, crews |
| courses | **segments** of 8 stones are bought; the first goes up by the player's quick crane lift, each other = 3 strokes (dress, dress, set; perfect = 2); a course check every two courses | the segment's stone / whole stones / bronze | hero, crews |
| key stones | the first stone, both corners of every course (the great stones at the Mount; its far corners are FUN's `quarry` game, cut from the bedrock), the lintels, the altar's course stones: FUN's `crane` / `dress` / `whole` | — | **only the player** |
| finish | named steps: cedar doors, the gallery, gold plating, the red line, the kevesh, Ben Katin's 12 spigots… | cedar / gold / bronze | hero, crews |
| inspection | FUN's `plumb`; a key stone set with quality < 0.45 is found and **reset: 3 strokes, time only** | — | the player |
| moment | the stage's existing key moment (moments.js), then the stage-done card | — | the player |

Events (deterministic, never a loss): a jammed crane rope (`pull` ×2) at 40 % of a stage, a cracked block (`split` ×2) at 75 %;
crews clear them 4× slower than the hero. Ta'anit 23a (rain only at night) is told at the first night; Nikanor's storm is KINGS'.
**Crews** (1 → 4, as before) set a stone every 3 game-minutes each, over real time and offline (≤ 12 h; nothing is lost), and
**wait** (PEOPLE: sit, drink) at a key stone, an unpaid step or the inspection — the player's hands are what they wait for. A
crew in **the quarry** cuts ≈ 2 stone an hour (two crews at most: ≈ 2 segments a night). **Upgrades** (silver): the tools (a stroke is worth +25 %/level), the great crane
(crews +25 %/level), the quarry carts (+50 %/level). Shabbat and Yom Tov: the site rests, nothing is lost, the streak never breaks.

## 3. Numbers (content.js `PROJ`; tuned by test/game-sim.mjs)
| stage | courses × stones | segments (cost each) | finish steps | key stones |
|---|---|---|---|---|
| har | 6 × 32 = 192 | 24 × **12** stone (the tutorial stage) | paving | 12 (great stones, corners) |
| wall | 8 × 32 = 256 | 32 × 45 stone | cornice, chamber beams | 16 |
| gates · nashim · lishka · nikanor | 6 × 24 = 144 each | 18 × 45 stone | cedar doors + gold plating · the gallery · cedar roofs · Nikanor's two bronze doors + the 15 steps | 12 each |
| sorag | 3 × 32 = 96 | 12 × 45 stone | the lattice | 6 |
| yesod · sovev · guf · karnot | 64 · 64 · 128 · 16 | 8 · 8 · 16 · 2 × 40 whole stones | — · the red line · the kevesh · whitewash | 2 · 2 · 4 · 1 |
| kiyor | 12 pours | 3 × 80 bronze | Ben Katin's 12 spigots | 1 |
| ulam · heichal · kodesh | 400 · 560 · 320 | 50 · 70 · 40 × 60 stone | beams, gates, the golden vine, plating · cedar roof, doors, gold, the crow-spikes · roof, gold | 20 · 28 · 20 |
| **total** | **2,684 stones** (the House: 48 %) | **337** | **30** | **160** |

Key stones: each stage's first stone, **both corners of every course** (the cornerstone that starts it and the far corner),
the lintels, the altar's course stones. A segment's first stone goes up by the player's **quick crane lift** (FUN, ≈ 5 s); the
other seven by strokes. **The engineer's course check** (FUN's plumb, 3 rounds, ≈ 7 s) comes every two courses as the ONE
action ("בדיקת הנדבכים"): a job of its own since 0b07de7 (the nine-branch flow run found that a board could slip in before
it); the crews wait for it; the last courses are covered by the stage's inspection.
**The exchange rate (with MATCH3):** MATCH3's yields are literal and rise with the level (a quarry board pays ≈ 30–45 stone at
levels 1–15, the stars add ≤ 50 %); a segment costs 40–60 from the wall on → **one board ≈ two segments over the week**
(loop-sim: 2.2), three stars a surplus. **The Mount is the tutorial stage: its segment costs 12** (agreed with FUN 20:48 and
MATCH3 20:50), so the mentor's 40 stones buy its first three segments and one tutorial board the rest of the first course.
≈ 370 material steps → ≈ 150–200 boards for the whole Temple.
**The first session (FUN's P0 of 11:53, loop-sim on the merge build+fun+match3+kings, 79e6a9e):** the first stone by hand 0:35
(נועם) / 0:43 (מאיה); the first course **3:27 / 5:22** (≤ 6:00 ✓); novelties by minute 10: **12 / 11** (≥ 6 ✓); the boards'
share of the first session **35 % / 57 %** (≤ 55 %: Noam ✓, Maya 2 points over — her 6.5-s move on the owner's ≥ 3-minute
board; ⚑ below). The lever if the owner wants less: MATCH3's quarry levels 1–2 at ×2 → Maya 39 % (measured, not applied).
**The simulator** (test/game-sim.mjs, the real rules, MATCH3's yields, FUN's orders): the regular player (3 × 10 min a day)
finishes in **24 days with 152 boards** (the House from day 13 to day 24), the heavy player (2 h a day) in 6.5 days, the light
one (10 min a day) in 65.5 days; the first session sets the Mount's first course. Time: ≈ 70 % on the boards, ≈ 22 % building by
hand (≈ 5,700 strokes, 340 quick lifts, 160 key stones, course checks), the rest managing. Ending a board at its goal (≈ 2–2.5
min for a good player, FUN's ⚑) brings it to ≈ 62 / 29. No hard walls, never money.

## 4. Where materials come from
1. **The pre-step level** (MATCH3 `runLevel`): field by the shortfall — stone and whole stones → the quarry (whole stones in
   "בקעת בית כרם"), cedar → the Lebanon forest, gold and bronze → the gold mines (an illustration, ⚑). Everything gathered is
   kept, also on a loss or an exit; a step made affordable is paid at once.
2. **Crews and stations** over real time: the quarry crews (≈ 2 stone/h each, two at most), the site crews (they set the stock).
3. **The kings** (KINGS `openCourt`, `settle`): cedar from Tyre, bronze from Cyprus, the Nikanor doors, gifts of gold. **Beside a
   board for cedar / gold / bronze the pill has a second chip, the king's offer that brings it now** (KINGS' `bestFor`: "⚓ צור
   וצידון: 60 ארז ב־5 כסף"; a tap opens that contract) — silver's sink (FUN's loop-sim: ≈ 1,500 silver idle after week 1).
4. **The day**: the wage (silver, gold on streak days), FUN's orders and finds, stage and chapter rewards.

## 5. The screens
The meter (top) · the pill = the one action (gold when it is "▶ play"; under it the king's offer when one brings the shortage) · **the site panel**: the phase stepper, course N of M with
the course's stones as cells (set / in stock / key), stones set, the stock, the next step and its cost with **בנה** or **▶ field**,
buy-ahead of the next segment, the finish list, crews ± (and why they wait), the blueprint (the stage's Middot card) · **the
project board** (dock "הפרויקט": every open site, its phase and %) · the kings' door (dock "מלכים", badge = ships in port) ·
the precision games' prompts (a card when FUN's game is missing) · "היום": FUN's orders, daily and album above the wage and vine.
All targets ≥ 44 px, Hebrew RTL, AA contrast.

## 6. The calls (all guarded — has()/call()/settle(); each has a fallback; the flow never waits on a missing part)
- **Wiring (main.js `// ── build6 ──`):** `import * as match3 / kings / minigames` → `createGame({ parts: gameParts(), … })` (a part
  is handed over only if its entry point exists) + `hooks.pauseWorld` (holds the 3D loop only while a full-screen board or court
  is open; FUN's games are bottom sheets over the live site; the tests' own pause is kept). FUN's loop hooks come through
  game/hooks (its self-registration, `__BH_PARTS.fun`). **build.mjs `optional-parts`:** on a lone branch an absent part resolves
  to an empty module (logged: "optional part absent, stubbed"), so every branch builds; on the merge the real modules are
  bundled. `game._.parts()` tells which parts a build runs with. `globalThis.__BH_PARTS` still works as a registry.
- **MATCH3** `runLevel({root, field, need, demo, sfx, haptic, map:false, save:{get,set}, onEvent, daily?, place?})` → the meter;
  fallback: a card that grants the need (+20 %). The 3D pauses between open and close (`hooks.pauseWorld` or `world.pauseRender`).
- **KINGS** `openCourt({root, G, now, apply, onEvent, demo, sfx, needs, rest, arrivals?})`; `settle(G, now)` at load and every
  5 s → a toast; `status().badge` on the dock. Fallback: a card about the kings (Ezra 3:7, Yoma 3:10).
- **FUN** `runMinigame('crane'|'dress'|'quarry'|'whole'|'plumb', {root, world, site, slot, level, seed, demo, onEvent, sfx, haptic, reduced})`
  → the stone's quality; fallback: a card, quality 0.8. `fun.onEvent(G, name, data, now)` → beats (toasts); the orders sheet.
- **SITE** `siteInfo`, `setWork(id, {phase, stones, stock, ghost, finish})` on every visible change, `liftStone(id, {great})`
  for each stone set while the site is in focus (≤ 1 in flight), `nextSlot` for a key stone's game, `workSpot` to walk the
  hero; fallback: `setStage(id, 'building', fraction)`.
- **PEOPLE** `hero.act(kind, target, {quality})` per stroke (`measure`, `pick`, `dress`, `tamp`, `split`, `pull`), `workpiece(
  'rough'|'drafted'|'dressed')`, `setCrews(id, n, ids, {waiting})`; fallback `swing()`.
- **WATER** at the end of the kiyor's key moment **`world.water.kiyor({ spigots: 12, flow: 1 })`** (`firstFlow()` only if kiyor is
  missing), and in the #demo reel when it passes the kiyor; `channel(true)` once the altar is whole.
- **Audio (FUN):** the sound at contact is bound by FUN's first precision game (`bindHero`, `bindWater`, the site's day bed);
  if FUN exports `bindSound`, BUILD binds it at start so the survey's first taps sound at contact too.

## 7. Save and migration
Save v6 (`bh_beta2`; `bh_demo` for #demo): per site `{p, n, dp, paid, set, k, fp, fd, keys, ev, bad, insp, ready, m}` +
`G.up`, `G.focus`, and the slots `G.fun`, `G.m3`, `G.kings` (kept, never read by BUILD). v5 → v6 keeps every finished stage,
turns a site's progress into stones set (its key stones below count as set well), credits the caravans in flight; v ≤ 4
migrates through v5. Old readers (FUN's v5 hooks) still see `w` and `ph` on a site. **Tested on a real v14 save**
(test/fixtures/save-v14-bh_beta2.json, written by master c4e8113's own rules mid-game: the Mount and the wall done, the gates at
20 work units, a caravan at sea, three crews, a 5-day streak): it loads in v6 with every finished stage, the gates' work as
stones set, the materials, the caravan credited, the crews, the streak and the vine, and a next action waiting.

## 8. Answers to FUN's P0s (bus/FUN.md 08:25 + 11:40)
1. **Never blocked:** `nextAction` returns a play of exactly the shortfall whenever a step is unaffordable. ✓
2. **A stone is a stone:** 3 strokes set one stone group (the crane lifts it), a course is a toast with its number. ✓
3. **Every resource has a sink:** the meter marks what the next step needs (gold outline / red when short); the wage is silver
   only; the boulders give no stone; the level's goal is the shortfall. ✓
4. **Contact and response:** a tap during a stroke is queued (the latest wins); a tap on a site with no stock floats why and
   opens its panel. ✓ (PEOPLE's contact frame: `act` resolves at contact.)
5. **The first stone vs. the level:** the mentor's gift pays the Mount's first three segments; the first stone by hand ≈ 0:40;
   the first level at ≈ 1:50–2:00, as the way to the rest of the course. ✓
6. **The first session is not a toll (11:53):** the Mount's segment = 12 → the first course by 3:27 / 5:22, 11–12 novelties by
   minute 10, the boards' share 35 % / 57 %. ✓ (Maya's 57 %: ⚑.)

## 9. ⚑ for the owner (defaults in brackets)
- The match-3 is the main path, not a toll: a step's materials may also come from crews, kings or the day [yes].
- The mentor's gift: the Mount's first segments are free, so the first stone comes in < 60 s [yes].
- The Mount is the tutorial stage: its segment costs 12 stone (from the wall on 40–60), so the first course is done in 3.5–5.5
  minutes [yes].
- A slower player (6.5 s a move) spends ≈ 57 % of the first session on boards (target ≤ 55 %), because a board lasts ≥ 3
  minutes; the lever is double yields on the quarry's first two levels [keep as is].
- Shabbat and Yom Tov: the site and the crews rest (Yevamot 6a); the match-3 and the book stay open [yes].
- The altar's whole stones are gathered in a quarry level labelled "בקעת בית כרם" (Middot 3:4) [yes].
- A key stone set badly is found at the course check or the inspection and reset: time only, never material [yes].
- The daily wage is silver (and gold on streak days) — stone only from the quarry [yes].
- 3 strokes per stone group; a segment of 8 groups; a board buys ≈ 2 segments [yes; tune after the owner's playtest].
- A board ends at its goal; the moves left become more material [yes].
- The investor's #demo: the new loop in seven beats, then the key moments to Chanukat HaBayit (≈ 10–15 min with the presenter) [yes].

## 10. Tests (run them on the branch; game-flow on the nine-branch merge)
| suite | what | result (27.9) |
|---|---|---|
| `node --test test/game-state.test.mjs` | the rules, the content, the migrations (incl. the real v14 save) | 24/24 |
| `node test/game-sim.mjs` | the economy: regular 24 days / 152 boards, heavy 6.5, light 65.5 | in range |
| `node test/game-harness.cjs` | the HUD and the flow against a fake world and fake parts (the parts' contracts), incl. the kings' chip | 78/78 |
| `node test/game-flow.cjs` | **the whole flow on the real build with the real parts** (FTUE → the first stone → a board → a segment → a key stone → the course check → a king's deal → the inspection → the Mount's key moment → the v6 save) | **12/12 on the nine-branch merge** (22:22; all nine heads, 2,401,541 B) |
| `node test/game-e2e.cjs` | the first session in the real 3D build (phone demo, desktop) | see the report |
| `node test/moments.cjs --harness` | the key moments | 94/94 |
| FUN's `test/playtest/loop-sim.mjs` (on a merge) | the teen playtest of the economy | numbers in §3 |
| `node --test test/hooks*.test.mjs` | FUN's hooks | merge: 40 pass, 9 skipped (FUN retired the v5 caravan cases, 5f1655c); on s6-build alone those 9 fail by design |
| `node --test test/*.test.mjs` on the nine-branch merge | everyone's unit tests | 168 pass, 0 fail, 9 skipped |
| `node test/qa-content-scan.cjs` | the content rules (no Divine Name, drafts) | 11/11 |

## 11. Wave 7 (BUILD7, 28.9 · DRAFT) — the first ten minutes (PLAYTEST-S6 §5) and the owner's defaults ⚑1–⚑3
**The opening** (index.js `runOpening`, ui.js `cinema`, main.js `// ── build7 ──`). A new game — also the menu's new game and a
fresh #demo — keeps the boot's finished House for its first frame: `start()` defers `syncWorld` to the opening's swap. WORLD7's
`world.vision({ ms: 6500, restore, to })` plays the shot (`BEAUTY.vision`, the golden hour: a slow push-in over the Old City, a
warm veil at 46 %, the same view with the bare Mount, the flight down); without it main.js's fallback does the same from
`BEAUTY.vision || BEAUTY.templeFromOlives`. `restore()` runs exactly once (natural end or skip): the stages, the Mount's site
and boulders, the hero at boulder 4, the real-clock light, the plan in gold (`showPlan`) and the title "כאן ייבנה הבית." in the
sky; it also sets `to` in place on the hero, so the flight lands 60 amot from him (×1.35 portrait: ≈ 100 px tall on 390×844,
FUN7's "איפה אני?"). The HUD steps aside, the title "בית המקדש השני" sits in the sky over the House, and a tap anywhere skips
(`.gm-cine` → `visionSkip()`). `G.op = 1` once played: a reload never replays it. Taps, the pill and `game.busy` wait under it.
**The pill and the text.** A board is framed by what it pays: "▶ המחצבה · שיטוח ההר · כ־45 אבנים" (content.js `M3_PAY`, the
midpoint of MATCH3's `levelInfo(field, level).yields` for levels 1–30, precomputed because its calibration costs 0.2–1.3 s a
level; `test/game-state.test.mjs` checks it against the live levelInfo). `countTxt(k, n)` says counts as Hebrew does ("אבן
אחת", "8 אבנים", "+40 אבנים", "12 אבנים שלמות") in the pill, the sheets and the toasts; the work line reads "נדבך 1 מתוך 6 ·
אבן 7 מתוך 32". **Toasts** come one at a time, ≥ 1.5 s apart, and wait while a precision game, a board, a key moment or the
opening is up (FUN7 P0). **The crew chip** is FUN's strip; state.js `crewEta(G, id, now)` gives it "הצוות מניח אבן בעוד 3:03".
**"לחומה"**: after the tutorial, while the Mount is built and the wall not started, stone held beyond four of the Mount's
segments is tagged on the meter (`stockPlan`), and its sheet says the Mount's segment costs 12 and the wall's 45.
**Boards and crews (⚑1).** The board's material reaches the meter as it is gathered (MATCH3's `m3collect`); the segment it was
played for is paid the moment it is covered, so the crews set its stones while the board is open; what was credited live is
taken off `collected` at the close (nothing twice). On close: "בזמן שחצבת: הצוותים הניחו N אבנים" and "N אבנים הגיעו לאתר".
**A 3★ board pays a third segment** (`starBonus` inside `grantLevel`, so both simulators see it): one more segment's material
for the site it was played for, in that site's own material (a forest board never pays stone); the flow then pays up to three
segments. The hero stands proud at a key moment's end (PEOPLE7's `hero.gesture('proud')`, guarded). While a board holds the 3D
loop, the crews' stones are placed, not lifted (a lift needs frames).
**A bronze need leads with the king (FUN7 P0 06:12).** The gold field has little ore, so a bronze step (Nikanor's doors, the
kiyor's segments) was a gold farm (loop-sim: ≈ 1,000 gold idle after week 1). `S.nextAction(G, { deal })` returns `{ kind:
'deal', res: 'bronze', need, partner, offer, who, n, cost, play }` when the host's resolver finds an offer (KINGS' `bestFor`;
the game's resolver: after the tutorial, and only while no ship is at sea); without a resolver nothing changes. The pill: "⚓
ניקנור · 150 נחושת ב־20 כסף" opens that contract; the second chip is the board ("▶ מכרות הזהב").
**Numbers.** game-sim: the regular player finishes in 23 days with 138 boards (was 24 / 152), heavy 6.1, light 66.5 (the
`--check` floor moved 150 → 125 boards). FUN's loop-sim on s7-build: the first course at 3:18 (נועם) / 5:12 (מאיה) — ≤ 6:00 ✓;
the boards' share of the first session 35 % / **57 %** (Maya's first-session boards are ★1 at the Mount's 12-stone segment, so
the third segment cannot move it; the crews' live stones are not modelled there). Week 1: 58 % / 71 %.
**Tests (28.9):** game-state 30/30 · game-harness 87/87 (+9: the opening ×6, the toasts, the live board, the deal) · moments 94/94 ·
game-sim pacing OK · game-e2e checks the opening's first frame (the finished House, no boulders) and the skip (phone
33/33 at 06:54; on the loaded machine some runs go red on wall-clock checks — master's own did too) · **game-flow 12/12 on the
four-branch merge** (s7-build + s7-world + s7-people + s7-fun, 06:39: the opening, the FTUE, a board, a segment, a key stone,
the course check, a king's deal, the inspection and the Mount's moment, the save, no console errors) · qa-content-scan 12/12 ·
node --test test/*.test.mjs 177 pass / 0 fail / 9 skipped. Bundle 2,413,960 B = master + 11.3 K (gzip + 4.1 K).

## 12. Wave 9 (FLOW9, 28.9 · DRAFT) — the words match the games; the boulder field; the corner stone arrives
**One verb per game** (content.js `keyWords(key, first)`, DESIGN8B 11:03: the owner read a word that did not match its game as
"broken"). The crane SETS ("הנח … במנוף"), the quarry HEWS ("חצוב"), the dressing DRESSES ("סתת", "…והמנוף יניח אותה"), the
altar's game SORTS the whole stones ("בחר אבנים שלמות", DESIGN9 15:44); never "הנח" for a stone the player hews. It feeds the pill ("האבן הגדולה: הנח אותה במנוף" ·
"אבן הפינה: חצוב אותה"), the segment's one line, the site panel's button ("חצוב את אבן הפינה"), the one-time tell
("אבן הפינה: אתה חוצב אותה"), the toasts and the fallback card, and the precision game's kicker (`ctx.kicker` "חציבת אבן
הפינה" / "סיתות אבן הפינה"; the games read it). The Mount's first stone: the coach at the pill says "את האבן הראשונה, האבן
הגדולה, תניח אתה במנוף" (the crane game "האבן הגדולה" opens).
**The corner stone arrives (STAGING M11).** After a quarry key stone: "אבן הפינה נחצבה · העגלה מביאה אותה, והמנוף יניח אותה" →
SITE9's `world.deliverKeyStone(id, {what})` (guarded, settle 45 s; the world holds the shot — the cart's lane, the pile, the
crane — and the game's camera waits until it resolves + 1 s, DESIGN9 16:27) → "אבן הפינה: במקומה". Meanwhile the pill holds "אבן הפינה בדרך לאתר" and the site's redraw waits for the landing (the lift lock), so the
stone is seen arriving, not popping in. Without the call: the toast and v17's lift.
**The boulder field (DESIGN8B §4).** `world.boulderSpots()` → 12 × [x, z, r] in `G.bh`'s index order + `.order` (the strike
path) is read at `syncWorld` into `BOULDER_XZ` index by index (saves unchanged). The pointer, the camera, a tap beside a rock
and the resume (`S.pickBoulder(bh, skip, order)`) walk the path, a cracked rock first; with no `.order`, the nearest-neighbour
path from the first rock (on DESIGN8B's zigzag: 4, 5, …, 11, 0, 1, 2, 3). An older world: v17's nearest-to-the-builder.
**The pointer at every strike.** A split marks the next rock while the hero is still mid-stroke, so the camera could not frame
it and `.gm-mark` stayed hidden until the next tap (game-touch 11/12). Now the stroke's end frames the marked rock (M5: "framed
before he walks"). In the courses the pointer sits ON the block on the builder's banker (SITE's `workSpot('har','dress').stone`,
the `mark` event still `at:'har'`), and a safety net keeps the marked target in view: hidden ≥ 1.2 s while the builder is idle
→ one re-aim (a rock: its close camera; the stones: the world's `focus('har')`, SITE9's bay), then 4 s before another.
After the rocks (M6 → M7) one `focus('har')` frames the walls.
**The board takes touch** (QA9 16:31 P0): MATCH3 mounts `.m3` inside the HUD, whose `pointer-events:none` it inherited, so the
board was dead to a finger in the real game (it only ever played in demo or by `__M3_AUTO`); ui.css.js `.gm .m3{pointer-events:auto}`.
**Tests (28.9, s9-flow):** game-harness 105/105 (+8) · game-touch 17/17 alone and 19/19 on a merge with s9-site (was 11/12) ·
game-e2e phone 34/34 (was 20/31: `.gm-mark` is the pointer, the greeting is a third card) · game-flow 12/12 · moments --harness
94/94 · node --test 186 pass / 0 fail / 9 skipped. Bundle 2,587,772 B = v17 + 4.5 K (gzip + 1.8 K).
