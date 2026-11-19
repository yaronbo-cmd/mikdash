# Build 129 — coding brief: stage 07 "הלשכות"

The owner approved the spec on 14.11.2026 21:12 UTC ("סיכום שלב 7 מאושר. תשתמש בציורים יפים תנצל אותם איפה שאפשר.").
The approved spec (Hebrew, binding) is `docs/specs/shlav-07-he.md`: read it first, whole. It was written after a
brainstorm with two outside models and replaces every older idea for this stage (the old draft of 13.11 is dead). Its
address table in the repo copy is already corrected to the built world. This brief turns the spec into code decisions.
Where the brief and the spec differ on *what the player experiences*, the spec wins and you report the difference.
Where the spec is silent, the brief decides. The 66 standing rules are in `docs/specs/klalim-he.md`.

Base: the last commit of build 128 on branch `claude/project-thread-wv5ljp` (I give you the hash when you start). Build
number 129. New code in `src/game/h129/`. Scratch under
`/tmp/claude-0/-home-claude/e840bc1a-c767-5ff8-a92a-54650f4e9104/scratchpad/s07/`.

Three parts, each handed back to me before the next starts:

- **Part 1**: the address book (§1), the pure model with its tests (§2), and the **water look sample** (§3). Stop and
  hand back. The owner was promised to see the bucket and the channel on his tablet before the water look is coded
  into the game.
- **Part 2**: the Gazit (§4), the vault (§6), the night ending (§7), the pack and the world (§8). Stop and hand back.
- **Part 3**: the Golah (§5) with the approved water look, the tests, bot and pages (§9). Hand back.

## 0. Ground rules

Everything in `docs/specs/build128-brief.md` §0 holds here word for word, with `h129` for `h128`, `s07` for `s06`,
`BOOK.s07` for `BOOK.s06`, "Build 129 (N)" for the commit titles, and the scratch folder above. Mirror
`src/game/h128/` (stage 06, the newest pack) and `src/game/h120/` (stage 05): pure `model.js`, `world.js`, one acts
file per station, `pack.js`, its own sound file. Read both packs whole before writing. The points that are broken
most often, again:

1. **Rule 65, the book first.** No file of `h129` types a world place. §1 goes into `BOOK.s07` (marked `h129` block
   in `src/game/world/grid.js`) before any code that uses it; `h129` joins the scan of `test/h126-nobook.test.mjs`
   with an allow list that holds no place; `docs/specs/sefer-ktovot-he.md` is regenerated.
2. **Rule 66, the right hand.** Every act has `wants(p)` and `holds()`. A right-half touch belongs to the act only
   when it starts on one of the act's own grips; any other right-half drag lifts the camera, and play goes on while
   it is a little lifted. Where both thumbs are busy by design (the arch's legs, the marble slab), the act lifts the
   camera a little by itself before that moment.
3. No timers, no fail state, no drawn gauges, no side buttons. The rope and the joints are the gauges.
4. Loss only from §10's table, through `X.loss`, each one visible in the world and kept in the save.
5. Figures whole, tool in hand, really working; none sinks into a floor (floors here are at 6 and at 16: take the
   height from the book, never from the Mount's ground).
6. Nothing random at play time; every table fixed or seeded by the save (rule 56).
7. No leftovers: the old `lishka` minigame, moment and story pages must not open when `h129` runs the stage. Do as
   `h128` did for `nikanor`, and say what you switched.
8. Never two probes at once (`pgrep -fa probe109`). Commit trailer exactly as in the 128 brief. Push after every
   commit to `claude/project-thread-wv5ljp` only.

## 0a. The concept pictures (reference only)

`/mnt/project-files/mikdash/brainstorm/shlav-07/ezra/` holds four concept pictures made by outside models and a
README that says what is right and wrong in each. The owner asked to use them where possible: take from them the
**direction of the look** (the timber centering with its wedges and the readable joints; the wheel with two buckets,
the drip, the sluice stones and the troughs; firelight on the vault). They are not sources, they hold mistakes (listed
in the spec under each picture), and no picture file goes into the repo or the game. The game keeps its own style and
the built world's sizes.

## 1. The place (all into `BOOK.s07` first; every row was checked against `src/temple.js`, `src/places.js` and BOOK)

World stage id `lishka`. `+x` east, `+z` south. Heights: the Azarah floor and the chambers' floors 16; the women's
court 6; the Israel court 13.5.

| key | value | what | source |
|---|---|---|---|
| `bounds` | x −185…30, z −90…90 | where the stage plays | |
| `gazit.block` | [−100, 58, −62, 82] | the built block (`temple.js`: `box('ash', -100, 6, 58, -62, 28, 82)`) | מידות ה, ד |
| `gazit.in` | [−99, 59, −63, 81], floor 16 | the room inside 1-amah walls | המחשה |
| `gazit.holy` | z 70.5 | the holy line: mid-line of the Azarah's south wall (built z 67.5…73.5) | יומא כה ע"א; the line's place המחשה |
| `gazit.chol` | z 70.5…81 (depth 10.5) | where all sitting must fit | |
| `gazit.row0` | z 79, stone centres x −92.5, −88.5, −84.5, −80.5, −76.5, −72.5, −68.5 | the opening straight row; a stone is 4 × 1.5, 1.2 high | המחשה |
| `gazit.door` | (−63, 76), crowd at (−65, 76) | the door in the east wall, chol half; "הקהל" stands there | המחשה |
| `gazit.wait` | (−81, 66) | where the judges wait standing before a test (holy half) | המחשה |
| `gazit.stand` | (−81, 72, 16), facing south | the kohen's stand | |
| `golah.room` | [−147, 58, −131, 74], floor 16 | the new chamber; free ground between the Delek gate house (x −169…−151) and Bechorot (x −127…−109); crosses the south wall as the Gazit does | מידות ה, ד; the place המחשה |
| `golah.well` | (−139, 65), shaft radius 2.5, rim 0.8 high | the well's mouth | |
| `golah.wheel` | (−139, 65), axle 5 above the floor, along x | the wheel | מידות ה, ד; its form המחשה |
| `golah.depth` | [10, 20, 30] | water below the floor, per level | המחשה |
| `golah.head` | (−139, 60) | the trough by the well, the channel's head | המחשה |
| `golah.channel` | (−139, 60) → (−139, 52) → east along z 52 to (−111, 52); spurs south→north from z 52 to z 50 at x −139, −125, −111 | the channel in the floor, 0.5 wide | המחשה |
| `golah.troughs` | A (−139, 50), B (−125, 50), C (−111, 50) on the Azarah floor 16 | the three troughs; free floor (the Heichal's wall is z 35) | המחשה |
| `golah.sluice` | at each spur's mouth: (−139, 52), (−125, 52), (−111, 52) | the sluice stones | המחשה |
| `golah.stand` | (−139, 69, 16), facing north | the kohen's stand | |
| `vault.N` | opening (8, −20): arch z −23…−17 in the east face (x 8) of the built block x 0…8, z −26…−14; floor 6, springing 9.5, crown's underside 12.5, top 13.5 (the Israel floor); 7 stones | the north instruments chamber | מידות ב, ו; sizes המחשה |
| `vault.S` | opening (8, 20): arch z 17…23, same heights; 9 stones; the south leg (z 23) stands on rock | the south instruments chamber | מידות ב, ו; sizes המחשה |
| `vault.standN/S` | inside the chamber, (3, ∓20, 6), facing east (the arch against the sunlit court) | the kohen's stands | |
| `vault.M` | hall x −177…−143, z −82…−59, floor 16; barrel axis east–west, span 25 (legs on the walls z −83…−82 and −59…−58), springing 30.2, radius 12.5; rings 3 deep, 12 rings from x −142 west; ring 1 = x −142…−139, 11 stones | Beit HaMoked's great vault | מידות א, ח; "כיפה" drawn as a barrel vault המחשה |
| `vault.deck` | y 29, the scaffold deck under ring 1; stand (−146, −70.5, 29) facing east | the kohen's stand in the great vault | המחשה |
| `night.hearth` | (−160, −70.5, 16) | built (`buildMoked`) | שבת א, יא |
| `night.slab` | (−160, −76, 16), 1 × 1 | built with its ring; toward the Chel door | מידות א, ט |
| `night.door` | (−160, −58) to the Azarah; (−160, −83) to the Chel | built | מידות א, ז |
| `night.ledges` | the built ledges of `buildMoked` (six boxes) | where the elders lie | מידות א, ח |
| `night.gates` | `BOOK.s04.entries` of kind `gate` (six gates and Nicanor) | the gates that lock, read from the book, never retyped | מידות א, ד |
| `night.levi` | (−160, −86, 6) | the Levite who sleeps outside | מידות א, ט |
| `cam.*` | every camera (stand views, lifted views, the locking flight, the last three pictures) | as `BOOK.s06.cam` | |

The reading of the two blocks that flank Nicanor (the brainstorm thread agreed): the lower storey, open to the women's
court, is the instruments chamber (מידות ב, ו); the upper storey, on the Israel court's level, is Nicanor's two
chambers (מידות א, ד). The split into storeys is המחשה and is said so in the book entry.

If a row cannot be built as written (something stands there that I missed), the built world decides: move the row as
little as possible, write the reason in the book entry and report it.

## 2. The model (`h129/model.js`, pure, tested in `test/h129-model.test.mjs`)

Ten works: `gazit1, gazit2, gazit3, golah1, golah2, golah3, vaultN, vaultS, vaultM, night`. The three stations are
free among themselves; inside a station the works go in order; `night` opens after the nine. `faceOf(save)` as
h128's. Every number below is a start value: tune by playing, keep each table fixed, and report the final tables.

**Gazit**

- `stoneStep(st, finger, dt)`: a bench stone follows the finger late (the crew pushes with bars): speed =
  min(3, 2.2 × distance to the finger) amot/s; dragging the stone's middle moves it, dragging an end turns it about
  the other end. A stone stops at walls and at other stones. Hitting one at more than 1.5 amot/s cracks a corner
  (`gazit.crack`, once per stone, kept).
- `benchState(stones)`: per stone `legal` (all four corners in the chol half and inside the room) and per judge
  `sees[j]`: the line from seat i to seat j passes no other seated judge closer than 0.5, and j is within 100° of
  seat i's facing (the stone's inner normal). A stone over the holy line has no judge: he stands beside it.
- `testPlan(stones)`: the three raisers (west end, east end, middle) and for each who turns at once and who leans
  and searches.
- `roomFor(stones, mats, stands)`: mats 12, 10 and 8 long, 1.2 deep; each wholly inside the arc (the polygon of the
  stones' inner faces closed by the holy line), in the chol half, not on a stone, a mat or a stand; each scribe's
  stand (1 × 1) one west and one east of the middle, with a free line to all seven judges.
- `aisles(layout)` and `walkCheck(path, layout, who)`: a walker never steps on a mat that people sit on (he stops at
  its edge and stays standing: a mistake, not a damage); a path closer than 0.6 to a scribe's stand spills the ink
  (`gazit.ink`, the stain stays where it fell); a path that ends within 0.8 of a free place seats him.
- `semichaPlan(save)`: which judge leaves (seeded by the save's play count, never the same twice running) and the
  four moves in order: the head of row 1 to the empty seat on the bench; then each row moves up one place by itself,
  so its free place is at its end ("במקום הראוי לו"); the head of row 2 to the end of row 1; the head of row 3 to the
  end of row 2; one of the crowd at the door to the end of row 3. A man sent before his place is free finds no place
  and stays standing where his path ends.

**Golah**

- Two buckets on one rope over the wheel, rope lines 0.9 either side of the shaft's axis; bucket radius 0.5.
- `fillStep`: holding the rope of the bucket that is in the water fills it 0.5 per second (0…1); weight = 0.3 + f.
- `pullStep(state, t)`: every pull lifts the full bucket `1.5 − 0.5 f` amot, and the empty one goes down the same. The full bucket swings as a pendulum of length L = its depth + 5; period
  T = 0.9 + 0.045 L seconds (so the rhythm quickens as it rises). It starts with amplitude 0.3 + 0.5 f. A pull within
  0.18 T of the bucket's pass through the middle calms it (× 0.75), and within 0.08 T is "perfect"; a pull within
  0.15 T of an end of the swing feeds it (+ 0.25 × weight). Left alone the swing dies in about six seconds. The empty
  bucket swings half as far as the full one.
- Events: amplitude over 1.1 knocks the shaft wall (spills 0.15; over 1.3 it cracks the bucket: `golah.bucket`, the
  bucket drips from then on, 0.02 per second while it hangs full); at the meeting (the two buckets within 0.5 of the
  same height) the sum of the two swings over 0.8 is a clash (spills 0.2; over 1.2 a crack); arriving at the rim with
  amplitude over 0.5 breaks a rim stone (`golah.rim`, once per level, the stone stays broken). A stop at the rim with
  amplitude under 0.2 and nothing spilled is the perfect stop.
- `pourStep` and `flow(sluices, dt)`: the bucket pours f units over 3 f seconds into the head trough; water runs
  6 amot/s down the channel; at each spur an open sluice takes all the water into its trough, a closed one sends it
  on; with every sluice closed the water stands in the channel (nothing is lost). Trough sizes (units of one full
  bucket): level 1: A 2.0; level 2: A 1.5 and C 2.5; level 3: A 1.0, B 2.0, C 1.5. A level is done when each of its
  troughs holds at least 0.9 of its size. A trough filled more than 0.1 over its size overflows (`golah.flood`, once
  per trough: a puddle and a wet stain stay on the Azarah floor). Water that spills back into the well is no damage.

**Vault**

- Part A, `legStep(state, press, dt)`: each leg is pushed outward by thrust T = T0 × (1 − 0.8 × m / M) where m is the
  number of weight stones the crew has laid on that shoulder (one every 3 s, the two sides in turn) and M is 5 in
  `vaultN`; in `vaultS` the rock leg has T = 0 always and the wall leg has M = 8; in `vaultM` M = 9 and T0 is three
  times as strong. The thumb's press p (0…1.4) comes from how far inward the finger is from the leg's grip; the leg
  pushes the grip outward under the finger at a rate that follows T, so the player has to keep re-pressing, less and
  less as the weight goes on. Net push outward over 0.15 T0 for 0.6 s: the leg runs out and the crown sinks (mistake;
  past the limit a joint opens for good: `vault.crack`). Net inward over 0.25 T0: the crown lifts and a joint opens
  (same). When T is under 0.2 T0 on both sides the player lets go slowly: that is the perfect release. The whole part
  lasts about half a minute.
- Part B, `wedgeStep(state, i, side, dx)`: pairs of wedges under the centering (1 pair in `vaultN`, 2 in `vaultS`,
  4 in `vaultM`); a drag moves a wedge at most 0.2 of its way. `joints(state)`: the imbalance at pair i =
  (out_left − out_right) + bias_i, where the bias is a fixed table per work (zero in `vaultN` unless part A left a
  leg displaced; toward the wall side in `vaultS`; four different values in `vaultM`). Over 0.35 the joints by that
  pair open and show a strip of light; over 0.6 the joint stays a crack (`vault.crack`); over 0.85 a stone slips and
  falls on the centering (`vault.stone`: −20, in `vaultM` −40), and the crew lays a replacement of another shade.
  The arch itself never collapses. The cure for light: push the wedge back, touch that shoulder, and the crew lays
  one more weight stone there (bias − 0.15).
- `wedgeLoads(state)` for `vaultM`: each wedge is free (moves easily, gain 1) or loaded (moves hard and creaks,
  gain 0.4); pulling a loaded wedge more than 0.2 jumps the imbalance of its pair. There is always at least one free
  wedge, more than one right order, and the table is fixed. A test plays three different right orders and three
  wrong ones through the model.

**Night**

- `slabStep(state, lift, dt)`: the slab follows the two thumbs late (0.5 amot/s at most). Let go before 0.8: it
  falls back with a bang (no damage; an elder lifts his head). At the end it is lowered: touching down faster than
  0.35 amot/s cracks a corner (`night.slab`, kept).

Tests: every function above, the loss flags, the face (free order of the stations, `night` last), the save's round
trip, and that no table holds a place (the scan).

## 3. The water look sample (part 1)

A page flag `__H129_WATER_LOOK` (as `__H128_SEA_LOOK`): the Golah room without its roof, the well, the wheel with the
two buckets and the wet rope, a full bucket coming up dripping, the pour into the head trough, the water running down
the channel past a raised and a lowered sluice stone, one trough in the Azarah filling and glinting in the golden
light. No play: a loop of about twenty seconds with `seek(t)`, `bench(sec, t0)` and `dbg()` hooks and the fps, draw
calls and triangles overlay, as the sea sample had. What the owner will judge: does the water read as water on a
tablet (surface that moves, a wet dark stain where it ran, drops, a glint), is it fast, does it sit in the world's one
golden light. Start from the best of `h120/water120.js` (the mikveh water of stage 05) and of the sea of stage 06;
do not start a third water from nothing. Hand back the page, ten screenshots along the loop, the numbers at 960×600,
and what you think is still weak.

## 4. Station 1 — לשכת הגזית (`gazit.js`: three works)

The room stands without its roof (the roof rises in the stage's finish): walls, floor at 16, the dark stones of the
holy line across the floor at z 70.5. The camera stands behind the kohen at the stand, looking south at the bench by
the south wall; the lifted view shows the whole bench from above with the holy line and the wall.

- **Drag a stone**: touch its middle and drag: two crew men with bars push it after the finger. **Turn a stone**:
  touch its end and drag. **Sit in a judge's seat**: tap a seated judge: the camera sits in his seat for two seconds
  and sees what he sees. Mouse: the same with one pointer.
- **The live test**: the seven judges wait standing at `gazit.wait` with the head of the court. Tap him: they walk
  to their stones and sit (a judge whose stone is not legal stands beside it), and the three hands go up one after
  the other. Who sees turns his head at once; who does not leans forward and searches. No lines, no numbers. A failed
  test costs nothing but stars; the judges stand up again and the stones are free to move.
- `gazit1`: opens with the test on the straight row, run by the game itself, so the player sees it fail before he
  touches anything. Done when a test passes: every judge sees every other and every stone is legal.
- `gazit2`: the three mats and the two scribes' stands lie rolled and waiting by the door. A mat moves at once under
  the finger and turns by its end. The bench stones stay movable (and can still crack). The test: the students sit
  on the mats, the scribes stand at their stands, each judge raises a hand in turn and each scribe looks at him and
  writes; a scribe who cannot see steps aside and searches. Done when `roomFor` holds and the test passes.
- `gazit3`: one judge rises and leaves by the door. The empty place is always marked (a folded cloak left on the
  seat; on a mat, the cushion). Touch a man and draw his way on the floor; he walks it. Four moves in the model's
  order. Mats stay movable, so a player who packed the rows opens an aisle now.
- Quick words: "רואה!" (a judge who sees all for the first time), "כולם רואים!", "יש מקום!", "כותב!", "במקומו!".
- The moment: one judge raises his hand, all look up at the same instant, the two scribes begin to write.
- On screen at the end of `gazit1` and `gazit2`: the Mishnah's words from §11, with their reference.

## 5. Station 2 — לשכת הגולה (`golah.js`: three works; part 3)

The camera stands behind the kohen at `golah.stand`, looking north over the well to the channel and the Azarah. The
descending rope hangs near the middle of the screen so both thumbs reach it. The lifted view shows the whole channel
and how much water stands in each trough.

- **Fill**: hold a finger on the rope of the bucket that is in the water; the rope goes taut as it fills; let go.
- **Pull**: hand over hand on the descending rope: a short downward drag with the left thumb, then the right, in
  turn (mouse: repeated downward drags). The crew men at the rope pull with the player's hands. The swing is read
  from the rope's angle at the wheel and from the bucket in the shaft (the camera tips down the shaft while the
  bucket is deep).
- **The meeting**: the game does not stop the player; he stops himself and waits for the swing to die.
- **Pour and share**: at the rim, drag the bucket to the head trough and tip it (the drag's depth is the tilt);
  lift or lower a sluice stone by dragging it up or down. Sluice stones in the right half are the act's own grips.
- Quick words: "בקצב!" (perfect pull, with the streak), "חלפו!" (a clean meeting), "בלי טיפה!" (the perfect stop),
  "מלאה!" (a trough full).
- The moment: the troughs full together, the water glinting, a kohen washing his hands in the water that arrived.
- The well, the wheel, the channel and the troughs stay in the world after the station, with the water in them.

## 6. Station 3 — הקמרון עומד לבד (`vault.js`: three works)

In the small chambers the camera is inside the dark chamber looking out east: the arch stands against the sunlit
court, so an open joint shows as a strip of light and a closed one as a dark line. In the great vault the camera
stands on the scaffold deck inside the hall looking east and up at ring 1 against the evening sky. The crew sets the
arch stones on the centering by themselves, with tools in hand, while the player walks up; the player sets no stone.

- **Part A**: when the last stone sits, the camera lifts a little by itself; the two legs begin to creep. Left thumb
  on the left leg, right thumb on the right: a short drag inward and hold. The crew lays weight stones on the
  shoulders; dust runs from the joints when the legs move; the creak's pitch follows the net push. Mouse: the pointer
  holds one leg and the crew's prop holds the other (say so in the report: the mouse plays half the feel).
- **Part B**: touch a wedge and draw it out a little, once on the right, once on the left. Read the joints. Light:
  push the wedge back, touch that shoulder.
- `vaultS`: the two hands feel different things: the rock leg does not move at all.
- `vaultM`: free and loaded wedges, told apart by how they move and sound. After the player frees ring 1, the crews
  move the centering west and build the other eleven rings by themselves, visibly, ring after ring, while the player
  goes on to other works; the vault is whole before `night` opens.
- Quick words: "מחזיק!" (the perfect release), "יצא!" (a wedge out with no light), "עומדת!" (the last wedge).
- The moments: the centering is carried out and the stones stay in the air; a crew man climbs and stands on the
  arch. In the instruments chambers a Levite comes in through the low opening with a nevel, sets it down and plays
  one note that rings under the arch (המחשה).
- Before stage 07 the two block faces by Nicanor must look exactly as they do today (stage 06's pictures do not
  change); the openings appear with the stage.

## 7. The ending — לילה בבית המוקד (`night.js`: one work; no minigame but the slab)

Opens after the nine works. The sun goes down as the player walks to Beit HaMoked; inside, the only light is the
fire (one point light without shadows, glowing embers, the vault lit from within).

1. The crew has laid the wood on the hearth. A kohen holds a torch at the door from the Azarah: touch the torch and
   bring it to the wood. The fire takes.
2. The elders come in and lie on the stone ledges; the young kohanim lie on the floor, each on his own garment.
3. The camera lifts a little by itself. Two thumbs on the slab's ring, lift slowly (mouse: one pointer). At 0.8 the
   kohen takes the keys from the chain under it and the slab rests open against its prop.
4. The camera rises over the Azarah. The gates of `night.gates` close and lock from inside one after another, one
   sound each; the right thumb can turn the view while they do. The Levite lies down outside.
5. The kohen hangs the keys back. Two thumbs lower the slab slowly. He spreads his garment over it and sleeps.
6. Three last pictures: the fire lighting the vault; the water standing in the troughs; the round bench in the Gazit
   waiting for the morning. Then the full-screen feedback and the stage's summary, with a line that says this is a
   picture of what the house was built for (the house is not yet dedicated in the game): "כך ייראה הלילה בבית
   המוקד (המחשה)".

## 8. The pack, the world, the game

- `pack.js` and `world.js` as h128's: the stage's things drawn from the save on a beat; every damage of §10 drawn
  where it happened; the crews at work round the three sites while the player is elsewhere.
- `src/temple.js` inside `h129` blocks, as h120 did for the gallery: the Gazit becomes a shell with a floor at 16
  and its roof a set raised in the finish; the Golah chamber is added (walls, roof set, a `P('golah', …)` record);
  the two openings in the blocks by Nicanor; the vault of Beit HaMoked as rings. From outside, the finished model
  looks as it does today, plus the Golah chamber and the two openings. The model's own versions are hidden while the
  world draws the player's (never both).
- Page flags: `__H129_FULL` (the whole stage), `__H109_ONLY` kinds `gazit`, `golah`, `vault`, `night`.
- The stage opens after stage 06 and its summary leads to the next world stage as h128's does.

## 9. Tests, the bot, the pages (part 3)

As §10 of the 128 brief: the model tests; the book test; the no-book scan; a snapshot of stages 01–06 that proves
nothing of theirs moved; `tools/h109bot.js` learns the four kinds and plays the whole stage by touch (960×600) with
no mistake, and once per damage of §10 with the mistake made on purpose; reload in the middle of every work; rule 66's
four gesture checks in every station; stage 06 replayed after the change. Pages by `tools/mkout.cjs --no-shift`: the
full game, stage 07 whole, and one per station (four).

## 10. The loss table (the only damages; each stays to the eye)

| flag | what stays in the world | points |
|---|---|---|
| `gazit.crack` | a bench stone with a cracked corner | −20 |
| `gazit.ink` | an ink stain on the floor | −20 |
| `golah.bucket` | a cracked bucket that drips | −20 |
| `golah.rim` | a broken stone in the well's rim | −20 |
| `golah.flood` | a puddle and a wet stain by a trough | −20 |
| `vault.crack` | a crack in the ceiling where a joint opened | −20 |
| `vault.stone` | a broken arch stone by the wall, its replacement of another shade | −20 (small arches), −40 (the great vault) |
| `night.slab` | a cracked corner of the marble slab | −20 |

Never below zero. A stone over the holy line, water spilled back into the well, a man left standing, a failed test
and a slab let go half way are not damages.

## 11. Sources (the only claims the game may make in this stage)

The quotations are in the spec's table, checked word for word on Sefaria by the brainstorm thread; copy them from
`docs/specs/shlav-07-he.md` and nowhere else: סנהדרין ד, ג; סנהדרין ד, ד; מידות ה, ד; מידות א, ח; מידות א, ט;
מידות ב, ו; יומא כה ע"א; שבת א, יא. Everything in the spec's list "מה מסומן המחשה" is marked "(המחשה)" wherever the
game says it in words. The game shows no number of judges and never says 71.

## 12. What to hand back (after each part)

What you built and where; every departure from the spec or this brief and why; the final tables of the model; every
Hebrew string you added; what you tested and how (commands, numbers, screenshots under the scratch folder); what you
did not test; what you think is weak. Short and plain.
