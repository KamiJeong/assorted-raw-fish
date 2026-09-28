# ASS-6 리뷰 인계

기존 ASS-5 대시보드 구현을 이어서 Product Design 관점의 검토 및 수정을 완료했습니다. 상세 발견 사항·대비 수치·범위는 [DESIGN_REVIEW.md](DESIGN_REVIEW.md)를 참고하세요.

## 변경

- 보조 글자 최소 12px, 표 본문 14px, 입력 16px 및 rem 기반 크기·행간·굵기 정리.
- 양 테마의 텍스트·입력 경계 대비 검사, 라이트 보조 텍스트·활성 배지·입력 경계 개선.
- 클릭 영역, 모바일 상태 요약과 표 헤더, 확대 시 줄바꿈, 설정 오류 포커스·안내 개선.
- 기존 페이지 및 데이터 흐름 유지. 새 API·페이지·라이브러리 없음.

## 검증 결과

- `npm run lint`, `npm run typecheck`, `npm run build`: 통과.
- `npm test`: 기존 데이터 테스트 5개 통과.
- `PLAYWRIGHT_PORT=3116 npm run test:e2e -- --workers=2`: Chromium 15개 모두 통과(10.5초). 운영 서버를 3116번 포트에서 먼저 시작함.
- 기존 CRUD·저장·모달·모바일 회귀 8개와 신규 디자인 접근성 검사 7개.
- 라이트/다크, 320/768/1440px 세 화면, 200% 루트 글자 확대, 표 열 헤더, 키보드 및 오류 포커스 확인.
- 모바일 설정과 200% 사용자 표 수정 후 최종 캡처 재확인. 캡처는 `test-results/design-*.png`에 생성됨.
- `git diff --check`: 통과.

## 범위와 인계

실제 스크린리더 발화, Safari/iOS, OS 고대비 모드는 미검증이며 전체 WCAG 준수 인증을 의미하지 않습니다. 자동화한 확대 검사는 브라우저 줌 대신 루트 글자 크기를 200%로 설정합니다.

관리형 `symphony_handoff`로 커밋·최신 main 통합·원격 CI·리뷰 확인 후 PR을 인계합니다. 최종 PR URL과 호스트 검증 결과는 이슈의 단일 Codex Workpad에 기록합니다. 병합·배포는 이 작업 범위에 포함하지 않습니다. 이전 ASS-5 문서의 임시 번들 인계 절차는 현재 관리형 워크플로로 대체됩니다.


# ASS-7 404 페이지 인계

- 기존 App Router `not-found.tsx`에 중앙 문서 그림, 404 코드, 한국어 안내와 대시보드 복귀 링크를 추가했습니다.
- 기존 lucide 아이콘과 테마 색상을 사용하며 새 의존성은 없습니다. 그림은 4.8초 동안 움직인 뒤 멈추고, 동작 줄이기 설정에서는 움직이지 않습니다. 장식 그림은 접근성 트리에서 제외합니다.
- `npm run lint`, `npm run typecheck`, `npm test`(5개), `npm run build`, `git diff --check`: 통과.
- 운영 서버 3117번 포트에서 `PLAYWRIGHT_PORT=3117 npm run test:e2e -- --workers=2`: Chromium 21개 통과(기존 15개 + 신규 6개).
- 신규 검사는 최상위·중첩 URL의 HTTP 404, 키보드 복귀, 실제 애니메이션 변화·종료 및 동작 줄이기, 320/768/1440px 양 테마의 중앙 정렬과 가로 넘침을 확인합니다.
- `test-results/not-found-*.png` 캡처 생성, 320px 라이트 및 1440px 다크 화면 육안 확인 완료. Safari/Firefox는 미검증입니다.
- 저장소 외부 `bun.lock` 무시 경고가 있었으나 빌드 및 운영 서버 실행은 성공했습니다.
- 관리형 handoff의 PR 및 원격 CI 결과는 ASS-7 Codex Workpad에 기록합니다. 병합·배포는 수행하지 않습니다.
