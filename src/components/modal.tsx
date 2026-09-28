"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({ title, description, onClose, children }: { title: string; description?: string; onClose: () => void; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current!;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    element.querySelector<HTMLElement>("[data-initial-focus]")?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      if (previous?.isConnected) previous.focus();
      else document.getElementById("main")?.focus();
    };
  }, []);
  return <dialog ref={dialog} aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} className="modal" onKeyDown={event => {
    if (event.key !== "Tab") return;
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')).filter(item => item.getClientRects().length > 0);
    const first = items[0], last = items[items.length - 1];
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) { const box = event.currentTarget.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onClose(); } }}>
    <div className="modal-header"><div><h2 id={titleId}>{title}</h2>{description && <p id={descriptionId} className="muted mt-2 text-sm">{description}</p>}</div><button className="icon-button shrink-0" aria-label="닫기" onClick={onClose}><X size={20} /></button></div>
    {children}
  </dialog>;
}
export function ConfirmDialog({ title, description, confirmLabel, onClose, onConfirm }: { title: string; description: string; confirmLabel: string; onClose: () => void; onConfirm: () => void }) {
  return <Modal title={title} description={description} onClose={onClose}><div className="modal-actions"><button data-initial-focus autoFocus className="button" onClick={onClose}>취소</button><button className="button danger" onClick={onConfirm}>{confirmLabel}</button></div></Modal>;
}
