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
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Menu", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.getByRole("link", { name: "02 The battlefield" }).click();
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

test("narrow screen remains readable, has no horizontal overflow, and motion is controllable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const motion = page.getByRole("button", { name: "Resume motion" });
  await expect(motion).toHaveAttribute("aria-pressed", "true");
  await motion.click();
  await expect(
    page.getByRole("button", { name: "Pause motion" }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("link", { name: "Scroll to begin" }).click();
  await expect(page).toHaveURL(/#story$/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
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
