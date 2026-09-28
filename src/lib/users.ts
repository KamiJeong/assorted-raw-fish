import type { User, UserInput } from "./types";

export function validateUser(input: UserInput, users: User[], editingId?: string) {
  const errors: Partial<Record<keyof UserInput, string>> = {};
  if (!input.name.trim()) errors.name = "이름을 입력해 주세요.";
  else if (input.name.trim().length > 40) errors.name = "이름은 40자 이내로 입력해 주세요.";
  const email = input.email.trim();
  if (!email) errors.email = "이메일을 입력해 주세요.";
  else if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "올바른 이메일 주소를 입력해 주세요.";
  else if (users.some(user => user.id !== editingId && user.email.toLowerCase() === email.toLowerCase())) errors.email = "이미 등록된 이메일입니다.";
  if (!["관리자", "매니저", "멤버"].includes(input.role)) errors.role = "역할을 선택해 주세요.";
  if (!["활성", "비활성"].includes(input.status)) errors.status = "상태를 선택해 주세요.";
  return errors;
}

export function monthlySignups(users: User[], now: Date) {
  return Array.from({ length: 6 }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    return { month: `${month.getMonth() + 1}월`, fullMonth: `${month.getFullYear()}년 ${month.getMonth() + 1}월`, count: users.filter(user => {
      const date = new Date(user.joinedAt);
      return date >= month && date < end;
    }).length };
  });
}

export function filterUsers(users: User[], query: string, status: string) {
  const search = query.trim().toLowerCase();
  return users.filter(user => (status === "전체" || user.status === status) && `${user.name} ${user.email}`.toLowerCase().includes(search))
    .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
}
export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}
