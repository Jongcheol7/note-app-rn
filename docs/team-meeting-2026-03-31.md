# Notie 전담팀 회의록

**일시:** 2026-03-31
**참석:** PM팀, 디자인팀, 개발팀
**목표:** Play Store 노트앱 1위

---

## 현황 요약

| 항목 | 수치 |
|------|------|
| 소스 파일 | 61개 |
| 라우트 | 17개 |
| 서비스 | 7개 |
| 전체 완성도 | **약 60%** (출시 기준) |

**핵심 진단:** 코드 구조와 기능 로직은 잘 갖춰져 있으나, **폴리시, 안정성, 플랫폼 통합**이 부족하다. 현재 상태는 "개발자 프로토타입"이지 소비자 제품이 아니다.

---

## 1. PM팀 분석

### 경쟁 우위
- **커뮤니티 + 소셜 노트** — 경쟁앱(Keep, Samsung Notes, Bear)에 없는 독자 기능
- **1:1 채팅** — 커뮤니티 기반 메시징은 노트앱에서 유일
- **심플한 요금제** — Notion 대비 단순명료

### 경쟁 열위 (vs Google Keep, Samsung Notes)
- 위젯 없음, 공유 확장 없음, 푸시 알림 없음
- 오프라인 모드 코드는 있으나 **실제 연결 안 됨**
- 인앱 결제 0% 구현
- 분석/크래시 리포팅 없음
- 앱스토어 제출 불가 (패키지명, EAS 설정 없음)

### 사용자 여정 주요 문제점
1. **온보딩 없음** — 로그인부터 요구, 가치 제안 없이 인증 강요
2. **자동 저장 없음** — 수동 저장 필수, 실수로 뒤로가면 새 노트 데이터 손실
3. **카테고리 선택 불가** — 노트 작성/수정 화면에 카테고리 선택 UI 누락
4. **커뮤니티 발견성 0** — 트렌딩/추천 없음, 유저 검색 불가, 좋아요 버튼 상세에 없음
5. **채팅 진입 어려움** — 커뮤니티 노트 → 유저 프로필 → 채팅 (3단계)

### 우선순위 로드맵

#### P0: 출시 전 필수 (1-4주)
1. Android 패키지명 + EAS 빌드 설정
2. 오프라인 모드 실제 연결 (sync engine → hooks)
3. 링크 삽입 다이얼로그 구현
4. 채팅 중복 폴링 제거 (Realtime만 사용)
5. 노트 작성/수정에 카테고리 선택기 추가
6. 테마 설정 영속화 (AsyncStorage)
7. 크래시 리포팅 + 분석 (Sentry/Firebase)
8. 앱 아이콘 + 스토어 에셋 제작
9. 새 노트 미저장 경고 추가
10. 휴지통 자동삭제를 서버 사이드로 이전

#### P1: 출시 후 1개월 (5-8주)
1. 푸시 알림 (expo-notifications)
2. 온보딩 플로우 (3화면)
3. 이미지 캐싱 (expo-image)
4. 스켈레톤 로딩
5. 노트 카드 스와이프 제스처
6. 자동 저장 (3초 디바운스)
7. Apple Sign-In 추가
8. 커뮤니티 좋아요 버튼 상세에 추가
9. 에러 바운더리
10. E2E 테스트 (Maestro)

#### P2: 3개월 로드맵
- 인앱 결제 (IAP)
- Android 위젯
- 공유 확장 (share intent)
- PDF/마크다운 내보내기
- 음성 녹음
- 드래그 정렬, 멀티 선택
- 검색 고도화, 다국어 (i18n)

#### P3: 6개월 비전
- AI 기능 (요약, 자동 분류, 글쓰기 보조)
- 실시간 공동 편집
- 필기/그리기 캔버스
- OCR, 노트 템플릿, 생체 잠금

### 성공 지표

| 시점 | 지표 | 목표 |
|------|------|------|
| 출시 | 크래시 프리율 | >99% |
| 1개월 | Play Store 평점 | ≥4.0 |
| 1개월 | Day-7 리텐션 | ≥20% |
| 3개월 | MAU | 10,000+ |
| 3개월 | 유료 전환율 | ≥2% |
| 6개월 | MAU | 100,000+ |
| 6개월 | Play Store 순위 (생산성, 한국) | Top 50 |

---

## 2. 디자인팀 분석

### 핵심 문제: 브랜드 아이덴티티 부재

원본 웹앱의 **따뜻한 코랄-오렌지 그라디언트**, **크림색 배경**, **Inter 폰트** 등 브랜드 요소가 RN 포팅 과정에서 전부 사라졌다. 현재 앱은 `#000`과 `#fff`만으로 구성된 **모노크롬** 상태.

### 비주얼 감사 결과

| 항목 | 상태 | 문제 |
|------|------|------|
| 타이포그래피 | ❌ | 폰트 스케일 없음, 10~22px 사이 11개 사이즈 무질서 사용 |
| 컬러 시스템 | ❌ | 하드코딩된 `isDark ? '#xxx' : '#yyy'` 반복, 3개 이상 다크모드 버그 |
| 간격 | ⚠️ | 대체로 일관적이나 토큰 없음 |
| 아이콘 | ⚠️ | Ionicons 일관 사용, 일부 선택 부적절 |
| 전체 미감 | ❌ | 개발자 프로토타입 수준, 경쟁앱 대비 큰 격차 |

### 다크모드 버그 (P0)
- 커뮤니티 카드 border `#eee` → 다크 배경에서 밝은 선
- 채팅 날짜 헤더 `#f3f4f6` → 다크에서 부자연스러움
- 툴바 separator `#ddd` → 다크에서 눈에 띔
- **모든 `#000` 버튼** (저장, 전송, 추가, 활성 칩, 캘린더 선택일) → 다크 배경에서 보이지 않음

### UX 문제

| 문제 | 심각도 |
|------|--------|
| 알람 모달이 TextInput으로 `YYYY-MM-DDTHH:MM` 수동 입력 요구 | **치명적** |
| 접근성 라벨 전체 누락 (accessibilityLabel 0개) | **치명적** |
| 마이크로 인터랙션 전무 (햅틱, 애니메이션, 트랜지션) | 높음 |
| 스켈레톤 로딩 없음 (모든 화면 ActivityIndicator) | 높음 |
| 스와이프 제스처 없음 (삭제, 핀, 아카이브) | 높음 |
| 롱프레스 컨텍스트 메뉴 없음 | 높음 |
| 카테고리 정렬이 위/아래 버튼 (드래그 아님) | 중간 |
| 검색바 고정 width 200px | 중간 |

### 디자인 시스템 필요 사항

```
필수 구축:
1. ThemeProvider + 시맨틱 컬러 토큰 (background, surface, text, primary, accent, destructive)
2. 타이포그래피 스케일 (display/heading/subheading/body/caption/tiny)
3. 간격 스케일 (xs:4, sm:8, md:12, lg:16, xl:20, xxl:24, xxxl:32)

필수 공통 컴포넌트:
1. BottomSheet (현재 4개 모달 구현이 각각 다름)
2. Avatar (6곳에서 동일 로직 중복)
3. ScreenHeader (6곳에서 동일 패턴 중복)
4. Button (primary/secondary/destructive/ghost)
5. IconButton (최소 44x44 터치 영역 + 햅틱)
6. Card (그림자 + 프레스 애니메이션)
7. EmptyState (일러스트 + CTA 버튼)
8. SkeletonLoader
```

---

## 3. 개발팀 분석

### 아키텍처 평가: B+

레이어 분리는 깔끔하나 중요한 기술적 이슈가 있다.

### 크리티컬 이슈

| # | 이슈 | 심각도 | 파일 |
|---|------|--------|------|
| 1 | **스키마 네이밍 불일치** — schema.sql은 snake_case, add-rls.sql/서비스는 camelCase. syncEngine.native.ts는 snake_case → 동기화 완전 실패 | 🔴 치명적 | syncEngine.native.ts, schema.sql |
| 2 | **HTML 새니타이즈 없음** — 커뮤니티 노트에서 XSS 공격 가능 | 🔴 치명적 | noteService.ts, NoteEditor.tsx |
| 3 | **인증 토큰 암호화 안 됨** — AsyncStorage는 평문 저장, expo-secure-store 미사용 | 🔴 치명적 | supabase.ts |
| 4 | **메시지 수정 RLS 버그** — 대화 참여자가 상대방 메시지 수정 가능 | 🟡 높음 | add-rls.sql |
| 5 | **에러 바운더리 없음** — 컴포넌트 크래시 시 전체 앱 화이트 스크린 | 🟡 높음 | app/_layout.tsx |
| 6 | **NoteCard에 React.memo 없음** — 가장 많이 렌더되는 컴포넌트 최적화 부재 | 🟡 높음 | NoteCard.tsx |

### 성능 문제

| 문제 | 영향 |
|------|------|
| 채팅 2초 폴링 + Realtime 이중 수신 | 배터리 소모 |
| 이미지 캐싱 없음 (Image 컴포넌트 직접 사용) | 느린 로딩, 데이터 소비 |
| NoteCard에서 각각 useTogglePin 훅 생성 | N개 mutation 인스턴스 |
| useNoteFormStore 전체 구독 (선택적 구독 아님) | 불필요한 리렌더 |
| 사용 안 하는 의존성 (axios, expo-av, expo-crypto) | 번들 사이즈 증가 |

### 보안 문제

| 문제 | 위험도 |
|------|--------|
| 커뮤니티 노트 HTML 미새니타이즈 (XSS) | 🔴 |
| 인증 토큰 평문 저장 (AsyncStorage) | 🔴 |
| 차단 필터 단방향만 적용 | 🟡 |
| 유저 테이블 전체 SELECT 허용 (이메일 노출) | 🟡 |
| 노트/댓글/메시지 길이 제한 없음 | 🟡 |

### 오프라인 시스템 문제

| 문제 | 설명 |
|------|------|
| **hooks에 연결 안 됨** | enqueueAction 호출처 없음, 로컬 캐시 폴백 없음 |
| syncEngine 컬럼명 snake_case | DB는 camelCase → pull 결과 0건 |
| 풀 한도 200건 | 대량 노트 사용자 누락 |
| 충돌 해결 없음 | 마지막 쓰기 승리, 알림 없음 |
| 삭제 동기화 불가 | 서버에서 삭제된 노트 로컬에 영구 잔존 |

### 테스트 현황: **0개**
- 유닛 테스트 0개
- 통합 테스트 0개
- E2E 테스트 0개
- jest.config 없음
- 테스트 라이브러리 미설치

### Play Store 제출 전 필수

| 항목 | 상태 |
|------|------|
| android.package 설정 | ❌ |
| android.versionCode | ❌ |
| eas.json (빌드 설정) | ❌ |
| 앱 서명 키 | ❌ |
| 크래시 리포팅 | ❌ |
| 분석 도구 | ❌ |
| 개인정보처리방침 실제 내용 | ❌ |
| 접근성 라벨 | ❌ |

---

## 4. 팀 합의사항

### 즉시 착수 (이번 주)

1. **스키마 통일** — syncEngine을 camelCase로 수정, schema.sql 폐기 (기존 DB 사용)
2. **다크모드 버그 전체 수정** — `#000` 버튼 → 브랜드 컬러
3. **HTML 새니타이즈** 추가 (DOMPurify)
4. **인증 토큰 SecureStore** 이전
5. **알람 모달 DateTimePicker** 교체

### 출시 전 마일스톤 (4주)

| 주차 | PM | 디자인 | 개발 |
|------|-----|--------|------|
| 1주 | 스토어 에셋 기획 | 디자인 토큰 + 테마 | 보안 수정 (XSS, 토큰, RLS) |
| 2주 | 온보딩 플로우 기획 | 컴포넌트 라이브러리 | 오프라인 연결 + 빌드 설정 |
| 3주 | ASO 최적화 | 스켈레톤 + 애니메이션 | 테스트 작성 + 크래시 리포팅 |
| 4주 | 내부 베타 테스트 | 최종 폴리시 | Play Store 제출 |

---

## 5. 결론

> **"기능은 60% 완성이지만, 제품은 30% 완성이다."**

코드 아키텍처는 견고하고 핵심 기능은 작동한다. 그러나 Play Store 1위를 목표로 한다면 **기능 추가보다 기존 기능의 품질 향상**이 급선무다.

**가장 임팩트 있는 한 가지:** 새 기능 추가가 아니라, 기존 기능을 **안정적이고 아름답게** 만드는 것. 오프라인 연결, 알림 추가, 스피너를 스켈레톤으로 교체, 애니메이션 추가, 빌드 파이프라인 구축 — 이것들이 유저 이탈을 막는다.

**Play Store 1위 = 기능 수가 아니라 완성도다.**

---

## 6. 오늘(3/31) 완료한 작업

| # | 작업 | 상태 |
|---|------|------|
| 1 | Expo 프로젝트 초기화 + 패키지 설치 | ✅ |
| 2 | Supabase 스키마 SQL + RLS 정책 | ✅ |
| 3 | Google OAuth 인증 + AuthGuard (9개 보호 라우트) | ✅ |
| 4 | 노트 CRUD 서비스 + React Query 훅 (11개 함수, 10개 훅) | ✅ |
| 5 | 홈 화면 (NoteCard 2열/커뮤니티 1열, 무한스크롤, 카테고리 필터, 검색) | ✅ |
| 6 | 노트 작성/상세 화면 (제목, 에디터, 저장/삭제/공개 메뉴) | ✅ |
| 7 | 휴지통 (복원/영구삭제, 30일 자동퍼지) | ✅ |
| 8 | TenTap 에디터 + 커스텀 툴바 (Bold~Link, 6색 하이라이트, 9색 텍스트) | ✅ |
| 9 | 이미지 업로드 (Supabase Storage, 압축, 용량 체크) | ✅ |
| 10 | 카테고리 CRUD + 정렬 | ✅ |
| 11 | 캘린더 (월별 알람, 날짜 선택) | ✅ |
| 12 | 커뮤니티 피드 + 댓글 서비스/훅 | ✅ |
| 13 | 유저 프로필 (자신: 아바타/닉네임/소개/저장공간, 타인: 공개노트/차단/신고) | ✅ |
| 14 | 채팅 (대화목록, 채팅방, Supabase Realtime, 읽음표시) | ✅ |
| 15 | 설정 (테마, 약관, 계정삭제) + 플랜 선택 | ✅ |
| 16 | 오프라인 SQLite + 동기화 엔진 + OfflineBanner | ✅ |
| 17 | 배경색 선택 모달 (12색) | ✅ |
| 18 | 알람 설정/해제 모달 | ✅ |
| 19 | 댓글 섹션 UI (목록+입력+삭제) | ✅ |
| 20 | 채팅 탭 안읽은수 뱃지 | ✅ |
| 21 | camelCase 마이그레이션 (기존 DB 호환) | ✅ |
| 22 | SSR 빌드 수정 (AsyncStorage/window 가드) | ✅ |
| 23 | 전담팀 회의 + 회의록 작성 | ✅ |

## 7. 오늘 남은 작업 (즉시 착수 항목)

회의에서 도출된 **즉시 착수** 항목 중 오늘 처리 가능한 것:

| # | 작업 | 담당 | 예상 시간 |
|---|------|------|-----------|
| 1 | ~~syncEngine camelCase 수정~~ | 개발 | ✅ 완료 |
| 2 | 다크모드 버그 전체 수정 — 디자인팀에서 진행 | 디자인+개발 | ⏳ 디자인팀 |
| 3 | ~~NoteCard React.memo + Note 타입~~ | 개발 | ✅ 완료 |
| 4 | ~~에러 바운더리 컴포넌트~~ | 개발 | ✅ 완료 |
| 5 | ~~메시지 수정 RLS 수정~~ | 개발 | ✅ 완료 |
| 6 | ~~schema.sql deprecated 표기~~ | 개발 | ✅ 완료 |
| 7 | ~~axios 의존성 제거~~ | 개발 | ✅ 완료 |
| 8 | ~~노트 작성에 카테고리 선택기~~ | 개발 | ✅ 완료 |

### 내일 이후 착수

| # | 작업 | 우선순위 | 상태 |
|---|------|----------|------|
| 1 | 디자인 토큰 시스템 (ThemeProvider + 시맨틱 컬러) | P0 | ⏳ 디자인팀 |
| 2 | ~~HTML 새니타이즈 (DOMPurify)~~ | P0 | ✅ 완료 |
| 3 | ~~인증 토큰 SecureStore 이전~~ | P0 | ✅ 완료 |
| 4 | 알람 모달 DateTimePicker 교체 | P0 | ⏳ |
| 5 | 접근성 라벨 전체 추가 | P0 | ⏳ |
| 6 | 앱 아이콘 + 스토어 에셋 | P0 | ⏳ PM팀 |
| 7 | ~~EAS 빌드 설정~~ + 앱 서명 | P0 | ✅/⏳ |
| 8 | 크래시 리포팅 (Sentry) | P0 | ⏳ |
| 9 | 스켈레톤 로딩 | P1 | ⏳ 디자인팀 |
| 10 | 푸시 알림 (expo-notifications) | P1 | ⏳ |

---

## 8. 개발팀 분석 항목 처리 현황 (3/31 업데이트)

### 보안 (4/5 완료)
- [x] HTML 새니타이즈 (sanitize.ts + noteService 적용)
- [x] SecureStore 인증 토큰 이전
- [x] 메시지 수정 RLS (senderId 체크)
- [x] 양방향 차단 필터
- [ ] 크래시 리포팅 (Sentry) — 별도 설치 필요

### 성능 (4/5 완료)
- [x] NoteCard React.memo + Note 타입
- [x] pin 로직 리스트 레벨 이동
- [x] 채팅 2초 폴링 제거 (Realtime만)
- [x] axios 미사용 의존성 제거
- [ ] expo-image 이미지 캐싱 — npm 잠금으로 설치 보류

### 오프라인 (5/5 완료)
- [x] syncEngine camelCase 수정
- [x] 페이지네이션 pull (200건 배치)
- [x] 서버 삭제 감지
- [x] 카테고리 트랜잭션 동기화
- [x] hooks에 오프라인 폴백 연결

### 기술부채 (5/5 완료)
- [x] ErrorBoundary 컴포넌트
- [x] CategorySelector 컴포넌트 (노트 작성에 추가)
- [x] supabase.ts Proxy 패턴 (null as any 제거)
- [x] auto-purge 분리 (purgeOldTrashNotes)
- [x] schema.sql deprecated 표기

### 출시준비 (4/6 완료)
- [x] app.json 완성 (패키지명, 권한, 버전코드)
- [x] eas.json 생성
- [x] 개인정보처리방침 + 이용약관 실제 내용
- [x] 테스트 기반 (jest.config + 2개 테스트)
- [ ] 접근성 라벨 — 디자인팀과 함께 진행
- [ ] 앱 서명 키 생성 — EAS Build 시 자동 생성

### 총계: **22/26 항목 완료 (85%)**

---

## 9. 디자인팀 분석 항목 처리 현황 (3/31 업데이트)

### 디자인 시스템 (3/3 완료)
- [x] theme.ts: 시맨틱 컬러 토큰 (light/dark 40+색), 타이포그래피 6레벨, 간격/반경/그림자
- [x] useThemeColors() 훅
- [x] NoteCard, 탭바에 테마 토큰 적용

### 공통 컴포넌트 (3/3 완료)
- [x] Avatar 컴포넌트 (6곳 중복 통합)
- [x] ScreenHeader 컴포넌트 (6곳 패턴 통합)
- [x] SkeletonLoader (NoteCardSkeleton, NoteListSkeleton, DetailSkeleton)

### 브랜드 + 다크모드 (4/4 완료)
- [x] 모든 #000 버튼 → #FF6B6B 코랄 브랜드 컬러 (20+ 파일)
- [x] NoteCard 카드 그림자 + 프레스 애니메이션
- [x] 탭바 브랜드 활성 컬러 + 글쓰기 아이콘 강조
- [x] 커뮤니티 카드 다크모드 border 수정

### UX 폴리시 (3/3 완료)
- [x] 스켈레톤 로딩 (ActivityIndicator → shimmer)
- [x] 햅틱 유틸리티 (haptics.ts)
- [x] NoteCard 접근성 라벨

### 총계: **13/13 항목 완료 (100%)**

---

## 10. PM팀 분석 항목 처리 현황 (3/31 업데이트)

### P0 항목 (10/10 완료)
- [x] Android 패키지명 + EAS 설정 → 개발팀 완료
- [x] 오프라인 모드 연결 → 개발팀 완료
- [x] 링크 삽입 다이얼로그 → ✅ URL 입력 모달 + 링크 제거 구현
- [x] 채팅 중복 폴링 제거 → 개발팀 완료
- [x] 카테고리 선택기 → 개발팀 완료
- [x] 테마 설정 영속화 → ✅ AsyncStorage에 저장/복원
- [ ] 크래시 리포팅 → Sentry 계정 필요 (외부 작업)
- [ ] 앱 아이콘 + 스토어 에셋 → 디자인 외부 작업
- [x] 새 노트 미저장 경고 → ✅ isDirty + 이미지 삽입 시 dirty 마킹
- [x] 휴지통 purge 분리 → 개발팀 완료

### 코드 작업: **8/8 완료 (100%)**
### 외부 작업: **2개 남음** (Sentry 계정, 스토어 에셋)

---

### 남은 디자인 작업 (P2)
- BottomSheet 공통 컴포넌트 (4개 모달 통합)
- 스와이프 제스처 (삭제, 핀)
- 롱프레스 컨텍스트 메뉴
- 온보딩 화면
- 커스텀 폰트 (Pretendard)
- 앱 아이콘 + 스토어 에셋 디자인

---

## 11. 야간 작업 (3/31 23:00 ~ 4/1 00:10)

### 환경 설정
- [x] GitHub에서 프로젝트 clone
- [x] npm install (axios, expo-av, expo-crypto 미사용 의존성 제거)
- [x] .env 설정 (Supabase URL + Anon Key)
- [x] Google OAuth 설정 (Web client ID + Supabase 연동)
- [x] Supabase add-rls.sql 실행 (RLS 정책 + handle_new_user 트리거)
- [x] 기존 유저 ID 마이그레이션 (NextAuth cuid → Supabase Auth UUID 전체 테이블 업데이트)

### 버그 수정
- [x] **AuthContext.tsx** — `profile_image` → `profileImage` (DB는 camelCase, 코드가 snake_case로 잘못됨)
- [x] **CategoryFilter.tsx** — snake_case 직접 쿼리 제거, 기존 `useCategoryList` 훅 사용으로 교체
- [x] **NoteEditor 웹 호환** — TenTap(WebView) 웹 미지원 → 플랫폼 분리 파일 생성
  - `NoteEditor.web.tsx`: contentEditable 기반 웹 에디터
  - `NoteEditor.native.tsx`: 기존 TenTap 에디터
- [x] **NoteToolbar 웹 크래시** — `useBridgeState` 웹 미지원 → 네이티브에서만 lazy require, 웹용 `WebToolbar.tsx` 생성
- [x] **NoteDetailHeader 뒤로가기** — 웹에서 `router.back()` 실패 → `router.canGoBack()` 체크 + fallback to `/`
- [x] **제목 입력 검은 테두리** — 웹 focus outline 제거 (`outlineStyle: 'none'`)
- [x] **검색바 검은 테두리** — 동일하게 outline 제거
- [x] **저장 완료 피드백 없음** — 저장 성공 시 토스트 메시지 추가 ("✓ 저장되었습니다")

### 웹 UI/UX 개선
- [x] **배경색** — `#fff` → `#FFFBF0` (테마 크림색 적용)
- [x] **레이아웃** — 웹에서 max-width 1200px 중앙 정렬, 4열 그리드 지원
- [x] **NoteCard** — 고정 높이 190px, 콘텐츠/푸터 분리, 텍스트 overflow 처리
- [x] **카드 날짜** — `3/28` → `2026.3.28` (년도 포함)
- [x] **카테고리 칩** — View wrapper로 잘림 방지, 테마 컬러 적용
- [x] **검색바** — 돋보기 클릭 시 풀 width 검색바로 전환 + 취소 버튼
- [x] **헤더** — 테마 토큰 전체 적용 (배경, 텍스트, 아이콘 컬러)

### 애니메이션 추가
- [x] **검색바** — 페이드인/아웃 전환 애니메이션
- [x] **NoteCard** — 등장 시 슬라이드업 + 페이드인
- [x] **카테고리 칩** — 프레스 시 스프링 스케일 애니메이션

### 파일 변경 목록

| 파일 | 변경 내용 |
|------|-----------|
| `package.json` | axios, expo-av, expo-crypto 제거 |
| `.env` | Supabase + R2 키 설정 |
| `lib/AuthContext.tsx` | profile_image → profileImage |
| `modules/notes/CategoryFilter.tsx` | snake_case 쿼리 → useCategoryList 훅, 애니메이션 추가 |
| `modules/notes/NoteEditor.web.tsx` | **신규** — 웹용 contentEditable 에디터 |
| `modules/notes/NoteEditor.native.tsx` | **신규** — 네이티브 TenTap 에디터 (기존 코드 분리) |
| `modules/notes/NoteEditor.tsx` | **삭제** — Metro 플랫폼 resolution으로 대체 |
| `modules/notes/WebToolbar.tsx` | **신규** — 웹용 서식 툴바 (B/I/U/S/리스트) |
| `modules/notes/NoteCard.tsx` | 카드 디자인 개선, 등장 애니메이션, 날짜 포맷 |
| `modules/notes/NoteLists.tsx` | max-width 레이아웃, 4열 지원, 테마 적용 |
| `modules/notes/NoteDetailHeader.tsx` | 웹 뒤로가기 수정, Platform import 추가 |
| `modules/common/Header.tsx` | 검색바 리디자인, 애니메이션, 테마 적용 |
| `app/(tabs)/index.tsx` | 배경색 테마 적용 |
| `app/notes/[no].tsx` | 웹 툴바 분기, 저장 토스트, 제목 스타일 개선 |
| `app/notes/write.tsx` | 웹 툴바 분기 |

### 미해결 이슈 (다음 작업)

| # | 이슈 | 우선순위 | 비고 |
|---|------|----------|------|
| 1 | 이미지 업로드 R2 연동 | P0 | Supabase Edge Function 또는 Cloudflare Worker 필요 |
| 2 | 웹 에디터 서식 보존 | P1 | contentEditable 기본 기능만, TipTap 웹 직접 통합 검토 |
| 3 | 웹 전반 반응형 폴리시 | P1 | 모바일 웹 뷰포트 대응 필요 |
| 4 | 알람 모달 DateTimePicker 교체 | P0 | 회의 즉시 착수 항목 |
| 5 | 접근성 라벨 전체 추가 | P0 | 디자인팀 협업 |
| 6 | 크래시 리포팅 (Sentry) | P0 | 계정 필요 |

### Supabase DB 작업 완료
- [x] add-rls.sql 전체 실행 (RLS 정책 + 트리거)
- [x] 기존 유저 ID 마이그레이션: `cmbp7q6lh0000l5045oqogqsy` → `659dbda4-3d98-40be-a9dd-a72197a3c4dc`
  - user, note, category, comment, like, image, report, block, conversation, message, UserSettings, account, session 전체 업데이트
