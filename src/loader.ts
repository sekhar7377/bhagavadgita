/**
 * Intro loader: the counter follows real progress (fonts, the opening wall's
 * carving data, the page's own load) rather than a timer, eased so it never
 * jumps. Scrolling is held until it finishes. If scripts fail entirely, CSS
 * hides the loader on its own after a few seconds (see style.css).
 */
export function runLoader(options: {
  loader: HTMLElement;
  relief: HTMLElement;
  minimumMs: number;
  onDone: () => void;
}) {
  const { loader, relief, minimumMs, onDone } = options;
  const count = loader.querySelector<HTMLElement>(".loader-count")!;
  const html = document.documentElement;
  html.classList.add("is-loading");
  const started = performance.now();
  let fonts = 0;
  let wall = 0;
  let page = document.readyState === "complete" ? 1 : 0;
  let shown = 0;
  let finished = false;

  void document.fonts.ready.then(() => (fonts = 1));
  window.addEventListener("load", () => (page = 1), { once: true });
  const readWall = () => {
    const state = relief.dataset.reliefState;
    // Any settled state counts: ready, plain (no carving data) or no WebGL.
    wall = state && state !== "loading" ? 1 : relief.dataset.fallback ? 1 : 0;
  };
  readWall();
  const watcher = new MutationObserver(readWall);
  watcher.observe(relief, { attributes: true });
  // Never hold the visitor for long, whatever fails to arrive.
  const giveUp = window.setTimeout(() => {
    fonts = wall = page = 1;
  }, 9000);

  const finish = () => {
    finished = true;
    watcher.disconnect();
    window.clearTimeout(giveUp);
    count.textContent = "100";
    loader.classList.add("is-done");
    html.classList.remove("is-loading");
    loader.setAttribute("aria-busy", "false");
    onDone();
  };

  let last = started;
  let completeAt = 0;
  const tick = (now: number) => {
    if (finished) return;
    const target = fonts * 15 + wall * 70 + page * 15;
    const elapsed = now - started;
    // Time-based easing, so slow devices (few frames) still finish promptly.
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    const floor = Math.min(target, (elapsed / minimumMs) * 100);
    shown += (floor - shown) * (1 - Math.exp(-dt * 7));
    count.textContent = String(Math.min(99, Math.round(shown)));
    if (target >= 100 && !completeAt) completeAt = now;
    const settled = shown > 97 || (completeAt && now - completeAt > 1200);
    if (target >= 100 && elapsed >= minimumMs && settled) finish();
    else requestAnimationFrame(tick);
  };
  loader.setAttribute("aria-busy", "true");
  requestAnimationFrame(tick);
}
