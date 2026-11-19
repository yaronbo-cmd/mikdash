# Build 118: stage 02 fixes (the line and the stakes, the course in bond)

Coding brief. The owner said go on 2026-11-11 04:41 UTC ("בנייה 118. פייבל תן הנחיות אופוס קידוד. גו."). The design he read is
part 3 of the page "תיקוני שלב 01 ועולם אחד" (9.11): both minigames are REBUILT, not patched. Plumb, lever, gates and the
closing stone are not touched in this build (his notes on them have not come); they must still play through.
Builds 115–117 briefs' "Rules that must hold" hold here too. The reviewer replays the whole of stage 02 as a player
(touch 960×600, mouse 1600×900) before handover.

Order, one commit each, tests green after each: M model, S stakes, B bond, T tools and whole-stage replay.
Mission ids stay (`stakes`, `bond1`…`bond9`). The save's shape `st.lay[s].stones = [{ a, L, row, off }]` stays (L may now be 5).

His words that this build answers (9.11 20:51, build 111):
- Stakes: "גרוע". The kohen does not move; three lines move together and nothing visibly changes; he does not know where he
  is or what is measured; the screen jumped for a second "into a room"; a crewman lifts "a lantern"; the label
  "האלכסונים שווים" was false.
- Bond: white rectangles that are not part of the world; no pile, only two stones; the stone flies with the finger and the
  crane is meaningless; "יד של אומן מוכנה" means nothing; the kohen stands; he wants a hard logic puzzle with exact stock
  and one order, and a score that rises with the difficulty.

General (unchanged): no time pressure; a miss costs nothing; only real damage costs (`X.loss` −20, at most −80 a mission,
never below zero); every target is drawn in the world in green; `wants(p)` is true only where the act takes the touch, so
the right-thumb look and the play zone of 117 work here; a perfect play reports `perfect: true`; no label may say what the
game did not measure (rule 55); lines are Hebrew, short, plain, no dashes as punctuation; never a Divine Name. Sparks,
dust, the flash and the popping number of every hit stay. Nothing yellow is drawn as a marker.

## M. Model (`src/game/h111/model.js`, pure, tested)

### M1. The stretch's puzzle
`puzzleOf(s)` is rewritten. Stretchers are 2, 3, 4, 5 amot (one face row). The header is the 6: it lies ACROSS the whole
wall and takes 2 cells of both face rows; a 6 is never laid along. Two face rows, ONE stock for both.

| stretches | G | stock | joints below | solutions | header | bonus |
|---|---|---|---|---|---|---|
| 1–3 | 8, 9, 10 | the solution's stones + one extra stretcher | chalk tick on each | 2 or 3 | none | 100 |
| 4–6 | 10, 11, 12 | exact | chalk tick | exactly 1 | one, required | 200 |
| 7, 8 | 22, gate opening of 10 in the middle | exact | chalk tick | exactly 1 | one if a unique puzzle exists with it | 400 |
| 9 | 12 | exact | NO chalk | exactly 1 | one, required | 400 |

Return `{ s, G, lv, open, head, below: [Set, Set], belowStones: [[a, L]…] per row, sol, stock: [{ id, L }] (single stones,
sorted short to long), marks, bonus }`. `belowStones` is a real tiling of the course below (pieces 2–4), its joints never
under a joint of `sol`, never under the header's edges, and the stretch's ends and the opening's edges are free.

### M2. The solver
`countSolutions(P, cap = 4, laid = [])` → the number of different full layouts (a layout = the set of `{ row, a, L }` and
the header's place) that fill both rows outside the opening, use the stock (all of it when exact; all but one when there
is an extra), keep every joint off `below`, and contain `laid`. Depth-first over the cells, stops at `cap`.
`canFinish(P, laid)` = `countSolutions(P, 1, laid) > 0`. `misplaced(P, laid)` → one laid stone whose removal makes
`canFinish` true (the stone the master chalks), or null.

### M3. Generation
Deterministic per stretch: try seeds `1009*s + 77 + k`, k = 0…600: a random solution, a random course below, count with
the solver, keep the first that meets the table. If no seed meets it for a stretch, keep the one with the fewest
solutions and say so in the commit message (the test for that stretch then asserts what was reached, with a comment).
Generation must take under 150 ms for all nine (cache the nine puzzles).

### M4. Tests (`test/h111-model.test.mjs`, extended)
For every stretch: the table's solution count; stock total equals the cells to fill (+ the extra's length at level 1);
`sol` passes `checkCourse` with no joint over joint; a wrong first stone that blocks the course makes `canFinish` false
and `misplaced` returns it; `puzzleOf` is the same on every call.

## S. The line and the stakes (`STAKES` in `h111/acts.js`)

What he does: he walks the kohen, who carries the fourth stake, until both ropes are at their measure, drives the stake,
and the crews test the corner with one rope on both diagonals.

### S1. Opening
From above (the director's overhead intro): the azara's rectangle 187 × 135 in lime on the Mount, three stakes each with a
small flag and a crewman holding the rope's end at it, the fourth corner (north-east, `AZ.D`) empty. The camera comes
down ALONG the north rope to the kohen in about 4 s. First time only; afterwards a 1.5 s version.

### S2. The kohen carries the stake
The floating stake is gone. The hero holds the stake (`X.hero` item / `workpiece` as the engine allows; if the figure
system cannot hold it, the stake is drawn at his hand's place and moves with him). A drag on the ground sets where he
walks; he walks there at a walking pace and slows in the last amah, so a slow finger gives fine control. The camera follows
him gently from behind and above (he whole, the stake's head and both ropes' first 8 amot in frame). `wants(p)`: true on
the ground within 14 amot of him and on the stake.
A crewman walks beside him carrying the rope coil (role with the rope item). Nobody stands idle and nobody holds an
object that is not a tool of this work.

### S3. The ribbons
Each rope (north from `AZ.A`, 187; east from `AZ.C`, 135) runs through a ring on the stake's head and on, 4 amot, to the
coil. A red ribbon is tied on each rope exactly at its measure from the far stake. With `n` = his distance from A:
the north ribbon sits `187 − n` amot past the ring (on the coil side) when he is too near, and `n − 187` amot before the
ring (out on the stretched rope) when he is too far. Same for the east rope with 135. One amah of error is one amah on
the rope, so the error is read beside his hand at real size. The ropes stay white; nothing turns gold by itself.
Level 1: a small chalk number rides beside each ribbon ("חסר 1.4" / "עודף 0.6", one decimal). Level 2: no numbers, and the
ropes sway while he walks and calm 0.8 s after he stands (the ribbons sway with them). Level 3: a gust every few seconds
and the needed precision is 0.1 amah. In the stage this mission is level 1 (it is played once).
The diagonal rope and its label are deleted from this phase.

### S4. Driving the stake
Three taps on the stake: at each the kohen swings the wooden mallet (`X.hero.act`), dust and the sound, the stake sinks a
third. He may drive it wherever he stands; the game does not stop him.

### S5. The real test of the diagonals
The camera rises (3 s). The crews stretch ONE rope from A to C: the rope is drawn out along the diagonal, a knot is tied
at C, a chalk label shows its length. Then the same rope goes from B to his stake: the camera comes down to the stake and
the knot is seen short of the stake or past it, at real size, with the label "הפרש 0.4 אמה" (the true number, computed
from the stake's place: `|BD| − |AC|`).
- Difference ≤ 0.25 (0.1 at level 3): "בול! פינה ישרה", `X.hit(..., 'gold')`, the full celebration, `perfect: true` when it
  was the first drive.
- Otherwise: the line "לא שווים · שלפו את היתד ונסו שוב", the kohen pulls the stake (tap on it), back to S2. Each pull
  lowers `q` (1, 0.8, 0.6). After the third failed drive the master builder marks the true place in lime, the kohen
  walks there and drives it (`q` 0.4, one star). No loss of points: nothing was damaged.
Never write "שווים" or "ישרה" unless this test measured it.

### S6. The end
No cut to another place. A 5 s shot from above: crewmen with hoes dig the footing trenches along the four lines
(a dark sunk strip with small earth mounds beside it, growing along each line). The trenches, the four stakes and the
lime lines stay in the world (`st.staked = { x, z }`; rebuilt in `initWorld`) until the footing course is shown over
them. Then `X.end`. Check by shots of the passage `stakes` → `bond1` that no frame has the camera inside a wall or under
the ground (`kit.js` `viewBlock`); if the next walk starts inside geometry, start it from the overhead shot.

### S7. `dbg()`
`{ phase, n, e, needN: 187, needE: 135, tol, heroScr, stakeScr, targetScr (the true corner), drives, pulls, diff }`.

## B. The course in bond (new file `h111/bond.js`; `BOND` leaves `acts.js`)

What he does: a logic puzzle played with a real crane. He reads the joints of the course below, chooses a stone from a
row of single stones, the crane lifts it, he carries it over the gap, turns the header across with the guide rope, and
lowers it. Exact stock, one order that closes the course.
Do not edit stage 01's `COURSE`; copy its patterns (three grips, shadow, plumb line, green mark, bounce) from `acts3.js`.
Export from `acts3.js` only what is needed (`chalkTag`, `shadowDisk`).

### B1. The world of a stretch
- Delete: the translucent bed planes, the tick marks, the yellow ghost plane, the piles with "×n" chips, the tap that
  turns a pile, the line "יד של אומן מוכנה" and any other caption of a control that no longer exists (grep the h111 folder
  and `pack.js` for dead captions).
- The course below is drawn inside the gap as REAL stones from `belowStones` (two face rows, the crews' fill between), a
  dark 0.06 gap at every joint. Where `marks`, a short chalk tick on each joint at the row's outer edge. The crews' stones
  of this course stand on both sides of the gap, so the gap is a real gap in a real course.
- A measuring reed (a real prop, notched every amah, a deeper notch every 5) lies along the gap's outer edge. It replaces
  the ticks. The gap's length is chalked on the neighbour stone ("12 אמות").
- At a gate stretch the opening's timber frame stands as now; nothing can be laid in it.
- The stock: every stone by itself in a row on the court's floor at the wall's foot (inside), parallel to the wall,
  short to long, 0.5 apart, the length chalked on each (`chalkTag`). What he sees is exactly what there is.

### B2. The crane really carries
`makeCrane(X, o)` gets options `{ mastH, jibL, luff }`; the defaults are today's, stage 01 does not change. Stage 02's
crane stands on the court's floor inside the wall at the stretch's middle, about 8 amot from the wall's centre line,
`jibL` 18, `mastH = max(9.5, bedHeight + 1)`. With `luff` the jib is its own group hinged at the mast's head: slewing and
raising the jib put the tip over any point between 5 and 17 amot from the mast; the rope pays out so the stone's height
does not change when the jib rises. Every cell of the gap in both rows and every stock stone must be inside that reach
(assert it in a test from the frames' numbers). The treadwheel turns whenever the rope runs. Two crewmen: one in the
wheel walking it when it turns, one at the stock tying the stone (both idle poses forbidden: when nothing runs, the wheel
man leans on the wheel's rail, the tier holds the next rope sling).

### B3. Touch
- Tap a stock stone: the tier ties it, the wheel turns, it rises on a visible rope to carry height (bed + 4).
- Drag on the hanging stone (or the jib's head): the jib's tip follows the finger on the horizontal plane at carry height,
  slewing and luffing; the stone hangs under it, lags and sways a little and settles in about a second.
- The guide rope (from the stone's end to the kohen's hands, B5): a sideways drag on it turns the stone. Stones arrive
  ALONG the wall. Only the 6 has to be turned a quarter turn, across the wall. From level 3 a light wind twists it.
- Hold still on the stone (0.3 s, under 10 px of movement): it comes down while held; let go and it stops. It lands only
  when it is over a legal place and straight (along, or across for the 6) within the tolerance of stage 01's course.
  Askew or over an illegal place: it bounces up a little, a line says why ("עקומה: סובבו בחבל", "המקום תפוס",
  "כאן פתח השער", "אבן ראש נכנסת לרוחב"), no penalty.
- Under the hanging stone: its shadow on the bed and a plumb line (as in 117's course), and a thin GREEN outline on the
  bed at the place it would land (snapped to whole amot and to a row, or to both rows for the header). No outline where
  it cannot land.
- Tap a laid stone: the crane takes it up again (`A.lifts++`). He may lay it elsewhere or lower it on its own empty place
  in the stock row (a green outline shows there).
- `wants(p)`: stock stones, the hanging stone, the jib, the guide rope, laid stones. Everything else is the look.

### B4. The rules of the puzzle in play
- Joint over joint, level 1 (stretches 1–3): the joint is chalked red at once, `X.word` "חיבור מעל חיבור!", he may lift it.
- Level 2 and 3: no warning. When the course is full, the crews lower the next course's stone on it: each stone over a
  joint cracks (`X.loss(20, …)`, shake, dust), the crane takes the two halves down to a rubble heap at the wall's foot
  (the heap stays), a new stone of that length comes on a sledge to its place in the stock row, and he goes on.
- After every landing: if `!canFinish(P, laid)` and no stock stone has a legal place, the line
  "נשאר רווח שאף אבן לא סוגרת · הרימו אבן וחשבו מחדש". No penalty. At level 1, after two lifts, the master builder chalks
  the stone that `misplaced` returns.
- The course closes when both rows are full with no joint over joint: the crews pour the fill, the stones stay in the
  wall (`st.lay[s]`, `SH2.laid`, as now), `X.bonus(P.bonus, 'course', …)`. With `lifts === 0` and no crack: the bonus is
  doubled, "בול! נדבך קשור", `perfect: true`.
- `q = max(0.4, 1 − 0.12·lifts − 0.25·cracks − 0.15·(master's chalk used))`; stars from `starsOf(q)`.
- The first line of each stretch states the task plainly, e.g. "סגרו את הרווח · כל אבני המלאי נכנסות · בלי חיבור מעל חיבור"
  (level 1: "…אבן אחת תישאר"). The header is taught once, at stretch 4, with a hand on the guide rope.

### B5. The kohen and the camera
- The kohen works: he stands on the wall's top on the built course beside the gap (never on a gap cell, never within one
  amah of the hanging stone's footprint), holds the guide rope's end and walks along the top as the stone is carried, so
  the rope stays about 6 amot long. If any shot shows him inside a stone, under one, or hiding a gap cell, do not patch
  the pose: tie the rope to a stake on the wall's top as in stage 01 and hide him (`X.kohen(false)`), and say so in the
  commit message.
- One shot for the whole puzzle: high (about 65–70°) from the court's side, the whole gap, both neighbours, the reed, the
  stock row, the crane's foot and the jib's head in frame at 960×600 and 1600×900, the goal banner not over the gap. While
  a stone comes down the camera may ease 15 % closer to it; it returns after. Use `kit.js` `camAt`/`viewBlock` so no wall
  or roof stands between the camera and the bed.
- Opening of each stretch: from above the azara down to the stretch (the director's flight), as in stage 01.

### B6. `dbg()`
`{ phase, lv, G, open, stock: [{ id, L, scr, used }], laid: [{ id, row, a, L }], held: { id, L } | null, stoneScr, jibScr,
ropeScr, rotTE, tol, next: { id, row, a, hdr, scr } (the next stone of the solution not yet laid, its target on screen),
lifts, cracks, canFinish }`.

## G. Small things for the whole stage
- `world/grid.js`: add stage 02 to the address book (`BOOK.wall = { stake, stretches: [{ s, name }] }`, names by `nameOf`
  of the cell). The grid is never drawn in the game.
- The one-minigame page `__H109_ONLY='stakes'`: play the stakes three times, levels 1, 2, 3 (ids `stakes`, `stakes_2`,
  `stakes_3` exist only on that page). If this needs more than a small change in `pack.js`, skip it and say so.

## T. Tools and proof
- `tools/h109bot.js`: new players for `stakes` (walk by dragging toward `targetScr` until both errors are inside `tol`,
  three taps, wait for the test) and `bond` (tap `next` stone in the stock, drag the stone to `next.scr`, rope drag while
  `|rotTE| > tol·0.4`, hold to lower). The players of plumb, lever, gates and closing stay.
- Probes, one at a time, never two browsers: each of `stakes`, `bond1`, `bond4`, `bond7`, `bond9` alone with shots at every
  phase (touch 960×600), then the whole of stage 02 (`window.__H111_FULL = true`) touch 960×600 and mouse
  (`MOUSE=1`) 1600×900. Also one hand-written script per minigame that plays it WRONG: a stake driven 2 amot off (the
  test must show the difference and ask for a pull), three failed drives (the master's lime), a joint over a joint at
  level 1 (red chalk) and at level 2 (crack, −20, new stone), a blocked course (`canFinish` false and the line).
- Look at the shots before saying done. Report to the reviewer: commits, test count, what was skipped or changed from
  this brief and why, and the list of shots worth looking at.
