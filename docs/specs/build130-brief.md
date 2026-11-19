# Build 130 — coding brief: the NEW stage 05 "עזרת הנשים"

The owner ordered stage 05 rebuilt from a new brainstorm and approved the new spec on 15.11.2026 ("מאושר. פייבל מפרט מלא
אופוס קידוד.", then "סגור. תתקדם בהתאם."). The approved spec (Hebrew, binding) is `docs/specs/shlav-05-hadash-he.md`:
read it first, whole. Its address table in the repo copy is already corrected to the built world. It replaces the
stage 05 of builds 120 and 124 (`src/game/h120/`). Where this brief and the spec differ on *what the player
experiences*, the spec wins and you report the difference. Where the spec is silent, the brief decides.

Base: the last commit of build 129 on `claude/project-thread-wv5ljp` (I give you the hash when you start). Build number
130. New code in `src/game/h130/`. Scratch under
`/tmp/claude-0/-home-claude/e840bc1a-c767-5ff8-a92a-54650f4e9104/scratchpad/s05n/`.

Three parts, each handed back to me before the next starts:

- **Part 1**: the book (§1), the pure model with its tests (§2), and station 1, the gallery (§3), with the pack and
  the world drawing the gallery from the save (§7). Hand back.
- **Part 2**: station 2, the wood chamber (§4), and station 3, the light (§5). Hand back.
- **Part 3**: the ending (§6), the removal of the old stage 05 (§8), tests, bot, pages (§9). Hand back.

## 0. Ground rules

Everything in `docs/specs/build128-brief.md` §0 holds here word for word, with `h130` for `h128`, "Build 130 (N)" for
the commit titles and the scratch folder above. Mirror the newest packs (`h128`, `h129`). The owner wrote this spec's
chapter "שתי הידיים, המצלמה והדמויות" himself as a demand; it is checked by real touch before delivery, station by
station. The points he repeats:

1. **The left hand walks and works; the right hand lifts the camera, always.** Only three moments use both hands (the
   rope of the column raising, tearing the wick, the ladder). There the right hand works only when it touches the
   thing itself; a touch on empty space is still the camera; before each such moment the camera lifts a little by
   itself.
2. **No button at the side of the screen at any moment**: not a move button, not a work button, not between stations,
   not after the stage's end. Build 128 removed the old right pad for good; do not bring anything back.
3. **Figures only when they work in this work**, tool in hand; otherwise out of the picture. No figure cut by the
   frame's edge, none between the camera and the work, at camera lift 0 and at 0.3. The spec's table "מי בתמונה" is
   the list; nobody else appears. The world's building crews work far off and never enter a station's picture.
4. The kohen is whole and seen, in the left third, never hiding the work. The camera never moves under a finger and
   never cuts in the middle of a touch. The place to reach is always marked (the green mark), and nothing that is
   touched is off screen. At the end of each work the camera pulls back and shows in the world what was done.
5. Rule 65: every place in `BOOK.s05` before the code that reads it. Rule 56: nothing random at play time. No timers,
   no clock, no wind. Loss only from §10.

## 1. The place (`BOOK.s05`, rewritten in an `h130` block; checked against `src/temple.js` and the book)

Kept from the built world as they are: `court` (x 6…141, z ±67.5, floor 6), `runs` (N and S lines z ∓62.5, x 46…101;
EN and ES line x 136, z −27.5…−13 and 13…27.5), `ladders` (N and S at x 47.4 and 99.6, feet z ∓60.2; E at (133.8,
−14.6) and (133.8, 26)), `walls`, `chambers` (wood x 103…141, z −67.5…−29.5, door x 117…125 on z −29.5; oils x 6…44,
z 29.5…67.5, door x 22…30 on z 29.5), `mik` (the basin stays built, no station), `rig.3` and `stands.col3`
((131.7, −2.4), post (132.6, −3.5)) for the one column raising, `brokeAt`.

New rows:

| key | value | what |
|---|---|---|
| `gal.stand` | N (73.5, −52), S (73.5, 52), E (126, 0) | the kohen's stands in the puzzle |
| `gal.torch` | (73.5, 0), (40, 0), (107, 0) | the torch bearer's three stops |
| `gal.watch` | z −65 (N), z 65 (S), x 139 (E); the other coordinate per level from the model's table | the spectators below, by the wall |
| `gal.sleds` | by each stand, four amot toward the court | where the columns wait on their sledges |
| `gal.seat` | the last seat of each run, on the gallery's floor | the camera's seat for the test from above |
| `wood.trestles` | (121, −46) | the two trestles |
| `wood.stand` | (118, −43) | the kohen |
| `wood.second` | (124, −50) | the second kohen who checks a log of his own |
| `wood.clean` | (128, −44) | the clean pile |
| `wood.out` | (112, −58) | the rejects |
| `light.menorah` | (73.5, 24), 50 amot high, four bowls at its head | the golden menorah (its place: המחשה). NOT on the court's axis: z 0 is stage 06's sledge lane |
| `light.ladders` | four, their feet 6 amot from the menorah to NE, NW, SE, SW | the four ladders |
| `light.practice` | the S gallery ladder at (99.6, 60.2) and a clay bowl on the gallery floor above it | level 1 |
| `light.measures` | (26, 31.5) | the Temple's measures in the door of Beit Shemanya |
| `light.wicks` | (30, 24) | the wicks table |
| `eve.cam` | the rise over the wall, the look over the city, the descent | the ending's cameras |
| `cam.*` | every stand view, lifted view and test view | |

Out of the book with their minigames, no leftovers: `yard`, `carry`, `way`, `startZ`, `lime`, the `saw*`, `carry*`,
`planks` and `mikveh*` stands, `rig.1`, `rig.2`, `vessels`, `mikWays` and the film's places. The world's site crews
(`scaff`, `piles`, `lane`, `laneCrew`) are re-planned: no scaffold, pile or lane end at the wood chamber or its door
(today the lane ends at (121, −29.2) and a scaffold and the lime pit stand beside that door); move them to the walls
of the Nazirites' and the lepers' chambers and say where.

If a row cannot be built as written, the built world decides: move it as little as possible, write the reason in the
book entry and report it.

## 2. The model (`h130/model.js`, pure, tested in `test/h130-model.test.mjs`)

Ten works: `gal1, gal2, gal3, wood1, wood2, wood3, light1, light2, light3, eve`. `gal` in order; `wood` free at any
time; `light` opens when `gal3` is done (level 1 uses the gallery's ladder and floor); `eve` follows `light3` at once.

**Gallery**

- A run is a line with two ends that carry a beam (the chambers' walls, or the gate's jamb). Columns stand on the
  line; `spans(run, cols)` gives the gaps including the two end gaps. A gap up to 12 is straight; 12 to 14 sags
  (kosher, fewer points, the sag stays); over 14 cracks (`gal.beam`, −20, a rough prop stays under it).
- A column may not stand within 1.5 of a ladder's foot, nor in the gate's passage, nor where it hides the torch:
  `hides(col, watcher, torch)` is true when the line from a spectator to the torch passes within 1.2 of the column's
  middle.
- `LEVELS`: per level the run, the number of columns in stock, the spectators' places and the torch's stops. Fixed
  tables, tuned so that (a) the even spacing fails, (b) a solution with the least number of columns exists and its
  slack is between 1.5 and 3 amot, (c) one more column makes it easy but loses "מהודר", (d) no spectator-to-torch line
  passes within 2 of the menorah. A seed to start from, for level 1 (north run, four columns in stock plus one spare,
  torch at (73.5, 0)): spectators at x 57 and 84. Level 2 (south): four plus one, three spectators, three torch
  stops, two ladders. Level 3 (east): one column per segment, the passage z −13…13 free, the ladder at (133.8, −14.6)
  close; the last column is raised by ropes.
- `testBelow(cols, level)` and `testAbove(cols, level)`: who loses the torch behind which column, and which seat row
  a sagging beam lowers so that the railing cuts the torch.
- The raising: the model of `h120` for the column on the ropes, kept as it is (`gal.column`, −40, the halves stay at
  `brokeAt`).

**Wood**

- A log: length, girth, a fixed table of worm holes (angle, place along), bark patches, and at most one hollow
  stretch. `rollStep`, `tapAt(log, s)` (deep and still, or hollow: the log trembles there and dust falls),
  `peelAt(log, s, angle)`, `decide(log, clean|out)`, and in level 3 `cutAt(log, s)`: a cut 0.3 to 1.2 beyond the
  hollow's end is right; nearer leaves the worm (`wood.worm`, −20); farther wastes good wood (fewer points).
- Level tables fixed: level 1 six logs, holes seen after rolling; level 2 eight logs, the worm under the bark, only
  the tap tells where to peel; level 3 six big logs, some with one bad end.
- A wormy log in the clean pile is found when it is split: `wood.worm`, −20, and the pile comes back to be checked.
  A good log thrown out is missing from the stock (fewer points, seen in the pile's size).

**Light**

- `wickStep`: the strip's width is the choice (thick: strong light that drinks the oil fast; thin: weak light that
  lasts); a pull sharper than the limit tears it (start again, no loss).
- `measure(pours)`: the seven measures of מנחות ט, ב. A hin is twelve log (מנחות פט ע"א), so thirty log in the least
  number of pours is hin, hin, half hin: three pours give "מהודר". Over thirty overflows on the floor (no loss; pour
  back and try again).
- `climbStep(state, hand, t)`: rungs one amah apart; the jar on the shoulder is a pendulum (period about 1.4 s) that
  each hand move pushes, late. Lifting a hand while the jar leans to that hand's side spills oil in proportion; a
  lean past the limit drops the jar (`light.jar`, −20, an oil stain stays on the floor, and the boy goes down for a
  new jar). The boy never falls. A hand lifted as the jar passes the middle going away is the perfect step. With both
  hands holding and the jar quiet the right hand is free: an empty-space drag lifts the camera.
- `pourStep`: tilt slowly into the bowl; oil poured outside is lost. `lightOf(bowls, wicks)`: how strong and how long
  each flame burns, and how far the light reaches in the ending.

Tests: every function, the level tables' conditions (a)–(d), the loss flags, the face, the save's round trip, an old
save (see §8).

## 3. Station 1 — הגזוזטרא (`gallery.js`: three works)

- **The opening** (once, a minute, no loss): the court smooth and empty. "איפה יעמוד כל קהל?" The left hand draws a
  line on the floor that parts the court into inside and outside; a simply drawn crowd comes in and mixes at the gate
  and the passages. Turn it over: the same. The kohen lifts his head to the wall: "ואם נעלה קומה?" On screen
  "(המחשה)". The crowd leaves when the showing ends.
- **The puzzle**: the columns wait on sledges by the kohen. Drag a column to a place on the marked line; it comes
  late, like a heavy thing. Over every gap the beam that will lie there shows at once: straight, sagging, or cracking
  with a sound. The right hand lifts the camera to see the whole run; play goes on lifted.
- **The live test**: tap the torch bearer. The crew stands the columns and beams where the player chose, then the
  camera stands in each spectator's place in turn while the torch bearer walks; a column that hides the torch blinks,
  and the player may drag it and test again, with no loss. Then the camera sits in the last seat above: a sagging
  beam lowers the seat row and the railing cuts the torch. No sight lines are drawn beforehand.
- **Level 3's peak**: the last column is raised on the ropes exactly as in builds 120 and 124: take that act from
  `h120` as it is, with its rule 66 behaviour from build 124.
- Quick: a gold flash and a sound on every column that comes to a good place. A perfect test (no torch lost, no sag,
  the least number of columns) gets the full screen.
- What stays: the gallery is built on the columns where the player put them, and stays so for the rest of the game.
- On screen: מידות ב, ה and סוכה נא ע"ב, copied from the spec.

## 4. Station 2 — לשכת העצים (`wood.js`: three works)

The log lies big in the middle of the screen on two trestles. All with the left hand: a drag along the log rolls it
(a whole turn, both ways); a short touch taps it; a drag across peels a strip of bark; a drag of the log to the right
sends it to the clean pile, to the left out. In level 3 a touch marks the cut line and the crew saws there. The game
must be playable without sound: a hollow place trembles to the eye and dust falls. The right hand is the camera only.
In the picture: the kohen, and one more kohen checking a log of his own. On a level with no mistake: the full
screen, and the kohen in charge carries the clean pile toward the altar's wood. On screen: מידות ב, ה.

## 5. Station 3 — חמישים אמה של אור (`light.js`: three works)

1. **The wick**: the left hand holds the worn garment, the right pulls one unbroken strip.
2. **The oil** (from level 2): at the door of Beit Shemanya, tilt a measure into the jar with the left hand. The
   measures' names on screen exactly as in the Mishnah: הין, חצי ההין, שלישית ההין, רביעית ההין, לג, חצי לג,
   רביעית לג.
3. **The ladder**: the left thumb is the boy's left hand, the right thumb his right. The camera lifts a little by
   itself before the climb. Mouse: the left and right buttons are the two hands (say so in the report).
4. **Pour and light**: tilt the jar into the golden bowl with the left hand, lay the wick, light it.

Level 1: the gallery's short ladder, a half jar, a clay bowl on the gallery. Level 2: the menorah, the whole ladder,
the full jar that was measured, one bowl. Level 3: the four bowls; three other boys really climb the other three
ladders beside the player. Quick: a rising note on every rung taken in time. The hand that reaches the last rung and
the flame that rises: the full screen. On screen: סוכה ה, ב–ג and סוכה נב ע"ב, copied from the spec; Beit Shemanya's
card says Abba Shaul's reading and that R. Eliezer ben Yaakov said "שכחתי מה היתה משמשת".

## 6. The ending — `eve` (no film; all in the game, right after the fourth bowl)

Evening falls on the world. The flames rise and the camera rises with them over the wall. The courtyards of
Jerusalem (the city of `src/city.js`) light up one by one; how far the light reaches follows `lightOf`. The camera
comes down: men with torches below, women above in the gallery the player built. A column that was badly placed
throws a long shadow across the court. A small card with the score, the world behind it. From here on the menorah
burns in every night the game shows. On screen: "ולא היתה חצר בירושלים שאינה מאירה מאור בית השואבה (סוכה ה, ג)" and
"מבט קדימה אל שמחת בית השואבה (המחשה)". No Levites on the fifteen steps: they are built in stage 06.

## 7. The pack, the world, the game

As h128/h129. The world draws the gallery from the save: columns at the player's places, beams with their sag or
prop, corbels, floor, railing, seats, ladders; the model's own gallery (`temple.js` set `nashim-gz`, fixed places)
stays hidden while the world draws the player's, also in every later stage. The menorah, its ladders, the trestles
and piles, the measures and the wicks table are the stage's things and stay after it. Page flags: `__H130_FULL`,
`__H109_ONLY` kinds `gallery`, `wood`, `light`, `eve`.

## 8. The old stage 05 goes out, with no leftovers

Out: sawing, carrying the beam, the planks, the separate load test, the mikveh station, the film (`film.js`,
`filmsound.js`) and every table, string, sound, bot player, test and page flag that belongs only to them. Kept: the
column raising (moved into `h130`), the basin in the lepers' chamber as a built thing with its water, the gallery's
drawing code where it serves the new save. When nothing reads `src/game/h120/` any more, delete the folder; keep
`temple.js`'s marked blocks that build the model. Old saves: a save whose old stage 05 was finished gets the new
stage as "built by the crews" (default column places 57, 68, 79, 90 on N and S and the two east columns, no points,
every station open to play); a save in the middle of the old stage 05 starts the new one from its beginning. Later
stages' progress is never lost. A test covers both.

## 9. Tests, the bot, the pages

As §10 of the 128 brief. The bot learns the four kinds and plays the whole stage by touch with no mistake and once
per damage of §10; reload in the middle of every work; rule 66's four gesture checks in every station; the figures
check (one screenshot at lift 0 and one at 0.3 per work, none cut, idle or in the way); the walk between stations and
after the stage's end with no side button; stages 04 and 06 replayed after the change (the gallery and the menorah
stand in stage 06's pictures now: its opening shots and the sledge lane must be clear). Pages: the full game, stage
05 whole, one per station and the ending.

## 10. The loss table

| flag | what stays in the world | points |
|---|---|---|
| `gal.beam` | a cracked beam with a rough prop under it | −20 |
| `gal.column` | the fallen column's halves by the gate | −40 |
| `wood.worm` | the split log with the worm in it; the pile goes back to be checked | −20 |
| `light.jar` | a broken jar and an oil stain on the floor | −20 |

Never below zero. A sagging beam, a torn strip, spilled oil, a good log thrown out and a wasteful cut cost stars or
light, not points off.

## 11. Sources

Copy every quotation from `docs/specs/shlav-05-hadash-he.md` and nowhere else: מידות ב, ה; סוכה ה, ב–ד; סוכה נא ע"ב;
סוכה נב ע"ב; מנחות ט, ב ("שבע מדות של לח היו במקדש. הין, וחצי ההין, ושלישית ההין, ורביעית ההין, לג, וחצי לג, ורביעית
לג"). A hin of twelve log: מנחות פט ע"א. Everything in the spec's list "מסומן המחשה" is marked "(המחשה)" wherever the
game says it in words.

## 12. What to hand back (after each part)

As §13 of the 128 brief, plus a section "hands, camera, figures" with the screenshot folder for each station.
