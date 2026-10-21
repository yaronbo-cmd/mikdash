# BRAIN14-GAMES14: the mini-game maker

**The code first.** Every site game is the same thumb. The strike, crane, quarry, plumb and dress are five timed taps, and `whole` is a two-button sort. frame.js hears only `pointerdown` → `M.tap(x, y)` and button clicks → `M.press(id)`. It has no move, no up and no hold. The moments are imperative SVG with no levels, and they return only `{ok, skipped}`. A repeatable job therefore means a port into a frame model.

## 5 new ideas (not in §4)

| # | Job | Gesture | The kohen in 3D · what stays | Stages | Source | Why 8–12 | Effort |
|---|---|---|---|---|---|---|---|
| N1 | **שני חבלים** | two thumbs each hold a rope | two kohanim lower a cedar beam into its sockets · the beam, in the ceiling | heichal, lishka, ulam | cedars: עזרא ג, ז; the lowering: המחשה | two thumbs at once; with a friend, "לאט! חכי לי!" | S–M |
| N2 | **אמת המים** | tap a channel stone to turn it (pipe puzzle) | lays the channel · water flows into the laver | kiyor | יומא לא ע״א, עין עיטם (in the repo: content/facts.json f_water_etam); the puzzle: המחשה | the rush of water at the end | M |
| N3 | **הגלגלת** | pull down, hand over hand, then tap to tie off | hauls a basket up the scaffold · the pulley, rigged | wall, ulam, heichal | המחשה | the most physical swipe; yank it and the basket swings | S |
| N4 | **מכינים סיד** | hold to pour (stop before it spits), then circle to stir | at a steaming lime pit by the altar · the white heap, then the whitewash (B3) | yesod–karnot | מדות ג, ד ("ומלבנים אותן פעמים בשנה", as HISTORY14 verified it); the slaking: המחשה | hiss, steam and bubbles | S–M |
| N5 | **ריקוע הזהב** | aimed taps on the glowing thick spots; overdo one and it tears (a scrap patches it) | beats gold into leaf at the bench · the leaf feeds the rub (A6) | gates, ulam, heichal | שמות לט, ג ✓ ("וירקעו את פחי הזהב", checked on Sefaria; the verse has no Name); here: המחשה | gold spreads like a squish toy | S |

VOTE | two-ropes-beam | שני חבלים לקורה | כל אגודל מחזיק חבל ומוריד את קורת הארז לאט, ואם צד אחד ממהר הקורה נוטה, ואפשר גם עם חבר | שתי אצבעות מחזיקות | תקרות ההיכל והלשכות | המחשה (הארזים: עזרא ג, ז)
VOTE | water-channel | אמת המים | מסובבים את אבני התעלה עד שהמים זורמים מן המעיין אל הכיור, כמו פאזל צינורות | הקשה מסובבת | הכיור | המחשה (עין עיטם: יומא לא ע״א)
VOTE | rope-pulley | הגלגלת על הפיגום | מושכים בחבל שוב ושוב והסל עם הכלים עולה לפיגום, אבל מי שמושך מהר מדי מנדנד אותו | משיכה למטה | החומה, האולם וההיכל | המחשה
VOTE | slake-lime | מכינים סיד לבן | שופכים מים על אבני הסיד והן רותחות ומעלות אדים, ובוחשים עד שיוצא סיד לבן למזבח | מזיגה ובחישה | המזבח | המחשה (הליבון: מדות ג, ד)
VOTE | gold-beating | מרקעים את הזהב | מקישים על המקומות העבים בגוש הזהב עד שהוא נעשה דף דק ומבריק לציפוי | הקשות מכוונות | השערים, האולם וההיכל | המחשה (ריקוע זהב: שמות לט, ג)

## Top 6, with each frame's shape

Each job runs `runFrame` at levels 0, 2 and 4, and its stars come from TIER_Q. The tests require: the autopilot scores ★★★ at L1 and at least ★★ at L3; mashing scores lower; idling still ends.

1. **ניסור קורות ארז (B1), solo and for two.** Why: a new rhythm, and co-op.
   - State: `{cut, line, blade, partner{per}, pulls, onBeat, onLine}`.
   - Handler: `drag(x, y, phase, id)`. A pull is at least 0.25 H toward your own edge; in a duel, the half the finger went down in sets the player.
   - Solver: pulls on the partner's off-beat.
   - Levels: L1 1.2 s, 6 pulls · L2 0.9 s, one knot · L3 a drifting tempo, two knots.
   - Stars: q = .5 beat + .3 line + .2 par.
2. **שפשף עד שיבריק / סיד על המזבח / גזית: פס אחרי פס (A6 · B3 · A3)**, one `cover.js` with three skins, at most one per course. Why: scratch-to-reveal for the least work.
   - State: `{grid 24×16, mask, passes, done, spill, brush}`.
   - Handler: each move stamps the cells along its segment; the strips count only sideways strokes.
   - Solver: a zig-zag sweep.
   - Levels: L1 a big brush, 70 % · L2 85 %, a keep-off zone (gold: "חוץ מאחר הדלתות") · L3 92 %, two passes.
   - Stars: q = coverage × (1 − spill) × par.
3. **גפן הזהב (B9).** Why: it is hers, and it is the coin sink.
   - State: `{branches, tray, placed, orders}`.
   - Handler: drag a gift; it snaps to a branch within r, or floats back.
   - Solver: places each order.
   - Levels: L1 5 gifts anywhere · L2 a donor's order ("3 עלים ואשכול") · L3 orders by place.
   - Stars: L1 always gives ★★★; then the orders met and par.
4. **קשת על פיגום (B8).** Why: the frame comes out and the arch stands.
   - State: `{slots, tray, nextL, nextR, wedges}`.
   - Handler: a stone seats only if it is next from its side, with the keystone last; otherwise it wiggles. Then she taps the two wedges.
   - Solver: alternates the sides.
   - Levels: 5 · 7 matched by size · 9 with an even knock-out.
   - Stars: q = stones seated first try / N × par.
5. **כלה עורב (B18).** Why: funny and fast, and it runs in today's frame.
   - State: `{slots, ravens[{target}], landings}`.
   - Handler: a `tap` on the roof's edge sets a spike; a landed raven is tapped away, unharmed.
   - Solver: spikes the next raven's target first.
   - Levels: 8 slots and 1 raven · 12 and 2 · 16 and 3 that switch targets.
   - Stars: q = (1 − landings/limit) × par.
6. **שני חבלים (N1).** Why: two thumbs, and the cheapest co-op.
   - State: `{yL, yR, tilt, slips}`.
   - Handler: `press(id, down)` from two hold buttons.
   - Solver: a P-controller on the tilt.
   - Levels: slow ropes · a gust · a longer beam.
   - Stars: q = level × landing together × par.

## 3 cuts

1. **B7 קנה המידה:** 20–30 identical taps plus counting is the strike's monotony again. Keep the numbers as a fact.
2. **B11 רפסודות:** steering is race.js, her escape game. It is also off-site, and it is L here.
3. **A1 חיבור על חיבור:** the crane already scores "תפר על תפר", and a one-of-three quiz is solved by its second play.

Also: B2 and B12 both use race.js's alternating feet. Keep one.

## My lens

**Generalizes most easily: the coverage trio** (lishka's strips, heichal's rub, guf's whitewash; B3 already exists as guf's phase 2). Each core is about 20 lines, with no physics, no generator and no fail. Coverage is `M.progress`, and the levels are just numbers. The port:
- the drag channel;
- the SVG listeners become `M.drag`, and the bands and cells become one grid;
- `K.say` becomes `M.fx`;
- a node solver that sweeps.

**Generalizes most widely:** `slotPieces` (moments.js 670) becomes one `place.js` for the vine, the arch, the tiles and the scaffold.

**Poor fits:** the one-of-three moments (solved once, solved for good) and the timed holds (a sixth timed tap).

**Most fun per hour: the drag channel in frame.js**, about 60 lines and 2.5 KB:
- `pointermove`/`up`/`cancel` call `M.drag(x, y, phase, id)`;
- `auto()` and `simulate()` accept `{x, y, p}`;
- `cue()` can return `{x, y, x2, y2}`, so the hand swipes;
- `buttons[].hold` sends `press(id, down)`;
- `game.tall` makes the canvas taller.

It unlocks 8 of §3's gestures. After it, the rub has the best ratio (about 2 h) and the saw the best new feel (about 4 h).

**Two on one phone: the saw**, on shell.js's duel layout ("כל אחד בקצה שלו, הטלפון על השולחן", the top half turned). Each player pulls toward himself, and the saw cuts only when the pulls alternate. If both pull at once it sticks: a laugh, and no loss.

**Weight:** about 50 KB for all six; each job stays under 15 KB.

## Response

*(05:58 UTC, after FUN14, ECON14, SITE14 and HISTORY14.)*

**Merge: the brainstorm converged, so take each converged job once.**

| Merged job | Its sources | Notes |
|---|---|---|
| **מקימים עמוד** | FUN F5 · SITE N3 · HISTORY H2 · my N3 | One `pull.js`: hand over hand. The column (War 5.5.2 ✓) is the face; my pulley basket is its skin for the high courses. |
| **אמת המים** | ECON E2 · HISTORY H3 · my N2 | One `pipes.js`. יומא לא ע״א is ✓ in the repo, and ECON's שקלים ד, ב is a second source. L3 takes HISTORY's rule: 23 amot of fall to spend, so water runs only downhill. |
| **כלונסות הארז** | SITE N2 · ECON E5 · my N1 | One beam job under מדות ג, ח's own words ("כדי שלא יבעט"). The gesture is my two thumbs (two kids for the duel); the wedge's taps end it. |
| **גלי הים** | SITE N1 · HISTORY H1 | A swipe in/out pattern on the drag channel. |
| **ממלאים את הסוללה** | FUN F2 · ECON E4 | The flick. |
| **F1 השלם את הנדבך** | FUN | A `place.js` skin, like B9. It replaces A1, as I cut it. It is the most-dealt job, so its generator must vary: L1 3 stones · L2 4 + a decoy · L3 5 + 2 decoys over a denser course below. |
| **cover.js** | ECON's cut | Gold and plaster only; A3 stays lishka's moment. |
| **Stars** | FUN | Done = ★, q ≥ .7 = ★★, q ≥ .9 = ★★★. This replaces my TIER_Q contract. Today tier 0 shows ☆☆☆ (frame.js 256). |

**Where I disagree:**
- **SITE's cut of B8.** Robinson's Arch is already modeled (mount.js 109–125, `P('robinson')`), so the arch job raises a visible arch with no cut-away. It can wait for wave 15, but it is not wrong.
- **SITE N3's "tap on the beat".** That would be a sixth timed tap on a site that already has five. Pull hand over hand.
- **The Jericho doors (FUN F4, SITE N5).** The line is already used twice: Phase B's gate (avodah/minigames/heichal.js 62) and kiyor's mukhni (moments.js 659). Build the doors only as Phase B's setup, with FUN's one-finger slow push. SITE's two-finger spread breaks the one-hand rule and the frame's single pointer.
- **B12 in FUN's top 6.** I side with HISTORY's cut: no Temple source, race.js's gesture, and a new rig.
- **H4 חן חן לה.** It works as a 5-s end beat; it is too much mashing to be a job.

**What I would build first, in dependency order:**
1. frame.js: the drag channel, FUN's "the first touch is a move", and the star floor. One commit, about 3 KB, with minigames.test.mjs driving `{x, y, p}`.
2. cover.js: gold (A6) and plaster (B3). All five of us picked them, and SITE's reveals make the 3D free.
3. The saw (B1): solo, then the duel. All five of us picked it.
4. place.js: F1, then B9 (the vine).
5. pull.js: the column.
6. pipes.js: the aqueduct.
7. כלונסות הארז.
8. גלי הים.

**Addendum (06:01), for the vote page:** of my five VOTE lines, keep `slake-lime` and `gold-beating`, which nobody else proposed. Fold the other three into the merged cards:
- `two-ropes-beam` → SITE's `cedar-poles`, which carries מדות ג, ח;
- `water-channel` → HISTORY's `aqueduct`, verified;
- `rope-pulley` → `raise-column`.

That way she never votes twice on one job. pipes.js is tap-only (ECON), so it does not wait for the drag channel and can be built in parallel. The quote corrections are in the table above: מדות ג, ד as HISTORY14 verified it, and שמות לט, ג ✓.

**On BRAIN14-JOINT (06:05), one disagreement:** the saw's duel belongs in Part 1, right after the solo saw, and not in wave 15. It costs about 2 KB, because the drag channel already carries the pointer id and the model already reads the side from the half where the finger went down. Only `game.tall` and the turned top half are new. It is the list's only co-op job and the owner's "two on one phone". Everything else in the joint pick I take as written (mine: #1, #5, the place.js spec for #7, #8, and #10 if I'm free).
