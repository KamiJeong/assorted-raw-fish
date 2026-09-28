import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { cp, mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

// Exercise real production boundaries without shipping failure routes or switches.
const root = fileURLToPath(new URL("../../", import.meta.url));
const fixture = await mkdtemp(path.join(tmpdir(), "moa-errors-"));
const port = Number(process.env.ERROR_TEST_PORT ?? 3128);
const origin = `http://127.0.0.1:${port}`;
let server;
let browser;
try {
  for (const file of ["src", "package.json", "tsconfig.json", "postcss.config.mjs", "next.config.ts"]) {
    await cp(path.join(root, file), path.join(fixture, file), { recursive: true });
  }
  await symlink(path.join(root, "node_modules"), path.join(fixture, "node_modules"), "dir");
  const layoutPath = path.join(fixture, "src/app/layout.tsx");
  const layout = await readFile(layoutPath, "utf8");
  await writeFile(layoutPath, 'import { cookies } from "next/headers";\n' + layout
    .replace("function RootLayout", "async function RootLayout")
    .replace("return <html", 'if ((await cookies()).has("fail-root")) throw new Error("PRIVATE_ROOT_FAILURE");\n  return <html'));
  await mkdir(path.join(fixture, "src/app/failure"));
  await writeFile(path.join(fixture, "src/app/failure/page.tsx"), `
import { cookies } from "next/headers";
export default async function Failure() {
  if (!(await cookies()).has("recovered")) throw new Error("PRIVATE_PAGE_FAILURE");
  return <h1>Recovered page</h1>;
}`);
  const build = spawnSync(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "build", "--webpack"], { cwd: fixture, stdio: "inherit" });
  assert.equal(build.status, 0, "Fixture production build");
  server = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], { cwd: fixture, stdio: "inherit" });
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    assert.equal(server.exitCode, null, "Fixture server exited early");
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert.ok(ready, "Fixture server ready");
  browser = await chromium.launch();
  const page = await browser.newPage();
  const { expect } = await import("@playwright/test");
  for (const rootFailure of [false, true]) {
    await page.context().clearCookies();
    if (rootFailure) await page.context().addCookies([{ name: "fail-root", value: "1", url: origin }]);
    await page.goto(`${origin}/failure`);
    await expect(page.getByRole("heading", { name: "잠시 쉬어가는 중이에요" })).toBeVisible();
    await expect(page.getByText("500 · 서버 오류")).toBeVisible();
    assert.ok(!(await page.locator("body").innerText()).includes("PRIVATE_"));
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ["light", "dark"]) {
        await page.emulateMedia({ colorScheme: theme, reducedMotion: "no-preference" });
        if (!rootFailure) await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
        const section = page.getByRole("region", { name: "잠시 쉬어가는 중이에요" });
        await expect(section).toHaveCSS("background-color", theme === "dark" ? "rgb(28, 34, 44)" : "rgb(255, 255, 255)");
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        assert.equal(await section.locator("svg").evaluate(el => el.getAnimations({ subtree: true }).length), 3);
        await page.screenshot({ path: path.join(root, `test-results/500-${rootFailure ? "root" : "page"}-${width}-${theme}.png`), fullPage: true });
        await page.emulateMedia({ reducedMotion: "reduce" });
        assert.equal(await section.locator("svg").evaluate(el => el.getAnimations({ subtree: true }).length), 0);
      }
    }
    await page.context().clearCookies();
    await page.context().addCookies([{ name: "recovered", value: "1", url: origin }]);
    await page.getByRole("button", { name: "다시 시도", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Recovered page" })).toBeVisible();
    await page.context().clearCookies();
    if (rootFailure) await page.context().addCookies([{ name: "fail-root", value: "1", url: origin }]);
    await page.goto(`${origin}/failure`);
    await expect(page.getByRole("link", { name: "대시보드로 이동" })).toBeVisible();
    await page.context().clearCookies();
    await page.getByRole("link", { name: "대시보드로 이동" }).click();
    await expect(page).toHaveURL(`${origin}/`);
    await expect(page.getByRole("heading", { name: "대시보드", exact: true })).toBeVisible();
    console.log(`PASS: ${rootFailure ? "root" : "page"} boundary, recovery, home, themes, motion and responsive layout`);
  }
  await page.goto(`${origin}/missing-page`);
  await expect(page.getByRole("heading", { name: "페이지를 찾을 수 없습니다" })).toBeVisible();
  await expect(page.getByText("500 · 서버 오류")).toHaveCount(0);
  console.log("PASS: 404 remains separate");
} finally {
  await browser?.close();
  if (server && server.exitCode === null) {
    const exited = new Promise(resolve => server.once("exit", resolve));
    server.kill("SIGTERM");
    await exited;
  }
  await rm(fixture, { recursive: true, force: true });
}
