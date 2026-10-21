# משחק האוצר — the Temple match-3 (wave 6, MATCH3)

The owner's daughter's idea, adopted by the owner: before every building step (even quarrying) a Candy-Crush-style game of
at least three minutes whose level rises from game to game, with Temple things as pieces — and what you gather on the board
is literally the building material ("ממש את האבנים"). This is that game: the hook before each building step and the main
source of stones, cedar, gold, silver and bronze.

Status of every text in the game: **טיוטה** (draft), with a source. Nothing here is approved content (PROJECT.md §2).

## 1. The board and the pieces
- **8 columns × 9 rows**, phone portrait first; at 390 px wide a cell is 46 px (≥ 44). Shaped boards (holes) from level 9.
- **The six vessels** (drawn in code, `src/match3/art.js`; each has its own colour AND silhouette, colour-blind safe):

  | kind | piece | colour · silhouette | source (draft) |
  |---|---|---|---|
  | 0 | המנורה | gold · seven straight diagonal branches (REVIEW ⚑1), lamps lit | Exodus 25:31, 37 |
  | 1 | מזבח העולה | whitewashed · the red line, the horns, the fire | Middot 3:1, 3:4 |
  | 2 | פך השמן | glazed blue · the Kohen Gadol's gold seal on the mouth | Shabbat 21b (the blue is ⚑ illustration) |
  | 3 | לחם הפנים | baked brown · loaves with raised ends, the frankincense cup | Menachot 11:4–5; Lev. 24:5–8 |
  | 4 | רימון | crimson · round with a crown, a small golden bell beside it | Exodus 28:33–34 |
  | 5 | החצוצרות | silver · two long trumpets in a V | Numbers 10:2; Arachin 2:3 |

  Five kinds up to level 11 of the tutorial; the trumpets join as the sixth (level 11, then most levels from 22).
- **Dignity.** A holy vessel is never smashed, crushed or exploded. A match makes it glow and rise, in a stream of light, into
  the collection bar. Chips, dust and splinters come only from stone, earth and wood. Tools act only on stone, earth and wood;
  a vessel in a tool's path rises in light like a matched one.

## 2. The fields — "the quarry, the gold and the trees"
One engine; each field has its own blocker (1–3 layers), its own object, and its own material.

| field | blocker (a layer → material) | object (a steady stream) | extra |
|---|---|---|---|
| **המחצבה** quarry | bedrock → 1 stone | ashlar with drafted margins and a boss, gathered by a match beside it → 1 stone | `need.wstone`: whole field stones instead (below) |
| **יער הלבנון** forest | a standing cedar (1–3 tiers) → 1 cedar | cedar logs: bring them to the bottom, they float to the sea of Jaffa (Ezra 3:7) → 2 cedar | vines hold a vessel; a log may roll one row down for a move |
| **מכרה הזהב** gold ⚑ | copper ore → 1 bronze | loose nuggets, gathered beside a match → 1 gold | earth (1–2 layers) under the vessels; nuggets hidden under earth → 2 gold |

- **Silver shekels** ride on some vessels in every field (+1 silver). The coin shows the three pomegranates of the Jerusalem
  shekel, never a pagan image.
- **Whole stones** (BUILD's `wstone`, the altar): when `need.wstone > 0`, quarry levels become "בקעת בית כרם" and carry אבנים שלמות. They are gathered only
  by a match beside them — by hand; tools and wedges pass over them: no iron touches them (Middot 3:4, paraphrase).
- **⚑ The gold mine is an illustration.** No source tells of gold mines in the Land of Israel; the Temple's gold came from
  donations and kings' gifts (Middot 3:8; Ezra 8:25–26; Yoma 3:10 — CONTENT, SOURCES §4). The field is "מכרה הזהב · המחשה ⚑"
  in the HUD, the start card and the map. Alternative (fully sourced): "נדבות הזהב" with the golden vine's leaves and grapes.

## 3. Specials (earned in play only; never bought)
| made by | special | acts |
|---|---|---|
| 4 in a row | מקבת (a mason's hammer: the row) / אזמל (a chisel: the column) | a beam along the line |
| an L or a T | יתד (a wedge) | 3×3 |
| 5 in a row | אור המנורה (the light) | gathers every vessel of one kind |
| two specials swapped | a combo: tool+tool = a cross · tool+wedge = a 3-wide cross · wedge+wedge = 5×5 · light+tool / light+wedge = every vessel of that kind becomes that special · light+light = the whole board | |

The combo goes off where the player moved the piece. When no move is left the board is re-dealt ("מסדרים מחדש"); a board
always has a valid move (tested over many bot games).
**The builders' blessing** (Candy Crush's "sugar crush"): on a win every move left becomes a tool that sweeps a line, so
playing well gathers more material. The board ends at its goal (BUILD's ⚑ default); no move left is lost — beyond ten, several
tools fire per round.

## 4. Levels and difficulty
- **Tutorial 1–15** (the same ladder in each field's materials), one mechanic per level with a one-line Hebrew hint: match ·
  tool · wedge · double layers · the light · combos · silver · the field's own thing (3-layer bedrock / vines / copper ore) ·
  shaped boards · light+tool · six kinds · the first hard level · all together · deep layers · the field's exam.
- **16+ procedural** from `(field, level)` → a seed and a difficulty model: `difficulty(L)` rises monotonically (log curve
  to level ≈ 80); moves 31–38; blockers 5 → 10 cells and 1 → 3 layers; five → six kinds; eight board shapes; a **hard level
  every 7th** and a **breather after it**; never impossible (the calibration guarantees a win rate).
- **Calibration by a bot.** The layout is made by rule; the goal count and the star scores are set by a bot that plays the
  level's own board 20 times with different "hands" (skill 0.55 ≈ FUN's Maya, 15): the goal is the count reached in the target
  share of games (the quantile; a normal fit for the tail ≥ 90 %), the stars at the 35th / 75th percentile of the winning scores. Targets: 94–97 % for 1–10, 80–90 % for 11–15,
  80 % → 64 % for 16+ (by difficulty), 60 % for hard levels, 88 % for breathers.
- **Bot report** (`node test/match3-bot.mjs`, skill 0.55, 30 other hands per level, first try):

  | field | 1–10 | 11–15 | 16–30 | 31–45 | 46–60 | hard |
  |---|---|---|---|---|---|---|
  | quarry | 98 % | 93 % | 82 % | 72 % | 70 % | 74 % |
  | forest | 95 % | 86 % | 78 % | 75 % | 71 % | 55 % |
  | gold | 96 % | 91 % | 74 % | 82 % | 76 % | 65 % |

  Time at 6.5 s a move: 1–10 ≈ 2.7–2.8 min, 11–15 ≈ 3.0–3.2 min, 16+ ≈ 3.2–3.7 min (+ the start card and the blessing).
- **The owner's three-minute board** (wave 6, 21:10): the calibration also requires the typical player (Maya's hand) to need
  **≥ 26 moves** to reach the goal (≈ 2.8 min + the cards ≈ 3 min). Where a board ended sooner, its main goal and its moves grow
  together at the same win rate (≤ 40 moves). The quarry's levels 1–3 are exempt: FUN measured the first session on them
  (L1 ≈ 2:55 with its cards). A fast player still ends sooner — at the goal — and earns the blessing.
- **Mercy without money** (FUN): after two losses on a level, the next try starts with a wedge on the board.
- **Yields** (the level's goal is at the low end; playing well and the star bonus give more): quarry ≈ 30–60 stones · forest
  ≈ 15–45 cedar · gold ≈ 25–65 gold and some bronze · whole stones ≈ 20 · silver 1–5. `levelInfo(f, L).yields` gives the
  range. **The exchange rate (settled 21:03 with BUILD and FUN):** the counts stay literal; BUILD prices a Mount segment at 12
  stones and later segments at 40–60, so a tutorial board buys the rest of the first course and a later board ≈ 2 segments
  (loop-sim: Noam's first course 3:27, Maya's 5:22; week 1 = 5 of 15 stages).

## 5. The hooks inside the game
- **Stars** (score thresholds; the star meter fills in the HUD) and the **best** per level; a **star bonus** on the field's
  material: +15 / 30 / 50 %.
- **A near miss handled kindly:** "כמעט! עוד 3 אבנים!" — what was gathered is kept, and a retry is always free. No lives,
  no paid moves, no boosters for sale, no timers.
- **The level map** per field (a winding path, stars under each level, the hard ones ringed), with field tabs: choosing the
  field is choosing what to gather; the field the next step needs carries a dot.
- **"עוד שלב"** on the win card — first while the next step still lacks material.
- **Daily field bonus** (FUN's `m3Daily`): `ctx.daily = { field, mult }` multiplies the field's material on a win.
- **The vessel album:** gather 30 of a vessel (over all games) to open its card — a short draft text with its source
  — CONTENT's drafts from `content/vessels.json` (card_he, text_he, source), carried in ui.js because the host does not pass
  `ctx.vessels` (which still overrides by `piece`). The field map shows each field's fact and source from the same file.

## 6. Juice
Swaps (150 ms) and a bounce-back on a bad swap; falls with gravity and a small bounce; new pieces drop in from above;
cascades with praise ("יפה! · מצוין! · נפלא! · אדיר!") and rising pitch; vessels glow, grow and rise in a curved stream of light
with motes into the collection bar; materials fly to their chips (the counter bumps when they land); beams for tools, rings
for wedges, rays for the light; stone chips, dust, leaves and a splash where a log reaches the sea; the blessing; stars that
pop in. Sounds are FUN's (`m3start m3swap m3bad m3match m3cascade m3special m3blast m3rise m3land m3moves m3win m3stars
m3fail`), haptics through FUN's kit. `prefers-reduced-motion` trims particles, bounces and rises.
One 2D canvas over the overlay; sprites are painted once per size and blitted; a particle pool (no allocation per frame).

## 6b. The phone held sideways (land33)
The owner plays the whole game in landscape (844×390 on the phone; 915×412 and 1280×720 tablets). Sideways is decided by the
aspect — `innerWidth > innerHeight` (`isLand` in `ui.js`), never by a media query — and `fitBoard()` sets `.m3[data-land="1"]`;
`index.js` re-lays on `resize` and `orientationchange` (once at the event and once 180 ms later, when the browser has its new
size). Everything hangs on that attribute, so upright is untouched.
- **The board takes the whole height**, centred: the cell is `floor(height / rows)` — 9 rows → **43 px at 390 high** (390/9 is
  the ceiling; nothing can give 44 there without clipping), 45 at 412, 80 at 720 — the sprites are repainted at the new cell
  (`createArt(cell × dpr)`), so they stay crisp. Each side column keeps ≥ 120 px (`SIDE_MIN`).
- **A grid of three columns**, RTL: on the **right** (the start side) the exit button, the moves pill, the title and the hint /
  the need line / the gold way back; on the **left** the goal chips and the star meter. Both stacks are centred vertically.
- The cards shrink only when the screen is also short (`max-height: 560px`): two buttons side by side, smaller type; a tablet
  keeps the upright cards. The map card opens at its title (the path scrolls to the current level, the card does not).
- `node test/match3.cjs --land` — 844×390 (touch, mobile), 915×412, 1280×720 and 390×844 again: shots `test/out/m3-land-*.png`
  (`-card -board -cascade -exit -lost -won -map -album`, `m3-land-915-*`, `m3-land-1280-*`) and `m3-port-*.png`; it checks the
  cell, the board's height and centre, nothing over the board or off the screen, 44-px buttons, and the turn both ways.

## 7. API (`src/match3/index.js`)
```js
const r = await runLevel({ root, field, level, need, seed, demo, onEvent, sfx, haptic, save, map, daily, vessels });
// r = { won, stars, moves, collected:{stone, cedar, gold, silver, bronze[, wstone]}, score, ms, quit, field, level, attempts }
levelInfo(field, level) → { field, level, moves, colors, goals, yields, hint, hard, teach, minutes, stars, diff }
FIELDS · pickField({need}) · generate(field, level, seed) · levelSpec · difficulty
createBoard · resolve · findMatches · findRuns · hasMove · allMoves · isValidSwap · reshuffle · hint · botMove · playBot · finale
```
- Never throws; always resolves. Without a DOM: `{ quit: true, error }`.
- `field` defaults to the field of the largest `need`; `level` to the save's next level of that field.
- `save`: `{ get, set }` or a plain object. `G.m3 = { level:{quarry, forest, gold}, best:{'quarry:3':{stars, score}}, album:{menorah:n,…}, seen:{} }`.
- `demo: true` plays itself (goals × 0.45, fast) and resolves by itself in ≈ 15–40 s.
- Events: `m3open {field, level}` (the host may pause the 3D) · `m3start {field, level, attempt}` · `m3match {n, cascade}` ·
  `m3special {kind}` · `m3combo {kinds}` · `m3collect {res, n}` · `m3win {field, level, stars, score, moves}` ·
  `m3lose {field, level, near, left}` · `m3quit` · `m3close {result}`.
- Self-registers `globalThis.__BH_PARTS.match3 = { runLevel, levelInfo, FIELDS, pickField }`.

## 8. Files and tests
`src/match3/engine.js` (pure) · `levels.js` · `art.js` · `view.js` · `ui.js` · `index.js`.
- `node --test test/match3.test.mjs` — swaps, runs and L shapes, a move (gathered, never destroyed; the board refills),
  blockers per field, specials (4, L, 5), a tool's sweep (and the whole stone it never touches), logs to the sea, earth and
  nuggets, reshuffle, always a move, determinism, monotonic difficulty, the API without a DOM.
- `node test/match3-bot.mjs [--check] [--levels]` — the report above.
- `node test/match3.cjs` — the DOM harness (390×844, one browser): start, mid-cascade and won in each field, the map, the
  album, a near miss with a free retry, the exit, the demo; shots in `test/out/m3-*.png`. `--land`: the phone sideways (§6b).

## 9. ⚑ Decisions for the owner (defaults in brackets)
- Keep what was gathered on a loss or an exit [yes — "ממש את האבנים", no guilt].
- The gold mines are an illustration [labelled "המחשה ⚑"].
- The oil jug is glazed blue with a gold seal [blue, labelled המחשה on its card; CONTENT prefers plain clay — a one-line swap].
- The menorah's branches are drawn straight and diagonal [straight — CONTENT's REVIEW ⚑1 default].
- The silver shekel shows three pomegranates, not the Tyrian image [yes].
- The album opens a vessel's card after 30 of it are gathered [30].
