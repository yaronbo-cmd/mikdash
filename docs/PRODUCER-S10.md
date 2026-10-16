# PRODUCER-S10 — the owner's eyes, wave 10 (טיוטה, 28.9)

PRODUCER10 played every build the way the owner does: a phone at 390×844, real touch only (`page.touchscreen.tap` on what the
screen shows), a fresh profile (then the same profile kept, as a phone keeps its save), and a look at every screenshot.
No autoplay flags; the only hook is the renderer's (`__START_PAUSED` + `__T.simulate`: SwiftShader draws a frame before each tap
and each shot). One declared exception: to reach the course checks (set 64 and 128) in the time left, two runs wrote the state
once (the seed's jump: `--jump`, logged) and then played by touch.

Harnesses (test/, mine): `produce-play.cjs` (the regular game in parts over one persistent profile; the board read as pictures;
`--reel`, `--jump`, `--keyEvery`, `--reloadEnd`), `produce-opening.cjs` (the first minute frame by frame), `produce-middot.cjs`,
`produce-games.cjs`, `produce-net.cjs`, `produce-demo.cjs`. Shots: `/home/claude/wt/producer10/test/out/produce/<tag>-NN-<step>.png`
(not committed). The notes N1–N22, with the owners' answers under them, are in `/home/claude/wt/bus/PRODUCER10.md`.

Builds played: **v19** (master 00b89b1) · **FLOW10** 907165c (fresh profile → course 1 → the board) · **the four branches
merged** on a throwaway HEAD (s10-flow f33b13f + s10-middot ec20c82 + s10-games cc5a26d + s10-net 96fb4ee): merges clean,
2,751,931 B (2.62 MiB, +150 KB over v19, under 3 MB), `qa-content-scan` 12/12, `node --test` 205 pass / 0 fail / 9 skipped.

## 1. The owner's notes of 28.9 — ✓/✗ with evidence

| his words (28.9, Jerusalem time) | v19 (master), by touch | wave 10 (branches), by touch | evidence (test/out/produce/) |
|---|---|---|---|
| 21:16 "בשלב שעובר ליסוד המזבח יש יותר מדי אור צהוב" | fixed in v19 (the shadowed `smooth`) | ✓ the chapter's end (the Mount → the courts, the demo's skip, the merged build): the card and the showcase at +3/5/8/10 s have a yellow index of 19 and lum 134, after it 9 — no yellow wash; the exact moment "passing to the altar's yesod" not reached by touch · every world shot of the Mount: yellow index 18–44, lum 120–175 at noon | dem1-05…09 · the `light` field in every run's log |
| 21:42 "בשלב שיטוח ההר נדבך 5 השחקן נעלם" | not reached by touch on v19 tonight | ✓ at the check itself: he stands big over the plumb's sheet, then back at his bench and in the bay; set 140 at his bench · ✗ a reload at course 5 opens on an empty plaza (N34) | c5-06, c5-07, c5-08, c5-13 · c5-14, c5-15 |
| 21:46 "גם בשלב נדבך 1 הדמות של השחקן נעלמת. והחץ במקום אחר" | ✗ course 1 opens on an empty ring, he walks in only after three taps; the banker flips floor ↔ ledge every few stones | ✓ FLOW10: he is at his banker with the pointer on his bench when course 1 starts; set 2–16 all on the bay floor, same side | base1-13, base1-14…19 · flow1-14, flow1-17…22 |
| 21:57 "גם בנדבך 2 … הדמות רחוקה מהאתר. תקועה … לא רואים אותה והאבן המסותת נמצאת באוויר" | ✓ on v19 already in course 2 (set 33–48 at his banker); no floating stone seen | ✓ (FLOW10's part 2: 34/34 stones with him on screen, banker in the bay) | base3-11, -12, -18 · flow10 p2-s33…s65 |
| 21:33 a quiz after each chapter, points, a final test worth many points | — | ✓ MIDDOT10 (see §2) | mid3-07…10 |
| 21:33 every place name a button "איפה זה בעולם" | — | ✓ with layout bugs (N24, N27–N29) | mid3-03, -04, -06 |
| 21:33 a few classic in-between games | — | ✓ four games (ארבע בנדבך, זיכרון הכלים, מרוץ הכבש, נדבך על נדבך; a fifth, שיר הלויים, in the menu at 22:50), each alone or two on one phone · the duel's top half, dead in the real build at 22:35 (N37), ✓ fixed and re-played by touch at 22:52 | gam4-05, -09, -17, -19 · gam5-04, -05, -09 |
| 21:33 two kohanim from two devices, building together, a friendly race | — | ✓ a working prototype between two tabs (the mock); the real platform (same Claude account) not yet tried on two phones · ✗ the flight to the other kohen zooms out (N31) | NET10's net-together-B-sees-A, -A-race, -A-edge |
| 21:42 "סוכן מפיק שמשחק ומעיר" | this document; 30 notes on the bus, most answered within the hour | | bus/PRODUCER10.md |

**His notes of 12:18 (wave 8B), seen again tonight by touch:** the rocks are all visible, the pointer ON each one, the camera near
(✓ base1-02); the mini-games wait for the player and play by hand (✓ crane, quarry, dressing: base1-06, base3-10); the facts change
(✓ a different sourced fact on each card and loading screen); the name → "שלום, הכהן אהרן" + the plate + the chip (✓ base1-12);
"הביאו 8 אבנים" says what it does (✓); after the first tap it no longer says "הנח את אבן הפינה" — it says "חצוב אותה" / "סתת
אותה בעצמך" (✓); the Mount is alive (crews, crane, ox carts ✓); **"ההתקדמות לא נראית בעין בעולם" was still true on v19** (no
course in frame, N13) and is **fixed on FLOW10** (the course rises along the face in every frame, flow1-19/20/22).

## 2. The new features, as a first-time player meets them

### מסכת מידות: the chapter quiz and "איפה זה בעולם" (MIDDOT10) — played by touch on the owner's save (course 2)
- **Where he finds it:** the dock's "ספר מידות" (a gold badge "1"). The book opens with "0 נקודות לימוד — קרא את המשניות שנפתחו
  בפרק, ומבחן קצר יחכה לך בסופו". At course 2 only ב, א is open; the rest say when they open ("נפתחת בסוף הבנייה של שיטוח ההר").
- **The place link:** in ב, א "הַר הַבַּיִת" is dotted with a pin, and a line says "הקש על שם של מקום כדי לראות איפה הוא בעולם".
  One tap: the book closes, the camera flies, a card quotes the Mishnah with its source + טיוטה, a chip leads back to the same
  mishna (mid3-03 → mid3-04 → mid3-06). ✓ It works and it is the owner's idea exactly. ✗ The chip breaks on a phone ("הר …", one
  word per line, N27); two gold "back" buttons (N28); "הר הבית" flies to the finished court, not to the Mount he is building (N29);
  a place not built yet can land on a blank wall (N24, MIDDOT10's own shot).
- **The quiz:** right after reading, a gold card "למדת את פרק ב׳! מבחן קצר מחכה לך: 3 שאלות, 10 נקודות לכל תשובה נכונה". Three
  questions, big answers (358×50), "נכון!" with the quote and source; a wrong answer shows the right one kindly. Result "1 מתוך 3 ·
  כל תשובה היא עוד משהו שלמדת. אפשר לנסות שוב מתי שתרצה" · +10 נקודות לימוד · +2 כסף; the book keeps "השיא שלך". ✓ Warm, no shame,
  retakes. The final test (סיום המסכת) opens after five chapters — not reachable by a first-time player tonight (MIDDOT10's own
  seeded run shows it: middot-b5-final-result.png, middot-b6-book-title.png "120 → 170 נקודות").
- **What a child may trip on:** the daily "שאלה ממסכת מידות" (silver) sits right above the chapter quiz (points) — two quiz systems.
- Content: 68 draft questions, one mishna each, every one with its source; no Name letters; answers shuffled. In 15 of 68 the
  right answer is clearly the longest (a test-wise child learns that) — polish.

### משחקי ביניים: four classics and the duel on one phone (GAMES10)
- **Where he finds them:** ☰ → a section "משחקי ביניים" with four big buttons (175×44): ארבע בנדבך · זיכרון הכלים · מרוץ הכבש ·
  נדבך על נדבך, and one line: "משחקים קלאסיים מעולם המקדש — לבד, או שניים על טלפון אחד (כל אחד בקצה שלו)" (gam3-01-menu.png).
  FLOW10 hooked GAMES10's invitation after a stage's cards (at most once a day, never in the first-time flow, never in the demo).
- **Each game:** one screen that is both the how-to and the choice — "לבד" · "שניים — טלפון אחד (כל אחד בקצה שלו, הטלפון על
  השולחן)" · "למשחק אחר". Alone you always start; a gentle builder plays against you.
- **The duel:** the top half turned 180° to the child across the table, each with his own band, name (תכלת · ארגמן, the belt's
  colours) and exit; the words at the end are kind for both ("נדבך שלם!" / "כמעט! … שני בנאים טובים!", "שני הכהנים זריזים!"),
  a small pay (+8 אבנים) and a true fact with its source and טיוטה (four-duel-result.png). No timer that punishes, no loot.
- **Seen fixed tonight:** the stacking tip on a dark pill (N19), one score chip per half in the race (N20), the race alone
  re-framed from the ramp's foot (N23, GAMES10 ae819b4 — not yet seen by me).
- **My own touch run in the real build** (the merged build, the owner's save; gam4-NN-*.png): ☰ → "ארבע בנדבך" → לבד: the gentle
  builder won, "הבנאי השלים נדבך · הפעם הוא הקדים. בנדבך הבא — אתה שוב מתחיל" +8 אבנים + a sourced fact (gam4-05) · the duel: "נדבך
  שלם! … שני בנאים טובים, והפעם שלך" (gam4-09) · זיכרון הכלים alone: all six pairs in 24 taps · the duel: "זיכרון טוב! מצאת זוג
  אחד; ארגמן מצא 5" +6 זהב (gam4-17) · the race alone: two lanes, the ramp fills the screen, a countdown (gam4-19). ✓ Kind words,
  small pay, a true fact, no punishing timer. **✗ In the real build the duel has no top band** — no name, turn line, score or exit
  for the child across the table (gam4-07/08/16; the lab page has it); in the race duel ארגמן has no feet buttons at all and
  always loses 2:0 (gam4-24/25). Cause: src/page.html:64's global `.top {position:fixed; …; pointer-events:none}` also hits
  GAMES10's `.g10-half.top` / `.g10-band.top` (renamed to `.g10-top` = fixed). N37, P1: the duel is the owner's request. The same in
  the stacking duel (gam4-32). Over 8 games the pay was +16 אבנים, +12 זהב, +20 כסף; 0 console errors.

### כהנים יחד: two kohanim, two devices (NET10)
- **Where he finds it:** ☰ → "כהנים יחד · שני כהנים בונים יחד משני מכשירים · טיוטה". A card explains it in two lines with a verse
  (נחמיה ג, א · טיוטה); "פתח עבודה משותפת"; the works open now are listed as buttons ("הצטרף לכהן · 9757"); a 4-digit code is
  the fallback (net-together-B-lobby.png).
- **Together:** the other kohen stands in my world beside mine with a plate "הכהן השני"; a thin strip "יחד: 2 אבנים · אתה 1 ·
  הכהן השני 1"; the panel shows stones, perfect strikes and stones per minute for each, "דיוק שווה · קצב שווה" / "אתה מדויק
  וזריז · יישר כוח לשניכם", and a "יישר כוח" button that sends a cheer (net-together-B-sees-A.png, -A-race.png). No stakes.
- **The limit:** it works only between viewers of the same Claude account (the artifact's room/db) — the owner's family on his
  account. The page must be published with `{ room, db, user }` (NET10's note on the bus). In the test build a local mock joins
  two tabs of one browser.
- **What a child trips on:** the flight to the other kohen shows the whole hill from high above (N31, the old "זום אאוט");
  the open panel covers the world (N32).
- My own two-page run: queued behind the lock at the verdict; see §6 if it ran.


## 3. Top 10 for the next wave (most important first)
1. **The returning player lands on his kohen at his work.** Every reopen tonight started on an empty frame: v19 course 1 (base2-01/02),
   the merged build at course 5 (the plaza with no crane, banker or crew, c5-14/15; N11, N34). The owner reopens the game every
   evening — this is his first frame each time. Owner: FLOW10's successor (index.js start + stages hero placement).
2. **Play the next stage the way we played the Mount.** Nobody played the wall (חומת העזרה) by touch tonight; it is where the owner
   goes next. Run produce-play.cjs from the Mount's end into the wall's first course before any new wall feature is built.
3. **"זום אאוט" never again — a camera rule, checked by a test.** It came back tonight in a new place: the flight to the other kohen
   in "כהנים יחד" shows the whole hill from high above (N31). Make STAGING rule 1 (the kohen ≥ 80 px, the target in frame) a check
   every harness runs at every shot (produce-play logs the kohen's px, on/off, hidden).
4. **The corner stone seen on the hook and landing, by touch at 3-s samples.** FLOW10's own test shows the cart and the hook
   (p1-corner-cart/hook); my runs caught the cart (flow1-26) and then the ring on an empty floor (N15). One clean sequence shot by
   touch, and the ring waits for him.
5. **The place links, finished on the phone:** MIDDOT10 fixed N24–N30 in the last hour (not yet re-seen by my touch); re-verify the
   chip, the single back button and the Mount's own "הר הבית" on a phone; then fold the daily question into the learning points (⚑).
6. **One entry for the in-between games that a child finds by himself.** Today they live in ☰ (a menu a child rarely opens) and in a
   once-a-day invitation after a stage. Add a visible door in the world (a game table by the quarry / a chip after the board).
7. **"כהנים יחד" on two real phones of the owner's account**, published with `{room, db, user}` — the mock proves the logic, only
   the real platform proves the join (presence across devices, the same-account "isMe" case NET10 found).
8. **The browser lock: a queue, not flock's lottery.** Tonight ten runs waited at once and a run waited up to 25 min; half of my
   touch runs lost their turn. A tiny ticket queue (bus/.queue: FIFO, one line per run, ≤ 6 min each) gives every agent its turn.
9. **The owner's-play harness as a gate.** produce-play.cjs (fresh profile → the board, then a reload) + a contact sheet of its
   shots for the owner, run on every candidate before publish; a P1 in it blocks the publish.
10. **Polish that the owner will notice:** the rocks' camera 28° → 18° so he never leaves the frame mid-glide (N9, ⚑ DESIGN); the
    opening's coach line after the camera lands (N6); the course label inside the frame (N35); the sheet's red line under the bar
    (N36); in 15 of 68 quiz questions the right answer is the longest (a test-wise child learns it).

## 4. The notes (N1–N38) and where they stand at 22:42
Seen = re-verified by my own touch run; answered = the owner's fix on the bus, seen in the owner's own shots or not yet re-seen.

| note | owner · sev | what | state |
|---|---|---|---|
| N1 | FLOW10 · P1 | no kohen when course 1 starts | ✓ seen (flow1-14) |
| N2 | FLOW10 · P1 | the banker flips floor ↔ ledge | ✓ seen (flow1-17…22; FLOW10: banker 66/66 in the bay) |
| N3 | FLOW10 · P1 | the corner stone never seen | half: the cart seen (flow1-26); the hook in FLOW10's shots (p2-corner-hook) |
| N4/N15 | FLOW10 · P1 | a plate / a ring with no kohen after the corner stone | answered (2caf9d3, 9c69ab9: he follows his banker) |
| N5 | FLOW10 · P2 | the crane game says gold, shows green | ✓ seen (c5-11: a gold dashed slot) |
| N6 | FLOW10 · P2 | the coach line over the opening's vision | open (a 1–2 s overlap) |
| N7 | FLOW10 · P2 | the survey's pill and two rings | ✓ pill seen; one ring answered (d8eba63) |
| N8 | FLOW10 · P2 | two messages over the great stone | ✓ seen (flow1-09) |
| N9 | FLOW10 · P2 | the rocks' camera leaves him mid-glide | ⚑ DESIGN (28° → 18°) |
| N10 | FLOW10 · P1 | no verb after the first-time flow | ✓ seen ("סתת: הקש על הכהן") |
| N11/N34 | FLOW10 · P1 | a reload opens on an empty frame | ✗ seen on 5bcee17 (c5-14/15); answered 492b427 (he waits at his banker at the check / the next segment; a reload places him there once the crane is posed) — not re-seen by touch |
| N12 | FLOW10 · P2 | the mishmar chips 38 px | answered (907165c) |
| N13 | FLOW10 · P1 | no course in frame | ✓ seen (flow1-19/20/22, c5-13) |
| N14 | FLOW10 · P2 | the album card's source | answered (87cfcb0) |
| N16 | MIDDOT10 · P1 | test shots not of their moment | ✓ seen in MIDDOT10's shots |
| N17 | FLOW10 · P1 | the name plate over the sheets | ✓ seen (mid3: no plate over the book) |
| N18 | FLOW10 · P2 | the top row overflows | answered (66e8163) |
| N19/N20 | GAMES10 · P2 | the stack tip; the race's chips | ✓ seen in GAMES10's shots |
| N21 | FLOW10 · P2 | ☰ 40×40 | answered (66e8163) |
| N22 | FLOW10 · P2 | the welcome-back card late | answered (a SwiftShader boot artefact) — to watch on a phone |
| N23 | GAMES10 · P2 | the race alone: plates on one spot, small runners | answered (ae819b4) |
| N24–N30 | MIDDOT10 · P1/P2 | the place flight: blank wall, too close, chips, broken chip, two backs, the Mount, a lone digit | answered (b8259a9, cdced26, 1eff916, cbfb8bc) |
| N31 | NET10 · P1 | the flight to the other kohen zooms out to the whole hill | half: 566ce84 flies to his plot, not the whole hill, but steep and in fog, he ~20 px (NET10's net-together-A-look.png) — P2 now |
| N32 | NET10 · P2 | the panel covers the world | answered 566ce84 (folded by default; details as a bottom sheet) |
| N33 | NET10 · P2 | the mock's engineer line | test build only |
| N35/N36 | FLOW10 · P2 | the course label cut; the sheet's red line on the bar | N35 answered 63d5224 · N36 open (freeze) |
| N37 | GAMES10 · P1 | the duel's top half dead in the real build (page.html's global `.top`) | ✓ fixed 5982f64 (`g10-t`/`g10-b`): seen by my touch in the real build (gam5-04/05/09) and in GAMES10's real-four-duel/real-race-duel |
| N38 | GAMES10 · P2 | "בנית 1 נדבכים!" | answered e745a20 |

## 5. ⚑ לבעלים (טיוטה; ברירת המחדל בסוגריים)
- ⚑ **כשפותחים את המשחק מחדש** — תמיד לנחות על הכהן שלך ליד הספסל שלו, עם המנוף והנדבך בפריים (הערב: רחבה ריקה או מבט רחוק בשניות
  הראשונות). (כן — ראשון בגל הבא.)
- ⚑ **שני סוגי חידון בספר מידות** — "שאלה ממסכת מידות" היומית (כסף) ומבחני הפרקים (נקודות לימוד) זה ליד זה. (להשאיר את שניהם הלילה;
  בגל הבא לאחד את השאלה היומית לתוך נקודות הלימוד.)
- ⚑ **מצלמת הסלעים** — לסובב 18° במקום 28°, כדי שהכהן לא ייצא מהפריים במעבר בין סלעים. (18°.)
- ⚑ **כהנים יחד** עובד רק בין מכשירים של אותו חשבון Claude (המשפחה שלך), ורק בקישור המפורסם. (לפרסם כטיוטה ולבדוק על שני הטלפונים
  שלך לפני שמראים לילדים.)
- ⚑ **משחקי ביניים** — היום נכנסים אליהם מהתפריט ☰ ומהזמנה פעם ביום אחרי שלב. (להוסיף בגל הבא דלת גלויה בעולם: שולחן משחק ליד
  המחצבה.)
- ⚑ **סוכן מפיק בכל גל** — משחק כל גרסה במגע לפני פרסום, ו־P1 פתוח אצלו עוצר פרסום. (כן.)

## 6. After the verdict (runs that got the lock after 22:40)
- 22:45 — **N37 ✓** in GAMES10's real-build shots: the four duel's far band "ארגמן · אבנים זהובות · ממתין לתורו" turned to the
  child across (test/out/games/real-four-duel.png in wt/games10); the race duel with both halves and both pairs of feet
  (real-race-duel.png).
- 22:43 — **N31 half** in NET10's own shot (net-together-A-look.png): the flight to the other kohen lands on his survey plot (no
  longer the whole hill), but steep, almost top-down, in fog, and he is ~20 px.
- 22:52 — **N37 ✓ by my own touch** on the 22:41 merge (s10-flow 63d5224 + middot c1071a5 + games e745a20 + net 566ce84): the four
  duel's far band turned to ארגמן and a result card for each child (gam5-04, gam5-05); the race duel with both halves and both pairs
  of feet, 140 taps, "שני הכהנים זריזים! רצת יפה — ארגמן הקדים מעט (0:2)", +10 כסף, the race told without its injury (gam5-09).
  0 console errors. The duel on one phone works in the real build.
- 22:53 — **the demo on the merged build** (dem1-NN): the chips "יציאה ממצב הדגמה ✕" 130×44 · "דלג לפרק הבא" 93×44 · "הרגע הבא ✦"
  99×44 ✓ (were 27–32 px on v19); **the whole House keeps its plaza** at +3/+10/+18 s while the crews' stones sync (dem1-02…04, v19's
  fix 1 ✓); **the chapter's end is not yellow** (dem1-05…09, fix 2 ✓); the first reel beat plays the board ("המחצבה: ניצחת!").
  Still: the ☰ button measured 40×44 in the demo's crowded top row, and the leftmost resource chip is cut at the edge with the
  demo's large numbers (1.5K · 990 · 2.7K · 2.4K) — N18/N21, P2. 0 console errors.
