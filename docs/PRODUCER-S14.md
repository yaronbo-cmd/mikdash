# PRODUCER-S14 — the owner's eyes, and his daughter's, on wave 14 (טיוטה, 1.10)

The owner, 30.9 23:27, after his daughter played on her phone: coins by the task's difficulty, to buy things (1); the precise strike is
not clear — "השחקן לא יודע איך ועל מה ללחוץ כדי לתזמן מכה מדויקת" (2); **"והכי חשוב בגרסה הזו": more building work than dressing
stones — "כי זה ארוך ומשעמם, היא רק 'בורחת' למשחקי הביניים"** (3); the kohen still floats or sinks (4). She voted on 1.10 07:45; her ❤️
jobs come first. The compass: **"זה הכי חשוב שיהיה כיף ומעניין ותקין"**, and the kohen walking from point to point at his work.

**Headline.** Her complaint is answered where the course loop runs. From her first deal on, a course is built by jobs she chooses:
"מה נעשה עכשיו?" deals one stone card and one craft card as D1 says (the treadwheel | the gold at the gates, the saw at Ezrat Nashim,
the wheel at the chambers), the arch at the Mount plays from the first voussoir to the keystone to ★★★ and 9 coins, **the ring she
chose teaches a perfect strike in 3–4 tries**, and אוצר המלאכה holds her five and now opens with her first pay. What a fresh phone
still meets first is the old Mount: the survey and **24 rock strikes before her first choice** (v26: 80 strikes and no choice at all).
**Of her nine ❤️ jobs: ✓ 1 played to its end by touch (the arch, twice); ½ 6 dealt, opened and legible but not finished by my finger
on a loaded machine (the gold, the treadwheel, the column, the wheel, the saw, the rafts); ✗ 2 never reached me (the snap-line, the
letters).** The K80 gate: ✓ 10 of 11 — v26's two ✗ in the House are ✓; Ezrat Nashim hides him behind its wall.

## 0. How I played
- **Builds.** v26 baseline = master a8d308b (pinned `test/out/produce/builds/v26.html`). Throwaway merges in wt/peek14 of s14-econ,
  s14-games, s14-site and s14-fun on master (`test/produce-peek14.sh`), pinned per run (`test/out/produce/builds/<peek>.html`;
  heads and bundle sizes in `builds/peeks.txt`).
- **Her thumb, by real touch** at 390×844 (touch, he-IL, dpr 1): the regular game from a fresh phone (the opening, the name, the
  tutorial, then the Mount), and the demo as the owner enters it (☰ → "מצב הדגמה" → "שלבים ▾" → a stage). Only touch after that:
  the pointer, the coach's hand, the ring, the pill, a card's button, the deal's cards, the purse, each game by its own on-screen
  hand (`cue()`: a tap, a swipe dragged by CDP touch, a hold button held). No autoplay flag. I looked at every shot I cite.
- **Declared hooks:** the renderer's (`__START_PAUSED` + `__T.simulate`, a render before each shot); `__NO_OPENING` on the demo runs;
  the K80 gate's seed jump (the save written once per stage, logged).
- **New tools (test/, mine):** produce-play `--glog` (the game's own event log, dumped every 30 s), `--ringTimed` (the ring tapped
  as the screen teaches: when it touches the gold), `--dealPick` / `--redeal` (the deal's cards read and picked as she would),
  `--shop` (the purse opened, her five items read, the cheapest she can afford bought), drags and holds by a game's own hand;
  produce-base14 (the gestures' timeline: the longest run of one gesture, the first course end, her escape moments);
  produce-jobs14 (deals, jobs, ★, coins, the ring's tries, the shop); produce-peek14.sh.
- **My finger is slower than hers:** about one strike in 1.5 s (she can reach one in 0.86 s, RHYTHM.cycle), so a strike run's
  seconds are an upper bound; its strike count is exact.
- **Runs** (test/out/produce/<run>.out, <run>-log.json, <run>-glog.json; shots <run>-NN-<step>.png):

  | run | build | what | conditions |
  |---|---|---|---|
  | b1 | v26 | the regular game, a fresh phone, 9.5 min | alone on the machine |
  | b2 | v26 | the demo → שיטוח ההר, 8 min | beside one run |
  | pa1 | peekA 12:42 (+114 KB) | the demo → har; N93 dropped it into a fresh regular game (7 min) | beside one run |
  | pb1 ∥ pb2 | peekB 13:04 | the demo har → wall ∥ a fresh regular game | two of mine + one other run |
  | pc1 ∥ pc2 | peekC 13:25 | the seed's jump: har (2nd course) ∥ gates → ulam → lishka | same |
  | pd1 ∥ pd2 | peekD 13:47 (3,242,514 B) | the jump: gates → wall → lishka → har's last course ∥ a fresh regular game | same; load average 11–14 on 2 cores |
  | g1 ∥ pe1 | peekE 14:09 (3,245,057 B) | the K80 gate (one 10-minute part: 11 of 15 stages) ∥ her jobs by the jump (har's last course → wall → lishka) | same |

  From pb on my plays ran two at a time beside the other agents' tests (the lane gives one ticket per ~22 min): a precision or
  rub game that needs a steady finger (the treadwheel, the gold) suffered from my latency, so a "not finished" below is marked as
  mine unless the shot shows the game's fault.

## 1. The numbers, before and after (har's first 10 minutes, by touch)
The "after" columns are the merges' plays; from pb on they ran two at a time on a loaded machine, so their seconds are long — the
counts, the kinds, the order and the words are exact.
| measure | v26 regular (b1) | v26 demo (b2) | wave 14 regular (pa1 peekA · pb2 peekB) | wave 14, the jump into the courses (pc1, pd1) | target (D1) |
|---|---|---|---|---|---|
| what she does before her first choice | everything: no choice exists | everything | survey, **24 rock strikes**, the great stone, the story, the name, 2 stones → **the first deal after 32 strikes** (pb2) — at peekA none in 7 min (ftue 5: pa1) | the deal at once (pc1-02, pc2-02, pd1-02) | a choice by minute 2 |
| kinds of gesture in the window | 7 (survey, rock, stone, crane, quarry, board, plumb) | 6 | 6 + the choice (survey, rock, crane, stone, "סתת בקצב", the column's rope) | tap-and-seat (the arch), hold-the-feet (the treadwheel), rub (the gold) | a new kind ≤ 90 s |
| longest run of one gesture | the board 143 s (30 swaps) | 43 strikes, 83 s | **the rocks: 24 strikes** (49 s pa1; ≥ 21 s at her fastest) | a job: the arch 32 s of play | ≤ 25 s |
| longest strike run on stones | 42 strikes, 78 s | 43 strikes, 83 s | 25 (pa1, before the hand-off fix) → **11** (pb2) | — | |
| first course end (from her first tap) | 7:55 | 4:20 | not reached in either run (slow finger) | — | a course 40–80 s |
| escapes (D1's pacing broken) | 8 | 11 | 8 (pa1) · the rocks still one | — | 0 |
| a perfect strike | 14 of 107, by chance | 22 of 131, by chance | **taught: the first "מדויק! מכה כפולה" at try 3 (pb2) and 4 (pb1)** | — | ≤ 5 tries |
| coins earned | +2 | — (the demo's 900) | +3 in 9 min (pb2: one strike card, ★) | +9 (the arch ★★★) · +3 (a skipped gold) | ≈ 150–180 a stage |
| first purchase | — (no shop) | — | כינור 20 at ~3.5 min, from the start money (pb2); since ed9a354 the shop waits for her first pay (pd2 ✓) | — | minute 5–8, from her work |

## 2. Per stage (✓ / ½ / ✗)
Deal = "מה נעשה עכשיו?" seen by touch (its two cards); jobs = played by touch on a merge; K80 = the gate on peekE (14:09), the kohen ≥ 80 px,
on screen and not hidden, 6 s after the seed's jump into the stage's first courses (the deal closed by its ✕, so the shot is the world).
| stage | deck (FUN14's DECKS) | deal by touch | jobs by touch | K80 (g1) | verdict |
|---|---|---|---|---|---|
| שיטוח ההר | key · strike · ★arch · column · F1 · letters (last course) | ✓ pb2 (regular, after 32 strikes), pc1/pe1 (arch \| key), pb2 (column \| F1) | **the arch ★★★ +9, twice** (pc1, pe1 — now with its own line, "קשת רובינסון נשאה גרם מדרגות…"); the strike card ★ +3 (pb2); the column opened (pb2, cut) | ✓ 89 | **½** — the deal and the arch ✓; 24 rocks before the first deal; the letters never dealt to me |
| חומת העזרה | key · strike · ★F1 · tread / saw · rafts | ✓ pd1 ("סתת בקצב \| רפסודות הארזים") | the first stone's crane (pb1, demo); my two jumps there were eaten by N98's dead sheet | ✓ 93 | ½ |
| שערי העזרה | key · strike · F1 · tread / ★gold · saw · rafts | ✓ pc2, pd1: "גלגל הדריכה \| שפשף עד שיבריק" — D1 exactly | the treadwheel (★, my hand), the gold (skipped by my hand) | ✓ 91 | ½ |
| עזרת הנשים | … / ★saw · rafts | ✓ g1 ("ניסור קורות ארז \| סתת בקצב") | — | **✗ HIDDEN** behind the court's wall, 95 px (g1-07: the frame is the wall's face) | ✗ the frame |
| הסורג והחיל | key · strike · ★F1 | — | — | ✓ 96 | ½ (gate only) |
| שער ניקנור | … / ★bronze | — | — | ✓ 96 | ½ (gate only) |
| הלשכות | … / saw · ★wheel · aqueduct | ✓ pe1 ("השלם את הנדבך \| הגלגל על הבור") | the wheel: bucket 1 of 3 when the run was cut (pe1-16) | ✓ 92 | ½ |
| יסוד · סובב · גוף · קרנות | key (whole) · strike (מקבת העץ) / ★plaster | — | — | not reached (the 10-minute cut) | not played |
| הכיור | key / ★bronze · wheel · aqueduct | — | — | ✓ 95 | ½ (gate only) |
| האולם · ההיכל · קודש הקדשים | key · strike · tread / saw · gold · rafts | ✓ g1 (the Heichal: "סתת בקצב \| שפשף עד שיבריק", g1-01) | — | **✓ 92 · 86 · 92** (v26's gate: the Heichal and the Kodesh ✗ HIDDEN) | ½ (gate only) |

## 3. Her ❤️ jobs (✓ / ½ / ✗)
✓ = dealt to her, played by touch by its own hand in 20–30 s, ★ on its card with a sourced line, left in the building; ½ = one of
these missing; ✗ = not reached her.
| ❤️ job | owner · game | where it is dealt | by touch (run · shot) | ★ · coins · s | in the building | verdict |
|---|---|---|---|---|---|---|
| שפשוף הזהב (gold) | GAMES14 cover.js · SITE14 | gates ★, ulam, heichal ★, kodesh ★ | dealt at the gates (pc2-02, pd1-02: "גלגל הדריכה \| שפשף עד שיבריק", D1 exactly) and the Heichal (g1-01); opened and legible ("מבריק 0% · היעד 70%", pd1-04); **my finger: 3–5 strokes in 50 s on the loaded machine → skipped** (the crew finished it) | skip: +3 | the reveal ran (gates, q 0.8) | **½** |
| ניסור קורות ארז (saw) | GAMES14 saw.js · SITE14 | wall, gates, nashim ★, lishka, ulam ★, heichal, kodesh | dealt at Ezrat Nashim ("ניסור קורות ארז \| סתת בקצב", g1-07); not played by my finger; GAMES14's jobs-touch by real touch: ★★★ 21 s solo, the duel ★★★ (both at once sticks) | — | — | **½** |
| מקימים עמוד (column) | GAMES14 pull.js · SITE14 | har | dealt three times at har (pb2-28 "מקימים עמוד \| השלם את הנדבך", pc1, pe1); its game opened ("משוך את החבל למטה, יד אחרי יד. למעלה — לאט") when pb2 was cut | — | — | **½** |
| בניית קשת (Robinson's Arch) | FUN14 place.js · SITE14 | har ★ | dealt at once (pc1-02, pe1-03), played by its own hand twice: the voussoirs from both sides, the keystone last, the wedges out (pc1-04) | **★★★ +9, 32–35 s, twice** (pc1-05; pe1: q 0.99, 15 stones of the course set) — its card now ends with its own line, "קשת רובינסון נשאה גרם מדרגות…" (fixed 71bbe13) | the walk to the work and the reveal ran (jobWalk, jobReveal q 0.99) | **✓** |
| החוט הצבוע (snap-line) | FUN14 snap.js · SITE14 | opens every walled course | **never seen**: my plays entered courses mid-way (the seed's jump) or never reached a course's start | — | — | **✗ not seen** |
| חריטת אותיות ("לבית התקיעה") | ECON14 draw.js · SITE14 | har's last course | **never dealt to me**: at har's last course (pe1, set 163 of 192) the deal was "חצוב את אבן הפינה \| בניית קשת" | — | — | **✗ not seen** |
| גלגל הדריכה (treadwheel) | GAMES14 tread.js · SITE14 | wall, gates, nashim, nikanor, lishka, ulam, heichal, kodesh | dealt at the gates (pc2-02, pd1-02); legible — two big feet, the walker in the wheel, "אבן 1/3" (pc2-04); **my finger did not walk it** (4 rounds unfinished, then "שוליה 43 %", pc2-17) — my hold let go when the hand turned to the other foot (fixed in my harness after the run; not re-played) | ★ (the floor) | — | **½** |
| הגלגל בלשכת הגולה (wheel) | FUN14 wheel.js | lishka ★, kiyor | dealt at lishka ("השלם את הנדבך \| הגלגל על הבור", pe1-14); played by its timed tap: "סובב את הגלגל: הקש על הידית בכל פעם שהיא עוברת בסימן הזהוב", "דלי 1 מתוך 3" when the run was cut (pe1-16) | — | — | **½** |
| רפסודות הארזים (rafts) | GAMES14 rafts.js | wall, gates, nashim, ulam, heichal, kodesh (every deck with cedar) | dealt at the gates and the wall ("סתת בקצב \| רפסודות הארזים", pd1); not played by my finger | — | — | **½** |

## 4. The K80 gate — g1 on peekE (14:09: econ 9e706bd · games 16585c2 · site dc7ef1d · fun 6963b03; 3,245,057 B)
`produce-play --stages`, the save written once per stage (the seed's jump, logged), 6 s of touch, the deal closed by its ✕, one shot after
the touches (looked at). **One part, not two:** the lane's last ticket also carried her jobs (pe1), so the 15 stages ran in one
10-minute run, the House first; the altar's four were cut.
- **K80 ✓ 10 · ✗ 1 of 11:** Heichal 86 · Kodesh 92 · Ulam 92 · har 89 · wall 93 · gates 91 · Nikanor 96 · lishka 92 · sorag 96 · kiyor 95 px
  (g1-01: the Heichal — him at his banker, the treadwheel behind, the deal below him). **v26's two ✗ — the Heichal and the Kodesh hidden
  behind the marble — are ✓ now.**
- **✗ עזרת הנשים — HIDDEN behind the court's wall** (g1-07, 95 px: the frame is the wall's face, he stands at its far edge).
- Not reached: יסוד, סובב, גוף, קרנות.
- **Floating or sinking (the owner's 4th note)** is SITE14's probe (test/hero-ground.cjs, bus/SITE14.md): v26 2/15 stages ≤ 0.2 amah
  (floats to +5.2, sinks to −3.0) → **11/15, floats 0.00 in all 15**; the four left are walks across a low obstacle (the women's
  court's wood stack, the soreg's rail, a chamber's wall end, the Ulam's plinths), not heights. In the shots I looked at tonight — the
  jobs, the deals, the gate — his feet stand on his banker, the court or the course (g1-01, pc2-02, pe1-16); I saw no floating kohen.

## 5. Top 10 for wave 14b/15 (most important first)
| # | owner | what | fixed looks like |
|---|---|---|---|
| 1 | **FUN14** | **The Mount's first minutes are still the old ones up to her first choice:** a fresh phone strikes the survey and **24 rocks in a row** (49 s at my pace, ≥ 21 s at hers), then the great stone, the story and the name, before "מה נעשה עכשיו?" (pb2: after 32 strikes) | the dig is a card of its own (פינוי הסלעים: a lever or the crane, 20 s), or the first-time flow clears 6 rocks, not 12; her first deal by minute 2 |
| 2 | **FUN14 + ECON14** | **Two of her nine never reached my finger:** החוט הצבוע opens a course's start only (my plays never reached one), and חריטת אותיות is dealt only in har's last course — there the deal was "חצוב את אבן הפינה \| בניית קשת" (pe1, set 163 of 192) | the line also opens each stage's first deal; the letters are the last course's first card |
| 3 | **FUN14** | **N98, seen twice: a deal for a site that is no longer the one in play** — its cards do nothing and it never closes (pd1: 16 taps); after a job that ends across a stage change, the next deal is the old site's ("שיטוח ההר · נדבך 6 מתוך 6" over the wall, pe1-09) | a deal is always the focused site's; a stale one closes and re-deals |
| 4 | **ECON14** | **Coins from her work are thin in her first 10 minutes:** +3 in 9 minutes of a fresh game (pb2); the first purchase came from the start money (since ed9a354 the shop waits for her first pay) | a fresh phone earns ≥ 30 coins by minute 6 and buys by minute 8 from her work (game-sim says 5.9–6.6; check by touch) |
| 5 | **ECON14** | **אוצר המלאכה did not scroll under my finger** — האבן שלי, the Levites' instruments and the lamps sit below the fold (pb2-24, pc1-09, pb1-33); two kinds of touch scroll left `.gm-sh-b` where it was | check on a real phone first; if real: her five on the first screen (a row each, or tabs), every buy button in reach without a scroll |
| 6 | **GAMES14** | **The treadwheel and the gold need a steady finger:** on the loaded test machine mine finished neither (pc2, pd1); GAMES14 found the gold too and re-drew the plate (53609e1) | jobs-touch passes both on a busy machine; on a slow phone a child finishes each in 20–30 s |
| 7 | **SITE14** | **Ezrat Nashim's first courses hide him behind the court's wall** (g1-07, HIDDEN at 95 px) | the gate ✓ at Ezrat Nashim, and at the altar's four stages, which the gate did not reach |
| 8 | **FUN14** | **The deal sheet hides the kohen** (pb2-26: only his turban above it) | while the deal is open the frame lifts him into the top half: she sees who will do the job she picks |
| 9 | **the demo strip** | **N96: world pointers lie under the strip** — at har's dig the rock's arrow is on "הרגע הבא ✦" (pb1-15); in v26 on "יציאה ממצב הדגמה" (b2-07) | in the demo no world pointer sits under the strip; the exit asks first |
| 10 | **all four** | **N97: the bundle is at the cap** — 3,245,057 B at 14:09, 4.9 KB under 3,250,000 | the wave's last merge ≤ the cap, every job ≤ 15 KB |

## 6. ⚑ לבעלים (ברירת המחדל בסוגריים)
- ⚑ **ההתחלה בהר** — בטלפון חדש, לפני הבחירה הראשונה "מה נעשה עכשיו?", יש עדיין מדידה ו־24 הקשות ברצף על סלעים, ואחריהן האבן הגדולה, הסיפור והשם. (בגל 14ב פינוי הסלעים יהיה עבודה בחפיסה, והמדריך יפנה 6 סלעים במקום 12.)
- ⚑ **הטבעת** — הטבעת שהיא בחרה עובדת: אצבע שמקישה כשהטבעת נוגעת בזהב קיבלה "מדויק! מכה כפולה" בניסיון השלישי או הרביעי. (להשאיר כך.)
- ⚑ **בניית קשת** — עובדת מתחילתה ועד סופה: שלושה כוכבים ו־9 מטבעות, והקשת נשארת בבניין. (להשאיר; רק הכרטיס שבסוף יספר על קשת רובינסון ולא על סינון העפר.)
- ⚑ **מטבעות מהעבודה** — בתשע הדקות הראשונות של משחק חדש היא הרוויחה 3 מטבעות, והקנייה הראשונה באה מכסף ההתחלה. (מעכשיו אוצר המלאכה נפתח רק אחרי השכר הראשון — זה כבר בפנים; בגל 14ב לוודא שעד הדקה השמינית היא קונה מהשכר שלה.)
- ⚑ **אוצר המלאכה בטלפון** — האצבע שלי לא הצליחה לגלול אל "האבן שלי", כלי הלויים והנרות שבתחתית הדף. (לבדוק בטלפון אמיתי; אם זה נכון — כל החמישה שלה במסך הראשון.)
- ⚑ **החוט הצבוע וחריטת האותיות** — שניים מתשעת ה־❤️ שלה לא הגיעו אליי: החוט פותח רק תחילת נדבך, והאותיות מחולקות רק בנדבך האחרון של ההר — ושם קיבלתי "חצוב את אבן הפינה | בניית קשת". (החוט יפתח גם את הבחירה הראשונה בכל שלב, והאותיות יהיו הקלף הראשון בנדבך האחרון.)
- ⚑ **גלגל הדריכה ושפשוף הזהב** — שניהם נראים וקריאים, אבל האצבע שלי, על המחשב העמוס של הבדיקות, לא סיימה אותם. (GAMES14 בודק שילדה מסיימת כל אחד ב־20–30 שניות, גם בטלפון איטי.)
- ⚑ **התקציב** — הבנייה המאוחדת שוקלת 3,245,057 בתים, 4.9 KB מתחת לתקרה. (בלי תכונות חדשות אחרי 14:25; כל סוכן מקצץ את שלו.)
- ⚑ **הכהן במסך** — בבדיקה של 11 שלבים הוא נראה גדול וברור בעשרה, וגם בהיכל ובקודש הקדשים, שבגרסה 26 הוסתרו; בעזרת הנשים הוא מוסתר מאחורי החומה. (SITE14 יתקן את המסגרת של עזרת הנשים, ונבדוק גם את ארבעת שלבי המזבח.)
- ⚑ **בחירה שנתקעה** — פעמיים נשאר על המסך "מה נעשה עכשיו?" של אתר אחר, והקלפים בו לא עשו דבר. (FUN14: הבחירה תמיד של האתר שבונים עכשיו, וישנה נסגרת.)
