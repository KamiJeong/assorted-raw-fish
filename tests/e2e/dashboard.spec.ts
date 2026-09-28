import { test, expect } from "@playwright/test";
const key = "moa-admin:v1";

test("사용자 추가·검증·수정·삭제와 대시보드 반영, 저장 유지", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/users");
  await expect(page.getByText("30명", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "사용자 추가", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("이름", { exact: false })).toBeFocused();
  await dialog.getByRole("button", { name: "사용자 추가" }).click();
  await expect(dialog.getByText("이름을 입력해 주세요.")).toBeVisible();
  await dialog.getByLabel("이름", { exact: false }).fill("테스트사용자");
  await dialog.getByLabel("이메일", { exact: false }).fill("MEMBER01@example.com");
  await dialog.getByRole("button", { name: "사용자 추가" }).click();
  await expect(dialog.getByText("이미 등록된 이메일입니다.")).toBeVisible();
  await dialog.getByLabel("이메일", { exact: false }).fill("new@example.com");
  await dialog.getByRole("button", { name: "사용자 추가" }).click();
  await expect(dialog).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("테스트사용자", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "대시보드", exact: true }).click();
  await expect(page.locator(".stat-value").first()).toHaveText("31명");
  await expect(page.getByText("테스트사용자", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "사용자 관리", exact: true }).click();
  await page.getByRole("button", { name: "테스트사용자 수정" }).click();
  await dialog.getByLabel("상태", { exact: true }).selectOption("비활성");
  await dialog.getByRole("button", { name: "변경 사항 저장" }).click();
  await page.getByLabel("이름 또는 이메일 검색").fill("new@example.com");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody tr")).toContainText("비활성");
  await page.getByLabel("상태", { exact: true }).selectOption("활성");
  await expect(page.getByText("검색 결과가 없습니다")).toBeVisible();
  await page.getByLabel("상태", { exact: true }).selectOption("비활성");
  await page.getByRole("button", { name: "테스트사용자 삭제" }).click();
  await dialog.getByRole("button", { name: "취소" }).click();
  await expect(page.getByText("테스트사용자", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "테스트사용자 삭제" }).click();
  await dialog.getByRole("button", { name: "사용자 삭제", exact: true }).click();
  await expect(page.getByText("검색 결과가 없습니다")).toBeVisible();
  await page.reload();
  await expect(page.getByText("30명", { exact: true })).toBeVisible();
  await expect(page.getByText("테스트사용자", { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("페이지네이션, 모달 포커스 이동과 Escape 복귀", async ({ page }) => {
  await page.goto("/users");
  await expect(page.locator("tbody tr")).toHaveCount(8);
  await page.getByRole("button", { name: "다음 페이지" }).click();
  await expect(page.getByText("9–16명 표시", { exact: false })).toBeVisible();
  const trigger = page.getByRole("button", { name: "사용자 추가", exact: true });
  await trigger.click();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("서비스명·테마 저장과 초기화 확인", async ({ page }) => {
  await page.goto("/settings");
  await page.getByLabel("서비스 이름").fill("새 서비스");
  await page.getByRole("button", { name: "변경 사항 저장" }).click();
  await page.getByRole("radio", { name: "다크 모드" }).check();
  await page.reload();
  await expect(page.getByLabel("서비스 이름")).toHaveValue("새 서비스");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".brand")).toContainText("새 서비스");
  await page.getByRole("button", { name: "데모 데이터 초기화" }).click();
  await page.getByRole("button", { name: "취소", exact: true }).click();
  await expect(page.getByLabel("서비스 이름")).toHaveValue("새 서비스");
  await page.getByRole("button", { name: "데모 데이터 초기화" }).click();
  await page.getByRole("button", { name: "초기화하기", exact: true }).click();
  await expect(page.getByLabel("서비스 이름")).toHaveValue("모아");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.getByLabel("서비스 이름")).toHaveValue("모아");
});

test("잘못된 저장 데이터 보존 및 복구", async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, "broken data"), key);
  await page.goto("/");
  await expect(page.locator("main").getByRole("alert")).toContainText("기존 저장값은 유지됩니다");
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe("broken data");
  await page.getByRole("button", { name: "저장 다시 시도" }).click();
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).users.length, key)).toBe(30);
});

test("저장 실패를 알리고 메모리 상태를 유지한다", async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException("저장 실패", "QuotaExceededError"); }; });
  await page.goto("/settings");
  await expect(page.locator("main").getByRole("alert")).toContainText("저장하지 못했습니다");
  await page.getByLabel("서비스 이름").fill("임시 이름");
  await page.getByRole("button", { name: "변경 사항 저장" }).click();
  await expect(page.locator(".brand")).toContainText("임시 이름");
  await expect(page.locator("main").getByRole("alert")).toBeVisible();
});

test("빈 사용자 상태는 새로고침해도 데모로 덮어쓰지 않는다", async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, JSON.stringify({ version: 1, users: [], settings: { serviceName: "빈 공간", theme: "light" } })), key);
  await page.goto("/users");
  await expect(page.getByText("아직 등록된 사용자가 없습니다")).toBeVisible();
  await page.reload();
  await expect(page.getByText("아직 등록된 사용자가 없습니다")).toBeVisible();
});

test("모바일 메뉴와 세 화면에 가로 넘침이 없다", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "대시보드", exact: true })).toBeVisible();
  for (const title of ["사용자 관리", "설정", "대시보드"]) {
    await page.getByRole("button", { name: "메뉴 열기" }).click();
    await page.getByRole("dialog").getByRole("link", { name: title, exact: true }).click();
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test("긴 사용자 이름과 이메일도 좁은 화면 안에 표시된다", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/users");
  await page.getByRole("button", { name: "사용자 추가", exact: true }).click();
  const dialog = page.getByRole("dialog");
  const name = "가".repeat(40);
  await dialog.getByLabel("이름", { exact: false }).fill(name);
  await dialog.getByLabel("이메일", { exact: false }).fill(`${"a".repeat(60)}@example.com`);
  await dialog.getByRole("button", { name: "사용자 추가" }).click();
  await expect(page.getByText(name, { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "메뉴 열기" }).click();
  await page.getByRole("dialog").getByRole("link", { name: "대시보드", exact: true }).click();
  await expect(page.getByText(name, { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
