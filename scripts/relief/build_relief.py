"""Turn an estimated depth map of the original Kurukṣetra artwork into the
bas-relief data the opening wall renders.

Usage: python3 scripts/relief/build_relief.py DEPTH.npy ARTWORK.png OUT_DIR [PREVIEW.png]

Writes into OUT_DIR:
  kurukshetra-height.png   R,G = 16-bit height (hi, lo), half resolution
  kurukshetra-stage1..5.webp  baked lighting at 20/40/60/80/100% extrusion
  plaster.webp            tileable mineral texture (G is sampled)
  noise.png               tileable smooth noise used by the reveal field

Everything is derived from this project's own generated artwork. No reference
site model, texture or film frame is used.
"""

import sys
import numpy as np
import cv2
from PIL import Image

depth_path, art_path, out_dir = sys.argv[1:4]
preview_path = sys.argv[4] if len(sys.argv) > 4 else None

W, H = 2304, 1152  # wall canvas, 2:1
LIGHT = np.array([-0.55, 0.62])  # direction toward the light in wall space (x right, y up)
LIGHT /= np.linalg.norm(LIGHT)


def blur(a, s):
    return cv2.GaussianBlur(a, (0, 0), s, borderType=cv2.BORDER_REFLECT)


# --- 1. subject separation -------------------------------------------------
d = np.load(depth_path).astype(np.float32)
d = np.clip(d, 0, None)
h0, w0 = d.shape
art = np.asarray(Image.open(art_path).convert("L"), np.float32) / 255

# The ground plane's inverse depth grows towards the bottom of the frame.
# Estimate it per row from the right-hand third, where only terrain is visible,
# then keep what stands clearly in front of that plane.
ground_row = np.median(d[:, int(w0 * 0.80) :], axis=1)
ground_row = np.maximum.accumulate(blur(ground_row[:, None], 9)[:, 0])
ground = ground_row[:, None] * np.ones((1, w0), np.float32)
excess = d - ground * 1.06 - 16
mask = np.clip(excess / 14, 0, 1)
# Drop small disconnected islands (distant banners, terrain bumps).
n, labels, stats, _ = cv2.connectedComponentsWithStats((mask > 0.5).astype(np.uint8), 8)
keep = np.zeros_like(mask)
for i in range(1, n):
    if stats[i, cv2.CC_STAT_AREA] > 2500:
        keep[labels == i] = 1
mask = mask * cv2.dilate(keep, np.ones((5, 5), np.uint8))
# Let the sculpture sink back into the wall along the bottom edge instead of
# ending on a hard cut where the chariot meets the terrain.
yy = np.linspace(0, 1, h0, dtype=np.float32)[:, None]
sink = 1 - np.clip((yy - 0.86) / 0.13, 0, 1) ** 1.5
xx = np.linspace(0, 1, w0, dtype=np.float32)[None, :]
left = np.clip((xx - 0.005) / 0.11, 0, 1)
sink = sink * left * left * (3 - 2 * left)

# --- 2. bas-relief compression ---------------------------------------------
# Relative depth keeps the big forms; local detail is amplified so carving
# reads at shallow depth (the classic bas-relief trade).
dn = d / np.percentile(d[mask > 0.5], 99.5)
low = blur(dn, 22)
mid = blur(dn, 5) - low
fine = dn - blur(dn, 5)
lum_detail = blur(art, 1.0) - blur(art, 5)
# Forms are inflated from their silhouettes so they turn away from the viewer
# at the rim like modelled plaster, instead of standing up as a flat plate.
solid = (mask > 0.5).astype(np.uint8)
inside_dist = cv2.distanceTransform(solid, cv2.DIST_L2, 5)
pillow = np.sqrt(np.clip(1 - (1 - np.clip(inside_dist / 26.0, 0, 1)) ** 2, 0, 1))
form = np.clip(low, 0, 1.1) ** 0.8
height = pillow * (0.16 + 0.62 * form) + pillow**0.5 * (2.3 * mid + 2.9 * fine + 0.11 * lum_detail)
soft = blur(mask, 1.2)
height = np.clip(height, 0, None) * np.clip(soft * 1.3, 0, 1) * sink

# --- 3. place on the wall --------------------------------------------------
scale = 0.84 * H / h0
sw, sh = int(round(w0 * scale)), int(round(h0 * scale))
placed = cv2.resize(height, (sw, sh), interpolation=cv2.INTER_CUBIC)
wall = np.zeros((H, W), np.float32)
ox = int(W * 0.50 - sw * 0.35)
oy = int(H * 0.005)
x0, y0 = max(ox, 0), max(oy, 0)
x1, y1 = min(ox + sw, W), min(oy + sh, H)
wall[y0:y1, x0:x1] = placed[y0 - oy : y1 - oy, x0 - ox : x1 - ox]
wall = np.clip(blur(wall, 0.7), 0, None)
wall /= wall.max()

# --- 4. staged lighting bake -----------------------------------------------
# The runtime never lights the wall live. Like a studio bake, the carving is lit
# offline at five extrusion depths (20% .. 100%) with a soft key light, cast
# shadow and sky occlusion; the shader cross-fades those stages as the field
# raises the geometry. Values are in the wall's tone space: flat plaster = REST.
REST = 0.54504
DEPTH_TEXELS = float(sys.argv[5]) if len(sys.argv) > 5 else 0.62 / 16.08 * W
STEPS = 46
STEP = 2.0


def max_slope(angle):
    """Steepest rise per texel seen from each texel looking along `angle`."""
    dx, dy = np.cos(angle), -np.sin(angle)  # image y points down
    best = np.full_like(wall, -1e3)
    for i in range(1, STEPS):
        t = i * STEP * (1 + i / STEPS)  # denser near, sparser far
        M = np.float32([[1, 0, -dx * t], [0, 1, -dy * t]])
        shifted = cv2.warpAffine(wall, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        best = np.maximum(best, (shifted - wall) / t)
    return best


key_az = np.arctan2(LIGHT[1], LIGHT[0])
KEY_EL = np.radians(40)
key_dirs = [(key_az + np.radians(a), KEY_EL + np.radians(e)) for a, e in ((0, 0), (-14, 3), (14, -3), (-7, -7), (7, 7), (-20, -4), (20, 4))]
key_slopes = [max_slope(az) for az, _ in key_dirs]
SKY = 12
sky_slopes = [max_slope(2 * np.pi * k / SKY) for k in range(SKY)]
gy_full, gx_full = np.gradient(wall)

stages = []
for level in (0.2, 0.4, 0.6, 0.8, 1.0):
    k = DEPTH_TEXELS * level
    nrm = np.dstack([-gx_full * k, gy_full * k, np.ones_like(wall)])
    nrm /= np.linalg.norm(nrm, axis=2, keepdims=True)
    key = np.zeros_like(wall)
    for (az, el), slope in zip(key_dirs, key_slopes):
        L = np.array([np.cos(el) * np.cos(az), np.cos(el) * np.sin(az), np.sin(el)])
        lit = np.clip(nrm @ L, 0, None) / np.sin(KEY_EL)
        # Penumbra widens with distance from the occluder edge.
        visible = 1 - np.clip((slope * k - np.tan(el) * 0.82) / (np.tan(el) * 0.36), 0, 1)
        key += lit * blur(visible, 2.5)
    key /= len(key_dirs)
    sky = np.zeros_like(wall)
    for slope in sky_slopes:
        horizon_sin = np.clip(slope * k, 0, None)
        horizon_sin = horizon_sin / np.sqrt(1 + horizon_sin**2)
        sky += 1 - horizon_sin
    sky = (sky / SKY) * (0.5 + 0.5 * nrm[..., 2])
    # Light bounced between neighbouring plaster faces lifts the deepest shade.
    bounce = 0.10 * blur(key, 14) * (1 - sky)
    # Raised plaster catches more of the room's light than the wall plane.
    lift = 1 + 0.2 * level * np.clip(wall / 0.22, 0, 1)
    o = REST * (0.66 * key + 0.34 * sky**1.2 + bounce) * lift
    stages.append(blur(o, 0.6))

h16 = np.round(wall * 65535).astype(np.uint16)
small = cv2.resize(h16, (W // 2, H // 2), interpolation=cv2.INTER_AREA)
rgb = np.dstack([(small >> 8).astype(np.uint8), (small & 255).astype(np.uint8), np.full(small.shape, 255, np.uint8)])
Image.fromarray(rgb).save(f"{out_dir}/kurukshetra-height.png", optimize=True)
for index, stage in enumerate(stages, 1):
    Image.fromarray((np.clip(stage, 0, 1) * 255).round().astype(np.uint8)).save(
        f"{out_dir}/kurukshetra-stage{index}.webp", quality=90, method=6
    )

# --- 5. tileable plaster and field noise -----------------------------------
rng = np.random.default_rng(7)


def tile_noise(size, octaves, falloff=0.55):
    out = np.zeros((size, size), np.float32)
    amp, total = 1.0, 0.0
    for cells in octaves:
        g = rng.random((cells, cells)).astype(np.float32)
        g = np.tile(g, (3, 3))
        up = cv2.resize(g, (size * 3, size * 3), interpolation=cv2.INTER_CUBIC)
        out += amp * up[size : 2 * size, size : 2 * size]
        total += amp
        amp *= falloff
    return out / total


def spread(a):
    lo, hi = np.percentile(a, [1, 99])
    return np.clip((a - lo) / (hi - lo), 0, 1)


P = 1024
from scipy.spatial import cKDTree


def cells(count, seed):
    """Tileable cellular field: per-cell tone, crevice distance and pit distance."""
    r = np.random.default_rng(seed)
    pts = r.random((count, 2)) * P
    tone = r.random(count).astype(np.float32)
    tiled = np.concatenate([pts + (dx * P, dy * P) for dx in (-1, 0, 1) for dy in (-1, 0, 1)])
    tones = np.tile(tone, 9)
    gy, gx = np.mgrid[0:P, 0:P].astype(np.float32)
    # Warp the lookup so cell borders wander like trowelled plaster.
    wx = (tile_noise(P, (6, 14, 30), 0.6) - 0.5) * 70
    wy = (tile_noise(P, (6, 14, 30), 0.6) - 0.5) * 70
    q = np.stack([(gx + wx).ravel(), (gy + wy).ravel()], 1)
    dist, idx = cKDTree(tiled).query(q, k=2)
    f1, f2 = dist[:, 0].reshape(P, P), dist[:, 1].reshape(P, P)
    return tones[idx[:, 0]].reshape(P, P), (f2 - f1).astype(np.float32), f1.astype(np.float32)


tone_a, edge_a, _ = cells(260, 11)
tone_b, edge_b, pit_b = cells(1500, 12)
grain = spread(tile_noise(P, (128, 256, 512), 0.85))
crevice = np.exp(-edge_a / 2.2) * (0.35 + 0.65 * spread(tile_noise(P, (5, 12), 0.5)))
fine_crevice = np.exp(-edge_b / 1.3)
pits = np.exp(-(pit_b / 3.0) ** 2) * (tone_b > 0.93)
plaster = (
    0.925
    + 0.010 * (blur(tone_a, 6) - 0.5)
    + 0.016 * (tone_b - 0.5)
    + 0.022 * (grain - 0.5)
    - 0.034 * crevice
    - 0.018 * fine_crevice
    - 0.060 * blur(pits.astype(np.float32), 1.0)
)
plaster = np.clip(plaster, 0, 1).astype(np.float32)
pim = (plaster * 255).astype(np.uint8)
Image.fromarray(np.dstack([pim, pim, pim])).save(f"{out_dir}/plaster.webp", quality=92, method=6)

noise = spread(tile_noise(256, (4, 8, 16), 0.5))
nim = (noise * 255).astype(np.uint8)
Image.fromarray(np.dstack([nim, nim, nim])).save(f"{out_dir}/noise.png", optimize=True)

# --- 6. offline preview of the fully raised wall ---------------------------
if preview_path:
    tile = np.tile(plaster, (H // P + 1, W // P + 1))[:H, :W]
    col = np.clip((stages[-1] * tile + 0.08) * 0.6 + 0.4, 0, 1)
    Image.fromarray((col * 255).astype(np.uint8)).save(preview_path)
print("wall", wall.shape, "coverage", float((wall > 0.02).mean()))
