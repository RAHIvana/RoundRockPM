#!/usr/bin/env python3
"""
Copy public/ to an output folder with site-absolute paths ("/assets/x.css")
rewritten to relative ("assets/x.css").

GitHub Pages serves a project repo at https://<user>.github.io/<repo>/, so a
link to "/assets/..." would resolve to the wrong place. The real site on your
own domain is served from the root and uses absolute paths, so this rewrite
happens only when building the Pages preview — the files in public/ are never
modified.

    python tools/make_relative.py public _site
"""
import pathlib
import re
import shutil
import sys

REWRITE_EXT = {".html", ".js"}


def main(src_dir: str, out_dir: str) -> int:
    src = pathlib.Path(src_dir)
    out = pathlib.Path(out_dir)
    if not src.is_dir():
        print(f"error: {src} is not a directory", file=sys.stderr)
        return 1

    if out.exists():
        shutil.rmtree(out)
    shutil.copytree(src, out)

    # Pages would otherwise run Jekyll over the output.
    (out / ".nojekyll").write_text("", encoding="utf-8")

    changed = 0
    for path in out.rglob("*"):
        if not path.is_file() or path.suffix not in REWRITE_EXT:
            continue
        text = original = path.read_text(encoding="utf-8")

        # How far this file sits below the output root, e.g. assets/js/x.js -> "../../".
        #
        # This applies to HTML only. A URL inside a .js file is resolved against the
        # PAGE that loaded the script, not against the script's own location, and every
        # page here lives at the top level — so JavaScript gets no prefix at all.
        # (If pages are ever added in subfolders, these JS URLs need rethinking.)
        if path.suffix == ".js":
            prefix = ""
        else:
            depth = len(path.relative_to(out).parts) - 1
            prefix = "../" * depth

        text = text.replace('href="/"', f'href="{prefix}index.html"')
        text = re.sub(r'(href|src)="/(?!/)', rf'\1="{prefix}', text)      # not protocol-relative
        for literal in (
            "/assets/data/properties.json",
            "/assets/data/commercial.json",
            "/listings.html",
            "/contact.html#form",
        ):
            text = text.replace(f'"{literal}"', f'"{prefix}{literal.lstrip("/")}"')
            text = text.replace(f"'{literal}'", f"'{prefix}{literal.lstrip('/')}'")

        if text != original:
            path.write_text(text, encoding="utf-8")
            changed += 1

    leftovers = []
    for path in out.rglob("*"):
        if path.is_file() and path.suffix in REWRITE_EXT:
            for m in re.finditer(r'(?:href|src)="/(?!/)[^"]*"', path.read_text(encoding="utf-8")):
                leftovers.append(f"{path.relative_to(out)}: {m.group(0)}")

    print(f"built {out} from {src} — rewrote {changed} files")
    if leftovers:
        print("WARNING, absolute references remain:", file=sys.stderr)
        for item in leftovers[:20]:
            print("  " + item, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    args = sys.argv[1:]
    raise SystemExit(main(args[0] if args else "public", args[1] if len(args) > 1 else "_site"))
