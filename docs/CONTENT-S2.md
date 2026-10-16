# Content — Sprint 2 notes (2026-09-25)

Agent: content & halacha. Branch `s2-content`. Everything here is **draft** until Yaron approves it in `content/REVIEW.md`.

## 1. Files

| file | shape | items | what the game gets |
|---|---|---|---|
| `content/heichal.json` | array | 26 | the house inside: dimensions, gold, doors, wickets, Beit HaChalifot (knives), Ulam beams/chains/vine/nivreshet/tables, amah traksin + 2 parochot, the parochet (40×20 amot, 1 tefach; Torah colors), Kodesh HaKodashim + Even HaShtiya (no Ark), entry rules (Kelim 1:9), upper openings, Menorah (Torah; 18 tefachim with the stem layout; the Hasmonean menorah: iron → silver → gold; branch shape ⚑; lamps, oil ½ log, western lamp ⚑; the 3-step stone), vessel places, Shulchan + bread layout, golden altar (+ its morning service) |
| `content/ketoret.json` | array (`order`) | 17 | Torah's spices, the 11 spices with weights (`spices[]`, total 368), additions, 368 manah, grinding chant, chelbenah lesson, Beit Avtinas (+ `views`), maaleh ashan, Beit Avtinas' place, the lottery for new ones (`only_new`, `once_in_a_lifetime`), vessels, the service (`steps[]` linked to `tamid.json` ids), timing, smell to Jericho, Yom Kippur ketoret, the Rambam's recipe (`steps[]`, for a mixing mini-game) and identifications |
| `content/animals.json` | sections | 33 | `kinds` (lamb/palgas/ram ages, bulls, birds), `tamid_lambs` (2 a day, ≥6 checked, the chamber, gold cup + torchlight), `blemishes` (1 Torah item + 18 Bechorot items; `core: true` = the curated 12 + 1 trick; `body_part`; `not_blemish_he` / `is_blemish:false` for trick cases), `birds` (upper/lower, places, dove prices), `markets`, `dignity` (display rules) |
| `content/kiyor.json` | array | 7 | Torah, place, kiddush pose, when (gate before vessels and Heichal), 12 spigots, the mukhni, the Golah well |
| `content/yom_kippur.json` | array | 10 | watch-only scenes (`watch_only`), incl. the route between the parochot (`route[]`) and the count "אחת, אחת ואחת..." (`count_he[]`) |
| `content/festivals.json` | sections | 10 | `shabbat` (bread switch), `sukkot` (70 bulls, aravot, hakafot, water libation, "הגבה ידך", Simchat Beit HaShoevah ×4) |
| `content/mysteries.json` | array | 7 | where is the Ark, the odd stone, three views, Even HaShtiya, the 40-year signs, ten miracles, the western lamp |
| `content/garments.json` | array | 8 | 4 and 8 garments (`garments.kohen`, `garments.gadol_adds`), Torah, tzitz (inscription only as "קודש לה׳"), white vs gold (Lev 16:4), barefoot, not sleeping in them, Pinchas HaMalbish, the labelled garment windows (Tamid 5:3) |
| `content/tamid.json` | edited in place, ids unchanged | +6 fields | `payis_2.roles[]` (13 roles, ids), `limbs_row.carriers_hands[]` (right/left limb ids), `maarachah_gedolah.wood`, `dawn_check.calls`, `heichal_gate.jericho_sounds` (9 sounds linked to step ids), `night_watch.keys` (the marble slab with the keys, Middot 1:9); `hatavat_2.note` updated |
| `content/memunim.json` | edited in place | +1 field | `gvini.call` — "עמדו כהנים לעבודתכם ולוים לדוכנכם וישראל למעמדכם" (Yoma 20b) |

Every item: `id, name_he, summary_he, quote, quote_nikud, source, status: "draft", needs_check, note` (+ game fields). Extra opinions or sources are in `views[]`, each with its own `quote/quote_nikud/source`. Bavli, Rashi on the Talmud and the Rambam's commentary have `quote_nikud: null` (no verified vocalized text).

## 2. Ids the world and the service can rely on

- **Vessels** (PROJECT.md §12): `heichal.json` items carry `vessel_id` = `menorah`, `shulchan`, `gold-altar`; the mukhni is `kiyor.json: mukhni.vessel_id = "mechanism"`.
- **Lamps**: `heichal.json: menorah_lamps.western_lamp` — draft: the Menorah stands east–west, so "the western lamp" is the **2nd lamp from the east** (Rashi, Shabbat 22b); `set_lamps_index: 0`. If Yaron picks north–south, it becomes the middle lamp — change only this object. Wicks of the six side lamps face the middle lamp (Rashi Numbers 8:2; Menachot 98b).
- **Limbs**: `tamid.json: limbs_row.carriers_hands[]` — `head, right_hind_leg, right_foreleg, left_foreleg, oketz, left_hind_leg, chest, neck, right_flank, left_flank, innards_in_bazach, solet, chavitin, wine`. In the Mishnah "יד" is a foreleg.
- **Lottery roles**: `tamid.json: payis_2.roles[]` — `shochet, zorek, dishun_inner_altar, dishun_menorah, head_and_leg, two_forelegs, oketz_and_leg, chest_and_neck, two_flanks, innards, solet, chavitin, wine` (`carrier` = position in the row of nine).
- **Sounds**: `tamid.json: heichal_gate.jericho_sounds.sounds[]` — `great_gate, magrefa, mukhni, gvini, chalil, tziltzal, shir, shofar, kohen_gadol` (the last: describe only, never play — the Name).
- **Birds**: `animals.json: birds.bird_offering_places` — olah: SE corner, upper (via the sovev); chatat: lower. `birds_up_down.levels`.
- **Blemishes**: `animals.json: blemishes[]` — `body_part` ∈ `ear eye nose mouth tail legs head`; `core` marks the curated set for the inspection mini-game; trick cases: `ear_notch` (skin only), `eye_streak` (black into white), `tail_bone` (cut at the joint), `calf_tail_not_blemish`.

## 3. places.js — findings (do not edit places.js; requests for its owner)

1. **SHULCHAN / MENORAH / GOLD_ALTAR** — the distances come from **Yoma 33b**, not Menachot 98b: "שלחן בצפון משוך מן הכותל שתי אמות ומחצה ומנורה בדרום משוכה מן הכותל שתי אמות ומחצה מזבח ממוצע ועומד באמצע ומשוך כלפי חוץ קימעא". Change `src` to `'יומא לג, ב'`. The east–west position is not given for the Second Temple; Menachot 98b ("תני חדא מחצי בית ולפנים היו מונחין ותני חדא משליש הבית ולפנים היו מונחין") speaks of Solomon's ten tables/menorot. Current x = −125 (7 amot west of the Heichal's midpoint −118) with the gold altar at x = −121 satisfies both and "משוך כלפי חוץ קימעא" — keep, `illus: true`. Orientation (draft): "כל הכלים שהיו במקדש, ארכן לארכו של בית" (Menachot 11:6) → the Shulchan's long axis along x; the Menorah's branches spread along x and it faces north, toward the Shulchan ("בעינן דחזו אהדדי", Yoma 33b) ⚑.
2. **MENORAH_STONE** — "ואבן היתה לפני המנורה ובה שלש מעלות" (Tamid 3:9). With the draft orientation "לפני" is the Menorah's north face → suggest `{ x: -125, z: 6.2 }` (north of the Menorah) instead of `x: -122.8` (east of it). Still `illus`.
3. **LAMBS_CHAMBER** — Middot 1:6: "מערבית דרומית, היא היתה לשכת טלאי קרבן" (a room of Beit HaMoked, "שתים בקדש"); Tamid 3:3: "והרי לשכת הטלאים היתה במקצוע צפונית מערבית". Read together (our reading): Beit HaMoked stands at the NW corner of the Azara, and inside it the lambs' room is the SW (holy) room. The current box (x −178…−167, z −67.5…−58) fits both. Keep; `illus` for its size.
4. **NORTH_CHAMBERS** — Middot 5:3 (our Mishnah): "שבצפון, לשכת המלח, לשכת הפרוה, לשכת המדיחים" → north side is right. Their west→east order is not stated (the listing order is our illustration). Variant: the Gemara quoting this Mishnah in Yoma 19a has "שבדרום לשכת המלח לשכת הפרוה לשכת המדיחין". Keep north (the Mishnah).
5. **BEIT_AVTINAS** — Tamid 1:1: "בית אבטינס ובית הניצוץ היו עליות"; Yoma 19a (Rav Pappa): "שתי לשכות היו לו לכהן גדול אחת לשכת פרהדרין ואחת לשכת בית אבטינס אחת בצפון ואחת בדרום", and the Kohen Gadol's first immersion "בחול על גבי שער המים ובצד לשכתו היתה" → an upper room in the south, by the Water Gate. The current box over the Water Gate fits; add `'תמיד א, א; יומא יט, א'` to `src`.
6. **DESHEN_PLACE** — Tamid 1:4: "הגיע לרצפה, הפך פניו לצפון, הלך למזרחו של כבש כעשר אמות. צבר את הגחלים על גבי הרצפה רחוק מן הכבש שלשה טפחים". The kevesh foot is z = 42.5 and its east edge x = −30; ten amot north along it and ½ amah (3 tefachim) off → **`{ x: -29.5, z: 32.5 }`** (not z = 18). Same place: "מקום שנותנין מוראות העוף ודישון מזבח הפנימי והמנורה".
   New optional place from the same mishnah: the silver machta waits "במקצוע בין הכבש למזבח, במערבו של כבש" → about `{ x: -47, z: 13.5 }`.
7. **TAMID_RING** — Tamid 4:1: "של שחר היה נשחט על קרן צפונית מערבית, על טבעת שניה. של בין הערבים היה נשחט על קרן מזרחית צפונית, על טבעת שניה". Which way "second" is counted is not stated; the current choice is fine as `illus`. RINGS = 6 rows of 4 follows the Tanna Kamma of Middot 3:5 ("ויש אומרים, ארבעה של שש שש").
8. **Kodesh HaKodashim walls** — Middot 4:1: "שכל הבית טוח בזהב, חוץ מאחר הדלתות" → gold inside the whole house, Kodesh HaKodashim included (draft; needs_check).
9. Confirmed as they are: PAROCHOT (Yoma 5:1: "החיצונה היתה פרופה מן הדרום, והפנימית מן הצפון", an amah apart), EVEN_SHTIYA (3 etzba'ot = 1/8 amah), KIYOR ("בין האולם ולמזבח, ומשוך כלפי הדרום", Middot 3:6), SHITIN for the water libation ("עלה בכבש ופנה לשמאלו, שני ספלים של כסף היו שם", Sukkah 4:9), ULAM_TABLES (which table is north is not stated — `illus`).
10. Possibly useful new places: **Beit HaChalifot** — the Ulam's 15-amah wings north and south, "ששם גונזים את הסכינים" (Middot 4:7); the **wood chamber** already exists (WOOD_CHAMBER) — the Ark mystery and the wood sorting by blemished kohanim (Middot 2:5) both happen there.

## 4. What the Avodah / Sanctuary / Life agents must know

- **No Ark.** On Yom Kippur the machta goes on the Even HaShtiya (Yoma 5:2). Yoma 5:1's "עד שהוא מגיע לארון" describes the First Temple.
- **Gates of holiness** (Kelim 1:9): into the Heichal only after kiddush from the kiyor; the player never enters the Kodesh HaKodashim; people withdraw from between the Ulam and the altar during the ketoret.
- **Kiddush**: right hand on right foot, left on left (Zevachim 19b); before touching any vessel (Tamid 1:4). The mukhni's creak is the signal "הגיע עת" for terumat hadeshen (Tamid 1:4) and one of the Jericho sounds.
- **Ketoret lottery**: only kohanim who never offered it; nobody ever did it twice (Yoma 26a) — a true once-in-a-lifetime event.
- **Menorah**: 3 amot, 22 cups / 11 knobs / 9 flowers at fixed heights (`menorah_measure.stem_from_floor_tefachim`), a 3-step stone in front, the kuz on the 2nd step. Shape of the branches ⚑.
- **Parochet**: 40 amot high × 20 wide, a tefach thick; colors per the Torah (tekhelet, argaman, tola'at shani, linen, cherubim) — Exodus 26:31, for the Mishkan.
- **Knives** are kept in Beit HaChalifot (Middot 4:7).
- **Kohanim barefoot** on the Azara floor (draft, from Zevachim 24a).
- **Lamb care before the service**: given a drink from a gold cup, inspected by torchlight (Tamid 3:4); bound by "akeida", not tied (Tamid 4:1). Dignity rules: `animals.json: dignity.display_rules`.
- **Wood**: never olive or vine; fig, walnut, "etz shemen" customary; wormy wood invalid; fig wood for the ketoret fire (Tamid 2:3, 2:5; Middot 2:5).
- **Ten miracles** (Avot 5:5) are cheap world details: the smoke column stays vertical in wind, rain does not put out the altar fire, no flies at the slaughter place.
- **Sukkot**: 13→7 bulls (70), aravot upright around the altar with tops bent over it, one circuit a day and seven on the 7th, water from the Shiloach through the Water Gate. `calendar_offerings.json` already has every Sukkot day and Shemini Atzeret — no gaps.

## 5. Method and the discrepancies found

Each source was fetched twice (Sefaria API v1 and v3), saved, and every quoted segment was checked in code against both (about 210 segments); `quote` is generated from `quote_nikud` by stripping the points, so the two can never drift. Middot was checked against `src/game/middot.js` (itself two passes, 2026-09-23). Differences between passes, and what was done:

- Kelim 1:9 — "וְרַגְלָיִם" (v1, twice) vs "וְרַגְלַיִם" (v3, twice): kept v1, `needs_check` (heichal.json `entry_rules`).
- Shekalim 6:1 — "שֻׁלְחָנוֹת" vs "שׁוּלְחָנוֹת": third pass → "שֻׁלְחָנוֹת"; the word is not quoted anyway.
- Exodus 28:4 ("אשר"/"אשי"), 28:36 ("חֹתָם"/"חוֹתָם"), 30:20 ("להקטר"/"להקטיר"), Tamid 4:3 ("הָרִאשׁוֹן"/"הָרִישׁוֹן"), Yoma 7:4 ("וְטָבַל"/"וְטָבָל"), Parah 1:1 ("ממתינים"/"ממתינין"), Yerushalmi Yoma 4:5 ("מִסַּמְמָנֶיהָ"/"מִסַּמְּמָנֶיהָ"): the differing words are left out of the quotes.
- Middot 2:5 "בָּרִאשׁוֹנָה" and 2:6 "בֶן חָנָן": two more passes agree with `src/game/middot.js` — no change.
- Sefaria's default Bavli is now "William Davidson Edition – Vocalized Aramaic". It could fill `quote_nikud` later, but it differed between passes (e.g. "וְטִפְחַיִים"/"וְטִפְחַיִם"), so this sprint used the unvocalized edition and `quote_nikud: null`.
- Old `tamid.json` items quoting Yoma 33a (hatavat_5, hatavat_2, limbs_to_altar, mincha_chavitin, musafim) carry nikud for a Bavli text — probably from the vocalized edition; worth checking against the convention.
