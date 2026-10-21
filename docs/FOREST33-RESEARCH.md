# FOREST33 — Deep research: "99 Nights in the Forest" (Grandma's Favourite Games, Roblox, 2025)

Research date: 2026-10-13. Scope: everything a designer needs to copy the *feel* of the game into a Hebrew
educational 3D mobile game about the Second Temple (see §7–8). The basics already known to the project
(identification, popularity, default Roblox mobile controls, 3 min day / 90 s night, campfire as a draining
meter with 6 levels pushing back fog, 4 kids gated by fire level, diamond-bought classes, LIFO sack 5→25,
sprint costs hunger) are not repeated at length.

Method: 60+ web searches/fetches (DevForum, GDC, rblxguide, Sportskeeda, Pocket Tactics, Deltia's Gaming,
Destructoid, PC Gamer, Pocket Gamer, allthings.how, backyarddrunkard, pixeltwelve, 99nightsintheforest.wiki,
Roblox Creator Docs). The Fandom wiki and the Roblox game page were blocked for direct fetch from this
environment; facts attributed to them come via secondary pages that cite them.

Evidence marks: **CONFIRMED** = stated by at least one reasonably reliable source (URL given);
**CONFIRMED×2** = two independent sources agree; **INFERRED** = my reconstruction from partial evidence or from
Roblox engine defaults; **CONFLICT** = sources disagree, both versions given.

Note on source quality: several guide sites (Deltia's, findingdulcinea, backyarddrunkard, rblxguide) publish
partly AI-assisted text — rblxguide says so openly ("AI-assisted and not tested in-game",
https://rblxguide.com/games/99-nights-in-the-forest/update-tracker). I cross-checked numbers wherever possible
and flagged anything that looked invented (e.g. Deltia's "guild events / Frozen Cavern nodes", which do not exist
in the game — https://deltiasgaming.com/?p=317065). The "Don't Steal the 99 Nights" controls page
(https://deltiasgaming.com/?p=399589) describes a *copycat game*, not this one, and was discarded.

---

## 0. Facts about the makers (for §5–6)

| Fact | Status | Source |
|---|---|---|
| Studio: Grandma's Favourite Games, New Zealand. Creative lead "Cracky4" = Alec Kieft (also made Break In, Break In 2). | CONFIRMED | https://schedule.gdconf.com/speaker/kieft-alec/80898 |
| Team of three at the core: Cracky4 (design + art direction), ForyxeV (programming), Viridial (building/modelling). | CONFIRMED | https://devforum.roblox.com/t/creator-spotlight-the-story-behind-99-nights-in-the-forest/4036940 |
| Started as a week-long game jam in March 2025, grew into a ~3-month build, released June 2025 — "their fastest process" vs ~6 months on earlier projects. | CONFIRMED | same DevForum post |
| Design pitch: the "survive N days" trend + inspiration from *Dead Rails* + a cozy forest theme; "99" chosen over "100" because it "had a better ring". The Deer mascot came from a notebook sketch, meant to be scary "without alienating younger players", open-mouth look taken from an old YouTube screenshot. | CONFIRMED | same DevForum post |
| Peak 14 million concurrent users ("double the population of New Zealand"); passed 1 billion visits within months. | CONFIRMED | DevForum post; GDC bio |
| Weekly cadence: every weekend a 45-minute "Update Party" sandbox before the update, where devs talk to players and hand out items (Admin Sack/Axe, diamonds). | CONFIRMED | DevForum post; https://rblxguide.com/games/99-nights-in-the-forest/items/diamonds |
| Developer advice (verbatim fragments): "Keep scope small and iterate quickly", "Who knows what the breakout hit will be?", make the game you would want to play, get feedback early and often, **observe players when they don't know they're being watched**, move on from ideas that aren't working. | CONFIRMED | DevForum post |
| Mobile performance is handled by keeping part/vertex counts low on big structures (Cultist Stronghold). The DevForum spotlight contains **no** direct quotes on retention or UI. | CONFIRMED (absence) | DevForum post |
| GDC 2026 talk by Kieft: "Catching Culture Currents: Riding Resonant Trends in 'Roblox' and Beyond"; bio stresses "player empathy and design precision". | CONFIRMED | GDC page above |
| Film adaptation by 20th Century Studios, written by Josh Cooley. | CONFIRMED | https://www.thewrap.com/creative-content/movies/20th-century-studios-roblox-game-99-nights-in-the-forest/ |
| Roblox rating 9+; up to 5 players per run; no blood/gore. | CONFIRMED | https://www.kinzoo.com/blog/is-99-nights-in-the-forest-safe-for-kids-a-parents-age-by-age-guide ; https://www.sportskeeda.com/roblox-news/99-nights-forest-a-beginner-s-guide |

---

## 1. The first 10 minutes of a new child player

No source gives a frame-by-frame recording; this is a reconstruction from beginner guides, the item/recipe
data, and the game's known UI. Each row says what is confirmed.

| Time | What happens | Teaching device | Status / source |
|---|---|---|---|
| 0:00 | **Lobby.** Player appears in a small lobby with the class shop ("General Store"), a badge board, an update sign board, and (since June 2026) biome / hardcore selectors that are locked until "highest day ≥ 10". Players queue by walking into a portal/pad with friends (teams of up to 5). | Locked options are visible but greyed → aspiration. | CONFIRMED for shop/selectors/lock: https://rblxguide.com/games/99-nights-in-the-forest/updates/99-nights-biome-vs-hardcore-mode-guide-2026 ; https://rblxguide.com/games/99-nights-in-the-forest/updates/99-nights-all-classes-how-to-unlock-2026. Portal detail INFERRED. |
| 0:30 | **Spawn in camp at Day 1, daytime.** In view: the campfire (Level 1, a few logs), the Crafting Bench (with two icons: red wood counter, grey metal counter), the Missing Children board, trees in every direction, and a thick fog wall a short walk out. A countdown to night is already running. | Everything the player needs is within ~10 m; the fog says "not yet" without a message. | CONFIRMED: bench icons https://www.pockettactics.com/99-nights-in-the-forest-crafting ; "countdown to night starts ticking" https://pcgamer.com/games/roblox/99-nights-in-the-forest-tips/ ; fog gate https://www.destructoid.com/99-nights-in-the-forest-walkthrough/ |
| 0:45 | **HUD**: day counter + day/night timer, hunger bar (forks), health, fire fuel bar shown at the campfire itself (e.g. "24/100"), hotbar with starting items: Old Axe, Old Sack (5 slots). Class starters appear here (Camper: Flashlight; Medic: 2 Bandages, etc.). | The hotbar is 1–2 items — nothing to be confused by. | CONFIRMED (fuel bar numbers): https://pixeltwelve.com/guides/99-nights-in-the-forest-campfire-fuel-upgrades ; starters: https://www.sportskeeda.com/roblox-news/all-classes-99-nights-forest-costs-perks-upgrades |
| 1:00 | **First verb: chop.** Walk to any tree, equip the axe, tap/click; Old Axe needs 13 hits; logs (and one sapling) pop out onto the ground. | The tree is the nearest interactive thing; hit-count makes the first success take ~10 s. | CONFIRMED: 13 hits https://www.pockettactics.com/99-nights-in-the-forest-items ; sapling https://findingdulcinea.com/99-nights-in-the-forest-tree-planting |
| 1:30 | **Second verb: carry.** Loose logs are dragged (hold-drag on PC; on mobile "you pick up an item and it moves with you, no key to hold") or stored into the sack ("Store" prompt). | Physical dragging = toddler-level intuition. | CONFIRMED drag: https://pixeltwelve.com/... ; mobile auto-drag: https://deltiasgaming.com/?p=392438 |
| 2:00 | **Third verb: feed the fire.** Drop the log *into* the log pile ("the fuel must reach the fire itself"); fuel bar jumps; at Level 1 "6 logs" fills it. Message at level-up: **"Fire level 2 map expanded"** — the fog visibly recedes. | The game's only progression tutorial is the fuel bar + the fog moving. | CONFIRMED: pixeltwelve; 6 logs https://99nightsintheforest.wiki/wiki/Campfire ; message text https://allthings.how/99-nights-in-the-forest-how-to-rescue-and-befriend-all-four-kids/ |
| 3:00 | **Chests & houses.** Nearest sheds contain Common Chests (Bandage, Good Sack, Good Axe, Old Flashlight, Spear, Revolver, 1 Diamond ~20% chance). The watchtower holds 5 Old Flashlights. | Loot = instant upgrade of a tool already understood. | CONFIRMED: https://rblxguide.com/games/99-nights-in-the-forest/updates/all-chests-loot-tables-ranked ; watchtower https://rblxguide.com/games/99-nights-in-the-forest/updates/beginner-guide-survive-day-1-10 |
| 3:00 (Day 1 ends) | **Night 1 (90 s).** The Deer appears but *only watches from the fire's edge and retreats*; on Night 1 it does not attack. Footsteps + glowing white eyes teach "dark = danger" at zero cost. | The free first night is the single most important onboarding decision. | CONFIRMED: https://itemlevel.net/ultimate-guide-to-roblox-99-nights-in-the-forest/ ("Night 1: deer don't attack"); https://www.sportskeeda.com/roblox-news/how-survive-monster-99-nights-forest |
| 4:30 | **Day 2: the Pelt Trader arrives** next to the children's board — guaranteed on Day 2, asks for a Bunny Foot in a white box; shows 3 wares (Good Axe / Good Sack / Old Flashlight), pick 1. | Introduces "kill bunny → get foot → trade" and the idea of a market. | CONFIRMED: https://www.sportskeeda.com/roblox-news/99-nights-forest-pelt-trader-guide ; https://backyarddrunkard.com/games/99nitf-pelt-trader/ |
| 5:00 | **Hunger** bar has drained visibly; carrots/berries on the ground show "Eat"; raw meat damages, so the campfire doubles as a grill. | Need appears exactly when the solution is in reach. | CONFIRMED values: https://deltiasgaming.com/?p=294763 |
| 6:00 | **Crafting Bench**: drop logs in the "scrap processor to the left" of the bench → Wood; drop bolts/sheet metal → Scrap. Starting blueprints: Map (3 Wood), Farm Plot (10 Wood), Bunny Trap (5 Wood), Old Bed (20 Wood), Bench 2 (5 Wood + 1 Scrap). | The bench shows what you lack in red/grey numbers — no text tutorial. | CONFIRMED: https://www.destructoid.com/99-nights-in-the-forest-walkthrough/ ; recipes https://www.gamezebo.com/walkthroughs/99-nights-in-the-forest-crafting/ |
| 7:00 | **Missing-children board**: clicking a poster activates a **red directional arrow** toward that child (posters appear only as fire levels rise). | The arrow is the only "quest marker" in the game. | CONFIRMED: https://deltiasgaming.com/?p=293857 |
| 8:00–10:00 | Second fire fill (11 logs to L3), first chest-opening sprint, maybe a death to a wolf. PC Gamer's reviewer: "I died to its nasty deer entity several times early on, I realized I needed to strategize" — and "the game doesn't take long to learn once you adjust". | Death is cheap early (teammate revive with Bandage), and it teaches. | CONFIRMED quote: https://pcgamer.com/games/roblox/99-nights-in-the-forest-tips/ |

**What stalls beginners and how the game resolves it (CONFIRMED by guides' "mistakes" sections):**
- Letting the fire die → "hungry" Deer spawns at the camp (https://99nightsintheforest.wiki/wiki/Campfire). Resolution: the fuel bar is physically on the fire, big and red; rain visibly drains it.
- Going out at night without a flashlight → the Deer. Resolution: the watchtower with 5 flashlights is always near spawn (rblxguide beginner guide).
- A 5-slot sack that is always full. Resolution: the Day-2 trader offers a 15-slot sack for one bunny foot.
- Getting lost in fog → Map costs 3 Wood and opens with M; a Compass (3 Scrap) shows the arrow (PC Gamer; Deltia's kids guide).
- No tutorial text exists; onboarding is entirely proximity prompts + visible counters + the fog boundary.
  (INFERRED from the total absence of tutorial mentions in every guide reviewed.)

---

## 2. Complete catalogue of interaction verbs

Engine facts first (apply to every row): Roblox `ProximityPrompt` shows a floating label with `ObjectText`
(small, above) + `ActionText` (large) + a key/tap icon; on touch the whole prompt is a button; when
`HoldDuration > 0` a 58×58 circular ring fills over the hold time and empties over 0.5 s on release;
`RequiresLineOfSight` defaults true; with `Exclusivity = OnePerButton` only the prompt the camera faces is shown
when several share a key (https://create.roblox.com/docs/ui/proximity-prompts ;
https://create.roblox.com/docs/reference/engine/classes/ProximityPrompt). Default key E, default range 10 studs
(INFERRED — standard engine defaults not reprinted on the fetched pages).

| # | Object | Prompt label (as reported) | Tap / hold | Held in hand | Feedback | Produces / consumes | Status + source |
|---|---|---|---|---|---|---|---|
| 1 | **Tree** | none (tool use, no prompt) | repeated taps; Chainsaw is hold-to-damage | Axe | swing anim, chop sound, tree shakes, falls; logs + 1 sapling pop out; small AoE can hit two trees | Old Axe 13 hits, Good/Ice 5, Strong 1 (big trees 35), Chainsaw 2 ticks (big 38) → logs + sapling; Lumberjack +20% bonus log | CONFIRMED: https://www.pockettactics.com/99-nights-in-the-forest-items ; AoE + co-op double drop https://itemlevel.net/ultimate-guide-to-roblox-99-nights-in-the-forest/ |
| 2 | **Log on ground** | "Store" (into sack) / drag | tap to store; drag = hold-move (PC) or auto-follow (mobile) | — | log snaps to hand/floats; sack counter n/5 | — | CONFIRMED: https://pixeltwelve.com/guides/99-nights-in-the-forest-campfire-fuel-upgrades ; https://deltiasgaming.com/?p=392438 |
| 3 | **Sack** | F = unstore one item (PC); hold F = empty whole sack | tap / hold | Sack selected in hotbar | items pop out one by one, LIFO | — | CONFIRMED: pixeltwelve |
| 4 | **Campfire – fuel** | no prompt: physical drop into the log pile | drag-drop | — | flare, crackle, fuel bar +; level-up text "Fire level 2 map expanded"; fog recedes; Level 6: "The Fire is Complete. The entire Map is revealed." | Fuel values: Log/Biofuel/Chair/corpses 1, Coal/Wolf-Bear corpse 2, Fuel Canister 3, Oil Barrel 4 | CONFIRMED: pixeltwelve; allthings.how kids guide (messages); values https://www.pockettactics.com/99-nights-in-the-forest-items |
| 5 | **Campfire – cook** | "Cook" / drop raw meat on fire | drop | raw Morsel/Steak/fish | sizzle, item turns cooked | raw ×1 (damages) → cooked ×2 forks | CONFIRMED values https://deltiasgaming.com/?p=294763 ; prompt label INFERRED |
| 6 | **Campfire – heal** | passive | — | — | HP regenerates inside the circle; regen stops when fire is out | — | CONFIRMED: 99nightsintheforest.wiki/Campfire ; PC Gamer |
| 7 | **Chest** | "Open" | hold (Scavenger L2 "chests open 20% faster" proves a timed hold; base time not published, ~2–3 s INFERRED) | — | lid opens, items fly out onto the ground, chest stays empty | loot by tier — see table below | CONFIRMED (hold timing exists): https://www.sportskeeda.com/roblox-news/all-classes-99-nights-forest-costs-perks-upgrades |
| 8 | **Crafting Bench – feed** | drop logs/scrap items into the processor beside the bench ("grinder") | drop | — | grinding sound; red Wood / grey Scrap counters rise | Log→1 Wood; Bolt/Sheet Metal/UFO Junk→1 Scrap; Fan/Radio→2; Microwave/Metal Chair/Tyre→3; Washing Machine/Car Engine→4 | CONFIRMED: https://www.destructoid.com/99-nights-in-the-forest-walkthrough/ ; https://rblxguide.com/games/99-nights-in-the-forest/items/sheet-metal ; values Pocket Tactics items |
| 9 | **Crafting Bench – craft** | "Craft"/select blueprint; placeables enter placement mode (green = ok, red = invalid, "can't plant this close to fire") | tap | — | item appears on bench or ghost preview to place | recipes §2a | CONFIRMED placement colours: https://findingdulcinea.com/99-nights-in-the-forest-tree-planting ; error text allthings.how |
| 10 | **Crock Pot** | "Drag three food items inside the pot"; result: "Take" or "Store" | drag ×3, wait | — | pot hisses and shakes ~10 s, Stew appears | 3 raw foods → Stew (×4 forks, +45% hunger); Cook class 25% Hearty Stew (×5, +15 HP) | CONFIRMED: https://www.sportskeeda.com/roblox-news/how-craft-use-crock-pot-99-nights-forest ; values Deltia's consumables |
| 11 | **Eat** | "Eat" (select food, tap screen) | tap | the food | munch sound, hunger bar fills | Carrot/Berry/Apple 1; Corn 2; cooked meat 2; Stew 4; Cake +15 HP; Chili = speed; Seasoning boosts | CONFIRMED values: Pocket Tactics items; Deltia's |
| 12 | **Drink** | — | — | — | — | **There is no thirst/water mechanic in the game.** | CONFIRMED by absence across all item lists (Pocket Tactics; Deltia's consumables) |
| 13 | **Fishing** | walk to pond with rod equipped → minigame starts; ripples = fast spot | tap-timing minigame (details unpublished) | Rod (Old→Good→Strong via Fishing Cabin XP) | splash, fish item | fish ×1 raw/×2 cooked; junk (Bolt, Sheet Metal, Tyre…) and rare items (Trident, Medkit) | CONFIRMED: https://www.pockettactics.com/99-nights-in-the-forest-fishing |
| 14 | **Hunting** | none (weapon use) | tap to swing/shoot; RMB aim | Spear/Revolver/Rifle | hit numbers, animal ragdoll, drops | Bunny → Morsel, Bunny Foot; Wolf (75 HP, 20 dmg) → 2–3 Morsels, Steak, Wolf Pelt; Bear (350 HP, 40 dmg) → Ribs, Bear Pelt; collared animals drop Keys | CONFIRMED: rblxguide beginner guide; Pocket Tactics items |
| 15 | **Pelt Trader** | white box in front of him shows his demand; put the pelt in → 3 wares shown → choose 1 | drop + tap | the pelt | box glows, ware menu | Bunny Foot → Good Axe/Good Sack/Old Flashlight; Wolf Pelt → Old Rod/Spear/Revolver; Alpha Wolf Pelt → Rifle/Strong Flashlight/Giant Sack; Bear Pelt → Strong Flashlight/Iron Body/Strong Axe | CONFIRMED×2: Sportskeeda pelt guide; backyarddrunkard pelt page |
| 16 | **Planting sapling** | select sapling → placement mode → tap ground | tap | sapling | sprout → full tree in ~30–60 s | sapling consumed | CONFIRMED: findingdulcinea tree planting |
| 17 | **Farm Plot** | plant seed / "Harvest" | tap | seed | plant grows; carrot/berry/chili/flower | Farm Plot = 10 Wood; seeds from chests/Fairy | CONFIRMED plot cost gamezebo; harvest label INFERRED |
| 18 | **Revive** | hold Interact on the downed player with Bandage/Medkit equipped | hold (Medic L1 "×5 faster") | Bandage (50 HP) / Medkit (100 HP) | ring fills, teammate stands | consumes the item; downed players can be put in the sack and carried to camp | CONFIRMED: https://deltiasgaming.com/?p=331464 ; https://esports.gg/guides/roblox/how-to-get-bandages-99-nights-in-the-forest/ ; HP values Pocket Tactics |
| 19 | **Flashlight** | tap to flash (not hold) | tap | Flashlight (Old 50% / Strong 100% capacity) | Deer flinches, shields eyes, runs | battery drains | CONFIRMED: itemlevel ("tap, don't hold"); Sportskeeda monster guide |
| 20 | **Missing-children board** | click poster → red arrow | tap | — | arrow in world | — | CONFIRMED: Deltia's kids guide |
| 21 | **Rescue child** | open coloured gate with key, pick child up (into sack), drop at the fire | tap | key / child | "A Missing Child has been rescued" (+days) | adds to day multiplier | CONFIRMED: Destructoid; allthings.how |
| 22 | **Feed / befriend child** (Kids Have Jobs update) | interact + confirm; feed; return trinket | tap | food/trinket | "Find [Kid]'s trinket to befriend them"; "[Kid] has been befriended. You need to keep them fed." | XP → level 5 → tent upgrade + the child does a job (Dino chops wood, Kraken fishes, Squid cooks, Koala scavenges scrap) | CONFIRMED: https://allthings.how/how-to-max-every-kid-in-the-99-nights-in-the-forest-kids-have-jobs-update/ |
| 23 | **Meteor node (mining)** | none — strike with axe repeatedly | taps | strongest axe | node cracks; Meteor Shard / Raw Obsidiron Ore / Gold Shard scatter | → Meteor Anvil crafting | CONFIRMED: https://backyarddrunkard.com/game-guides/99nitf-meteor-mining/ (no dedicated pickaxe in the game) |
| 24 | **Daily Quest machine** (lobby) | "Roll" | tap | — | 3 quests (easy/moderate/hard) | ≥5 diamonds each; some give a random fire upgrade | CONFIRMED: https://deltiasgaming.com/?p=396237 ; rblxguide diamonds |
| 25 | **Sleep / Bed** | none — a crafted bed is a passive structure that raises the day multiplier | — | — | — | Old Bed 20 Wood; Regular 5 Scrap; Good 10W+10S; Giant 20W+30S+1 Cultist Gem | CONFIRMED costs: gamezebo |
| 26 | **Threats (brief)** | — | — | — | Deer: unkillable, 25 dmg (~1/3 HP), walkspeed 35, stunned by light; Owl from Night 5 swoops at choppers; Cultist raids ~every 3 days; Ram charges; wolves/bears | — | CONFIRMED: rblxguide beginner; PC Gamer; Destructoid |

### 2a. Crafting Bench — all 5 levels (CONFLICT on unit names: Pocket Tactics writes "Metal", gamezebo/others "Scrap"; same resource)

| Bench level | Cost to reach | Unlocks (recipe: cost, max) |
|---|---|---|
| 1 (start) | — | Map 3 Wood (1); Farm Plot 10 Wood (20); Bunny Trap 5 Wood (10); Old Bed 20 Wood (1); Bench 2 |
| 2 | 1 Scrap + 5 Wood | Bear Trap 3 Scrap (8); Log Wall 12 Wood (∞); Shelf 2 Scrap (∞); Wood Rain Storage 5 Scrap (∞); Freezer 4 Scrap (1); Compass 3 Scrap (1); Regular Bed 5 Scrap (1); Sun Dial 5 Scrap (1); Crock Pot (CONFLICT: PT says bench 2, 10 Scrap + 15 Wood; Sportskeeda/gamezebo say bench 3); Bench 3 |
| 3 | 10 Scrap + 15 Wood | Torch 6+6 (8); Lightning Rod 8 Scrap (∞); Biofuel Processor 12+12 (1); Radar 10 Scrap + 15 Wood (1); Boost Pad 10S+15W (1); Good Bed 10+10 (1); Bench 4 |
| 4 | 20 Scrap + 30 Wood + 2 Cultist Gems | Teleporter 25S+15W+1 Gem (∞; needs 2 players); Oil Drill 35S+15W+1 Gem; Giant Bed 30S+20W+1 Gem; Ammo Crate 30S+20W+1 Gem; Bench 5 |
| 5 | 50 Scrap + 50 Wood + 1 Gem of the Forest | Weather Machine, Temporal Accelerometer (skips a night for 1 Cultist Gem), Respawn Capsule — each 40S+40W+1 Gem of the Forest (1 each) |

Total to max: 81 Scrap, 100 Wood, 2 Cultist Gems, 1 Gem of the Forest. CONFIRMED: https://www.pockettactics.com/99-nights-in-the-forest-crafting ; https://www.gamezebo.com/walkthroughs/99-nights-in-the-forest-crafting/ ; Temporal Accelerometer https://backyarddrunkard.com/games/99nitf-day/. 2026 additions (Recycler, Log Wall Gate, Flag, Sawmill) exist but their recipes were not captured (rblxguide update tracker).

### 2b. Campfire upgrade costs per level

| Level | Fuel needed (logs-equivalent) | Visual | Unlock |
|---|---|---|---|
| 1 | lit by dropping any fuel | bare logs | camp only |
| 2 | 6 logs (or 1 coal + 1–2 wood…) | 3 log benches | "map expanded"; Dino Kid poster (CONFLICT: L2 or L3) |
| 3 | 11 logs / 7 coal / 2 canisters | 6 rocks | Firemaking I badge (2 💎); Dino Kid (most sources) |
| 4 | 50–75 logs / 23 coal / 9–12 canisters / 30 biofuel | 12 rocks | Firemaking II (2 💎); Kraken Kid; clinic structure appears; Taming Flute upgrade |
| 5 | 70–120 logs / 45 coal / 19–25 canisters / 4 oil barrels | stone base | Firemaking III (4 💎); Squid Kid |
| 6 | 275–350 logs / 170 coal / 35 canisters / 8 barrels / 80 biofuel | large stone base, stacked logs, benches pushed out | Firemaking IV (4 💎); "entire map revealed"; Koala Kid |

CONFIRMED: https://99nightsintheforest.wiki/wiki/Campfire ; https://rblxguide.com/games/99-nights-in-the-forest/updates/campfire-upgrade-path ; kids: https://itemlevel.net/... (Kraken 4 / Squid 5 / Koala 6), https://deltiasgaming.com/?p=293857 (Dino 3 / Kraken 4 / Squid 5 / Koala 5 — CONFLICT on Koala), https://www.theclick.gg/all-children-in-99-nights-in-the-forest/ (ranges). The fuel bar needed per level also scales with party size (pixeltwelve). Burn-out: fire at 0 → safe zone removed, "hungry" Deer spawns at night, no HP regen until relit; rain/snow drains faster; higher levels resist weather (99nightsintheforest.wiki).

### 2c. Chest tiers (CONFIRMED: https://rblxguide.com/games/99-nights-in-the-forest/updates/all-chests-loot-tables-ranked)

| Chest | Where | Typical loot |
|---|---|---|
| Common | sheds near camp, days 1–5 | Bandage, Good Sack, Good Axe, Old Flashlight, Spear, Revolver+ammo, Fuel Canister, 1 💎, seeds, Old Rod |
| Good | houses | + Leather Body |
| Iron | mid-map, near Stronghold | Rifle+ammo, Strong Flashlight, Spikes blueprint, 1 💎 |
| Legendary | far structures | Strong Axe, Iron Body, Giant Sack, Medkit, Oil Barrel, Bear Trap blueprint |
| Gold | far / lighthouse tops | Morningstar, Strong Flashlight, Cultist Gem, Gem of Forest Fragment |
| Ruby | inside Cultist Stronghold | Chainsaw, Kunai, Riot Shield, Tactical Shotgun |
| Diamond | Stronghold clear | 5 💎 |
| Biome chests (Cold/Ice/Hot/Frog/Alien/Obsidiron) | their biome; Frog needs 8 Frog Keys; Obsidiron is *crafted* | biome weapons/armor |

---

## 3. Shop and economy

### 3a. Diamonds (persistent currency)

| Source | Amount | Status / source |
|---|---|---|
| Survive to Day 50 | 2 💎 (4 in Hard Mode) | CONFIRMED×2: https://rblxguide.com/games/99-nights-in-the-forest/items/diamonds ; https://backyarddrunkard.com/games/99nitf-day/ |
| Survive to Day 99 | 3 💎 (8 in Hard Mode) | CONFIRMED (same) |
| Any chest | 1 💎, ~20% chance (Common→Gold) | CONFIRMED: itemlevel; rblxguide chests |
| Diamond Chest (clear Cultist Stronghold) | 5 💎 | CONFIRMED: rblxguide diamonds |
| Badges | 2–15 💎 each (table in §4); badges are the **main** free source | CONFIRMED: https://rblxguide.com/games/99-nights-in-the-forest/badges |
| Daily quests | ≥5 💎 each, 3 per day (easy/moderate/hard), 24 h reset; moderate/hard may also give a random fire upgrade | CONFIRMED: https://deltiasgaming.com/?p=396237 |
| Update Party | devs spawn diamonds; chests give none during the party | CONFIRMED: rblxguide diamonds |
| Codes | small amounts | CONFIRMED: PC Gamer |
| Robux | 20 💎 = 99 R$; … ; 700 💎 = 2,500 R$ (packs span 99–2,500 R$) | CONFIRMED endpoints: https://www.sportskeeda.com/roblox-news/how-get-diamonds-99-nights-forest ; https://deltiasgaming.com/?p=317065. Intermediate packs not published. |
| Robux also: skip a class's level-up requirement; self-revive | CONFIRMED: rblxguide classes 2026; Deltia's revive guide |

Key design fact: **diamonds are not earned per day survived**; the only run payouts are the Day 50 and Day 99
milestones, and those are tiny (2–3). The real diamond faucet is the badge board + daily quests, i.e. *varied
behaviour*, not grinding. A free child earns a 10-💎 Camper after a couple of runs and a 40-💎 Medic/Cook after
a few badges. Classes were originally 350-Robux gamepasses (Medic, Ranger) at launch, June 2025; the June 27
2025 "Classes" update moved them to diamonds (https://www.sportskeeda.com/roblox-news/99-nights-forest-a-beginner-s-guide ;
rblxguide update tracker).

### 3b. The lobby shop — all permanent classes (CONFIRMED: https://rblxguide.com/games/99-nights-in-the-forest/updates/99-nights-all-classes-how-to-unlock-2026 ; perks for the original seven: https://www.sportskeeda.com/roblox-news/all-classes-99-nights-forest-costs-perks-upgrades)

| Class | 💎 | Starter kit | L1 | L2 | L3 |
|---|---|---|---|---|---|
| Camper | 10 | Flashlight | −10% hunger drain | better night visibility | spawn with a Stew |
| Scavenger | 25 | — | +2 sack slots | chests open 20% faster | chance of bonus Scrap from chests |
| Medic | 40 | 2 Bandages | revives ×5 faster | revives restore more HP/hunger | one Bandage → Medkit |
| Cook | 40 | 1 Seasoning | seasoned food restores more | Crock Pot 20% faster | 25% Hearty Stew |
| Hunter | 40 | | | | |
| Decorator | 40 | | | | |
| Base Defender | 40 | | | | |
| Support | 45 | 1 Bandage | | | |
| Fisherman | 50 | Old Rod | | | |
| Brute | 50 | | | | |
| Gambler | 55 | | | | |
| Ranger | 70 | Flashlight, Revolver, 18 ammo | start 18 ammo | +10% ammo refund | start 30 ammo |
| Lumberjack | 70 | Good Axe | +20% bonus log | +25% double sapling | +20% 1–2 bonus logs |
| Zookeeper | 70 | | | | |
| Farmer | 80 | Watering Can | | | |
| Explorer | 80 | | +2 sack | | |
| Brawler, Alien, Berserker, Undead, Grenadier, Snowman | 100 | | | | |
| Chef | 150 | Chef's Station, Recipe Book | | | |
| Feaster | 150 | | | | |
| Blacksmith, Nightcrawler, Poison Master, Fire Bandit | 200 | | | | |
| Beastmaster | 400 | | | | |
| Assassin | 500 | Katana, 120 Throwing Knives | +10% sprint, −15% HP, +5% knives in chests | first-hit crit chance | +10% knives in chests |
| Cyborg, Gunslinger, Pyromaniac, Big Game Hunter, Necromancer, Vampire | 600 | | | | |
| Engineer | 1,000 (10-day window, Christmas 2025) | | | | |
| Alien Scientist | 600 (June 2026) | | | | |

Event classes bought with event currency: Trick or Treater & Witch (Candy), Santa's Helper & Gifting Elf (Candy
Canes), Egg Hunter & Bunny (Eggs). Since the Oct 3 2026 "Helping Happy" update all classes are visible in the
shop at any time (https://www.pockettactics.com/99-nights-in-the-forest-update).

**How a class levels up (CONFIRMED):** each class has 3 levels; L2/L3 need class-themed cumulative objectives
tracked across runs (Medic: find medical supplies / revive N players; Lumberjack: chop trees and plant saplings
N times — exact N not published); the requirement text is shown only after purchase; Robux can skip
(Sportskeeda classes; rblxguide classes 2026; Sportskeeda Lumberjack guide).

**Talents (Aug 30 2025):** a gacha roll for 60 💎 (reroll 30 💎) gives one random perk borrowed from another
class, one per class; ~70 talents (https://progameguides.com/roblox/99-nights-in-the-forest-talent-system-guide/).

### 3c. Event currencies (CONFIRMED: https://deltiasgaming.com/?p=378021 ; rblxguide update tracker)
Halloween **Candy**: earned by lighting NPC houses with candles and knocking at night, lobby pickups, codes, a
one-time 3 from Happy the Halloween Guy; shop (talk to Happy): Trick or Treater class 30, Jack-o'-lantern 20,
Spooky Table/Chairs 20, Pumpkin Bunny 150, Skeleton Wolf 500; items drip in "two every two days"; clock icon =
leaves when the event ends. Christmas 2025 introduced Candy Canes + present chests; Easter 2026 Eggs (11 eggs,
Easter Bunny shop). The Fairy sells seed boxes for 20 Flowers (Gardening badge). The Furniture Trader (in-run
NPC) sells 60+ decor items (Sept 2025).

### 3d. The in-world shop = Pelt Trader (see verb #15). Barter only; one choice of three per visit; arrives
Day 2 then "every 3–4 days"; leaves at nightfall; trades are per-player. The Hunting badge requires completing
all his quests.

### 3e. The economy loop (designer's reading, INFERRED)
Run-level: logs → fire level → map/kids → day multiplier → faster 99. Meta-level: badges/quests → diamonds →
classes/talents → easier runs → harder badges. Nothing bought with Robux is required; the free child feels
rich because the first class costs 10 and a badge is worth 2–15.

---

## 4. Progression

### 4a. Day multiplier (CONFLICT; reconstruction)
- Cycle: 3 min day + 90 s night = 4.5 min; 99 nights unassisted ≈ 7 h 25 min (https://deltiasgaming.com/?p=328080).
- Multiplier starts at 1× (one day per night); rescued kids and crafted beds raise it; the maximum with all four
  kids and all beds is **9×** (https://backyarddrunkard.com/games/99nitf-day/).
- Per-kid value: theclick.gg says **+1 each**; allthings.how says Dino +2, Kraken +3, Squid +4. Only the +1 version
  is consistent with the 9× cap (1 base + 4 kids + 4 beds [Old, Regular, Good, Giant] = 9). INFERRED: each kid
  and each bed tier = +1 day per night. At 9× a run is 11 nights ≈ 50 min, which matches the Swiftness badge
  ("Day 99 in under 90 minutes").
- Sun Dial shows time to day/night; Temporal Accelerometer skips a night for 1 Cultist Gem.

### 4b. Day-99 ending (CONFIRMED: https://deltiasgaming.com/?p=290974 ; https://www.pocketgamer.com/roblox/99-nights-in-the-forest-endings)
Good ending: all four kids in camp on night 99 → cutscene, the Deer watches from afar and vanishes; badge. Bad
ending: not all kids → the Deer attacks the camp, jumpscare; alternative badge. Play continues after 99
(Determined I/II badges at 250/500 days; the "Survive 100 days" badge). Day 99 pays 3 💎 and posts the
completion time.

### 4c. Badges (selection; 💎 from https://rblxguide.com/games/99-nights-in-the-forest/badges ; requirements from https://backyarddrunkard.com/2025/08/28/99-nights-in-the-forest-complete-achievement-badge-guide/)

| Badge | Requirement | 💎 |
|---|---|---|
| Survive 10 / 20…100 days | reach the day | 2 / 4 each |
| Firemaking I–IV | fire L3/L4/L5/L6 | 2/2/4/4 |
| First Aid | revive a teammate | 2 |
| Crafting | bench L4 | 2 |
| Combat | repel a cultist raid | 2 |
| Gardening | buy a seed box from the Fairy (20 flowers) | 2 |
| Humiliation | die to your own bear trap | 4 |
| Infiltration | clear the Cultist Stronghold | 4 |
| Hunting | complete all Pelt Trader quests | 4 |
| Orienteering | rescue all 4 kids | 4 |
| Self Preservation / Vegetarian / Swiftness / Durability | Day 99 without kids / without meat / under 90 min / without dying | 4 each |
| Teamwork | Day 99 with a team of 5 | 8 |
| Kraken / Squid / Koala Daycare | kid to level 5 | 5 / 8 / 10 |
| Errands I/II/III | 10 / 50 / 100 daily quests | 2 / 6 / 10 |
| Determined I/II | 250 / 500 days | 8 each |
| Engineering | 50 structures or bench L5 | 5 |
| Cooking | cook 100 dishes | 5 |
| Supporting | heal/revive 50 times | 5 |
| Hunter | 200 animals | 5 |

~100 badges exist as of Oct 2026; badges must be *claimed* at the lobby badge board (allthings.how kids guide).
Leaderboards: a "highest day" record per account gates lobby options (≥10) — no public leaderboard was found
(INFERRED absence).

### 4d. Update history (CONFIRMED: https://rblxguide.com/games/99-nights-in-the-forest/update-tracker ; https://deltiasgaming.com/?p=373938 ; https://www.pockettactics.com/99-nights-in-the-forest-update)

| Date | Update | Added |
|---|---|---|
| 2025-06 | Launch | core loop, 4 kids, Medic/Ranger as Robux passes |
| 06-27 | Classes | diamond classes (Camper…Assassin) |
| 07-04 | Cultist Stronghold | stronghold, Diamond Chest, Hunter/Brawler |
| 07-11 | Furniture | furniture trader, Decorator |
| 07-18 | Alien Invasion | UFOs, mothership, Alien/Cyborg, lasers |
| 08-01 / 08-08 | Snow Biome I/II | snow biome, Owl, Bird Watcher/Base Defender/Berserker |
| 08-22 | Frog Invasion | frogs, Poison Master |
| 08-30 | Classes MK II + Talents | Support/Gambler/Chef/Big Game Hunter, talent gacha |
| 09-06 | Decoration | paintbrush, 60+ furniture, signs, grid snap |
| 09-13 / 09-20 | Volcano I/II | volcanic biome, Infernal gear, Ram, Cultist King, Fire Bandit |
| 09-27 | Meteor Shower | meteors, Obsidiron, 4 geology badges |
| 10-04 | Taming | taming flutes, Zookeeper |
| 10-11 | 2× Gem weekend | Undead/Necromancer/Beastmaster, Bank, inventory overhaul |
| 10-18 / 11-01 | Halloween: Trick or Treat / Hedge Maze | candy currency, Happy NPC, Vampire |
| 11-08 | Daily Quests | quest machine, Errands badges |
| 11-15 / 11-22 | The Deer is Hurt / Something is Coming | Deer joins raids; caves, bats, shadow cultists |
| 11-29 | Thanksgiving | quest |
| 12-06 | Classes | Brute, Explorer |
| 12-13 / 12-20 / 12-27 | Christmas I–III | North Pole, candy canes, Santa's Helper/Gifting Elf/Snowman, Engineer |
| 2026-01-03…01-31 | Snow melting / Fairy biome / Caves II / **Hard Mode** ("The Forest is Angry", Research Outpost, corruption) / Corrupted tools | |
| 02-06…02-28 | New classes / Valentines / Flames (cosmetic campfire flames via Supply Crate) / Jungle I | |
| 03-07 / 03-21 / 03-29 / 04-04 / 04-18 | Jungle II / Crafting (Recycler, gate, ponds) / Easter I–II (eggs, Egg Hunter) / Offerings (Sketchy Salesman) | |
| 06-13 | The Forest Wakes Up | lobby biome + hardcore selection, Sawmill, 8 badges |
| 06-27 | Alien's Revenge | outposts, UFO repair questline, Alien Scientist 600 💎 |
| 10-03 | Helping Happy | Happy's quests, Reaping/Sweeping/Strawcraft badges; all classes always visible |
| 10-17 (planned) | Halloween Begins | — |

Hard Mode (CONFIRMED: https://beebom.com/99-nights-in-the-forest-hard-mode-guide/amp/ ;
https://allthings.how/99-nights-in-the-forest-hard-mode-and-corruption-explained/): every player pulls a lever in
the Research Outpost basement by Day 2–3; a one-way switch; Corruption % rises nightly from purple rifts and
applies debuffs (Hungry Deer, no passive heal, stronger cultist waves, food rot); clearing rifts lowers it;
Day 50/99 pay double diamonds.

---

## 5. Camera and controls — finer points

| Question | Answer | Status / source |
|---|---|---|
| Does the character auto-rotate to the thumbstick direction? | Yes — Roblox's default humanoid faces its movement direction (unless shift-lock/first-person); the game does not override this. | INFERRED (engine default; no override reported in any guide) |
| Does the camera ever auto-rotate? | Default Roblox "Classic" camera rotates only by right-drag (PC) / one-finger drag on empty screen (touch); "Follow" mode, which swings behind the character, is an opt-in setting. Reviewers mention only manual control and *accidental pinch-zoom* on mobile. | INFERRED from https://create.roblox.com/docs/reference/engine/enums/DevTouchCameraMovementMode + CONFIRMED accidental zoom: https://deltiasgaming.com/?p=392438 |
| Zoom limits | Engine default 0.5–400 studs; the game allows zooming to first person ("scrolling zooms into first-person view, which narrows your field of view"). Exact caps not published. | CONFIRMED FP zoom: Deltia's mobile-vs-PC; limits INFERRED |
| Shift-lock on mobile | Roblox exposes a shift-lock toggle button on touch when enabled; PC players use it for aiming. Not mentioned for mobile by any guide. | CONFIRMED for PC: Deltia's mobile-vs-PC; mobile INFERRED |
| Drag-up to look up | Standard one-finger camera drag; no special look-up. | INFERRED |
| Tap on world = swing tool? | Yes: on touch, tapping the screen with a tool equipped activates it (axe swings, flashlight flashes, gun fires). "Tap the flashlight to stun the deer; don't hold it." | CONFIRMED: itemlevel |
| Hotbar | number keys 1–0 on PC; tap a slot to equip, tap again to unequip (engine default backpack). Starting hotbar: Old Axe + Old Sack (+ class item). | CONFIRMED keys: Sportskeeda beginner guide; toggle INFERRED |
| Interact | E on PC; on touch the prompt itself is the button; revives are *hold* E. | CONFIRMED: Deltia's revive; Roblox docs |
| Sprint | Shift on PC; drains Energy; on mobile a run button. | CONFIRMED: Sportskeeda monster guide ("sprinting uses Energy") |
| Map | M; Map item must be crafted (3 Wood). | CONFIRMED: PC Gamer |
| Dragging | PC: hold LMB and drag; mobile: item auto-follows after pickup. | CONFIRMED: pixeltwelve; Deltia's |
| Prompt placement | One prompt per object, world-anchored above the object; several can be visible at once if they use different keys, otherwise only the one the camera faces (OnePerButton). | CONFIRMED (engine): Roblox ProximityPrompt docs |
| Keybinds | not rebindable. | CONFIRMED: Deltia's mobile-vs-PC |
| Mobile pain points | "lacks in visuals and ease of controls", new players struggle with movement, accidental zoom, lag on low-end devices near big structures. | CONFIRMED: Deltia's mobile-vs-PC |
| Developer statements on UI/mobile | None found. The only mobile remark from the team is technical: low part/vertex counts on the Stronghold. | CONFIRMED (absence): DevForum spotlight |

Quotable developer lines (all from https://devforum.roblox.com/t/creator-spotlight-the-story-behind-99-nights-in-the-forest/4036940):
"Keep scope small and iterate quickly." · "Who knows what the breakout hit will be?" · make the game you would
want to play · get feedback early and often · "observe players when they don't know they're being watched" ·
move on from ideas that aren't working.

---

## 6. Why it works — designer's analysis with evidence

1. **One meter, physically embodied.** The fire is the fuel bar, the safe zone, the fog radius, the HP regen
   and the kids' unlock gate, all in one object you *feed by hand*. Every other system is downstream of it.
   Evidence: level-up messages are the game's only progression text ("Fire level 2 map expanded").
2. **Zero-text onboarding through a free first night.** Night 1's Deer only watches (Sportskeeda monster guide).
   The player learns the threat, the light rule and the circle rule with no risk, then dies on Night 2–3 and
   "realizes I needed to strategize" (PC Gamer). Death is cheap (teammates revive with a 50-HP Bandage).
3. **Verbs a six-year-old owns:** hit the tree, carry the log, drop it in the fire, open the box. Dragging is
   literal on mobile ("it moves with you"). Only one advanced verb (crafting) and it is a drop-into-the-grinder,
   not a menu.
4. **Fog as a progression gate that needs no gate.** Instead of "level 4 required", the map simply is not there.
   Level 6: "The entire Map is revealed."
5. **A scheduled visitor.** The Pelt Trader on Day 2 gives a reason to hunt one bunny and a visible reward
   (15-slot sack) within the first 10 minutes; later visits are random, creating "he's here today" moments.
6. **The missing kids give emotional stakes and a math reason.** Kinzoo: the kids "can't fight… can't defend
   themselves" — "an emotional core kids respond to"; mechanically each rescue multiplies days, turning a 7-hour
   run into ~1 hour. The 2026 "Kids Have Jobs" update turns rescued kids into NPC helpers you feed — a second
   care loop.
7. **Persistent currency only from varied play.** Diamonds come from badges and daily quests (2–15 each), not
   from grinding days (Day 99 = 3 💎). Free players progress; paying skips grind, never unlocks content.
8. **Weekly content ritual.** 64 updates in 16 months; the Saturday "Update Party" with devs present (DevForum).
   Seasonal currencies (candy, candy canes, eggs) make each event its own small economy.
9. **Co-op sized for a phone.** 5-player teams, tasks that split naturally (chopper / looter / cook / medic =
   the class list), teleporter needs 2 players.
10. **Horror that stays 9+**: no blood, the unkillable Deer is defeated by light, not violence (Kinzoo; DevForum
    on the mascot design).

---

## 7. Adaptation brief — Hebrew educational 3D mobile game, Second Temple

Constraints honoured: player = young kohen/Levite in service; never past the Heichal's door; blood only abstract;
single player + NPC companions, no chat; everything finishable with taps; RTL Hebrew; no images; no paid
services — an in-game shop with in-game currency; ages 8–12.

### 7a. Mechanic → Temple equivalent (one sentence each)

| 99 Nights mechanic | Temple equivalent |
|---|---|
| Campfire (draining central meter) | **אש המערכה on the outer altar**: a fuel bar on the altar that drains all day and must be fed with גזרי עצים; when it is full and bright the court is "ready" (hunger of the court). |
| Fire level 1–6 pushing back fog | **Altar fire levels 1–6** that open more of the courts: חיל → עזרת נשים → עזרת ישראל → עזרת כהנים → the altar ramp area → the אולם steps (never past the Heichal door). |
| Fire going out → the Deer | Fire falls to zero → the court darkens, companions stop working and an **מבקר** (overseer NPC) sends you back to re-kindle; no monster, just shame-free failure. |
| Day (3 min) / night (90 s) | **Morning tamid → the day's offerings → afternoon tamid (3 min) → night watch in בית המוקד (90 s)** where you rest, feed the fire once, and listen to the Levite's story. |
| Chopping trees (13 hits) | **לשכת העצים**: splitting logs at the wood store, 3–13 taps per log depending on your axe; some logs are wormy and must be discarded (a tap-inspect). |
| Dragging logs into the fire | Carrying **גזרי עצים** up the altar ramp and dropping them on the מערכה. |
| Sack 5→25 LIFO | **A carrying basket (סל/טנא)** that grows 5→25; last in, first out, so children learn to load in order. |
| Rocks / mining | **A quarry outside the city**: tap stones loose for repairs to the court floor; blemished stones (touched by iron) are rejected. |
| Water (none in the game) | **The laver (כיור) and cistern**: drawing water with a tap-hold at the well and pouring it into the כיור each morning; washing hands and feet is the "ready to serve" verb at the start of every day. |
| Chests (hold to open) | **Storage chambers**: the oil store, flour store, wine store and the salt chamber — hold-to-open jars that give supplies (oil, fine flour, wine, salt) needed for offerings. |
| Cooking / crock pot (3 items, 10 s) | **The baker's chamber (לשכת עושי לחם הפנים) / מנחות**: combine flour + oil + salt (3 items) in a kneading bowl, wait 10 s, take the loaf. |
| Eating / hunger | **Strength meter**: a young kohen tires; eat from the priestly portions in the court dining area (abstract plate) to restore it. |
| Fishing minigame | **Lamb inspection minigame (לשכת הטלאים)**: tap when the ring is in the green zone to check a lamb for blemishes; four lambs are always kept ready. |
| Hunting animals | **Cleaning and feeding the lambs' pen**: carry fodder and water to the pen, sweep it; no killing, no blood on screen — the offering itself is shown as "brought to the altar" with a glow. |
| Pelt Trader (barter, 3 wares, pick 1) | **The pilgrim merchant at the חיל**: comes on certain days, asks for a specific delivered item (e.g. a loaf, a measure of salt), shows 3 wares, choose 1. |
| Scrap grinder / Crafting Bench 5 levels | **The craftsmen's chamber**: drop broken vessels and raw materials into the smith's bin for "metal" and "wood", then craft at a workbench with 5 levels (basket, tongs, fire shovel, silver trumpet, golden vessels). |
| Saplings / farming | **The oil-and-flour garden plots outside**: plant olive saplings and wheat for the stores; harvest with a tap. |
| Reviving a teammate | **Helping a tired companion**: hold-tap with a cup of water from the כיור to bring a collapsed NPC companion back to work. |
| Flashlight vs Deer | **The night watch torch**: at night the איש הר הבית checks watches; tap the torch to show you are awake, or you "fail the watch" and lose a little time. |
| Missing kids (gated by fire level) | **Lost lambs / special pilgrims**: at each altar level a new poster appears on the פרוכת-board: a lost lamb in the sheep market, a lost child of pilgrims, an old man who needs guiding, a Levite boy who missed his choir — bring them to the court. |
| Kids' day multiplier | Each rescued guest **speeds the day cycle** (two offerings per cycle instead of one). |
| Classes bought with diamonds | **Roles (משמרות)**: water-drawer, wood-bringer, lamb-keeper, baker, musician, gate-keeper — each with a starter tool and three levels. |
| Talents gacha | **Blessings from the elders**: a random bonus perk from another role, bought with פרוטות. |
| Diamonds | **פרוטות** earned from badges and daily tasks (not from days survived). |
| Daily quests (3: easy/moderate/hard) | **Daily tasks from the memuneh**: "bring 6 logs", "draw 3 pails", "inspect 4 lambs". |
| Badges / badge board | **Scroll of deeds (ספר הזכרונות)** in the בית המוקד: claim badges by tapping. |
| Levites' music | **The דוכן minigame**: tap in rhythm with the Levites' song during the wine libation; good rhythm fills the readiness meter faster. |
| Cultist raid | **A storm / a flock of birds / a spilled jar** — a timed disturbance that drains the readiness meter until cleaned. |
| Update Party | **Festival days (רגלים)** that change the lobby and add temporary tasks and a seasonal currency (e.g. "willow branches" on Sukkot). |
| Furniture / decoration | **Decorating your chamber in בית המוקד** and your belt/sash cosmetics. |
| Good/bad ending at Day 99 | After 33 "days of service" with all guests helped: the gates open at dawn with the Levites' song; without them: a quiet dawn and "next time". |
| NPC companions (no chat) | 2–3 companions with fixed tap-dialogue (the ממונה, a friend Levite, a lamb-keeper) who hint at the next step the way the Pelt Trader's white box does. |

### 7b. Shop (in-game currency פרוטות; ≥12 items)

| Item | Price | Effect |
|---|---|---|
| Good axe (גרזן טוב) | 25 | logs split in 5 taps instead of 13 |
| Big basket (טנא גדול) | 30 | carry 15 instead of 5 |
| Giant basket | 90 | carry 25 |
| Copper pail (דלי נחושת) | 20 | 2 measures of water per draw |
| Lamb-inspection lens | 40 | green zone in the inspection minigame 50% wider |
| Kneading bowl upgrade | 35 | bread cooks in 5 s |
| Tongs (מלקחיים) | 30 | carry a hot coal for the night watch without burning |
| Silver trumpet (חצוצרה) | 120 | the music minigame gives double readiness |
| Role: wood-bringer | 10 | starts with Good axe |
| Role: water-drawer | 25 | +2 basket slots |
| Role: lamb-keeper | 40 | starts with 2 fodder bundles, lambs never bleat at night |
| Role: musician | 70 | starts with a flute; rhythm game easier |
| Blessing roll | 60 (reroll 30) | random perk from another role |
| Sash dye (אבנט) blue / crimson / purple | 15 each | cosmetic |
| Belt tassel / embroidered hem | 20 / 45 | cosmetic |
| Chamber decorations (rug, lamp, bench) | 20 each | cosmetic for your בית המוקד corner |

### 7c. First 10 minutes (Temple)

0:00 lobby = the gate of the חיל with the shop and the scroll of deeds; 0:30 spawn beside the altar with the
fuel bar at 20%, one axe and a 5-basket; 1:00 the ממונה NPC points (red arrow) to the wood store; 1:30 split
3 logs (13 taps each); 2:00 drop them on the מערכה — bar fills, message "המערכה בוערת — העזרה נפתחה" and the
fog on עזרת נשים lifts; 3:00 the first night watch in בית המוקד: nothing can go wrong, you only tap the torch
once; 4:30 Day 2: the pilgrim merchant arrives asking for one loaf; 5:00 the strength meter is low — eat; 6:00
the craftsmen's chamber bin accepts a broken jar; 7:00 the first poster: a lost lamb; 8–10:00 second altar fill.

### 7d. Progression ladder — altar fire levels

| Level | Fuel | Opens | Guest poster | Unlock |
|---|---|---|---|---|
| 1 | lit | altar area | — | wood store, laver |
| 2 | 6 logs | עזרת נשים, the lambs' pen | — | basket trade with merchant |
| 3 | 11 | עזרת ישראל, oil/flour/wine stores | lost lamb | Crafting level 2, daily tasks |
| 4 | 50 | עזרת כהנים, salt chamber, bakers' chamber | lost pilgrim child | Levites' music minigame |
| 5 | 90 | the altar ramp + the quarry road | the old pilgrim | silver trumpet |
| 6 | 300 | the אולם steps (door stays shut) | the Levite boy | "the whole court is revealed", dawn ending available |

---

## 8. BUILD SPEC CANDIDATES — top 10 copyable mechanics, ranked by (impact for a child) × (ease in three.js)

| # | Mechanic | Impact | Ease | Implementation note (three.js) |
|---|---|---|---|---|
| 1 | **Central draining meter on a physical object** (altar fuel bar, fog radius tied to it) | 5 | 5 | One float `fuel` decremented per frame; a `THREE.Sprite` bar above the altar; `scene.fog.near/far` and a disc of "open" tiles computed from `level`. |
| 2 | **Drop-into-object feeding** (log dropped on altar / jar into grinder) | 5 | 5 | Raycast tap on altar while holding a log → `fuel += value`, play flare particle; no drag physics needed: tap target while item equipped. |
| 3 | **Proximity prompts with hold-ring** (Open / Draw / Inspect) | 5 | 5 | Distance check each frame → show HTML/CSS2DObject label (RTL text) with an SVG ring animated over `holdMs`; pointerdown/up. |
| 4 | **Free first night + day/night timer** | 5 | 5 | `phase` state machine 180 s / 90 s; night 1 flag disables all failure. |
| 5 | **Poster board → red arrow to the current guest** | 4 | 5 | One `ArrowHelper` or a sprite child of the camera pointing toward the target position, visible when `level >= gate`. |
| 6 | **Badge board + daily tasks as the only currency faucet** | 4 | 5 | JSON list of predicates evaluated on events; `localStorage` for פרוטות; claim by tap. |
| 7 | **LIFO basket 5→25** | 4 | 5 | Array `push/pop`; HUD counter n/max; hold = pop all. |
| 8 | **Scheduled visitor with a demand box and 3 wares** | 4 | 4 | Day-2 guaranteed, then `random < 0.3` per day; a trigger volume for the "demand box"; menu of 3 buttons. |
| 9 | **3-ingredient 10-second craft (bowl / bench)** | 4 | 4 | Slots array of 3; `setTimeout(10 s)` with a shake tween; "Take / Store" buttons. |
| 10 | **Tap-timing inspection minigame (lamb check / rhythm)** | 4 | 4 | A ring that sweeps; tap inside the green arc = success; width scales with upgrades. |

Honourable mentions (lower ease): fog-gated map reveal by chunks (needs level design), NPC companions that do
jobs after being "befriended" (needs simple AI loops), weather disturbance that drains the meter.
