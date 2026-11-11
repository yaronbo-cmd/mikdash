# Round D: what is far: the hills round the Mount, the city, the wall

Read `00-common.md` first. Hebrew spec sections 10 and 11. Starts only after the owner approved round C.

Today: the Mount of Olives and the hills are one lawn green with olive trees as green balls in ruler-straight rows and
paths as white zigzag lines (`city.js buildOlivet`, `world.js buildTrees`, `terrainColor`); the houses are plain boxes in
about three colours with flat roofs (`city.js buildHouses`), streets are flat beige (`buildStreets`); the city wall and
towers already carry drawn stone (`buildWalls`). All of it is far from the player: modest, cheap changes that read from the
zoom-out and from the Mount's edge. Every historical statement already in the code comments keeps its source and its ⚑
marks; this round changes looks, not the plan of the city.

Before set, 960×600: `__T.look([750,380,850],[0,-20,0])`, `__T.look([0,45,300],[700,70,-200])` (Olivet),
`__T.look([-750,220,100],[-380,-20,0])` (city), `__T.look([0,160,900],[0,-20,200])` (south), the Kidron from the Mount's
east edge at eye height, the city wall and a tower from 80 amot, the zoom-out from inside a minigame.

## D1. The hills
- Uses round B's ground material: dry earth, rock on slopes, darker valley floors. Remove the lawn: `TC.orchard`, `TC.lush`
  toward dry olive and straw; green stays only under the orchards and in the valley bottom.
- Terraces on Olivet: low dry-stone walls along the contours that `buildOlivet` already computes: a pale rock band with a
  shadow line under it, readable from the Mount.
- Paths: soft trodden earth (round B's mask idea, or a blended strip), not a white line.
- The Kidron and the valleys: deeper tone and shade at the bottom so the Mount's height is felt.

## D2. Trees
- Olive: a short twisted trunk (3 to 4 segments, visible from the Mount) and a crown of 2 to 3 irregular clumps in silver
  grey-green, lighter on the sun side (two tones by normal). Rows stay rows but jitter each tree up to 15% of the spacing
  and drop about one in twelve, so no ruler lines. One InstancedMesh per part, same counts as today or fewer.
- Cypress (palace gardens) and any other tree kind in `buildTrees`: a dark slender spindle with a ragged outline, not a
  smooth cone.
- Wind sway from round C applies.

## D3. The city
- Houses (`buildHouses`): keep the box bodies and counts. Add, by vertex colours or one small shared atlas (no per-house
  texture): a dark door and one or two small dark window openings on a wall, a parapet line round the flat roof (a slightly
  lighter rim and a darker roof floor), plaster blotches and a dirtier foot, and 8 to 10 wall tones in the cream, ochre and
  grey range instead of three. Larger houses in the Upper City may get an inner court as a dark square on the roof plan if
  the plan already marks them.
- Streets and open ground between houses: trodden earth (round B material with the city mask), not flat beige.
- The wall and towers: a dirtier foot, a shadow line under the crenellations, slight tone variation between courses.
- The oven smoke stays.
- Herod's palace, the Xystus, the pools' surrounds: same treatment as the houses' plaster and the walls' stone; no new
  geometry beyond parapets.

## D4. The far edge
- Where the terrain ends and the sky dome's hills begin, no visible seam or colour jump from any of the before-set cameras.

## After set and acceptance
Retake the before set. From the Mount the surroundings read as dry Judean hills with terraces and a living city, not a lawn
with dice. Draw calls and triangles for the far field must not grow by more than 10%. Bot replay of stage 01. Budget.
