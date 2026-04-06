# News Card Generator Pro — Workspace

## Overview

Full SaaS platform for generating professional Arabic news card images. pnpm workspace monorepo with TypeScript, React+Vite frontend, Express 5 backend, PostgreSQL+Drizzle ORM, and Playwright/Chromium for pixel-perfect server-side image generation.

## Artifacts

| Artifact | Path | Purpose |
|---|---|---|
| `news-card-generator` | `/` | Client-side Arabic news card tool (original) |
| `news-card-pro` | `/pro/` | Full SaaS dashboard (auth, generate, history, templates, API keys) |
| `api-server` | `/api/` | Express 5 REST API + JWT auth + Playwright image generation |

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec`)
- **Build**: esbuild (ESM bundle, see `artifacts/api-server/build.mjs`)
- **Auth**: JWT (jsonwebtoken + bcryptjs); both `Bearer` JWT and `X-Api-Key` header supported
- **Image generation**: Playwright/Chromium — renders HTML→PNG, pixel-perfect match to frontend preview
- **Frontend**: React + Vite (no TailwindCSS — inline styles)
- **Bot**: Telegraf Telegram bot for card generation via Telegram

## Image Generation Pipeline

- Background image: uploaded via `POST /api/photo/upload` → stored in `artifacts/api-server/uploads/`
- Logo image: also uploaded via `POST /api/photo/upload` immediately on file select → `logoPhotoFilename` sent in generate payload
- Both images loaded as base64 data URLs in `imageGenerator.ts` before Playwright rendering
- Logo rendered as `<img>` tag with position control (top-right/top-left/bottom-right/bottom-left) + optional invert filter
- Background image position controlled by `imgPositionX` / `imgPositionY` (0–100%)
- **Font scaling**: `fontSize` is specified relative to the frontend preview width (480px for 1:1/16:9/4:5, 270px for 9:16). The server scales it to the actual export resolution: `fontSz = Math.round(fontSize * (w / previewW))`
- **Structural scale**: other elements (padding, logo size, etc.) scale from 540px reference: `scale = w / 540`
- Typography overrides (`fontSize`, `fontWeight`, `textShadow`, `customPhotoHeight`, `customBannerColor`, `customTextColor`) all passed from frontend and handled in `generate.ts`
- CRITICAL: Unknown fields must be read from `req.body` (rawBody), NOT from Zod-parsed output (Zod strips them)
- Chromium installed via Nix, resolved at runtime with `which chromium`
- MAX_PAGES=1 (serial rendering — one at a time for stability)
- `playwright-core` and `chromium-bidi` are in esbuild externals list

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

Tables: `users`, `templates`, `generated_images`, `user_saved_designs`

### users
- id, name, email, password_hash, plan (free/pro), api_key (ncg_<uuid>)
- images_today, last_reset_date, created_at
- is_admin (boolean, default false)

### templates
- id, user_id, name, **slug** (optional short identifier for API use)
- background_url, logo_url, overlay_url
- aspect_ratio, banner_color, banner_gradient, text_color, label_color
- font, font_size, font_weight, photo_height
- **subtitle** — stored default subtitle for generated cards
- **label** — stored default label badge text
- **logo_text** — stored logo text overlay
- **logo_pos** (top-right/top-left/bottom-right/bottom-left), **logo_invert**, **text_shadow**
- is_public, created_at, updated_at

### generated_images
- id, user_id, template_id (FK → templates), title, image_url, aspect_ratio, file_size, created_at

### user_saved_designs
- id, user_id, name, settings (jsonb), created_at

## API Endpoints

All at `/api/`:

### Auth
- `POST /auth/register` — register new user (returns JWT + user)
- `POST /auth/login` — login (returns JWT + user)
- `GET /auth/me` — get current user (JWT required), includes apiKey
- `POST /auth/regenerate-key` — regenerate API key (JWT required)

### Templates (JWT required)
- `GET /templates` — list user's templates
- `POST /templates` — create template (all fields including slug, subtitle, label, logoText, etc.)
- `GET /templates/:id` — get single template
- `PUT /templates/:id` — update template (partial, only provided fields updated)
- `DELETE /templates/:id` — delete template

### Generate (JWT or X-Api-Key)
- `POST /generate` — generate news card PNG
  - templateId: built-in string ID OR numeric DB template ID OR slug string
  - title: required
  - All template fields (subtitle, label, font, etc.) override template defaults
  - backgroundImageUrl: download remote image for background
  - Response includes `imageFullUrl` (absolute URL for n8n/webhooks)

### Other
- `GET /stats` — dashboard stats (JWT required)
- `GET /history` — generation history (JWT required)
- `POST /photo/upload` — upload image file (JWT required), returns filename
- `GET /designs` — list saved designs (JWT required)
- `POST /designs` — save/upsert design by name (JWT required)
- `POST /bot/connect` / `GET /bot/status` — Telegram bot management
- `GET /health` — health check (public)

### Admin (JWT required + isAdmin=true)
- `POST /admin/login` — admin login (email/password)
- `GET /admin/stats` — platform-wide stats
- `GET /admin/users` — all users list
- `PATCH /admin/users/:id` — update user plan
- `DELETE /admin/users/:id` — delete user
- `GET /admin/images` — all generated images

## Built-in Template IDs

`classic-blue`, `breaking-red`, `modern-black`, `emerald`, `royal-purple`, `gold`, `midnight`, `slate-fade`, `white-quote`, `purple-wave`, `crimson`, `custom`, `news-social`, `wave-white`, `wave-blue`, `ocean`, `amber`, `rose`, `teal`, `dark-social`, `overlay-only`

## Plans

- **Free**: 10 images/day
- **Pro**: unlimited

## Auth Details

- JWT signed with `SESSION_SECRET` env var
- API key format: `ncg_<uuid-no-dashes>`
- Admin: `isAdmin` column on users; admin panel at `/pro/admin`
- Test account: test@example.com / password123 (isAdmin=true)
- Bot users: email format `tg_{telegramId}@bot.internal`

## Pro Dashboard Pages

- `/pro/login` — JWT login
- `/pro/register` — new account registration  
- `/pro/generate` — main card generator with API templates tab
- `/pro/admin` — admin panel (admin only)

## API Templates Feature

Users can save a full design configuration as a "template" with a numeric ID and optional slug:
- Created from the "قوالي" tab in the dashboard
- Referenced in API by numeric ID or slug: `"templateId": 42` or `"templateId": "my-slug"`
- Stores: font, fontSize, fontWeight, bannerColor, photoHeight, subtitle, label, logoText, logoPos, logoInvert, textShadow, aspectRatio
- Allows n8n automation to send only `title` + `backgroundImageUrl` + `templateId` — all other settings come from the saved template

## Telegram Bot

- Uses Telegraf library
- `TELEGRAM_BOT_TOKEN` secret required
- Users connect their bot via `/pro/generate` → API tab → Telegram section
- Bot generates cards on demand via chat commands

## n8n Integration

Use HTTP Request node with:
- URL: `POST https://your-domain/api/generate`
- Header: `X-Api-Key: ncg_xxx`
- Body: `{"templateId": 5, "title": "{{Title}}", "backgroundImageUrl": "{{image_url}}"}`
- Response field `imageFullUrl` contains the absolute image URL

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
