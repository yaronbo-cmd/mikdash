# Scenes — the Temple tour, "איפה הארון?" and the Yom Kippur service (watch only)

Owner of this document and of the code it describes: the World agent (Sprint 3, wave 3, 25 Sep 2026).
Everything shown to the player is a DRAFT tagged "טיוטה" with its source (PROJECT.md §2). No Divine Name is written
anywhere (ה׳ only). The player never walks into the Kodesh HaKodashim; the Kohen Gadol's service is watch-only.

## 1. Where it lives

| file | what |
|---|---|
| `src/avodah/scenes/index.js` | the bottom panel: tabs "סיור" (10 stops), "איפה הארון?" (5 steps), "סדר העבודה" (10 chapters); cards; camera calls |
| `src/sanctuary.js` | the house inside; camera walks, cuts and focus views; `anchor()`; the wicket route |
| `src/avodah3d.js` `// ── yk ──` | `world.avodah.yomKippur(step)`: the Kohen Gadol's choreography |
| `src/actors.js` `// ── yk ──` | items `machtaGold`, `ykKetoret`, `goral`, `kalpi`; poses `semicha`, `raise`, `carry`; gesture `flick` |
| `src/actors.js`, `src/animals.js`, `src/avodah3d.js` `// ── world api (s4) ──` | every promise on time; `partPosition`, `facing`; the lambs' chamber choice |
| `test/scenes.cjs` | end-to-end in the real build, phone + desktop: every stop, the wash gate, the Ark chain, every YK chapter, phone framing |
| `test/avodah3d.cjs` | the life lab: the YK steps, the new world API, promises with no frames |
| `test/sanctuary.cjs --quick` | anchors, the gate view, the wicket route, focus / exit on time with slow or no frames |

Opened with `window.__openScenes('tour' | 'ark' | 'yk', ms)` from the Phase B home and the Phase A menu (main.js `// ── scenes ──`).

## 2. The cards

`C(list, id)` reads a content JSON item, `I(id)` an info.js card, `DR(t, d, s)` is a draft of ours. Wave 3 added:

* `SC(id)` — a card from `content/scenes.json` → `tour` (13 cards, CONTENT agent, verified quotes only).
* `YC(id)` — a Yom Kippur card from `content/scenes.json` → `yom_kippur_script` (what the player sees, `sees_he`, and the
  verbatim `line`), titled from `content/yom_kippur.json`. The script's `do_not_show_he` rules are kept by the choreography.
* A card with `needs_check: true` shows a second chip "בבדיקה".

Where `scenes.json` has the item, its card replaced the older one:

| stop | cards (in order) |
|---|---|
| courts | `tour_courts`, azara, ezrat-nashim, nikanor |
| kiyor | `tour_kiyor`, kiyor_place, ben_katin_spigots |
| altar | altar, `tour_red_line`, kevesh, `tour_altar_rings`, maaracha, shitin |
| lambs | `tour_lambs`, six_checked_lambs, beit-hamoked |
| pens | `tour_pens` (the old "הדיר" draft is gone), animal_dealers, torah_blemishes |
| chambers | `tour_avtinas`, beit_avtinas, grinding_chant, `tour_north_chambers`, salt, parva, rinse |
| ulam | `tour_ulam`, ulam_beams_chains, ulam_tables, heichal_doors, heichal_wickets |
| wash | kiddush_how, kiddush_when |
| heichal | `tour_heichal`, heichal_dimensions, heichal_gold, `tour_vessels`; subs: menorah…, shulchan…, gold_altar, parochot (`tour_parochot`, parochet) |
| kodesh | `tour_kodesh`, upper-openings |

Drafts of ours that stay (no scenes.json card): the Ark "מצא את האבן" and "מסורת מאבותיהם" cards, the YK lots card and the
confession card. The lots card was corrected to Yoma 3:9 (the goats and the kalpi stand "in the east of the azara, north of
the altar"; the bull of the confession stands "between the Ulam and the altar", Yoma 3:8) — paraphrased, no quote marks,
until the CONTENT agent supplies the verified lines.

The Yom Kippur chapters now follow the Mishnah's order: immersions → white garments → **confession over his bull (3:8) →
lots (3:9–4:1)** → ketoret entry (5:1) → Even HaShtiya (5:2) → sprinkling (5:3) → before the parochet (5:4) → taking out
the machta (7:4) → the feast (7:4). The count of the sprinklings reads `yom_kippur.json` → `count_he`.

## 3. The Yom Kippur choreography — `world.avodah.yomKippur(step, { onCount })`

Each step first sets its stage at once (so chapters can be skipped or taken in any order), then plays a short motion.
A newer step cancels what is left of the older one (its promise resolves `false`). `ykState()` reports the stage.

| step | stage | motion |
|---|---|---|
| `immersion` | Kohen Gadol in gold; the linen sheet on the parva's roof | he walks into the rinsing chamber (its stair goes up to the roof, Middot 5:3) and is gone — the camera stays outside (Yoma 3:6) |
| `white` | in white; the sheet | seen a moment on the roof beside the sheet, then down and toward his bull |
| `confession` | the bull on the first landing of the steps, head south, face west; he east of it facing west (Yoma 3:8); the people | `semicha` — both hands on the bull; the people bow (`world.avodah.bow`) and rise |
| `lots` | two goats, the kalpi, the Segan at his right and the head of the father's house at his left (Yoma 3:9, 4:1) | he bends into the kalpi, raises the two gold lots, sets one on each goat's head |
| `ketoret` | in the Heichal | machta in his right hand, kaf in his left (`ykKetoret`, Yoma 5:1), walks to between the parochot at the south and goes in (out of sight); comes out and prays briefly |
| `even-shtiya` | the Kodesh HaKodashim watch view | he sets the gold machta on the stone |
| `sprinkle` | the same view | eight `flick`s of the hand, "כמצליף", `onCount(0…7)` drives the panel's count; the mizrak is shown empty — no blood (§2.9) |
| `parochet` | the Heichal, before the parochet | eight flicks toward the curtain — the motion only, no marks |
| `machta-out` | the watch view | he comes in, bends, lifts the machta (`raise`) and carries it out (Yoma 7:4) |
| `exit` | at dusk, in his own clothes | the people escort him east through Nikanor (Yoma 7:4 "ומלוין אותו עד ביתו") |
| `end` | — | everything of the service removed; ambient life restored |

The camera never walks his path inside the Kodesh HaKodashim: those chapters use the sanctuary's fixed watch view, reached
with a fade. Places and poses where the Mishnah is silent are illustration.

## 4. World API added this wave (all backward compatible; every call is optional for the gameplay)

**world.sanctuary**
* `anchor(id) → [x, y, z] | null` — `gate`, `gate-in`, `gate-out`, `wicket-north`, `wicket-south`, `gold-altar-top`,
  `shulchan-east`, `shulchan-west`, `shulchan-top`, `shulchan-stack-east`, `shulchan-stack-west`, `menorah-stone` (top step),
  `menorah-stone-1…3`, `menorah` (the middle of the lamps), `parochet`, `parochot-south`, `even-shtiya`,
  `ulam-table-marble`, `ulam-table-gold`. Aliases: `golden-altar-top`, `great-gate`, `wicket`.
* `focus('heichal-gate', ms)` — inside the Heichal facing the great gate. Also `focus('parochot-south')`, `focus('parochet-front')`.
* `enter('heichal', { via: 'wicket' })` — Tamid 3:7 / Middot 4:2: to the northern wicket in the Ulam, a cut through the cell,
  inside before the shut gate, which opens from inside; resolves when it is open. ⚑ owner option. The default walk-in is unchanged.
* `state.menorahAxis` — `'ew'` (default) or `'ns'`: the line along which the seven lamps stand; decides which lamp is "the
  western lamp" (`setLamps` index 0: with `'ew'` the second from the east, with `'ns'` the middle one). ⚑ owner decision.
* On time: walks, tweens, waits and fades advance by the wall clock as well as by `update(dt)`, and a wall-clock backstop ends
  each one if no frame comes. A quick `focus` (ms < 4 s) across the house's threshold — from outside in, or from inside out
  to a place in the courts — is a cut; a quick focus during a walk-in ends the walk there. `exit()` takes at most 4 s, and
  `enter()` with no duration is brisk (doors open at once, ≤ ~5 s) so it answers within the gameplay's 6 s guard
  (ketoret.js). Measured with slow frames (one 0.6 s update every 0.7 s): focus 900 ms → 2.1 s, with no frames at all →
  2.6 s (backstop), enter() 5.6 s, exit() 4.9 s (was 11.3 s), a quick focus from inside out 2.1 s.
  **The cause of the 6.9 s timeout:** the loop clamps dt per frame (0.05, or `__DT_MAX` in tests), so under SwiftShader
  (2–3 s a frame) a 1.6 s motion took several wall-clock seconds, and with a paused loop it never ended.

**world.avodah**
* `animal.partPosition(part, side?) → [x, y, z]` — `ear eye nose lip mouth head horn beard neck body back tail leg hindleg
  hoof`; the head parts follow the head as it is drawn; `side` = `left | right` (default: the side nearer the camera).
  `animal.facing` (yaw; 0 = facing south, +z), `animal.forward` ([dx, dz]), `animal.scale`.
* `lambsChamber.positions() → [{ i, x, y, z, yaw, head }]`, `lambsChamber.pick(raycaster) → i | -1`,
  `animal('lamb', 'lambsChamber', { index: i })` — that lamb walks out; the last one steps over into its stall.
* `kohen().walkTo(place, { speed, maxSec })` — `maxSec` makes a long way faster so the walk ends within it.
* `yomKippur(step, opts)`, `ykState()` (above).
* On time: every promise (walk, face, pose, gesture, wait, fade-out) resolves: walks keep pace with the wall clock, and a
  wall-clock backstop (1.6 × its duration + 2.5 s) finishes the motion if no frame comes. **The cause of the 15 s walkTo
  timeouts:** the same clamped dt — the simulation ran slower than the wall clock (and not at all while a screenshot
  blocked the main thread), so a walk was still under way when the gameplay's 15 s guard expired.

## 5. Phone framing (390×844)

`main.js measureSafeArea` moves the camera's principal point above `.sc-root .sc-panel`. On a portrait phone the world's
32° lens then sees only about 15° × 17° above the panel, so each tour stop was measured by projection (no rendering: the
subject's points through the camera with the same view offset) and given a portrait pose where needed: the courts (from the
east, high), the altar (from the south along the kevesh), the pens, the Ulam (up at the top of the doorway and the golden
vine — the whole 20-amah doorway cannot fit from inside the Ulam), the Heichal (on the axis, so the Shulchan, the golden
altar and the Menorah all fit), the Kodesh view (from the west wall), and a farther, higher camera for the outside focus
views (kiyor ×2.5, mechanism ×2, lambs ×1.5, parva ×1.4). `test/scenes.cjs` checks every stop this way on the phone.

## 5b. Wave 4 (26 Sep 2026): the panel, the vine, the frames

**The panel** (`src/avodah/scenes/index.js`, QA P1-5, P2-2, P2-16, P2-19):
* Colours are `--sc-*` tokens in the Phase B palette, with a dark set that follows `prefers-color-scheme` and the Phase B
  switch (`:root[data-theme]`). Every text/background pair is ≥ 4.5:1 — the gold buttons were white on #B8862B (3.24:1); now
  white on #7E5210 (6.8:1) in light and #1D1406 on #E4B656 (9.6:1) in dark.
* Every control is ≥ 44 px high: the tabs, "הבא", "הקודם", "דלג לסוף" and the close button (44 × 44, the game's ✕ icon);
  the stop chips keep a 32-px pill inside a 44-px hit area.
* The locked stops show the game's own SVG lock (src/game/ui.js `ICON.lock`), not an emoji; a locked chip has an
  aria-label that says why; the current chip has `aria-current="step"` and is scrolled into view after every render.
* **Wide screens** (≥ 980 px and landscape): the panel docks at the right, full height under the top bar. main.js
  (`// ── world ──`) moves the camera's principal point to the middle of the part left of it (a horizontal view offset), so
  nothing the stop shows is ever under the panel (QA P2-18: the Even HaShtiya sat under the centred desktop panel); a
  bottom-docked panel over the middle of a wide screen lifts the subject the same way as on a phone. The part left of the
  panel is nearly square, so the stops use their portrait poses there (`POSE` → `SIDE()`).

**New frames** (measured by projection, phone 390×844 and desktop 1280×720; `test/scenes.cjs` checks both):
| stop / chapter | frame |
|---|---|
| tour · Ulam ("האולם וגפן הזהב") | the golden vine over the Heichal's doorway, seen through the Ulam's 20 × 40 opening from the south-east, above the altar's column of smoke. The opening's edge hides its southern pole from any angle clear of the smoke (⚑ an on-axis view would look through the smoke) |
| tour · pens ("הדיר ושוק הבהמות (המחשה)") | from the east, down into the market yard (pens.js: three dealers' stalls with awnings, tables, a money box and a balance, roped pens with animals, buyers; the dove sellers), the folds behind; the stop fills the folds to 72 animals |
| YK 2 · white garments | the Kohen Gadol in white beside the linen sheet on the parva's roof (QA P2-17); he now stays there 4.6 s (avodah3d `── yk ──`) |
| YK · Kodesh watch view | re-posed for the room's own lens (64° on a phone, 50° on a wide screen): the whole Even HaShtiya, the Kohen Gadol east of it and the parochot behind |

**The Even HaShtiya** (sanctuary.js, QA P2-14): a pale natural rock with an outline of broken facets, a flat top at the full
three fingerbreadths (Yoma 5:2) with a short steep edge, weathered hollows, a darker band down its sides and a soft glow of its
own in the dim room. Its extent (about 6 × 5 amot) stays an illustration.

**The golden vine** (stages.js, QA P1-3): hung whenever the Ulam is finished — its stems on the cedar poles and a first foliage
(44 leaves, 6 grapes, 2 clusters) — and growing with the player's leaves, grapes and clusters (G.vine, through main.js); the
finished Temple (demoMode: Phase B, the tour, the whole view) and the investor demo show it grown (300 leaves, 96 grapes, 30
clusters). The Ulam's key moment hangs it in the world at its first gold beat, behind the moment's card.

## 6. Open ⚑ for the owner

* The opener's route by the northern wicket (Tamid 3:7) — offered as `via: 'wicket'`; the tour and the gameplay still walk in
  through the open gate. Which should the morning Tamid show?
* The wickets' size and exact place beside the gate; the kalpi's form; the linen sheet's place on the parva roof; the escort's
  route; the Kohen Gadol's "own clothes" (a plain white mantle): illustration.
* In the Kodesh HaKodashim watch view the Kohen Gadol is seen dimly (placing the machta, the eight flicks, taking it out).
  Keep him visible there, or show only the machta and the cloud?
* Wave 4: the Even HaShtiya's size and shape (a pale rock about 6 × 5 amot, three fingerbreadths high); the golden vine's
  first foliage when the Ulam is finished (a vine "standing" before any volunteer's leaf, Middot 3:8) and its grown state in
  the finished Temple; the animal market's place in the pens yard and its stalls; the side panel on wide screens.
