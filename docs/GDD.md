# בית המקדש: Phase A Game Design Document ("לבנות את הבית")

**Status:** DRAFT v1 (2026-09-23), game design for review by Yaron. **Nothing here is approved.** All player-facing
texts are drafts (`status: "draft"`). Every fact used as content was re-verified on 2026-09-23 against the source text:
Sefaria (Torat Emet 357 for Mishnah; William Davidson for Bavli), Josephus (Whiston, CCEL), and Wikipedia for archaeology.
Anything not yet verified is marked **◻ verify**. Owner decisions are marked **⚑**.

Companion files: `docs/GDD-he.md` (Hebrew summary for the owner). World API: `src/stages.js` (header). Game code:
`src/game/` (state, save and migrations, guarded world calls, HUD, and the harness, which we keep).

---

## 0. The pitch, the pillars, and what changes

**Pitch.** You are a young kohen, one of the thousand priests King Herod had trained as stonecutters and carpenters
(Josephus, *Ant.* 15.11.2). Beginning with a rough, rocky Mount Moriah, you and your crews level the mount, raise the
courts, build the altar from whole stones that no iron has touched, and finally, since only priests may build it,
the House itself. The whole building rises in 3D under your hands. The game ends with *Chanukat HaBayit*, when the
fire on the altar is lit and your mishmar is ready to serve (Phase B).

**Design pillars**
1. **My hands built the House.** Every tap moves real stone in the 3D world: the hero strikes, the wall edge rises,
   the crane lifts. Each stage has its own hands-on moment.
2. **The real details are the gameplay.** The 13 breaches in the soreg, altar stones untouched by iron, the red line,
   the builders lowered in boxes, the golden vine. These are true, sourced facts, and they are also the mechanics.
   This is our differentiator; no other builder game can offer it.
3. **The site keeps working while you're away.** Crews, caravans and trainee priests make progress in real time.
   Coming back always shows visible progress. Staying away is never punished.
4. **Respect.** No gambling or loot boxes. No Divine Names written in full. The Holy of Holies is never shown inside.
   Shabbat never breaks a streak.

**Kept from the port.** The robust engineering stays: state, save and migrations (the key `bh_beta2` gets a v5
migration), guarded world calls, the HUD shell, and the Playwright harness.

**Replaced.** Everything design-side from 2D is replaced: the 7-resource economy and its numbers, the strict 15-step
line, the First-Temple expedition verses (anachronistic here: Solomon's Ophir, David's copper), and all card texts.
They are rewritten below.

---

## 1. Player fantasy and emotional arc

**Who am I?** A young kohen from a *beit av* (you pick a name and a mishmar after the first success; see §3).
Josephus says Herod "bought a thousand sacerdotal garments for as many of the priests, and had some of them taught
the arts of stone-cutters, and others of carpenters" (*Ant.* 15.11.2, **S5**), and that "the temple itself was built
by the priests in a year and six months" (*Ant.* 15.11.6, **S7**). That gives the player an authentic role that
bridges both phases: **I built the House, and now I serve in it.**

**Mentor.** An old master builder, "רב האומנים". He is a fictional composite, presented as such, and ⚑ Yaron may
name him. He speaks in one-line hints and never lectures.

**Why do I care?**
- **Competence** (SDT, Ryan, Rigby & Przybylski 2006): skilful strikes, clear progress, and mastery of the key
  moments.
- **Autonomy:** which site, which caravan, which crew.
- **Relatedness:** my beit av, my crews, and the priests I trained. They become my mishmar in Phase B.
- **Meaning:** it is *the* House, and every stone carries a true story.

**Emotional arc across the four chapters of Phase A**

| Beat | Chapter | Feeling | Payoff moment |
|---|---|---|---|
| Awe, smallness | 1 ההר | "This hill is huge. Can we build here?" | The Temple's outline glows over the rough hill (the vision), then fades |
| Agency | 1 | "My strike cracked it!" | Boulders shatter and the Herodian platform rises out of the hill |
| Belonging, mastery | 2 העזרות | "My crews, my choices" | The courts close around the Mount; pilgrims start walking in |
| Wonder | 2–3 | "I never knew that!" | 13 breaches repaired; stones that never touched iron; the red line |
| Reverence | 3 המזבח | "Fire." | The first fire on the finished altar (the Phase B teaser) |
| Pride | 4 הבית | "Only priests may build this, and I trained them" | The gold façade at sunrise, "like a mountain covered with snow" (*War* 5.5.6) |
| Culmination | Finale | Joy and quiet | Chanukat HaBayit; "מִי שֶׁלֹּא רָאָה בִּנְיַן הוֹרְדוֹס…" (BB 4a) |
| Hand-over | → Phase B | "Tomorrow at dawn, my mishmar serves" | The first real-clock Tamid |

---

## 2. Core loop at three levels

### 2.1 Moment to moment (1–10 s): the strike
```
tap site/boulder ─▶ hero runs (walkTo) ─▶ swing ─▶ IMPACT ─▶ +work · dust/chips/sparks · edge glow rises · thud + haptic
      ▲                                                                                  │
      └──────────── rhythm ring pulses on the beat: tap as it closes = מכה מדויקת (×2, combo) ◀┘
```
- **One tap is one strike.** At most one buffered tap, so the hero feels responsive rather than queue-driven.
- **Perfect strike (מכה מדויקת).** A thin gold ring contracts around the site's hot spot, following the swing rhythm
  (about 0.9 s; the stages.js swing hits at 0.40 s). A tap within ±110 ms of the beat gives ×2 work, gold sparkles
  and a brighter chime.
- **Combo.** Consecutive perfect strikes build a combo (×1.5 → ×2 → ×3, capped) shown on a small meter.
- **No punishment.** Missing only resets the combo, and a normal strike still counts. This follows the "active bonus"
  pattern of idle games (Pecorella, GDC 2015): active play is optional and faster, idle play is enough.
- **Hot spot.** A glowing stone on the current build line. Striking it (tapping *in the world*) keeps the player's
  eyes on the 3D scene rather than the HUD. ⚙ API request: `world.hotspot(id)`.
- **Boulders** (stage `har`) keep the 2D rule: two hits per boulder, a crack and then a shatter, which already exists
  in stages.js.

### 2.2 Session (3–8 min, portrait, one hand)
GameAnalytics 2024 data: median session 5–6 min, top quartile 8–9 min, about 4 sessions a day. Our target is
**5–7 min, 3–4 sessions a day.**
```
ARRIVE (0:00–0:20)  "welcome back": the 3D timelapse replays the crews' offline progress (setStage progress eases up),
                    caravans returned, trainees graduated, today's wage (שכר היום)
COLLECT (0:20–0:45) tap returned caravans → materials fly into the HUD
DECIDE  (0:45–1:30) assign crews (build ▸ quarry), send caravans (short/long to fit my next return),
                    start priest training (chapter 4)
BUILD   (1:30–5:00) active strikes on 1–2 sites, one key moment (mini-game), a true-detail card → collection
SET UP  (5:00–5:30) the game shows the next appointments: "crew finishes 'מבנה' in 1:40 · Jaffa rafts in 3:00"
```
Each session should end with at least one timer running (a caravan, training, or crew work). That is the healthy
return hook. Nothing is lost if the player doesn't return (§10).

### 2.3 Meta (days and weeks)
- **Four chapters and a finale** (§4.4). A regular player finishes Phase A in about 10–14 days; a heavy player in
  about 5–7.
- **Priest training track.** Stonecutters and carpenters, trained on real timers, gate chapter 4.
- **Collections.** The **Middot book** (all 34 mishnayot, ending in a siyum), the **golden vine** (daily tasks give
  leaves, grapes and clusters, hung on the real façade), and **archaeological finds**.
- **Daily wage with a streak** (Shabbat grace), **3 daily tasks**, and a **weekly goal**.
- **Hand-over into Phase B:** the name, the beit av, the trained priests, the vine, and the lit altar fire all carry
  over (§9).

---

## 3. First-time experience (FTUE)
Best practice: let players do something fun immediately, show the game's value within 2–3 minutes, measure every
tutorial step as a funnel, and give goals after the tutorial (GameAnalytics FTUE tips).

### First 10 seconds: the wow (in the 3D world, no menus)
1. The loader (page.html) says: *"ירושלים, שנת 18 למלכות הורדוס…"* ◻ verify the year before use (Josephus dates the
   start to Herod's 18th year, *Ant.* 15.11.1). Otherwise use a neutral line.
2. The camera is on the Mount of Olives at the **real time of day** (dawn, noon, dusk or night preset, with rain at
   night per §6). Below is the bare, rocky Mount Moriah with 12 boulders.
3. **The vision (2 s).** The outline of the whole future Temple draws itself in gold light over the hill (every
   stage footprint and pin lights up in sequence), holds, and fades. One line: **"כאן ייבנה הבית."** ⚙ API request:
   `world.showPlan(ms)`. The fallback is focus plus the existing outlines and pins.
4. The camera glides to the hill (`focus('har')`). The hero stands by a boulder with a pulsing hand: **"הקש על הסלע."**
   The first strike happens within about 15 s of the page becoming interactive.

### First 60 seconds
| t | What happens | Teaches |
|---|---|---|
| 10–20 s | First strike cracks the boulder; the second shatters it (big FX, shake). "+20 🪨" flies to the HUD | tap = strike, boulders give stone |
| 20–30 s | The ring appears: "הקש כשהטבעת נסגרת" → the first perfect strike (gold sparks) | skill layer (optional) |
| 30–45 s | 2 more boulders. The hill visibly lowers (`har` progress 0 → 25%) | progress is physical |
| 45–60 s | רב האומנים: "לבד לא נגמור. הנה הצוות שלך." Quarrymen walk in and progress continues **without tapping** | crews = progress while away |

### First 5 minutes
| t | Beat |
|---|---|
| 1:00 | First **true-detail card**: "Herod had 1,000 priests taught to cut stone and to build" (S5). "You are one of them." Then a name and mishmar prompt (personalization after the first success) |
| 1:30–3:00 | Finish the remaining boulders together with the crew. **The great stone**, a key moment: the crane lowers a giant corner ashlar into the SW corner (hold to lower, release on the mark). Card: stones 25×8×12 cubits (S6); the largest known stone is 13.55 m (A3) |
| ~3:00 | **Chapter 1 complete.** The platform rises out of the hill (stages.js reveal plus finish FX) and pilgrims appear (`life.setPilgrims`). Reward: a **2nd crew** and the **caravans** unlock. Find: the **"לבית התקיעה" inscription** at the SW corner (A1) |
| 3:30 | First caravan, **"עגלות המחצבה"** (Josephus' thousand wagons, S5), a **5-minute** trip, so the timer pays off inside session 1 |
| 4:00 | The wall (chapter 2) opens. It costs stone and cedar. Assign crew 1 to build and crew 2 to the quarry. The wall's first key moment is **"הנדבך הראשון"** (lay the first course) |
| ~5:00 | The wagons return: collect, and the loop is learned. The session ends with "the first course will be finished by your crew in ~30 min" |

### Day 1, Day 2, Day 7

| | Content | Why they come back |
|---|---|---|
| **Day 1** (2–3 sessions) | Chapter 1 done; wall done; the first choice of **gates / Ezrat Nashim / altar foundations**; first daily tasks → first **vine leaves** | Crews and caravans running; curiosity about the 3 open sites |
| **Day 2** | The welcome-back timelapse (the walls rose overnight); wage day 2; **13 breaches** (soreg) or **the wood chamber** (Ezrat Nashim) key moments; the Alexandria caravan and the **Nikanor storm story** | Streak, long caravans, next story beat |
| **Day 7** | Chapter 3 (the altar): whole stones from the Beit Kerem valley, **no iron**, the **red line**, and the **first fire** (Phase B teaser: watch the Tamid once). The priest training yard opens. The first vine **cluster** (7 days of tasks). Weekly goal reward | The House chapter is announced ("only priests may build it"); training timers |

**Why they return each time:** something of theirs is ready (caravans, trainees, crew progress); something new is
promised (the next true detail and the next spectacle); streak and vine; and clear goals from the goal pill.

---

## 4. Pacing and economy

### 4.1 Resources (from 7 down to 5, plus 2 kinds of people)
| Resource | Source(s) | Sinks | Timer or tap |
|---|---|---|---|
| 🪨 **אבן** (stone) | Boulders in `har`; **quarry** (crews on a timer; the hero by tapping); wagon caravans | Most stages (courses, gates, steps) | Both |
| 🌲 **ארז** (cedar) | Caravans: rafts from Lebanon to Jaffa (S31) | Scaffolding (refunded 50% when struck), beams (S24), roofs, lintels (S23) | Timer |
| 🟤 **נחושת** (bronze) | Caravans: Alexandria (Nikanor's doors, S15) | Nikanor gate, the laver and its 12 spouts (S22) | Timer |
| 🥇 **זהב** (gold) | Treasury: daily wage, stage and chapter rewards, **donor events** (Queen Helena's golden chandelier, King Munbaz; S32), achievements | Gold plating ("כָּל הַבַּיִת טוּחַ בְּזָהָב", S25), gilded gates (S13), the vine, כלה עורב | Scarce by design; no gold caravan |
| 🪙 **כסף** (silver shekels) | Daily wage, stage rewards, Middot quiz, achievements | Caravans (wages and transport), priest training | Currency |
| 👷 **צוותים** (crews) | Chapter rewards: 1 → 2 (ch1) → 3 (wall) → 4 (altar) | Assigned to a site or the quarry; never consumed | Slots |
| 🧑‍🦱 **כהנים אומנים** (trained priests) | Training yard (ch3+): silver plus 2–3 h real time; the Middot quiz shortens training | Required on sanctuary sites (Ulam, Heichal, Kodesh); never consumed. They become the Phase B mishmar | Slots and timers |

Two special stone types exist:
- **Whole field stones** for the altar, from the "Beit Kerem valley" caravan (S19). Dug below virgin soil, and no
  iron may touch them.
- **Dressed marble** for the House, made from stone by stonecutter-priests in the training yard. Based on "שִׁישָׁא
  וּמַרְמְרָא" (S3). Its stages.js stone type is `marble`.

The HUD shows only the resources the **current goal needs**, plus silver. The full storehouse (אוצר) is one tap away.
That solves the phone-width problem of 7 chips.

### 4.2 Where tapping is used, and where timers are
| Activity | Tap (active) | Timer (idle, offline) |
|---|---|---|
| Building a site | Hero strikes: 1 work, ×2 perfect, combo | Assigned crews: 0.5 work/min each |
| Stone | Hero strikes at the quarry: 2 stone (×2 perfect) | Quarry crew: 2 stone/min; stock capped at 12 h |
| Imported materials | – (tap to collect) | Caravans: 5 min to 12 h |
| Priests | – | Training 2–3 h each (the quiz shortens it) |
| Key moments | 10–40 s hands-on mini-games | – |

**Rule of thumb.** Active play is much faster per minute (about 50 strikes a minute versus a crew's 0.5), but it is
limited by **materials**. Stone can be tapped at the quarry. Cedar, bronze, gold, whole stones and trained priests
cannot, and they arrive on real timers. This is the Township / SimCity BuildIt model: building is quick once the
materials are in. It lets active players burst through a stage in 1–3 minutes, while the real-time imports give the
whole of Phase A its 10–14-day rhythm.

**Offline.** Crews continue up to **12 h** (a night plus a morning). After that they wait ("the crew waits for you"),
and nothing is lost. On return, stages.js already eases the displayed progress towards the target, so offline
progress **plays as a short timelapse**: free, and very satisfying.

### 4.3 Stages, phases and costs
Each stage has **3 phases**: יסודות (foundations), מבנה (structure), גימור (finish). This matches the stages.js
reveal and its foundation phase (`FOUND = 0.15`). **Each phase has its own cost, paid automatically when the phase
starts** if the materials are in stock. Otherwise the site pauses and says what it needs: "חסר ארז: 40".

Three payments per stage give three decision points and small goals, and crews carry a site through several phases
while the player is away.

### 4.4 Stage graph (instead of a strict line)
```
Ch1 ההר      har
               │
Ch2 העזרות   wall ──▶ gates ──▶ sorag, lishka
               ├────▶ nashim ─▶ nikanor
Ch3 המזבח      └────▶ yesod ─▶ sovev ─▶ guf ─▶ karnot
                                      └────▶ kiyor
Ch4 הבית     {sorag, lishka, nikanor, karnot, kiyor} + priests ─▶ ulam ─▶ heichal ─▶ kodesh ─▶ ✦ חנוכת הבית
```
- **2–3 sites are open at a time.** The goal pill recommends one; pins in the world show all of them.
- **Crews are the builder slots.** Clash of Clans: "each builder can only work on one building at a time".
- The **old 2D order is a valid path** through this graph, so v4 saves migrate cleanly.
- ⚙ stages.js has one crane, and it goes to "the most recently started site". Request: `world.setCraneSite(id)`, so
  the crane follows the hero's current site.

### 4.5 Every stage feels different: 15 key moments
Each stage has a key moment. It is a hands-on mini-game of 10–40 s, **with no fail state that blocks progress**
(retrying is instant). Each teaches one verified detail, earns a collection card, and ends in a camera moment.
Source IDs (S#, A#) refer to §6.

| # | Stage | Key moment (mechanic) | True detail (source) | Material emphasis | 3D hooks (✓ exists · ⚙ request) |
|---|---|---|---|---|---|
| 1 | **har** שיטוח ההר | **12 boulders** (2 strikes each) → **the great stone**: hold to lower a giant corner ashlar with the crane, release on the mark | Mount 500×500 (S1); stones 25×8×12 cubits (S6); the Western Stone 13.55 m (A3); "אפיק שפה ועייל שפה" drafted margins (S3) | produces stone | ✓ boulders, hill leveling, finish FX · ⚙ crane lowers a single named stone |
| 2 | **wall** חומת העזרה | **הנדבך הראשון**: lay 5 ashlars; tap as each aligns so the joints are staggered | Azara 187×135 (S9) | stone, cedar (scaffold) | ✓ scaffolds, crane, masons · ⚙ hotspot |
| 3 | **gates** שערי העזרה | **Naming the gates**: drag the 7 names onto the plan (south: הדלק, הבכורות, המים; north: הניצוץ, הקרבן, בית המוקד; east: ניקנור), each with its one-line use | 7 gates (S10, Tanna Kamma); other view: 13 gates, Abba Yosi b. Chanan (S10); later all turned gold except Nikanor's (S13); the Water Gate and the Sukkot libation flask (S10, 2:6) | stone, cedar (doors) | ✓ gatehouses reveal · ⚙ per-gate highlight |
| 4 | **nashim** עזרת הנשים | **The wood chamber**: tap the wormy logs to reject them before they reach the altar | 135×135, four unroofed corner chambers; "וְכָל עֵץ שֶׁנִּמְצָא בוֹ תוֹלַעַת, פָּסוּל מֵעַל גַּבֵּי הַמִּזְבֵּחַ"; the balcony (צוצרה) (S14) | stone, cedar | ✓ corner chambers · UI overlay for the logs |
| 5 | **nikanor** שער ניקנור וט״ו המעלות | **The storm**: an interactive story beat when the Alexandria caravan first returns (a door is thrown overboard, then emerges at Akko). Then **15 steps**, one tap each, in a half-circle | Yoma 38a; Yoma 3:10 (S15); 15 steps "כנגד חמש עשרה מעלות שבתהלים" (S14); gates gilded except Nikanor's, "because a miracle was done with them; some say, because their bronze gleamed" (S13) | bronze (doors), stone | ✓ gatehouse, 15 steps · ⚙ per-step reveal |
| 6 | **sorag** הסורג והחיל | **13 breaches**: 13 gaps glow in the lattice; tap each to repair it; learn the 13 prostrations | Soreg 10 tefachim; 13 breaches by the Greek kings, repaired, 13 prostrations (S11); the chel excluded "גּוֹיִם וּטְמֵא מֵת" (S12). Find: the **Greek warning inscription** (A2) | stone | ✓ chel and soreg reveal · ⚙ 13 gap markers |
| 7 | **lishka** לשכות | **לשכת הגזית**: swipe to dress a stone smooth; set it in the chamber of hewn stone | 6 chambers (S16); the Sanhedrin sat in the Gazit (S16); the well and wheel of the Golah chamber (S16); Beit HaMoked, where the Hasmoneans stored the altar stones defiled by the Greek kings (S17); 24 rings and marble tables (S18) | stone, cedar | ✓ Beit HaMoked, Gazit, slaughter area |
| 8 | **yesod** יסוד המזבח | **No iron**: the hero's tool changes to a non-iron mallet (visible). Sort stones: tap to reject any chipped one | Stones from the Beit Kerem valley, dug below virgin soil, whole, untouched by iron; "iron was created to shorten man's days…" (S19); yesod along N and W and 1 amah into S and E (S20) | **whole field stones** (special caravan) | ✓ `stone: 'field'` · ⚙ hero tool swap |
| 9 | **sovev** הסובב | **חוט הסיקרא**: drag the red line exactly halfway up the altar (it snaps with feedback) | "וְחוּט שֶׁל סִקְרָא חוֹגְרוֹ בָאֶמְצַע…" (S20). This sets up Phase B (blood placed above or below the line) | field stones | ⚙ `world.redLine(y)` (the red line already belongs to `sovev` per PROJECT §6) |
| 10 | **guf** גוף המזבח + כבש | **Up the ramp**: swipe stones up the kevesh in rhythm; then **whitewash** (swipe white) | Kevesh 32×16 (S21); whitened twice a year (S19); the returnees from exile enlarged the altar (R. Yosi, S20) | field stones | ✓ kevesh with `guf` · ⚙ whitewash tint |
| 11 | **karnot** הקרנות | **Four horns**, then **the first fire**: place 4 horns (4 taps), then hold to kindle | Horn places, 1 amah (S20) | field stones | ✓ `life.setFire` when the altar is complete → Phase B teaser |
| 12 | **kiyor** הכיור | **Cast the bronze**: hold to pour until the mould fills (release on the line), then fit **Ben Katin's 12 spouts** | Between the Ulam and the altar, pulled south (S22); 12 spouts and the מוכני (S22, Yoma 3:10) | bronze | ✓ `stone: 'bronze'` · ⚙ pour glow |
| 13 | **ulam** האולם | **Five lintels**: the crane lifts 5 lintels of מילת wood, each wider than the one below. Then **hang the golden vine**: your collected leaves, grapes and clusters go on the façade | Doorway 40×20, 5 lintels (S23); the golden vine: "כָּל מִי שֶׁהוּא מִתְנַדֵּב עָלֶה, אוֹ גַרְגִּיר, אוֹ אֶשְׁכּוֹל, מֵבִיא וְתוֹלֶה בָהּ… וְנִמְנוּ עָלֶיהָ שְׁלֹשׁ מֵאוֹת כֹּהֲנִים" (S24); "צַר מֵאַחֲרָיו וְרָחָב מִלְּפָנָיו" (S27) | marble, cedar, gold; **priests** | ✓ Ulam reveal · ⚙ `world.setVine(n)` |
| 14 | **heichal** ההיכל | **Gold plating**: swipe to burnish plates; at the end the camera shows the façade at sunrise | "כָּל הַבַּיִת טוּחַ בְּזָהָב" (S25); 100×100×100 and כלה עורב (S26); the gold façade "like a mountain covered with snow"; spikes against birds (*War* 5.5.6, S26); priests built it in 1½ years (S7) | marble, gold, cedar; **priests** | ✓ gold materials, bloom · ⚙ `world.shine()` sunrise glint |
| 15 | **kodesh** קודש הקדשים | **The boxes**: hold a winch to lower the craftsmen in boxes through openings in the upper chamber, keeping it steady. **The camera never shows the interior** | Craftsmen lowered in boxes "כְּדֵי שֶׁלֹּא יָזוּנוּ עֵינֵיהֶן" (S28); no ark, only the foundation stone (S29); only the Kohen Gadol, on Yom Kippur (S30) | marble, gold; **priests** | ✓ reveal from outside only · ⚙ `world.boxes(t)` |

**Completion of the kodesh stage is deliberately quiet:** soft light, no fireworks. Then the finale, Chanukat
HaBayit, celebrates the whole House (a toast of Josephus 15.11.6, "all the people were full of joy", ends before its
Divine reference; BB 4a).

### 4.6 First-pass numbers (to be tuned with a simulator; see the backlog)
Rates: hero ≈ 1 work per strike (≈ 40–50 per active minute); crew 0.5 work/min; quarry crew 2 stone/min.

| Chapter | Stages | Work per stage | Typical costs (per stage, over 3 phases) | Pacing target |
|---|---|---|---|---|
| 1 | har | 24 hits | – (produces ≈ 240 🪨) | 3–5 min (FTUE) |
| 2 | wall, gates, nashim, sorag, nikanor, lishka | 40–60 | 100–180 🪨, 20–40 🌲, nikanor 60 🟤 | Day 1–4 |
| 3 | yesod, sovev, guf, karnot, kiyor | 16–70 | 40–200 whole stones; kiyor 80 🟤 | Day 3–8 |
| 4 | ulam, heichal, kodesh | 80–150 | Marble 150–300, 🌲 60–120, 🥇 150–300; priests 6 / 10 / 6 | Day 7–14 |

Caravans are deterministic: the same route always yields the same amount. Longer trips yield more per hour, but the
real choice is which one **fits when you'll be back**.

| Route (verified source) | Yields | Short trip | Long trip | Unlock |
|---|---|---|---|---|
| **עגלות המחצבה**, the thousand wagons (S5) | 🪨 | 5 min (FTUE) / 30 min → 150 | 4 h → 1,400 | ch1 |
| **ארזים מן הלבנון אל ים יפו** (S31) | 🌲 | 2 h → 60 | 8 h → 300 | ch1 |
| **דלתות מאלכסנדריה** (S15) | 🟤 | 4 h → 60 | 12 h → 220 (+ the story, first time) | wall |
| **בקעת בית כרם**, whole stones (S19) | altar stones | 1 h → 40 | 6 h → 280 | altar |
| **חילזון התכלת** (the curtain) ◻ verify Megillah 6a / Menachot 44a before use | 🟦 (1 item) | – | 24 h → 1 | ch4 (later) |

Slots: 2 caravans (3 after the altar); 2 training slots (3 later). Gold comes ≈ 80–120 per day from the treasury,
donors and rewards, which makes the Heichal the long pole, as intended.

**Implemented and tuned (2026-09-23, sprint build).** The simulator (`test/game-sim.mjs`) showed that the first-pass
numbers let a regular player finish in about 5 days, and that a day-gated gold wall made heavy and regular players
equally slow. The build therefore uses: one caravan per route at a time; short trips pay slightly better per hour
than long ones (a long trip covers an absence, a short one rewards coming back); the quarry at 0.4 stone per
crew-minute; larger cedar, bronze and whole-stone needs; lower gold costs in chapter 4, with two donor events from
Mishnah Yoma 3:10 (Munbaz when the altar is complete, Helena's golden chandelier when the Ulam is built). Simulated
pacing: regular player (3 visits a day) 11.5 days, heavy player (8 visits) 6.5 days, light player (1 visit)
22.5 days. The live numbers are in `src/game/content.js`; this table is kept as the design intent.

### 4.7 Speed-ups without pay-to-win (monetization-neutral)
1. **Your own hands**: active strikes, perfect strikes and combos.
2. **Learning**: each correct Middot question shortens a trainee's timer by 20 min (at most 3 a day) and pays
   silver. Torah learning as preparation for service fits the theme.
3. **עזרת העם** (volunteers): once a day, call helpers to one site for 15 min at +100% crew rate. This is a game
   mechanic, not a historical claim.
4. **Daily wage and streak.** Crew and caravan-slot upgrades come as chapter rewards.
5. **No premium currency and no purchasable timers** in this phase. ⚑ Monetization is a later owner decision (§10).

---

## 5. Meaningful choices (real trade-offs, not busywork)
| Choice | Options | Trade-off |
|---|---|---|
| **Crew allocation** | Build here ▸ build there ▸ quarry | Progress now versus stone for later; parallel sites versus finishing one |
| **Which site next** (graph) | E.g. after the wall: gates, Ezrat Nashim, or the altar base | Unlock order: gates lead to soreg and chambers; Ezrat Nashim leads to Nikanor; yesod starts the altar chain and the next crew |
| **Which caravan and how long** | Short versus long, and which material | Fit it to my real day (commute versus night); what is my bottleneck? |
| **Priest specialization** (ch4) | Stonecutters (dress marble) versus carpenters (lintels, beams, scaffolds) | Josephus names both (S5); the Heichal needs both |
| **Gold** | Gild the gates now (cosmetic plus prestige) versus save for the Heichal plating | Prestige now versus progress later |
| **Streak help** | Use today's volunteers on the long pole or on the fun site | Efficiency versus enjoyment |

No choice is a trap: every option progresses, and the graph never dead-ends.

---

## 6. Authentic history as game content (verified 2026-09-23)
Quotes are exact from the stated source edition. Short excerpts are marked "…". The Bible quote is shown without
cantillation.

| ID | Ref | Exact text (excerpt) | Used for |
|---|---|---|---|
| S1 | משנה מדות ב, א | "הַר הַבַּיִת הָיָה חֲמֵשׁ מֵאוֹת אַמָּה עַל חֲמֵשׁ מֵאוֹת אַמָּה" | Chapter 1 card |
| S2 | בבא בתרא ד, א | "אָמְרִי: מִי שֶׁלֹּא רָאָה בִּנְיַן הוֹרְדוֹס, לֹא רָאָה בִּנְיָן נָאֶה [מִיָּמָיו]" | Finale |
| S3 | בבא בתרא ד, א | "אַפֵּיק שָׂפָה וְעַיֵּיל שָׂפָה, כִּי הֵיכִי דִּנְקַבֵּיל סִידָא. סְבַר לְמִשְׁעֲיֵיהּ בְּדַהֲבָא, אֲמַרוּ לֵיהּ רַבָּנַן: שִׁבְקֵיהּ, דְּהָכִי שַׁפִּיר טְפֵי, דְּמִיחְזֵי כִּי אִידְווֹתָא דְיַמָּא" | Wall and House cards, marble |
| S4 | בבא בתרא ד, א | "הַשְׁתָּא מַאי תַּקַּנְתֵּיהּ דְּהָהוּא גַּבְרָא?" … "יֵלֵךְ וְיַעֲסוֹק בְּאוֹרוֹ שֶׁל עוֹלָם" | Chapter 1 intro: why Herod rebuilt (⚑ tone) |
| S5 | Josephus, *Ant.* 15.11.2 | "…got ready a thousand waggons, that were to bring stones for the building, and chose out ten thousand of the most skillful workmen, and bought a thousand sacerdotal garments for as many of the priests, and had some of them taught the arts of stone-cutters, and others of carpenters…" | Player identity, wagons caravan, priest training |
| S6 | Josephus, *Ant.* 15.11.3 | "…each of their length was twenty-five cubits, their height was eight, and their breadth about twelve" | The great stone |
| S7 | Josephus, *Ant.* 15.11.5–6 | "…the cloisters and the outer enclosures, and these he built in eight years." / "But the temple itself was built by the priests in a year and six months" | Chapter 4 gate: priests only |
| S8 | תענית כג, א; *Ant.* 15.11.7 | "וְכֵן מָצִינוּ בִּימֵי הוֹרְדוֹס, שֶׁהָיוּ עוֹסְקִין בְּבִנְיַן בֵּית הַמִּקְדָּשׁ, וְהָיוּ יוֹרְדִין גְּשָׁמִים בַּלַּיְלָה, לְמָחָר נָשְׁבָה הָרוּחַ וְנִתְפַּזְּרוּ הֶעָבִים וְזָרְחָה הַחַמָּה, וְיָצְאוּ הָעָם לִמְלַאכְתָּן, וְיָדְעוּ שֶׁמְּלֶאכֶת שָׁמַיִם בִּידֵיהֶם." / "…it did not rain in the daytime, but that the showers fell in the nights, so that the work was not hindered." | **Real-clock night rain** in the 3D world, and a card the first time it's seen |
| S9 | מדות ה, א (וכן ב, ו) | "כָּל הָעֲזָרָה הָיְתָה אֹרֶךְ מֵאָה וּשְׁמוֹנִים וָשֶׁבַע עַל רֹחַב מֵאָה וּשְׁלֹשִׁים וְחָמֵשׁ" | Wall |
| S10 | מדות א, ד–ה; ב, ו | "שִׁבְעָה שְׁעָרִים הָיוּ בָעֲזָרָה, שְׁלשָׁה בַצָּפוֹן וּשְׁלשָׁה בַדָּרוֹם וְאֶחָד בַּמִּזְרָח" · other view (ב, ו): "אַבָּא יוֹסֵי בֶן חָנָן אוֹמֵר, כְּנֶגֶד שְׁלֹשָׁה עָשָׂר שְׁעָרִים" · "וְלָמָּה נִקְרָא שְׁמוֹ שַׁעַר הַמַּיִם. שֶׁבּוֹ מַכְנִיסִין צְלוֹחִית שֶׁל מַיִם שֶׁל נִסּוּךְ בֶּחָג" | Gates |
| S11 | מדות ב, ג | "לִפְנִים מִמֶּנּוּ, סוֹרֵג, גָּבוֹהַּ עֲשָׂרָה טְפָחִים. וּשְׁלשׁ עֶשְׂרֵה פְרָצוֹת הָיוּ שָׁם, שֶׁפְּרָצוּם מַלְכֵי יָוָן. חָזְרוּ וּגְדָרוּם, וְגָזְרוּ כְנֶגְדָּם שְׁלשׁ עֶשְׂרֵה הִשְׁתַּחֲוָיוֹת" | Soreg: 13 breaches |
| S12 | כלים א, ח | "הַחֵיל מְקֻדָּשׁ מִמֶּנּוּ, שֶׁאֵין גּוֹיִם וּטְמֵא מֵת נִכְנָסִים לְשָׁם" | Soreg and chel card |
| S13 | מדות ב, ג | "כָּל הַשְּׁעָרִים שֶׁהָיוּ שָׁם, נִשְׁתַּנּוּ לִהְיוֹת שֶׁל זָהָב, חוּץ מִשַּׁעַר נִקָּנוֹר, מִפְּנֵי שֶׁנַּעֲשָׂה בָהֶן נֵס. וְיֵשׁ אוֹמְרִים, מִפְּנֵי שֶׁנְּחֻשְׁתָּן מַצְהִיב" | Gates, Nikanor |
| S14 | מדות ב, ה | "עֶזְרַת הַנָּשִׁים הָיְתָה אֹרֶךְ מֵאָה וּשְׁלשִׁים וְחָמֵשׁ עַל רֹחַב מֵאָה וּשְׁלֹשִׁים וְחָמֵשׁ" · "וְכָל עֵץ שֶׁנִּמְצָא בוֹ תוֹלַעַת, פָּסוּל מֵעַל גַּבֵּי הַמִּזְבֵּחַ" · "וַחֲמֵשׁ עֶשְׂרֵה מַעֲלוֹת עוֹלוֹת מִתּוֹכָהּ לְעֶזְרַת יִשְׂרָאֵל, כְּנֶגֶד חֲמֵשׁ עֶשְׂרֵה מַעֲלוֹת שֶׁבַּתְּהִלִּים" | Ezrat Nashim, wood chamber, 15 steps |
| S15 | יומא לח, א; משנה יומא ג, י | "כְּשֶׁהָלַךְ נִיקָנוֹר לְהָבִיא דְּלָתוֹת מֵאֲלֶכְּסַנְדְּרִיָּא שֶׁל מִצְרַיִם, בַּחֲזִירָתוֹ עָמַד עָלָיו נַחְשׁוֹל שֶׁבַּיָּם לְטַבְּעוֹ…" · "נִיקָנוֹר נַעֲשׂוּ נִסִּים לְדַלְתוֹתָיו, וְהָיוּ מַזְכִּירִין אוֹתוֹ לְשָׁבַח" | Alexandria caravan story |
| S16 | מדות ה, ג–ד | "שֵׁשׁ לְשָׁכוֹת הָיוּ בָעֲזָרָה, שָׁלֹשׁ בַּצָּפוֹן וְשָׁלֹשׁ בַּדָּרוֹם" · "לִשְׁכַּת הַגָּזִית, שָׁם הָיְתָה סַנְהֶדְרִי גְדוֹלָה שֶׁל יִשְׂרָאֵל יוֹשֶׁבֶת וְדָנָה אֶת הַכְּהֻנָּה" · "לִשְׁכַּת הַגּוֹלָה, שָׁם הָיָה בוֹר קָבוּעַ, וְהַגַּלְגַּל נָתוּן עָלָיו, וּמִשָּׁם מַסְפִּיקִים מַיִם לְכָל הָעֲזָרָה" | Chambers |
| S17 | מדות א, ו | "מִזְרָחִית צְפוֹנִית, בָּהּ גָּנְזוּ בְנֵי חַשְׁמוֹנַאי אֶת אַבְנֵי הַמִּזְבֵּחַ שֶׁשִּׁקְּצוּם מַלְכֵי יָוָן" | Beit HaMoked; bridge to the altar chapter |
| S18 | מדות ג, ה | "וְטַבָּעוֹת הָיוּ לִצְפוֹנוֹ שֶׁל מִזְבֵּחַ, שִׁשָּׁה סְדָרִים שֶׁל אַרְבַּע אַרְבַּע" · "וּמַפְשִׁיטִין עַל שֻׁלְחָנוֹת שֶׁל שַׁיִשׁ שֶׁבֵּין הָעַמּוּדִים" | Slaughter area (lishka) |
| S19 | מדות ג, ד | "מִבִּקְעַת בֵּית כָּרֶם. וְחוֹפְרִין לְמַטָּה מֵהַבְּתוּלָה, וּמְבִיאִים מִשָּׁם אֲבָנִים שְׁלֵמוֹת, שֶׁלֹּא הוּנַף עֲלֵיהֶן בַּרְזֶל" · "נִפְגְּמָה אַחַת מֵהֶן, הִיא פְסוּלָה וְכֻלָּן כְּשֵׁרוֹת" · "וּמְלַבְּנִים אוֹתָן פַּעֲמַיִם בַּשָּׁנָה" · "שֶׁהַבַּרְזֶל נִבְרָא לְקַצֵּר יָמָיו שֶׁל אָדָם, וְהַמִּזְבֵּחַ נִבְרָא לְהַאֲרִיךְ יָמָיו שֶׁל אָדָם" | Yesod (no iron), Beit Kerem caravan, whitewash |
| S20 | מדות ג, א | "וְחוּט שֶׁל סִקְרָא חוֹגְרוֹ בָאֶמְצַע, לְהַבְדִּיל בֵּין הַדָּמִים הָעֶלְיוֹנִים לַדָּמִים הַתַּחְתּוֹנִים" · "וְהַיְסוֹד הָיָה מְהַלֵּךְ עַל פְּנֵי כָל הַצָּפוֹן וְעַל פְּנֵי כָל הַמַּעֲרָב, וְאוֹכֵל בַּדָּרוֹם אַמָּה אַחַת, וּבַמִּזְרָח אַמָּה אֶחָת" · "וּכְשֶׁעָלוּ בְנֵי הַגּוֹלָה, הוֹסִיפוּ עָלָיו אַרְבַּע אַמּוֹת מִן הַדָּרוֹם וְאַרְבַּע אַמּוֹת מִן הַמַּעֲרָב" | Altar tiers, red line |
| S21 | מדות ג, ג | "וְכֶבֶשׁ הָיָה לִדְרוֹמוֹ שֶׁל מִזְבֵּחַ, שְׁלֹשִׁים וּשְׁתַּיִם עַל רֹחַב שֵׁשׁ עֶשְׂרֵה" | Kevesh (guf) |
| S22 | מדות ג, ו; משנה יומא ג, י | "הַכִּיּוֹר הָיָה בֵּין הָאוּלָם וְלַמִּזְבֵּחַ, וּמָשׁוּךְ כְּלַפֵּי הַדָּרוֹם" · "בֶּן קָטִין עָשָׂה שְׁנֵים עָשָׂר דַּד לַכִּיּוֹר, שֶׁלֹּא הָיוּ לוֹ אֶלָּא שְׁנַיִם. וְאַף הוּא עָשָׂה מוּכְנִי לַכִּיּוֹר, שֶׁלֹּא יִהְיו מֵימָיו נִפְסָלִין בְּלִינָה" | Kiyor |
| S23 | מדות ג, ז | "וְחָמֵשׁ מַלְתְּרָאוֹת שֶׁל מִילָת הָיוּ עַל גַּבָּיו" | Ulam lintels |
| S24 | מדות ג, ח | "וּכְלוֹנָסוֹת שֶׁל אֶרֶז הָיוּ קְבוּעִין מִכָּתְלוֹ שֶׁל הֵיכָל לְכָתְלוֹ שֶׁל אוּלָם, כְּדֵי שֶׁלֹּא יִבְעָט" · "גֶּפֶן שֶׁל זָהָב הָיְתָה עוֹמֶדֶת עַל פִּתְחוֹ שֶׁל הֵיכָל, וּמֻדְלָה עַל גַּבֵּי כְלוֹנָסוֹת. כָּל מִי שֶׁהוּא מִתְנַדֵּב עָלֶה, אוֹ גַרְגִּיר, אוֹ אֶשְׁכּוֹל, מֵבִיא וְתוֹלֶה בָהּ. אָמַר רַבִּי אֱלִיעֶזֶר בְּרַבִּי צָדוֹק, מַעֲשֶׂה הָיָה, וְנִמְנוּ עָלֶיהָ שְׁלֹשׁ מֵאוֹת כֹּהֲנִים" | Cedar use; **golden vine meta** |
| S25 | מדות ד, א | "שֶׁכָּל הַבַּיִת טוּחַ בְּזָהָב, חוּץ מֵאַחַר הַדְּלָתוֹת" | Heichal gold plating |
| S26 | מדות ד, ו; *War* 5.5.6 | "וְהַהֵיכָל מֵאָה עַל מֵאָה, עַל רוּם מֵאָה" · "וְאַמָּה כָּלֵה עוֹרֵב" / "covered all over with plates of gold of great weight, and, at the first rising of the sun, reflected back a very fiery splendor" · "like a mountain covered with snow; for as to those parts of it that were not gilt, they were exceeding white" · "On its top it had spikes with sharp points, to prevent any pollution of it by birds sitting upon it." | Heichal finale camera, spikes |
| S27 | מדות ד, ז | "וְהַהֵיכָל צַר מֵאַחֲרָיו, וְרָחָב מִלְּפָנָיו, וְדוֹמֶה לַאֲרִי" | Ulam card |
| S28 | מדות ד, ה | "וְלוּלִין הָיוּ פְתוּחִין בָּעֲלִיָּה לְבֵית קֹדֶשׁ הַקֳּדָשִׁים, שֶׁבָּהֶן הָיוּ מְשַׁלְשְׁלִין אֶת הָאֻמָּנִים בְּתֵבוֹת, כְּדֵי שֶׁלֹּא יָזוּנוּ עֵינֵיהֶן מִבֵּית קָדְשֵׁי הַקֳּדָשִׁים" | **Kodesh key moment** |
| S29 | משנה יומא ה, ב | "מִשֶּׁנִּטַּל הָאָרוֹן, אֶבֶן הָיְתָה שָׁם מִימוֹת נְבִיאִים רִאשׁוֹנִים, וּשְׁתִיָּה הָיְתָה נִקְרֵאת" | Kodesh card (no ark in the Second Temple) |
| S30 | משנה כלים א, ט | "קֹדֶשׁ הַקֳּדָשִׁים מְקֻדָּשׁ מֵהֶם, שֶׁאֵין נִכְנָס לְשָׁם אֶלָּא כֹהֵן גָּדוֹל בְּיוֹם הַכִּפּוּרִים בִּשְׁעַת הָעֲבוֹדָה" | Kodesh card |
| S31 | עזרא ג, ז | "וַיִּתְּנוּ־כֶסֶף לַחֹצְבִים וְלֶחָרָשִׁים וּמַאֲכָל וּמִשְׁתֶּה וָשֶׁמֶן לַצִּדֹנִים וְלַצֹּרִים לְהָבִיא עֲצֵי אֲרָזִים מִן־הַלְּבָנוֹן אֶל־יָם יָפוֹא" | Cedar caravan (a Second-Temple source) |
| S32 | משנה יומא ג, י | "מֻנְבַּז הַמֶּלֶךְ הָיָה עוֹשֶׂה כָל יְדוֹת הַכֵּלִים שֶׁל יוֹם הַכִּפּוּרִים שֶׁל זָהָב. הִילְנִי אִמּוֹ עָשְׂתָה נִבְרֶשֶׁת שֶׁל זָהָב עַל פִּתְחוֹ שֶׁל הֵיכָל" | Donor events (gold) |
| S33 | סוכה נא, ב | "מִי שֶׁלֹּא רָאָה בֵּית הַמִּקְדָּשׁ בְּבִנְיָנוֹ — לֹא רָאָה בִּנְיָן מְפוֹאָר מֵעוֹלָם. מַאי הִיא? אָמַר אַבָּיֵי וְאִיתֵּימָא רַב חִסְדָּא: זֶה בִּנְיַן הוֹרְדוֹס." | Parallel to S2 |

**Archaeology** (Wikipedia level; the content pass must cite the museum records):
- **A1**: the "לבית התקיעה…" (Trumpeting Place) inscription. Found in 1968 by Benjamin Mazar at the foot of the SW
  corner; 1st century CE; 84×31×26 cm; Israel Museum.
- **A2**: the Greek warning inscription: "No stranger is to enter within the balustrade round the temple and
  enclosure. Whoever is caught will be himself responsible for his ensuing death." The complete tablet was found in
  1871 by Clermont-Ganneau and is in the Istanbul Archaeology Museums; a fragment was found in 1936 near the Lions'
  Gate and is in the Israel Museum.
- **A3**: the Western Stone. Its face is 13.55 m × 3.3 m; ground-penetrating radar (Jol, 2006) puts its depth at
  1.8–2.5 m, so about 250–300 t (earlier estimates were 550–600 t). It is in the Western Wall Tunnels.
- **A4**: Second-Temple quarries north of the Old City (Ramat Shlomo; tools and wedges found) ◻ verify the figures
  with the IAA releases.

**Where the Mishnah and Josephus differ** (rule 4): the altar is 32×32 in the Mishnah (S20) versus 50×50×15 cubits
in *War* 5.5.6. We follow the Mishnah and mention the other view.

**Tone ⚑.** Bava Batra 4a presents Herod killing the sages and rebuilding at Bava ben Buta's advice (S4).
The proposal is to use it once, briefly, in the chapter 1 intro ("the light of the world"), without glorifying
Herod.

---

## 7. Collections and discoveries (deterministic: no random drops)
1. **ספר מידות** (the Middot book): all **34 mishnayot** of Masechet Middot (chapters 9+6+8+7+4, per Sefaria's
   structure). Each unlocks at a mapped moment (a stage, a key moment or a card), with the exact text, a
   plain-Hebrew explanation, and a "where is it in the 3D world?" button (`focus`). **Completing it is a siyum**,
   celebrated alongside Chanukat HaBayit.
2. **גפן הזהב** (the golden vine, S24). Daily tasks give a **leaf** (each task), a **grape** (all 3 tasks in a day)
   and a **cluster** (7 grape-days). The vine grows in the storehouse until the Ulam is built, then hangs on the
   façade in 3D and keeps growing through Phase B. This maps directly onto the Mishnah's "עָלֶה, אוֹ גַרְגִּיר, אוֹ
   אֶשְׁכּוֹל".
3. **ממצאים** (archaeological finds): A1 at the SW corner (har), A2 (soreg), A3 (the great stone moment), A4 quarry
   tools (the first quarry session), and ◻ a Herodian coin / stone vessel after verification. Each has an image,
   the museum, and a source.
4. **שערים ולשכות**: 7 gates (S10) and chambers (S14, S16, S17). A mini-album filled by the gates and chamber key
   moments.
5. **עיטורים** (achievements), non-grindy, 12–20 in total. For example: "12 סלעים בלי החטאה", "100 מכות
   מדויקות", "כל השערים בשמם", "משלחת ארוכה", "הכשרת 10 כהנים".
6. **Chapter story beats**, one short card each (≤ 3 lines):

| Chapter | Beat | Source |
|---|---|---|
| Prologue | Herod asks for a remedy: "go and engage in the light of the world" (⚑ tone) | S4 |
| 1 ההר | 1,000 priests taught to build; you are one | S5 |
| 2 העזרות | The Greek kings' 13 breaches, repaired | S11 |
| 3 המזבח | The Hasmoneans hid the defiled altar stones; now whole, iron-free stones | S17, S19 |
| 4 הבית | The priests built the House in a year and six months; rain fell only at night | S7, S8 |
| Finale | "מִי שֶׁלֹּא רָאָה בִּנְיַן הוֹרְדוֹס…"; a façade like a snowy mountain | S2, S26 |

---

## 8. Juice: feedback, particles, camera, sound, combos
References: Jonasson & Purho, *"Juice it or lose it"* (GDC Europe 2012): layered, exaggerated feedback on every
interaction.

| Event | 3D (✓ in stages.js · ⚙ request) | UI | Sound | Haptic | Camera |
|---|---|---|---|---|---|
| Strike | ✓ `workFX` (dust, sparks, chips), ✓ reveal edge glow (`uGlow`), ✓ glowBoost | "+1" floats from the hot spot (⚙ `world.screenPos`) | Stone "clack", pitched by combo | 10 ms | ✓ shake 0.1–0.2 |
| Perfect strike | ✓ `sparkBurst` gold | Ring snap, combo meter | Bright chime (rising scale in a combo) | 15 ms | Micro-zoom |
| Boulder crack or shatter | ✓ `hitBoulder` animations | "+20 🪨" | Crack; crumble | 20 / 40 ms | ✓ shake |
| Phase change | ✓ scaffolds, crane moves, workers re-assigned | Phase label pops | Rope creak and "heave" | – | Nudge to the new work line |
| Stage done | ✓ `finishFX` ring, ✓ `celebrate`, ✓ scaffolds struck (animated removal, cedar refund flies in) | Card slides up | Warm fanfare (strings, no liturgical music) | 60 ms pattern | ⚙ `world.orbit(id, 3s)` |
| Chapter done | All sites glow in sequence | Chapter card | Short theme | – | ⚙ `world.showcase()`: wide before/after |
| Collect caravan | – | Icons fly to the HUD, counter rolls | Coins and wood | 10 ms | – |
| Welcome back | ✓ progress eases (timelapse) | Report card | Morning ambience | – | Glide across changed sites |
| Night | ⚙ rain particles and puddle sheen (S8), torches on the site | – | Rain loop | – | – |

**Sound design.** Ambient beds: wind, birds, distant city, and stone yards by day; rain at night. Work layer:
chisels, mallets, ropes, the treadwheel, oxen carts. Music: calm and modal, ancient-Near-East in colour but not
liturgical. The UI uses soft wood and stone clicks. Mute is always one tap away, and there is no sound during
Shabbat mode.

**Combos** are purely positive: they give more sparkles and more work, and a miss only resets the meter.

---

## 9. Retention hooks, and the hand-over to Phase B
**Daily**
- **שכר היום** (the daily wage): silver and stone, plus gold on days 3, 5 and 7. The streak grows to day 7.
- **Shabbat and Yom Tov never break the streak.** Streak days count from the calendar engine (`calendar.js`), not
  from 24-h windows.
- **3 daily tasks** (strike N perfect, send a caravan, learn 1 mishnah) feed the vine.

**Weekly.** A single goal ("build N work units + 3 caravans") rewards a cluster plus silver.
⚑ Theming it by mishmar week needs care, because the historical rotation is not precisely known.

**Chapter goals.** 4 chapters, each with a visible map of what is left and a big reward: a crew, a slot, or a
spectacle.

**Appointments.** Caravans (5 min to 12 h), crew phases, priest training, and the quarry stock cap (12 h). All
of them follow the "reward on return" pattern. Zagal, Björk & Lewis list *playing by appointment* as a dark pattern
when missing an appointment is punished, so **nothing withers or is lost**.

**Notifications** (Capacitor, later): opt-in only, at most 2 a day, quiet 22:00–07:00, **never on Shabbat or Yom
Tov**.

**Hand-over to Phase B** (the real clock)
- The **trained priests** (their names and specialties) become the player's **beit av and mishmar members**.
- The **altar fire lit at `karnot`** is the "אש תמיד" that Phase B keeps burning; the first Tamid is the
  following dawn.
- The **golden vine** keeps growing from daily Avodah tasks.
- The **Middot book** leads into a **Tamid book** (the Phase B collection).
- The altar's whitewash (S19: "פַּעֲמַיִם בַּשָּׁנָה", Pesach and Sukkot) returns in Phase B as a real-calendar
  maintenance event by your stonecutter-priests.

---

## 10. Ethics and sensitivities
- **No gambling mechanics:** no loot boxes, no random paid rewards, no gacha, no "spin". Belgium's Gaming Commission
  ruled paid loot boxes illegal gambling in 2018. We avoid the whole category, paid or free. Phase B's *payis* is a
  historical fairness lottery for duties and must never be tied to purchases.
- **No Divine Names written in full.** Use ה׳ in Hebrew. We avoid quoting passages that contain Divine Names; for
  example, the Josephus 15.11.6 toast is cut before its Divine reference, and S24 skips the Zechariah verse quoted
  inside Middot 3:8 (it ends "בְּהֵיכַל ה׳").
- **Respect:**
  - The Holy of Holies is never shown inside. The builders-in-boxes moment is played from outside (S28).
  - The Kohen Gadol's service is watch-only (rule 5, ⚑).
  - The kodesh completion is quiet.
  - No destruction gameplay.
  - Herod is presented as the sources present him (S4), without glorification.
- **Shabbat mode** (⚑ proposal): from candle-lighting to havdalah, Jerusalem time (calendar.js), the site rests.
  Building actions are disabled, timers pause, the scene shows a quiet Shabbat, and only reading (the Middot book)
  is available. Streaks are unaffected.
- **Monetization-neutral for now.** No purchasable timers or currency. ⚑ If monetization comes later, the
  recommendation is cosmetic or supporter-only, **never selling sacred items or progress.**
- **Healthy play.** Sessions are designed to end naturally (appointments), with no endless grind and no fake
  scarcity or confirmshaming (Zagal et al.). Children are a likely audience: accounts need age-appropriate flows
  and data minimization when cloud save arrives.
- **Accuracy:** every card carries its source, drafts are visibly marked "טיוטה", and fiction (the mentor, the
  volunteers, the gate perks) is labeled as game interpretation.

---

## 11. Metrics and targets
Benchmark context (GameAnalytics, 2025 report on 2024 data, all mobile games):
- D1: median ≈ 17%, top quartile ≈ 27%.
- D7: median ≈ 3.4–3.9%, top quartile 7–8%.
- D28: median ≈ 1%, top quartile ≈ 2.6–3%.
- Sessions: median 5–6 min, about 4 a day.
- Casual genre median: D1 20.0%, D7 3.3%, 4.0-min sessions.

| KPI | Target (demo and soft-launch cohort) | Stretch | Why achievable |
|---|---|---|---|
| D1 retention | **30%** | 40% | High-intent niche audience, and an FTUE that pays off in minutes |
| D7 retention | **10%** | 15% | Caravans and training appointments, streak, story |
| D30 retention | **4%** | 6% | Phase B real-calendar hooks take over |
| Session length | **5–7 min** | – | Session loop §2.2 |
| Sessions per day | **3–4** | – | Timers from 5 min to 12 h |
| FTUE completion (har done) | **≥ 85%** of new players | 92% | Under 5 min, no text walls |
| Time to first strike | **≤ 15 s** after interactive | 10 s | – |
| Sessions ending with a timer running | **≥ 80%** | – | Healthy return hook |
| Phase A completion (Chanukat HaBayit) | **≥ 25%** of D7-retained players | 40% | 10–14-day arc |

**Telemetry events** (when analytics arrive):
- `ftue_step(n)`, `strike(perfect, combo)`, `key_moment(id, sec, retries)`
- `stage_phase(id, phase, source=tap|crew)`, `site_blocked(id, missing)`
- `caravan(route, length)`, `collect(route, delay)`, `train(spec)`
- `card_open(src)`, `mishnah_unlock(ref)`, `quiz(ok)`, `daily_task(id)`, `streak(n)`
- `session_end(open_timers)`

---

## 12. Prioritized backlog

### (a) This sprint, on top of the existing `src/game` and the stages API
Effort: S ≤ ½ day · M 1–2 days · L 3–5 days.

| # | Item | Effort | Depends on |
|---|---|---|---|
| 1 | **Content v2 data** (draft status): chapters; 15 stage cards (≤ 2 lines, sourced, using S1–S33); phase recipes; the 5 corrected sources; `status:'draft'` plus the "טיוטה" tag | M | – |
| 2 | **Economy v2 core**: 5 resources, per-phase auto-paid costs, crews as slots (assign to site or quarry), 12-h offline crew work, quarry stock, **save v5 migration** from v4 (keeps old saves) | L | 1 |
| 3 | **Stage graph** (2–3 open sites), goal pill "recommended next", pins; crane follows the active site | M | 2, ⚙ `setCraneSite` (fallback: current behaviour) |
| 4 | **Strike feel**: one-tap strike, rhythm ring and perfect strikes, combo meter, "+N" floats, haptics, SFX hooks (placeholder sounds) | M | ⚙ `screenPos`/`hotspot` (fallback: the goal pill anchors the ring) |
| 5 | **FTUE script** (the first 5 min in §3): vision, guided boulders, crew intro, name and mishmar, 5-min wagons | M | 2, 4; ⚙ `showPlan` (fallback: focus plus pins) |
| 6 | **Key-moment framework and 3 mini-games**: `sorag` 13 breaches, `sovev` red line, `kodesh` boxes (overlays framed on the 3D view) | L | 1 |
| 7 | **Caravans v2**: 4 verified routes, short and long, 2 slots, Nikanor story beat | M | 2 |
| 8 | **Daily v2**: wage, streak with Shabbat grace (calendar.js), 3 daily tasks, golden-vine counters (UI) | M | calendar.js |
| 9 | **Middot book** (34-mishnah map, reader, `focus` links) replacing the 2D quiz as the main learning surface; the quiz becomes the training speed-up | M | 1 |
| 10 | **Economy simulator** in `test/` (headless state runs: pacing per chapter and blocked-time %) with its numbers fed back into §4.6 | S | 2 |
| 11 | Harness and flows updated for all of the above, with phone and desktop screenshots | M | all |

### (b) Later
| Item | Effort | Notes |
|---|---|---|
| Priest training yard, specializations, marble dressing chain | L | Chapter 4 gate (priests only, S7) |
| The remaining 12 key moments | XL | Build these as 3D hooks land |
| Golden vine in 3D on the façade (`setVine`) | M (3D) | Payoff at the Ulam |
| Archaeology album with images and museum credits (A1–A4) | M + art | Verify A4 first |
| Night rain and site torches (S8) | M (3D) | Real-clock atmosphere |
| Sound design pass and music | L (external) | |
| Shabbat mode | M | ⚑ owner decision |
| Donor events (Helena, Munbaz) and gilded-gates choice | S | |
| Notifications (Capacitor), analytics, A/B | M each | Store phase |
| Accessibility pass: text size, colour-safe palette, switch access, captions for SFX | M | |
| English localization | M | |
| Phase B hand-over (mishmar from trained priests, Tamid book) | L | Sprint 2+ |

**⚙ World API requests** (for the 3D agent, each with a fallback so the game ships without it):
- `hotspot(id)`
- `screenPos(target)`
- `setCraneSite(id)`
- `showPlan(ms)`
- `orbit(id, s)`
- `showcase()`
- `redLine(y)`
- `boxes(t)`
- `setVine(n)`
- `rain(on)` and torches
- hero tool swap (non-iron mallet)
- a dedicated quarry spot (`hero.walkTo('quarry')`) with piles that grow with stock.

**Status (2026-09-24):** all of the above are in `src/stages.js` (v2), together with `strikeFX`, `setComboLevel`,
`playTimelapse` and `setQuarryStock`, and `src/game` calls each of them (the fallbacks stay for an older world).
Still open on the 3D side: `setCrews(id, n)`, so that moving a crew shows in the world.

---

## 13. Source corrections (verified against Sefaria, 2026-09-23)
| Card | 2D said | Finding | Corrected text and ref |
|---|---|---|---|
| **wall** | "העזרה הייתה 187 אמה אורך ו-135 אמה רוחב." — מדות ב, ו | **The 2:6 citation is actually valid.** Its text contains "כָּל הָעֲזָרָה הָיְתָה אֹרֶךְ מֵאָה וּשְׁמוֹנִים וָשֶׁבַע עַל רֹחַב מֵאָה וּשְׁלשִׁים וְחָמֵשׁ". The main locus, with the full breakdown, is 5:1. My earlier "should be ה,א" was too strong | "כָּל הָעֲזָרָה הָיְתָה אֹרֶךְ מֵאָה וּשְׁמוֹנִים וָשֶׁבַע עַל רֹחַב מֵאָה וּשְׁלֹשִׁים וְחָמֵשׁ" — **משנה מדות ה, א** (וכן ב, ו) |
| **gates** | "שבעה שערים היו בעזרה…" — מדות ב, ו | Wrong ref. 2:6 gives Abba Yosi ben Chanan's **13** gates | "שִׁבְעָה שְׁעָרִים הָיוּ בָעֲזָרָה, שְׁלשָׁה בַצָּפוֹן וּשְׁלשָׁה בַדָּרוֹם וְאֶחָד בַּמִּזְרָח" — **משנה מדות א, ד** (the north gates' names: א, ה). The other view: "אַבָּא יוֹסֵי בֶן חָנָן אוֹמֵר, כְּנֶגֶד שְׁלֹשָׁה עָשָׂר שְׁעָרִים" — מדות ב, ו |
| **lishka** | "…לשכות ייעודיות לכהנים, בהן התלבשו בבגדי הכהונה; ובצפון המזבח — בית המטבחיים, עשרים וארבע טבעות ושולחנות השיש" — "משנה מדות א · ה" | An ambiguous ref that mixes several mishnayot | Six chambers: "שֵׁשׁ לְשָׁכוֹת הָיוּ בָעֲזָרָה, שָׁלֹשׁ בַּצָּפוֹן וְשָׁלֹשׁ בַּדָּרוֹם" — **מדות ה, ג**. Gazit: "לִשְׁכַּת הַגָּזִית, שָׁם הָיְתָה סַנְהֶדְרִי גְדוֹלָה שֶׁל יִשְׂרָאֵל יוֹשֶׁבֶת וְדָנָה אֶת הַכְּהֻנָּה" — **מדות ה, ד**. Rings and tables: "וְטַבָּעוֹת הָיוּ לִצְפוֹנוֹ שֶׁל מִזְבֵּחַ, שִׁשָּׁה סְדָרִים שֶׁל אַרְבַּע אַרְבַּע… וּמַפְשִׁיטִין עַל שֻׁלְחָנוֹת שֶׁל שַׁיִשׁ שֶׁבֵּין הָעַמּוּדִים" — **מדות ג, ה**. Beit HaMoked's chambers — **מדות א, ו**. "לִשְׁכַּת פִּנְחָס הַמַּלְבִּישׁ" (at the Nikanor gate) — **מדות א, ד**. "They dressed there" is not stated; drop it or phrase it as "לשכת פנחס המלביש" |
| **kodesh** | "בקדש הקדשים עמד ארון הברית; בבית שני היה ריק. רק הכהן הגדול נכנס אליו…" — מדות ד, ה | 4:5 is about the upper chamber, and the craftsmen **lowered in boxes**. "ריק" (empty) is imprecise: a stone was there | "מִשֶּׁנִּטַּל הָאָרוֹן, אֶבֶן הָיְתָה שָׁם מִימוֹת נְבִיאִים רִאשׁוֹנִים, וּשְׁתִיָּה הָיְתָה נִקְרֵאת" — **משנה יומא ה, ב**; "שֶׁאֵין נִכְנָס לְשָׁם אֶלָּא כֹהֵן גָּדוֹל בְּיוֹם הַכִּפּוּרִים בִּשְׁעַת הָעֲבוֹדָה" — **משנה כלים א, ט**. Keep **מדות ד, ה** for the builders-in-boxes moment (S28) |
| **har** (a 5th, found now) | "״מי שלא ראה בניין הורדוס — לא ראה בניין נאה מימיו״" — סוכה נא, ב | That exact line is in **Bava Batra 4a**. Sukkah 51b has a parallel with different wording | "מִי שֶׁלֹּא רָאָה בִּנְיַן הוֹרְדוֹס, לֹא רָאָה בִּנְיָן נָאֶה [מִיָּמָיו]" — **בבא בתרא ד, א** (parallel: סוכה נא, ב). The same card's "כ-144 דונם" is ◻ unverified: drop it or source it |

Smaller notes:
- `yesod`'s "because it was not in Binyamin's portion" is from Zevachim 53b, not the Mishnah. ◻ Verify before use;
  the Mishnah fact is S20.
- `nikanor`'s "their bronze gleamed like gold" is the **"יש אומרים"** view in 2:3. The Tanna Kamma says "because a
  miracle was done with them".
- `sorag`'s "who may not enter" comes from Kelim 1:8 (S12) and the Greek inscription (A2), not Middot 2:3.

---

## 14. Open decisions for Yaron (⚑)
1. The player identity (a young kohen of a beit av), and whether to name the mentor.
2. The tone of the Herod prologue (S4): include it, soften it, or skip it.
3. Shabbat mode (§10): rest with timers paused, versus ambience only.
4. The mishmar-themed weekly goals: the historical rotation is uncertain.
5. Gate perks (small gameplay bonuses named after the gates): acceptable as labeled interpretation?
6. Future monetization policy (recommended: cosmetic or supporter only, never progress).
7. The techelet or parochet route (needs source verification) or dropping it.

Raised during Sprint 1:

8. Pacing: the target is 10–14 days for Phase A, and the simulator gives 11.5 for a regular player. All amounts, times and costs are first guesses, to be tuned in playtests.
9. The gold donors, King Munbaz and Queen Helena (Yoma 3:10), shown as gold events during the build: acceptable?
10. UI voice: the interface addresses the player in the masculine imperative ("הקש", "גרור"). Keep it, or move to gender-neutral phrasing?
11. The demo toggle: keep it in the menu in store builds, or only through the #demo link?
12. World choices pending approval (PROJECT.md §11): four façade columns after the Bar Kokhba tetradrachm (schematic); marble walls without full gold plating (Bava Batra 4a, although Josephus describes gold); wall heights, porticoes and the Royal Stoa from Josephus.
13. A content partnership with Machon "לשכנו תדרשו".
14. Content checks: the 16 needs_check items in content/REVIEW.md, and two dagesh readings in the Middot text to confirm against Sefaria (2:5 "בָּרִאשׁוֹנָה", 2:6 "בֶן חָנָן").

---

## References
**Design practice**
- GameAnalytics, *2025 Mobile Gaming Benchmarks* (2024 data): https://www.gameanalytics.com/reports/2025-mobile-gaming-benchmarks
- GameAnalytics, *10 tips for a great FTUE in F2P games*: https://www.gameanalytics.com/blog/tips-for-a-great-first-time-user-experience-ftue-in-f2p-games
- M. Jonasson & P. Purho, *Juice it or lose it*, GDC Europe 2012: https://www.gdcvault.com/play/1016487/juice-it-or-lose
- R. Ryan, C. S. Rigby & A. Przybylski (2006), *The Motivational Pull of Video Games: A Self-Determination Theory Approach*, Motivation & Emotion 30: https://link.springer.com/article/10.1007/s11031-006-9051-8
- J. Zagal, S. Björk & C. Lewis (2013), *Dark Patterns in the Design of Games*, FDG: https://my.eng.utah.edu/~zagal/Papers/Zagal_et_al_DarkPatterns.pdf
- A. Pecorella (2015), *Idle Games: The Mechanics and Monetization of Self-Playing Games*, GDC: https://www.gdcvault.com/play/1022065/Idle-Games-The-Mechanics-and
- Clash of Clans Wiki, *Builder* (one builder per building at a time): https://clashofclans.fandom.com/wiki/Builder
- L. Xiao (2023), *Breaking Ban: Belgium's Ineffective Gambling Law Regulation of Video Game Loot Boxes*, Collabra: https://online.ucpress.edu/collabra/article/9/1/57641/195100/Breaking-Ban-Belgium-s-Ineffective-Gambling-Law

**Sources**
- Sefaria API (Torat Emet 357; William Davidson Talmud):
  - Mishnah Middot 1:4–6, 2:1, 2:3, 2:5–6, 3:1, 3:3–8, 4:1, 4:5–7, 5:1, 5:3–4
  - Mishnah Kelim 1:8–9; Mishnah Yoma 3:10, 5:2
  - Bavli Yoma 38a, Ta'anit 23a, Sukkah 51b, Bava Batra 4a
  - Ezra 3:7
  - The structure of Middot: https://www.sefaria.org/api/shape/Mishnah_Middot
- Josephus (Whiston):
  - *Antiquities* 15.11: https://ccel.org/ccel/josephus/complete/complete.ii.xvi.xi.html
  - *War* 5.5: https://www.ccel.org/ccel/josephus/complete.iii.vi.v.html
- Archaeology:
  - https://en.wikipedia.org/wiki/Trumpeting_Place_inscription
  - https://en.wikipedia.org/wiki/Temple_Warning_inscription
  - https://en.wikipedia.org/wiki/Western_Stone
  - https://www.biblicalarchaeology.org/daily/news/a-jerusalem-quarry-from-the-second-temple-period/
