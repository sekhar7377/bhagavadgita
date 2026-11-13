"""Remove the visible generator sparkle from the bottom-right corner of a render.

Usage: python scripts/relief/clean_mark.py IN.png OUT.png

Gemini stamps a small four-pointed sparkle near the bottom-right corner. The
sculpture never reaches that corner, so the mark sits on bare wall: find
pixels that stand out from the local wall tone and inpaint them from their
surroundings. (This only removes the visible logo; it does not touch any
invisible provenance watermark.)
"""

import sys
import cv2
import numpy as np

src, dst = sys.argv[1:3]
img = cv2.imread(src, cv2.IMREAD_COLOR)
h, w = img.shape[:2]
# The mark sits within ~12% of the short side from the corner.
s = int(min(h, w) * 0.16)
roi = img[h - s :, w - s :]
grey = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY).astype(np.float32)
background = cv2.medianBlur(grey.astype(np.uint8), 2 * (s // 6) + 1).astype(np.float32)
diff = np.abs(grey - background)
mask = (diff > 6).astype(np.uint8)
# Keep only the largest blob: the sparkle, not plaster grain.
n, labels, stats, _ = cv2.connectedComponentsWithStats(mask, 8)
if n > 1:
    biggest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    mask = (labels == biggest).astype(np.uint8)
    mask = cv2.dilate(mask, np.ones((9, 9), np.uint8))
    full = np.zeros((h, w), np.uint8)
    full[h - s :, w - s :] = mask * 255
    img = cv2.inpaint(img, full, 9, cv2.INPAINT_TELEA)
    print("removed mark, pixels:", int(mask.sum()))
else:
    print("no mark found")
cv2.imwrite(dst, img)
