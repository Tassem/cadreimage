# Workspace

## Overview

Arabic News Card Generator Pro — a full SaaS platform for generating professional Arabic news card images. The project has three artifacts:
- **news-card-generator** (`/`) — free client-side Arabic card generator using html2canvas
- **news-card-pro** (`/pro/`) — full SaaS dashboard with JWT auth and API-powered generation
- **api-server** (`/api/`) — Express 5 REST API with Playwright/Chromium image generation

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Image generation**: Playwright/Chromium (server-side)
- **Auth**: JWT (jsonwebtoken + bcryptjs), token in localStorage as `pro_token`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Architecture

### API Server (`artifacts/api-server/`)
- Routes: `auth.ts`, `templates.ts`, `generate.ts`, `history.ts`, `keys.ts`, `upload.ts`, `designs.ts`
- Auth middleware: JWT + API key auth (`middlewares/auth.ts`)
- Image generator: `lib/imageGenerator.ts` — Playwright/Chromium renders HTML→PNG
- JWT secret: `SESSION_SECRET` env var
- API keys prefixed with `ncg_`
- Uploads stored in `uploads/` dir, served at `/api/uploads/`

### Database Schema (`lib/db/src/schema/`)
- `users` — users with plan, API key, daily counter
- `templates` — card templates per user
- `generated_images` — generation history
- `user_saved_designs` — saved card designs

### Font Scaling (Critical)
- Preview reference width: 480px (1:1, 16:9, 4:5), 270px (9:16 story)
- Server scales: `fontSz = Math.round(fontSize * (w / previewW))`
- Full output sizes: 1080x1080 (1:1), 1920x1080 (16:9), 1080x1920 (9:16), 1080x1350 (4:5)

### Plans and Limits
- `free`: 20 images/day
- `pro`: 500 images/day
- `enterprise`: 9999 images/day

## Demo Credentials
- Admin: `admin@newscard.pro` / `admin123` (enterprise plan)
- Demo: `demo@newscard.pro` / `demo1234` (free plan)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
