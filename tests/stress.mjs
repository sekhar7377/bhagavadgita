// Long-session stress probe: scroll every page end to end three times on the
// real GPU and report context loss, fallback, errors and a reveal screenshot.
import { chromium } from "@playwright/test";
const base = process.argv[2];
const out = process.argv[3];
const browser = await chromium.launch({
  args: [
    "--use-angle=d3d11",
    "--force_high_performance_gpu",
    "--ignore-gpu-blocklist",
  ],
});
for (const vp of [
  {
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
    name: "phone",
  },
  { width: 1440, height: 810, name: "desktop" },
]) {
  for (const path of ["", "kurukshetra/"]) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
      deviceScaleFactor: vp.deviceScaleFactor || 1,
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base + path);
    await page
      .locator("#loader.is-done")
      .waitFor({ state: "attached", timeout: 60000 });
    await page.evaluate(() => {
      window.__lost = 0;
      document
        .querySelector("#relief canvas")
        ?.addEventListener("webglcontextlost", () => window.__lost++);
    });
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let pass = 0; pass < 3; pass++)
      for (let y = 0; y < H; y += 300) {
        await page.evaluate((y) => window.scrollTo(0, y), pass % 2 ? H - y : y);
        await page.waitForTimeout(25);
      }
    // Settle on a scene and check: resting wall is near-blank, the cursor reveals.
    await page.evaluate(() =>
      document
        .querySelectorAll("[data-scene]")
        [
          Math.min(6, document.querySelectorAll("[data-scene]").length - 1)
        ].scrollIntoView({ block: "center" }),
    );
    await page.waitForTimeout(4000);
    await page.screenshot({
      path: `${out}/${vp.name}-${path.replace("/", "") || "home"}-rest.jpg`,
      quality: 60,
    });
    for (let i = 0; i < 40; i++) {
      await page.mouse.move(200 + i * 20, 300 + Math.sin(i / 4) * 120);
      await page.waitForTimeout(16);
    }
    await page.screenshot({
      path: `${out}/${vp.name}-${path.replace("/", "") || "home"}-reveal.jpg`,
      quality: 60,
    });
    const state = await page.evaluate(() => ({
      lost: window.__lost,
      state: document.querySelector("#relief").dataset.reliefState,
      fallback: document.documentElement.classList.contains("relief-fallback"),
    }));
    console.log(
      vp.name,
      "/" + path,
      JSON.stringify(state),
      errors.slice(0, 3).join(" ; "),
    );
    await page.close();
  }
}
await browser.close();
