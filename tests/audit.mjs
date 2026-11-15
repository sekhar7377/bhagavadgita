// Page audit (not part of the suite): overflow, console errors, failed requests.
import { chromium } from "@playwright/test";
const base = process.argv[2];
const browser = await chromium.launch({
  args: ["--use-angle=d3d11", "--ignore-gpu-blocklist"],
});
for (const vp of [
  { width: 390, height: 844, name: "phone" },
  { width: 1440, height: 810, name: "desktop" },
]) {
  for (const path of [
    "",
    "hastinapura/",
    "sabha/",
    "vana/",
    "kurukshetra/",
    "svarga/",
  ]) {
    const page = await browser.newPage({ viewport: vp });
    const errors = [];
    page.on("pageerror", (e) => errors.push("pageerror " + e.message));
    page.on(
      "console",
      (m) => m.type() === "error" && errors.push("console " + m.text()),
    );
    page.on("requestfailed", (r) => errors.push("failed " + r.url()));
    page.on(
      "response",
      (r) => r.status() >= 400 && errors.push(r.status() + " " + r.url()),
    );
    await page.goto(base + path);
    await page
      .locator("#loader.is-done")
      .waitFor({ state: "attached", timeout: 60000 });
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 700) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.waitForTimeout(60);
    }
    const overflow = await page.evaluate(() => {
      const w = document.documentElement.clientWidth;
      return [...document.querySelectorAll("body *")]
        .filter((e) => {
          const r = e.getBoundingClientRect();
          return (
            r.width > 0 &&
            r.right > w + 1 &&
            getComputedStyle(e).position !== "fixed"
          );
        })
        .slice(0, 5)
        .map(
          (e) =>
            e.tagName +
            "." +
            e.className.toString().slice(0, 40) +
            " " +
            Math.round(e.getBoundingClientRect().right),
        );
    });
    const sw = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    console.log(
      vp.name,
      "/" + path,
      "scrollX",
      sw,
      overflow.length ? overflow.join(" | ") : "",
      errors
        .filter((e) => !e.includes("favicon"))
        .slice(0, 6)
        .join(" ; "),
    );
    await page.close();
  }
}
await browser.close();
