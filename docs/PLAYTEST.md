# Playtest logs (HOOKS agent, 25–26 Sep 2026)

## Round 3 (26 Sep 2026, motzaei Shabbat, the first night of Chol HaMoed Sukkot): the new content, played for fun

Master `140cf73` (wave 3: fifteen key moments, crews and caravans in the world, the tour, "איפה הארון?", the Yom Kippur
service) was played by five bot families, then again on this branch after the changes. Everything is re-runnable:

```
PROBE_OUT=test/out/playtest/moments-probe.json node -r ./test/playtest/probe-preload.cjs test/moments.cjs --harness
PROBE_OUT=test/out/playtest/harness-probe.json node -r ./test/playtest/probe-preload.cjs test/game-harness.cjs
node test/playtest/moment-model.mjs                      # the fifteen moments: first time, child, again
node test/playtest/scenes-bots.cjs --label=r3-before|r3-after
node test/playtest/sim.mjs --label=r3-nocue --no-cue ; node test/playtest/sim.mjs --label=r3-after
node test/playtest/dom-bots.cjs --only=presenter,firstTimer,child --label=r3-before|r3-after   (before: master's bundle, --no-build)
node test/playtest/avodah-bots.cjs --only=newRitual,investor --label=r3
node test/playtest/r3-checks.cjs                         # the round-3 hooks in the real HUD: PASS/FAIL + r3-*.png
```

**The probe** (`probe-preload.cjs`) is new: preloaded with `node -r` in front of any Playwright suite, it times every key
moment overlay the suite opens (open → end card → closed), counts the taps and keys inside it, records every hint the
player is shown (each new hint is a step or a nudge) and the words of the end card. It changes nothing in the suite
(both suites stayed green under it: moments 94/94, game harness 93/93). The suites' solvers play at machine speed, so the
probe gives each moment's **floor**: its animations and the inputs it needs, with no reading and no thinking.

### R3.1 The fifteen key moments

The model on top of the floor (`moment-model.mjs`): the Keystroke-Level Model's 1.35 s of preparation per step (Card,
Moran & Newell 1980), 0.6 s per touch target, reading the hints at 160 wpm and the end card up to 20 s (a curious adult,
first time); the child reads 90 wpm and at most 2.5 s of a hint, prepares 1.8 s a step and misses 30% of targets; "again"
is a player who knows the moment (0.4 s a step, 0.3 s a target, 1.5 s on the card).

| moment | stage | floor | inputs | steps | words (hints / card) | first time | child | again | reading | a chore again? |
|---|---|---|---|---|---|---|---|---|---|---|
| האבן הגדולה | har | 3.7 s | 2 | 2 | 10 / 26 | 22 s | 14 s | 7 s | 61% | |
| הנדבך הראשון | wall | 3.7 s | 6 | 5 | 38 / 47 | 47 s | 31 s | 9 s | 68% | |
| שלוש עשרה הפרצות | sorag | 1.5 s | 14 | 2 | 10 / 14 | 23 s | 20 s | 8 s | 40% | |
| שבעת השערים | gates | 4.2 s | 8 | 6 | 33 / 46 | 48 s | 34 s | 10 s | 62% | |
| לשכת העצים | nashim | 2.6 s | 5 | 4 | 24 / 35 | 34 s | 25 s | 7 s | 65% | |
| הסערה והמעלות | nikanor | 9.9 s | 17 | 8 | 50 / 37 | 65 s | 56 s | 20 s | 51% | **yes** |
| אבן גזית | lishka | 3.3 s | 6 | 4 | 23 / 37 | 36 s | 26 s | 8 s | 63% | |
| בלי ברזל | yesod | 6.9 s | 3 | 12 | 60 / 34 | 61 s | 61 s | 14 s | 58% | **yes** (12 steps) |
| חוט הסיקרא | sovev | 1.6 s | 3 | 3 | 14 / 11 | 18 s | 17 s | 5 s | 53% | |
| הכבש והסיד | guf | 6.8 s | 16 | 7 | 40 / 57 | 62 s | 47 s | 16 s | 57% | **yes** |
| הקרנות והאש הראשונה | karnot | 6.5 s | 7 | 5 | 26 / 34 | 41 s | 34 s | 12 s | 55% | |
| שנים עשר הדדים | kiyor | 13.4 s | 18 | 9 | 63 / 73 | 81 s | 64 s | 24 s | 54% | **yes** |
| המלתראות וגפן הזהב | ulam | 13.3 s | 3 | 6 | 38 / 54 | 58 s | 43 s | 18 s | 59% | |
| הבית בזהב | heichal | 4.8 s | 11 | 5 | 28 / 50 | 48 s | 35 s | 12 s | 60% | |
| האומנים בתיבות | kodesh | 13.7 s | 9 | 7 | 41 / 16 | 51 s | 51 s | 21 s | 42% | **yes** |

All fifteen: **11.6 minutes** the first time (a child 9.3), **3.2 minutes** again; 128 inputs; 1,069 words.

What it means:
- **The first time is fine for an adult and too long for a child.** Reading is 40–68% of a first play, which is the
  point (the real detail). But 12 of the 15 moments take a child more than 25 s, and the DOM child (who skips a moment
  after 25 s) skipped the first wave-3 moment he met ("הנדבך הראשון", 31 s at his pace) — before and after. A skip used to
  lose the moment's detail with its card; now the stage card carries the moment's "done" line and its source. ⚑R3-2.
- **Five are chores the second time** (≥ 12 s again and ≥ 10 inputs or ≥ 7 steps): the kiyor (24 s, 18 inputs), the storm
  and the steps (20 s, 17 taps), the boxes (21 s), the kevesh and the whitewash (16 s, 16 inputs), "בלי ברזל" (12 steps).
  A second play happens in three places: the map's "שוב" (the player asked for it), a new game, and **the presenter's
  second investor** — the reel plays karnot, ulam and the boxes again at every demo. Request to the moments' owner
  (§13 round 3): on a repeat, play only the moment's core step (one pour, one lintel, one box) and go to the card.
- **They do not block the loop.** In the 7-day regular's week no session opened on a waiting moment (0 of 21): a stage
  whose work ends in the session opens its moment at once (auto-run), and none ended offline. The moment holds its
  stage only for the moment's own length. The one stray: in the investor reel, a crew tick could reach the wall's end
  in the ~2 s before its live celebration and open "הנדבך הראשון" in the middle of the reel (the presenter bot met it:
  28 s). Fixed in `demo.js` (a live highlight is marked past its moment).
- **Optional moments (the MOMENTS agent's ⚑1).** By the numbers, the candidates for "optional, not holding the stage"
  are not gates and nashim (48 s and 34 s the first time, both short again) but the long, many-input ones on a repeat.
  My recommendation: keep all fifteen on the first play (each is the stage's peak, §14.1), shorten the repeat.

### R3.2 Crews and caravans in the world

The simulator (the real rules of `state.js`, persona bots, a virtual clock) now audits every 10 s where each crew is,
and whether its site can take work, and when each caravan reaches its bay.

**Is it clear who is building and why a site waits?** The world shows a crew hammering at its site whatever the rules
say. The rules: a crew at a site that waits for a material does nothing.

| persona | crew time at a blocked site, in session | crew-hours at a blocked site while away |
|---|---|---|
| the curious first-timer (20 min) | **65%** (cedar 1,800 crew-s, white stone 320) | **24 h** (all of his crews, all night) |
| the child (15 min) | 27% (cedar) | 8 h (33%) |
| the busy adult, 7 days (moves crews himself) | 1% | 0 |
| the binger / the returner | 0% / 3% | 0 / 0 |

So the world lies exactly to the players who do not yet know the crews sheet. After the change (a cue after 30 s at a
blocked site, three in all, ten minutes apart, with one tap to move them; the same button on the rest card): the
first-timer **65% → 17%** in session and **24 → 0 crew-hours** away (the model: a persona who follows suggestions takes
the tap). The child does not read toasts (unchanged: 27%, 8 h) — the world itself must show the wait (request to the
world's owner: crews at a blocked site sit and look down the road).

**Do the caravans build anticipation?** The departure is seen (the player sends it). The arrival is not: the 7-day
regular saw **0 of his 26 caravans arrive** (all 26 were waiting at their bays when he came back); the returner 0 of 4;
the first-timer 2 of 2 (the short first trips). The carts rolling in on the timer are a beat for the long session only,
and until now nothing in the HUD marked it (the strip chip turned gold). After: a chime and a toast "המשלחת הגיעה" with
one tap to collect (the DOM first-timer: `arrivalBeat` 1, `arrivalCollect` 1). For the absent player the welcome card
already leads with "קודם כול: לאסוף" and the loaded train stands at its bay.

### R3.3 The tour, "איפה הארון?" and the Yom Kippur service

`scenes-bots.cjs` walks every card of the real panel (a mock world whose camera moves take their device time) and
counts what it says; five personas then read the walk: words at their speed, capped by patience (s per card), an
attention budget (min) and a tolerance for text cards in a row at one view (the museum-fatigue shape, §14.2).

| tab | stops | cards | words | median / card | cards > 50 words | longest stop | at the end |
|---|---|---|---|---|---|---|---|
| tour | 10 | 40 | 1,622 | 45 | 12 | chambers (7 cards) | the panel closes |
| the Ark | 5 | 6 | 282 | 58 | 3 | end (2) | the panel closes |
| Yom Kippur | 10 | 13 | 686 | 52 | 8 | ketoret entry (3) | the panel closes |

Cards per stop in the tour: courts 4 · kiyor 3 · altar 6 · lambs 3 · pens 3 · chambers 7 · ulam 5 · wash 2 · heichal 4 (+ 4
vessels) · kodesh 3. Every card is 1 tap; completion is 40 taps for the tour, 6 for the Ark, 13 for the service.

Where they leave (before → after):

| persona (wpm · s per card · budget · cards in a row) | tour | the Ark | Yom Kippur |
|---|---|---|---|
| the curious first-timer (160 · 20 · 9 min · 5) | stop 6 chambers, card 6 (text wall), 5.7 min → stop 9, 9.1 min (budget), moved on past 1 card | 5/5, 1.7 min → 5/5, sees the door | 10/10, 4.2 min → 10/10 + the date |
| the child (90 · 5 · 4 min · 2) | **stop 1 courts, card 3**, 0.3 min → **10/10**, 2.8 min, past 11 cards, sees the door | 5/5 (16% read) | 10/10 (15% read) |
| the regular (170 · 12 · 6 min · 3) | stop 3 altar, card 4, 2 min → stop 9, 6.1 min (budget) | 5/5 | 10/10 |
| the binger (180 · 15 · 20 min · 7) | 10/10, 9.9 min → 10/10 + the door | 5/5 | 10/10 |
| the investor with a presenter (200 · 5 · 3 min · 2) | **stop 1 courts, card 3** → **10/10 in 2.8 min**, sees the door | 5/5, 0.6 min | 10/10, 1.2 min |

Findings: the Ark (5 steps, one card each) and the service (one or two cards per chapter, each with a new view and the
Kohen Gadol's motion) hold every persona to the end; the tour is where players drop off, at its text walls — the first
stop (4 cards in one view), the altar (6) and the chambers (7) — and nothing brought anyone back: no progress was kept,
no tab led to the next. After: 25 stamps, "לתחנה הבאה" at every stop with more cards, a door at each tab's end (the
tour → the Ark → the service → the next real Yom Kippur, 11 Oct 2027, 380 days from tonight), the stamps and (from twelve
days before) the coming Yom Kippur on the Phase B home. The text itself is the content owner's: 13 tour cards are over
the museum guideline of 50 words (§14.2); a one-line lead per long card is requested.

**The Ark as a discovery.** In the week of the regular (the simulator), the Ezrat Nashim — its wood chamber is where the
game places the tradition of the hidden Ark — is finished on **day 1, session 4 of 21** (11.9 min of play); the returner
finishes it on day 3. Both now get "אבן אחת ברצפה" (Shekalim 6:2, once, with "אחר כך") right after the stage's card; before,
the mystery was a second tab inside the tour panel that the model's players reached only after the tour. A player who
came by the `#avodah` link never builds the wood chamber: for him the Phase B home shows "תעלומה: איפה הארון?" from his
second day of service until he opens it.

### R3.4 The investor paths

**`#demo`, the highlight reel, end to end** (the DOM presenter: presses "הרגע הבא ✦" as soon as the last highlight's
cards are read, 2.5 s a card; the wave-3 moments at the presenter's pace from the moment model; game time on a virtual
clock, the same on a phone and a desktop since the world is mocked; add the real camera flights, ~1–3 s each):

| the reel, game time (virtual clock) | before (master `140cf73`) | after (this branch) |
|---|---|---|
| presses of "הרגע הבא ✦" | 9, of which **3 did nothing** (P1-4) | 7, none dead |
| to Chanukat HaBayit (from the link, the tutorial's first 38 s included) | 202 s | **169 s** |
| a key moment opening inside a live highlight | 1: the wall's "הנדבך הראשון" (28 s at the presenter's pace) | 0 |
| after "ההיכל בזהב" | `focus('kodesh')` the instant the card closed: the raw back of the Heichal (P2-20; the QA's screenshots) | the Heichal's shot kept until the next press (r3-checks) |
| the end | a toast, the button hidden; the presenter pressed three times | **the outro**: the eight highlights ✓, "העבודה בבית · 3 דקות ✦", "סיור בבית המקדש · 10 תחנות", "להישאר"; the button reads "סיום ההדגמה ✦" and opens it again |
| moments in the reel (presenter's pace) | great stone 3 s · breaches 6 s · red line 3 s · horns and fire 27 s · lintels and vine 39 s · boxes 10 s | the same |

**Desktop (1280 × 720, no touch), the same presenter:** 8 presses, 0 stray moments, Chanukat HaBayit at 171 s and the outro
right after it. The desktop run found one more gap, now closed: a press in the second between the last moment's "המשך" and
its stage card opened the outro *before* the stage card, the chapter card and the finale (first desktop run: outro at
160.8 s, finale at 177.7 s); now a press in that gap waits for the finale (`demoNext`: no outro before `G.celeb`).

The game side is the same on a phone and a desktop (the harness mocks the world; the camera flights do not hold the flow,
they run beside it). What the phone adds is the renderer: on a mid-range phone at 60 fps the flights are 0.9–2.6 s each and
never block a press. SwiftShader here renders a frame in 20–300 s, so no wall-clock number from the real build would mean
anything tonight. In words: **the reel is about 3 minutes of game time plus the presenter's talk, and it now ends on a door.**

**`#avodah=mine`, "העבודה שלך היום"** (the Phase B bots, the avodah harness, the game's real pacing):

| path (the Phase B bots, avodah harness, the game's real pacing) | end | first game at | games | cards (words / card) | reading |
|---|---|---|---|---|---|
| `#avodah=mine` = "העבודה שלך היום", a new player (160 wpm, 12 s a card) | **2.4 min** | 22 s (after the name pick and the welcome card) | 3: the payis, his role "בפועל", the song | 7 (65) | 54% |
| an investor who joins the live window and plays the whole morning (200 wpm, 3 s a card) | 3.4 min | 13 s | 15 | 19 (76) | 29% |

Both end on the summary with "הבא במקדש" and "מחר: …" (0 errors). Game time is the same on a phone and a desktop. The
QA's real-build run of `#avodah=mine` (docs/QA-S2.md) was ~3 minutes live. Unchanged by this round (Phase B's hooks were
done in round 2); the new things an investor meets there are the stamps and, near Tishrei, the Yom Kippur line.

### R3.5 Checked in the real HUD

`node test/playtest/r3-checks.cjs` — **35/35**: the reel (11: the counter, P2-20, the outro and its doors, never dead, no
stray moment, no errors), the Ark mystery (5), crews and caravans (8), the scenes panel (9: stamps, "לתחנה הבאה", the three
doors, 25 stamps kept), the Phase B home on 1 Oct 2027 (2: "בעוד 10 ימים: יום הכיפורים"). Screenshots (390 × 844):
`test/out/playtest/r3-demo-outro.png`, `r3-mystery.png`, `r3-idle-crews.png`, `r3-arrival.png`, `r3-tour-stamps.png`,
`r3-tour-door.png`, `r3-yk-end.png`, `r3-home-yk.png`. Unit tests: `test/hooks-r3.test.mjs` (8).

In the real 3D build (`node test/playtest/real-shots-r3.cjs`, SwiftShader, phone): 3/3 — "לתחנה הבאה" takes the tour to
the kiyor with 2/10 stamps (`test/out/playtest/real-r3-tour-kiyor-stamps.png`, 111 s a frame tonight), and the tour's last
card, before the parochet, shows the door to the Ark (`real-r3-tour-door.png`). The Phase A → B handoff in the real build
(`real-handoff.cjs`) 7/7.

The suites, on this branch: `node --test test/*.test.mjs` 109/109 · `game-sim --check` OK · game harness 93/93 · avodah
harness 70/70 · moments `--harness` 94/94 · r3-checks 36/36 · real-handoff 7/7 · game-e2e 46/51: the five failures are the
first seconds' wall-clock checks under five agents' load (phone: first strike 52.6 s wall, game side coach 5.3 s + tap →
impact 1.15 s; "first boulder shattered" and the ring that depends on it, phone and desktop). The same two taps replayed on
this build without the e2e's SwiftShader capture between them shatter the boulder at once (2 strikes → `boulder`
{i: 4, left: 11}); every later e2e flow passes (the hill cleared, the great stone, the caravans, the breaches moment, the
welcome back, the whole view, night, the quarry), with no console errors.

---

## Phase B and the Phase A → B handoff (Sprint 3, 25 Sep 2026, Friday morning, Erev Sukkot)

The persona bots of Sprint 2, extended to Phase B (`test/playtest/avodah-bots.cjs`). They play the **real** Phase B
HUD, rules and mini-games (`src/avodah` through the avodah harness page: a mock world, no WebGL) on Playwright's
**virtual clock**, at the game's real pacing (not `?fast=1`). The brain runs inside the page: it reads the name pick,
the modal cards, the mini-game panel and the home, and acts like the persona. A card is read for as long as its
visible words take at the persona's reading speed, capped by the persona's patience; a game's intro line likewise;
then the game's own **solver** plays it (real DOM events on the game's own elements, at the game's own pace). So the
in-game time measured is the **floor** (a perfect, instant player); the "human" estimate adds 1.1 s per decision
(0.6 s for the child). Re-run:

```
node test/avodah-harness.cjs --build                                   # (the bots build the same bundle themselves)
node test/playtest/avodah-bots.cjs --label=before|after [--only=…] [--shots]
node test/playtest/avodah-report.mjs before after                      # the tables below
```

**Personas.** `newLink`: a new player by the `#avodah` link (no saves) at 09:00 Friday; plan: join what is live (the
pilgrims' offerings), then the whole morning Tamid in practice. `newMenu`: the same, arriving from the Phase A menu
(a Phase A save: the name and mishmar are adopted, no name pick). `newRitual` (after only): a new player who follows
the gold button. `child`: 10–12, reads 90 wpm, gives a card 1.6 s, would skip a game after 40 s. `investor`: 5 minutes
from the link. `binger`: one long evening on Chol HaMoed (19:20), a live Beit HaShoevah, then everything, the morning
three times. `regular`: keeps Shabbat, plays seven days (25.9 → 1.10) **when the Temple is live and a working person
can**: 06:30–06:45 before work (the morning Tamid's live window is 03:30–07:06 on weekdays, 22:30 the night before
to 07:06 on the festival) and once at Beit HaShoevah (20:10); Shabbat and the first day of Sukkot (26.9) are not
played. `ritual` (after only): seven days, only "העבודה שלך היום", at 13:00 or 21:30.

### What the bots found (baseline: master `2be68cf`)

1. **The regular's morning is the service's tail, every day.** Joining live at 06:30–06:45 lands at the third payis
   (JOIN_AT: the calendar's current step), so he played **payis3 → ketoret → birkat → shir** or just **birkat → shir**
   on all six mornings: 1.2–2.1 minutes, **0 new source cards after day 1**, the day's payis (the role reveal) never
   seen, and his own role's work "בפועל" never done live (his "for real" count came only from the tail: 2, 1, 0, 0,
   1, 1, 1). Points after the week: 513; 5 of 13 roles.
2. **Reading is most of a first session.** A first morning shows 22–23 modal cards (name, intro, 15 source cards,
   the summary, then five ממונה cards in a row), ~70 visible words per source card: **56–60% of an adult
   first-timer's session is reading** (195–217 words/min shown); the child gives every card 1.6 s (a 72-word card
   needs ~48 s at his speed), so for him **every card is unread**.
3. **The ladder is used up on day 1.** The first morning's ~380 points met **5 of the 15 ממונים** (5 cards back to
   back after the summary) and filled **35 of the 40** steps of ספר העבודה. The binger met **9 ממונים in one
   evening** (961 points), filled the book (40/40) and had nothing long-term left.
4. **Repeats cost the same as the first time.** The binger's second and third mornings re-showed every full card
   (67 cards in the evening; 69 words each) and the same 2.6 s walk-in waits.
5. **Time to first fun is fine; dead time is small in the harness.** First tap in a game: 13–26 s from the link
   (name pick 6 s, the intro card, the home), 11–18 s from the Phase A menu. Inside the games the waits between
   decisions (the game's own choreography: the ketoret's "הקטר!", the song) are ~0.6 min per morning; between games
   the mock world answers at once. In the real 3D world each game may add up to 2.6 s of walk-in and 2.2 s after
   (the caps in `index.js`), ~1 minute per morning; the integration run (`test/integration-s2.cjs`) waits 5–7.5 s per
   game for the camera and the walk-ins.
6. **Decisions:** ~8.7 per game (from 1 in the three payis and ברקאי to 34 in the song): 21–25 a minute over the
   whole session at the floor pace, ~15–17 at a human pace (1.1 s a decision); lively enough for a phone, and the
   three payis are one tap each by design (a ritual, not a skill).
7. **The stopping point exists but points nowhere.** Every chain ends with a summary (a clean natural end), which
   named the next live segment today but never what tomorrow brings; the live tail's summary did not mention the
   player's own work.
8. **Shabbat is safe.** The regular's streak went 1 → 2 across Shabbat and the first day of Sukkot (not played).

### What changed (Sprint 3) and what the bots measured after

The daily ritual "העבודה שלך היום" (the payis → your role's work "בפועל" → the song, ~2–3 minutes), offered on the
home and on any summary where your own work was not done; a reveal card for a late joiner; brief cards and shorter
walk-ins for repeats; one ממונה card per service; same-day repeats count 3; a longer ladder of ממונים; the day
panel with the next appointment and tomorrow; Sukkot as a live event; mastery tiers; the vessels; the Shabbat-safe
streak with one covered weekday a week; the Phase A → B invitations. Details and files: `docs/HOOKS.md` §10.12.

<!-- phaseB-tables: generated by node test/playtest/avodah-report.mjs before after -->
| persona | session (floor / human est.) | time to first tap in a game | cards (memuneh) | words per source card | words/min | reading share | in-game waits | decisions (/game) | points | ממונים met |
|---|---|---|---|---|---|---|---|---|---|---|
| newLink | 7.3 / 10 min → 6.6 / 9.2 min | 26.3 s | 23 (5) → 19 (1) | 70 → 75 | 195 → 202 | 60% → 56% | 0.6 min | 158 (8.8) → 153 (8.7) | 395 | 5 → 2 |
| newMenu | 6.4 / 9 min → 5.8 / 8.4 min | 17.5 s | 22 (5) → 18 (1) | 70 → 76 | 217 → 227 | 56% → 51% | 0.6 min | 155 (8.7) → 152 (8.8) | 385 → 405 | 5 → 2 |
| newRitual | 2.4 / 3.2 min | 26.3 s | 7 (1) | 65 | 167 | 54% | 0.2 min | 56 (15.3) | 104 | 1 |
| child | 2.7 / 4 min → 2.6 / 3.9 min | 13.3 s → 15.1 s | 22 (5) → 18 (1) | 72 → 78 | 507 → 492 | 25% → 22% | 0.6 min | 139 (8.3) → 135 (8.3) | 387 → 397 | 5 → 2 |
| investor | 3.5 / 6.2 min → 3.4 / 5.9 min | 14.8 s | 23 (5) → 19 (1) | 70 → 76 | 402 → 398 | 34% → 30% | 0.6 min | 157 (8.7) → 154 (8.8) | 395 → 405 | 5 → 2 |
| binger | 14.2 / 23.4 min → 13.2 / 22.2 min | 11 s | 67 (9) → 61 (3) | 69 → 58 | 298 → 265 | 39% → 35% | 2.3 min | 542 (9) → 523 (9) | 961 → 596 | 9 → 3 |

**regular · before** (the daily regular (7 days, live windows, keeps Shabbat))

| day | minutes | games | new source cards / all | for real | points (total) | ממונים | streak | roles done | "מחר:" in the summary |
|---|---|---|---|---|---|---|---|---|---|
| 09-25T06:30 | 2.1 | payis3, ketoret, birkat, shir | 4/4 | 2 | 167 | 3 | 1 | 1 | no |
| 09-26T10:00 | Shabbat/Yom Tov: not played | | | | | | | | |
| 09-27T06:35 | 1.7 | payis3, ketoret, birkat, shir | 0/4 | 1 | 249 | 4 | 2 | 2 | no |
| 09-27T20:10 | 0.4 | shoevah | 1/1 | 0 | 267 | 4 | 2 | 2 | (no summary) |
| 09-28T06:40 | 1.2 | birkat, shir | 0/2 | 0 | 303 | 5 | 3 | 2 | no |
| 09-29T06:35 | 1.6 | payis3, ketoret, birkat, shir | 0/4 | 1 | 385 | 5 | 4 | 3 | no |
| 09-30T06:45 | 1.2 | birkat, shir | 0/2 | 1 | 431 | 6 | 5 | 4 | no |
| 10-01T06:40 | 1.6 | payis3, ketoret, birkat, shir | 0/4 | 1 | 513 | 6 | 6 | 5 | no |

**regular · after** (the daily regular (7 days, live windows, keeps Shabbat))

| day | minutes | games | new source cards / all | for real | points (total) | ממונים | streak | roles done | "מחר:" in the summary |
|---|---|---|---|---|---|---|---|---|---|
| 09-25T06:30 | 2.5 | payis3, ketoret, birkat, shir, payis2, evarim | 7/7 | 3 | 223 | 2 | 1 | 1 | yes |
| 09-26T10:00 | Shabbat/Yom Tov: not played | | | | | | | | |
| 09-27T06:35 | 2.1 | payis3, ketoret, birkat, shir, payis2, evarim | 2/7 | 2 | 361 | 2 | 2 | 2 | yes |
| 09-27T20:10 | 0.4 | shoevah | 1/1 | 0 | 384 | 2 | 2 | 2 | (no summary) |
| 09-28T06:40 | 1.9 | birkat, shir, payis2, evarim | 2/5 | 1 | 466 | 3 | 3 | 3 | yes |
| 09-29T06:35 | 2.2 | payis3, ketoret, birkat, shir, payis2, evarim | 2/7 | 2 | 604 | 3 | 4 | 4 | yes |
| 09-30T06:45 | 1.8 | birkat, shir, payis2, evarim | 2/5 | 2 | 696 | 3 | 5 | 5 | yes |
| 10-01T06:40 | 2.2 | payis3, ketoret, birkat, shir, payis2, zerika | 3/7 | 2 | 844 | 4 | 6 | 6 | yes |

**ritual · after** (the ritual player (7 days, "העבודה שלך היום" only, keeps Shabbat))

| day | minutes | games | new source cards / all | for real | points (total) | ממונים | streak | roles done | "מחר:" in the summary |
|---|---|---|---|---|---|---|---|---|---|
| 09-25T13:00 | 2.4 | payis2, deshen, heichal, payis3, ketoret, shir | 6/6 | 3 | 203 | 2 | 1 | 2 | yes |
| 09-26T13:00 | Shabbat/Yom Tov: not played | | | | | | | | |
| 09-27T21:30 | 1.3 | payis2, evarim, shir | 2/3 | 1 | 267 | 2 | 2 | 3 | yes |
| 09-28T21:30 | 1.3 | payis2, evarim, shir | 1/3 | 2 | 326 | 2 | 3 | 4 | yes |
| 09-29T21:30 | 1.5 | payis2, deshen, evarim, shir | 1/4 | 2 | 398 | 2 | 4 | 5 | yes |
| 09-30T21:30 | 1.5 | payis2, zerika, shir | 2/3 | 1 | 457 | 3 | 5 | 6 | yes |
| 10-01T21:30 | 1.5 | payis2, deshen, evarim, shir | 1/4 | 2 | 529 | 3 | 6 | 7 | yes |

**Per-game pacing** (floor seconds · decisions · waits between decisions, s; first time = newLink after, repeat = the binger's third morning)

| game | first: floor s | decisions | waits s | repeat: floor s | repeat: waits s |
|---|---|---|---|---|---|
| payis1 | 8.4 | 1 | 0 | 5.8 | 0 |
| kiddush | 7.9 | 4 | 1.3 | 6.5 | 1.3 |
| deshen | 8.5 | 7 | 2.9 | 6.5 | 2.9 |
| maaracha | 5.9 | 12 | 0 | 3.9 | 0 |
| payis2 | 13.1 | 1 | 0 | 11.4 | 0 |
| barkai | 5.4 | 1 | 0 | 4.6 | 0 |
| taleh | 7.9 | 12 | 1.5 | 5.9 | 1.5 |
| heichal | 9.2 | 14 | 3.1 | 7.2 | 3.1 |
| zerika | 8.3 | 7 | 2.4 | 6.3 | 2.4 |
| evarim | 5.6 | 11 | 0 | 3.6 | 0 |
| payis3 | 9.6 | 1 | 0 | 6.4 | 0 |
| ketoret | 13.3 | 10 | 7.9 | 11.3 | 7.9 |
| birkat | 10.3 | 1 | 0 | 8.3 | 0 |
| shir | 34.2 | 34 | 14.5 | 34.1 | 16.4 |

The floor includes the persona's intro reading before its first decision (at most 4 s the first time, 2 s for the
binger), so compare the decisions and the waits. **For the Avodah agent (per-game pacing):** the song is the longest
work (34 s, 34 decisions, 14–16 s of waiting for the Levites between the three פרקים) and does not get shorter on a
repeat: one פרק on repeats would save ~10 s a morning (AVODAH.md ⚑ "three פרקים per song"). The ketoret's ~8 s of
waiting for "הקטר!" is the point of the scene (Tamid 6:3) and should stay. The second payis (13 s, one decision:
watching the count) could count faster on repeats (`gctx.repeat`). Everything else is 4–9 s with 1–14 decisions.

**Reading the tables.** "floor" is the session at the solver's pace; "human est." adds 1.1 s per decision (0.6 s for
the child). Cards count every modal (the name pick, the intro, the source cards, the summary, the ממונה). Before:
master `2be68cf`. After: branch `s3-hooks` (the final code; the auto-advance of the brief card was 3.2 s in this run,
4 s now).

**After, in words.**
1. **The regular now does his own work every morning.** The live tail is the same (the calendar decides where a live
   player joins), but the summary offers "העבודה שלך היום: <his role> · כ־3 דקות" and a late joiner gets the payis
   reveal card first (6 of 6 mornings). Each morning he played the payis and a different role's work (the limbs, the
   chavitin, the left leg, the head, the wine, the slaughter): **12 new source cards after day 1 instead of 1**, 6 roles
   instead of 5, 2–2.5 minutes a morning instead of 1.2–2.1, and 844 points (3 ממונים) after the week. Every summary
   now ends with "מחר: …". Shabbat and the first day of Sukkot were not played, and the streak went 1 → 6.
2. **The first morning** has 18–19 cards instead of 22–23 (one ממונה card for the two met, not five in a row) and
   meets 2 ממונים instead of 5. The reading share is still 51–56% for an adult first-timer: the first time keeps the
   full cards on purpose (⚑8).
3. **The binger** (three mornings, the offerings, the musaf and the aravot, the afternoon Tamid in one evening): 596
   points instead of 961, 3 ממונים instead of 9, 3 ממונה cards instead of 9, 14 brief cards on his repeats (all moved
   on by themselves), reading 35% instead of 39%, 58 words per card instead of 69. He still collects all 25 vessels in
   one evening (they belong to the works, not to the calendar), and the long goals left are the tiers (20 works with a
   tier) and the ladder.
4. **The ritual player** (only "העבודה שלך היום", seven days, keeping Shabbat): 1.3–2.4 minutes a day at the floor
   (~2–3.5 at a human pace), 3–6 works, a different role almost every day (7 roles in 6 days), 1–2 new cards a day
   after the first, 529 points (3 ממונים) after the week. A Wordle-sized day.
5. **A new player who follows the gold button** (`newRitual`): the first tap in a game after 26 s (the name and the
   intro), a complete arc in 2.4 minutes (3.2 at a human pace): the payis reveals the role, the role's own work
   "בפועל", the song, a summary with "מחר:", 104 points and the first ממונה, 6 vessels, 3 tiers.
6. **The investor** at a human pace needs ~6 minutes for the whole morning (the ketoret, the blessing and the song come
   last); the ritual shows the payis, a real role and the song in ~3. For demos, `#avodah=mine` opens straight into it.

**The real 3D build** (`node build.mjs && node test/playtest/real-handoff.cjs`, SwiftShader, phone 390×844, 7/7):
`test/out/playtest/real-b-1-menu-preview.png` (Phase A's menu: "הצצה: העבודה בבית · שלב ב׳"),
`real-b-2-invite-altar.png` (the altar complete: "מקריבים עוד לפני שיש היכל", Ezra 3:6), `real-b-3-ritual-first-game.png`
(Phase B opens into the ritual: the payis), `real-b-4-ritual-summary.png` (the summary with "מחר: פיס חדש — 12 תפקידים
שעוד לא עשית · 10 פרים במוסף"), `real-b-5-home-day-panel.png` (the day panel: הפייס · בפועל · נכחת בזמן, 3/14, the
ritual done, "הבא במקדש: שמחת בית השואבה היום ב-19:04", the Phase A line with Ezra 3:6). The harness screenshots of
the bots: `test/out/playtest/av-after-*.png`.
<!-- /phaseB-tables -->

## Phase A (Sprint 2, 25 Sep 2026 night)

Raw logs of the persona bots, before and after the hooks work. The analysis is in `docs/HOOKS.md` (§4 method, §5 the
boredom map, §8 before/after); the owner's summary is `docs/HOOKS-he.md`. Everything here is re-runnable:

```
node test/playtest/sim.mjs --label=after --map          # model-based: the real rules, six personas, virtual clock
node test/playtest/dom-bots.cjs --label=after --shots   # the real HUD (harness + fake world), Playwright fake clock
node test/playtest/report.mjs --logs                     # the tables and logs below (baseline vs after)
node test/playtest/real-shots.cjs                        # six screenshots of the new UI in the real 3D build
```

The **baseline** is branch `s2-hooks` at `3e6ea53` (Sprint 2 setup, before any hooks change). For the simulator's
baseline the same bot was run on an export of that commit (`git archive 3e6ea53`), so both sides use identical bots.
Times are **virtual** (the game's clock), shown as m:ss from the moment the game boots. Screenshots are in
`test/out/playtest/` (not committed: `test/out/` is ignored; re-run the bots to regenerate them).

Glossary of the event names (they are the game's own `onEvent` stream, `window.__GAME_LOG`): `ftue n` tutorial step ·
`boulder` a boulder shattered · `momentStart`/`moment` a key moment · `stageStart`/`stageDone` a site · `chapter` ·
`caravanStart`/`caravanBack`/`collect` · `ftueDone` · `welcome` the comeback card · and the new ones: `restCard`,
`hint` (just-in-time), `highlight` (demo reel), `mash`, `comboMilestone`, `festival`, `quarryEnough`, `weekDone`,
`sessionEnd`.

**The real 3D build.** `test/playtest/real-shots.cjs` (SwiftShader, phone 400×860) captured the new UI over the real
world: `test/out/playtest/real-ftue-coach.png` (the first coach), `real-fork-pill-strip.png` (the pill offering the
fork in the road, the strip counting down the rafts and the wagons), `real-rest-card.png` (the rest card: three
appointments, two waiting sites, the chapter ladder, "meanwhile" buttons), `real-welcome.png` (a return after three
hours: the first thing to do), `real-sukkot.png` (the Water Gate card), `real-demo-heichal.png` (the highlight reel at
the Heichal: the stage card with "נפתח עכשיו: קודש הקדשים" and the chapter ladder). No console errors. The final
`node test/game-e2e.cjs` run (50/51, see HOOKS.md §7) also shows the demo strip with "הרגע הבא ✦" and the welcome card
with its first step in `test/out/game-e2e-offline-400.png`.

**The heavy e2e runs** (`node test/game-e2e.cjs`, logs in `test/out/playtest/e2e-final*.log`): run 1 (00:03 UTC) 50/51;
run 2 (00:32) 48/51; run 3, desktop only, final code (01:00) 21/21. A/B on the baseline build (`3e6ea53`, exported to
the scratchpad) under the same load: desktop 21/21, phone 30/31 with the same single failure as ours ("first strike
within 15 s": 24.9 s wall, 4.7 s game side). See HOOKS.md §7 for the analysis (a starved page and main.js's 450 ms tap window).

**Note on the DOM "after" run.** It was taken at commit `94e52a3`. Later commits add optional things the bots do not
use (the weekly goal, the Middot quiz from day one, key-moment replays, the blocked site's sheet note) and two text
fixes; none of them changes the measured flows.

<!-- generated below by: node test/playtest/report.mjs --logs -->

### Simulator (the real rules, persona bots, virtual clock)

| persona | meaningful play | dead | hollow taps | longest dull stretch | decisions/min | wall finished at | sessions ending with a timer |
|---|---|---|---|---|---|---|---|
| firstTimer | 22.6% → **37.4%** | 70.3% → **48.3%** | 7.2% → **14.3%** | 769 s → **414 s** | 0.15 → **0.45** | never → **3:33** | 100% → **100%** |
| busyAdult | 86.6% → **86.3%** | 13.4% → **13.7%** | 0% → **0%** | 20 s → **20 s** | 1.89 → **2.07** | 4:41 → **2:50** | 90% → **100%** |
| binger | 6.2% → **10.3%** | 0% → **0%** | 93.8% → **89.7%** | 3200 s → **2760 s** | 0.08 → **0.27** | never → **2:32** | 100% → **100%** |
| returner | 92.8% → **92.2%** | 7.2% → **7.8%** | 0% → **0%** | 20 s → **20 s** | 1.7 → **1.84** | 4:41 → **2:50** | 100% → **100%** |
| child | 15% → **23.2%** | 0% → **0%** | 85% → **76.8%** | 506 s → **411 s** | 0.13 → **0.4** | never → **2:23** | 0% → **100%** |
| investor | 100% → **100%** | 0% → **0%** | 0% → **0%** | 0 s → **0 s** | 3.2 → **3.6** | 1:30 → **1:30** | 100% → **100%** |

Boredom maps (one glyph a minute: █ build · ★ key moment · ▤ card · ◆ decision · ◎ collect · ✎ learn · ◉ watch · ░ hollow taps · · dead)

- **the curious first-timer**
  - before s1 d0: `█★█✎░░··············`
  - after  s1 d0: `█★██✎✎█░······░░····`
- **the busy adult (3 × 5 min a day, 7 days)**
  - before s1 d0: `█★█✎·`
  - before s2 d0: `█✎·`
  - before s3 d0: `██✎·`
  - before s4 d1: `█✎██✎`
  - before s5 d1: `·`
  - before s6 d1: `█★·`
  - after  s1 d0: `█★█✎✎`
  - after  s2 d0: `█·`
  - after  s3 d0: `██★✎`
  - after  s4 d1: `██✎✎✎`
  - after  s5 d1: `█✎·`
  - after  s6 d1: `█·`
- **the binger (one hour)**
  - before s1 d0: `█▤✎✎░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░`
  - after  s1 d0: `█▤█✎✎░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░`
- **the returner (day 1, then back after 3 days)**
  - before s1 d0: `█★█✎·`
  - before s2 d0: `███✎✎·`
  - before s3 d3: `██·`
  - after  s1 d0: `█★█✎✎✎`
  - after  s2 d0: `█·`
  - after  s3 d3: `██★✎`
- **the child (10–12: taps a lot, reads little)**
  - before s1 d0: `█★░░░░░░░░░░░░░`
  - after  s1 d0: `█★█░░░░░░░░░░░░`
- **the investor (demo ×60, 5 minutes)**
  - before s1 d0: `████✎`
  - after  s1 d0: `█◆███`

### DOM bots (the real HUD, persona bots, virtual clock)

| persona | first strike | first boulder | crew | Mount done | wall started → done | strikes (perfect) | pill says "waiting" | dead | rest card | hooks events |
|---|---|---|---|---|---|---|---|---|---|---|
| firstTimer | 1.3 s → **1.4 s** | 2.3 s → **2.3 s** | 11.6 s → **11.6 s** | 0:49 → **0:49** | 1:22→never → **1:08→2:09** | 56 (21%) → **102 (14%)** | 90% → **85%** | 856 s → **780 s** | 6:13 | {"restCard":1} |
| child | 1.3 s → **1.3 s** | 2.2 s → **2.2 s** | 12.3 s → **12.3 s** | 0:34 → **0:34** | 0:45→never → **0:44→1:25** | 725 (88%) → **726 (0%)** | 92% → **84%** | 0 s → **0 s** | never | {"mash":637} |
| investor | 1.3 s → **1.3 s** | 2.2 s → **2.2 s** | 12.3 s → **12.6 s** | 0:21 → **0:21** | 0:44→1:01 → **0:36→0:41** | 126 (63%) → **124 (56%)** | 0% → **3%** | 76 s → **41 s** | never | {"highlight":7,"comboMilestone":19} |
| returner | 10.4 s → **10.4 s** | – → **–** | – → **–** | never → **never** | never→0:24 → **never→0:24** | 18 (17%) → **24 (17%)** | 92% → **90%** | 324 s → **312 s** | 1:11 | {"restCard":1} |
| binger | – → **1.3 s** | – → **2.2 s** | – → **12.5 s** | – → **0:29** | – → **0:47→0:59** | – → **3059 (93%)** | – → **97%** | – → **0 s** | never | {"comboMilestone":508} |

Investor, 5 minutes. Before: sites done 15, moments stone, breaches, red, shows showPlan@0 orbit@21.8 showcase@34.4 orbit@62.3 orbit@76.9 orbit@94.7 orbit@115.3 orbit@139.3 orbit@156.8 showcase@159.7 orbit@177.7 orbit@198.3 showcase@206.2 showcase@261.5.
After: sites done 15, moments stone, breaches, red, boxes, shows showPlan@0 orbit@21.8 showcase@24.6 orbit@42.3 orbit@57.9 orbit@81.6 orbit@84.3 orbit@110.8 orbit@121.9 orbit@139.8 orbit@141.3 showcase@146.2 orbit@161.3 showcase@164.1 orbit@172.8 shine@203.9 orbit@205.2 showcase@250.7.

#### the curious first-timer · baseline

Screenshots: `test/out/playtest/baseline-firstTimer-00_05.png`, `test/out/playtest/baseline-firstTimer-00_30.png`, `test/out/playtest/baseline-firstTimer-01_00.png`, `test/out/playtest/baseline-firstTimer-02_00.png`, `test/out/playtest/baseline-firstTimer-03_00.png`, `test/out/playtest/baseline-firstTimer-05_00.png`, `test/out/playtest/baseline-firstTimer-08_00.png`, `test/out/playtest/baseline-firstTimer-12_00.png`, `test/out/playtest/baseline-firstTimer-20_00.png`, `test/out/playtest/baseline-firstTimer-end.png`

Events (virtual time m:ss):
```
 0:00.0  start {"isNew":true,"demo":false}
 0:00.0  ftue 0
 0:02.3  boulder {"i":0,"left":11}
 0:03.9  ftue 1
 0:04.9  boulder {"i":1,"left":10}
 0:04.9  ftue 2
 0:05.6  ftue 3
 0:11.6  crew {"n":1}
 0:15.1  ftue 4
 0:40.0  name {"mishmar":7}
 0:40.0  ftue 5
 0:44.4  boulder {"i":11,"left":0}
 0:45.3  momentStart {"id":"har"}
 0:49.4  moment {"id":"har","skipped":false}
 0:49.4  stageDone {"id":"har","chapter":1}
 0:49.7  ftue 6
 0:50.4  caravanStart {"r":"wagons","len":"ftue"}
 0:50.4  ftue 7
 1:20.1  chapter 1
 1:20.1  caravanStart {"r":"cedar","len":"short"}
 1:21.8  stageStart {"id":"wall"}
 1:21.8  ftue 8
 5:50.7  ftue 9
 5:51.0  caravanBack
 5:53.8  collect {"r":"wagons","res":"stone","n":80,"first":true}
 5:53.8  ftue 99
 5:53.8  ftueDone
 5:54.5  caravanStart {"r":"wagons","len":"short"}
```
Goal pill (and strip), sampled:
```
 0:00.0  המטרהשיטוח ההר · 12 סלעים
 0:05.0  המטרהשיטוח ההר · 10 סלעים   ‖ coach: רב האומניםהקש כשהטבעת נסגרת
 0:10.0  המטרהשיטוח ההר · 9 סלעים
 0:15.0  המטרהשיטוח ההר · 7 סלעים   ‖ coach: רב האומנים · דמות בדויהלבד לא נגמור. הנה הצוות שלך.
 0:20.0  המטרהשיטוח ההר · 5 סלעים
 0:25.0  המטרהשיטוח ההר · 3 סלעים   ‖ card: אלף כהנים אומנים
 0:35.0  המטרהשיטוח ההר · 2 סלעים   ‖ card: איך קוראים לך?
 0:40.0  המטרהשיטוח ההר · 2 סלעים
 0:45.0  המטרהשיטוח ההר · הרגע המיוחד מחכה לך
 0:50.0  המטרהחומת העזרה · התחל לבנות   ‖ coach: רב האומניםבחר "5 דק׳" בעגלות המחצבה
 0:55.0  המטרהחומת העזרה · התחל לבנות   ‖ card: שיטוח ההר   ‖ coach: רב האומניםעכשיו: התחל לבנות את חומת העזרה
 1:00.0  המטרהחומת העזרה · התחל לבנות   ‖ card: האבן הגדולה בכותל   ‖ coach: רב האומניםעכשיו: התחל לבנות את חומת העזרה
 1:10.0  המטרהחומת העזרה · התחל לבנות   ‖ card: כתובת "לבית התקיעה"   ‖ coach: רב האומניםעכשיו: התחל לבנות את חומת העזרה
 1:15.0  המטרהחומת העזרה · התחל לבנות   ‖ card: פרק א׳ הושלם!   ‖ coach: רב האומניםעכשיו: התחל לבנות את חומת העזרה
 1:20.0  המטרהחומת העזרה · התחל לבנות   ‖ coach: רב האומניםעכשיו: התחל לבנות את חומת העזרה
 1:25.0  המטרהחומת העזרה · יסודות · 6%   ‖ coach: רב האומניםצוות אחד בונה את החומה והשני חוצב אבן במחצבה. אפשר
 1:30.0  המטרהחומת העזרה · יסודות · 14%
 1:35.0  המטרהחומת העזרה · מבנה · 23%
 2:05.0  המטרהחומת העזרה · חסר ארז 20
```
Summary: strikes 56 (21% perfect), taps 56, idle 883 s, dead 856 s, hollow 0 s, pill "waiting" 90% of samples, moments [{"kind":"stone","s":3.2,"skipped":false}].

#### the child (10–12) · baseline

Screenshots: `test/out/playtest/baseline-child-00_20.png`, `test/out/playtest/baseline-child-01_30.png`, `test/out/playtest/baseline-child-04_00.png`, `test/out/playtest/baseline-child-08_00.png`, `test/out/playtest/baseline-child-12_00.png`, `test/out/playtest/baseline-child-end.png`

Events (virtual time m:ss):
```
 0:00.0  start {"isNew":true,"demo":false}
 0:00.0  ftue 0
 0:02.2  boulder {"i":0,"left":11}
 0:03.9  ftue 1
 0:04.2  boulder {"i":1,"left":10}
 0:04.2  ftue 2
 0:06.3  ftue 3
 0:12.3  crew {"n":1}
 0:15.8  ftue 4
 0:24.6  boulder {"i":11,"left":0}
 0:25.5  momentStart {"id":"har"}
 0:33.7  moment {"id":"har","skipped":false}
 0:33.7  stageDone {"id":"har","chapter":1}
 0:39.6  caravanStart {"r":"wagons","len":"ftue"}
 0:41.5  name {"mishmar":20}
 0:41.5  ftue 5
 0:42.0  ftue 6
 0:42.0  ftue 7
 0:45.0  stageStart {"id":"wall"}
 0:45.0  ftue 8
 0:47.0  chapter 1
 5:40.0  caravanBack
 5:40.0  ftue 9
 5:41.0  collect {"r":"wagons","res":"stone","n":80,"first":true}
 5:41.0  ftue 99
 5:41.0  ftueDone
```
Goal pill (and strip), sampled:
```
 0:00.0  המטרהשיטוח ההר · 12 סלעים
 0:05.0  המטרהשיטוח ההר · 10 סלעים   ‖ coach: רב האומניםהקש כשהטבעת נסגרת
 0:10.0  המטרהשיטוח ההר · 8 סלעים
 0:15.0  המטרהשיטוח ההר · 5 סלעים   ‖ coach: רב האומנים · דמות בדויהלבד לא נגמור. הנה הצוות שלך.
 0:20.0  המטרהשיטוח ההר · 3 סלעים
 0:25.0  המטרהשיטוח ההר · הרגע המיוחד מחכה לך   ‖ card: אלף כהנים אומנים
 0:35.0  המטרהחומת העזרה · התחל לבנות   ‖ card: אלף כהנים אומנים
 0:40.0  המטרהחומת העזרה · התחל לבנות   ‖ card: איך קוראים לך?
 0:45.0  המטרהחומת העזרה · התחל לבנות
 0:50.0  המטרהחומת העזרה · יסודות · 10%   ‖ coach: רב האומניםצוות אחד בונה את החומה והשני חוצב אבן במחצבה. אפשר
 0:55.0  המטרהחומת העזרה · מבנה · 54%
 1:00.0  המטרהחומת העזרה · חסר ארז 20
 5:40.0  המטרהחומת העזרה · חסר ארז 20   ‖ coach: רב האומניםהעגלות חזרו! אסוף אותן
 5:45.0  המטרהחומת העזרה · חסר ארז 20
```
Summary: strikes 725 (88% perfect), taps 3074, idle 1467 s, dead 0 s, hollow 551 s, pill "waiting" 92% of samples, moments [{"kind":"stone","s":8,"skipped":false}].

#### the investor (demo, 5 min) · baseline

Screenshots: `test/out/playtest/baseline-investor-00_10.png`, `test/out/playtest/baseline-investor-01_00.png`, `test/out/playtest/baseline-investor-02_00.png`, `test/out/playtest/baseline-investor-03_00.png`, `test/out/playtest/baseline-investor-04_00.png`, `test/out/playtest/baseline-investor-05_00.png`, `test/out/playtest/baseline-investor-end.png`

Events (virtual time m:ss):
```
 0:00.0  start {"isNew":true,"demo":true}
 0:00.0  ftue 0
 0:02.2  boulder {"i":0,"left":11}
 0:03.9  ftue 1
 0:04.2  boulder {"i":1,"left":10}
 0:04.2  ftue 2
 0:06.3  ftue 3
 0:12.3  crew {"n":1}
 0:15.8  ftue 4
 0:16.9  momentStart {"id":"har"}
 0:20.5  moment {"id":"har","skipped":false}
 0:20.5  stageDone {"id":"har","chapter":1}
 0:37.6  name {"mishmar":7}
 0:37.6  ftue 5
 0:37.8  ftue 6
 0:40.9  chapter 1
 0:41.5  caravanStart {"r":"wagons","len":"ftue"}
 0:41.5  ftue 7
 0:42.2  caravanStart {"r":"cedar","len":"short"}
 0:43.9  stageStart {"id":"wall"}
 0:43.9  ftue 8
 0:46.9  ftue 9
 0:47.0  caravanBack
 0:47.6  collect {"r":"wagons","res":"stone","n":80,"first":true}
 0:47.6  ftue 99
 0:47.6  ftueDone
 0:48.3  caravanStart {"r":"wagons","len":"short"}
 1:01.0  stageDone {"id":"wall","chapter":null}
 1:02.0  stageStart {"id":"gates"}
 1:15.6  stageDone {"id":"gates","chapter":null}
 1:16.5  stageStart {"id":"nashim"}
 1:19.0  caravanBack
 1:20.5  collect {"r":"wagons","res":"stone","n":60,"first":false}
 1:21.2  caravanStart {"r":"wagons","len":"short"}
 1:33.4  stageDone {"id":"nashim","chapter":null}
 1:34.2  stageStart {"id":"sorag"}
 1:47.8  momentStart {"id":"sorag"}
 1:52.0  caravanBack
 1:54.0  moment {"id":"sorag","skipped":false}
 1:54.0  stageDone {"id":"sorag","chapter":null}
 1:55.0  collect {"r":"wagons","res":"stone","n":60,"first":false}
 1:58.4  caravanStart {"r":"wagons","len":"short"}
 2:02.9  stageStart {"id":"nikanor"}
 2:18.0  stageDone {"id":"nikanor","chapter":null}
 2:18.7  stageStart {"id":"lishka"}
 2:29.0  caravanBack
 2:29.8  collect {"r":"wagons","res":"stone","n":60,"first":false}
 2:30.5  caravanStart {"r":"wagons","len":"short"}
 2:35.5  stageDone {"id":"lishka","chapter":2}
 2:36.3  stageStart {"id":"yesod"}
 2:43.0  caravanBack
 2:43.3  chapter 2
 2:43.9  collect {"r":"cedar","res":"cedar","n":70,"first":true}
 2:44.6  caravanStart {"r":"cedar","len":"short"}
 2:56.4  stageDone {"id":"yesod","chapter":null}
 2:57.4  stageStart {"id":"sovev"}
 3:01.0  caravanBack
 3:02.2  collect {"r":"wagons","res":"stone","n":60,"first":false}
 3:02.9  caravanStart {"r":"wagons","len":"short"}
 3:13.9  momentStart {"id":"sovev"}
 3:17.0  moment {"id":"sovev","skipped":false}
 3:17.0  stageDone {"id":"sovev","chapter":null}
 3:18.0  stageStart {"id":"guf"}
 3:26.2  stageDone {"id":"guf","chapter":null,"skipped":true}
 3:26.2  stageDone {"id":"karnot","chapter":null,"skipped":true}
 3:26.2  stageDone {"id":"kiyor","chapter":3,"skipped":true}
 3:30.5  chapter 3
 3:33.0  caravanBack
 3:34.1  collect {"r":"wagons","res":"stone","n":60,"first":false}
 3:34.8  caravanStart {"r":"wagons","len":"short"}
 3:35.5  caravanStart {"r":"alexandria","len":"short"}
 4:05.0  caravanBack
 4:05.7  collect {"r":"wagons","res":"stone","n":60,"first":false}
 4:06.4  caravanStart {"r":"wagons","len":"short"}
 4:21.5  stageDone {"id":"ulam","chapter":null,"skipped":true}
 4:21.5  stageDone {"id":"heichal","chapter":null,"skipped":true}
 4:21.5  stageDone {"id":"kodesh","chapter":4,"skipped":true}
 4:25.7  chapter 4
 4:29.0  finale
 4:37.0  caravanBack
 4:38.1  collect {"r":"wagons","res":"stone","n":60,"first":false}
 4:38.8  caravanStart {"r":"wagons","len":"short"}
 4:45.0  caravanBack
 4:46.0  collect {"r":"cedar","res":"cedar","n":70,"first":false}
 4:46.7  caravanStart {"r":"cedar","len":"short"}
```
Goal pill (and strip), sampled:
```
 0:00.0  המטרהשיטוח ההר · 12 סלעים
 0:05.0  המטרהשיטוח ההר · 10 סלעים   ‖ coach: רב האומניםהקש כשהטבעת נסגרת
 0:10.0  המטרהשיטוח ההר · 8 סלעים
 0:15.0  המטרהשיטוח ההר · 1 סלעים   ‖ coach: רב האומנים · דמות בדויהלבד לא נגמור. הנה הצוות שלך.
 0:20.0  המטרהשיטוח ההר · הרגע המיוחד מחכה לך
 0:25.0  המטרהחומת העזרה · התחל לבנות   ‖ card: האבן הגדולה בכותל
 0:30.0  המטרהחומת העזרה · התחל לבנות   ‖ card: אלף כהנים אומנים
 0:35.0  המטרהחומת העזרה · התחל לבנות   ‖ card: איך קוראים לך?
 0:40.0  המטרהחומת העזרה · התחל לבנות   ‖ card: פרק א׳ הושלם!   ‖ coach: רב האומניםשלח את עגלות המחצבה: הן יחזרו בעוד 5 דקות
 0:45.0  המטרהחומת העזרה · יסודות · 2%   ‖ coach: רב האומניםצוות אחד בונה את החומה והשני חוצב אבן במחצבה. אפשר
 0:50.0  המטרהחומת העזרה · מבנה · 15%
 1:00.0  המטרהחומת העזרה · גימור · 84%
 1:05.0  המטרהשערי העזרה · יסודות · 5%   ‖ card: חומת העזרה
 1:10.0  המטרהשערי העזרה · מבנה · 33%
 1:15.0  המטרהשערי העזרה · גימור · 95%
 1:20.0  המטרהעזרת הנשים · יסודות · 4%
 1:25.0  המטרהעזרת הנשים · מבנה · 17%
 1:35.0  המטרההסורג והחיל · יסודות · 1%   ‖ card: עזרת הנשים
 1:40.0  המטרההסורג והחיל · יסודות · 13%
 1:45.0  המטרההסורג והחיל · מבנה · 68%
 1:50.0  המטרההסורג והחיל · הרגע המיוחד מחכה לך
 1:55.0  המטרהשער ניקנור וט״ו המעלות · התחל לבנות
 2:00.0  המטרהשער ניקנור וט״ו המעלות · התחל לבנות   ‖ card: כתובת האזהרה ביוונית
 2:05.0  המטרהשער ניקנור וט״ו המעלות · יסודות · 5%
 2:10.0  המטרהשער ניקנור וט״ו המעלות · מבנה · 38%
 2:15.0  המטרהשער ניקנור וט״ו המעלות · גימור · 76%
 2:20.0  המטרההלשכות · יסודות · 2%   ‖ card: שער ניקנור וט״ו המעלות
 2:25.0  המטרההלשכות · מבנה · 21%
 2:30.0  המטרההלשכות · גימור · 70%
 2:40.0  המטרהיסוד המזבח · יסודות · 5%   ‖ card: פרק ב׳ הושלם!
 2:45.0  המטרהיסוד המזבח · יסודות · 13%
 2:50.0  המטרהיסוד המזבח · מבנה · 47%
 2:55.0  המטרהיסוד המזבח · גימור · 88%
 3:00.0  המטרההסובב · יסודות · 5%   ‖ card: יסוד המזבח
 3:05.0  המטרההסובב · מבנה · 20%
 3:10.0  המטרההסובב · גימור · 71%
 3:15.0  המטרההסובב · הרגע המיוחד מחכה לך
 3:20.0  המטרהגוף המזבח והכבש · יסודות · 2%   ‖ card: הסובב
 3:25.0  המטרהגוף המזבח והכבש · יסודות · 13%
 3:30.0  המטרההאולם · צריך 6 כהנים אומנים   ‖ card: פרק ג׳ הושלם!
 3:35.0  המטרההאולם · צריך 6 כהנים אומנים
 4:25.0  חנוכת הביתהבית נבנה   ‖ card: פרק ד׳ הושלם!
 4:30.0  חנוכת הביתהבית נבנה
```
Summary: strikes 126 (63% perfect), taps 169, idle 77 s, dead 76 s, hollow 0 s, pill "waiting" 0% of samples, moments [{"kind":"stone","s":3.3,"skipped":false},{"kind":"breaches","s":5.9,"skipped":false},{"kind":"red","s":2.7,"skipped":false}].

#### the returner (after 3 days) · baseline

Screenshots: `test/out/playtest/baseline-returner-00_02.png`, `test/out/playtest/baseline-returner-00_15.png`, `test/out/playtest/baseline-returner-01_00.png`, `test/out/playtest/baseline-returner-06_00.png`, `test/out/playtest/baseline-returner-end.png`

Events (virtual time m:ss):
```
 0:00.0  start {"isNew":false,"demo":false}
 0:00.0  welcome {"lines":3,"ms":255600000}
 0:06.5  collect {"r":"cedar","res":"cedar","n":70,"first":true}
 0:07.2  collect {"r":"wagons","res":"stone","n":400,"first":false}
 0:07.9  caravanStart {"r":"wagons","len":"short"}
 0:08.6  caravanStart {"r":"cedar","len":"short"}
 0:24.4  stageDone {"id":"wall","chapter":null}
 0:25.7  stageStart {"id":"gates"}
```
Goal pill (and strip), sampled:
```
 0:00.0  המטרהחומת העזרה · חסר ארז 20
 0:05.0  המטרהחומת העזרה · חסר ארז 20   ‖ card: בזמן שלא היית:
 0:10.0  המטרהחומת העזרה · גימור · 70%
 0:25.0  המטרהשערי העזרה · התחל לבנות
 0:30.0  המטרהשערי העזרה · יסודות · 0%   ‖ card: חומת העזרה
 0:35.0  המטרהשערי העזרה · יסודות · 12%
 0:40.0  המטרהשערי העזרה · חסר ארז 60
```
Summary: strikes 18 (17% perfect), taps 19, idle 324 s, dead 324 s, hollow 0 s, pill "waiting" 92% of samples, moments [].

#### the curious first-timer · after

Screenshots: `test/out/playtest/after-firstTimer-00_05.png`, `test/out/playtest/after-firstTimer-00_30.png`, `test/out/playtest/after-firstTimer-01_00.png`, `test/out/playtest/after-firstTimer-02_00.png`, `test/out/playtest/after-firstTimer-03_00.png`, `test/out/playtest/after-firstTimer-05_00.png`, `test/out/playtest/after-firstTimer-08_00.png`, `test/out/playtest/after-firstTimer-12_00.png`, `test/out/playtest/after-firstTimer-20_00.png`, `test/out/playtest/after-firstTimer-end.png`

Events (virtual time m:ss):
```
 0:00.0  start {"isNew":true,"demo":false}
 0:00.0  ftue 0
 0:02.3  boulder {"i":0,"left":11}
 0:03.9  ftue 1
 0:04.9  boulder {"i":1,"left":10}
 0:04.9  ftue 2
 0:05.6  ftue 3
 0:11.6  crew {"n":1}
 0:15.1  ftue 4
 0:41.4  name {"mishmar":7}
 0:41.4  ftue 5
 0:44.4  boulder {"i":11,"left":0}
 0:45.3  momentStart {"id":"har"}
 0:49.4  moment {"id":"har","skipped":false}
 0:49.4  stageDone {"id":"har","chapter":1}
 0:49.7  ftue 6
 0:50.4  caravanStart {"r":"wagons","len":"ftue"}
 0:50.4  ftue 7
 0:58.4  caravanStart {"r":"cedar","len":"ftue"}
 1:06.6  chapter 1
 1:07.6  stageStart {"id":"wall"}
 1:07.6  ftue 8
 2:08.5  stageDone {"id":"wall","chapter":null}
 2:17.2  stageStart {"id":"gates"}
 2:25.3  stageStart {"id":"nashim"}
 4:58.9  ftue 9
 4:59.0  caravanBack
 5:09.6  collect {"r":"cedar","res":"cedar","n":120,"first":true}
 5:09.6  ftue 99
 5:09.6  ftueDone
 5:10.3  caravanStart {"r":"alexandria","len":"ftue"}
 5:51.0  caravanBack
 5:51.7  collect {"r":"wagons","res":"stone","n":80,"first":true}
 5:52.4  caravanStart {"r":"cedar","len":"short"}
 6:13.0  restCard {"appts":2,"next":837300,"blocked":2}
```
Goal pill (and strip), sampled:
```
 0:00.0  המטרהשיטוח ההר · 12 סלעים
 0:05.0  המטרהשיטוח ההר · 10 סלעים   ‖ coach: רב האומניםהקש כשהטבעת נסגרת
 0:10.0  המטרהשיטוח ההר · 9 סלעים
 0:15.0  המטרהשיטוח ההר · 7 סלעים   ‖ coach: רב האומנים · דמות בדויהלבד לא נגמור. הנה הצוות שלך.
 0:20.0  המטרהשיטוח ההר · 5 סלעים
 0:25.0  המטרהשיטוח ההר · 3 סלעים   ‖ card: אלף כהנים אומנים
 0:35.0  המטרהשיטוח ההר · 2 סלעים   ‖ card: איך קוראים לך?
 0:45.0  המטרהשיטוח ההר · הרגע המיוחד מחכה לך
 0:50.0  המטרהחומת העזרה · התחל לבנות   ‖ coach: רב האומניםבחר "5 דק׳" בעגלות המחצבה
 0:55.0  המטרהחומת העזרה · התחל לבנות   ‖ strip: אבן4:56   ‖ card: שיטוח ההר   ‖ coach: רב האומניםעכשיו: התחל לבנות את חומת העזרה
 1:00.0  המטרהחומת העזרה · התחל לבנות   ‖ strip: ארז3:59אבן4:51   ‖ card: פרק א׳ הושלם!   ‖ coach: רב האומניםעכשיו: התחל לבנות את חומת העזרה
 1:10.0  המטרהחומת העזרה · יסודות · 6%   ‖ strip: ארז3:49אבן4:41   ‖ coach: רב האומניםצוות אחד בונה את החומה והשני חוצב אבן במחצבה. אפשר
 1:15.0  המטרהחומת העזרה · יסודות · 12%   ‖ strip: החומה2:16ארז3:44
 1:20.0  המטרהחומת העזרה · מבנה · 21%   ‖ strip: ארז3:39אבן4:31
 1:50.0  המטרהחומת העזרה · מבנה · 69%   ‖ strip: החומה0:30ארז3:09
 1:55.0  המטרהחומת העזרה · גימור · 77%   ‖ strip: ארז3:04אבן3:56
 2:10.0  המטרהשערי העזרה · התחל לבנות   ‖ strip: ארז2:49אבן3:41   ‖ card: חומת העזרה
 2:20.0  המטרהשערי העזרה · יסודות · 7%   ‖ strip: ארז2:39אבן3:31
 2:25.0  המטרהשערי העזרה · חסר ארז 110 · בינתיים אפשר להתחיל: עזרת הנשים   ‖ strip: ארז2:34אבן3:26
 2:30.0  המטרהעזרת הנשים · יסודות · 9%   ‖ strip: ארז2:29אבן3:21
 2:35.0  המטרהשערי העזרה · חסר ארז 110 · מגיע בעוד 2:24   ‖ strip: ארז2:24אבן3:16
 5:00.0  המטרהשערי העזרה · חסר ארז 110 · מגיע בעוד 0:00   ‖ strip: ארזחזרה!אבן0:51   ‖ coach: רב האומניםהעגלות חזרו! אסוף אותן
 5:10.0  המטרהשערי העזרה · מבנה · 15%   ‖ strip: אבן0:41השערים43:59
 5:15.0  המטרהשערי העזרה · מבנה · 25%   ‖ strip: אבן0:36נחושת14:56
 5:30.0  המטרהשערי העזרה · מבנה · 52%   ‖ strip: אבן0:21השערים13:40
 5:40.0  המטרהשערי העזרה · חסר ארז 80 · כל המשלחות בדרך · אחת חוזרת בעוד 0:11   ‖ strip: אבן0:11נחושת14:31
 5:55.0  המטרהשערי העזרה · חסר ארז 80 · עוד משלחת בדרך · 1:59:58   ‖ strip: נחושת14:16ארז1:59:58
 6:15.0  המטרהשערי העזרה · חסר ארז 80 · עוד משלחת בדרך · 1:59:38   ‖ strip: נחושת13:56ארז1:59:38   ‖ card: האתר עובד בשבילך
 6:25.0  המטרהשערי העזרה · חסר ארז 80 · עוד משלחת בדרך · 1:59:28   ‖ strip: נחושת13:46ארז1:59:28
```
Summary: strikes 102 (14% perfect), taps 102, idle 805 s, dead 780 s, hollow 0 s, pill "waiting" 85% of samples, moments [{"kind":"stone","s":3.2,"skipped":false}], hooks {"restCard":1}.

#### the child (10–12) · after

Screenshots: `test/out/playtest/after-child-00_20.png`, `test/out/playtest/after-child-01_30.png`, `test/out/playtest/after-child-04_00.png`, `test/out/playtest/after-child-08_00.png`, `test/out/playtest/after-child-12_00.png`, `test/out/playtest/after-child-end.png`

Events (virtual time m:ss):
```
 0:00.0  start {"isNew":true,"demo":false}
 0:00.0  ftue 0
 0:02.2  boulder {"i":0,"left":11}
 0:03.9  ftue 1
 0:04.2  boulder {"i":1,"left":10}
 0:04.2  ftue 2
 0:06.3  ftue 3
 0:12.3  crew {"n":1}
 0:15.8  ftue 4
 0:24.6  boulder {"i":11,"left":0}
 0:25.5  momentStart {"id":"har"}
 0:33.8  moment {"id":"har","skipped":false}
 0:33.8  stageDone {"id":"har","chapter":1}
 0:38.6  name {"mishmar":14}
 0:38.6  ftue 5
 0:38.7  caravanStart {"r":"wagons","len":"ftue"}
 0:39.2  ftue 6
 0:39.2  ftue 7
 0:40.6  caravanStart {"r":"cedar","len":"ftue"}
 0:42.5  chapter 1
 0:43.6  stageStart {"id":"wall"}
 0:43.6  ftue 8
 1:25.4  stageDone {"id":"wall","chapter":null}
 1:26.1  stageStart {"id":"gates"}
 2:01.3  quarryEnough
 4:40.7  ftue 9
 4:41.0  caravanBack
 4:41.4  collect {"r":"cedar","res":"cedar","n":120,"first":true}
 4:41.4  ftue 99
 4:41.4  ftueDone
 4:42.1  caravanStart {"r":"alexandria","len":"ftue"}
 5:39.0  caravanBack
 5:39.6  collect {"r":"wagons","res":"stone","n":80,"first":true}
 5:40.3  caravanStart {"r":"beitkerem","len":"ftue"}
```
Goal pill (and strip), sampled:
```
 0:00.0  המטרהשיטוח ההר · 12 סלעים
 0:05.0  המטרהשיטוח ההר · 10 סלעים   ‖ coach: רב האומניםהקש כשהטבעת נסגרת
 0:10.0  המטרהשיטוח ההר · 8 סלעים
 0:15.0  המטרהשיטוח ההר · 5 סלעים   ‖ coach: רב האומנים · דמות בדויהלבד לא נגמור. הנה הצוות שלך.
 0:20.0  המטרהשיטוח ההר · 3 סלעים
 0:25.0  המטרהשיטוח ההר · הרגע המיוחד מחכה לך   ‖ card: אלף כהנים אומנים
 0:35.0  המטרהחומת העזרה · התחל לבנות   ‖ card: איך קוראים לך?
 0:40.0  המטרהחומת העזרה · התחל לבנות   ‖ strip: אבן4:59   ‖ card: שיטוח ההר   ‖ coach: רב האומניםעכשיו: התחל לבנות את חומת העזרה
 0:45.0  המטרהחומת העזרה · יסודות · 2%   ‖ strip: ארז3:56אבן4:54   ‖ coach: רב האומניםצוות אחד בונה את החומה והשני חוצב אבן במחצבה. אפשר
 0:50.0  המטרהחומת העזרה · יסודות · 12%   ‖ strip: החומה2:17ארז3:51   ‖ coach: רב האומניםצוות אחד בונה את החומה והשני חוצב אבן במחצבה. אפשר
 0:55.0  המטרהחומת העזרה · מבנה · 25%   ‖ strip: ארז3:46אבן4:44   ‖ coach: רב האומניםטיפ: הקש פעם אחת, בדיוק כשטבעת הזהב נסגרת. כך מקבל
 1:00.0  המטרהחומת העזרה · מבנה · 37%   ‖ strip: ארז3:41אבן4:39
 1:15.0  המטרהחומת העזרה · גימור · 73%   ‖ strip: ארז3:26אבן4:24
 1:25.0  המטרהחומת העזרה · גימור · 98%   ‖ strip: החומה1:19ארז3:16
 1:30.0  המטרהשערי העזרה · יסודות · 5%   ‖ strip: ארז3:11אבן4:09
 1:35.0  המטרהשערי העזרה · חסר ארז 110 · בינתיים אפשר להתחיל: עזרת הנשים   ‖ strip: ארז3:06אבן4:04
 2:45.0  המטרהשערי העזרה · חסר ארז 110 · מגיע בעוד 1:56   ‖ strip: ארז1:56אבן2:54
 4:45.0  המטרהשערי העזרה · מבנה · 20%   ‖ strip: אבן0:54נחושת14:58
 5:00.0  המטרהשערי העזרה · מבנה · 62%   ‖ strip: אבן0:39השערים5:42
 5:05.0  המטרהשערי העזרה · חסר ארז 80 · בינתיים אפשר להתחיל: עזרת הנשים   ‖ strip: אבן0:34נחושת14:38
 5:40.0  המטרהשערי העזרה · חסר ארז 80 · שלח משלחת   ‖ strip: נחושת14:03
 5:45.0  המטרהשערי העזרה · חסר ארז 80 · בינתיים אפשר להתחיל: עזרת הנשים   ‖ strip: אבנים שלמות7:56נחושת13:58
```
Summary: strikes 726 (0% perfect), taps 3089, idle 1327 s, dead 0 s, hollow 498 s, pill "waiting" 84% of samples, moments [{"kind":"stone","s":8,"skipped":false}], hooks {"mash":637}.

#### the investor (demo, 5 min) · after

Screenshots: `test/out/playtest/after-investor-00_10.png`, `test/out/playtest/after-investor-01_00.png`, `test/out/playtest/after-investor-02_00.png`, `test/out/playtest/after-investor-03_00.png`, `test/out/playtest/after-investor-04_00.png`, `test/out/playtest/after-investor-05_00.png`, `test/out/playtest/after-investor-end.png`

Events (virtual time m:ss):
```
 0:00.0  start {"isNew":true,"demo":true}
 0:00.0  ftue 0
 0:02.2  boulder {"i":0,"left":11}
 0:03.9  ftue 1
 0:04.2  boulder {"i":1,"left":10}
 0:04.2  ftue 2
 0:06.6  ftue 3
 0:12.6  crew {"n":1}
 0:16.1  ftue 4
 0:16.9  momentStart {"id":"har"}
 0:20.5  moment {"id":"har","skipped":false}
 0:20.5  stageDone {"id":"har","chapter":1}
 0:27.8  chapter 1
 0:27.8  ftue 6
 0:31.2  caravanStart {"r":"wagons","len":"ftue"}
 0:31.2  ftue 7
 0:34.6  name {"mishmar":7}
 0:34.7  caravanStart {"r":"cedar","len":"ftue"}
 0:36.4  stageStart {"id":"wall"}
 0:36.4  ftue 8
 0:36.4  ftue 9
 0:37.0  caravanBack
 0:37.7  collect {"r":"wagons","res":"stone","n":80,"first":true}
 0:37.7  ftue 99
 0:37.7  ftueDone
 0:38.4  caravanStart {"r":"wagons","len":"short"}
 0:39.0  caravanBack
 0:39.1  collect {"r":"cedar","res":"cedar","n":120,"first":true}
 0:39.8  caravanStart {"r":"cedar","len":"short"}
 0:40.9  highlight {"id":"wall","how":"live"}
 0:41.0  stageDone {"id":"wall","chapter":null}
 0:45.7  stageStart {"id":"gates"}
 0:56.6  stageDone {"id":"gates","chapter":null}
 0:57.4  stageStart {"id":"nashim"}
 1:09.0  caravanBack
 1:09.4  collect {"r":"wagons","res":"stone","n":60,"first":false}
 1:10.1  caravanStart {"r":"alexandria","len":"ftue"}
 1:12.9  highlight {"id":"sorag","how":"moment"}
 1:13.8  momentStart {"id":"sorag"}
 1:20.3  moment {"id":"sorag","skipped":false}
 1:20.3  stageDone {"id":"sorag","chapter":null}
 1:23.0  stageDone {"id":"nashim","chapter":null}
 1:26.0  caravanBack
 1:28.0  stageStart {"id":"nikanor"}
 1:29.3  collect {"r":"alexandria","res":"bronze","n":120,"first":true}
 1:32.7  caravanStart {"r":"beitkerem","len":"ftue"}
 1:41.0  caravanBack
 1:41.9  collect {"r":"beitkerem","res":"wstone","n":60,"first":true}
 1:42.6  caravanStart {"r":"wagons","len":"short"}
 1:45.3  stageDone {"id":"yesod","chapter":null,"skipped":true}
 1:45.3  highlight {"id":"sovev","how":"moment"}
 1:46.2  momentStart {"id":"sovev"}
 1:49.5  moment {"id":"sovev","skipped":false}
 1:49.5  stageDone {"id":"sovev","chapter":null}
 2:00.6  stageDone {"id":"nikanor","chapter":null}
 2:01.4  stageStart {"id":"lishka"}
 2:13.0  caravanBack
 2:14.4  collect {"r":"wagons","res":"stone","n":60,"first":false}
 2:15.1  caravanStart {"r":"wagons","len":"short"}
 2:17.8  stageDone {"id":"guf","chapter":null,"skipped":true}
 2:17.8  highlight {"id":"karnot","how":"live"}
 2:18.5  stageDone {"id":"karnot","chapter":null}
 2:20.0  stageDone {"id":"lishka","chapter":2}
 2:26.2  stageStart {"id":"kiyor"}
 2:33.2  chapter 2
 2:40.0  stageDone {"id":"kiyor","chapter":3}
 2:40.0  caravanBack
 2:44.1  collect {"r":"cedar","res":"cedar","n":70,"first":false}
 2:46.0  caravanBack
 2:47.6  chapter 3
 2:47.6  collect {"r":"wagons","res":"stone","n":60,"first":false}
 2:48.3  caravanStart {"r":"wagons","len":"short"}
 2:49.0  caravanStart {"r":"cedar","len":"short"}
 2:49.7  caravanStart {"r":"alexandria","len":"short"}
 2:50.8  highlight {"id":"ulam","how":"live"}
 2:51.5  stageDone {"id":"ulam","chapter":null}
 2:55.6  stageStart {"id":"heichal"}
 3:19.0  caravanBack
 3:19.8  collect {"r":"wagons","res":"stone","n":60,"first":false}
 3:20.5  caravanStart {"r":"wagons","len":"short"}
 3:23.2  highlight {"id":"heichal","how":"live"}
 3:23.9  stageDone {"id":"heichal","chapter":null}
 3:28.1  stageStart {"id":"kodesh"}
 3:51.0  caravanBack
 3:51.7  collect {"r":"wagons","res":"stone","n":60,"first":false}
 3:52.4  caravanStart {"r":"wagons","len":"short"}
 3:55.5  highlight {"id":"kodesh","how":"moment"}
 3:56.4  momentStart {"id":"kodesh"}
 4:06.6  moment {"id":"kodesh","skipped":false}
 4:06.6  stageDone {"id":"kodesh","chapter":4}
 4:14.0  chapter 4
 4:17.2  finale
 4:23.0  caravanBack
 4:23.9  collect {"r":"wagons","res":"stone","n":60,"first":false}
 4:24.6  caravanStart {"r":"wagons","len":"short"}
 4:49.0  caravanBack
 4:49.8  collect {"r":"cedar","res":"cedar","n":70,"first":false}
 4:50.5  caravanStart {"r":"cedar","len":"short"}
 4:55.0  caravanBack
 4:55.7  collect {"r":"wagons","res":"stone","n":60,"first":false}
 4:56.4  caravanStart {"r":"wagons","len":"short"}
```
Goal pill (and strip), sampled:
```
 0:00.0  המטרהשיטוח ההר · 12 סלעים
 0:05.0  המטרהשיטוח ההר · 10 סלעים   ‖ coach: רב האומניםהקש כשהטבעת נסגרת
 0:10.0  המטרהשיטוח ההר · 8 סלעים
 0:15.0  המטרהשיטוח ההר · 1 סלעים   ‖ coach: רב האומנים · דמות בדויהלבד לא נגמור. הנה הצוות שלך.
 0:20.0  המטרהשיטוח ההר · הרגע המיוחד מחכה לך
 0:25.0  המטרהחומת העזרה · התחל לבנות   ‖ card: פרק א׳ הושלם!
 0:30.0  המטרהחומת העזרה · התחל לבנות   ‖ card: אלף כהנים אומנים   ‖ coach: רב האומניםבחר "5 דק׳" בעגלות המחצבה
 0:35.0  המטרהחומת העזרה · התחל לבנות   ‖ strip: אבן0:02ארז0:04   ‖ coach: רב האומניםעכשיו: התחל לבנות את חומת העזרה
 0:40.0  המטרהחומת העזרה · יסודות · 4%   ‖ strip: החומה0:11אבן0:29
 0:45.0  המטרהשערי העזרה · התחל לבנות   ‖ strip: אבן0:24ארז1:55
 0:50.0  המטרהשערי העזרה · מבנה · 21%   ‖ strip: אבן0:19השערים0:39
 0:55.0  המטרהשערי העזרה · גימור · 80%   ‖ strip: אבן0:14השערים0:16
 1:00.0  המטרהעזרת הנשים · יסודות · 3%   ‖ strip: אבן0:09עזרת הנשים0:11   ‖ card: שערי העזרה
 1:05.0  המטרהעזרת הנשים · מבנה · 27%   ‖ strip: אבן0:04עזרת הנשים0:38
 1:10.0  המטרהעזרת הנשים · גימור · 73%   ‖ strip: עזרת הנשים0:23ארז1:30
 1:15.0  המטרההסורג והחיל · הרגע המיוחד מחכה לך   ‖ strip: נחושת0:11עזרת הנשים0:12
 1:25.0  המטרהשער ניקנור וט״ו המעלות · התחל לבנות   ‖ strip: נחושת0:01ארז1:15   ‖ card: עזרת הנשים
 1:30.0  המטרהשער ניקנור וט״ו המעלות · יסודות · 3%   ‖ strip: ניקנור0:11ארז1:10   ‖ card: סערה בים
 1:35.0  המטרהשער ניקנור וט״ו המעלות · יסודות · 9%   ‖ strip: ניקנור0:06אבנים שלמות0:06   ‖ card: דלת אחת לים
 1:40.0  המטרהשער ניקנור וט״ו המעלות · יסודות · 14%   ‖ strip: ניקנור0:01אבנים שלמות0:01
 1:45.0  המטרהשער ניקנור וט״ו המעלות · מבנה · 34%   ‖ strip: אבן0:28ניקנור0:32
 1:55.0  המטרהשער ניקנור וט״ו המעלות · מבנה · 52%   ‖ strip: ניקנור0:16אבן0:18
 2:00.0  המטרהשער ניקנור וט״ו המעלות · גימור · 96%   ‖ strip: ניקנור0:03אבן0:13
 2:05.0  המטרההלשכות · יסודות · 5%   ‖ strip: אבן0:08הלשכות0:08
 2:10.0  המטרההלשכות · מבנה · 41%   ‖ strip: אבן0:03הלשכות0:23
 2:15.0  המטרההלשכות · גימור · 85%   ‖ strip: הלשכות0:12ארז0:25
 2:20.0  המטרההכיור · התחל לבנות   ‖ strip: ארז0:20אבן0:26   ‖ card: הקרנות
 2:25.0  המטרההכיור · התחל לבנות   ‖ strip: ארז0:15אבן0:21   ‖ card: הלשכות
 2:30.0  המטרההכיור · יסודות · 6%   ‖ strip: הכיור0:05ארז0:10   ‖ card: פרק ב׳ הושלם!
 2:35.0  המטרההכיור · מבנה · 28%   ‖ strip: ארז0:05אבן0:11
 2:40.0  המטרההאולם · צריך 6 כהנים אומנים · הכשר כהנים   ‖ strip: ארזחזרה!אבן0:06
 2:45.0  המטרההאולם · צריך 6 כהנים אומנים · הכשר כהנים   ‖ strip: אבן0:01   ‖ card: פרק ג׳ הושלם!
 2:50.0  המטרההאולם · צריך 6 כהנים אומנים · הכשר כהנים   ‖ strip: אבן0:29ארז1:59
 2:55.0  המטרהההיכל · התחל לבנות   ‖ strip: אבן0:24ארז1:54   ‖ card: האולם
 3:00.0  המטרהההיכל · יסודות · 2%   ‖ strip: אבן0:19ההיכל0:29
 3:05.0  המטרהההיכל · יסודות · 10%   ‖ strip: ההיכל0:12אבן0:14
 3:10.0  המטרהההיכל · מבנה · 21%   ‖ strip: אבן0:09ארז1:39
 3:15.0  המטרהההיכל · מבנה · 34%   ‖ strip: אבן0:04ההיכל1:26
 3:20.0  המטרהההיכל · מבנה · 51%   ‖ strip: ההיכל0:45ארז1:29
 3:25.0  המטרהקודש הקדשים · התחל לבנות   ‖ strip: אבן0:26ארז1:24
 3:30.0  המטרהקודש הקדשים · יסודות · 2%   ‖ strip: קודש הקדשים0:20אבן0:21
 3:35.0  המטרהקודש הקדשים · מבנה · 23%   ‖ strip: אבן0:16ארז1:14
 3:40.0  המטרהקודש הקדשים · מבנה · 37%   ‖ strip: אבן0:11קודש הקדשים0:52
 3:50.0  המטרהקודש הקדשים · חסר ארז 90 · עוד משלחת בדרך · 0:59   ‖ strip: אבן0:01ארז0:59
 4:00.0  המטרהקודש הקדשים · הרגע המיוחד מחכה לך   ‖ strip: אבן0:23ארז0:49
 4:10.0  חנוכת הביתהבית נבנה   ‖ strip: אבן0:13ארז0:39   ‖ card: קודש הקדשים
 4:15.0  חנוכת הביתהבית נבנה   ‖ strip: אבן0:08ארז0:34   ‖ card: חנוכת הבית
 4:20.0  חנוכת הביתהבית נבנה   ‖ strip: אבן0:03ארז0:29
 4:25.0  חנוכת הביתהבית נבנה   ‖ strip: ארז0:24אבן0:30
 4:50.0  חנוכת הביתהבית נבנה   ‖ strip: אבן0:05נחושת1:00
 4:55.0  חנוכת הביתהבית נבנה   ‖ strip: אבןחזרה!נחושת0:55
 5:00.0  חנוכת הביתהבית נבנה   ‖ strip: אבן0:27נחושת0:50
```
Summary: strikes 124 (56% perfect), taps 168, idle 41 s, dead 41 s, hollow 0 s, pill "waiting" 3% of samples, moments [{"kind":"stone","s":3.3,"skipped":false},{"kind":"breaches","s":5.9,"skipped":false},{"kind":"red","s":2.7,"skipped":false},{"kind":"boxes","s":9.6,"skipped":false}], hooks {"highlight":7,"comboMilestone":19}.

#### the returner (after 3 days) · after

Screenshots: `test/out/playtest/after-returner-00_02.png`, `test/out/playtest/after-returner-00_15.png`, `test/out/playtest/after-returner-01_00.png`, `test/out/playtest/after-returner-06_00.png`, `test/out/playtest/after-returner-end.png`

Events (virtual time m:ss):
```
 0:00.0  start {"isNew":false,"demo":false}
 0:00.0  welcome {"lines":4,"ms":255600000}
 0:06.5  collect {"r":"cedar","res":"cedar","n":70,"first":true}
 0:07.2  collect {"r":"wagons","res":"stone","n":400,"first":false}
 0:07.9  caravanStart {"r":"wagons","len":"short"}
 0:08.6  caravanStart {"r":"cedar","len":"short"}
 0:24.4  stageDone {"id":"wall","chapter":null}
 0:25.7  stageStart {"id":"gates"}
 0:37.1  stageStart {"id":"nashim"}
 1:11.0  restCard {"appts":2,"next":1736850,"blocked":2}
```
Goal pill (and strip), sampled:
```
 0:00.0  המטרהחומת העזרה · חסר ארז 20 · מגיע בעוד 0:00   ‖ strip: ארזחזרה!אבןחזרה!
 0:05.0  המטרהחומת העזרה · חסר ארז 20 · מגיע בעוד 0:00   ‖ strip: ארזחזרה!אבןחזרה!   ‖ card: בזמן שלא היית:
 0:10.0  המטרהחומת העזרה · גימור · 70%   ‖ strip: החומה28:44אבן29:58
 0:25.0  המטרהשערי העזרה · התחל לבנות   ‖ strip: אבן29:43ארז1:59:44
 0:30.0  המטרהשערי העזרה · יסודות · 0%   ‖ strip: השערים11:55אבן29:38   ‖ card: חומת העזרה
 0:35.0  המטרהשערי העזרה · יסודות · 12%   ‖ strip: השערים1:51אבן29:33
 0:40.0  המטרהעזרת הנשים · יסודות · 6%   ‖ strip: עזרת הנשים7:09אבן29:28
 0:45.0  המטרהשערי העזרה · חסר ארז 60 · מגיע בעוד 1:59:24   ‖ strip: אבן29:23ארז1:59:24
 1:15.0  המטרהשערי העזרה · חסר ארז 60 · מגיע בעוד 1:58:54   ‖ strip: אבן28:53ארז1:58:54   ‖ card: האתר עובד בשבילך
 1:20.0  המטרהשערי העזרה · חסר ארז 60 · מגיע בעוד 1:58:49   ‖ strip: אבן28:48ארז1:58:49
```
Summary: strikes 24 (17% perfect), taps 25, idle 312 s, dead 312 s, hollow 0 s, pill "waiting" 90% of samples, moments [], hooks {"restCard":1}.

#### the binger (first hour) · after

Screenshots: `test/out/playtest/after-binger-10_00.png`, `test/out/playtest/after-binger-30_00.png`, `test/out/playtest/after-binger-60_00.png`, `test/out/playtest/after-binger-end.png`

Events (virtual time m:ss):
```
 0:00.0  start {"isNew":true,"demo":false}
 0:00.0  ftue 0
 0:02.2  boulder {"i":0,"left":11}
 0:03.9  ftue 1
 0:04.3  boulder {"i":1,"left":10}
 0:04.3  ftue 2
 0:06.5  ftue 3
 0:12.5  crew {"n":1}
 0:16.0  ftue 4
 0:25.0  boulder {"i":11,"left":0}
 0:25.9  momentStart {"id":"har"}
 0:29.4  moment {"id":"har","skipped":false}
 0:29.4  stageDone {"id":"har","chapter":1}
 0:36.8  name {"mishmar":7}
 0:36.8  ftue 5
 0:36.8  caravanStart {"r":"wagons","len":"ftue"}
 0:37.1  ftue 6
 0:37.1  ftue 7
 0:41.3  caravanStart {"r":"cedar","len":"ftue"}
 0:45.7  chapter 1
 0:46.7  stageStart {"id":"wall"}
 0:46.7  ftue 8
 0:59.4  stageDone {"id":"wall","chapter":null}
 1:00.6  stageStart {"id":"gates"}
 1:09.9  stageStart {"id":"nashim"}
 1:55.1  quarryEnough
 4:41.4  ftue 9
 4:42.0  caravanBack
 4:42.6  collect {"r":"cedar","res":"cedar","n":120,"first":true}
 4:42.6  ftue 99
 4:42.6  ftueDone
 4:43.3  caravanStart {"r":"alexandria","len":"ftue"}
 5:37.0  caravanBack
 5:37.7  collect {"r":"wagons","res":"stone","n":80,"first":true}
 5:38.4  caravanStart {"r":"cedar","len":"short"}
11:55.9  quarryEnough
19:44.0  caravanBack
19:44.8  collect {"r":"alexandria","res":"bronze","n":120,"first":true}
19:49.2  caravanStart {"r":"beitkerem","len":"ftue"}
21:56.5  quarryEnough
27:50.0  caravanBack
27:53.3  collect {"r":"beitkerem","res":"wstone","n":60,"first":true}
27:54.0  caravanStart {"r":"wagons","len":"short"}
27:56.0  stageStart {"id":"yesod"}
31:59.5  quarryEnough
41:59.7  quarryEnough
51:59.9  quarryEnough
57:55.0  caravanBack
57:57.7  collect {"r":"wagons","res":"stone","n":60,"first":false}
57:58.4  caravanStart {"r":"wagons","len":"short"}
```
Goal pill (and strip), sampled:
```
 0:00.0  המטרהשיטוח ההר · 12 סלעים
 0:05.0  המטרהשיטוח ההר · 10 סלעים   ‖ coach: רב האומניםהקש כשהטבעת נסגרת
 0:10.0  המטרהשיטוח ההר · 8 סלעים
 0:15.0  המטרהשיטוח ההר · 5 סלעים   ‖ coach: רב האומנים · דמות בדויהלבד לא נגמור. הנה הצוות שלך.
 0:20.0  המטרהשיטוח ההר · 3 סלעים
 0:25.0  המטרהשיטוח ההר · 1 סלעים
 0:30.0  המטרהחומת העזרה · התחל לבנות
 0:35.0  המטרהחומת העזרה · התחל לבנות   ‖ card: איך קוראים לך?
 0:40.0  המטרהחומת העזרה · התחל לבנות   ‖ strip: אבן4:57   ‖ card: שיטוח ההר   ‖ coach: רב האומניםעכשיו: התחל לבנות את חומת העזרה
 0:45.0  המטרהחומת העזרה · התחל לבנות   ‖ strip: ארז3:57אבן4:52   ‖ card: פרק א׳ הושלם!   ‖ coach: רב האומניםעכשיו: התחל לבנות את חומת העזרה
 0:50.0  המטרהחומת העזרה · יסודות · 10%   ‖ strip: ארז3:52החומה4:20   ‖ coach: רב האומניםצוות אחד בונה את החומה והשני חוצב אבן במחצבה. אפשר
 0:55.0  המטרהחומת העזרה · מבנה · 45%   ‖ strip: ארז3:47אבן4:42
 1:00.0  המטרהשערי העזרה · התחל לבנות   ‖ strip: ארז3:42אבן4:37
 1:05.0  המטרהשערי העזרה · יסודות · 0%   ‖ strip: ארז3:37אבן4:32
 1:10.0  המטרהעזרת הנשים · יסודות · 0%   ‖ strip: ארז3:32אבן4:27
 1:15.0  המטרהעזרת הנשים · יסודות · 11%   ‖ strip: עזרת הנשים3:06ארז3:27
 1:20.0  המטרהשערי העזרה · חסר ארז 110 · מגיע בעוד 3:22   ‖ strip: ארז3:22אבן4:17
 4:45.0  המטרהשערי העזרה · מבנה · 15%   ‖ strip: אבן0:52נחושת14:59
 4:55.0  המטרהשערי העזרה · חסר ארז 80 · כל המשלחות בדרך · אחת חוזרת בעוד 0:42   ‖ strip: אבן0:42נחושת14:49
 5:40.0  המטרהשערי העזרה · חסר ארז 80 · עוד משלחת בדרך · 1:59:59   ‖ strip: נחושת14:04ארז1:59:59
19:45.0  המטרהשערי העזרה · חסר ארז 80 · עוד משלחת בדרך · 1:45:54   ‖ strip: ארז1:45:54   ‖ card: סערה בים
19:50.0  המטרהשערי העזרה · חסר ארז 80 · עוד משלחת בדרך · 1:45:49   ‖ strip: אבנים שלמות8:00ארז1:45:49   ‖ card: דלת אחת לים
19:55.0  המטרהשערי העזרה · חסר ארז 80 · עוד משלחת בדרך · 1:45:44   ‖ strip: אבנים שלמות7:55ארז1:45:44   ‖ card: בנמל עכו
20:00.0  המטרהשערי העזרה · חסר ארז 80 · עוד משלחת בדרך · 1:45:39   ‖ strip: אבנים שלמות7:50ארז1:45:39
27:50.0  המטרהשערי העזרה · חסר ארז 80 · עוד משלחת בדרך · 1:37:49   ‖ strip: אבנים שלמותחזרה!ארז1:37:49
27:55.0  המטרהשערי העזרה · חסר ארז 80 · בינתיים אפשר להתחיל: יסוד המזבח   ‖ strip: אבן30:00ארז1:37:44
28:00.0  המטרהיסוד המזבח · יסודות · 10%   ‖ strip: היסוד3:56אבן29:55
28:05.0  המטרהשערי העזרה · חסר ארז 80 · עוד משלחת בדרך · 1:37:34   ‖ strip: אבן29:50ארז1:37:34
57:55.0  המטרהשערי העזרה · חסר ארז 80 · עוד משלחת בדרך · 1:07:44   ‖ strip: אבןחזרה!ארז1:07:44
58:00.0  המטרהשערי העזרה · חסר ארז 80 · עוד משלחת בדרך · 1:07:39   ‖ strip: אבן29:59ארז1:07:39
```
Summary: strikes 3059 (93% perfect), taps 3074, idle 1585 s, dead 0 s, hollow 2847 s, pill "waiting" 97% of samples, moments [{"kind":"stone","s":3.3,"skipped":false}], hooks {"comboMilestone":508}.
