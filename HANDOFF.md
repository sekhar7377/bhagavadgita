# Session handoff — start here

Last updated: 13 November 2026 (second session). Project: **Bhagavad Gītā — The Stillness Before Action**.

## User intent (persistent)

Build an immersive Gītā experience **one milestone at a time**, matching the craft level of https://immersive-g.com/ in every detail: the cursor-driven reveal, the 3D realism of the wall sculpture, typography, spacing, micro-details. The user repeated this several times and is explicit:

- Go back to the reference and compare after every piece of work. Do not judge by eye from memory.
- **Do not invent extras.** The reference has no pause-motion control, no menu icon, no eyebrow or subtitle in the opening; those were removed. Add nothing the reference does not have unless the content needs it.
- The reference's public code may be read to learn mechanisms and values. Do not ship its assets, models, textures, fonts or compiled code.
- Supplied film footage guides art direction. Production imagery must carry no captions, credits or lettering.

Do not republish or reconfigure the cloud environment.

## What exists now

Milestone 02: the opening wall rebuilt on the reference's architecture. Still a single page; no chapters, reader, audio or loader.

- **Sculpture.** `scripts/relief/estimate_depth.py` runs Depth Anything V2 Large (ONNX, CPU) on the project's own artwork `docs/artwork/kurukshetra-original.png`. `scripts/relief/build_relief.py` separates chariot, riders and horses from terrain, compresses and inflates the forms into a bas-relief height field, places it on a 2304×1152 wall, and **bakes lighting offline at five extrusion depths** (20–100%): soft key light, cast shadow, sky occlusion, bounce. Outputs live in `public/relief/` (about 700 KB total).
- **Reveal field.** `src/relief.ts` keeps a 256×256 RGBA ping-pong field: R/G velocity, B nonlinear speed, A coverage. Constants and stamp/decay maths follow the reference's public shader: falloff 0.38×0.5, dissipation 0.953 per 16 ms step, pointer ease 0.4, velocity ease 0.1 moving / 0.04 resting, noise stamp 0.15 + 0.85, automatic input ×3 with coverage = speed. Automatic path: 1–3 segments of 0.7–1.0 s, then a 1–3 s pause.
- **Wall shader.** Vertex depth = height × mix(0.05, 1, avg(B, A)). Fragment samples the field at twice the strength and cross-fades the five baked stages over 0.2 intervals, starting from the constant 0.54504; then plaster texture, screen wash, `tone × 0.6 + 0.4`. Camera: perspective, fov 30, distance 15.
- **Micro-details from the user's real-GPU recording:** faint iridescent tint on shadowed rims while plaster moves (an approximation, see gaps), and a 4px dot trailing the pointer.
- **Layout.** Measured from the live reference at 1440×810 and reproduced: 12-column grid, 16px padding and gap; identity from column 2, 28px serif sentence from column 5, 14px scroll cue from column 10 at 60% opacity; Menu label 40px from the top-right; corner link 40px from the bottom-left; text colour `#030303`; no scrollbar. Stacks below 1024px.
- **Fonts.** Tinos and Arimo (open, metric-compatible with Times and Helvetica), self-hosted. The reference's PSTimes and Helvetica Neue are licensed and were not copied.
- **Reduced motion.** No visible control. With the OS preference set, the carving is shown fully raised and still.
- **Fallbacks.** No WebGL: static baked image. Height data fails: plain plaster wall, page fully usable.
- Prologue, generated battlefield image, reflection, footer and dialog menu are unchanged from milestone 01 apart from the fonts.

## Evidence

`docs/reference-study/2026-11-13-b/` holds reference captures (software renderer at 1440×810, plus two frames from the user's real-GPU recording), ours, and a side-by-side. Measured tones, reference vs ours: wall 196 / 196, median 190 / 191, deepest shade about 125 / 124, brightest plaster about 220 / 226.

`scripts/reference/capture-reference.cjs` and `capture-ours.cjs` reproduce the captures (global Playwright; the reference script needs `HTTPS_PROXY`).

## Known gaps against the reference — be honest about these

1. **Sculpture quality.** The reference is a hand-sculpted high-relief model: thick rounded volumes, undercuts, overlapping birds, flowers and vines across the whole wall. Ours is one chariot derived from a depth estimate of a 1536×1024 image: finer and flatter, with softer anatomy. This is the largest gap. See the user's supplied still (dark dramatic render of the studio's sculpture) for the target feel.
2. **One element.** The reference wall carries many elements over several screen heights and recycles them on scroll.
3. **Iridescence is approximate.** The reference runs a separate fluid simulation and masks by fresnel and bake shadow range. Ours tints by surface direction where the speed channel is active.
4. **Scroll.** The reference uses virtual scroll, reprojects the field, deforms the wall with scroll speed and has a fast-scroll mode. Ours scrolls natively and the wall leaves with the hero.
5. **After the opening.** The reference continues with a large statement whose text is occluded by raised sculpture (text rendered in WebGL), a film window, and a centred statement. Ours still has the milestone-01 sections.
6. **Intro loader, sound, menu transition, header logo after scroll, animated corner icon** are not built.
7. **Performance is unmeasured on real hardware.** Everything here ran on SwiftShader. Tests take minutes for that reason.
8. The automatic path uses a hand-written jitter, not GSAP's `rough` ease.

## Next work, in order

1. Raise sculpture quality: thicker volumes, more elements (horses, wheel, banner, lotus, conch, arrows) composed across the wall. Best route is a real 3D model (image-to-3D generation or sculpting) rendered to height and bakes by the existing pipeline; the pipeline accepts any height field.
2. Extend the wall over several screens and add scroll coupling (field reprojection, scroll-speed deformation).
3. Rebuild the section after the opening on the reference's pattern, including text occluded by the sculpture.
4. Intro loader; menu transition.
5. Then the earlier plan: character sheet, Nuxt routing decision, one chapter slice, verified Sanskrit edition and reusable translation (never fabricate verses).

## Run

```sh
npm ci
npm run dev -- --port 5173
npm run build
npm test            # about 4 minutes on a software renderer
npm run format:check
```

Rebuilding the relief needs Python with numpy, pillow, opencv-python-headless, scipy and onnxruntime, plus the model `onnx-community/depth-anything-v2-large` (`onnx/model.onnx`, 1.3 GB, not committed):

```sh
python3 scripts/relief/estimate_depth.py model.onnx docs/artwork/kurukshetra-original.png depth.npy 1526
python3 scripts/relief/build_relief.py depth.npy docs/artwork/kurukshetra-original.png public/relief preview.png
```

The fallback image is `preview.png` resized to 1920×960 WebP.

## Git

Origin `https://github.com/sekhar7377/bhagavadgita.git`. This session's work is on branch `claude/festive-hamilton-s0cee2`; `main` holds milestone 01. Read `git log -5 --oneline` and `git status` before editing. Never force-push.
