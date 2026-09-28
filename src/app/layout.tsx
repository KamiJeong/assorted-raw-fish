import type { Metadata } from "next";
import { AppProvider } from "@/components/app-provider";
import { AppShell } from "@/components/app-shell";
import "./globals.css";
export const metadata: Metadata = { title: "모아 · 관리자 워크스페이스", description: "사용자와 서비스 설정을 한곳에서 관리하는 로컬 데모 대시보드" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body><AppProvider><AppShell>{children}</AppShell></AppProvider></body></html>;
}
