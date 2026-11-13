#!/usr/bin/env sh
# Build one scene wall from a plaster render: depth on the GPU, then bake.
# Usage: sh scripts/relief/make_scene.sh NAME SOURCE.png
set -e
name="$1"; src="$2"
python -I scripts/relief/estimate_depth.py models/depth-anything-v2-large.onnx "$src" "models/$name.npy" 1022
python -I - "$name" "$src" <<'PY'
import sys, json, numpy as np, cv2
name, src = sys.argv[1:3]
d = np.load(f"models/{name}.npy"); d = (d - d.min()) / (d.max() - d.min())
cv2.imwrite(f"docs/relief-sources/{name}-depth.png", (d * 65535).astype(np.uint16))
cv2.imwrite(f"docs/relief-sources/{name}-luma.png", cv2.imread(src, 0))
json.dump({"name": name, "wall": [2304, 1152], "elements": [{
    "name": name, "depth": f"docs/relief-sources/{name}-depth.png",
    "luma": f"docs/relief-sources/{name}-luma.png", "separation": "full",
    "sink": {"bottom": [0.9, 0.1], "left": 0.07, "top": 0.08, "right": 0.16},
    "height": 1.0, "anchor": [0.5, 0.5], "pivot": [0.5, 0.5], "gain": 1.0,
    "paint": 1.0, "paint_contrast": 1.1}]}, open(f"scripts/relief/{name}.json", "w"), indent=2)
PY
python -I scripts/relief/build_relief.py "scripts/relief/$name.json" public/relief "models/$name-preview.png"
python -I -c "from PIL import Image; Image.open('models/$name-preview.png').convert('RGB').resize((1920,960), Image.LANCZOS).save('public/relief/$name-fallback.webp', quality=82, method=6)"
echo "built $name"
