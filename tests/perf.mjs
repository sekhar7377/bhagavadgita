// Scroll smoothness probe (not part of the test suite): node tests/perf.mjs URL
import { chromium } from "@playwright/test";
const url = process.argv[2];
const browser = await chromium.launch({
  args: [
    "--use-angle=d3d11",
    "--force_high_performance_gpu",
    "--ignore-gpu-blocklist",
    "--enable-gpu",
    "--disable-gpu-vsync",
    "--disable-frame-rate-limit",
  ],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 810 },
  deviceScaleFactor: 1.25,
});
await page.goto(url);
await page
  .locator("#loader.is-done")
  .waitFor({ state: "attached", timeout: 60000 });
await page.waitForTimeout(2500);
const result = await page.evaluate(async () => {
  const long = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) long.push(Math.round(e.duration));
  }).observe({ type: "longtask" });
  const times = [];
  let last = performance.now();
  let run = true;
  const f = (n) => {
    times.push(n - last);
    last = n;
    if (run) requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
  const H = document.documentElement.scrollHeight;
  for (let y = 0; y < H - innerHeight; y += 24) {
    window.scrollTo(0, y);
    await new Promise((r) => requestAnimationFrame(r));
  }
  run = false;
  times.sort((a, b) => a - b);
  const p = (q) => +times[Math.floor(times.length * q)].toFixed(1);
  return {
    frames: times.length,
    median: p(0.5),
    p95: p(0.95),
    p99: p(0.99),
    max: p(0.999),
    janky: times.filter((x) => x > 50).length,
    longTasks: long.length,
    longMax: Math.max(0, ...long),
  };
});
console.log(url, JSON.stringify(result));
await browser.close();
