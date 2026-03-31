# CLAUDE.md

## Project Overview

React Native Expo 기반 노트 앱 "Notie". 기존 Next.js note-app을 RN Expo로 전환.
웹 + Android + iOS 지원 (Expo Router + react-native-web).

## Tech Stack

- **Framework**: React Native + Expo SDK 54, Expo Router v6
- **Language**: TypeScript
- **State**: Zustand (client), TanStack Query v5 (server)
- **Backend**: Supabase (Auth, Database, Storage, Realtime) — 서버 없이 직접 연동
- **Editor**: TenTap (@10play/tentap-editor) — TipTap 기반 RN 에디터
- **Offline**: expo-sqlite + 동기화 엔진 (네이티브만, 웹은 Supabase 직접)
- **Network**: @react-native-community/netinfo

## Commands

```bash
npm start          # Expo dev server
npm run android    # Android
npm run ios        # iOS
npm run web        # Web
```

## Architecture

### Routing (Expo Router - file-based)
- `app/(tabs)/` — Bottom tabs: 홈, 커뮤니티, 글쓰기, 채팅, 더보기
- `app/notes/[no].tsx` — 노트 상세/편집
- `app/notes/write.tsx` — 새 노트 작성
- `app/chat/[convNo].tsx` — 채팅방 (Supabase Realtime)
- `app/user/[id].tsx` — 유저 프로필 (차단/신고)
- `app/calendar.tsx` — 캘린더 (월별 알람)
- `app/category.tsx` — 카테고리 관리 (정렬)
- `app/profile.tsx` — 내 프로필 (아바타/닉네임/소개/저장공간)
- `app/settings.tsx` — 설정 (테마/약관/계정삭제)
- `app/plan.tsx` — 플랜 선택
- `app/trash.tsx` — 휴지통 (복원/영구삭제)

### Code Organization
- `app/` — Routes (Expo Router)
- `modules/` — Feature-level components
- `hooks/` — React Query hooks per feature
- `store/` — Zustand stores (5개: Category, Color, From, NoteForm, Search)
- `lib/services/` — Supabase data access layer (note, category, calendar, chat, comment, image, user)
- `lib/offline/` — SQLite + 동기화 엔진 (platform split: .native.ts / .web.ts)
- `lib/` — Supabase client, QueryClient, AuthContext
- `components/` — AuthGuard, OfflineBanner, Providers
- `types/` — TypeScript type definitions
- `supabase/schema.sql` — DB 전체 스키마 + RLS + 트리거

### Platform Split Files
- `database.native.ts` / `database.web.ts` — SQLite (네이티브만)
- `syncEngine.native.ts` / `syncEngine.web.ts` — 동기화 (네이티브만)

### Database (Supabase PostgreSQL + RLS)
Key tables: user, note, category, like, comment, image, conversation, message, block, report
- Soft deletes: Notes use `del_datetime` field
- 30-day auto purge on trash access
- RLS policies enforce per-user access
- `handle_new_user` trigger auto-creates user profile on auth signup

### Auth
- Supabase Auth + Google OAuth
- AuthGuard component for protected routes (9개)
- AuthContext provides session, user, profile, signInWithGoogle, signOut

### Original Project
Source: /c/Users/Administrator/note-app (Next.js version for reference)
