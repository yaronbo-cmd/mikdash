# PLAYTEST-S7 — the teen's second look (wave 7, on the published v15)

**Who plays.** נועם (16): Brawl Stars, Clash, Roblox tycoons; fast, skilled, impatient; 5–15-minute sessions on the bus.
מאיה (15): Hay Day, Township, Candy Crush; slower hand, reads, collects, claims every order, visits the kings. (docs/FUN.md §1.)

**What they played.** v15 as published (master b32cc0f), then wave 7's branches. Instruments, all in `test/playtest/`:
- `v6-bots.cjs --shots` — the two on the **real HUD** (BUILD's game over its fake 3D world) with the real MATCH3 board played move
  by move at the persona's hand and pace, FUN's precision games and KINGS' court, on a virtual clock (10 minutes each).
- `loop-sim.mjs` — the two on the **real rules** (state, MATCH3's engine and levels, FUN's games on human timing, the hooks,
  KINGS' trade): the first session, day 1, a return visit 20 h later, week 1. Now also models the dig of the day.
- Real-3D phone frames (390×844): BUILD7's opening shots (test/out/build7-open-*.png on s7-build), looked at.
- DOM harnesses of the new pieces: `test/hooks-dig.cjs`, `test/match3.cjs`, `test/kings.cjs` (phone shots, looked at).

---

## 1. The scorecard (v15, 05:15 UTC)

| | נועם HUD · rules | מאיה HUD · rules | target |
|---|---|---|---|
| first stone by his/her own hands | 0:29 · 0:26 | 0:32 · 0:33 | ≤ 1:00 ✓ |
| first board | 1:23 · 1:41 | 1:36 · 1:54 | 1–2 min ✓ |
| first course | 3:00 · 3:18 | 4:27 · 5:12 | ≤ 6:00 ✓ |
| boards' share, first session | 49% · 35% | 48% · **57%** | ≤ 55% ✗ (Maya) |
| boards' share, week 1 (rules) | 60% | **71%** | building + key stones ≥ 30%: 36% ✓ / 25% ✗ |
| finds on day 1 (rules) | **6** (3 by 6:00) | **5** | a weeks-long album ✗ |
| novelties by minute 10 (rules) | 13 | 11 | ≥ 6 ✓ |
| return visit: first meaningful action | 0 s (a stone for the wall) | 0 s (a quarry game) | ≤ 5 s ✓ — but nothing *new* waits |
| silver held after week 1 (rules) | 1,132 | 1,146 | a sink ✗ |
| dead taps · console errors (HUD) | 0 of 478 · 0 | 0 of 297 · 0 | ✓ |

## 1b. After — the wave-7 merge (06:05–06:30 UTC)

A throwaway merge of s7-build (7f4b858; the rules re-run on 1301170) + s7-world + s7-people + s7-fun (3e38368 → 34956a0),
textually clean; it builds; node suites 173 pass / 0 fail / 9 skipped; BUILD's game-harness 86/86 with FUN's hooks. Same
instruments.

| | נועם HUD · rules | מאיה HUD · rules | v15 (HUD · rules) |
|---|---|---|---|
| first stone by hand | 0:29 · 0:26 | 0:32 · 0:33 | 0:29–0:32 · 0:26–0:33 |
| first board | 1:23 · 1:41 | 1:36 · 1:54 | same |
| first course | 3:20 · 3:18 | 4:40 · 5:12 | 3:00 / 4:27 · 3:18 / 5:12 — ≤ 6:00 ✓ |
| boards' share, first session | **40%** · 35% | **50%** · 56% | 49% / 48% · 35% / 57% — HUD ≤ 55% ✓; rules 56% (the model cannot see the crews' board-time work) |
| the "היום" dot | 3:20 (right after the first course) | 4:40 | — |
| the dig of the day | — (he does not open "היום"; rules: 3:58) | **4:44** in the real HUD, through BUILD's `funTap` | — |
| novelties by minute 10 (rules) | 15 | 12 | 13 / 11 |
| finds on day 1 (rules) | 3 | 3 | 6 / 5 |
| return visit (rules) | **the dig in 0 s** ("גוש של שמונה מטרים", 4/10) | a quarry game → the dig | nothing new waited |
| gold idle after week 1 (rules) | 1,082 → **386** | 848 → **452** | 70 / 135 — the bronze trap (fix 4): BUILD7 1301170 leads with the king, FUN 34956a0 makes a bronze board pay copper (≈ 24) not gold (≈ 30, was ≈ 100); the rest waits for a gold sink (⚑ 4) |
| stages after week 1 (rules) | **6** of 15 | 5 of 15 | 5 / 5 |
| dead taps · console errors (HUD) | 0 of 568 · 0 | 0 of 282 · 0 | ✓ |

Shots looked at: peek test/out/playtest/v6-maya-today.png (the dig card leads the real "היום" sheet, CONTENT's finds in the
album, "52 לחומה"), v6-maya-6_00.png (the quarry board's idle hint arrow, "לבנייה: 5/7 אבנים לצעד הבא").

## 2. נועם, 16 — the first ten minutes on v15

- **0:00.** A top-down hill at dusk (v15); on s7-build the finished House over the city first, then the flight down to the gold
  ghost of the plan and "כאן ייבנה הבית." (build7-open-first.png, -landed-hud.png): *"וואו. זה מה שאני בונה?"* The ghost
  plan is the promise he needed. **But after the landing his kohen is a 10-px dot at the bottom-right corner** (fix 2).
- **0:26–0:29 · the great stone by the crane**: *"רגע, אני זה שמניח? סבבה."*
- **1:23 · the first board**: 26 moves of plain matches at the start; the first tool is taught on level 2, so most first boards
  give no special in the first minute: *"זה קנדי קראש בלי הממתקים המיוחדים."* (fix 6)
- **3:00 · the dressing game — with two toasts stacked over it** ("מצאת: השוליים המסותתים" over "8 אבנים הגיעו לאתר") while he
  taps on rhythm (v6-noam-3_00.png): *"אל תדברו אליי עכשיו."* (fix 3)
- **6:00 · the third find in six minutes** ("מצאת: האבן הגדולה · 3 מתוך 10"): the album is a pile, not a hunt (fix 5).
- His precision games rise a level after two strong tries — silently. He never learns he got better (fix 9).

## 3. מאיה, 15 — the first ten minutes on v15

- The same opening; she names her kohen. The crane at 0:33.
- **1:36 · the first board** takes her three minutes. The vessels she matched go… nowhere she can see: the album of the vessels
  hides behind "מפת השדה והאלבום", and 30 of each would open all five cards on the same win card (fix 7).
- **4:27 · the first course**, then "היום": three orders, the daily, the album (v6-maya-today.png) — *"יש לוח משימות ואלבום"*.
- **The kings**: the first visit is a chart and five rows. *"מה אני עושה פה? למי אני אמורה לכתוב?"* (fix 8)
- **Her first session is 57% boards (rules)**, her week 71%: *"אני אוהבת את הלוח, אבל אני רוצה יותר לבנות."* (fix 4)

## 4. Day 1, the return visit, week 1 (rules)

- **Day 1**: both finish the Mount and see its moment. 7–8 boards, 15–16 key stones — and 5–6 of the album's 10 finds.
- **The return (20 h later)**: the first action in 0 s, but nothing new waits: the same wall, the same board. Crews set stones
  while they were away (a line on the pill), a ship may have arrived (Maya). *"חזרתי — ומה חדש?"*
- **Week 1**: 5 of 15 stages (2.9 h / 4.7 h), 8 of the album's 10 finds (6 of them on day 1), silver ≈ 1,140 idle, Noam signs 0
  deals.

## 5. The top ten, ranked by their impact on retention

| # | fix | owner · where | P | status |
|---|---|---|---|---|
| 1 | **A reason to come back tomorrow.** "חפירת היום": one real find a day from content/finds.json, in a fixed order per player (a missed day loses nothing), a 5–10-s brush game, the find's true archaeology (found, by whom, where it is shown, source, טיוטה), +10 ארז, the brush time as a PB, and **"מחר בחפירה: <site> — מה מסתתר שם?"**. Shabbat/Yom Tov rest. The "היום" dot counts it. | FUN hooks/loop.js + dig.js · BUILD ui.js `badges()` | **P0** | ✓ f3ebbd7, 4e39c56 · BUILD ec2be20 (the dot) |
| 2 | The first frame is the vision (the House over the city), then the flight down to the plan's gold ghost — and it now **ends on the hero** (after FUN's P1: he was a 10-px dot in the corner, build7-open-landed-hud.png). | BUILD7 × WORLD7 × PEOPLE7 · main.js `// ── build7 ──` opening | P1 | ✓ s7-build 1cd44d4, 7f4b858 · s7-world 7c8caed |
| 3 | Toasts one at a time, and none over a precision game or a board. | BUILD7 · ui.js `toast()` | **P0** | ✓ ec2be20 |
| 4 | **A bronze step was a gold farm** (found on the wave-7 merge): Nikanor's doors (bronze 80) sent the player to the gold field, whose levels 1–7 had no copper ore — Noam played ten gold boards in a row and held 1,072 idle gold after week 1. A gold board played for bronze now carries ore (≈ 10–14 a board); **the pill should lead with the king** (Nikanor's doors: 150 bronze for 20 silver — the history, and the silver sink). | FUN src/match3/levels.js · BUILD7 nextAction / the pill × KINGS `bestFor` | **P0** | FUN ✓ 3e38368 · BUILD7 open |
| 5 | The album filled in a day (5–6 finds on day 1). Four finds moved from day-1 counts to the dig of the day; CONTENT's finds.json now reaches the album (v15 never called `setFinds`). Day 1: 3 finds; one a day after. | FUN hooks/loop.js | P1 | ✓ f3ebbd7 |
| 6 | The first board had no special in its first minute. Each field's first board now opens with a four-in-a-row one swap away, and the first hint points at it: a tool (and usually a cascade) on the first move. | FUN src/match3/engine.js `plantFour`, index.js | P1 | ✓ e69e972 |
| 7 | The vessel collection was invisible, and 30 of each would open every card at once. Now every end card shows the strip of the vessels and their way to a card (the ones this board fed hop), and one card opens per board (30/60/90…), told right there with its line. v15 saves keep their cards. | FUN src/match3/index.js, ui.js | P1 | ✓ e69e972 |
| 8 | The kings' first visit was a chart and five rows. Now the first deal is a small story: a messenger from Jaffa with the merchant's two lines (המחשה), what Ezra 3:7 tells (verified), then the taste raft's contract. Skippable, once. | FUN src/kings/ui.js `story()` | P1 | ✓ 3889251 |
| 9 | The precision games' level rose silently, and the quarry and the whole stones got *longer*, not harder. Now a level chip ("רמה 3"), the accuracy and what the next tier needs ("דיוק 82% · למופת: 90%"), one line when a level rises (never when it falls), the kohen's proud pose after a PB (PEOPLE7's `hero.gesture`), and harder = faster and tighter (quarry L4 24–27 s → 18–21 s; whole stones 22 → 17 s). | FUN minigames/*, hooks/loop.js | P2 | ✓ 4b93431, 805ba27, 5423f99 |
| 10 | Maya's boards: 57% of her first session, 71% of her week (rules). A 3★ board pays a third segment; the crews keep setting stones while a board is open ("בזמן שחצבת…"). The rules model still says 56% (it cannot see the crews' board-time work); see §1b for the HUD. | BUILD7 · state.js `starBonus`, index.js | P1 | ✓ s7-build c8bacce |

**Also landed from PLAYTEST-S6 §5** (BUILD7, s7-build ec2be20): the pill's work line in words ("נדבך 1 מתוך 6 · אבן 7 מתוך 32"),
counts in the plural ("12 אבנים"), the board pill by what it pays ("▶ המחצבה · כ־45 אבנים"), "מלאי לחומה"; the crew chip in
words — "הצוות מניח אבן בעוד 3:03" (FUN 79c3291 on BUILD7's `S.crewEta`).

## 6. ⚑ For the owner (one line each, with a default)
1. ⚑ **חפירת היום: עונה של עשרה ממצאים.** אחרי כשבוע וחצי כל הממצאים באלבום. ברירת מחדל: לבקש מ־CONTENT עונה שנייה של ממצאים מאומתים בגל הבא; עד אז הכרטיס אומר "כל הממצאים של העונה באלבום שלך".
2. ⚑ **נחושת ממלכים, לא מלוח זהב.** כשצעד צריך נחושת (דלתות ניקנור), הכפתור הראשי מציע את עסקת ניקנור מאלכסנדריה (150 נחושת ב־20 כסף), ולוח הזהב שני. ברירת מחדל: כך — זה גם השימוש בכסף שנערם, וגם ההיסטוריה.
3. ⚑ **אלבום הכלים נפתח כרטיס אחד בכל לוח** (30, 60, 90… מכל כלי). ברירת מחדל: כך; שמירות ישנות שומרות את הכרטיסים שכבר נפתחו.
4. ⚑ **הזהב נערם (כ־400 בסוף השבוע הראשון).** ברירת מחדל: בגל הבא — ציפוי הזהב של האולם וההיכל כצעדים שקונים בזהב, והמלכים מציעים זהב רק כשצריך.

## 7. Runs and files
- v15 runs (05:10–05:20 UTC): `v6-bots.cjs --shots` (test/out/playtest/v6-bots.json; shots looked at: v6-noam-{0_40, board,
  3_00, 6_00}.png, v6-maya-today.png) · `loop-sim.mjs` on b32cc0f and on s7-fun 0723f67 (test/out/playtest/loop-sim.json).
- New pieces, phone 390×844 (looked at): test/out/dig/dig-{sheet, brush, card, shabbat, arts}.png · test/out/m3-quarry-won.png
  (the vessel strip and a new card) · test/out/kings-story-{1,2}.png · test/out/dig/mg-crane-{mid,result}.png (level chip,
  accuracy target).
- Real-3D (BUILD7's, s7-build): build7-open-first.png, build7-open-landed-hud.png.
