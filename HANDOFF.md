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

**Still missing against the reference**: carving rising _over_ letters (needs text drawn in WebGL); menu transition; header mark after scroll; the dark closing section is still milestone-01 styling.

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

## Scope change: the whole Mahābhārata (14 November 2026)

The user said the Gītā wall is a small part of a larger "World of Mahabharata" site and asked for the whole epic narrated like a film (Hollywood restraint plus Rajamouli's elevation and interval), then built **one scene at a time** the same way. The narration is `docs/MAHABHARATA_TREATMENT.md`: prologue (Vyāsa dictating), Acts I–VII mapped to the parvas, about 70 scenes, each with camera, light, carving, sound and draft words, with Critical Edition vs. tradition marked. The Gītā wall becomes Act V, Day One, unchanged. Proposed site structure (not yet approved or built): `/` = Prologue + Act I wall, one continuous wall per act after that, a dark interval screen after Act II. **Next action: on the user's go-ahead, build P1 "The cave" as the first new panel** (ChatGPT render with the studio still and our plaster panel attached → `make_scene.sh` → section), then continue in treatment order.

## Milestone 04: the main header, cold open Frame 1 (14 November 2026)

The user supplied a cinematic script, "MAHABHARATA: THE EIGHTEEN ECLIPSES" (Rajamouli plus James Cameron), and asked for it as the site's main header in our existing design: the same wall, motion and visuals. Everything built before stays as the **Kurukṣetra section**. Only **Frame 1** of the script was supplied so far (the text ended there): "The Primordial Silence". It opens on black with a 40 Hz heartbeat and wind; one ember rises; scrolling pulls the camera back, macro to wide, revealing a shattered golden chariot wheel half-buried in mud.

Adapted to our style:

- `#beginning` is now `.cold-open`, a 320svh section with a sticky 100svh pin that anchors a new panel `wheel` (`docs/references/wheel-coldopen-chatgpt.png`, ChatGPT, same conversation, scene 1 panel attached for wheel design and carving style; inspected: no text, no people; `scripts/relief/wheel.json`).
- `src/coldopen.ts` maps scroll progress through the section:
  - Darkness (`.cold-open-dark`) lifts over 0.10–0.55.
  - A 2D ember canvas runs: one ember climbs to the hub and hangs there, small ones drift up.
  - The panel camera, through the new `SceneSpec.shot()` in `relief.ts`, scales 3.2 → 1 about the hub (uv 0.49, 0.53) with cubic easing.
  - A per-panel `uLift` raises the wheel while the dark lifts, then rests at 25%.
  - The title card lines (MAHĀBHĀRATA / "The Eighteen Eclipses." / Scroll to begin) rise in over 0.66–0.96, in the measured hero grid.
  - `html.cold-dark` turns the header light while it is dark.
- Sound: `sound.setMix(heart, drone)`. A 40 Hz lub-dub heartbeat with an 80 Hz overtone, about 52 bpm, plays in the dark; it fades over 0.35–0.75 while the tanpura drone fades in over 0.45–0.85. Wind is unchanged. (Sound starts only after a click, as before. Not listened to by the agent.)
- The old hero is now `#kurukshetra` (identity KURUKṢETRA, h2 "The stillness before action.", link "Enter the Gītā"). The loader, header, footer, menu (now 10 items) and page title say MAHĀBHĀRATA — The Eighteen Eclipses.
- Reduced motion: the cold open is a single screen with the title shown and no dark or embers.

**Next:** further frames of the user's script (they will paste them) slot into the same pinned sequence before the title card. The section grows by about 100svh per frame. Each new subject is a new ChatGPT plaster panel or a second panel anchored inside the pin.

## Next work, in order (Gītā wall, before the scope change)

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

## Milestone 05: two pages, Part I, and the Kurukṣetra gateway (14 November 2026)

The user asked for two things.

- The Kurukṣetra painting is the **heading for Kurukṣetra**: pressing it opens the Gītā wall we built, which now lives on its own page.
- Part I of their script, "THE TERRIBLE VOW & THE BLIND CROWN" (Ādi Parva), is the second section of the home page.

**Pages** (Vite multi-page, `vite.config.ts` `build.rollupOptions.input`)

- `/` (`index.html`) runs in this order:
  - the cold open and title (wheel);
  - **Part I**: a chapter header on the `hastinapura` panel ("The throne nobody could keep."), then chronicle text, then `vow`, chronicle, `blindcrown`, chronicle (the three brothers), `forest` (five sons of the gods), chronicle, `pots` (a hundred and one), chronicle;
  - then the two **branch cards** (A: the forgotten firstborn, i.e. Karṇa; B: the curse of Gāndhāra, i.e. Śakuni). They are marked "Being carved" because neither is built yet;
  - then the **gateway**: the painting with "Enter Kurukṣetra", linking to `kurukshetra/`.
- `/kurukshetra/` (`kurukshetra/index.html`) is the whole earlier Gītā wall, with its own loader ("KURUKṢETRA"), h1 "The stillness before action." and a menu that ends with "Back to the Mahābhārata". `main.ts` serves both pages: the cold open is optional, and menu links to other pages navigate normally.
- Story copy is the user's own dramatised retelling (lightly edited for length and spelling). The footer says some details follow later tradition. The vow is presented as a retelling, not a verse.
- `.chronicle` is a quiet reading column on bare wall, each paragraph a `data-float` block.

**Panels** (ChatGPT, same conversation, each a new camera; see ASSET_REGISTER G09): `hastinapura` (symmetrical pillared hall, empty throne, Bhīṣma from behind), `vow` (low angle at the water, Devavrata's palm raised, the Gaṅgā erupting, lotus rain; the text sits on the right), `blindcrown` (two-shot, Gāndhārī binding her eyes, Dhṛtarāṣṭra reaching, Śakuni with dice), `forest` (high wide hermitage, Kuntī calling five divine forms with infants, Pāṇḍu and the fallen stag), `pots` (one-point vault of jars, the cracked jar with the infant, Vyāsa, jackals at the window).

**Next:** the user's branch A and B scripts, then the remaining parts of the script. Each part gets the same pattern: header panel, scene panels, chronicle, branch cards.

## Milestone 06: Part II, branches that open, scenes that surface (14 November 2026)

The user asked for precision: every visual a masterpiece "with the eyes of Vyāsa", true to the real Mahābhārata, with permission to improve their script.

**Part II, "Born from ash and sacrificial fire"** (Ādi Parva: youth, tournament, house of lac, svayaṃvara), on the home page after Part I. It has 8 new ChatGPT panels, each a new camera (ASSET_REGISTER G10):

- `arena` (header): high crane view, Arjuna's fire, water and wind weapons.
- `karna`: low elevation, Karṇa at the gate with the sun as a halo.
- `anga`: Karṇa's crowned head at Adhiratha's feet, Duryodhana's hand on his shoulder, Bhīma laughing.
- `lac`: cutaway; the palace burns above, the brothers walk the tunnel carrying Kuntī, and Vidura's boat waits in moonlight.
- `swayamvara`: Arjuna draws upward while looking into the oil; the wheel and fish, Draupadī, Krishna in the gallery.
- `hut`: Kuntī with her back turned; the brothers and Draupadī at the door.
- Branch panels: `ekalavya` and `altar`.

**Copy checked against the Critical Edition, with Vyāsa's own details added:**

- Pramāṇakoṭi and Vāsuki's eight bowls of elixir.
- Droṇa's son fed rice-flour water for milk.
- Kṛpa's question and the anointing on a golden seat.
- Kuntī recognising Karṇa and fainting.
- Vidura's warning in a hidden tongue, and the miner.
- The forest woman and her five sons found in the ashes.
- Vidura's boat on the Gaṅgā.
- Krishna recognising his cousins and telling Balarāma.
- Bhīma uprooting a tree.
- Draupadī's past life (five prayers to Śiva).

Told as later tradition: the fish seen in oil (the text has a turning machine with an opening and a target) and Draupadī's rejection of Karṇa. Neither is shown as fact.

**Branches open for real.** Part II's A (Ekalavya's thumb) and B (Born from the altar) are `<details class="branch-path">`; opening one unfolds its own carved scene and chronicle.

- `relief.ts` skips anchors with no box, so a closed branch's panel never loads.
- The Ekalavya render first produced no image (most likely because of the knife). It was regenerated as the dignified moment of offering: open palm on a leaf, no knife, no injury.
- Part I's branch cards are still static, "Being carved".

**Scenes are built exactly like the Kurukṣetra wall (user correction, 14 November 2026).**

- The user rejected three earlier attempts:
  - auto-surfacing carvings ("completely revealed");
  - story text on bare wall;
  - sticky pinned panels that dissolve into each other ("one image going into another").
- Rule now, on the home page as on Kurukṣetra: every scene is one `<section class="scene … story-scene" data-scene>`, at least one screen tall.
  - Its carving is anchored to the section and scrolls with the page.
  - The statement and its story text (`.scene-story`) sit together on that carving, on opposite sides (centred scenes put the story in two columns below).
  - At rest the plaster is blank; the carving rises only under the cursor and the automatic path.
- Do not add auto-reveal, pinning or cross-dissolves.
- `relief.ts` still supports `shot().presence` and `pinned` and reprojects the field by the nearest carving's on-screen movement, but nothing uses pinning now. The cold-open wheel has lift 0.

ChatGPT automation helpers live in the page as `window.__gen(prompt)` / `__send()` / `__busy()`. They are not stored anywhere and must be re-injected in a new tab. The Send button's aria-label is exactly "Send".

## Milestone 07: chapters as their own walls (14 November 2026)

The user asked for Parts I and II to become their own section with a header painting, like Kurukṣetra. The site is now three pages:

- `/` (`index.html`) holds the cold open and title (wheel), then **"The chapters of the wall"**: two numbered colour-painting cards.
  - I: **Hastināpura**, `public/art/hastinapura.webp`. A new ChatGPT colour painting matched to the Kurukṣetra painting: Devavrata's vow at dawn on the Gaṅgā, Hastināpura across the river, Satyavatī and her father in a boat.
  - II: **Kurukṣetra**.
- `/hastinapura/` (`hastinapura/index.html`) holds Parts I and II of the Ādi Parva.
  - Its h1 is "The throne nobody could keep." on the `hastinapura` panel.
  - It ends with a "Next · Kurukṣetra" gateway, and its menu has Next and Back links.
  - Loader identity: HASTINĀPURA.
- `/kurukshetra/`: unchanged.

Future chapters follow the same pattern: their own `NAME/index.html` (add it to `vite.config.ts` inputs), a numbered card with a colour header painting on the home page, and a Next gateway at the end of the previous chapter.

Fix: `float.ts` now puts a space after each split line, so headings read "The throne nobody could keep." rather than running the words together for screen readers.

Commits: use the repository's configured git identity (plain `git commit`); a privacy hook blocks passing an email on the command line.

## Milestone 08: Part III, the Dice Hall (Sabhā Parva) (14 November 2026)

New page `/sabha/` (`sabha/index.html`, added to `vite.config.ts`), "The dice that broke the world." Order: Hastināpura → Dice Hall → Kurukṣetra. Home cards are I Hastināpura, II The Dice Hall, III Kurukṣetra. Hastināpura's Next gateway and menu point to the Dice Hall, whose Next is Kurukṣetra.

- **Panels (each a new camera, ASSET_REGISTER G12):**
  - `mayasabha` (header): floor-level view, the crystal floor ripples like water.
  - `khandava`: aerial ring of fire, Agni, Indra's storm, Maya begging.
  - `rajasuya`: the discus and the light rising from Śiśupāla into Krishna. A beheading prompt was refused, so the scene uses Vyāsa's own image of the merging light.
  - `pool`: Dutch angle of Duryodhana's fall, Bhīma laughing.
  - `dice`: Śakuni's hand over the board.
  - `question`: Draupadī standing, the elders bowed, Vikarṇa rising.
  - `cloth`: the endless silk. A prompt that described the pulling was refused; it is shown as the miracle with her in prayer.
  - `vows`, plus the branches `vidura` and `secondthrow`.
- **Copy:** the user's script checked against the Critical Edition, with Vyāsa's details added: Agni's twelve-year sacrifice, Varuṇa's gifts, Maya's fourteen months, the closed crystal door, the hall of a thousand pillars, the usher sent first, Vikarṇa, the Prahlāda tale, the omens, Draupadī's two boons and refused third.
  - Told as tradition: Śakuni's bone dice, Krishna's name in the disrobing, Draupadī's unbound-hair vow, the "blind man's son" taunt, and the bread that silenced Bhīṣma.
- **Dice hall tone:** the crimson veil was built and then removed at the user's request (14 November 2026); the Dice Hall stays ivory like every chapter, and the mood is carried by the words and carvings.
- **Dice sound:** `sound.dice()` synthesises two ivory clicks, a rattle and a board knock. Each `.stakes li[data-dice]` gets class `cast`, lights up and plays the sound as it crosses the middle of the screen (only when sound is on).
- **Header painting:** `public/art/sabha.webp`, crimson colour painting matched to the Kurukṣetra painting.

**Rule from the user: realistic staging.** No omen props: the user objected to jackals perched on fort walls. Regenerated without them:

- `pots` (Part I): eclipsed sun only.
- `vows`: storm sky only.
- `vidura`: plain lattice.
- `secondthrow`: the first version had giant floating dice; now small dice on the board, as a narrative frieze.

Omens live in the text only. Memory note `realistic-scenes`.

## Milestone 09: Acts IV–VIII (14–15 November 2026)

Pages built and tested: `/vana/` (Act IV), Parts V–VI on `/kurukshetra/`, `/svarga/` (Acts VII–VIII), the House of Kuru tree and the cold-open lines on `/`. **Every carving and header is now in**, so the milestone was committed and pushed to deploy.

**Carvings** (each inspected at full size; see ASSET_REGISTER G15):

- Vana: exile, kirata, yaksha, virata, kichaka, shami, sammohana (redone: correct chariot, bow at rest), kavacha. Header `public/art/vana.webp` (Arjuna's malformed bow fixed by an edit pass).
- Part V: choice, needle, courtform, karnaride (redone: correct ratha, both standing), kuntikarna, sanjaya.
- Part VI: bhishmawheel (redone), arrowbed, chakravyuha, abhimanyu (redone: wheel held horizontally overhead), jayadratha, ghatotkacha, dronafall (redone: chariots facing each other), draupadihair, karnawheel, maceduel (one correction pass), nightraid, barbarika.
- Svarga: widows, ironembrace, gandhari, kuntireveal, bhishmateach, dvaraka, jara, journey, dog, heaven, deadreturn. Header `public/art/svarga.webp`.

**Rebuilding the ChatGPT helpers:** the prompts with the OBJECT SPECIFICATIONS block lived in the ChatGPT tab (`window.__Q`, `__SPEC`, `__dl`, `__next`, `__send`, `__wait`). They were lost when the tab closed and were re-created from the session transcript. `models/take.sh NAME` now takes only `~/Downloads/NAME-download.png`, the exact file that `window.__dl(NAME)` saves, so it can never pick up the user's own downloads. Calls through the Chrome extension time out at 45 s, so poll with `__wait(40000)`.

**Next:** the user's next act or polish request. Possible extras: a dedicated Part VII/VIII image pass if the user flags anything, and the Gītā reader (needs a verified edition).

**User rules added this session:**

- Inspect every render at full size. Reject wrong chariots: they must have a box on one axle with wheels at the sides and separately yoked horses, with warriors standing, never riding.
- Reject malformed bows: one continuous limb with the string tied to both tips.
- Hold objects the way the user specifies (Abhimanyu's wheel horizontal).
- Memory notes `inspect-renders` and `realistic-scenes`.
- Download images only by fetching the image itself (`window.__dl`). `models/take.sh` refuses files older than 3 minutes, after it once grabbed one of the user's own downloads (since restored).

## Milestone 18: the entry title (16 November 2026)

The user gave a reference film title sequence: each letter flickers through Indian scripts and locks in, left to right. They asked for the same effect on our white plaster, ending in "Enter with sound", with the home page shown only after a click.
- `src/entry.ts` + `.entry` markup in `index.html`. MAHĀBHĀRATA decodes through Devanagari, Bengali, Gurmukhi, Gujarati, Odia, Tamil, Telugu, Kannada and Malayalam glyphs (a 260 ms stagger and 700 ms of flicker per letter), then "The Eighteen Eclipses" fades in.
- When the title is complete and the loader reports the wall is ready (`loader.isReady`), the "Enter with sound" button appears. A click on it, or anywhere on the finished page, enables sound, and `runLoader`'s new `gate` lets the intro lift.
- Ā is drawn as A with a CSS bar, because the font's macron sat off-centre. The title is normalised to NFC so Ā stays one slot.
- **Follow-up from the user:**
  - The title now plays on every home load; the sessionStorage skip was removed after the user's reload showed the old loader.
  - "Enter with sound" is a small breathing text line, not a pill button; a tap anywhere enters.
  - The relief does not render or simulate while `html.is-loading` covers the page, though it still calls `place()` so panels load. Measured worst frame during the entry: 172 ms before, 5 ms after.
  - Tests step through the entry in `beforeEach` by clicking the ready loader. The old counting-loader test now runs on `/sabha/`.
- Reduced motion shows the title at once. The CSS 12 s auto-hide is disabled on the gated loader.


## Milestone 19: recorded flute score (16 November 2026)

At the user's request the site's sound is now the user-supplied track "The Flute Of Srikrishna" (Kaala Bhairava). It is re-encoded to 128 kbps / 44.1 kHz with metadata stripped (`public/audio/flute.mp3`, 2.9 MB). The original stays outside the repo in Downloads.
- `src/sound.ts` plays it on a loop through Web Audio. It fades in on "Enter with sound" or the sound toggle, and fades out and pauses when sound is turned off or the tab is hidden.
- Each page is a separate document, so the playing position is saved in sessionStorage on `pagehide` and resumed on the next page.
- The synthesised tanpura, wind and heartbeat are removed. `setEnergy` and `setMix` remain as no-ops; the dice-hall clicks are still synthesised and play over the music.
- Range requests bypass the service worker, so the track is not cached offline.
- Lofi treatment (user request, same day): `public/audio/flute-lofi.mp3` replaces `flute.mp3`. It is slowed and pitched down to 0.92×, low-passed at 3.8 kHz, warmed at 220 Hz with 2.5 kHz eased off, given a gentle 0.45 Hz tape wobble, a small room echo and light compression. A faint, seeded vinyl bed (hiss and sparse crackle, about 30 dB under the music) is mixed in. Runtime is 202 s. The vinyl generator was a scratch script and is not in the repo.
- Soft pass (user request: "pleasant even at high system volume"): `public/audio/flute-soft.mp3` replaces `flute-lofi.mp3`. It uses the same lofi chain, but low-passed at 2.8 kHz, eases off 2 kHz by 4 dB, applies gentle compression, and is loudness-normalised to about −26 LUFS (LRA 5 LU, peaks −12 dBFS). In-app `MUSIC` gain is 0.6, so playback is roughly −30 LUFS: a soft backdrop with no loud swells.
- Note: this is a commercial film recording. Clearing its rights for a public site is the user's call.

## Milestone 17: every chariot redone as a true war ratha, with Gemini (16 November 2026)

The user approved redoing the eight older cart-like chariots: `karnaride`, `bhishmawheel`, `jayadratha`, `dronafall`, `karnawheel`, `ghatotkacha`, `sammohana` and `charge` (plus the true-colour `chargecolor` layer).
- **Tool:** gemini.google.com, model 3.1 Pro with High thinking.
  - Every prompt carries a rules block condensed from `docs/MAHABHARATA_VISUAL_REFERENCE.md`: ratha construction, two wheels only, mast emblems per hero, four horses on one pole.
  - Long Gemini chats start silently dropping requests; start a new chat when that happens.
- **Getting full-size images out of Gemini (2912×1440):**
  - Chrome began blocking the page's downloads after several, and the page cannot post to localhost (CSP).
  - Working route: a fetch hook captures the full-size blob from the "Download full-sized image" request, which is re-encoded to JPEG and base64. A page button is clicked to copy it to the clipboard, and `models/clipsave.ps1 NAME` decodes it into `~/Downloads/NAME-download.jpg`.
  - `models/gfix.py` covers Gemini's corner sparkle with texture cloned from nearby; `take.sh` bakes.
- **Fixes caught in inspection:**
  - `jayadratha`: a second near-side wheel (a four-wheeled cart), so a single wheel was requested.
  - `karnawheel`: a whole golden elephant emblem, which is Duryodhana's, so it was replaced with Karṇa's girth-rope.
  - The `chargecolor` colour layer has its sparkle inpainted; its edges were checked against the plaster version (aligned).

## Milestone 16: more of the war, true war chariots (16 November 2026)

- **Bridges:** all 11 are done and active, including the `b-warning` correction to long four-sided pāsaka dice.
- **Six new battle scenes** on `/kurukshetra/`, written from the Bhīṣma, Droṇa, Karṇa and Śalya Parvas and placed in day order:
  - `kalinga`: Day 2, Bhīma on foot against the Kaliṅga elephants;
  - `samshaptaka`: Day 12, the sworn Trigartas;
  - `vaishnava`: Day 12, Bhagadatta's Vaiṣṇava weapon becomes a garland on Krishna;
  - `narayana`: Day 15, the Nārāyaṇa weapon, with Bhīma dragged from his chariot;
  - `nagastra`: Day 17, the serpent arrow takes Arjuna's crown as Krishna presses the chariot into the earth;
  - `shalya`: Day 18, Yudhiṣṭhira's spear.
  - Menus are updated; the duplicate serpent-arrow sentence was removed from `karnawheel`.
- **Chariots:** the user said a chariot "looks like a bull cart, not a war chariot". The prompt spec is now a grand ratha: high gilded walls, shoulder-height iron-rimmed wheels, a tall flagstaff with an emblem banner, a parasol, racked weapons, four plumed horses on one pole, and a raised charioteer's seat. `narayana`, `vaishnava` and `samshaptaka` were re-edited to it. See memory `war-chariot`.
  - Older carvings still show the plain box chariot: `karnaride`, `bhishmawheel`, `jayadratha`, `dronafall`, `karnawheel`, `ghatotkacha`, `sammohana`, `charge`. These are not changed unless the user asks.
- **Banners:**
  - `shalya`'s first render had a European scales-of-justice emblem; the second had a crescent and stars (which reads as a modern flag).
  - The final image was repaired by hand (inpaint, then a carved full-moon disc). The text gives Yudhiṣṭhira a golden moon banner ringed by planets.
- **ChatGPT research:** the user asked that ChatGPT "read the Mahābhārata". A request is queued in the conversation for a cited reference sheet (chariots, every hero's banner, weapons, armour, elephants) as binding rules. ChatGPT's 5-hour limit hit before it answered; it resets at 3:36 PM. Read its answer before the next renders and fold it into the prompts.

## Milestone 15: bridge carvings in the gaps, and a true-colour trial (16 November 2026)

The user rejected both the zoom-to-cover and the continuous column ("don't connect everything, it hurts the experience"). They asked for new creative carvings that fill only the gaps between scenes.

- `place()` is restored to the original anchor-centred rule from 6dd2f0d: natural size, each carving centred on its own section.
- **Bridges:**
  - Gap map from `tests/gaps.mjs 1440 810`: 11 desktop gaps. These are the "story divides" sections, the Gītā intro, the Kurukṣetra gateway, and two seams on the home page.
  - Each gap element carries `data-scene="b-…" data-bridge`. A bridge mesh sits at z −0.0015, so its neighbours draw over it and it only shows in the gap.
  - Prompts put the content in the middle 45% band, with soft carved sky and ground fading out.
  - Done: `b-chapters` (footprints from the wheel to the Gaṅgā at dawn), `b-lineage` (the Gaṅgā's descent from the glacier), `b-firstborn` (a banyan fork: a basket on the river and the road to Gandhāra), `b-altar` (the clay teacher in the forest and the sacrificial fire).
  - Still to generate: `b-warning`, `b-lake`, `b-sight`, `b-armies`, `b-hill`, `b-evening`, `b-moonriver`. These are parked as `data-pending-bridge` in the HTML, and their prompts are in the session's `window.__P`. To activate one, bake it and change its attribute back to `data-scene="NAME" data-bridge`.
- **True-colour trial (user request: one visual "with reality colour", the rest unchanged):**
  - `chargecolor` is a colour repaint of `charge` with the identical composition. It was baked from the colour image itself, so the depth aligns exactly.
  - `public/relief/chargecolor-color.webp` is the albedo; `data-color` loads it into `tColor`.
  - The shader mixes `albedo × relief light` in where the carving is revealed. At rest the wall is still plaster.
  - It is used as the first home beat, and the plain `charge` assets remain.

## Milestone 14: a continuous wall, and robustness off the happy path (16 November 2026)

The user's requests:
- no white spaces between carvings;
- check the reference site;
- make the site work at any time: returning after leaving, no internet, server down;
- cover every front-end rule.

- **Superseded the same day:** the user rejected the cover/zoom approach because it cropped half of each carving, and asked to fill only the gaps between carvings, not the borders. `place()` now lays the carvings at their natural size (scale 1) as one continuous column, edge to edge. Its position is interpolated so each carving is centred exactly when its own section is centred, and glides between neighbours. No zoom, no cropping, no blank wall between carvings. The notes below describe the earlier, replaced rule.
- **Continuous wall (`place()` in `src/relief.ts`):**
  - The problem, measured with `tests/gaps.mjs` (old rule): on phones about half of each page had no carving behind it, because a 2:1 panel fitted to a 390 px width is only 473 px tall. On desktop, 5–13% was uncovered (choice cards, gateways, the Gītā intro).
  - Each carving now owns the stretch from its section to the next carving's section. It is scaled to cover the whole view (`cover = max(1, vh/panelH, vw/panelW)`) and stays fixed (sticky) while that stretch fills the screen, then hands over edge to edge.
  - `wallDelta` follows the panel's on-screen centre, so the reveal stays with the carving.
  - Checked with `tests/strip.mjs` (reduced motion shows every carving): continuous on phone and desktop.
- **Leaving and returning (`src/resilience.ts`):**
  - On hide, sound fades out and resumes on return.
  - `relief.wake()` drops stale pointer history and the frame gap; Lenis resizes.
  - The same happens on bfcache `pageshow`.
- **No internet / server down (`public/sw.js`, registered in production only, scope = base):**
  - Pages are network-first, with the cached copy as fallback, then `offline.html`.
  - Hashed `/assets/` are cache-first.
  - Carvings, paintings and social images are stale-while-revalidate, so redone carvings with the same name refresh.
  - The cache is capped at 400 entries; the shell (all six pages, plaster, noise, favicon) is precached.
  - `tests/serverdown.mjs` actually kills the preview server: a reload still shows the chapter with live carvings, other chapters open, and unknown pages show `offline.html`.
  - A polite live-region notice shows when the connection drops or returns.
  - Bump `VERSION` in `sw.js` only if a non-hashed file must be evicted at once.
- **Failed paintings:** every `main img` gets a framed note (its alt text) instead of a broken image, retried when the connection returns.
- **Head and meta, after checking the reference site's head:**
  - `site.webmanifest`, `apple-touch-icon.png`, `favicon-32.png`, `icon-192` and `icon-512`;
  - `apple-mobile-web-app-title`, `format-detection`;
  - `robots.txt` and `sitemap.xml`;
  - a `<noscript>` rule that removes the loader so the story reads without JavaScript.

## Milestone 13: static carvings, hidden at rest everywhere, no context loss (16 November 2026)

The user reported, from mobile:
- remove the header motion video and keep high-quality static visuals, like the rest of the site;
- carvings inside the chapters showed fully;
- after a while the effect stopped working;
- scrolling still lagged;
- white spaces appeared.

- **Static:** removed every `data-video`, `data-motion` and `data-drift` from all pages. The engine support and the `scripts/relief/make_motion.py` and `make_video_relief.py` tools remain, unused.
- **Hidden at rest everywhere:** `REST_RELIEF` is now 0 and the entrance rise is skipped on every page. Each carving shows only where the cursor or the slow automatic path reveals it, like the original Kurukṣetra wall.
- **Effect dying after a while:** the cause was GPU memory. Each panel uploaded five RGBA 2304×1152 stages with mipmaps (about 70 MB), and several were resident at once, so phones lost the WebGL context and the page fell back to flat images (the "fully revealed" and "white" look). The fix:
  - stages upload as single-channel `RedFormat` (they are greyscale; the shader reads `.r`) with no mipmaps, about 13 MB per panel;
  - load-ahead is 1.8 screens and release is beyond 3;
  - the pixel ratio is fixed at 1.5 (1.25 on touch);
  - a restored context reloads every panel;
  - no background prefetch on touch devices.
- **Lag:** the 16-bit height-map decode and half-float conversion ran on the main thread on every panel load (up to about 480 ms long tasks). It now runs in `src/height-worker.ts`.
  - Measured on the GPU: Kurukṣetra worst frame 7.5 ms, 0 long tasks.
  - `tests/stress.mjs` (3× full scroll on phone and desktop): 0 context losses, no fallback.
  - `tests/shot.mjs` captures a scene at rest and revealed.

## Milestone 12: polish pass for the award submission (16 November 2026, overnight)

The user's goal for the night:
- no carving visible before the cursor reveals it;
- smoother loading and scrolling;
- add the missing stories with visuals;
- carved walls behind the family tree;
- a full bug audit.

- **No glimpse on the home page:** panels with `rest: 0` (all of `index.html` via `<main data-rest="0">`) skip the entrance rise entirely. Only the cursor and the slow path reveal them.
- **Performance (`src/relief.ts`, `src/float.ts`):**
  - Textures decode off the main thread (`THREE.ImageBitmapLoader`, flipY at decode) and upload with `renderer.initTexture` on arrival, so first use on scroll no longer stalls.
  - Pixel ratio is capped at 1.5 and adapts down to 0.75 when frames average over 24 ms.
  - Load-ahead is 2.4 screens.
  - The floating type reads all rects before writing, so there is no layout thrash.
  - Lenis lerp is 0.12.
  - Measured in uncapped Chromium on the GTX 1650: median frame 0.7–1.1 ms, no long tasks while scrolling Kurukṣetra.
  - Probes: `tests/perf.mjs`, `tests/audit.mjs`. These are not part of the suite.
- **New stories (copy written from the Critical Edition outline, each with an inspected ChatGPT carving):**
  - `amba`: Ambā's vow, Hastināpura, after the vow.
  - `hidimba`: Bhīma's watch and Hiḍimbā, after the house of lac.
  - `jarasandha`: in the Sabhā, before the Rājasūya.
  - `hanuman`: Bhīma meets Hanumān, in the Forest.
  - `brahmastra`: the two weapons over the Gaṅgā, Kurukṣetra, after the night raid. The Parīkṣit paragraph moved here from `nightraid`.
  - `forestfire`: the elders' end in the forest, Ascent, before Part VIII.
  - The `brahmastra` render was redone once: the first had a hooked bow tip and a string to the hand.
  - Menus gained the new entries and were renumbered. The Ascent menu had skipped 07, and Jarā's entry was missing.
- **Family tree:** `.lineage-walls` holds three 100svh carved walls behind the tree (`.lineage` min-height 300svh). The walls carry three new carvings, generated after ChatGPT's usage limit reset and each inspected at full size: `roots` (Śantanu, Gaṅgā, Satyavatī, the boy Vyāsa), `tree` (a banyan with the Kauravas under one limb, the Pāṇḍavas and Draupadī under the other, and Karṇa alone at the trunk) and `tellers` (Vaiśampāyana telling the story at Janamejaya's sacrifice). Each has gentle living motion.
- **Site polish:**
  - favicon (`public/favicon.svg`);
  - Open Graph and Twitter tags plus a canonical URL on every page, with 1200×630 cards in `public/social/`;
  - `public/404.html` for GitHub Pages;
  - `scripts/check_site.py`, a static check of links, anchors, images, carving assets, duplicate ids and alts, with 0 problems;
  - no horizontal overflow on any page at 390 px or 1440 px.
- `nightraid`'s copy still ends at the killing of the sleepers; the curse is told in `brahmastra`.

## Milestone 11: home opening from the user's film references, living relief, video carving (16 November 2026)

The user supplied three screen recordings of a film's Kurukṣetra end-credit sequence and asked for:
- the home background to be designed from them, with no wheel;
- carved walls behind the chapter cards;
- motion in the carvings, using free tools only.

The user said the film being copyrighted is fine, but everything must be in our style. Key frames are extracted to `models/film/` (gitignored) and attached to the ChatGPT prompts as composition references only.

- **Opening (`index.html`):** the wheel cold open is gone. Five full-screen beats replace it: `charge`, `elephant`, `field`, `feather`, `walk`. The title card sits in the calm lower third of `walk`. `src/coldopen.ts` is now unused on every page, kept only for history.
- **Chapter walls:** each chapter card is wrapped in a `.chapter-stage` (100svh) carrying a carving from its chapter (`vow`, `dice`, `exile`, `battle`, `journey`), revealed by the cursor around the painting.
- **Route A, living relief:**
  - `scripts/relief/make_motion.py` + `scripts/relief/motion.json` paint `public/relief/NAME-motion.png` (R sway, G flicker, B drift).
  - The shader's `flow()` warps the height and the lit stages together inside those regions, so banners ripple, fires flicker and smoke and clouds drift.
  - `data-motion` loads the map; `data-drift` adds a slow camera dolly.
- **Route B, video carving:**
  - The `charge` carving was animated with the free ZeroGPU Space `zerogpu-aoti/wan2-2-fp8da-aoti-faster` (Wan 2.2), giving 3.5 s at 832×480; the input was the plaster panel. `Gojoosama/wan22-i2v` failed: it asks for 360 s of GPU, over the free limit.
  - `scripts/relief/make_video_relief.py` runs Depth Anything V2 per frame (DirectML, about 2½ min), normalises and smooths the depth over time, and writes `public/relief/charge-video.mp4`: shading above, height below, ping-pong looped.
  - `data-video` plays it as a moving carving once the still has loaded, only while on screen and never with reduced motion.
- Tests: the cold-open test is replaced by "the home opening is five carved beats ending on the title"; the plain-wall test now aborts `charge-height.png`.
- **16 Nov follow-up (user feedback):**
  - The ping-pong loop looked wrong. The clip is now forward-only; it plays once in step with the panel's entrance, then holds its last frame and never restarts.
  - Home carvings were "completely visible". `<main data-rest="0">` now sets a per-panel `rest` (SceneSpec), so after the entrance rise every home carving settles back to bare plaster that only the cursor and the slow path reveal, like the Kurukṣetra wall. Other pages keep `REST_RELIEF` (0.42).
  - The video's own shading follows the reveal field.
  - Vite's dev server answers one range request with 416; this is harmless, as the 206 responses load the video.
- Research for more video (16 Nov): Google Flow (Veo 3.1 Lite, about 50 free daily credits), Dreamina (Seedance, free daily credits, no watermark), Kling (trial credits), Wan 2.2 on free Colab/Kaggle T4 notebooks, and Wan2GP and FramePack locally. Local options need at least 6 GB of VRAM, more than this GTX 1650 has. The user will choose after reviewing the header video.

## Milestone 10: loading, entrances, painting size, bows (15 November 2026)

The user reported four problems; all are fixed and deployed.

- **Carvings appeared flat, "without effect", on opening a chapter.**
  - Cause: `relief.reveal()` set the whole wall to full depth in one frame as the intro lifted, then faded it, so it read as a flat picture.
  - Fix: each panel now has its own entrance (`uRise` uniform; `animateEntrance` in `src/relief.ts`). Once it is fully loaded and centred on screen, it rises out of the plaster over 2.4 s, holds for 1.4 s, then settles to a soft resting relief (`REST_RELIEF` 0.42) so the wall is never blank. The cursor still lifts it fully.
  - Leaving the screen re-arms the entrance. The first entrance waits 650 ms after the loader lifts, so it is seen.
- **White, empty wall where carvings should be.**
  - A panel now counts as ready only when its height map AND all five lighting stages have arrived, and it fades in over 0.5 s.
  - Panels load 3.2 screens ahead (was 1.6) and are released beyond 5.5.
  - After the intro, `prefetchWall()` in `src/main.ts` warms the cache with every panel on the page, one at a time, nearest first. It is skipped when data-saver is on.
- **Chapter paintings filled the screen.** Gateway, chapter-card and Kurukṣetra paintings are now a centred 1.95:1 frame about 52% of the view tall. Chapter card V had been pasted inside the family tree (under Bhīṣma's name); it is back in the chapter list, and a test now guards this.
- **Bows.**
  - Forest header: redone twice. The first edit still had a hooked tip and mismatched limbs, and the user caught it. Arjuna now holds a plain, symmetrical strung bow upright in his left hand. The user then caught that its string floated free of both tips and the top tip ended in a hooked knob. That was repaired by hand in Python (inpaint the knob, draw a tapered tip and a continuous string from tip to tip), not by another AI pass.
  - Also fixed: `swayamvara` (the lower limb snaked into the pool) and `scene6` (hooked, then forked top tip).
  - Rule: zoom on each bow tip; both tips plain and matching, and the string visible from tip to tip.

## Milestone 20: Viśvarūpa header (17 November 2026)

At the user's request the first home carving is new: `vishvarupa` replaces `charge` as `#beginning`'s scene. The old `charge` assets are kept but unused.
- **Source:** ChatGPT, in two passes, recorded in `docs/references/vishvarupa-chatgpt.png`. The second pass was an edit of the first.
- **Subject:** Gītā ch. 11 on the first morning of Kurukṣetra. Kṛṣṇa's universal form, as Mahāviṣṇu, rises over Arjuna's ratha between the two armies.
- **The universal form:** a tall jewelled kirīṭa crown with no peacock feather (Gītā 11.17, 11.46: "with crown, mace and discus"). Tiers of crowned faces, many arms holding Pāñcajanya, Sudarśana, Kaumodakī, a lotus, bows and swords. A galaxy, planets, mountains and rivers in his body, and streams of warriors flowing into him. Gods with joined palms at his flanks. The sun and moon are carved in the halo; his eyes are normal, open and serene.
- **The chariot:** a ratha with one axle, four plumed white horses, and Hanumān (crowned, with mace) on the banner, streaming behind the direction of travel. Kṛṣṇa, as charioteer, alone wears the peacock feather. Arjuna stands with palms joined above his head and Gāṇḍīva laid down.
- **Rejected first render:** sun and moon drawn literally as eyes (the user found them blind-looking), a peacock feather on the cosmic form (the user: that is Kṛṣṇa's, not Mahāviṣṇu's), wheels on two axle lines, and too tight a frame.
- **Bake:** `make_scene.sh` ("full" separation). The 3:2 render sits centred on the 2:1 wall with plaster margins; the headline sits over the calm left sky.

## Milestone 21: head-on charge header (17 November 2026)

`arjunacharge` replaces `vishvarupa` as `#beginning`'s scene; both earlier header carvings remain in `public/relief` unused.
- **Origin:** the user rejected the Viśvarūpa header, then three whole-epic concepts (Vyāsa and Gaṇeśa's story ribbon, the epic inside Kṛṣṇa's feather, the dice-board heroes). They then supplied a painted head-on charge poster.
- **Render:** ChatGPT, with that poster attached as a composition and energy reference only. It is white plaster, not the poster's colours. The poster is kept outside Git at `models/film/charge-poster-ref.jpg`.
- **Content:** a low camera; four horses (the poster had five; Arjuna's team was four); Kṛṣṇa large at the centre holding the reins, with the peacock feather; Arjuna at full draw behind him; Hanumān's banner streaming in the army's wind; one axle; a central pole.
- **Hand repair:** both bow tips came out as curled knobs. I inpainted them and redrew plain tapered points, checked at 6×.
- **Source:** `docs/references/arjunacharge-chatgpt.png` is the repaired image.

## Milestone 22: the two Hastināpura paths, and no flash on refresh (17 November 2026)

- **The Hastināpura "story divides" paths are complete.** Both were previously marked "Being carved".
  - **A · The forgotten firstborn** (`kuntiriver`): Kuntī sets Sūrya's son, born with armour and earrings, adrift on the Aśvā; Adhiratha and Rādhā raise him as Karṇa.
  - **B · The curse of Gāndhāra** (`gandhara`): Gāndhārī binds her eyes; Śakuni stays at court. The text says plainly that the prison, rice and bone-dice tale is from later retellings, not from Vyāsa.
- **Sources:** both carvings are ChatGPT plaster renders, kept in `docs/references/`. In `gandhara`, a distant caravan of Western-looking hooped wagons was inpainted away by hand.
- **No flash on refresh:** every page now hides its body inline (with the `#c8c8c8` plaster background) until `style.css` loads, which sets `body { visibility: visible }`. This removes the brief unstyled flash of blue links on refresh, seen in dev, where Vite injects the CSS from JavaScript.

## GPU speed-ups (14 November 2026)

The user asked to use the GPU (GTX 1650) to speed up the work.

- **Tests:** `playwright.config.ts` runs Chromium on the discrete GPU on Windows (`--use-angle=d3d11 --force_high_performance_gpu --ignore-gpu-blocklist`; verified renderer "NVIDIA GeForce GTX 1650 … D3D11") with 3 parallel workers. The full suite of 13 tests runs in **56 s instead of 5½ min**. CI, cloud runs or `PW_SOFTWARE=1` keep SwiftShader with one worker.
- **Relief bake:** the horizon scan (19 directions × 45 bilinear shifts, the bulk of the bake) runs on the GPU through `scripts/relief/gpu_horizon.py`.
  - It is an ONNX graph run by onnxruntime-DirectML: one compiled session whose tap offsets and weights are inputs, so a single compile serves every direction.
  - It needs `pip install onnx`. `RELIEF_CPU=1` forces the CPU path, and any GPU error falls back automatically.
  - The result matches the CPU path to about 1e-4. Bake time went from 93 s to 56 s; depth on DirectML is about 25 s.
  - Don't batch all 19 directions into one graph: the dispatch runs long enough that Windows resets the GPU (TDR).
- The remaining wait per panel is ChatGPT's generation (about 2–3 min). Bake each panel while the next one generates.

## Public site (GitHub Pages)

The user asked to make the site public. It is live at **https://sekhar7377.github.io/bhagavadgita/**.

- `.github/workflows/pages.yml` builds with `BASE_PATH=/bhagavadgita/` and deploys on every push to `claude/festive-hamilton-s0cee2`.
- The repo's `github-pages` environment has a branch policy that allows that branch.
- Asset URLs in code use `import.meta.env.BASE_URL` (`vite.config.ts`), so never hard-code `/relief/...` paths.
- Local builds on Git Bash need `MSYS_NO_PATHCONV=1` when setting `BASE_PATH`.

## Git

Origin `https://github.com/sekhar7377/bhagavadgita.git`. This session's work is on branch `claude/festive-hamilton-s0cee2`; `main` holds milestone 01. Read `git log -5 --oneline` and `git status` before editing. Never force-push.
