#!/usr/bin/env python3
"""Assemble the GitHub Pages site: main's tree at the root (the approved game),
and every build-* branch's index.html at v/<name>/ (build-88 -> v/88/), with a
list page at v/ and v/heads.txt (the branch heads that were published).

    git fetch --depth=1 origin '+refs/heads/build-*:refs/remotes/origin/build-*'
    python3 .github/versions/build_site.py _site [--heads-only]

--heads-only prints what v/heads.txt would hold and writes nothing (the
scheduled run compares it with the live one to skip a deploy that changes
nothing).
"""
import html
import os
import re
import subprocess
import sys


def git(*args, binary=False):
    out = subprocess.run(["git", *args], check=True, capture_output=True).stdout
    return out if binary else out.decode("utf-8", "replace")


def branches():
    refs = git("for-each-ref", "--format=%(refname:short) %(objectname)",
               "refs/remotes/origin/build-*").split("\n")
    res = []
    for line in filter(None, refs):
        ref, sha = line.split()
        name = ref.split("/build-", 1)[1]
        if not re.fullmatch(r"[0-9A-Za-z._-]+", name):
            continue
        res.append((name, ref, sha))
    return res


def sort_key(name):
    m = re.match(r"(\d+)(.*)", name)
    return (1, int(m.group(1)), m.group(2)) if m else (0, 0, name)


def label(name):
    m = re.fullmatch(r"(\d+)(b|c)?", name)
    if m:
        return "בנייה " + m.group(1) + {"b": "ב", "c": "ג", None: ""}[m.group(2)]
    if name.startswith("beta"):
        return "בטא " + name[4:] + " (המשחק הדו־ממדי)"
    return name


def heads_text(found):
    main = git("rev-parse", "HEAD").strip()
    lines = [f"main {main}"] + [f"build-{n} {sha}" for n, _, sha in found]
    return "\n".join(lines) + "\n"


def main():
    out = sys.argv[1]
    found = sorted(branches(), key=lambda b: sort_key(b[0]))
    if "--heads-only" in sys.argv:
        sys.stdout.write(heads_text(found))
        return

    os.makedirs(out, exist_ok=True)
    # the root: main's tree, as the site always was
    tar = subprocess.Popen(["git", "archive", "HEAD"], stdout=subprocess.PIPE)
    subprocess.run(["tar", "-x", "-C", out], stdin=tar.stdout, check=True)
    tar.wait()
    live_blob = git("rev-parse", "HEAD:index.html").strip()

    rows = []
    for name, ref, sha in found:
        try:
            blob = git("rev-parse", f"{ref}:index.html").strip()
        except subprocess.CalledProcessError:
            print(f"skip build-{name}: no index.html", file=sys.stderr)
            continue
        page = git("cat-file", "blob", blob, binary=True)
        d = os.path.join(out, "v", name)
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, "index.html"), "wb") as f:
            f.write(page)
        m = re.search(rb"<title>(.*?)</title>", page[:200000], re.S)
        title = html.unescape(m.group(1).decode("utf-8", "replace")) if m else ""
        title = re.sub(r"\s*—\s*בית המקדש השני\s*$", "", title)
        title = re.sub(r"^(משמרת \d+ \()?בנייה [^—)]*\)?\s*(—\s*)?", "", title)
        date = git("log", "-1", "--format=%cs", ref).strip()
        rows.append((name, title, date, blob == live_blob))
        print(f"v/{name}/  {date}  {title}")

    items = []
    for name, title, date, live in reversed(rows):
        live_tag = '<span class="live">באתר הראשי</span>' if live else ""
        items.append(
            f'<li><a href="{name}/"><b>{html.escape(label(name))}</b>{live_tag}'
            f'<span class="t">{html.escape(title)}</span></a>'
            f'<span class="m">{date} · ענף build-{html.escape(name)}</span></li>')
    page = INDEX.replace("{{ITEMS}}", "\n".join(items)).replace("{{N}}", str(len(rows)))
    with open(os.path.join(out, "v", "index.html"), "w", encoding="utf-8") as f:
        f.write(page)
    with open(os.path.join(out, "v", "heads.txt"), "w", encoding="utf-8") as f:
        f.write(heads_text(found))


INDEX = """<!doctype html>
<html lang="he" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>כל הגרסאות — בית המקדש</title>
<style>
:root{--bg:#f7f3ea;--fg:#2b2418;--mut:#7a6d58;--card:#fffdf8;--line:#e3dac8;--acc:#8a5a14;--live:#2f7d32}
@media (prefers-color-scheme:dark){:root{--bg:#1c1914;--fg:#efe7d8;--mut:#a89a82;--card:#26221b;--line:#3a3328;--acc:#e0b060;--live:#7cc47f}}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,"Segoe UI",Arial,sans-serif}
main{max-width:720px;margin:0 auto;padding:20px 16px 40px}
h1{font-size:1.5rem;margin:0 0 4px}p{color:var(--mut);margin:0 0 16px}
ul{list-style:none;padding:0;margin:0;display:grid;gap:8px}
li{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 14px}
li a{color:var(--fg);text-decoration:none;display:block}li a b{color:var(--acc);font-size:1.1rem}
.t{display:block}.m{display:block;color:var(--mut);font-size:.85rem}
.live{margin-inline-start:8px;font-size:.8rem;color:var(--live);border:1px solid var(--live);border-radius:99px;padding:0 8px}
</style></head><body><main>
<h1>כל הגרסאות של המשחק</h1>
<p>{{N}} גרסאות. כל אחת היא ענף משלה ב־GitHub, והקישור פותח אותה כמו שהייתה. <a href="../">לאתר הראשי</a></p>
<ul>
{{ITEMS}}
</ul></main></body></html>
"""

if __name__ == "__main__":
    main()
