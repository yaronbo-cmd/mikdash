# PLAYTEST-S6 — the final teen playtest of wave 6 (Phase A, the daughter's loop)

**Who plays.** נועם (16): Brawl Stars, Clash, Roblox tycoons; fast, skilled, impatient; 5–15-minute sessions on the bus.
מאיה (15): Hay Day, Township; slower hand, reads, collects, claims every order, visits the kings. (Personas: docs/FUN.md §1.)

**What they played.** A throwaway merge of all nine wave-6 branches (FUN, BUILD, MATCH3, KINGS, SITE, PEOPLE, WATER, WORLD,
CONTENT; heads below), built to one page. Three instruments, all in `test/playtest/`:
- `v6-bots.cjs` — Noam and Maya on the **real v6 HUD** (BUILD's game over its fake 3D world), with the real MATCH3 board played
  move by move by its own bot at the persona's hand (0.65 / 0.55) and pace (4 s / 6.5 s a move), FUN's precision games and
  KINGS' court, on a virtual clock (8 minutes each). HUD shots `test/out/playtest/v6-<persona>-*.png`.
- `loop-sim.mjs` — the same two on the **real rules** (BUILD's state v6, MATCH3's engine and levels, FUN's games on human timing,
  FUN's hooks, KINGS' trade logic) for the first session, day 1, a return visit 20 h later and week 1.
- `teen-shots.cjs --v6` — three **real-3D phone frames** (390×844, dpr 1): the first seconds, the first key stone on the plaza,
  the wall mid-build. `test/out/playtest/teen-<label>-*.png`.
I looked at every frame.

**Heads.** See §7 (the final run) — this document was drafted on a 21:15 merge and re-measured at 22:30.

---

## 1. The scorecard (the final run, 22:00 heads; HUD = v6-bots, rules = loop-sim)

| | v14 (08:25) | wave 6 — נועם | wave 6 — מאיה | target |
|---|---|---|---|---|
| first precision game (the great stone by the crane) | — | 0:28 | 0:31 | — |
| first stone set by the player's own hands | never (a wall by taps) | **0:35–0:36** | **0:38–0:43** | ≤ 1:00 ✓ |
| first board (the match-3) | — | 1:29 (HUD) · 1:50 (rules) | 1:41 · 2:04 | ≈ 1:00–2:00 ✓ |
| first course | — | **3:26 · 3:27** | **4:19 · 5:22** | ≤ 6:00 ✓ |
| boards' share of the first session | — | 38% · 35% | **55% · 56%** | ≤ 55% ✓ (at the edge) |
| distinct novelties by minute 10 (rules) | 3 | 14 | 11 | ≥ 6 ✓ |
| cards in the first 60 s | 4 in 7 s | 2 | 2 | ≤ 2 ✓ |
| blocked, nothing to do | 84–92% | 0% | 0% | < 5% ✓ |
| taps that did nothing | 782 of 1,559 | 0 of 450 | 0 of 202 | 0 ✓ |
| console errors on the real HUD | — | 0 | 0 | 0 ✓ |
| return visit (20 h): first meaningful action | 6–8 s, blocked at 1:00 | 0 s | 0 s (a quarry game) | ≤ 5 s ✓ |
| day 1 | the Mount + a blocked wall | the Mount finished (its moment) | the Mount finished | a stage on day 1 ✓ |
| week 1 (24 / 40 min a day, Shabbat off) | 14 of 15 stages | 5 of 15 (2.9 h) | 5 of 15 (4.7 h) | the Temple in weeks ✓ |
| boards' share over the week | — | 57% (building 20%, key stones 17%) | **70%** (14%, 12%) | building + keys ≥ 30%: 37% ✓ / 26% ✗ |
| silver held at the end of week 1 | — | ≈ 1,130 (was 1,480 before de95aa5) | ≈ 1,150 (was 1,500) | a sink for every resource ✗ |

## 2. נועם, 16 — the first ten minutes

- **0:00–0:30.** "כאן ייבנה הבית", a ring, "עוד 11 סלעים", the mentor: "הקש כשהטבעת נסגרת". Two cards in the first minute, not
  four. *"סוף סוף לא קיר של טקסט."* The real 3D first frame is still a top-down hill at dusk: nothing says Jerusalem yet.
- **0:28–0:36 · the great stone by his own hands** (the crane: a heavy, windy stone over the real joints). *"רגע, אני זה שמניח?
  סבבה."* The first skill check lands before the first minute.
- **1:32 · the quarry** at the Mount's far corner (channels, then wedges): a second kind of precision game inside two minutes.
- **1:29–1:50 · the first board** (המחצבה, level 1): 30 moves, a tool (מקבת) within seconds, the stones rise into the meter; at
  the goal "הבונים מברכים!" turns the moves left into material. *"זה כמו קנדי קראש, אבל האבנים הן באמת האבנים של הקיר."* The pill
  that opened it said "עוד 8 אבן למקטע הבא" — *"שלוש דקות בשביל 8?"* — until the board paid 40–57 (fix 3).
- **3:26 · the first course**, the dressing game, a crew level-up, an order claimed (5:08), **7:24 the engineer's course check**
  (the plumb, three rounds, no card), a personal best (7:41). 14 novelties by minute 10; he never waits; none of 450 taps is lost.
- The pill reads **"נדבך 6/1 · אבן 32/3"**: *"נדבך שש מתוך אחת?"* (fix 1).

## 3. מאיה, 15 — the first ten minutes

- The same opening; she reads both cards and names her kohen. The crane at 0:38–0:43 (*"אני בוחרת מתי לשחרר — זה פאזל"*).
- **1:41–2:04 · the first board** takes her about three minutes at her pace; she wins with one or two stars. The course closes at
  4:19–5:22, and she opens "היום": three orders (now paying cedar), the daily, the album with its first two finds.
  *"יש לוח משימות ואלבום — עכשיו יש לי מה לאסוף."* The daily offered her the altar's whole stones on the Mount — a game she
  had never met (fixed on s6-fun 308c712: the day's game is one she has played).
- **Her first session is 55–56% boards** — the owner's ≥ 3-minute board at her 6.5-s move; over the week 70%: *"אני אוהבת את
  הלוח, אבל אני רוצה יותר לבנות."* (⚑ 1).
- By the week's end she holds ≈ 1,150 silver: *"מה עושים עם כל הכסף הזה?"* (fix 2).

## 4. Day 1, the return visit, week 1

- **Day 1** (three short sessions): both finish the Mount and see its moment on the first day; 6–8 boards, 15–16 key stones,
  5–6 finds. The day ends on a new stage, not on a wall.
- **The return (20 h later)**: the first action in 0 s (a stroke on the wall, or a quarry game); nothing is blocked; crews set
  stones while they were away.
- **Week 1**: 5 of 15 stages (2.9 h / 4.7 h of play), a board ≈ 2.2 segments, stock ≤ ×4 the next need after the Mount (the
  Mount alone reaches ×7–10 of its cheap 12-stone segment), 22–25 orders claimed, 8 finds. **Silver still piles up (≈ 1,150)**
  while bronze stays at zero — the one hollow stock left (it was ≈ 1,500 before the orders moved to cedar and gold).

## 5. The top ten fixes, ranked by their impact on retention

| # | fix | owner · where | P | why it matters to them |
|---|---|---|---|---|
| 1 | The pill's progress reads backwards: "נדבך 6/1 · אבן 32/3". Write "נדבך 1 מתוך 6 · אבן 3 מתוך 32" (as the stage sheet does), or isolate the whole fraction. **Landed by BUILD before the freeze (`isoFrac`, s6-build).** | BUILD · src/game/ui.js:241 | **P1 ✓** | the core feedback line of Phase A; Noam reads his progress as nonsense in the first minute |
| 2 | Silver has no sink (≈ 1,150 idle after week 1). KINGS' `bestFor` (21:36) is ready: when a cedar / gold / bronze step is short and silver covers an offer, show the king's chip next to the board ("⚓ צור: 120 ארז ב־60 כסף"). FUN's orders already moved to cedar and gold (de95aa5). | BUILD · index.js `playFor` + the meter chip × KINGS — **the chip landed (s6-build 70cba57); re-measure on real play** | **P1 ✓** | a pile that buys nothing is v14's hollow stock again; the kings are the week's real decision |
| 3 | Frame the board by what it pays, not by the shortfall: "▶ המחצבה · עוד 8 אבן" reads as three minutes for eight stones. Show the level's goal ("▶ המחצבה · כ־40 אבן"). | BUILD · the pill for `play` (ui.js:241 family) | P2 | "a toll" (Noam) vs. "a chunk of wall" — the same board |
| 4 | Maya's week is 70% boards (Noam 57%): let a 3★ board pay a third segment, and let the crews set stones while a board is open ("בזמן שחצבת: הצוותים הניחו N אבנים", shown on close). | BUILD × MATCH3 (⚑ 1) | P2 | the owner asked for a deep construction game; Maya wants to build more than to match |
| 5 | The first real-3D frame is a top-down hill at dusk: open on the vision of the finished House over the Old City and fly down to the Mount. | BUILD (the FTUE camera) × WORLD | P2 | "איפה אני?" — the first five seconds decide the install |
| 6 | "עוד 8 אבן" → "עוד 8 אבנים" wherever a count of stones is a sentence (the pill, the toasts). | BUILD · ui.js pill texts | P2 | teens notice their own language |
| 7 | Two toasts stack at the first stone ("אבן גדולה: במקומה" over "צוות בנאים הגיע"): one at a time, 1.5 s apart. | BUILD · the toast queue | P2 | the first reward should land alone |
| 8 | The crew chip under the pill ("ההר 3:03") has no words: "הצוות מניח אבן בעוד 3:03". | BUILD · ui.js (the crew chip) | P3 | a number without a noun is noise |
| 9 | The Mount's cheap segments (12) let the stock reach ×7–10 its need there; show it as "מלאי לחומה" so it reads as a plan. | BUILD · the meter chip | P3 | clarity |
| 10 | Keep the precision games' level adaptive (mgLevel) and watch the top levels on real phones: the autopilot is perfect, humans are not. | FUN · src/game/minigames/* | P3 | mastery without a wall |

**Fixed during the playtest:** MATCH3 fa49e4a — the board's goal is labelled "מטרת השלב" and the foot says when the next step
is covered; FUN de95aa5 — orders pay cedar and gold; FUN 308c712 — the daily offers a game the player has met; FUN e6003ee — the
kiyor has its own highlight in #demo; FUN 9e29d6d — BUILD passes its Hebrew key-stone label ('אבן גדולה') as `what`, so the
Mount's great stone, the lintel and the stone counts never reached the crane (the real-3D frame showed "אבן 1 מתוך 4" for a first
stone): runMinigame maps the labels; FUN 13bca4c — the orders' stars pay cedar and a king's deal bronze, so gold does not pile up
in their place (Maya's week-end gold 330 → 155).

**P0s to owners that block the ship, not the fun** (posted on the bus): SITE × PEOPLE — `swingAt` declared twice in src/stages.js
(the nine-branch merge does not build; BUILD 21:55; I renamed SITE's to `loadSwing` in my throwaway to play); BUILD —
test/game-harness.cjs:100–101 goes red on any merge with s6-fun (patch `bus/FUN-harness-fix-for-BUILD.patch`, 76/76) — **applied
by BUILD before the freeze.** Also landed by BUILD after the playtest: at the Mount's first stone only the pill and the pointing
hand speak; a board declined at its start card is `m3Declined`, never a loss.

## 6. ⚑ For the owner (one line each, with a default)
1. ⚑ **לוח של 3 דקות גם לשחקנית איטית?** אצל מאיה הלוחות הם כ־55% מהמפגש הראשון וכ־70% מהשבוע. ברירת מחדל: להשאיר 3 דקות, ולתת ללוח של 3 כוכבים לשלם מקטע שלישי.
2. ⚑ **מה עושים בכסף?** ברירת מחדל: הכסף קונה עסקאות עם המלכים, והכפתור מציע מלך כשחסר ארז, זהב או נחושת.
3. ⚑ **הפריים הראשון:** ברירת מחדל: חזון הבית השלם מעל העיר העתיקה, ואז ירידה אל ההר.

## 7. The final run
- **Heads (22:00 UTC):** fun 35cd917 · build 69ee870 · match3 fa49e4a · kings ac564f1 · world 59795b2 · people f0b2283 · water
  3707d3e · site 8eea85f · content 7c9c7db; merged in that order, textually clean; one throwaway fix (SITE's `swingAt` →
  `loadSwing`) so that it builds: **2,398,895 B** (≤ 3 MB).
- **Suites on the merge:** `node --test test/*.test.mjs` 169 pass, 0 fail, 9 skipped (FUN's retired v5 caravan cases);
  qa-content-scan 12/12; BUILD's game-harness 76/76 with the patch above (build+fun+match3+kings, 21:45); moments --harness 94/94.
- **Data:** test/out/playtest/v6-bots.json, loop-sim.json (on the merge). **HUD frames (looked at):** v6-noam-{0_05, 0_40,
  board, 3_00, 6_00}.png, v6-maya-{0_05, 0_40, board, 3_00, 6_00, today}.png. **Real-3D frames (looked at):**
  teen-s6-{first-seconds, v6-key-stone, v6-wall-build}.png.
