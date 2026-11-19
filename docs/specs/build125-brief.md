# Build 125 brief: the right thumb lifts the camera in stages 01–04 (rule 66)

Base: build 124 (383ea57). Branch `claude/project-thread-wv5ljp`. Commit and push after every working step.

## Why

ירון, 12.11, after build 120: "צריך שתגדיר שאפשר יהיה להרים ביד ימין בקלות את המצלמה ולראות את העולם. וגם שאפשר יהיה לשחק קצת בזום אאוט." Build 124 did this for stage 05 only. Rule 66 says: in every minigame and in the walk. He was told that stages 02–04 come next. Stage 01 has the same fault in a few acts and is included.

## What is wrong today (found in the code, to be confirmed by gesture before you change anything)

1. Stage 02 acts in `src/game/h111/acts.js` and `acts2.js` (plumb, lever, gates, closing), every act of stage 03 (`src/game/h112/`) and every act of stage 04 (`src/game/h113/`) have no `wants(p)`. The director then gives the look to the mouse only: a touch player has no right thumb at all.
2. Stage 01 acts that take the whole screen: rope (`h109/acts.js:273`, `wants()` always true), rocks while working (`acts.js:388`), reading (`acts2.js:362`), waste push (`acts2.js:1009`), corner lift and slew (`acts3.js:353`), great stone part 3 (`acts3.js:1254`).
3. The director's default look sinks toward the horizon. Next to the Azarah wall, the soreg, the chel steps and the gates this may end in a frame that is all wall. Stage 05 solved it with the pack option `PK.look` (`h120/look120.js`: rise, tilt up, widen, sight rule with boxes).
4. The walk phase has a right-thumb look only where the pack sets `PK.look.walk` (stage 05).

## What to build

### A. `wants(p)` in every act of stages 01–04

One principle, the same as build 124: the left half of the screen is always the act's. On the right half the act takes a touch only when it starts on or near one of its own grips (the object the hand really holds: rope end, lever, stone, wedge, crane handle, door leaf, the piece in hand). Everywhere else on the right half a drag is the look.

- Radius: use what 124 used (about 90 px for small grips, 0.32 of the screen height round a large moving object). Compute from the grips' projected screen positions each call. No constants tied to one resolution.
- "Tap anywhere" acts (rocks strike on the beat, rope held anywhere): the tap or hold stays free on the whole left half and near the object on the right half. A right-half touch that does not move still reaches the act as a tap on release (the director already does this); check that the beat timing is still fair, and if it is not, widen the grip zone round the rock rather than taking the whole screen back.
- `holds()` where the act uses two fingers, as in 124, so a pinch still reaches the overview unless both fingers are on grips.
- No act may lose a touch it needs. The bot (`tools/h109bot.js`) must still finish every stage; if a bot finger starts on the right half away from a grip, move the bot's finger to the grip (as was done for carry), do not widen `wants`.

### B. The look shape per site

For every act stand of stages 01–04 run the sight test you wrote for 124 (a quarter-screen right-thumb drag, then the frame is checked: work place, surroundings, horizon and sky are seen, never a wall-only frame). Where the default look fails, give that stage's pack a `look` option built from `look120.js` with that site's own boxes (Azarah walls, soreg, chel, gate towers, the city tower by the SE corner). Read the boxes from the one address book (`grid.js` `BOOK.s02` … `BOOK.s04`, rule 65) or from the model that the book is tested against; do not type coordinates a second time. Generalise the module rather than copying it: one look module, per-site boxes and constants. Stage 05 must behave exactly as in 124 (its tests stay green and unchanged).

Where the default look already shows the world well (open hill in stage 01), keep it, but the drag must be as easy as in stage 05: a quarter-screen drag reaches the far view. Use the same gain.

### C. Play a little zoomed out

At u about 0.3 one full step of every act must be playable (the director's play zone is u ≤ 0.45, yaw ≤ 1.0). Check each act: grips must still be on screen and big enough to touch at that zoom. If a grip leaves the frame at u 0.3 in some act, fix the look aim for that act, not the zone.

### D. The walk

The right-thumb look in the walk (`PK.look.walk`, `T.camOver`) in all stages 01–04, with the three fixes of 124 round 2: pinch still zooms out, the follow camera comes back to its exact normal pose, and the horizon is seen also next to a high wall. `twin.js` stays unchanged.

## What must not change

- No new buttons. No grid drawn. No yellow beam. Scores, penalties and levels untouched.
- The act waits while the camera is out of the play zone; nothing is lost; the next touch brings the camera back.
- Mouse: right button drags the look everywhere, as today.
- Shared files only in marked `h125` blocks.

## Tests

- Unit tests (`test/h125-look.test.mjs`): for each act, `wants` is false at a right-half point far from every grip and true on each grip, in each phase; the sight rule passes at every stand of stages 01–04 (no wall-only frame at u 0.7, yaw 0 and ±0.8).
- All existing tests stay green (692 pass, 10 skipped today).

## What to hand back

For every act kind of stages 01–04, at touch 960x600, with real gestures through `tools/probe109.cjs` (never two probes at once):

1. a still after one quarter-screen right-thumb drag started at a point that is not a grip, with `state().look.u`;
2. proof that one full step was played with u about 0.3 (log lines);
3. a still after a pinch (overview);
4. the same three in the walk phase of each stage.

Put the stills in contact sheets per stage (scratchpad `k125/`). Then one whole-stage bot replay by touch for each of stages 01, 02, 03 and 04, no errors. Report honestly what still fails or was not checked. List every act you changed and the grips you chose for it.
