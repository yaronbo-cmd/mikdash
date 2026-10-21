# BRAIN14-JOINT: the joint pick

*FUN14, for the five, 1.10 06:05 UTC.*

**The votes first.** Only אבא has voted (VOTES14): 👍 on the machines, the vine, the instruments, the tools and the mark, so the shop carries all five. With no job votes yet, convergence decides: A6, B3 and B1 are in all five top-6 lists, the column has four agents and the aqueduct three, and three agents cut B7 and B11.

## (a) Part 1, in build order (five agents, about 2 h each)

1. **GAMES14 · frame.js (3 KB):**
   - the drag channel (`M.drag`, hold buttons, a swipe cue);
   - the first touch is a move;
   - stars: done ★, q .7 ★★, q .9 ★★★.
2. **FUN14 · the course jobs (10 KB):**
   - J = clamp(round(10/C), 1, 3), at most the deck's size;
   - the deal **"מה נעשה עכשיו?"**: two cards and one ↻;
   - a job sets ⌈stones left / jobs left⌉ with S.quickSet;
   - the key stones and the strike as cards;
   - the walk to the spot, the pips, G.jobs, test/course-jobs.mjs.
3. **ECON14 · PAY, the purse, the coins' flight (4 KB):** stars × (level + 2); course end +5; moment ×2.
4. **SITE14 · the floating fix (3 KB):**
   - test/hero-ground.cjs;
   - the lag filter, the stairs, reveal-height surfaces, footings;
   - ≤ 0.2 amah in all 15 stages.
5. **GAMES14 · cover.js (12 KB):** SITE14 stages the rub, the cloth and the reveals.
   - **שפשף עד שיבריק**: the gold, at gates, ulam, heichal, kodesh;
   - **סיד על המזבח**: by cloth, at the four altar stages;
   - **נחושת מצהיבה**: at nikanor and kiyor (מדות ב, ג).
6. **ECON14 + FUN14 · סתת בקצב (5 KB):** the strike as a card, 10 strikes in ~20 s.
   - ECON's bar, taught slowly once: early, late, perfect.
   - At the altar it is **מקבת העץ**, tamping whole stones.
   - A free tap still helps the crews, unpaid.
7. **FUN14 · השלם את הנדבך (F1, 10 KB):** place.js to GAMES14's spec, and the most-dealt job.
   - L1: 3 stones;
   - L2: 4 stones and a decoy;
   - L3: 5 stones and 2 decoys.
8. **GAMES14 · ניסור קורות ארז, solo (9 KB):** the crew's sawyer partners her; SITE14 adds sawB, and the planks feed the reveal.
9. **ECON14 · אוצר המלאכה (≤ 20 KB):** the machines, האבן שלי, the instruments, the vine's gifts; oxen and lamps last.
10. **FUN14 or GAMES14, whoever frees first · גלי הים (6 KB):** the House's stone card for its 34 courses (סוכה נא ע״ב ✓), a swipe in and out. SITE14 adds the per-course offset (≈ 1 KB, after the fix), as SITE14 and HISTORY14 asked.
11. **Stretch · מקימים עמוד (pull.js, 8 KB):** a Stoa column per job at har (War 5.5.2 ✓). SITE14 builds the tilt.
12. **Stretch · ממלאים את הסוללה (FUN14, 8 KB):** a flick, at har, the wall and the Chel (the 2011 coins ✓).

**PRODUCER14:** the v26 baseline (escapes, the longest one-gesture run, the first course end), then each merge by touch: her picks, the K80 gate.

**Size:** ≈ 98 KB of the ≈ 164 KB left (v26: 3,085,797 bytes; cap 3.25 MB); each job ≤ 15 KB.

**Contracts:** a job = a frame game + `{trade, family, sites, src}`; `playJob` (FUN14) runs it, `S.payJob` (ECON14) pays it, and SITE14's `stages.jobReveal(id, kind, q)` leaves it in the building.

**The deal:**
- one **stone** and one **craft** card (Ant. 15.11.2; the cards say "סתתים" and "נגרים"); without a craft, two gesture families;
- never the last job;
- "חדש!" first;
- the signature by the second deal;
- at most one key stone a course; one she skips is set by the crane at 0.8;
- the plumb and the level close the course: they are not cards.

## (b) The deck per stage

Each line: courses·J: stone cards / craft cards → the moment. ★ = the signature, which the moment finishes. [brackets] = wave 15.

- **har** 6·2: ★crane (great), F1, strike, quarry [column, fill] / [aqueduct, tiles] → greatStone
- **wall** 8·1: ★F1, strike, crane, dress [fill] / saw → wall
- **gates** 6·2: F1, strike, crane (lintel), dress / ★gold, saw [rosette] → gates
- **nashim** 6·2: F1, strike, crane, dress / ★saw [worms: firewood only] → nashim
- **sorag** 3·3: F1, strike, crane [fill: the Chel] / [breaches] → breaches
- **nikanor** 6·2: F1, strike, crane (lintel), dress / ★bronze [bellows → pour, the 15 steps] → nikanor
- **lishka** 6·2: F1, strike, crane, ★dress / saw [aqueduct] → lishka
- **yesod** 2·3: ★whole, mallet / plaster → yesod
- **sovev** 2·3: whole, mallet / ★plaster → redLine
- **guf** 4·3: whole, mallet [kevesh] / ★plaster → guf
- **karnot** 1·3: whole, mallet [horns] / ★plaster → karnot
- **kiyor** 1·2: crane / ★bronze [pour, mukhni] → kiyor
- **ulam** 10·1: waves, strike, crane (lintel) / ★saw, gold [vine, chains, כלונסות] → ulam
- **heichal** 14·1: waves, strike, crane / saw, ★gold [ravens] → heichal
- **kodesh** 10·1: waves, strike, ★crane / saw, gold → boxes

## (c) Left for wave 15

1. **First:** the column and the fill (if missed), F3 שביל לכהן (after the probe), the aqueduct, כלונסות הארז, B9 as a job, the saw's duel, B2 → A5, B20, A4, the horns, the ravens, the chains, the rosette, Robinson's Arch, חן חן לה as a hold, E1, E3, and B6 to open a stage.
2. **The moments** become level 4 of their signatures.
3. **Phase B:** the doors heard to Jericho; B10, which women weave.
4. **Cut:** B7, B11, B12, A1's quiz, A7 as a job, B4.

**Pacing:** a job 20–30 s; a course 40–80 s; a stage 7–12 min; one gesture ≤ 25 s; a new job every ≤ 90 s; escapes below v26's.
