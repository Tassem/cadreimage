# 🗞️ News Card Generator Pro

منصة SaaS متكاملة لتوليد بطاقات الأخبار العربية بجودة احترافية — تجمع بين واجهة ويب تفاعلية، خادم API قوي، وبوت تيليغرام ذكي.

> **Full-stack Arabic news card SaaS** with server-side Playwright/Chromium image generation, JWT auth, multi-plan system, Telegram bot, and a free-position canvas editor.

---

## 🧠 Overview

News Card Generator Pro allows Arabic media outlets and journalists to instantly create professional news cards — branded image posts for social media — directly in the browser or via Telegram. It supports custom templates, logos, overlays, watermarks, and a free-position canvas layout system. Generated images are server-rendered at 1080px resolution using headless Chromium.

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend (Free Tool) | React 18 + Vite + TypeScript |
| Frontend (Pro Dashboard) | React 18 + Vite + Wouter (SPA routing) |
| Backend API | Express 5 + TypeScript |
| Image Generation | Playwright / Chromium (headless) |
| Database | PostgreSQL + Drizzle ORM |
| Auth | JWT (jsonwebtoken) + bcrypt |
| File Storage | Local filesystem (`uploads/`) |
| Monorepo | pnpm workspaces |
| Telegram Bot | Telegraf.js v4 |
| Validation | Zod |

---

## 🏗️ Architecture

```
workspace/
├── artifacts/
│   ├── news-card-generator/     # Free public tool (React+Vite) → served at /
│   ├── news-card-pro/           # Pro dashboard (React+Vite)    → served at /pro/
│   └── api-server/              # Express 5 REST API            → served at /api/
│       ├── src/routes/          # Auth, templates, designs, generate, uploads, users
│       ├── src/lib/
│       │   └── imageGenerator.ts  # Core: HTML → Playwright → PNG
│       ├── src/bot.ts           # Telegraf bot
│       ├── src/middlewares/     # JWT auth, plan guards
│       └── uploads/             # Persistent generated images
└── lib/
    ├── db/                      # Drizzle ORM schema (PostgreSQL)
    └── api-zod/                 # Zod schemas for API request validation
```

### Services

| Path | Service | Description |
|------|---------|-------------|
| `/` | news-card-generator | Free tool: basic card generation, no login |
| `/pro/` | news-card-pro | SaaS dashboard: full feature set, JWT auth |
| `/api/` | api-server | REST API: all backend logic, image gen, auth |

---

## 🔄 Data Flow

### Card Generation (Pro Dashboard)

```
User fills form
  → POST /api/generate (with text + server filenames for bg/logo/overlay)
  → API downloads files from uploads/
  → buildHtml() constructs self-contained HTML page
      - Cairo font embedded as base64
      - Images embedded as base64 data URLs
      - Dual layout modes: Classic (banner) or Canvas (absolute positions)
  → Playwright headless Chromium renders HTML at 1080×1080px (or other ratio)
  → screenshot() captures full-page PNG
  → File saved to uploads/ with UUID filename
  → { url: "/api/uploads/<uuid>.png" } returned to client
  → Client displays generated image for download
```

### Telegram Bot Flow

```
User sends text message in bot chat
  → bot.ts parses headline / subtitle / label
  → Loads user's saved API template from DB
  → Downloads bg/logo/overlay from server (relative → absolute URL conversion)
  → Calls generateCard() → PNG saved
  → Sends image file back to Telegram chat
```

### Template Save / Load

```
Save:
  User clicks "حفظ القالب"
  → POST /api/templates with all settings
  → canvasLayout object → JSON.stringify() → stored as TEXT in DB

Load:
  GET /api/templates
  → parseTemplate() helper parses canvasLayout TEXT → JavaScript object
  → Returned to frontend as proper object (never as raw string)

Edit:
  User clicks "تعديل" on saved template
  → handleEditApiTemplate(t) applies ALL template fields to UI state
  → fontSize, font, bannerColor, canvasLayout, overlayUrl, logoPos, etc.
```

---

## 🚀 Features

### Free Tool (`/`)
- Generate news cards instantly without login
- 20+ built-in color themes
- Custom headline, subtitle, label
- Logo upload (image or text)
- Background image upload
- Multiple aspect ratios: 1:1 / 4:5 / 16:9 / 9:16
- Download as high-res PNG

### Pro Dashboard (`/pro/`)
- **JWT authentication** (login / register)
- **Saved API Templates** — persist ALL settings: fonts, colors, canvas layout, logo, overlay
- **Canvas Mode** — free-drag positioning of headline, subtitle, label, logo via % coordinates
- **Full Background Mode** — photo covers 100% of card, text overlaid via canvas elements
- **Overlay / Frame PNG** — transparent PNG overlaid on top of the entire card (brand frames)
- **Watermark** — diagonal text watermark with adjustable opacity
- **Saved Designs** — save design snapshots with preview URLs
- **Telegram Bot** — connect bot token + chat ID, auto-send generated cards
- **Plan system** — Free (3 templates), Pro (unlimited), Admin
- **Admin Panel** — manage users, update plans, view template usage

### API Server (`/api/`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | No | Returns JWT token |
| POST | `/auth/register` | No | Create account |
| GET | `/auth/me` | Yes | Current user info |
| GET | `/templates` | Yes | List user's saved templates |
| POST | `/templates` | Yes | Create template |
| PUT | `/templates/:id` | Yes | Update template |
| DELETE | `/templates/:id` | Yes | Delete template |
| POST | `/generate` | Yes | Generate card image (Playwright) |
| POST | `/uploads` | Yes | Upload file (bg/logo/overlay) |
| GET | `/uploads/:file` | No | Serve uploaded file |
| GET | `/designs` | Yes | List saved designs |
| POST | `/designs` | Yes | Save design |
| DELETE | `/designs/:id` | Yes | Delete design |
| GET | `/users` | Admin | List all users |
| PUT | `/users/:id/plan` | Admin | Update user plan |

---

## 📦 Installation

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL database
- Chromium (auto-installed by Playwright, or system Chromium)

### 1. Clone

```bash
git clone https://github.com/Tassem/news-card-generator-pro.git
cd news-card-generator-pro
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment variables

```bash
cp .env.example .env
# Edit .env with your values
```

### 4. Database setup

```bash
pnpm --filter @workspace/db run db:push
```

### 5. Start services

```bash
# API Server (port 8080 by default)
pnpm --filter @workspace/api-server run dev

# Pro Dashboard
pnpm --filter @workspace/news-card-pro run dev

# Free Tool
pnpm --filter @workspace/news-card-generator run dev
```

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `SESSION_SECRET` | JWT signing secret (min 32 chars) | ✅ |
| `PORT` | API server port (default: 8080) | ❌ |

---

## 📁 Project Structure

```
artifacts/
  api-server/
    src/
      routes/
        auth.ts          # Login, register, /me
        templates.ts     # CRUD + parseTemplate() for canvasLayout
        designs.ts       # Saved design snapshots
        generate.ts      # Image generation endpoint
        uploads.ts       # File upload (Multer)
        users.ts         # Admin user management
      middlewares/
        auth.ts          # JWT verification middleware
        planGuard.ts     # Plan-based feature limits
      lib/
        imageGenerator.ts  # Core renderer: buildHtml() + generateCard()
      bot.ts             # Telegraf bot (per-user bot tokens)
      fonts/cairo.ttf    # Embedded Arabic font (base64 in generation)
    uploads/             # Generated PNGs (UUID filenames)

  news-card-pro/
    src/
      pages/
        Generate.tsx     # Main card editor (~1900 lines)
        Login.tsx        # JWT auth
        Register.tsx
        AdminPanel.tsx   # Admin user management
        SavedDesigns.tsx # Design history
      App.tsx            # Wouter routing (base: /pro/)

  news-card-generator/
    src/
      App.tsx            # Free tool (simpler, no auth)

lib/
  db/
    src/
      schema/
        users.ts         # users table
        templates.ts     # templates table (canvasLayout as TEXT)
        designs.ts       # user_saved_designs table
      index.ts           # Drizzle client
  api-zod/
    src/generated/api.ts # Zod schemas for all API bodies
```

---

## 📊 How It Works

### Image Generator (`imageGenerator.ts`)

**`buildHtml(opts, w, h)`** constructs a complete self-contained HTML page:
- Cairo font embedded as base64 `@font-face`
- Background/logo/overlay images embedded as base64 data URLs
- **Classic layout**: `.photo` div (top, `photoH`%) + `.banner` div (bottom, `bannerH`%) with text inside
- **Canvas layout**: All elements positioned absolutely using `%` coordinates (z-index 11)
- **Full Background**: `photoHeight = 100` → photo fills card, banner collapses to 0 height

**`generateCard(options)`** renders with Playwright:
- Persistent shared browser instance (one Chromium process, auto-restarts on crash)
- Mutex-based page pool (max 1 concurrent render)
- Full-page screenshot at exact card dimensions
- Saved as UUID-named PNG to `uploads/`

### Canvas Layout System

Elements positioned using percentage-based coordinates:
```typescript
{
  headline: { x: 4,  y: 63, w: 92 },  // % of card dimensions
  subtitle: { x: 4,  y: 79, w: 92 },
  label:    { x: 4,  y: 88, w: 42 },
  logo:     { x: 74, y: 3,  w: 22 },
}
```

In the HTML generator: `left: ${x/100 * cardWidth}px; top: ${y/100 * cardHeight}px; width: ${w/100 * cardWidth}px`

### Template Serialization

`canvasLayout` is stored as JSON **string** in PostgreSQL (TEXT column), because Drizzle ORM doesn't auto-parse JSON fields. The `parseTemplate()` helper in `routes/templates.ts` converts it back to an object on every GET response.

---

## 🤖 AI-Understandable Section

### Critical State Variables (Generate.tsx)

```typescript
// Server filenames (returned from POST /api/uploads)
bgServerFilename    // background image on server
logoServerFilename  // logo image on server
overlayServerFilename // overlay PNG on server

// These are used in POST /api/generate, NOT the local blob URLs
```

### localStorage Schema

```json
{
  "ncg-pro-settings": {
    "selectedTemplateId": "classic-blue",
    "aspectRatio": "1:1",
    "font": "Cairo",
    "fontSize": 26,
    "fontWeight": 700,
    "canvasMode": false,
    "canvasLayout": { "headline": {...}, "subtitle": {...} },
    "customPhotoHeight": 62,
    "...": "all other UI settings"
  }
}
```

### Bug History (solved)

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| canvasLayout ignored on edit | Returned as JSON string from API | Added `parseTemplate()` in templates.ts |
| Overlay lost on template edit | `setOverlayImage(null)` instead of template URL | `setOverlayImage(t.overlayUrl)` |
| Settings reset on page reload | canvasMode/canvasLayout not in localStorage | Added to auto-persist useEffect |
| "تعديل" only restored 2 fields | Handler didn't apply fontSize, font, etc. | Rebuilt `handleEditApiTemplate()` |

---

## 🔮 Future Improvements

- [ ] Stripe payment integration for Pro plans
- [ ] Multiple Arabic font choices
- [ ] Team workspaces (shared templates)
- [ ] Scheduled Telegram posting
- [ ] AI headline generation (OpenAI)
- [ ] CSV batch generation
- [ ] CDN for uploaded images (S3/Cloudflare R2)
- [ ] Mobile app (React Native / Expo)

---

## 🧪 Development Accounts

| Email | Password | Plan |
|-------|----------|------|
| `admin@newscard.pro` | `Admin@123` | Admin + Pro |
| `demo@newscard.pro` | `Demo@123` | Free |

---

## 📄 License

MIT
