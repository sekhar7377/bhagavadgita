"""Turn a short plaster-relief video into a moving carving for the wall.

Usage: python -I scripts/relief/make_video_relief.py NAME VIDEO.mp4 [long_side]

For every frame, Depth Anything V2 (ONNX, on the GPU when available)
estimates depth, smoothed over time so the carving does not flicker. The
output, public/relief/NAME-video.mp4, stacks two halves: the frame's own
plaster shading on top and its height below, so one <video> element keeps
both in sync. The clip runs forward once; the page plays it a single time
and holds the last frame, so it never rocks back and forth.
"""

import subprocess
import sys
import tempfile
from pathlib import Path

import cv2
import numpy as np
import onnxruntime as ort

MODEL = "models/depth-anything-v2-large.onnx"
OUT_W, OUT_H = 1024, 512  # each half; the stacked video is 1024x1024


def main():
    name, video = sys.argv[1:3]
    long_side = int(sys.argv[3]) if len(sys.argv) > 3 else 700
    capture = cv2.VideoCapture(video)
    frames = []
    while True:
        ok, frame = capture.read()
        if not ok:
            break
        frames.append(frame)
    print("frames", len(frames))

    preferred = ["CUDAExecutionProvider", "DmlExecutionProvider", "CPUExecutionProvider"]
    providers = [p for p in preferred if p in ort.get_available_providers()]
    session = ort.InferenceSession(MODEL, providers=providers)
    print("providers", session.get_providers())

    h, w = frames[0].shape[:2]
    s = long_side / max(w, h)
    tw, th = round(w * s / 14) * 14, round(h * s / 14) * 14
    depths = []
    for index, frame in enumerate(frames):
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        x = cv2.resize(rgb, (tw, th), interpolation=cv2.INTER_CUBIC).astype(np.float32) / 255
        x = (x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
        x = x.transpose(2, 0, 1)[None].astype(np.float32)
        d = session.run(None, {session.get_inputs()[0].name: x})[0].squeeze()
        depths.append(cv2.resize(d.astype(np.float32), (OUT_W, OUT_H), interpolation=cv2.INTER_CUBIC))
        if index % 10 == 0:
            print("depth", index)

    stack = np.stack(depths)
    # One normalisation for the whole clip, robust to outliers, so heights
    # mean the same thing in every frame.
    lo, hi = np.percentile(stack, 1), np.percentile(stack, 99.5)
    stack = np.clip((stack - lo) / (hi - lo), 0, 1)
    # Temporal smoothing (centred moving average) removes depth flicker.
    smoothed = np.empty_like(stack)
    for i in range(len(stack)):
        a, b = max(0, i - 2), min(len(stack), i + 3)
        smoothed[i] = stack[a:b].mean(0)

    tmp = Path(tempfile.mkdtemp())
    order = list(range(len(frames)))
    for out_index, i in enumerate(order):
        shade = cv2.cvtColor(frames[i], cv2.COLOR_BGR2GRAY)
        shade = cv2.resize(shade, (OUT_W, OUT_H), interpolation=cv2.INTER_AREA)
        height = (smoothed[i] * 255).astype(np.uint8)
        cv2.imwrite(str(tmp / f"f{out_index:04d}.png"), np.vstack([shade, height]))
    out = f"public/relief/{name}-video.mp4"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-framerate", "16", "-i", str(tmp / "f%04d.png"),
         "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "slow",
         "-movflags", "+faststart", out],
        check=True,
    )
    print("built", out)


if __name__ == "__main__":
    main()
