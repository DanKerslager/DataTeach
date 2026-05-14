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

Docker build uses these args from your environment (for Vite build-time injection):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## GitHub Secrets (Supabase)

Set repository secrets in GitHub:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Location: **GitHub repo -> Settings -> Secrets and variables -> Actions -> New repository secret**.

The CI workflow (`.github/workflows/ci.yml`) reads both values from GitHub Secrets and exposes them during `npm run build`.

## Deployment Notes

- Any static hosting or container platform can serve the built `dist` output.
- Ensure environment variables are set in deployment.
- RLS policies enforce per-user data isolation for topics, classes, and progress rows.

## Free Deployment Options

- Netlify (free tier): Great for this app as a **static deploy** (build command `npm run build`, publish directory `dist`).
- Vercel (free tier): Also good for static Vite apps.
- Cloudflare Pages (free tier): Static hosting with generous limits.
- GitHub Pages (free): Works for static build output.
- Render / Railway / Fly.io: Better choice only if you need to run the container itself.

## GitHub Pages Setup

This repo includes a Pages workflow at `.github/workflows/deploy-pages.yml`.

One-time GitHub setup:

1. Push to your `main` branch.
2. In GitHub: **Settings -> Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. In **Settings -> Secrets and variables -> Actions**, add:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
5. Re-run the workflow (or push a new commit).

The workflow sets `VITE_BASE_PATH` automatically to `/<repo-name>/` so Vite assets load correctly on Pages project URLs.
It also sets `VITE_SITE_URL` so Supabase magic links redirect back to the deployed Pages URL instead of localhost.

In Supabase, add the deployed Pages URL to your allowed redirect URLs:

- **Authentication -> URL Configuration -> Redirect URLs**
- Add `https://<your-github-username>.github.io/<repo-name>/`

For local development, localhost redirecting is normal and expected.

Can Netlify handle a container?

- Not as a general long-running Docker container host.
- Netlify can run build steps and serverless/edge functions, but it does not host your custom container runtime like Render/Fly.io/Railway.

## Where To Find Supabase Values

In your Supabase project dashboard:

- `VITE_SUPABASE_URL`:
  - **Settings -> API -> Project URL**
- `VITE_SUPABASE_ANON_KEY`:
  - **Settings -> API -> Project API keys -> anon public**

Use the **anon public** key only in frontend apps. Do not expose the service role key.
Use the **Project URL** value exactly (for example `https://<project-ref>.supabase.co`), not the REST endpoint (`.../rest/v1`).

## Extensibility

The schema and service layer are designed to be extended with:

- attendance
- grading
- file attachments
- curriculum templates
