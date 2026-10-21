# Content — wave 6 notes (2026-09-27)

Agent: CONTENT (sources and texts). Branch `s6-content` (from master c4e8113). Everything here is **draft** until Yaron approves
it in `content/REVIEW.md` (wave-6 ⚑ 60–88 at the top). The shared reference for all agents is `docs/SOURCES-S6.md` (7 sections).

## 1. Method and what was fetched

- **Hebrew sources:** every quote is fetched **twice**, from Sefaria's v1 API (`/api/texts/<Ref>`) and v3 API
  (`/api/v3/texts/<Ref>`), through WebFetch (the shell cannot reach sefaria.org), saved in the scratch corpus, and checked in code
  letter and point for point against both passes (`check.mjs`; wave-6 copy `check6.mjs`). A Divine Name in a fetched text is saved
  as ה׳ / with ק. The fetch tool refuses long verbatim quotes when asked to "quote"; asking it to "output the raw JSON field"
  returns whole segments.
- **New this wave (two passes each):** Bavli Zevachim 19b (the washing: posture, standing, "four kohanim"), Mishnah Pesachim 5:8,
  Ezra 8:25–27, Bavli Bava Batra 11a (Monbaz), Exodus 28:17–20 and 28:33–34, Bavli Yoma 37b (Helena's chandelier). From the
  first two starts of the wave (kept): Bava Batra 3b and 4a, Yoma 31a, Mishnah Yoma 5:6, Me'ilah 3:3, Sukkah 48b and 49a,
  Pesachim 26a, Sanhedrin 88b, Yevamot 6a, Shabbat 21b, Numbers 10:2–3, Parah 3:6. Re-used from earlier waves: Middot (whole
  tractate), Tamid, Yoma 3:10, Bavli Yoma 37a (+ Rashi), 38a (Nikanor), Taanit 23a, Menachot 28b, Mishnah Menachot 11:4,
  Arakhin 2:3, Yoma 4:4, Zevachim 5, Sukkah 4–5, Bikkurim 3:2–4, Shekalim 1:3, Keritot 1:7, Berakhot 9:5, Leviticus 24,
  Exodus 25 and 30:18–21, Ezra 3:1–7.
- **Josephus (Whiston), paraphrased "בתרגום חופשי":** phrase checks on two sites each (sacred-texts.com + penelope.uchicago.edu,
  or lexundria.com + biblestudytools.com): Ant. 15.11.2–7 (§389–425: the preparations, 1,000 wagons, 10,000 workmen, 1,000
  priests' garments and training, 8 years, a year and six months, 300 oxen, rain only at night, the white stones), Ant. 16.2.1
  (§14, Agrippa), 16.4.5 (§128, Cyprus copper — half the *revenue* + the care of the other half; the 300 talents are Herod's gift),
  Ant. 14.7.1–2 (§105–110, the treasury and "all the Jews throughout the habitable earth… sent their contributions"),
  Ant. 20.2.5 (§49–53, Helena's grain and figs), War 1.8.9 (§181, Cypros), War 5.4.1–4 (§136–177, the hills, the three walls,
  the towers, the palace), War 5.5.6 (§222–225, "like a mountain covered with snow", the altar without iron), War 5.5.8 (Antonia).
- **Other classical texts (one pass, LacusCurtius):** Strabo 16.4.21–24 (Petra, the aromatics caravans), Diodorus 3.12.1–2
  (the Egyptian gold mines, after Agatharchides), Vitruvius 10.2.2–9 (pulleys, the treadwheel drum, iron shears).
- **Archaeology (paraphrased, publication on every card):** IAA announcement of the Ramat Shlomo quarry (JTA 23.9.2007) and
  Rosenfeld, Ilani et al. (Geological Survey of Israel, GSA abstract 2014); the 2013 Ramat Shlomo quarry (IAA, Irina Zilberbod;
  BAS 8.5.2013); the Trumpeting-Place inscription (B. Mazar 1968, Israel Museum); the soreg warning inscriptions (Clermont-Ganneau
  1871, Istanbul; Iliffe 1936, Israel Museum); the stepped street (Szanton, Hagbi, Uziel, Ariel, *Tel Aviv* 46:2, 2019; via
  ScienceDaily's release); the Siloam Pool (Reich & Shukron 2004–2005); the Western Stone (Bahat 2013; Jol GPR 2006); the Nikanor
  ossuary (British Museum); Bethesda; Herodian drafted margins and dry courses. Several of these came through secondary summaries
  (Wikipedia pages that cite the excavators) — marked "secondary" in SOURCES.md §3.10 and §6.
- **Tools** (scratchpad/w6): `grab.mjs` (excerpt a corpus source), `vmd.mjs` (verify every «…» in a markdown file), `vq.mjs`
  (verify a list of quotes in nikud and letters-only modes), `heb.mjs` (every new Hebrew string on a branch since c4e8113),
  `gen/*.py` (the content files) and `gen/lint.py` (word limits, required fields, unique ids, draft status, no Name).
- **Counts:** SOURCES.md — 106 quote segments, 0 problems. `check6.mjs content/*.json` — **688 segments, 0 problems** (611 at the
  end of wave 4; +77 in the seven new files). `lint.py` — 0 problems. `test/qa-content-scan.cjs` — 11/11.

## 2. Delivered

- `docs/SOURCES-S6.md` — 1 the kiyor and the washing · 2 the shitin and the altar's drainage · 3 Herodian building (+ an archaeology
  table with stable keys) · 4 the kings' deals and the gold question · 5 the match-3 vessels · 6 Jerusalem · 7 the plaza's life.
- Seven content files (schema in bus/CONTENT.md): `water.json` (16), `build_process.json` (31), `city.json` (19), `plaza.json` (17),
  `finds.json` (8), `kings.json` (18), `vessels.json` (13). Minified without `note`: ≈ 75 KB if all were imported (they reach the
  bundle only when imported). Request to the supervisor: add the dev-only `*_en` keys to build.mjs STRIP (−8 KB).
- `content/REVIEW.md` — wave-6 ⚑ 60–92 at the top, each with a default (89–92 from the fourth session's pass).
- `test/qa-content-scan.cjs` — the bundle limit follows PROJECT.md/build.mjs: 3 MB (it still said 2 MB and would fail after the merge).

## 3. Findings worth knowing (sourced answers to the agents' questions)

- **The washing (WATER, PEOPLE):** Zevachim 19b — right hand on the right foot, left on the left, standing («ושירות מעומד הוא»);
  R. Yose b. R. Yehuda's hands-on-hands posture was answered «אי אפשר לעשות כן». Yoma 37a: twelve spigots so the twelve kohanim of
  the Tamid wash at once; "morning from the upper, evening from the lower". The mukhni: a wheel (Abaye) that sank the kiyor into a
  pit (Rashi). A kiyor must hold enough for four kohanim.
- **The drainage (WATER):** daily remainders on the **south** yesod (Tamid 4:1; Zevachim 5:3), Yom Kippur's inner ones on the **west**
  (Zevachim 5:1; Yoma 5:6); both reach the two holes at the SW corner (Middot 3:2); the libations run from the silver bowls into the
  shitin (Sukkah 4:9; Me'ilah 3:3); the marble slab with a ring (Middot 3:3). The amah's route and outlet are not in the sources.
- **Building (BUILD, FUN, SITE):** Yevamot 6a confirms that building the Temple does not override Shabbat; rain fell only at night
  (Taanit 23a and Josephus, independently); Bava ben Buta's three-year plan (Bava Batra 4a); the altar's whole stones never touched
  by iron (Middot 3:4); cedar beams in Herod's House (Middot 3:8) — so the cedar trade has a real need.
- **The kings (KINGS):** Tyre is paid in food, drink and oil (Ezra 3:7); Augustus gave half the *revenue* of Cyprus' copper; Monbaz's
  «אבותי גנזו למטה, ואני גנזתי למעלה» (Bava Batra 11a) and Nikanor's «הטילוני עמה» (Yoma 38a) are real quotes; Helena's famine
  voyage (Ant. 20.49–53); Strabo's Petra sold aromatics, not gold; a Persian king gave gold (Ezra 8:25–26).
- **The gold question (MATCH3):** Temple gold came from donations (Middot 3:8; Ant. 14.110) and royal gifts (Ezra 8; Yoma 3:10); no
  source tells of gold mines in the Land or of mined gold bought for the Temple; the mines of the age were in Egypt's Eastern Desert
  (Diodorus 3.12). Default label «מכרה הזהב — המחשה» (⚑73).
- **The plaza (PEOPLE):** Berakhot 9:5 — no shoes, no staff, no money-belt on the Temple Mount, and no shortcut.

## 4. Verification of the other branches (third session 11:30; fourth session 20:57, rolling, 22:15, 23:00 — bus/CONTENT.md)

Posted as file:line → fix: BUILD content.js:167 «כלה עורב» (not «כלוב»), :205 «אבנים שלמות», cedar doors/ceilings unsourced, BUILD-he.md:34;
KINGS data.js:57 (conversion and "beyond the Tigris" not in the cited section; grain, not wheat); MATCH3 levels.js:30 (the gold
label claims too much), ui.js:104–105; FUN loop.js:71 and dress.js:22 (sunk margins), loop.js:79; WORLD city.js:626 (no ״״ on a free
translation), info.js:189 (the Xystus' place).

**Fourth session (20:50–23:30 UTC).** Method: a read-only scanner (`git diff -U0 <base> HEAD` of every branch) pulls every new
Hebrew line, checks every «…», ״…״ and `q:` quote against the two-pass corpus (Sefaria v1 + v3, Josephus on two sites), runs the
Name patterns of qa-content-scan on every added line, and lists blood/smash words; then every new player-facing line is read.
- **P0 — a Divine Name in two tests:** WORLD test/city.test.mjs:51 and BUILD test/game-state.test.mjs:55 spell the Tetragrammaton
  (BUILD also the Elohim stem) inside a regex; qa-content-scan fails on the merged tree (confirmed on a throwaway merge, 11/12).
  Fix: build the pattern from char codes — ready as one idempotent command each (bus/CONTENT-fixes-*.cjs). **Closed at 22:10**
  (WORLD fe8b9cd, BUILD 6995955); the repo check run over all nine committed trees finds no Name (22:12).
- **BUILD content.js:** the Ulam had no doors (War 5.5.4 §208) → `כלונסות הארז` (Middot 3:8); the soreg was stone (War 5.5.2 §193)
  → stone + Middot 2:3; finish steps without a source show nothing → show `המחשה`; `באבנים שלמות`; BUILD-he.md "בבדיקת סוכן התוכן".
  All applied (6995955).
- **FUN:** sunk margins, the Nikanor ossuary's reading and its kid-safe name (applied, 3288d05).
- **Verified and closed:** KINGS data.js:57 (Ant. 20.2.3 §35, 20.4.1 §75, 20.2.5 §51); WORLD's third_wall, xystus, kidron,
  siloam cards; MATCH3's album (Menachot 28b, 11:4; Middot 3:1–4 + Bartenura; Shabbat 21b; Exodus 28; Tamid 7:3; Arachin 2:3);
  FUN's quarry and great-stone facts; WATER's drainage (a thin dark trickle, no splash, no pools); PEOPLE's crowd (barefoot, no
  staff, doves outside the gates).

## 5. What stays uncertain

- **One pass only:** Strabo, Diodorus, Vitruvius (LacusCurtius). (Phasael's total height, War §166, is two passes since 21:00.) All are paraphrases; none is
  shown as a quote. (War 4.582 — the trumpeting priest — and War 5.137–146 — "Acra", the Cheesemongers' valley "as far as Siloam",
  the second wall from Gennath to Antonia — were raised to two passes at 11:35: lexundria + biblestudytools.)
- **Raised to two passes in the fourth session (penelope.uchicago + sacred-texts, Whiston):** Ant. 20.2.3 §35 (Helena's
  conversion), 20.4.1 §75 (Monobazus and his kindred), 20.2.5 §51; War 5.4.2–3 §144, §147–152, §159–160 (the Xystus, the third
  wall, Bezetha, Psephinus); War 5.5.2 §193–194 (the soreg: stone), 5.5.4 §208, §211 (the Ulam's gate had no doors; the golden doors).
- **Nikanor's port (⚑80):** Tosefta Yoma 2:4 (Vilna, Sefaria v1 + v3, fourth session) has **Jaffa** — «עד שהגיע לנמל של יפו»;
  the Bavli (Yoma 38a) has Akko. The game keeps Akko by default.
- **Archaeology through secondary summaries:** the Western Stone's size and weight, Herodian margins (≈ 8 cm, ≈ 2 cm deep) and
  course set-backs (3–5 cm), Bethesda's dates (8th c. BCE dam; a second pool ≈ 200 BCE), the Nikanor ossuary's reading, the Revolt
  shekel's designs. Numbers are rounded on the cards ("כשמונה", "מאות טונות").
- **The Ramat Shlomo dates:** the IAA announcement is September 2007; the GSA abstract speaks of a quarry "unearthed during the
  summer of 2009" in Ramat Shlomo, and a third excavation there was announced in 2013. The cards say "announced by the IAA in 2007"
  and take the 8-m block size from the GSA abstract — the owner may want one publication checked before approval.
- **Illustration by design (⚑):** the amah's route and outlet, the mukhni pit's depth, two heights of spigots, the slab ring's metal,
  the doves' stalls, the Xystus/Antonia/Bethesda looks, the treadwheel on the Temple Mount, the kings' dramatized lines.
- **Mason's marks:** not verified; none are shown.
