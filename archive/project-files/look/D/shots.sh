#!/bin/bash
# shots.sh OUTDIR PAGE [after] scenario... — the round-C shot set, one browser at a time (960 × 600, noon forced, 'normal')
S=/tmp/claude-0/-home-user/dd533389-08bf-5464-8305-7a5ac2343469/scratchpad/roundD
OUT=$1; PAGE=$2; shift 2

mkdir -p $OUT
node $S/mkset.js > /dev/null
for k in "$@"; do
  echo "== $k $(date +%T)"
  PAGE=$PAGE node $S/shoot.cjs $S/set/$k.json $OUT 960 600 2>&1 | grep -v "^\[.*bot " | tail -40 | cut -c1-3000
done
echo "== end $(date +%T)"
