# 🐻 밋단 (MeetDan)

> **단국대생을 위한 3:3 과팅/미팅 매칭 서비스**
> "우리 과랑 미팅할 사람?" 이제 에타 말고 밋단에서 찾자!

프론트엔드(React Native / Expo)와 백엔드(Supabase)를 함께 관리하는 모노레포입니다.

## 폴더 구조

```
meetdan-project/
├── frontend/   React Native (Expo) 앱 — 자세한 내용은 frontend/README.md
└── backend/    Supabase 프로젝트 (DB 스키마, RLS, Edge Functions)
```

## 기술 스택

### Frontend (`frontend/`)
- **Framework:** React Native (Expo SDK 54)
- **Language:** TypeScript
- **Navigation:** Expo Router (File-based routing)
- **State:** Zustand

### Backend (`backend/`)
- **Platform:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Edge Functions (Deno):** `delete-account`, `filter-message`, `resolve-login`, `send-push`, `verify-email`
- **DB 스키마 / 마이그레이션:** `backend/sql/`

## 시작 가이드

> ⚠️ `frontend`와 `backend`는 완전히 독립된 npm 프로젝트입니다. **루트에서 `npm install`을 실행하지 마세요** — React Native/Expo의 Metro 번들러는 단일 `node_modules` 트리를 전제로 하는데, 루트에서 설치하면 npm workspace hoisting처럼 의존성이 흩어져 버전이 꼬이고 번들링이 깨집니다. 항상 각 폴더 안에서 설치·실행하세요.

### 1. Frontend 실행
```bash
cd frontend
npm install
cp .env.example .env   # Supabase URL / anon key 채우기
npm start
```

### 2. Backend (Supabase) 작업
```bash
cd backend
npm install
supabase start                 # 로컬 스택 실행 (Docker 필요)
supabase functions serve       # Edge Functions 로컬 서빙
```

각 영역의 세부 사항은 `frontend/README.md`를 참고하세요.
