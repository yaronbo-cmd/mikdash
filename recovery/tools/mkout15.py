#!/usr/bin/env python3
"""Make build 15's equivalent of the owner's out/index.html (the file 26c was delivered as):
dist/play.html + the __FORCE_SHIFT head script + the title "משמרת 45 (בנייה 15) — בית המקדש השני".
The 26c file's head script is copied byte for byte from recovery/build26c.min.html, so the two pages differ only by the game.
usage: python3 -I recovery/tools/mkout15.py [dist/play.html] [recovery/work/build15.out.html]"""
import re, sys
root = '/home/claude/temple3d/'
src = sys.argv[1] if len(sys.argv) > 1 else root + 'dist/play.html'
dst = sys.argv[2] if len(sys.argv) > 2 else root + 'recovery/work/build15.out.html'
ref = open(root + 'recovery/build26c.min.html', encoding='utf-8').read()
force = re.search(r'<head>(<script>globalThis\.__FORCE_SHIFT.*?</script>)', ref).group(1)
s = open(src, encoding='utf-8').read()
assert s.count('<head>') >= 1 and '__FORCE_SHIFT=true' not in s[:600]
s = s.replace('<head>', '<head>' + force, 1)
s = re.sub(r'<title>.*?</title>', '<title>משמרת 45 (בנייה 15) — בית המקדש השני</title>', s, count=1)
open(dst, 'w', encoding='utf-8').write(s)
print(dst, len(s.encode('utf-8')), 'bytes')
