import type { AppData, User } from "./types";
export const STORAGE_KEY = "moa-admin:v1";
type StorageAccess = Pick<Storage, "getItem" | "setItem">;
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
export function isAppData(value: unknown): value is AppData {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.users) || !isRecord(value.settings)) return false;
  const { settings, users } = value;
  if (typeof settings.serviceName !== "string" || !settings.serviceName.trim() || settings.serviceName.length > 30 || !["light", "dark"].includes(settings.theme as string)) return false;
  const ids = new Set<string>();
  const emails = new Set<string>();
  return users.every((user: unknown) => {
    if (!isRecord(user) || typeof user.id !== "string" || !user.id || typeof user.name !== "string" || !user.name.trim() || user.name.length > 40 || typeof user.email !== "string" || user.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email) || !["관리자", "매니저", "멤버"].includes(user.role as string) || !["활성", "비활성"].includes(user.status as string) || typeof user.joinedAt !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(user.joinedAt) || !Number.isFinite(Date.parse(user.joinedAt))) return false;
    if (ids.has(user.id) || emails.has(user.email.toLowerCase())) return false;
    ids.add(user.id); emails.add(user.email.toLowerCase());
    return true;
  });
}
export function readData(storage: StorageAccess): { data: AppData | null; error: string | null } {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return { data: null, error: null };
    const parsed: unknown = JSON.parse(raw);
    if (!isAppData(parsed)) throw new Error("invalid data");
    // Normalize dates once so sorting is independent of the stored timezone offset.
    parsed.users = parsed.users.map((user: User) => ({ ...user, joinedAt: new Date(user.joinedAt).toISOString() }));
    return { data: parsed, error: null };
  } catch {
    return { data: null, error: "저장 데이터를 읽을 수 없어 임시 데모 데이터를 표시합니다. 기존 저장값은 유지됩니다. 설정에서 초기화하거나 저장을 다시 시도해 주세요." };
  }
}
export function writeData(storage: StorageAccess, data: AppData): string | null {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(data)); return null; }
  catch { return "브라우저에 저장하지 못했습니다. 현재 변경 사항은 이 화면에만 반영되며 새로고침하면 사라질 수 있습니다. 저장 공간과 브라우저 설정을 확인한 뒤 다시 시도해 주세요."; }
}
