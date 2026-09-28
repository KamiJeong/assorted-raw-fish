"use client";
import { useRef, useState, type FormEvent } from "react";
import { useApp } from "./app-provider";
import { Modal } from "./modal";
import type { User, UserInput, UserRole, UserStatus } from "@/lib/types";

export function UserForm({ user, onClose }: { user?: User; onClose: () => void }) {
  const { saveUser } = useApp();
  const [input, setInput] = useState<UserInput>(user ?? { name: "", email: "", role: "멤버", status: "활성" });
  const [errors, setErrors] = useState<Partial<Record<keyof UserInput, string>>>({});
  const form = useRef<HTMLFormElement>(null);
  function submit(event: FormEvent) {
    event.preventDefault();
    const result = saveUser(input, user?.id);
    if (Object.keys(result).length) { setErrors(result); form.current?.querySelector<HTMLInputElement>(`[name="${Object.keys(result)[0]}"]`)?.focus(); }
    else onClose();
  }
  return <Modal title={user ? "사용자 수정" : "새 사용자 추가"} description="워크스페이스에서 사용할 사용자 정보를 입력하세요." onClose={onClose}><form ref={form} onSubmit={submit} noValidate><div className="form-body"><div className="field"><label htmlFor="user-name">이름 <span className="required">*</span></label><input data-initial-focus autoFocus id="user-name" name="name" autoComplete="name" required maxLength={40} value={input.name} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} onChange={event => setInput({ ...input, name: event.target.value })} placeholder="예: 김민준" />{errors.name && <p id="name-error" className="field-error">{errors.name}</p>}</div><div className="field"><label htmlFor="user-email">이메일 <span className="required">*</span></label><input id="user-email" name="email" type="email" autoComplete="email" required maxLength={254} value={input.email} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} onChange={event => setInput({ ...input, email: event.target.value })} placeholder="name@example.com" />{errors.email && <p id="email-error" className="field-error">{errors.email}</p>}</div><div className="grid grid-cols-2 gap-4"><div className="field"><label htmlFor="user-role">역할</label><select id="user-role" value={input.role} onChange={event => setInput({ ...input, role: event.target.value as UserRole })}>{["관리자", "매니저", "멤버"].map(role => <option key={role}>{role}</option>)}</select></div><div className="field"><label htmlFor="user-status">상태</label><select id="user-status" value={input.status} onChange={event => setInput({ ...input, status: event.target.value as UserStatus })}><option>활성</option><option>비활성</option></select></div></div><p className="form-hint">역할과 상태는 데모용이며 실제 접근 권한에 영향을 주지 않습니다.</p></div><div className="modal-actions"><button type="button" className="button" onClick={onClose}>취소</button><button type="submit" className="button primary">{user ? "변경 사항 저장" : "사용자 추가"}</button></div></form></Modal>;
}
