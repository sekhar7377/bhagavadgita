# Session handoff — start here

Last updated: 13 November 2026. Project: **Bhagavad Gītā — The Stillness Before Action**.

## User intent (persistent)

Build a carefully crafted, immersive Gītā experience **one milestone at a time**. User delegates building decisions and will give feedback. Keep completed work in Git and maintain this file so another model can pick up without repeating discovery. Supplied footage guides the visual language; production imagery should have no captions/letters. Original generated visuals are welcome. Current user request overrides the embedded master prompt's demand to finish everything in one session.

Do not republish or reconfigure the cloud environment. User already published it and asked not to reapply previous setup changes. Application Git pushes are separately authorized by the latest request.

## Latest steering — do this before further building

User explicitly asked to inspect https://immersive-g.com/ FIRST, especially cursor flow/artwork reveal, seeking exact interaction fidelity, and analyze supplied visuals. UI expansion was paused. Network initially blocked the site; after user said “continue,” environment revision 2 allowed access (HTTPS 200). Live inspection and public-code verification are now completed to the scope in `docs/REFERENCE_ANALYSIS.md`. Read that file and `docs/reference-study/` images before building more. Actual settled captures show rest, sweep, stationary coverage and opposite-side stroke. Early recordings were loader-contaminated and must not be used as evidence. Software Chromium selected the site's low-detail model; no high-end performance or exact-match claim.

Next priority: replace the approximate interaction and composition with the measured reference behavior, and produce a detailed original chariot/figures/horses relief from user references. Do not present simple symbols as equivalent. The current typography/identity placement also differs (reference's 28px opening sentence and horizontal identity/sentence/scroll band at 1150×720). No further UI changes were made during the reference study.

## What exists now

Milestone 01: functional opening prototype, not the final full experience.
- Vite + strict TypeScript + Three.js; self-hosted Cormorant Garamond and DM Sans.
- Ivory symbolic bas-relief: original wheel, bow, lotus, conch; actual vertex displacement driven by persistent pointer field; autonomous reveal and coherent normals. Desktop pointer reveals, mobile composes/crops motifs and retains native scrolling. Pause/reduced-motion and WebGL fallback.
- Editorial opening and prologue, original generated cinematic battlefield image guided by supplied chariot reference, reflection section, dark accessible dialog menu, working section links, source/editorial disclaimer.
- No fake chapter routes, sound toggle, Sanskrit verses or translated quotes.
- `AGENTS.md` carries continuation rules. `DESIGN.md` documents visual direction/tokens. `docs/CREATIVE_BRIEF.md` condenses the complete vision; `docs/SOURCE_BRIEF.txt` preserves only the creative document.
- Input pasted text contained unrelated account/session bootstrap data after the brief. It was intentionally excluded. NEVER commit the unfiltered original input.
- `docs/ASSET_REGISTER.md` records all seven references and provenance. Three videos inspected, four blocked by the download tool's 32MiB cap. Two extracted reference frames and the generated original image are retained under docs for fresh-clone continuity.

## Architecture and deliberate scope

Source brief prefers Nuxt/Vue/TypeScript for the eventual full routed experience. This first interaction spike uses Vite/TypeScript to isolate the rendering and prove mechanics with minimal framework overhead. `mountRelief` is framework-independent and can migrate into a Vue component. Decide the routed app architecture before chapter implementation; don't treat the current spike as an invisible change to the full brief.

The relief is **not** the source brief's final quality gate: original procedural symbols, single-channel CPU texture, no detailed character mesh, no packed multi-state shading bake, no GPU ping-pong field, no scroll recycling. It demonstrates real movement-dependent geometry. Do not report full Immersive Garden fidelity. Live reference site was not inspected this session; relied on user-supplied audit and footage.

## Run

```sh
cd /workspace/bhagavadgita
npm ci
npm run dev -- --port 5173
npm run build
npm test
npm run format:check
```

Node 24.22.1/npm 11.9.0 used. Dependencies pinned in package-lock.json. System Chromium `/usr/bin/chromium` is installed; Playwright config accepts `CHROMIUM_PATH` override. No backend, secrets or external runtime requests required. Development server started at port 5173 in this session; processes may not survive future sessions. No deployment performed.

## Verification

See `docs/VALIDATION.md` for final results and known limits. Tests cover WebGL opening, menu focus/Escape/navigation, mobile overflow, reduced-motion control, WebGL failure and missing-artwork recovery. Desktop before/after pointer screenshots demonstrated relief change. First test pass found and fixed asynchronous modal focus restoration and early image-error event races. Do not count early failing runs as final results.

## Next work, in order

1. Use the completed live reference study to reconstruct the opening. Add GPU RGBA feedback field, tuned lag/noise/coverage/shading, sparse horizontal composition and detailed representative Gītā sculpture. Further controlled exit/decay, resized/mobile and matched-performance tests remain. Keep the exact-fidelity gate open until visual motion comparisons pass.
2. Improve relief quality toward actual sculpted chariot/figures, sourced from the provided visual references. Use `docs/references/` immediately; obtain compressed excerpts/stills for V04–V07 when needed. They were NOT inspected.
3. Build GPU field feedback and validate trail persistence, pointer speed, stationary input, no-input decay, independent autonomous path and scroll recycling. Add measured frame-time evidence on representative hardware, not claims from software-rendered Chromium.
4. Establish character/style reference sheet and scene composition before producing eighteen artworks. Current A01 is provisional, not the locked character bible.
5. Settle Nuxt routed architecture. Build one full chapter vertical slice with chapter detail, meaning view, menu and a small verified reader before expanding to 18 chapters.
6. Choose a legally reusable translation and verified Sanskrit edition; reconcile 700 vs 701 numbering. Never fabricate verses. Then implement /chapters, /chapters/01–18, meaning routes, /read and /about progressively.
7. Audio and film are later tasks. No uploaded video has been cleaned or integrated; don't imply otherwise. Production artwork now is original generation without visible lettering.

## Git continuity

Repository origin: `https://github.com/sekhar7377/bhagavadgita.git`. Started empty (unborn local `work`, no remote branches). Commit completed milestone and push current work to remote `main` without force; verify remote SHA. For future sessions read `git log -3 --oneline`, `git status`, and this handoff before editing. Keep exact final commit state in Git itself, not a self-referential commit hash in this file.
