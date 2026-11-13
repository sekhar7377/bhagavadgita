# Validation — 13 November 2026

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

- Live reference: curl CONNECT returned 403; Chromium returned ERR_TUNNEL_CONNECTION_FAILED. No live motion fidelity claim is made. New network draft adds immersive-g.com and www.immersive-g.com; saving the draft is not runtime access or publication.
- No matched reference/local motion recording, physical GPU/device frame-time test, 30/60/120Hz equivalence, production GPU feedback field, detailed figurative sculpture or packed shade bake.
- Four uploaded videos exceeded 32MiB transfer limit and were not inspected. Raw clips not cleaned/integrated.
- No full scripture edition, chapter reader, audio, deployment or cloud publication.
- Automated tests are not a complete accessibility audit or cross-browser certification.
