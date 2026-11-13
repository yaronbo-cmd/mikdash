# Builds 115 and 116: stage 01 on an exact address grid

Coding brief. The owner approved the spec on 2026-11-10 ("שלב 01: רשת נ.צ ואפיון"). This file is the instruction for the
coder; the reviewer checks the build against it, as a player, before anything is handed over.

## Why

The owner's main demand: "build in reverse". Take OUR world and give every minigame a real physical place in it. Until 114 the
rock works (clearing rocks, reading the rock, paving, waste) happen in the low north-east valley (BOULDERS, ground about −45),
which the fill buries, while the engine cuts the real crest by itself (stages.js `harCut`, `uCrest`). The player never touches
the rock that really comes down, and from the tenth work on the scene is flat sand with no hill.

His second demand: every rock, stone and slab has a fixed exact address. Nothing "general", nothing drawn at random at runtime.

## Rules that must hold (he repeats these angrily when they break)

- NO GRID IN THE GAME. No grid lines, no cell names, not in the overview, not in any camera. The grid is internal data. It will
  be shown later only on the management-phase map.
- Touch the world itself. No side buttons for work. One short instruction line (up to five Hebrew words where possible).
- No time pressure. A miss costs nothing and never ends a minigame. Only real damage costs points (existing `X.loss`).
- The old scoring stays as it is (10/20/40, streak, job end 50/100/200). No new point values.
- Every aiming task shows its target in the world, in green. Every miss says, in the world, what to do next.
- Nothing the player must touch may be off screen or hidden by the world, a figure or a rock.
- Figures never stand inside rock or walls. Crew figures hold a tool and work.
- Effects of every action stay (sparks, dust, flash, flying number).
- No model names, no session ids in code or commits. Never a Divine Name in any text.
- Hebrew texts: short, plain, no dashes used as punctuation.
- Keep stages 02 to 04 working (they run on the same director).

## World facts (amot, +x east, +z south, platform level 0)

- `mount.js` PLAT: x −300..277, z −480..400 (the retaining walls). SQUARE (Middot 2:1): x −223..277, z −183.5..316.5.
- Hill (`stages.js` hillBump/hillY0): crest near x −140, z −20, up to about +38. East and south fall to about −49.
- Future Azarah x −187..0, z ±67.5. Nothing of stage 01 depends on it.
- The har body rises by courses with the stage's progress (`setStage('har','building',p)`); `groundAt` = max(hill, shown har top).

## The grid and the address book (new, pure, tested)

New module `src/game/world/grid.js` (no three.js, no DOM):

- Cell 25 × 25 amot. Column index `k = floor((277 − x) / 25)` (0 at the east wall, growing west). Row index
  `r = floor((z + 183.5) / 25)` (0 at the square's north edge, growing south). The square is k 0..19, r 0..19.
- Names: column as a Hebrew numeral of k+1 (א, ב … י, יא … טו, טז … כ, כא …), row as r+1 inside the square; south of the square
  ד1.. (r 20 → ד1); north of it צ1.. (r −1 → צ1). Name form `יב־7`. Functions: `cellOf(x,z)`, `rectOf(k,r)`, `nameOf(k,r)`,
  `parse(name)`, `addr(x,z)` → `{ cell, west, south }` rounded to half an amah.
- `buildBook(heightAt)` → the stage-01 address book, a frozen plain object, deterministic (seeded by cell indices only):
  - `rockCells`: every cell inside the square whose rock stands at least 3 amot over level 0 (sample the cell's centre and four
    points 8 amot from it; expected count with the present hill: 113; a test pins the count).
  - `kohen`: the nine cells the player must do, in this order (s = 0..8):
    יב־6, יב־7, יב־8, יג־6, יג־7, יג־8, יד־6, יד־7, יד־8 (k 11..13, r 5..7). East column first: the rock is cut from its low
    edge inward.
  - per rock cell: `big` `{ x, z, r }` (one big rock to split, r 7.4..9, within 4 amot of the cell's centre) and `small[]`
    (five in a kohen cell, two to four in the others) each `{ x, z, r, stand }`. Reuse the placement logic of
    `acts.js sectorRocks` but make it a pure function of the cell (all small rocks and their stands inside their own cell).
  - `pits`: three pit addresses for the three waste works, in cells י־7, י־6, י־8 (k 9, r 6 / 5 / 7), each a rectangle about
    12 × 10 amot at the cell's centre.
  - `yard`: the stone yard in cell ג־ד1 (k 2, r 20).
  - `corner`: the REAL south-east corner of the retaining wall (PLAT.X1, PLAT.Z1), see "Corner stone" below.
  - `courses`: two stretches of the east wall just north of the corner (cells א־ד3 and א־ד2).
  - `great`: track from cell יט־6 on the rock down to the west wall at cell כג־6 (used in build 116; in 115 the great stone
    keeps its present place and game).
  - `letters`: unchanged place (south-west corner top).
- `test/grid.test.mjs`: names round-trip, cell maths at the square's edges, book determinism (two builds deep-equal), the count of
  rock cells, every object inside its cell, no two rocks overlapping, every stand outside every rock.

`model.js` PLACES gets its numbers from the book (the stale `rope` numbers go). Mission ids stay (`rocks0`..`pave8`, …) so saves,
tests and hooks keep working; sector s is the book's `kohen[s]`.

## The hill in cells (stages.js)

- A "cell mode" for the Mount, switched on by the stage-01 director (`S0.cells.enable(book)`), off by default so older flows are
  untouched.
- In cell mode the crest is NOT swept by progress (`uCrest` stays uncut) and the old boulder field is retired: no BOULDERS
  meshes, no old rubble cubes, no old stepped patch props, no `uPatch`. (This is the "old-version block inside the split rock"
  the owner saw.)
- Per-vertex attribute on the hill mesh (for example `aCell`): 1000 = natural, otherwise the height the vertex is cut to. The
  shader takes `min(natural, aCell)`; the CPU mirror `hv()` does the same so `heightAt`/`groundAt` agree with what is drawn.
  Add mesh lines at the cell edges of the rock region so a cut cell ends in a near-vertical rock face, not a 6-amot ramp. Fresh
  rock colour on cut faces and floors (`uCutCol`).
- API: `S0.cells.set(k, r, state, { instant })` with states `rock` (natural) → `cut` (floor +0.35, bare rock floor) → `paved`
  (floor at level with paving on it). `cut` animates: the cell comes down in benches over about 6 s with dust (instant on load).
  `S0.cells.get(k, r)`, `S0.cells.all()`. Bushes and loose slabs inside a cell that is being worked or is cut are removed.
- Pits: `S0.cells.pit(i, fill01)`: a hollow about 5 amot deep at the pit's rectangle, its rubble surface rising with `fill01`;
  at 1 it is flush with the ground around and looks like raked earth.
- The crews' cells: all rock cells that are not the kohen's are cut by the crews as the stage's progress grows, east columns
  first, so that when the stage is finished every rock cell is cut and paved. In rows 6..8 the crews never cut a cell west of
  the kohen's block before the kohen's cell in that row (יד־r) is read. Working crew gangs (picks) stand at the two or three
  crew cells being cut now. A crew cell is paved (one flat paving mesh per cell is enough) some time after it is cut.
- The engine's own plaza paving and fill (`uPave`, `uFill`) keep working east of the rock.
- Save: the cell states are derived from the model's save (done works + progress), not stored twice. A reload shows the same
  world.

## The works on their addresses

General: `SH.bould` comes from the book (`kohen[s].big`), the big standing rocks are the director's own meshes (rock.js), at
their addresses, embedded in the slope. The acts were written for flat ground at −45; on the rock the ground slopes up to about
22 degrees. Check every act on its real ground: stands, props, camera shots, drag planes.

Opening rule (model `canDo`): `rocks s` needs the rope and, unless the cell is in the east column, the cell to its east read
(`read (s−3)`). `read s` needs `rocks s`; `pave s` needs `read s`. Level by count of its kind, as today.

1. Rope: unchanged (it already runs on SQUARE).
2. Clearing rocks: unchanged game, rocks from the book.
3. Reading the rock:
   - The crack is drawn ON the rock's surface, thick and clearly visible, never past the rock's outline, different on every
     rock (seeded by the cell). The split follows it. Water runs light blue inside it.
   - The kohen stands beside the rock, never inside it (he was sunk into it at level 3).
   - After the split: two clean halves, nothing else inside. They stay where they fell. The stonecutters then dress them into
     building stones, stone after stone (the half visibly shrinks), a sledge takes the stones toward the yard, the "building
     stones" count rises. Chips stay as that cell's waste pile. Then `cells.set(cut)`: the cell comes down in benches to the
     floor. All of this plays in the act's end and pull-back (about 8 to 10 s in total) and is already done on a reload.
4. Paving: only on a cut cell, on its floor. Before the puzzle starts assert that every slab of the pile and every square of
   the patch projects inside the screen and is not hidden; if not, move the camera. (He was blocked by a puzzle under a
   rock.) Paved quarter stays exactly as laid. After the kohen's patch the crews finish the cell and it becomes `paved`.
   The kohen figure is hidden during this act.
5. Waste: the pile is where the last cut kohen cell's chips are (by the east edge of the kohen's block). The sledge with the
   oxen stays. New push: the player HOLDS the sledge and DRAGS it along the marked track down the slope to the pit of this
   work; it follows the finger with weight; releasing anywhere stops it, it waits, nothing is tipped. Dragging too fast on
   the slope rocks it and stones fall off (they stay on the track, not counted, no penalty). At the pit's edge a green line:
   on it, a drag upward tips the sledge into the pit. Tipping before the line drops the load beside the pit and the two
   rakers drag it in slowly (fewer points). The two helpers hold RAKES and visibly rake the tipped rubble flat. The pit's
   level rises with every load and is full, covered and flat when the pile is gone. Stars come from loading, the way and
   the tip together; the end message always agrees with the stars. The kohen leads the oxen by a rope.
6. Corner stone:
   - Place: until 114 it stood at the measured square's corner, where no wall corner exists. It moves to the real
     south-east corner of the retaining wall, the lowest ground of the Mount, at the bottom of the foundation trench (the
     wall's lowest course, `siteInfo('har').y0`). It must read as a corner: the trench of both walls is seen.
   - Meaning: the opening shot travels down the corner's line from platform level to the trench's bottom; line "האבן הנמוכה
     ביותר" then "כל הפינה תעמוד עליה". After a good landing two crewmen try to move it with levers and it does not move; word
     "לא זזה". The stone keeps a gold mark; it is seen at the wall's foot in later wall works and in the stage's end film
     (the film's shot rises from it up the wall).
   - Fixes: the first shot shows the stone, the crane and the landing place together; a green rectangle on the foundation marks
     the place and fills green when the stone hangs over it; the stone's shadow is seen; after a miss a green arrow on the
     ground shows which way to move; after a broken stone the camera returns to the first shot with a new stone on the rope.
   - (Full physical rotation with a guide rope comes in build 116.)
7. Course: the two stretches of the east wall right beside the corner stone, so the stone he set is the neighbour. Green
   marker in the gap; green arrow after a miss. The stones come from the yard. The kohen figure is hidden.
8. Great stone: untouched in 115 (replaced in 116).
9. Letters: unchanged; a short victory trumpet blast is added at the end of the stage.

Update the stage's end film (`PACK01.film`) to the new places.

## Camera

- Right-thumb look-around during an act: a DRAG that starts on the right half of the screen where the act does not want the
  touch orbits the camera round the work point (yaw with dx, pitch with dy down to about 8 degrees over the horizon, pulling
  back as it flattens) so the horizon, the city and the Mount are seen; a beam of light marks the work place. Mouse: a drag
  with the right button, anywhere. The act is paused while the camera is away. On release the camera stays; the next touch
  that is not a look brings it back to the act's shot (about 0.45 s), the act goes on, and that touch is not passed to the act.
  A touch on the right that does not move is passed to the act as a tap (tap-anywhere acts keep working). Add an optional
  `act.wants(p)`; without it, right-half touches are look candidates only for acts of stage 01 after you have given each of
  them a `wants`. Stages 02 to 04: mouse right button only, for now.
- The zoom-out overview stays as it is. No grid.
- Going to a far work (compass, test hook) is one continuous flight of the camera over the world, never a cut.

## The figure

The kohen is seen only when his own hands do the action: rope, clearing rocks, reading the rock, waste (leading the oxen),
corner (holding the guide rope), letters. He is hidden in paving and course. The yellow arrow over his head shows only while
he walks between places, never during an act.

## Full-screen perfect feedback

When an act ends perfect (every graded step gold, no miss, no retry, no loss; each act reports `perfect: true`), the
director plays a screen-filling celebration before the pull-back: a gold flash over the whole screen, rays from the work
point, the word "מושלם!" very large with three stars and the act's title under it, the three-star points flying to the
counter, fanfare, haptic, the crews around cheering, about 2 s, the world visible behind the gold. The small per-step "בול"
stays. Works for every pack (stages 02 to 04 get it when their acts report `perfect`).

## Test and build

- `node --test test/*.test.mjs` stays green (584 pass before this build); new tests for the grid, the opening rule, the
  cell states derived from the save.
- `node build.mjs`; one page per minigame (`__H109_ONLY`) plus the full game.
- Replay every work as a player with `tools/probe109.cjs` at 1600×900 with a mouse and at 960×600 with touch, from the
  stage's start to its end film, in free order.

## Build 116 (after 115 is reviewed)

1. World flow: every rock cell is playable (rocks → read → pave), opening when a neighbour is cut; every cut cell's four
   quarters can be paved at will; every open stretch of the wall can be built; waste whenever a pile exists. Works beyond
   the stage's goal pay the normal points and never block the stage.
2. Paving: unit 2.5 amot, a cell is 10 × 10 units in four quarters of 5 × 5; seven slab sizes 1×1, 1×2, 1×3, 1×4, 2×2,
   2×3, 3×3; rule: no point where four corners meet; level 2 more small slabs; level 3 two slabs too many and one cracked.
3. Corner stone: the stone really turns on its rope. Three gestures: drag the jib (the stone swings late), drag the guide
   rope to turn it (full turn both ways) until its two edges are parallel to the two lines (lines light green), hold to
   lower / release to stop. Crooked landing: lifted, free retry. Lowered too fast: cracked, −20, new stone.
4. Great stone, new game "down the slope": the stone on rollers goes from the rock (יט־6) down a marked track to the west
   wall (כג־6); two brake crews hold ropes behind. Hold the stone and pull forward: the crews pay out rope, the more you
   pull the faster; pull sideways to steer; release: the crews brake and it stops slowly (weight). Left the track: a roller
   breaks, −20, levered back. Tipped over: −40, back to the last station. Untouched it stands still. The crews move the
   rollers by themselves. The old roller game is removed.
