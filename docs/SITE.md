# SITE — the construction site in 3D (wave 6)

Owner: SITE (src/stages.js outside PEOPLE's hero fences, src/batch.js's reveal patch, test/site_api.cjs, test/site_shots.cjs,
test/stages_api*.cjs, test/stage_shots.cjs). Status: DRAFT for the owner's review, like every design text of the wave.

## What the player sees
- **Stone by stone, course by course.** A building never rises a floor per tap. Every stone of its masonry is one block of
  its own texture (`texAshlar` / `texMarble` joints, read from `T.ash.joints` when WORLD's tex.js has them, else rebuilt from the
  same RNG sequence), and the reveal shader shows a stone only when its course is below the working course, or it is in the
  working course and its crew's front has passed it. The revealed edge is always a real joint, on every face.
- **Crews = fronts.** Each footprint's perimeter is split into sectors of ≈ 110 amot; each sector is a crew's working front.
  Stones are set round-robin over the fronts, the WORKING front first (the sector in front of the site camera, the hero and the
  crane). So one step of the game = one new stone in view, and the whole building still rises evenly.
- **Ghosts.** The next `ghost` slots (default 3) are thin gold outlines in the same shader (no extra draw call); a fresh stone
  glows for a moment.
- **Real stones in motion.** One Herodian ashlar InstancedMesh (drafted margins round a raised boss; the props material) and one
  rough-block InstancedMesh (the field material) draw every loose stone: the site's stock pile (≤ 24), the dressing yard's
  bankers (rough → drafted → dressed), the stone on the crane's hook, the quarry's benches, and the great stones at the Mount.
- **The treadwheel crane (magna rota).** `liftStone` rolls the crane along the face when the next slot is out of reach, hooks a
  stone off the stock (the pile loses one), lifts it, slews with a damped swing on the rope, lowers it into the slot, drops the
  last finger onto its bed with a puff of dust, and the count goes up as it lands.
- **The phases in 3D** (`setWork({phase})`):

  | phase | on the ground |
  |---|---|
  | `survey` | stakes every ≈ 6 amot, cords, red rags at the corners, chalk lines of the plan (outer and inner faces), the measuring reed (6 amot, Ezekiel 40:5 — its use here is illus.), a plumb line |
  | `dig` | the trench cut down to the rock: a pale bedrock floor between shadowed walls, spoil banked along the outside, heaps, baskets of earth |
  | `foundation` | the trench + the footing course's ghost slots; 0 stones |
  | `courses` | stones by the reveal; the scaffold climbs with the courses (its poles and boards are sorted by lift and shown up to the working height); the crane; the stock pile; the dressing yard; timber, rope coils, water jars, a tool rack; chips at the bankers grow as the building rises |
  | `finish` | all stones; plasterers' boards and lime buckets, the gilders' tables (Ulam / Heichal / Kodesh), the altar's whitewash rising (`finish` 0…1) |
  | `done` | the scaffold is struck, the site swept clean (props gone) |

- **Kinds** (`siteInfo(id).kind`): `ashlar` (the Mount's walls, the courts' walls, the gates, the chambers) · `marble` (Ulam,
  Heichal, Kodesh; gold plates only in `finish`) · `field` (the altar: whole field stones, Middot 3:4, drawn in the reveal shader;
  whitewash = `finish`) · `cast` (the kiyor: 12 crucible pours, a glowing melt line; `liftStone('kiyor')` carries a glowing crucible
  that pours above the mould; illus.) · `platform` (the Mount's fill).

## API — on `stages` (all additive; every old call keeps working)
All calls are safe to call at any time; unknown ids return `null` / `false`. Callers guard them (`has()/call()`), as BUILD does.

- `siteInfo(id)` → `{ kind, courses, perCourse:[n…], stones, fronts, rounds, H, bottom, top, base, set, course, phase, status,
  virtual }`. `stones` is the REAL count (outer-face stones); `rounds` = Σ per course of the longest front = the number of
  "one stone in view" steps. Map a logical stone k of n to `round(k / n × stones)`.
- `setWork(id, { phase, stones, ghost = 3, stock, dressing, finish })` → `{ stones, course, index }`.
  - `phase` ∈ `survey | dig | foundation | courses | finish | done`; `stones` = stones set so far (the truth: the same number
    always gives the same picture; a jump ripples in stone by stone, ≈ 10+ stones/s);
  - `stock` = stones waiting in the site's pile (≤ 24 drawn); `dressing` = a number or `{ rough, drafted, dressed }` (≤ 4
    bankers drawn); `finish` 0…1.
- `liftStone(id, { great, ms = 4200 })` → Promise<`{ course, index, stones }` | `false`>. The crane sets the working front's
  next stone (the count becomes that stone's index + 1). One lift at a time per crane; later calls queue. It resolves as the
  stone lands (≈ 4 s at the default `ms`, + ≤ 1.4 s when the crane first rolls along the face; `ms` scales the lift, 300…12000).
  If the crane leaves in mid-lift (another site takes it, the phase goes back, the stage is done) the stone is set at once and
  the promise still resolves (`false` when the stage is no longer building), so a caller never hangs. `great: true` at `har` leaves a master-course
  stone proud of the face. With no crane at that site the stone is set at once.
- `nextSlot(id)` → `{ x, y, z, w, h, d, yaw, n:[nx,nz], face:[x,y,z], course, index, stone }` — the working front's next stone
  box (centre inset d/2 behind the face; `n` the outward normal; `stone` its global index, so `setWork(id,{stones: stone+1})`
  sets exactly it).
- `slots(id, course?)` → that course's stones on the working front `[{ …box, set }]` (where the working front's run is lower
  than the others, the first front that has stones in that course; a course band with no stones at all gives `[]`).
- `workSpot(id, kind)` → `{ x, y, z, face }` — where a worker's feet stand, and what he faces:
  - `'set'`: on the scaffold board 1.8 amot out from the next slot's face (`slot` inside);
  - `'dress'`: the hero's banker beside the stock pile, `stone: { x, y, z, w, h, d, yaw }` = the banker stone's box;
  - `'yard'` (new): the middle of the dressing yard, `along` and `n` = its axes, and `bankers: [{ x, y, z, face, state,
    stone:{x,y,z,w,h,d,yaw} }]` — each banker's stone box as drawn (`state` rough / drafted / dressed / field, following
    `setWork({dressing})`) and a mason's feet on the side away from the pile (PEOPLE's crews);
  - `'stock'`, `'survey'`, `'quarry'`;
  - **the Mount (`har`) in survey / dig: `'survey'` and `'set'` return `null`** — its survey and dig happen among the
    boulders where the builder already stands, so the caller keeps its own spot and the first strokes need no walk.
- `frontView(id, dist = 26)` → `{ p, t }` — a camera pose outside the face, looking along the course at the working front.
- `setQuarryStock(n, crews)` — cut blocks waiting at the quarry (6 a pile) and the crews there.
- `setStage(id, 'building', p)` still works: p < 0.15 = before the stones; p ≥ 0.15 → stones = round((p − 0.15) / 0.85 × stones).
- Read-only for crews.js: `crane()`, `scaffold(id)`; `ashlar` = `{ geometry, material }` for real stones on carts.

## Real counts (stones · courses · fronts · rounds)
har 35867·54·26·3157 · wall 3681·21·9·552 · sorag 614·3·10·67 · gates 1444·22·6·287 · nashim 309·8·6·84 · nikanor 313·22·1·313 ·
lishka 654·26·3·424 · yesod 132·1·1·132 · sovev 384·5·1·384 · guf 584·10·2·454 · karnot 6·4·1·6 · kiyor 12 pours ·
ulam 2497·64·4·1377 · heichal 4478·63·2·2589 · kodesh 7000·63·2·4370. BUILD paces them (crews set most stones; the player's
actions set the key ones, several at a time).

## Cost
- Draw calls: + 2 when loose stones are in view (ashlar + rough instances); ghosts, fresh glow and the whole reveal live in the
  existing masonry draw calls. Site ground (chalk lines, trench, boards, timber, jars, coils, racks, chips) rides on the existing
  props / heap instances, rebuilt only when the site changes.
- Shader programs: none new (the loose stones reuse the props and field materials).
- Vertices: the ashlar is 4 boxes (144 vertices); ≤ 900 ashlars + 300 rough blocks.

## Tests
- `node test/site_api.cjs [dist/test.html]` — every call above, the phases, a crane lift end to end, the old setStage path.
- `node test/stages_api.cjs`, `node test/stages_api2.cjs` — the older stage API.
- `node test/site_shots.cjs <outDir> [names…]` — phone shots 390×844: `wall_survey wall_dig wall_found wall_c3wide wall_c3near
  wall_c3top wall_c3half wall_c8 wall_done crane1 crane2 crane3 yard quarry altar_mid`.
- `node test/stage_shots.cjs` — the stages at their key states.

## Known issue (wave 7)
- The altar in mid-build (`altar_mid`): the cap over the unfinished course shows fine vertical stripes on the altar's wide top.
  The cap over a wide solid (drawn by the box's back faces, shadows already skipped there) is the suspect; walls are thin and
  do not show it. Not diagnosed in this wave.

## ⚑ Illustration choices (for the owner)
- The crane is a Roman treadwheel crane (magna rota) — the sources do not describe Herod's machines. Default: keep.
- The kiyor is shown as cast bronze in a clay mould, 12 pours — no source describes its casting. Default: keep, marked illus.
- The survey uses a 6-amah measuring reed (Ezekiel 40:5 names the reed; its use at this site is illus.). Default: keep.

## Wave 8B (SITE8B, 28.9) — the Mount on screen (draft)
**The owner's note 1 ("the last two stones are hidden, you can't see what you strike") — root cause:** in a new game the rough
hill's cut uniform stayed at 0.06 through the survey and the dig, and the hill's vertex shader pulled every vertex below the
platform level 85 % of the way up to it as soon as the cut was above 0, while the CPU mirror (where the rocks, the builder and
the crews stand) kept the ground low: every rock below y 0 (most of the Mount) was buried under the drawn hill. Fixed: the
benches are cut only in the crest above the platform level and come in with the cut; the CPU mirror draws the same; the cut
follows the Mount's shown progress every frame.

**The Mount's cameras** (on `stages`, so on the game's `W`; guard them):
- `boulderView(i, from?)` → `{ p, t, dist, az, el, hero }` — DESIGN8B's CAM.STRIKE: the rock's centre at ground + 0.45 r,
  72 amot on a portrait phone (60 wide), el 24°, from the builder's side turned 28° (both sides tried; the next rock's side
  breaks a tie); `clearView` turns / raises it until the rock's top and the builder's head are in clear sight.
- `clearView(x, y, z, dist, az, el, also?)` → `{ az, el, dist, moved, blocked? }` | null once the Mount is done — the cheapest
  pose (a 20° turn ≈ 9° more elevation) whose line of sight clears the hill (a margin growing to 2.5 amot away from the target)
  and the standing rocks; `also` = more points `[x, y, z, skip?]` that must be seen too.
- `occluded(x, y, z, from?)` → bool (the rough hill or a standing rock hides the point) · `heroRock()` → the builder's rock.
- `wallView(id)` → `{ p, t }` — CAM.WALL for the Mount's walls: between the builder's banker and the next slot, 64 amot
  portrait, el 20°, 35° along the face.
- `focus('har')` (plain) = `boulderView(heroRock())` in the survey and dig, `wallView('har')` in the walls' phases; key moments
  (ndc) keep the whole Mount. main.js `// ── site8 ──`: the host `view.lookAt` at a boulder's (x, z) flies to `boulderView`,
  any other lookAt on the rough Mount goes through `clearView`, `view.project` says `on: false` for a point the rough hill
  hides; a tap no longer cancels a camera flight (a drag ≥ 7 px or a second finger does).

**The working patch (every strike changes the world):** a crack, then the split: the three chunks spring apart and lie as
rubble, carted off in ~30 s; where the rock stood the hill itself is levelled (`uPatch`, 12 vec4 in the hill's shader and its
CPU mirror: people stand on it) into a patch of fresh-cut rock with the chisel's lines, widening over ~40 s, staked with a
peg and a red rag at each corner and a cord along each side; its spoil heap grows beside it as the rubble goes; the first
retaining course rises at the east face — the chalk line of the face and two great ashlars per rock split.
**The site alive from the first minute:** the generic workers (stages.js) break the far side of the builder's rock and the
three rocks nearest him, two carriers per split rock take its rubble to the heap; picks, a lever, baskets and a water jar at
the rocks; the survey's pegs and cord from the builder's rock to the next; an ox cart (crews.js, the trains' cart, oxen,
driver and load) shuttles the rubble from the builder's rock to the east edge; the treadwheel crane stands at the east face
from the survey on, a man in its wheel. makeHill's long bands are broken into outcrops, red-earth pockets and scrub clumps
(WORLD8's s8-world 0b0bcd2). No new draw calls beyond the crane and the cart (≤ 62 per phone view measured).

**Tests:** `node test/site_mount.cjs [dist/test.html] [--tag=…]` — the Mount by real touch (390×844, touch, normal mode, a
fresh profile, no autoplay flags): the opening skipped by a tap, the survey by taps on the coach's hand, every boulder struck by
a tap on screen; per boulder: on screen and clear of the HUD, the line of sight clear of the hill, the camera's distance; one
shot per boulder and a contact sheet. `node test/site_mount_shots.cjs [dist/test.html] [outDir]` — the working patch's looks
(the first frame, the split, the patch 40 s later, the next rock, the wide view, the cart, the east face, the walls' camera),
with draw calls.

**⚑ Illustration (owner):** the levelled patches, the spoil heaps and the rubble cart (no source describes how the rock was
cleared) · two ashlars of the first course per rock split (a sign of progress, not a count) · the crane at the Mount's east face
from the survey on · the tools at the rocks. Default: keep, marked illustration.

## Wave 9 (SITE9, 28.9) — the Mount finished, then the wall (draft)
**The boulder field (DESIGN8B §4, STAGING-he "ההחלטה הבימויית"):** the 12 rocks the builder breaks lie in one field on the
Mount's east shoulder, from boulder 4's spot (128, −84) toward the crane, in a zigzag 24 amot apart (≈ 2.2 s of walking; the
run ≈ 24 s instead of ≈ 80 s over 430 × 260 amot); the last rock is 24 amot from where the walls begin; the ground there
slopes 2–12°. Radii and indices kept (`G.bh`, old saves). `boulderSpots()` → 12 × `[x, z, r]` in index order with `.order` =
`[4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3]` (the game reads it guarded; crews.js and main.js read it too; nearest-first from the
builder's strike spot walks the same order). `heroRock()` follows the order; each rock's spoil heap goes to the field's edge.

**The Mount's walls framed (M7/M8, "the v17 frame of the wall is bare ground"):** the first courses (y −64) lie in a 4-amah
trench at the east face, 19 amot under the hill, and the world terrain's floor under the Mount (−50) covered the trench: no
camera could see them. In the walls' phases a **working bay** is dug at the working front (`harBay`: the hill's `uPit` and the
terrain, 46 × 72 amot, its floor = the fill, so it fills again as the walls rise; it follows the crane when it moves > 24
amot). The treadwheel crane stands on the laid course at the next slot and lifts from the stock 9 amot BEHIND it in the bay,
where the builder's banker and the dressing yard stand. `wallView('har')` = `focus('har')` looks into the bay from the hill's
side (70 amot on a phone, el 36°). `camFloor(x, z)`: the camera's floor over the Mount (main.js clampCam) is 8 over the ground
in the Mount's walls' phases (else 7 over the platform's level).

**The key stone arrives (M11):** `deliverKeyStone(id, { what, great = true, ms })` → Promise<`{ course, index, stones }` |
`false`>: an ox cart (crews.js `keyCart`, attached by main.js `// ── site9 ──`) rolls in 30 amot along a lane beside the stock
(≈ 11 s), stops, the block is set down on the pile, the crane lifts it into the working front's next slot (`liftStone`, proud of
the face). Always resolves: no cart or crane → the crane at once; the cart held up → the crane after 22 s of the world's time.
The camera (QA9: on the merge the beat was not seen): one shot along the cart's lane from the quarry's side — the cart with
the block, the pile, the crane, the slot — held until it lands, then `focus(id)`; `{ camera: false }` leaves the camera alone.
**The stock arrives by cart (M7 / W4):** `setWork(id, { stock })` raising a site's stock by ≥ 4 while its crane is there sends
the same cart with two blocks on its bed; the pile shows the new stones as it unloads (later calls move the number it will
show). **The bay's people (DESIGN9 R5):** in the walls' phases crews.js lays the Mount's crew out in the bay (the yard's
bankers, the stock, carriers between them); the crane, its stock and the banker follow the next slot when the game sets
stones without the crane (> 20 amot away, checked twice a second).

**The wall (DESIGN9 15:48 rule 1, CAM.WALL):** the builder's banker (`workSpot('wall', 'dress')`) stands at the course's next
slot, 3 amot out from the face, he 1.9 amot along it; `wallView('wall')` = `focus('wall')` in the courses is over his shoulder
along the face: the slot + 1, 45 amot real, el 24°, from the unlaid side turned 25° outward (v17: ≈ 220 amot, the builder 24 px).

**Tests:** `node test/site_mount.cjs` (by touch) now also waits, after the 12th rock, for the walls' phase and checks the
frame: the banker, the stock, the crane and the next slot on screen and in clear sight, the camera ≤ 120 amot from the slot.

**⚑ Illustration (owner):** the working bay dug at the east face down to the foundation's level (the sources describe the
fill behind Herod's walls, not how the first courses were reached) · the key stone's cart. Default: keep, marked illustration.

## Wave 11 (SITE11, 29.9) — the living site at every stage (draft)
The owner, 29.9 09:13: "זה שהכהן עכשיו זז מנקודה לנקודה זה מאוד יפה. שימשיכו ככה … הכי חשוב שיהיה כיף ומעניין ותקין".
**The working front, posed at every site (`sitePose`, stages.js `// ── site11 ──`):** the treadwheel crane stands where it will
lift the next slot's stone (`craneWorkPose`: a ground crane out from the face AND along it — 0.8 D out, 0.6 D along, the same
reach — the wall's tall crane toward the unlaid side, the frame's side, so its stock shows beside him and its legs rise at the
frame's edge to the hook over the slot; the smaller ground cranes toward the laid stones and leaning out to 12 amot, so their
12-amah base stands 3.4 amot and their stock ≥ 6 amot from his banker; a top crane on the laid course; the laver as v20), its
stock under its pick point. It is posed at once at a load, a resync or its arrival (v20: the wall's crane and stock
waited at the yard 46 amot from the slot until the first lift), and ROLLS on its wheels to the next slot when the slot runs
on > 6 amot (a stone set, the crews' stones, a segment; ≤ 60 amot, farther at once), the stock with it.
**Rule 8 at every site (`workSpot(id, 'dress')`):** his banker at the foot of the next slot — the wall's 3 amot out at the
course's height (SITE9), every other site's 4 amot out on the ground (no scaffold under it there: it never floats). So he
works where the stone is set and walks on with the course, stone by stone ("from point to point").
**The camera at working distance at every site (`siteWorkView(id)`, used by the plain `focus(id)`):** the survey = CAM.SURVEY
at his stake (45 amot real, el 28°), the dig = CAM.TRENCH where he digs (50, el 34°), both from the site's own side
(`def.view.az`); the courses = over his shoulder along the face from the unlaid side turned 25° outward, as the wall's `wallView`
(52, el 24°; the frame rises with the course only as far as keeps him in it); the finish = his finish spot (56, el 34°). Every
such frame tests its line of sight against the courts' walls (four slabs, the east gate's gap), every built site's footprint up
to its built height and the stock, and takes the cheapest clear turn/rise (`clearPose`). v20 framed the wall's survey and dig
from ≈ 220 amot and the gates' courses from ≈ 400.
A load's `focus` is flown again once the site is posed (the settled count's frame), unless another shot took the camera.
**`posed(id)` / `sitePosed(id)` / `onPosed(id, fn(ok), maxMs = 12000)`** (FLOW11's reload landing, N34): true once the site's
count has landed, its crane and stock stand at the working front (the Mount: its bay dug), or when there is nothing to pose.
**The gangs follow the work (crews.js `frontLayout`):** at a posed site the carriers' loop runs from the stock to the course
beside his slot, the tag-line men stand by the stock under the jib, the foreman between; re-dealt when the stock moves ≥ 12
amot; one pile (the world's stock, not a second pile in the old yard — STAGING §8's "one whole-stone pile, by the crane").
**The altar (STAGING §8, מדות ג, ד):** the stone on his banker is a whole field stone whatever the caller asks while he holds
the wooden mallet (`hero.workpiece`), so it is carried, fitted and seated, never drafted or dressed.
**Every other site's finish (PRODUCER11 N52):** the step's items made at his finish spot — cedar beams on trestles, coping stones,
gold or bronze plates on a table, the kevesh's whole stones, lime buckets, the red cord — one more at each of his strokes
(counted by the world, 4 a step), the whole stack when the step is paid off (`FIN_KIND` mirrors content.js PROJ's `fin`).
**The survey at every other site:** its stakes, cords and rags go round the footprint from the corner nearest his stake, a
quarter before his first stroke and a quarter more at each. **The hotspot's beacon** is a quiet stone at a site being built
(no glow over him, no pulse: the game's ring marks his work). **The trench's banks** lie lower in the dig (0.6) and once the
courses start (0.3). **`workSpot(id, 'moment')`** → where he stands in the site's key moment's frame (FLOW11).
**The Mount's key moment (N42):** its east wall from outside the face at 110 amot, not the whole Mount from 2,300.
**The altar's tool (N59):** at an altar stage's work spots every stroke of his but the dig's pick is with the wooden mallet (set by
the world at the stroke). **The dig's spot (N61):** `workSpot(id,'set')` in the dig is 4.8 amot out, in the lane between the
trench's banks. **The corner stone's lift (N64):** the Mount's lift shot at el 38°, 56 amot. **`frameBlocked(px, py, pz, tx, ty,
tz, id)`** (FLOW11's fitted frames, N55): the working frames' own line-of-sight test, with the site's stock, dressing and crane.
**The Mount's finish (PRODUCER11 N40):** a paving patch on the plaza west of Solomon's portico (x 190…228, z 12…56): a sand bed, a
chalk line, stacked slabs, two strips of pavers at each of his strokes (counted by the world), the whole patch at the step's
end; his spot (`workSpot('har','set')`) at its front, moving along the strip; `focus('har')` = CAM.PAVE (60, el 40°, from the
plaza's side).
**The game table by the quarry (PRODUCER10 top-10 #6):** at (168, −174), under a red-and-cream awning, a board with its pieces
and two benches (the props' instances: no draw call); `pick` → `{ kind: 'table' }` → main.js `// ── site11 ──` →
`globalThis.__BH_PARTS.games.table()` (FUN11's opener, guarded). `gameTable()` → `{ x, y, z, on }`.
**N9:** the rocks' camera (`boulderView`) is turned 18° from his side, not 28°: he no longer leaves the frame mid-glide.
**Tests:** `node test/site_wall_touch.cjs [dist/test.html] [--sites=wall:4,gates:2,yesod:2,har-finish]` (by touch; per site:
posed after the load, the kohen ≥ 80 px at every tap, banker/crane/stock at the working front, the stones set, the altar's
stone never dressed, the Mount's paving grows at his strokes) · `node test/site_corner_touch.cjs` (the Mount's corner stone by
touch, a shot every 3 s from the cart to the landing).
**⚑ Illustration (owner):** the crane rolled along the face on its wheels between stones; the paving patch laid in strips;
the game table under an awning by the quarry. Default: keep, marked illustration.

## Wave 12 (SITE12, 29.9 evening) — the Mount shows its work (draft)
**The owner, 29.9 21:01 (note 2):** "בשלב שיטוח ההר צריך שכשעשים זום אאוט רואים את ההתקדמות של החציבה. אני בשלב 3 עכשיו וזה נראה
בדיוק כמו בשלב ראשון, למרות שהכהן שלי זז. שזה לכשעצמו מצויין." The kohen's work frame and his walk between his work points are
unchanged; what changed is the Mount seen from far.
**Why course 3 looked like course 1 (measured on master 0c7150e):**
- the Mount's stone count put every stone below its bottom (the platform body's faces −150…−62, underground) into course 0:
  **13,674 of its 35,867 stones**, so the game's logical courses 1 and 2 of 6 (content.js PROJ.har = 6 × 32; index.js syncSite
  maps a logical stone k of 192 to k / 192 of the real count) were both still inside the first real course: the walls' height at
  the end of each course was −62.7, −62.7, −61.8, −42, −8, +24, +81 — nothing rose until course 3;
- the hill's shader washed the whole hill one "worked earth" brown by the second course (`vCut = uCut × 3.5`) and squashed the
  crest proportionally (`mix(hY0, −0.4, uCut)`), which from far keeps the same shape;
- from the owner's pinch-out (his working frame's own ray) the crest is under the camera: he sees the east half.
**Now (stages.js `// ── site12 ──`):**
- the underground stones are not stones to set (`layout`: blocks below `y0` leave the count; they show as laid): the Mount's
  count is ≈ 22,800 and its walls and the fill behind them rise from the first course;
- **the crest comes down in benches, course by course** (`harCut`, the hill's `uCrest`): each course cuts a new floor — 30, 21,
  13.5, 7.5, 3 and the platform's level (the rock's peak is 40 over it) — swept across the crest from the east over the last
  course's floor, its fresh face moving west as the course goes on; a rim of three benches (2.5 amot) cut into the slope below
  the floor; the cut rock pale with the chisel's lines, lit by its own facets; this course's floor paler than the last's;
- the rest of the hill keeps its own colours and its scrub until the works reach it: the fill (behind the rising walls) its own
  brown, and a band of spoil tipped just above the fill (the next lift) in a looser, paler earth;
- **spoil heaps, rubble and carts** (`harCourseProps`, props' instances): heaps tipped along the fill's edge, pale rubble and
  squared blocks along the cut crest's rim, and ox carts between them (3 in the first course, one more each course) — where they
  are moves every course; none in the working bay, by the walls or on the paving patch;
- **the plaza's paving laid from the west** over courses 4–6 (`uPave`): mount.js's paving is drawn as soon as the walls pass the
  platform's level; east of the paving's front the hill's fill lies 0.35 over it, so the brown fill shows until the front
  reaches it (a chalk line and stacks of slabs at the front); the strip by the bay (x > 180) is paved in the finish, where the
  paving patch grows at his strokes (N40's "the paving grows unseen" — it lay on a finished plaza), all of it at the finish's end;
- the CPU mirror (`hv`, where he, the crews and the carts stand) cuts, fills and paves exactly as the shader;
- `courseView('har')` → a whole-Mount frame (view.lookAt's convention) for the game's course beat (a request to index.js).
**The test:** `node test/site_mount_courses.cjs [dist/test.html] [--out=…]` — the Mount at the end of courses 0…6 from fixed
cameras: `olives` (VIEWS.olives: p [601, 301, −215], t [−60, 20, 0]), `pinch` (his working frame's ray at course 0 stretched × 7,
≈ 490 amot: the owner's pinch-out), `se` (p [540, 420, 640], t [−20, −20, −10]); the % of the Mount's pixels (the platform's
ground projected as cells) changed between consecutive courses against a noise floor (the same course 4 s later); contact sheets
`sheet-<cam>.png`; the working frame's draw calls.
**A clear line to the kohen (PRODUCER-S11 #1: N45, N47, N55; `frameBlocked`, `clearPose`, `siteWorkView`):**
- the site's OWN built courses now count (they were skipped): judged by their drawn meshes up to the built height (`meshBlocked`:
  a ray cast on the site's merged meshes, a hit above the reveal ignored — a chamber's own walls round him, the altar's tiers);
- a footprint box holding the line's end (the guf's slot stands on the sovev's box) is judged the same way, not as solid — by
  test every pose of the guf's courses was "blocked" and fell back to el 54, him hidden behind the sovev;
- the courts' wall as its real pieces with their heights (the Nikanor wall between the courts was missing: the chambers' dig
  framed from 1 amah behind it);
- `clearPose` tries 31 poses (13 more turns round him) and falls back to a pose that keeps HIM clear (then him and the target)
  before the old "raise 30°";
- the courses' frame rises with the course by 0.4 × (≤ 20 amot), not 0.5 × (≤ 26): at the Ulam his feet left the safe frame;
- (N74) the courts' wall is judged by its drawn mesh as well as its pieces' boxes — the game's own close frame at a dig
  (FLOW11's `closeFrame`, index.js:843) asks `frameBlocked` for its 12 turns, and one stood behind the low eastern wall;
- the poses turn all the way round him at a low elevation before any big rise (a steep frame shrinks him: 70 px at el 54);
  the crane in the way is its treadwheel and base (≤ 11 amot), not a 23-amah column (it closed every line at the altar);
- (N75) `workSpot(id, 'dress')` while a site settles its count (a load's ripple, the dig) is the settled count's next slot
  (`settledSlot`), not the yard's banker by the default pile: at the chambers he walked 150 amot to the crane's yard and back.
- **Test:** `node test/site_clear.cjs [dist/test.html] [--only=lishka,guf]` — 25 work frames (the Ezrat Nashim, Nikanor, the
  chambers, the altar's four stages, the laver, the Ulam; survey, dig, courses): the stages before done, the site at its phase,
  the kohen at the game's work spot, the camera at `siteWorkView`; the producer's K80 (on screen, ≥ 80 px for 3.6 amot, not
  HIDDEN: a ray to his head and one to his chest both stopped by a drawn mesh, named), reveal-aware; a shot per frame and a sheet.
**No iron at the altar (N59):** at the altar being built (its footprint and the kevesh, 9 amot round) the dig's pick and a
reset's sledge are the wooden mallet too, and between strokes his hand holds the mallet (it kept the dig's pick); the survey is
the measuring cord (the plumb's line). `stages.hero.held` → the tool in his hand this frame.
**The Ulam's dig rock (N61):** in a site's dig no trench bank, spoil heap or basket stands on his dig spot or between it and the
slot (`digClear`): at the Ulam's two rects the other rect's heap lay on his spot — "he stands half inside a rock".
**⚑ Illustration (owner):** the crest cut in benches course by course, the spoil tipped at the fill's edge and the carts between
them (the sources describe the fill behind the walls and the rock's levelling, not the order of the work); no iron at the altar's
dig either (Middot 3:4 speaks of the stones; a wooden rammer here keeps iron away from the altar's place for a child). Default:
keep, marked illustration.

## Wave 13 (SITE13, 30.9 night) — the progress seen at every stage; machines and life at every site (draft, טיוטה)
**The owner, 30.9 11:12:** "לוודא שבכל שלבי הבנייה נראית ההתקדמות של הבניה כי בעזרת נשים ומצורעים לא בטוח שראיתי את זה. ועוד דבר,
נראה שאני עובד לבד רק גלגלית אחת ישנה והיא שלי. צריך לדעתי עוד מכונות כאלה בסביבה ועוד מכונות בניה מגניבות מהימים ההם שייראה מלא
פעילות." His kohen's walk from point to point at his work is kept (and made straighter).
**The Ezrat Nashim (PRODUCER-S13a #6; מדות ב, ה):** the four corner chambers are built in two parts (temple.js): their walls' lower
courses (6 … 13.09, a course joint) are the stage's courses; their upper walls, copings, the lintels over their doors and what each
holds — the wood stacks (דיר העצים, NE), the immersion pool (המצורעים, NW), the wine and oil jars (בית שמניה, SW), the hearth and
pot (הנזירים, SE) — are the set `nashim-lc`, raised in the finish "לשכות הפינות" one chamber at each of his strokes (all four
once the step is paid off, 2.6 s apart), each with the gold line at its rising top (batch.js: a cut per footprint rect, uC.w < 0).
He walks to each chamber's door in turn (`workSpot('nashim','set')`), and its name stands over it on the screen (main.js
`// ── site13 ──`, from `stages.finishLabel()`: the name, what it was for, "מדות ב, ה · טיוטה"). The gallery (הגזוזטרא, the
finish's first step, paid in cedar) is cedar on cedar brackets, laid from west to east.
**The House's finish on the building (`FINCUT`, `finishCuts`):** each finish-only material has its own cut, moved through its step
by his strokes (4 a step) and whole when the step is paid off, eased so a step the crews end at once still rises in view — the
Ulam: the five oak lintels one above the other (מלתראות, מדות ג, ז) → the cedar poles over the Heichal's door (כלונסות, מדות ג, ח)
→ the gold inside the hall with the golden vine hung (גפן הזהב) → the façade's gold band, cornice, coping and spikes; the Heichal:
two cedar door leaves in its doorway, seen through the Ulam (דלתות ההיכל, מדות ד, א; hidden once sanctuary.js's gold doors hang)
→ the gold bands → the coping → the כלה עורב spikes (מדות ד, ו); the Kodesh: its gold. Its ceilings are inside and change
nothing seen from the court (⚑).
**Machines and life (PRODUCER-S13a #7; `MK`, stages.js `// ── site13 ──`):** at every walled site being built (the wall, the
lattice, the gates, the Ezrat Nashim, Nikanor, the chambers, the Ulam, the Heichal, the Kodesh), from its first minute, along the
course he lays (toward its laid stones, where his working frame looks): the crews' treadwheel crane (the great wheel walked by a
man) lifting their stones from their pile onto the course in a 10-s cycle — on the rising wall once the course is out of a ground
crane's reach; a shear-legs (two poles and a pulley block) raising a block on its fall, two men hauling; a sledge on three rollers
bringing a long block, two men levering behind and two hauling in front. All instanced: 8 draw calls for all of them (≤ 4 sites);
the men are the workers' own (NW 44 → 72); they keep to the face's own run (never into a wall beyond its end) and stand clear
of the other sites standing there (the first clear distance out: at the Ulam the altar and the laver); the crews' crane 18 amot on,
its jib over the face, so its hook and load come down at the edge of his working frame (26 at the wall, on the unlaid side with his
crane: DIRECTOR13's C4 frame looks from the laid side); on a wall higher than it reaches it stands on the wall, 6 amot in. **The ox carts
(crews.js `siteTrain`, `stages.cartLane()`):** three carts from the quarry in along a lane beside the building site (whole field
stones at the altar), the loads off at a stop, on and out empty, in again loaded. **At the altar (מדות ג, ד):** no machine there;
the carts of whole stones, the carriers with stones in their arms, and every worker's hands bare — no hammer head (N76 c).
**N76 b:** `groundAt` knows the altar as it stands (the yesod's ledge 17, the sovev 22, the top 25) and the kevesh; the karnot's
survey stands on the top at the north-east corner where the first horn goes, reached round the south and up the kevesh (route
never over the altar's side). **N64:** the key stone on the hook glows warm gold and trails sparks; its landing throws gold
sparks and dust. **The route (PRODUCER13 19:40):** inside one region he walks straight unless the line passes over something
standing there (the House, the altar and kevesh, the chamber north of the altar, the laver; the courts from the Chel; the corner
chambers of the Ezrat Nashim).
**API (guard it):** `finishLabel()` → `{ text, sub, src, x, y, z, t, i } | null` · `machines()` → `{ id: { crane, base, shear, sled } }`
· `cartLane()` → `{ id, a, b, stop, cargo } | null`.
**Tests:** `node test/site_courses.cjs [dist/test.html] [--stages=nashim,ulam,heichal,kodesh,wall] [--cams=work,wide,site]` — each
stage at the end of each logical course and each finish step (and the Ezrat Nashim's chambers one by one) from fixed cameras
(the course-1 work frame, ×3, a whole-building camera), Δ % per step vs a noise floor, sheets `sheet-<id>-<cam>.png`, draw calls,
the machines on screen. `node test/site_demo13.cjs` — the demo as the owner enters it (declared: `switchMode(true)`, `jumpTo(id)`,
`__T.look` for ×3): the lifting machines and carts in the work and ×3 frames, draw calls, a shot each.
**⚑ Illustration (owner, each with a default):** the crews' treadwheel crane, the shear-legs and the sledge on rollers (the sources
describe the stones, not Herod's machines — Vitruvius 10.2 describes the period's treadwheel and shear-legs) — keep, המחשה · the
ox carts from the quarry to each site (Ant. 15.11.2 speaks of a thousand wagons) — keep · the chambers' walls split at half height
so that the chambers rise in the finish, one at each of his strokes, in the order nearest him first (NE, NW, SW, SE) — keep (the
Mishnah's order SE, NE, NW, SW is the alternative) · the gallery in cedar — keep · cedar doors in the Heichal's doorway during its
finish, gilded when the stage is done — keep.
**Measured (test/site_courses.cjs on s13-site, SwiftShader 390×844, fixed cameras; Δ = % of the frame changed; looked at):**
- the Ezrat Nashim — the whole court from 330 amot: courses 24.7 · 3.6 · 6.0 · 3.8 · 4.3 · 7.8 %, the chambers' step 11.9 %; the
  course-1 work frame: courses 24.3 · 26.7 · 20.1 · 15.6 · 19.1 %, the gallery 13.9 %; its ×3: courses 10 · 12.2 · 8.8 · 9.2 · 11.3 %,
  the gallery 11.1 %, the chambers 22.1 % (noise 0.5–1.2 %). v25: the finish 2.1 % / 0.3 %.
- the Heichal — from the north-east over the courts: courses 1–5: 10 · 8.1 · 11.6 · 14.2 · 15.3 % (noise 0.1 %), two treadwheels on the
  rising walls from course 3. (The run's 10 minutes ended at course 5: ~60–230 s a step on the shared machine.)
- draw calls at the work and ×3 frames: ≤ 93 at the Ezrat Nashim, ≤ 123 at the Heichal.
**The route (PRODUCER13 19:40, 20:03, N87, N90):** inside one region he walks straight unless the line passes over something
standing there; in the Azara a walk round the House or the altar goes by its open aisles (`azPath`: the shortest way through one or
two of 19 corner points, each leg clear), never the hub's out-and-back (checked offline on the producer's walks: 33 amot → 44, was
230; 44 → 42, was 223); a step across a gate skips a court's own hub when the line through the gate is clear. **N88:** at the karnot
he works the horns from the altar's top, beside each.
