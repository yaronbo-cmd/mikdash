# Look round E (ה): the Azarah's stone and floor — phase B and the finished Temple

Read first: `docs/specs/look/00-common.md` (limits, method, what never changes) and how rounds A–D did it
(`src/look/stone.js`, `paving.js`, `ground.js`, `shader.js`, `light.js`). Base: build 123 (`e30aab7`). Build number: 127.

## Why
The owner approved (2026-11-13): phase B ("a day in the Temple", `#shift=day`) must look like the same world as phase A after
rounds A–D. Today the Azarah floor is a flat blue-grey, the court walls / chambers / steps are a smooth repeating ashlar texture,
and shadows on the floor are hard navy. His answers: floor = warm cream Jerusalem stone, ONE world with phase A; order of rounds
E, F (altar, ramp, vessels), G (light, fire, smoke), H (lambs, small details). This round is E only.

## Scope of round E (look only)
1. **Azarah floor, Ezrat Nashim floor, the Chel, the steps (15 steps, the Ulam's 12 steps)**: warm cream limestone slabs in the
   palette of `src/look/paving.js` / `stone.js` (no blue cast), slabs of several sizes laid in courses, soft joints, slight
   per-slab tone, wear where people walk most (gate axes, round the altar and the laver, the ramp's foot), darker staining near
   the altar base and the laver. Step edges worn (soft highlight on the nosing), not razor sharp. No visible tiling repeat from
   the play camera or from the wide view.
2. **Court walls, chambers, gates' masonry, the Heichal's outer stone**: move them onto round A's stone system look (cream
   limestone, per-course and per-stone tone, drafted margin readable up close, a dirty foot, soft shade under cornices), the way
   round D did the city walls. The white marble of the Heichal's face stays white marble but gets veining/tone so it is not
   a flat white; gold stays gold (round F deals with gold, altar, laver).
3. The same materials are what phase A shows when these parts stand (stages 02–05 walls, the finished Temple): one world.
   Do not change any phase-A minigame stone that rounds A–D already own.

## Never
- No change to gameplay, positions, heights, sizes, cameras, HUD, texts, scoring, sources.
- Do not touch the altar, ramp, laver, fire, smoke, figures, animals, light rig (rounds F–H).
- No renaming of scene objects/materials that code looks up by name; no leftovers of the old textures if they become unused
  (delete dead generators, as `texGround` was deleted in round B) — but only if nothing else uses them (grep).
- Phone limits of 00-common hold for rounds E–H together: ≤10 % frame time, ≤ +1 s boot, ≤ +150 KB page. Prefer shader
  detail on existing geometry over new textures; no new draw calls if avoidable.

## How to look at phase B (headless, ~1 fps software GL; never two browsers at once)
- `node build.mjs`, then open `dist/test.html#shift=day` with an init script `globalThis.__FORCE_SHIFT = true; window.__FORCE_Q='normal'`,
  wait for `__T.booted`, tap the text "יאללה לעבודה", then "לעבודה" (exact). Then for a fixed view:
  `__T.pause(true); __T.look(p, t); __T.render0(); __T.look(p, t); __T.render0();` and screenshot.
  Working examples: `<scratch>/phaseB/p3.cjs`, `p4.cjs` (scratch = /tmp/claude-0/-home-user/dd533389-08bf-5464-8305-7a5ac2343469/scratchpad).
  `__T.VIEWS` has `altar`, `facade`, `heichal`, `top`. Azarah floor is at y ≈ 16 (temple.js `P('azara', …, 16, …)`).
- BEFORE shots first, from the base build, same cameras, 960×600, saved to `<scratch>/roundE/before/`; AFTER to `<scratch>/roundE/after/`.
  Shot set (at least): play camera behind the kohen at the start; azarah wide; floor close near the altar foot; the 15 steps;
  the Ulam steps and Heichal face; a chamber wall close; north court with the lamb pen; Ezrat Nashim wide; top view;
  one view at dusk (`__T.setTime('dusk')`), and two phase-A views where these walls stand (stage 02 wall, the stage-05 court).
- Look at your own after shots critically before reporting: no blue floor, no flat white wall, no repeat pattern, no moiré at
  distance, labels still readable.

## Checks before you report
- `node --test test/*.test.mjs` green (629 pass / 10 skipped at base).
- Frame time and boot against base with the method of round D (`<scratch>/roundD/boot4.cjs`, `shoot.cjs` MEASURE), plus one
  MEASURE in the phase-B play view. Page size delta.
- Commit in small steps on the current branch with clear messages ("Look E1: …"). Trailer exactly:
  `Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01LtMU2Ft9m6CYFuueHM5nSc`.
  Do not push. Do not run the long stage replays (I run them).

## Time
Hard stop: report by 13:10 UTC today (2026-11-13) with whatever is committed and shot; nothing may run after 13:30 UTC
(Shabbat). If you are mid-change at 13:00 UTC, commit only what is clean and revert the rest.
