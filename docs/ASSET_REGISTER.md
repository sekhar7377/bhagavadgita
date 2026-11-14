# Supplied visual reference register

Inspected 13 November 2026. This is an intake record, not a claim that footage is cleaned or ready for publication. User request: use supplied visuals when useful, remove visible captions/letters from selected production imagery, and generate compatible original visuals. Original footage is retained outside the repository; no raw videos are committed.

## Intake status

| ID  | Supplied file                                                          | Sediment file ID                        | Status                                                                           |
| --- | ---------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------- |
| V01 | Kalki 2898 Ad Movie Opening Scene … GizmoPixelParody (1080p, h264).mp4 | `file_0000000065e082089e6b0871f2a9d218` | Downloaded; inspected 12 sampled frames and a full-resolution frame at 7 seconds |
| V02 | Screen Recording 2026-11-13 192337.mp4                                 | `file_0000000010708211bc2821a518fe0aae` | Downloaded; inspected contact sheet and extracted first frame                    |
| V03 | Screen Recording 2026-11-13 192807.mp4                                 | `file_000000000e4082088b666ebce0ff4405` | Downloaded; inspected its single source frame                                    |
| V04 | Screen Recording 2026-11-13 192933.mp4                                 | `file_0000000091bc8211a33cd323d620fb22` | Transfer blocked: exceeds executor tool's 32 MiB limit; content not inspected    |
| V05 | Screen Recording 2026-11-13 192452.mp4                                 | `file_00000000ef6882088ee225139f88cafe` | Transfer blocked: exceeds executor tool's 32 MiB limit; content not inspected    |
| V06 | Screen Recording 2026-11-13 192623.mp4                                 | `file_00000000bcd48208b28429e785d79e95` | Transfer blocked: exceeds executor tool's 32 MiB limit; content not inspected    |
| V07 | Screen Recording 2026-11-13 193216.mp4                                 | `file_00000000c59082088d0ee885a69ca4dd` | Transfer blocked: exceeds executor tool's 32 MiB limit; content not inspected    |

## Observations and production choices

### V01 — battlefield / chariot reference

- 1920 × 1080, 24 fps, 57.464626 seconds, 23,116,328 bytes; audio stream present, not auditioned.
- Opening credit sequence: deep bronze and brown, dusty orange light, a monumental battlefield, chariots and decorated wheels, horses in motion, hanging arrows, dramatically suspended dust/debris. Subjects are staged like highly detailed sculptural tableaux.
- Most sampled frames contain film credits. Letterbox bars are embedded. A creator watermark is visible in the lower black bar, including at 7 seconds. Do not call the source caption-free.
- At 7 seconds: ornate circular frame around a chariot, two figures, horse team and distant battle. No credit text observed inside this selected active picture; watermark remains in bottom letterbox bar. This is a useful composition / material reference for original relief artwork, not a ready-to-use clean production image.
- Do not infer exact character identities or canonical events from the movie depiction. It supplies art direction, not scriptural authority.

### V02 — droplet / splash reference

- 1920 × 1080, 30 fps, 1.2 seconds, 634,300 bytes; audio stream present, not auditioned.
- Red-brown suspended droplet over a luminous amber-red field, becoming a crown-like liquid splash.
- Embedded subtitle reads “I stand at the end of time.” A mouse cursor sits in the top black letterbox bar. The subtitle is film content, not a verified Bhagavad Gītā quotation; do not reuse as scripture.
- A tighter crop could avoid subtitle and cursor but sacrifices lower splash detail. Prefer using its material / color language as a reference for generated original imagery. No cleanup has been performed.

### V03 — still chariot at sunset

- 1920 × 1080, 30 fps metadata, 0.0333 seconds (one frame), 87,841 bytes; audio stream reported. This is a still-frame reference, not usable motion footage.
- Low-angle chariot canopy, banner and robed figure against enormous amber clouds; low sun at right; distant army across the horizon. Strong atmospheric scale, restrained bronze ornament, silhouetted subject.
- No lettering observed in the active image. Embedded black bars occupy approximately y=0–137 and y=942–1079; a mouse cursor lies within the top bar. Candidate active-picture region: x=0, y=138, width=1920, height≈804. Crop must be visually checked if produced.
- Best supplied reference for an initial original chariot composition. Preserve scale and atmosphere while translating it into quiet ivory relief for the opening, reserving cinematic saturation for story windows.

## Local working files

These paths belong to the current workspace and may not exist after a fresh clone. Re-download from the Sediment IDs above if the attachments are still accessible. If the four oversized references become necessary, obtain compressed excerpts or stills through a supported file transfer; do not claim to have inspected them.

- V01 original: `/workspace/attachments/d4ba532f-2329-46bc-9e2a-49821c861fa4/Kalki 2898 Ad Movie Opening Scene 4k Ultra Hd  Prabhas  Amitabh bachaan  kamal Hassan  deepika  - GizmoPixelParody (1080p, h264).mp4`
- V02 original: `/workspace/attachments/4123ed54-a8da-421d-863e-5109ed20d8c3/Screen Recording 2026-11-13 192337.mp4`
- V03 original: `/workspace/attachments/887da3f0-15d4-4e60-b37d-c5f62399551b/Screen Recording 2026-11-13 192807.mp4`
- Metadata, sizes and SHA-256 hashes: `/workspace/media-intake/metadata.json`
- Contact sheets: `/workspace/media-intake/kalki-contact.jpg`, `/workspace/media-intake/192337-contact.jpg`, `/workspace/media-intake/192807-contact.jpg`
- Full-resolution unmodified extracted frames: `/workspace/media-intake/kalki-frame.png` (7 seconds), `/workspace/media-intake/192337-frame.png` (0 seconds), `/workspace/media-intake/192807-frame.png` (only frame).

## Next production step

Create original ivory-stone artwork with V01/V03 as visual reference, with no lettering, captions, logo or watermark. Keep the relief system as actual deforming geometry; a generated illustration alone does not satisfy the brief's interaction requirement. Inspect generated output before integration. Record generation provenance and any subsequent crops/cleanup here. No supplied media has been cleaned, integrated or published as part of this intake.

## Integrated production assets — milestone 01

### A01 — original Kurukṣetra cinematic window

- Generated with image_gen on 13 November 2026 using V03's unmodified frame as the image reference. Direction: carved wooden/bronze chariot, thoughtful Arjuna and Krishna, pale horses, vast dusty battlefield, amber light and storm clouds, sacred stillness, no lettering, captions, cursor or black bars.
- Original: `docs/artwork/kurukshetra-original.png` (1536 × 1024). Web derivative: `public/art/kurukshetra.webp` (same pixels/dimensions, WebP quality 88, ~264KB). Original source retained; conversion only, no cleanup claim.
- Inspected generated image: no visible lettering or interface. Original interpretive artwork, not cleaned film footage. Character designs remain provisional until the full reference set is available and a continuity sheet is agreed.
- Displayed in an offset story window with responsive CSS crops; marked “AN ARTISTIC INTERPRETATION.” Not used to fake the 3D relief.
- Relevant source frames retained in Git for future models: `docs/references/chariot-source.png` (V03) and `docs/references/wheel-source.png` (V01 at 7s). These are reference-only, still contain their original letterbox areas, and are not served by the website.

### G01 — original procedural sculpture

`src/relief.ts` creates wheel, lotus, bow and conch relief numerically. No external relief model or reference-site mesh is copied. This is provisional symbolic geometry, not final figurative Krishna/Arjuna sculpture. Pointer field is a CPU-updated texture; final GPU feedback-field and detailed model production remain outstanding.

## Second-session intake — 13 November 2026

The user re-supplied footage as five files under 32 MiB. All were downloaded and inspected by contact sheet (20 frames each).

| ID  | File                                            | Content                                                                                                                       |
| --- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| R1  | Screen Recording 2026-11-13 202451.mp4 (28.7 s) | Film opening credits: battlefield tableaux, chariots, wheel held aloft, arrows. Credits in most frames                        |
| R2  | Screen Recording 2026-11-13 202649.mp4 (23.4 s) | Chariot and horses, fallen elephant, soldiers, fire in grass. Credits and subtitles                                           |
| R3  | Screen Recording 2026-11-13 202850.mp4 (28.8 s) | Aftermath field, banners, figure against the sun, close portrait                                                              |
| R4  | Screen Recording 2026-11-13 202951.mp4 (26.8 s) | Confrontation, figures in white, wide aftermath. Subtitles                                                                    |
| R5  | Kalki 2898 AD opening (57.5 s)                  | Same file as V01                                                                                                              |
| R6  | Screen Recording 2026-11-13 211601.mp4 (28.8 s) | **Recording of the reference website** on the user's GPU: opening reveal, scroll to statement, film window, centred statement |

R1–R5 are commercial film footage with credits, subtitles and recognisable performers. The project owner decided they may be used as source material, with credits and captions removed. See G03 below for what is used. R6 is evidence of reference behaviour; two cropped frames are kept in `docs/reference-study/2026-11-13-b/`.

The user also supplied a still of the reference studio's sculpture under dark dramatic light (birds, flowers, vines in thick high relief). It sets the target for sculptural volume. Not stored in the repository.

## Integrated production assets — milestone 02

### G02 — Kurukṣetra bas-relief (replaces G01)

- Source: A01 (`docs/artwork/kurukshetra-original.png`), this project's own generated image.
- Depth: Depth Anything V2 Large, ONNX on CPU, input 1526×1022.
- Build: `scripts/relief/build_relief.py`. Outputs in `public/relief/`: `kurukshetra-height.png` (16-bit height in R,G; 1152×576), `kurukshetra-stage1..5.webp` (baked lighting at 20–100% extrusion; 2304×1152), `kurukshetra-fallback.webp`, `plaster.webp` and `noise.png` (procedural, tileable).
- No reference-site model or texture and no film frame is used. The reference's plaster texture was downloaded only to compare statistics and was not kept.
- Limits: anatomy and fine form are as good as a depth estimate of a 1536×1024 image allows. Not hand-sculpted.

### G03 — wheel-bearer relief element

- Source: R5 at 30.2 s, cropped to x 700–1420 of the 1920×800 active picture (no credit text inside the crop).
- Kept in the repository: `docs/relief-sources/wheelbearer-depth.png` (16-bit depth) and `wheelbearer-luma.png` (greyscale crop, used only for fine surface detail). `docs/relief-sources/chariot-depth.png` is the chariot's depth from A01.
- Placed right of the chariot by `scripts/relief/elements.json`. The figure is soft because the source frame is dark and motion-blurred.

### G04 — chariot tableau, Gemini plaster render (replaces G02/G03 on the wall)

- Generated 13 November 2026 in Gemini (the user's own account, in the browser) with two attached references: the V01 frame at 7 s cropped to the picture (subject), and two crops of the user's studio-sculpture still (style). Prompt: "Take the SUBJECT and composition from image 1: the canopied pavilion war chariot with a banner on a tall pole, an archer with a long bow standing under the canopy, the charioteer standing at the front holding the reins, the team of horses leaping forward to the right, the large spoked wheel. Render it in the exact SCULPTING STYLE of image 2: soft, organic, naturalistic high relief with thick rounded swelling volumes, deep undercuts, flowing forms, fanned feathers and petals, the sculpture emerging seamlessly from the wall with no frame or border. Add lotus flowers, buds and curling vines growing from the lower edge and weaving around the wheel and horses' legs, and two birds with fanned wings in flight above the horses, all in the same style. Material: pure matte pale grey-white plaster, uniform, like a cast. Lighting: soft even frontal light, gentle shadows. Straight-on orthographic view. Wide 2:1. No background scene, no sky, no dust, no text, no logo, no frame, no colour."
- Output 2912×1440: `docs/references/chariot-plaster-v2.png`. The visible Gemini sparkle was removed with `scripts/relief/clean_mark.py` (inpainted from bare wall). Inspected: no text or lettering. The invisible provenance watermark is not altered.
- Depth: Depth Anything V2 Large → `docs/relief-sources/chariot-v2-depth.png` (16-bit) and `chariot-v2-luma.png`.
- Also generated with text-only prompts and placed on the wall after the user reviewed them: `wheelbearer-plaster.png` (2048², warrior lifting a wheel overhead, matching the film's wheel-bearer) and `lotus-plaster.png` (2912×1440, lotus, vines, two cranes; used twice, once mirrored). Depth in `docs/relief-sources/wheelbearer-v2-*` and `lotus-v2-*`. `chariot-plaster.png` is unused. All sparkle-cleaned.
- R7–R10: four screen recordings of the film's opening supplied by the user on 13 November 2026 (see HANDOFF next work, item 1). Credits and subtitles are burned in; reference only, not stored in Git.

### G05 — chariot battlefield panel, ChatGPT plaster render (wall centrepiece, 14 November 2026)

- Subject: the user's own ChatGPT painting, saved as `docs/references/chariot-chatgpt-subject.png` (1536×1024). Style reference: the two studio-still crops (carving manner only; the prompt forbids adding anything from it).
- Generated in ChatGPT (user's Plus account, browser). First attempt removed the background (`chariot-plaster-chatgpt.png`); the user rejected it. Final prompt asked to carve the entire scene as one plaster relief panel: chariot group in deep relief, then armies, banners, hills, clouds and sun in progressively lower relief, uniform matte plaster, soft frontal light, no text or frame.
- Output: `docs/references/chariot-battlefield-chatgpt.png` (1536×1024). No visible watermark. Inspected: no text or lettering.
- Depth on GPU (DirectML), long side 1022 → `docs/relief-sources/battlefield-cg-depth.png` and `battlefield-cg-luma.png`.

### G06 — scene 2 "The bow lowers", ChatGPT plaster render (14 November 2026)

- Same ChatGPT conversation as G05, for character and ornament continuity. Prompt asked for a completely different camera from earlier panels: an intimate eye-level view on the chariot, Arjuna large on the right in grief, the bow sliding from his hand in a diagonal across the foreground, quiver tipping, Krishna in the left third turned toward him with calm compassion, canopy bells across the top, armies glimpsed small between them; uniform plaster, no text or frame.
- Output 1774×887: `docs/references/scene2-falling-bow-chatgpt.png`. Inspected: no text. Depth (GPU, 1022) → `docs/relief-sources/scene2-depth.png`, `scene2-luma.png`.
- Rejected first attempt, kept for record: `docs/references/scene2-arjuna-grief-chatgpt.png` (same wide composition as scene 1).
- Film window: `public/art/kurukshetra.webp` re-encoded from the user's own painting `docs/references/chariot-chatgpt-subject.png`.

### G07 — scenes 3–6 and the battle scene, ChatGPT plaster renders (14 November 2026)

All in the same ChatGPT conversation as G05/G06 (user's account, browser), each with a camera chosen to differ from every earlier panel. 1774×887 each, inspected: no text or lettering. Built with `scripts/relief/make_scene.sh` (GPU depth at 1022, `full` separation, paint 1.0).

| Scene  | File                                                | Moment                            | Camera                                                |
| ------ | --------------------------------------------------- | --------------------------------- | ----------------------------------------------------- |
| scene3 | `docs/references/scene3-teaching-chatgpt.png`       | Ch. 2, the teaching begins        | low angle from the chariot floor, canopy as halo      |
| scene4 | `docs/references/scene4-lamp-chatgpt.png`           | Ch. 6, the steady lamp (symbolic) | frontal, lamp centre, figures either side, lotus pond |
| scene5 | `docs/references/scene5-universal-form-chatgpt.png` | Ch. 11, the universal form        | monumental frontal, tiny Arjuna below                 |
| scene6 | `docs/references/scene6-clarity-chatgpt.png`        | Ch. 18, clarity                   | from behind and below, Arjuna lifting the bow         |
| battle | `docs/references/battle-conches-chatgpt.png`        | Ch. 1, the conches sound          | low, inside the charge, diagonal                      |

The battle render used three image inputs: two frames from the user's recordings R7 (`Screen Recording 2026-11-13 202451.mp4`, the opening charge; credit line in the sky inpainted) and R8 (`…202649.mp4`, golden chariots and a flying arrow; cropped to a text-free centre strip), plus `chariot-battlefield-chatgpt.png` for chariot design and carving style. The frames are reference inputs only and are not stored in Git.

### G08 — cold open wheel, ChatGPT plaster render (14 November 2026)

`docs/references/wheel-coldopen-chatgpt.png`, 1774×887. Made in the same ChatGPT conversation, with `chariot-battlefield-chatgpt.png` attached for wheel design and carving style. Subject: a shattered ornate chariot wheel half-buried in churned battlefield earth, with arrows, a torn banner, a bow, and a far smoking field with a low sun. Inspected: no text, people or watermark. Built with `make_scene.sh wheel` (GPU depth at 1022, `full`, paint 1.0) into `public/relief/wheel-*`.

### G09 — Part I panels, ChatGPT plaster renders (14 November 2026)

All 1774×887, made in the same ChatGPT conversation (the first with `chariot-battlefield-chatgpt.png` attached for style), each with a camera distinct from the others. Inspected: no text or watermark. Built with `make_scene.sh` into `public/relief/NAME-*`.

| Name        | File                                      | Scene                                     | Camera                       |
| ----------- | ----------------------------------------- | ----------------------------------------- | ---------------------------- |
| hastinapura | `docs/references/hastinapura-chatgpt.png` | Part I header, the empty throne           | symmetrical one-point hall   |
| vow         | `docs/references/vow-chatgpt.png`         | Devavrata's vow at the Gaṅgā              | very low, at the water       |
| blindcrown  | `docs/references/blindcrown-chatgpt.png`  | Gāndhārī's blindfold, Dhṛtarāṣṭra, Śakuni | intimate medium two-shot     |
| forest      | `docs/references/forest-chatgpt.png`      | Kuntī's mantra, five divine sons          | high wide over the hermitage |
| pots        | `docs/references/pots-chatgpt.png`        | the hundred and one jars                  | low, deep vault perspective  |

### G10 — Part II panels, ChatGPT plaster renders (14 November 2026)

All 1774×887, made in the same ChatGPT conversation, each with its own camera. Inspected: no text or watermark. Built with `make_scene.sh`.

| Name       | File                                     | Scene                                  | Camera                        |
| ---------- | ---------------------------------------- | -------------------------------------- | ----------------------------- |
| arena      | `docs/references/arena-chatgpt.png`      | Part II header, Arjuna's three weapons | high crane over the arena     |
| karna      | `docs/references/karna-gate-chatgpt.png` | Karṇa enters                           | extreme low elevation         |
| anga       | `docs/references/anga-chatgpt.png`       | the king of Aṅga bows to Adhiratha     | intimate medium               |
| lac        | `docs/references/lac-chatgpt.png`        | the house of lac                       | cutaway cross-section         |
| swayamvara | `docs/references/swayamvara-chatgpt.png` | the target                             | upward diagonal               |
| hut        | `docs/references/hut-chatgpt.png`        | share it equally                       | from inside, through the door |
| ekalavya   | `docs/references/ekalavya-chatgpt.png`   | branch A, the offering                 | side-on, kneeling height      |
| altar      | `docs/references/altar-chatgpt.png`      | branch B, born from the altar          | frontal, symmetrical          |
