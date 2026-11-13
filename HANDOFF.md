# Session handoff — start here

Last updated: 13 November 2026 (third session, run locally on the user's Windows PC). Project: **Bhagavad Gītā — The Stillness Before Action**.

## User intent (persistent)

Build an immersive Gītā experience **one milestone at a time**, matching the craft level of https://immersive-g.com/ in every detail: the cursor-driven reveal, the 3D realism of the wall sculpture, typography, spacing, micro-details. The user repeated this several times and is explicit:

- Go back to the reference and compare after every piece of work. Do not judge by eye from memory.
- **Do not invent extras.** The reference has no pause-motion control, no menu icon, no eyebrow or subtitle in the opening; those were removed. Add nothing the reference does not have unless the content needs it.
- The reference's public code may be read to learn mechanisms and values. Do not ship its assets, models, textures, fonts or compiled code.
- **The user decided the supplied film footage may be used directly** as source material (it is their project and their call; do not re-argue it). Remove captions, credits and lettering from anything used.
- The user wants a partner who guides: when something is blocked, say the way around it and keep building. Never just stop.
- Image generation: done locally through the user's own Gemini login in Chrome (Claude in Chrome), **not** the API (the user chose the browser route again in session 3). The user approved downloading every generated image for this wall, and allows ChatGPT or any other tool if Gemini cannot match the references.
- **Every generated image must match the supplied references.** Subject and composition come from the Kalki frame (`docs/references/wheel-source.png`): canopied pavilion chariot, banner on a tall pole, archer under the canopy, charioteer standing at the front with the reins, horses leaping right, big spoked wheel. Sculpting style comes from the studio still the user supplied (birds with fanned feathers, blooming flowers, vines; soft, organic, thick high relief) and the live reference site. Text-only prompts gave a stiff "classical frieze" that did not match; **attach both references as image inputs** (see Image pipeline below).
- Remove the visible Gemini sparkle from every render (`scripts/relief/clean_mark.py`). Invisible provenance marks (SynthID) are not touched.

Do not republish or reconfigure the cloud environment.

## What exists now

Milestone 02: the opening wall rebuilt on the reference's architecture. Still a single page; no chapters, reader, audio or loader.

- **Sculpture (session 3).** Four placements, listed in `scripts/relief/elements.json`: the chariot tableau (pavilion chariot with banner, archer, charioteer, two leaping horses, lotus and vines along the base, birds) left of centre; the wheel-bearer (warrior lifting a spoked wheel overhead, as in the film's opening) at the right edge; and the lotus-and-cranes band twice, lower left and mirrored upper right, so carving runs edge to edge like the reference. The user reviewed the Gemini images and wants them used. The tableau's source is `docs/references/chariot-plaster-v2.png`, a white-plaster render generated in Gemini from the Kalki frame (subject) plus the studio still (style), sparkle removed. Wheel-bearer and lotus are `wheelbearer-plaster.png` and `lotus-plaster.png`. New manifest options: separation mode `wall` fits a plane to the frame border of a plaster render and keeps what stands in front of it; `crop` (source fractions) cuts away wall corners and ledges a render shows at its edges; `flip` mirrors a reused element. The wheel-bearer depth needs long side 1022, because 1526 on a 2048² image runs out of memory. The milestone-02 manifest (depth-estimated chariot plus film-frame wheel-bearer) was replaced; its depth maps stay in `docs/relief-sources/`. `scripts/relief/estimate_depth.py` runs Depth Anything V2 Large (ONNX, CPU); 16-bit depth maps are kept in `docs/relief-sources/` so the wall rebuilds without the model. `scripts/relief/build_relief.py` separates each subject from its scene, compresses and inflates the forms into a bas-relief height field, places it on a 2304×1152 wall, and **bakes lighting offline at five extrusion depths** (20–100%): soft key light, cast shadow, sky occlusion, bounce. Outputs live in `public/relief/` (about 700 KB total).
- **Reveal field.** `src/relief.ts` keeps a 256×256 RGBA ping-pong field: R/G velocity, B nonlinear speed, A coverage. Constants and stamp/decay maths follow the reference's public shader: falloff 0.38×0.5, dissipation 0.953 per 16 ms step, pointer ease 0.4, velocity ease 0.1 moving / 0.04 resting, noise stamp 0.15 + 0.85, automatic input ×3 with coverage = speed. Automatic path: 1–3 segments of 0.7–1.0 s, then a 1–3 s pause.
- **Wall shader.** Vertex depth = height × mix(0.05, 1, avg(B, A)). Fragment samples the field at twice the strength and cross-fades the five baked stages over 0.2 intervals, starting from the constant 0.54504; then plaster texture, screen wash, `tone × 0.6 + 0.4`. Camera: perspective, fov 30, distance 15.
- **Micro-details from the user's real-GPU recording:** faint iridescent tint on shadowed rims while plaster moves (an approximation, see gaps), and a 4px dot trailing the pointer.
- **Layout.** Measured from the live reference at 1440×810 and reproduced: 12-column grid, 16px padding and gap; identity from column 2, 28px serif sentence from column 5, 14px scroll cue from column 10 at 60% opacity; Menu label 40px from the top-right; corner link 40px from the bottom-left; text colour `#030303`; no scrollbar. Stacks below 1024px.
- **Fonts.** Tinos and Arimo (open, metric-compatible with Times and Helvetica), self-hosted. The reference's PSTimes and Helvetica Neue are licensed and were not copied.
- **Reduced motion.** No visible control. With the OS preference set, the carving is shown fully raised and still.
- **Fallbacks.** No WebGL: static baked image. Height data fails: plain plaster wall, page fully usable.
- Prologue, generated battlefield image, reflection, footer and dialog menu are unchanged from milestone 01 apart from the fonts.

## Evidence

`docs/reference-study/2026-11-13-c/` holds session 3's live capture of the chariot tableau at 1440×810 and its fully raised bake. `docs/reference-study/2026-11-13-b/` holds reference captures (software renderer at 1440×810, plus two frames from the user's real-GPU recording), ours, and a side-by-side. Measured tones, reference vs ours: wall 196 / 196, median 190 / 191, deepest shade about 125 / 114–119, brightest plaster about 220 / 220–231.

`scripts/reference/capture-reference.cjs` and `capture-ours.cjs` reproduce the captures (global Playwright; the reference script needs `HTTPS_PROXY`).

## Known gaps against the reference — be honest about these

1. **Sculpture quality.** Much closer since session 3: volumes are thick and rounded, and the tableau has birds, lotus and vines in the studio's manner. Still a depth estimate of a 2912×1440 render, not a sculpted mesh: some stems float free of their vines, horse legs are simplified, fine undercuts flatten.
2. **Coverage.** One screen is now carved nearly edge to edge. The reference continues over several screen heights and recycles elements on scroll; ours stops at one screen. `chariot-plaster.png` (first text-only chariot) is unused. The iridescent fringe reads stronger than the reference's on a real GPU; tone it down.
3. **Iridescence is approximate.** The reference runs a separate fluid simulation and masks by fresnel and bake shadow range. Ours tints by surface direction where the speed channel is active.
4. **Scroll.** The reference uses virtual scroll, reprojects the field, deforms the wall with scroll speed and has a fast-scroll mode. Ours scrolls natively and the wall leaves with the hero.
5. **After the opening.** The reference continues with a large statement whose text is occluded by raised sculpture (text rendered in WebGL), a film window, and a centred statement. Ours still has the milestone-01 sections.
6. **Intro loader, sound, menu transition, header logo after scroll, animated corner icon** are not built.
7. **Performance is unmeasured on real hardware.** Everything here ran on SwiftShader. Tests take minutes for that reason.
8. The automatic path uses a hand-written jitter, not GSAP's `rough` ease.

## Reference recording R11 (session 3)

The user recorded the live reference site (`C:\Users\velpu\Videos\Screen Recordings\Screen Recording 2026-11-13 211601.mp4`, 28.8 s, 1920×1020, kept outside Git). Observed:

- **Scale.** Each carved subject is large: one bird spans about a fifth of the screen width, one flower about a tenth. Subjects sit loosely on the wall with open plaster between them. Our one-screen wall is a denser frieze at a smaller scale; per screen we should show fewer, larger forms.
- **At rest** the wall is almost blank; forms appear only where the pointer or the automatic path passes.
- **Scroll sequence.** Hero band, then a large left-aligned four-line serif statement (about 36 px at 1920) with carving rising **over** its letters, so the letters vanish under the raised plaster. Then a dark film window grows up from the bottom edge into a large centred frame. Then a small centred label ("Our approach") over a centred three-line statement. Carving continues along the wall around all of these. The Menu label gains a small mark after scrolling.

## Next work, in order

1. **Story elements from the user's four screen recordings** (`C:\Users\velpu\Videos\Screen Recordings\Screen Recording 2026-11-13 202451/202649/202850/202951.mp4`, 23–29 s each, the film's opening, kept outside Git). The user said these are references and to generate our own visuals to bring the story to life. What they show: banners on poles over a battlefield; a field of arrows standing in the earth; the warrior leaping with a chariot wheel overhead; a fallen elephant with its tusk curving up; shields and swords in the dust; golden pavilion chariots and horse teams in a charge; the aftermath at sunset, with a lone bare-chested figure walking among the fallen and a white horse; a glowing light held up to the sky. Credits and subtitles are burned in throughout, so use frames only as image inputs, never directly. Generate each as a plaster element (pipeline below, frame as subject + studio still as style): (a) arrows-and-banners field, (b) fallen elephant, (c) lone figure and white horse at the aftermath. They belong on the screens below the opening once the wall extends (next item). The sunset aftermath frames also suit the later film window.
2. Fill further. Overlapping elements keep the higher surface (max), so lay fills behind figures. A true 3D model rendered to height is better still.
3. Extend the wall over several screens at the reference's scale (see R11) and add scroll coupling (field reprojection, scroll-speed deformation). This is the most visible remaining difference from the reference.
4. Rebuild the section after the opening on the reference's pattern, including text occluded by the sculpture.
5. Intro loader; menu transition.
6. Then the earlier plan: character sheet, Nuxt routing decision, one chapter slice, verified Sanskrit edition and reusable translation (never fabricate verses).

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
python3 scripts/relief/estimate_depth.py model.onnx SOURCE.png depth.npy 1526   # only for a new element
python3 scripts/relief/build_relief.py scripts/relief/elements.json public/relief preview.png
```

The fallback image is `preview.png` resized to 1920×960 WebP.

### Image pipeline (session 3)

1. In Gemini (user's Chrome login), start a new chat and attach two images: the subject reference (`docs/references/wheel-source.png` cropped to the picture, without letterbox or channel watermark) and the style reference (two crops of the studio still, kept outside Git). Attaching works by adding a temporary `<input type=file>` to the page, filling it with the Chrome file-upload tool, then dispatching a `paste` ClipboardEvent carrying those files onto the prompt editor. The `+` menu opens a native picker and cannot be driven.
2. Prompt: subject from image 1, sculpting style from image 2, pure matte plaster, soft frontal light, orthographic, no frame, text or colour. The exact prompt is in `docs/ASSET_REGISTER.md` (G04).
3. Download full size. It lands in the user's Downloads folder; move only files timestamped in the current session (older Gemini files there belong to the user). Then `python scripts/relief/clean_mark.py IN.png OUT.png`.
4. `python scripts/relief/estimate_depth.py models/depth-anything-v2-large.onnx IN.png OUT.npy 1526`, normalise, save as a 16-bit PNG plus a greyscale luma PNG in `docs/relief-sources/`, add an entry with `"separation": "wall"` (threshold about 0.035 keeps thin vines), rebuild.

On Windows use `python`, not `python3`. The model sits in `models/` (git-ignored). `npm run format:check` flags every file on Windows because git checks out CRLF; `npx prettier --check --end-of-line auto src tests index.html DESIGN.md` is the real check.

## Git

Origin `https://github.com/sekhar7377/bhagavadgita.git`. This session's work is on branch `claude/festive-hamilton-s0cee2`; `main` holds milestone 01. Read `git log -5 --oneline` and `git status` before editing. Never force-push.
