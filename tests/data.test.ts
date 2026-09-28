import { test } from "node:test";
import assert from "node:assert/strict";
import { createMockData } from "../src/lib/mock-data.ts";
import { filterUsers, monthlySignups, validateUser } from "../src/lib/users.ts";
import { isAppData, readData, writeData, STORAGE_KEY } from "../src/lib/storage.ts";
const now = new Date(2026, 8, 28, 12);

test("초기 데이터는 고유한 사용자 30명이며 같은 기준일에 결정적이다", () => {
  const data = createMockData(now);
  assert.equal(data.users.length, 30);
  assert.ok(isAppData(data));
  assert.deepEqual(data, createMockData(now));
  assert.equal(new Set(data.users.map(user => user.id)).size, 30);
});
test("입력 필수값, 이메일 형식, 대소문자 중복 및 수정시 자기 자신을 검사한다", () => {
  const users = createMockData(now).users;
  const input = { ...users[0] };
  assert.deepEqual(validateUser(input, users, input.id), {});
  assert.ok(validateUser({ ...input, email: input.email.toUpperCase() }, users).email);
  assert.ok(validateUser({ ...input, email: "invalid" }, []).email);
  assert.ok(validateUser({ ...input, name: "  " }, []).name);
  assert.ok(validateUser({ ...input, email: "" }, []).email);
});
test("연도 경계를 포함한 6개월 집계와 검색/상태 필터", () => {
  const data = createMockData(new Date(2026, 0, 20));
  const months = monthlySignups(data.users, new Date(2026, 0, 20));
  assert.deepEqual(months.map(month => month.month), ["8월", "9월", "10월", "11월", "12월", "1월"]);
  const user = { ...data.users[0], joinedAt: new Date(2026, 0, 1).toISOString() };
  assert.equal(monthlySignups([user], new Date(2026, 0, 20))[5].count, 1);
  assert.equal(monthlySignups([{ ...user, joinedAt: new Date(2026, 1, 1).toISOString() }], new Date(2026, 0, 20))[5].count, 0);
  assert.equal(filterUsers(data.users, " MEMBER01@EXAMPLE.COM ", "활성").length, 1);
  assert.equal(filterUsers(data.users, "김민준", "비활성").length, 0);
});
test("저장 읽기는 기존 값을 덮어쓰지 않고 빈 사용자도 보존한다", () => {
  const data = { ...createMockData(now), users: [] };
  let stored: string | null = JSON.stringify(data);
  let writes = 0;
  const storage = { getItem: () => stored, setItem: (_key: string, value: string) => { writes++; stored = value; } };
  assert.deepEqual(readData(storage).data, data);
  assert.equal(writes, 0);
  stored = "{broken";
  assert.ok(readData(storage).error);
  assert.equal(writes, 0);
  assert.equal(writeData(storage, data), null);
  assert.equal(writes, 1);
  assert.equal(STORAGE_KEY, "moa-admin:v1");
});
test("잘못된 스키마와 중복 사용자 및 저장소 예외를 처리한다", () => {
  const data = createMockData(now);
  assert.equal(isAppData({ ...data, version: 2 }), false);
  assert.equal(isAppData({ ...data, users: [data.users[0], data.users[0]] }), false);
  assert.equal(isAppData({ ...data, settings: { ...data.settings, theme: "invalid" } }), false);
  assert.equal(isAppData({ ...data, users: [{ ...data.users[0], joinedAt: "invalid" }] }), false);
  const denied = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("quota"); } };
  assert.ok(readData(denied).error);
  assert.ok(writeData(denied, data));
});
