# Round C: light, shadow, sky, air

Read `00-common.md` first. Hebrew spec sections 7, 8, 13. Starts only after the owner approved round B.

Today: `main.js` has one sun (`DirectionalLight`, noon intensity 2.95, PCF shadows 2048², shadow box ±600), a hemisphere
light, fog per time preset (`TIMES`, `setTime`), GTAO and bloom in the composer; the stage's golden "light B"
(`world101.js`/`light28.js`: find which preset stage 01 to 04 actually run) washes stone yellow. The owner asked on
2026-11-10: "האור הצהוב צריך להוריד. מכל המשחקונים". The sky (`sky.js`) is the best part of the world and stays; it gets
four small improvements.

Before set, 960×600: each stage 01 minigame's opening frame, a stone's shaded side close up, the zoom-out, the east
horizon (`__T.look([0,45,300],[700,70,-200])`), the sun in frame, a cart moving.

## C1. Softer, weaker golden light
- One golden light stays (rule). Lower its saturation and strength so cream stone reads cream: target in the course
  minigame's opening frame: a sunlit stone face averages within hue 36..46, saturation under 22% (measure pixels in the
  shot and report). The shadow side must not go grey-flat: raise the ground bounce (hemisphere ground colour warm, from the
  ground's own tone) so shaded faces sit 35 to 45% below lit ones, warm.
- Apply to every minigame of stages 01 to 04 through the one place that sets the work light; no per-act overrides remain.

## C2. Shadows that hold things to the ground
- Soft edges: `PCFSoftShadowMap` or a wider PCF kernel where the budget allows ('high'), plain PCF on 'normal'.
- Resolution where the player looks: the shadow box follows the play camera's target and tightens to about ±60 amot while
  an act runs (texel snapping to stop shimmer), and returns to the wide box for the zoom-out.
- Contact: every stone, slab, rock, tool and cart has a dark contact line where it meets the ground. The GTAO pass already
  exists: tune radius/intensity for amah-sized objects during acts; on 'normal'/'low' where AO is off, a cheap blob/skirt
  decal under movable pieces (the acts already draw shadow disks for hanging stones: keep those).
- Nothing floats: go through the round A/B shots again under the new light.

## C3. Haze and depth
- Fog per preset tuned so the city and far hills step back in three clear layers; near field (under 150 amot) stays crisp.
- The far hills on the sky dome get two more value layers (lighter with distance).

## C4. The sky's four improvements (`sky.js`)
- Cloud shadows: soft moving patches of shade on the ground, the city and the Mount: sample the dome's own cloud noise
  (or one scrolling noise) in the ground, stone and city materials as a multiply on direct light (0.75 at most), drifting
  with the clouds' wind. One shared shader chunk; off on 'low'.
- Softer horizon cumulus: no hard white rim; feathered edge, grey feet kept.
- Sun: a soft halo; make sure the sun disc's direction and the directional light's direction are the same vector.
- The far ranges in layers (C3).

## C5. The sun moves within a stage (the owner's question 4: yes)
- During a stage the sun advances slowly from morning toward noon as the stage's works get done (progress-driven, not
  clock-driven: no time pressure in this game; the same progress always gives the same sun). Elevation about 28° → 62°,
  azimuth along the existing presets; light colour, fog and sky lerp between the existing `dawn`/morning and `noon` presets.
- Never during an act: the sun holds still while a minigame runs (shadows are part of reading the scene) and eases to its
  new place in the walk between works. Every act must stay readable at both ends: take each act's opening frame at the
  lowest and highest sun and check that no long shadow hides a target or a green mark; where it does, clamp that act's sun.

## C6. Dust and wind
- A faint standing dust haze over an active work site and a short trail behind a moving cart (one Points draw call, reuse
  the city smoke's shader pattern in `city.js buildSmoke`). The hit dust and sparks of the acts stay untouched.
- Wind: bushes, tree crowns and cloths sway a little (vertex shader, one uniform time, amplitude under 0.1 amah).
- Water: first look at the city pools (`water.js`, `city.js buildPools`: Siloam at about x −322, z 1321; Bethesda at
  x 115, z −735) and shoot them. If they already show sky tone and ripples, leave them. If flat: sky-coloured reflection
  tint by view angle and a slow normal ripple. Report what you found.

## After set and acceptance
Retake the before set plus each act at lowest and highest sun. Stone reads cream not yellow; shaded sides warm, not grey;
soft shadow edges; contact everywhere; cloud shadows drift; nothing in the acts became harder to read. Bot replay. Budget.
