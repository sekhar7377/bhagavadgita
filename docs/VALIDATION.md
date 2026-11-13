# Validation — 13 November 2026, milestone 02

Validates the rebuilt **opening wall**. It does not certify parity with the reference or a finished site. Everything ran in Chromium with software WebGL (SwiftShader); no physical GPU was used.

- `npm run build`: PASS — strict TypeScript, Vite production build.
- `npm test`: PASS — 7 Playwright tests, 3.1 minutes on the final run. Opening WebGL and menu keyboard flow; narrow screen with reduced motion and no motion control; band positions within 2px of the reference's measured grid at 1440×810, 28px sentence, 60% scroll cue; WebGL unavailable; missing artwork; pointer movement raises the carving (pixel contrast over the wheel); height data failing leaves a usable page.
- `npm run format:check`: PASS.
- Tone comparison against the user's real-GPU recording of the reference (8-bit grey): wall 196 vs 196, median 190 vs 191, deepest shade about 125 vs 114–119, brightest plaster about 220 vs 220–231.
- Visual comparison images: `docs/reference-study/2026-11-13-b/`.

## Not verified / not complete

- Frame rate and feel on real hardware, any phone, or high-refresh displays.
- Motion parity: no frame-matched recording of ours against the reference.
- Sculpture quality is below the reference's hand-sculpted model; see HANDOFF.md, known gaps.
- The iridescent rim tint approximates the reference's fluid effect.
- Scroll coupling, intro loader, sound, menu transition and the sections after the opening are not rebuilt.
- Automated tests are not a complete accessibility audit or cross-browser certification.

---

# Earlier record — milestone 01


This validates the **opening prototype**, not reference fidelity or the completed site.

- `npm run build`: PASS — strict TypeScript and Vite production build. JS ~493KB, ~129KB gzip; CSS ~10KB. No framework runtime beyond Three.js and plain DOM.
- `npm test`: PASS — 4 Playwright tests in system Chromium, 19.2 seconds on final functional run. Opening WebGL/no page errors; modal Escape/focus/section navigation; 390×844 layout and reduced-motion control; unavailable WebGL; aborted artwork request fallback.
- `npm run format:check`: PASS.
- Frontend Design Premium `audit_project.py --mode strict`: PASS — sourceRoots `src`, 0 findings. Snapshot `docs/UI_AUDIT.json`; external skill script executed from `/tmp/premium-audit.py`. HTML behavior validated by browser tests, not this static scanner.
- `designmd lint DESIGN.md`: 0 errors; 1 warning for decorative `colors.rule` not referenced by a component schema token. CSS uses it for borders. This is recorded, not hidden.
- `npm audit --omit=dev`: 0 vulnerabilities reported for production dependencies.
- Visual inspection: desktop 1440×900, mobile 390×844, full page, dark menu, initial vs pointer-revealed lotus. Symbol geometry physically rises; current geometry remains visibly coarse/provisional.
- Additional renderer checks: explicit Resume under reduced motion changes canvas; simulated WebGL loss/restoration transitions hidden fallback to visible ready canvas.

First functional test run caught a deferred dialog-close focus race and an image-error listener race. Fixed in main.ts; rerun passed. A later run overlapped source editing/HMR and detached a DOM target; stopped editing before the clean final run.

## Not verified / not complete

- Live reference was initially blocked (CONNECT 403); after network revision 2, HTTPS and Chromium access succeeded. See REFERENCE_ANALYSIS.md for actual live/source findings and screenshot evidence. No final motion-fidelity claim is made.
- No matched reference/local motion recording, physical GPU/device frame-time test, 30/60/120Hz equivalence, production GPU feedback field, detailed figurative sculpture or packed shade bake.
- Four uploaded videos exceeded 32MiB transfer limit and were not inspected. Raw clips not cleaned/integrated.
- No full scripture edition, chapter reader, audio, deployment or cloud publication.
- Automated tests are not a complete accessibility audit or cross-browser certification.
