"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createMockData } from "@/lib/mock-data";
import { readData, writeData } from "@/lib/storage";
import { validateUser } from "@/lib/users";
import type { AppData, Settings, UserInput } from "@/lib/types";

type ContextValue = {
  data: AppData; storageError: string | null; notice: string;
  saveUser: (input: UserInput, id?: string) => ReturnType<typeof validateUser>;
  deleteUser: (id: string) => void; updateSettings: (settings: Partial<Settings>) => void;
  reset: () => void; retrySave: () => void;
};
const AppContext = createContext<ContextValue | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const current = useRef<AppData | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let loaded: AppData;
    let error: string | null;
    try {
      const result = readData(window.localStorage);
      loaded = result.data ?? createMockData();
      error = result.error;
      if (!result.data && !error) error = writeData(window.localStorage, loaded);
    } catch {
      loaded = createMockData();
      error = "브라우저 저장소에 접근할 수 없습니다. 변경 사항은 새로고침 후 유지되지 않습니다.";
    }
    current.current = loaded;
    // The first browser render intentionally matches the server loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(loaded);
    setStorageError(error);
  }, []);
  useEffect(() => {
    if (data) document.documentElement.dataset.theme = data.settings.theme;
  }, [data]);

  function persist(next: AppData, message: string) {
    current.current = next;
    setData(next);
    let error: string | null;
    try { error = writeData(window.localStorage, next); }
    catch { error = "브라우저 저장소에 접근할 수 없습니다. 변경 사항은 새로고침 후 유지되지 않습니다."; }
    setStorageError(error);
    setNotice(error ? "변경 사항이 임시로 반영되었습니다." : message);
  }
  if (!data) return <div className="loading-screen" role="status"><span className="brand-mark">모</span><p>작업 공간을 준비하고 있습니다…</p></div>;
  const value: ContextValue = {
    data, storageError, notice,
    saveUser(input, id) {
      const latest = current.current!;
      const errors = validateUser(input, latest.users, id);
      if (Object.keys(errors).length) return errors;
      const clean = { ...input, name: input.name.trim(), email: input.email.trim().toLowerCase() };
      const users = id ? latest.users.map(user => user.id === id ? { ...user, ...clean } : user) : [{ ...clean, id: crypto.randomUUID(), joinedAt: new Date().toISOString() }, ...latest.users];
      persist({ ...latest, users }, id ? "사용자 정보가 수정되었습니다." : "새 사용자가 추가되었습니다.");
      return {};
    },
    deleteUser(id) { persist({ ...current.current!, users: current.current!.users.filter(user => user.id !== id) }, "사용자가 삭제되었습니다."); },
    updateSettings(settings) { persist({ ...current.current!, settings: { ...current.current!.settings, ...settings } }, "설정이 저장되었습니다."); },
    reset() { persist(createMockData(), "데모 데이터와 설정이 초기화되었습니다."); },
    retrySave() { persist(current.current!, "현재 데이터가 브라우저에 저장되었습니다."); },
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppProvider 내부에서 사용해야 합니다.");
  return context;
}
