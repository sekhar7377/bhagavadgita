"""Static site check: every page's links, anchors, images and carving assets.

Usage: python -I scripts/check_site.py   (exit code 1 if anything is wrong)
"""

import os
import re
import sys

PAGES = [
    "index.html",
    "hastinapura/index.html",
    "sabha/index.html",
    "vana/index.html",
    "kurukshetra/index.html",
    "svarga/index.html",
]


def main():
    problems = []
    ids = {p: set(re.findall(r'\bid="([^"]+)"', open(p, encoding="utf8").read())) for p in PAGES}
    for page in PAGES:
        text = open(page, encoding="utf8").read()
        base = os.path.dirname(page)
        for scene in set(re.findall(r'data-scene="([a-z0-9-]+)"', text)):
            for suffix in ["-height.png", "-stage1.webp", "-stage5.webp", "-fallback.webp"]:
                if not os.path.exists(f"public/relief/{scene}{suffix}"):
                    problems.append(f"missing carving asset {page}: {scene}{suffix}")
        for tag in re.findall(r"<[^>]*data-scene=[^>]*>", text, re.S):
            scene = re.search(r'data-scene="([^"]+)"', tag).group(1)
            if "data-motion" in tag and not os.path.exists(f"public/relief/{scene}-motion.png"):
                problems.append(f"missing motion map {page}: {scene}")
            if "data-video" in tag and not os.path.exists(f"public/relief/{scene}-video.mp4"):
                problems.append(f"missing video {page}: {scene}")
        for href in re.findall(r'href="([^"]+)"', text):
            if href.startswith(("http", "mailto")):
                continue
            path, _, fragment = href.partition("#")
            target = page
            if path:
                target = os.path.normpath(os.path.join(base, path)).replace(os.sep, "/")
                if not target.endswith(".html"):
                    target = (target + "/index.html").lstrip("./") if target != "." else "index.html"
                if not os.path.exists(target) and not os.path.exists("public/" + path.lstrip("/")):
                    problems.append(f"broken link {page}: {href}")
                    continue
            if fragment and fragment not in ids.get(target, set()):
                problems.append(f"broken anchor {page}: {href}")
        for src in [s for s in re.findall(r'src="(/[^"]+)"', text) if not s.endswith(".ts")]:
            if not os.path.exists("public" + src):
                problems.append(f"missing image {page}: {src}")
        all_ids = re.findall(r'\bid="([^"]+)"', text)
        for dup in sorted({i for i in all_ids if all_ids.count(i) > 1}):
            problems.append(f"duplicate id {page}: {dup}")
        for img in re.findall(r"<img[^>]*>", text, re.S):
            if "alt=" not in img:
                problems.append(f"image without alt {page}")
    for problem in problems:
        print(problem)
    print(f"{len(problems)} problems")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
