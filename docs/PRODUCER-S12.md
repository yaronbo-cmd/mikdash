# PRODUCER-S12 — the owner's eyes, wave 12 (טיוטה, 29.9 evening)

The owner, 29.9 21:01 Jerusalem, after playing v21: the quarry's board repeats (1), the Mount looks the same from far at course 3
as at course 1 (2), it always rains in the evening (3), Phase B needs more detail (4), the music should have more pulse (5); and
20:37: a build-up and a celebration full of light at Chanukat HaBayit, and the Levites' song of the day, every day.
The compass: **"זה הכי חשוב שיהיה כיף ומעניין ותקין"** — and the kohen walking from point to point at his work, everywhere.

## 0. How I played
- A phone at 390×844 (dpr 1, touch, he-IL), real touch only (`page.touchscreen.tap`, CDP touch drags for the sling and the
  two-finger pinch-out), a look at every screenshot. No autoplay flags. The only hooks: the renderer's (`__START_PAUSED` +
  `__T.simulate`), the declared jump (produce-play `--jump`, the state written once and logged), WORLD12's `__FORCE_DATE`.
- New this wave (test/produce-*.cjs, mine):
  - produce-play `--fixcam`: at the end of each course of a site, the same fixed cameras every time (VIEWS.olives; SITE12's
    `se` and `pinch7` = wallView('har') × 7) and the owner's own real two-finger pinch-out; `--quarry=N` (N quarry actions in a
    row); every game a quarry action opens is logged (GAME OPEN/CLOSED: the board with its level, a precision game, the
    cycle's games); הקלע של דוד played by real touch drags; the music's state/tempo at every shot.
  - produce-sheet.cjs: the course shots side by side and the % of the picture changed from one course to the next.
  - produce-rain.cjs: the night by the Hebrew date (a returning player's evening), reopened, and by day.
- Builds: **v21** = master 0c7150e · **peek12-A…** = master + s12-fun + s12-site + s12-world + s12-avoda (times below).
  Shots: `wt/producer12/test/out/produce/<tag>-NN-<step>.png` (not committed).

## 1. The verdict per stage (✓ / ½ / ✗)
Each later stage from its start (a declared jump), then ~55 s by touch (runs s1 on peekE 19:38, s2 on peekF ≈ 20:00).
| stage | build · run | כיף | מעניין | תקין | K80 · his walk | in one line | shots |
|---|---|---|---|---|---|---|---|
| שיטוח ההר (course 0→1 by touch) | v21 · mt-1 | ✓ | ✓ | ½ | 57–87 px at his banker; 17 spots, steps 3–7 amot | the first course by the pointer: the crane's great stone, the board, 38 stones in 9 min; from far the hill does not change (N70) | mt-1-10, -12, -14, -20 |
| שיטוח ההר (courses 0→3 from far) | peekD · mb | ✓ | ✓ | ✓ | n/a (zoomed out) | every course changes the picture, Δ 17–57 % (N70 ✓) | N70-peekD-courses0-4 |
| חומת העזרה | peekE · s1 | ✓ | ✓ | ✓ | survey 105 · dig 101 · courses 89 px; 4 spots (10/27/4) | the survey, the dig and the first course at working distance | s1-03, -04, -08 |
| שערי העזרה | peekE · s1 | ✓ | ✓ | ✓ | 105 · 106 · 86 · 90 px; 4 spots (15/27/5) | the crane's first stone; "בדרום העזרה עמדו…" (מדות א, ד–ה) over him at his banker | s1-12…18 |
| עזרת הנשים | peekE · s1 | ½ | ✓ | ✗ | survey 105 ✓; **dig HIDDEN behind the court wall** (30 s) | N74 | s1-21, -24, -27 |
| הסורג והחיל | peekE · s1 | ✓ | ✓ | ✓ | 105 · 102 · 90 px; 4 spots (9/4/24) | clean; a transient off-frame at the end (a crew's frame) | s1-30, -31, -35, -36 |
| שער ניקנור | peekE · s1 | ✓ | ✓ | ✓ | 105 · 104 · 91 px; 3 spots (20/19) | a crew of dressers around him at the courses — the owner's kind of frame | s1-39, -41 |
| הלשכות | peekE · s1 | ½ | ✓ | ✗ | 88–94 px at the ends; off-frame twice; **21 spots, steps up to 158 amot** | N75: he shuttles 150 amot between the chambers while the pill says הקש | s1-43 |
| יסוד המזבח | peekF · s2 | ✓ | ✓ | ✓ | survey 105 · dig 104 · 85 px; the **wooden mallet** (N59 ✓); 2 spots | a whole field stone on his banker, the arrow on him; the crew beside him with dark (iron-looking) hammers (N76c) | s2-03, -06 |
| הסובב | peekF · s2 | ✓ | ✓ | ½ | 105 · 104 · 85 px | from above with the crew carrying baskets — lovely; "חפירה עד הסלע" on the altar's ledge is untrue (N76a) | s2-09, -12 |
| גוף המזבח והכבש | peekF · s2 | ✓ | ✓ | ½ | 105 · 88 px | the same; N76a | s2-15…18 |
| הקרנות | peekF · s2 | ½ | ✓ | ½ | 105 · 102 · 86 px | surveyed from the pavement at the altar's foot, the horns 10 amot up (N76b) | s2-21, -24 |
| הכיור | peekF · s2 | ✓ | ✓ | ✓ | 105 · 89 px; 3 spots (6/7) | a crowd of workers around him at the survey, "הכיור: פרויקט חדש" | s2-27, -30 |

## 2. The owner's notes, one by one
### Note 2 — the Mount's progress from far (N70)
**v21 (master), jumps to each course's end, three fixed cameras** (mk run, 18:26–18:33): the picture changes 0→1 (the scrub
pales) and 1→2 (the crest turns one flat pale plane with a white haze), then **courses 2, 3 and 4 are the same picture** from the
olives and se views (Δ 1.7–3.8 %), and 4→5 jumps to the paved platform. Sheet: N70-v21-courses0-4.png.

**peekD (19:14 merge, site 430bf9f), the same jumps and cameras** (mb run, 19:23): **every course changes the picture** — Δ olives
16.8 / 28.4 / 33.5 %, pinch7 56.8 / 34.1 / 32.1 %, se 35.4 / 37.9 / 33.5 % (0→1 / 1→2 / 2→3). The pale cut floor with its ring
of benches grows on the crest, the brown fill climbs from the foot, the retaining wall stands at the bay's rim. Sheet:
N70-peekD-courses0-4.png. **N70 ✓.**

### Note 1 — the quarry's variety (N71, N72)
**peekB (19:00), run q1:** a v21 player (m3 quarry level 3) reopened with no stone: the pill named the next game, **"▶ הקלע
של דוד · כ־50 אבנים"** ✓, and the sling played by real drags: L1 "שתי קסדות" in one stone, L2 "הגשר" and L3 "מגדל אבן" in
two, ★★★ and +60 stones each, a sourced fact after each (טיוטה), music `quarry@118`. Then the stone chip's **"▶ שחק"** gave
**the board three times in a row** (levels 3, 4, 5: 31/31/34 moves, goals 39/37/40): the chip's path bypasses the cycle (N71).
**peekD, run q2 — five quarry actions in a row ✓:** the pill "▶ הקלע של דוד" → the sling (1 stone, ★★★, +60) · the chip
"▶ נדבך על נדבך" → the stack (8 courses, +48) · "▶ שחק" → **the board back, level 3 round 2: 35 moves / 43 stones** (round 1:
31 / 39), its card "הלוח חוזר, ארוך יותר" · "▶ חציבת גוש" → the precision game (+72) · "▶ הקלע של דוד" → the sling L2. N71 ✓
(7788dfa). The strip on the stack's intro ticks the wrong game (N73, P2).

## 3. The notes and where they stand
| note | owner · sev | what | answer | my touch |
|---|---|---|---|---|
| N70 | SITE12 · P1 | the Mount's courses 2–4 look the same from far | 5712673 … 430bf9f (benches, the fill, the count) | ✓ peekD: Δ 17–57 % every course |
| N71 | FUN12 · P1 | the stone chip's ▶ שחק bypasses the cycle: the board again and again | 7788dfa | ✓ peekD q2: the chip names and opens the cycle's game |
| N72 | FUN12 · ✓ + P2 | the sling ✓; the play in the bottom quarter, the floating text, L1–L3 too easy | c6de648, 96d5179 (the sky filled, the text, L3 teaches the high throw) | — |
| N73 | FUN12 · P2 | the stack's intro strip ticks the wrong game | 96d5179 | — |
| N74 | SITE12 · P1 | Ezrat Nashim's dig framed from behind the court wall (HIDDEN) | — | — |
| N75 | SITE12 · P1 | the chambers: 150-amot shuttles, off-frame while the pill says הקש | — | — |
| N76 | SITE12 (+ supervisor, ui.js) · P2 | the altar: "חפירה עד הסלע" above the yesod; the horns surveyed from the ground; the crew's iron-looking hammers | — | — |

## 4. Top 10 for wave 13
(at 21:05)

## 5. ⚑ לבעלים (טיוטה; ברירת המחדל בסוגריים)
(at 21:05)
