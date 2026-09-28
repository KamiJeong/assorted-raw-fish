export type UserRole = "관리자" | "매니저" | "멤버";
export type UserStatus = "활성" | "비활성";
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
}
export interface Settings { serviceName: string; theme: "light" | "dark" }
export interface AppData { version: 1; users: User[]; settings: Settings }
export type UserInput = Pick<User, "name" | "email" | "role" | "status">;
