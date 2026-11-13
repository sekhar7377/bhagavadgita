# Supplied visual reference register

Inspected 13 November 2026. This is an intake record, not a claim that footage is cleaned or ready for publication. User request: use supplied visuals when useful, remove visible captions/letters from selected production imagery, and generate compatible original visuals. Original footage is retained outside the repository; no raw videos are committed.

## Intake status

| ID | Supplied file | Sediment file ID | Status |
| --- | --- | --- | --- |
| V01 | Kalki 2898 Ad Movie Opening Scene … GizmoPixelParody (1080p, h264).mp4 | `file_0000000065e082089e6b0871f2a9d218` | Downloaded; inspected 12 sampled frames and a full-resolution frame at 7 seconds |
| V02 | Screen Recording 2026-11-13 192337.mp4 | `file_0000000010708211bc2821a518fe0aae` | Downloaded; inspected contact sheet and extracted first frame |
| V03 | Screen Recording 2026-11-13 192807.mp4 | `file_000000000e4082088b666ebce0ff4405` | Downloaded; inspected its single source frame |
| V04 | Screen Recording 2026-11-13 192933.mp4 | `file_0000000091bc8211a33cd323d620fb22` | Transfer blocked: exceeds executor tool's 32 MiB limit; content not inspected |
| V05 | Screen Recording 2026-11-13 192452.mp4 | `file_00000000ef6882088ee225139f88cafe` | Transfer blocked: exceeds executor tool's 32 MiB limit; content not inspected |
| V06 | Screen Recording 2026-11-13 192623.mp4 | `file_00000000bcd48208b28429e785d79e95` | Transfer blocked: exceeds executor tool's 32 MiB limit; content not inspected |
| V07 | Screen Recording 2026-11-13 193216.mp4 | `file_00000000c59082088d0ee885a69ca4dd` | Transfer blocked: exceeds executor tool's 32 MiB limit; content not inspected |

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
