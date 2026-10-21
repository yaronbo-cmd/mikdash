# PRODUCER-S11 — the owner's eyes, wave 11 (טיוטה, 29.9)

The owner, 29.9 09:13 Jerusalem: "כן. תן לו לרוץ על כל המשחק גם על השבים [השלבים] הבאים ולהעיר הערותיו ולשפר בהתאם. אגב, זה
שהכהן עכשיו זז מנקודה לנקודה זה מאוד יפה. שימשיכו ככה. תודה. זה הכי חשוב שיהיה כיף ומעניין ותקין כמובן."

The compass: **כיף** (something happens a child wants to see) · **מעניין** (a true thing learned, a view, a choice) · **תקין** (a
tap gives a result; nothing stuck, floating, hidden or zoomed out). And: the kohen ≥ 80 px in frame (K80), walking point to point.

## 0. How I played
- A phone at 390×844 (dpr 1, touch, he-IL), real touch only (`page.touchscreen.tap` / a touch held and released for the key
  moments' "החזק"), a look at every screenshot. The only hook is the renderer's (`__START_PAUSED` + `__T.simulate`).
- **The declared jump** (test/produce-play.cjs, mine): `--jump='{"stage":"<id>"}'` writes the state ONCE — every stage before it
  in content.js order done, with what a player has by then (crews, priests, the book's mishnayot, finds, chapters) and enough
  materials — then only touch. `{"stage":"<id>","frac":f}` puts a site at a fraction (the game's own v5 → v6 conversion);
  `--jumpReload=1` reopens the saved game (the owner's evening reload); `--stages=a,b@0.9:170,…` plays several stages in one run.
- **Every shot logs K80** (on screen, not hidden, the projected 3.6 amot ≥ 80 px) and every run logs **his walk** (the spots he
  stands at, the steps between them).
- **The queue** (bus/brun, FIFO, one run at a time on 2 cores, ≤ 10 min): 20+ tickets most of the morning; I got a run every
  ~25–40 minutes. Where a run could not reach something, the table says so.
- Builds: **v20** = master d1e27cc (the owner's build) · **peekA** = master + s11-flow 696a152 + s11-site 4a2470d + s11-fun 52147a7
  (06:31) · **peekB** = + 04fd9b2 / 4a0badf / 2df0ca4 (06:51) · later merges below. Shots: `wt/producer11/test/out/produce/<tag>-NN-<step>.png`.

## 1a. The verdict per stage, on the latest merge I played (✓ / ½ / ✗)
| stage | build | כיף | מעניין | תקין | in one line |
|---|---|---|---|---|---|
| שיטוח ההר (its end) | peekH 7bfd750 | ½ | ✓ | ✓ | he is big at the finish, the inspection and the reopen (96–98 px); the paving growing and the great stone in the world are not in frame yet |
| **חומת העזרה** | **peekG cb0dea3** | **✓** | **✓** | **✓** | **the owner's game from its start to the next stage: K80 11 of 12, 22–24 spots, the pointer on his banker** |
| שערי העזרה | peekG (survey) · FLOW11's reload (courses) | ✓ | ✓ | ½ | the survey 105 px; the first course alive (jambs, scaffold, crane, 91 px) in FLOW11's shot; my full run was on peekA (N44, fixed since) |
| עזרת הנשים | **peekJ 45f7555** | ✓ | ✓ | ✓ | the survey 105 px with the pointer on him and the women's court's crowd behind; the dig 87–105 px (N45, N47 ✓ by my touch); he is see-through at the survey (N68, P2) |
| הסורג והחיל | peekA | ½ | ✓ | ½ | the dig 87–89 px; the survey below the dock (N46 answered) |
| שער ניקנור | peekA | ✗ | ✓ | ✗ | 16 px at the survey, hidden at the dig, long walks (N47 answered; re-run §1b) |
| הלשכות | peekE | ½ | ✓ | ½ | the dig 89–105 px; the survey's frame a wall's face (N55) |
| יסוד המזבח | peekE | ½ | ✓ | ½ | a wooden mallet and a whole stone ✓; the survey cut at the edge (N56 answered) |
| הסובב | peekE | ½ | ✓ | ✗ | the first segment framed from behind the yesod (N55) |
| גוף המזבח והכבש | peekE | ½ | ✓ | ½ | the red cord ✓; behind the altar at the dig (N55); an iron pick at the survey (N59) |
| הקרנות | peekE | – | ✓ | ✓ | only the survey reached: 104 px, the pointer on him |
| הכיור | peekF | ½ | ✓ | ½ | the survey is the altar's plaster (N55); the dig 91–104 px |
| האולם | peekF | ½ | ✓ | ½ | the survey framed across the finished kiyor — beautiful — but without him; the dig inside a rock (N61) |
| ההיכל | **peekJ** | ✓ | ✓ | ✓ | the survey 105 px, the pointer on him, stonecutters around (N61 ✓ by my touch) |
| קודש הקדשים | peekF · peekH | ✓ | ✓ | ✗ | "האומנים בתיבות" ✓ in the world and the card; the reopen at it a grey wall (N66) and the last card covered (N67) — both answered at fc88274 |
| **חנוכת הבית (the finale)** | **peekJ** | **✓** | **✓** | **✓** | the Kodesh's card free (N67 ✓) → "פרק ד׳ הושלם!" → "מי שלא ראה בנין הורדוס…" (בבא בתרא ד, א) over the whole House → "הבית שלם — העבודה מתחילה" (עזרא ג, ד) → Phase B opens on the living Temple (§1c) |

## 1. Stage by stage — כיף · מעניין · תקין (✓ / ½ / ✗), K80, his walk, the evidence

| stage (build) | כיף | מעניין | תקין | K80 · walk | what I did and saw | shots |
|---|---|---|---|---|---|---|
| **שיטוח ההר — the end (peekH 7bfd750, 08:30)** | ½ | ✓ | ✓ | ✓ 96–98 px at the reopen, the paving and the inspection (was 8–18 px) · 9 spots, steps 4–16 | the reopen lands on him among the stoa's columns, slabs stacked by him (N39 ✓); the paving grows unseen (the plaza already paved in frame, N40 ½); the great stone's world is the east wall with the Shushan stairs, no crane or stone in it (N42 ½); the hold button stays over the landed stone (N65) | fin1-02, -05, -11, -12 |
| שיטוח ההר — the end (v20) | ½ | ✓ | ½ | ✗ at the finish (18 px, hidden behind the platform wall) and at every reopen (8–16 px) | the finish "ריצוף הרחבה" framed on a wall close-up, nothing paved in frame (N40); the plumb ✓ ("רב אומן", Josephus); the great stone held and released ✓ but the world above the card is a green blur 2,300 amot away (N42); three cards, then the games' invitation (N43) | w1-01…12, w2-01…10 |
| חומת העזרה (v20) | ✓ courses · ✗ survey/dig/finish | ✓ | ½ | ✓ 81–90 px from the first stone; ✗ 19–20 px at the survey, dig, finish, inspection and reopens · **19–21 spots, steps 3–24 amot** | the courses ARE the owner's game: banker → course, chips fly, a gang of dressers, the dark course grows, 16 stones in 90 s, Josephus after the first stone (N50); "הנדבך הראשון" moment ✓ (N53); survey/dig/finish from 220–250 amot (N49, N52) | s2-07, -12, -18, -21, -22, -24, -25, -31, -32 |
| **חומת העזרה (peekG cb0dea3, 08:00)** | **✓** | **✓** | **✓** | **✓ 84–105 px in 11 of 12 world shots** (v20: 3 of 15) · **22–24 spots, steps 3–27 amot** | the reopen lands on him at his banker (95 px); survey 105 px with the pointer on his head; dig 101 px; the crane game; the courses with **the pointer on his banker**, 16 stones in 90 s; the corner stone "סתת אותה בעצמך" → the dressing game; the reopen at the finish lands on him among the scaffolds (87 px); a cedar beam at his feet; the plumb; "הנדבך הראשון" with no "דלג" left; the stage's own game offered ("נדבך על נדבך"); on to the gates' survey (105 px) | s5-02, -03, -04, -08, -12, -15, -18, -19, -23, -30, -33, -35 |
| שערי העזרה (peekA) | ½ | ✓ | ✗ | ✓ 85 px at the survey; ✗ 4–5 px from the dig on · 8 spots, steps 4–22 | the survey is the best frame of the morning (N44 ✓ part); the dig's pay opens the stage sheet, which flies the camera to ~1,000 amot and leaves it there (N44); the crane game ✓ | s1-03, -04, -06…09, -12 |
| עזרת הנשים (peekA) | ½ | ✓ | ✗ | ✗ 38 px behind the marker's glow; ✗ HIDDEN behind a wall at the dig · 4 spots | a crowd of workers ✓; the dig frame is a wall close-up (N45/N47); a tap there started the Soreg by mistake (N45) | s1-19, -22, -23 |
| הסורג והחיל (peekA) | ½ | ✓ | ½ | ✗ off-frame at the survey (below the dock); ✓ 87–89 px at the dig; ✗ 4 px after the sheet · 8 spots, steps 9–79 | N46; the sheet's camera (N44); the crane game "לא תפר מעל תפר" ✓ | s1-27, -30, -31, -33, -37 |
| שער ניקנור (peekA) | ✗ | ✓ | ✗ | ✗ 16 px at 187 amot; ✗ HIDDEN at the dig · walks of 130+ amot back and forth during the survey | N47; an info card left open over the work (N48) | s1-44, -47, -50 |
| הלשכות (peekE) | ½ | ✓ | ½ | ✗ HIDDEN at the survey (the frame is a wall's face, the arrow on it); ✓ 89–105 px at the dig · 4 spots | the pointer at every stage (a child knows what to tap) ✓; the dig frame is a bare pavement — nothing dug in view | s3-03, -04, -06 |
| יסוד המזבח (peekE) | ½ | ✓ | ½ | ✗ at the survey (cut at the left edge); ✓ 88 px at the dig · 3 spots | his banker stone a whole field stone and a **wooden mallet** ("בלי ברזל" ✓); the dig's sheet keeps the camera on him (N44 ✓); the red "המלאי ריק" line at the dig (N58) | s3-10, -13, -14 |
| הסובב (peekE) | ½ | ✓ | ✗ | ✓ 104 px at the survey and dig; ✗ the first segment framed from behind the yesod (a grey wall + a fact card) · 4 spots | N55; the plan card with the pointer drawn over it (N57) | s3-16, -17, -20 |
| גוף המזבח והכבש (peekE) | ½ | ✓ | ½ | ✓ 104 px at the survey; ✗ behind the altar at the dig · 3 spots | the red cord along the altar ✓; an iron pick in his hand at the altar's survey (N59) | s3-24, -28 |
| הקרנות (peekE) | – | ✓ | ✓ | ✓ 104 px at the survey · 2 spots | only the survey in 72 s: close, clear, the arrow on him | s3-31, -32 |
| הכיור (peekF) | ½ | ✓ | ½ | ✗ at the survey (the frame is the altar's plaster, N55); ✓ 91–104 px at the dig · 3 spots | the plan card: בן קטין's twelve spouts; the dig's sheet keeps the camera on him | s4-03, -04, -07 |
| האולם (peekF) | ½ | ✓ | ½ | ✗ off-frame at the survey — but the frame is **the finished kiyor with its spouts and water** + a cedar-beam fact (a real view); ✓ 89 px at the dig, **standing half inside a rock** (N61) · 5 spots | N48: tapping the pointer on him opens "העזרה"'s card | s4-09, -14 |
| ההיכל (peekF) | ½ | ✓ | ✗ | ✗ off-frame at the survey (26 amot, too close: a stake, a gold block, a worker); ✓ 89 px at the dig · 5 spots | N61; the Mount's coach bubble still on screen (N62) | s4-17, -21 |
| קודש הקדשים — the moment, reopened (peekH) | ✓ moment | ✓ | ✗ | ✗ the reopen at the waiting moment: a grey wall 5 amot from the camera, he behind it, 35 s (N66) | "האומנים בתיבות" played by holds and releases, 4 cycles, "העבודה נעשתה בלי להביט פנימה" + מדות ד, ה ✓; then the House's completion card **covered by a place card** — its gold button unreachable (N67, P1) | fin1-17, -20, -21, -23 |
| קודש הקדשים (peekF) | ✓ moment | ✓ | ½ | ✗ off-frame at the survey (23 amot); ✓ 88 px at the dig · 6 spots | the key moment "האומנים בתיבות": a box hangs from a crane on the roof in the world, the card's hold-and-release teaches patience (N63) ✓; the sheet at the moment (יומא ה, ב; כלים א, ט) ✓ | s4-23, -27, -29, -30, -31 |

(more stages as the runs come in)

## 1c. The finale (חנוכת הבית) and a look at Phase B
**✓ by my touch on peekJ (run s7, 09:07–09:10):** "האומנים בתיבות" (holds and releases; "העבודה נעשתה בלי להביט פנימה", מדות ד, ה)
→ the Kodesh's completion card, free (N67 ✓) → "פרק ד׳ הושלם!" → **"חנוכת הבית · מִי שֶׁלֹּא רָאָה בִּנְיַן הוֹרְדוֹס, לֹא רָאָה בִּנְיָן
נָאֶה (בבלי בבא בתרא ד, א)"** over the whole finished House and the city → "הבית שלם — העבודה מתחילה · עזרא ג, ד · מעכשיו המקדש עובד
לפי השעון האמיתי של ירושלים" → "לעבודה בבית" → **Phase B**: the Temple from above with the altar's smoke and the crowd in the courts,
the live strip "חי: קרבנות העולים לרגל · עד 14:58 · הצטרף", and its first card "כהן צעיר מגיע למקדש · איך קוראים לך? · לאיזה משמר
אתה שייך?" with the 24 mishmarot (דברי הימים א כד), "בחר בשבילי". Fun ✓ · interesting ✓ · working ✓ · 0 console errors.
Evidence: s7-05-mo-האומנים_בתיבות-done.png, s7-08-card.png, s7-09-card.png, s7-10-card.png, s7-11-end-kodesh.png.
Not done: playing Phase B itself (my harness stops when the Phase A game object goes; a Phase B pass is wave 12's). N69 (P2): Phase
B asks the name again, and its button says "יאללה לעבודה".

## 2. What the owner will feel, in one paragraph
Where the camera is at working distance, the game is what he asked for this morning: the wall's courses (N50) — the kohen at his
banker, chips flying, a gang dressing along the course, the course growing in frame, a stone every three taps, a true line from
Josephus, and he walks from point to point (19–21 spots, steps of 3–24 amot). The key moments are small good games (the great
stone's hold, the wall's joints) with a true source at the end. What breaks it is always the same thing: **the frame**. At the
survey, the dig, the finish, the inspection and every reopen the camera stood 200–1,200 amot away (v20 and the first merges), or
behind a wall at the court's stages; the stage sheet threw the camera to an overview and left it there (N44). The owners answered
every one of these within the hour, and my re-runs on the later merges show them holding: on peekG/peekJ the wall is ✓ from its
start to the next stage, and the surveys of Ezrat Nashim, the Heichal and the gates are 105 px with the gold pointer on him. What is
still open is the frame at a few of the altar's and the chambers' moments (N55, not re-played since the fixes). The finale, blocked by
a stray place card on peekH (N67), plays through on peekJ into Phase B (§1c).

## 3. The notes N39–N63 and where they stand
Owners answered every note on the bus (bus/PRODUCER11.md, the ↳ lines). "✓ seen" = re-verified by my own touch run on a later merge.

| note | owner · sev | what | answer | my touch |
|---|---|---|---|---|
| N39 | FLOW11 · P1 | a reopen at the Mount's finish / moment lands on nothing (8–16 px) | dc5ef76, cc7484c (every phase is his work) | ✓ at the wall's start and finish (s5-02, s5-19: 87–95 px); the Mount's finish: FIN |
| N40 | SITE11 + FLOW11 · P1 | the Mount's paving not framed, he is behind the wall | 2350bb9 (a paving patch that grows 2 strips a stroke) | FIN |
| N41 | — | the see-through moment card | withdrawn (my shot caught the fade) | — |
| N42 | SITE11 + FLOW11 · P1 | the great stone's world a green blur 2,300 amot away; "דלג" on "המשך" | 8550c98 (the east wall at 110 amot); cc7484c (skip hidden) | "דלג" ✓ (s5-30); the frame: FIN |
| N43 | FUN11 · P2 | three cards, the invitation names no game; the top row cut | d407fb5 (the stage's own game); 64fe479 (the row fits) | ✓ "נדבך על נדבך · בנית נדבכים…" (s5-33) |
| N44 | FLOW11 + SITE11 · P1 | the stage sheet throws the camera to ~1,000 amot and leaves it there | f145780, cc4e21f; de9ddab (working frames) | ✓ at the wall (s5-05…08) and the altar (s3-14) |
| N45 | FLOW11 + SITE11 · P1 | Ezrat Nashim: behind the marker's glow, a wall; a tap started the Soreg | f145780 (a toast, not a start); 78a12a3 (no glow) | ✓ survey 105 px, no glow over him (s6-03) |
| N46 | FLOW11 · P1 | the Soreg's survey: he is below the dock | f145780 (the fit pans him into the safe frame) | S7 |
| N47 | SITE11 + FLOW11 · P1 | the dig framed from behind a court wall; 130-amot walks in the survey | 2663a87 (clear frames); ac025a4 (short walks) | ✓ at Ezrat Nashim: dig 87–105 px, 4 spots, steps 4–33 (s6-04); Nikanor: not re-played |
| N48 | FLOW11 · P1 | a tap on the pointer opens a place card over the work | ac025a4, cc1e6eb (a work tap is always the game's) | S7 |
| N49 | SITE11 + FLOW11 · P1 | the wall's survey/dig from 222–246 amot (v20) | de9ddab → 2663a87; cc4e21f | ✓ 101–105 px (s5-03, s5-04) |
| N50 | — | ✓ the wall's courses are the owner's game | keep | ✓ again on peekG (s5-12, s5-15) |
| N51 | FLOW11 · P2 | the course label over the pill | cc4e21f | ✓ "9/32 אבן" below the pill (s5-15) |
| N52 | FLOW11 + SITE11 · P1 | the wall's finish/inspection from 221 amot | cc4e21f; 190906f, 0bc6614 (the finish's items at his spot) | ✓ 87 px, a cedar beam at his feet (s5-19, s5-23) |
| N53 | FLOW11 · P2 | "דלג" on "המשך" at the wall's moment | cc7484c | ✓ (s5-30) |
| N54 | FUN11 · P1 | "איפה זה?" card cut on the left | dd90bcc | MID |
| N55 | SITE11 · P1 | the frame through the site's own built parts (the lishka's wall, the yesod, the altar) | FLOW11 992e25c (asks the world's clear ray); SITE11: — | S7 |
| N56 | FLOW11 · P1 | the yesod's survey: he is cut at the edge | 992e25c | S7 |
| N57 | FLOW11 · P2 | the pointer drawn over a card | 992e25c | S7 |
| N58 | FLOW11 · P2 | "המלאי ריק" at the dig's sheet | 992e25c | S7 |
| N59 | SITE11 · P2 | an iron pick in his hand at the altar's survey | — | S7 |
| N60 | — | ✓ the Ulam's survey across the finished kiyor | keep | — |
| N61 | FLOW11 (+ SITE11) · P1 | the Heichal/Kodesh survey: he is not in the frame; the Ulam's dig inside a rock | 0d89e1d (placed at the new site at once); the rock: SITE11 | ✓ the Heichal's survey 105 px (s6-11); the Ulam's rock: not re-played |
| N62 | FLOW11 · P2 | the Mount's first coach line at the Heichal | 0d89e1d (staleCoach) | S7 |
| N63 | — | ✓ "האומנים בתיבות" | keep | ✓ again on peekH and peekJ (fin1-21, s6-17) |
| N64 | SITE11 + FLOW11 · P2 | the Mount's corner stone: no frame with the stone on the hook or landing | 852f2da (camHold on the delivery), 04d989e (a closer lift frame) | — |
| N65 | FLOW11 · P2 | "החזק להורדה" stays over the landed great stone | fc88274 (hold buttons hidden at done) | FIN |
| N66 | FLOW11 + SITE11 · P1 | a reopen at the Kodesh's waiting moment: a grey wall 5 amot away | fc88274 (the moment spot + a clear bearing) | FIN |
| N67 | FLOW11 · P1 | the House's completion card covered by a place card (a ghost tap) | fc88274 (a tap under/after a card is the game's; a card closes a place card) | ✓ the card whole and free, "המשך" reachable (s6-19) |
| N68 | FLOW11 · P2 | he is see-through at Ezrat Nashim's survey (peekJ) | — (posted 09:02) | — |
| N69 | Phase B's owner · P2 | Phase B asks the name again; "יאללה לעבודה" | — (posted 09:10) | — |

## 3b. Wave 10's features on the phone
- **The Middot place links (N24–N30):** seen in FUN11's real-build touch shots, not in a run of my own (my book run queued behind
  the others): "הר הבית" flies to the Mount **as it stands** ("כאן אתה בונה עכשיו", N29 ✓), one gold "חזרה לספר" (N28 ✓), the chip
  whole (N27 ✓); FUN11's new "איפה זה?" (a place shown, three names, מדות ה, ד) whole inside the phone after dd90bcc (N54 ✓);
  the daily question now inside the learning points (wave 10's ⚑ default ✓). Evidence: wt/fun11/test/out/middot-d1-place-quiz.png,
  middot-e1-har-as-it-stands.png, middot-c1-daily-right.png.
- **The in-between games:** after the wall the invitation names the stage's own game with its reason ("נדבך על נדבך · בנית
  נדבכים — עכשיו נדבך על נדבך…", s5-33 by my touch ✓); the table under a red-and-cream awning by the quarry with a sign "משחקים"
  (FUN11's games/door-sign.png ✓). Not by my touch: the table's tap (FUN11 fixed a ghost click there, a1b7bf5).
- **N31 "כהנים יחד":** FUN11 236e96f holds the camera nets on the flight to the other kohen (≈ 130 px by their measure); its re-run
  was queued to ~09:1x — not seen by me. Stays ½ until two real phones.

## 4. Top 10 for wave 12 (most important first)
1. **A clear line to him at every frame of every stage** — the world's own built parts (the altar's yesod and plaster, the
   chambers' walls, the court walls) were between the camera and him in 9 of my shots at 7 stages (N45, N47, N55). The game now
   asks the world's clear ray (FLOW11 992e25c); the world's side (SITE11) is the test "no built mesh between the camera and his
   chest", run at every shot. Make produce-play's K80 (it logs HIDDEN with the mesh's name) part of the gate.
2. **The owner's play as the gate before publish** — `produce-play --stages=<all 15>` (≈ 60 s a stage) + the wall in full, on the
   candidate build; K80 ✗ at a work frame or a P1 open blocks the publish. This morning it found 26 notes in 2½ hours.
3. **The whole wall by touch, not 16 stones** — the course check every two courses, the events (the rope stuck, course 4; the
   cracked block, course 7), the corner stones at each course, a crew-only stretch: 8 courses is the owner's next hour of play.
4. **Each stage's first minute shows what is special about it** — today every stage opens with the same survey → dig → "הביאו 8
   אבנים"; the gates' lintel, the altar's whole stones ("בחר אבן שלמה"), the kiyor's casting and the Heichal's gold wait behind
   many stones. A stage's own key stone or a short scene in its first minute is the fun the owner asked for.
5. **The corner stone seen on the hook and landing** (N64; top-10 #4 of wave 10, still half).
6. **No iron at the altar** (N59) — the tool in his hand at yesod/sovev/guf/karnot, and the dig's picks away from the stones.
7. **The queue** — 20+ tickets most of the morning, one run every ~25 min for me; the producer needs a lane (a second machine, or
   a slot every 20 min) to re-play fixes the same hour.
8. **"כהנים יחד" on two real phones** of the owner's account (N31's close landing is fixed in the mock, FUN11 236e96f).
9. **The games' table in the world found by a child** — it exists by the quarry (FUN11's door-sign); a frame that shows it on the
   way (the quarry's board ends near it) and its chip after the board.
10. **Polish:** the Mount's first coach line at later stages (N62 ✓ answered), the stage sheet's red line (N58 ✓ answered), the
    course label (N51 ✓), the pointer over cards (N57 ✓ answered) — keep them in the gate so they do not return.

## 5. ⚑ לבעלים (טיוטה; ברירת המחדל בסוגריים)
- ⚑ **החומה מוכנה לך** — בגרסה המשולבת של הבוקר החומה עובדת מהתחלה ועד הסוף: הכהן גדול (84–105 פיקסלים) בכל שלב, הוא הולך מהספסל
  לנדבך ובחזרה, והחץ הזהוב מראה איפה להקיש. (לפרסם את המיזוג של גל 11 כגרסה 21 אחרי המבחן שלי על כל השלבים.)
- ⚑ **המזבח והבית** — בשלבים של המזבח ושל ההיכל המצלמה עוד נתקעת לפעמים מאחורי קיר או מאחורי המזבח עצמו. (לפרסם בכל זאת; זה ראשון
  בגל הבא.)
- ⚑ **ברזל ליד המזבח** — בזמן המדידה במזבח הכהן מחזיק מכוש ברזל. (להחליף לחוט המדידה או לפטיש עץ לפני שמראים לילדים.)
- ⚑ **השער למשחקי הביניים** — שולחן משחקים עם סוכך ליד המחצבה, והזמנה אחרי שלב שמציעה משחק אחד שקשור למה שבנית. (להשאיר.)
- ⚑ **חנוכת הבית ומעבר לעבודה** — הסיום עובד: "מי שלא ראה בנין הורדוס", "הבית שלם — העבודה מתחילה", ומשם נפתח שלב ב׳ (העבודה) עם
  בחירת משמר. שם הכפתור שם הוא "יאללה לעבודה", ושלב ב׳ שואל שוב את שם הכהן. (להשאיר את הנוסח עד שתחליט; בגל הבא לברך אותו בשם
  שבחר בשלב א׳.)
- ⚑ **מבחן הבעלים לפני כל פרסום** — הסוכן המפיק משחק כל שלב במגע, ובעיה שלא נפתרה (P1) עוצרת את הפרסום. (כן.)
