import type { UserStatus } from "@/lib/types";
export function StatusBadge({ status }: { status: UserStatus }) { return <span className={`status-badge ${status === "활성" ? "active" : "inactive"}`}><span />{status}</span>; }
export function Avatar({ name, index = 0 }: { name: string; index?: number }) { return <span aria-hidden="true" className={`avatar avatar-${index % 3}`}>{name.slice(0, 1)}</span>; }
