import { test, expect } from "@playwright/test";

// The home page opens on the entry title; most tests step through it.
test.beforeEach(async ({ page }, info) => {
  if (info.title.includes("entry title")) return;
  await page.addInitScript(() => {
    // Enter as soon as the title is ready, as a visitor's tap would.
    const tap = () => {
      const loader = document.querySelector("#loader.is-ready");
      if (loader) (loader as HTMLElement).click();
      else requestAnimationFrame(tap);
    };
    addEventListener("DOMContentLoaded", tap);
  });
});

test("the entry title decodes, then waits for a click to enter with sound", async ({
  page,
}) => {
  await page.goto("/");
  const enter = page.getByText("Enter with sound");
  await expect(page.locator(".entry-letter")).toHaveCount(11);
  await expect(enter).toBeVisible({ timeout: 30000 });
  await expect(page.locator(".entry-word")).toHaveAttribute(
    "aria-label",
    "Mahābhārata",
  );
  // It does not lift on its own.
  await page.waitForTimeout(1500);
  await expect(page.locator("#loader")).not.toHaveClass(/is-done/);
  await enter.click();
  await expect(page.locator("#loader")).toHaveClass(/is-done/, {
    timeout: 15000,
  });
  await expect(page.locator(".sound-toggle")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("opening renders real WebGL and menu supports keyboard and section navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "The Eighteen Eclipses.",
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
  await page.getByRole("link", { name: "02 The chapters of the wall" }).click();
  await expect(page).toHaveURL(/#chapters$/);
  await expect(page.locator("#chapters")).toBeFocused();
  expect(errors).toEqual([]);
});

test("the Kurukshetra page keeps the Gita wall and its menu", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/kurukshetra/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "The stillness before action.",
  );
  await expect(page.locator("#relief")).toHaveAttribute(
    "data-relief-state",
    "ready",
    { timeout: 30000 },
  );
  await page
    .locator("#loader.is-done")
    .waitFor({ state: "attached", timeout: 30000 });
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page
    .getByRole("link", { name: "04 Day one: the conches sound" })
    .click();
  await expect(page).toHaveURL(/#conches$/);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator("#conches")).toBeFocused();
  await page.locator("#battlefield").scrollIntoViewIfNeeded();
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
  await expect(page).toHaveURL(/#chapters$/);
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
  // The title card waits at the end of the cold open; reduced motion shows
  // it at once, in the same place.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const left = (selector: string) =>
    page.locator(selector).evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getBoundingClientRect().left;
    });
  // Reference: identity 134.7, sentence 490.7, scroll cue 1084, corner 40.
  expect(
    Math.abs((await left(".title-card .hero-identity")) - 134.7),
  ).toBeLessThan(2);
  expect(Math.abs((await left("h1")) - 490.7)).toBeLessThan(2);
  expect(
    Math.abs((await left(".title-card .hero-scroll")) - 1084),
  ).toBeLessThan(2);
  expect(Math.abs((await left(".hero-corner")) - 40)).toBeLessThan(2);
  await expect(page.locator("h1")).toHaveCSS("font-size", "28px");
  await expect(page.locator(".title-card .hero-scroll")).toHaveCSS(
    "opacity",
    "0.6",
  );
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
  await page.goto("/kurukshetra/");
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
  await page.goto("/kurukshetra/");
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
  await page.route("**/relief/vishvarupa-height.png", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator("#relief")).toHaveAttribute(
    "data-relief-state",
    "plain",
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("intro loader counts up, releases scroll and offers sound", async ({
  page,
}) => {
  await page.goto("/sabha/");
  const loader = page.locator("#loader");
  // The prompt is a real button, so keyboard and screen readers can use it.
  await expect(
    page.getByRole("button", { name: "Click to enable sound" }),
  ).toBeAttached();
  await expect(loader).toHaveClass(/is-done/, { timeout: 30000 });
  await expect(page.locator(".loader-count")).toHaveText("100");
  await expect(page.locator("html")).not.toHaveClass(/is-loading/);
  const toggle = page.locator(".sound-toggle");
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
});

test("the home opening is five static carved beats ending on the title", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await page
    .locator("#loader.is-done")
    .waitFor({ state: "attached", timeout: 30000 });
  // No wheel any more: the war is told in five living carvings.
  await expect(page.locator('[data-scene="wheel"]')).toHaveCount(0);
  const beats = page.locator("main > section.scene[data-scene]");
  await expect(beats).toHaveCount(5);
  // Static carvings only: no video and no animated parts.
  await expect(page.locator("[data-video], [data-motion]")).toHaveCount(0);
  await expect(page.locator('[data-scene="walk"] h1')).toHaveText(
    "The Eighteen Eclipses.",
  );
  // Each chapter card stands on its own carved wall.
  await expect(page.locator(".chapter-stage[data-scene]")).toHaveCount(5);
});

test("the Kurukshetra painting opens the Kurukshetra wall", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator("#loader.is-done")
    .waitFor({ state: "attached", timeout: 30000 });
  const gateway = page.getByRole("link", { name: /Enter Kurukṣetra/ });
  await gateway.scrollIntoViewIfNeeded();
  await gateway.click();
  await expect(page).toHaveURL(/\/kurukshetra\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "The stillness before action.",
  );
});

test("a story branch opens its own carved scene", async ({ page }) => {
  await page.goto("/hastinapura/");
  await page
    .locator("#loader.is-done")
    .waitFor({ state: "attached", timeout: 30000 });
  const branch = page.locator("#ekalavya");
  await branch.locator("summary").scrollIntoViewIfNeeded();
  await expect(page.locator("#ekalavya-title")).not.toBeVisible();
  await branch.locator("summary").click();
  await expect(branch).toHaveAttribute("open", "");
  await expect(page.locator("#ekalavya-title")).toBeVisible();
});

test("the Hastinapura painting opens the Adi Parva wall", async ({ page }) => {
  await page.goto("/");
  await page
    .locator("#loader.is-done")
    .waitFor({ state: "attached", timeout: 30000 });
  const card = page.getByRole("link", { name: /Enter Hastināpura/ });
  await card.scrollIntoViewIfNeeded();
  await card.click();
  await expect(page).toHaveURL(/\/hastinapura\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "The throne nobody could keep.",
  );
  await expect(page.locator("#relief")).toHaveAttribute(
    "data-relief-state",
    "ready",
    { timeout: 30000 },
  );
});

test("the dice hall casts each stake as it is reached", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/sabha/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "The dice that broke the world.",
  );
  await page
    .locator("#loader.is-done")
    .waitFor({ state: "attached", timeout: 30000 });
  await page.locator("#dice").scrollIntoViewIfNeeded();
  await page.evaluate(() => document.querySelector("#dice")!.scrollIntoView());
  for (const stake of await page.locator(".stakes li").all()) {
    await stake.evaluate((el) =>
      el.scrollIntoView({ block: "center", behavior: "instant" }),
    );
    await expect(stake).toHaveClass(/cast/);
  }
});

test("chapters link in story order", async ({ page }) => {
  await page.goto("/hastinapura/");
  await expect(
    page.getByRole("link", { name: /Enter the Dice Hall/ }),
  ).toHaveAttribute("href", "../sabha/");
  await page.goto("/sabha/");
  await expect(
    page.getByRole("link", { name: /Enter the Forest/ }),
  ).toHaveAttribute("href", "../vana/");
  await page.goto("/vana/");
  await expect(
    page.getByRole("link", { name: /Enter Kurukṣetra/ }),
  ).toHaveAttribute("href", "../kurukshetra/");
  await page.goto("/kurukshetra/");
  await expect(
    page.getByRole("link", { name: /Enter the last chapter/ }),
  ).toHaveAttribute("href", "../svarga/");
  await page.goto("/");
  await expect(page.locator(".chapter-card")).toHaveCount(5);
  // Every card lives in the chapter list, none stray into the family tree.
  await expect(page.locator(".chapter-list .chapter-card")).toHaveCount(5);
  await expect(page.locator(".lineage .chapter-card")).toHaveCount(0);
});

test("the forest chapter opens the Yaksha's questions one by one", async ({
  page,
}) => {
  await page.goto("/vana/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Exiles in the ashes, phantoms in the court.",
  );
  await page
    .locator("#loader.is-done")
    .waitFor({ state: "attached", timeout: 30000 });
  const branch = page.locator("#the-questions");
  await branch.locator("> summary").scrollIntoViewIfNeeded();
  await branch.locator("> summary").click();
  const riddle = branch.locator(".riddle").filter({
    hasText: "What is the greatest wonder?",
  });
  await expect(riddle.locator("p")).not.toBeVisible();
  await riddle.locator("summary").click();
  await expect(riddle.locator("p")).toContainText("live for ever");
  await expect(page.locator(".chapter-card")).toHaveCount(0);
  await page.goto("/");
  await expect(page.locator(".chapter-card")).toHaveCount(5);
});
