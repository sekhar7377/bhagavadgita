import { test, expect } from "@playwright/test";

test("opening renders real WebGL and menu supports keyboard and section navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "The stillness before action.",
  );
  await expect(page.locator("#relief canvas")).toBeVisible();
  await expect(page.locator("#relief")).not.toHaveAttribute(
    "data-fallback",
    "true",
  );
  await expect(page.locator("#relief")).toHaveAttribute(
    "data-relief-state",
    "ready",
    { timeout: 30000 },
  );
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Menu", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.getByRole("link", { name: "03 The battlefield" }).click();
  await expect(page).toHaveURL(/#story$/);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator("#story")).toBeFocused();
  await expect(page.locator(".battlefield img")).toBeVisible();
  expect(
    await page
      .locator(".battlefield img")
      .evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
      ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("narrow screen remains readable, has no horizontal overflow, and honours reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/motion-paused/);
  // The reference has no motion control, so neither does this opening.
  await expect(page.getByRole("button", { name: /motion/i })).toHaveCount(0);
  await page.getByRole("link", { name: "Scroll to begin" }).click();
  await expect(page).toHaveURL(/#story$/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("opening band follows the measured reference grid at 1440 by 810", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 810 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const left = (selector: string) =>
    page.locator(selector).evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getBoundingClientRect().left;
    });
  // Reference: identity 134.7, sentence 490.7, scroll cue 1084, corner 40.
  expect(Math.abs((await left(".hero-identity")) - 134.7)).toBeLessThan(2);
  expect(Math.abs((await left("h1")) - 490.7)).toBeLessThan(2);
  expect(Math.abs((await left(".hero-scroll")) - 1084)).toBeLessThan(2);
  expect(Math.abs((await left(".hero-corner")) - 40)).toBeLessThan(2);
  await expect(page.locator("h1")).toHaveCSS("font-size", "28px");
  await expect(page.locator(".hero-scroll")).toHaveCSS("opacity", "0.6");
});

test("WebGL failure keeps the narrative and controls available", async ({
  page,
}) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = (() =>
      null) as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("missing artwork provides a readable fallback without losing the story", async ({
  page,
}) => {
  await page.route("**/art/kurukshetra.webp", (route) => route.abort());
  await page.goto("/");
  await page.locator("#battlefield").scrollIntoViewIfNeeded();
  await expect(
    page.getByText(
      "The battlefield image could not load. The story continues below.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "What does it mean to act with clarity?",
    }),
  ).toBeAttached();
});

test("pointer movement raises the carving out of a resting wall", async ({
  page,
}) => {
  // Two WebGL walls on a software renderer make each pointer frame slow.
  test.setTimeout(240000);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await expect(page.locator("#relief")).toHaveAttribute(
    "data-relief-state",
    "ready",
    { timeout: 30000 },
  );
  // A patch over the chariot wheel, away from the DOM text.
  const patch = { x: 430, y: 470, width: 150, height: 90 };
  const contrast = async () => {
    const png = await page.screenshot({ clip: patch });
    return page.evaluate(async (bytes) => {
      const bitmap = await createImageBitmap(
        new Blob([new Uint8Array(bytes)], { type: "image/png" }),
      );
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext("2d")!;
      context.drawImage(bitmap, 0, 0);
      const data = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
      let sum = 0;
      let squares = 0;
      const count = data.length / 4;
      for (let i = 0; i < data.length; i += 4) {
        sum += data[i];
        squares += data[i] * data[i];
      }
      const mean = sum / count;
      return Math.sqrt(squares / count - mean * mean);
    }, Array.from(png));
  };
  for (let pass = 0; pass < 3; pass++)
    for (let i = 0; i <= 30; i++) {
      await page.mouse.move(420 + i * 6, 500 + Math.sin(i / 3 + pass) * 30);
      await page.waitForTimeout(20);
    }
  expect(await contrast()).toBeGreaterThan(4);
});

test("relief data failing to load leaves a plain wall and a usable page", async ({
  page,
}) => {
  await page.route("**/relief/kurukshetra-height.png", (route) =>
    route.abort(),
  );
  await page.goto("/");
  await expect(page.locator("#relief")).toHaveAttribute(
    "data-relief-state",
    "plain",
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
