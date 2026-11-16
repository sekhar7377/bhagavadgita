import { chromium } from "@playwright/test";
const [url, scene, out] = process.argv.slice(2);
const browser = await chromium.launch({
  args: ["--use-angle=d3d11", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
await page.goto(url);
await page
  .locator("#loader.is-done")
  .waitFor({ state: "attached", timeout: 60000 });
await page.evaluate((s) => {
  const e = document.querySelector(`[data-scene="${s}"]`);
  window.scrollTo(
    0,
    e.getBoundingClientRect().top +
      scrollY +
      e.offsetHeight / 2 -
      innerHeight / 2,
  );
}, scene);
await page.waitForTimeout(5000);
await page.screenshot({ path: out + "-rest.jpg", quality: 60 });
for (let i = 0; i < 50; i++) {
  await page.mouse.move(300 + i * 18, 350 + Math.sin(i / 4) * 150);
  await page.waitForTimeout(16);
}
await page.screenshot({ path: out + "-reveal.jpg", quality: 60 });
await browser.close();
