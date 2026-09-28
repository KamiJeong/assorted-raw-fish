import { test, expect } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`${theme}: text and input boundaries meet contrast targets`, async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("radio", { name: theme === "light" ? "라이트 모드" : "다크 모드" }).check();
    const ratios = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      const color = (name: string) => style.getPropertyValue(`--${name}`).trim();
      const luminance = (hex: string) => {
        const full = hex.length === 4 ? hex.slice(1).split("").map(c => c + c).join("") : hex.slice(1);
        const channels = [0, 2, 4].map(offset => {
          const c = parseInt(full.slice(offset, offset + 2), 16) / 255;
          return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
        return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
      };
      const contrast = (a: string, b: string) => {
        const values = [luminance(color(a)), luminance(color(b))].sort((a, b) => b - a);
        return (values[0] + 0.05) / (values[1] + 0.05);
      };
      return {
        text: ["surface", "surface-subtle", "background", "hover"].map(bg => contrast("muted", bg)),
        accent: contrast("accent", "accent-soft"),
        green: contrast("green", "green-soft"),
        danger: contrast("danger", "surface"),
        input: contrast("control-border", "surface"),
      };
    });
    for (const ratio of [...ratios.text, ratios.accent, ratios.green, ratios.danger]) expect(ratio).toBeGreaterThanOrEqual(4.5);
    expect(ratios.input).toBeGreaterThanOrEqual(3);
    await expect(page.getByLabel("서비스 이름")).toHaveCSS("font-size", "16px");
  });
}

test("skip link and settings error keep keyboard focus meaningful", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByLabel("서비스 이름")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "본문으로 건너뛰기" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await page.getByLabel("서비스 이름").fill("");
  await page.getByRole("button", { name: "변경 사항 저장" }).click();
  await expect(page.getByLabel("서비스 이름")).toBeFocused();
  await expect(page.locator("main").getByRole("alert")).toHaveText("서비스 이름을 입력해 주세요.");
  await expect(page.getByLabel("서비스 이름")).toHaveAccessibleDescription("서비스 이름을 입력해 주세요.");
});

for (const width of [320, 768, 1440]) {
  test(`${width}px: readable content, targets and layouts in both themes`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      for (const path of ["/", "/users", "/settings"]) {
        await page.goto(path);
        await expect(page.locator("h1")).toBeVisible();
        if (theme === "dark" && await page.locator("html").getAttribute("data-theme") !== "dark") {
          await page.getByRole("button", { name: "다크 테마로 전환" }).click();
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        if (path === "/users") await expect(page.getByRole("columnheader")).toHaveCount(6);
        if (path === "/") await expect(page.getByRole("heading", { name: "사용자 상태", exact: true })).toBeVisible();
        const smallTargets = await page.locator("button:visible").evaluateAll(elements => elements.filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width < 24 || rect.height < 24;
        }).map(el => el.textContent || el.getAttribute("aria-label")));
        expect(smallTargets).toEqual([]);
        await page.screenshot({ path: `test-results/design-${width}-${theme}-${path === "/" ? "dashboard" : path.slice(1)}.png`, fullPage: true });
      }
    }
  });
}

test("200% text size reflows without page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const path of ["/", "/users", "/settings"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    await page.addStyleTag({ content: "html { font-size:200%; }" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/design-large-text-${path === "/" ? "dashboard" : path.slice(1)}.png`, fullPage: true });
  }
});
