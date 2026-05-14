# DataTeach

DataTeach is a responsive React + TypeScript + TailwindCSS app for teachers to track curriculum progress by class.

## Features

- Hierarchical curriculum topics with unlimited nesting
- Topic management: add, rename, reorder, and archive (hide)
- Class management: create, rename, archive
- Per class/topic progress tracking:
  - taught / not taught
  - notes
  - optional teaching date
- Optimistic UI updates for fast interactions
- Dark mode support
- Supabase auth + PostgreSQL storage with RLS
- Seed/demo data and local demo mode fallback

## Tech Stack

- Frontend: React, TypeScript, TailwindCSS, Vite
- Data/Auth: Supabase
- Database: PostgreSQL (Supabase)
- DX: ESLint, Prettier, Vitest, Docker, GitHub Actions

## Project Structure

- `src/components` UI components (`TopicTree`, `ClassSelector`, `ProgressPanel`)
- `src/hooks` reusable state hooks
- `src/services` REST-style service layer (`list/create/update/upsert`)
- `src/lib/supabase.ts` Supabase client setup
- `supabase/migrations` SQL schema + RLS policies
- `supabase/seed.sql` demo data
- `.github/workflows/ci.yml` lint/test/build CI

## Environment Setup

Copy `.env.example` to `.env` and fill values:

```bash
cp .env.example .env
```

Required values:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Without env values, the app runs in **demo mode** with in-memory data.

## Run Locally

```bash
npm install
npm run dev
```

## Lint, Test, Build

```bash
npm run lint
npm run test -- --run
npm run build
```

## Supabase SQL Setup

Apply migration SQL from:

- `supabase/migrations/202605140001_init.sql`

Then apply seed data:

- `supabase/seed.sql`

## Docker

Build and run:

```bash
docker compose up --build
```

App is served at `http://localhost:4173`.

## Deployment Notes

- Any static hosting or container platform can serve the built `dist` output.
- Ensure environment variables are set in deployment.
- RLS policies enforce per-user data isolation for topics, classes, and progress rows.

## Extensibility

The schema and service layer are designed to be extended with:

- attendance
- grading
- file attachments
- curriculum templates
