import { test, expect } from "@playwright/test";

for (const path of ["/missing-page", "/users/missing-page"]) {
  test(`${path}: returns 404 and supports keyboard recovery`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "페이지를 찾을 수 없습니다" })).toBeVisible();
    await expect(page.getByText("404", { exact: true })).toBeVisible();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "대시보드로 이동" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "대시보드", exact: true })).toBeVisible();
  });
}

test("illustration moves briefly and respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/missing-page");
  const illustration = page.locator(".not-found-document");
  await expect(illustration).toBeVisible();
  await expect.poll(() => illustration.evaluate(el => el.getAnimations().length)).toBe(1);
  const positions = await illustration.evaluate(async el => {
    const animation = el.getAnimations()[0];
    animation.pause();
    animation.currentTime = 0;
    const start = getComputedStyle(el).transform;
    animation.currentTime = 1200;
    const middle = getComputedStyle(el).transform;
    animation.finish();
    return { start, middle, end: getComputedStyle(el).transform };
  });
  expect(positions.start).not.toBe(positions.middle);
  expect(positions.start).toBe(positions.end);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(illustration).toHaveCSS("animation-name", "none");
});

for (const width of [320, 768, 1440]) {
  test(`${width}px: centered 404 in both themes without overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/missing-page");
    for (const theme of ["light", "dark"]) {
      if (theme === "dark") await page.getByRole("button", { name: "다크 테마로 전환" }).click();
      await expect(page.getByRole("link", { name: "대시보드로 이동" })).toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const art = await page.locator(".not-found-art").boundingBox();
      const content = await page.locator(".not-found").boundingBox();
      expect(Math.abs(art!.x + art!.width / 2 - content!.x - content!.width / 2)).toBeLessThan(1);
      await page.screenshot({ path: `test-results/not-found-${width}-${theme}.png`, fullPage: true });
    }
  });
}
