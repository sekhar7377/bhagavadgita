# Session handoff — start here

Last updated: 14 November 2026 (third session, run locally on the user's Windows PC). Project: **Bhagavad Gītā — The Stillness Before Action**.

## User intent (persistent)

Build an immersive Gītā experience **one milestone at a time**, matching the craft level of https://immersive-g.com/ in every detail: the cursor-driven reveal, the 3D realism of the wall sculpture, typography, spacing, micro-details. The user repeated this several times and is explicit:

- Go back to the reference and compare after every piece of work. Do not judge by eye from memory.
- **Do not invent extras.** The reference has no pause-motion control, no menu icon, no eyebrow or subtitle in the opening; those were removed. Add nothing the reference does not have unless the content needs it.
- The reference's public code may be read to learn mechanisms and values. Do not ship its assets, models, textures, fonts or compiled code.
- **The user decided the supplied film footage may be used directly** as source material (it is their project and their call; do not re-argue it). Remove captions, credits and lettering from anything used.
- The user wants a partner who guides: when something is blocked, say the way around it and keep building. Never just stop.
- Image generation: done locally through the user's own **ChatGPT** (preferred: more detail) or Gemini login in Chrome (Claude in Chrome), **not** the API (the user chose the browser route again in session 3). The user approved downloading every generated image for this wall, and allows ChatGPT or any other tool if Gemini cannot match the references.
- **Every generated image must match the supplied references.** Subject and composition come from the Kalki frame (`docs/references/wheel-source.png`): canopied pavilion chariot, banner on a tall pole, archer under the canopy, charioteer standing at the front with the reins, horses leaping right, big spoked wheel. Sculpting style comes from the studio still the user supplied (birds with fanned feathers, blooming flowers, vines; soft, organic, thick high relief) and the live reference site. Text-only prompts gave a stiff "classical frieze" that did not match; **attach both references as image inputs** (see Image pipeline below).
- Remove the visible Gemini sparkle from every render (`scripts/relief/clean_mark.py`). Invisible provenance marks (SynthID) are not touched.

Do not republish or reconfigure the cloud environment.

## What exists now

Milestone 02: the opening wall rebuilt on the reference's architecture. Still a single page; no chapters, reader, audio or loader.

- **Sculpture (session 3, revised).** The centrepiece is a full carved panel made in **ChatGPT** from the user's own ChatGPT painting (`docs/references/chariot-chatgpt-subject.png`: umbrella-canopy chariot, Krishna holding the reins, Arjuna with bow, four white horses, carved lion, ornate wheel, the two armies with banners, clouds and setting sun). The user said ChatGPT gives better detail than Gemini and that **the battlefield background must be carved too, not replaced by blank wall**. Result: `docs/references/chariot-battlefield-chatgpt.png` (1536×1024), separation mode `full` (whole panel is relief, no base plate, so the sky sits at wall level and only forms rise; `sink` on all four sides feathers it into the wall). The wheel-bearer (Gemini) stands at the right edge. The earlier Gemini chariot tableau and lotus bands are off the wall for now (manifests are easy to restore from git history, commit 25f823f). `docs/references/chariot-plaster-chatgpt.png` is the chariot-only ChatGPT version that the user rejected for missing the battlefield.
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

## Milestone 03: one continuous wall, six Gītā scenes (14 November 2026)

The user asked for the whole site to be one continuous experience like the reference (not separate sections), with moving type, telling famous scenes of the Gītā. Live inspection of the reference confirmed: **one full-screen WebGL canvas, document overflow hidden, wheel-driven virtual scroll**; the wall and its carvings glide through that single canvas.

**Architecture now**
- `#relief` is a single `position: fixed` canvas behind the whole page (`src/relief.ts`, `mountRelief(container, scenes)`). Every `[data-scene]` element anchors one carved 2:1 panel; each frame the panel is placed at its anchor's on-screen centre (`place()`), so the wall scrolls exactly with the DOM.
- One shared reveal field; it is **reprojected on scroll** (`uShift` in the field shader) so revealed carving stays attached to the sculpture.
- Plaster grain is pinned to the wall (`uScrollWorld`), so bare wall between scenes scrolls continuously.
- Fast scrolling swells the geometry slightly (`uBoost`, vertex only; shading ignores it so it never lights unrevealed carving).
- Panels load when within 1.6 screens and are released beyond 3 screens (the opening panel is never released). The opening panel drives `data-relief-state` (ready / plain), which the tests use.
- Smooth weighted scrolling with **Lenis 1.3.4** (`lerp 0.085`, `anchors: true`) over native scroll, so keyboard, anchors and assistive tech still work. Disabled under reduced motion.
- **Floating type** (`src/float.ts`): `[data-float]` headings are split into `.line` spans at `<br>`; lines rise in with a stagger as they enter, spread apart slightly away from screen centre and breathe gently. Disabled under reduced motion.
- No-WebGL fallback: `html.relief-fallback` shows each scene's baked `NAME-fallback.webp` as its section background.
- New scene: generate the plaster render, then `sh scripts/relief/make_scene.sh sceneN docs/references/<file>.png` (GPU depth, manifest, bake, fallback), then add a `<section class="scene scene--left|right|centre" data-scene="sceneN">` with a `data-float` statement.

**The seven scenes (story order, each a distinct camera; see Scene variety rule)**
1. `kurukshetra`: the chariot between the armies, wide (hero).
1b. `battle`: Ch. 1, the conches sound: low in the middle of the charge, Krishna and Arjuna blowing conches, horses leaping, elephants, banners, arrows. Made from two of the user's Kalki recording frames (credits painted out / cropped away, kept outside Git) plus our scene 1 plaster panel for continuity. The user asked for battle scenes to use their recordings.
2. `scene2`: Ch. 1, the bow lowers: close, on the chariot.
3. `scene3`: Ch. 2, the teaching begins: low angle from the chariot floor, canopy as halo.
4. `scene4`: Ch. 6, the steady lamp: symbolic, a still flame between teacher and student, lotus pond.
5. `scene5`: Ch. 11, the universal form: monumental, ordered faces and arms, tiny Arjuna below.
6. `scene6`: Ch. 18, clarity: from behind and below, Arjuna upright lifting the bow, armies clear.
All statements are original editorial copy with traditional chapter titles; no verse is quoted or invented.

**Intro and sound (milestone 03b)**
- `#loader` (`src/loader.ts`): identity and title on bare plaster in the hero's exact grid, a counter that follows real progress (fonts 15, opening wall settled 70, page load 15; eased, minimum 1.6 s, 0.3 s under reduced motion, gives up after 9 s), and a breathing "Click to enable sound" prompt. Scroll is held (`html.is-loading`, Lenis stopped) until it finishes; then it fades and the opening carving surfaces once (`relief.reveal()`) and settles. If scripts never run, a CSS animation hides it after 12 s.
- Sound (`src/sound.ts`) is synthesised, no audio files: a tanpura-like drone (Pa, Sa, Sa, low Sa on C#, each pluck with a filter "bloom" imitating the jawari bridge) over band-passed pink-noise wind; Lenis scroll velocity raises the wind. Starts only on a click (loader or toggle), fades in to a low level, compressor on the master.
- `.sound-toggle`: 30 px circle 40 px from the lower-right corner (the reference's corner control), four bars animate while on; turns light over the dark closing sections.

**Still missing against the reference**: carving rising *over* letters (needs text drawn in WebGL); menu transition; header mark after scroll; the dark closing section is still milestone-01 styling.

## Scenes (session 3, 14 November 2026)

- **Scene 1, opening wall** (`scripts/relief/elements.json`, outputs `public/relief/kurukshetra-*`): the ChatGPT chariot-and-battlefield panel plus the wheel-bearer. Elements with `"paint": 1` show the render's own shading as they rise (`paint_tone` in `build_relief.py`), so revealed carving keeps the render's full detail; depth still drives the geometry and cast-shadow bake. The user asked for this after seeing the depth-only bake lose detail.
- **Film window**: `public/art/kurukshetra.webp` is now the user's own colour ChatGPT painting (`docs/references/chariot-chatgpt-subject.png`); the milestone-01 amber image was replaced at the user's request.
- **Scene 2, statement wall** (`scripts/relief/scene2.json`, outputs `public/relief/scene2-*`, mounted by `mountRelief(host, "scene2")` in `.scene-wall` behind "Before the battle begins…"): an intimate close view on the chariot, Arjuna large on the right with hand to brow, the bow slipping from his open hand across the foreground, quiver spilling, Krishna turned toward him with an open hand, canopy bells across the top, armies glimpsed far off. Matches the source brief's C01 "The bow lowers". Source: `docs/references/scene2-falling-bow-chatgpt.png`. A first attempt (`scene2-arjuna-grief-chatgpt.png`) reused scene 1's wide chariot shot; the user rejected it.
- **Rule from the user: every scene is connected to the previous one (same characters, costumes, chariot details, plaster) but uses a distinctly new camera, scale and composition.** Never repeat a shot. Use the chapter H/D/R prompts in `docs/SOURCE_BRIEF.txt` (C01 onward) for framing.
- Each scene is its own WebGL wall; walls stop rendering when off-screen (IntersectionObserver in `relief.ts`).
- Not done yet for scene 2: carving rising **over** the statement's letters (the reference renders its text in WebGL so raised plaster hides it). Plan: draw the heading into a canvas texture, composite it in the wall shader and fade it where extrusion is high; keep the DOM heading for accessibility.
- The pointer test is timing-sensitive under heavy load (it failed once in a full run while the GPU and ChatGPT were busy, then passed twice).

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

Depth estimation runs on the GPU (GTX 1650 via `onnxruntime-directml`, 14 s per image); the CPU path thrashes with the PC's 8 GB RAM. In ChatGPT, typing long prompts key by key froze the tab; insert text with `document.execCommand('insertText', …)` on the `.ProseMirror` editor and click Send. ChatGPT has real hidden `input[type=file]` elements for attaching images. On Windows use `python`, not `python3`. The model sits in `models/` (git-ignored). `npm run format:check` flags every file on Windows because git checks out CRLF; `npx prettier --check --end-of-line auto src tests index.html DESIGN.md` is the real check.

## Git

Origin `https://github.com/sekhar7377/bhagavadgita.git`. This session's work is on branch `claude/festive-hamilton-s0cee2`; `main` holds milestone 01. Read `git log -5 --oneline` and `git status` before editing. Never force-push.
