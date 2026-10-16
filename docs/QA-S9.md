# QA-S9 — wave 9: the owner's notes of 28.9, by real touch (QA9, 2026-09-28)

QA9, branch `s9-qa` (worktree `/home/claude/wt/qa9`). I changed no game code. Every verdict below comes from a real-touch run
that I watched, and every shot cited is one I looked at.

## How it is played
`NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/real-play.cjs [--no-build] [--max=800] [--shots=16]`
- **The browser.** Playwright Chromium (SwiftShader) with `hasTouch` and `isMobile`, at 390×844 and dpr 1. Each run is a
  fresh profile, in normal mode, in he-IL.
- **Input.** Only `page.touchscreen.tap`, placed where the screen invites a first-time player, in this order:
  1. the gold pointer and ring (`.gm-mark`);
  2. the coach's hand;
  3. a rock that is actually visible (on screen, and the first opaque raycast hit);
  4. the gold card button, or the sheet's big button;
  5. the goal pill.

  There is no `__MG_AUTO`, no `__M3_AUTO`, no `_.resync`, and no calls to `onSiteTap`, `onBoulderTap` or `onMissTap`.
- **The precision games** are played where and when the game's own hand shows (`.fx-mg.__mg.cue()`). When the hand never says
  "now" for 8 s, the player taps anyway. After 45 s without an end, he skips.
- **The board** is played by a greedy player. It reads the board's pixels and plays the longest line by two taps.
- **Test hooks (renderer only).**
  - `__START_PAUSED` with `__T.simulate`: the world runs in real time, and a frame is drawn before every tap and every shot.
  - New in wave 9: while a 2D game (a precision game or the board) is open, the idle WebGL canvas is hidden (visibility only;
    it is shown again for each shot). Under SwiftShader, that canvas starves `requestAnimationFrame` to 0.33 frames/s (probe:
    42/s with it hidden), so a timing game stood still. The game's logic, input and timing are untouched.
- **Output.** The shots are in `test/out/real-play/normal-NN-*.png`. That folder is git-ignored, so the files stay on this
  machine. The run's record is in `normal-seen.json` and `normal-strikes.json` in the same folder.

## What changed in test/real-play.cjs (v16's selectors → v17's flow)
- The pointer is `.gm-mark` and its `mark` event. The survey, every strike and the first stones tap the pointer. A player
  looks for it for up to 2.5 s before tapping anything else.
- The greeting "שלום, הכהן <שם>" is a third card. The name check reads the card, the HUD chip and the plate.
- The segment is found by its stones (the pill buys it too, not only the sheet's "▶ הביאו 8 אבנים").
- A words timeline records the pill, the coach's line and the newest toast. It gives two checks:
  - N4e: no "הנח … אבן הפינה" in the 25 s after the segment;
  - words match the games: a stone the player hews (the quarry game) is never "הנח".
- The boulders' spots are read from the world (`stages.boulderSpots()`, guarded; v17's list otherwise). The same script then
  measures SITE9's boulder field: the camera distance at each strike, and the walk from rock to rock.
- New checks:
  - every precision game played by hand comes to a result;
  - four opens of one profile show four different loading facts, and the games' facts don't repeat;
  - the score runs after the first touches.
- Fixed a bug inherited from wave 8B. The how-to stays in the DOM (hidden), so the old loop waited on it forever and never
  tapped. It now reads the game's own `state().how`.

## The owner's notes of 28.9 on v17 (master 1428e5c), by touch — 15:46 UTC
Run 3 scored 18/22 in 941 s. The boulders and the first minutes were played three times, with the same result each time.
| # | the owner's words (28.9) | v17 | evidence (shots in test/out/real-play/, run 3) |
|---|---|---|---|
| N1 | "שתי האבנים האחרונות מוסתרות ולא רואים על מה מכים" | ✓ | 0 of 24 strikes on an unseen rock (raycast at each strike), 3 runs |
| N4a | "לא מבינים על מה להקיש" | ✗ half | ✓ survey: pointer + ring on the builder, "הקש כדי למדוד את ההר" (01); ✓ the first rock (02). ✗ after each split, 11 looks of 2.5 s found no pointer in frame: rubble, no rock, "הקש כשהטבעת נסגרת" (03). ✗ after the name: no pointer at all (12) |
| N4b | "זום אאוט מאוד גדול" | ✓ at the rocks | camera→rock median 71, max 147 amot. v17's field is 426×256 amot; rock to rock median 84, max 183 |
| N4c, N4j | "לא מבינים מה קורה שם"; "רק לחיצות רנדומליות ומידע בלי שבאמת זז משהו" | ✓ at the rocks, ✗ in the courses | the rocks split, rubble and patches show (04, 05). After the name the frame is bare ground and a stake cord. The only target is the pill "נדבך 1 מתוך 6 · אבן 3 מתוך 32 · הקש". Stones 2→24 are set by pill taps and rise off screen (11, 12, 13) |
| N4k | "ההר ריק מפועלים ומכלי בנייה ומנופים" | ✓ at the rocks, ✗ in the courses | a gang of 5 and an ox cart with stones (01); two men at each rock (02, 04); the crane and the stock behind the crane game (06). Nobody is in frame in the courses (11) |
| N4d | "בחלונית בנה מקטע 8 אבנים לא כ"כ ברור מה אני צריך לעשות" | ✓ words, ~ path | the pill buys the segment: "בנה שיטוח ההר · למקטע הבא · 12 אבנים" → "באתר · 8 אבנים הגיעו לאתר". 12 then 8 reads oddly. The panel: "8 אבנים מגיעות לאתר. הצוות מניח אותן, ואתה מאיץ: שלוש הקשות לאבן" |
| N4e | "אחרי לחיצה אחת כבר כתבו הנח את אבן הפינה" | ✗ words | the 25 s after the first segment are clean. The corner comes after the 2nd segment: the coach says "אבן הפינה: רק אתה מניח", the pill "אבן פינה: הנח אותה בעצמך", and the game hews: "המחצבה · אבן הפינה · חציבה" (14) |
| N4f | "המשחקונים בהנח את אבן הפינה תקולים" | ✓ playable | the quarry game by hand: 21 taps, 35 s, 100% "מופת" (16). Only its words are wrong (N4e) |
| N4g | "משחקון המחצבה תקול. משחק לבד עם עצמו" | **✗ (the board)** | the quarry precision game waits and plays by hand ✓. But the quarry BOARD ("המחצבה · משחק האוצר") cannot be touched at all in normal mode (the P0 below), and it plays itself in demo. That is the owner's words exactly |
| N2 | "המשחקון ביניים רץ בספיד ולא ניתן לשחק בו (אולי זה רק מצב ההדגמה)" | ✓ | normal mode: the crane by hand, "מופת · מושלם", 1 tap on the hand's "now" (07). The demo trap: `#demo` shows "יציאה ממצב הדגמה ✕"; one tap gives the regular game, drops `#demo` and stores no `demo` (demo-01-exit-chip). The chip is 130×32 px, under 44 |
| N4i | "גם משחקון הסיתות תקול" | not reached | no stone in the first 15 minutes is dressed |
| N4h | "בעוד 0:02 … לא סופר אחורה" | not reached (run 3) | no m:ss was on screen in 15 minutes: the strip starts at ftue 6, which came at the end. Run 4 checks it |
| N3 | "פרט מידע אמיתי — כל פעם חוזר על אותו דבר" | ✓ | 4 opens of one profile gave 4 different loading facts, each with "פרט אמיתי · טיוטה". The crane and the quarry showed 2 more, with sources (07, 16) |
| N3b | "לאחר הבחירה בשם … לא רואים אותה בשום מקום … שלום הכהן יכין" | ✓ | the card "שלום, הכהן אהרן" (10), the HUD chip "אהרן", the plate "הכהן אהרן", and the coach: "אהרן, נגמרו האבנים: שחק במחצבה" |
| N5 | "מוסיקה נלווית מותאמת" | ✓ | after the first touches the score is running and follows the game (state "board" on the board) |
| N4l | "צריך לתת עוד מחשבה… Skyscraper" | design | docs/STAGING.md (DESIGN8B/DESIGN9) |

## The merge (throwaway, wt/peek-qa9, never pushed), by touch — the new beats
**Merge 1 (16:02: master + s9-site 0b08efe + s9-flow 8d5838e).** Bundle 2,593,204 B (+9,888 vs v17), gzip 832,733 (+4,067).
Shots are in wt/peek-qa9/test/out/real-play/ (copied to the scratchpad as m1/).
| beat | verdict | evidence |
|---|---|---|
| the rock field, close | ✓ | `boulderSpots()` gives a field of 102×118 amot. Rock to rock is 24 amot every hop (v17: median 84, max 183), and the hill took 106 s (v17: 153–160). Camera→rock median 70, max 71. 0/24 strikes unseen. The pointer was on the struck rock before every strike: 0 looks without it (v17: 11) (02, 03) |
| the walls framed (M7/M8) | ✓ frame, ✗ pointer | after the name: the builder with the plate "הכהן אהרן" at his banker, the treadwheel crane, the stock, the bankers' stones, before the bay's cut face (10–12). There was no gold pointer at ftue 5, so the pill stayed the only mark (11). FLOW9 answered with e04e8ad (the pointer ON the block on the banker), checked in merge 2 |
| the corner stone hewn → cart → crane (M11) | ✓ words and calls, ✗ on screen | toast "אבן הפינה נחצבה · העגלה מביאה אותה, והמנוף יניח אותה"; pill "אבן הפינה בדרך לאתר"; `deliverKeyStone('har',{what:'corner'})` called once and landed at 19.6 s. On screen: at 3 s the cart was cut off at the left edge (16); at 11 s the ledge showed an ox, no block and no hook (17); at 20 s the frame was back on the builder, with the crane idle (18) |
| the words match the games | ✓ | crane: pill "האבן הגדולה: הנח אותה במנוף", coach "את האבן המיוחדת תניח אתה במנוף" (04, 05). Corner: coach "אבן הפינה: אתה חוצב אותה", pill "אבן הפינה: חצוב אותה", game "חציבת אבן הפינה · המחצבה" (13) |

**Merge 2 (16:17: master + s9-site 5266eee + s9-flow 4b003f8).** Bundle 2,595,960 B (+12,644 vs v17), gzip 834,021 (+5,355).
| beat | verdict | evidence (wt/peek-qa9/test/out/real-play/) |
|---|---|---|
| the rock field, close | ✓ | 24 amot a hop; the hill took 77 s; camera→rock 70–71 amot; 0/24 unseen; 0 looks without the pointer |
| the walls framed (M7/M8) | ✓ frame and pointer, ~ distance | at ftue 5 the pointer is ON the banker (`{at:'har', banker:true}`), and each tap on it is a stroke. The frame is close: builder, banker, plate, a worker, the tool rack and the stock (11). The crane falls out of frame, and the pointer drifts to the left edge (taps at x = 51 and 22). DESIGN9: CAM.WALL-W 45 amot |
| the segment | ✓ | pill "בנה שיטוח ההר · הביאו 8 אבנים · מחיר 12 אבנים" |
| the words match the games | ✓ | as in merge 1 (13) |
| M11 on screen | ✗ | the call lands at 19.8 s. 3 s: the pointer and ring are on the empty corner slot beside the crane, and the cart is cut off at the left edge (16). **"11 s": the toast "אבן הפינה: במקומה · מושלם. ישרה כמו חוט", while the ringed spot is empty and no block shows anywhere** (17). The toast comes after the promise (index.js:1188); my shots lag by seconds, so this frame is after the landing, and the landed stone is not in frame. 20 s: bare ledge, no block, and the crane cut off at the corner (18) |
| the board by hand | **✗ P0: dead to touch** | the board waits (30 moves stay 30 in 5 s), but no player can start it. At the centre of "התחל", `elementFromPoint` returns `BODY.gm-on`, and both a touch and a mouse click are ignored (v17 run 4 too). See "P0: the board" below |

## P0: the board ("משחק האוצר") cannot be touched in the real game — v17 and the merge
- **Symptom.** A player reaches the board ("אהרן, נגמרו האבנים: שחק במחצבה" → "▶ המחצבה עוד 8 אבנים: משחק האוצר"), and the start
  card shows. A touch on "התחל" does nothing, nor does a mouse click, and the board waits forever. Taps then fall through to
  the HUD beneath. In merge 2 that ended with `__T.game` torn down.
- **Root cause (code + probe).**
  - src/game/index.js:1078 mounts the board in the HUD root (`runLevel({ root: ui.root || document.body, … })`).
  - src/match3/ui.js:147 appends it there.
  - The root is `.gm{…;pointer-events:none;…}` (src/game/ui.css.js:30), and nothing in src/match3 sets `pointer-events:auto`.
    The property is inherited, so the whole board computes to `none`.
  - A probe on the merge build (scratch board-probe2) shows it:
    - as built: `.m3` pointer-events `none`, and the hit at "התחל" is `BODY.gm-on`;
    - with `.gm .m3{pointer-events:auto}`: the hit is `BUTTON.m3-cta`, one touch starts the board, and the moves read 30.
- **Why every suite stayed green.** GAMES8B's minigames-touch mounts the board on `document.body` in a light page. The game's own
  tests play the board with `__M3_AUTO`, and the demo plays it by code. This is very likely the owner's N4g: "משחקון המחצבה
  תקול. משחק לבד עם עצמו" — dead to touch in normal mode, and playing itself in demo.
- **Fix (FLOW9's file):** `.gm .m3{pointer-events:auto}` in src/game/ui.css.js. Posted on the bus at 16:31 and relayed to the
  supervisor.

## What a first-time player trips on (new, beyond the owner's notes)
1. **M11: "במקומה", while no stone is in sight** (merge 2, shot 17). The words are honest (they come after the landing), but the
   frame never shows the block. SITE9 should frame the cart, the hook and the slot, and FLOW9 should hold the camera there.
2. **v17 only (fixed on the merge): after a rock splits, nothing to tap for ≥ 2.5 s.** The coach says "הקש כשהטבעת נסגרת", but
   there is no ring or rock in frame (v17 shot 03).
3. **The courses' pointer at the screen's edge** (x = 22 of 390; merge 2). A thumb at the edge also hits the OS back gesture on
   Android.
4. **The demo strip's chips are 32 px tall** ("יציאה ממצב הדגמה ✕", "דלג לפרק הבא", "הרגע הבא ✦ 1/9"), under the 44-px rule.
5. **The segment's numbers** on v17 read "12 אבנים" then "8 אבנים הגיעו". The merge's "הביאו 8 אבנים · מחיר 12 אבנים" fixes it.
6. **The first stone is trivially perfect.** One tap on the hand's "now" gives "מופת · מושלם" 100%. That is fine for a first
   stone, but the hand keeps guiding the next ones (guideTo), so a player may never learn the timing alone. A design question
   for the games' owner (none this wave).

**Merge 3, final (16:37: s9-site f5fbc25 + s9-flow 45fce58): 20/22.** Bundle 2,597,835 B (+14,519 vs v17).
- Rocks, pointer and words: as in merge 2. The hill took 75 s.
- M7/M8: the builder at his banker with four workers in blue caps (11). After the segment, an ox cart brings the stones and
  the course of set blocks shows along the bay's edge (12). But the builder sits at the left edge, and his plate is cut off.
- M11: better, not yet there. At 3 s the crane, the ringed spot, the stock and the cart arriving from the right are in one
  frame (16). At 11 s and 20 s the crane is idle and the ringed spot is empty. The call lands at 20.1 s, and the block is
  never seen on the hook or in a slot (17, 18).
- The two FAILs:
  - the board: dead to touch in this build; fixed on s9-flow in 0169ccd, see below;
  - N4h: no clock is on screen before the board, because the strip starts at ftue 6 and the run stops at the stuck board.

**The board fix, verified (16:50: s9-site d845855 + s9-flow 718fb79, bundle 2,598,147 B, +14,831 vs v17; gzip 834,874, +6,208).**
- As built, the hit at "התחל" is `BUTTON.m3-cta` (pointer-events `auto`), and one touch starts the board (scratch probe; shot
  merge3/probe-board-by-hand.png).
- My greedy player then made 0 moves in 18 swaps. Its pixel reader predates v17's tile art (the cream cells with pomegranates,
  menorahs and jugs), so "≥ 20 moves by hand" is still unproven by my harness. That is not a game failure: the game's own hint
  hand shows on the board.

## Where the evidence is
Everything is in test/out/real-play/ in this worktree (git-ignored, on this machine), and I looked at every shot cited:
- v17/: run 3, shots 01–16, and run.log;
- merge1/, merge2/, merge3/: each merge's shots and run.log;
- demo-01-exit-chip.png;
- the files at the folder's top level: run 4 on v17.

The throwaway merge is wt/peek-qa9 (detached, never pushed). It can go with `git worktree remove --force /home/claude/wt/peek-qa9`.
