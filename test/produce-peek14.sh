#!/bin/bash
# PRODUCER14: the throwaway merge — wt/peek14 = master + s14-econ + s14-games + s14-site + s14-fun, built, the test page pinned
#   bash test/produce-peek14.sh peekA          → test/out/produce/builds/peekA.html (+ peekA.heads: each branch's head and size)
# A branch that conflicts is left out of the merge (logged CONFLICT with its files), the others still merge. Nothing is pushed;
# the worktree is detached and re-made every time.
NAME=${1:?usage: produce-peek14.sh <peek name>}
ME=/home/claude/wt/producer14
P=/home/claude/wt/peek14
OUTB=$ME/test/out/produce/builds
mkdir -p "$OUTB"
cd "$ME" || exit 1
git worktree remove --force "$P" 2>/dev/null; rm -rf "$P"; git worktree prune
git worktree add --detach "$P" master >/dev/null 2>&1 || { echo "worktree add failed"; exit 1; }
cd "$P" || exit 1
ln -sfn /home/claude/temple3d/node_modules node_modules
HEADS="master $(git rev-parse --short master)"
for b in s14-econ s14-games s14-site s14-fun; do
  h=$(git rev-parse --short "$b")
  if git merge --no-edit -q -m "peek14: $b" "$b" >/dev/null 2>&1; then HEADS="$HEADS · $b $h"
  else
    CF=$(git diff --name-only --diff-filter=U | tr '\n' ' '); git merge --abort
    # (a throwaway merge: two fences added at one spot conflict textually — keep both sides, then the build says if it holds)
    if git -c core.attributesFile="$ME/test/produce-peek14.attrs" merge --no-edit -q -m "peek14: $b (union)" "$b" >/dev/null 2>&1; then echo "CONFLICT $b ($h) in $CF— merged as a union of both sides"; HEADS="$HEADS · $b $h (union: $CF)"
    else echo "CONFLICT $b ($h): $CF"; git merge --abort; HEADS="$HEADS · $b $h CONFLICT"; fi
  fi
done
# (the union's known doubles: a line both sides changed is kept twice — the later, older copy is dropped)
if grep -q "say: ringSay" src/game/ui.js 2>/dev/null; then sed -i '/^    ring: { start: ringStart, stop: ringStop, hit: ringHit }, setWhole,$/d' src/game/ui.js; fi
export NODE_PATH=/home/claude/.npm-global/lib/node_modules
node build.mjs 2>&1 | grep -E "built|WARN|rror|Duplicate" | head -8
cp dist/test.html "$OUTB/$NAME.html" && echo "pinned $OUTB/$NAME.html ($(stat -c %s dist/temple3d.html) bytes temple3d)"
echo "$(date -u +%H:%M) $NAME: $HEADS · temple3d $(stat -c %s dist/temple3d.html)" | tee -a "$OUTB/peeks.txt"
