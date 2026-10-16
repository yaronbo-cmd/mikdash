# STAGING — how the construction is staged (wave 8B, extended in wave 9 · DRAFT for the owner)

Owner: DESIGN8B, then DESIGN9 (wave 9: §6 the wall, §7 the gates and §8 the altar at the Mount's level of detail; docs only, no game code). Companion: docs/STAGING-he.md (the owner's summary). Every beat below is a
draft (טיוטה) for SITE8B (the world), FLOW8B (prompts, pointer, camera calls), GAMES8B (the precision games and the board),
MUSIC8B (the score) and FACTS8B (the facts). Facts are named by their ids in FACTS8B's content/facts.json (s8-facts),
shown through FLOW8B's `nextFact()`.

## 0. Why this document
The owner played v16 on his phone (28.9, 12:18 Jerusalem): on the Mount "the last two stones are hidden and you can't see what
you strike", "you don't understand what to tap; a very big zoom-out; you don't understand what is happening there", "the
progress in this stage isn't seen in the game's world; it is only random taps and information, without anything really
moving", "the Mount is empty of workers, building tools and cranes", and "look online at how building games are staged".
Our tests drove the game with autoplay; nobody had watched the Mount by hand at 390×844. This is the staging, beat by beat.
What a player saw on v16 by real touch (QA8B's test/out/real-play, 10:15): the survey's hand over bare ground with four small
figures at the bottom (normal-02); from the 2nd boulder on, ground only and a ring over a rock the hill had buried (normal-03,
-08; SITE8B's root cause: the hill's stale cut uniform); from the first stone on, the whole city from ≈ 2 km (normal-09, -14).

## 1. How building games stage construction (research, 28.9)
| game | camera and distance | what the player taps | what moves after a tap | how progress shows | pace · first minute |
|---|---|---|---|---|---|
| **Tower Craft: Build Skyscraper** — the owner's link (package com.quantumgames.skyscraper, listed by Casual Azur Games) [1][2][3] | the tower in view as it grows (store screenshots; not verified by play) | "select the floor that you want to construct, then it will automatically be constructed. To speed up the construction process, you simply tap on the screen." [3] | the floor builds itself in view; a tap speeds it: "with every tap your skyscraper will improve" [1] | the tower's height, "from a tiny tower" to the clouds, space and Mars [2]; each floor its own design [2] | idle + tap; coins per floor buy the next floor and upgrades [3] |
| **Tower Bloxx** (Digital Chocolate) [4][5] | side view of the tower and the crane above it | one button: drop the block | "Each floor is carried by a crane and swings from side to side before the player drops it onto the tower below" [4]; a perfect drop keeps the tower upright, a bad one makes it lean or "bounce off and tumble" [5] | the tower's height and its residents: "the straighter your tower, the more people move in" — "they parachute in" [5]; a combo meter for perfect drops [5] | "take only seconds to understand" [4]; one floor every few seconds |
| **Idle Construction 3D** [6][7][8] | isometric 3D; drag to rotate [8] | "tapping on the central area of the screen" to collect; taps "speed up the workers who are carrying the bricks and building your house" [7] | the workers carry and lay bricks: "relax by watching your workers team lay every brick one by one" [6] | the building brick by brick; a level meter and a % bar [7][8] | idle; speed boosters (×2), a "Super Builder" [7] |
| **SimCity BuildIt** [9][16] | isometric city, pinch zoom | the next building to upgrade is marked ON the plot: "a construction plot will appear with a hard hat over it" [9]; materials are dragged onto the zone | "A scaffolding animation will then appear, surrounding the building for a few seconds", then the new building [9] | "fireworks for a few seconds after completion", XP, population [9] | timers + materials; the first steps: "Place a residential zone next to a road to start the building process, then tap the hard hat icon to view the building plans", then "drag the building materials on top of the building, and the work will be completed automatically" [16] |
| **Township** [10] | isometric town | a building waits as a site for its materials: "Bricks, Slabs, Glass" [10] | (general knowledge, not re-verified) the fenced site becomes the building once its materials are in | the town's buildings | materials by trains and factories |
| **Hay Day** [11] | isometric farm | "drag the building wherever you would like it to sit" [11] | construction "can take a little while"; then "tap the present to unveil the fruits of your labors" [11] — the reveal is the player's tap | new buildings produce | timers; speed-up |
| **Megapolis** [12] | isometric city | infrastructure built from materials: "Technical Drawings", "Rebar", "Concrete" [12] | (general knowledge) the site shows its stage until the next material arrives | the city | materials from trains, events, requests [12] |
| **Minecraft and its builders** [13] | "first-person perspective by default", third person optional [13] | the block the player aims at | "breaking, or mining, blocks and then placing them elsewhere to build structures" [13]: the block appears exactly where you aimed | what you built IS the progress | self-paced |
| **Townscaper** (feedback reference) [14] | a small island town, orbit camera | a click places a block | the rules answer at once: "arches, gardens, flying buildings and stairways" [14] | the town | calm, no goals |

**The craft reference:** "Juice it or lose it" (Martin Jonasson & Petri Purho, 2012) [15]: the same input feels right or dead
depending on the feedback round it — motion, particles, sound, the camera.

**What the seven rules below take from them:**
1. ONE marked target, ON the object (SimCity's hard hat; Tower Bloxx's block on the hook). Never a floating instruction alone.
2. Every tap makes the thing visibly grow at once (Tower Bloxx: a floor per drop; Minecraft: the block where you aimed).
3. The work goes on by itself in view, and the tap drives it (the owner's Tower Craft: the floor builds itself, a tap speeds it;
   Idle Construction: the workers carry and lay every brick).
4. Progress is the building itself (height, a course, a terrace), not a number; the result of a reward is SEEN arriving
   (Tower Bloxx's residents parachuting in).
5. A reveal is a gift at the end of a unit (SimCity's scaffolding → fireworks; Hay Day's present). Between reveals the camera
   stays at working distance.

## 2. The seven rules (every beat, every stage)
- **R1 Camera = working distance.** The presets in §3. The target sits at screen (50 %, 45 %), inside the safe frame x 60…330,
  y 130…694 at 390×844. Moves are 0.9-s glides, never during a swing. Wide shots ONLY at reveals (★).
- **R2 One target, marked ON it.** A gold ground ring round its base (≥ 1.2× its footprint, 1-Hz pulse) + a bobbing gold pointer
  (≥ 56 px), its tip 20–30 px above the target's top. Nothing else pulses. The target is never occluded; if it leaves the safe
  frame the camera re-aims.
- **R3 Tap anywhere = act on the pointed target** during a run of strokes (a tap on another valid target retargets). One button,
  like Tower Bloxx: no "miss" for tapping beside a rock.
- **R4 Every tap moves three things:** the hero's stroke lands ON the target · the target changes shape (crack, split, drafted,
  dressed, set) · someone in frame reacts (levers, loads, hauls). Every 1–2 taps a counter IN THE WORLD moves (the terrace, the
  spoil heap, the stakes, the course's ghosts). Never a tap that only changes a number.
- **R5 The site is alive before the first tap and between taps:** ≥ 4 workers on looped jobs in frame, a cart, tools, stakes and
  cords, the crane. Crews work the NEXT target too. The build goes on by itself in view; the player's taps lead it (rule 3).
- **R6 Words:** one prompt ≤ 5 words at a time; the next only after this one is done. Counts live in the world (a flag on a stake
  "3/12"). No toast during a run of strokes: it waits for the next pause.
- **R7 Facts only at pauses ⏸** (a walk, a lift, a reveal; never during taps): one line ≤ 35 words at the top, ≈ 5 s, from
  `nextFact(stage)` (FLOW8B), each fact once, new on every visit.

- **R8 (wave 9) The stone is dressed where it is set.**
  - The builder's banker stands on the scaffold board, or the ground, in front of his next slot, or in a working bay beside
    it (the Mount: SITE9's `harBay`, the crane on the laid course and the stock behind it). The crane brings each rough block
    to him. The test is one frame: the builder ≥ 80 px, his block and the next slot in it at every tap.
  - His slots follow one front (his stretch) in order, and the gangs fill the others.
  - So the builder, his block, the slot and the course are in one frame at every tap. On v17 the banker sat by the far pile,
    75 amot from the Mount's slot and 30–95 amot from the wall's, and the course rose off screen (QA9, 15:46).

**The owner's notes → the rule → the owner of the fix**
| note (28.9) | rule | fix |
|---|---|---|
| the last two boulders are hidden | R1, R2 | SITE8B `boulderView` / `clearView`; the boulder field (§4) |
| don't understand what to tap; a very big zoom-out | R1, R2, R3 | FLOW8B pointer + ring; no `focus('har')` wide frame after the opening |
| don't understand what is happening | R4, R5 | SITE8B chunks, cart, terrace, crews; FLOW8B one prompt at a time |
| "בנה מקטע · 8 אבנים" unclear; "הנח את אבן הפינה" after one tap | R4, R6 | beat M7: the stones arrive, then the first slot glows, then the crane |
| progress not visible in the world | R4 | the terrace, the spoil heap, the course's ghosts, the cart caravan after a board |
| the Mount is empty of workers, tools, cranes | R5 | SITE8B crews at the Mount, ox cart, crane, piles |
| music | §9 | MUSIC8B's states per beat |

## 3. Camera presets
Portrait 390×844. `view.lookAt(x, y, z, dist, az, el, ms)` (main.js:319) already multiplies `dist` by 1.35 on portrait, so the
distances below are the REAL ones: pass `dist / 1.35` there. Landscape: the same real distance ÷ 1.35. FOV 32° (main.js:53):
at a real distance D the view is 0.57·D amot tall; the hero (≈ 3.6 amot) is ≥ 80 px when he stands ≤ 65 amot from the camera.

| id | target | real dist | el | az | the frame |
|---|---|---|---|---|---|
| CAM.SURVEY | the stake being driven, ground + 1 | 45 | 28° | over the hero's shoulder: bearing(target→hero) + 25° | the hero in the lower third, the stake centred, the cord to the next stake |
| CAM.STRIKE | the rock's centre, ground + 0.45 r | 72 | 24° | bearing(target→hero) + 28°, toward the next target's side; line of sight cleared (SITE8B `clearView`) | the rock fills ≈ 85–100 % of the width (at 72 amot the frame is ≈ 19 amot wide: rocks of r > 8.5 touch the edges — fine, the strike point and the ring's front arc stay in), the hero ≥ 80 px, the next rock or a crew in the upper third |
| CAM.WALL (wave 9) | with R8, the slot at the course's height + 1 (his banker is beside it) | 45 | 24° | over the builder's shoulder ALONG the face: the face's tangent toward the laid stones + 25° outward. The Mount: the world's bay frame from the hill's side (SITE9 `harBay`, 70, el 36°) | the builder (≈ 110 px) and his banker low; the slot, the laid stones, the crane's hook and the crew above. (8B's "midpoint, from outside the face, 35° along it" puts both off a portrait screen: §6) |
| CAM.SLOT | `nextSlot(id)` | 40 | 16° | outside the face | 2 s while a stone lands, then back to CAM.WALL |
| CAM.PAVE | the next paving strip / finish item | 60 | 45° | the site's own `view.az` | the strip, the tampers, the finished part behind |
| CAM.REVEAL ★ | the centre of the work just finished | 160–260 | 25–40° | the side of the last preset | a 2.5–3.5-s hold, a tap skips, then back to work |

## 4. The Mount (`har`, שיטוח ההר) — the shot list
The first ten minutes happen here. Today's jobs (src/game/state.js:387): start → survey (3 strokes) → 12 boulders × 2 hp →
courses: a segment of 8 stones for 12 stone → the great stone (crane game) → stones of 3 strokes → the corner at stone 16 of a
course (quarry game) → a check every 2 courses → paving (60 stone) → inspection → the moment (`greatStone`).

**⚑ Director's call — bring the work to the hero.** The 12 boulders are spread over ≈ 430 × 260 amot (stages.js:378); at the
hero's 11 amot/s (stages.js:2083) a boulder run is ≈ 80 s of walking out of two minutes: the dead time the owner felt, and the
wide frames. Move the 12 interactive boulders into a **boulder field** on the east shoulder, from boulder 4's spot (128, −84)
toward the crane (270, 72), 20–26 amot apart (≤ 2.5 s walk), in a path whose last boulder is ≤ 40 amot from the courses spot
(246, 36). One array each: stages.js `BOULDERS` (SITE8B) and game/index.js `BOULDER_XZ` (FLOW8B); `G.bh` stays 12 by index,
saves are unaffected. The rest of the hill keeps its non-interactive rocks; the crews thin them as the count rises (P1).
Fallback: keep the positions with a fixed east-first order (4 → 5 → 6 → 3 → …) and CAM.STRIKE gliding with the walk.
A proposal SITE8B fits to the ground (slope ≤ 15°): a zigzag from (128, −84) toward (246, 36), consecutive rocks 24.2 amot apart
(≈ 2.2 s of walking each, ≈ 24 s for the run instead of ≈ 80 s), rock-to-rock gaps ≥ 6.5 amot, the last rock 24 amot from the
courses spot, radii kept per index: `[[206.3,-8.6,8.6],[202.3,15.3,7.4],[225.9,10.3,9.2],[221.8,34.1,7.8],[128,-84,8.4],`
`[123.9,-60.2,7.6],[147.6,-65.1,8.8],[143.5,-41.3,7.4],[167.2,-46.3,8.4],[163.1,-22.5,7.8],[186.8,-27.4,8.6],[182.7,-3.6,9]]`.
The pointer walks the path: the next target is the first standing boulder in `ORDER = [4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3]`
(replacing the nearest-first rule, index.js:468, and the resume's `S.pickBoulder`).
The plan from above and the phone frame: docs/staging-mount.svg (A: today's boulders in grey, the field in gold by strike
order, a CAM.STRIKE's ground footprint; B: the safe frame, the target at (50 %, 45 %), the pointer, the hero ≥ 80 px).

| # | t | camera | target (pointer) | player | the world does | words (≤ 5) | sound / music | fact ⏸ |
|---|---|---|---|---|---|---|---|---|
| M0 | 0:00 | the opening (exists, 6.5 s) — its last frame IS the M1 frame, not 81 amot out | — | a tap skips | the finished House → the gold plan → down to the hero | "כאן ייבנה הבית." | `build` fades in under the swell | — |
| M1 | 0:07 | CAM.SURVEY, still | none for 1.2 s, then the stake | watches | the site is alive: a worker drives a stake, 2 pickmen swing at the next boulder, a basket boy walks to the ox cart at the spoil heap, the treadwheel turns on the east edge | — | build: drone + kinnor | — |
| M2 | 0:09 | CAM.SURVEY, pans 6 amot a stake | the red-ragged stake, then the next | 3 taps | the hero drives the stake with the mallet, the cord snaps taut to the next stake, a chalk line runs 8 amot on the ground; the 3rd tap closes the corner and a gold line runs off east to the wall's line | "הקש על היתד" → "המדידה מוכנה" | a wooden thunk a tap + one rising kinnor note each | during the glide: `f_har_500` (מדות ב, א) |
| M3 | 0:16 | CAM.STRIKE on boulder 1 | the boulder | 2 taps (teach) | tap 1: the pick lands, chips, a crack runs through the rock (state 1), the far pickman swings in counterpoint; tap 2: it splits in 3 chunks, 2 workers lever them into baskets / onto the cart, a pale LEVELLED PATCH with 4 stakes appears where it stood, a flag "1/12" | "הקש על הסלע" → float "עוד 11" | pick clack; the split: crack + low rumble + a tof dum | — |
| M4 | 0:22 | CAM.STRIKE on boulder 2 | boulder 2 + the rhythm ring | 1–2 taps | the same; the ring teaches the perfect strike (a perfect one splits it in one tap, gold chips) | "הקש כשהטבעת נסגרת" | a bright tak on a perfect | — |
| M5 | 0:28–1:10 | CAM.STRIKE per boulder, 0.9-s glide as he steps over | the next boulder, framed before he walks | ≈ 10–20 taps | each split: the chunks are loaded, the ox cart shuttles to the spoil heap (≈ 12 s; chunks wait in a pile while it is away), the patch grows by a tile toward the east, the flag counts; a crew already at the next boulder | floats only ("עוד 6") | build + a tof layer rising with the combo (3 / 6 / 10) | after boulder 6, as the cart passes: `f_har_prepare` (אלף עגלות) |
| M6 ★1 | 1:10 | CAM.REVEAL: up from the last boulder over the east shoulder | — | a tap skips | the tiles join into one pale terrace, the spoil heap at the edge, the chalk line of the retaining wall along the east face, the crane at its start, the stock pile | "ההר פונה!" + "עכשיו: החומה" | `moment` swell 3 s → build | — |
| M7 | 1:15 | CAM.WALL | the empty stock pile, then the pill | 1 tap on the pill | an ox cart unloads 8 rough blocks onto the pile one by one (0.2 s each); the course's 8 gold ghosts light on the wall; the FIRST glows brighter | panel: "הצוות יניח 8 אבנים בחומה. את הראשונה תניח אתה, במנוף." · button "▶ הביאו את האבנים" | cart creak + 8 thuds | — |
| M8 | 1:20 | CAM.WALL → CAM.SLOT | the crane's hook over the great stone | 1 tap → the crane game | 1.2 s in the world first: the men in the treadwheel walk, the rope takes up; then the game; after it the crane lowers the great stone into the first slot (`liftStone('har', {great:true})`), dust, the stone stands proud of the face, the hero's proud gesture | "הרם את האבן הראשונה" → "האבן הראשונה במקומה!" | `precision` in the game → the swell on landing | the game's line: `f_har_great`; during the lift: `f_stone_crane` |
| M9 | 1:45 | CAM.WALL; the crew walks in from the frame's edge | — | the name prompt | 4 masons go to the bankers, a rope team to the crane (this shot replaces the toast); the story card, the name, "שלום, הכהן <שם>" | (the cards) | ducked under the cards | the story card (אלף כהנים) |
| M10 | 2:10 | CAM.WALL; CAM.SLOT for each landing (2 s) | the rough block on the hero's banker | 3 taps a stone × 7 | tap 1: drafted margins (rough → drafted), tap 2: the boss dressed (→ dressed), tap 3: the rope team hooks it and the crane SETS it (a short lift ≈ 2.5 s), the next ghost lights; the crew sets stones on the other fronts behind | the first stone only: "סיתות, סיתות, הנחה" | chisel tik ×2 (rising) + a low dum on landing; each landed stone adds a note: 8 stones = one phrase | lift 2: `f_wall_margins`; lift 5: `f_wall_setback` |
| M10b | each later segment | CAM.WALL → CAM.SLOT | the crane hook | the quick lift (5 s, exists) | the M8 shot without the game: the player lifts the segment's first stone | — | build; `land` | — |
| M11 | ≈ 3:45 (stone 16) | CAM.WALL, a pan along the course to the far corner | the corner slot | 1 tap → the quarry game | after the game the ox cart brings the corner block down the quarry road; the crane sets it | "חצוב את אבן הפינה" (never "הנח אותה" — the game quarries it; its kicker "חציבת אבן הפינה") | precision | the game's line: `f_stone_quarry`, then `f_stone_tools` |
| M12 | ≈ 4:30, the stock runs out (stone 24) | CAM.WALL | the bare pile, then the pill | the pill → the board | the pile is visibly empty, the hook hangs idle, the masons sit (a waiting pose); after the board a caravan of 2–3 carts rolls in and unloads: the board's win SEEN in the world | "נגמרו האבנים" → "▶ המחצבה · כ־45 אבנים" | `board`; the carts' creak on return | on the board's result card |
| M13 ★2 | course 1 done (≈ 8:00; the board ≈ 3 min before it) | CAM.REVEAL along the east face, 160 amot, el 25° | — | a tap skips | the whole first course on the working front, the crane rolling to the next run, the scaffold's first lift | "הנדבך הראשון שלם!" | the swell | `f_herod_marble` |
| M14 | every 2 courses | CAM.WALL at the corner | the engineer's plumb line | the plumb game | the engineer walks in and hangs the plumb; after it the bob hangs true by the wall | "בדיקה: אנך ופלס" | precision | the game's line (topic `herod`) |
| M15 | courses 2–6 | CAM.WALL ↔ CAM.SLOT; the crane and the scaffold climb | the banker stone | 3 taps a stone | the course climbs; the spoil heap is carted INTO the fill behind the wall (the terrace rises behind the course) | — | build | idle ⏸ `nextFact('har')` |
| M16 | the paving | CAM.PAVE over the terrace | the next strip | 1 tap a strip | workers with tampers lay the paving strip by strip (`finish` 0 → 1) | "ריצוף הרחבה" | build | — |
| M17 ★3 | inspection + the moment | moments.js `greatStone` (exists); the one full zoom-out after the opening | — | — | the whole platform and its walls | (the moment's card) | moment | (the moment's card) |

**Acceptance, by real touch at 390×844 (for QA8B's test/real-play.cjs).** Every beat passes when, at the moment of the tap:
the target's screen point is inside x 60…330, y 130…694 and not hidden by the hill (SITE8B `occluded`); the hero's projected
height ≥ 80 px; exactly one prompt and no toast on screen; and after the tap the world's own state moved — M2 a stake / the
survey count, M3–M5 `G.bh[i]` down and (P1) a patch tile at the rock, M7 the stock pile's count up by 8 before the crane prompt
shows, M8 `siteInfo('har').set` = 1 with the stone drawn in the slot, M10 the banker stone's state rough → drafted → dressed,
then `set` + 1, M12 the pile's count up after the board. Between two consecutive boulder strikes the camera never frames more
than 120 amot of ground (no wide frame outside ★).

**Wave 9 note on CAM.WALL (DESIGN9, measured on v17 at 390×844).**
- The builder's banker is at (283, y −50, 63) and the next slot at (276, y −94, 2): 75 amot apart, the slot 44 amot lower.
  No single frame holds both.
- A frame from outside the face lays the banker→slot line ACROSS a portrait view, which is only ≈ 17 amot wide at 64 amot
  (§6 shows the same at the wall).
- So on the Mount the working frame is the yard: the builder at his banker, the crane and the stock, over his shoulder
  toward the hook. Each landing cuts to CAM.SLOT for 2 s.
- **The decision (R8, 15:48):** the banker goes to the slot, on the scaffold board in front of it. The camera looks over his
  shoulder ALONG the face (45 amot, el 24°, az = the face's tangent toward the laid stones + 25° outward), so the course
  rises in the working frame itself.

**Return visits and idle.** The camera lands on CAM.WALL, never on the footprint. The stones the crews set while he was away glow
for 2 s and a flag counts them ("הצוות הניח 6 אבנים"). Idle > 8 s with nothing to tap: the crews keep working in frame, one
fact ⏸ at the top. Night: the site sleeps by torchlight; the first night `f_har_rain` (תענית כג, א). Shabbat: tools laid down,
no crews (`f_wall_shabbat`).

## 5. Every later stage: the same loop, seen
Each stage is a project (docs/BUILD.md): survey → dig → foundation → courses (stones, key stones, events, checks) → finish →
inspection → the moment. The loop in the world, for every stage from the wall on:
| step | camera | target | what each tap moves | the world between taps |
|---|---|---|---|---|
| arrival ★ | CAM.REVEAL from the last site to the new one | — | — | the new footprint glows in gold on the ground (the plan); the crews walk over from the last site with their tools; the crane is rolled over on its wheels (or comes in pieces on a cart) |
| survey | CAM.SURVEY at the working corner | the next stake | a stake driven, the cord taut, 6 amot of chalk line (SITE.md `survey`) | the crew runs the line on round the footprint |
| dig | CAM.STRIKE on the trench's end | the trench's end | a visible length of trench, spoil banked, a basket filled | baskets carried to a cart; the cart leaves |
| foundation | CAM.WALL | — | — | the footing course's gold ghosts appear in the trench (1.5 s) |
| segment | CAM.WALL | the empty stock pile → the pill | the cart unloads the stones one by one; the ghosts light; the first glows brighter | — |
| stones | CAM.WALL ↔ CAM.SLOT | the rough block on the banker | drafted → dressed → set by the crane | crews set stones on the other fronts; the scaffold climbs with the courses |
| key stone | CAM.WALL → the game | the key's slot (corner, lintel, first) | the game; then the stone lands in 3D | the rope team, the crane |
| event | CAM.WALL | the jammed rope / the cracked block | `pull` / `split` (2 taps) | the rope team strains; the cracked block is carried off and a whole one comes |
| check | CAM.WALL at the corner | the engineer's plumb | the plumb game | the engineer walks the course |
| finish | CAM.PAVE (or the item's own close shot) | the next finish item | one item a tap (a coping stone, a beam, a door leaf, a gold plate) | the specialists: sawyers, carpenters, goldsmiths, plasterers |
| inspection | CAM.WALL, the engineer's walk | a badly set key stone, if any | the crane lifts it out and resets it (time only) | — |
| moment ★ | moments.js (exists) | — | — | the stage's reveal |

**Materials arrive in the world, always.** The reward of a board or a king's deal is SEEN at the site: stone by ox carts down the
quarry road; cedar as rafts to Jaffa (Ezra 3:7, `f_trade_tyre`) then carts; gold and silver in a guarded chest; bronze as
ingots on donkeys. They stack at the site's stock pile, in frame at the next CAM.WALL.

## 6. The wall (`wall`, חומת העזרה) — the shot list (wave 9, DESIGN9)
**The stage, from the code (1428e5c).**
- **Footprint:** the court's walls at x −193…147, z ±73.5 (stages.js:39). The stage covers the azara and the Ezrat Nashim.
  The north face is at z −73.5 and the NE corner at (147, −73.5). The east face has the gate's gap at z −13…13, and it is the
  low one: 22.5 amot against 40.5–44.5 elsewhere (stages.js:41–44; `f_wall_east`).
- **The work (content.js:157):** 8 courses × 32 logical stones (256), 8 a segment for 45 stone. The survey and the dig cost
  10 silver each.
- **The keys (content.js:175–185):** two per course, the course's first stone (j 0) and its far corner (j 16). The crane and
  the dressing alternate:
  - course 1: the first stone (crane), then the corner (dressing);
  - course 2: dressing, then crane;
  - course 3: crane, then dressing;
  - and so on.
- **The events (content.js:187–191):** the rope at logical stone 102 (course 4), the crack at 193 (course 7).
- **Then:** a plumb check every 2 courses; the finish (the coping for 60 stone, the chambers' beams for 60 cedar); the
  inspection; the moment "הנדבך הראשון" (moments.js).
- **The player:** a first-time player comes here right after the Mount's moment, with the tutorial over (`ftue` 99). The
  pointer and the words must carry every beat alone.

**The world today (a probe of the v17 world at 390×844; crews.js:63–64, 110–113; stages.js:1881–1897, 4318–4343).**
- **The yard:**
  - the crane stands at (44, −96), H 50, its hook over (44, −70.5);
  - its stock pile is at (44, −88.8);
  - the builder's banker is at (51, −88.8), and he stands at (52.9, −88.8) for every stone;
  - the masons stand at x 52…138, z −84…−95; the rope team at (31…53, −84…−89); the foreman at (72, −98); the saw bench at
    (100, −105);
  - carts unload at (70, −112).
- **The first course's working front (front 0 of 9; 3,681 real stones in 21 real courses):**
  - x 70.5, 77.3, 84, 89.2, 94.5, 101.3, 108, 113.2, 118.5, 125.3, 132, 137.2, 142.5 along z −72.5;
  - then the NE corner (146, −73.5), then down the east face to z −49.5;
  - 18 stones in all.
  - One logical stone is ≈ 14.4 real stones, 1.6 rounds of the 9 fronts. So each stone the player sets moves the next slot
    ≈ 11 amot east.
- **What a phone shows, then:**
  1. The plain `focus('wall')` sits ≈ 220 amot from its target. Measured on a phone frame, the camera is 253 amot from the
     builder, who is 18 px tall at the screen's edge.
  2. After his 3rd stone the slot is over 46 amot from his banker. `wallView` then frames the slot alone (stages.js:4331,
     k = 0), and he leaves the frame.
  3. By his 8th stone the slot is at the NE corner, 95 amot away. The crane at x 44 swings each block 100 amot.
  4. From ≈ his 11th stone front 0's first course is full, and `nextSlot` goes round the court's other fronts, up to
     ≈ 300 amot away, until the real course closes (≈ stone 17).
  5. The key at logical 16 lands on one of those fronts, not on a corner.

This is the Mount's problem again, as the owner put it: "you don't understand what to tap; a very big zoom-out".

**⚑ Director's call W — the builder's stretch at the NE corner** (the plan from above: docs/staging-wall.svg). Bring the work to the hero, as on the Mount.
- **The stretch.** The player's stones are set on ONE stretch that wraps the court's NE corner: the north face
  x ≈ 120…147, the corner, and the east face z −73.5…≈ −50. That is ≈ 8 stones a real course, with the corner stone in the
  middle. The crews raise the rest of the court in the background.
- **One stone per stone.** Each stone the player sets is ONE stone, at the slot the pointer marks, on the stretch. The ≈ 13
  other real stones that one logical stone stands for appear on the crews' fronts.
- **The corner makes the words true.** Both key stones of a course sit ON the corner: "every course starts at its
  cornerstone" (content.js:184) and "…turns its far corner" (content.js:182).
- **The yard (a proposal; SITE9 fits it to the ground):**
  - the crane outside the corner at ≈ (164, −92), dir (−0.62, 0.78), reach 25.5 (the hook over ≈ (148, −72));
  - its stock pile at ≈ (159, −86), with the builder's banker beside it;
  - the masons' stands along the stretch;
  - `spot` ≈ (156, −84) with `face` (147, −73.5), so front 0 starts just before the corner (stages.js:1157–1211) and the
    survey starts there;
  - the carts come down to the pile from the quarry's piles (185…203, −164…−190), ≈ 90 amot of road seen from the yard.
- **The camera on the stretch:** CAM.WALL-W at az −45 fixed (the corner's bisector). It never flips 90° when the course
  turns the corner.
- **Before ⚑W, the P0 (R8):** his banker at the slot and his slots on front 0 in order, so the camera over his shoulder
  along the face holds him, his block and the course.
- **Fallback.** Keep today's yard, and set the player's stones on front 0's first five slots only (x 70.5…94.5, ≤ 46 amot
  from the banker). The keys go on x 70.5, and the words drop "פינה" (FLOW9: "הנח את האבן במנוף", "סתת את האבן").

**The wall's cameras.** These are the presets of §3, solved for the wall.
- az is the camera's bearing from the target: 0 = east, −90 = north. Distances are real, on a portrait phone; `view.lookAt`
  wants dist / 1.35.
- The builder must be ≤ 65 amot from the camera at every tap (≥ 80 px).

| id | target | real dist | el | az | the frame |
|---|---|---|---|---|---|
| CAM.SURVEY-W | the stake being driven, ground + 1 | 45 | 28° | bearing(stake→builder) + 25° | the builder in the lower third, the stake centred, the cord running along the face |
| CAM.TRENCH (new) | the trench's end, 1 below ground | 55 | 34° | the face's outward normal + 30°, toward the undug side | the builder at the lip, the trench's floor, the spoil bank, a basket boy |
| CAM.WALL-W | OVER THE BUILDER'S SHOULDER. With R8 (his banker at the slot): the slot, at the course's height + 1, 45 amot, el 24°, az = the face's tangent toward the laid stones + 25° outward. Until R8: the point 40 % of the way from his banker to `nextSlot`, ground + 2 | 64 (45 with R8) | 22° (24° with R8) | bearing(slot→banker) + 20° (toward the crane's side) | the builder in the lower third, the bankers and masons in the middle, the course being laid above; shot on v17 at the first slots: the builder at (303, 584), 89 px, the slot at (84, 323) (bus/design9-shots/wall-C-shoulder-3.png) |
| CAM.SLOT-W | `nextSlot('wall')` | 40 | 16° | normal + 20° | 2 s while a stone lands, then back to CAM.WALL-W |
| CAM.TOP (new) | the next coping stone or beam on the wall's top (y ≈ 40.5 on the north face) | 60 | 38° | normal + 35° | the top of the stretch, the scaffold's top lift, the crane's hook |
| CAM.REVEAL-W ★ | W0: the court's centre (−23, 0, 0) · W10/W13: the stretch's middle at half the wall's height | W0 420 · W10 160 | W0 42° · W10 25° | W0 −20 · W10 −35 | W0: 2 s, then a 1.5-s glide down to W1's frame · W10: 2.5 s, a tap skips |

**Why CAM.WALL-W looks over his shoulder** (three phone frames of v17 at 390×844, looked at):
- **The plain `focus('wall')`:** 253 amot away, the builder 18 px at the screen's right edge (x 329, the edge of the safe
  frame).
- **Today's `wallView('wall')`** (64 amot, az −55, from outside the face): with the slot 30 amot from the banker, both are off
  the screen, the builder at x 503 and the slot at x −167. Seen from the face's outside, the banker→slot line lies ACROSS the
  view, and a portrait frame is only ≈ 17 amot wide at 64 amot.
- **Over the shoulder:** the line runs into depth, so the builder is low, the course is high, and both are in.
- **The limit:** past ≈ 30 amot between the banker and the slot, no frame holds both. At 40 real stones the slot is 50 amot
  away, and the builder falls off the right edge even over the shoulder. Hence ⚑W, or the fallback's first five slots.

**The beats.** Times are for a first-time player; t runs from the tap on the wall's start pill.
| # | t | camera | target (pointer) | player | the world does | words (≤ 5) | sound / music | fact ⏸ |
|---|---|---|---|---|---|---|---|---|
| W0 ★ | 0:00 | CAM.REVEAL-W on the court, then a glide down to W1's frame | — | a tap skips to W1's frame | the court's outline draws itself in gold on the platform (1.2 s), from the NE corner round the rectangle; the Mount's gangs walk over with their tools (they do not pop in); the crane stands at the corner, its hook swinging | "חומת העזרה" | `reveal` swell → `build` | `f_wall_size` (מדות ה, א–ב), during the hold |
| W1 | 0:05 | CAM.SURVEY-W on the corner stake | the red-ragged corner stake, then the next | 3 taps | tap 1: the builder drives the corner stake (mallet); a surveyor pulls the cord west along the north face's line; a chalk line runs on the ground; tap 2: a stake on the east face's line, the cord turns the corner (an L on the ground); tap 3: the inner face's line is chalked parallel, so the wall's thickness reads as two lines, and a gold line runs off round the court | "הקש על היתד" → "המדידה מוכנה" | a wooden thunk a tap + one rising kinnor note each (3 resolve) | in the glide after tap 3: `f_wall_rows` (מדות ה, א) |
| W2 | 0:12 | CAM.SURVEY-W, widened to 55 so the lane shows | the pill | 1 tap: "▶ חפירה · 10 כסף" | 4 diggers and a basket boy walk in from the lane with picks and baskets and line up on the chalk line: the paid step is SEEN | the pill | tools clink as they come | — |
| W3 | 0:15 | CAM.TRENCH | the trench's end (the ring on the ground, the pointer above) | 4 taps (pick) | each tap: the builder's pick bites at the end; ≈ 3 amot of trench opens down toward the pale rock, the spoil banks outside, a boy carries a basket to the cart; tap 4: the pick rings on the rock and the floor turns pale (stages.js:1592); the diggers carry the trench on round the corner | "חפור עד הסלע" → "הגענו לסלע!" | pick clack; tap 4 a bright ring + a tof dum (`split`) | — |
| W4 | 0:25 | CAM.WALL-W | the empty stock pile, then the pill | 1 tap on the pill | the panel says one line; on "▶": a loaded ox cart comes into frame on the quarry road (the last ≈ 20 amot, 2 s) and unloads 8 rough blocks onto the pile one by one (0.2 s each); the footing course's 8 gold ghosts light along the stretch; the FIRST (the corner) glows brighter | panel "הצוות יניח 8 אבנים בחומה. את הראשונה תניח אתה, במנוף." · button "▶ הביאו 8 אבנים" | cart creak + 8 thuds | — |
| W5 | 0:32 | CAM.WALL-W → CAM.SLOT-W | the crane's hook over the first block | 1 tap → the crane game | 1.2 s in the world first: the rope team takes the tag lines, the rope takes up, the block leaves the pile; then the game; after it the crane lowers the first stone onto the rock at the corner (`liftStone('wall')`), dust, the builder's proud gesture, the rope team unhooks | "הרם את האבן הראשונה" → "האבן הראשונה במקומה!" | `precision` → `land` + swell | the game's own line; ⏸ while it lands: `f_wall_40` (יוספוס, מלחמה ה, 196) |
| W6 | 0:50 | CAM.WALL-W; CAM.SLOT-W for each landing (2 s) | the rough block on the builder's banker | 3 taps a stone × 7 | tap 1 drafted margins (rough → drafted), tap 2 the boss dressed (→ dressed), tap 3 the rope team hooks it and the crane SETS it on the stretch (≈ 2.5 s), and the next ghost lights; around him the masons dress at their bankers and 2 carriers bring the next block; past the corner, the gangs set stones on the far walls | a float only ("עוד 5") | chisel tik ×2 (rising) + a low dum on landing (`stoneSet`: 8 stones = a phrase) | lift 2: `f_wall_east` (מדות ב, ד); lift 5: `f_wall_levels` (מדות ב, ו) |
| W7 | each later segment | CAM.WALL-W | the empty pile → the pill; then the hook | 1 tap + the quick lift (≈ 5 s, index.js:853) | W4 without the panel: the cart, 8 blocks, 8 ghosts; the segment's first stone goes up by the player's crane | "▶ הביאו 8 אבנים" | creak + thuds; `land` | — |
| W8 | stone 16 (≈ 3:30) | CAM.WALL-W, a 0.9-s pan to the corner; the game's backdrop is CAM.SLOT-W on the corner | the corner block on the banker (bigger, two faces to dress) | 1 tap → the dressing game | before it, two carriers bring the corner block and the corner's ghost glows; after it, the block has drafted margins on both faces, the rope team hooks it and the crane sets it ON the corner, dust; the corner stands proud of both faces | "סתת את אבן הפינה" → "אבן הפינה במקומה!" | `precision` → `land` | the game's own line |
| W9 | the stock runs out (≈ 5:00) | CAM.WALL-W | the bare pile, then the pill | the pill → the board | the pile is bare, the hook hangs idle, the masons sit on their bankers (`setCrews(…, {waiting})`, exists); after the board a train of 2–3 ox carts comes down the quarry road and unloads at the pile (the win, SEEN); the masons get up and go back to work | "נגמרו האבנים" → "▶ המחצבה · כ־45 אבנים" | `board`; the carts' creak on return | on the board's result card |
| W10 ★ | course 1 done (logical 32, ≈ 9:00) | CAM.REVEAL-W along the north face | — | a tap skips | the first course round the corner; the gangs' stones along the far walls; the scaffold's first lift raised on the stretch; the hook swings to the next course | "נדבך 1 מתוך 8" | `reveal` swell (the `course` flourish) | `f_herod_years` |
| W11 | course 2 (logical 32 and 48) | as W8, then as W5 | the course's corner stone | the dressing game at 32, the crane game at 48 | as W8 and W5: the corner rises a course | "סתת את אבן הפינה" · "הנח את אבן הפינה במנוף" | `precision` | the games' lines |
| W12 | after courses 2, 4, 6 | CAM.WALL-W at the corner; the game's backdrop is the corner | the engineer's plumb line at the corner | the plumb game | the engineer climbs the scaffold, hangs the plumb and lays the level on the course; after the game the bob hangs true by the corner | "בדיקה: אנך ופלס" | `precision` | the game's line (topic `herod`) |
| W13 ★ | after each check | CAM.REVEAL-W as W10, 2 s | — | a tap skips | the height read against the scaffold (a new lift every 2 courses); the far walls rise evenly with the stretch | — | swell | `nextFact('wall')` |
| W14 | the rope (logical 102, course 4) | CAM.SLOT-W on the hook | the jammed rope at the jib's sheave (the pointer on the rope) | 2 taps (`pull`) | the block hangs askew and swings; tap 1: the builder and the rope team haul on the tag line; tap 2: the rope runs free and the block goes on down to its slot | "החבל נתקע" → "משוך בחבל" | a tension sting; the rope's creak | — |
| W15 | the crack (logical 193, course 7) | CAM.WALL-W on the banker | the cracked block (a dark crack line) | 2 taps (`split`) | tap 1: a wedge goes into the crack; tap 2: the block splits; two carriers take the halves to the rubble and a whole block comes from the pile | "גוש סדוק" → "בקע אותו" | crack + a low rumble | — |
| W16 | the finish (the coping, then the beams) | CAM.TOP on the stretch's top | the next coping stone / beam | 1 tap an item (4 a step) | the coping: the crane hoists a coping stone onto the top and 2 masons on the top lift set it, one a tap; the beams: the cedar caravan comes in on the lane with logs, 2 sawyers square one at the saw bench, and the crane hoists the beam onto the chambers' walls, one a tap | "כרכוב החומה" · "קורות הלשכות" | `build` | when the cedar arrives: `f_trade_tyre` (עזרא ג, ז) |
| W17 | the inspection | CAM.WALL-W on the key found badly set, if any | the key stone | the plumb game; a reset is 3 taps (`split`) | the engineer walks the stretch; a key set below 0.45 (content.js:152) is lifted out by the crane and set again | "בדיקה" → "מפרקים ומניחים מחדש" | `precision` | — |
| W18 ★ | the moment (moments.js `wall`, exists) | the moment's own frame | — | the moment's puzzle | the court's walls stand | (the moment's card) | `moment` | the moment's card; then ⏸ `f_wall_crowded` (אבות ה, ה) |

**Acceptance, by real touch at 390×844 (QA9's test/real-play.cjs, SITE9's site test).** At the moment of each tap:
- the target's screen point is inside x 60…330, y 130…694, and not hidden;
- the builder is ≤ 65 amot from the camera and his projected height is ≥ 80 px;
- exactly one prompt is on screen, and no toast.

After each tap, the world's own state has moved:
- W1: one stake more;
- W3: the trench's length grows;
- W4: the pile's count is up by 8 before the crane prompt shows;
- W5: `siteInfo('wall').set` ≥ 1, with the stone drawn at the corner slot;
- W6: the banker stone goes rough → drafted → dressed, then `set` + 1 at a slot ≤ 30 amot from the banker;
- W9: the pile's count is up after the board.

Between two consecutive stones the camera never frames more than 120 amot of ground (no wide frame outside ★).

**Return, idle, night, Shabbat.**
- **Return:** the camera lands on CAM.WALL-W, never on the court's footprint. The stones the gangs set while he was away
  glow for 2 s, and a flag counts them ("הצוות הניח 12 אבנים").
- **Idle** over 8 s with nothing to tap: the gangs keep working in frame, and one fact ⏸ from `nextFact('wall')` shows.
- **Night:** the site sleeps by torchlight. The first night at the wall shows `f_wall_guards` (מדות א, א); a later one shows
  `f_wall_officer` (מדות א, ב).
- **Shabbat:** the tools are laid down and there are no crews; `f_wall_shabbat` (יבמות ו, א).

**Asks for the wall.**
- **SITE9, P0:** `focus('wall')` uses CAM.SURVEY-W, CAM.TRENCH and CAM.WALL-W in the survey, the dig and the courses. Add a
  'wall' branch beside the Mount's at stages.js:4411 and :4417; the 220-amot `frame` stays for the moments only.
- **SITE9, P1:**
  - the builder's stretch (⚑W): DEF.wall `spot` and `crane` (stages.js:45–46), crews.js SITES.wall (crews.js:63–64), and
    the stretch's slots;
  - the survey's stake per stroke, as the Mount's `surveyProps` (stages.js:4358–4378);
  - the trench's end per stroke;
  - the diggers' walk-in (W2), the cart's unload (W4, W7), the caravan after a board (W9) and the waiting pose (exists).
- **SITE9, P2:** the scaffold's lift every 2 courses; the coping and the beams (W16).
- **FLOW9:**
  - the words above;
  - the key's pill follows its game (ui.js:272 says "…: הנח אותה בעצמך" for every key): crane → "הנח את אבן הפינה
    במנוף", dress → "סתת את אבן הפינה", quarry → "חצוב את אבן הפינה";
  - W4's order: the stones arrive, then the first ghost glows, and only then the crane prompt (as the Mount's M7);
  - the fact ids at ⏸;
  - the camera per beat. `followTarget` (index.js:577) should re-aim past 150 amot for every job, not only for a job with
    a spot, so the wall is never framed from 220 amot.
- **QA9:** the acceptance above, from a save at the wall's start.

## 7. The gates (`gates`, שערי העזרה) — the shot list (wave 9, DESIGN9)
**The stage, from the code (1428e5c).**
- **Six gatehouses rise at once** (stages.js:57): two on the north, three on the south, and the Ezrat Nashim's east gate.
  Nikanor and Beit HaMoked are stages of their own.
- **The working front** is the east gate (x 138…150, z −13…13, base 6).
  - The crane is on its masonry at (143, 6), H 22, reach 12. Its stock pile sits under the jib at ≈ (156, 6).
  - The builder's banker is beside the pile at ≈ (156, −1). The next slot is ≈ 9 amot away, so it is compact already.
  - The builder's spot is (159, 22), facing (150, 6). The crews' stands are at x 153…161 (crews.js:67).
- **The work (content.js:158):** 6 courses × 24 logical stones (144), 45 stone a segment; survey and dig 10 silver each.
- **The keys (content.js:175–185):**
  - the first stone (crane) and the jamb's corner at j 12 (dressing), then crane and dressing alternate;
  - the LINTEL by crane at logical 120, the last course's first stone (content.js:181).
- **The events:** the rope at logical 57 (course 3), the crack at 109 (course 5).
- **The finish:** cedar doors (70 cedar), then gold on the doors (60 gold, מדות ב, ג).
- **The moment:** "שבעת השערים" (moments.js; מדות א, ד).
- **The doorway:** the game's is 20 amot high and 10 wide, as every opening in the Temple (`f_gates_size`).

**The picture that grows:** the two jambs rise in turns, and the OPENING reads as a gap between them from the first course.
The lintel then closes it, and the doorway exists.

**The gates' cameras** (the conventions of §6).
| id | target | real dist | el | az | the frame |
|---|---|---|---|---|---|
| CAM.SURVEY-G | the threshold's stake, ground + 1 | 45 | 28° | bearing(stake→builder) + 25° | the builder, the two jambs' stakes, the cord between them |
| CAM.GATE (new, frontal) | the doorway's middle (150, half the built height, 0) | 58 | 14° | 0 (east of the gate, looking west through it) | both jambs and the gap, the builder at his banker to one side, the court seen through the gap |
| CAM.WALL-G | `wallView('gates')` (banker ≈ (156, −1), slot on the east face) | 64 | 20° | normal + 35° | as CAM.WALL |
| CAM.SLOT-G | the jambs' tops (150, 26, 0) for the lintel, else `nextSlot` | 40 | 10° | 0 | the lintel over the gap, both jambs' tops |
| CAM.DOORS (new) | the doorway at (151, 16, 0) | 36 | 12° | 25° | the leaf on its pivot, the carpenters, the goldsmith's anvil |
| CAM.REVEAL-G ★ | G0: the court (−23, 6, 0) · G11: a dolly from (175, 14, 0) to (110, 12, 0) through the doorway | G0 380 | G0 45° | G0 −30 | G0: 2 s · G11: 3 s, a tap skips |

**The beats.**
| # | t | camera | target (pointer) | player | the world does | words (≤ 5) | sound / music | fact ⏸ |
|---|---|---|---|---|---|---|---|---|
| G0 ★ | 0:00 | CAM.REVEAL-G over the court | — | a tap skips | the six gatehouses' footprints glow in gold in the walls; the wall's gangs split into six and walk to them; the crane is raised onto the east gatehouse's footing | "שערי העזרה" | `reveal` swell → `build` | `f_gates_7` (מדות א, ד) |
| G1 | 0:05 | CAM.SURVEY-G | the north jamb's stake, then the south's | 3 taps | tap 1: the north jamb's stake; tap 2: the south jamb's stake, 10 amot away, the cord between them (the doorway's width); tap 3: the threshold's line and both jambs' outlines are chalked | "הקש על היתד" → "המדידה מוכנה" | a thunk a tap + a rising kinnor note | `f_gates_size` (מדות ב, ג) |
| G2 | 0:12 | CAM.SURVEY-G | the pill | 1 tap "▶ חפירה · 10 כסף" | 4 diggers walk in with picks and baskets | the pill | tools clink | — |
| G3 | 0:15 | CAM.TRENCH on the jambs' footings | the trench's end | 4 taps (pick) | two short trenches, one under each jamb, cut down; the threshold's bed between them; baskets to the cart | "חפור עד הסלע" → "הגענו לסלע!" | pick; a ring on the rock | — |
| G4 | 0:25 | CAM.GATE | the empty pile, then the pill | 1 tap | a cart unloads 8 blocks at the pile; 8 ghosts light, 4 on each jamb; the first glows | panel "הצוות יניח 8 אבנים בשער. את הראשונה תניח אתה, במנוף." · "▶ הביאו 8 אבנים" | creak + thuds | — |
| G5 | 0:32 | CAM.GATE → CAM.SLOT-G | the hook over the first block | 1 tap → the crane game | as W5: the first stone at the north jamb's outer corner, dust | "הרם את האבן הראשונה" → "האבן הראשונה במקומה!" | `precision` → `land` | the game's line; ⏸ `f_gates_names` (מדות א, ד–ה) |
| G6 | 0:50 | CAM.GATE; CAM.SLOT-G per landing | the block on the banker | 3 taps a stone | dressed and set as W6; the jambs rise in turns, north then south, and the opening stays a clean gap; the gangs work the other five gatehouses (seen at G11) | a float only | chisel ×2 + a dum (`stoneSet`) | lift 2: `f_gates_water` (מדות ב, ו); lift 5: `f_gates_corinth` (יוספוס) |
| G7 | stone 12 | CAM.GATE, pan to the jamb's inner edge | the jamb's corner block on the banker | the dressing game | the arris stone, where the jamb's face meets the opening: its drafted edge frames the doorway; the crane sets it | "סתת את אבן הפינה" → "אבן הפינה במקומה!" | `precision` → `land` | the game's line |
| G8 | logical 57 / 109 | as W14 / W15 | the jammed rope / the cracked block | 2 taps | as W14 / W15 | "החבל נתקע" · "גוש סדוק" | a sting · a crack | — |
| G9 | after courses 2 and 4 | CAM.GATE | the plumb on the jamb | the plumb game | the engineer hangs the plumb on each jamb: if they are not true, the doors will not hang | "בדיקה: אנך ופלס" | `precision` | the game's line |
| G10 | logical 120 (the last course) | CAM.SLOT-G on the jambs' tops | the lintel on the crane's hook | 1 tap → the crane game (`lintel`; its hint exists: "הקש כשהמשקוף מעל שני העמודים") | 1.2 s first: the long block rises and swings over the gap; after the game it is lowered onto both jambs, dust; the doorway exists | "הנח את המשקוף במנוף" → "השער עומד!" | `precision` → swell | ⏸ `f_gates_tadi` (מדות ב, ג) |
| G11 ★ | right after G10 | CAM.REVEAL-G: a dolly through the new doorway into the court | — | a tap skips | the court framed by the gate; the five other gatehouses rising | — | `reveal` swell | — |
| G12 | the last course | CAM.WALL-G | the block on the banker | 3 taps a stone | the gatehouse's top course over the lintel | — | `build` | idle ⏸ `nextFact('gates')` |
| G13 | finish 1: the cedar doors (70 cedar) | CAM.DOORS | the next part of the leaf | 1 tap an item (4 a step) | the cedar caravan comes in with logs; 2 sawyers saw planks at the saw bench (169, −46); carpenters join a leaf; tap 4: the leaf is hung on its pivot and swings once | "דלתות ארז" | a saw's rasp; a creak as it swings | when the leaf is hung: `f_gates_keys` (מדות א, ט) |
| G14 | finish 2: gold on the doors (60 gold) | CAM.DOORS, closer (28) | the next plate | 1 tap a plate | the gold comes in a chest on a cart with two guards; a goldsmith beats the leaf on his anvil; a plate is laid on the door and catches the sun | "ציפוי זהב" | a bright kinnor, bell-like | `f_gates_gold` (מדות ב, ג) |
| G15 | the inspection | CAM.GATE | a badly set key, if any | the plumb game; a reset | as W17 | "בדיקה" | `precision` | — |
| G16 ★ | the moment (moments.js `gates`, exists) | the moment's frame | — | the moment's puzzle ("הקש על הצד של העזרה שבו עומד השער") | all seven gates | (the card) | `moment` | the moment's card |

**Acceptance (additions to §6):**
- at G6, after each stone the gap between the jambs is still open, and its projected width is ≥ 40 px;
- at G10, `siteInfo('gates')` shows the lintel set and both jambs' top stones set before "השער עומד!" shows.

**Asks.**
- **SITE9:**
  - the gates' focus at working distance (CAM.GATE / CAM.WALL-G);
  - the jambs rise in turns and the opening stays a gap (the east gatehouse's slot order);
  - the lintel's slot spans both jambs;
  - the leaf on its pivot (G13) and the plate (G14): P2.
- **FLOW9:** the words; the lintel's pill "הנח את המשקוף במנוף"; the facts.

## 8. The altar (`yesod`, `sovev`, `guf`, `karnot`, המזבח) — the shot list (wave 9, DESIGN9)
**The rule of this site:** the altar's stones are whole field stones from the valley of Beit Kerem, never touched by iron
(מדות ג, ד: `f_yesod_beitkerem`, `f_yesod_iron`).
- **They are never dressed.** They are CARRIED, FITTED and SEATED with a wooden mallet. No chisel, no drafted margin, no
  change to the stone's face, ever.
- **Even the whitewash is laid without iron** (`f_yesod_trowel`).

**The stage, from the code (1428e5c).**
- **Four stages, each ending in its moment** (content.js:163–166; moments.js):

  | stage | courses × logical stones | segment | survey / dig | finish | moment |
  |---|---|---|---|---|---|
  | yesod | 2 × 32 | 40 whole stones | 15 / 15 silver | none | "בלי ברזל" |
  | sovev | 2 × 32 | 40 whole stones | 15 / none | the red line (12 stone) | "חוט הסיקרא" |
  | guf | 4 × 32 | 40 whole stones | 15 / none | the kevesh (60 whole stones) | "הכבש והסיד" |
  | karnot | 1 × 16 | 40 whole stones | 15 / none | the whitewash (20 stone) | "הקרנות והאש הראשונה" |

- **The keys:** every course's first stone is the "whole stones" game (content.js:179). There are no events (they are for
  ashlar only).
- **The footprint:** x −54…−22, z −19.5…12.5, on the court's floor at y 16. The kevesh is to the south (x −46…−30,
  z 12.5…42.5).
- **The crane** stands at (−13, −31), H 24; its stock is at ≈ (−16, −28) and the builder's banker at ≈ (−11, −23).
- **The builder's spot** is (−16.5, −4), facing the east face at x −22. The slots start on the east face, ≈ 20 amot from the
  banker: compact already.
- **Two piles.** The crews' whole-stone pile is at (−62, −25) (crews.js:79), behind the altar from the site's camera. It
  becomes one pile, the one by the crane (ask below).
- **Today's hero at the altar strokes `dress`, `dress`, `tamp`.** The stroke kinds come from state.js:406 and index.js:656,
  and the banker's workpiece goes rough → drafted → dressed (index.js:675). That is a dressing, and the owner's standard
  forbids it here (⚑S5). The fix is in the asks below.

**The altar's cameras.** The site's own azimuth, −60 from the NE, passes north of the Nikanor gatehouse, which hides the
altar from the east once it is built (stages.js:93). Every close preset keeps it.
| id | target | real dist | el | az | the frame |
|---|---|---|---|---|---|
| CAM.SURVEY-A | the stake, ground + 1 | 45 | 30° | bearing(stake→builder) + 25°, kept between −90 and −30 | the builder, the stake, the cord along the face |
| CAM.WALL-A | the midpoint of the straw pile / banker and `nextSlot` | 58 | 24° | −60 fixed | the straw pile and the builder low; the course, the next place and two setters high |
| CAM.PAVE-A | the kevesh's next strip | 60 | 40° | 30 (from the south-east) | the ramp growing from the south, the carriers on it |
| CAM.TOP-A | the altar's top, the next horn's corner (y ≈ 25) | 50 | 45° | −60 | the top, the corner, the plasterers' band |
| CAM.REVEAL-A ★ | the altar's centre (−38, 20, −3.5) | 200 | 40° | −60 | 2.5 s, a tap skips |

**The beats.**
| # | stage · t | camera | target (pointer) | player | the world does | words (≤ 5) | sound / music | fact ⏸ |
|---|---|---|---|---|---|---|---|---|
| A0 ★ | yesod · 0:00 | CAM.REVEAL-A | — | a tap skips | the altar's 32 × 32 square glows on the court's pavement; the gangs come from the gates carrying wooden mallets and baskets, no iron | "המזבח" | `reveal` swell → a softer `build` | `f_yesod_base` (מדות ג, א) |
| A1 | 0:04 (no tap) | CAM.WALL-A on the builder | — (2 s, before the first stake) | watches | at a wooden rack beside him the builder lays down his iron pick and chisel and takes the wooden mallet (`W.heroTool('wood')` exists, index.js:674); the gangs lay their iron tools on the rack too | "כאן — בלי ברזל" | one low note | `f_yesod_iron` (מדות ג, ד) |
| A2 | 0:07 | CAM.SURVEY-A | the NE corner's wooden stake, then the next | 3 taps | tap 1 the NE corner's stake; tap 2 the SE's, the cord along the east face; tap 3 the square closes (a gold line round it), and a second line one amah in is chalked on the north and west only | "הקש על היתד" → "המדידה מוכנה" | a wooden thunk + a rising note | `f_yesod_sides` (מדות ג, א) |
| A3 | 0:14 | CAM.SURVEY-A | the pill, then the bed's corner | 1 tap "▶ חפירה · 15 כסף", then 4 taps | diggers level the bed under the square; at the SW corner a channel is cut (המחשה) | "חפור עד הסלע" | pick; a ring | after: `f_yesod_holes` (מדות ג, ב) |
| A4 | 0:25 | CAM.WALL-A | the bare straw, then the pill | 1 tap | ox carts from Beit Kerem (the `beitkerem` caravan, fieldstones, exists) unload ROUND, UNHEWN stones onto straw by the crane, one by one (the carts, the straw and the rounded look are המחשה; the source says whole stones from Beit Kerem); 8 irregular ghosts light on the course; the first glows | panel "הצוות יניח 8 אבנים שלמות. את הראשונה תבחר אתה." · "▶ הביאו 8 אבנים שלמות" | creak + soft thuds on straw | `f_yesod_beitkerem` (מדות ג, ד) |
| A4b | when whole stones run out | CAM.WALL-A | the bare straw → the pill | the pill → the board (the quarry's level, played in Beit Kerem) | as W9: the setters wait; after the board the Beit Kerem carts come in and unload | "▶ בקעת בית כרם · כ־40 אבנים שלמות" | `board` | on the board's card |
| A5 | 0:30 | CAM.WALL-A → the game | the straw pile | 1 tap → the "whole stones" game | before: the builder looks over the pile; after: two men carry the chosen stone in their arms and seat it at the NE corner, and a chipped one is set aside | "בחר אבן שלמה" → "האבן הראשונה במקומה!" | `precision` → `land` | the game's line: `f_yesod_chip` (מדות ג, ד) |
| A6 | 0:45 | CAM.WALL-A | the whole stone on the straw | 3 taps a stone × 7 | tap 1 CARRY: the builder and a helper carry it to its place (the hero's `carry` act, stages.js:2366); tap 2 FIT: he turns it in its bed and knocks it once with the mallet until its face sits in line; tap 3 SEAT: the mallet, it settles, a puff of lime; the next ghost lights. The setters carry stones in their arms, and lime is mixed in a trough. **The stone's face never changes.** | first stone only: "נושאים, מתאימים, מושיבים" | a soft wooden knock ×2 + a low dum (no chisel tik) | between segments: `f_yesod_touch` (מדות ג, ד) |
| A7 | each course's first stone | CAM.WALL-A → the game | the straw pile | the "whole stones" game | as A5 | "בחר אבן שלמה" | `precision` | the game's line |
| A8 ★ | yesod done | moments.js `yesod` "בלי ברזל" (exists) | — | the moment's puzzle | the base course of the altar | (the card) | `moment` | the card |
| A9 | sovev · start | CAM.SURVEY-A | the stake one amah in from the yesod's face | 3 taps | the cord one amah in: the step back where the altar's body starts | "הקש על היתד" | thunk | `f_sovev_5` (מדות ג, א) |
| A10 | sovev · courses | CAM.WALL-A; the scaffold's lift (3 amot) | the stone on the straw | 3 taps a stone (carry, fit, seat) | as A6: the body rises 5 amot above the yesod | — | as A6 | `f_sovev_walk` (זבחים ה, ג); idle `f_sovev_right` |
| A11 | sovev · finish, then its moment | CAM.WALL-A, low from the side (el 8°) | the red cord at mid-height | 1 tap an item, then the moment `redLine` (exists: drag the cord to the middle) | painters stretch a cord dipped in red round the altar at half its height | "חוט הסקרא" | `moment` | `f_sovev_red` (מדות ג, א), then `f_sovev_updown` (קנים א, א) |
| A12 | guf · courses | CAM.WALL-A; the scaffold climbs | the stone on the straw | 3 taps a stone | the altar climbs to its top, 4 courses | — | as A6 | `f_guf_top` (מדות ג, א) |
| A13 | guf · finish: the kevesh | CAM.PAVE-A | the ramp's next strip | 1 tap a strip (4 a step) | whole stones carried up and seated; the ramp grows from the south, strip by strip, up to the top | "הכבש" | `build` | `f_guf_ramp` (מדות ג, ג), then `f_guf_nosteps` (שמות כ, כג) |
| A14 ★ | guf's moment | moments.js `guf` "הכבש והסיד" (exists) | — | the moment's puzzle | the ramp and the altar | (the card) | `moment` | the card |
| A15 | karnot · the horns | CAM.TOP-A | the next corner's horn stone | 3 taps a stone (carry, fit, seat) | a horn stone at each corner of the top, one amah square | — | as A6 | `f_karnot_amah` (מדות ג, א) |
| A16 | karnot · finish: the whitewash | CAM.TOP-A → CAM.WALL-A | the next plaster band | 1 tap a band (4 a step) | plasterers whiten the altar band by band with wooden floats, never an iron trowel (the source forbids the iron trowel; the wooden float is המחשה) | "סיד לבן" | `build` | `f_yesod_trowel` (מדות ג, ד), then `f_sovev_white` (מדות ג, ד) |
| A17 ★ | karnot's moment | moments.js `karnot` (exists) | — | the moment's puzzle (the horns to their corners) | the four horns; the wood; the first fire | (the card) | `moment` → the first night's fire | `f_guf_wood` (תמיד ב, ג), then `f_karnot_fire` (ויקרא ו, ו) |

**Acceptance (additions):**
- at every altar tap, no chisel is drawn in the builder's hand, and the stone's material and geometry are the same before and
  after the tap;
- the hero's tool is `wood` from A1 to A17.

**Asks.**
- **FLOW9 (P1, correctness):**
  - on the altar's four stages, a stone's strokes are `carry`, `tamp`, `tamp` (carry, fit, seat), not `dress`, `dress`,
    `tamp` (state.js:406 `act`; index.js:656 `strokeKind` returns 'dress' for every stone);
  - the banker's workpiece stays a whole field stone that never changes (index.js:675, `W.workpiece`);
  - the key's word is "בחר אבן שלמה", not "הנח … בידיך": the game chooses whole stones and does not set them.
- **SITE9:**
  - one whole-stone pile, by the crane (crews.js:79 `pile` [−62, −25] → ≈ [−18, −30]), on straw;
  - the Beit Kerem carts unload there (P2);
  - A1's rack (P2).

## 9. The rest of Phase A (outline: the picture that grows · the key beat · the machines · the reveal)
- **sorag** (the chel and the soreg): a low terrace ring rises round the court, then the lattice fence; the key beat is the steps
  (12 × ½ amah) cut into the terrace; sawyers make the lattice; reveal: the fence closes the ring (moment `breaches`: 13 repairs).
- **nashim** (Ezrat Nashim): four corner chambers at the court's corners rise as four small sites in one frame; the gallery's
  cedar beams (Middot 2:5) are hoisted; reveal: the court from the gallery (moment: the wormy logs of the wood chamber).
- **nikanor**: the gatehouse and the 15 rounded steps; the key beat is the bronze doors arriving from Acre after the storm
  (Yoma 38a) — the doors ride in on a cart and are hung; reveal: the 15 steps laid one a tap (the Levites' place).
- **lishka** (the chambers): three sites; the key beat is Gazit's smooth dressed stone (Middot 5:4), the dressing close-up;
  cedar ceilings; reveal: Beit HaMoked's fire lit.
- **kiyor**: a bronze casting site: a clay mould in a pit, a furnace and bellows; each tap pours one of 12 pours (a glowing melt line
  rises); reveal: the 12 spigots open and the water runs (exists).
- **ulam**: the façade climbs course by course in white marble; the five lintels swing in on the crane (moment: lintels); the
  golden vine; the camera frames the façade from the court at a low angle — the building's height is the progress.
- **heichal**: the long block rises behind the façade; the gilders' tables on the scaffold; reveal: the façade at sunrise.
- **kodesh**: the last block; the craftsmen lowered in boxes (Middot 4:5); the inside is never shown; reveal: the whole House.
- In chapter 4 the stones are big and many: each segment's ★ is the course line reaching the next scaffold lift.

## 10. Music and sound map (for MUSIC8B and GAMES8B)
| where | music state (MUSIC8B) | cues (events) | sound (audio.js) |
|---|---|---|---|
| the opening | swell → `build` | — | — |
| strike runs (survey, boulders, dig, stones) | `build`; a tof layer that rises with the combo (3 / 6 / 10) | `split` (a boulder or block splits: a tof dum), `land` (a stone is set: a low dum) | the stroke on impact (exists) |
| precision games | `precision` | the game's own | the game's own |
| the board | `board` | — | the board's own |
| reveals ★ and moments | `moment` swell 3 s, then back | `reveal` | — |
| story cards, the name, the fact line | duck | — | — |
| night | `night` | — | torches crackle (P1) |
| everywhere on a site | — | — | P1: a quiet site bed — chisel ticks, a pick's clink, an ox lowing, the treadwheel's creak — from the crews in view |
A nice-to-have (M10): each stone set adds one note of a kinnor phrase; 8 stones = the phrase resolved on the segment's last.

## 11. Facts at pauses (for FLOW8B and FACTS8B; wave 9 for FLOW9)
The ids are FACTS8B's, in content/facts.json (204 facts, verified). After a beat's own fact, `nextFact(stage)` rotates the
pool. Each fact shows once.
- **har:**
  - `f_har_500` (M2), `f_har_prepare` (M5), `f_har_great` + `f_stone_crane` (M8), `f_herod_workers` / `f_herod_priests` (M9);
  - `f_wall_margins` + `f_wall_setback` (M10's lifts), `f_stone_quarry` + `f_stone_tools` (M11), `f_herod_marble` (M13);
  - `f_har_rain` (the first night), `f_wall_shabbat` (Shabbat).
- **wall (wave 9):**
  - `f_wall_size` (W0), `f_wall_rows` (W1), `f_wall_40` (W5), `f_wall_east` + `f_wall_levels` (W6's lifts);
  - `f_herod_years` (W10), `f_trade_tyre` (W16), `f_wall_crowded` (W18);
  - the night: `f_wall_guards`, `f_wall_officer`; Shabbat: `f_wall_shabbat`.
- **gates (wave 9):**
  - `f_gates_7` (G0), `f_gates_size` (G1), `f_gates_names` (G5), `f_gates_water` + `f_gates_corinth` (G6's lifts);
  - `f_gates_tadi` (G10), `f_gates_keys` (G13), `f_gates_gold` (G14).
- **altar (wave 9):**
  - yesod: `f_yesod_base` (A0), `f_yesod_iron` (A1), `f_yesod_sides` (A2), `f_yesod_holes` (A3), `f_yesod_beitkerem`
    (A4), `f_yesod_chip` (A5), `f_yesod_touch` (A6);
  - sovev: `f_sovev_5` (A9), `f_sovev_walk` (A10), `f_sovev_red` + `f_sovev_updown` (A11);
  - guf: `f_guf_top` (A12), `f_guf_ramp` + `f_guf_nosteps` (A13);
  - karnot: `f_karnot_amah` (A15), `f_yesod_trowel` + `f_sovev_white` (A16), `f_guf_wood` + `f_karnot_fire` (A17).
- **the House:** `f_ulam_opening`, `f_ulam_cedar`, `f_ulam_vine`, `f_heichal_100`, `f_heichal_waves`, `f_kodesh_boxes`.

## 12. Asks, by owner
**Wave 9:** the asks for the wall, the gates and the altar are at the end of §6, §7 and §8. By priority:
- **P0:** each site's focus at working distance (the same fault as the Mount's: `focus('wall')` is ≈ 220 amot away on a
  phone);
- **P1:**
  - the words follow the key's game;
  - the altar carried, fitted and seated, never dressed;
  - the materials seen arriving;
  - the builder's stretch at the NE corner (§6 ⚑W).

**The camera's owner (16:27):**
- The world's `focus(id)` is CAM.WALL (SITE); the game calls it for the stone jobs and never frames them itself (FLOW).
- A world beat that moves the camera holds it until the beat is done, and the game does not re-aim meanwhile:
  `deliverKeyStone`'s shot along the cart's lane.

**Wave 8B (kept for the record):**
- **SITE8B** (stages.js, crews.js): CAM.* presets or `boulderView(i)` + `clearView` (R1, R2); the boulder field (§4 ⚑); per
  split: 3 chunks → baskets / the cart → the spoil heap; a levelled-patch tile per boulder with stakes and a count flag; crews at
  the NEXT boulder; the ox-cart shuttle; the crane and the stock pile at the east face in view from ★1; the pile filling at M7
  and after a board (M12); the waiting pose when the pile is empty.
- **FLOW8B** (game/index.js, ui.js): the prompts and the panel line (R6); the pointer and ring (R2); tap-anywhere during a run
  (R3, index.js:449 `onBoulderTap` / the canvas's empty tap); the camera per beat — never `focus('har')` wide after the opening
  (index.js:1251 `lookAtBoulder`'s fallback, :489 `followTarget`); M7's order: the stones arrive → the first ghost glows → only
  then "הרם את האבן הראשונה" (ftue 3, index.js:1340); facts at ⏸ via `nextFact('har')`; toasts held out of strike runs.
- **GAMES8B**: the crane, quarry and plumb games open from their world target (the pointer on the hook, the corner, the plumb) and
  hand back to the world shot that shows their result landing in 3D.
- **MUSIC8B**: the states in §10; three cues if cheap: `split`, `land`, `reveal`.
- **FACTS8B**: the ids in §11 under their stage and under `stone`, `quarry`, `herod`.

## 13. ⚑ For the owner (draft, each with a default)
- ⚑S1 The Mount's 12 boulders move into one field on the east shoulder, so the camera stays close and the run ends at the wall
  [default: yes].
- ⚑S2 Wide shots only at reveals: the cleared Mount, each finished course (short), each stage's moment [yes].
- ⚑S3 During a run of strokes a tap anywhere acts on the marked target [yes].
- ⚑S4 Materials always arrive in the world (carts, rafts, a chest), and a board's win is seen at the pile [yes].
- ⚑S5 The altar's whole stones are never shown being dressed: carry, fit, seat with a wooden mallet [yes].
- ⚑S7 (wave 9) At the wall, the player's stones rise on one stretch round the court's NE corner, where the crane, the stock and
  his banker stand; the gangs raise the rest of the court behind him (§6 ⚑W) [yes].
- ⚑S6 The treadwheel crane at the Mount (Vitruvius 10.2; the sources do not describe Herod's machines) [keep, marked illus.].

## Sources (fetched 28.9.2026)
1. Tower Craft: Build Skyscraper — Google Play, https://play.google.com/store/apps/details?id=com.quantumgames.skyscraper
2. Tower Craft 3D — Idle Building — App Store, https://apps.apple.com/us/app/tower-craft-3d-idle-building/id1500938520
3. Tower Craft 3D — games.lol, https://games.lol/tower-craft-3d-idle-block-building-game/
4. Tower Bloxx — Wikipedia, https://en.wikipedia.org/wiki/Tower_Bloxx
5. Tower Bloxx review — Pocket Gamer, https://www.pocketgamer.com/tower-bloxx/review/
6. Idle Construction 3D — Google Play, https://play.google.com/store/apps/details?id=com.gpp.idleconstruction
7. Idle Construction 3D beginner's guide — Level Winner, https://www.levelwinner.com/idle-construction-3d-beginners-guide-tips-cheats-strategies-to-become-a-landmark-construction-tycoon/
8. Idle Construction 3D — SEELE, https://www.seeles.ai/games/casual/idle-construction-3d
9. SimCity BuildIt Wiki, Residential Buildings, https://simcity-buildit.fandom.com/wiki/Residential_Buildings
10. Community Buildings in Township (Township Hub), https://townshiphub.blogspot.com/2025/12/community-buildings-in-township.html
11. Hay Day, Production Buildings — SuperCheats, https://www.supercheats.com/hay-day/walkthrough/production-buildings
12. Megapolis Help Center, Materials, https://social-quantum.helpshift.com/hc/en/11-megapolis/faq/2086-materials-usage-and-how-to-obtain-them-1731927011/
13. Minecraft — Wikipedia, https://en.wikipedia.org/wiki/Minecraft
14. Townscaper — Wikipedia, https://en.wikipedia.org/wiki/Townscaper
15. Juice it or lose it — Martin Jonasson & Petri Purho (talk, 2012), https://www.youtube.com/watch?v=Fy0aCDmgnxg
16. The SimCity BuildIt beginner guide — EA Help, https://help.ea.com/en/articles/simcity/simcity-buildit/beginner-guide/
Game-side sources are named where used (Middot, Bava Batra 4a via Sefaria, Josephus via docs/SOURCES-S6.md, content/build_process.json).
