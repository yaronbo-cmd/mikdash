# Build 126 brief: stages 02–04 read every place from the one address book (rule 65)

Base: the final commit of build 125. Branch `claude/project-thread-wv5ljp`. Commit and push after every working step.

## Why

ירון, 13.11: "כך גם הכול. גם במשחקונים הבאים. הכול יושב על העולם. לא ההפך בשום מקרה. סדר את 2-4."

Build 124 made the book (`src/game/world/grid.js` `BOOK`) the home of stage 05's places. Stages 02, 03 and 04 were only registered: the numbers live twice, once in the stage's own files and once in the book, and `test/book.test.mjs` holds them equal. That is the reverse of the rule. The world and its book come first; a minigame never fixes its own place.

## What to build

### A. One home for every number

For each of stages 02 (`src/game/h111/`), 03 (`src/game/h112/`) and 04 (`src/game/h113/`):

1. Find every world place the stage's code types itself: positions of objects, stands, stretches, posts, gates, yards, stakes, eyes, routes, crane feet, piles, look boxes, film camera points. Search `model.js`, `world.js`, `pack.js`, every acts file, `stakes.js`, `bond.js`, `hoist.js`.
2. A place that is already in `BOOK.s0N`: delete the stage's own copy and read it from the book (as `h120/layout.js` does).
3. A place that is not yet in the book: add it to the book first (table and `entries`, with its label and source or המחשה), then read it from there.
4. What may stay in the stage files: sizes, counts, speeds, tolerances, offsets that are relative to a book place (for example "1.4 back along the stretch"), and heights that come from the world model. No absolute x or z of the world.

No number may change. This build moves the home of the numbers and nothing else: no place, no gameplay, no camera, no score changes.

### B. Stage 01 audit

Stage 01 (`src/game/h109/`) already reads `BOOK`. Run the same search there and list what is still typed locally. Move what you find by the same rule. If something in stage 01 is too entangled to move safely today, leave it and report it with file and line.

### C. Tests

- Turn the equality tests of stages 02–04 in `test/book.test.mjs` into "reads from the book" tests, like the stage 05 test: the stage's tables are the book's own (same reference or deep equal built from the book).
- Add `test/h126-nobook.test.mjs`: a source scan of `h109`, `h111`, `h112`, `h113` and `h120` that fails when a file holds an absolute world coordinate pair outside the book. Keep a short, explained allow list for the honest exceptions; every entry of the list is reported to me.
- Before you start, record a snapshot of every act's stand and every placed object of stages 01–04 (a small script that prints them from the running models). After the move the snapshot must be identical, number for number. Keep the script in `tools/` and its test in `test/`.
- All existing tests stay green.

### D. The table

Regenerate `docs/specs/sefer-ktovot-he.md` with `tools/book-table.mjs` so the new entries appear.

## What must not change

- Stage 05 and its tests.
- The look of build 125 (`world/look.js`, grips, wants and holds).
- `twin.js`.
- Shared files only in marked `h126` blocks.

## What to hand back

1. The list of every number you moved, per stage: where it was (file and line) and its book key.
2. The list of every new book entry.
3. The allow list of the scan test, with the reason for each line.
4. The snapshot test passing, the whole test suite passing.
5. One whole-stage bot replay by touch for each of stages 02, 03 and 04 (and 01 if you changed it), no errors. Before any probe run `pgrep -fa probe109` and wait while another probe is running; never two probes at once.
6. Say honestly what was not moved and what was not checked.
