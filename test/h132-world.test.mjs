// build 132 item 13: stage 08's frame boards round the foundation are out of stage 09's world from the block's 'bare' on (and in the
// strip's closing film); only stage 09 hides the node, and shows it again when its block is earlier — stage 08's own drawing untouched
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { frameAway, siteStakesAway } from '../src/game/h132/world.js';

test('the stage 08 frame: hidden by stage 09 from bare on, shown again before it; a node hidden by its own stage stays so', () => {
  const root = new THREE.Group(), h109 = new THREE.Group(), g = new THREE.Group(); g.name = 'h131-frame'; h109.name = 'h109'; root.add(h109); h109.add(g);   // (as the game has it: scene > h109 > h131-frame)
  assert.equal(frameAway(root, true), true); assert.equal(g.visible, false);
  frameAway(root, false); assert.equal(g.visible, true);
  g.visible = false; frameAway(root, false); assert.equal(g.visible, false, 'stage 09 never shows what it did not hide');
  assert.equal(frameAway(new THREE.Group(), true), false, 'no stage 08 frame: nothing to do');
});

test('the world lane calls it on every tick, on init and on rest, by the block state and the strip\'s clean film', async () => {
  const { readFileSync } = await import('node:fs');
  const W = readFileSync(new URL('../src/game/h132/world.js', import.meta.url), 'utf8');
  assert.equal((W.match(/frameAwayNow\(X\)/g) || []).length, 4);
  assert.match(W, /away = at\(blk, 'bare'\) \|\| \(!!SH9\.clear/);
  assert.match(W, /frameAway\(X\.scene \|\| X\.props\.root, away\);/);
  assert.match(W, /siteStakesAway\(X\.props\.root, away, X\.props\.geo && X\.props\.geo\.stake\);/);
});

test('stage 08\'s corner stakes (h131-site, the props\' stake): out with the frame from bare on, back before it; the yesod and the rest stay', () => {
  const root = new THREE.Group(), site = new THREE.Group(); site.name = 'h131-site'; root.add(site);
  const geo = new THREE.CylinderGeometry(0.1, 0.1, 1), other = new THREE.BoxGeometry(1, 1, 1), M = new THREE.MeshBasicMaterial();
  const st = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(geo, M); site.add(m); return m; });
  const yesod = new THREE.Group(); yesod.name = 'h131-yesod'; site.add(yesod); const rock = new THREE.Mesh(other, M); site.add(rock);
  assert.equal(siteStakesAway(root, true, geo), 4); assert.ok(st.every((m) => !m.visible)); assert.equal(yesod.visible, true); assert.equal(rock.visible, true);
  siteStakesAway(root, false, geo); assert.ok(st.every((m) => m.visible));
  st[0].visible = false; siteStakesAway(root, false, geo); assert.equal(st[0].visible, false, 'never shows what it did not hide');
  assert.equal(siteStakesAway(new THREE.Group(), true, geo), 0); assert.equal(siteStakesAway(root, true, null), 0);
});
