// Coverage strip: carvings shown fully (reduced motion), screenshots every
// screen down the page, tiled into one image. node tests/strip.mjs URL OUT W H
import { chromium } from "@playwright/test";
const [url, out, w, h] = process.argv.slice(2);
const browser = await chromium.launch({
  args: ["--use-angle=d3d11", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
await page.emulateMedia({ reducedMotion: "reduce" });
await page.goto(url);
await page
  .locator("#loader.is-done")
  .waitFor({ state: "attached", timeout: 60000 });
const H = await page.evaluate(() => document.documentElement.scrollHeight);
let i = 0;
for (let y = 0; y < H && i < 40; y += Math.round(+h * 0.8), i++) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(900);
  await page.screenshot({
    path: `${out}-${String(i).padStart(2, "0")}.jpg`,
    quality: 45,
  });
}
console.log(url, "shots", i);
await browser.close();
