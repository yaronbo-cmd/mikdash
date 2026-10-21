# בית המקדש: Hooks, engagement and player psychology

**Owner of this document:** the HOOKS agent (Sprint 2, night of 25 Sep 2026, Erev Sukkot 5787; Sprint 3, the morning after; round 3, motzaei Shabbat 26 Sep). **Status: DRAFT.** Every
player-facing text added by this work is a draft ("טיוטה") until Yaron approves it. Decisions that need the owner
are marked **⚑**. Companion files: `docs/HOOKS-he.md` (the owner's summary in Hebrew), `docs/PLAYTEST.md` (the raw
playtest logs). Code: `src/game/hooks/*`, small edits in `src/game/{index,ui,content}.js`, bots in `test/playtest/*`.

---

## Round 3 (26 Sep 2026, motzaei Shabbat): the new content, played for fun, in one page

**What I did.** I played what wave 3 added and nobody had played for fun — the fifteen key moments, the crews and caravans
in the world, the tour, "איפה הארון?" and the Yom Kippur service, and the two investor paths — with five bot families: a
**probe** that times every key moment inside the existing suites without changing them, a **moment model** on those
measurements, a **scenes bot** that reads every card of the real panel, the **simulator** (now auditing crews and
caravans over a 7-day regular week), and the **DOM bots** (a new presenter persona for `#demo`, the first-timer, the
child). Numbers: docs/PLAYTEST.md "Round 3". Research: §14. Built: below. Every text is a draft ("טיוטה") with its source.

**What the bots found**
1. **The world said "working" while the rules said "waiting".** A first-timer's crews spent **65%** of their session, and
   **24 crew-hours** of the night, at a site blocked on cedar — hammering in the world, producing nothing.
2. **Nobody sees a caravan arrive.** The 7-day regular saw **0 of his 26** caravans roll in; all arrived while he was away.
3. **The tour loses players at its text walls.** 40 cards and 1,622 words; 4–7 text cards at one view at the courts, the
   altar and the chambers; in the model the child and the investor leave at the first stop, the regular at the third.
   Nothing was kept between visits, and every tab simply closed at its end.
4. **The investor reel ended on a dead button** (3 dead presses, QA P1-4), turned the camera to the raw back of the
   Heichal (P2-20), and could open the wall's key moment in the middle of a live highlight (a 28 s surprise).
5. **Moments:** 11.6 min for all fifteen the first time (fine: the reading is the learning), 3.2 min again; five are
   chores on a repeat (the kiyor, the storm, the boxes, the kevesh, "בלי ברזל"), and **12 of 15 are longer than a
   child's 25 s**. They never block the loop (0 of 21 sessions opened on a waiting moment).

**What I built (by file)**
- `src/game/hooks/index.js`: the **demo outro** (the eight highlights ✓, then "העבודה בבית · 3 דקות ✦", "סיור בבית
  המקדש · 10 תחנות", "להישאר"); the ✦ button counts "x/8" and becomes "סיום ההדגמה ✦" (never a dead end: in the second
  before Chanukat HaBayit a press waits for it, after it the outro opens); the **Ark mystery**
  card after the Ezrat Nashim ("אבן אחת ברצפה", Shekalim 6:2, once, never in the demo or under automation); the
  **idle-crew cue** (30 s at a blocked site → one tap to move them; three in all) and the same button on the rest card;
  the **caravan-arrival beat** (the game's own "משלחת חזרה!" now says what came and for which site, with "לאסוף");
  a **skipped moment keeps its fact** (its "done" line and source go into the stage card: the child who skips after 25 s
  still gets the detail); the `repeat` flag for moments.js on the map's "שוב" and in a demo on a device that already played
  the moment. `next.js`: `idleCrews`, `crewTarget`, `arrivals`. `demo.js`: a live highlight is past its moment (no stray
  moment).
- `src/avodah/hooks/tour.js` (new): **25 stamps** (tour 10, Ark 5, service 10; kept on the device; they buy nothing),
  **"לתחנה הבאה"** at every stop with more cards, **the doors** (tour → Ark, Yoma 5:2 → the service, Kelim 1:9 → the next
  real Yom Kippur), and the Phase B home's lines: the stamps; from twelve days before, **"בעוד N ימים: יום הכיפורים"**;
  and for a player who came by the link (no Phase A, so no wood chamber), **"תעלומה: איפה הארון?"** from his second day of
  service until he opens it.
- Marked one-liners: `src/game/index.js` (the outro at the reel's end and after the demo's finale; the mystery after
  nashim; the Heichal's shot kept; a test entry), `src/avodah/index.js` (the home line), `src/avodah/scenes/index.js`
  (**one line** in `render()`: the hooks' render call — for the WORLD agent).
- Bots and tests: `test/playtest/{probe-preload.cjs, moment-model.mjs, scenes-bots.cjs, scenes-bot-entry.js,
  r3-checks.cjs}`, `sim.mjs` and `dom-bots.cjs` extended, `test/hooks-r3.test.mjs`.

**Before → after (the same bots)**
- Crews at a blocked site, first-timer: 65% → 17% of the session; 24 → 0 crew-hours away. (The child: unchanged — the
  world must show the wait: a request.)
- Tour, the child and the investor: leave at stop 1 → finish 10/10 (2.8 min) and see the door to the Ark; the regular:
  stop 3 → stop 9. Reasons to come back after a tab: none → a door, stamps, the coming Yom Kippur.
- The reel: 9 presses (3 dead) and 202 s to Chanukat HaBayit → 7 presses (0 dead) and 169 s, a stray 28-s moment → none, the camera on the raw back of the Heichal → the Heichal kept, and a dead end → an outro with two doors.
- The Ark: a tab found after the tour → an invitation at the moment the wood chamber is built (the regular: day 1).

---

## Sprint 3 (25 Sep 2026, Friday morning): Phase B and the Phase A → B handoff, in one page

**What I did.** I extended the persona bots to Phase B (`test/playtest/avodah-bots.cjs`: the real HUD, rules and
mini-games on a virtual clock, at the game's real pacing), played it as seven players (a new player by the link and
from the Phase A menu, a child, an investor, a binger, a daily regular over seven real days who keeps Shabbat, a
"ritual" player), measured it (docs/PLAYTEST.md, Phase B), built the fixes as a hooks layer
(`src/avodah/hooks/index.js`, marked `── hooks ──` edits in `src/avodah/{index,state,ui,ui.css}.js`), built the
Phase A → B handoff (`src/game/hooks/avodah.js`, marked edits in `src/game/{index,ui}.js`), re-ran the bots, and
studied six real-clock games (§11). What is built against the §10 spec: §10.12.

**The findings that matter most**
1. **A working person's live morning is the service's tail.** Joining live at 06:30–06:45 always lands at the third
   payis: payis3 → ketoret → birkat → shir (or birkat → shir) on all six mornings, 0 new cards after day 1, the
   day's payis never seen, his own role never done live. *Built:* **"העבודה שלך היום"** — the payis (the reveal),
   your role's work "בפועל", the song: 2–3 minutes (Wordle-sized, §11.3), a gold button on the home and on the
   summary of any service where your own work was not done; a late joiner gets the payis reveal card. The regular now
   does his own role every day (a different one each day: 6 of 13 roles in the week instead of 5; the ritual player
   7) and meets new cards every day (12 after day 1 instead of 1).
2. **The ladder was used up on day 1.** The first morning met 5 of the 15 ממונים (5 cards in a row) and 35 of the 40
   book steps; the binger met 9 in one evening. *Built:* a longer ladder (two in the first morning; measured: the regular 4 after his first week, the ritual player 3),
   same-day repeats count 3, one ממונה card per service, and two long collections that were missing: **mastery tiers**
   per work (למד · מיומן · בקי · מומחה) and **25 vessels** from content/tamid.json, each with its source.
3. **Repeats cost as much as the first time.** *Built:* a repeat of a work gets a one-line card (the source one tap
   away, "למקור ולהסבר") that moves on by itself after 4 s, and shorter walk-in/after waits (2.6 → 1.2 s,
   2.2 → 0.9 s). The first time stays full: the cards are the learning (⚑).
4. **The natural stopping point pointed nowhere.** *Built:* the home's day panel (הפייס · בפועל · נכחת בזמן, the
   morning x/14, "הבא במקדש", and tomorrow), and every summary ends with "מחר: פיס חדש — N תפקידים שעוד לא עשית ·
   12 פרים במוסף" (or "מחר: שבת — מנוחה; הרצף שמור").
5. **Sukkot starts tonight and nothing changed from day to day.** *Built:* the bulls 13·12·11·10·9·8·7 with "x מתוך
   70 עד היום" (Sukkah 55b), Ezra 3:4, "ברגל כל המשמרות עולות" (Sukkah 5:7: on the festival every player's mishmar
   serves, and "נכחת בזמן" counts twice), the seven days of the festival (Shabbat and Yom Tov count by themselves).

**The handoff (⚑).** A soft gate that fits "the service after Chanukat HaBayit" without locking anything: the Phase A
menu button reads "הצצה" while the House is built; when the altar is complete (the horns), an invitation card —
"מִיּוֹם אֶחָד לַחֹדֶשׁ הַשְּׁבִיעִי הֵחֵלּוּ לְהַעֲלוֹת עֹלוֹת לַה׳ וְהֵיכַל ה׳ לֹא יֻסָּד" (Ezra 3:6: in Ezra's days the
offerings began on the altar before the Heichal was founded) — opens Phase B straight into the ritual, and "חזרה
לבניית הבית" brings the player back; at Chanukat HaBayit the full invitation. The menu button, `#avodah` and the demo
always open Phase B (the investors' bypass). A hard gate is one constant away (`GATE` in `src/game/hooks/avodah.js`).

**The streak.** Shabbat and Yom Tov never count (as before), and one missed weekday a week is covered by itself:
Duolingo's freeze without a shop (§11.4).


---

## 0. In one page

**What I did.** I studied how games like ours keep players (with sources, §2–§3), then played our game in my own
branch with six persona bots on a virtual clock: a model-based simulator over the real rules, and a DOM bot that plays
the real HUD (§4). I mapped where it is boring (§5), ranked the problems (§6), fixed them in Phase A (§7),
re-ran the same bots (§8), and wrote a genre toolkit (§9) and the Phase B hooks spec for the Avodah agent (§10). Ten
of the twelve findings are fixed in this branch; the other two are specified.

**The five findings that matter most**
1. **The first session dead-ended at minute 2.** A first-time player finished the Mount in 0:49 (good), started the
   wall at 1:22, and at 2:05 the wall stopped at 70% for "חסר ארז 20". The cedar caravan takes 2 hours and the
   tutorial never mentions it. The curious first-timer then had **18 minutes with nothing to do**; the pill said
   "missing cedar" in **90%** of samples; the child never got past it. *Fixed:* the wall's cedar is in the starting
   stock and every route has a short first trip, so the first session reaches the fork in the road (gates · Ezrat
   Nashim · the altar's base) at ~2:10 instead of never.
2. **A waiting goal gave no road.** "חסר ארז 20" said what was missing but not when it comes or what to do; the pill
   did not count down; nothing told the player that leaving was fine. *Fixed:* the pill now counts down ("מגיע בעוד
   4:12"), offers the fork in the road while a material is far away ("בינתיים אפשר להתחיל: עזרת הנשים"), or names
   the action ("שלח משלחת", "כל המשלחות בדרך · אחת חוזרת בעוד 29:00", "המשלחת חזרה: אסוף אותה"); tapping it opens
   what moves the goal; an appointment strip under the pill always shows the next two things that will come; a
   just-in-time hint names the route the first time a material is missing; the caravans sheet tags the route that is
   "נחוץ עכשיו"; and at a natural stopping point a **rest card** says, honestly: the site works for you, here is what
   comes when, you can leave, nothing is lost.
3. **Mashing beat mastery.** A bot that mashes the screen got **88% perfect strikes** (an aimed tapper got 21%),
   because only the latest buffered tap is kept and it always lands next to the beat. The gold ring, the combo and
   the "מכה מדויקת" paid out for not looking at them. *Fixed:* a strike is perfect only if it was aimed (fewer than 3
   taps for one strike); mashing still builds (no punishment) but earns no gold, and the coach explains the ring once.
   Combo steps (×1.5, ×2, ×3) now get a gold flash and a brighter chime.
4. **Card fatigue at the climax.** Finishing the Mount stacked four modal cards (stage, two finds, chapter): ~30 s of
   reading at the peak moment; a child clicked through all four in 4 s. *Fixed:* the finds sit inside the stage
   card, which also says what opens now ("נפתח עכשיו: שערי העזרה · עזרת הנשים · יסוד המזבח") and shows the chapter
   ladder (endowed progress). Two cards instead of four.
5. **The investor demo skipped the best parts.** "דלג לפרק הבא" reached the finale in 4½ minutes but skipped the
   Heichal's gold and the craftsmen in boxes, and stalled ~50 s on "צריך 6 כהנים". *Fixed:* a highlight reel
   ("הרגע הבא ✦", demo only): great stone → the wall closes → 13 breaches → the red line → the first fire → the
   Ulam and the vine → the Heichal's gold → the craftsmen in boxes → Chanukat HaBayit, in under five minutes, with no
   stall.

Also: every touch on the world now gets an instant ripple (a child's burst used to get one strike per swing and no
other sign); the end-of-tutorial toast promised "the crew will finish the wall in ~X" even when the wall waited for cedar
(fixed: it names the real next appointment); the welcome-back card now opens with what to do first and tells the
12-hour cap as rest, not loss; quarrying stone nobody needs now gets a gentle "יש די אבן לעכשיו" with what is really
missing; a **weekly goal** (the GDD promised one) gives the busy adult a mid-term rung, Sunday to Friday, never on
Shabbat; and a once-a-year festival card (Sukkot: the Water Gate, Middot 2:6) is ready for tonight.

**What I did not change** (not mine, or not worth the risk tonight): `moments.js`, the 3D world, the economy beyond
the first session (the regular player's arc is still 10½ days, inside the GDD's 10–14), and Phase B code. Requests
for other owners are in §13.

---

## 1. Principles I held myself to

- **Meaning first, mechanics second.** Our differentiator is that "the real details are the gameplay" (GDD pillar 2).
  Every hook here either makes a true detail more felt or removes friction around it. None of them adds a reward
  that is not already in the game.
- **White-hat drives only** (Octalysis terms, §2.4): meaning, accomplishment, empowerment, ownership. We do not use
  scarcity, unpredictability or loss avoidance as levers, except where the Mishnah itself has them (the lottery,
  "חדשים לקטורת"), and even there we remove the gambling shape (§10.3).
- **Honesty about time.** An appointment the player can see is healthy; an appointment that punishes is a dark
  pattern (Zagal et al. 2013, "playing by appointment"). Every timer here is shown, nothing withers, and the game
  tells the player when it is a good time to stop.
- **Children.** The game will be played by 10–12-year-olds. The UK Children's Code asks services to "consider
  nudging to promote health and wellbeing" and suggests "providing tools such as pause and save buttons" (ICO,
  Standard 13). The rest card is exactly that kind of nudge.

---

## 2. Research: how player psychology works in games like ours

### 2.1 Self-Determination Theory (Ryan, Rigby & Przybylski 2006)
Games are enjoyed, and returned to, to the degree they satisfy **competence**, **autonomy** and **relatedness**;
the paper shows these predict enjoyment and future play across genres. For us: competence = skilful strikes and
visible progress (hurt by the mash exploit, finding 3); autonomy = real choices (the fork after the wall, which
caravan, which crew; hurt when the only "choice" is to wait, finding 1); relatedness = the beit av and the mishmar
(Phase B's social frame, §10.5). Source: [The Motivational Pull of Video Games: A Self-Determination Theory Approach,
Motivation and Emotion 30 (2006)](https://link.springer.com/article/10.1007/s11031-006-9051-8).

### 2.2 Flow (Csikszentmihalyi), as applied to games by Jenova Chen
Flow is the channel between anxiety and boredom: challenge matched to skill, clear goals, immediate feedback. Chen
argues games should let different players stay in their own flow zone through choices rather than one fixed
difficulty. For us: **clear goals and immediate feedback** are the flow conditions we broke (a goal with no road; a
"perfect" that was not earned). Source: [J. Chen, *Flow in Games (and Everything Else)*, Communications of the ACM 50(4),
2007](https://dl.acm.org/doi/10.1145/1232743.1232769) ([PDF](https://www.jenovachen.com/flowingames/p31-chen.pdf)).

### 2.3 The Hook model (Nir Eyal) and its ethical limit
Trigger → action → variable reward → investment. We use three of the four: triggers (the strip, the pill, an
opt-in notification later), a low-friction action (one tap is one strike), and investment (the half-built House,
the vine, the Middot book, one's own trained priests). We **do not** use the variable-reward step as a lever
(§2.5). Eyal's own ethical test is the **Manipulation Matrix**: "Will I use the product myself?" and "Will the
product help users materially improve their lives?" Only the "facilitator" quadrant (yes / yes) is acceptable. A game
that teaches the Avodah truthfully can honestly aim there; a game that farms attention cannot. Source: [Nir Eyal,
*The Morality of Manipulation*](https://www.nirandfar.com/the-art-of-manipulation/).

### 2.4 Octalysis (Yu-kai Chou): white hat and black hat
Eight core drives. "White hat" drives (epic meaning, development & accomplishment, empowerment of creativity,
ownership) make people feel good and in control; "black hat" drives (scarcity, unpredictability, loss & avoidance)
create urgency and, over time, resentment. Our design sits on epic meaning (building *the* House), accomplishment
(the stage graph, the key moments), creativity (choices, the order of the graph) and ownership (my House, my
priests). Sources: [Octalysis framework](https://yukaichou.com/gamification-video-course/beginners-guide-gamification-4-90-gamification-framework-octalysis/),
[White Hat vs Black Hat gamification](https://yukaichou.com/gamification-study/white-hat-black-hat-gamification-octalysis-framework/).

### 2.5 Reward schedules, and why we will not use gambling-like variable rewards
Hopson's classic article brought reinforcement schedules into game design: "In general, variable ratio schedules
produce the highest overall rates of activity of all the schedules that I'll discuss here", which is exactly why they
are dangerous. He also describes *avoidance* contingencies ("contingencies where the participants work to keep things
from happening"), attractive to designers because "they don't have to keep providing the player with new toys or
rewards": that is the withering-crops pattern we refuse (nothing withers here). Source: [J. Hopson, *Behavioral Game
Design*, Gamasutra 2001](https://www.gamedeveloper.com/design/behavioral-game-design). Loot boxes are the purest
form: Drummond & Sauer found they share the formal features of gambling ([*Video game loot boxes are
psychologically akin to gambling*, Nature Human Behaviour 2018](https://www.nature.com/articles/s41562-018-0360-1)),
and Zendle & Cairns found loot-box spending linked to problem gambling in a large survey ([PLOS ONE
2018](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0206767)). Zagal, Björk & Lewis list
"playing by appointment" among the dark patterns when missing the appointment is punished ([*Dark Patterns in the
Design of Games*, FDG 2013](https://my.eng.utah.edu/~zagal/Papers/Zagal_et_al_DarkPatterns.pdf)). **Our rule:** all
rewards are deterministic (the same caravan brings the same amount; the game says so), no loot, no spin, no free
"mystery" boxes, and nothing is lost by being away.

### 2.6 Goal gradient and endowed progress
People accelerate as they near a goal, and "illusionary" progress also works (Kivetz, Urminsky & Zheng: coffee-card
customers bought faster as they approached the free coffee; [*The Goal-Gradient Hypothesis Resurrected*, Journal of
Marketing Research 43 (2006)](https://journals.sagepub.com/doi/abs/10.1509/jmkr.43.1.39)). Giving people a head start
raises completion (Nunes & Drèze: a 10-stamp card with 2 stamps pre-filled beat an 8-stamp card; [*The Endowed
Progress Effect*, Journal of Consumer Research 2006](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=991962)). For
us: the chapter ladder counts half-built sites partly (a half-built wall already moves the chapter bar), the Middot
book starts at 1/34, and the stage card shows what opens next (the next rung is visible).

### 2.7 The Zeigarnik effect, corrected: it is the Ovsiankina effect
The popular claim that unfinished tasks are *remembered* better does not hold up: a 2025 meta-analysis found "no
memory advantage for unfinished tasks but … a general tendency to resume tasks", with interrupted tasks resumed about
67% of the time. Source: [Ghibellini & Meier, *Interruption, recall and resumption: a meta-analysis of the Zeigarnik
and Ovsiankina effects*, Humanities and Social Sciences Communications 2025](https://www.nature.com/articles/s41599-025-05000-w).
So the design lever is not "make them remember" but "make the open loop visible and easy to resume": the strip, the
countdown on the pill, the half-built site on screen, and a comeback card that opens with the first thing to do.

### 2.8 Appointment mechanics
"A dynamic in which to succeed, one must return at a predefined time to take some action" (the SCVNGR game-dynamics
playdeck, with Farmville as the example: [TechCrunch 2010](https://techcrunch.com/2010/08/25/scvngr-game-mechanics/)).
Healthy form: reward on return, never punishment for absence (GDD §9, Zagal et al.). Ours: caravans, trainees, crews
(12-hour cap, then they wait), and in Phase B the real clock.

### 2.9 FTUE, retention benchmarks and session design
GameAnalytics' FTUE advice: let players do something fun immediately, show the game's value in the first minutes,
measure each tutorial step as a funnel ([10 tips for a great FTUE](https://www.gameanalytics.com/blog/tips-for-a-great-first-time-user-experience-ftue-in-f2p-games)).
Mobile benchmarks (2024 data): D1 median ≈ 17% (top quartile ≈ 27%), D7 median ≈ 3.4–3.9%, sessions 5–6 min, ~4 a
day ([GameAnalytics 2025 Mobile Gaming Benchmarks](https://www.gameanalytics.com/reports/2025-mobile-gaming-benchmarks)).
Session pacing in the leaders: Township's event mini-games last "about 1–2 minutes" and its events run 7–10 days
with ~2-week gaps "making sure that players don't burn out" ([Deconstructor of Fun, *How Playrix' Township Became a
Billion Dollar Game*](https://www.deconstructoroffun.com/blog/2020/10/13/how-playrix-township-became-a-billion-dollar-game)).
Wordle shows the opposite pole: one puzzle a day, by a designer "suspicious of apps and games that want your endless
attention" ([TechCrunch interview with Josh Wardle, 2022](https://techcrunch.com/2022/01/12/josh-wardle-interview-wordle/)).
We aim between them: 5–7-minute sessions that end at a natural stopping point, 3–4 a day, with a real reason to
return.

### 2.10 Juice
"Juice it or lose it": layered, redundant feedback for every action ([Jonasson & Purho, GDC Europe
2012](https://www.gdcvault.com/play/1016487/juice-it-or-lose)). The first controlled studies found that visual
embellishments "contribute to the visual appeal of all games, but only affects aspects such as competence under
specific circumstances" ([Hicks, Gerling, Dickinson & Vanden Abeele, *Juicy Game Design*, CHI PLAY
2019](https://dl.acm.org/doi/abs/10.1145/3311350.3347171)). Lesson: juice must sit on **honest** feedback. Gold sparks
on a mashed strike are juice without meaning (finding 3).

### 2.11 Streaks, and streak ethics
Duolingo reports that learners who reach a 7-day streak are 3.6× more likely to complete their course, that letting
learners equip two streak freezes raised daily actives by +0.38%, and that "offering people a little 'slack' as they
pursue their goals can actually be more motivating than having a rigid set of rules"
([Duolingo blog, *How the streak builds habit*](https://blog.duolingo.com/how-duolingo-streak-builds-habit)). The
research on broken streaks is the warning: showing a broken streak reduces later engagement, more so when people
blame themselves, less so when the streak can be repaired ([Silverman & Barasch, *On or Off Track: How (Broken)
Streaks Affect Consumer Decisions*, Journal of Consumer Research 2023](https://academic.oup.com/jcr/article-abstract/49/6/1095/6623414)).
Our streak already never breaks on Shabbat or Yom Tov and never shames; the recommendation for later is a gentle
repair (§12), never a paid one.

---

## 3. What keeps players in: deconstructions and what we take

| Game | The hook | Evidence | What we take | What we refuse |
|---|---|---|---|---|
| **SimCity BuildIt** | Production chains on timers; storage caps; short, medium and long timers that bring players back several times a day and the next day; unlocks by level create curiosity | [vadhia, *SimCity BuildIt: Deconstruction*](https://ameetvadhia.wordpress.com/2016/05/30/simcitybuildit-deconstruction/) | Short/long caravans; the unlock preview ("נפתח עכשיו") | Storage caps as a pressure lever (our quarry cap is 12 h and silent) |
| **Megapolis** | Infrastructure needs special materials from events, trains/planes, the "State" (co-op) and purchases | [Megapolis Help Center, *Materials*](https://social-quantum.helpshift.com/hc/en/11-megapolis/faq/2086-materials-usage-and-how-to-obtain-them-1731927011/?p=all) | Special materials with a story (whole stones, Nikanor's bronze) | Materials sold for money |
| **Township** | Clear production loop; events 7–10 days with ~2-week gaps to avoid burnout; 1–2-minute mini-games | [Deconstructor of Fun](https://www.deconstructoroffun.com/blog/2020/10/13/how-playrix-township-became-a-billion-dollar-game) | Short, bounded mini-games (our key moments); festivals as events with breathing room | Energy systems that sell refills |
| **Hay Day** | Crops, production buildings, truck/boat orders, a roadside shop between players | [Wikipedia, *Hay Day*](https://en.wikipedia.org/wiki/Hay_Day) | Orders as a Phase B frame (pilgrims' offerings as "orders" to route correctly) | Premium speed-ups |
| **Clash of Clans** | Builders as slots, one building each; long upgrade timers | [Clash of Clans Wiki, *Builder*](https://clashofclans.fandom.com/wiki/Builder) | Crews as builder slots (already in the GDD) | Gem-bought builders |
| **Royal Match** | Speed: "one, if not the, fastest switchers", no loading between retries; generous clarity: "The game actually tells me when I can stop matching next to an obstacle without me having to count"; a light decoration meta | [Deconstructor of Fun, *Royal Match*](https://www.deconstructoroffun.com/blog/2021/3/21/royal-match-the-new-king-from-turkey) | Zero-friction retries of key moments; the game does the counting for the player (the pill's countdown and "חסר X", the strip) | Near-miss "5 more moves" offers |
| **Animal Crossing: New Horizons** | The real clock and calendar: tourneys on fixed Saturdays, holidays on their dates, fireworks every August Sunday | [Nookipedia, *List of events in New Horizons*](https://nookipedia.com/wiki/Event/New_Horizons) | Phase B's closest analogue: the Temple's day and year on the real calendar (§10) | Missed-forever exclusives |
| **Pokémon GO** | Community Day: a monthly 3-hour window with a featured Pokémon and bonuses | [Bulbapedia, *Community Day*](https://bulbapedia.bulbagarden.net/wiki/Community_Day) | Festival days as live events with a clear window | FOMO rewards that cannot be earned later |
| **Duolingo** | Streaks, freezes, quests; data on what works | [Duolingo blog](https://blog.duolingo.com/how-duolingo-streak-builds-habit) | Shabbat-safe streak, slack, no shame | Guilt notifications, streak loss framing |
| **Stardew Valley** | Seasons and festivals on the calendar; a letter in advance; "attendance at festivals is entirely optional"; time stops during most festivals | [Stardew Valley Wiki, *Festivals*](https://stardewvalleywiki.com/Festivals) | Festivals announced ahead, optional, never punishing | – |
| **Papers, Please** | Inspection as gameplay: find the discrepancy in the documents; a day structure | [Wikipedia, *Papers, Please*](https://en.wikipedia.org/wiki/Papers,_Please) | Inspecting the Tamid lamb for blemishes; checking a pilgrim's offering (Phase B) | Punitive citations; family-hunger pressure |
| **Diner Dash / Overcooked** | Time management; chaining the same action earns a chain bonus; patience hearts | [Wikipedia, *Diner Dash*](https://en.wikipedia.org/wiki/Diner_Dash) | The morning service as a sequence of timed stations (Phase B) | Customers leaving angry; losing a level for slowness |
| **Cooking Mama** | A recipe as a chain of step mini-games ("each minigame represents a different activity in the meal preparation"), scored from the steps, with a forgiving mentor ("Don't worry, Mama will fix it!") | [Wikipedia, *Cooking Mama*](https://en.wikipedia.org/wiki/Cooking_Mama) | The Avodah as a chain of step mini-games (terumat hadeshen, the wood, the lamps, the ketoret) | Failure screens on sacred acts |
| **Rhythm Heaven** | Short rhythm games (1–2 min) cued by audio; ratings; a remix at the end of each set | [Wikipedia, *Rhythm Heaven*](https://en.wikipedia.org/wiki/Rhythm_Heaven) | The strike ring; the Levites' song and Ben Arza's cymbal (Phase B) | Mash-friendly timing (fixed tonight) |
| **Monument Valley** | Every screen a composed reveal; short, beautiful, completable | [Wikipedia, *Monument Valley*](https://en.wikipedia.org/wiki/Monument_Valley_(video_game)) | Reveals: the vision, the platform rising, the Heichal's gold at sunrise | – |
| **Wordle** | One a day; shareable; no notifications | [TechCrunch](https://techcrunch.com/2022/01/12/josh-wardle-interview-wordle/) | The daily lottery as a one-a-day ritual; a calm daily card | – |
| **Fallout Shelter** | Idle management; rush a room at the risk of an incident instead of paying; lunchboxes | [Wikipedia, *Fallout Shelter*](https://en.wikipedia.org/wiki/Fallout_Shelter) | "Your own hands" as the speed-up (no paid timers) | Lunchboxes (loot boxes) |

---

## 4. The playtest: my own version, six personas, two kinds of bots

**Where.** Branch `s2-hooks`, worktree `/home/claude/wt/hooks`. All numbers below come from re-runnable bots:
- `test/playtest/sim.mjs`: **model-based playtest.** Persona bots play the *real* rules (`src/game/state.js`) second by
  second on a virtual clock (Jerusalem time). Every second is classified: build · key moment · card · decision ·
  collect · learn (Middot book, quiz) · watch (timelapse, celebrations) · **hollow** (tapping with no meaningful
  result, e.g. quarrying stone nobody needs) · **dead** (nothing meaningful to do). Card, moment and decision
  durations per persona come from the DOM bots.
- `test/playtest/dom-bots.cjs`: **the real HUD.** The game harness (the real `src/game` UI and rules against a fake 3D
  world, no WebGL) on Playwright's fake clock, so 20 virtual minutes take ~2 real minutes. The bot's brain runs
  inside the page: it reads the coach, the goal pill, modals, badges and the key-moment overlays, taps the world the
  way `main.js` picking does (`onBoulderTap` / `onSiteTap` / `onQuarryTap`), clicks the HUD, and plays or skips the
  key moments. It samples the screen every 5 s and takes screenshots.
- `test/playtest/report.mjs` prints the before/after tables below.

**Personas** (all start from a fresh save unless noted)

| Persona | Behaviour |
|---|---|
| the curious first-timer | 20 min; taps every ~1.3 s, aims at the ring a third of the time, reads cards (~7 s), follows the coach, explores every tab when idle, sends the caravans it sees |
| the busy adult | 3 visits × 5 min a day (08:00, 13:00, 21:00) for 7 days; efficient; leaves after 20 s with nothing to do |
| the binger | one hour; fast and accurate; quarries when idle |
| the returner | plays day 1, comes back after 3 days (a day-1 save with the wall waiting for cedar) |
| the child (10–12) | taps in bursts (~5 a second), reads nothing (~1 s a card), follows only the hand, gives up on a key moment after 25 s |
| the investor | demo mode (×60), 5 minutes, moves on every ~35 s |

**Metrics.** Time to first strike / first boulder / the crew / the Mount done (first "wow" after the opening vision);
meaningful vs dead vs hollow seconds; the longest dull stretch; reward drought; decisions per minute; taps without a
strike; the share of samples where the goal pill says "waiting"; what the player sees at exit (timers running, the
next event); the natural stopping point (the first time nothing can be done for 20 s after the tutorial).

**Limits.** Bots are not people: they do not feel awe at the 3D world, cannot judge readability or beauty, and follow
a policy. The 3D world itself was not in the loop tonight (the harness uses a fake world; the heavy e2e run checks the
real build once). The numbers measure *opportunity*: whether the game gives a player something meaningful to do,
a clear goal and a reason to return.

---

## 5. The boredom map (baseline, before any change)

Glyphs, one per minute: █ build · ★ key moment · ▤ card · ◆ decision · ◎ collect · ✎ learn · ◉ watch · ░ hollow taps ·
· dead. Full logs, timestamps and screenshots: `docs/PLAYTEST.md`.

```
first-timer (20 min)   █★█✎░░··············   wall stopped at 2:05 for cedar; 18 min with nothing to build
binger (60 min)        █▤✎✎░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   55 min of quarrying unneeded stone
child (15 min)         █★░░░░░░░░░░░░░   never sent cedar (the coach never shows it): the wall never finishes
returner (after 3 d)   ██·   the wall finishes in 24 s, the gates start, then 5 min of "חסר ארז 60"
busy adult day 1       █★█✎· / █✎· / ██✎·   fine: short visits end at a natural point
investor (demo)        ▤███✎   reaches the finale by skipping; 50 s stall on "צריך 6 כהנים"
```

Evidence, from the DOM bot on the real HUD (baseline, `test/out/playtest/baseline-*.png`, `dom-baseline.json`):
- **0:01.3** first strike, **0:02.3** first boulder, **0:11.6** the crew, **0:45** the great-stone moment, **0:49** the
  Mount done. The first minute is strong.
- **0:55 → 1:20** four modal cards in a row (the Mount, two finds, chapter 1) while the coach already says "start the
  wall" behind them.
- **1:22** the wall starts; **2:05** "חסר ארז 20"; the pill shows it, frozen, in **90%** of the 5-second samples until
  minute 20. The FTUE ends at **5:54** when the wagons return, with the toast "the crew will finish the wall in about
  … minutes" (it could not: it waited for cedar).
- The child: **88%** of 725 strikes "perfect" by mashing (the aimed first-timer: 21%), and 551 s of hollow quarrying.
- The returner: "חסר ארז 60" in 92% of samples after the first 40 s.

---

## 6. Findings, ranked (impact × confidence ÷ effort)

Scale 1–5; effort 1 = under an hour.

| # | Finding | Evidence | I | C | E | Score | Status |
|---|---|---|---|---|---|---|---|
| F1 | First-session dead end: the wall waits 2 h for cedar at minute 2; the tutorial never teaches cedar | DOM first-timer 18 min idle, pill "waiting" 90%; sim first-timer 70% dead; child never finishes the wall | 5 | 5 | 1 | 25 | **fixed** |
| F3 | Mashing earns "perfect" (88%) | DOM child vs first-timer | 4 | 5 | 1 | 20 | **fixed** |
| F2 | A waiting goal has no road: no ETA, no action, no countdown, no "you may leave" | pill samples; no ETA anywhere outside the caravans sheet | 5 | 5 | 2 | 12.5 | **fixed** |
| F7 | Investor path skips the best moments; stalls on priests | DOM investor timeline | 4 | 5 | 2 | 10 | **fixed** |
| F4 | Four cards in a row at the Mount's climax | DOM timeline 0:55–1:20 | 3 | 4 | 1.5 | 8 | **fixed** |
| F8 | End-of-tutorial toast promises a wall that is waiting for cedar | index.js ftueDone ETA ignored the block | 3 | 5 | 1 | 15 | **fixed** |
| F9 | A festival tonight and nothing in Phase A knows it | calendar.js has Sukkot; the game shows nothing | 2 | 4 | 1 | 8 | **fixed** (Sukkot card) |
| F5 | Comeback card lists facts, not a first step; "the crews stopped and waited" reads as loss | returner timeline | 3 | 3 | 1 | 9 | **fixed** |
| F6 | The binger's hour is timer-gated after ~7 min (Phase A has no always-on short loop) | sim binger 94% hollow | 3 | 4 | 4 | 3 | **partly**: the rest card, "enough stone", the quiz from day one, replayable key moments; a real short loop is recommended (§12) |
| F10 | No weekly structure yet (the GDD promises a weekly goal) | code search | 3 | 3 | 2 | 4.5 | **fixed** (first version) |
| F12 | On 47% of days one daily task is "answer a Middot question", but the quiz lived only in the training yard (opens with the altar's base): a new player could not finish the day's three tasks (no grape) | code reading; 28 of 60 simulated days carry the quiz task | 3 | 5 | 1 | 15 | **fixed** |
| F11 | Taps without feedback while the builder swings (a child's burst: 3 of 4 taps are swallowed) | DOM child: 3,085 taps, 726 strikes | 2 | 4 | 1 | 8 | **fixed**: a ripple where the finger lands, for every touch on the world |

---

## 7. What I changed, and why (by file)

**`src/game/content.js`** (numbers only)
- `START_RES.cedar` 40 → **60**: the wall's three phases need exactly 60 cedar, so the first session can finish the
  wall and reach the fork in the road (F1).
- Every route gets a short, free **first trip** (the wagons already had one): cedar 4 min → 120 (covers the gates'
  110), Beit Kerem 8 min → 60 (starts the altar's base), Alexandria 15 min → 120 (Nikanor's doors, and the storm
  story arrives in the first sessions). A new route is learned by a quick return, not a wait of hours (F1). The
  simulator's pacing check still passes: regular player **10.5 days** (was 11.5; GDD target 10–14), heavy 6.1, light
  22.5.

**`src/game/hooks/next.js`** (new, pure): the appointments list; `blockedInfo` (is the missing material on its way,
and does it cover the need?); `goalNote` (the pill's line: "מגיע בעוד 4:12" · "בינתיים אפשר להתחיל: …" · "עוד משלחת
בדרך" · "שלח משלחת" · "כל המשלחות בדרך · אחת חוזרת בעוד …" · "המשלחת חזרה: אסוף אותה" · "אפשר לחצוב במחצבה" · "כהן הבא
בעוד …"); `startable` (a site whose foundations can be paid now); `stoneNeeded`; `restState` (a natural stopping point);
`chapterLadder` (endowed progress); `opensAfter` (the unlock preview); `hintFor` (a just-in-time hint).

**`src/game/hooks/rhythm.js`** (new): taps per strike; `isMash` (3+ taps for one strike is a burst); combo milestones.

**`src/game/hooks/week.js`** (new): the weekly goal (GDD §9): Sunday to Friday, finish 2 sites and bring 4 caravans
home → a cluster on the golden vine and 60 silver; nothing is counted or asked on Shabbat; a missed week is simply a new
week. Shown in the "היום" sheet (F10).

**`src/game/hooks/demo.js`** (new): the investor's highlight reel (eight highlights, each playable, ends in the finale;
priests granted when the House is next).

**`src/game/hooks/index.js`** (new): the engagement layer the controller calls: the **appointment strip** (the next two
timers under the pill; tap → the right sheet), the **rest card** (with "meanwhile" buttons: an unread mishnah, today's
Middot questions), the **just-in-time hint**, the **Sukkot card**, the stage card's extras, the mash tip, the "enough
stone" notice, the weekly goal's view, the FTUE and welcome texts, `sessionEnd` telemetry, and **replayable key
moments** (the map sheet lists the moments already played with a "שוב" button: the overlay only, no rewards, the save
untouched; Rhythm Heaven lets you replay a game for its own sake, and so do children).

**`src/game/index.js`** (surgical): creates the engagement layer; `act.goal` opens what moves a waiting goal (caravans,
the training yard, or the quarry); taps are counted and a mashed strike is not perfect; combo milestones flash; one
stage card with the finds inside (no separate find cards); the FTUE toast names the real next appointment; the
welcome card starts with the first thing to do and tells the 12-hour cap as rest; `demoNext()` plays the highlight
reel; `sessionEnd` on hide.

**`src/game/ui.js`** (surgical): `refreshPill()` (the hooks tick it every second so a countdown moves); the pill shows
the hooks' note for waiting goals, and so does a blocked site's sheet (with a button to the caravans); `stageDoneCard(r,
extra)`; the caravans sheet tags the route the goal needs ("נחוץ עכשיו"); the Middot quiz is reachable from the first
day (the book sheet, and a button on the daily task; the rest card offers it too) (F12); `ui.icon()` and `ui.whole`
for the strip.

**Tests.** `test/hooks.test.mjs` (13 unit tests, including a pacing guard and the weekly goal), a new section in
`test/game-harness.cjs` (29 checks: a ripple for every touch on the world, first trips, the strip, the pill's fork suggestion, ETA, live countdown and action,
the hint, the needed-route tag, the rest card and its no-repeat rule, honest rhythm on the beat, one stage card with the
finds, the key-moment replay, the Middot quiz from day one, the weekly goal, the Sukkot card, the highlight reel up to the Heichal's shine). The harness is 93/93.

**Test results (final).** `node --test test/game-state.test.mjs` 18/18 · `node --test test/hooks.test.mjs` 13/13 ·
`node --test test/calendar.test.mjs` 22/22 · `node test/game-sim.mjs --check` pacing OK · `node test/game-harness.cjs`
93/93 · `node test/game-e2e.cjs` (the real 3D build, SwiftShader): the full run gave **50/51**; the one failure is the
wall-clock check "[phone·demo] first strike within 15 s of start" (28.6 s wall, while its own game-side measure was
4.6 s: the coach at 4.0 s + tap→impact 0.57 s). It is the machine, not the hooks: the **baseline build** (`3e6ea53`, no hooks) under the same load
gives the same result on the phone run (30/31, the same check failing: 24.9 s wall, game side 4.7 s); the load average was 6–10 on
2 cores while other agents ran SwiftShader. A later full run (48/51) also lost two desktop taps; the cause was mine and
is fixed: the tap ripple forced a layout inside `pointerdown`, and `main.js` counts a tap only if pointerdown → pointerup
takes under 450 ms, which a starved page can exceed. The ripple now does nothing inside the handler (it is drawn on
the next frame by the Web Animations API), and the desktop run on the final code passed **21/21**. No console errors in
any run.

**How to show the game to an investor in five minutes** (demo mode never touches the real save): open the game with
`#demo` (or menu → מצב הדגמה), play the first 30 seconds by hand (the vision, a few strikes, the crew arrives), then
press **"הרגע הבא ✦"** in the purple strip about every 30 seconds: the great stone → the wall closes (celebration and
orbit) → the 13 breaches → the red line → the first fire on the finished altar → the Ulam and the golden vine → the
Heichal's gold at sunrise → the craftsmen lowered in boxes (quiet) → Chanukat HaBayit. The DOM bot does exactly this
and reaches the finale at 4:17.

---

## 8. Before and after

<!-- metrics:begin (node test/playtest/report.mjs) -->
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

**Derived: the first session up to its natural stopping point** (the first time, after the tutorial, that nothing can
be done for 20 s; the rest card comes there now; the baseline had no card but the moment is the same): share of
meaningful seconds, simulator.

| persona | before | after |
|---|---|---|
| the curious first-timer | 60.5% | **95.1%** |
| the binger | 53.5% | **83.2%** |
| the child (whole session: the child keeps quarrying, so no stopping point) | 15.0% | **23.2%** |

**Mastery (DOM bots):** strikes counted "perfect" when mashing: **88% → 0%**; the aimed first-timer keeps its earned
share (the ring still pays off when aimed: the harness check "an aimed tap on the beat is perfect" passes).

**The investor's five minutes (DOM bot):** before: 3 key moments (great stone, 13 breaches, red line), a ~50 s stall
on "צריך 6 כהנים", the Heichal and the Kodesh skipped silently. After: 4 key moments (+ the craftsmen in boxes),
 `shine` (the Heichal's gold) at 3:24, no stall (idle 76 s → 41 s), the finale inside five minutes.

**Pacing (economy simulator, `node test/game-sim.mjs --check`):** regular 11.5 → **10.5** days, heavy 6.5 → **6.1**,
light 22.5 → **22.5** (GDD target for the regular player: 10–14).

**Honest caveat.** The curious first-timer who ignores the rest card and stays 20 minutes still waits most of minutes
7–20 (dead 856 s → 780 s): after the first session's arc, Phase A is timer-gated by design. What changed is that the
wait is now announced, counted down, and ended by the game with a clear appointment, and the first six minutes are
a complete arc (the Mount, the wall, the fork, two foundations).

<!-- metrics:end -->

---

## 9. The genre toolkit: every Temple activity → the mechanic that fits

Legend: **A** = Phase A (built), **B** = Phase B (spec for the Avodah agent). Every quote below is from our content DB
(`content/*.json`, drafts; the content agent verifies wording) or from `src/game/middot.js` (verified twice against
Sefaria).

| Activity | Mechanic | Reference game | Why it hooks | Risk → how we avoid it |
|---|---|---|---|---|
| **A · Building stages** | Tap-to-strike with a rhythm ring; crews as builder slots; 3 paid phases | Clash of Clans (builders), Rhythm Heaven (timing) | Competence you can feel; visible progress; idle progress | Mashing → honest rhythm (fixed); grind → crews + caravans do the long work |
| **A · Caravans** | Short/long deterministic trips; a short first taste per route | SimCity BuildIt, Hay Day | Appointment on your terms; fits your day | Punishing absence → nothing withers; the 12-h cap waits |
| **A · The Middot book** | Collection of 34 with endowed start (1/34), reader, "where is it?" | Pokédex-style collections; Duolingo lessons | Completion (goal gradient); meaning | Busywork → each unlock tied to a real build |
| **A · Key moments** | 10–40 s procedure mini-games, no fail state | Cooking Mama | Novelty per stage; teaches one true detail | Frustration → instant retry, "דלג" |
| **A · The golden vine** | Daily tasks → leaf/grape/cluster (Middot 3:8's "עָלֶה, אוֹ גַרְגִּיר, אוֹ אֶשְׁכּוֹל") | Animal Crossing museum | A shared, growing symbol | Streak pressure → Shabbat-safe, no shame |
| **B · The lottery (פייס)** | A daily ritual moment that assigns today's role | Wordle (one a day), Papers Please (a day structure) | Anticipation, fairness, variety of roles | Gambling feel → §10.3 rules |
| **B · Terumat hadeshen** | The first task of the day: immersion, then the ash (a hold-and-scoop gesture); the race that became a lottery | Cooking Mama step | A clear first action; a true story (Yoma 2:2) | Slapstick → calm, dignified animation |
| **B · Arranging the wood** | Build the great pyre by the rule ("כל העצים כשרין … חוץ משל זית ושל גפן", Tamid 2:3): sort the logs | Papers Please (inspection), Tetris-like placement | Rule knowledge becomes play | Speed pressure → no timer, a gentle check |
| **B · The dawn watch "ברקאי"** | Look east in the real sky; call "ברקאי!" when it lights (Tamid 3:2) | Animal Crossing (real sky), Pokémon GO | The real clock made magical | Getting up at dawn → live window + practice anytime |
| **B · Inspecting the lamb** | Inspection by torchlight ("מְבַקְּרִין אוֹתוֹ לְאוֹר הָאֲבוּקוֹת", Tamid 3:4) | Papers Please | Attention, a true rule (blemishes) | Gore/suffering → §2.9 of PROJECT.md: a calm, healthy animal, no wounds |
| **B · Catching and applying the blood** | The vessel and the prescribed marks only; NE and SW corners (Tamid 4:1) | Cooking Mama (precision), Monument Valley (calm) | Precision with meaning | Violence → camera cuts away at shechita (PROJECT §2.9); no failure animation |
| **B · The lamps** | Clean and relight in order (five, then two: Tamid 3:9, 6:1) | Rhythm/sequence games | Order matters; beautiful light | – |
| **B · The ketoret** | The legendary role: only "new" priests (Tamid 5:2) and a timing beat: wait for the memuneh's "הַקְטֵר" (Tamid 6:3) | Rhythm Heaven (wait for the cue) | Rarity with meaning, not with money | Farming the rare role → "only new ones" makes it once per priest |
| **B · The magrefa** | A sound event: "אֵין אָדָם שׁוֹמֵעַ קוֹל חֲבֵרוֹ בִּירוּשָׁלַיִם מִקּוֹל הַמַּגְרֵפָה" (Tamid 5:6) | Juice (Jonasson & Purho) | A spectacular signal moment | – |
| **B · The limbs** | A line of priests with the limbs, in order, up the ramp (Tamid 4:3) | Overcooked/Diner Dash chains | Cooperation and sequence | Rushing → no timer penalty |
| **B · The Levites' song** | Ben Arza's cymbal cues the song; at each break a trumpet and a prostration (Tamid 7:3) | Rhythm Heaven | Music as play; the daily psalm (shir_shel_yom.json) | Liturgical music as a toy → respectful audio, the psalm text shown, not "scored" harshly |
| **B · Pilgrims' offerings** | Orders to route correctly: where slaughtered, where the blood goes, who eats, until when (Zevachim 5) | Hay Day orders, Diner Dash | Knowledge as mastery; variety | Punishment → a mistake opens a sourced explanation |
| **B · Festivals** | Live events on the Hebrew calendar (Sukkot tonight) | Animal Crossing, Stardew, Pokémon GO | Real time made meaningful | FOMO → announced ahead, optional, replayable later |
| **B · Kohen Gadol, Yom Kippur** | Watch-only scene | – | Awe | Never playable (PROJECT §2.5) |

---

## 10. Phase B hooks spec (for the Avodah agent)

This is a spec, not code; it is written so it can be built tonight in a first version and grown later. It follows
PROJECT.md §7 and §12 and the content DB. **Rule zero:** the service is taught truthfully; the hooks serve the
meaning, never the other way round.

### 10.1 The day: real clock, done kindly (live + practice)
- **Live**: the morning Tamid follows Jerusalem's real dawn (calendar.js `templeSchedule`/`nowInTemple`). The live
  window is generous: the pre-dawn stations (immersion, the first lottery, terumat hadeshen, the wood) can be played
  from the evening before until the dawn call; the dawn-to-morning stations until noon; the afternoon Tamid from its
  time (8½ halachic hours, Pesachim 5:1) until night.
- **Practice**: every station is always playable as practice, with the same content and the same learning credit.
  Live adds only a ceremonial mark ("שירתי בזמן" in the mishmar book) and the day's lottery role; it never gates
  progress. **Nobody is ever locked out** (a player in another time zone, a child at school, a Shabbat-observant player).
- **Session size**: the morning service is ~5–8 minutes of play in 10–40-second stations (Cooking Mama / Township
  scale), with a natural end ("the Tamid is on the altar; the Levites sing"), then the rest card equivalent: what
  comes next (the afternoon Tamid at 14:xx, tonight's night burning, tomorrow's lottery).
- **Shabbat and Yom Tov**: the real Temple served on Shabbat (and Musaf was added). The game must still never push:
  no notifications on Shabbat/Yom Tov (Jerusalem time), streaks never break, and ⚑ whether the live service can be
  played on Shabbat at all is an owner decision (§13). Practice mode stays available after Shabbat.

### 10.2 The daily lottery (פייס) as a ritual
Mishnah: the memuneh says "מִי שֶׁטָּבַל יָבֹא וְיָפִיס" (Tamid 1:2); there were four lotteries (Yoma 2:2–4); the first
was instituted after a race up the ramp ended in an injury: "וְכֵיוָן שֶׁרָאוּ בֵית דִּין שֶׁבָּאִין לִידֵי סַכָּנָה,
הִתְקִינוּ שֶׁלֹּא יְהוּ תוֹרְמִין אֶת הַמִּזְבֵּחַ אֶלָּא בְפַיִס" (Yoma 2:2; content/tamid.json `payis_1`).
- **Once a day, as a ritual** (Wordle's one-a-day): the player's priest stands in the circle in the Gazit chamber; the
  counting is shown transparently; the role lands. 15–25 seconds. It starts the day's session.
- **Every role is good.** The 13 roles of the second lottery (Tamid 3:1: "מִי שׁוֹחֵט, מִי זוֹרֵק, מִי מְדַשֵּׁן מִזְבֵּחַ
  הַפְּנִימִי, מִי מְדַשֵּׁן אֶת הַמְּנוֹרָה…") each lead to a different key station. No role gives more "loot"; roles
  give variety (Rhythm Heaven's sets, Township's mini-games).
- **Not gambling** (§2.5, GDD §10): no wager, no prize value, no re-roll ever (not for money, not for ads, not for
  "coins"), no near-miss animation, no rarity colours, no sound of a slot machine. The draw is seeded per day and
  mishmar, so it is reproducible (and testable) and cannot be fished by reloading.

### 10.3 The ketoret: the legendary role, with the Mishnah's own anti-grind rule
"חֲדָשִׁים לַקְּטֹרֶת בֹּאוּ וְהָפִיסוּ" (Tamid 5:2; Yoma 2:4): only priests who never offered the ketoret enter this
lottery. That is the most beautiful hook in the Mishnah: a rare, meaningful role that **cannot be farmed**, because
once you have done it you are no longer "new".
- In the game: the player's priest is "new" until he wins it once. The draw is among the new priests of the beit av
  on duty, so the odds rise as others win and become "old": a fairness guarantee, not a pity timer (tell the player
  the odds in words: "3 כהנים חדשים היום").
- The ketoret station itself is a **timing beat**: "לֹא הָיָה הַמַּקְטִיר מַקְטִיר עַד שֶׁהַמְמֻנֶּה אוֹמֵר לוֹ, הַקְטֵר"
  (Tamid 6:3): prepare, wait, and act on the call. Rhythm Heaven's "wait for the cue". The house empties ("פָּרְשׁוּ
  הָעָם"), the smoke rises. Calm, holy, unforgettable. The moment goes into the player's book with the date.
- After it, the player is "old" for the ketoret: later mornings bring other roles (the "old with new" fourth lottery
  for the limbs, Tamid 5:2–3 per the DB). Trained priests from Phase A (the player's beit av) can also be "new".
- ⚑ Yoma 26a's reasons ("it makes rich") are a Gemara claim the content agent marked "not checked": do not show it
  until verified.

### 10.4 Dawn: "בַּרְקַאי"
"צְאוּ וּרְאוּ אִם הִגִּיעַ זְמַן הַשְּׁחִיטָה. אִם הִגִּיעַ, הָרוֹאֶה אוֹמֵר, בַּרְקַאי" (Tamid 3:2). The live version uses the
real sky (dawn computed for the Temple Mount); the player looks east from the roof and calls it. Practice works any
time (the world's dawn preset). This is the Animal Crossing lesson: the real clock is a feature, not a lock.

### 10.5 The mishmar week as a social frame
- 24 mishmarot rotate by week; all serve at the three festivals. The player's mishmar (chosen in Phase A) has its
  **own week**: a week of extra roles, a "duty week" banner, and a small weekly arc (arrival on Shabbat, service,
  departure). The historical rotation is uncertain (GDD ⚑4): label it as the game's reconstruction.
- Between duty weeks the player serves "as a visitor" (practice) and trains the beit av's priests (the Phase A
  trainees carry over).
- Later (Sprint 4, accounts): real players in the same mishmar form a guild: a shared weekly goal (the whole mishmar
  offers N tamidim together), no competition, no leaderboard shaming. Relatedness (SDT) without pressure.

### 10.6 Festivals as live events (Sukkot starts tonight)
- Announce ahead (Stardew's letter): a card a few days before, and the calendar in the book.
- **Sukkot** (15–21 Tishrei): the water libation every day (the flask through the Water Gate: Middot 2:6, already in
  Phase A as a card); Simchat Beit HaShoevah on the nights from the second night (content DB `simchat_beit_hashoevah`,
  **needs_check**: verify before use); the bulls of the Musaf decreasing by one a day (Numbers 29) as a daily
  countdown; the willows around the altar. Each day one new station, 1–2 minutes (Township's event size).
- Optional and replayable: every festival station stays in practice mode after the festival; nothing is exclusive
  forever. Rewards are commemorative (a page in the book), not power.
- The altar's whitewash twice a year ("וּמְלַבְּנִים אוֹתָן פַּעֲמַיִם בַּשָּׁנָה", Middot 3:4, with the GDD's Pesach/Sukkot
  reading) is a maintenance event that ties Phase B back to the altar the player built.

### 10.7 Collections (deterministic, meaningful)
- **The vessels** of the service (the lamb chamber scene brings out the vessels: the DB summary cites 93 silver and
  gold vessels, Tamid 3:4 — verify the wording before use). A vessel is added when the player first uses it in a
  station.
- **The garments** (the four of a kohen; the eight of the Kohen Gadol, shown, not worn by the player).
- **The 15 offices (ממונים)** of Shekalim 5:1 (content/memunim.json): meet each officer in his place (Gvini the herald,
  Ben Arza at the cymbal, Beit Avtinas at the ketoret, Pinchas over the garments…). A collection of *people and
  jobs*, which is also the Temple's org chart; it can later frame ranks (PROJECT §7).
- **The Tamid book**: the 40 steps of content/tamid.json, each with its mishnah, like Phase A's Middot book.

### 10.8 The weekly and seasonal arc
- Daily: the lottery, the morning Tamid, the afternoon Tamid (optional), the night burning (a calm night scene).
- Weekly: Shabbat (showbread changed: content DB `lechem_hapanim`), the mishmar week.
- Monthly: Rosh Chodesh Musaf.
- Seasonal: Pesach (the three groups), the Omer, Shavuot (two loaves, bikkurim), Sukkot. Township's cadence applies:
  events with breathing room between them.

### 10.9 Notifications (later, Capacitor)
Opt-in only; at most 2 a day; quiet 22:00–07:00; never on Shabbat or Yom Tov; never guilt ("your priests miss you" is
banned); invitation language only ("הממונה קורא לפייס" at the player's chosen time). Include a real "pause" (ICO
Standard 13).

### 10.10 What Phase B should measure (telemetry names)
`payis(role, live)`, `station(id, sec, retries, live|practice)`, `ketoret_won`, `dawn_call(live, delta_min)`,
`festival_station(id)`, `session_end(open_timers)` (already emitted by Phase A as `sessionEnd`), `rest_card`.
Targets: first station within 30 s of opening Phase B; the morning service completable in ≤ 8 min; ≥ 80% of sessions
end with a visible next appointment.

### 10.11 Acceptance tests for the first version
1. A player at 13:00 (after the live window) can play the whole morning Tamid in practice and gets the book entry.
2. The lottery gives the same role on reload the same day (seeded), and never offers a re-draw.
3. The ketoret can be won once per priest; after winning, the player's priest is never in the "new" lottery again.
4. No station has a fail screen; a mistake shows the source.
5. Shechita: the camera cuts away; blood only in the vessel and as the marks (PROJECT §2.9).
6. Nothing on Shabbat/Yom Tov sends pressure; streaks never break on those days.


### 10.12 Sprint 3: what is built now, item by item

| Spec item | Built in Sprint 3 (file) | Evidence that asked for it (docs/PLAYTEST.md, Phase B) |
|---|---|---|
| 10.1 session size, natural end | **"העבודה שלך היום"**: the payis → your role's work "בפועל" → the song, ~3 min, a gold button on the home and on the summary of any service where your own work was not done (`src/avodah/hooks/index.js` `mineList`, `index.js` run('mine')) | the regular who joins live at 06:30–06:45 always lands on the service's tail (payis3 → ketoret → birkat → shir): the same 2–4 games every morning, 0 new cards after day 1, his own role never done live |
| 10.1 next appointment | the day panel: הפייס · בפועל · נכחת בזמן, the morning x/14, "הבא במקדש", and one line on tomorrow (`todayHTML`, `tomorrowHe`); the summary ends with "מחר: …" | before: the summary named the next live segment but never what tomorrow brings |
| 10.2 the payis as a ritual | the ritual starts with the payis every day; a late live joiner gets the reveal card ("הפייס כבר נפל בלשכת הגזית") instead of losing it; the dots of the games he does "בפועל" today are ringed in gold on the progress bar ("my work is coming") | the late joiner never saw payis2 |
| 10.5 the mishmar week | "משמר X עולה לירושלים בעוד N שבועות" in "הדרך שלי"; in his week, and on every festival (all the mishmarot serve, Sukkah 5:7), "נכחת בזמן" counts twice (`mishmarHe`, `mishmarWeek`) | the mishmar was a name only |
| 10.6 Sukkot as a live event | the bulls strip 13·12·11·10·9·8·7 with today's count and "x מתוך 70 עד היום" (Sukkah 55b; Numbers 29), Ezra 3:4, "all the mishmarot serve", the seven days of the festival (Shabbat/Yom Tov count by themselves) (`sukkotHTML`, `festMark`) | the festival box listed facts; nothing changed from day to day |
| 10.7 collections | **the vessels**: 25 vessels from content/tamid.json `vessels`, each collected in the work that uses it, with its step and source; **mastery tiers** per work (למד · מיומן · בקי · מומחה; a mistake never lowers a tier); the 15 ממונים and the 13 roles stay | the book (40 steps) was 35/40 after the first morning: no long collection was left |
| 10.8 ranks | RANKS spread (20, 110, 450 … 7400: two ממונים in the first morning; the bots' regular met 4 in his first week, the ritual player 3; the fifteenth takes ~4 weeks of full live mornings before dawn (~270 a day), ~2 months for the regular (~125 a day), ~4 months for the ritual alone (~65 a day)); a same-day repeat of a game counts 3 (`POINTS.again`); one ממונה card per service | before: 5 ממונים (a third of the ladder) and 5 cards in a row after the first morning; the binger met 9 in one evening |
| first-time vs repeat pacing | a repeat of a work: the walk-in wait is capped at 1.2 s (was 2.6 s) and the after-wait at 0.9 s (was 2.2 s); its source card is one line + "למקור ולהסבר" (folded) that moves on by itself after 4 s (a thin bar; any touch keeps it) | reading was 52–60% of a first-timer's session; the regular re-read the same cards every morning |
| streak | Shabbat and Yom Tov never count (as before) + **one missed weekday a week is covered by itself** (Duolingo's freeze without the shop, §11.4) (`graceCovers`, `state.touchStreak(…, grace)`) | before: one missed Tuesday reset any streak to 1 |
| Phase A → B | a soft gate (`src/game/hooks/avodah.js`): the menu button reads "הצצה" while the House is built, the altar complete invites to the first service ("וְהֵיכַל ה׳ לֹא יֻסָּד", Ezra 3:6), Chanukat HaBayit invites to the full service; the menu, `#avodah` and the demo always open Phase B ⚑ | the handoff was a menu button only; nothing in Phase A pointed at Phase B |

Not built (requests, §13): a one-line intro for repeats inside the mini-games (`gctx.repeat`, `gctx.tier` are passed
to every game now), a harder "בקי" variant per game, the garments as knowledge cards (not as items: a kohen does not
serve without all four, Zevachim 17b), a shared "focus of the day" (Wordle's one puzzle for everyone; the role lottery
already makes every day different, so I left it out), notifications (Sprint 5).

## 11. Real-time and real-calendar games: what we adopt, and why (Sprint 3)

Phase B runs on the real Jerusalem clock and the Hebrew calendar. Six games that live on a real clock or a daily
ritual, what each one teaches, and what we take and leave.

### 11.1 Animal Crossing: the clock is the world, not a lock
The series has run on a real-time clock since the first game: "There's a real-time clock, so depending on the season
and time of day, various events occur in the village" (Kazumi Totaka, in the developer interviews translated by
[shmuplations](https://shmuplations.com/animalcrossing/)); the designers' core idea was communication between people
("a key concept for us was people communicating with each other", Katsuya Eguchi, ibid.). New Horizons keeps holidays
on their real dates ([Nookipedia, events](https://nookipedia.com/wiki/Event/New_Horizons)), and the long "time
travel" debate ([Game Rant](https://gamerant.com/pokemon-pokopia-animal-crossing-time-travel-debate/)) shows what
happens when the only way to see something is to be there at the hour: players change the console's clock.
**We adopt:** the home shows what the Temple is doing *now*, under the real sky (the Avodah agent's `liveScene`), and
the day panel names the next appointment. **We leave:** anything reachable only live. Every work is playable as
practice at any hour (so nobody needs to "time travel"), and the live window only adds a mark ("נכחת בזמן").

### 11.2 Pokémon GO Community Day: a short, announced window with a gift
Community Day has run monthly since January 2018: a three-hour window in local time (six hours during 2020–2022),
a featured creature, an exclusive move, and a two-hour grace after the window to evolve and keep it
([Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Community_Day)). It works because the window is short,
known in advance and shared by everyone at once. **We adopt:** the festival as a live event with a clear window that
is announced ahead ("שמחת בית השואבה מחר ב-19:06"), a daily count everyone shares (the bulls 13 → 7), and a shared
frame ("ברגל כל המשמרות עולות", Sukkah 5:7). **We leave:** exclusives lost forever. The Beit HaShoevah game and the
aravot stay in practice after the festival, and the festival's seven days count Shabbat and Yom Tov by themselves.

### 11.3 Wordle: three minutes, then it lets you go
"Wordle is very simple, and you can play it in three minutes, and that is all you get"; "what about a game that
deliberately doesn't want much of your attention" (Josh Wardle on BBC Radio 4, reported by
[Kotaku](https://kotaku.com/wordle-creator-doesnt-want-his-popular-game-to-take-ove-1848316642)). A ritual that ends
cleanly is itself the hook: people come back tomorrow *because* it did not take their evening. **We adopt:**
"העבודה שלך היום" is Phase B's three minutes: the payis, your role's work "בפועל", the song, then a summary that ends
the day ("מחר: פיס חדש — 11 תפקידים שעוד לא עשית"). The full 14-work morning stays for those who want it.

### 11.4 Duolingo: the streak, with slack
Duolingo reports that learners who reach a 7-day streak are 3.6 times more likely to finish their course, and that
letting learners hold two Streak Freezes instead of one raised daily active learners by 0.38%, because "offering
people a little 'slack' as they pursue their goals can actually be more motivating than having a rigid set of
rules" ([Duolingo blog](https://blog.duolingo.com/how-duolingo-streak-builds-habit)). The research behind it is §2.11
(Silverman & Barasch). **We adopt:** the slack, built in and free: Shabbat and Yom Tov are never a gap, and one
missed weekday a week is covered by itself. **We leave:** freezes in a shop, repairs for currency, and any
streak-loss message.

### 11.5 Genshin Impact: a small fixed daily set, with a bonus for finishing it
Genshin gives four daily commissions and a bonus from the Adventurers' Guild when all four are done
([Genshin Impact Wiki](https://genshin-impact.fandom.com/wiki/Commission)): a bounded daily list that makes "done for
today" visible. **We adopt:** the day panel's three marks (הפייס · בפועל · נכחת בזמן) and the morning's x/14; the
"bonus" is meaning and knowledge (a vessel, a new tier, a ממונה), never a currency. **We leave:** the gacha the
commissions feed, the currency, and the energy (resin) that meters play.

### 11.6 Hay Day and Township: appointments without wither
An appointment mechanic asks the player to come back at a set time and rewards the return
([Game Developer](https://www.gamedeveloper.com/design/how-big-games-use-appointment-mechanics-to-get-gamers-keep-coming-back));
the harsh version punished lateness (crops that wither), and casual farms dropped it: "casual games such as Hay Day
and FarmVille have abandoned it" (Michail Katkoff, [PocketGamer.biz](https://www.pocketgamer.biz/how-f2p-designers-should-balance-wither-and-daily-rewards/)).
**We adopt:** appointments that are real (the Tamid at dawn and at 8½ hours, the lamps, Beit HaShoevah), shown with
a countdown, and **no wither**: missing one costs nothing. Phase A already works this way (the crews work 12 hours,
the rest card says "nothing is lost").

### 11.7 What we never take
Missed-forever exclusives; streaks or time for sale; energy that meters play; gacha, loot boxes or any
wager-shaped draw (the payis stays a fair, seeded, never re-rolled lot, §10.2); notifications that guilt or that
arrive on Shabbat or Yom Tov (§10.9).

### 11.8 Where each lesson lives in the code

| Lesson | In the game | Code |
|---|---|---|
| The real clock shows the world (AC) | "עכשיו במקדש" + the live scene; practice at any hour | `src/avodah/index.js` `liveScene`, `schedule.js` |
| Announced windows, shared counts (Pokémon GO) | Sukkot: the bulls strip, Beit HaShoevah "מחר ב-19:06", all the mishmarot | `hooks/index.js` `sukkotHTML`, `mishmarWeek` |
| Three minutes a day (Wordle) | "העבודה שלך היום" | `hooks/index.js` `mineList`, `index.js` run('mine') |
| Slack in the streak (Duolingo) | one weekday a week covered; Shabbat/Yom Tov never count | `hooks/index.js` `graceCovers`, `state.js` `touchStreak` |
| A bounded daily set (Genshin) | the day panel's three marks and x/14 | `hooks/index.js` `todayHTML` |
| Appointments without wither (Hay Day) | "הבא במקדש …", "מחר: …", nothing lost | `todayHTML`, `tomorrowHe`, the summary |

---

## 12. Risks, ethics, and what I recommend next

**Checked against the guardrails** (PROJECT §2, GDD §10): no gambling or loot boxes (the lottery spec removes every
gambling cue); no pay-to-win, no purchasable timers or currency (none added); no fake scarcity (every timer is real
and shown); no guilt or streak-loss shaming (the welcome card now frames the 12-hour cap as rest; the streak is
Shabbat-safe); no confirm-shaming; no manipulative notifications (none exist; §10.9 policy); suitable for children
(the rest card is a wellbeing nudge; the mash tip teaches rather than punishes); respect (the highlight reel keeps the
Kodesh moment quiet and ends in the finale; nothing sacred is slapstick); no Divine Name in any new text (tested).

**Recommended next (Phase A)**
1. **An always-available short loop for waiting time** (F6). Tonight: the Middot questions from day one and the
   replayable key moments. Next: "the stonecutters' yard": dress a marble block for the House in a 30-second rhythm
   mini-game, useful later (the Heichal needs marble), capped per day so it is not a grind.
2. **The weekly goal, grown** (a first version is in, §7): later, one goal a week themed on the player's mishmar
   week in Phase B (§10.5), and a choice between two goals (autonomy).
3. **Streak repair, gently**: if a streak breaks on a normal day, the next day's tasks can restore it once a month
   (Silverman & Barasch: repair reduces the drop). Never paid.
4. **Tap acknowledgement** (F11) is in: a small ripple where the finger lands. Next: tie it to what was hit (a site, a
   boulder, the quarry) once main.js passes the picked target and the screen point.
5. **Analytics** (Sprint 5): the events already emitted (`strike`, `ftue`, `restCard`, `hint`, `sessionEnd`,
   `highlight`, `mash`, `comboMilestone`) map directly to the GDD §11 KPIs.

**Phase B (Sprint 3), checked against the same guardrails.** The payis stays a fair, seeded, never re-rolled lot; the
ritual adds no currency and no timer; nothing is exclusive to a live window (practice covers every work at any hour);
the festival's seven days count Shabbat and Yom Tov by themselves; same-day repeats still count (3), so replaying is
never "worthless", it is only not a grind; the brief card moves on by itself but any touch keeps it open, and the
source is one tap away; the streak never breaks on Shabbat or Yom Tov and forgives one weekday a week without a shop;
no new text writes a Divine Name (tested: `test/hooks-avodah.test.mjs`, `test/hooks.test.mjs`).

**Round 3, checked against the same guardrails.** The stamps are a record of places visited, like a park passport: they
cost nothing, buy nothing, unlock nothing, and never expire; the reward at the end of a tab is the next question (a door),
never a number. The Ark invitation comes once, always with "אחר כך", never in the demo or under automation, and the tab
stays open to everyone. The idle-crew cue is information with one tap (three in all, ten minutes apart; no guilt, no
loss: the crews simply were not building). The caravan beat only speaks when the player is there and the caravan has
really arrived (the game's own "משלחת חזרה!" moment). Yom Kippur is announced ahead, but the service is open every day of
the year (no scarcity, no countdown to lose). No notification was added (still opt-in, later). Shabbat, Yom Tov and the
streak are untouched. No new text writes a Divine Name (tested: `test/hooks-r3.test.mjs`); every new text is a draft with
its source, and the one identification that is ours (the wood chamber as "דיר העצים") says "פרשנות של המשחק".

**Recommended next (Phase B)**
1. **Inside the mini-games** (Avodah agent): use `gctx.repeat` for a one-line intro on repeats, and `gctx.tier` for a
   harder "בקי" variant (ברקאי within a narrower moment, the limbs without the order hint, the ketoret spread evenly):
   mastery depth without new content.
2. **The child's reading**: every first-time card is unread by a 10–12-year-old (1.6 s for ~75 words). A "short
   first" card (the title and one sentence, the source one tap away) for young players is one flag away (⚑8).
3. **The mishmar as a guild** (Sprint 4, accounts): the week of your mishmar with a shared goal of all its players.
4. **Telemetry** (Sprint 5): the Phase B events (`run`, `game`, `done`, `live`, `runDone`) plus the hooks' `mine`
   runs give the numbers of §10.10 directly.

---

## 13. Open decisions for Yaron (⚑) and requests to other owners

⚑1. **The rest card** tells players they can leave. It is the ethical choice and good for long-term retention, but it
will shorten some sessions. Keep it? (I recommend yes.)
⚑2. **Faster first days**: the first trips and the starting cedar make day 1 richer; the regular player's whole Phase A
goes from 11.5 to 10.5 days (still inside 10–14). Accept, or lengthen the late game?
⚑3. **The Sukkot card in Phase A** (the Water Gate, Middot 2:6): a small festival touch in the builder. Keep it, and
extend to the other festivals?
⚑4. **Live service on Shabbat/Yom Tov** in Phase B: the real Temple served; many players will not play. Options: live
service closed on Shabbat (practice only afterwards), or open without any push. Your call.
⚑5. **The demo highlight reel** replaces "skip chapter" for investors (both stay in the demo strip). Keep both?
⚑6. **The Phase A → B gate** (Sprint 3): built soft (the menu says "הצצה" while the House is built; the altar complete
invites to the first service by Ezra 3:6; Chanukat HaBayit invites to the full service; the menu, `#avodah` and the
demo always open). Alternatives: a hard gate (no menu button before the altar, except the demo; `GATE = 'hard'`), or
no gate at all. I recommend the soft gate: it keeps your order ("the service after Chanukat HaBayit") as the story,
without locking anything the owner asked to be reachable.
⚑7. **"העבודה שלך היום"** lets a player do his role "בפועל" at any hour (practice), as the Avodah agent's ⚑ "the role
for real in practice mode" already does. Keep "בפועל" in practice, or mark it only in the live window?
⚑8. **First-time cards stay full** (the learning is the point; 52–56% of a first adult session is reading). Keep, or
show a short first card (title + one sentence, the source one tap away) and fold the rest?
⚑9. **Ranks**: two ממונים in the first morning, the fifteenth after ~2 months of a daily regular (~4 weeks for a player at every dawn service, ~4 months for the 3-minute ritual alone) (was: five on day 1, all
fifteen in ~8 days). And the festival doubles "נכחת בזמן" for everyone because all the mishmarot serve (Sukkah 5:7).
⚑10. **One missed weekday a week keeps the streak** (on top of Shabbat and Yom Tov). Keep?

**Requests to other owners**
- *main.js / 3D (supervisor or world agent):* optional: pass the picked target with the tap (`onSiteTap(id, {x, y})`)
  so the ripple can be coloured by what was hit; expose a real-time `sessionStart` on app resume for telemetry.
- *Supervisor (tests):* `game-e2e.cjs` "first strike within 15 s" measures wall-clock time, which fails when several
  agents share the CPU (28.6 s wall vs 4.6 s game side tonight); consider gating on the game-side measure only. In
  `game-harness.cjs`, "sheets/modals mark the game busy" can race with a stage card that arrives after the welcome
  card under load (seen once in five runs tonight; `dismiss()` stops after 260 ms without a card).
- *Avodah agent:* §10 is your spec; the telemetry names in §10.10 match Phase A's.
- *Content agent:* please verify before use: Tamid 3:4 (the 93 vessels wording), Yoma 26a (the ketoret reasons), and
  Sukkah 5:1–4 (Simchat Beit HaShoevah, marked needs_check).
- *Avodah agent (Sprint 3):* (1) every mini-game now receives `gctx.repeat` (played before) and `gctx.tier` (0–4):
  please shorten the intro and the first-time hints on repeats, and consider a harder variant from tier 3; (2) the
  walk-in/after waits are capped at 1.2 s / 0.9 s on repeats (`HB.stageCap/afterCap`): keep walk-ins interruptible
  (the card may open while a kohen still walks); (3) please expose the garments of garments.json through data.js
  (the hooks read content only through data.js); (4) the late-join rule (JOIN_AT) is right historically, but it means
  a working person's live morning is the tail: consider opening the live window's "join" at the player's own role
  when it is still ahead, and say so on the join button ("מצטרפים: הפיס השלישי"); (5) `ui.summary` now takes `alt`,
  `ui.card` takes `brief`, `ui.progress` takes `marks`, `state.touchStreak` takes an optional `grace`, `state.learn`
  takes `again` — all optional, all marked `── hooks ──`; (6) per-game pacing (docs/PLAYTEST.md, the per-game table):
  the song is 34 s with 14–16 s of waiting between the three פרקים even on a repeat — one פרק on repeats would save
  ~10 s a morning; the second payis (13 s, one decision) could count faster on repeats; keep the ketoret's wait for
  "הקטר!" (Tamid 6:3). For demos, `#avodah=mine` opens straight into the ritual (the payis, a role, the song, ~3 min).
- *Sanctuary agent:* the Phase B home now starts with the hooks' day panel (and the "הצצה" line while Phase A is not
  finished); your one entry line fits after it (before the practice grid).
- *Phase A agent (moments.js):* the altar-complete invitation follows the karnot stage card; if you add a key moment
  for the altar's first fire, the order moment → stage card → invitation works as is (`src/game/index.js`
  `cardsFor`, marked).
- *Content agent (Sprint 3):* the new quotes are verified on Sefaria today: Ezra 3:4 and 3:6, Sukkah 5:7 ("בִּשְׁלשָׁה
  פְרָקִים בַּשָּׁנָה הָיוּ כָּל מִשְׁמָרוֹת שָׁווֹת"), Sukkah 55b ("הָנֵי שִׁבְעִים פָּרִים כְּנֶגֶד מִי — כְּנֶגֶד שִׁבְעִים אוּמּוֹת").
  The vessel list reads tamid.json `vessels` (25 after merging duplicates such as "מחתת הכסף"/"מחתת כסף"); please
  keep one spelling per vessel there.

### Round 3 (26 Sep): decisions for Yaron (⚑) and requests to other owners

⚑R3-1. **The demo's outro** offers two doors after Chanukat HaBayit: "העבודה בבית · 3 דקות ✦" (Phase B, straight into the
ritual) and "סיור בבית המקדש · 10 תחנות". Keep both, or one?
⚑R3-2. **Moments for young players.** 12 of 15 moments take a child longer than the 25 s he gives them (PLAYTEST R3.1). A
"young player" setting that plays only the moment's core step the first time, then the source card? I recommend yes.
⚑R3-3. **Moments on a repeat** (the map's "שוב", the presenter's next demo): only the core step, then the card. The flag is
passed (`ctx.repeat`); the moments' owner decides the short version per moment. On the MOMENTS agent's question (optional
moments): I recommend keeping all fifteen on the first play (each is its stage's peak, §14.1) and shortening the repeat.
⚑R3-4. **The stamps** are kept on the device (like the settings). Move them into the cloud save when accounts come?
⚑R3-5. **"איפה הארון?" after the Ezrat Nashim**: built as one invitation (the tab stays open to all). A lock until then
(the stronger "discovery") is one line away; I do not recommend it: the owner wants everything reachable.
⚑R3-6. **Yom Kippur on the home** from twelve days before (Rosh HaShana). Another window?
⚑R3-7. **Waiting crews**: a cue and one tap (built). Alternative: crews leave a blocked site for the quarry by themselves
(a rules change in state.js `autoAssign`; the child would benefit; it changes the economy a little). Not built.

**Requests (round 3)**
- *WORLD agent (src/avodah/scenes/index.js):* one marked line in `render()` calls `globalThis.__bhSceneHooks.render(el,
  state, {goStop, open})` (src/avodah/hooks/tour.js). Please keep it after any change to `render()`; the panel works without it.
- *World / crews owner (src/crews.js, stages.js):* crews at a site that waits for a material should visibly wait (sit, the
  foreman looking down the road) — e.g. `stages.setCrews(id, n, ids, { waiting: 'cedar' })`; the game can pass it from
  `syncCrews` (`S.blockOf(G, id).lack`). Today the world shows them hammering while the rules have them idle (PLAYTEST R3.2).
- *MOMENTS owner (src/game/moments.js):* read `ctx.repeat` (true on the map's "שוב" and in a demo on a device that already
  played the moment): play the core step only — kiyor: one pour; nikanor: the storm or the steps; guf: two stones; yesod:
  the tool choice; kodesh: one lowering — then the card. And a child-length first version if the owner says yes (⚑R3-2).
- *CONTENT agent:* a one-line lead (≤ 20 words) for each scene card over 50 words (13 in the tour, 4 in the Ark, 9 in the
  service; PLAYTEST R3.3), so the panel can show the lead first and the rest one tap away (the museum label rule, §14.2).
  Please also confirm the game's identification of "דיר העצים" (Shekalim 6:1) with the Ezrat Nashim's wood chamber (the
  mystery card says "פרשנות של המשחק").
- *UI agent:* the toast buttons (`.gm-tbtn`) and the outro's two-column list (`ul.gm-reel`) are styled in the hooks' own CSS
  (src/game/hooks/index.js); move them into ui.css.js if you prefer one place.
- *Supervisor:* `test/playtest/r3-checks.cjs` (35 checks, ~2 min, one browser) covers this round's hooks in the real HUD.

## 14. Round 3 research: key moments, tours and heritage play, and what makes learning stay (26 Sep 2026)

Round 3 had new content nobody had played for fun: fifteen key moments, crews and caravans in the world, the tour, the Ark
mystery and the Yom Kippur service. I read where the evidence is strongest for each and took only what fits our rules
(PROJECT.md §2; §1 here): meaning first, no currency for knowledge, nothing withers, children welcome.

### 14.1 Moments: the peak and the end are what is remembered
- **The peak-end rule.** People judge an experience by its most intense moment and by its end, and neglect its length
  (Kahneman, Fredrickson, Schreiber & Redelmeier 1993, the cold-water study; Redelmeier & Kahneman 1996). *For us:* a
  stage's key moment is its peak and the source card its end; the length of a moment matters less than whether it ends
  on something true and beautiful. The investor reel was the clearest failure of the rule: it ended on a dead button
  (QA P1-4). **Adopted:** the reel's outro (`demoOutro`): what was shown, then two doors. The tour's tabs end on a door
  too (§14.2).
- **Mechanics as meaning, repetition that changes.** Ken Wong's GDC postmortem of *Florence* (Mountains, 2018): "the mechanics in Florence were
  used to evoke a feeling or an idea", and revisiting a mechanic showed how the relationship had changed. *For us:* a
  replayed moment should not be the same chore again; if it is played again, it should be shorter or show something new
  (a request to the moments' owner, §13 round 3; the data in PLAYTEST round 3 name which moments are chores on a replay).
- **Time on task, measured, not guessed.** The Keystroke-Level Model (Card, Moran & Newell 1980) puts ~1.35 s of mental
  preparation before each step of a task; with touch pointing and reading added to the real moments' measured floors,
  the fifteen moments cost a first-time adult 18–81 s each and a child up to 64 s (PLAYTEST round 3). Children's
  patience is the binding limit: the DOM child skips a moment after 25 s, and 12 of 15 moments are longer than that at a
  child's pace. **Not adopted tonight** (moments.js is not mine): a short first version for young players; see ⚑R3-2.

### 14.2 Tours and heritage: what museums learned about attention
- **Twenty minutes, then selection.** Visitors spend "usually less than twenty minutes" in an exhibition whatever its
  size (Serrell 1996/1998); attention drops after ~30 minutes (Falk et al. 1985), and "museum fatigue" shows mostly as
  growing selectivity: visitors attend to fewer exhibits and skip more (Bitgood 2009, *Curator* 52(2)); in a reptile
  house the first exhibits got the most time and the last the least (Bitgood et al. 1985). *For us:* a tour of 40 cards
  and 1,622 words is a long exhibition on a phone; the player needs a way to be selective without leaving.
  **Adopted:** "לתחנה הבאה" at every stop with more cards: the next view is one tap, the stop's other cards stay one tap
  back (the "layered label": everyone gets the headline, the diligent get the depth).
- **Labels of about fifty words.** Museum guidance keeps a label to "a maximum of 50 words (if longer, break into two or
  three smaller labels)", because "people only usually spend a few seconds reading a label" (Australian Museum, *Writing
  text and labels*, after Serrell 1996 and Bitgood 1991). *For us:* 13 of the tour's 40 cards, 4 of the Ark's 6 and 9 of
  the Yom Kippur service's 13 are over 50 words (the median is 45–59). **Requested** from the content owner: a one-line
  lead for every card over 50 words, so the panel can show the lead first (§13 round 3).
- **The passport stamp.** The US National Parks' *Passport To Your National Parks* (Eastern National, since 1986): free
  ink stamps "at no cost at park visitor centers and ranger stations", each "a record of each park visit". A collection
  of *places visited* is one of the oldest heritage hooks, and it needs no currency. **Adopted:** 25 stamps (10 tour stops,
  5 Ark steps, 10 Yom Kippur chapters), kept on the device, shown under the tabs, on each chip and on the Phase B home.
  They unlock nothing and cost nothing.
- **Knowledge as the reward.** *Never Alone* (Upper One Games with the Iñupiat, 2014) unlocks "cultural insights, short
  documentary-style video clips that tell the stories and experiences of the Iñupiaq people" as the player goes (Games
  for Change); *Assassin's Creed Origins: Discovery Tour* turned a game world into guided tours with stops. Its one
  classroom study (Marc-André Éthier, Université de Montréal: 40 students aged 12–17, a single tour) found a 44% gain
  in knowledge against 51% for a 12-minute teacher's lecture (Variety, 2018): a tour teaches, a guide teaches more, and
  both are better when the learner is active. *For us:* the reward for finishing a tab is the next question, never a
  number. **Adopted:** the doors: the tour ends on the Ark ("מִשֶּׁנִּטַּל הָאָרוֹן, אֶבֶן הָיְתָה שָׁם…", Yoma 5:2), the Ark
  on the one man who entered where it stood, one day a year (Kelim 1:9), the service on the real calendar.

### 14.3 Curiosity, the mystery and the calendar
- **The information gap.** Curiosity rises when people notice a gap between what they know and what they want to know
  (Loewenstein 1994, *Psychological Bulletin* 116); states of high curiosity improve memory even for incidental material
  learned in them (Gruber, Gelman & Ranganath 2014, *Neuron* 84). *For us:* "איפה הארון?" is our best gap, and it is
  sourced (Shekalim 6:1–2). It was a tab few would open. **Adopted:** the gap is opened where it happened: when the
  player finishes the Ezrat Nashim (its wood chamber is where the game places the tradition), a card with the Mishnah's
  line about the odd paving stone invites to the five steps ("אחר כך" is always there; once; never in the demo).
- **Retrieval, spaced.** Being asked to recall beats re-reading for long-term retention (Roediger & Karpicke 2006), and
  the Middot quiz already asks one question a day. *Next:* at the end of each tab, one question from its cards (a draft
  for the content owner; not built tonight).
- **An announced event.** The Yom Kippur service is the year's one real-calendar scene; announcing it ahead is Pokémon
  GO's Community Day rule (§11.2), without the scarcity: the scene stays open every day. **Adopted:** from twelve days
  before (Rosh HaShana), the Phase B home says "בעוד N ימים: יום הכיפורים", and "היום: יום הכיפורים" on the day, with
  the button to the service; the service tab's end says when the next one is (Tishrei 10, 5788 = 11 Oct 2027).

### 14.4 City builders: a crew that waits must look like it waits
- In the city builders of §3 (SimCity BuildIt, Township, Hay Day) a stalled production is shown where it happens, and the
  fix is one tap from where the problem is shown. Our crews stood at a site blocked on
  cedar and kept hammering: the world said "working" while the rules said "waiting". The playtest measured it: a
  first-timer's crews spent 65% of their in-session time and all of the night at a blocked site (PLAYTEST round 3).
  **Adopted:** a cue after 30 s (three in all, ten minutes apart) with one tap to move them where they are useful, and the
  same button on the rest card before the player leaves. **Requested** from the world's owner: crews at a blocked site
  should visibly wait (sit, look down the road) — `stages.setCrews(id, n, ids, { waiting: 'cedar' })`.
- **Appointments the player sees.** A caravan's arrival is a small appointment (§2.8). The playtest found that the
  regular player (3 × 5 minutes a day) saw **none** of his 26 caravans arrive: every one arrived while he was away, so
  the carts rolling in at the bay are a beat almost nobody sees. **Adopted:** when a caravan does arrive in the session,
  a chime and a toast with one tap to collect it; when it arrives offline, the welcome card already leads with "לאסוף".

---

## 15. References

**Round 3 (§14):** D. Kahneman, B. Fredrickson, C. Schreiber, D. Redelmeier, "When more pain is preferred to less: adding a
better end", *Psychological Science* 4(6), 1993 (summary: https://en.wikipedia.org/wiki/Peak%E2%80%93end_rule) · Ken Wong,
"Letting Go: A 'Florence' Postmortem", GDC (https://www.gdcvault.com/play/1025694/Letting-Go-A-Florence; summary:
https://www.gamedeveloper.com/design/how-simple-mechanics-and-vignettes-inspired-i-florence-i-) · S. K. Card, T. P. Moran,
A. Newell, "The keystroke-level model for user performance time with interactive systems", *CACM* 23(7), 1980
(https://dl.acm.org/doi/10.1145/358886.358895) · B. Serrell, *Exhibit Labels: An Interpretive Approach* (1996) and *Paying
Attention: Visitors and Museum Exhibitions* (1998) · S. Bitgood, "When Is 'Museum Fatigue' Not Fatigue?", *Curator* 52(2), 2009
(https://onlinelibrary.wiley.com/doi/abs/10.1111/j.2151-6952.2009.tb00344.x) · Falk, Koran, Dierking & Dreblow (1985) and
Bitgood et al. (1985), as reported in "Some Evolving Principles of Visitor Behavior"
(https://informalscience.org/wp-content/uploads/2019/02/VSA-a0a1n3-a_5730.pdf) · Museum fatigue overview:
https://en.wikipedia.org/wiki/Museum_fatigue · Australian Museum, *Writing text and labels*
(https://australian.museum/learn/teachers/learning/writing-text-and-labels/) · *Passport To Your National Parks*
(https://en.wikipedia.org/wiki/Passport_to_Your_National_Parks ; https://www.nps.gov/thingstodo/passport-stamp-locations.htm)
· *Never Alone (Kisima Ingitchuna)*, Games for Change (https://www.gamesforchange.org/games/never-alone-kisima-ingitchuna/) ·
Variety, "Assassin's Creed Origins Discovery Tour effectiveness" (2018)
(https://variety.com/2018/gaming/news/assassins-creed-origins-discovery-tour-effectiveness-1202861325) · G. Loewenstein, "The
psychology of curiosity: a review and reinterpretation", *Psychological Bulletin* 116, 1994
(https://www.cmu.edu/dietrich/sds/docs/loewenstein/PsychofCuriosity.pdf) · M. J. Gruber, B. D. Gelman, C. Ranganath, "States of
curiosity modulate hippocampus-dependent learning via the dopaminergic circuit", *Neuron* 84, 2014
(https://pubmed.ncbi.nlm.nih.gov/25284006/) · H. L. Roediger, J. D. Karpicke, "Test-enhanced learning", *Psychological Science*
17, 2006 (https://journals.sagepub.com/doi/10.1111/j.1467-9280.2006.01693.x). Texts quoted in the game (verified before this
round, PROJECT.md §2.8 and content/mysteries.json): Yoma 5:2; Shekalim 6:1–2; Kelim 1:9.


**Sprint 3 (real-clock games, §11):** Kazumi Totaka and Katsuya Eguchi, *Animal Crossing* developer interviews
(shmuplations, https://shmuplations.com/animalcrossing/) · Nookipedia, *Events in New Horizons*
(https://nookipedia.com/wiki/Event/New_Horizons) · Game Rant on the time-travel debate
(https://gamerant.com/pokemon-pokopia-animal-crossing-time-travel-debate/) · Bulbapedia, *Community Day*
(https://bulbapedia.bulbagarden.net/wiki/Community_Day) · Kotaku, "Wordle Creator Doesn't Want His Popular Game To Take
Over Your Life" (Jan 2022; BBC Radio 4 interview) (https://kotaku.com/wordle-creator-doesnt-want-his-popular-game-to-take-ove-1848316642)
· Duolingo blog, "How the Duolingo streak builds habit" (https://blog.duolingo.com/how-duolingo-streak-builds-habit) ·
Genshin Impact Wiki, *Commission* (https://genshin-impact.fandom.com/wiki/Commission) · Game Developer, "How big games
use Appointment Mechanics…" (https://www.gamedeveloper.com/design/how-big-games-use-appointment-mechanics-to-get-gamers-keep-coming-back)
· PocketGamer.biz, "Carrots and sticks: How F2P designers should balance wither and daily rewards"
(https://www.pocketgamer.biz/how-f2p-designers-should-balance-wither-and-daily-rewards/). Sources for the game's texts
(read on Sefaria, 25 Sep 2026): Ezra 3:4, 3:6; Mishnah Sukkah 5:7; Bavli Sukkah 55b; Numbers 29:12–34.
- Ryan, Rigby & Przybylski (2006): https://link.springer.com/article/10.1007/s11031-006-9051-8
- J. Chen, *Flow in Games (and Everything Else)*, CACM 2007: https://dl.acm.org/doi/10.1145/1232743.1232769
- N. Eyal, *The Morality of Manipulation*: https://www.nirandfar.com/the-art-of-manipulation/
- Yu-kai Chou, Octalysis: https://yukaichou.com/gamification-video-course/beginners-guide-gamification-4-90-gamification-framework-octalysis/ ; White hat vs black hat: https://yukaichou.com/gamification-study/white-hat-black-hat-gamification-octalysis-framework/
- J. Hopson, *Behavioral Game Design* (2001): https://www.gamedeveloper.com/design/behavioral-game-design
- Drummond & Sauer (2018): https://www.nature.com/articles/s41562-018-0360-1
- Zendle & Cairns (2018): https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0206767
- Zagal, Björk & Lewis (2013): https://my.eng.utah.edu/~zagal/Papers/Zagal_et_al_DarkPatterns.pdf
- Kivetz, Urminsky & Zheng (2006): https://journals.sagepub.com/doi/abs/10.1509/jmkr.43.1.39
- Nunes & Drèze (2006): https://papers.ssrn.com/sol3/papers.cfm?abstract_id=991962
- Ghibellini & Meier (2025): https://www.nature.com/articles/s41599-025-05000-w
- SCVNGR game dynamics playdeck (TechCrunch 2010): https://techcrunch.com/2010/08/25/scvngr-game-mechanics/
- GameAnalytics FTUE tips: https://www.gameanalytics.com/blog/tips-for-a-great-first-time-user-experience-ftue-in-f2p-games ; 2025 benchmarks: https://www.gameanalytics.com/reports/2025-mobile-gaming-benchmarks
- Jonasson & Purho, *Juice it or lose it* (GDC 2012): https://www.gdcvault.com/play/1016487/juice-it-or-lose
- Hicks et al., *Juicy Game Design* (CHI PLAY 2019): https://dl.acm.org/doi/abs/10.1145/3311350.3347171
- Duolingo, *How the streak builds habit*: https://blog.duolingo.com/how-duolingo-streak-builds-habit
- Silverman & Barasch (2023): https://academic.oup.com/jcr/article-abstract/49/6/1095/6623414
- ICO, Age appropriate design code, Standard 13 *Nudge techniques*: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/13-nudge-techniques/
- Deconstructor of Fun, *Township*: https://www.deconstructoroffun.com/blog/2020/10/13/how-playrix-township-became-a-billion-dollar-game ; *Royal Match*: https://www.deconstructoroffun.com/blog/2021/3/21/royal-match-the-new-king-from-turkey
- SimCity BuildIt deconstruction (vadhia): https://ameetvadhia.wordpress.com/2016/05/30/simcitybuildit-deconstruction/
- Megapolis Help Center, *Materials*: https://social-quantum.helpshift.com/hc/en/11-megapolis/faq/2086-materials-usage-and-how-to-obtain-them-1731927011/?p=all
- Hay Day: https://en.wikipedia.org/wiki/Hay_Day ; Clash of Clans Builder: https://clashofclans.fandom.com/wiki/Builder
- Animal Crossing: NH events: https://nookipedia.com/wiki/Event/New_Horizons ; Pokémon GO Community Day: https://bulbapedia.bulbagarden.net/wiki/Community_Day
- Stardew Valley festivals: https://stardewvalleywiki.com/Festivals ; Papers, Please: https://en.wikipedia.org/wiki/Papers,_Please ; Diner Dash: https://en.wikipedia.org/wiki/Diner_Dash ; Cooking Mama: https://en.wikipedia.org/wiki/Cooking_Mama ; Rhythm Heaven: https://en.wikipedia.org/wiki/Rhythm_Heaven ; Monument Valley: https://en.wikipedia.org/wiki/Monument_Valley_(video_game) ; Fallout Shelter: https://en.wikipedia.org/wiki/Fallout_Shelter
- Wordle (Josh Wardle interview): https://techcrunch.com/2022/01/12/josh-wardle-interview-wordle/
- Sources for the Temple texts: `src/game/middot.js` (Sefaria, Torat Emet 357), `content/tamid.json`, `content/memunim.json`, `content/calendar_offerings.json` (drafts by the content agent).
