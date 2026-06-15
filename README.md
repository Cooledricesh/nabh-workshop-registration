# 낮병원 심포지엄 워크숍 등록 MVP

2026-06-26 낮병원 심포지엄 1회성 MVP 등록 앱입니다.

## 구조

- `/` — 심포지엄 일정표
- `/workshops` — 참가자/워크숍 등록
- `/admin` — 기존 관리 화면(현재 MVP에서는 필수 사용 아님)

## 고정 일정

- 09:30 집결
- 09:40 은하수 합창단
- 09:50 개회
- 10:00–12:00 오전 워크숍 3개 세션 동시 진행
  - Quality Rights(아주대): 10:00–12:00
  - Personal Medicine(대동병원): 10:00–11:30, 이후 자유시간
  - 미술치료의 이해(이음병원): 10:00–11:30, 이후 자유시간
- 12:00–13:00 점심(8층 식당)
- 13:00–14:00 병원 라운딩
- 14:00–15:00 특강 — 대동병원 박상운 병원장
- 15:00–16:30 오후 워크숍 4개 세션 동시 진행
- 16:30–17:00 폐회
- 17:00–17:30 식당 이동(동촌유원지-대돈가)

## 고정 워크숍

- Quality Rights(아주대)
- Personal Medicine(대동병원)
- 미술치료의 이해(이음병원)
- V-cat(대동병원)
- 음악치료의 이해(이음병원)
- 행복한 미술(다움병원)
- 숲길(참사랑병원)

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
