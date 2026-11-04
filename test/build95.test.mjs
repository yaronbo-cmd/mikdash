// build 95: stage 06's voyage (מסע הדלתות) with real people (the owner, 3.11, on build 76: "שוב גלילים" and the voyage's poor look): the
// sailors and Nicanor are people88's figures standing on figure49's places, with their own walk, push and kneel; the ship's timbers in the
// kit's wood with the grain along the planks. The voyage's play is as in build 49. Never a Divine Name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('build 95: the voyage — people88 figures over figure49 anchors, the kit wood, the shared shapes kept at the end', async () => {
  const { GAME_BUILD } = await import('../src/avodah/shift/lobby35.js');
  assert.equal(GAME_BUILD, 97);
  const v = read('src/game/voyage49.js'), h = read('src/game/har42.js');
  assert.match(v, /function cast95\(dt\)/); assert.match(v, /cast95\(dt\);/);
  assert.match(v, /ctx\.figs \? ctx\.figs\(\) : null/, 'the figures come from the act (figs84), not drawn as cylinders');
  assert.match(v, /sailors\.forEach\(\(a\) => \{ a\.visible = false; \}\); nic\.visible = false;/, 'the old cylinder people hidden once the real ones stand');
  assert.match(v, /for \(const f of \[cast\.nic, \.\.\.cast\.sail\]\) if \(f && f\.root\.parent\) f\.root\.parent\.remove\(f\.root\);/, 'removed before the voyage disposes its shapes');
  assert.match(h, /createVoyage49\(\{[^\n]*figs: figs84, wood: ON88 \? P88w\.wood88 : null, grain: ON88 \? P88w\.grain88 : null/);
  assert.ok(v.indexOf('for (const f of [cast.nic') < v.indexOf("G.traverse((o) => { try { if (o.geometry) o.geometry.dispose()"));
});
