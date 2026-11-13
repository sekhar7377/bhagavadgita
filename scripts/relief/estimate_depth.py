"""Estimate relative depth for an original artwork with Depth Anything V2 (ONNX).

Usage: python3 scripts/relief/estimate_depth.py MODEL.onnx IMAGE OUT.npy [long_side]
The model (onnx-community/depth-anything-v2-large, onnx/model.onnx) is not
committed; download it from Hugging Face. Output is float32 inverse depth
(larger = nearer), resampled to the source image size.
"""
import sys
import numpy as np
import onnxruntime as ort
from PIL import Image

model, src, out = sys.argv[1:4]
long_side = int(sys.argv[4]) if len(sys.argv) > 4 else 1526
im = Image.open(src).convert("RGB")
w, h = im.size
s = long_side / max(w, h)
tw, th = (round(w * s / 14) * 14, round(h * s / 14) * 14)
x = np.asarray(im.resize((tw, th), Image.BICUBIC), np.float32) / 255
x = (x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
x = x.transpose(2, 0, 1)[None].astype(np.float32)
# Prefer a GPU when the installed runtime has one (onnxruntime-directml on
# Windows, onnxruntime-gpu with CUDA); the CPU fallback needs ~6 GB free RAM.
preferred = ["CUDAExecutionProvider", "DmlExecutionProvider", "CPUExecutionProvider"]
providers = [p for p in preferred if p in ort.get_available_providers()]
sess = ort.InferenceSession(model, providers=providers)
print("providers:", sess.get_providers())
d = sess.run(None, {sess.get_inputs()[0].name: x})[0].squeeze().astype(np.float32)
d = np.asarray(Image.fromarray(d).resize((w, h), Image.BICUBIC), np.float32)
np.save(out, d)
print(d.shape, float(d.min()), float(d.max()))
