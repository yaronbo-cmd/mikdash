# Build 120 — coding brief: stage 05 "עזרת הנשים והגזוזטרא" in the new world

The owner approved the spec on 11.11.2026 22:31 UTC ("גו בהצלחה. פייבל מנחה בפירוט - אופוס מקודד").
The approved spec (Hebrew, binding) is `docs/specs/shlav-05-he.md`. Read it first, whole. This brief turns it into
code decisions. Where the brief and the spec differ on *what the player experiences*, the spec wins and you report the
difference. Where the spec is silent, the brief decides. The 63 standing rules are in `docs/specs/klalim-he.md`
(rule 64 is added by this build, see §9); every station is checked against them before delivery.

Base: `c008580` (build 118) on branch `claude/project-thread-wv5ljp`. Build number 120 (119 is the look build on another
branch).

## 0. Ground rules for the coder

1. New code lives in `src/game/h120/`. Mirror `src/game/h113/` (stage 04): pure `model.js`, `world.js` (shared things of
   the stage, built from the save), acts files, `pack.js`. Read h113 whole before writing, and `src/game/h109/director.js`
   (the stage director all packs share), `src/game/h109/kit.js`, `src/game/h109/model.js` (the free-choice face:
   `open() / pick() / canDo() / autoTo()`), `tools/probe109.cjs`, `tools/h109bot.js`.
2. Shared files (`src/game/index.js`, `director.js`, `src/temple.js`, `src/stages.js`, `src/crews.js`, audio) are touched
   only inside marked blocks `// ── h120 ── … ── /h120 ──`, as small as possible.
3. Do **not** reference `M.stone`, `M.stoneD`, `greatStoneMat` or `ashlarGeometry` anywhere in new code: the look build
   (119) deletes them and this build will be rebased onto it. Make the stage's own materials in an h120 `mats(X)` like
   h113's (own limestone, cedar, bronze, plaster, water).
4. Everything in amot. `+x` east, `+z` south, `+y` up. An amah = 6 tefachim = 24 fingers.
5. Touch the world itself. No side buttons, no sliders, no HUD controls (rule 20). Touch target ≥ 44 px, the nearest grip
   to the finger wins (as in build 118). Every act works with touch (960×600 landscape, two fingers) **and** with a mouse
   (1600×900, one pointer). Zoom-out at will, right-thumb look, play while slightly zoomed out: all come from the
   director; do not break them (rules 53, 61).
6. No timers, no time pressure (rule 32). No stuck state (rule 24). A loss shows in the world and says where to fix
   (rules 31, 33). Points: one system, 40 / 20 / 10 per work via `qOf/starsOf` as in h113; penalty only for real damage
   through `X.loss(n, at, label, stones, res)`: −20, or −40 for the fallen column; never below zero.
7. The kohen is on screen only while his hands work (rule 62); he never stands between the camera and the work
   (rule 13). Side figures always build with a tool or a load in hand; none stands idle, none loops a canned cycle,
   none sinks into floor or wall. Onlookers hidden inside an act as build 118 does.
8. Player-facing text is Hebrew, short, plain. Use the strings given here verbatim. Never write a Divine Name. No Ark.
   Every factual claim on screen carries its source from §11; anything else is not claimed or is marked "(המחשה)".
   List every Hebrew string you had to add in your final report.
9. Nothing random at play time: every prop, obstacle, floor height and wind gust comes from fixed tables or a seeded
   function of the address (rule 56). The grid is never drawn in the game (rule 57).
10. Everything the player made stays and is redrawn from the save after a reload and from the zoom-out (rule 55): each
    column with its lean, wedges, chip or crack; each beam with its shim; the channels; the water level; the props.
11. Git: commit per finished unit, message style `Build 120 X: what and why` (as 118). End every commit message with
    exactly:
    ```
    Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
    Claude-Session: https://claude.ai/code/session_01LtMU2DJMxkeBF14EWp7k9H
    ```
    No model names anywhere else (code, comments, messages). Push with `git push -u origin claude/project-thread-wv5ljp`
    (retry on network errors only: 2 s, 4 s, 8 s, 16 s). Never force-push, never merge, never another branch.
12. Checks before every commit: `node build.mjs` and `node --test test/*.test.mjs` (614 pass at base; all must stay green
    plus the new ones). Probes: `node tools/probe109.cjs script.json outdir W H` (prefix `MOUSE=1` for the mouse run).
    **Never run two probes at the same time.** Scratch files go under
    `/tmp/claude-0/-home-claude/e840bc1a-c767-5ff8-a92a-54650f4e9104/scratchpad/s05/`, never in the repo.
13. If something in this brief cannot be done as written, do the nearest honest thing, and say so in the report. Do not
    fake a feature (no label may claim what the game did not measure, rule 55).

## 1. The place (fixed addresses)

Court of the women: x 6…141, z −67.5…67.5, floor y 6. Four corner chambers 40×40, unroofed (Middot 2:5), already in
`src/temple.js` (`nashim` block, read it): NW lepers (x 6…46, z −67.5…−27.5), NE wood (101…141, −67.5…−27.5),
SE nazirites (101…141, 27.5…67.5), SW oil and wine (6…46, 27.5…67.5). East gate house x 138…150, z −13…13. West: the
fifteen steps and Nikanor (x < 24, |z| < 14); nothing of this stage stands there.

All sizes of the gallery are illustration (not in the sources). Constants (`H120` in model.js):

| name | value | what |
|---|---|---|
| `PLINTH` | 0.4 | the stone base under a column, 1.6 × 1.6, top y 6.4 |
| `COL_H` | 10 | the monolith: one stone, radius 0.6 at the foot, 0.5 at the top, top y 16.4 |
| `BEAM_H`, `BEAM_W` | 0.6, 0.7 | main cedar beam on the column tops, top y 17.0 |
| `JOIST` | 0.3 | short beams from the wall corbels to the main beam, every 2.2 amot, top y 17.3 |
| `PLANK` | 0.1 | floor planks, gallery floor y 17.4 (about 11 amot over the court) |
| `OUT` | 5 | the column line stands 5 amot from the wall face |
| `SPAN`, `SPAN_E` | 11, 11.25 | nominal span centre to centre; the east wing's long bay |
| `BAL`, `OVER` | 78°, 97° | balance angle of a rising column; past `OVER` it is lost |

Layout (`COLS`, `BEAMS` in model.js; ids are stable and part of the save):

- South side, line z = +62.5, wall face z = +67.5: columns `S1…S4` at x = 57, 68, 79, 90. Beams `SB0…SB4`:
  46→57, 57→68, 68→79, 79→90, 90→101. The ends at x 46 and x 101 rest on corbels in the chambers' walls.
- North side, line z = −62.5: `N1…N4` at the same x; beams `NB0…NB4`.
- East, line x = 136, wall face x = 141, two wings beside the gate: north wing column `EN` at (136, −16.25), beams
  `ENB0` from the wood chamber's wall (z −27.5) to the column (11.25) and `ENB1` from the column to a corbel on the gate
  house (z −13, 3.25 long, the crews'); south wing mirrored: `ES` at (136, +16.25), `ESB0`, `ESB1`.
- Ten columns, fourteen main beams. A wall corbel (זיז) under every joist and at every beam end on a wall. A wooden
  railing 1.3 high on the court edge of the gallery. Ladders at the chambers' ends.

The kohen's three bays, one per level:

| level | side | his column | his beam | neighbour support | grid |
|---|---|---|---|---|---|
| 1 | south | `S2` (68, 62.5) | `SB1` 57→68 | `S1`, raised by the crews during the opening | ט־10 |
| 2 | north | `N1` (57, −62.5) | `NB1` 57→68 | `N2`, raised by the crews while he works on level 1 | ט־5 |
| 3 | east, north wing | `EN` (136, −16.25) | `ENB0`, 11.25 | the corbel in the wood chamber's wall | ו־7 |

Other fixed places:

- Carpenters' yard (station 2, start of station 3): centre about (90, −24), grid ח־7. Keep it inside x 77…102,
  z −33.5…−8.5, clear of the site crane at (88, −14) and the crews' stands in `src/crews.js` (`nashim`); move it a few
  amot if they clash and report where it ended.
- The mikveh (station 4): inside the lepers' chamber, grid יא־6 (x 2…27, z −58.5…−33.5): a rock-cut basin 2 × 3 amot,
  3 amot deep plus a rim of 2 tefachim, seven steps down on its east side, grey lime plaster. Basin about x 12…14,
  z −42…−39; steps to x 18. The chamber's door is the gap x 22…30 in its south wall (z −29.5…−27.5).
  Today's model has a built pool (`box('water', 15, 6, −59, 37, 7.0, −45)` and its four kerbs): it goes (see §7).
- Lime pit of the plasterers in the chamber: about x 20…24, z −37…−33 (between the basin and the door, on the natural
  downhill from the basin's rim; this is level 3's trap).

## 2. The model (`h120/model.js`, pure, tested)

Face for the director, as `h109/model.js` (free choice, rule 54):
`M.st · M.open() · M.pick(id) · M.canDo(m) · M.mission() · M.done(res) · M.finished() · M.autoTo(want) · M.levelOf(m)
· M.progress() · M.streak(n) · M.free() · M.freeMission(id) · M.unitEnd(m) · M.shown(m)`.

Plan: 12 works + the closing one. `PLAN` ids: `col1 saw1 carry1 mikveh1 col2 saw2 carry2 mikveh2 col3 saw3 carry3
mikveh3 planks`. Kinds: `col, saw, carry, mikveh, planks`. `m.lv` is the level and it is fixed by the place.

What is open (`canDo`), the real building conditions only:
- `col1` and `mikveh1` from the first moment. `col(n+1)` after `col n`. `mikveh(n+1)` after `mikveh n`.
- `saw n` after `col n` (nothing to measure without two supports). `carry n` after `saw n`.
- `planks` after the twelve. It is not counted in "12 עבודות": add a small optional hook `PK.count(M) → [done, of]`
  used by the director's pill (marked block) so the pill reads "n מתוך 12 עבודות".
- Free works (rule 58, "רשות"): every column the crews have not raised yet is open to him as `colF:<id>` with level-3
  rules without the pulley, and every main beam whose two supports stand as `sawF:<id>` then `carryF:<id>`. What he
  does not do, the crews do on their schedule (below). Free works never block the plan and `autoTo` never picks them.
  Priority P1: build after the twelve works play well.

Save (`freshH120()`, `v: 1`, key `G.h120`), at least:
```
{ v, cur, done[], res{}, plays{}, best, intro,
  col:   { [id]: { done, by:'k'|'c', off:[along, across] (fingers), lean:[along, across] (fingers, after wedges),
                   wedges, chip, crack, broke } },
  beam:  { [id]: { done, by, need, meas, mark, cut, skew, line:'sharp'|'faint'|'smear', torn, fit:'knock'|'shim'|'trim'|'lost', shim } },
  carry: { [lv]: { done, bumps, clean[] } },
  mik:   { water (amot over the basin's bottom), outlet (amot or null), ch: [ { pts:[[x,z,depth]…], kind:'in'|'over' } ],
           moved: { trough:[x,z], jar1:[x,z] … }, [lv]: { done, fixes } },
  planks:{ done, at:[…6] }, props:{ [lv]: 0|1 }, load:0|1, film:0|1 }
```
`M.done(res)` on a mission that was not played (a one-minigame page, tests) leaves what the crews would have left:
a column exact and unwedged, a beam cut to the true span with a sharp line, the channel of that level as the reference
solution, the water at that level's mark.

Pure functions, each with tests:

- `LV` — the spec's table "מידות וספים", verbatim: landing speed 12/10/8 °/s; lean for מהודר 4/3/2 fingers; foot offset
  2/1.5/1 fingers; saw strokes 8/9/9; cut deviation 2/1.5/1 fingers; narrowest pass 6/5/4 amot; channel 10/25/15 (+12
  overflow). A test asserts the table.
- `spanTrue(st, lv)` — what the beam must be: the nominal span plus his column's foot offset along the gallery axis
  plus its lean at the top along the axis (fingers → amot), signed away from the neighbour. The stop log lets the foot
  be at most a tefach off; lean after wedging at most 6 fingers.
- `cutLength(b)` = `mark + drift − |skew|` (a skew end bears on its short side); torn fibres take one more finger.
- `fitOf(need, cut, lv)` → `'knock'` when `|cut − need| ≤` half a finger (it enters with a knock); `'trim'` when longer
  than that; `'shim'` when shorter by up to one tefach **inclusive**; `'lost'` when shorter by more than a tefach.
- `bayGrade(st, lv)` → `'perfect'` when the column has no wedges, no chip, no crack, lean and foot inside `LV`, and the
  beam's fit is `'knock'`; else `'creak'`.
- `crewUnits(nDone)` → which crew columns stand and which crew beams are seated after `nDone` of his works. Invariants
  (tested): `S1` stands at 0; `N2` stands before `saw2` can open; no beam is seated before both its supports stand;
  everything stands and is seated when the twelve are done; a column he took as a free work is never also the crews'.
- the column's dynamics, the saw's stroke, the beam's kinematics, the water's run: see each station; the stepping
  functions live in the model so the tests and the bot share them with the acts.

## 3. Rule 64, the fast reaction: `X.quick(at, word, mesh?)` (director, marked block)

The owner's addition on approval: "דופמין מהיר לביצוע מושלם". Every perfectly done **step** answers within 0.1 s, in
the same frame as the event:
1. a gold flash on the object itself (emissive pulse to `#FFD86A` for 220 ms on `mesh`, on a cloned material if it is
   shared; without a mesh an additive gold sprite at `at`);
2. a short bright "ting" whose pitch rises with the run of quick hits inside the act (capped at 8 steps);
3. the word popping from the place on screen (DOM, 600 ms, scale 0.6 → 1.15 → 1, floats up 40 px, gold with a dark
   outline): the given word, default "מושלם!"; from the second hit in a run it adds "×n";
4. the top streak cube pulses; haptic 15 ms.
It never blocks input, never opens a card, at most one per 250 ms (later ones in the window only ting). It is separate
from `X.perfect` (the big stamp) and from the full-screen "מושלם!" at the end of a work played without a mistake
(rule 60, the director's existing path: keep it). It adds no points: the one scoring system stays as it is.
The steps that fire it are listed in each station. Emit `h109quick` for the tests.

## 4. Station 1 — הקמת העמוד (`acts.js`: `COL`)

Icon 🏛, title "הקמת העמוד". `walkLine`: "העמוד שוכב ליד הכותל: מקימים אותו". Opening line of the act (source on
screen): "על עמודי הסטווים בהר הבית: וכל אחד מהם היה אבן אחת, שיש לבן (יוסף בן מתתיהו, מלחמת היהודים ה, ה, ב)". The card that says a ten-amah column in
this court is an illustration comes with the level-1 knowledge card, not as a claim.

**What stands there.** The column lies on a timber cradle along the gallery line, top away from the neighbour bay,
foot against a log stop on the plinth, at 8° from the floor. Green mark on the plinth: the exact place of the foot
(rule 59), visible before the first touch. Shear legs ("חמור": two cedar poles lashed at the head, 12 amot) stand over
the foot. The pull rope runs from the column's head over the shear head and down to four pullers (crew figures, rope
in hand, they lean and step back as the rope comes). The brake rope runs from the column's head to the other side,
three turns round a thick post driven in the floor; the kohen stands at the post, rope in his hands. Both ropes are
real visible ropes that sag and straighten (rule: a lifted stone hangs on a visible rope).

**Camera.** From the side, square to the plane the column swings in, so the whole arc is in frame with the shear legs,
both crews and the post; the kohen at the post in the lower corner on the brake side. A short macro only for the last
ten degrees onto the plinth (foot and mark fill a third of the frame), and back.

**Dynamics** (`colStep(s, input, dt, L)` in the model; angles in degrees from the floor):
- Gravity about the foot: angular acceleration `a = −A·sin(BAL − θ)` (in radians inside the sine). Below `BAL` it pulls
  back to the cradle, strongest when low ("heavy as a weight in the hand"); at `BAL` nothing; past `BAL` it pulls
  forward onto the seat at 90°.
- Pull rope: the finger drags the rope downward along its line; drag speed and reach give `p ∈ [0,1]`; the crew's
  force follows `p` with a lag (time constant 0.35 s; 0.7 s at level 3, the rope runs through a block on the chamber's
  wall). The rope only pulls, and it goes slack from `BAL + 4°`. Finger lifted: **the crew holds**; while the pull
  rope is held the column never sinks back (`ω ≥ 0` below `BAL`). Nothing falls because he let go.
- Brake rope: not pressed, it runs free round the post (a little friction). Finger pressed on the post: the rope is
  locked at the present angle and the column cannot pass it. Finger sliding **round** the post pays rope out: one full
  turn of the finger lets the column go 6° further. So pressing early stops the raise (the pull does nothing against a
  locked brake: the rope creaks, a line says "החבל האחורי תפוס: שחרר את היתד"), and the skill is to free the post
  while pulling and to catch on it at the balance.
- The seat: at 90° the foot lands flat. Landing speed `ω`: up to `L.land` (12/10/8 °/s) clean; from there up to
  18 °/s the rim of the foot chips (−20, the column stays with the flaw); above 18 °/s it rocks over the far edge,
  passes 97°, falls and breaks in two (−40, out of stock; a sledge with a new column is seen coming from the quarry
  side through the east gate, the crews lay it on the cradle, and he starts again; the broken halves are dragged to the
  stone pile and stay).
- Calibrate `A` so that, crossing `BAL` at ≤ 3 °/s with no brake at all, the column reaches 90° above 18 °/s, and the
  time from the crossing to the point where it can no longer be saved is ≥ 1.6 s at level 1, ≥ 1.3 s at level 2,
  ≥ 1.0 s at level 3 (a mouse player must be able to move from the pull rope to the post in that time). A firm press
  stops the column within 2°.
- The foot walks: a jerk on the pull rope (a jump of `p` > 0.5 in 0.15 s, or an abrupt release) while 20° < θ < 70°
  moves the foot a quarter of a finger along; the landing adds `ω/L.land` fingers; side sway at landing adds across.
  Clamp at one tefach. Smooth play leaves the foot within a finger.
- Lean after landing (fingers at the top): along `= 0.5·ω` (a soft landing leaves ≤ 2), across = the side sway at
  landing.

**The three steps (rule 22).**
1. Pull: drag the pull rope down. The column answers late and heavy, then lighter.
2. Balance: near 78° the pull rope slackens (levels 1 and 2: it changes colour from taut dark to pale) and the column
   wants to go by itself. The second finger goes to the post: press to hold, slide round to let it down onto the plinth.
   Two fingers at once on touch (one still pulling a little, one braking). Mouse: alternate; a tap on the pull rope
   gives one short heave (a small `+ω`); the crew holds whatever rope he left.
3. Straighten: two plumb lines drop from the top, one for each direction, each with a finger scale at the foot. A tap
   on a side of the plinth: a crew man drives a lead wedge there and the top moves one finger away from that side
   (overshoot is possible). A tap on the plumb weight accepts ("כך טוב") and ends the act. Wedges stay, are visible,
   and are counted.

**Levels.**
- 1: a pale arc on the floor shows the balance zone; the pull rope changes colour; landing ≤ 12 °/s.
- 2: an east wind in gusts (seen: dust streaks, a cloth strip on the shear head, the ropes flutter) pushes the column
  sideways (fingers at the top, up to 2 a second in a gust). A third rope, the side guy, with its own crew of two: a
  tap on that crew and they haul, 3 fingers back (half a second between hauls). No floor arc. Landing ≤ 10 °/s.
- 3: the column by the wood chamber. No room to pull straight: the rope turns through a block on the chamber's wall
  (the slow lag). A sharp pull (finger speed above the threshold) makes the rope creak and a line warns "לאט! החבל
  חורק"; a second sharp pull tears a strand and the column drops back onto the cradle: from under 45° no damage, from
  above 45° a crack along the shaft (−20; the column is used, the crack stays visible). No colour change. ≤ 8 °/s.

**Quick reactions (§3):** the brake pressed within ±2° of `BAL` (±3° at level 1): "בלימה בול!"; landing at ≤ half
of `L.land`: "נחיתה רכה!"; both plumb lines inside the tolerance with no wedge: "אנך!".

**Grade.** 40 (מהודר): no damage, foot within `L.foot`, lean within `L.lean`, no wedge. 20: stands inside twice those
bounds, at most two wedges. 10: otherwise. Any damage: the work ends at 10 at most, `lost` set when the column broke
and was replaced. The save keeps `off`, `lean`, `wedges`, `chip`, `crack`.

**The fun to deliver** (check each in the replay): a deep thud when it seats, a ring of dust round the foot, the plumb
swinging to rest in the middle; then the pull-back along the wall: the row of columns and his among them.
Knowledge card after level 1: the cracked column left in the quarry (Russian Compound). **Leave the card's text as a
TODO constant that is not shown** until the reviewer confirms the source (§11).

## 5. Station 2 — הקו והמסור (`acts2.js`: `SAW`)

Icon 🪚, title "הקו והמסור". `walkLine`: "מודדים בין שני העמודים, ומנסרים קורה". Line at the yard (tools only):
"חרש עצים נטה קו, יתארהו בשרד (ישעיהו מד, יג)" — shown as "כלי הנגר" with the tools, nothing more: the verse is
about an idol maker; do not attach it to the Temple's carpenters as a claim.

**Step 1, measuring, at the bay.** Camera: both column tops (or the corbel and the column) in one frame, close enough
that one finger of length is ≥ 3 px; a macro at the far mark while the end is near it. A crew man on a ladder holds
the cord's zero on the mark scratched on the neighbour's top; the kohen is on the ladder at his own column.
- Drag the cord's end to the mark on his column's top. Where the end rests relative to the mark counts (no snap).
- Tension: the tail hangs past the mark; drag the tail down. Tension `T ∈ [0, 1.15]`; the cord sags and trembles with
  `(1 − T)`; a slack cord reads long (up to + 1 tefach at `T = 0.4`). Above `T = 1.08` the helper's end slips off his
  mark (no damage; again). Lift the finger while `0.85 ≤ T ≤ 1.05`: the kohen pinches the cord at the mark.
- The reading: the knots are amot (a bead at each, eleven of them between the tops); the kohen lays the rod (one amah,
  six tefach notches, four finger ticks each) from the last knot to the pinch. Level 1: the result is also written,
  e.g. "11 אמות, טפח ו־2 אצבעות". Levels 2 and 3: no writing; the kohen scratches tally marks on a potsherd that goes
  with him to the yard: long strokes for tefachim, dots for fingers.
- `meas` = the true span (`spanTrue`) + the slack error + the end's offset. Quick reaction "מתוח!" when released
  inside the window at the first try with the end within a finger of the mark.

**The way to the yard**: one eased camera flight (≤ 1.2 s) from the bay to the yard; the kohen is set there. No cut to
black, no second walk.

**Step 2, marking, at the yard.** The beam (a nominal amah longer than needed: 12, or 12.25 for the east) lies on two
trestles across the screen. The cord is laid on it from its squared end: the knots show the amot; the rod lies from
the eleventh knot. A tap on the beam along the rod: the kohen scores a mark there (continuous position, no snap;
`mark` in amot). At level 1 only, if the mark is more than a tefach from what he measured, the carpenter stops him
once: "רגע. מדדנו אחרת. הסימן לא שם" and the mark is offered again (no penalty).
Then the red line: two hands hold the powdered string across the beam on the mark; drag its middle up and let go. Lift
height: inside the window a sharp line (quick reaction "קו חד!"); too low a faint line (hard to see while sawing); too
high a smear one finger wide. No retry of a snapped line: it is on the wood.

**Step 3, sawing.** Camera: the beam across the screen, the kohen in the left third at the near handle, the carpenter
beyond the beam at the far handle; the saw's line and the red line readable; the offcut end and its support in frame.
The stroke (`sawStep` in the model):
- Finger on his handle. Drag toward himself along the saw's axis: the saw cuts on his stroke; depth gained ∝ stroke
  length. Then relax (finger down, not driving): the carpenter pulls his stroke, which also cuts. Then again.
- Driving while the carpenter pulls (finger pushing along the axis against the return, or starting his own stroke
  before the carpenter's has ended) binds the saw: it bows, squeals, and the cut walks half a finger off the line.
- The finger wandering across the axis during his stroke tilts the blade: skew grows (a slanted end).
- Rhythm: the carpenter's stroke lasts 0.55 s (level 3: after the knot he changes to 0.4 s, calling out, and his arm
  leads the change by one stroke). His stroke starting within ±0.12 s of the carpenter's end is "in rhythm": quick
  reaction ("בקצב!" on the first, then flash and ting with ×n).
- The cut has four moments, so no nine strokes are alike (rule 35): (a) the start: the first two strokes must be
  short and slow or the saw skips off the line (the start error is the drift's seed); (b) three long strokes in the
  clear wood; (c) levels 2–3: a knot at 45–60 % of the depth, seen in the end grain and on the face: a fast stroke
  there jumps (half a finger of drift each), short slow strokes pass it; (d) the last third: the offcut starts to sag;
  a tap on the prop under it and a worker drives a wedge and holds; then the last two strokes. Without the prop the
  last fibres tear: a big splinter off the end, −20 and the beam one finger shorter (`torn`).
- Aim for 8 strokes of his at level 1 and 9 at levels 2–3 when played well; never more than 14: past that the
  carpenter finishes the cut himself and the work is graded 10.

**Grade** (against his own line; the truth shows at the columns, station 3): 40 when `|drift| + |skew| ≤ L.cut`
(2 / 1.5 / 1 fingers), the line sharp, no tear, at most one bind; then the macro: half the red line left on the edge
along the whole end, "חתכת את הקו באמצע", quick reaction "על הקו!". 20 inside twice the bound. 10 otherwise. A tear
is the only damage here. The save keeps `need, meas, mark, drift, skew, line, torn, cut`.

**The fun to deliver**: sawdust flying on every stroke from the kerf, the two-beat sound of two sawyers, the offcut
dropping with a thud onto the yard floor (it stays there, on the offcut heap).

## 6. Station 3 — מסע הקורה (`acts3.js`: `CARRY`)

Icon 🪵, title "מסע הקורה". `walkLine`: "הקורה מוכנה: נושאים אותה אל המפתח".

**What is seen.** His beam (its real cut length) on two shoulders: the kohen in front, a worker behind. Camera high
and oblique, following the beam's middle with a slow ease; it never moves under the finger (the ground point under a
held finger must not slide: ease the camera only toward where the beam already is). Half the court in frame: standing
columns, scaffolds, stone piles, the white lime pit, jars, crews crossing with loads. At the end the bay with a green
marking on the floor (rule 59).

**Kinematics** (`carryStep` in the model; the beam is a rigid segment of its cut length):
- The first finger anywhere not on the rear man leads the **front** end toward the finger's ground point (walking speed
  with a load: 2.5 amot/s); the rear end trails like a cart's trailer (it keeps the length and cuts every turn inside).
- A finger on the rear man leads the **rear** end and the front trails. This is how he backs into a narrow place:
  forward, back, forward (the three-move turn).
- Two fingers: each end goes to its finger, then the length is restored symmetrically.
- Mouse: drag ahead of the kohen to lead the front; stop; drag the rear man to lead the rear.
- Full turn in both directions (rule 23). Tests: the length is kept to 1e-6; with the front leading through a 90° turn
  the rear's path lies inside the front's.

**Obstacles** (fixed tables per level; beam half-width 0.4):
- hard, no damage: columns, stone piles, walls, the sledge, the ox cart: a thud, the beam stops and slides off; "bump".
- a scaffold's leg: the scaffold comes down (−20, once per scaffold; its crew rebuilds it in view within the act).
- a jar: it breaks, sherds stay on the floor (−20).
- the lime pit: only feet count. The rear man steps in: he shakes his leg, white to the knee, and goes on. No damage.
- a worker in the way: jumps aside and shouts "זהירות!". No damage.
- moving crews (level 3) follow fixed lanes with fixed periods; a moving cart that meets the beam halts until the beam
  is clear (no deadlock, no damage).

**Routes** (tune the tables until the narrowest pass matches the spec's table: 6 / 5 / 4 amot; report the final ones):
- Level 1, to `SB1` (south): from the yard the beam starts along z. About 75 amot south across the court, then one wide
  quarter turn to lie along x in the marking at z ≈ 59.5, x 57…68 (court side of the column line). A soft dark shadow
  on the floor shows where the rear end will sweep in the next 0.8 s. One checkpoint: the wide turn.
- Level 2, to `NB1` (north): west along the court, then **between the two standing columns** `N2` (68) and `N3` (79)
  and at once into the strip between the column line and the wall (z −67.5…−62.5, five amot wide), to lie along x in
  the marking at z ≈ −65, x 57…68. It needs the three-move turn. No shadow. Checkpoints: through the columns; into
  the strip.
- Level 3, to `ENB0` (east wing): east toward the gate. The stone sledges' lane from the east gate to the wood
  chamber's door (x 117…125, z −27.5) crosses the way, and an ox cart comes in through the gate: wait for a clear
  crossing. Then the narrow pass, four amot, between a scaffold on the chamber's south wall and a lime pit, and the
  marking along z at x ≈ 133, z −27.5…−16.25. Checkpoints: the crossing; the narrow pass; into the marking.
- Quick reaction "מעבר נקי!" at each checkpoint passed without a bump.

**Handing over.** The beam lies parallel to its two supports inside the marking (both ends inside; angle within 6° /
4° / 3°) and is held still for 0.6 s (quick reaction "בול!" at the first try). The kohen and the worker step out of the
frame (rule 62). The crew ties two visible ropes and hoists (4 s), and the beam comes down on its supports. Here the
truth shows (`fitOf(spanTrue, cut)`), in the world:
- `knock`: it drops in with a knock. Quick reaction "נכנסה בנקישה!". Line: "מדדת את מה שיש. הקורה נכנסה בדיוק".
- `trim` (too long): it stops on the column's edge and does not seat. The crew lowers one end to a trestle at the foot
  of the bay and **he trims it there**: the saw mechanic again, three strokes on a thin slice (a thin slice wanders:
  bound halved). Then it is hoisted and seats. No damage. This work is graded 20 at most. Line: "ארוכה מדי: מנסרים
  פרוסה דקה".
- `shim` (short, up to a tefach): it seats on the lip; the crew drives a cedar shim (כפיס) under its end. The shim
  stays and is always seen. This work is graded 10. Line: "קצרה, עד טפח: כשר. הכפיס נשאר".
- `lost` (short by more than a tefach): it cannot bear. The crew lowers it and carries it to the heap of short beams
  (it stays there). Real damage: −20, the beam is out of stock. The two yard sawyers cut a new one to the true span
  (seen, about 4 s), it is hoisted and seats. The work ends at 10, `lost`. Line: "קצרה ביותר מטפח: הקורה אבודה".
Grade otherwise: 40 for no bump, no damage, handed over inside the marking at the first try, and `knock`; 20 for up to
two bumps or `trim`; 10 otherwise.

**The fun to deliver**: the long beam passing exactly between two columns without touching; the knock when it seats;
the pull-back: his bay closed, and the crews already laying the joists from the corbels to it.

## 7. Station 4 — מקווה לשכת המצורעים (`acts4.js`: `MIKVEH`)

Icon 💧, title "מקווה לשכת המצורעים". `walkLine`: "הלשכה בלי תקרה, והגשם יורד לתוכה: מביאים את המים אל המקווה".
Opening lines: "והמצרע טבל בלשכת המצרעים (נגעים יד, ח)"; at level 1's goal: "אמה על אמה ברום שלש אמות. ושיערו חכמים
מי מקוה ארבעים סאה (עירובין ד, ב)"; at level 2: "מים שעברו דרך כלי פוסלים את המקווה (מקוואות ד, א)". The rock
hollow, the channel and the plasterers' trough are illustration; say nothing that claims otherwise.

The owner on approval: "מקווה נכנס (בהחלט! חסר מים במשחק)". **The water is the star of this station: its look and its
sound get real work** (see "The water" below).

**The basin and the marks.** Basin 2 × 3 amot at the bottom. So 40 seah (1 × 1 × 3 = 3 cubic amot) stand **half an
amah** deep in it: that is the low mark on the measuring rod that stands in the basin ("ארבעים סאה"). The high mark is
3 amot ("קומת אדם, שלוש אמות"). Level 2 fills to 1.5 amot. Test the arithmetic.

**The floor.** A fixed height field `floorH(x, z)` over the chamber (a function of the address, not random at play
time): a general fall toward the basin of about a finger per amah, low rises and dips of up to 1.5 tefachim, drawn as a
stone floor that looks flat (large slabs; the relief is real in the mesh but too slight to read by eye). The reference
solutions of the three levels must exist and be tested.

**The three steps (rule 22).**
1. Test pour: a tap on the floor; the kohen (jug in hand) walks there and pours a little; a thin thread of water runs
   down the steepest fall for 3–5 amot, darkens the stone and dries in a few seconds. As many times as he likes.
2. Scratch: drag a finger on the floor from the hollow to the basin. The kohen follows the finger marking with
   charcoal; two quarrymen with chisel and mallet cut the shallow channel behind him in the paving that already lies
   (base depth one finger). Holding a finger on a stretch of the channel deepens it, one finger of depth a second (the
   quarryman goes there and cuts; chips fly); at four fingers the stretch is a tefach deep; **the fifth finger cracks
   the slab** (−20, the masons replace it in view and the stretch is back at one finger). A channel may be dragged
   again from any point of it (a branch replaces what was after that point). Dragging the trough or a jar moves it.
3. Open: pull the clay plug out of the hollow (drag it up). The water runs. Where the fall is wrong it stops and
   stands as a puddle, with a small marker "כאן המים נעצרו". He mends (deepen, or redraw from that point) and it goes
   on. The water waits; no clock.

**The water's run** (`flow` in the model, along the channel only; this is the approved first version, not a free
spill): bed level at a vertex = `floorH − depth`. Water passes from a vertex to the next when the next bed is not
higher. Before a higher bed it must stand up to that height: allowed only if the channel's brim (the floor level)
along the standing reach is at least that high; otherwise it stops there. A channel that crosses the footprint of the
trough or of a jar sends the water **through a vessel**: the mikveh is pasul.

**Levels** (three works on the same basin; the water stays from one to the next):
- 1 "המורד": hollow A, a channel of about 10 amot with one low rise on the straight way (deepen two fingers along
  about 1.5 amot, or go round). Goal: the water reaches the 40-seah mark.
- 2 "בלי כלי": hollow B, about 25 amot away. The short way runs through the plasterers' wooden trough; a jar stands
  near the other way; two rises. Move the vessel or go round. Goal: 1.5 amot.
- 3 "קומת אדם והעודף": hollow C, about 15 amot. First, on the rod itself (macro on the basin's rim), drag the bronze
  marker along the rod to where the overflow outlet will be cut in the rim: exactly 3 amot above the bottom (within
  one finger for מהודר). Then the inflow channel, and the overflow channel, about 12 amot from the outlet to the
  chamber's door and out. The floor falls from the outlet toward the lime pit: the straight downhill line ends in the
  lime; the right line cuts across the fall and needs deepening.

**Losses.**
- stopped on the way: no damage; each mend after the plug is out lowers the grade.
- through a vessel: pasul. Two workers empty the basin with buckets (seen, the level drops on the rod), −20, and this
  work starts again: the channel stays as cut, the vessels where they are, the hollow is refilled by a short shower
  (seen: the rain falls into the roofless chamber).
- a slab cracked by over-deepening: −20.
- level 3, outlet too low: the water does not reach three amot: kosher (40 seah are there), not מהודר. Outlet too
  high (above the rim's lowest point): the water goes over the rim by itself and down the fall into the lime pit.
  Overflow into the lime pit by either way: the lime is spoiled (it hisses and steams), −20.

**Quick reactions (§3):** the gold flash runs with the water's front; a ting for every stretch passed without
stopping, rising in pitch; "זורם!" at the first; "מושלם!" when the front falls into the basin without one stop; level
3: "שלוש אמות בדיוק!" for the marker within a finger.

**Grade.** 40: the water arrived with no stop after the plug, no damage (level 3: the marker within a finger, and the
overflow out of the door). 20: one or two mends. 10: more. Damage caps the work at 10.

**The water (look and sound).** Requirements, all checked in the replay:
- in the channel: a ribbon along the cut with moving streaks and small sparkles, a clear leading front; the stone it
  has touched stays dark and wet for a minute; at a bend the stream visibly turns;
- the fall into the basin: a thin falling stream and splash rings where it lands;
- the basin: a surface that moves (slow ripples), takes the sky's colour, shows a bright sky reflection toward the
  camera, and rises along the rod, which is read in the macro; the plaster under water is darker;
- a puddle where the water stands; the test pour's thread;
- sound: a trickle that follows the amount of running water; a deeper pouring note at the fall that drops in pitch as
  the basin fills; drops when it stops. Add the voices beside the game's existing synthesized sounds (read
  `src/game/audio.js`; `src/water.js` may already have a usable surface: look before building a new one) and respect
  the mute setting.
- the level persists (`st.mik.water`), is drawn after a reload and is seen from the zoom-out as a small bright patch.

## 8. The closing work, the load test and the film

### 8.1 `planks` — סידור הלוחות (`load.js`: `PLANKS`)

Opens when the twelve are done. Evening light (ease the world's light to dusk if the view exposes time of day; else a
warm low light rig owned and restored by the act). On his south bay (`SB1`), camera from a ladder's height looking
along the gallery: the main beam, the joists from the corbels, a pile of six planks at the bay's end.
Drag a plank from the pile and slide it along the joists until it meets its neighbour: it stops by itself against it
with a wooden click and a puff of dust (quick ting on each). Let go early and it stays where it is and can be taken
again. No puzzle, no fail, no grade below 40. Six planks. Line: "נתנו זיזין בכתלים בולטין מן הכותל סביב סביב, וכל
שנה מסדרין שם גזוזטראות לווחין (רש״י, סוכה נא, ב)". Meanwhile the crews lay the planks of the other bays (seen).
The save keeps the bay planked.

### 8.2 The load test (pack `finale`, in the world, about 12 s, no touch)

All crews climb the ladders with stone baskets on the shoulder and spread along the gallery. The camera travels along
the south side, then the north, then the east wing, stopping two seconds at each of his three bays:
- `bayGrade = 'perfect'`: silence; the workers stamp a foot and grin; quick gold flash on the bay.
- `'creak'`: a creak, the plank sinks a finger, two workers step aside, a third pushes a prop (סמוכה) up under the
  beam. No penalty: this is the work's result. The prop stays (`st.props[lv] = 1`) and is drawn from then on. A line
  names the reason in plain words, for example "כאן יש כפיס תחת הקורה" or "העמוד הזה עומד על טריזים".
- three perfect bays: the director's full-screen gold "מושלם!" (rule 60).

### 8.3 The film "ליל שמחת בית השואבה" (`film.js`, about 45–50 s)

The owner: "הסרטון חייב להיות באיכות מעולה וסיפורי. שלא יהיה כמו אנימציית המשחק." This is the piece he will judge
alone, on its own link. It is rendered in our engine, in our world, but **directed as a film**. The rules of the film:

- Letterbox: black bars top and bottom (2.35:1). The whole HUD is hidden (every `.gm-*`, the director's UI, cubes,
  pills, markers, compass). No popups, no score, no game sounds.
- Night. A reversible night rig: sun and hemisphere down to a deep blue near-dark, dark fog for depth, a night sky with
  stars. On end or skip the day rig is restored exactly (test: the scene's light values before and after are equal).
- Firelight only. Four tall golden candelabra in the court (their number and height are illustration), each with four
  golden bowls at its top (Sukkah 5:2). Flames: layered additive sprites with their own noise (no two flames in
  phase), and warm point lights that flicker by noise. At most six point lights in all; no shadows from them.
  The candelabrum must look like what it is (a tall gold shaft on a stepped base, a crown of four bowls): build it
  well, lathe geometry, metal that catches the fire.
- People are **silhouettes** against fire and lit stone: the crews' figures with an unlit near-black material for the
  film. No face is ever close. No T-pose, no two figures moving in step. Dancers get procedural dance: each his own
  tempo and phase, a sequence of four or five poses (torch high, turn, leap, bow) blended, never a short loop.
  Each torch is a bright point with a fading ribbon behind it, so the torches **draw arcs of light in the dark**: this
  is the film's signature picture. The women on the gallery: still silhouettes with a slight sway, long garments.
- Camera: only slow, eased moves (dolly, crane), 5–8 s a shot, no orbit, no shake. Shots change by a dip to black
  (400–600 ms).
- Words: lines of the Mishnah as film titles, not the game's line pill: a Hebrew serif (the game's inlined serif if
  there is one; else `"Frank Ruhl Libre", "David", "Times New Roman", serif`), centred low inside the picture, fading
  in 600 ms, holding, fading out; the source smaller beneath. First card inside the upper bar: "הצצה קדימה · ליל
  שמחת בית השואבה". The altar and the Heichal are not built at this stage: the camera never shows them lit; the west
  stays dark.
- Sound: its own track through the game's audio (respect mute): planks knocking; fire; a low frame drum, slow; a
  long reed-flute line (illustration); a crowd's murmur that swells in shots 4–6; no fanfare.
- Skip: hold anywhere for one second (a faint "החזק לדילוג" after three seconds). Everything is restored cleanly.
- It plays after the load test in the stage, and alone on its own page (`only=film`: the world set as the finished
  stage, the film, then "הקש לצפייה חוזרת").

The seven shots (camera numbers are a first setting; frame by eye from stills):

| # | seconds | picture | line |
|---|---|---|---|
| 1 | 2 + 5 | Black; planks knock four times (the planks' own click). Then barely light: workers' silhouettes lay the last planks on the south gallery against the deep blue sky. Low camera about (73, 7.5, 30) looking up to (62, 17.4, 62.5), slow push in. | "במוצאי יום טוב הראשון של חג ירדו לעזרת נשים ומתקנין שם תקון גדול" (סוכה ה, ב) |
| 2 | 6 | Close on a golden bowl at a candelabrum's head. A silhouette arm with a brand reaches from a ladder; the fire catches; the light grows out across the stone (light range 5 → 140 over 3 s). | "ומנורות של זהב היו שם וארבעה ספלים של זהב בראשיהן" (סוכה ה, ב) |
| 3 | 7 | The light finds what he built. Dolly along the south side, about (86, 12, 50) → (60, 12, 50), looking at the gallery: the firelight climbs **his** column `S2` and his beam (with their wedges, shim or prop if he left them), and above them the gallery full of silhouettes. | none |
| 4 | 7 | Below. Low camera about (73, 7.6, −6) looking south: dancers' silhouettes between the camera and the fire, torches drawing arcs. | "חסידים ואנשי מעשה היו מרקדים לפניהם באבוקות של אור שבידיהן" (סוכה ה, ד) |
| 5 | 6 | From above: the eye of one who stands on the gallery, about (62.5, 19.2, 61) looking down north; the railing dark and near at the bottom of the frame, two shoulders at the frame's edges, the fire and the dancers below. | "שהנשים רואות מלמעלן, והאנשים מלמטן" (מדות ב, ה) |
| 6 | 8 | Jerusalem. The camera rises over the court and looks south-west over the dark city (`src/city.js`: the Lower City and the Upper City); courtyard after courtyard lights up in a wave spreading from the Mount (warm sprites on the houses, not lights). | "ולא הייתה חצר בירושלים שאינה מאירה מאור בית השואבה" (סוכה ה, ג) |
| 7 | 6 + 2.5 | The glowing court from high, held. The last line, larger. Then a slow dissolve to morning at the site. | "כל מי שלא ראה שמחת בית השואבה לא ראה שמחה מימיו" (סוכה ה, א) |

After the film: morning at the site, the built court behind a small card (rule 19): "עזרת הנשים נבנתה", sub-line
"והקיפוה כצוצרה, שהנשים רואות מלמעלן, והאנשים מלמטן (מדות ב, ה)". Stage 06 opens when it exists; until then the
game goes on as after stage 04 today.

## 9. The pack, the world, the game

**`pack.js`** (`makePack05`): `id: 'nashim'`, `key: 'h120'`, `name: 'עזרת הנשים'`, `icon: '🏛'`, `PLAN`, `create`,
`ACTS`, `crews` (as the other packs set them), `sync` (the chambers' walls rise in the crews' hands with `M.shown`,
through the stage's courses as h113 does for the gate houses), `unitEnd` (a bay closed when its beam is seated:
title "מפתח נסגר בגזוזטרא", sub "מהודר" or "כשר"), `before` films: the opening (rule 3: the whole Mount from high,
down to the bare court; "וחלקה היתה בראשונה (מדות ב, ה)", then "והתקינו שיהו נשים יושבות מלמעלה ואנשים מלמטה
(סוכה נא, ב)"; short and skippable the second time), `finale` (8.2 then 8.3), `endTitle: 'עזרת הנשים נבנתה!'`,
`endSub: 'עזרת הנשים היתה ארך מאה ושלשים וחמש על רוחב מאה ושלשים וחמש (מדות ב, ה)'`.

**`world.js`** (`SH5`): everything of the stage drawn from the save on a beat, as h113's `ensureWorld`:
- the ten columns in their states (on the cradle, rising in a crew's hands with shear legs and ropes, standing with
  lean, wedges, chip, crack), the fourteen beams (stock, on trestles, carried, seated, with shim), corbels, joists,
  planks, railing, ladders, props;
- the yard: trestles, the beam stock, the offcut heap, the heap of short beams, a pair of sawyers who really cut (the
  beam under their saw is cut through, drops, and a new one is carried in), tools on a bench;
- the chamber: the rock basin, steps, rod, hollows with clay plugs, the trough, jars, lime pit, the plasterers working
  the basin's walls with trowel and hawk; the channels and the water from the save;
- the site: scaffolds on the chambers' walls, stone piles, the sledges and the ox cart on their lane through the east
  gate, the crews' column gangs, the joist layers who follow each seated beam;
- the crews' schedule from `crewUnits(nDone)`; a crew column rises in view when its turn comes (the same rig as his,
  smaller cast), never pops;
- the goal chip in the top cubes: "מפתחים n/14" (seated main beams), and the stock of columns and beams.
Performance: instance planks, joists and corbels; no more figures at once than stage 04 uses.

**The finished model (`src/temple.js`, marked block).** Today's `nashim` block draws a bracket gallery on the north
and south only, at y 19.2, and a built pool in the lepers' chamber. Both are replaced by this stage's design in one
geometry source (export the layout from `h120/model.js` or a small shared pure file; do not copy numbers): the gallery
on three sides on its ten columns with floor at y 17.4, and the rock basin. Put the new gallery and the basin in their
own build set so the h120 world can hide them and draw the player's own version (his columns with their flaws, his
shims, his channels, his water level) while and after he plays; where there is no h120 save (an old save that finished
the stage, the opening's finished House, phases B and C) the model's own shows. Never both at once, never the old
bracket gallery or the old pool.

**`src/game/index.js`** (marked blocks, mirror the h113 ones exactly): `H20_ONLY` for
`['col', 'saw', 'carry', 'mikveh', 'planks', 'load', 'film']`; `H20_FULL` for `window.__H120_FULL` or `stage=5`;
`h20Make / h20Begin / h20Done / h20Only` (a stage-05 page: the Mount, the wall, the soreg and the gates stand done,
quietly); `h13Done` calls `h20Begin()`; the reload path (the line that calls `h13Begin` when the soreg is done) gets
its stage-05 sibling. The old flow of this stage (the legacy minigames, the paid finish steps of the old `nashim`)
must not show when the director owns the stage, exactly as for `gates`. `only=load` runs 8.1's result state then 8.2;
`only=film` runs 8.3 alone.

**Rule 64 in the list.** Add to `docs/specs/klalim-he.md` a new section "י. מה שנקבע ב-11.11 (באישור שלב 05)" with
rule 64 in the table's format: "⭐ **דופמין מהיר לכל צעד מושלם:** בתוך עשירית שנייה: הבזק זהב על החפץ עצמו, צליל,
המילה "מושלם!" שקופצת מהמקום, והרצף עולה. בנוסף למסך המלא שבסוף עבודה מושלמת. (11.11)" · how to check: "משחקים צעד
מושלם בכל תחנה: ארבע התגובות באותו רגע". (Already done by the reviewer if you find it there.)

**Free work on the chambers' walls (P2).** The owner said yes to building the chambers' walls in stage 02's bond game
("הנדבך בקשר", `src/game/h111/bond.js`). Offer it as free works on the four chambers' walls **only if** the bond act
can be pointed at another wall through a small adapter. If it needs more than about 150 lines or changes to h111's
behaviour in stage 02, do not hack it: report what it would take.

## 10. Tests, the bot, the pages

- `test/h120-model.test.mjs`, at least forty tests: the plan and what is open in every order of play; `LV` equals the
  spec's table; `spanTrue` and the chain; `fitOf` at its exact boundaries (half a finger; a tefach inclusive); the
  column (no brake → it falls; a firm press stops within 2°; a press held from the start → it cannot rise; the save
  windows of §4 per level; two sharp pulls at level 3; the drop below and above 45°); the saw (a bind when he drives
  against the return; skew from wander; the tear without the prop; 8 / 9 strokes when played well); the beam (length
  kept; the rear inside the front's path; each obstacle class); the water (downhill runs; a rise stops it; a deepened
  rise passes; standing water held by the brim; a vessel on the path; the fifth finger cracks; the outlet low, exact,
  high; the lime pit); 40 seah = half an amah in the basin; `bayGrade`; `crewUnits` invariants; `M.done` defaults.
- `tools/h109bot.js`: players for `col`, `saw`, `carry`, `mikveh`, `planks`, reading each act's `dbg()` (give screen
  points of every grip, the phase, and the numbers the bot needs), by touch and by mouse. And wrong play on purpose
  through `window.__BOT.bad`: no brake; a fast landing; two sharp pulls; a slack measure; a mark a tefach and a half
  short; no prop at the end of the cut; a scaffold; a jar; the channel through the trough; a fifth finger of depth; the
  overflow into the lime. Each loss must be reachable by the bot and seen in a screenshot.
- Each act: `dbg()` for the probe, `at()` for effects, `close()` that restores everything it changed (camera limits,
  touch-action, hidden figures, lights).
- Pages are made by the reviewer from the build with `window.__H109_ONLY = '<kind>'` / `__H120_FULL`; make sure each
  of `col, saw, carry, mikveh, planks, load, film`, the whole stage (`stage=5`) and the full game start cleanly from a
  fresh save and from a reload in the middle of any act (the act restarts, nothing of the world is lost).

## 11. Sources (the only claims the game may make in this stage)

| claim | source | wording to use |
|---|---|---|
| the court's size | מדות ב, ה | "עזרת הנשים היתה ארך מאה ושלשים וחמש על רוחב מאה ושלשים וחמש" |
| four unroofed chambers | מדות ב, ה | "וארבע לשכות היו בארבע מקצועותיה, של ארבעים ארבעים אמה. ולא היו מקורות" |
| the gallery and why | מדות ב, ה | "וחלקה היתה בראשונה, והקיפוה כצוצרה, שהנשים רואות מלמעלן, והאנשים מלמטן, כדי שלא יהו מעורבין" |
| the great amendment | סוכה נא, ב | "והתקינו שיהו נשים יושבות מלמעלה ואנשים מלמטה" |
| galleries on three sides | תוספתא סוכה ד, א | "גזוזטראות בעזרה כנגד שלש רוחות" (which three: illustration) |
| corbels and yearly planks | רש״י, סוכה נא, ב | "נתנו זיזין בכתלים בולטין מן הכותל סביב סביב, וכל שנה מסדרין שם גזוזטראות לווחין" |
| a column of one stone | יוסף בן מתתיהו, מלחמת היהודים ה, ה, ב | "וכל אחד מהם היה אבן אחת, שיש לבן" (said of the outer porticoes; a 10-amah column here: illustration) |
| the carpenter's tools | ישעיהו מד, יג | "חרש עצים נטה קו, יתארהו בשרד" (tools only) |
| the mikveh | נגעים יד, ח | "והמצרע טבל בלשכת המצרעים" |
| its measure | עירובין ד, ב | "אמה על אמה ברום שלש אמות. ושיערו חכמים מי מקוה ארבעים סאה" |
| water through a vessel | מקוואות ד, א | "המניח כלים תחת הצנור" (the Mishnah disqualifies; say it in our words with the reference) |
| the festival | סוכה ה, א–ד | the five lines in the film's table, verbatim |

Not verified, **must not appear on screen yet**: the cracked column in the Russian Compound (the knowledge card);
the candelabra's height; the young priests on the ladders with oil jugs; the flute. They may be shown as pictures
without words.

The in-game name is "גזוזטרא"; the Mishnah's "כצוצרה" appears only inside its quotation.

## 12. What to hand back

A short report: what is done and committed (hashes); every place the code departs from this brief and why; what is
still weak, honestly; the final tables you tuned (routes, floor, `A`, windows); every Hebrew string you added; the
`dbg()` fields and the bot's commands; how to run each page; the test count. Screenshots you took stay in the
scratchpad with their paths listed.
