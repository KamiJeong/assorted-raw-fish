"use client";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, SlidersHorizontal, Trash2, Users, X } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Avatar, StatusBadge } from "@/components/ui";
import { UserForm } from "@/components/user-form";
import { ConfirmDialog } from "@/components/modal";
import { filterUsers, formatDate } from "@/lib/users";
import type { User } from "@/lib/types";
const PAGE_SIZE = 8;
export default function UsersPage() {
  const { data, deleteUser, notice } = useApp();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("전체");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<User | "new" | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const filtered = filterUsers(data.users, query, status);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const shown = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  return <>
    <div className="page-heading"><div><div className="eyebrow">워크스페이스 구성원</div><h1>사용자 관리</h1><p>사용자 정보를 확인하고, 새로운 구성원을 추가하세요.</p></div><button ref={addButton} className="button primary" onClick={() => setEditing("new")}><Plus size={17} />사용자 추가</button></div>
    <section className="panel"><div className="section-heading table-heading"><div className="flex items-center gap-3"><h2>전체 사용자</h2><span className="count-chip">{data.users.length}명</span></div><span className="muted text-xs hidden sm:block">사용자 정보는 이 브라우저에 저장됩니다.</span></div>
      <div className="table-toolbar"><div className="search-field"><Search size={18} /><label className="sr-only" htmlFor="user-search">이름 또는 이메일 검색</label><input id="user-search" type="search" placeholder="이름 또는 이메일로 검색" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></div><div className="filter-field"><SlidersHorizontal size={16} /><label htmlFor="status-filter">상태</label><select id="status-filter" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="전체">전체 상태</option><option>활성</option><option>비활성</option></select></div></div>
      {(query || status !== "전체") && <div className="filter-summary"><span>검색 결과 <strong>{filtered.length}명</strong></span><button onClick={() => { setQuery(""); setStatus("전체"); setPage(1); }}>필터 초기화<X size={13} /></button></div>}
      {shown.length ? <div className="table-scroll"><table className="users-table"><caption className="sr-only">사용자 목록</caption><thead><tr><th>이름</th><th>이메일</th><th>역할</th><th>상태</th><th>가입일</th><th><span className="sr-only">관리</span></th></tr></thead><tbody>{shown.map((user, index) => <tr key={user.id}><td data-label="이름"><div className="user-cell"><Avatar name={user.name} index={index} /><span className="font-medium break-all">{user.name}</span></div></td><td data-label="이메일" className="muted user-email">{user.email}</td><td data-label="역할"><span className="role-badge">{user.role}</span></td><td data-label="상태"><StatusBadge status={user.status} /></td><td data-label="가입일" className="muted whitespace-nowrap">{formatDate(user.joinedAt)}</td><td data-label="관리"><div className="row-actions"><button className="icon-button" aria-label={`${user.name} 수정`} onClick={() => setEditing(user)}><Pencil size={16} /></button><button className="icon-button delete-button" aria-label={`${user.name} 삭제`} onClick={() => setDeleting(user)}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div> : <div className="empty-state"><Users size={34} /><h3>{data.users.length ? "검색 결과가 없습니다" : "아직 등록된 사용자가 없습니다"}</h3><p>{data.users.length ? "다른 이름이나 이메일로 검색하거나 필터를 변경해 보세요." : "새 사용자를 추가해 워크스페이스를 시작하세요."}</p><button className="button" onClick={() => { if (data.users.length) { setQuery(""); setStatus("전체"); setPage(1); } else setEditing("new"); }}>{data.users.length ? "검색과 필터 초기화" : "첫 사용자 추가"}</button></div>}
      <div className="pagination"><p>총 <strong>{filtered.length}</strong>명{filtered.length > 0 && <> 중 {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}명 표시</>}</p><nav aria-label="사용자 목록 페이지" className="flex items-center gap-2"><button className="icon-button bordered" aria-label="이전 페이지" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={17} /></button><span className="page-number">{currentPage} / {pageCount}</span><button className="icon-button bordered" aria-label="다음 페이지" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight size={17} /></button></nav></div>
    </section><p className="muted mt-4 text-xs">역할과 상태는 데모 데이터입니다. 실제 인증이나 접근 권한을 제어하지 않습니다.</p><p className="feedback" aria-live="polite">{notice}</p>
    {editing && <UserForm user={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
    {deleting && <ConfirmDialog title="사용자를 삭제할까요?" description={`${deleting.name}님의 사용자 정보가 삭제됩니다. 삭제한 정보는 복구할 수 없습니다.`} confirmLabel="사용자 삭제" onClose={() => setDeleting(null)} onConfirm={() => { deleteUser(deleting.id); setDeleting(null); addButton.current?.focus(); }} />}
  </>;
}
