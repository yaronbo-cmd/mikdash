# PRODUCER-S13a — the owner's eyes on v24, in the demo (טיוטה, 30.9 morning)

The owner, 30.9 11:12, after testing in the demo: only the quarry's games (1); the plumb with the needle dropped — put it in the
leveling stages, and the director should go over the camera angles (2); in the demo the kohen "stood and moved side to side for
no visible reason — maybe missing stones, maybe a bug" (3); make sure the building's progress is seen at every stage — at עזרת
הנשים and the lepers' chamber he is not sure he saw it (4); "I seem to work alone: one old pulley, and it is mine" — more
machines, cool machines of the period, a site full of activity (5).
The compass: **"זה הכי חשוב שיהיה כיף ומעניין ותקין"**, and the kohen walking from point to point at his work.

## 0. How I played
- v24 = master bc86895, built once (dist/test.html), every run pinned to it. A phone at 390×844 (dpr 1, touch, he-IL).
- **The demo as the owner enters it:** the menu (☰) → "מצב הדגמה" by touch; each stage from the strip's **"שלבים ▾"** by touch
  (the gold "⏭ לשלב הבא" when it names the stage, else its numbered row), then only touch: the pointer, the coach's hand, the ring,
  the pill, a sheet's big button, a card's gold button, the precision games by their own cue. No autoplay flag. I looked at every
  screenshot I cite.
- **Declared hooks:** the renderer's (`__START_PAUSED` + `__T.simulate`, a render before each shot); `__NO_OPENING` (the opening
  film skipped on the fresh profile); the census and the ×3 "wide" frame put the camera by `__T.look` and put it back (logged
  CENSUS); the course sheets (produce-progress13) drive the world directly with `__NO_GAME`, as site_mount_courses does. I did
  not use `switchMode`, `jumpTo` or `pickStage` — the menu and the picker were tapped.
- **New (test/, mine):** produce-play `--demoPick=id:secs,…` (the above), the kohen's track at 4 Hz (world spot, head on screen,
  height in px, camera and target, job, stock) with the game log's heroReturn / heroAim / heroPlace / workFrame / courseBeat /
  stoneSet, summed per stage and per **idle window** (12 s with no touch: after a course, after a game, when the stock is empty,
  and every 70 s); the **census** (the crane, carts in view, workers on screen by role, the scaffold) in the working frame and ×3;
  produce-progress13.cjs (every stage's courses and finish from fixed cameras, Δ % per step, sheets); produce-sling13.cjs (the
  sling's levels 6–10 by drags).
- Runs (each ≤ 10 min): d1 (har, wall, gates) · d2 (nashim, sorag) · d5 (kiyor, ulam) · e1 (nikanor, lishka) · r1 (guf, karnot) ·
  q1 (the wall played long, kodesh) · q2 (the reel) · pg1–pg4 (the course sheets) · sl13 (the sling) · u1 (the Ulam's work frame at
  two heights: PRODUCER11's declared jump into a regular save, reopened — the only non-demo run). d3/d4 died at their first
  shot (my harness: a shadowed function) and were re-planned; pg1 ran beside d2 for 8 minutes (the queue's producer lane), which
  slowed d2's shots, not its findings. Every stage by touch except יסוד, סובב and היכל (time, and one pick — §7). Shots:
  `wt/producer13/test/out/produce/<run>-NN-<step>.png` (not committed), logs `<run>-log.json`, tracks `<run>-track-<stage>.json`.

## 1. Per stage (demo, v24, by touch)
Games = what opened in the ~2–4 minutes I played each stage from its start (survey → dig → the first segments). Plumb = a course
check came. Progress = the fixed-camera sheets (§4). Machines = the census at the stage's end, working frame · ×3 frame (crane on
screen, carts, people on screen). K80 = the kohen's height at the survey · dig · courses frames. Walks = heroReturn legs, straight
distance → walked (note 3).
| stage | games seen | plumb | progress | machines (work · ×3) | K80 (px) | camera · walks |
|---|---|---|---|---|---|---|
| שיטוח ההר | crane · the great stone — **played itself** (ended before my tap) | no | ✓ (the beat = the whole Mount, Δ 14/37/42 %) | crane off · on; 0 carts; **0 crews — alone** | survey ✓ (d1-08); the rocks **OFF** (d1-13/14); 1st course OFF → 82 | C2, C3 · 1 walk, 51 amot |
| חומת העזרה | crane · the first stone (mine, 35–37 %); **the dress ×2** (the corner stones at 16 and 32, mine, 88 / 91 %) — q1, 6 min to stone 40 | no (course 1 ended by a crew's stone: no beat, no toast — N79) | ✓ courses (×3 Δ 30/65/61 %) · ½ beat (the crane from above) | crane off · on; 0 carts; 1–5 · 3–11 people (d1, q1) | 105 · 89 · 84–98 ✓; OFF twice during walks (q1-29: the gold ring on an empty banker) | C4 · 24/19/19/18 amot every ~4 s with no touch |
| שערי העזרה | — (skipped by N77 at its first stone) | no | ½ (courses 3→6 behind the scaffold: 2.2 % in the work frame) | 9 quarry workers from 1,011 amot | pick 4 px (C1) | 67/4/25/50/52/149, one leg twice |
| עזרת הנשים | crane · the first stone (mine, 99 %) | no | **courses ✓, finish ✗** (2.1 % / 0.3 %) | crane on · on; 0 carts; 2 · 2 | 105 · **HIDDEN** ×2 (N74) · 92 | C5, C6 · 37 east, 35 back west, off the frame |
| הסורג והחיל | crane · the first stone (at the end) | no | ½ (a low strip: ×3 Δ 55/11/7.5 %) | crane on · on; 0 carts; 2 · 4 | 105 · 89 · 82–96 ✓ | 3 amot walked as 26 (the Chel's hub) |
| שער ניקנור | crane · the first stone — **100 % with 0 taps (autopilot)** | no | ? — the game's own working frame at course 1 (and its ×3) is a wall's face at close range (pg2-nikanor-c1/c3-work, -c1-wide); in play I only reached course 1's first segment | crane off · on; 0 carts; 10 · 14 | 105 · 89 · 86–98 ✓ | 21 → 78 and 20 → 80 amot, across the gate |
| הלשכות | crane · the first stone (100 %) | no | — (not measured) | crane off · on; 0 carts; 10 · 13 | pick HIDDEN 6 px · 96 · 88 · 92 | 63 → 193 and 112 → 175 amot |
| יסוד המזבח | (not reached — time) | — | ½ (one amah: ×3 Δ 64 / 3.7 %) | — | — | — |
| הסובב | (not played: my scrolled tap on the picker's row 9 hit the rows above three times — see §7) | — | — | — | — | — |
| גוף המזבח והכבש | **the whole stones** (mine, 100 %) | no | ½ (×3 Δ 34/15/8.7 %: a white block) | crane off · off; 0 carts; **1** · 13 | 105 · **HIDDEN** behind the sovev's plaster (C8) · 81 | **24 amot west, 13 s later 24 back east** (no touch) |
| הקרנות | the whole stones (mine, 100 %) | no (1 course) | — (not measured) | crane off · on; 0 carts; 9 · 12 | 105 · 81–91 ✓ | 27 → 62 amot |
| הכיור | none before time (its first cast stone waiting) | no (1 course) | ✓ close (Δ 42/64 %), ½ from ×3 (6.4 %) | crane on · on; 0 carts; 6 · 11 | pick 67 · 105 · 89 · 85 | **4 → 236 and 9 → 236 amot** (the Azara's hub) |
| האולם | crane · the first stone (at the end) | no | **✗ after course 5** (0 % to course 10, 0 % finish) | crane off · on; **1 cart**; 8 · 9 | pick HIDDEN 12 px · 105 · 89 · 89–95 | 33 → 230; **3 → 222 amot with no stones** |
| ההיכל | (not played — time) | — | **✗ from course 7** (2.2 % to course 14, 0 % finish) | — | — | — |
| קודש הקדשים | crane · the first stone (46 %) | no | **✗ from course 5** (3.5 % to course 10, 2.3 % finish) | crane off · on; 0 carts; 9 · 14 | pick HIDDEN 13 px · courses 87–91, OFF ×3 during walks | **6 → 420, 23 → 379, 310 → 312 amot**; N77 again (the hand on the strip) |

## 2. Note 1 — the games: "only the quarry" is TRUE in v24's demo
**Every game in the demo plays itself, and the quarry's variety is switched off there.** v24 swapped `G.demo` for `reelOn()` in 6
places of index.js (the work frame, the course beat, the quick lift, the course check, the inspection's card, the plan card), but every game still receives
`demo: !!G.demo`, and two gates still read `G.demo`:
- the precision games — the crane (the first / great stone and the quick lift), the dress, the plumb, the whole stones — are
  called with `demo: !!G.demo` (index.js:1219, 1257, 1496, 1549) → **minigames/frame.js:98 `let auto = !!ctx.demo`**: the autopilot
  plays at ×1.5 and the result closes itself after 1.4 s (frame.js:268). A real touch takes over (frame.js:168–170) but nothing
  says so. By touch: the Mount's great stone ended alone before my first tap (d1, "endedAlone"); Nikanor's first stone was set
  "מופת · מושלם · דיוק 100%" with **0 taps** of mine (e1); when I did tap first, it was mine (nashim's first stone, "מופת 99%").
- the board: index.js:1418 `demo: !!G.demo` → match3/index.js:199 `auto = demo` (the goal ×0.45 at 177, no end card at 139).
- **games/cycle.js:64** — `applies()` returns false when `G.demo`: no הקלע של דוד, no נדבך על נדבך, no precision quarry, no board
  rounds. Every quarry action in the demo is the self-playing board.
- **index.js:1665** — the in-between games' invitation after a stage is `!G.demo`: none in the demo.
- In the regular game the cycle does run (PRODUCER-S12 q2: sling → stack → board round 2 → precision quarry).

**What came, by touch, in ~45 minutes of demo over 11 stages:** the crane's key stone ×7 (the great stone, the first stone of each
stage — the same game again and again), the dress ×2 (the wall's corner stones, q1), the whole stones ×2 (the altar). **0** quick
lifts (index.js:1209 fires only when the kohen works a segment's first stone; at ×60 the crews take those), **0** plumbs, **0**
boards (600 stones never run out), **0** in-between games, **0** quarry cycle games.

**האנך והפלס — where it is decided, and why the owner never sees "the level with the needle":**
- The course check every `CHECK_EVERY = 2` courses (**content.js:173**); **state.js:507–511** `checkDue` (only while `s.p ===
  'courses'`); state.js:400 the job 'check' holds the crews; **index.js:1117** the check after the kohen's course-ending stone;
  **index.js:1247–1269** `courseCheck` → `run('plumb', { check: 'courses' })`.
- **minigames/index.js:101** — `if (kind === 'plumb' && ctx.check === 'courses') { setup.rounds = 3; … quick }`: only the three
  plumb-line rounds. The A-frame level whose string crosses the gold notch — the owner's "הפלס עם המחט" — is rounds 4–5
  (plumb.js `kind() { return this.r < 3 ? 'plumb' : 'level'; }`), so it comes **only at a stage's inspection** (index.js:1549).
- In a demo stage (a few minutes) the first check needs two whole courses (48–64 stones), and it never comes at yesod and sovev
  (2 courses: the last stone moves the site to its finish, so `checkDue` is false), karnot and kiyor (1 course).
- **Where it should go — "שלבי הפילוס":** (1) the Mount: its work IS leveling — a level check at every course end (not every
  second), the level first (2 level rounds + 1 plumb); (2) the Mount's finish "ריצוף הרחבה": the level on the paving; (3) the
  platforms: עזרת הנשים's floor at its finish, Nikanor's ט״ו המעלות (a finish step: each step leveled), the altar's top at the
  sovev/karnot (a wooden level — no iron at the altar), the Ulam's and the Heichal's floors. Code: minigames/index.js:101 (rounds by
  stage: a `LEVEL_STAGES` set gets `rounds: 3` of which 2 are level) and CHECK_EVERY per stage (content.js:173 → `{ har: 1, … }`).

## 3. Note 3 — "עמד וזז מצד לצד": a routing bug turns every small step into a loop; the crews' next slot triggers it
**Verdict: a bug, not missing stones and not his idle sway. He really walks — out and back — for two reasons that multiply:**
1. **The detour (the "side to side" itself): stages.js:2560–2562, `route()`** — a walk that starts and ends inside the Chel or
   inside the Azara always passes the region's hub: `else if ((toR === 'az' || toR === 'chel') && fromR === toR) { const h =
   HUB[toR]; pts.push(...) }`, HUB.chel = (155.5, 0), HUB.az = (−15, 0) (stages.js:2509). A 3-amah step becomes a walk to the hub
   and back. **Caught by touch at הסורג (d2, 4 Hz track, no touch):** heroReturn (162,12) → (161,15), 3 amot; he walked south to
   (155.7, 0.5), 12 amot, and back north 14 amot — 26 amot, 3 s, head swinging across the screen (x 212 → 317 → 240). The walk
   before it, (163,40) → (162,12), overshot the same way to z 0.5 and came back.
   **In the Azara it is far worse — הכיור (d5 track):** a 4-amah heroReturn (−61,21) → (−63,25) became a **236-amah run**: north to
   z 47, east to x −17, south to the hub (−15, 9), north again, west to (−44,47), back down to his banker — `detourAz` (2538) is added
   at both ends around the hub, and `hero.speed = clamp(L / 5.5, 11, 30)` (2575) makes it an 8-second sprint at 30 amot/s, out of
   the frame (his head at screen x 2,949, then −7,161) and back. It happened again at the first course for a 9-amah move (236
   amot). Every stage in the Azara (the chambers, the altar, the kiyor, the House) walks this loop for any step.
   **האולם (d5), an idle window with NO stones (stock 0, no crew stone, no touch):** a 3-amah heroReturn (−76,55) → (−73,54) became a
   **222-amah** walk. So "missing stones" is not the cause — his spot moved 3 amot for its own reasons and the route did the rest.
   **שער ניקנור (e1), 46 s with no touch after the first stone:** his banker alternates across the gate — (14,−9) → (−3,−22), 21
   amot, walked as 78; then back (−3,−22) → (14,−11), 20 amot, walked as 80. x < 0 is the Azara and x > 6 the women's court
   (`regionOf`, 2529–2535), so each step at the gate runs the region chain enW → nik → azE (2509–2510) and back: side to side.
   **קודש הקדשים (q1):** a 6-amah step walked as **420 amot**, a 23-amah step as 379 — behind the Heichal every re-position is a lap
   of the Azara, out of the frame three times (K80 OFF 74/117/102).
   **גוף המזבח (r1), 34 s with no touch after the whole stones:** (−29,11) → (−53,11), **24 amot west; 13 s later (−53,11) →
   (−29,11), 24 amot back east**, while the crews set 7 stones — the next slot jumps between the altar's sides and he follows it
   (plus a 4-amah step walked as 31).
   **Not the camera:** the track splits his head's movement on screen into what his walking did and what the camera did alone —
   nashim 3,093 px vs 193, Nikanor 6,798 vs 371, the altar 3,130 vs 481, the kiyor 47,296 vs 201: the camera only follows him (a
   `workFrame` per walk at the wall) or stays while he leaves.
2. **The trigger: he chases the crews' next slot, and in the demo that is every ~3 s.**
- **The rule:** index.js:813–833 `workSpotAt` → for a stone (and while the job waits: 'key', 'check', 'pay') his spot is SITE's
  `workSpot(id, 'dress')` = the banker at the next slot's foot (stages.js:5502ff, "site11/site12": `settledSlot(st)`, 4 amot out).
  index.js:929–972 `keepAtWork`, twice a second: when that spot is more than **3 amot** from him (941), he walks there
  (`heroReturn`, 960) and the camera re-frames (`workFrame(id, 1500)`, 961). content.js:35 `DEMO_SPEED = 60`: a crew sets a stone
  every ~3 s, and at the wall each stone moved the next slot ~20 amot along the course (measured below).
- **Measured (4 Hz track, no touch):**
  - חומת העזרה, 12 s after the first stone (d1): 4 walks of 24 / 19 / 19 / 18 amot, one every ~4 s, x 73 → 153 along the course,
    while the crews set 7 stones; each walk re-framed the camera (workFrame ×4).
  - עזרת הנשים (d2, the whole stage, 200 s): 4 walks — 13 → 37 amot east → 3 → **35 amot back west** (a reversal). The last one
    at the crews' 6th stone: he walked from (129,−23) to (94,−30) **out of the frame** (his head at screen x −375, then −1050) while
    the camera stayed (the working frame is the course's, not his); heroAim did not bring him back before the stage ended.
  - שערי העזרה (d1): 67 / 4 / 25 / 50 / 52 / 149 amot, and the same leg (127,−24) → (161,15) twice: a back-and-forth.
  - With no stones in stock (the crews stopped): 0 walks in every idle window (wall, nashim, sorag). Missing stones is when he
    stands still; the walking is when stones ARE set.
  - His idle "sway" is a pose only (stages.js:3252 a 0.035-amah weight shift, glances, a gesture every 5–10 s): his world spot did
    not move by 0.01 amah in 90 s of standing (nashim 82–174 s).
- **Why "no visible reason":** the crews' stone lands at the next slot, often outside the working frame; the kohen is the only
  thing that moves, walking 20–35 amot and back, with no stone in his hands and no pointer.
- **Fix (SITE, first):** stages.js `route()` — inside one region walk straight, adding only the corner detours that already exist
  (`detourAz` / `detourChel`, 2538–2540) when the straight segment crosses the Heichal, the altar or the court's walls; the hub only
  when crossing between regions. Test: a 3-amah re-position inside the Chel and the Azara walks ≤ 4 amot.
- **Fix (FLOW, second):** (1) he follows the slot only when HE works: keepAtWork does not chase a moved slot while he is idle; his
  spot updates on the player's tap (runJob walks him there — the walk "from point to point at his work" the owner loves) or when
  the course changes; (2) a hysteresis — re-walk only when > 12 amot away AND ≥ 8 s since the last walk; (3) never walk out of the
  frame: if the new spot projects off screen, the frame follows him (keepInFrame is off while `hero.busy`, index.js:2280); (4) in
  the demo, the crews' stones should be seen: the crane lifts the crews' stones in frame, or the working frame widens to the
  course's run.

## 4. Note 4 — the progress seen (fixed cameras at each course's end: produce-progress13, sheets `test/out/produce/pg*-sheet-<stage>-<cam>.png`)
Three cameras per stage, fixed for the whole stage: **work** (the stage's own working frame, `siteWorkView`/`wallView` at course 1),
**wide** (the same ray ×3, a child's zoom-out), **beat** (the course beat's own frame, index.js:1132–1147: over the next slot, 70
amot, 44° down; at the Mount `courseView`), and **top** (from above the site) where noted. Δ = % of the frame that changed from the
previous step (produce-sheet's measure; ≥ 10 % is a change a child points at). (My "top" camera came out too close — the floor
only — and is not used.) Caveat: the work camera is the game's own frame at course 1, held fixed as the brief asks; in play the
game may re-frame as a tall site rises — by touch I got no further than the wall's second course, so a ✗ below means "not seen from where
he works at the start, nor from ×3 of it". **Checked in play at the Ulam** (u1: the declared jump, `--stages=ulam@0.3,ulam@0.7`,
reopened as a returning player): at course ~4 his frame is the scaffold's poles and a chamber's red roof, the Ulam itself not
legible (u1-02, u1-04); at course ~9 it is **a grey close-up with the kohen HIDDEN behind a mesh (68 px)** for the whole minute
(u1-05…07) — C9.
- **N79 — in play the course beat never came: 0 in 11 stages.** The one course I completed by touch in the demo (the wall's course 1, q1,
  313 s, stone 32 set by a crew) had **no beat, no "נדבך 1 מתוך 8" toast, no `course` event**. The beat, the toast and the course
  check live only in `strokeOutcome` (index.js:1112–1117), i.e. when the KOHEN's own stroke ends the course; the crews' stones go
  through the settle report (state.js:710–716 computes `out.course` but never puts it in `rep`; index.js `applyReport` 386–402 has no
  course at all). At ×60 the crews set ~3 of every 4 stones (q1: 30 crew, 10 his), so in the demo the course beats v24 turned on
  almost never fire, and the check only waits as a job the pill offers. The sheets below show what a beat WOULD show.
- **שיטוח ההר** ✓ — the beat (the whole Mount, SITE12's courseView) Δ 14 / 37 / 42 % over courses 1–3, the paved plaza at the end
  (pg1-sheet-har-beat). The fixed work camera is buried by the rising fill (my camera, not the game's).
- **חומת העזרה** ✓ courses, ½ beat — work Δ 62 / 83 / 40 / 19 % (c0 → c1 → c4 → c8 → the finish), ×3 Δ 30 / 65 / 61 / 5.6 %: the
  first course line, the wall at half height in its scaffold, the full wall (pg2-sheet-wall-wide). The beat frame (Δ 42 / 45 %) is the
  crane from above with the new course a strip at the bottom (pg2-sheet-wall-beat, C7). The finish (the coping, the chambers' beams)
  5.6 %.
- **שערי העזרה** ½ — work Δ 71 / 43 % for courses 1–3, then **2.2 %** from course 3 to 6: the gate's tower rises behind its scaffold and
  the working frame shows only poles (pg2-sheet-gates-work); the ×3 frame shows the tower climbing (Δ 54 / 15 / 13 %). The finish
  (cedar doors, gold) 11 % — a stack of beams by him, not the doors on the gate.
- **עזרת הנשים** — **the first courses ✓, the last ones ½, the finish ✗.** Work Δ 66 / 56 / 39 / 34 % for courses 1–4, then **9.8 /
  10.4 %** for 5–6: the wall rises behind the scaffold's poles and boards (pg2-sheet-nashim-work, every course); ×3 Δ 49 / 14 / 11 / 13 %. The finish
  (the gallery "הגזוזטרא" and "לשכות הפינות", מדות ב, ה): **16.7 % then 2.1 %** in the work frame, **3.4 % then 0.3 %** from ×3
  (pg1-sheet-nashim-work / -wide). The four chambers — the Nazirites' SE, the wood NE, **the lepers' NW with its immersion pool**,
  the wine and oil SW (temple.js:272–317) — are revealed by height with the court's wall, so they rise hidden inside the courses;
  the finish shows only its items — a stack of cedar beams on trestles beside him (stages.js:4953–4990, `FIN_KIND.nashim = ['cedar',
  'cedar']`) — not the gallery, not a chamber. Nothing a child can point at and say "there is the lepers' chamber". The beat frame is the crane's jib from above with the course a strip at the bottom
  (pg1-sheet-nashim-beat, C7). The owner's doubt is right.
- **הסורג והחיל** ½ — the lattice is low (10 handbreadths): the first course is a strip (×3 Δ 55 %), then 11 / 7.5 / 3.6 % — a
  child sees a line on the ground, not a fence rising (pg2-sheet-sorag-wide). The beat frame changes well (Δ 68 / 65 %).
- **יסוד המזבח** ½ — the base is one amah: the first course is seen (×3 Δ 64 %), the second **3.7 %**, the finish 4.4 %
  (pg3-sheet-yesod-wide) — a pale slab that thickens.
- **גוף המזבח** ½ — ×3 Δ 34 / 15 / **8.7** / 4.1 % (courses 1, 2, 4, the kevesh): the white block rises, but from course 2 on a child
  sees the same white block (pg3-sheet-guf-wide); the work frame does better (54 / 24 / 19 / 8 %).
- **הכיור** ✓ close, ½ far — the work frame Δ 42 / 64 % (the laver on its frame, then the 12 spigots); from ×3 the laver is a small
  bowl, Δ 6.4 % (pg3-sheet-kiyor-wide).
- **האולם** ✗ from course 5 — work Δ 66 / 56 % for courses 1 and 5, then **0 % from course 5 to 10 and 0 % for the whole finish**; ×3
  0.4 % and 0 % (pg3-sheet-ulam-work / -wide): the fixed frames hold the scaffold's grid over the lower facade, the upper half rises
  out of the frame, and the finish — the מלתראות, the cedar beams, **the golden vine**, the gilding — changes nothing a child can see
  from where he works. The beat frame changes (Δ 90 %) but looks at a different place each time.
- **ההיכל** ✗ from course 7 — work Δ 74 / 54 %, then **2.2 %** from course 7 to 14 and **0 %** for the whole finish (the cedar
  ceilings, the doors, the gold plating, the כלוב עורב); ×3 0.3 % and 0 % (pg4-sheet-heichal-work / -wide): the scaffold's grid
  fills the upper frame and a built wall in front fills the lower one. The House's last half and all its gold are never seen from
  where he works.
- **קודש הקדשים** ✗ from course 5 — work Δ 71 / 31 %, then **3.5 %** to course 10 and **2.3 %** for the finish (the cedar ceiling, the
  gold); ×3 1.9 % and 0.3 % (pg4-sheet-kodesh-wide): the same scaffold grid and a wall in front. (pg4 re-measured the Ulam: 0.5 % /
  0.5 % — the same result.)

## 5. Note 5 — machines and life: "רק גלגלית אחת ישנה והיא שלי" is literally true
- **One crane in the whole world.** stages.js:2074 `/* the treadwheel crane (one, at the most recently started site) */` — a
  singleton built once (2075–2114) and handed to one site at a time (`craneAssign`, 3785). Every other site, the quarry and the
  roads have no lifting machine at all. Its one walker in the wheel (2401) is the only "machine man".
- **Carts: in 2 of 52 frames I measured** (the census counts the ox carts the crews layer draws in view, `cartMesh.count`): the
  crews layer keeps 4 cart trains (plus the Mount's rubble cart and the key stone's cart), but they run only on a delivery; the one
  cart seen was at the Ulam's end, in both frames (census rows in §1).
- **People:** the Mount in a picked demo has **0 crews** — the kohen works alone there (census: site crews 0, no site workers on
  screen). The wall and the courts: the working frame shows him and 1–2 crew workers. From Nikanor on the site's own gangs come in
  (stages.js's masons and carriers): the working frame at the end of Nikanor, the chambers, the kiyor and the Ulam shows 5–10
  people (3–5 masons, 3–4 carriers), the ×3 frame 7–14 — but still **one machine**, and the crane was on screen in the working
  frame at only 3 of 13 stage ends. The quarry (9 workers) is seen only from 1,000+ amot when a picked stage opens.
- **What each site should have** (period machines — Vitruvius 10.2's treadwheel "rota" and the shear-legs with a block and tackle;
  Josephus, Antiquities 15.390: a thousand wagons for the stones and ten thousand workmen — טיוטה, for the owner's check):
  | site | lifting | moving | crews and life (in the working frame) |
  |---|---|---|---|
  | every walled site (wall, gates, courts, chambers, the House) | **2 treadwheels** on the course: his (by his banker) and the crews' (at the far end of the course, lifting THEIR stones in view — this also answers note 3); **1 shear-legs** at the corner being turned (2 men on the rope) | **a train of 3–4 ox carts** from the quarry road to the stone pile, one unloading every ~20 s in the demo; **1 sledge on rollers** for a long block, 4 men with levers | 2 masons on the scaffold dressing, a water boy, the foreman with the measuring cord, a stone pile that shrinks and refills |
  | שיטוח ההר | 2 treadwheels at the east face (great stones · fill baskets); a **capstan** hauling a great stone on a sledge up a ramp | the rubble carts to the spoil heaps (exist — make them 3 and in frame); fill baskets on shoulders | leveling gangs with **the level** (note 1), 2 gangs at the benches |
  | שערי העזרה · שער ניקנור | **a shear-legs pair** raising the lintel (the key stone "המשקוף") and the doors' posts | a cart with cedar beams; Nikanor: the bronze doors arriving on a cart train (Yoma 38a) | carpenters at the doors; at Nikanor the 15 steps leveled one by one (note 1) |
  | עזרת הנשים · הלשכות | 1 treadwheel + 2 small shear-legs at the corner chambers | carts of cedar for the gallery (גזוזטרא) and the chambers' ceilings | carpenters building the gallery on posts; wood stacked into the wood chamber (NE); the lepers' chamber's pool (NW) dug and plastered |
  | the altar (יסוד · סובב · גוף · קרנות) | none of iron; **hands and a wooden sledge** up the ramp (the kevesh) | a cart train of **whole field stones from בקעת בית כרם** (מדות ג, ד) | 6 carriers with stones on their shoulders, the lime kiln for the plaster (סיד), the red cord (חוט הסיקרא) stretched by two men |
  | הכיור | a tripod hoist over **the casting pit** | a cart with copper ingots | **bellows** worked by 2 men at a furnace; the 12 spigots (יומא ג, י) fitted; the מוכני wheel |
  | האולם · ההיכל · קודש הקדשים | **3 treadwheels at three heights** on the scaffold (the House is 100 amot); at the Kodesh the **boxes lowering the artisans** (מדות ד, ה) | cedar beams on carts; gold leaf at the gilders' table | 4–6 masons on the scaffold levels, rope men, gilders |

## 6. Camera angles for the director (every bad frame I saw; the good frame in the last column)
| # | stage · moment | shot | what is wrong | a good frame |
|---|---|---|---|---|
| C1 | **every stage, right after a pick** | d1-48 (gates, 4 px from 1,011 amot) · d2-04 (nashim 7 px, 587) · d2-23 (sorag 4 px, 1,198) | the whole site from far, the kohen a dot; the pill says "התחל לבנות" | land on him at the survey's stake, as a reopen does (`landWork` → `closeFrame`), 50 amot, 26° — jumpTo's `W.focus(id, 900)` (index.js:2073) is the far flight |
| C2 | שיטוח ההר · the rocks (demo) | d1-13, d1-14 | the rock with the gold arrow fills the frame; the kohen off-frame (34 px, OFF) through a whole idle window | the rock AND him: boulderCam from his side of the rock (SITE8's `boulderView(i, from: hero)`) |
| C3 | שיטוח ההר · the first course | d1-17 | the treadwheel crane in the foreground, the bay's face, the kohen cut at the bottom (OFF) | the bay from the plaza side with the crane behind him (as d1-19, 82 px — the frame 10 s later is right) |
| C4 | חומת העזרה · the courses | d1-37 | the crane's wheel and jib fill the lower right quarter and cross the frame | the same working distance from 30° further along the course, the crane behind the course |
| C5 | עזרת הנשים · the dig (before paying) | d2-09, d2-10 (HIDDEN behind the court wall's cornice) | N74 still open in v24: the Azara wall's top fills the frame, only his turban shows | from inside the women's court (its floor at 6 amot), 45 amot, 30° |
| C6 | עזרת הנשים · the crews' 6th stone | d2 track 190–198 s | he walks 35 amot out of the frame (head at screen x −1050); the working frame stays on the course | the frame follows a walk that leaves it (keepInFrame is off while he walks, index.js:2280) — or no such walk (note 3) |
| C7 | the course beat at the walled sites | pg1-sheet-nashim-beat · pg2-sheet-wall-beat · pg2-sheet-gates-beat | from 70 amot, 44° down, over the next slot: the crane's jib and top fill the frame, the course a strip at the bottom, him ~10 px; at the gates' 3rd course it frames the **empty paving** (the gate out of the frame) | along the course from outside, 25–30° up, the crane out of the line, the new course in the middle third and him small but seen |
| C8 | גוף המזבח · the courses | r1-10, r1-11 (HIDDEN behind the sovev's plaster, 81 px) · r1-17 → r1-18 | the frame looks across the altar's plastered top: only his turban shows behind the edge, the gold ring on the altar; after his 24-amah walk the frame is an empty corner with the red line (r1-18, OFF) | from the ramp's side or the corner he works at, 30° up, the altar's face beside him, not between |
| C9 | האולם · the upper courses (in play) | u1-06, u1-07 (HIDDEN behind a mesh, 68 px, course ~9) · u1-02 (course ~4) | a grey close-up of a beam and a wall; nothing of the Ulam; at course ~4 only scaffold poles and a chamber's roof | the Ulam's face from the court at 60–80 amot, 20° up, climbing with the courses; him at the scaffold's foot |

## 7. Also: the sling 6–10, the picker, the reel, errors
- **הקלע של דוד, levels 6–10 by real drags** (produce-sling13.cjs, the sling-touch lab): **L6 "המגדל הגבוה" won in 2 stones** — the
  game's solver (`__g10.aimAt`) gave a line to the first target (2 of 3 down); for the last one it gives **no line at all**, which
  is exactly where sling-touch's hand waits until its time runs out; a child's full pull at 45° knocked it down. **Verdict: the
  test's hand, not the level** — add sling-touch a child's fallback pull when `aimAt` is null (and consider giving the dotted arc a
  line for that target too). **L7 "שני מגדלים וגשר" won in 3 · L8 "גל האבנים" lost 2 of 3 in 5 stones ("כמעט!", +10, "עוד פעם") ·
  L9 "המבצר" won in 2 · L10 "גָּלְיָת" won in 1** ("גָּלְיָת נָפַל!" with the verse). No page errors. Shots: sl13-L6-flight,
  sl13-L8-end, sl13-L10-end. L8 is the hard one (a child retries); nothing is impossible.
- **The picker ("שלבים ▾") works by touch:** 17 buttons — the gold "⏭ לשלב הבא: …" first, the 15 stages (✓ built, ◀ current), סגור;
  a pick lands on the stage at its start with 600 stones (seen at every pick) and every earlier stage built. Two problems: the
  coach's hand lies on the chip (N77, below), and the first frame after a pick is the site from 600–1,200 amot (C1).
- **The investor reel still works** (q2: `#demo`, a fresh save, "הרגע הבא ✦" tapped every ~20 s): press 1 opened the board, which
  played itself (28 s) — the reel's curated autopilot, as v24 intends; presses 2–4 moved the Mount's course on (stones 13 → 16)
  with the kohen at 82–88 px in every beat (q2-04, q2-06, q2-10). Its counter stayed at "1/9" after four presses.
- **N77 — the coach's hand on the demo strip.** index.js:1784 puts the pointing hand at (width/2, **118**) under the pill; in the
  demo the strip (ui.js:119, `.gm-demo`) sits at y ≈ 100–144, so the hand covers "שלבים ▾". At the gates' first stone (d1, 505 s)
  my tap on the hand opened the picker, and the picker's first, gold button skipped the stage — gates → nashim → sorag → nikanor →
  lishka in 70 s. A child who taps where the hand points does the same. Seen again at the Kodesh's first stone (q1, 462 s).
- **Unconfirmed (to check by hand):** in r1 my tap on the picker's row "9. הסובב" — below the card's fold, scrolled into view first —
  landed on another row three times (the focus went har → wall → gates, 41–56 s); rows 4, 6, 7, 12 and 13 (also scrolled) worked.
  It may be my scroll, not the picker; a finger that scrolls the list and taps row 9 should be tried.
- **Page errors: 0** in every run.

## 8. Top 12 for tonight (most important first)
| # | owner | what | fixed looks like |
|---|---|---|---|
| 1 | **SITE** | **The out-and-back walks** (note 3): stages.js `route()` 2560–2562 sends every walk inside the Chel or the Azara through the region's hub, with `detourAz` at both ends (2538) and a sprint speed (2575) | inside one region he walks straight (the corner detours only when the straight line crosses the Heichal, the altar or a court wall); in produce-play's track no heroReturn walks more than 1.5× its straight distance, and no walk leaves the frame |
| 2 | **SERVICE** | **The demo's games are the player's** (note 1): `demo: !!G.demo` → `demo: reelOn()` at index.js 1219, 1257, 1418, 1496, 1549; games/cycle.js:64 and index.js:1665 read the reel, not `G.demo` | in the demo no precision game or board moves before a touch; "▶ המחצבה" rotates the sling → the stack → the board → the precision quarry; the in-between games' invitation comes after a stage; the reel (after "הרגע הבא ✦") keeps its autopilot |
| 3 | **SERVICE** | **A course the crews complete gets its beat** (note 4): state.js:710–716 drops `out.course` from the crews' report; index.js `applyReport` (386–402) has no course, so the toast, `courseBeat` and the check's call (index.js:1112–1117) come only when the kohen's own stroke ends a course | every course end — his stone or a crew's — shows the toast and the beat (the whole Mount at the Mount; the course from outside elsewhere) and, every CHECK_EVERY courses, opens the check; produce-play's log has `course` and `courseBeat` for every course |
| 4 | **SERVICE** | **He does not chase the crews' next slot while idle** (index.js keepAtWork 929–972: a > 3-amah move of `workSpot(id,'dress')` walks him, 941–961) | idle, he stays at his banker until the player taps or the course changes (then one walk, "from point to point"); ≤ 1 heroReturn per course in a no-touch minute of the demo |
| 5 | **GAMES** | **The level with the needle in the leveling stages** (note 1): minigames/index.js:101 cuts the course check to the 3 plumb rounds; CHECK_EVERY 2 (content.js:173) | the Mount: a check at every course end with 2 level rounds first; the level also at the Mount's paving, עזרת הנשים's floor, ט״ו המעלות, the altar's top; the demo shows it within the first 2 minutes of the Mount |
| 6 | **SITE** | **The progress seen where it is not** (note 4): עזרת הנשים's four corner chambers (temple.js 272–317, incl. לשכת המצורעים NW with its pool) rise hidden inside the wall's courses and its finish is a stack of beams (2.1 % / 0.3 %); **the Ulam shows 0 % from course 5 to 10 and 0 % for its finish (the golden vine), the Heichal 2.2 % from course 7 to 14 and 0 % for its finish (the doors, the gold), the Kodesh 3.5 % from course 5**; the gates' tower and the court's last courses rise behind the scaffold (2.2 %, 9.8 %) | the chambers built in the finish, one by one, each named on screen ("לשכת המצורעים · מדות ב, ה"); the working frame climbs with a tall building; the finish items appear ON the building (the vine on the Ulam, the doors on the gate); every course and finish step ≥ 10 % in the work or ×3 frame |
| 7 | **SITE** | **Machines and life** (note 5): one crane in the world (stages.js:2074), a cart in 2 of 52 frames | at every walled site ≥ 2 lifting machines (his treadwheel + the crews', which lifts the crews' stones in view) and a shear-legs; a cart train in the working or ×3 frame; the altar by hands and carts of whole stones; census ≥ 2 machines, ≥ 1 cart, ≥ 4 workers in the working frame |
| 8 | **SERVICE** | **N77: the coach's hand covers "שלבים ▾"** (index.js:1784, y 118; ui.js:119) | in the demo the hand points at the pill from below the strip; a tap on the hand never opens the picker |
| 9 | **DIRECTOR** | **The course beat's frame** at the walled sites (C7) | along the course from outside, 25–30° up, the new course in the middle third, the crane not in front |
| 10 | **DIRECTOR** | **The frames that lose him:** the first frame after a pick (C1: 4–12 px from 425–1,200 amot, twice HIDDEN); עזרת הנשים's dig behind the court wall (N74 still open, C5); the altar's courses behind the sovev's plaster (C8); the Ulam's upper courses (C9, HIDDEN); the Mount's rocks (C2) and first course (C3); the wall's crane in front (C4) | a pick lands on him at the survey's stake; K80 ✓ at every work frame of produce-play `--demoPick` over all 15 stages |
| 11 | **SERVICE** | **Stones in the demo**: with 600 stones the pill still offers 8 at a time ("הביאו 8 אבנים"; the sheet's "אפשר לקנות מראש" is one more tap away); at ×60 the crews empty the stock in ~20 s and the site stops — the owner's "חסר אבנים" | in the demo one tap buys the three segments the stock holds (STOCK_MAX), or the demo pays by itself; the pill says why the crews wait |
| 12 | **GAMES** | **The sling's test hand** (L6 won by touch; the solver has no line to its last target) + the kiyor's words ("הביאו 4 אבנים · 80 נחושת" for a bronze laver) | sling-touch 10/10 with a child's fallback pull; the kiyor's step says "יציקות נחושת" |

## 9. ⚑ לבעלים (ברירת המחדל בסוגריים)
- ⚑ **המשחקים במצב הדגמה** — במצב ההדגמה כל משחק משחק את עצמו (המנוף, הסיתות, האנך והפלס, הלוח), ומשחקי המחצבה המתחלפים (הקלע של
  דוד, נדבך על נדבך, החציבה המדויקת) כבויים בו. לכן ראית רק את המחצבה. (המשחקים יחכו למגע שלך בדיוק כמו במשחק הרגיל; רק "הרגע הבא ✦"
  ימשיך לשחק לבד.)
- ⚑ **הפלס עם המחט** — היום הוא מופיע רק בבדיקה שבסוף שלב; בבדיקת הנדבכים יש רק האנך. (הפלס יבוא בסוף כל נדבך בשיטוח ההר, בריצוף
  הרחבה, ברצפת עזרת הנשים, בט״ו המעלות ובראש המזבח.)
- ⚑ **הכהן שזז מצד לצד** — זה באג ולא מחסור באבנים: כל צעד קטן בתוך העזרה או בחיל הופך לריצה של עד 420 אמה ובחזרה, גם כשאין אבנים.
  (לתקן הלילה: הוא ילך רק אל העבודה שלו, בקו ישר.)
- ⚑ **סוף נדבך** — כשהצוותים מניחים את האבן האחרונה של נדבך (במצב הדגמה זה כמעט תמיד), אין הודעה ואין את המבט על כל האתר, ובדיקת
  הנדבכים לא נקראת. בכל המשחק שלי לא ראיתי אף סוף נדבך. (סוף כל נדבך ייראה, מי שלא הניח את האבן.)
- ⚑ **עזרת הנשים ולשכת המצורעים** — ארבע הלשכות שבפינות עולות בתוך החומה ולא נראות כשלב משלהן, והגימור "לשכות הפינות" כמעט לא
  משנה את התמונה. (לבנות אותן בגימור, אחת אחת, עם שם כל לשכה על המסך.)
- ⚑ **האולם, ההיכל וקודש הקדשים** — מהנדבך החמישי באולם ובקודש הקדשים ומהשביעי בהיכל התמונה לא משתנה, וגם גפן הזהב, הדלתות והזהב לא
  נראים ממקום העבודה.
  (המצלמה תעלה עם הבניין, והגימור ייראה על הבניין עצמו.)
- ⚑ **עוד מכונות ואנשים** — בכל העולם יש היום עגורן אחד, ועגלה נראתה רק פעם אחת בכל המשחק שלי. (בכל אתר: שני גלגלי דריכה, חצובה עם גלגלת, שיירת
  עגלות שוורים מהמחצבה ומזחלת על גלילים; במזבח — בידיים ובעגלות של אבנים שלמות, בלי ברזל.)
- ⚑ **היד שמצביעה על הכפתור העליון** — במצב הדגמה היא מכסה את "שלבים ▾"; הקשה עליה פותחת את רשימת השלבים ומדלגת שלב. (להזיז את היד אל
  מתחת לפס ההדגמה.)
- ⚑ **אבנים במצב הדגמה** — גם עם 600 אבנים משלמים כל 8 אבנים, והצוותים עוצרים כל כ־20 שניות. (בהדגמה תשלום אחד יקנה שלושה מקטעים.)
