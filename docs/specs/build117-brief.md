# Build 117: stage 01 fixes after the owner's play of build 116

Coding brief. The owner approved the spec on 2026-11-10 19:13 UTC (page "אפיון תיקוני שלב 01 · בנייה 117") with three
changes that are already folded in below. Builds 115 and 116 briefs' "Rules that must hold" hold here too. This file is the
instruction for the coder; the reviewer replays the whole stage as a player (mouse 1600×900, touch 960×600) before handover.

Order, one commit each, tests green after each: G (the whole game: light column, picture quality, play while zoomed out,
leftovers), P paving, R reading the rock, W waste, C course. Mission ids stay. The bot (`tools/h109bot.js`) is taught every
changed act in the same commit, and `dbg()` of each act gives it what it needs.

His words that this build answers (2026-11-10):
- Paving: "יש אנשים מתחת כאילו אני חלילה קובר אותם מתחת לריצוף"; "המשחקון הראשון קשה לא הצלחתי. רמות הקושי צריכות לעלות
  בצורה הדרגתית"; "אפשר להזיז את הלבנים או שהן קבועות?"
- "האור הצהוב צריך להוריד. מכל המשחקונים" = "הפס הצהוב שמגיע עד הרקיע".
- Reading: "רואים את הסדק לפני שהאור מונח על הסלע. האור נשבר על הסלע בלי קשר לצורתו של הסלע. הסדק עובר רק בחלק קטן של
  הסלע, לא מבינים מהו מנגנון הביקוע"; "כל יתד נכנסה ישר למקומה בלי ניסיון שני, אפס אתגר"; "קריאת הסלע בלי טעויות תמיד
  מושלם"; "מתחת לסלע הרביעי הסתתרה גרסה ישנה של ביקוע. צריך חובה לחנקות את כל השאריות האלה".
- Waste: "האבנים נופלים לבור אבל לא רואים אותן נערמות. המגרפות נעלמו".
- Course: "האבן מסתובבת אוטומטי. אני צריך להזיז אותה ימין ושמאלה במגע על החוט"; "אני לא מזהה איפה האבן לעומת הקיר לעומתי".
- "רזולוציה התכוונתי שפשוט נראה לא איכותי. אל תשנה מצלמה בהקשר זה."
- "האם אפשר להמשיך לשחק גם אם יצאתי קצת החוצה למרחב בזום אאוט? אם אפשר אז תשאיר האופציה הזו, לפחות עד שלב מסוים."

General: no time pressure; a miss costs nothing; only real damage costs (`X.loss` −20); every target is drawn in the world
in green; `wants(p)` is true only where the act takes the touch; a perfect play reports `perfect: true`; lines are Hebrew,
short, plain, no dashes as punctuation. Sparks, dust, the flash and the popping number of every hit stay as they are.

## G. The whole game

### G1. The light column is deleted
`director.js` `lookBeam` and the mesh `h115-look-beam`: remove the function, the mesh and every call. Nothing replaces it.
The old world's site beams (`stages.js` `beams`, the column under each gem pin) must never show while the director owns the
game: verify in the replay shots of every act; if one shows, hide `pins`, `beams` and `halo` while `h9Own()`.
The mirror's ray in the reading (`beamIn`, `beamOut`) stays: it is the game itself.

### G2. Picture quality (no camera change for this)
- While an act runs the renderer's pixel ratio is `min(devicePixelRatio, 2)`: the director calls `view.workRes(true)` when an
  act begins and `view.workRes(false)` when it ends (the mechanism of `main.js`, used by Phase B). Also on a phone
  (`Q.level` 'normal'); only `Q.level` 'low' stays out.
- `main.js perf()`: while a work holds the ratio (`f24PR` set) the guard first switches the AO off, and lowers the ratio only
  when the average frame is slower than 1/15 s, by 0.25 a step, never under 1.5 (or under the device's own ratio when that
  is lower).
- The objects he looks at closely are modelled better (same low-poly look, more care):
  - the big rock (`rock.js`): icosahedron detail 4, two more layers of shape (broad strata steps and small facets), vertex
    colours (lighter worn tops, darker under the overhangs and near the ground, a few lichen patches), a ring of small
    stones and earth where it meets the hill. The halves and the cut face keep working (`halves`, `part`).
  - the crack: a real dark groove (see R), never a tube floating on the face.
  - the wedges: oak wedges with a darker iron-bound head, each a little different; their slots are seen.
  - the course stones (`stoneMesh`): chamfered edges, tool marks by vertex colour, each stone a slightly different tone;
    ropes 1.5 times thicker with a twist texture.
No shot is moved for the sake of quality.

### G3. Playing on while a little zoomed out
Today any look-around pauses the act and the pinch jumps to the overview. New, in every act of every stage:
- One continuous amount `LOOK.u` 0..1 (the camera pulled back and lowered toward the horizon, as today) and `LOOK.yaw`.
- The mouse wheel changes `u` by 0.12 a notch (back = out, forward = in). Two fingers closing on each other raise `u`
  continuously (`u = u0 + (1 − dist/dist0) · 2.2`), opening lowers it. The act's own finger is cancelled (`act.cancel`,
  else `act.up`) the moment a pinch is recognised (both fingers moving toward or away from each other, the existing
  `bothClose` guard and its mirror image). The right thumb's drag changes `yaw` and `u` as today.
- PLAY ZONE: `u ≤ 0.45` and `|yaw| ≤ 1.0`. Inside it the act runs (`update` every frame) and every touch is the act's, exactly
  as at `u = 0`; the camera stays where he put it; the act's own `X.shot` / `X.track` go on under the offset.
- Outside the zone the act waits as today and the line says "המשחק ממתין · התקרבו כדי להמשיך". The next single touch brings
  the camera back to the act's own shot (today's behaviour).
- At `u ≥ 1` with the wheel or the pinch still going out: the full overview (`ovEnter`) as today.
- A small chip "↩ מבט רגיל" (bottom right, class `h109-ui`, above the safe area) shows whenever `u > 0.02` or
  `|yaw| > 0.03`; a tap eases the camera back in 0.45 s.
- The offset is reset when the act ends. Phase changes inside an act keep it.
- `director.state()` reports `look: { u, yaw, play }` for the tests and the bot.
Check by play: every act of stage 01 can be finished at `u = 0.4` (touch targets are judged in screen pixels, so they
must still be hit: where an act's pick radius is under 30 px at that distance, raise it to 30 px).

### G4. Leftovers of old versions
- A dev tool `tools/sweep117.cjs`: for each of the nine big rocks and each act of stage 01 it drives the bot to the act's
  start, middle and end, and at each point lists every VISIBLE mesh within the work's radius whose name or owner is not on
  the allow list of the present version, and saves four shots (N, E, S, W) of the place. Its report goes to the scratch
  folder, not the repo.
- Whatever it finds is removed at its source (the object is never made, or is disposed), not hidden.
- The fourth rock in particular: split it in the replay and look under and round it, before and after.
- Check too: the old pills and counters ("נדבך 1 מתוך 6"), the old craft banners, the old boulder field's props.

## P. Paving (`acts2.js PAVE`, `paving.js`)

### P1. Nobody under the slabs
- From `PAVE.prepare` to the act's end no figure, animal or cart stands inside the quarter or on the stacks' half of the
  cell: move the pavers to stand OUTSIDE the quarter's rope (at least 1.2 amot off its edge), and send away every other
  figure of the cell (the dressing masons, the sector's crews, the old world's workers).
- The quarter is roped off: four stakes at its corners and a rope between them (props rope), there from the start to the
  end. The pale outline on the floor goes (the rope is the outline).
- The crews' own quarters (`crewsPave`, `quartersDone`): before a quarter's mesh appears, every figure standing in it is
  moved out; a check in `frame2` keeps figures out of any laid quarter and off any quarter being laid.
- A test: after every paving act and every crews' quarter, no crew figure's (x, z) is inside a laid quarter's rectangle.

### P2. Five steps of difficulty over the nine paving works of the plan
`X.level()` stays 1..3 for the other acts. Paving reads its own step from how many paving works he has finished
(`st.done` entries of kind pave, plan and free together): n = 0 → step 1, n = 1 → 2, n = 2..3 → 3, n = 4..5 → 4, n ≥ 6 → 5.
| step | slabs | chalk lines on the floor | new |
|---|---|---|---|
| 1 | 4 | every slab's place | drag, a tap turns, a laid slab can be lifted |
| 2 | 5 | two slabs' places (the two biggest) | |
| 3 | 6–7 | none | the rule: four corners never meet |
| 4 | 8–9 | none | |
| 5 | 9–11 | none | two slabs too many, one cracked slab for the crate |
- `paving.js layout(seed, step)`: `want` = [4,4], [5,5], [6,7], [8,9], [9,11]; steps 1–2 weight the big slabs (at least one
  3×3 at step 1), the kinds rule relaxed to ≥ 3 kinds at steps 1–2; extras and the cracked one only at step 5. Keep the
  old signature working for the tests of 116 (`level` 1 → step 3 sizes [6,7], 2–3 → as today) or update those tests.
- Chalk lines: thin pale rectangles on the floor at the true laying's places (step 1 all, step 2 two). A slab laid on its
  chalk place clicks in with gold.
- At steps 1–2 the four-corner rule is still enforced by the model, but the layout must be such that the chalk places
  never need it explained; the rule's line and ring appear from step 3 ("בלי ארבע פינות בנקודה אחת").

### P3. Teaching that a laid slab can be moved
- Step 1, after the second slab is laid: the hand shows a drag from a laid slab back to the stacks and the line says
  "אפשר להרים כל לוח ולהניח מחדש"; shown once per save (`st.taught.paveLift`).
- The opening line at every step: "גררו לוח לרבע · נגיעה מסובבת".
- Lifting a laid slab costs nothing at steps 1–2 (not counted against the perfect); from step 3 a lift costs the perfect only.

### P4. Stuck
45 s with no new slab laid: one chalk rectangle appears for the next slab of the true laying that still fits the board as
it is (if the board no longer matches the true laying, the line "הרימו לוח ונסו סדר אחר" and the laid slab that blocks
pulses). A hint costs only the perfect. No other failure; the cracked slab laid and broken is the only loss (−20, step 5).

## R. Reading the rock (`acts2.js READ`, `rock.js`): rebuilt in three parts

### R1. The light and the crack
- No crack is seen without the light, at every level (base opacity 0).
- The light is a real patch on the rock: a spot light (or a projected decal built from the rock's own triangles within the
  patch radius, lit by their facing to the mirror) so that it bends over the facets and never shows outside the rock. The
  flat glow disc goes.
- The crack goes right round the rock: from the ground on the near face, over the top, down the far face to the ground
  (`crackPts` over the full arc of the plane, about 40 points). It is drawn as a groove: a dark strip lying ON the surface
  (a ribbon following the surface normals, 0.16 wide, with a darker core), revealed only where the light has passed.
- He drags the light along the crack, from the ground up: the mirror is aimed by the finger's place on the rock (the ray
  from the finger hits the rock: the patch is there), not only left and right. Where the patch's centre passes within
  0.5 patch radius of the crack, that piece of the crack is marked in chalk (a white dashed line beside the groove) and
  stays. Progress `seenU` 0..1 along the near face (ground to top); the far face is marked by itself once the near face is
  whole (the masons walk round and chalk it: seen).
- Only when the near face is marked to the top can wedges be set. Line: "עקבו באור אחרי הסדק · מהקרקע עד הגג".
- Level 3: a scratch that looks like a crack but ends in the middle of the face. Followed to its end it says "שריטה: נגמרת
  כאן" and its chalk is rubbed out. Wedges cannot be set in it (so the old "wrong line" loss goes).
- Level 3 keeps the trembling hand (`A.wind`).

### R2. The wedges in rounds (the new challenge)
- A tap on the marked crack sets a wedge (it only sits, a hand deep). Off the crack (over 26 / 20 / 14 px by level) it does
  not bite and falls (as today, costs the perfect). Closer than 0.07 of the crack to another wedge: falls.
- `nW` = 3 / 4 / 5. When all sit: line "מכים בסבבים · כל יתד שלוש מכות · אף יתד לא מקדימה".
- A tap on a wedge is one mallet blow on it (he steps and strikes, 0.35 s; taps during a blow are ignored, not queued).
  Each wedge needs 3 blows. Each blow: the wedge goes a third deeper, the groove beside it opens a little, the pitch of
  the knock rises with the wedge's depth.
- The masons' rule: a wedge 2 blows ahead of ANY wedge next to it along the crack pulls the crack aside: a crooked crack
  line grows from it (seen at once, red-brown), the word "יתד הקדימה: הסדק נמשך הצידה", `A.crooked++`. The blow counts.
- From level 2 a wedge that got no blow for 6 s (level 3: 4 s) while blows are still owed trembles for 1.2 s, then backs
  out one blow (`A.loose++`, word "יתד התרופפה"). Never under 0 blows. The timer of every wedge starts at the first blow of
  the round and is reset by a blow on that wedge.
- A small chalk tally (I, II, III) over each wedge shows its blows.
- Grades: line 'gold' when the near face was traced with no wedge fallen; rounds 'gold' when `crooked == 0 && loose == 0`,
  'good' when `crooked + loose ≤ 1`, else 'ok'.

### R3. The water and the split
- The pour is as today (hold; let go when the creak ends). What is seen changes: the water runs down the whole crack on
  both faces, the wedges swell, the groove widens along its whole length, the rock opens in two exactly on the line.
- One line while pouring: "היתדות הרטובות מתנפחות ופותחות את הסלע".
- Result: `crooked ≥ 1` → the rock splits in steps: 2 building stones (not 4), no loss. `crooked ≥ 3` or water 'ok' together
  with `crooked ≥ 1` → the rock is spoilt (−20), as the old "lost". Otherwise 4 stones.
- `perfect` only when: no wedge fell, `crooked == 0`, `loose == 0`, water 'gold', and (level 3) the scratch was not chalked
  to its end more than once. Stars: 3 when q ≥ 0.9.
- The shots stay those of 116 (`wShot` with the same distances).
- In `SOURCES`/the sources list the method (wooden wedges in a row, blows in rounds, wetting) is marked המחשה.

## W. Waste (`acts2.js WASTE`, `stages.js` cells pit)
The play and the scoring do not change. What is seen:
- Tipped chunks are not removed: they come to rest on the pit's floor and on each other (a simple heap: each new chunk
  lands on the lowest free spot of a 5×5 grid of heights), and stay there (saved by count: `st.pitIn[i]`; rebuilt on
  reload by the same rule). The pit's own fill surface (`cells.pit`) rises under them only when the rakers cover it.
- A full pit: the rakers pull earth over it (the fill surface rises to the rim in 2 s, the chunks sink under it), the
  ground is level, word "הבור מלא · הגורפים כיסו אותו".
- Two rakers always stand on the pit's rim INSIDE the frame of both shots (load and push), rakes in hand.
- After each tip the chunks left on the rim are raked in: tip grade gold → none left; good → 1 left; ok → 3 left. Each left
  chunk lies on the rim by the sledge; a raker walks to it and the rake really moves it over the edge (the chunk follows the
  rake's head, then falls to the heap). The next trip starts when the rim is clear.
- The push shot is lifted and turned so that the pit's floor and the heap are seen while tipping (this is the one camera
  change of the act, for what must be seen, not for quality).

## C. Course (`acts3.js COURSE`)
- He turns the stone, not the game. Three grips, the corner stone's own (`CORNER`'s `gripOf`, share the code):
  1. a drag from the jib's head moves the stone (the crane follows, heavily),
  2. a drag on the guide rope turns it left and right (`rotT += dx · 0.011`, the stone follows late with a little overshoot),
  3. a hold on the stone lowers it.
  The guide rope hangs from the stone's south end to a stake on the Mount's side of the wall (no kohen figure: the pure
  skill acts have none), drawn thick, with a pulsing ring on it until first used.
- The stone comes from the stock ACROSS the wall (rotation 0) and no longer turns by itself. It must be within 0.12 rad
  of the wall's line to land; landing askew: it comes up again, no penalty, word "עקומה: סובבו בחבל" and the rope's ring
  pulses. The rotation error joins the landing's grade (`e = max(dev, devX·0.5, rotErr/0.24)`).
- Where is the stone (his spatial trouble), three answers:
  1. the carry shot is high over the Mount's side of the wall looking almost straight down (elevation about 70°), the
     wall running left to right across the screen, the stock at the bottom: right and left on the screen is along the
     wall, up and down is toward and away from the wall. The opening shot already shows this view.
  2. under the hanging stone a dark straight shadow (its own rectangle, turned as the stone is) on whatever is below, and
     a thin plumb line from the stone's middle down to it.
  3. the green rectangle stays, and fills (opacity 0.85, brighter) when the stone is over it AND straight.
- While lowering, the shot eases nearer the gap as today (`kc`), from the same high side.
- Levels: 1 the stone hangs still; 2 it swings; 3 it swings and the wind turns it a little (`rotT += wind`).
- Loss as today: a fast landing on a neighbour chips a corner (−20).
- `wants(p)`: true in 'carry' only on one of the three grips (so the right thumb looks elsewhere), true on a stock stone in
  'choose'.

## Tests
- `paving.test.mjs`: the five steps' slab counts; steps 1–2 have a 3×3 or a 2×3; every layout legal; extras only at step 5.
- New `read117.test.mjs` for a pure helper `h109/wedges.js` (`newRound(n)`, `blow(R, i, t)`, `tick(R, t, lv)` →
  `{ blows[], crooked, loose, done }`): equal rounds give no crooked; a wedge 2 ahead of a neighbour gives one; the
  loosening by level; never under 0.
- `h117-look.test.mjs` for a pure helper `lookZone(u, yaw)` → 'play' | 'wait' | 'over'.
- A test that no source file still names `h115-look-beam` or `lookBeam`.
- All 603 old tests stay green (changed ones are updated in the same commit, with the reason in the commit message).

## Handover
Full replay of the plan by the bot, mouse 1600×900 and touch 960×600, no errors; then the reviewer plays every changed act
by eye from the shots (start, middle, end; the play zone at u = 0.4; the fourth rock from four sides). One page per
minigame titled "· בנייה 117" and the full game. Commit trailers carry no model name.
