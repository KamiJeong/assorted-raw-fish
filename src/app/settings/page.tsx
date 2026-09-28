"use client";
import { useState, type FormEvent } from "react";
import { Check, Monitor, Moon, RotateCcw, Save, Settings2, ShieldCheck, Sun } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { ConfirmDialog } from "@/components/modal";
export default function SettingsPage() {
  const { data, updateSettings, reset, storageError } = useApp();
  const [name, setName] = useState(data.settings.serviceName);
  const [nameError, setNameError] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  function save(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) { setNameError("서비스 이름을 입력해 주세요."); return; }
    updateSettings({ serviceName: name.trim() }); setName(name.trim()); setNameError(""); setSaved(true);
  }
  return <><div className="page-heading"><div><div className="eyebrow">나에게 맞는 작업 공간</div><h1>설정</h1><p>서비스 정보와 화면 테마를 관리하세요.</p></div></div><div className="settings-layout"><div className="space-y-6">
    <section className="panel settings-panel"><div className="section-heading"><div className="flex gap-3"><span className="settings-icon"><Settings2 size={20} /></span><div><h2>기본 정보</h2><p>사이드바에 표시되는 서비스 이름을 설정합니다.</p></div></div></div><form onSubmit={save} noValidate><div className="settings-body"><div className="field"><label htmlFor="service-name">서비스 이름</label><input id="service-name" required maxLength={30} value={name} onChange={event => { setName(event.target.value); setSaved(false); }} aria-invalid={!!nameError} aria-describedby={nameError ? "service-error" : "service-hint"} />{nameError ? <p className="field-error" id="service-error">{nameError}</p> : <p className="muted text-xs" id="service-hint">최대 30자까지 입력할 수 있습니다.</p>}</div></div><div className="settings-actions"><span className="feedback" role="status">{saved && (storageError ? "화면에 반영되었습니다. 저장 상태를 확인해 주세요." : "변경 사항이 저장되었습니다.")}</span><button className="button primary" type="submit"><Save size={16} />변경 사항 저장</button></div></form></section>
    <section className="panel settings-panel"><div className="section-heading"><div className="flex gap-3"><span className="settings-icon"><Monitor size={20} /></span><div><h2>화면 테마</h2><p>편안하게 사용할 화면 모드를 선택하세요.</p></div></div></div><fieldset className="settings-body"><legend className="sr-only">화면 테마 선택</legend><div className="grid grid-cols-2 gap-4">{([{ value: "light", label: "라이트 모드", icon: Sun }, { value: "dark", label: "다크 모드", icon: Moon }] as const).map(({ value, label, icon: Icon }) => <label key={value} className={`theme-option ${data.settings.theme === value ? "chosen" : ""}`}><input type="radio" name="theme" value={value} checked={data.settings.theme === value} onChange={() => updateSettings({ theme: value })} className="theme-radio" /><div className={`theme-preview preview-${value}`} aria-hidden="true"><div className="preview-sidebar" /><div className="preview-content"><div /><section><i /><i /></section><article /></div></div><span className="theme-label"><Icon size={16} />{label}{data.settings.theme === value && <Check className="ml-auto" size={17} />}</span></label>)}</div><p className="muted mt-4 text-xs">선택한 테마는 즉시 적용되고 이 브라우저에 저장됩니다.</p></fieldset></section>
    <section className="panel settings-panel reset-panel"><div className="section-heading"><div><h2>데모 데이터 초기화</h2><p>처음 상태로 돌아가 다시 둘러보세요.</p></div><RotateCcw size={20} className="muted" /></div><div className="settings-body"><p className="muted text-sm leading-6">추가하거나 수정한 사용자가 삭제되고 가상 사용자 30명이 복원됩니다. 서비스 이름과 테마도 기본값으로 돌아갑니다.</p><button className="button danger-outline mt-5" onClick={() => setConfirmReset(true)}><RotateCcw size={16} />데모 데이터 초기화</button></div></section></div>
    <aside className="settings-aside"><ShieldCheck size={24} /><h2>이 워크스페이스에 대해</h2><p>실제 인증 기능이 없는 로컬 데모입니다. 사용자와 설정은 현재 브라우저에만 저장됩니다.</p><div className="aside-divider" /><h3>안심하고 테스트하세요</h3><p>외부 서버나 데이터베이스로 데이터를 전송하지 않습니다. 브라우저 데이터를 지우면 저장된 내용도 삭제됩니다.</p><span className="local-label"><span className="status-dot" />내 브라우저에 저장</span></aside></div>
    {confirmReset && <ConfirmDialog title="데모 데이터를 초기화할까요?" description="모든 사용자 변경 사항과 설정이 초기값으로 교체됩니다. 이 작업은 되돌릴 수 없습니다." confirmLabel="초기화하기" onClose={() => setConfirmReset(false)} onConfirm={() => { reset(); setName("모아"); setSaved(false); setNameError(""); setConfirmReset(false); }} />}
  </>;
}
