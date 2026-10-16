#!/bin/bash
# PRODUCER14: two produce-play runs side by side in ONE brun ticket (the producer lane gives one ticket per ~22 min; tonight's
# plays need two). Each argument is one run's produce-play arguments; each writes test/out/produce/<tag>.out.
#   BRUN_LANE=producer /home/claude/wt/bus/brun bash test/produce-pair14.sh "--tag=pb1 …" "--tag=pb2 …"
cd /home/claude/wt/producer14 || exit 1
export NODE_PATH=/home/claude/.npm-global/lib/node_modules
pids=()
for a in "$@"; do
  tag=$(echo "$a" | grep -o -- '--tag=[^ ]*' | cut -d= -f2)
  # shellcheck disable=SC2086
  node test/produce-play.cjs $a > "test/out/produce/${tag}.out" 2>&1 &
  pids+=($!)
  sleep 8   # (the two boots apart: the second boot does not slow the first one's first shots)
done
for p in "${pids[@]}"; do wait "$p"; done
