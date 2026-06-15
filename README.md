# 낮병원 심포지엄 워크숍 등록 MVP

2026-06-26 낮병원 심포지엄 1회성 MVP 등록 앱입니다.

## 구조

- `/` — 심포지엄 일정표
- `/workshops` — 참가자/워크숍 등록
- `/admin` — 기존 관리 화면(현재 MVP에서는 필수 사용 아님)

## 고정 일정

- 09:30–09:40 개회
- 09:40–10:00 병원 합창
- 10:00–12:00 워크숍 세션 — 3개 워크숍 동시 진행
- 12:00–13:00 마무리 및 네트워킹

## 고정 워크숍

- 회복지향 낮병원 운영 워크숍
- 가족·지역사회 연계 워크숍
- 위기대응 및 사례관리 워크숍

기본 정원은 워크숍별 30명입니다. 변경하려면 `schema.sql`의 seed capacity 값을 수정한 뒤 Supabase SQL Editor에서 다시 실행하면 됩니다.

## Supabase 설정

Supabase SQL Editor에서 `schema.sql`을 실행하세요.

Vercel 환경변수:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://srdslbfsnwjhwgrxsare.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_3yHaX0WzdgeaRDBHw3oj8g_eF-TezHk
```

## 로컬 실행

```bash
npm install
cp .env.example .env.local
npm run dev
```

## 검증

```bash
npm test
./node_modules/.bin/eslint . --format stylish
npm run build
```

## Vercel 배포

1. Vercel Dashboard → Add New Project
2. GitHub repo `Cooledricesh/nabh-workshop-registration` import
3. Framework Preset: Next.js
4. Environment Variables에 위 Supabase 값 2개 추가
5. Deploy

GitHub integration이 연결되면 이후 `main`에 push할 때 자동 배포됩니다.
