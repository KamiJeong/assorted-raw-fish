"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ArrowUpRight, ChevronRight, LayoutDashboard, Menu, Moon, Settings, ShieldCheck, Sun, Users, AlertCircle } from "lucide-react";
import { useApp } from "./app-provider";
import { Modal } from "./modal";

const navigation = [{ href: "/", title: "대시보드", icon: LayoutDashboard }, { href: "/users", title: "사용자 관리", icon: Users }, { href: "/settings", title: "설정", icon: Settings }];
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data, updateSettings, storageError, retrySave, notice } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const title = navigation.find(item => item.href === pathname)?.title ?? "페이지 안내";
  function nav() { return <nav aria-label="주 메뉴">{navigation.map(({ href, title, icon: Icon }) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={`nav-item ${pathname === href ? "selected" : ""}`} aria-current={pathname === href ? "page" : undefined}><Icon size={19} /><span>{title}</span>{pathname === href && <ChevronRight size={16} className="ml-auto" />}</Link>)}</nav>; }
  return <div className="app-shell">
    <a href="#main" className="skip-link">본문으로 건너뛰기</a>
    <aside className="sidebar"><Link href="/" className="brand"><span className="brand-mark">모</span><span className="truncate">{data.settings.serviceName}<small>관리자 워크스페이스</small></span></Link><p className="nav-caption">워크스페이스</p>{nav()}<div className="sidebar-bottom"><div className="demo-note"><ShieldCheck size={19} /><div><strong>가볍게 둘러보세요</strong><p>이곳은 로컬 데모 공간입니다.<br />자유롭게 데이터를 관리하세요.</p><Link href="/settings">데모 설정 <ArrowUpRight size={14} /></Link></div></div><div className="sidebar-footer"><span className="status-dot" />로컬 워크스페이스<span className="ml-auto">버전 1.0</span></div></div></aside>
    <div className="main-column"><header className="header"><div className="flex min-w-0 items-center gap-3"><button className="icon-button mobile-menu" aria-label="메뉴 열기" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu size={21} /></button><span className="header-workspace">워크스페이스</span><ChevronRight size={14} className="header-workspace muted" /><span className="font-medium">{title}</span></div><div className="flex items-center gap-4"><button className="icon-button" aria-label={data.settings.theme === "light" ? "다크 테마로 전환" : "라이트 테마로 전환"} onClick={() => updateSettings({ theme: data.settings.theme === "light" ? "dark" : "light" })}>{data.settings.theme === "light" ? <Moon size={19} /> : <Sun size={19} />}</button><div className="profile"><span className="avatar admin-avatar">관</span><div className="profile-text"><strong>데모 관리자</strong><small>워크스페이스 관리자</small></div></div></div></header>
    <main id="main" tabIndex={-1} className="main-content">{storageError && <div className="storage-warning" role="alert"><AlertCircle size={20} className="shrink-0" /><p>{storageError}</p><button className="button shrink-0" onClick={retrySave}>저장 다시 시도</button></div>}{children}<footer className="content-footer"><span>내 브라우저에서 관리하는 작은 워크스페이스</span><span>실제 인증 기능이 없는 로컬 데모</span></footer></main>
    <div className="sr-only" role="status" aria-live="polite">{notice}</div></div>
    {menuOpen && <Modal title={data.settings.serviceName} onClose={() => setMenuOpen(false)}><div className="p-5">{nav()}</div></Modal>}
  </div>;
}
