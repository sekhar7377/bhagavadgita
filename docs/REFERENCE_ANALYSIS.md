# Immersive Garden reference study

13 November 2026. User steering: inspect the live cursor-driven reveal FIRST; aim for faithful interaction and composition, informed by the supplied footage. Do not expand the prototype until the interaction/art mismatch is resolved.

## Evidence status

- **Live access verified:** HTTPS 200 after environment network revision 2. Earlier CONNECT 403 and Chromium tunnel failure are historical, not the current blocker.
- **Public source verified this session:** current HTML, `/assets/entry.DyxL_KXi.js`, and high-relief GLB JSON metadata. Entry SHA-256: `03005fd5882e0ad17e433c6e9b98e50f58defdaae42c02645821a4e7b1b4fffc`.
- **Browser:** Chromium 156, Linux, software WebGL (SwiftShader); desktop 1440×900 and 1150×720. The live site selected `reliefs_low_compressed.glb` in both runs. This is not a physical high-end GPU or mobile-device test.
- Initial captures were contaminated by the loader: mounting occurs after DOMContentLoaded, so a premature “loader absent” test was insufficient. Those captures are not motion-fidelity evidence. Corrected script waits for hydrated `.introLoader.main.loading` to attach and subsequently clear before capturing.
- Original site assets/source remain research-only under `/workspace/reference-study`; no studio model, texture or compiled source is included in the application.

## Confirmed rendering mechanism

| Part | Verified behavior | What this means visually |
| --- | --- | --- |
| Persistent field | Two 256×256 render targets alternate read/write; floating-point with a half-float device branch | Movement accumulates; the state survives individual pointer events |
| Channels | R/G contain signed velocity, B a nonlinear speed response, A coverage | Direction, speed and coverage are distinct; a single grayscale brush cannot reproduce the system |
| Input easing | Position coefficient 0.4; velocity 0.1 while moving and 0.04 at zero speed | The sculpture responds with controlled lag and a different release response |
| Footprint | Configuration 0.38, multiplied by 0.5; aspect-corrected radial falloff | Scale must be calibrated in screen space, not arbitrary CSS pixels |
| Irregularity | Noise-modulated stamp, 0.15 baseline plus 0.85 variable component | Detail emerges unevenly rather than inside a uniform flashlight circle |
| History | Additive stamps plus frame-adjusted dissipation 0.953 | Old gestures overlap with new ones and settle gradually |
| Deformation | Average of B/A drives local Z scaling from 0.05 toward 1; X/Y multiplier 1.004 | Actual modeled sculpture flattens into and rises from the wall |
| Shading | Same field sampled at twice strength; two RGB textures encode scalar shade stages | Fine carving becomes legible before the maximum depth; shadows are not a frozen beauty image |
| Shade sequence | Second texture B/G/R then first B/G/R, with level-zero overwritten by 0.54504; five successive 0.2 intervals | A staged baked response, not simply dynamic lighting on one image |
| Plaster | Shared mineral texture and broad gradient | Sculpture/background read as one material |
| Automatic input | Separate path, 1–3 steps ~0.7–1.0s, then randomized 1–3s pause; initialized with scene | The wall continues discovering details without a moving user pointer |
| Scroll | Existing field is reprojected; section pitch 9.995; scroll contribution 0.25; offset clamp 0.2 | Persistent reveals remain coordinated with the changing sculpture position |
| Fast mode | Additional animated noise extrusion and zoom response | Fast-scrolling state is separate from ordinary cursor movement |

No-input decay at a nominal 16ms step multiplies the previous field by 0.953 (roughly 0.23 seconds per half-life at 62.5 updates/s). This is **not** the visible trail duration: additive input, stationary coverage, shading thresholds, speed relaxation and autonomous input affect what remains visible. Do not claim a measured fade duration from this number.

High-model metadata: 18 meshes, 6 materials, 12 images; `EXT_texture_webp` and `KHR_draco_mesh_compression`. Download length 5,994,032 bytes. Only the header/JSON range was fetched for metadata inspection. Counts describe the source pipeline, not the required composition of the Gītā scene.

## Why the current prototype is not a match

| Current project | Required direction |
| --- | --- |
| Generic procedural wheel, lotus, bow, conch | A cohesive, detailed carved tableau using chariot, figures, horses and ornament from user references |
| CPU single-channel field | GPU RGBA feedback with separate velocity, speed and coverage behavior |
| Symmetric soft stamp | Irregular noise-modulated additive marks and tuned pointer lag |
| One live-light response | Aligned multi-stage shading or an equivalent measured response that reproduces the reference |
| Sinusoidal automatic motion | Deliberate independent bursts and pauses, calibrated to observed movement |
| Static hero scene removed during scrolling | Coordinated field reprojection, section recycling and transition state |
| Centered large heading, top-left identity, vertical side copy | Match the reference's restrained composition and actual measured type before adding extra labels |

The prototype remains useful as an engineering spike and fallback experiment, not as an approved visual design or passed fidelity gate. Do not patch it with a bitmap spotlight and call that an exact replica.

## Supplied visuals — observed, not inferred

See `ASSET_REGISTER.md` for full IDs, sizes and paths.

- **V01 / Kalki opening:** dimensional tableaux, a foreground ornamental wheel framing chariot and horses, layered armies, suspended arrows/debris, bronze/dark carved detail and dusty amber atmosphere. Strong reference for sculptural overlap and depth hierarchy. Many credits are inside the picture; watermark is in the lower bar. The selected 7s frame has no observed in-picture credit, but remains reference-only.
- **V03 / 192807:** one still frame, not a motion clip. Low-angle chariot canopy, banner and figure against a vast golden sky. Use for silhouette, monumental scale and negative space. Cursor sits in the top black bar; no observed lettering in the active image.
- **V02 / 192337:** 1.2s red droplet/splash, film subtitle and cursor. Can inform a later symbolic transition, not the opening's primary sculpture. The subtitle is not scripture.
- **V04–V07:** not inspected; each exceeds the 32MiB transfer tool limit. Request smaller excerpts/stills when these references are needed. Do not invent their content.

Translation into the new artwork: retain fine chariot ornament, meaningful figure/horse overlap, believable anatomy and vast narrative scale; convert the opening's materials to pale mineral relief. Reserve amber cinematic color for the later image/film window. The first generated image is provisional and does not establish final character continuity. Production images need clean lettering-free compositions; no cleanup of the raw film clips has been completed.

## Next acceptance work

1. Record reference rest, slow sweep, fast diagonal, small circles, stationary pointer, pointer exit, edge strokes, slow/fast/reverse scroll, resize and menu entry/exit at matched viewports.
2. Separate observed visuals from code-derived facts. Automatic input remains active in the public site; do not attribute every change to the user pointer.
3. Prepare one detailed original representative sculpted Gītā scene with stable geometry/UVs and coherent shading stages. Resolve this asset pipeline before expanding all chapters.
4. Implement the GPU field and a developer inspector (independent user/auto input, frozen clock, channels, wireframe/depth, shading stages).
5. Compare reference and original adaptation side by side in motion. Preserve real depth and art quality. Keep the gate open until demonstrated; no “exact replica” claim from a still screenshot.

## Settled live observations (separate from source findings)

The initial scripted recordings still captured part of the loader's exit: the `loading` class clears before `lockScroll` and the background exit animation finish. They are excluded as fidelity evidence. A separate persistent browser was allowed to settle and inspected interactively; the following screenshots were viewed directly and retained in `docs/reference-study/`.

- `rest.png`: almost all ornamental relief has receded into a continuous light grey mineral/plaster surface. Fine texture remains; the opening is not a constantly fully visible white sculpture.
- `sweep.png`: a traverse from approximately (160,260) to (850,280) reveals broad connected areas, including two birds, individual feathers, stems and several flower folds. These are recognizable volumetric subjects, not geometric icons. The footprint is irregular and preserves other recently revealed areas.
- `stationary.png`: with the pointer remaining near the right bird, the earlier left-hand sweep has largely receded while the right bird and adjacent folds stay legible. This agrees with separate coverage and speed signals. Autonomous input was active; this is not a controlled no-injection decay test.
- `fast-stroke.png`: a three-step move to the opposite lower-left area reveals new floral detail while some previous right-hand carving remains. The browser's software renderer prevents treating the requested step count as a measured pointer-speed/frame-rate equivalence.
- Attempted off-viewport pointer movement did not establish a true browser pointer-exit/input-off state; the captured cursor and localized coverage remained. Pure no-input decay remains a separate diagnostic requirement, not an observed result here.
- A wheel input shifts the ornamental wall and advances to a large left-aligned statement plus a film window while retaining peripheral controls. The site uses virtual scroll: `window.scrollY` remained zero while content visibly moved. Some sampled text frames are transitional/glitched in this software renderer, not the intended finished typography.

At 1150×720 the opening band places identity on the left, the sentence in the middle, and “Scroll down” on the right. Its computed baseline font is `PSTimes, serif`, 28px, with line box approximately x394/y340/w456.5/h33.6. The earlier supplied audit's sampled 44.74px refers to a different sampled text/state; do not override this actual measurement. Menu sits at upper-right and projects/sound controls at the lower corners. No hero eyebrow, subtitle or vertical caption is present in this opening. Current project composition must be corrected accordingly.

These observations plus live source verification are sufficient to reject the current prototype as an exact match and define the reconstruction. They do **not** certify final adaptation fidelity, high-end GPU timing, all routes or all screen sizes.

## Reproduction notes

`node scripts/inspect-reference.mjs` is a research helper using system Chromium and the environment's inherited HTTPS proxy. It writes outside the repository by default; set `REFERENCE_OUTPUT` to choose a location. Final loader gating now waits for the hydrated loader, released scroll lock, faded loader background and faded main-loader word. That final helper revision passed `node --check`; the retained settled evidence above came from the interactive persistent browser, not a full rerun of this helper. Always inspect captures before labeling a sequence valid.

The menu link navigates to `/the-studio/` and begins a pale-to-dark sculptural transition. This software browser produced prolonged intermediate frames; a settled final menu comparison is not claimed in this study. The supplied source audit describes the intended dark menu. Do not treat the captured intermediate text artifacts as target typography.

Current-instance network access is verified. No agent publication was performed. Future environment publication/restoration is a separate product action, not established by successful browsing or Git pushes.
