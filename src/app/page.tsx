"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CalendarDays, ChevronRight, UserCheck, UserPlus, Users, UserX } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useApp } from "@/components/app-provider";
import { Avatar, StatusBadge } from "@/components/ui";
import { formatDate, monthlySignups } from "@/lib/users";

export default function Dashboard() {
  const { data } = useApp();
  const [now] = useState(() => new Date());
  const users = data.users;
  const months = monthlySignups(users, now);
  const activeCount = users.filter(user => user.status === "활성").length;
  const recent = [...users].sort((a, b) => b.joinedAt.localeCompare(a.joinedAt)).slice(0, 5);
  const cards = [
    { label: "전체 사용자", value: users.length, detail: "워크스페이스에 등록된 모든 사용자", icon: Users },
    { label: "활성 사용자", value: activeCount, detail: "현재 활성 상태인 사용자", icon: UserCheck },
    { label: "비활성 사용자", value: users.length - activeCount, detail: "현재 비활성 상태인 사용자", icon: UserX },
    { label: "이번 달 가입자", value: months[5].count, detail: `${now.getMonth() + 1}월에 새롭게 합류한 사용자`, icon: UserPlus },
  ];
  return <>
    <div className="page-heading"><div><div className="eyebrow">워크스페이스 한눈에 보기</div><h1>대시보드</h1><p>반가워요, 관리자님. 오늘의 사용자 현황을 확인하세요.</p></div><div className="date-chip"><CalendarDays size={16} />{formatDate(now.toISOString())}</div></div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, detail, icon: Icon }, index) => <section className={`panel stat-card ${index === 0 ? "stat-featured" : ""}`} key={label}><div className="flex items-center justify-between"><h2>{label}</h2><span className="stat-icon"><Icon size={19} /></span></div><div className="stat-value">{value.toLocaleString("ko-KR")}<span>명</span></div><p>{detail}</p></section>)}</div>
    <div className="dashboard-middle"><section className="panel chart-panel"><div className="section-heading"><div><h2>사용자 가입 추이</h2><p>최근 6개월간 새롭게 합류한 사용자입니다.</p></div><span className="period-chip">최근 6개월</span></div><div className="chart-summary"><strong>{months.reduce((sum, month) => sum + month.count, 0)}<span>명</span></strong><span className="muted text-sm">최근 6개월 가입자</span><span className="chart-legend"><i />가입자 수</span></div><div className="chart-container" role="img" aria-label={months.map(month => `${month.fullMonth} 가입자 ${month.count}명`).join(", ")}><ResponsiveContainer width="100%" height="100%" minWidth={0}><AreaChart data={months} margin={{ top: 10, right: 14, left: -22, bottom: 0 }} accessibilityLayer><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--border)" /><XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={12} tick={{ fill: "var(--muted)", fontSize: 12 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} /><Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }} formatter={value => [`${value}명`, "가입자"]} /><Area type="monotone" dataKey="count" name="가입자" stroke="var(--accent)" fill="var(--accent-soft)" strokeWidth={2.5} isAnimationActive={false} dot={{ r: 3, strokeWidth: 2, fill: "var(--surface)" }} /></AreaChart></ResponsiveContainer></div></section>
    <section className="panel overview-panel"><div className="section-heading"><div><h2>사용자 상태</h2><p>현재 워크스페이스 구성</p></div><Users size={19} className="muted" /></div><div className="status-total"><span className="muted text-sm">전체 사용자 중</span><strong>{users.length ? Math.round(activeCount / users.length * 100) : 0}<span>%</span></strong><p>활성 사용자 비율</p></div><div className="status-track" aria-hidden="true"><span style={{ width: `${users.length ? activeCount / users.length * 100 : 0}%` }} /></div><div className="status-count"><span><i className="legend-active" />활성</span><strong>{activeCount}명</strong></div><div className="status-count"><span><i className="legend-inactive" />비활성</span><strong>{users.length - activeCount}명</strong></div><Link href="/users" className="overview-link">사용자 관리하기<ArrowRight size={16} /></Link></section></div>
    <section className="panel"><div className="section-heading table-heading"><div><h2>최근 가입한 사용자</h2><p>가장 최근에 합류한 사용자 5명입니다.</p></div><Link href="/users" className="text-link">전체 보기<ChevronRight size={16} /></Link></div>{recent.length ? <div className="table-scroll"><table><caption className="sr-only">최근 가입한 사용자</caption><thead><tr><th>사용자</th><th className="mobile-hidden">이메일</th><th>상태</th><th className="mobile-hidden">가입일</th></tr></thead><tbody>{recent.map((user, index) => <tr key={user.id}><td><div className="user-cell"><Avatar name={user.name} index={index} /><span className="font-medium">{user.name}</span></div></td><td className="muted mobile-hidden">{user.email}</td><td><StatusBadge status={user.status} /></td><td className="muted mobile-hidden">{formatDate(user.joinedAt)}</td></tr>)}</tbody></table></div> : <div className="empty-state"><Users size={32} /><h3>아직 등록된 사용자가 없습니다</h3><p>첫 사용자를 추가하고 워크스페이스를 시작하세요.</p><Link href="/users" className="button primary">사용자 추가하러 가기</Link></div>}</section>
  </>;
}
