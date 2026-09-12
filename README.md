# Vertex

An AI-powered learning platform with intelligent, timestamped video search. See `AGENTS.md` for the full product and architecture spec.

## Workspaces

This repo has two standalone workspaces, each with its own `package.json`:

- `studio/` — Sanity Studio (content model and authoring). Runs on Vite, independent of the Next.js app.
- `web/` — the Next.js app (App Router), Clerk auth, and all server-side integration.

They are intentionally not merged: the Studio gets its own fast dev/build, auto-updates, and TypeGen watch mode, and stays deployable independently of the app.

## Getting started

```bash
cd studio && npm install && cp .env.example .env.local   # fill in SANITY_STUDIO_PROJECT_ID / DATASET
cd web && npm install && cp .env.example .env.local       # fill in Clerk keys, Sanity project/dataset, SANITY_API_READ_TOKEN
```

Run both dev servers side by side (from the repo root, or `npm run dev` inside each workspace):

```bash
npm run dev:studio   # http://localhost:3333
npm run dev:web      # http://localhost:3000
```

First-time Studio setup (from `studio/`):

```bash
npx sanity login
npx sanity deploy                                   # required before the Context MCP can serve this dataset
npx sanity cors add http://localhost:3000 --credentials
```

Generating types for the web app from the Studio's schema + queries (from `studio/`):

```bash
npm run typegen   # writes ../web/sanity.types.ts
```

## Deploy

- `web/` deploys as a standard Next.js app (e.g. Vercel).
- `studio/` deploys independently via `npx sanity deploy` from within `studio/`.
