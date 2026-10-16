# Wave 9: the Mount's staging finished, and the living site beyond it

2026-09-28. Start 15:05 UTC. Feature freeze 16:50 UTC. Hard stop 17:05 UTC (20:05 Jerusalem).

## Where we are
- **v17 is published** (master 1428e5c). It answers the owner's notes of 28.9. His words and the new standard are in
  **docs/WAVE8B-BRIEF.md**: real touch at 390×844, no autoplay, and screenshots you looked at. Read it first.
- **The staging** is in **docs/STAGING.md** (the full storyboard and the Mount's shot list M1–M12) and **docs/STAGING-he.md**. What
  was built in 8B, and what was not, is in PROJECT.md §8 ("Wave 8B" and "Next (wave 9)"). Wave 8B's notes are in bus/w8/ (read-only).
- **The owner** has not written since v17. His standing instruction: "תפעיל. ואל תעצר חבל על הזמן".

## Rules
The rules of docs/WAVE6-BRIEF.md and docs/WAVE8B-BRIEF.md apply in full:
- drafts marked טיוטה, each with a source;
- never write the Name;
- no gore, no gambling, no purchases or guilt;
- Shabbat-safe;
- RTL and phone first;
- no paid services.

Usage economy is real:
- The account's usage limit stopped every long wave so far. **Commit every 15 minutes.**
- Read big files by ranges.
- Keep outputs short.
- Take few screenshots, and look at each one.
- No sub-agents.
- One browser at a time.

## The bus
- It lives at /home/claude/wt/bus/. Keep your notes in bus/<AGENT>.md.
- Post your plan by 15:25 UTC, then an update every 40 minutes.

## The four agents
| agent | worktree · branch | owns |
|---|---|---|
| SITE9 | wt/site9 · s9-site | src/stages.js outside PEOPLE's hero fences, src/crews.js, src/batch.js; main.js `// ── site9 ──`; test/site_*.cjs, stages_api*.cjs, crews.cjs; docs/SITE.md |
| FLOW9 | wt/flow9 · s9-flow | src/game/state.js, index.js, content.js, ui.js, ui.css.js, moments.js, middot.js, facts.js; main.js `// ── build* ──`; test/game-*.{cjs,mjs}, moments.cjs; docs/BUILD*.md |
| QA9 | wt/qa9 · s9-qa | test/real-play.cjs, new docs/QA-S9.md. Reads everything; changes no game code |
| DESIGN9 | wt/design9 · s9-design | docs/STAGING.md, docs/STAGING-he.md (plus a new diagram in docs/ if it helps) |

The precision games (src/game/minigames/*) and the board (src/match3/*) have no owner this wave. If a title or lead line must
change, FLOW9 passes it in `ctx` (title, lead). The games already accept `ctx.lead`.

## The work

**SITE9 — the Mount finished, then the wall:**
1. **The boulder field (DESIGN: STAGING-he "ההחלטה הבימויית").**
   - Gather the 12 rocks into one field on the Mount's east shoulder, on the way to the crane, so the camera stays close and the
     walk between strikes is short.
   - The positions live in stages.js (the world) and in src/game/index.js:47 (the game's BOULDER list).
   - Export them from stages.js (for example `stages.boulderSpots()`), and post it on the bus by 15:45 UTC. FLOW9 reads them,
     guarded.
2. **The Mount's walls phase, M7/M8.** After the rocks, the frame shows the builder, his banker, the crane, the stock and the
   rising course from the hill's side. The v17 frame of the wall is bare ground.
3. **The corner stone, M11.** When the quarry game that hews the corner ends, an ox cart brings the block down the quarry road and
   the crane sets it in the corner.
   - Give FLOW9 a world call, `deliverKeyStone(id, {what})` → Promise, and post it on the bus.
4. **The living site for the wall (the azara's walls), then the gates and the altar,** if time allows. Use DESIGN9's shot lists:
   - gangs;
   - the crane;
   - carts bringing stone;
   - tools;
   - scaffolds that climb;
   - stock that shrinks as stones are set.
5. **Phone budget:** ≤ 150 draw calls.
6. **Tests:** site_mount.cjs, site_api.cjs and stages_api*.cjs stay green. Add a real-touch check for the new beats.

**FLOW9 — the words match the games, and the tests match the flow:**
1. **Titles and words that match (DESIGN8B's 11:03 note, bus/w8/DESIGN8B.md):**
   - On the Mount the first key stone is "האבן הגדולה" and is set with the crane: "את האבן הראשונה, האבן הגדולה, תניח אתה
     במנוף".
   - Stone 16 is "חצוב את אבן הפינה", played as the quarry game. SITE9's cart and crane then set it (guarded `W.deliverKeyStone`).
   - Nowhere does it say "הנח" for a stone the player hews.
2. **The boulder field:** read SITE9's `boulderSpots()` into the game's list, guarded, so the old save's indices still match.
3. **The pointer at every strike:** game-touch.cjs is 11/12. The `.gm-mark` blinks off at some strikes (op=0). It stays on the
   next target through the strike run.
4. **Update test/game-e2e.cjs to the new flow:**
   - the pointer is `.gm-mark`;
   - the segment button is "▶ הביאו 8 אבנים";
   - the greeting card is a third modal;
   - the pill texts are new.
   - It is 20/31 on phone at v17 because of the script, not the game. Make it green, with a one-line reason per change.
5. **Keep green:** game-harness, game-flow, game-touch, moments --harness, and the node tests.

**QA9 — the truth, by touch:**
1. **Update test/real-play.cjs to v17's flow.** It is 5/13 at v17 because its selectors predate FLOW8B's pointer, panel and
   greeting. Run it on master (v17), and post the true state of every owner note by 15:50 UTC.
2. **From 16:20 UTC:** run it on a throwaway merge of s9-site + s9-flow. Check the new beats:
   - the rock field, close;
   - the walls framed;
   - the corner stone hewn → cart → crane;
   - the words matching the games.
   Post P0s to their owners.
3. **docs/QA-S9.md:** each owner note of 28.9 ✓/✗ with evidence, and anything new a first-time player would trip on.

**DESIGN9 — the shot lists for what comes after the Mount:**
1. **By 15:50 UTC,** for SITE9: the wall's full shot list, at the Mount's level of detail — each beat with its camera, target,
   action, what the world does, the few words, the sound and the fact.
2. **Then** the gates and the altar. The altar's stones are never dressed: they are carried, fitted and seated with a wooden
   mallet (Middot 3:4).
3. **From 16:20 UTC:** review SITE9's and FLOW9's work against the storyboard, using their screenshots and QA9's. Post notes
   as file:line or beat → fix. Update docs/STAGING-he.md with what is built, as a draft.

## At the hard stop (17:05 UTC)
- **Your branch:**
  - everything is committed;
  - it builds;
  - your tests are green, or each failure is explained;
  - `git merge-tree --write-tree master s9-<you>` is clean.
- **Your final message** is your report:
  - what you built, by file;
  - the real-touch results;
  - the screenshots (you looked at them);
  - the bundle delta;
  - ⚑ lines in Hebrew, each with a default;
  - requests, as file:line.
