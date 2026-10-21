# Facts — wave 8B notes (2026-09-28)

Agent: FACTS8B (sources and facts). Branch `s8-facts` (from master 326cb49, v16). Everything here is a **draft** until Yaron
approves it in `content/REVIEW.md` (the wave-8B ⚑ section at the top, 93–101). The owner's note that started it (28.9):
«פרט מידע אמיתי — כל פעם חוזר על אותו דבר … רשימת פרטי מידע אמיתיים, עדיף שקשורים לכל שלב/נושא … רנדומלי וללא חזרות».

## 1. What was built

- **`content/facts.json`** — 204 true facts for FLOW8B's rotation (`src/game/facts.js` on s8-flow: `nextFact(key)`), shown on the
  loading screen, in the precision games' fact line (GAMES8B, through `ctx.nextFact`) and in the idle tips.
  - **By stage (Phase A, PROJECT.md §6):** har 15 · wall 12 · sorag 12 · gates 12 · nashim 12 · nikanor 12 · lishka 12 · yesod 12 · sovev 12 · guf 12 · karnot 13 · kiyor 12 · ulam 13 · heichal 14 · kodesh 12 (every stage ≥ 12; the brief asked ≥ 8).
  - **By topic:** jerusalem 28 · herod 20 · kohanim 38 · stone 19 · water 19 · trade 17.
  - **Kinds:** Mishnah (most; Middot above all), Bavli, Tanakh, Josephus (paraphrase), archaeology (with its institution and
    publication), Vitruvius (one line, named as Roman practice).
- **The schema** (posted on the bus at 10:10 UTC; FLOW8B reads it as is):
  `{version, stages[15], topics{id: Hebrew label}, stage_topics{stage: [topic, …]}, facts[{id, stages, topics, he, ref, status,
  illus, quote?, note?}]}`. `{he, ref, status, illus}` is exactly the mini-games' old `fact` object, so a fact drops into
  `frame.js` unchanged. `note` is stripped by build.mjs; `quote` is dev-only (FLOW8B strips it from facts.json in the build).
  **Ids are stable** — the seen-set in the save keys on them. Add new ids; never rename or reuse one.
- **Rules each line keeps:** Hebrew, ≤ 35 words (the longest is 26); one ref in `ref`; ״…״ only around a verbatim Sefaria
  segment, which is also in `quote`; Josephus and archaeology never inside ״״ («יוספוס מספר», «(בתרגום חופשי)»); no Divine
  Name; no blood or violence on the card (see ⚑98); a line where the Mishnah and Josephus differ gives the Mishnah (⚑95).
- **`docs/FACTS-S8.md`** (this file) and **content/REVIEW.md** — the wave-8B ⚑ section (93–101), each with a default.

## 2. Method

- **Reuse first.** About 60 % of the lines restate facts already verified in wave 6 (docs/SOURCES-S6.md; content/water.json,
  build_process.json, city.json, plaza.json, finds.json, kings.json, vessels.json) or in the mini-games' own fact lines.
  The note of each such fact names where it came from.
- **Hebrew sources:** checked in code against the two-pass Sefaria corpus of earlier waves (v1 + v3 API; Mishnah = Torat Emet
  357, Bavli = William Davidson, Tanakh = Miqra al pi ha-Masorah) with the wave-6 checker (`check6.mjs`, letters-only mode for
  the `quote` field): **84 segments, 0 problems** (2026-09-28, final run). New this wave (Sefaria v1 + v3, identical in both
  passes, added to the corpus): **Exodus 20:23** (no steps to the altar), **Mishnah Pesachim 5:10** (the Pesach groups sit on
  the Temple Mount, in the Chel, in the azara), and for ⚑101 **II Chronicles 2:15** (the rafts to Jaffa are Solomon's).
- **Josephus (Whiston), two sites each, 2026-09-28:** War 1.401 (Herod doubled the enclosure — lexundria + biblestudytools),
  War 5.196 (the inner court's wall 40 cubits outside, 25 inside), 5.201 (the gate of Corinthian bronze), 5.219 (nothing at all
  in the inmost room), 5.225 (the altar: a square, horn-like corners, a gentle slope, no iron tool), 6.293 (the bronze eastern
  gate of the inner court, shut with difficulty by twenty men) — sacred-texts + penelope.uchicago; and for ⚑95 War 5.225's
  altar of 50 × 50 cubits, 15 high (both sites). Everything else from Josephus
  was verified in wave 6 (SOURCES-S6 §3–4, §6) or by CONTENT8 (War 5.208, 5.210, 5.222 — the gilding table on bus/CONTENT8.md).
- **Generator and lint:** `gen_facts.py` (scratchpad) builds the file from three batches and refuses a line over 35 words, a bad
  tag, a duplicate id, a ״…״ that is not in `quote`, a Josephus line with ״״, a Name. `test/qa-content-scan.cjs`: 12/12.

## 3. What to know when showing them

- **A beat's own fact:** DESIGN8B's shot list names ids for the Mount (M2 `f_har_500`, M5 `f_har_prepare`, M8 `f_har_great` +
  `f_stone_crane`, M9 `f_herod_workers`, M10 `f_wall_margins` + `f_wall_setback`, M11 `f_stone_quarry` + `f_stone_tools`, M13
  `f_herod_marble`, the first night `f_har_rain`). Good for the Mount's reveal: `f_har_double`.
- **Mini-game keys:** crane / great / dress / quarry → `stone`; plumb → `herod`; whole → `yesod` (FLOW8B's `nextFact(key)`).
- **Always with its ref and the «טיוטה» tag** until the owner approves (PROJECT.md §2.2).

## 4. What stays uncertain (all marked in the notes, and in ⚑99)

- **Secondary summaries:** the Herodian margins' width (~8 cm — only in an uncited summary, so `f_wall_margins` gives no number); the
  course set-back is now the Israel MFA's «about 2–3 cm» (IAA excavation, Ben-Dov and Bahat) — the summary's 3–5 cm is not used (`f_wall_setback`); the
  Western Stone's weight (`f_har_great`: «מאות טונות»; its size now from the Western Wall Heritage Foundation, thekotel.org); the Nikanor ossuary's reading (`f_nik_ossuary`).
- **One pass only:** Vitruvius 10.2 (`f_stone_crane`, LacusCurtius) — the line names Vitruvius and Roman practice only.
- **Readings chosen:** the night officer's «שלום עליך» (Middot 1:2) follows the plain reading, as SOURCES-S6 §7; the ark's hiding
  place «כנגד דיר העצים» (Shekalim 6:1) without placing the wood store on the map; «בית החליפות» names the Ulam's shoulders
  (Middot 4:7).
- **Left out on purpose (⚑98):** Herod's killing of the sages; the fall on the ramp (Yoma 2:2); the kohen's death in Shekalim 6:2;
  the death clause of the soreg inscription; blood (the drains say «מה שנשפך על היסוד»).

## 5. The string pass (other branches)

Posted on bus/FACTS8B.md as file:line → fix (round 1 at 10:22 UTC; round 2 from 11:15). The one P0 so far: s8-flow
test/game-facts.test.mjs:59 wrote a Divine Name in full inside a regex (qa-content-scan fails on the merge) — a tested,
idempotent fix is in bus/FACTS8B-fix-flow.cjs.
