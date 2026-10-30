#!/usr/bin/env bash
# brun — the browser queue (recreated in recovery R1, 21.10.2026; the old /home/claude/wt/bus/brun was lost with the container).
# One browser job at a time machine-wide (flock on /home/claude/wt/bus/lock), cut at 10 minutes, every run logged.
#   usage:  /home/claude/wt/bus/brun <cmd> [args…]        (launch it with run_in_background; poll the log)
#   env:    BRUN_TIMEOUT  seconds, default 600, capped at 600
#           BRUN_TAG      a name for the log file (default: the command's basename + its first argument's)
#   logs:   /home/claude/wt/bus/logs/<UTC stamp>-<pid>-<tag>.log  (stdout+stderr of the job, plus a header and the exit line)
#           /home/claude/wt/bus/logs/history.tsv              (one line per job: queued, started, ended, rc, seconds, cwd, cmd)
# The lock is taken by flock(1) with -o, so a browser that outlives its job never keeps the queue locked.
# Install: cp recovery/tools/brun.sh /home/claude/wt/bus/brun && chmod +x /home/claude/wt/bus/brun
set -u
BUS=/home/claude/wt/bus
LOGS="$BUS/logs"
mkdir -p "$LOGS"
[ $# -ge 1 ] || { echo "usage: brun <cmd> [args…]" >&2; exit 2; }
T=${BRUN_TIMEOUT:-600}
case "$T" in ''|*[!0-9]*) T=600;; esac
[ "$T" -gt 600 ] && T=600
export NODE_PATH=${NODE_PATH:-/home/claude/.npm-global/lib/node_modules}
export PLAYWRIGHT_BROWSERS_PATH=${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}
q=$(date -u +%Y%m%dT%H%M%SZ)
tag=${BRUN_TAG:-$(basename "$1")-$(basename "${2:-_}")}
tag=${tag//[^A-Za-z0-9._-]/_}
log="$LOGS/$q-$$-$tag.log"
printf '# brun queued %s pid %s cwd %s timeout %ss\n# cmd: %s\n' "$q" "$$" "$PWD" "$T" "$*" >> "$log"
echo "brun: log $log"
qs=$(date +%s)
flock -o "$BUS/lock" bash -c '
  log=$1; T=$2; shift 2
  printf "# start %s\n" "$(date -u +%H:%M:%SZ)" >> "$log"
  timeout --kill-after=15 "$T" "$@" >> "$log" 2>&1
  rc=$?
  [ $rc -eq 124 ] && printf "# CUT at %ss (brun timeout)\n" "$T" >> "$log"
  exit $rc
' brun-job "$log" "$T" "$@"
rc=$?
es=$(date +%s)
printf '# end %s rc %s (%s s incl. queue)\n' "$(date -u +%H:%M:%SZ)" "$rc" "$((es-qs))" >> "$log"
printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$q" "$(date -u +%H:%M:%SZ)" "$rc" "$((es-qs))" "$PWD" "$*" >> "$LOGS/history.tsv"
tail -n 40 "$log"
exit $rc
