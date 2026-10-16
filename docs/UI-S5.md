# UI-S5 — UI polish, wave 4 (2026-09-26, motzaei Shabbat)

UI agent, branch `s5-ui` (worktree `/home/claude/wt/crews`), from master 140cf73. Scope: the UI items of the QA report
(docs/QA-S2.md) and a responsive audit on five more screen sizes. Every change is CSS in the UI's own stylesheets, or a
small edit marked `── ui ──` in `src/game/ui.js`, `src/avodah/ui.js` and `src/main.js`.

**Evidence.** Screenshots and audits are in `test/out/qa-ui/` (git-ignored, PROJECT.md §13: they stay on this machine):
- `after/<viewport>/U*.png`: this branch, with the 3D frame rendered (light and `-dark`), and contact sheets
  `after/<viewport>-contact*.png` (every shot of a viewport on a few pages);
- `before/<viewport>/U*.png` (master, six viewports) and `before2/` / `after2/` (master and this branch, small, tabletP
  and desktopXL, the same walk code): DOM-only (`--norender`, the canvas shows the boot frame), with their audits
  `<folder>/<vp>-ui.json` behind the tables in §2;
- `e2e-branch/`: game-e2e's screenshots of this branch (phone 400 and desktop 1280);
- the shader runs `shaders-before.json`, `shaders-after.json` and `shaders-after-final.json`.
Viewports: small 360×640, phone 390×844, large 430×932, tabletP 768×1024, tabletL 1024×768, desktopXL 1440×900.

**Before and after, side by side** (git-ignored, on this machine):
- `test/out/qa-ui/compare-phone-before-after.png` (390×844, pairs left → right): the opening title (QA's own
  `phone/02-A-vision.png` → now); a stage card with the coach's bubble under it → none; a tap on the altar in Phase B
  showing nothing → the card above the home; the Middot book "34/1 נפתחו" and faint locked rows → "נפתחו 1 מתוך 34".
- `test/out/qa-ui/compare-tabletP-before-after.png` (768×1024): the map sheet over the goal pill, the coach's bubble
  over the caravans sheet, the tap card over the Phase B home → each clear of the other.
- `test/out/qa-ui/compare-small-strip-before-after.png` (360×640): the investor strip.

## 1 · What changed, by QA item

| QA item | what it was | now | where |
|---|---|---|---|
| P1-5, P2-11, P2-12 · touch targets | the investor strip 26 px high, round buttons 40, sheet close 34, `.gm-btn` 40, small buttons 34, mishmar chips 30–40, switches 28, the moment's "דלג" 32×25, Phase B's "דלג" 36×29 | every one of them ≥ 44×44 (details below) | `src/game/ui.css.js`, `src/avodah/ui.css.js`, `src/page.html` |
| P2-1 · the tap card behind Phase B | `#card` z 4, under `.av` (30) and the tour (40) | z 45 in Phase B and the tour; on every screen it sits **above whatever panel is docked under it** and fits between that panel and the top bar | `src/page.html`, `src/main.js` (`measureDock`) |
| P2-3 · small gold text | #A97A1E on cream, 3.46–3.55:1 | #855E14, 4.9–5.7:1 on every cream panel; dark mode unchanged (8.5:1) | both stylesheets |
| P2-3 · locked rows | the whole row at 55 % opacity, 2.38:1 | soft ink (6.1:1), a dashed outline for locked map nodes | both stylesheets |
| P2-4 · the opening title | cream text in a gold halo over the glowing plan | cream on a soft dark band, dark shadows | `src/game/ui.css.js` |
| P2-5 · the coach under a card | the next step's bubble showed below the modal | the coach's bubble and hand wait while a modal card is up | `src/game/ui.css.js` |
| P2-8 · reversed counters | "34/4 נפתחו", "(13/0)", "(1/15)" | "נפתחו 4 מתוך 34 · נקראו 2", "(0 מתוך 13)", "(1 מתוך 15)" | `src/game/ui.js:423`, `src/avodah/ui.js:192–193` |
| P2-9 · the build's size | "built 1563 KB" (UTF-16 characters) | `built dist/temple3d.html: 1,963,877 bytes (1.87 MiB), gzip 597,020 bytes (0.57 MiB)`, and a warning over 2,000,000 bytes | `build.mjs` |
| P2-10 · the first-entry hitch | 79 programs compiled on the service's first night frame | 12; boot makes 91 programs instead of 154 | `src/main.js` (`precompile`) |
| P2-15 · the Musaf tile | "מוסף (של שבת)" listed under "המשך היום" on a day with no Musaf | on those days the tile "מוסף של שבת · אין מוסף היום" is under "שבת ומועד" | `src/avodah/ui.js:144` |
| found here · a page error | "Cannot read properties of null (reading 'classList')", 2 of 6 runs on master: the tutorial's timers fire after Phase B has replaced Phase A | the HUD ignores `coach`, `openSheet` and `closeSheet` once destroyed (0 errors in every run of the branch); the timers themselves are the game's (§5) | `src/game/ui.js` |
| found here · tablets | the side sheet covered the goal pill; the coach's bubble and the toasts lay over the sheet; the tap card covered the Phase B home | see §2 | `src/game/ui.css.js`, `src/page.html`, `src/main.js` |

### Touch targets (P1-5, P2-11, P2-12)
The rule: a control is at least 44×44 CSS px. Where the look must keep its size, an invisible hit area does it: an
absolutely positioned `::after` (or `::before` where `::after` is taken, as on the switch's knob) that extends the
control. Hit testing counts a pseudo-element as its element, so the tap lands on the control. The inset of a
pseudo-element counts from the padding box, so a 1 px border adds a pixel (the first try gave 42 px; the audit caught it).

| control | look | hit area |
|---|---|---|
| ☰ and 🔊 (`.gm-rb`) | 40 px circle | 44×44 |
| sheet close (`.gm-x`) | 34 px circle | 44×44 |
| goal pill (`.gm-pill`) | ≥ 38 px high | ≥ 44 high |
| investor strip ("הרגע הבא ✦", "דלג לפרק הבא") | 28 px pills, 12 px type (11 px under 400 px, so the strip fits 360 px on one line) | 44 high; it grows downward, since the goal pill sits right above |
| `.gm-btn` | 44 px | 44 |
| `.gm-btn.sm` | 36 px | 44 |
| crew choices and quiz answers (`.gm-seg`) | 38 px | 44 |
| Middot chapter tabs | 38 px (the scroller got 4 px of padding, so the hit area is not clipped) | 44 |
| map nodes | 36 px, rows 10 px apart | 44, no overlap between rows |
| the 24 mishmar chips (Phase A and B) | 40 px, at least 44 wide | 44 |
| switches (`.gm-sw`) | 48×28 track | 52×44 |
| the Middot book's rows, Phase B's book rows, status pill, chips | 44 px | 44 |
| the moment's "דלג" (`.gm-mo-skip`: it lives in `ui.css.js`, not in the CSS that `moments.js` injects, so that block is untouched) | underlined text | 44×44 (the hint keeps 44 px free at its end, so the two never touch) |
| Phase B's "דלג" | underlined text | 44×44; the mini-game header keeps 40 px free for it |
| page chrome: "א", the card's ×, the view chips | 44 / 30 / 38 px | 44 |

Not mine, and still small (requests in §5): the tour panel's tabs, stop chips and buttons (WORLD), and the hooks' strip
under the goal pill (`.gm-next button`, 26 px; HOOKS).

### The tap-to-identify card (P2-1)
`main.js` measures the panel docked at the bottom under the card every 250 ms and when the card opens: the Phase B home
and its cards, the tour panel, a Phase A sheet. Side panels on wide screens (the Phase B home at the left, a Phase A
sheet) are not under the card, so they do not count. The height goes into `--ui-dock`, and `page.html` places the card at
`max(its usual bottom, --ui-dock + 10px)` with a height that ends 132 px under the top of the screen (the top bar and the
service's progress pill stay visible). The card is z 45 in Phase B and the tour.
Shots: `after/<vp>/U21-B-tap-card-over-home.png` and `U27-B-tap-card-over-tour.png` on every viewport.

### Contrast (P2-3)
| text | before | after (light) | dark |
|---|---|---|---|
| gold kickers (המטרה, הבנייה הושלמה, רב האומנים, the Phase B kickers, the ladder's numbers) | #A97A1E, 3.46–3.55:1 | #855E14, 4.9–5.7:1 | #E4B656, 8.5:1 (unchanged) |
| locked rows (Middot book, map, Phase B's book and ladder) | opacity .55, 2.38:1 | soft ink #6B5A45, 6.1:1 | #C2B195 |
| faint ink (Phase B's step numbers, the vessels) | #9A8A73, 3.1:1 | #776750, 5.1:1 | #A39377, 5.4:1 (was 4.1) |
| green success text | #2E7D4F, 4.19:1 | #276B43, 5.9:1 | unchanged |
| the live badge "חי" (dark mode) | white on #FF6B5B, 2.8:1 | white on #B3261E, 6.5:1, both themes | |
| Phase B badges ("לימוד") | soft ink on the bar, 4.37:1 | ink | |

Phase B keeps `--av-gold` for fills (the hooks' dots and bars); the text uses a new `--av-gold-text`.

### The shader programs (P2-10)
`test/qa-shaders.cjs` boots `#avodah` at 390×844 on SwiftShader, renders the first Phase B frame, waits 30 s (a player
reads the first cards), switches to night (what the morning service does before dawn), renders, and walks into the
Heichal. Final runs back to back on the same machine: `shaders-before-final.json` (master) and
`shaders-after-final.json` (this branch).

| | before (master) | after |
|---|---|---|
| programs after boot | 154 | **91** |
| the Phase B entry, 0.7 s after its first card | — | +64 programs (the night set): 189–678 ms of JS, depending on the load; the GPU compiles them while the player reads |
| new programs on the first Phase B frame | 0 | 3 (shadow-map depth variants) |
| **new programs on the first night frame** | **79** (51 standard, 6 basic, 4 depth, 18 custom) | **12** (11 standard, 1 depth) |
| new programs on the first frame inside the Heichal | 0 | 0 |

What was happening:
- A program depends on the target a frame is drawn into, and on the number of lights. The boot's `renderer.compile()`
  ran while the canvas was bound, so it made tone-mapped sRGB variants that no frame uses (the frames are drawn into the
  composer's HDR buffer). `stages.prewarm()` already compiled the right variants. The boot compile now binds the
  composer's target: 63 fewer programs, less work behind the loader.
- The QA's "152 → 228" was not the Heichal: the first walk inside compiles nothing, in either build. It was the
  **night**: the service's first games run before dawn, and the menorot's four point lights (`life.js`) change the light
  count of every material. At the Phase B entry the scene is compiled once more with every light on. Nothing is drawn,
  and nothing waits for the driver: `compileAsync` where it compiles in parallel (`KHR_parallel_shader_compile`), a
  plain `compile()` elsewhere, which issues the programs and leaves the link to the GPU process. `window.__UI_COMPILE`
  logs each run.
- **Frame times.** On SwiftShader the first night frame took 70 s before and 79 s after (load 10–13). SwiftShader's
  frame time is not the measure here: a new program's link status is the frame's first sync point, so that frame waits
  for all the GPU work queued before it (the shadow map, the new environment map), and SwiftShader (ANGLE on Vulkan)
  also builds its pipelines at the first draw. The second frame's JS time is 6–23 ms in both. On a phone's GPU the cost
  that moved is the compile and link of 67 programs (tens of ms each), from the first game of the service to the
  entry's first card.
- The 12 left are made after the entry (materials created for the night or on first use). The real fix is upstream
  (§5): keep the menorot's lights in the scene at intensity 0, as `life.js` already does for the altar's fire light;
  then no light switch ever recompiles, in Phase A or B, and the entry's precompile can go.

## 2 · The responsive audit (task 10)

`node test/qa-walk.cjs small,phone,large,tabletP,tabletL,desktopXL --parts=ui [--bundle=…] [--out=…] [--norender]`

The `ui` part sets every layer up directly, with no play, so one viewport takes 2–7 minutes:
- the first 3D frame; the opening title; the HUD with the coach; the investor strip;
- every sheet (crews, caravans, the Middot book and its locked rows, today, the map, the menu, a stage);
- a stage card while the coach speaks; the name and mishmar prompt; two key moments (the great stone, the seven gates);
- Phase B from the menu: the name prompt and the intro; the home's three tabs (today, and scrolled to its end); the tap
  card over the home; a mini-game panel and its source card; the tour panel, with the tap card over it.

Each screen is audited and screenshotted in light and dark. The audit is QA's (docs/QA-S2.md), with four changes:
- touch targets count an invisible hit area;
- text that reaches a HUD root with nothing behind it is text over the 3D world (it was scored against the page's
  background);
- a panel drawn over another layer by design (a sheet over the dock, the tap card over the Phase B home) is not an
  overlap of text;
- rows scrolled out of their scroll box are not visible.

**Distinct findings per category, DOM-only runs with the same walk code** (`before2/` = master, `after2/` = this branch,
27 screens × light/dark = 47 audits per viewport; "mine" leaves out the tour panel, the hooks' strip and the kiddush
mini-game's own labels, which belong to other owners):

| viewport | contrast < AA (mine) | touch targets < 44 (mine) | overlapping text (mine) | clipped (all) | off-screen, overflow, horizontal scroll | page errors |
|---|---|---|---|---|---|---|
| small 360×640 | 61 → **1** | 71 → **1** | 0 → 9 (below) | 1 → 1 | 0 → 0 | 0 / 0 |
| tabletP 768×1024 | 134 → **1** | 82 → **1** | 3 → **0** | 2 → 2 | 0 → 0 | 0 / 0 |
| desktopXL 1440×900 | 112 → **1** | 80 → **1** | 0 → 0 | 4 → 4 | 0 → 0 | 0 / 0 |

**Touch targets on all six viewports** (`before/` DOM-only vs the rendered `after/` runs):

| viewport | mine | all (with the tour panel) |
|---|---|---|
| small 360×640 | 71 → 1 | 80 → 10 |
| phone 390×844 | 74 → 1 | 83 → 10 |
| large 430×932 | 76 → 1 | 85 → 10 |
| tabletP 768×1024 | 81 → 0 | 93 → 12 |
| tabletL 1024×768 | 81 → 0 | 93 → 12 |
| desktopXL 1440×900 | 82 → 1 | 96 → 15 |

What is left, and why:
- The one control: "יכין", the narrowest mishmar chip (41 px wide), in the first runs, and the crew "−" (42 px) in the
  last ones. Both fixed after those runs (chips at least 44 px wide; the small buttons' hit area 3 px wider each side).
- The one contrast finding is the crew "+" button while it is disabled (opacity .5); WCAG exempts inactive controls.
- The overlaps on 360×640 are two things. The last row of mishmar chips is half scrolled out of its list, and the
  audit measured its whole box: the tool now clips a box to its scroll container. And a tutorial card
  ("אלף כהנים אומנים") opened over a replayed key moment. The walk replays moments during the tutorial, which a player
  cannot do. But the same card over the great-stone moment shows in game-e2e's demo run
  (`test/out/qa-ui/e2e-branch/game-e2e-ring-400.png`), so it is a real flow issue in `#demo` (§5).
- The clipped row is the tour's stop chips (WORLD, P2-19).

### Fixed in the responsive pass
- **Tablets (768–1000 px):** the Phase A sheet is a side panel from 760 px, but the HUD stays centred, so on a tablet the
  sheet covered the goal pill, and the coach's bubble and the toasts lay over the sheet. The sheet now stops under the
  pill and its strip; while a sheet is open, the bubble and the toasts move to the free part of the screen, right of it.
- **360 px:** the investor strip ran to 7 px from both edges of the screen; it now keeps a 20 px margin
  (`before/small/U04-A-demo-strip.png` vs `after/small/U04-A-demo-strip.png`).
- **The Middot book:** a line break left a lone "." on its own line.

### Checked and fine
I looked at every screenshot of the rendered `after` runs (contact sheets `test/out/qa-ui/after/<vp>-contact*.png`,
light and dark), and at the full-size frames where something looked off.
- **small 360×640, phone 390×844, large 430×932.** Phase A: the HUD, the goal pill and the investor strip on one line;
  bottom sheets (74 vh) with the coach's bubble moved above them; the stage card with no bubble under it; the name
  prompt (the mishmar chips scroll inside 30 vh); the key moments' card at the bottom with "דלג" clear of the hint.
  Phase B: the home (66 vh), the tap card between the top bar and the home or the tour panel, the mini-game panel
  docked at the bottom, its source card.
- **tabletP 768×1024.** Side sheets (the fixes above); centred cards; the key moment's card at the bottom (portrait);
  Phase B's side home, the tap card beside it, the mini-game and its card centred.
- **tabletL 1024×768, desktopXL 1440×900.** As on the tablet; the key moment's card on the right (landscape); the tap
  card on the right, above the tour panel where the two meet.
- Dark mode on every screen, except the tour panel (§5, WORLD).
- On 1440×900 a story card of the tutorial opened over a replayed key moment. The replay is the walk's shortcut, but the
  collision is real in `#demo` (above, and §5). The canvas under the DOM-only shots is the boot frame (no render).

## 3 · Tests

On the branch's final bundle (1,964,910 bytes, gzip 597,382), with five agents' browsers on the machine (load 8–13):

| suite | result |
|---|---|
| `node --test test/*.test.mjs` | **101/101** |
| `test/game-harness.cjs` | **93/93** |
| `test/avodah-harness.cjs` | **70/70** |
| `test/moments.cjs --harness` | **94/94** |
| `test/qa-content-scan.cjs` | **11/11** (no Divine Name, 58 tap cards tagged, bundle < 2 MB) |
| `test/qa-walk.cjs <6 viewports> --parts=ui` | 27 screens × light/dark per viewport, **0 page errors** on the branch (master: the classList error in 2 of 6 runs) |
| `test/qa-shaders.cjs` | §1 |
| `test/game-e2e.cjs --only=phone` (400×860, demo) | **31/31** at 19:20 UTC (load ≈ 3): first strike 11.4 s wall, **game side 4.4 s** (the coach at 3.9 s + tap → impact 0.52 s); no console errors. The first run, under load 10–13, gave 28/31: the wall-clock "first strike within 15 s" (34.1 s wall, game side 4.9 s), the rhythm ring (at ×60 the demo had cleared the hill while the test waited), and "no console errors", which counted the world guard's `playTimelapse` timeout and three's "KHR_parallel_shader_compile extension not supported". The precompile caused that second warning; a41c745 removes it (it asks `extensions.has` first, as `stages.prewarm` does). |
| `test/game-e2e.cjs --only=desktop` (1280×800) | **21/21** at 19:15 UTC, when the load had dropped to 3 (boot 9.6 s, first strike 4.9 s wall, game side 4.5 s); master's bundle in the same conditions just before: 21/21. The first run, under load 10–13, gave 19/21: "first boulder shattered" and "the rhythm ring shows after a strike" failed because the test taps where the coach's hand was before a 2-frame render, and that render took over a minute, long enough for the camera to move and the tutorial's story card to come up and hold the builder (`test/out/qa-ui/e2e-branch/game-e2e-ring-1280.png`). "no console errors" passes with a41c745 in both runs. |

## 4 · ⚑ Decisions for the owner
- **Gold text is darker in light mode** (#855E14 instead of #A97A1E), for AA contrast. The gold fills, buttons and
  bars keep the bright gold. If the brand gold must be exact, the alternative is 13 px bold kickers (AA "large" is 14 px
  bold or 18.66 px), which would change the layout more.
- **The Phase B night precompile costs ~64 programs** at the entry, on every visit, even at noon, since a player who
  opens the morning service meets the night. That is a few hundred ms of GPU work behind the first card, against a
  hitch at the first game. The alternative is the upstream fix in §5, which removes both.

## 5 · Requests to other owners
- **WORLD** (`src/avodah/scenes/index.js:80-90`, the tour panel):
  - touch targets (P1-5): the tabs "סיור / איפה הארון? / סדר העבודה" are 32 px high, the stop chips 26–27, "הבא", "הקודם",
    "✕", "המשך", "דלג לסוף" and the Heichal's vessel buttons 31–32. `min-height:44px`, or a hit area as in §1;
  - "הבא" and "המשך" are white on gold, 3.24:1 (P2-3): ink on the gold, as `.av-btn.gold` (#2A1A04, ≈ 11:1);
  - the panel stays cream in dark mode (P2-2): `after/*/U26-B-tour-panel-dark.png`;
  - the active stop chip scrolls out of view (P2-19); the audit's one `clipped` finding on every viewport is that row.
- **HOOKS**:
  - `src/game/hooks/index.js:45`: the strip under the goal pill (`.gm-next button`, padding 4px 10px) is 26 px high.
    It sits 5 px under the pill, so a hit area should grow downward, e.g. `position:relative` and
    `::after{content:"";position:absolute;inset:-4px -2px -14px}`.
  - `src/avodah/ui.css.js:362` (their block): `.hk-bulls span.now` is ink on #A97A1E, 3.6:1. `var(--av-gold-hi)` as the
    background gives 7.5:1.
- **AVODAH** (the kiddush mini-game, `after/*/U25-B-minigame-card*.json` audits): the white 10 px label "רגליים" on
  light grey (1.6:1). The world-ring labels (P2-3) are theirs too.
- **LIFE / WORLD** (`src/life.js:232` and `apply()` at :300): keep the four menorot point lights in the scene at
  intensity 0 by day, as the comment at :295 already does for the altar's fire light. Then the light count never
  changes: no recompile at night, in Phase A (where lights 0 and 1 serve the construction site) or in Phase B, and the
  Phase B precompile in `main.js` can go.
- **Game systems** (`src/game/index.js`):
  - `destroy()` (:218) does not clear the tutorial's `ftueTimer` (:819–820): when Phase B or the tour replaces Phase A
    in the first seconds, `crewArrives()` / `meetPriests()` still fire and reach the HUD after it is gone. The HUD now
    ignores those calls; clearing the timer is the real fix.
  - The tutorial's story card "אלף כהנים אומנים" (the 9 s timer at :820) can open over a key moment: in game-e2e's
    `#demo` run it covers the great-stone moment (`test/out/qa-ui/e2e-branch/game-e2e-ring-400.png`), and the investor strip's "הרגע הבא ✦"
    can start that moment inside those first seconds. Holding the timer while a moment is up (`momentBusy`) would fix it.
  - A new player at night also meets the light switch right after the loader; the LIFE fix above covers it.
