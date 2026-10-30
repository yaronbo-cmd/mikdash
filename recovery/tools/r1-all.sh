#!/usr/bin/env bash
# recovery R1 — regenerate everything under recovery/work/ from the build-15 tree and recovery/build26c.min.html.
# Deterministic (same esbuild 0.28.2 from the repo, prettier/acorn from /home/claude/tools-npm). No browser.
#   bash recovery/tools/r1-all.sh            (≈ 2 min; prettier is the slow part)
set -euo pipefail
R=/home/claude/temple3d; T=$R/recovery/tools; W=$R/recovery/work
export NODE_PATH=/home/claude/.npm-global/lib/node_modules
mkdir -p "$W"; cd "$R"
node build.mjs                                   # dist/ of build 15 (dist/ is gitignored)
node "$T/build-marked.mjs" "$R" recovery/work/b15   # app.min.js (== dist/app.js), app.marked.js, app.names.js
python3 -I "$T/mkout15.py"                        # build 15 as the owner's out/index.html (title, __FORCE_SHIFT)
node "$T/extract.mjs" recovery/build26c.min.html "$W/x26c" > "$W/x26c.summary.json"
node "$T/extract.mjs" "$W/build15.out.html" "$W/x15" > "$W/x15.summary.json"
node "$T/cssdiff.mjs" "$W/x15" "$W/x26c" > "$W/cssdiff.md"
python3 -I - "$W" <<'PY'
import re, sys
W = sys.argv[1] + '/'
s = open(W + 'b15/app.names.js', encoding='utf-8').read()
s2 = re.sub(r'"data:application/octet-stream;base64,[A-Za-z0-9+/=]+"', '"__R1_ASSET_3275224f85ea__"', s, count=1)
assert s2 != s; open(W + 'b15/app.names.stub.js', 'w', encoding='utf-8').write(s2)
PY
cd "$W"
node --max-old-space-size=6000 "$T/units.mjs" b15/app.marked.js u15m.json --marked
node --max-old-space-size=6000 "$T/units.mjs" b15/app.names.stub.js u15n.json
node --max-old-space-size=6000 "$T/units.mjs" x15/app.stub.js u15.json
node --max-old-space-size=6000 "$T/units.mjs" x26c/app.stub.js u26c.json
python3 -I "$T/modmap.py" > modmap.txt
node --max-old-space-size=6000 "$T/moddiff.mjs" && python3 -I "$T/moddiff.py" > moddiff.txt
python3 -I "$T/symmap.py" > symmap.txt
node --max-old-space-size=7000 "$T/annotate.mjs"
cd "$R" && node --max-old-space-size=8000 "$T/parity.mjs" --all --json "$W/parity-all.json" > "$W/parity-all.txt" || true   # (R2: the recovery column)
python3 -I "$T/report.py" "$R/recovery/R1-map.md" || true
sha256sum "$W/p26c.pretty.js" "$W/p15.pretty.js" "$W/x26c/app.min.js" "$W/x15/app.min.js"
