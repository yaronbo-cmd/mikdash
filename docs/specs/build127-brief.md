# Build 127 brief: stages 01 and 05 read every place from the one address book (rule 65)

Base: the final commit of build 126 (`fb94fd8`). Branch `claude/project-thread-wv5ljp`. Commit and push after every working step.

## Why

ירון, 13.11: "כך גם הכול. גם במשחקונים הבאים. הכול יושב על העולם. לא ההפך בשום מקרה."

Build 126 moved stages 02–04. Two stages still type places of their own, and ירון was told so at the handover of 126:

- Stage 01 (`src/game/h109/`): audited in 126, not moved. About 139 scan hits: `acts3.js` 95 (corner, courses, great stone, letters), `director.js` 28 (the film, the night, the opening), `acts2.js` 7, `acts.js` 5, `model.js` 3 (`PLACES.letters`).
- Stage 05 (`src/game/h120/`): build 124 moved layout, columns, beams, chambers and stands only. The scan still finds `routes.js` 67, `model.js` 23, `pack.js` 18, `acts.js` 11, `acts2.js` 5, `acts5.js` 4, `acts3.js` 3, `acts4.js` 3, `world.js` 3, `look120.js` 2, `load.js` 1, `water120.js` 1, and the film and sound files.

This build finishes the rule for everything that exists: after it, no stage file of stages 01–05 holds a world place.

## What to build

### 0. Before any stage file changes (first commit)

1. `tools/moved127.mjs` + `test/h127-before.json`: run the scanner of `tools/nobook126.mjs` over `h109` and `h120` at `fb94fd8` and record every hit (file, line, the literal tuple as text). This is the list of what is typed outside the book today.
2. Extend the snapshot to stage 05: every data export of the `h120` modules, every act's stand for every mission, the routes and the frames, recorded at `fb94fd8` into `test/h127-snapshot.json` with its test (same shape as `tools/snap126.mjs` and `test/h126-snapshot.test.mjs`). Stage 01 is already in the 126 snapshot; add what it misses if stage 01 has exports or stands that are not in it.
3. Commit both before touching a stage file.

### A. Classify every hit

Go over every line of `test/h127-before.json` and decide, with a one-line reason each:

- **place**: an absolute world x/z (or x/y/z) of something: an object, a stand, a route point, a pile, a crane foot, a look box, a zone, a camera position or camera target. These move.
- **not a place**: a size, a count, a screen offset in pixels, a geometry segment count, a sound number, a time, a colour, an offset relative to a book place. These stay and go on the allow list with the reason.

When unsure, treat it as a place. Camera positions and targets of films, openings, night shots and act shots are places.

### B. Move the places (same rule as build 126)

1. A place already in the book: delete the stage's copy and read the book's.
2. A place not in the book: add it to the book first, in `src/game/world/grid.js`, inside marked `h127` blocks (tables like `s02.cam`, `s05.routes`, and `entries` with label and source or המחשה where the place is a named thing a player can stand at or see), then read it from there.
3. Stage 01 has no `BOOK.s01` section shaped like the others. Give it one in the same shape (`{ stage: 1, name, bounds, …tables, entries }`) and keep the existing stage 01 keys working (do not rename or remove what other code reads).
4. What may stay in the stage files: sizes, counts, speeds, tolerances, heights that come from the world model, and offsets relative to a book place.

No number may change. This build moves the home of the numbers and nothing else: no place, no gameplay, no camera, no score, no sound changes.

### C. What stays as it is, on purpose

- `h120/film.js` and `h120/filmsound.js`: do not touch. The film is being replaced by a video made in another thread. They stay on the allow list with exactly that reason.
- The look of builds 124 and 125 (`world/look.js`, grips, wants and holds), `twin.js`.
- Stages 02–04, except where a shared table makes a stage 01 or 05 place the same as theirs.
- Shared files only in marked `h127` blocks.

### D. Tests

- `test/h126-nobook.test.mjs`: lower every count of `h109` and `h120` to what honestly remains, each with its real reason (no more "not moved" or "unchanged" lines except the film).
- `test/h127-moved.test.mjs` (uses `tools/moved127.mjs`): every tuple of `test/h127-before.json` is either still in its file and on the allow list, or appears with the very same literals inside an `h127` block of `grid.js`. A tuple that vanished or changed a digit fails.
- `test/book.test.mjs`: stages 01 and 05 "read the book's own tables" tests for the new tables, like stages 02–04.
- The snapshots of 126 (stages 01–04) and of step 0 (stage 05) stay identical, number for number.
- All existing tests stay green (713 at the base: 703 pass, 10 skipped).

### E. The table

Regenerate `docs/specs/sefer-ktovot-he.md` with `tools/book-table.mjs` so the new entries appear.

## Order of work

Stage 05 first (smaller risk, its acts are separate), then stage 01. Commit and push per file group. If a part of stage 01 is too entangled to move safely, stop at it, leave it on the allow list and report it with file and line. A smaller honest build is better than a moved number.

## What to hand back

1. The classification list: per file, how many hits were places and moved, how many stay and why.
2. Every new book table and entry.
3. The final allow list with the reason for each line.
4. The tests of D passing and the whole suite's numbers.
5. Whole-stage bot replays by touch (960×600) of stage 01 and stage 05, and of stages 02–04 if any shared table changed: acts finished, stars, no errors, compared with build 126's replays. Before any probe run `pgrep -fa probe109` and wait while another probe is running; never two probes at once.
6. Say honestly what was not moved and what was not checked.
