# Build 116: the great stone down the slope, the turning corner stone, seven slab sizes, world flow

Coding brief. The owner approved the spec on 2026-11-10 ("שלב 01: רשת נ.צ ואפיון") and gave the go for builds 115 and 116
together. Build 115 is handed over (docs/specs/build115-brief.md; read its "Rules that must hold" first: every one of them
holds here too). This file is the instruction for the coder; the reviewer replays the build as a player before handover.

Code the four parts in this order, one commit each, tests green after each: A great stone, B corner stone, C paving,
D world flow. Mission ids of the plan stay (`rope`, `rocks0`..`pave8`, `waste1`..`3`, `corner`, `course0`, `course1`,
`great`, `letters`) so saves, hooks and the bot keep working.

His words that this build answers:
- Great stone: "האבן הגדולה נראה לי החדש ולא שניהם מה שנראה לך הכי הארד פאן - בצע". He called the present one the worst game.
- Corner stone: it must really turn ("אבן הפינה מסתובבת פיזית").
- Paving: at least seven slab sizes; he may pave any flat place free of rock.
- World flow: he may go on working wherever it makes sense (pave more, build more wall, clear more rock) in the one
  continuous world. Nothing vanishes. Works beyond the stage's goal never block the stage.

General for every act below: no time pressure; a miss costs nothing; only real damage costs (`X.loss`: −20, the great
stone tipped −40); the target of every aim is drawn in the world in green; after a miss the world shows what to do next;
`wants(p)` says where the act takes the touch so the right thumb can look around elsewhere; a perfect play reports
`perfect: true` (full-screen "מושלם!"); the shot is chosen with `kit.js` `camAt` / `rayBlocked` so that everything he must
touch is seen; side figures hold a tool and work. Lines: Hebrew, short, plain, no dashes as punctuation, no Divine Name.

## A. The great stone: "במורד ההר" (replaces the roller game; `great`)

Idea (illustration, not a source claim): a huge stone is let down the slope on rollers, held from behind by two rope
crews. The fun is weight: it answers late, it gathers speed on the steep parts, and you must slow down BEFORE the bend.

Place (address book, new `BOOK.great`):
- Start on the rock in cell יט־6 (k 18, r 5), the stone lying on its rollers. The track goes west down the slope through
  כ־6, off the rock, over the level ground to the west wall at cell כג־6 (x −300, z about −46), about 115 amot.
- The track's centre line is fixed in the book (a list of points): two gentle bends at level 1 shape (the same line for all
  levels; levels differ in width and limits). Three stations (flat rests) on it at about 30, 60 and 90 amot.
- The cells the track crosses and their neighbours north and south (k 17..19, r 4..6) stay natural rock until `great` is
  done (the crews do not cut them before; they are not offered as free rock cells before). After it the crews cut them.
- The slot in the west wall moves to the track's end. The stone ends INSIDE the wall and stays (as today, new place).
  `PLACES.quarry` / `greatRoad` / the old road props and `H109.GREAT_ROLLERS` go.

What is seen: the stone (present size and look) on four to five log rollers; two crews of four behind it, each holding a
thick rope from the stone's back corners, the ropes taut; two men with levers beside it; the track marked on the ground by
two rows of small white stones and a faint green line in its middle; the three stations as flat ledges; in front of the
wall a green rectangle (the stopping place) and the open slot. The freed back roller is carried forward by two men by
themselves, all the time the stone moves (never the player's job).

Touch:
- Hold the stone and pull forward (down the track, as seen on the screen): the crews pay out rope. The further the pull,
  the higher the asked speed (0 to `vmax`). Pull sideways: the levers turn the stone's nose that way, slowly.
- Release: the crews brake. It slows over a second or two (weight), then stands. Untouched it always stands still.
- `wants(p)`: a touch that starts within about 7 amot of the stone (on the screen: on it or a finger's width round it).

Physics (numbers are the start; tune by play, keep the feel "heavy, late, fair"):
- State: `s` along the line, `o` sideways offset, `a` heading error, `v ≥ 0`.
- Slope push `g = max(0, sin(slope) − 0.12) × 9` amot/s². Asked speed `v* = pull01 × vmax` (`vmax` 6).
- `v < v*`: `dv = 1.5 + g`. `v > v*`: `dv = −(B × (1 − 0.5 × v / vlim) − g)`, never below what stops it in the end when
  released (`B` 6 / 5 / 4.2 at levels 1 / 2 / 3). At rest the crews always hold.
- Speed limit `vlim`: 5 on the straight, 3 in a bend (level 3: 4.4 and 2.6). The ropes show the strain: colour from rope
  tan to red as `v / vlim` goes from 0.7 to 1, the crews lean back further and their feet raise dust, the ropes creak
  (sound). Over the limit for 0.7 s: a rope snaps, the stone runs to the next bend and TIPS: `X.loss` −40, word in the
  world "התהפכה: האטו לפני הפיתול", the crews right it at the last station passed (short scene), he goes on from there.
- Track half-width: stone's half-width + 3 / 2.2 / 1.5 amot. Outside it: a roller breaks (crack, splinters), `X.loss` −20,
  word "יצאה מהמסילה", the levers bring it back to the middle where it left (short scene), he goes on.
- A station reached: `X.hit` gold when the leg was clean (never in the red, never touched the white stones), good when it
  was in the red or brushed the edge, ok after a loss. The usual effects.
- The end: the last 12 amot are level. Green rectangle before the slot. Stop inside it (any part of the stone outside:
  nothing lost, pull on or the crews pull it back a little when he pulls backwards) with the nose straight (under 4
  degrees) and slow: the levers push it into the slot, dust, it is in the wall and stays. Reaching the wall faster than
  1.2 amot/s: it strikes, a corner chips, `X.loss` −20, the crews pull it back 6 amot, he tries again.
- Perfect: three gold stations, no loss, the end at the first try.

Camera: one continuous shot from behind and above the stone on the uphill side, looking down the track west: the stone,
both crews, at least 30 amot of track ahead, the west wall and the horizon. It follows smoothly, never cuts. Opening: a
slow move from the wall's slot up the track to the stone (so he reads the whole way first), about 3 s, skippable by touch.

Lines: start "משכו את האבן במורד · שחררו לבלום". First bend ahead (once): "פיתול: האטו לפני". At the end "לאט אל המלבן הירוק".

Bot and tests: `tools/h109bot.js` plays it (slow, clean); a pure function for the physics step in its own small module
(`h109/slope.js`, no three.js) with tests: untouched it stands on every slope of the line; released from `vlim` it stops
within a bounded distance at every level; held at full pull from the start it tips before the first bend's end.

## B. The corner stone that turns (`corner`)

Place, trench, meaning, lever test and gold mark stay as in 115. New: the stone hangs askew and must be turned.

What is seen: the crane (as today), the stone on a visible rope under the jib's head, hanging turned (level 1: 20 to 35
degrees off; 2: 40 to 80; 3: anything, and a hard swing twists it a little). The stone is clearly oblong (2:1) with one
dressed face, so a turn is read at a glance. A guide rope from the stone's lower corner to the kohen's hands (he stands
clear of the crane, seen whole). On the foundation: the green rectangle and the two wall lines of the corner (an L). The
stone's shadow on the foundation (it already exists).

Three gestures, each on the thing itself:
1. Drag the jib's head: the jib slews and luffs after the finger; the stone follows late and swings (damped pendulum).
2. Drag the guide rope (the rope or the kohen's hands): the stone turns round its rope, a full turn both ways, a little
   late. When its two edges are parallel to the two lines within the level's tolerance (6 / 4 / 2.5 degrees) the lines
   light green; otherwise they stay pale.
3. Hold on the stone (or on the green rectangle): it comes down; release: it stops. The longer the hold, the faster it
   drops (0.5 rising to 3 amot/s in about 1.5 s); a new hold starts slow again.
- `wants(p)`: near the jib's head, near the guide rope / the kohen, or on the stone / the rectangle. Elsewhere: look.
- Each grip has a soft light ring in the world while it is free (not a button, no text on it).

Landing:
- Touching down faster than 1.2 amot/s: the stone cracks. `X.loss` −20, word "ירדה מהר מדי", a new stone on the rope, the
  first shot again.
- Slow but crooked (turn over tolerance) or off the rectangle (over the present position tolerance): the crane lifts it
  again by itself, nothing lost, free retry; a green arrow on the ground shows which way to move (as in 115) and a green
  curved arrow round the stone shows which way to turn.
- Right: as today (the two crewmen with levers, "לא זזה", the gold mark).
- Perfect: first landing, in the gold tolerance for place and turn (half the level's tolerance), no crack.

Lines, each only when its gesture is the next thing to do, and only the first time: "גררו את ראש העגורן" · "גררו את החבל:
האבן מסתובבת" · "החזיקו על האבן: היא יורדת". After that only the standing line "מעל המלבן, ישרה, ולאט".

Shot: the present one from the north (the city tower is south-east of the corner and shades it): if the foundation is in
the tower's shadow, add a soft fill so the green rectangle, the lines and the stone's shadow read clearly, and frame so the
tower does not fill more than a quarter of the picture. Everything he drags is inside the frame at 960 × 600 and 1600 × 900.

## C. Paving with seven slab sizes (`pave`)

Unit 2.5 amot. A cell is 10 × 10 units, four quarters of 5 × 5 units (12.5 × 12.5 amot). One paving work = one quarter.

Pure module `h109/paving.js` (no three.js) with tests (`test/paving.test.mjs`):
- Sizes (units): 1×1, 1×2, 1×3, 1×4, 2×2, 2×3, 3×3 (each may be turned 90 degrees).
- Rule (illustration of the mason's rule): no point inside the quarter where four slab corners meet. The quarter's own
  edge does not count.
- `layout(seed, level)` → a true tiling of the 5 × 5 by the rule and the pile made of it: level 1 six or seven slabs with
  at least four different sizes and one 3×3 or 2×3; level 2 nine to eleven slabs (more small ones); level 3 as level 2 plus
  two slabs too many (they fit nowhere at the end) plus one cracked slab (as today's cracked slab: laying it is real
  damage, the present penalty and effect stay). Deterministic. Test seeds 0..300 at all levels: full cover, no cross,
  only the seven sizes, the pile solvable.
- `canPlace(board, w, h, x, y)` (inside, free, and no four-corner point made), `stuck(board, pile)` (no slab of the pile
  can be placed anywhere, either way round), `done(board)`.

Seen: the quarter's bare cut floor with a thin pale outline of its edge (not a grid: no unit lines), the slabs in seven
neat STACKS by size beside the quarter on the cell's cut floor (real slabs lying on each other, the cracked one visibly
cracked on top of its stack), two pavers with mallets who bed every slab he lays (one knock, dust).

Touch (keep the present gestures where they exist):
- Drag a slab from its stack: it lifts and follows the finger over the floor. Over the quarter it snaps to units and a
  green outline shows where it will lie; if it cannot lie there the outline is pale and, when the reason is the rule, the
  point where four corners would meet shows a small ring.
- Tap a slab (in a stack or in hand, as today) turns it 90 degrees.
- Release on a legal place: it is laid (knock, dust, hit by its size as today). Elsewhere: it goes back to its stack,
  nothing lost.
- A laid slab can be dragged out again to its stack (free; it only spoils the perfect).
- When `stuck` and not `done`: line "אין מקום: הרימו אבן ונסו סדר אחר" and the laid slabs that can be lifted pulse softly once.
- `wants(p)`: on a stack's top slab, on a slab in hand, on a laid slab. Elsewhere: look.
- Perfect: finished with no slab lifted again, no bounce on the rule, no cracked slab laid.

After the work: his quarter stays EXACTLY as he laid it (saved in `st.lay` by cell and quarter; merge its slabs into one
mesh so a paved quarter is one draw call). The kohen figure is hidden. The shot is steep enough that the whole quarter
and all seven stacks are seen and nothing covers them (the 115 check, with the stacks' corners added).

## D. World flow (free works beyond the plan)

One rule: wherever the world has more of the same work, it is open to him, in its real place, with the same game and the
same points. Free works are not in `PLAN`, never count for `finished()` / `progress()` / `letters`, and never block.

1. Every rock cell. The address book gets the big rock and the small rocks of ALL 113 rock cells (`BOOK.sectors`: index
   0..8 the kohen's nine exactly as they are now, 9.. the others in the crews' cutting order; three small rocks in the
   others). Sector-indexed code (`SH.bould[s]`, `SH.rocks[s]`, `SH.cellC[s]`, `st.rocks[s]`, `BOOK.kohen[m.s]`) runs on
   any `s`. Works `rocks{s}` → `read{s}` for s ≥ 9 open when the cell is still rock, the crews have not taken it, and a
   cell beside it (north, south, east or west) is cut. Once he has finished `rocks{s}` the cell is his: the crews leave it.
   The crews' cutting plan and pace move into the model (pure, derived from the save) so the model knows every cell's
   state; `stages.cells` only shows it. The rocks of a free cell are created when the cell first opens and removed when
   the crews take the cell (they split it: a short dust burst if in view).
2. Every cut cell, quarter by quarter. `pave{s}` is the first quarter of cell s (for the kohen's nine it is the plan's
   work, as today). The other three quarters are free works `pave{s}q1`..`q3`. The crews' own cells: the three cells the
   crews cut last stay bare cut floor and their quarters are free works too; older crew cells are paved by the crews (the
   shader's paving, as today). A cell in which he laid a quarter is his: the crews do not shader-pave it; instead, each
   time he finishes any work, the crews lay one open quarter of the oldest of his cells that is not the one he paved last
   (one merged mesh of a `layout()` tiling, two pavers there for a while). At the stage's end every open quarter is laid.
3. The wall. After `course1` further stretches of the east wall north of it (`course2`..`course7`, each 25 amot further
   north, book addresses) are free works, each opening when the one before is done. The same game; the stretch he built
   stays as he built it.
4. Waste. After `waste3`, whenever the pile holds three stones or more a free waste work is open (`waste4`, `waste5`, …)
   to the next pit of the book (add three more pit addresses on the east slope; a full pit is raked flat and stays).
5. Choosing. `open()` returns the plan's open works first, then the free ones. The four marks shown are the nearest open
   works as today, but a plan work is always among them when one is open; the compass goes to the nearest PLAN work, and
   to a free one only when no plan work is open. A free work's mark reads the act's title and "רשות" (no number). The top
   counters and the goal count the plan only.
6. Levels of free works: by how many of that kind he has finished, as today (so they are level 3 soon), never above 3.
7. Save: free works are stored like the others (`done`, `res`, `plays`, `lay`). A reload shows the same world, every
   quarter, cell and stretch as he left it. An older save (115) loads without loss.

Tests: the model's cell states from a save; the opening rules of free works; that free works change neither `progress()`
nor `finished()`; that the book's first nine sectors are byte-identical to 115's `BOOK.kohen`; no two rocks of the book
overlap and every stand is clear.

## Test and build

- `node --test test/*.test.mjs` green (588 pass before this build) plus the new tests.
- `node build.mjs`; pages: the full game and one page per minigame, titled "… · בנייה 116".
- `tools/h109bot.js` plays every plan work with the new games; replay of the whole stage with a mouse at 1600 × 900 and
  with touch at 960 × 600, plus at least: one free rock cell start to end, two free quarters, one free wall stretch, one
  free waste work, a reload in the middle of them.
- Stages 02 to 04 still open and play (same director).
- Never two probes at once. No model names or session ids in code or commits. Push to `claude/project-thread-wv5ljp`
  and to `build-116`. Never merge.
