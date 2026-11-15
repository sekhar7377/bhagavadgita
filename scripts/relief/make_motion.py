"""Paint a motion map for a living-relief panel.

Usage: python -I scripts/relief/make_motion.py scripts/relief/motion.json

The JSON maps panel names to lists of regions. Each region has a kind:
sway (banners, cloth), flicker (fire), or drift (dust, smoke, clouds). It
also has either a rect [x0, y0, x1, y1] or a poly [[x, y], ...] in 0..1
image coordinates (y down), an optional strength (default 1) and an
optional soft edge (default 0.02).

Output is public/relief/NAME-motion.png at the height-map size (1152x576).
Each kind is written to its own channel (R sway, G flicker, B drift), with
blurred edges so the motion fades into the still carving.
"""

import json
import sys

import cv2
import numpy as np

W, H = 1152, 576
CHANNEL = {"sway": 2, "flicker": 1, "drift": 0}  # OpenCV writes BGR


def paint(regions):
    out = np.zeros((H, W, 3), np.float32)
    for region in regions:
        layer = np.zeros((H, W), np.float32)
        if "rect" in region:
            x0, y0, x1, y1 = region["rect"]
            cv2.rectangle(
                layer,
                (int(x0 * W), int(y0 * H)),
                (int(x1 * W), int(y1 * H)),
                1.0,
                -1,
            )
        else:
            points = np.array(
                [[int(x * W), int(y * H)] for x, y in region["poly"]], np.int32
            )
            cv2.fillPoly(layer, [points], 1.0)
        soft = max(1, int(region.get("soft", 0.02) * W)) | 1
        layer = cv2.GaussianBlur(layer, (soft * 2 + 1, soft * 2 + 1), soft)
        channel = CHANNEL[region["kind"]]
        out[:, :, channel] = np.maximum(
            out[:, :, channel], layer * region.get("strength", 1.0)
        )
    return (np.clip(out, 0, 1) * 255).astype(np.uint8)


def main():
    spec = json.load(open(sys.argv[1], encoding="utf8"))
    for name, regions in spec.items():
        cv2.imwrite(f"public/relief/{name}-motion.png", paint(regions))
        print("motion", name)


if __name__ == "__main__":
    main()
