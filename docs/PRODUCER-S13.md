# PRODUCER-S13 — the owner's eyes on wave 13, in the demo (טיוטה, 30.9 night)

The owner, 30.9: the pens and stables around the House (07:32 #1); פיטום הקטורת "עדיין לא נכנס למשחק" (#2); games boys played in that
period (#3); 11:12: "only the quarry", the level with the needle in the leveling stages, the director's camera angles, "עמד וזז מצד
לצד", the progress seen at every stage (Ezrat Nashim and the lepers' chamber), "רק גלגלית אחת ישנה והיא שלי".
The compass: **"זה הכי חשוב שיהיה כיף ומעניין ותקין"**, and the kohen walking from point to point at his work.

**Headline.** Wave 13 answers the owner's 11:12 notes in the demo he tests with: the level with the needle comes at the Mount's course end,
every course end has its moment whoever set the last stone, he rests at his work while the crews build (no more chasing the slot), the pick
lands on him, the courts are full of machines and people from ×3, the altar gets its cart train of whole stones, and a boy's three games of
the period and פיטום הקטורת are in. **Still open for the owner's eye:** two long walks through the Azara's hub (the Ulam, the laver: 33 amot
walked as 230), frames that lose him at a few moments, the working frame (×1) that shows none of the crews' machines or carts, and the pace:
the first course end comes 3.5–4.5 minutes after a pick, so the progress, the beats and the finishes (the Ezrat Nashim's chambers, the House's
gold) are seen only by a player who stays with a stage.

## 0. How I played
- **Builds.** v25 baseline = master d229006 (runs b1, b2). Throwaway merges in wt/peek13 of s13-site, s13-director, s13-games, s13-service
  on master, rebuilt through the night and pinned per run (`test/out/produce/builds/<peek>.html`; bundle = dist/temple3d.html):

  | merge | time | heads (site · director · games · service) | runs | bundle (Δ v25) |
  |---|---|---|---|---|
  | peekA2 | 19:26 | — · 99a4761 · 2480f24 · — | m1 | 2,987,782 (+6,820) |
  | peekB | 19:39 | e7b12ed · bf8610d · b89c2df · 7120989 | m2, m3 | 3,067,218 (+86,256) |
  | peekE | 20:24 | 09f5aab · d59b8c2 · 5486e51 · 5f0e179 | m4 | 3,081,423 |
  | peekF | 20:47 | 81228e2 · 57ede89 · 403c767 · 43c4f18 | m5 | 3,082,501 (+101,539) |
  | peekG | 21:10 | 592d998 · 884ce99 · 5b1ba0b · 499dc91 | k80 (the gate) | 3,084,510 (+103,548) |
- **The owner's path, by real touch** at 390×844 (touch, he-IL): the menu (☰) → "מצב הדגמה" → the strip's "שלבים ▾" → the stage's row (a finger
  swipe for a row below the fold) → then only touch: the pointer, the coach's hand, the ring, the pill, a sheet's big button, a card's gold button,
  the precision games by their own cue. No autoplay flag. I looked at every shot I cite (`wt/producer13/test/out/produce/<run>-NN-<step>.png`).
- **Declared hooks:** the renderer's (`__START_PAUSED` + `__T.simulate`, a render before each shot); `__NO_OPENING` on the new-game and Phase B
  harnesses; `__T.look` for the ×3 census frame (put back after). I did not use `switchMode`, `jumpTo` or `pickStage` — the menu and the picker
  were tapped. The gate (`--stages`) writes the save once per stage (the seed's jump, logged), as the gate always did.
- **Tools (test/, mine):** produce-play (the demo pick with a finger swipe for rows below the fold; the course-end watcher — who set the last stone,
  the toast, a shot of the beat 1.8 s in; the census with SITE13's `stages.machines()` and the carts projected on screen; GAMES13's chip; the 4 Hz
  track); produce-games13 (the three new games and the quarry's cycle by touch); produce-phaseb13 (Phase B's home, the ketoret, the lambs);
  produce-multi13 (two harnesses in one ticket); produce-summary13 (one row per stage from the logs); produce-progress13's beat camera is
  DIRECTOR13's `courseView`.
- **The machine.** 2 cores, a queue 14–20 deep all night; the producer lane gives one run per ~22 min and starts it beside the running one, so my
  shots took 15–30 s each (a stage's first course end, ~3.5 min of real play, took my harness 5+ min). m4's first try died in my harness (it read
  the game state during the demo's switch; fixed). 0 page errors in every run.

## 1. Per stage — the demo, by touch, on the merges (✓ / ½ / ✗)
Games = what opened while I played the stage from its pick (every one played by touch). Course ends = who set the last stone · the toast · the
beat. K80 = world shots of the stage (the kohen on screen, not hidden, ≥ 80 px). Machines = the census at the stage's end: working frame (×1) ·
×3 frame — lifting machines on screen (his crane + the crews' crane / shear-legs / sledge) · carts on screen · people on screen. Walks = the
worst walked-to-straight ratio of one walk. Idle = a no-touch window after a game (heroReturn count). Progress = course sheets from fixed
cameras (SITE13's `site_courses` where it ran; PRODUCER-S13a's pg1–pg4 on v24 otherwise).

| stage | run · merge | games (by touch) | level / check | course ends | K80 | machines ×1 · ×3 | walks · idle | progress | verdict |
|---|---|---|---|---|---|---|---|---|---|
| שיטוח ההר | m1 · A2 | the great stone (crane) · the corner stone's quarry · the check · the corner stone's dress | **✓ the level**: "פילוס הנדבך · הר הבית", 2 level rounds then the plumb (m1-33) | 1/6 by a crew at 267 s: `course` ✓ beat ✓; toast not read (ad9aed7 since) | ✓3 ✗12: the rocks OFF ×3 (C2, fixed since in e38552f/d59b8c2), the steep survey/dig 47–54 px (readable), the corner stone's cart 57–72 px (m1-24) | his crane · his crane; 0 carts; the key stone's ox cart + 6 carriers (m1-24) | ratio 3.4 once · — | v24 ✓ (Δ 14/37/42 %) | **½** — 4 games and the level ✓; the first level 4.5 min in; the rocks' frame to re-play |
| חומת העזרה | m1 · A2 | the crane's first stone | — (course 2) | none in 130 s (16/32) | ✓1 ✗3 (N83's walk out of frame; fixed 02091da) | his crane · crane; 0 carts | ratio 1.4 · **1 walk of 62 amot, him OFF (m1-43)** → fixed since | v24 ✓ | **½** — N83 fixed after my play; the gate re-checks the frame |
| שערי העזרה | m2 · B | crane · the corner stone's dress | — | none in 150 s (18/24) | ✓5 ✗1 (N85: the corner stone waits, him OFF, m2-14; fixed ea297d2) | 1 · **3** (his crane, the crews' crane with a stone on its hook, the sledge — m2-18); 0 carts | 1.7 · 0 walks in 25 s ✓ | v24 ½ | **½** |
| עזרת הנשים | m2 · B | crane · dress | — | none in 150 s (18/24) | ✓4 ✗2 (N74: the dig HIDDEN behind the court wall, m2-24/25; fixed 5df8561) | 0 · 2 (crane + shear-legs); 0 carts | 1.0 · 0 walks in 26 s ✓ | SITE13 r1: courses ✓ (work Δ 24→8.7 %), **the chambers named as they rise** (f2 "לשכת הנזירים", top Δ 11.9 %), the gallery 0.5–2.4 % ✗ | **½** — the chambers are there; the owner meets them only at the finish |
| הסורג והחיל | m2 · B | crane · dress | — | none in 130 s (24/32) | ✓3 ✗0 | 1 · 2; 0 carts | 1.8 · 0 walks in 30 s ✓ | v24 ½ (a low strip) | **✓** |
| שער ניקנור | m3 · B | crane | — | none | ✓2 ✗0 | 1 · **3** (two cranes + shear-legs, 22 people — m3-15) | **3.6** (77 for 21 at the corner stone; 44c06a8 since) | v24 ? | **½** |
| הלשכות | m3 · B | crane | — | none | ✓5 ✗1 (N86: the courses' first frame is empty paving, m3-22) | 1 · 2, 21 people; 0 carts | **3.2** (63 amot walked as 200, as on v25) | — | **½** |
| יסוד המזבח | k80 · G (gate only) | — | — | — | gate ✓ 97 px after the touches (the jump shot OFF: the jump's artifact) | — | — | v24 ½ (one amah) | **½** — not played in the demo tonight |
| הסובב | k80 · G (gate only) | — | — | — | gate ✓ 89 · 92 px | — | — | — | **½** — not played in the demo tonight |
| גוף המזבח | m4 · E | the whole stones (100 %, 23 s) | — | none in 140 s (23/32) | ✓3 ✗0 — **C8 fixed** (on the sovev by the red line, m4-03) | 1 · 1; 3 carts exist, 0 on screen | 1.0 | v24 ½ | **✓** |
| הקרנות | m4 · E | the whole stones | — | 1/1 by a crew → its finish ("כל הנדבכים עומדים") | ✓3 ✗1 (N88: down the kevesh, OFF, m4-12) | 0 · 0; **3 of 3 ox carts on screen ×3** (m4-18) | **21** (147 amot for 7: down the kevesh and round — the true way down, but a sprint out of frame) | — | **½** |
| הכיור | m4 · E | — (reached late) | — | — | ✓2 ✗1 (N89: him below the frame at the first casting, m4-23; fixed 530d7ed) | 1 · 1 | **5.1** (N87: 44 amot walked as 223 through the Azara's hub) | v24 ✓ close | **½** — the words ✓ "הביאו 12 יציקות נחושת" |
| האולם | m5 · F | the crane's first stone | — | none in 160 s | ✓3 ✗0 (the pick 95 px, dig 116, courses 94 — m5-05) | 1 · 2 (crane + shear-legs), 18 people; 3 carts off screen | **6.9** (N90: 33 amot walked as 230 through the Azara's hub, off screen) | SITE13 r3 pending | **½** |
| ההיכל | m5 · F + k80 · G | the crane's first stone (m5) | — | — | **gate ✗ HIDDEN ×2** (N91: the Ulam's marble in front, k80-12) | — | — | SITE13 r2: courses 1–5 Δ 10 / 8.1 / 11.6 / 14.2 / 15.3 %, two treadwheels on the rising walls ✓ | **✗** — the frame at its courses |
| קודש הקדשים | k80 · G (gate only) | — | — | — | **gate ✗ HIDDEN ×2** (N91: the Heichal's marble, k80-14) | — | — | — | **✗** — the frame at its courses; not played in the demo tonight |

## 2. The gate — `produce-play --stages` on the latest merge (k80, peekG 21:10)
The save written once per stage at 85 % of its first course (the seed's jump, logged), no reload, 8 s of touch, a shot 2.5 s after the jump and one
after the touches (`test/out/produce/k80-*.png`, looked at). 13 of 15 stages in the 10-minute cut (karnot, ulam: out of time; both by touch in m4/m5).
- **K80 ✓ 18 · ✗ 9.** After the touches ✓ at **har 89 · gates 91 · nashim 90 · lishka 94 · kiyor 96 · wall 87 · yesod 97 · sovev 92 · sorag 97 · nikanor
  97 · guf 93 px** (k80-02 the Mount: him striking, the treadwheel behind, an ox cart with its stone in front; k80-16 the wall: the crane at the edge,
  not in front).
- **✗ ההיכל and קודש הקדשים, both shots (N91):** the frame is a close-up of the finished Ulam's marble (the Heichal, k80-12) and of the Heichal's
  (the Kodesh, k80-14); him HIDDEN behind it at 86–97 px.
- The other 5 ✗ are the shot 2.5 s after a state write (the camera still where the last stage left it) — the jump's own artifact; each stage is ✓
  after the touches, and in the demo the pick lands on him (m2-21, m3-04, m4-01, m5-01: 95 px).
- **Verdict: 11 of 13 ✓ · the House's two inner stages ✗.**
