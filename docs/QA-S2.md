# QA — Sprint 2 wave 3: an independent check of v10 (master 7e9b008)

QA agent, 2026-09-25, branch `s4-qa` (worktree `/home/claude/wt/qa`). I did not build any of this; it is a skeptical
first-time-player pass over the build published this morning as v10, before the owner and his investors see it.

**Evidence.** Screenshots are in `test/out/qa/` of my worktree. That folder is git-ignored (PROJECT.md §13), so the
files stay on this machine: `/home/claude/wt/qa/test/out/qa/phone/…`, `…/desktop/…`, plus zoomed crops in
`/home/claude/wt/qa/test/out/qa/zoom-*.png`. Each screen's DOM audit is in `test/out/qa/<vp>-<part>.json`, and the run
logs are in `test/out/qa/*.log`. The background chain's shots (`/home/claude/temple3d/test/out/…`) come from the same
bundle: `dist/test.html` has md5 `74b0aaf3…` in both trees, and b207bc2 on master changed only PROJECT.md.

**What I added** (tests only, no game code):
- `test/qa-walk.cjs` walks the first-time player on the real build. Every screen is screenshotted in light and, where
  it matters, dark. Each screen gets a DOM audit for:
  - cut-off, clipped or off-screen text;
  - overlapping text;
  - touch targets under 44 px;
  - WCAG contrast;
  - RTL;
  - a Divine Name in the rendered text;
  - a sourced card without "טיוטה".

  It also measures draw calls, triangles, vertices, heap and long tasks.
- `test/qa-content-scan.cjs` scans the bundle and the repo for Divine Names, checks the draft tags on the info cards and
  checks the bundle size.
- `test/qa-audit-summary.cjs` summarises a walk's audits.

**How to reproduce.** First `node build.mjs`, then:
- `node test/qa-content-scan.cjs` runs the static scan (no browser).
- `NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/qa-walk.cjs phone --parts=first` runs the first-time
  player (fresh localStorage, the real Jerusalem clock).
- `… qa-walk.cjs phone --parts=demo,mine` runs the investor path.
- `… qa-walk.cjs desktop --parts=first --lite` runs the desktop pass.

The phone walk takes about 50 minutes and the investor path about 25 minutes on this loaded machine. The phone run was
made on 2026-09-25 around 12:45–13:35 Jerusalem time: Friday, 14 Tishrei, Erev Sukkot. Phase B was live in "קרבנות
העולים לרגל".

Priorities:
- **P0**: broken, blocking, or embarrassing in front of an investor. It also covers a visible break of a
  non-negotiable content rule (PROJECT.md §2).
- **P1**: visible quality.
- **P2**: polish.

Line numbers refer to master 7e9b008.

## Verdict

v10 is **stable and mostly on-content**. It showed **zero console or page errors** across:
- a 50-minute first-time session on a phone, and a 65-minute one on desktop;
- the whole investor path;
- all 12 suites, which are green apart from one wall-clock flake. I found no stuck state: every card, scene and phase switch
had a way forward and a way back.

The content rules hold in the shipped bundle:
- no Divine Name in any form;
- every in-game card is tagged "טיוטה" except the legacy tap-to-identify cards;
- the shechita is a respectful cut-away with no gore;
- there is no Ark anywhere.

The world is at its best in the finished Temple, the Heichal's gold interior, the Yom Kippur chapters and the Chanukat
HaBayit frame.

It is **not yet safe to hand to an investor as-is**, for three reasons, all small fixes:
- the highlight reel is pulled into Phase B halfway, before its three best moments (P0-1);
- the menu's Phase B and tour buttons are cut off on every screen size (P0-2);
- the tour puts the camera inside the Kodesh HaKodashim outside the Yom Kippur scene, against the owner's §11 decision
  (P0-3, ⚑).

With those fixed, and ideally the draft tags on the info cards (P1-1), the resource bar (P1-2), the pour meter (P1-6)
and the Phase B home framing (P1-8), it will make a strong first impression.

---

## P0 — fix before the investors see it

### P0-1 · The investor's highlight reel ("הרגע הבא ✦") is pulled into Phase B at highlight 5 of 8
- **Repro.**
  1. Open `dist/test.html#demo` with localStorage cleared.
  2. Press "הרגע הבא ✦" five times, pressing the gold "המשך" on every card.
  3. After "המזבח שלם: האש הראשונה" (karnot), a card opens: "המזבח שלם — מקריבים עוד לפני שיש היכל" (Ezra 3:6). Its
     gold button is "לעבודה הראשונה (כ־3 דקות)". A presenter who keeps pressing gold leaves the reel. The demo unmounts
     into Phase B and opens "איך קוראים לך?" (the Phase B name and mishmar prompt).
  4. The three best highlights are never shown: "האולם וגפן הזהב", "ההיכל בזהב" and "האומנים בתיבות".
  5. My first automated run followed the gold buttons and ended exactly there. Its test crashed on
     `__T.game.state === undefined` after the takeover.
  6. The same invitation comes back after highlight 8, as the "חנוכת הבית" card. That one is a natural end.
- **Screenshots.** `phone/D17-G-invitation.png` and `desktop/D17-G-invitation.png` (the card inside the reel). The first run landed on
  `phone/D17-G-hl5-karnot-after-cards.png`, the Phase B name prompt over the altar. That file was overwritten by the
  second run, whose log is `walk-phone-investor.log`.
- **Suspected code.** `src/game/index.js:647`: `if (c.id === 'karnot' && !c.all && await HK.avodahInvite('altar'))
  return;` runs in demo mode too. The card itself is `src/game/hooks/index.js:312-324`.
- **A side effect.** Phase A's demo never writes the real save (`bh_demo`). But the Phase B it hands over to writes
  the real `bh_avodah`, with the presenter's name and a completed ritual.
- **Fix idea.** In `G.demo`, skip the altar invitation. Alternatively, mark `story.avInvAltar` in
  `HD.prepareHighlight`, and keep the finale invitation as the reel's end.

### P0-2 · The Phase A menu's Phase B button and tour button are cut off at both edges (phone and desktop)
- **Repro.**
  1. Use a phone (390×844).
  2. Open Phase A → ☰ (menu).
  3. The gold button's text is "הצצה: העבודה בבית · שלב ב׳ נפתח במלואו בחנוכת הבית — אפשר להציץ כבר עכשיו". On screen,
     the first word "הצצה" is cut off at the right edge, the end ("…כבר עכשיו") is cut at the left edge, and the ★ icon
     is gone.
  4. The tour button is also cut on both sides: "סיור בבית המקדש ההיכל, הכיור … · יום הכיפ".

  This is the investor's door into Phase B and into the tour. The same happens in `#demo` and on desktop (1280×720),
  where the audit reports 4 clipped texts in the menu.
- **Screenshots.** `phone/25-B-menu.png`, `zoom-menu-phaseB-button.png`, `phone/D31-G-demo-menu.png`. On desktop the
  same happens: `desktop/23-B-menu.png`, where the text spills past the sheet's left edge.
- **Suspected code.**
  - `src/game/ui.css.js:94`: `.gm-btn` is `display:inline-flex`, row direction, with `white-space:nowrap`.
  - `src/game/ui.js:526-527`: the `<small style="display:block">` subtitle becomes a flex item on the same line, so the
    title and the subtitle sit side by side in a 358 px button. The audit measured the text runs at 398 px and 432 px
    (`phone-demo.json`, "clipped"). The button is centred, so it spills over both sides, and `.gm-sh-b` clips it.
- **Fix idea.** Give these two buttons `flex-direction:column; white-space:normal`.

### P0-3 · The tour takes the camera inside the Kodesh HaKodashim outside the Yom Kippur scene (content rule; ⚑ owner)
- **Repro.**
  1. Open the Phase B home → "צא לסיור" (or open the tour from the Phase A menu).
  2. Go to "הבא" through stop 10, "קודש הקדשים — צפייה".
  3. The sanctuary state becomes `room: 'kodesh'`. The camera stands inside the Kodesh HaKodashim: pose
     `[-156.5, 28.2, -7.6]`, and the interior is x ∈ [−159, −139]. You see the Even HaShtiya, the parochet folds and
     the gold walls. There is no Kohen Gadol and no Yom Kippur context: it is an ordinary stop of a free tour.
- **The rule.**
  - §2.5: "the player never walks in — only the Kohen Gadol on Yom Kippur enters … and the player watches that scene".
  - §11, 2026-09-25: "Kodesh HaKodashim: built; the player never enters; seen only in the watch-only Yom Kippur
    scene."
  - The tour does use a fade rather than a walk, and it labels the stop "צפייה". But the player's own eye is placed
    inside, in the tour.
  - The Yom Kippur chapters (`yk_even_shtiya`, `yk_sprinkling`, `yk_take_out_machta`) are the sanctioned place for this
    view.
- **Screenshots.**
  - `phone/92-E-tour-10-kodesh.png` (and `-dark`), plus `-c1…c3`.
  - `desktop/48-E-tour-10-kodesh.png`. Here the view is inside, between the folded parochet and the gold wall, and the
    Even HaShtiya itself is hidden under the tour panel.
- **Suspected code.**
  - `src/avodah/scenes/index.js:49`: `{ id: 'kodesh', … go: enter(w, 'kodesh-view') }`.
  - `src/sanctuary.js:868-872` and `:764` (`PATH.kodesh`).
- **Fix idea.** Have the tour stop look at the closed parochot from the Heichal, as in `PATH.parochet`, or from above
  as a cut-away with the roof on. Keep the interior view for the Yom Kippur chapters only. ⚑ The owner decides whether a
  labelled watch-only interior in the tour is acceptable; as written, §11 says no.

---

## P1 — visible quality

### P1-1 · 32 of the 58 tap-to-identify cards have no "טיוטה" tag (content rule §2.2)
- **Repro.** Open the whole-Temple view (☰ → "תצוגת הבית השלם") and tap the altar, the Heichal or the Ulam. You can
  also tap the world in Phase B. The card shows the text and "מקור · מידות ג, א; …" with no draft tag.
- **Affected cards.** The long Sprint-0 cards in `src/info.js`: heichal, ulam, altar, kevesh, kiyor, steps12,
  slaughter, azara, duchan, nikanor, steps15, ezrat-nashim, the four chambers, east-wall, chel, azara-gates,
  beit-hamoked, gazit, har, royal-stoa, chulda, shushan, porticoes, antonia, kotel, robinson, wilson, menorot and about.
  Only the short `D()` cards append " · טיוטה" (`src/info.js:152`).
- **Evidence.**
  - `test/qa-content-scan.cjs` fails on this.
  - Audit `nodraft` on `phone/32-C-tap-world-card.png`. On that screen the card is also hidden, see P2-1.
  - Desktop, in the whole-Temple view: `desktop/72-F-whole-tap-card.png` shows the altar card with no tag.
- **Suspected code.** `src/main.js:230-234` (`showInfo`), `src/info.js:3-146`, `src/page.html:161-166`.
- **Fix idea.** One line in `showInfo`: always render the `pill` "טיוטה" in the card (the page already has the
  `.pill` style).
- **Not affected.** The tour's own cards strip the suffix and add their own tag.

### P1-2 · The Phase A resource bar overflows when a fourth resource appears (phones)
- **Repro.** In `#demo`, go from highlight 6 (the Ulam) onward, when a fourth resource chip joins the bar (four
  counts: 1,485 · 1,180 · 800 · 3,367). A real game reaches this too, once it holds four materials.
- **What you see.** The chips are clipped at both ends: "1,485" loses its first digit under the 🔊 button, and the
  stone chip is cut under ☰.
- **Screenshots.** `phone/D19-G-hl6-ulam.png`, `zoom-demo-topbar-4res.png`, `phone/D21…D24`.
- **Suspected code.** `src/game/ui.css.js:42`: `.gm-res{… justify-content:center; flex-wrap:nowrap; overflow:hidden}`
  with `:239` (the ≤440 px rule). Centring plus `overflow:hidden` cuts both sides.
- **Fix idea.** `justify-content:flex-start` with a horizontal scroll, smaller chips at 4+, or drop the icon's text
  padding.

### P1-3 · "האולם וגפן הזהב" shows no golden vine: not in the demo reel, and not at the tour's Ulam stop
- **In the demo.** The highlight is named for the vine (`src/game/hooks/demo.js:18`), but a demo save has
  `vine.leaves = 0`. So `W.setVine(S.vineSize(G))` (`src/game/index.js:627`) keeps the vine hidden
  (`src/stages.js:2344-2349`: it becomes visible only when n > 0).
- **In the tour.** The Ulam stop opens with the card `golden_vine`, "על פתח ההיכל עמדה גפן של זהב…"
  (`src/avodah/scenes/index.js:45`). The view is the doorway and its curtain, with no vine: Phase B and the tour never
  set the vine.
- **Screenshots.** `phone/D19-G-hl6-ulam.png`, `phone/D20-G-hl6-ulam-after-cards.png`, `phone/82-E-tour-07-ulam.png`.
- **Fix idea.** Give the demo (and the tour or Phase B, since the Temple is "finished" there) a grown vine, for example
  `setVine(40)`. Frame the doorway from the Ulam.

### P1-4 · After the last highlight, "הרגע הבא ✦" stays on screen and does nothing
- **Repro.** In `#demo`, play all 8 highlights and answer "אחר כך" on the Chanukat HaBayit card. The purple strip still
  shows "דלג לפרק הבא" and "הרגע הבא ✦". A press gives no feedback, and my run logged "pressing 'הרגע הבא ✦' did
  nothing within 15 s".
- **Screenshots.** `phone/D27-G-hl8-kodesh-after-cards.png`, `phone/D28-G-hl9-nothing.png`, and the same on desktop
  (`desktop/D28-G-hl9-nothing.png`).
- **Suspected code.**
  - `src/game/index.js:883-887`: `demoNext` returns silently when `prepareHighlight` is null.
  - `src/game/hooks/index.js:92-97`: the button is never hidden.
- **Fix idea.** When `highlightsLeft(G) === 0`, turn the button into "לעבודה בבית ✦", which opens Phase B, or hide it.

### P1-5 · The tour, Ark and Yom Kippur panel, and the demo strip, have touch targets well under 44 px
- **Measured on a 390 px phone, on every stop.**
  - The tabs "סיור / איפה הארון? / סדר העבודה": 32 px high.
  - The stop chips: 26–27 px high.
  - "הבא" 53×31, "הקודם" 65×31, "✕" 37×32, "המשך" and "דלג לסוף" 31 px.
  - The investor strip "הרגע הבא ✦" 87×26 and "דלג לפרק הבא" 98×26. The presenter presses these again and again.
  - Phase A's round buttons 40×40 and `.gm-x` 34×34; Phase B's "דלג" 36×29; the moment "דלג" 32×25; `.gm-btn` 40 px.
- **Evidence.** The audit's `small` list in `test/out/qa/phone-first.json` and `phone-demo.json`.
- **Suspected code.**
  - `src/avodah/scenes/index.js:80-87` (`.sc-tabs button, .sc-btn … padding:7px 12px`; `.sc-stops button … padding:5px
    9px`).
  - `src/game/ui.css.js:53-55` (`.gm-demo button{padding:6px 10px}`), `:40` (`.gm-rb`), `:196` (`.gm-mo-skip`).
  - `src/avodah/ui.css.js:162` (`.av-skip`).
- **Fix idea.** `min-height:44px` (use `min-width` for icon buttons), keeping the visual size with padding.

### P1-6 · The pour meter ("יין" / "מים") sits on top of the badges in the mini-game header, in 3D mode
- **Repro.** In the morning service or `#avodah=mine`, reach the last game, "נסכים ושיר של יום". Its header shows the
  "עבודה בפועל" or "לימוד" badge with a grey 130×14 bar lying over it, and a stray white "יין" on top. That bar is the
  pour meter the player is meant to watch while holding.
- **Screenshots.**
  - `phone/M12-H-05-shir.png` and `zoom-mine-shir-badges.png`.
  - `phone/53-D-14-shir.png` and `zoom-shir-badge-mine.png`.
  - The background chain's `/home/claude/temple3d/test/out/integration/phone-14-shir.png` shows the same.
  - Desktop: `desktop/39-D-14-shir.png`.
- **Suspected code.**
  - `src/avodah/minigames/shir.js:67` and `kiddush.js:86` move the meter into `.av-ctl` in 3D mode.
  - `.av-meter{position:absolute;top:8px;inset-inline-start:10px}` (`src/avodah/ui.css.js:168`). `.av-ctl` is not
    positioned, so the meter anchors to `.av-mg-card` (`:136`, `position:relative`), which puts it in the header.
- **Fix idea.** Add `.av-ctl .av-meter{position:relative;top:auto;inset-inline-start:auto;margin:0 auto 6px}`.

### P1-7 · Divine Names written in full in the repository (content rule §2.3: "in any text, code comment or asset")
- **Where.**
  - `test/game-state.test.mjs:24` and `test/hooks.test.mjs:188`: the Tetragrammaton, and Elohim, as literal regex text.
  - `content/REVIEW.md:284`: a two-letter Name written in quotes, "נוסחים של …".
- **Not affected.** The bundle is clean: none of the Names in any pointing, and no escaped form. The bundle's own
  runtime guard builds its pattern from `\u` escapes.
- **Evidence.** `node test/qa-content-scan.cjs` (the "repo" check fails). The full source tree is stored with the
  published artifact under `source/` (PROJECT.md §10), so these files travel.
- **Fix idea.** Build the test patterns from escapes, as `test/qa-content-scan.cjs` does. In REVIEW.md, describe it as
  "שם בן שתי אותיות". Owners: the game-systems and hooks tests; CONTENT for REVIEW.md.

### P1-8 · The Phase B home's daytime view: the azara's east wall fills half the frame
- **Repro.** Open Phase B during the day, when "קרבנות העולים לרגל" is live: from after the morning service until the
  afternoon Tamid, so most of the day. On desktop, a close-up of huge ashlar blocks fills the right half of the frame,
  and the altar is squeezed to the left. On a phone, the same wall takes the right third above the panel. This is the
  first frame of Phase B an investor sees.
- **Screenshots.** `desktop/24-B-phaseB-first.png`, `desktop/25-B-after-first-card.png`, `phone/28-C-home-today.png`,
  `phone/115-E-home-after-scenes.png`, `phone/M16-H-mine-end.png`.
- **Suspected code.**
  - `src/places.js:127`: `slaughterWide: { p: [8, 56, 34] }` sits 2 amot outside the azara's east wall (x ∈ [0, 6]).
    Its near courses and the gate chambers are a few amot from the lens. It is used for `korbanot-yachid` and
    `tamid-bein-haarbayim` (`EVENT_SHOT`, `src/avodah/schedule.js:116-121`).
  - `src/main.js:491-495`: the portrait pull-back moves it further east, but never clear of the wall.
- **Fix idea.** Move the eye up and over the court: for example p `[-10, 70, 60]` looking at the rings, or reuse
  `altarWide`.

### P1-9 · The ⌂ button during the tour opens the Phase B home under the tour panel
- **Repro.** Phase B home → "צא לסיור" (or "איפה הארון?" or "יום הכיפורים") → tap ⌂ at the top. The home panel opens
  and the tour panel stays open: two panels overlap, both half hidden. The tour does not close, and its camera stays
  where it was.
- **Screenshot.** `desktop/42-E-tour-home-pressed.png`. The walk logged `{"home":true,"tour":true}`.
- **Suspected code.** `src/avodah/ui.js:77`: `if (a === 'home') { if (!ctx.busy()) toggleHome(); … }` does not know
  that a scene is open. `src/main.js:551` hides the home when a scene opens, but nothing stops it from coming back.
- **Fix idea.** While `window.__SCENES.state.open`, make ⌂ close the scene (its `onClose` already shows the home), or
  hide ⌂ as the Phase A tour does (`body.sc-on`).

---

## P2 — polish

- **P2-1 · On a phone, the tap-to-identify card hides behind the Phase B panels.** `#card` has z-index 4
  (`src/page.html:102-103`); `.av` has 30 and the tour panel 40. In Phase B a tap on the altar opens the card (class
  `on`) with nothing visible, and the marker floats alone. Evidence: `phone/32-C-tap-world-card.png`; the card is on,
  per the log. On desktop the card sits to the right of the panel and shows: `desktop/30-C-tap-world-card.png`.
- **P2-2 · The tour panel ignores dark mode.** The `.sc-*` colours are hard-coded light
  (`src/avodah/scenes/index.js:78-90`). The Phase B home turns dark and the tour panel stays cream:
  `phone/92-E-tour-10-kodesh-dark.png` vs `phone/28-C-home-today-dark.png`.
- **P2-3 · Small gold text under WCAG AA.** Gold kicker labels at 11–11.5 px bold are #A97A1E on cream, 3.46–3.55:1:
  "המטרה", "הבנייה הושלמה", "רב האומנים", "לשכת הגזית", "סוף העבודה". So are the tour's white-on-gold buttons "הבא"
  and "המשך" (3.24:1, `.sc-btn.gold`). Locked Middot-book rows are 2.38:1. On the service's world rings, labels such as
  "החזק — פתח", "זרוק את המגרפה" and "הספל המערבי" are cream text over light stone, with only a shadow for contrast.
  Evidence: the audit `contrast` lists in `test/out/qa/phone-*.json`.
- **P2-4 · The opening title "כאן ייבנה הבית." is washed out.** It is cream text over the glowing gold plan and its
  beam. It is the first thing a new player reads. Evidence: `phone/02-A-vision.png`.
- **P2-5 · A coach bubble peeks out under a modal card.** The next step's bubble ("שלח את עגלות המחצבה…") shows below
  the stage-done card: `phone/12-A-stage-done-card.png`.
- **P2-6 · Some 3D frames look at nothing in particular.**
  - After the zerika: a tight shot of a kohen's torso with the head cut off, and a large blank shadow.
    Evidence: `phone/46-D-zerika-after-1.png`, `47-…`, and the integration run's `phone-09-zerika-after.png`.
  - Evarim: a kohen's back in shadow over empty paving (`phone/49-D-10-evarim.png`).
  - Barkai: haze over the city (`phone/41-D-06-barkai.png`).
  - payis2 in the demo: the Gazit wall's dark window slits (`phone/M04-H-01-payis2.png`).
  - Only the illustrated card carries these moments.
  - Suspected code: each mini-game's `stage()` shot (for example `src/avodah/minigames/zerika.js:17`,
    `W.look('slaughter')`), `SHOTS` in `src/places.js:114-130`, and `interact3d.fit()`.
- **P2-7 · Dark mounds in the lambs' chamber.** The hay mounds (`src/temple.js:396`, cedar material) render as
  dark-brown puddles under the lambs, next to the yellow hay of `src/pens.js:159`. They read as stains.
  Evidence: `phone/42-D-07-taleh.png`, `phone/70-E-tour-04-lambs.png`.
- **P2-8 · Reversed and inconsistent counters in RTL.** "34/4 נפתחו" in the Middot book (`src/game/ui.js:423`: two
  isolated numbers around a bare "/"). "(13/0)" on "הדרך שלי" (`src/avodah/ui.js:189`). Both mean "x of N" (4 of 34,
  0 of 13) but display as "N/x". Evidence: `phone/20-A-dock-book.png`, `phone/34-C-home-path.png`.
- **P2-9 · The build prints "built 1563 KB", which is UTF-16 characters.** The file is 1,763,196 bytes
  (1.68 MiB; `build.mjs:13`).
- **P2-10 · A first-entry hitch into the house.** The first walk into the Heichal or the service compiles about 76 new
  shader programs (152 → 228). It shows as a 0.2–0.5 s task (JS side), plus a render stall on real GPUs. A
  `renderer.compile` behind the loader, or at the Phase B entry, would move it off the walk-in (`src/main.js:410-413`).
- **P2-11 · Touch targets of 40 px.** In Phase A's round buttons (☰, 🔊) and `.gm-btn` (`src/game/ui.css.js:40, 94`),
  and the 24 mishmar chips (40 px high). Close to the 44 px bar, but under it.
- **P2-12 · The mini-game "דלג" link is 36×29, and the moment "דלג" 32×25.** They sit next to the card's top-left
  edge, where a thumb lands.
- **P2-13 · The pilgrim pens show a single money-changer's table.** "סוחרי הבהמות" (`phone/73-E-tour-05-pens.png`):
  fine, but the stop is mostly an empty field. Keep it in mind for the WORLD agent.
- **P2-14 · The Even HaShtiya reads as a stain.** It is very flat and dark brown. At phone size, in the Yom Kippur
  chapter "אחת, אחת ואחת", the irregular dark shape on the floor can read as a stain. The Mishnah's "גבוהה מן הארץ שלש
  אצבעות" allows a slightly raised, lighter stone. Evidence: `phone/111-E-yk-07-yk_sprinkling.png`,
  `zoom-even-shtiya.png`; code at `src/sanctuary.js:480-492`.
- **P2-15 · A misplaced Musaf tile on weekdays.** On a day with no Musaf (a weekday, including Erev Sukkot), "המשך
  היום" lists "מוסף (של שבת)" as if it were part of today (`src/avodah/ui.js:144`). Move it to "שבת ומועד" on those
  days.
- **P2-16 · The tour's lock icon is an emoji.** "🔒" in the stop chips (`src/avodah/scenes/index.js:111`) renders with
  the system emoji font, unlike the game's own icons.
- **P2-17 · Yom Kippur chapter 2 frames the wrong kohen.** In "בגדי לבן — מאחורי סדין", the one figure in frame is an
  ordinary kohen washing at the kiyor, with the coloured avnet. The Kohen Gadol in white (the white avnet is built:
  `src/actors.js:124`) stands at `[-58, 32]`, under the phone panel. A viewer reads the kohen in frame as "the white
  garments" with the wrong belt, and the sheet (סדין) is not shown. Evidence: `phone/104-E-yk-02-yk_white_garments.png`;
  code at `src/avodah/scenes/index.js:64`. The scenes-polish work in this wave may already cover it.
- **P2-18 · On desktop, the Kodesh HaKodashim views hide their subject under the panel.** The desktop panel is centred
  at the bottom, and the camera frames the Even HaShtiya low, so the stone sits right under the panel. The frame is
  left with only the parochet folds and the gold wall. This affects the tour's stop 10 and the Yom Kippur chapters
  "אבן השתייה", "אחת, אחת ואחת" and "להוציא את הכף". Evidence: `desktop/48-E-tour-10-kodesh.png`,
  `desktop/61-E-yk-07-yk_sprinkling.png`; code at `src/sanctuary.js:764` (`PATH.kodesh`). The view offset that lifts
  the subject above the panel applies only in portrait under 760 px (`src/main.js:307`).
- **P2-19 · The tour's current stop chip scrolls out of sight.** The stop chips scroll sideways, and the active chip is
  not scrolled into view. In "8. קידוש ידיים ורגליים" or YK "7. אחת, אחת ואחת" it sits beyond the panel's edge, so the
  player loses track of where they are in the tour. The audit's `clipped` list on `desktop/*-E-*` screens shows it.
  The fix is `scrollIntoView({inline:'center'})` on `.sc-stops button.on` after `render()`
  (`src/avodah/scenes/index.js:111`).
- **P2-20 · After "ההיכל בזהב" in the demo, the camera frames the raw back of the Heichal.** Once the Heichal's cards
  are dismissed, the camera moves to the next site, the Kodesh HaKodashim, which is still empty. The investor sees a
  flat marble wall filling half the screen, its unfinished vertical edge, and the gold interior showing through the
  gap. The frame just before it, with the gold card over the façade, is fine. Evidence:
  `phone/D22-G-hl7-heichal-after-cards.png`, `desktop/D22-G-hl7-heichal-after-cards.png`. The focus comes from
  `S.recommend` → `W.focus` at the end of `completeFlow`, `src/game/index.js:650-651`. In demo mode the reel could keep the Heichal's orbit shot until
  the next press.

---

## 1 · The suites

All on the v10 bundle. Wall-clock flakes are listed separately from real failures.

| suite | result | time | notes |
|---|---|---|---|
| `node --test test/*.test.mjs` | **101/101 pass** | 1.8 s | calendar, game-state, hooks, avodah state/schedule/games, hooks-avodah |
| `node test/game-sim.mjs --check` | **pacing OK** | 0.3 s | regular 10.5 days, heavy 6.1, light 22.5 |
| `test/game-harness.cjs` | **93/93 pass** | 92 s | DOM harness, fake world |
| `test/avodah-harness.cjs` | **70/70 pass** | 225 s | DOM harness, mock world; the whole morning by solver in 25.8 s |
| `test/scenes.cjs` | **ALL PASS** (phone + desktop) | — | background chain `scenes2.log`; the desktop `tour_heichal` frame took 337 s |
| `test/sanctuary.cjs --quick` | **ALL PASS** | 389 s | draw calls per view below |
| `test/avodah3d.cjs` | **ALL PASS** | 232 s | stats: 33 actors, 39 animals, 41 calls, 229 k triangles in the lab |
| `test/stages_api.cjs` | **no errors** | 58 s | |
| `test/stages_api2.cjs` | **ALL PASS** | — | |
| `test/integration-s2.cjs phone` | **9/10**, one FAIL = **wall-clock flake** | — | background chain `integ-v10.log` |
| `test/playtest/real-handoff.cjs` | **7/7 pass** | — | background chain |
| `test/game-e2e.cjs` | **51/51 pass** | — | background chain, phone (demo) and desktop |

**About the one failing check.** "no world call timed out" fails with two warnings:
- `[avodah] world.kohen.walkTo: no answer after 15000 ms`
- `[avodah] world.sanctuary.focus: no answer after 6900 ms`

My phone walk logged the same two warnings, and `#avodah=mine` logged the second. They are artefacts of rendering on
demand. A SwiftShader frame blocks the main thread for 10–40 s; the world is advanced only by `__T.simulate`'s 50 ms
interval, which cannot run meanwhile. The bridge's wall-clock timeout (`src/avodah/world.js:65, 103`) then expires
before the kohen could walk. A real device walks the ~65 amot to the kiyor at 7 amot/s in about 9 s, and does the
0.9 s focus. **Not a game bug.** The service always went on: the timeouts resolve false by design.

A suggestion for the integration test: pause the timeout clock during `shot()`, or count world time instead of wall
time.

---

## 2 · The first-time player (phone 390×844, fresh localStorage, the real clock)

Everything below played through with **0 console errors and 0 page errors**. 118 screenshots are in
`test/out/qa/phone/`. The flow:

**Phase A, the first minutes**
- The loader, then the vision.
- The coach "הקש על הסלע" appears within 5 s.
- Real taps at the coach's hand, the first strike and the rhythm ring.
- The crew arrives.
- "אלף כהנים אומנים", then the name and mishmar prompt.
- The hill is cleared in about 60 s of tapping, then the great-stone moment (hold, release on the mark).
- The stage card "שיטוח ההר" with two finds.
- The coach sends me to the caravans, and I send the 5-minute wagons.
- The coach says to start the wall; I start it from the goal pill.
- Every dock tab.
- The wagons return after 5 real minutes, "אסוף", and the tutorial ends.

**Into Phase B**
- The menu has "הצצה" (P0-2: cut off).
- Phase B opens with "אלעזר, ברוך הבא לעבודה": the name carries over.
- The home: היום, ספר העבודה (40 steps, each tagged), הדרך שלי (15 ממונים, 13 roles, the streak "שבת ויום טוב אינם
  שוברים אותו").

**The full morning Tamid in practice**
- All 14 games, in order: payis1 → kiddush → deshen → maaracha → payis2 → barkai → taleh → heichal → zerika → evarim →
  payis3 → ketoret → birkat → shir.
- It ends with the summary quoting "זה הוא סדר התמיד" (Tamid 7:3).

**The tour, the Ark mystery, Yom Kippur**
- The tour: 10 stops and 38 cards. The wash gate works: the Heichal is locked until the kiyor.
- "איפה הארון?": 5 stops. The 14th bow at the odd stone, and the end card, "לא 'מוצאים' את הארון".
- Yom Kippur: 10 chapters, watch-only, with the "אחת, אחת ואחת" count.
- Each one closes back to the Phase B home.

**Back to building, and the tour from Phase A**
- "חזרה לבניית הבית" brings Phase A back from its save (wall 45%, name kept, a "while you were away" card).
- ☰ → the tour from Phase A, and closing it returns to building. Once, the site looked white afterwards; see §6.

**Nothing stuck.** I found no stuck state in the whole walk. Every card had a way forward, and every scene closed back
to where it came from.

---

## 3 · Content safety

- **The Divine Name.**
  - The bundle has none: the Tetragrammaton in any pointing (and `\u`-escaped), Elohim, Eloah, Adonai, Shaddai,
    Tzevaot, Yah.
  - The substitutions are used throughout: ה׳ (one ה' with an ASCII apostrophe in Middot 4:2's Ezekiel quote),
    אלקינו, אלקים, א-ל.
  - None in any rendered text: the audit checked `document.body.innerText` and the hidden `textContent` on 282
    screen states (phone and desktop, light and dark).
  - Repo-side, the Names are written in full in three places: P1-7.
- **"טיוטה" on every card.**
  - Tagged: every Phase A modal, story card, stage card, key moment, sheet and name prompt; every Phase B mini-game,
    result card, summary, intro and home box; every tour, Ark and Yom Kippur card. The per-screen audit found none
    missing.
  - The one exception is the Sprint-0 tap-to-identify cards: P1-1.
- **No gore.**
  - The zerika cuts away. A veil reads "שָׁחַט הַשּׁוֹחֵט · המצלמה פונה אל פני הכהנים ואל הכלי", and the lamb leaves
    in a short dip.
  - Blood appears only as a small dark ellipse in the mizrak, and as faint grey-maroon marks at the altar's corner.
  - No knife, wound or spray anywhere. Frames: `phone/45-…47-D-zerika*`, the background chain's
    `integration/phone-09-zerika*.png`, and the avodah3d lab's `test/out/life/api_before_cut.png`, `api_mizrak.png`,
    `api_sprinkle_ne.png`.
- **No Ark.**
  - There is no Ark geometry anywhere in `src/`.
  - The Kodesh HaKodashim holds the Even HaShtiya: `phone/92-E-tour-10-kodesh.png`, `111-E-yk-07-yk_sprinkling.png`.
  - The mystery ends at the odd paving stone of the wood chamber: `phone/99-E-ark-04-find.png`, `100-E-ark-bowed.png`.
- **The player never walks into the Kodesh HaKodashim.**
  - The Yom Kippur view is a fade cut, with no walk.
  - The tour's stop 10 does put the camera inside, outside Yom Kippur: P0-3.
- **No purchases, loot boxes or guilt.** None found in the texts or in the flows. The streak copy is kind: "רצף שמור",
  "שבת ויום טוב אינם שוברים אותו". Tomorrow's line says "שבת — מנוחה".

---

## 4 · Performance

SwiftShader on a loaded 2-core machine, so absolute times are pessimistic, and I cannot measure fps.

- **Bundle.** 1,763,196 bytes (1.68 MiB), gzip 0.51 MiB. Under 2 MB ✓.
- **Boot to the first frame.** The loader is gone at 12.2 s on the phone (DCL 0.19 s) and 24 s on desktop
  (1280×720, the machine at load 10+). `#avodah` boots in 9–10 s.
  - The loader's own timeline: 1.6 s the mount → 2.6 s the pilgrims → 4.2 s "מדליקים את המערכה" → 12.0 s "מכינים את
    אתר הבנייה" → 12.1 s done.
  - The **single longest task is 7.8 s** (4.2 → 12.0 s): `renderer.compile` plus `stages.prewarm`, that is, shader
    compilation (`src/main.js:410-413`).
  - On a real GPU this is far shorter. Still, two-thirds of the boot is shader programs: 150 at the start, 228 once the
    house and the service are seen.
- **Draw calls.** Budget ≤ 150 (§3); every view is within it ✓.

  | view | total draw calls | scene only |
  |---|---|---|
  | the Phase A hill | 37 | 23 |
  | building the wall | 51 | — |
  | the Phase B home | 77 | — |
  | the Heichal, in the service | 80 | — |
  | zerika | 82 | — |
  | the tour's Kodesh HaKodashim | 81 | — |
  | the demo after the Heichal | 112 | 98 |
  | desktop: the Heichal, in the service | 93 | 79 |
  | desktop: the tour's Kodesh HaKodashim | 100 | 86 |
  | desktop: the whole-Temple view (olives) | **128** | 114 |

  The sanctuary suite's per-view counts:

  | view | draw calls |
  |---|---|
  | olives | 112 |
  | facade | 117 |
  | altar | 101 |
  | kotel | 119 |
  | royal | 122 |
  | top | 113 |
  | facade + doors | 116 |
  | altar + doors | 100 |
  | heichal (view) | 77 |
  | ulam | 83 |
  | heichal | 73 |
  | heichal + smoke | 74 |
  | kodesh-view | 99 |
  | lambs | 65 |
  | avtinas | 95 |
- **Triangles rendered** are 0.72–1.25 M per frame.
- **Vertex data.** Across the visible scene graph, positions × instances run from 1.36 M (Phase A) to **2.3 M
  (Phase B)**. That is above the §3 budget of 1.5 M vertices. It counts frustum-culled meshes too, so it is an upper
  bound, but it leaves little headroom for a mid-range phone.
- **Memory.** The JS heap goes 68 → 78 MB (peak) → 72 MB over a 50-minute session, with no growth trend ✓. GPU:
  135–169 geometries, 54–63 textures, 148–228 programs.
- **Long tasks during the service.** In the full morning service (14 games, 11 min), counting JS only and excluding the
  on-demand renders, there were **3 tasks: 144, 62 and 111 ms** ✓. The tour's first walk into the Heichal gives a
  0.2–0.5 s task (P2-10).

---

## 5 · The investor path

**`#demo`: the Phase A demo and "הרגע הבא ✦"** (phone; `phone/D01…D31`)
- It boots into a separate save, marked "מצב הדגמה · זמנים ×60", with "דלג לפרק הבא" and "הרגע הבא ✦".
- The 8 highlights all play, each with its celebration and card:
  1. האבן הגדולה (the great-stone moment)
  2. העזרה נסגרת
  3. שלוש עשרה הפרצות (13 taps)
  4. חוט הסיקרא (the drag)
  5. המזבח שלם: האש הראשונה
  6. האולם וגפן הזהב
  7. ההיכל בזהב
  8. האומנים בתיבות
- It ends on "חנוכת הבית": the whole House, smoke rising, crowds (`phone/D27-G-hl8-kodesh-after-cards.png`, a strong
  final frame).
- **But:**
  - The altar invitation pulls a presenter out of the reel at highlight 5 (P0-1).
  - The Phase A menu is cut off (P0-2).
  - The resource bar overflows from highlight 6 (P1-2).
  - "גפן הזהב" shows no vine (P1-3).
  - The ✦ button is dead after the last highlight (P1-4).
  - The strip's buttons are 26 px high (P1-5).
- In the log the reel takes ≈11 minutes with my screenshots. Without them it is about 4–5 minutes of taps and cards.
- On desktop (1280×720) the reel shows the same P0-1, P1-3, P1-4 and P2-20. The resource bar fits there, and the final
  Chanukat HaBayit frame is excellent (`desktop/D27-G-hl8-kodesh-after-cards.png`).

**`#avodah=mine`: the ~3-minute Phase B demo** (phone; `phone/M01…M16`)
- Boots straight into Phase B: "כהן צעיר מגיע למקדש · איך קוראים לך?" (name and mishmar), then the intro card.
- Then 5 games, "העבודה שלך היום": the payis (13 roles) → the Heichal (the great gate from inside, the lamps) → the
  third payis → the ketoret → the libation and the song.
- It ends with "העבודה שלך היום — נעשתה", "פגשת ממונה (2 חדשים)" and the home.
- The run took 339 s, including ~3.5 min of my renders, so about 3 minutes live ✓. 0 errors.
- Issues:
  - The pour meter covers the header in the last game (P1-6).
  - Some wide frames look at walls or paving (P2-6).
  - The world-ring labels have low contrast (P2-3).

---

## 6 · Not verified / risks

- **The investor links use the URL hash.** `#demo` is read in `src/game/index.js:74`, and `#avodah=…` in
  `src/main.js:456`. Before the meeting, open the published artifact link with the hash and confirm that it reaches the
  page inside the claude.ai viewer; I cannot test the hosted viewer from here. The in-game fallbacks are:
  - ☰ → "מצב הדגמה" for the reel;
  - on the Phase B home, the "העבודה שלך היום" panel for the ~3-minute ritual.
- **The holiday days, for whoever presents** (`test/qa-holiday.cjs`: `holiday-*.png`, `holiday.log`; 0 errors).
  - Tomorrow, Shabbat and the first day of Sukkot: from 08:36 to 15:00 the home says "עכשיו במקדש: שקט". That
    follows the schedule: no private offerings on Shabbat, and Musaf runs 07:06–08:06. An investor opening Phase B
    then sees no live service, so use the practice tiles or `#avodah=mine`.
  - On Chol HaMoed: "קרבנות העולים לרגל" is live 08:08–14:58, and the Musaf line reads 11 bulls on 17 Tishrei.
  - On Shabbat, the home still invites "העבודה שלך היום · כ־3 דקות". That is the open ⚑ "Phase B live service on
    Shabbat/Yom Tov" (§11).
- **Flicker cannot be seen in single rendered frames.** In the ~270 stills I saw no z-fighting.
- **fps on a real phone is not measured here.** SwiftShader renders a frame in 5–110 s under this load.
- **A white site after the tour, once, on the phone.** After returning from the tour opened in Phase A, the site
  inside the half-built wall once looked blown-out white (`phone/118-F-after-tour-from-A.png`,
  `zoom-after-tour-site.png`). Two checks did not reproduce it: the desktop walk (`desktop/67-F-phaseA-back-clear.png`
  vs `69-F-after-tour-from-A.png`, identical) and a targeted phone check (`test/qa-leak.cjs`: mean luminance 205 vs
  202). I withdrew it from P1. It may be a transient effect caught mid-render.
- **An empty frame on desktop.** Once, while clearing the hill on desktop, the frame showed only bare ground, with no
  boulder, hero or crew (`desktop/07-A-hill-progress.png`). It may be a capture during a camera flight; I could not
  reproduce it on the phone (`phone/09-A-hill-progress.png` shows the next boulder).

## 7 · Requests, by owner

- **Game systems / hooks** (Phase A):
  - P0-1 (`src/game/index.js:647`, demo mode);
  - P0-2 (`src/game/ui.js:526-527`, `src/game/ui.css.js:94`);
  - P1-2 (`src/game/ui.css.js:42`);
  - P1-3 (the demo vine);
  - P1-4 (`src/game/index.js:883`);
  - P1-5 (`src/game/ui.css.js:53-55`);
  - P1-7 (`test/game-state.test.mjs:24`, `test/hooks.test.mjs:188`);
  - P2-4, P2-5, P2-8, P2-11, P2-20.
- **Scenes / sanctuary:**
  - P0-3 (`src/avodah/scenes/index.js:49`);
  - P1-9 (`src/avodah/ui.js:77`, with the Avodah owner);
  - P1-5 (`src/avodah/scenes/index.js:80-87`);
  - P2-2, P2-14, P2-16, P2-17, P2-18, P2-19.
- **Avodah:**
  - P1-6 (`src/avodah/ui.css.js:168`, `shir.js:67`, `kiddush.js:86`);
  - P1-8 (`src/places.js:127`, `schedule.js:116-121`);
  - P2-6, P2-12, P2-15.
- **Main / page shell:**
  - P1-1 (`src/main.js:230`, `src/page.html:161`);
  - P2-1 (`src/page.html:102`);
  - P2-9 (`build.mjs:13`);
  - P2-10 (`src/main.js:410-413`).
- **Content:** P1-7 (`content/REVIEW.md:284`).
- **World / life:** P2-7 (`src/temple.js:396`), P2-13.
- **Everyone (the design system):** P2-3, the gold small text and white-on-gold buttons.
- **⚑ Owner:** P0-3. Is a watch-only camera inside the Kodesh HaKodashim acceptable in the tour, outside Yom Kippur?
  §11 currently says no.
