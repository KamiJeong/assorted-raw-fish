import type { AppData, User } from "./types";

const names = ["김민준", "이서연", "박지호", "최수빈", "정하윤", "강도윤", "조예린", "윤시우", "장서준", "임지우", "한유진", "오지민", "서현우", "신채원", "권준서", "황수아", "안민서", "송도현", "전소윤", "홍우진", "유하은", "고건우", "문서현", "양지안", "손예준", "배다은", "백시윤", "허서우", "남이준", "심나연"];

// Created only when loading a fresh store or explicitly resetting it; never during render.
export function createMockData(now = new Date()): AppData {
  const users: User[] = names.map((name, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - index * 6, 12);
    return {
      id: `demo-${index + 1}`, name, email: `member${String(index + 1).padStart(2, "0")}@example.com`,
      role: index < 2 ? "관리자" : index % 5 === 0 ? "매니저" : "멤버",
      status: index % 4 === 3 ? "비활성" : "활성", joinedAt: date.toISOString(),
    };
  });
  return { version: 1, users, settings: { serviceName: "모아", theme: "light" } };
}
