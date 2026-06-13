# NABH Workshop Registration

Disposable registration app for the 2026-06-26 나병원 심포지엄 workshop sessions.

## Stack

- Next.js App Router + TypeScript
- Supabase/Postgres
- Vercel
- Vitest for local business-rule tests

## Features

- Public form supports one or more participants per submission.
- Each participant has name, affiliation, position.
- Each participant can select no workshop, one morning workshop, one afternoon workshop, or one of each.
- Full/closed workshops render as `마감` and are disabled.
- Batch validation is atomic: if one selected workshop lacks remaining seats for the whole submitted batch, the entire batch is rejected.
- Admin page supports password login, workshop create/edit/delete, open/closed state, capacity, and registration list.
- CSV export intentionally omitted.

## Local setup

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_PASSWORD=54321
ADMIN_SESSION_SECRET=<random string>
```

`ADMIN_PASSWORD` defaults to `54321` if unset. For Vercel, set it explicitly in project environment variables.

## Supabase setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Paste and run `schema.sql`.
4. Copy Project URL, anon key, and service role key into local/Vercel env vars.

The SQL creates:

- `workshops`
- `registrations`
- `registration_workshops`
- `workshops_with_counts` view
- `register_participants_batch(jsonb)` Postgres RPC

The RPC locks selected workshops with `FOR UPDATE`, validates slot duplicates, open/full state, and capacity demand before inserting registrations. Any failure raises before insert, so the batch is rolled back by Postgres.

## Development

```bash
npm run dev
```

Open:

- Public form: http://localhost:3000
- Admin: http://localhost:3000/admin

## Verification

```bash
npm test
npm run lint
npm run build
```

## Vercel deployment

1. Push this directory to a Git repository.
2. Import the repository in Vercel.
3. Set environment variables from `.env.example`.
4. Deploy.
5. Apply `schema.sql` in Supabase before public use.

## Notes

- The app is disposable and optimized for this one event.
- Admin auth is a simple signed HTTP-only cookie. Use a non-default `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` if the URL is public.
- Supabase service role key must remain server-side only. Do not expose it as `NEXT_PUBLIC_*`.
